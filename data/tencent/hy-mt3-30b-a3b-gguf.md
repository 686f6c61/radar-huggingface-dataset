# tencent/Hy-MT3-30B-A3B-GGUF

## Resumen

Hy-MT3-30B-A3B es la tercera generación de la familia de modelos de traducción multilingüe Hy de Tencent, publicada bajo licencia Apache 2.0. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3B parámetros activos por token, diseñado específicamente para traducción automática. Esta ficha corresponde a la variante cuantizada en formato GGUF del modelo base `tencent/Hy-MT3-30B-A3B`, publicada el 17 de noviembre de 2026 y actualizada el 24 de noviembre de 2026.

El modelo amplía la cobertura lingüística de las 38 lenguas de Hy-MT2 hasta 102 lenguas y, según la model card, reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones respecto a la generación anterior sobre datos de escenarios reales. Con solo 3B parámetros activos, Tencent afirma que alcanza el mejor rendimiento global entre los modelos evaluados en modo no-thinking, incluyendo modelos insignia como Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash.

La relevancia de esta variante GGUF radica en que permite desplegar un modelo de traducción de 30B totales en infraestructura de inferencia basada en llama.cpp, con cuantizaciones que reducen el peso en disco y VRAM respecto a los pesos completos, manteniendo el pipeline de traducción y la compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; no se detalla la configuración interna de expertos en la información disponible |
| Parametros totales | 30.064.725.888 |
| Parametros activos | aproximadamente 3B (denominación 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la información disponible); el repositorio incluye ficheros con imatrix |
| Idiomas soportados | 102 lenguas según la model card; el listado concreto no está disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 65,4 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura Mixture of Experts con 30.064.725.888 parámetros totales y aproximadamente 3B parámetros activos por token, lo que sitúa su coste de inferencia muy por debajo de lo que sugiere el tamaño total. La model card indica que el modelo requiere menos de 1 TFLOP por muestra en traducción general y supera a modelos que consumen más de 30 veces su cómputo de inferencia, como Qwen3.8-Max y Kimi-K3.1-Pro en modo no-thinking.

El entrenamiento incorpora datos de dominio de videojuegos de alta calidad y un sistema de evaluación profesional del equipo de Honor of Kings, además de optimizaciones específicas para tolerancia a errores de OCR en traducción de imágenes en cascada. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La familia incluye tres tamaños (1.8B, 7B y 30B-A3B) y se publica junto con TransRubric, una suite de evaluación automática basada en rúbricas que, según Tencent, supera a otros esquemas de evaluación en el test set de la tarea compartida de métricas de WMT26.

## Capacidades

- Traducción automática multilingüe en 102 lenguas, con mejora declarada en precisión, completitud y fidelidad a las restricciones del usuario respecto a Hy-MT2.
- Seguimiento de instrucciones de traducción (evaluado con IFMTBench), incluyendo restricciones de estilo, terminología y formato.
- Localización de videojuegos: métricas de tasa de fuera de objetivo, errores de placeholders, errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada con OCR, con tolerancia a errores de OCR y corrección contextual (evaluado en VISTA-Bench).
- Modo thinking y modo no-thinking; los resultados destacados de la model card corresponden al modo no-thinking.
- Conversacional: la etiqueta `conversational` del repositorio indica soporte de interacción multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión nativa ni audio.

## Casos de uso

- Localización de videojuegos: el modelo se entrenó con datos del dominio y puede integrarse en el pipeline de desarrollo mediante la herramienta open source TiMiHOKGameTranslator, controlando placeholders, texto enriquecido y terminología específica del título.
- Traducción de documentación técnica multilingüe: con 102 lenguas y seguimiento de instrucciones, permite fijar glosarios y restricciones de formato por proyecto y aplicar el modelo por lotes sobre ficheros Markdown o HTML.
- Traducción de imágenes en producción: en una arquitectura en cascada OCR → traducción, el modelo tolera errores de reconocimiento y corrige el contexto, lo que lo hace adecuado para digitalización de manuales, carteles o capturas de interfaz.
- Atención al cliente multilingüe: la etiqueta conversacional y el soporte de 102 lenguas permiten traducir conversaciones multi-turno entre agentes y usuarios; la longitud de contexto no está documentada, por lo que debe validarse empíricamente antes de desplegar.
- Traducción de contenidos editoriales con restricciones: el modo no-thinking y el seguimiento de instrucciones permiten imponer tono, longitud y terminología, con evaluación automática mediante TransRubric antes de publicar.
- Despliegue en infraestructura limitada: la variante GGUF con cuantización permite ejecutar el modelo en llama.cpp u Ollama sin GPUs de centro de datos, manteniendo el pipeline de traducción del modelo base.
- Evaluación y control de calidad de traducciones: TransRubric, publicada junto al modelo, permite puntuar salidas de forma automática y comparar variantes de cuantización o configuración de decodificación.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados (imágenes `main_result.png` y `efficiency.png`) pero no tablas con valores numéricos en el texto proporcionado. Los conjuntos de evaluación citados son FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611, IFMTBench y VISTA-Bench.

