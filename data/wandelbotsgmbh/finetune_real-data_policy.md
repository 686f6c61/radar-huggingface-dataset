# wandelbotsgmbh/finetune_real-data_policy

## Resumen

`wandelbotsgmbh/finetune_real-data_policy` es un modelo de política robótica basado en Action Chunking with Transformers (ACT), desarrollado por Wandelbots GmbH y entrenado con la librería LeRobot de Hugging Face. El modelo aprende tareas de manipulación mediante imitación a partir de datos teleoperados, prediciendo secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en entornos reales. Con 51,6 millones de parámetros, es un modelo compacto pensado para ejecutarse en hardware asequible, y se distribuye bajo licencia Apache 2.0.

Este modelo concreto ha sido ajustado con el dataset `wandelbotsgmbh/real-data`, que contiene datos de teleoperación de robots. Está orientado a la evaluación y despliegue de políticas de control en robots reales, no a tareas de procesamiento de lenguaje. Su relevancia radica en que forma parte de la tendencia de modelos de robótica entrenados con aprendizaje por imitación, con un pipeline estándar definido por LeRobot que facilita su reproducción y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.617.415 |
| Parámetros activos | No aplica (modelo no MoE) |
| Longitud de contexto | No aplica (modelo de control robótico, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (normalmente ResNet) con un transformer condicionado a la observación actual. El modelo genera una secuencia de acciones futuras (chunk) de una sola vez, en lugar de predecir una acción por paso, lo que reduce el error acumulado y mejora la estabilidad del movimiento. El entrenamiento se realiza mediante regresión sobre las acciones teleoperadas, sin necesidad de refuerzo adicional.

Los datos de entrenamiento provienen de `wandelbotsgmbh/real-data`, un dataset de teleoperación real de robots. No se ha publicado información sobre el número de tokens, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. El entrenamiento se realizó con LeRobot, que usa PyTorch como backend, y el checkpoint se publica en formato safetensors.

## Capacidades

- Control robótico: genera secuencias de acciones para brazos robóticos, permitiendo tareas de manipulación como recoger y colocar objetos.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de programación explícita.
- Predicción de acciones a corto plazo: produce chunks de acciones (por ejemplo, 10 pasos) que mejoran la coherencia del movimiento.
- Compatibilidad con LeRobot: puede ejecutarse con las herramientas de entrenamiento y evaluación de LeRobot, incluyendo el registro de episodios de evaluación.
- No posee capacidades de lenguaje natural, generación de texto, visión general, tool calling ni funciones de agente; su ámbito es exclusivamente el control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora y colocarlos en una posición determinada, utilizando las acciones predichas por el chunk.
- Aprendizaje de tareas de ensamblaje: mediante demostraciones teleoperadas de un operador, el modelo aprende a replicar secuencias de inserción y ajuste de piezas en entornos industriales.
- Control de robots en líneas de producción: integrado en un sistema de control, puede sustituir la programación manual de trayectorias para tareas repetitivas.
- Investigación en robótica: el modelo sirve como punto de partida para evaluar técnicas de imitación en entornos reales, ya que su pequeño tamaño permite iterar rápidamente.
- Teleoperación asistida: el modelo puede refinar la teleoperación humana, suavizando los movimientos o corrigiendo errores menores en tiempo real.
- Pruebas de concepto en laboratorios: con un robot SO-100 (como se indica en los ejemplos de LeRobot), el modelo puede ser evaluado en entornos académicos para validar el enfoque ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje. Tampoco se han publicado comparaciones con otros modelos robóticos en términos de tasa de éxito o precisión.

## Requisitos de hardware

- El modelo tiene 51,6 millones de parámetros. En precisión FP32, el peso ocupa aproximadamente 206 MB; en FP16, alrededor de 103 MB. Esto implica que puede ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU para inferencia sencilla.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060 o superiores). Para entrenamiento, se recomienda una GPU con 8 GB o más (como RTX 3070, RTX 4090).
- El modelo es compatible con el ecosistema LeRobot, que se basa en PyTorch. Se puede desplegar con vLLM, llama.cpp u otros sistemas de inferencia de modelos de lenguaje, ya que no es un LLM. La ejecución se realiza mediante el script `lerobot-record` o integrando el modelo en un sistema de control robótico.
- No se han publicado datos de latencia o throughput. Dado el pequeño tamaño, se espera una inferencia rápida (menos de 10 ms en GPU moderna), pero depende del entorno de ejecución.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (políticas robóticas ACT) con los que comparar. El modelo se basa en el mismo algoritmo que otros entrenados con LeRobot, pero no se han publicado resultados comparativos. Se puede indicar que es un modelo de tamaño pequeño dentro de la familia ACT, pero no hay datos concretos para una tabla comparativa.

## Limitaciones y advertencias

- El modelo es específico para tareas de robótica y no puede ser usado para tareas de lenguaje natural, generación de texto o razonamiento general.
- Su rendimiento depende de la calidad y la distribución de los datos de entrenamiento (`real-data`). Si los datos no cubren variaciones del entorno, el modelo puede fallar en situaciones no vistas.
- No se ha publicado información sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, los errores pueden traducirse en movimientos no deseados, por lo que debe probarse en entornos controlados antes de usarse en producción.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright.
- No se especifican limitaciones de contexto ni de idioma, ya que no aplican.
- El modelo se ha entrenado con datos de un dataset concreto; su generalización a otros robots o configuraciones no está garantizada sin un ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandelbotsgmbh/finetune_real-data_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Sitio web de Wandelbots: https://www.wandelbots.com/
- GitHub de Wandelbots: https://github.com/wandelbotsgmbh
