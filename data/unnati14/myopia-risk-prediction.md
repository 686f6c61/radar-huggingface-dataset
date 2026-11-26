# unnati14/myopia-risk-prediction

## Resumen

MyopiaGuard es un sistema de prediccion de riesgo de miopia desarrollado por la usuaria de Hugging Face unnati14 como proyecto academico de fin de carrera (sexto semestre). No es un modelo de lenguaje: es un conjunto de clasificadores y regresores tabulares entrenados con scikit-learn y XGBoost que estiman, a partir de datos de cuestionario (edad, tiempo de pantalla, trabajo de cerca, tiempo al aire libre, antecedentes familiares, tipo de colegio, estado de la India), la probabilidad de error refractivo, el riesgo de progresion y una estimacion aproximada de dioptrias.

El sistema se despliega como un pipeline de tres etapas: un clasificador XGBoost que determina si existe error refractivo (ROC-AUC 0,945 en 1.000 muestras de test), un GradientBoosting con restricciones monotonas que estima el riesgo de progresion (ROC-AUC 0,894) y un RandomForestRegressor que estima dioptrias (MAE 1,71 D, R² negativo). Ademas incluye un clasificador de imagenes oculares basado en MobileNetV2 (Keras) con exportacion ONNX.

Su relevancia es limitada y acotada al ambito academico y de investigacion: no es un dispositivo medico, el dataset cubre unicamente estados de la India y la etapa de regresion no supera a predecir la media. Es util como referencia de pipeline tabular medico y como ejemplo de integracion de modelos clasicos con una API y una app web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos tabulares clasicos: XGBoost (etapa 1), GradientBoosting con restricciones monotonas (etapa 2), RandomForestRegressor (etapa 3); MobileNetV2 (Keras/ONNX) para imagenes |
| Parametros totales | no disponible (modelos clasicos de arboles; el numero de parametros no aplica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada tabular de 27-30 features) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de arboles; el clasificador de imagenes se distribuye en Keras y ONNX) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | .pkl (pickles de joblib/scikit-learn), .keras, .onnx, .json (listas de features y metadatos) |

## Arquitectura y entrenamiento

El sistema combina tres modelos supervisados sobre un dataset sintetico o recopilado de 5.000 muestras (4.000 de entrenamiento, 1.000 de test) con 17 variables de entrada en bruto que se transforman en features derivadas (por ejemplo `Age_Screen`, `Screen_Outdoor_Ratio` y columnas one-hot `State_*`). La etapa 1 usa XGBoost con 29 features; la etapa 2 usa GradientBoosting con 30 features y restricciones monotonas para forzar direcciones coherentes con el conocimiento clinico; la etapa 3 usa un RandomForestRegressor sobre un subconjunto de 27 features. Cada etapa tiene su propio escalador (`StandardScaler` presumiblemente) y su propia lista de columnas.

El clasificador de imagenes es una MobileNetV2 preentrenada y ajustada con Keras para distinguir ojos con miopia de ojos normales, exportada tambien a ONNX para inferencia portable. No se documenta el volumen de tokens ni el proceso de RLHF/DPO porque no aplica: son modelos supervisados clasicos. La innovacion tecnica destacable es el uso de restricciones monotonas en la etapa 2 y la mezcla del score del modelo con reglas clinicas basadas en evidencia, de modo que la salida final de la API no es el raw output del modelo. Los modelos se entrenaron con scikit-learn 1.7.2 y xgboost 3.2.0.

## Capacidades

- Clasificacion binaria de presencia de error refractivo a partir de datos de cuestionario (etapa 1).
- Clasificacion de riesgo de progresion alto frente a bajo/moderado (etapa 2), con score mezclado con reglas clinicas.
- Regresion de dioptrias absolutas (etapa 3), con precision limitada (R² negativo).
- Clasificacion de imagenes oculares (miopia frente a normal) mediante MobileNetV2, con exportacion ONNX.
- Inferencia via API HTTP desplegada en Hugging Face Spaces (endpoint `/predict`).
- Carga local en Python con joblib y onnxruntime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- Capacidad multilingue limitada a ingles en la documentacion y etiquetas.

## Casos de uso

