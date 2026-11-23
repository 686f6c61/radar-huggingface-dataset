# vandarren/customer-segmentation-svm

## Resumen

El modelo `vandarren/customer-segmentation-svm` es un clasificador tabular basado en Support Vector Machine (SVM) con kernel RBF, desarrollado por el usuario de Hugging Face vandarren. Su objetivo es predecir el segmento de cliente (Segmen A, B, C o D) a partir de variables demográficas y de comportamiento de gasto básico. Está pensado para equipos de marketing y planificación estratégica que necesiten personalizar ofertas y optimizar la asignación de presupuesto promocional.

No se trata de un modelo de lenguaje ni de una red neuronal: es un artefacto de scikit-learn serializado con joblib, entrenado sobre el dataset público Customer Segmentation Classification de Kaggle. El conjunto de entrenamiento contiene 8.068 observaciones con 9 variables de entrada que, tras codificación ordinal y one-hot, se convierten en 21 características. La partición empleada es 80:20 (6.454 muestras de entrenamiento y 1.614 de prueba).

La relevancia de esta ficha es limitada desde el punto de vista de la investigación en IA generativa, pero resulta útil como ejemplo de modelo tabular de clasificación multiclase publicado en Hugging Face con licencia no especificada, rendimiento modesto (exactitud del 53,78 % en test) y un pipeline de preprocesado reproducible mediante artefactos separados (modelo, escalador, nombres de características y metadatos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Support Vector Machine (SVM) con kernel RBF |
| Parametros totales | no disponible (modelo no neuronal; vectores de soporte no cuantificados en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (artefacto joblib de scikit-learn; no se documentan cuantizaciones) |
| Idiomas soportados | id (indonesio, segun metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

Se emplea un SVM de clasificación multiclase con kernel RBF, implementado en `scikit-learn==1.6.1`. El ajuste de hiperparametros se realizó con `GridSearchCV` y validación cruzada de 5 particiones, seleccionando la configuración `{'C': 10, 'gamma': 'auto', 'kernel': 'rbf'}`. El preprocesado incluye codificación ordinal para `Spending_Score` y codificación one-hot para las variables nominales (`Gender`, `Ever_Married`, `Graduated`, `Profession`, `Var_1`), además de un escalador ajustado sobre las variables numéricas (`Age`, `Work_Experience`, `Family_Size`). El pipeline completo se distribuye como artefactos joblib independientes que deben cargarse en el orden indicado en la model card.

El dataset de entrenamiento es el Customer Segmentation Classification de Kaggle (`Train.csv`), con 8.068 filas y 9 características de entrada que pasan a 21 tras la codificación. No se documenta el número de vectores de soporte resultantes, el coste computacional del ajuste ni el uso de técnicas de regularización adicionales. Tampoco se indica si hubo balanceo de clases, aunque la matriz de métricas macro sugiere que las cuatro clases tienen un peso relativamente equilibrado en la evaluación.

## Capacidades

- Clasificación multiclase tabular en 4 categorías de segmento de cliente (Segmen A, B, C, D).
- Predicción de probabilidades por clase mediante `predict_proba`, lo que permite umbrales personalizados o análisis de incertidumbre.
- Procesamiento de variables demográficas y de gasto: edad, experiencia laboral, tamaño familiar, nivel de gasto, género, estado civil, formación, profesión y una variable categórica adicional (`Var_1`).
- Integración con pipelines de Python basados en pandas, numpy y scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido.

## Casos de uso

- Segmentación de carteras de clientes en CRM: el modelo clasifica cada registro demográfico en uno de los cuatro segmentos para alimentar campañas segmentadas. Es adecuado cuando no se dispone de historial transaccional y solo se cuenta con perfilado básico.
- Priorización de ofertas promocionales: a partir de la probabilidad por clase devuelta por `predict_proba`, el equipo de marketing puede ordenar clientes por afinidad a cada segmento y ajustar el mensaje.
- Enriquecimiento de datasets en procesos ETL: el artefacto joblib se puede insertar como paso de un pipeline de scikit-learn o como tarea batch en un job programado para etiquetar nuevos registros con el segmento predicho.
- Análisis exploratorio y docencia: sirve como ejemplo reproducible de SVM multiclase con GridSearchCV y serialización de artefactos, útil en cursos de machine learning aplicado.
- Prototipado rápido de modelos de segmentación: al estar publicado en Hugging Face con código de carga explícito, permite validar una hipótesis de negocio en pocas horas antes de invertir en un modelo con más variables.
- Filtrado previo en sistemas de recomendación: el segmento predicho puede usarse como característica adicional de entrada en un ranker posterior, siempre que se acepte la exactitud del 53,78 % como señal débil.
- Generación de cohorts para pruebas A/B: los segmentos permiten definir grupos homogéneos sobre los que medir el efecto de una campaña, con la cautela de la baja precisión del clasificador.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (1.614 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 0,5378 (53,78 %) |
| Precision (macro) | 0,5238 |
| Recall (macro) | 0,5271 |
| F1-score (macro) | 0,5223 |

No se han publicado resultados comparativos con otros modelos (regresión logística, random forest, XGBoost) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente para el tamaño del artefacto (repositorio de 0,0 GB según Hugging Face, lo que sugiere un fichero joblib de pocos megabytes). No requiere GPU.
- VRAM estimada: 0 GB en GPU; el modelo se ejecuta en memoria principal.
- GPU recomendadas: no aplica. Cualquier GPU sería innecesaria para un SVM de este tamaño.
- Compatibilidad con GPU de consumo: no aplica; el cuello de botella es el preprocesado en pandas, no el cálculo.
- Opciones de despliegue: scripts Python con `scikit-learn==1.6.1`, `joblib`, `pandas` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por la naturaleza del algoritmo, la predicción por lote debería ser del orden de microsegundos a milisegundos por fila en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vandarren/customer-segmentation-svm | SVM RBF (scikit-learn) | no disponible | no aplica | Accuracy 0,5378 | no disponible | Hugging Face (joblib) |
| Alternativas de clasificación tabular (Random Forest, XGBoost, LightGBM) | Ensemble de árboles | no disponible | no aplica | no disponible en la informacion | habitualmente permisivas | Bibliotecas estándar |
| Modelos de segmentación de clientes publicados en Hugging Face | variable | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Exactitud limitada: 53,78 % en test, con solapamiento frecuente entre los segmentos A y B, según reconoce el propio autor.
- Ausencia de variables clave: no se usan historial transaccional, frecuencia de compra ni ingresos reales, lo que limita la capacidad predictiva.
- Validez poblacional restringida: el modelo solo es aplicable a poblaciones con distribución similar a la del dataset de Kaggle original; no captura cambios de comportamiento fuera del periodo de recogida.
- Naturaleza correlacional: las relaciones aprendidas son estadísticas, no causales; no deben usarse para inferir causalidad en decisiones de negocio.
- Licencia no especificada: no se declara licencia en el repositorio, lo que impide confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de desplegarlo en producción.
- Idioma: los metadatos indican indonesio, pero al ser un modelo tabular el idioma solo afecta a la documentación y a las etiquetas, no a los datos de entrada.
- Dependencia estricta de versión: requiere `scikit-learn==1.6.1`; otras versiones pueden romper la compatibilidad de los artefactos joblib.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas presentadas con alta confianza por `predict_proba`.
- Sesgos: no se documenta auditoría de sesgo por género, profesión o edad; al entrenar con datos de Kaggle, puede heredar sesgos de la muestra original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vandarren/customer-segmentation-svm
- Dataset de referencia (Kaggle Customer Segmentation Classification): no se incluye URL directa en la model card; el autor lo cita como "Kaggle Customer Segmentation Dataset".
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub: https://huggingface.co/docs/huggingface_hub
