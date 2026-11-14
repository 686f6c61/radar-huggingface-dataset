# zekaili/sft_magiccube_jointabs_sana_latent_256x320_mixv4_capv3_obsstatecausal40868_aligned_f33fps8

## Resumen

`sft_magiccube_jointabs_sana_latent_256x320_mixv4_capv3_obsstatecausal40868_aligned_f33fps8` es una política robótica entrenada por el usuario `zekaili` mediante ajuste fino supervisado (SFT) sobre el modelo donante `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128`. No es un modelo de lenguaje, sino un modelo de control visomotor para un robot bimanual YAM que debe resolver una tarea concreta de manipulación: coger un cubo de Rubik con el brazo izquierdo, pasarlo al brazo derecho y girar 90 grados la capa exterior con la pinza derecha.

El modelo parte de una arquitectura SANA (transformer de difusión latente) adaptada como política "memory-less" con condicionamiento causal de la forma `[obs; state] | [prediction latents; actions]`. Trabaja sobre latentes de imagen de 256x320, ventanas de 33 fotogramas a 8 fps y acciones en modo "joint-absolute" (6 articulaciones más pinza por brazo). El checkpoint publicado corresponde al paso 10.000 (final) del entrenamiento, con 4.470.208.104 parámetros y un tamaño de repositorio de 17,9 GB.

