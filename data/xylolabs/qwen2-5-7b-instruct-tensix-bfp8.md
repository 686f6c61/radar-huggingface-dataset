# Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8 es una cuantizacion del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, adaptada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en redondear las capas lineales del transformer a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que TT-NN pueda empaquetar los pesos directamente en la NPU sin un redondeo adicional en tiempo de carga.

El modelo conserva la arquitectura original de Qwen2.5-7B-Instruct (transformer denso de 7.615.616.512 parametros, contexto de 32.768 tokens en el modelo base) y mantiene en bf16 el LM head, los embeddings, las normas y el resto de tensores no lineales. El resultado es un checkpoint de 9,11 GB empaquetado, con una media de 9,57 bits por peso, frente a los 15,23 GB del BF16 original.

Su relevancia es fundamentalmente de infraestructura: es un ejemplo practico de cuantizacion consciente del hardware para aceleradores no-GPU, con verificacion de que cada matriz empaquetada se lee sin cambios en la rejilla BFP8. El checkpoint esta pensado para desplegarse sobre Tenstorrent, no como sustituto general del modelo base en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), con capas lineales cuantizadas a BFP8 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o, gate, up y down de las 28 capas; bf16 en LM head, embeddings, normas y resto de tensores. Media de 9,57 bits por peso |
| Idiomas soportados | en (segun la model card); la evaluacion incluye texto en ingles y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, con valores ya situados en la rejilla BFP8); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 28 capas, atencion con RoPE y MLP con proyecciones gate/up/down. Xylolabs no reentrena el modelo; aplica GPTQ sobre la rejilla bfloat8_b de TT-NN para redondear las siete proyecciones lineales de cada una de las 28 capas (q, k, v, o, gate, up, down). El exponente compartido de cada bloque lo fija el propio empaquetador de Tenstorrent, y la calibracion se realiza con 65.536 tokens de WikiText-2 y de Wikipedia en coreano.

La innovacion tecnica es el acoplamiento entre cuantizacion y formato de hardware: los ficheros se guardan en bf16, pero cada valor ya esta en la rejilla BFP8, de modo que TT-NN los empaqueta sin volver a redondear y la verificacion `torch.equal` sobre el tensor empaquetado se cumple de forma exacta. El repositorio incluye `pack_tensix.py` (empaqueta y comprueba cada matriz, con opcion `--device` para pasar por DRAM del dispositivo) y `verify_grid.py` (validacion de la rejilla solo con torch). No se documenta RLHF ni DPO adicional; se heredan los del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredados de Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas propias del modelo base (no se aportan benchmarks especificos en esta ficha).
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno con roles user/assistant.
- Inferencia en transformers con `dtype="bfloat16"` y `device_map="auto"`, util para validacion en GPU/CPU antes del despliegue en NPU.
- Empaquetado y verificacion bit a bit en TT-NN sobre Tensix (Wormhole y Blackhole), con comprobacion de que ningun valor cambia al pasar a la rejilla BFP8.
- Integracion prevista con tt-transformers (tt-metal v0.81.1) y tt-forge (tt-xla), aunque en el momento de publicacion no se han ejecutado con este checkpoint.
- Capacidades multilingues limitadas segun la model card (idioma declarado: en), aunque la calibracion y la evaluacion incluyen coreano.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint esta disenado para que TT-NN lo empaquete sin redondeo adicional, lo que reduce el coste de carga y el error de cuantizacion en inferencia sobre aceleradores Tensix.
- Validacion de pipelines de cuantizacion consciente del hardware: sirve como referencia para comprobar que una matriz GPTQ sobre rejilla BFP8 se lee identica tras el empaquetado, usando `pack_tensix.py` y `verify_grid.py` en CI.
- Servicio de chat en ingles con contexto moderado: al conservar la plantilla de chat de Qwen2.5, puede exponerse como endpoint compatible con text-generation-inference para asistentes conversacionales.
- Evaluacion de perdida de calidad por cuantizacion: con una KL media de 0,00158 frente a BF16 y 28 de 33 respuestas correctas, es util para medir el impacto de BFP8 frente a Q4_K_M en tareas cortas.
- Prototipado en simulador: la model card indica que se probo con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), lo que permite desarrollar kernels y flujos TT-NN sin hardware fisico.
- Base para experimentos de cuantizacion mixta: el fichero `quant4.json` documenta el formato de cada proyeccion, lo que facilita estudiar combinaciones bfp4/bfp8 en capas concretas.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea:

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct) | 16 | 15,23 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP8) | 9,57 | 9,114 | 0,00158 | 98,33 | 28 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,0369 | 91,25 | 27 de 33 | 1 |

Las metricas de KL y top-1 cubren 16.104 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica. Q4_K_M se genero con llama.cpp v0.9.0 sin importance matrix. No se han medido velocidades en dispositivo.

## Requisitos de hardware

- VRAM estimada en GPU: unos 15,3 GB en bf16 para cargar el checkpoint completo con transformers; el peso empaquetado en BFP8 ocupa 9,11 GB, pero la carga estandar usa bf16.
- GPU recomendadas para validacion: A100 40/80 GB, H100, o cualquier GPU con al menos 16 GB de VRAM (RTX 4090, RTX 4080, L40S). Cabe en GPUs de consumo con 16 GB o mas.
- Despliegue objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). La model card indica que tt-transformers solo ejecuta Qwen2.5-7B en 2 o 4 chips (N300 y superiores).
- Opciones de despliegue: transformers (validacion), TT-NN/tt-metal, tt-transformers (v0.81.1, no probado con este checkpoint) y tt-forge/tt-xla (no probado; por defecto mantiene bf16, y sus opciones `bfp_bf8`/`bfp_bf4` re-redondean).
- Simulacion: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ha ejecutado en hardware fisico segun la model card.
- Latencia y throughput: no disponibles; no se han publicado mediciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8 | 7,62 B | no disponible (base: 32.768) | BFP8, 9,57 bits | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen2.5-7B-Instruct (BF16) | 7,62 B | 32.768 | BF16, 16 bits | Apache 2.0 | Hugging Face, uso general |
| Q4_K_M de llama.cpp (mismo checkpoint) | 7,62 B | 32.768 | GGUF, 4,91 bits | Apache 2.0 | Generado con llama.cpp v0.9.0 |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M usada como referencia en la model card; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card declara solo ingles como idioma soportado, aunque la evaluacion incluya coreano; el rendimiento multilingue no esta documentado.
- Los benchmarks miden cercania a BF16, no calidad de tarea; no hay evaluaciones de MMLU, HumanEval o GSM8K en la informacion disponible.
- No se han medido velocidades ni latencias en hardware Tensix; las pruebas se hicieron en el simulador `ttsim`.
- tt-transformers requiere 2 o 4 chips (N300 o superior) y no se ha probado con este checkpoint; si se usa, hay que pasar `--use_hf_rope` y configurar `precision_cfg` con bfp8 en ff1_3, ff2, wqkv y wo.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint y, por defecto, mantiene bf16; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores ya cuantizados.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen2.5-7B-Instruct; no se documentan mitigaciones adicionales.
- Licencia Apache 2.0, igual que el modelo base; los cambios se detallan en `NOTICE`. No se indican restricciones adicionales para uso comercial.
- El checkpoint guarda los pesos en bf16, por lo que la carga con transformers no aprovecha el ahorro de memoria del empaquetado BFP8 hasta pasar por TT-NN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia citado en los tags (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8/blob/main/LICENSE
