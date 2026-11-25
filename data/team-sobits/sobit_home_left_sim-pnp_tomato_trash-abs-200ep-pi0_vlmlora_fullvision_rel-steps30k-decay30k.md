# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_fullvision_rel-steps30k-decay30k

## Resumen

Este repositorio contiene una política de robótica entrenada mediante aprendizaje por imitación sobre el modelo base π₀ (Pi0) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Se trata de un fine-tuning especializado para un robot móvil manipulador (`mobile_manipulator`) con dos cámaras (cabeza y mano izquierda) y una tarea concreta: lanzar una lata de tomate a una papelera. El modelo consume observaciones multimodales (estado de 20 dimensiones más dos flujos de imagen) y produce un vector de acción de 20 dimensiones a 10 FPS.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de despliegue de un modelo visión-lenguaje-acción (VLA) en un dominio específico de manipulación robótica. Por otro, sirve como ejemplo de la cadena de herramientas LeRobot para fine-tuning de políticas sobre el modelo base `lerobot/pi0_base`, que es la implementación abierta del π₀ original.

El nombre del repositorio revela detalles del entrenamiento: `pi0_vlmlora_fullvision_rel-steps30k-decay30k`, lo que indica un ajuste con LoRA sobre la torre visión-lenguaje, visión completa y 30 000 pasos con decaimiento del learning rate. El dataset de entrenamiento consta de 200 episodios y 48 141 frames simulados de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (flow matching sobre transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo base π₀ es una política VLA generalista que combina un backbone visión-lenguaje con un cabezal de acciones basado en flow matching. La implementación de LeRobot se adapta del repositorio OpenPI de Physical Intelligence. En este fine-tuning concreto, el nombre del checkpoint indica que se ha aplicado LoRA sobre la torre visión-lenguaje (`vlmlora`), se ha usado visión completa (`fullvision`) y se ha entrenado durante 30 000 pasos con decaimiento (`steps30k-decay30k`).

El entrenamiento se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48 141 frames grabados a 10 FPS en simulación. La tarea única es "Throw the tomato can into the trash bin". La configuración reportada incluye batch size 20, optimizador AdamW, learning rate 2.5e-05, semilla 1000 y LeRobot 0.6.1. No se especifica el número de tokens de entrenamiento ni la composición del dataset más allá de los episodios citados.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones para un robot `mobile_manipulator` a partir de observaciones de estado y dos cámaras.
- Percepción visual multimodal: procesa simultáneamente una cámara de cabeza (480×640) y una cámara de mano izquierda (400×640).
- Ejecución de instrucciones en lenguaje natural: la tarea se especifica mediante el prompt "Throw the tomato can into the trash bin".
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones simuladas.
- Especialización en una tarea única: no es un modelo generalista; está fine-tuneado para una tarea concreta.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni multilingüismo más allá del prompt de tarea.

## Casos de uso

- Manipulación robótica simulada de recogida y vertido: el modelo puede ejecutar la secuencia completa de agarrar una lata y lanzarla a una papelera en un entorno simulado, sirviendo como base para validar pipelines de imitación antes de transferir a hardware real.
- Investigación en aprendizaje por imitación: útil como referencia de fine-tuning LoRA sobre π₀ para estudiar el efecto del número de episodios (200) y pasos (30 000) en la convergencia de políticas VLA.
- Benchmark de herramientas LeRobot: permite reproducir el flujo `lerobot-train` y `lerobot-rollout` con un caso concreto y verificar la integración de cámaras, estado y acciones de 20 dimensiones.
- Prototipado de tareas de recogida de residuos: la política puede adaptarse a variantes (otros objetos, otras papeleras) reentrenando sobre datasets similares con el mismo esquema de observación.
- Docencia y demostraciones: ejemplo didáctico de política VLA entrenada de extremo a extremo con datos simulados y licencia permisiva.
- Base para transferencia sim-to-real: aunque no se reportan resultados en hardware real, el checkpoint puede servir como inicialización para fine-tuning con datos reales del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repo pesa 16,8 GB, lo que sugiere pesos en precisión completa o mixta; una estimación conservadora sería ≥16 GB en FP16, pero no se confirma).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del repo se recomienda al menos una GPU con 24 GB (RTX 3090/4090) o superior (A100, H100) para margen.
- Cabe en consumer GPU: probablemente en RTX 3090/4090 por capacidad de VRAM, aunque no confirmado.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path` apuntando al repo; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles; la frecuencia de control del dataset es 10 FPS, lo que da una referencia del ritmo de inferencia esperado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune π₀) | no disponible | no disponible | Manipulación móvil, tarea única | apache-2.0 | Hugging Face (19 descargas) |
| lerobot/pi0_base | no disponible | no disponible | Política VLA generalista | no disponible en la información | Hugging Face |
| π₀ original (OpenPI) | no disponible | no disponible | Política VLA generalista | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Throw the tomato can into the trash bin"); no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento en simulación: no hay evidencia de transferencia a robot real; el gap sim-to-real puede degradar el rendimiento.
- Sin evaluación publicada: no se reportan tasas de éxito, por lo que no se puede afirmar su fiabilidad.
- Dependencia de configuración de hardware: requiere un robot `mobile_manipulator` con cámaras en posiciones y nombres exactos (`head_camera`, `hand_left_camera`) y un espacio de estado/acción de 20 dimensiones.
- Riesgo de sobreajuste al dataset: 200 episodios de una sola tarea y un solo entorno pueden limitar la robustez ante cambios de iluminación, posición de objetos o distractores.
- Licencia apache-2.0: permisiva para uso comercial, pero conviene verificar las licencias del modelo base `lerobot/pi0_base` y de los datos de entrenamiento.
- Idiomas: no se documenta soporte multilingüe; el prompt de tarea está en inglés.
- Sin información sobre sesgos: no se han publicado análisis de sesgos para esta política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_fullvision_rel-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
