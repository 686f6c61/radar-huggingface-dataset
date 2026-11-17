# thisismert/real-esrgan-onnx

## Resumen

Real-ESRGAN (ONNX) es una exportación a formato ONNX de los pesos oficiales del modelo Real-ESRGAN, desarrollado originalmente por Xintao Wang y colaboradores en el repositorio xinntao/Real-ESRGAN. Este repositorio, publicado por el usuario thisismert, no introduce un modelo nuevo: se limita a convertir a ONNX los checkpoints originales en PyTorch de cuatro variantes de superresolución (x4plus, x4plus_anime_6B, general-x4v3 y general-wdn-x4v3), tanto en fp32 como en fp16, para permitir su ejecución en navegador mediante ONNX Runtime Web o Transformers.js.

El problema que resuelve es la superresolución de imágenes: aumentar la resolución de una imagen de entrada por un factor de 4 en cada dimensión (4x en área, 16x en píxeles totales) con calidad fotográfica o para ilustración, según la variante. La relevancia actual radica en que facilita el despliegue client-side sin backend: los archivos ONNX pueden cargarse directamente en el navegador, lo que abre la puerta a aplicaciones de mejora de imagen en tiempo real sin enviar datos a un servidor.

Arquitectónicamente son dos familias de redes: SRVGGNetCompact (variantes general-x4v3 y general-wdn-x4v3) y RRDBNet (x4plus y x4plus_anime_6B), ambas procedentes de BasicSR. El repositorio ocupa 0,1 GB e incluye pesos en fp32 y fp16 con opset 17. No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo de visión puro de image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (general-x4v3, general-wdn-x4v3) y RRDBNet (x4plus, x4plus_anime_6B), ambas de BasicSR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 y fp16 (los archivos `_fp16` computan en media precisión pero mantienen entradas y salidas en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause (copyright 2021 Xintao Wang) |
| Formato de pesos | ONNX (opset 17); los originales son `.pth` de PyTorch |
| Entrada | float32 `[1, 3, H, W]`, RGB en rango 0..1, altura y anchura arbitrarias |
| Salida | float32 `[1, 3, 4H, 4W]`, RGB en rango aproximado 0..1 (requiere clamp manual) |
| Factor de escala | 4x en cada dimensión espacial |
| Librería | transformers.js (también compatible con ONNX Runtime Web) |
| Pipeline | image-to-image |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El repositorio contiene cuatro variantes con dos arquitecturas distintas. Las variantes `realesr-general-x4v3` y `realesr-general-wdn-x4v3` emplean SRVGGNetCompact, una red convolucional compacta orientada a inferencia rápida; la segunda añade denoising explícito. Las variantes `RealESRGAN_x4plus` y `RealESRGAN_x4plus_anime_6B` usan RRDBNet, una red residual densa más pesada y de mayor calidad, siendo la versión anime una adaptación con 6 bloques RRDB orientada a ilustraciones.

Los pesos proceden de los checkpoints oficiales de Real-ESRGAN en las versiones v0.2.5.0 (general), v0.1.0 (x4plus) y v0.2.2.4 (anime). El autor reconstruyó las arquitecturas en PyTorch puro, cargó los `.pth` en modo estricto y exportó con `torch.onnx.export` a opset 17; las copias fp16 se generaron con `onnxconverter-common` usando `keep_io_types=True`. Cada exportación se validó contra PyTorch: la diferencia absoluta máxima fue de 3,3e-5 para fp32 y 7,8e-3 para fp16. No se detallan en la información disponible los datos de entrenamiento originales, el número de tokens (no aplica) ni si hubo RLHF/DPO (no aplica a un modelo de visión).

## Capacidades

- Superresolución de imágenes con factor de escala 4x en cada dimensión (16x en número de píxeles).
- Restauración de fotografías generales con la variante `realesr-general-x4v3` (rápida) y `RealESRGAN_x4plus` (mayor calidad, más pesada).
- Reducción de ruido integrada en la variante `realesr-general-wdn-x4v3`.
- Superresolución especializada de anime e ilustraciones con `RealESRGAN_x4plus_anime_6B`.
- Procesamiento de imágenes de altura y anchura arbitrarias (entrada dinámica `[1, 3, H, W]`).
- Ejecución en navegador mediante ONNX Runtime Web o Transformers.js, sin backend.
- Inferencia en fp32 o fp16 según el archivo elegido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de image-to-image.

## Casos de uso

- Mejora de fotos en aplicaciones web client-side: cargar el ONNX en el navegador con ONNX Runtime Web permite escalar imágenes 4x sin enviar los datos a un servidor, lo que resulta adecuado para privacidad y para reducir costes de backend.
- Restauración de imágenes antiguas o de baja resolución: la variante `realesr-general-wdn-x4v3` combina superresolución y denoising, útil para digitalizar archivos fotográficos con ruido o compresión.
- Escalado de ilustraciones y material de anime: `RealESRGAN_x4plus_anime_6B` está entrenada específicamente para este dominio y produce bordes limpios en líneas y colores planos.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de recortes pequeños antes de pasarlos a un detector o clasificador, usando `realesr-general-x4v3` por su menor coste computacional.
- Herramientas de edición de imagen en el navegador: integración como paso de "mejorar resolución" en editores web basados en Canvas o WebGPU, aprovechando la salida `[1, 3, 4H, 4W]` directamente como textura.
- Generación de miniaturas de alta calidad a partir de originales pequeños: escalar 4x en el cliente para servir imágenes nítidas sin almacenar versiones de mayor tamaño en el servidor.
- Prototipado rápido en entornos Transformers.js: al estar etiquetado con `transformers.js` y `pipeline_tag: image-to-image`, se puede invocar desde JavaScript sin infraestructura Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la exportación frente a PyTorch:

| Métrica | fp32 | fp16 |
|---|---|---|
| Diferencia absoluta máxima vs. PyTorch | 3,3e-5 | 7,8e-3 |

No se aportan valores de PSNR, SSIM, LPIPS ni comparativas con otros modelos de superresolución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que los pesos individuales son ligeros y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas. Al ejecutarse en navegador mediante ONNX Runtime Web, puede usar WebGPU o WebGL según el navegador; en servidor, cualquier GPU con soporte ONNX Runtime es válida.
- Cabe en GPU consumer: sí, dado el reducido tamaño del repositorio; las variantes SRVGGNetCompact son las más ligeras y las RRDBNet las más exigentes.
- Opciones de despliegue: ONNX Runtime Web, Transformers.js, ONNX Runtime (Python/C++/C#), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| Real-ESRGAN (ONNX, este repo) | SRVGGNetCompact / RRDBNet | 4x | ONNX | BSD-3-Clause | Sí (ONNX Runtime Web, Transformers.js) |
| Real-ESRGAN original (xinntao) | SRVGGNetCompact / RRDBNet | 4x | PyTorch `.pth` | BSD-3-Clause | No (requiere Python) |
| SwinIR | Transformer (Swin) | 2x/3x/4x | PyTorch | Apache-2.0 | No de forma nativa |
| ESRGAN | RRDBNet | 4x | PyTorch | Apache-2.0 | No de forma nativa |

La ventaja diferencial de este repositorio frente a los pesos originales es el formato ONNX listo para navegador; frente a SwinIR o ESRGAN, la disponibilidad de exportaciones ONNX validadas y de variantes fp16. No se dispone de datos de rendimiento comparativo (PSNR/SSIM) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es una reexportación de pesos oficiales; cualquier limitación de Real-ESRGAN original se hereda.
- La salida está en rango aproximado 0..1 y requiere clamp manual; no aplicar el clamp puede producir artefactos de color.
- La variante fp16 introduce un error mayor (hasta 7,8e-3 de diferencia absoluta máxima frente a PyTorch) que la fp32 (3,3e-5), relevante si se requiere fidelidad numérica estricta.
- Factor de escala fijo 4x: no soporta escalas arbitrarias como 2x o 3x.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de superresolución, puede inventar texturas o detalles plausibles pero no presentes en la imagen original.
- Sin capacidades de texto, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Idiomas soportados: no disponible (no procesa texto).
- Licencia BSD-3-Clause: permite uso comercial con atribución y conservación del aviso de copyright de Xintao Wang; conviene revisar los términos completos antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.
- No se documentan sesgos ni datos de entrenamiento originales en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thisismert/real-esrgan-onnx
- Repositorio oficial Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Licencia oficial: https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE
- BasicSR (arquitecturas SRVGGNetCompact y RRDBNet): https://github.com/XPixelGroup/BasicSR
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Transformers.js: https://github.com/huggingface/transformers.js
