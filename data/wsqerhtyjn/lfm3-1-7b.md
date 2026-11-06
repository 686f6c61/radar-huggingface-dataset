# wsqerhtyjn/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parametros (1,73B) desarrollado por Liquid AI, publicado como un fine-tune conversacional del checkpoint base LiquidAI/LFM3-1.7B-Base. Forma parte de la familia LFM3, que incluye variantes base, texto, vision, audio, omni y decision. Su proposito declarado es servir como modelo de texto para agentes locales y aplicaciones especializadas, con un enfoque explicito en despliegue en el borde (telefonos, portatiles) y en ajuste fino rapido en una sola GPU.

La arquitectura es un transformer tri-hibrido de 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Soporta una ventana de contexto de 256.000 tokens (entrada mas salida) y un vocabulario de 128.000 tokens, con cobertura de 16 idiomas, incluido el castellano. A 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en hardware de consumo muy limitado.

Es relevante porque propone un equilibrio poco habitual en su segmento: contexto muy largo, entrenamiento orientado a agentes y tool calling, y una huella de memoria minima. El propio autor advierte que no esta recomendado para coding agentico ni razonamiento multi-paso complejo debido a su tamano reducido, lo que delimita con claridad su nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido: 24 capas (13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible (la model card cita precision 4-bit con ~1 GB de memoria, sin detallar formatos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura tri-hibrida que alterna tres tipos de capas: convoluciones cortas con compuerta (13 capas), atencion de ventana deslizante (5 capas) y atencion global (6 capas). Este diseno busca reducir el coste computacional y de memoria del mecanismo de atencion clasico manteniendo capacidad de modelado de dependencias largas, lo que explica que un modelo de solo 1,73B pueda sostener una ventana de 256K tokens. El vocabulario es de 128.000 tokens.

El checkpoint publicado es un modelo post-entrenado sobre LiquidAI/LFM3-1.7B-Base, orientado a conversacion y a "agentic harnesses" como Hermes Agent, Pi y OpenClaw. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. El autor si menciona que el modelo esta pensado para especializarse rapidamente mediante fine-tuning en una sola GPU, lo que sugiere un diseno deliberado para adaptacion a dominios, formatos y herramientas concretas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (256K tokens).
- Tool calling y function calling, con entrenamiento especifico para entornos de agentes.
- Salidas estructuradas (structured outputs), segun la model card.
- Razonamiento multi-paso y flujos agenticos basicos, aunque el autor desaconseja los escenarios complejos.
- Capacidades multilingues en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, castellano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Ajuste fino rapido en una sola GPU para especializacion en dominios concretos.
- No dispone de vision, audio ni modo de pensamiento explicito en esta variante (es un checkpoint text-only).

## Casos de uso

- Agentes locales en dispositivos: al ocupar aproximadamente 1 GB a 4 bits, puede ejecutarse en un telefono o portatil para gestionar tareas de asistente personal, recordatorios o automatizacion ligera sin depender de la nube.
- Atencion al cliente automatizada: la ventana de 256K tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de soporte adjunta, reduciendo la perdida de contexto en sesiones largas.
- Enrutamiento y tool calling en pipelines: el entrenamiento orientado a agentes lo hace adecuado como capa de decision que selecciona herramientas o APIs en un sistema mayor, con salidas estructuradas faciles de parsear.
- Extraccion de informacion de documentos largos: contratos, informes o expedientes que caben en el contexto de 256K tokens pueden procesarse en una sola pasada sin troceado ni recuperacion externa.
- Clasificacion y etiquetado de texto multilingue: su cobertura de 16 idiomas permite clasificar tickets, resenas o mensajes en castellano, ingles, arabe o chino con un unico modelo.
- Fine-tuning de dominio en una sola GPU: equipos con recursos limitados pueden adaptar el modelo a jerga interna, formatos propietarios o herramientas especificas sin infraestructura de entrenamiento distribuida.
- Asistente de consulta con recuperacion (RAG): combinado con un motor de busqueda o base vectorial, sirve para tareas intensivas en conocimiento, tal como recomienda el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun la model card; en precision completa (fp16/bf16) el peso ronda los 3,5 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) puede alojarlo en cuantizacion; en fp16 basta con una GPU de 8 GB o superior.
- Cabe en GPU consumer: si, y tambien en telefonos y portatiles segun el fabricante.
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura tri-hibrida). El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Arquitectura tri-hibrida, enfoque en agentes locales |
| Qwen3-1.7B | 1,7B | 32K (ampliable) | Apache 2.0 | Transformer denso, sin datos de comparacion directa disponibles aqui |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | Enfoque en eficiencia, sin contexto largo |

La comparativa se limita a parametros, contexto y licencia porque no hay resultados de benchmarks publicados para LFM3-1.7B en la informacion disponible que permitan contrastar rendimiento.

## Limitaciones y advertencias

- El autor desaconseja explicitamente su uso para coding agentico y razonamiento multi-paso complejo por su tamano reducido.
- Riesgo de alucinacion: al ser un modelo de 1,73B, la model card recomienda usar recuperacion o busqueda para tareas intensivas en conocimiento.
- La licencia LFM Open License v1.0 no es una licencia de codigo abierto estandar; es necesario revisar sus terminos antes de un uso comercial.
- Es un checkpoint text-only: no soporta vision ni audio pese a que la familia LFM3 incluya esas variantes.
- La arquitectura requiere `custom_code` en transformers, lo que puede complicar la integracion con frameworks de inferencia de terceros.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- El repositorio tiene 442 descargas y 0 likes, y fue creado y actualizado el mismo dia; se trata de una publicacion reciente sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wsqerhtyjn/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
