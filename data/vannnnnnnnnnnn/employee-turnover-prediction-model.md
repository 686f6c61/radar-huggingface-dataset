# vannnnnnnnnnnn/employee-turnover-prediction-model

## Resumen

El Employee Turnover Prediction Model es un clasificador binario de datos tabulares desarrollado por el usuario de Hugging Face `vannnnnnnnnnnn` para predecir la probabilidad de que un empleado abandone su empresa (variable objetivo `LeaveOrNot`). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un `RandomForestClassifier` de scikit-learn serializado con joblib, entrenado sobre una version limpia del Employee Dataset de Kaggle (2.764 filas tras eliminar 1.889 duplicados de las 4.653 originales). Su publico objetivo son equipos de Recursos Humanos y People Operations que quieran identificar de forma proactiva empleados con riesgo de rotacion.

El modelo trabaja sobre nueve caracteristicas de entrada ya preprocesadas (Education codificada de forma ordinal, JoiningYear, PaymentTier, Age y ExperienceInCurrentDomain escaladas con StandardScaler, y cuatro variables one-hot: City_New Delhi, City_Pune, Gender_Male y EverBenched_Yes). El artefacto se distribuye junto a un scaler, la lista de nombres de caracteristicas y un fichero de metadatos, lo que obliga a reproducir exactamente el mismo pipeline de preprocesamiento en inferencia.

Es relevante ahora porque ejemplifica el patron de publicacion de modelos tabulares ligeros en Hugging Face: artefactos pequenos, dependencia fuerte de scikit-learn 1.6.1, licencia MIT y metricas modestas pero explicitas. No hay informacion sobre arquitectura de red, contexto, cuantizacion ni soporte multilingue entendido como capacidad generativa, por lo que las secciones correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`), aprendizaje supervisado tabular |
| Parametros totales | no disponible (50 arboles de decision; el numero de nodos y hojas no se publica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: entrada tabular de 9 caracteristicas) |
| Tipos de cuantizacion | no disponible (artefacto joblib; no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | `id` (indonesio), `en` (ingles); los textos de la model card y los nombres de caracteristicas estan en indonesio e ingles |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`): modelo, scaler, `feature_names` y `metadata` como artefactos separados |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio (`RandomForestClassifier`) con hiperparametros ajustados: `n_estimators=50`, `min_samples_split=10` y `max_depth=None`. Se entreno con scikit-learn 1.6.1 sobre el Employee Dataset de Kaggle, tras eliminar filas duplicadas (de 4.653 a 2.764 registros) y aplicar un preprocesamiento en dos ramas: codificacion ordinal para `Education` (0 = Bachelors, 1 = Masters, 2 = PhD) y escalado estandar para las variables numericas (`JoiningYear`, `PaymentTier`, `Age`, `ExperienceInCurrentDomain`); las variables categoricas (`City`, `Gender`, `EverBenched`) se transformaron con one-hot encoding, resultando en cuatro columnas binarias.

La particion de evaluacion reserva el 20 % de los datos como conjunto de prueba. No se documenta el uso de validacion cruzada, ajuste de umbral de decision, tecnicas de balanceo de clases (SMOTE, class weighting) ni calibracion de probabilidades, lo que es relevante porque el recall de la clase positiva es bajo (61,01 %) y el umbral por defecto de 0,5 puede no ser el optimo para el caso de uso. Tampoco hay innovaciones tecnicas destacables: no hay RLHF, destilacion, decodificacion especulativa ni atencion lineal porque no es un modelo generativo.

## Capacidades

- Clasificacion binaria tabular: predice `LeaveOrNot` (1 = abandonara la empresa, 0 = permanecera) a partir de nueve caracteristicas del empleado.
- Salida de probabilidad por clase mediante `predict_proba`, lo que permite ordenar empleados por riesgo y fijar umbrales de intervencion.
- Inferencia determinista y reproducible si se respeta el mismo pipeline de preprocesamiento (orden de columnas y `StandardScaler` guardado).
- Integracion directa en Python con `joblib` y `pandas`; no requiere GPU ni runtime especializado.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin generacion de texto, codigo, matematicas ni vision.
- Sin capacidades multilingues en sentido estricto: los idiomas declarados (`id`, `en`) se refieren a la documentacion y al contexto del dataset, no a procesamiento de lenguaje.
- Sin modo thinking, audio, video ni entrada multimodal.

## Casos de uso

