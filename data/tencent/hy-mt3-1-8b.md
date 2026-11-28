# tencent/Hy-MT3-1.8B

## Resumen

Hy-MT3-1.8B es la variante ligera de la tercera generación de la familia de modelos de traducción multilingüe Hy-MT de Tencent, publicada junto a sus hermanos Hy-MT3-7B y Hy-MT3-30B-A3B (MoE). El modelo resuelve el problema de la traducción automática de alta calidad en un rango de parámetros que cabe en hardware modesto: con 1.791.080.448 parámetros y pesos en safetensors, está diseñado para despliegues de bajo coste con calidad competitiva frente a APIs comerciales de traducción. Su relevancia actual radica en que amplía la cobertura lingüística de la generación anterior de 38 a 102 idiomas y reduce, según el autor, un 43 % los errores de traducción, un 74 % las omisiones o adiciones y un 40 % los fallos de seguimiento de instrucciones respecto a Hy-MT2.

La arquitectura es un transformer denso identificado internamente como `hunyuan_v1_dense`, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo se distribuye en formato transformers con pesos safetensors y está orientado a la tarea de traducción (pipeline `translation`), no a generación general de texto, aunque técnicamente se etiqueta como `text-generation`.

El contexto de lanzamiento incluye el informe técnico Hy-MT3 (arXiv 2611.27673), la suite de evaluación automática TransRubric, el toolchain de traducción de videojuegos TiMiHOKGameTranslator y una extensión de navegador y apps móviles de traducción de Tencent. La ficha se centra en la variante 1.8B, la más accesible de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 7,2 GB) |
| Idiomas soportados | 102 idiomas, entre ellos zh, en, es, de, fr, it, pt, ru, ja, ko, ar, hi, vi, th, id, ms, tr, nl, pl, uk, ca, gl, eu, yue, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa bajo la implementación `hunyuan_v1_dense` de la librería transformers. No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la presencia de etapas de RLHF o DPO. La model card sí indica que la familia Hy-MT3 se ha construido con datos de alta calidad del dominio de videojuegos (procedentes del equipo de Honor of Kings) y con un sistema de evaluación profesional propio, y que incorpora mejoras de comprensión de contexto y corrección de errores para tolerar fallos de OCR en traducción de imágenes.

La innovación destacable de la generación Hy-MT3 no está en la arquitectura sino en el pipeline de evaluación y en la optimización para escenarios industriales: localización de videojuegos (con métricas de tasa de fuera de objetivo, errores de placeholders, errores de texto enriquecido y errores de terminología) y traducción de imágenes en cascada OCR. El modelo se ejecuta en modo no-thinking según los resultados publicados; no se documenta un modo thinking para esta variante.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares de bajos recursos y mandarín frente a lenguas minoritarias.
- Traducción con seguimiento de instrucciones del usuario (restricciones de estilo, terminología o formato), evaluada mediante IFMTBench.
- Tolerancia a errores de OCR en flujos de traducción de imágenes en cascada.
- Localización de videojuegos con control de placeholders, texto enriquecido y terminología específica del dominio.
- Generación de texto básica (etiqueta `text-generation`), aunque el modelo está optimizado para traducción.
- Integración con el ecosistema transformers y con endpoints compatibles (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión nativa ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede traducir grandes volúmenes de texto entre los 102 idiomas soportados con un coste de inferencia muy bajo gracias a sus 1.8B parámetros, adecuado para pipelines batch nocturnos.
- Localización de videojuegos: integrado en el toolchain TiMiHOKGameTranslator, permite traducir diálogos y textos de interfaz controlando placeholders y texto enriquecido, un escenario para el que el autor declara datos de entrenamiento específicos del dominio.
- Traducción de imágenes en cascada OCR: el modelo tolera errores de OCR y corrige el contexto, por lo que encaja en flujos de traducción de capturas, cómics o documentos escaneados.
- Atención al cliente multilingüe: puede traducir mensajes entrantes y salientes en tiempo real en un servicio de soporte, con latencia baja al ejecutarse en una sola GPU consumer.
- Traducción de contenido web y extensiones de navegador: es la base tecnológica declarada de la extensión Tencent Hy Translate, por lo que es adecuado para traducción de selección, página completa y panel lateral.
- Subtitulado y transcripción multilingüe: combinado con un sistema ASR, puede traducir subtítulos a decenas de idiomas en un pipeline de bajo coste.
- Preprocesamiento multilingüe para otros modelos: normalización y traducción de corpus antes de alimentar modelos mayores o sistemas de recuperación (RAG) multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos desglosados para Hy-MT3-1.8B en la información disponible. La model card indica de forma cualitativa que Hy-MT3-1.8B supera a APIs comerciales de traducción como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, y que la familia se evalúa sobre FLORES-200, FLORES-200 low-resource, WMT26, WildMTBench-202611 e IFMTBench con la suite TransRubric. Los valores concretos no se proporcionan en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en fp16; para despliegue de alta concurrencia se recomienda A100, H100 o L40S.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI para serving de alto throughput, llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas oficialmente).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-1.8B | 1,79B | no disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT3-7B | 7B (no confirmado en detalle) | no disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | no disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-1.8B | 1,8B | no disponible | 38 | Apache 2.0 | Hugging Face, ModelScope |

La comparativa de rendimiento frente a APIs comerciales (iFlytek Translator, Microsoft Translator, Qwen-MT-Flash) se menciona cualitativamente en la model card, pero sin cifras disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; en traducción puede manifestarse como adiciones o sustituciones de contenido, aunque el autor declara una reducción del 74 % en omisiones y adiciones respecto a Hy-MT2.
- La longitud de contexto no está publicada, lo que impide garantizar el comportamiento en documentos largos sin pruebas propias.
- El modelo está optimizado para traducción; su uso como modelo generativo general no está respaldado por evaluaciones públicas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones de los datos de entrenamiento subyacentes, no detalladas en la información disponible.
- Para producción en dominios especializados (legal, médico, financiero) se recomienda evaluación propia, dado que los benchmarks publicados se centran en traducción general, videojuegos e imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy-MT3-1.8B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico Hy-MT3: https://arxiv.org/pdf/2611.27673
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Web oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
