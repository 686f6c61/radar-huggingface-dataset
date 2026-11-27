# Xylolabs/Qwen3.8-27B-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tensix-BFP4 es una cuantizacion del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la totalidad de los 27.781.427.952 parametros del checkpoint original, pero almacena las proyecciones de atencion, las capas del bloque Gated DeltaNet y las proyecciones MLP en formato de coma flotante por bloques `bfloat4_b` (BFP4), mientras que el LM head se mantiene en `bfloat8_b` (BFP8) y las embeddings, normalizaciones y tensores auxiliares (`mtp`, `visual`) permanecen en bf16.

El objetivo principal es reducir el peso del modelo de 53,79 GB en bf16 a 17,596 GB empaquetado para Tensix, manteniendo una fidelidad numerica cercana a una cuantizacion Q4_K_M de llama.cpp. Segun la model card, la divergencia media de KL frente a bf16 es de 0,02894, frente a 0,02081 de Q4_K_M, es decir, 1,39 veces mayor, y la tasa de acierto top-1 es del 92,62 % frente al 92,94 % de Q4_K_M. El modelo se distribuye con licencia Apache 2.0 y esta pensado para ejecutarse en hardware de Tenstorrent mediante el stack `tt-metal`/`ttnn`, aunque tambien puede cargarse con Transformers en GPU convencionales.

