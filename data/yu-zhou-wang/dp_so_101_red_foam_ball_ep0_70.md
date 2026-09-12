# Yu-Zhou-Wang/dp_so_101_red_foam_ball_ep0_70

## Resumen

`Yu-Zhou-Wang/dp_so_101_red_foam_ball_ep0_70` es un checkpoint de política robótica basado en Diffusion Policy, entrenado desde cero con la librería LeRobot sobre el robot SO-101 (followers de 6 grados de libertad). El modelo resuelve una tarea concreta de manipulación: coger una pelota de espuma roja y depositarla en un contenedor. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (dos cámaras RGB de 640×480 más el estado articular) a secuencias de acciones de control.

El checkpoint corresponde a la ejecución «escalada» del autor sobre 71 demostraciones (episodios 0–70) del dataset `Jingyi-Z/sotac`, con 22 184 fotogramas capturados a 30 Hz. Sustituye a un checkpoint anterior entrenado con solo 21 demostraciones. El entrenamiento se realizó en DeltaAI (proyecto `bijp`, job `21900699`) sobre una A100 de 40 GB durante 3,5 horas, con 50 000 pasos de optimización (aproximadamente 18 épocas).

Técnicamente, emplea dos backbones ResNet18 preentrenados en ImageNet (uno por cámara), aumento de datos de color y geometría, y un scheduler DDIM con 16 pasos de inferencia ya fijados en el checkpoint. El resultado son 277,8 millones de parámetros en safetensors (1,1 GB de repositorio) bajo licencia Apache 2.0, con un coste de inferencia moderado que lo hace desplegable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot): dos backbones ResNet18 (uno por camara) como encoders visuales + red de difusion condicionada por observacion y estado articular |
| Parametros totales | 277 840 246 (277,8 M), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto de texto. Horizonte de prediccion: 16 pasos; pasos de observacion (n_obs_steps): 2; acciones ejecutadas en bucle abierto (n_action_steps): 8, equivalentes a ~0,27 s a 30 Hz |
| Tipos de cuantizacion | No disponible. El checkpoint se distribuye en safetensors (precision original de entrenamiento con AMP). No se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | No aplica / no disponible: el modelo no procesa lenguaje, solo imagenes y estado articular |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales del checkpoint, segun la model card:

| Parametro | Valor |
|---|---|
| Robot | SO-101 follower, 6 posiciones articulares |
| Camaras | `observation.images.top`, `observation.images.wrist` (640×480) |
| Scheduler de ruido | DDIM, 100 pasos de entrenamiento, 16 pasos de inferencia |
| Tacto | No utilizado |
| Dataset | `Jingyi-Z/sotac`, episodios 0–70 (71 demostraciones, 22 184 fotogramas a 30 Hz) |
| Pasos de entrenamiento | 50 000 (~18 epocas) |
| Batch / workers | 8 / 8 |
| Optimizador | Adam, LR 1e-4, scheduler coseno, 500 pasos de warmup |
| Semilla | 1000 |
| AMP | Activado |
| Perdida final de entrenamiento | 0,007 a 50 000 pasos |
| Hardware de entrenamiento | A100-40 GB (DeltaAI), 3,5 h |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el esquema Diffusion Policy implementado en LeRobot: un modelo generativo de difusion que produce *chunks* de acciones condicionados por las observaciones. Las dos camaras (`top` y `wrist`) se codifican con sendos backbones ResNet18 inicializados con pesos de ImageNet, de modo que cada vista tiene su propio extractor de caracteristicas. La observacion incluye ademas el estado de las 6 articulaciones del SO-101 follower. El modulo de difusion opera en el espacio de acciones con un horizonte de 16 pasos, de los cuales se ejecutan 8 en bucle abierto (unos 0,27 s a 30 Hz) antes de volver a observar, y consume 2 pasos de observacion como contexto.

