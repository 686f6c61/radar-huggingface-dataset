# Triz1/act_so101_v3

## Resumen

`Triz1/act_so101_v3` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor entrenado para ejecutar una tarea física concreta ("Put the yellow cube into the subway box") sobre un robot SO-101, a partir de observaciones compuestas por el estado de las articulaciones y dos cámaras (frontal y de muñeca). Lo publica el usuario Triz1 mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real en hardware de consumo. Consume un vector de estado de 6 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. La tarea se aprendió de 120 episodios teleoperados (76.043 fotogramas a 30 FPS) del dataset `Triz1/so101_v3`.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) y como política de referencia para quien trabaje con el brazo SO-101. No hay resultados de evaluación publicados ni información sobre licencia, idiomas o benchmarks, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, arXiv:2304.13705) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control visomotor) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.front` | VISUAL | (3, 480, 640) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La política combina un codificador visual para las dos cámaras (frontal y de muñeca), la codificación del estado de las articulaciones y un transformer que genera secuencias de acciones. La predicción por chunks reduce el error de compounding y mejora la estabilidad del control frente a políticas que predicen un único paso.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `Triz1/so101_v3`: 120 episodios, 76.043 fotogramas a 30 FPS, una única tarea ("Put the yellow cube into the subway box"). La configuración reportada es de 47.500 pasos, batch size 4, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens ni composición del dataset más allá de la tarea y los episodios, ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de política). Tampoco se detalla ninguna innovación adicional más allá del propio action chunking del método ACT.

## Capacidades

- Control visomotor de un brazo robótico SO-101 para una tarea de pick-and-place concreta.
- Fusión de dos cámaras (frontal y de muñeca) con el estado de las articulaciones como entrada.
- Predicción de chunks de acciones de 6 dimensiones, lo que permite ejecutar movimientos continuos con menor acumulación de error.
- Ejecución en tiempo real a 30 FPS, coherente con la frecuencia de grabación del dataset.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** la política ejecuta la tarea "Put the yellow cube into the subway box" sobre un SO-101; sirve como base para experimentos de manipulación con un solo objeto y una caja de destino.
- **Reproducción de pipelines de imitación:** usar el repositorio como referencia para validar el flujo completo de LeRobot (grabación, entrenamiento con ACT, despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- **Punto de partida para fine-tuning:** reentrenar la política con un dataset propio del mismo robot y una tarea similar, aprovechando la configuración de entrenamiento documentada (47.500 pasos, lr 1e-05, batch 4).
- **Docencia y formación en robótica de imitación:** el modelo y su dataset asociado permiten ilustrar el ciclo teleoperación-dataset-política en cursos o talleres con hardware asequible.
- **Pruebas de integración de hardware:** validar cámaras, calibración y puertos del SO-101 usando una política ya entrenada como test de extremo a extremo del montaje.
- **Benchmark interno de políticas ACT:** comparar variantes entrenadas por el equipo contra esta política de referencia en la misma tarea y robot, siempre que se replique el mismo setup de cámaras y estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación (posiciones de objetos, iluminación, distracciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, repo de 0,2 GB) es esperable que quepa holgadamente en GPUs de consumo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? Muy probablemente sí por tamaño, pero no está confirmado en la información proporcionada.
- Opciones de despliegue: `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento) de la librería LeRobot 0.7.0. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triz1/act_so101_v3 | ACT (LeRobot) | 51.668.614 | no aplica | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no aplica | no disponible | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | no aplica | no disponible | Hugging Face / docs LeRobot |
| Políticas SmolVLA en LeRobot | VLA | no disponible | no disponible | no disponible | Hugging Face / docs LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a categoría y disponibilidad; cualquier comparación cuantitativa requeriría evaluar cada política en la misma tarea y robot.

## Limitaciones y advertencias

- **Licencia no especificada:** la model card marca la licencia como "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido.
- **Sin evaluación publicada:** no hay tasas de éxito ni condiciones de prueba, por lo que se desconoce su robustez real.
- **Tarea única y muy específica:** entrenada solo para "Put the yellow cube into the subway box"; no generaliza a otras tareas sin reentrenamiento.
- **Dependencia del setup de hardware:** las cámaras deben llamarse `front` y `wrist` y coincidir con las claves de observación; cambios de posición, iluminación o robot pueden degradar el comportamiento.
- **Riesgo de sobreajuste al dataset:** 120 episodios y una sola tarea implican poca diversidad; es esperable un rendimiento frágil ante variaciones de posición de objetos o distracciones.
- **Sesgos conocidos:** no documentados; en robótica de imitación los sesgos provienen de la política del teleoperador y de la distribución del dataset.
- **Riesgo de alucinación:** no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- **Sin soporte multilingüe ni de texto:** no es un modelo de lenguaje; no debe usarse para tareas de NLP.
- **Caveat para producción:** al no haber benchmarks, validación externa ni licencia clara, no se recomienda su despliegue en entornos productivos sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Triz1/act_so101_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Triz1/so101_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Triz1/so101_v3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
