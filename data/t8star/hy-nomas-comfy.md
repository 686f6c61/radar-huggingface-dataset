# t8star/HY-Nomas-Comfy

## Resumen

HY-Nomas-Comfy es un paquete de pesos preconfigurados para ComfyUI del modelo de generación de vídeo Hy-Nomas de Tencent, empaquetado por el usuario t8star. No se trata de un modelo nuevo, sino de una reorganización de los pesos originales en tres ficheros cuantizados (INT8 para el DiT, FP8 para el VAE PixelUMM y FP8 para el codificador de texto Qwen 2.5 VL 7B) pensados para ejecutarse en GPUs de 24 GB de VRAM. El autor declara explícitamente que no altera los bytes de los pesos originales, solo los nombres y la disposición de descarga.

El modelo subyacente, tencent/Hy-Nomas, es un modelo de mundo (world model) orientado a generación de vídeo texto-a-vídeo e imagen-a-vídeo con control de cámara, según las etiquetas del repositorio. La ficha disponible no detalla la arquitectura interna del DiT original (número de parámetros, longitud de contexto, composición del dataset), por lo que esos datos se marcan como no disponibles.

Su relevancia práctica es acotada: sirve para quienes quieran probar Hy-Nomas en ComfyUI con hardware de consumo (RTX 5090 Laptop 24 GB en las pruebas del autor) sin descargar los pesos completos en FP32 o los checkpoints de entrenamiento. El paquete mezcla licencias: el DiT es Apache-2.0, pero el VAE PixelUMM está bajo NVIDIA One-Way Noncommercial License, lo que restringe el conjunto a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (DiT para generación de vídeo, según empaquetado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (DiT), FP8 (VAE PixelUMM), FP8 scaled (codificador de texto Qwen 2.5 VL 7B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-nvidia-one-way-noncommercial (mixta: DiT Apache-2.0, PixelUMM NVIDIA One-Way Noncommercial, Qwen Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base tencent/Hy-Nomas más allá de las etiquetas del autor, que lo describen como world model con generación de vídeo, image-to-video y control de cámara. El empaquetado separa tres componentes: un DiT destilado en INT8 (`hy_nomas_distil_int8.safetensors`, 9,06 GB), un VAE denominado PixelUMM en FP8 (`hy_nomas_pixelumm_fp8.safetensors`, 9,13 GB) descrito como una adaptación de Tencent sobre el PixelUMM de NVIDIA, y un codificador de texto Qwen 2.5 VL 7B en FP8 scaled (`qwen_2.5_vl_7b_fp8_scaled.safetensors`, 9,38 GB). El total del paquete es de aproximadamente 27,58 GB.

No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original. El único detalle operativo relevante es que el DiT está destilado para inferencia en 8 pasos con CFG 1 y sampler euler/simple, según la configuración de las pruebas del autor.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con resolución de ejemplo 1280×704 a 24 fps.
- Generación de vídeo a partir de imagen inicial (image-to-video), con un ejemplo publicado en `samples/image-start.mp4`.
- Control de cámara, según las etiquetas del repositorio.
- Generación por segmentos: el autor reporta un flujo nativo de dos segmentos de 10 segundos (240 fotogramas) y un montaje de 15 escenas de 6 segundos cada una.
- Codificación de texto multilingüe potencial a través de Qwen 2.5 VL 7B, aunque no se especifican los idiomas efectivamente soportados en la generación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo de generación de vídeo, no un LLM conversacional.

## Casos de uso

- Prototipado rápido de vídeo generativo en ComfyUI: el paquete está pensado para cargarse directamente en los directorios de ComfyUI y ejecutarse con el nodo nativo de Hy-Nomas T8, lo que permite iterar sobre prompts y semillas sin gestionar pesos FP32.
- Pruebas de concepto de control de cámara: útil para evaluar cómo responde el modelo a instrucciones de movimiento de cámara en planos cortos, antes de comprometerse con un despliegue mayor.
- Generación de clips de 6 a 10 segundos para storyboards o previsionados: el flujo de dos segmentos de 10 segundos y el montaje de 15 escenas de 6 segundos documentados por el autor encajan con este uso.
- Evaluación académica de modelos de mundo: al ser un empaquetado de pesos originales sin modificar, sirve para reproducir resultados de Hy-Nomas en entornos de investigación con GPUs de 24 GB.
- Integración en pipelines de ComfyUI existentes: el codificador de texto se carga con tipo CLIP `qwen_image`, lo que facilita sustituir componentes en flujos ya montados.
- Demostraciones y material divulgativo: los ejemplos publicados (89 segundos de metraje, clip nativo de 10 segundos, ejemplo con imagen inicial) sirven como referencia de calidad esperada antes de invertir en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de ejecución en una RTX 5090 Laptop de 24 GB con 64 GB de RAM: pico de 16,28 GiB de VRAM y mínimo de 9,03 GiB de RAM disponible en el montaje de 15 escenas, y pico de 17,53 GiB de VRAM con mínimo de 8,15 GiB de RAM en el flujo nativo de dos segmentos de 10 segundos (240 fotogramas). La configuración de inferencia es de 8 pasos, CFG 1, sampler euler/simple.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa unos 27,58 GB en disco, pero la inferencia medida por el autor se mantiene por debajo de 18 GiB de VRAM en los flujos probados.
- GPU recomendadas: RTX 5090 Laptop 24 GB es la única configuración con mediciones publicadas; por tamaño de pesos, se espera que quepa en GPUs de 24 GB en adelante, aunque no hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en GPUs de 24 GB según las pruebas del autor; no hay datos para tarjetas de 16 GB o menos.
- Despliegue: exclusivamente mediante ComfyUI y el nodo Comfyui-HY-Nomas-T8 del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica tiempos por fotograma ni por clip.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de generación de vídeo con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia mixta y restrictiva: el VAE PixelUMM está bajo NVIDIA One-Way Noncommercial License, lo que limita el conjunto a investigación y evaluación no comercial aunque el DiT sea Apache-2.0. La redistribución exige conservar LICENSE, el texto completo de las licencias y NOTICE.
- El repositorio no documenta la arquitectura, el número de parámetros, el contexto ni los idiomas del modelo base, lo que dificulta evaluar su idoneidad para producción.
- No hay benchmarks publicados; las únicas métricas son de consumo de memoria en una configuración concreta.
- Dependencia de un nodo de terceros (Comfyui-HY-Nomas-T8) y de un empaquetado no oficial; la integridad debe verificarse con `SHA256SUMS.txt` y `models.manifest.json`.
- Riesgo de alucinación visual y de artefactos propios de los modelos de vídeo generativo; no se documentan sesgos conocidos.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El autor declara que no modifica los pesos originales ni reclama autoría del modelo; cualquier uso en producción debe revisarse contra las licencias upstream de Tencent, NVIDIA y Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t8star/HY-Nomas-Comfy
- Modelo base: https://huggingface.co/tencent/Hy-Nomas
- Nodo ComfyUI del autor: https://github.com/T8mars/Comfyui-HY-Nomas-T8
- Port ComfyUI de referencia: https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas
- Codificador de texto Qwen: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Perfil del autor en HuggingFace: https://huggingface.co/t8star
- Bilibili del autor: https://space.bilibili.com/385085361
- YouTube del autor: https://www.youtube.com/@T8star-Aix/
