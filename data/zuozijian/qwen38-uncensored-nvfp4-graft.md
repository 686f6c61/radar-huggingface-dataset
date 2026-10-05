# zuozijian/Qwen38-Uncensored-NVFP4-Graft

## Resumen

Qwen38-Uncensored-NVFP4-Graft es un checkpoint cuantizado en NVFP4 publicado en HuggingFace por el usuario zuozijian. Deriva de JonathanColetti/Qwen3.8-27B-Uncensored y se ha generado con NVIDIA TensorRT Model Optimizer 0.43.0 para servir inferencia en GPUs de clase Blackwell bajo vLLM. La model card describe la conversión de aproximadamente 65 GB en bf16 a 19,2 GiB, conservando intactas la torre de visión y la cabeza de predicción multi-token (MTP).

El modelo de partida es un stack híbrido de 64 capas que alterna bloques de 3x (Gated DeltaNet -> FFN) con 1x (Gated Attention -> FFN), e incorpora capacidades multimodales (pipeline image-text-to-text) y de tool calling mediante el dialecto XML de Qwen. Se distribuye bajo licencia Apache 2.0 y declara soporte para inglés y chino.

Su interés es doble: por un lado documenta con precisión las restricciones prácticas de cuantizar un modelo híbrido con capas fusionadas en vLLM (in_proj_qkvz, in_proj_ba); por otro, demuestra un despliegue real en dos nodos DGX Spark GB10 con tensor parallelism 2. Conviene advertir que los metadatos de safetensors reportan 14.557.547.760 parámetros, cifra que no encaja con la denominación "27B" del modelo base ni con los "~65 GB" bf16 citados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con patrón 3x (Gated DeltaNet -> FFN) + 1x (Gated Attention -> FFN); incluye torre de visión y cabeza MTP |
| Parametros totales | 14.557.547.760 (~14,56 B) según metadatos de safetensors; el modelo base se denomina "27B", discrepancia no aclarada en la información disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (valor empleado en el despliegue verificado) |
| Tipos de cuantizacion | NVFP4 (4 bits, block size 16, escalas FP8) con TensorRT Model Optimizer 0.43.0; KV cache en fp8 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; requiere un runtime que entienda `modelopt_fp4` (transformers no puede cargarlo directamente) |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: es una cuantización post-entrenamiento (PTQ) del modelo base sin fine-tuning ni datos adicionales de entrenamiento. La calibración se realizó con 256 muestras del dataset garage-bAInd/Open-Platypus, batch size 16 y longitud máxima de secuencia 1024. Se cuantizaron 400 capas lineales a NVFP4: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`, 64 módulos cada una), las proyecciones de atención completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`, 16 cada una) y las proyecciones de Gated DeltaNet `in_proj_qkv`, `in_proj_z` y `out_proj` (48 cada una). Quedaron en bf16 las proyecciones de bajo rango `in_proj_a` e `in_proj_b` (sensibles a precisión), la `conv1d` causal, la torre de visión completa (333 tensores), el `lm_head` y la cabeza MTP (15 tensores).

