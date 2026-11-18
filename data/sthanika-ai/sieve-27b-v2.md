# sthanika-ai/Sieve-27B-v2

## Resumen

Sieve-27B-v2 es un modelo de decisión desarrollado por Sthānika AI, perteneciente a la familia Sieve. No es un modelo generativo: recibe un estado (texto o JSON) y una serie de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. Lee el estado una sola vez, puntúa las opciones directamente y nunca produce texto. Está diseñado para tareas de clasificación y decisión estructurada donde se requiere una confianza calibrada en lugar de una respuesta en lenguaje natural.

Técnicamente es un fine-tune completo del backbone Qwen/Qwen3.8-27B (revisión `1d4bf0f2`), al que se le ha añadido una cabeza pointer (pointer head) para puntuar opciones. Entrena las 64 capas del decodificador (24,35B parámetros) y almacena una temperatura de calibración por categoría de pregunta. Soporta tres tipos de pregunta: `choice` (elección entre 2 y 255 claves), `noul` (sí/no) y `score` (nivel esperado sobre una lista ordenada de 2 a 10 niveles), aunque solo se entrenó en `choice` y `noul`.

Su relevancia actual radica en que ofrece una alternativa determinista y calibrada a los LLM generativos para tareas de enrutamiento, clasificación y toma de decisiones, con límites de tokens explícitos (16.384 para el estado y 16.384 para cada pregunta) y un consumo de memoria en bf16 de aproximadamente 52 GB, lo que permite desplegarlo en una única GPU de 80 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B) con cabeza pointer para puntuación de opciones |
| Parámetros totales | 24,35B (64 capas del decodificador entrenadas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens para el estado y 16.384 tokens por pregunta con sus opciones (límites de entrenamiento) |
| Tipos de cuantización | no disponible (el modelo se distribuye y ejecuta en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT con `modules_to_save`; requiere el backbone Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento

Sieve-27B-v2 parte del backbone Qwen/Qwen3.8-27B, del que solo se utiliza la parte de texto; el modelo no puede generar texto. Se realiza un fine-tune completo de las 64 capas del decodificador (24,35B parámetros), manteniendo los embeddings de tokens y la normalización final del backbone. La release almacena las capas entrenadas como un adaptador PEFT (`modules_to_save`), con un LoRA de rango 1 a cero sobre los embeddings. La librería `sieve` 0.3.2 o posterior copia estas capas en el backbone en sitio, por lo que el modelo necesita aproximadamente la memoria del backbone para cargarse.

La innovación principal es la cabeza pointer: puntúa el final de cada opción contra el punto de decisión y una softmax calibrada produce las probabilidades. Cada pregunta se ejecuta como una fila independiente desde la caché del estado, de modo que las preguntas nunca se ven entre sí (aislamiento). El modelo almacena una temperatura global T = 0,999 y 25 temperaturas por categoría de pregunta (rango 0,928 a 1,127), ajustadas por NLL sobre un split de calibración de 132.395 preguntas, fuera de la muestra de selección de checkpoint. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Clasificación y decisión estructurada: devuelve una probabilidad calibrada por opción para preguntas de tipo `choice` (2 a 255 claves), `noul` (sí/no) y `score` (2 a 10 niveles ordenados).
- Calibración por categoría: 25 temperaturas específicas por categoría de pregunta, además de una temperatura global.
- Procesamiento de estado en texto o JSON: lee el estado una sola vez y lo cachea para todas las preguntas.
- Aislamiento de preguntas: cada pregunta se evalúa de forma independiente, sin contaminación cruzada.
- No genera texto: no soporta generación, tool calling, agentes ni razonamiento multi-step en el sentido de los LLM generativos.
- Capacidades multilingües: solo inglés.
- Sin soporte de visión, audio ni thinking mode.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el asunto y el cuerpo de un ticket y devuelve la probabilidad de cada departamento (`billing`, `technical`, etc.) mediante una pregunta `choice`, permitiendo umbrales de confianza para escalado humano.
- Predicción de churn: con una pregunta `noul` sobre si el cliente amenaza con cancelar, se obtiene P(yes) calibrada, útil para priorizar acciones de retención.
- Clasificación de riesgo en formularios: usando preguntas `score` sobre niveles ordenados (bajo, medio, alto), se obtiene el nivel esperado y la distribución de probabilidad para cada caso.
- Moderación de contenido estructurado: evaluación de textos o JSON contra categorías predefinidas con confianza calibrada, adecuada para pipelines que requieren decisiones auditables.
- Extracción de etiquetas en datos JSON: dado un estado JSON con campos de negocio, el modelo puntúa opciones de clasificación sin generar texto adicional, lo que simplifica la integración en sistemas existentes.
- Toma de decisiones con abstención: gracias a la calibración por categoría, se pueden establecer umbrales de confianza para derivar casos ambiguos a revisión humana, algo que un LLM generativo no ofrece de forma nativa.
- Evaluación de respuestas en múltiple elección: el tipo `choice` permite puntuar opciones de examen o encuesta con probabilidades calibradas, útil en sistemas de evaluación automática.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.4.1 (leaderboard, tests privados de los mantenedores) | Decision Index, Full score | 59,89 |
| Decision Index 0.3 (suite pública, 140.178 peticiones puntuadas, media de 37 benchmarks) | Decision Index, índice público (corregido por azar) | 68,02 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 52 GB en bf16 (50,3 a 53,1 GB en el servidor con CUDA-graph, 52,2 GB en el servidor eager durante las pruebas de latencia).
- GPU recomendadas: una GPU de 80 GB es suficiente (A100 80GB, H100 80GB). Los estados más largos requieren más memoria.
- GPU consumer: no cabe en GPU consumer convencionales (RTX 4090 con 24 GB, etc.) en bf16.
- Opciones de despliegue: servidor propio `sieve-serve --model sthanika-ai/Sieve-27B-v2 --graphs`; carga mediante `sieve` 0.3.2 o posterior. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible. Se menciona que en A100/H100 el kernel fusionado `causal-conv1d` es más rápido que la convolución PyTorch usada en las pruebas sobre B300, pero sin valores numéricos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con cabeza pointer y calibración por categoría) en la documentación proporcionada. La comparación con LLM generativos del mismo tamaño (por ejemplo, el propio Qwen3.8-27B) no es directa, ya que Sieve-27B-v2 no genera texto y su tarea es distinta.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-27B-v2 | 24,35B | 16.384 (estado) + 16.384 (pregunta) | Clasificación/decisión calibrada | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (backbone) | no disponible | no disponible | Generación de texto | no disponible | Hugging Face |
| Alternativas de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: no es adecuado para tareas de generación, resumen, traducción ni diálogo.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Los límites de tokens son estrictos: 16.384 para el estado y 16.384 por pregunta; las peticiones más largas se rechazan, nunca se truncan.
- Requiere cargar el backbone Qwen/Qwen3.8-27B (revisión `1d4bf0f2`) además del adaptador, lo que implica una huella de memoria de aproximadamente 52 GB en bf16.
- El adaptador por sí solo no es un modelo de generación de texto; debe cargarse con `sieve` 0.3.2 o posterior.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación (el modelo no genera texto, por lo que el riesgo es distinto) ni sobre el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del backbone Qwen3.8-27B.
- El rendimiento puede variar ligeramente en A100/H100 con el kernel fusionado `causal-conv1d` respecto a las pruebas del autor en B300.

## Enlaces

- Hugging Face: https://huggingface.co/sthanika-ai/Sieve-27B-v2
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
