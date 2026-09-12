# sshalimov04/ru-legal-rag-edge-0.6b

## Resumen

ru-legal-rag-edge-0.6b es un modelo de generacion de texto de 596 049 920 parametros (unos 600 M), desarrollado por el usuario sshalimov04, especializado en responder preguntas sobre derecho ruso dentro de un pipeline de RAG (generacion aumentada por recuperacion). No es un modelo de proposito general: recibe una pregunta y cinco fragmentos normativos recuperados por un retriever y redacta una respuesta construida unicamente a partir de esos fragmentos, con citas del tipo `[КоАП РФ, ст. 14.3, ч. 12]`. Si los fragmentos no contienen la respuesta, esta entrenado para devolver exactamente la frase «В предоставленных документах ответа нет», lo que convierte la abstencion en una capacidad de primer nivel.

El modelo parte de Qwen/Qwen3-0.6B y se ha afinado por completo (full fine-tune) sobre 10 665 ejemplos sinteticos generados por un maestro Qwen3.8-27B-FP8 servido con vLLM. Su relevancia practica esta en el nicho edge: con ~600 M de parametros cabe en GPUs de consumo e incluso en navegador via WebGPU (el autor publica una demo), y sus metricas de citation precision (0.993) y faithfulness (0.935) con el reranker emparejado igualan practicamente a las del maestro de 27B en la misma tarea, a una fraccion del coste de inferencia.

