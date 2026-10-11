# yudai0209/so101_vial_rack_58ep_groot17

## Resumen

so101_vial_rack_58ep_groot17 es un *policy* de robótica (no un modelo de lenguaje) publicado en HuggingFace por el usuario yudai0209. Se trata de un ajuste fino del modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y *cross-embodiment* para razonamiento y habilidades de robots humanoides, entrenado y empaquetado con la librería LeRobot de HuggingFace. El resultado es una política de imitación especializada en una única tarea de manipulación: coger un vial y colocarlo en una gradilla ("Pick up the vial and place it in the rack").

El modelo sigue la arquitectura de GR00T N1.7: un *backbone* de visión-lenguaje Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones con *flow matching*, que predice acciones a partir de visión, lenguaje y propiocepción. El repositorio ocupa 12,6 GB y sus pesos en safetensors suman 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), lo que lo sitúa en la gama media para políticas robóticas con *backbone* VLM.

Su relevancia es práctica y acotada: demuestra el flujo completo de LeRobot (grabación de dataset, entrenamiento de política, publicación en el Hub y *rollout* en robot real) para un robot SO-101 de bajo coste con dos cámaras. Con solo 58 episodios y 25.743 *frames* grabados a 30 FPS, es un ejemplo de ajuste fino de un modelo fundacional grande con un dataset pequeño y muy específico. No se han publicado resultados de evaluación ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de acciones con flow matching sobre backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL (GR00T N1.7) |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo consume instrucciones de tarea en lenguaje natural, pero no se declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version declarada en el entrenamiento: 0.6.1) |
| Tipo de pipeline | robotics (policy de imitacion / vision-language-action) |
| Robot objetivo | so_follower (SO-101) |
| Camaras de entrada | overhead, wrist (3x480x640 cada una, 30 FPS) |
| Entrada de estado | observation.state, shape (6,) |
| Salida | action, shape (6,) |
| Tamano del repositorio | 12,6 GB |
| Dataset de entrenamiento | yudai0209/so101_vial_rack_58ep (58 episodios, 25.743 frames, 30 FPS) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |
| Fecha de actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La model card indica que el modelo subyacente es GR00T N1.7, un modelo fundacional abierto y *cross-embodiment* de NVIDIA para razonamiento y habilidades de robots humanoides. La arquitectura combina dos componentes: un *backbone* Cosmos-Reason2/Qwen3-VL, que procesa la observación visual y la instrucción en lenguaje natural, y un transformer de acciones con *flow matching* que genera las acciones condicionadas por visión, lenguaje y propiocepción. Las entradas concretas de esta política son el estado de 6 dimensiones del robot, dos imágenes RGB de 480x640 (vista cenital y vista de muñeca) y la instrucción de tarea; la salida es un vector de acción de 6 dimensiones.

El ajuste fino se realizó sobre el dataset yudai0209/so101_vial_rack_58ep, compuesto por 58 episodios y 25.743 *frames* a 30 FPS para una única tarea ("Pick up the vial and place it in the rack"). La configuración de entrenamiento declarada es de 20.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 42 y LeRobot 0.6.1. La información disponible no detalla la composición del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; tampoco se documentan innovaciones adicionales de decodificación o atención.

## Capacidades

- Manipulacion robotica de una sola tarea: recoger un vial y colocarlo en una gradilla, con una politica de imitacion entrenada especificamente para esa secuencia.
- Control viso-motor de 6 grados de libertad de accion a partir de estado de 6 dimensiones, imagen cenital e imagen de muñeca.
- Condicionamiento por lenguaje: acepta la instruccion de tarea como entrada, aunque no se documenta su capacidad de generalizacion a instrucciones nuevas.
- Percepcion visual desde dos camaras simultaneas a 480x640 y 30 FPS.
- Ejecucion en robot real mediante el comando lerobot-rollout con estrategia base o con grabacion de episodios.
- Reentrenamiento y ajuste con lerobot-train sobre nuevos datasets en formato LeRobot.
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, vision-lenguaje generativa, audio ni modo de razonamiento explicito. El modelo es una politica de accion, no un asistente conversacional.

## Casos de uso