- Priorizacion de entrevistas de retencion en RR. HH.: cargar los datos del empleado en el pipeline (`scaler` + `feature_names`) y usar `predict_proba` para ordenar la plantilla por probabilidad de salida; el equipo humano revisa primero el decil superior de riesgo.
- Segmentacion de plantillas por riesgo de rotacion: agrupar por `PaymentTier`, `EverBenched_Yes` y `ExperienceInCurrentDomain` para detectar los perfiles con mayor tasa de salida y disenar planes de carrera especificos.
- Simulacion de escenarios de compensacion: modificar `PaymentTier` en el vector de entrada y observar el cambio en la probabilidad predicha para estimar el efecto marginal de una subida de nivel salarial (con la cautela de que es correlacion, no causalidad).
- Deteccion de colectivos vulnerables: identificar combinaciones de `EverBenched_Yes = 1` y baja `ExperienceInCurrentDomain` con riesgo elevado, para asignar mentoria o rotacion de proyecto.
- Panel de indicadores para direccion: servir el modelo detras de una API interna (FastAPI o Flask) que reciba registros de empleados y devuelva la probabilidad de salida para alimentar un cuadro de mando trimestral.
- Auditoria de sesgo en procesos de people analytics: comparar tasas de falsos negativos y falsos positivos por `Gender_Male` y por `City` antes de usar el modelo en decisiones que afecten a personas.
- Filtro previo en procesos de offboarding voluntario: combinarlo con encuestas de clima para validar si las senales del modelo coinciden con las declaraciones de los empleados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el 20 % de prueba (Tuned Random Forest, `n_estimators=50`, `min_samples_split=10`, `max_depth=None`):

| Metrica | Valor | Clase |
|---|---|---|
| Accuracy | 80,65 % | Global |
| Precision | 85,80 % | Clase 1 (Leave) |
| Recall | 61,01 % | Clase 1 (Leave) |
| F1-Score | 71,31 % | Clase 1 (Leave) |

No se publican resultados para la clase 0 (Stay), ni matriz de confusion, ni AUC-ROC, ni comparacion con lineas base (regresion logistica, gradient boosting). No se han publicado resultados de benchmarks frente a modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM: 0 GB. El modelo es un artefacto joblib de un bosque de 50 arboles y se ejecuta en CPU.
- GPU: no requiere GPU; cualquier CPU x86-64 o ARM moderna es suficiente. El coste dominante es el preprocesamiento con pandas, no la inferencia.
- Cabe en cualquier equipo de consumo: portatil basico, Raspberry Pi o contenedor con 512 MB de RAM.
- Despliegue: script Python con `joblib` y `scikit-learn==1.6.1` (la version esta fijada en la model card y es importante respetarla por compatibilidad de serializacion); servicio HTTP con FastAPI o Flask; tarea batch con pandas. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos generativos.
- Latencia y throughput: no disponibles de forma publicada. Por la naturaleza del modelo (50 arboles, 9 caracteristicas) se espera inferencia en el orden de microsegundos a milisegundos por registro en CPU, pero no hay medicion oficial.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican otros modelos tabulares de prediccion de rotacion con los que comparar parametros, metricas o licencia. Como referencia metodologica, las alternativas habituales de la misma categoria serian una regresion logistica, un `GradientBoostingClassifier` o un `XGBoost` sobre las mismas caracteristicas, pero no se dispone de resultados publicados para establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Recall bajo en la clase positiva (61,01 %): aproximadamente un 39 % de los empleados que realmente se marchan quedan sin detectar (falsos negativos). Para retencion proactiva conviene bajar el umbral de decision y reevaluar precision/recall.
- Precision alta (85,80 %) pero condicionada: el modelo solo es fiable si la distribucion de los datos de entrada se parece a la del dataset de Kaggle (empleados de Nueva Delhi y Pune, predominantemente del sector tecnologico indio). Fuera de ese contexto el rendimiento no esta garantizado.
- Sesgo demografico y geografico: el dataset solo cubre dos ciudades y modela el genero como binario (`Gender_Male`), lo que puede introducir sesgos en colectivos no representados. No se ha publicado una auditoria de equidad.
- No es causal: las relaciones entre `PaymentTier` o `EverBenched_Yes` y la rotacion son patrones estadisticos historicos; usar el modelo para justificar una subida salarial concreta es un error de interpretacion.
- Sin validacion temporal: `JoiningYear` se usa como caracteristica numerica escalada y no se documenta una division train/test por tiempo, lo que puede inflar las metricas si los datos tienen deriva temporal.
- Dependencia de version: el artefacto requiere scikit-learn 1.6.1; cargarlo con otra version puede fallar o producir resultados inconsistentes por cambios en la serializacion.
- Sin calibracion de probabilidades documentada: `predict_proba` en un Random Forest tiende a estar mal calibrado, por lo que las probabilidades no deben interpretarse como frecuencias reales sin un paso previo de calibracion (Platt scaling o isotonic regression).
- Licencia MIT: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la licencia; no hay restricciones adicionales documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion externa por terceros.
- No apto para decisiones automatizadas de despido o promocion sin supervision humana: la legislacion de proteccion de datos en el Espacio Economico Europeo (RGPD, articulo 22) limita las decisiones individuales automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vannnnnnnnnnnn/employee-turnover-prediction-model
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/tawfikelmetwally/employee-dataset/data
- Documentacion de scikit-learn para `RandomForestClassifier`: no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada
