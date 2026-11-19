# Sunraku02/neurogrip-model

## Resumen

NeuroGrip es un modelo de clasificación tabular orientado a la detección de deterioro neuromuscular (temblor parkinsoniano, dismetría, micrografía) a partir de telemetría cinemática capturada por el hardware propietario NeuroGrip Smart Pen & Capacitive Writing Pad. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline ensemble serializado con joblib que combina XGBoost, LightGBM, Random Forest y Extra Trees sobre un conjunto seleccionado de 30 biomarcadores cinemáticos y temporales. Lo desarrolla el equipo NeuroGrip, un grupo académico vinculado a un proyecto de hardware médico y aplicaciones móviles, y se publica bajo licencia MIT en Hugging Face.

El modelo resuelve un problema acotado: dado un vector de 30 características extraídas de la escritura y la cinemática de la muñeca (distancias, velocidad, aceleración, espectro de frecuencias del temblor, entropía de periodos, dinámica de presión y amplitud, más índices clínicos y demográficos como la edad y una puntuación Rating1-5), emite una probabilidad calibrada de deterioro neuromuscular. El umbral de decisión calibrado es 0,335, lo que explica la asimetría entre una sensibilidad alta (86,90 %) y una accuracy moderada (75,61 %).

Su relevancia ahora es la de un artefacto de investigación reproducible más que la de un componente listo para producción clínica: el repositorio pesa 0,0 GB, tiene cero descargas y cero likes, y los resultados de la model-index están marcados como no verificados. Resulta útil como referencia metodológica para pipelines de cribado con datos tabulares de sensores y como base para replicar el experimento con el dataset asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores de árboles: XGBoost + LightGBM + Random Forest + Extra Trees (pipeline calibrado) |
| Parametros totales | no disponible (no es una red neuronal; el número de parámetros no aplica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 30 características; no hay contexto secuencial) |
| Tipos de cuantizacion | no disponible (artefacto joblib de scikit-learn; no se publican pesos en formatos cuantizables) |
| Idiomas soportados | en (etiquetas y documentación en inglés; los datos son numéricos) |
| Licencia | MIT |
| Formato de pesos | joblib (`model.joblib`) más metadatos en JSON (`pipeline_meta.json`) |

## Arquitectura y entrenamiento

El modelo es un ensemble heterogéneo de árboles de decisión potenciados y bosques aleatorizados. La model card especifica cuatro componentes: XGBoost (Extreme Gradient Boosting), LightGBM (Light Gradient Boosted Machine), Random Forest Classifier y Extra Trees Classifier. El pipeline se describe como calibrado, con un umbral de decisión calibrado de 0,335, lo que sugiere un paso de calibración de probabilidades posterior al ajuste (probablemente Platt scaling o calibración isotónica, aunque el método exacto no se detalla). La salida es una probabilidad de clase positiva que se compara con ese umbral para producir la etiqueta binaria de deterioro.

La entrada son 30 características seleccionadas, agrupadas en cuatro bloques: cinemática espacial (distancias de movimiento de muñeca, velocidad y aceleración máximas con variantes denoised y trimmed), espectro de temblor y frecuencia (frecuencia máxima, pendiente y grado de ajuste, entropía y estadísticos de periodo, aperiodicidad), dinámica de presión y amplitud (medias, desviaciones, máximos, decrementos entre mitades y pendientes) e índices clínicos y demográficos (número de interrupciones normalizado, Rating1-5, edad y `kumo_latent_2`, presumiblemente una variable latente derivada). No se especifican el número de tokens de entrenamiento (no aplica), la composición exacta del dataset, ni si hubo ajuste fino con RLHF o DPO; al ser un modelo supervisado tabular, esos mecanismos no son pertinentes. Tampoco se documenta el tamaño de la muestra, la partición train/validation/test ni el proceso de selección de las 30 características.

## Capacidades

