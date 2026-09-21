# Utiric/arbiter-general

## Resumen

ARBITER-general es un ajuste fino del modelo base Qwen/Qwen3-0.6B-Base publicado por el usuario Utiric en HuggingFace. No es un modelo generativo al uso: se ha reentrenado como una capa de decisión de un solo pase hacia delante (*single-pass decision layer*) que recibe un estado en texto y devuelve decisiones tipadas. Concretamente, responde preguntas estructuradas de tres tipos: `choice` (hasta 52 opciones), `score` (niveles ordenados) y `noul` (sí/no). Nunca genera tokens.

El mecanismo es inusual y merece atención: el prompt se renderiza con etiquetas `<state>` y líneas `(A) opción — descripción`, terminando en la cadena literal `Answer: (`. El modelo ejecuta una única pasada y se leen los logits de la cabeza LM restringidos a los 52 tokens de letra (`A`–`Z`, `a`–`z`) en la posición de ese hueco. Un softmax con temperatura global 1,6 (ajustada a posteriori sobre datos de validación y guardada en `s1_config.json`) convierte esos logits en probabilidades calibradas, y la confianza se define como la diferencia entre la probabilidad top-1 y la top-2. La latencia depende solo de la longitud del prompt (coste de prefill), sin bucle de generación por token.

Es relevante porque propone una alternativa barata y determinista a los patrones habituales de *triage*, moderación y enrutado, en los que hoy se suele invocar un LLM generativo y parsear su salida. Con 596.049.920 parámetros (0,6 B) y licencia Apache-2.0, el coste de inferencia es mínimo. Los idiomas declarados y probados son turco (tr) e inglés (en), y el presupuesto de estado es de 2048 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), reutilizado como clasificador de un solo pase; se leen los logits de las 52 letras en el slot `Answer: (` |
| Parámetros totales | 596.049.920 (≈0,6 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el modelo ajustado; el wrapper aplica un presupuesto de estado de 2048 tokens con truncado 70 % cabeza / 30 % cola |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño de repositorio 1,2 GB) |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Tarea declarada (pipeline) | text-classification |
| Tipos de pregunta | `choice` (hasta 52 opciones), `score` (niveles ordenados), `noul` (sí/no) |
| Temperatura por defecto | 1,6 (valor global, ajustado post-hoc sobre datos de validación) |
| Métrica de confianza | diferencia entre la probabilidad top-1 y la top-2 |
| Empaquetado | sin paquete pip; se copia `arbiter.py` (≈200 líneas, solo `torch` + `transformers`) junto al código |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de 0,6 B de parámetros, y lo reutiliza sin cabeza adicional entrenada desde cero: la señal de clasificación se extrae de las filas de la cabeza LM correspondientes a los tokens de letra. Esto implica que el ajuste fino enseña al modelo a colocar en la posición del slot `Answer: (` un estado oculto cuya proyección sobre el subconjunto de letras del vocabulario refleja la distribución sobre las opciones válidas. Al restringir el softmax a las opciones válidas de cada pregunta, el modelo puede manejar hasta 52 alternativas por pasada.

La model card describe el flujo en cuatro pasos: renderizado del prompt con etiquetas `<state>`, una única pasada hacia delante, softmax restringido sobre las opciones válidas y lectura de la salida según el tipo de pregunta (`noul` devuelve P(sí); `score` devuelve el nivel argmax más la esperanza matemática sobre los niveles). La temperatura es un único valor global de 1,6, ajustado post-hoc sobre datos reservados, y no varía por tarea ni por segmento.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La model card sí menciona que los conjuntos de evaluación reservados (*held-out*) se aislaron mediante deduplicación exacta, lo que indica que la deduplicación formó parte del proceso de preparación de datos. También se menciona un apartado de consistencia ante permutaciones (comprobación de sesgo de posición con el mismo enunciado en tres órdenes distintos de opciones), aunque el texto proporcionado se corta antes de mostrar los resultados.

## Capacidades

