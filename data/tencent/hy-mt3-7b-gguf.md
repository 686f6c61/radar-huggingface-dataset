# tencent/Hy-MT3-7B-GGUF

## Resumen

Hy-MT3-7B-GGUF es la versión cuantizada en formato GGUF del modelo de traducción automática Hy-MT3-7B, desarrollado por Tencent dentro de su familia Hy (Hunyuan). Se trata de la tercera generación de su familia de modelos de traducción multilingüe, que amplía la cobertura lingüística de 38 idiomas (en Hy-MT2) hasta 102 idiomas. El modelo está diseñado específicamente para traducción automática de alta calidad, no como un modelo de propósito general, y se distribuye bajo licencia Apache 2.0.

El modelo base cuenta con 7.504.568.320 parámetros (aproximadamente 7,5 mil millones) y se publica en formato GGUF con cuantizaciones compatibles con llama.cpp, lo que permite su despliegue en hardware de consumo. Según la model card, la familia Hy-MT3 reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones respecto a Hy-MT2 en datos de escenarios reales.

La relevancia actual del modelo radica en su enfoque en dos escenarios industriales concretos: la localización de videojuegos (con datos de dominio del equipo de Honor of Kings) y la traducción de imágenes en cascada con OCR. Además, Tencent ha publicado junto al modelo TransRubric, una suite de evaluación automática basada en rúbricas que, según el autor, supera a otros esquemas de evaluación en el conjunto de test de la tarea de métricas de WMT26.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura concreta no detallada en la información disponible) |
| Parámetros totales | 7.504.568.320 |
| Parámetros activos | No aplica (no es MoE; la variante MoE es Hy-MT3-30B-A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (cuantizaciones compatibles con llama.cpp; niveles concretos no detallados); el modelo base también se publica en FP8 |
| Idiomas soportados | 102 idiomas (según la model card de la familia Hy-MT3) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 17,7 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que pertenece a la familia Hy-MT3, que incluye tres tamaños: 1.8B, 7B y 30B-A3B (esta última con arquitectura MoE y 3B parámetros activos). El modelo de 7B es un transformer denso de aproximadamente 7,5 mil millones de parámetros. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Sí se documenta que el entrenamiento incorpora datos de alta calidad del dominio de videojuegos, construidos junto al equipo de Honor of Kings, y que el modelo está optimizado para tolerar errores de OCR en pipelines de traducción de imágenes en cascada. La familia Hy-MT3 se evalúa con TransRubric, una suite de evaluación automática basada en rúbricas publicada junto al modelo, y los resultados reportados se miden en modo no-thinking (sin modo de razonamiento extendido).

## Capacidades

- Traducción automática multilingüe en 102 idiomas, con especial énfasis en pares chino-inglés y chino-lenguas minoritarias.
- Traducción fiel a restricciones del usuario: la model card reporta una reducción del 40% en errores de seguimiento de instrucciones respecto a Hy-MT2.
- Localización de videojuegos: manejo de texto enriquecido, marcadores de posición (placeholders) y terminología específica del dominio.
- Traducción de imágenes en cascada con OCR: corrección de errores de OCR y comprensión de contexto para mejorar la calidad final.
- Modo conversacional (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión nativa ni audio.

## Casos de uso

- Localización de videojuegos: el modelo puede integrarse en pipelines de desarrollo mediante la herramienta open source TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y contenido con marcadores de posición, reduciendo errores de terminología y de texto enriquecido gracias a su entrenamiento con datos del dominio de Honor of Kings.
- Traducción de imágenes en cascada: en un pipeline OCR → traducción, el modelo tolera errores de OCR y corrige el contexto, lo que lo hace adecuado para traducir capturas de pantalla, cómics o documentación escaneada.
- Traducción de documentación técnica multilingüe: con cobertura de 102 idiomas y capacidad de seguir restricciones de formato, puede emplearse para traducir manuales y documentación manteniendo terminología consistente.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones en tiempo real entre agentes y clientes en distintos idiomas, con la ventaja de su tamaño de 7B que permite despliegue en infraestructura moderada.
- Subtitulado y localización de contenido audiovisual: traducción de subtítulos con respeto a restricciones de longitud y formato, apoyándose en su capacidad de seguir instrucciones.
- Evaluación automática de traducciones: combinado con TransRubric, puede usarse como motor de traducción de referencia en pipelines de control de calidad para comparar salidas de distintos sistemas.
- Despliegue en entornos con recursos limitados: la versión GGUF permite ejecutar el modelo en estaciones de trabajo con GPU de consumo o incluso en CPU, útil para prototipado y pruebas locales.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados (imágenes `main_result.png` y `efficiency.png`) pero no tablas numéricas con valores concretos en el texto proporcionado. Los datos cualitativos reportados son:

| Métrica | Resultado reportado |
|---|---|
| Reducción de errores de traducción (vs. Hy-MT2) | 43% |
| Reducción de omisiones o adiciones (vs. Hy-MT2) | 74% |
| Reducción de errores de seguimiento de instrucciones (vs. Hy-MT2) | 40% |
| Rendimiento en VISTA-Bench (traducción de imágenes) | Mejor entre modelos de tamaño comparable (según el autor) |
| Rendimiento en localización de juegos | Iguala o supera a Gemini 3.1 Pro en métricas clave (según el autor) |

No se han publicado en la información disponible valores numéricos concretos de MMLU, HumanEval, GSM8K, FLORES-200, WMT26 ni de otros benchmarks estándar para el modelo de 7B. Los gráficos de la model card no son legibles como datos numéricos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 7,5B parámetros en GGUF, las cuantizaciones típicas de 4 bits requieren del orden de 4-5 GB de VRAM, y las de 8 bits en torno a 8 GB, aunque estos valores son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPU de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, y para GPU de datacenter como A100 o H100 si se busca mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cuantizaciones de 4-8 bits, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama y otros runners compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-7B-GGUF | 7,5B | No disponible | 102 | Apache 2.0 | GGUF |
| Hy-MT3-1.8B | 1,8B | No disponible | 102 | Apache 2.0 | Safetensors, FP8, GGUF |
| Hy-MT3-30B-A3B | 30B totales / 3B activos (MoE) | No disponible | 102 | Apache 2.0 | Safetensors (y variantes) |
| Hy-MT2-7B (generación anterior) | 7B | No disponible | 38 | No disponible en la información | No disponible |

La model card menciona comparaciones con modelos propietarios como Qwen3.8-Max, Kimi-K3.1-Pro, DeepSeek-V4.1-Flash, GPT-6.1-Sol y Gemini-4-Argon, pero no se proporcionan sus especificaciones ni resultados numéricos en el texto disponible. No se dispone de datos de benchmarks comparativos cuantitativos para incluir en esta tabla.

## Limitaciones y advertencias

- Es un modelo especializado en traducción: no está diseñado como modelo de propósito general y su rendimiento en tareas ajenas a la traducción no está documentado.
- Riesgo de alucinación y de traducciones inventadas en textos ambiguos o con jerga muy específica, aunque la model card reporta mejoras en fidelidad respecto a la generación anterior.
- La cobertura de 102 idiomas no implica calidad uniforme; los idiomas de bajos recursos pueden tener un rendimiento inferior (la model card menciona FLORES-200 low-resource como parte de la evaluación, sin detallar resultados).
- No se documentan sesgos específicos conocidos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos completos y las posibles patentes asociadas.
- El repo GGUF tiene un tamaño de 17,7 GB, lo que puede incluir múltiples niveles de cuantización; verificar qué archivo concreto se descarga.
- No se especifican la longitud de contexto ni los requisitos oficiales de hardware, lo que dificulta planificar despliegues en producción sin pruebas previas.
- La model card está parcialmente truncada en la información proporcionada; algunos detalles (como la tabla completa de enlaces de modelos) no están disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de juegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de Tencent Hunyuan: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
