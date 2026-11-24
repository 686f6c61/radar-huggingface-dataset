# tyrant35/zils-lite-gzx13

## Resumen

zils-lite-gzx13 es un modelo de decisión de 852.985.920 parámetros (aproximadamente 853 millones) publicado por el usuario tyrant35 en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune derivado de malkolm777/zils-lite-l22-correct-attn, un modelo base de la familia Zils orientado a tareas de decisión. El autor lo describe como un "soup-pool body" de tipo d3-lite construido mediante la media ponderada de seis fine-tunes LoRA de rango 64 aplicados sobre las proyecciones de atención del modelo base, con la variación media escalada por un factor de 1.3.

El modelo está especializado en preguntas de decisión: selección de herramientas, enrutamiento, políticas, aritmética de fechas y precios, extracción de información, teoría musical, probabilidad y puzles de restricciones. Su entrenamiento combina datos de decisión de las particiones de entrenamiento de conjuntos públicos de BigScience P3 (iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer) con aproximadamente 18.500 preguntas de decisión generadas programáticamente cuyas etiquetas se calculan en código.

La relevancia del modelo es limitada y muy específica: no es un modelo de propósito general, sino un artefacto experimental de un autor independiente, sin descargas ni valoraciones en el momento de la consulta, y sin model card que documente arquitectura, contexto o idiomas. Resulta adecuado únicamente como caso de estudio de técnicas de model merging (LoRA averaging con escalado) aplicadas a un modelo base pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de malkolm777/zils-lite-l22-correct-attn; se infiere transformer con proyecciones de atención, sin confirmación documental) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card solo menciona datos en inglés de P3 y otros conjuntos públicos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,7 GB |
| Modelo base | malkolm777/zils-lite-l22-correct-attn |
| Fecha de publicación | 2026-11-24 |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El autor describe el proceso de construcción: parte del cuerpo "soup" d3-lite de malkolm777/zils-lite-l22-correct-attn, aplica seis fine-tunes LoRA de rango 64 sobre las proyecciones de atención (learning rate 3e-5, una sola pasada), promedia los pesos resultantes y escala la variación media respecto al modelo soup por un factor de 1.3. Es, por tanto, una técnica de model merging basada en LoRA averaging con amplificación del delta, no un entrenamiento desde cero ni un fine-tune convencional.

Los datos de entrenamiento combinan preguntas de decisión de las particiones de train de conjuntos públicos de BigScience P3, junto con datos públicos de entrenamiento de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, más unas 18.500 preguntas de decisión generadas programáticamente (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, extracción, rima y métrica, teoría musical, color, tablas de probabilidad y puzles de restricciones) cuyas etiquetas se calculan en código. Los objetivos mezclan la etiqueta gold con las probabilidades del propio modelo soup: peso 0.9 para la etiqueta gold cuando la respuesta top del soup era incorrecta y 0.5 cuando era correcta. El autor indica que no se usó ninguna partición de test de benchmarks y que se eliminaron las filas cuyo texto aparece en sus conjuntos de evaluación.

## Capacidades

- Respuesta a preguntas de decisión con opciones discretas: selección entre alternativas, enrutamiento y clasificación de políticas.
- Selección de herramientas (tool selection) en el contexto de agentes, según los datos de entrenamiento generados.
- Aritmética de fechas y precios, extracción de información y manejo de instrucciones inyectadas.
- Tareas de razonamiento acotado: tablas de probabilidad, puzles de restricciones, rima y métrica, teoría musical y color.
- Clasificación de sarcasmo (iSarcasmEval), análisis de valores (VAST), razonamiento clínico (NLI4CT) y verificación de hechos (HoVer) como dominios presentes en los datos de entrenamiento.
- No se documenta soporte de tool calling estructurado, modo thinking, visión, audio ni capacidades multilingües verificadas.

## Casos de uso

- Enrutamiento de consultas en un sistema de agentes: el modelo puede clasificar una consulta entrante y decidir qué herramienta o flujo activar, dado que los datos de entrenamiento incluyen enrutamiento y selección de herramientas generados programáticamente.
- Clasificación de políticas internas: útil para decidir si una solicitud cumple o no una regla de negocio, apoyándose en los ejemplos de políticas del dataset sintético.
- Extracción de campos estructurados: adecuado para tareas de extracción simples sobre texto corto, uno de los dominios explícitos del entrenamiento.
- Verificación de hechos a pequeña escala: el modelo ha visto datos de HoVer, por lo que puede emplearse como clasificador de apoyo en pipelines de fact-checking, siempre con validación humana.
- Aritmética de fechas y precios en asistentes de back-office: cálculo de plazos, vencimientos o totales como paso intermedio en un flujo mayor.
- Filtrado de sarcasmo en análisis de opinión: clasificador auxiliar para descartar reseñas sarcásticas antes de un análisis de sentimiento, dado el uso de iSarcasmEval.
- Prototipado e investigación en model merging: caso de estudio reproducible de LoRA averaging con escalado sobre un modelo base pequeño, útil para experimentar con técnicas de fusión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no utilizó ninguna partición de test de benchmarks y que eliminó de los datos de entrenamiento las filas cuyo texto aparece en sus conjuntos de evaluación, pero no reporta métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB. No se publican variantes cuantizadas oficiales, por lo que habría que generarlas localmente.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes de baja latencia.
- Opciones de despliegue: al publicarse solo en safetensors, es necesario convertirlo a GGUF para llama.cpp u Ollama, o cargarlo con transformers, vLLM o TGI. No se documentan recetas de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-gzx13 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune por LoRA averaging de un modelo de decisión |
| malkolm777/zils-lite-l22-correct-attn | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Modelo soup d3-lite del que deriva |
| Modelos de decisión pequeños de propósito general (p. ej. clasificadores tipo DeBERTa) | 100-500 M típicamente | 512-1024 tokens típicamente | variable | amplia | No se dispone de datos comparativos verificados con este modelo concreto |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los datos de rendimiento, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de un autor independiente, con 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad relativa frente al modelo base ni frente a alternativas.
- La model card no documenta arquitectura, longitud de contexto, idiomas ni tokenizador; cualquier integración requiere inspección directa de los pesos y la configuración.
- Riesgo elevado de alucinación en tareas fuera del dominio de decisión: el entrenamiento se centra en preguntas de decisión con opciones y etiquetas calculadas en código, no en generación abierta.
- Los objetivos de entrenamiento mezclan etiquetas gold con las probabilidades del propio modelo soup (pesos 0.9 y 0.5), lo que puede introducir sesgos hacia los errores sistemáticos del modelo base.
- Los datos de entrenamiento incluyen conjuntos en inglés (P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer); el soporte multilingüe no está verificado y probablemente sea limitado.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y las condiciones del modelo base malkolm777/zils-lite-l22-correct-attn antes de un uso comercial.
- El escalado del delta por 1.3 es una decisión empírica del autor sin justificación documentada; puede amplificar artefactos del merging.
- No se publican variantes cuantizadas ni recetas de despliegue, lo que añade trabajo de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-gzx13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: no disponible en la información proporcionada
- iSarcasmEval: no disponible en la información proporcionada
- VAST: no disponible en la información proporcionada
- CLadder: no disponible en la información proporcionada
- NLI4CT: no disponible en la información proporcionada
- Amazon ESCI: no disponible en la información proporcionada
- HoVer: no disponible en la información proporcionada
