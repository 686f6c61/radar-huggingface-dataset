# Starbudweiser/mslice-auraface-coreml

## Resumen

AuraFace Core ML (8-bit) es una conversión al formato Core ML del modelo de reconocimiento facial `fal/AuraFace-v1`, una red ArcFace con backbone ResNet-100 publicada bajo licencia Apache 2.0. El modelo original se distribuye como `glintr100.onnx` y este repositorio lo empaqueta como `AuraFace.mlpackage` para su ejecución nativa en macOS, con pesos cuantizados a 8 bits mediante paletización k-means y normalización de píxeles integrada en el grafo. No hay reentrenamiento: se trata exclusivamente de una conversión de formato y compresión de pesos.

El modelo resuelve una tarea concreta: extraer un embedding facial de 512 dimensiones a partir de una imagen RGB de 112 × 112 alineada con la plantilla de 5 puntos de ArcFace. La similitud entre dos caras se calcula como producto escalar tras normalizar L2 los embeddings. Es, por tanto, un componente de verificación y agrupación de identidades, no un modelo generativo ni multimodal.

Su relevancia es acotada pero específica: lo publica el autor del proyecto mSLICE como descarga opcional aprobada por el usuario para agrupar las apariciones de la misma cara en un vídeo, ejecutándose íntegramente en local en el Apple Neural Engine. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no dispone de pipeline declarado ni de idiomas especificados, lo que refleja que es un artefacto auxiliar de una aplicación más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ArcFace con backbone ResNet-100 (modelo de embeddings faciales) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | Pesos paletizados a 8 bits (k-means); cómputo en float16 en Core ML |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`AuraFace.mlpackage`, dentro de `AuraFace-CoreML-8bit.zip`, 62,6 MB); original en ONNX (`glintr100.onnx`) |

Especificaciones adicionales de entrada y salida:

| Parámetro | Valor |
|---|---|
| Entrada | Imagen RGB de 112 × 112, cara alineada con la plantilla ArcFace de 5 puntos, valores 0..255 |
| Normalización | Integrada en el modelo: `(x − 127.5) / 127.5` |
| Salida | Tensor `emb` de 512 floats |
| Métrica de similitud | Producto escalar tras normalización L2 |
| Modelo base | `fal/AuraFace-v1` |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional ResNet-100 con cabecera ArcFace, el esquema de aprendizaje de embeddings faciales que optimiza un margen angular aditivo sobre la pérdida softmax para separar identidades en el espacio de representación. El modelo original se publica como `glintr100.onnx` y produce un vector de 512 dimensiones por cara. Este repositorio no modifica la arquitectura ni los pesos en términos de aprendizaje: aplica una conversión ONNX → Core ML con cómputo en float16, incorpora la normalización de píxeles dentro del grafo y paletiza los pesos a 8 bits mediante k-means. El autor declara que la precisión no cambió con la compresión en su conjunto de pruebas.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset ni si hubo fases de refinamiento posteriores. La model card original, según cita el autor, afirma que el modelo se entrenó con datos utilizables comercialmente, pero no nombra los conjuntos de datos concretos. El script de conversión está disponible en `scripts/convert_character_model.py` dentro del repositorio de mSLICE.

## Capacidades

- Extracción de embeddings faciales de 512 dimensiones a partir de recortes de cara de 112 × 112 alineados con la plantilla ArcFace de 5 puntos.
- Verificación de identidad mediante similitud coseno (producto escalar de embeddings normalizados L2).
- Agrupación de apariciones de la misma cara en un vídeo, que es el uso declarado por la aplicación mSLICE.
- Ejecución nativa en macOS sobre Core ML, con aceleración en el Apple Neural Engine.
- Procesamiento totalmente local: el autor indica que nada sale del Mac.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es un modelo unimodal y de tarea única.

## Casos de uso

