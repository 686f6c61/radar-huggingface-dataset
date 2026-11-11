# Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP8

## Resumen

Ministral-3-14B-Instruct-2512-Tensix-BFP8 es una cuantización del modelo de texto Ministral-3-14B-Instruct-2512-BF16 de Mistral AI, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El checkpoint conserva los pesos en bf16, pero cada valor ya está redondeado a la rejilla de punto flotante por bloques `bfloat8_b` (BFP8), de modo que TT-NN puede empaquetarlos sin volver a redondear. Se distribuye con licencia Apache 2.0.

El modelo base es un transformer denso de 13.506.073.600 parámetros (unos 13,5 mil millones), afinado para instrucciones y con capacidades conversacionales multilingües en once idiomas (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe). La cuantización aplica GPTQ sobre las proyecciones de atención (q, k, v, o) y de la MLP (gate, up, down) en las 40 capas, dejando la cabeza LM, los embeddings y las normas en bf16.

Su relevancia radica en que es un artefacto de despliegue para hardware Tenstorrent: reduce el peso empaquetado a 15,61 GB (9,25 bits por peso de media) frente a los aproximadamente 27 GB del checkpoint BF16, manteniendo una fidelidad cercana al original. No obstante, conviene señalar que el autor solo lo ha probado en el simulador Blackhole (ttsim) con ttnn 0.81.1, no en hardware físico, y que la torre de visión del modelo base ha sido eliminada, por lo que es un modelo exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Ministral 3, `Ministral3ForCausalLM`), 40 capas |
| Parametros totales | 13.506.073.600 (13,5 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el README menciona escalado de query para posiciones mas alla de 16.384) |
| Tipos de cuantizacion | GPTQ sobre rejilla BFP8 (`bfloat8_b`); 8,5 bits por peso en capas lineales, 9,25 bits de media; `quant4.json` documenta el formato por proyeccion |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya en la rejilla BFP8); compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 40 capas con atención multi-cabeza y MLP estándar, derivado del checkpoint BF16 de Mistral AI. La intervención de Xylolabs no consiste en un reentrenamiento, sino en una cuantización post-entrenamiento con GPTQ aplicada sobre las proyecciones lineales de atención (q, k, v, o) y de la MLP (gate, up, down). El resto de tensores (cabeza LM, embeddings, normas) permanece en bf16 tal como en el modelo base.

El proceso de calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, y el exponente compartido de cada bloque se fija según el propio empaquetador de TT-NN. El resultado son pesos que, aunque almacenados en bf16, ya se sitúan exactamente sobre la rejilla `bfloat8_b`, de modo que el empaquetado en la NPU es una operación sin pérdida adicional. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento, el volumen de tokens ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct de Mistral AI.
- Razonamiento y respuesta a preguntas en once idiomas, incluidos español, francés, alemán, italiano, portugués y neerlandés, además de chino, japonés, coreano y árabe.
- Integración con el ecosistema `transformers` mediante `AutoModelForCausalLM` y plantilla de chat (`apply_chat_template`).
- Despliegue en NPU Tensix mediante TT-NN (`ttnn.bfloat8_b`), con soporte de empaquetado verificable y round-trip a DRAM del dispositivo.
- Compatibilidad con el pipeline `text-generation` y con endpoints compatibles.
- Capacidad de visión: no disponible (la torre de visión y su proyector fueron eliminados en esta cuantización).
- Soporte de tool calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está empaquetado para que TT-NN lo cargue directamente en DRAM sin re-redondeo, lo que lo hace adecuado para servir inferencia de texto en estas NPU con un consumo de memoria de 15,61 GB.
- Servicio de chat multilingüe: al cubrir once idiomas, puede atender conversaciones en español, francés, alemán o árabe desde un único modelo, útil en productos con audiencias internacionales.
- Inferencia en pipelines de `transformers`: la carga estándar con `dtype="bfloat16"` y `device_map="auto"` permite usarlo como cualquier modelo causal en GPU, sin necesidad de código específico de Tenstorrent.
- Validación y benchmarking de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada coincide con el original, lo que lo convierte en una referencia para evaluar la fidelidad de BFP8 frente a BF16.
- Generación de texto en entornos con restricciones de memoria: al reducir el peso empaquetado a 15,61 GB frente a los ~27 GB del BF16, facilita el despliegue en nodos con menos memoria disponible.
- Prototipado de asistentes conversacionales: la plantilla de chat y el formato Instruct permiten construir rápidamente demos de atención al cliente o asistentes internos con contexto multi-turno.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial (columnas de bits por peso, tamaño, KL medio frente a BF16 y Top-1), pero los valores numéricos no están disponibles en la información proporcionada. El único dato de rendimiento concreto es que una prueba de prefill de 2 capas coincidió con `transformers` con un PCC de 0,9989.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,61 GB de pesos empaquetados en BFP8; en GPU con `transformers` se carga en bf16, por lo que requiere aproximadamente 27 GB de memoria para los pesos.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 24 GB o más (RTX 3090, RTX 4090) para la carga en bf16.
- NPU objetivo: Tenstorrent Wormhole y Blackhole con TT-NN; probado únicamente en el simulador Blackhole (ttsim) con ttnn 0.81.1, no en hardware físico.
- Despliegue: `transformers` (verificado), `tt-metal` v0.81.1 con `tt-transformers` (demo de texto con `--use_hf_rope`), `tt-forge` (tt-xla, aún no probado con este checkpoint). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP8 | 13,5 B | no disponible | BFP8 (GPTQ) | Apache 2.0 | Orientado a NPU Tensix; solo texto |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5 B | no disponible | BF16 | Apache 2.0 (segun modelo base) | Modelo base, incluye vision; ~27 GB |
| Otros modelos de ~14 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo texto: la torre de visión y su proyector han sido eliminados, por lo que no puede procesar imágenes.
- Validación limitada: el autor solo lo ha probado en el simulador Blackhole (ttsim), no en hardware Tensix real; el rendimiento en dispositivo físico no está verificado.
- `tt-transformers` no implementa el escalado de query de Ministral 3 para posiciones superiores a 16.384, lo que puede degradar la calidad en contextos largos.
- El demo de `tt-transformers` empaqueta la cabeza LM en `bfloat8_b`, por lo que la cabeza en bf16 de este checkpoint no es exacta en ese entorno.
- `tt-forge` (tt-xla) no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores y pueden introducir pérdida adicional.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero heredados del modelo base de Mistral AI.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y las atribuciones requeridas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP8/blob/main/LICENSE
