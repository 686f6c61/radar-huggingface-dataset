# xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf

## Resumen

Este repositorio, `xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf`, es una conversión no oficial a GGUF de llama.cpp del modelo Gemma 4 31B-it de Google DeepMind, en su variante entrenada con cuantización consciente del entrenamiento (QAT) y cuantizada a 4 bits. El autor, `xbill9`, no está afiliado a Google. Se trata de una redistribución de los pesos de Google en un formato de almacenamiento distinto, publicada bajo la misma licencia Apache 2.0.

El modelo tiene 30.697.345.596 parámetros (unos 30,7 mil millones) y el archivo GGUF ocupa 17.287.669.984 bytes (17,29 GB), frente a los 17.651.001.568 bytes (17,65 GB) del GGUF Q4_0 oficial de Google. La diferencia principal es que esta compilación reconstruye cada peso de 4 bits como el valor exacto que produjo el QAT de Google, incluido el tensor de embeddings de tokens (`token_embd`), que aquí es Q4_0 mientras que en el GGUF oficial es Q6_K.

El interés de esta ficha es doble: por un lado, sirve como ejemplo de reconstrucción exacta de un GGUF a partir de la fuente sin cuantizar; por otro, es una alternativa más compacta al GGUF oficial. Conviene señalar que, en la fecha de publicación (8 de octubre de 2026), el autor indica que el archivo fue construido y verificado en local, pero todavía no se ha cargado en llama.cpp, y que las mediciones de divergencia, velocidad y memoria solo se realizaron para la variante E4B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El inventario de tensores corresponde a un transformer decodificador con atención y FFN con compuertas (tensores `attn_q`, `attn_k`, `attn_v`, `attn_output`, `ffn_gate`, `ffn_up`, `ffn_down`) |
| Parametros totales | 30.697.345.596 (unos 30,7 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 en los pesos (incluido `token_embd`); F32 en normas y vectores de escala. El GGUF oficial de Google usa Q6_K para `token_embd` |
| Idiomas soportados | No disponible (la ficha no declara idiomas) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), archivo único de 17.287.669.984 bytes (17,29 GB) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna más allá del inventario de tensores del GGUF. Ese inventario corresponde a un transformer decodificador con atención y red feed-forward con compuertas. El recuento por tensor es el siguiente: `token_embd.weight` (1), `attn_k` (60), `attn_output` (60), `attn_q` (60), `attn_v` (50), `ffn_down` (60), `ffn_gate` (60) y `ffn_up` (60). Los tensores de atención `q`, `k` y `output` aparecen 60 veces, mientras que `attn_v` aparece 50, lo que sugiere algún tipo de compartición o asimetría en la proyección de valores en una parte de las capas; no se ofrece confirmación de este punto.

Sobre el entrenamiento, lo relevante es que el modelo original fue sometido por Google a un proceso de QAT y cuantizado a 4 bits. Esta compilación no reentrena ni recalibra: reconstruye cada bloque de pesos a partir de `google/gemma-4-31B-it-qat-q4_0-unquantized` (revisión `1e4d8be`), asumiendo el paso de cuantización que el propio QAT aprendió. Mientras que el GGUF de Google usa el paso estándar de llama.cpp (la magnitud máxima del bloque dividida por 8), este build recupera el paso entrenado de cada bloque (dividido por 8, 7, ... hasta 1, el que sitúe todos los valores en un nivel entero) y lo refina por mínimos cuadrados. La metadata (tokenizador, plantilla de chat, hiperparámetros y orden de tensores) se copia byte a byte del GGUF `gemma-4-31B_q4_0-it.gguf` de Google en la revisión `59dde24`.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso en diálogo; se incluye la plantilla de chat de Google sin modificar.
- Compatibilidad con endpoints: el repositorio está marcado como `endpoints_compatible`.
- Ejecución en llama.cpp: el formato GGUF permite inferencia local con la pila de llama.cpp.
- Modelo únicamente de texto: la visión no está incluida y requeriría el GGUF `mmproj` independiente de Google.
- Capacidades multilingües: no disponibles (la ficha no declara idiomas soportados).
- Tool calling, agentes, modo de razonamiento explícito, visión o audio: no disponibles en la información proporcionada y, en el caso de la visión, explícitamente excluidos.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 24 GB: al ocupar 17,29 GB en pesos, el modelo cabe completo en una RTX 4090 o RTX 3090, lo que permite ejecutar un modelo de 30,7 mil millones de parámetros sin conexión a servicios externos.
- Despliegue en servidores con A100 o H100: el tamaño reducido del archivo facilita servir varias instancias por GPU o mantener un lote amplio, siempre que la ventana de contexto se mantenga moderada.
- Sustitución del GGUF oficial cuando se busca el mayor ahorro de espacio posible: 363 MB menos que la versión de Google, con la misma licencia.
- Reproducción y auditoría de cuantizaciones: el repositorio documenta el proceso de reconstrucción (`gguf_exact.py`, informe `evidence/build_report.json`), lo que lo hace útil para estudiar cómo se reconstruye un GGUF a partir de la fuente QAT sin cuantizar.
- Prototipado de asistentes conversacionales: la plantilla de chat y la etiqueta `conversational` permiten montar un chatbot de texto con llama.cpp o llama-cpp-python.
- Comparación de calidad entre cuantizaciones: sirve para medir el efecto de usar `token_embd` en Q4_0 en lugar de Q6_K frente al GGUF oficial, aunque el autor todavía no ha publicado dicha comparación.
- Investigación sobre QAT: al conservar los pasos de bloque entrenados, es un material de partida para estudiar qué información se pierde al bajar de Q6_K a Q4_0 en los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la divergencia respecto a bf16, la velocidad y el consumo de memoria solo se midieron para la variante E4B, no para este modelo de 31B. El único dato cuantitativo de fidelidad es que, por tensor, entre el 96,69 % y el 96,84 % de los valores reconstruidos son bit-idénticos a la fuente QAT.

