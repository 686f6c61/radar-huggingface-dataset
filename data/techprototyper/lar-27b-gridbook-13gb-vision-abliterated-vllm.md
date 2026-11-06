# TechPrototyper/LAR-27B-GridBook-13GB-vision-abliterated-vllm

## Resumen

LAR-27B-GridBook-13GB-vision-abliterated-vllm es una comprobación de concepto de cuantización extrema publicada por el usuario TechPrototyper en Hugging Face. Se trata de un derivado del modelo `amazon/LAR-27B` (el modelo Lean4AgenticRL de Ruida Wang, Gerald Friedland, Tong Zhang y Chris Kong, arXiv 2610.22448), cuantizado con la herramienta PrismaQuant de Robert Tand al formato GridBook `nvfp4_cb` con una asignación mixta de aproximadamente 3,6 bits por parámetro. Sobre esa base se le añaden la torre de visión y la cabeza MTP de `Qwen/Qwen3.8-27B`, y se le aplica una reducción del comportamiento de rechazo (abliteration) en formato, sin recuantizar después de la edición.

El resultado es un modelo de 12.648.376.704 parámetros reales (etiquetado comercialmente como 27B) que ocupa unos 15,7 GB en el repositorio y que, según el autor, cabe en una única GPU de 32 GB con 262k tokens de contexto. La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con 64 capas de las cuales 16 son de atención y 48 son SSM (modelos de espacio de estados), lo que lo convierte en un híbrido atención-SSM. Es relevante porque demuestra que es posible servir un modelo agéntico con visión y contexto largo en hardware de consumo, aunque a costa de depender de un plugin propietario de vLLM (`gridbook==0.8.8`) y de `nvcc` para compilar los kernels CUDA/CUTLASS.

