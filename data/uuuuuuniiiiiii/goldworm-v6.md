# Uuuuuuniiiiiii/goldworm-v6

## Resumen

GoldWorm v6 es un modelo de lenguaje causal de nivel de byte (byte-level) desarrollado por Gold Lab y publicado bajo el identificador `Uuuuuuniiiiiii/goldworm-v6` en Hugging Face. Se trata de un transformer decoder-only de 2,76 millones de parámetros únicos (2.806.656 tensores almacenados en `model.safetensors` por duplicación de los embeddings atados), con un vocabulario de 256 tokens correspondientes a los 256 valores posibles de un byte. No emplea tokenizador: procesa directamente la secuencia de bytes UTF-8, lo que elimina el sesgo de vocabulario y el coste de un tokenizer BPE.

El modelo está entrenado sobre el dataset `roneneldan/TinyStories`, un corpus de historias infantiles sintéticas de vocabulario y sintaxis simples, y está diseñado como experimento de eficiencia y de modelado a nivel de byte en un régimen de escala muy reducida. Su relevancia actual es acotada: no compite con modelos de propósito general, sino que sirve como referencia reproducible de arquitectura byte-level, como banco de pruebas para técnicas de evaluación (BPC, ventanas con stride) y como ejemplo de modelo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.

La model card declara un resultado de 1,0073 bits por byte (BPC) sobre la región outer-val de TinyStories-valid, con protocolo de ventana deslizante de stride 16 y contexto 256, verificado de forma determinista (dos pasadas bit-idénticas). Todos los números son autoinformados por el autor y no han sido replicados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ByteTransformer (transformer decoder-only causal, atención multi-cabeza estándar) |
| Parámetros totales | 2.757.504 únicos (2,76 M); `model.safetensors` suma 2.806.656 por duplicación de embeddings atados |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 bytes |
| Tipos de cuantización | no disponible (pesos en safetensors; al ser un modelo de 2,76 M de parámetros, la cuantización es innecesaria en la práctica) |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, predominantemente inglés; el nivel de byte permite en teoría cualquier UTF-8, pero sin entrenamiento específico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `eval_results.json` |

Configuración declarada: `vocab_size=256`, `d_model=192`, `n_layer=6`, `n_head=4`, `ffn_mult=4`, `ctx=256`, `tie_embeddings=True`, `dropout=0.0`.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con atención multi-cabeza convencional, 6 capas, dimensión de modelo 192, 4 cabezas de atención y un factor de expansión de la FFN de 4 (dimensión interna 768). Los embeddings de entrada y la proyección de salida están atados (`tie_embeddings=True`), lo que explica la diferencia entre parámetros únicos (2.757.504) y la suma de tensores almacenados (2.806.656). La innovación principal es la eliminación completa del tokenizador: el vocabulario son los 256 valores de byte, de modo que la perplejidad se mide directamente en bits por byte (BPC) sin normalización por tokens.

El entrenamiento se realizó sobre `roneneldan/TinyStories`, concretamente sobre la primera parte de `TinyStories-valid.txt` (19,4 MB, sha256 `94e431816c4cce81...` según la model card), y la evaluación se hizo sobre la región outer-val del mismo fichero, es decir, en dominio y con una partición derivada del mismo fichero. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; por el tipo de corpus y el tamaño del modelo, es razonable asumir preentrenamiento puro de modelado de lenguaje, pero este dato no está confirmado en la información disponible. El checkpoint publicado corresponde al paso 8000, seleccionado por BPC en validación interna (`inner_val_windowed_bpc = 1.051187`) antes de leer la partición outer-val, lo que el autor presenta como garantía contra la fuga de información en la selección.

## Capacidades

- Generación de texto autoregresiva a nivel de byte, con decodificación por temperatura y top-k según el demo incluido.
- Modelado de lenguaje y cálculo de bits por byte sobre secuencias UTF-8 arbitrarias, sin dependencia de un tokenizador.
- Generación de historias infantiles simples al estilo TinyStories (frases cortas, vocabulario reducido, coherencia local).
- Manejo de cualquier byte de entrada, incluidos caracteres no ASCII, sin tokens fuera de vocabulario (OOV) por construcción.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica ni modo de razonamiento (thinking mode).
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Docencia y divulgación de arquitecturas transformer: el modelo es lo bastante pequeño (2,76 M de parámetros, 6 capas) para leer su configuración completa, cargarlo en un portátil y ejecutar el forward pass paso a paso en un cuaderno, lo que lo hace idóneo para explicar atención, embeddings atados y decodificación causal.
- Referencia reproducible de modelado a nivel de byte: sirve como baseline para comparar técnicas de tokenización frente a byte-level en corpus pequeños, con una métrica directa (BPC) y un protocolo de evaluación documentado (ventana stride 16, contexto 256).
- Pruebas de infraestructura de inferencia: por su tamaño, se puede usar para validar pipelines de carga con `safetensors`, integración con Streamlit, comprobaciones de determinismo y paridad numérica entre implementaciones antes de escalar a modelos mayores.
- Generación de texto sintético de juguete: producción de micro-relatos infantiles para pruebas de UI, datos de relleno en demos o ejemplos en documentación, donde la calidad TinyStories es suficiente y el coste computacional es despreciable.
- Evaluación de técnicas de cuantización y compresión extrema: con 2,76 M de parámetros, es un banco de pruebas barato para medir el impacto de cuantizaciones agresivas (int8, int4) en BPC sin necesidad de GPUs de gama alta.
- Experimentos de interpretabilidad en modelos pequeños: al tener solo 6 capas y un vocabulario de 256 elementos, facilita el análisis de activaciones, mapas de atención y circuitos internos con trazabilidad completa.
- Demo interactivo en Spaces: el Space `Gold_Lab` permite probar la generación sin instalación local, útil para talleres y presentaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Contexto |
|---|---|---|---|
| TinyStories (held-out outer-val de valid) | bits/byte | 1,0073 | Paso 8000, ventana stride 16, contexto 256, 129.429 posiciones fijas |
| TinyStories (validación interna) | bits/byte (windowed) | 1,051187 | Selección de checkpoint |
| Baseline unigram (train-matched) | bits/byte | 4,437 | Add-k 0.01 |
| Baseline bigram (train-matched) | bits/byte | 3,317 | Add-k 0.01 |
| Referencia congelada v1 | bits/byte | 2,566 | Gate de calidad |
| GPT-2 124M (mismo protocolo, autoinformado) | bits/byte | 1,142985 | No reproducido; comparación indicativa, GPT-2 evaluado zero-shot fuera de dominio |

