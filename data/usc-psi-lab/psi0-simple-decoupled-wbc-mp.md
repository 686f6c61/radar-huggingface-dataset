# USC-PSI-Lab/Psi0-SIMPLE-decoupled-wbc-MP

## Resumen

Psi0 · SIMPLE Decoupled-WBC MP es una política robótica multi-tarea para el humanoide Unitree G1, desarrollada por el laboratorio USC-PSI-Lab. Se trata de un modelo de tipo VLA (vision-language-action) construido sobre el backbone Qwen3-VL de Psi0, con una cabeza de acciones basada en flow-matching. El checkpoint está afinado sobre las 5 tareas de planificación de movimiento (motion planning, MP) del conjunto de datos SIMPLE-decoupled-wbc-MP y se evalúa en el benchmark SIMPLE, que combina física MuJoCo con renderizado Isaac Sim.

El modelo resuelve el problema del control de cuerpo completo (whole-body control) en un humanoide, traduciendo instrucciones en lenguaje natural e imágenes de cámara en secuencias de acciones de 37 dimensiones que controlan el robot. Es relevante porque demuestra que un VLM preentrenado puede adaptarse mediante fine-tuning a tareas de manipulación y locomoción en hardware humanoide, y porque libera pesos, receta de entrenamiento y pipeline de evaluación de forma reproducible bajo licencia Apache 2.0.

