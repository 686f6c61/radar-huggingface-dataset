# tmhoanggg/so101-drawer-v2-pi05

## Resumen

`tmhoanggg/so101-drawer-v2-pi05` es un conjunto de checkpoints de políticas de robotica (vision-language-action, VLA) obtenidos mediante fine-tuning de `lerobot/pi05_base` sobre el dataset `tmhoanggg/so101-drawer-v2`. El autor es `tmhoanggg` y el entrenamiento se realizo con LeRobot (commit f5c9bc02). No es un modelo de lenguaje general, sino una política de control para una tarea concreta de manipulacion (apertura de cajon con un brazo SO-101), empaquetada en formato safetensors con un repositorio de 18,7 GB.

El interes tecnico del repositorio no reside en la politica base, sino en la comparativa controlada que propone: la misma receta de entrenamiento se aplica a tres variantes de codificador visual. La primera mantiene el SigLIP propio de pi0.5 congelado (`official_frozen_*`); la segunda sustituye SigLIP por VIRGIL congelado y un proyector nuevo (`virgil_vit_*`); la tercera hace lo mismo con DINOv2-base (`dinov2_*`). Todas comparten hiperparametros, lo que permite aislar el efecto del codificador visual en el rendimiento de la politica.

El modelo es relevante para investigadores en robotica de imitacion que quieran evaluar el impacto de cambiar el backbone visual en arquitecturas VLA del tipo pi0.5, o reutilizar los scripts de rollout e intercambio de encoder incluidos. No hay informacion publicada sobre licencia, idiomas, benchmarks ni pipeline, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (vision encoder + Gemma + action expert) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acciones de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (4 instrucciones de tarea, color de bloque) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La politica parte de `lerobot/pi05_base`, un modelo VLA de tipo pi0.5 que combina un codificador visual, un backbone de lenguaje Gemma y un "action expert" que genera secuencias de acciones. En el fine-tuning se congela el codificador visual y se entrenan Gemma y el action expert. El entrenamiento se realizo durante 30.000 pasos con batch de 64, learning rate de 2,5e-5 con decaimiento a 2,5e-6, warmup de 1.000 pasos, normalizacion por cuantiles, acciones en joints absolutos y chunk de 50. El dataset contiene cuatro instrucciones diferenciadas por color de bloque.

La innovacion principal del repositorio es el protocolo de comparacion de codificadores visuales. Para las variantes `virgil_vit_*` y `dinov2_*` se sustituye el SigLIP original por VIRGIL o DINOv2-base congelados, anadiendo un proyector nuevo entrenado. El repositorio incluye codigo para el rollout (`lerobot_rollout_pi05.py`), el intercambio de encoder (`encoder_swap.py`) y la inyeccion auxiliar (`aux_inject.py`). Las variantes VIRGIL y DINOv2 requieren `github.com/tmhoanggg/r3m` (rama main) en `PYTHONPATH`, y el entorno de rollout se selecciona con la variable `PI05_ENCODER` (`virgil_vit` o `dinov2`). Se distribuyen checkpoints cada 5.000 pasos en carpetas con el patron `<policy>_<k>k`.

## Capacidades

- Generacion de secuencias de acciones de robotica (chunks de 50 pasos) para una tarea de manipulacion con brazo SO-101.
- Control condicionado por instruccion en lenguaje natural, con cuatro instrucciones definidas por color de bloque.
- Percepcion visual mediante codificador congelado (SigLIP, VIRGIL o DINOv2-base segun variante).
- Rollout autonomo en entorno simulado o real mediante el script de LeRobot incluido.
- Intercambio de codificador visual sin reentrenar el resto del pipeline, gracias a `encoder_swap.py`.
- Comparacion controlada de backbones visuales bajo receta identica (mismos hiperparametros y pasos).
- No se documentan capacidades de tool calling, agentes multi-paso, matematicas, codigo ni audio.

## Casos de uso

- Investigacion en robotica de imitacion: usar los checkpoints `official_frozen_*` como linea base y comparar contra `virgil_vit_*` y `dinov2_*` para medir el impacto del codificador visual en la tasa de exito de la tarea.
- Reproduccion de experimentos VLA: el repositorio incluye hiperparametros completos (30k pasos, batch 64, lr, warmup, chunk 50) y checkpoints cada 5k pasos, lo que permite replicar curvas de aprendizaje.
- Evaluacion de encoders visuales alternativos: `encoder_swap.py` y la variable `PI05_ENCODER` permiten probar VIRGIL o DINOv2 sobre la misma politica sin reentrenar el backbone de lenguaje.
- Desarrollo de pipelines de rollout: `lerobot_rollout_pi05.py` sirve como plantilla para integrar la politica en entornos de evaluacion con LeRobot, manteniendo `n_action_steps` y fps constantes entre politicas.
- Estudio de normalizacion y representacion de acciones: el uso de joints absolutos y normalizacion por cuantiles con chunk de 50 es un punto de partida para analizar estabilidad del control.
- Docencia y prototipado en laboratorio: el modelo cabe en un repositorio de 18,7 GB y se puede desplegar en una estacion de trabajo con GPU unica para experimentos de bajo coste.
- Analisis de sensibilidad al lenguaje: con solo cuatro instrucciones de color de bloque, sirve para estudiar el sesgo del condicionamiento textual en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 18,7 GB en safetensors, por lo que se necesita al menos una GPU con memoria suficiente para cargar los pesos completos o aplicar cuantizacion no documentada.
- GPU recomendadas: no disponible. Por tamano de repositorio, una A100 o H100 de 40-80 GB es la opcion conservadora; una RTX 4090 de 24 GB podria ser insuficiente si se carga el modelo completo en fp32 o fp16 sin cuantizar.
- Cabe en consumer GPU: no confirmado; depende de la precision y de si se carga un unico checkpoint o varios.
- Opciones de despliegue: LeRobot con `lerobot_rollout_pi05.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmhoanggg/so101-drawer-v2-pi05` | no disponible | no disponible | VLA para apertura de cajon SO-101 | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| `tmhoanggg/so101-drawer-v2` | no disponible | no disponible | Dataset de entrenamiento | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es una politica especifica para una tarea (apertura de cajon con SO-101) y cuatro instrucciones de color; no generaliza a otras tareas sin reentrenamiento.
- No hay licencia declarada, lo que impide confirmar el uso comercial y obliga a contactar con el autor antes de cualquier despliegue en produccion.
- No se publican benchmarks, tasas de exito ni curvas de evaluacion, por lo que el rendimiento real es desconocido.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion externa.
- Las variantes VIRGIL y DINOv2 dependen de un repositorio externo (`github.com/tmhoanggg/r3m`) en `PYTHONPATH`, lo que anade riesgo de reproducibilidad.
- Riesgo de sobreajuste al dataset `so101-drawer-v2` y a las condiciones de captura del mismo.
- No se documentan sesgos, comportamiento multilingue ni limites de contexto; la evaluacion debe hacerse en el entorno de rollout previsto.
- El tamano del repositorio (18,7 GB) y la ausencia de cuantizaciones documentadas complican el despliegue en hardware de gama media.

## Enlaces

- Hugging Face: https://huggingface.co/tmhoanggg/so101-drawer-v2-pi05
- Dataset de entrenamiento: https://huggingface.co/tmhoanggg/so101-drawer-v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio auxiliar para VIRGIL y DINOv2: https://github.com/tmhoanggg/r3m
- LeRobot (framework de entrenamiento y rollout): https://github.com/huggingface/lerobot
