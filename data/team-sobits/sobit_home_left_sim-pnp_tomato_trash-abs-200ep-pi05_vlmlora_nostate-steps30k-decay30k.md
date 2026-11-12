# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_nostate-steps30k-decay30k

## Resumen

SOBIT Home Left es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/pi05_base`, que a su vez deriva de π₀.₅ de Physical Intelligence. El modelo está entrenado para ejecutar una tarea concreta de manipulación móvil: coger una lata de tomate y arrojarla a una papelera. Lo publica el equipo `team-sobits` como un checkpoint de imitación dentro del ecosistema LeRobot, con el objetivo de controlar un robot móvil manipulador equipado con dos cámaras (cabeza y mano izquierda).

Técnicamente no es un modelo de lenguaje al uso, sino una política robótica que consume observaciones multimodales (estado de 20 dimensiones y dos flujos de imagen) y emite un vector de acción de 20 dimensiones. Se ha entrenado sobre un dataset simulado de 200 episodios y 48.141 fotogramas a 10 FPS, con 30.000 pasos de optimización y un learning rate de 2,5e-5. Su relevancia radica en que demuestra el flujo completo de ajuste fino de un VLA preentrenado con LeRobot 0.6.1 sobre una tarea doméstica concreta, algo útil para quien quiera replicar el pipeline en su propio robot.

El checkpoint se distribuye en formato safetensors (1,9 GB) bajo licencia Apache 2.0, lo que facilita su reutilización y experimentación. No obstante, el modelo está fuertemente especializado: no es un modelo generalista y su evaluación real en robot físico aún no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅, ajustada con LeRobot; no se detalla la topología interna |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ de Physical Intelligence, un VLA diseñado para generalización en entornos abiertos. La política recibe como entrada `observation.state` con forma `(20,)`, una imagen de cámara de cabeza `(3, 480, 640)` y una imagen de cámara de mano izquierda `(3, 400, 640)`, y produce una acción de forma `(20,)`. El robot objetivo es de tipo `mobile_manipulator`.

El entrenamiento se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48.141 fotogramas a 10 FPS, con la tarea "Throw the tomato can into the trash bin". La configuración usa AdamW, batch size 32, learning rate 2,5e-5, semilla 1000 y 30.000 pasos de entrenamiento, con LeRobot 0.6.1. El nombre del checkpoint indica un ajuste con LoRA sobre el componente VLM (`vlmlora`), sin estado (`nostate`) y con decaimiento a 30k pasos (`decay30k`). No se especifican detalles adicionales sobre composición del dataset, aumento de datos ni técnicas de regularización más allá de lo indicado.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones a partir de estado propioceptivo e imágenes.
- Percepción visual multimodal mediante dos cámaras (cabeza y mano izquierda).
- Ejecución de una tarea específica de pick-and-place: coger una lata de tomate y arrojarla a una papelera.
- Ajuste fino sobre un VLA preentrenado, lo que permite reutilizar el conocimiento de π₀.₅ para una tarea concreta.
- Integración con el ecosistema LeRobot para entrenamiento, rollout e inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al no ser un modelo de lenguaje general.

## Casos de uso

- Automatización de tareas domésticas de recogida: el modelo puede ejecutar la secuencia de coger un objeto y depositarlo en un contenedor, útil como base para robots de limpieza doméstica.
- Investigación en imitación robótica: sirve como punto de partida para estudiar el ajuste fino de π₀.₅ con LeRobot sobre datasets propios de 200 episodios.
- Prototipado de pipelines VLA: permite validar el flujo completo de entrenamiento, rollout y evaluación con `lerobot-train` y `lerobot-rollout` antes de escalar a tareas más complejas.
- Benchmark de manipulación móvil: al estar acotado a una tarea y un robot concretos, es útil como caso de prueba reproducible en simulación.
- Educación y demos: su tamaño (1,9 GB) y licencia permisiva lo hacen adecuado para demostraciones de políticas VLA en entornos académicos.
- Base para ajuste fino multi-tarea: el checkpoint puede reentrenarse con datasets adicionales para ampliar el repertorio de objetos y destinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 1,9 GB en safetensors, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que podría caber en GPUs de 8-16 GB, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) con backend CUDA; no se documentan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOBIT Home Left (este) | no disponible | no aplica | Pick-and-place de lata a papelera | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no aplica | VLA generalista base | no disponible en la información | Hugging Face |
| π₀.₅ (Physical Intelligence) | no disponible | no aplica | VLA generalista open-world | no disponible en la información | Blog y OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente para la tarea "Throw the tomato can into the trash bin"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce su fiabilidad.
- Dependencia del hardware: requiere un robot `mobile_manipulator` con cámaras de cabeza y mano izquierda con las resoluciones exactas de entrenamiento.
- Dataset simulado: los 200 episodios provienen de simulación, lo que puede provocar una brecha de realidad (sim-to-real) al desplegarlo físicamente.
- Riesgo de sobreajuste: 30.000 pasos sobre 48.141 fotogramas con una sola tarea puede limitar la robustez ante variaciones de iluminación, posición de objetos o distractores.
- Idiomas: no aplica, pero la instrucción de tarea está en inglés y el modelo no procesa lenguaje natural de forma general.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `pi05_base` puede tener condiciones adicionales que conviene revisar.
- Sin datos de sesgos, alucinación o seguridad física; en robótica, los fallos de política pueden provocar daños materiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_nostate-steps30k-decay30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible en la información
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
