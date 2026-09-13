# textilelabs/Loom-Swift-Micro

## Resumen

Loom Swift Micro es un modelo de lenguaje de 1.159.120 parámetros entrenado desde cero por Textile Labs (laboratorio independiente detrás de la familia Loom), sin partir de ningún checkpoint preexistente, sin fine-tuning ni destilación. Forma parte de la nueva "tier" Swift, cuyo criterio de diseño es que el ciclo completo de entrenamiento se mida en minutos: en este caso, 4 minutos y 42 segundos sobre un Dell OptiPlex 9020 con un i5-4690 de cuatro núcleos, 16 GB de RAM y ninguna GPU, en precisión fp32. La arquitectura es de estilo Llama (12 capas, 80 dimensiones ocultas, GQA, SwiGLU, RoPE, RMSNorm y embeddings atados) y el contexto máximo es de 512 tokens.

El modelo no se presenta como una herramienta de conocimiento, sino como un experimento sobre calibración y honestidad en modelos diminutos. Su comportamiento medido es asimétrico: acierta al decidir cuándo debe consultar una herramienta y al redactar la consulta de búsqueda (20 de 20 preguntas retenidas), pero es incapaz de leer correctamente el pasaje recuperado (0 de 20 respuestas finales correctas). El propio autor lo declara explícitamente y desaconseja su uso para responder preguntas factuales.

Su relevancia actual es metodológica y educativa más que de producto: demuestra que un transformer funcional puede entrenarse íntegramente en CPU en menos de cinco minutos, y publica una batería de evaluación de comportamiento (133 puntos, 104 obtenidos) en lugar de los benchmarks estándar de conocimiento. Es una release marcada como experimental, con licencia MIT, orientada a quien quiera estudiar dinámicas de agente, formato de diálogo y honestidad calibrada en modelos por debajo del millón y medio de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama: 12 capas x 80 dimensiones ocultas, GQA, SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parámetros totales | 1.159.120 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | GGUF disponible; fp32 (precisión de entrenamiento), fp16/bf16, y cuantizaciones GGUF de llama.cpp (el autor no detalla los niveles concretos) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |
| Vocabulario | BPE de 4.096 tokens, entrenado por el autor sobre su propio corpus |
| Optimizador | Muon en las matrices ocultas 2D, AdamW en embeddings y normalizaciones |
| Entrenamiento | 4 minutos 42 segundos, 164 pasos de optimizador, 1,74 tokens por parámetro (aprox. 2 millones de tokens) |
| Hardware de entrenamiento | Dell OptiPlex 9020 (i5-4690, 4 núcleos, sin GPU, 16 GB), fp32 |
| Formato de prompt | Etiquetas propias: `<tools:on>` / `<tools:off>`, `<user>`, `<|eot|>`, `<loom>` |
| Biblioteca | transformers |
| Etiquetas del repositorio | tiny-model, llama, from-scratch, conversational, multi-turn, tool-use, agent-harness, calibrated-honesty, humble-ai, cpu-trained, muon, experimental, text-generation-inference, endpoints_compatible |
| Descargas registradas | 0 |
| Likes | 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Llama, sin mezclas de expertos ni componentes de estado recurrente. Consta de 12 capas con 80 dimensiones ocultas, lo que da un total de 1.159.120 parámetros. Usa Grouped Query Attention, activación SwiGLU, embeddings posicionales rotatorios (RoPE), normalización RMSNorm y embeddings de entrada y salida atados, un recurso habitual para reducir parámetros en modelos de este tamaño. El tokenizador es un BPE de 4.096 elementos entrenado por el propio laboratorio sobre su corpus.

El entrenamiento se hizo desde inicialización aleatoria, sin destilación ni checkpoint previo de terceros, sobre una mezcla de corpus con licencias abiertas (SQuAD 2.0, CC BY-SA 4.0; MASSIVE, CC BY 4.0; CLINC150, CC BY 3.0; databricks-dolly-15k, CC BY-SA 3.0; OASST1, Apache 2.0) más un currículo escrito por el equipo. La innovación técnica principal no está en la arquitectura, sino en el régimen de optimización: Muon sobre las matrices ocultas bidimensionales y AdamW sobre embeddings y normalizaciones, ejecutado en fp32 sobre CPU. El resultado son 164 pasos de optimizador y 1,74 tokens por parámetro, cifra muy por debajo de los 20 tokens por parámetro habituales en modelos de escala comparable, lo que explica directamente su escaso conocimiento factual.

