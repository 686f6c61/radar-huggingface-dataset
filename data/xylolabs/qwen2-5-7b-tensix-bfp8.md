# Xylolabs/Qwen2.5-7B-Tensix-BFP8

## Resumen

Qwen2.5-7B-Tensix-BFP8 es una versión cuantizada de Qwen/Qwen2.5-7B publicada por Xylolabs, orientada específicamente a la ejecución sobre las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo mantiene la arquitectura original de Qwen2.5-7B (transformer denso de 7.615.616.512 parámetros) pero sustituye el formato de sus capas lineales por `ttnn.bfloat8_b` (BFP8, block floating point de 8,5 bits por peso), de forma que TT-NN puede empaquetar los tensores directamente sin recuantización en tiempo de carga.

La motivación es práctica: los aceleradores Tensix trabajan de forma nativa con formatos de bloque BFP8/BFP4, y un checkpoint estándar en bf16 obliga a conversiones costosas o a recompilaciones. Este checkpoint entrega los pesos ya "en la rejilla" BFP8, con los tensores restantes (embeddings, LM head, normas) en bf16, lo que da una media de 9,57 bits por peso y un tamaño empaquetado de 9,11 GB frente a los 15,23 GB del original.

Es relevante para quien despliegue modelos en hardware Tenstorrent y quiera conservar la fidelidad del modelo base con un consumo de memoria notablemente menor. La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Conviene señalar que el autor declara haber probado el flujo solo en el simulador ttsim (Blackhole), no en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), capas lineales en BFP8 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q/k/v/o y gate/up/down de las 28 capas; bf16 en embeddings, LM head, normas y resto de tensores; 9,57 bits por peso de media |
| Idiomas soportados | en (segun la model card); el calibrado incluyo texto en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 ya situados en la rejilla BFP8); incluye `quant4.json` con el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Qwen2.5, con 28 capas y 7.615.616.512 parametros. No hay reentrenamiento: se parte de Qwen/Qwen2.5-7B y se aplica GPTQ restringido a la rejilla de bloque bfloat8_b, de modo que cada bloque comparte exponente tal y como lo fija el empaquetador de TT-NN. Las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) de las 28 capas quedan en BFP8 a 8,5 bits por peso; el resto de tensores permanece en bf16. El calibrado uso 65.536 tokens de WikiText-2 y de Wikipedia en coreano.

La innovacion tecnica central es el formato: los ficheros son bf16, pero cada valor ya esta situado en la rejilla BFP8, por lo que TT-NN los empaqueta sin transformacion adicional y sin perdida. El repositorio incluye ademas utilidades de verificacion (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que ningun valor cambia tras el empaquetado. El autor indica compatibilidad con tt-transformers (tt-metal v0.81.1) y con tt-forge (tt-xla), aunque ninguna de las dos rutas se ha probado con este checkpoint; para tt-transformers recomienda `--use_hf_rope` y `--instruct 0`, y para tt-forge advierte de que por defecto mantiene bf16 y que sus opciones `bfp_bf8`/`bfp_bf4` recuantizan en el layout [out, in] de PyTorch.

## Capacidades

- Generacion de texto en modo completado: es el checkpoint preentrenado, no ajustado por instrucciones; continua texto en lugar de seguir ordenes.
- Razonamiento y conocimiento general heredados de Qwen2.5-7B (sin datos de benchmarks propios en la informacion disponible).
- Generacion de codigo y matematicas: capacidades del modelo base, no verificadas de forma independiente en esta ficha.
- Plantilla de chat: el tokenizador conserva la plantilla del modelo base, aunque el modelo no esta alineado para dialogo.
- Multilingue limitado: la model card declara solo `en`; el calibrado incluyo coreano, pero no se documenta soporte oficial de otros idiomas.
- Sin soporte documentado de tool calling, function calling, agentes ni modo thinking en la informacion proporcionada.
- Sin vision ni audio.
- Ejecucion nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos listos para empaquetar.

## Casos de uso

- Despliegue en hardware Tenstorrent: cargar el checkpoint directamente en TT-NN sobre Wormhole o Blackhole sin pasos de recuantizacion, aprovechando que los pesos ya estan en la rejilla BFP8 y el empaquetado es una operacion sin perdida.
- Reduccion de huella de memoria en aceleradores: los 9,11 GB empaquetados frente a los 15,23 GB en bf16 permiten alojar el modelo en configuraciones de DRAM mas ajustadas dentro de la NPU.
- Generacion de texto por completado en pipelines internos: al ser un modelo preentrenado, encaja en tareas de continuacion, resumen extractivo o generacion de borradores donde no se requiere seguir instrucciones.
- Validacion de flujos de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP8 no altera ningun valor, util como referencia en la cadena de herramientas propia.
- Experimentacion con tt-forge/tt-xla: sirve como checkpoint de partida para probar las opciones `bfp_bf8` y `bfp_bf4` del compilador, teniendo en cuenta que esa ruta aun no se ha validado con este modelo.
- Investigacion sobre fidelidad de cuantizacion: la tabla de evaluacion (KL medio de 0,00133 frente a bf16, top-1 del 98,20 %) permite comparar el efecto de distintos esquemas de cuantizacion sobre el mismo checkpoint base.
- Base para ajuste posterior: con licencia Apache 2.0 y pesos en safetensors, puede servir de punto de partida para fine-tuning, aunque habria que tener en cuenta el formato BFP8 de las capas lineales al reentrenar.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al modelo en bf16, no la calidad de tarea. KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato de completado y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-7B) | 16 | 15,23 | 0 | 100 | 26 de 28 | - |
| Qwen2.5-7B-Tensix-BFP8 | 9,57 | 9,114 | 0,00133 | 98,20 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03655 | 90,81 | 25 de 28 | 0 |

