# ya9919/YN-421m-3rounds

## Resumen

YN-421m-3rounds es un modelo de decisión financiera de aproximadamente 421 millones de parámetros, desarrollado por el usuario ya9919 en el marco del proyecto S²-MAS (society-scale multi-agent simulation). No es un modelo generativo de texto al uso: se trata de un encoder basado en Laya (a su vez derivado de ModernBERT-large) con una cabeza de puntuación de opciones, entrenado para puntuar alternativas discretas ante un estado de hogar y una pregunta del ámbito financiero. Su función es servir como política de decisión reutilizable dentro de simulaciones multiagente a gran escala.

El modelo parte del checkpoint base convaiinnovations/laya y se ha afinado con dos etapas de SFT y una etapa posterior de RLCD (reinforcement learning from contrastive decisions) sobre datos de encuestas reales, con 1.721.623 observaciones de entrenamiento por idioma. Esta versión concreta es el comparador de tres rondas (FinL three-round comparator) en formato nativo Laya/PyTorch; la variante de seis rondas se publica como checkpoint separado (ya9919/YN-421m), y existe una versión empaquetada para MLX en fin-laya-mlx-3-rounds.

Su relevancia radica en el nicho: la modelización de decisiones de hogares a escala poblacional (el manuscrito evalua 12 millones de agentes sintéticos y 24 millones de elecciones). El modelo solo soporta inglés, tiene una licencia de investigación controlada y un uso muy específico, por lo que no compite con LLMs generalistas sino con modelos de elección discreta y políticas de simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Laya, derivado de ModernBERT-large) con cabeza de puntuación de opciones |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (inferencia nativa en PyTorch); FP16 en el runtime MLX empaquetado; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | s2-mas-controlled-research-v1.2 (Controlled Model Research License v1.2), con derechos upstream Apache-2.0 retenidos |
| Formato de pesos | safetensors (formato nativo Laya/PyTorch); variante MLX separada |

## Arquitectura y entrenamiento

El modelo se construye sobre Laya, un encoder de la familia ModernBERT-large adaptado por convaiinnovations, al que se añade una cabeza de puntuación de opciones. En lugar de generar texto, el modelo recibe un estado de hogar y una pregunta con un menú de alternativas candidatas, y produce una puntuación para cada opción; la alternativa con mayor puntuación es la predicción. Esta interfaz permite reutilizar la misma política para distintas tareas de elección sin cambiar la arquitectura.

El entrenamiento parte del checkpoint base y aplica dos etapas de SFT seguidas de una etapa de RLCD nativa, ajustando el modelo a datos de encuestas reales con 1.721.623 observaciones por idioma. Esta versión corresponde al comparador de tres rondas; el checkpoint de seis rondas (ya9919/YN-421m) amplía la cobertura supervisada. No se documentan en la información disponible detalles sobre la composición exacta del dataset, la longitud de contexto soportada ni innovaciones como decodificación especulativa (no aplicable a un modelo de scoring).

## Capacidades

- Puntuación de opciones discretas: evalúa un menú de alternativas ante una pregunta y un estado de hogar, devolviendo la opción más probable.
- Decisiones financieras de hogar: uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores y depósitos a plazo no vencidos, entre otras preguntas del conjunto de evaluación.
- Integración en simulación multiagente: sirve como política de decisión reutilizable dentro del framework S²-MAS para generar elecciones a escala poblacional.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo ni un agente conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad intrínseca; su rol en agentes es el de componente de decisión, no de orquestación.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Simulación de decisiones financieras de hogares a escala: el modelo puntúa alternativas para millones de agentes sintéticos dentro de S²-MAS, permitiendo estudiar cómo las decisiones individuales agregadas producen resultados poblacionales en consumo, efectivo y medios de pago.
- Modelización de elección discreta en investigación económica: sustituye o complementa modelos logit/probit clásicos al puntuar menús de opciones con un encoder entrenado sobre encuestas reales, con métricas de accuracy y F1 por pregunta.
- Evaluación de políticas y escenarios contrafactuales: al integrarse en escenarios reutilizables del framework, permite comparar distribuciones de elección bajo condiciones cambiantes (por ejemplo, acceso a crédito o tenencia de productos financieros).
- Generación de datos sintéticos de encuestas: la política puede usarse para producir respuestas sintéticas etiquetadas que alimenten análisis exploratorios antes de recoger datos reales.
- Investigación sobre sesgo y heterogeneidad: al condicionar sobre estados de hogar, permite analizar cómo varían las decisiones entre subpoblaciones y detectar patrones sistemáticos en los agentes simulados.
- Validación de pipelines de decisión: como checkpoint de referencia (tres rondas) frente a la variante de seis rondas y al modelo base Laya, sirve para medir la ganancia de cada etapa de entrenamiento en tareas de elección.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | PyTorch BF16 | 240.458 | 119 | 74,5336 % | 38,0164 % |
| Test expandido | Inglés | PyTorch BF16 | 418.597 | 862 | 56,3657 % | 19,2395 % |

