# Sounderya/smolvla-ur3-base-5-95-simstats

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico por imitación, que puede desplegarse en hardware de consumo. Este repositorio contiene un fine-tune específico del modelo base `lerobot/smolvla_base`, entrenado por Sounderya para la tarea de recoger una taza y colocarla en un plato, utilizando un brazo robótico UR3 en un entorno simulado. El modelo se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot de Hugging Face.

El fine-tune se realizó sobre un dataset propio de 120 episodios (91.365 frames a 30 FPS) con tres cámaras (muñeca y dos laterales) y salidas de acción de 10 dimensiones. Con 450 millones de parámetros, el modelo es significativamente más ligero que otros VLA de gran escala, lo que lo hace adecuado para experimentación en laboratorios con recursos limitados. Su relevancia actual radica en la tendencia hacia modelos de robótica abiertos y eficientes, capaces de ejecutarse en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente BF16/FP32) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El modelo base `lerobot/smolvla_base` fue preentrenado de forma general y este repositorio es un fine-tune mediante aprendizaje por imitacion (behavior cloning) sobre un dataset especifico de manipulacion robotica. El entrenamiento se realizo con LeRobot 0.6.1, durante 15.000 pasos, batch size 64, optimizador AdamW y learning rate 5e-5, con semilla 1000. No se menciona el uso de RLHF ni DPO; el proceso es supervisado directamente sobre las demostraciones.

El dataset de entrenamiento (`Sounderya/mug_smolvla_dataset_v2nc`) contiene 120 episodios de la tarea "Pick the mug and place it on the plate", con observaciones de estado (6 dimensiones) y tres flujos de imagen a 256x256 píxeles. La salida es un vector de accion de 10 dimensiones, tipico de brazos roboticos con 6 grados de libertad mas agarre. No se detallan innovaciones tecnicas adicionales en la model card, pero el modelo base SmolVLA se describe en el paper arxiv:2506.01844 como una arquitectura compacta y eficiente.

## Capacidades

- Control robotico por imitacion: ejecuta politicas de manipulacion aprendidas a partir de demostraciones.
- Percepcion visual multi-camara: procesa tres flujos de imagen simultaneos (muñeca y laterales) a resolucion 256x256.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica textualmente ("Pick the mug and place it on the plate").
- Generacion de acciones continuas: produce vectores de accion de 10 dimensiones para el robot.
- Integracion con LeRobot: compatible con el pipeline de entrenamiento, evaluacion y despliegue de Hugging Face.
- Eficiencia computacional: disenado para ejecutarse en hardware de consumo, a diferencia de VLA mas grandes.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos simulados: el modelo puede controlar un brazo UR3 para recoger objetos y colocarlos en posiciones definidas, util para validar algoritmos de manipulacion antes de pasar a hardware real.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentar con fine-tunes sobre nuevas tareas, gracias a su tamano reducido y su integracion con LeRobot.
- Prototipado rapido de politicas roboticas: un laboratorio puede grabar demostraciones, entrenar un modelo como este y desplegarlo en minutos, acelerando el ciclo de iteracion.
- Educacion en robotica y VLA: al ser un modelo abierto y ligero, es adecuado para cursos y talleres donde se ensenan conceptos de vision-lenguaje-accion sin necesidad de infraestructura costosa.
- Benchmarking de metodos de eficiencia: permite comparar tecnicas de cuantizacion, destilacion o poda en un modelo real de robotica, dado su tamano manejable.
- Desarrollo de sistemas de manipulacion con realimentacion visual: las tres camaras permiten experimentar con fusion de informacion visual de distintas perspectivas para mejorar la robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. No se proporcionan metricas como tasa de exito, MMLU, HumanEval ni otros estandares de VLA. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para datos de rendimiento del modelo base, pero no se dispone de cifras especificas para este fine-tune.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 450M de parametros, en FP32 ocuparia ~1.8 GB, pero el tamano del repo (0.9 GB) sugiere pesos en BF16 o FP16, lo que reduciria el uso a ~0.9 GB. La inferencia completa con tres imagenes 256x256 y el modelo de lenguaje podria requerir entre 2 y 4 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, GTX 1660 Super) deberia ser suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A100).
- Compatibilidad con consumer GPU: si, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta integracion con vLLM, llama.cpp y Ollama para el componente de lenguaje, aunque el pipeline completo requiere el entorno de LeRobot.
- Latencia y throughput: no disponibles. Al ser un modelo compacto, se espera una latencia inferior a la de VLA grandes, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base SmolVLA se posiciona frente a alternativas como OpenVLA (7B parametros) o RT-2 (mucho mayor), pero este fine-tune especifico no tiene metricas publicadas que permitan una comparacion cuantitativa. Se recomienda consultar el paper de SmolVLA para una comparativa del modelo base, pero no se incluyen aqui por falta de informacion verificable.

## Limitaciones y advertencias

- Sin resultados de evaluacion: la model card no reporta tasa de exito ni pruebas en robot real, por lo que el rendimiento real es desconocido.
- Dataset limitado: 120 episodios de una unica tarea, lo que puede provocar sobreajuste y falta de generalizacion a variaciones de posicion, iluminacion o nuevos objetos.
- Entorno simulado: el nombre del repositorio indica "simstats", sugiriendo que el entrenamiento se realizo en simulacion; el transfer a hardware real puede requerir ajustes adicionales.
- Dependencia de camaras especificas: el modelo espera tres flujos de imagen con nombres concretos (`wrist`, `right` y una tercera no especificada); cambios en la configuracion de camaras invalidan la politica.
- Riesgo de alucinacion en instrucciones: aunque es un VLA, el componente de lenguaje puede malinterpretar instrucciones si se usan fuera del formato exacto de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se debe verificar la licencia del dataset `Sounderya/mug_smolvla_dataset_v2nc`.
- Sin soporte multilingue: no se indica que el modelo funcione con instrucciones en otros idiomas distintos del ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-base-5-95-simstats
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
