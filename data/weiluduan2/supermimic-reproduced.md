# weiluduan2/SuperMimic-Reproduced

## Resumen

SuperMimic-Reproduced es una reproducción independiente, desde cero, del método SuperMimic (arXiv:2610.28480, CoRL 2026) para control corporal completo (*whole-body control*) de un humanoide Unitree G1. No es un modelo de lenguaje: es un artefacto de investigación compuesto por un mundo neuronal diferenciable, una política actor-critic con codificador de movimiento y los *checkpoints* resultantes del entrenamiento. Lo publica el usuario weiluduan2 en HuggingFace, con dos pesos entrenados y la documentación del proyecto en chino.

El método original propone sustituir el RL sin modelo a gran escala por un mundo aprendido y diferenciable sobre el que se entrena la política con BPTT de horizonte corto, lo que reduce el coste de entrenamiento a unas pocas horas en una sola GPU. Esta reproducción se apoya en mjlab (MuJoCo Warp, commit `8bb2bc9`), reimplementa sin rsl_rl el mundo, el entrenador BPTT, la librería multi-clip, el muestreo de reinicio por retorno y el benchmark del Apéndice F.

La relevancia inmediata es doble: por un lado, libera pesos entrenados sobre 263,75 horas de BONES-SEED filtrado (129.943 clips) más LAFAN1; por otro, documenta una desviación explícita respecto al paper (observaciones ancla-relativas de estilo BeyondMimic) que eleva el retorno normalizado de 0,56 a 0,904 en LAFAN1, advirtiendo de que esos números no son comparables con los del artículo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mundo neuronal diferenciable (MLP sobre estado de 71 dimensiones, incremento de velocidad con integración explícita, cabeza de terminación y cabezas analíticas de recompensa/observación) + política actor-critic MLP con MotionEncoder (680→32) |
| Parámetros totales | no disponible (el repositorio no publica recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; el horizonte de imaginación usado en los experimentos es H=32) |
| Tipos de cuantización | no disponible (solo se distribuyen *checkpoints* en coma flotante `.pt`) |
| Idiomas soportados | no disponible (no aplica; la documentación del proyecto está en chino) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`ckpt_0084000.pt`, `ckpt_0072000.pt`) acompañados de `config.json` |

## Arquitectura y entrenamiento

La pieza central es un mundo neuronal diferenciable que modela la dinámica del G1 como un MLP sobre un estado de 71 dimensiones, predice incrementos de velocidad con integración explícita e incorpora una cabeza de terminación junto con cabezas analíticas de recompensa y observación. Sobre ese mundo se ejecuta una política *goal-conditioned* (MotionEncoder 680→32 más MLP de política y crítico) entrenada con BPTT de horizonte corto y objetivos tipo Eq. 2 con crítico GAE, siguiendo el bucle del Algorithm A.1 del paper. El entrenamiento usa `torch.compile` (una iteración de imaginación fwd+bwd con lote 2048 y H=32 tarda 0,33 s) y paralelismo de datos con `torchrun` y all-reduce explícito de gradientes, con una eficiencia del 91 % a cuatro GPU.

En datos, la reproducción parte de los 142.220 clips originales de Bones-SEED y aplica el mismo filtrado que el proyecto de referencia (elimina acciones con objetos —silla, mesa, cama— y fragmentos inviables por inestabilidad o penetración del suelo), quedándose en 129.943 clips y 263,75 horas escritas en `train.yaml`. El *checkpoint* de 32 horas se entrenó sobre un subconjunto estratificado por categoría de esa lista: 15.671 clips, ~32,0 horas. El *checkpoint* completo usa todo `train.yaml` más 40 clips de LAFAN1 (441.140 fotogramas). La configuración `deploy_obs` reduce la referencia a 64 dimensiones por fotograma (elimina velocidad lineal de rumbo y altura de la raíz) y añade el heading rot6d del fotograma actual, con aleatorización de dominio: fricción de colisión U[0,3; 1,2] y suelo 0,3, ruido de articulaciones Δq ~ U[-0,01; 0,01], y centro de masa del torso con ±0,025 m en x y ±0,05 m en y/z. Cada GPU ejecuta 4096 entornos. La innovación diferencial frente al RL convencional es que el coste de interacción con el simulador se sustituye por imaginación dentro de un mundo aprendido, lo que permite entrenar con presupuesto de una sola GPU consumer.

