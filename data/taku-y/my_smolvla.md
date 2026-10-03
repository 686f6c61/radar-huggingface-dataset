# taku-y/my_smolvla

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) orientado a robotica, segun la model card oficial y el articulo referenciado con arXiv 2506.01844. La ficha que nos ocupa, `taku-y/my_smolvla`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, publicado por el usuario taku-y y entrenado con la libreria LeRobot de HuggingFace. El modelo base SmolVLA se describe como un VLA eficiente que logra rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo.

El problema que aborda es el control de robots mediante aprendizaje por imitacion: el modelo consume el estado del robot y hasta tres flujos de imagen de camaras, y produce directamente un vector de accion de 6 dimensiones para el robot. En este caso concreto, el ajuste esta orientado al robot `so101_follower` y se ha entrenado sobre un unico episodio y 1717 fotogramas del dataset `taku-y/record-test`, por lo que se trata de una publicacion de caracter experimental y de prueba, no de un modelo listo para produccion.

Con aproximadamente 450 millones de parametros (450.046.176 segun los pesos en safetensors) y un tamano de repositorio de 0,9 GB, SmolVLA se situa en la categoria de modelos VLA ligeros, pensados para inferencia en GPUs asequibles o incluso en hardware integrado, a diferencia de los VLA de varios miles de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA; detalles internos no disponibles |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Robot objetivo | `so101_follower` |
| Libreria | lerobot (probado con LeRobot 0.6.1) |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA se describe en su model card como un modelo de vision-lenguaje-accion compacto y eficiente, capaz de rendimiento competitivo con menor coste computacional y desplegable en hardware de consumo. La arquitectura interna concreta (tipo de vision encoder, backbone de lenguaje, mecanismo de accion) no se detalla en la informacion proporcionada; se remite al articulo arXiv 2506.01844 para la descripcion del metodo. La ficha corresponde a un ajuste fino del modelo base `lerobot/smolvla_base` mediante LeRobot, no a un entrenamiento desde cero.

En cuanto al entrenamiento de este ajuste concreto, la model card indica los siguientes hiperparametros: 20.000 pasos de entrenamiento, tamano de batch 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot version 0.6.1. El dataset utilizado es `taku-y/record-test`, con un unico episodio, 1717 fotogramas a 30 FPS y la tarea etiquetada como "Test task". No se documenta el uso de RLHF ni de DPO, ni la composicion detallada del dataset mas alla de esas cifras. Se trata, por tanto, de un ajuste de imitacion sobre datos muy limitados.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 6 dimensiones a partir del estado del robot y de imagenes de camara, orientado al robot `so101_follower`.
- Percepcion visual: procesa hasta tres flujos de imagen de entrada con resolucion 3x256x256, ademas del estado del robot (6,).
- Aprendizaje por imitacion: la politica se entrena a partir de demostraciones grabadas y se ejecuta sobre el robot mediante el flujo de LeRobot.
- Integracion con LeRobot: soporta los comandos `lerobot-rollout` (ejecucion) y `lerobot-train` (entrenamiento) de la libreria.
- Capacidades de lenguajes, tool calling, agentes, reasoning multilingue o modos de pensamiento: no disponibles (el modelo esta orientado a robotica, no a tareas de texto general).
- Capacidad multilingue: no disponible.

## Casos de uso

- Pruebas de extremo a extremo del pipeline de LeRobot: este modelo sirve para verificar instalaciones, calibracion de camaras y del robot `so101_follower` antes de entrenar politicas reales, ya que fue creado como prueba ("Test task").
- Prototipado de politicas de manipulacion: permite validar el flujo de grabacion de datos, entrenamiento y despliegue en un robot SO-101 sin invertir en un dataset grande.
- Educacion y aprendizaje de IL (imitation learning): util como ejemplo reproducible para quienes se inician en VLA y LeRobot, dado que todo el proceso esta documentado en la guia oficial.
- Evaluacion de hardware de bajo coste: al tratarse de un modelo de 450 M de parametros y 0,9 GB, permite probar inferencia en GPUs de consumo o en equipos modestos.
- Base para ajustes posteriores: partiendo de `lerobot/smolvla_base` o de este ajuste, se puede reentrenar con datasets propios mediante `lerobot-train`.
- Banco de pruebas de despliegue embebido: sirve para medir latencia y viabilidad de ejecutar una politica VLA en hardware limitado antes de escalar a modelos mayores.
- Demostraciones en robot de bajo coste (SO-101): escenario tipico en talleres y entornos academicos con robots tipo brazo de 6 grados de libertad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica (`No evaluation results have been provided for this policy yet`). No se dispone de tasas de exito, metricas de tarea ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, valores aproximados): en FP32 unos 1,8 GB; en FP16/BF16 unos 0,9 GB (coincide con el tamano del repositorio); en INT8 unos 0,45 GB; en INT4 unos 0,23 GB. A ello hay que sumar la memoria de los tensores de imagen (tres entradas de 3x256x256) y del estado.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente; se puede usar una RTX 3060, RTX 4060, RTX 4090 o superiores. En el extremo alto, A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo moderna con al menos 4 GB de VRAM, dado que el modelo pesa 0,9 GB en BF16.
- Opciones de despliegue: la via documentada es la libreria LeRobot con los comandos `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taku-y/my_smolvla | 450.046.176 | no disponible | sin resultados publicados | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Apache 2.0 (segun el base) | HuggingFace |
| Otros VLA comparables (por ejemplo OpenVLA, pi0) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numericos de otros modelos VLA en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa rigurosa. La comparacion mas directa es con el modelo base `lerobot/smolvla_base`, del que este ajuste deriva.

## Limitaciones y advertencias

- Entrenado con un unico episodio y 1717 fotogramas: la politica es de prueba y muy probablemente no generalice a tareas, posiciones de objetos ni condiciones de iluminacion distintas.
- Sin resultados de evaluacion: no hay evidencia publicada de tasa de exito en el robot, por lo que no debe asumirse un rendimiento determinado.
- Discrepancia en la model card: la seccion "Model Details" indica una unica camara (`front`), mientras que las entradas listadas incluyen tres camaras (`camera1`, `camera2`, `camera3`). Conviene verificar la configuracion real antes de desplegar.
- Dependencia del robot objetivo: disenado para `so101_follower`; no es portable directamente a otros robots sin reentrenamiento.
- Riesgo de sobreajuste al dataset de prueba: al tratarse de un experimento con la tarea "Test task", no hay garantia de comportamiento robusto.
- Idiomas y capacidades de texto: no disponibles; el modelo no es un modelo de lenguaje general.
- Licencia Apache 2.0: permite uso comercial y modificacion con las condiciones habituales de atribucion; conviene revisar tambien la licencia del modelo base y del articulo asociado.
- Despliegue en produccion: no recomendado en su estado actual, dado el caracter experimental y la ausencia de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taku-y/my_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/taku-y/record-test
- Articulo SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=taku-y/record-test
