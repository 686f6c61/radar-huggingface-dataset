# ZEROTSUDIOS/cat-breed-classifier

## Resumen

Cat Breed Classifier es un modelo de clasificación de imágenes desarrollado por el usuario ZEROTSUDIOS y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino de EfficientNetV2S, preentrenado en ImageNet, al que se le ha sustituido la cabeza de clasificación por un bloque denso propio: Dense(512) → Dense(256) → Softmax(67). Su única tarea es asignar una fotografía de un gato a una de las 67 razas contempladas en el conjunto de datos de entrenamiento.

El modelo resuelve un problema acotado y muy concreto: la clasificación cerrada de razas felinas a partir de imágenes RGB de 224 × 224 píxeles. No es un modelo de lenguaje ni un modelo multimodal generativo, por lo que no dispone de ventana de contexto, capacidades de razonamiento, tool calling ni soporte multilingüe en el sentido habitual. Su relevancia práctica radica en que ofrece un punto de partida listo para usar en aplicaciones de visión por computador de bajo coste computacional, ya que EfficientNetV2S es una arquitectura compacta y eficiente en FLOPs.

El repositorio ocupa 0,1 GB y contiene únicamente los pesos en formato Keras H5 más la model card. En el momento de la consulta acumula 0 descargas y 0 likes, y la model card no incluye métricas de evaluación, detalles de hiperparámetros ni información sobre el proceso de entrenamiento más allá del esquema en dos fases. Se trata, por tanto, de una publicación de carácter personal y sin validación externa documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2S (preentrenado en ImageNet) con cabeza Dense(512) → Dense(256) → Softmax(67) |
| Parametros totales | No disponible en la model card (el backbone EfficientNetV2-S declara ~21,5 M en el paper original; el total con la cabeza no está confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada fija de 224 × 224 RGB) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en punto flotante dentro del fichero H5) |
| Idiomas soportados | No disponible (no aplica: clasificación de imágenes, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras H5 (`cat_breed_model.h5`), TensorFlow/Keras |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional EfficientNetV2S, variante «S» de la familia EfficientNetV2, que combina bloques MBConv y Fused-MBConv con entrenamiento consciente de la progresión de resolución. El backbone parte de pesos preentrenados en ImageNet y se le añade una cabeza clasificadora específica compuesta por dos capas densas (512 y 256 unidades) y una capa de salida softmax con 67 neuronas, una por raza. La entrada se normaliza con `preprocess_input` de `tensorflow.keras.applications.efficientnet_v2` sobre imágenes redimensionadas a 224 × 224 en RGB.

El entrenamiento se realizó en dos fases según la model card: primero extracción de características con el backbone congelado y después ajuste fino de las 80 capas superiores. El conjunto de datos empleado es `nikolasgegenava/cat-breeds`, publicado en Kaggle. No se especifican el número de épocas, el tamaño efectivo del dataset, la tasa de aprendizaje, el optimizador, el tamaño de lote, el esquema de aumento de datos ni si se aplicó algún tipo de regularización. Tampoco se documenta el entorno de entrenamiento ni el coste computacional.

## Capacidades

- Clasificación de imágenes de gatos en 67 razas mediante una única etiqueta de salida (clasificación multiclase cerrada).
- Salida de probabilidades por clase a través de la capa softmax, lo que permite aplicar umbrales de confianza propios.
- Inferencia sobre imágenes RGB de 224 × 224 píxeles, con preprocesado estándar de EfficientNetV2.
- Integración en aplicaciones de visión por computador mediante TensorFlow/Keras, con carga directa del fichero H5.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, capacidades de agente ni modo de pensamiento.
- No dispone de capacidades multilingües: no procesa ni genera lenguaje natural.
- No se documentan capacidades de detección de objetos, segmentación ni clasificación multi-etiqueta.

## Casos de uso

- Aplicación móvil de identificación de razas: el modelo puede ejecutarse en el dispositivo o en un servicio ligero para que el usuario fotografíe a su gato y obtenga la raza más probable con su nivel de confianza.
- Triaje en clínicas veterinarias: como ayuda preliminar para registrar la raza de un animal a partir de una foto de admisión, siempre con revisión humana posterior dada la ausencia de métricas publicadas.
- Catalogación de refugios y protectoras: clasificación por lotes de las fotografías de los animales alojados para completar fichas de adopción y facilitar búsquedas por raza.
- Etiquetado asistido de datasets: uso del modelo como preanotador en un pipeline de etiquetado semiautomático de imágenes felinas, dejando la validación final a anotadores humanos.
- Moderación y organización de contenido en comunidades online: clasificación automática de imágenes subidas por usuarios en foros o redes de temática felina para asignar categorías por raza.
- Demostración educativa de transferencia de aprendizaje: el repositorio incluye un ejemplo completo de descarga, preprocesado y predicción, útil como plantilla docente para ajuste fino de EfficientNetV2 en problemas de clasificación cerrada.
- Integración en una app Streamlit: la propia model card menciona una demo en Streamlit que descarga el modelo automáticamente en la primera ejecución, lo que sirve como patrón de despliegue rápido para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud top-1, top-5, matriz de confusión, F1 por clase ni métricas sobre un conjunto de validación o test independiente. Tampoco se documenta el particionado del dataset ni si existe fuga de datos entre entrenamiento y evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. EfficientNetV2S en punto flotante de 32 bits ocupa del orden de decenas de megabytes de pesos, por lo que la inferencia con lote pequeño cabe holgadamente en menos de 1 GB de memoria, aunque el autor no publica cifras medidas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, pero están sobredimensionadas para esta tarea.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en aceleradores integrados. La inferencia en CPU es viable para peticiones individuales con una latencia de decenas de milisegundos, si bien no se han publicado medidas.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Serving, conversión a TensorFlow Lite para móvil y edge, exportación a ONNX Runtime para inferencia multiplataforma y la aplicación Streamlit descrita por el autor. No aplica llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El autor no aporta mediciones ni el hardware utilizado para la demo.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este modelo, por lo que la comparativa es exclusivamente estructural y orientativa. No debe interpretarse como una comparación de precisión.

| Modelo | Arquitectura | Parametros (referencia) | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ZEROTSUDIOS/cat-breed-classifier | EfficientNetV2S + cabeza densa (67 clases) | No confirmado por el autor (backbone ~21,5 M) | Keras H5 | Apache 2.0 | No publicados |
| ResNet-50 ajustado a razas felinas | CNN residual | ~25,6 M (según el paper original) | No disponible | Depende del repositorio | No disponibles para esta comparación |
| ConvNeXt-Tiny ajustado a razas felinas | CNN moderna | ~28 M (según el paper original) | No disponible | Depende del repositorio | No disponibles para esta comparación |
| ViT-B/16 ajustado a razas felinas | Transformer de visión | ~86 M (según el paper original) | No disponible | Depende del repositorio | No disponibles para esta comparación |

## Limitaciones y advertencias

- Ausencia total de métricas: no hay exactitud, F1 ni matriz de confusión publicadas, por lo que no es posible estimar la fiabilidad real del modelo antes de evaluarlo por cuenta propia.
- Clasificación cerrada de 67 clases: cualquier imagen que no corresponda a una de las razas del conjunto de entrenamiento recibirá igualmente una etiqueta, sin mecanismo de detección de fuera de distribución ni clase «desconocido».
- Gatos mestizos o de raza no incluida: el modelo forzará una etiqueta, lo que puede producir resultados sistemáticamente erróneos en este tipo de imágenes.
- Sesgo del dataset: el conjunto de Kaggle tiene una composición y distribución de razas no documentada en la model card. Es probable que esté sobrerrepresentado en razas comunes en determinados países y subrepresentado en razas regionales.
- Sensibilidad a la calidad de imagen: la entrada está fija a 224 × 224 y se aplica el preprocesado estándar de EfficientNetV2. Iluminación, fondo, oclusiones o ángulos poco habituales pueden degradar la predicción, sin que se haya medido esta sensibilidad.
- Sin calibración de confianza documentada: aunque la salida es softmax, no hay evidencia de que las probabilidades estén bien calibradas; no conviene usarlas directamente como umbral de decisión en producción sin validación previa.
- Licencia del modelo Apache 2.0, pero el dataset subyacente (`nikolasgegenava/cat-breeds` en Kaggle) tiene su propia licencia, que no se especifica en la model card. Es necesario verificarla antes de un uso comercial del modelo derivado.
- Detalles de entrenamiento insuficientes: se desconoce el número de épocas, la estrategia de aumento de datos, el particionado y si hubo fuga entre entrenamiento y evaluación, lo que dificulta reproducir o auditar el resultado.
- Formato único y dependencia de TensorFlow: el modelo solo se distribuye como fichero H5, lo que puede plantear incompatibilidades con versiones recientes de Keras 3. No se ofrecen pesos en safetensors, ONNX ni TFLite de forma oficial.
- Adopción nula: con 0 descargas y 0 likes, no existe retroalimentación de la comunidad ni validación independiente de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZEROTSUDIOS/cat-breed-classifier
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/nikolasgegenava/cat-breeds
- Paper de EfficientNetV2 (arquitectura del backbone): https://arxiv.org/abs/2104.00298
- Demo en Streamlit: mencionada en la model card, sin URL pública incluida
- Repositorio de código: no disponible
- Paper o blog del autor: no disponible

Nota: los resultados de búsqueda web facilitados no contienen información relacionada con este modelo; todos ellos remiten a páginas de soporte de Microsoft ajenas al tema.
