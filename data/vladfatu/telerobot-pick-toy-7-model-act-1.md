# vladfatu/telerobot-pick-toy-7-model-act-1

## Resumen

`vladfatu/telerobot-pick-toy-7-model-act-1` es una política robótica entrenada con el algoritmo Action Chunking with Transformers (ACT) para la tarea de recoger un juguete mediante teleoperación. El modelo ha sido desarrollado por Vlad Fatu y publicado en Hugging Face utilizando la librería LeRobot, con datos del dataset `vladfatu/telerobot-train-pick-toy-7`. Se trata de un sistema de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite un control más estable y preciso del brazo robótico.

El modelo está diseñado para operar sobre el robot SO-100, un brazo robótico de bajo coste, y se ha entrenado con demostraciones teleoperadas mediante un casco de realidad virtual (VR), según se desprende del repositorio `vladfatu/telerobot`. Con 51,7 millones de parámetros, es un modelo relativamente compacto pensado para ejecutarse en tiempo real durante la inferencia. Su relevancia radica en demostrar que políticas de imitación entrenadas con datos teleoperados mediante VR pueden alcanzar un rendimiento suficiente para tareas de manipulación simple, siguiendo la línea de investigación de las políticas ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de vision-accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), descrita en el articulo de arxiv 2304.13705. Se trata de un transformer que, dado un estado del entorno (observaciones visuales y de los motores del robot), predice un fragmento de acciones (action chunk) de longitud fija. En lugar de autoregresivamente predecir un unico paso, el modelo genera la secuencia completa de acciones para los proximos N pasos, lo que reduce la acumulacion de errores y mejora la robustez en tareas de manipulacion.

El entrenamiento se realizo con la libreria LeRobot, sobre el dataset `vladfatu/telerobot-train-pick-toy-7`, que contiene demostraciones teleoperadas de la tarea de recoger un juguete. No se dispone de detalles sobre el numero de episodios, la composicion del dataset ni si se aplicaron tecnicas de refinamiento como RLHF o DPO; la informacion proporcionada solo indica que se trata de aprendizaje por imitacion (imitation learning). El modelo se ha publicado como checkpoint de LeRobot, listo para inferencia o evaluacion con el robot SO-100.

## Capacidades

- Control de un brazo robotico SO-100 para ejecutar la tarea de recoger un juguete en entornos teleoperados.
- Prediccion de secuencias de acciones (action chunks) de longitud fija, en lugar de acciones individuales, lo que mejora la estabilidad del movimiento.
- Integracion con el ecosistema LeRobot: permite cargar el modelo desde el Hub y ejecutar inferencia con el comando `lerobot-record`.
- Compatible con el flujo de entrenamiento de LeRobot, pudiendo reanudarse o evaluarse con checkpoints locales o del Hub.
- No es un modelo multimodal ni de lenguaje: sus capacidades se limitan al control de bajo nivel de un robot especifico.

## Casos de uso

- **Automatizacion de tareas de pick-and-place**: el modelo puede utilizarse en un entorno de laboratorio para que un brazo SO-100 recoja objetos (juguetes) de forma autonoma tras un entrenamiento por demostracion. Es adecuado por su bajo coste de inferencia y su capacidad de ejecutarse en tiempo real.
- **Investigacion en aprendizaje por imitacion**: sirve como punto de partida para comparar el rendimiento de ACT con otras politicas en tareas de manipulacion simple, usando el flujo de evaluacion de LeRobot.
- **Desarrollo de robots de bajo coste**: al estar disenado para el SOF-100, puede usarse en proyectos educativos o de investigacion con hardware asequible, sin necesidad de robots industriales.
- **Generacion de datos para aprendizaje**: el modelo puede ejecutarse en modo evaluacion para recopilar nuevos episodios con `lerobot-record`, creando datasets adicionales para entrenar politicas mas avanzadas.
- **Prototipado rapido de tareas**: permite probar rapidamente si un dataset de teleoperacion es suficiente para una tarea concreta, sin invertir en un sistema de control clasico.
- **Investigacion en control de robots con VR**: dado que los datos provienen de teleoperacion con VR, el modelo sirve para estudiar el impacto de la calidad de las demostraciones en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasa de exito (success rate), numero de episodios de evaluacion ni comparaciones con otras politicas en el dataset `telerobot-train-pick-toy-7`. La unica metrica disponible es el numero de parametros (51,7 millones), sin datos de rendimiento en el robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Dado el tamano del modelo (51,7 M de parametros), una estimacion razonable seria inferior a 1 GB en fp32, y mucho menor en cuantizacion, aunque no se han publicado datos oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) seria suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8-16 GB (RTX 3070 o superior).
- **Compatibilidad con consumer GPU**: si, el modelo cabe en GPU de consumo estandar, incluso en sistemas integrados como Jetson.
- **Opciones de despliegue**: LeRobot soporta inferencia con `lerobot-record` y `lerobot-eval`, usando PyTorch y CUDA. No se mencionan opciones de cuantizacion ni despliegue con vLLM, Ollama o TGI, que son especificos de modelos de lenguaje.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia, pero al ser un modelo de 51 M de parametros, se espera una latencia de pocos milisegundos en GPU, suficiente para control en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de la misma categoria (politicas ACT para robot SOF-100) en el Hub para comparar directamente. El autor ha publicado otros checkpoints del mismo tipo (por ejemplo, `telerobot-pick-toy-1-model-act`), pero sin datos de rendimiento publicados. La comparativa no esta disponible.

## Limitaciones y advertencias

- **Riesgo de sobreajuste**: el modelo ha sido entrenado para una tarea muy concreta (recoger un juguete) y con un dataset limitado; es probable que no generalice a otros objetos, posiciones o entornos.
- **Dependencia de la teleoperacion**: el rendimiento depende de la calidad y variabilidad de las demostraciones teleoperadas; si las demos son pocas o sesgadas, el modelo fallara en condiciones nuevas.
- **Sin capacidades de lenguaje ni vision**: no es un modelo multimodal; no puede interpretar instrucciones verbales ni imagenes de forma general, solo procesa el estado del robot.
- **Licencia Apache-2.0**: permite uso comercial, pero no hay garantia de soporte ni responsabilidad por parte del autor.
- **Hardware especifico**: el modelo esta disenado para el robot SOF-100; no es directamente portable a otros brazos roboticos sin reentrenamiento.
- **Sin datos de seguridad**: no se han realizado evaluaciones de seguridad en entornos con presencia humana; es un modelo de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladfatu/telerobot-pick-toy-7-model-act-1
- Dataset de entrenamiento: https://huggingface.co/datasets/vladfatu/telerobot-train-pick-toy-7
- Repositorio del autor en GitHub: https://github.com/vladfatu
- Repositorio del proyecto de teleoperacion: https://github.com/vladfatu/telerobot
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots
