# WetLabRoboData/diffusion-septum-scratch

## Resumen

diffusion-septum-scratch es una politica de robotica basada en difusion (diffusion policy) publicada por WetLabRoboData en HuggingFace dentro del ecosistema LeRobot. No es un modelo de lenguaje ni un generador de imagenes: es un controlador visomotor entrenado por imitacion para ejecutar una unica tarea de laboratorio denominada septum sobre un robot UR3e bimanual equipado con tres camaras. El modelo recibe observaciones visuales y de estado del robot y produce secuencias de acciones mediante un proceso iterativo de eliminacion de ruido.

Cuenta con 262.813.047 parametros (unos 262,8 millones) y un repositorio de 1,1 GB en formato safetensors. Se ha entrenado desde cero exclusivamente con datos de esta tarea (variante scratch), sin partir de un modelo fundacional preentrenado. Su relevancia es acotada pero util como referencia reproducible de un pipeline de imitacion end-to-end para laboratorios automatizados: tanto el dataset de entrenamiento como los resultados de evaluacion se publican por separado.

En la evaluacion declarada por el autor, el modelo completa con exito 8 de 20 episodios, es decir, una tasa de exito del 40%. El repositorio registra cero descargas y cero likes en el momento de redactar esta ficha, y no hay informacion publicada sobre composicion detallada del dataset, hiperparametros de entrenamiento ni benchmarks adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot); predictor de ruido condicionado sobre observaciones y muestreo iterativo de acciones. Backbone concreto no documentado en la model card |
| Parametros totales | 262.813.047 (aproximadamente 262,8 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica; horizonte de observacion y horizonte de accion no documentados |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No aplica (modelo de control robotico, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tarea objetivo | septum (unica) |
| Robot objetivo | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-septum |
| Variante | Scratch (entrenado solo con datos de esta tarea) |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia diffusion policy modela la generacion de acciones como un proceso de difusion: se parte de una muestra de ruido y se refina iterativamente hasta obtener una secuencia de acciones coherente, condicionada por las observaciones actuales (imagenes de las tres camaras y estado del robot). Es un enfoque de imitacion supervisada que aprende la distribucion multimodal de demostraciones, lo que le permite representar varias estrategias validas para una misma situacion en lugar de promediarlas. La model card no especifica el backbone exacto, el numero de pasos de difusion, el scheduler ni el horizonte de prediccion; estos datos figuran como no disponibles.

El entrenamiento es de tipo imitation learning sobre el dataset WetLabRoboData/lerobot-data-septum, con un unico objetivo: la tarea septum. No se documenta el numero de episodios, el numero de transiciones, la frecuencia de control ni si hubo etapas de refinamiento tipo RLHF o DPO (tecnicas que, por otra parte, no son habituales en politicas de imitacion robotica). La model card indica que el modelo fue reorganizado a partir de WetLabRoboData/lerobot-data-septum_insert_reactor el 4 de octubre de 2026, y que las salidas de entrenamiento archivadas (checkpoints, train_config.json, directorio wandb/) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Generacion de trayectorias de accion para control robotico de una unica tarea (septum) mediante difusion condicionada por observaciones.
- Percepcion visomotora con tres camaras como entrada, ademas del estado del robot.
- Control bimanual sobre un UR3e, es decir, coordinacion de dos brazos en la misma tarea.
- Aprendizaje por imitacion desde demostraciones humanas o teleoperadas, sin reward shaping ni entorno simulado documentado.
- Ejecucion reactiva a la configuracion visual de la escena dentro de la distribucion de entrenamiento.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingues: no aplica.
- Modo de razonamiento explicito (thinking mode), audio o vision-lenguaje: no disponible.

## Casos de uso

- Automatizacion de la tarea septum en laboratorio: el modelo puede desplegarse directamente sobre un UR3e bimanual con tres camaras para ejecutar la operacion de forma repetida, con una tasa de exito declarada del 40% que exige supervision y deteccion de fallos.
- Baseline de referencia para comparar variantes: al ser la version scratch, sirve como punto de partida para medir cuanto aporta el preentrenamiento, el aumento de datos o cambios en la politica frente a la misma tarea y el mismo dataset de evaluacion.
- Reentrenamiento y ajuste fino en tareas relacionadas: los pesos pueden usarse como inicializacion para tareas de laboratorio humedo con cinematica similar, reentrenando con el dataset propio de la nueva tarea en lugar de partir de cero.
- Validacion de pipelines LeRobot: es un caso de ejemplo completo (modelo, dataset de entrenamiento y dataset de evaluacion con videos de rollout) para verificar que un flujo de entrenamiento, carga y evaluacion de diffusion policy funciona de extremo a extremo.
- Investigacion en imitation learning con robots reales: permite estudiar sensibilidad a camaras, iluminacion o posiciones iniciales en un montaje bimanual concreto, sin necesidad de construir una celda desde cero.
- Banco de pruebas de laboratorio autonomo (self-driving lab): puede integrarse como modulo de control de una estacion automatizada donde la operacion septum sea una etapa de un protocolo mayor, con un orquestador externo que gestione el encadenamiento de fases.
- Docencia y demostraciones tecnicas: al tener pesos abiertos, licencia Apache 2.0 y ejemplos de evaluacion publicados, es util para explicar de forma practica como se entrena y despliega una diffusion policy real.
- Analisis de fallos y recogida de datos dirigida: los 12 episodios fallidos de la evaluacion pueden guiar la recoleccion de nuevas demostraciones en las configuraciones donde el modelo falla, siguiendo un ciclo iterativo de mejora del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval, GSM8K ni metricas de lenguaje, dado que no es un modelo de lenguaje). El unico dato de rendimiento disponible es la evaluacion de despliegue declarada por el autor:

| Tarea | Episodios evaluados | Exitos | Tasa de exito | Robot | Camaras |
|---|---|---|---|---|---|
| septum | 20 | 8 | 40% | UR3e bimanual | 3 |

Los videos de rollout y los resultados por episodio estan publicados en el dataset WetLabRoboData/eval-diffusion-septum-scratch. No se proporcionan intervalos de confianza, numero de semillas ni condiciones exactas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: los calculos a partir del recuento de parametros dan aproximadamente 1,05 GB en fp32 y 0,53 GB en fp16 o bf16 solo para los pesos. Sumando activaciones, buffer de difusion y procesamiento de tres flujos de camara, una estimacion razonable es de 2 a 4 GB de VRAM. Estimacion derivada del numero de parametros, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para laboratorio y produccion, una RTX 4090, A100 o H100 aportan margen sobrado y permiten reducir la latencia por paso de difusion; una A100 o H100 solo se justifican si se ejecutan varios modelos o se reentrena en la misma maquina.
- Cabe en GPU de consumo: si, con holgura. Modelos como RTX 3060 12 GB, RTX 4070, RTX 3080 o superiores son suficientes; incluso GPU de gama de entrada con 6-8 GB deberian poder ejecutarlo. La RTX 4090 es la opcion mas comoda si se busca baja latencia.
- Opciones de despliegue: la via documentada es LeRobot con PyTorch, cargando el modelo mediante `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-septum-scratch")`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo autorregresivo de lenguaje. El despliegue requiere ademas un host con acceso a las tres camaras y al bus de control del UR3e.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de difusion, del backbone y de la frecuencia de control del robot, ninguno de los cuales se documenta en la model card. En una diffusion policy tipica la inferencia debe completarse dentro del periodo de control, por lo que este dato es critico antes de un despliegue real.

## Comparativa con modelos similares

No se dispone de datos de benchmark ni de especificaciones tecnicas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas de la familia a la que pertenece cada alternativa. Los valores numericos figuran como no disponibles.

| Modelo | Familia | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-septum-scratch | Diffusion policy (LeRobot), scratch | 262,8 M | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| ACT (LeRobot) | Transformer de imitacion con acciones continuas | No disponible | No disponible | No disponible en la informacion proporcionada | Implementacion incluida en LeRobot |
| Variantes diffusion policy de LeRobot para otras tareas | Diffusion policy | No disponible | No disponible | No disponible en la informacion proporcionada | Repositorio LeRobot |
| SmolVLA (HuggingFace) | Vision-lenguaje-accion (VLA) | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |

La diferencia conceptual principal es que este modelo es especifico de una tarea y no acepta instrucciones en lenguaje, mientras que una politica VLA si puede condicionarse mediante texto y transferir entre tareas. No hay datos publicados que permitan comparar tasas de exito entre estas alternativas en la tarea septum.

## Limitaciones y advertencias

- Generalizacion muy limitada: es una variante scratch entrenada exclusivamente para la tarea septum. No cabe esperar transferencia a otras tareas sin reentrenamiento o ajuste fino.
- Tasa de exito del 40%: 12 de 20 episodios de evaluacion fallaron. Es una fiabilidad insuficiente para operacion desatendida y exige supervision humana, deteccion de fallo y recuperacion.
- Dependencia fuerte de la instalacion fisica: el modelo asume un UR3e bimanual y tres camaras con la iluminacion, la calibracion y las posiciones iniciales del dataset. Cualquier cambio en la celda puede degradar el rendimiento de forma severa y obliga a recalibrar o recoger datos nuevos.
- Riesgo de acciones no validas: aunque el concepto de alucinacion no aplica a un modelo de control, la politica puede generar trayectorias fuera de rango. Es imprescindible mantener limites de par, limites de articulacion y parada de emergencia, y operar con espacio de trabajo despejado.
- Sin informacion sobre sesgos: no se documentan sesgos de dataset, demografia de los demostradores ni cobertura de condiciones. La composicion del dataset de entrenamiento no esta detallada en la model card.
- Sin validacion por terceros: cero descargas y cero likes, sin publicacion revisada por pares. Los unicos resultados son los declarados por el propio autor.
- Documentacion incompleta: no se detallan hiperparametros, backbone, pasos de difusion, horizonte de prediccion, frecuencia de control ni detalles del dataset. `train_config.json` se menciona como archivado en el repositorio de origen, no en este.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y sin garantia alguna por parte del autor. No se declaran restricciones adicionales ni requisitos de atribucion mas alla de los habituales de la licencia.
- Caveat de trazabilidad: el modelo fue reorganizado el 2026-10-04 a partir de otro repositorio, y los artefactos originales de entrenamiento quedan en la subcarpeta `old/` del origen. Conviene verificar esa procedencia antes de usarlo como referencia experimental.
- Idiomas: no aplica, el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-septum-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-septum
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-septum-scratch
- Repositorio de origen de la reorganizacion, mencionado en la model card: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-septum_insert_reactor (contiene los checkpoints y `train_config.json` archivados en `old/`)
- Ecosistema LeRobot, referenciado por los tags y por `library_name` (no aparece en los resultados de busqueda; enlace de referencia del framework): https://github.com/huggingface/lerobot
- Resultados de busqueda no relacionados con este modelo (se listan por completitud, ninguno corresponde a esta diffusion policy):
  - https://www.seaart.ai/models/detail/faf6a417a86d96622adf2720dfb54d53 (modelo de generacion de imagenes; coincidencia solo en el nombre "septum")
  - https://github.com/gmongaras/Diffusion_models_from_scratch (tutorial de difusion)
  - https://github.com/aitechroberts/diffusion-class (material docente de difusion)
  - https://huggingface.co/learn/diffusion-course/en/unit1/3 (curso de difusion)
  - https://diffusion.csail.mit.edu/2026/index.html (curso de flow matching y difusion)
