# TyroneNel/Qwen3.8-27B-Uncensored-W4A16-fast

## Resumen

TyroneNel/Qwen3.8-27B-Uncensored-W4A16-fast es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B-Uncensored, una variante "abliterated" (dirección de rechazo eliminada) del Qwen3.8-27B de Alibaba. El autor, TyroneNel, publica esta variante "fast" que reduce el peso del `lm_head` y del módulo MTP (multi-token prediction) a int4 GPTQ, manteniendo el cuerpo decodificador en int4 g128 simétrico generado con AutoRound. El resultado ocupa 15,8 GB en disco y está pensado para servirse en una única GPU de 24 GB (clase RTX 3090) con el stack HyperQwen sobre vLLM 0.28.0.

El modelo cubre el pipeline image-text-to-text, por lo que conserva la torre de visión del modelo original en BF16, y añade capacidades de razonamiento, function calling y decodificación especulativa mediante MTP. Su relevancia actual reside en que demuestra que es posible servir un modelo multimodal de ~27B de parámetros (4.298.815.014 parámetros reales en safetensors) en hardware de consumo con pérdidas de calidad medibles y pequeñas: 0,5 % de perplejidad adicional y diferencias de GSM8K no significativas estadísticamente.

La licencia es Apache 2.0, heredada del Qwen3.8-27B original, y los idiomas declarados son inglés y chino, aunque el autor incluye datos de calibración en danés y código Python. La model card reporta métricas de throughput y latencia medidas en una RTX 3090, lo que facilita la evaluación de su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con módulo MTP para decodificación especulativa; derivado de Qwen3.8-27B |
| Parametros totales | 4.298.815.014 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 49.152 tokens en la configuración de referencia (`MAX_LEN=49152`) |
| Tipos de cuantizacion | W4A16: cuerpo decodificador int4 g128 simétrico (AutoRound); `lm_head` y MTP int4 GPTQ g128 simétrico; `embed_tokens`, torre de visión y normas en int8/BF16 |
| Idiomas soportados | en, zh (datos de calibración adicionales en danés y código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM y Marlin) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. La cadena de linaje es: Qwen/Qwen3.8-27B (Apache 2.0) → orcarouter/Qwen3.8-27B-Uncensored (BF16 con abliteration, es decir, eliminación de la dirección de rechazo en el espacio de activaciones) → Orca-Qwen3.8-27B-Uncensored-W4A16 (cuerpo int4 g128 con AutoRound, `lm_head`/`embed_tokens`/MTP en int8) → este modelo (mismos 65 de 67 archivos byte-idénticos, con `lm_head` y MTP requantizados a int4 GPTQ). La torre de visión y las normas permanecen sin cambios.

La innovación técnica principal es la requantización del `lm_head` a int4 GPTQ con 300.000 filas de calibración capturadas de las propias generaciones del modelo, lo que reduce en ~0,65 GB la lectura por paso de decodificación. El módulo MTP (8 capas lineales) también pasa a int4 GPTQ, y la cabeza de borrador (draft head) se construye con un vocabulario de 40.960 ids contados sobre 6.761 generaciones propias (4,85 M tokens de salida, 3.119 con thinking activado), con cobertura del 97,90 % en el 10 % reservado. El error relativo de dequantización sube de 0,0064 (int8) a 0,1408 (int4) en el `lm_head`, y de 0,0066–0,0153 a 0,141–0,170 en el MTP. No se reporta información sobre el dataset de preentrenamiento original ni sobre el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo "thinking" (se reportan generaciones con thinking activado en la calibración del draft head).
- Capacidades de visión: pipeline image-text-to-text con torre de visión conservada en BF16.
- Function calling / tool calling, según los tags del modelo.
- Razonamiento multi-paso y uso como agente, con soporte de decodificación especulativa MTP.
- Generación de código (evaluado con perplejidad sobre fuente Python).
- Razonamiento matemático (GSM8K evaluado con 96,0 % de exact match).
- Servido compatible con endpoints y con vLLM (incluido backend Marlin).
- Variante "uncensored" por abliteration: se elimina la dirección de rechazo del modelo base.

## Casos de uso

- Asistente conversacional self-hosted en una RTX 3090: el modelo cabe en 24 GB con `KV_MEM` de 4,22 GiB y `MAX_LEN=49152`, permitiendo conversaciones multi-turno con contexto largo en hardware de consumo.
- Atención al cliente automatizada: con 49.152 tokens de contexto y prefix caching activado, puede gestionar hilos largos de conversación y documentos de referencia sin truncar.
- Generación de código en pipelines de CI/CD: el soporte de function calling y su perplejidad de 3,29 sobre código Python lo hacen adecuado para autocompletado y revisión de parches.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer información de capturas, diagramas o formularios en flujos image-text-to-text.
- Razonamiento matemático por lotes: con GSM8K del 96,0 % y throughput de 1.044,8 tok/s a 64 peticiones concurrentes, es viable para evaluación masiva de problemas.
- Servicio de inferencia por lotes: 752,4 tok/s con 64 concurrentes y 256 in/256 out, adecuado para backends de generación a escala media en una sola GPU.
- Investigación sobre alineación y abliteration: al ser una variante sin dirección de rechazo, sirve para estudiar comportamiento de modelos desalineados en entornos controlados.
- Despliegue con decodificación especulativa: el MTP int4 con vocabulario propio permite 3,70–3,93 tokens aceptados por paso de verificación y 175 ms de TTFT en single-user.

