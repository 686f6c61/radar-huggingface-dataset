# yuuki14202028/kanakanji-edge-33m

## Resumen

kanakanji-edge-33m es un modelo de conversión kana-kanji (かな漢字変換) para japonés desarrollado por el usuario yuuki14202028 y publicado en Hugging Face bajo licencia Apache-2.0. Su tarea es convertir una lectura en katakana, acompañada opcionalmente de un contexto izquierdo, en texto mixto de kanji y kana: exactamente la operación que ejecuta un IME japonés cuando el usuario teclea una lectura fonética y el sistema decide qué caracteres mostrar. Con 33.490.944 parámetros (30,4 M sin contar los embeddings) y una arquitectura LlamaForCausalLM estándar de 8 capas y d_model 512, está diseñado explícitamente para ejecutarse en el dispositivo, con el objetivo de caber en un presupuesto de 20 MB mediante cuantización de 4 bits.

El modelo se entrena desde cero, no es un fine-tuning de otro modelo, sobre el dataset zenz-v2.5-dataset (189 millones de ejemplos) durante 6 épocas, y reutiliza únicamente el vocabulario byte-level BPE del tokenizador ku-nlp/gpt2-small-japanese-char de la Universidad de Kioto. Su relevancia actual radica en la relación entre tamaño y coste: ofrece conversión neuronal kana-kanji sin GPU ni conexión de red, un problema que los IME clásicos resuelven con diccionarios y reglas y que los modelos neuronales de conversión suelen abordar en servidor.

