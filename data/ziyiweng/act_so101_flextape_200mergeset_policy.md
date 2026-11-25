# ziyiweng/act_so101_flextape_200mergeset_policy

## Resumen

ACT (Action Chunking with Transformers) es una política de imitación para control robótico desarrollada por el autor `ziyiweng` como parte de un proyecto de prácticas de verano con el brazo SO-101 y la librería LeRobot. El modelo aprende a ejecutar una tarea de pick-and-place con posición flexible ("flextape") a partir de demostraciones teleoperadas, y constituye la primera fase de un proyecto que posteriormente se amplía con SmolVLA. Con 51,7 millones de parámetros, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto.

Técnicamente se trata de un transformer de chunking de acciones: en lugar de predecir una única acción por paso, genera un bloque de 100 acciones futuras a partir de observaciones multimodales (dos cámaras a 640×480 y 30 fps más el estado articular de 6 grados de libertad). La columna vertebral visual es una ResNet-18 preentrenada en ImageNet, y el entrenamiento sigue un esquema de autoencoder condicionado con pérdida KL, típico de ACT.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot sobre un robot de bajo coste, y como punto de partida para quien quiera replicar la tarea o comparar ACT frente a políticas VLA más grandes como SmolVLA. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de política específico para una tarea y un montaje físico determinados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk size de 100 acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un codificador visual ResNet-18 (pesos de ImageNet) que procesa dos vistas de cámara frontales y cenitales a 640×480 y 30 fps, junto con el estado articular del brazo SO-101 (6 dimensiones). El transformer genera chunks de 100 acciones, lo que reduce el error de acumulación típico de las políticas paso a paso y permite un control más suave. El entrenamiento emplea un esquema de autoencoder condicionado con peso KL de 10, optimizador AdamW con learning rate 1e-5 y weight decay 1e-4, batch size de 8.

Los datos provienen del dataset `ziyiweng/act_so101_flextape_200mergeset`, compuesto por 200 episodios y aproximadamente 149.000 frames, resultado de fusionar tres conjuntos previos (100, 80 y 20 episodios). El entrenamiento se extendió durante 19.000 pasos (unas 3 horas en una GPU en la nube) hasta una pérdida final de 0,255. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es imitación supervisada pura.

## Capacidades

- Control robótico de pick-and-place sobre el brazo SO-101 con posición flexible del objeto.
- Predicción de chunks de 100 acciones a partir de observaciones visuales y propioceptivas.
- Fusión multimodal de dos cámaras (frontal y cenital) con el estado articular de 6 dimensiones.
- Ejecución de políticas en tiempo real mediante la librería LeRobot.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No es un agente conversacional: su única salida es una secuencia de acciones motoras.

## Casos de uso

- Replicación de la tarea de pick-and-place: cargar la política con `ACTPolicy.from_pretrained` y ejecutarla sobre un SO-101 con el mismo montaje de cámaras para reproducir el experimento del autor.
- Punto de partida para fine-tuning: usar el checkpoint como inicialización en tareas de manipulación similares con menos datos, aprovechando los 19.000 pasos ya entrenados.
- Baseline de comparación ACT vs SmolVLA: el propio autor documenta esta comparación en su repositorio de GitHub, de modo que el checkpoint sirve como referencia cuantitativa de la política clásica frente a la VLA.
- Docencia y formación en imitación robótica: pipeline completo y reproducible (dataset, entrenamiento, inferencia) sobre hardware de bajo coste, útil para cursos de robótica de manipulación.
- Validación de infraestructura LeRobot: probar el flujo de `record`/`eval` con `--policy.path` antes de entrenar políticas propias, dado el pequeño tamaño del repo (0,2 GB).
- Investigación en chunking de acciones: analizar el efecto del tamaño de chunk (100) y del peso KL (10) en la suavidad y estabilidad del control, modificando hiperparámetros sobre esta base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registró una evaluación sistemática en robot real para este checkpoint, y que los episodios de validación están incluidos dentro del conjunto de entrenamiento, por lo que no pueden usarse para evaluarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa (FP32) el peso ronda los 0,2 GB, y en FP16 aproximadamente 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en una GPU en la nube no identificada durante unas 3 horas. Para inferencia, cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; el cuello de botella real será el procesamiento de las dos cámaras a 640×480 y 30 fps, no el modelo.
- Opciones de despliegue: librería LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy`), con los comandos `record`/`eval` y `--policy.path`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El chunk size de 100 acciones está diseñado para reducir la frecuencia de inferencia necesaria, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT SO-101 flextape (este) | 51,7 M | ACT + ResNet-18 | chunk de 100 acciones | no disponible | Hugging Face, 3 descargas |
| SmolVLA (referencia del mismo proyecto) | no disponible en esta ficha | VLA | no disponible | no disponible | mencionado en el GitHub del autor |
| ACT original (paper Zhao et al.) | no disponible en esta ficha | ACT | chunk configurable | no disponible | referencia académica |

La comparación cuantitativa con SmolVLA no puede completarse con los datos disponibles; el autor remite a su repositorio de GitHub para las curvas de entrenamiento y los vídeos, pero no se aportan métricas numéricas en la información proporcionada.

## Limitaciones y advertencias

- Evaluación ausente: no hay evaluación sistemática en robot real de este checkpoint, según la propia model card.
- Fuga de validación: los 20 episodios de validación están incluidos en el conjunto de entrenamiento, por lo que cualquier métrica calculada sobre ellos sería inválida.
- Especificidad extrema: la política está entrenada para una tarea concreta (flextape pick-and-place) y un montaje físico concreto (SO-101, dos cámaras con nombres y posiciones determinados); no generaliza a otras tareas ni configuraciones sin reentrenamiento.
- Dependencia del montaje: la model card advierte de que hay que usar los mismos nombres de cámara y la misma configuración que en entrenamiento.
- Licencia no disponible: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto (MMLU, GSM8K, HumanEval) ni usarse como modelo de lenguaje.
- Riesgo de sobreajuste: 19.000 pasos sobre 200 episodios con pérdida final de 0,255 y sin validación independiente sugieren un riesgo real de sobreajuste no cuantificado.
- Sesgos: no documentados; en robótica de imitación los sesgos provienen de la distribución de demostraciones (posiciones, iluminación, objetos), no evaluada aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyiweng/act_so101_flextape_200mergeset_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ziyiweng/act_so101_flextape_200mergeset
- Repositorio del proyecto (curvas, vídeos, write-up): https://github.com/ziyiweng/so101-imitation-learning
