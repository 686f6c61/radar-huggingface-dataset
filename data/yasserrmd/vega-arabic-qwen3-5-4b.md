# yasserrmd/vega-arabic-qwen3.5-4b

## Resumen

vega-arabic-qwen3.5-4b es un adaptador de decisión tipada (typed decisions) construido sobre el modelo Qwen3.5-4B, publicado por el usuario yasserrmd bajo licencia Apache-2.0. No es un modelo generativo al uso: se trata de un adaptador LoRA con compuerta (gated LoRA) que, usando el lector congelado Qwen3.5-4B y el motor físico vega-U, responde tres preguntas cerradas sobre un tuit en árabe en una sola pasada: sentimiento (positivo, negativo, neutro), sarcasmo (probabilidad booleana) y dialecto (msa, egyptian, gulf, levantine). Cada respuesta se devuelve con una probabilidad calibrada.

El modelo resuelve un problema concreto de clasificación de texto árabe en redes sociales, un dominio donde los enfoques generativos zero-shot rinden de forma mediocre por la variación dialectal y la ambigüedad del sarcasmo. En lugar de generar texto libre, el sistema fuerza una decisión tipada sobre un conjunto cerrado de opciones, lo que permite calibrar probabilidades y aplicar umbrales conformales. La relevancia actual radica en que demuestra una arquitectura alternativa a los clasificadores clásicos y a los LLM generativos para tareas de etiquetado estructurado.

El adaptador entrena solo 835.937 parámetros sobre un lector congelado de 4B, con un tamaño de repositorio de 0,1 GB. Está especializado exclusivamente en árabe y se distribuye con la librería vegaml, no con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector transformer congelado (Qwen3.5-4B) + motor vega-U + adaptador gated LoRA de rango 32 sobre siete proyecciones y la red de compuerta |
| Parametros totales | 4B en el lector base (no disponible el desglose exacto del checkpoint vega-U) |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables | 835.937 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (engine.safetensors, port.safetensors, adapters/arabic-tweets.safetensors) |
| Libreria | vegaml |
| Pipeline | text-classification |
| Dataset de entrenamiento | iabufarha/ArSarcasm-v2 (15.548 tuits) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: un lector congelado Qwen3.5-4B que procesa el tuit, un motor de decisión denominado vega-U que "se asienta" sobre una respuesta, y un adaptador gated LoRA de rango 32 aplicado sobre siete proyecciones del motor más una red de compuerta. La compuerta decide por pregunta si el adaptador aplica; cuando no aplica, el mismo checkpoint responde con el motor base. El adaptador no genera texto: produce decisiones tipadas (choice o boolean) con probabilidad calibrada.

El entrenamiento usa el dataset ArSarcasm-v2 (15.548 tuits, licencia MIT) con un preprocesado específico: eliminación de URLs, sustitución de menciones por `@user`, conversión de guiones bajos de hashtags en espacios, limitación de la elongación de letras a 3 caracteres, eliminación de tatweel y conservación de emojis. Se descartaron 241 duplicados de entrenamiento con etiquetas en conflicto y 7 tuits de entrenamiento presentes también en test. Los tuits magrebíes (43) no tienen etiqueta de dialecto pero sí entrenan sentimiento y sarcasmo. Se eliminaron etiquetas de dialecto en 47 tuits etiquetados como MSA que contenían dos o más marcadores de golfo, egipcio o levantino. Se usó un split de validación estratificado del 10% solo para calibración. Como negativos de compuerta se emplearon enunciados ar-SA de MASSIVE y titulares ingleses de ag_news, cada uno con una pregunta no relacionada.

El entrenamiento empleó entropía cruzada balanceada por clase (frecuencia inversa de raíz cuadrada), 6 épocas, AdamW con schedule one-cycle, learning rate 3e-4, en una única A100. La calibración térmica y los umbrales conformales se ajustaron sobre el split de validación y se distribuyen dentro de `adapters/arabic-tweets.json`.

## Capacidades

