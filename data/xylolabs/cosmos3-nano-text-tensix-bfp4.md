# Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tensix-BFP4 es una cuantización del modelo de texto de NVIDIA Cosmos3-Nano, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo base es un transformer de la familia Qwen3 con 8.190.735.360 parámetros, y esta variante aplica GPTQ para redondear las capas lineales al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4), de modo que TT-NN pueda empaquetarlas sin recuantizar.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización de bajo nivel (block floating point de 4,5 bits por peso en las proyecciones de atención y MLP) pensada para hardware específico. Por otro, es un caso claro de artefacto experimental: el autor indica que solo se ha probado en `ttsim`, el simulador de Blackhole de Tenstorrent, y no en hardware real. Además, se trata únicamente de la torre de comprensión del modelo multimodal original (embedding, 36 capas y LM head), con los tensores renombrados al esquema de Qwen3 para cargarse como `Qwen3ForCausalLM`, dejando fuera el codificador de visión, el VAE de vídeo y el tokenizador de audio.

El modelo se distribuye en safetensors en bf16 cuyos valores ya están alineados a la rejilla BFP4, con un tamaño de repositorio de 16,4 GB y un peso empaquetado declarado de 6,40 GB (6,25 bits por peso de media). La licencia es OpenMDW-1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, cargado como `Qwen3ForCausalLM`); 36 capas |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y gate/up/down; bf16 en LM head, embedding, norms y resto de tensores; media de 6,25 bits por peso; compatible también con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (el calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP4), más `quant4.json` con el formato de cada proyección y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3 con 36 capas y 8.190 millones de parámetros, del que esta publicación conserva exclusivamente la torre de texto (embedding, capas y LM head). No se ha reentrenado: la ficha describe un proceso de cuantización post-entrenamiento. Las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas se redondean a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (LM head, embedding, normas) permanece en bf16, igual que en el modelo base.

La innovación técnica es el formato block floating point de 4,5 bits: cada bloque de pesos comparte un exponente, lo que reduce el coste de almacenamiento y cómputo en las NPU Tensix. Los ficheros se guardan en bf16, pero cada valor ya está en la rejilla BFP4, de forma que TT-NN lo empaqueta sin un segundo redondeo. El autor incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado no altera ningún valor, y señala que los mismos valores se empaquetan de forma exacta en `ttnn.bfloat8_b`. En bf16, el modelo reproduce exactamente el código de NVIDIA sobre texto.

## Capacidades

- Generación de texto conversacional, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas en formato multi-turno (el ejemplo de la model card es una pregunta directa).
- Carga directa con `transformers` como `Qwen3ForCausalLM`, lo que hereda las capacidades del decoder Qwen3 subyacente.
- Ejecución en NPU Tensix mediante TT-NN (`ttnn` 0.81.1), con soporte de los formatos `bfloat4_b` y `bfloat8_b`.
- Integración con tt-transformers (tt-metal v0.81.1) usando `--use_hf_rope` y configuraciones de precisión mixta por capa.
- Compatibilidad con tt-forge (tt-xla) en bf16 exacto; la opción `bfp_bf4` de tt-forge no es adecuada para estos pesos.
- Capacidades multimodales (visión, vídeo, audio): no disponibles en esta variante, que es solo texto.
- Tool calling, function calling y modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de cuantización BFP4 en simulador: usar `pack_tensix.py` y `verify_grid.py` para comprobar que el redondeo GPTQ a 4,5 bits no altera los valores al empaquetar en TT-NN, antes de comprometer hardware.
- Prototipado en NPU Tenstorrent: desplegar el modelo con tt-transformers v0.81.1 y la configuración de precisión mixta indicada (bfp4 en ff1_3, ff2, wqkv y wo; bfp8 en kv_cache) para medir rendimiento batch-1 en Wormhole o Blackhole.
- Investigación en formatos block floating point: servir como referencia reproducible de un pipeline GPTQ con búsqueda de exponente por bloque calibrado sobre WikiText-2 y Wikipedia en coreano.
- Generación de texto en pipelines de transformers: cargar el modelo en bf16 con `device_map="auto"` para tareas de chat o respuesta a preguntas en GPU convencional, aprovechando que los valores ya están en la rejilla BFP4.
- Base para comparativas de fidelidad numérica: contrastar la salida en bf16 con la del modelo original de NVIDIA para validar que el renombrado de tensores al esquema Qwen3 no introduce divergencias.
- Estudio de portabilidad de modelos Qwen3 a aceleradores: emplear el renombrado a `Qwen3ForCausalLM` como plantilla para portar otros checkpoints de la familia a TT-NN.
- Docencia y experimentación con cuantización extrema: analizar el compromiso entre 4,5 bits por peso en proyecciones y bf16 en embedding y LM head, con un peso empaquetado de 6,40 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo afirma que, sobre texto, el modelo coincide exactamente con el código de NVIDIA en bf16, y que el empaquetado BFP4 y BFP8 no altera ningún valor; no se aportan métricas de calidad (MMLU, HumanEval, GSM8K) ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada con pesos empaquetados en BFP4: 6,40 GB empaquetados, aunque la carga en `transformers` se hace en bf16 y ocupa el tamaño completo.
- GPU consumer: cabe en tarjetas de 24 GB o más (por ejemplo, RTX 3090 o RTX 4090) en bf16; en configuraciones de 16 GB requeriría cuantización adicional no incluida en el repositorio.
- GPU de centro de datos: A100, H100 y similares para inferencia en bf16 con `device_map="auto"`.
- Aceleradores objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole) mediante TT-NN 0.81.1; probado únicamente en `ttsim`, el simulador de Blackhole, no en hardware real.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM`), tt-transformers (tt-metal v0.81.1, demo `simple_text_demo.py`) y tt-forge (tt-xla, en bf16 exacto). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4 | 8,19 mil millones | no disponible | BFP4 (4,5 bits) + bf16 | openmdw-1.1 | Hugging Face, probado solo en simulador |
| nvidia/Cosmos3-Nano (base) | no disponible en la información | no disponible | bf16 | no disponible en la información | Hugging Face |
| Qwen3 (familia, esquema de carga) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del modelo base de NVIDIA más allá de su identificador, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: el autor indica que solo se ha probado en `ttsim` (simulador de Blackhole) y no en hardware Tensix real.
- Solo texto: excluye el codificador de visión, el VAE de vídeo y el tokenizador de audio del Cosmos3-Nano original.
- El tokenizador es el de NVIDIA y `transformers` advierte sobre su regex; hay que cargarlo como lo hace el pipeline de NVIDIA.
- En tt-transformers es obligatorio pasar `--use_hf_rope`; sin ello, el QKV fusionado se recuantiza y se pierde exactitud.
- La demo de tt-transformers empaqueta el LM head en bfloat8_b, por lo que el head no es exacto en ese escenario.
- La opción `bfp_bf4` de tt-forge recuantiza con un layout de bloques distinto; para pesos de 4,5 bits hay que usar tt-transformers.
- tt-forge no se ha ejecutado de extremo a extremo según la model card.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al derivar de un modelo base sin ficha de evaluación publicada, no hay garantías declaradas.
- Idiomas soportados: no disponibles; el calibrado de GPTQ usó WikiText-2 (inglés) y Wikipedia en coreano, lo que no implica cobertura lingüística declarada.
- Licencia OpenMDW-1.1: deben revisarse sus términos antes de uso comercial; la ficha no detalla restricciones adicionales.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia del modelo: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4/blob/main/LICENSE
