# zijian2022/act_d1_aug

## Resumen

act_d1_aug es un checkpoint de politica robotica basado en ACT (Action Chunking Transformer), publicado por el usuario zijian2022 en HuggingFace bajo la libreria LeRobot. No es un modelo de lenguaje: es una politica de imitacion (imitation learning) entrenada para controlar un brazo robotico industrial Fanuc ER4iA en una tarea concreta de apilado (stack red on blue) con camara montada en la muneca. El repositorio ocupa 0,2 GB y los pesos suman 51.609.223 parametros (unos 51,6 M), lo que lo situa en la categoria de politicas ligeras desplegables incluso en hardware modesto.

El modelo se ha entrenado durante 30.000 pasos con batch size 16 sobre el dataset zijian2022/fanuc_er4ia_stack_red_on_blue_d1_fixwrist, con aumentacion de imagen activada y una configuracion de chunk_size y n_action_steps de 40, es decir, predice bloques de 40 acciones por inferencia. La licencia es Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales mas alla de la atribucion.

Su relevancia es la de un ejemplo reproducible de politica ACT en el ecosistema LeRobot: sirve como referencia para experimentos de imitacion, como punto de partida para fine-tuning en tareas de manipulacion similares y como caso de estudio de aumentacion de imagen en aprendizaje por imitacion. No hay informacion publicada sobre benchmarks, idiomas ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot: backbone visual ResNet18 + transformer encoder/decoder con encoder CVAE |
| Parametros totales | 51.609.223 (aproximadamente 51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: procesa una ventana de observaciones, no una secuencia de tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican cuantizaciones oficiales) |
| Idiomas soportados | no aplica (modelo de robotica sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

Otros datos del repositorio: pipeline_tag `robotics`, tamano 0,2 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-16 y actualizado el 2026-10-16.

## Arquitectura y entrenamiento

ACT es un transformer disenado para manipulacion fina, introducido en el trabajo de Zhao et al. sobre ALOHA. La formulacion combina un encoder CVAE que, durante el entrenamiento, recibe la secuencia de acciones objetivo y produce una variable latente de estilo; un backbone convolucional (ResNet18 en la implementacion de LeRobot) que codifica las imagenes de las camaras; y un transformer encoder-decoder que predice un chunk de acciones futuras condicionado en las observaciones y en la variable latente. La perdida tipica es una L1 sobre las acciones reconstruidas mas un termino KL que regulariza la latente hacia una normal estandar. La innovacion clave del metodo es el action chunking: en lugar de predecir una sola accion por paso, el modelo emite un bloque de acciones, lo que reduce el error de compounding y suaviza las trayectorias.

De este checkpoint concreto se sabe, por la model card, que se entreno durante 30.000 pasos con batch size 16 y aumentacion de imagen activada, y que usa chunk_size = 40 y n_action_steps = 40. No se especifica el numero total de tokens o frames del dataset, la composicion exacta de las camaras, el tipo de acciones (posiciones articulares o del efector final), ni si se aplico algun ajuste posterior. No hay RLHF ni DPO: en robotica de imitacion el paradigma es behavior cloning supervisado sobre demostraciones humanas o teleoperadas.

## Capacidades

- Prediccion de bloques de 40 acciones a partir de observaciones visuales, con ejecucion de 40 pasos de accion por inferencia.
- Control de un brazo robotico Fanuc ER4iA en la tarea de apilado "red on blue" con camara fijada en la muneca (variante `fixwrist` del dataset).
- Aprendizaje por imitacion de una tarea especifica: no generaliza a tareas no vistas sin reentrenamiento o fine-tuning.
- Robusto a variaciones visuales leves gracias a la aumentacion de imagen usada en el entrenamiento.
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, vision general, audio ni modo "thinking".
- No realiza planificacion multi-step de largo horizonte; su horizonte efectivo es el chunk de 40 acciones.

## Casos de uso

- Automatizacion de apilado en linea de produccion: el modelo puede ejecutar ciclos repetitivos de colocacion de una pieza roja sobre una azul en una celda con un Fanuc ER4iA y camara en muneca, sustituyendo programacion explicita de trayectorias por una politica aprendida.
- Punto de partida para fine-tuning: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar con un dataset propio de otra tarea de manipulacion manteniendo el backbone visual y ajustando el cabezal de acciones.
- Banco de pruebas de LeRobot: sirve para validar pipelines de entrenamiento, evaluacion y despliegue de politicas ACT dentro del ecosistema HuggingFace sin tener que entrenar desde cero.
- Estudio de aumentacion de imagen en imitation learning: al estar entrenado con aumento activado, permite comparar contra checkpoints sin aumentacion sobre el mismo dataset y medir el efecto en la tasa de exito.
- Control de robot con vision en muneca: la variante `fixwrist` es adecuada para configuraciones donde la camara se mueve con el efector y se necesita estimar la posesion relativa de objetos cercanos.
- Investigacion academica en chunking: con chunk_size y n_action_steps iguales a 40, es un caso limpio para estudiar el efecto del tamano de chunk en la estabilidad de la politica y en la frecuencia de replanificacion.
- Despliegue en hardware de bajo coste: con 51,6 M de parametros, la inferencia cabe en una GPU de gama de entrada o incluso en CPU, lo que facilita prototipos en laboratorios sin cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica el numero de pasos de entrenamiento (30.000) y la configuracion de chunking, sin tasas de exito ni metricas de la tarea. En robotica de imitacion, la metrica habitual no son MMLU, HumanEval o GSM8K, sino la tasa de exito en la tarea fisica, que no se reporta aqui.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 0,21 GB; en FP16, unos 0,10 GB. Sumando activaciones del ResNet18 y del transformer con chunk de 40, es razonable reservar entre 1 y 2 GB de VRAM en FP32 para inferencia comoda (estimacion propia a partir del numero de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de memoria, por ejemplo GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090. No se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- CPU: es viable para inferencia en CPU dado el tamano reducido, aunque la latencia dependera del numero de camaras y del preprocesado de imagen.
- Opciones de despliegue: libreria LeRobot sobre PyTorch como via principal; exportacion a TorchScript u ONNX como alternativa para integrar en el stack de control del robot. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_d1_aug (este modelo) | ACT + ResNet18 | 51.609.223 | chunk de 40 acciones | Apilado Fanuc ER4iA | Apache 2.0 | HuggingFace (LeRobot) |
| ACT de referencia (ALOHA) | ACT | no disponible | chunk configurable | Manipulacion bimanual | codigo y pesos con licencias propias del proyecto | Repositorio publico |
| Diffusion Policy | Politica generativa por difusion | no disponible | horizonte de prediccion configurable | Manipulacion general | no disponible | Repositorio publico |
| SmolVLA y otros VLA de HuggingFace | Vision-Language-Action | no disponible | contexto multimodal | Multiples tareas | no disponible | HuggingFace |

La diferencia principal frente a Diffusion Policy y a los modelos VLA es el alcance: act_d1_aug es una politica de tarea unica, muy ligera y sin entrada de lenguaje, mientras que las alternativas VLA incorporan instrucciones en lenguaje natural y generalizan a varias tareas a costa de un mayor tamano y requisitos de computo. No se dispone de numeros de parametros ni de rendimiento comparables verificados en la informacion proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Especificidad de tarea: la politica esta entrenada para apilar una pieza roja sobre una azul con un Fanuc ER4iA y una camara en muneca; fuera de esa configuracion el rendimiento sera impredecible.
- Sin benchmarks publicados: no hay tasa de exito, numero de episodios de evaluacion ni curva de aprendizaje, por lo que no se puede estimar su fiabilidad en produccion.
- Riesgo de fallo fisico: en robotica, un fallo del modelo se traduce en colisiones o manipulaciones incorrectas; se recomienda limitar velocidades, usar paradas de emergencia y validar en entorno controlado antes de cualquier despliegue.
- Dependencia del entorno visual: cambios de iluminacion, fondo, posicion de camara o tipo de pieza pueden degradar el comportamiento; la aumentacion de imagen mitiga parte de esta sensibilidad, pero no la elimina.
- Sobreajuste al dataset: al tratarse de un unico dataset `d1_fixwrist` con 30.000 pasos de entrenamiento, es probable que la politica se ajuste a las condiciones concretas de recogida de datos.
- Sin capacidades de lenguaje ni de razonamiento simbolico: no admite instrucciones en texto ni tool calling.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar tambien las condiciones de uso del dataset asociado.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin documentacion adicional sobre hiperparametros, semillas o reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zijian2022/act_d1_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_red_on_blue_d1_fixwrist
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT (Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware): https://arxiv.org/abs/2304.13705
