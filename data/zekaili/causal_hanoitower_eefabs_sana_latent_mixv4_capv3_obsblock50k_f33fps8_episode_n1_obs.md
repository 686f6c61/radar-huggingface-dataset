# zekaili/causal_hanoitower_eefabs_sana_latent_mixv4_capv3_obsblock50k_f33fps8_episode_n1_obs

## Resumen

Este repositorio contiene únicamente los pesos de una política robótica ("robot policy") entrenada para manipulación bimanual en un entorno real de torre de Hanói, usando el robot YAM. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de observaciones visuales y del estado del robot, genera acciones de efector final (EEF) en coordenadas absolutas. Lo desarrolla el usuario zekaili y se publica bajo la librería `sana` (SANA-RWM), con arquitectura causal por chunks y memoria basada en ventanas de episodio.

La política parte de un preentrenamiento de dos flujos con memoria de bloques de observación (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock...`) y se afina sobre el dataset `zekaili/hanoi-tower` (105 episodios, 141.797 filas). El checkpoint publicado corresponde al paso 20.000 de 20.000, con una pérdida media de entrenamiento de 0,0421 en los últimos 1.000 pasos (vídeo 0,0417, acción 0,00034). Es relevante para quien investigue políticas robóticas causales con memoria de contexto largo y control absoluto de efector final, aunque su alcance es muy específico y no es un modelo de propósito general.

El repositorio pesa 17,9 GB y contiene solo pesos en formato PyTorch (`pytorch_model_fsdp.bin`), junto con `config.yaml`, `metadata.pth` y un artefacto de normalización del robot. No incluye estados de optimizador, scheduler ni RNG, por lo que no está pensado para reanudar entrenamiento, sino para evaluación o despliegue con el código `rwm/zekai-merge` en el commit `9a1b3e33d` o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora causal por chunks con memoria de ventana de episodio (SANA-RWM, dos flujos con bloques de observación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Ventana de memoria de episodio N1 (ventana softmax de tamaño 1); número exacto de tokens no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (licencia personalizada, sin detalle en la información disponible) |
| Formato de pesos | PyTorch (`model/pytorch_model_fsdp.bin`), más `config.yaml`, `metadata.pth` y `normalization/*.json` |

## Arquitectura y entrenamiento

La política se basa en SANA-RWM con un esquema causal por chunks ("chunk-causal"): el modelo procesa ventanas de episodio y genera acciones por bloques, con memoria de solo vídeo y un latente de observación causal por chunk más un estado causal. Emplea objetivos de efector final absolutos (`eefabs`) y RoPE alineado (`aligned`). La decodificación usa una ventana softmax de tamaño N1, es decir, una ventana de atención de tamaño 1 sobre la memoria de episodio. El modelo se ejecuta a 15 fps sobre el robot YAM bimanual y trabaja con observaciones de 256x320 píxeles.

El entrenamiento parte del checkpoint `epoch_5_step_50000` del preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256`, y se afina sobre el dataset `zekaili/hanoi-tower` (105 episodios, 141.797 filas) durante 20.000 pasos, con Adam y beta2 0,95 a partir del paso 5.641. La receta se mantiene sin cambios durante todo el run y la pérdida media de los pasos 19.001 a 20.000 es 0,0421 (vídeo 0,0417, acción 0,00034). La lectura del grupo de observación como rama (`fd5261ff6`, two-stream obs-block) exige evaluar y desplegar sobre un árbol en ese commit o posterior, con el `config.yaml` incluido (`memory_gdn_output_normalizer: false`, `fp32_attention: false`).

## Capacidades

- Generación de acciones de efector final en coordenadas absolutas para control bimanual del robot YAM.
- Procesamiento de observaciones visuales (vídeo) con memoria de ventana de episodio.
- Razonamiento causal por chunks: cada chunk de acción se condiciona a la observación latente causal y al estado causal previo.
- Control a 15 fps en entorno real de torre de Hanói.
- Memoria de solo vídeo (video-only memory) para mantener contexto temporal entre chunks.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de audio ni de visión general fuera del dominio robótico entrenado.

## Casos de uso

- Investigación en políticas robóticas causales: el modelo sirve como referencia para estudiar cómo la memoria de ventana de episodio y el latente causal por chunk afectan al control visuomotor en tareas de manipulación.
- Reproducción de experimentos de torre de Hanói: con el dataset `zekaili/hanoi-tower` y el código `rwm/zekai-merge` en el commit `9a1b3e33d`, se puede evaluar el checkpoint final paso a paso y comparar con variantes de ventana (N1 frente a otras).
- Despliegue en el robot YAM bimanual: la política genera acciones EEF absolutas a 15 fps, adecuadas para tareas de apilado y manipulación de piezas en un banco de pruebas real.
- Estudio de control absoluto de efector final: útil para analizar estabilidad y precisión de objetivos EEF absolutos frente a objetivos relativos en políticas por chunks.
- Benchmarking de memoria de solo vídeo: permite medir el impacto de prescindir de memoria de estado en tareas con historial visual relevante.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint final con receta estable, puede servir de inicialización para otros entornos bimanuales con el mismo formato de normalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico de rendimiento es la pérdida media de entrenamiento en los pasos 19.001 a 20.000: 0,0421 total (vídeo 0,0417, acción 0,00034). No hay métricas de éxito en tarea, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint pesa 17,9 GB en precisión de entrenamiento, por lo que se requiere al menos esa cantidad de memoria más el overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se necesitan GPUs de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen; con 17,9 GB de pesos, solo cabría en GPUs con 24 GB o más si el runtime lo permite, sin garantía.
- Opciones de despliegue: el código de referencia es `rwm/zekai-merge` en el commit `9a1b3e33d` o posterior; no se indican integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el modelo opera a 15 fps en el robot YAM, pero no se publican latencias por paso ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de política robótica bimanual con memoria causal por chunks, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente para la tarea de torre de Hanói con el robot YAM bimanual; no generaliza a otras tareas sin fine-tuning.
- Solo contiene pesos: no incluye estados de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento tal cual.
- Dependencia estricta del código: debe evaluarse sobre un árbol en el commit `fd5261ff6` o posterior, con el `config.yaml` incluido; otras versiones pueden cambiar el significado de los pesos.
- Licencia "other": no se detallan los términos, por lo que el uso comercial no está claramente autorizado; hay que consultar la licencia del autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al dataset de 105 episodios y a la configuración concreta del robot; el rendimiento fuera de esa configuración no está documentado.
- No hay métricas de éxito en tarea ni evaluación en entornos no vistos, lo que impide estimar fiabilidad real.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento simbólico.
- El repositorio no incluye demos, papers ni documentación adicional sobre sesgos o alucinaciones, conceptos que además no aplican directamente a una política de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zekaili/causal_hanoitower_eefabs_sana_latent_mixv4_capv3_obsblock50k_f33fps8_episode_n1_obs
- Dataset de entrenamiento: `zekaili/hanoi-tower` (referenciado en la model card; URL no proporcionada)
- Preentrenamiento base: `zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_s15000_ws256` (referenciado en la model card; URL no proporcionada)
- Código: `rwm/zekai-merge`, commit `9a1b3e33d` (referenciado en la model card; URL no proporcionada)
- Run de wandb: `lzknus/sana-rwm/causal_hanoitower_eefabs_sana_latent_256x320_mixv4_capv3_obsblock50k_aligned_f33fps8_episode_n1_obs_videoonly` (referenciado en la model card; URL no proporcionada)
