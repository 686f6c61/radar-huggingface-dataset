# sshamanov/ltx-video-distilled-fp8-bench

## Resumen

El modelo `sshamanov/ltx-video-distilled-fp8-bench` es una copia privada de referencia utilizada para medir tiempos de inferencia y consumo de VRAM del modelo LTX-Video destilado de Lightricks, cuantizado en FP8. Según la model card, emplea el checkpoint oficial `ltxv-13b-0.9.8-distilled-fp8.safetensors` (13 mil millones de parámetros) y la configuración FP8 correspondiente, aplicando los kernels optimizados `LTX-Video-Q8-Kernels` durante la ejecución. Esta copia no es un modelo independiente, sino una herramienta de evaluación para comparar el rendimiento de la versión FP8 frente a la versión BF16 del mismo modelo base.

El modelo subyacente, LTX-Video, es un generador de vídeo basado en arquitectura DiT (Diffusion Transformer) desarrollado por Lightricks, capaz de producir vídeo con audio sincronizado hasta 50 FPS y resolución nativa 4K. La versión destilada está optimizada para inferencia más rápida manteniendo una calidad similar a la versión completa. La cuantización FP8 reduce el uso de memoria y acelera la inferencia en hardware compatible (GPUs con soporte FP8 como H100 o Ada Lovelace), lo que lo hace relevante para despliegues en producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) |
| Parametros totales | 13 mil millones (según nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica directamente a generación de vídeo) |
| Tipos de cuantizacion | FP8 (checkpoint oficial `ltxv-13b-0.9.8-distilled-fp8.safetensors`) |
| Idiomas soportados | no disponible (el modelo base soporta prompts en inglés principalmente, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según nombre del archivo) |

## Arquitectura y entrenamiento

La arquitectura del modelo base LTX-Video es un Diffusion Transformer (DiT) que procesa tanto vídeo como audio en una única pasada. El modelo destilado reduce los pasos de inferencia necesarios mediante destilación de conocimiento, manteniendo la estructura del transformer original. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) no están disponibles en la información proporcionada. La versión FP8 aplica cuantización de 8 bits en coma flotante a los pesos del transformer, lo que reduce el tamaño del modelo y acelera la inferencia en hardware compatible, sin modificar la arquitectura subyacente.

## Capacidades

- Generación de vídeo de alta fidelidad con audio sincronizado (según el repositorio oficial de LTX-Video).
- Múltiples modos de rendimiento (velocidad vs. calidad) gracias a la destilación.
- Soporte para entrada de imagen (image-to-video) según la documentación del paquete `ltx-video`.
- Capacidad de generar vídeo de hasta 50 FPS y resolución 4K nativa (según el repositorio oficial).
- La versión FP8 está diseñada para reducir la huella de memoria y mejorar la latencia en GPUs con soporte FP8.

## Casos de uso

- Evaluación de rendimiento de modelos de vídeo: esta copia sirve para medir tiempos de inferencia y VRAM en diferentes GPUs, permitiendo comparar la versión FP8 con la BF16.
- Despliegue en producción con GPUs de gama media: la cuantización FP8 permite ejecutar el modelo en tarjetas con menos VRAM (por ejemplo, RTX 4090 con 24 GB) manteniendo una calidad aceptable.
- Generación de vídeo para prototipos y demos: al ser una versión destilada, es adecuada para entornos donde la velocidad de inferencia es crítica, como aplicaciones interactivas.
- Investigación en eficiencia de modelos de difusión: el benchmark proporciona datos sobre el impacto de la cuantización FP8 en la latencia y el consumo de memoria.
- Integración en pipelines de postproducción: la capacidad de generar vídeo con audio sincronizado permite su uso en herramientas de edición automatizada.
- Comparación de kernels optimizados: los kernels `LTX-Video-Q8-Kernels` permiten evaluar el rendimiento de implementaciones específicas para CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Esta copia está diseñada para generar dichos datos, pero no incluye métricas precalculadas. Se recomienda ejecutar el benchmark en el hardware objetivo para obtener mediciones de latencia y VRAM.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 13B parámetros en FP8, el tamaño del checkpoint es aproximadamente 13 GB (13e9 × 1 byte). Con overhead de activaciones y buffers, se estima un requisito mínimo de 16-20 GB para inferencia, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: tarjetas con soporte FP8 como NVIDIA H100, L40S, RTX 4090 (Ada Lovelace) o RTX 6000 Ada. Se requiere CUDA 12.2 o superior según la documentación del paquete `ltx-video`.
- Compatibilidad con GPU de consumo: la RTX 4090 (24 GB VRAM) podría ejecutar el modelo, pero no está confirmado. Para GPUs con menos VRAM, se necesitaría cuantización adicional o técnicas de offloading.
- Opciones de despliegue: el paquete `ltx-video` en PyPI ofrece inferencia local con Python 3.10.5. También hay demos en Hugging Face Spaces (como el espacio de Lightricks) y servicios en la nube (Fal.ai, Replicate).
- Latencia y throughput: no disponibles. La finalidad de este benchmark es medirlos.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video 0.9.7 distilled (Lightricks) | 13B | BF16 | N/A (vídeo) | Apache 2.0 (según repositorio) | Hugging Face |
| LTX-Video 0.9.8 distilled FP8 (este modelo) | 13B | FP8 | N/A | no disponible | Copia privada |
| Stable Video Diffusion (Stability AI) | ~1.4B | FP16 | N/A | STABILITY AI COMMUNITY LICENSE | Hugging Face |
| Mochi 1 (Genmo) | ~10B | BF16 | N/A | Apache 2.0 | Hugging Face |

Nota: los datos de la tabla para LTX-Video 0.9.7 distilled se basan en información pública del repositorio oficial; los de este modelo provienen de la model card. La comparativa es orientativa, ya que no se dispone de benchmarks comunes entre estos modelos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma específicas de esta versión.
- La licencia no está especificada en la model card, por lo que no se garantiza su uso comercial. Se debe consultar la licencia del modelo base LTX-Video para determinar restricciones.
- Esta copia es privada y no está destinada a uso público; su propósito es benchmarking interno.
- La cuantización FP8 puede degradar ligeramente la calidad del vídeo generado en comparación con BF16, aunque no se han publicado métricas comparativas.
- El modelo requiere hardware con soporte FP8 para aprovechar la cuantización; en GPUs sin soporte nativo, el rendimiento puede ser inferior al esperado.
- La generación de vídeo es computacionalmente intensiva; los tiempos de inferencia pueden ser largos incluso en GPUs de alta gama.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sshamanov/ltx-video-distilled-fp8-bench)
- [Repositorio oficial de LTX-Video (Lightricks)](https://github.com/Lightricks/LTX-Video)
- [LTX-Video 0.9.7 distilled en Hugging Face](https://huggingface.co/Lightricks/LTX-Video-0.9.7-distilled)
- [LTX-Video (modelo base) en Hugging Face](https://huggingface.co/Lightricks/LTX-Video)
- [Paquete PyPI ltx-video](https://pypi.org/project/ltx-video/)