- Clasificación de decisión en un solo pase hacia delante, sin generación de tokens: la latencia depende únicamente del prefill del prompt.
- Preguntas de tipo `choice` con hasta 52 opciones, devolviendo la opción elegida, la distribución de probabilidad completa y una puntuación de confianza.
- Preguntas de tipo `score` sobre niveles ordenados, devolviendo el nivel argmax, la esperanza matemática sobre los niveles y la distribución.
- Preguntas de tipo `noul` (sí/no), devolviendo la probabilidad de "sí" junto con la confianza.
- Entrada de estado flexible: una cadena de texto o cualquier objeto serializable a JSON.
- Capacidad multilingüe limitada a turco e inglés, ambos probados explícitamente.
- Presupuesto de estado de 2048 tokens con truncado marcado (70 % de la cabeza y 30 % de la cola del texto).
- Acepta criterios auxiliares en las preguntas de tipo `noul` (`criteria: {true, false}`) para guiar la decisión.
- Devuelve confianza calibrada (brecha top-1 menos top-2) apta para umbrales de escalado.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Triage de soporte al cliente: el propio ejemplo de la model card decide en una sola pasada la intención de un mensaje ("¿quiere un reembolso, saber dónde está el paquete, cancelar o solo saluda?"), si requiere acción inmediata y el nivel de enfado, devolviendo probabilidades para cada decisión.
- Moderación de comunidades: la tarea `moderation_discord` alcanza 0,704 de exactitud con un ECE de 0,084; el modelo está pensado como prefiltro de nivel 1 que escala a revisión humana cuando la confianza es baja.
- Enrutado de contratos y riesgo legal: la tarea `legal_contract_risk` obtiene 0,914 de exactitud con ECE 0,025, por lo que sirve como señal de enrutado hacia revisión legal, nunca como asesoramiento jurídico autónomo.
- Preclasificación en triaje médico: con 0,778 de exactitud en `medical_triage`, puede priorizar colas de mensajes hacia personal clínico, siempre como señal de enrutado y nunca como diagnóstico autónomo.
- Revisión de pull requests en CI/CD: la tarea `code_pr_review` alcanza 1,000 de exactitud en el conjunto reservado, lo que permite etiquetar automáticamente PRs con una sola pasada y coste de prefill, sin generación de texto.
- Análisis de sentimiento multilingüe tr/en: la tarea `multilingual_sentiment` obtiene 0,946 de exactitud con ECE 0,028, adecuada para etiquetar grandes volúmenes de mensajes en turco e inglés.
- Detección de discurso ofensivo en turco: en OffensEval-TR el modelo logra 0,797 en evaluación cero disparo, por encima de la línea base aleatoria de 0,50.
- Análisis de conversaciones multi-turno: `dialogue_turn_taking` alcanza 0,992 de exactitud con ECE 0,014, útil para decidir a quién corresponde el siguiente turno en un diálogo.
- Detección de ironía y sarcasmo con supervisión: con 0,620 de exactitud es el segmento más ruidoso; la model card desaconseja su uso aislado y solo lo contempla como señal combinada con otros indicadores.

## Benchmarks y rendimiento

Evaluación reservada (*held-out*), 8 tareas × 500 ejemplos, temperatura 1,6. Macro de 0,8438 frente a 0,2958 de azar. ECE global 0,063; Brier 0,220.

| Segmento | Exactitud | ECE | Nota del autor |
|---|---|---|---|
| code_pr_review | 1,000 | 0,053 | |
| customer_action | 0,796 | 0,073 | punto más débil, en trabajo activo |
| dialogue_turn_taking | 0,992 | 0,014 | |
| irony_sarcasm | 0,620 | 0,117 | segmento ruidoso, no usar aislado |
| legal_contract_risk | 0,914 | 0,025 | señal de enrutado, no asesoramiento legal |
| medical_triage | 0,778 | 0,112 | enrutado, nunca diagnóstico autónomo |
| moderation_discord | 0,704 | 0,084 | prefiltro de nivel 1, escalar con baja confianza |
| multilingual_sentiment | 0,946 | 0,028 | |
| macro | 0,8438 | 0,063 | Brier 0,220 |

Evaluación pública cero disparo (puntuación por logits del slot, sin generación):

| Benchmark (split, n) | ARBITER | Azar / Mayoría |
|---|---|---|
| Belebele tur_Latn (900) / eng_Latn (900) | 0,284 / 0,340 | 0,25 / 0,28 |
| MMLU, media de 6 subconjuntos (1.425) | 0,373 | 0,25 / 0,32 |
| Banking77, muestra de 500 | 0,035 | 0,013 |
| OffensEval-TR (3.528) | 0,797 | 0,50 / 0,80 |
| TweetEval offensive+hate (3.830) | 0,632 | 0,50 / 0,61 |
| XCOPA-TR (500) | 0,486 | 0,50 |
| XNLI-TR (muestra de 1.000) | 0,407 | 0,33 / 0,35 |

La propia model card pide leer estos datos con honestidad: el rendimiento es fuerte en los dominios entrenados y modesto en cero disparo. XCOPA-TR está a nivel de azar y Banking77, aunque triplica el azar en un problema de 77 clases, es bajo en términos absolutos. Los resultados de la prueba de consistencia ante permutaciones de opciones aparecen iniciados en la información proporcionada pero el contenido está cortado, por lo que no se recogen cifras.

## Requisitos de hardware

