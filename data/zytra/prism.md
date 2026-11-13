# Zytra/prism

## Resumen

Zytra Prism es un modelo guardián de aproximadamente 8.000 millones de parámetros desarrollado por Zytra Technologies a partir de un ajuste fino de IBM Granite Guardian 3.3 8B. Su función no es conversar, sino evaluar: recibe un prompt de entrada o una respuesta de salida de una aplicación basada en LLM y emite un veredicto binario de riesgo (`yes`/`no`), opcionalmente acompañado de razonamiento explícito. Cubre tres áreas de control: daño y seguridad (sesgo social, jailbreak, violencia, contenido sexual, comportamiento poco ético, evasividad), calidad de RAG (relevancia del contexto, groundedness, relevancia de la respuesta) y comportamiento agéntico (corrección de llamadas a herramientas).

Se trata de un transformer decoder-only de la familia Granite (`GraniteForCausalLM`) con 40 capas, dimensión oculta de 4096, 32 cabezas de atención y 8 cabezas clave-valor (GQA), empaquetado en 4 shards `safetensors` en `bfloat16` y con una ventana de contexto de 131.072 tokens. La relevancia actual del modelo reside en que unifica en un único punto de control tareas que normalmente exigen varios clasificadores especializados, y lo hace con licencia Apache 2.0, lo que facilita su integración en pipelines comerciales de moderación, evaluación de RAG y supervisión de agentes.

