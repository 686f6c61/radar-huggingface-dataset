# zhang821102/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP

## Resumen

Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP es una redistribución no oficial del modelo Gemma 4 31B de Google DeepMind, publicada por el usuario zhang821102 (HauhauCS) en Hugging Face. Se trata de una versión "sin censura" del modelo base, construida a partir de los pesos oficiales QAT (quantization-aware training) de Google, lo que permite que la cuantización a 4 bits mantenga una calidad cercana a la precisión completa. El modelo conserva las capacidades del original (razonamiento, código, visión, agentic) pero elimina los mecanismos de rechazo, según el autor con "0/465 refusals" en sus pruebas.

Arquitectura transformer densa de 31B parámetros (30.697.345.596 exactos según safetensors), con una ventana de contexto de 256K tokens (262.144) y soporte multimodal imagen-texto mediante un proyector mmproj separado. Incluye una cabeza de borrador MTP (multi-token prediction) para decodificación especulativa, que según el autor acelera la generación aproximadamente un 53% sin alterar la salida, ya que cada token es verificado.

Es relevante para desarrolladores que necesitan un modelo grande con contexto muy largo, capacidades agénticas y de código, y que no quieren restricciones de rechazo en tareas creativas o de rol. La distribución es exclusivamente en GGUF Q4_K_M (18,7 GB), pensada para ejecutarse en llama.cpp y runtimes compatibles, con licencia Gemma que impone restricciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), multimodal imagen-texto |
| Parámetros totales | 30.697.345.596 (~31B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q4_K_M (GGUF); mmproj en BF16; MTP drafter en GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (Q4_K_M, mmproj BF16, MTP drafter) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B de Google DeepMind, un transformer denso entrenado con quantization-aware training (QAT) para que la cuantización a 4 bits conserve la mayor parte de la calidad del modelo en precisión completa. Esta distribución no modifica los datos de entrenamiento ni las capacidades del original: según el autor, es "100% de lo que los autores originales pretendían, solo sin los rechazos". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base dentro de la información proporcionada.

La innovación técnica destacable es la inclusión de una cabeza MTP (multi-token prediction) para decodificación especulativa, procedente de la release de Gemma 4 de Unsloth. Esta cabeza actúa como drafter: propone varios tokens y el modelo principal los verifica, de modo que la salida es idéntica pero la generación es aproximadamente un 53% más rápida según las pruebas del autor en llama.cpp. El ajuste "Balanced" está afinado para coding agéntico, razonamiento, escritura creativa y tareas donde la fiabilidad es crítica, con un modo de razonamiento previo a la respuesta. El autor indica que no ha necesitado una variante "Aggressive" tras las pruebas actuales.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento previo a la respuesta (reasoning before answering).
- Generación de código y tareas de coding agéntico.
- Capacidades multimodales de imagen a texto mediante el proyector mmproj (BF16).
- Escritura creativa, roleplay y conversación multi-turno.
- Comportamiento agéntico y seguimiento de instrucciones orientado a tareas de fiabilidad crítica.
- Contexto largo de 256K tokens para documentos extensos y conversaciones prolongadas.
- Sin mecanismos de rechazo en uso estándar según el autor (0/465 en benchmarks de rechazo), con algunos casos límite que requieren reformulación.
- Soporte de decodificación especulativa mediante cabeza MTP para acelerar la inferencia.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de CI/CD o en editores para generar, revisar y refactorizar código, apoyándose en su contexto de 256K para analizar repositorios completos y en su comportamiento agéntico para tareas multi-paso.
- Agentes autónomos con tool calling: su orientación a tareas agénticas y su contexto largo permiten mantener estado de conversación y ejecutar cadenas de acciones con documentos e imágenes de entrada.
- Análisis de documentos extensos con imágenes: gracias a los 256K tokens de contexto y al soporte de visión vía mmproj, puede procesar informes, contratos o manuales con figuras en una sola pasada.
- Escritura creativa y narrativa larga: la variante sin censura y el modo de razonamiento previo permiten generar ficción, guiones y contenido de rol sin los rechazos del modelo base.
- Roleplay y personajes conversacionales: el ajuste Balanced y los parámetros de muestreo recomendados (temperature 0.6, top_k 64, top_p 0.9) están calibrados para mantener coherencia de personaje en sesiones multi-turno.
- Asistente técnico local en estación de trabajo: con el GGUF Q4_K_M de 18,7 GB y el drafter MTP, puede desplegarse en una GPU de 24 GB con llama.cpp para consultas técnicas con contexto largo y baja latencia relativa.
- Investigación sobre alineación y rechazos: útil para estudiar el comportamiento de modelos sin censura frente a los originales, comparando tasas de rechazo y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta "0/465 refusals" en sus pruebas de rechazo automatizadas y manuales, y una aceleración aproximada del 53% en generación con la cabeza MTP en llama.cpp, sin cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 18,7 GB; sumando el mmproj BF16 (1,2 GB) y el drafter MTP (280 MB), se necesitan aproximadamente 20-21 GB de VRAM para el conjunto completo con visión y decodificación especulativa.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para el conjunto completo en una sola GPU; A100 40/80 GB y H100 para mayor throughput y contexto completo de 256K.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB como la RTX 4090 o 3090 con Q4_K_M; en GPUs de 16 GB no cabe el modelo completo sin offloading a CPU.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli), LM Studio, Jan, koboldcpp y otros runtimes GGUF. El autor advierte que en LM Studio el modo tensor-split puede provocar cuelgues con Gemma 4; recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta ~53% más de velocidad de generación con la cabeza MTP en llama.cpp respecto a la generación sin drafter.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP | ~31B denso | 256K | Sí (mmproj) | Gemma | GGUF Q4_K_M |
| google/gemma-4-31B-it (base oficial) | ~31B denso | 256K (según model card del autor) | Sí | Gemma | safetensors/GGUF oficiales |
| Otras variantes uncensored de Gemma 4 31B | no disponible | no disponible | no disponible | Gemma | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo sin censura: elimina los rechazos del original, lo que implica que puede generar contenido dañino, ofensivo o inexacto sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos, citas o código; el modo de razonamiento previo no elimina este riesgo.
- Idiomas: solo se declara inglés ("en"); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de Google antes de un despliegue comercial.
- Distribución no oficial: no es un modelo de Google; el autor no ofrece garantías de calidad, soporte ni seguridad, y la model card no documenta el proceso exacto de eliminación de rechazos.
- Cuantización única: solo se ofrece Q4_K_M; no hay versiones de mayor precisión, lo que limita la evaluación de la pérdida de calidad respecto al original.
- Advertencia de estabilidad: el autor reporta cuelgues en LM Studio con tensor-split en multi-GPU para Gemma 4; se recomienda una sola GPU o layer-split.
- Casos límite de rechazo: aunque el autor reporta 0/465, algunos prompts límite se desvían en el primer intento y requieren reformulación.
- Fecha de creación inusual (2026-10-31) y solo 367 descargas y 0 likes: poca validación comunitaria y trazabilidad limitada.

## Enlaces

- Hugging Face: https://huggingface.co/zhang821102/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Cabeza MTP de Unsloth (referenciada en la model card): no disponible como enlace directo en la información proporcionada.