El foco del diseño es el comportamiento conversacional y de agente: el modelo se entrena con un formato de turnos explícito y con marcadores para activar o desactivar herramientas, y se evalúa con sondas escritas a mano que no aparecen en los datos de entrenamiento, puntuadas por contenido y no por coincidencia superficial.

## Capacidades

- Generación de texto conversacional en inglés con formato de turnos propio (`<user>`, `<|eot|>`, `<loom>`).
- Decisión de uso de herramientas: determina cuándo conviene buscar información y redacta la consulta de búsqueda; obtuvo 20 de 20 en preguntas retenidas.
- Ejecución dentro de un bucle de agente real, mediante el `harness.py` publicado por el autor, que lanza las búsquedas y devuelve el pasaje.
- Conversación multiturno: mantiene correctamente 28 de 44 puntos en diálogos de 10 a 12 turnos.
- Terminación autónoma del turno: 12 de 12 en la prueba de parada propia.
- Reconocimiento de identidad y autoconocimiento: 12 de 12 en saber su propio nombre.
- Abstención declarada: nunca afirma haber hecho una consulta que no realizó (16 de 16), aunque con herramientas desactivadas solo rechaza 5 de 20 hechos que no conoce.
- Resistencia parcial a inyección de prompt: 25 de 36.
- Ignora parcialmente una etiqueta `<tools:on>` escrita dentro de un mensaje del usuario: 8 de 12.
- No dispone de visión, audio, ejecución de código, matemáticas ni capacidades multilingües.

## Casos de uso

- Enrutamiento de intención en asistentes: el modelo se entrenó con MASSIVE y CLINC150, por lo que puede clasificar comandos de usuario en categorías cerradas antes de derivar la petición a un modelo mayor, con un coste de cómputo prácticamente nulo.
- Generación de consultas de búsqueda en un pipeline RAG: dado un turno de usuario y 512 tokens de contexto, produce la cadena de búsqueda adecuada (20 de 20 en la prueba del autor), delegando la lectura del pasaje a un modelo mayor.
- Componente de decisión en un harness de agentes: con su formato `<tools:on>` / `<tools:off>` puede actuar como puerta de entrada que decide si hace falta una llamada a herramienta antes de invocar el modelo principal.
- Pruebas de concepto de entrenamiento desde cero: sirve para reproducir un ciclo completo de preentrenamiento en CPU en menos de cinco minutos, útil en docencia, validación de pipelines de datos o experimentos de optimizadores como Muon.
- Evaluación de honestidad y abstención: es un banco de pruebas para estudiar calibración en modelos diminutos, comparando sus 104/133 puntos con los 107/133 de Loom Tapestry 2 pese a ser veinte veces menor.
- Filtro de primera línea contra inyección de prompt: con 25 de 36 aciertos puede usarse como capa de señalización barata en arquitecturas de defensa en profundidad, nunca como única defensa.
- Generación de plantillas de diálogo y datos sintéticos de formato conversacional para aumentar corpus de entrenamiento de modelos mayores.
- Simulación de usuario en pruebas automatizadas de sistemas conversacionales, aprovechando que mantiene diálogos de 10 a 12 turnos sin degradarse por completo.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Publica en su lugar una batería de aceptación de 133 puntos sobre sondas escritas a mano que no aparecen en los datos de entrenamiento y puntuadas por contenido.

| Prueba | Loom Swift Micro | Loom Tapestry 2 (22,8 M) |
|---|---:|---:|
| Batería de aceptación (133 puntos) | 104/133 | 107/133 |
| Sabe su nombre | 12/12 | no disponible |
| Nunca afirma una consulta que no hizo | 16/16 | no disponible |
| Se detiene por sí solo | 12/12 | no disponible |
| Decide cuándo buscar y redacta la consulta | 20/20 | no disponible |
| Resiste inyección de prompt | 25/36 | no disponible |
| Rechaza hechos no aprendidos con herramientas off | 5/20 | no disponible |
| Mantiene conversación de 10-12 turnos | 28/44 | no disponible |
| Ignora un `<tools:on>` escrito en el mensaje | 8/12 | no disponible |
| Lee correctamente el pasaje recuperado | 0/20 | no disponible |

