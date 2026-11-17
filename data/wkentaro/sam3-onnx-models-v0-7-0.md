# wkentaro/sam3-onnx-models-v0.7.0

## Resumen

SAM3 ONNX models v0.7.0 es una exportación a formato ONNX del modelo Segment Anything Model 3 (SAM3) de Meta, publicada por el desarrollador wkentaro a través del repositorio `sam3-onnx`. El modelo original `facebook/sam3` es un sistema de segmentación de imágenes y vídeo guiado por prompts de texto, puntos o cajas, y esta exportación lo divide en siete submodelos ONNX independientes con pesos embebidos en cada fichero, de modo que cada uno se distribuye como un único archivo autocontenido.

La relevancia de esta ficha radica en que permite ejecutar SAM3 fuera del ecosistema PyTorch, con `onnxruntime` como único runtime, sobre CPU, NVIDIA CUDA, WebGPU y Apple CoreML. Incluye copias en float16 y variantes "fused" que implementan la atención mediante el operador `MultiHeadAttention` de onnxruntime, además de una variante con memorias de forma fija para CoreML. La versión v0.7.0 añade seguimiento de vídeo completo con atención de memoria, codificador de memoria y downsampler de máscaras.

No se dispone de información sobre el número de parámetros totales del modelo original ni sobre la longitud de contexto, ya que SAM3 es un modelo de segmentación y no un modelo generativo de lenguaje. El repositorio ocupa 8,4 GB y la licencia es la SAM License de Meta, con el código de exportación bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model 3 (SAM3) exportado a ONNX; pipeline de segmentación con codificador de imagen, codificador de lenguaje, decodificador de máscaras y módulos de memoria para vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de segmentación, no generativo) |
| Tipos de cuantizacion | float32 (por defecto) y float16 (`*_fp16.onnx`); variantes `*_fused.onnx` y `sam3_memory_attention_fixed.onnx` |
| Idiomas soportados | no disponible (prompts de texto; el model card no detalla idiomas) |
| Licencia | SAM License (Meta); código de exportación MIT |
| Formato de pesos | ONNX con pesos embebidos (un fichero por submodelo) |

Submodelos incluidos:

| Fichero | Tamano | Entrada |
|---|---:|---|
| `sam3_image_encoder.onnx` | 1,8 GB | imagen |
| `sam3_language_encoder.onnx` | 1,6 GB | prompt de texto |
| `sam3_decoder.onnx` | 124 MB | texto y cajas de ejemplo |
| `sam3_point_decoder.onnx` | 18 MB | puntos y objetos rastreados |
| `sam3_memory_attention.onnx` | 35 MB | memorias del tracker |
| `sam3_memory_encoder.onnx` | 5 MB | máscaras rastreadas |
| `sam3_mask_downsampler.onnx` | 3 KB | prompt de máscara |

## Arquitectura y entrenamiento

SAM3 es la tercera iteración de la familia Segment Anything de Meta. La exportación ONNX descompone el modelo en un codificador de imagen, un codificador de lenguaje que procesa el prompt textual, un decodificador que combina texto y cajas de ejemplo para producir logits de máscara, un decodificador de puntos para prompts puntuales y objetos rastreados, y tres módulos específicos de vídeo (atención de memoria, codificador de memoria y downsampler de máscara) que gestionan el estado del tracker entre fotogramas.

La versión v0.7.0 introduce el seguimiento de vídeo completo. El decodificador devuelve los logits de máscara como cuarta salida y ejecuta su atención mediante `MultiHeadAttention` de onnxruntime, lo que habilita aceleración en CUDA y WebGPU. El decodificador de puntos acepta un lote de objetos en el primer eje. Se ofrecen copias en float16 para GPU y una variante `sam3_memory_attention_fixed.onnx` que rellena las memorias a una forma fija para compatibilidad con CoreML.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que el model card de la exportación no los detalla y remite al repositorio original de SAM3.

## Capacidades

- Segmentación de imágenes guiada por prompt de texto (por ejemplo, "person").
- Segmentación guiada por puntos y por cajas de ejemplo.
- Seguimiento de objetos en vídeo con prompt de texto y con uno o varios puntos.
- Gestión de estado del tracker mediante módulos de memoria (atención, codificador y downsampler).
- Ejecución multiplataforma con `onnxruntime`: CPU, NVIDIA CUDA, WebGPU y Apple CoreML.
- Inferencia en float16 para GPU y variantes fused con `MultiHeadAttention`.
- Soporte de lotes de objetos en el decodificador de puntos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; es un modelo exclusivamente de segmentación.

## Casos de uso

