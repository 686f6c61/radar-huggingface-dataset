# Xylolabs/Hy4-MLX-4bit

## Resumen

Hy4 MLX 4-bit es una conversión cuantizada del modelo de lenguaje Hy4 de Tencent (770B parámetros totales, 49B activos) al formato MLX de Apple, realizada por Xylolabs. Se trata de un transformer de mezcla de expertos (MoE) que conserva únicamente la torre de texto del modelo original: no incluye la torre de visión ni el drafter DFly2, por lo que es estrictamente texto a texto. La cuantización deja los expertos enrutados en 4 bits y el resto de componentes en 8 bits o bf16, reduciendo el peso a 447,58 GB repartidos en 243 shards.

El modelo base Hy4 resuelve tareas de generación de texto, razonamiento y conversación multilingüe (inglés y chino) con una ventana de contexto amplia y arquitectura MoE de activación dispersa, lo que permite ejecutar un modelo de escala 770B con un coste computacional por token equivalente a 49B activos. Esta versión MLX está pensada para ejecutarse en hardware Apple Silicon mediante `mlx-lm`, no en GPUs CUDA.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas conversiones MLX de un modelo de escala cercana al billón de parámetros; por otro, advierte de que el modelo base es muy reciente y de que el ecosistema de herramientas, benchmarks y despliegue en producción alrededor de Hy4 todavía es limitado. La licencia Tencent Hy License, con términos adicionales para operadores de Model-as-a-Service a gran escala, condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención MLA e indexer; código de modelo `hy_v4` portado de Transformers |
| Parámetros totales | 769.907.408.797 (≈770B) |
| Parámetros activos | 49B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín (expertos enrutados, group size 64); 8-bit afín (atención, proyecciones del indexer, expertos compartidos, MLP densa de la capa 0); bf16 (embeddings, LM head); bf16/f32 (router, hiperconexiones, normas, attention sinks) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Tencent Hy License, Version 1.0 (con términos adicionales para grandes operadores de Model-as-a-Service) |
| Formato de pesos | safetensors (MLX), 243 shards, 447,58 GB (416,84 GiB) |

## Arquitectura y entrenamiento

El modelo base Hy4 es un transformer de mezcla de expertos con 770B parámetros totales y 49B activos por token. La arquitectura incorpora atención MLA (Multi-head Latent Attention) con un mecanismo de indexado, expertos compartidos además de los enrutados, hiperconexiones y attention sinks. La conversión de Xylolabs reproduce esta arquitectura en `hy_v4.py`, portando el código de Transformers y aplicando rotación RoPE sobre pares adyacentes, tal como hace la clase `hy_v4_vl` de Transformers y su pull request 50589. Cada `kv_b_proj` de atención se divide en `embed_q` y `unembed_out` por cabeza, siguiendo el modelo DeepSeek-V3.2 de `mlx-lm`.

