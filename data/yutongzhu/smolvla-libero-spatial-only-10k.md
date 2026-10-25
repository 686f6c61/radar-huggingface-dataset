# yutongzhu/smolvla-libero-spatial-only-10k

## Resumen

`yutongzhu/smolvla-libero-spatial-only-10k` es un checkpoint de política viso-lenguaje-acción (VLA) para robótica de manipulación, obtenido por ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre el subconjunto LIBERO-Spatial del dataset `lerobot/libero`. El autor lo plantea explícitamente como un experimento de mezcla de datos: entrenar 10.000 pasos utilizando únicamente las 432 demostraciones de LIBERO-Spatial (aproximadamente el 26 % de los episodios totales de LIBERO), en lugar de los cuatro subconjuntos completos.

El modelo tiene 450.046.176 parámetros (unos 450 M) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB, por lo que es ligero y desplegable en una única GPU de consumo. Su relevancia actual es metodológica: el autor demuestra que, en la tarea objetivo, un ajuste fino estrecho y más corto iguala estadísticamente a un ajuste con datos mezclados y el doble de pasos, lo que cuestiona la necesidad de mezclar subconjuntos cuando el dominio de evaluación está bien delimitado.

La ficha se basa exclusivamente en la model card del autor, los metadatos de HuggingFace y los resultados declarados en el `model-index`. Cualquier dato no publicado se marca como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de tipo transformer, derivada de `lerobot/smolvla_base`; detalles internos del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en safetensors (precision de entrenamiento/evaluacion declarada FP32 en la evaluacion); no se han publicado variantes GGUF, INT8 o INT4 para este checkpoint |
| Idiomas soportados | La model card declara `zh`; se trata de una politica robotica con instrucciones de tarea, no de un modelo conversacional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Pipeline | robotics |
| Tamano del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Dataset de entrenamiento | `lerobot/libero`, subconjunto `libero_spatial`, 432 episodios |
| Pasos de entrenamiento | 10.000, batch size 32 |
| Hardware de entrenamiento | 1 x NVIDIA RTX 4090 |

## Arquitectura y entrenamiento

Se trata de un fine-tune de `lerobot/smolvla_base`, un modelo de la familia SmolVLA integrado en el ecosistema LeRobot, que combina percepcion visual (imagenes de camara), instruccion de tarea en lenguaje y salida de acciones motoras. El checkpoint hereda la configuracion del modelo base, con 450 M de parametros; la model card no detalla el numero de capas, la dimension del backbone de vision-lenguaje ni el mecanismo exacto de generacion de acciones, por lo que esos datos se consideran no disponibles.

El entrenamiento consistio en 10.000 pasos con batch size 32 sobre las 432 demostraciones de LIBERO-Spatial, partiendo de los pesos preentrenados, en una unica RTX 4090. Un detalle tecnico relevante: aunque solo se usan episodios de un subconjunto, LeRobot aplica las estadisticas de normalizacion del dataset completo (`meta/stats.json`), lo que afecta a la escala de las acciones y debe reproducirse para replicar el resultado. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

Como el modelo es una politica, la innovacion destacable no esta en la arquitectura sino en el diseno experimental: comparacion por pares episodio a episodio contra el modelo entrenado con los cuatro subconjuntos, con test exacto de McNemar y uso de 100 rollouts por configuracion con semilla fija (1000) para acotar la varianza.

## Capacidades

- Control robotico de manipulacion: genera secuencias de acciones a partir de observaciones visuales e instrucciones de tarea en entornos LIBERO.
- Ejecucion en bucle cerrado (closed-loop): la evaluacion se realizo con `n_action_steps=10` y 10 pasos de desruido, reevaluando la observacion periodicamente.
- Percepcion multi-camara: la configuracion de ejemplo mapea dos camaras (`observation.images.image`, `observation.images.image2`) a `camera1` y `camera2`.
- Condicionamiento por instruccion de tarea en el formato del benchmark LIBERO (las instrucciones del dataset estan en ingles dentro del entorno de simulacion; el tag de idioma declarado es `zh`).
- Integracion nativa con LeRobot: carga mediante `lerobot-eval` y `--policy.path`.
- No dispone de capacidades de chat, generacion de texto libre, codigo, matematicas, tool calling ni razonamiento multi-paso en el sentido de un LLM; no se ha documentado soporte de agentes.

## Casos de uso

- Evaluacion comparativa de mezclas de datos en investigacion VLA: sirve como condicion experimental «solo subconjunto objetivo» frente a `smolvla-libero-ft20k`, con codigo y resultados publicados en el repositorio del autor para reproducir la comparacion.
- Prototipado rapido de politicas de manipulacion en simulacion: al ocupar 0,9 GB y ejecutarse en una sola GPU de consumo, permite iterar sobre el pipeline de evaluacion LIBERO sin reservar hardware de datacenter.
- Baseline para ajuste fino en un dominio estrecho: equipos que solo disponen de datos de un tipo de tarea (por ejemplo, variaciones espaciales) pueden usar este checkpoint como referencia de que rendimiento es alcanzable con ~400 demostraciones y 10k pasos.
- Docencia y divulgacion sobre VLA: el par modelo base + fine-tune acotado permite explicar el flujo completo de LeRobot (dataset, normalizacion, entrenamiento, evaluacion) con coste computacional bajo.
- Ablacion de hiperparametros de inferencia: util para medir el efecto de `n_action_steps`, pasos de desruido y `batch_size` de evaluacion sobre la tasa de exito en LIBERO-Spatial.
- Prueba de concepto de despliegue en robot real: el modelo es lo bastante pequeno para inferencia en hardware embebido con GPU, aunque el autor solo lo ha validado en simulacion (ver limitaciones).

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La metrica es tasa de exito en LIBERO-Spatial, 10 tareas x 10 episodios, semilla 1000, `n_action_steps=10`, 10 pasos de desruido, FP32. Los valores entre parentesis son intervalos de confianza al 95 %. El resultado del propio modelo **no esta verificado** (`verified: false`).

