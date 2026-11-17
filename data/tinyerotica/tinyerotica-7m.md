# TinyErotica/TinyErotica-7M

## Resumen

TinyErotica-7M es un modelo de lenguaje de 7,16 millones de parámetros entrenado desde cero por el usuario TinyErotica para generar relatos eróticos breves y completos (en torno a 150 palabras) en inglés. Se trata de un experimento de "tiny LLM" al estilo de TinyStories: en lugar de escalar el modelo, el autor explora hasta dónde llega un transformer diminuto cuando el dominio de entrenamiento está muy acotado y el dataset es relativamente grande para el tamaño del modelo.

La arquitectura es una Llama clásica (6 capas, 6 cabezas de atención, dimensión oculta 288, FFN de 768 y embeddings atados), con un tokenizador BPE byte-level de 4.096 tokens entrenado específicamente sobre el corpus. La ventana de contexto es de 256 tokens, suficiente para una historia completa, y el modelo se usa sin prompt: cada muestra arranca en el token separador `<|endoftext|>` y termina cuando el modelo lo emite de nuevo.

El interés técnico del modelo está en su evaluación: el autor compara el efecto del tamaño del dataset y de la duración del entrenamiento, y realiza un juicio ciego con otro modelo para contar errores de lógica narrativa. La conclusión reportada es que, con este volumen de datos, aumentar el tamaño del modelo por encima de ~7M no reduce los errores; lo que ayudaría es más datos. La licencia es Apache 2.0, pero el contenido es NSFW y el autor restringe explícitamente su uso a adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only): 6 capas, 6 cabezas, hidden size 288, FFN 768, embeddings atados |
| Parametros totales | 7.155.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el autor menciona evaluación con pesos int8, pero no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos: tokenizador BPE byte-level de 4.096 tokens entrenado sobre el dataset; tamaño del repo 0,1 GB; `generation_config.json` con temperature 1.0, top-k 40, top-p 0.95, min-p 0.10 y repetition penalty 1.08.

## Arquitectura y entrenamiento

Transformer decoder-only con el bloque Llama estándar (RMSNorm, atención causal, SwiGLU en la FFN) a escala muy reducida: 6 capas, 6 cabezas, dimensión 288 y FFN 768, con embeddings de entrada y salida atados. El tokenizador es un BPE byte-level de 4.096 tokens entrenado sobre el propio corpus, lo que reduce el vocabulario al dominio y compensa parcialmente el tamaño diminuto del modelo.

El entrenamiento se realizó desde cero sobre la configuración `curated` del dataset TinyErotica/TinyErotica: 257.002 historias sintéticas de 80–190 palabras en 16 categorías, generadas a partir de planes por historia con un profesor Gemma 4 y verificadas automáticamente (longitud, palabras prohibidas, referencias a edades o menores, actos no planificados, errores de cuerpo y pronombres). Se entrenó durante 60.000 pasos con batch de 64 × 256 tokens (21 épocas), AdamW con lr 1e-3 y schedule cosine, alcanzando una mejor loss de validación de 1.060. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- Generación de texto: escribe relatos eróticos breves y autoconclusivos de aproximadamente 150 palabras en inglés, a partir del token `<|endoftext|>` sin prompt.
- Coherencia narrativa a corto plazo: mantiene personajes y acciones dentro de una única historia de 256 tokens.
- Cobertura de 16 categorías del dataset, incluyendo temas de fantasía oscura entre adultos.
- Generación controlada por sampling: ajustes recomendados de temperature, top-k, top-p, min-p y repetition penalty publicados en `generation_config.json`.
- No soporta tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües.
- No está pensado para seguir instrucciones ni para conversación multi-turno.

## Casos de uso

- Generación de relatos eróticos breves para investigación sobre modelos pequeños: permite estudiar hasta dónde llega un transformer de 7M parámetros en un dominio acotado, con métricas publicadas de coherencia y errores lógicos.
- Experimentos de destilación y imitación de un profesor grande: el dataset sintético generado por Gemma 4 y verificable automáticamente sirve como banco de pruebas para pipelines de destilación a escala mínima.
- Estudio del efecto del tamaño de datos frente al tamaño de modelo: la comparativa del autor (10k, 110k y 257k historias, y modelos de 11,5M–14,0M) es un caso práctico para analizar curvas de escalado en dominios estrechos.
- Benchmarking de samplers y penalizaciones de repetición: los resultados sobre cambio de nombres con penalty 1.08 frente a 1.15 permiten evaluar estrategias de decodificación en modelos con vocabulario y contexto muy limitados.
- Evaluación automática de coherencia narrativa: el esquema de juicio ciego con otro modelo contando errores de lógica (quién hace qué, personajes que aparecen o desaparecen, posiciones imposibles) es reutilizable como metodología.
- Despliegue en hardware mínimo para demos de texto generativo: al ocupar 0,1 GB en safetensors, cabe en CPU y en cualquier GPU consumer, lo que facilita pruebas de inferencia local sin requisitos de VRAM.
- Prototipado de filtros de contenido para productos: sirve como caso de prueba para clasificadores NSFW y políticas de edad mínima antes de integrar modelos mayores del mismo dominio.

