# xbill9/gemma-4-31B-it-qat-w8a8-int8-emb4

## Resumen

Este repositorio contiene una reconstruccion no oficial de los pesos de Gemma 4 31B-it con entrenamiento consciente de cuantizacion (QAT) de Google DeepMind, publicada por el usuario independiente xbill9. El modelo parte de `google/gemma-4-31B-it-qat-q4_0-unquantized` (revision `1e4d8be`) y redistribuye unicamente el modelo de texto, almacenado en el formato compressed-tensors int8 W8A8: pesos int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecucion. La tabla de embeddings (`embed_tokens`) y la cabeza de salida (`lm_head`) se conservan en int4 (grupo 32, escalas fp16) del build hermano `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4`, dado que el QAT ya coloco la embedding en la misma rejilla de 4 bits que las capas lineales.

El checkpoint ocupa 28,76 GiB (frente a los 29,91 GiB de la variante con embeddings en bf16) y declara 32.106.631.484 parametros en la metadata de safetensors. La motivacion es ofrecer una variante int8 W8A8 optimizada para vLLM, con embeddings int4 para reducir el peso en disco y memoria, manteniendo la mayor parte de la precision de los pesos QAT originales gracias a un error relativo de cuantizacion inferior al 1,4 % por capa.

Es relevante ahora porque Gemma 4 es un modelo reciente de Google DeepMind y este tipo de builds comunitarias permiten desplegar la variante de 31B en hardware con memoria limitada usando vLLM. El propio autor advierte de que el modelo esta construido y verificado en local frente a su fuente, pero aun no ha sido servido ni evaluado, y esta en cola para una prueba de servicio en una AMD Instinct MI300X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 de Google DeepMind (transformador, variante de texto); no se detalla en la informacion disponible si es densa o MoE |
| Parametros totales | 32.106.631.484 (metadata real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 para las lineales (pesos int8, escala bf16 por canal de salida, activaciones int8 por token en runtime); int4 grupo 32 con escalas fp16 para `embed_tokens` y `lm_head`; procedente de pesos QAT en rejilla Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`format: int-quantized`) |
| Tamano del repositorio | 30,9 GB |
| Tamano del checkpoint | 28,76 GiB (embeddings int4) frente a 29,91 GiB (embeddings bf16) |
| Libreria declarada | vllm |
| Modalidad | solo texto |
| Modelo base | google/gemma-4-31B-it-qat-q4_0-unquantized (revision 1e4d8be) |
| Descargas / likes | 17 / 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 en su variante `31B-it` de Google DeepMind, originalmente publicada con entrenamiento consciente de cuantizacion (QAT). El autor de este repositorio no ha reentrenado el modelo: ha tomado los pesos QAT de `google/gemma-4-31B-it-qat-q4_0-unquantized`, que ya se encontraban en la rejilla Q4_0, y los ha redondeado a int8 por canal. El proceso no utiliza datos de calibracion ("No calibration data is used") y se ejecuta mediante los scripts `w8a8_from_qat.py` y `w8a8_emb4.py`, que a su vez importan los helpers de `repack_q4_0.py` incluidos en el propio repositorio.

La innovacion tecnica de este build es la combinacion de precisiones: las capas lineales (`mlp`, `self_attn`) se almacenan en int8 W8A8 con escala bf16 por canal, mientras que las tablas de embedding y la cabeza de salida se copian sin cambios desde el build `w4a16-ct-text-emb4` en int4. `lm_head` esta desacoplado (`untied`). Segun la model card, QAT situo la embedding en la misma rejilla de 4 bits que las lineales, por lo que esas tablas conservan los valores entrenados. El error relativo de la cuantizacion int8 frente a los pesos QAT por tipo de tensor es el siguiente: `mlp.down_proj` 0,93 %–1,18 % (media 1,02 %); `mlp.gate_proj` 0,80 %–0,97 % (media 0,87 %); `mlp.up_proj` 0,80 %–0,99 % (media 0,85 %); `self_attn.k_proj` 0,83 %–1,35 % (media 0,97 %); `self_attn.o_proj` 0,82 %–1,16 % (media 0,98 %); `self_attn.q_proj` 0,83 %–1,07 % (media 0,92 %); `self_attn.v_proj` 0,77 %–1,17 % (media 0,93 %). No se detalla en la informacion disponible la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, ya que el modelo base es una variante instruct (`-it`).
- Capacidad de razonamiento y generacion de codigo heredada del modelo Gemma 4 31B-it original, aunque no se han publicado evaluaciones especificas de este build.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los tags del repositorio no listan idiomas).
- Capacidad especial: build optimizado para inferencia int8 W8A8 en vLLM con embeddings int4, orientado a reducir huella de memoria y mejorar el decoding.
- Modalidad restringida a texto (`text-only`).

## Casos de uso

