# ThakiCloud/FactGuard-General-4B

## Resumen

FactGuard-General-4B es un modelo de verificación de afirmaciones (claim–evidence verification) desarrollado por ThakiCloud y publicado como *research preview* bajo licencia Apache 2.0. Se construye sobre Qwen/Qwen3.5-4B mediante un ajuste LoRA posteriormente fusionado en los pesos, y no genera texto libre: recibe un conjunto de líneas de evidencia (F1–F9) y una afirmación atómica, y devuelve una de cuatro etiquetas leyendo la probabilidad de cuatro tokens de etiqueta en la última posición (SUPPORTED, CONTRADICTED, NOT_VERIFIABLE o STALE).

El modelo tiene 4.659.865.088 parámetros (~4,66 B) almacenados en BF16, un límite de 1.024 tokens de entrada según el contrato de prompt y una ventana nativa del modelo base no disponible en la información proporcionada. Admite dos cabeceras de prompt: `head_general`, para cualquier dominio, y `head_saas_pricing`, heredada de la familia FactGuard especializada en precios y planes SaaS.

Su relevancia es que amplía la familia FactGuard —hasta ahora limitada a dominios SaaS con los modelos especialistas FactGuard-4B, 8B, 9B y 27B— a dominios generales, con datos de FEVER, MultiNLI, TabFact, CUAD, AttributionBench, FaithDial y NLI coreano (KLUE-NLI, KorNLI). En los conjuntos de desarrollo declara una precisión global de 0,890, frente a 0,743 del especialista FactGuard-4B v0.3 y 0,528 del modelo base sin ajustar. No obstante, la evaluación sellada sigue pendiente y todas las cifras provienen de conjuntos de desarrollo construidos con las mismas fuentes que los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-4B con capas de atención y linear-attention; se conserva el layout multimodal completo (vision tower, pesos MTP y ficheros de procesador) sin entrenar |
| Parámetros totales | 4.659.865.088 (~4,66 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens de entrada como máximo según el contrato de prompt; ventana nativa del modelo base: no disponible |
| Tipos de cuantización | solo se publican pesos BF16 fusionados; no hay GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 9,3 GB |
| Tarea declarada | text-generation (pipeline_tag), si bien la salida real es una clasificación de cuatro clases sobre logits |
| Etiquetas de salida | ` A` SUPPORTED, ` B` CONTRADICTED, ` C` NOT_VERIFIABLE, ` D` STALE |
| Cabeceras de prompt | `head_general` (por defecto) y `head_saas_pricing` (compatibilidad con FactGuard-4B) |
| Modelo base | Qwen/Qwen3.5-4B, revisión `851bf6e806ef` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva su estructura multimodal intacta: torre de visión, pesos MTP y ficheros de procesador quedan en el checkpoint, pero los pesos de visión no se entrenaron y el autor no reclama ninguna capacidad de verificación de imágenes. El ajuste se aplicó como LoRA con r=16 y alpha=32 sobre todas las proyecciones de atención, linear-attention y MLP del modelo de lenguaje (visión excluida), con 1 epoch, batch 4×4, learning rate 5e-5, longitud máxima 1.024 y semilla 0. Se añadió un objetivo auxiliar de decisión-evidencia con peso 0,3. La fusión se hizo con `W' = W + (B·A)·alpha/r` en fp32 y se almacenó en BF16, de modo que el repositorio contiene pesos ya fusionados y no requiere configurar adaptadores.

El punto de partida no fue el modelo base, sino el adaptador LoRA de FactGuard-4B v0.3, continuado con nuevos datos; el autor entrenó también una alternativa desde base con los mismos datos y la comparó para la selección. El entrenamiento se ejecutó en una única NVIDIA B200 durante 3.689 pasos (4.251 segundos). Los datos de entrenamiento suman 59.025 filas no publicadas, convertidas al contrato de cuatro etiquetas desde fuentes públicas: replay sintético del especialista FactGuard (11.082 filas, A/B/C/D), contradicciones sintéticas de dominio general (5.990, A/B/C), FEVER vía `pietrolesci/nli_fever` (8.964, solo A/B), MultiNLI (9.000, A/B/C), TabFact (5.998, A/B), AttributionBench (6.991, A/C), FaithDial (2.000, A/C), CUAD (4.200, A/C, nunca B), KLUE-NLI (2.400, A/B/C) y KorNLI (2.400, A/B/C). Se aplicaron filtros de fuga: ningún grupo de desarrollo ni texto de claim de desarrollo en el entrenamiento, sin solapamiento de 8-gramas con las claims de la evaluación sellada y solapamiento cero de identificadores y grupos entre train y dev. Quedaron excluidos RAGTruth (respuestas generadas por modelos comerciales de terceros) y VitaminC (reservado para otro experimento). La auditoría de 80 filas previa al entrenamiento la realizó un revisor automático (Claude), no una persona, y detectó un error de mapeo de etiquetas en FaithDial y filas de evidencia vacías en FEVER, lo que obligó a descartar una build anterior de datos.

## Capacidades

- Clasificación de la relación entre una afirmación atómica y un conjunto de evidencias en cuatro clases: implicación (SUPPORTED), contradicción explícita (CONTRADICTED), no verificable (NOT_VERIFIABLE) y soportada solo por evidencia fechada en el pasado (STALE).
- Verificación de atribución (*grounding*): comprobar si las citas o pasajes recuperados respaldan realmente la respuesta generada, con datos de AttributionBench en el entrenamiento.
- Razonamiento sobre tablas: emite SUPPORTED o CONTRADICTED para afirmaciones contrastadas contra tablas, entrenado con TabFact.
- Verificación sobre texto contractual y cláusulas, entrenado con CUAD (solo etiquetas A y C, nunca B).
- NLI multilingüe coreano-inglés gracias a KLUE-NLI y KorNLI.
- Detección de información desactualizada mediante la etiqueta STALE, aunque solo se entrenó con datos sintéticos de replay del especialista.
- Mantenimiento de la ruta especialista en precios y planes SaaS mediante `head_saas_pricing`, con el mismo contrato que los pipelines de FactGuard-4B.
- No soporta tool calling, function calling, agentes, ni generación conversacional: el prompt debe enviarse como texto crudo, sin plantilla de chat, con `add_special_tokens=False` y un máximo de 1.024 tokens, tomando la softmax sobre los logits de los cuatro tokens de etiqueta en la última posición.
- Sin capacidad de visión declarada, pese a conservar la torre de visión del modelo base.

## Casos de uso

- Verificación de respuestas RAG en producción: dado el texto recuperado (hasta 1.024 tokens) y la afirmación que el generador va a emitir, el modelo devuelve SUPPORTED o NOT_VERIFIABLE, lo que permite bloquear o marcar respuestas no sustentadas antes de mostrarlas al usuario.
- Control de atribución en asistentes con citas: comprobar si cada cita asignada a una frase la respalda realmente, usando la cabecera `head_general`; el modelo está específicamente entrenado con AttributionBench y distingue entre evidencia ausente (NOT_VERIFIABLE) y evidencia contradictoria (CONTRADICTED).
- Auditoría de documentación de producto: comparar afirmaciones extraídas de páginas web o manuales con la evidencia fechada disponible y usar la etiqueta STALE para marcar contenido que solo está respaldado por fuentes antiguas.
- Validación de datos tabulares en informes: contrastar afirmaciones numéricas o de agregación contra tablas de soporte, un caso cubierto por TabFact con 0,913 de precisión en desarrollo.
- Revisión de contratos y cláusulas: verificar si una cláusula citada sustenta una afirmación sobre obligaciones o plazos; conviene tener en cuenta que en este dominio el modelo nunca emite CONTRADICTED.
- Moderación de contenido factual en comunidades o foros: puntuar afirmaciones de usuarios contra un corpus de referencia y derivar a revisión humana los casos NOT_VERIFIABLE, con una tasa de falso SUPPORTED de 116 sobre 2.700 (4,3 %) en desarrollo.
- Compatibilidad con pipelines SaaS existentes: reutilizar `head_saas_pricing` como sustituto del especialista FactGuard-4B en verificaciones de precios y planes, asumiendo una ligera pérdida de precisión.
- Verificación multilingüe coreano-inglés en flujos de atención al cliente o soporte técnico que operen en esos dos idiomas.

## Benchmarks y rendimiento

Conjunto de desarrollo general (2.700 filas, 300 por fuente, mismas fuentes que el entrenamiento). Precisión:

| Fuente | FactGuard-4B v0.3 (antes) | FactGuard-General-4B |
|---|---|---|
| FEVER | 0,770 | 0,933 |
| MultiNLI | 0,793 | 0,897 |
| TabFact | 0,697 | 0,913 |
| AttributionBench | 0,710 | 0,747 |
| FaithDial | 0,680 | 0,840 |
| CUAD | 0,747 | 0,970 |
| KLUE-NLI | 0,857 | 0,900 |
| KorNLI | 0,593 | 0,810 |
| Sintético (propio) | 0,840 | 1,000 |
| **Global** | 0,743 | **0,890** |

Recall global por etiqueta: SUPPORTED 0,882; CONTRADICTED 0,944; NOT_VERIFIABLE 0,857. Falsos SUPPORTED: 116 de 2.700. Falsos CONTRADICTED: 65 de 2.700. El modelo base sin ajustar obtiene 0,528 en el mismo conjunto. El autor advierte que la fuente sintética es fácil e infla el global, y que las fuentes más débiles son AttributionBench (0,747) y KorNLI (0,810).

Conjuntos de desarrollo SaaS (cabecera `head_saas_pricing`):

| Conjunto | FactGuard-4B v0.3 | FactGuard-General-4B |
|---|---|---|
| dev v0.3 (4.377) | 0,993 | 0,992 |
| dev de formato (513) | 0,990 | 0,983 |
| dev de página real (179) | 0,933 | 0,916 |

La capacidad especialista se conserva en su mayor parte pero se reduce ligeramente: 10 errores más sobre 5.069 filas, y el recall de SUPPORTED en el conjunto de página real de 179 filas cae desde 0,80 (el valor final aparece truncado en la información disponible). No hay resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, ni evaluación sellada publicada.

## Requisitos de hardware

- Pesos en BF16: 4,66 B de parámetros implican unos 9,3 GB, coherente con el tamaño del repositorio (9,3 GB). Con KV cache para 1.024 tokens, la VRAM estimada de inferencia ronda los 11–12 GB (cálculo derivado del tamaño, no dato publicado).
- En INT8/FP8 la estimación baja a unos 5 GB de pesos y 6–7 GB de VRAM; en 4 bits, a unos 2,5–3 GB de pesos y 4–5 GB de VRAM. Estas cuantizaciones no están publicadas y requerirían un proceso propio.
- GPU de datacenter: una sola NVIDIA B200 fue suficiente para entrenar 3.689 pasos en 4.251 s. Para inferencia, A100 40 GB, H100 o L40S cubren el modelo con holgura.
- GPU de consumo: cabe en BF16 en RTX 4090 y RTX 3090 (24 GB) y, con menos margen, en RTX 4080 o RTX 4060 Ti de 16 GB. En tarjetas de 8 GB sería necesario cuantizar a 4 bits.
- Despliegue: `transformers` con `AutoModelForCausalLM` es la ruta de referencia, tal como indican `example_inference.py` y `label_contract.json`. El repositorio no incluye GGUF, por lo que llama.cpp u Ollama exigirían una conversión propia. En vLLM o TGI hay que poder acceder a los logits de los cuatro tokens de etiqueta (por ejemplo vía `logprobs`), ya que el modelo no se usa como generador de texto.
- Latencia y throughput: no publicados. El único dato de coste disponible es el entrenamiento (una B200, 4.251 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| FactGuard-General-4B | ~4,66 B | 1.024 tokens de entrada (contrato de prompt) | Apache 2.0 | 0,890 global en dev general; 0,992 / 0,983 / 0,916 en dev SaaS | Pesos BF16 en HuggingFace, preview de investigación |
| FactGuard-4B (especialista SaaS) | ~4 B (no confirmado en la información disponible) | no disponible | Apache 2.0 (según el modelo base y la familia) | 0,743 en dev general; 0,993 / 0,990 / 0,933 en dev SaaS | Publicado; pipelines existentes |
| Qwen/Qwen3.5-4B (modelo base) | ~4,66 B | no disponible | no disponible en la información proporcionada | 0,528 en el dev general | Público en HuggingFace |
| FactGuard especialistas 8B, 9B y 27B | 8 B / 9 B / 27 B | no disponible | no disponible en la información proporcionada | no disponible | Publicados según la model card; sin datos de evaluación en la información disponible |

No se dispone de datos de benchmarks de alternativas genéricas de NLI o verificación (por ejemplo, modelos DeBERTa o LLM con prompting) en la información proporcionada, por lo que no se incluye una comparación cuantitativa con ellas.

## Limitaciones y advertencias

- *Research preview* con evaluación sellada pendiente: todas las métricas proceden de conjuntos de desarrollo construidos con las mismas fuentes que el entrenamiento, de modo que la generalización a respuestas de IA reales no está verificada.
- El conjunto sintético propio alcanza 1,000 y eleva artificialmente el 0,890 global; las cifras realistas son AttributionBench 0,747 y KorNLI 0,810.
- El modelo evalúa únicamente la relación entre la afirmación y la evidencia suministrada: no conoce la verdad del mundo y no busca información. La ausencia de evidencia se etiqueta siempre como NOT_VERIFIABLE, nunca como CONTRADICTED, lo que puede infravalorar contradicciones implícitas.
- La etiqueta STALE solo se entrenó con datos sintéticos de replay del especialista (11.082 filas), por lo que su fiabilidad fuera de ese dominio es dudosa.
- Tasa de error medida: 116 falsos SUPPORTED y 65 falsos CONTRADICTED sobre 2.700 filas de desarrollo. Un falso SUPPORTED implica avalar una afirmación no sustentada.
- Límite estricto de 1.024 tokens de entrada: evidencias más largas deben truncarse o dividirse, con pérdida de contexto.
- Solo coreano e inglés; no hay soporte declarado de castellano.
- El contrato de prompt es rígido (texto crudo, sin plantilla de chat, `add_special_tokens=False`, softmax sobre cuatro logits), lo que complica su exposición como API conversacional estándar y exige acceso a logprobs o a los logits del modelo.
- Los pesos de visión no se entrenaron pese a conservarse la torre de visión; no debe asumirse ninguna capacidad de verificación de imágenes.
- Uso comercial bajo Apache 2.0, con la advertencia de que parte de los datos de entrenamiento son CC BY-SA (FEVER derivado de Wikipedia, MultiNLI, KLUE-NLI, KorNLI) y el autor señala que no está resuelto si la cláusula ShareAlike se aplica a los pesos entrenados con ellos.
- El dataset de 59.025 filas no se ha publicado, por lo que el entrenamiento no es reproducible.
- La auditoría de calidad de datos la realizó un revisor automático (Claude) sobre 80 filas, no una persona, y ya detectó errores de mapeo y filas vacías en una build anterior.
- La capacidad especialista en SaaS se degrada ligeramente (10 errores más en 5.069 filas); conviene mantener FactGuard-4B para ese dominio si la precisión es crítica.
- Se excluyeron RAGTruth (por proceder de modelos comerciales de terceros) y VitaminC, de modo que el modelo no se ha entrenado con respuestas generadas por LLM reales de ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/FactGuard-General-4B
- Modelo base Qwen/Qwen3.5-4B (referenciado en la model card): https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo especialista de la familia FactGuard-4B (referenciado en la model card): https://huggingface.co/ThakiCloud/FactGuard-4B
- Dataset FEVER en formato NLI (referenciado en la model card): https://huggingface.co/datasets/pietrolesci/nli_fever
- Ficheros `example_inference.py` y `label_contract.json` en el repositorio del modelo: https://huggingface.co/ThakiCloud/FactGuard-General-4B/tree/main
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
