# TheRizzlers/Texel-4.5

## Resumen

Texel-4.5 es un modelo de superresolución (upscaling) de factor 2× desarrollado por TheRizzlers, especializado en texturas de videojuegos y fotografías. Su función principal es eliminar artefactos de compresión —rejillas de bloques BC1/DXT, blocking de JPEG y ruido— y reconstruir detalle fino de superficie a partir de imágenes de baja resolución. Se distribuye como un único archivo ONNX de 88 MB y está pensado para integrarse en flujos de trabajo de restauración de assets, tanto en herramientas sin código como chaiNNer como en scripts de Python con onnxruntime.

El modelo emplea una arquitectura propia denominada UnshuffleSR, con 22,0 millones de parámetros. La innovación clave es que la entrada se somete a un pixel-unshuffle para que el cuerpo principal de la red (192 canales y 64 convoluciones) opere a media resolución, tras lo cual una etapa de refinado a resolución completa y un PixelShuffle generan la salida 2×, complementada con un skip de vecino más cercano. Este diseño es lo que le permite ser entre 1,35 y 1,5 veces más rápido que Real-ESRGAN x2plus consumiendo aproximadamente la mitad de VRAM.

Su relevancia actual radica en el equilibrio entre velocidad y calidad para pipelines de producción: supera a Real-ESRGAN x2plus en todas las categorías de calidad y en todos los conjuntos de prueba evaluados, con un consumo de 1,19 GB de VRAM a 1080p frente a los 2,46 GB del competidor. Queda por debajo de Texel-4.2 en calidad global (65,0 frente a 71,7 en el índice Visual Score), pero es aproximadamente el doble de rápido, lo que lo posiciona como la variante orientada a throughput.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UnshuffleSR (CNN con pixel-unshuffle, cuerpo a media resolución, refinado full-res y PixelShuffle) |
| Parámetros totales | 22,0 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de lenguaje) |
| Tipos de cuantización | fp32 (único peso publicado, ONNX) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | ONNX (`Texel-4.5_2x_fp32.onnx`, 88 MB) |

## Arquitectura y entrenamiento

Texel-4.5 se basa en UnshuffleSR, una red convolucional de 22,0 M de parámetros. La entrada RGB en rango 0..1 se procesa mediante pixel-unshuffle, de modo que el cuerpo principal —192 canales y 64 convoluciones— trabaja a la mitad de resolución espacial; después, una etapa de refinado a resolución completa y un PixelShuffle producen la salida 2×, a la que se suma un skip de vecino más cercano. El modelo acepta cualquier tamaño de entrada, incluidos tamaños impares, y garantiza siempre una salida de exactamente el doble de dimensiones.

El entrenamiento se realizó exclusivamente sobre texturas de color de *Breath of the Wild* y *Bonelab*, junto con escaneos de materiales CC0 de Poly Haven, aplicando una mezcla aleatoria de downscaling, JPEG, BC1, ruido y banding a las entradas. El proceso constó de dos fases: una base de 60.000 pasos desde cero con pérdida L1 de píxel más destilación desde Texel-4.2-Base, seguida de cuatro fine-tunes consecutivos (100.000 pasos en total) destilados desde Texel-4.2 con peso 2–4. Se incorporaron dos penalizaciones específicas: una penalización de perfil de borde por fase que evita ritmos repetitivos de 2/4/8/16 px o rejillas de bloque, y una penalización FFT que impide la invención de patrones de rejilla de píxeles.

## Capacidades

- Superresolución 2× de imágenes RGB con soporte para cualquier tamaño de entrada, incluidos tamaños impares.
- Eliminación de artefactos de compresión: rejillas de bloques BC1/DXT, blocking de JPEG y ruido.
- Reconstrucción de detalle fino de superficie en texturas de color (albedo) y fotografías.
- Reducción de bloques de compresión residual: 0,024 de bloques brutos frente a 0,035 de Real-ESRGAN y 0,197 de Texel-4.2.
- Ejecución mediante ONNX Runtime con proveedores CUDA y CPU.
- Integración directa en chaiNNer mediante nodos Load Model (ONNX) y Upscale Image.
- Soporte de texturas repetitivas sin costuras mediante wrap-padding de 16 px y recorte de 32 px en la salida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente de visión/image-to-image).

## Casos de uso

