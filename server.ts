import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS } from './src/data/products';
import { STORE_POLICIES, answerCustomerQuery } from './src/services/knowledgeEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Catalog summary for Gemini system instruction
const catalogKnowledge = PRODUCTS.map((p) => ({
  id: p.id,
  sku: p.sku,
  title: p.title,
  category: p.category,
  price: p.price,
  originalPrice: p.originalPrice,
  discountPercent: p.discountPercent,
  fabric: p.fabricCare[0],
  care: p.fabricCare.slice(1).join(', '),
  fit: p.fit,
  colors: p.colors.map((c) => c.name).join(', '),
  sizes: p.sizes.join(', '),
  stock: p.stockQuantity,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  sampleReviews: p.reviews?.map((r) => `${r.author} (${r.rating}★): "${r.comment}"`).join(' | ') || 'No reviews yet',
}));

// Gemini AI Chat Proxy Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, currentProductId, currentCart, orderRef } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isRealApiKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.includes('MY_GEMINI') && apiKey.length > 15;

    // If real API key is available, call Gemini 3.8 Flash with grounded context
    if (isRealApiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = `You are "URBN Concierge", the official AI shopping assistant and customer care expert for URBN·MEN (Pakistan's contemporary men's streetwear brand, directed and founded by Syed Umer Abdullah).
Strict rules:
1. Grounding: You must ONLY answer using the real product catalog and store policies provided below. NEVER invent products, prices, discounts, stock, reviews, or delivery guarantees.
2. Fabric & Specifications: Only state fabric details that are explicitly specified (e.g. 280 GSM combed cotton for boxy tees, 420 GSM French Terry for pullover hoodies, 14.5 oz unwashed denim for jackets, ripstop for cargos). If a spec or stretch is not listed, say it is not specified.
3. Currency: Always format prices in Pakistani Rupees (PKR e.g., "PKR 2,490").
4. Brand Founder, Leadership & Support:
   - Founder & Brand Director: Syed Umer Abdullah. If asked about the owner, founder, creator, or who runs the brand, introduce Syed Umer Abdullah and share his direct WhatsApp contact.
   - WhatsApp Hotline: +92 311 1398618 (0311-1398618) - Mon-Sat 10am-10pm PKT.
5. Policies:
   - Free shipping on orders >= PKR 3,000. Orders below PKR 3,000 have flat PKR 250 shipping fee.
   - Delivery: 2-3 working days for major metros (Karachi, Lahore, Islamabad, Rawalpindi); 3-5 working days for other cities across Pakistan via TCS/Leopards/Call Courier.
   - Payment: Cash on Delivery (COD) nationwide across 200+ cities. Parcel cannot be opened prior to payment handover to courier rider.
   - Exchanges: 14-day exchange policy for unworn items with tags. Available via courier or in-store at flagship outlets in Lahore (Packages Mall & MM Alam), Karachi (Dolmen Clifton & Lucky One), and Islamabad (Centaurus & Safa Gold).
   - LocalStorage Orders: Orders placed in this browser are stored locally in the customer's device. For active courier dispatch tracking, customers must contact Syed Umer Abdullah via WhatsApp with their order reference (e.g. ORD-XXXXXXXX).
6. Output Format: You MUST return a valid JSON object matching:
{
  "responseText": "Markdown formatted helpful, friendly response",
  "productIds": ["prod-01", ...], // list of valid matching product IDs from catalog, or empty array
  "suggestedActions": ["Short action 1", "Short action 2", "Short action 3"],
  "isCustomerCareHandoff": false, // set true if customer needs human help or has an issue that requires WhatsApp
  "customerCareQuery": "optional pre-filled query for WhatsApp"
}

STORE POLICIES:
${JSON.stringify(STORE_POLICIES, null, 2)}

PRODUCT CATALOG:
${JSON.stringify(catalogKnowledge, null, 2)}

CURRENT SHOPPING CONTEXT:
- Active Product ID: ${currentProductId || 'None'}
- Current Cart: ${JSON.stringify(currentCart || [])}
- Target Order Reference: ${orderRef || 'None'}`;

        const promptText = `Customer message: "${message}"\nShopping context: Product ${currentProductId || 'none'}, Cart count: ${currentCart?.length || 0}`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout after 4.5s')), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const rawJson = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawJson);

        // Hydrate product IDs into full product objects
        const hydratedProducts = Array.isArray(parsed.productIds)
          ? PRODUCTS.filter((p) => parsed.productIds.includes(p.id))
          : [];

        res.json({
          text: parsed.responseText || 'How can I assist you with URBN menswear today?',
          products: hydratedProducts,
          suggestedActions: parsed.suggestedActions || ['View Oversized Tees', 'Pullover Hoodies', 'Delivery Timelines'],
          customerCareDraft: parsed.isCustomerCareHandoff
            ? { query: parsed.customerCareQuery || message }
            : undefined,
        });
        return;
      } catch (geminiError) {
        console.warn('[Gemini API Fallback] Error contacting Gemini, falling back to Knowledge Engine:', geminiError);
        // Fallback to Knowledge Engine
      }
    }

    // High-speed deterministic fallback via Knowledge Engine
    const localAnswer = answerCustomerQuery(message, {
      currentProductId,
      currentCart,
    });

    res.json(localAnswer);
  } catch (err: any) {
    console.error('[API /api/chat Error]', err);
    res.status(500).json({
      text: 'Our AI concierge is temporarily experiencing high demand. You can browse our collections or reach out directly to Syed Umer Abdullah on WhatsApp (+92 311 1398618).',
      suggestedActions: ['Delivery Timelines', '14-Day Exchange Policy', 'WhatsApp Customer Care'],
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[URBN MEN] Server running at http://localhost:${port}`);
  });
}

startServer();
