# vmarcelo/ThinkingCap-Qwen3.8-27B-MIX_GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-MIX_GGUF es una cuantización GGUF de precisión mixta (mixed-tensor) del modelo bottlecapai/ThinkingCap-3.8-27B, a su vez un fine-tune del Qwen3.8-27B de Qwen. La publica el usuario vmarcelo y su objetivo es doble: reducir el tamaño del archivo frente a la cuantización IQ4_XS estándar publicada (13,40 GB y 3,924 BPW frente a 15,48 GB y 4,25 BPW) y conservar la calidad de respuesta del modelo original, que está ajustado para razonar con muchos menos tokens que su base.

La pieza técnica clave es la receta de cuantización por tensores: el archivo reparte los bits de forma desigual, recortando con agresividad el bloque feed-forward (el 62,6 % de los parámetros) en las capas tempranas y protegiendo en Q8_0/Q5_K los tensores sensibles de esta arquitectura híbrida (ssm_alpha, ssm_beta, attn_k, attn_v) y la cabeza MTP. Esa cabeza MTP viaja embebida en el propio GGUF, de modo que la decodificación especulativa se activa sin necesidad de un segundo archivo de draft.

El modelo es multimodal (pipeline image-text-to-text) y multilingüe, con 27.320.697.856 parámetros y un repositorio de 13,4 GB. Su relevancia práctica está en que permite ejecutar un modelo de ~27B con visión y razonamiento en una GPU de 16 GB con contextos de aproximadamente 83K tokens usando caché KV en Q8_0, un escenario que las cuantizaciones de 4,25 BPW no alcanzan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal/SSM tipo GatedDeltaNet combinada con atención completa; 65 bloques, de los cuales solo 16 son de atención completa |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | No aplica: no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible como máximo nativo; se documenta funcionamiento con ~83K tokens en una GPU de 16 GB con caché KV en Q8_0 (34 KiB/token) |
| Tipos de cuantización | IQ4_XS-MIX a 3,924 BPW (`general.file_type` 30, MOSTLY_IQ4_XS); mezcla por tensores de IQ2_XXS, IQ3_XXS, IQ4_XS, Q3_K, Q4_K, Q5_K, Q6_K y Q8_0 |
| Idiomas soportados | Multilingüe |
| Licencia | PolyForm Small Business License 1.0.0 (el modelo base Qwen3.8-27B es Apache-2.0) |
| Formato de pesos | GGUF (llama.cpp); requiere un archivo `mmproj` aparte en f16 para las capacidades de visión |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido: la mayoría del cómputo recae sobre capas de atención lineal con componentes de espacio de estado (SSM) y solo 16 de los 65 bloques emplean atención completa. Esta proporción es la que explica el tamaño reducido de la caché KV (64 KiB/token en F16 y 34 KiB/token en Q8_0), muy por debajo de lo habitual en un transformer denso de 27B, y es también el motivo por el que la receta de cuantización protege explícitamente tensores frágiles en modelos híbridos GatedDeltaNet como `ssm_alpha` y `ssm_beta` (Q8_0), `attn_gate` (Q5_K), `ssm_out` y `attn_qkv` (IQ4_XS), `attn_k` y `attn_v` (Q8_0), `attn_output` (Q5_K) y `output.weight` (Q5_K).