- Restauración de texturas de videojuegos en modding: el modelo elimina las rejillas de bloques BC1/DXT típicas de assets comprimidos y reconstruye detalle, por lo que resulta adecuado para proyectos que reescalan texturas de *Breath of the Wild* o *Bonelab*, los mismos dominios usados en entrenamiento.
- Remasterización de assets heredados: para estudios que recuperan material gráfico antiguo comprimido en DXT o JPEG, el modelo reduce el blocking y devuelve detalle de superficie con un consumo de VRAM de solo 1,19 GB a 1080p, lo que permite procesar lotes grandes en una sola GPU consumer.
- Upscaling de fotografías en pipelines de preprocesado: con 61,1 de Visual Score en DIV2K frente a 38,7 de Real-ESRGAN x2plus, es adecuado para preparar imágenes de baja resolución antes de tareas posteriores de visión por computador.
- Procesado de texturas repetitivas sin costuras: gracias al flujo de wrap-padding de 16 px y recorte de 32 px, puede aplicarse a materiales tileables de Poly Haven o entornos 3D sin introducir discontinuidades en los bordes.
- Integración en herramientas de artista sin código: mediante chaiNNer, un artista técnico puede encadenar Load Model (ONNX) y Upscale Image para procesar texturas por lotes sin escribir Python.
- Procesamiento por lotes en servidor con onnxruntime: el archivo ONNX de 88 MB y la API de sesión permiten montar un servicio de upscaling con CUDAExecutionProvider y fallback a CPU, con tiempos de 40 ms para 512×512 y 170 ms para texturas de 1024×1024 en una RTX 4070 Ti SUPER.
- Limpieza de imágenes con compresión agresiva: con 69,4 de Visual Score en entradas JPEG q75 y 68,7 en entradas BC1, es útil para recuperar capturas o assets que han pasado por múltiples recompresiones.

## Benchmarks y rendimiento

Calidad medida con el Texel Visual Benchmark (TVB) sobre 444 casos de prueba (texturas de *Breath of the Wild* y Poly Haven no vistas en entrenamiento, y fotos DIV2K), con entradas limpias, JPEG q75 y BC1. El Visual Score es el porcentaje de comparaciones ganadas frente al resto de modelos (50 = media).

| # | Modelo | Visual Score | Detalle | Artefactos | Estructura | Color | Defecto visible | PSNR |
|---|---|---|---|---|---|---|---|---|
| 1 | Texel-4.2 | 71,7 | 84,0 | 58,5 | 66,0 | 68,2 | 2 % | 29,89 dB |
| 2 | Texel-4.5 | 65,0 | 74,0 | 61,7 | 54,0 | 61,1 | 5 % | 29,26 dB |
| 3 | Texel-4.1 | 61,8 | 76,2 | 46,9 | 56,4 | 55,3 | 13 % | 29,68 dB |
| 4 | Texel-4 | 55,4 | 38,5 | 58,9 | 77,4 | 65,3 | 11 % | 31,02 dB |
| 5 | Lanczos | 45,7 | 22,3 | 68,9 | 51,4 | 61,9 | 6 % | 29,61 dB |
| 6 | SwinIR-M | 41,4 | 42,1 | 37,0 | 44,9 | 42,5 | 41 % | 30,45 dB |
| 7 | Real-ESRGAN x2plus | 40,3 | 44,4 | 57,3 | 22,0 | 25,6 | 5 % | 27,39 dB |
| 8 | HAT | 36,4 | 36,5 | 32,0 | 41,2 | 37,2 | 50 % | 30,53 dB |
| 9 | HAT-L | 32,3 | 32,0 | 28,7 | 36,8 | 33,0 | 58 % | 30,52 dB |

Desglose por conjunto de prueba e tipo de entrada:

| Prueba | Texel-4.5 | Real-ESRGAN x2plus | Texel-4.2 |
|---|---|---|---|
| Texturas BotW (held out) | 63,3 | 36,5 | 73,5 |
| Texturas Poly Haven (held out) | 76,8 (1.º de 9) | 46,5 | 76,4 |
| Fotos DIV2K | 61,1 | 38,7 | 69,8 |
| Entrada limpia | 56,9 | 22,5 | 64,4 |
| Entrada JPEG q75 | 69,4 | 53,1 | 77,8 |
| Entrada BC1 | 68,7 | 45,4 | 72,8 |

Velocidad medida en una RTX 4070 Ti SUPER, upscale 2× de imagen completa en una pasada, mediana de tiempo de GPU tras warm-up (solo modelo, sin carga ni guardado de archivos), PyTorch fp16 con `torch.compile`:

| Entrada | Texel-4.5 | Real-ESRGAN x2plus | Texel-4.2 |
|---|---|---|---|
| 256×256 | 11 ms | 40 ms | 22 ms |
| 512×512 | 40 ms | 62 ms | 93 ms |
| 1024×1024 (textura) | 170 ms | 260 ms | 365 ms |
| 1920×1080 (fotograma 1080p) | 318 ms | 429 ms | 723 ms |
| VRAM a 1080p | 1,19 GB | 2,46 GB | 2,49 GB |

