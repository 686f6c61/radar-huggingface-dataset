# ukisai/gemma-4-E2B-swift

## Resumen

Gemma 4 E2B Swift es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B, desarrollado por el usuario ukisai. El objetivo del modelo es comprimir el razonamiento: reducir el numero de tokens de pensamiento generados manteniendo, e incluso mejorando ligeramente, la precision en tareas de razonamiento, matematicas, codigo y conocimiento general. Segun la model card, el modelo logra una reduccion media del 12,9 % en tokens de pensamiento con una mejora media de +1,30 puntos en el conjunto de benchmarks evaluados.

Tecnicamente se trata de un modelo multimodal de tipo any-to-any (entrada y salida de texto e imagen) con 5.123.178.051 parametros totales segun los pesos en safetensors. El entrenamiento emplea la receta OPSDC / CRISP (arXiv 2603.05433), una destilacion on-policy de un profesor que es el mismo modelo con una instruccion de concision. El resultado es un modelo Gemma 4 estandar, sin filtros en tiempo de ejecucion ni servidores especiales, desplegable en transformers o vLLM.

La relevancia actual radica en que el coste de inferencia de los modelos con modo pensamiento esta dominado por los tokens de razonamiento; reducir un 13 % esos tokens sin degradar la calidad tiene impacto directo en latencia y coste en produccion. El modelo se publica como release candidate con una bateria de 11 benchmarks superada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any), base google/gemma-4-E2B |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (cap de entrenamiento: 8192) |
| Tipos de cuantizacion | no disponible (soporta conversion a GGUF mediante el conversor estandar de Gemma 4) |
| Idiomas soportados | no disponible |
| Licencia | Gemma license (heredada de google/gemma-4-E2B) |
| Formato de pesos | safetensors (tambien GGUF via conversor) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B (revision 3e22461f), un transformer multimodal con pipeline any-to-any. Sobre esa base se aplica un LoRA de rango 32 y alpha 64, con learning rate 1e-5, batch de 32, un rollout, cap de 8192 tokens y refresco del profesor cada 50 pasos (M=50). Los pesos LoRA estan fusionados en el modelo final, por lo que no requiere adaptadores en tiempo de ejecucion.

La innovacion principal es la receta OPSDC v1 (CRISP, Sang et al. 2026): destilacion on-policy donde el alumno es el modelo con el prompt plano y el profesor es el mismo modelo con una instruccion de concision, optimizando la divergencia KL inversa sobre todo el vocabulario. El conjunto de datos son 16.858 problemas DAPO, decontaminados con n-gramas de 13 frente a todos los pools de evaluacion. El entrenamiento se detuvo en el paso 30.

## Capacidades

- Generacion de texto y razonamiento con modo pensamiento comprimido (menos tokens de pensamiento que la base).
- Razonamiento matematico de competicion (AIME, HMMT) y cientifico (GPQA Diamond).
- Generacion de codigo (LiveCodeBench v6).
- Capacidades multimodales de imagen a texto (ERQA evaluado; pipeline any-to-any).
- Conocimiento general y multilingue (C-Eval evaluado).
- Seguimiento de instrucciones estricto y laxo (IFBench strict y loose).
- Compatible con endpoints y pipelines estandar de Gemma 4 (transformers, vLLM).

## Casos de uso

- Razonamiento matematico asistido en produccion: el modelo mejora en AIME 2024 (+5,33) y AIME 2025/2026 (+4,00) reduciendo tokens, util para tutoria o verificacion de soluciones con menor latencia.
- Agentes de razonamiento multi-paso: la reduccion del 12,9 % en tokens de pensamiento abarata cadenas de razonamiento largas en pipelines agenticos desplegados con vLLM.
- Generacion de codigo en CI/CD: integrable en pipelines de revision o generacion de tests mediante la API de transformers, con calidad cercana a la base en LiveCodeBench (−1,38).
- Analisis de documentos con imagen: al ser any-to-any, puede procesar capturas, diagramas o formularios y responder en texto, aunque con ligera perdida en ERQA (−0,90).
- Evaluacion cientifica automatizada: GPQA Diamond mejora ligeramente (+0,40), adecuado para asistentes de investigacion que requieran respuestas concisas.
- Atencion al cliente tecnica: el seguimiento de instrucciones estricto mejora (+1,20 en IFBench strict), util para respuestas formatadas y concisas en sistemas conversacionales.
- Sustitucion drop-in de Gemma 4 E2B: al ser un modelo Gemma 4 plano sin filtros, puede reemplazar a la base en infraestructura existente para reducir coste de inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (5 semillas, MMLU-Pro semilla 0, errores cuentan como fallo):

| Benchmark | Base | Swift | Delta | Tokens |
|---|---:|---:|---:|---:|
| GPQA Diamond | 42,63 | 43,03 | +0,40 | −21,4 % |
| AIME 2024 | 35,33 | 40,67 | +5,33 | −11,0 % |
| AIME 2025 | 26,67 | 30,67 | +4,00 | −16,6 % |
| AIME 2026 | 32,67 | 36,67 | +4,00 | −8,6 % |
| HMMT Nov 2025 | 18,00 | 17,33 | −0,66 | −12,3 % |
| C-Eval | 59,41 | 59,78 | +0,37 | −11,4 % |
| ERQA | 39,35 | 38,45 | −0,90 | −7,3 % |
| LiveCodeBench v6 | 58,35 | 56,97 | −1,38 | −11,3 % |
| MMLU-Pro | 45,32 | 47,17 | +1,85 | −21,7 % |
| IFBench strict | 30,60 | 31,80 | +1,20 | no disponible |
| IFBench loose | 37,27 | 37,87 | +0,60 | no disponible |
| Media | | | +1,30 | −12,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,3 GB solo para pesos, mas overhead de activaciones y cache KV (el repo ocupa 10,3 GB).
- Cuantizacion a 8 bits: en torno a 5-6 GB; a 4 bits: en torno a 3 GB (estimacion a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue a escala; RTX 4090 (24 GB) suficiente en bfloat16 para una sola instancia.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, vLLM y cualquier pipeline de Gemma 4; GGUF mediante el conversor estandar de Gemma 4 (llama.cpp/Ollama no confirmados explicitamente por el autor).
- Latencia y throughput: no disponibles; la reduccion del 12,9 % en tokens de pensamiento reduce esperanza de latencia en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento (media bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-swift | 5.123 M | no disponible | +1,30 vs base | Gemma license | Hugging Face |
| google/gemma-4-E2B (base) | 5.123 M (misma base) | no disponible | referencia | Gemma license | Hugging Face |
| Alternativas de razonamiento comprimido | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo release candidate con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente de la comunidad.
- Ligera degradacion en tareas de codigo (LiveCodeBench −1,38), matematicas de competicion especifica (HMMT −0,66) y vision (ERQA −0,90).
- La compresion de razonamiento puede reducir la profundidad en problemas que requieren cadenas largas; el cap de entrenamiento es 8192 tokens.
- Riesgo de alucinacion inherente a la base; no hay datos especificos sobre sesgos.
- Idiomas soportados no documentados; solo se evalua C-Eval como proxy multilingue.
- Licencia Gemma: uso comercial sujeto a los terminos de Google (enlace a gemma_4_license); conviene revisarlos antes de produccion.
- No se documentan tecnicas de seguridad adicionales (RLHF de seguridad, filtros) en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/gemma-4-E2B-swift
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper OPSDC / CRISP: arXiv 2603.05433 (referenciado en la model card)
