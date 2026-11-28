# tencent/Hy-MT3-7B-GGUF

## Resumen

Hy-MT3-7B-GGUF es la versión cuantizada en formato GGUF del modelo de traducción multilingüe Hy-MT3-7B, desarrollado por Tencent dentro de su familia Hy (Hunyuan). Se trata de la tercera generación de su familia de modelos especializados en traducción, que amplía la cobertura lingüística de las 38 lenguas de Hy-MT2 hasta 102 lenguas. El modelo resuelve el problema de la traducción automática de alta calidad con seguimiento estricto de instrucciones, un aspecto crítico en entornos industriales donde las restricciones de formato, terminología y marcadores de posición deben respetarse de forma literal.

El modelo base cuenta con 7.504.568.320 parámetros (aproximadamente 7,5 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Esta variante GGUF está pensada para inferencia eficiente en hardware de consumo y en entornos sin GPU dedicada, manteniendo la arquitectura y capacidades del modelo original. La relevancia actual del modelo radica en su enfoque en dos escenarios industriales concretos: la localización de videojuegos y la traducción de imágenes en cascada con OCR, además de su rendimiento declarado frente a APIs comerciales de traducción.

La familia Hy-MT3 incluye tres tamaños (1.8B, 7B y 30B-A3B con arquitectura MoE), y esta ficha se centra en la variante de 7B en formato GGUF, que equilibra calidad y requisitos de hardware para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de traducción; detalles no especificados en la información proporcionada) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (no es MoE; la variante MoE es Hy-MT3-30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (quantizaciones compatibles con llama.cpp; niveles específicos no detallados en la información proporcionada) |
| Idiomas soportados | 102 idiomas (según la model card de la familia Hy-MT3) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 17,7 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, número de capas o dimensión de los estados ocultos). Se sabe que Hy-MT3 es la tercera generación de la familia de traducción de Tencent y que se entrenó con datos de alta calidad específicos del dominio de videojuegos, en colaboración con el equipo de Honor of Kings, además de datos para traducción de imágenes tolerante a errores de OCR. La model card menciona mejoras respecto a Hy-MT2 en fidelidad y seguimiento de restricciones: reducción del 43% en muestras con errores de traducción, del 74% en omisiones o adiciones y del 40% en errores de seguimiento de instrucciones sobre datos de escenarios reales.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La familia incluye una variante MoE (30B-A3B) con 3B parámetros activos, lo que sugiere que el equipo explora arquitecturas eficientes en cómputo, pero la variante de 7B parece ser un modelo denso. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal para este modelo concreto.

## Capacidades

- Traducción multilingüe entre 102 idiomas, con especial énfasis en pares que incluyen chino mandarín y lenguas minoritarias.
- Seguimiento estricto de instrucciones de traducción: restricciones de formato, terminología, marcadores de posición y texto enriquecido.
- Localización de videojuegos: tolerancia a errores de OCR, control de tasa de fuera de objetivo (off-target), errores de placeholders y terminología específica del dominio.
- Traducción de imágenes en cascada con OCR: corrección de errores de reconocimiento óptico de caracteres y comprensión del contexto.
- Modo no-thinking por defecto (el modelo se evalúa en modo no-thinking según la model card).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Soporte conversacional (tag `conversational`), lo que permite interacción multi-turno para refinamiento de traducciones.
- Uso de imatrix en la cuantización (tag `imatrix`), técnica que mejora la calidad de los pesos cuantizados.

No se mencionan capacidades de tool calling, function calling, agentes o multi-step reasoning en la información proporcionada.

## Casos de uso

