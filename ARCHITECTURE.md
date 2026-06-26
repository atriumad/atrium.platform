Perfecto. Abajo te dejo un **documento técnico base** pensado para que sirva tanto a ti como a tu agente de código. Está orientado a tu stack Next.js/TypeScript y a la arquitectura que definimos: monorepo, core interno, conectores desacoplados y procesamiento por eventos. [nextjs](https://nextjs.org/docs)

# Documento de arquitectura

## Estado actual de implementación

Este repositorio implementa la base del monorepo con Bun, Turborepo, Next.js,
TypeScript estricto, Prisma 5 y autenticación propia por email/password con JWT
en cookie HTTP-only. Clerk, Trigger.dev, conectores externos y la capa de IA
siguen siendo direcciones de producto, no módulos presentes en el código actual.

La app web actúa como capa de entrega: sus route handlers de auth/signup parsean
HTTP, delegan en casos de uso de `packages/application` y dejan persistencia,
hashing y transacciones en adapters de `packages/infrastructure`. La regla
operativa vigente es mantener esos handlers delgados antes de añadir más flujos.

## 1) Visión del sistema

La plataforma será un sistema interno de crecimiento para restaurantes, agnóstico a proveedores, con una capa propia de datos, métricas, reglas e IA. Los conectores externos solo alimentan el core; el producto debe seguir funcionando aunque un cliente no conecte uno o varios servicios. [martinfowler](https://martinfowler.com/architecture/)

## 2) Objetivo arquitectónico

El objetivo es separar con claridad:
- La lógica de negocio.
- La integración con servicios externos.
- El almacenamiento y procesamiento de datos.
- La interfaz de usuario y las acciones del usuario. [martinfowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)

Esta separación reduce acoplamiento, facilita pruebas, mejora mantenibilidad y permite reemplazar proveedores sin reescribir el sistema. [en.wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))

## 3) Patrones elegidos

### Hexagonal Architecture
La arquitectura central será Hexagonal Architecture, también conocida como Ports & Adapters. El dominio define puertos; los conectores implementan adaptadores; el core no depende de infraestructura concreta. [github](https://github.com/onicagroup/hexagonal-example)

### Event-Driven Architecture
Usaremos Event-Driven Architecture para propagar cambios entre módulos, disparar recalculos, ejecutar automatizaciones y alimentar agentes de IA. Esto desacopla los procesos y permite escalar sin convertir el sistema en una cadena de llamadas rígidas. [cloud.google](https://cloud.google.com/discover/what-is-event-driven-architecture)

### Monorepo modular
Usaremos un monorepo porque el producto tendrá frontend, backend, conectores y paquetes compartidos. Turborepo está pensado para escalar monorepos TypeScript/JavaScript y acelerar builds con caching. [turborepo](https://turborepo.dev/docs)

## 4) Principios no negociables

1. El dominio no importa infraestructura.
2. Los conectores no contienen reglas de negocio.
3. La UI no decide lógica de negocio.
4. Todo dato externo se normaliza antes de entrar al core.
5. La IA consume eventos y entidades internas, no APIs crudas.
6. Los contratos entre módulos se versionan explícitamente. [martinfowler](https://martinfowler.com/architecture/)

## 5) Estructura del monorepo

```txt
apps/
  web/                  # Next.js app: UI + routes + server actions
packages/
  domain/               # Entidades, value objects, invariantes
  application/          # Use cases, orchestration, workflows
  connectors/           # Futuro: integrations Toast, Google, Meta, etc.
  infrastructure/       # DB, queues, cache, observability
  events/               # Event contracts, schemas, versioning
  ai/                   # Futuro: agents, prompts, evaluators, tools
  shared/               # Common utilities, types, helpers
  ui/                   # Design system and reusable components
```

Esta estructura ayuda a mantener límites claros entre capas y a compartir código de forma controlada. [freecodecamp](https://www.freecodecamp.org/news/reusable-architecture-for-large-nextjs-applications/)

## 6) Responsabilidades por capa

### apps/web
Contiene la experiencia del usuario, las rutas de Next.js, formularios, pantallas, server actions y endpoints de borde. Debe ser delgada: llama casos de uso, no escribe reglas de negocio. [nextjs](https://nextjs.org/docs/app)

### packages/domain
Aquí vive el negocio puro: métricas, agregaciones, reglas, entidades, estados y validaciones. No debe depender de Next.js, base de datos ni SDKs de terceros. [martinfowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)

### packages/application
Orquesta los casos de uso. Por ejemplo: sincronizar ventas, recalcular score de salud, generar una alerta o disparar una recomendación de IA. [github](https://github.com/onicagroup/hexagonal-example)

### packages/connectors
Implementa adaptadores a fuentes externas. Cada conector solo debe encargarse de autenticación, extracción, transformación y entrega al core. [angular](https://angular.love/ports-and-adapters-vs-hexagonal-architecture-is-it-the-same-pattern)

### packages/infrastructure
Incluye persistencia, colas, caché, logging, observabilidad y cualquier mecanismo técnico. Aquí vive la realidad técnica, pero no la lógica del producto. [martinfowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)

### packages/events
Define contratos de eventos versionados. Ejemplos: `sales.synced`, `review.created`, `campaign.sent`, `traffic.updated`, `score.recomputed`. [ibm](https://www.ibm.com/think/topics/event-driven-architecture)

### packages/ai
Contiene agentes, prompts, policies, evaluaciones y herramientas internas. La IA debe operar sobre datos ya normalizados y eventos internos. [cloud.google](https://cloud.google.com/discover/what-is-event-driven-architecture)

## 7) Flujo de datos

1. Un conector extrae datos de una fuente externa.
2. El conector transforma esos datos al contrato interno.
3. El core valida y persiste la información.
4. Se publica un evento interno.
5. Los consumidores reaccionan: dashboards, alertas, IA, automatizaciones. [angular](https://angular.love/ports-and-adapters-vs-hexagonal-architecture-is-it-the-same-pattern)

## 8) Modelo de datos canónico

El sistema debe hablar un lenguaje propio. Ejemplos de entidades canónicas:
- Tenant.
- Location.
- Order.
- Customer.
- Review.
- Campaign.
- TrafficSnapshot.
- KeywordSnapshot.
- RevenueSnapshot.
- Alert.
- Recommendation. [martinfowler](https://martinfowler.com/architecture/)

Esto evita que cada proveedor “imponga” su modelo al producto. [github](https://github.com/onicagroup/hexagonal-example)

## 9) Estrategia de integración

Los conectores son opcionales y reemplazables. El sistema debe funcionar de forma útil incluso con datos parciales, y mejorar cuando el cliente conecta más fuentes. [martinfowler](https://martinfowler.com/architecture/)

Prioridad sugerida:
1. POS / ventas.
2. Google Business Profile.
3. GA4 y Search Console.
4. Meta Ads.
5. Otros canales según el cliente. [nextjs](https://nextjs.org/docs)

## 10) IA y automatización

Los agentes de IA no deben ser “chatbots sueltos”. Deben actuar como analistas y operadores sobre el modelo interno:
- Detectar anomalías.
- Encontrar patrones.
- Proponer acciones.
- Generar resúmenes.
- Ejecutar tareas cuando haya permiso. [akamai](https://www.akamai.com/glossary/what-is-event-driven-architecture)

La IA debe recibir eventos, métricas y contexto del negocio, no datos sin procesar de cada API. [ibm](https://www.ibm.com/think/topics/event-driven-architecture)

## 11) Reglas para el agente de código

### Debe hacer
- Respetar fronteras entre capas.
- Crear casos de uso antes que endpoints.
- Mantener tipos compartidos en `packages/events` o `packages/shared`.
- Normalizar datos de integración.
- Escribir pruebas para dominio y casos de uso.

### No debe hacer
- Importar SDKs externos dentro de `domain`.
- Mezclar UI con reglas de negocio.
- Crear lógica de negocio dentro de conectores.
- Hacer llamadas directas a APIs externas desde la UI. [runlevel0](https://runlevel0.me/blog/hexagonal-architecture-in-typescript-part-1/)

## 12) Convenciones de implementación

- Preferir funciones puras en dominio.
- Usar interfaces para puertos.
- Implementar adaptadores concretos en infraestructura.
- Versionar esquemas de eventos.
- Mantener rutas de Next.js como controladores delgados.
- Separar lectura y escritura cuando el caso lo justifique. [ibm](https://www.ibm.com/think/topics/event-driven-architecture)

## 13) Referentes y documentación

### Arquitectura
- Martin Fowler – Software Architecture Guide: [https://martinfowler.com/architecture/](https://martinfowler.com/architecture/) [martinfowler](https://martinfowler.com/architecture/)
- Martin Fowler – Presentation Domain Data Layering: [https://martinfowler.com/bliki/PresentationDomainDataLayering.html](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) [martinfowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- Hexagonal architecture overview: [https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) [en.wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))

### Next.js
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs) [nextjs](https://nextjs.org/docs)
- Next.js App Router: [https://nextjs.org/docs/app](https://nextjs.org/docs/app) [nextjs](https://nextjs.org/docs/app)

### Monorepo
- Turborepo Docs: [https://turborepo.dev/docs](https://turborepo.dev/docs) [turborepo](https://turborepo.dev/docs)
- Deploying Turborepo to Vercel: [https://vercel.com/docs/monorepos/turborepo](https://vercel.com/docs/monorepos/turborepo) [vercel](https://vercel.com/docs/monorepos/turborepo)

### Event-driven
- IBM overview: [https://www.ibm.com/think/topics/event-driven-architecture](https://www.ibm.com/think/topics/event-driven-architecture) [ibm](https://www.ibm.com/think/topics/event-driven-architecture)
- Google Cloud overview: [https://cloud.google.com/discover/what-is-event-driven-architecture](https://cloud.google.com/discover/what-is-event-driven-architecture) [cloud.google](https://cloud.google.com/discover/what-is-event-driven-architecture)

## 14) Decisión final

La decisión recomendada es construir una plataforma monorepo en Next.js/TypeScript, con arquitectura hexagonal en el core, conectores desacoplados y eventos internos como mecanismo de coordinación. Ese enfoque maximiza control, escalabilidad y capacidad de iterar sin amarrarte a un proveedor específico. [turborepo](https://turborepo.dev/docs)

Puedo convertir esto ahora en un **README técnico listo para tu repositorio**, o en un **ARCHITECTURE.md más formal** con ejemplos de carpetas, interfaces y flujo de eventos.
