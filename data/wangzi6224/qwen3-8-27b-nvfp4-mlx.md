# wangzi6224/Qwen3.8-27B-NVFP4-MLX

## Resumen

Qwen3.8-27B-NVFP4-MLX es una conversión al formato MLX del modelo Qwen3.8-27B, un transformer denso de aproximadamente 26.900 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante concreta la publica el usuario wangzi6224 y parte de la cuantización NVFP4 de Inferact (Inferact/Qwen3.8-27B-NVFP4), reempaquetada para que pueda cargarse eficientemente en hardware Apple Silicon mediante la librería MLX. El objetivo es ofrecer una versión de ~17 GB que quepa en la memoria unificada de equipos Mac con 24-32 GB y permita inferencia local a 4 bits.

El modelo conserva únicamente la torre lingüística: se han eliminado la torre de visión y la cabeza MTP (multi-token prediction) presentes en el modelo base. Las capas lineales cuantizadas en NVFP4 con agrupación de 16 elementos se han reordenado al esquema de almacenamiento de MLX sin modificar los bytes de peso ni los escalares de bloque (E4M3); además, `in_proj_qkv`, `in_proj_z` y `lm_head` —que en el origen estaban en BF16— se han cuantizado a NVFP4 con MLX 0.32.1. El resto de tensores (embeddings, normalizaciones) se mantienen en BF16.

Es relevante ahora porque demuestra el flujo de conversión de cuantizaciones NVFP4 (formato orientado a GPUs Blackwell de NVIDIA) hacia el ecosistema MLX de Apple, y porque la ficha técnica del modelo base Qwen3.8-27B no está documentada en la información disponible, de modo que muchos de sus datos (contexto, idiomas, benchmarks) deben tratarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`); sin torre de visión ni cabeza MTP en esta conversión |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits, agrupación de 16, escalas de bloque E4M3 + `global_scale` por tensor); embeddings y normalizaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `global_scales.safetensors` auxiliar y `SHA256SUMS` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B más allá de su pertenencia a la familia `qwen3_5` y de que se trata de un transformer denso de ~27 B parámetros. La model card de esta conversión no describe datos de entrenamiento, número de tokens, composición del corpus ni si hubo fases de RLHF o DPO; todos esos datos deben considerarse no disponibles. La referencia a `in_proj_qkv` e `in_proj_z` sugiere la presencia de mecanismos de atención con proyecciones separadas, pero no se confirma el tipo exacto de atención.

La innovación técnica de esta ficha es puramente de formato y despliegue. Inferact ya había cuantizado las capas lineales a NVFP4 con agrupación de 16; wangzi6224 reordena esos tensores al layout de MLX manteniendo intactos los bytes de peso y los escalares de bloque E4M3, y convierte `weight_scale_2` (multiplicado por 448 × 6) en el `global_scale` por tensor, almacenado aparte en `global_scales.safetensors`. Las capas que Inferact dejó en BF16 (`in_proj_qkv`, `in_proj_z`, `lm_head`) se cuantizan a NVFP4 con MLX 0.32.1 en CPU, usando como `global_scale` el máximo valor absoluto del tensor completo. Se eliminan la torre de visión y la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.8-27B (sin datos específicos publicados en esta conversión).
- Generación de código y matemáticas: capacidades esperables de la familia Qwen, aunque no se aportan métricas en la información disponible.
- Sin capacidades de visión: la torre visual ha sido eliminada en esta conversión.
- Sin decodificación multi-token especulativa: la cabeza MTP ha sido eliminada.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo pesa ~17 GB, por lo que encaja en equipos Apple Silicon con 24-32 GB de RAM unificada usando MLX; útil para prototipado sin GPU dedicada.
- Asistente de código en el portátil: al conservar `lm_head` y las proyecciones de atención cuantizadas, puede emplearse para autocompletado y generación de código en editores locales, siempre que se valide la calidad tras la cuantización NVFP4.
- Procesamiento por lotes de texto en local: tareas de resumen, extracción de entidades o clasificación sobre corpus privados que no deben salir del dispositivo, aprovechando la licencia Apache-2.0.
- Experimentación con formatos de cuantización: sirve como referencia para estudiar la conversión NVFP4 → MLX y comparar la calidad frente al modelo en BF16 o frente a otras cuantizaciones de la comunidad (`mlx-community/Qwen3.8-27B-nvfp4`).
- Base para fine-tuning ligero en Apple Silicon: al estar en safetensors y MLX, puede servir de punto de partida para LoRA/QLoRA sobre el modelo cuantizado, con las cautelas propias de entrenar sobre pesos de 4 bits.
- Evaluación comparativa de pipelines de inferencia: útil para medir latencia y throughput de MLX frente a llama.cpp o vLLM en el mismo modelo, dado que el repo incluye sumas de verificación (`SHA256SUMS`) que facilitan la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~17 GB solo para pesos; con overhead de MLX y caché KV, se recomienda un mínimo de 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA o AMD convencionales, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 24 GB o más de memoria unificada; no aplica a GPUs de consumo tipo RTX 4090 en su formato nativo.
- Opciones de despliegue: MLX (0.32.1 o superior según la model card), `mlx-lm`, y descarga vía `huggingface_hub` con `hf download`. Para otros runtimes habría que reconvertir los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota crítica de carga: el loader debe aplicar `global_scales.safetensors` a las capas cuantizadas; un cargador que solo lea el archivo principal de pesos producirá resultados incorrectos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| wangzi6224/Qwen3.8-27B-NVFP4-MLX | ~26,9 B | No disponible | NVFP4 (MLX) | Apache-2.0 | safetensors MLX |
| mlx-community/Qwen3.8-27B-nvfp4 | No disponible | No disponible | NVFP4 (MLX) | No disponible | safetensors MLX |
| Inferact/Qwen3.8-27B-NVFP4 | No disponible | No disponible | NVFP4 | Apache-2.0 | safetensors |
| Qwen/Qwen3.8-27B | No disponible | No disponible | BF16 (original) | No disponible | safetensors |

La información disponible no permite comparar rendimiento entre estas variantes; solo se confirma que comparten la misma base Qwen3.8-27B y que esta conversión elimina visión y MTP.

## Limitaciones y advertencias

- La cuantización NVFP4 a 4 bits puede degradar la calidad respecto al modelo en BF16; no se aportan evaluaciones que cuantifiquen esa pérdida.
- Se han eliminado la torre de visión y la cabeza MTP: no se puede usar para tareas multimodales ni para decodificación multi-token especulativa.
- El proceso de carga es sensible: ignorar `global_scales.safetensors` produce inferencias incorrectas sin error evidente.
- El autor de la conversión es un usuario individual (wangzi6224), no el equipo oficial de Qwen; conviene validar los pesos con `SHA256SUMS` antes de usarlos en producción.
- No hay información publicada sobre sesgos, tasas de alucinación ni idiomas soportados para esta variante.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar también las condiciones del modelo base Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- Solo funciona en el ecosistema MLX; no es directamente utilizable en vLLM, TGI o llama.cpp sin reconversión.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/wangzi6224/Qwen3.8-27B-NVFP4-MLX
- Modelo base de la cuantización: https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4 (revisión `6128240ebaf4eaa7bad2b3d1c72c37d677c5f462`)
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de la comunidad MLX: https://huggingface.co/mlx-community/Qwen3.8-27B-nvfp4
- Librería MLX: https://github.com/ml-explore/mlx
