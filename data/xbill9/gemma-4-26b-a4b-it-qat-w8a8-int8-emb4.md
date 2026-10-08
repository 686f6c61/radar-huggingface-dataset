# xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4

## Resumen

Este repositorio contiene una reconstruccion no oficial de los pesos de Gemma 4 26B-A4B-it en su variante entrenada con conciencia de cuantizacion (QAT) de Google DeepMind, reempaquetados por el usuario independiente xbill9 en formato int8 W8A8 con embeddings en int4. Se trata de un modelo de generacion de texto de arquitectura transformer con mezcla de expertos (MoE), con 25.971.339.294 parametros totales reportados en los safetensors y unas 128 rutas de expertos por capa. El autor lo publica bajo licencia Apache 2.0, manteniendo el modelo original de Google como base.

El problema que resuelve es el de servir un modelo MoE de ~26B en hardware con VRAM limitada sin recurrir a GGUF ni a motores de CPU. Al almacenar los pesos en int8 (con escalas bf16 por canal de salida) y cuantizar las activaciones a int8 por token en tiempo de ejecucion, el checkpoint queda en 23,63 GiB, frente a los 24,23 GiB de la variante con embeddings en bf16. Las tablas de embeddings y `lm_head` se conservan en int4 (grupo 32, escalas fp16) para aprovechar que el QAT ya habia situado esos pesos en la rejilla Q4_0.

