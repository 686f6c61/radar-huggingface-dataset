# Xinexin/nearword-ruri-v3-30m-onnx

## Resumen

nearword-ruri-v3-30m-onnx es una conversión a ONNX con cuantización dinámica int8 del modelo de embeddings de frases cl-nagoya/ruri-v3-30m, desarrollada por el usuario Xinexin. El modelo original, creado por el grupo cl-nagoya, es un encoder basado en la arquitectura ModernBERT especializado en japonés y orientado a la extracción de características (feature-extraction), es decir, a generar representaciones vectoriales densas de texto para tareas de similitud semántica, búsqueda y recuperación.

La relevancia de esta variante concreta radica en su formato: al estar exportada a ONNX y cuantizada a int8, permite ejecutar la inferencia directamente en el navegador mediante Transformers.js, sin necesidad de servidor ni GPU. El autor la publicó específicamente para el juego de adivinanza de palabras «Nearword», donde la inferencia se realiza del lado del cliente.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo: no se ha reentrenado ningún peso, solo se ha convertido el modelo base a ONNX y se ha cuantizado. Su tamaño reducido (30M de parámetros) y su licencia Apache 2.0 lo hacen adecuado para aplicaciones web ligeras de procesamiento de lenguaje natural en japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 30M (aproximado, según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | int8 dinámica (ONNX); el pipeline de Transformers.js usa `dtype: "q8"` |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8) |

## Arquitectura y entrenamiento

El modelo subyacente, cl-nagoya/ruri-v3-30m, emplea la arquitectura ModernBERT, una evolución del transformer encoder de BERT que incorpora mejoras como atención con rotación posicional (RoPE), alternancia de capas de atención global y local, y activaciones GeGLU, orientadas a mayor eficiencia y velocidad en contextos largos. Está especializado en japonés y diseñado para generar embeddings de frases mediante pooling y normalización.

Esta variante no aporta entrenamiento nuevo: la model card indica explícitamente que los únicos cambios respecto al modelo base son la conversión a formato ONNX y la cuantización dinámica a int8, sin reentrenamiento de pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó técnicas como RLHF o DPO, ya que esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de embeddings de texto (feature-extraction) para frases en japonés.
- Cálculo de similitud semántica entre textos mediante mean pooling y normalización de los vectores resultantes.
- Ejecución de inferencia en el navegador del cliente gracias al formato ONNX y a Transformers.js.
- Uso en tareas de búsqueda semántica, agrupamiento y detección de duplicados sobre corpus en japonés.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: es un encoder de embeddings, no un modelo generativo.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- Capacidad multilingüe limitada al japonés según la etiqueta de idioma del repositorio.

## Casos de uso

- Juegos de palabras en el navegador: es el caso original del modelo; permite calcular la similitud semántica entre la palabra objetivo y las propuestas del jugador sin enviar datos a un servidor, gracias a la inferencia local con Transformers.js.
- Búsqueda semántica en aplicaciones web en japonés: se pueden generar embeddings de documentos y consultas en el cliente para ofrecer resultados por significado en lugar de por coincidencia exacta de términos.
- Detección de duplicados y near-duplicates: comparando los vectores normalizados de titulares o entradas de un corpus japonés para agrupar contenidos casi idénticos.
- Sistemas de recomendación de contenido: cálculo de similitud entre artículos, productos o entradas de blog en japonés para sugerir elementos relacionados.
- Clasificación y agrupamiento ligero: uso de los embeddings como entrada a un clasificador sencillo o a un algoritmo de clustering (k-means) ejecutado en el navegador o en el edge.
- Moderación o filtrado de texto en el cliente: comparación de mensajes de usuario contra listas de referencia semántica sin exponer el contenido a un backend.
- Prototipado rápido de funciones NLP en demos web: al no requerir infraestructura de servidor, facilita la validación de ideas de recuperación de información en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (como MTEB, JSTS u otras) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 30M de parámetros en int8, el modelo ocupa del orden de decenas de megabytes, por lo que puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; está pensado para ejecución en navegador (WebAssembly/WebGPU según el backend de Transformers.js).
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles, dado su tamaño reducido.
- Opciones de despliegue: Transformers.js (pipeline `feature-extraction` con `dtype: "q8"`), ONNX Runtime; no se documentan otras opciones como vLLM o llama.cpp para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| nearword-ruri-v3-30m-onnx | ~30M | no disponible | japonés | Apache 2.0 | ONNX int8 |
| cl-nagoya/ruri-v3-30m (base) | ~30M | no disponible | japonés | Apache 2.0 | safetensors |
| Otros modelos de embeddings japoneses | no disponible | no disponible | japonés | no disponible | no disponible |

La comparación más directa es con el modelo base cl-nagoya/ruri-v3-30m, del que esta variante solo difiere en formato (ONNX int8 frente a pesos originales) y en el propósito de despliegue en navegador. No se dispone de datos de rendimiento comparado con alternativas como ruri-v3 en otros tamaños u otros encoders japoneses, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto ni responde preguntas directamente.
- Limitado al japonés; su uso con otros idiomas no está respaldado por la información disponible.
- La cuantización int8 puede introducir una ligera degradación en la calidad de los embeddings respecto a los pesos originales en precisión completa.
- No se documentan sesgos específicos, pero al derivar de un corpus japonés puede reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de similitudes semánticas imprecisas en dominios muy especializados o con vocabulario técnico no representado en el entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y el aviso de licencia del modelo base.
- El repositorio muestra cero descargas y cero likes, y un tamaño de repo de 0.0 GB en la información proporcionada; conviene verificar la integridad de los archivos antes de usarlo en producción.
- No hay garantías de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xinexin/nearword-ruri-v3-30m-onnx
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