El modelo está pensado exclusivamente para puntuar contenido a través de su plantilla de chat con `guardian_config`; no es un modelo de propósito general. La documentación insiste en tratarlo como una salvaguarda más, no como la única, y en validar su precisión sobre datos propios antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GraniteForCausalLM`), 40 capas, hidden size 4096, 32 cabezas de atención, 8 cabezas KV (GQA) |
| Parametros totales | 8.170.864.640 (≈8,17 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Peso original en `bfloat16`; no se listan cuantizaciones oficiales publicadas (no disponible) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (4 shards, `bfloat16`), repo de 16,3 GB |
| Modelo base | ibm-granite/granite-guardian-3.3-8b |
| Pipeline | text-generation (uso real: clasificación binaria con veredicto) |
| Librería | transformers (compatible también con vLLM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Granite: 40 capas, dimensión oculta de 4096, 32 cabezas de atención con 8 cabezas clave-valor (GQA, ratio 4:1), pesos en `bfloat16`. El modelo hereda el entrenamiento de Granite Guardian 3.3 8B de IBM, que a su vez parte de la familia Granite; Zytra ha realizado un ajuste fino posterior (finetune) sobre esa base para adaptar la interfaz de evaluación, manteniendo el formato de chat con `guardian_config` y los tokens de veredicto `<score> yes </score>` / `<score> no </score>`.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO. La innovación funcional destacable es el doble modo de inferencia: modo no-thinking (`think=False`), que devuelve solo el veredicto, y modo thinking (`think=True`), que emite primero el razonamiento dentro de ` thinking … ` y después la puntuación, lo que permite auditar por qué el modelo marcó un contenido como riesgoso. Adicionalmente, el soporte de `custom_criteria` permite definir criterios ad hoc por llamada sin reentrenar, y el soporte de `documents` en la plantilla de chat habilita la evaluación de groundedness en RAG.

## Capacidades

- Detección de daño general (`harm`) y categorías específicas: sesgo social (`social_bias`), jailbreak (`jailbreak`), violencia (`violence`), blasfemia (`profanity`), contenido sexual (`sexual_content`), comportamiento poco ético (`unethical_behavior`) y compromiso con peticiones dañinas (`harm_engagement`).
- Detección de evasividad (`evasiveness`): identifica respuestas que eluden la pregunta sin motivo justificado.
- Evaluación de calidad de RAG: `context_relevance` (el contexto recuperado aporta o no), `groundedness` (las afirmaciones están respaldadas por el contexto) y `answer_relevance` (la respuesta aborda la entrada del usuario).
- Supervisión agéntica: `function_call` detecta llamadas a herramientas con errores de sintaxis o de significado respecto a la consulta y a las herramientas disponibles.
- Criterios personalizados mediante `custom_criteria` (por ejemplo, detección de datos personales sensibles en un prompt).
- Modo de razonamiento explícito (`think=True`) con traza en `…` para auditoría y depuración de veredictos.
- Salida estructurada parseable: veredicto dentro de `<score>…</score>`, apto para integrarse en lógica de enrutado o bloqueo.
- Capacidad multilingüe: limitada al inglés según la model card; no se declaran otros idiomas.

## Casos de uso

- Moderación de prompts de entrada en asistentes conversacionales: antes de enviar la consulta al LLM principal, se invoca Prism con `criteria_id="jailbreak"` y `criteria_id="harm"`; si el veredicto es `yes`, se bloquea o se redirige la petición. La ventana de 131.072 tokens permite evaluar conversaciones multi-turno completas sin truncar contexto.
- Moderación de respuestas generadas: se puntúa la salida del LLM con `criteria_id="harm"` o `criteria_id="violence"` antes de mostrarla al usuario, usando `think=False` para minimizar latencia en el camino crítico.
- Control de calidad de pipelines RAG: con `criteria_id="groundedness"` y el bloque `documents`, se verifica que la respuesta generada esté respaldada por el contexto recuperado, lo que permite descartar o marcar respuestas alucinadas antes de servirlas.
- Evaluación de recuperación: con `criteria_id="context_relevance"` se comprueba si los documentos devueltos por el retriever resultan útiles para la pregunta, alimentando métricas de calidad del índice o del re-ranker.
- Supervisión de agentes con tool calling: con `criteria_id="function_call"` se validan las llamadas a herramientas generadas por un agente antes de ejecutarlas, reduciendo errores de argumentos o de selección de herramienta en producción.
- Cumplimiento y gobernanza de IA: uso de `custom_criteria` para definir políticas internas (por ejemplo, detección de datos personales o de información confidencial en prompts) y generar trazas auditables con `think=True` para revisión humana o registro regulatorio.
- Evaluación offline de conjuntos de datos: puntuar lotes de pares prompt/respuesta para construir métricas de seguridad y calidad antes de un despliegue, aprovechando la compatibilidad con vLLM para procesar grandes volúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en `bfloat16` los pesos de 8,17 B ocupan aproximadamente 16,3 GB, por lo que se necesitan al menos 20-24 GB de VRAM para dejar margen a la caché KV y al contexto. En cuantización de 8 bits rondaría los 8-9 GB, y en 4 bits unos 5-6 GB, aunque el autor no publica checkpoints cuantizados oficiales.
- La caché KV crece con el contexto: a 131.072 tokens con 40 capas y 8 cabezas KV, el consumo es considerable; conviene limitar `max_model_len` en vLLM según el caso de uso.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para `bfloat16` con contextos largos; RTX 4090 (24 GB) es viable en `bfloat16` con contexto moderado o mediante cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización o limitando la longitud de contexto; en GPUs de 16 GB solo con cuantización agresiva (4 bits).
- Opciones de despliegue: vLLM (recomendado por el autor, con `tensor_parallel_size=1`), `transformers`; llama.cpp/Ollama no están documentados por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el uso de `think=False` reduce los tokens generados y, por tanto, la latencia frente al modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zytra Prism | ≈8,17 B | 131.072 | Guardián multi-criterio (daño, RAG, agéntico) | Apache 2.0 | Hugging Face (`Zytra/prism`) |
| IBM Granite Guardian 3.3 8B | ≈8 B | 131.072 | Guardián de seguridad y RAG (modelo base) | Apache 2.0 | Hugging Face (`ibm-granite/granite-guardian-3.3-8b`) |
| Llama Guard 3 8B | 8 B | 131.072 | Clasificación de seguridad de prompts y respuestas | Llama 3 Community License | Hugging Face (Meta) |
| ShieldGemma 9B | 9 B | 8.192 | Clasificación de seguridad | Gemma Terms of Use | Hugging Face (Google) |

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, funcionalidad y licencia. Frente a Llama Guard 3 y ShieldGemma, Prism destaca por cubrir también calidad de RAG y validación de tool calling, y por su licencia Apache 2.0 sin restricciones adicionales de uso comercial.

## Limitaciones y advertencias

- Uso restringido a puntuación: no debe emplearse como modelo de chat o instrucciones generales; hacerlo puede producir resultados inesperados según la propia model card.
- Solo inglés: el modelo declara únicamente `en`; su precisión en otros idiomas no está garantizada.
- La precisión varía según el dominio, el idioma y la redacción de los criterios personalizados; es obligatorio evaluarlo sobre datos representativos propios antes de desplegarlo.
- Riesgo de alucinación en el razonamiento: en modo thinking, la traza puede contener justificaciones plausibles pero incorrectas; debe tratarse como ayuda a la auditoría, no como prueba.
- Sesgos heredados del modelo base Granite Guardian y de sus datos de entrenamiento; no se documentan análisis específicos de sesgo para este ajuste fino.
- No sustituye a controles humanos en decisiones de alto impacto: la documentación recomienda usarlo como una salvaguarda entre varias.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a IBM Granite Guardian 3.3 8B conforme al fichero `NOTICE`.
- El repositorio no publica cuantizaciones oficiales ni resultados de benchmarks; el rendimiento real en producción debe medirse por cuenta propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zytra/prism
- Modelo base: https://huggingface.co/ibm-granite/granite-guardian-3.3-8b
- vLLM (motor de inferencia recomendado): https://github.com/vllm-project/vllm
