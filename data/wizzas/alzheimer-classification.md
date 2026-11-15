# Wizzas/alzheimer-classification

## Resumen

NeuroInsight (publicado en Hugging Face como `Wizzas/alzheimer-classification`) es un proyecto academico de clasificacion de la enfermedad de Alzheimer que combina dos flujos de trabajo independientes: un clasificador de imagenes de resonancia magnetica cerebral basado en VGG16 y un clasificador tabular sobre datos clinicos estructurados. No es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de portfolio que empaqueta pesos ONNX y codigo fuente de una aplicacion Streamlit multipagina. Lo desarrolla Wilbert Andrew Yonathan (usuario Wizzas), con contribuciones de equipo, y se publica como pieza de portfolio educativo.

El problema que aborda es la clasificacion en cuatro categorias de demencia (Mild Dementia, Moderate Dementia, Non Dementia y Very Mild Dementia) a partir de imagenes MRI de 176 x 208 pixeles, y la clasificacion en tres categorias (Alzheimer, deterioro cognitivo leve tardio y cognitivamente normal) a partir de features clinicos del consorcio ADNI. La relevancia es limitada al ambito docente: demuestra comparacion de modelos, preprocesado, ajuste de hiperparametros y presentacion interactiva de predicciones, no un sistema clinico validado.

