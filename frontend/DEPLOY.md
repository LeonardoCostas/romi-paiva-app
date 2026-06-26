# Deploy frontend

## Variables

Configurar en Vercel, Netlify o el hosting elegido:

```env
VITE_API_BASE_URL=https://tu-api.com/api
```

## Build

```bash
npm install
npm run build
```

El sitio queda en `dist/`.

## Vercel

El proyecto ya incluye `vercel.json` para que las rutas de React funcionen al refrescar la pagina.
