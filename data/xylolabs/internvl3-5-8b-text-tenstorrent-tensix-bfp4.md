# Xylolabs/InternVL3.5-8B-Text-Tenstorrent-Tensix-BFP4

## Resumen

InternVL3.5-8B-Text-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo de lenguaje de InternVL3.5-8B, desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory). El modelo base InternVL3.5 es una familia de modelos multimodales open source presentada en agosto de 2025 que introduce el marco Cascade Reinforcement Learning (Cascade RL) para mejorar la versatilidad, la capacidad de razonamiento y la eficiencia de inferencia. Esta variante concreta, publicada por Xylolabs, contiene unicamente la torre de lenguaje del modelo, es decir, un decoder de 36 capas de estilo Qwen3 con 8.190.735.360 parametros, sin la torre de vision ni el proyector multimodal.

La particularidad de esta publicacion es su destino de despliegue: las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) de las 36 capas estan cuantizadas a `bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ con busqueda de exponente por bloque, mientras que el LM head, los embeddings y las normas permanecen en bf16. El checkpoint empaquetado ocupa 6,397 GB frente a los 16,38 GB en bf16 del modelo original.

Es relevante ahora porque demuestra que es posible comprimir un modelo de 8B a 4 bits por bloque manteniendo una fidelidad cercana a bf16 (KL media de 0,0486 frente a bf16, inferior a la de una cuantizacion Q4_K_M de llama.cpp) y porque abre la puerta a ejecutar modelos de lenguaje de tamano medio en hardware de inferencia alternativo al ecosistema GPU tradicional. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 36 capas estilo Qwen3 (`Qwen3ForCausalLM`) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atencion y MLP; bf16 en LM head, embeddings y normas |
| Idiomas soportados | multilingue (sin listado cerrado en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16; empaquetado nativo Tensix via TT-NN) |

## Arquitectura y entrenamiento

El modelo es la mitad textual de InternVL3.5-8B: un decoder transformer de 36 capas con atencion y MLP convencionales, cargable directamente como `Qwen3ForCausalLM` sin codigo remoto. La cuantizacion se aplico con GPTQ y una busqueda de exponente por bloque sobre las proyecciones q, k, v, o, gate, up y down de las 36 capas, dando lugar a un formato block floating point de 4 bits (`bfloat4_b`). El resto de tensores (q_norm, k_norm, normas de entrada y post-atencion, embedding y LM head) se mantienen en bf16 tal como en el modelo base. El fichero `quant4.json` documenta el formato de cada proyeccion.

El modelo base InternVL3.5 fue entrenado por OpenGVLab e introduce Cascade Reinforcement Learning (Cascade RL) como innovacion principal para mejorar el razonamiento y la versatilidad multimodal. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF/DPO del modelo original. La cuantizacion de Xylolabs no reentrena el modelo: solo transforma los pesos, y se valida comparando la distribucion de salida contra una pasada bf16 propia sobre 15.976 posiciones de texto en ingles y coreano, en formato plano y de chat.

## Capacidades

- Generacion de texto conversacional multilingue (el modelo base declara soporte multilingue).
- Razonamiento y respuesta a preguntas en formato chat mediante la plantilla de chat heredada del repositorio base.
- Capacidades del modelo base InternVL3.5-8B en su vertiente de lenguaje; las capacidades multimodales (vision, video) no estan incluidas en este repositorio.
- Carga nativa con `transformers` como modelo de causal LM, sin dependencia de codigo remoto.
- Despliegue en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado de pesos verificado tensor a tensor.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking) en esta variante.

## Casos de uso

- Inferencia en hardware Tenstorrent: el caso de uso principal es ejecutar un modelo de 8B en NPU Tensix (Wormhole o Blackhole) con pesos ya empaquetados en BFP4, reduciendo la huella de memoria a 6,397 GB y aprovechando el soporte nativo de `bfloat4_b` en TT-NN.
- Asistentes conversacionales multilingues en entornos con GPU limitada: al ocupar menos de la mitad que la version bf16, permite servir chat multi-turno en aceleradores de menor capacidad, siempre que se acepte la perdida de fidelidad medida (KL 0,0486).
- Prototipado de pipelines de cuantizacion: sirve como referencia para validar flujos GPTQ con exponente por bloque y herramientas como `pack_tensix.py` y `verify_grid.py`, que comprueban que ningun valor cambia al empaquetar.
- Investigacion en formatos block floating point: util para estudiar el compromiso entre tamano, fidelidad (top-1 del 89,90 % frente a bf16) y coste de despliegue en aceleradores con soporte BFP4.
- Generacion de texto en ingles y coreano: la evaluacion publicada cubre ambas lenguas, por lo que es adecuado para aplicaciones en esos idiomas con requisitos de memoria ajustados.
- Despliegue en entornos sin GPU NVIDIA: al estar orientado a Tensix, encaja en infraestructuras basadas en tarjetas Tenstorrent donde no se dispone de CUDA.
- Base para experimentos de destilacion o evaluacion comparativa frente a Q4_K_M: al compartir checkpoint de origen con una cuantizacion llama.cpp, permite comparar calidad y tamano en igualdad de condiciones.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de fidelidad de la cuantizacion frente a bf16 y frente a una Q4_K_M de llama.cpp, evaluadas sobre 15.976 posiciones de texto en ingles y coreano (formato plano y chat).

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 33 |
|---|---:|---:|---:|---:|
| BF16 (mitad textual de InternVL3_5-8B) | 16,38 | 0 | 100 | - |
| Este modelo (BFP4) | 6,397 | 0,04864 | 89,90 | 28 |
| Q4_K_M (llama.cpp v0.9.0) | 5,03 | 0,05391 | 89,30 | 29 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 6,397 GB para los pesos empaquetados en BFP4 en Tensix; en `transformers` el checkpoint se carga como bf16 y ocupa aproximadamente 16,4 GB en memoria.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante tt-metal y TT-NN.
- GPU consumer: no se documenta soporte especifico; la carga via `transformers` es posible en GPU con suficiente memoria (16 GB o mas en bf16), pero el formato BFP4 solo se aprovecha en Tensix.
- Opciones de despliegue: TT-NN para Tensix (empaquetado con `pack_tensix.py`); `transformers` para carga generica. tt-transformers y tt-forge no se han probado con este checkpoint segun la model card. No se menciona soporte de vLLM, llama.cpp u Ollama para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (InternVL3.5-8B Text BFP4) | 8,19B | no disponible | 6,397 GB (BFP4) | Apache 2.0 | Solo texto, orientado a Tensix |
| InternVL3.5-8B (base, bf16) | 8,19B (mitad textual) | no disponible | 16,38 GB (mitad textual) | Apache 2.0 | Modelo multimodal completo |
| Q4_K_M de llama.cpp del mismo checkpoint | 8,19B | no disponible | 5,03 GB | Apache 2.0 | Cuantizacion de referencia; KL 0,05391 |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cognitivo con otras familias de modelos de 8B.

## Limitaciones y advertencias

- Solo texto: la torre de vision, el proyector y las entradas de imagen o video no estan incluidos; no puede usarse para tareas multimodales.
- Perdida de fidelidad respecto a bf16: KL media de 0,04864 y top-1 del 89,90 %, con 28 de 33 respuestas correctas frente a la referencia bf16.
- El rendimiento optimo depende de Tensix: fuera de NPU Tenstorrent, el checkpoint se carga en bf16 y se pierde la ventaja de tamano; tt-transformers y tt-forge no se han validado con este checkpoint.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones adicionales en esta variante.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Cobertura idiomatica: la evaluacion se limita a ingles y coreano; el resto de idiomas multilingues no esta medido.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base OpenGVLab/InternVL3_5-8B antes de desplegar en produccion.
- No se documenta soporte de tool calling ni de modo de razonamiento extendido, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/InternVL3.5-8B-Text-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-8B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de InternVL3.5: https://arxiv.org/abs/2508.18265