## Capacidades

- Seguimiento de movimiento humanoide de cuerpo completo (*motion tracking*) sobre Unitree G1, con política única que cubre toda la librería de clips en lugar de especialistas por movimiento.
- Reproducción determinista de clips completos desde el primer fotograma, sin ruido ni aleatorización de dominio en evaluación (protocolo del Apéndice F).
- Entrenamiento con reinicio muestreado por retorno sobre una librería multi-clip indexada por categoría.
- Mundo diferenciable reutilizable para imaginar rollouts de 8 pasos con error normalizado bajo (0,0065–0,0099).
- Cinemática directa diferenciable (posición y velocidad) del G1 en torch, validada contra MuJoCo con coincidencia de 1e-10 en fp64.
- Soporte de observaciones en dos variantes: la del paper (93 dimensiones propioceptivas, sin estimación de estado) y la ancla-relativa de estilo BeyondMimic (+9 dimensiones en el grupo de objetivo).
- Despliegue de inferencia sobre MuJoCo Warp para reproducción interactiva con visor (teclas N/B para cambiar de clip, D para dataset, M para paso único o bucle abierto).
- Escalado de entrenamiento de una a cuatro GPU mediante paralelismo de datos, y entrenamiento viable en RTX 5090 y en 2×4090.
- No dispone de *tool calling*, capacidades de agente, multimodalidad, visión, audio ni modo de razonamiento: no es un modelo generativo de propósito general.

## Casos de uso

- Investigación en control de humanoides: punto de partida para reproducir o auditar los resultados de SuperMimic sin partir de cero, usando los pesos ya entrenados y las instrucciones de `scripts/play.py`.
- Preentrenamiento de políticas de imitación a gran escala: el *checkpoint* de 263,75 horas de BONES-SEED filtrado sirve como inicialización para ajustes posteriores en un subconjunto de movimientos, reduciendo horas de cómputo frente a entrenar desde ruido.
- Validación de un pipeline de *retargeting*: si un clip nuevo no se sigue correctamente con el modelo completo, es señal de que la conversión CSV/BVH a npz a 50 Hz o el esqueleto de destino presentan problemas.
- Evaluación comparativa de algoritmos de RL: el benchmark del Apéndice F (retorno normalizado con 1,0 como seguimiento perfecto) permite contrastar de forma determinista variantes de mundo, horizonte de BPTT o esquemas de observación.
- Estudio de modelos del mundo diferenciables: la implementación del mundo de 71 dimensiones, sus cabezas analíticas y el entrenador de imaginación son material directo para experimentos de sustitución de dinámica o de error de roll-out a 8 pasos.
- Laboratorio docente con hardware de consumo: al entrenar en una RTX 5090 (4,2–5,8 h para BONES-SEED) o en 2×4090, es viable montar prácticas de *world models* y control sin acceso a clúster.
- Base para transferencia a robot real: las observaciones `deploy_obs` y la aleatorización de fricción, calibración de articulaciones y centro de masa del torso están diseñadas explícitamente para una puesta a punto en la máquina física, aunque el repositorio no documenta validación en hardware.

## Benchmarks y rendimiento

Protocolo del Apéndice F: reproducción determinista de cada clip completo desde el primer fotograma, sin ruido ni aleatorización; retorno normalizado = suma de recompensas por paso / (0,1 × número de pasos), con 1,0 como seguimiento perfecto.

