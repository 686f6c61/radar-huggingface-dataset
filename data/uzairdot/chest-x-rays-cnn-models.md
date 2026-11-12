# uzairdot/Chest-X-Rays-CNN-Models

## Resumen

Chest-X-Rays-CNN-Models es un repositorio de experimentos de clasificación binaria de imágenes de radiografías de tórax (NORMAL frente a PNEUMONIA) implementado en TensorFlow/Keras por el usuario uzairdot. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un paquete de pesos y artefactos de entrenamiento para un modelo de visión por computadora de tipo CNN. El repositorio incluye un CNN personalizado como modelo principal, junto con variantes de VGG16 y ResNet50 preentrenadas en ImageNet, tanto con backbone congelado como con fine-tuning parcial.

El problema que aborda es la detección automática de neumonía en radiografías de tórax, un caso de uso clásico de clasificación de imágenes médicas. El modelo principal es un CNN convolucional con tres bloques (32, 64 y 128 filtros), entrada RGB de 224 × 224 píxeles y una salida sigmoide que representa la probabilidad de neumonía. El repositorio tiene un tamaño de 0,6 GB y se distribuye bajo licencia AFL-3.0.

Es relevante como material de referencia reproducible para experimentos de clasificación de imágenes médicas con Keras, no como un modelo listo para producción clínica. La model card documenta con detalle el pipeline de preprocesamiento, la búsqueda de hiperparámetros y los artefactos de evaluación, lo que facilita la replicación del experimento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional personalizada (3 bloques conv/max-pooling) + variantes VGG16 y ResNet50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 × 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | AFL-3.0 |
| Formato de pesos | Keras (`.keras`), según los artefactos descritos en la model card |

## Arquitectura y entrenamiento

El modelo principal es un CNN personalizado compuesto por una capa de entrada con aumento de datos de entrenamiento (rotación, zoom, traslación y cambios de brillo, con ajustes ligero y fuerte) y un reescalado opcional a [-1, 1]. Le siguen tres bloques de convolución y max-pooling con 32, 64 y 128 filtros respectivamente, convoluciones de 3 × 3, activación ReLU y pooling de 2 × 2. Después hay un `Flatten`, una capa densa de 64 unidades con ReLU y regularización L2, dropout, y una única salida sigmoide que representa la puntuación de neumonía.

El entrenamiento usa el optimizador Adam, entropía cruzada binaria, accuracy y ROC-AUC como métricas, con checkpointing y early stopping monitorizando el AUC de validación. Los baselines VGG16 y ResNet50 usan pesos de ImageNet, preprocesamiento estilo Caffe específico de cada modelo, global average pooling y una cabeza de clasificación binaria; primero entrenan con el backbone congelado y luego hacen fine-tuning del último bloque convolucional a una décima parte del learning rate inicial, manteniendo las capas de batch normalization congeladas.

El dataset es el de Kaggle `paultimothymooney/chest-xray-pneumonia`, descargado vía `kagglehub`. El preprocesamiento combina las carpetas originales de train, val y test en un único dataframe, elimina imágenes ilegibles y duplicados exactos mediante hashes SHA-256 de los píxeles RGB y el tamaño, excluye imágenes idénticas con etiquetas conflictivas, convierte a RGB, redimensiona a 224 × 224 con interpolación bilineal y escala los píxeles a [0, 1]. Se genera un split estratificado 80/10/10 con semilla 42, se calculan pesos de clase balanceados y se verifica que no haya solapamiento de filas ni de hashes entre particiones. La búsqueda de hiperparámetros muestrea 30 configuraciones de 256 combinaciones posibles mediante `ParameterSampler(random_state=42)`, y se realiza un estudio de volumen de datos entrenando la configuración seleccionada con proporciones del 25 %, 50 %, 75 % y 100 % del conjunto de entrenamiento.

## Capacidades