- Anotación automática de datasets de visión: usar el prompt de texto para generar máscaras de clases concretas sobre lotes de imágenes y acelerar el etiquetado manual en pipelines de datos.
- Segmentación interactiva en herramientas de edición: integrar el decodificador de puntos para que el usuario haga clic sobre un objeto y obtenga la máscara en tiempo real, con latencias de 153 ms por imagen en una RTX 3080 Ti.
- Seguimiento de objetos en vídeo: emplear los módulos de memoria y el decodificador de puntos para rastrear personas u objetos a lo largo de un vídeo, con 180-254 ms por fotograma según el prompt.
- Despliegue en navegador: ejecutar la variante WebGPU sobre un Apple M5 (1,2 s por imagen en CoreML, 2,4 s en WebGPU) para aplicaciones de segmentación sin backend dedicado.
- Procesamiento en CPU sin GPU: usar los modelos ONNX en float32 con `onnxruntime` en servidores sin acelerador, adecuado para tareas por lotes no interactivas.
- Integración en apps de macOS/iOS: aprovechar la variante `sam3_memory_attention_fixed.onnx` y CoreML para segmentación y seguimiento en dispositivos Apple.
- Extracción de máscaras para análisis downstream: alimentar modelos de conteo, medición o recorte que consuman las máscaras generadas por el decodificador.

## Benchmarks y rendimiento

Milisegundos por imagen o fotograma rastreado en una RTX 3080 Ti, float16 en CUDA, frente a PyTorch upstream en bfloat16:

| Prompt | ONNX | PyTorch |
|---|---:|---:|
| Imagen, texto | 172 | 176 |
| Imagen, punto | 153 | 150 |
| Vídeo, texto | 254 | 258 |
| Vídeo, 1 punto | 180 | 187 |
| Vídeo, 3 puntos | 242 | 234 |

En un Apple M5 en float16, una imagen tarda 1,2 s en CoreML y 2,4 s en WebGPU. No se han publicado resultados de benchmarks de calidad (IoU, mAP) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el codificador de imagen en float16 ocupa aproximadamente 0,9 GB y el codificador de lenguaje unos 0,8 GB; en float32, 1,8 GB y 1,6 GB respectivamente. El resto de submodelos son pequeños (124 MB, 35 MB, 18 MB, 5 MB y 3 KB).
- GPU recomendadas: RTX 3080 Ti (mediciones oficiales), así como cualquier GPU NVIDIA con soporte CUDA para las variantes float16 y fused.
- Cabe en GPU de consumo: sí, los submodelos individuales caben en GPUs con 4-8 GB de VRAM; el codificador de imagen en float32 (1,8 GB) es el componente más exigente.
- Opciones de despliegue: `onnxruntime` (CPU, CUDA, WebGPU, CoreML) y el script `infer_onnx.py` / `infer_video_onnx.py` del repositorio `sam3-onnx`.
- Latencia y throughput: 153-172 ms por imagen y 180-254 ms por fotograma de vídeo en RTX 3080 Ti con float16; 1,2-2,4 s por imagen en Apple M5.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SAM3 ONNX (esta ficha) | Segmentación imagen/vídeo, export ONNX | no disponible | no aplica | SAM License | ONNX |
| facebook/sam3 | Segmentación imagen/vídeo, PyTorch | no disponible | no aplica | SAM License | PyTorch |
| SAM 2 (Meta) | Segmentación imagen/vídeo | no disponible en la información | no aplica | no disponible en la información | PyTorch |
| SAM 1 (Meta) | Segmentación de imágenes | no disponible en la información | no aplica | no disponible en la información | PyTorch |

No se dispone de datos de rendimiento comparativo con SAM 2 o SAM 1 en la información proporcionada.

## Limitaciones y advertencias

- La licencia SAM License de Meta impone restricciones al uso comercial; es necesario revisar el fichero `LICENSE` antes de desplegar en producción.
- Es un modelo de segmentación, no generativo: no admite conversación, razonamiento ni tool calling.
- El rendimiento en idiomas distintos del inglés para los prompts de texto no está documentado.
- No se han publicado métricas de calidad de segmentación (IoU, mAP) en la información disponible.
- La variante CoreML requiere `sam3_memory_attention_fixed.onnx` por la forma fija de las memorias, lo que puede limitar la flexibilidad del tracker.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- El tamaño total del repositorio (8,4 GB) puede ser un obstáculo para despliegues con almacenamiento limitado.
- No se documentan sesgos específicos del modelo en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/wkentaro/sam3-onnx-models-v0.7.0
- Repositorio de exportación: https://github.com/wkentaro/sam3-onnx
- Repositorio original de SAM3: https://github.com/facebookresearch/sam3
- Modelo base: https://huggingface.co/facebook/sam3
