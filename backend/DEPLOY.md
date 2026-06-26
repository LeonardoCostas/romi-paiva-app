# Deploy API

## Variables obligatorias

Configurar estas variables en el panel del hosting:

```env
ConnectionStrings__DefaultConnection=Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true
Jwt__Issuer=Peluqueria.Api
Jwt__Audience=Peluqueria.Client
Jwt__SecretKey=un-secreto-largo-y-unico
Jwt__ExpirationMinutes=120
GoogleAuth__ClientId=tu-google-client-id
AllowedOrigins__0=https://tu-frontend.com
```

## WhatsApp

Para activar mensajes automaticos al crear un turno:

```env
Notifications__WhatsApp__Enabled=true
Notifications__WhatsApp__PhoneNumberId=phone-number-id-de-meta
Notifications__WhatsApp__AccessToken=token-de-meta
Notifications__WhatsApp__ApiVersion=v20.0
Notifications__WhatsApp__ReservationCreatedTemplateName=turno_solicitado
Notifications__WhatsApp__LanguageCode=es_AR
```

Para mensajes iniciados por el negocio, WhatsApp suele requerir una plantilla aprobada. La plantilla `turno_solicitado` deberia tener 5 variables en este orden: nombre, fecha, hora inicio, hora fin, servicio.

Si `Enabled=false`, la API no envia WhatsApp y solo escribe el mensaje en logs.

## Docker

La API escucha en el puerto `8080`.

```bash
docker build -t peluqueria-api .
docker run -p 8080:8080 --env-file .env peluqueria-api
```

## Frontend

En Vercel/Netlify configurar:

```env
VITE_API_BASE_URL=https://tu-api.com/api
```

Despues de publicar frontend, agregar ese dominio en `AllowedOrigins__0` de la API.