El repositorio contiene únicamente los pesos de inferencia (aproximadamente 11 GB en bf16) y los artefactos de configuración del run, lo que permite servir la política directamente con el servidor de Psi0. No debe confundirse con su contraparte Teleop, entrenada con las 12 tareas de teleoperación y con convenciones de estado y acción distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone VLM Qwen3-VL + cabeza de acciones flow-matching DiT de 12 bloques con fusión VLM por capas |
| Parametros totales | no disponible (pesos de inferencia ~11 GB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints/ckpt_40000/model.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de un VLM preentrenado Psi0 con backbone Qwen3-VL (`pre.fast.1by1.2601091803.ckpt.ego200k.he30k`) y una cabeza de acciones post-preentrenada (`postpre.1by1.pad36.2601131206.ckpt.he30k`). La cabeza es un transformer DiT de 12 bloques entrenado con flow-matching (1000 pasos de entrenamiento), con chunk de 30 acciones, fusión VLM por capas, modulación adaLN combinada de timestep e instrucción codificada con CLIP, estado introducido como token de acción con dropout de token nulo (p=0,1) y RTC con retardo máximo de 8. La acción es un vector de 37 dimensiones (padded, con yaw objetivo codificado como sin/cos) y el estado propioceptivo es de 36 dimensiones, ambos normalizados con estadísticas min/max.

El fine-tuning se realizó sobre el dataset SIMPLE-decoupled-wbc-MP: 5 tareas, 389 episodios, 141k frames a 50 fps, con 2 episodios por tarea reservados para validación (379 episodios de entrenamiento). Se entrenó durante 40k pasos (unas 75 épocas), batch global 256 (32 × 8 GPUs, DDP, bf16), AdamW con lr 1e-4 (VLM: lenguaje 1e-6, visión 1e-5, proyector 1e-4), scheduler coseno, 2k warmup, weight decay 0,01 y grad clip 1,0. Se aplicó aumento de datos de imagen y vista (recorte aleatorio, escala mínima 0,85), entrada de 180×320, jitter temporal de estado (±10 frames, p=0,5) y ruido gaussiano de estado (σ=0,05). Las demostraciones provienen de un planificador de movimiento (no de teleoperación) y se regrabaron reproduciendo las acciones bajo las ganancias actuales de la mano Dex3 de SIMPLE.

## Capacidades

- Control de cuerpo completo de un humanoide Unitree G1 a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generación de secuencias de acciones de 37 dimensiones con chunk de 30 pasos y horizonte de ejecución configurable (24 en el ejemplo de despliegue).
- Ejecución multi-tarea: las 5 tareas de planificación de movimiento (BendPickAndPlaceOnSofa, BendPick, PickAndBendPlace, TabletopGrasp, TabletopHandover).
- Condicionamiento por instrucción mediante embeddings CLIP agrupados y cacheados.
- Soporte de RTC (real-time chunking) con retardo máximo de 8 para ejecución en tiempo real.
- Integración con el servidor de Psi0 (`serve_psi0_simple`) y el cliente de evaluación de SIMPLE.
- No se documentan capacidades de tool calling, agentes, matemáticas, visión general o audio; el modelo está especializado en robótica.

## Casos de uso

- Manipulación de objetos en escritorio: la política TabletopGrasp permite al G1 agarrar objetos sobre una mesa usando entrada visual de 180×320 y estado propioceptivo de 36 dimensiones, adecuada para tareas de pick-and-place en entornos controlados.
- Recogida con flexión de tronco: la tarea BendPick entrena al robot para agacharse y recoger objetos del suelo, aprovechando el control de cintura codificado en las acciones 28:31.
- Pick-and-place sobre sofá: BendPickAndPlaceOnSofa combina locomoción y manipulación con el flag de giro AMO en la acción 34, útil para escenarios domésticos con obstáculos.
- Handover de objetos entre mesa y humano: TabletopHandover permite transferir objetos en un contexto de mesa, aprovechando el chunk de 30 acciones para secuencias fluidas.
- Evaluación y benchmarking de políticas VLA: el checkpoint se integra con el benchmark SIMPLE (MuJoCo + Isaac Sim) y el dataset SIMPLE-eval para comparar políticas bajo distintos niveles de domain randomization (4 niveles).
- Investigación en flow-matching para robótica: la receta completa (argumentos, configuración, caché CLIP) permite reproducir el entrenamiento y estudiar el efecto de la cabeza DiT y el RTC en el rendimiento.
- Despliegue en simulación a gran escala: el servidor Psi0 permite servir la política por red y ejecutar barridos paralelos de 5 tareas × 4 niveles de DR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos en bf16 ocupan ~11 GB, por lo que se necesita al menos esa cantidad más el overhead del runtime.
- GPU recomendadas: el entrenamiento se realizó con 8 GPUs (DDP, bf16); para inferencia se requiere una GPU con suficiente memoria para los pesos bf16, aunque no se especifica el modelo concreto.
- No se confirma que quepa en GPU de consumo; una RTX 4090 (24 GB) podría alojar los pesos, pero no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: servidor propio de Psi0 (`serve_psi0_simple`) con `--run-dir` y `--ckpt-step=40000`; evaluación mediante contenedor Docker de SIMPLE (`ghcr.io/physical-superintelligence-lab/simple:260829`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Psi0-SIMPLE-decoupled-wbc-MP | no disponible (~11 GB bf16) | no disponible | WBC humanoide G1, 5 tareas MP | Apache 2.0 | Hugging Face |
| Psi0-SIMPLE-decoupled-wbc-Teleop | no disponible | no disponible | WBC humanoide G1, 12 tareas teleop | Apache 2.0 | Hugging Face |
| Psi0 pretrained (psi-model) | no disponible | no disponible | VLM base + cabeza de acciones | no disponible | Hugging Face |

La comparación con otros modelos VLA de robótica (por ejemplo, políticas basadas en RT-2 o OpenVLA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está especializado exclusivamente en las 5 tareas MP de SIMPLE; no es un modelo general de robótica ni de visión-lenguaje.
- No es intercambiable con el checkpoint Teleop: usan controladores de tren inferior distintos (AMO frente a decoupled whole-body controller), agentes de evaluación distintos y convenciones de estado/acción distintas (por ejemplo, `states[28:31]` es la cintura comandada en MP y la medida en Teleop; `action[34]` es flag AMO en MP y vyaw en Teleop).
- Debe evaluarse con el agente `psi0` y el entrypoint `eval` de SIMPLE; usar el agente o entrypoint de Teleop produce resultados incorrectos.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Limitaciones de idioma: no se especifican idiomas soportados; las instrucciones se codifican con CLIP y el dataset es en inglés presumiblemente, pero no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende del backbone Qwen3-VL y de pesos preentrenados de Psi0 cuyas licencias no se detallan en la información disponible.
- Solo se incluyen pesos de inferencia; no hay estado del optimizador ni RNG, por lo que no se puede reanudar el entrenamiento desde este repositorio.
- El dataset MP es aproximadamente un tercio del de Teleop, lo que resulta en ~75 épocas frente a ~22 con los mismos 40k pasos; el sobreajuste es un riesgo a considerar.
- No hay datos publicados de latencia, throughput ni rendimiento en benchmarks, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/USC-PSI-Lab/Psi0-SIMPLE-decoupled-wbc-MP
- Checkpoint Teleop: https://huggingface.co/USC-PSI-Lab/Psi0-SIMPLE-decoupled-wbc-Teleop
- Pesos preentrenados Psi0: https://huggingface.co/USC-PSI-Lab/psi-model
- Dataset de entrenamiento: https://huggingface.co/datasets/USC-PSI-Lab/SIMPLE-decoupled-wbc-MP
- Dataset de evaluación: https://huggingface.co/datasets/USC-PSI-Lab/SIMPLE-eval
- Repositorio Psi0: https://github.com/physical-superintelligence-lab/Psi0
- Benchmark SIMPLE: https://github.com/physical-superintelligence-lab/SIMPLE
- Imagen Docker de SIMPLE: ghcr.io/physical-superintelligence-lab/simple:260829
