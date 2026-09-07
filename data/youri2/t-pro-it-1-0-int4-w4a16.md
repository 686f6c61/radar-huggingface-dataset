# Youri2/T-pro-it-1.0-int4-W4A16

## Resumen

El modelo Youri2/T-pro-it-1.0-int4-W4A16 es una cuantización int4 (W4A16) del modelo ruso t-tech/T-pro-it-1.0, un modelo denso de 32.759.790.592 parámetros basado en la arquitectura Qwen2. El desarrollo ha sido realizado por Youri2, y su propósito es reducir el tamaño del modelo original de 62 GB a 18 GB, permitiendo su ejecución en una única GPU de consumo con 32 GB de VRAM, como la RTX 5090. La cuantización se ha realizado con GPTQ y llm-compressor, utilizando un corpus de calibración inusual: aproximadamente 782.000 caracteres de obras de Aleksandr Pushkin, en lugar de los conjuntos de datos en inglés habituales. Esta elección busca concentrar la precisión de los 4 bits en el ruso, lo que según el autor se traduce en una gramática más cuidada en el uso diario de resumen de noticias en ruso. El modelo está pensado para proyectos como TruckerNews, un resumen de noticias por voz para conductores, y se sirve con vLLM. La ventana de contexto configurada en el comando de despliegue es de 8192 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2) |
| Parámetros totales | 32.759.790.592 |
| Longitud de contexto | 8192 tokens (configurado en vLLM; el máximo del modelo base no se especifica) |
| Tipos de cuantización | int4 W4A16 (GPTQ) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 19.2 GB |
| Modelo base | t-tech/T-pro-it-1.0 |

## Arquitectura y entrenamiento

El modelo original t-tech/T-pro-it-1.0 es un transformer denso de 32B basado en la arquitectura Qwen2, sin mezcla de expertos (MoE). La cuantización se ha realizado con el esquema W4A16 (pesos en int4, activaciones en 16 bits) mediante GPTQ y llm-compressor, excluyendo la capa lm_head. El proceso se ejecutó únicamente en CPU (`CUDA_VISIBLE_DEVICES=""`), lo que indica que la calibración no requirió GPU. La innovación técnica destacable es el corpus de calibración: en lugar de usar corpus web en inglés, se utilizaron aproximadamente 782.000 caracteres de literatura clásica rusa (La hija del capitán, Las historias de Belkin, Eugenio Oneguin y poesía de Pushkin). De esta forma, la compensación de errores de redondeo del GPTQ se concentra en el ruso literario. No se mencionan técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en ruso, con especial cuidado en la gramática y el estilo literario gracias a la calibración con Pushkin.
- Resumen y parafraseo de noticias en ruso; es el caso de uso principal en el proyecto TruckerNews.
- Conversación en ruso: el modelo puede mantener diálogos multi-turno dentro de la ventana de 8192 tokens.
- Multilingüismo: el modelo está etiquetado solo con el idioma ruso. No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio. Las capacidades fuera del dominio de calibración (inglés, código) pueden degradarse más de lo habitual en una cuantización W4A16.

## Casos de uso

- Digestos de noticias por voz para conductores: el modelo resume noticias en ruso y las envía a un canal de Telegram con voz, como en el proyecto TruckerNews. Su gramática cuidada y su capacidad para procesar textos largos (hasta 8192 tokens) lo hacen adecuado para generar resúmenes claros que luego se convierten en audio.
- Atención al cliente en ruso: puede gestionar conversaciones multi-turno en un chat de soporte, gracias a su ventana de contexto de 8192 tokens y a su naturaleza generativa. La cuantización permite desplegarlo en una sola GPU de 32 GB, lo que reduce costes de infraestructura.
- Generación de contenido editorial en ruso: creación de artículos, boletines o notas de prensa con un estilo literario y gramaticalmente correcto, aprovechando la calibración con textos de Pushkin.
- Análisis y extracción de información de documentos en ruso: el modelo puede resumir informes, actas o artículos extensos, ya que su ventana de 8192 tokens permite procesar documentos de longitud media sin truncamiento.
- Traducción al ruso: aunque el modelo no está etiquetado como multilingüe, puede utilizarse para reescribir o traducir contenido al ruso, siempre que el texto de entrada esté dentro de su dominio de calibración. Se debe tener precaución con textos en inglés o código, donde la calidad puede verse afectada.
- Despliegue en entornos de producción con vLLM: la cuantización W4A16 es compatible con vLLM, y el modelo alcanza 68-71 tokens/s en una RTX 5090, lo que lo hace viable para aplicaciones en tiempo real como asistentes de voz o chatbots.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor proporciona una comparación de perplejidad entre el modelo original bf16 y la cuantización int4 sobre un subconjunto de Wikipedia en ruso (ventana de 256 tokens, fuera del corpus de calibración), así como una medición de velocidad en vLLM.

