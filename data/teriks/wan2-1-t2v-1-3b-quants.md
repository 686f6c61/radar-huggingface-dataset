# Teriks/Wan2.1-T2V-1.3B-quants

## Resumen

Teriks/Wan2.1-T2V-1.3B-quants es un conjunto de cuantizaciones del transformer del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B, desarrollado originalmente por Wan-AI (Alibaba). Este repositorio no contiene un modelo nuevo, sino versiones comprimidas del componente `transformer` (WanTransformer3DModel) del pipeline `WanPipeline`, generadas con la herramienta dgenerate 6.0.0 de Teriks. El objetivo es permitir la ejecución del modelo en hardware con VRAM limitada, manteniendo el resto de componentes (VAE, text encoder, scheduler) del repositorio original.

El modelo base cuenta con 1.418.996.800 parámetros en el transformer y genera vídeo a partir de descripciones textuales. Las cuantizaciones aquí publicadas reducen el peso del transformer desde aproximadamente 2,8 GB en precisión nativa hasta 448,9 MB en el formato más agresivo (Q2_K), lo que abre la puerta a su uso en GPUs de consumo. Se ofrecen 12 formatos GGUF (desde Q2_K hasta IQ4_XS) y dos formatos safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise).

La relevancia de este repositorio es práctica: facilita el despliegue de un modelo de vídeo de 1.3B en entornos ComfyUI y en pipelines basados en GGUF, sin necesidad de reentrenar ni modificar la configuración del modelo original. Es un recurso de infraestructura más que un modelo con capacidades propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer 3D (WanTransformer3DModel) para difusión texto-a-vídeo |
| Parámetros totales | 1.418.996.800 (transformer) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | No disponible |
| Licencia | No disponible (se indica que aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF y safetensors (ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza el transformer de Wan2.1-T2V-1.3B, un modelo de difusión para generación de vídeo a partir de texto. El componente cuantizado es `WanTransformer3DModel`, que opera sobre latentes espacio-temporales dentro del pipeline `WanPipeline`. Los pesos se han generado con dgenerate 6.0.0, que produce archivos GGUF con nomenclatura de tensores estilo ComfyUI (`--comfy`) y safetensors cuantizados en float8_e4m3fn e int8_tensorwise.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni innovaciones técnicas del modelo base en la información proporcionada. El proceso de cuantización en sí no altera la arquitectura, solo la precisión numérica de los pesos del transformer. Los archivos GGUF están pensados para cargarse con ComfyUI-GGUF o con dgenerate, usando el repositorio original como fuente de configuración y el archivo cuantizado como reemplazo del componente `transformer`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el pipeline WanPipeline.
- Producción de clips de vídeo con coherencia temporal, al operar sobre latentes 3D.
- Integración con ComfyUI mediante los archivos safetensors cuantizados (float8_e4m3fn, int8_tensorwise).
- Carga en flujos GGUF a través de ComfyUI-GGUF o dgenerate.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de vídeo en GPUs de consumo: con los formatos Q4_K (765,8 MB) o IQ4_XS (723,5 MB) el transformer cabe en GPUs de 8-12 GB de VRAM, permitiendo crear clips texto-a-vídeo en equipos domésticos.
- Prototipado rápido en ComfyUI: los safetensors float8_e4m3fn e int8_tensorwise (1,3 GB cada uno) se cargan directamente en ComfyUI para iterar sobre prompts y estilos sin necesidad de infraestructura de datacenter.
- Despliegue en entornos con VRAM muy limitada: el formato Q2_K (448,9 MB) permite ejecutar el pipeline en GPUs de 4-6 GB, a costa de calidad, útil para demos o pruebas de concepto.
- Investigación sobre cuantización de modelos de difusión de vídeo: el repositorio ofrece 12 variantes GGUF del mismo transformer, lo que permite comparar el impacto de cada nivel de cuantización en la calidad del vídeo generado.
- Integración en pipelines automatizados de generación de contenido: usando dgenerate como CLI, se puede encadenar la generación de vídeo con otros pasos (postprocesado, subtitulado) en scripts de producción.
- Evaluación de calidad vs. tamaño: investigadores pueden medir la degradación perceptual entre Q8_0 (1,4 GB) y Q2_K (448,9 MB) sobre el mismo modelo base para establecer umbrales de cuantización aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: entre 0,45 GB (Q2_K) y 1,4 GB (Q8_0) solo para los pesos; el pipeline completo requiere además VAE, text encoder y buffers de activación, por lo que la VRAM total es considerablemente mayor (no disponible en la información proporcionada).
- GPU recomendadas: no disponibles de forma específica; por el tamaño del transformer cuantizado, GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) son candidatas razonables para los formatos más pequeños, pero no se confirma en la documentación.
- Cabe en GPU consumer: sí para los formatos GGUF de menor tamaño, siempre que el resto del pipeline quepa en VRAM.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF, dgenerate 6.0.0 o superior, y cualquier runtime compatible con GGUF que soporte el mapeo de tensores ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Teriks/Wan2.1-T2V-1.3B-quants | 1.418.996.800 | No disponible | No disponible (hereda del base) | Hugging Face, GGUF y safetensors |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | 1.418.996.800 | No disponible | No disponible | Hugging Face, safetensors |
| Otras cuantizaciones de Wan2.1-T2V-1.3B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad en la generación de vídeo; los formatos Q2_K y Q3_K son los más agresivos y pueden degradar notablemente la coherencia temporal y el detalle.
- El repositorio solo contiene el transformer cuantizado; es imprescindible descargar el resto de componentes del modelo base Wan-AI/Wan2.1-T2V-1.3B-Diffusers para que el pipeline funcione.
- Los archivos GGUF usan nomenclatura de tensores ComfyUI; un componente sin key map para esa arquitectura provoca error de carga.
- La licencia no está especificada en el repositorio; se indica que aplica la licencia del modelo fuente, por lo que debe consultarse la del modelo base antes de cualquier uso comercial.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos en la documentación disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan requisitos de VRAM del pipeline completo, latencias ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Wan2.1-T2V-1.3B-quants
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
- ComfyUI-GGUF (referenciado en la model card, sin enlace directo en la información): no disponible