- Localización de videojuegos en producción: el modelo puede integrarse en la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y contenido de juego respetando placeholders y terminología específica, gracias a su entrenamiento con datos del dominio y su bajo índice de errores en métricas como off-target rate y errores de rich-text.
- Traducción de imágenes con OCR: en pipelines de digitalización de documentos o subtitulado automático, el modelo tolera errores de OCR y corrige el contexto, lo que lo hace adecuado para sustituir APIs comerciales en flujos de traducción de capturas, cómics o carteles.
- Atención al cliente multilingüe: con 102 idiomas soportados y capacidad conversacional, puede gestionar respuestas automatizadas en centros de soporte que atienden a usuarios de múltiples regiones, manteniendo coherencia terminológica.
- Traducción de documentación técnica y legal: el seguimiento estricto de restricciones permite preservar nombres de productos, referencias normativas y formatos de marcado, reduciendo la revisión manual posterior.
- Despliegue en hardware de consumo: al estar en formato GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter mediante llama.cpp u Ollama, lo que facilita prototipos y entornos de desarrollo con presupuesto limitado.
- Generación de subtítulos y doblaje: la combinación de traducción fiel y tolerancia a errores de entrada lo hace útil en pipelines de postproducción donde los subtítulos provienen de ASR imperfecto.
- Evaluación automática de traducciones: aunque el modelo no es un evaluador per se, su calidad permite usarlo como referencia en suites como TransRubric, también publicada por Tencent, para comparar sistemas de traducción.

## Benchmarks y rendimiento

La model card de la familia Hy-MT3 incluye gráficos de resultados (main_result.png y efficiency.png) y afirma que Hy-MT3-30B-A3B logra el mejor rendimiento global en modo no-thinking entre los modelos evaluados, incluyendo Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash, y que Hy-MT3-1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash. Sin embargo, no se proporcionan cifras numéricas concretas por benchmark en el texto disponible, por lo que no es posible presentar una tabla con valores verificables.

No se han publicado resultados de benchmarks numéricos en la información disponible para Hy-MT3-7B-GGUF.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de 7,5B parámetros en GGUF, las cuantizaciones típicas de 4 bits requieren aproximadamente 4-5 GB de VRAM, y las de 8 bits alrededor de 8 GB, aunque estos valores son estimaciones generales y no datos confirmados por el autor.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, cabría esperar compatibilidad con RTX 3060/4060 (12 GB), RTX 4070/4080, RTX 4090 y GPUs de datacenter como A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM usando cuantizaciones de 4 bits, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. No se mencionan vLLM ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-7B-GGUF | 7,5B | no disponible | 102 | Apache 2.0 | GGUF |
| Hy-MT3-1.8B | 1,8B | no disponible | 102 | Apache 2.0 | safetensors/GGUF (no confirmado) |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | no disponible | 102 | Apache 2.0 | safetensors/GGUF (no confirmado) |
| Hy-MT2-7B | 7B (aproximado) | no disponible | 38 | no disponible | no disponible |

La comparación con modelos de otras familias (Qwen-MT-Flash, GPT-6.1-Sol, Gemini-4-Argon) aparece mencionada en la model card, pero sin datos numéricos verificables en la información proporcionada. No se dispone de cifras de benchmarks para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos de Tencent, puede reflejar sesgos presentes en los corpus utilizados.
- Riesgo de alucinación: en traducción, el riesgo se manifiesta como adiciones u omisiones; la model card reporta una reducción del 74% en estos errores respecto a Hy-MT2, pero no los elimina por completo.
- Limitaciones de contexto e idioma: aunque se declaran 102 idiomas, no se detalla el rendimiento por par de lenguas ni la longitud máxima de contexto soportada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: la variante GGUF puede presentar pérdida de calidad respecto al modelo en safetensors según el nivel de cuantización; no se especifican los niveles disponibles ni su impacto. El modelo está optimizado para traducción, no para tareas generales de razonamiento o generación.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en flujos automatizados complejos.

## Enlaces

- Hugging Face (modelo GGUF): https://huggingface.co/tencent/Hy-MT3-7B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción para videojuegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de Tencent AI Studio: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión de navegador Tencent Hy Translate (Chrome): https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión de navegador Tencent Hy Translate (Edge): https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
