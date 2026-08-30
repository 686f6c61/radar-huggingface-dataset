# VertexAGI/prism-caption-2-micro

## Resumen

Prism Caption 2 Micro es un modelo de titulación de conversaciones desarrollado por VertexAGI, especializado en generar títulos cortos (4-6 palabras) y específicos a partir del primer mensaje de usuario en un chat. Forma parte de la familia Prism de modelos pequeños de propósito único, y supone la segunda generación de su serie Caption, sustituyendo la base Qwen3-0.6B por LiquidAI/LFM2-700M.

El modelo se ha ajustado mediante LoRA sobre LFM2-700M, una arquitectura híbrida de short-convolution y atención de Liquid AI, diseñada para inferencia eficiente en edge y entornos locales. El checkpoint final pesa 116 millones de parámetros (el adaptador LoRA sobre los 742M del base), y se distribuye en formatos MLX 4-bit y GGUF Q4_K_M, lo que permite ejecutarlo en Apple Silicon, llama.cpp, LM Studio u Ollama con requisitos mínimos de hardware.

Su relevancia radica en que resuelve una tarea concreta y repetitiva —nombrar conversaciones— con una precisión muy alta: en la evaluación del autor sobre 275 temas held-out, produjo cero errores de formato y un 99,3% de relevancia temática, superando claramente a su predecesor y al modelo base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida short-convolution / attention (16 bloques: 6 full-attention, 10 short-conv) |
| Parametros totales | 116.096.256 (checkpoint del adaptador LoRA; base LFM2-700M con 742M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | MLX 4-bit, GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en LFM2-700M de Liquid AI, una arquitectura híbrida que combina capas de short-convolution con capas de atención full. De los 16 bloques totales, 6 son de atención completa y 10 de short-convolution, un diseño orientado a maximizar el rendimiento en CPU y dispositivos de baja potencia. Según Liquid AI, esta arquitectura ofrece aproximadamente el doble de throughput de decode/prefill en CPU que Qwen3-0.6B con un número de parámetros comparable.

El ajuste fino se realizó con LoRA (rank 8, scale 20.0, dropout 0.0) sobre las 16 capas del modelo, utilizando el framework MLX en Apple Silicon. El dataset de entrenamiento consta de 10.000 ejemplos sintéticos de pares mensaje-título (9.000 train / 1.000 validación), destilados de cuatro modelos profesores distintos: gpt-oss-20b (53,4%), nemotron-3.5-lightning-30b-a3b (32,0%), laguna-s-2.1 (10,3%) y gpt-oss-120b (4,3%). Se entrenó durante 6.000 iteraciones con learning rate 1e-5, longitud de secuencia de 256 tokens y una pérdida final de validación de 0,196 (frente a 8,054 inicial). El throughput de entrenamiento fue de ~1,22 iteraciones/segundo y ~537 tokens/segundo con un pico de memoria de 1,6 GB.

## Capacidades

- Generación de títulos de chat: dado el primer mensaje de usuario, produce un título corto (4-6 palabras) en title case, sin puntuación final ni preámbulo.
- Especificidad temática: el título nombra el sujeto real del mensaje, evitando sobre-compresión o títulos vagos.
- Formato consistente: cero errores de formato en la evaluación held-out (sin títulos demasiado largos/cortos, sin fugas de preámbulo, sin puntuación colgante).
- Resumen conversacional: aunque su función principal es la titulación, los tags del modelo incluyen summarization, lo que sugiere capacidad básica de condensación de mensajes.
- Conversacional: puede integrarse en flujos de chat multi-turno como paso de preprocesamiento.
- Inferencia ligera: al ser un modelo de ~116M de parámetros, es apto para ejecución en CPU, Apple Silicon y GPUs de gama baja.

## Casos de uso

- Titulación automática de conversaciones en aplicaciones de mensajería: el modelo puede nombrar cada chat de un usuario basándose en el primer mensaje, mejorando la organización de la bandeja de entrada sin intervención manual.
- Gestión de tickets de soporte: al recibir el primer mensaje de un cliente, genera un título descriptivo que facilita el enrutamiento y la búsqueda posterior en el sistema de tickets.
- Organización de historiales en foros y comunidades: para hilos de discusión, produce títulos específicos que reflejan el tema real, reduciendo la ambigüedad de títulos genéricos.
- Preprocesamiento de datos para entrenamiento: puede usarse para etiquetar grandes volúmenes de conversaciones antes de alimentar otros modelos, generando metadatos útiles de forma automática.
- Integración en asistentes personales: al iniciar una conversación con un asistente, el modelo puede sugerir un nombre para la sesión, mejorando la experiencia de usuario en aplicaciones de productividad.
- Automatización de documentación en equipos de desarrollo: para canales de chat internos, genera títulos de reuniones o discusiones técnicas a partir del primer mensaje, facilitando la recuperación de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo específico. El autor proporciona dos tipos de datos:

1. Comparativa del modelo base LFM2-700M frente a Qwen3-0.6B (evaluaciones de Liquid AI):

| Modelo | Params | MMLU | IFEval |
|---|---|---|---|
| Qwen3-0.6B | ~600M | 44,93 | 64,24 |
| LFM2-700M | 742M | 49,9 | 72,23 |

2. Evaluación propia del autor sobre conjuntos held-out de temas (sin solapamiento con el entrenamiento), comparando el modelo con el base y con la generación anterior:

| Tamaño held-out | Base LFM2-700M (issues / relevantes / palabras medias) | Prism Caption 1.5 | Prism Caption 2 |
|---|---|---|---|
| 24 temas | 8/24, 18/24, 7,5w | 1/24, 21/24, 3,3w | 0/24, 24/24, 4,7w |
| 145 temas | 35/145, 107/145, 5,8w | 9/145, 129/145, 3,9w | 0/145, 145/145, 5,0w |
| 275 temas | 69/275, 205/275, 5,9w | 13/275, 249/275, 4,0w | 0/275, 273/275, 5,0w |

En la ejecución final de 275 temas, Prism Caption 2 produjo cero problemas de formato y un 99,3% de relevancia, con una media de 5,0 palabras por título.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantización 4-bit (el checkpoint MLX 4-bit ocupa aproximadamente 0,9 GB en el repositorio, incluyendo config y tokenizador).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente; también funciona en CPU sin GPU.
- Compatibilidad con Apple Silicon: el formato MLX está optimizado para Macs con chips M1/M2/M3/M4, con un pico de memoria de 1,6 GB durante el entrenamiento, por lo que la inferencia será aún más ligera.
- Opciones de despliegue: mlx-lm para Apple Silicon, llama.cpp para CPU/GPU, LM Studio, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones de inferencia, pero dado el tamaño del modelo y la arquitectura LFM2 optimizada para CPU, se espera una latencia de decenas de milisegundos por generación en hardware moderno.

## Comparativa con modelos similares

| Modelo | Base | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism Caption 2 Micro | LFM2-700M | 116M (adaptador) | no disponible | LFM Open License v1.0 | HuggingFace (MLX, GGUF) |
| Prism Caption 1.5 | Qwen3-0.6B | ~600M | no disponible | no especificada | HuggingFace |
| LFM2-700M (base) | - | 742M | no disponible | LFM Open License v1.0 | HuggingFace |

El modelo supera a su predecesor (Prism Caption 1.5) en calidad de titulación: cero errores de formato frente a 13/275, y una media de palabras más natural (5,0 frente a 4,0). Frente al base LFM2-700M, la mejora es drástica en la tarea específica, reduciendo los problemas de formato de 69/275 a 0/275. No se dispone de comparativas con otros modelos de titulación de chats del mercado.

## Limitaciones y advertencias

- Solo soporta inglés: el modelo está entrenado exclusivamente con datos en inglés, por lo que no es adecuado para titulación de conversaciones en otros idiomas.
- Tarea específica: está diseñado únicamente para titulación de chats; no debe usarse para generación de texto general, razonamiento, código u otras tareas.
- Riesgo de alucinación: si el mensaje de usuario es ambiguo o carece de sujeto claro, el modelo puede generar títulos vagos o inventados, aunque la evaluación muestra una tasa de error muy baja en temas variados.
- Dependencia del formato de entrada: requiere el prompt de sistema específico documentado en la model card; usarlo sin ese prompt degradará significativamente la calidad de los títulos.
- Licencia LFM Open License v1.0: es una licencia de código abierto con condiciones específicas; se recomienda revisar el texto completo antes de uso comercial.
- Sin soporte de tool calling ni agentes: el modelo no dispone de capacidades de llamada a funciones ni razonamiento multi-paso, limitando su integración en pipelines complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/prism-caption-2-micro
- Modelo base LFM2-700M: https://huggingface.co/LiquidAI/LFM2-700M
- Checkpoint MLX 4-bit del base: https://huggingface.co/mlx-community/LFM2-700M-4bit
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2-700M/blob/main/LICENSE
- Framework MLX: https://github.com/ml-explore/mlx