El repositorio ocupa 0,1 GB y no incluye los ficheros pickle originales (`alzheimer_info_model.pkl`, `alzheimer_mri.pkl`) por motivos de seguridad, ya que los pickle pueden ejecutar codigo al cargarse. Los pesos estan disponibles en el repositorio de GitHub del autor. No se dispone de informacion sobre licencia, idiomas ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG16 (CNN) para MRI; regresion logistica y otras familias clasicas para datos clinicos |
| Parametros totales | no disponible (VGG16 base: aproximadamente 138 millones en su variante densa completa; no confirmado para este artefacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX y pickle; sin cuantizacion documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX y pickle (`.pkl`); los pickle no se incluyen en la copia de Hugging Face |

## Arquitectura y entrenamiento

El flujo MRI emplea una red VGG16 preentrenada, ajustada con optimizador Adam sobre un dataset de Kaggle con 6.400 imagenes JPEG de 176 x 208 pixeles, divididas en 5.121 de entrenamiento y 1.279 de test. Las etiquetas de la aplicacion son cuatro clases de demencia. El preprocesado explorado incluye redimensionado, normalizacion y aumento de datos. La seleccion de hiperparametros se realizo con optimizacion bayesiana mediante GPyOpt, explorando tasa de aprendizaje, numero de capas entrenables, epocas y configuracion del split. La evaluacion se hizo con accuracy, precision, recall, F1 y matrices de confusion.

El flujo clinico utiliza features estructurados de ADNI (demograficos, cognitivos y geneticos) con la variable objetivo `DX.bl` y tres clases. Se aplico tratamiento de valores faltantes, one-hot encoding, analisis exploratorio y experimentos con SMOTE. Se compararon nueve familias de clasificadores: LDA, regresion logistica, Random Forest, Ridge, Gradient Boosting, MLP, XGBoost, SVM (lineal y polinomial) y SGD, con comparaciones entre lineas base y modelos ajustados con GridSearchCV. El CSV exacto de ADNI, su version y el pipeline de procesado no estan confirmados en la documentacion.

## Capacidades

- Clasificacion de imagenes MRI cerebrales en cuatro categorias de demencia mediante VGG16.
- Clasificacion de datos clinicos tabulares en tres categorias diagnosticas.
- Interfaz Streamlit multipagina con inicio, chatbot, prediccion clinica, subida y prediccion de MRI, e informacion del equipo.
- Carga de imagenes subidas por el usuario para inferencia con el modelo MRI guardado (no reentrena al arrancar).
- Chatbot configurable mediante un fichero `.env` local.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la clasificacion de imagen.
- No es un modelo generativo de texto ni un modelo de lenguaje.

## Casos de uso

- Demostracion docente de pipelines de vision artificial: el proyecto sirve para ilustrar el ciclo completo de entrenamiento, validacion y despliegue de un clasificador VGG16 sobre imagenes medicas, con metricas y matrices de confusion documentadas.
- Portfolio tecnico para candidaturas: el repositorio y la demo en Render permiten mostrar competencias en preprocesado de imagenes, optimizacion bayesiana de hiperparametros y desarrollo de interfaces Streamlit.
- Comparacion de familias de clasificadores tabulares: el flujo clinico permite reproducir la comparacion entre nueve algoritmos (LDA, regresion logistica, Random Forest, XGBoost, SVM, etc.) sobre un mismo conjunto de features de ADNI.
- Estudio de tecnicas de desbalanceo: la distribucion del dataset MRI (3.200 imagenes NonDemented frente a 64 ModerateDemented) lo convierte en un caso practico para experimentar con SMOTE, aumento de datos y metricas robustas a clases minoritarias.
- Prototipo de interfaz clinica interactiva: la aplicacion Streamlit puede adaptarse como maqueta de una herramienta de apoyo a la decision que reciba una imagen o un formulario de datos clinicos y devuelva una prediccion.
- Analisis del efecto del tuning: el caso documentado en el que GridSearchCV redujo la accuracy de regresion logistica del 72 % al 69 % sirve como ejemplo realista de que el ajuste de hiperparametros no siempre mejora el rendimiento.
- Base para experimentos de explicabilidad: al ser un modelo pequeno y con pesos exportables, puede utilizarse para probar tecnicas de visualizacion de activaciones o mapas de saliencia sobre imagenes MRI.

## Benchmarks y rendimiento

Resultados reportados en la presentacion original del coursework. No han sido reproducidos de forma independiente desde el repositorio actual.

| Flujo | Modelo | Accuracy | Precision | Recall | F1 |
|---|---|---:|---:|---:|---:|
| MRI cerebral | VGG16 CNN | 91 % | 92 % | 92 % | 92 % |
| Datos clinicos | Regresion logistica | 72 % | 72 % | 71 % | 71 % |
| Datos clinicos (tras GridSearchCV) | Regresion logistica | 69 % | no disponible | no disponible | no disponible |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Un VGG16 en inferencia con imagenes de 176 x 208 pixeles requiere tipicamente entre 1 y 2 GB de VRAM en FP32, pero este dato no esta confirmado para el artefacto publicado.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (GTX 1060 en adelante) es suficiente para inferencia de VGG16 a esta resolucion.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2 GB de VRAM; no confirmado en la documentacion.
- Opciones de despliegue: Streamlit (interfaz principal), ONNX Runtime para los pesos ONNX y Python 3.11 en entorno Conda. La demo publica se aloja en Render.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wizzas/alzheimer-classification | VGG16 + clasificadores tabulares | no disponible | no aplica | 91 % accuracy MRI; 72 % accuracy clinico | no disponible | Hugging Face y GitHub |
| Clasificadores MRI de Alzheimer en Kaggle | CNN o transfer learning | variable | no aplica | variable segun notebook | variable | Kaggle |
| Modelos fundacionales medicos (p. ej., Med-PaLM, BiomedCLIP) | LLM o vision-lenguaje | miles de millones | largo | no comparable directamente | variable | no disponible |

No se dispone de una comparativa rigurosa con alternativas equivalentes en la informacion proporcionada. El artefacto es un proyecto academico, no un modelo de referencia con benchmarks estandarizados.

## Limitaciones y advertencias

- No es un dispositivo medico ni un sistema diagnostico validado; no debe usarse para decisiones clinicas.
- Los resultados (91 % y 72 % de accuracy) proceden de la presentacion del coursework y no han sido reproducidos de forma independiente.
- El dataset MRI presenta un desbalance severo: 3.200 imagenes NonDemented frente a 64 ModerateDemented, lo que puede inflar la accuracy global y degradar el rendimiento en clases minoritarias.
- Los archives no establecen un split a nivel de paciente; particiones aleatorias de imagenes pueden producir fuga de datos entre entrenamiento y test.
- El origen exacto del CSV clinico de ADNI (version, export y procesado) no esta confirmado; no debe describirse como una release oficial de ADNI.
- Los ficheros pickle pueden ejecutar codigo al cargarse y no se incluyen en la copia de Hugging Face; deben obtenerse del repositorio de GitHub con precaucion.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- El chatbot requiere configuracion local mediante `.env` y no se documenta su backend ni sus limitaciones.
- El modelo solo maneja imagenes de 176 x 208 pixeles y cuatro clases; no generaliza a otras modalidades ni a otras resoluciones sin reentrenamiento.
- No hay informacion sobre sesgos demograficos, equidad entre subpoblaciones ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Wizzas/alzheimer-classification
- GitHub: https://github.com/WAYTECHG/alzheimer-classification
- Demo en Render: https://alzheimer-classification-l7s2.onrender.com/#home
- Dataset MRI en Kaggle: https://www.kaggle.com/datasets/psraju2024/alzheimers-dataset-4-class-of-images
- Paper de referencia del dataset: https://doi.org/10.1007/s11042-023-15738-7
- ADNI oficial: https://adni.loni.usc.edu/
- Acceso a datos ADNI: https://adni.loni.usc.edu/data-samples/adni-data/
