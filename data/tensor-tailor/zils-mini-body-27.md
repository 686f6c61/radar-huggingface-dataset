# tensor-tailor/zils-mini-body-27

## Resumen

zils-mini-body-27 es un ajuste fino mediante LoRA de un modelo de decisión de 4.539 millones de parámetros (4,54 B) orientado a tareas de clasificación y elección entre opciones (decisiones de tipo examen). Lo desarrolla el autor `tensor-tailor` dentro del ecosistema Zils, asociado al pool de modelos `d3-mini` de la subred 127 de Bittensor. El modelo parte de un ajuste fino propio anterior, que a su vez se construyó como media uniforme de pesos de cuatro ingredientes públicos del pool: `vllm-sr/d3-mini`, `perplexity-ai/pplx-decider-flash-v1.2`, `torchcast-ai/torchcast-decision-4b` y `Maincode/Matilda-Decision-v1-Mini`.

La arquitectura declarada es la del chasis `d3-mini` en disposición Qwen3.5-4B, con tensores de lenguaje y visión en bf16, e incluye capas de atención con Gated-DeltaNet (un mecanismo de atención lineal de tipo delta). El entrenamiento se realizó con LoRA de rango 32 sobre las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje, con una función de pérdida compuesta por entropía cruzada, término Brier y una penalización KL contra los pesos de partida.

Su relevancia es acotada y muy específica: no es un modelo generativo de propósito general, sino un "cuerpo de decisión" pensado para ser evaluado en el marco de exámenes del pool Zils, con un sesgo deliberado hacia tareas de recuperación (Retrieval, 49,0 % de las filas de entrenamiento). La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, pero la ausencia de benchmarks publicados y de documentación sobre idiomas limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con chasis d3-mini (disposición Qwen3.5-4B), atención con Gated-DeltaNet, tensores de lenguaje y visión en bf16 |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del chasis `d3-mini`: un transformer con capas de atención que incorporan Gated-DeltaNet, un mecanismo de atención lineal basado en reglas delta con compuertas, junto con proyecciones MLP convencionales (gate, up, down). Los pesos se publican en bf16 y el repositorio incluye código personalizado (`custom_code`), lo que implica que la carga requiere confiar en la implementación del autor. El modelo base declarado es `Maincode/Matilda-Decision-v1-Mini`, con relación de finetune, aunque la model card describe una cadena de cuatro ingredientes mezclados.

El entrenamiento se realizó con LoRA de rango 32, alpha 64 y dropout 0,05 sobre las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje. Se usó AdamW con weight decay 1,0 solo sobre los pesos LoRA, learning rate 5e-5, warm-up de 50 pasos seguido de coseno, 2 épocas, batch 8 sin acumulación y semilla 4361. La pérdida por fila combina entropía cruzada sobre la etiqueta, un término Brier con peso 1,0 y una KL con peso 0,1 contra los pesos de partida (calculada en vivo con el adaptador desactivado, sin profesor externo). El cuerpo de partida se entrenó con la misma receta pero semilla 4350 y batch 8 × acumulación 2, con KL contra la mezcla de ingredientes. Los adaptadores se fusionaron en bf16 sin interpolación de pesos.

Los datos de entrenamiento suman 2.800 filas en dos ficheros: 800 filas para este cuerpo (12,0 % razonamiento, 14,2 % lenguaje, 49,0 % recuperación, 12,9 % herramientas, 11,9 % artes) y 2.000 filas para el cuerpo de partida (33,5 % razonamiento, 22,4 % lenguaje, 17,3 % recuperación, 18,3 % herramientas, 8,7 % artes). La regla de dificultad exige que el cuerpo de mezcla fija asigne entre 0,30 y 0,80 de probabilidad a la respuesta correcta. 468 filas provienen del dataset Schema-Guided Dialogue y 9 de SNLI, ambos bajo CC BY-SA 4.0.

## Capacidades

