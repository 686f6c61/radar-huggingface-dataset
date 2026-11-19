# UGREENDEV/RK182X-CNN-Pytorch-UNet

## Resumen

RK182X-CNN-Pytorch-UNet es un artefacto de inferencia publicado por UGREENDEV que contiene una red neuronal convolucional de segmentación de imágenes convertida al formato RKNN para su ejecución sobre las NPU Rockchip de la familia RK182X. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una compilación específica de hardware del conocido Pytorch-UNet de milesial, orientada a segmentación binaria de imágenes (clásicamente segmentación de personas sobre fondos en el dataset CARVANA, aunque la arquitectura es genérica).

El repositorio está pensado para despliegue en dispositivo (edge), no para servidor. La única configuración disponible es una entrada de 512x288 píxeles con cuantización de pesos y activaciones a 8 bits (w8a8) y reparto en 8 núcleos NPU, dirigida a los chips RK1820 y RK1828 con RKNN Runtime v1.1.0. El tamaño del repositorio es de 0.0 GB según los metadatos, lo que sugiere que los binarios pueden no estar materializados o que el dato está redondeado a la baja.

Su relevancia es acotada pero concreta: sirve como referencia de despliegue de un UNet cuantizado en NPU Rockchip para tareas de segmentación en tiempo real en cámaras, drones o dispositivos industriales. No aporta innovaciones de arquitectura ni de entrenamiento; su valor está en la cadena de conversión y en las garantías de integridad (checksums SHA-256) del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo U-Net (encoder-decoder con conexiones skip), derivada de milesial/Pytorch-UNet |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512x288 píxeles) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no aplica, tarea de segmentación de imágenes) |
| Licencia | GPL-3.0 (modelo fuente); los artefactos RKNN derivados quedan sujetos a la misma licencia |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuración |
| Tipo de modelo | CNN, pipeline image-segmentation |
| Resolución de entrada | 512x288 |
| Chips soportados | RK1820, RK1828 |
| Núcleos NPU | 8 |
| Versión de runtime | RKNN Runtime v1.1.0 |
| Tamaño del repositorio | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la U-Net canónica implementada en milesial/Pytorch-UNet: un encoder convolucional con downsampling progresivo, un decoder con upsampling y conexiones skip que concatenan mapas de características del encoder con los del decoder, y una cabeza de salida convolucional 1x1 que produce una máscara de segmentación. Es un diseño pensado para segmentación semántica densa con pocos datos, no un transformer ni un modelo híbrido.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si hubo ajuste fino adicional tras la conversión. La model card solo documenta el proceso de conversión a RKNN (versión de runtime, cuantización w8a8, resolución fija y número de núcleos NPU). Cualquier detalle de entrenamiento debe consultarse en el repositorio original de milesial/Pytorch-UNet, no en este artefacto.

## Capacidades

- Segmentación de imágenes densa (predicción por píxel) sobre entradas de 512x288.
- Segmentación binaria o multiclase según la cabeza del modelo fuente; la model card no especifica el número de clases de salida.
- Ejecución en NPU Rockchip RK1820 y RK1828 con RKNN Runtime v1.1.0.
- Inferencia cuantizada w8a8 con reparto en 8 núcleos NPU.
- Verificación de integridad de artefactos mediante SHA-256.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión multimodal ni audio.
- No soporta instrucciones en lenguaje natural; es un modelo puramente discriminativo.

## Casos de uso

- Segmentación de personas en vídeo embebido: el modelo produce máscaras a 512x288 en NPU RK1820/RK1828, adecuado para aplicaciones de videovigilancia o análisis de aforo en dispositivos de bajo consumo.
- Preprocesado en pipelines de visión industrial: separación de piezas u objetos del fondo antes de un clasificador o de un sistema de control de calidad, aprovechando la cuantización w8a8 para reducir latencia.
- Asistencia a la conducción en vehículos ligeros o robots móviles: segmentación de carril o de obstáculos a resolución moderada, donde el coste energético de la NPU es menor que el de una GPU.
- Segmentación en drones: procesado a bordo de imágenes de cámara con un UNet cuantizado, sin necesidad de transmitir el flujo completo a un servidor.
- Edición de imagen y vídeo en dispositivo: generación de máscaras para sustitución de fondo o recorte automático en aplicaciones móviles o de escritorio con acelerador Rockchip.
- Prototipado de despliegue edge: referencia para validar la cadena RKNN Toolkit → RKNN Runtime antes de portar modelos de segmentación propios.
- Investigación en cuantización: comparación del impacto de w8a8 frente al modelo en punto flotante original en tareas de segmentación densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1820 o RK1828, con RKNN Runtime v1.1.0 y driver compatible; verificar la versión en dispositivo con `rknn-smi -v`.
- No se ejecuta en GPU NVIDIA, CPU genérica ni en otros aceleradores sin reconversión; el artefacto es específico de RKNN.
- VRAM estimada: no aplica; el modelo consume memoria del sistema y de la NPU del SoC, no memoria de GPU dedicada.
- GPU recomendadas: ninguna; no es un modelo para GPU.
- Cabe en consumer GPU: no aplica (formato RKNN propietario).
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requiere descargar la configuración completa (`Pytorch-UNet-512x288-w8a8-8`) y verificar los checksums antes del despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Cuantización | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-CNN-Pytorch-UNet (este) | U-Net CNN | 512x288 | w8a8 | NPU RK1820/RK1828 | GPL-3.0 | Hugging Face, ModelScope |
| milesial/Pytorch-UNet (fuente) | U-Net CNN | variable | fp32 | GPU/CPU genérica | GPL-3.0 | GitHub |
| Segmentación con SAM (Meta) | Transformer (ViT) | 1024x1024 | fp16/int8 | GPU | Apache-2.0 (SAM), licencia distinta según variante | Hugging Face, GitHub |
| DeepLabv3+ (torchvision) | CNN con backbone | variable | fp32/int8 | GPU/CPU | BSD-3-Clause | torchvision |

La comparación es aproximada: SAM y DeepLabv3+ son alternativas de segmentación de propósito general, mientras que este artefacto está atado a un SoC concreto y a una resolución fija. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de hardware: solo funciona en RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a otras plataformas sin reconversión.
- Resolución de entrada fija de 512x288; no admite entradas arbitrarias sin recompilar.
- Cuantización w8a8: puede degradar la precisión de las máscaras frente al modelo en punto flotante, especialmente en bordes finos y clases poco representadas.
- Licencia GPL-3.0: el uso comercial exige cumplir las obligaciones copyleft del modelo fuente; los artefactos derivados heredan la licencia.
- No se documentan sesgos, composición del dataset ni métricas de calidad; no es posible evaluar su robustez en dominios distintos al de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos o negativos en la máscara de segmentación.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los binarios no están materializados o que el dato está redondeado; conviene verificar los checksums SHA-256 antes de desplegar.
- No se incluyen las librerías de runtime en el repositorio; deben obtenerse por separado bajo su propia licencia.
- No hay información sobre idiomas ni sobre capacidades multilingües porque la tarea no las requiere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-Pytorch-UNet
- Modelo fuente (Pytorch-UNet): https://github.com/milesial/Pytorch-UNet
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-CNN-Pytorch-UNet --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-CNN-Pytorch-UNet --revision v1.1.0`
- Documentación de configuración: subdirectorio `Pytorch-UNet-512x288-w8a8-8/README.md` dentro del repositorio
- Checksums: `Pytorch-UNet-512x288-w8a8-8/SHA256SUMS`
