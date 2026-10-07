# yashchouhann/laya-typed-decisions

## Resumen

Laya (fine-tuned on Typed-Decisions) es un modelo de clasificación de texto desarrollado por Convai Innovations y publicado en Hugging Face. Se trata de un ajuste fino sobre el benchmark independiente LocalLLaMA/typed-decisions, compuesto por 1.200 casos de entrenamiento que suman 6.000 decisiones tipadas ("typed decisions"). El modelo está diseñado para evaluar estados de flujo de trabajo (workflow states) junto con preguntas tipadas y devolver respuestas estructuradas en una única pasada forward, sin necesidad de llamadas a una API externa.

El problema que resuelve es el de las decisiones calibradas en sistemas "System One": en lugar de razonar paso a paso con un modelo generativo grande, Laya produce directamente una decisión tipada con una puntuación de confianza calibrada. Esto es relevante para pipelines de agentes donde el coste por caso y la latencia importan: la model card declara 161,6 ms de latencia p50 y un coste de 0,00 dólares por caso al ser autoalojado, frente a los 710 ms y 0,0004 dólares por caso de TypeSafe Jev 1.13.0 vía API.

El modelo tiene 421.293.830 parámetros (aproximadamente 421 M) y se distribuye en formato safetensors con licencia Apache 2.0. La model card no especifica la arquitectura base ni la longitud de contexto, y el repositorio figura con 0 descargas y 0 "likes" en el momento de la consulta. Los resultados declarados (0,773 de accuracy y 0,052 de Brier score) están marcados como no verificados en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (se distribuye como modelo de `transformers` para `text-classification`; la model card no especifica la arquitectura base) |
| Parámetros totales | 421.293.830 (≈421 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`transformers`); tamaño del repositorio 0,8 GB |
| Pipeline declarado | No disponible (los tags indican `benchmark` y `text-classification` en el model-index) |
| Tarea | Clasificación de texto / decisión tipada sobre estados de workflow |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo, más allá de indicar que se carga mediante la librería `transformers` y que realiza una única pasada forward sobre un estado y un conjunto de preguntas tipadas. El recuento de 421 M de parámetros y el tamaño del repositorio (0,8 GB) son compatibles con pesos almacenados en precisión reducida (aproximadamente 2 bytes por parámetro), aunque este extremo no se confirma en la documentación. No se especifican el número de capas, la dimensionalidad oculta, el mecanismo de atención ni la ventana de contexto.

En cuanto al entrenamiento, el modelo se ha ajustado sobre los 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente LocalLLaMA/typed-decisions. La model card menciona explícitamente un "Teacher Self-Agreement ceiling" de 0,735, lo que sugiere un proceso de destilación o generación de etiquetas a partir de un modelo profesor, seguido de un ajuste fino sobre las decisiones resultantes. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras formas de alineación. Los tags del repositorio (`rlcd`, `calibrated-decisions`, `structured-decisions`, `system-one`) apuntan a un enfoque de decisión calibrada de un solo paso, pero no hay detalles técnicos publicados sobre el procedimiento exacto.

## Capacidades

- Clasificación de texto orientada a decisión: produce respuestas tipadas a preguntas estructuradas sobre un estado de workflow, en una sola pasada forward.
- Decisión calibrada: la model card reporta métricas de calibración (Brier score 0,052; ECE 0,143) y una puntuación de confianza asociada a cada decisión.
- Puntuación con resolución graduada: el "within 1 level" de 0,993 indica que prácticamente todas las predicciones caen dentro de un nivel de la etiqueta correcta en la escala del benchmark.
- Procesamiento en lote de múltiples decisiones: la API `agent.predict(state, questions)` acepta un estado y varias preguntas, devolviendo un conjunto de respuestas.
- Integración con `transformers`: el modelo se carga desde Hugging Face mediante la librería `laya`, que envuelve el pipeline estándar.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni function calling.
- No se documenta soporte multilingüe ni comportamientos específicos de agentes autónomos.