El entrenamiento se hizo desde cero sobre 71 demostraciones del dataset `sotac` (22 184 fotogramas a 30 Hz), con aumento de datos de color y geometria activado, AMP y 50 000 pasos de optimizacion (unas 18 epocas) con batch 8. La innovacion practica mas relevante es la integracion de DDIM con 16 pasos de inferencia directamente en el checkpoint: esto reduce el coste de muestreo frente a una difusion DDPM completa (100 pasos de entrenamiento) sin requerir configuracion adicional en el momento del despliegue. No se documenta uso de RLHF, DPO ni etapas de ajuste por preferencias, algo esperable en una politica de control. Tampoco se emplea informacion tactil.

## Capacidades

- Generacion de trayectorias de accion para el robot SO-101 follower (6 articulaciones) a partir de observaciones visuales y de estado.
- Percepcion visual binocular mediante dos encoders ResNet18 independientes (vista cenital `top` y vista de muneca `wrist`), a 640×480.
- Ejecucion de la tarea especifica de *pick and place*: recoger una pelota de espuma roja y colocarla en un contenedor.
- Prediccion de chunks de 8 acciones por inferencia (horizonte de 16), lo que permite control con menor frecuencia de replanificacion.
- Inferencia con DDIM de 16 pasos preconfigurada, sin necesidad de ajustar el scheduler en despliegue.
- Integracion nativa con LeRobot 0.6 mediante `DiffusionPolicy.from_pretrained(...)` y el flujo `lerobot-record` para evaluacion en robot real.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso simbolico, capacidades de agente, vision general de proposito abierto, audio ni modo de razonamiento explicito. Es una politica de control de proposito especifico.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta directamente la tarea de coger la pelota de espuma roja y dejarla en el contenedor, con 71 demostraciones de entrenamiento y dos vistas de camara, lo que lo hace adecuado como politica de referencia en un banco de pruebas SO-101.
- Linea de base para investigacion en imitacion: sirve como punto de comparacion reproducible frente a otras politicas de LeRobot (por ejemplo ACT) sobre el mismo dataset `sotac`, dado que la configuracion de entrenamiento y la semilla estan documentadas de forma explicita.
- Estudio de escalado de datos de demostracion: al existir un checkpoint previo con 21 demostraciones y este con 71, permite analizar la ganancia de rendimiento al aumentar el numero de episodios manteniendo la misma tarea y el mismo robot.
- Evaluacion de politicas de difusion en hardware modesto: con 277,8 M de parametros y DDIM de 16 pasos, es viable ejecutar la inferencia en una GPU de consumo mientras el robot opera, sin necesidad de un servidor de alto rendimiento.
- Reentrenamiento con *fine-tuning* sobre una tarea nueva: al estar bajo Apache 2.0 y en formato LeRobot, se puede reajustar el checkpoint para una variante de la tarea (otro objeto, otra posicion de contenedor) partiendo de pesos ya entrenados.
- Docencia y prototipado en robotica: el flujo de carga en dos lineas de Python y el comando `lerobot-record` permiten reproducir una demostracion completa de aprendizaje por imitacion en un curso o taller practico.
- Pruebas de robustez visual: al emplear aumento de datos de color y geometria durante el entrenamiento, el modelo es un candidato razonable para medir sensibilidad a cambios de iluminacion o de posicion de camara en el montaje SO-101.
- Componente de un pipeline de evaluacion automatizada: integrado en `lerobot-record` con un `dataset.repo_id` propio, se puede ejecutar un ciclo de evaluacion repetible y almacenar los episodios resultantes para su analisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta tasa de exito en robot real, ni metricas tipo MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo), ni comparaciones numericas con otras politicas. El unico dato cuantitativo de rendimiento disponible es la perdida final de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento (paso 50 000, ~18 epocas) | 0,007 |
| Tasa de exito en evaluacion real | No disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No aplicables |
| Comparacion numerica con otras politicas | No disponible |

## Requisitos de hardware

