# yz1122/tmax9b-credit-assignment

## Resumen

tmax9b-credit-assignment es un conjunto de checkpoints de ajuste supervisado (SFT) y de trayectorias de entrenamiento derivados de allenai/tmax-9b, un agente de terminal entrenado con aprendizaje por refuerzo sobre Qwen/Qwen3.5-9B. El modelo lo publica el usuario yz1122 en Hugging Face y su interés es fundamentalmente metodológico: estudia el problema de asignación de crédito en trayectorias fallidas de agentes que operan en una terminal Linux, emitiendo comandos de shell y leyendo su salida a lo largo de múltiples turnos.

La pregunta central del estudio es en qué turno de una trayectoria fallida debe recaer la responsabilidad del fallo y si supervisar una reparación en ese turno mejora la política resultante. Los distintos brazos del experimento difieren en dónde se coloca la señal correctiva dentro de la trayectoria y qué información se le permite transportar. Cada subdirectorio de model/ contiene un checkpoint SFT de pesos completos en formato Hugging Face (safetensors más tokenizer) y cada subdirectorio de data/ contiene el conjunto de trayectorias en jsonl que lo produjo, de modo que cualquier brazo puede reproducirse o reanalizarse.

El estado del repositorio es de trabajo en progreso: solo existe el esqueleto de directorios y los checkpoints y datos de trayectorias aún se están subiendo, por lo que el contenido no es definitivo. La licencia Apache-2.0 se hereda de ambos modelos upstream, que también la emplean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B vía allenai/tmax-9b); detalles no disponibles |
| Parametros totales | 9B (según el nombre del modelo base y la referencia a Qwen3.5-9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints publicados en safetensors de pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors + tokenizer (formato Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de 9.000 millones de parámetros procedente de Qwen/Qwen3.5-9B, sobre el que allenai/tmax-9b aplicó un entrenamiento con DPPO (una variante de optimización de política con refuerzo) para convertirlo en agente de terminal. Los checkpoints de este repositorio son ajustes supervisados adicionales sobre esa política, uno por cada brazo del estudio de asignación de crédito, acompañados de los conjuntos de trayectorias en jsonl que los generaron.

El eje técnico del trabajo no es la arquitectura sino la construcción de la señal de supervisión: en una trayectoria fallida de varios turnos, se decide en qué turno situar la corrección y qué contexto se le permite llevar, y se comprueba si esa supervisión localizada mejora la política. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de RLHF o DPO tras el SFT.

## Capacidades

- Ejecución de comandos de shell en una terminal Linux, con lectura de la salida entre turnos.
- Razonamiento multi-turno orientado a tareas de terminal (agente con bucle de observación-acción).
- Corrección y reparación de trayectorias fallidas, que es precisamente la habilidad que el estudio intenta reforzar mediante la señal de asignación de crédito.
- Generación de texto y razonamiento general heredados del modelo base, aunque no se documentan evaluaciones específicas.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en asignación de crédito para agentes: comparar los distintos brazos del repositorio (dónde se coloca la señal correctiva) sobre una misma política base para medir el efecto en la tasa de éxito de tareas de terminal.
- Reproducción de experimentos de SFT: cada subdirectorio de data/ contiene las trayectorias exactas que produjeron el checkpoint correspondiente, lo que permite reentrenar o reanalizar un brazo concreto.
- Automatización de tareas de administración de sistemas: el modelo puede emitir comandos y leer su salida de forma iterativa, lo que encaja en flujos de diagnóstico y reparación de entornos Linux.
- Análisis de fallos en agentes: las trayectorias en jsonl sirven para estudiar patrones de error y diseñar mejores estrategias de supervisión.
- Punto de partida para fine-tuning propio: al ser un checkpoint de pesos completos con licencia Apache-2.0, puede adaptarse a dominios de terminal específicos.
- Evaluación de metodologías de SFT frente a RL: al derivar de una política entrenada con DPPO, permite comparar el efecto de la supervisión localizada frente al refuerzo.
- Docencia y divulgación: ejemplo práctico de cómo se construye y etiqueta una trayectoria de agente para entrenamiento supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de 9B en FP16 se requieren del orden de 18 GB de pesos, y en cuantización de 8 bits alrededor de 9-10 GB, aunque estas cifras son estimaciones genéricas y no datos publicados para este modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 9B en cuantización de 4-8 bits podría caber en GPUs de consumo con 16-24 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: los checkpoints están en formato Hugging Face (safetensors + tokenizer), por lo que son compatibles con stacks estándar como transformers, vLLM o TGI; no se documenta soporte específico para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yz1122/tmax9b-credit-assignment | 9B | no disponible | SFT sobre tmax-9b (DPPO) | Apache-2.0 | Repositorio en progreso, checkpoints pendientes de subida |
| allenai/tmax-9b | 9B | no disponible | DPPO, agente de terminal | Apache-2.0 | Modelo base publicado |
| Qwen/Qwen3.5-9B | 9B | no disponible | Modelo base generalista | Apache-2.0 | Modelo base publicado |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado de trabajo en progreso: solo existe el esqueleto de directorios; los checkpoints y las trayectorias aún se están subiendo y el contenido no es definitivo.
- No hay benchmarks publicados, por lo que no puede evaluarse su rendimiento frente a alternativas.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma o contexto.
- El modelo está especializado en tareas de terminal; su comportamiento fuera de ese dominio no está caracterizado.
- Aunque la licencia Apache-2.0 permite uso comercial, la ausencia de evaluaciones y el estado incompleto del repositorio desaconsejan su uso en producción sin validación previa.
- No se especifica la cita académica del trabajo (figura como TBD), lo que dificulta la trazabilidad metodológica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yz1122/tmax9b-credit-assignment
- Modelo base tmax-9b: https://huggingface.co/allenai/tmax-9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
