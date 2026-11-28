# tencent/Hy-MT3-1.8B-GGUF

## Resumen

Hy-MT3-1.8B-GGUF es la versión cuantizada en formato GGUF del modelo de traducción automática Hy-MT3-1.8B, desarrollado por Tencent dentro de su familia Hy-MT3 (tercera generación de modelos de traducción multilingüe Hunyuan). El modelo resuelve el problema de traducción automática multilingüe de alta calidad en un tamaño compacto: con 1.791.080.448 parámetros (aproximadamente 1,8B), cubre 102 idiomas, ampliando los 38 de la generación anterior Hy-MT2.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter. Según la model card, el modelo de 1.8B supera a APIs comerciales de traducción como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, lo que lo posiciona como una alternativa local viable frente a servicios en la nube.

El modelo está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y forma parte de un ecosistema más amplio que incluye variantes de 7B y 30B-A3B (MoE), además de la suite de evaluación TransRubric y la herramienta de traducción de videojuegos TiMiHOKGameTranslator.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de traducción; detalles específicos de arquitectura no disponibles en la información proporcionada) |
| Parametros totales | 1.791.080.448 (aproximadamente 1,8B) |
| Parametros activos | No aplica (no es MoE en esta variante) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no detalladas; el repo incluye ficheros GGUF con imatrix) |
| Idiomas soportados | 102 idiomas (según la model card de la familia Hy-MT3) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,3 GB); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna específica del modelo (tipo de atención, número de capas, dimensiones ocultas ni configuración exacta del transformer). Se sabe que Hy-MT3 es la tercera generación de la familia de traducción multilingüe de Tencent y que incluye tres tamaños: 1.8B, 7B y 30B-A3B (MoE). Esta variante de 1.8B es un modelo denso, no MoE.

En cuanto a entrenamiento, la model card menciona que Hy-MT3 está optimizado con datos de alta calidad del dominio de videojuegos (en colaboración con el equipo de Honor of Kings) y con un sistema de evaluación profesional. También se menciona mejora en comprensión de contexto y corrección de errores para tolerar errores de OCR en traducción de imágenes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La versión GGUF incluye el tag `imatrix`, lo que indica que las cuantizaciones se generaron usando una matriz de importancia para preservar calidad.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, con especial énfasis en traducción general, traducción de chino a lenguas minoritarias y traducción de recursos bajos.
- Traducción con seguimiento de instrucciones (instruction-following), medida por el benchmark IFMTBench; según la model card, los errores de seguimiento de instrucciones se reducen un 40% frente a Hy-MT2.
- Traducción de imágenes en cascada con OCR, tolerando errores de OCR gracias a mejoras en comprensión de contexto y corrección de errores.
- Localización de videojuegos: métricas específicas como tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Formato conversacional (tag `conversational`), lo que permite uso en interfaces de chat o pipelines conversacionales.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- No se mencionan capacidades de tool calling, agentes, visión nativa ni audio en la información disponible.

## Casos de uso

- Traducción automática local en producción: el modelo puede desplegarse con llama.cpp u Ollama en servidores sin GPU de datacenter, traduciendo texto entre los 102 idiomas soportados con calidad superior a APIs comerciales según la model card, lo que reduce costes y dependencia de servicios externos.
- Localización de videojuegos: integrable en el pipeline de desarrollo mediante la herramienta TiMiHOKGameTranslator, el modelo maneja terminología específica, marcadores y texto enriquecido, con métricas que igualan o superan a modelos cerrados como Gemini 3.1 Pro en los indicadores clave del dominio.
- Traducción de imágenes en cascada OCR: el modelo tolera errores de OCR y mejora la corrección de contexto, lo que lo hace adecuado para digitalizar y traducir documentos escaneados, capturas de pantalla o interfaces de usuario.
- Traducción de documentación técnica y manuales: con 102 idiomas y seguimiento de instrucciones, puede aplicarse a la localización de documentación con restricciones de terminología y estilo, usando el modo conversacional para mantener consistencia entre segmentos.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones en tiempo real en sistemas de soporte, gracias a su formato conversacional y su tamaño compacto que permite baja latencia en CPU o GPU de consumo.
- Investigación en traducción automática: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos de cuantización, evaluación con TransRubric y comparación con modelos de mayor tamaño en entornos con recursos limitados.
- Extensiones de navegador y aplicaciones de escritorio: el tamaño de 1,8B y el formato GGUF permiten integraciones ligeras, como la extensión Tencent Hy Translate, para traducción de selección, página completa o panel lateral.

## Benchmarks y rendimiento

La model card menciona resultados comparativos, pero los valores numéricos concretos no están disponibles en el texto proporcionado (las figuras `main_result.png` y `efficiency.png` contienen los datos, pero no se han extraído). Se indica cualitativamente que:

- Hy-MT3-1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general.
- Hy-MT3-30B-A3B logra el mejor rendimiento global entre los modelos evaluados en modo no-thinking, incluyendo Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash, y se acerca a modelos cerrados con thinking como GPT-6.1-Sol y Gemini-4-Argon.
- En localización de videojuegos, Hy-MT3-30B-A3B iguala o supera a Gemini 3.1 Pro en todas las métricas clave.
- En VISTA-Bench (traducción de imágenes), Hy-MT3 logra el mejor resultado entre modelos de tamaño comparable.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1,8B en GGUF, las cuantizaciones típicas de 4 bits ocupan aproximadamente 1-1,5 GB, y las de 8 bits alrededor de 2 GB; el repo completo pesa 3,3 GB, lo que sugiere que incluye varias cuantizaciones.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090; también puede ejecutarse en CPU gracias al formato GGUF.
- Cabe en consumer GPU: sí, en la mayoría de GPUs con 4 GB o más de VRAM para cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy-MT3-1.8B-GGUF | 1,8B | No disponible | 102 | Apache 2.0 | GGUF | Supera a APIs comerciales en traducción general según la model card |
| Hy-MT3-7B | 7B | No disponible | 102 | Apache 2.0 | No disponible | Variante mayor de la misma familia |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | No disponible | 102 | Apache 2.0 | No disponible | Mejor rendimiento global en modo no-thinking según la model card |
| Hy-MT2-1.8B | 1,8B | No disponible | 38 | No disponible | No disponible | Generación anterior; Hy-MT3 reduce errores un 43-74% |

No se dispone de datos numéricos de rendimiento ni de comparativas detalladas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos web y de dominio, puede heredar sesgos presentes en esos corpus.
- Riesgo de alucinación: en tareas de traducción, el riesgo se manifiesta como mistraducciones, omisiones o adiciones; la model card indica que Hy-MT3 reduce estos errores frente a Hy-MT2, pero no los elimina.
- Limitaciones de contexto o idioma: aunque cubre 102 idiomas, el rendimiento puede variar en lenguas de recursos bajos; la longitud de contexto no está especificada, lo que limita la planificación para documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento y de las herramientas asociadas (TransRubric, TiMiHOKGameTranslator) por si tuvieran licencias distintas.
- Caveats para producción: las cuantizaciones GGUF pueden degradar ligeramente la calidad frente al modelo base en safetensors; se recomienda validar con TransRubric o con un conjunto propio antes de desplegar. Además, el modelo está especializado en traducción, por lo que no debe esperarse un rendimiento generalista en otras tareas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/Hy-MT3-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
