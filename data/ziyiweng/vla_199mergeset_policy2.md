# ziyiweng/vla_199mergeset_policy2

## Resumen

`ziyiweng/vla_199mergeset_policy2` es una política de imitación robótica basada en SmolVLA, construida sobre el backbone visual-lenguaje `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`. El modelo lo desarrolla el usuario ziyiweng como parte de un proyecto de prácticas de verano en el que se entrena un brazo robótico SO-101 con LeRobot, primero con ACT y después con SmolVLA. Resuelve una tarea concreta de manipulación: introducir un cubo pequeño en una caja amarilla, siguiendo la instrucción en lenguaje natural "put the small cube into the yellow box".

La relevancia es acotada pero ilustrativa: se trata de un ejemplo reproducible de fine-tuning de un VLA (vision-language-action) de menos de 0,5B parámetros sobre datos propios, con 199 episodios y 88 000 fotogramas. Solo se entrena el experto de acciones; el codificador visual y el VLM permanecen congelados, lo que reduce drásticamente el coste de entrenamiento (unas 8,2 horas en una GPU en la nube para 40 000 pasos).

El modelo es de nicho: no es un modelo de propósito general, no está evaluado en el robot real y su única métrica publicada es la pérdida de entrenamiento final (0,076). Debe tratarse como una política de investigación ligada a un montaje físico concreto (cámaras, nombres de joints y resolución determinados) y no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA sobre backbone SmolVLM2-500M-Video-Instruct); solo se entrena el experto de acciones, visión y VLM congelados |
| Parametros totales | 450.046.176 (~0,45B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (la instrucción de entrenamiento está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es una política SmolVLA que combina un backbone vision-language `SmolVLM2-500M-Video-Instruct` con un experto de acciones. Durante el fine-tuning se congela el codificador visual y el VLM, y se entrena únicamente el experto de acciones. La entrada son dos cámaras (vista cenital y vista de muñeca) a 30 fps, redimensionadas con padding a 512×512, más el estado de 6 articulaciones del brazo SO-101; la salida es una acción de 6 dimensiones. Se emplea un chunk size de 50.

El entrenamiento usa el dataset `ziyiweng/vla_199mergeset` (199 episodios, 88 000 fotogramas), con batch size 36, optimizador AdamW, learning rate 1e-4 con decaimiento coseno y 1000 pasos de warmup. Se realizaron 40 000 pasos (~8,2 horas en una GPU en la nube) con aumento de datos de imagen (color jitter, sharpness y pequeñas transformaciones afines aleatorias). La pérdida final de entrenamiento fue 0,076, con meseta a partir de los ~20 000 pasos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones para un brazo SO-101 a partir de observaciones visuales y del estado de las articulaciones.
- Condicionamiento por instrucción en lenguaje natural ("put the small cube into the yellow box").
- Política de imitación con predicción por chunks de 50 acciones.
- Procesamiento de dos flujos de vídeo simultáneos (cámara cenital y de muñeca) a 30 fps.
- Integración con el ecosistema LeRobot para carga del modelo y ejecución en robot mediante `--policy.path`.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es un modelo conversacional ni multilingüe de propósito general; su competencia lingüística se limita a la instrucción de la tarea entrenada.

## Casos de uso

- Reproducción de un pipeline de imitación robótica: sirve como referencia para entrenar una política SmolVLA sobre un brazo SO-101 propio, replicando la configuración de cámaras, chunk size y aumento de datos descrita en la model card.
- Investigación en aprendizaje por imitación: permite estudiar el efecto de congelar el VLM y entrenar solo el experto de acciones en un modelo de ~0,45B, con un coste de cómputo contenido (8,2 horas de GPU).
- Benchmark interno de manipulación pick-and-place: la tarea de introducir un cubo en una caja amarilla es un escenario controlado para comparar ACT frente a SmolVLA en el mismo montaje.
- Docencia y divulgación: el repositorio de GitHub asociado incluye curvas de entrenamiento y vídeos del robot, lo que lo hace útil como material didáctico sobre VLA y LeRobot.
- Punto de partida para fine-tuning adicional: al estar en formato LeRobot y safetensors, puede reutilizarse como inicialización para tareas de manipulación similares con más datos.
- Pruebas de integración de LeRobot: útil para validar el flujo `SmolVLAPolicy.from_pretrained` y los comandos de record/eval en una versión concreta de la librería.
- No es adecuado para despliegues en producción ni para tareas distintas a la entrenada sin reentrenamiento y evaluación en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida final de entrenamiento (0,076) tras 40 000 pasos, y el autor indica explícitamente que el modelo no se ha evaluado en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~0,45B parámetros; en safetensors a 16 bits ocupa aproximadamente 0,9 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia; para reentrenar el experto de acciones, el autor reporta ~8,2 horas en una GPU en la nube no especificada.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño reducido del modelo.
- Opciones de despliegue: LeRobot (`lerobot.policies.smolvla.modeling_smolvla.SmolVLAPolicy`), con ejecución en robot mediante `--policy.path`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ziyiweng/vla_199mergeset_policy2` | ~0,45B | no disponible | Manipulación SO-101 (cubo en caja) | no disponible | Hugging Face, 2 descargas |
| SmolVLA (política base de LeRobot) | ~0,45B | no disponible | Manipulación general con VLA | no disponible en la información proporcionada | Disponible en el ecosistema LeRobot |
| ACT (baseline del mismo proyecto) | no disponible | no disponible | Manipulación SO-101 | no disponible | Entrenado por el mismo autor, sin ficha pública identificada |
| `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` | ~0,5B | no disponible | VLM de vídeo e imagen (no es política) | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No evaluado en el robot real: la pérdida de entrenamiento es la única métrica y no garantiza un comportamiento correcto en el montaje físico.
- Entrenado para una única tarea e instrucción ("put the small cube into the yellow box"); no generaliza a otras instrucciones sin reentrenamiento.
- Dependencia estricta del montaje: mismos nombres de cámara, resolución 512×512 con padding, 30 fps y configuración de joints que en el entrenamiento.
- Dataset pequeño (199 episodios, 88 000 fotogramas) y de un solo operador; riesgo de sobreajuste a condiciones de iluminación, posiciones y objetos concretos.
- La pérdida se estabilizó a partir de los ~20 000 pasos, lo que sugiere rendimientos decrecientes con el volumen de datos actual.
- Licencia no disponible: no puede asumirse uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas no documentados; la instrucción de entrenamiento está en inglés.
- Riesgo de alucinación no aplica en el sentido conversacional, pero sí de acciones erráticas fuera de la distribución de entrenamiento.
- Descargas y likes muy bajos (2 y 0), lo que indica ausencia de validación por parte de la comunidad.
- No apto para producción sin evaluación exhaustiva en el robot y análisis de seguridad del brazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyiweng/vla_199mergeset_policy2
- Dataset de entrenamiento: https://huggingface.co/datasets/ziyiweng/vla_199mergeset
- Repositorio del proyecto (curvas de entrenamiento y vídeos): https://github.com/ziyiweng/so101-imitation-learning
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
