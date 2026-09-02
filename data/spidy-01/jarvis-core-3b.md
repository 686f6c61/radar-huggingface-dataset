# Spidy-01/Jarvis-Core-3B

## Resumen

Jarvis-Core-3B es un modelo de lenguaje de 3.085 millones de parámetros desarrollado por el usuario Spidy-01, publicado en Hugging Face bajo licencia MIT. Se trata de un fine-tuning del modelo Qwen/Qwen2.5-Coder-3B-Instruct, orientado a funcionar como asistente conversacional con un enfoque "omnisciente y técnico", según la descripción del autor. El modelo está pensado para generación de texto en español y su pipeline es text-generation.

La relevancia de este modelo radica en su tamaño compacto (3B parámetros), que permite su ejecución en hardware de consumo, y en su base Qwen2.5-Coder, que le confiere capacidades de razonamiento técnico y generación de código. Al ser un fine-tuning específico, busca adaptar el comportamiento del modelo base a un estilo de asistente más directo y técnico, aunque no se han publicado detalles sobre el dataset de entrenamiento ni el proceso de ajuste. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente y de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Español (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-3B-Instruct, un transformer causal con atención estándar, diseñado originalmente para tareas de programación y razonamiento técnico. El fine-tuning realizado por Spidy-01 adapta este modelo para funcionar como asistente conversacional en español, pero no se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el proceso de ajuste.

Al ser un fine-tuning de un modelo ya instructivo, se espera que conserve las capacidades de seguimiento de instrucciones y generación de código del modelo base, aunque el alcance exacto de la adaptación no es verificable con la información disponible.

## Capacidades

- Generación de texto conversacional en español, con estilo técnico y directo.
- Seguimiento de instrucciones, heredado del modelo base Qwen2.5-Coder-3B-Instruct.
- Generación de código y asistencia en tareas de programación, gracias a la base Qwen2.5-Coder.
- Razonamiento técnico y resolución de problemas, aunque no hay benchmarks que lo confirmen.
- No se documenta soporte explícito para tool calling, function calling, agentes, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Asistente técnico de desarrollo: el modelo puede responder preguntas sobre programación, explicar fragmentos de código o sugerir soluciones, aprovechando su base Qwen2.5-Coder. Se integraría en entornos de desarrollo como un chat local o mediante API.
- Chatbot de soporte en español: al estar fine-tuneado para conversación en español, puede desplegarse como agente de atención al cliente en sitios web, gestionando consultas multi-turno con un tono técnico.
- Generación de documentación técnica: puede redactar explicaciones, comentarios de código o guías breves a partir de instrucciones en lenguaje natural.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño (3B), es adecuado para experimentar en entornos con recursos limitados, como portátiles con GPU de gama media.
- Asistente de estudio para estudiantes de informática: puede resolver dudas de algoritmos, estructuras de datos o sintaxis de lenguajes de programación.
- Automatización de tareas de procesamiento de texto: resúmenes, extracción de información o reformulación de contenido técnico en español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se ofrecen comparaciones con el modelo base o con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.085 millones de parámetros en precisión FP16, el modelo ocupa aproximadamente 6,2 GB en memoria (según el tamaño del repo). Con cuantización a 8 bits, se reduciría a unos 3,1 GB, y a 4 bits a unos 1,6 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar el modelo en FP16. Con cuantización, cabría en GPUs de 4-6 GB (RTX 3050, GTX 1660 Super).
- En consumer GPU: sí, es viable en GPUs de gama media y alta de consumo.
- Opciones de despliegue: al ser un modelo compatible con transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 3B, se espera una latencia de decodificación de unos 20-40 ms por token en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spidy-01/Jarvis-Core-3B | 3,09B | no disponible | MIT | Fine-tune de Qwen2.5-Coder-3B-Instruct, español |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09B | 32.768 (según documentación oficial) | Apache 2.0 | Modelo base, multilingüe, orientado a código |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache 2.0 | Más pequeño, menos capaz, contexto corto |
| Phi-3-mini-4k-instruct | 3,8B | 4.096 | MIT | Similar en tamaño, buen rendimiento en razonamiento |

La comparativa se basa en datos públicos de los modelos mencionados. Jarvis-Core-3B no aporta información adicional sobre contexto ni rendimiento, por lo que su posición relativa es incierta.

## Limitaciones y advertencias

- No se han publicado detalles sobre el dataset de fine-tuning, por lo que no se puede evaluar la calidad de la adaptación ni posibles sesgos introducidos.
- El modelo está declarado únicamente en español, lo que limita su uso multilingüe.
- Al ser un fine-tuning de un modelo de código, puede presentar alucinaciones en tareas de razonamiento general o factual, como cualquier modelo de su tamaño.
- No se han realizado evaluaciones de seguridad ni de sesgos; el uso en producción requiere validación adicional.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad; su fiabilidad es desconocida.
- No se proporcionan archivos cuantizados ni instrucciones de despliegue más allá del ejemplo básico con transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spidy-01/Jarvis-Core-3B
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio GitHub del autor (proyecto JARVIS, no directamente el modelo): https://github.com/Spidy-11856/jarvis
- Página del proyecto JARVIS (aplicación de escritorio, no relacionada con el modelo): https://jarvisapp.in/
