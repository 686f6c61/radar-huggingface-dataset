# Xylolabs/Qwen3.5-9B-Base-Tensix-BFP4

## Resumen

Qwen3.5-9B-Base-Tensix-BFP4 es una cuantización del modelo base Qwen/Qwen3.5-9B-Base, publicada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5 con 9.653.104.368 parametros totales y sustituye los pesos de las capas lineales por valores ya situados en la rejilla de bloque flotante nativa del hardware: `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) para atención, DeltaNet y MLP, y `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) para las proyecciones a y b de Gated DeltaNet. El resultado es un checkpoint de 7,96 GB empaquetado, con 7,12 bits por peso de media.

La relevancia de esta publicacion es doble. Por un lado, demuestra una via de cuantizacion GPTQ adaptada a un formato de bloque flotante propietario del acelerador, con busqueda de exponente por bloque y calibracion sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Por otro, ofrece una evaluacion de fidelidad frente al modelo BF16 original: KL medio de 0,02453 sobre 8.188 posiciones de texto en ingles y coreano, y un 91,83 % de top-1, frente a un 91,72 % de una cuantizacion Q4_K_M de llama.cpp. Es, por tanto, un artefacto pensado para despliegue en hardware Tenstorrent mas que para inferencia convencional en GPU.

Conviene subrayar que se trata del modelo preentrenado, no ajustado a instrucciones: continua texto y no responde a dialogos. Ademas, el autor indica que las pruebas se hicieron con ttnn 0.81.1 sobre el simulador ttsim de Blackhole, no sobre silicio real, y que tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atención y Gated DeltaNet (arquitectura Qwen3.5) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso); media de 7,12 bits/peso |
| Idiomas soportados | no disponible (evaluado en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 con valores ya en la rejilla BFP4/BFP8; 7,96 GB empaquetados, repo de 19,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, que combina capas de atención con capas de Gated DeltaNet: 8 capas de atención (proyecciones q, k, v, o) y 24 capas de Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), mas 32 capas de MLP con proyecciones gate, up y down. La cuantizacion afecta exclusivamente a estas proyecciones lineales; el LM head, los embeddings, las normas, el modulo `mtp` y el modulo `visual` se mantienen en bf16 sin cambios. El checkpoint incluye por tanto componentes multimodales (`visual`) y de prediccion multi-token (`mtp`) heredados del base, aunque el autor indica que solo se cuantizo y evaluo el modelo de lenguaje.

El proceso de cuantizacion es GPTQ con busqueda de exponente por bloque para los tensores BFP4, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; los tensores BFP8 se obtuvieron por redondeo al vecino mas cercano. No se realizo ningun entrenamiento adicional ni ajuste por RLHF/DPO: es un checkpoint puramente post-entrenamiento sobre el base. La innovacion tecnica esta en el empaquetado nativo: los pesos se almacenan en bf16 pero cada valor ya esta en la rejilla del formato destino, de modo que TT-NN los empaqueta sin conversion. El repositorio incluye `quant4.json` con el formato de cada proyeccion, `pack_tensix.py` para verificar el empaquetado matriz a matriz y `verify_grid.py` para comprobar la rejilla solo con torch.

## Capacidades

- Generacion de texto y continuacion de secuencias: es un modelo preentrenado, sin ajuste a instrucciones ni plantilla de dialogo activa.
- Razonamiento y conocimiento general heredados de Qwen3.5-9B-Base (no evaluados de forma especifica en esta ficha).
- Capacidades multimodales potenciales por la presencia del modulo `visual` en bf16, aunque el autor solo cuantizo y evaluo el modelo de lenguaje.
- Prediccion multi-token mediante el modulo `mtp` conservado en bf16.
- Procesamiento de texto en ingles y coreano como minimo (idiomas usados en calibracion y evaluacion); el resto de idiomas no esta documentado.
- Sin soporte documentado de tool calling, function calling ni razonamiento agente multi-paso en esta variante.
- Sin modo thinking ni capacidades de audio documentadas.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole y Blackhole: el checkpoint esta empaquetado en los formatos nativos BFP4/BFP8 de TT-NN, de modo que se puede cargar directamente en DRAM del dispositivo sin conversion adicional, reduciendo el espacio a 7,96 GB frente a 17,91 GB en BF16.
- Investigacion en cuantizacion de bloque flotante: sirve como referencia reproducible para estudiar el impacto de GPTQ con busqueda de exponente por bloque en formatos BFP4, con scripts de verificacion incluidos (`pack_tensix.py`, `verify_grid.py`).
- Evaluacion de fidelidad de cuantizaciones: el autor publica metricas de KL y top-1 frente a BF16 y frente a Q4_K_M, lo que permite usarlo como baseline en estudios comparativos de compresion.
- Generacion de texto en ingles y coreano en entornos de bajo consumo: el modelo base preentrenado puede emplearse para continuacion de texto, completado de documentos o generacion de corpus sinteticos en esos idiomas.
- Prototipado en simulador: al haberse validado con ttsim (simulador de Blackhole), es util para desarrollar pipelines TT-NN antes de disponer de hardware fisico.
- Base para ajuste fino posterior: siendo Apache 2.0 y estando en formato transformers, puede servir como punto de partida para tareas especificas, aunque requeriria reconstruir los pesos en bf16 antes de entrenar.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3.5-9B-Base) | 16 | 17,91 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP4/BFP8) | 7,12 | 7,965 | 0,02453 | 91,83 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,02644 | 91,72 | 27 de 28 | 0 |