Es relevante ahora porque demuestra un flujo de reempaquetado reproducible a partir de pesos QAT (scripts `w8a8_from_qat.py`, `w8a8_emb4.py` y `repack_q4_0.py` incluidos en el repositorio) y porque esta pensado para servirse con vLLM sobre aceleradores como el AMD Instinct MI300X. El propio autor advierte que el modelo aun no ha sido servido ni evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 128 expertos por capa, mas proyecciones MLP densas y atencion (self-attn) en 30 capas |
| Parametros totales | 25.971.339.294 |
| Parametros activos | No disponible de forma explicita; la nomenclatura A4B del modelo base sugiere del orden de 4.000 millones de parametros activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos int8 W8A8 (una escala bf16 por canal de salida), activaciones int8 por token en tiempo de ejecucion; embeddings `embed_tokens` y `lm_head` en int4 (grupo 32, escalas fp16); router `router.proj` en bf16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (con enlace a los terminos de licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (formato compressed-tensors, `int-quantized`) |

Datos adicionales: tamano del repositorio 25,4 GB, checkpoint 23,63 GiB, 16 descargas y 0 likes en el momento del analisis, creado y actualizado el 8 de octubre de 2026, libreria declarada `vllm`.

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: cada una de las 30 capas contiene 128 expertos con proyecciones `gate`, `up` y `down`, ademas de proyecciones MLP densas (`mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`) y los tensores de atencion (`self_attn.q_proj`, `k_proj`, `v_proj`, `o_proj`). El checkpoint de origen almacena los expertos de cada capa como dos bancos fusionados (`experts.gate_up_proj` y `experts.down_proj`); esta build los separa en un modulo por experto con el esquema `experts.{i}.{gate,up,down}_proj`. El router de cada capa (`router.proj`) se mantiene en bf16.

El entrenamiento original es de Google DeepMind con QAT: los pesos ya viven en la rejilla de cuantizacion Q4_0, y esta reconstruccion los redondea a int8 por canal. No se emplea ningun conjunto de calibracion; el unico error introducido es el redondeo de la rejilla Q4_0 a int8, que el autor cuantifica tensor a tensor. Las tablas de embeddings y `lm_head` se copian sin cambios desde una build previa (revision `38971d3`) porque el QAT las habia situado en la misma rejilla de 4 bits que las capas lineales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

Error relativo del redondeo a int8 respecto a los pesos QAT, por tipo de tensor (datos del autor):

| Capa | Tensores | Error relativo int8 frente a QAT |
|---|---:|---|
| `experts.down_proj` | 3.840 | 0,66 %–0,76 % (media 0,69 %) |
| `experts.gate_proj` | 3.840 | 0,69 %–0,98 % (media 0,75 %) |
| `experts.up_proj` | 3.840 | 0,56 %–0,93 % (media 0,75 %) |
| `mlp.down_proj` | 30 | 0,79 %–0,86 % (media 0,82 %) |
| `mlp.gate_proj` | 30 | 0,76 %–0,83 % (media 0,80 %) |
| `mlp.up_proj` | 30 | 0,76 %–0,83 % (media 0,81 %) |
| `self_attn.k_proj` | 30 | 0,81 %–1,29 % (media 0,94 %) |
| `self_attn.o_proj` | 30 | 0,84 %–1,38 % (media 0,96 %) |
| `self_attn.q_proj` | 30 | 0,82 %–1,12 % (media 0,87 %) |
| `self_attn.v_proj` | 25 | 0,80 %–1,15 % (media 0,92 %) |

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el sufijo `-it` del modelo base indican ajuste por instrucciones para dialogos.
- Razonamiento y generacion de contenido en texto: es un modelo `text-generation` de proposito general.
- Mezcla de expertos: al activar solo una parte de los 128 expertos por capa, el coste de inferencia es inferior al de un modelo denso de 26B.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Vision: no. Esta build es explicitamente **text only**, aunque el modelo base de Google pueda ser multimodal.
- Modo de razonamiento explicito o audio: no disponible.

## Casos de uso

- Despliegue de un MoE de ~26B en una GPU unica de 40–48 GB: gracias al checkpoint int8 de 23,63 GiB, el modelo cabe en una A100 40 GB o una L40S 48 GB junto con la cache KV, algo inviable con los pesos en bf16.
- Inferencia de alto rendimiento con vLLM: el repositorio declara `library_name: vllm` y usa el formato compressed-tensors, de modo que se integra directamente en servidores de inferencia con batching continuo y PagedAttention.
- Evaluacion de perdida de fidelidad por cuantizacion: la tabla de error relativo tensor a tensor permite medir el impacto de pasar de la rejilla Q4_0 a int8, util para decidir que formato servir.
- Sustitucion del modelo denso en pipelines RAG con presupuesto de memoria ajustado: al ser text only y estar cuantizado, sirve como generador en sistemas de recuperacion aumentada donde la VRAM es el cuello de botella.
- Investigacion sobre reempaquetado de pesos QAT: los scripts incluidos (`w8a8_from_qat.py`, `w8a8_emb4.py`, `repack_q4_0.py`) sirven como referencia para convertir otros checkpoints QAT a compressed-tensors.
- Pruebas en aceleradores AMD: el autor lo tiene en cola para un barrido de servicio en un AMD Instinct MI300X, por lo que es util como banco de pruebas de vLLM sobre ROCm.
- Prototipado de asistentes conversacionales en entornos controlados: mientras no se publiquen evaluaciones, encaja en pruebas internas donde el riesgo de alucinacion pueda ser revisado manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo esta "built and checked offline against its source; not yet served or evaluated", es decir, verificado frente a su fuente pero no servido ni evaluado. El unico dato numerico de rendimiento disponible es la tabla de error relativo de cuantizacion recogida en la seccion de arquitectura.

## Requisitos de hardware

- VRAM estimada para los pesos: 23,63 GiB en int8 (checkpoint en disco). A esto hay que sumar cache KV y buffers de activacion, por lo que en la practica conviene reservar mas de 24 GiB.
- GPU de datacenter recomendadas: AMD Instinct MI300X (el autor lo tiene en cola para barrido de servicio), NVIDIA A100 40 GB, L40S 48 GB, H100 80 GB.
- Cabe en GPU de consumo: no de forma comoda. Una RTX 4090 con 24 GB queda al limite solo para los pesos, sin margen para cache KV. Una GPU de 32 GB o mas (por ejemplo, RTX 5090) seria el minimo practico.
- Opciones de despliegue: vLLM (libreria declarada y compatible con compressed-tensors). Otros motores que soporten compressed-tensors int8 W8A8 podrian funcionar, pero no se confirma en la informacion disponible. No hay GGUF, por lo que llama.cpp u Ollama no son opciones directas.
- Latencia y throughput: no disponibles. Igualmente, el autor senala que el modelo aun no ha sido servido ni evaluado.
- Estrategia adicional: al ser MoE con aproximadamente 4.000 millones de parametros activos segun la nomenclatura A4B, el coste computacional por token es muy inferior al de un denso de 26B, aunque el consumo de memoria sigue siendo el del total de parametros.

## Comparativa con modelos similares

El autor no proporciona comparaciones con modelos de otras familias. Se comparan aqui las builds de la misma familia, que son las unicas referencias directas disponibles:

| Modelo | Parametros | Cuantizacion | Tamano del checkpoint | Licencia | Notas |
|---|---|---|---|---|---|
| xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4 (este) | 25.971.339.294 | int8 W8A8 + embeddings int4 | 23,63 GiB | apache-2.0 | Embeds y `lm_head` en int4, router en bf16 |
| xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8 | No disponible | int8 W8A8 + embeddings bf16 | 24,23 GiB | apache-2.0 | Mismos tensores salvo embeddings en bf16 |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4 | No disponible | W4A16 int4 + embeddings int4 | No disponible | apache-2.0 | Origen de las tablas int4 copiadas en esta build |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | No disponible | Sin cuantizar (rejilla Q4_0) | No disponible | Apache 2.0 (Gemma 4) | Modelo base de Google; fuente de la revision `f1e06dc` |

No se dispone de informacion sobre modelos comparables de otros autores, ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es una build **no oficial**: no esta afiliada ni respaldada por Google. Los problemas deben reportarse al autor del repositorio, no a Google.
- **Sin evaluar**: el autor indica que el modelo no ha sido servido ni evaluado, por lo que no hay garantia de calidad en generacion, razonamiento o dialogo.
- **Solo texto**: cualquier capacidad multimodal del modelo base de Google queda fuera de esta build.
- **Error de cuantizacion**: el redondeo de la rejilla Q4_0 a int8 introduce un error relativo de hasta el 1,38 % en proyecciones de atencion (`self_attn.o_proj`) y hasta el 0,98 % en expertos. Es pequeno, pero acumulable a lo largo de 30 capas.
- **Sesgos y alucinacion**: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible. Al ser una reconstruccion no evaluada, no se puede asumir que el comportamiento coincida con el del checkpoint original de Google.
- **Licencia**: el repositorio se distribuye como apache-2.0, pero enlaza a los terminos especificos de Gemma 4 de Google. Conviene revisar dichos terminos (por ejemplo, clausulas de uso aceptable) antes de un uso comercial.
- **Compatibilidad de motores**: al no ofrecerse GGUF, el despliegue en CPU o en entornos tipo Ollama no es directo; depende de que el motor soporte compressed-tensors int8 W8A8.
- **Contexto e idiomas desconocidos**: no se informa la longitud de contexto ni los idiomas soportados, lo que limita la planificacion de despliegues multilingues o con ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Build hermana con embeddings en bf16: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8
- Origen de las tablas int4: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4
- Repack W4A16 de referencia: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
