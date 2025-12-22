# HTTPS Setup for Live Razorpay Payments

## Option 1: Using ngrok (Recommended for Testing)

### Why ngrok?
- ✅ Instant HTTPS without certificates
- ✅ Public URL for Razorpay webhooks  
- ✅ Works with live Razorpay keys
- ✅ No SSL configuration needed

### Setup Steps:

1. **Install ngrok:**
   ```powershell
   # Using Chocolatey
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Sign up and get auth token:**
   - Visit: https://dashboard.ngrok.com/signup
   - Copy your authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

3. **Start your backend:**
   ```powershell
   cd D:\LMS2\LMS\backend
   npm run dev
   ```
   (Backend runs on http://localhost:8000)

4. **Start ngrok tunnel:**
   ```powershell
   ngrok http 8000
   ```
   
   You'll get an HTTPS URL like: `https://abc123.ngrok.io`

5. **Configure Razorpay Webhook:**
   - Go to: https://dashboard.razorpay.com/app/webhooks
   - Click "Create New Webhook"
   - Enter URL: `https://YOUR_NGROK_URL/api/payment/webhook`
   - Select events: `payment.authorized` and `payment.captured`
   - Copy the webhook secret
   - Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_secret_here`

6. **Test Payment:**
   - Frontend still runs on http://localhost:5173
   - Makes API calls through Vite proxy → localhost:8000
   - Razorpay sends webhooks → ngrok HTTPS URL → localhost:8000
   - ✅ Everything works!

---

## Option 2: Deploy to Cloud (Production)

### Platforms with Built-in HTTPS:

**Render.com (Free tier)**
```powershell
# 1. Push code to GitHub
# 2. Connect Render to your repo
# 3. Auto-deploys with HTTPS
# URL: https://yourapp.onrender.com
```

**Railway.app**
```powershell
railway login
railway init
railway up
# Auto HTTPS URL provided
```

**Heroku**
```powershell
heroku create yourapp
git push heroku main
# URL: https://yourapp.herokuapp.com
```

### After Deployment:
1. Set environment variables in platform dashboard
2. Update Razorpay webhook to your live URL
3. Update frontend CORS in `backend/index.js`
4. Deploy frontend to Vercel/Netlify

---

## Current Setup

### ✅ Your backend is ready for both:
- **Local dev:** HTTP on localhost:8000
- **ngrok tunneling:** HTTPS via ngrok
- **Production:** Deploy to any cloud platform

### To enable SSL certificates (not needed with ngrok):
Uncomment in `.env`:
```
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
```

Then generate certificates (requires OpenSSL):
```powershell
cd D:\LMS2\LMS\backend\ssl
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
```

---

## Recommended Flow for Testing Live Payments:

1. Use **HTTP locally** for development ✅ (current setup)
2. Use **ngrok** when testing live Razorpay payments ✅
3. Deploy to **Render/Railway** for production ✅

**You don't need local HTTPS certificates - ngrok handles everything!**