Como referencia, el Laya original en BF16 nativo obtiene en el mismo test compartido 60,2080 % de accuracy y 29,5574 % de F1, frente a los resultados de tres rondas de la tabla. La accuracy pondera por igual cada registro de QA; el F1 macro promedia el F1 sobre todas las clases candidatas de cada versión de pregunta y luego pondera por igual las versiones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421 M de parámetros, en BF16/FP16 el peso ocupa aproximadamente 0,85 GB; el repositorio completo mide 0,8 GB. La VRAM total dependerá del tamaño de lote y de la longitud de secuencia, no documentados.
- GPU recomendadas: el manuscrito reporta tiempos de una sola petición con el checkpoint bilingüe FinL (ya9919/YN-322m-mlx) en una NVIDIA A100 PCIe de 40 GB en FP16, con lote y concurrencia uno y tres casos chinos fijos. Para este checkpoint no se publican cifras de latencia propias.
- GPU de consumo: por tamaño (menos de 1 GB de pesos) cabe holgadamente en cualquier GPU de consumo moderna, aunque no se documentan pruebas específicas.
- Opciones de despliegue: inferencia nativa en Laya/PyTorch con BF16 (incluye `predict_example.py`); runtime MLX para FP16 en la variante empaquetada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para este checkpoint; las cifras del manuscrito corresponden al checkpoint bilingüe de 322 M en MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-421m-3rounds | 421 M | No disponible | Scoring de opciones financieras | Controlled Model Research License v1.2 | Hugging Face (34 descargas) |
| YN-421m (6 rondas) | 421 M | No disponible | Scoring de opciones financieras, cobertura supervisada ampliada | Misma familia de licencia | Hugging Face |
| convaiinnovations/laya (base) | No disponible | No disponible | Encoder general | No disponible en la información | Hugging Face |
| YN-322m-mlx (FinL bilingüe) | 322 M | No disponible | Scoring de opciones, bilingüe | Misma familia de licencia | Hugging Face, runtime MLX |

No se dispone de comparación con modelos de elección discreta clásicos ni con LLMs generalistas en la información proporcionada; la comparación relevante es interna a la familia FinL y frente al Laya base.

## Limitaciones y advertencias

- Modelo de scoring, no generativo: no produce texto libre, tool calling ni razonamiento multi-paso; cualquier uso conversacional es inviable.
- Solo inglés: no soporta castellano ni otros idiomas.
- Contexto no documentado: se desconoce la longitud máxima de secuencia, lo que limita la planificación de despliegues con estados de hogar largos.
- Licencia restrictiva: la Controlled Model Research License v1.2 está orientada a investigación controlada; el uso comercial requiere revisar el texto completo de la licencia y los derechos upstream Apache-2.0 retenidos.
- Riesgo de alucinación en el sentido de decisiones incorrectas: el F1 macro por pregunta cae al 19,24 % en el test expandido (862 versiones de pregunta), lo que indica un rendimiento desigual entre tipos de pregunta y clases candidatas.
- Datos de entrenamiento y evaluación no distribuidos: no es posible auditar la composición del dataset ni reproducir el entrenamiento con los artefactos publicados.
- Adopción muy baja: 34 descargas y 1 like en el momento de la consulta; no hay ecosistema de herramientas ni validación independiente.
- El motor GENESE/MAS permanece privado, por lo que la integración completa en el framework S²-MAS no es reproducible de extremo a extremo solo con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-3rounds
- Checkpoint de seis rondas: https://huggingface.co/ya9919/YN-421m
- Variante MLX de tres rondas: https://huggingface.co/ya9919/YN-421m-3rounds-mlx
- Checkpoint bilingüe FinL (MLX): https://huggingface.co/ya9919/YN-322m-mlx
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/YN-421m-3rounds/blob/main/LICENSE
- Ejemplos de QA en JSON: qa_examples.json (referenciado en la model card del repositorio)
