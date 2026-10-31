# zxyty/physicalai-qwen3-14b

## Resumen

Physicalai-qwen3-14b es un ajuste fino (finetune) del modelo Qwen3-14B-Base de Qwen, publicado por el usuario zxyty en Hugging Face. El modelo base pertenece a la familia Qwen3, la cuarta generación de modelos lingüísticos de Alibaba, que combina arquitecturas densas y de mezcla de expertos (MoE). Qwen3-14B es un modelo denso de 14,8 mil millones de parámetros orientado a generación de texto conversacional, con soporte nativo de doble modo: "thinking" (razonamiento explícito para lógica, matemáticas y código) y "non-thinking" (diálogo general eficiente).

La relevancia de esta variante radica en que hereda las capacidades de la serie Qwen3 —razonamiento mejorado, soporte de agentes y más de 100 idiomas— sobre una base abierta con licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio pesa 29,5 GB en formato safetensors y cuenta con 258 descargas, por lo que se trata de un modelo de nicho con adopción aún limitada. La model card del autor reutiliza la documentación oficial de Qwen3-14B, por lo que los detalles específicos del ajuste fino (datos de entrenamiento adicionales, objetivos, dominios) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Causal Language Model) |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (repo en bf16/fp16, 29,5 GB) |
| Idiomas soportados | Más de 100 idiomas y dialectos (heredado de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-14B-Base, un transformer decoder-only denso con 40 capas y atención agrupada de consultas (GQA) con 40 cabezas para Q y 8 para KV, lo que reduce el coste de memoria del KV cache. El modelo base fue entrenado con preentrenamiento masivo seguido de postentrenamiento (SFT y RL según la metodología de Qwen3), aunque el número exacto de tokens del preentrenamiento no está disponible en la información proporcionada. La innovación más destacable de la serie Qwen3 es el cambio fluido entre modo "thinking" (genera un bloque `<think>...</think>` antes de la respuesta) y modo "non-thinking" dentro de un único modelo, controlado mediante el parámetro `enable_thinking` del chat template.

Sobre el ajuste fino concreto realizado por zxyty (nombre "physicalai" sugiere un enfoque en IA física o robótica, posiblemente relacionado con el dataset PhysicalAI citado vía arXiv), no hay datos publicados: no se conocen el dataset utilizado, el número de épocas, el método (LoRA, full finetune) ni los resultados de evaluación específicos. Los artículos arXiv referenciados en los tags (2309.00071, correspondiente a Qwen Technical Report, y 2505.09388, correspondiente al informe técnico de Qwen3) apuntan a la documentación de la familia base, no al finetune.

## Capacidades

- Generación de texto conversacional multi-turno con alineación a preferencias humanas (escritura creativa, role-playing, seguimiento de instrucciones).
- Razonamiento lógico, matemático y de código en modo "thinking", con superación de QwQ-32B y Qwen2.5 instruct según la documentación oficial de Qwen3.
- Cambio entre modo "thinking" y "non-thinking" en un mismo modelo mediante `enable_thinking`.
- Soporte de tool calling / function calling en ambos modos, con rendimiento destacado en tareas de agentes según la serie Qwen3.
- Capacidades multilingües en más de 100 idiomas, incluyendo seguimiento de instrucciones y traducción.
- Contexto nativo de 32.768 tokens, ampliable a 131.072 mediante YaRN.
- Despliegue como endpoint compatible con la API de OpenAI mediante vLLM o SGLang.

## Casos de uso

- Asistentes conversacionales multi-turno: el modo "non-thinking" permite respuestas rápidas y naturales en chatbots, con contexto de 32.768 tokens suficiente para mantener conversaciones largas sin perder coherencia.
- Razonamiento y resolución de problemas técnicos: en modo "thinking", el modelo genera cadenas de razonamiento explícitas antes de responder, adecuado para tareas de lógica, matemáticas y depuración de código.
- Agentes con integración de herramientas: el soporte de function calling en ambos modos permite construir agentes que consultan APIs, ejecutan búsquedas o manipulan sistemas externos en flujos multi-paso.
- Generación y revisión de código: puede integrarse en pipelines de desarrollo para generar, explicar y refactorizar código, aprovechando el contexto ampliado con YaRN para analizar repositorios grandes.
- Traducción y contenido multilingüe: con soporte de más de 100 idiomas, es adecuado para localización de documentación, traducción técnica y atención al cliente internacional.
- Procesamiento de documentos largos: con contexto extendido a 131.072 tokens vía YaRN, puede resumir y analizar informes, contratos o artículos científicos completos.
- Experimentación en dominios de IA física o robótica: el nombre del repositorio sugiere un ajuste orientado a ese ámbito, aunque sin documentación específica del autor, este uso debe validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de este finetune en la información disponible. Los resultados oficiales de Qwen3-14B pueden consultarse en el blog y el repositorio de Qwen (enlaces abajo), pero no se reproducen aquí por no formar parte de los datos proporcionados para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16): aproximadamente 30 GB para los pesos, más overhead de KV cache; en la práctica se recomiendan 40-48 GB.
- Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M o AWQ), el consumo baja a unos 9-10 GB, aunque no hay versiones cuantizadas publicadas en este repositorio.
- GPU recomendadas: A100 40GB/80GB, H100 o RTX A6000 para precisión completa; RTX 4090 (24 GB) puede ejecutarlo cuantizado a 4 bits con contexto moderado.
- En consumer GPU: viable en RTX 4090 o RTX 3090 con cuantización a 4 bits; no viable en precisión completa.
- Opciones de despliegue: vLLM (>=0.8.5), SGLang (>=0.4.6.post1), Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers, según la compatibilidad declarada de la serie Qwen3.
- Latencia y throughput estimados: no disponibles para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modo thinking | Licencia |
|---|---|---|---|---|
| physicalai-qwen3-14b (este) | 14,8B | 32.768 (131.072 con YaRN) | Sí | Apache 2.0 |
| Qwen3-14B (oficial) | 14,8B | 32.768 (131.072 con YaRN) | Sí | Apache 2.0 |
| Qwen3-8B | 8,2B | 32.768 (131.072 con YaRN) | Sí | Apache 2.0 |
| Qwen3-30B-A3B (MoE) | 30,5B (3,3B activos) | 32.768 (131.072 con YaRN) | Sí | Apache 2.0 |