El ecosistema es deliberadamente cerrado y modular: el modelo no busca documentos por si mismo, sino que depende de un retriever externo (por ejemplo BM25) y del re-ranker `sshalimov04/ru-reranker-edge-150m`. Su licencia Apache 2.0 y su formato safetensors facilitan la integracion, pero la model card insiste en que no constituye asesoramiento juridico y que el corpus es un corte temporal cuyas redacciones pueden haber cambiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen/Qwen3-0.6B (familia Qwen3) |
| Parametros totales | 596 049 920 (~600 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; las evaluaciones de latencia y calidad se realizan con contextos de 2K tokens |
| Tipos de cuantizacion | No disponible; el ejemplo de la model card carga los pesos en bfloat16 |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Tamano del repositorio | 1,2 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Modelo complementario | sshalimov04/ru-reranker-edge-150m (re-ranker) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B, un transformer denso decoder-only, reutilizado mediante un fine-tune completo (todos los pesos) sobre 10 665 ejemplos sinteticos. El proceso de generacion de datos es el habitual en destilacion: se alimenta al maestro Qwen3.8-27B-FP8, servido en un vLLM local, con la pregunta y el top-5 real del retriever como entrada, y se toma como objetivo la respuesta del maestro con citas. La perdida se calcula unicamente sobre la respuesta, no sobre el contexto, lo que concentra el aprendizaje en el formato de salida y en el anclaje a los fragmentos.

La innovacion principal es el tratamiento explicito de la abstencion: una parte de los ejemplos contiene deliberadamente contexto de otra pregunta o un corte sin el fragmento necesario, de modo que el maestro se niega a responder y el estudiante aprende ese mismo comportamiento. Esto se refleja en los resultados: la variante sin ejemplos de rechazo obtiene citation recall mas alta (0.886) pero una tasa de rechazo de 0.000 y un abstain accuracy de 0.000, mientras que la version final alcanza abstain accuracy de 1.000. La model card indica tambien que en la generacion se usa `enable_thinking=False` y que el sistema depende de un prompt de sistema obligatorio (la plantilla esta en `src/common.py` del repositorio del proyecto, sin URL explicita en la ficha).

## Capacidades

- Generacion de respuestas extractivas sobre textos normativos rusos, limitadas estrictamente al contexto proporcionado.
- Citacion estructurada de normas con el formato `[КоАП РФ, ст. 14.3, ч. 12]` para codigos, y con el titulo del acto para el resto de normas.
- Abstencion controlada: devuelve la frase fija «В предоставленных документах ответа нет» cuando el contexto no contiene la respuesta (abstain accuracy de 1.000 en la evaluacion con contexto sustituido).
- Formato conversacional con plantilla de chat (`apply_chat_template`) y soporte de rol de sistema.
- Uso como etapa final de un pipeline RAG: no recupera documentos, solo genera la respuesta a partir del top-5 que le entrega el retriever.
- Generacion determinista en el ejemplo publicado (`do_sample=False`), orientada a respuestas reproducibles.
- Capacidad multilingue: no disponible; el modelo esta entrenado y etiquetado solo para ruso.
- Tool calling, function calling, agentes multi-paso, vision, audio y modo thinking: no disponibles; la model card no los menciona y el ejemplo desactiva explicitamente el thinking.

## Casos de uso

- Asistente interno de consulta normativa para despachos y departamentos juridicos: el modelo recibe la pregunta del abogado mas los cinco fragmentos que devuelve el buscador corporativo y redacta una respuesta con la norma citada, lo que acelera la localizacion de la referencia aplicable sin sustituir la revision humana.
- Atencion al publico en portales de servicios legales: dado que la abstencion es fiable (abstain accuracy de 1.000 sobre 250 casos con contexto ajeno), el modelo puede responder solo cuando el corpus contiene la norma y derivar a un operador cuando no la encuentra.
- Verificacion de citas en documentos ya redactados: el sistema recupera el top-5 para cada afirmacion y comprueba si la cita propuesta aparece respaldada, aprovechando la citation precision de 0.993 con el reranker.
- Despliegue en navegador o en el puesto del usuario: el autor publica una demo con WebGPU en la que la busqueda sobre codigos, el ranking y la comprobacion de invenciones se ejecutan en la maquina del usuario, lo que permite tratar documentacion sensible sin enviarla a un servidor.
- Clasificacion de consultas con contexto insuficiente: gracias al bloque de entrenamiento con contextos erroneos, el modelo puede usarse como filtro para detectar preguntas que el corpus no cubre y enrutarlas a otra fuente.
- Prototipado rapido de pipelines RAG juridicos en ruso: al ser un modelo de 600 M con licencia Apache 2.0, sirve para validar recuperacion, prompting y formato de citas antes de escalar a un modelo mayor.
- Evaluacion comparativa de componentes de recuperacion: el mismo modelo y el mismo prompt permiten medir si un cambio en el retriever o en el re-ranker mejora citation recall o faithfulness, como muestran las filas BM25 frente a reranker de la model card.
- Generacion de borradores de fichas normativas internas: con el corpus de descripciones de casos ligadas a articulo y parte, el modelo nombra con precision la norma aplicable, que es justo la parte que el autor senala como mejor resuelta.

## Benchmarks y rendimiento

Calidad de respuesta evaluada sobre 525 casos (intervalos de confianza entre corchetes):

| Configuracion | n | Citation precision | Citation recall | Tasa de rechazo | Faithfulness |
|---|---|---|---|---|---|
| Estudiante 0.6B, sin contexto | 525 | 0.000 [0.000-0.000] | No disponible | 0.589 [0.545-0.632] | No disponible |
| Estudiante 0.6B + BM25 top-5 | 525 | 1.000 [1.000-1.000] | 0.565 [0.522-0.611] | 0.583 [0.539-0.625] | 0.926 [0.902-0.949] |
| Estudiante 0.6B + reranker top-5 | 525 | 0.993 [0.979-1.000] | 0.590 [0.536-0.647] | 0.581 [0.539-0.623] | 0.935 [0.911-0.955] |
| Maestro 27B + reranker top-5 | 525 | 0.990 [0.979-0.998] | 0.590 [0.541-0.641] | 0.587 [0.547-0.627] | 0.935 [0.920-0.951] |
| Qwen3-0.6B sin entrenar + reranker top-5 | 525 | 0.961 [0.914-0.996] | 0.177 [0.140-0.217] | 0.787 [0.750-0.823] | 0.742 [0.667-0.812] |
| Qwen2.5-0.5B, mismo SFT (400 pasos) | 525 | 0.994 [0.983-1.000] | 0.632 [0.581-0.687] | 0.539 [0.497-0.583] | 0.861 [0.832-0.887] |
| SmolLM2-135M, ruso + mismo SFT (400 pasos) | 525 | 1.000 [1.000-1.000] | 0.097 [0.066-0.128] | 0.596 [0.554-0.638] | 0.841 [0.811-0.872] |
| Estudiante 0.6B sin ejemplos de rechazo (400 pasos) | 525 | 0.946 [0.927-0.965] | 0.886 [0.852-0.917] | 0.000 [0.000-0.000] | 0.705 [0.672-0.735] |

Abstain accuracy (contexto sustituido por uno ajeno; la respuesta correcta es «no hay respuesta»):

| Configuracion | n | Tasa de rechazos correctos |
|---|---|---|
| Estudiante 0.6B | 250 | 1.000 [1.000-1.000] |
| Estudiante 0.6B sin ejemplos de rechazo | 250 | 0.000 [0.000-0.000] |
| Maestro 27B | 525 | 1.000 [1.000-1.000] |

Latencia medida en GB10 con contexto de 2K y batch 1:

| Sistema | TTFT (p50) | Tokens/s (p50) |
|---|---|---|
| student-0.6b (transformers) | 0.052 s | 67.5 |
| teacher-27b (vLLM) | 0.697 s | 13.5 |

El autor advierte que los dos valores de latencia no son directamente comparables porque el estudiante se ejecuta con `transformers` y el maestro con vLLM. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks academicos estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato publicado): en bfloat16 unos 1,2 GB de pesos mas cache KV y activaciones; en float32 unos 2,4 GB; en int8 unos 0,6 GB. El repositorio ocupa 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo en bfloat16 con margen para contextos de 2K. El autor reporta medidas en una GB10 (67,5 tokens/s p50 con `transformers`).
- Cabe en GPU de consumo: si, con amplia holgura en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares; tambien en iGPU o navegador mediante WebGPU, como demuestra la demo publicada.
- Opciones de despliegue: `transformers` (es el runtime usado en las mediciones), y por herencia del modelo base Qwen3-0.6B resulta candidato natural para llama.cpp, Ollama, TGI o vLLM, aunque la model card no confirma ni documenta estos caminos ni publica pesos GGUF.
- Latencia y throughput: TTFT p50 de 0,052 s y 67,5 tokens/s p50 en GB10, con contexto de 2K y batch 1.
- Requiere un re-ranker adicional (`sshalimov04/ru-reranker-edge-150m`) con `max_length=512` y un retriever externo; sin ellos el modelo no es funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Citation precision | Citation recall | Faithfulness | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ru-legal-rag-edge-0.6b (+ reranker) | ~600 M | No disponible (evaluado a 2K) | 0.993 | 0.590 | 0.935 | Apache 2.0 | HuggingFace, 0 descargas |
| Maestro 27B (+ reranker) | 27 000 M | No disponible | 0.990 | 0.590 | 0.935 | No disponible | Uso interno del autor como generador de datos |
| Qwen3-0.6B sin entrenar (+ reranker) | ~600 M | No disponible | 0.961 | 0.177 | 0.742 | Apache 2.0 (por el modelo base) | HuggingFace |
| Qwen2.5-0.5B con el mismo SFT | ~500 M | No disponible | 0.994 | 0.632 | 0.861 | No disponible | Solo medido en la evaluacion del autor |
| SmolLM2-135M adaptado al ruso con el mismo SFT | 135 M | No disponible | 1.000 | 0.097 | 0.841 | No disponible | Solo medido en la evaluacion del autor |