## Benchmarks y rendimiento

El autor no publica métricas estándar tipo MMLU, HumanEval o GSM8K. Los datos disponibles son evaluaciones internas de calidad narrativa.

Efecto del tamaño del dataset y del entrenamiento (100 historias por modelo, pesos int8, sampler anterior: temperature 0.8, top-p 0.9, repetition penalty 1.15):

| Metrica | 10k historias | 110k historias | 257k, 30k pasos | 257k, 60k pasos (este modelo) |
|---|---:|---:|---:|---:|
| Historias que terminan solas | 100% | 99% | 100% | 100% |
| Palabras mediana | 129 | 130 | 146 | 146 |
| Historias marcadas por el checker | 5% | 13% | 0% | 0% |
| Historias que cambian de nombre | 10% | 4% | 7% | 1% |
| 4-grams distintos | 0,654 | 0,791 | 0,867 | 0,842 |

Juicio ciego (otro modelo cuenta errores de lógica por historia, sin saber qué modelo o ajuste escribió cada texto):

| Modelo / ajuste | Errores por historia | Historias sin errores |
|---|---:|---:|
| 257k, 30k pasos | 0,67–0,71 | 50–51% |
| Modelos mayores (11,5M–14,0M, mismos datos) | 0,67–0,73 | 50–57% |
| Este modelo, con sampling recomendado | 0,51–0,57 | 60% |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (7,16M parámetros ≈ 29 MB de pesos); en int8 en torno a 7 MB. Cabe holgadamente en CPU.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso iGPU; no requiere A100 ni H100. El repo pesa 0,1 GB.
- Cabe en cualquier GPU consumer y en Raspberry Pi o portátiles modestos.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (vía documentada por el autor); text-generation-inference y endpoints compatibles aparecen en los tags de Hugging Face. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Con 6 capas y contexto de 256 tokens, la generación de una historia completa es de decenas de milisegundos en GPU consumer, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyErotica-7M | 7,16M | 256 tokens | Relatos eróticos breves, inglés | Apache 2.0 | Hugging Face, transformers |
| TinyStories (referencia de familia) | ~1M–33M | ~256–512 tokens | Relatos infantiles simples, inglés | no disponible en esta ficha | Referencia metodológica citada por el autor |
| Modelos mayores del mismo autor (11,5M–14,0M) | 11,5M–14,0M | no disponible | Mismo dataset y dominio | no disponible | Evaluados por el autor, sin ficha enlazada |
| Literotica-Writer-26B-A4B | 26B totales / A4B activos | no disponible | Relatos eróticos largos (1.000–5.000 palabras) | no disponible | Hugging Face, llama.cpp |

La comparación relevante es interna: con el mismo dataset, los modelos de 11,5M–14,0M no obtienen menos errores de lógica que este modelo de 7M con el sampling recomendado (0,51–0,57 errores por historia frente a 0,67–0,73). Para relatos largos, el autor remite a Literotica-Writer-26B-A4B, de otra escala completamente.

## Limitaciones y advertencias

- Contenido NSFW: el modelo genera ficción sexual explícita. El autor lo restringe a mayores de 18 años y prohíbe su uso en cualquier producto accesible a menores.
- Temas sensibles: el dataset incluye fantasía oscura con temas de no consentimiento y relaciones tabú entre adultos; todo es ficción sintética, pero requiere moderación si se despliega en un producto.
- Tamaño muy reducido: las historias son cortas y formulaicas; en escenas de tres personas confunde a veces quién hace qué.
- Contexto de solo 256 tokens: no admite prompts largos, conversación multi-turno ni documentos; cada generación es una historia nueva desde `<|endoftext|>`.
- Solo inglés y solo dominio erótico: no sigue instrucciones generales, no responde preguntas y no sirve como modelo de propósito general.
- Alucinación y errores lógicos: el juicio ciego reporta 0,51–0,57 errores por historia y un 60% de historias sin errores con el sampling recomendado; subir la temperature a 1,05–1,1 añade variedad pero también errores.
- Penalización de repetición: con penalty 1.15, el 7% de las historias cambian de nombre a mitad; el autor recomienda 1.08 con los 50 nombres de personaje exentos.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero las restricciones de edad y contenido del autor deben considerarse antes de cualquier despliegue en producción.
- Sin datos publicados de sesgos demográficos, toxicidad medida con clasificadores estándar ni robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TinyErotica/TinyErotica-7M
- Dataset TinyErotica: https://huggingface.co/datasets/TinyErotica/TinyErotica
- Modelo relacionado Literotica-Writer-26B-A4B: https://huggingface.co/TinyErotica/Literotica-Writer-26B-A4B
- Perfil del autor: https://huggingface.co/TinyErotica