La cuantización se realizó directamente desde el GGUF en f16 de BottleCap con llama.cpp en el commit `58367713a`, sin reconversión, de modo que la cabeza MTP, el tokenizador y la plantilla de chat son exactamente los publicados. La matriz de importancia se calculó sobre una copia IQ4 de 13,4 GB del modelo (583 chunks a contexto 512, ~3,2 s por pasada) en lugar del f16 de 54,7 GB, para que permaneciese residente en VRAM. El reparto de bits del feed-forward por profundidad es: bloques 0–15 con `IQ2_XXS`/`IQ2_XXS`/`IQ3_XXS`, bloques 16–51 con `IQ3_XXS`/`IQ3_XXS`/`IQ4_XS`, bloques 52–62 con `IQ4_XS`/`IQ4_XS`/`Q5_K`, y el bloque 63 con `Q4_K`/`Q6_K`/`Q6_K`; `token_embd` se cuantiza a `Q3_K` y el bloque MTP a `Q6_K`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat Jinja preservada del modelo original.
- Razonamiento con presupuesto reducido de tokens: el fine-tune ThinkingCap está diseñado para mantener la calidad de respuesta razonando en muchos menos tokens que la base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), siempre que se cargue el `mmproj` en f16 de BottleCap.
- Soporte multilingüe según los metadatos del repositorio.
- Decodificación especulativa mediante cabeza MTP embebida, activable con `--spec-type draft-mtp` sin archivo draft adicional.
- Compatibilidad con endpoints y uso conversacional (etiquetas `endpoints_compatible` y `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento explícito diferenciado: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en本地: desplegado con llama-server sobre una GPU de 16 GB, el modelo puede mantener conversaciones multi-turno con ventanas de hasta ~83K tokens usando caché KV en Q8_0, lo que permite hilos largos sin truncar el historial.
- Análisis de documentos extensos con soporte visual: gracias al `mmproj`, se pueden pasar capturas, diagramas o páginas escaneadas junto con el texto y pedir resúmenes o extracción de datos en una única pasada.
- Razonamiento con coste de tokens contenido: al estar ajustado para razonar en menos tokens, resulta adecuado en pipelines por lotes donde el coste de generación por consulta es el factor limitante.
- Servicio de inferencia self-hosted con decodificación especulativa: activar la cabeza MTP embebida acelera la generación sin necesidad de gestionar un segundo modelo draft, lo que simplifica el despliegue en producción.
- Prototipado y evaluación de modelos de ~27B en hardware de consumo: el archivo de 13,40 GB cabe en tarjetas de 16 GB, lo que permite a desarrolladores individuales e investigadores probar un modelo multimodal grande sin acceso a clústeres.
- Traducción y atención al cliente multilingüe: el soporte multilingüe declarado permite atender consultas en varios idiomas manteniendo el mismo endpoint y la misma plantilla de chat.
- Integración en LM Studio u otros frontales GGUF: el repositorio incluye `config.json` y `generation_config.json` con metadatos de arquitectura para que el modelo se detecte correctamente en estos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de cuantización (3,924 BPW, 13,40 GB frente a los 15,48 GB y 4,25 BPW del IQ4_XS publicado) y de rendimiento de la matriz de importancia (~3,2 s por pasada sobre 583 chunks a contexto 512), no resultados de calidad en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos: 13,40 GB en disco para el único archivo GGUF `ThinkingCap-Qwen3.8-27B-IQ4_XS-MIX-3.92bpw.gguf`.
- VRAM para inferencia: el propio autor documenta que en una tarjeta de 16 GB caben aproximadamente 83K tokens de contexto con caché KV `Q8_0`/`Q8_0`, reservando ~0,8 GiB de sobrecarga fija (compositor, buffers de cómputo, estado recurrente) y manteniendo pesos + KV por debajo de 15,9 GiB.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB. En GPUs de 8 GB los pesos no entran completos y habría que repartir capas entre GPU y CPU.
- Estimación orientativa (derivada de los datos anteriores, no publicada por el autor): en una GPU de 24 GB quedarían unos 9,8 GiB para caché KV, lo que daría del orden de 290K tokens con KV en Q8_0; el límite real dependerá del contexto nativo máximo del modelo, que no se especifica.
- Caché KV: 64 KiB/token en F16 y 34 KiB/token en Q8_0, gracias a que solo 16 de los 65 bloques son de atención completa.
- Opciones de despliegue: llama.cpp / llama-server (comando de ejemplo proporcionado por el autor), LM Studio y cualquier runtime compatible con GGUF. Compatibilidad con vLLM o TGI: no disponible.
- Configuración de referencia del autor: `-ngl 999 -c 65536 -b 2048 -ub 512 -t 12 -np 1 --cont-batching --jinja --flash-attn on --cache-type-k q8_0 --cache-type-v q8_0 --kv-unified --spec-type draft-mtp --spec-draft-n-max 3`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y tamaño | BPW | Contexto | Licencia |
|---|---|---|---|---|---|
| vmarcelo/ThinkingCap-Qwen3.8-27B-MIX_GGUF (IQ4_XS-MIX) | 27,32B | GGUF, 13,40 GB | 3,924 | No disponible | PolyForm Small Business 1.0.0 |
| ThinkingCap-Qwen3.8-27B-GGUF, IQ4_XS publicado | 27,32B | GGUF, 15,48 GB | 4,25 | No disponible | PolyForm Small Business 1.0.0 |
| bartowski/Qwen3.8-27B-GGUF | No disponible | GGUF | No disponible | No disponible | No disponible |
| Qwen/Qwen3.8-27B (modelo base) | No disponible | safetensors | f16/bf16 | No disponible | Apache-2.0 |

La diferencia medible y verificable es el tamaño: esta cuantización ocupa 2,08 GB menos que el IQ4_XS publicado por BottleCap, a costa de recortar con más agresividad el feed-forward de los bloques 0–51 y de mantener una matriz de importancia propia en lugar de la genérica.

## Limitaciones y advertencias

- La decodificación greedy puede entrar en bucles; el autor recomienda mantener la temperatura en los valores sugeridos por la model card del modelo original.
- La visión no funciona sin un archivo `mmproj` externo (`mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf`, de BottleCap); no está incluido en este repositorio.
- La licencia PolyForm Small Business 1.0.0 es más restrictiva que la Apache-2.0 del modelo base y limita el uso comercial a pequeñas empresas; conviene revisar el texto completo antes de un despliegue en producción.
- Los bloques iniciales del feed-forward se cuantizan hasta `IQ2_XXS`/`IQ3_XXS`, lo que puede degradar tareas que dependan de representaciones tempranas; no se han publicado evaluaciones de calidad que cuantifiquen esa pérdida.
- La matriz de importancia se calculó sobre una copia IQ4 del modelo y no sobre el f16, una decisión de eficiencia que podría desviar ligeramente la selección de tensores sensibles respecto a una imatrix calculada sobre los pesos completos.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es consustancial a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto o idioma: el contexto máximo nativo no se especifica y el alcance real del soporte multilingüe no se detalla.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria amplia de su comportamiento.
- Fecha de creación y actualización del repositorio: 23 de septiembre de 2026.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vmarcelo/ThinkingCap-Qwen3.8-27B-MIX_GGUF
- Modelo del que se cuantiza: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- GGUF de referencia de BottleCap (incluye el `mmproj`): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Licencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF/blob/main/LICENSE
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de calibración: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Herramienta de cuantización (llama.cpp, commit `58367713a`): https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantización: https://huggingface.co/vmarcelo
