# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_fullvision-steps30k-decay30k

## Resumen

Este repositorio contiene un *policy* de robótica entrenado con LeRobot, un fine-tuning del modelo fundacional visión-lenguaje-acción π₀ (Pi0) de Physical Intelligence sobre un conjunto de datos propio del autor (`team-sobits`). El modelo resuelve una tarea de manipulación concreta: lanzar una lata de tomate a una papelera, ejecutada por un manipulador móvil con dos cámaras (cabeza y mano izquierda). No es un modelo de lenguaje general, sino una política de imitación que mapea observaciones multimodales (estado de 20 dimensiones más dos flujos de imagen) a acciones de 20 dimensiones.

El entrenamiento se realizó sobre 200 episodios y 48.141 fotogramas a 10 FPS en simulación, con 30.000 pasos de optimización, batch de 20, AdamW y tasa de aprendizaje 2,5e-5. El nombre del repositorio indica un ajuste LoRA sobre la torre VLM de π₀ con visión completa, con un decaimiento de learning rate a partir del paso 30.000. El resultado es un artefacto muy especializado, útil como referencia de pipeline de imitation learning con LeRobot y como punto de partida para reproducir el flujo de entrenamiento, más que como modelo de propósito general.

La relevancia actual es doble: por un lado, demuestra el ecosistema de LeRobot para fine-tuning de VLA sobre datasets pequeños y hardware consumer; por otro, ejemplifica las limitaciones de los *policies* de imitación cuando el dataset es sintético y de una sola tarea. El repositorio pesa 16,8 GB y se distribuye bajo licencia Apache 2.0, lo que permite reutilización comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (π₀ / Pi0), transformer con torre VLM y cabeza de acciones; fine-tuning LoRA sobre la torre VLM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, pero no se documenta cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`, pipeline `robotics`) |

## Arquitectura y entrenamiento

El modelo base es π₀ de Physical Intelligence, una política generalista visión-lenguaje-acción que combina un backbone VLM con un cabezal de generación de acciones. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. En este fine-tuning concreto, el nombre del checkpoint sugiere que se aplicó LoRA sobre la torre VLM (`pi0_vlmlora`) manteniendo la visión completa (`fullvision`), con un total de 30.000 pasos de entrenamiento y un decaimiento de learning rate a partir del paso 30.000 (`steps30k-decay30k`).

Los datos de entrenamiento provienen del dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`: 200 episodios, 48.141 fotogramas a 10 FPS, una única tarea ("Throw the tomato can into the trash bin") y observaciones de un manipulador móvil con cámara de cabeza (480×640) y cámara de mano izquierda (400×640). La configuración de entrenamiento documentada incluye batch de 20, optimizador AdamW, learning rate 2,5e-5, semilla 1000 y LeRobot 0.6.1. No se documentan datos de RLHF, DPO ni innovaciones técnicas adicionales más allá del fine-tuning LoRA. El carácter "sim" del dataset indica que los episodios se generaron en simulación, lo que condiciona la transferencia a robots reales.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y estado propioceptivo de 20 dimensiones.
- Condicionamiento por instrucción en lenguaje natural ("Throw the tomato can into the trash bin") como tarea objetivo.
- Procesamiento de dos flujos visuales simultáneos: cámara de cabeza y cámara de mano izquierda.
- Control de un manipulador móvil con salida de acciones de 20 dimensiones.
- Ejecución de una política de imitación entrenada end-to-end, sin planificación simbólica explícita.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de pipelines de imitation learning: sirve como referencia para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un dataset pequeño y una tarea acotada.
- Prototipado de manipulación pick-and-place en simulación: el modelo puede ejecutarse sobre el manipulador móvil simulado para validar la cadena de percepción-acción antes de invertir en hardware real.
- Benchmark interno de fine-tuning LoRA sobre π₀: permite comparar configuraciones de LoRA, resolución de visión y número de pasos sobre una tarea controlada.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de entrenamiento y rollout que facilitan explicar el ciclo completo de un VLA.
- Base para fine-tuning posterior en tareas de recogida de residuos: al estar bajo Apache 2.0, puede reutilizarse como inicialización para tareas similares con datasets propios.
- Validación de infraestructura de entrenamiento: con 16,8 GB de pesos y 30.000 pasos documentados, sirve para medir throughput y consumo de VRAM en GPUs concretas antes de escalar a modelos mayores.
- Generación de datos sintéticos de demostración: el dataset asociado (200 episodios, 48.141 fotogramas) puede reutilizarse para entrenar otras políticas o para aumentar datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica (success rate, episode return) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; el repositorio pesa 16,8 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precisión completa, más overhead de activaciones y buffers de imagen.
- GPU recomendadas: no especificadas por el autor; por tamaño, se espera que requiera GPUs de datacenter (A100 40/80 GB, H100) o GPUs consumer de gama alta con 24 GB o más (RTX 3090, RTX 4090) para inferencia en precisión reducida, aunque no se confirma.
- Cabe en consumer GPU: no confirmado; el tamaño del repo (16,8 GB) sugiere que sí es posible en GPUs de 24 GB con cuantización o carga parcial, pero no hay datos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.path` apuntando al repositorio de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_fullvision-steps30k-decay30k | no disponible | no disponible | Manipulación (lata a papelera) | Apache 2.0 | Hugging Face, 13 descargas |
| lerobot/pi0_base | no disponible | no disponible | VLA generalista | no disponible en la información | Hugging Face (modelo base) |
| π₀ de Physical Intelligence (OpenPI) | no disponible | no disponible | VLA generalista multi-robot | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación se limita a la relación de fine-tuning (este checkpoint deriva de `lerobot/pi0_base`, que a su vez implementa π₀) y a la licencia.

## Limitaciones y advertencias

- Entrenado sobre una única tarea ("Throw the tomato can into the trash bin"); no generaliza a otras tareas sin reentrenamiento.
- Dataset generado en simulación (`sim` en el nombre), lo que implica una brecha de transferencia (*sim-to-real gap*) no cuantificada.
- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito ni de robustez ante cambios de iluminación, posición de objetos o distracciones.
- Solo 200 episodios y 48.141 fotogramas, un volumen reducido para un VLA; riesgo de sobreajuste a las condiciones del simulador.
- Requiere que los nombres y resoluciones de cámara coincidan exactamente con los del entrenamiento (`head_camera` 480×640, `hand_left_camera` 400×640); cualquier cambio invalida la política.
- Dependencia de la versión de LeRobot 0.6.1 para reproducir el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos ni evaluaciones de seguridad física; el despliegue en robots reales requiere supervisión.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de acciones erráticas fuera de distribución.
- No se documentan idiomas soportados para las instrucciones de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_fullvision-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