| Experimento | Datos | Hardware | Observación | Tiempo de entrenamiento | Retorno | Fallos |
|---|---|---|---|---|---|---|
| Paper, Fig. 4a | LAFAN1, 40 clips | 1×H100 | Paper | 1,2 h | 0,82 | no disponible |
| e2 (reproducción) | LAFAN1, 40 clips | 1×RTX 5090 | Paper | 1,8 h | 0,56 | 9/40 |
| e3 (reproducción) | LAFAN1, 40 clips | 1×RTX 5090 | Ancla relativa | 1,66 h / 3,3 h | 0,824 / 0,904 | 5/40 / 3/40 |
| Paper, Tabla A.8 | BONES-SEED, 129,5k clips | 1×H100 | Paper | 3 h | >0,90 | 25/129.514 |
| e5 (reproducción) | BONES-SEED, 129,9k clips | 1×RTX 5090 | Ancla relativa | 4,2 h / 5,8 h | 0,934 / 0,935 (subconjunto de 2000) | 6/2000 / 5/2000 |
| e6 / e7 | LAFAN1, 40 clips | 3×RTX 5090 / 1×RTX 5090 | Paper | en curso | no disponible | no disponible |

Métricas adicionales publicadas:

| Métrica | Valor |
|---|---|
| Error normalizado del mundo a 8 pasos en bucle abierto | 0,0065–0,0099 (paper: 0,007–0,011) |
| Rendimiento de simulación con 4096 entornos | ~2×10⁵ env-steps/s en RTX 5090 |
| Iteración de imaginación fwd+bwd (lote 2048, H=32) con `torch.compile` | 0,33 s |
| Eficiencia de paralelismo de datos a 4 GPU | 91 % |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB y los pesos son MLP de pequeña dimensión, pero no se publica consumo de memoria; la reproducción se lanza con `--num-envs 1`.
- GPU empleadas en entrenamiento según el autor: 2×RTX 4090 para el *checkpoint* de 32 horas y 2×A800 para el de datos completos; los experimentos comparativos se ejecutaron en 1×RTX 5090 (hasta 3×5090 para e6) y la referencia del paper en 1×H100.
- Cabe en GPU consumer: sí. El proyecto reporta entrenamiento completo en una RTX 5090 en 4,2–5,8 h y entrenamiento multi-GPU en 2×4090 con 4096 entornos por tarjeta.
- Opciones de despliegue: mjlab (MuJoCo Warp, commit fijado `8bb2bc9`), PyTorch con `torch.compile`, `scripts/train.py` (entrada `sm-train`) y `scripts/play.py` para reproducción interactiva. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y rendimiento: ~2×10⁵ env-steps/s con 4096 entornos en RTX 5090; 0,33 s por iteración de imaginación (lote 2048, H=32) tras compilar; 0,33 s no incluye el resto del bucle de entrenamiento.
- Requisito de entorno: `unset LD_LIBRARY_PATH` antes de lanzar la reproducción, y conservar el `config.json` junto a cada *checkpoint*.

## Comparativa con modelos similares

| Proyecto | Tipo | Datos | Hardware reportado | Resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (weiluduan2) | Reproducción con pesos liberados | BONES-SEED 129,9k (263,75 h) + LAFAN1 | 2×4090, 2×A800, 1×5090 | 0,904 en LAFAN1 (ancla relativa); 0,935 en subconjunto de 2000 de BONES-SEED | no disponible | Pesos `.pt` en HuggingFace |
| SuperMimic original (arXiv:2610.28480) | Método de referencia | LAFAN1 40 clips; BONES-SEED 129,5k | 1×H100 | 0,82 en LAFAN1 en 1,2 h; >0,90 en BONES-SEED en 3 h | no disponible | Sin código oficial publicado |
| Motphys/Uni-SuperMimic | Reproducción downstream sobre UniLab | LAFAN1 (40 movimientos) | no disponible | no disponible | no disponible | Repositorio GitHub con backends mjwarp, MuJoCo y Motrix |
| VeraZhang0311/supermimic_reproduced_hoi | Reproducción no oficial orientada a Fig. 4a | LAFAN1 40 clips (2,45 h) | 1 GPU (no especificada) | no disponible | no disponible | Repositorio GitHub |

