# vennyvirtuoso/faithjev-rag-8k

## Resumen

faithjev-rag-8k es un modelo de clasificación de texto construido sobre `answerdotai/ModernBERT-base`, un encoder bidireccional de 149 millones de parámetros. Lo publica el usuario `vennyvirtuoso` en Hugging Face y se presenta como un "System One Decision Model": un modelo de decisión tipada que, dado un contexto y una pregunta con opciones, selecciona la opción más probable en lugar de generar texto libre. Está etiquetado como guardrail para RAG (`rag-guardrail`) y modelo de decisión de coste cero en tokens (`zero-token-decision`), lo que sugiere su uso como filtro rápido y determinista en pipelines de recuperación aumentada.

La propuesta de valor es la latencia: al ser un encoder y no un modelo generativo, procesa decisiones en milisegundos (el autor declara 17,25 ms por verificación en edge y 747,8 verificaciones/s en GPU por lotes) con una ventana de contexto nativa de 8.192 tokens. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y el repositorio ocupa 0,3 GB.

Conviene tratar con cautela las cifras de la model card: declara el 100 % de exactitud macro en el test held-out, ECE de 0,0000 y una mejora de +66,67 puntos sobre la línea base. Estos resultados, sin información sobre el tamaño ni la composición del conjunto de evaluación, no son interpretables como indicador de rendimiento en producción, y el propio modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con FlashAttention-2 |
| Parametros totales | 149.607.940 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un encoder de 149M es viable en fp16, int8 e int4 mediante herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional con atención FlashAttention-2 y soporte nativo de secuencias de hasta 8.192 tokens. Sobre esa base se ha realizado un fine-tuning como clasificador de secuencias (`AutoModelForSequenceClassification`) para la tarea que el autor denomina "System One Decision Model", con decisiones tipadas: elección entre opciones (choice), booleano (boolean noul) y valoración discreta (discrete rating). El prompt de inferencia sigue un formato denominado SemIf, en el que el contexto, la pregunta y las opciones etiquetadas (A, B, C...) se concatenan y el modelo devuelve logits sobre las opciones válidas.

El entrenamiento se declara sobre el dataset FaithDial, complementado según la model card con HaluEval y benchmarks de decisión tipada multidominio (la descripción del dataset queda truncada en la información disponible). No se especifican el número de tokens de entrenamiento, la composición exacta del corpus, ni si hubo RLHF o DPO; en un encoder de clasificación estos pasos no aplican del modo habitual. El autor menciona calibración mediante temperature scaling con T = 1,15 en el ejemplo de uso, aunque no documenta el procedimiento de calibración ni el conjunto empleado para ajustarla.

## Capacidades

- Clasificación de texto con decisiones tipadas: selección entre un conjunto cerrado de opciones, respuestas booleanas y valoraciones discretas.
- Guardrail para RAG: el autor la presenta como verificación de fidelidad de la recuperación y detección de alucinaciones en el contexto recuperado.
- Detección de contenido no soportado en el contexto ("noul unsupported"), orientada a descartar respuestas no fundamentadas.
- Salida de distribución de probabilidad calibrada sobre las opciones, con temperatura de escalado configurable.
- Contexto largo de 8.192 tokens, adecuado para concatenar documento recuperado y pregunta en una sola pasada.
- Inferencia de baja latencia apta para despliegue en edge y por lotes.
- Integración con `transformers`, `sentence-transformers` y `peft` según la model card.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; es un modelo discriminativo, no generativo.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y una lista cerrada de equipos (facturación, soporte técnico, ventas, seguridad), el modelo devuelve la opción más probable con su confianza. El contexto de 8.192 tokens permite incluir el historial completo del ticket sin truncar.
- Guardrail de fidelidad en RAG: tras recuperar pasajes, se formula una decisión booleana sobre si la respuesta candidata está respaldada por el contexto recuperado; el modelo actúa como filtro barato antes de servir la respuesta al usuario.
- Detección de alucinaciones en pipelines de generación: clasificar pares (contexto, afirmación) como soportados o no soportados, con umbral de confianza calibrado para derivar los casos dudosos a revisión humana.
- Clasificación de intenciones en asistentes conversacionales: mapear cada turno del usuario a una de N intenciones predefinidas con latencia de milisegundos, apto para sistemas de voz o chat en tiempo real.
- Moderación y triaje de contenido: decisión booleana o multietiqueta sobre categorías de política, con la ventaja de que el coste por verificación es muy inferior al de un LLM generativo.
- Etiquetado y anotación a gran escala: procesar lotes de miles de pares contexto-pregunta con 747,8 verificaciones/s en GPU para preetiquetar corpus antes de la revisión humana.
- Validación en CI/CD de respuestas de un LLM: ejecutar el modelo como test automático que marque regresiones de fidelidad cuando cambie el prompt o el índice de recuperación.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor. No se ha verificado de forma independiente y el conjunto de evaluación no está descrito en detalle.

