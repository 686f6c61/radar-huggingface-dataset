# thirdeye-ai/ThirdeyeAI

## Resumen

ThirdeyeAI no es un modelo de lenguaje: es un repositorio de Hugging Face que sirve como punto de referencia de la plataforma Thirdeye AI, un servicio de inferencia compatible con la API de OpenAI. El repositorio, con licencia Apache-2.0, no contiene pesos de modelo (tamano de 0.0 GB) y actua unicamente como escaparate del proyecto, sus activos de marca y su documentacion. El servicio en si enruta peticiones a varios proveedores upstream (OpenAI, Anthropic, Groq, DeepSeek, entre otros) en lugar de servir un modelo propio, por lo que no existe una arquitectura, un tamano de parametros ni una ventana de contexto atribuibles a este artefacto.

La propuesta de valor de la plataforma es un endpoint unico con metering por llamada: cada respuesta incluye la cabecera `x-thirdeye-cost-usd` con el coste exacto, las cuentas se autentican mediante firma de wallet Ethereum (SIWE) sin contrasenas ni correo, y los creditos son prepago financiados con USDC en Base o USDG en Robinhood Chain. Tambien permite traer claves propias (bring your own keys) para OpenAI, Anthropic, Groq o DeepSeek y pagar solo el metering. El catalogo autoritativo de modelos servidos se obtiene via `GET /api/v1/models`, con precios por modelo.

Es relevante ahora por su enfoque de facturacion transparente por llamada y autenticacion criptografica orientada a agentes autonomos, con soporte de MCP y del protocolo de pagos x402. Para desarrolladores que evaluan modelos, la ficha de este repositorio debe leerse como la de un agregador de inferencia, no como la de un modelo concreto; el modelo real depende del proveedor upstream seleccionado en cada peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de plataforma, no contiene pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo upstream enrutado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | Apache-2.0 (contenido del repositorio; no cubre el token THIRDEYE ni los pesos upstream) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento asociado a este repositorio. La "arquitectura" del producto es la de un enrutador de inferencia: las peticiones se dirigen a proveedores upstream en lugar de a un unico vendor, de modo que un modelo lo sirve el proveedor que este operativo en ese momento. El catalogo publicado en `GET /api/v1/models` es la fuente de verdad sobre lo disponible, con precios por modelo; cualquier modelo ausente del catalogo debe considerarse no disponible, no simplemente no documentado.

Los elementos tecnicos destacables son de infraestructura, no de modelado: endpoint compatible con OpenAI (`https://thirdeye-ai-alpha.vercel.app/api/v1`), metering por llamada expuesto en la cabecera `x-thirdeye-cost-usd`, autenticacion SIWE con wallet Ethereum, creditos prepago en USDC sobre Base y USDG sobre Robinhood Chain, y soporte declarado de agentes, MCP y x402. La model card declara explicitamente que no publica puntuaciones de benchmark, cifras de latencia ni porcentajes de uptime, remitiendo esas metricas a la pagina de estado con marca temporal.

## Capacidades

- Enrutado de inferencia compatible con la API de OpenAI, con endpoint base y catalogo de modelos consultable.
- Facturacion por llamada: cada respuesta declara su coste en USD mediante cabecera HTTP.
- Autenticacion sin contrasena mediante firma de wallet Ethereum (SIWE).
- Pago prepago con stablecoins: USDC en Base y USDG en Robinhood Chain.
- Bring your own keys: permite enrutar credenciales propias de OpenAI, Anthropic, Groq o DeepSeek y pagar solo el metering.
- Soporte orientado a agentes: tags de agentes, MCP y x402 en el repositorio.
- Capacidades de generacion, razonamiento, codigo, vision o audio: no disponibles a nivel de plataforma; dependen del modelo upstream seleccionado.
- Capacidades multilingues: no disponibles a nivel de plataforma; el repositorio declara unicamente `en`.

## Casos de uso

- Agentes autonomos con pago por uso: un agente puede consumir el endpoint y liquidar creditos prepago en USDC sobre Base, con el coste de cada llamada registrado en la cabecera `x-thirdeye-cost-usd` para contabilidad automatizada.
- Integracion con flujos MCP: herramientas y servidores que hablan Model Context Protocol pueden apuntar al endpoint compatible con OpenAI para invocar modelos sin gestionar multiples SDKs de proveedores.
- Enrutado con failover entre proveedores: aplicaciones que necesitan continuidad si un proveedor upstream cae pueden delegar la seleccion al enrutador, consultando el catalogo para conocer que esta disponible en cada momento.
- Bring your own keys con metering unificado: equipos que ya tienen contratos con OpenAI, Anthropic, Groq o DeepSeek pueden centralizar el enrutado y medir consumo por llamada sin migrar sus credenciales.
- Micropagos x402 para APIs de agentes: servicios que cobran por peticion pueden apoyarse en el protocolo x402 y el modelo de creditos prepago para monetizar inferencia entre agentes.
- Presupuestacion por llamada en produccion: aplicaciones con requisitos de control de coste pueden leer el coste declarado por respuesta para imponer limites y alertas por peticion, en lugar de depender de estimaciones agregadas mensuales.
- Prototipado rapido multi-proveedor: desarrolladores que comparan modelos pueden cambiar de upstream sin cambiar de cliente HTTP, manteniendo una sola integracion compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no incluye puntuaciones de benchmark, cifras de latencia ni porcentajes de uptime, y remite esas metricas a la pagina de estado, donde se producen desde la ruta de produccion y llevan marca temporal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la inferencia ocurre en proveedores upstream, no en hardware local del usuario.
- GPU recomendadas: no disponible; no aplica al repositorio, que no contiene pesos.
- Ejecucion en GPU de consumo: no disponible; no aplica, al no existir pesos descargables.
- Opciones de despliegue: no aplica despliegue local de pesos. El consumo se realiza via API HTTP compatible con OpenAI en `https://thirdeye-ai-alpha.vercel.app/api/v1`; la fuente incluye un repositorio de codigo en GitHub.
- Latencia y throughput estimados: no disponibles; la model card declara que no publica cifras de latencia y remite a la pagina de estado.

