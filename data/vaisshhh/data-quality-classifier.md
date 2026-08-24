# Vaisshhh/data-quality-classifier

## Resumen

El modelo `Vaisshhh/data-quality-classifier` es un clasificador de calidad de datos desarrollado por Vaisshhh como parte de una plataforma automatizada de monitoreo de calidad de datos. Su función es clasificar conjuntos de datos en cuatro categorías de calidad (Excellent, Good, Moderate, Poor) a partir de características generadas por un pipeline de calidad de datos. Está construido con un árbol de decisión (DecisionTreeClassifier) utilizando el framework PyCaret, que selecciona automáticamente el mejor modelo mediante `compare_models()`. El entrenamiento se realizó con 200 filas y 6 columnas, y el seguimiento experimental se gestiona con MLflow.

Aunque no se trata de un modelo de lenguaje de gran tamaño (LLM), su relevancia radica en su aplicación práctica dentro de pipelines de gobernanza de datos, donde permite automatizar la evaluación de la calidad de los datasets antes de su uso en análisis o entrenamiento de modelos. Su simplicidad y bajo coste computacional lo hacen adecuado para entornos de producción con recursos limitados, aunque su rendimiento depende críticamente de la representatividad de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DecisionTreeClassifier (arbol de decision) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (datos numericos/categoricos) |
| Licencia | no disponible |
| Formato de pesos | pickle (PKL) |

## Arquitectura y entrenamiento

El modelo es un árbol de decisión clásico, entrenado mediante el framework PyCaret, que utiliza `compare_models()` para evaluar múltiples algoritmos de clasificación y seleccionar el de mejor rendimiento según las métricas de validación. El conjunto de entrenamiento consta de 200 muestras y 6 características numéricas o categóricas relacionadas con la calidad de los datos (por ejemplo, completitud, unicidad, validez, etc.). No se especifica el proceso de selección de hiperparámetros ni si se aplicaron técnicas de regularización. El experimento se registró con MLflow, incluyendo parámetros, métricas, artefactos y comparaciones entre modelos. No se menciona el uso de técnicas avanzadas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación de datasets en cuatro categorías de calidad: Excellent, Good, Moderate y Poor.
- Integración con pipelines de calidad de datos que generan características de perfilado, validación y scoring.
- Seguimiento de experimentos y detección de deriva de predicciones mediante MLflow.
- Uso como componente de un sistema más amplio que incluye ingesta, perfilado, validación con Great Expectations y generación de dashboards.
- No soporta generación de texto, razonamiento, código, visión ni tool calling, al ser un modelo tabular supervisado.

## Casos de uso

- Monitoreo automatizado de calidad de datos: el modelo puede clasificar automáticamente la calidad de los datasets entrantes en un pipeline de datos, permitiendo alertar a los equipos cuando la calidad cae por debajo de un umbral.
- Priorización de limpieza de datos: al clasificar datasets como "Poor" o "Moderate", los equipos de datos pueden priorizar las tareas de limpieza y corrección sobre aquellos con peor calidad.
- Control de calidad en integraciones de datos: antes de fusionar datos de múltiples fuentes, el modelo puede evaluar la calidad de cada fuente y decidir si es apta para su uso.
- Validación de datos en producción: junto con Great Expectations, el modelo puede actuar como una capa adicional de clasificación para detectar degradaciones en la calidad de los datos a lo largo del tiempo.
- Evaluación de datasets para entrenamiento de modelos: los equipos de ML pueden usar el clasificador para filtrar datasets de baja calidad antes de usarlos en entrenamiento, reduciendo el riesgo de sesgos o errores.
- Generación de informes de calidad: el modelo puede alimentar dashboards de calidad de datos, proporcionando una visión agregada de la salud de los datasets en una organización.

## Benchmarks y rendimiento

Según la model card, el modelo seleccionado obtuvo los siguientes resultados en evaluación:

| Metrica | Valor |
|---|---|
| Accuracy | 85.00% |
| Precision | 85.64% |
| Recall | 85.00% |
| F1 Score | 85.07% |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados provienen de un conjunto de validación no especificado y deben interpretarse con cautela debido al reducido tamaño del conjunto de entrenamiento (200 filas).

## Requisitos de hardware

- Al ser un árbol de decisión, el modelo es extremadamente ligero y puede ejecutarse en cualquier CPU, incluso en entornos con recursos mínimos (por ejemplo, un contenedor Docker con 512 MB de RAM).
- No requiere GPU para inferencia ni entrenamiento.
- El archivo del modelo (`.pkl`) tiene un tamaño despreciable (el repositorio indica 0.0 GB, aunque se espera que el archivo esté presente).
- Opciones de despliegue: puede cargarse directamente en Python con `pickle` o `joblib`, o integrarse en un servicio REST con frameworks como Flask o FastAPI. No es compatible con vLLM, llama.cpp u otros motores de inferencia para LLMs.
- La latencia de inferencia es del orden de microsegundos por muestra, y el throughput es muy alto, limitado únicamente por la velocidad de serialización/deserialización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de calidad de datos) dentro de la información proporcionada. Existen otros clasificadores de calidad de consultas o de texto, como `nvidia/quality-classifier-deberta` o `dejanseo/Query-Quality-Classifier`, pero no son directamente comparables por su naturaleza (modelos de lenguaje) y su tarea (clasificación de texto). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó con solo 200 filas, lo que limita su capacidad de generalización y puede provocar sobreajuste.
- El rendimiento depende en gran medida de la calidad y representatividad de los datos de entrenamiento; si las características de los datasets entrantes cambian significativamente, el modelo debe reentrenarse.
- Las predicciones deben interpretarse junto con las métricas de calidad subyacentes, ya que el modelo solo clasifica en categorías discretas y no proporciona explicaciones detalladas.
- No se especifica la licencia del modelo, por lo que su uso comercial podría estar restringido o requerir contacto con el autor.
- El repositorio no muestra archivos (tamaño 0.0 GB), lo que sugiere que el modelo podría no estar disponible para descarga directa en Hugging Face.
- No se han documentado sesgos específicos, pero al ser un modelo tabular, los sesgos dependerán de los datos de entrenamiento.

## Enlaces

- [Hugging Face - Vaisshhh/data-quality-classifier](https://huggingface.co/Vaisshhh/data-quality-classifier)
