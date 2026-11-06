# syvorai/imperium

## Resumen

Imperium es un modelo de decisión tipada (typed decision model) publicado por Syvorai AI Lab, un laboratorio especializado en modelos que resuelven tareas concretas dentro de infraestructuras propias. El repositorio `syvorai/imperium` contiene un fine-tune con LoRA sobre el modelo base público `vllm-sr/d3` (26B, backbone Qwen3.8-27B con readout de 255 vías para decisiones tipadas), orientado a triaje de tickets de soporte en portugués de Brasil e inglés.

A diferencia de un LLM generativo, el modelo no produce texto: en un único forward pass responde tres preguntas tipadas sobre una conversación de soporte (categoría con 17 clases, decisión con 5 clases y urgencia en escala 0-3), devolviendo una probabilidad por respuesta. Está entrenado con tres especialistas LoRA (urgencia, categoría y decisión) que se sirven ensamblados por tarea.

Su relevancia actual radica en el hallazgo técnico que documenta el autor: el uso de objetivos blandos (soft consensus labels) colapsa el recall de urgencias críticas, mientras que los objetivos one-hot duros lo restauran. Según las métricas publicadas, el modelo supera a un juez LLM frontier en el conjunto gold held-out (0.7618 frente a 0.7127 de overall), lo que lo convierte en candidato a producción para triaje automatizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal; readout de 255 vías para decisiones tipadas (backbone Qwen3.8-27B) |
| Parámetros totales | 26B (modelo base); adaptadores LoRA de ~249M entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Portugués de Brasil (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA sobre base `vllm-sr/d3`) |

## Arquitectura y entrenamiento

El modelo parte de `vllm-sr/d3`, un modelo de 26B con arquitectura híbrida de atención lineal y un cabezal de lectura (readout) de 255 vías en FP32 que emite decisiones tipadas en lugar de tokens de texto. Sobre esta base se aplican tres adaptadores LoRA independientes (r=32, α=64, dropout 0.05, all-linear, ~249M parámetros entrenables cada uno), manteniendo el readout congelado en FP32. El entrenamiento usa AdamW con learning rate 1e-4, scheduler coseno y semilla fija, a aproximadamente 8 segundos por paso con ~8k tokens en una RTX PRO 6000 de 96 GB con gradient checkpointing por capa.

Un aspecto destacable del recetario es que el entrenamiento se realiza atravesando exactamente el mismo camino de forward que la inferencia (mismo constructor de prompt, mismo encoder y mismo readout FP32), con una puerta de fidelidad numérica previa: sin adaptadores, el forward de entrenamiento debe reproducir las predicciones servidas con `max |Δp| ≤ 2.5e-02`, o el proceso se aborta. Los datos son un corpus privado de tickets de soporte explícitamente redactado, con etiquetas one-hot duras para urgencia y etiquetas de consenso para las tareas auxiliares. El conjunto gold de 753 casos y la muestra espejo congelada de 256 casos quedan excluidos del entrenamiento por construcción y verificación por hash.

## Capacidades

- Clasificación tipada de tickets de soporte en un solo forward pass: categoría (17 clases), decisión (5 clases) y urgencia (escala 0-3).
- Salida con probabilidad por respuesta, lo que permite umbrales de confianza y abstención.
- Procesamiento de conversaciones multi-turno de soporte como estado de texto.
- Soporte bilingüe portugués de Brasil e inglés.
- Especialización en detección de urgencias altas y críticas, con recall medido de 0.8972 en la régua de desarrollo.
- Capacidad de definir esquemas tipados arbitrarios sobre un estado de texto, según indica el autor para la arquitectura base.
- No genera texto libre; su salida es una distribución de probabilidad sobre clases predefinidas.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo clasifica en una sola pasada categoría, decisión y urgencia de cada conversación, lo que permite enrutar tickets al equipo adecuado sin coste de generación de texto.
- Priorización de incidencias críticas: con recall de 0.8972 en urgencias altas y críticas y cero falsas alarmas críticas sobre 239 casos de baja o moderada urgencia en el gold, es adecuado para colas de escalado donde un falso positivo tiene coste operativo.
- Enrutamiento por categoría en mesas de ayuda: las 17 clases de categoría permiten dirigir tickets a colas especializadas (facturación, técnico, cuenta, etc.) con una precisión medida de 0.8207 en el gold held-out.
- Sustitución de un juez LLM frontier en pipelines de evaluación: al superar al juez frontier en overall (+4.9 pp) y en categoría (+9.7 pp), puede usarse como clasificador de referencia a menor coste por consulta.
- Automatización de decisiones de resolución: las 5 clases de decisión (precisión 0.7092 en gold) permiten proponer la acción de resolución (reembolso, escalado, cierre, etc.) con probabilidad asociada para revisión humana.
- Detección de conversaciones que requieren intervención humana inmediata: la puntuación de urgencia 0-3 con probabilidad por clase permite fijar umbrales de escalado en tiempo real sobre el flujo de tickets.
- Despliegue en infraestructura propia: al servirse con vLLM mediante el endpoint `systemone` o el runtime `d3` con adaptadores LoRA por tarea, encaja en entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

