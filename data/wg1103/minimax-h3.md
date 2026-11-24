# wg1103/MiniMax-H3

## Resumen

MiniMax H3 es un modelo de difusión para generación de vídeo (con audio asociado) desarrollado originalmente por MiniMaxAI. El repositorio analizado, `wg1103/MiniMax-H3`, no es el modelo original, sino un reempaquetado de pesos en formato de archivo único (single-file) preparado específicamente para su uso en ComfyUI. Incluye variantes de los pesos de difusión, el codificador de texto, los VAE (vídeo y audio), LoRAs de aceleración (Turbo) y ControlNet, además de una colección de embeddings de efectos visuales.

El modelo cubre tres flujos principales de generación: texto a vídeo (t2v), imagen a vídeo (i2v, con variantes `fl2va`) y referencia a vídeo (r2v, con variantes `ref2va`). El sufijo `a` en `fl2va` y `ref2va` indica que las variantes generan también audio. El codificador de texto empleado es una variante de Qwen3-VL de 32B parámetros adaptada para MiniMax H3, disponible en cuantizaciones bf16, int8_convrot y nvfp4_awq.

El repositorio es relevante para desarrolladores que quieran ejecutar MiniMax H3 en ComfyUI sin tener que convertir manualmente los pesos originales, ya que ofrece los archivos ya troceados por componente y en varias cuantizaciones, junto con LoRAs Turbo para reducir el número de pasos de muestreo (4 u 8 pasos) y workflows oficiales enlazados. El tamaño del repositorio es de 534,7 GB, lo que refleja la inclusión de múltiples variantes de pesos en paralelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (generación de vídeo y audio); codificador de texto basado en Qwen3-VL-32B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, w6a8 (pruned), nvfp4_awq (codificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión (tipo de backbone, número de parámetros, mecanismo de atención ni esquema de compresión latente). Lo que sí se puede afirmar a partir de los archivos es que el sistema se compone de varios módulos: un modelo de difusión principal con variantes `fl2va` y `ref2va` (y sus versiones `pruned`), un codificador de texto Qwen3-VL-32B adaptado, dos VAE separados (uno de vídeo y otro de audio) y un ControlNet Union (`fun_controlnet_union`) para control estructural. La presencia de un VAE de audio independiente confirma que el modelo genera pistas de audio junto con el vídeo en las variantes `*va`.

El repositorio no incluye información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Sí se documenta la existencia de LoRAs Turbo (`minimax_h3_fl2v_turbo_4step_v1.0`, `minimax_h3_fl2v_turbo_8step_v1.0`, `minimax_h3_ref2v_turbo_4step_v0.1`), que permiten reducir el muestreo a 4 u 8 pasos, y de LoRAs Pika H3 Flex (`pika_h3_flex_fl2va_v1`, `pika_h3_flex_ref2va_v1`). Las variantes `pruned` reducen el tamaño del checkpoint, presumiblemente mediante poda de canales o capas, aunque el criterio exacto de poda no se especifica.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el flujo `t2v`.
- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante las variantes `fl2va`.
- Generación de vídeo condicionada por referencias visuales (reference-to-video) mediante las variantes `ref2va`.
- Generación conjunta de vídeo y audio en las variantes con sufijo `a`.
- Control estructural mediante ControlNet Union (`fun_controlnet_union`), que permite condicionar la generación con mapas de control.
- Aceleración del muestreo mediante LoRAs Turbo a 4 y 8 pasos, y LoRAs Pika H3 Flex.
- Aplicación de estilos y efectos visuales predefinidos mediante embeddings textuales invocables en el nodo CLIPTextEncode (por ejemplo, `embedding:minimaxh3_art_is_explosion`).
- Codificación de prompts multimodales gracias al codificador Qwen3-VL-32B, que aporta comprensión de imagen y texto.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente, al tratarse de un modelo generativo de medios y no de un LLM conversacional.

## Casos de uso

- Producción de clips publicitarios: generar vídeo con audio a partir de un prompt descriptivo usando el flujo `t2v` o `fl2va`, con la LoRA Turbo de 4 pasos para iterar rápidamente sobre variaciones creativas antes de un render final de mayor calidad.
- Animación de imágenes fijas para redes sociales: usar el flujo `i2v` (`fl2va`) para convertir una fotografía o ilustración en un clip animado, aprovechando el codificador Qwen3-VL para interpretar instrucciones sobre el movimiento deseado.
- Storyboarding y previsualización: generar secuencias de referencia a partir de imágenes clave (`ref2va`) para validar la dirección de arte y el ritmo de una escena antes de producir el material definitivo.
- Efectos visuales estilizados: aplicar los embeddings incluidos (`minimaxh3_bullet_time`, `minimaxh3_fire_breath`, `minimaxh3_storm_magic`, entre otros) para incorporar efectos como tiempo bala, aliento de fuego o magia de tormenta sin entrenamiento adicional.
- Control de composición en pipelines de VFX: emplear el ControlNet Union para imponer la estructura de una escena (siluetas, profundidad u otros mapas de control) y mantener la coherencia entre tomas generadas.
- Generación de vídeo con audio sincronizado para prototipos de videojuegos o cinemáticas: las variantes `*va` producen imagen y sonido en una sola pasada, lo que simplifica la creación de material preliminar.
- Integración en flujos de trabajo de ComfyUI: los archivos están organizados por carpeta (`diffusion_models`, `text_encoders`, `vae`, `loras`, `model_patches`, `embeddings`), de modo que un equipo puede montar un pipeline reproducible y compartir la configuración mediante los workflows JSON enlazados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 534,7 GB e incluye simultáneamente variantes bf16, int8_convrot, fp8_scaled, w6a8 y nvfp4_awq; el requisito real depende de la variante cargada. Las versiones `pruned` y las cuantizadas (int8_convrot, fp8_scaled, w6a8) reducen la huella frente a bf16.
- El codificador de texto Qwen3-VL-32B en `nvfp4_awq` no requiere una GPU Blackwell según la model card, lo que amplía su compatibilidad.
- Para los modelos de difusión, la model card recomienda `int8_convrot` si se puede usar PyTorch con CUDA 13.0, y `fp8_scaled` solo como alternativa cuando `int8_convrot` no esté disponible.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) ni si el modelo cabe en GPU de consumo.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado (librería `diffusion-single-file`, archivos preparados para las carpetas de ComfyUI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. La existencia de LoRAs Turbo de 4 y 8 pasos sugiere que el muestreo completo requiere más pasos que esas cifras, pero no se indica el número exacto ni tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (este repositorio) | Difusión vídeo + audio | no disponible | no disponible | minimax-h3-community-license-agreement | Pesos en HF (reempaquetado para ComfyUI) |
| MiniMaxAI/MiniMax-H3 (original) | Difusión vídeo + audio | no disponible | no disponible | minimax-h3-community-license-agreement | Pesos en HF |
| lightx2v/Minimax-h3-Turbo | Difusión vídeo (acelerada) | no disponible | no disponible | no disponible | Pesos en HF |
| alibaba-pai/MiniMax-H3-Fun-Controlnet-Union | ControlNet para MiniMax H3 | no disponible | no disponible | no disponible | Pesos en HF |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia `minimax-h3-community-license-agreement` es distinta de las licencias open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de escala, atribución o redistribución.
- Este repositorio es un reempaquetado de terceros (`wg1103`), no la publicación oficial de MiniMaxAI; la integridad y la correspondencia exacta con los pesos originales deben verificarse contra el repositorio base.
- El repositorio no declara idiomas soportados; el rendimiento multilingüe de los prompts no está documentado.
- No se han publicado benchmarks ni evaluaciones de calidad en la información disponible, por lo que no hay evidencia cuantitativa sobre fidelidad, coherencia temporal o sincronización audio-vídeo.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusión: no se documentan mecanismos de mitigación ni tasas de fallo.
- El tamaño del repositorio (534,7 GB) exige planificación de almacenamiento y ancho de banda considerables; conviene descargar solo las variantes necesarias.
- Las variantes `pruned` y las cuantizaciones agresivas (w6a8, fp8_scaled) pueden degradar la calidad respecto a bf16; la model card solo ofrece una recomendación de orden de preferencia, sin métricas de degradación.
- La compatibilidad con CUDA 13.0 y PyTorch es un requisito para aprovechar `int8_convrot`; entornos con versiones anteriores quedan limitados a `fp8_scaled`.
- No se documentan sesgos conocidos del modelo base ni limitaciones específicas de contexto o resolución.

## Enlaces

- Repositorio analizado: https://huggingface.co/wg1103/MiniMax-H3
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Repositorio experimental: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Cuantización del codificador de texto: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow texto a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow imagen a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow referencia a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Workflow Pika H3 Flex referencia a vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_pika_h3_flex_ref2va.json
