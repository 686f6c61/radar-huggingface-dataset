# zekaili/causal_foreactcoffee_onecap_eefabs_sana_latent_obsblockcd60k_f33fps8_episode_n1_obs_videoonly

## Resumen

El modelo `causal_foreactcoffee_onecap_eefabs_sana_latent_obsblockcd60k_f33fps8_episode_n1_obs_videoonly` es una política robótica causal con memoria desarrollada por el autor de Hugging Face `zekaili` para la tarea real de preparación de café (ForeAct) sobre el robot bimanual Galaxea R1Lite. No es un modelo de lenguaje: es un policy de control visuomotor que genera acciones de efector final a partir de observaciones de tres cámaras (cabeza, muñeca izquierda, muñeca derecha) y estado del robot, condicionado por una instrucción textual fija.

Se trata de un checkpoint intermedio (época 90, paso de optimizador 10.000) de una ejecución de 20.000 pasos del run `causal_foreactcoffee_onecap_eefabs_sana_latent_256x320_mixv4_capv3_obsblockcd60k_aligned_f33fps8_episode_n1_obs_videoonly_nsc`. La arquitectura combina un transformer causal con capas softmax y capas GDN (gated delta network) que arrastran memoria de toda la historia, con latentes de vídeo SANA y un esquema de flow matching para vídeo y acciones. El repositorio ocupa 17,9 GB y contiene únicamente pesos consolidados, sin estado del optimizador ni del scheduler.