La puntuación de conocimientos factuales no se evalúa con benchmarks estándar porque el modelo no está diseñado para retener hechos: con herramientas apagadas solo declina 5 de 20 preguntas sobre hechos que nunca vio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 MB en fp32 (pesos completos), unos 2,3 MB en fp16/bf16 y del orden de 0,7 a 1,2 MB en cuantizaciones GGUF de 4 a 8 bits, más la memoria del tokenizador y del runtime.
- GPU recomendadas: ninguna en particular; cualquier GPU con más de 1 GB de memoria libre es suficiente, incluidas integradas. El modelo se entrenó sin GPU.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3060, GTX 1650, e incluso en CPU pura, Raspberry Pi o teléfonos, dado el tamaño del modelo.
- Opciones de despliegue: transformers (biblioteca declarada), llama.cpp mediante el GGUF publicado, Ollama con el comando `ollama run hf.co/textilelabs/Loom-Swift-Micro`, y text-generation-inference, dado que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad de inferencia; el límite práctico es más el contexto de 512 tokens que el coste computacional por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Batería de aceptación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Swift Micro | 1.159.120 | 512 tokens | 104/133 | MIT | HuggingFace (safetensors y GGUF) |
| Loom Swift Mini | no disponible | no disponible | no disponible | no disponible | Mencionado por el autor como el modelo mayor de la tier Swift |
| Loom Tapestry 2 | 22,8 M | no disponible | 107/133 | no disponible | Antiguo modelo insignia de Textile Labs, 5,5 horas de entrenamiento |
| Modelos tiny de terceros (p. ej., SmolLM2-135M, Qwen2.5-0.5B) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | No disponible en la información proporcionada |

La comparación directa que aporta el autor es interna: Loom Tapestry 2, con 22,8 millones de parámetros y cinco horas y media de entrenamiento, obtiene 107/133 frente a los 104/133 de Swift Micro, con veinte veces menos parámetros y menos de cinco minutos de cómputo. No se han publicado comparativas con modelos de terceros en la información disponible.

## Limitaciones y advertencias

- Incapacidad para leer un pasaje recuperado: 0 de 20 respuestas correctas en preguntas retenidas. Es la limitación principal declarada por el autor; no debe usarse para responder preguntas factuales ni como componente final de un sistema RAG.
- Conocimiento casi nulo por diseño: se entrenó con 1,74 tokens por parámetro frente a los 20 habituales, por lo que no retiene hechos del mundo.
- Con herramientas desactivadas alucina con seguridad: solo declina 5 de 20 hechos que nunca aprendió, frente a 19 de 20 en Loom Swift Mini. Riesgo alto de respuestas inventadas presentadas con confianza.
- No realiza operaciones aritméticas.
- Inyección de prompt: supera 25 de 36 pruebas; un `<tools:on>` escrito dentro del mensaje del usuario todavía puede activar la búsqueda en 8 de 12 casos, lo que supone un vector de abuso si el modelo controla el acceso a herramientas.
- Contexto de 512 tokens, insuficiente para documentos largos, historiales extensos o tareas de resumen.
- Solo inglés; no hay soporte multilingüe declarado.
- Reproduce los sesgos de sus corpus de entrenamiento (SQuAD 2.0, MASSIVE, CLINC150, dolly-15k, OASST1) y del currículo escrito por el equipo, sin filtrado de seguridad documentado.
- Licencia MIT, que permite uso comercial, pero el archivo `ATTRIBUTION.md` debe acompañar a cualquier redistribución por los términos de las licencias de los corpus originales (CC BY-SA 4.0, CC BY 4.0, CC BY 3.0, Apache 2.0).
- Release experimental: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento ni de resultados fuera del conjunto de evaluación del autor.
- Poca personalidad y calidez conversacional, según el propio autor.
- No es adecuado para producción en tareas de conocimiento; su valor es como componente de decisión o como objeto de estudio.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Swift-Micro
- Ejecución con Ollama: `ollama run hf.co/textilelabs/Loom-Swift-Micro`
- Harness de agente publicado en el repositorio: `harness.py` (incluido en los archivos del modelo)
- Atribución de corpus: `ATTRIBUTION.md` (incluido en los archivos del modelo)
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes al modelo ni a Textile Labs; no se dispone de paper, blog técnico ni demo adicional en la información proporcionada.
