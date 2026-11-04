# viai957/nano-mistral-o1-dpo-arm-a-halfepoch-salvage

## Resumen

`nano-mistral-o1-dpo-arm-a-halfepoch-salvage` es un checkpoint de DPO (Direct Preference Optimization) de Mistral-7B-v0.3, publicado por el usuario `viai957` como parte del proyecto nano-mistral-o1. No es un modelo pensado para uso productivo: el propio autor lo describe como un "registro de incidente", es decir, los pesos del primer intento abortado de la fase DPO del proyecto, conservados con fines forenses. Un fallo en el sharding de datos provocó que las cuatro GPU del entrenamiento procesaran el mismo par de preferencias en cada micro-paso, de modo que el entrenamiento efectivo fue mucho menor del previsto.

El modelo parte del checkpoint SFT `viai957/nano-mistral-o1-sft` y aplica DPO con pérdida sigmoide y β = 0.1 sobre el dataset `argilla/distilabel-math-preference-dpo`, orientado a soluciones matemáticas. La arquitectura es la de Mistral-7B-v0.3: transformer decoder con 32 capas, 7.248 millones de parámetros, GQA con 32 cabezas de consulta y 8 de clave/valor, vocabulario de 32.768 tokens y contexto de 32.768 tokens.

Su relevancia es documental más que técnica: la model card corrige afirmaciones anteriores sobre el estado del checkpoint y aporta métricas de entrenamiento que evidencian memorización en lugar de generalización (precisión de preferencia de 0.546 en primeras visitas frente a 0.944 en revisiones). No se han publicado benchmarks de evaluación sobre este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder) |
| Parámetros totales | 7.248.023.552 (7.25B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (RoPE θ = 1e6, sin sliding window) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor advierte de no ejecutar en fp16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único archivo de 14.5 GB, bf16) |

Detalles arquitectónicos adicionales: 32 capas, hidden size 4096, FFN 14336, head_dim 128, 32 query heads y 8 KV heads (GQA), embeddings no atados, vocabulario de 32.768 tokens. Tokenizer de Mistral-7B-v0.3 con plantilla `[INST]`/`[/INST]`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso estándar de la familia Mistral, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento se realizó con el trainer propio del proyecto (`nmo`), basado en FSDP2 con 32 unidades por bloque, AdamW de 8 bits y atención Triton FA2, sobre 4 GPU de 23 GB. No se usó TRL ni DeepSpeed. La fase DPO emplea pérdida sigmoide con β = 0.1, sin término NLL ni DPOP, y log-probabilidades de referencia precalculadas a partir del checkpoint SFT congelado.

El dataset de preferencias es `argilla/distilabel-math-preference-dpo`: 2.418 pares brutos, 2.310 tras filtrado y decontaminación (verificados contra 1.819 hashes de evaluación de MATH-500 y GSM8K, con 0 pares contaminados), divididos en 2.193 pares de entrenamiento y 117 de retención. El fallo de sharding hizo que el `LengthGroupedSampler` no se distribuyera por rango, por lo que las cuatro GPU recorrían la misma lista de batches: cada paso de optimizador procesaba 8 pares únicos en lugar de los 32 previstos. El checkpoint corresponde al estado en el paso de optimizador 425 (micro-paso 3.400), tras aproximadamente 1,55 épocas, con una tasa de aprendizaje constante de 5e-7 (el scheduler warmup-cosine se registraba pero nunca se aplicó).

## Capacidades

- Generación de texto en inglés con plantilla de instrucciones `[INST]`/`[/INST]`.
- Razonamiento matemático y resolución de problemas, heredado del entrenamiento SFT sobre corpus derivado de PRM800K y afinado con preferencias matemáticas.
- Generación de soluciones paso a paso a problemas de matemáticas (el dataset de DPO contiene soluciones completas preferidas y rechazadas).
- Capacidad de seguir instrucciones conversacionales multi-turno dentro de la ventana de 32.768 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso orquestado.
- No dispone de visión, audio ni modo "thinking" explícito.
- Multilingüismo limitado: la model card declara únicamente inglés.

## Casos de uso

