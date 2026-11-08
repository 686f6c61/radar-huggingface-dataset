# Unluckkie/Quest-2B-IK-GGUF

## Resumen

Quest-2B-IK-GGUF es una suite de cuantizaciones GGUF del modelo base osunlp/QUEST-2B, un agente de investigación profunda ("deep research") de aproximadamente 1.880 millones de parámetros. La publica el usuario Unluckkie bajo licencia Apache 2.0 y está pensada específicamente para el motor de inferencia ik_llama.cpp, no para llama.cpp estándar. El modelo base lo desarrolla el grupo OSUNLP y está orientado a tareas agénticas: razonamiento multi-paso, llamadas a herramientas y síntesis de información.

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de cuantización: el autor aplica una imatrix personalizada de 500 fragmentos calibrada sobre filosofía clásica, papers académicos y conocimiento general, fuerza la cabeza de salida a Q8_0 para preservar el formato JSON de las tool calls y ofrece variantes con repacking de filas (R4) y trellis (KT). Según la model card, estas técnicas producen hasta un 1,8x de aceleración en el prefill sin pérdida de calidad.

El modelo está pensado para hardware modesto: el F16 ocupa unos 3,8 GB y las cuantizaciones van de 1,1 GB a 1,6 GB, lo que permite ejecutarlo en portátiles con 8 GB de RAM. Es un modelo de razonamiento que genera un monólogo interno extenso dentro de etiquetas `<|ifm|think>` antes de responder, lo que condiciona fuertemente su despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base osunlp/QUEST-2B; el repo solo documenta el formato GGUF) |
| Parámetros totales | 1.881.825.088 (~1,88B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa 32.768 tokens con KV cache cuantizada |
| Tipos de cuantización | IQ6_K (~1,6 GB), IQ5_KS_R4 (~1,3 GB), IQ4_KS_R4 (~1,1 GB), IQ4_KT (~1,1 GB); cabeza de salida forzada a Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tensores IQ*_KT e IQ*_R4, exclusivos de ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card del repositorio se centra exclusivamente en el proceso de cuantización y no detalla el tipo de transformer, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Lo que sí se documenta es que Quest-2B es un modelo de razonamiento con un bloque de pensamiento interno delimitado por `<|ifm|think>`, lo que sugiere un entrenamiento orientado a cadenas de pensamiento largas y uso agéntico.

La innovación técnica de esta ficha reside en el pipeline de cuantización. Se construyó un fichero de calibración imatrix de 223 MB a partir de 500 fragmentos mezclados de filosofía clásica, artículos académicos y conocimiento general, con el objetivo de proteger las rutas neuronales implicadas en la síntesis profunda. Las variantes `_R4` intercalan los pesos en grupos de cuatro filas para acelerar el prefill unas 1,8 veces sin degradar la calidad, y la variante `IQ4_KT` emplea un diseño trellis basado en enteros que prioriza la velocidad de procesamiento de prompt y la comprensión lectora.

## Capacidades

- Generación de texto con razonamiento explícito: produce un monólogo interno dentro de `<|ifm|think>` antes de la respuesta final.
- Tool calling y function calling: la cabeza de salida en Q8_0 preserva el formato JSON necesario para invocar herramientas.
- Comportamiento agéntico multi-paso: según la model card, es capaz de abstenerse de responder cuando no sabe algo y disparar una búsqueda web en su lugar.
- Síntesis y extracción de información: en las pruebas del autor, procesó un extracto de 850 palabras de *On Liberty* de John Stuart Mill, extrajo citas exactas y generó una tabla comparativa dialéctica.
- Comprensión lectora de textos densos (filosofía, papers académicos).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- No se documentan capacidades de visión, audio ni modo thinking configurable más allá del bloque `<|ifm|think>`.

## Casos de uso

- Agente de investigación profunda: el modelo encadena razonamiento y tool calls para consultar fuentes externas (por ejemplo, búsqueda web) y sintetizar los resultados, con la ventaja de que su tamaño de 1,1-1,6 GB permite desplegarlo en paralelo con otros servicios en la misma máquina.
- Asistente de revisión bibliográfica: dado que la imatrix se calibró sobre papers académicos y filosofía, es adecuado para extraer citas literales y construir tablas comparativas de argumentos, como demuestra la prueba con *On Liberty*.
- Automatización de atención al cliente con abstención controlada: su capacidad documentada de rechazar responder ante información que desconoce y derivar a una tool call lo hace útil en flujos donde la alucinación es costosa, siempre que se acepte el coste en tokens del bloque de pensamiento.
- Backend de agentes en pipelines de CI/CD o RAG: al exponerse mediante `llama-server` con `--jinja` y endpoint compatible con OpenAI (`/v1/chat/completions`), puede integrarse como paso de razonamiento en flujos automatizados de extracción y verificación.
- Prototipado en portátiles de 8 GB: con IQ4_KT o IQ4_KS_R4 y KV cache cuantizada a q8_0, se puede mantener una ventana de 32K tokens en hardware de consumo, lo que facilita el desarrollo local de agentes sin GPU dedicada.
- Educación y divulgación filosófica: la calibración específica en textos clásicos permite generar resúmenes dialécticos (tesis, antítesis, síntesis) sobre material denso con temperatura baja (0,3 en el ejemplo del autor).
- Evaluación de técnicas de cuantización: como repositorio de referencia para comparar IQ4_KT frente a IQ4_KS_R4 en tareas agénticas reales, no solo en perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta dos pruebas cualitativas ("Mindfork Tests"): la prueba de filosofía con *On Liberty* y la prueba de abstención con tool calling ante una proyección económica del IMF para 2029. No se aportan cifras de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: IQ4_KS_R4 e IQ4_KT ~1,1 GB; IQ5_KS_R4 ~1,3 GB; IQ6_K ~1,6 GB; F16 ~3,8 GB. Hay que sumar la KV cache, que con contexto de 32K y cuantización q8_0 sigue siendo contenida pero no despreciable.
- GPU recomendadas: no se especifican. El autor plantea explícitamente un escenario de portátil con 8 GB de RAM, por lo que el modelo cabe en GPUs de consumo con 4-8 GB de VRAM (por ejemplo, RTX 3050/3060) y en CPU.
- Cabe en GPU de consumo: sí, con cualquiera de las cuantizaciones ofrecidas.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (build de ikawrakow). No carga en llama.cpp estándar, Ollama ni LM Studio. Se debe usar `llama-server` con `--jinja`; el autor advierte explícitamente contra `llama-cli -f`.
- Latencia y throughput: no se publican cifras absolutas. El autor afirma una aceleración de ~1,8x en prefill para las variantes `_R4` y un "massive boost" de velocidad de prompt processing para `IQ4_KT`, sin datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Quest-2B-IK-GGUF (este) | ~1,88B | no disponible (ejemplo con 32K) | GGUF solo ik_llama.cpp | Apache 2.0 | Cuantizaciones custom con imatrix de 500 fragmentos |
| osunlp/QUEST-2B (base) | ~1,88B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo original sin cuantizar |
| Unluckkie/K2-Horizon-3.7B-IK-GGUF | 3,7B | no disponible | GGUF solo ik_llama.cpp | no disponible | Misma familia de cuantizaciones del mismo autor, mayor tamaño |
| Unluckkie/MiniCPM5-2B-IK-GGUF | ~3B (según la card) | no disponible | GGUF solo ik_llama.cpp | no disponible | Otra cuantización del mismo autor, orientada a generación de texto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dependencia dura de `ik_llama.cpp`: los tensores `IQ*_KT` e `IQ*_R4` no cargan en llama.cpp estándar, Ollama ni LM Studio, lo que limita la portabilidad y obliga a compilar un motor específico.
- Modelo de razonamiento verboso: el bloque `<|ifm|think>` consume muchos tokens antes de la respuesta; el autor advierte que puede pensar 1.000 tokens antes de invocar una herramienta, lo que encarece la latencia y el consumo de contexto en producción.
- Contexto limitado en la práctica: aunque el ejemplo usa 32K, el pensamiento interno reduce el espacio útil para el prompt y la respuesta; no se documenta la ventana nativa real del modelo base.
- Solo inglés: el campo `language` de la model card restringe el soporte a `en`.
- Riesgo de alucinación: mitigado parcialmente por la prueba de abstención, pero es un modelo de 1,88B y no hay benchmarks que cuantifiquen su fiabilidad; las afirmaciones de la model card son cualitativas y del propio autor de la cuantización.
- Sesgos: no documentados. La calibración imatrix sobre filosofía clásica occidental y papers académicos puede sesgar el estilo y el vocabulario hacia ese dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base osunlp/QUEST-2B, que es la que rige realmente sobre los pesos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-08), por lo que no hay validación comunitaria independiente.
- El repo ocupa 8,8 GB, muy por encima de la suma de las cuantizaciones listadas, probablemente por incluir múltiples variantes y ficheros auxiliares.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/Quest-2B-IK-GGUF
- Modelo base: https://huggingface.co/osunlp/QUEST-2B
- Motor de cuantización ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Repositorio relacionado del mismo autor (K2-Horizon-3.7B): https://huggingface.co/Unluckkie/K2-Horizon-3.7B-IK-GGUF
- Repositorio relacionado del mismo autor (MiniCPM5-2B): https://huggingface.co/Unluckkie/MiniCPM5-2B-IK-GGUF
