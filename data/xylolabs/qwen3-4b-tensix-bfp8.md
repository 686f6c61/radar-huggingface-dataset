# Xylolabs/Qwen3-4B-Tensix-BFP8

## Resumen

Qwen3-4B-Tensix-BFP8 es una cuantizacion del modelo Qwen/Qwen3-4B desarrollada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el stack tt-metal/ttnn. El modelo conserva la arquitectura original de Qwen3-4B (transformer denso de 4.411 millones de parametros con 36 capas) pero redondea las proyecciones lineales de atencion y MLP a la rejilla numérica `ttnn.bfloat8_b` (block floating point de 8 bits con exponente compartido por bloque) mediante GPTQ.

La particularidad tecnica es que los pesos se distribuyen en safetensors en bf16, pero cada valor ya esta alineado a la rejilla BFP8, de modo que el empaquetador de TT-NN no vuelve a redondear al cargarlos. Esto da una media de 9,23 bits por peso y un tamano empaquetado de 4,639 GB, frente a los 8,04 GB del checkpoint bf16 original. La cabeza LM, los embeddings y las normas permanecen en bf16.

Es relevante porque permite ejecutar un modelo de la familia Qwen3 en hardware Tensix con una degradacion de calidad muy contenida (KL medio de 0,00120 frente a BF16 y top-1 del 98,63 %), aunque el autor advierte que solo se ha validado sobre el simulador ttsim de Blackhole y no sobre silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas, con proyecciones lineales cuantizadas a BFP8 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o, gate, up, down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | no disponible (calibracion en ingles y coreano; sin lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a rejilla BFP8); `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 36 capas con atencion multi-cabeza y MLP con activacion SwiGLU. La intervencion de Xylolabs consiste en aplicar GPTQ sobre la rejilla `bfloat8_b` de TT-NN a las siete proyecciones lineales por capa (q, k, v, o, gate, up, down), manteniendo el resto de tensores en bf16 tal como en el modelo base. El exponente compartido de cada bloque BFP8 lo fija el propio empaquetador de TT-NN, no el proceso de cuantizacion.

La calibracion de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. No se ha realizado entrenamiento adicional ni fine-tuning: es una cuantizacion post-entrenamiento pura. El repositorio incluye `quant4.json`, que especifica el formato de cada proyeccion, y scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningun valor cambia al empaquetar la matriz en TT-NN.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento en modo "thinking" (heredado de Qwen3), evaluado por el autor con 7 prompts de razonamiento.
- Capacidades multilingues del modelo base Qwen3-4B (sin lista oficial en esta ficha; la evaluacion cubre ingles y coreano).
- Ejecucion sobre aceleradores Tenstorrent Tensix mediante TT-NN y tt-metal.
- Compatibilidad con la API de transformers (`AutoModelForCausalLM`), lo que permite usarlo tambien como checkpoint de referencia en GPU/CPU.
- Soporte de `text-generation-inference` y endpoints compatibles segun los tags del repositorio.
- No se documentan capacidades de vision, audio ni tool calling especificas en la informacion proporcionada.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el caso principal; carga el checkpoint directamente en TT-NN sin re-redondeo, aprovechando que los pesos ya estan en la rejilla BFP8 y reduciendo el uso de DRAM a 4,639 GB.
- Despliegue en Wormhole o Blackhole con restricciones de memoria: al ocupar casi la mitad que el checkpoint bf16 (4,639 GB frente a 8,04 GB), permite alojar el modelo completo en DRAM del dispositivo sin fragmentar en exceso.
- Referencia de cuantizacion para pipelines GPTQ sobre BFP: util para validar que una cuantizacion BFP8 mantiene la fidelidad (KL 0,00120, top-1 98,63 %) antes de portar otros modelos a Tensix.
- Generacion de texto en produccion con requisitos de calidad alta: la perdida de respuestas correctas frente a BF16 es nula (36 de 40 en ambos), lo que lo hace apto para tareas conversacionales donde no se tolera degradacion apreciable.
- Evaluacion comparativa de precisiones: sirve como punto intermedio entre BF16 y Q4_K_M en estudios de trade-off calidad/tamano, con metricas KL y top-1 ya publicadas.
- Prototipado en simulador: el autor lo valida sobre ttsim, por lo que es util para desarrollar kernels TT-NN y demos de tt-transformers antes de disponer de hardware.
- Base para fine-tuning ligero o destilacion sobre hardware Tensix, dado que los pesos estan en safetensors estandar y son cargables con transformers.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B) | 16 | 8,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP8)** | 9,23 | 4,639 | 0,00120 | 98,63 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 2,497 | 0,06581 | 89,61 | 38 de 40 | 0 |

Las metricas KL y top-1 se calculan sobre 16.240 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las "respuestas correctas" corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento repetidos con thinking activado (40 en total). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 4,639 GB empaquetado en BFP8; el checkpoint en disco ocupa 8,8 GB (bf16).
- Hardware objetivo: aceleradores Tenstorrent Tensix (Wormhole y Blackhole). Validado solo sobre el simulador ttsim de Blackhole con ttnn 0.81.1.
- GPU convencionales: al ser safetensors en bf16, puede cargarse en GPU con transformers; requiere aproximadamente 9 GB en bf16 (8,04 GB de pesos mas overhead). Cabe en RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) y GPUs consumer de 12 GB o mas con margen.
- Despliegue: TT-NN/tt-metal v0.81.1 (demo `simple_text_demo.py` con `--use_hf_rope`), tt-forge/tt-xla (no probado con este checkpoint; por defecto mantiene bf16), transformers, text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: en tt-transformers el demo empaqueta la cabeza atada en bfloat8_b, por lo que la cabeza bf16 de este checkpoint no es exacta en ese flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | KL vs BF16 | Licencia |
|---|---:|---|---:|---:|---:|---|
| Qwen3-4B-Tensix-BFP8 | 4,41 B | no disponible | 9,23 | 4,639 GB | 0,00120 | Apache-2.0 |
| Qwen/Qwen3-4B (BF16) | 4,41 B | no disponible | 16 | 8,04 GB | 0 | Apache-2.0 |
| Qwen3-4B Q4_K_M (llama.cpp) | 4,41 B | no disponible | 4,95 | 2,497 GB | 0,06581 | Apache-2.0 |

La comparativa se limita a variantes de cuantizacion del mismo modelo base, ya que no se dispone de datos de otros modelos de 4 B en la informacion proporcionada.

## Limitaciones y advertencias

- No validado sobre hardware Tensix real: solo se ha probado en el simulador ttsim de Blackhole con ttnn 0.81.1. El comportamiento en silicio puede diferir.
- tt-forge/tt-xla no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores y romperian la alineacion exacta a la rejilla.
- En tt-transformers el demo empaqueta la cabeza atada en bfloat8_b, por lo que la cabeza bf16 de este checkpoint no es exacta en ese flujo; requiere `--use_hf_rope` para evitar permutaciones incorrectas de q y k.
- La cuantizacion BFP8 introduce un KL medio de 0,00120 y baja el top-1 al 98,63 %, con perdida nula de respuestas correctas en la evaluacion del autor, pero con degradacion medible en distribuciones.
- Calibracion limitada a WikiText-2 y Wikipedia en coreano; el comportamiento en otros dominios o idiomas no esta evaluado.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen3-4B, no mitigados por la cuantizacion.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B.
- Sin datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de latencia/throughput.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