La licencia es Apache-2.0 y el modelo base también lo es, pero el autor advierte explícitamente de que se trata de un derivado comunitario independiente, no afiliado ni revisado por Amazon ni por los autores de LAR. El checkpoint tiene 28 descargas y 0 likes en el momento de redactar esta ficha, y fue creado y actualizado el 25 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` híbrida: 64 capas (16 de atención, 48 SSM) |
| Parámetros totales | 12.648.376.704 (dato real de safetensors) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (262k, según el autor) |
| Tipos de cuantización | GridBook `NVFP4_CB` y `FP8_CB` en las lineales del cuerpo (~3,6 bpp); `lm_head` en FP8 E4M3 con escala por fila; `embed_tokens` en BF16; torre de visión y MTP en BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `visual.safetensors`, `mtp.safetensors`) con codebooks en `cb_codebooks.pqcb`; requiere plugin GridBook para vLLM |

## Arquitectura y entrenamiento

La arquitectura es híbrida atención-SSM: 64 capas en total, de las cuales 16 son capas de atención y 48 son capas de espacio de estados. Esta estructura proviene de `Qwen/Qwen3.8-27B`, de donde también se toman la torre de visión (333 tensores BF16 en `visual.safetensors`) y la cabeza MTP (15 tensores BF16 en `mtp.safetensors`). El cuerpo del modelo es `amazon/LAR-27B`, un modelo entrenado con Lean4AgenticRL, un método de RL agéntico con recompensas de proceso verificables a varios niveles, según el paper arXiv 2610.22448. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset original de LAR.

La innovación técnica principal no está en el entrenamiento sino en la cuantización. PrismaQuant asigna a cada matriz lineal su propio formato y anchura de palabra (codewords) mediante un allocator guiado por KL de extremo a extremo, en lugar de usar una anchura de bits uniforme. GridBook convierte esa asignación en codebooks de vectores producto sobre una rejilla de hardware y los sirve con kernels nativos CUDA/CUTLASS en Blackwell de consumo. La asignación usada aquí (la "5080 allocation") es la de Robert Tand, heredada sin cambios de `rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm`. La calibración se hizo con la receta `diverse-v1` de PrismaQuant: 256 filas de 4096 tokens, semilla 20260509, con un 40 % de prosa, 20 % de código, 20 % de matemáticas y 20 % multilingüe, construida a partir de fineweb-edu, codeparrot-clean, proof-pile-2, open-web-math, flores200 y fineweb-2. Los datos de calibración no se incluyen en el repositorio.

La abliteration se aplica como transferencia de delta: para las matrices `o_proj`, `out_proj` y `down_proj` de las capas 26 a 55 se toma `W_heretic-ara − W_Qwen3.8-27B` y se suma a los pesos BF16 de LAR, y después se recodifican solo esos 60 tensores dentro del checkpoint GridBook existente contra planos de escala congelados. Los objetivos en rejillas gruesas (`NVFP4_CB_K12/14/16`, `FP8_CB_K32/40`) quedan bit-idénticos. La dirección de abliteration proviene de `trohrbaugh/Qwen3.8-27B-heretic-ara`, generada con Heretic de p-e-w en modo ARA.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, heredado de la base LAR entrenada con RL agéntico.
- Razonamiento matemático y formal: la base es un modelo Lean4AgenticRL, orientado a demostración interactiva y verificación de pruebas.
- Generación de código, con soporte declarado en la receta de calibración (20 % de código) y en el pipeline `image-text-to-text`.
- Visión: torre visual de Qwen3.8 adjunta, pipeline `image-text-to-text`, entrada de imagen y texto.
- Contexto largo: 262k tokens según el autor, adecuado para documentos extensos y conversaciones multi-turno largas.
- Cabeza MTP (multi-token prediction) para decodificación especulativa y mejora de throughput.
- Comportamiento de rechazo reducido (abliterated), lo que amplía el rango de respuestas pero elimina parte de los filtros de seguridad del modelo base.
- Tool calling y function calling: no se declara explícitamente en la información disponible; la base LAR está orientada a agentes, pero no hay confirmación en la model card.
- Capacidades multilingües: no disponible (la receta de calibración incluye un 20 % multilingüe, pero no se declaran idiomas soportados).

## Casos de uso

- Demostración de cuantización extrema en hardware de consumo: sirve para validar que un modelo de 27B con visión y 262k de contexto puede ejecutarse en una GPU Blackwell de 32 GB, útil para laboratorios que quieran reproducir el pipeline PrismaQuant/GridBook.
- Investigación sobre abliteration en formato: el checkpoint permite estudiar cómo afecta la transferencia de delta de abliteration a las capacidades del modelo sin recuantizar, comparando las armas L1 (sin abliterar) y L2 (abliterada) descritas por el autor.
- Razonamiento formal asistido: dado el origen Lean4AgenticRL, es adecuado para experimentos de generación de tácticas y pruebas en Lean 4, con verificación posterior mediante el comprobador de pruebas.
- Procesamiento de documentos largos con imagen: la combinación de contexto de 262k y torre visual permite ingerir informes escaneados o PDF largos y hacer preguntas sobre ellos en una sola pasada.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir ganancias de throughput en vLLM con el plugin GridBook frente a decodificación autoregresiva estándar.
- Prototipado de agentes con contexto largo: conversaciones multi-turno con historial extenso y llamadas a herramientas, siempre que se valide primero el soporte real de tool calling en la base LAR.
- Investigación de seguridad y alineación: al ser un modelo abliterado, es útil como caso de estudio de qué se pierde y qué se gana al eliminar la dirección de rechazo, con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor menciona mediciones propias con un arnés privado sobre una DGX Spark (GB10, sm_121) con vLLM 7d0b4e57, FlashInfer 0.7.1 y gridbook 0.8.8, comparando cuatro brazos (REF, L1, L2 y Q0), pero los valores numéricos no se incluyen en el extracto disponible de la model card.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,7 GB; el autor afirma que el modelo cabe en una única GPU de 32 GB con 262k de contexto. Para contexto completo hay que sumar la caché KV, que no se cuantifica en los datos disponibles.
- GPU recomendadas: el autor cita una DGX Spark (GB10, sm_121) y la asignación de Robert Tand está pensada para una RTX 5080 (Blackwell de consumo). Los kernels son CUDA/CUTLASS nativos para Blackwell.
- GPU de consumo: sí, en tarjetas Blackwell de 32 GB (RTX 5080/5090 según la asignación "5080"). En generaciones anteriores (Ampere, Ada) no hay confirmación de que los kernels GridBook funcionen.
- Despliegue: exclusivamente vLLM con el plugin `gridbook==0.8.8` de Robert Tand y `nvcc` para compilar kernels. No funciona en vLLM vanilla, ni en llama.cpp, Ollama o TGI, según la advertencia del autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este checkpoint (LAR-27B GridBook) | 12,65B reales | 262k | Sí | Apache-2.0 | safetensors + plugin GridBook en vLLM |
| `amazon/LAR-27B` (base) | no disponible | no disponible | No (solo texto) | Apache-2.0 | BF16, vLLM estándar |
| `rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm` | ~27B (según nombre) | no disponible | no disponible | no disponible | safetensors + GridBook |
| `TechPrototyper/Qwen3.8-27B-GridBook-13GB-vision-abliterated-vllm` (Q0) | no disponible | no disponible | Sí | no disponible | safetensors + GridBook |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, Qwen3 de 27B en BF16) no está disponible en la información proporcionada, y no se han publicado cifras de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No funciona en vLLM vanilla: requiere el plugin `gridbook==0.8.8` de Robert Tand y `nvcc`. Esto limita la portabilidad y añade una dependencia de un proyecto externo.
- La abliteration reduce el comportamiento de rechazo, lo que puede producir respuestas dañinas o inapropiadas sin filtro. No es apto para producción orientada al público sin salvaguardas adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Los datos de calibración no se incluyen, lo que dificulta reproducir exactamente el proceso de cuantización.
- El modelo es un derivado comunitario independiente, no afiliado ni revisado por Amazon ni por los autores de LAR; la calidad de la cuantización y de la abliteration no está validada por terceros.
- Idiomas soportados no declarados; el rendimiento multilingüe es incierto pese al 20 % multilingüe en la calibración.
- El soporte de tool calling no está confirmado en la model card.
- El contexto de 262k requiere memoria adicional para la caché KV, no cuantificada en los datos disponibles.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad del uso recae en el desplegador.

## Enlaces

- Hugging Face: https://huggingface.co/TechPrototyper/LAR-27B-GridBook-13GB-vision-abliterated-vllm
- Modelo base LAR: https://huggingface.co/amazon/LAR-27B
- Paper Lean4AgenticRL: https://arxiv.org/abs/2610.22448
- Arquitectura y torre visual: https://huggingface.co/Qwen/Qwen3.8-27B
- Dirección de abliteration: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Heretic (p-e-w): https://github.com/p-e-w/heretic
- PrismaQuant (Robert Tand): https://github.com/RobTand/prismaquant
- GridBook (Robert Tand): https://github.com/RobTand/gridbook
- Checkpoint de referencia de la asignación 5080: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-gridbook-13GB-5080-vllm
- Modelo de producción previo del autor (Q0): https://huggingface.co/TechPrototyper/Qwen3.8-27B-GridBook-13GB-vision-abliterated-vllm
