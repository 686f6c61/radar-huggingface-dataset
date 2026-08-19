# Vu74269/vietocr-animesub-finetune

## Resumen

El modelo `vietocr-animesub-finetune` es un sistema de reconocimiento óptico de caracteres (OCR) para texto vietnamita, desarrollado por el usuario Vu74269. Se trata de un fine-tuning del modelo base VietOCR, concretamente de la configuración `vgg_transformer`, que combina una red VGG como extractor de características visuales con un Transformer para el reconocimiento de secuencias. El modelo ha sido entrenado específicamente para reconocer subtítulos vietnamitas extraídos de imágenes de anime, lo que lo hace útil para tareas de subtitulado automático, indexación de vídeo y procesamiento de capturas.

El modelo tiene un tamaño de repositorio de 0.2 GB y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales. Está entrenado exclusivamente para el idioma vietnamita. Aunque el modelo no publica el número total de parámetros, su arquitectura ligera (VGG + Transformer) y el tamaño del repositorio sugieren que es un modelo de dimensiones moderadas, adecuado para despliegue en entornos con recursos limitados. Las métricas de evaluación publicadas indican una precisión del 73.6% a nivel de secuencia completa y del 89.9% a nivel de carácter, lo que refleja un rendimiento aceptable para su dominio específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG (extractor de características) + Transformer (reconocimiento de secuencias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo OCR, no procesa texto de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VietOCR `vgg_transformer`. La parte visual emplea una red VGG para extraer características de las imágenes de entrada, que posteriormente son procesadas por un Transformer para generar la secuencia de caracteres reconocidos. Este enfoque es estándar en OCR de escenas naturales y documentos, y permite manejar variaciones de fuente, tamaño y fondo dentro de ciertos límites.

El entrenamiento se realizó sobre un conjunto de datos personalizado compuesto por imágenes de subtítulos vietnamitas extraídos de anime. Se ejecutaron 10.000 iteraciones con una división de entrenamiento/validación del 90%/10%. La validación se realizó cada 1.000 iteraciones sobre 1.000 muestras. No se menciona el uso de técnicas de refuerzo como RLHF o DPO, ni la cantidad total de datos utilizados. Tampoco se especifica el optimizador, la tasa de aprendizaje ni otras hiperparametros.

## Capacidades

- Reconocimiento de texto vietnamita en imágenes, con especialización en subtítulos de anime.
- Extracción de secuencias de caracteres completas a partir de capturas de vídeo o imágenes estáticas.
- Manejo de variaciones moderadas de fuente, tamaño y color de fondo dentro del dominio de subtítulos.
- Funciona como componente OCR autónomo, integrable en pipelines de procesamiento de vídeo o imágenes.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generativas, al ser un modelo puramente discriminativo para OCR.
- Capacidad multilingüe limitada: únicamente vietnamita.

## Casos de uso

- Extracción automática de subtítulos de anime: el modelo puede procesar fotogramas de vídeo para obtener el texto de los subtítulos, facilitando la creación de archivos de subtítulos (SRT) o la traducción automática posterior.
- Indexación y búsqueda de vídeos: al transcribir los subtítulos, se pueden generar metadatos textuales que permitan buscar escenas concretas por su diálogo.
- Generación de bases de datos de citas o frases: a partir de series de anime, se pueden extraer diálogos para compilar colecciones de frases célebres.
- Verificación de subtítulos existentes: comparar el texto reconocido con subtítulos manuales para detectar errores o discrepancias.
- Automatización de tareas de moderación de contenido: detectar texto inapropiado o sensible en capturas de anime antes de su publicación.
- Investigación académica en OCR de dominios específicos: servir como punto de partida para fine-tuning en otros estilos de subtítulos o idiomas similares.

## Benchmarks y rendimiento

El autor proporciona dos métricas de evaluación, obtenidas sobre el conjunto de validación (1.000 muestras):

| Metrica | Valor |
|---|---|
| Full Sequence Accuracy | 73.6% |
| Per Character Accuracy | 89.9% |

No se han publicado resultados comparativos con otros modelos OCR en la información disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño del repositorio (0.2 GB) y la arquitectura VGG + Transformer, es razonable estimar que el modelo puede ejecutarse en CPU con un consumo de memoria inferior a 1 GB, aunque no hay datos confirmados. Para inferencia en GPU, cualquier tarjeta con al menos 2 GB de VRAM sería suficiente, pero esta cifra es especulativa. No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), pero al ser un modelo PyTorch probablemente pueda servirse con frameworks de OCR como PaddleOCR o Tesseract con adaptadores, o mediante una API personalizada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base VietOCR (configuración `vgg_transformer`) es el punto de referencia natural, pero no se han publicado resultados comparativos entre este fine-tuning y el modelo original. Tampoco se conocen alternativas específicas para OCR de subtítulos vietnamitas con métricas públicas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con subtítulos de anime vietnamitas, por lo que su rendimiento puede degradarse significativamente con otros tipos de texto (documentos, carteles, escenas naturales) o con fuentes y fondos muy diferentes a los del entrenamiento.
- La diferencia entre la precisión por carácter (89.9%) y la precisión de secuencia completa (73.6%) indica que, aunque la mayoría de caracteres se reconocen correctamente, un porcentaje notable de secuencias completas contiene al menos un error. Esto puede ser problemático en aplicaciones que requieran transcripciones exactas sin revisión posterior.
- El modelo no soporta otros idiomas además del vietnamita, y no se ha evaluado su comportamiento con texto mixto o caracteres especiales fuera del alfabeto vietnamita.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que la licencia del modelo base VietOCR podría imponer restricciones adicionales; es recomendable verificar la licencia de VietOCR antes de un despliegue en producción.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos en los datos (por ejemplo, variedad de series, estilos de subtítulos, resolución de imágenes).
- No se proporcionan instrucciones de instalación, ni código de inferencia, ni pesos en formatos estándar como safetensors o GGUF, lo que puede dificultar su integración en entornos de producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Vu74269/vietocr-animesub-finetune)
