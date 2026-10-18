# ya9919/qwen3.5-4b-base-finance-head-50k

## Resumen

`ya9919/qwen3.5-4b-base-finance-head-50k` es un artefacto de fine-tuning parcial publicado por el usuario ya9919 sobre el modelo base Qwen/Qwen3.5-4B-Base. No se distribuye un modelo completo: el repositorio contiene únicamente `head.pt`, una cabeza escalar de decisión en FP32 que se aplica sobre un backbone congelado que el usuario debe descargar por separado. El método declarado es `head_only`, es decir, solo se entrenan los pesos de la cabeza mientras el transformer de Qwen permanece intacto y en modo evaluación.

El problema que resuelve es acotado y muy específico: puntuar candidatos de respuesta en preguntas financieras de opción múltiple procedentes del split de entrenamiento QA en inglés de cuatro fuentes (CHFS/CGSS/CFPS/CLDS). Cada candidato se evalúa con un forward independiente sobre la concatenación completa de estado, instrucciones, criterios e identificador de candidato, y la cabeza produce una puntuación escalar por opción. No es un modelo generativo de uso general ni un asistente financiero.

Su relevancia es metodológica: documenta un pipeline de selección de checkpoint reproducible (dev20k fijo, F1 macro por pregunta como criterio primario y exactitud como secundario) y publica métricas sobre un subconjunto común de 240.458 filas y 119 versiones de pregunta del dataset CHFS/CGSS. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como un artefacto de investigación, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer decoder-only (Qwen3.5-4B-Base, congelado) + cabeza escalar de decisión compartida en FP32 (`head_only`) |
| Parámetros totales | No disponible (el repo solo publica `head.pt`; el backbone Qwen3.5-4B-Base se obtiene aparte) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens por forward; el runtime lanza error si la entrada excede ese límite, sin truncado silencioso |
| Tipos de cuantización | No disponible (cabeza almacenada en FP32; el feature-cache del backbone se preserva en BF16 antes de la cabeza) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (artefactos del modelo, con atribución al modelo upstream) |
| Formato de pesos | `head.pt` (state dict de PyTorch, FP32); pesos del backbone no incluidos en el repo |

Otros datos del repositorio: tamaño 0,0 GB, pipeline no declarado, creado y actualizado el 18 de octubre de 2026, etiquetas `s2-mas`, `financial-qa`, `decision-head`, `qwen3_5`, región `us`.

## Arquitectura y entrenamiento

La arquitectura es un esquema de dos piezas: un backbone Qwen3.5-4B-Base congelado que actúa como extractor de representaciones, y una cabeza de decisión escalar compartida que consume el estado final y emite una puntuación por candidato. La cabeza se almacena en FP32 y el pipeline conserva el roundtrip de feature-cache en BF16 antes de aplicarla. El paquete incluye `qwen_decision.py`, un helper de scoring que sustituye al head de clasificación estándar de `AutoModel`; la inferencia se hace con `DecisionPredictor.from_pretrained(".", "Qwen/Qwen3.5-4B-Base", device="cuda")`.

En entrenamiento se usaron 50.000 filas distintas del split de train QA en inglés de cuatro fuentes, con método `head_only` (backbone congelado, solo se ajusta la cabeza). Esta etapa acumuló 250.000 exposiciones de filas; el checkpoint seleccionado corresponde a 100.000 exposiciones de etapa y 100.000 exposiciones acumuladas sobre las mismas 50.000 filas distintas. La selección se hizo con un dev20k fijo usando F1 macro por pregunta como métrica primaria y exactitud como secundaria; la elección del método Qwen4B se hizo sobre el dev completo de 412.873 filas y el test final no se usó para selección. No se documentan en la información disponible fases de RLHF, DPO ni mezcla de datos más allá del corpus QA citado.

## Capacidades

- Puntuación de candidatos en preguntas financieras de opción múltiple: recibe `qid`, `state`, `question.instructions`, `question.criteria` y una lista ordenada de `candidate_ids`, y devuelve una puntuación escalar por candidato.
- Evaluación con entrada completa: cada candidato se puntúa con un forward independiente sobre el estado, la pregunta y todas las opciones, sin truncar entradas por debajo de 2.048 tokens.
- Inferencia sin etiqueta observada: no requiere la respuesta correcta en tiempo de inferencia, lo que permite usarlo como scorer o juez.
- Reproducción de experimentos: el paquete está diseñado para replicar la evaluación sobre el subconjunto común CHFS/CGSS con denominadores declarados.
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio según la información disponible.
- Capacidad multilingüe: limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Puntuación de respuestas en encuestas financieras de los hogares: dado un estado (datos del encuestado) y una pregunta con criterios, el modelo ordena las opciones candidatas de CHFS/CGSS/CFPS/CLDS. Es adecuado porque fue entrenado exactamente sobre ese formato de cuatro fuentes y ese esquema de campos.
- Réplica académica de resultados: el paquete `qwen_decision.py` y los denominadores publicados (240.458 filas, 119 versiones de pregunta, dev de 412.873 filas) permiten reproducir la métrica reportada sin reentrenar.
- Auditoría de anotaciones en datasets de encuestas: al puntuar cada opción de forma independiente, se pueden marcar filas donde el candidato anotado recibe una puntuación anómalamente baja frente a alternativas, útil como control de calidad.
- Juez escalar en evaluación de asistentes financieros: la cabeza puede puntuar opciones generadas por otro sistema en tareas de QA financiero con opciones cerradas, siempre que las entradas no superen 2.048 tokens.
- Etiquetado asistido en pipelines de anotación: preclasificar opciones para que un anotador humano revise solo los casos de baja puntuación, reduciendo coste por fila en corpus de encuestas financieras.
- Baseline de investigación para comparar métodos de adaptación: al ser `head_only` sobre backbone congelado, sirve como referencia barata (sin entrenar el transformer) frente a fine-tuning completo o LoRA en la misma tarea.
- Validación de consistencia entre versiones de pregunta: comparando puntuaciones entre las 119 versiones de pregunta del subconjunto común se pueden detectar formulaciones que degradan la separación entre opciones.

