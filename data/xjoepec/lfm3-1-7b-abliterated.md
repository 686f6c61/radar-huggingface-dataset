# xJoePec/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una variante "decensored" (abliterated) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario xJoePec. El modelo base lo desarrolla Liquid AI y pertenece a la familia LFM3, una nueva generacion de modelos de texto disenados para agentes locales y aplicaciones especializadas sobre una arquitectura tri-hibrida propietaria. El resultado es un transformer de 1.728.801.536 parametros (aproximadamente 1,7 mil millones) con una ventana de contexto de 256K tokens y entrenamiento post-entrenamiento orientado a entornos agenticos.

La modificacion consiste en una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada con la herramienta Heretic v2.0.0 sobre las capas 11 a 18 del modelo original. El objetivo es eliminar los rechazos del modelo base ante peticiones consideradas sensibles: segun la model card, el modelo original rechaza 91 de cada 100 peticiones de una bateria de prueba, mientras que esta version rechaza 0 de 100, con una divergencia KL de 0,0621 respecto al original.

Es relevante para desarrolladores e investigadores que necesiten un modelo pequeno, desplegable en el borde (aproximadamente 1 GB en cuantizacion de 4 bits), con contexto muy largo y comportamiento sin filtros, siempre teniendo en cuenta que la licencia LFM1.0 impone restricciones de uso comercial y que el modelo hereda las limitaciones del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida (familia LFM3 de Liquid AI), transformer con componentes hibridos; requiere `custom_code` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (256.000) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card menciona precision de 4 bits (aproximadamente 1 GB de memoria) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la nueva arquitectura tri-hibrida de Liquid AI, que combina mecanismos de atencion con componentes de estado (la familia LFM se asocia historicamente a modelos de espacio de estados liquidos). La model card no detalla la composicion exacta de la hibridacion ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Si se indica que el post-entrenamiento esta orientado a "agentic harnesses" como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens.

La innovacion tecnica de esta variante concreta es la ablacion de rango arbitrario (ARA) aplicada con Heretic v2.0.0. Los parametros publicados son: `start_layer_index` 11, `end_layer_index` 18, `preserve_good_behavior_weight` 0,6033, `steer_bad_behavior_weight` 0,0013, `overcorrect_relative_weight` 0,8901 y `neighbor_count` 10. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. El resultado medido es la eliminacion total de rechazos (0/100 frente a 91/100 del original) con una divergencia KL de 0,0621, que cuantifica el alejamiento de la distribucion de salida respecto al modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento general en 16 idiomas, incluido el espanol.
- Entrenamiento orientado a uso agentico: soporte para entornos de agentes como Hermes Agent, Pi y OpenClaw.
- Ventana de contexto de 256K tokens, adecuada para tareas de contexto largo y conversaciones multi-turno extensas.
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo base rechazaria.
- Disenado para especializacion: la model card indica que se puede adaptar a dominios, formatos y herramientas propios mediante fine-tuning rapido en una sola GPU.
- Despliegue en el borde: aproximadamente 1 GB de memoria en 4 bits, apto para telefonos y portatiles.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en esta variante (la familia LFM3 incluye modelos de vision, audio y omni, pero esta es la variante de texto).

## Casos de uso

- Agentes locales en dispositivos de borde: el modelo cabe en aproximadamente 1 GB a 4 bits y puede ejecutarse en telefonos o portatiles para tareas de agente autonomo sin conexion, aprovechando su post-entrenamiento para entornos como OpenClaw.
- Procesamiento de documentos largos: con 256K tokens de contexto se pueden ingerir contratos, informes o bases de codigo completas en una sola pasada para resumen, extraccion de entidades o preguntas y respuestas sobre el documento.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens, con respuestas en el idioma del usuario entre los 16 soportados.
- Generacion de contenido sin restricciones en entornos de investigacion: estudios sobre seguridad, alineacion y comportamiento de modelos requieren variantes sin rechazos para analizar respuestas ante prompts sensibles de forma controlada.
- Fine-tuning especializado en una sola GPU: la model card indica que el modelo esta pensado para adaptarse rapidamente a dominios y formatos concretos, lo que lo hace util para prototipado de asistentes verticales (legal, sanitario, soporte interno) con presupuesto de hardware limitado.
- Traduccion y procesamiento multilingue: cobertura de 16 idiomas (entre ellos arabe, chino, japones, coreano, hindi y tailandes) para pipelines de localizacion o moderacion de contenido multilingue.
- Investigacion sobre ablacion de direcciones de comportamiento: al ser reproducible mediante Heretic v2.0.0 con parametros publicados, sirve como caso de estudio metodologico para tecnicas de edicion de pesos.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la comparacion de rechazos y divergencia KL frente al modelo base:

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Rechazos | 0/100 | 91/100 |
| Divergencia KL | 0,0621 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantizacion de 4 bits segun la model card; en precision completa (fp16/bf16) los 1,728 mil millones de parametros requieren del orden de 3,5 GB de pesos mas memoria para el contexto.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-8 GB de VRAM para precision reducida; para fp16 se recomienda una RTX 3060/4060 o superior. En el borde, el modelo esta pensado para ejecutarse en CPU de telefonos y portatiles.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer actuales, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria indicada, requiere `custom_code`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-abliterated (este) | 1,73B | 256K | LFM1.0 | Variante sin rechazos del LFM3-1.7B |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM1.0 | Modelo base original, con rechazos (91/100) |
| Alternativas de ~1,5-2B (p. ej. Qwen, Gemma, Llama de ese rango) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: como cualquier modelo de 1,7B parametros, el riesgo de generar informacion falsa es alto, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el proceso de ablacion puede alterar el comportamiento del modelo de formas no medidas mas alla de los rechazos y la divergencia KL.
- Eliminacion de rechazos: el modelo responde a practicamente cualquier peticion (0/100 rechazos), lo que implica riesgos de seguridad y de cumplimiento normativo si se despliega sin capas de moderacion externas.
- Licencia LFM1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en produccion.
- Contexto e idioma: aunque se anuncian 256K tokens y 16 idiomas, no hay datos publicados sobre el rendimiento real en contextos muy largos ni en los idiomas distintos del ingles.
- Requiere `custom_code`: la carga del modelo necesita codigo personalizado de transformers, lo que puede complicar la integracion con stacks de inferencia estandar.
- Divergencia respecto al base: la KL de 0,0621 indica que el modelo no es identico al original; el rendimiento en tareas generales puede degradarse de forma no cuantificada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xJoePec/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion de la familia LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Heretic: https://heretic-project.org