Su relevancia es acotada y muy específica: demuestra un pipeline completo de entrenamiento de políticas causales con memoria para manipulación bimanual real, con decisiones de diseño documentadas al detalle (ventana deslizante N1, obs-block causal, normalización de efector final absoluto y gripper). No está pensado para uso general ni para inferencia fuera de la tarea y el robot para los que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con memoria híbrida: capas softmax (sink + chunk limpio más reciente) y capas GDN (gated delta network) que portan la historia completa; latentes SANA, flow matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante de 1 chunk (`sliding_window_chunks: 1`); sink softmax leído hasta 7 chunks atrás; ventanas de episodio de 12 a 46 chunks |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model_fsdp.bin`, sin GGUF ni safetensors) |
| Idiomas soportados | no disponible (instrucción fija en inglés, no multilingüe) |
| Licencia | no disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (consolidado) + `metadata.pth` + `config.yaml` + `normalization/` |

## Arquitectura y entrenamiento

La política es un transformer causal con dos tipos de capas de atención combinadas: capas softmax que leen el sink y el chunk limpio más reciente, y capas GDN que mantienen la memoria de toda la historia. La configuración `sliding_window_chunks: 1` (N1) implica que cada chunk ruidoso lee su propia observación y fila de estado (`causal_observation: true`, `causal_state: true`), con `memory_content: video_only`, es decir, la memoria se compone únicamente de latentes de vídeo. Se activan AttnRes (`use_attn_res: true`), RoPE alineado con RoPE 3D por defecto para acciones, y normalizador GDN solo en numerador (`memory_gdn_output_normalizer: false`). Los latentes de vídeo usan el layout `sana_latent` con `ASPECT_RATIO_VIDEO_320_ROBOT`: tres cámaras (head, left_wrist, right_wrist) estiradas completas a 256 x 320.

El entrenamiento parte de un warm start con los pesos crudos de `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000/epoch_6_step_60000` (SHA256 `b420f69e...`), del que solo faltaba `pos_embed`; el optimizador y el schedule arrancan de cero. Los datos son el dataset LeRobot `zhuoyang20/foreact_coffee_making_data` (rev `d821aa46`), con sus cinco sesiones fusionadas en un solo árbol: 399 episodios, 258.562 frames a 15 fps y tres cámaras. Los episodios cubren tres etapas de un mismo procedimiento (193 cargan cápsula, 141 preparan café en taza, 65 hacen ambas, cápsula primero) bajo una única instrucción. Los latentes provienen del store `v2-f33-vs4-phase-stretch-6ceec75e2da5162f` (VAE causal LTX-2.3 construido sobre NSC) con vídeo a 8 fps. Se generan 12.768 ventanas de episodio completo de 12 a 46 chunks (`aligned_phase_window: first_frame`, `require_video_target: true`).

La pérdida es flow matching con flow shift de vídeo 5 y de acción 3, ponderación de timesteps OpenWAM (peso mínimo 0), peso de pérdida de acción 1, sin ponderación por fase crítica y con dropout de instrucción del 10 %. El schedule es warmup de 500 pasos hasta lr 1e-4, luego coseno hasta 1e-6 en 20.000 pasos, con AdamW (betas 0.9/0.95, weight decay 1e-4, eps 1e-10, clip de gradiente 1) y sin EMA. El entrenamiento usó NSC en 4 nodos x 4 GB300 (16 rangos), con batches por rango de `floor(160 / L)` ventanas de L chunks (máximo 40) y 112 pasos por época. En este paso la pérdida de entrenamiento es 0,0503 (vídeo 0,0501, acción 0,00026), con media de 0,0529 en los últimos 500 pasos.

## Capacidades

- Generación de acciones de efector final absolutas para ambas manos: pose EEF (posición y rotación 6D) y gripper, en slots Robot80 7-16 y 36-45; las articulaciones no son entrada ni objetivo.
- Control visuomotor a partir de tres cámaras (cabeza, muñeca izquierda, muñeca derecha) estiradas a 256 x 320.
- Condicionamiento por instrucción textual fija en inglés, con un token group por cámara y uno para las filas del robot.
- Memoria causal de episodio mediante capas GDN y sink softmax, con ventana deslizante N1.
- Generación de chunks de 32 acciones a 15 fps (2,13 s por chunk).
- Control de gripper como grado de apertura en [0, 1] (0 abierto, 1 cerrado), derivado de la posición HDAS (0 cerrado, 100 abierto).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni audio.

## Casos de uso

- Automatización de la tarea de café en el Galaxea R1Lite: la política ejecuta la secuencia cargar cápsula, cerrar palanca, colocar taza, pulsar botón y retirar la taza, usando la instrucción fija documentada y las tres cámaras del robot.
- Investigación en políticas causales con memoria: sirve como referencia reproducible para estudiar el efecto de `sliding_window_chunks: 1`, `causal_observation` y `causal_state` en el rendimiento de manipulación.
- Warm start de nuevos entrenamientos: los pesos consolidados permiten inicializar runs sobre la misma tarea o variantes cercanas, aunque sin estado del optimizador ni RNG.
- Evaluación de latentes SANA en robótica: el checkpoint permite comparar el layout `sana_latent` con VAE causal LTX-2.3 frente a alternativas de codificación visual en tareas de manipulación bimanual.
- Estudio de normalización de efector final absoluto: el artefacto `normalization/` (SHA256 `d2aa9e18`) y el modo `eef_target_mode: absolute` documentan un esquema concreto que puede replicarse o compararse.
- Benchmark interno de control bimanual con grippers paralelos: la política genera acciones para dos brazos de forma simultánea, útil para medir sincronización y estabilidad en tareas de dos manos.
- Reproducción de recetas de flow matching para acción y vídeo: los flow shifts 5/3, la ponderación OpenWAM y el CFG scale 6 documentados permiten reproducir el pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento en el paso 10.000 (0,0503 total; 0,0501 vídeo; 0,00026 acción; media de 0,0529 en 500 pasos) y no incluye ninguna evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 17,9 GB en pesos consolidados en `pytorch_model_fsdp.bin`, por lo que la inferencia en precisión completa requiere al menos ese orden de magnitud más activaciones y latentes.
- GPU recomendadas: no disponibles en la información; el entrenamiento se realizó en 4 nodos x 4 GB300 (16 rangos), lo que no implica requisitos de inferencia.
- Cabeza en GPU de consumo: no disponible; sin cuantizaciones publicadas (no hay GGUF) no puede confirmarse.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el artefacto es específico del stack `rwm/zekai-merge` (commit `40d025729`) más un overlay local no publicado.
- Latencia y throughput: no disponibles; la política genera 32 acciones por chunk a 15 fps (2,13 s), pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas visuomotoras causales con memoria para el Galaxea R1Lite o para la tarea ForeAct), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de una única tarea (preparación de café) y un único robot (Galaxea R1Lite); no generaliza a otras tareas, morfologías ni instrucciones distintas de la documentada.
- La instrucción debe usarse literalmente; el prompt está estructurado por token groups de cámara y filas del robot, y cambiarlo puede degradar el comportamiento.
- Checkpoint intermedio (época 90, paso 10.000 de 20.000) sin evaluación registrada; no hay evidencia publicada de éxito en la tarea real.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Pesos en formato propietario del stack de entrenamiento (`pytorch_model_fsdp.bin`), sin safetensors ni GGUF, lo que dificulta el despliegue fuera del código original.
- El artefacto es solo de pesos: no incluye estado del optimizador, scheduler ni RNG, por lo que no sirve para reanudar entrenamiento.
- La ruta de FlashAttention-2 (`softmax_varlen_attention`) solo acepta media precisión; en float32 debe desactivarse.
- Riesgo de sobreajuste a las condiciones de captura del dataset (cinco sesiones, tres cámaras concretas) y de degradación ante cambios de iluminación, posición de objetos o calibración.
- No hay información sobre sesgos, alucinación en sentido lingüístico ni cobertura multilingüe, al no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/zekaili/causal_foreactcoffee_onecap_eefabs_sana_latent_obsblockcd60k_f33fps8_episode_n1_obs_videoonly
- Dataset de entrenamiento: https://huggingface.co/datasets/zhuoyang20/foreact_coffee_making_data
- Código de entrenamiento: repositorio `rwm/zekai-merge`, commit `40d025729` (más overlay local no publicado)
- URDF del robot: `userguide-galaxea/URDF@2e5d31e1`, `R1Lite/urdf_r1lite_2025.urdf`
- Store de latentes: `v2-f33-vs4-phase-stretch-6ceec75e2da5162f` (VAE causal LTX-2.3 sobre NSC)
- Pesos de warm start: `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_cooldown10k_from_s50000/epoch_6_step_60000`
