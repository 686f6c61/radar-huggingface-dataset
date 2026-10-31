# Tomoali/SwinIR-M-x4-realSR-onnx

## Resumen

Tomoali/SwinIR-M-x4-realSR-onnx es una conversión a formato ONNX del modelo de superresolución SwinIR-M x4 para imágenes reales, entrenado originalmente por Jingyun Liang et al. (variante `003_realSR_BSRGAN_DFO_s64w8_SwinIR-M_x4_GAN`). No se trata de un modelo de lenguaje, sino de un modelo image-to-image que amplía imágenes con un factor de 4x mediante una arquitectura basada en Swin Transformer, con pérdida GAN para obtener resultados realistas en fotografías degradadas del mundo real (modelo de degradación BSRGAN con degradaciones compuestas).

La relevancia de esta conversión reside en su optimización para hardware de consumidor: incluye dos exportaciones de forma fija (256x256 → 1024x1024), una en fp32 para DirectML/CPU mediante ONNX Runtime y otra en bf16 para ejecutarse sobre la NPU XDNA2 de los procesadores AMD Ryzen AI mediante el execution provider VitisAI. Es especialmente útil para desarrolladores que quieren integrar superresolución de alta calidad en equipos portátiles con NPU, sin depender de GPU dedicadas. Los pesos originales y la conversión se publican bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinIR (Swin Transformer para restauración de imágenes), variante Medium (M), con pérdida GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp32 y bf16 (conversión con cast, sin calibración, mediante AMD Quark) |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportación de forma fija, opset 17); pesos originales en PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo base es SwinIR-M, una arquitectura basada en Swin Transformer que procesa la imagen mediante ventanas de atención de 8x8 píxeles y mecanismos de atención desplazada (shifted window), diseñada específicamente para tareas de restauración de imágenes. La variante empleada está entrenada para superresolución real (real-world SR) con factor 4x, utilizando el modelo de degradación BSRGAN con degradaciones compuestas (DFO: blur, downsample, ruido, JPEG) y una pérdida GAN, lo que produce texturas más realistas que variantes puramente basadas en PSNR, a costa de posible pérdida de fidelidad métrica.

La conversión a ONNX se realizó cargando los pesos mediante la biblioteca spandrel, con exportación de forma fija (sin ejes dinámicos), opset 17 y simplificación con onnxsim. Durante la exportación se reescribieron los nodos `Slice` con límites negativos a límites positivos, ya que el compilador VAIML de Ryzen AI 1.8.0 falla con ellos. La versión bf16 se obtuvo con la herramienta `convert_fp32_to_bf16` de AMD Quark en formato `with_cast`, sin datos de calibración.

## Capacidades

- Superresolución de imágenes 4x: entrada RGB de 256x256 (NCHW, float32, rango [0, 1]) con salida de 1024x1024.
- Restauración de imágenes reales: entrenada con degradaciones BSRGAN, maneja bien ruido, compresión JPEG y desenfoque en fotografías reales.
- Salida con texturas realistas gracias a la pérdida GAN.
- Ejecución sobre NPU AMD Ryzen AI (XDNA2) mediante VitisAI EP en bf16.
- Ejecución sobre iGPU mediante DirectML o CPU mediante ONNX Runtime en fp32.
- Procesamiento por teselas (tiling) de 256x256 para imágenes mayores, con fusión posterior (implementado en TOGU SCALER).

## Casos de uso

- Mejora de fotografías antiguas o comprimidas: al estar entrenada con degradaciones realistas (BSRGAN), la modelo puede restaurar fotos con ruido, desenfoque y artefactos JPEG, ampliándolas 4x con texturas naturales.
- Escalado de imágenes en portátiles con NPU: la variante bf16 está optimizada para la NPU XDNA2 de Ryzen AI, permitiendo integrar el escalado en aplicaciones Windows sin GPU dedicada.
- Preprocesamiento en pipelines de visión: ampliar imágenes de baja resolución antes de tareas de OCR o detección puede mejorar la legibilidad de texto pequeño y detalles finos.
- Aplicaciones de escritorio con DirectML: la versión fp32 funciona sobre cualquier iGPU compatible con DirectML mediante ONNX Runtime, útil para herramientas de edición de imagen sin dependencias de CUDA.
- Generación de fondos o material gráfico en alta resolución: convertir assets de 256x256 a 1024x1024 en flujos de trabajo de diseño donde no se disponga de la fuente original en alta resolución.
- Upscaling en reproductores o visores multimedia: procesamiento por teselas de fotogramas (por ejemplo, 854x480 → 4x) para mejorar contenido de baja resolución, aunque con latencias del orden de decenas de segundos por fotograma, más adecuado para imágenes fijas que para vídeo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR/SSIM sobre conjuntos como Set5, Set14 o Urban100) en la información disponible. Sí se han publicado mediciones de rendimiento en el hardware de destino, sobre un Ryzen AI 7 PRO 350 (NPU XDNA2, Radeon 860M, 32 GB LPDDR5-8000, Ryzen AI SW 1.8.0, driver NPU 32.0.203.329), procesando un fotograma de 854x480 a 4x con teselas de 256x256:

| Ejecución | Tiempo por fotograma | PSNR frente a salida fp32 |
|---|---|---|
| iGPU, DirectML, fp32 | 59 s | — |
| NPU, VitisAI EP, bf16, modo de energía Default | 82 s | 38,5 dB |
| NPU, VitisAI EP, bf16, modo de energía Turbo | 49 s | 38,5 dB |

La compilación inicial del modelo bf16 con VAIML en la NPU tarda aproximadamente 65 minutos y puede consumir hasta 25 GB de RAM; el resultado se cachea y las sesiones posteriores arrancan en segundos.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, por lo que los requisitos de almacenamiento son mínimos.
- Para NPU: procesador AMD Ryzen AI con NPU XDNA2, Ryzen AI Software 1.8.0 y driver NPU compatible; se recomiendan al menos 32 GB de RAM para la compilación inicial (hasta 25 GB de consumo).
- Para iGPU: GPU integrada compatible con DirectML (probado sobre AMD Radeon 860M); también funciona en CPU mediante ONNX Runtime.
- No requiere GPU dedicada de gama alta; es un modelo pensado para ejecución local en equipos de consumidor.
- Despliegue mediante ONNX Runtime con execution providers DirectML (fp32) o VitisAI (bf16); también forma parte del proyecto TOGU SCALER, un upscaler para Windows que ejecuta estos archivos sobre DirectML y la NPU de Ryzen AI.
- Rendimiento medido: 49-82 segundos por fotograma de 854x480 a 4x según el modo de energía de la NPU; es un modelo lento, orientado a imágenes fijas de alta calidad.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Formato | Licencia | Disponibilidad NPU |
|---|---|---|---|---|---|
| SwinIR-M x4 realSR (esta conversión) | Swin Transformer (medium) | SR real 4x con GAN | ONNX fp32/bf16 | Apache 2.0 | Sí (VitisAI, XDNA2) |
| SwinIR original (JingyunLiang/SwinIR) | Swin Transformer | SR real 4x con GAN | PyTorch (.pth) | Apache 2.0 | No (requiere conversión propia) |
| ESRGAN / Real-ESRGAN | CNN (RRDB) | SR real 4x | PyTorch, ONNX (conversiones de terceros) | BSD-3 (Real-ESRGAN) | Depende de la conversión |

Frente al Real-ESRGAN, SwinIR-M suele ofrecer mayor calidad de textura en imágenes muy degradadas, a cambio de una inferencia considerablemente más lenta, como confirman las mediciones publicadas (decenas de segundos por fotograma). No se dispone de comparativas numéricas directas en la información proporcionada.

## Limitaciones y advertencias

- Forma de entrada fija: los ONNX exportados solo aceptan entradas de 256x256 (múltiplo de la ventana de atención de 8x8); para imágenes mayores es necesario aplicar tiling y fusión por cuenta del desarrollador.
- Latencia elevada: entre 49 y 82 segundos por fotograma de 854x480 en el hardware medido; no es apto para superresolución de vídeo en tiempo real.
- Compilación inicial muy costosa en NPU: unos 65 minutos y hasta 25 GB de RAM; la caché generada depende de las versiones de Ryzen AI Software y del driver de la NPU, por lo que debe compilarse en la máquina de destino.
- Pérdida de precisión por bf16: la salida bf16 se desvía de la fp32 con un PSNR de 38,5 dB entre ambas; puede haber diferencias visuales sutiles.
- Naturaleza GAN: la pérdida adversarial puede introducir texturas inventadas o alucinaciones de detalle no presentes en la imagen original; no es adecuado cuando se requiere fidelidad forense o métrica estricta.
- Conversión independiente: se trata de una conversión personal no afiliada ni respaldada por AMD ni por los autores de SwinIR; AMD y Ryzen son marcas de Advanced Micro Devices, Inc.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y atribución a los autores originales de SwinIR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tomoali/SwinIR-M-x4-realSR-onnx
- Repositorio original de SwinIR (pesos y código): https://github.com/JingyunLiang/SwinIR
- Paper de SwinIR: *SwinIR: Image Restoration Using Swin Transformer*, ICCVW 2021
- Script de exportación ONNX: https://github.com/tomhda/togu-scaler/blob/main/scripts/npu/export_spandrel.py
- Documentación del proceso de conversión: https://github.com/tomhda/togu-scaler/blob/main/docs/model-conversion.md
- Notas sobre la ejecución en NPU: https://github.com/tomhda/ryzen-ai-npu-super-resolution-notes/blob/main/docs/swinir-npu.md
- Proyecto TOGU SCALER: https://github.com/tomhda/togu-scaler
- Biblioteca spandrel: https://github.com/chaiNNer-org/spandrel
- Documentación de Ryzen AI Software: https://ryzenai.docs.amd.com/
- Issue sobre nodos Slice en VAIML: https://github.com/amd/RyzenAI-SW/issues/397
