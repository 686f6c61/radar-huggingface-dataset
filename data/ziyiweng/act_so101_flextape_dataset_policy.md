# ziyiweng/act_so101_flextape_dataset_policy

## Resumen

`ziyiweng/act_so101_flextape_dataset_policy` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para controlar un brazo robótico SO-101 en una tarea de pick-and-place con posiciones variables del objeto. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones visuales (dos cámaras) y el estado articular del robot a secuencias de acciones motoras. Lo desarrolla ziyiweng como parte de un proyecto de prácticas de verano que compara ACT con SmolVLA sobre el mismo hardware.

El modelo tiene 51.668.614 parámetros y un backbone de visión ResNet-18 preentrenado en ImageNet. Se entrenó sobre 100 episodios (unas 75.000 imágenes) del dataset `act_so101_flextape_dataset`, durante 40.000 pasos, con un tamaño de chunk de 100 acciones y una pérdida final de entrenamiento de 0,121.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento ACT, evaluación en robot real) sobre una plataforma de bajo coste como el SO-101, y como punto de partida para quien quiera replicar o adaptar el flujo con LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; chunk de acciones de 100) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual (ResNet-18 con pesos de ImageNet) con un transformer que predice trozos de acciones (action chunks) de longitud 100, más un componente de autoencoder condicional variacional (CVAE) con peso KL de 10. La entrada incluye el estado articular de 6 grados de libertad del brazo SO-101 y dos cámaras (frontal y cenital) a 640×480 y 30 fps. La salida es una secuencia de acciones articulares de 6 dimensiones.

El entrenamiento usó 100 episodios (aproximadamente 75.000 frames) de `ziyiweng/act_so101_flextape_dataset`, con batch size 8, optimizador AdamW, learning rate 1e-5 y weight decay 1e-4, durante 40.000 pasos (unas 6,2 horas en una GPU en la nube). La pérdida final de entrenamiento fue 0,121. No se documenta uso de RLHF, DPO ni refuerzo; es imitación supervisada pura. Existe un conjunto de validación separado (`act_so101_flextape_valiset`, 20 episodios) que no se usó para entrenar.

## Capacidades

- Control robótico de pick-and-place: agarra un objeto colocado en posiciones variables dentro del espacio de trabajo y lo deposita en una caja amarilla.
- Predicción de acciones en chunks de 100 pasos, lo que reduce el error de compounding típico de las políticas paso a paso.
- Fusión de dos vistas de cámara (frontal y cenital) con estado articular proprioceptivo de 6 dimensiones.
- Integración nativa con LeRobot para grabación y evaluación en robot real.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico entrenado.

## Casos de uso

- Replicación de pipelines de imitación: sirve como ejemplo completo y reproducible de entrenamiento ACT con LeRobot sobre un brazo SO-101, útil para docencia o para validar una instalación antes de grabar datos propios.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un objeto en posiciones variables y soltarlo en una caja, adecuado para prototipos de manipulación con objetos ligeros.
- Base para fine-tuning con nuevos objetos: al estar entrenado sobre 75.000 frames, puede servir de inicialización para adaptar la política a otras geometrías u objetos con un dataset más pequeño.
- Evaluación comparativa ACT frente a SmolVLA: el autor plantea el proyecto como comparación entre ambas políticas sobre el mismo hardware, por lo que el checkpoint es útil como referencia de la fase ACT.
- Banco de pruebas de evaluación en robot real: el conjunto de validación de 20 episodios y las 15 pruebas filmadas (13 éxitos) permiten reproducir una metodología de evaluación con métricas de éxito.
- Demostración de despliegue con LeRobot: cargar la política con `ACTPolicy.from_pretrained` y pasarla a los comandos de record/eval de LeRobot sirve para verificar el flujo de despliegue de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El único dato de rendimiento es cualitativo y proviene de la model card: 13 de 15 pruebas filmadas en robot real tuvieron éxito, aunque el autor indica que no registró el checkpoint exacto usado en cada vídeo.

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,121 |
| Éxito en pruebas filmadas | 13/15 |
| Benchmarks estandarizados (MMLU, HumanEval, etc.) | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y backbone ResNet-18, la huella es reducida y compatible con GPUs de consumo, aunque no se publica una cifra concreta.
- GPU recomendadas: no disponibles; el entrenamiento se realizó en una GPU en la nube no especificada durante unas 6,2 horas.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo, pero no hay confirmación explícita ni modelo de GPU indicado.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained` y comandos record/eval con `--policy.path`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_flextape_dataset_policy (este) | 51,7 M | chunk de 100 acciones | Pick-and-place SO-101 | no disponible | Hugging Face |
| SmolVLA (referencia del mismo proyecto) | no disponible | no disponible | Políticas VLA para robótica | no disponible | no disponible |
| Otras políticas ACT de LeRobot | variable | variable | Imitación robótica | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo ejecuta la tarea concreta de pick-and-place sobre una caja amarilla con el setup de cámaras y robot del entrenamiento.
- Sensible al setup: requiere los mismos nombres de cámara, resolución (640×480), tasa (30 fps) y disposición física que en el entrenamiento; cambios en la iluminación o la posición de las cámaras degradan el comportamiento.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- Riesgo de sobreajuste al objeto y al entorno: entrenado con 100 episodios de un único objeto y espacio de trabajo.
- Trazabilidad incompleta: el autor no registró qué checkpoint generó cada vídeo de éxito, lo que dificulta reproducir exactamente los resultados filmados.
- Sin métricas de éxito cuantitativas formales más allá de 13/15 en pruebas filmadas.
- No apto para tareas de lenguaje, razonamiento, código o visión general: su ámbito es exclusivamente el control motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyiweng/act_so101_flextape_dataset_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ziyiweng/act_so101_flextape_dataset
- Dataset de validación: https://huggingface.co/datasets/ziyiweng/act_so101_flextape_valiset
- Repositorio del proyecto (GitHub): https://github.com/ziyiweng/so101-imitation-learning
- LeRobot: https://github.com/huggingface/lerobot