- Clasificación binaria de imágenes de radiografías de tórax en las clases NORMAL y PNEUMONIA.
- Entrada de imágenes RGB de 224 × 224 píxeles, con conversión desde escala de grises a tres canales.
- Aumento de datos en entrenamiento mediante rotación, zoom, traslación y cambios de brillo.
- Evaluación con umbral de decisión fijo de 0,5, generando accuracy, precisión, recall y F1 por clase y macro, ROC-AUC, matrices de confusión y curvas ROC.
- Comparación de cinco variantes de modelo sobre el mismo split de test.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades generativas.

## Casos de uso

- Docencia y formación en visión por computadora médica: el notebook `CNN_PIPELINE.ipynb` sirve como ejemplo completo y reproducible de un pipeline de clasificación de imágenes con Keras, desde la limpieza del dataset hasta la evaluación y el análisis de errores.
- Prototipado de clasificadores de neumonía: el CNN personalizado y los baselines VGG16/ResNet50 permiten comparar enfoques desde cero frente a transfer learning en un mismo split de datos, útil para validar hipótesis antes de invertir en datasets propios.
- Estudio de volumen de datos: el experimento con proporciones del 25 %, 50 %, 75 % y 100 % del conjunto de entrenamiento permite analizar cómo escala el rendimiento con la cantidad de datos, útil para planificar la recogida de datos en proyectos clínicos.
- Búsqueda de hiperparámetros reproducible: la búsqueda aleatoria de 30 configuraciones con semilla fija y manifiesto de resultados sirve como plantilla para experimentos de tuning en otros dominios de imagen médica.
- Análisis de errores y revisión cualitativa: los artefactos `sample_predictions.png`, `misclassified_images.png` y `error_review.csv` facilitan la inspección manual de fallos, útil para auditorías de calidad de modelos.
- Referencia para integración en pipelines de investigación: los checkpoints en formato `.keras` y los historiales de entrenamiento permiten reutilizar los modelos en cuadernos de investigación o como línea base en comparaciones con arquitecturas más modernas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las métricas que se calculan (accuracy, precisión, recall, F1, ROC-AUC) y los artefactos donde se guardan (`model_comparison.csv`, `*_report.csv`, `*_confusion_matrix.csv`), pero no incluye los valores numéricos obtenidos por ninguno de los modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un CNN de este tamaño (tres bloques con 32, 64 y 128 filtros y entrada 224 × 224 × 3) es previsible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: la model card indica ejecutar el notebook en Google Colab con runtime de GPU, sin especificar modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: TensorFlow/Keras en cuadernos Jupyter o Google Colab; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Memoria RAM: la model card advierte que el CNN almacena los arrays de imágenes en RAM, por lo que recomienda varios GB de memoria disponible además del overhead de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uzairdot/Chest-X-Rays-CNN-Models | CNN personalizado + VGG16/ResNet50 | no disponible | 224 × 224 × 3 | AFL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El split es a nivel de imagen, no agrupado por paciente, lo que puede producir fuga de información entre particiones si un mismo paciente aparece en train y test.
- No se han publicado métricas de rendimiento en la model card, por lo que no es posible evaluar la calidad del modelo sin ejecutar el pipeline.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El notebook no fija versiones de dependencias, lo que puede comprometer la reproducibilidad a medio plazo.
- El dataset de Kaggle puede contener sesgos de población y de adquisición que se trasladarían al modelo entrenado.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con implicaciones clínicas potencialmente graves.
- La licencia AFL-3.0 permite uso comercial con obligaciones de atribución y de divulgación del código fuente de las modificaciones; conviene revisar los términos completos antes de un uso en producción.
- No debe utilizarse como herramienta de diagnóstico clínico sin validación externa, aprobación regulatoria y supervisión médica.
- El repositorio se distribuye como material de experimentación, no como un producto sanitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uzairdot/Chest-X-Rays-CNN-Models
- Dataset de Kaggle: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
- Referencia de VGG16 en Keras: no disponible en la información proporcionada
- Referencia de ResNet50 en Keras: no disponible en la información proporcionada
