# ya9919/qwen3.5-4b-base-finance-head-200k

## Resumen

El modelo `ya9919/qwen3.5-4b-base-finance-head-200k` es una cabeza escalar de decisión entrenada sobre el backbone congelado Qwen3.5-4B-Base. No es un modelo generativo completo ni un `AutoModelForSequenceClassification` estándar: puntúa cada opción candidata de una pregunta de QA financiero en inglés a partir de un estado, unas instrucciones y unos criterios. Lo publica el usuario `ya9919` con licencia Apache-2.0 para los artefactos.

La relevancia del modelo está en su enfoque `head_only`: solo se entrena la cabeza, con 200.000 filas distintas del split de entrenamiento de QA financiero en inglés y el backbone oficial congelado. Esto reduce el coste de entrenamiento y permite reproducir la etapa sin modificar los pesos del backbone, aunque exige obtener Qwen3.5-4B-Base por separado y usar el código de inferencia incluido.

El paquete contiene `head.pt` en FP32 y un runtime que impone un límite estricto de 2048 tokens por entrada. El modelo declara únicamente inglés y está orientado a evaluación observada sobre un subconjunto común CHFS/CGSS de 240.458 filas y 119 versiones de pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5-4B-Base congelado + cabeza escalar de decisión (`head_only`); no es una cabeza de clasificación estándar de `AutoModel` |
| Parametros totales | 4B en el backbone; parámetros exactos de la cabeza no disponibles |
| Longitud de contexto | 2048 tokens máximo en el runtime incluido; entradas mayores lanzan error. Contexto nativo del backbone no disponible |
| Tipos de cuantizacion | Cabeza almacenada en FP32; el backbone se obtiene aparte y su cuantización no se especifica. La ruta de inferencia conserva una caché de características en BF16 |
| Idiomas soportados | Inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 para los artefactos, con atribución al modelo base; los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | `head.pt` (PyTorch); no se incluyen safetensors ni GGUF. El backbone y el tokenizer oficiales se obtienen por separado |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Qwen3.5-4B-Base congelado con una cabeza escalar compartida que produce una puntuación por candidato. El método declarado es `head_only`: no se actualizan los pesos del backbone. El paquete incluye únicamente `head.pt`; el backbone oficial y el tokenizer deben descargarse aparte. La inferencia exacta usa el estado completo, la pregunta y todas las opciones, sin truncamiento silencioso: cada candidato se puntúa mediante una pasada completa independiente con formato de texto crudo. Antes de la cabeza FP32 se conserva el recorrido de caché de características en BF16.

El entrenamiento utilizó 200.000 filas distintas del split de entrenamiento de QA financiero inglés de cuatro fuentes. La etapa terminal tuvo 800.000 exposiciones a filas y el checkpoint seleccionado acumuló 200.000 exposiciones y 200.000 filas distintas. La selección de checkpoints se hizo con un `dev20k` fijo usando F1 macro por pregunta y, después, accuracy; el `dev` completo de 412.873 filas seleccionó el método Qwen4B y el test final no se usó para selección. No se detallan en la información disponible la composición exacta de las cuatro fuentes, el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Puntuación escalar de candidatos para preguntas de QA financiero en inglés.
- Ranking de opciones ordenadas mediante `candidate_ids`, sin generar texto libre.
- Procesamiento de entradas con `qid`, `state`, `question.instructions`, `question.criteria` y opciones candidatas.
- Evaluación exacta sin truncamiento silencioso; si la entrada supera los 2048 tokens, el runtime lanza un error.
- Integración mediante el helper `qwen_decision.py`, no mediante un pipeline estándar de HuggingFace.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe no disponible: solo se declara inglés.
- No es un modelo de chat ni un generador de respuestas abiertas; su salida es una puntuación por candidato.

## Casos de uso

