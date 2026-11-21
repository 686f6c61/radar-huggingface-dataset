# VertexAGI/prism-caption-1-5-micro

## Resumen

Prism Caption 1.5 Micro es un modelo de lenguaje de 596 millones de parámetros desarrollado por VertexAGI, afinado a partir de Qwen/Qwen3-0.6B mediante LoRA para una única tarea: generar un título corto de conversación a partir del primer mensaje del usuario. Replica el comportamiento de autotitulado de asistentes como ChatGPT o Claude, pero ejecutándose en local a un coste computacional mínimo, evitando una llamada a un modelo de frontera solo para nombrar un chat.

Forma parte de la familia Prism de modelos pequeños y monoespecíficos y es el sucesor de Prism Caption 1 Micro (basado en Gemma-3-1B y entrenado con 339 ejemplos). La versión 1.5 amplía el corpus a 1000 ejemplos distribuidos en 167 temas y 20 plantillas de formulación, y corrige el fallo metodológico de la evaluación anterior, que muestreaba temas ya vistos en entrenamiento.

El modelo se distribuye en dos formatos dentro del mismo repositorio: pesos MLX en 4 bits (grupo de 64, 335 MB) para Apple Silicon y un GGUF Q4_K_M (397 MB) para llama.cpp, Ollama y LM Studio. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), afinado con LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-0.6B; no especificada en la informacion) |
| Tipos de cuantizacion | 4 bits MLX (group size 64), GGUF Q4_K_M |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de 0,6B parámetros, cargado en su variante cuantizada a 4 bits de `mlx-community/Qwen3-0.6B-4bit`. Sobre esa base se aplica un adaptador LoRA de rango 8, escala 20 y 8 capas, entrenado con el framework MLX (`mlx-lm`) en Apple Silicon. La configuración de entrenamiento usa optimizador Adam con learning rate constante de 1e-5, batch de 4 y longitud de secuencia de 256, durante 1500 iteraciones; el checkpoint publicado corresponde a la iteración 1500 con una pérdida de validación de 0,209.

El corpus consta de 1000 ejemplos (900 de entrenamiento y 100 de validación) repartidos en 167 temas y 20 plantillas de formulación, con 714 títulos únicos en el conjunto total. Los títulos se destilaron a través de NVIDIA NIM con dos profesores: `google/diffusiongemma-26b-a4b-it` generó aproximadamente 43 ejemplos antes de que el límite de peticiones del endpoint devolviera un 82% de errores 429, y los ~957 restantes se generaron con `nvidia/nemotron-3.5-lightning-30b-a3b`. La ampliación del banco de temas de 51 (en la versión 1) a 167 responde a un objetivo explícito: evitar que el modelo memorice el conjunto de plantillas en lugar de aprender la tarea, reduciendo la recurrencia media por tema de ~20 a ~6 ejemplos.

## Capacidades

- Generación de títulos de chat de 3 a 6 palabras en formato title case, sin comillas ni puntuación final.
- Condicionamiento mediante un prompt de sistema que fija el formato de salida; el modelo respeta la instrucción de devolver solo el título.
- Ejecución local en Apple Silicon vía MLX y en CPU/GPU vía llama.cpp, Ollama y LM Studio con el GGUF Q4_K_M.
- Compatibilidad con plantillas de chat de Qwen3; en modo no-thinking emite un bloque `<think></think>` vacío que debe eliminarse antes de usar la salida.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un modelo monoespecífico.
- Capacidad multilingüe limitada al inglés, tanto por datos de entrenamiento como por declaración del autor.

## Casos de uso

- Autotitulado de conversaciones en asistentes propios: al crear un chat nuevo, se pasa el primer mensaje del usuario al modelo con el prompt de sistema y se obtiene una etiqueta de 3 a 6 palabras, evitando consumir una llamada a un modelo de frontera solo para nombrar la sesión.
- Historial y listados de chats en aplicaciones de mensajería o productividad: el modelo genera etiquetas compactas que caben en una barra lateral sin truncamiento, con una media de 3,3 palabras.
- Enrutado y clasificación ligera en pipelines internos: el título generado puede usarse como clave de agrupación o para preclasificar conversaciones antes de un análisis más costoso.
- Despliegue en el dispositivo: con 335 MB en MLX 4 bits o 397 MB en GGUF Q4_K_M, cabe en portátiles Apple Silicon y en equipos de gama media, lo que permite titulado offline sin enviar el primer mensaje del usuario a un servicio externo.
- Prototipado y evaluación de sistemas de destilado: sirve como ejemplo reproducible de un pipeline LoRA + MLX + destilado con profesores vía NIM para tareas de formato estricto.
- Generación de etiquetas en herramientas de soporte o CRM: a partir del primer mensaje de un cliente se obtiene una etiqueta corta para bandejas de entrada compartidas, siempre que el tráfico sea en inglés y se tolere cierta pérdida del sustantivo temático.