El autor fija como criterio de aceptacion un KL medio maximo de 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; el modelo cumple con 0,04 veces el KL de Q4_K_M y 0 respuestas perdidas. No se midio velocidad en dispositivo ni se publican resultados de tareas estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,11 GB empaquetados en BFP8; el repositorio ocupa 15,2 GB porque los ficheros se almacenan en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). El autor probo el flujo con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no en hardware fisico.
- GPUs convencionales: no es el destino del checkpoint; puede cargarse en transformers con `dtype="bfloat16"` y `device_map="auto"`, pero sin la ventaja del empaquetado BFP8.
- Despliegue: TT-NN (empaquetado directo), tt-transformers (tt-metal v0.81.1, solo en 2 o 4 chips, ruta no probada), tt-forge/tt-xla (no probado con este checkpoint), transformers como via de referencia.
- Latencia y throughput: no disponibles; el autor no midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Tensix-BFP8 | 7,62 B | no disponible | BFP8, 9,57 bits | Apache 2.0 | Especifico para NPU Tensix; KL 0,00133 vs bf16 |
| Qwen/Qwen2.5-7B (bf16) | 7,62 B | no disponible | bf16, 16 bits | Apache 2.0 | Referencia de fidelidad; 15,23 GB |
| Qwen2.5-7B en Q4_K_M (llama.cpp) | 7,62 B | no disponible | GGUF, 4,91 bits | Apache 2.0 | 4,68 GB; KL 0,03655 vs bf16; pensado para CPU/GPU |

No se dispone de informacion sobre otras alternativas cuantizadas para Tensix con las que comparar directamente.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: responde en modo completado y no sigue ordenes; la plantilla de chat del tokenizador no implica alineacion.
- Los benchmarks publicados miden fidelidad frente a bf16, no calidad de tarea; no hay resultados de MMLU, HumanEval ni similares en la informacion disponible.
- El flujo de ejecucion en Tensix se ha validado solo en el simulador ttsim, no en hardware real; el rendimiento y la correccion en dispositivo no estan confirmados.
- Las rutas tt-transformers y tt-forge no se han probado con este checkpoint; en tt-transformers es obligatorio `--use_hf_rope` para evitar la recuantizacion del QKV fusionado.
- Idioma oficial declarado: solo ingles; el coreano aparece en el calibrado pero no como idioma soportado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; se heredan los del modelo base Qwen2.5-7B.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "tal cual", sin garantia, y declara no estar afiliado ni respaldado por Tenstorrent.
- Almacenamiento: el repo pesa 15,2 GB aunque el modelo empaquetado ocupe 9,11 GB, por lo que la descarga y el almacenamiento requieren mas espacio del que sugiere el tamano efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper citado en los tags (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
