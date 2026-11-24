# tencent/Hy-MT3-1.8B-GGUF

## Resumen

Hy-MT3-1.8B-GGUF es la versión cuantizada en formato GGUF del modelo de traducción automática Hy-MT3-1.8B, desarrollado por Tencent dentro de su familia Hy (Hunyuan). Se trata de la tercera generación de su línea de modelos dedicados a traducción multilingüe, que amplía la cobertura desde los 38 idiomas de Hy-MT2 hasta 102 idiomas. El modelo base cuenta con 1.791.080.448 parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de centro de datos. Según la model card, el modelo de 1.8B supera a APIs comerciales de traducción como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, y está optimizado específicamente para dos escenarios industriales: localización de videojuegos y traducción de imágenes en cascada con OCR.

La familia Hy-MT3 incluye tres tamaños (1.8B, 7B y 30B-A3B MoE) y viene acompañada de TransRubric, una suite de evaluación automática basada en rúbricas publicada en abierto. El modelo está etiquetado como compatible con endpoints y orientado a conversación, con pipeline de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción; detalles en el informe arXiv:2611.27673) |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no aplica (no es MoE; el miembro MoE de la familia es Hy-MT3-30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones múltiples; el repo incluye ficheros GGUF con imatrix) |
| Idiomas soportados | 102 idiomas (según la model card de la familia; el listado concreto no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,3 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones ocultas ni mecanismo de atención). Se sabe que pertenece a la tercera generación de la familia Hy-MT y que el informe técnico está publicado en arXiv (2611.27673), donde se recogen los detalles de entrenamiento y análisis experimental. La model card menciona que el modelo está optimizado para seguir restricciones del usuario (constraints) y que, frente a Hy-MT2, reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones en datos de escenarios reales.

El entrenamiento incorpora datos de dominio específicos de videojuegos, construidos con el equipo de Honor of Kings, y un sistema de evaluación profesional propio. También se ha optimizado para tolerar errores de OCR en pipelines de traducción de imágenes en cascada. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La versión GGUF incluye ficheros generados con imatrix, lo que sugiere un proceso de cuantización con matriz de importancia para preservar calidad.

## Capacidades

- Traducción automática multilingüe en 102 idiomas, con especial énfasis en precisión, completitud y fidelidad a las restricciones del usuario.
- Traducción de chino mandarín hacia y desde lenguas minoritarias, evaluada en el conjunto Mandarin⇔Minority.
- Seguimiento de instrucciones de traducción (evaluado con IFMTBench), incluyendo restricciones de terminología y formato.
- Localización de videojuegos: métricas específicas de tasa de fuera de objetivo (off-target), errores de placeholders, errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada OCR: tolerancia y corrección de errores de OCR, con resultados destacados en VISTA-Bench.
- Modo conversacional (etiqueta `conversational`) y compatibilidad con endpoints.
- No se menciona soporte de tool calling, agentes, visión nativa, audio ni modo thinking en la información disponible para esta variante.

## Casos de uso

- Localización de videojuegos: el modelo se integra en la cadena de herramientas TiMiHOKGameTranslator y está entrenado con datos de dominio de Honor of Kings, lo que permite traducir diálogos, textos de interfaz y descripciones de objetos preservando placeholders, texto enriquecido y terminología propia del juego.
- Traducción de imágenes en producción: al tolerar errores de OCR, puede colocarse detrás de un pipeline OCR para traducir capturas de pantalla, documentos escaneados o interfaces gráficas sin que los fallos de reconocimiento de caracteres degraden la salida.
- Traducción de documentación técnica y manuales: con 102 idiomas y capacidad de seguir restricciones de terminología, es adecuado para mantener glosarios consistentes en documentación multilingüe.
- Atención al cliente multilingüe: la etiqueta conversacional y la orientación a instrucciones permiten traducir conversaciones multi-turno en soporte, moderación o chats de comercio electrónico.
- Despliegue en edge o en máquinas sin GPU dedicada: al estar en GGUF y pesar 3,3 GB, puede ejecutarse con llama.cpp u Ollama en portátiles y servidores modestos, útil para traducción offline o en entornos con requisitos de privacidad.
- Traducción de contenidos editoriales y subtítulos: la mejora en completitud (74% menos omisiones/adiciones) lo hace apropiado para subtitulado y artículos donde la fidelidad al original es crítica.
- Evaluación automática de traducciones: combinado con TransRubric, puede formar parte de pipelines de control de calidad para comparar candidatos de traducción.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados (main_result.png y efficiency.png) pero no tablas numéricas textuales. Los datos cualitativos disponibles son:

| Afirmacion | Dato |
|---|---|
| Mejora vs Hy-MT2 en errores de traducción | -43% en datos de escenarios reales |
| Mejora vs Hy-MT2 en omisiones/adiciones | -74% |
| Mejora vs Hy-MT2 en seguimiento de instrucciones | -40% |
| Comparativa con APIs comerciales | Supera a iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general (según el autor) |
| Conjuntos de evaluación | FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611, IFMTBench, VISTA-Bench |
| Miembro de la familia destacado | Hy-MT3-30B-A3B obtiene el mejor rendimiento global en modo no-thinking entre los modelos evaluados, según el autor |

No se han publicado en la información disponible cifras numéricas desglosadas por benchmark para la variante 1.8B. Para resultados detallados debe consultarse el informe arXiv:2611.27673.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4, aproximadamente 1,2-1,5 GB; con Q8, en torno a 2-2,5 GB; en FP16, unos 3,6 GB. El repo GGUF ocupa 3,3 GB e incluye varias cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en toda la gama RTX y en muchas iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere integración con APIs tipo OpenAI). El modelo base en safetensors y la variante FP8 permiten vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-GGUF | 1,8B | no disponible | 102 | Apache 2.0 | GGUF |
| Hy-MT3-1.8B | 1,8B | no disponible | 102 | Apache 2.0 | safetensors |
| Hy-MT3-1.8B-FP8 | 1,8B | no disponible | 102 | Apache 2.0 | FP8 |
| Hy-MT3-7B | 7B | no disponible | 102 | Apache 2.0 | safetensors |
| Hy-MT3-30B-A3B | 30B (3B activos) | no disponible | 102 | Apache 2.0 | safetensors |

No se dispone en la información proporcionada de datos comparativos numéricos frente a modelos de traducción de otros fabricantes (por ejemplo, NLLB, M2M-100 o Qwen-MT), salvo la afirmación cualitativa de que el 1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general. Los datos de rendimiento comparativo completos están en el informe arXiv.

## Limitaciones y advertencias

- No se detallan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación y de traducciones inventadas: aunque la model card reporta una reducción del 74% en omisiones/adiciones frente a Hy-MT2, sigue siendo un riesgo inherente a los modelos generativos.
- La lista completa de los 102 idiomas no está publicada en la información disponible; la cobertura real por par de idiomas puede variar.
- Longitud de contexto no especificada: conviene validar el comportamiento en documentos largos antes de usarlo en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las condiciones de los datos de entrenamiento y de las herramientas asociadas (TiMiHOKGameTranslator, TransRubric) por si tuvieran licencias distintas.
- Las cuantizaciones GGUF pueden degradar ligeramente la calidad respecto al modelo en FP16; para producción sensible a calidad se recomienda validar con TransRubric.
- El rendimiento en dominios muy especializados (legal, médico) no está documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Variante FP8: https://huggingface.co/tencent/Hy-MT3-1.8B-FP8
- Modelo 7B: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial (Tencent AI Studio): https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
