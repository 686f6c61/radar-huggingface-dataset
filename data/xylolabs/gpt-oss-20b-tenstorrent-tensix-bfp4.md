# Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4

## Resumen

gpt-oss-20b-Tenstorrent-Tensix-BFP4 es una cuantización del modelo openai/gpt-oss-20b realizada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una conversión de pesos que reformatea las proyecciones del transformer original a formatos de bloque de coma flotante (block floating point, BFP) nativos del hardware Tensix: BFP4 para los expertos enrutados y BFP8 para atención y cabeza de lenguaje. El objetivo es reducir el peso en disco y en memoria de 41,83 GB en bf16 a 13,218 GB empaquetados, manteniendo una fidelidad numérica respecto al modelo original comparable a la de otras cuantizaciones de referencia.

El modelo base, gpt-oss-20b de OpenAI, es un transformer con mezcla de expertos (MoE) de aproximadamente 20.900 millones de parámetros totales. Esta versión conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors compatible con Transformers, además de incluir las herramientas (`pack_tensix.py`, `verify_grid.py`) para empaquetar y verificar las matrices sobre Tensix usando ttnn. La relevancia actual reside en que es una de las primeras cuantizaciones publicadas que aprovecha los formatos BFP4/BFP8 del silicio de Tenstorrent, un ecosistema alternativo a GPU que necesita pesos preempaquetados para ser competitivo en coste por token.

La ficha se centra en lo que la model card documenta explícitamente: formatos por tensor, métricas de fidelidad (KL medio y top-1 frente a bf16), tamaño empaquetado y procedimiento de verificación. Cualquier dato sobre entrenamiento, idiomas o benchmarks de tareas no aparece en la información disponible y se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en expertos enrutados; BFP8 (`bfloat8_b`) en atención y LM head; bf16 en router, embeddings y normas |
| Idiomas soportados | no disponible (la evaluacion de fidelidad usa texto en ingles y coreano) |
| Licencia | Apache 2.0 (con USAGE_POLICY del modelo base) |
| Formato de pesos | safetensors (compatible con Transformers); empaquetado Tensix de 13,218 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo openai/gpt-oss-20b: un transformer con capas de mezcla de expertos (MoE), con 24 capas documentadas en el desglose de formatos. Esta versión no reentrena el modelo; aplica cuantización post-entrenamiento. Concretamente, las proyecciones de los expertos enrutados (gate, up, down) se cuantizan a `bfloat4_b` con GPTQ y una búsqueda de exponente por bloque, con bloques de 16 a lo largo de las entradas. Las proyecciones de atención (q, k, v, o) y la cabeza de lenguaje (LM head) se cuantizan a `bfloat8_b` mediante redondeo al más cercano. El router, los embeddings y las normas permanecen en bf16, igual que en el modelo base. Los expertos que vieron pocos tokens de calibración se cuantizaron por redondeo simple en lugar de GPTQ.

