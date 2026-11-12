# Xylolabs/Nanbeige4.3-33B-Tensix-BFP4

## Resumen

Nanbeige4.3-33B-Tensix-BFP4 es una cuantización del modelo Nanbeige4.3-33B, un modelo de lenguaje de 33.118.977.024 parámetros desarrollado por el equipo Nanbeige. Esta versión concreta la publica Xylolabs y no es un modelo nuevo, sino una exportación optimizada para las NPU Tensix de Tenstorrent (Wormhole y Blackhole): las capas lineales de atención y MLP se cuantizan a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ, mientras que embeddings, LM head y normalizaciones permanecen en bf16.

El resultado es un checkpoint de 22,07 GB empaquetado que promedia 5,33 bits por peso, frente a los 66,24 GB del modelo base en bf16. La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión (BFP4 + GPTQ con búsqueda de exponente por bloque) aplicada a un LLM de 33B; por otro, sirve de puente para ejecutar modelos grandes en hardware de inferencia alternativo a las GPU convencionales, en este caso aceleradores Tensix.

Es importante señalar que el modelo base Nanbeige4.3-33B es conversacional y multilingüe (inglés y chino), con licencia Apache 2.0. La información disponible sobre esta exportación se centra en el proceso de cuantización y en métricas de fidelidad respecto al BF16, no en benchmarks de calidad de tarea del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`); capas lineales cuantizadas a BFP4 |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso en capas lineales), bf16 en el resto; GPTQ con búsqueda de exponente por bloque; media de 5,33 bits/peso |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` e índice `model.safetensors.index.json`); no GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 33B parámetros con 52 capas (según la tabla de formatos, que lista 52 capas con atenciones q, k, v, o y MLP gate, up, down). Esta exportación no reentrena el modelo: aplica GPTQ sobre las matrices de atención y MLP, cuantizándolas a una rejilla de block floating point de 4 bits (`bfloat4_b`). Las matrices cuantizadas se almacenan como valores bf16 sobre esa rejilla BFP4, de modo que el empaquetado es reversible bit a bit (los 364 tensores empaquetados coinciden exactamente).

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, con una búsqueda de exponente por bloque. El resto de tensores (embeddings, LM head, normas) se mantienen en bf16 tal como en el modelo base. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, uso con `apply_chat_template`).
- Razonamiento de sentido común y respuesta a preguntas cortas (evaluado con 33 prompts con comprobación automática).
- Razonamiento temporal básico (el ítem de razonamiento sobre días de la semana se validó con modo thinking activado).
- Capacidades multilingües limitadas a inglés y chino (la evaluación de fidelidad incluyó además texto en coreano como conjunto de calibración/prueba, pero el modelo no declara coreano como idioma soportado).
- Inferencia en NPU Tensix mediante TT-NN (`ttnn.bfloat4_b`), con verificación de empaquetado bit a bit.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para ejecutarse en NPU Wormhole y Blackhole mediante TT-NN, lo que permite servir un LLM de 33B en hardware Tensix con 22,07 GB de pesos empaquetados en lugar de 66,24 GB en bf16.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ sobre block floating point de 4 bits, con scripts (`pack_tensix.py`, `verify_grid.py`) para validar que ninguna matriz cambia al empaquetar.
- Evaluación de fidelidad de cuantizaciones: útil para comparar BFP4 frente a Q4_K_M de llama.cpp en términos de KL y top-1 sobre el mismo checkpoint base.
- Prototipado de asistentes conversacionales en inglés y chino: el modelo conserva la plantilla de chat del base y puede usarse con `transformers` en CPU para pruebas rápidas.
- Validación de pipelines de exportación a hardware no GPU: los scripts de verificación permiten comprobar la integridad del empaquetado antes de desplegar en dispositivo.
- Benchmarking de compresión: comparar el compromiso entre tamaño (22,07 GB), bits por peso (5,33) y degradación (KL medio de 0,0702 frente a BF16) en escenarios de investigación.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto al BF16, no la calidad de tarea del modelo. KL y top-1 se calculan sobre 16.220 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. "Answers right" corresponde a 33 prompts cortos con comprobación automática.

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Nanbeige4.3-33B) | 16 | 66,24 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4) | 5,33 | 22,070 | 0,0702 | 88,9 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 20,051 | 0,0608 | 89,21 | 28 de 33 | 0 |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni mediciones de velocidad en dispositivo.

## Requisitos de hardware

- Pesos empaquetados: 22,07 GB en safetensors; el repositorio completo ocupa 66,3 GB.
- Inferencia en Tensix: requiere NPU Tenstorrent Wormhole o Blackhole con TT-NN (probado con ttnn 0.81.1 en el simulador ttsim de Blackhole, no en hardware real).
- Inferencia con `transformers`: el quickstart se validó con Transformers 5.22.2 en CPU; en GPU se necesitaría memoria suficiente para los pesos en bf16 más la sobrecarga de la cuantización (no cuantifica ahorro de VRAM en ese camino, ya que el checkpoint se carga con `dtype="bfloat16"`).
- No cabe en GPU de consumo de forma holgada en bf16 (66,24 GB); en el formato empaquetado de 22,07 GB podría alojarse en GPU de 24 GB o más, aunque no se documenta ese flujo.
- Opciones de despliegue documentadas: TT-NN/tt-metal en Tensix, `transformers` en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint (el tag `text-generation-inference` aparece en los metadatos, pero no se documenta su uso).
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Tensix-BFP4 | 33,1B | no disponible | safetensors BFP4/bf16 | Apache 2.0 | Optimizado para Tensix; 22,07 GB |
| Nanbeige4.3-33B (BF16) | 33,1B | no disponible | safetensors bf16 | Apache 2.0 | Modelo base; 66,24 GB |
| Nanbeige4.3-33B Q4_K_M (llama.cpp) | 33,1B | no disponible | GGUF | Apache 2.0 | 20,051 GB; KL 0,0608; ejecutable en CPU/GPU |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 degrada la fidelidad respecto al BF16: KL medio de 0,0702 y top-1 del 88,9 % frente al 100 % del base.
- No se ha probado en hardware Tensix real; las pruebas se hicieron en el simulador ttsim. tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- El modelo solo declara inglés y chino; el coreano se usó en calibración y evaluación, pero no figura como idioma soportado.
- No hay datos publicados sobre sesgos, tasas de alucinación ni longitud de contexto del modelo base en la información disponible.
- El repositorio del modelo base no incluye fichero LICENSE; el autor de la exportación aporta el texto estándar de Apache 2.0 y un NOTICE con los cambios. Para uso comercial conviene verificar la licencia en el repositorio original.
- El modelo se distribuye "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Nanbeige4.3-33B-Tensix-BFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Nanbeige4.3-33B-Tensix-BFP4/blob/main/LICENSE
