# WalterWi/keras_regresion

## Resumen

`WalterWi/keras_regresion` es un modelo de regresión tabular publicado en Hugging Face por el autor WalterWi en el marco del Seminario de Actualización del IFTS N.º 18, con la docente Cynthia M. Villagra como responsable. No es un modelo de lenguaje ni un transformer generativo: es un ejemplo pedagógico de regresión lineal implementado con Keras 3 que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada (superficie en metros cuadrados, presencia de balcón y presencia de ascensor).

El modelo emplea una arquitectura `Sequential` mínima compuesta por una capa `Normalization` seguida de una capa `Dense(1)`, lo que se traduce en tres pesos más un sesgo. Se entrenó sobre un dataset sintético de 200 registros generados con semilla fija, de los cuales 160 se destinaron a entrenamiento y 40 a evaluación. La relevancia del artefacto es exclusivamente didáctica: ilustra el flujo completo de entrenamiento, exportación en formato nativo `.keras` y carga posterior para inferencia, incluyendo la persistencia de la capa de normalización dentro del propio archivo del modelo.

El modelo no dispone de ventana de contexto, no procesa texto ni imágenes y no soporta tool calling ni razonamiento multi-paso. Su única función es la inferencia numérica sobre un vector de tres características en un orden estricto. La licencia MIT permite reutilización libre, aunque su valor práctico fuera del ámbito educativo es nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Keras `Sequential`: `Normalization` + `Dense(1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward de una sola capa oculta, en la práctica una regresión lineal con normalización previa de entradas. La capa `Normalization` aprende la media y la desviación típica de cada característica durante la llamada a `adapt()` sobre los datos de entrenamiento, y dichos parámetros quedan almacenados dentro del archivo `model.keras`. La capa `Dense(1)` aplica una combinación lineal de las tres entradas normalizadas más un sesgo, produciendo la predicción del precio.

El entrenamiento se realizó de forma supervisada sobre 200 registros sintéticos generados en `train.py` con semilla fija, usando 160 para entrenamiento y 40 para evaluación. Se empleó la pérdida de error cuadrático medio (`mse`), el optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. El modelo se construyó con Keras 3 usando backend PyTorch, aunque la model card indica compatibilidad con TensorFlow. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión tabular.

## Capacidades

- Regresión tabular: predice una variable numérica continua (precio en miles de US$) a partir de tres entradas (`m2`, `balcon`, `ascensor`).
- Normalización integrada: la capa `Normalization` se guarda dentro del modelo, por lo que no es necesario normalizar manualmente las entradas en inferencia.
- Exportación en formato nativo `.keras`: el archivo contiene arquitectura, pesos, normalización y configuración de entrenamiento en un único contenedor.
- Compatibilidad con backend PyTorch y TensorFlow a través de Keras 3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá de la documentación en español.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de regresión lineal con Keras: el modelo sirve como ejemplo mínimo y reproducible para introducir el flujo de entrenamiento, evaluación y exportación en cursos de machine learning, dado que su arquitectura de cuatro parámetros permite inspeccionar cada peso individualmente.
- Comparación de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch del seminario, permite contrastar cómo cada biblioteca gestiona la normalización (integrada en el modelo en Keras, separada en PyTorch) y el formato de serialización.
- Demostración de persistencia de preprocesado: la inclusión de la capa `Normalization` dentro de `model.keras` ilustra una buena práctica de empaquetado de pipelines de preprocesado junto con los pesos, evitando desajustes entre entrenamiento e inferencia.
- Prueba de integración de Keras 3 con backend PyTorch: el modelo permite verificar la instalación y el funcionamiento de Keras 3 sobre PyTorch en entornos docentes o de laboratorio.
- Ejemplo de carga y predicción en scripts: `predict.py` demuestra cómo cargar un modelo `.keras` y ejecutar inferencia sobre un array NumPy con `float32`, patrón reutilizable en proyectos mayores.
- Plantilla para extensiones didácticas: los estudiantes pueden sustituir el dataset sintético por datos reales o ampliar la capa `Dense` para explorar sobreajuste, regularización o arquitecturas más profundas partiendo de una base funcional.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MAE (40 registros de evaluación) | 3,10 miles de US$ |
| R² (40 registros de evaluación) | 0,989 |

No se han publicado resultados de benchmarks adicionales en la información disponible. Las métricas anteriores corresponden exclusivamente al conjunto de evaluación sintético de 40 registros descrito en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo consta de cuatro parámetros y un archivo `.keras` de tamaño mínimo.
- GPU recomendadas: no requiere GPU; la inferencia puede ejecutarse en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma documentada; por la naturaleza del modelo, la latencia es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WalterWi/keras_regresion | 4 | no aplica | MAE 3,10; R² 0,989 (eval. sintética) | MIT | Hugging Face |
| Ejemplo de regresión con scikit-learn (mismo seminario) | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card |
| Ejemplo de regresión con PyTorch (mismo seminario) | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los ejemplos comparables de scikit-learn y PyTorch mencionados en la model card, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce viviendas de entre 35 y 120 m²; fuera de ese rango las predicciones no son fiables.
- Orden estricto de columnas: las entradas deben proporcionarse como `m2`, `balcon`, `ascensor`; el modelo recibe un array NumPy sin nombres de columna, por lo que un orden incorrecto produce predicciones erróneas sin aviso.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo extrapola linealmente fuera del dominio de entrenamiento sin señalizar incertidumbre.
- Sesgos conocidos: no documentados; al ser datos sintéticos, cualquier sesgo proviene del generador de datos y no de una población real.
- Uso comercial: la licencia MIT lo permite, pero su utilidad práctica en producción es nula dado el carácter sintético de los datos y la ausencia de validación externa.
- Sin soporte de GPU ni de despliegue a gran escala: no está pensado para servir cargas de trabajo concurrentes ni para integrarse en pipelines de inferencia de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WalterWi/keras_regresion
- Tutorial de regresión con Keras (Machine Learning Mastery): https://machinelearningmastery.com/regression-tutorial-keras-deep-learning-library-python/
- Notebook de regresión con Keras (Coursera AI Course, Google Colab): https://colab.research.google.com/github/jbEmanuel/Build-a-Regression-Model-in-Keras---Coursera-AI-Course/blob/main/Build_a_Regression_Model_in_Keras_Coursera_AI_Course.ipynb
