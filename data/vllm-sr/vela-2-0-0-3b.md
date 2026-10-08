# vllm-sr/Vela-2.0-0.3B

## Resumen

Vela 2.0 0.3B es un modelo encoder compacto de aproximadamente 309 millones de parametros, publicado por la organizacion vllm-sr en el marco de la familia "Open Foundation Routing Models" desarrollada conjuntamente por vLLM Semantic Router y KR Labs. No es un modelo generativo: es un modelo de decision ("system-one") pensado para tomar decisiones de enrutamiento, clasificacion y verificacion dentro de pipelines de LLM, devolviendo rutas, etiquetas, puntuaciones y tramos de texto con offsets de caracteres.

El modelo resuelve la capa de "decision rapida" que suele acompanar a un LLM grande: elegir a que modelo o ruta enviar una peticion, comprobar condiciones de politica, detectar informacion personal (PII), marcar alucinaciones en las respuestas y clasificar contenido no seguro. Al exponer estas decisiones mediante preguntas tipadas (Choice, Yes/no o "Noul", Score, Span y Set) en una misma interfaz, evita desplegar varios clasificadores independientes.

Tecnicamente se apoya en un backbone ModernBERT bidireccional de 22 capas con anchura oculta de 768 y un presupuesto de entrada de 8.192 tokens (que incluye el esquema y el estado de la peticion). Soporta 18 idiomas, se distribuye con licencia Apache 2.0 y puede ejecutarse en CPU o GPU tanto en Torch como en ONNX, lo que lo hace relevante para despliegues de guardrails y enrutamiento con requisitos de latencia y coste ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional ModernBERT, 22 capas |
| Parametros totales | 309.114.369 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (incluyendo esquema y estado) |
| Tipos de cuantizacion | Torch fp32; ONNX fp32 y ONNX fp16 para el encoder con cabezas en fp32 |
| Idiomas soportados | arabe, chino, checo, neerlandes, ingles, frances, aleman, hindi, italiano, japones, coreano, polaco, portugues, ruso, espanol, sueco, tailandes (18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

Otros datos de interes: anchura oculta 768; tamano del repositorio 3,1 GB; pipeline declarado `zero-shot-classification`; metadatos de despliegue en CPU o GPU mediante API Python y servidor HTTP compatible con SystemOne; modelo base `vllm-sr/Decision-1.0-Kai-0.6B` y `vllm-sr/Vela-1.0-Encoder-307M` (relacion: finetune).

## Arquitectura y entrenamiento

Vela 2.0 0.3B emplea un backbone ModernBERT de 22 capas y anchura oculta 768, un transformer bidireccional (encoder) que no genera texto libre: su salida son decisiones estructuradas. La interfaz "vela2-unified" expone preguntas tipadas sobre un estado compuesto por tres partes: `request`, `source` y `answer` (peticion, contexto y respuesta del modelo). Los tipos de pregunta soportados son Choice (seleccion de una etiqueta), Yes/no o Noul (verdadero/falso con probabilidad), Score (puntuacion), Span (extraccion de tramos con etiqueta, offsets Unicode y probabilidad) y Set (seleccion multiple de etiquetas).

El modelo es un finetune sobre `vllm-sr/Decision-1.0-Kai-0.6B` y `vllm-sr/Vela-1.0-Encoder-307M`. Segun los metadatos de la model card, el entrenamiento se apoya en una mezcla de datasets de seguridad, toxicidad, inyeccion de prompt y deteccion de alucinaciones: `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `ToxicityPrompts/PolyGuardMix`, `nvidia/Nemotron-Safety-Guard-Dataset-v3`, `microsoft/llmail-inject-challenge`, `OpenSafetyLab/Salad-Data`, `KRLabsOrg/lettucedetect-prose-hallucination` y `KRLabsOrg/lettucedetect-code-hallucination`. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset, ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones destacables estan la interfaz unificada de routing y spans en una sola llamada, las cabezas especializadas de PII y deteccion de alucinaciones, y la compatibilidad con inferencia ONNX fp16 para el encoder manteniendo las cabezas en fp32.

## Capacidades

- Enrutamiento semantico: seleccion de ruta o modelo destino segun criterios definidos en el momento de la peticion.
- Clasificacion zero-shot: asignacion de etiquetas Choice o Set sobre texto, con probabilidades por etiqueta.
- Comprobacion de condiciones de politica: preguntas Yes/no (tipo Noul) con probabilidad asociada.
- Deteccion de PII a nivel de span: identificacion de personas, correos electronicos y otras entidades con offsets de caracteres y probabilidad (esquema `pii_schema` con etiquetas predefinidas).
- Deteccion de alucinaciones: marcado de afirmaciones de la respuesta no respaldadas por el contexto (`source`), con tramos y probabilidad.
- Clasificacion de seguridad de contenido: apoyo en datasets de content safety y toxicidad para cribar entradas y salidas.
- Deteccion de inyeccion de prompt: entrenado parcialmente con el dataset del reto `microsoft/llmail-inject-challenge`.
- Soporte multilingue en 18 idiomas.
- Contexto largo: hasta 8.192 tokens de entrada, suficiente para incluir texto, contexto auxiliar y el esquema de preguntas en una sola llamada.
- Puntuacion (tipo Score) sobre criterios definidos por el usuario.
- No soporta generacion de texto libre ni vision ni audio segun la informacion disponible.

## Casos de uso

- Enrutamiento de peticiones entre varios LLM: el modelo recibe la consulta como `request` y devuelve una etiqueta Choice que indica a que modelo o pipeline derivarla, aprovechando su latencia baja frente a un LLM enrutador generativo.
- Guardrail de seguridad en produccion: clasificar entradas y salidas como seguras o no seguras y bloquear contenido toxico antes de llegar al usuario final, apoyandose en los datasets Aegis y Nemotron Safety Guard.
- Redaccion de datos personales: ejecutar preguntas de tipo Span sobre `request` para localizar nombres, correos y otros identificadores antes de registrar o reenviar la peticion a un tercero.
- Verificacion anti-alucinacion en sistemas RAG: comparar `source` y `answer` y devolver los tramos no respaldados por el contexto, con offsets que permiten resaltar el fragmento problematico en la interfaz.
- Defensa frente a inyeccion de prompt: comprobar condiciones de politica sobre la entrada del usuario para detectar intentos de manipular instrucciones del sistema.
- Moderacion de comunidades o comentarios: clasificacion Set para asignar varias etiquetas (toxicidad, acoso, spam) a un mismo texto en varios idiomas sin cambiar de modelo.
- Clasificacion de dominios o intenciones: enrutar una consulta a un area tematica (salud, matematicas, otros) para seleccionar la herramienta o el prompt adecuados, como muestra el ejemplo de la model card.
- Servicio HTTP de decisiones en CPU: desplegar el modelo como microservicio compatible con una API SystemOne para centralizar decisiones de routing y seguridad sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 309 millones de parametros): en Torch fp32, aproximadamente 1,2 GB solo de pesos, mas activaciones y overhead; en ONNX fp16 del encoder con cabezas fp32, alrededor de 0,6 GB de pesos.
- Al ser un modelo de 0,3B, cabe con holgura en practicamente cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc., e incluso en CPU.
- Ejecucion en CPU soportada de forma nativa en Torch fp32 y en ONNX fp32 o fp16, segun la model card.
- GPU recomendadas para produccion de alto rendimiento: cualquiera con suficiente VRAM para batching, por ejemplo A10, L4, A100 o H100, aunque el modelo no las requiere por tamano.
- Opciones de despliegue: API Python con `transformers` (cargando con `trust_remote_code=True`) y servidor HTTP compatible con SystemOne; inferencia ONNX en CPU o GPU.
- El autor indica explicitamente que la carga en Torch debe mantenerse en fp32.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.
- Nota: el proyecto vLLM (motor de inferencia de alto rendimiento) no aparece en la model card como requisito de despliegue de este modelo; los resultados de busqueda web recuperados describen vLLM de forma generica y no aportan cifras especificas para Vela 2.0.

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de modelos comparables en la misma categoria (encoders de routing y decision). Los unicos antecesores documentados en los metadatos son:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela 2.0 0.3B | modelo actual | 309.114.369 | 8.192 tokens | Apache 2.0 | HuggingFace (vllm-sr/Vela-2.0-0.3B) |
| Vela 1.0 Encoder 307M | modelo base | ~307M (segun nombre) | no disponible | no disponible | HuggingFace (vllm-sr/Vela-1.0-Encoder-307M) |
| Decision 1.0 Kai 0.6B | modelo base | ~0.6B (segun nombre) | no disponible | no disponible | HuggingFace (vllm-sr/Decision-1.0-Kai-0.6B) |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo decisiones, etiquetas, puntuaciones y spans.
- Riesgo de error en las decisiones: las probabilidades devueltas no implican certeza (por ejemplo, en el ejemplo de la model card la clasificacion de dominio "health" se da con confianza 0,51). Conviene fijar umbrales y validacion humana en casos criticos.
- La deteccion de alucinaciones depende de que se facilite un `source` correcto; sin contexto fiable, la verificacion pierde validez.
- Cobertura de PII y de idiomas limitada al esquema y a los datos de entrenamiento; no se detalla la lista completa de etiquetas ni el rendimiento por idioma.
- El presupuesto de 8.192 tokens incluye el esquema y el estado, por lo que el texto efectivo disponible es menor que esa cifra.
- Posibles sesgos heredados de los datasets de seguridad y toxicidad utilizados; no se documenta un analisis de sesgos en la informacion disponible.
- El modelo es un finetune de modelos base de la misma organizacion; si esos modelos base tienen restricciones, podrian afectar al uso, aunque la licencia declarada del modelo final es Apache 2.0 y permite uso comercial.
- La carga requiere `trust_remote_code=True` y codigo personalizado (`custom_code`), lo que implica revisar y confiar en el codigo remoto antes de ejecutarlo en produccion.
- El autor advierte que Torch debe cargarse en fp32; forzar otras precisiones en esa ruta no esta soportado segun la model card.
- Idioma de la documentacion: la model card esta en ingles; esta ficha es una sintesis en castellano y no sustituye a la documentacion oficial.

## Enlaces

- HuggingFace: https://huggingface.co/vllm-sr/Vela-2.0-0.3B
- Documentacion: https://vllm-sr.ai/
- Blog de presentacion: https://vllm-sr.ai/blog/vela-2-0-open-foundation-routing-models
- Repositorio GitHub (vLLM Semantic Router): https://github.com/vllm-project/semantic-router
- Coleccion Vela 2.0: https://huggingface.co/collections/vllm-sr/vela-20
- Guia de uso (referenciada en la model card): USAGE.md dentro del repositorio del modelo
- Modelo base: https://huggingface.co/vllm-sr/Decision-1.0-Kai-0.6B
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
