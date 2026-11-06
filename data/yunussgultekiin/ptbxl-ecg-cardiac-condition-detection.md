# yunussgultekiin/ptbxl-ecg-cardiac-condition-detection

## Resumen

PTB-XL ECG Cardiac Condition Detection es un proyecto de investigación de código abierto desarrollado por el usuario yunussgultekiin que aborda la detección multi-etiqueta de cinco superclases diagnósticas cardíacas (NORM, MI, STTC, CD, HYP) a partir de electrocardiogramas de 12 derivaciones de 10 segundos de duración. El modelo se entrena sobre el dataset público PTB-XL 1.0.3 de PhysioNet, que contiene 21.799 registros de 18.869 pacientes, y utiliza las señales remuestreadas a 100 Hz (12 × 1000 muestras por registro) junto con metadatos del paciente como edad y sexo.

El proyecto no se limita a un único modelo: compara diez arquitecturas de deep learning bajo un protocolo de entrenamiento determinista y completamente trazado, selecciona la mejor (una CNN 1D) y después estudia cinco métodos de aumento de datos sobre ella, incorporando una etapa final de IA explicable. En total se ejecutan 15 pipelines completos de entrenamiento, cada uno con validación cruzada de cinco folds, selección de umbral out-of-fold, entrenamiento del modelo final, evaluación en test, intervalos de confianza y registro del modelo en MLflow.