- Clasificación de sentimiento en árabe con tres clases: positive, negative, neutral.
- Detección de sarcasmo como probabilidad booleana calibrada.
- Identificación de dialecto entre cuatro clases: msa, egyptian, gulf, levantine.
- Respuesta a las tres preguntas en una sola lectura del tuit.
- Salida con probabilidad calibrada por respuesta (calibración térmica y umbrales conformales).
- Compuerta por pregunta que decide si el adaptador aplica o si responde el motor base.
- No genera texto libre; está limitado a decisiones tipadas sobre opciones cerradas.
- Especializado exclusivamente en árabe; sin capacidades multilingües declaradas.
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Monitorización de sentimiento en redes sociales árabes: el modelo clasifica tuits en positivo, negativo o neutro con probabilidad calibrada, lo que permite fijar umbrales de confianza y filtrar automáticamente el volumen de menciones de una marca o evento.
- Detección de sarcasmo en análisis de opinión: al devolver una probabilidad en lugar de un veredicto, el equipo puede elegir el umbral adecuado y tratar el sarcasmo como señal de riesgo en lugar de como etiqueta binaria rígida.
- Segmentación dialectal de corpus de tuits: la clasificación entre MSA, egipcio, golfo y levantino permite enrutar contenidos a anotadores o a modelos especializados por variedad, con la advertencia de que las etiquetas de dialecto deben tratarse como cota inferior.
- Moderación y análisis de conversación en árabe: el sistema procesa tuits individuales y devuelve etiquetas estructuradas, lo que facilita integrarlo en pipelines de moderación que necesitan decisiones auditables y no texto generado.
- Investigación en procesamiento de árabe dialectal: el checkpoint y los scripts de preparación (`prepare_arabic.py`, `vega_finetune_arabic.py`) permiten reproducir el experimento y comparar contra el motor base zero-shot con las mismas preguntas.
- Enriquecimiento de datasets para entrenamiento: las etiquetas de sentimiento y sarcasmo con probabilidad calibrada pueden usarse para preetiquetar grandes volúmenes de tuits antes de la revisión humana, priorizando los casos de baja confianza.
- Evaluación de calibración en clasificación de texto: al publicar ECE junto a accuracy y macro-F1, el modelo sirve como referencia para estudiar calibración en tareas de clasificación árabe con clases desbalanceadas.

## Benchmarks y rendimiento

Resultados sobre el split de test oficial de ArSarcasm-v2 (2.988 tuits). Base = motor vega-U zero-shot con el mismo lector y preguntas. ECE = error de calibración esperado (menor es mejor).

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Adaptador acc | Adaptador macro-F1 | Adaptador ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 2988 | 0,494 | 0,422 | 8,41 | 0,685 | 0,636 | 3,27 |
| sarcasm | 2988 | 0,690 | 0,569 | 11,46 | 0,746 | 0,710 | 3,36 |
| dialect | 2986 | 0,322 | 0,202 | 8,78 | 0,587 | 0,398 | 5,16 |

Slice de dialecto golfo del split de test:

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Adaptador acc | Adaptador macro-F1 | Adaptador ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 319 | 0,467 | 0,410 | 8,86 | 0,593 | 0,560 | 7,18 |
| sarcasm | 319 | 0,781 | 0,547 | 19,86 | 0,777 | 0,692 | 4,50 |
| dialect | 319 | 0,025 | 0,012 | 28,18 | 0,310 | 0,158 | 17,64 |

Compuerta media del adaptador en el split de test: 1,0.

## Requisitos de hardware

- El adaptador entrena 835.937 parámetros sobre un lector congelado de 4B; el grueso del coste computacional es la inferencia del lector Qwen3.5-4B.
- Entrenamiento realizado en una única A100.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del lector Qwen3.5-4B y de la cuantización elegida, no documentada.
- GPU recomendadas: no disponible; el autor solo documenta A100 para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería vegaml (carga mediante `vegaml.load`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparativa numérica fiable. La comparación más directa disponible es interna, contra el motor base vega-U zero-shot con el mismo lector y preguntas (ver tabla de benchmarks), donde el adaptador mejora accuracy, macro-F1 y calibración en las tres tareas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| vega-arabic-qwen3.5-4b | 4B (lector) + 835.937 entrenables | no disponible | Apache-2.0 | Clasificación tipada con adaptador gated LoRA |
| vega-U (base) | no disponible | no disponible | Apache-2.0 | Motor de decisión zero-shot sin adaptador |
| Qwen3.5-4B | 4B | no disponible | no disponible | Lector generativo congelado |

## Limitaciones y advertencias

- Los tuits provienen de fuentes de 2017 a 2021 (SemEval, ASTD, DAICT); se espera menor precisión en documentos largos, cartas formales o registros que no sean de Twitter.
- El dialecto golfo representa aproximadamente el 5% de los datos de entrenamiento y el levantino otro 5%; el árabe emiratí no se separa de otras variedades del golfo.
- Las etiquetas de dialecto del dataset original son ruidosas: 60 etiquetas MSA del split de test parecen coloquiales según la regla aplicada, lo que limita la accuracy máxima alcanzable. Deben tratarse las puntuaciones de dialecto como cota inferior.
- El sarcasmo es difícil incluso para personas; la probabilidad debe usarse con un umbral elegido por el usuario, no como veredicto.
- El modelo no genera texto y solo responde a las tres preguntas definidas en `arabic_questions.json`; mantener la redacción exacta de las preguntas para obtener los mejores resultados.
- Especializado exclusivamente en árabe; sin capacidades multilingües.
- Sin datos publicados sobre cuantización, longitud de contexto, latencia o requisitos de VRAM.
- Licencia Apache-2.0, lo que permite uso comercial, pero sujeta a las condiciones de la licencia del lector base Qwen3.5-4B, no detalladas en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las decisiones pueden ser erróneas en registros fuera de dominio; el ECE del slice golfo en dialecto (17,64%) indica calibración deficiente en ese subconjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/vega-arabic-qwen3.5-4b
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Motor base vega-U: https://huggingface.co/nandakishorm/vega-U
- Dataset ArSarcasm-v2: https://github.com/iabufarha/ArSarcasm-v2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