Régua de desarrollo (1.523 casos reales, 4.569 preguntas; puertas predeclaradas antes de medir):

| Métrica | Puerta | Resultado |
|---|---|---|
| Precisión global | ≥ 0.8327 | 0.8731 |
| Precisión de urgencia | ≥ 0.8438 | 0.8858 |
| Recall urgencia alta+crítica | ≥ 0.7311 | 0.8972 |
| Precisión categoría / decisión | no por debajo del campeón −1 pp | 0.9002 / 0.8332 |
| Familias espejo: global | ≥ 0.8867 | 0.9544 |
| Familias espejo: recall crítico | ≥ 0.7686 | 0.9531 |
| Falsas alarmas críticas en gold (casos low/moderate marcados como críticos) | 0 objetivo | 0 / 239 |

Test gold held-out (753 casos reales, 2.259 preguntas, congelado, juzgado por API frontier externa):

| Modelo | Categoría | Decisión | Urgencia | Global |
|---|---|---|---|---|
| Imperium-Triage (este repo) | 0.8207 | 0.7092 | 0.7556 | 0.7618 |
| juiz-D (juez LLM frontier) | 0.7238 | 0.6892 | 0.7251 | 0.7127 |
| Veredicto Trium (9B) | 0.7012 | 0.6892 | 0.7450 | 0.7118 |
| Veredicto v4 (adaptador de urgencia legacy) | 0.2470 | 0.1633 | 0.7450 | 0.3851 |
| Decisum (322M, ensemble System-1 en producción) | 0.5604 | 0.6375 | 0.6866 | 0.6282 |
| v11e (ensemble de producción, v10+v11c) | 0.5604 | 0.6375 | 0.6866 | 0.6282 |
| v10 (generación previa, solo) | 0.5471 | 0.6441 | 0.6786 | 0.6233 |
| v11c (generación previa, solo) | 0.5564 | 0.6109 | 0.6707 | 0.6127 |
| clef-flash (público, zero-shot) | no disponible | no disponible | no disponible | 0.4772 |

Delta frente a juiz-D: categoría +9.7 pp, decisión +2.0 pp, urgencia +3.1 pp, global +4.9 pp. Delta frente al ensemble de producción v11e: global +13.4 pp. El modelo base d3 sin fine-tune no se evaluó en el gold; en la régua de desarrollo obtuvo 0.6089 global, 0.6257 de precisión de urgencia y 0.8583 de recall alto+crítico.

## Requisitos de hardware

- El modelo base es de 26B parámetros; el repositorio ocupa 3.0 GB, correspondientes a los adaptadores LoRA, no al modelo completo.
- El entrenamiento se realizó en una RTX PRO 6000 de 96 GB con gradient checkpointing por capa, a ~8 s/paso con ~8k tokens.
- Para inferencia del base de 26B se requiere VRAM según cuantización (no publicada); en FP16 serían necesarios del orden de 52 GB solo para pesos, por lo que se recomienda GPU de 80 GB (A100, H100) o superior para precisión completa.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) sin cuantización agresiva, cuyos formatos no están documentados.
- Despliegue mediante vLLM (endpoint `systemone`) o el runtime `d3` con los adaptadores LoRA aplicados por tarea.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (gold) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imperium-Triage (este repo) | 26B + LoRA | no disponible | 0.7618 | Apache 2.0 | Hugging Face |
| Veredicto Trium | 9B | no disponible | 0.7118 | no disponible | Hugging Face (Syvorai) |
| Decisum | 322M (ensemble) | no disponible | 0.6282 | no disponible | Hugging Face (Syvorai) |
| juiz-D (juez frontier) | no disponible | no disponible | 0.7127 | propietaria | API |

## Limitaciones y advertencias

- Modelo especializado en un esquema de decisión concreto (17 categorías, 5 decisiones, urgencia 0-3) para triaje de soporte; fuera de ese dominio su utilidad no está validada.
- No genera texto libre: solo emite distribuciones de probabilidad sobre clases predefinidas.
- Idiomas limitados a portugués de Brasil e inglés; el rendimiento en otras lenguas no está medido.
- Los datos de entrenamiento son privados y no auditables externamente; los benchmarks provienen del propio autor y de su régua interna.
- El conjunto gold se evaluó en una única sesión report-only con un juez externo; no hay replicación independiente publicada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración incorrecta de probabilidades fuera de la distribución de tickets de la plataforma.
- El modelo está marcado como "candidate", no como release estable.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar la licencia del modelo base `vllm-sr/d3`, no indicada en la información disponible.
- Las métricas de falsas alarmas críticas (0/239) corresponden a un conjunto gold concreto; no garantizan el mismo comportamiento en otros flujos de tickets.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/syvorai/imperium
- Modelo base (teacher): https://huggingface.co/vllm-sr/d3
- Organización en Hugging Face: https://huggingface.co/syvorai
- Sitio del laboratorio: https://syvor.ai/en
- Serie técnica del autor (parte 6, sobre objetivos blandos y recall crítico): no disponible como enlace directo en la información proporcionada