| Modelo | Datos de entrenamiento | Pasos | Tasa de exito (IC 95 %) |
|---|---|---|---|
| `yutongzhu/smolvla-libero-spatial-only-10k` (este) | Solo `libero_spatial` (432 demostraciones) | 10k | 80 % (71-87) |
| `yutongzhu/smolvla-libero-ft20k` | Cuatro subconjuntos (1693 demostraciones) | 20k | 78 % (69-85) |
| `HuggingFaceVLA/smolvla_libero` (oficial) | No disponible | No disponible | 69 % (59-77), n=1 |

Comparacion por pares episodio a episodio frente al modelo de cuatro subconjuntos: 12 episodios pasan de fallo a exito y 10 de exito a fallo; test exacto de McNemar con p = 0,83, es decir, diferencia no significativa. El autor advierte que la comparacion no aisla el efecto de la mezcla de datos: cada demostracion de spatial se ve aproximadamente el doble de veces en este modelo (10k pasos con el 26 % de los datos frente a 20k pasos con el 100 %).

## Requisitos de hardware

- VRAM estimada en inferencia: en FP32, unos 1,8 GB solo para pesos (450 M de parametros); en FP16/BF16, unos 0,9 GB, mas memoria para activaciones y buffering de imagenes de dos camaras. El repositorio completo ocupa 0,9 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090. El autor entreno el modelo en una unica RTX 4090.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrian sentido para reentrenar con batch grande o para servir muchos entornos en paralelo.
- Despliegue: `lerobot-eval` con `--policy.path`, `--policy.n_action_steps=10`, `--env.type=libero --env.task=libero_spatial` y el `--rename_map` de camaras indicado en la model card. El ecosistema habitual es LeRobot; vLLM, TGI, llama.cpp u Ollama no son aplicables a este tipo de politica (no hay soporte documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion se ejecuto con `--eval.batch_size=10`, lo que sugiere evaluacion por lotes de entornos, pero no se publican tiempos por paso ni FPS.
- Nota operativa: el valor `n_action_steps` del checkpoint se hereda de `smolvla_base` (50) y debe sobrescribirse explicitamente a 10; en caso contrario el comportamiento en evaluacion no coincide con el reportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Rendimiento LIBERO-Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yutongzhu/smolvla-libero-spatial-only-10k` | 450 M | No disponible | LIBERO-Spatial (432 demostraciones), 10k pasos | 80 % (71-87) | Apache 2.0 | Publico en HuggingFace |
| `yutongzhu/smolvla-libero-ft20k` | No disponible en esta ficha (mismo backbone SmolVLA) | No disponible | Cuatro subconjuntos (1693 demostraciones), 20k pasos | 78 % (69-85) | No disponible en esta ficha | Publico en HuggingFace |
| `HuggingFaceVLA/smolvla_libero` (oficial) | No disponible en esta ficha | No disponible | No disponible | 69 % (59-77), n=1 | No disponible en esta ficha | Publico en HuggingFace |
| `lerobot/smolvla_base` (modelo de partida) | 450 M (heredado) | No disponible | Datos comunitarios de LeRobot, no detallados aqui | No disponible (sin ajuste a LIBERO) | No disponible en esta ficha | Publico en HuggingFace |

Frente a VLA de mayor tamano como OpenVLA o pi0, la ventaja de esta familia es el coste de inferencia y de reentrenamiento; no se incluyen cifras comparativas porque no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion restringida a LIBERO-Spatial: no se ha medido la transferencia a los otros subconjuntos de LIBERO (Object, Goal, Long), por lo que se desconoce si el ajuste estrecho degrada el rendimiento fuera del dominio entrenado.
- Solo simulacion: el autor indica explicitamente que no se ha probado en robot real; el gap sim-to-real no esta cuantificado.
- Potencia estadistica limitada: 100 episodios por configuracion y una diferencia de 2 puntos porcentuales con intervalos de confianza amplios y solapados (p = 0,83). No debe interpretarse como superioridad sobre el modelo de cuatro subconjuntos.
- El resultado principal esta marcado como no verificado (`verified: false`) en el `model-index`; procede de la evaluacion del propio autor.
- Confusion posible por el efecto de repeticiones de datos: cada demostracion de spatial se ve ~2 veces mas que en el control, de modo que la comparacion mezcla «menos datos» con «mas epochs sobre los mismos datos».
- Configuracion sensible: requiere fijar `n_action_steps=10`, mapear los nombres de camara y usar la normalizacion con estadisticas del dataset completo; cambiar estos ajustes altera los resultados reportados.
- Riesgo de sobreajuste a las 10 tareas concretas y a la semilla 1000 empleada en la evaluacion.
- Idiomas: la model card solo declara `zh`; no hay documentacion sobre el comportamiento con instrucciones en castellano ni sobre robustez multilingue.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar antes de un despliegue productivo.
- Sin datos publicados sobre sesgos, robustez ante cambios de iluminacion, oclusiones o variaciones de camara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yutongzhu/smolvla-libero-spatial-only-10k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Modelo de comparacion (cuatro subconjuntos, 20k pasos): https://huggingface.co/yutongzhu/smolvla-libero-ft20k
- Checkpoint oficial de referencia: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Codigo, resultados completos y analisis: https://github.com/2p1c/smolvla-libero-edge
