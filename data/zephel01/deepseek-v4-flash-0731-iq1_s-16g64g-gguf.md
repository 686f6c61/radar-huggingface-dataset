# zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF

## Resumen

Esta ficha describe una cuantización GGUF extrema del modelo DeepSeek-V4-Flash-0731 (MIT), publicada por el usuario zephel01 bajo el identificador `DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF`. No es un modelo nuevo, sino un empaquetado de 61,7 GB pensado para ejecutar un modelo MoE de 284.334.567.511 parámetros totales en un PC con una GPU de 16 GB de VRAM y 64 GB de RAM. La build conserva los 256 expertos enrutados de cada capa, sin poda, y recurre a una mezcla de cuantizaciones IQ1_S (64% de los bytes) e IQ1_M (36%) para los expertos, con una media de 1,62 bits por peso.

El problema que resuelve es de encaje en memoria: la cuantización de referencia de unsloth (UD-Q2_K_XL, 96,8 GB) no cabe en ese perfil de hardware y obliga a paginar desde SSD, mientras que esta build sí cabe. El precio es una pérdida de calidad medible: KL de 0,407 frente a 0,186 de la referencia, y un 73,7% de coincidencia en el token superior. El autor la marca explícitamente como BETA y advierte de que las mediciones se hicieron en una RTX 5090 limitada por software a 16 GB de VRAM, no en una tarjeta real de 16 GB.

La relevancia es acotada pero clara para quien quiera ejecutar un MoE de gran tamaño en hardware de consumo: demuestra que con LDLQ, imatrix propia y reempaquetado selectivo de atención se puede bajar un modelo de 284B a un régimen de 1,6 bits por peso manteniendo un comportamiento aceptable en pruebas de uso real (10 de 11 comprobaciones superadas). No hay datos publicados de arquitectura, contexto ni entrenamiento del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles de la arquitectura base no disponibles |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor usan prompts de 4K, 16K y needle de 8K-31K) |
| Tipos de cuantizacion | GGUF mixta: expertos IQ1_S (64% de bytes) e IQ1_M (36%); atención `attn_q_b`, `attn_output_a`, `attn_output_b` en Q5_K; resto heredado de UD-Q2_K_XL; media de 1,62 bits por peso |
| Idiomas soportados | no disponible en la model card; el autor incluye pruebas en inglés y japonés y advierte de respuestas en chino ante prompts en japonés |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 61,7 GB; `SHA256SUMS` incluido) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 284.334.567.511 parámetros totales, según los datos de safetensors del repositorio. La información disponible no detalla el número de capas, la dimensión oculta, el número de expertos activos por token ni el proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO). Lo que sí se documenta es el proceso de cuantización, que constituye la innovación técnica de esta ficha.

Los 256 expertos enrutados de cada capa se recuantizaron con LDLQ a partir de la build UD-Q8_K_XL de unsloth (expertos originales en MXFP4), usando un volcado de Hessiano generado con respuestas de chat del propio V4 (241 prompts, 104 en japonés) más texto general, y una imatrix propia. Las matrices `gate`/`up` quedaron en IQ1_S y `down` en IQ1_M. Las matrices de atención `attn_q_b`, `attn_output_a` y `attn_output_b` se subieron a Q5_K; el resto de tensores conserva los bytes de UD-Q2_K_XL, y el primer shard (solo metadatos, 5 MB) es el archivo de unsloth sin modificar. El autor menciona además un drafter DSpark (~6,5 GB de VRAM) que no recomienda en tarjetas de 16 GB y que se desactiva con `./setup-deepseek.sh --no-dspark`.

## Capacidades

- Generación de texto conversacional multi-turno: el autor valida una conversación de 11 turnos en su suite de pruebas.
- Razonamiento y respuesta a preguntas con contexto largo: prueba de needle superada en el rango de 8K a 31K tokens.
- Generación de código: 5 de 5 tareas de código con tests superadas en la validación del autor.
- Tool calling / function calling: una de las comprobaciones de la suite `--check` es explícitamente una llamada a herramienta, superada.
- Capacidad multilingüe limitada y problemática: responde en japonés en 9 de 10 casos, pero puede contestar en chino a preguntas en japonés (comportamiento presente también en los pesos originales).
- No hay evidencia en la información disponible de soporte de visión, audio, modo thinking explícito ni agentes multi-paso más allá del tool calling citado.

## Casos de uso

- Ejecución local de un MoE de 284B en un PC de consumo: el caso de uso central. Con una GPU de 16 GB (RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT) y 64 GB de RAM, el modelo cabe sin paginar desde SSD, lo que evita el cuello de botella de disco que lastra a la build de 96,8 GB.
- Asistente de código en local con tests: las 5 tareas de código con tests pasaron en la validación del autor, lo que permite usar el modelo como generador de parches verificables en un pipeline local sin enviar código a la nube.
- Automatización con tool calling: la llamada a herramienta superada en la suite permite integrarlo en flujos de agente sencillos (consulta de APIs, ejecución de comandos) siempre que se validen las salidas.
- Procesamiento de documentos largos en local: con prompts de 16K tokens medidos a 89,5 tok/s, es viable resumir o extraer información de documentos de decenas de miles de tokens en hardware de consumo, aceptando la pérdida de calidad de la cuantización.
- Atención al cliente o chat multi-turno en japonés con salvaguardas: requiere fijar en el system prompt "日本語で答えてください。" (responder en japonés), ya que sin esa instrucción el modelo deriva al chino con frecuencia; con ella, el autor reporta 1 de 24 derivas en la build L97.
- Laboratorio de cuantización e investigación: el repositorio documenta el método (LDLQ, Hessiano propio, imatrix, reempaquetado selectivo) y el motor Abyss, lo que lo convierte en una referencia reproducible para estudiar el límite práctico de compresión de MoE grandes.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (no del modelo base). KL calculada contra UD-Q8_K_XL de unsloth con 12 secuencias de 1.024 tokens (8 de texto inglés, 1 de código, 3 de japonés), motor Abyss.

