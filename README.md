# Boletas Adelante — App de gestión de materiales en obra

App mobile-first en Next.js para gestionar boletas de salida, entrega y traslado de materiales en proyectos de construcción.

## Inicio rápido

```bash
npm install
npm run dev
```

Abre http://localhost:3000 en Chrome.

Para probar en celular: conectar al mismo Wi-Fi y usar la IP local (ej. http://192.168.x.x:3000).

## Roles y flujos

| Rol           | Puede hacer                                          |
|---------------|------------------------------------------------------|
| Encargado     | Crear boletas, ver entregas, hacer traslados         |
| Maestro obras | Aprobar/denegar boletas y traslados                  |
| Bodeguero     | Preparar solicitudes, ver stock                      |
| Transportista | Confirmar entregas y traslados con firma digital     |

## Pantallas

- `/login` — Selección de rol y correo
- `/obras` — Lista de obras, selección activa
- `/boletas` — Lista boletas de salida con filtros
- `/boletas/nueva` — Crear boleta (tipo + actividad + materiales)
- `/boletas/[id]` — Detalle con acciones por rol
- `/boletas/[id]/preparar` — Bodeguero prepara cantidades
- `/boletas/[id]/firmar` — Firma digital
- `/entrega` — Lista boletas de entrega
- `/entrega/[id]` — Detalle con progreso por material
- `/entrega/[id]/firmar` — Firma de entrega
- `/traslado` — Lista traslados/devoluciones
- `/traslado/nueva` — Crear traslado entre obras
- `/traslado/[id]` — Detalle con ruta origen→destino
- `/traslado/[id]/firmar` — Firma salida/llegada
- `/bodega` — Stock con alertas de mínimos + movimientos
- `/aprobaciones` — Panel maestro: boletas y traslados pendientes

## Stack

| Capa          | Tecnología                              |
|---------------|-----------------------------------------|
| Framework     | Next.js 16 (App Router)                 |
| UI            | Adelante Design System (CSS vars)       |
| Estado global | Zustand                                 |
| Offline store | Dexie.js (IndexedDB)                    |
| Animaciones   | motion/react (Framer Motion)            |
| Iconos        | @phosphor-icons/react                   |

## Conectar al backend real

Los API routes están en `app/api/`. Reemplaza los mocks de `lib/mockData.ts` con llamadas reales:

1. Instala `mssql`: `npm install mssql`
2. Crea `lib/db.ts` con el pool de conexión a `mysqladelante.database.windows.net/AdelanteSBX`
3. Conecta Dynamics 365 BC usando las llamadas a la API que ya estaban en Power Apps

## Offline

Dexie.js ya está configurado en `lib/offline.ts`. Cuando no hay internet, los datos se guardan en IndexedDB y la cola de sincronización (`syncQueue`) se procesa cuando vuelve la conexión.
