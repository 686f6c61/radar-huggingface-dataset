# tinyopsec/XT-Luna-1B-GGUF

## Resumen

XT-Luna-1B-GGUF es la versión cuantizada en formato GGUF de XT-Luna-1B, un ajuste fino (fine-tune) del modelo MiniCPM5-1B de OpenBMB orientado a comportamiento de asistente con uso de herramientas (tool calling) y énfasis en la moderación y la honestidad de las respuestas. Lo publica el usuario tinyopsec en Hugging Face bajo licencia AGPL-3.0, y el modelo base es XtrCom/XT-Luna-1B.

El modelo cuenta con 1.080.632.832 parámetros totales (aproximadamente 1,08 mil millones), lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia en CPU y GPUs de consumo. El repositorio incluye trece cuantizaciones distintas, desde F16 completa hasta Q2_K, generadas con llama.cpp, lo que permite ajustar el equilibrio entre precisión y consumo de memoria.

Su relevancia actual radica en dos factores: por un lado, la familia MiniCPM5 está diseñada para ofrecer capacidades de agente y tool calling en un tamaño reducido; por otro, el ajuste específico del autor busca que el modelo "se contenga" y sea honesto, es decir, que no invente llamadas a herramientas ni respuestas cuando no dispone de información suficiente. No obstante, la información pública disponible es muy limitada y no se han publicado especificaciones detalladas de contexto, entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en MiniCPM5-1B (detalles específicos no disponibles) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MiniCPM5-1B, un transformer denso de aproximadamente 1,08 mil millones de parámetros desarrollado por OpenBMB. XT-Luna-1B es un fine-tune de ese modelo base realizado por XtrCom, orientado a comportamiento de asistente con uso de herramientas y a la moderación (restraint/honesty). No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento.

La innovación declarada por el autor es el énfasis en el comportamiento "honesto": el modelo está ajustado para abstenerse de invocar herramientas o de generar respuestas cuando no cuenta con información suficiente, en lugar de alucinar. No se han publicado detalles técnicos sobre la metodología de ajuste, la decodificación especulativa ni mecanismos de atención especiales. Las cuantizaciones GGUF fueron generadas con llama.cpp a partir del modelo base en safetensors.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Tool calling / function calling: el modelo está específicamente ajustado para invocar herramientas externas.
- Comportamiento agéntico: soporte para flujos de razonamiento de varios pasos con uso de herramientas.
- Moderación y honestidad: ajustado para evitar llamadas a herramientas innecesarias o inventadas y para reconocer límites de conocimiento.
- Compatible con endpoints de tipo conversacional (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistentes de atención al cliente con herramientas: el modelo puede gestionar conversaciones multi-turno e invocar funciones de consulta (estado de pedido, base de conocimiento) con un comportamiento contenido que reduce llamadas erróneas a herramientas.
- Agentes ligeros en el borde (edge): al ser un modelo de ~1B parámetros cuantizado a 4 bits, puede desplegarse en dispositivos con recursos limitados para tareas de enrutamiento de intenciones y selección de herramientas.
- Automatización de flujos con function calling: integrable en pipelines donde el modelo decide qué API invocar y con qué parámetros, gracias a su ajuste específico para tool calling.
- Prototipado rápido de agentes: su tamaño reducido y su formato GGUF permiten iterar localmente con Ollama o llama.cpp sin infraestructura GPU dedicada.
- Filtrado y moderación de respuestas: el énfasis en honestidad lo hace adecuado para escenarios donde se prefiere una abstención explícita a una respuesta inventada, como asistentes de soporte técnico interno.
- Despliegue en entornos con CPU: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecución en CPU con requisitos de memoria moderados, útil para demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en F16; en torno a 1,1-1,3 GB en Q4_K_M; menos de 1 GB en Q2_K (estimaciones basadas en el tamaño de los ficheros y los parámetros del modelo).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para cuantizaciones de 4 bits (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para F16 se recomienda al menos 3-4 GB de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XT-Luna-1B-GGUF | ~1,08 B | No disponible | AGPL-3.0 | GGUF | Fine-tune de MiniCPM5-1B para tool calling y honestidad |
| MiniCPM5-1B (OpenBMB) | ~1,08 B | No disponible | No disponible en la información | safetensors | Modelo base; sin ajuste específico de agente |
| XT-Luna-1B (XtrCom) | ~1,08 B | No disponible | No disponible en la información | safetensors | Modelo base del fine-tune, antes de cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad objetiva.
- Riesgo de alucinación: aunque el ajuste busca reducirla, sigue siendo un modelo de ~1B parámetros y puede generar contenido incorrecto, especialmente en dominios especializados.
- Sesgos: no se han documentado evaluaciones de sesgo; al derivar de MiniCPM5-1B, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento en castellano no está verificado.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; el uso comercial en servicios en red puede obligar a liberar el código fuente del servicio que lo integra. Revisar implicaciones legales antes de producción.
- Modelo pequeño: su capacidad de razonamiento complejo y de contexto largo es limitada en comparación con modelos de mayor tamaño.
- Advertencia del autor: "Tool-using assistant model. Evaluate before use." Se recomienda evaluar exhaustivamente antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/XT-Luna-1B-GGUF
- Modelo base del fine-tune: https://huggingface.co/XtrCom/XT-Luna-1B
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
