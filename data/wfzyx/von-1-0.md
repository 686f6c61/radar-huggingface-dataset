# wfzyx/von-1.0

## Resumen

Von 1.0 (publicado posteriormente como Von 1.3, con pesos idénticos a la versión 1.2) es un modelo de decisión no autorregresivo de tipo "System One" desarrollado por el usuario wfzyx. No genera texto: en una única pasada bidireccional del encoder selecciona una opción entre varias, evalúa si una condición se cumple o estima un nivel. Se construye sobre el backbone de ModernBERT-large (395M parámetros) al que se añade una cabeza de puntuación denominada Option-Marker.

El modelo resuelve tareas de clasificación zero-shot, enrutamiento de intenciones, triaje y verificación de condiciones sin necesidad de decodificación token a token. Su relevancia radica en que ofrece un coste de inferencia constante independiente del número de opciones candidatas (una sola pasada del encoder), junto con una calibración explícita de la confianza y un modo de puntuación invariante al orden de las opciones introducido en la versión 1.2.

El proyecto está archivado: el autor indica que no se actualizará y recomienda migrar a LiquidAI/d1-omni-600M para proyectos nuevos. Los pesos y el SDK `von-sdk` siguen disponibles para usuarios existentes. La licencia es Apache-2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con cabeza Option-Marker; no autorregresivo |
| Parametros totales | 394.781.696 (395M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32, 1,5 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `option_marker.pt` (PyTorch) + `marker_calibration.json` |

## Arquitectura y entrenamiento

El estado, la pregunta y todas las opciones candidatas se empaquetan en una única secuencia. Cada opción recibe un marcador `[MASK]` cuyo estado oculto final se puntúa mediante una cabeza pequeña; un softmax sobre los logits de los marcadores produce la distribución de respuesta. El coste es una sola pasada del encoder con independencia del número de opciones. La modalidad Noul es una elección binaria ("la condición se cumple / es falsa") y la modalidad Score toma la esperanza sobre una distribución de niveles.

Desde la versión 1.2 el modelo emplea puntuación invariante al orden: dentro del encoder, los tokens de una opción solo atienden a la premisa compartida y a los tokens de esa misma opción, y los position ids de cada opción reinician al final de la premisa (la atención de ventana deslizante de ModernBERT se calcula a partir de esos ids). Así, cada logit depende únicamente de (premisa, opción), de modo que permutar las opciones solo permuta los logits. En JevBench hard (111 ítems × 4 ordenaciones), la versión 1.1 cambiaba el 49,5 % de las respuestas y la 1.2 cambia el 0 %.

El backbone se preentrenó con 2 billones de tokens de web general, texto técnico y código. El ajuste fino usa entropía cruzada softmax listwise más un objetivo Brier sobre los marcadores de opción, con enmascaramiento de opciones independientes y tokenización con dígitos separados, sobre un corpus de decisión equilibrado de ~290k ítems, seguido de entrenamiento continuado en conjuntos sintéticos de dos saltos y numéricos. La composición del corpus es aproximadamente: flujos operativos y empresariales 25 % (triaje de tickets de TI, enrutamiento de intención con Banking77, políticas de facturación y reembolso, garantías, excepciones de pedidos); seguridad, DevOps y cumplimiento 20 % (fuga de secretos, inyección SQL, phishing, intención de commit, enrutamiento de guardias, PII); seguridad, políticas y moderación 15 % (política de anuncios, Fair Housing, límites de gastos de viaje, control de ToS); semántica lingüística y de contenido 15 % (formalidad, taxonomía de errores gramaticales, emoción/sentimiento con dair-ai/emotion, nivel de lectura); triaje y servicios 10 % (urgencia de síntomas y veterinaria, enrutamiento 311, alérgenos); y anclaje de razonamiento adversario 15 % (ANLI R1–3 y WANLI como Noul y Choice de 3 vías). Ningún ítem de JevBench, público o sellado, se usa para entrenamiento por gradiente.

La calibración se basa en una temperatura condicionada por la entrada almacenada en `marker_calibration.json`: `T = bias + w_H·H_norm + w_len·log10(state_tokens)/4 + w_K·(K/8)`, acotada a [0,3, 12], donde `H_norm` es la entropía normalizada de la distribución bruta de opciones. La temperatura es monótona, por lo que no altera la respuesta, solo la confianza declarada. Noul aplica además la regla de banda `p' = 0.8 + 0.1·(p−0.5)` (reflejada por debajo de 0,5) para que toda decisión sí/no quede fuera de la banda de abstención 0,2–0,8; `--noul-decision raw` devuelve la posterior calibrada.

## Capacidades

- Clasificación zero-shot de opciones arbitrarias en una sola pasada del encoder.
- Elección entre múltiples opciones (Choice) con distribución softmax sobre marcadores.
- Juicio binario de condiciones (Noul): "la condición se cumple / es falsa".
- Estimación de nivel (Score) con esperanza sobre la distribución de niveles.
- Puntuación invariante al orden de las opciones desde la versión 1.2.
- Confianza calibrada por entrada con temperatura dependiente de la entropía, la longitud del estado y el número de opciones.
- Regla de decisión con banda de abstención para salidas sí/no.
- Recalibración con etiquetas propias mediante `von calibrate labels.jsonl` (pesos congelados, CPU, minutos).
- Capacidades multilingües: solo inglés.
- No soporta generación de texto, tool calling, razonamiento multi-paso autorregresivo, visión ni audio.
- El SDK `von-sdk` incluye CLI y protocolo de comunicación (wire protocol) según el repositorio.

## Casos de uso

- Triaje de tickets de TI: el modelo recibe el estado del ticket y un conjunto de colas o categorías descritas como opciones, y devuelve la categoría más probable en una sola pasada; es adecuado porque el coste no crece con el número de colas y el corpus de entrenamiento incluye triaje de tickets.
- Enrutamiento de intención en atención al cliente: con Banking77 en el corpus, puede mapear el mensaje del usuario a una intención descrita en lenguaje natural, útil para dirigir conversaciones a flujos automatizados sin generar texto.
- Verificación de políticas de facturación, reembolso y garantía: la modalidad Noul responde sí/no sobre si una condición se cumple (por ejemplo, si una devolución es elegible), con banda de abstención para derivar casos dudosos a revisión humana.
- Cribado de seguridad en CI/CD: detección de fuga de secretos, inyección SQL, phishing o PII evaluando el fragmento como estado y las condiciones de política como opciones; encaja en pipelines porque la inferencia es una pasada de encoder de 395M.
- Moderación de contenido y cumplimiento de políticas: clasificación de anuncios, cumplimiento de Fair Housing, límites de gastos de viaje y control de ToS como opciones descritas, con confianza calibrada para umbrales operativos.
- Triaje de urgencia en servicios (síntomas, veterinaria, enrutamiento 311): estimación de nivel (Score) sobre descripciones de urgencia, tomando la esperanza de la distribución.
- Análisis semántico de contenido: formalidad, taxonomía de errores gramaticales, emoción/sentimiento y nivel de lectura como tareas de elección entre niveles descritos.
- Verificación de alérgenos y restricciones dietéticas: juicio binario o multinivel sobre si un plato o producto cumple una restricción descrita.
- Enrutamiento de guardias de operaciones: elección del equipo de guardia a partir del estado del incidente y descripciones de equipos, sin generación de texto.
- Recalibración por dominio: para un conjunto de etiquetas propio (por ejemplo, un probe de agente de código de 38 etiquetas), reajustar la temperatura en CPU; el autor reporta que un escalar T = 2,15 redujo el ECE de 0,21 a 0,11.

## Benchmarks y rendimiento

JevBench v1.5.1 (mitades abierta y sellada), competencia corregida por azar (100 = perfecto, 0 = azar), pesos de Von 1.2:

| Tipo | Mitad | Easy | Standard | Judge | Hard |
|---|---|---:|---:|---:|---:|
| Choice | abierta | 91,0 | 37,6 | 36,7 | 17,0 |
| Choice | sellada | 50,2 | 30,7 | 7,2 | 11,3 |
| Score | abierta | no disponible | no disponible | no disponible | no disponible |
| Score | sellada | no disponible | no disponible | no disponible | no disponible |

La información proporcionada trunca la tabla de Score; no se dispone del resto de filas.

Otros datos reportados:

| Métrica | Resultado |
|---|---|
| Cambio de respuesta al permutar opciones (JevBench hard, 111 ítems × 4 ordenaciones), versión 1.1 | 49,5 % |
| Cambio de respuesta al permutar opciones (JevBench hard), versión 1.2 | 0 % |
| Calibración en JevBench público (eje Calibration), in-sample | 77,4 |
| Calibración en JevBench público, split-half | 67,6 |
| ECE en probe de agente de código (38 etiquetas), antes de recalibrar | 0,21 |
| ECE en probe de agente de código, tras recalibrar con T = 2,15 | 0,11 |

jabr v2, Decision Index y los probes de agente de código son completamente out-of-sample según el autor.

## Requisitos de hardware

- VRAM estimada: los pesos se publican en fp32 con 1,5 GB; en fp16 serían aproximadamente 0,8 GB y en int8 aproximadamente 0,4 GB (estimación a partir del número de parámetros, no confirmada en la información).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 2 GB de VRAM libre debería alojar los pesos en fp32.
- Cabe en GPU consumer: sí, por el tamaño de 395M parámetros; no se especifican modelos concretos.
- Opciones de despliegue: `von-sdk` (pip install "von-sdk>=1.3.7"), con CLI y wire protocol descritos en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que el coste es una sola pasada del encoder con independencia del número de opciones, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Von 1.0 / 1.3 | 395M | 8192 | Clasificación zero-shot, decisión no autorregresiva | Apache-2.0 | Archivado |
| LiquidAI/d1-omni-600M | 600M (según nombre) | no disponible | Modelo de decisión System One calibrado, también con imágenes | no disponible | Recomendado por el autor como sucesor |
| answerdotai/ModernBERT-large | no disponible en la información | no disponible | Encoder base de propósito general | no disponible | Base de Von |

No se dispone de datos de benchmarks de los modelos comparados en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Proyecto archivado: no habrá actualizaciones de pesos; el autor recomienda migrar a LiquidAI/d1-omni-600M.
- Solo inglés; no hay soporte declarado de otros idiomas.
- No genera texto ni soporta tool calling, agentes o razonamiento multi-paso autorregresivo.
- La calibración publicada es in-sample sobre JevBench público y no se traslada a otras distribuciones: fuera de dominio el modelo puede estar equivocado con alta confianza.
- El mapa de calibración (`marker_calibration.json`) es obligatorio; el SDK lee el flag `independent_options: true` para activar el modo de atención invariante al orden con el que se entrenaron los pesos. No debe eliminarse.
- Sesgos conocidos: no documentados en la información proporcionada; el corpus incluye Fair Housing y moderación, pero no se reportan evaluaciones de sesgo.
- Riesgo de alucinación: al ser un clasificador sobre opciones descritas, el riesgo se traslada a la formulación de las opciones y a la confianza calibrada; no se documentan tasas.
- Rendimiento limitado en niveles altos de dificultad: en JevBench sellado, Choice judge alcanza 7,2 y Choice hard 11,3 sobre 100.
- Licencia Apache-2.0: permite uso comercial, pero el estado archivado implica ausencia de soporte y mantenimiento.
- La información de benchmarks está truncada en la tabla de Score; no se dispone de esos resultados.

## Enlaces

- Hugging Face: https://huggingface.co/wfzyx/von-1.0
- Repositorio GitHub: https://github.com/wfzyx/von
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Sucesor recomendado: https://huggingface.co/LiquidAI/d1-omni-600M
