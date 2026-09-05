# surodipoikromo/IndoBERTindak

## Resumen

IndoBERTindak es un modelo de clasificación multilabel de texto desarrollado por surodipoikromo, fine-tuned a partir de `indobenchmark/indobert-base-p1` (IndoBERT base). Su propósito es detectar cinco señales observables de comportamiento y lenguaje en discursos digitales en indonesio: búsqueda explícita de ayuda, provisión de conocimiento accionable, autoinforme de aprendizaje, feedback positivo hacia el contenido y ánimo dirigido a otras personas.

El modelo resuelve el problema de analizar la función comunicativa de comentarios en entornos digitales, especialmente en comunidades de aprendizaje y foros online. A diferencia de un clasificador binario, permite que un mismo texto reciba cero, una o varias etiquetas simultáneamente, lo que refleja la naturaleza multifacética del discurso real. La arquitectura es un transformer encoder-only (BERT) con 124.445.189 parámetros, y en el ejemplo de uso se trunca la entrada a 256 tokens. Es relevante porque ofrece una herramienta ligera y específica para el indonesio, con umbrales de decisión ajustados por etiqueta y un formato de entrada contextualizado para respuestas con comentario padre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT) basado en `indobenchmark/indobert-base-p1` |
| Parametros totales | 124.445.189 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite de truncamiento en el ejemplo; el contexto nativo no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `indobenchmark/indobert-base-p1`, un transformer encoder-only preentrenado en indonesio. Se ha fine-tuned para clasificación multilabel con cinco etiquetas, utilizando una cabeza de clasificación de secuencia con salida de 5 logits y activación sigmoide. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se menciona el uso de RLHF o DPO.

La innovación técnica destacable es el uso de umbrales de decisión específicos por etiqueta, ajustados en el conjunto de desarrollo y fijados antes de la evaluación en el conjunto de test. Además, el modelo emplea un formato de entrada contextualizado para respuestas que son réplicas de otro comentario, usando la estructura `[TARGET] <texto_objetivo> [PARENT] <texto_padre>`. Esto permite resolver la función o el referente de una respuesta cuando el contexto del comentario padre es necesario.

## Capacidades

- Clasificación multilabel de texto en indonesio, con cinco señales observables: `EXPLICIT_HELP_SEEKING`, `ACTIONABLE_KNOWLEDGE_PROVISION`, `LEARNER_SELF_REPORT`, `POSITIVE_CONTENT_FEEDBACK` y `OTHER_DIRECTED_ENCOURAGEMENT`.
- Permite que un texto reciba cero, una o varias etiquetas simultáneamente, evaluando cada etiqueta de forma independiente con probabilidad sigmoide y un umbral propio.
- No es un modelo generativo: no produce texto nuevo, solo clasifica entradas.
- No soporta tool calling, function calling ni razonamiento multi-step.
- Capacidades multilingües limitadas al indonesio.
- No incluye visión ni audio.
- Es compatible con la librería Transformers y con `text-embeddings-inference`, según los tags del repositorio.

## Casos de uso

- Análisis de interacciones en foros educativos: el modelo puede identificar si un estudiante pide ayuda explícita (N1) o reporta su propio progreso (N3), lo que permite a los tutores priorizar respuestas.
- Moderación de comunidades de aprendizaje en línea: detecta mensajes de apoyo y ánimo entre usuarios (N5) y feedback positivo hacia el contenido (N4), útil para fomentar comunidades saludables.
- Investigación en ciencias sociales: permite analizar discurso digital en plataformas indonesias para estudiar patrones de búsqueda de ayuda y provisión de conocimiento a escala.
- Sistemas de tutoría inteligente: clasifica mensajes de estudiantes según su función comunicativa para enrutarlos a respuestas automatizadas adecuadas, como sugerencias o explicaciones.
- Monitorización de redes sociales: identifica publicaciones que buscan ayuda explícita (N1) para activar intervenciones o recursos de soporte.
- Evaluación de contenido generado por usuarios en MOOCs: detecta feedback positivo hacia el contenido (N4) y autoinformes de aprendizaje (N3), proporcionando métricas de engagement y comprensión.
- Análisis de retroalimentación en plataformas de soporte técnico: clasifica comentarios según si ofrecen soluciones accionables (N2) o piden aclaraciones (N1), optimizando la gestión de tickets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en float32 y 250 MB en float16, dado que el modelo tiene 124.445.189 parámetros.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU sin problemas debido a su tamaño reducido.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060 o incluso inferiores.
- Opciones de despliegue: Transformers (Python), `text-embeddings-inference`, endpoints compatibles de Hugging Face.
- Latencia y throughput: al ser un modelo BERT pequeño, la latencia es muy baja, apta para aplicaciones en tiempo real. En GPU puede procesar cientos de textos por segundo, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| surodipoikromo/IndoBERTindak | 124,4 M | 256 (truncamiento) | Apache 2.0 | HuggingFace |
| indobenchmark/indobert-base-p1 | 124,4 M | 512 (IndoBERT base) | No disponible | HuggingFace |
| bert-base-multilingual-cased | 178 M | 512 | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) en la información proporcionada. El modelo IndoBERTindak se diferencia por su fine-tuning específico en clasificación multilabel de señales comportamentales en indonesio, mientras que los otros dos son modelos base genéricos.

## Limitaciones y advertencias

- Los umbrales de decisión se ajustaron en un conjunto de desarrollo específico y pueden no generalizar a otros dominios o estilos de texto.
- El modelo detecta señales textuales observables, no características psicológicas latentes como confianza, motivación, personalidad, inteligencia o capacidad de aprendizaje.
- Puede heredar sesgos presentes en el modelo base IndoBERT y en los datos de fine-tuning.
- Solo soporta indonesio; no es aplicable a otros idiomas.
- Al ser un clasificador multilabel, existe riesgo de falsos positivos o falsos negativos, especialmente en textos ambiguos o con múltiples funciones comunicativas.
- No se han publicado evaluaciones externas ni resultados de benchmarks, por lo que el rendimiento real en producción debe validarse de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/surodipoikromo/IndoBERTindak
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
- No se encontraron papers, blogs ni demos adicionales en la búsqueda web.
