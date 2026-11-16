# vector-institute/mars-dfd-hr

## Resumen

DFD-HR es un detector de vídeo manipulado (deepfake) desarrollado por Vector Institute como parte del protocolo MARS. El modelo se construye sobre un codificador CLIP ViT-L/14 congelado al que se le añaden adaptadores de mezcla de expertos (MoE) entrenables, routers de tokens y de capas, y una cabeza de clasificación binaria. La tarea que resuelve es la clasificación de vídeo en dos clases (auténtico frente a manipulado), puntuando cada fotograma y agregando la puntuación a nivel de clip y de vídeo.

El modelo es relevante porque es una reimplementación del baseline DFD-HR (Sun et al., CVPR 2026) entrenada bajo el protocolo MARS, lo que permite comparaciones homogéneas con otros detectores del mismo marco. Con 103,7 millones de parámetros totales en los componentes entrenables (el codificador CLIP congelado se descarga aparte), ofrece una arquitectura eficiente que combina la representación visual de CLIP con adaptadores ligeros y enrutamiento dinámico para reducir cómputo en las últimas capas.

La información disponible no incluye detalles sobre el conjunto de datos de entrenamiento, el número de tokens vistos, ni resultados de benchmarks. La model card se centra en la arquitectura, el formato de entrada y las instrucciones de uso, y advierte explícitamente de que las puntuaciones no están calibradas y de que el umbral de decisión debe elegirse sobre datos de validación propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 congelado con adaptadores MoE entrenables, routers de tokens y de capas, y cabeza de clasificación |
| Parámetros totales | 103.671.938 (componentes entrenables; el codificador CLIP ViT-L/14 congelado se descarga por separado) |
| Parámetros activos | no disponible (no es un MoE de parámetros activos en el sentido habitual; los adaptadores MoE son ligeros y el enrutamiento opera sobre tokens y capas) |
| Longitud de contexto | no aplica (modelo de clasificación de vídeo); clips de 64 fotogramas, con muestreo cada 2 fotogramas |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (415 MB, solo adaptadores, routers y cabeza), ONNX (1,63 GB, grafo completo con codificador congelado incluido) |

## Arquitectura y entrenamiento

El modelo parte de un codificador CLIP ViT-L/14 congelado. Sobre él se añaden adaptadores de mezcla de expertos entrenables. Cada fotograma se procesa dos veces: como una vista global de 224 x 224 y como 2 x 2 teselas de 224 x 224 recortadas del fotograma de 448 x 448. En los últimos bloques, un router de tokens deja pasar solo los tokens con mayor puntuación y un router de capas permite que una vista se detenga antes, reduciendo el cómputo. La puntuación del clip es la media de las puntuaciones de los fotogramas.

El entrenamiento se realizó bajo el protocolo MARS, con 4 GPU NVIDIA A40 durante 86,1 horas-GPU (24,8 kWh, 1,6054 kg CO2eq medidos con CodeCarbon en Ontario, Canadá). La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el proceso de selección de checkpoint más allá de indicar que sigue el protocolo MARS.

## Capacidades

