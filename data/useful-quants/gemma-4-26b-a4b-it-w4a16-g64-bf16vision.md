# useful-quants/Gemma-4-26B-A4B-it-W4A16-G64-BF16Vision

## Resumen

Gemma 4 26B-A4B-IT es un modelo multimodal de Google DeepMind, publicado en abril de 2026 bajo licencia Apache-2.0, que acepta texto e imagen como entrada y genera texto. Este checkpoint concreto, `useful-quants/Gemma-4-26B-A4B-it-W4A16-G64-BF16Vision`, es una cuantización W4A16 (INT4 solo pesos, tamaño de grupo 64) realizada por useful-quants sobre un derivado ajustado con QAT y abliteración (Heretic) del checkpoint de instrucción oficial. La conversión no es bit-idéntica al modelo público de Google, sino que parte de la línea `Mitchins/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic`, que elimina los filtros de seguridad del modelo original.

La arquitectura es un MoE multimodal con 25.8 mil millones de parámetros totales y aproximadamente 4 mil millones activos, distribuidos en 128 expertos finos con routing top-8. El modelo soporta un contexto arquitectónico de 262.144 tokens, aunque el autor ha validado una ventana operativa de 131.072 tokens en una RTX 3090 de 24 GB. La cuantización afecta únicamente a los pesos lineales y expertos MoE, mientras que la torre de visión, los routers, los embeddings y la cabeza de salida se mantienen en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B-A4B MoE multimodal (128 expertos, routing top-8) |
| Parametros totales | 25.805.936.206 (aprox. 26B) |
| Parametros activos | Aproximadamente 4B (por consulta) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico); 131.072 tokens validados |
| Tipos de cuantizacion | W4A16, INT4 simetrico, group size 64, GPTQ-style |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Gemma 4) |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 26B-A4B-IT, un transformer MoE multimodal con 128 expertos finos y routing de 8 expertos activos por token. La parte multimodal integra una torre de visión que procesa imagenes y las convierte en soft tokens que se combinan con el texto antes de entrar al modelo de lenguaje. El checkpoint de partida es una variante QAT (quantization-aware training) de Google, sobre la que Mitchins aplico un ajuste Heretic que elimina las restricciones de seguridad (abliterated/uncensored). useful-quants realizo posteriormente una cuantizacion W4A16 calibrada de forma multimodal: 512 ventanas de texto de 512 tokens (procedentes de Wikitext, OpenHermes y Apigen) y 1.024 imagenes de COCO 2017, con una secuencia de calibracion limitada a 1.024 tokens. Los pesos cuantizados son los lineales densos y los expertos MoE; la torre de vision, routers, embeddings y la cabeza de salida (atada al embedding BF16) permanecen sin cuantizar. No se reivindica ni recomienda ningun perfil de KV-cache con precision reducida.

## Capacidades

- Generacion de texto multimodal: acepta imagenes y texto como entrada y produce texto, incluyendo razonamiento y respuestas conversacionales.
- Modo de pensamiento (thinking mode): el modelo puede generar razonamiento interno antes de responder, segun la configuracion de Gemma 4.
- Razonamiento complejo y logica causal: destacado en las evaluaciones publicas de la serie Gemma 4.
- Soporte de tool calling / function calling: protocolo de uso de herramientas integrado en la familia Gemma 4.
- Soporte de agentes y multi-step reasoning: puede encadenar llamadas a herramientas y razonar sobre multiples pasos.
- Capacidades multilingues: no se especifica la lista de idiomas en la informacion disponible, pero la familia Gemma 4 es multilingue.
- Vision-language: interpreta imagenes y las combina con instrucciones de texto.

## Casos de uso