La comparacion mas informativa es contra el propio modelo base sin entrenar: la citation precision sube de 0.961 a 0.993 y, sobre todo, el citation recall pasa de 0.177 a 0.590 y la faithfulness de 0.742 a 0.935. Frente a Qwen2.5-0.5B con el mismo SFT, el estudiante de 0.6B obtiene mejor faithfulness (0.935 frente a 0.861) pero peor citation recall (0.590 frente a 0.632), lo que sugiere que el ajuste refuerza la fidelidad al contexto a costa de cubrir menos referencias.

## Limitaciones y advertencias

- No es asesoramiento juridico: la model card es explicita en que el modelo no da consejos ni evalua las perspectivas de un caso, solo parafrasea los documentos recuperados y los cita.
- Dependencia total del pipeline: sin retriever y sin re-ranker el modelo es inutil, porque no busca documentos por si mismo.
- Vigencia normativa no verificada: el corpus es un corte temporal y las redacciones pueden haber cambiado; el modelo no comprueba si una norma sigue en vigor.
- Errores del maestro heredados: los datos son sinteticos y generados por Qwen3.8-27B-FP8, por lo que los fallos del maestro se transmiten al estudiante.
- Evaluacion con juez de la misma familia: la faithfulness se mide con modelos del mismo linaje, lo que introduce un sesgo potencial. El autor lo mitiga con revision manual de 50 respuestas: su puntuacion media de faithfulness es 0.945 frente a 0.927 del juez, con coincidencia dentro de 0.25 en el 82% de los casos.
- Sobreabstencion: en una revision manual de 10 rechazos, 2 eran erroneos porque la respuesta si estaba en los documentos. El autor lo identifica como el principal defecto del modelo.
- Dos tipos de error adicionales detectados manualmente: el modelo a veces anade la formulacion de un articulo de memoria, que no aparece en el contexto, y confunde el numero de norma del texto del fragmento con el numero de su etiqueta.
- Corpus basado en descripciones de casos, no en el texto literal de los articulos: el modelo identifica bien la norma aplicable pero parafrasea peor su redaccion exacta.
- La fila «sin contexto» de la tabla de calidad no mide conocimiento juridico real, porque el enunciado del caso ya contiene el numero de articulo y el modelo se limita a reformular la pregunta.
- Idioma unico: solo ruso. No hay soporte declarado de castellano ni de otras lenguas.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes en HuggingFace, sin senales de validacion externa por parte de la comunidad.
- Licencia Apache 2.0, permisiva para uso comercial, pero la model card no ofrece garantias sobre la exactitud del contenido juridico generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sshalimov04/ru-legal-rag-edge-0.6b
- Re-ranker companero: https://huggingface.co/sshalimov04/ru-reranker-edge-150m
- Demo en navegador con WebGPU: https://huggingface.co/spaces/sshalimov04/ru-rag-browser
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto (mencionado en la model card como origen de `src/common.py`, sin URL explicita): no disponible
- Paper o publicacion tecnica: no disponible
- Otros enlaces relevantes encontrados en la busqueda web: no disponible (los resultados de busqueda recibidos no guardan relacion con el modelo)
