# Taejun00/record-pitch

## Resumen

`Taejun00/record-pitch` es una política de robótica entrenada con LeRobot que implementa el método Action Chunking with Transformers (ACT), presentado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de aprendizaje por imitación que, dado un flujo de observaciones visuales y propioceptivas, predice trozos cortos de acciones (action chunks) para controlar un robot manipulador. El autor es Taejun00 y el modelo se publicó en Hugging Face en noviembre de 2026 con licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Está entrenado sobre el dataset `Taejun00/record-pitch`, presumiblemente grabaciones de teleoperación, y se ejecuta con la librería LeRobot. Su relevancia es práctica: permite reproducir un pipeline completo de entrenamiento e inferencia de una política ACT para un robot tipo SO-100 sin partir de cero.

La ficha se limita a los datos disponibles en la model card y en los metadatos del repositorio. No hay información publicada sobre composición del dataset, número de episodios, tareas concretas ni resultados de evaluación, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Taejun00/record-pitch |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por trozos. En lugar de emitir una acción por paso de control, el modelo genera un chunk de varias acciones futuras, lo que reduce el error de acumulación y suaviza la política. El artículo original (arXiv:2304.13705) describe además una técnica de temporal ensembling para agregar predicciones solapadas durante la inferencia.

La model card no detalla la composición del dataset `Taejun00/record-pitch`, el número de episodios, las tareas teleoperadas ni si se aplicaron aumentos de datos. Tampoco indica hiperparámetros de entrenamiento, número de épocas ni si hubo ajuste fino desde un checkpoint previo. El entrenamiento se realizó con `lerobot-train` usando `--policy.type=act`, según el ejemplo incluido en la model card.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Predicción de acciones multimodales: el chunking permite representar varias acciones plausibles y promediarlas con temporal ensembling.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots tipo SO-100: el ejemplo de evaluación usa `--robot.type=so100_follower`.
- Evaluación episódica: permite grabar episodios de evaluación con prefijo `eval_` en el repositorio de datos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: replicar una tarea de picking-and-placing teleoperada sobre un SO-100, usando el checkpoint como base y ajustándolo con nuevas grabaciones.
- Prototipado rápido de políticas: servir como referencia funcional para validar el pipeline de LeRobot antes de entrenar políticas propias con más datos.
- Evaluación comparativa de métodos de imitación: usar ACT como línea base frente a políticas diffusion o VLA en el mismo robot y dataset.
- Docencia en robótica: demostrar el ciclo completo teleoperación, entrenamiento y despliegue con un modelo pequeño (51,7 M de parámetros) que cabe en GPUs modestas.
- Investigación en chunking de acciones: experimentar con el tamaño del chunk y el temporal ensembling para medir su efecto en la tasa de éxito.
- Automatización de tareas repetitivas de corto alcance: tareas de recogida y colocación en entornos controlados donde la variabilidad visual es baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para 51,7 M de parámetros; el cuello de botella real es el codificador visual y el preprocesado de imágenes.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Taejun00/record-pitch (ACT) | 51,7 M | no aplica | Apache 2.0 | Hugging Face, LeRobot | Política de imitación con chunking |
| ACT original (paper 2304.13705) | no disponible | no aplica | según implementación | Código de referencia | Método base, sin checkpoint publicado asociado |
| Políticas diffusion de LeRobot | no disponible | no aplica | según checkpoint | Hugging Face, LeRobot | Alternativa generativa, mayor coste de inferencia |
| Políticas VLA (p. ej. RT-2, OpenVLA) | cientos de M a miles de M | no aplica | variable | Hugging Face, repos públicos | Mayor generalización, mucho más coste computacional |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publicó tasas de éxito ni métricas de evaluación.

## Limitaciones y advertencias

- No hay datos publicados sobre la tasa de éxito, el número de episodios de entrenamiento ni la variabilidad de las tareas, por lo que no se puede estimar su robustez.
- El modelo está entrenado para un robot y un dataset concretos; generalizar a otra morfología o a otro entorno requiere reentrenamiento.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo o posición de cámara pueden degradar el rendimiento.
- Sin información sobre sesgos: al ser un modelo de robótica no hay sesgos lingüísticos, pero sí posibles sesgos de distribución en las demostraciones (posiciones, objetos y trayectorias sobrerrepresentadas).
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la licencia del dataset `Taejun00/record-pitch` y de los pesos base si se reutilizan.
- No apto para entornos de seguridad crítica sin validación adicional: no hay garantías de comportamiento seguro ante situaciones fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taejun00/record-pitch
- Dataset de entrenamiento: https://huggingface.co/datasets/Taejun00/record-pitch
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
