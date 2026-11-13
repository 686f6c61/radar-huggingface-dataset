# tmhoanggg/so101-fold-towel-pi05

## Resumen

`tmhoanggg/so101-fold-towel-pi05` es un conjunto de checkpoints de políticas de robotica (vision-language-action, VLA) derivadas de `lerobot/pi05_base`, el modelo base pi0.5 de Physical Intelligence distribuido a traves de LeRobot. El autor, tmhoanggg, ha realizado un fine-tuning sobre el dataset propio `tmhoanggg/so101-fold-towel`, que corresponde a la tarea de doblar toallas con un brazo robotico SO-101. No es un modelo de lenguaje general: es un artefacto de investigacion para control robotico de una tarea concreta.

El repositorio no contiene un unico modelo, sino una familia de variantes experimentales organizadas por carpeta y por checkpoint (cada 5.000 pasos). La receta comun es: encoder de vision congelado, Gemma y el experto de acciones entrenados, 30.000 pasos con batch 64, learning rate de 2,5e-5 con decaimiento a 2,5e-6, warmup de 1.000 pasos, acciones en articulaciones absolutas, chunk de 50 y normalizacion por cuantiles. La diferencia entre variantes es el encoder visual (SigLIP original, VIRGIL, DINOv2) y si se usa una rama lateral auxiliar (option-3, DynaFLIP).

Su relevancia es acotada: sirve como material reproducible para estudiar el intercambio de encoders visuales en políticas VLA y la inyeccion de ramas auxiliares, no como modelo listo para produccion. El tamano del repositorio (76,1 GB) refleja la acumulacion de multiples checkpoints de un modelo de varios miles de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (transformer con encoder visual SigLIP y experto de acciones; Gemma como componente de lenguaje segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La politica parte de `lerobot/pi05_base` y sigue la receta de LeRobot (commit f5c9bc02). El entrenamiento congela el encoder visual y entrena el bloque Gemma junto con el experto de acciones. Se usan 30.000 pasos con batch 64, learning rate 2,5e-5 con decaimiento hasta 2,5e-6 y warmup de 1.000 pasos. Las acciones se representan como articulaciones absolutas (salvo la variante `official_frozen_relative_*`, que usa acciones relativas con pinza absoluta), con chunk de 50 y normalizacion por cuantiles. Solo se emplean las camaras SIDE y de muneca; la camara frontal no se usa.

El repositorio compara varias estrategias de encoder visual: SigLIP propio de pi0.5 congelado (`official_frozen_*`), VIRGIL congelado con nuevo proyector (`virgil_vit_*`), DINOv2-base congelado con nuevo proyector (`dinov2_*`) y la variante principal `option3_virgil_pred_*`, que introduce el encoder del metodo principal (L_pred + delta L_sem, LIBERO 55,08) en una rama lateral option-3. Tambien hay variantes `option3_<enc>_*` y `dynaflip_<enc>_*` (solo para stack-cup) que combinan pi0.5 con una rama lateral, y `virgil_vit_swapv2_*` con entrenamiento en dos etapas (2.000 pasos solo de proyector a lr 1e-4 y luego la receta completa, con aumento de imagen). Cada checkpoint se guarda cada 5.000 pasos en carpetas con el nombre `<policy>_<k>k`.

## Capacidades

- Control robotico de una tarea concreta: doblado de toallas con un brazo SO-101 a partir de observaciones visuales (camaras SIDE y de muneca).
- Generacion de acciones en espacio de articulaciones absolutas con chunk de 50 pasos.
- Intercambio de encoder visual en tiempo de ejecucion mediante variables de entorno (`PI05_ENCODER=virgil_vit`, `PI05_ENCODER=dinov2`).
- Activacion de ramas auxiliares mediante `PI05_AUX` (`virgil_pred`, `virgil_vit`, `dinov2`).
- Evaluacion comparativa de encoders y de estrategias de congelacion/descongelacion en un mismo entorno de rollout.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingueismo.

## Casos de uso

- Reproduccion de experimentos de intercambio de encoder: usar `official_frozen_*` como linea base y comparar con `virgil_vit_*` y `dinov2_*` bajo el mismo `n_action_steps` y fps, tal como indica la model card.
- Estudio de ramas auxiliares en VLA: evaluar `option3_virgil_pred_*` frente a `official_frozen_*` para medir el efecto de la rama lateral option-3 en la tarea de doblado.
- Benchmark interno de recetas de congelacion: comparar checkpoints cada 5.000 pasos para analizar la curva de aprendizaje del experto de acciones con encoder congelado.
- Prueba de despliegue en LeRobot: ejecutar `code/lerobot_rollout_pi05.py` con los argumentos de rollout de LeRobot y `--policy.path=<folder>` para validar la integracion en un pipeline existente.
- Investigacion sobre aumento de imagen y entrenamiento en dos etapas: usar `virgil_vit_swapv2_*` como referencia de receta alternativa (solo tarea stack-cup).
- Analisis de representacion de acciones: comparar `official_frozen_relative_*` (acciones relativas, pinza absoluta, solo tarea drawer) con la variante absoluta para estudiar el efecto en el control.
- Docencia y divulgacion: ilustrar como se estructura un repositorio multi-checkpoint de VLA y como se separan variantes por carpeta y variable de entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona un valor de LIBERO 55,08 asociado al encoder del metodo principal (`L_pred + delta L_sem`), sin tabla comparativa ni detalle de metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 76,1 GB e incluye multiples checkpoints, no un unico modelo; el peso de un checkpoint individual no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: rollout mediante LeRobot con el script `code/lerobot_rollout_pi05.py`; VIRGIL y DINOv2 requieren `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmhoanggg/so101-fold-towel-pi05` | no disponible | no disponible | Doblado de toallas SO-101 | no disponible | Hugging Face (repo de 76,1 GB) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face via LeRobot |
| `tmhoanggg/so101-fold-towel` (dataset) | no aplica | no aplica | Dataset de la tarea | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento, contexto o parametros con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de tarea unica: entrenado para doblar toallas con un SO-101; no generaliza a otras tareas ni a otros robots sin nuevo fine-tuning.
- Solo usa las camaras SIDE y de muneca; la camara frontal se descarta explicitamente, lo que limita la informacion visual disponible.
- Multiples variantes con nombres y variables de entorno distintos (`PI05_ENCODER`, `PI05_AUX`); usar la combinacion incorrecta invalida los resultados.
- Algunas variantes (`option3_<enc>_*`, `dynaflip_<enc>_*`, `virgil_vit_swapv2_*`) solo estan entrenadas para la tarea stack-cup, no para doblado de toallas.
- Dependencia de codigo externo: VIRGIL y DINOv2 requieren el repositorio `r3m` del autor en `PYTHONPATH`.
- La model card exige usar el mismo `n_action_steps` y fps en todas las politicas para que la comparacion sea valida.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribucion.
- Riesgo de sobreajuste a la configuracion fisica del SO-101 y al dataset concreto; no se documentan evaluaciones fuera de distribucion.
- Riesgo de alucinacion en el sentido de acciones no validas fisicamente: no se documentan salvaguardas ni limites de seguridad en el rollout.
- El repositorio acumula checkpoints de 5.000 en 5.000 pasos; conviene verificar cual es el checkpoint final antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmhoanggg/so101-fold-towel-pi05
- Dataset asociado: https://huggingface.co/datasets/tmhoanggg/so101-fold-towel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Codigo de soporte (VIRGIL, DINOv2): https://github.com/tmhoanggg/r3m
- LeRobot (framework de entrenamiento y rollout): https://github.com/huggingface/lerobot