- Agrupación de caras en vídeo para edición: mSLICE usa el modelo para agrupar las apariciones de la misma persona a lo largo de un clip; la salida de 512 floats por cara permite agrupar por similitud coseno sin enviar fotogramas a ningún servicio externo.
- Indexación local de archivos multimedia: extraer embeddings de las caras detectadas en una biblioteca de vídeos para permitir búsquedas por persona, manteniendo todo el procesamiento en el Mac del usuario.
- Verificación de identidad en aplicaciones de escritorio macOS: comparar un recorte de referencia con un recorte candidato mediante el producto escalar de embeddings, con la ventaja de que el modelo corre en el Apple Neural Engine a aproximadamente 1,7 ms por cara.
- Preprocesado para pipelines de etiquetado: generar embeddings en lote sobre fotogramas extraídos y pasarlos a un clustering posterior (por ejemplo, DBSCAN sobre similitud coseno) como paso previo a la revisión humana.
- Prototipado de investigación en reconocimiento facial: usar la conversión Core ML como referencia reproducible de un ArcFace ResNet-100 con pesos de 8 bits para experimentos de compresión y evaluación de degradación de precisión.
- Filtrado de duplicados en conjuntos de imágenes: detectar caras repetidas en una carpeta antes de un proceso de curación o deduplicación, aprovechando el bajo coste por inferencia.
- Aplicaciones de privacidad por diseño: cualquier flujo que requiera agrupar caras pero no pueda enviar datos biométricos a la nube encuentra aquí un componente ejecutable en local bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una velocidad de aproximadamente 1,7 ms por cara en el Apple Neural Engine de un M5 Max y afirma que la precisión no cambió con la compresión a 8 bits en su conjunto de pruebas, sin aportar métricas concretas (por ejemplo, accuracy de verificación, tasas de falsos positivos o comparación con el modelo ONNX original).

## Requisitos de hardware

- Ejecución nativa en macOS mediante Core ML; el modelo está pensado para el Apple Neural Engine.
- El autor reporta aproximadamente 1,7 ms por cara en un M5 Max con el Neural Engine.
- VRAM estimada: no disponible. El artefacto pesa 62,6 MB comprimido y los pesos están paletizados a 8 bits, por lo que la huella en memoria es reducida, pero no se publica una cifra de memoria.
- GPU recomendadas: no disponibles. El modelo está orientado a silicio Apple (Neural Engine); no se documenta soporte para A100, H100, RTX 4090 ni otras GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible más allá de la referencia al Neural Engine de Apple.
- Opciones de despliegue: Core ML (formato `mlpackage`); el original está en ONNX y podría desplegarse con runtimes ONNX, pero esta conversión concreta es específica de Core ML.
- Latencia y throughput: 1,7 ms por cara en M5 Max según el autor; no se publican cifras para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Formato | Licencia | Contexto de ejecución |
|---|---|---|---|---|---|
| AuraFace Core ML 8-bit (este) | ArcFace ResNet-100 | 512 | Core ML (`mlpackage`) | Apache 2.0 | Apple Neural Engine, macOS |
| fal/AuraFace-v1 | ArcFace ResNet-100 | 512 | ONNX (`glintr100.onnx`) | Apache 2.0 | Multiplataforma vía ONNX Runtime |
| Otros modelos ArcFace de reconocimiento facial | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: esta conversión mantiene la arquitectura y los pesos de `fal/AuraFace-v1`, cambia el formato a Core ML, integra la normalización y comprime los pesos a 8 bits. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo produce embeddings faciales; no genera texto, no razona y no procesa otros tipos de imagen.
- Requiere alineación previa: la entrada debe ser una cara recortada y alineada con la plantilla ArcFace de 5 puntos; sin ese preprocesado los embeddings pierden validez.
- Entrada fija de 112 × 112: no admite otras resoluciones sin reescalado y recorte previos.
- Sesgos: no se documentan sesgos demográficos, de iluminación, pose u oclusión. Al ser un modelo biométrico, es esperable un rendimiento desigual según estos factores, pero no hay datos publicados que lo cuantifiquen.
- Riesgo de falsos positivos y negativos en la verificación: no se publican métricas de precisión, umbrales recomendados ni tasas de error, por lo que el umbral de similitud debe calibrarse empíricamente.
- Origen de los datos de entrenamiento no verificado: el autor cita que la model card original afirma un uso comercial de los datos, pero no se nombran los conjuntos de datos; conviene auditar este punto antes de un despliegue comercial.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y atribución; el paquete incluye `LICENSE.txt` y `NOTICE.txt`.
- Naturaleza biométrica: el tratamiento de embeddings faciales está sujeto a normativa de protección de datos (RGPD en la UE); el procesamiento local mitiga la exposición, pero no elimina las obligaciones legales.
- Madurez: repositorio con 0 descargas y 0 likes, sin pipeline declarado y con una única actualización; no hay evidencia de mantenimiento ni de validación por terceros.
- Dependencia de plataforma: el artefacto Core ML está atado a macOS y al Neural Engine de Apple; no es portable a otros sistemas sin reconvertir desde el ONNX original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Starbudweiser/mslice-auraface-coreml
- Modelo base: https://huggingface.co/fal/AuraFace-v1
- Repositorio de mSLICE: https://github.com/starbudweiser/mSLICE
- Script de conversión: `scripts/convert_character_model.py` en el repositorio de mSLICE
