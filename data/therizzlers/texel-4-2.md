# TheRizzlers/Texel-4.2

## Resumen

Texel-4.2 es un modelo de superresolución de imagen (upscaling 2×) especializado en texturas de videojuegos y fotografías, desarrollado por TheRizzlers. No es un modelo de lenguaje: es una red neuronal convolucional empaquetada en formato ONNX que recibe una imagen RGB y devuelve una versión de exactamente el doble de resolución en cada eje, eliminando artefactos de compresión (bloques BC1/DXT, blocking JPEG, ruido) y reconstruyendo grano fino de superficie en lugar de suavizarlo.

Se trata de la iteración 4.2 de la familia Texel, que mantiene la misma arquitectura ResSR que Texel-4 y Texel-4.1 (CNN residual con PixelShuffle, 128 canales, 80 convoluciones, 11,97 M de parámetros), pero con un reentrenamiento sobre 828 escaneos de materiales CC0 adicionales de Poly Haven. Según el autor, es igual de bueno en texturas de juego, mejor en texturas no vistas durante el entrenamiento y notablemente mejor en fotografías.

Es relevante para pipelines de remasterización de assets, generación de contenido y procesado por lotes de texturas, porque el modelo completo cabe en un único fichero ONNX de 48 MB, funciona con cualquier tamaño de entrada y se integra directamente en herramientas sin Python como chaiNNer. La licencia CC0 1.0 (dominio público) elimina prácticamente cualquier fricción para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResSR: CNN residual con upsampling PixelShuffle y skip nearest-neighbour; 128 canales, 80 convoluciones |
| Parámetros totales | 11,97 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible (solo se publica fp32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`Texel-4.2_2x_fp32.onnx`, 48 MB) |
| Entrada | float32, `[batch, 3, H, W]`, RGB en rango 0..1 |
| Salida | float32, `[batch, 3, 2H, 2W]` |
| Factor de escala | 2× exacto |
| Tamaño de entrada | cualquiera (no requiere dimensiones fijas) |

## Arquitectura y entrenamiento

El modelo emplea ResSR, una red convolucional residual con 128 canales y 80 convoluciones (11,97 M de parámetros). El upsampling se realiza mediante PixelShuffle, complementado con una conexión residual de tipo nearest-neighbour que preserva la señal de baja frecuencia. La misma arquitectura se comparte con Texel-4 y Texel-4.1, por lo que las mejoras de 4.2 provienen exclusivamente de los datos y del ajuste fino, no de cambios estructurales.

El entrenamiento se realizó en dos etapas. La primera consistió en 30.000 pasos con pérdida L1 partiendo de Texel-4, sobre texturas de videojuegos más 828 escaneos de materiales CC0 de Poly Haven, con reparto equitativo entre ambos conjuntos. Las entradas de entrenamiento incorporaban una mezcla aleatoria de downscaling, compresión JPEG, compresión BC1, ruido y banding, de modo que el modelo aprende a invertir daños de compresión reales. La segunda etapa fue un ajuste fino de detalle de 10.000 pasos con la misma receta que 4.1: estadísticas de textura VGG19 (matrices de Gram), distancia de características VGG y L1 a nivel de píxel, con recortes de entrenamiento sesgados hacia parches de textura con mucha información y una penalización en el dominio de la frecuencia (FFT) para evitar que el modelo invente patrones de rejilla repetitivos.

## Capacidades

- Superresolución 2× de imágenes RGB con salida de tamaño exactamente el doble en cada eje.
- Eliminación de artefactos de compresión de bloques BC1/DXT y blocking JPEG.
- Reducción de ruido y de banding en la imagen de entrada.
- Reconstrucción de grano fino de superficie en lugar de suavizado agresivo.
- Procesado de texturas de videojuegos (albedo) y fotografías.
- Funciona con cualquier resolución de entrada, sin recortes ni tamaños fijos.
- Integración sin Python mediante chaiNNer (nodos Load Model ONNX → Upscale Image).
- Ejecución vía onnxruntime con proveedores CUDA o CPU.
- Soporte de texturas repetibles (seamless) mediante wrap-padding manual de 16 px y recorte posterior de 32 px en la salida.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Remasterización de texturas de videojuegos: el modelo está entrenado específicamente sobre texturas con compresión BC1/DXT, por lo que puede tomar assets originales de un juego y generar versiones a 2× que eliminan la rejilla de bloques visible, sin necesidad de reautoría manual.
- Procesado por lotes en pipelines de assets: al aceptar cualquier tamaño de entrada y ser un único ONNX de 48 MB, se puede encadenar en scripts de onnxruntime o en grafos de chaiNNer para procesar cientos de texturas de forma desatendida.
- Limpieza de fotografías comprimidas: la mejora en DIV2K (PSNR de 31,45 dB frente a 30,60 dB de 4.1, y desplazamiento de color de 0,7/255 frente a 3,1/255) lo hace adecuado para recuperar fotos con blocking JPEG y banding.
- Preparación de texturas para motores con soporte de alta resolución: upscaling previo a la importación en Unreal o Unity para material maps de color, con la advertencia de no aplicarlo a normal maps ni máscaras.
- Generación de texturas repetibles para entornos 3D: mediante wrap-padding de 16 px y recorte de 32 px se obtienen tiles seamless a 2×, útiles para materiales de terreno y superficies continuas.
- Integración en herramientas de artista sin programación: el flujo Load Model (ONNX) → Upscale Image en chaiNNer permite a artistas técnicos aplicar el modelo sin escribir código.
- Restauración de capturas y material de archivo: para imágenes con ruido y compresión moderada donde se busca recuperar detalle plausible, aceptando que parte del grano añadido es sintético y no el original exacto.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan Texel-4.1 y Texel-4.2 sobre tres conjuntos de prueba. Cada imagen se redujo 2× y se volvió a ampliar, comparándose con el original. La "distancia perceptual" se calcula sobre características VGG19 (menor es mejor) y "detalle" es la energía de detalle fino relativa a la imagen real (1,0 = igual de detallada).