Las cifras de este repositorio en los experimentos e3 y e5 usan observaciones ancla-relativas y, según su propio autor, no son comparables con las del paper, que emplea 93 dimensiones propioceptivas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de texto: no admite prompts, tool calling, agentes, visión ni audio. Cualquier evaluación con benchmarks de NLP es improcedente.
- Licencia no declarada: no hay base legal explícita para uso comercial. Antes de cualquier despliegue en producto hay que contactar con el autor o con los titulares de SuperMimic, BONES-SEED y LAFAN1.
- Los *checkpoints* guardan rutas de acciones de la máquina de entrenamiento. La reproducción local exige `--no-from-ckpt-data` y proporcionar `--npz-dir` o `--npz-dirs`.
- Sesgo de datos: el corpus excluye interacciones con objetos (sillas, mesas, camas) y movimientos inestables, de modo que la política no cubre manipulación ni contacto con el entorno.
- La desviación de observaciones respecto al paper (añadir 9 dimensiones ancla-relativas) invalida la comparación directa: con la observación del paper el retorno se queda en 0,56 y los fallos suben a 9 de 40 clips.
- Las cifras de e5 se calcularon sobre un subconjunto de 2000 clips, no sobre las 129,9k completas; los experimentos con protocolo del paper (e6/e7) seguían en curso en la fecha de publicación.
- Riesgo de sobreajuste al simulador: la validación es en MuJoCo Warp y el propio autor describe el robot del visor como simulación. No se documentan pruebas en el G1 físico ni tasas de éxito de sim2real.
- Trazabilidad limitada: 0 descargas y 1 *like* en el momento de la consulta, sin revisión por pares de esta reproducción, y documentación únicamente en chino (`docs/PAPER_SPEC.md`, `REPRODUCTION_PLAN.md`, `REVIEW_LOG.md`, `EXPERIMENTS.md`).
- Un solo embodiment: todo el pipeline está acoplado al Unitree G1 (FK diferenciable, esqueleto de 50 Hz); no hay garantía de transferencia a otro humanoide sin rehacer la cinemática y el *retargeting*.
- El identificador arXiv y las fechas del repositorio (octubre de 2026) deben verificarse en el momento de citar; los metadatos de la model card están incompletos (sin pipeline, sin idiomas, sin licencia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weiluduan2/SuperMimic-Reproduced
- Checkpoint de 32 horas (BONES-SEED): https://huggingface.co/weiluduan2/SuperMimic-Reproduced/blob/main/1022_SM_Reproduced_Bones32h_DeployObs_Shards_2x4090_N4096_4185/ckpt_0084000.pt
- Checkpoint de datos completos (LAFAN1 + BONES-SEED): https://huggingface.co/weiluduan2/SuperMimic-Reproduced/blob/main/1022_SM_Reproduced_LafanBones_DeployObs_Shards_2xA800_N4096_4189/ckpt_0072000.pt
- Paper original (arXiv:2610.28480): https://arxiv.org/abs/2610.28480
- Proyecto base de la reproducción citado en la model card: https://github.com/CuboiLeo/SuperMimic-Reproduced
- Reproducción downstream sobre UniLab: https://github.com/Motphys/Uni-SuperMimic
- Reproducción no oficial orientada a Fig. 4a: https://github.com/VeraZhang0311/supermimic_reproduced_hoi
- Análisis divulgativo del método: https://www.explainx.ai/blog/supermimic-berkeley-humanoid-whole-body-control-one-gpu-3-hours-differentiable-world-model-unitree-g1-2026
- Artículo de revisión en CSDN: https://blog.csdn.net/qq_56908984/article/details/168752773
- mjlab (MuJoCo Warp), dependencia fijada al commit `8bb2bc9`: https://github.com/mujocolab/mjlab
