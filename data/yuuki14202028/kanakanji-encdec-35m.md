# yuuki14202028/kanakanji-encdec-35m

## Resumen

kanakanji-encdec-35m es un modelo encoder-decoder de 34,6 millones de parámetros especializado en conversión de kana a kanji (kana-kanji conversion) para japonés, la tarea central de cualquier IME (Input Method Editor) japonés. Lo desarrolla el usuario yuuki14202028 y se publica bajo licencia Apache-2.0. El modelo recibe una lectura en katakana y, opcionalmente, un contexto izquierdo, y devuelve texto mixto kanji-kana.

La arquitectura es híbrida: un encoder bidireccional de 3 capas procesa la lectura katakana, mientras que un decoder compatible con Llama de 6 capas genera la salida y gestiona el contexto. La atención cruzada se limita a las capas 2, 3 y 4 del decoder y se desactiva en las posiciones del contexto, lo que permite reutilizar la caché KV del contexto entre conversiones sucesivas. El modelo se inicializa a partir de una versión reducida de llm-jp/llm-jp-3-150m y se entrena con unos 200 millones de ejemplos derivados del dataset zenz-v2.5 y de texto japonés con lecturas pseudo-generadas.

Su relevancia es práctica: ofrece una alternativa ligera y de licencia permisiva para integrar conversión kana-kanji en teclados, editores y aplicaciones de escritura japonesa sin depender de motores propietarios ni de modelos de gran tamaño. Con 34,6 M de parámetros y un repositorio de 0,2 GB, está pensado para inferencia en CPU o GPU de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer; encoder bidireccional de 3 capas + decoder estilo Llama de 6 capas con cross-attention en las capas 2, 3 y 4 |
| Parametros totales | 34.580.995 (encoder 2,6 M + cross-attention 3,2 M + decoder 28,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no declara una ventana máxima; el decoder genera con `max_new_tokens` configurable, 64 en el ejemplo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la evaluación se hizo en fp32 y bf16) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 (pesos, código y tokenizador) |
| Formato de pesos | safetensors (`model.safetensors`), con código PyTorch propio (`modeling_encdec.py`, `tokenization_encdec.py`) |

Detalles internos adicionales de la arquitectura, según la model card:

| Componente | Configuracion |
|---|---|
| Encoder (lectura) | 3 capas, hidden 256, 4 cabezas, SwiGLU 768, RoPE + QK-Norm |
| Decoder (salida y contexto) | 6 capas, hidden 512, 8 cabezas (GQA kv=4), SwiGLU 2048, RoPE |
| Cross-attention | capas 2, 3 y 4 del decoder, kv=4, QK-Norm, puerta escalar `tanh(α)` |
| Vocabulario de salida y contexto | 12.288 tokens (Unigram + byte-fallback, embeddings compartidos) |
| Vocabulario de lectura | 640 tokens (a nivel de carácter) |

## Arquitectura y entrenamiento

El modelo separa explícitamente la entrada de lectura (katakana) del contexto y de la salida. El encoder procesa la lectura con atención bidireccional en 3 capas de 256 dimensiones ocultas, mientras que el decoder, compatible con Llama, gestiona tanto el contexto izquierdo como la generación de la salida en 6 capas de 512 dimensiones con GQA (4 cabezas KV). La innovación principal es la cross-attention limitada a las capas 2, 3 y 4 y desactivada en las posiciones del contexto: como la lectura no influye en el procesamiento del contexto, la caché KV del contexto se puede reutilizar aunque cambie la lectura, algo útil en un IME donde el usuario escribe el contexto una vez y prueba varias lecturas.

Los pesos del decoder y el tokenizador Unigram se inicializan a partir de una versión reducida de llm-jp/llm-jp-3-150m (Apache-2.0). El entrenamiento usa el dataset Miwa-Keita/zenz-v2.5-dataset más datos de lectura pseudo-generados a partir de texto japonés, con un total de aproximadamente 200 millones de ejemplos. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Conversión kana-kanji: recibe una lectura en katakana y produce texto mixto kanji-kana (por ejemplo, "ニホンゴ" → "日本語").
- Conversión con contexto izquierdo: acepta un contexto previo que desambigua la lectura (por ejemplo, "ノイライガクルヨウニ" con contexto "きっかけで、漫画の仕事" → "の依頼が来るように").
- Reutilización de caché KV del contexto: al desactivar la cross-attention en las posiciones del contexto, el contexto se procesa una vez y se reutiliza entre candidatos de lectura.
- Generación greedy determinista mediante `generate_greedy`, adecuada para un IME donde se prioriza la latencia y la reproducibilidad.
- Tokenizador Unigram con byte-fallback para la salida y el contexto, y tokenizador a nivel de carácter para la lectura.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un modelo de tarea única.

## Casos de uso

