# USC-PSI-Lab/Psi0-SIMPLE-Decoupled-wbc-Teleop

## Resumen

Psi0 · SIMPLE Decoupled-WBC Teleop es una política robótica multi-tarea desarrollada por USC-PSI-Lab para el robot humanoide Unitree G1. Se trata de un modelo de visión-lenguaje-acción (VLA) construido sobre el backbone Qwen3-VL y afinado sobre las 12 tareas teleoperadas del conjunto de datos SIMPLE-decoupled-wbc-Teleop, con un controlador de cuerpo completo (WBC) desacoplado. El modelo resuelve el problema de mapear instrucciones en lenguaje natural e imágenes de cámara a secuencias de acciones de control de cuerpo completo en un humanoide, y es relevante porque ofrece un punto de partida reproducible y evaluable para investigación en manipulación y locomoción combinadas.

La arquitectura combina un VLM preentrenado con una cabeza de acción basada en flow matching implementada como un Diffusion Transformer (DiT) de 12 bloques. La fusión entre el VLM y la cabeza de acción es por capas, con condicionamiento adaLN sobre el paso de difusión y el embedding CLIP de la instrucción. El modelo se distribuye como un directorio de ejecución de Psi0 listo para servir con el servidor de políticas del repositorio, con pesos en bf16 de aproximadamente 11 GB.

El modelo se publica bajo licencia Apache 2.0, no reporta métricas de benchmarks en la información disponible y está pensado para evaluación en el benchmark SIMPLE (física MuJoCo con renderizado Isaac Sim), no para despliegue comercial directo sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL + cabeza de acción flow-matching DiT de 12 bloques con fusión por capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~11 GB), más `run_config.json`, `argv.txt` y caché CLIP en `.pt` |

## Arquitectura y entrenamiento

El modelo parte de un VLM Psi0 preentrenado con backbone Qwen3-VL (checkpoint `pre.fast.1by1.2601091803.ckpt.ego200k.he30k`) y de una cabeza de acción post-preentrenada (`postpre.1by1.pad36.2601131206.ckpt.he30k`), ambos en el repositorio USC-PSI-Lab/psi-model. Sobre esta base se añade una cabeza de acción de flow matching con un DiT de 12 bloques y 1000 pasos de entrenamiento, con chunks de 30 acciones, fusión por capas con el VLM, condicionamiento adaLN combinado de paso de tiempo y embedding CLIP de la instrucción, y el estado proprioceptivo tratado como token de acción con dropout de token nulo (p=0.1). Incorpora Real-Time Chunking (RTC) con retardo máximo de 8.

El ajuste fino se realizó sobre SIMPLE-decoupled-wbc-Teleop: 12 tareas, 1128 episodios, 465k fotogramas a 50 fps, con 2 episodios por tarea reservados para validación. La acción es de 37 dimensiones (con padding y yaw objetivo codificado como seno/coseno) y el estado proprioceptivo de 36 dimensiones, con normalización min/max. El entrenamiento usó 40k pasos, batch global 256 (32 × 8 GPUs, DDP, bf16), AdamW con lr 1e-4 (lenguaje 1e-6, visión 1e-5, proyector 1e-4), schedule coseno, 2k de warmup, weight decay 0.01 y grad clip 1.0. Como aumentación se aplicaron recortes aleatorios de imagen (escala mínima 0.85) a 180×320, jitter temporal de estado (±10 fotogramas, p=0.5) y ruido gaussiano de estado (σ=0.05).

## Capacidades

- Control de cuerpo completo de un humanoide Unitree G1 a partir de instrucciones en lenguaje natural e imágenes.
- Ejecución multi-tarea: 12 tareas teleoperadas (handover, pick and place, abrir puerta, abrir grifo, abrir horno, abrir cubo de basura, empujar silla de oficina, locomoción entre mesas, etc.).
- Generación de acciones por chunks de 30 pasos con flow matching y soporte de Real-Time Chunking para inferencia en tiempo real.
- Condicionamiento por instrucción mediante embedding CLIP pooled cacheado.
- Fusión multimodal visión-lenguaje-estado proprioceptivo.
- No se documenta soporte de tool calling, agentes multi-paso ni capacidades de audio.

## Casos de uso

- Investigación en manipulación humanoide: servir la política con `serve_psi0_simple` y evaluar las 12 tareas en SIMPLE para comparar variantes de arquitectura o datos.
- Evaluación de robustez ante domain randomization: el barrido de 12 tareas × 4 niveles de DR permite medir la degradación del controlador bajo perturbaciones físicas y visuales.
- Desarrollo de controladores de cuerpo completo desacoplados: el modelo sirve como referencia entrenada para estudiar la interfaz entre política VLA y WBC.
- Reproducción de experimentos: el repositorio incluye `argv.txt`, `run_config.json` y el script `finetune-simple-decoupled-wbc.sh`, lo que permite reentrenar y comparar.
- Benchmarking de VLAs en robótica: uso como baseline multi-tarea en el benchmark SIMPLE con física MuJoCo y renderizado Isaac Sim.
- Prototipado de tareas de asistencia doméstica simulada: apertura de puertas, grifos, hornos y cubos de basura, así como pick and place y handover, en entorno simulado antes de transferencia a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16 de aproximadamente 11 GB; el repositorio completo ocupa 11.2 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de pesos, se requiere al menos una GPU con más de 11 GB de VRAM para cargar el modelo en bf16, más overhead del backbone VLM y del servidor.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs (DDP, bf16, batch 32 por GPU), sin especificar modelo.
- Despliegue: servidor propio del repositorio Psi0 (`serve_psi0_simple` o `scripts/deploy/serve_psi0_simple.sh`) con `--run-dir` apuntando al directorio descargado y `--ckpt-step=40000`.
- Evaluación: imagen Docker `ghcr.io/physical-superintelligence-lab/simple:260829` con `--sim-mode=mujoco_isaac`; el barrido paralelo lanza un servidor y un cliente por GPU en tmux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado y validado exclusivamente en simulación (SIMPLE: MuJoCo + Isaac Sim); no hay evidencia de transferencia a hardware real.
- Solo cubre las 12 tareas del dataset SIMPLE-decoupled-wbc-Teleop y el robot Unitree G1; no es un modelo general de robótica.
- No se publican métricas de éxito, tasas de fallo ni benchmarks, por lo que el rendimiento real es desconocido.
- Idiomas soportados no disponibles; el condicionamiento por instrucción depende de embeddings CLIP cacheados de las instrucciones de entrenamiento.
- Riesgo de sobreajuste a las condiciones del simulador y a la distribución de las instrucciones de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación fuera de simulación hace desaconsejable su uso en producción sin evaluación propia.
- Solo se incluyen pesos de inferencia; no hay estados de optimizador ni RNG, lo que limita la reanudación exacta del entrenamiento.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no hay comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/USC-PSI-Lab/Psi0-SIMPLE-Decoupled-wbc-Teleop
- Dataset: https://huggingface.co/datasets/USC-PSI-Lab/SIMPLE-decoupled-wbc-Teleop
- Pesos base Psi0: https://huggingface.co/USC-PSI-Lab/psi-model
- Repositorio Psi0: https://github.com/physical-superintelligence-lab/Psi0
- Repositorio SIMPLE: https://github.com/physical-superintelligence-lab/SIMPLE
