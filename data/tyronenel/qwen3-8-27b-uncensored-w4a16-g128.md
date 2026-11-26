# TyroneNel/Qwen3.8-27B-Uncensored-W4A16-g128

## Resumen
Orca-Qwen3.8-27B-Uncensored-W4A16 es una cuantización de 4 bits (W4A16) del modelo abliterated (sin rechazos) `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del `Qwen/Qwen3.8-27B` de Alibaba. El autor del checkpoint es TyroneNel, y el objetivo es servir un modelo de vision-lenguaje de gran tamano en una unica GPU de 24 GB (clase RTX 3090) mediante vLLM y el stack HyperQwen, conservando la torre de vision, la cabeza de decodificacion especulativa MTP y el soporte de tool calling.

El modelo combina un cuerpo de decodificador cuantizado a int4 (group size 128, simetrico, generado con Intel AutoRound y empaquetado en formato `compressed-tensors` con kernels Marlin en Ampere) con cabezas en int8 (`lm_head`, `embed_tokens` y el modulo MTP) y una torre de vision que permanece en BF16. El resultado ocupa 16,7 GB en disco (67 ficheros safetensors, 2.022 tensores) y, segun el autor, alcanza 116 tok/s en decodificacion monousuario y 947 tok/s en servicio por lotes con 64 peticiones concurrentes en una RTX 3090.

Es relevante porque demuestra que un modelo multimodal de razonamiento y function calling puede desplegarse en hardware de consumo con perdida de calidad marginal: la perplejidad medida (8,216 frente a 8,186 del checkpoint oficial AutoRound) y el GSM8K (94,5 % en ambos) son practicamente identicos al modelo de referencia. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza uncensored del modelo base implica riesgos de contenido que el integrador debe mitigar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (incluye GatedDeltaNet) y modulo MTP de decodificacion especulativa; vision-lenguaje |
| Parametros totales | 4.537.038.374 (segun safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 49.152 tokens en la configuracion medida; 32.768 en el ejemplo de vLLM de la model card |
| Tipos de cuantizacion | W4A16 int4 group 128 simetrico (cuerpo), int8 group 128 (lm_head, embed_tokens, MTP), BF16 (vision tower, normas, in_proj_a/in_proj_b) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized), 67 ficheros, 16,7 GB |

## Arquitectura y entrenamiento
El checkpoint es una cuantizacion, no un entrenamiento desde cero. El cuerpo del decodificador (64 capas lineales) se cuantizo con Intel AutoRound bajo el esquema `W4A16 --bits 4 --group_size 128`, usando 128 muestras de calibracion de 2.048 tokens y exportacion via `auto_round:llm_compressor`. Las cabezas `lm_head`, `embed_tokens` y las 8 capas lineales del modulo MTP se cuantizaron a int8 con redondeo al mas cercano, con error relativo frente a los pesos BF16 de origen de 0,0064 para `lm_head` y de 0,0066 a 0,0153 para las lineales MTP. La torre de vision (333 tensores), las normas y las proyecciones `in_proj_a`/`in_proj_b` de GatedDeltaNet se mantienen en BF16 sin tocar.

La cabeza de borrador MTP (`mtp.draft_lm_head`) usa 40.960 filas recortadas del `lm_head` int8, con los ids en `mtp_draft_vocab_ids.pt`; ese vocabulario de borrador cubre el 98,39 % de los tokens de salida retenidos. La abliteracion (eliminacion de la direccion de rechazo) es una propiedad del modelo BF16 de origen y se conserva intacta. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su construccion.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con modo thinking (se puede desactivar; los benchmarks se midieron con thinking off).
- Capacidades de vision-lenguaje: pipeline `image-text-to-text` con torre de vision en BF16.
- Function calling y tool calling conservados en la cuantizacion.
- Razonamiento multi-paso y uso como agente.
- Decodificacion especulativa mediante cabeza MTP integrada (y soporte del drafter externo DFlash2 en el stack HyperQwen).
- Generacion de codigo y matematicas (GSM8K con cadena de pensamiento).
- Ausencia de rechazos por abliteracion: responde a peticiones que el modelo base rechazaria.

## Casos de uso
- Asistencia conversacional sin filtros editoriales: el modelo mantiene conversaciones multi-turno en ingles y chino con hasta 49k tokens de contexto, util para entornos de investigación donde se necesita estudiar el comportamiento del modelo sin rechazos.
- Analisis de documentos con imagenes: al conservar la torre de vision, puede procesar capturas, diagramas o formularios junto con texto largo en una sola GPU de 24 GB, por ejemplo para extraccion de datos de facturas o tickets.
- Agente con tool calling en local: integrable en flujos de automatizacion que requieren llamadas a funciones (APIs internas, bases de datos) sin depender de servicios en la nube, gracias al soporte de function calling y al modo thinking.
- Generacion de codigo en pipelines de CI/CD: con GSM8K del 94,5 % y perplejidad de 3,27 en codigo Python, es adecuado para autocompletado, generacion de tests o revision de parches en un runner con RTX 3090.
- Servicio por lotes de bajo coste: con 947 tok/s a 64 peticiones concurrentes (128 entrada / 512 salida), sirve para tareas de anotacion masiva, resumen o clasificacion de corpus en una sola maquina.
- Investigación sobre alineacion y seguridad: la comparacion entre el modelo base (99,0 % de rechazos en AdvBench) y esta variante (0,0 %) lo convierte en una herramienta para estudiar direcciones de rechazo y tecnicas de abliteracion.
- Despliegue en estaciones de trabajo con una sola GPU: el formato `compressed-tensors` con kernels Marlin en Ampere permite servir el modelo en vLLM 0.28 o superior sin infraestructura de centro de datos.

## Benchmarks y rendimiento
Resultados medidos por el autor en una RTX 3090 de 24 GB con vLLM 0.28.0, WSL2 + Docker y thinking desactivado.

Decodificacion monousuario (tok/s, muestreo por defecto / T=0):

| Concurrencia | Este modelo | Variante fast | AutoRound oficial |
|---|---|---|---|
| C1 | 116,1 / 121,1 | 124,9 / 127,8 | 116,6 / 118,9 |
| C2 | 172,6 / 189,2 | 180,3 / 191,2 | 175,7 / 169,6 |
| C4 | 224,7 / 245,5 | 238,1 / 260,3 | 229,4 / 237,6 |
| C8 | 209,8 / 256,7 | 224,7 / 233,5 | 223,6 / 207,4 |

En C1 se aceptan 3,71 / 3,97 tokens por paso de verificacion y el tiempo hasta el primer token es de 186 ms.

Servicio por lotes (tok/s):

| Escenario | Este modelo | Variante fast |
|---|---|---|
| 64 concurrentes, 128 entrada / 512 salida | 947,2 | 1.044,8 |
| 64 concurrentes, 256 entrada / 256 salida | 700,4 | 752,4 |
| Prefill 1.024 tokens | 1.804 | 1.818 |
| Prefill 102.400 tokens | 1.063 | 1.064 |
| 1 prompt de 100k: TTFT / TPOT | 93,0 s / 25,4 ms | 92,9 s / 24,6 ms |
| 4 prompts de 60k, 1.024 salida | 17,1 | 17,4 |

Calidad:

| Checkpoint | PPL total (en / da / codigo) | GSM8K | Tokens medios de respuesta |
|---|---|---|---|
| Este modelo | 8,216 (10,80 / 10,90 / 3,27) | 94,5 % | 384 |
| Variante fast | 8,260 (10,83 / 10,98 / 3,29) | 96,0 % | 384 |
| AutoRound oficial | 8,186 (10,68 / 10,85 / 3,30) | 94,5 % | 379 |

Con n=200, el error estandar de GSM8K es de aproximadamente 1,6 puntos. El autor reporta para el modelo base abliterated (build FP8 por bloques) un 0,0 % de rechazos en AdvBench frente al 99,0 % del modelo original, MMLU del 84,7 % frente al 84,3 % y GSM8K CoT del 88,7 % frente al 90,0 %.

## Requisitos de hardware
- VRAM estimada: 16,7 GB de pesos mas cache KV; la configuracion medida usa 4,22 GiB de KV (`KV_MEM=4529848320`) con `MAX_LEN=49152`, lo que encaja en 24 GB.
- GPU recomendadas: RTX 3090 (referencia medida), A100, H100 y cualquier GPU Ampere o superior con al menos 24 GB; los kernels Marlin estan optimizados para Ampere.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 (24 GB) y modelos equivalentes; no se indica soporte para GPUs de 16 GB o menos.
- Despliegue: vLLM 0.28 o superior con `compressed-tensors`, o el stack HyperQwen (Docker Compose, perfiles `single`) en Linux o WSL2. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 116 tok/s en monousuario, 186 ms de TTFT, 947 tok/s con 64 peticiones concurrentes y 1.804 tok/s de prefill a 1.024 tokens (cifras del autor en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (W4A16) | 4.537.038.374 | 49.152 | 94,5 % | Apache 2.0 | Hugging Face, vLLM |
| Orca-Qwen3.8-27B-Uncensored-W4A16-fast | no disponible | no disponible | 96,0 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-W4A16-AutoRound (oficial) | no disponible | no disponible | 94,5 % | Apache 2.0 | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | no disponible | no disponible | 88,7 % (CoT) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a las variantes derivadas del mismo modelo base.

## Limitaciones y advertencias
- Modelo abliterated: responde a practicamente cualquier peticion (0,0 % de rechazos en AdvBench segun el autor), lo que implica riesgo de generar contenido danino, ilegal o sesgado; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la perdida de alineacion tras la abliteracion.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La cuantizacion int4 introduce una degradacion pequena pero medible: perplejidad de 8,216 frente a 8,186 del checkpoint oficial AutoRound, y GSM8K identico dentro del error estadistico.
- El contexto maximo practico esta limitado por la VRAM: con 4,22 GiB de KV se cubren 49.152 tokens; prompts de 100k requieren 93 s de TTFT en una RTX 3090.
- El soporte esta ligado a vLLM 0.28 o superior y a kernels Marlin en Ampere; no hay garantia de funcionamiento en otras pilas de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero el integrador asume la responsabilidad legal sobre las salidas del modelo sin rechazos.
- El numero de parametros reportado por safetensors (4.537 millones) no coincide con la denominacion "27B" del nombre comercial; conviene verificar el recuento real antes de dimensionar infraestructura.

## Enlaces
- Hugging Face: https://huggingface.co/TyroneNel/Qwen3.8-27B-Uncensored-W4A16-g128
- Modelo base abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante fast: https://huggingface.co/TyroneNel/Orca-Qwen3.8-27B-Uncensored-W4A16-fast
- Stack HyperQwen: https://github.com/syv-ai/HyperQwen