Es relevante por su carácter de receta reproducible: el autor publica configuración congelada, launcher de Slurm, log de entrenamiento completo, manifiesto de hashes y fichero de normalización, lo que permite auditar exactamente cómo se generó la política. No obstante, se trata de un modelo experimental de investigación con cero descargas y sin evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SANA (transformer de difusión latente) adaptado como política robótica, condicionamiento causal `[obs; state] | [prediction latents; actions]`, memoria desactivada |
| Parámetros totales | 4.470.208.104 (925 tensores: 924 float32, 1 bfloat16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 33 fotogramas a 8 fps (aprox. 4,1 s de observación) |
| Tipos de cuantización | no disponible (pesos en float32/bfloat16; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | other |
| Formato de pesos | `pytorch_model_fsdp.bin` (binario PyTorch, checkpoint FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de una política SANA-RWM "memory-less" que procesa observaciones visuales (vistas `top`, `left_wrist`, `right_wrist`) y estado del robot, y genera latentes de predicción junto con acciones. La formulación causal `[obs; state] | [prediction latents; actions]` implica que las acciones se condicionan a la observación y el estado, mientras que los latentes de predicción se generan de forma causal. Los latentes de imagen son de 256x320, con ventanas de 33 fotogramas muestreadas a 8 fps y RoPE alineado. El donante emplea GDN en modo "numerator-only" (`memory_gdn_output_normalizer: false`).

El entrenamiento se realizó sobre el dataset `zekaili/magic-cube` (rev `ab916f09`): 46 episodios, 33.166 filas, 15 fps, tarea de manipulación del cubo de Rubik con un rig bimanual YAM de LeRobot. Se usaron 33.120 ventanas (31.694 completas más 1.426 rellenadas por congelación). Optimizador AdamW (0.9, 0.95) con lr 1e-4, warmup de 500 pasos y decaimiento coseno hasta 1e-6 en 10.000 pasos; flow shift 5 para vídeo y 3 para acción; `min_weight 0.0`. Batch de 16 por GPU en 16 GPUs (256 ventanas por paso, sin acumulación), sobre 2 nodos de 8 H100, entre el 3 y el 4 de noviembre de 2026. La pérdida media en los pasos 9.001–10.000 fue de 0,0241 (vídeo 0,0241; acción 0,00010).

## Capacidades

- Control visomotor bimanual: genera acciones conjuntas absolutas (6 articulaciones más pinza por brazo) a partir de tres vistas de cámara y el estado del robot.
- Manipulación de objetos: entrenado específicamente para coger un cubo de Rubik, transferirlo entre brazos y girar una capa exterior 90 grados.
- Política sin memoria: cada predicción depende únicamente de la ventana de observación actual (33 fotogramas), no de un estado recurrente persistente.
- Predicción de latentes de vídeo junto con acciones, lo que permite modelar la dinámica visual futura como señal auxiliar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de robótica, no un LLM.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del dominio de control.

## Casos de uso

- Reproducción de experimentos de investigación en políticas visomotoras: sirve como punto de partida para estudiar el efecto del condicionamiento causal `[obs; state] | [latents; actions]` en tareas bimanuales, gracias a la publicación de la receta y los logs.
- Benchmark interno de manipulación bimanual: puede evaluarse en el rig YAM con la tarea del cubo de Rubik para comparar variantes de SANA u otras políticas sobre el mismo dataset.
- Ajuste fino sobre nuevos datasets LeRobot: la configuración congelada y el fichero de normalización permiten reentrenar sobre tareas similares con el mismo pipeline.
- Estudio de acción "joint-absolute": útil para analizar cómo se comporta una política con acciones absolutas por articulación frente a acciones relativas o delta.
- Análisis de pérdidas de vídeo frente a acción: los logs permiten estudiar el balance entre la pérdida de latentes visuales (0,0241) y la de acción (0,00010) en el ajuste fino.
- Docencia y divulgación: ejemplo completo de entrenamiento SFT de una política robótica en cluster H100 con FSDP, Slurm y LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "No evaluation yet" y solo reporta la pérdida de entrenamiento (loss 0,0241; vídeo 0,0241; acción 0,00010 en los pasos 9.001–10.000).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.470 millones de parámetros en float32, los pesos ocupan aproximadamente 17,9 GB, por lo que se necesita al menos una GPU de 24 GB para cargarlos sin cuantizar; en bfloat16 serían unos 8,9 GB.
- GPU recomendadas: el autor entrenó con 16 H100 (2 nodos de 8). Para inferencia, una H100 o A100 de 40/80 GB es la opción segura; una RTX 4090 de 24 GB podría cargar los pesos en float32 al límite, pero no se ha validado.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090 (24 GB) o RTX 3090 (24 GB) si se confirma la carga en bfloat16, pero no está documentado ni probado por el autor.
- Opciones de despliegue: el autor indica cargar con `model.load_from=<local dir>/epoch_78_step_10000` y el `config.yaml` incluido, dentro del stack `rwm/zekai-merge` y la librería `sana`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`zekaili/sft_magiccube_...`) | 4.470 M | 33 fotogramas @ 8 fps | Política bimanual YAM (cubo de Rubik) | other | Hugging Face, 0 descargas |
| `zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128` (donante) | no disponible | no disponible | Política base SANA-RWM | no disponible | Hugging Face (referenciado) |
| Políticas LeRobot estándar (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación robótica | no disponible | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin evaluación: el autor indica "No evaluation yet"; no hay métricas de éxito en la tarea.
- Tarea y hardware muy específicos: entrenado para un rig YAM bimanual concreto, tres vistas fijas y una tarea única (cubo de Rubik); no generaliza a otras tareas ni robots sin reentrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso por terceros ni validación externa.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Sin memoria: al ser "memory-less", puede fallar en tareas que requieran estado a largo plazo más allá de la ventana de 33 fotogramas.
- Pesos en float32 (924 tensores) y un binario FSDP de 17,9 GB: carga pesada y sin variantes cuantizadas publicadas.
- Riesgo de sobreajuste a los 46 episodios del dataset; la pérdida de acción muy baja (0,00010) frente a la de vídeo sugiere un ajuste muy fuerte a las trayectorias de entrenamiento.
- No apto para usos fuera de robótica: no es un modelo de lenguaje ni soporta interfaces conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/zekaili/sft_magiccube_jointabs_sana_latent_256x320_mixv4_capv3_obsstatecausal40868_aligned_f33fps8
- Modelo donante: https://huggingface.co/zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128
- Dataset: `zekaili/magic-cube` (rev `ab916f09`)
- Código: `rwm/zekai-merge` (commit `78a48ed19`) — no se proporciona URL directa en la información disponible
- Librería: `sana` (referenciada en los tags)