- Manipulacion de laboratorio automatizada: el modelo ejecuta la secuencia de coger un vial y depositarlo en una gradilla sobre un SO-101, lo que permite prototipar estaciones de llenado, clasificacion o almacenamiento de muestras con hardware de bajo coste.
- Linea de montaje o *pick and place* industrial ligero: con acciones de 6 dimensiones y dos vistas de camara, se puede integrar en celdas donde el robot deba recoger piezas de una bandeja y colocarlas en un soporte fijo.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto del numero de episodios, la posicion de camaras o la variabilidad de iluminacion en el exito de la tarea.
- *Benchmark* interno de modelos fundacionales: al estar construido sobre GR00T N1.7, permite comparar el rendimiento de un *backbone* VLM grande frente a politicas más ligeras (por ejemplo ACT o SmolVLA) en el mismo dataset y robot.
- Formacion y docencia en robotica: el flujo completo de LeRobot (grabar con lerobot-rollout, entrenar con lerobot-train y publicar en el Hub) se puede usar como ejercicio practico de aprendizaje por imitacion de extremo a extremo.
- Replicacion de experimentos en otro robot equivalente: el modelo es *cross-embodiment* en su version base, por lo que puede servir de inicializacion para ajustar la misma tarea en un SO-101 distinto o con otra disposicion de camaras.
- Automatizacion de tareas repetitivas de trasvase: en entornos de biologia o quimica, la politica puede encargarse de mover contenedores entre posiciones fijas, reduciendo la exposicion del operador.
- Base para *data collection* a escala: usar el modelo para generar episodios adicionales con grabacion activada y ampliar el dataset original de 58 episodios para iterar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota literal "No evaluation results have been provided for this policy yet", sin tabla de tareas, intentos, exitos ni tasa de exito en robot real. Tampoco se aportan metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, que ademas no serian aplicables al tratarse de una politica de control y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3,144.016.000 parametros declarados (no son cifras oficiales del autor): aproximadamente 12,6 GB en FP32, unos 6,3 GB en BF16/FP16, unos 3,1 GB en INT8 y alrededor de 1,6 GB en INT4. A ello hay que sumar la memoria del *backbone* visual, los *buffers* de imagen de 480x640 y la sobrecarga del *runtime* de PyTorch.
- GPU recomendadas: NVIDIA A100 (40 o 80 GB), H100 o L40S para despliegue y entrenamiento con margen amplio; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 y para reentrenamiento con lotes pequeños.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 24 GB (RTX 3090, 4090) y previsiblemente en tarjetas de 16 GB con cuantizacion o *offloading* parcial. En tarjetas de 8-12 GB seria necesario cuantizar, y no se dispone de recetas de cuantizacion publicadas para este *policy*.
- Opciones de despliegue: lerobot-rollout con PyTorch y CUDA (el metodo documentado en la model card, con --policy.path=yudai0209/so101_vial_rack_58ep_groot17), o lerobot-train para ajuste adicional con --policy.type=groot. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica de accion con *flow matching*.
- Latencia y throughput: no disponibles. El dataset y el bucle de control funcionan a 30 FPS, pero la model card no publica latencia de inferencia, frecuencia real de control alcanzada ni tasa de exito en robot.

## Comparativa con modelos similares

La informacion disponible solo describe este *policy* y su modelo base, sin cifras verificables de las alternativas. La tabla siguiente recoge unicamente los datos confirmados y marca el resto como no disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vial_rack_58ep_groot17 | 3.144.016.000 | No disponible | Pick and place de vial en gradilla (SO-101) | apache-2.0 | HuggingFace, libreria lerobot |
| GR00T N1.7 (modelo base) | No disponible | No disponible | Modelo fundacional cross-embodiment para humanoides | No disponible | GitHub de NVIDIA Isaac-GR00T |
| Otras politicas de LeRobot (ACT, SmolVLA, pi0) | No disponible | No disponible | Manipulacion por imitacion | No disponible | HuggingFace, libreria lerobot |

No se dispone de datos comparativos de rendimiento entre estas opciones en la tarea del vial, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico montaje de robot y camaras. Cualquier cambio de objeto, posicion inicial, iluminacion o disposicion de camaras puede degradar o invalidar el comportamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de intentos ni condiciones de prueba, por lo que no se puede afirmar que la politica funcione de forma fiable en produccion.
- Dataset muy pequeno: 58 episodios y 25.743 *frames* para ajustar un modelo de 3,14 mil millones de parametros; el riesgo de sobreajuste al entorno de grabacion es alto.
- Dependencia de las claves de observacion: las camaras del robot deben llamarse exactamente overhead y wrist y entregar imagenes de 480x640, tal como se declara en la model card; de lo contrario el *rollout* fallara.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser un modelo generativo de acciones con *flow matching*, puede producir trayectorias fisicamente invalidas o inseguras fuera de la distribucion de entrenamiento. Se requiere supervision humana y limites de seguridad en el robot.
- Idiomas: no se declaran idiomas soportados; la instruccion de tarea se uso en ingles, pero no hay garantia de comportamiento con instrucciones en otros idiomas.
- Sesgos conocidos: no documentados por el autor. Cabe esperar sesgos derivados de las condiciones concretas de grabacion (posiciones, colores del vial y de la gradilla, fondo, iluminacion).
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero el modelo base GR00T N1.7 y sus dependencias pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Advertencia de despliegue: un *policy* de control con actuadores reales puede causar danos materiales o personales. Debe desplegarse con paradas de emergencia, limites de par y espacio de trabajo despejado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso por terceros ni mantenimiento posterior (creado y actualizado el mismo dia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yudai0209/so101_vial_rack_58ep_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_vial_rack_58ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial_rack_58ep
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para groot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados eran contenido no relacionado y se han descartado.