El resultado del empaquetado es un conjunto de pesos de 13,218 GB frente a 41,83 GB en bf16, es decir, una reducción de aproximadamente 3,16 veces. La fidelidad se mide como divergencia KL media respecto a bf16 sobre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), obteniendo 0,0636 frente a 0,0678 de la cuantización MXFP4 de llama.cpp. La tasa top-1 es del 81,90 % frente al 82,65 % de MXFP4. La model card advierte que cada cuantización se mide contra su propio bf16, y que el bf16 de llama.cpp difiere del de referencia en 0,0435 de KL media, por lo que la comparación es aproximada. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de chat con `apply_chat_template`, orientado a respuestas multi-turno.
- Razonamiento y código: heredadas del modelo base gpt-oss-20b, aunque no se detallan capacidades específicas en la información disponible.
- Tool calling y function calling: no documentado explícitamente en esta model card; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Multilingüismo: no se declaran idiomas soportados; la evaluación de fidelidad cubre inglés y coreano.
- Ejecución en aceleradores Tensix: los pesos están empaquetados para `ttnn.bfloat4_b` y `ttnn.bfloat8_b`, con verificación mediante `pack_tensix.py` y `verify_grid.py`.
- Compatibilidad con Transformers: carga estándar con `AutoModelForCausalLM` en dtype bfloat16.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo está pensado para ejecutarse en NPU Wormhole o Blackhole, donde los formatos BFP4/BFP8 son nativos; reduce el peso en memoria a 13,218 GB y evita conversiones en tiempo de ejecución.
- Servicio de chat de bajo coste por token: al empaquetar los expertos en BFP4, el coste de memoria y de ancho de banda por inferencia disminuye frente a bf16, lo que resulta adecuado para endpoints conversacionales de alto volumen.
- Evaluación de fidelidad de cuantizaciones: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar cada matriz contra su versión en bf16, útil en pipelines de validación de cuantizaciones antes de producción.
- Prototipado en simulador: la model card indica que se verificó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, lo que permite desarrollar y depurar kernels sin hardware físico.
- Investigación en formatos de bloque: sirve como referencia para estudiar el impacto de BFP4 con GPTQ en proyecciones MoE frente a MXFP4, con métricas KL y top-1 publicadas.
- Integración en pipelines de Transformers: al cargarse con `AutoModelForCausalLM`, puede incorporarse a flujos existentes de generación de texto en bf16 para pruebas funcionales antes de migrar a Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (openai/gpt-oss-20b) | 41,83 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 13,218 | 0,0636 | 81,90 |
| MXFP4 (llama.cpp) | 12,110 | 0,0678 | 82,65 |

Las métricas cubren 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano. La comparación con MXFP4 usa el GGUF de ggml-org (`ggml-org/gpt-oss-20b-GGUF` en `15dcfc7e`) leído con llama.cpp v0.9.0 (`cd959bae`). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 13,218 GB de pesos empaquetados para Tensix; en bf16 nativo, 41,83 GB.
- GPU recomendadas: no aplica de forma nativa; el modelo está orientado a NPU Tenstorrent Wormhole y Blackhole. Para carga en Transformers se necesita memoria suficiente para bf16 (del orden de 42 GB de pesos).
- Cabe en GPU de consumo: no en configuraciones habituales de 24 GB en bf16; la versión empaquetada está pensada para Tensix, no para CUDA.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), ttnn 0.81.1 con `ttsim` (simulador de Blackhole), y las herramientas `tensix-bfp-gptq`, `tensix-kernels` y `tensix-runner` v0.1.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL media a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8) | 20,9 mil millones | no disponible | 13,218 GB | 0,0636 | Apache 2.0 | Hugging Face, Tensix |
| openai/gpt-oss-20b (BF16) | 20,9 mil millones | no disponible | 41,83 GB | 0 | Apache 2.0 | Hugging Face |
| MXFP4 (llama.cpp) | 20,9 mil millones | no disponible | 12,110 GB | 0,0678 | Apache 2.0 | GGUF en ggml-org |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que la información disponible no incluye modelos alternativos de otros autores. El modelo empaquetado ocupa 1,108 GB más que MXFP4 pero obtiene una KL media ligeramente inferior (0,0636 frente a 0,0678), mientras que MXFP4 logra un top-1 algo superior (82,65 % frente a 81,90 %).

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base openai/gpt-oss-20b, que no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado en la model card; debe evaluarse por tarea antes de producción.
- Idiomas: no se declara una lista de idiomas soportados; la evaluación de fidelidad solo cubre inglés y coreano.
- Dependencia de hardware: los pesos están empaquetados para Tensix; su uso eficiente requiere ttnn y NPU Wormhole o Blackhole, con verificación limitada al simulador `ttsim` en la documentación.
- Compatibilidad: la carga en Transformers en bf16 requiere memoria para el modelo completo (del orden de 42 GB), lo que limita su uso en GPU de consumo.
- Licencia: Apache 2.0 con la política de uso (`USAGE_POLICY`) del modelo base; conviene revisarla antes de uso comercial.
- Fidelidad: la KL media de 0,0636 y el top-1 de 81,90 % implican una degradación medible frente a bf16; en tareas sensibles a la precisión numérica debe validarse específicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del código: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- GGUF de referencia MXFP4: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper citado en los tags (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
