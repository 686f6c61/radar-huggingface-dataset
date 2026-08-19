# UmeAiRT/ComfyUI-Auto-Installer-Assets

## Resumen

Este repositorio no es un modelo de IA en sí, sino un almacén de assets preempaquetados para el ecosistema UmeAiRT, orientado a ComfyUI. Contiene cientos de archivos binarios de gran tamaño —modelos de difusión, text encoders, LoRAs, VAEs, ControlNets, checkpoints completos y binarios auxiliares— servidos mediante Git LFS y consumidos por herramientas como ComfyUI-Auto_installer y ComfyUI-UmeAiRT-Toolkit. Su propósito es centralizar la distribución de modelos populares (FLUX, WAN, QWEN, HiDream, LTX, Z-Image, etc.) en múltiples precisiones (bf16, fp16, fp8, GGUF Q8–Q3) para simplificar la instalación automatizada en entornos Windows.

La relevancia actual radica en que facilita el despliegue local de generación de imagen y vídeo con ComfyUI sin necesidad de descargar cada modelo manualmente desde fuentes dispersas. El repositorio tiene más de 87.000 descargas y 168 likes, lo que indica un uso activo. Su licencia MIT permite redistribución y uso comercial sin restricciones, aunque el tamaño total del repositorio (4,2 TB) hace que su descarga completa sea impracticable para la mayoría de usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de assets, no un modelo único) |
| Parametros totales | 2.091.068.928 (suma de parámetros de los safetensors incluidos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | fp16, bf16, fp8, fp8_scaled, SVDQ-int4, UD-Q4, IQ4_XS, GGUF Q8–Q3 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, además de binarios y wheels |

## Arquitectura y entrenamiento

Al no ser un modelo, no existe una arquitectura propia ni un proceso de entrenamiento asociado. El repositorio agrupa modelos de terceros con arquitecturas diversas: difusión (FLUX, WAN, QWEN, HiDream, LTX, Z-Image), text encoders (T5, UMT5, Gemma, Qwen, Llama), CLIP, VAEs, ControlNets y LoRAs. Cada modelo mantiene su arquitectura original y sus pesos preentrenados; este repositorio solo los empaqueta y los sirve en distintos formatos de cuantización para adaptarse a diferentes presupuestos de VRAM. No se ha realizado ningún entrenamiento adicional ni ajuste fino sobre estos pesos.

## Capacidades

- Distribución centralizada de modelos de generación de imagen y vídeo para ComfyUI.
- Incluye modelos de difusión para texto a imagen (FLUX Dev, Schnell, Z-Image), edición (FLUX Fill, QWEN Image-Edit), control (Canny, Depth, ControlNet), y vídeo (WAN 2.1/2.2 T2V e I2V, LTX-2).
- Proporciona text encoders como T5 XXL, UMT5 XXL, Gemma-3 12B, Qwen2.5-VL-7B y Llama 3.1 8B en múltiples precisiones.
- Ofrece modelos auxiliares: CLIP, CLIP Vision, VAE, LoRAs, upscalers (RealESRGAN), segmentación (SAM), detección (YOLO) y generación de prompts (Florence-2).
- Incluye binarios y paquetes para instalación automatizada: Git, Python, CUDA installers, wheels precompilados y extensiones de ComfyUI.
- Convenciones de nomenclatura claras para distinguir formatos GGUF y safetensors.

## Casos de uso

- Instalación automatizada de ComfyUI en Windows: el script ComfyUI-Auto_installer descarga desde este repositorio todos los modelos y dependencias necesarios, reduciendo el proceso de configuración manual a un solo paso.
- Despliegue local de generación de imágenes con FLUX Dev o Z-Image: los pesos en fp8 o GGUF Q4 permiten ejecutar modelos de 12B en GPUs de consumo con 8–12 GB de VRAM.
- Generación de vídeo con WAN 2.1/2.2: los checkpoints T2V e I2V en distintas cuantizaciones permiten adaptar la calidad y el consumo de memoria según el hardware disponible.
- Edición de imágenes con FLUX Fill o QWEN Image-Edit: los modelos de edición vienen preempaquetados, listos para cargar en nodos de ComfyUI sin búsqueda adicional de pesos.
- Uso de text encoders avanzados como Gemma-3 o Qwen2.5-VL para mejorar la adherencia al prompt en flujos de trabajo de difusión.
- Entornos de producción que requieren reproducibilidad: al fijar versiones concretas de modelos y cuantizaciones, se puede replicar un pipeline de generación sin depender de descargas externas cambiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no presenta métricas propias; los modelos que contiene tienen sus propios benchmarks publicados por sus autores originales, pero no se incluyen en esta ficha.

## Requisitos de hardware

- Los requisitos varían según el modelo y la cuantización elegida. Para modelos de 12B–14B en fp16 se necesitan al menos 24 GB de VRAM; en fp8 se reduce a ~16 GB; en GGUF Q4 a ~8–10 GB.
- Los modelos de vídeo como WAN 2.1 (14B) requieren GPUs con 16 GB o más para resoluciones 720p; las cuantizaciones GGUF permiten ejecutarlos en GPUs de 12 GB con calidad reducida.
- GPUs recomendadas: RTX 4090 (24 GB) para la mayoría de modelos en fp8; A100 o H100 para cargas profesionales con fp16/bf16.
- El repositorio incluye binarios de CUDA y wheels precompilados, lo que facilita el despliegue en entornos Windows con GPU NVIDIA.
- Opciones de despliegue: ComfyUI como interfaz principal; los pesos en GGUF también son compatibles con llama.cpp y otros runners que soporten ese formato, aunque el flujo principal está diseñado para ComfyUI.
- La latencia y el throughput dependen del modelo concreto; no se proporcionan datos específicos en el repositorio.

## Comparativa con modelos similares

No existe una comparativa directa posible, ya que este repositorio no es un modelo sino un agregador de assets. Como alternativa, se pueden considerar otros repositorios de distribución de modelos para ComfyUI, como:

| Repositorio | Contenido | Licencia | Tamaño | Mantenimiento |
|---|---|---|---|---|
| UmeAiRT/ComfyUI-Auto-Installer-Assets | Modelos de difusión, text encoders, binarios | MIT | 4,2 TB | Activo |
| Comfy-Org/ComfyUI_Official_Models | Modelos oficiales de ComfyUI | Varía | No disponible | Activo |
| city96/ComfyUI-GGUF | Convertidores GGUF para modelos de difusión | MIT | No aplica (código) | Activo |

La principal diferencia es que UmeAiRT ofrece un paquete integral con binarios y wheels, mientras que los otros se centran en pesos o herramientas de conversión.

## Limitaciones y advertencias

- El repositorio es extremadamente grande (4,2 TB); descargarlo completo es inviable para la mayoría de usuarios. Se recomienda descargar solo los archivos necesarios mediante Git LFS selectivo o el instalador automatizado.
- No es un modelo original: los pesos pertenecen a sus respectivos autores y pueden tener licencias adicionales más restrictivas que la MIT del repositorio. Es responsabilidad del usuario verificar la licencia de cada modelo individual antes de uso comercial.
- Al ser un asset store, no ofrece garantías de calidad o soporte técnico para los modelos incluidos.
- Los binarios incluidos (Python, CUDA, Git) son específicos para Windows; no hay soporte oficial para Linux o macOS.
- El repositorio se actualiza con frecuencia (última actualización en agosto de 2026), lo que puede provocar cambios en las rutas o versiones de los archivos que afecten a flujos de trabajo existentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UmeAiRT/ComfyUI-Auto-Installer-Assets
- Réplica en ModelScope: https://www.modelscope.ai/datasets/UmeAiRT/ComfyUI-Auto-Installer-Assets
- Proyecto ComfyUI-Auto_installer: https://gitlab.com/UmeAiRT-Studio/ComfyUI-Auto_installer-Python
- Proyecto ComfyUI-UmeAiRT-Toolkit: https://gitlab.com/UmeAiRT-Studio/ComfyUI-UmeAiRT-Toolkit