## Casos de uso

- Observabilidad de trazas de agentes: el modelo puede clasificar decisiones sobre trazas de ejecución de agentes (Agent Trace Observability, uno de los cuatro dominios del conjunto de test) para etiquetar automáticamente si una traza cumple o no un criterio tipado, con una latencia declarada de 161,6 ms por caso.
- Atención al cliente automatizada: en el dominio Customer Service del benchmark, el modelo evalúa el estado de la conversación y responde a preguntas tipadas (por ejemplo, si procede escalar, si se ha resuelto la incidencia), permitiendo enrutado y triaje sin invocar un LLM generativo.
- Procesamiento de facturas: en el dominio Invoice Processing, la decisión tipada permite validar campos o determinar el estado de una factura frente a preguntas estructuradas, con la ventaja de un coste marginal nulo al ejecutarse en hardware propio.
- Gestión de incidentes de seguridad: en el dominio Security Incidents, el modelo puede asignar severidad o clasificar el estado de un incidente a partir de un estado estructurado, sirviendo como primera capa de triaje antes de escalar a análisis humanos.
- Guardarraíl o verificador en pipelines de agentes: al ser un clasificador pequeño y autoalojado, puede insertarse como paso de validación entre la salida de un LLM y una acción irreversible, aportando una señal calibrada con la que decidir si se requiere revisión.
- Evaluación de workflows en CI/CD: el modelo puede emplearse como comprobador automático en tests de regresión de agentes, verificando que un cambio en el prompt o en el grafo de decisión no degrada las decisiones esperadas.
- Sustitución de llamadas a API de clasificación: para equipos que hoy pagan por caso en servicios externos, un modelo de 421 M con licencia Apache 2.0 permite autoalojar la clasificación y eliminar el coste por inferencia.
- Investigación en calibración y decisiones estructuradas: al publicarse junto a un benchmark de 1.200 casos y métricas de calibración, sirve como referencia reproducible para comparar enfoques de decisión tipada.

## Benchmarks y rendimiento