- Atencion al cliente automatizada: con una ventana de contexto de hasta 131.000 tokens validados, puede mantener conversaciones multi-turno largas y recordar detalles de interacciones previas sin perder el hilo.
- Analisis de documentos con imagenes: ideal para extraer informacion de documentos escaneados, capturas de pantalla o diagramas, combinando la comprension visual con el razonamiento textual.
- Agentes autonomos con herramientas: gracias al soporte de function calling y al modo de pensamiento, puede planificar y ejecutar tareas multi-paso, como consultar APIs, buscar informacion y resumir resultados.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo, con la ventaja de poder interpretar capturas de pantalla de errores o diagramas de arquitectura.
- Razonamiento multimodal para investigacion: util en tareas de analisis de imagenes cientificas, graficos o esquemas, donde se necesita explicar el contenido visual con texto estructurado.
- Despliegue en hardware de consumo: al estar cuantizado a 4 bits y validado en una RTX 3090 de 24 GB, permite ejecutar un modelo multimodal de 26B en estaciones de trabajo de gama alta sin necesidad de GPU de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye mediciones de MMLU, HumanEval, GSM8K ni otros evaluaciones comparativas en la model card. La unica validacion reportada es funcional: generacion de texto e inferencia con imagenes reales en una RTX 3090 con vLLM, y una ventana total de 131.072 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB, ya que el repositorio pesa 14.61 GiB y los pesos empaquetados 14.58 GiB. Cabe en una GPU de 24 GB con margen para activaciones y KV-cache.
- GPU de referencia: RTX 3090 24 GB (Ampere), validada por el autor con kernels Marlin densos y MoE.
- Compatibilidad: requiere kernels Marlin Ampere, por lo que es compatible con GPU Ampere (RTX 30) y posteriores (RTX 40, RTX 50, A100, H100). No esta garantizado el funcionamiento en arquitecturas anteriores.
- Despliegue: vLLM es el runtime principal y el unico validado. El formato compressed-tensors pack-quantized no es compatible con llama.cpp ni Ollama; el autor menciona que la version GGUF del modelo base (qat-q4_0) es solo para llama.cpp.
- Latencia y throughput: no disponible. No se reportan mediciones de tokens por segundo ni latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|---|
| useful-quants/Gemma-4-26B-A4B-it-W4A16-G64-BF16Vision | 25.8B (4B activos) | 131K validado / 262K arquitectonico | W4A16 G64 | vLLM | Apache-2.0 |
| GotoAI-Inc/gemma-4-26B-A4B-it-W4A16 | 25.8B (4B activos) | no disponible | W4A16 | vLLM | Apache-2.0 |
| google/gemma-4-26B-A4B-it | 25.8B (4B activos) | 262K | BF16 (sin cuantizar) | vLLM, transformers | Apache-2.0 |
| google/gemma-4-26B-A4B-it-qat-q4_0-gguf | 25.8B (4B activos) | no disponible | GGUF Q4_0 | llama.cpp | Apache-2.0 |

La diferencia principal entre este modelo y el GGUF de Google es el runtime: el GGUF es exclusivo de llama.cpp, mientras que esta cuantizacion W4A16 esta pensada para vLLM con kernels Marlin. La version de GotoAI-Inc es una cuantizacion alternativa W4A16 sin el ajuste Heretic ni la calibracion multimodal documentada.

## Limitaciones y advertencias

- Derivado uncensored/abliterated: al ser un checkpoint Heretic, se han eliminado los filtros de seguridad del modelo original. Puede generar contenido ofensivo, ilegal o danino sin restricciones. No es apto para despliegue directo en produccion sin una capa externa de moderacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos con confianza. La calibracion multimodal no elimina este riesgo.
- Limitaciones de contexto: la ventana validada es de 131.072 tokens, pero el limite arquitectonico es de 262.144. Con secuencias largas pueden aparecer degradaciones de calidad o errores de memoria no probados.
- Restricciones de licencia: aunque la licencia es Apache-2.0, se debe revisar el acuerdo de licencia de Gemma 4 de Google (https://ai.google.dev/gemma/docs/gemma_4_license) para confirmar las condiciones de uso comercial y redistribucion.
- Compatibilidad de software: el formato pack-quantized con G64 requiere vLLM con soporte de kernels Marlin Ampere. No funciona en llama.cpp, Ollama ni en versiones antiguas de vLLM. El autor advierte que la validacion se hizo sobre un commit concreto de vLLM.
- Sin benchmarks publicados: no hay evaluaciones comparativas de calidad tras la cuantizacion, por lo que no se puede cuantificar el impacto de la perdida de precision en tareas especificas.
- Sin KV-cache optimizado: el autor no recomienda perfiles de KV-cache de precision reducida, lo que puede limitar el rendimiento en secuencias largas.

## Enlaces

- [HuggingFace: useful-quants/Gemma-4-26B-A4B-it-W4A16-G64-BF16Vision](https://huggingface.co/useful-quants/Gemma-4-26B-A4B-it-W4A16-G64-BF16Vision)
- [Modelo base: Mitchins/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic](https://huggingface.co/Mitchins/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic)
- [Modelo original: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Pagina de Gemma 4 26B A4B en gemma4.wiki](https://www.gemma4.wiki/models/gemma-4-26b-a4b)
- [Receta vLLM de Google/gemma-4-26B-A4B-it](https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it)
- [Documentacion de Gemma 4 en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
