# SZLHOLDINGS/KHIPU-R2-estate-sft-v1

## Resumen

KHIPU-R2-estate-sft-v1 es un ajuste fino supervisado (SFT) publicado por SZLHOLDINGS sobre su modelo base KHIPU-R2. Se trata de un modelo de generación de texto de tipo decoder-only con arquitectura Qwen2 (`Qwen2ForCausalLM`), con 1.543.714.304 parámetros totales (aproximadamente 1,54 mil millones) y pesos en `bfloat16` distribuidos en un único artefacto `model.safetensors` de unos 3,09 GB. El repositorio ocupa 3,1 GB y contiene 13 ficheros servidos en la revisión `42ee829c8236`.

El modelo se presenta como parte de un "estate" de IA gobernada de SZL Holdings, con énfasis en trazabilidad mediante recibos (receipts) y resultados verificables. Sin embargo, la propia model card declara explícitamente que no se han ejecutado benchmarks nuevos y que no se hacen afirmaciones de calidad sobre este artefacto: el estado de la cadena de recibos es `UNKNOWN_NO_EVAL_RECEIPT`. Es decir, el modelo es publicable y descargable, pero su rendimiento no está validado con métricas de evaluación publicadas.

Por su tamaño (1,5 B de parámetros) y su licencia Apache 2.0, el modelo es relevante para quienes buscan un modelo pequeño de generación de texto, desplegable en hardware modesto y con posibilidad de uso comercial sin restricciones adicionales. No obstante, la ausencia de datos de entrenamiento, de benchmarks y de una evaluación formal limita seriamente su uso en producción sin una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen2ForCausalLM` (familia Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en `bfloat16`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, 3.087.467.144 bytes) y `tokenizer.json` (11.422.166 bytes) |
| Modelo base | SZLHOLDINGS/KHIPU-R2 |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Libreria | `transformers` |
| Repositorio | 3,1 GB, 13 ficheros en la revisión `42ee829c8236` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only con atención causal estándar, según declara el `config.json` del repositorio (`model_type: qwen2`, `architectures: ['Qwen2ForCausalLM']`). El modelo se distribuye en `bfloat16` y consta de un único fichero de pesos, lo que simplifica su carga con `transformers`. No se documenta en la información disponible el número de capas, dimensión oculta, número de cabezas de atención ni la longitud máxima de contexto configurada.

Respecto al entrenamiento, la model card indica que se trata de un ajuste fino supervisado (SFT) sobre el modelo base `SZLHOLDINGS/KHIPU-R2`, pero no especifica el volumen de tokens, la composición del dataset, si hubo RLHF/DPO, ni ningún detalle sobre el proceso de alineación. La sección de recibos del autor indica que el estado de la cadena de evaluación estricta es `UNKNOWN_NO_EVAL_RECEIPT` y que no se afirma ningún resultado de benchmark más allá de lo que una auditoría fechada haya medido, y en este caso no se ha medido ninguno. La nota de licencia del estate indica que la etiqueta `apache-2.0` se fijó el 2026-11-25 por operaciones del estate, sin evidencia de licencia por fichero del upstream.

## Capacidades

- Generación de texto autoregresiva estándar, propia de un modelo causal de la familia Qwen2.
- Ajuste fino supervisado orientado (por el nombre del repositorio) a un dominio "estate", aunque la model card no detalla las tareas concretas cubiertas.
- Soporte multilingüe limitado: la model card declara únicamente inglés (`en`).
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", visión, audio ni otras capacidades especiales.
- No se documentan capacidades específicas de código o matemáticas más allá de las genéricas de un modelo de texto de su familia.

## Casos de uso

- Generación de texto en inglés en entornos de prototipado: el modelo puede emplearse para completar texto, redactar borradores o resumir documentos en inglés, dado su tamaño contenido y su licencia permisiva, siempre que se valide la calidad con datos propios.
- Experimentación académica con ajuste fino: al ser un modelo de 1,5 B con licencia Apache 2.0 y pesos en `safetensors`, es adecuado como punto de partida para experimentos de SFT o LoRA en una sola GPU consumer.
- Despliegue en hardware modesto: su tamaño permite inferencia en GPUs de gama media o incluso en CPU con cuantización (aunque el autor no publica variantes cuantizadas, es convertible a GGUF con herramientas estándar).
- Evaluación comparativa de la familia KHIPU: útil para quienes investigan la línea de modelos de SZL Holdings y quieren comparar el efecto del SFT frente al modelo base `KHIPU-R2`.
- Filtrado y clasificación de texto ligera: con un prompt adecuado, puede usarse para tareas de etiquetado o clasificación simple en inglés, sujeto a validación empírica.
- Base para pipelines de generación aumentada (RAG) en inglés: al ser un modelo pequeño, puede integrarse en un pipeline RAG donde el contexto se inyecte en el prompt, aunque la longitud de contexto no está documentada y debe verificarse en el `config.json` antes de usarlo.
- Docencia y demostraciones: su tamaño y licencia lo hacen apto para talleres sobre despliegue de LLMs con `transformers` o `vLLM`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido por una auditoría fechada, y el estado de la cadena de evaluación es `UNKNOWN_NO_EVAL_RECEIPT`. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada con cuantización a 8 bits: alrededor de 1,6 GB para pesos; con 4 bits, alrededor de 0,8-1 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para `bfloat16` (RTX 3060/4060, RTX 4070, A10, L4); para cuantización 4/8 bits, GPUs con 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 8 GB o más en `bfloat16`, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `vLLM`, `TGI`, `llama.cpp`/`Ollama` tras conversión a GGUF (no se publican artefactos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado | Disponibilidad |
|---|---|---|---|---|---|
| KHIPU-R2-estate-sft-v1 | 1,54 B | No disponible | Apache 2.0 | No | Hugging Face (297 descargas) |
| Qwen2-1.5B (base de la familia) | 1,54 B | 32.768 tokens (según la familia Qwen2) | Apache 2.0 | Sí (amplia batería) | Hugging Face |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens (según la familia Qwen2.5) | Apache 2.0 | Sí (amplia batería) | Hugging Face |
| SmolLM2-1.7B | 1,71 B | 8.192 tokens (según su model card) | Apache 2.0 | Sí | Hugging Face |

Nota: los datos de contexto y benchmarks de los modelos comparables corresponden a sus respectivas familias y deben verificarse en sus model cards; para KHIPU-R2-estate-sft-v1 no se dispone de contexto ni benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad, razonamiento, código o matemáticas. Cualquier uso en producción requiere evaluación propia.
- Cadena de recibos incompleta: el autor declara estado `UNKNOWN_NO_EVAL_RECEIPT`; no hay `DONE.json` de evaluación ni recibo de entrenamiento en las rutas estándar.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: debe consultarse el `config.json` antes de diseñar prompts largos; no se garantiza soporte de contextos extensos.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin evaluación, el riesgo es desconocido pero no despreciable.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad; el dataset de SFT no se describe.
- Licencia: Apache 2.0 permite uso comercial, pero la nota del estate indica que la etiqueta se fijó por operaciones internas sin evidencia de licencia por fichero del upstream; conviene revisar la procedencia de los datos de entrenamiento antes de un uso comercial crítico.
- Modelo base poco documentado: `SZLHOLDINGS/KHIPU-R2` no aporta en esta ficha información sobre datos, contexto o evaluación.
- Fecha de creación futura (2026-11-05) y actualización (2026-11-25): metadatos coherentes con el calendario del estate, pero conviene verificar la revisión concreta antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/KHIPU-R2-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/KHIPU-R2
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
- Repositorio de recibos y logs (referenciado en la model card): https://github.com/szl-holdings/szl-eval-harness
- Paper de Qwen2 (arquitectura base): https://arxiv.org/abs/2407.10671