| Benchmark | Resultado |
|---|---|
| FLORES-200 / FLORES-200 low-resource / WMT26 / Mandarin⇔Minority (media, traducción general) | no disponible en valores numéricos; evaluado con TransRubric |
| WildMTBench-202611 | no disponible en valores numéricos; evaluado con TransRubric |
| IFMTBench | no disponible en valores numéricos |
| VISTA-Bench | no disponible en valores numéricos; mejor resultado declarado entre modelos de tamaño comparable |
| Métricas de localización de videojuegos (Honor of Kings) | no disponible en valores numéricos; iguala o supera a Gemini 3.1 Pro en todas las métricas core según el autor |

No se han publicado resultados de benchmarks en valores numéricos en la información disponible.

## Requisitos de hardware

- El repositorio GGUF ocupa 65,4 GB, lo que sugiere múltiples variantes de cuantización; el tamaño de cada fichero no está detallado en la información disponible.
- VRAM estimada: no disponible de forma exacta. Como referencia, una cuantización de 4 bits de un modelo de 30B totales requiere del orden de 17-20 GB solo para pesos, más overhead de contexto y caché KV; una de 8 bits, del orden de 32-35 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un modelo de 30B en cuantización baja puede caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto reducido, y con más holgura en A100 40/80 GB, H100 y RTX 6000 Ada.
- Despliegue: llama.cpp y Ollama son los entornos naturales para GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. vLLM y TGI no se citan en la información disponible para esta variante.
- Latencia y throughput: no disponibles. La model card indica que el modelo requiere menos de 1 TFLOP por muestra en traducción general, pero no publica tokens por segundo.
- El repositorio incluye ficheros con `imatrix`, lo que permite cuantizaciones con matriz de importancia para preservar calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (esta ficha) | 30B totales / ~3B activos | no disponible | 102 | Apache 2.0 | GGUF, safetensors |
| Hy-MT3-7B | 7B | no disponible | 102 (misma familia) | Apache 2.0 | safetensors, FP8, GGUF |
| Hy-MT3-1.8B | 1.8B | no disponible | 102 (misma familia) | Apache 2.0 | safetensors, FP8, GGUF |
| Hy-MT2-30B-A3B | 30B totales / ~3B activos | no disponible | 38 | no disponible en la información | no disponible en la información |

La model card compara cualitativamente con Qwen3.8-Max, Kimi-K3.1-Pro, DeepSeek-V4.1-Flash, GPT-6.1-Sol, Gemini-4-Argon, Gemini 3.1 Pro, iFlytek Translator, Microsoft Translator y Qwen-MT-Flash, pero sin tablas numéricas en la información proporcionada. No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos lingüísticos, culturales o de dominio; deben evaluarse antes de uso en producción.
- Riesgo de alucinación y de omisiones o adiciones en la traducción: la model card reporta reducciones del 43% y 74% respecto a Hy-MT2, lo que implica que estos errores siguen existiendo.
- La cobertura de 102 lenguas no garantiza calidad homogénea; la model card distingue explícitamente entre lenguas de recursos altos y bajos (FLORES-200 low-resource), por lo que conviene validar por par de lenguas.
- La longitud de contexto no está documentada; planificar el despliegue sin asumir ventanas largas.
- El modo thinking consume más tokens y cómputo; los resultados destacados corresponden al modo no-thinking.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los datos de entrenamiento, no detalladas en la información disponible.
- Las cuantizaciones GGUF pueden degradar la calidad respecto a los pesos completos; se recomienda evaluar cada variante con TransRubric antes de desplegarla.
- El modelo está especializado en traducción; no debe asumirse un rendimiento equivalente al de un modelo generalista en razonamiento, código o matemáticas.
- La información de benchmarks disponible son gráficos sin valores numéricos; no se deben citar cifras concretas sin consultar el informe técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de videojuegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de Hy: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
