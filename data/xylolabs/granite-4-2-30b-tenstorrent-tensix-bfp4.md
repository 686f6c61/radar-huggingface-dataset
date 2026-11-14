# Xylolabs/granite-4.2-30b-Tenstorrent-Tensix-BFP4

## Resumen

Granite-4.2-30b-Tenstorrent-Tensix-BFP4 es una cuantización del modelo ibm-granite/granite-4.2-30b de IBM, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Granite 4.2 con 29.276.770.304 parámetros (aproximadamente 29,3 mil millones) y aplica cuantización de bloque en coma flotante (Block Floating Point, BFP4) mediante GPTQ a las capas lineales de atención y MLP, dejando en bf16 la cabeza LM, los embeddings y las normas.

La relevancia de esta ficha radica en que no es un modelo nuevo en sentido estricto, sino un artefacto de despliegue: empaqueta los pesos en el formato `ttnn.bfloat4_b` para que TT-NN los cargue sin transformación adicional, reduciendo el espacio en memoria del dispositivo a unos 17,65 GB para los pesos del modelo de lenguaje, frente a los 58,55 GB en bf16. Esto habilita ejecutar un modelo de 30B en hardware NPU de Tenstorrent con un presupuesto de memoria mucho más ajustado.

La licencia es Apache 2.0, heredada del modelo base, y cubre 12 idiomas declarados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino). El checkpoint se distribuye en formato safetensors y es compatible con la librería transformers, además de con el stack tt-metal/ttnn para su ejecución en Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.2; detalles internos de atención no disponibles en la información proporcionada) |
| Parametros totales | 29.276.770.304 (aproximadamente 29,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en capas lineales) con GPTQ; resto de tensores en bf16; media de 4,82 bits por peso |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado nativo para TT-NN (`bfloat4_b`) |

## Arquitectura y entrenamiento

El modelo base es ibm-granite/granite-4.2-30b, un transformer decoder-only de aproximadamente 29,3 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card de IBM y no se reproducen aquí. Lo que sí se especifica es que Granite emplea un multiplicador de atención de 1/128 (frente al 1/sqrt(128) típico de Llama), un detalle relevante para la portabilidad del checkpoint.

La contribución de Xylolabs es la cuantización: las proyecciones q, k, v, o y las capas MLP gate, up y down de las 64 capas se convierten a BFP4 con GPTQ y una búsqueda de exponente por bloque. El calibrado se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores; el archivo `quant4.json` documenta el formato de cada proyección. La cabeza LM, los embeddings, las normas y el resto de tensores permanecen en bf16, lo que da una media de 4,82 bits por peso y 17,65 GB empaquetados.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), tal como se muestra en el ejemplo de uso rápido.
- Razonamiento con modo "thinking" activable: la evaluación incluye 7 prompts de razonamiento ejecutados con thinking on y off.
- Capacidades multilingües en 12 idiomas declarados: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada (depende de las capacidades del modelo base Granite 4.2, no documentadas aquí).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades de visión o audio: no disponibles en esta variante (pipeline text-generation).
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con verificación de empaquetado exacto de cada matriz.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el caso principal. El checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, ocupando unos 17,65 GB de memoria de dispositivo para los pesos, lo que permite servir un modelo de 30B en hardware Tensix con presupuesto de memoria reducido.
- Inferencia en transformers sobre GPU convencional: al ser safetensors compatible con `AutoModelForCausalLM`, puede cargarse en bf16 con `device_map="auto"` para prototipado, aunque en ese caso se pierde la ventaja de compresión del formato BFP4.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de BFP4 frente a BF16 y Q4_K_M, con métricas de KL y top-1 ya publicadas sobre 16.216 posiciones de texto inglés y coreano.
- Asistentes conversacionales multilingües: la cobertura de 12 idiomas y la plantilla de chat permiten construir interfaces de diálogo en español, alemán, francés, japonés, coreano o árabe, siempre que el contexto requerido encaje en la ventana del modelo base (no documentada aquí).
- Procesamiento de texto en coreano e inglés: el calibrado de la cuantización se hizo específicamente sobre WikiText-2 y Wikipedia en coreano, por lo que la fidelidad respecto a BF16 está medida y validada en esos dos idiomas.
- Investigación en formatos de bloque: el repositorio incluye `pack_tensix.py` y `verify_grid.py`, útiles para estudiar el empaquetado BFP4 y verificar la integridad de la rejilla de exponentes en pipelines propios.
- Prototipado de pipelines con tt-forge: aunque el checkpoint no se ha ejecutado aún con tt-xla, el código de transformers aplica los multiplicadores correctos de Granite, lo que permite experimentar con compilación y re-cuantización en PyTorch.

