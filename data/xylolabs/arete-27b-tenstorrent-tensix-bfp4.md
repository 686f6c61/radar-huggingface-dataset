# Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4

## Resumen

Arete-27B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen/Qwen3.8-27B publicado por Nous Research. La version que nos ocupa la distribuye Xylolabs y esta especificamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), empleando formatos de coma flotante por bloques propietarios de tt-metal: `bfloat4_b` (BFP4) y `bfloat8_b` (BFP8).

El modelo resuelve el problema de ejecutar un LLM de 27.000 millones de parametros con capacidades multimodales (image-text-to-text) sobre aceleradores Tensix, donde el formato de pesos nativo no es el estandar safetensors en bf16 sino tensores empaquetados en el layout TILE de ttnn. El resultado ocupa 17,596 GB empaquetado frente a los 53,79 GB en bf16 del checkpoint base, una reduccion de aproximadamente 3,06 veces.

Es relevante ahora porque permite desplegar un modelo de 27B con vision sobre hardware de Tenstorrent, una alternativa emergente a las GPU de NVIDIA, manteniendo una fidelidad respecto al bf16 razonable: KL medio de 0,02909 y top-1 del 92,24 % sobre 16.240 posiciones de evaluacion. La arquitectura subyacente combina capas de atencion clasica con Gated DeltaNet, un mecanismo de estado lineal, lo que la aleja del transformer denso convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion clasica (16 capas) + Gated DeltaNet (48 capas), con MLP en 64 capas; familia Qwen3.5 |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para proyecciones de atencion, Gated DeltaNet y MLP; BFP8 (`bfloat8_b`) para el LM head; bf16 para embeddings, normas y tensor `visual` |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para Tensix (layout TILE de ttnn), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado de Qwen/Qwen3.8-27B. La arquitectura es hibrida: 16 capas emplean atencion clasica (proyecciones q, k, v, o) y 48 capas usan Gated DeltaNet con proyecciones q, k, v, z, a, b y output, un mecanismo de estado lineal recurrente que reduce el coste computacional en contextos largos. El bloque MLP aparece en 64 capas. El modelo incorpora ademas un modulo `visual` en bf16, lo que confirma capacidades de entrada imagen-texto.

La cuantizacion la realiza Xylolabs mediante GPTQ con busqueda de exponente por bloque para los tensores `bfloat4_b`, y redondeo al mas cercano para los `bfloat8_b`. El repositorio incluye las herramientas `pack_tensix.py` y `verify_grid.py` del proyecto tensix-bfp-gptq (commit 5c52065), que verifican la integridad de cada matriz empaquetada comparando el round-trip por DRAM del dispositivo. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`, tensor `visual` preservado en bf16).
- Razonamiento multi-turno y generacion condicionada por contexto.
- Ejecucion nativa sobre NPU Tensix mediante ttnn y tt-metal, con kernels especificos del proyecto tensix-kernels.
- Compatibilidad con la libreria transformers para carga en bf16 sobre GPU (`device_map="auto"`).
- Soporte de inferencia en precision mixta BFP4/BFP8 con verificacion de exactitud por matriz.
- Capacidades multilingues: la evaluacion incluye texto en ingles y coreano, aunque no se declara una lista oficial de idiomas.
- Tool calling, function calling y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue sobre hardware Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole, de modo que se puede ejecutar en aceleradores Tensix sin conversion adicional usando el runner tensix-runner v0.1.0 y el demo `text_demo.py` de tt-metal v0.81.1.
- Sustitucion de GPU en entornos con restricciones de suministro: al ocupar 17,596 GB empaquetado frente a 53,79 GB en bf16, reduce los requisitos de memoria DRAM del acelerador y permite servir un 27B en una sola NPU.
- Asistentes conversacionales con contexto largo: la combinacion de atencion clasica y Gated DeltaNet esta disenada para mantener coste lineal en secuencias largas, adecuada para dialogos multi-turno extensos.
- Procesamiento de documentos con imagenes: el pipeline image-text-to-text permite extraer y razonar sobre contenido visual, por ejemplo en digitalizacion de formularios o analisis de capturas.
- Generacion de codigo y texto tecnico en pipelines internos: el modelo hereda las capacidades de Qwen3.8-27B y puede integrarse en flujos de autocompletado o revision, siempre que el hardware destino sea Tensix o una GPU con suficiente VRAM.
- Investigacion en cuantizacion: el repositorio sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a Q4_K_M, con scripts de verificacion incluidos.
- Evaluacion comparativa de precision: util para medir la degradacion de KL y top-1 al pasar de bf16 a BFP4 en un modelo hibrido con estado lineal.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 53,79 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 17,596 | 0,02909 | 92,24 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02036 | 93,47 |

La evaluacion cubre 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. El Q4_K_M de referencia se genero con llama.cpp v0.9.0 (commit cd959bae) sin importance matrix. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 17,596 GB empaquetado para Tensix; en bf16 sobre GPU, aproximadamente 53,79 GB de pesos mas overhead de activaciones y cache KV.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole mediante tt-metal v0.81.1 y ttnn.
- GPU: para carga via transformers en bf16 se necesita al menos una A100 80 GB o H100 80 GB; en consumer, no cabe en RTX 4090 (24 GB) sin cuantizacion adicional fuera del formato Tensix.
- Despliegue: tt-metal con el demo `models/demos/qwen38_27b_qb2/demo/text_demo.py`, tensix-runner v0.1.0 para inferencia y tensix-kernels v0.1.0 para los kernels; transformers para carga estandar en GPU.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Precision |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 27,36B | no disponible | Apache 2.0 | safetensors Tensix (Wormhole, Blackhole) | KL 0,02909; top-1 92,24 % |
| NousResearch/Arete-27B (bf16) | 27,36B | no disponible | Apache 2.0 | safetensors bf16 (GPU) | Referencia, KL 0 |
| Q4_K_M de llama.cpp | 27,36B | no disponible | Apache 2.0 | GGUF (CPU/GPU) | KL 0,02036; top-1 93,47 % |
| Qwen/Qwen3.8-27B | 27,36B (base) | no disponible | no disponible | safetensors | modelo original sin ajuste |

## Limitaciones y advertencias

- La fidelidad frente a bf16 es inferior a la de Q4_K_M: el KL medio es 1,43 veces mayor (0,02909 frente a 0,02036) y el top-1 cae al 92,24 % frente al 93,47 %.
- El formato de pesos esta empaquetado para Tensix; no es un GGUF ni un safetensors estandar cargable directamente en llama.cpp u Ollama sin conversion.
- La evaluacion de calidad se limita a 16.240 posiciones de ingles y coreano; no hay datos de otros idiomas ni de tareas de razonamiento o codigo.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Riesgo de alucinacion inherente a un modelo de 27B sin datos de benchmarks de tareas publicados en esta ficha.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del checkpoint base Qwen3.8-27B y el ajuste de Nous Research.
- La licencia Apache 2.0 permite uso comercial, pero el aviso NOTICE debe conservarse y las herramientas `pack_tensix.py` y `verify_grid.py` se distribuyen bajo la misma licencia.
- El repositorio tiene 192 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
