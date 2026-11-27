# thirdshift-sh/depth-anything-v2-small

## Resumen

Depth Anything V2 Small es un modelo de estimación de profundidad monocular desarrollado originalmente por Lihe Yang et al. y convertido a formato Core ML por el usuario thirdshift-sh para su ejecución nativa en el ecosistema Apple (iOS, iPadOS y macOS). El modelo toma una imagen RGB y produce un mapa de profundidad denso, relativo o absoluto, pixel a pixel. La versión publicada en este repositorio corresponde a la variante "small" con backbone DINOv2 y cabecera DPT, con 24,8 millones de parámetros y un peso de repositorio de 0,3 GB.

La relevancia de esta conversión radica en que permite ejecutar inferencia de profundidad en el Neural Engine de dispositivos Apple con latencias de 24 a 34 ms por imagen, sin necesidad de GPU dedicada ni de frameworks de Python. Esto habilita casos de uso en aplicaciones móviles nativas, como realidad aumentada, edición fotográfica o robótica de consumo.

El modelo original Depth Anything V2 se entrena con aproximadamente 600 000 imágenes sintéticas etiquetadas y 62 millones de imágenes reales sin etiquetar, lo que le permite generalizar mejor que su predecesor en escenas diversas. La licencia Apache 2.0 facilita su integración tanto en proyectos comerciales como de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DPT (Dense Prediction Transformer) con backbone DINOv2 |
| Parámetros totales | 24,8 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 518x396 en evaluación) |
| Tipos de cuantización | Float32 y Float16 (variantes publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DPT, que combina un backbone transformer DINOv2 con un decodificador denso que reconstruye el mapa de profundidad a resolución de píxel. DINOv2 aporta representaciones visuales auto-supervisadas de alta calidad, mientras que la cabecera DPT realiza fusión multi-escala de características para producir predicciones densas. La variante "small" emplea el backbone DINOv2-S.

El entrenamiento original de Depth Anything V2 combina aproximadamente 600 000 imágenes sintéticas con etiquetas de profundidad precisas y 62 millones de imágenes reales sin etiquetar, lo que proporciona robustez frente a dominios visuales variados. La conversión a Core ML incluida en este repositorio no reentrena el modelo: transforma los pesos PyTorch originales a formato Core ML en precisiones Float32 y Float16, manteniendo el comportamiento del modelo de referencia.

La innovación principal del trabajo original es el uso de datos sintéticos de alta calidad para superar las limitaciones de los datasets reales con etiquetas ruidosas, combinado con un modelo profesor de mayor capacidad para generar pseudo-etiquetas sobre datos reales. En esta versión Core ML, la innovación práctica es la ejecución en el Neural Engine de Apple con latencias de decenas de milisegundos.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Predicción de profundidad relativa y absoluta (según el modo de evaluación del modelo original).
- Generalización a escenas diversas gracias al entrenamiento con datos sintéticos y reales.
- Ejecución nativa en dispositivos Apple mediante Core ML y el Neural Engine.
- Dos variantes de precisión: Float32 (mayor fidelidad) y Float16 (menor tamaño y mayor velocidad).
- Integración en aplicaciones Swift mediante el repositorio de ejemplos de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Realidad aumentada en iOS: el modelo genera mapas de profundidad por fotograma en unos 30 ms en iPhone, lo que permite ocluir objetos virtuales detrás de elementos reales en tiempo casi real.
- Edición fotográfica con desenfoque de fondo: aplicaciones de retoque pueden usar el mapa de profundidad para separar sujeto y fondo y aplicar efectos de bokeh sintético de forma automática.
- Reconstrucción 3D aproximada: a partir del mapa de profundidad y la imagen RGB se pueden generar mallas o nubes de puntos para escaneo de entornos con la cámara del dispositivo.
- Robótica de consumo y drones: la baja latencia y el consumo reducido del Neural Engine permiten estimación de profundidad a bordo en dispositivos Apple sin GPU dedicada.
- Accesibilidad: generación de descripciones espaciales o alertas de obstáculos para aplicaciones de asistencia visual, usando la profundidad como señal complementaria.
- Segmentación y matting: el mapa de profundidad sirve como entrada auxiliar para pipelines de segmentación de primer plano en apps de videollamada o creación de contenido.
- Procesamiento por lotes en macOS: integración en flujos de trabajo de escritorio para preprocesar grandes colecciones de imágenes antes de tareas de visión por computador.

## Benchmarks y rendimiento

| Variante | Precisión pesos | Precisión activaciones | Error abs-rel | Referencia |
|---|---|---|---|---|
| small-original (PyTorch) | Float32 | Float32 | no disponible (referencia) | — |
| DepthAnythingV2SmallF32 | Float32 | Float32 | 0,0072 | small-original |
| DepthAnythingV2SmallF16 | Float16 | Float16 | 0,0089 | small-original |

Evaluación realizada sobre 512 imágenes de paisaje del dataset COCO con relación de aspecto similar a 4:3, redimensionadas a 518x396, tomando como verdad de referencia las salidas del modelo PyTorch en CUDA con precisión Float32.

Tiempos de inferencia (variante small-float16):

| Dispositivo | SO | Tiempo de inferencia (ms) | Unidad de cómputo dominante |
|---|---|---|---|
| iPhone 12 Pro Max | 18.0 | 31,10 | Neural Engine |
| iPhone 15 Pro Max | 17.4 | 33,90 | Neural Engine |
| MacBook Pro (M1 Max) | 15.0 | 32,80 | Neural Engine |
| MacBook Pro (M3 Max) | 15.0 | 24,58 | Neural Engine |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en el Neural Engine de Apple. El paquete Float16 ocupa aproximadamente 49,8 MB y el Float32 unos 99,2 MB.
- GPU recomendadas: no requiere GPU dedicada; está optimizado para el Neural Engine de chips Apple (A14 en adelante y series M).
- Compatibilidad con GPU de consumo: no está pensado para GPUs NVIDIA o AMD; para esas plataformas debe usarse la versión PyTorch original.
- Opciones de despliegue: Core ML en iOS, iPadOS y macOS; integración en Swift mediante el repositorio coreml-examples de Hugging Face. Para otros entornos, usar el modelo PyTorch original con Transformers.
- Latencia y throughput: entre 24,58 ms y 33,90 ms por imagen en los dispositivos medidos (iPhone 12 Pro Max, iPhone 15 Pro Max, MacBook Pro M1 Max y M3 Max), según la tabla del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto de entrada | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small (este repo) | 24,8 M | Core ML | Apache 2.0 | Imagen 518x396 en evaluación | Hugging Face |
| Depth Anything V2 Small (PyTorch) | 24,8 M | PyTorch | Apache 2.0 | Imagen, resolución configurable | Hugging Face |
| Depth Anything V2 Base | no disponible en la información | PyTorch | Apache 2.0 | Imagen | Hugging Face |
| Depth Anything V2 Large | no disponible en la información | PyTorch | Apache 2.0 | Imagen | Hugging Face |

La información proporcionada no incluye datos de benchmarks de las variantes Base y Large ni de otros modelos de estimación de profundidad comparables, por lo que la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- El modelo es una conversión a Core ML: no se han publicado evaluaciones propias del conversor más allá de la comparación con el modelo PyTorch de referencia.
- El error abs-rel aumenta de 0,0072 (Float32) a 0,0089 (Float16), una degradación de aproximadamente el 24 % que puede ser relevante en aplicaciones de precisión.
- La evaluación se realizó sobre imágenes COCO redimensionadas a 518x396; el comportamiento en otras resoluciones o relaciones de aspecto no está documentado en la información disponible.
- Al ser un modelo de visión, no procesa lenguaje ni soporta instrucciones textuales; no debe confundirse con un modelo multimodal.
- Riesgo de degradación en escenas con superficies transparentes, reflectantes o texturas repetitivas, limitación habitual en estimación de profundidad monocular, aunque no se documenta explícitamente en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original y de DINOv2, cuyas licencias pueden tener condiciones adicionales.
- El repositorio tiene 57 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- No se dispone de información sobre sesgos demográficos o geográficos del modelo original en la documentación proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thirdshift-sh/depth-anything-v2-small
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything original: https://arxiv.org/abs/2401.10891
- Repositorio original Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Documentación DPT en Transformers: https://huggingface.co/docs/transformers/model_doc/dpt
- Documentación DINOv2 en Transformers: https://huggingface.co/docs/transformers/model_doc/dinov2
- Modelo PyTorch de referencia: https://huggingface.co/pcuenq/Depth-Anything-V2-Small-hf
- Ejemplos Core ML en Swift: https://github.com/huggingface/coreml-examples/tree/main/depth-anything-example
