# tardellirs/duumvir-decider

## Resumen

Duumvir Decider es un adaptador de bajo rango publicado por el usuario tardellirs que empaqueta dos modelos de decisión de 31B en un único conjunto de pesos servible. El modelo principal, MachinePulseAI/karpo-decision-31B, resuelve cada petición; el segundo, PelaAI/KnowLine-31B-Gen2, se consulta únicamente cuando karpo no alcanza un umbral de confianza del 0,9, la petición tiene como máximo 4 preguntas y no supera los 4.000 caracteres, o cuando karpo rechaza la entrada por superar su límite de 32k tokens. Ambos son fine-tunes de Gemma 4 31B, lo que permite servir el segundo modelo sobre los pesos del primero más un adaptador, sin duplicar la copia completa.

El resultado declarado es un modelo de 35,68B parámetros servidos (31,27B de karpo sin modificar más 4,41B de adaptador) que responde a decisiones tipadas en formato System One: elección entre opciones (`choice`), decisión binaria (`noul`) y puntuación (`score`). La innovación técnica es la descomposición de las diferencias de pesos entre ambos fine-tunes mediante SVD ponderada por activaciones, con rangos asignados por ganancia relativa de salida, lo que permite reconstruir KnowLine a partir de karpo leyendo sus tensores en sitio.

Es relevante ahora porque propone una vía para servir cascadas de modelos especializados sin multiplicar el coste de memoria: en lugar de cargar dos checkpoints de 31B, se carga uno y un adaptador de 4,41B. El autor declara una fidelidad del 99,77% de coincidencia en argmax respecto a la cascada original de dos modelos completos, con KL media de 0,00017 sobre 600 peticiones muestreadas. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 31B) con adaptador de bajo rango sobre las 410 capas lineales del decoder |
| Parametros totales | 35,68B servidos (31,27B de karpo + 4,41B de adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens (límite de karpo, citado en la model card) |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecución en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,8 GB; requiere además el checkpoint de karpo y los ficheros no-peso de KnowLine) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 31B, un transformer decoder-only. Sobre ella, el adaptador almacena dos piezas de bajo rango por cada una de las 410 capas lineales del decoder: `B_corr · A_corr ≈ D_karpo`, extraída con SVD ponderada por activaciones (la covarianza de entrada de cada capa pondera el error) y con rangos asignados por ganancia relativa de salida, sumando 3,92B parámetros; y `B_kl · A_kl ≈ D_knowline`, de rango 64 por capa, extraída del mismo modo. El lado KnowLine computa `y = W_karpo·x − B_corr(A_corr·x) + B_kl(A_kl·x)`, leyendo los tensores de karpo en sitio. La norm final de KnowLine, que porta su temperatura, también se almacena en el adaptador. Todo lo que queda fuera de las 410 lineales es bit-idéntico entre ambos modelos y se comparte.

No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO para los modelos base. La cascada aplica una media ponderada de probabilidades con pesos 0,6 karpo / 0,4 KnowLine cuando ambos responden; los umbrales (confianza mínima 0,9, máximo 4 preguntas, máximo 4.000 caracteres) se eligieron sobre muestras de desarrollo y la suite pública se ejecutó una sola vez para medición. La fidelidad declarada es del 99,77% de coincidencia en argmax y KL media de 0,00017 sobre 600 peticiones muestreadas de la suite pública.

## Capacidades

- Clasificación de texto y decisión tipada: produce respuestas de tipo `choice` (selección entre opciones con criterios), `noul` (decisión binaria) y `score` (puntuación).
- Razonamiento y conocimiento: la suite Decision Index 0.3 reporta 65,86 en conocimiento y razonamiento (72,03 bruto).
- Comprensión del lenguaje: 76,96 en el índice (83,93 bruto).
- Recuperación (retrieval): 76,88 en el índice (81,29 bruto).
- Uso de herramientas: 88,60 en el índice (90,09 bruto), el área con mejor rendimiento declarado.
- Artes: 69,09 en el índice (81,32 bruto).
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin soporte de imágenes: la entrada es únicamente texto.
- Cascada de dos modelos con umbrales de confianza y fallback ante rechazo por longitud.

## Casos de uso

- Clasificación de intenciones en atención al cliente: dado un mensaje y un conjunto de criterios tipados (`choice`), el modelo devuelve la intención más probable; el ejemplo de la model card cubre la detección de solicitudes de reembolso frente a consultas informativas, con contexto suficiente para conversaciones multi-turno dentro de los 32k tokens.
- Enrutamiento de tickets y solicitudes: la salida `choice` permite despachar cada petición a un equipo o cola concreta, y el umbral de confianza de 0,9 activa la consulta a KnowLine en los casos ambiguos, lo que resulta adecuado para pipelines donde el coste de un error de clasificación es alto.
- Moderación y decisión binaria: la salida `noul` sirve para aceptar o rechazar contenido o acciones con un criterio explícito, con la ventaja de que el modelo declara su confianza y la cascada puede derivar los casos dudosos al segundo modelo.
- Puntuación de relevancia o calidad: la salida `score` permite ordenar candidatos (respuestas, documentos, propuestas) sin necesidad de generar texto libre, lo que encaja en sistemas de ranking y filtrado previo.
- Selección de herramientas en agentes: con 88,60 en el área de herramientas, el modelo puede decidir qué función o API invocar a partir de una descripción tipada, integrándose como primer paso de un pipeline de agentes antes de la ejecución real.
- Evaluación automatizada de decisiones: el kit Decision Index permite ejecutar la cascada sobre suites de peticiones y medir el índice, útil para comparar configuraciones de umbrales o versiones del adaptador antes de desplegar.
- Despliegue con restricción de memoria: al requerir una sola copia de los pesos de 31B más 4,41B de adaptador en lugar de dos checkpoints completos, es adecuado para servir la cascada en una GPU de 80 GB sin duplicar el coste de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index y tabla de la sección Results), ejecutados con el kit oficial Decision Index 0.3 sobre una A100 80GB en bf16, una petición a la vez. La métrica `decision_index` figura como no verificada (`verified: false`).

