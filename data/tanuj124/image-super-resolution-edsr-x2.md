# Tanuj124/image-super-resolution-edsr-x2

## Resumen

Compact EDSR Image Super-Resolution 2× es un modelo de superresolución de imagen (upscaling 2×) implementado en PyTorch por el usuario independiente Tanuj124. Se trata de una reimplementación propia de la arquitectura EDSR (Enhanced Deep Residual Networks) en su variante compacta, con solo 439.107 parámetros, entrenada localmente en una única GPU RTX 3060 de 12 GB. El modelo toma una imagen de baja resolución y devuelve una versión de doble resolución, resolviendo la tarea clásica de restauración de imagen mediante reconstrucción aprendida.

La relevancia de este modelo es fundamentalmente académica y educativa: demuestra que es posible entrenar un upscaler funcional con recursos de consumo muy limitados y publicar el pipeline completo (código de entrenamiento, inferencia, adquisición de datos y evaluación) junto con los pesos. No compite con los modelos de superresolución de gran escala, pero sí sirve como referencia reproducible de una implementación EDSR mínima.

El modelo se distribuye en formato safetensors, con licencia de uso exclusivamente académico para los pesos (el código fuente es MIT). No soporta idiomas ni texto: es un modelo puramente image-to-image sin integración con Transformers `AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EDSR compacta (8 bloques residuales, 48 canales de features, residual scaling 0.1, pixel shuffle, sin batch normalization) |
| Parametros totales | 439.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | academic-research-use-notice (pesos); código fuente MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red sigue el esquema EDSR: una convolución de entrada, 8 bloques residuales con 48 canales de features y escalado residual de 0.1, seguida de una etapa de upsampling mediante pixel shuffle para el factor 2×. No emplea batch normalization, GAN ni pérdida perceptual; el objetivo es puramente de reconstrucción. La entrada RGB se normaliza con un desplazamiento de media antes de la red.

El entrenamiento se realizó con Adam, pérdida L1, learning rate inicial de 0.0002 con schedule coseno, precisión mixta, clipping de gradiente de 1.0 y semilla 42. Se usaron parches LR de 48 píxeles con batch size de 12, durante 60 épocas por escala; el checkpoint exportado es el seleccionado por validación en la época 59. El conjunto de entrenamiento consta de 30.749 escenas HR únicas: 750 imágenes DIV2K (0001–0750) y 29.999 imágenes LSDIR obtenidas de un espejo de Kaggle. Las copias LR se generaron sintéticamente con degradación bicúbica de Pillow (sin entrenamiento RealSR). La validación interna usa DIV2K 0751–0800 y el test retenido DIV2K 0801–0900; el subconjunto LSDIR retenido de 250 imágenes se divide en 125 validación y 125 test.

## Capacidades

- Superresolución de imagen 2×: reconstrucción de una imagen de baja resolución a doble resolución.
- Restauración de imagen orientada a reconstrucción: mejora de nitidez y detalle en imágenes degradadas de forma bicúbica.
- Inferencia tiled: procesa imágenes grandes por teselas con halo de convolución para limitar el uso de memoria.
- Inferencia en CPU y CUDA: soporta ambos dispositivos mediante el flag `device='auto'`.
- Sin tool calling, sin agentes, sin capacidades multilingües ni modos de razonamiento: es un modelo puramente image-to-image.
- Límite operativo: rechaza salidas superiores a 16 megapíxeles para acotar el uso de memoria del host.

## Casos de uso

- Investigación académica en restauración de imagen: sirve como baseline reproducible y ligero para comparar técnicas de superresolución en entornos con recursos limitados, dado que incluye el código de entrenamiento y evaluación.
- Docencia y formación: permite ilustrar el funcionamiento interno de una red EDSR compacta, el efecto del pixel shuffle y el impacto de la pérdida L1 en reconstrucción, con un modelo que entrena en una RTX 3060.
- Preprocesado de imágenes para pipelines de visión: upscaling 2× de imágenes de baja resolución antes de tareas posteriores (detección, segmentación) cuando no se dispone de GPU de gama alta.
- Prototipado rápido en local: al caber holgadamente en una GPU de consumo y soportar CPU, permite experimentar con superresolución sin infraestructura cloud.
- Evaluación comparativa de degradaciones: útil para estudiar cómo se comporta un upscaler entrenado con degradación bicúbica frente a imágenes reales de cámara, como paso previo a decidir si se necesita un modelo RealSR.
- Generación de material de demostración: creación de pares LR/HR para tutoriales y notebooks sobre restauración de imagen, con la advertencia de que los detalles reconstruidos son estimaciones.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el checkpoint exportado (Y-PSNR en dB y Y-SSIM, comparados con bicúbico):

| Condicion | Imagenes | Y-PSNR dB | Y-SSIM | Bicubic dB | Bicubic SSIM |
|---|---:|---:|---:|---:|---:|
| evaluation-test | 100 | 35.5457 | 0.941355 | 32.6660 | 0.907792 |
| benchmark-div2k-official | 100 | 35.5452 | 0.941352 | 32.6659 | 0.907793 |
| benchmark-lsdir-heldout | 125 | 30.7212 | 0.910521 | 28.0751 | 0.854823 |

Protocolo: cuantización a 8 bits RGB, Y BT.601 de rango limitado, recorte de 2 píxeles, SSIM gaussiano válido de 11×11 (sigma 1.5), medias aritméticas por imagen. El test DIV2K empleado es el conjunto oficial de validación HR, no el test oculto del desafío. La procedencia del subconjunto LSDIR de Kaggle no está autenticada de forma independiente. LPIPS no fue evaluado y no se reclama ninguna comparación adicional de arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 439.107 parámetros el modelo ocupa menos de 2 MB en fp32, por lo que la VRAM queda dominada por las activaciones y el tamaño de la imagen de entrada.
- GPU recomendadas: cualquier GPU con CUDA; el autor entrenó y midió en una RTX 3060 de 12 GB. Funciona también en CPU.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1660 y superiores; incluso GPUs integradas pueden ejecutarlo en CPU con mayor latencia.
- Opciones de despliegue: script de inferencia propio incluido en `source.zip` (`superres.inference.Upscaler`), con soporte de inferencia tiled. No hay integración con vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de visión), ni con Transformers `AutoModel`.
- Latencia y throughput: el autor registra tiempos y memoria pico en `evaluation.json` medidos en RTX 3060, pero no se proporcionan cifras concretas en la información disponible; además, esas mediciones son de GPU y no constituyen una promesa de rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Escala | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Compact EDSR 2× (este) | 439.107 | 2× | imágenes, salida máx. 16 MP | académica (pesos), MIT (código) | Hugging Face, repo pequeño |
| EDSR original (Lim et al., 2017) | del orden de millones (no disponible el dato exacto en esta ficha) | 2×, 3×, 4× | imágenes | investigación/publicación | pesos de referencia de los autores |
| Real-ESRGAN | no disponible | 2×, 4× | imágenes reales | BSD-3 (código) / otras según variante | ampliamente disponible |
| SwinIR | no disponible | 2×, 3×, 4× | imágenes | Apache 2.0 (código) | disponible en repos oficiales |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, escala, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso previsto exclusivamente académico y educativo; la licencia de los pesos (`academic-research-use-notice`) no afirma derechos de uso comercial.
- El código fuente es MIT, pero no se declara una licencia permisiva para los pesos entrenados; los avisos de los datasets no establecen explícitamente derechos de redistribución de los pesos.
- Entrenado únicamente con degradación bicúbica sintética (Pillow); no hay entrenamiento RealSR, por lo que no se garantiza su rendimiento en degradaciones reales de cámara.
- Los detalles reconstruidos son estimaciones y pueden ser erróneos, especialmente en texto, caras, matrículas, ruido y artefactos JPEG.
- No debe usarse como evidencia forense, médica ni de identidad.
- Riesgo de alucinación visual: la red puede inventar texturas y detalles plausibles que no existen en la imagen original.
- Limitación de tamaño: rechaza salidas superiores a 16 megapíxeles.
- Posible contaminación de splits: el autor advierte que no se pueden descartar por completo recortes arbitrarios o escenas repetidas entre conjuntos.
- La procedencia del subconjunto LSDIR de Kaggle no está autenticada de forma independiente.
- No se incluyen las imágenes fuente ni las reconstrucciones de muestra en la release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tanuj124/image-super-resolution-edsr-x2
- Aviso de uso de los pesos: https://huggingface.co/Tanuj124/image-super-resolution-edsr-x2/blob/main/LICENSE-WEIGHTS.md
- DIV2K (Agustsson y Timofte, NTIRE 2017): https://data.vision.ee.ethz.ch/cvl/DIV2K/
- LSDIR (Li et al., CVPR Workshops 2023): https://ofsoundof.github.io/lsdir-data/
- Espejo de LSDIR en Kaggle: https://www.kaggle.com/datasets/parampandya0310/hr-image-denoising-lsdir