| Métrica | bf16 (original) | int4 (este modelo) |
|---|---|---|
| Tamaño de los pesos | 62 GB | 18 GB |
| Perplejidad en Wikipedia rusa (ventana 256, fuera de calibración) | 3.64 | 3.83 (+5 %) |
| Velocidad en RTX 5090 con vLLM 0.20.1 | No disponible | 68-71 tokens/s |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 18 GB, pero para inferencia con vLLM y la ventana de 8192 tokens se necesita una GPU con al menos 32 GB de VRAM. El autor lo ejecuta en una RTX 5090 (32 GB).
- GPU recomendadas: RTX 5090 (32 GB) es la plataforma de referencia. GPU con 32 GB o más, como A100 40GB o H100 80GB, también deberían ser compatibles, aunque no se han probado explícitamente.
- GPU de consumo: sí, cabe en la RTX 5090, que es una GPU de consumo. No se indica si es posible en GPU de 24 GB (RTX 4090) debido a la memoria adicional necesaria para la caché KV.
- Opciones de despliegue: vLLM (probado y recomendado). El formato safetensors y el esquema W4A16/GPTQ permiten usar otros frameworks como TGI o llama.cpp, pero no se ha verificado su funcionamiento en la documentación.
- Latencia y throughput: 68-71 tokens/s en RTX 5090 con vLLM 0.20.1 y --max-model-len 8192.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t-tech/T-pro-it-1.0 (bf16) | Transformer denso (Qwen2) | 32.7B | No especificado (configurado 8192 en vLLM) | Apache-2.0 | HuggingFace |
| Youri2/T-pro-it-1.0-int4-W4A16 | Transformer denso (Qwen2) | 32.7B | 8192 tokens | Apache-2.0 | HuggingFace |

El autor también probó una variante NVFP4, que no funciona en vLLM 0.20.1 para este modelo denso; por lo tanto, no se incluye como opción disponible.

## Limitaciones y advertencias

- La calibración con Pushkin concentra la precisión en ruso literario; las capacidades en inglés, código o dominios técnicos pueden degradarse más de lo habitual en una cuantización W4A16.
- No se han publicado evaluaciones de sesgos o alucinaciones. El corpus de calibración del siglo XIX puede introducir sesgos de estilo, vocabulario y valores históricos.
- La ventana de contexto es de 8192 tokens según el comando de despliegue. No se especifica el máximo real del modelo base; si se necesitan contextos mayores, debe verificarse.
- La cuantización NVFP4 no funciona en vLLM 0.20.1 para este modelo denso (segfault o error en QKVParallelLinear), por lo que se recomienda usar la variante W4A16.
- El modelo está etiquetado únicamente en ruso; no se garantiza un rendimiento adecuado en otros idiomas.
- El proyecto asociado (TruckerNews) tiene licencia Unlicense, pero el modelo en sí está bajo Apache-2.0. No hay restricciones de uso comercial, pero se debe mantener la atribución según la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/Youri2/T-pro-it-1.0-int4-W4A16
- Modelo base: https://huggingface.co/t-tech/T-pro-it-1.0
- Proyecto TruckerNews: https://github.com/Youri2026/TruckerNews
- Canal de Telegram: https://t.me/voice_news_digest
