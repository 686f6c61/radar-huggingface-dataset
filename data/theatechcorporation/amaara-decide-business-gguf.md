# theatechcorporation/amaara-decide-business-GGUF

## Resumen

Amaara Decide — Business (v5) es un modelo de decisión especializado, no un modelo conversacional. Dado un estado de negocio y un conjunto de preguntas con nombre, devuelve una distribución de probabilidad puntuada sobre las opciones de cada pregunta, sin generar prosa. Lo desarrolla The A Tech Corporation y se distribuye en formato GGUF para su uso con llama.cpp. Su relevancia radica en que aborda una tarea acotada (clasificación estructurada de decisiones empresariales) con un modelo de tan solo 0,8B parámetros, compitiendo en precisión y calibración con modelos generales mucho mayores.

Técnicamente es un Qwen3.5 de 0,8B (779.717.956 parámetros) afinado contra las distribuciones de etiquetas suaves del conjunto `typed-decisions` en lugar de contra etiquetas argmax. Cubre diez tipos de pregunta (action, disposition, urgency, risk, outcome, needs_review, true_positive, duplicate, matches_order, category) y está pensado para integrarse en pipelines de decisión automatizada donde se necesita una salida probabilística calibrada, no texto libre.

El modelo es relevante ahora porque demuestra que un especialista pequeño, desplegable en hardware modesto, puede superar en su distribución de entrenamiento a modelos de decisión en la nube de 9B y 27B en precisión, ECE y Brier, con latencias de decenas de milisegundos. La model card es inusualmente transparente sobre sus límites, incluido el hecho de que la ventaja es específica de la distribución de `typed-decisions` y no necesariamente generalizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), afinado como modelo de decisión |
| Parametros totales | 779.717.956 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | a-tech-license (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de 0,8B parámetros y se afina como clasificador de decisiones estructuradas. La innovación principal es que el entrenamiento se realiza contra las distribuciones de etiquetas suaves del conjunto `typed-decisions` en lugar de contra etiquetas argmax, lo que permite al modelo aprender la incertidumbre y el desacuerdo entre anotadores en lugar de colapsar a una única respuesta. Esto explica que se evalúe con métricas probabilísticas (ECE, Brier) además de la precisión de coincidencia.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card sí documenta el alcance de las diez preguntas cubiertas y el techo humano de cada una, así como un historial de correcciones en la evaluación que refleja un proceso de medición iterativo y transparente. No se mencionan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de decisiones estructuradas: devuelve una distribución de probabilidad sobre las opciones de cada pregunta de negocio, no texto libre.
- Puntuación calibrada: genera probabilidades con ECE y Brier medidos, adecuadas para umbrales de confianza.
- Diez tipos de pregunta: action, disposition, urgency, risk, outcome, needs_review, true_positive, duplicate, matches_order y category.
- Salida probabilística por opción, útil para agregación y análisis de incertidumbre.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- Capacidades multilingües: solo inglés.
- No tiene modo thinking, visión ni audio.

## Casos de uso

- Triaje de incidencias en soporte: dado un ticket con su estado, el modelo puntúa `urgency`, `category` y `needs_review`, permitiendo enrutar automáticamente según umbrales de probabilidad calibrados.
- Detección de duplicados en sistemas de gestión: usa la pregunta `duplicate` para puntuar si un registro entrante es duplicado de uno existente, con probabilidad explícita para revisión humana en casos límite.
- Priorización de riesgo en operaciones: la pregunta `risk` devuelve una distribución que permite ordenar colas de trabajo por riesgo esperado en lugar de por reglas fijas.
- Clasificación de resultados de negocio: la pregunta `outcome` permite etiquetar resultados con una distribución calibrada, útil para análisis agregado y modelado posterior.
- Validación de coincidencias en conciliación: `matches_order` puntúa si dos registros corresponden al mismo pedido, reduciendo falsos positivos en pipelines financieros.
- Marcado de verdaderos positivos en alertas: `true_positive` permite filtrar alertas de fraude o seguridad con una probabilidad calibrada antes de escalar a analistas.
- Decisión de disposición final: `disposition` y `action` ofrecen distribuciones sobre las acciones a tomar, apropiadas para sistemas de recomendación de decisión con intervención humana.

## Benchmarks y rendimiento

Resultados en el split de retención del conjunto `typed-decisions` (400 filas / 2.000 decisiones):

| Modelo | Precisión | ECE | Brier | Latencia p50 |
|---|---|---|---|---|
| Amaara Decide v5-Q4_K_M (0,8B) | 0,775 | 0,096 | 0,029 | 64 ms |
| clef-flash (9,1B) | 0,699 | 0,135 | 0,034 | 276 ms |
| clef:27b-cloud (27,4B) | 0,713 | 0,122 | 0,034 | 530 ms |

Por tipo de pregunta:

| Tipo | n | v5 (0,8B) | clef-flash 9,1B | clef 27B |
|---|---|---|---|---|
| choice | 600 | 0,745 | 0,707 | 0,643 |
| noul | 600 | 0,845 | 0,818 | 0,845 |
| score | 800 | 0,745 | 0,604 | 0,666 |

Frente al campo público System One (OpenRouter Decisions API):

| Modelo | Acc | ECE | Brier | p50 | McNemar vs v5 |
|---|---|---|---|---|---|
| Amaara Decide v5 (0,8B) | 0,775 | 0,096 | 0,029 | 147 ms | — |
| typesafe/jev-1.14 | 0,750 | 0,089 | 0,032 | 463 ms | p = 0,026 |
| liquid/d1.2 | 0,728 | 0,150 | 0,016 | 612 ms | p < 0,0001 |
| cloudflare/clef-flash | 0,707 | 0,135 | 0,033 | 535 ms | p < 0,0001 |
| inception/mercury-decide | no servido (HTTP 404) | | | | |

La model card advierte explícitamente de que v5 se entrenó en la familia `typed-decisions` y se mide en un split de retención de la misma, mientras que los modelos en la nube no se entrenaron en este benchmark. La conclusión válida es que en esta distribución un especialista de 0,8B supera a modelos generales de decisión, no que sea mejor en decisiones en general. Jev sigue mejor calibrado (ECE 0,089 frente a 0,096) y Liquid d1.2 tiene mejor Brier (0,016 frente a 0,029). La cuantización Q4_K_M no muestra coste medible frente a Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16, 803 MB en Q8_0, 623 MB en Q6_K, 570 MB en Q5_K_M y 520 MB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer moderna; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y superiores, así como en Apple Silicon y CPU.
- Cabe en GPU consumer sin problema; incluso en CPU la latencia es viable para clasificación por lotes.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python); no se mencionan vLLM ni TGI.
- Latencia: 64 ms p50 en Q4_K_M según la model card; 147 ms p50 en la comparativa con la API pública. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (benchmark v5) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amaara Decide v5 | 0,8B | no disponible | 0,775 | 0,096 | a-tech-license | GGUF en HF |
| typesafe/jev-1.14 | no disponible | no disponible | 0,750 | 0,089 | no disponible | API OpenRouter |
| liquid/d1.2 | no disponible | no disponible | 0,728 | 0,150 | no disponible | API OpenRouter |
| cloudflare/clef-flash | 9,1B | no disponible | 0,707 | 0,135 | no disponible | API OpenRouter |