- Puntuación de opciones en encuestas financieras: dado el estado del hogar y los criterios de una pregunta, el modelo puntúa cada opción candidata del subconjunto CHFS/CGSS. Es adecuado porque trabaja con opciones cerradas y un estado estructurado, no con generación libre.
- Anotación asistida y control de calidad: ordenar las etiquetas candidatas de nuevos lotes de QA financiero para que un revisor humano priorice las discrepancias. La cabeza puede procesar hasta 2048 tokens por entrada y no necesita la etiqueta observada en inferencia.
- Simulación multiagente financiera: integrar la cabeza como módulo de decisión de agentes que eligen entre acciones u opciones predefinidas en el repositorio `mas-simulation`. El bajo coste relativo se debe a que el backbone permanece congelado.
- Selección de respuestas en extracción de datos financieros: generar varios candidatos con OCR o con un modelo generativo y puntuarlos después con esta cabeza para elegir la opción más consistente con el estado y los criterios.
- Auditoría de cuestionarios: evaluar si las opciones de respuesta son coherentes con el estado declarado; puntuaciones bajas pueden señalar preguntas ambiguas, opciones mal redactadas o datos inconsistentes.
- Investigación reproducible sobre métodos `head_only`: usar el checkpoint de 200.000 filas como baseline para comparar cabezas, backbones y estrategias de selección con el `dev20k` fijo.
- Priorización en FAQ financieras en inglés: puntuar un conjunto cerrado de respuestas candidatas y derivar a revisión humana o a un generador las que queden por debajo de un umbral; no sustituye a un modelo generativo.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---:|
| QA financiero held-out: subconjunto común CHFS/CGSS de 240.458 filas y 119 versiones de pregunta | Accuracy | 0,672840995 |
| Mismo conjunto | F1 macro por pregunta | 0,308995152 |
| Mismo conjunto | Predicciones inválidas | 0 |

El split de test completo del repositorio fuente tiene 418.597 filas, pero no es el mismo denominador que el subconjunto evaluado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas de rendimiento con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM orientativa para el backbone en BF16/FP16: unos 8 GB solo para los pesos; con activaciones para 2048 tokens y lote 1, conviene reservar 10-12 GB. La cabeza FP32 añade un coste pequeño.
- VRAM orientativa con backbone en 4 bits: 2,5-3 GB para los pesos y 4-6 GB en total. La compatibilidad de un backbone cuantizado con este runtime no está documentada; debe validarse.
- GPU recomendadas: RTX 4090 de 24 GB para BF16; A100 o H100 para lotes y evaluación a mayor escala; RTX 3060 de 12 GB o similar para pruebas en 4 bits. CPU es posible, pero no recomendable por latencia.
- Despliegue: `qwen_decision.py` con Python 3.12, PyTorch 2.12.1+cu126, Transformers 5.19.0, PEFT 0.21.0, `accelerate` y `safetensors`. FLA y `causal-conv` son aceleradores opcionales; se admite el fallback oficial de Torch.
- No se documenta soporte para vLLM, TGI, Ollama o llama.cpp para esta cabeza. El backbone puede servirse por separado, pero la puntuación de candidatos requiere el código incluido.
- Latencia y throughput no disponibles. Cada candidato exige una pasada completa independiente, por lo que el coste de inferencia crece de forma aproximadamente lineal con el número de opciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---:|---|
| Este modelo | 4B en backbone; cabeza no disponible | 2048 tokens en runtime | Cabeza escalar para QA financiero | Apache-2.0 para artefactos | HuggingFace |
| Qwen3.5-4B-Base | 4B | No disponible | Backbone generativo preentrenado | No disponible en la información | HuggingFace |
| Alternativas públicas de cabeza de decisión financiera | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada alternativas públicas comparables de cabeza de decisión financiera. La comparación con Qwen3.5-4B-Base es solo de referencia estructural, no de rendimiento en la tarea.

## Limitaciones y advertencias

- Solo admite inglés; no se declaran capacidades multilingües.
- Límite estricto de 2048 tokens por entrada; el runtime lanza un error en lugar de truncar. Esto puede excluir estados o preguntas largas.
- No es un modelo generativo: no responde preguntas abiertas ni produce explicaciones; solo puntúa candidatos ordenados.
- Requiere código personalizado y versiones concretas de PyTorch, Transformers y PEFT. No funciona como un pipeline estándar de HuggingFace.
- El backbone no se incluye en el repositorio y debe obtenerse por separado; el paquete solo contiene `head.pt`.
- El rendimiento publicado es específico de QA financiero: accuracy 0,6728 y F1 macro por pregunta 0,3090. No hay datos de calibración ni de robustez fuera de ese dominio.
- No se han publicado análisis de sesgos, equidad o comportamiento ante distribuciones distintas de CHFS/CGSS.
- La cabeza puede producir puntuaciones erróneas o sobreconfiadas; no se documenta ningún mecanismo de abstención o estimación de incertidumbre.
- Los artefactos son Apache-2.0, pero los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`; conviene revisar las condiciones antes de un uso comercial o de redistribución de datos.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa independiente.

## Enlaces

- [HuggingFace: ya9919/qwen3.5-4b-base-finance-head-200k](https://huggingface.co/ya9919/qwen3.5-4b-base-finance-head-200k)
- [Modelo base: Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Repositorio de reproducción: mas-simulation](https://github.com/KataDavidXD/mas-simulation)
- Paper, blog o demo: no disponibles en la información proporcionada.
