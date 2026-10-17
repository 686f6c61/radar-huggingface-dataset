# twanghcmut/Evo-1-SO101-LeftArm-Multitask

## Resumen

Evo-1-SO101-LeftArm-Multitask es un modelo de vision-lenguaje-accion (VLA) para robotica desarrollado por el usuario twanghcmut a partir de MINT-SJTU/Evo1_SO100, el checkpoint base de Evo-1 creado por MINT-SJTU. El modelo combina un codificador visual-lenguaje InternVL3-1B con una cabeza de accion de flow-matching con modulacion cruzada, alcanzando 0,77 mil millones de parametros. Esta especializado en el brazo roboticamente izquierdo de un SO-101 (una variante de bajo coste del SO-100) y resuelve tareas de manipulacion de sobremesa a partir de instrucciones en lenguaje natural.

El fine-tuning se ha realizado sobre el dataset hungho77/so101-left-arm-multitask, que contiene 551 episodios y 253.745 fotogramas a 30 fps repartidos en 11 tareas de manipulacion (apilar cubos, introducir objetos en una olla, ordenar por altura, etc.). El modelo consume dos vistas de camara (top a 360x640 y wrist a 480x640), un vector de estado de 6 dimensiones (5 articulaciones en grados mas apertura del gripper) y produce una secuencia de 50 acciones absolutas de 6 dimensiones.

