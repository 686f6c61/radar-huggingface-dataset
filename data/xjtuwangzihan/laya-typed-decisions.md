# xjtuwangzihan/laya-typed-decisions

## Resumen

Laya (fine-tuned on typed-decisions) es un modelo de clasificación de texto desarrollado por xjtuwangzihan (Convai Innovations) y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base Laya sobre las 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente LocalLLaMA/typed-decisions, orientado a la toma de decisiones estructuradas y calibradas en flujos de agentes automatizados.

El modelo aborda el problema de la "decisión de sistema uno": evaluar un estado de workflow junto con un conjunto de preguntas tipadas y producir respuestas calibradas en un único forward pass. Frente a alternativas basadas en APIs de propósito general (TypeSafe Jev 1.13.0) o clasificadores especialistas (ModernBERT-base), Laya combina mayor precisión con una latencia muy reducida y coste cero por caso al ser autoalojado.

Con 421 millones de parámetros y un repositorio de 1,7 GB en formato safetensors, el modelo está pensado para integrarse en pipelines de agentes que requieren decisiones rápidas, calibradas y auditables. Su relevancia actual radica en que supera el techo de autoacuerdo del profesor (0,735) del propio benchmark, lo que sugiere que el ajuste fino añade señal más allá de la destilación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Laya; detalles de capas y atención no disponibles) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Laya, un transformer encoder orientado a la evaluación de estados de workflow y preguntas tipadas en un solo forward pass. No se dispone de información pública sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto del modelo base. El ajuste fino se realizó sobre 1.200 casos de entrenamiento del benchmark LocalLLaMA/typed-decisions, que comprenden 6.000 decisiones individuales, y se evaluó sobre el conjunto de test oficial de 400 casos (2.000 decisiones) distribuidos en cuatro dominios: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.

El entrenamiento produce un modelo de "decisiones tipadas" con calibración explícita: además de la precisión, se reportan métricas de calibración como el Brier score (0,050), el error de calibración esperado (ECE, 0,142) y el error absoluto de la puntuación (MAE, 0,211). No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otras etapas de alineación, ni la composición exacta del dataset de preentrenamiento del modelo base.

## Capacidades

- Clasificación de texto y toma de decisiones estructuradas sobre estados de workflow y preguntas tipadas.
- Evaluación de múltiples decisiones en un único forward pass mediante la API `agent.predict(state, questions)`.
- Producción de respuestas calibradas (puntuaciones de confianza con Brier score bajo y ECE controlado).
- Soporte de decisiones en cuatro dominios evaluados: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.
- Capacidad de superar el techo de autoacuerdo del profesor del benchmark (0,735) en precisión (0,772).
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Observabilidad de trazas de agentes: el modelo evalúa el estado de una traza de ejecución de un agente y emite decisiones tipadas sobre su clasificación o severidad, integrándose en sistemas de monitorización con latencia de 20,4 ms por caso (p50).
- Atención al cliente automatizada: clasifica el estado de una conversación multi-turno y responde a preguntas tipadas sobre intención, urgencia o resolución, con calibración suficiente para enrutar casos dudosos a revisión humana (ECE de 0,142).
- Procesamiento de facturas: evalúa estados de documentos y responde a decisiones estructuradas sobre validación, extracción o escalado, con coste autoalojado nulo frente a APIs de pago.
- Gestión de incidentes de seguridad: clasifica el estado de un incidente y emite decisiones tipadas sobre severidad y acciones recomendadas, con alta coherencia ordinal (0,996 de acierto dentro de un nivel).
- Enrutamiento de decisiones en pipelines de CI/CD: dado un estado de build o despliegue y un conjunto de preguntas tipadas, el modelo produce respuestas calibradas en una sola pasada para decidir si continuar, bloquear o escalar.
- Evaluación de calidad de agentes en producción: integrado en sistemas de evaluación automática que necesitan decisiones rápidas y auditables (Brier score de 0,050) sin depender de servicios externos.
- Moderación y triaje de contenido estructurado: el modelo puede clasificar estados de workflow con preguntas tipadas sobre categorías de riesgo, aprovechando su calibración para umbrales de decisión ajustables.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Modelo | Tipo | Accuracy | Soft Acc | Brier score | ECE | Score MAE | Within 1 level | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (fine-tuned) | fine-tuned | 0,772 | 0,569 | 0,050 | 0,142 | 0,211 | 0,996 | 20,4 ms | 0,00 $ (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 $ (API) |
| ModernBERT-base (149M) | especialista | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 $ |
| Teacher Self-Agreement | techo | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 millones de parámetros, una estimación razonable en fp16 es de aproximadamente 0,85 GB de pesos, más overhead de activaciones.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño de 421 millones de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: la model card indica la librería `transformers` y el paquete `laya` (`pip install laya`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 de 20,4 ms por caso reportada por el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy | Brier score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laya (fine-tuned) | 421M | no disponible | 0,772 | 0,050 | Apache 2.0 | HuggingFace (autoalojado) |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0,727 | 0,148 | no disponible | API |
| ModernBERT-base | 149M | no disponible | 0,646 | 0,119 | no disponible | HuggingFace |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- El modelo está ajustado específicamente sobre el benchmark LocalLLaMA/typed-decisions; su rendimiento fuera de los cuatro dominios evaluados (observabilidad de agentes, atención al cliente, facturas, seguridad) no está documentado.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni comportamiento en idiomas distintos del evaluado.
- La longitud de contexto no está publicada, lo que impide evaluar su idoneidad para estados de workflow extensos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Laya y sus condiciones no están detallados en la información disponible; conviene revisar la licencia del modelo base antes de producción.
- El ECE de 0,142 indica una calibración mejorable; para umbrales de decisión críticos se recomienda validación adicional sobre datos propios.
- El modelo es un clasificador de decisiones tipadas, no un generador de texto general; no debe emplearse para tareas fuera de su ámbito de clasificación estructurada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xjtuwangzihan/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organización del autor: https://huggingface.co/convaiinnovations