La comparativa se limita al benchmark propio del autor; no hay datos de contexto ni de licencia de los modelos alternativos en la información disponible.

## Limitaciones y advertencias

- No es un asistente general: no responde preguntas en prosa ni mantiene conversaciones.
- La ventaja medida es específica de la distribución `typed-decisions`; en un conjunto fuera de distribución la brecha debería estrecharse o invertirse, según advierte el propio autor.
- El techo de precisión está limitado por el desacuerdo entre anotadores: `action` tiene solo 47,5% de acuerdo humano, por lo que ninguna métrica de exactitud puede acercarse a 1,0.
- Jev está mejor calibrado (ECE 0,089 frente a 0,096) y Liquid d1.2 tiene mejor Brier (0,016 frente a 0,029).
- Solo soporta inglés.
- Licencia `a-tech-license` (other): es necesario revisar los términos del archivo LICENSE antes de uso comercial; no se detallan restricciones en la información disponible.
- Riesgo de alucinación no aplicable en el sentido conversacional, pero sí de sobreconfianza en las distribuciones si se usa fuera de su dominio.
- La model card documenta dos correcciones previas en las métricas publicadas; conviene verificar cifras frente a versiones anteriores.
- No hay información sobre sesgos demográficos o de dominio.

## Enlaces

- Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-business-GGUF
- Modelo base: https://huggingface.co/theatechcorporation/amaara-decide-business
- Licencia: https://huggingface.co/theatechcorporation/amaara-decide-business-GGUF/blob/main/LICENSE
- Comunidad del autor: https://www.skool.com/open-source-ai-builders-club/about
- Dataset de referencia: https://huggingface.co/datasets (familia `typed-decisions`, enlace exacto no disponible)
