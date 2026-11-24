# tencent/Hy-MT3-1.8B

## Resumen

Hy-MT3-1.8B es la variante ligera de la tercera generación de la familia de modelos de traducción multilingüe Hy-MT3, desarrollada por Tencent. Es un modelo de traducción automática de 1.791.080.448 parámetros (aproximadamente 1,8B) construido sobre la arquitectura propietaria `hunyuan_v1_dense` y publicado con licencia Apache 2.0. Su propósito es resolver traducción de alta calidad entre 102 idiomas, ampliando la cobertura de 38 idiomas de la generación anterior (Hy-MT2).

La relevancia del modelo reside en su relación calidad-coste: según la model card, supera a APIs comerciales de traducción como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, pese a su reducido tamaño. La familia Hy-MT3 incluye además variantes de 7B y 30B-A3B (MoE), y el modelo se distribuye en formato safetensors para su uso con la librería `transformers`.

El modelo está orientado a escenarios industriales concretos: localización de videojuegos (con datos de dominio del equipo de Honor of Kings y una cadena de herramientas abierta, TiMiHOKGameTranslator) y traducción de imágenes en cascada con OCR, donde tolera mejor los errores de OCR. Se publica junto a TransRubric, una suite de evaluación automática de traducción basada en rúbricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 102 idiomas (zh, en, es, de, fr, it, pt, ru, ja, ko, ar, hi, yue, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy-MT3-1.8B es un transformer denso identificado en la librería `transformers` con el tipo de modelo `hunyuan_v1_dense`, lo que indica una arquitectura derivada de la familia Hunyuan de Tencent. La model card no detalla el número de capas, dimensiones ocultas ni el mecanismo de atención específico. El modelo opera en modo no-thinking por defecto; la familia Hy-MT3 contempla también un modo thinking (usado por modelos comparados en las evaluaciones), pero la información disponible no confirma que la variante 1.8B lo exponga de forma explícita.

La model card indica que el entrenamiento incorpora datos de alta calidad del dominio de videojuegos, construidos con el equipo de Honor of Kings y un sistema de evaluación profesional. También se menciona optimización específica para tolerar errores de OCR en traducción de imágenes en cascada. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Respecto a la generación anterior, Tencent reporta mejoras en datos de escenarios reales: reducción del 43% en muestras con errores de traducción, del 74% en omisiones o adiciones y del 40% en errores de seguimiento de instrucciones.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares de bajos recursos y traducción mandarín⇔minorías.
- Seguimiento de instrucciones de traducción (restricciones del usuario, terminología, formato), evaluado mediante IFMTBench.
- Traducción de dominio de videojuegos: control de tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada con OCR, con corrección de errores de reconocimiento; evaluado en VISTA-Bench.
- Generación de texto como tarea base (`text-generation`), aunque el modelo está especializado en traducción.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.
- No se documenta capacidad de visión, audio ni modo thinking explícito en la variante 1.8B.

## Casos de uso

- Localización de videojuegos: el modelo puede integrarse en la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y descripciones de objetos, con control de placeholders y terminología específica del dominio, gracias a los datos de entrenamiento del equipo de Honor of Kings.
- Traducción de imágenes en producción: en un pipeline OCR → traducción, el modelo tolera errores de OCR y corrige el contexto, lo que lo hace adecuado para traducir capturas de pantalla, cómics o documentación escaneada.
- Traducción de documentación técnica y de producto: con 102 idiomas y capacidad de seguir restricciones de formato y terminología, puede usarse para localizar manuales y fichas de producto manteniendo glosarios.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones de soporte entre idiomas de bajos recursos (por ejemplo, camboyano, birmano, cebuano) que las APIs comerciales cubren con menor calidad.
- Traducción de contenido generado por usuarios: moderación y traducción de comentarios, reseñas y publicaciones en plataformas con audiencias multilingües, aprovechando su tamaño reducido para despliegue con baja latencia.
- Subtitulado y localización de medios: traducción de subtítulos entre pares de idiomas poco comunes (por ejemplo, euskera⇔gaélico escocés o urdu⇔tamil) donde los modelos generalistas suelen fallar.
- Investigación en traducción automática: al ser Apache 2.0 y de 1,8B parámetros, sirve como base para fine-tuning y para reproducir experimentos con TransRubric.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados (imágenes `main_result.png` y `efficiency.png`) pero no tablas con valores numéricos en el texto proporcionado. Se indica cualitativamente que Hy-MT3-1.8B supera a iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, y que la variante 30B-A3B supera a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash en modo no-thinking. Los conjuntos de evaluación mencionados son FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611, IFMTBench y VISTA-Bench, puntuados con TransRubric.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (aproximadamente 3,6 GB) se requieren unos 4-5 GB de VRAM; en fp32, unos 7-8 GB. Las cifras exactas dependen de la implementación y del contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100, H100 o L40S para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no se confirma su disponibilidad en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona que la variante 30B-A3B requiere menos de 1 TFLOP por muestra, pero no se aportan cifras para el 1.8B.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B | 1,79B | 102 | no disponible | Apache 2.0 | Supera a APIs comerciales en traducción general según la model card |
| Hy-MT2-1.8B | no disponible | 38 | no disponible | Apache 2.0 | Generación anterior; menor cobertura de idiomas |
| Qwen-MT-Flash | no disponible | no disponible | no disponible | no disponible | API comercial; superada por Hy-MT3-1.8B según Tencent |
| Microsoft Translator | no disponible | no disponible | no disponible | propietaria | API comercial |
| iFlytek Translator | no disponible | no disponible | no disponible | propietaria | API comercial |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas de código abierto del mismo tamaño.

## Limitaciones y advertencias

- Es un modelo especializado en traducción; su uso como modelo generativo general no está documentado y probablemente rinda por debajo de modelos generalistas del mismo tamaño.
- Riesgo de alucinación y de errores de fidelidad en textos ambiguos, técnicos o con jerga muy específica fuera del dominio de videojuegos.
- La longitud de contexto no está publicada, lo que dificulta planificar el procesamiento de documentos largos.
- No se documentan sesgos lingüísticos, culturales o de género; al entrenarse con datos de Tencent, pueden existir sesgos hacia el chino y el inglés.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los datos de entrenamiento y de las herramientas asociadas (TiMiHOKGameTranslator, TransRubric) antes de integrarlas en producción.
- No se confirma la disponibilidad de cuantizaciones GGUF ni de pesos optimizados para llama.cpp u Ollama; el despliegue estándar es vía `transformers`.
- Las afirmaciones de superioridad frente a APIs comerciales provienen del autor del modelo y no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-1.8B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección Hy-MT3 en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de demostración: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