- Triaje educativo en colegios: introducir respuestas de cuestionario de alumnos y obtener una probabilidad de error refractivo para priorizar derivaciones a revision optometrica, usando la etapa 1 con ROC-AUC 0,945.
- Campanas de cribado en zonas rurales de la India: la API acepta el estado y el tipo de ubicacion (urbano/rural) como features, lo que permite segmentar poblaciones con mayor riesgo de progresion.
- Investigacion academica sobre factores de riesgo: el dataset de 5.000 muestras y los modelos sirven como base reproducible para estudiar la relacion entre tiempo de pantalla, tiempo al aire libre y miopia.
- Prototipado de apps de salud visual: la app en Vercel y la API en Spaces permiten integrar el pipeline en un frontend sin infraestructura propia.
- Clasificacion de imagenes de fondo de ojo en entornos con recursos limitados: el ONNX de MobileNetV2 se ejecuta con onnxruntime en CPU y permite inferencia portable en dispositivos modestos.
- Demostracion docente de pipelines tabulares medicos: ejemplifica escalado, ingenieria de features, restricciones monotonas y mezcla con reglas clinicas en un caso realista.
- Comparacion de modelos clasicos frente a redes neuronales en datos tabulares medicos: el repositorio incluye un modelo antiguo (`has_re_model.pkl`) para contrastar.

## Benchmarks y rendimiento

| Modelo | Tarea | Metrica | Resultado |
|---|---|---|---|
| XGBoost (`has_re_model_improved.pkl`) | Etapa 1: error refractivo si/no | ROC-AUC | 0,945 |
| GradientBoosting (`risk_progression_model.pkl`) | Etapa 2: riesgo alto vs bajo/moderado | ROC-AUC | 0,894 |
| RandomForestRegressor (`diopter_regression_model.pkl`) | Etapa 3: dioptrias | MAE / RMSE / R² | 1,71 D / 2,09 D / −0,09 |
| MobileNetV2 (`myopia_image_classifier.keras`) | Imagen ocular: miopia vs normal | Accuracy | 99,7 % (reportado) |

Las metricas corresponden a 1.000 muestras reservadas de test. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: los modelos de arboles (.pkl) y el ONNX se ejecutan en CPU sin GPU; el consumo de memoria es del orden de decenas o cientos de MB, no disponible con precision.
- GPU recomendadas: no necesarias para los modelos tabulares; el clasificador Keras puede beneficiarse de cualquier GPU compatible con TensorFlow, pero no se especifica.
- Cabe en cualquier GPU consumer y en equipos sin GPU.
- Opciones de despliegue: API HTTP en Hugging Face Spaces, ejecucion local con joblib y onnxruntime, y exportacion ONNX para runtimes portables; no se documenta vLLM, llama.cpp, Ollama ni TGI porque no aplican.
- Latencia y throughput: no disponibles; la primera peticion a la API tras un periodo de inactividad puede tardar alrededor de un minuto porque el Space gratuito se suspende.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MyopiaGuard (unnati14) | Pipeline tabular XGBoost/GB/RF + MobileNetV2 | no aplica | no aplica | ROC-AUC 0,945 / 0,894; R² −0,09 | MIT | Hugging Face + API + GitHub |
| Modelos de cribado de miopia basados en imagen (literatura) | CNN sobre fondo de ojo | no disponible | no disponible | no disponible | variable | no disponible en esta ficha |
| Modelos tabulares genericos de riesgo medico | XGBoost/LightGBM | no aplica | no aplica | dependiente del dataset | variable | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un dispositivo medico: es un proyecto academico de educacion e investigacion y no sustituye una exploracion por optometrista u oftalmologo.
- La etapa 3 (dioptrias) tiene R² negativo en test (−0,09), por lo que no supera a predecir la media; su salida debe tratarse solo como indicacion aproximada.
- El score de riesgo de la etapa 2 mezcla el modelo con reglas clinicas, de modo que no es el raw output del modelo.
- El dataset cubre unicamente estados de la India; los resultados pueden no transferirse a otras poblaciones.
- Riesgo de sesgo por la composicion del dataset y por la naturaleza autodeclarada de las respuestas del cuestionario.
- Riesgo de alucinacion no aplica (no genera texto), pero si de falsa confianza en las probabilidades si se usa fuera de su dominio.
- Los archivos .pkl son pickles de Python: solo deben cargarse desde fuentes de confianza.
- La licencia MIT permite uso comercial, pero la condicion de no dispositivo medico limita su uso en produccion clinica.
- La API gratuita se suspende por inactividad, lo que afecta a la disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unnati14/myopia-risk-prediction
- App en vivo: https://myopiaguard.vercel.app
- API en Hugging Face Spaces: https://huggingface.co/spaces/unnati14/myopia-risk-api
- Codigo en GitHub: https://github.com/unnatii14/Myopia-Risk-Prediction
- Funciones de ingenieria de features: https://github.com/unnatii14/Myopia-Risk-Prediction/blob/main/backend/api.py
