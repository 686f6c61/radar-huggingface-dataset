# wkentaro/sam3-onnx-models-v0.6.0

## Resumen

SAM3 ONNX models es una exportación a formato ONNX del modelo Segment Anything 3 (SAM3) de Meta, publicada por wkentaro bajo el identificador `wkentaro/sam3-onnx-models-v0.6.0`. No se trata de un modelo de lenguaje, sino de un sistema de segmentación de imágenes guiado por texto y por puntos, cuyo pipeline declarado es `mask-generation`. La relevancia de esta ficha radica en que empaqueta los pesos originales de `facebook/sam3` en cuatro grafos ONNX independientes con los pesos embebidos, de modo que cada artefacto es un único fichero ejecutable con onnxruntime sin dependencias de PyTorch.

La arquitectura subyacente es la de SAM3, un modelo de segmentación que combina un codificador de imagen, un codificador de lenguaje para prompts textuales y decodificadores de máscaras que aceptan tanto texto como cajas de ejemplo (incluidas cajas negativas) o puntos. La exportación descompone el modelo en cuatro piezas: `sam3_image_encoder.onnx` (1,9 GB), `sam3_language_encoder.onnx` (1,6 GB), `sam3_decoder.onnx` (130 MB) y `sam3_point_decoder.onnx` (17 MB), con un total de repositorio de 3,6 GB.

El interés técnico inmediato está en la versión 0.6.0, que reorganiza los pesos de todas las operaciones `Gemm` a formato {K, N} con `transB=0`, lo que duplica la velocidad del execution provider de WebGPU en onnxruntime (de 1.477 ms a 727 ms en una RTX 3080 Ti). El modelo está pensado para despliegue en CPU, NVIDIA CUDA, WebGPU y Apple CoreML, lo que lo hace utilizable en entornos de escritorio y navegador sin infraestructura GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM3 (Segment Anything 3) exportado a ONNX; codificador de imagen + codificador de lenguaje + decodificador de máscaras |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; el prompt textual no se mide en tokens de contexto publicados) |
| Tipos de cuantización | no disponible (los artefactos publicados son grafos ONNX con pesos inline; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el codificador de lenguaje procesa prompts textuales, pero no se detallan idiomas) |
| Licencia | SAM License (pesos); código de exportación MIT |
| Formato de pesos | ONNX con pesos embebidos (un fichero por grafo) |

## Arquitectura y entrenamiento

El modelo base es `facebook/sam3`, un sistema de segmentación de imágenes que sigue el paradigma de Segment Anything: un codificador de imagen produce representaciones densas, un codificador de lenguaje procesa el prompt textual y un decodificador genera máscaras condicionadas por ese prompt. La exportación a ONNX separa estas etapas en cuatro grafos: el codificador de imagen (1,9 GB, entrada de imagen), el codificador de lenguaje (1,6 GB, entrada de prompt textual), el decodificador principal (130 MB, entradas de texto y cajas de ejemplo, incluidas cajas negativas) y un decodificador de puntos (17 MB, entrada de puntos). Los pesos van inline en cada fichero, de modo que no se requiere un fichero de pesos separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card de esta exportación no los detalla y se remite al repositorio original de SAM3. La innovación técnica documentada en esta versión es puramente de exportación: todas las operaciones `Gemm` almacenan su peso como {K, N} con `transB=0`, lo que acelera el execution provider de WebGPU de onnxruntime al doble respecto a `transB=1`. Como contrapartida, el execution provider de CoreML tarda minutos en cargar un modelo con `transB=0`, por lo que es necesario transponer cada peso `Gemm` de vuelta a {N, K} y fijar `transB=1` antes de cargarlo en CoreML; el script `infer_onnx.py` del repositorio incluye la función `load_for_coreml()` que realiza esta conversión (aproximadamente 1,4 s para el codificador de imagen en un Apple M5).

## Capacidades

