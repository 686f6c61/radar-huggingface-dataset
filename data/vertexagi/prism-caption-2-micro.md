# VertexAGI/prism-caption-2-micro

## Resumen

Prism Caption 2 Micro es un modelo de generacion de texto de proposito especifico, desarrollado por VertexAGI, cuya unica tarea es generar titulos cortos para conversaciones de chat: a partir del primer mensaje de usuario, produce un titulo de 4-6 palabras, en formato title case, que nombra el tema concreto de la conversacion. Forma parte de la familia Prism de modelos pequenos y monofuncionales, y sustituye a las generaciones anteriores de la misma familia (Prism Caption 1 Mini y 1.5 Micro), que estaban construidas sobre la linea Qwen3-0.6B.

El modelo es un fine-tuning mediante LoRA sobre LiquidAI/LFM2-700M, un transformer hibrido de 742.489.344 parametros (aproximadamente 742M) que combina atencion completa con convoluciones cortas en 16 bloques (6 de atencion completa y 10 de convolucion corta). La arquitectura LFM2 esta disenada por Liquid AI para inferencia en el borde y en local, con un throughput de decodificacion y prefill en CPU aproximadamente el doble del de Qwen3 a un numero de parametros comparable. El checkpoint afinado parte de la version 4-bit de mlx-community (mlx-community/LFM2-700M-4bit).

La relevancia actual del modelo reside en su perfil de coste: 742M parametros, ventana de entrenamiento de 256 tokens, un unico idioma (ingles) y una licencia LFM Open License v1.0. El autor reporta cero problemas de formato en 275 temas held-out y un 99,3% de relevancia en la ronda final de evaluacion, lo que lo convierte en una opcion util para tareas de titulacion automatica dentro de productos de chat, donde el coste por llamada y la latencia importan mas que la amplitud de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2, transformer hibrido convolucion corta / atencion (16 bloques: 6 de atencion completa, 10 de convolucion corta) |
| Parametros totales | 742.489.344 (aproximadamente 742M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud de secuencia de entrenamiento: 256 tokens) |
| Tipos de cuantizacion | 4-bit MLX (group size 64); GGUF Q4_K_M (4-bit) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX 4-bit) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La base es LFM2-700M de Liquid AI, una arquitectura hibrida que intercala bloques de atencion completa con bloques de convolucion corta, disenada explicitamente para inferencia eficiente en CPU y dispositivos de borde. El fine-tuning se realizo con LoRA de rango 8, escala 20.0, dropout 0.0 y 16 capas (profundidad completa del modelo), sobre el checkpoint MLX de 4 bits, con el framework MLX y mlx-lm en Apple Silicon. El optimizador fue Adam con learning rate 1e-5, longitud de secuencia de 256 tokens y 6.000 iteraciones con validacion cada 200 pasos; la perdida de validacion final fue 0.196, frente a 8.054 en la inicializacion, y el checkpoint final resulto ser el mejor de la ejecucion. El throughput de entrenamiento reportado es de aproximadamente 1,22 iteraciones/s, 537 tokens/s y 1,6 GB de memoria pico.

Los datos de entrenamiento consisten en 10.000 pares sinteticos de titulacion de chat (9.000 de entrenamiento y 1.000 de validacion), destilados de cuatro modelos profesores: openai/gpt-oss-20b via NIM (5.339 ejemplos, 53,4%), nvidia/nemotron-3.5-lightning-30b-a3b via NIM (3.201, 32,0%), poolside/laguna-s-2.1:free via OpenRouter (1.027, 10,3%) y openai/gpt-oss-120b via NIM (433, 4,3%). El conjunto cubre 1.207 temas unicos y 6.601 titulos generados unicos. La rotacion de profesores cada aproximadamente dos minutos se adopto a mitad de la ejecucion para evitar bloqueos por limites de rate de las capas gratuitas. No se documenta uso de RLHF ni DPO; la senal de aprendizaje proviene exclusivamente de la destilacion sintetica.

## Capacidades

- Generacion de titulos de conversacion: dada la primera intervencion del usuario, produce un titulo de 4-6 palabras en title case que nombra el tema concreto.
- Control de formato: el autor reporta cero incidencias de formato (longitud, preambulos filtrados, puntuacion final, multilinea) en el conjunto held-out final de 275 temas.
- Enfoque monofuncional: no esta disenado para generacion abierta, razonamiento general, codigo ni matematicas; su utilidad esta acotada a la tarea de titulacion.
- Capacidad multilingue: limitada al ingles; no se documenta soporte de otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Despliegue en dos runtimes: MLX en Apple Silicon y GGUF en llama.cpp, Ollama y LM Studio.

## Casos de uso

