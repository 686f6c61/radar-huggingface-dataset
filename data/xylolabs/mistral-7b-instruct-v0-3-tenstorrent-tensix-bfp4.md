# Xylolabs/Mistral-7B-Instruct-v0.3-Tenstorrent-Tensix-BFP4

## Resumen

Mistral-7B-Instruct-v0.3-Tenstix-BFP4 es una exportación cuantizada del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only del original, con 7.248.023.552 parámetros, pero sustituye las proyecciones lineales por matrices almacenadas en formato block-floating-point de 4 bits (`ttnn.bfloat4_b`), lo que reduce el peso en memoria del modelo de 14,5 GB a unos 4,46 GB empaquetados.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica para GPU, sino de un artefacto diseñado para encajar en el pipeline de TT-NN y TT-Metal de Tenstorrent. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores, y el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y una configuración de referencia para el demo `tt-transformers`.

El modelo hereda las capacidades conversacionales y de generación de texto del Mistral-7B-Instruct-v0.3 original, con licencia Apache 2.0 y compatibilidad con la librería transformers. Es, por tanto, un artefacto de despliegue para hardware Tenstorrent más que un modelo nuevo: su interés está en la eficiencia de memoria y la fidelidad numérica respecto al BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3), proyecciones lineales cuantizadas a BFP4 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en q/k/v/o y gate/up/down; 4,93 bits por peso de media); LM head, embeddings y normas en bf16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 7.248 millones de parámetros con 32 capas, sobre el que Xylolabs aplica GPTQ con una búsqueda de exponente por bloque para cuantizar las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) al formato `ttnn.bfloat4_b`. La calibración se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El LM head, los embeddings, las normas y el resto de tensores permanecen en bf16, lo que explica el promedio de 4,93 bits por peso y los 4,46 GB empaquetados.

La innovación técnica principal es la preservación exacta de los valores: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de forma que TT-NN las empaqueta sin modificar sus valores, y el mismo conjunto de valores también se empaqueta de forma exacta en `ttnn.bfloat8_b`. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts de verificación que comprueban la igualdad bit a bit tras el empaquetado. No se dispone de información sobre el proceso de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Generación de código y matemáticas (capacidades del modelo base; no se aportan métricas específicas en esta ficha).
- Compatibilidad con la API de `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y con text-generation-inference según los tags del repositorio.
- Ejecución sobre aceleradores Tenstorrent Tensix mediante TT-NN, TT-Metal y TT-Forge (tt-xla).
- Verificación numérica exacta del empaquetado BFP4 frente a bf16.
- No se documentan capacidades de visión, audio, tool calling ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el modelo ocupa unos 4,46 GB de memoria de dispositivo para los pesos del LM, lo que permite servirlo en NPUs Tensix con espacio para KV cache y buffers, algo inviable con el BF16 de 14,5 GB en configuraciones de memoria ajustada.
- Inferencia de bajo consumo en entornos con NPUs Tensix: la cuantización BFP4 reduce el ancho de banda de memoria necesario para leer pesos, lo que resulta adecuado para decodificación autoregresiva batch-1 en el demo `tt-transformers`.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el empaquetado BFP4 no altera los valores, útil para equipos que desarrollan sus propias exportaciones para TT-NN.
- Prototipado de asistentes conversacionales en hardware no-GPU: al mantener la plantilla de chat de Mistral Instruct, puede integrarse en aplicaciones de atención al cliente o asistentes internos desplegados sobre Tensix.
- Investigación en fidelidad de cuantización: la tabla de evaluación del autor (KL medio frente a BF16, Top-1 y respuestas correctas) sirve como referencia para estudiar el impacto de BFP4 en modelos de 7B.
- Integración con TT-Forge (tt-xla): aunque no se ha ejecutado con este checkpoint, el modelo puede servir como entrada para flujos de compilación de tt-xla, que por defecto mantiene los pesos en bf16 de forma exacta.

## Benchmarks y rendimiento

La model card incluye una evaluación comparativa frente al BF16 de referencia. Se reproduce a continuación tal cual, sin añadir datos no publicados:

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (mistralai/Mistral-7B-Instruct-v0.3) | 16 | 14,50 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP4) | 4,93 | 4,46 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El autor indica además que, con la configuración `--use_hf_rope` en tt-transformers (tt-metal v0.81.1), todas las proyecciones de las dos primeras capas se empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0,9996. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 4,46 GB solo para los pesos del LM, más espacio para KV cache y buffers (el autor no cuantifica este extra).
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole); verificado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole.
- GPU consumer: no es el objetivo del artefacto; en GPU puede cargarse vía transformers en bf16 (unos 14,5 GB de pesos, más overhead), lo que requiere GPUs de 24 GB o más para inferencia cómoda. No se proporcionan cifras de latencia ni throughput en GPU.
- Opciones de despliegue: TT-NN / TT-Metal (v0.81.1) con el demo `tt_transformers`; TT-Forge (tt-xla), aunque no probado con este checkpoint; transformers para carga y verificación; text-generation-inference según los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP4 | 7,25 B | no disponible | BFP4 (4,93 bits/peso) | Apache 2.0 | Hugging Face, orientado a Tensix |
| mistralai/Mistral-7B-Instruct-v0.3 (BF16) | 7,25 B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | Hugging Face, propósito general |
| Otras cuantizaciones de Mistral-7B-Instruct-v0.3 (GPTQ/AWQ/GGUF) | 7,25 B | no disponible | 4-8 bits típicamente | Apache 2.0 (heredada) | Hugging Face, orientadas a GPU/CPU |

La comparativa se limita al modelo base y a cuantizaciones genéricas, ya que no se dispone de datos de benchmarks de alternativas en la información proporcionada. La diferencia clave frente a otras cuantizaciones es el formato BFP4 empaquetable de forma exacta en TT-NN y la orientación explícita a NPUs Tensix.

## Limitaciones y advertencias

- La cuantización BFP4 introduce pérdida de fidelidad respecto a BF16; el autor reporta métricas de KL y respuestas correctas, pero el extracto disponible no incluye los valores completos, por lo que no puede cuantificarse aquí la degradación exacta.
- El demo `tt-transformers` empaqueta el LM head en `bfloat8_b`, mientras que este checkpoint lo mantiene en bf16, por lo que la cabeza no es exacta en ese flujo.
- TT-Forge (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch, lo que puede alterar los valores.
- El uso de `--use_hf_rope` es obligatorio en el demo; sin él se permutan las filas de q y k y se recuantiza el QKV fusionado.
- No se documentan idiomas soportados ni longitud de contexto en la información disponible; deben consultarse en la model card del modelo base.
- Riesgo de sesgos y alucinaciones heredado del Mistral-7B-Instruct-v0.3 original; no se aportan evaluaciones específicas de sesgo en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibración (WikiText-2 y Wikipedia en coreano).
- El artefacto está pensado para hardware Tensix; su uso en GPU o CPU requiere cargarlo en bf16 y no aprovecha la cuantización BFP4.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- TT-Metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tenstix-BFP4/blob/main/LICENSE
