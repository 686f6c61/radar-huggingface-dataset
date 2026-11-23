# telepaties/laptop-price-prediction-model

## Resumen

`telepaties/laptop-price-prediction-model` es un modelo de regresion tabular publicado en Hugging Face por el usuario `telepaties` (Daniel Lee, NIM 2025121137) como proyecto final de la asignatura MN1135 Business Data Science del programa de Management. No es un modelo de lenguaje ni una red neuronal profunda: es un Support Vector Regressor (SVR) de scikit-learn 1.6.1 serializado con joblib que estima el precio de un portatil a partir de nueve especificaciones tecnicas (marca, tipo, familia de CPU, RAM, HDD, peso, densidad de pixeles, pantalla tactil y panel IPS).

El objetivo declarado es servir de herramienta de comprobacion de precios para minoristas, marketplaces y compradores: dada una ficha de producto, el modelo devuelve una estimacion de precio de referencia en la unidad monetaria del dataset original (INR, segun la fuente Kaggle de la que parece derivar). La salida es la mediana condicional del precio para esas especificaciones, no un intervalo de confianza.

Su relevancia es limitada fuera del ambito academico: el repositorio tiene 0 descargas y 0 likes, el tamano es de 0.0 GB, no se declara licencia y el modelo se entrena sobre 1.271 filas tras eliminar duplicados. Es util como ejemplo reproducible de pipeline de regresion tabular (one-hot encoding, StandardScaler, tuning con validacion cruzada de 5 folds y evaluacion unica sobre test), pero no como componente de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Support Vector Regressor (SVR) con kernel RBF, scikit-learn 1.6.1 |
| Parametros totales | no disponible (modelo no neuronal; el numero de vectores de soporte no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 23 columnas tras preprocesado) |
| Tipos de cuantizacion | no aplica (pesos joblib en coma flotante) |
| Idiomas soportados | no disponible (entrada tabular; las categorias estan en ingles: `Apple`, `Ultrabook`, `Intel Core i5`, etc.) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model_harga_laptop.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El modelo es un SVR con kernel RBF y hiperparametros `{'kernel': 'rbf', 'gamma': 0.1, 'epsilon': 0.05, 'C': 1}`, seleccionados mediante 5-fold cross-validation exclusivamente sobre el conjunto de entrenamiento. El preprocesado encadena tres pasos: agrupacion de niveles categoricos raros (menos de 10 filas de entrenamiento) en la categoria `Other`, one-hot encoding de las variables categoricas tomando el nivel mas frecuente como referencia, y estandarizacion de las columnas numericas con `StandardScaler`. El resultado son 23 columnas de entrada cuyo orden se persiste en `feature_names.joblib`.

Los datos provienen de `DATA_SET_LAPTOP_PRICE_PREDICTION.csv`: 1.273 filas brutas que quedan en 1.271 tras eliminar 2 duplicados, con 9 features y 1 target. La model card indica que el fichero no incluye metadatos de origen y que, por nombre de columnas, numero de filas y rango de precios, parece una derivacion del dataset publico de Kaggle "Laptop Price Prediction using specifications" de Arnab Chaki, con precios en INR. El target se almacena en logaritmo natural, de modo que la prediccion debe invertirse con `exp()`. La particion es 80:20 (1.016 de entrenamiento, 255 de test) con `random_state=42` y estratificacion por deciles de precio. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias, algo esperable en un modelo de regresion tabular.

## Capacidades

- Regresion tabular: estima `ln(precio)` a partir de nueve campos de entrada y devuelve un valor numerico continuo.
- Entrada con variables numericas (`Ram`, `Weight`, `Ppi`, `HDD`), binarias (`TouchScreen`, `Ips`) y categoricas (`Company` con 19 niveles, `TypeName` con 6, `Cpu_brand` con 5).
- Tratamiento explicito de categorias no vistas en entrenamiento mediante la regla de nivel raro → `Other`, lo que evita fallos en inferencia con marcas o tipos poco frecuentes.
- Preprocesado reproducible: el escalador y el orden de columnas se distribuyen como artefactos separados, lo que permite reconstruir exactamente la matriz de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un regresor numerico.
- No tiene capacidades multilingues en el sentido de NLP; las etiquetas de categoria estan fijadas en ingles.

## Casos de uso

