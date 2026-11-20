# yuerubywang/qwen3-1.7b-dpo-adam-state-checkpoints

## Resumen

`yuerubywang/qwen3-1.7b-dpo-adam-state-checkpoints` es una coleccion de checkpoints intermedios de un proceso de DPO (Direct Preference Optimization) offline aplicado sobre un modelo Qwen3-1.7B previamente afinado con SFT. El autor, yuerubywang, publica no solo los pesos en bf16 sino tambien el estado completo del optimizador AdamW (`exp_avg`, `exp_avg_sq`), el estado del scheduler, el estado RNG y el `trainer_state.json` en cada checkpoint, lo que permite reanudar el entrenamiento exactamente donde se dejo con `resume_from_checkpoint`.

El interes de esta publicacion no esta en el modelo resultante como producto final, sino en su valor como material de investigacion reproducible: expone la evolucion del estado del optimizador a lo largo de 240 actualizaciones de DPO sobre UltraFeedback (61.135 pares binarizados), con hiperparametros documentados de forma exhaustiva. Es util para estudiar dinamicas de entrenamiento con DPO, depuracion de pipelines de TRL y analisis de estados de AdamW en modelos pequenos.

El modelo base es Qwen3-1.7B, un transformer denso de 1.700 millones de parametros de la familia Qwen3 de Alibaba. La licencia es Apache 2.0. No se proporcionan datos sobre benchmarks, idiomas soportados ni pipeline de inferencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento DPO usa max 600 tokens totales: 200 prompt + 400 completion) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en bf16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) en bf16, mas `optimizer.pt` (estado AdamW en bf16), `scheduler.pt`, estado RNG y `trainer_state.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. Sobre una version ya sometida a SFT (`yuerubywang/sft-qwen-2e6-ckpt406` en el commit `caecc74`), se aplica DPO offline con la implementacion de TRL 0.24.0. El dataset es UltraFeedback, usando la particion `train_prefs` binarizada con 61.135 pares, durante 2 epocas, lo que resulta en 240 actualizaciones del optimizador. Cada checkpoint (N = 30, 60, ..., 240) es un checkpoint completo de Hugging Face Trainer.

Los hiperparametros estan completamente documentados: optimizador `adamw_torch_fused` con β = (0.9, 0.999), ε = 1e-8 y weight decay 0; learning rate 5e-5 con decaimiento lineal a 0 y sin warmup; recorte de norma de gradiente a 1.0; batch efectivo de 512 pares por actualizacion (8 por dispositivo × 64 de acumulacion × 1 GPU); β de DPO = 0.1 con perdida sigmoide; longitudes maximas de 200 tokens de prompt, 400 de completion y 600 totales. Se entreno en una unica H100 de 80 GB con bf16, tf32, gradient checkpointing, atencion SDPA, dropout desactivado y semilla 42. La innovacion principal de la publicacion es la inclusion del estado de AdamW en bf16 junto con el estado del scheduler y RNG, lo que habilita reanudacion bit a bit reproducible.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen3-1.7B tras SFT y posterior alineamiento con DPO.
- Razonamiento y respuesta a prompts de tipo instructivo, condicionado por el dataset de preferencias UltraFeedback.
- Capacidad de reanudacion exacta del entrenamiento: los checkpoints incluyen pesos, estado AdamW, scheduler y RNG, permitiendo `resume_from_checkpoint` sin perdida de estado.
- Uso como referencia o inicializacion para experimentos de DPO con TRL.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de DPO: cargar cualquier checkpoint con `resume_from_checkpoint` para continuar el entrenamiento desde la actualizacion exacta (30, 60, ..., 240) conservando el estado de AdamW, el scheduler y el RNG, lo que permite comparar curvas de entrenamiento sin reiniciar el proceso.
- Analisis del estado del optimizador: estudiar la evolucion de `exp_avg` y `exp_avg_sq` a lo largo de 240 pasos de DPO en un modelo de 1.7B, por ejemplo para investigar la relacion entre magnitud del estado de AdamW y el margen de preferencia aprendido.
- Investigacion sobre inestabilidad en DPO: usar los checkpoints intermedios para medir como evoluciona la perdida sigmoide con β = 0.1 y learning rate 5e-5 sin warmup, y correlacionarlo con cambios en la distribucion de pesos.
- Depuracion de pipelines de TRL: validar que una configuracion de entrenamiento (bf16, tf32, gradient checkpointing, SDPA) produce estados de optimizador coherentes comparando con estos checkpoints de referencia.
- Fine-tuning posterior con tecnicas de preference optimization: partir de un checkpoint intermedio (por ejemplo el 120) en lugar del modelo final, para experimentar con curriculum de alineamiento.
- Docencia y formacion: usar los checkpoints como ejemplo didactico de que contiene realmente un checkpoint de Hugging Face Trainer y como se reanuda un entrenamiento de forma reproducible con semilla fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos (1.700 M parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM estimada para reanudar el entrenamiento: los pesos en bf16 (~3,4 GB) mas el estado AdamW en bf16 (`exp_avg` y `exp_avg_sq`, ~6,8 GB adicionales) superan los 10 GB solo en estado del modelo; con gradient checkpointing y batch pequeno, una GPU de 24 GB es suficiente, aunque el autor uso una H100 de 80 GB con batch efectivo de 512.
- GPU recomendadas: H100 80 GB (configuracion del autor); para inferencia, RTX 4090, RTX 3090, A100 o cualquier GPU con 8 GB o mas en bf16/fp16.
- Cabe en GPU de consumo: si, para inferencia en bf16 o cuantizado; para reanudar el entrenamiento completo conviene al menos 24 GB.
- Opciones de despliegue: `transformers` con `from_pretrained`; para servir en produccion, vLLM, TGI o llama.cpp tras conversion a GGUF (no se proporcionan conversiones en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado del optimizador incluido | Disponibilidad |
|---|---|---|---|---|---|
| yuerubywang/qwen3-1.7b-dpo-adam-state-checkpoints | 1,7 B | no disponible | Apache 2.0 | Si (AdamW bf16, scheduler, RNG) | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Apache 2.0 | No | Hugging Face |
| Modelos DPO tipicos de 1-2 B publicados en HF | 1-2 B | variable | variable | Habitualmente no | Hugging Face |

La diferencia principal frente a otros checkpoints DPO publicados es la inclusion explicita del estado del optimizador y del scheduler, que la mayoria de publicaciones omite.

## Limitaciones y advertencias

- El modelo no se presenta como producto final: es una coleccion de checkpoints de investigacion, y su calidad como asistente no esta evaluada con benchmarks.
- El DPO se entreno con longitudes maximas de 600 tokens totales; prompts o respuestas mas largos pueden degradar la calidad.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B y el dataset UltraFeedback tienen sus propias condiciones que conviene verificar.
- El estado AdamW en bf16 introduce menor precision que fp32; la reanudacion es reproducible pero no identica a un entrenamiento con estado en fp32.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- El autor entreno con una sola semilla (42); no hay evidencia de robustez frente a variacion de semilla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yuerubywang/qwen3-1.7b-dpo-adam-state-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint SFT de inicializacion: https://huggingface.co/yuerubywang/sft-qwen-2e6-ckpt406
- Dataset UltraFeedback: no se proporciona enlace en la informacion disponible
- Paper de DPO: no se proporciona enlace en la informacion disponible
- Documentacion de TRL: no se proporciona enlace en la informacion disponible
