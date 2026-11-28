# Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix-BFP4

## Resumen

Ling-3.0-tiny-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo inclusionAI/Ling-3.0-tiny realizada por Xylolabs para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer hibrido de tipo bailing_hybrid, con 7.893.392.800 parametros totales, que combina mecanismos de atencion KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) junto con capas MLP densas y expertos. Esta version cuantiza a block floating point de 4 bits (bfloat4_b) las matrices de atencion KDA y MLA, las MLP densas, los expertos y el LM head, manteniendo el resto en bf16/float32.

La relevancia de esta ficha radica en que es una de las pocas publicaciones que lleva un modelo de la familia Ling al ecosistema Tenstorrent con un formato de cuantizacion nativo de hardware (BFP4) y utilidades de empaquetado para ttnn. El repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) y un mapeo de pesos documentado, lo que permite reproducir el despliegue en NPUs Tensix. El modelo base esta pensado para generacion de texto y conversacion, con soporte de plantilla de chat.

La cuantizacion reduce el tamano empaquetado de 15,79 GB (BF16) a 4,794 GB, con una divergencia media de KL de 0,0903 frente a BF16 sobre 16.276 posiciones de texto en ingles y coreano, por debajo del limite de 1,5 veces la referencia Q4_K_M (0,0670). La licencia es MIT, lo que facilita su uso comercial, aunque las dependencias del codigo original (CUDA y flash-linear-attention) condicionan el entorno de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (bailing_hybrid) con atencion KDA y MLA, MLP densas y expertos |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) para KDA, MLA, MLP densas, expertos y LM head; bf16/float32 para el resto; referencia Q4_K_M en llama.cpp |
| Idiomas soportados | no disponible (la evaluacion KL cubre ingles y coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta `bfp4/`), con `quant4.json` e indice de pesos |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura hibrida denominada bailing_hybrid, que combina capas de atencion KDA (Kimi Delta Attention, una variante de atencion lineal con estado recurrente) y MLA (Multi-head Latent Attention, con compresion de KV en un espacio latente de baja dimension), junto con capas MLP densas y capas con expertos. Esta mezcla busca reducir el coste de atencion en contextos largos manteniendo capacidad expresiva. La model card de esta version no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base inclusionAI/Ling-3.0-tiny y no se reproduce aqui.

La innovacion tecnica de esta publicacion es la cuantizacion a block floating point de 4 bits (bfloat4_b) nativa de Tenstorrent, aplicada con un esquema de empaquetado especifico para ttnn. Las matrices cuantizadas se empaquetan en tiles con `ttnn.TILE_LAYOUT` y `ttnn.bfloat4_b`, y el repositorio documenta excepciones de reordenacion para `q_b_proj` y `kv_a_proj_with_mqa` en las capas 3, 7, 11, 15, 19 y 23: se conservan las primeras 128 filas (o 512 en `kv_a_proj_with_mqa`) y se reordenan las ultimas 64 filas a indices pares seguidos de impares, con el sufijo rotatorio empezando en cero. Esta reordenacion debe respetarse para que la implementacion de rotary pairs sea consistente con el empaquetado.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas generales en el dominio del modelo base.
- Soporte de cuantizacion BFP4 ejecutable en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn.
- Compatibilidad con Transformers 4.57.1 y flash-linear-attention 0.4.2 para ejecucion en CUDA con `trust_remote_code=True`.
- Capacidades multilingues: no documentadas en esta version; la evaluacion de KL cubre ingles y coreano.
- Tool calling, function calling, agentes y modos de pensamiento: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo esta empaquetado para Wormhole y Blackhole, de modo que se puede servir generacion de texto en NPUs Tensix usando ttnn con pesos BFP4 y un consumo de memoria DRAM reducido (4,794 GB empaquetados).
- Sustitucion de GPUs en inferencia de bajo coste energetico: al ejecutarse en aceleradores Tensix, permite montar endpoints de generacion de texto donde el coste por token y el consumo son prioritarios frente a la latencia pico.
- Prototipado de cuantizacion BFP4: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar el empaquetado y la equivalencia numerica (`ttnn.to_torch(w_tt).float()` frente al tensor original), util para investigar formatos de bloque en 4 bits.
- Evaluacion comparativa de cuantizaciones: la metrica de KL frente a BF16 (0,0903) y frente a Q4_K_M (0,0670) permite comparar la perdida de calidad de BFP4 con otras tecnicas en el mismo modelo y corpus (WikiText-2 y Wikipedia en coreano).
- Integracion en pipelines de Transformers con `device_map="auto"`: util para entornos CUDA existentes que quieran reutilizar el mismo checkpoint con el codigo original del modelo base y `trust_remote_code=True`.
- Base para ajuste fino o evaluacion de modelos hibridos KDA/MLA: al conservar el LM head y el resto de capas en bf16/float32, se puede usar como punto de partida para estudiar el impacto de la cuantizacion selectiva en modelos con atencion lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la divergencia KL frente a BF16:

| Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| `bfp4/` (BFP4) | 4,794 | 0,0903 |
| BF16 (modelo base) | 15,79 | 0 |
| Q4_K_M (llama.cpp) | 4,824 | 0,0670 |

La KL se calcula sobre 16.276 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat, con un limite de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,8 GB para los pesos BFP4 empaquetados; el resto de capas en bf16/float32 anade overhead, por lo que se recomienda reservar al menos 6-8 GB en el dispositivo de destino.
- GPU recomendadas para la ruta CUDA/Transformers: no especificadas; el modelo base de 7,9 mil millones de parametros en bf16 requiere del orden de 16 GB, por lo que encaja en A100, H100, L40S o RTX 4090 con cuantizacion.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas para la ruta BFP4 empaquetada; para la ruta CUDA en bf16 se recomienda 16 GB o mas (RTX 4090, RTX 4080).
- Aceleradores objetivo: NPUs Tenstorrent Wormhole y Blackhole mediante tt-metal/ttnn y tt-forge.
- Opciones de despliegue: ttnn (Tensix), Transformers 4.57.1 con flash-linear-attention 0.4.2 y `trust_remote_code=True`; llama.cpp solo como referencia de cuantizacion Q4_K_M, no como formato de este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-Tenstorrent-Tensix-BFP4 | 7,89 mil millones | no disponible | BFP4 (safetensors, ttnn) | MIT | Hugging Face |
| inclusionAI/Ling-3.0-tiny (BF16) | 7,89 mil millones | no disponible | BF16 (safetensors) | MIT | Hugging Face |
| Ling-3.0-tiny Q4_K_M (llama.cpp) | 7,89 mil millones | no disponible | GGUF Q4_K_M | MIT | Derivado del base |
| Otros modelos de ~7-8B con atencion hibrida | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia media de KL de 0,0903 frente a BF16, superior a la de Q4_K_M (0,0670); puede degradar la calidad en tareas sensibles a precision numerica.
- La evaluacion de calidad solo cubre ingles y coreano; el comportamiento en castellano y otros idiomas no esta documentado.
- El repositorio depende del codigo original del modelo base con `trust_remote_code=True`, lo que implica ejecutar codigo remoto y depender de versiones concretas (Transformers 4.57.1, flash-linear-attention 0.4.2).
- El empaquetado Tensix requiere respetar el reordenamiento de `q_b_proj` y `kv_a_proj_with_mqa` en capas concretas; una implementacion incorrecta de rotary pairs produce resultados erroneos.
- Riesgo de alucinacion y sesgos: no documentados en esta version; deben evaluarse sobre el modelo base antes de usarlo en produccion.
- La licencia MIT se aplica segun la model card, pero el codigo original conserva cabecera Apache-2.0 y el `configuration` del modelo base se distribuye sin cabecera de licencia; conviene revisar `LICENSE`, `NOTICE` y `LICENSE-CODE` antes de un uso comercial.
- No se dispone de datos de contexto maximo, parametros activos ni benchmarks de tareas, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ling-3.0-tiny-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Revision del modelo base citada: https://huggingface.co/inclusionAI/Ling-3.0-tiny/tree/9a98e35fe1c9ee255f78dd64771c7ae15a799481
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
