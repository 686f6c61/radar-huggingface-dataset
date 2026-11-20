# Xylolabs/Hy4-MLX-8bit

## Resumen

Hy4 MLX 8-bit es una conversión cuantizada del modelo de texto tencent/Hy4, publicada por Xylolabs para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por Tencent, con 770.000 millones de parámetros totales y 49.000 millones activos por token, diseñado para generación de texto y conversación. Esta versión concreta conserva únicamente la torre de texto y aplica cuantización afín de 8 bits a la mayoría de las matrices de pesos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala frontera en hardware de Apple, algo impensable con los pesos en BF16 (que ocuparían más de 1,5 TB). El repositorio ocupa 819,6 GB repartidos en 243 shards, e incluye el código del modelo (`hy_v4.py`) adaptado a `mlx-lm`, además del script de conversión. No incorpora la torre de visión ni el drafter DFly2 del modelo base, por lo que la entrada y salida es exclusivamente texto.

Es importante señalar que el modelo se publica bajo la Tencent Hy License, versión 1.0, que impone condiciones adicionales a los operadores de Model-as-a-Service a gran escala. La información disponible sobre benchmarks, datos de entrenamiento y detalles de arquitectura interna es limitada en la model card proporcionada, por lo que varios apartados de esta ficha indican "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con atención MLA e indexer; código `hy_v4` en `mlx-lm` |
| Parametros totales | 769.907.408.797 (≈770B) |
| Parametros activos | 49B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín (group size 64) para expertos enrutados, atención, indexer, expertos compartidos y MLP denso de capa 0; bf16 para embeddings y LM head; bf16/f32 para router, hiperconexiones, normas y sinks de atención |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (con términos adicionales para operadores de Model-as-a-Service a gran escala) |
| Formato de pesos | safetensors (MLX), 243 shards, 819,63 GB (763,34 GiB) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4 es un transformer MoE con 770B parámetros totales y 49B activos. La model card de la conversión menciona componentes concretos: proyecciones MLA (Multi-head Latent Attention), un módulo "indexer" con proyecciones de query y key, expertos enrutados, expertos compartidos, un MLP denso en la capa 0, hiperconexiones y sinks de atención. La presencia de MLA y de un indexer sugiere un diseño orientado a eficiencia en atención y posiblemente a selección dispersa de tokens, aunque no se detalla el mecanismo completo en la información disponible.

En cuanto al entrenamiento, no se especifican en la información proporcionada el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión de Xylolabs se realizó haciendo streaming del modelo BF16 (revisión `c10c0de5`) shard a shard, cuantizando con `mx.quantize` (afín, group size 64, redondeo al más cercano) y escribiendo los resultados. Cada `kv_b_proj` de atención se dividió en `embed_q` y `unembed_out` por cabeza, siguiendo el modelo DeepSeek-V3.2 de `mlx-lm`. RoPE rota pares adyacentes, como en la clase `hy_v4_vl` de Transformers (PR 50589).

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y respuesta a instrucciones (pipeline `text-generation`, tag `conversational`).
- Ejecución local en Apple Silicon mediante `mlx-lm` (comandos `generate`, `chat` y `server`).
- Soporte de plantilla de chat (`chat_template.jinja` incluida desde el modelo base).
- No incluye visión: la torre visual del modelo original ha sido omitida en esta conversión.
- No incluye decodificación especulativa: el drafter DFly2 no está presente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: desplegando `mlx_lm.server` en un equipo Apple Silicon con suficiente memoria unificada, se puede ofrecer un endpoint compatible con la API de chat para uso personal o de equipo pequeño, sin depender de la nube.
- Prototipado e investigación en chino e inglés: el modelo cubre ambos idiomas, lo que permite evaluar comportamientos bilingües y comparar con checkpoints BF16 en tareas de generación.
- Generación de texto de alta calidad en local: para redacción asistida, resumen o reescritura donde se prioriza privacidad y no se quiere enviar datos a un proveedor externo.
- Evaluación de cuantización: este checkpoint sirve para medir la degradación de un modelo de 770B al pasar a 8-bit afín con group size 64, comparándolo con el original BF16.
- Desarrollo de aplicaciones MLX: el repositorio incluye `hy_v4.py` y `convert_hy4.py`, útiles como referencia para portar otros modelos MoE a MLX.
- Servicio interno de bajo volumen: con `mlx_lm.server` se puede montar un servicio de generación para herramientas internas, siempre que el hardware cumpla los requisitos de memoria y se respete la licencia.
- Experimentación con arquitecturas MoE dispersas: la implementación permite estudiar el comportamiento de expertos enrutados y MLA en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 819,63 GB (763,34 GiB) en safetensors; se necesita memoria unificada disponible cercana a esa cifra más overhead de ejecución, por lo que se requieren configuraciones de gama muy alta (varios cientos de GB).
- GPU recomendadas: no aplica GPU discreta tradicional; el formato es MLX y está pensado para Apple Silicon. No se especifican modelos concretos de Apple en la información disponible.
- ¿Cabe en consumer GPU? No en el sentido habitual: 819 GB excede la VRAM de cualquier GPU de consumo (RTX 4090 con 24 GB, por ejemplo). Solo es viable en equipos Apple con memoria unificada muy elevada.
- Opciones de despliegue: `mlx-lm` 0.32.2 con `--trust-remote-code` (comandos `mlx_lm.generate`, `mlx_lm.chat`, `mlx_lm.server`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / ecosistema | Notas |
|---|---|---|---|---|---|
| Xylolabs/Hy4-MLX-8bit | 770B / 49B | no disponible | Tencent Hy License 1.0 | MLX safetensors 8-bit | Solo texto; sin visión ni drafter |
| tencent/Hy4 (original) | 770B / 49B | no disponible | Tencent Hy License 1.0 | BF16 (Transformers) | Incluye torre de visión y drafter DFly2; instrucciones para vLLM y SGLang |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo texto: la torre de visión y el drafter DFly2 del modelo base no están incluidos, por lo que no hay capacidades multimodales ni decodificación especulativa.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La cuantización a 8-bit puede introducir degradación respecto al BF16 original; no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia restrictiva: Tencent Hy License 1.0 incluye términos adicionales para operadores de Model-as-a-Service a gran escala; es imprescindible revisar `LICENSE` antes de un uso comercial.
- Requisitos de memoria extremos (≈819 GB de pesos), lo que limita el despliegue a hardware muy específico.
- El código del modelo se carga con `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar `hy_v4.py` antes de usarlo en producción.
- Xylolabs declara no estar afiliada ni respaldada por Tencent.
- No se especifican la longitud de contexto ni el throughput, datos clave para dimensionar un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy4
- README en chino del modelo base: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- ModelScope del modelo base: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- Licencia: https://huggingface.co/Xylolabs/Hy4-MLX-8bit/blob/main/LICENSE
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper referenciado (arXiv 2512.02556): https://arxiv.org/abs/2512.02556
- Paper referenciado (arXiv 2603.12201): https://arxiv.org/abs/2603.12201
