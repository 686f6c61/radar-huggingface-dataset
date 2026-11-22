# syed-huzaifa-10/hids-nsl-kdd-classifier

## Resumen

HIDS-NSL-KDD es un clasificador tabular de intrusiones publicado en Hugging Face por el usuario syed-huzaifa-10. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `Pipeline` de scikit-learn que encadena ingeniería de características, imputación y escalado, codificación one-hot y un clasificador Random Forest. Su tarea es mapear un registro de conexión con 41 características del dataset NSL-KDD a una de cinco clases: Normal, DoS, Probe, R2L (remote-to-local) y U2R (escalado de privilegios).

El modelo se desarrolló como proyecto del curso CT-378 Machine Learning y su propósito declarado es la demostración educativa de detección de intrusiones basada en aprendizaje automático, no la toma de decisiones de seguridad en producción. El autor es explícito en la model card: las acciones de respuesta asociadas a cada clase son simuladas y el sistema no debe usarse para decisiones reales de seguridad.

Su relevancia es limitada pero concreta: sirve como referencia reproducible de un pipeline clásico de clasificación tabular multiclase sobre un benchmark de seguridad ampliamente conocido, con métricas documentadas y limitaciones reconocidas por el propio autor (sesgo optimista del split, clases minoritarias con muy pocos ejemplos). No dispone de arquitectura transformer, parámetros en el sentido habitual ni ventana de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: ingeniería de características → imputación/escalado/one-hot → Random Forest |
| Parámetros totales | no disponible (modelo de árboles, no red neuronal; el autor no publica recuento de nodos ni tamaño efectivo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 41 características por registro) |
| Tipos de cuantización | no disponible (no aplica a este tipo de modelo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (`hids_pipeline.joblib`), requiere `hids_core.py` para deserializar el paso de ingeniería de características |

## Arquitectura y entrenamiento

El modelo es un `Pipeline` de scikit-learn con tres etapas: ingeniería de características (implementada en `hids_core.py`, incluido en el repositorio y necesario para el unpickling), un bloque de preprocesado con imputación, escalado y codificación one-hot, y un clasificador Random Forest. Los mejores hiperparámetros reportados tras la búsqueda son `{'max_depth': None, 'min_samples_leaf': 3}`.

El entrenamiento utiliza NSL-KDD (Tavallaee et al., 2009), combinando `KDDTrain+` y `KDDTest+`, con duplicados eliminados: 147.888 registros y 41 características. El split es 70/15/15 estratificado. Se compararon una línea base de clase mayoritaria, regresión logística, Random Forest e Histogram Gradient Boosting, con GridSearchCV de 5 folds optimizando macro-F1 y pesos de clase balanceados; la selección final se hizo sobre el conjunto de validación. No se reporta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo tabular de este tipo.

## Capacidades

- Clasificación multiclase de registros de conexión en cinco categorías: Normal, DoS, Probe, R2L y U2R.
- Procesamiento de entradas tabulares con 41 características del esquema NSL-KDD.
- Manejo de valores ausentes y variables categóricas mediante imputación y one-hot encoding dentro del propio pipeline.
- Capa basada en reglas que mapea cada clase predicha a una acción de respuesta simulada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Docencia y prácticas de machine learning: reproducción completa del flujo (carga de datos, preprocesado, búsqueda de hiperparámetros, evaluación con macro-F1) sobre un benchmark de seguridad clásico.
- Comparación de algoritmos tabulares: el autor ya documenta una comparativa entre regresión logística, Random Forest e Histogram Gradient Boosting, utilizable como plantilla para experimentos similares.
- Prototipado de sistemas de detección de intrusiones en entornos de laboratorio: clasificación de tráfico sintético o capturado en un testbed, sin conexión a infraestructura real.
- Generación de datasets etiquetados de prueba: uso del pipeline para etiquetar registros de conexión en pipelines de evaluación de otros detectores.
- Estudio del desbalanceo de clases: el modelo ilustra de forma medible el problema de clases extremadamente raras (U2R con unos 120 registros) y el efecto de los pesos balanceados.
- Base para ejercicios de evaluación honesta: la model card documenta explícitamente el sesgo optimista del split aleatorio frente al `KDDTest+` oficial, lo que lo convierte en un caso de estudio sobre validación correcta.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado, evaluado una sola vez según el autor:

| Métrica | Valor |
|---|---|
| Accuracy | 0,9949 |
| Macro-F1 | 0,9205 |
| Weighted-F1 | 0,9949 |
| ROC-AUC (OvR, macro) | 0,9986 |

F1 por clase: Normal 0,995; DoS 0,999; Probe 0,993; R2L 0,949; U2R 0,667.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest serializado con joblib y no requiere GPU.
- VRAM estimada: 0 GB; no se necesita acelerador gráfico.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB según Hugging Face y el modelo se carga en memoria principal con `joblib.load`.
- Opciones de despliegue: script de Python con scikit-learn 1.9.1 (versión requerida explícitamente por el autor), o exportación a otros runtimes si se reimplementa el pipeline. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de intrusiones sobre NSL-KDD ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- NSL-KDD es un benchmark antiguo derivado de tráfico de 1998; el tráfico real de hosts actuales difiere sustancialmente.
- El split aleatorio sobre datos agrupados es optimista: el `KDDTest+` oficial contiene tipos de ataque no vistos en entrenamiento y es más difícil.
- La clase U2R es extremadamente rara (unos 120 registros, con 18 en test), por lo que sus predicciones (F1 0,667) no son fiables.
- Las acciones de respuesta asociadas a cada clase son simuladas; el sistema no ejecuta contramedidas reales.
- El autor declara explícitamente que el modelo no es apto para decisiones de seguridad en producción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificación errónea en tráfico fuera de distribución.
- Sesgos conocidos: no documentados más allá del desbalanceo de clases y la antigüedad del dataset.
- Restricciones de licencia: MIT permite uso comercial, pero el propio autor desaconseja el uso en producción por motivos técnicos, no legales.
- Dependencia estricta de `scikit-learn==1.9.1` y de `hids_core.py` para deserializar el pipeline; versiones distintas pueden romper la carga del modelo.
- El repositorio no incluye información sobre idiomas ni sobre el recuento efectivo de parámetros del bosque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syed-huzaifa-10/hids-nsl-kdd-classifier
- Dataset NSL-KDD (mirror usado por el autor): https://github.com/defcom17/NSL_KDD
- Referencia del dataset: Tavallaee et al., 2009, "A detailed analysis of the KDD CUP 99 data set" (no se proporciona URL en la información disponible)
