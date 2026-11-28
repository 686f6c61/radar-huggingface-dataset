# Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tensix-BFP4-MLP es una version cuantizada del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, adaptada por Xylolabs para su ejecucion sobre aceleradores Tenstorrent Tensix (NPUs). La cuantizacion emplea formatos de coma flotante por bloques (block floating point, BFP), concretamente `bfloat4_b` para las capas MLP y `bfloat8_b` para la atencion, manteniendo el resto de pesos en bf16. El objetivo es reducir la huella de memoria del modelo (de 15,23 GB en BF16 a 6,262 GB empaquetado) para que quepa en las SRAM/DRAM de las tarjetas Tensix.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso de 7.615.616.512 parametros, con 28 capas, atencion por grupos (GQA) y un contexto nativo de 32.768 tokens (extensible a 131.072). Esta version conserva la tokenizacion, el chat template y las capacidades del original, pero sustituye los pesos por tensores empaquetados en formato BFP compatible con `ttnn` y `tt-metal`.

Es relevante porque demuestra una ruta de despliegue de LLMs de 7B en hardware no-GPU (Tenstorrent), con una degradacion de calidad medida (KL medio de 0,0470 frente a BF16 sobre 16.104 posiciones) y un pipeline reproducible de empaquetado y verificacion publicado en GitHub. El repo incluye tanto la variante BFP4 como BFP8 desde el 27 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), adaptado a cuantizacion BFP para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no se especifica en la model card de la version cuantizada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP + BFP8 (`bfloat8_b`) en atencion + bf16 en el resto; variante BFP8 completa disponible en carpeta `bfp8/` |
| Idiomas soportados | en (segun metadatos); el modelo base Qwen2.5 soporta multiples idiomas, pero la model card declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para `ttnn` (BFP4/BFP8), con scripts `pack_tensix.py` y `verify_grid.py` |
| Tamano del repo | 28,3 GB (incluye ambas carpetas BFP4 y BFP8) |
| Tamano empaquetado BFP4 | 6,262 GB |
| Tamano empaquetado BFP8 | 9,114 GB |
| Tamano BF16 de referencia | 15,23 GB |
| KL medio vs BF16 (BFP4) | 0,0470 |
| KL medio vs BF16 (BFP8) | 0,00158 |
| Hardware objetivo | Tenstorrent Tensix NPUs (`tt-metal` v0.81.1, `ttnn`, `tt-forge`) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado por el equipo Qwen sobre un corpus multilingue de varios billones de tokens y afinado con instrucciones mediante SFT y optimizacion por preferencias. La model card de esta version cuantizada no detalla el dataset ni las fases de alineamiento del modelo original; esa informacion debe consultarse en la ficha oficial de Qwen.

La innovacion de esta ficha no esta en el entrenamiento sino en la cuantizacion. Xylolabs aplica un esquema de block floating point (BFP) en el que cada bloque de valores comparte un exponente y los mantiene en 4 u 8 bits. La variante BFP4 cuantiza solo las matrices MLP (`gate_proj`, `up_proj`, `down_proj`) a `bfloat4_b`, mientras que la atencion se mantiene en `bfloat8_b` y el resto en bf16; la variante BFP8 cuantiza atencion y MLP a `bfloat8_b`. El repo incluye metadatos por capa (`quant4.json`) que indican el formato de cada matriz, y scripts de empaquetado y verificacion que permiten comprobar el round-trip de los valores empaquetados contra los originales en `ttnn`. La evaluacion de calidad se mide con divergencia KL frente a BF16 sobre WikiText-2 test y Wikipedia en coreano (16.104 posiciones), lo que da una metrica objetiva de la perdida de distribucion.

## Capacidades

- Generacion de texto e instrucciones conversacionales multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas a nivel de modelo de 7B, con soporte de cadenas de razonamiento en el chat template original.
- Generacion de codigo y comprension de lenguajes de programacion, segun las capacidades del modelo base.
- Tool calling / function calling: soportado por Qwen2.5-7B-Instruct mediante su chat template; la model card de la version cuantizada no documenta cambios en el template.
- Capacidades de agente y razonamiento multi-paso: disponibles en la medida en que lo esten en el modelo base; no se documentan adaptaciones especificas.
- Capacidades multilingues: el modelo base es multilingue, pero la model card de esta version declara unicamente `en`. El coreano aparece solo como idioma de evaluacion de la cuantizacion, no como idioma soportado declarado.
- Ejecucion sobre NPUs Tenstorrent Tensix mediante `ttnn`, `tt-metal` y `tt-forge`, con soporte de `torch.compile` con backend `tt`.
- No se documentan capacidades de vision ni audio (el modelo base es solo texto).

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El modelo esta pensado para ejecutarse en tarjetas Tensix (por ejemplo, Wormhole o Grayskull) donde una GPU no esta disponible o no es rentable energeticamente. La variante BFP4 de 6,26 GB cabe en la memoria de estas tarjetas y permite inferencia de un LLM de 7B sin GPU.
- Inferencia de bajo consumo en el borde: al ejecutarse sobre NPUs Tensix, el modelo es adecuado para entornos con restricciones de potencia o de refrigeracion donde una GPU dedicada no es viable, manteniendo una calidad cercana a BF16 (KL 0,0470 en BFP4).
- Servicio de chat y asistencia conversacional: con el chat template de Qwen2.5 y contexto nativo de 32.768 tokens, puede gestionar conversaciones multi-turno con historial largo en aplicaciones de atencion al cliente desplegadas sobre infraestructura Tenstorrent.
- Generacion asistida de codigo en pipelines internos: hereda la capacidad de codigo de Qwen2.5-7B-Instruct y puede integrarse en flujos de autocompletado o revision de codigo siempre que el backend Tensix soporte la carga del modelo y el tool calling del template.
- Prototipado e investigacion en cuantizacion: el repo publica scripts de empaquetado (`pack_tensix.py`) y verificacion (`verify_grid.py`), ademas de las metricas KL, lo que lo convierte en una referencia para estudiar el impacto de BFP4/BFP8 en la calidad de un LLM de 7B.
- Evaluacion comparativa de hardware: sirve como banco de pruebas para medir throughput y latencia de un transformer de 7B en Tensix frente a GPU, dado que el mismo modelo esta disponible en BF16 y en Q4_K_M de llama.cpp con metricas KL comparables.
- Educacion y demostraciones: el tamano reducido del repo empaquetado (6,26 GB en BFP4) y los ejemplos de `ttnn` en la model card facilitan demostraciones de LLMs en aceleradores no convencionales.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Solo se proporcionan metricas de fidelidad de la cuantizacion frente a BF16:

| Formato | Tamano empaquetado (GB) | KL medio vs BF16 |
|---|---|---|
| BFP4 (MLP bfloat4_b, atencion bfloat8_b) | 6,262 | 0,0470 |
| BFP8 (atencion y MLP bfloat8_b) | 9,114 | 0,00158 |
| BF16 (Qwen2.5-7B-Instruct original) | 15,23 | 0 |
| Q4_K_M (llama.cpp) | 4,683 | 0,0369 |

Las metricas KL se calculan sobre 16.104 posiciones de texto en ingles (WikiText-2 test) y coreano (Wikipedia en coreano). No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: la variante BFP4 requiere 6,262 GB empaquetados; la BFP8, 9,114 GB. El modelo BF16 de referencia ocupa 15,23 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix. La model card cita `tt-metal` v0.81.1, `ttnn`, `tt-forge` y el plugin `pjrt-plugin-tt==1.4.0` (indice de paquetes de Tenstorrent). No se especifican modelos de tarjeta concretos ni numero de chips necesarios.
- GPU: no es el hardware objetivo. La model card incluye un ejemplo con `transformers` y `device_map="auto"` en bf16 que podria ejecutarse en GPU, pero los pesos empaquetados estan pensados para `ttnn`; no se documenta soporte oficial en CUDA.
- Cabe en GPU de consumo: no confirmado. El modelo base BF16 de 7B cabe en GPUs de 16-24 GB; la variante BFP4 empaquetada no es directamente cargable en CUDA sin conversion.
- Opciones de despliegue: `ttnn`/`tt-metal` en Tensix, `tt-forge` con `torch.compile(backend="tt")`, y `transformers` en bf16 como referencia. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para estos pesos empaquetados (existe un Q4_K_M de llama.cpp del modelo base como referencia de calidad, no como formato de este repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/hardware | Licencia | Calidad relativa |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP | 7,62 B | 32.768 (base) | BFP4/BFP8 para Tensix | Apache 2.0 | KL 0,0470 vs BF16 |
| Qwen/Qwen2.5-7B-Instruct (BF16) | 7,62 B | 32.768 | BF16, GPU/CPU | Apache 2.0 | Referencia (KL 0) |
| Qwen2.5-7B-Instruct Q4_K_M (llama.cpp) | 7,62 B | 32.768 | GGUF 4 bits, CPU/GPU | Apache 2.0 | KL 0,0369 vs BF16 |
| Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP8 | 7,62 B | 32.768 (base) | BFP8 para Tensix | Apache 2.0 | KL 0,00158 vs BF16 |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la model card no aporta comparaciones con otros modelos de 7B. No se dispone de datos para comparar con Llama 3.1 8B, Mistral 7B u otros modelos de tamano similar en esta informacion.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la variante BFP4 presenta un KL medio de 0,0470 frente a BF16, superior al 0,0369 de Q4_K_M de llama.cpp; la BFP8 reduce el KL a 0,00158. Para tareas sensibles a la precision, BFP8 es preferible.
- Dependencia de hardware: los pesos estan empaquetados para `ttnn`/Tensix y requieren `tt-metal` v0.81.1 y `--use_hf_rope` en `tt-transformers`. No son directamente utilizables en CUDA, vLLM, TGI u Ollama sin conversion.
- Idioma declarado: la model card solo declara `en`; aunque el modelo base es multilingue, el soporte de otros idiomas no esta garantizado ni evaluado en esta version.
- Contexto: la model card no documenta explicitamente el contexto de la version cuantizada; se asume el del modelo base (32.768 tokens), pero no esta confirmado para el backend Tensix.
- Sesgos y alucinacion: heredados de Qwen2.5-7B-Instruct. La model card no documenta evaluaciones de sesgo ni de tasas de alucinacion para esta version.
- Licencia: Apache 2.0, igual que el modelo base. Cada carpeta (`bfp4/`, `bfp8/`) incluye su propio `LICENSE` y `NOTICE`; los scripts `pack_tensix.py` y `verify_grid.py` son de Xylolabs bajo la misma licencia. No se documentan restricciones adicionales para uso comercial.
- Madurez: el repo tiene 173 descargas y 0 likes en el momento de la consulta, y la model card se ha recortado recientemente (2026-11-28); el soporte de la comunidad y la documentacion de produccion son limitados.
- Sin benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K u otros, por lo que el rendimiento real en tareas no puede verificarse a partir de esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Paper de Qwen2.5 (referencia de la cita): https://arxiv.org/abs/2412.15115 (no citado explicitamente en la model card; verificar)
