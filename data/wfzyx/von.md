# wfzyx/von

## Resumen

Von 1.3 es un modelo de decisión no autorregresivo de tipo "System One" desarrollado por wfzyx. A diferencia de los modelos generativos habituales, no produce texto token a token: recibe un estado, una pregunta y un conjunto de opciones descritas, y en un único paso bidireccional por el encoder devuelve una distribución de probabilidad sobre esas opciones. Resuelve tareas de clasificación cero disparo, juicio de condiciones (tipo NLI) y puntuación de niveles, con un coste computacional independiente del número de opciones.

El modelo se construye sobre el backbone ModernBERT-large (395M parámetros totales, 1,5 GB en fp32) y añade una cabeza de puntuación denominada Option-Marker. Soporta una longitud de contexto de 8192 tokens y está entrenado exclusivamente en inglés. Su licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque el autor ha archivado el modelo: los pesos no se actualizarán y la recomendación oficial es migrar a LiquidAI/d1-omni-600M para proyectos nuevos. Aun así, los pesos y el SDK (von-sdk) siguen disponibles para usuarios existentes, y su enfoque de decisión calibrada en un solo paso lo convierte en una alternativa interesante para pipelines de enrutamiento y triaje de baja latencia donde no se necesita generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con cabeza de puntuación Option-Marker |
| Parametros totales | 394.781.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp32; el SDK no documenta cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone) y .pt (cabeza Option-Marker); calibración en JSON |

## Arquitectura y entrenamiento

La arquitectura empaqueta en una única secuencia el estado, la pregunta y todas las opciones candidatas. Cada opción recibe un marcador `[MASK]` cuyo estado oculto final se puntúa mediante una cabeza pequeña; un softmax sobre los logits de los marcadores produce la distribución de respuesta. El coste es un solo paso de encoder independientemente del número de opciones. Desde la versión 1.2 incorpora puntuación invariante al orden: los tokens de cada opción solo atienden a la premisa compartida y a sus propios tokens, y los position ids de cada opción reinician al final de la premisa. Según la model card, en JevBench hard (111 ítems × 4 ordenaciones) la versión 1.1 cambiaba el 49,5 % de las respuestas al permutar opciones, mientras que la 1.2 no cambia ninguna.

El backbone ModernBERT-large se preentrenó con 2 billones de tokens de web general, texto técnico y código. El ajuste fino usa una pérdida listwise de entropía cruzada softmax más un término Brier sobre los marcadores de opción, con enmascaramiento de opciones independientes y tokenización con separación de dígitos, sobre un corpus de decisión equilibrado de aproximadamente 290.000 ítems. Después se continúa el entrenamiento con conjuntos sintéticos de dos saltos y numéricos. La composición del corpus es: flujos operativos y empresariales (~25 %), seguridad, DevOps y cumplimiento (~20 %), seguridad y moderación de políticas (~15 %), semántica lingüística y de contenido (~15 %), triaje y servicios (~10 %) y anclaje de razonamiento adversarial con ANLI R1–3 y WANLI (~15 %). Ningún ítem de JevBench, público o sellado, se usa para entrenamiento por gradiente.

La calibración se basa en una temperatura condicionada por la entrada almacenada en `marker_calibration.json`: T = bias + w_H·H_norm + w_len·log10(state_tokens)/4 + w_K·(K/8), acotada a [0,3, 12], donde H_norm es la entropía normalizada de la distribución cruda. La temperatura es monótona, por lo que no altera la respuesta, solo la confianza declarada. Para Noul (juicio binario) se aplica además una regla de banda que fuerza a que toda decisión sí/no quede fuera de la banda de abstención 0,2–0,8.

## Capacidades

