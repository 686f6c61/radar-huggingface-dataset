# Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo Qwen/Qwen3.6-35B-A3B realizada por Xylolabs para su ejecucion en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parametros totales, disenado por Qwen para tareas de razonamiento, generacion de codigo agentico y procesamiento de imagen y texto. Esta version reduce el peso de 69,32 GB en bf16 a 20,991 GB empaquetados para Tensix, lo que permite desplegar el modelo en hardware NPU de Tenstorrent con un coste de memoria aproximadamente un 70 % inferior.

La cuantizacion se aplica mediante GPTQ con busqueda de exponente por bloque al formato `bfloat4_b` (BFP4, block floating point de 4 bits) en las proyecciones de atencion, Gated DeltaNet, expertos enrutados y experto compartido. El LM head, los embeddings, las normas y los tensores `mtp` y `visual` permanecen en bf16. El resultado es un checkpoint compatible con `transformers` y con las herramientas de Xylolabs (`tensix-bfp-gptq`, `tensix-kernels`, `tensix-runner`).

Su relevancia actual radica en que demuestra que un MoE de 35B con contexto largo y capacidades multimodales puede ejecutarse en NPUs de Tenstorrent con una degradacion de calidad medida (KL medio de 0,05013 frente a bf16 y top-1 del 89,62 %), acercandose al rendimiento de Q4_K_M de llama.cpp (KL 0,0404, top-1 90,80 %) con un tamano ligeramente inferior. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas de atencion (10 capas) y Gated DeltaNet (30 capas) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones; bf16 en LM head, embeddings, normas, `mtp` y `visual` |
| Idiomas soportados | no disponible (evaluacion con texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix, 20,991 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura hibrida de transformer con dos tipos de capas: 10 capas con atencion clasica (proyecciones q, k, v, o) y 30 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida). Ademas incluye 40 capas con expertos enrutados (gate, up, down) y un experto compartido, lo que confirma su naturaleza Mixture-of-Experts. Tambien incorpora un modulo `mtp` (multi-token prediction) y un modulo `visual`, lo que habilita la entrada de imagen y texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el material proporcionado.

La innovacion principal de esta version es el proceso de cuantizacion: GPTQ con busqueda de exponente por bloque para producir tensores `bfloat4_b` (BFP4) compatibles con el runtime `ttnn` de Tenstorrent. Las herramientas `pack_tensix.py` y `verify_grid.py` permiten verificar que cada matriz empaquetada se reconstruye exactamente en el dispositivo (round-trip por DRAM). El mismo valor tambien puede empaquetarse en `ttnn.bfloat8_b`. La evaluacion se realizo con ttnn 0.81.1 sobre el simulador ttsim de Blackhole y con demos de tt-metal sobre una malla P150x4.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento y codigo agentico, segun la descripcion del modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias al modulo `visual` conservado en bf16.
- Prediccion multi-token (`mtp`) para decodificacion especulativa o generacion acelerada.
- Capacidades multilingues: la evaluacion incluye texto en ingles y coreano, aunque no se detalla la lista completa de idiomas.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Ejecucion en NPUs Tenstorrent Tensix (Wormhole y Blackhole) mediante `ttnn`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint esta empaquetado para NPUs Wormhole y Blackhole, por lo que se puede servir en clusters con estas tarjetas reduciendo el consumo de memoria a 20,991 GB por instancia frente a 69,32 GB en bf16.
- Asistentes conversacionales multi-turno: el modelo base soporta plantillas de chat y un contexto presumiblemente largo (no confirmado), adecuado para atencion al cliente o asistentes internos con historial extenso.
- Generacion de codigo en pipelines de CI/CD: al ser un modelo agentico de codigo, puede integrarse en herramientas de revision automatica, generacion de tests o refactorizacion, ejecutandose en NPUs para liberar GPUs.
- Procesamiento de documentos con imagen y texto: el modulo visual en bf16 permite tareas de extraccion de informacion de capturas, formularios o graficos combinados con texto.
- Investigacion en cuantizacion de bajo bit: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en MoE de 35B, comparando KL y top-1 frente a bf16 y Q4_K_M.
- Evaluacion de hardware alternativo: util para equipos que quieran medir latencia y throughput de un MoE de 35B en Tensix frente a soluciones GPU con llama.cpp o vLLM.
- Prototipado de asistentes multimodales en entornos con restricciones de memoria: el empaquetado de 20,991 GB facilita ejecutar el modelo en un unico dispositivo o en mallas pequenas.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio frente a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-35B-A3B) | 69,32 | 0 | 100 |
| Este modelo (BFP4) | 20,991 | 0,05013 | 89,62 |
| Q4_K_M (llama.cpp) | 21,713 | 0,0404 | 90,80 |

La evaluacion de KL y top-1 cubre 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano). Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 20,991 GB empaquetados para Tensix; en bf16 el modelo base ocupa 69,32 GB.
- Aceleradores soportados: Tenstorrent Tensix Wormhole y Blackhole (probado con ttnn 0.81.1 sobre ttsim y con malla P150x4 en tt-metal v0.81.1).
- GPU consumer: no se documenta soporte nativo para GPU; el checkpoint esta pensado para Tensix. La carga en `transformers` con `device_map="auto"` requiere memoria suficiente para el modelo cuantizado.
- Opciones de despliegue: `transformers` (carga y generacion), `ttnn` (empaquetado y ejecucion en Tensix), `tensix-runner` v0.1.0, demos de tt-metal (`models/demos/blackhole/qwen36/demo/text_demo.py`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 35,95B totales | no disponible | BFP4 + bf16 parcial | Apache 2.0 | Hugging Face, 243 descargas |
| Qwen/Qwen3.6-35B-A3B (bf16) | 35,95B totales | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 35,95B totales | no disponible | Q4_K_M | Apache 2.0 | Generado localmente |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M del mismo checkpoint, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. En calidad, Q4_K_M obtiene mejor KL (0,0404 frente a 0,05013) y top-1 (90,80 % frente a 89,62 %), mientras que este modelo ocupa menos espacio (20,991 GB frente a 21,713 GB) y esta optimizado para Tensix.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una degradacion medible: KL medio de 0,05013 frente a bf16, aproximadamente 1,24 veces el de Q4_K_M.
- El checkpoint esta empaquetado para Tensix; su uso en GPU requiere cargarlo con `transformers` y puede no aprovechar el formato BFP4 de forma nativa.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en el material proporcionado.
- La lista completa de idiomas soportados no esta documentada; la evaluacion solo cubre ingles y coreano.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar escenarios de contexto largo.
- El modelo no esta afiliado a Tenstorrent; el soporte y las herramientas provienen de Xylolabs.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` con los cambios realizados.
- El repo tiene 243 descargas y 1 like, por lo que la validacion comunitaria es todavia limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
