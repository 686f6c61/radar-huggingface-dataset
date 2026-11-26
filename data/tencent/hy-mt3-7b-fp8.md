# tencent/Hy-MT3-7B-FP8

## Resumen

Hy-MT3-7B-FP8 es la versión cuantizada en FP8 del modelo de traducción multilingüe Hy-MT3-7B, desarrollado por Tencent dentro de su familia Hy (Hunyuan). Forma parte de la tercera generación de modelos de traducción de la compañía, que incluye tres tamaños (1.8B, 7B y 30B-A3B) y amplía la cobertura lingüística de 38 idiomas en Hy-MT2 hasta 102 idiomas. El modelo resuelve el problema de la traducción automática de alta calidad con fidelidad a las restricciones del usuario, y su relevancia radica en que compite con APIs comerciales y modelos de referencia mucho más grandes.

La arquitectura es un transformer denso identificado como `hunyuan_v1_dense`, con 7.504.568.320 parámetros totales (aproximadamente 7,5 mil millones). Los pesos se distribuyen en formato safetensors con cuantización FP8 mediante la librería `compressed-tensors`, lo que reduce el tamaño del repositorio a unos 8,0 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

El modelo se publicó el 17 de noviembre de 2026 y se actualizó el 26 de noviembre de 2026. Está optimizado para dos escenarios industriales concretos: la localización de videojuegos (con datos de dominio del equipo de Honor of Kings) y la traducción de imágenes en cascada con OCR. Según la model card, en datos de escenarios reales reduce las traducciones erróneas un 43%, las omisiones o adiciones un 74% y los errores de seguimiento de instrucciones un 40% respecto a Hy-MT2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) |
| Parámetros totales | 7.504.568.320 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | 102 idiomas (según la familia Hy-MT3); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización FP8 vía compressed-tensors) |

## Arquitectura y entrenamiento

Hy-MT3-7B-FP8 es una versión cuantizada del modelo base Hy-MT3-7B, que emplea una arquitectura transformer densa (`hunyuan_v1_dense`). La cuantización FP8 se implementa mediante `compressed-tensors`, un formato que permite almacenar y ejecutar los pesos en precisión de 8 bits manteniendo la estructura del modelo original. El repositorio ocupa 8,0 GB, coherente con 7,5 mil millones de parámetros en FP8 más metadatos.

La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset. Sí indica que el entrenamiento incorpora datos de alta calidad del dominio de videojuegos, construidos junto con el equipo de Honor of Kings y acompañados de un sistema de evaluación profesional. También se menciona una mejora en la tolerancia a errores de OCR para traducción de imágenes en cascada. No se especifica si se aplicaron técnicas de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal. La familia Hy-MT3 incluye un modo "thinking" (razonamiento) y un modo "non-thinking"; los resultados destacados del modelo se reportan en modo non-thinking.

## Capacidades

- Traducción automática multilingüe en 102 idiomas, con mejora en fidelidad a restricciones del usuario (instrucciones de traducción).
- Traducción de textos generales, con resultados que superan a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en el modelo ligero de la familia.
- Localización de videojuegos: manejo de marcadores de posición (placeholders), texto enriquecido y terminología específica del dominio.
- Traducción de imágenes en cascada con OCR: tolerancia a errores de OCR y corrección contextual.
- Seguimiento de instrucciones de traducción (evaluado con IFMTBench).
- Modo thinking y modo non-thinking (el modo thinking consume más cómputo de inferencia).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o multi-step reasoning general, ni visión o audio nativos más allá del pipeline de traducción de imágenes vía OCR.

## Casos de uso

