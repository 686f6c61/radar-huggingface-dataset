# williamdgomez/act_so101_left

## Resumen

`act_so101_left` es una política de imitación basada en Action Chunking with Transformers (ACT), un método presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario williamdgomez en Hugging Face mediante la librería LeRobot de Hugging Face, y está entrenado sobre el dataset `williamdgomez/left` para control robótico con un brazo SO-101 (variante `so100_follower` en los comandos de evaluación).

No es un modelo de lenguaje: es un policy de robótica que mapea observaciones visuales y de estado del robot a comandos motores. Con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, su relevancia es práctica para quien quiera reproducir o adaptar un pipeline de aprendizaje por imitación con LeRobot sobre hardware asequible (SO-100/SO-101).

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de robótica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de generar una acción por paso de control, el modelo emite un bloque de acciones futuras, lo que reduce el error de acumulación y estabiliza el control. La implementación concreta es la de LeRobot, la librería de Hugging Face para robótica, con pipeline `robotics` y tipo de política `act`.

El entrenamiento se realiza sobre datos de teleoperación. En este caso, el dataset asociado es `williamdgomez/left`, y la model card documenta el flujo de entrenamiento con `lerobot-train` (policy.type=act, device=cuda) y la evaluación con `lerobot-record` sobre un robot `so100_follower`. No se especifican en la información disponible el número de episodios, la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO; para robótica de imitación estos datos no aplican del mismo modo que en LLM.

## Capacidades

- Control robótico por imitación: genera comandos motores para un brazo SO-101 a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones, que mejora la suavidad y la robustez del control frente a políticas paso a paso.
- Ejecución de tareas manipulativas aprendidas del dataset `williamdgomez/left` (el alcance concreto de las tareas no está detallado en la información disponible).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios mediante CLI (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como checkpoint de referencia para validar un pipeline LeRobot completo (entrenamiento, evaluación y grabación de episodios) sobre un SO-101.
- Automatización de tareas de manipulación teleoperadas: el modelo aprende de demostraciones humanas y puede ejecutar de forma autónoma las tareas recogidas en el dataset `williamdgomez/left`.
- Base para fine-tuning con datos propios: al ser un policy ACT de 51,7 M de parámetros, es viable reentrenarlo o ajustarlo con un dataset nuevo del mismo robot sin requerir grandes recursos de cómputo.
- Evaluación comparativa de políticas: útil para contrastar ACT frente a otras políticas de LeRobot (por ejemplo, diffusion policy) en el mismo entorno y hardware.
- Docencia y prototipado en laboratorio: permite montar un banco de pruebas de aprendizaje por imitación con hardware asequible y comandos reproducibles.
- Investigación en chunking de acciones: el checkpoint permite estudiar el efecto del tamaño de chunk y de la arquitectura en la tasa de éxito, siempre que se disponga del entorno físico o simulado correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU recomendadas: los comandos de la model card usan `--policy.device=cuda`; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: previsiblemente compatible con tarjetas consumer por el tamaño del modelo, si bien no hay confirmación en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) con política `act`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_left (este modelo) | 51.668.614 | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, vía LeRobot |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | variable según checkpoint | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | variable según checkpoint | Hugging Face |

No se dispone de datos comparativos verificables en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo específico de robótica: no debe evaluarse como un LLM ni usarse para tareas de texto, código o razonamiento.
- Dependencia del hardware y del dataset: el comportamiento está ligado al robot SO-101 y a las condiciones de `williamdgomez/left`; fuera de ese entorno la política puede degradarse.
- Sin benchmarks ni métricas de tasa de éxito publicadas, por lo que no hay evidencia cuantitativa de robustez.
- Riesgo de sobreajuste a las demostraciones de teleoperación y de fallo ante variaciones de iluminación, posición de objetos o cambios en la escena.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset asociado y de las dependencias de LeRobot.
- No se documentan sesgos, límites de contexto ni restricciones idiomáticas porque no aplican al tipo de modelo; cualquier uso en producción requiere validación propia en el entorno real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/williamdgomez/act_so101_left
- Dataset asociado: https://huggingface.co/datasets/williamdgomez/left
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
