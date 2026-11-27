# Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen2.5-14B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo Qwen2.5-14B de Alibaba, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa del Qwen2.5-14B original, con 14.770.033.664 parametros, pero redistribuye la precision de sus tensores para reducir el peso a 13,756 GB frente a los 29,54 GB en bf16.

La innovacion principal es el uso de formatos de coma flotante por bloques (BFP, block floating point): las proyecciones gate y up del MLP se cuantizan a `bfloat4_b` (4 bits) mediante GPTQ con busqueda de exponente por bloque, mientras que las proyecciones de atencion (q, k, v, o) y la proyeccion down del MLP se cuantizan a `bfloat8_b` (8 bits) por redondeo al mas cercano. El LM head, los embeddings y las normalizaciones permanecen en bf16. Esto produce un modelo mixto de 4 y 8 bits que mantiene una fidelidad cercana al original: la divergencia KL media respecto a bf16 es de 0,08835 frente a 0,07985 del Q4_K_M de llama.cpp, y el top-1 es del 91,50 % frente al 91,31 % del Q4_K_M.

Es relevante porque permite ejecutar un modelo de 14B parametros en hardware de inferencia especializado de Tenstorrent, un acelerador alternativo a las GPU convencionales, con un empaquetado de pesos que se integra directamente en el stack `ttnn`/`tt-metal`. No obstante, se trata del modelo preentrenado: no esta afinado para instrucciones y solo continua texto, por lo que su uso en produccion requiere ajuste adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up; BFP8 (`bfloat8_b`) en atencion y MLP down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (ingles declarado; evaluacion incluye coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 13,756 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B es un transformer denso de tipo decoder-only con 48 capas, segun se deduce del esquema de cuantizacion (48 capas en atencion y MLP). La cuantizacion de Xylolabs no modifica la arquitectura: aplica GPTQ con busqueda de exponente por bloque a las proyecciones gate y up del MLP en formato `bfloat4_b`, y redondeo al mas cercano para atencion (q, k, v, o) y MLP down en `bfloat8_b`. El resto de tensores (LM head, embeddings, normas) se mantienen en bf16 tal como en el modelo original. El archivo `quant4.json` documenta el formato de cada proyeccion.

No se proporcionan datos sobre el entrenamiento original del Qwen2.5-14B (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible. La model card indica explicitamente que este artefacto es el modelo preentrenado, no afinado para instrucciones, por lo que no ha habido un post-entrenamiento adicional en esta version. La innovacion tecnica destacable es el empaquetado nativo para Tensix: los tensores se transpone y se almacenan en formato que `ttnn` puede cargar directamente en DRAM del dispositivo, con herramientas de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban la ida y vuelta de cada matriz.

## Capacidades

- Generacion de texto y continuacion de texto (modelo preentrenado, no instruct).
- Razonamiento y conocimiento general heredados del Qwen2.5-14B base.
- Generacion de codigo y matematicas (capacidades del modelo base, no verificadas en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado para esta version preentrenada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; requiere afinado para instrucciones.
- Capacidades multilingues: el modelo declara ingles; la evaluacion incluye texto en coreano, lo que sugiere cierta competencia multilingue no declarada formalmente.
- Capacidad especial: empaquetado y ejecucion en NPU Tensix (Wormhole, Blackhole) mediante `ttnn`/`tt-metal`.

## Casos de uso

- Inferencia en hardware Tenstorrent: el modelo esta empaquetado para cargarse directamente en NPU Tensix (Wormhole, Blackhole) mediante `ttnn`, lo que permite desplegar un 14B en aceleradores alternativos a GPU con 13,756 GB de pesos.
- Prototipado de continuacion de texto: al ser preentrenado, es adecuado para tareas de completado, generacion libre y experimentacion con prompts, no para dialogos instruidos.
- Evaluacion de cuantizacion BFP: sirve como referencia para medir la perdida de fidelidad (KL 0,08835, top-1 91,50 %) frente a bf16 y a Q4_K_M en pipelines de investigacion sobre formatos de bloque.
- Investigacion en eficiencia de memoria: con 13,756 GB frente a 29,54 GB en bf16, permite estudiar el impacto de la precision mixta 4/8 bits en tareas de lenguaje.
- Base para afinado posterior: al conservar la licencia Apache 2.0 y el tokenizador y plantilla de chat del modelo base, puede servir de punto de partida para SFT/DPO en entornos con NPU Tensix.
- Despliegue en entornos con restricciones de VRAM/DRAM: la reduccion a menos de la mitad del peso facilita la ejecucion en dispositivos con memoria limitada, siempre que se disponga del stack Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B) | 29,54 | 0 | 100 |
| Este modelo (BFP4 GateUp) | 13,756 | 0,08835 | 91,50 |
| Q4_K_M (llama.cpp) | 8,988 | 0,07985 | 91,31 |

Los valores de KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano). Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,756 GB de pesos empaquetados para Tensix; en bf16 el modelo base ocupa 29,54 GB.
- GPU recomendadas: no aplica directamente; el destino son NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecucion en GPU convencional se requeriria conversion a otro formato, no incluida.
- Cabe en consumer GPU: no confirmado para este empaquetado; en bf16 no cabe en GPU de consumo de 24 GB, y el formato BFP Tensix no es directamente compatible con CUDA.
- Opciones de despliegue: `ttnn` 0.81.1 (probado en ttsim, simulador Blackhole), `tt-metal`, `tt-forge`; herramientas `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0. La carga via `transformers` esta soportada para inspeccion, pero la ejecucion optimizada es en Tensix.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 GateUp) | 14,77B | no disponible | BFP4/BFP8 Tensix, 13,756 GB | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-14B (bf16) | 14,77B | no disponible | bf16, 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 14,77B | no disponible | GGUF Q4_K_M, 8,988 GB | Apache 2.0 | generado localmente |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M usada como referencia en la evaluacion; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es el modelo preentrenado: no esta afinado para instrucciones ni para dialogo; solo continua texto.
- Riesgo de alucinacion inherente al modelo base, no mitigado por esta cuantizacion.
- La cuantizacion introduce perdida de fidelidad: KL media 0,08835 y top-1 91,50 % frente a bf16, ligeramente peor que Q4_K_M en KL pero ligeramente mejor en top-1.
- El formato BFP Tensix no es portable a GPU convencional sin conversion adicional.
- Idioma declarado solo ingles; el soporte multilingue no esta garantizado formalmente.
- No se dispone de datos sobre sesgos conocidos ni sobre el dataset de entrenamiento original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- La evaluacion se realizo en ttsim (simulador), no en hardware fisico, segun la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