| Conjunto de prueba | Modelo | PSNR | Distancia perceptual ↓ | Detalle | Desplazamiento máx. de color |
|---|---|---|---|---|---|
| 83 texturas de terreno de *Breath of the Wild* | Texel-4.1 | 33,94 dB | 0,538 | 0,92 | 0,5/255 |
| | **Texel-4.2** | 33,91 dB | 0,538 | 0,90 | 0,5/255 |
| 35 texturas Poly Haven no vistas en entrenamiento | Texel-4.1 | 32,28 dB | 0,552 | 0,83 | 0,6/255 |
| | **Texel-4.2** | 32,23 dB | **0,513** | **0,90** | 0,6/255 |
| 100 fotos DIV2K | Texel-4.1 | 30,60 dB | 0,783 | 0,95 | 3,1/255 |
| | **Texel-4.2** | **31,45 dB** | **0,688** | 0,96 | **0,7/255** |

Como referencia, en el conjunto de terreno, Real-ESRGAN x2plus obtiene 30,00 dB, con distancia perceptual de 0,834 y desplazamiento de color de 8,2/255. En uso real (texturas de 1024² ampliadas a 2048² sin reducción previa), el autor indica que Texel-4.2 no añade patrones repetitivos visibles.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 11,97 M de parámetros en fp32, los pesos ocupan aproximadamente 48 MB; el consumo real depende del tamaño de la imagen y del batch, ya que las activaciones intermedias a 128 canales dominan el uso de memoria.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo se ejecuta con el proveedor `CUDAExecutionProvider` de onnxruntime o con `CPUExecutionProvider` como alternativa.
- GPU de consumo: dado el reducido tamaño del modelo (48 MB), es razonable esperar que quepa en cualquier GPU de consumo moderna con suficiente VRAM para las activaciones, aunque no se publican cifras concretas.
- Opciones de despliegue: onnxruntime (Python, con CUDA o CPU) y chaiNNer (sin Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de imagen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Parámetros | PSNR (terreno) | Distancia perceptual (terreno) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| **Texel-4.2** | Upscaler de texturas y fotos | 2× | 11,97 M | 33,91 dB | 0,538 | CC0 1.0 | ONNX fp32 |
| Texel-4.1 | Upscaler de texturas y fotos | 2× | 11,97 M | 33,94 dB | 0,538 | CC0 1.0 (según familia) | ONNX |
| Texel-4 | Upscaler orientado a PSNR | 2× | 11,97 M | no disponible | no disponible | CC0 1.0 (según familia) | ONNX |
| Real-ESRGAN x2plus | Upscaler general | 2× | no disponible | 30,00 dB | 0,834 | no disponible | no disponible |

Texel-4.2 se posiciona como la variante orientada a detalle perceptual dentro de la familia Texel, con mejor comportamiento en fotos y texturas no vistas que 4.1, a costa de un PSNR ligeramente inferior (en torno a 1,5 dB por debajo de Texel-4, según el autor).

## Limitaciones y advertencias

- Está ajustado para detalle, por lo que su PSNR es aproximadamente 1,5 dB inferior al de Texel-4; parte del grano que añade es plausible pero no el original exacto. Para una coincidencia píxel a píxel más fiel hay que usar un modelo entrenado para PSNR como Texel-4.
- Solo procesa RGB. Para texturas con transparencia hay que ampliar el canal alfa por separado (por ejemplo con Lanczos).
- No es tile-aware: para texturas repetibles hay que aplicar wrap-padding manual de 16 px por lado y recortar 32 px en cada borde de la salida.
- No debe usarse sobre normal maps, máscaras ni otros data maps; está pensado para texturas de color (albedo) y fotos.
- Riesgo de invención de detalle: el ajuste fino con estadísticas VGG puede generar grano que no estaba en la imagen original.
- Los datos de entrenamiento incluyen texturas de *The Legend of Zelda: Breath of the Wild* y *Bonelab*; aunque los pesos son CC0, la procedencia de parte de los datos de entrenamiento puede ser relevante para evaluaciones de cumplimiento en algunos contextos.
- El proyecto no está afiliado ni respaldado por Nintendo, Stress Level Zero ni Poly Haven.
- No se han publicado datos de sesgos (no aplica en el sentido habitual de modelos de lenguaje), latencia ni requisitos de VRAM concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheRizzlers/Texel-4.2
- Texel-4.1: https://huggingface.co/TheRizzlers/Texel-4.1
- Texel-4: https://huggingface.co/TheRizzlers/Texel-4
- Poly Haven (fuente de escaneos CC0): https://polyhaven.com
- chaiNNer (herramienta de integración sin Python): no disponible en la información proporcionada