La ventana de contexto de entrenamiento es de solo 192 tokens y el único idioma soportado es el japonés, por lo que se trata de un componente especializado y no de un modelo de propósito general. El repositorio no registraba descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForCausalLM` estándar (sin código personalizado); 8 capas, d_model 512 |
| Parámetros totales | 33.490.944 (33,5 M; 30,4 M sin embeddings), embeddings atados (*tied*) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 192 tokens (máximo empleado en entrenamiento) |
| Tipos de cuantización | fp32 (safetensors), f16 (GGUF), Q8_0 (GGUF); degradación acusada por debajo de 5 bits según el autor; el objetivo de diseño de 4 bits (~20 MB) no se publica en el repositorio |
| Idiomas soportados | Japonés (ja) |
| Licencia | Pesos: Apache-2.0. Tokenizador: CC-BY-SA 4.0 (ku-nlp/gpt2-small-japanese-char). Datos de entrenamiento: CC-BY-SA 4.0 (Wikipedia) y ODC-BY (llm-jp-corpus-v3) |
| Formato de pesos | safetensors (fp32) y GGUF (f16, Q8_0) |
| Atención | 8 cabeceras, GQA con 2 cabeceras KV, head_dim 64, RoPE con theta 10000 |
| FFN | SwiGLU con dimensión intermedia 2048 |
| Normalización | RMSNorm sin sesgo (*bias*) |
| Vocabulario | 6.003 tokens (byte-level BPE a nivel de carácter) más 3 tokens de control añadidos (ids 6000-6002) |
| Optimizador | ScheduleFree (AdamC con promedio iterativo de pesos) |
| Datos de entrenamiento | Miwa-Keita/zenz-v2.5-dataset, 189 millones de ejemplos, 6 épocas |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de tipo Llama, sin modificaciones que requieran código personalizado: 8 capas, d_model 512, 8 cabeceras de atención con GQA de 2 cabeceras KV (head_dim 64), RoPE con theta 10000, FFN SwiGLU de dimensión 2048 y RMSNorm sin sesgo. El vocabulario, de 6.003 entradas a nivel de carácter con embeddings atados, se completa con tres tokens de control ubicados en el área de uso privado de Unicode: CONTEXT (U+EE02, id 6000), INPUT_START (U+EE00, id 6001) y OUTPUT_START (U+EE01, id 6002). El formato de prompt es `\uEE02<contexto_izquierdo>\uEE00<katakana>\uEE01`, y la salida es el texto convertido seguido de `</s>`.

El entrenamiento se realizó desde cero sobre zenz-v2.5-dataset, con 189 millones de ejemplos y 6 épocas, usando el optimizador ScheduleFree (AdamC con promedio iterativo de los pesos). No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por preferencias; el modelo se usa con decodificación voraz (`do_sample=False`, o `temperature 0, top_k 1` en llama.cpp). La innovación técnica destacable no está en la arquitectura, sino en la escala: un modelo de 33,5 M de parámetros capaz de realizar conversión kana-kanji neuronal sobre un presupuesto de memoria de decenas de megabytes. El código de entrenamiento se publica en el repositorio del autor.

## Capacidades

- Conversión kana-kanji: recibe una lectura en katakana y devuelve texto mixto de kanji y kana, con soporte de contexto izquierdo para desambiguar la elección de kanji.
- Uso con contexto vacío: el token CONTEXT debe colocarse siempre, aunque no haya contexto previo.
- Ejecución determinista en dispositivo: el modelo está pensado para decodificación voraz y para correr en el propio terminal del usuario.
- Integración con llama.cpp mediante GGUF, incluyendo los tres tokens de control como tokens CONTROL.
- Integración con `transformers` y compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Capacidades multilingües: no disponibles; solo japonés.
- *Tool calling* o *function calling*: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo *thinking*, visión o audio: no soportados.

## Casos de uso

- Motor de entrada (IME) en aplicaciones móviles: el modelo convierte lecturas en katakana a texto kanji-kana en el propio dispositivo, con un presupuesto de 20 MB en cuantización de 4 bits, lo que evita enviar las pulsaciones del usuario a un servidor y permite funcionar sin conexión.
- Teclados y editores web mediante WebAssembly: al ser un modelo de 33,5 M de parámetros con pesos de 36 MB en Q8_0, puede ejecutarse en el navegador con una compilación de llama.cpp, manteniendo la conversión local y con privacidad total.
- Corrección de transcripciones ASR en japonés: los sistemas de reconocimiento de voz suelen producir lecturas fonéticas en katakana; el modelo las transforma en texto mixto usando el contexto izquierdo de la frase, lo que mejora la legibilidad de subtítulos y actas.
- Preprocesado en pipelines de PLN: normalización de lecturas katakana a texto kanji-kana antes de tareas posteriores como síntesis de voz, búsqueda o indexación, sin depender de un diccionario estático.
- Accesibilidad: entrada por voz o por teclado fonético para usuarios con dificultades de escritura, donde el sistema recibe la lectura y devuelve el texto con la ortografía kanji correcta.
- Dispositivos embebidos y *edge computing*: al caber en RAM muy limitada (36 MB en Q8_0) y no requerir GPU, es viable en Raspberry Pi, terminales de punto de venta o equipos industriales con CPU modesta.
- Investigación y docencia: entrenamiento desde cero reproducible (dataset y código publicados) para estudiar conversión kana-kanji con un coste de cómputo mínimo, así como punto de partida para *fine-tuning* o destilación hacia modelos mayores.
- Generación de datos sintéticos: producción de pares lectura-kanji para preentrenar o aumentar modelos de conversión de mayor tamaño, teniendo en cuenta la tasa de error del propio modelo.

## Benchmarks y rendimiento

| Benchmark | Muestras | Decodificación | Acc@1 | CER |
|---|---|---:|---:|---:|
| AJIMEE-Bench | 200 | voraz (*greedy*) | 0,805 | 0,0255 |
| Anthy corpus.1 | 1.745 | no disponible | 0,705 | 0,0519 |
| Held-out interno (entropía cruzada, fp32) | 5.000 | no aplica | CE 0,0537 | no aplica |

Comparación entre formatos de pesos sobre AJIMEE-Bench (200 muestras, misma entrada que en torch):

| Archivo | Tamaño | Acc@1 / CER | Muestras con salida distinta a torch |
|---|---:|---:|---:|
| `model.safetensors` (fp32) | 134 MB | 0,805 / 0,0255 | referencia |
| `kanakanji-edge-33m-f16.gguf` | 67 MB | 0,805 / 0,0255 | 0 / 200 |
| `kanakanji-edge-33m-Q8_0.gguf` | 36 MB | 0,805 / 0,0255 | 2 / 200 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos de conversión kana-kanji.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del número de parámetros y de los tamaños de archivo publicados): por debajo de 1 GB en fp32 (134 MB de pesos), unos 67 MB en f16 y 36 MB en Q8_0, más el *overhead* del runtime.
- Caché KV: aproximadamente 4 KB por token en fp16 (8 capas × 2 cabeceras KV × 64 dimensiones × 2 tensores × 2 bytes), es decir, unos 0,75 MB para los 192 tokens de contexto máximo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU de consumo con más de 1 GB de memoria es suficiente; también es viable la inferencia en CPU, incluidos procesadores integrados.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (GTX 1650, RTX 3060, RTX 4090, etc.), y también en CPU y en el propio dispositivo móvil, que es el objetivo de diseño.
- Opciones de despliegue: `transformers` en PyTorch (safetensors fp32), llama.cpp con los GGUF f16 o Q8_0, y compatibilidad declarada con text-generation-inference y endpoints compatibles. Para Ollama o vLLM no se indica compatibilidad explícita en la información disponible, aunque el GGUF es directamente utilizable en Ollama.
- En llama.cpp es obligatorio tokenizar con `parse_special=true`; en caso contrario, cada carácter de control se divide en 3 bytes y la salida se corrompe.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no están disponibles en la información proporcionada; la tabla recoge únicamente lo que puede afirmarse con la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kanakanji-edge-33m | 33,5 M | 192 tokens | Apache-2.0 (pesos); CC-BY-SA 4.0 (tokenizador) | safetensors y GGUF en Hugging Face | Entrenado desde cero; conversión kana-kanji para IME en dispositivo |
| zenz-v2.5 (azooKey) | no disponible | no disponible | no disponible | no disponible | Familia de modelos cuyo dataset (Miwa-Keita/zenz-v2.5-dataset) se usó para entrenar este modelo; es la referencia más directa por tarea |
| Anthy | no disponible | no disponible | no disponible | no disponible | Sistema clásico de conversión kana-kanji basado en diccionario y reglas; su corpus de pruebas se usa como benchmark en esta ficha |
| Mozc / IME basados en diccionario | no disponible | no disponible | no disponible | no disponible | Alternativa no neuronal; el modelo card no ofrece comparación cuantitativa frente a ellos |

## Limitaciones y advertencias

- Entrada restringida a katakana: el modelo se entrenó con lecturas en katakana y el autor no garantiza el comportamiento con entrada en hiragana.
- Precisión limitada: Acc@1 de 0,805 en AJIMEE-Bench implica que aproximadamente una de cada cinco conversiones no coincide con la referencia; en Anthy corpus.1 la tasa baja hasta 0,705, con un CER de 0,0519.
- Números y símbolos: las entradas que los contienen reducen la precisión de forma notable.
- Contexto corto: el entrenamiento usó un máximo de 192 tokens; contextos más largos degradan la calidad de la conversión.
- Sensibilidad a la cuantización: por debajo de 5 bits la salida cambia de forma visible; el autor cifra la pérdida en Q5_K_M en torno a -0,04 de Acc@1 en AJIMEE-Bench. Los GGUF publicados (f16 y Q8_0) mantienen la precisión, pero el objetivo de 4 bits no está publicado en el repositorio.
- Riesgo de alucinación: al ser un modelo generativo, puede producir lecturas o kanji no pretendidos por el usuario, sin mecanismo de confianza ni de detección de errores.
- Alcance funcional: no es un modelo conversacional ni de instrucciones; no soporta *tool calling*, agentes ni razonamiento multi-paso. Solo realiza conversión kana-kanji.
- Idioma único: únicamente japonés; no hay soporte multilingüe.
- Licencia: los pesos son Apache-2.0, pero el tokenizador procede de ku-nlp/gpt2-small-japanese-char bajo CC-BY-SA 4.0, de modo que la redistribución de los archivos de tokenizador exige mantener la atribución a ku-nlp. El dataset de entrenamiento combina material con CC-BY-SA 4.0 y ODC-BY.
- Validación comunitaria escasa: el repositorio no registraba descargas ni valoraciones, no hay evaluación independiente publicada y la información se basa en la model card del propio autor.
- Formato de prompt frágil: depende de tres caracteres del área de uso privado de Unicode y de una configuración de tokenización concreta en llama.cpp (`parse_special=true`); una implementación incorrecta rompe la salida.
- Decodificación: se recomienda explícitamente la decodificación voraz; no hay datos publicados sobre el comportamiento con muestreo estocástico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuuki14202028/kanakanji-edge-33m
- Código de entrenamiento: https://github.com/yuuki14202028/gpt2-kanakanji
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Tokenizador de origen: https://huggingface.co/ku-nlp/gpt2-small-japanese-char
- Benchmark AJIMEE-Bench: https://github.com/azooKey/AJIMEE-Bench
- Corpus de Anthy: https://github.com/netsphere-labs/anthy
- Licencia CC-BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (tratan sobre la Bergiselschanze de Innsbruck) y no aportan enlaces relevantes.