- Clasificación binaria de vídeo: auténtico frente a manipulado, con salida de probabilidad por clip y puntuación agregada por vídeo.
- Detección de deepfakes y falsificaciones de vídeo (tags: deepfake-detection, video-forgery-detection).
- Procesamiento de vídeo con muestreo temporal (cada 2 fotogramas) y agregación por clips de 64 fotogramas.
- Manejo de clips cortos o vídeos cortos mediante relleno con repetición del último fotograma y máscara `n_valid`.
- Inferencia en PyTorch (safetensors) o en ONNX Runtime (CPU o GPU), sin necesidad del repositorio de código en el caso ONNX.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Moderación de contenido en plataformas de vídeo: el modelo puntúa cada clip de 64 fotogramas y agrega la probabilidad de manipulación por vídeo, lo que permite filtrar contenido sospechoso antes de la revisión humana. Es adecuado porque su arquitectura ligera (adaptadores sobre CLIP congelado) permite procesar vídeos con un coste computacional moderado.
- Verificación de autenticidad en medios de comunicación: un redactor puede pasar un vídeo recibido por el modelo y obtener una puntuación de manipulación para decidir si lo publica o lo escala a verificación. La salida ONNX permite integrarlo en una herramienta de escritorio sin dependencias de PyTorch.
- Análisis forense de vídeo en entornos con GPU limitada: al poder ejecutarse con ONNX Runtime en CPU o GPU, el modelo se puede desplegar en estaciones de trabajo sin aceleradores dedicados, manteniendo el codificador CLIP congelado dentro del grafo ONNX.
- Detección de deepfakes en procesos de verificación de identidad (KYC): el modelo puede puntuar vídeos de prueba de vida y marcar aquellos con alta probabilidad de manipulación para revisión manual, usando un umbral calibrado sobre datos propios de validación.
- Investigación en detección de falsificaciones: al ser una reimplementación del baseline DFD-HR bajo el protocolo MARS, sirve como punto de comparación reproducible para nuevos detectores, con pesos en safetensors y configuración YAML legible por el paquete `mars`.
- Monitorización de campañas de desinformación: integrado en un pipeline que descarga vídeos de redes sociales y los puntúa por lotes, el modelo permite priorizar la revisión de aquellos con mayor probabilidad de manipulación, aprovechando la agregación por clips para vídeos largos.
- Evaluación de herramientas de generación de vídeo: para medir la fidelidad de un generador o de una técnica de edición, se puede usar el modelo como discriminador automático y comparar la distribución de puntuaciones entre vídeos reales y generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El grafo ONNX completo ocupa 1,63 GB en disco; en FP32, la inferencia de un clip de 64 fotogramas a 448 x 448 requiere memoria para activaciones del ViT-L/14, que en la práctica suele situarse en el rango de 4 a 8 GB en GPU, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no especificadas en la model card. El entrenamiento se realizó con 4 NVIDIA A40.
- Cabe en GPU de consumo: no confirmado. El tamaño del grafo ONNX (1,63 GB) y los 103,7 M de parámetros entrenables sugieren que es viable en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA) con el archivo `model.onnx`; PyTorch con el paquete `mars` y `model.safetensors` (el codificador CLIP se descarga de OpenAI en el primer uso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| vector-institute/mars-dfd-hr | 103,7 M (entrenables) | Clips de 64 fotogramas, 448 x 448 | Apache 2.0 | Hugging Face (safetensors y ONNX) |
| DFD-HR original (Disguiser15/DFD-HR) | no disponible | no disponible | no disponible | Repositorio GitHub citado en la model card |
| Otros detectores del protocolo MARS | no disponible | no disponible | no disponible | Colección MARS en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones no están calibradas: la model card indica explícitamente que, si se necesita una decisión, el umbral debe elegirse sobre datos de validación del propio entorno.
- No es el modelo original de DFD-HR ni sus pesos: es una reimplementación entrenada bajo el protocolo MARS, por lo que sus números difieren de los del paper de DFD-HR.
- No se documentan sesgos conocidos, pero al ser un detector de manipulación entrenado con datos no especificados, puede presentar sesgos hacia determinados tipos de vídeo, cámaras o demografías.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- Limitaciones de idioma: no aplica directamente (modelo de vídeo), pero no se documenta el rendimiento en vídeos con distintos idiomas, acentos o contextos culturales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el codificador CLIP subyacente se descarga de OpenAI y su uso queda sujeto a la licencia de CLIP, que no se detalla en la model card.
- El modelo requiere el repositorio `mars` para la ruta PyTorch; la ruta ONNX es autónoma pero exige preprocesar el vídeo según el formato exacto (448 x 448, muestreo cada 2 fotogramas, normalización CLIP).
- No se especifican los datos de entrenamiento, lo que dificulta evaluar su cobertura y posibles puntos ciegos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vector-institute/mars-dfd-hr
- Paper MARS (arXiv): https://arxiv.org/abs/2611.12508
- Repositorio de código MARS: https://github.com/VectorInstitute/mars
- Colección MARS en Hugging Face: https://huggingface.co/vector-institute/mars
- Código original de DFD-HR: https://github.com/Disguiser15/DFD-HR
