# yasir390/image-upscaller-models

## Resumen

`yasir390/image-upscaller-models` no es un modelo de lenguaje, sino un repositorio de artefactos ONNX que empaqueta seis redes neuronales de vision por computador utilizadas por la aplicacion Android gratuita *Image Upscaler* (`com.yaara.image_upscaller`). El repositorio lo publica el desarrollador independiente yasir390 y su funcion es servir como CDN de pesos: la app descarga cada fichero una sola vez y ejecuta toda la inferencia en el dispositivo, sin enviar imagenes a servidores externos.

El contenido agrupa tres familias de modelos: superresolucion (Real-ESRGAN en variantes x4plus, x2plus, general v3 y anime 6B), restauracion facial (GFPGAN v1.4) y colorizacion (DDColor tiny). Los pesos originales provienen de proyectos de referencia de la comunidad (Xintao Wang et al. para Real-ESRGAN, Tencent ARC para GFPGAN y Kang et al. para DDColor), y yasir390 los ha exportado a ONNX con scripts propios (`tools/prepare_models.py`).

Su relevancia es practica: ofrece un paquete coherente, ya convertido y versionado en dos modos de computo (float32 y float16), para quien quiera integrar pipeline de mejora de imagen en movil o en escritorio sin tener que reproducir las exportaciones. El tamano total del repositorio es de aproximadamente 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales de superresolucion (RRDB en Real-ESRGAN), restauracion facial GAN (GFPGAN v1.4) y colorizacion (DDColor tiny); exportadas a ONNX |
| Parametros totales | no disponible (no se publica el recuento por fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto) |
| Tipos de cuantizacion | float32 (computo fp32, pesos almacenados en fp16 y convertidos al cargar) y float16 (computo fp16 con entrada/salida fp32, para CPUs ARMv8.2+) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | mixta: BSD-3-Clause (Real-ESRGAN), Apache-2.0 (GFPGAN, DDColor); el repositorio declara `license: other` / `mixed-open-source` |
| Formato de pesos | ONNX (`.onnx` y variantes `_fp16.onnx`) |

## Arquitectura y entrenamiento

Los modelos no se han entrenado en este repositorio: son exportaciones ONNX de pesos ya publicados. Real-ESRGAN emplea generadores con bloques RRDB (Residual in Residual Dense Block) y un discriminador U-Net con espectro de Fourier para el entrenamiento adversarial; las variantes x4plus y x2plus priorizan calidad maxima, `general_x4v3` prioriza velocidad y `anime_6b` esta especializada en ilustracion. GFPGAN v1.4 anade una rama de restauracion facial sobre una arquitectura generativa con prior facial, y DDColor tiny es una red de colorizacion automatica derivada del paper de Kang et al.

La innovacion del repositorio es de ingenieria de despliegue, no de modelado: cada red se ofrece en dos variantes de precision. Los ficheros planos calculan en float32 con pesos almacenados en float16 (se convierten al cargar), mientras que los `_fp16` calculan en float16 manteniendo entrada y salida en float32 y aprovechan las instrucciones FP16 de ARMv8.2+, con una mejora declarada de aproximadamente 1,5 veces en velocidad. No se documentan tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO, porque no aplican ni se detallan.

## Capacidades

- Superresolucion x4 de maxima calidad mediante Real-ESRGAN x4plus.
- Superresolucion x2 de maxima calidad mediante Real-ESRGAN x2plus.
- Superresolucion x4 rapida mediante Real-ESRGAN general v3, pensada para procesado en tiempo real en movil.
- Superresolucion x4 especializada en anime e ilustracion (Real-ESRGAN anime 6B).
- Restauracion de rostros degradados o de baja resolucion con GFPGAN v1.4.
- Colorizacion automatica de imagenes en escala de grises con DDColor tiny.
- Inferencia completamente local en el dispositivo (sin llamadas a API).
- Ejecucion via runtime ONNX en CPU; soporte de ruta optimizada fp16 en ARMv8.2+.
- No incluye tool calling, agentes, razonamiento multi-step ni capacidades de texto.

## Casos de uso