Las metricas de KL y top-1 cubren 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en forma de completado y con 3 ejemplos. El autor advierte que estas cifras miden cercania al BF16, no calidad en tareas, y que no se midio velocidad en dispositivo. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otras tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 16-18 GB en bf16 (pesos de 17,91 GB en el base); el checkpoint empaquetado ocupa 7,96 GB pero se distribuye en safetensors bf16, por lo que en transformers se carga en bf16.
- GPU recomendadas para inferencia en transformers: A100 40 GB, H100, RTX 4090 24 GB (justo para bf16), L40S.
- Cabe en GPU consumer: si, en RTX 4090 24 GB o RTX 3090 24 GB en bf16; en GPUs de 16 GB requeriria conversion a un formato de menor precision distinto del BFP nativo.
- Despliegue objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN (`ttnn.bfloat4_b`, `ttnn.bfloat8_b`); validado solo en el simulador ttsim con ttnn 0.81.1, no en hardware.
- Opciones de despliegue en GPU: transformers (soporte nativo de la arquitectura qwen3_5); llama.cpp, vLLM, TGI u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; el autor no midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Base-Tensix-BFP4 | 9,65 B | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B-Base (BF16) | 9,65 B | no disponible | bf16 safetensors | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 9,65 B | no disponible | GGUF Q4_K_M, 5,02 bits/peso | Apache 2.0 | generado localmente |

La comparativa relevante es frente al base en BF16 y frente a la cuantizacion Q4_K_M del mismo checkpoint. El modelo de Xylolabs ocupa 7,965 GB con 7,12 bits/peso y logra un KL de 0,02453, ligeramente mejor que el Q4_K_M (0,02644) pese a usar mas bits por peso; en top-1 queda practicamente empatado (91,83 % frente a 91,72 %), aunque pierde dos respuestas correctas frente al BF16 mientras el Q4_K_M solo pierde una. La ventaja diferencial no es la compresion sino el empaquetado nativo para Tensix. No se dispone de datos para comparar con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo preentrenado, no ajustado a instrucciones: no responde a dialogos ni sigue instrucciones de forma fiable; la plantilla de chat del tokenizer se conserva pero no se ha entrenado para ello.
- Solo se cuantizo y evaluo el modelo de lenguaje; los modulos `visual` y `mtp` se conservan en bf16 sin evaluacion publicada.
- Validacion unicamente en simulador (ttsim, ttnn 0.81.1); no hay pruebas en hardware Wormhole o Blackhole real, y tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- La evaluacion de fidelidad se limita a 8.188 posiciones de texto en ingles y coreano y a 28 prompts cortos; no cubre tareas de razonamiento, codigo ni matematicas.
- Riesgo de alucinacion inherente a un modelo base de 9,65 B sin ajuste; no se han publicado evaluaciones de sesgo.
- Idiomas soportados no documentados oficialmente; la evidencia empirica se reduce a ingles y coreano.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion ni sobre el rendimiento en hardware no validado.
- El repositorio ocupa 19,3 GB aunque los pesos empaquetados sean 7,96 GB, por el almacenamiento en bf16; conviene tener en cuenta el espacio en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tensix-BFP4/blob/main/LICENSE
