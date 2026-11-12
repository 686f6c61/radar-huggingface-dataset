# TheRizzlers/Texel-4.1

## Resumen

Texel-4.1 es un modelo de superresolución (upscaling) de imágenes especializado en texturas de videojuegos, desarrollado por TheRizzlers. Se trata de la variante "detail" de Texel-4 y aplica un factor de escala fijo de 2× sobre texturas de color (albedo), eliminando artefactos de compresión como las rejillas de bloques BC1/DXT, el blocking de JPEG y el ruido, y reconstruyendo el grano fino de la superficie en lugar de suavizarlo. El modelo está pensado para que materiales como grava, roca y tierra conserven una textura real y no un aspecto "pintado".

Arquitectónicamente es ResSR, una CNN residual con upsampling mediante PixelShuffle y una conexión skip de tipo nearest-neighbour, con 128 canales, 80 convoluciones y 11,97 millones de parámetros. Se distribuye como un único archivo ONNX en fp32 de 48 MB, lo que permite ejecutarlo sin Python a través de chaiNNer o con onnxruntime en Python, y admite cualquier tamaño de entrada con salida siempre exactamente 2×.

Su relevancia actual radica en que aborda un problema muy concreto del pipeline de remasterización de videojuegos: recuperar detalle en texturas comprimidas de baja resolución sin introducir patrones de rejilla repetitivos, un fallo habitual en upscalers genéricos como Real-ESRGAN. La licencia CC0 1.0 sobre los pesos facilita su integración en herramientas y flujos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResSR, CNN residual con PixelShuffle y skip nearest-neighbour |
| Parametros totales | 11,97 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en fp32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0 1.0 (dedicación al dominio público) |
| Formato de pesos | ONNX (fp32) |
| Canales internos | 128 |
| Numero de convoluciones | 80 |
| Factor de escala | 2× fijo |
| Entrada | float32, `[batch, 3, H, W]`, RGB en 0..1 |
| Salida | `[batch, 3, 2H, 2W]` |
| Tamano del archivo | 48 MB |

## Arquitectura y entrenamiento

Texel-4.1 emplea la misma arquitectura que Texel-4: ResSR, una red convolucional residual con 128 canales y 80 convoluciones que realiza el upsampling mediante PixelShuffle y suma una conexión skip con interpolación nearest-neighbour. El modelo totaliza 11,97 millones de parámetros y produce una salida de exactamente el doble de resolución que la entrada.

El entrenamiento consistió en un fine-tuning desde Texel-4 durante 10.000 pasos con una función de recompensa orientada al detalle. La pérdida combina estadísticas de textura de VGG19 (matrices de Gram), distancia de features VGG y L1 a nivel de píxel. Los recortes de entrenamiento priorizan parches de textura con mucha información, y las entradas incorporan daño severo de compresión BC1 y JPEG para imitar archivos reales de videojuegos. Se añadió una penalización en el dominio de la frecuencia (FFT) para evitar que el modelo invente patrones de rejilla repetitivos. Los datos de entrenamiento provienen de texturas de *The Legend of Zelda: Breath of the Wild* y *Bonelab*, además de fotografías de DIV2K; todas las comprobaciones se realizaron sobre texturas reales sin reducir.

## Capacidades

- Superresolución 2× de texturas de color (albedo) de videojuegos con cualquier tamaño de entrada.
- Eliminación de artefactos de compresión BC1/DXT (rejillas de bloques), blocking de JPEG y ruido.
- Reconstrucción de grano fino de superficie (grava, roca, tierra) en lugar de suavizado.
- Supresión de patrones de rejilla repetitivos gracias a la penalización FFT durante el entrenamiento.
- Procesamiento por lotes (`batch` en la primera dimensión del tensor).
- Ejecución en GPU vía CUDAExecutionProvider o en CPU vía CPUExecutionProvider de onnxruntime.
- Integración sin código en chaiNNer mediante los nodos Load Model (ONNX) y Upscale Image.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen a imagen.

## Casos de uso