- La model card no publica cifras de VRAM. Estimación a partir de los 596.049.920 parámetros: ≈1,19 GB en bf16/fp16, ≈2,38 GB en fp32, ≈0,6 GB en int8 y ≈0,3 GB más overhead en 4 bits.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090), en GPUs de portátil con 4 GB o más y en iGPU con memoria unificada.
- También es viable en CPU: por debajo de 1,2 GB en bf16 y con coste dominado por el prefill del prompt.
- No requiere GPU de centro de datos (A100, H100) salvo para servir muchas peticiones concurrentes o estados cercanos al límite de 2048 tokens con lotes grandes.
- El soporte de dispositivo del wrapper es `"cuda"` o `"cpu"`, con detección automática.
- Despliegue: al no ser un modelo generativo y necesitar lectura de logits en una posición concreta, se usa el script `arbiter.py` sobre `transformers`; no se documenta integración con vLLM, TGI, llama.cpp u Ollama, y no existe paquete pip.
- Latencia y throughput: no disponibles como cifras. La model card solo indica que la latencia escala con la longitud del prompt (coste de prefill) al no existir bucle de generación por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Utiric/arbiter-general | 596.049.920 | 2048 tokens de estado (presupuesto del wrapper) | Decisión de un solo pase, salida tipada (choice/score/noul) | Apache-2.0 | HuggingFace, sin paquete pip |
| Qwen/Qwen3-0.6B-Base | 0,6 B | no disponible en la información proporcionada | Generativo decoder-only | Apache-2.0 | HuggingFace |
| BERT-base-multilingual-cased | 110 M (cifra de conocimiento general) | no disponible en la información proporcionada | Clasificación por encoder, cabecera por tarea | Apache-2.0 | HuggingFace |
| XLM-RoBERTa-base | 278 M (cifra de conocimiento general) | no disponible en la información proporcionada | Clasificación por encoder, cabecera por tarea | MIT | HuggingFace |

La comparación directa con clasificadores tipo encoder no puede hacerse con cifras porque no hay resultados de benchmarks comunes entre ambos grupos en la información disponible. La diferencia funcional es clara: ARBITER define las etiquetas en tiempo de inferencia mediante el prompt (hasta 52 opciones, sin reentrenar), mientras que un clasificador BERT o XLM-R requiere una cabecera y un entrenamiento por conjunto de etiquetas. Frente a su modelo base, ARBITER sacrifica la generación de texto a cambio de una decisión estructurada con probabilidades calibradas.

## Limitaciones y advertencias

- Cobertura lingüística reducida a turco e inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo: no puede redactar respuestas, resumir ni mantener conversaciones. Cualquier expectativa de ese tipo queda fuera de su diseño.
- La calibración es desigual: el ECE llega a 0,117 en `irony_sarcasm` y a 0,112 en `medical_triage`, por lo que la confianza no es fiable por igual en todos los dominios.
- `irony_sarcasm` obtiene 0,620 de exactitud y la model card prohíbe explícitamente su uso aislado.
- Riesgo de decisión errónea en `customer_action` (0,796), descrito por el autor como el punto más débil y en trabajo activo.
- En cero disparo el rendimiento cae de forma notable: XCOPA-TR está en 0,486 (nivel de azar) y Banking77 en 0,035 en un problema de 77 clases.
- Los usos médico y legal son señales de enrutado: la model card prohíbe el diagnóstico autónomo y advierte de que `legal_contract_risk` no constituye asesoramiento jurídico.
- La moderación se limita a un prefiltro de nivel 1; se debe escalar a revisión humana cuando la confianza sea baja.
- Límite duro de 52 opciones por pasada y de 2048 tokens de estado, con truncado que descarta la parte central del texto (se conserva 70 % de la cabeza y 30 % de la cola).
- El modelo solo funciona si se respeta el formato exacto del prompt de entrenamiento: la model card advierte de que no se debe reformular la plantilla, y no existe paquete pip, por lo que hay que copiar `arbiter.py` manualmente.
- La temperatura de 1,6 es global y ajustada post-hoc sobre datos reservados; no hay ajuste por tarea.
- Licencia Apache-2.0, que permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B-Base, también Apache-2.0.
- Modelo con muy poca tracción en el momento de redactar esta ficha: 0 descargas y 1 like, sin validación externa independiente.
- Los resultados publicados proceden del propio autor; no se han replicado por terceros según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Utiric/arbiter-general
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Script de inferencia `arbiter.py`, incluido en el repositorio del modelo (≈200 líneas, solo requiere `torch` y `transformers`)
- Configuración de la temperatura y del slot, en `s1_config.json` dentro del repositorio
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos eran direcciones del servicio Outlook, sin relación con el modelo. No se dispone de paper, blog técnico, repositorio adicional ni demo pública.