| Area | Indice | Bruto |
|---|---:|---:|
| Conocimiento y razonamiento | 65,86 | 72,03 |
| Comprensión del lenguaje | 76,96 | 83,93 |
| Recuperación | 76,88 | 81,29 |
| Herramientas | 88,60 | 90,09 |
| Artes | 69,09 | 81,32 |
| **Indice global** | **75,42** | 81,19 |

Datos adicionales declarados: 140.620 de 140.620 peticiones respondidas (sin rechazos ni errores); karpo-decision-31B en solitario obtiene 75,05 en el índice público; latencia en A100 80GB en bf16 con mediana de 235 ms, media de 616 ms y p80 de 680 ms. El autor advierte que el índice público no es la puntuación del leaderboard: la puntuación Full proviene de tests privados del mantenedor y se añadirá cuando se publique.

## Requisitos de hardware

- VRAM estimada: una GPU con al menos 80 GB; pico de aproximadamente 78 GB en una A100 80GB en bf16 según la model card.
- GPU recomendadas: A100 80GB (configuración medida por el autor) y, por capacidad, H100 80GB; no se documentan otras.
- GPU de consumo: no cabe en GPU de consumo (RTX 4090 de 24 GB, entre otras) en la configuración documentada; no se proporcionan datos de cuantización para reducir el requisito.
- Opciones de despliegue: el motor propio `duo_engine.py` junto con `merge.py`, sobre `torch`, `transformers` con soporte de Gemma 4 y `safetensors`, más el runtime propio de karpo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Dependencias adicionales: checkpoint de MachinePulseAI/karpo-decision-31B (revisión fijada en `adapter_config.json`) y ficheros no-peso de PelaAI/KnowLine-31B-Gen2 (config, tokenizer, `temperatures.json`, `knowline_server.py`, `knowline_layout.py`); los pesos de KnowLine no se usan.
- Latencia y throughput: mediana de 235 ms, media de 616 ms y p80 de 680 ms por petición en A100 80GB en bf16, una petición a la vez. No se declara throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros servidos | Contexto | Indice Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Duumvir Decider | 35,68B (31,27B + 4,41B adaptador) | 32k | 75,42 | Apache 2.0 | Hugging Face (adaptador + motor propio) |
| karpo-decision-31B (solo) | 31,27B | 32k | 75,05 | no disponible en la informacion proporcionada | Hugging Face |
| KnowLine-31B-Gen2 (solo) | 31B | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Cascada original karpo + KnowLine completo | ~62B en dos checkpoints | 32k | no disponible (99,77% de coincidencia en argmax con Duumvir Decider) | no disponible en la informacion proporcionada | requiere dos checkpoints completos |

No se dispone de datos de benchmarks de modelos comparables de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está construido para decisiones tipadas en inglés; no se declara soporte de castellano ni de otros idiomas.
- Entrada solo de texto: no admite imágenes.
- Contexto limitado a 32k tokens en karpo; las entradas que lo superan provocan el rechazo de karpo y la consulta a KnowLine como fallback.
- La métrica principal (75,42) figura como no verificada (`verified: false`) y procede de una ejecución propia del autor con el kit oficial; el índice público no equivale a la puntuación del leaderboard.
- Los umbrales de la cascada se eligieron sobre muestras de desarrollo y la suite pública se ejecutó una sola vez para medición, sin validación cruzada declarada.
- La fidelidad del 99,77% en argmax y la KL de 0,00017 se midieron sobre 600 peticiones muestreadas, no sobre el conjunto completo.
- El despliegue requiere 80 GB de VRAM en bf16 y un motor propio (`duo_engine.py`), con dependencia del runtime de karpo; no hay soporte documentado para stacks de inferencia estándar.
- La model card original está truncada en la información disponible, por lo que las limitaciones completas declaradas por el autor no pueden reproducirse aquí.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- Uso comercial: permitido por la licencia Apache 2.0 del adaptador, pero sujeto a las licencias de los modelos base (karpo-decision-31B y KnowLine-31B-Gen2), cuyas condiciones no se detallan en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/duumvir-decider
- Dataset con resultados completos del Decision Index: https://huggingface.co/datasets/tardellirs/duumvir-decider-decision-index
- Modelo base principal (karpo-decision-31B): https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo base secundario (KnowLine-31B-Gen2): https://huggingface.co/PelaAI/KnowLine-31B-Gen2
