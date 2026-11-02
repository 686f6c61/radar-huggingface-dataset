# temaq-org/Tema_Q-X8-Thinking

## Resumen

Tema_Q-X8-Thinking (天馬求) es un modelo de lenguaje de gran escala orientado a aplicaciones de agente, desarrollado por temaq-org como un ajuste fino (finetune) del modelo Sage-A1.5 de InternScience. Con 35.951.822.704 parámetros totales según los pesos en safetensors (~35,9 mil millones) y una arquitectura etiquetada como `qwen3_5_moe`, se distribuye en formato safetensors con un repositorio de 71,9 GB. La model card lo presenta explícitamente como un modelo "uncensored" / "unfiltered", diseñado para responder a prompts que los modelos estándar rechazan o tratan con reservas.

El modelo se posiciona para flujos de razonamiento avanzado cuando se combina con el agente Tema_Q Agent, un repositorio separado del mismo autor. Soporta tres idiomas declarados: japonés, inglés y chino. La información pública disponible es muy limitada: no hay resultados de benchmarks, no se detalla la composición del dataset de entrenamiento ni el proceso de alineación, y la licencia no está especificada más allá de la referencia a la licencia del modelo base.

Su relevancia actual es acotada pero concreta: cubre el nicho de modelos de ~36B parámetros con etiqueta MoE, sin censura declarada y con soporte para japonés, un idioma con menos oferta de modelos abiertos de este tamaño. No obstante, la ausencia de datos de evaluación y de licencia explícita limita seriamente su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con etiqueta `qwen3_5_moe` (MoE, según tag del repositorio) |
| Parámetros totales | 35.951.822.704 (~35,9 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | japonés (ja), inglés (en), chino (zh) |
| Licencia | no disponible (la model card indica que se rige por la licencia de Sage-A1.5, sin especificarla) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen 3.5, aunque no se especifican el número de expertos, el número de expertos activos por token ni la dimensión oculta. El modelo es un finetune del base InternScience/Sage-A1.5, del cual no se detalla la arquitectura interna en la información disponible. La model card no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado.

La única innovación declarada es el modo "Thinking" en el nombre del modelo y su integración con el agente Tema_Q Agent para razonamiento multi-paso. No se documentan mecanismos como decodificación especulativa, atención lineal o ventanas de contexto extendidas. Tampoco se detalla el proceso de "des-censura" aplicado respecto al modelo base, más allá de la declaración de que genera respuestas "más flexibles y útiles" ante prompts difíciles.

## Capacidades

- Generación de texto conversacional e instruccional en japonés, inglés y chino.
- Razonamiento multi-paso orientado a agentes, con integración declarada con Tema_Q Agent.
- Modo "Thinking" (implícito en el nombre del modelo), sin documentación técnica sobre su funcionamiento.
- Generación sin filtros declarados ("uncensored", "non-censored", "unfiltered"), orientada a prompts que los modelos alineados rechazan.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de código, matemáticas o visión: no disponibles (no se documentan).
- Capacidades multilingües limitadas a los tres idiomas declarados; no se especifica cobertura adicional.

## Casos de uso

- Agentes autónomos de razonamiento multi-paso: el modelo está diseñado para operar junto con Tema_Q Agent, de modo que se usaría como motor de decisión en bucles de planificación y ejecución de tareas, aprovechando su orientación explícita a aplicaciones de agente.
- Asistentes conversacionales en japonés: es uno de los pocos modelos abiertos de ~36B parámetros con japonés declarado como idioma principal, adecuado para atención al usuario en ese mercado.
- Investigación sobre alineación y censura: al declararse "uncensored", sirve como objeto de estudio comparativo frente a modelos alineados, por ejemplo para medir tasas de rechazo y sesgos en distintos dominios.
- Generación de contenido creativo sin restricciones temáticas: útil en entornos controlados de escritura de ficción o guiones donde los filtros de seguridad de modelos comerciales interrumpen el flujo.
- Procesamiento de documentación técnica trilingüe (ja/en/zh): para resumen, traducción y extracción de información en pipelines internos que manejen esos tres idiomas.
- Experimentación en entornos de investigación con GPUs de centro de datos: su tamaño (~36B) permite desplegarlo en una o dos GPUs de 80 GB en precisión reducida, lo que lo hace viable para prototipos académicos.
- Evaluación de modelos base poco documentados: como finetune de Sage-A1.5, permite estudiar el efecto del ajuste fino sobre un base del que se publica poca información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de ~36B parámetros requiere aproximadamente 72 GB en FP16/BF16, ~36 GB en cuantización de 8 bits y ~18-22 GB en cuantización de 4 bits. Estos cálculos son estimaciones por número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar viabilidad en A100 80 GB, H100 80 GB o configuraciones multi-GPU; sin confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado. En cuantización de 4 bits podría aproximarse a los límites de una RTX 4090 (24 GB), pero no hay pesos cuantizados publicados ni confirmación de que la arquitectura MoE lo permita sin degradación significativa.
- Opciones de despliegue: no documentadas. El repositorio solo publica safetensors; no se ofrecen GGUF, AWQ ni GPTQ, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM o TGI serían las opciones naturales para safetensors, sin confirmación de compatibilidad con la arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Tema_Q-X8-Thinking | ~35,9B | no disponible | no disponible | ja, en, zh | Finetune de Sage-A1.5, sin benchmarks |
| Sage-A1.5 (InternScience) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen3.5 (familia referenciada por el tag) | no disponible | no disponible | no disponible | no disponible | Arquitectura referenciada en el tag `qwen3_5_moe`, sin datos concretos |

No se dispone de información suficiente sobre Sage-A1.5 ni sobre la variante concreta de Qwen 3.5 referenciada para establecer una comparativa cuantitativa fiable. Los datos de parámetros, contexto y rendimiento de los alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües, lo que impide verificar la calidad declarada.
- Licencia no especificada: la model card remite a la licencia de Sage-A1.5 sin indicarla, por lo que el uso comercial es jurídicamente incierto y no recomendable sin aclaración previa.
- Etiqueta "uncensored": implica un mayor riesgo de generar contenido dañino, sesgado o ilegal; la propia model card prohíbe usos discriminatorios, de acoso o violentos, pero no describe mecanismos técnicos de mitigación.
- Riesgo de alucinación: no documentado ni evaluado; sin datos de entrenamiento ni de alineación, no es posible estimar su fiabilidad factual.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar su uso en tareas de documento largo.
- Idiomas limitados: solo ja, en y zh declarados; el rendimiento en castellano no está soportado ni evaluado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Solo safetensors: sin cuantizaciones oficiales, el despliegue en hardware de consumo requiere trabajo adicional de conversión.
- Arquitectura MoE con parámetros activos no documentados: imposible estimar coste computacional real por token.
- La información de búsqueda web disponible no corresponde al modelo (resultados sobre empresas homónimas), por lo que no aporta enlaces técnicos verificables.

## Enlaces

- HuggingFace: https://huggingface.co/temaq-org/Tema_Q-X8-Thinking
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Repositorio del agente: https://github.com/ek15072809/Tema_Q-Agent
- Logo del modelo: https://huggingface.co/temaq-org/Tema_Q-X8-Thinking/resolve/main/Tema_Q-X-Logo.jpg
