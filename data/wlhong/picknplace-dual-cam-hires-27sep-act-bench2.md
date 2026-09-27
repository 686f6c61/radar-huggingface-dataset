# wlhong/picknplace-dual-cam-hires-27sep-act-bench2

## Resumen

`wlhong/picknplace-dual-cam-hires-27sep-act-bench2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de imitación visomotora que consume el estado de las articulaciones y dos flujos de vídeo y produce directamente comandos de acción de 6 dimensiones para un brazo robótico seguidor del tipo `so_follower`. El autor lo ha entrenado y subido al Hub mediante LeRobot 0.6.2, la librería de aprendizaje por imitación de Hugging Face.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Su tarea concreta es "Pick up the red object and put on chair" (coger el objeto rojo y ponerlo en la silla), aprendida a partir de 49 episodios teleoperados con 28.128 fotogramas grabados a 30 FPS. La entrada combina un vector de estado de forma `(6,)` con dos cámaras de resolución 720x1280 (`ugreen-top` y `wrist`), y la salida es un vector de acción de forma `(6,)`.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, útil para quien quiera replicar el flujo de grabación, entrenamiento y despliegue en hardware de bajo coste. El sufijo `bench2` y el entrenamiento de solo 200 pasos sugieren que se trata de una ejecución de prueba más que de un modelo listo para producción, y el propio autor no ha publicado ninguna evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con componente CVAE segun el paper 2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; predice chunks de acciones segun la configuracion de ACT) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision de entrenamiento) |
| Idiomas soportados | no aplica (politica visomotora; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, libreria lerobot) |
| Tipo de politica | imitacion (imitation learning / behavior cloning) con chunking de acciones |
| Robot objetivo | `so_follower` |
| Camaras | `ugreen-top` y `wrist`, ambas a `(3, 720, 1280)` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida | `action`, forma `(6,)` |
| Dataset de entrenamiento | `wlhong/picknplace-dual-cam-hires-27sep` (49 episodios, 28.128 fotogramas, 30 FPS) |
| Tarea | "Pick up the red object and put on chair" |
| Version de LeRobot | 0.6.2 |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de publicacion | 2026-09-27 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice chunks de acciones (varias acciones futuras de una vez) en lugar de un unico paso. La formulacion, descrita en el paper 2304.13705, emplea un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, y suele combinarse con ensamblado temporal en inferencia para suavizar las transiciones entre chunks. El modelo consume dos imagenes de 720x1280 (vista superior `ugreen-top` y vista de muneca `wrist`) junto con un vector de estado de 6 dimensiones, y emite un vector de accion de 6 dimensiones por paso de control.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `wlhong/picknplace-dual-cam-hires-27sep`: 49 episodios teleoperados, 28.128 fotogramas a 30 FPS, una unica tarea y un unico robot. La configuracion declarada es de 200 pasos de entrenamiento con batch size 4, optimizador AdamW, learning rate 1e-05 y semilla 1000. Eso equivale a aproximadamente 800 muestras vistas, un regimen muy corto que sugiere una ejecucion de prueba o de banco de pruebas. La model card no documenta RLHF, DPO ni ningun ajuste posterior: es aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Manipulacion visomotora de una sola tarea: coger un objeto rojo y dejarlo sobre una silla, con un brazo `so_follower` de 6 grados de libertad.
- Fusion de dos vistas de camara a resolucion 720x1280 (vista superior y vista de muneca) con el estado articular de 6 dimensiones.
- Prediccion de chunks de acciones, lo que reduce el error de acumulacion frente a politicas paso a paso y mejora la suavidad del movimiento.
- Ejecucion en bucle cerrado a 30 FPS sobre el robot real, con realimentacion visual continua.
- Reproducibilidad del pipeline completo: mismo formato de datos, mismas claves de observacion y mismos comandos que LeRobot espera.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni tiene interfaz de texto estructurado.
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion de tareas.
- No tiene capacidades multilingues, de codigo, matematicas, vision general, audio ni modo thinking.
- La unica condicion de tarea disponible es la cadena de texto usada en el entrenamiento; el modelo no generaliza a instrucciones nuevas en lenguaje natural.

## Casos de uso

- Banco de pruebas de aprendizaje por imitacion: sirve para validar de punta a punta el ciclo de LeRobot (grabar episodios, entrenar, desplegar con `lerobot-rollout`) antes de invertir en un entrenamiento largo sobre el robot definitivo.
- Automatizacion de pick and place de un objeto concreto: la politica ejecuta la secuencia de recogida y colocacion en la silla de forma autonoma tras el entrenamiento, sin scripting de trayectorias.
- Recogida de objetos en linea de montaje ligera: con dos camaras y una politica entrenada sobre la posicion de la pieza, se puede usar para retirar piezas de una cinta y depositarlas en una ubicacion fija.
- Investigacion sobre robustez visual: al depender de dos vistas a 720p, es un banco util para medir como afectan cambios de iluminacion, oclusiones o distracciones al exito de una politica ACT.
- Comparacion de metodos de chunking: al ser un modelo ACT pequeno y rapido de entrenar, permite comparar ACT frente a alternativas como Diffusion Policy con el mismo dataset y el mismo robot.
- Educacion y prototipado con hardware de bajo coste: el tamano de 51,7 M de parametros y el repositorio de 0,2 GB permiten entrenar y desplegar en una estacion de trabajo con una unica GPU de gama media.
- Generacion de datos sinteticos de evaluacion: ejecutar la politica repetidamente sobre el robot permite recopilar trayectorias etiquetadas de exito y fallo para analisis posteriores.
- Integracion en pipelines internos de robotica: el modelo se puede cargar con la libreria `lerobot` dentro de un servicio propio que exponga la politica a un orquestador de celda robotizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y la plantilla de tabla de evaluacion (tarea, ensayos, exitos, tasa de exito) aparece vacia. Tampoco hay comparaciones con otras politicas ni metricas de MMLU, HumanEval o GSM8K, que no aplican a un modelo de robotica.

Unicos datos de configuracion de entrenamiento disponibles:

| Parametro de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 200 |
| Batch size | 4 |
| Optimizador | adamw |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Muestras vistas (aproximado, pasos x batch) | 800 |

## Requisitos de hardware

- VRAM de los pesos: unos 207 MB en fp32 (51,7 M de parametros x 4 bytes) y unos 103 MB en fp16. El repositorio ocupa 0,2 GB.
- El cuello de botella real no son los pesos, sino las activaciones del backbone visual al procesar dos imagenes de 720x1280 por paso de control. La VRAM efectiva depende del tamano de batch en inferencia y del chunk de acciones configurado; no hay cifras publicadas.
- Cabe con holgura en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 son mas que suficientes. Tambien es viable en plataformas embebidas tipo Jetson Orin, aunque sin cifras de latencia confirmadas.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar con datasets mucho mayores.
- Despliegue soportado: la via oficial es LeRobot con el comando `lerobot-rollout` y `--policy.path=wlhong/picknplace-dual-cam-hires-27sep-act-bench2`, sobre PyTorch.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje y no expone pesos en GGUF.
- Latencia y throughput: no disponibles. El requisito funcional es sostener 30 Hz (33 ms por paso) para igualar la frecuencia de grabacion, pero no hay mediciones publicadas.
- Las camaras deben declararse con los mismos nombres de clave (`ugreen-top`, `wrist`) con los que se entreno la politica; si no coinciden, la inferencia falla.

## Comparativa con modelos similares

No se dispone de comparativas medidas en la informacion proporcionada. La tabla siguiente es cualitativa; las cifras de las alternativas son referencias aproximadas de conocimiento general de esos proyectos y no han sido verificadas en la informacion disponible.

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picknplace-dual-cam-hires-27sep-act-bench2 | ACT, imitacion, una tarea | 51,7 M (dato real) | no disponible (chunk de acciones) | Apache 2.0 | Hugging Face, libreria lerobot |
| ACT original (paper 2304.13705) | ACT, imitacion | similar, ~50 M (aproximado, no verificado) | no disponible | segun autores | paper y repositorio de referencia |
| Diffusion Policy | imitacion basada en difusion | no disponible | no disponible | no disponible | implementaciones de referencia publicas |
| SmolVLA | VLA, vision-lenguaje-accion | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face |
| OpenVLA | VLA de proposito general | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face |

Diferencia funcional clave: este modelo es monoespecifico (una sola tarea, un solo robot) y no procesa lenguaje, mientras que las alternativas VLA estan disenadas para generalizar a multiples tareas mediante instrucciones textuales, a costa de un tamano muy superior.

## Limitaciones y advertencias

- Entrenamiento muy corto: 200 pasos con batch 4 (unas 800 muestras) sobre 49 episodios. Es probable que la politica este infraentrenada o que se comporte de forma fragil fuera de las posiciones vistas.
- Sin evaluacion publicada: no hay tasa de exito medida en robot real, ni ensayos, ni condiciones de prueba documentadas.
- Dataset de demostracion muy reducido: 49 episodios y una unica tarea limitan drasticamente la generalizacion a objetos, posiciones o entornos distintos.
- Dependencia fuerte del entorno visual: cambios de iluminacion, fondo, posicion del objeto rojo o de la silla pueden degradar el comportamiento de forma notable.
- Dependencia del hardware exacto: esta entrenada para el robot `so_follower` y para dos camaras concretas. Usar otro robot del mismo tipo o mover las camaras invalida las observaciones.
- Dependencia de los nombres de las claves de observacion: `observation.images.ugreen-top`, `observation.images.wrist` y `observation.state` deben coincidir exactamente en el despliegue.
- En robotica no aplica el concepto de alucinacion textual, pero si el equivalente: la politica puede generar secuencias de acciones incoherentes o inseguras cuando la entrada queda fuera de la distribucion de entrenamiento.
- Sesgos heredados: la politica reproduce los sesgos y las preferencias de las demostraciones teleoperadas del autor (velocidad, agarre, altura de colocacion, tolerancia al error).
- Sin capacidades de lenguaje: no se puede instruir con texto nuevo ni integrar en un agente conversacional.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se ofrece sin garantias. Conviene citar el paper de ACT y LeRobot segun indica la model card.
- Advertencia operativa: al ser una politica de control fisico, cualquier despliegue real necesita limites de par, paradas de emergencia y supervision humana durante las pruebas.
- Los resultados de busqueda web suministrados no contienen informacion tecnica relevante sobre este modelo y no se han usado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wlhong/picknplace-dual-cam-hires-27sep-act-bench2
- Dataset de entrenamiento: https://huggingface.co/datasets/wlhong/picknplace-dual-cam-hires-27sep
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wlhong/picknplace-dual-cam-hires-27sep
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
