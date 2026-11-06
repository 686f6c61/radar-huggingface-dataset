# tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full_from30k

## Resumen

Este repositorio contiene un ajuste fino del modelo pi0.5 (pi05) sobre un conjunto de datos de demostraciones de robótica para una tarea concreta de manipulación de fichas de mahjong en simulación. Lo desarrolla el usuario `tc-huang-mahjong` como parte de un laboratorio personal de experimentación (repositorio `tc-huang/mahjong-lab`) y se publica bajo la librería LeRobot de Hugging Face. No es un modelo de lenguaje generalista: es una política visuomotora (vision-language-action) entrenada para controlar un brazo robótico SO-101 en un entorno simulado con Isaac Lab y PhysX.

El modelo parte del checkpoint `step-030000` del modelo base `pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full` y se reentrena durante 20 000 pasos adicionales sobre el dataset `mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5`. La tarea concreta es la manipulación de fichas de mahjong (aparentemente variantes de "dos" o "twos") sobre un soporte o estante (`rack07`), con una política de "detour" y variaciones (`vary_off5`).

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de entrenamiento LeRobot con pi0.5 sobre datos simulados, útil para investigadores que quieran replicar el flujo de trabajo o adaptarlo a otras tareas de manipulación. No está pensado para uso general, ni para producción fuera del entorno simulado para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action, basada en PaliGemma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 con autocast bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible (checkpoints LeRobot; pesos y estado del optimizador en float32) |

## Arquitectura y entrenamiento

La arquitectura es pi0.5, una política visuomotora construida sobre PaliGemma (que a su vez incorpora Gemma). El modelo procesa observaciones visuales (cámaras `front_cam` y `front_cam_right`, cada una con dos vistas solapadas de 224 x 224 recortadas de forma cuadrada mediante `src/models/split_camera.py`) junto con el estado del robot, y produce acciones de control para el brazo SO-101. El preprocesador no recorta las cámaras más allá de ese split de vista frontal.

El entrenamiento se realizó con LeRobot en el commit fijado `38b975c5`, usando el script `scripts/train/lerobot_train_mahjong.py` con argumentos concretos: `--policy.type=pi05`, `--policy.pretrained_path=/root/pi05_base`, `--policy.freeze_vision_encoder=false`, `--policy.gradient_checkpointing=false`, `--policy.compile_model=true` (modo `default`), `--policy.scheduler_decay_steps=20000`, `--batch_size=12`, `--steps=20000`, `--save_freq=10000`, `--accelerator.mixed_precision=bf16`, `--optimizer.fused=true`, `--policy.optimizer_lr=1e-5`, `--num_workers=8`. El modelo se inicializa desde el checkpoint `step-030000` del modelo base, no desde el pi0.5 base original. Los pesos y el estado del optimizador se guardan en float32 con autocast bf16. El dataset de entrenamiento es `mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5`, generado en simulación con Isaac Lab y PhysX. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica en el sentido habitual para políticas de robótica).

## Capacidades

- Control visuomotor de un brazo robótico SO-101 en simulación (Isaac Lab / PhysX).
- Manipulación de fichas de mahjong sobre un estante (`rack07`), específicamente variantes de "dos" (`twos`).
- Política de "detour" con variaciones (`vary_off5`), es decir, trayectorias alternativas condicionadas por la variación del entorno.
- Procesamiento de dos vistas de cámara frontal (`front_cam` y `front_cam_right`) con recortes cuadrados de 224 x 224.
- Integración con el ecosistema LeRobot (carga mediante la librería `lerobot`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito; es una política de acción, no un modelo conversacional.

## Casos de uso

- Replicación de experimentos de manipulación robótica en simulación: sirve como punto de partida para investigadores que quieran reproducir el pipeline de entrenamiento LeRobot con pi0.5 sobre datos de Isaac Lab, usando los argumentos y el commit documentados.
- Evaluación de políticas visuomotoras en tareas de precisión: la manipulación de fichas de mahjong sobre un estante requiere control fino de agarre y colocación, útil como benchmark de destreza en simulación.
- Estudio de generalización ante variaciones del entorno: la política `vary_off5` y el modo "detour" permiten analizar cómo responde el modelo a desviaciones en la posición de los objetos.
- Base para ajuste fino en tareas similares: al ser un fine-tune de pi0.5 sobre un dataset concreto, puede reutilizarse como inicialización para otras tareas de manipulación con SO-101.
- Docencia y formación en robótica con IA: el repositorio y los scripts (`train_lerobot.sh`, `lerobot_train_mahjong.py`) ofrecen un ejemplo completo y trazable de entrenamiento de una política VLA.
- Investigación en simulación a realidad (sim2real): aunque el modelo se entrena solo en simulación, el flujo puede servir de base para estudiar transferencia a un SO-101 físico, con las cautelas del caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del modelo pi0.5 no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizó con `batch_size=12`, `bf16` y `compile_model=true`, lo que sugiere al menos una GPU con memoria suficiente para ese lote, pero no se indica el modelo concreto.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a una política de robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full_from30k (este) | Política VLA pi0.5 fine-tuned | no disponible | gemma | Hugging Face, 0 descargas |
| pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full (modelo base) | Política VLA pi0.5 | no disponible | gemma | Hugging Face |
| pi0.5 base (`/root/pi05_base` referenciado en el entrenamiento) | Política VLA pi0.5 | no disponible | gemma | No referenciado como repo público en la información disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a la relación de linaje (este modelo se inicializa desde el checkpoint `step-030000` del modelo base, que a su vez parte de pi0.5).

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para una tarea de manipulación de fichas de mahjong sobre un estante concreto en simulación; no generaliza a otras tareas sin reentrenamiento.
- Entrenado solo en simulación (Isaac Lab / PhysX): no hay evidencia de transferencia a un robot físico; el rendimiento en el mundo real es desconocido.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con las restricciones que ello implica para uso comercial y para determinados casos de uso.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras en el control del robot, especialmente fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados; el dataset está limitado a las condiciones simuladas de `rack07` y variantes `twos` con `vary_off5`.
- Sin métricas publicadas: no hay benchmarks ni curvas de evaluación en la información disponible, por lo que no es posible valorar su calidad objetiva frente a alternativas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; el autor no ofrece garantías de mantenimiento.
- Los datos de entrenamiento incluyen imágenes de fichas de mahjong adaptadas de `Mahjong_eg_TW.jpg` (Cangjie6, CC BY-SA 4.0); no se implica respaldo del autor original.
- El preprocesador no recorta las cámaras, lo que puede afectar a la robustez si se cambia la resolución o la disposición de las cámaras en despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full_from30k
- Modelo base: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5
- Código del experimento (commit): https://github.com/tc-huang/mahjong-lab/tree/4fea83350a19f4e04e4f45c39b9d0f661ec70c6e
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Cangjie6, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