- Clasificación cero disparo sobre un conjunto arbitrario de opciones descritas, con una sola pasada de encoder.
- Juicio de condiciones (Noul): evalúa si una condición se cumple o es falsa sobre descripciones de dos opciones, o sobre criterios proporcionados por el llamador.
- Puntuación de niveles (Score): distribución sobre descripciones de nivel con cálculo de la esperanza.
- Puntuación invariante al orden de las opciones.
- Confianza calibrada por entrada, con posibilidad de reajuste sobre etiquetas propias mediante `von calibrate labels.jsonl`.
- Razonamiento adversarial básico anclado con ANLI y WANLI.
- No soporta generación de texto, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje de tickets de TI: el modelo clasifica una incidencia en categorías predefinidas (red, acceso, hardware, facturación) en una sola pasada, lo que permite enrutar miles de tickets por segundo sin generación de texto.
- Enrutamiento de intención en atención al cliente: con las intenciones descritas como opciones, asigna cada mensaje entrante al departamento adecuado; la ventana de 8192 tokens permite incluir historial de conversación como parte del estado.
- Detección de fugas de secretos y filtrado de inyección SQL en CI/CD: evalúa si un fragmento de código o configuración cumple una condición de riesgo, con la regla de banda que evita respuestas ambiguas en la zona de abstención.
- Moderación de políticas publicitarias y de vivienda: juicio binario o multinivel sobre si un anuncio cumple una política descrita, útil para prefiltrar antes de la revisión humana.
- Verificación de límites de gastos de viaje y políticas de reembolso: puntuación de nivel sobre descripciones de tramos, con la esperanza de la distribución como valor continuo.
- Clasificación de emoción, formalidad o nivel de lectura: tareas lingüísticas sobre textos donde se necesita una etiqueta calibrada y no una generación libre.
- Triaje de urgencia de síntomas o veterinaria: elección entre niveles de urgencia descritos, con confianza calibrada para decidir si se deriva a revisión humana.

## Benchmarks y rendimiento

Resultados de competencia corregida por azar (100 = perfecto, 0 = azar) para los pesos de Von 1.2 en JevBench v1.5.1, por tipo y nivel de dificultad. Los ítems sellados nunca son vistos por ningún participante.

| Tipo | Mitad | Easy | Standard | Judge | Hard |
|---|---|---:|---:|---:|---:|
| Choice | open | 91,0 | 37,6 | 36,7 | 17,0 |
| Choice | sealed | 50,2 | 30,7 | 7,2 | 11,3 |
| Score | open | no disponible | no disponible | no disponible | no disponible |
| Score | sealed | no disponible | no disponible | no disponible | no disponible |

La model card solo incluye la tabla completa de Choice; los datos de Score aparecen truncados en la información disponible. En el eje de calibración, la puntuación es 77,4 in-sample y 67,6 en partición mitad-mitad sobre JevBench público. En una sonda de agente de código con 38 etiquetas, una temperatura escalar T = 2,15 redujo el ECE de 0,21 a 0,11.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp32 para los pesos; en la práctica, entre 2 y 4 GB con activaciones para secuencias de contexto largo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, RTX 4090, RTX 3090 y RTX 3060 son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: el SDK oficial `von-sdk` (pip install "von-sdk>=1.3.7"); al ser un modelo de Hugging Face con safetensors, también puede cargarse con transformers. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un solo paso de encoder de 395M parámetros, la latencia esperada es baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Von 1.3 | 395M | 8192 | Decision model no autorregresivo | Apache-2.0 | Archivado |
| LiquidAI/d1-omni-600M | 600M | no disponible | Decision model calibrado, admite imágenes | no disponible | Activo (recomendado por el autor) |
| answerdotai/ModernBERT-large | 395M | 8192 | Encoder base | Apache-2.0 | Activo (modelo base) |

La model card recomienda explícitamente LiquidAI/d1-omni-600M como sustituto para proyectos nuevos, por ser un modelo de decisión System One calibrado que además procesa imágenes. No se dispone de datos de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Modelo archivado: no recibirá actualizaciones ni correcciones; el autor recomienda migrar a LiquidAI/d1-omni-600M.
- Solo inglés: no soporta otros idiomas de forma nativa.
- La calibración incluida es in-sample sobre JevBench público y no se traslada a otras distribuciones; fuera de dominio el modelo puede estar confiadamente equivocado. Es necesario reajustar con `von calibrate labels.jsonl` sobre etiquetas propias.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en el sentido de asignar alta confianza a opciones incorrectas cuando la entrada se aleja de la distribución de entrenamiento.
- El rendimiento en ítems sellados de dificultad judge y hard es bajo (7,2 y 11,3 de competencia corregida), lo que limita su uso en decisiones complejas.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el estado archivado implica que no habrá soporte del autor.
- Es imprescindible conservar `marker_calibration.json`: el SDK lee el flag `independent_options: true` para activar el modo de atención invariante al orden con el que se entrenaron los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wfzyx/von
- Repositorio del SDK y CLI: https://github.com/wfzyx/von
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Alternativa recomendada: https://huggingface.co/LiquidAI/d1-omni-600M
