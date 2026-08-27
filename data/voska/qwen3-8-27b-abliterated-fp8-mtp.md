# voska/Qwen3.8-27B-abliterated-FP8-MTP

## Resumen

El modelo `voska/Qwen3.8-27B-abliterated-FP8-MTP` es una cuantización FP8 W8A8 del modelo abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva del Qwen3.8-27B de Alibaba. Su particularidad principal es que conserva la cabeza de predicción multi-token (MTP) intacta, algo que la mayoría de conversiones pierden silenciosamente al pasar por `transformers`, lo que permite activar la decodificación especulativa en vLLM y multiplicar por aproximadamente 2,5 el número de tokens generados por pasada.

El modelo reduce el peso de 55,6 GB (BF16) a 31,2 GB, manteniendo una calidad de salida comparable a la de un GGUF de 8 bits (divergencia KL de 0,00064 frente a BF16). Está pensado para despliegues en producción con vLLM, con soporte nativo de contexto de 262 144 tokens, arquitectura híbrida de atención (16 de 64 capas full-attention) y comportamiento abliterado verificado (0/10 rechazos en una sonda de 10 prompts sensibles). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (full-attention cada 4ª capa, 16 de 64) con cabeza MTP |
| Parametros totales | 27 360 632 560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo, sin YaRN) |
| Tipos de cuantizacion | FP8 W8A8 (compressed-tensors), pesos estáticos por canal, activaciones dinámicas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, con tensores BF16 para lm_head y torre de visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso de visión-lenguaje con arquitectura híbrida: de sus 64 capas, solo 16 son de atención completa (cada cuarta capa), lo que reduce el coste de KV cache a 64 KB por token y hace viable una ventana de 262 144 tokens. Incluye una cabeza de predicción multi-token (MTP) de una capa oculta, compuesta por 15 tensores (`mtp.*`), que se usa para decodificación especulativa.

La cuantización FP8 se realizó con `llmcompressor` usando el esquema `FP8_DYNAMIC`, que no requiere datos de calibración: los pesos se cuantizan estáticamente por canal y las activaciones de forma dinámica por token en tiempo de ejecución. Se excluyeron `lm_head` y la torre de visión, que permanecen en BF16, siguiendo la práctica de la versión FP8 oficial de Qwen. La cabeza MTP se copió del modelo BF16 original y se declaró correctamente en `quantization_config.ignore` para que vLLM pueda cargarla sin errores.

El proceso de abliteración (eliminación de rechazos) fue realizado por `huihui-ai` sobre el modelo base, y se mantiene intacto en esta cuantización: una sonda de 10 prompts que cubren ficción adulta, lenguaje soez, argumentación política, reducción de daños, educación en seguridad, consejo médico directo y ficción oscura devolvió 0/10 rechazos, idéntico al modelo BF16 de origen.

## Capacidades

- Generación de texto y conversación multi-turno con razonamiento encadenado (chain-of-thought) extraído a un campo separado mediante `--reasoning-parser qwen3`.
- Decodificación especulativa con cabeza MTP: 51,2 % de aceptación de borradores y 2,54 tokens comprometidos por ronda en vLLM, lo que acelera la generación sin pérdida de calidad.
- Soporte de tool calling y uso de herramientas, heredado del Qwen3.8-27B base.
- Capacidades multimodales de visión (image-text-to-text) presentes en la torre de visión, aunque esta se mantiene en BF16 y puede desactivarse con `--limit-mm-per-prompt '{"image":0,"video":0}'` para servir solo texto.
- Comportamiento abliterado: no produce rechazos en prompts sensibles (verificado con sonda de 10 casos).
- Contexto largo nativo de 262 144 tokens, sin extensión YaRN, gracias a la arquitectura híbrida de atención.

## Casos de uso

- Despliegue de un modelo de razonamiento con contexto largo en producción: con 262K tokens de ventana y KV cache de 64 KB/token, puede procesar documentos extensos, transcripciones completas o conversaciones de muchas vueltas en una sola pasada, algo inviable con arquitecturas de atención completa.
- Servicio de chat con baja latencia en GPU de alta gama: la decodificación especulativa con MTP eleva el throughput de 47-49 a 67-79 tok/s en un solo stream, y a 427 tok/s agregados con 8 streams concurrentes, reduciendo el coste por petición.
- Investigación sobre eliminación de rechazos (abliteration): al mantener el comportamiento sin censura del modelo base, sirve para estudiar los límites de la seguridad en modelos de lenguaje, siempre bajo la licencia Apache 2.0 y con responsabilidad legal del usuario.
- Generación de código y asistencia de programación: el Qwen3.8-27B base destaca en tareas de codificación y productividad de oficina; esta versión FP8 permite ejecutarlo con menos VRAM manteniendo la calidad de 8 bits.
- Procesamiento de documentos con razonamiento visual: aunque la torre de visión está en BF16, el modelo puede combinar imagen y texto para tareas como extracción de información de capturas o diagramas, con la ventaja del contexto largo.
- Evaluación de calidad de cuantización: al ser FP8 dinámico sin calibración, es útil como referencia para comparar el impacto de distintas cuantizaciones (GGUF Q8_0, FP8, 4-bit) sobre la divergencia KL y el rendimiento en tareas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este modelo concreto. La model card solo reporta métricas de rendimiento de inferencia y calidad de cuantización:

| Metrica | BF16 | FP8 (este modelo) |
|---|---:|---:|
| Prefill | 4 018 tok/s | 6 663 tok/s |
| Decode, un solo stream | 47-49 tok/s | 67-79 tok/s |
| Decode @ 8 concurrentes, por stream | 38,3 tok/s | 55,9 tok/s |
| Agregado @ 8 concurrentes | 288,8 tok/s | 427,4 tok/s |
| Pool de KV cache @ 262K contexto | 486K tokens | 820K tokens |

Mediciones realizadas en una GPU Blackwell-class de 96 GB (SM120) con límite de potencia, vLLM 0.26.0 y especulación k=3. La divergencia KL frente a BF16 es de 0,00064 (equivalente a Q8_0), frente a 0,00835 del mejor 4-bit.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 31,2 GB. Con contexto completo de 262K tokens y KV cache de 64 KB/token, se necesitan aproximadamente 16 GB adicionales, totalizando unos 48 GB. Con contexto reducido (p. ej. 32K tokens), la VRAM necesaria baja a unos 33-35 GB.
- GPU recomendadas: para contexto completo, una GPU de 48 GB (RTX 6000 Ada, A6000) o 96 GB (Blackwell-class, H100 NVL). Para contexto reducido, una RTX 4090 (24 GB) puede ser insuficiente por poco margen; una RTX 5090 (32 GB) sería más adecuada.
- No cabe en GPUs consumer de 16 GB o menos, ni en la mayoría de portátiles.
- Opciones de despliegue: vLLM es la opción principal y la única que aprovecha la cabeza MTP mediante `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'`. También es compatible con `transformers` para carga estándar, aunque sin decodificación especulativa.
- Latencia y throughput: con vLLM y especulación activa, se midieron 67-79 tok/s en un solo stream y 427 tok/s agregados con 8 streams concurrentes en una GPU Blackwell de 96 GB. Sin especulación, el rendimiento cae a niveles BF16 o inferiores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| voska/Qwen3.8-27B-abliterated-FP8-MTP | 27,36B | 262 144 | FP8 W8A8 | Sí (preservada) | Apache 2.0 | Abliterado, MTP declarada para vLLM |
| Qwen/Qwen3.8-27B-FP8 | 27,36B | 262 144 | FP8 W8A8 | Sí (oficial) | Apache 2.0 | Versión oficial de Qwen, sin abliteración |
| Qwen/Qwen3.8-27B | 27,36B | 262 144 | BF16 | Sí | Apache 2.0 | Modelo base original, 55,6 GB |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27,36B | 262 144 | FP8 | Sí | Apache 2.0 (research-only) | Abliterado, con restricción de uso solo investigación |

La diferencia clave frente a la versión oficial FP8 de Qwen es la abliteración y la garantía de que la cabeza MTP se conserva y declara correctamente, algo que muchas conversiones de terceros pierden silenciosamente. Frente a la versión de orcarouter, este modelo usa licencia Apache 2.0 sin restricción research-only, aunque ambos comparten origen y comportamiento.

## Limitaciones y advertencias

- Modelo abliterado: puede generar contenido explícito, ofensivo o peligroso sin filtros. Su uso en producción debe evaluarse legal y éticamente; la licencia Apache 2.0 no exime de responsabilidad al desplegador.
- Sin datos de benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni otros para esta cuantización concreta, por lo que no se puede comparar su calidad en tareas estándar con otros modelos.
- La cabeza MTP solo funciona si se activa explícitamente en vLLM con `--speculative-config`; si se omite, el modelo funciona como un FP8 normal y la cabeza queda inactiva. Además, si la declaración de la cabeza es incorrecta, la tasa de aceptación cae a cero sin errores visibles, degradando el rendimiento.
- La torre de visión permanece en BF16, lo que aumenta ligeramente el uso de VRAM y puede requerir desactivarla para servir solo texto.
- El rendimiento medido se obtuvo en una GPU Blackwell de 96 GB con límite de potencia; en hardware inferior los números serán menores.
- No se especifican los idiomas soportados en la model card; se asume herencia del Qwen3.8-27B base, pero no está confirmado para esta versión.
- El proceso de cuantización FP8 dinámico no requiere calibración, pero la calidad puede variar ligeramente respecto al BF16 en tareas de precisión numérica o matemáticas, aunque la divergencia KL medida es baja (0,00064).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voska/Qwen3.8-27B-abliterated-FP8-MTP
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen3.8-27B-FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Blog sobre Qwen3.8-27B Uncensored GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Blog sobre Qwen3.8-27B Uncensored FP8: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8
