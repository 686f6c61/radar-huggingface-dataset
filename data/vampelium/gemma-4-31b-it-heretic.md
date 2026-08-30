# Vampelium/gemma-4-31B-it-heretic

## Resumen

`gemma-4-31B-it-heretic` es un finetune del modelo multimodal Gemma 4 31B IT de Google, desarrollado por el usuario Vampelium mediante la técnica de abliteración denominada "Heretic". Esta técnica elimina los pesos asociados al rechazo de contenido, lo que resulta en un modelo sin alineación de seguridad en el camino de generación no-thinking. El checkpoint fue producido en un clúster de 4 GPU NVIDIA A100 y distribuido en 13 shards safetensors en BF16, con un peso total de aproximadamente 62,5 GB.

El modelo hereda todas las capacidades del Gemma 4 31B IT original: procesamiento multimodal (imagen, audio, vídeo y texto), modo de razonamiento híbrido (thinking/no-thinking) y una ventana de contexto de hasta 262 144 tokens según fuentes externas. Su relevancia radica en ofrecer una alternativa sin censura para desarrolladores que trabajan en roleplay, escritura creativa o investigación sobre alineación, manteniendo la calidad del modelo base de Google. La licencia es la de Gemma Terms of Use, que se aplica al modelo base y a este derivado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), híbrido con modo thinking/no-thinking |
| Parametros totales | 31,3 B (según llmrun.dev; el payload BF16 de 62,5 GB es coherente con esa cifra) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (según llmrun.dev; no confirmado en la model card oficial) |
| Tipos de cuantizacion | BF16 nativo, GGUF (IQ3_S, Q4_K_M disponibles de terceros), 4-bit bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use (Google) |
| Formato de pesos | Safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` y se somete a un proceso de abliteración denominado "Heretic". La abliteración es una técnica de ajuste que identifica y elimina los pesos de la red que se activan ante solicitudes de contenido prohibido, eliminando así los mecanismos de rechazo del modelo. El autor indica que el proceso se realizó en 4 GPU NVIDIA A100 y que el checkpoint resultante se guardó con `transformers` 5.6.2, que incluye la clase `Gemma4ForConditionalGeneration`.

Gemma 4 es un modelo híbrido con dos modos de generación: un modo "thinking" que produce razonamiento encadenado antes de la respuesta final, y un modo "no-thinking" (por defecto) que genera directamente. La abliteración se aplicó al camino no-thinking, por lo que el comportamiento sin censura se manifiesta principalmente en ese modo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO en el modelo base, más allá de lo que Google haya publicado para Gemma 4.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen, audio, vídeo y texto, heredado del modelo base Gemma 4 31B IT.
- Modo de razonamiento híbrido: soporta `enable_thinking=True` para razonamiento encadenado y `enable_thinking=False` para generación directa sin censura.
- Generación de texto sin restricciones de contenido: el modelo no rechaza solicitudes de roleplay, escritura creativa explícita u otros contenidos que el modelo base bloquearía.
- Tokenizer y plantilla de chat completos incluidos en el repositorio (`tokenizer.json`, `chat_template.jinja`).
- Capacidad de tool calling y function calling: no confirmada en la información disponible; se hereda del modelo base, pero no se documenta explícitamente.
- Soporte de agentes y multi-step reasoning: posible en modo thinking, pero no verificado en este finetune.

## Casos de uso

- Roleplay y escritura creativa sin censura: el modelo puede mantener conversaciones multi-turno con personajes ficticios y escenarios explícitos, gracias a la abliteración del camino no-thinking y a su ventana de contexto de 262K tokens que permite mantener hilos largos.
- Generación de diálogos para videojuegos: desarrolladores de juegos de rol o simuladores pueden integrar el modelo como motor de diálogo para personajes no jugadores (NPC) con personalidades complejas y sin filtros.
- Asistentes de contenido para adultos: creación de narrativa erótica o ficción explícita bajo demanda, con control del usuario sobre el tono y la extensión.
- Análisis de imágenes en entornos de investigación: al heredar la capacidad multimodal de Gemma 4, puede describir o interpretar imágenes, aunque la abliteración no afecta a ese subsistema.
- Experimentación en seguridad de IA: investigadores pueden estudiar el comportamiento de un modelo sin alineación, comparándolo con el base para medir el impacto de la abliteración en la calidad y la seguridad.
- Generación de código y asistencia técnica: como finetune del modelo IT de Google, conserva las capacidades de razonamiento y generación de código del original, útil en entornos donde se requiere un asistente sin restricciones de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este finetune. El autor no proporciona métricas de rendimiento comparativas con el modelo base ni con otras alternativas.

## Requisitos de hardware

- Inferencia en BF16 completo: requiere aproximadamente 62 GB de VRAM. No cabe en una GPU de 24 GB o 48 GB; es necesario usar `device_map="auto"` con varias GPU (por ejemplo, 2x A100 80GB o 4x A100 40GB) o recurrir a cuantización.
- Cuantización 4-bit (bitsandbytes): reduce el consumo a aproximadamente 16-18 GB, permitiendo ejecución en una RTX 4090 o A10G de 24 GB.
- GGUF Q4_K_M: alrededor de 20,4 GB de VRAM según llmrun.dev, ejecutable en GPUs consumer de 24 GB y en Macs con memoria unificada superior a 24 GB.
- GGUF IQ3_S: requiere menos memoria (estimada ~15-16 GB), adecuado para GPUs de 16 GB como la RTX 4080 o RTX 4060 Ti.
- Opciones de despliegue: `transformers` con `device_map="auto"`, `bitsandbytes` para 4-bit, `llama.cpp` / `Ollama` con archivos GGUF, o servidores de inferencia como vLLM si se convierte el formato.
- Latencia y throughput: no disponibles. Dependerán de la GPU, la cuantización y el modo de generación (thinking vs no-thinking).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Alineación | Licencia |
|---|---|---|---|---|---|
| gemma-4-31B-it-heretic (este) | 31,3 B | 262K (según llmrun.dev) | Sí | Sin alineación (abliterado) | Gemma Terms |
| google/gemma-4-31B-it | 31,3 B | 262K (según llmrun.dev) | Sí | Con alineación | Gemma Terms |
| google/gemma-3-27B-it | 27 B | 128K | Sí | Con alineación | Gemma Terms |
| coder3101/gemma-4-31B-it-heretic | 31,3 B | 262K (según llmrun.dev) | Sí | Sin alineación | Gemma Terms |

No hay datos de rendimiento comparativo entre estos modelos. La diferencia principal es la presencia o ausencia de alineación de seguridad, mientras que la arquitectura subyacente es la misma en el caso del modelo base y sus derivados abliterados.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. El autor advierte explícitamente que la alineación fue eliminada y que el usuario es responsable del uso.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en modo no-thinking donde no hay razonamiento encadenado.
- Licencia restrictiva: la licencia Gemma de Google prohíbe ciertos usos comerciales y requiere cumplir con las políticas de uso aceptable. El uso de este derivado en producción debe revisarse legalmente.
- Contexto no verificado oficialmente: la cifra de 262 144 tokens proviene de llmrun.dev, no de la documentación del autor ni de Google. Puede variar según la implementación.
- Modo thinking limitado: la abliteración se aplicó solo al camino no-thinking; si se activa `enable_thinking=True`, el modelo puede mostrar comportamientos de rechazo o respuestas truncadas si no se ajusta `max_new_tokens`.
- Requisitos de hardware elevados en BF16: la inferencia sin cuantizar necesita ~62 GB de VRAM, lo que limita su uso a clústeres o GPUs profesionales de alta capacidad.
- Compatibilidad con `transformers`: requiere una versión reciente (5.6.2 o superior) que incluya `Gemma4ForConditionalGeneration`. No funcionará en versiones anteriores.
- No hay garantía de soporte: el repositorio no muestra actividad posterior a la creación (agosto de 2026) y no hay issues ni discusiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vampelium/gemma-4-31B-it-heretic
- Versión alternativa de coder3101: https://huggingface.co/coder3101/gemma-4-31B-it-heretic
- Cuantizaciones GGUF de NeuralDreamer: https://huggingface.co/NeuralDreamer/gemma-4-31B-it-heretic-i1-GGUF_ND
- Requisitos de hardware en llmrun.dev: https://llmrun.dev/model/coder3101-gemma-4-31b-it-heretic
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