- Clasificación y elección entre opciones en formato de examen, con 15 familias conocidas declaradas.
- Razonamiento de tipo examen (familia Reasoning) y tareas de lenguaje (familia Language).
- Recuperación de información (familia Retrieval), que es la categoría dominante en su conjunto de entrenamiento (49,0 %).
- Uso de herramientas (familia Tools) en el marco del examen, aunque no se documenta soporte de tool calling en producción.
- Tareas creativas o de "artes" (familia Arts) según la taxonomía del autor.
- Capacidades de visión: el chasis declara tensores de visión, pero no se documenta su funcionamiento ni evaluación.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking): no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Evaluación en el pool Zils (subred 127 de Bittensor): el modelo está diseñado como "cuerpo de decisión" para ser puntuado en el examen del pool, por lo que su uso principal es participar en ese marco de evaluación comparativa.
- Clasificación de respuestas en entornos controlados: dado su entrenamiento con etiquetas de anotadores humanos y generadores propios, puede emplearse para elegir la opción correcta en preguntas de opción múltiple dentro de dominios similares a los del examen.
- Recuperación y selección de pasajes: al estar ponderado hacia Retrieval, es adecuado para tareas de ranking o selección de fragmentos relevantes en pipelines de búsqueda documental.
- Filtrado de datos de entrenamiento: su capacidad de asignar probabilidad a respuestas correctas permite usarlo como filtro de calidad en la curación de datasets, replicando la regla de dificultad del autor.
- Investigación sobre ajuste fino con pérdidas compuestas: sirve como caso de estudio reproducible de LoRA con pérdida CE + Brier + KL contra los pesos de partida.
- Experimentación con arquitecturas híbridas de atención: al incorporar Gated-DeltaNet, es útil para estudiar el comportamiento de atención lineal en modelos de 4 B parámetros.
- Base para fine-tunes posteriores: al publicarse con licencia Apache 2.0 y en safetensors, puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización.
- Opciones de despliegue: vLLM y TGI para servidores; llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas). El uso de `custom_code` puede requerir `trust_remote_code=True` en Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-body-27 | 4,54 B | no disponible | Apache 2.0 | Ajuste fino de decisión del pool Zils, sin benchmarks publicados |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Modelo base declarado; relación de finetune |
| torchcast-ai/torchcast-decision-4b | ~4 B (por nombre) | no disponible | no disponible | Ingrediente de la mezcla inicial |
| perplexity-ai/pplx-decider-flash-v1.2 | no disponible | no disponible | no disponible | Ingrediente de la mezcla inicial |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | Ingrediente de la mezcla inicial y chasis |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo está entrenado específicamente para el examen del pool Zils; su generalización fuera de ese marco no está demostrada.
- Sesgo deliberado hacia la categoría Retrieval (49,0 % de las filas), lo que puede desequilibrar su comportamiento en otras categorías.
- El conjunto de entrenamiento incluye 468 filas de Schema-Guided Dialogue y 9 de SNLI bajo CC BY-SA 4.0; aunque el repo solo contiene pesos, conviene revisar los términos de esos datasets antes de reutilizar el modelo.
- Riesgo de alucinación no evaluado; al ser un modelo de decisión, puede producir respuestas plausibles pero incorrectas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Longitud de contexto no documentada; el entrenamiento se limita a 2.048 tokens, por lo que contextos más largos pueden degradar el rendimiento.
- Requiere `custom_code` y confiar en la implementación del autor para cargar los pesos.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de modelos base puede imponer restricciones adicionales no verificadas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-27
- Dataset Schema-Guided Dialogue: https://github.com/google-research-datasets/dstc8-schema-guided-dialogue
- Modelo base declarado: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Ingrediente de la mezcla: https://huggingface.co/vllm-sr/d3-mini
- Ingrediente de la mezcla: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Ingrediente de la mezcla: https://huggingface.co/torchcast-ai/torchcast-decision-4b
