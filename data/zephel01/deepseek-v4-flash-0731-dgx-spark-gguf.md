# zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF

## Resumen

DeepSeek-V4-Flash-0731-DGX-Spark-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731 (MIT) publicada por el usuario zephel01, pensada para ejecutarse íntegramente en una única NVIDIA DGX Spark con 128 GB de memoria unificada (GB10). El archivo ocupa 96,8 GB repartido en tres shards y conserva los 256 expertos del modelo original sin poda, con una mezcla de tipos de cuantización (IQ2_XS 41%, IQ3_XXS 39%, IQ2_S 18%, MXFP4 2% por bytes) que promedia 2,64 bits por peso, aproximadamente equivalente a un IQ2_M.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 284.334.567.511 parámetros totales según los safetensors del repositorio original. La cuantización está orientada al motor propietario Abyss del mismo autor, que ofrece decodificación especulativa mediante un drafter DSpark opcional, y declara compatibilidad con endpoints. El repositorio se publica como BETA y, en el momento de la ficha, no se ha ejecutado todavía en una DGX Spark real: las cifras de velocidad disponibles proceden de una RTX 5090 con 96 GB de RAM y de un Spark alquilado con el GGUF de unsloth de tamaño equivalente.

Su relevancia es doble: por un lado demuestra que un MoE de ~284B puede caber en 128 GB de memoria unificada manteniendo todos los expertos; por otro, publica métricas de divergencia KL frente a una cuantización de referencia de mayor precisión, lo que permite evaluar la pérdida de calidad de forma cuantitativa. La licencia MIT del modelo base facilita su uso comercial, aunque la herramienta de inferencia recomendada (Abyss) es un proyecto independiente que conviene revisar por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos, 256 expertos, segun model card) |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de ejemplo del autor (`--max-context 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Mezcla: IQ2_XS 41%, IQ3_XXS 39%, IQ2_S 18%, MXFP4 2% (por bytes); 2,64 bits/peso de media (~IQ2_M) |
| Idiomas soportados | Ingles (en) y japones (ja) declarados; el modelo base puede tener mas, no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 96,8 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de mezcla de expertos con 284.334.567.511 parametros totales y 256 expertos por capa segun la model card de la cuantizacion. No se dispone de informacion sobre el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento; estos datos no aparecen en la informacion proporcionada.

La innovacion tecnica de esta publicacion no reside en el modelo sino en el proceso de cuantizacion: se ha generado una mezcla heterogenea de tipos (IQ2_XS, IQ3_XXS, IQ2_S y MXFP4) usando matrices de importancia (imatrix) y la herramienta `iq_pack.py` del motor Abyss, conservando la totalidad de los expertos. El autor reporta una divergencia KL de 0,150 frente a la cuantizacion de referencia UD-Q8_K_XL de unsloth (original con expertos MXFP4), medida sobre 12 secuencias de 1.024 tokens (8 en ingles, 1 de codigo, 3 en japones), frente a 0,186 del UD-Q2_K_XL de unsloth del mismo tamano. En japones la diferencia es mayor: 0,145 frente a 0,219. La coincidencia del token superior es del 84,1% frente al 81,5% de la referencia. Ademas, el motor Abyss soporta decodificacion especulativa con un drafter DSpark externo (GGUF de 6,5 GB, Q2K/Q8 con Markov Q8) que en el Spark alquilado alcanzo una tasa de aceptacion del 78%.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y respuesta a instrucciones heredados del modelo base DeepSeek-V4-Flash-0731; el alcance exacto (codigo, matematicas, tool calling) no se detalla en la informacion disponible.
- Capacidad multilingue limitada a ingles y japones en la declaracion del repositorio; el autor advierte que el modelo tiende a responder en chino a preguntas en japones (11 de 24 respuestas en la cuantizacion L97, frente a 6 de 24 en los pesos originales), y que un system prompt del tipo "日本語で答えてください。" reduce el fallo a 1 de 24.
- Compatibilidad con endpoints HTTP mediante el servidor `serve/server.py` del motor Abyss, con API estilo OpenAI.
- Decodificacion especulativa opcional mediante el drafter DSpark para acelerar la generacion.
- No se declaran capacidades de vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamano en una unica DGX Spark: el archivo de 96,8 GB cabe completo en los 128 GB de memoria unificada del GB10, de modo que durante la generacion no se leen pesos desde el SSD y se evita el cuello de botella de ancho de banda de disco.
- Asistente conversacional en japones con contexto largo: la ventana configurada de 65.536 tokens permite mantener historiales extensos; conviene fijar el system prompt en japones para mitigar la deriva al chino documentada por el autor.
- Prototipado y evaluacion de cuantizaciones: las metricas de KL publicadas frente a UD-Q8_K_XL permiten comparar la perdida de calidad de esta mezcla con otras alternativas del mismo tamano antes de comprometerse con un despliegue.
- Despliegue en estaciones de trabajo con GPU de 32 GB y 96 GB de RAM: el autor publica el mismo conjunto de archivos en el repositorio `DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF`, con el modelo repartido entre VRAM y RAM del sistema.
- Aceleracion mediante decodificacion especulativa: en un Spark, donde todo el modelo reside en memoria unificada, el drafter DSpark de 6,5 GB no compite por espacio y el autor recomienda usarlo; en el Spark alquilado con el GGUF de unsloth se midieron 26,0 tok/s con drafter frente a 21,0 tok/s sin el.
- Investigacion sobre cuantizacion de MoE con imatrix: el repositorio documenta la receta (`iq_pack.py --compat-bf16`), los tipos por experto y las comprobaciones SHA256, lo que sirve como referencia reproducible para experimentos similares.
- Servicio interno con API compatible con OpenAI: el servidor de Abyss expone el modelo en un puerto configurable (8082 en el ejemplo) con parametros de muestreo (temperatura 1,0, top_p 0,95), adecuado para integrarlo en herramientas internas.

## Benchmarks y rendimiento

Calidad medida por el autor como divergencia KL frente a unsloth UD-Q8_K_XL (expertos MXFP4 originales), 12 secuencias de 1.024 tokens (8 ingles, 1 codigo, 3 japones), motor Abyss:

| Modelo | Descarga | Expertos | KL (12 seqs) | KL japones (3) | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| L97 (este repo) | 96,8 GB | todos (sin poda) | 0,150 | 0,145 | 84,1% |
| unsloth UD-Q2_K_XL (referencia) | 96,8 GB | todos | 0,186 | 0,219 | 81,5% |

Velocidad de decodificacion:

| Configuracion | Decode | Equipo |
|---|---:|---|
| Este archivo (L97), sin drafter | 69,1 tok/s (prompt de 4K) | RTX 5090 32 GB + PC con 96 GB RAM, Abyss v1.3.120 |
| unsloth UD-Q2_K_XL, sin drafter | 21,0 tok/s | DGX Spark alquilado, Abyss v1.3.114 |
| unsloth UD-Q2_K_XL, con drafter DSpark (78% aceptacion) | 22,8 tok/s | DGX Spark alquilado, Abyss v1.3.114 |
| unsloth UD-Q2_K_XL, con drafter DSpark (prompt 4K, mediana de 3 x 512 tokens) | 26,0 tok/s | DGX Spark alquilado, Abyss v1.3.119 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica que este archivo aun no se ha ejecutado en una DGX Spark y que las cifras de Spark corresponden al GGUF de unsloth de tamano equivalente.

## Requisitos de hardware

- VRAM/memoria: 96,8 GB de pesos; en la DGX Spark caben en los 128 GB de memoria unificada dejando margen para contexto (el autor configura 65.536 tokens). En un PC con GPU de 32 GB y 96 GB de RAM, el mismo conjunto de archivos se reparte entre VRAM y RAM del sistema.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) es el objetivo declarado. Como referencia, el autor midio 69,1 tok/s en una RTX 5090 de 32 GB con 96 GB de RAM de sistema.
- GPU de consumo: cabe en una RTX 5090 (32 GB) solo si se combina con 96 GB de RAM; para equipos mas modestos el autor publica variantes mas pequenas: IQ1_S (61,7 GB, para 16 GB GPU + 64 GB RAM), IQ2_XXS (72,0 GB, para 32 GB GPU + 64 GB RAM) e IQ2_M (96,8 GB, para 32 GB GPU + 96 GB RAM).
- Opciones de despliegue: motor Abyss (recomendado y unico verificado por el autor, con backend CUDA, compilacion para aarch64 y sm_121 con CUDA 12.9 o superior en el Spark). llama.cpp no esta comprobado con este archivo segun la model card. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 69,1 tok/s en RTX 5090 + 96 GB RAM sin drafter; 21,0-26,0 tok/s en DGX Spark alquilado con el GGUF de unsloth del mismo tamano, con y sin drafter DSpark. Para este archivo concreto en Spark no hay medicion publicada.
- Almacenamiento: 96,8 GB para los tres shards, mas 6,5 GB del drafter DSpark si se usa, mas el espacio del pack generado por `iq_pack.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de descarga | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DeepSeek-V4-Flash-0731-DGX-Spark-GGUF (L97) | 284,3B totales | 65.536 configurado | 96,8 GB | 0,150 (0,145 ja) | MIT | Hugging Face, BETA |
| unsloth UD-Q2_K_XL de DeepSeek-V4-Flash-0731 | 284,3B totales | no disponible | 96,8 GB | 0,186 (0,219 ja) | MIT (modelo base) | Hugging Face |
| DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF (mismo autor) | 284,3B totales | 65.536 configurado | 96,8 GB | identico (mismos archivos, carpeta L97) | MIT | Hugging Face |
| DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF (mismo autor) | 284,3B totales | no disponible | 61,7 GB | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otros desarrolladores de la misma categoria; la comparacion se limita a las variantes de cuantizacion del mismo modelo base publicadas por el autor y por unsloth.

## Limitaciones y advertencias

- Estado BETA: el autor indica explicitamente que el archivo no se ha ejecutado en una DGX Spark y que las cifras de velocidad en Spark corresponden a un GGUF equivalente de unsloth, no a este archivo.
- Deriva de idioma: el modelo tiende a responder en chino a preguntas en japones. En la evaluacion del autor ocurrio en 11 de 24 respuestas con L97, frente a 6 de 24 con los pesos originales; se mitiga con un system prompt que exija responder en japones, pero no se elimina por completo.
- Perdida de calidad por cuantizacion: 2,64 bits por peso de media implica una divergencia KL de 0,150 frente a la referencia de alta precision; el 15,9% de los tokens superiores no coincide con la referencia, lo que puede afectar a tareas sensibles a la precision (codigo, matematicas, extraccion de datos).
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion en la informacion disponible; al tratarse de un modelo conversacional de gran tamano, el riesgo existe y no esta cuantificado.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Compatibilidad de herramientas: solo el motor Abyss esta verificado; llama.cpp no se ha comprobado con este archivo, lo que limita la portabilidad a otros stacks de inferencia habituales.
- Requisitos de compilacion: en DGX Spark exige compilar para aarch64 con sm_121 y CUDA 12.9 o superior, ademas de generar un pack con `iq_pack.py`, lo que anade pasos operativos frente a un GGUF convencional.
- Licencia: el modelo base y esta cuantizacion son MIT, lo que permite uso comercial; sin embargo, el motor Abyss es un proyecto separado cuyo licenciamiento y garantias deben revisarse antes de usarlo en produccion.
- Idiomas: solo se declaran ingles y japones; el rendimiento en castellano no esta documentado y no deberia asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Variante para PC con 32 GB de GPU y 96 GB de RAM: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante para PC con 32 GB de GPU y 64 GB de RAM: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante para PC con 16 GB de GPU y 64 GB de RAM: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Drafter DSpark: https://huggingface.co/bleysg/DeepSeek-V4-Flash-DSpark-drafter-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+DGX-Spark+L97+on+GB10