- VRAM de inferencia (estimacion derivada del numero de parametros, no reportada por el autor): los 277,8 M de parametros ocupan aproximadamente 1,11 GB en fp32 y unos 0,56 GB en fp16/bf16; a ello hay que sumar las activaciones de los dos ResNet18 y del modulo de difusion, por lo que el consumo realista sera superior a la cifra de pesos.
- GPU de entrenamiento documentada: A100-40 GB con AMP, batch 8, 50 000 pasos en 3,5 horas.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4-6 GB de VRAM disponible deberia ser suficiente; una RTX 3060 de 12 GB, una RTX 4070/4090 o una A100/H100 son opciones validas. La model card no especifica un minimo oficial.
- Cabe en GPU de consumo: si, previsiblemente, dado el tamano de 277,8 M de parametros; no hay confirmacion explicita del autor en la informacion disponible.
- Opciones de despliegue: libreria `lerobot` (clase `DiffusionPolicy`), PyTorch, y el flujo `lerobot-record` con `--robot.type=so101_follower`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, y en general no son aplicables a una politica de difusion.
- Latencia y throughput: no disponibles como cifra medida. El unico dato relacionado es el horizonte de ejecucion en bucle abierto: 8 acciones a 30 Hz, es decir, aproximadamente 0,27 s entre replanificaciones, con 16 pasos DDIM por inferencia.
- Requisito de integracion: las claves de camara deben ser `top` y `wrist` (renombrando `front` a `top` si es necesario) para que la politica cargue correctamente.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte / acciones | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yu-Zhou-Wang/dp_so_101_red_foam_ball_ep0_70` (este) | 277,8 M | Horizonte 16, 8 acciones por chunk (~0,27 s a 30 Hz) | 71 demostraciones, 22 184 fotogramas | Apache 2.0 | HuggingFace, libreria `lerobot` |
| `Yu-Zhou-Wang/dp_so_101_red_foam_ball` (checkpoint anterior del mismo autor) | No disponible | No disponible | 21 demostraciones | No disponible | HuggingFace |
| Otras politicas de LeRobot (ACT, SmolVLA, etc.) sobre `sotac` | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (coger la pelota de espuma roja y dejarla en el contenedor) sobre un unico robot SO-101. No generaliza a otras tareas ni a otros objetos sin reentrenamiento o *fine-tuning*.
- Sin datos de evaluacion: no se publica tasa de exito en robot real, numero de intentos ni condiciones de evaluacion, por lo que el rendimiento en produccion es desconocido.
- Dependencia del montaje: el modelo asume exactamente dos camaras con las claves `top` y `wrist` a 640×480 y 6 posiciones articulares del follower. Cambios de calibracion, de encuadre o de iluminacion pueden degradar el comportamiento.
- Sin informacion tactil: el autor indica explicitamente que el tacto no se utiliza, lo que limita la robustez en contactos delicados o en tareas que requieran deteccion de fuerza.
- Riesgo de acumulacion de error en bucle abierto: se ejecutan 8 acciones por inferencia, de modo que un error de prediccion se propaga durante aproximadamente 0,27 s antes de la siguiente observacion.
- Volumen de datos modesto: 71 demostraciones y 18 epocas de entrenamiento. La perdida de entrenamiento baja (0,007) no garantiza buen desempeño fuera de la distribucion de las demostraciones.
- Idiomas: no aplica, el modelo no procesa texto. No hay capacidades multilingues.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No se documentan restricciones adicionales, pero tampoco se ofrece garantia alguna por parte del autor.
- Metadatos cuando menos llamativos: las fechas del repositorio (creado y actualizado el 11 de septiembre de 2026) son posteriores a la fecha de consulta habitual; conviene verificar la vigencia y procedencia del repositorio antes de integrarlo en un flujo de produccion.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin validacion por parte de la comunidad, sin issues ni retroalimentacion de terceros.
- Ausencia de comparaciones publicadas frente a politicas alternativas sobre el mismo dataset, lo que impide estimar si el rendimiento es competitivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yu-Zhou-Wang/dp_so_101_red_foam_ball_ep0_70
- Checkpoint anterior (21 demostraciones) del mismo autor: https://huggingface.co/Yu-Zhou-Wang/dp_so_101_red_foam_ball
- Dataset `sotac`: https://huggingface.co/datasets/Jingyi-Z/sotac
- Documentacion de LeRobot: https://github.com/huggingface/lerobot
- Run de W&B indicado por el autor: proyecto `dp_so_101`, run `cqplovxf` (no se proporciona URL directa en la informacion disponible)
- Paper de Diffusion Policy: no disponible en la informacion proporcionada
- Demo o video: no disponible en la informacion proporcionada