- Comprobacion de precios en marketplaces: dado un listado nuevo con marca, CPU, RAM y peso, el modelo devuelve un precio de referencia en INR y permite marcar anuncios con desviaciones superiores al 17,70 % (MAPE de test) para revision manual.
- Soporte a compradores: una aplicacion web (el autor menciona una demo en Hugging Face Spaces) puede mostrar al usuario si una oferta esta por encima o por debajo de la mediana estimada para esas especificaciones.
- Analisis de surtido para minoristas: estimar el precio implicito de configuraciones hipoteticas (por ejemplo, subir de 8 a 16 GB de RAM) manteniendo el resto de variables fijas, para estudiar elasticidades aproximadas.
- Deteccion de anomalias en catalogos: comparar el precio publicado de cada SKU con la prediccion del modelo y priorizar la revision de aquellos con residual elevado.
- Docencia y prototipado de pipelines tabulares: sirve como referencia completa de un flujo con one-hot encoding, escalado, tuning por validacion cruzada y evaluacion con intervalos bootstrap.
- Integracion en un backend de precios: el modelo y el escalador se cargan con `joblib` y `huggingface_hub`, por lo que puede exponerse como endpoint ligero (por ejemplo, FastAPI) sin dependencias de GPU.

## Benchmarks y rendimiento

Resultados calculados una unica vez sobre las 255 filas de test no usadas en entrenamiento ni en tuning:

| Metrica | Escala log (ln precio) | Unidad de precio (INR) |
|---|---|---|
| MAE | 0,1720 | 10.312 |
| MSE | 0,05060 | 220.404.905 |
| RMSE | 0,2249 | 14.846 |
| R² | 0,8662 | 0,8178 |
| MAPE | no disponible | 17,70 % |

- Intervalo de confianza al 95 % (bootstrap) para RMSE en escala log: [0,2036; 0,2456]; para R² en escala log: [0,8297; 0,8945].
- El intervalo de prediccion del 80 % derivado de residuales out-of-fold de entrenamiento contiene el precio real en el 82,0 % de los portatiles de test.
- Mejor puntuacion de validacion cruzada durante el tuning (RMSE en escala log): 0,2450 (± 0,0182).

No se han publicado comparaciones con otros modelos (lineales, gradient boosting, random forest) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un SVR serializado con joblib y se ejecuta en CPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente para inferencia sobre una fila.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y los artefactos (`model_harga_laptop.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) son ficheros pequenos.
- Opciones de despliegue: script Python con `joblib` + `pandas` + `numpy` + `scikit-learn==1.6.1`; exposicion como API con FastAPI o Flask; integracion en un Hugging Face Space. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (prediccion sobre una fila de 23 columnas) cabe esperar latencias de milisegundos en CPU, aunque no se aporta ninguna medicion.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con alternativas en la informacion proporcionada. Como referencia cualitativa, la model card describe un unico algoritmo seleccionado por protocolo previo (SVR), sin tabla comparativa frente a otros regresores.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `telepaties/laptop-price-prediction-model` | no disponible (SVR) | no aplica | R² 0,8662 (log), MAPE 17,70 % | no disponible | Hugging Face |
| Alternativas de regresion tabular (p. ej. gradient boosting) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito muy restringido: solo predice precios de portatiles con las nueve variables del dataset; no generaliza a otras categorias de producto ni a otras monedas sin recalibracion.
- El target esta en INR y en escala logaritmica; cualquier uso en otra divisa exige conversion y validacion adicional.
- Conjunto de datos pequeno (1.271 filas tras deduplicar) y de origen incierto: la model card reconoce que el fichero no incluye metadatos y que la atribucion al dataset de Kaggle es una inferencia por nombres de columna y rangos.
- MAPE del 17,70 % y RMSE de 14.846 INR implican errores absolutos considerables en portatiles de gama alta; el intervalo del 80 % solo cubre el 82,0 % de los casos de test, por lo que existe un riesgo no despreciable de infraestimar o sobreestimar.
- Sesgo potencial por la composicion del dataset: 19 marcas y 6 tipos con niveles raros agrupados en `Other`, lo que puede degradar la prediccion para fabricantes poco representados.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Sin soporte de idiomas ni de texto libre: las categorias deben enviarse con las etiquetas exactas del entrenamiento (`Apple`, `Ultrabook`, `Intel Core i5`, etc.).
- Dependencia estricta de `scikit-learn==1.6.1` para deserializar los artefactos joblib; versiones distintas pueden romper la carga.
- No es un modelo de lenguaje: no genera explicaciones, no admite tool calling y no debe presentarse como asistente conversacional.
- Riesgo de alucinacion no aplica en el sentido de NLP, pero si de extrapolacion: entradas fuera de los rangos de entrenamiento (RAM 2-64 GB, peso 0,69-4,7 kg, PPI 90,58-352,47, HDD 0-2.000 GB) producen predicciones sin garantia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/telepaties/laptop-price-prediction-model
- Dataset de origen probable (Kaggle, Arnab Chaki): https://www.kaggle.com/datasets/arnabchaki/laptop-price-prediction
- Aplicacion web mencionada en la model card: alojada en Hugging Face (URL exacta no disponible en la informacion proporcionada)
- Repositorio de codigo, paper o blog: no disponible