- Investigación sobre DPO y análisis de fallos de entrenamiento: el checkpoint sirve como artefacto de estudio para reproducir y diagnosticar el efecto de un sharding incorrecto en la fase de preferencias, comparando las métricas de primera visita y revisión.
- Auditoría de memorización en ajuste por preferencias: los datos de precisión (0.546 en pares nuevos frente a 0.944 en pares revisados) permiten estudiar cómo el modelo sobreajusta pares concretos con pocas épocas.
- Reproducción de experimentos de razonamiento matemático: al partir de un SFT orientado a matemáticas, puede emplearse como línea base en estudios comparativos de DPO sobre Mistral-7B.
- Fine-tuning posterior controlado: al ser un checkpoint completo en bf16 con licencia Apache-2.0, puede servir como punto de partida para experimentos académicos de alineación, siempre que se documente su procedencia.
- Docencia y formación técnica: útil para explicar en un curso o taller cómo un bug de sampler distribuido degrada el entrenamiento y cómo detectarlo a partir de logs.
- Evaluación de infraestructura de entrenamiento: permite validar pipelines de FSDP2, AdamW 8-bit y FA2 en hardware de 23 GB por GPU antes de lanzar runs de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint nunca se evaluó en ningún benchmark ni en el split de preferencias retenido; solo existen métricas de entrenamiento:

| Métrica | Valor | Intervalo | n |
|---|---|---|---|
| Precisión de preferencia en primeras visitas | 0.546 | [0.525, 0.567] | 2.193 |
| Precisión de preferencia en revisiones | 0.944 | [0.929, 0.955] | 1.207 |

El propio autor interpreta este patrón como memorización, no como generalización.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB para pesos (no se publican GGUF ni cuantizaciones oficiales; habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPU de 24 GB como la RTX 3090 también son viables con cuidado en la longitud de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, potencialmente en GPU de 12-16 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp no están documentados oficialmente para este checkpoint, aunque al ser Mistral-7B estándar serían compatibles tras conversión.
- Latencia y throughput: no disponibles; el autor no registró estas métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| nano-mistral-o1-dpo-arm-a-halfepoch-salvage | 7.25B | 32.768 | Apache-2.0 | Artefacto de incidente, sin benchmarks | Este modelo |
| mistralai/Mistral-7B-v0.3 | 7.25B | 32.768 | Apache-2.0 | Modelo base oficial, ampliamente evaluado | Base arquitectónica del checkpoint |
| viai957/nano-mistral-o1-sft | 7.25B | 32.768 | no disponible en la información | Checkpoint SFT padre | Punto de partida del DPO |
| viai957/nano-mistral-o1-dpo-arm-a | 7.25B | 32.768 | no disponible en la información | Resultado registrado de Arm A | Run de referencia según el autor |

No se dispone de datos de rendimiento comparativo (MMLU, GSM8K, MATH-500) para ninguno de los checkpoints del proyecto nano-mistral-o1 en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de incidente: los pesos provienen de un run con un bug de sharding que redujo el entrenamiento efectivo a 8 pares únicos por paso en lugar de 32; no debe tratarse como un resultado válido del proyecto.
- Memorización demostrada: la precisión de preferencia sube de 0.546 en pares nuevos a 0.944 en pares revisados, lo que indica sobreajuste a los pares de entrenamiento.
- Sin evaluación: no se han ejecutado benchmarks ni evaluación sobre el split retenido; no hay evidencia de calidad fuera de las métricas de entrenamiento.
- Riesgo de alucinación: no cuantificado, pero al ser un modelo de 7B afinado sobre matemáticas sin evaluación independiente, el riesgo en dominios fuera del entrenamiento es alto.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Licencia: Apache-2.0 para los pesos, pero el autor señala que el corpus de investigación detectó una posible restricción de licencia sobre las salidas de OpenAI presentes en el dataset de preferencias, riesgo aceptado explícitamente en una decisión fechada el 2026-08-22. Conviene revisar este punto antes de cualquier uso comercial.
- Precisión numérica: el autor advierte explícitamente de no ejecutar el modelo en fp16; usar bf16.
- Estado obsoleto: el propio autor lo marca como "superseded" y conservado solo para documentar el incidente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-a-halfepoch-salvage
- Checkpoint DPO de referencia (Arm A): https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-a
- Checkpoint SFT padre: https://huggingface.co/viai957/nano-mistral-o1-sft
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset de preferencias: https://huggingface.co/datasets/argilla/distilabel-math-preference-dpo
