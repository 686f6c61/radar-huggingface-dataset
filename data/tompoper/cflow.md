# tompoper/cflow

## Resumen

El modelo `tompoper/cflow` es un transformer decoder-only con arquitectura MoE (Mixture of Experts) diseñado específicamente para inferencia eficiente en CPU. Forma parte del proyecto **cflow**, un motor de inferencia en streaming escrito en Rust, y fue desarrollado por Tom P (tompoper). Su principal innovación es un esquema de inyección residual retardada: la FFN densa lee de una residual con un retardo de una capa, y los expertos MoE se inyectan dos capas después de ser ruteados. Esto crea un grafo de dependencias que permite solapar lecturas de pesos con cómputo de capas anteriores, reduciendo el ancho de banda crítico en CPU.

El modelo alojado en este repositorio es la variante `arch2_4_8k_16l`: 16 capas, dimensión oculta 8192, aproximadamente 31 mil millones de parámetros totales (top-2 de 8 expertos, ~20 mil millones activos por token), cuantizado a Q4, con una ventana de contexto de 2048 tokens. Se entrenó sobre TinyStories y fineweb-edu, y su licencia es MIT. La relevancia actual radica en que demuestra que una arquitectura co-diseñada con un runtime de streaming puede superar en rendimiento de decodificación en CPU a modelos densos de tamaño comparable, como Qwen2.5-32B, en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm con FFN densa paralela + bloque MoE esparcido, inyección residual retardada (dense delay=1, expert delay=2) |
| Parametros totales | ~31 mil millones (16 capas, hidden 8192) |
| Parametros activos | ~20 mil millones por token (top-2 de 8 expertos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q4 (única cuantización publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | cflow (model.cflow, 17.39 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con normalización previa (pre-norm) y RMSNorm (eps=1e-6). Cada capa contiene atención multi-cabeza (128 cabezas, dim 64, RoPE base=10000, sin GQA), una FFN densa GeGLU (hidden 32768) y un bloque MoE con 8 expertos GeGLU (hidden 4096) y selección top-2. La clave está en el flujo de residuos: la FFN densa lee de una residual retardada una capa, mientras que los expertos se rutean sobre la residual actual pero se inyectan dos capas más tarde. Este diseño permite que las lecturas de pesos de la capa N se solapen con el cómputo de la capa N-1, reduciendo el ancho de banda crítico en un factor de 2.00x (de 9.00 a 4.50 MB/token), según mediciones del autor.

El entrenamiento se realizó en dos fases. Primero, un barrido de 5 arquitecturas candidatas a escala 114M (6 capas, hidden 512) sobre TinyStories (431M tokens de entrenamiento, 24M de test), con tokenizador GPT-2 BPE (vocab 50,257), secuencias de 512 tokens, AdamW (lr 3e-4, warmup 200 pasos, cosine decay a 1e-5), batch 8, 10,000 pasos, en una RTX 3060 12 GB. La arquitectura seleccionada se escaló a 8.34B (4 capas) para validar calidad y localidad de caché, obteniendo perplexity de validación 4.52 en TinyStories. El modelo alojado (~31B, 16 capas) comparte la geometría por capa pero no se detalla su entrenamiento completo; se menciona el uso de fineweb-edu como dataset adicional.

## Capacidades

- Generación de texto autoregresiva con soporte de streaming en CPU.
- Razonamiento básico y modelado de lenguaje, demostrado en TinyStories (textos narrativos simples).
- Inferencia eficiente en CPU gracias al diseño pipeline-native y al runtime cflow en Rust con soporte AVX-512.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- Multilingüismo limitado: solo inglés (según la etiqueta `language: en`).
- No se menciona modo de pensamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Despliegue de generación de texto en servidores CPU-only: el modelo está diseñado para entornos sin GPU, como instancias cloud económicas o hardware on-premise. Con cflow, alcanza 5.94 tok/s en un Xeon Ice Lake de 32 hilos, superando a Qwen2.5-32B en Ollama (4.75 tok/s) y vLLM CPU (1.65 tok/s) en el mismo hardware.
- Generación de historias o narrativa corta: entrenado en TinyStories, puede producir cuentos coherentes para niños, útil en aplicaciones educativas o de entretenimiento ligero.
- Prototipado de arquitecturas MoE experimentales: al ser un modelo de investigación con licencia MIT, sirve como referencia para estudiar el impacto de la inyección residual retardada en el rendimiento de inferencia en CPU.
- Evaluación de motores de inferencia en Rust: el formato cflow y el runtime asociado permiten comparar el rendimiento de un motor custom frente a soluciones establecidas como llama.cpp o vLLM.
- Investigación en eficiencia de ancho de banda: los datos de benchmark (reducción 2.00x en MB/token) lo convierten en un caso de estudio para optimización de memoria en modelos MoE.
- Generación de texto en tiempo real en aplicaciones de bajo coste: su capacidad de streaming en CPU lo hace adecuado para chatbots o asistentes que no requieren baja latencia extrema pero sí despliegue económico.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Test Perplexity (114M, TinyStories, 10K steps) | 6.50 |
| Top-1 Accuracy (114M, TinyStories, 10K steps) | 56.8% |
| Val Perplexity (8.34B / 4-layer, TinyStories, 10K steps) | 4.52 |
| Top-1 Accuracy (8.34B / 4-layer, TinyStories, 10K steps) | 61.4% |

Benchmark de decodificación en CPU (AWS r6i.8xlarge, Ice Lake Xeon, 256 GB DDR4, 32 hilos):

| Motor | Modelo | Cuantización | tok/s |
|---|---|---|---|
| cflow | arch2_4_8k_16l (~31B MoE, ~20B activos) | Q4 | 5.94 |
| Ollama (llama.cpp) | Qwen2.5-32B (dense) | Q4 GGUF | 4.75 |
| vLLM CPU | Qwen2.5-32B-Instruct (dense) | GPTQ-Int4 | 1.65 |

Nota del autor: cflow y las líneas base ejecutan modelos diferentes (31B MoE con ~20B activos vs 32B denso). Los recuentos totales son comparables (31B vs 32B), pero las arquitecturas y el entrenamiento difieren, por lo que el número de cflow muestra lo que logra una arquitectura co-diseñada con un runtime de streaming, no un resultado con calidad equiparable.

## Requisitos de hardware

- Inferencia en CPU: el benchmark se realizó en un AWS r6i.8xlarge (Xeon Ice Lake, 32 hilos, 256 GB DDR4). No se requiere GPU.
- VRAM: no aplica (inferencia en CPU). El modelo ocupa 17.39 GB en disco en formato Q4.
- CPU recomendada: procesadores x86 con soporte AVX-512 (Ice Lake o posterior) para aprovechar las optimizaciones del runtime cflow.
- RAM: se necesitan al menos 20-25 GB de RAM para cargar el modelo Q4 y la KV cache (contexto 2048).
- Opciones de despliegue: el motor cflow (Rust) es el único runtime soportado para este formato de pesos. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5.94 tok/s en decodificación con 32 hilos, con un ancho de banda efectivo de 61 GB/s (30% del pico de 204.8 GB/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Inferencia CPU (tok/s) | Formato |
|---|---|---|---|---|---|
| cflow arch2_4_8k_16l | ~31B (MoE, ~20B activos) | 2048 | MIT | 5.94 (Q4, cflow) | cflow |
| Qwen2.5-32B | 32B (dense) | 32768 | Apache 2.0 | 4.75 (Q4, Ollama) | GGUF |
| Qwen2.5-32B-Instruct | 32B (dense) | 32768 | Apache 2.0 | 1.65 (GPTQ-Int4, vLLM CPU) | GPTQ |

No se dispone de comparativas con otros modelos MoE de tamaño similar en CPU. La comparación con Qwen2.5-32B es la única documentada, y el propio autor advierte que no es una comparación calidad-equiparable.

## Limitaciones y advertencias

- Entrenamiento limitado: el modelo se entrenó principalmente en TinyStories (textos narrativos simples) y fineweb-edu; no está orientado a tareas complejas de razonamiento, código o matemáticas avanzadas.
- Solo inglés: no hay soporte multilingüe documentado.
- Sin fine-tuning instruct: no se menciona entrenamiento con instrucciones ni RLHF/DPO, por lo que no es adecuado para seguir instrucciones complejas ni para uso como chatbot directo.
- Riesgo de alucinación: al ser un modelo base sin alineación, puede generar contenido factualmente incorrecto o incoherente.
- Formato propietario: los pesos están en formato cflow, no en safetensors ni GGUF, lo que limita su uso a un único runtime (cflow). No es compatible con ecosistemas estándar como Transformers, llama.cpp o vLLM.
- Sin garantías de producción: el proyecto es experimental (paper arXiv:2608.23841) y no hay evidencia de despliegues en producción ni soporte comunitario amplio.
- Datos de benchmark limitados: solo se reportan métricas en TinyStories; no hay resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tompoper/cflow
- Paper (arXiv): https://arxiv.org/abs/2608.23841
- Repositorio de archivos del modelo: https://huggingface.co/tompoper/cflow/tree/main
- Perfil del autor: https://huggingface.co/tompoper/models

Nota: la búsqueda web devolvió un repositorio GitHub llamado "CFLOW" (goldnead/CFLOW) que no está relacionado con este proyecto; no se incluye por falta de relación verificable.