## Benchmarks y rendimiento

Los datos publicados comparan la cuantización BFP4 con BF16 y con Q4_K_M de llama.cpp, sobre 16.216 posiciones de WikiText-2 test y Wikipedia en coreano, en texto plano y con plantilla de chat, más 40 preguntas cortas con verificación automática (33 generales y 7 de razonamiento repetidas con thinking on).

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-30b) | 16 | 58,55 | 0 | 100 | 35 de 40 | - |
| **Este modelo (BFP4)** | 4,82 | 17,651 | 0,09391 | 88,14 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 17,721 | 0,07629 | 88,96 | 36 de 40 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta variante cuantizada.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 17,65 GB solo para los pesos del modelo de lenguaje en BFP4, más espacio para la caché KV y buffers. En bf16 el checkpoint completo ocupa 58,55 GB.
- Aceleradores objetivo: Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole.
- GPU convencionales: al ser safetensors compatible con transformers, puede cargarse en bf16 en GPUs con al menos ~60 GB (A100 80GB, H100 80GB) o mediante cuantización adicional en GPUs de menor memoria; no se documentan requisitos específicos para este formato en GPU.
- ¿Cabe en GPU de consumo? En bf16 no cabe en una RTX 4090 (24 GB). El formato BFP4 está pensado para TT-NN, no para GPUs de consumo; no se indica soporte de este formato en llama.cpp u Ollama.
- Opciones de despliegue: transformers (con `device_map="auto"`), TT-NN/tt-metal para Tensix, y tt-forge (tt-xla) aunque aún no probado con este checkpoint. tt-transformers no es válido para este modelo porque no soporta Granite y aplica el multiplicador de atención de Llama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo (BFP4)** | ~29,3B | no disponible | BFP4 GPTQ (4,82 bits/peso) | 17,65 GB empaquetado | Apache 2.0 | Hugging Face, TT-NN |
| ibm-granite/granite-4.2-30b (BF16) | ~29,3B | no disponible | bf16 | 58,55 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | ~29,3B | no disponible | Q4_K_M (4,84 bits/peso) | 17,72 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparación directa con otras alternativas de la misma categoría (por ejemplo, otros modelos de 30B) no está disponible en la información proporcionada. Los tres artefactos de la tabla proceden del mismo checkpoint base, por lo que la comparación mide únicamente el efecto de la cuantización.

## Limitaciones y advertencias

- Degradación medible frente a BF16: KL media de 0,09391 y top-1 del 88,14 % sobre 16.216 posiciones, con 0 respuestas perdidas respecto a BF16 en el conjunto de 40 preguntas evaluadas.
- El calibrado de la cuantización se hizo solo con WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas declarados (español, árabe, japonés, etc.) no está evaluado específicamente.
- tt-transformers no es compatible con este modelo: carga el checkpoint como Llama e ignora el multiplicador de atención de Granite (1/128 frente a 1/sqrt(128)); en el modelo 8B de la misma familia la PCC de prefill fue de 0,95.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf4` re-cuantiza los pesos en el layout [out, in] de PyTorch, lo que puede alterar el comportamiento respecto al empaquetado nativo.
- El formato BFP4 es específico de TT-NN; fuera de Tensix no hay ventaja de compresión y el modelo debe usarse en bf16 o recuantizarse.
- No se dispone de información sobre sesgos del modelo base, riesgo de alucinación específico, ni límites de contexto en esta variante.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM para atribuciones y posibles restricciones adicionales de la familia Granite.
- El repositorio tiene 47 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-30b-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/granite-4.2-30b-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
