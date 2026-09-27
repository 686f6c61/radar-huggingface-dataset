# wulezhi/deepseek-r1-32b-buddhist

## Resumen

DeepSeek-R1-32B-Buddhist es un ajuste fino supervisado (SFT) del modelo DeepSeek-R1-Distill-Qwen-32B, orientado al dominio de los textos canónicos budistas en chino. Lo publica el usuario wulezhi en Hugging Face y se distribuye exclusivamente como un único archivo GGUF cuantizado en Q4_K_M de 19,85 GB, pensado para su carga con llama.cpp u Ollama. El repositorio acumula 0 descargas y 0 likes y no declara licencia.

El modelo conserva la arquitectura Qwen2 del base: 64 capas, dimensión oculta 5120, atención con GQA de 40 cabezas de consulta y 8 de clave/valor, contexto nativo de 131.072 tokens y 32.763.876.352 parámetros totales. Al proceder de la familia R1 destilada, genera cadenas de razonamiento dentro del propio texto, que llama.cpp puede separar a `reasoning_content` mediante `--reasoning-format`.

Su relevancia es acotada y de nicho: sirve como caso práctico de especialización por SFT de un modelo de razonamiento destilado sobre un corpus doctrinal muy concreto, y como alternativa comparable a Qwen3.8-27B-Buddhist, con el que comparte exactamente el mismo corpus de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Qwen2 (metadatos GGUF: `qwen2`) |
| Parámetros totales | 32.763.876.352 (~32,8 mil millones) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) nativo |
| Tipos de cuantización | Q4_K_M (único formato publicado) |
| Idiomas soportados | no disponible (el corpus de ajuste es íntegramente en chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | DeepSeek-R1-Distill-Qwen-32B |
| Capas | 64 |
| Dimensión oculta | 5120 |
| Atención | GQA, 40 cabezas de consulta / 8 cabezas KV |
| Datos de ajuste | 35.841 ejemplos SFT en chino (dominio budista) |
| Tamaño del repositorio | 19,9 GB |
| Archivo principal | `gguf/Q4/DeepSeek-R1-32B-Buddhist-Q4_K_M.gguf` (19,85 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder denso con normalización previa y atención GQA. Los metadatos del GGUF confirman 64 capas, anchura de 5120 y una relación de compartición de 40 cabezas de consulta frente a 8 cabezas de clave/valor, lo que reduce el coste del KV cache. El contexto nativo es de 131.072 tokens, coherente con la familia Qwen2 sobre la que se destiló DeepSeek-R1.

El ajuste se realizó por supervisión sobre 35.841 ejemplos en chino extraídos de dos fuentes: el Foguang Buddhist Dictionary (佛光大辞典) y la Encyclopedia of Chinese Buddhism (中华佛教大百科全书). Los ejemplos cubren tres tareas: anotación estructural de textos (科判注解), preguntas y respuestas sobre doctrina (义理问答) y exégesis de sutras (经文释义). El mismo corpus se utilizó para Qwen3.8-27B-Buddhist, lo que permite comparar ambos ajustes. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si hubo fases de RLHF o DPO adicionales.

La particularidad técnica heredada es la emisión de cadenas de razonamiento dentro de la respuesta: el modelo reproduce el comportamiento de la familia R1 y expone su traza de pensamiento en el texto generado, algo que el servidor de llama.cpp puede reenrutar al campo `reasoning_content`.

## Capacidades

- Generación de texto conversacional multi-turno en chino, con registro doctrinal y terminología budista especializada.
- Razonamiento explícito con cadena de pensamiento heredada de DeepSeek-R1, útil en preguntas que requieren varios pasos de inferencia doctrinal.
- Respuestas de tipo enciclopédico sobre doctrina, escuelas, conceptos y biografías del ámbito budista chino.
- Anotación estructural y segmentación de sutras (科判), es decir, organización jerárquica del texto canónico.
- Exégesis y comentario de pasajes de difícil interpretación.
- Manejo de contextos muy largos (hasta 131.072 tokens), suficiente para procesar sutras completos o antologías extensas en una sola pasada.
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con APIs de tipo endpoints desplegadas sobre el repositorio.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no documentado. La cadena de pensamiento existe, pero no hay evidencia de entrenamiento en uso de herramientas.
- Capacidades multilingües: no documentadas. El base es multilingüe, pero no hay evaluación que confirme que el ajuste las preserva.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de estudio de textos budistas: el modelo responde dudas doctrinales en chino con la terminología de las fuentes con las que fue ajustado, lo que lo hace adecuado para plataformas de formación de practicantes o estudiantes de estudios budistas.
- Exégesis de sutras largos en una sola pasada: con 131.072 tokens de contexto se puede cargar un sutra completo junto con su comentario y pedir un análisis cruzado sin trocear el documento.
- Anotación estructural automatizada (科判): generación de esquemas jerárquicos del texto canónico que después un editor humano revisa, lo que reduce el trabajo manual de catalogación.
- Construcción de bases de conocimiento y RAG: el modelo actúa como generador final sobre un índice vectorial de canon budista, aprovechando su registro especializado para redactar respuestas fundamentadas en los fragmentos recuperados.
- Traducción asistida de chino clásico a chino moderno o a otras lenguas: útil como primer borrador en proyectos editoriales, siempre con revisión humana por el riesgo de distorsión doctrinal.
- Atención a comunidades religiosas en línea: respuestas multi-turno con contexto largo para hilos de consulta extensos, manteniendo coherencia terminológica a lo largo de la conversación.
- Despliegue local con requisitos de privacidad: al ser GGUF, se ejecuta íntegramente en infraestructura propia con llama.cpp u Ollama, sin enviar consultas a servicios externos.
- Investigación sobre especialización de dominio: sirve como punto de comparación controlada frente a Qwen3.8-27B-Buddhist, al compartir corpus, para estudiar cómo varía el comportamiento entre un base de 32B destilado de R1 y un base de 27B.
- Generación de material didáctico: resúmenes, glosarios y fichas de conceptos a partir de los diccionarios fuente, con la traza de razonamiento visible para auditar cómo llegó a cada conclusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ni métricas específicas del dominio budista, ni comparaciones cuantitativas con el modelo base o con Qwen3.8-27B-Buddhist.

## Requisitos de hardware

- Pesos en Q4_K_M: 19,85 GB. Es el mínimo imprescindible en VRAM si se quiere el modelo completamente en GPU.
- KV cache (estimación calculada a partir de los metadatos de arquitectura: 2 × 8 cabezas KV × 128 dimensiones por cabeza × 64 capas = 256 KiB por token en FP16): unos 8 GiB de KV cache para 32K tokens de contexto y unos 32 GiB para los 131.072 tokens completos. Con cuantización del KV cache a Q8 esas cifras se reducen aproximadamente a la mitad.
- El autor indica que dos tarjetas con 44 GB en total permiten cargar el modelo completo en GPU.
- GPU de consumo: una RTX 3090 o RTX 4090 de 24 GB puede alojar los pesos y un contexto corto, pero para contexto largo conviene repartir capas entre GPU y CPU vía `-ngl` o reducir la ventana efectiva.
- GPU recomendadas para contexto completo: 2× RTX 4090 (48 GB), 2× A6000, L40S, A100 40 GB o 80 GB, H100.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y cualquier runtime compatible con GGUF. El soporte en vLLM y TGI para GGUF no está documentado para este repositorio.
- Comando de referencia del autor: `llama-server -m gguf/Q4/DeepSeek-R1-32B-Buddhist-Q4_K_M.gguf -c 131072 -ngl 99 --host 0.0.0.0 --port 8080`.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a información pública de sus respectivos modelos base; los de este ajuste provienen de la información disponible en el repositorio.

| Modelo | Parámetros | Contexto | Formato publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-32B-Buddhist (este) | 32,8 mil millones | 131.072 | GGUF Q4_K_M | no disponible | 0 descargas, 0 likes |
| DeepSeek-R1-Distill-Qwen-32B (base) | 32,8 mil millones | 131.072 | safetensors y GGUF | MIT, según la ficha pública del modelo base | Ampliamente distribuido |
| Qwen2.5-32B-Instruct | ~32,5 mil millones | 131.072 | safetensors y GGUF | Apache 2.0 | Ampliamente distribuido |
| Qwen3.8-27B-Buddhist | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card como ajuste con corpus compartido |

La comparación relevante es con el modelo base: este ajuste añade especialización doctrinal en chino a costa de no publicar versiones en precisión completa, no declarar licencia y no aportar ninguna evaluación que permita cuantificar la mejora en el dominio.

## Limitaciones y advertencias

- Licencia no declarada. Aunque el modelo base del que deriva se distribuye bajo MIT según su ficha pública, el autor no especifica términos para este ajuste, por lo que su uso comercial queda en un limbo legal.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluación publicada.
- Riesgo elevado de alucinación en un dominio donde la exactitud de citas y atribuciones es crítica. Es esperable que invente referencias canónicas, numeraciones de sutras o atribuciones de escuela.
- Sesgo de fuente: el ajuste se apoya en dos obras de referencia concretas (Foguang Buddhist Dictionary y Encyclopedia of Chinese Buddhism). La perspectiva doctrinal que transmiten condiciona las respuestas, especialmente en cuestiones donde las escuelas budistas discrepan.
- Cobertura idiomática limitada en la práctica: el corpus de SFT es exclusivamente en chino. No hay evidencia de que el modelo mantenga calidad equivalente en otros idiomas pese a heredar un base multilingüe.
- La cadena de pensamiento se emite dentro del texto salvo que el runtime la separe. En integraciones que esperan solo la respuesta final, esto puede romper el parseo o inflar el consumo de tokens.
- Cuantización única: solo existe Q4_K_M. No hay versión en FP16, BF16 ni cuantizaciones de mayor precisión, lo que impide medir la pérdida introducida por la cuantización ni usarlo en flujos que exijan pesos completos.
- Contexto largo con coste alto: los 131.072 tokens son nominales; el KV cache en FP16 para esa ventana ronda los 32 GiB, lo que en la práctica obliga a hardware de gama alta o a cuantizar el cache.
- No hay información sobre el proceso de entrenamiento (número de épicas, tasa de aprendizaje, posible sobreajuste al corpus). Con 35.841 ejemplos sobre un modelo de 32B, el riesgo de sobreajuste y de degradación de capacidades generales es real, pero no está medido.
- Fechas de creación y actualización del repositorio (2026) incoherentes con el calendario habitual de publicación, lo que sugiere que puede tratarse de un repositorio de prueba o con metadatos mal cumplimentados.
- No hay garantía de que se mantenga el repositorio ni de soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wulezhi/deepseek-r1-32b-buddhist
- Archivo de pesos: `gguf/Q4/DeepSeek-R1-32B-Buddhist-Q4_K_M.gguf` dentro del repositorio anterior
- Modelo base referenciado (DeepSeek-R1-Distill-Qwen-32B): no se proporciona enlace en la información disponible
- Modelo hermano mencionado (Qwen3.8-27B-Buddhist): no se proporciona enlace en la información disponible
- Paper, blog o repositorio de entrenamiento: no disponible