## Benchmarks y rendimiento

Throughput single-user en RTX 3090 (24 GB), HyperQwen sobre vLLM 0.28.0, thinking off, `SPEC=dflash2`, en tok/s (T=default / T=0):

| Concurrencia | Este modelo | Build g128 | AutoRound base oficial |
|---|---|---|---|
| C1 | 124,9 / 127,8 | 116,1 / 121,1 | 116,6 / 118,9 |
| C2 | 180,3 / 191,2 | 172,6 / 189,2 | 175,7 / 169,6 |
| C4 | 238,1 / 260,3 | 224,7 / 245,5 | 229,4 / 237,6 |
| C8 | 224,7 / 233,5 | 209,8 / 256,7 | 223,6 / 207,4 |

Batch serving (KV fp8, sin especulación):

| Escenario | Este modelo | Build g128 |
|---|---|---|
| 64 concurrentes, 128 in / 512 out | 1.044,8 tok/s | 947,2 tok/s |
| 64 concurrentes, 256 in / 256 out | 752,4 tok/s | 700,4 tok/s |
| Prefill 1.024 tokens | 1.818 tok/s | 1.804 tok/s |
| Prefill 102.400 tokens | 1.064 tok/s | 1.063 tok/s |
| 1 × 100k prompt: TTFT / TPOT | 92,9 s / 24,6 ms | 93,0 s / 25,4 ms |
| 4 × 60k prompts, 1.024 out | 17,4 tok/s | 17,1 tok/s |

Calidad:

| Checkpoint | PPL all (en / da / code) | GSM8K | Tokens medios de respuesta |
|---|---|---|---|
| Este modelo | 8,260 (10,83 / 10,98 / 3,29) | 96,0 % | 384 |
| Build g128 | 8,216 (10,80 / 10,90 / 3,27) | 94,5 % | 384 |
| AutoRound base oficial | 8,186 (10,68 / 10,85 / 3,30) | 94,5 % | 379 |

El error estándar de GSM8K con n=200 es de ~1,6 puntos, por lo que la diferencia no es significativa. No se reportan resultados de MMLU, HumanEval ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: 15,8 GB de pesos en disco; con `KV_MEM=4529848320` (4,22 GiB) y overhead de runtime, encaja en 24 GB.
- GPU recomendada: RTX 3090 (24 GB) es la referencia medida; también válida cualquier GPU de 24 GB o superior (RTX 4090, A100, H100) con margen para mayor contexto o concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB). No se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM 0.28.0 con el stack HyperQwen (Linux o WSL2 + Docker), backend Marlin para compressed-tensors; no se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 175 ms en C1; 124,9 tok/s single-user; 1.044,8 tok/s en batch de 64 concurrentes; TPOT de 24,6 ms con prompt de 100k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo | 4.298.815.014 | 49.152 | Apache 2.0 | safetensors W4A16 | Multimodal, uncensored, MTP |
| Orca-Qwen3.8-27B-Uncensored-W4A16 (g128) | no disponible | 49.152 (misma config) | Apache 2.0 | safetensors W4A16 | Mismo cuerpo, `lm_head` int8; 16,7 GB |
| AutoRound base oficial | no disponible | no disponible | Apache 2.0 | safetensors | Sin abliteration; 16,7 GB aprox. |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Apache 2.0 | BF16 | Modelo original sin cuantizar |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo, lo que puede producir respuestas inapropiadas o dañinas sin filtro; no es apto para despliegues públicos sin moderación adicional.
- Riesgo de alucinación inherente al modelo base; no se reportan evaluaciones de factualidad.
- Idiomas oficiales limitados a inglés y chino; el rendimiento en castellano no está evaluado.
- La cuantización int4 introduce un 0,5 % adicional de perplejidad y un error relativo de dequantización de 0,14 en `lm_head` y MTP, con posible degradación en tareas sensibles a la precisión numérica.
- El soporte está ligado al stack HyperQwen y vLLM 0.28.0; otras herramientas (llama.cpp, Ollama, TGI) no están documentadas.
- El vocabulario de borrador propio cubre el 97,90 % de tokens frente al 98,39 % del genérico, lo que puede reducir la tasa de aceptación en dominios alejados de los prompts de calibración (chat inglés, código, instrucciones en danés, GSM8K).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base "uncensored" puede incumplir políticas de plataformas o requisitos regulatorios según jurisdicción.
- El contexto máximo probado es 49.152 tokens; no se garantiza estabilidad más allá de esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TyroneNel/Qwen3.8-27B-Uncensored-W4A16-fast
- Build g128: https://huggingface.co/TyroneNel/Orca-Qwen3.8-27B-Uncensored-W4A16
- Modelo base uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Stack HyperQwen: https://github.com/syv-ai/HyperQwen
