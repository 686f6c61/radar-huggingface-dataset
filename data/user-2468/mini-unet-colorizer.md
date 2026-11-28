# User-2468/mini-unet-colorizer

## Resumen

Mini Photo Colorizer v3.0 (publicado como `User-2468/mini-unet-colorizer`) es un modelo compacto de colorización automática de fotografías en escala de grises. Lo desarrolla el usuario `User-2468` y se distribuye con licencia Apache 2.0. El modelo predice colores plausibles a partir de la luminancia de una imagen, sin necesidad de profesor, crítico, modelo semántico externo, servicio de recuperación ni ensemble en tiempo de inferencia.

La arquitectura combina un codificador MobileNetV3 Large preentrenado en ImageNet (sin la cabeza de clasificación), una pirámide de características de 128 canales, 16 consultas de color y dos bloques de atención. El decodificador genera una paleta compartida y máscaras de asignación espacial con un residuo local acotado. El recuento total de parámetros aprendidos es de 3.994.676, con 5.324 parámetros de margen por debajo del límite estricto de cuatro millones.

El modelo es relevante por su tamaño reducido y su despliegue sencillo: se ofrece en safetensors, ONNX y una exportación textual cuantizada (Base93), y funciona en CPU. Está pensado para aplicaciones de consumo que necesitan añadir color plausible a fotografías sin infraestructura pesada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador MobileNetV3 Large + pirámide de características de 128 canales + 16 consultas de color + 2 bloques de atención + decodificador con paleta compartida y máscaras de asignación espacial |
| Parámetros totales | 3.994.676 (según model card); 4.019.082 según safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada fija de 256×256 en la red, salida hasta 12 megapíxeles) |
| Tipos de cuantización | Exportación textual Base93 (cuantización de almacenamiento con pérdida); checkpoint FP32 como estándar de ejecución |
| Idiomas soportados | No disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, exportación textual Base93 |

## Arquitectura y entrenamiento

El modelo es una red de imagen a imagen. Usa MobileNetV3 Large como codificador de características, inicializado con pesos de ImageNet V2 y sin la cabeza de clasificación. Sobre las características se construye una pirámide de 128 canales, seguida de 16 consultas de color y dos bloques de atención. El decodificador produce una paleta compartida y máscaras de asignación espacial con un residuo local acotado, lo que permite asignar color de forma coherente sin uniformar objetos con patrones.

El entrenamiento utiliza 16.230 fotografías filtradas procedentes de archivos parquet fijados de Imagenette y COCO, con características de codificador preentrenado en ImageNet y objetivos artísticos de DDColor (revisión `aa10f72fffc89a6658e37b48556050b4d9a26f63`). Los experimentos de paleta y realismo se inspiraron en PalGAN, aunque la implementación no es una reproducción. La model card no detalla el número de tokens ni si hubo RLHF o DPO, lo que no resulta aplicable a un modelo de imagen. La selección final y el ajuste fino se documentan en `RELEASE_REPORT.md`.

## Capacidades

- Colorización automática de fotografías en escala de grises, generando colores plausibles a partir de la luminancia.
- Salida a resolución original de la entrada, conservando orientación y canal alfa, hasta 12 megapíxeles.
- Preservación de la luminosidad Lab original, con upsampling de color mediante un modelo lineal local guiado por luminosidad y compresión al gamut sRGB.
- Control de saturación ajustable entre 0 y 1,5 (valor por defecto 1,0).
- Radio de suavizado configurable (8 por defecto a resolución de red; 4 y 16 disponibles).
- Tres niveles de detalle de entrada en el Space: Standard, Detailed y Maximum.
- Inferencia en CPU y CUDA.
- Exportación ONNX con grafo fijo de 256×256 y salida `ab` en Lab de tipo float.
- Carga de checkpoints multi-paleta compatibles para experimentos sin ejecutar código Python arbitrario.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües.

## Casos de uso

- Restauración de fotografías familiares antiguas: el modelo añade color plausible a imágenes en blanco y negro conservando la luminosidad original, adecuado para aplicaciones de consumo que procesan lotes de fotos escaneadas.
- Edición fotográfica integrada en aplicaciones móviles: al funcionar en CPU y con un grafo ONNX fijo de 256×256, puede embeberse en pipelines locales sin GPU dedicada.
- Previsualización rápida en flujos de archivo: la colorización automática permite generar vistas previas coloreadas de colecciones históricas antes de una restauración manual más costosa.
- Procesamiento por lotes en servidores sin GPU: la inferencia en CPU y el tamaño reducido (menos de 4 millones de parámetros) permiten desplegar el modelo en contenedores ligeros.
- Investigación en colorización compacta: la exportación Base93 y los scripts de entrenamiento permiten reproducir y comparar variantes de paleta con objetivos artísticos de DDColor.
- Demostraciones interactivas: el Space de ZeroGPU ofrece ajuste de detalle de entrada y saturación para explorar el comportamiento del modelo en distintos tipos de fotografía.
- Integración en herramientas de diseño: el control de saturación y suavizado permite adaptar el resultado al estilo visual de una aplicación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas auxiliares contra la imagen original en color y diagnósticos de retención de color en `RELEASE_REPORT.md`, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 3.994.676 parámetros, por lo que la huella de pesos en FP32 ronda los 16 MB, aunque la model card no indica cifras de VRAM.
- GPU recomendadas: no disponibles; la model card solo menciona soporte CUDA genérico (`--device cuda`).
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: inferencia en CPU o CUDA mediante `inference.py`, ONNX Runtime con `colorizer.onnx`, y el Space de Gradio/ZeroGPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mini Photo Colorizer v3.0 | 3.994.676 | 256×256 en red, salida hasta 12 MP | Apache 2.0 | Hugging Face, ONNX, Base93 |
| DDColor | No disponible | No disponible | No disponible | Referencia citada en la model card |
| PalGAN | No disponible | No disponible | No disponible | Referencia citada en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Una imagen en escala de grises puede admitir varios colores igualmente plausibles; las salidas no deben presentarse como hechos históricos recuperados.
- Limitaciones conocidas: colores apagados o cálidos/sepia, tonos incorrectos en ropa y objetos, sangrado de color residual alrededor de objetos pequeños y malos resultados en superficies o escenas poco habituales.
- Quedan fuera del dominio principal de evaluación las imágenes con daño severo de escaneo, las imágenes astronómicas y las ilustraciones.
- El modelo no repara arañazos ni reconstruye detalle perdido.
- Las métricas contra la imagen original en color son auxiliares, ya que ese original puede no ser inferible.
- Posible solapamiento con el preentrenamiento upstream; la evaluación no garantiza calidad universal ni contenido no visto.
- La exportación Base93 es una cuantización de almacenamiento con pérdida; el checkpoint FP32 sigue siendo el estándar de ejecución.
- La versión de cuatro paletas de 3.995.832 parámetros no fue promovida por reducir la cobertura de color y dejar las fotos históricas apagadas.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/User-2468/mini-unet-colorizer)
- [Space de demostración en ZeroGPU](https://huggingface.co/spaces/User-2468/mini-unet-colorizer)
- [Paper de DDColor](https://arxiv.org/abs/2212.11613)
- [Paper de PalGAN](https://arxiv.org/abs/2210.11204)
- [TorchVision MobileNetV3 Large](https://docs.pytorch.org/vision/0.21/models/generated/torchvision.models.mobilenet_v3_large.html)