- Clasificación binaria tabular de deterioro neuromuscular a partir de 30 biomarcadores cinemáticos y temporales.
- Detección de patrones compatibles con temblor parkinsoniano, dismetría y micrografía, según la descripción del autor.
- Salida de probabilidad calibrada (`predict_proba`) con umbral de decisión ajustado a 0,335, configurable por el usuario.
- Extracción de características acoplada al hardware NeuroGrip (Smart Pen y Capacitive Writing Pad); el modelo no incluye el preprocesado de señal, que debe realizarse externamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la entrada es numérica; solo la documentación está en inglés).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Cribado de temblor en consulta neurológica: el modelo recibe las 30 características extraídas de una sesión de escritura con el Smart Pen y devuelve una probabilidad de deterioro; con sensibilidad del 86,90 % es adecuado como herramienta de primera línea para derivar a exploración clínica completa, nunca como diagnóstico definitivo.
- Monitorización longitudinal de pacientes con Parkinson: al ser un pipeline ligero serializado en joblib, puede ejecutarse en el dispositivo o en un servidor modesto para comparar sesiones periódicas de escritura y detectar progresión en las métricas de amplitud y frecuencia del temblor.
- Investigación en biometría de escritura: el conjunto de 30 características documentadas (entropía de periodo, aperiodicidad, pendiente de frecuencia) sirve como línea base reproducible para comparar nuevos extractores de features o arquitecturas sobre el dataset `Sunraku02/neurogrip-dataset`.
- Integración en aplicaciones móviles de salud: al no requerir GPU ni un runtime de deep learning, el artefacto joblib puede empaquetarse en un backend Python para una app de seguimiento de pacientes, con latencia de inferencia en el orden de milisegundos por muestra.
- Evaluación de dismetría en rehabilitación: las características de distancia y aceleración de muñeca permiten puntuar tareas de escritura guiada y objetivar la mejora motora tras un programa de fisioterapia.
- Docencia y prototipado de ML clínico: el modelo ejemplifica un flujo completo (selección de features, ensemble, calibración de umbral, publicación con model-index) reutilizable en cursos de machine learning aplicado a salud.
- Detección de micrografía en entornos de investigación: la combinación de estadísticos de amplitud y decrementos entre mitades de la sesión permite estudiar la reducción progresiva del tamaño de trazo, aunque la validación clínica de esta capacidad no está documentada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`), sobre el dataset NeuroGrip Combined Handwriting & Kinematics Dataset:

| Metrica | Valor |
|---|---|
| Accuracy | 0,7561 |
| ROC AUC | 0,7689 |
| Sensitivity / Recall | 0,8690 |
| F1 Score | 0,8295 |
| Umbral de decisión calibrado | 0,335 |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni la especificidad (aunque la model card la lista entre las métricas declaradas en los metadatos, no se incluye su valor). Tampoco se documenta la partición de evaluación ni el tamaño del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo de árboles serializado en joblib que se ejecuta en CPU.
- GPU recomendadas: no disponibles ni necesarias; XGBoost y LightGBM pueden usar GPU opcionalmente durante el entrenamiento, pero la inferencia del pipeline no la requiere.
- Cabe en cualquier GPU consumer y, de hecho, en CPU: el repositorio ocupa 0,0 GB y el artefacto es un conjunto de árboles de tamaño reducido.
- Opciones de despliegue: Python con `scikit-learn`, `xgboost`, `lightgbm` y `joblib`; servible mediante FastAPI, Flask o un endpoint de inferencia por lotes. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (árboles sobre 30 features) se espera latencia de milisegundos por muestra en CPU, pero no hay medición publicada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. Como referencia estructural, se puede contrastar con alternativas genéricas de la misma categoría, sin datos de rendimiento comparables:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroGrip | Ensemble de árboles (XGBoost, LightGBM, RF, Extra Trees) | no aplica | no aplica (tabular) | MIT | Hugging Face, 0 descargas |
| XGBoost standalone | Gradient boosting | no aplica | no aplica (tabular) | Apache 2.0 | Librería ampliamente disponible |
| LightGBM standalone | Gradient boosting | no aplica | no aplica (tabular) | MIT | Librería ampliamente disponible |
| scikit-learn RandomForest | Bosque aleatorio | no aplica | no aplica (tabular) | BSD-3-Clause | Librería ampliamente disponible |

No se conocen modelos públicos especializados en detección de deterioro neuromuscular a partir de cinemática de escritura con los que establecer una comparación cuantitativa; indíquese como no disponible.

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model-index están marcadas como `verified: false` y proceden únicamente del autor; no han sido replicadas de forma independiente.
- Sin validación clínica: el modelo se presenta como "clinical-grade" en la model card, pero no se aportan evidencia regulatoria, estudio prospectivo ni validación externa; no debe usarse para diagnóstico.
- Dependencia del hardware: las 30 características requieren el Smart Pen y el Capacitive Writing Pad de NeuroGrip; sin ese hardware y su pipeline de extracción de features, el modelo no es reutilizable directamente.
- Sensibilidad alta con accuracy moderada: con umbral 0,335 y sensibilidad del 86,90 %, se espera una tasa notable de falsos positivos; la especificidad no se publica, lo que impide evaluar el equilibrio real.
- Sesgos desconocidos: no se documenta la composición demográfica del dataset (edad, sexo, origen), por lo que no puede evaluarse el sesgo por subgrupos; la edad y `Rating1-5` entran como features, lo que puede introducir dependencias espurias.
- Riesgo de sobreajuste y de fuga de datos: no se detalla la partición train/test ni si la selección de las 30 features se hizo antes o después de la división.
- Contexto e idioma: la entrada es numérica y la documentación solo está en inglés; no hay soporte multilingüe ni de texto libre.
- Licencia MIT: permite uso comercial y modificación, pero al ser un artefacto médico sin validación, el uso comercial con fines clínicos exige evaluación regulatoria propia; la licencia no exime de responsabilidad.
- Mantenimiento: cero descargas y cero likes en el momento de la consulta; no hay evidencia de mantenimiento activo ni de versionado posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sunraku02/neurogrip-model
- Dataset asociado: https://huggingface.co/datasets/Sunraku02/neurogrip-dataset
- Repositorio GitHub del proyecto: https://github.com/nandu123-1/NeuroGrip
- Perfil del autor en Hugging Face: https://huggingface.co/Sunraku02
- Perfil del autor en GitHub: https://github.com/nandu123-1
