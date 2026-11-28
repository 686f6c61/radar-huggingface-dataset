# Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 E2B IT es un modelo multimodal de Google (familia Gemma 4) publicado bajo licencia Apache 2.0. Esta ficha concreta, `Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8`, es una cuantización del checkpoint instruct original realizada por Xylolabs para ejecutarse en aceleradores Tenstorrent Tensix (Wormhole y Blackhole), no en GPU convencionales. El pipeline declarado es `any-to-any`, lo que indica entrada y salida multimodal (texto, imagen y audio), aunque la model card no detalla las capacidades exactas del modelo base.

La cuantización emplea GPTQ sobre la rejilla `bfloat8_b` (BFP8, block floating point) de Tenstorrent: las proyecciones de atención y MLP se almacenan en BFP8, mientras que el LM head, los embeddings, las normas y las torres de visión y audio permanecen en bf16. El resultado empaquetado ocupa 7,556 GB frente a 9,29 GB en bf16, con una degradación medida muy baja (KL medio a bf16 de 0,00239 y top-1 del 98,29 % sobre 7.968 posiciones de inglés y coreano).

Su relevancia es doble: por un lado, es una de las primeras publicaciones de pesos Gemma 4 cuantizados para hardware NPU de Tenstorrent; por otro, demuestra que una cuantización de 8 bits en bloque puede superar ampliamente a Q4_K_M de llama.cpp en fidelidad respecto al modelo original (KL 0,00239 frente a 0,29329) ocupando más del doble de espacio. El repositorio tiene 215 descargas y ningún like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4); atención y MLP cuantizados, torres de visión y audio en bf16 |
| Parametros totales | 5.525.831.235 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`. Existe una variante BFP4 para MLP |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`); empaquetado adicional para Tensix (7,556 GB) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 descrito en el informe técnico arXiv:2607.02770. La model card no reproduce los detalles de arquitectura del original (número de capas completo, mecanismo de atención, composición del dataset ni si hubo RLHF o DPO); solo se deduce del listado de tensores cuantizados que la red contiene al menos 35 capas con proyecciones de atención q, o, gate, up y down, y 15 capas con proyecciones k, v, además de torres separadas de visión y audio con sus embeddings correspondientes.

La innovación de esta ficha es el proceso de cuantización: GPTQ aplicado directamente sobre la rejilla block-floating-point `bfloat8_b` de Tenstorrent, con verificación de cada matriz mediante `pack_tensix.py` (que comprueba el round-trip a través de DRAM del dispositivo con `--device`) y `verify_grid.py`. El fichero `quant4.json` documenta el formato asignado a cada proyección. No se especifica el número de tokens de calibración ni la composición del conjunto de calibración usado en GPTQ.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (`apply_chat_template`), tal como muestra el ejemplo de la model card.
- Entrada multimodal: el pipeline `any-to-any` y la presencia de `vision_tower`, `embed_vision`, `audio_tower` y `embed_audio` indican soporte de imagen y audio además de texto.
- Cuantización selectiva: mantiene en bf16 las partes sensibles (embeddings, LM head, normas y torres multimodales) para preservar calidad.
- Ejecución en `transformers` con `dtype="bfloat16"` y `device_map="auto"`, además del empaquetado nativo para Tensix.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking ni cobertura multilingüe explícita.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: despliegue del modelo en NPU Wormhole o Blackhole usando `ttnn` y los kernels de `tensix-kernels`, aprovechando el empaquetado BFP8 de 7,556 GB para ajustarse a la DRAM disponible del dispositivo.
- Validación de pipelines de cuantización: servir como referencia reproducible para comparar GPTQ sobre `bfloat8_b` frente a otros esquemas (Q4_K_M) midiendo KL y top-1 con `verify_grid.py`.
- Prototipado multimodal en `transformers`: cargar el checkpoint con `AutoModelForCausalLM` y `AutoTokenizer` para probar entradas de texto, imagen y audio sin necesidad de hardware Tenstorrent.
- Investigación en eficiencia de cuantización: estudiar la degradación por capa comparando `quant4.json` con la evaluación agregada, útil para decidir qué proyecciones mantener en bf16.
- Evaluación comparativa de hardware: medir latencia y throughput de un modelo de 5.525 millones de parámetros en NPU frente a GPU con el mismo checkpoint en bf16.
- Base para variantes de menor huella: la propia model card recomienda la versión BFP4 (`gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP`) para dispositivos con menos memoria, lo que permite escalar el despliegue según el hardware.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 9,29 | 0 | 100 |
| **Este modelo (BFP8)** | 7,556 | 0,00239 | 98,29 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

La evaluación cubre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. Q4_K_M se generó del mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `fd8eb490a907ff085938760a39fac78eaebc43a9ce3963492f6261fde3931c04`. No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en `transformers`: el repo ocupa 11,1 GB y el modelo se carga en bf16 con `device_map="auto"`; se requiere memoria suficiente para los tensores bf16 más los BFP8, del orden de 10-12 GB en GPU.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole mediante `ttnn`, con empaquetado de 7,556 GB en DRAM del dispositivo.
- GPU consumer: no se documentan requisitos oficiales; por tamaño, una RTX 4090 (24 GB) o similar podría alojarlo en bf16, pero no hay cifras publicadas.
- Despliegue: `transformers` (soporte declarado), `ttnn` con `tensix-kernels` y `tensix-runner` v0.1.0 para Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Hardware |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 5.525.831.235 | no disponible | 7,556 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-E2B-it` (BF16) | no disponible en la ficha | no disponible | 9,29 GB | Apache 2.0 | GPU/CPU |
| `Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP` | no disponible | no disponible | no disponible | Apache 2.0 | Tensix |
| Q4_K_M de llama.cpp (mismo checkpoint) | 5.525.831.235 | no disponible | 3,428 GB | Apache 2.0 | CPU/GPU |

La comparativa se limita a variantes del mismo checkpoint porque la información disponible no incluye datos de modelos de otros autores. En fidelidad al BF16, este modelo (KL 0,00239) supera a Q4_K_M (KL 0,29329) a costa de ocupar 7,556 GB frente a 3,428 GB.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación en tareas de razonamiento; no hay datos para cuantificarlos.
- La evaluación de calidad se limita a KL y top-1 sobre texto inglés y coreano; no cubre multimodalidad, código ni matemáticas, por lo que el rendimiento en esas áreas es desconocido.
- El modelo está pensado para Tensix; ejecutarlo en `transformers` requiere reconstruir los tensores BFP8 y puede no reproducir exactamente el comportamiento del empaquetado nativo.
- La licencia Apache 2.0 se declara según la model card del modelo base, pero el repositorio original no incluye fichero LICENSE; el `LICENSE` de este repo contiene el texto estándar y los cambios se listan en `NOTICE`.
- No se especifican longitud de contexto, idiomas soportados ni detalles de entrenamiento (RLHF/DPO), lo que limita la evaluación para producción.
- El número de descargas (215) y la ausencia de likes indican poca validación comunitaria; conviene verificar los pesos con `verify_grid.py` antes de usarlos.
- Para dispositivos con menos memoria, la model card recomienda la variante BFP4, que presumiblemente introduce mayor degradación (no cuantificada en esta información).

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Informe técnico Gemma 4: https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
