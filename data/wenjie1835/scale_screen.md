# Wenjie1835/Scale_Screen

## Resumen

Scale_Screen es una colección de checkpoints de investigación publicada por Wenjie Sun (Wenjie1835), estudiante de máster en la Southern University of Science and Technology (SUSTech). El repositorio documenta experimentos de "shape scans" sobre la Neural Interaction Law, una línea de trabajo orientada a estudiar las leyes de interacción entre neuronas en modelos transformer. El conjunto incluye pesos de checkpoints ajustados, tablas de resultados, curvas de aprendizaje, auditorías de convergencia y mediciones de input-AGOP (Average Gradient Outer Product).

El modelo no es un modelo de propósito general listo para inferencia, sino un artefacto de investigación empírica. Los experimentos se entrenaron sobre los corpus FineWeb y WikiText, que no se redistribuyen en el repositorio. Los scripts de preparación de datos, entrenamiento y cálculo de AGOP se conservan bajo el directorio `code/language_model/`. El repositorio pesa 12,5 GB y se publicó el 29 de agosto de 2026 bajo licencia "other", sin especificar términos concretos.

La relevancia de esta publicación radica en su valor para la comunidad de investigación en interpretabilidad y teoría de escalado de transformers: los checkpoints fallidos se conservan deliberadamente en `attempts/` cuando están disponibles, lo que permite auditar el proceso completo de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es transformer, según las etiquetas del repositorio, aunque no se especifica el número de capas, dimensiones ocultas ni la configuración exacta de atención. El entrenamiento se realizó sobre dos corpus: FineWeb y WikiText, que no se redistribuyen. Para las ejecuciones con FineWeb se utilizó un presupuesto de datos de `D = 60 * active_parameter_count` bytes, un criterio de escalado de datos proporcional al número de parámetros activos. Las extensiones de convergencia explícitas quedan documentadas en cada tabla de resultados.

El repositorio incluye mediciones de input-AGOP, una técnica de análisis que calcula el producto exterior medio del gradiente con respecto a las entradas, utilizada para estudiar qué características de entrada son relevantes para las predicciones del modelo. Los checkpoints preliminares fallidos se conservan en `attempts/`, lo que sugiere un proceso de entrenamiento iterativo con registros de fracasos y correcciones. El manifiesto `MODEL_MANIFEST.csv` enumera cada checkpoint subido y su tamaño en bytes.

## Capacidades

- Investigación empírica: el repositorio permite reproducir y auditar experimentos de shape scans sobre la Neural Interaction Law.
- Medición de input-AGOP: incluye datos de AGOP que permiten analizar las características de entrada relevantes para el modelo.
- Análisis de convergencia: las curvas de aprendizaje y auditorías de convergencia permiten estudiar la dinámica de entrenamiento.
- Reproducibilidad: los scripts de modelo, preparación de datos, entrenamiento y AGOP se conservan bajo `code/language_model/`.
- Trazabilidad de fallos: los checkpoints fallidos se retienen en `attempts/`, lo que permite estudiar modos de fallo en el entrenamiento.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling ni visión en la información disponible.

## Casos de uso

- Investigación en leyes de escalado: los checkpoints y tablas de resultados permiten estudiar cómo interactúan las neuronas en función del tamaño del modelo y la cantidad de datos, una línea de trabajo directamente relevante para la teoría de scaling laws.
- Auditoría de convergencia en transformers: las curvas de aprendizaje y las auditorías de convergencia incluidas permiten analizar cuándo y cómo convergen los modelos bajo distintos presupuestos de datos.
- Estudio de interpretabilidad con AGOP: las mediciones de input-AGOP permiten investigar qué características de entrada son relevantes, una técnica aplicable a la interpretabilidad mecanicista.
- Análisis de fallos de entrenamiento: la retención de checkpoints fallidos en `attempts/` ofrece material para estudiar modos de colapso o divergencia en el entrenamiento de transformers.
- Reproducción de experimentos: los scripts bajo `code/language_model/` permiten reproducir los experimentos de shape scan desde cero, con FineWeb y WikiText como corpus de origen.
- Docencia e investigación académica: como artefacto de un proyecto de máster, el repositorio sirve como referencia metodológica para estudiantes que trabajen en líneas similares de análisis empírico de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene tablas de resultados de los propios experimentos de shape scan, pero no se proporcionan métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El repositorio pesa 12,5 GB, lo que sugiere que los checkpoints pueden cargarse en GPUs de consumo con suficiente VRAM, pero no se especifican tamaños por checkpoint ni requisitos de memoria. No se documentan opciones de despliegue como vLLM, llama.cpp u Ollama, ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, dado que Scale_Screen no es un modelo de propósito general sino una colección de checkpoints de investigación sobre dinámica de entrenamiento. No se pueden establecer comparaciones directas con modelos de la misma categoría sin datos adicionales.

## Limitaciones y advertencias

- Licencia "other": los términos exactos de uso no están especificados. Antes de cualquier uso comercial o redistribución, es necesario contactar con el autor para clarificar las condiciones.
- No es un modelo de producción: se trata de checkpoints de investigación, no de un modelo afinado para tareas concretas de generación o razonamiento.
- Idiomas no documentados: no se especifica qué idiomas soporta el modelo ni la composición lingüística de los datos de entrenamiento.
- Datos de entrenamiento no redistribuidos: FineWeb y WikiText no se incluyen en el repositorio, por lo que la reproducción completa requiere acceso a dichos corpus por separado.
- Sin métricas estandarizadas: no hay benchmarks públicos que permitan evaluar la calidad del modelo frente a alternativas.
- Fecha de publicación futura: el repositorio se creó el 29 de agosto de 2026, lo que puede indicar que la información está sujeta a cambios o que el proyecto sigue en desarrollo.
- Riesgo de alucinación y sesgos: al no documentarse el proceso de alineación ni la composición del dataset, no se puede evaluar el riesgo de sesgos o alucinaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Wenjie1835/Scale_Screen
- Perfil de GitHub del autor: https://github.com/wenjie1835
- Repositorios de GitHub del autor: https://github.com/wenjie1835?tab=repositories
- Sitio personal del autor: https://wenjie1835.com/