- Remasterización de texturas de terreno en mods de juegos: el modelo está entrenado específicamente para reconstruir el grano de grava, roca y tierra, por lo que es adecuado para sustituir texturas de baja resolución de *Breath of the Wild* u otros títulos con materiales similares.
- Limpieza de texturas comprimidas heredadas: al estar entrenado con daño BC1 y JPEG, puede procesar archivos extraídos directamente de juegos antiguos para eliminar rejillas de bloques y blocking antes de reutilizarlos.
- Pipeline automatizado en chaiNNer: se puede encadenar Load Model (ONNX) → Upscale Image dentro de un flujo de procesamiento por lotes de assets sin escribir código Python.
- Procesamiento por lotes con onnxruntime: el script de la model card permite iterar sobre directorios de texturas y generar salidas 2× en un pipeline de build de un mod.
- Texturas repetibles (tiling): siguiendo la recomendación de wrap-pad de 16 px por lado y recorte de 32 px en la salida, se pueden escalar texturas seamless sin costuras visibles.
- Generación de mipmaps de mayor calidad: al duplicar la resolución de una textura base antes de generar la cadena de mipmaps, se obtiene una pirámide con más detalle en los niveles cercanos a cámara.
- Preparación de assets para motores modernos: conversión de texturas de un juego clásico a resoluciones compatibles con pipelines PBR actuales, manteniendo el aspecto original del material.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 83 texturas de terreno de *Breath of the Wild*, reducidas 2× y vueltas a escalar. "Perceptual distance" compara features de VGG19 (menor es mejor); "Detail" es la energía de detalle fino relativa a la textura real, donde 1,0 equivale a igual detalle.

| Metodo | PSNR | Perceptual distance ↓ | Detail | Colour shift |
|---|---|---|---|---|
| Lanczos | 33,98 dB | 0,697 | 0,30 | 0,1/255 |
| Texel-4 | **35,46 dB** | 0,599 | 0,52 | 0,3/255 |
| **Texel-4.1** | 33,94 dB | **0,538** | **0,92** | 0,5/255 |
| Real-ESRGAN x2plus | 30,00 dB | 0,834 | 0,60 | 8,2/255 |

En 100 fotografías de DIV2K, Texel-4.1 obtiene 30,60 dB frente a 27,17 dB de Real-ESRGAN x2plus, y conserva 0,95 del detalle real frente a 0,73. En uso real (texturas de 1024² escaladas a 2048² sin reducción previa), el pico de patrón de rejilla es de 23–60, frente a aproximadamente 20 de Texel-4 y 244–331 de Real-ESRGAN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,97 M de parámetros en fp32 y ejecución por teselas o lotes pequeños, la huella es reducida (el archivo de pesos ocupa 48 MB).
- GPU recomendadas: cualquier GPU compatible con CUDAExecutionProvider de onnxruntime; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (Python) con CUDAExecutionProvider o CPUExecutionProvider; chaiNNer mediante nodos ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Escala | PSNR (BotW) | Detail | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Texel-4.1** | 11,97 M | 2× | 33,94 dB | 0,92 | CC0 1.0 | ONNX |
| Texel-4 | 11,97 M | 2× | 35,46 dB | 0,52 | no disponible en la información | no disponible en la información |
| Real-ESRGAN x2plus | no disponible | 2× | 30,00 dB | 0,60 | no disponible en la información | no disponible en la información |
| Lanczos (interpolación) | no aplica | 2× | 33,98 dB | 0,30 | no aplica | no aplica |

Texel-4.1 prioriza el detalle perceptual (0,92) sobre la fidelidad pixel a pixel (PSNR 33,94 dB), mientras que Texel-4 maximiza el PSNR (35,46 dB) a costa de menor detalle. Real-ESRGAN x2plus queda por debajo en ambas métricas y presenta un desplazamiento de color mucho mayor (8,2/255 frente a 0,5/255).

## Limitaciones y advertencias

- El PSNR es aproximadamente 1,5 dB inferior al de Texel-4; parte del grano que añade es plausible pero no exactamente el original.
- En fotografías, Texel-4 suele ser la mejor opción según el propio autor.
- Solo procesa texturas de color (albedo); no debe usarse en normal maps, máscaras u otros mapas de datos.
- Solo admite RGB: para texturas con transparencia hay que escalar el canal alfa por separado (por ejemplo con Lanczos).
- El archivo ONNX no es consciente de tiling; para texturas repetibles hay que aplicar wrap-pad de 16 px por lado y recortar 32 px en la salida.
- Riesgo de alucinación de detalle: el modelo puede inventar grano que no estaba en la textura original.
- Entrenado con texturas de *Breath of the Wild* y *Bonelab* y fotos de DIV2K; los datos de entrenamiento no se distribuyen y su copyright permanece con sus propietarios. El proyecto no está afiliado ni respaldado por Nintendo ni por Stress Level Zero.
- Los pesos se publican bajo CC0 1.0, pero la licencia no cubre posibles reclamaciones sobre los datos de entrenamiento.
- No se han documentado sesgos demográficos ni limitaciones idiomáticas por tratarse de un modelo de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheRizzlers/Texel-4.1
- Modelo base Texel-4: https://huggingface.co/TheRizzlers/Texel-4
- chaiNNer (herramienta de procesamiento por nodos): no disponible en la información proporcionada
- onnxruntime: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