La relevancia actual del modelo radica en que demuestra la viabilidad de cuantizaciones de 4 bits especificas para aceleradores no-GPU, con un pipeline de empaquetado reproducible (`pack_tensix.py`, `verify_grid.py`) y kernels propios de Xylolabs. Es, por tanto, un caso practico de despliegue de un modelo multimodal de ~28B en NPU con un presupuesto de memoria inferior a 18 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet y atencion clasica; incluye torre visual y modulo MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atencion, Gated DeltaNet y MLP; BFP8 (`bfloat8_b`) en LM head; bf16 en embeddings, norms, `mtp` y `visual` |
| Idiomas soportados | no disponible (la evaluacion incluye textos en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e indice de shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion clasica con capas Gated DeltaNet, un mecanismo de atencion lineal recurrente con compuertas. La model card detalla la distribucion de tensores cuantizados: 16 capas con proyecciones q, k, v y o en `bfloat4_b`; 48 capas con proyecciones q, k, v, z, a, b y output de Gated DeltaNet tambien en `bfloat4_b`; y 64 capas con proyecciones gate, up y down del MLP en `bfloat4_b`. El LM head se cuantiza a `bfloat8_b`. Ademas, el checkpoint incluye un modulo `mtp` (multi-token prediction) y una torre `visual` que se mantienen en bf16 sin modificar, lo que confirma que el modelo base es multimodal (image-text-to-text).

El proceso de cuantizacion combina GPTQ con una busqueda de exponente por bloque para los tensores `bfloat4_b`, y redondeo al mas cercano para los `bfloat8_b`. El empaquetado se realiza con las herramientas `pack_tensix.py` y `verify_grid.py` del repositorio `tensix-bfp-gptq` (commit 5c52065), que verifican la round-trip de cada matriz a traves de `ttnn`. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; esa informacion corresponderia a la model card de Qwen/Qwen3.8-27B, no incluida en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text`), ya que el checkpoint conserva la torre `visual` en bf16.
- Prediccion multi-token mediante el modulo `mtp`, presente en el checkpoint en bf16.
- Soporte de plantilla de chat (`apply_chat_template`) con roles `user` y `assistant`.
- Capacidades multilingues: la evaluacion incluye textos en ingles y coreano, aunque no se detalla la lista completa de idiomas.
- Compatibilidad con `endpoints_compatible` segun los tags de Hugging Face.
- No se documenta explicitamente soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo esta empaquetado en BFP4 para `ttnn` y puede cargarse directamente en DRAM del dispositivo mediante `ttnn.as_tensor`, lo que permite ejecutar un modelo de ~28B en menos de 18 GB de memoria de acelerador.
- Inferencia multimodal en entornos con restricciones de memoria: al conservar la torre visual en bf16 y el resto en BFP4/BFP8, es adecuado para tareas de descripcion de imagenes y respuesta a preguntas sobre documentos visuales en hardware de borde o servidores con NPU.
- Evaluacion de fidelidad de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar cada matriz contra bf16, lo que lo convierte en una referencia para investigar cuantizacion de 4 bits en aceleradores no-GPU.
- Generacion de texto en ingles y coreano: la evaluacion cubre ambos idiomas, por lo que es util para asistentes conversacionales bilingues en esos mercados.
- Integracion en pipelines de Transformers: el quickstart con `AutoModelForCausalLM` y `AutoTokenizer` permite usarlo en GPU convencionales para prototipado y comparacion con Q4_K_M.
- Investigacion en atencion lineal: al incluir 48 capas Gated DeltaNet cuantizadas a BFP4, sirve para estudiar el impacto de la cuantizacion agresiva en mecanismos de atencion recurrente.
- Reproducibilidad de cuantizaciones GPTQ por bloques: el repositorio `tensix-bfp-gptq` y los kernels `tensix-kernels` permiten replicar el proceso sobre otros checkpoints.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 53,79 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 17,596 | 0,02894 | 92,62 |
| Q4_K_M (llama.cpp) | 16,811 | 0,02081 | 92,94 |

La evaluacion cubre 16.240 posiciones de cuatro textos (cuatro secuencias de hasta 1.024 tokens cada una): el inicio de un articulo de Wikipedia en ingles y otro en coreano, y la propia respuesta del modelo a "Write an encyclopedia article." en su plantilla de chat para cada idioma, puntuando solo los tokens de respuesta. La regla de aceptacion es una KL media de como maximo 1,5 veces la de Q4_K_M, es decir, 0,03121; este modelo cumple con 0,02894. En la comprobacion de respuesta (33 + 7 items) con el head top-16 `bfloat4_b` y rescoring en bf16 se obtuvieron 31/33 y 7/7, sin regresiones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 17,596 GB para el checkpoint empaquetado en Tensix; en GPU con Transformers se carga en bf16 (`dtype="bfloat16"`), por lo que requiere aproximadamente 53,79 GB mas overhead.
- GPU recomendadas: no se especifican en la model card; por tamano, un checkpoint bf16 de ~28B encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: el checkpoint BFP4 esta disenado para NPU Tensix, no para GPU de consumo; en GPU consumer solo seria viable mediante el checkpoint base o cuantizaciones GGUF alternativas, no documentadas aqui.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole con `tt-metal` v0.81.1, `ttnn`, `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), demo `models/demos/qwen38_27b_qb2/demo/text_demo.py` con `MODEL_WEIGHTS_DIR` y `QWEN_PRECISION_CONFIG=baseline`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Tensix-BFP4 | 27,78B | no disponible | 17,596 GB | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3.8-27B (bf16) | 27,78B | no disponible | 53,79 GB | Apache 2.0 | GPU / CPU |
| Q4_K_M de llama.cpp (mismo checkpoint) | 27,78B | no disponible | 16,811 GB | Apache 2.0 | CPU / GPU via llama.cpp |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M generada con llama.cpp `cd959ba` (sha256 `76cdd73b285057201c3ecb0c54c83486a50b325607844b5381384ff8e190e5c1`), que es la referencia de fidelidad usada por el autor. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia de KL de 0,02894 frente a bf16, superior a la de Q4_K_M (0,02081); puede afectar a tareas sensibles a la precision numerica.
- El checkpoint esta empaquetado para Tensix; cargarlo en GPU con Transformers requiere el camino bf16 y no aprovecha el formato BFP4, por lo que el ahorro de memoria solo se materializa en NPU Tenstorrent.
- La evaluacion se limita a 16.240 posiciones de cuatro textos en ingles y coreano; no hay datos sobre otros idiomas, dominios especializados ni tareas de codigo o matematicas.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto especificas en la informacion disponible; estos aspectos deben consultarse en la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la idoneidad para tareas criticas.
- El modelo tiene 199 descargas y 0 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.
- La model card menciona una actualizacion del 2026-11-24 ("Eva") sin detallar su contenido.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