## Benchmarks y rendimiento

Evaluación sobre 24 temas reservados que no aparecen en los datos de entrenamiento. Las métricas son de comportamiento, no de precisión exacta, dado que el titulado no tiene una respuesta única correcta.

| Metrica | Qwen3-0.6B base | Prism Caption 1.5 |
|---|---|---|
| Problemas de formato (preámbulo, puntuación, multilínea) | 10/24 | 0/24 |
| Dentro de la especificación de 3-6 palabras | 14/24 | 23/24 |
| Comparte palabras de contenido con el mensaje | 24/24 | 21/24 |
| Longitud media | 5,8 palabras | 3,3 palabras |

El autor reporta como resultado global "0/24 problemas de formato, 23/24 dentro de especificación". El coste declarado es una mayor compresión: algunos títulos omiten el sustantivo temático (por ejemplo, "Shoulder Sleep Matters" para un mensaje sobre colchones, o "Acetone Smell Troubleshooting" para un mensaje sobre masa madre). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en 4 bits, más overhead de runtime y caché KV; en la práctica, menos de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon mediante MLX y en CPU mediante llama.cpp. Cualquier GPU con 2 GB o más de VRAM puede alojarlo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en Mac con chip de la serie M.
- Opciones de despliegue: `mlx-lm` (formato MLX), llama.cpp, Ollama y LM Studio (GGUF Q4_K_M). El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica que es "suficientemente pequeño y rápido" para ejecutar la tarea en local, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Caption 1.5 Micro | 0,6B | No disponible | Titulado de chats (LoRA sobre Qwen3-0.6B) | Apache 2.0 | MLX 4-bit, GGUF Q4_K_M |
| Prism Caption 1 Micro | ~1B (Gemma-3-1B) | No disponible | Titulado de chats, 339 ejemplos | No disponible en la informacion | No disponible en la informacion |
| Qwen3-0.6B (base) | 0,6B | No disponible en la informacion | Modelo generalista | Apache 2.0 | safetensors, GGUF (variantes de la comunidad) |

Frente al modelo base, la comparativa relevante no es de conocimiento general sino de fiabilidad de formato: 0/24 problemas de formato frente a 10/24, y 23/24 dentro de especificación frente a 14/24. Frente a Prism Caption 1 Micro, la versión 1.5 triplica aproximadamente el corpus (1000 frente a 339 ejemplos) y amplía el banco de temas de 51 a 167, además de corregir la evaluación para usar temas no vistos.

## Limitaciones y advertencias

- Modelo de 0,6B parámetros: capacidad general muy limitada fuera de la tarea de titulado; no debe reutilizarse como asistente conversacional.
- Sobrecompresión: la media de 3,3 palabras queda por debajo del centro del rango 3-6 especificado y en ocasiones se pierde el sustantivo temático, lo que reduce la relevancia de 24/24 a 21/24. Conviene validar con tráfico propio si la interfaz exige preservar el sujeto.
- Solo inglés: no hay soporte declarado para otros idiomas, ni en datos ni en evaluación.
- Solo primeros mensajes: no se entrenó para retitular conversaciones a partir de turnos posteriores ni de transcripciones completas.
- No es un resumidor: produce etiquetas, no descripciones.
- Hereda el corte de conocimiento y las limitaciones generales de Qwen3-0.6B, incluidos los sesgos presentes en los datos del modelo base y en los títulos generados por los profesores.
- Riesgo de alucinación en el sentido de títulos que no reflejan el contenido del mensaje cuando este es ambiguo o muy corto.
- En modo no-thinking, Qwen3 emite un bloque `<think></think>` vacío que debe eliminarse; con llama.cpp hay que usar la plantilla de chat nativa, ya que una plantilla construida a mano degrada el título.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-caption-1-5-micro
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante cuantizada usada para el entrenamiento: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
