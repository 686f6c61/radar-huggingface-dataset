# YoussefGhallab/regen-real-bowls-delta-iter1000

## Resumen

REGEN real-bowls-delta-iter1000 es un checkpoint experimental de un modelo world-action orientado a robótica, desarrollado por YoussefGhallab. Se construye mediante fine-tuning del modelo base NVIDIA Cosmos-Predict2-2B-Video2World, un modelo generativo de vídeo de 2B parámetros, sobre 99 demostraciones reales de una tarea de apilamiento de cuencos con un brazo Franka. El resultado es una política que predice acciones delta a partir de observaciones visuales y de instrucciones en lenguaje natural.

El modelo aborda el problema de la transferencia de modelos generativos de vídeo a control robótico de manipulación real. En lugar de predecir poses objetivo absolutas, este checkpoint emite incrementos de pose `[dx, dy, dz, droll, dpitch, dyaw]` respecto al estado del robot en cada paso (aproximadamente 1 mm por paso a 30 fps), con un comando de pinza absoluto (0 o 1). Esta elección de espacio de acciones lo hace incompatible con el checkpoint de poses absolutas `regen-real-bowls-iter1000` del mismo autor.

El checkpoint corresponde a la iteración 1000 de un proceso de aprendizaje continuo (continual learning) sobre el dataset privado `YoussefGhallab/stack_bowls_in_size_order_rc`. La tarea entrenada es concreta: apilar tres cuencos en orden de tamaño, empezando por el morado y siguiendo por el verde. Su relevancia es la de un artefacto de investigación reproducible para estudiar políticas visomotoras derivadas de world models, no la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model derivado de Cosmos-Predict2-2B-Video2World (difusión vídeo-a-mundo con cabeza de política) |
| Parametros totales | 2B (heredados del modelo base Cosmos-Predict2-2B-Video2World) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de la tarea están en inglés) |
| Licencia | other (derivada de NVIDIA Cosmos-Predict2-2B-Video2World; consultar sus términos antes de redistribuir) |
| Formato de pesos | `model.pt` (PyTorch), más `t5_embeddings.pkl`, `dataset_statistics.json`, `regen_policy.py` y `shim/` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos-Predict2-2B-Video2World, un modelo generativo de vídeo de 2B parámetros, y se adapta como política visomotora: recibe observaciones visuales (incluida una vista superior del entorno, según `dev_episode_topview.png`) y una instrucción en lenguaje natural, y emite acciones delta de pose del efector final más un comando de pinza. La integración con el robot se realiza mediante `regen_policy.py` y el directorio `shim/`, y el paquete incluye `conversion.json` y `SHA256SUMS` para verificar la integridad y la conversión de pesos.

El entrenamiento se realizó sobre 99 demostraciones reales de apilamiento de cuencos con un Franka, con batch efectivo de 640, 1000 pasos de optimizador y learning rate 1e-4. La pérdida de entrenamiento se mantuvo entre 0,1 y 0,15 en los pasos 500 a 1000, dato que el autor advierte explícitamente que no constituye un resultado de evaluación. El espacio de acciones es delta: `[dx, dy, dz, droll, dpitch, dyaw]` como diferencia entre la pose objetivo y el estado del robot en cada paso, con un desplazamiento típico de aproximadamente 1 mm por paso a 30 fps. El archivo `dataset_statistics.json` contiene las estadísticas delta de las 99 demostraciones y debe usarse tal cual, sin recalcular.

## Capacidades

