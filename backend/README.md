# Peluqueria API

Backend profesional para una peluquería construido con `.NET 10`, `ASP.NET Core`, `Entity Framework Core` y `PostgreSQL`.

## Alcance implementado

- Autenticación JWT
- Roles: `Admin`, `Recepcionista`, `Profesional`, `Cliente`
- Gestión de clientes
- Catálogo de servicios
- Horarios de atención
- Reservas con validación de disponibilidad
- Regla especial para `Service` de pestañas

## Reglas especiales implementadas

- Servicios de `Peluquería` pueden tener precio variable.
- Servicios de `Uñas` y `Pestañas` requieren precio fijo.
- Para reservar un `Service` de pestañas:
  - sin historial de `Set Completo`: se rechaza
  - más de 21 días desde el último `Set Completo`: se permite con warning
  - más de 30 días: se rechaza y se exige `Remoción + Set Completo`

## Estructura

- `src/Peluqueria.Api`
- `src/Peluqueria.Application`
- `src/Peluqueria.Domain`
- `src/Peluqueria.Infrastructure`
- `tests/Peluqueria.Tests`

## Configuración local

1. Crear una base PostgreSQL.
2. Ajustar `src/Peluqueria.Api/appsettings.json`.
3. Ejecutar:

```bash
dotnet restore
dotnet build
dotnet test
dotnet run --project src/Peluqueria.Api
```

## Administrador inicial

No existe un usuario administrador hardcodeado ni una contraseña por defecto.

El usuario administrador inicial se crea o actualiza desde la configuración:

```bash
GoogleAuth__AdminEmails__0=tu-email-admin@gmail.com
```

Ese email debe iniciar sesión con Google. Cualquier otro usuario autenticado se crea con rol `Cliente`.