Su relevancia actual es doble: por un lado forma parte de una serie de fine-tunings comparables sobre el mismo dataset y protocolo (pi0.5, GR00T N1.7, MolmoAct2, RLDX-1, X-VLA), lo que permite comparaciones controladas; por otro, la model card documenta de forma inusualmente honesta que el rendimiento en evaluacion open-loop in-sample (MAE normalizado del 11,46 %) esta a la par del baseline trivial de mantener la accion constante, y muy por detras de MolmoAct2 (4,37 %) en ese mismo protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: codificador InternVL3-1B + cabeza de accion flow-matching con modulacion cruzada |
| Parametros totales | 0,77 B (aproximadamente 770 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repo: 1,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Evo-1: un codificador visual-lenguaje InternVL3-1B que procesa las dos imagenes (top y wrist) junto con la instruccion textual, y una cabeza de accion de flow-matching con modulacion cruzada que genera un chunk de 50 acciones absolutas. Las acciones se representan en el espacio conjunto del SO-101 (5 articulaciones en grados mas apertura continua de gripper entre 0,7 y 52,7), con normalizacion por limites (min/max a [-1, 1]) y sin delta de accion. El estado y la accion se rellenan hasta 24 dimensiones y la mascara marca las 6 dimensiones reales; el gripper nunca se binariza.

El fine-tuning parte de MINT-SJTU/Evo1_SO100 y sigue la receta de segunda etapa del repositorio oficial Evo-1 (commit 5fd14b0): `--finetune_vlm --finetune_action_head --use_augmentation --lr 1e-5 --dropout 0.2 --weight_decay 1e-3 --image_size 448 --horizon 50 --num_layers 8 --grad_clip_norm 1.0 --warmup_steps 1000`, con DeepSpeed ZeRO-2, bf16 y gradient checkpointing. El entrenamiento uso 2 x H100 MIG 3g.40gb (pico de 11,6 GiB por GPU), batch 16 por GPU x 2 GPUs = 32, 24.000 pasos (768.000 muestras, aproximadamente 3 epocas), warmup lineal de 1.000 pasos y decaimiento coseno. La perdida (MSE de velocidad de flow-matching) bajo de 0,44 en el paso 20 a 0,007 en el paso 20.000 en aproximadamente 27 horas, con el proceso limitado por CPU al decodificar un fotograma AV1 por muestra desde un disco compartido.

Es relevante que el checkpoint de partida (Evo1_SO100) fue entrenado con otras camaras y otra calibracion de brazo, por lo que el fine-tuning tuvo que reaprender el anclaje visual; la curva de perdida documentada refleja este reajuste.

## Capacidades

- Generacion de acciones roboticas de manipulacion a partir de instrucciones en lenguaje natural y dos vistas de camara.
- Control de un brazo SO-101 izquierdo (5 articulaciones + gripper) con acciones absolutas en grados.
- Ejecucion de 11 tareas de sobremesa especificas, que deben pasarse como cadena de texto literal (con el punto final donde aparezca): recoger cubo rojo/azul y dejarlo en la olla de acero, apilar cubos, cerrar la tapa de la olla, ordenar cubos por numero o por altura, etc.
- Produccion de chunks de accion de horizonte 50 para control por receding-horizon.
- No se documenta soporte de tool calling, function calling, agentes, multilingue ni modos de razonamiento explicito.
- No se documentan capacidades de vision mas alla de las dos camaras usadas para el control.

## Casos de uso

- Manipulacion robotica de sobremesa en laboratorio: reproduccion de las 11 tareas aprendidas sobre un SO-101 fisico con las camaras top y wrist calibradas tal y como estan en el dataset.
- Banco de pruebas para investigacion en VLA: el modelo forma parte de una serie de fine-tunings con receta, dataset, presupuesto de muestras y protocolo de evaluacion identicos, lo que lo convierte en una referencia util para comparar arquitecturas (pi0.5, GR00T N1.7, MolmoAct2, RLDX-1, X-VLA).
- Punto de partida para nuevos fine-tunings: al estar bajo licencia MIT y con el repositorio oficial de Evo-1 disponible, es adecuado como inicializacion para adaptar el modelo a otros brazos, camaras o tareas.
- Estudio de flow-matching en acciones continuas: la cabeza de flujo permite analizar como evoluciona el error dentro del chunk (MAE creciente de 2,40 en el paso 0 a 3,85 en el paso 14), un dato util para disenar control por horizonte corto.
- Investigacion en normalizacion y representacion de acciones: al usar normalizacion por limites y gripper continuo, sirve para experimentos sobre representacion de acciones en lugar de discretizacion.
- Prototipado educativo: el peso del repositorio (1,6 GB) y el tamano (0,77 B) lo hacen viable en estaciones de trabajo modestas para tareas de demostracion, siempre asumiendo las limitaciones de rendimiento descritas.

## Benchmarks y rendimiento

Se han publicado resultados de evaluacion open-loop in-sample sobre 11 trayectorias de entrenamiento (una por tarea), llamando a la politica cada 16 pasos, comparando los primeros 16 de los 50 pasos predichos con las acciones de referencia, hasta 400 pasos por trayectoria y con 50 pasos de denoising. MAE en grados (y apertura de gripper); el MAE normalizado divide por la desviacion estandar absoluta de las acciones del dataset (28,67).

| Trayectoria | Tarea | MAE | MSE |
|---|---|---|---|
| 0 | 0 | 2,986 | 23,59 |
| 50 | 1 | 2,748 | 15,11 |
| 100 | 2 | 3,196 | 23,17 |
| 150 | 3 | 4,129 | 38,08 |
| 200 | 4 | 2,741 | 17,00 |
| 251 | 5 | 2,718 | 18,49 |
| 301 | 6 | 3,200 | 24,25 |
| 351 | 7 | 4,614 | 54,18 |
| 401 | 8 | 2,994 | 19,51 |
| 451 | 9 | 2,897 | 17,90 |
| 501 | 10 | 3,927 | 37,58 |
| **Promedio** | | **3,286** | **26,26** |

**MAE normalizado: 11,46 %** de la escala de accion. Baselines triviales sobre el mismo protocolo: mantener la accion constante al inicio del chunk durante 16 pasos da 3,282 (11,45 %) y copiar el estado actual da 5,513 (19,23 %). Es decir, el modelo esta **a la par del baseline de accion retenida, no por encima**. El error crece con la posicion dentro del chunk: MAE 2,40 en el paso 0, 3,04 en el paso 4, 3,44 en el paso 8 y 3,85 en el paso 14. Estas trayectorias estaban en el conjunto de entrenamiento, por lo que la cifra mide ajuste y no generalizacion.

Comparativa con otros modelos de la misma serie y protocolo (todos in-sample):

| Modelo | MAE normalizado |
|---|---|
| MolmoAct2 (twanghcmut/molmoact2-so101-left-arm-multitask) | 4,37 % |
| Evo-1-SO101-LeftArm-Multitask (este modelo) | 11,46 % |
| Baseline hold-action | 11,45 % |
| Baseline copiar estado actual | 19,23 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 0,77 B en bf16 ocupa aproximadamente 1,5 GB solo en pesos; sumando el codificador visual InternVL3-1B, buffers de activacion y procesamiento de dos imagenes, es razonable esperar un consumo en el rango de 4-8 GB, pero esta cifra es una estimacion a partir del tamano, no un dato publicado.
- GPU de entrenamiento: 2 x H100 MIG 3g.40gb (11,6 GiB de pico por GPU), con el proceso limitado por CPU (~4,1 s/paso, ~27 h totales).
- GPU recomendadas para inferencia: no disponibles de forma explicita. Dado el tamano, cualquier GPU con al menos 8 GB (RTX 3060 Ti, RTX 4070, RTX 4090, L4, A10G) deberia ser suficiente en bf16/fp16, siempre y cuando la pila de evo-1 lo permita.
- Compatibilidad con GPU de consumo: probable segun el tamano, pero no confirmada por el autor.
- Opciones de despliegue: el repositorio incluye `so101/run_so101_leftarm.sh`, `so101/supervise_so101_leftarm.sh` y `so101/eval_so101_open_loop.py`, ademas de un servidor de inferencia que consume `norm_stats.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no tendrian sentido para un VLA).
- Latencia y throughput: no disponibles. Solo se documenta el tiempo de entrenamiento (4,1 s/paso, proceso limitado por CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MAE norm. (mismo protocolo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Evo-1-SO101-LeftArm-Multitask | 0,77 B | no disponible | 11,46 % | MIT | HuggingFace |
| Evo1_SO100 (modelo base) | 0,77 B | no disponible | no disponible | no disponible | HuggingFace (MINT-SJTU) |
| MolmoAct2 (twanghcmut/molmoact2-so101-left-arm-multitask) | no disponible | no disponible | 4,37 % | no disponible | HuggingFace |
| pi0.5, GR00T N1.7, RLDX-1, X-VLA (fine-tunes de la misma serie) | no disponible | no disponible | no disponible en la informacion recibida | no disponible | HuggingFace |

Este modelo es claramente inferior a MolmoAct2 sobre el mismo dataset y protocolo (11,46 % frente a 4,37 %). No se dispone de cifras publicadas para pi0.5, GR00T N1.7, RLDX-1 ni X-VLA en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento por debajo de lo esperado: el MAE normalizado (11,46 %) es practicamente identico al del baseline trivial de mantener la accion constante (11,45 %), lo que cuestiona la utilidad practica del checkpoint en produccion.
- Evaluacion in-sample: las 11 trayectorias utilizadas para medir MAE y MSE pertenecen al conjunto de entrenamiento. No hay resultados de generalizacion a trayectorias nuevas ni a escenarios fuera de distribucion.
- Error creciente dentro del chunk: el MAE pasa de 2,40 en el paso 0 a 3,85 en el paso 14, lo que sugiere que solo son fiables los primeros pasos de cada prediccion.
- Dependencia del anclaje visual: el checkpoint base fue entrenado con otras camaras y otra calibracion de brazo; aunque el fine-tuning reajusto la representacion visual, la curva de perdida indica que este reajuste no fue trivial.
- Instrucciones altamente especificas: las 11 tareas deben pasarse como cadenas literales, con el punto final donde aparezca; pequenas variaciones del texto pueden degradar el comportamiento.
- Limitado a un unico brazo y configuracion: SO-101 izquierdo, dos camaras concretas (top y wrist) y estados/acciones de 6 dimensiones. No se ha validado en otros brazos ni con otras camaras.
- Idiomas: no se documentan capacidades multilingues; el dataset y las instrucciones estan en ingles.
- Licencia: MIT, lo que permite uso comercial, pero la model card no incluye garantias ni datos sobre sesgos, alucinacion o comportamiento fuera de distribucion.
- Ausencia de benchmarks externos: no hay resultados en MMLU, HumanEval, GSM8K ni similares, ya que no es un modelo de lenguaje general.
- Fecha de creacion 2026-10-16, con 0 descargas y 0 likes en el momento de la consulta: el modelo no tiene validacion por parte de la comunidad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/twanghcmut/Evo-1-SO101-LeftArm-Multitask
- Modelo base Evo-1 SO100: https://huggingface.co/MINT-SJTU/Evo1_SO100
- Repositorio oficial Evo-1: https://github.com/MINT-SJTU/Evo-1
- Dataset de fine-tuning: https://huggingface.co/datasets/hungho77/so101-left-arm-multitask
- Fine-tune comparable con MolmoAct2: https://huggingface.co/twanghcmut/molmoact2-so101-left-arm-multitask