La relevancia del proyecto radica en su enfoque metodológico: protocolo compartido, determinismo, trazabilidad con MLflow y análisis de explicabilidad, lo que lo convierte en una referencia útil para investigadores que trabajan en clasificación de señales biomédicas. El autor declara explícitamente que se trata de un proyecto de investigación y que no es un dispositivo médico ni ha sido validado clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (seleccionada entre 10 arquitecturas comparadas; el resto de arquitecturas concretas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 12 × 1000 muestras (10 s a 100 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre señales, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería PyTorch; tamaño del repo 0,4 GB) |

## Arquitectura y entrenamiento

El proyecto compara diez arquitecturas de deep learning que representan distintas formas de modelar una señal de ECG, todas bajo un protocolo común de entrenamiento determinista. La arquitectura finalmente seleccionada para la fase de aumento de datos es una CNN 1D, elegida tras la comparación de las diez alternativas. La entrada del modelo es una señal de 12 derivaciones con 1.000 muestras por derivación (100 Hz, 10 segundos), complementada con la edad y el sexo del paciente como metadatos. La salida es multi-etiqueta sobre las cinco superclases diagnósticas (NORM, MI, STTC, CD, HYP), ya que un mismo ECG puede portar varios diagnósticos simultáneos.

El entrenamiento se realiza sobre el dataset PTB-XL 1.0.3 (licencia CC BY 4.0), con 21.799 registros y un etiquetado jerárquico de 44 enunciados diagnósticos SCP-ECG agrupados en 23 subclases y 5 superclases, donde cada enunciado lleva asociada una probabilidad de verosimilitud entre 0 y 100. El protocolo incluye normalización calculada a partir de los datos de entrenamiento de cada partición, validación cruzada de cinco folds, selección de umbral out-of-fold, entrenamiento del modelo final, evaluación en test con intervalos de confianza y registro del modelo en MLflow. No se especifica en la información disponible el número de tokens ni la composición detallada del dataset de entrenamiento más allá de la descripción del PTB-XL.

## Capacidades

- Clasificación multi-etiqueta de cinco superclases diagnósticas cardíacas a partir de ECG de 12 derivaciones: NORM (normal), MI (infarto de miocardio), STTC (cambios ST/T), CD (trastorno de conducción) e HYP (hipertrofia).
- Procesamiento de señales de series temporales biomédicas con entrada fija de 12 × 1000 muestras a 100 Hz.
- Integración de metadatos del paciente (edad y sexo) junto con la señal para la predicción.
- Aumento de datos: el proyecto estudia cinco métodos de aumento de datos sobre la arquitectura CNN 1D seleccionada.
- IA explicable: etapa final de análisis de explicabilidad de las predicciones.
- Trazabilidad de experimentos mediante MLflow, con registro de modelos y seguimiento de métricas.
- Determinismo y reproducibilidad completos en los 15 pipelines de entrenamiento.
- No dispone de capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un modelo discriminativo de clasificación de señales.

## Casos de uso

- Investigación en clasificación automática de ECG: el modelo sirve como referencia reproducible para comparar arquitecturas de deep learning sobre el benchmark PTB-XL, gracias al protocolo determinista y a los 15 pipelines completos documentados.
- Detección de infarto de miocardio (MI) en señales de 12 derivaciones: la salida multi-etiqueta permite marcar registros con sospecha de infarto como paso previo a revisión clínica en entornos de investigación.
- Identificación de trastornos de conducción (CD) e hipertrofia (HYP): el modelo puede emplearse para estudiar la separabilidad de estas superclases en señales de 100 Hz y analizar qué derivaciones contribuyen más a cada predicción mediante las técnicas de IA explicable incluidas.
- Estudio de cambios ST/T (STTC): útil en investigación para analizar patrones de repolarización y su relación con las etiquetas SCP-ECG del dataset.
- Evaluación de métodos de aumento de datos en señales biomédicas: los cinco métodos de aumento implementados y comparados sobre la CNN 1D sirven como base metodológica para otros proyectos de series temporales médicas.
- Reproducción de experimentos con MLflow: el registro de modelos y el seguimiento de métricas permiten auditar y replicar resultados en entornos de investigación, incluyendo la selección de umbrales out-of-fold.
- Prototipado de pipelines de clasificación de señales con validación cruzada de cinco folds: el repositorio puede reutilizarse como plantilla para otros datasets de series temporales con etiquetado multi-etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el proyecto declara métricas ROC-AUC y F1 en sus metadatos y que compara diez arquitecturas, pero no se incluyen los valores numéricos de los resultados en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es una CNN 1D sobre señales de 12 × 1000 muestras, por lo que la huella de memoria es reducida, pero no se especifican cifras.
- GPU recomendadas: no disponible. Dado el tamaño del repositorio (0,4 GB) y la naturaleza del modelo (CNN 1D sobre series temporales), es probable que quepa en GPU de consumo, pero esta afirmación no está confirmada en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería es PyTorch; no se documentan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de otros modelos comparables ni referencias numéricas que permitan establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor declara explícitamente que el proyecto no es un dispositivo médico, no ha sido validado clínicamente y no debe usarse para diagnóstico médico ni para decisiones de tratamiento.
- Riesgo de alucinación y falsos positivos/negativos: al ser un clasificador multi-etiqueta sobre datos clínicos, puede producir predicciones erróneas; no se documentan análisis de calibración ni tasas de error en la información disponible.
- Sesgos conocidos: no documentados en la información disponible. El dataset PTB-XL puede presentar sesgos demográficos y de centro hospitalario que no se detallan.
- Limitaciones de contexto e idioma: la entrada está fija a señales de 10 segundos a 100 Hz (12 × 1000 muestras); no procesa señales de mayor duración ni otras frecuencias de muestreo sin remuestreo previo. No aplica soporte multilingüe.
- Restricciones de licencia: el modelo se distribuye bajo licencia MIT, que permite uso comercial, pero el dataset PTB-XL subyacente está bajo CC BY 4.0 y el uso clínico real está desaconsejado por el propio autor.
- Caveat para producción: el proyecto no incluye el dataset completo en el repositorio (solo los JSON generados en `data/processed/`), por lo que es necesario descargar PTB-XL 1.0.3 desde PhysioNet y colocarlo en `data/raw/` para reproducir los entrenamientos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunussgultekiin/ptbxl-ecg-cardiac-condition-detection
- Dataset PTB-XL en PhysioNet: https://physionet.org/content/ptb-xl/1.0.3/
- DOI del dataset PTB-XL: https://doi.org/10.13026/kfzx-aw45