Frente al Qwen3-14B oficial, esta variante difiere únicamente en el ajuste fino realizado por el autor, sin documentación de las diferencias. Frente a Qwen3-30B-A3B, el modelo de 14B ofrece inferencia más simple y predecible (denso), mientras que el MoE ofrece mayor throughput con menos parámetros activos.

## Limitaciones y advertencias

- No existe documentación específica del finetune: se desconocen los datos de entrenamiento adicionales, el método empleado y la evaluación del autor, por lo que el comportamiento puede desviarse del Qwen3-14B oficial de forma impredecible.
- Riesgo de alucinación inherente a modelos de lenguaje de este tamaño, especialmente en modo "non-thinking" para tareas de razonamiento complejo.
- En modo "thinking" no se debe usar decodificación greedy, ya que puede degradar el rendimiento y provocar repeticiones infinitas; se recomienda Temperature=0.6, TopP=0.95, TopK=20 y MinP=0.
- Sesgos conocidos: no disponibles para esta variante; los del modelo base Qwen3 no están documentados en detalle en la información proporcionada.
- Adopción muy baja (258 descargas y 1 like), sin auditoría comunitaria; se recomienda validación propia antes de uso en producción.
- Requiere transformers >= 4.51.0; con versiones anteriores se produce un error de KeyError.
- Licencia Apache 2.0: permite uso comercial, aunque la model card enlaza a la licencia de Qwen3-14B, que conviene revisar para condiciones de marca y atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zxyty/physicalai-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat (demo): https://chat.qwen.ai/
- Informe técnico de Qwen (arXiv): https://arxiv.org/abs/2309.00071
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