- Titulacion automatica de hilos en interfaces de chat: el modelo recibe el primer mensaje del usuario y devuelve un titulo de 4-6 palabras que nombra el tema real, lo que permite poblar listas de conversaciones, historiales y paneles de soporte sin intervencion manual.
- Etiquetado de tickets en mesas de ayuda: integrado en el pipeline de entrada de un sistema de ticketing, genera una etiqueta legible a partir del texto inicial del cliente, reduciendo el trabajo de clasificacion manual y mejorando la trazabilidad.
- Organizacion de historiales de asistentes conversacionales: en productos con memoria de conversaciones largas, el modelo produce titulos estables y especificos que facilitan la busqueda y recuperacion de hilos por parte del usuario.
- Resumen de un turno en herramientas de productividad: para notas, correos o mensajes iniciales, genera una linea de asunto corta y con formato consistente, util en bandejas de entrada y listas de tareas.
- Generacion de asuntos en correo transaccional o de soporte: a partir del cuerpo inicial de un mensaje, produce un asunto en title case de longitud controlada, evitando asuntos genericos o truncados.
- Procesamiento por lotes en local o en el borde: con 742M parametros y pesos de 418 MB (MLX 4-bit) o 469 MB (GGUF Q4_K_M), puede ejecutarse en portatiles Apple Silicon o en CPUs modestas para titular grandes volumenes de conversaciones sin coste de API.
- Enrutamiento y clasificacion previa: el titulo generado puede usarse como senal textual para encaminar conversaciones hacia departamentos, colas o agentes especializados en sistemas de atencion al cliente.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre un conjunto de temas held-out sin solapamiento con el banco de entrenamiento, ejecutada tres veces con tamanos crecientes. Las metricas son "issues" (problemas de formato), "relevant" (el titulo comparte una palabra no vacia con el tema de origen) y media de palabras.

| Temas held-out | Base LFM2-700M (issues / relevant / palabras) | Prism Caption 1.5 | Prism Caption 2 Micro |
|---|---|---|---|
| 24 temas | 8/24, 18/24, 7,5 w | 1/24, 21/24, 3,3 w | 0/24, 24/24, 4,7 w |
| 145 temas | 35/145, 107/145, 5,8 w | 9/145, 129/145, 3,9 w | 0/145, 145/145, 5,0 w |
| 275 temas | 69/275, 205/275, 5,9 w | 13/275, 249/275, 4,0 w | 0/275, 273/275, 5,0 w |

Datos de referencia de los modelos base citados en la model card (evaluaciones publicadas por Liquid AI):

| Modelo | Parametros | MMLU | IFEval |
|---|---|---|---|
| Qwen3-0.6B | ~600M | 44,93 | 64,24 |
| LFM2-700M | 742M | 49,9 | 72,23 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para el modelo afinado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB para los pesos cuantizados (418 MB en MLX 4-bit, 469 MB en GGUF Q4_K_M), mas overhead de runtime y cache KV; en la practica, menos de 1,5 GB en total.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para CPU y Apple Silicon. En GPU dedicada, tarjetas de gama baja o integradas bastan, dado el tamano.
- Cabe en GPU consumer: si, con holgura, en cualquier GPU con 2 GB o mas de memoria; tambien en CPU sin GPU dedicada.
- Opciones de despliegue: MLX / mlx-lm en Apple Silicon; llama.cpp, Ollama y LM Studio mediante el GGUF Q4_K_M; transformers con los pesos safetensors.
- Latencia y throughput estimados: no se publican cifras de inferencia del modelo afinado. El autor reporta durante el entrenamiento 537 tokens/s y 1,6 GB de memoria pico en una maquina consumer con memoria limitada; Liquid AI reporta para LFM2-700M aproximadamente el doble del throughput de decodificacion y prefill en CPU de Qwen3 a parametros comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en titulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism Caption 2 Micro | 742M | no disponible (entrenamiento a 256 tokens) | 0/275 issues, 273/275 relevantes, 5,0 palabras | LFM Open License v1.0 | Hugging Face, MLX y GGUF |
| Prism Caption 1.5 (generacion anterior) | ~600M (base Qwen3-0.6B) | no disponible | 13/275 issues, 249/275 relevantes, 4,0 palabras | no disponible en la informacion proporcionada | Hugging Face (familia Prism) |
| LFM2-700M base | 742M | no disponible | 69/275 issues, 205/275 relevantes, 5,9 palabras | LFM Open License v1.0 | Hugging Face |
| Qwen3-0.6B base | ~600M | no disponible | no evaluado en la informacion disponible | no disponible en la informacion proporcionada | Hugging Face |

## Limitaciones y advertencias

- Modelo monofuncional: no debe emplearse para generacion abierta, razonamiento, codigo o matematicas; su rendimiento fuera de la tarea de titulacion no esta evaluado.
- Idioma: solo ingles; el comportamiento en castellano u otros idiomas no esta documentado.
- Contexto de entrenamiento corto (256 tokens): entradas muy largas pueden degradar la calidad del titulo o requerir truncamiento previo.
- Riesgo de alucinacion: aunque la tarea esta acotada, el modelo puede producir titulos que no nombran el tema real cuando la entrada es ambigua, muy corta o no informativa; el autor reporta 2 casos no relevantes de 275 en la ronda final.
- Datos sinteticos destilados de cuatro profesores: los sesgos y errores de esos modelos pueden haberse transferido al modelo afinado; no se documenta una auditoria de sesgos.
- Licencia LFM Open License v1.0: es una licencia "other" con condiciones especificas; conviene revisar el texto completo antes de un uso comercial en produccion.
- El autor no publica resultados en benchmarks estandar ni mediciones de latencia del modelo afinado, lo que limita la comparacion objetiva con alternativas.
- El repositorio combina pesos MLX y GGUF; hay que seleccionar el formato adecuado al runtime, ya que no todos los frameworks cargan ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-caption-2-micro
- Modelo base LFM2-700M: https://huggingface.co/LiquidAI/LFM2-700M
- Checkpoint de fine-tuning 4-bit: https://huggingface.co/mlx-community/LFM2-700M-4bit
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2-700M/blob/main/LICENSE
- Framework MLX: https://github.com/ml-explore/mlx