| Metrica | Fine-tuned | Baseline zero-shot |
|---|---|---|
| Exactitud macro held-out | 100,00 % | 33,33 % |
| Macro-F1 held-out | 1,0000 | 0,3333 |
| ECE (error de calibración esperado) | 0,0000 | no disponible |
| Recuperación fiel (test) | 100,00 % | 100,00 % |
| Detección de alucinación (test) | 100,00 % | 0,00 % |
| Noul unsupported (test) | 100,00 % | 0,00 % |
| Throughput por lotes (GPU) | 747,8 verificaciones/s | no disponible |
| Latencia por verificación (edge) | 17,25 ms | no disponible |

Un ECE de 0,0000 y una exactitud del 100 % en todas las subtareas son resultados atípicos que sugieren un conjunto de test pequeño, poco diverso o con posible solapamiento con el entrenamiento, pese a que el autor afirma haber usado splits disjuntos por grupo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 0,3 GB de pesos más activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM en int8: en torno a 0,15 GB de pesos; en int4, menos de 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para máximo throughput, A100, H100 o L40S. Una RTX 4090 o RTX 3090 ofrece margen sobrado para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB (GTX 1650, RTX 3050, RTX 4060 y superiores), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `sentence-transformers`, `peft`, y servidores de inferencia estándar para encoders (TGI, vLLM en modo encoder, ONNX Runtime, TorchServe). No se documenta soporte específico de llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput declarados por el autor: 17,25 ms por verificación en edge y 747,8 verificaciones/s en GPU por lotes. No se especifica el hardware empleado en la medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faithjev-rag-8k | 149M | 8.192 | Clasificación / decisión tipada | Apache 2.0 | Hugging Face, 0 descargas |
| answerdotai/ModernBERT-base | 149M | 8.192 | Encoder base, clasificación y retrieval | Apache 2.0 | Hugging Face, ampliamente usado |
| BERT-base / RoBERTa-base | 110M / 125M | 512 | Clasificación de texto | Apache 2.0 / MIT | Hugging Face, muy extendido |
| DeBERTa-v3-base | 184M | 512 | Clasificación y NLI | MIT | Hugging Face, muy extendido |

Frente a ModernBERT-base, la diferencia es el fine-tuning específico para decisiones tipadas y guardrails de RAG, a costa de perder generalidad. Frente a BERT y RoBERTa, la ventaja principal es el contexto de 8.192 tokens y la atención con FlashAttention-2; frente a DeBERTa-v3, menor tamaño pero contexto mucho mayor. No hay datos públicos que permitan comparar rendimiento real en tareas de fidelidad RAG.

## Limitaciones y advertencias

- Los resultados de la model card (100 % de exactitud, ECE 0,0000) no son verosímiles en un escenario real y deben validarse de forma independiente antes de cualquier uso en producción.
- El modelo tiene 0 descargas y 0 likes; no hay evidencia de uso por terceros ni de validación externa.
- No se documentan los idiomas soportados. Al derivar de ModernBERT-base, el soporte multilingüe es limitado; el uso principal esperable es en inglés.
- Es un modelo discriminativo: no genera texto, no soporta tool calling ni razonamiento multi-paso. No debe emplearse como sustituto de un LLM.
- El conjunto de entrenamiento declarado (FaithDial, HaluEval, benchmarks multidominio) está descrito de forma incompleta, lo que impide evaluar el riesgo de sobreajuste a dominios concretos.
- Riesgo de sesgo heredado de ModernBERT-base y de FaithDial, no evaluado por el autor.
- La calibración con temperatura T = 1,15 aparece solo en el ejemplo de código; no se documenta el procedimiento ni el conjunto de calibración, por lo que las probabilidades pueden no estar bien calibradas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia de los datos de entrenamiento (FaithDial) por si impone condiciones sobre los pesos derivados.
- El formato de prompt SemIf es específico del autor; desviarse de él puede degradar la calidad de las decisiones sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/faithjev-rag-8k
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset FaithDial (referenciado en la model card): no disponible enlace directo en la información proporcionada
- Paper de ModernBERT: no disponible enlace en la información proporcionada
- Repositorio o demo adicional: no disponible
