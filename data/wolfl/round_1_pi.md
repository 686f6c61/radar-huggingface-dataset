# wolfL/round_1_pi

## Resumen

`wolfL/round_1_pi` es un checkpoint de politica robotica Vision-Language-Action (VLA) obtenido por ajuste fino de `lerobot/pi05_base`, la implementacion en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. El autor del ajuste es el usuario `wolfL` y el modelo esta pensado para controlar un robot tipo `so_follower` (configuracion SO-100/SO-101 de LeRobot) a partir de dos camaras (vista superior y vista de muneca) y del estado articular de 6 dimensiones, emitiendo acciones de 6 dimensiones.

El modelo resuelve el problema de la generalizacion en entornos abiertos dentro del paradigma de imitacion: en lugar de programar controladores, la politica aprende una asignacion de observaciones visuales y propioceptivas a acciones motoras. π₀.₅ se presenta como una evolucion de π₀ orientada a generalizar a entornos y situaciones no vistas durante el entrenamiento, lo que resulta relevante para tareas de manipulacion con objetos novedosos y variaciones de iluminacion o posicion.

Es un modelo de 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenado en safetensors, con un repositorio de 9,4 GB. El ajuste fino se ha realizado sobre un dataset propio de 50 episodios y 19.557 fotogramas a 30 FPS, con tareas etiquetadas como "test" y "pick up square object". El modelo no incluye resultados de evaluacion en banco ni en robot real, por lo que debe tratarse como un checkpoint experimental de un solo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la adaptacion en LeRobot del modelo π₀.₅ de Physical Intelligence, que a su vez es una evolucion de π₀. Se trata de una politica VLA que combina un backbone de vision-lenguaje con un cabezal de acciones, de forma que el modelo consume imagenes y estado y produce comandos motores. La model card no detalla la arquitectura interna (tipo de transformer, atencion, mecanismo de difusion o flow matching para las acciones), por lo que esos detalles deben consultarse en la documentacion de π₀.₅ y en OpenPI.

El ajuste fino se realizo con LeRobot 0.7.0 durante 20.000 pasos, con batch size 1, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. El dataset de entrenamiento, `wolfL/test_20261120_165211`, contiene 50 episodios y 19.557 fotogramas a 30 FPS, con dos tareas etiquetadas ("test" y "pick up square object"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; en el contexto de imitacion robotica, el entrenamiento es de tipo behavioral cloning sobre demostraciones.

## Capacidades

- Manipulacion robotica de imitacion: mapea observaciones (estado de 6 dimensiones y dos imagenes) a acciones de 6 dimensiones para un robot `so_follower`.
- Percepcion visual multi-camara: consume `observation.images.top` con forma (3, 480, 640) y `observation.images.wrist` con forma (3, 640, 480).
- Control a 30 FPS: el dataset de entrenamiento esta grabado a esa frecuencia, coherente con el bucle de control de LeRobot.
- Generalizacion a entornos abiertos: heredada de π₀.₅, orientada a situaciones y objetos no vistos en entrenamiento (segun la descripcion del modelo base).
- Tareas especificas aprendidas: "test" y "pick up square object" (recogida de un objeto cuadrado).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni razonamiento textual; no es un modelo de lenguaje de proposito general.

## Casos de uso

- Recogida de objetos rigidos con robot de sobremesa: el modelo esta ajustado especificamente para "pick up square object" sobre un `so_follower`, por lo que el escenario directo es una celda de pick-and-place con un objeto cuadrado y dos camaras.
- Prototipado rapido de politicas de imitacion: sirve como referencia de flujo completo LeRobot (grabacion de dataset, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para equipos que quieran replicar el pipeline con sus propios datos.
- Validacion de hardware SO-100/SO-101: al estar entrenado para `so_follower` con camaras `top` y `wrist`, es util para comprobar la calibracion, el montaje de camaras y la latencia del bucle de control antes de invertir en datasets mayores.
- Benchmark interno de generalizacion: al derivar de π₀.₅, permite medir cuanto de la generalizacion del modelo base se conserva tras un ajuste fino con solo 50 episodios.
- Base para ajustes posteriores: se puede reentrenar desde `lerobot/pi05_base` o continuar el ajuste con mas episodios y tareas, usando este checkpoint como punto de partida experimental.
- Docencia y divulgacion: ejemplo reproducible de VLA en robot real con dos camaras y 6 grados de libertad, util para talleres de aprendizaje por imitacion.
- Investigacion en variaciones de dataset: con 19.557 fotogramas y dos tareas etiquetadas, permite estudiar el efecto del numero de episodios y de la mezcla de tareas en el exito de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tareas, ensayos ni tasas de exito en robot real, ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, 4,14 mil millones de parametros en FP16 suponen unos 8,3 GB de pesos; en BF16/FP16 con overhead de activaciones y vision, es razonable prever mas de 10 GB, pero el dato no esta confirmado por el autor.
- GPU recomendadas: no disponible. Para entrenamiento con `--policy.device=cuda` se requiere una GPU NVIDIA compatible con CUDA; el autor no especifica modelo ni memoria.
- Cabe en GPU de consumo: no confirmado. Por tamano de pesos, una GPU con 12-16 GB podria alojar el modelo en precision reducida, pero no hay validacion publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=wolfL/round_1_pi`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. El bucle de control de referencia es a 30 FPS, segun la frecuencia del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wolfL/round_1_pi` | 4.143.404.816 | no disponible | VLA (π₀.₅ ajustado) | gemma | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA (π₀.₅ base) | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) original | no disponible | no disponible | VLA | no disponible en la informacion | OpenPI (repositorio open source de Physical Intelligence) |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada; la comparativa se limita a la relacion de dependencia (este checkpoint es un ajuste fino de `lerobot/pi05_base`, que implementa π₀.₅) y a la disponibilidad publica.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasas de exito en robot real ni en simulacion, por lo que no se puede afirmar que la politica funcione de forma fiable.
- Dataset muy pequeno: 50 episodios y 19.557 fotogramas, con dos tareas ("test" y "pick up square object"); es probable un sobreajuste al entorno, objetos y posiciones de grabacion.
- Especificidad de hardware: entrenado para `so_follower` con camaras `top` y `wrist` y estado de 6 dimensiones; cambiar el robot, la cinematica o la ubicacion de camaras invalida el modelo.
- Tarea "test" sin descripcion: una de las etiquetas del dataset no describe una tarea concreta, lo que dificulta interpretar que ha aprendido el modelo.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones no validas o inseguras ante observaciones fuera de distribucion; requiere parada de emergencia y limites de par/velocidad en el robot.
- Sesgos: no documentados, pero al derivar de un modelo base entrenado con datos de terceros, puede heredar sesgos visuales y de manipulacion de esos datos.
- Licencia "gemma": no se detallan en la model card las restricciones concretas; deben revisarse los terminos de la licencia Gemma antes de cualquier uso comercial.
- Idiomas: no aplica ni se documenta; el modelo no es un modelo de lenguaje de proposito general.
- Repositorio sin descargas ni likes: no hay evidencia de uso por terceros ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfL/round_1_pi
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/wolfL/test_20261120_165211
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wolfL/test_20261120_165211
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
