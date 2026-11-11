# wkentaro/sam3-onnx-models-v0.7.0

## Resumen

SAM3 ONNX models v0.7.0 es un conjunto de exportaciones a formato ONNX del modelo Segment Anything Model 3 (SAM3) desarrollado originalmente por Meta (facebook/sam3). El repositorio, mantenido por wkentaro, proporciona los distintos componentes del pipeline de segmentación (codificador de imagen, codificador de lenguaje, decodificador, decodificador de puntos y módulos de memoria para vídeo) como ficheros ONNX independientes con los pesos embebidos, de modo que cada modelo es un único fichero ejecutable con onnxruntime.

El objetivo del proyecto es facilitar el despliegue de SAM3 en entornos heterogéneos sin depender de PyTorch: los modelos corren sobre CPU, NVIDIA CUDA, WebGPU y Apple CoreML. La versión 0.7.0 añade seguimiento de vídeo mediante nuevos módulos de atención de memoria, codificador de memoria y submuestreador de máscaras, además de copias en float16 y variantes fusionadas para acelerar la inferencia en GPU.

Es relevante para desarrolladores que necesitan integrar segmentación guiada por texto o por puntos en aplicaciones de producción con requisitos de portabilidad, ya que ofrece un rendimiento comparable al PyTorch original (172 ms frente a 176 ms por imagen con prompt de texto en una RTX 3080 Ti) manteniendo la licencia SAM de Meta para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de segmentación (SAM3) exportado a ONNX; pipeline compuesto por codificador de imagen, codificador de lenguaje, decodificador, decodificador de puntos y módulos de memoria para vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica contexto textual) |
| Tipos de cuantizacion | float32 (por defecto) y float16 (`*_fp16.onnx`); variantes fusionadas (`*_fused.onnx`) y de forma fija (`sam3_memory_attention_fixed.onnx`) |
| Idiomas soportados | no disponible (prompts de texto en lenguaje natural, idioma no especificado) |
| Licencia | SAM License (pesos, Meta); código de exportación MIT |
| Formato de pesos | ONNX con pesos embebidos (un fichero por modelo) |

Desglose de ficheros y tamanos:

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

SAM3 es un modelo de segmentación de imágenes y vídeo basado en transformer, del que este repositorio solo distribuye la exportación ONNX, no el entrenamiento. El pipeline se descompone en módulos especializados: un codificador de imagen que extrae características visuales, un codificador de lenguaje que procesa el prompt textual, un decodificador que combina texto y cajas de ejemplo para producir logits de máscara, un decodificador de puntos que opera sobre puntos y objetos rastreados, y tres módulos de memoria (atención de memoria, codificador de memoria y submuestreador de máscaras) que habilitan el seguimiento de objetos a lo largo de fotogramas de vídeo.

La versión 0.7.0 introduce el seguimiento de vídeo completo y cambios en las salidas: `sam3_decoder.onnx` devuelve los logits de máscara como cuarta salida y ejecuta su atención mediante el operador `MultiHeadAttention` de onnxruntime. Además, `sam3_point_decoder.onnx` acepta un lote de objetos en el primer eje. Se ofrecen copias en float16 para GPU, variantes fusionadas para CUDA y WebGPU, y una variante de memoria con forma fija para CoreML. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que corresponden al modelo original de Meta y no se detallan en la información proporcionada.

## Capacidades

- Segmentación de imágenes guiada por prompt de texto (por ejemplo, "person").
- Segmentación guiada por puntos.
- Segmentación guiada por cajas de ejemplo.
- Segmentación guiada por máscara (mediante el submuestreador de máscaras).
- Seguimiento de objetos en vídeo con prompts de texto o de puntos (1 o 3 puntos).
- Gestión de memoria entre fotogramas para mantener la identidad de los objetos rastreados.
- Ejecución multiplataforma: CPU, NVIDIA CUDA, WebGPU y Apple CoreML.
- Soporte de precisión float16 en GPU.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; el modelo es exclusivamente de visión y segmentación.

## Casos de uso

