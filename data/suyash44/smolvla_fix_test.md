# Suyash44/smolvla_fix_test

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `Suyash44/smolvla_fix_test`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Riccardo11/full_insertion_box_darker_light`, orientado a la tarea de agarre de un cilindro azul con un robot bimanual de tipo `bi_so_follower`.

El modelo consume observaciones multimodales (estado articular de 12 dimensiones y tres cámaras RGB de 480x640: frontal y dos muñecas) y produce un vector de acción de 12 dimensiones. Con 450 millones de parámetros y licencia Apache 2.0, está pensado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores que no disponen de clústeres de GPU de gama alta.

Su relevancia actual radica en la tendencia hacia políticas robóticas ligeras y reproducibles: el fine-tuning se realizó con solo 500 pasos de entrenamiento y batch size 2, lo que evidencia la eficiencia del pipeline de LeRobot para adaptar modelos preentrenados a tareas específicas con datasets pequeños (80 episodios, 19.496 frames a 30 FPS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de vision-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acciones para generar comandos motores directamente a partir de observaciones e instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` se distribuye dentro de LeRobot y está pensado para fine-tuning por imitación en tareas robóticas concretas.

Este checkpoint se entrenó sobre el dataset `Riccardo11/full_insertion_box_darker_light` (80 episodios, 19.496 frames, 30 FPS) para la tarea "grasp the blue cylinder". La configuración de entrenamiento fue de 500 pasos, batch size 2, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. El robot objetivo es `bi_so_follower` con tres cámaras (`front`, `left_wrist`, `right_wrist`). No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación específicas en la información disponible.

## Capacidades

- Control robótico por imitación: genera acciones de 12 dimensiones a partir de estado articular y tres vistas RGB.
- Percepción multimodal: procesa tres flujos de imagen de 480x640 píxeles simultáneamente.
- Ejecución de tareas guiadas por instrucción en lenguaje natural (por ejemplo, "grasp the blue cylinder").
- Despliegue en hardware de consumo gracias a su tamaño compacto (450M parámetros).
- Integración nativa con el ecosistema LeRobot para rollout y entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni generación de texto.

## Casos de uso

- Manipulación robótica de precisión: el modelo ejecuta la tarea de agarre de un cilindro azul con un robot bimanual, usando las cámaras de muñeca para ajustar la pinza en tiempo real.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo afectan variaciones de iluminación y color del objeto (el dataset incluye "darker_light") al rendimiento de políticas VLA.
- Prototipado rápido en laboratorio: con 500 pasos de entrenamiento y batch size 2, un equipo puede reproducir el fine-tuning en horas y validar hipótesis sobre datasets pequeños.
- Benchmarking de políticas ligeras: permite comparar el rendimiento de SmolVLA frente a otras políticas de LeRobot en tareas de inserción y agarre.
- Educación y docencia en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` facilita demostraciones en vivo sin grabar episodios.
- Despliegue en robots de bajo coste: al caber en GPU de consumo, habilita pruebas en plataformas tipo SO-100/bi_so_follower sin infraestructura dedicada.
- Evaluación de robustez visual: útil para medir la sensibilidad del modelo a cambios de iluminación y color del objeto mediante el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en fp32 se estiman aproximadamente 1,8 GB de pesos, y en fp16 alrededor de 0,9 GB, más el overhead de las tres cámaras y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles. El dataset opera a 30 FPS, lo que sugiere que la inferencia debe sostener ese ritmo en tiempo real, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suyash44/smolvla_fix_test | 450M | no disponible | Agarre de cilindro (bi_so_follower) | Apache 2.0 | Hugging Face, 31 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Base VLA para fine-tuning | no disponible en la información | Hugging Face (LeRobot) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación robótica | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en la tarea.
- Entrenamiento muy corto (500 pasos, batch size 2): riesgo de sobreajuste o convergencia incompleta.
- Dataset pequeño (80 episodios): poca diversidad, lo que puede limitar la generalización a posiciones, iluminaciones u objetos distintos.
- Tarea única ("grasp the blue cylinder"): no es un modelo generalista; fuera de esa tarea el rendimiento es incierto.
- Dependencia de hardware específico: requiere robot `bi_so_follower` y tres cámaras con nombres e índices concretos.
- Sin información sobre sesgos, alucinación o comportamiento en dominios no vistos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validar en el entorno real antes de producción.
- Idiomas no disponibles: no aplica como modelo de texto general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suyash44/smolvla_fix_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/full_insertion_box_darker_light
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/full_insertion_box_darker_light