- Restauracion de fotos familiares antiguas: combinar Real-ESRGAN x4plus para recuperar detalle global con GFPGAN v1.4 para reparar rostros, en un pipeline de dos pasos ejecutado en el propio telefono.
- Colorizacion de archivos historicos en blanco y negro: aplicar DDColor tiny antes o despues del upscaling para obtener una version coloreada y ampliada sin salir del dispositivo.
- Mejora de capturas y miniaturas para redes sociales: usar `realesr_general_x4v3_fp16` como paso rapido de reescalado en apps de edicion movil, aprovechando la ruta fp16 en CPUs ARMv8.2+.
- Preparacion de assets para videojuegos o ilustracion: `realesrgan_x4plus_anime_6b` mantiene lineas limpias y reduce artefactos en dibujos y sprites, adecuado para pipelines de arte 2D.
- Digitalizacion de documentos y fotos escaneadas: el x2plus evita el sobreescalado cuando la imagen original ya tiene cierta resolucion y solo necesita un factor moderado.
- Prototipado offline en escritorio: cargar los mismos `.onnx` con ONNX Runtime en Python o C++ para validar un pipeline de restauracion antes de portarlo a la app Android.
- Aplicaciones de privacidad estricta: al no requerir red, encaja en escenarios donde las imagenes no pueden salir del dispositivo (fotografia medica no critica, documentos personales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una mejora aproximada de 1,5 veces en velocidad para los ficheros `_fp16` frente a los planos en CPUs ARMv8.2+, sin cifras absolutas de PSNR, SSIM, LPIPS ni tiempos de inferencia por imagen.

## Requisitos de hardware

- VRAM: no aplica en el caso principal (inferencia en CPU movil). En escritorio con GPU, cada red ocupa del orden de cientos de MB en fp32; el repositorio completo pesa unos 0,5 GB.
- GPU recomendadas: no documentadas por el autor. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) puede ejecutar los ficheros, pero no hay cifras de rendimiento publicadas.
- GPU de consumo: los modelos estan pensados para CPU de telefono; en una RTX 4090 o similar caben sobradamente, aunque el autor no publica latencias.
- Despliegue: ONNX Runtime (Android, iOS, Python, C++), onnxruntime-web en navegador y cualquier runtime compatible con ONNX. No se distribuyen pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles; la unica referencia es la mejora relativa de ~1,5x de la variante fp16.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Real-ESRGAN + GFPGAN + DDColor en ONNX) | Paquete ONNX listo para movil | x2 y x4 | Mixta BSD-3-Clause / Apache-2.0 | ONNX fp32 y fp16 | Hugging Face, 0 descargas |
| Real-ESRGAN original (xinntao) | Pesos PyTorch | x2, x4, anime | BSD-3-Clause | `.pth` | GitHub y releases oficiales |
| GFPGAN original (Tencent ARC) | Pesos PyTorch | Restauracion facial | Apache-2.0 | `.pth` | GitHub oficial |
| DDColor original (piddnad) | Pesos PyTorch | Colorizacion | Apache-2.0 | `.pth` | GitHub oficial |

La ventaja de este repositorio frente a los originales es la conversion a ONNX y la doble variante de precision, que elimina el trabajo de exportacion; la desventaja es que no anade mejoras de calidad ni documenta metricas propias.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- El autor no publica metricas de calidad ni tiempos de inferencia; la unica cifra es la mejora relativa de la ruta fp16.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La licencia es mixta y el campo `license` del repositorio es `other`; para uso comercial hay que verificar por separado BSD-3-Clause (Real-ESRGAN) y Apache-2.0 (GFPGAN, DDColor) en cada fichero.
- Los modelos de superresolucion y restauracion facial pueden generar detalles plausibles pero inexistentes (artefactos de alucinacion visual), especialmente en rostros; no son adecuados como prueba forense.
- GFPGAN puede producir rostros con aspecto artificial o "embellecido" que alteran la identidad original.
- No se documentan sesgos demograficos de los modelos subyacentes; los datasets de entrenamiento originales pueden sobrerrepresentar ciertos tipos de rostro.
- La ruta fp16 depende de ARMv8.2+; en dispositivos mas antiguos hay que usar los ficheros planos.
- No hay garantia de compatibilidad con versiones futuras de ONNX Runtime ni de la app que los consume.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yasir390/image-upscaller-models
- Real-ESRGAN (codigo y pesos originales): https://github.com/xinntao/Real-ESRGAN
- GFPGAN (Tencent ARC): https://github.com/TencentARC/GFPGAN
- DDColor: https://github.com/piddnad/DDColor
- FaceFusion (exportacion ONNX de GFPGAN mencionada por el autor): https://github.com/facefusion/facefusion
- ONNX Runtime: https://onnxruntime.ai/
