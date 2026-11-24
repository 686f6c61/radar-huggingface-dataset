# tencent/Hy-MT3-7B

## Resumen

Hy-MT3-7B es un modelo de traducción automática multilingüe desarrollado por Tencent, tercera generación de la familia Hy-MT. Forma parte de una release que incluye tres tamanos (1.8B, 7B y 30B-A3B MoE) y amplía la cobertura lingüística de 38 idiomas en Hy-MT2 a 102 idiomas, con un total de 7.504.568.320 parámetros en esta variante densa.

El modelo está disenado específicamente para traducción de alta fidelidad y cumplimiento de restricciones del usuario, no como un LLM de propósito general. Según la model card, reduce en un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones respecto a Hy-MT2 sobre datos de escenarios reales. Además, está optimizado para dos escenarios industriales concretos: localización de videojuegos e traducción de imágenes en cascada con OCR.

Su relevancia actual radica en que compite con APIs comerciales de traducción (iFlytek Translator, Microsoft Translator, Qwen-MT-Flash) y con modelos propietarios de gran tamano, manteniendo una licencia Apache 2.0 permisiva y un tamano que permite despliegue en infraestructura propia. La arquitectura declarada es `hunyuan_v1_dense`, integrada en la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 102 idiomas (zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, yue, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy-MT3-7B emplea una arquitectura transformer densa identificada en `transformers` como `hunyuan_v1_dense`, con 7.504.568.320 parámetros. La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto máxima, por lo que estos datos deben considerarse no disponibles en la información proporcionada.

Respecto a los datos de entrenamiento, la model card menciona que el modelo se ha construido con datos de alta calidad del dominio de videojuegos (procedentes del equipo de Honor of Kings) y que incorpora mejoras en comprensión de contexto y corrección de errores para tolerar fallos de OCR en traducción de imágenes. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La familia Hy-MT3 incluye además una variante MoE (30B-A3B) con 3B parámetros activos, pero esta ficha se centra en la variante densa de 7B. Como innovación destacable, la release incluye TransRubric, una suite de evaluación automática basada en rúbricas que supera a otros esquemas de evaluación en el test set de WMT26 y que alcanza mayor precisión por pares que la mayoría de anotadores profesionales.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares de bajos recursos y traducción mandarín-minoría.
- Seguimiento de instrucciones de traducción (restricciones de estilo, terminología, formato), medido por el benchmark IFMTBench.
- Localización de videojuegos: control de tasa de desviación, errores de placeholder, errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada con OCR: tolerancia a errores de OCR y corrección de contexto.
- Modo de razonamiento (thinking mode) disponible, aunque las comparativas principales de Hy-MT3 se reportan en modo no-thinking.
- Generación de texto orientada a traducción (pipeline `translation`), no orientada a código, matemáticas o agentes.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio nativas: no disponibles; la traducción de imágenes se realiza vía cascada OCR externa.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Localización de videojuegos: el modelo está entrenado con datos del dominio y puede integrarse en el pipeline de desarrollo mediante la herramienta open source TiMiHOKGameTranslator, controlando placeholders, texto enriquecido y terminología específica del juego.
- Traducción de documentación técnica multilingüe: con 102 idiomas y capacidad de seguir restricciones de terminología, es adecuado para mantener glosarios consistentes en manuals y guías de producto.
- Traducción de imágenes en producción: en una arquitectura en cascada (OCR + Hy-MT3-7B), el modelo tolera errores de OCR y corrige el contexto, lo que resulta útil para digitalizar y traducir capturas, carteles o interfaces.
- Atención al cliente multilingüe: traducción de conversaciones en tiempo real entre agentes y clientes en idiomas de bajos recursos (khmer, birmano, cebuano, etc.) donde las APIs comerciales rinden peor.
- Traducción de contenido editorial y marketing: el seguimiento de instrucciones permite imponer tono, registro y restricciones de formato, reduciendo la revisión humana posterior.
- Investigación en traducción automática: al ser Apache 2.0 y estar disponible en safetensors, sirve como baseline reproducible para experimentos con FLORES-200, WMT26 e IFMTBench, y para comparar contra TransRubric.
- Subtitulado y doblaje: traducción de guiones con control de longitud y terminología, aprovechando la cobertura de 102 idiomas para mercados secundarios.

## Benchmarks y rendimiento

La model card referencia resultados agregados (imágenes `main_result.png` y `efficiency.png`) y el informe técnico en arXiv, pero no incluye en el texto tablas numéricas con valores concretos por benchmark. Los benchmarks mencionados son FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611, IFMTBench y VISTA-Bench. Según la model card:

- En traducción general, la familia Hy-MT3 se sitúa en la frontera superior-izquierda de calidad frente a cómputo de inferencia.
- Hy-MT3-30B-A3B (variante MoE) supera en modo no-thinking a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash, y se acerca a GPT-6.1-Sol y Gemini-4-Argon.
- Hy-MT3-1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general.
- Hy-MT3-30B-A3B iguala o supera a Gemini 3.1 Pro en todas las métricas centrales de localización de videojuegos.
- En VISTA-Bench, Hy-MT3 logra el mejor resultado entre modelos de tamano comparable en traducción de imágenes.

No se han publicado en la información disponible valores numéricos desagregados (MMLU, HumanEval, GSM8K u otros) para Hy-MT3-7B; los datos completos deben consultarse en el informe arXiv:2611.27673.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15 GB solo para pesos (7,5B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda 18-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB (siempre que existan pesos cuantizados, dato no confirmado en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 16 GB con cuantización; en GPUs de 8 GB requeriría cuantización agresiva.
- Opciones de despliegue: `transformers` (librería declarada), y por compatibilidad de pesos safetensors, servidores tipo vLLM o TGI; llama.cpp/Ollama requerirían conversión a GGUF, no confirmada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-7B | 7,5B (denso) | no disponible | 102 | Apache 2.0 | Objeto de esta ficha |
| Hy-MT3-1.8B | 1,8B (denso) | no disponible | 102 | Apache 2.0 | Variante ligera; supera a APIs comerciales en traducción general según la model card |
| Hy-MT3-30B-A3B | 30B totales / 3B activos (MoE) | no disponible | 102 | Apache 2.0 | Mejor rendimiento global de la familia en modo no-thinking |
| Hy-MT2-7B | 7B (generación anterior) | no disponible | 38 | Apache 2.0 | Base de comparación: Hy-MT3 reduce errores un 43-74% |
| Qwen-MT-Flash | no disponible | no disponible | no disponible | propietaria | Superado por Hy-MT3-1.8B en traducción general según la model card |
| Microsoft Translator / iFlytek Translator | no disponible | no disponible | no disponible | propietaria (API) | Superados por Hy-MT3-1.8B en traducción general según la model card |

## Limitaciones y advertencias

- Modelo especializado en traducción: no está pensado como LLM de propósito general, por lo que su rendimiento en código, matemáticas o razonamiento abierto no está documentado y probablemente sea limitado.
- Sesgos conocidos: la model card no documenta sesgos específicos; al entrenarse con datos de dominios concretos (videojuegos, web), puede heredar sesgos culturales y de representación.
- Riesgo de alucinación: en traducción, el equivalente es la adición de contenido no presente en el original; la model card reporta una reducción del 74% en omisiones/adiciones frente a Hy-MT2, pero el riesgo persiste y requiere evaluación por muestreo.
- Longitud de contexto no documentada: limita la planificación para documentos largos; conviene trocear entradas y validar empíricamente.
- Cobertura desigual entre los 102 idiomas: los idiomas de bajos recursos (cebuano, waray, gaélico escocés, etc.) tendrán menor calidad que los mayoritarios; la propia model card distingue FLORES-200 low-resource.
- La traducción de imágenes depende de un OCR externo; los errores del OCR pueden propagarse aunque el modelo los tolere parcialmente.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no hay garantías del autor; conviene revisar el informe técnico para cláusulas de responsabilidad.
- Los benchmarks publicados se centran en la variante 30B-A3B y en la 1.8B; los resultados específicos de la variante 7B deben extraerse del informe arXiv, no de la model card.
- Fecha de creación del repositorio (2026-11-17) y actualización (2026-11-24): verificar la versión de pesos antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- TransRubric (suite de evaluación): https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de videojuegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Web oficial de Tencent Hunyuan: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- README en chino: https://huggingface.co/tencent/Hy-MT3-7B/blob/main/README_CN.md