## Benchmarks y rendimiento

Evaluación held-out sobre el subconjunto común CHFS/CGSS de 240.458 filas y 119 versiones de pregunta, con etiquetas observadas y backbone congelado:

| Métrica | Valor |
|---|---:|
| Accuracy | 0,673369154 |
| F1 macro por pregunta | 0,310165751 |
| Predicciones inválidas | 0 |

Nota de denominadores: el split de test completo en inglés del repositorio de origen tiene 418.597 filas, por lo que las cifras no son directamente comparables con resultados publicados sobre ese split. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 4B en BF16 ocupa aproximadamente 8-9 GB de pesos; hay que sumar activaciones y cache KV para entradas de hasta 2.048 tokens. La cabeza FP32 añade un coste despreciable.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y barridos de evaluación; L40S o A10G para servicio moderado.
- Consumer GPU: sí cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen; en RTX 4080 (16 GB) es viable con cuidado del tamaño de lote. No se declaran requisitos oficiales.
- Despliegue: no hay soporte de vLLM, TGI, llama.cpp ni Ollama para este artefacto, ya que no es un modelo generativo estándar sino un paquete Python con `DecisionPredictor`. El stack declarado es Python 3.12, PyTorch 2.12.1+cu126, Transformers 5.19.0, PEFT 0.21.0, accelerate y safetensors; FLA y causal-conv son aceleradores opcionales con fallback oficial en Torch.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por fila escala de forma lineal con el número de candidatos, porque cada candidato requiere su propio forward completo, lo que reduce el throughput agregado frente a un scoring de una sola pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-base-finance-head-50k | Backbone ~4B + cabeza (tamaño no disponible) | 2.048 tokens | Scoring de opciones en QA financiero | Apache-2.0 | Repo HF con solo `head.pt`; backbone aparte |
| Qwen/Qwen3.5-4B-Base | ~4B | No disponible en la información proporcionada | Modelo base generativo de propósito general | No disponible en la información proporcionada | Público en HF |
| Fine-tuning completo o LoRA sobre el mismo backbone | ~4B (completo) o adaptadores | El del backbone | QA financiero | Depende del autor | No evaluado en la información disponible |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento numérica. La comparación relevante es de coste de entrenamiento (solo cabeza frente a adaptadores o fine-tuning completo) y de alcance funcional (scoring cerrado frente a generación abierta).

## Limitaciones y advertencias

- El F1 macro por pregunta de 0,310 indica una separación débil entre opciones a nivel de pregunta pese a una accuracy de 0,673; en preguntas con distribuciones de opciones desbalanceadas el modelo puede concentrarse en la clase mayoritaria.
- El artefacto no es un modelo completo: sin descargar Qwen/Qwen3.5-4B-Base y su tokenizador, el repositorio no es utilizable. El tamaño del repo (0,0 GB) refleja que solo contiene la cabeza.
- Límite duro de 2.048 tokens por entrada, con error explícito en lugar de truncado; estados de encuestado y criterios largos pueden quedar fuera de rango.
- Solo inglés; sin soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí riesgo de puntuaciones mal calibradas fuera de la distribución CHFS/CGSS/CFPS/CLDS.
- Sesgos: los derivados de los datos de encuesta de origen (demografía, país, redacción de las preguntas, versiones concretas); no se documenta ninguna mitigación.
- Restricciones de licencia: los artefactos son Apache-2.0, pero los datos de entrenamiento retienen los términos `chfs-cgss-cfps-clds-source-data-terms` del repositorio QA de origen, lo que condiciona la reproducibilidad y cualquier redistribución de datos derivados.
- Para producción: sin descargas ni validación comunitaria, sin pipeline declarado, sin benchmarks estándar y con una única métrica held-out; no debe usarse como asesoramiento financiero ni para decisiones que afecten a personas.
- La fecha de creación (18 de octubre de 2026) y la referencia a Transformers 5.19.0 y PyTorch 2.12.1 implican dependencias que deben verificarse contra el entorno real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/qwen3.5-4b-base-finance-head-50k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de reproducción y evidencia agregada: https://github.com/KataDavidXD/mas-simulation