El proceso de cuantización se realizó en streaming: se descargaba cada shard de `tencent/Hy4` (BF16, revisión `c10c0de5`), se cuantizaban sus tensores de texto con `mx.quantize` (afín, group size 64, redondeo al más cercano), se escribían y se borraba el shard. Los expertos enrutados (744,1B parámetros) pasaron a 4 bits; atención, proyecciones query/key del indexer, expertos compartidos y la capa densa a 8 bits; embeddings y LM head se mantuvieron en bf16, con el LM head multiplicado en float32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`chat_template.jinja`).
- Generación de código y matemáticas: capacidad esperable por el tamaño del modelo base, aunque no se documentan evaluaciones específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: no incluidas en esta conversión (la torre de visión del modelo original no se ha portado).
- Decodificación especulativa: no incluida (el drafter DFly2 del modelo original no se ha portado).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede ejecutarse con `mlx_lm.chat` en equipos con memoria unificada suficiente, gestionando diálogos multi-turno en inglés o chino sin depender de servicios en la nube.
- Generación de texto en pipelines de investigación: útil para experimentar con un MoE de escala 770B en entornos MLX, comparando comportamiento y latencia frente a modelos más pequeños.
- Traducción y redacción bilingüe inglés-chino: el soporte nativo de ambos idiomas permite tareas de traducción, resumen y reescritura en esos pares lingüísticos.
- Prototipado de aplicaciones de chat con `mlx_lm.server`: el servidor incluido en `mlx-lm` permite exponer el modelo como API local para pruebas de integración.
- Evaluación de cuantización: sirve como referencia para estudiar el impacto de cuantizar expertos enrutados a 4 bits frente a atención en 8 bits en un modelo de gran escala.
- Experimentación con arquitecturas MoE con MLA: investigadores pueden inspeccionar el comportamiento de atención MLA e indexer en un modelo abierto bajo licencia Tencent Hy.
- Generación de documentación técnica y código en flujos de trabajo locales: adecuado para desarrolladores que prefieren mantener los datos en su máquina, siempre que la memoria unificada lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 447,58 GB (416,84 GiB) en safetensors; la inferencia requiere memoria unificada suficiente para cargar los pesos y el estado de activación, muy por encima de lo habitual en equipos de consumo.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX está diseñado para Apple Silicon (series M). No se documentan requisitos para A100, H100 o RTX 4090, y `mlx-lm` no ejecuta este formato en CUDA.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales; requiere equipos Apple Silicon con memoria unificada de gran capacidad (no se especifica el mínimo exacto en la información disponible).
- Opciones de despliegue: `mlx-lm` 0.32.2 con `--trust-remote-code` (`mlx_lm.generate`, `mlx_lm.chat`, `mlx_lm.server`). No se documenta soporte para vLLM, SGLang, llama.cpp, Ollama ni TGI en esta conversión; las instrucciones de vLLM y SGLang del README original aplican a los checkpoints de Tencent, no a estos archivos MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4 MLX 4-bit (esta ficha) | 770B / 49B | no disponible | safetensors MLX 4-bit/8-bit | Tencent Hy License 1.0 | Hugging Face (Xylolabs) |
| tencent/Hy4 (original) | 770B / 49B | no disponible | BF16 (Transformers) | Tencent Hy License 1.0 | Hugging Face, ModelScope |
| DeepSeek-V3.2 (referencia citada en la conversión) | no disponible | no disponible | safetensors | no disponible | Hugging Face |
| Otros MoE de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Esta conversión es solo de texto: no incluye visión ni decodificación especulativa, por lo que no reproduce las capacidades multimodales del modelo original.
- El formato MLX limita la ejecución a Apple Silicon; no es desplegable en GPUs NVIDIA o AMD con las herramientas habituales (vLLM, TGI, llama.cpp).
- El tamaño de 447,58 GB exige equipos con memoria unificada muy elevada; no es viable en la mayoría de estaciones de trabajo de consumo.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de fiabilidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento del modelo original (no disponibles).
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Tencent Hy License 1.0 con términos adicionales para grandes operadores de Model-as-a-Service; es necesario revisar el archivo `LICENSE` antes de un uso comercial.
- Xylolabs no está afiliada ni respaldada por Tencent; los archivos son una conversión no oficial.
- El modelo base es muy reciente (revisión `c10c0de5`), por lo que el ecosistema de herramientas y validaciones independientes es aún escaso.
- La carga requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio (`hy_v4.py`); conviene auditar dicho código antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy4-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4
- README en chino del modelo base: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- Modelo base en ModelScope: https://modelscope.cn/models/Tencent/Hy4
- Repositorio de `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Repositorio de herramientas de conversión de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia Tencent Hy License 1.0: https://huggingface.co/Xylolabs/Hy4-MLX-4bit/blob/main/LICENSE
- Paper referenciado (arXiv:2512.02556): https://arxiv.org/abs/2512.02556
- Paper referenciado (arXiv:2603.12201): https://arxiv.org/abs/2603.12201