- Localización de videojuegos: el modelo se integra en pipelines de desarrollo mediante la herramienta open source TiMiHOKGameTranslator, gestionando placeholders, texto enriquecido y terminología del dominio con datos entrenados por el equipo de Honor of Kings.
- Traducción de documentación técnica multilingüe: con 102 idiomas y seguimiento de instrucciones, puede traducir manuales y guías manteniendo terminología consistente mediante restricciones explícitas en el prompt.
- Traducción de imágenes en producción: en una arquitectura en cascada OCR + traducción, el modelo tolera errores de OCR y corrige el contexto, lo que lo hace adecuado para digitalizar carteles, capturas de pantalla o documentos escaneados.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes en 102 idiomas, con fidelidad a restricciones de tono o formato.
- Evaluación automática de traducciones: junto con la suite TransRubric publicada por el mismo equipo, el modelo puede emplearse para generar traducciones de referencia o para comparar sistemas en tareas de métricas WMT26.
- Traducción de contenido web y extensiones de navegador: el modelo respalda la extensión Tencent Hy Translate (Chrome y Edge) para traducción por selección, de página completa y de panel lateral.
- Subtitulado y localización de contenido audiovisual: traducción de guiones y subtítulos con control de formato y terminología, adecuada para plataformas de contenido.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados (`main_result.png` y `efficiency.png`) pero no proporciona una tabla numérica con valores concretos de MMLU, HumanEval, GSM8K ni métricas de traducción por conjunto de datos. Los datos cualitativos disponibles son:

- En datos de escenarios reales, reducción del 43% en muestras con traducciones erróneas, 74% en omisiones o adiciones y 40% en errores de seguimiento de instrucciones respecto a Hy-MT2.
- Hy-MT3-30B-A3B (el modelo MoE de la familia, no esta variante de 7B) logra el mejor rendimiento global en modo non-thinking entre los modelos evaluados, incluyendo Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash, y se acerca a modelos cerrados con thinking como GPT-6.1-Sol y Gemini-4-Argon.
- Hy-MT3-1.8B supera a APIs comerciales de traducción en traducción general.
- Hy-MT3-30B-A3B iguala o supera a Gemini 3.1 Pro en métricas de localización de videojuegos (tasa de fuera de objetivo, errores de placeholder, errores de texto enriquecido y errores de terminología).
- En VISTA-Bench, la familia Hy-MT3 obtiene el mejor resultado entre modelos de tamaño comparable en traducción de imágenes.

No se han publicado resultados numéricos de benchmarks en la información disponible para esta variante concreta de 7B en FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7,5 mil millones de parámetros en FP8, los pesos ocupan aproximadamente 8 GB. Con overhead de activaciones y caché KV, se estiman entre 10 y 16 GB de VRAM para inferencia en FP8, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: para FP8 nativo, GPU con soporte de FP8 como NVIDIA H100, H200, L40S o A100 (con conversión). Para consumer, RTX 4090 (24 GB) puede alojar el modelo en FP8 con margen; RTX 4080/4070 Ti Super (16 GB) podría ser ajustado según contexto.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más de VRAM en FP8; en cuantizaciones menores (no incluidas en este repo) cabría en 12 GB o menos.
- Opciones de despliegue: vLLM y TGI soportan `compressed-tensors` FP8; llama.cpp y Ollama requerirían una conversión a GGUF no incluida en este repositorio. También es posible usar Transformers con `compressed-tensors`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-7B-FP8 | 7,5B (denso) | No disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT3-1.8B | 1,8B (denso) | No disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | No disponible | 102 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-7B (generación anterior) | 7B (denso) | No disponible | 38 | Apache 2.0 | Hugging Face, ModelScope |

La comparativa con modelos de otras familias (Qwen-MT-Flash, APIs comerciales como Microsoft Translator o iFlytek Translator) solo está disponible de forma cualitativa en la model card, sin cifras concretas para esta variante de 7B. No se dispone de datos numéricos comparativos suficientes para una tabla cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con datos de Tencent y de dominio de videojuegos, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: aunque es un modelo de traducción, puede generar contenido no presente en el texto original (adiciones) o omitir fragmentos; la model card reporta mejoras frente a Hy-MT2, pero no elimina el riesgo.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; la lista completa de los 102 idiomas no está publicada en la información disponible. El rendimiento en idiomas de bajos recursos puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: la cuantización FP8 puede introducir una ligera degradación de calidad frente al modelo base en BF16; conviene validar con TransRubric o con conjuntos propios antes de desplegar. El modelo está optimizado para traducción, no para tareas generales de razonamiento o generación abierta.
- El modo thinking consume más cómputo de inferencia; los resultados destacados se reportan en modo non-thinking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B-FP8
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección Hy-MT3 en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de videojuegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- Modelo Hy-MT3-1.8B: https://huggingface.co/tencent/Hy-MT3-1.8B
