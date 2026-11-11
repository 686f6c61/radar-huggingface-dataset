# USC-PSI-Lab/Psi0-SIMPLE-decoupled-wbc-Teleop

## Resumen

Psi0-SIMPLE-decoupled-wbc-Teleop es una política robótica multi-tarea desarrollada por el laboratorio USC-PSI-Lab para el robot humanoide Unitree G1, equipado con un controlador de cuerpo completo (WBC) desacoplado. Se trata de un modelo de tipo VLA (vision-language-action) construido sobre el backbone Qwen3-VL, con una cabeza de acciones basada en flow-matching, y afinado sobre las 12 tareas teleoperadas del conjunto de datos SIMPLE-decoupled-wbc-Teleop. El modelo se evalúa en el benchmark SIMPLE, que combina física de MuJoCo con renderizado de Isaac Sim.

El modelo parte de un VLM preentrenado de Psi0 y de una cabeza de acciones post-preentrenada, y se ajusta con 40.000 pasos sobre 1.128 episodios (465.000 fotogramas a 50 fps). La salida es una acción de 37 dimensiones (con yaw objetivo codificado como seno/coseno) a partir de un estado propioceptivo de 36 dimensiones y de instrucciones en lenguaje natural. Su relevancia actual radica en que aborda el control de cuerpo completo de un humanoide realista en un entorno simulado de alta fidelidad, con soporte para retardo de ejecución (RTC) y decodificación por chunks.

El repositorio contiene únicamente los pesos de inferencia en formato safetensors (bf16, aproximadamente 11 GB), junto con la configuración de ejecución y la caché de embeddings CLIP de las instrucciones de entrenamiento. No incluye estado del optimizador ni estados RNG. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone VLM Qwen3-VL + cabeza de acciones flow-matching DiT de 12 bloques |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~11 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone VLM Qwen3-VL con una cabeza de acciones de flow-matching basada en un DiT de 12 bloques, entrenada con 1.000 pasos de difusión. La fusión entre el VLM y la cabeza de acciones es layer-wise, y el condicionamiento se realiza mediante adaLN combinando el timestep y el embedding CLIP de la instrucción (pooled). El estado propioceptivo se introduce como un token de acción adicional con dropout de token nulo (p=0,1). La predicción se organiza en chunks de 30 acciones y se aplica RTC (real-time chunking) con un retardo máximo de 8.

El entrenamiento parte de un VLM preentrenado de Psi0 (`pre.fast.1by1.2601091803.ckpt.ego200k.he30k`) y de una cabeza de acciones post-preentrenada (`postpre.1by1.pad36.2601131206.ckpt.he30k`). Se ajusta durante 40.000 pasos con batch global de 256 (32 × 8 GPUs, DDP, bf16), AdamW con lr 1e-4 y tasas diferenciadas para el VLM (lenguaje 1e-6, visión 1e-5, proyector 1e-4), schedule coseno, 2.000 pasos de warmup, weight decay 0,01 y grad clip 1,0. Los datos son 12 tareas, 1.128 episodios y 465.000 fotogramas a 50 fps, con 2 episodios por tarea reservados para validación. Se aplica aumento de imagen y vista (recorte aleatorio, escala mínima 0,85), entrada de 180×320, jitter temporal del estado (±10 fotogramas, p=0,5) y ruido gaussiano en el estado (σ=0,05). La normalización de acciones y estado es min/max ("bounds").

## Capacidades

- Generación de acciones de cuerpo completo para el humanoide Unitree G1 a partir de observaciones visuales, estado propioceptivo e instrucciones en lenguaje natural.
- Control multi-tarea: 12 tareas teleoperadas (BendHandover, BendPickAndPlace, BendPick, CloseDoor, Handover, LocomotionPickBetweenTables, OpenFaucet, OpenOven, OpenTrashCan, PickAndPlaceAndHugContainer, PushOfficeChair, XMovePick).
- Predicción de chunks de acciones (chunk 30) con ejecución parcial y RTC para tolerar retardos de inferencia.
- Condicionamiento por instrucción en lenguaje natural mediante embeddings CLIP.
- Fusión layer-wise entre el VLM y la cabeza de acciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación bimanual con flexión del torso: el modelo ejecuta tareas como BendPick o BendPickAndPlace combinando locomoción y manipulación, adecuado por su acción de 37 dimensiones que cubre cuerpo completo.
- Apertura y cierre de puertas y cajones: tareas CloseDoor, OpenOven y OpenTrashCan se benefician del control desacoplado de cuerpo completo para alcanzar y accionar mecanismos.
- Interacción con grifos y objetos articulados: OpenFaucet requiere control fino de la mano y del brazo, cubierto por la cabeza de acciones con chunks de 30 pasos.
- Locomoción con manipulación: LocomotionPickBetweenTables y XMovePick combinan desplazamiento y agarre, aprovechando el estado propioceptivo de 36 dimensiones.
- Entrega de objetos a humanos: Handover y BendHandover usan el condicionamiento por instrucción para seleccionar la tarea y ejecutar la entrega.
- Empuje de mobiliario: PushOfficeChair emplea el control de cuerpo completo para aplicar fuerza coordinada.
- Evaluación de políticas en simulación: el modelo se integra en el benchmark SIMPLE (MuJoCo + Isaac Sim) para barridos de 12 tareas × 4 niveles de domain randomization.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos de inferencia en bf16 de aproximadamente 11 GB; se necesita VRAM adicional para activaciones y para el renderizado de Isaac Sim en el bucle de evaluación.
- GPU recomendadas: no disponible de forma explícita; el entrenamiento usó 8 GPUs con batch 32 por GPU, lo que sugiere GPUs de clase A100/H100.
- No se documenta si cabe en GPU de consumo; con 11 GB en bf16, una RTX 4090 (24 GB) podría alojar los pesos, pero no se confirma.
- Despliegue mediante el servidor `serve_psi0_simple` del repositorio Psi0, con `--run-dir`, `--ckpt-step=40000`, `--action-exec-horizon=24` y `--rtc`.
- Evaluación mediante la imagen Docker `ghcr.io/physical-superintelligence-lab/simple:260829` y `docker compose`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- El modelo está especializado en el Unitree G1 con WBC desacoplado y en las 12 tareas de SIMPLE-decoupled-wbc-Teleop; no se documenta generalización a otros robots o tareas.
- Solo se incluyen pesos de inferencia; no hay estado del optimizador ni RNG, por lo que no es reanudable para entrenamiento.
- Los idiomas soportados no están documentados; el condicionamiento por instrucción usa embeddings CLIP de las instrucciones de entrenamiento.
- Riesgo de alucinación y sesgos: no documentado.
- La evaluación se realiza en simulación (MuJoCo + Isaac Sim); el rendimiento en hardware real no está reportado.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre el comportamiento en producción.
- El primer arranque de Isaac Sim puede tardar varios minutos adicionales por la construcción de cachés.

## Enlaces

- Hugging Face: https://huggingface.co/USC-PSI-Lab/Psi0-SIMPLE-decoupled-wbc-Teleop
- Dataset: https://huggingface.co/datasets/USC-PSI-Lab/SIMPLE-decoupled-wbc-Teleop
- Repositorio Psi0: https://github.com/physical-superintelligence-lab/Psi0
- Repositorio SIMPLE: https://github.com/physical-superintelligence-lab/SIMPLE
- Pesos base Psi0: https://huggingface.co/USC-PSI-Lab/psi-model
