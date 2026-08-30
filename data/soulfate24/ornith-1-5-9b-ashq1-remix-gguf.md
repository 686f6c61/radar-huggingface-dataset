# Soulfate24/Ornith-1.5-9B-ASHQ1-Remix-GGUF

## Resumen

Ornith-1.5-9B-ASHQ1-Remix-GGUF es una versión cuantizada en formato GGUF del modelo Ornith-1.5-9B, desarrollado por ornith-ai. El modelo original es un transformer denso de 9.197 millones de parámetros orientado a tareas de razonamiento, generación de código y uso como agente, entrenado mediante un bucle de auto-mejora que combina propuesta de tareas, generación de scaffolds y refuerzo con rollouts. Esta cuantización, realizada por Soulfate24, emplea la técnica ASHQ1-Remix, una cuantización consciente de activaciones con doble cuantización, que ofrece siete niveles de compresión (desde 24% hasta 48% del tamaño original) para adaptarse a distintos entornos de hardware.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de 9B en GPUs de consumo o incluso en CPU, manteniendo un equilibrio entre tamaño y calidad. La licencia MIT facilita su uso comercial sin restricciones, y al estar en formato GGUF es compatible con motores de inferencia como llama.cpp, Ollama o LM Studio. El modelo base incorpora un modo de razonamiento explícito (thinking) y soporte para tool calling, lo que lo hace adecuado para pipelines de agentes y automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica detalle de capas o atención) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ASHQ1-Remix: 7 niveles (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parámetros, entrenado por ornith-ai con un enfoque de auto-mejora denominado self-scaffolding. Según la documentación oficial, el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para entrenamiento por refuerzo, creando un ciclo continuo de mejora. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La cuantización ASHQ1-Remix aplicada por Soulfate24 es una variante de cuantización consciente de activaciones (activation-aware) con doble cuantización. Se validó en seis familias de modelos y ofrece una escalera de siete niveles de compresión, cada uno con métricas de perplejidad (PPL) y divergencia KL medidas sobre el conjunto wiki.test.raw. La cuantización mantiene la representación BF16 nativa como referencia y soporta la metodología AutoRound con límites de saturación explícitos.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base abre cada turno del asistente con un bloque de pensamiento (thinking) antes de la respuesta final, lo que permite razonamiento encadenado.
- Generación de código: entrenado específicamente para tareas de programación, con buen desempeño en benchmarks de terminal y agentes.
- Tool calling: el modelo base emite bloques `<tool_call>` que pueden ser parseados como llamadas a funciones estilo OpenAI.
- Soporte para agentes: diseñado para integrarse en flujos multi-paso donde el modelo decide qué herramientas invocar.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo de razonamiento explícito: se puede configurar un parser para separar la cadena de pensamiento en un campo `reasoning_content` independiente.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar código, explicar fragmentos y refactorizar, aprovechando su modo de razonamiento para tareas complejas. Su tamaño de 9B permite ejecutarlo localmente en estaciones de trabajo con GPU de 8-12 GB.
- Agente de automatización de tareas: gracias al tool calling, puede integrarse en pipelines que interactúan con APIs, bases de datos o sistemas de archivos, ejecutando acciones de forma autónoma.
- Chatbot técnico de soporte: con su capacidad de razonamiento y generación de respuestas detalladas, puede atender consultas técnicas multi-turno, aunque la longitud de contexto no está documentada.
- Generación de documentación técnica: puede resumir código, generar comentarios y redactar guías, apoyándose en su entrenamiento orientado a código.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia MIT, es adecuado para experimentar sin costes de API ni restricciones de uso.
- Despliegue en edge o móvil: la versión cuantizada Mini o Nano (5,4 GB y 4,7 GB respectivamente) puede ejecutarse en dispositivos con memoria limitada, como portátiles o incluso teléfonos de gama alta mediante convertidores a formatos móviles.

## Benchmarks y rendimiento

La model card de la cuantización proporciona métricas de calidad de la compresión, medidas sobre el conjunto wiki.test.raw con referencia simétrica FA-auto. No se han publicado benchmarks del modelo base en la información disponible, aunque fuentes externas citan valores de 47.0 en Terminal-Bench 2.1 y 70.6 en una métrica no especificada (probablemente HumanEval o similar), pero no se incluyen aquí por falta de verificación.

| Nivel de cuantizacion | Tamano (MiB) | PPL | KLD | RMS Δp | top-p |
|---|---|---|---|---|---|
| Fidelity-48pc | 9464 | 9.5239 | 0.0081 | 2.43% | 97.6% |
| Precision-42pc | 8414 | 9.4347 | 0.0132 | 3.04% | 96.6% |
| Quality-36pc | 6330 | 9.3692 | 0.0366 | 5.00% | 93.3% |
| Compact-33pc | 5803 | 9.6043 | 0.0517 | 5.91% | 91.6% |
| Mini-30pc | 5385 | 9.8564 | 0.0649 | 6.67% | 90.3% |
| Nano-27pc | 4750 | 10.1061 | 0.0907 | 7.90% | 87.8% |
| Pico-24pc | 4389 | 10.1078 | 0.1309 | 9.63% | 85.0% |

Estos valores indican que la perplejidad se mantiene relativamente estable hasta el nivel Mini, con degradación más pronunciada en los niveles Nano y Pico.

## Requisitos de hardware

- VRAM estimada: entre 4,4 GB (Pico) y 9,5 GB (Fidelity) según el nivel de cuantización elegido.
- GPUs recomendadas: para el nivel Fidelity se necesita una GPU con al menos 10 GB de VRAM (por ejemplo, RTX 3080, RTX 4070 Ti o superior). Los niveles Mini y Nano caben en GPUs de 6-8 GB como RTX 3060, RTX 4060 o incluso GTX 1660 Super con cuantización adicional.
- En CPU: los niveles más pequeños (Pico, Nano) pueden ejecutarse en CPU con 16 GB de RAM usando llama.cpp, aunque la velocidad será baja.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor que soporte GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia orientativa, un modelo de 9B cuantizado a 5 GB suele generar entre 10 y 30 tokens por segundo en una GPU de gama media (RTX 3060) con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9.2B | no disponible | MIT | safetensors | Razonamiento + código + agente |
| Llama 3.1 8B | 8.0B | 128K | Llama 3.1 | safetensors/GGUF | Texto general, multilingüe |
| Qwen 2.5 7B | 7.6B | 128K | Apache 2.0 | safetensors/GGUF | Texto, código, matemáticas |
| Gemma 2 9B | 9.2B | 8K | Gemma | safetensors/GGUF | Texto general |

El modelo base se posiciona como competidor directo de Llama 3.1 8B y Qwen 2.5 7B en tareas de código y agentes, aunque no se dispone de benchmarks comparativos verificados. Su ventaja principal es el modo de razonamiento explícito y la licencia MIT, que facilita la integración comercial. La cuantización ASHQ1-Remix ofrece más niveles de compresión que las cuantizaciones estándar (Q4_K_M, Q5_K_M), lo que permite ajustar el tamaño con mayor granularidad.

## Limitaciones y advertencias

- La longitud de contexto no está documentada, lo que puede ser un riesgo para aplicaciones que requieran ventanas largas.
- No se dispone de información sobre los idiomas soportados; es probable que el entrenamiento se haya centrado en inglés, aunque no se confirma.
- La cuantización introduce degradación de calidad, especialmente en los niveles Nano y Pico, con aumentos de perplejidad superiores al 5% respecto al modelo original.
- El modelo base puede presentar alucinaciones en tareas de razonamiento complejo, como cualquier modelo de su tamaño.
- Aunque la licencia es MIT, el uso de la cuantización ASHQ1-Remix puede tener restricciones adicionales si se utiliza la suite de AutoRound; se recomienda revisar los términos de esa herramienta.
- No se han publicado evaluaciones de sesgos o seguridad para este modelo, por lo que no es recomendable para aplicaciones sensibles sin una evaluación previa.
- El repositorio de la cuantización tiene 0 descargas y 0 likes, lo que sugiere que es una versión reciente o poco probada; se recomienda validar su comportamiento antes de usarla en producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Soulfate24/Ornith-1.5-9B-ASHQ1-Remix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Version MLX del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Blog oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web de Ornith AI: https://ornith.ai/
- Suite ASHQ1-Remix (referencia de la cuantización): https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-9b
