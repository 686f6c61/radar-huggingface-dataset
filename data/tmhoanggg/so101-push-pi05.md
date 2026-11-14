# tmhoanggg/so101-push-pi05

## Resumen

`tmhoanggg/so101-push-pi05` es un conjunto de checkpoints de fine-tuning del modelo de robotica `lerobot/pi05_base` (pi0.5), publicado por el usuario tmhoanggg en Hugging Face. El modelo se ha entrenado con LeRobot (commit f5c9bc02) sobre el dataset `tmhoanggg/so101-push`, una tarea de manipulacion robotica con el brazo SO-101 en la que el robot empuja objetos. No es un modelo de lenguaje generalista, sino una politica visomotora (vision-language-action) para control de robots.

El repositorio contiene multiples variantes experimentales organizadas por carpeta, cada una correspondiente a un checkpoint cada 5.000 pasos y a una configuracion de encoder visual distinta: SigLIP congelado (configuracion oficial de pi0.5), VIRGIL, DINOv2-base, y una rama lateral ("option-3") que inyecta caracteristicas de un encoder auxiliar. La receta comun es: encoder visual congelado, Gemma + action expert entrenados, 30.000 pasos con batch 64, learning rate de 2,5e-5 a 2,5e-6, warmup de 1.000 pasos, acciones en articulaciones absolutas, chunk de 50 y normalizacion por cuantiles. Solo se usan las camaras SIDE y de muneca; la camara frontal no se utiliza.

La relevancia de esta publicacion es de investigacion: sirve como banco de comparacion de encoders visuales para politicas VLA en una tarea concreta de robotica de bajo coste (SO-101). No hay informacion sobre licencia, idiomas ni benchmarks estandar de NLP, y el tamano del repositorio (51,4 GB) refleja la acumulacion de decenas de checkpoints, no un unico modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5: encoder visual (SigLIP, VIRGIL o DINOv2-base) + Gemma + action expert |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la implementacion de pi0.5 en LeRobot, y se fine-tunea sobre la tarea `so101-push`. La arquitectura combina un encoder visual congelado con un backbone Gemma y un "action expert" entrenable que genera secuencias de acciones en chunks de 50 pasos. Las acciones se representan como articulaciones absolutas (salvo la variante `official_frozen_relative_*`, que usa articulaciones relativas con pinza absoluta) y se normalizan por cuantiles.

El entrenamiento sigue una receta unica para todas las filas: 30.000 pasos, batch 64, learning rate con decaimiento de 2,5e-5 a 2,5e-6, warmup de 1.000 pasos y solo las camaras SIDE y de muneca como entrada visual. La innovacion principal del repositorio es la comparacion sistematica de encoders visuales: SigLIP original congelado, VIRGIL y DINOv2-base sustituidos con un nuevo proyector, y una rama lateral "option-3" que inyecta caracteristicas de un encoder auxiliar (L_pred + delta L_sem, con 55,08 en LIBERO segun la model card) mientras se entrena tanto pi0.5 como la rama. Tambien hay variantes DynaFLIP (apendice D.4, pi05_base congelado + rama lateral, 10.000 pasos x 32, lr 1,5e-5) y `virgil_vit_swapv2_*` con entrenamiento en dos fases (2.000 pasos solo proyector con lr 1e-4, luego la receta, con augmentacion de imagen).

## Capacidades

- Control visomotor de un brazo robotico SO-101 para la tarea de empujar objetos (`so101-push`).
- Generacion de secuencias de acciones en chunks de 50 pasos a partir de observaciones de camara SIDE y de muneca.
- Soporte de multiples configuraciones de encoder visual (SigLIP, VIRGIL, DINOv2-base) y de inyeccion de caracteristicas auxiliares mediante rama lateral.
- Soporte de acciones en articulaciones absolutas y, en una variante, relativas con pinza absoluta.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues; es una politica de robotica, no un modelo de lenguaje de proposito general.
- No se documentan capacidades de vision general (captioning, VQA) ni de audio.

## Casos de uso

- Investigacion en encoders visuales para VLA: comparar SigLIP, VIRGIL y DINOv2-base bajo la misma receta de entrenamiento en una tarea de manipulacion reproducible con SO-101, usando las carpetas `official_frozen_*`, `virgil_vit_*` y `dinov2_*`.
- Reproduccion de experimentos de fine-tuning: el repositorio incluye el codigo (`lerobot_rollout_pi05.py`, `encoder_swap.py`, `aux_inject.py`) para replicar el entrenamiento y el rollout con LeRobot en el commit f5c9bc02.
- Evaluacion de inyeccion de caracteristicas auxiliares: las variantes `option3_virgil_pred_*` y `option3_<enc>_*` permiten medir el efecto de una rama lateral con un encoder auxiliar sobre el rendimiento de la politica.
- Estudio de estrategias de congelacion y swap de encoders: las variantes `virgil_vit_swapv2_*` y `dynaflip_<enc>_*` permiten analizar el impacto de entrenar solo el proyector frente a entrenar el modelo completo.
- Benchmarking de representaciones de acciones: la variante `official_frozen_relative_*` (solo para la tarea drawer) permite comparar acciones absolutas frente a relativas con pinza absoluta.
- Docencia y prototipado en robotica de bajo coste: el brazo SO-101 y la tarea de empuje son un entorno asequible para ensenar pipelines VLA completos (dataset, entrenamiento, rollout) sin necesidad de hardware industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un valor de 55,08 en LIBERO para el encoder principal de la rama option-3, pero no se aportan resultados comparativos de la tarea `so101-push` ni metricas de exito por checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 51,4 GB por la acumulacion de checkpoints, no por el tamano de un unico modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot con el script `code/lerobot_rollout_pi05.py`; VIRGIL y DINOv2 requieren `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmhoanggg/so101-push-pi05` | no disponible | no disponible | Empuje con SO-101 | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | Base VLA pi0.5 | no disponible | Hugging Face |
| Otros fine-tunes de pi0.5 sobre SO-101 | no disponible | no disponible | Manipulacion SO-101 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (`so101-push`) y un unico entorno (brazo SO-101); no es un modelo de proposito general.
- Solo usa las camaras SIDE y de muneca; la camara frontal no se utiliza, lo que limita la percepcion a esa configuracion concreta.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial queda sin regularizar y requiere consulta al autor.
- No hay informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion; en robotica, la generalizacion a objetos, iluminacion o posiciones no vistas no esta garantizada.
- El repositorio contiene decenas de checkpoints experimentales (51,4 GB); es necesario seleccionar la carpeta concreta y respetar el mismo `n_action_steps` y fps en el rollout, segun indica el autor.
- Las variantes VIRGIL y DINOv2 requieren dependencias externas (`r3m`) en `PYTHONPATH`, lo que anade complejidad de despliegue.
- No hay resultados de benchmarks publicados para la tarea, por lo que no se puede verificar el rendimiento real de cada checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-push-pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/tmhoanggg/so101-push
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de codigo auxiliar (VIRGIL, DINOv2): https://github.com/tmhoanggg/r3m
- LeRobot (framework de entrenamiento y rollout): https://github.com/huggingface/lerobot