El autor advierte explícitamente de que la comparación con GPT-2 124M depende del protocolo (contexto, ventanas, normalización byte vs token) y no ha sido reproducida de forma independiente; en una porción de 256 KB de TinyStories-validation, el benchmark de `goldworm-coder` midió GPT-2 124M en 1,1203. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (2,76 M de parámetros × 4 bytes ≈ 11 MB de pesos, más activaciones y buffers de contexto de 256 bytes); cabe en cualquier GPU, iGPU o incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU Intel o una Raspberry Pi son suficientes.
- Cabe en GPU consumer: sí, en todas, incluidas las de gama de entrada y las integradas.
- Opciones de despliegue: el autor documenta carga directa con PyTorch + `safetensors` y un demo con Streamlit (`demo/app.py`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; dada la arquitectura byte-level personalizada y la librería `goldworm-v6`, la integración con esos motores requeriría trabajo adicional no cubierto en la información disponible.
- Latencia y throughput: no disponibles de forma medida. Por el tamaño, la latencia por token debería ser del orden de microsegundos a milisegundos en GPU y de pocos milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Resultado declarado |
|---|---|---|---|---|---|
| GoldWorm v6 | 2,76 M | 256 bytes | Byte-level (256) | MIT | 1,0073 BPC en TinyStories outer-val (autoinformado) |
| GPT-2 124M | 124 M | 1024 tokens | BPE (50.257) | MIT | 1,142985 BPC en el mismo protocolo según el autor (no reproducido; zero-shot, fuera de dominio) |
| TinyStories-1M (variante de referencia) | ~1 M | 512 tokens | BPE | no disponible en la información | no disponible |
| TinyStories-33M (variante de referencia) | ~33 M | 512 tokens | BPE | no disponible en la información | no disponible |

La comparación con GPT-2 124M es la única que el autor aporta con números, y él mismo la califica de indicativa: GPT-2 es un modelo general evaluado zero-shot, mientras que GoldWorm v6 está entrenado en dominio. No hay comparación publicada con un baseline BPE del mismo tamaño, limitación que el propio autor reconoce. Las variantes TinyStories de referencia se incluyen como contexto de categoría, pero no se dispone de sus cifras en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado sobre el mismo fichero (`TinyStories-valid.txt`): la evaluación es en dominio y sobre una partición derivada del mismo fichero, por lo que el BPC reportado no es representativo de generalización fuera de TinyStories.
- No existe un baseline BPE del mismo tamaño con el que comparar; la ventaja del enfoque byte-level frente a tokenización no está demostrada.
- Calidad de generación limitada a historias infantiles simples; no es un modelo de propósito general y no debe usarse para tareas de razonamiento, código, matemáticas o atención al cliente.
- Todos los números son autoinformados y no han sido re-medidos de forma independiente; el propio autor lo señala.
- Contexto de solo 256 bytes, insuficiente para conversaciones multi-turno, documentos o cualquier tarea que requiera memoria extendida.
- Idiomas soportados no documentados; el entrenamiento en TinyStories es predominantemente en inglés y no hay evidencia de calidad en castellano u otras lenguas.
- Riesgo de alucinación y de incoherencia a partir de pocos cientos de bytes generados, inherente a un modelo de 2,76 M de parámetros.
- Sesgos: no documentados por el autor; el corpus TinyStories es sintético y de temática infantil, lo que reduce pero no elimina sesgos de género o rol en los personajes.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no obstante, la calidad del modelo hace inviable su uso comercial real más allá de demos o experimentos.
- La arquitectura y la librería `goldworm-v6` son personalizadas, lo que limita la portabilidad a ecosistemas estándar (Transformers, vLLM, llama.cpp) sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Space de demostración (Gold Lab): https://huggingface.co/spaces/Uuuuuuniiiiiii/Gold_Lab
- Vídeo explicativo: https://youtu.be/Wuh3_bJSxyY
- Podcast: https://youtu.be/ijVZXPYTsXU
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- DOI del modelo: https://doi.org/10.57967/hf/10547