- Servicio de chat conversacional en produccion mediante vLLM: el modelo esta empaquetado en safetensors con compressed-tensors int8 W8A8, un formato que vLLM consume de forma nativa, lo que simplifica el despliegue de una variante int8 del Gemma 4 31B-it con menor huella de memoria que una version en bf16.
- Despliegue en hardware con memoria limitada: gracias a los embeddings int4, el checkpoint baja a 28,76 GiB frente a los 29,91 GiB de la variante con embeddings bf16, lo que facilita alojarlo en aceleradores de 32 GiB o superiores sin necesidad de offload completo.
- Automatizacion de tareas de generacion de texto a gran escala: al estar cuantizado a int8 para pesos y activaciones, puede aumentar el throughput por GPU en comparacion con la variante bf16, si bien el autor no ha publicado mediciones.
- Integracion en pipelines existentes de vLLM: al declarar `library_name: vllm` y usar compressed-tensors, encaja en infraestructuras que ya sirven modelos cuantizados con esa libreria, sin necesidad de conversion adicional.
- Evaluacion y comparacion de estrategias de cuantizacion: los scripts incluidos (`w8a8_from_qat.py`, `w8a8_emb4.py`, `repack_q4_0.py`) permiten reproducir el proceso y comparar el error relativo por capa frente a los pesos QAT originales.
- Pruebas de inferencia en aceleradores AMD: el autor tiene previsto un barrido de servicio en una AMD Instinct MI300X, lo que lo hace candidato para entornos ROCm que sirvan Gemma 4 en int8.
- Prototipado rapido de asistentes de texto en castellano u otros idiomas: siempre que se valide previamente el comportamiento multilingue, ya que no se documenta el soporte de idiomas de este build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica explicitamente que el modelo "no ha sido servido ni evaluado todavia" y que esta en cola para una prueba de servicio en una AMD Instinct MI300X. El unico dato cuantitativo publicado es el error relativo de la cuantizacion int8 frente a los pesos QAT, por tipo de tensor:

| Capa | Tensores | Error relativo int8 frente a QAT |
|---|---:|---|
| `mlp.down_proj` | 60 | 0,93 %–1,18 % (media 1,02 %) |
| `mlp.gate_proj` | 60 | 0,80 %–0,97 % (media 0,87 %) |
| `mlp.up_proj` | 60 | 0,80 %–0,99 % (media 0,85 %) |
| `self_attn.k_proj` | 60 | 0,83 %–1,35 % (media 0,97 %) |
| `self_attn.o_proj` | 60 | 0,82 %–1,16 % (media 0,98 %) |
| `self_attn.q_proj` | 60 | 0,83 %–1,07 % (media 0,92 %) |
| `self_attn.v_proj` | 50 | 0,77 %–1,17 % (media 0,93 %) |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 28,76 GiB, correspondiente al checkpoint con embeddings int4. Hay que anadir la memoria de la cache KV y de las activaciones, cuyo tamano depende de la longitud de contexto y del numero de secuencias concurrentes, no disponible en la informacion proporcionada.
- GPU recomendadas: la model card menciona una AMD Instinct MI300X para el barrido de servicio pendiente. Por tamano, tambien encaja en aceleradores con 32 GiB o mas, como NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB o similares.
- Compatibilidad con GPU de consumo: los 28,76 GiB de pesos no caben en una RTX 4090 de 24 GB ni en una RTX 3090 de 24 GB sin recurrir a offload a CPU o a un formato de cuantizacion mas agresivo. La informacion disponible no documenta ninguna configuracion validada en GPU de consumo.
- Opciones de despliegue: vLLM es la libreria declarada por el autor y el formato compressed-tensors esta pensado para ese motor. No se mencionan en la informacion disponible otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica que el modelo aun no se ha servido, por lo que no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-31B-it-qat-w8a8-int8-emb4 (este) | 32.106.631.484 | int8 W8A8 + embeddings int4 | no disponible | apache-2.0 | Construido y verificado en local, sin servir ni evaluar |
| xbill9/gemma-4-31B-it-qat-w8a8-int8 | no disponible | int8 W8A8 con embeddings bf16 | no disponible | apache-2.0 | Build hermano; tensores identicos salvo embeddings |
| xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4 | no disponible | int4 W4A16 con embeddings int4 | no disponible | apache-2.0 | Build hermano; origen de las tablas int4 |
| google/gemma-4-31B-it-qat-q4_0-unquantized | no disponible | QAT en rejilla Q4_0 sin cuantizar | no disponible | apache-2.0 | Modelo base oficial de Google DeepMind |

## Limitaciones y advertencias

- Solo texto: el build no incluye ninguna capacidad multimodal.
- No ha sido servido ni evaluado: el autor lo indica de forma explicita, por lo que no existe ninguna validacion de calidad, latencia o estabilidad en produccion.
- Build no oficial: no esta afiliado ni respaldado por Google, y los problemas deben reportarse en el repositorio de xbill9, no a Google.
- Sin datos de calibracion: la conversion a int8 se hace redondeando los pesos QAT sin calibracion, lo que introduce un error relativo por tensor de hasta el 1,35 % en `self_attn.k_proj`.
- Idiomas no documentados: la ficha no lista idiomas soportados, por lo que el comportamiento multilingue no esta garantizado.
- Longitud de contexto no disponible: no se puede planificar el uso con contextos largos sin consultar la documentacion del modelo base.
- Riesgo de alucinacion: no evaluado en este build; se hereda el comportamiento del Gemma 4 31B-it original, no caracterizado aqui.
- Licencia Apache 2.0 con enlace especifico: la model card apunta a la licencia de Gemma 4 (`license_link: https://ai.google.dev/gemma/docs/gemma_4_license`), por lo que conviene revisar las condiciones de uso comercial de Gemma antes de desplegarlo.
- Uso de `lm_head` desacoplado (`untied`): hay que tenerlo en cuenta si se reutilizan componentes del checkpoint en otros pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-31B-it-qat-w8a8-int8-emb4
- Modelo base oficial: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Build hermano con embeddings bf16: https://huggingface.co/xbill9/gemma-4-31B-it-qat-w8a8-int8
- Build hermano con embeddings int4 (origen de las tablas int4): https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4
- Otro build del mismo autor (variante E2B): https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-int8
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo: "4-Bit Embeddings Decode up to 1.39x Faster on One L4": https://dev.to/aws-builders/gemma-4-on-amazon-sagemaker-4-bit-embeddings-decode-up-to-139x-faster-on-one-l4-36mf
- Articulo: "Gemma 4 QAT on One TPU v5e: What Runs and What Doesn't": https://dev.to/gde/gemma-4-qat-on-one-tpu-v5e-what-runs-and-what-doesnt-2gii