- Segmentación de imágenes guiada por prompt textual: el codificador de lenguaje permite indicar qué objeto segmentar mediante una frase.
- Segmentación guiada por cajas de ejemplo, incluyendo cajas negativas para excluir regiones.
- Segmentación guiada por puntos mediante el decodificador de puntos dedicado.
- Generación de máscaras (pipeline `mask-generation`), no generación de texto ni razonamiento.
- Ejecución multiplataforma vía onnxruntime: CPU, NVIDIA CUDA, WebGPU y Apple CoreML.
- Despliegue en un solo fichero por grafo, sin necesidad de cargar pesos por separado.
- Integración con las herramientas `sam3-onnx` y `osam` para inferencia desde línea de comandos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imagen: el usuario introduce un prompt textual o unos puntos y el modelo devuelve la máscara del objeto; el decodificador de puntos de 17 MB permite iteraciones rápidas sin recargar el codificador de imagen.
- Anotación semiautomática de datasets de visión por computador: se usa el prompt textual para preetiquetar objetos y las cajas negativas para corregir falsos positivos, reduciendo el trabajo manual de etiquetado.
- Procesamiento por lotes en servidores sin GPU: con el execution provider de CPU, el codificador de imagen tarda 6.377 ms en un i9-12900K, adecuado para pipelines offline donde la latencia no es crítica.
- Despliegue en navegador con WebGPU: la exportación con `transB=0` permite ejecutar el codificador de imagen en 727 ms sobre una RTX 3080 Ti vía WebGPU, habilitando herramientas de recorte y segmentación que corren íntegramente en el cliente.
- Aplicaciones de escritorio en macOS: con CoreML en un Apple M5 el codificador tarda 2.528 ms, lo que permite integrar segmentación por texto en herramientas nativas sin depender de CUDA.
- Automatización de flujos de análisis de imágenes en investigación: la separación en cuatro grafos permite cachear el codificador de imagen y reutilizarlo con distintos prompts de texto, puntos o cajas, optimizando el coste computacional en experimentos con muchas consultas sobre la misma imagen.
- Integración en pipelines de CI/CD o servicios ligeros: al ser ficheros ONNX autocontenidos y ejecutables con onnxruntime, se pueden distribuir y versionar como artefactos sin arrastrar el stack de PyTorch.

## Benchmarks y rendimiento

La model card solo publica tiempos de inferencia del codificador de imagen (mediana de 5 ejecuciones), no métricas de calidad de segmentación:

| Dispositivo | Tiempo (codificador de imagen) |
|---|---:|
| CUDA, RTX 3080 Ti | 332 ms |
| WebGPU, RTX 3080 Ti | 727 ms |
| CPU, i9-12900K | 6.377 ms |
| CoreML, Apple M5 | 2.528 ms |
| WebGPU, Apple M5 | 3.603 ms |

No se han publicado resultados de benchmarks de calidad (mIoU, precisión de máscaras u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el codificador de imagen ocupa 1,9 GB en disco y el codificador de lenguaje 1,6 GB, por lo que se requiere al menos varios GB de memoria para cargar los grafos completos.
- GPU recomendadas: NVIDIA RTX 3080 Ti (probada, 332 ms en CUDA); cualquier GPU NVIDIA compatible con CUDA y onnxruntime.
- Cabe en GPU de consumo: sí, según la prueba publicada en una RTX 3080 Ti, que es una GPU de gama alta de consumo.
- Opciones de despliegue: onnxruntime con execution providers CPU, CUDA, WebGPU y CoreML; herramientas `sam3-onnx` (script `infer_onnx.py`) y `osam` (`osam run sam3 --image ... --text ...`).
- Latencia y throughput: codificador de imagen entre 332 ms (CUDA, RTX 3080 Ti) y 6.377 ms (CPU, i9-12900K); no se publican latencias de los decodificadores ni throughput agregado.
- Nota para CoreML: es necesario transponer los pesos `Gemm` a {N, K} con `transB=1` antes de cargar, lo que añade aproximadamente 1,4 s en el codificador de imagen sobre un M5.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, esta exportación se posiciona frente a otras distribuciones de SAM3 (por ejemplo, los pesos originales de `facebook/sam3` en PyTorch) por su portabilidad a onnxruntime y su ejecución en WebGPU y CoreML, pero no se aportan cifras comparativas de calidad ni de rendimiento entre ambas.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| wkentaro/sam3-onnx-models-v0.6.0 | no disponible | no aplica | SAM License | ONNX |
| facebook/sam3 (original) | no disponible | no aplica | SAM License | PyTorch (no confirmado en la información) |
| Alternativas de segmentación | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier uso en esos términos es inadecuado.
- No se documentan sesgos conocidos, pero al ser un modelo de visión hereda los sesgos del dataset de entrenamiento original de SAM3, no detallado aquí.
- Riesgo de alucinación en el sentido de máscaras incorrectas o incompletas ante prompts ambiguos o clases no representadas; no se publican métricas de calidad que permitan acotarlo.
- Limitaciones de idioma: no se especifican los idiomas soportados por el codificador de lenguaje.
- Restricciones de licencia: los pesos están bajo la SAM License de Meta, que puede imponer condiciones al uso comercial; el código de exportación es MIT. Es necesario revisar el fichero LICENSE antes de un despliegue en producción.
- Caveat de CoreML: los modelos con `transB=0` tardan minutos en cargarse en el execution provider de CoreML; hay que aplicar la transposición documentada.
- Los tiempos publicados corresponden solo al codificador de imagen; no hay datos de latencia extremo a extremo ni de los decodificadores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wkentaro/sam3-onnx-models-v0.6.0
- Repositorio de exportación sam3-onnx: https://github.com/wkentaro/sam3-onnx
- Script de inferencia: https://github.com/wkentaro/sam3-onnx/blob/main/infer_onnx.py
- Herramienta osam: https://github.com/wkentaro/osam
- Repositorio original de SAM3: https://github.com/facebookresearch/sam3
- Modelo base: https://huggingface.co/facebook/sam3