## Comparativa con modelos similares

| Aspecto | Thirdeye AI Platform | OpenRouter (agregador de inferencia) | API directa de un proveedor (p. ej. OpenAI) |
|---|---|---|---|
| Naturaleza | Plataforma/agregador, sin pesos en el repo | Agregador de inferencia multi-proveedor | Proveedor unico de modelos |
| Endpoint compatible OpenAI | Si | Si | Si |
| Coste por llamada declarado en respuesta | Si (`x-thirdeye-cost-usd`) | No disponible en la informacion | No disponible en la informacion |
| Autenticacion | Wallet Ethereum (SIWE) | No disponible en la informacion | Clave API |
| Pago con stablecoins | USDC en Base, USDG en Robinhood Chain | No disponible en la informacion | No disponible en la informacion |
| Bring your own keys | Si (OpenAI, Anthropic, Groq, DeepSeek) | No disponible en la informacion | No aplica |
| Licencia del repositorio | Apache-2.0 | No disponible en la informacion | No aplica |
| Parametros, contexto, benchmarks | No disponibles a nivel de plataforma | No disponibles en la informacion | Dependen del modelo concreto |

La comparativa con OpenRouter y con APIs directas de proveedores se ofrece como referencia de categoria (agregacion de inferencia); los datos de esas alternativas no proceden de la informacion proporcionada y se marcan como no disponibles cuando no constan.

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos, por lo que no puede descargarse ni ejecutarse localmente. Cualquier evaluacion de calidad, contexto o capacidades debe hacerse sobre el modelo upstream concreto seleccionado.
- El catalogo de modelos servidos puede cambiar: la model card indica que lo ausente del catalogo debe considerarse no disponible, lo que implica variabilidad en la oferta.
- Dependencia de terceros: el rendimiento, la disponibilidad y las limitaciones (sesgos, alucinaciones, contexto, idioma) son las de los proveedores upstream, no controlables desde la plataforma.
- Idiomas: el repositorio declara unicamente `en`; el soporte multilingue efectivo depende del modelo enrutado y no esta documentado a nivel de plataforma.
- Licencia: Apache-2.0 cubre solo el contenido del repositorio (model card, activos de marca y artefactos futuros); no se extiende al contrato del token THIRDEYE ni a los pesos upstream, que tienen sus propias licencias.
- Token separado: THIRDEYE es un activo onchain en Base (`0xA8A65A86E01D227Dbfd7C7a94d14344b33603df5`), con suministro fijo de 1.000.000.000 y pool Uniswap v4 THIRDEYE/WETH con liquidez bloqueada; la model card declara que nada de lo publicado constituye asesoramiento financiero ni oferta de valores.
- Ausencia de metricas publicadas: no hay benchmarks, latencia ni uptime en la card; deben consultarse en la pagina de estado con marca temporal.
- Estado del proyecto: la URL del servicio apunta a un dominio de alpha (`thirdeye-ai-alpha.vercel.app`), lo que sugiere disponibilidad preliminar y posibles cambios de endpoint.
- Repositorio sin descargas ni likes en el momento de la consulta, con tamano de 0.0 GB: no hay artefactos tecnicos evaluables mas alla de la documentacion.

## Enlaces

- Hugging Face: https://huggingface.co/thirdeye-ai/ThirdeyeAI
- Sitio web: https://thirdeye-ai-alpha.vercel.app
- Documentacion: https://thirdeye-ai-alpha.vercel.app/docs
- Guia de API: https://thirdeye-ai-alpha.vercel.app/docs/api
- Whitepaper: https://thirdeye-ai-alpha.vercel.app/whitepaper
- Estado del servicio: https://thirdeye-ai-alpha.vercel.app/status
- Contacto y verificacion: https://thirdeye-ai-alpha.vercel.app/contact
- X: https://x.com/Thirdeye_Infra
- Telegram: https://t.me/Thirdeye_AI_Bot
- Perfil de agente (Abund.ai): https://abund.ai/agent/thirdeye
- Codigo fuente: https://github.com/hakuramasam/thirdeye-ai
- Endpoint de API (base URL): https://thirdeye-ai-alpha.vercel.app/api/v1
- Catalogo de modelos: https://thirdeye-ai-alpha.vercel.app/api/v1/models