- Generación de acciones de manipulación robótica en espacio delta a partir de observaciones visuales.
- Condicionamiento por instrucción en lenguaje natural para una tarea específica de apilamiento de cuencos.
- Control de pinza binario (abrir/cerrar) con comando absoluto.
- Política visomotora de un solo brazo sobre robot Franka.
- Integración con un pipeline de despliegue documentado en `DEPLOY_FRANKA.md`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en políticas visomotoras: usar el checkpoint como referencia reproducible para comparar espacios de acciones delta frente a poses absolutas en una misma tarea de manipulación.
- Estudio de aprendizaje continuo: la iteración 1000 sirve como punto de control intermedio para analizar la evolución de la política durante el entrenamiento.
- Transferencia desde world models de vídeo: evaluar cuánto conocimiento de un modelo generativo de vídeo de 2B parámetros se aprovecha para control real en un Franka.
- Reproducción de experimentos: el paquete incluye estadísticas de dataset, embeddings T5 precalculados, script de política y sumas de verificación, lo que facilita replicar el despliegue en un entorno Franka.
- Docencia y demostraciones de robótica: tarea acotada y comprensible (apilar tres cuencos en orden de tamaño) adecuada para prácticas de laboratorio con hardware real.
- Análisis de robustez ante variaciones de iluminación, posición de objetos y vistas de cámara en una tarea de contacto físico.
- No se recomienda su uso en aplicaciones de producción o en tareas distintas a la entrenada, dado su carácter experimental y su naturaleza de checkpoint privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la pérdida de entrenamiento (0,1 a 0,15 entre los pasos 500 y 1000) no es un resultado de evaluación, por lo que no se presentan métricas de éxito en tarea, tasas de acierto ni comparaciones numéricas.

## Requisitos de hardware

- El repositorio ocupa 3,9 GB, lo que corresponde a un checkpoint de aproximadamente 2B parámetros en precisión de 16 bits; la VRAM de inferencia será del orden de varios GB, aunque no se especifica una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con al menos 16-24 GB de VRAM es un punto de partida razonable, pero debe validarse empíricamente.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base Cosmos-Predict2-2B-Video2World está pensado para cargas generativas de vídeo, que suelen requerir más memoria que la inferencia de texto.
- Opciones de despliegue: el paquete incluye `regen_policy.py`, `shim/` y `DEPLOY_FRANKA.md`, que constituyen la vía de despliegue prevista; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La política opera a 30 fps según la descripción de las acciones delta, pero no se aportan mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REGEN real-bowls-delta-iter1000 | 2B (base Cosmos-Predict2-2B-Video2World) | no disponible | Apilamiento de cuencos en Franka, acciones delta | other (derivada de NVIDIA Cosmos) | Hugging Face, 0 descargas |
| REGEN real-bowls-iter1000 (mismo autor) | 2B (mismo base) | no disponible | Misma tarea, poses objetivo absolutas | other | Hugging Face |
| NVIDIA Cosmos-Predict2-2B-Video2World | 2B | no disponible | Generación de vídeo mundo-acción | consultar términos de NVIDIA | Hugging Face |

La comparación con otros modelos de política robótica de propósito general no está disponible en la información proporcionada. La diferencia clave frente al checkpoint de poses absolutas del mismo autor es el espacio de acciones, y ambos no son intercambiables.

## Limitaciones y advertencias

- Checkpoint experimental y privado: no hay evidencia publicada de éxito en tarea ni métricas de evaluación.
- Entrenado exclusivamente para una tarea y un entorno concretos (apilar tres cuencos en orden de tamaño con un Franka); no generaliza a otras tareas ni objetos.
- El espacio de acciones delta lo hace incompatible con el checkpoint de poses absolutas `regen-real-bowls-iter1000`; mezclarlos produce un comportamiento incorrecto.
- `dataset_statistics.json` debe usarse sin recalcular; alterar las estadísticas invalida la normalización de acciones.
- Riesgo de sobreajuste a las 99 demostraciones y a las condiciones de cámara, iluminación y disposición de objetos del dataset privado.
- No se documentan sesgos sociales ni evaluación de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es el fallo físico de la política en manipulación.
- Licencia "other" derivada de NVIDIA Cosmos-Predict2-2B-Video2World: es imprescindible revisar los términos del modelo base antes de cualquier redistribución o uso comercial.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar, lo que limita su integración en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoussefGhallab/regen-real-bowls-delta-iter1000
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
- Guía de despliegue incluida en el repo: `DEPLOY_FRANKA.md` (https://huggingface.co/YoussefGhallab/regen-real-bowls-delta-iter1000/blob/main/DEPLOY_FRANKA.md)
- Checkpoint de poses absolutas del mismo autor: https://huggingface.co/YoussefGhallab/regen-real-bowls-iter1000
- Dataset de entrenamiento (privado): `YoussefGhallab/stack_bowls_in_size_order_rc`