| Metrica | L62 (esta build) | unsloth UD-Q2_K_XL (referencia) |
|---|---|---|
| Tamano | 61,7 GB | 96,8 GB |
| KL (12 secuencias) | 0,407 | 0,186 |
| KL en japones (3 secuencias) | 0,435 | 0,219 |
| Coincidencia en token superior | 73,7% | 81,5% |
| Velocidad, prompt 4K (16G64G) | 84,5 tok/s | 21,3 tok/s |
| Velocidad, prompt 16K (16G64G) | 89,5 tok/s | 19,6 tok/s |
| Suite `--check` de Abyss | 10 de 11 | 11 de 11 |

Las velocidades se midieron en una RTX 5090 limitada por software a 16 GB de VRAM y con un reparto de 40 GB de RAM bajo un límite de 58 GB, sobre un equipo con Ryzen AI Max+ 395 y memoria LPDDR5X. El propio autor advierte que una tarjeta real de 16 GB tiene menos ancho de banda y que la RAM LPDDR5X de ese equipo es aproximadamente 3 veces más rápida que un DDR5 de sobremesa habitual, por lo que las cifras reales serán inferiores. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: 16 GB es el objetivo de diseño; el autor indica que una GPU de 24 GB más 64 GB de RAM también encaja "con margen de sobra".
- RAM: 64 GB en el perfil objetivo; en las pruebas se usó un reparto de 40 GB de RAM bajo un límite de 58 GB.
- GPU objetivo citadas: RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT. No se ha medido en ninguna de ellas de forma nativa.
- Almacenamiento: 61,7 GB de pesos en 3 shards más el espacio del pack generado por `iq_pack.py`.
- Cabe en GPU de consumo: sí, en el perfil 16 GB VRAM + 64 GB RAM, que es precisamente su razón de ser.
- Despliegue: motor Abyss v1.3.120 o superior (requiere `setup-deepseek.sh --no-dspark` y `tools/iq_pack.py --compat-bf16`). llama.cpp no está verificado según el autor. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 84,5 tok/s con prompt de 4K y 89,5 tok/s con prompt de 16K, generando 512 tokens a temperatura 0, mediana de 3 ejecuciones, en el hardware de prueba descrito. En un PC de 16 GB convencional se esperan cifras notablemente menores.
- El drafter DSpark (~6,5 GB de VRAM) no se recomienda en tarjetas de 16 GB y no se midió a este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Calidad (KL) | Licencia | Encaje 16 GB + 64 GB |
|---|---|---|---|---|---|---|
| Esta build (L62, IQ1_S/IQ1_M) | 284,3B totales | 61,7 GB | no disponible | 0,407 | MIT | Si |
| zephel01 32G64G (IQ2_XXS) | 284,3B totales | 72,0 GB | no disponible | no disponible | MIT | No (requiere 32 GB VRAM) |
| zephel01 32G96G (IQ2_M) | 284,3B totales | 96,8 GB | no disponible | no disponible | MIT | No (requiere 32 GB VRAM y 96 GB RAM) |
| unsloth UD-Q2_K_XL | 284,3B totales | 96,8 GB | no disponible | 0,186 | MIT (heredada) | No, pagina desde SSD |

La comparación relevante es interna a la familia de cuantizaciones del mismo modelo base: a mayor tamaño, mejor KL y mayor velocidad sostenida, pero solo las builds de 16G64G y 32G64G caben en perfiles de consumo. No se dispone de datos de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Calidad degradada de forma medible: KL de 0,407 frente a 0,186 de la referencia, y 26,3% de discrepancia en el token superior. Es una cuantización de 1,62 bits por peso, en el límite práctico de compresión.
- Estado BETA: medida en una sola máquina (RTX 5090 limitada por software), no en una GPU real de 16 GB. El autor advierte que el archivo puede sustituirse por una build mejor y que entonces cambiará el nombre de la carpeta.
- Deriva de idioma: el modelo responde en chino a preguntas en japonés con una frecuencia no trivial (6 de 24 respuestas en los pesos originales; 11 de 24 en la build L97). Mitigable con instrucción explícita en el system prompt, que redujo la deriva a 1 de 24 en L97.
- Un fallo en la suite de validación: una explicación solicitada en japonés se respondió en chino. El autor lo documenta como la única comprobación no superada de 11.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor reporta "0 hechos erróneos" en 10 respuestas en japonés, una muestra demasiado pequeña para extraer conclusiones.
- Compatibilidad de motores: solo verificada en Abyss; llama.cpp no se ha comprobado. Esto limita la portabilidad frente a GGUFs convencionales.
- Metadatos inconsistentes: el primer shard es el archivo de unsloth sin modificar, por lo que su campo `general.quantized_by` sigue indicando Unsloth.
- Licencia MIT en el modelo base y en la cuantización, lo que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- Sin datos publicados de sesgos, composición del dataset de entrenamiento ni evaluación de seguridad del modelo base en la información disponible.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Build hermana 32G96G (IQ2_M, 96,8 GB): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Build hermana 32G64G (IQ2_XXS, 72,0 GB): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Build para DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Build 16G64G (variante): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-16G64G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Formulario de reporte de rendimiento: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+16G64G+L62+on+YOUR_GPU
- Incidencias de Abyss: https://github.com/zephel01/Abyss/issues
- GGUFs de origen (unsloth): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731