- Edición de vídeo asistida por texto: el modelo permite aislar objetos concretos en cada fotograma indicando su nombre, gracias al seguimiento de vídeo con prompts de texto y a los módulos de memoria que mantienen la coherencia temporal.
- Rotoscopia y efectos visuales: el decodificador de puntos con lotes de objetos y el seguimiento con 1 o 3 puntos facilitan el aislamiento de sujetos a lo largo de secuencias, reduciendo el trabajo manual por fotograma.
- Anonimización y privacidad: segmentación de personas u objetos sensibles en imágenes y vídeo para aplicar desenfoque selectivo antes de su publicación.
- Análisis de imágenes médicas o científicas: segmentación guiada por cajas o puntos de regiones de interés en flujos donde se prefiere ONNX por portabilidad y despliegue en CPU.
- Aplicaciones de escritorio y web sin GPU dedicada: las variantes para CoreML y WebGPU permiten ejecutar segmentación en un Apple M5 (1,2 s por imagen en CoreML, 2,4 s en WebGPU) sin infraestructura de servidor.
- Pipelines de automatización de catálogo: extracción de productos sobre fondo neutro mediante prompts de texto o cajas, integrándose en procesos batch con onnxruntime en CPU.
- Prototipado rápido en investigación: el formato ONNX con pesos embebidos simplifica la distribución y la ejecución en distintos backends sin gestionar dependencias de PyTorch.

## Benchmarks y rendimiento

Milisegundos por imagen o fotograma rastreado en una RTX 3080 Ti, float16 sobre CUDA para ONNX frente a PyTorch en bfloat16:

| Prompt | ONNX | PyTorch |
|---|---:|---:|
| Imagen, texto | 172 | 176 |
| Imagen, punto | 153 | 150 |
| Vídeo, texto | 254 | 258 |
| Vídeo, 1 punto | 180 | 187 |
| Vídeo, 3 puntos | 242 | 234 |

En un Apple M5 en float16, una imagen tarda 1,2 s en CoreML y 2,4 s en WebGPU. No se han publicado resultados de benchmarks de calidad (métricas de segmentación como mIoU) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el codificador de imagen (1,8 GB) y el codificador de lenguaje (1,6 GB) son los componentes más pesados; en float32 el conjunto completo supera los 3,5 GB, reducible aproximadamente a la mitad con las copias float16.
- GPU recomendadas: NVIDIA con soporte CUDA (los datos de velocidad se midieron en una RTX 3080 Ti); también H100, A100 y RTX 4090 por compatibilidad con onnxruntime CUDA.
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM usando las variantes float16; las variantes float32 pueden requerir más margen.
- Aceleración en Apple: CoreML en chips Apple Silicon (medido en M5); WebGPU como alternativa en navegador o escritorio.
- CPU: ejecución posible con onnxruntime en CPU, sin datos de latencia publicados.
- Opciones de despliegue: onnxruntime (CPU, CUDA, WebGPU, CoreML) y el script `infer_onnx.py` / `infer_video_onnx.py` del repositorio sam3-onnx. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 153-172 ms por imagen y 180-254 ms por fotograma de vídeo en RTX 3080 Ti; 1,2-2,4 s por imagen en Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM3 ONNX v0.7.0 (este) | no disponible | no aplica | 172 ms/imagen (texto, RTX 3080 Ti) | SAM License (pesos), MIT (código) | ONNX en Hugging Face |
| facebook/sam3 (PyTorch original) | no disponible | no aplica | 176 ms/imagen (texto, RTX 3080 Ti, bfloat16) | SAM License | PyTorch en Meta/GitHub |
| SAM2 | no disponible | no aplica | no disponible en la información proporcionada | SAM License | no disponible en la información proporcionada |

La comparación se limita al modelo base y a su versión anterior de la familia SAM; no se dispone de datos de otros modelos de segmentación en la información proporcionada.

## Limitaciones y advertencias

- La licencia SAM de Meta impone condiciones específicas para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en producción.
- El repositorio solo contiene la exportación ONNX; no se documentan sesgos del modelo, que dependen del SAM3 original de Meta.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede producir segmentaciones incorrectas ante prompts ambiguos o clases no representadas en el entrenamiento.
- No se especifican los idiomas soportados en los prompts de texto, por lo que el comportamiento multilingüe es desconocido.
- El rendimiento medido corresponde a una RTX 3080 Ti y a un Apple M5; en otros hardware la latencia puede diferir.
- La variante `sam3_memory_attention_fixed.onnx` con forma fija está pensada para CoreML y puede no ser adecuada para otros backends.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación por parte de la comunidad.
- No se dispone de información sobre el número de parámetros totales ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/wkentaro/sam3-onnx-models-v0.7.0
- Repositorio sam3-onnx: https://github.com/wkentaro/sam3-onnx
- SAM3 original (Meta): https://github.com/facebookresearch/sam3
- Modelo base: https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/wkentaro/sam3-onnx-models-v0.7.0/blob/main/LICENSE