- Motor de conversión en IME de escritorio o móvil: el modelo convierte la lectura katakana que introduce el usuario en texto kanji-kana; su tamaño de 34,6 M permite ejecutarlo en el propio dispositivo y la reutilización de la caché KV del contexto acelera la conversión repetida de una misma frase.
- Teclados y apps de escritura japonesa en navegador o Electron: los pesos en safetensors y el código PyTorch propio se pueden cargar en un backend local o en un servicio ligero, sin depender de APIs de terceros, gracias a la licencia Apache-2.0.
- Corrección y normalización de texto japonés en pipelines de datos: dado un texto con lecturas o furigana, se puede usar el modelo para generar la forma kanji-kana correspondiente antes de indexar o entrenar otros modelos.
- Procesamiento por lotes en CPU para corpus: la evaluación en fp32 sobre CPU (AJIMEE-Bench) indica que el modelo es viable en servidores sin GPU para tareas de conversión masiva de lecturas a texto.
- Prototipado de funciones de autocompletado en editores: integrado en un plugin, el modelo puede sugerir la forma kanji de la lectura en curso usando el contexto izquierdo de la línea o del párrafo.
- Investigación en conversión kana-kanji: sirve como línea base ligera y de licencia permisiva para comparar arquitecturas encoder-decoder frente a modelos decoder-only en tareas de IME, con benchmarks públicos como AJIMEE-Bench y Anthy corpus.1.
- Sistemas de accesibilidad y entrada por voz: tras un reconocimiento de voz que devuelve katakana, el modelo puede convertir la transcripción a texto kanji-kana legible.

## Benchmarks y rendimiento

Resultados publicados en la model card con decodificación greedy:

| Benchmark | Condiciones | Acc@1 | CER |
|---|---|---:|---:|
| AJIMEE-Bench (200 casos) | CPU, fp32 | 0,775 (155/200) | 0,0227 (micro) / 0,0318 (macro) |
| AJIMEE-Bench, con contexto (100 casos) | CPU, fp32 | 0,770 (77/100) | no disponible |
| AJIMEE-Bench, sin contexto (100 casos) | CPU, fp32 | 0,780 (78/100) | no disponible |
| Anthy corpus.1 (1.745 casos) | bf16 | 0,708 | 0,0492 |

No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks ni resultados en MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 34,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 138 MB y en bf16 unos 69 MB, a lo que se suma la memoria de activaciones y caché KV, también reducida.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090 o similar queda muy sobredimensionada para este modelo.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida; la evaluación oficial se realizó en CPU en fp32, lo que confirma su viabilidad sin GPU.
- Opciones de despliegue: el modelo requiere código propio (`modeling_encdec.py` y `tokenization_encdec.py`) y no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo Llama estándar ni se publican pesos GGUF. El despliegue previsto es PyTorch con `safetensors.torch.load_file` y `huggingface_hub.snapshot_download`.
- Latencia y throughput: no se publican cifras de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kanakanji-encdec-35m | 34,6 M | no disponible | Conversión kana-kanji (encoder-decoder) | Apache-2.0 | Hugging Face, PyTorch |
| llm-jp/llm-jp-3-150m (modelo base) | 150 M (aproximado según nombre) | no disponible | Modelo de lenguaje general japonés | Apache-2.0 | Hugging Face |
| zenz-v2.5 (origen del dataset) | no disponible | no disponible | Conversión kana-kanji | no disponible | no disponible |

La model card no incluye comparaciones de rendimiento frente a otros conversores kana-kanji, por lo que no se dispone de datos de benchmarks comparativos. El modelo base llm-jp-3-150m es la referencia arquitectónica y de inicialización, pero no es un conversor especializado; zenz-v2.5 aparece solo como origen de los datos de entrenamiento y no se detallan sus especificaciones en la información disponible.

## Limitaciones y advertencias

- La entrada de lectura debe estar en katakana; si se pasa hiragana, la conversión no es correcta.
- La precisión disminuye con entradas que contienen muchos números y símbolos, y con frases extremadamente largas.
- Modelo de tarea única: no sirve para generación de texto general, razonamiento, código ni diálogo; su pipeline declarado es text-generation, pero su uso previsto es la conversión kana-kanji.
- Solo soporta japonés; no hay capacidades multilingües.
- Riesgo de alucinación en el sentido de producir lecturas kanji plausibles pero incorrectas, especialmente en nombres propios, términos técnicos y contextos ambiguos; el Acc@1 de 0,775 en AJIMEE-Bench implica que aproximadamente uno de cada cuatro casos no se resuelve correctamente en el primer candidato.
- La licencia del modelo, el código y el tokenizador es Apache-2.0, pero los datos de entrenamiento incluyen Miwa-Keita/zenz-v2.5-dataset con licencias CC-BY-SA 4.0 / ODC-BY; conviene revisar las obligaciones de atribución si se redistribuyen derivados del entrenamiento.
- No se publican datos sobre sesgos demográficos o lingüísticos, número de tokens de entrenamiento ni proceso de alineación (RLHF/DPO); estos aspectos figuran como no disponibles.
- No hay pesos GGUF ni integración con runtimes de inferencia estándar, lo que añade trabajo de integración para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuuki14202028/kanakanji-encdec-35m
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3-150m
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Benchmark AJIMEE-Bench: https://github.com/azooKey/AJIMEE-Bench
- Anthy (corpus de evaluación): https://github.com/netsphere-labs/anthy
- Código del modelo: `modeling_encdec.py` y `tokenization_encdec.py` incluidos en el repositorio de Hugging Face
