# ussoewwin/SeedVR2-VAE-TenorRT-Engine-for-Blackwell

## Resumen

SeedVR2 es un modelo de restauración y superresolución de vídeo basado en difusión, desarrollado por ByteDance Seed. Su componente VAE de vídeo (`seedvr2_ema_vae_fp16`) gestiona el codificado y decodificado de latentes espacio-temporales, y constituye el principal cuello de botella computacional y de memoria en los flujos de trabajo de upscaling y restauración de vídeo. Este repositorio proporciona motores TensorRT precompilados (`.rtxplan`) de ese VAE, optimizados específicamente para la arquitectura NVIDIA Blackwell (sm_100/sm_120), es decir, las GPUs RTX 5090, 5080, 5070, 5060 y 5050.

La relevancia de este paquete radica en que elimina la necesidad de compilar manualmente los motores TensorRT, un proceso que requiere tiempo y conocimientos específicos. Los planes de motor incluidos están optimizados para inferencia espaciotemporal por teselas (tiles) de 256x256 píxeles, con perfiles dedicados para distintos tamaños de lote temporal tanto en el codificador (53 a 105 fotogramas) como en el decodificador (21 a 61 fotogramas). El repositorio tiene un tamaño de 9,2 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE espacio-temporal de SeedVR2 (ByteDance), compilado a TensorRT |
| Parametros totales | No disponible (estimable en ~0,5B a partir del tamaño de los pesos fp16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | No aplica (motores TensorRT en FP16) |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rtxplan` (TensorRT engine plan) |

## Arquitectura y entrenamiento

El modelo base es el VAE de SeedVR2, un componente de un modelo de difusión de un solo paso para restauración de vídeo (VR) desarrollado por ByteDance Seed. SeedVR2 realiza entrenamiento adversarial contra datos reales, lo que le permite restaurar y ampliar vídeos con alta fidelidad. El VAE codifica secuencias de fotogramas RGB en latentes espacio-temporales y los decodifica de vuelta a píxeles, operando sobre ventanas temporales completas.

Este repositorio no contiene los pesos del VAE original, sino motores TensorRT precompilados a partir del checkpoint `seedvr2_ema_vae_fp16` de Comfy-Org. Los motores están configurados para teselado espacial determinista de 256x256 píxeles, lo que maximiza el uso de la caché L2, minimiza los picos de VRAM y evita errores de memoria insuficiente al procesar vídeo 4K u 8K. Se proporcionan perfiles separados para el codificador (lotes de 53 a 105 fotogramas) y el decodificador (lotes de 21 a 61 fotogramas), lo que permite ajustar el consumo de memoria según la duración del clip.

## Capacidades

- Codificado de secuencias de vídeo RGB a latentes espacio-temporales de SeedVR2 mediante TensorRT en GPUs Blackwell.
- Decodificado de latentes espacio-temporales a secuencias de fotogramas RGB.
- Restauración y superresolución de vídeo de alta resolución (hasta 4K/8K) mediante teselado espacial de 256x256.
- Procesamiento por lotes temporales configurables: 21-61 fotogramas en decodificación y 53-105 en codificación.
- Integración con ComfyUI a través de los nodos oficiales de SeedVR2.
- Inferencia de baja latencia y alto rendimiento gracias a la compilación TensorRT específica para Blackwell.

## Casos de uso

- Restauración de vídeos antiguos o degradados: el VAE puede codificar y decodificar secuencias completas de vídeo de baja calidad, preparándolas para su posterior restauración por el modelo de difusión SeedVR2.
- Upscaling de vídeo a 4K/8K en producción: los motores precompilados permiten procesar vídeos de alta resolución sin agotar la VRAM, gracias al teselado espacial de 256x256 y a los perfiles temporales configurables.
- Postproducción de vídeo en estudios: integración en pipelines de ComfyUI para mejorar la calidad de material filmado con cámaras de baja resolución o compresión elevada.
- Archivado y preservación digital: restauración de material de archivo histórico para su conservación en alta resolución.
- Generación de vídeo a partir de vídeo (video-to-video): el VAE actúa como paso intermedio en flujos de trabajo que transforman un vídeo de entrada en otro con mayor resolución o calidad.
- Desarrollo de herramientas de edición de vídeo con IA: los motores pueden integrarse en aplicaciones propias mediante TensorRT para ofrecer funcionalidades de mejora de calidad en tiempo real o casi tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como latencia, throughput o comparativas con otros motores. Se desconocen los datos de VRAM consumida por cada perfil de motor.

## Requisitos de hardware

- GPU NVIDIA Blackwell obligatoria: RTX 5090, RTX 5080, RTX 5070, RTX 5060 o RTX 5050 (Compute Capability sm_100/sm_120). También compatible con GPUs de estación de trabajo y centro de datos basadas en Blackwell.
- VRAM estimada: no disponible. Los motores están diseñados para minimizar los picos de VRAM mediante teselado espacial, pero no se especifican cifras concretas por perfil.
- El teselado de 256x256 y los lotes temporales configurables permiten ajustar el consumo de memoria a la GPU disponible.
- Despliegue: los `.rtxplan` se cargan directamente en TensorRT, y son compatibles con ComfyUI mediante los nodos de SeedVR2.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se han encontrado repositorios equivalentes que ofrezcan motores TensorRT precompilados del VAE de SeedVR2 para Blackwell. Las alternativas serían:

| Modelo | Formato | Arquitectura objetivo | Ventaja | Desventaja |
|---|---|---|---|---|
| Este repositorio | `.rtxplan` precompilado | Blackwell (sm_100/sm_120) | Sin compilación necesaria, perfiles optimizados | Solo Blackwell |
| Comfy-Org/SeedVR2 | Pesos originales (fp16) | Cualquier GPU con soporte | Portabilidad | Requiere compilar TensorRT manualmente |
| ByteDance-Seed/SeedVR | Pesos originales | Cualquier GPU | Código fuente completo | Requiere configuración y compilación |

## Limitaciones y advertencias

- Exclusivo para GPUs NVIDIA Blackwell: los motores no funcionarán en arquitecturas anteriores (Ampere, Ada Lovelace, etc.).
- Los motores están compilados para un tamaño de tesela fijo de 256x256; no se ofrecen perfiles alternativos.
- El repositorio no incluye documentación sobre el consumo de VRAM por perfil ni métricas de rendimiento.
- No se proporciona el código fuente de los motores ni los scripts de compilación, solo los planes precompilados.
- La licencia Apache-2.0 aplica a los motores, pero el modelo SeedVR2 subyacente puede tener términos adicionales; se recomienda revisar la licencia del checkpoint original.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- No hay información sobre el proceso de validación de los motores ni sobre su equivalencia exacta con el VAE original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ussoewwin/SeedVR2-VAE-TenorRT-Engine-for-Blackwell
- Checkpoint base (Comfy-Org): https://huggingface.co/Comfy-Org/SeedVR2
- Repositorio oficial de SeedVR (ByteDance): https://github.com/ByteDance-Seed/SeedVR
- Nodos de ComfyUI para SeedVR2: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- Tutorial de ComfyUI para SeedVR2: https://docs.comfy.org/tutorials/utility/seedvr2
