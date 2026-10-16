# WhichIsAvailable/SmolVLA-finetune

## Resumen

SmolVLA-finetune es un ajuste fino del modelo SmolVLA, un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot. Lo publica el usuario WhichIsAvailable en Hugging Face y su proposito es ejecutar una tarea de manipulacion robotica concreta: introducir una caja de queso crema y una mantequilla en una cesta. A diferencia de los grandes modelos de lenguaje, este modelo no genera texto, sino que traduce observaciones visuales y de estado del robot en comandos de accion de 7 grados de libertad.

El modelo parte de la arquitectura SmolVLA descrita en el paper arXiv:2506.01844 y cuenta con 450.046.176 parametros (aproximadamente 450 millones), un tamano pensado para entrenarse y desplegarse en una sola GPU de consumo. Se distribuye mediante la libreria LeRobot en formato safetensors y el repositorio ocupa 1,6 GB.

Su relevancia actual radica en que demuestra el flujo completo de ajuste fino de politicas roboticas con hardware asequible, usando solo 50 episodios y 13.021 fotogramas del dataset HuggingFaceVLA/smol-libero. Es un ejemplo practico de como adaptar un VLA pequeno a una tarea especifica sin necesidad de infraestructura de gran escala, aunque no se han publicado resultados de evaluacion en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) basada en SmolVLA (paper arXiv:2506.01844), sobre la libreria LeRobot |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo condicionado por instruccion de tarea, no generativo de texto) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (formato de LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion compacto que combina percepcion visual y de estado con la generacion de acciones motoras. En este ajuste fino, la politica consume dos camaras RGB de 3x256x256 pixeles (`observation.images.image` y `observation.images.image2`), un vector de estado de 8 dimensiones (`observation.state`) y un vector de articulaciones de 7 dimensiones (`observation.state.joint`), y produce una accion de 7 dimensiones (`action`). La instruccion de tarea condiciona la politica; en este caso, la tarea entrenada es "put both the cream cheese box and the butter in the basket". No se detallan en la informacion disponible la composicion completa del dataset de preentrenamiento ni si hubo etapas de RLHF o DPO.

El entrenamiento se realizo con LeRobot version 0.6.2 sobre el dataset HuggingFaceVLA/smol-libero, compuesto por 50 episodios, 13.021 fotogramas a 20 FPS. La configuracion reportada es de 10.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. Se trata, por tanto, de un ajuste fino de imitacion supervisada sobre una unica tarea, no de un modelo generalista.

## Capacidades

- Prediccion de acciones de manipulacion robotica de 7 grados de libertad a partir de observaciones multimodales.
- Percepcion visual mediante dos camaras RGB simultaneas, con entrada de 3x256x256 pixeles cada una.
- Fusion de estado del robot: vector de estado de 8 dimensiones y estado de articulaciones de 7 dimensiones.
- Condicionamiento por instruccion de tarea en lenguaje natural, aunque limitado a la tarea para la que fue ajustado.
- Ejecucion en bucle cerrado (rollout) sobre un robot real mediante la CLI `lerobot-rollout`.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas, al ser una politica y no un LLM.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues mas alla de la instruccion de tarea entrenada.

## Casos de uso

- Manipulacion de una tarea de recogida concreta: el modelo esta ajustado para colocar una caja de queso crema y una mantequilla en una cesta, por lo que puede desplegarse en un brazo robotico de 7 grados de libertad para ejecutar esa secuencia repetidamente en un entorno controlado.
- Base para ajuste fino de nuevas tareas: sirve como punto de partida para reentrenar SmolVLA sobre otros datasets de LeRobot, aprovechando que cabe en una GPU de consumo y el flujo de trabajo de la libreria.
- Investigacion en imitacion supervisada: util para estudiar como un VLA pequeno se comporta con pocos datos (50 episodios) y detectar limites de generalizacion en tareas de pick-and-place.
- Prototipado en laboratorio con hardware asequible: permite montar una demo funcional de robotica aprendida sin acceso a GPUs de centro de datos, usando `lerobot-rollout` con camaras OpenCV convencionales.
- Evaluacion comparativa de politicas VLA pequenas: al ser un modelo ligero, facilita experimentos controlados frente a SmolVLA base u otros ajustes publicados en el Hub.
- Automatizacion de tareas domesticas o de almacen logistico a pequena escala, siempre que la escena y los objetos coincidan con los del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito, metricas de exito por ensayo ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, el modelo en precision completa (fp32) ocupa en torno a 1,8 GB y en precision reducida (fp16 o bf16) alrededor de 0,9 GB; el repositorio completo en disco es de 1,6 GB.
- GPU recomendadas: cualquier GPU con mas de 4 GB de VRAM es suficiente en la practica; se incluyen RTX 3060, RTX 4060, RTX 4090, y en el ambito profesional A100 o H100, si bien estas ultimas no son necesarias.
- Cabe en GPU de consumo: si, el modelo esta disenado explicitamente para ejecutarse en hardware de consumo.
- Opciones de despliegue: la via documentada es la CLI de LeRobot (`lerobot-rollout` y `lerobot-train`), con la libreria `lerobot` instalada. No se documentan otros motores como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El dataset de entrenamiento se capturo a 20 FPS, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| SmolVLA-finetune (este) | 450 M | VLA (ajuste fino de tarea) | no disponible | Ajustado a una unica tarea; sin resultados de evaluacion publicados |
| SmolVLA base | 450 M | VLA generalista | no disponible en la informacion | Modelo original del que deriva este ajuste |
| OpenVLA | aproximadamente 7.000 M | VLA | licencia abierta (consultar repositorio) | Mayor tamano; requiere mas recursos de GPU |
| pi0 | aproximadamente 3.300 M | VLA | no disponible en la informacion | Modelo de mayor tamano orientado a control general |

Los datos de modelos comparables se ofrecen a titulo orientativo a partir de informacion publica general; no se dispone en la informacion proporcionada de cifras de rendimiento comparables para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan sesgos especificos para esta politica, aunque al entrenarse sobre una escena y unos objetos concretos hereda sesgos de ese dataset limitado.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser una politica entrenada con 50 episodios y una sola tarea, es probable que falle ante variaciones de posicion, iluminacion u objetos no vistos.
- Limitaciones de contexto: la ventana de contexto no esta documentada; el modelo esta condicionado por una unica instruccion de tarea del dataset.
- Limitacion de idioma: no se especifican idiomas soportados; la tarea entrenada esta expresada en ingles.
- Restricciones de licencia: la licencia no esta disponible y la model card indica "[More Information Needed]", por lo que no puede garantizarse el uso comercial.
- Caveat para produccion: no hay resultados de evaluacion publicados, no se han realizado pruebas de exito por ensayo y el modelo tiene 0 descargas y 0 "likes", lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia de LeRobot 0.6.2 y de que los nombres e indices de camara coincidan con las claves de observacion del entrenamiento (`image` e `image2`).
- No incluye garantias de robustez fuera del entorno y robot concretos con los que fue ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhichIsAvailable/SmolVLA-finetune
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/smol-libero
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HuggingFaceVLA/smol-libero
- Referencia externa sobre SmolVLA: https://aegean.ai/book/vla-agents/smolvla
- Referencia externa sobre SmolVLA en robotica open source: https://robotics.growbotics.ai/projects/foundation-models/smolvla/overview