| Tensor | Cantidad | Tipo en Google | Valores bit-idénticos a la fuente |
|---|---:|---|---:|
| `token_embd.weight` | 1 | Q6_K | 96,82 % |
| `attn_k` | 60 | Q4_0 | 96,81 % |
| `attn_output` | 60 | Q4_0 | 96,69 % |
| `attn_q` | 60 | Q4_0 | 96,81 % |
| `attn_v` | 50 | Q4_0 | 96,84 % |
| `ffn_down` | 60 | Q4_0 | 96,84 % |
| `ffn_gate` | 60 | Q4_0 | 96,80 % |
| `ffn_up` | 60 | Q4_0 | 96,81 % |

## Requisitos de hardware

- VRAM estimada para los pesos: 17,29 GB (tamaño exacto del archivo GGUF). La cifra no incluye caché KV ni overhead del runtime, por lo que el consumo total será superior y dependerá de la ventana de contexto (no disponible). Como estimación orientativa, conviene reservar 19-21 GB para contextos moderados.
- GPU recomendadas: A100 (40 o 80 GB), H100, y en el ámbito de consumo RTX 4090, RTX 3090 o RTX 4090D (24 GB), donde el modelo cabe completo.
- Cabe en GPU de consumo de 24 GB. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriría offload parcial a CPU o reducción de contexto.
- Opciones de despliegue: llama.cpp y llama-cpp-python de forma nativa por el formato GGUF; también cargadores de GGUF como Ollama o LM Studio. vLLM dispone de soporte GGUF, aunque el autor no lo menciona ni lo ha probado.
- Latencia y throughput: no disponibles. El autor no ha cargado todavía el archivo en llama.cpp y no ha medido velocidad ni memoria para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamaño | `token_embd` | Licencia | Notas |
|---|---|---|---|---|---|
| `xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf` (este) | 30.697.345.596 | GGUF, 17.287.669.984 B | Q4_0 | Apache 2.0 | No oficial, no probado aún en llama.cpp |
| `google/gemma-4-31B-it-qat-q4_0-gguf` | No disponible | GGUF, 17.651.001.568 B | Q6_K | Apache 2.0 | Build oficial de Google |
| `google/gemma-4-31B-it-qat-q4_0-unquantized` | No disponible | Safetensors (fuente sin cuantizar) | No aplica | Apache 2.0 | Fuente de la reconstrucción, revisión `1e4d8be` |
| `xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf` | No disponible | GGUF | No disponible | Apache 2.0 | Misma metodología; única variante con mediciones publicadas |

No se dispone de datos de contexto, rendimiento o benchmarks para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo únicamente de texto. La visión reside en el GGUF `mmproj` independiente de Google, que no se incluye.
- No probado en llama.cpp. El autor indica que el archivo se construyó y verificó en local contra su fuente, pero todavía no se ha cargado en el runtime.
- Build no oficial. Los problemas deben reportarse al autor del repositorio, no a Google. No está respaldado ni afiliado a Google DeepMind.
- Fidelidad no total. Alrededor del 3,2 % de los valores reconstruidos no son bit-idénticos a la fuente QAT; las diferencias proceden del redondeo a fp16 de la escala de bloque.
- Sin benchmarks publicados. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto para esta variante.
- Idiomas no declarados. No se especifica la cobertura lingüística real del modelo.
- Riesgo de alucinación. No medido ni documentado en la información disponible.
- Validación comunitaria muy limitada. El repositorio registra 37 descargas y 0 likes en la fecha de la ficha.
- Licencia. Apache 2.0, con enlace a los términos de licencia de Gemma 4; los pesos y el entrenamiento son de Google DeepMind, y la redistribución debe respetar dicha licencia.

## Enlaces

- Repositorio HuggingFace de este build: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Fuente sin cuantizar (revisión `1e4d8be`): https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Variante E4B del mismo autor: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