La particularidad técnica más relevante documentada es la restricción de capas fusionadas: vLLM no instancia por separado las proyecciones de entrada de DeltaNet, sino que fusiona `in_proj_qkv` + `in_proj_z` en `in_proj_qkvz` y `in_proj_b` + `in_proj_a` en `in_proj_ba`. Todos los fragmentos de una capa fusionada deben compartir precisión o la carga aborta durante la construcción del modelo. Por eso `in_proj_z` se cuantiza junto a `in_proj_qkv` aunque sea una puerta, mientras que `in_proj_a` e `in_proj_b` se excluyen simultáneamente. Otro detalle operativo es que `exclude_modules` se compara con los prefijos de módulo de vLLM (`language_model.model.…`) mientras que `transformers` emite `model.language_model.…`; la lista de exclusión del checkpoint está escrita en ambas convenciones y validada contra `is_layer_skipped` / `is_layer_excluded` de vLLM.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de la familia Qwen.
- Modo de razonamiento ("thinking"): la plantilla abre un bloque `<think>` por defecto; se puede desactivar con `enable_thinking=False`.
- Comprensión de imágenes (pipeline `image-text-to-text`); la torre de visión se conserva en bf16.
- Tool calling / function calling con el dialecto XML de Qwen (`<tool_call><function=name><parameter=k>v</parameter></function></tool_call>`).
- Decodificación multi-token (cabeza MTP) conservada en precisión completa, apta para decodificación especulativa bajo vLLM.
- Multilingüe limitado a inglés y chino.
- Modelo "uncensored / abliterated": no incorpora salvaguardas de contenido.
- Contexto largo: hasta 131.072 tokens en la configuración de servicio verificada.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens de ventana se pueden mantener conversaciones de muchas horas o ingerir documentos extensos completos sin trocear, usando `--reasoning-parser qwen3` para separar `reasoning_content` de `content`.
- Agente con herramientas en producción: el modelo emite llamadas en XML de Qwen y vLLM las parsea con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`, lo que permite conectarlo a APIs internas, bases de datos o pipelines de CI/CD sin capa de traducción adicional.
- Análisis de documentos con imágenes: al conservar la torre de visión, admite capturas de pantalla, diagramas o escaneos junto a texto en la misma petición.
- Procesamiento por lotes de bajo coste: los 19,2 GiB del checkpoint frente a los ~65 GB en bf16 permiten servir el modelo en menos memoria y con mayor densidad de peticiones concurrentes por GPU.
- Despliegue en clústeres de memoria unificada: el caso validado con 2x DGX Spark GB10 y TP=2 sirve como plantilla para entornos con varios nodos pequeños en lugar de una GPU grande.
- Investigación sobre cuantización híbrida: el checkpoint funciona como referencia reproducible de qué capas de un stack DeltaNet + Attention toleran NVFP4 y cuáles deben permanecer en bf16.
- Red-teaming y evaluación de seguridad: al ser un modelo sin censura, es útil para medir la eficacia de filtros externos, aunque requiere aislamiento respecto a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del checkpoint: 19,2 GiB (dato declarado en la model card). Requiere memoria adicional para caché KV; con `--kv-cache-dtype fp8` y contexto 131.072 la caché no está cuantificada en la información disponible.
- La inferencia NVFP4 (`--quantization modelopt_fp4`) está ligada a GPUs de clase Blackwell según la propia model card. No se especifica la lista exacta de GPUs compatibles ni si funciona en arquitecturas anteriores.
- Despliegue verificado: 2x NVIDIA DGX Spark GB10 (Blackwell, memoria unificada), una GPU por nodo, interconexión QSFP directa a 200 Gb/s con RoCE, `-tp 2 --nnodes 2` con torch.distributed (sin Ray), vLLM 0.19.2rc1, `gpu-memory-utilization 0.75`, contexto 131.072, `max-num-batched-tokens 8192`, `max-num-seqs 4`.
- Cabe en consumer GPU: no disponible. No se documenta ningún despliegue en GPU de consumo, y la limitación de arquitectura Blackwell condiciona la respuesta.
- Opciones de despliegue: vLLM con backend de atención FlashInfer es la única ruta verificada. `transformers` no puede cargar el checkpoint directamente porque NVFP4 empaqueta dos valores de 4 bits por byte y `from_pretrained` reporta errores de forma. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se publican métricas de tokens por segundo ni de tiempo hasta el primer token.
- Nota de configuración: el tag "8-bit" del repositorio no refleja el formato real de pesos, que es NVFP4 (4 bits).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (zuozijian/Qwen38-Uncensored-NVFP4-Graft) | 14,56 B segun safetensors | 131.072 | NVFP4 (4 bits) | Apache 2.0 | Incluye vision y MTP; requiere runtime `modelopt_fp4` |
| JonathanColetti/Qwen3.8-27B-Uncensored (modelo base) | no disponible | no disponible | bf16 (~65 GB) | no disponible en la informacion proporcionada | Sin cuantizar; misma arquitectura híbrida |
| joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt | no disponible | no disponible | NVFP4 (4 bits) | no disponible en la informacion proporcionada | Referenciado en la model card; parece el origen del contenido del README |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se aportan datos de otros modelos comparables |

## Limitaciones y advertencias

- Modelo sin censura ("uncensored", "abliterated"): no incorpora filtros de seguridad. No debe exponerse directamente a usuarios finales sin moderación externa.
- Riesgo de alucinación: no evaluado. No hay benchmarks de fidelidad, veracidad ni tasas de error publicados.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que limita la evidencia independiente sobre su comportamiento.
- Discrepancia de parámetros: safetensors declara 14.557.547.760 parámetros mientras el nombre del modelo base indica "27B" y la model card cita ~65 GB en bf16. No se explica en la información disponible.
- Incompatibilidad con `transformers`: el checkpoint no se puede cargar con `from_pretrained`; exige un runtime que entienda `modelopt_fp4`.
- Dependencia de hardware: NVFP4 está asociado a GPUs de clase Blackwell; no se documenta compatibilidad con generaciones anteriores.
- Ambigüedad de atribución: el ID del repositorio es `zuozijian/Qwen38-Uncensored-NVFP4-Graft`, pero el README describe y sirve el modelo `joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt`. El significado de "Graft" en el nombre no se aclara.
- Etiquetado incorrecto de precisión: el tag "8-bit" del repositorio no corresponde al formato NVFP4 real de los pesos.
- Trampa del parser de razonamiento: con `--reasoning-parser qwen3`, una respuesta truncada dentro del bloque `<think>` (`finish_reason: "length"`) devuelve `content` y `reasoning_content` vacíos. Se recomienda presupuestar más de 2500 tokens en modo thinking o desactivarlo.
- Tool calling condicionado: sin `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`, cualquier cliente que envíe `tool_choice: "auto"` recibe un error 400.
- Idiomas: solo inglés y chino. No hay soporte declarado de castellano, lo que degrada la calidad en español.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el contenido generado por un modelo sin salvaguardas.
- Cobertura de cuantización parcial: las proyecciones `in_proj_a`, `in_proj_b`, la `conv1d`, el `lm_head` y la torre de visión permanecen en bf16, por lo que el ahorro de memoria no es uniforme en todo el grafo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zuozijian/Qwen38-Uncensored-NVFP4-Graft
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Repositorio referenciado en la model card: https://huggingface.co/joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Dataset de calibración Open-Platypus: https://huggingface.co/datasets/garage-bAInd/Open-Platypus