Resultados declarados en el model-index del autor (marcados como `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| System One Decision Benchmark (text-classification) | Typed Decisions (LocalLLaMA/typed-decisions) | Accuracy | 0,773 |
| System One Decision Benchmark (text-classification) | Typed Decisions (LocalLLaMA/typed-decisions) | Brier score | 0,052 |

Comparativa cabeza a cabeza publicada en la model card (conjunto de test oficial de 400 casos, 2.000 decisiones, en los dominios Agent Trace Observability, Customer Service, Invoice Processing y Security Incidents):

| Modelo | Tipo | Accuracy | Soft acc. | Brier score | ECE | Score MAE | Within 1 level | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned) | Ajustado | 0,773 | 0,568 | 0,052 | 0,143 | 0,229 | 0,993 | 161,6 ms | 0,00 USD (autoalojado) |
| TypeSafe Jev 1.13.0 | General | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149 M) | Especialista | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | Techo | 0,735 | - | - | - | - | - | - | - |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en bf16/fp16 (pesos), coherente con el tamaño de repositorio de 0,8 GB; alrededor de 1,7 GB si se cargan los 421 M de parámetros en fp32. Con activaciones y overhead del runtime, un presupuesto de 2-3 GB de VRAM es suficiente para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, L4, T4, A10, A100 y H100. Las GPU de datacenter solo tienen sentido si se necesita paralelizar grandes volúmenes de peticiones.
- Cabe en GPU de consumo: sí. Prácticamente cualquier GPU de consumo de los últimos años, e incluso CPU con suficiente RAM, puede ejecutar el modelo dado su tamaño de 421 M de parámetros.
- Opciones de despliegue: la vía documentada es la librería `laya` (`pip install laya`) sobre `transformers`, cargando el modelo desde Hugging Face. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia alternativos. Al tratarse de un modelo de clasificación y no de generación, las herramientas orientadas a decodificación autoregresiva no son directamente aplicables sin adaptación.
- Latencia y throughput estimados: la model card declara 161,6 ms de latencia p50 por caso, frente a 710 ms de TypeSafe Jev 1.13.0 y 349 ms de ModernBERT-base. No se publican cifras de throughput (peticiones por segundo) ni el hardware sobre el que se midió esa latencia, por lo que la comparación debe tomarse con cautela.
- Coste por caso: 0,00 USD en autoalojamiento, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Accuracy (benchmark del autor) | Brier score | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Laya (typed-decisions) | 421 M | Ajustado específicamente | 0,773 | 0,052 | 161,6 ms | Apache 2.0 | Hugging Face (`yashchouhann/laya-typed-decisions`) |
| TypeSafe Jev 1.13.0 | No disponible | General | 0,727 | 0,148 | 710 ms | No disponible | API de pago (0,0004 USD/caso) |
| ModernBERT-base | 149 M | Especialista | 0,646 | 0,119 | 349 ms | No disponible en esta información | Público, según se cita en la model card |
| Teacher Self-Agreement | No disponible | Techo de referencia | 0,735 | - | - | - | Solo como referencia metodológica |

La comparación se limita a los modelos incluidos por el propio autor en la model card. No se dispone de datos independientes que permitan contrastar estos resultados, ni de comparaciones con otros clasificadores de decisión tipada de la misma categoría.

## Limitaciones y advertencias

- Resultados no verificados: las métricas del model-index están marcadas con `verified: false` y provienen exclusivamente del autor del modelo. No hay evaluación independiente publicada.
- Riesgo de sobreajuste al benchmark: el ajuste fino se realiza sobre los mismos 1.200 casos (6.000 decisiones) del benchmark sobre el que se reportan resultados. El conjunto de test es independiente (400 casos, 2.000 decisiones), pero no se documenta ninguna validación cruzada ni separación adicional.
- Dominio restringido: las capacidades se limitan a cuatro dominios concretos (Agent Trace Observability, Customer Service, Invoice Processing, Security Incidents). No hay evidencia de generalización fuera de ellos.
- Idiomas no documentados: la model card no indica qué idiomas soporta el modelo. No se puede asumir cobertura multilingüe.
- Arquitectura y contexto desconocidos: al no publicarse la arquitectura base ni la longitud de contexto, es imposible estimar el comportamiento con entradas largas o evaluar los requisitos reales de memoria para lotes grandes.
- Adopción nula y modelo muy reciente: 0 descargas y 0 "likes" en el momento de la consulta, con fecha de creación y actualización muy próximas entre sí. No existe comunidad, issues públicos ni casos de uso en producción documentados.
- Inconsistencia de identificadores: el ejemplo de la model card usa `convaiinnovations/laya-typed-decisions` mientras que el repositorio consultado es `yashchouhann/laya-typed-decisions`. Conviene verificar cuál es el artefacto canónico antes de integrarlo.
- Dependencia de la librería `laya`: el flujo documentado requiere `pip install laya`. No se detalla el mantenimiento de ese paquete ni su compatibilidad con versiones recientes de `transformers`.
- Riesgo de alucinación: al ser un modelo de clasificación y no de generación, el riesgo no es de texto inventado, sino de decisiones incorrectas con confianza mal calibrada en dominios alejados de los datos de entrenamiento. La ECE declarada de 0,143 indica un error de calibración no despreciable.
- Licencia: Apache 2.0, que permite uso comercial y modificación siempre que se conserven los avisos de copyright y licencia. No se declaran restricciones adicionales, pero tampoco se ofrece garantía alguna por parte del autor.
- Advertencia sobre las búsquedas web: los resultados de búsqueda asociados a esta consulta no contenían información técnica relevante sobre el modelo (devolvieron contenido no relacionado y de carácter adulto), por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashchouhann/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organización desarrolladora (según la model card): https://huggingface.co/convaiinnovations
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la información disponible.