En fp32 la diferencia se mantiene: 818 ms para Texel-4.5 frente a 1091 ms para Real-ESRGAN en un fotograma 1080p.

## Requisitos de hardware

- VRAM estimada: 1,19 GB a 1080p (medido en RTX 4070 Ti SUPER con PyTorch fp16); el consumo escala con la resolución de entrada.
- GPU recomendadas: RTX 4070 Ti SUPER (referencia de las mediciones), cualquier GPU NVIDIA con soporte CUDA para el proveedor CUDAExecutionProvider; también funciona en CPU con CPUExecutionProvider a mayor latencia.
- Cabe holgadamente en GPU consumer: el consumo de 1,19 GB a 1080p deja margen en tarjetas de 8 GB o menos.
- Opciones de despliegue: onnxruntime (Python, con proveedores CUDA y CPU), chaiNNer mediante nodos ONNX, y cualquier runtime compatible con ONNX. No se publican pesos en formato GGUF ni safetensors.
- Latencia y throughput: 11 ms para 256×256, 40 ms para 512×512, 170 ms para texturas de 1024×1024 y 318 ms para un fotograma 1080p (RTX 4070 Ti SUPER, fp16 con `torch.compile`); en fp32, 818 ms para 1080p.

## Comparativa con modelos similares

| Modelo | Parámetros | Factor | Visual Score | VRAM a 1080p | Licencia | Formato |
|---|---|---|---|---|---|---|
| Texel-4.5 | 22,0 M | 2× | 65,0 | 1,19 GB | CC0-1.0 | ONNX |
| Texel-4.2 | no disponible | 2× | 71,7 | 2,49 GB | no disponible | no disponible |
| Real-ESRGAN x2plus | no disponible | 2× | 40,3 | 2,46 GB | no disponible | no disponible |
| SwinIR-M | no disponible | 2× | 41,4 | no disponible | no disponible | no disponible |
| HAT | no disponible | 2× | 36,4 | no disponible | no disponible | no disponible |

Texel-4.5 se sitúa como la opción intermedia de la familia Texel: pierde 6,7 puntos de Visual Score frente a Texel-4.2, pero duplica su velocidad y reduce a la mitad su consumo de VRAM. Frente a Real-ESRGAN x2plus, lo supera en 24,7 puntos de Visual Score con la mitad de memoria y entre 1,35 y 1,5 veces menos tiempo de inferencia. Los modelos basados en transformers (SwinIR-M, HAT, HAT-L) obtienen puntuaciones de artefactos y PSNR competitivas, pero quedan muy por debajo en el índice visual global y presentan porcentajes de defecto visible del 41 %, 50 % y 58 % respectivamente, frente al 5 % de Texel-4.5.

## Limitaciones y advertencias

- Calidad global inferior a Texel-4.2 (65,0 frente a 71,7), especialmente en estructura (54,0 frente a 66,0), es decir, en la colocación exacta de los bordes. Para máxima calidad conviene usar Texel-4.2 asumiendo el doble de tiempo.
- Puede añadir grano: en texturas con ruido fino preexistente, como hierba o grava, tiende a sobreexagerar el detalle y producir un grano crujiente. Se recomienda mezclar la salida con un upscale Lanczos simple o usar Texel-4.2.
- Solo procesa imágenes RGB: para texturas con transparencia hay que escalar el canal alfa por separado, por ejemplo con Lanczos.
- No debe aplicarse a mapas de normales, máscaras ni otros mapas de datos; está ajustado únicamente para texturas de color (albedo) y fotografías.
- El archivo ONNX no gestiona tileado: para texturas repetitivas sin costuras hay que aplicar wrap-padding manual de 16 px por lado y recortar 32 px de cada borde de la salida.
- Sesgos conocidos: el entrenamiento se limita a texturas de *Breath of the Wild*, *Bonelab* y escaneos de Poly Haven, por lo que el rendimiento en otros dominios visuales no está documentado.
- Riesgo de alucinación de detalle: las penalizaciones de borde y FFT mitigan patrones inventados, pero el modelo reconstruye detalle que no está presente en la entrada, lo que puede no ser aceptable en contextos forenses o de preservación estricta.
- Licencia CC0-1.0: permite uso comercial sin restricciones de atribución, pero el autor no ofrece garantías sobre el modelo.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que no existe validación independiente de los resultados más allá de los publicados por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheRizzlers/Texel-4.5
- Modelo Texel-4.2 (variante de mayor calidad): https://huggingface.co/TheRizzlers/Texel-4.2
- Poly Haven (fuente de materiales CC0 usados en entrenamiento): https://polyhaven.com
- chaiNNer (herramienta de procesado por nodos compatible): no disponible en la información proporcionada
- ONNX Runtime: no disponible en la información proporcionada
