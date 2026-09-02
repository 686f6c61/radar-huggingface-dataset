# XDQAQ/Qwen3-8B-MaKTO-Public-SFT

## Resumen

El modelo `XDQAQ/Qwen3-8B-MaKTO-Public-SFT` es un checkpoint de fine-tuning completo (full-parameter SFT) sobre el modelo base `Qwen/Qwen3-8B`, desarrollado por el usuario XDQAQ como una reproducción independiente inspirada en el artículo MaKTO (arXiv:2501.14225). El objetivo del modelo es especializarse en el razonamiento y la interacción conversacional dentro del juego de rol social "Werewolf" (lobo), también conocido como "Hombres Lobo" o "Mafia". Se entrena exclusivamente con la parte pública en chino del dataset `ReneeYe/werewolf_game_reasoning`, que contiene 12.886 ejemplos de comportamiento de juego, técnicas avanzadas y terminología fundamental.

A diferencia del pipeline completo descrito en el paper MaKTO, este modelo solo ha pasado por la etapa de SFT supervisado; no se ha realizado la etapa de Multi-agent KTO ni se han utilizado los aproximadamente 12K ejemplos de propósito general que no son públicos. Por tanto, el modelo está pensado como una base especializada para tareas de razonamiento estratégico en juegos de lenguaje, no como un asistente general. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el autor advierte que no ha sido evaluado fuera de su dominio de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con modo thinking/no-thinking |
| Parametros totales | 8.000 millones (modelo base) / 308.224 (dato safetensors, probablemente erróneo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 (modelo base) / 6.144 (máximo de entrenamiento) |
| Tipos de cuantizacion | No disponible (safetensors BF16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-8B, un transformer denso con 8.000 millones de parámetros que incorpora el mecanismo de razonamiento híbrido (thinking/no-thinking) característico de la familia Qwen3. En este fine-tuning se utiliza únicamente la plantilla de chat sin modo thinking (non-thinking), según se indica en la model card. El entrenamiento se realizó con precisión BF16 en 4 GPUs con DeepSpeed ZeRO-3, durante 3 épocas, con una tasa de aprendizaje de 1e-6, scheduler cosine, warmup del 5% y un tamaño de batch efectivo de 16. La longitud máxima de secuencia fue de 6.144 tokens.

El dataset de entrenamiento, convertido a partir de la revisión `7d7d516f780879dbe9f512ef29655f51548f7578`, incluye 12.134 ejemplos de comportamiento de juego, 372 ejemplos de técnicas avanzadas y 380 ejemplos de términos fundamentales. El entrenamiento completó 2.418 pasos de optimización con una pérdida final de 0,7518. No se utilizó un conjunto de evaluación separado durante el entrenamiento. No se aplicaron técnicas de RLHF ni DPO, ya que la etapa de KTO multi-agente no se ha realizado en esta versión.

## Capacidades

- Razonamiento estratégico en juegos de rol social, específicamente en partidas de Werewolf (lobo) con interacciones multi-turno.
- Análisis de la situación del juego: identificación de roles, detección de mentiras, votaciones y deducción de identidades.
- Generación de texto conversacional en chino con estilo adaptado al juego, incluyendo declaraciones, acusaciones y defensas.
- Uso de la plantilla de chat no-thinking de Qwen3, lo que permite respuestas directas sin razonamiento explícito.
- Soporte de tool calling y function calling no disponible (no se ha entrenado para ello).
- Capacidades multilingües limitadas: solo se ha entrenado en chino, aunque el modelo base Qwen3-8B es multilingüe, el fine-tuning puede degradar su rendimiento en otros idiomas.
- No incluye capacidades de visión, audio ni multimodales.

## Casos de uso

- Simulación de partidas de Werewolf para investigación: el modelo puede actuar como jugador controlado por IA en entornos de simulación multi-agente, permitiendo estudiar estrategias de engaño y cooperación.
- Entrenamiento de agentes de juego: sirve como política base para reforzar con técnicas como KTO o RLHF en el dominio de juegos de lenguaje, tal como propone el paper MaKTO.
- Análisis de razonamiento deductivo: puede utilizarse para generar explicaciones de deducciones lógicas en escenarios con información parcial y jugadores ocultos.
- Generación de diálogos para juegos de rol: desarrolladores de juegos de mesa o videojuegos pueden integrarlo como NPC que participa en partidas de Werewolf con jugadores humanos.
- Evaluación de robustez en entornos adversariales: dado que el modelo está entrenado para detectar mentiras y engaños, puede emplearse como banco de pruebas para medir la capacidad de otros modelos en tareas de detección de engaño.
- Fine-tuning adicional sobre dominios relacionados: al ser un checkpoint de SFT, puede servir como punto de partida para especializarse en otros juegos de deducción social (Secret Hitler, Among Us, etc.) con relativamente pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor indica explícitamente que el modelo no ha sido evaluado como asistente general y que su rendimiento solo se ha verificado cualitativamente en el dominio de Werewolf.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parámetros en BF16, se requieren aproximadamente 16 GB de VRAM para cargar los pesos en memoria sin cuantización. Con cuantización a 8 bits (no disponible en el repo, pero aplicable al modelo base) se podría reducir a unos 8-10 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) para inferencia con contexto largo y batch grande. En consumer GPU, una RTX 3090 o 4090 es suficiente para uso interactivo.
- Opciones de despliegue: compatible con transformers (>=4.51.0), vLLM, TGI y llama.cpp (si se convierten los pesos a GGUF). También se puede servir con Ollama tras conversión.
- Latencia y throughput estimados: no se dispone de mediciones específicas. Para un modelo de 8B en una GPU A100, se espera una generación de aproximadamente 50-100 tokens/s con batch 1, aunque estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32.768 | Asistente general multilingue | Apache 2.0 |
| Qwen3-8B-MaKTO-Public-SFT (este) | 8B (fine-tuned) | 32.768 (base) / 6.144 (entrenamiento) | Juego Werewolf en chino | Apache 2.0 |
| Qwen2.5-7B (base) | 7B | 32.768 | Asistente general | Apache 2.0 |

La comparativa se basa en el modelo base, ya que no existen benchmarks públicos del fine-tuning. Frente al Qwen3-8B original, este checkpoint pierde capacidad generalista pero gana especialización en razonamiento estratégico para juegos de rol. Frente a Qwen2.5-7B, Qwen3-8B ya era superior en matemáticas y código, y este fine-tuning añade un dominio específico que el modelo base no cubre.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en juegos de lenguaje y Werewolf; su rendimiento como asistente general no ha sido evaluado y puede ser deficiente.
- Los outputs pueden ser incorrectos, inconsistentes o estratégicamente engañosos, en coherencia con el dominio de entrenamiento. Esto es intencionado pero puede resultar inapropiado en contextos donde se requiera honestidad.
- No se ha realizado la etapa de Multi-agent KTO descrita en el paper MaKTO, por lo que no se ha optimizado para interacciones entre múltiples agentes.
- Solo se ha entrenado en chino; el uso en otros idiomas puede producir resultados degradados o incoherentes.
- La longitud de contexto efectiva durante el entrenamiento fue de 6.144 tokens, muy inferior a los 32.768 del modelo base, lo que puede limitar el razonamiento en partidas largas con mucho historial.
- No se proporcionan cuantizaciones oficiales; los usuarios deben convertir los pesos si necesitan reducir el uso de memoria.
- El dataset fuente está marcado como MIT, pero el modelo base es Apache 2.0; el autor advierte que los usuarios son responsables de cumplir con ambas licencias.
- El número de parámetros reportado en safetensors (308.224) es inconsistente con el tamaño esperado de un modelo de 8B; probablemente se trate de un error en el repositorio y no se debe tomar como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XDQAQ/Qwen3-8B-MaKTO-Public-SFT
- Paper MaKTO: https://arxiv.org/abs/2501.14225
- Código MaKTO-Werewolf: https://github.com/ReneeYe/MaKTO-Werewolf
- Dataset público de entrenamiento: https://huggingface.co/datasets/ReneeYe/werewolf_game_reasoning
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
