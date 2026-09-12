# sshalimov04/ru-grounding-verifier-150m

## Resumen

ru-grounding-verifier-150m es un cross-encoder de 149.605.633 parámetros (≈150 M) entrenado para verificar si una afirmación concreta se deduce de un fragmento de documento. Lo desarrolla el usuario sshalimov04 y está construido sobre deepvk/RuModernBERT-base, con una cabeza de clasificación binaria (num_labels=1) que emite un único logit; la sigmoide de ese logit es la puntuación de confirmación, con umbral 0,5. El modelo está pensado para el tramo final de un pipeline RAG: una vez que el sistema ha redactado una respuesta, se descompone en afirmaciones y cada una se contrasta contra el fragmento recuperado para calcular la faithfulness del conjunto.

El problema que resuelve es de coste y de despliegue. Habitualmente la verificación se hace con un modelo-juez grande (por ejemplo Qwen3-27B) o con revisión humana, lo que consume segundos y gigabytes por respuesta y en producción suele acabar descartándose. Este verificador reporta 2,93 ms por afirmación y 341 afirmaciones por segundo en una GB10, con un coste de memoria que cabe en CPU. El autor lo describe como una destilación del juez en un cross-encoder, y no existen alternativas abiertas equivalentes para ruso: los modelos ingleses de la misma tarea no se transfieren bien.

El punto diferencial está en los negativos de entrenamiento. El autor reporta que, en pares donde se ha sustituido un único dato (un importe, un plazo, una parte), el solapamiento léxico acierta el 12,8 % de los casos mientras que este verificador alcanza el 89,1 %, porque el resto del texto coincide literalmente. El modelo se distribuye con licencia Apache 2.0 y solo en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder: transformer solo codificador (familia ModernBERT) sobre deepvk/RuModernBERT-base, con cabeza de clasificación de un único logit (num_labels=1) |
| Parámetros totales | 149.605.633 (≈150 M) |
| Parámetros activos | no aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 512 tokens (máximo declarado en la model card; truncación con `only_second`) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay GGUF, ONNX ni cuantizaciones publicadas por el autor) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,6 GB |
| Tarea declarada (pipeline) | text-classification |
| Modelo base | deepvk/RuModernBERT-base (fine-tuning) |

## Arquitectura y entrenamiento

Se trata de un cross-encoder, no de un generador: recibe un par (afirmación, fragmento) y devuelve un logit, de modo que la afirmación y la evidencia se codifican conjuntamente en lugar de compararse por similitud de embeddings. La base es deepvk/RuModernBERT-base, un transformer solo codificador con atención bidireccional adaptado al ruso; sobre ella se añade una cabeza binaria y se fija la longitud de entrada en 512 tokens mediante truncación `only_second` (se conserva la afirmación y se recorta la evidencia).

Los datos de entrenamiento son 16.071 pares de entrenamiento y 1.561 de validación, procedentes de respuestas de un sistema RAG sobre derecho ruso. La anotación la generó Qwen3-27B, que descompone las respuestas en afirmaciones y etiqueta cada una. Se emplearon tres familias de negativos: afirmaciones que el juez rechazó, afirmaciones con un hecho deliberadamente sustituido (escritas por el mismo Qwen3-27B cambiando exactamente un detalle) y afirmaciones emparejadas con un fragmento perteneciente a otra pregunta. El entrenamiento completo duró 7 minutos en una sola GB10, sin que la model card mencione fases de RLHF o DPO ni una composición de dataset más detallada.

## Capacidades

- Puntuación de grounding: dada una pareja (afirmación, fragmento), devuelve una probabilidad de que la afirmación se siga del fragmento (umbral 0,5).
- Detección de hechos sustituidos: identifica cambios puntuales de cifra, plazo, artículo o sujeto dentro de un texto por lo demás idéntico.
- Detección de evidencia irrelevante: reconoce fragmentos que no pertenecen a la pregunta, con una tasa de acierto reportada de 0,966.
- Cálculo de faithfulness a nivel de respuesta: dividiendo la respuesta en afirmaciones, emparejando cada una con el fragmento más adecuado y calculando la proporción de afirmaciones confirmadas.
- Evaluación comparativa de sistemas RAG: el autor la usa para recalcular la faithfulness de ocho configuraciones RAG distintas frente a un juez de 27B.
- Inferencia ligera: el autor reporta 2,93 ms por afirmación y 341 afirmaciones por segundo en una GB10, además de ejecución en CPU y en navegador vía WebGPU en la demo publicada.
- Capacidad multilingüe: no. Está entrenado y evaluado únicamente en ruso.
- Tool calling / function calling: no soportado (es un clasificador, no un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado de forma nativa; puede integrarse como componente de verificación dentro de un agente externo.
- Generación de texto, código, matemáticas o visión: no disponible, fuera del alcance del modelo.

## Casos de uso

- Verificación de respuestas en asistentes jurídicos rusos: tras generar una respuesta sobre normativa, cada afirmación se contrasta contra el fragmento recuperado; el caso de uso central porque el modelo se entrenó con respuestas de un RAG de derecho ruso.
- Guardarraíl en producción para RAG genérico en ruso: insertado después del generador, marca como no fundamentadas las afirmaciones con puntuación inferior a 0,5 y permite bloquear o reescribir la respuesta antes de mostrarla al usuario.
- Detección de citas falsas: en escenarios donde el sistema cita importes de multas, plazos o números de artículo, el modelo detecta el cambio de un solo dato que los métodos léxicos no ven (0,891 frente a 0,128 de acierto en ese subconjunto).
- Evaluación offline y regresión en CI: al costar 2,93 ms por afirmación, se puede ejecutar sobre un conjunto de evaluación completo en cada cambio de prompt o de índice, midiendo la faithfulness media y comparándola con la versión anterior.
- Filtrado de datos sintéticos: validar pares (afirmación, evidencia) generados por un LLM antes de incorporarlos a un dataset de entrenamiento o de fine-tuning, descartando los que no se apoyan en la evidencia.
- Reordenación y filtrado de contexto recuperado: usando la señal de "fragmento de otra pregunta" (0,966 de acierto) para descartar pasajes irrelevantes que el retriever ha colado en el contexto.
- Despliegue en local o en puesto de trabajo con documentos confidenciales: al caber en CPU, permite auditar respuestas sin enviar expedientes a servicios externos; la demo del autor demuestra incluso ejecución en navegador vía WebGPU.
- Auditoría de calidad de un asistente ya en explotación: muestrear respuestas reales, calcular la faithfulness con este modelo y usar la media como métrica de seguimiento, con un acuerdo con anotación humana del 86 % en el intervalo de 0,25 (frente al 82 % de Qwen3-27B).

## Benchmarks y rendimiento

Conjunto de evaluación diferido de 12.195 pares no vistos en entrenamiento (4.690 confirmados, 1.307 con hecho sustituido, 1.514 rechazados por el juez, 4.684 con fragmento ajeno):

| Método | Accuracy | F1 | ROC-AUC |
|---|---|---|---|
| Solapamiento léxico | 0,746 | 0,719 | 0,832 |
| ru-reranker-edge-150m sin fine-tuning | 0,783 | 0,727 | 0,857 |
| ru-grounding-verifier-150m | 0,859 | 0,816 | 0,944 |

Desglose por tipo de par (proporción de casos correctamente identificados):

| Tipo de par | Solapamiento léxico | ru-grounding-verifier-150m |
|---|---|---|
| La afirmación se confirma con el fragmento | 0,845 | 0,811 |
| Un hecho sustituido en la afirmación | 0,128 | 0,891 |
| Afirmación rechazada por el juez | 0,464 | 0,651 |
| Fragmento de otra pregunta | 0,910 | 0,966 |

Acuerdo con anotación humana sobre 50 respuestas de un RAG evaluadas por tres estimadores:

| Estimador | Faithfulness media | Desviación respecto al humano | Coincidencia dentro de 0,25 |
|---|---|---|---|
| Anotación humana | 0,945 | — | — |
| Juez Qwen3-27B | 0,927 | -0,018 | 82 % |
| ru-grounding-verifier-150m | 0,919 | -0,026 | 86 % |

A nivel de sistema, al recalcular la faithfulness de ocho configuraciones RAG con el verificador y con el juez, la diferencia media es de 0,050 y el orden relativo de los sistemas coincide en el 82 % de las comparaciones por pares. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K ni similares) en la información disponible, y no serían aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,30 GB de pesos en bf16 y 0,60 GB en fp32; con activaciones de 512 tokens y lotes pequeños, por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU sirve; el autor reporta las cifras de rendimiento en una GB10. Una RTX 4090, A100 o H100 están sobredimensionadas para 150 M de parámetros; una GPU consumer antigua (por ejemplo, 4 GB de VRAM) es suficiente.
- CPU: es viable como destino principal, ya que la model card presenta el modelo como alternativa a un juez que requiere "gigas de memoria".
- Latencia y throughput: 2,93 ms por afirmación y 341 afirmaciones por segundo en una GB10, según el autor. No se publican cifras de latencia en CPU ni con otros lotes.
- Opciones de despliegue: PyTorch con Transformers (es el ejemplo que da el autor), exportación propia a ONNX Runtime o TorchScript no documentada, y ejecución en navegador mediante WebGPU, tal como hace la demo del autor. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador; un servidor de reranking/clasificación como TEI sí es compatible conceptualmente, aunque el autor no documenta un despliegue concreto.
- Formatos empaquetados: no hay GGUF ni cuantizaciones publicadas, de modo que llama.cpp u Ollama exigirían una conversión propia no soportada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ru-grounding-verifier-150m | 149,6 M | 512 tokens | Accuracy 0,859 / F1 0,816 / ROC-AUC 0,944 | Apache 2.0 | Pesos abiertos en safetensors |
| Qwen3-27B (como juez) | ≈27.000 M | no disponible | Faithfulness media 0,927 y desviación -0,018 frente al humano; coincide con el humano en el 82 % de los casos dentro de 0,25 | no disponible en la información | Modelo generativo de propósito general, no especializado en ruso jurídico |
| ru-reranker-edge-150m sin fine-tuning | ≈150 M (según su nombre) | no disponible | Accuracy 0,783 / F1 0,727 / ROC-AUC 0,857 en el mismo conjunto | no disponible en la información | Usado por el autor como línea base; enlaces no incluidos en la información recibida |
| Solapamiento léxico (método no neuronal) | no aplica | no aplica | Accuracy 0,746 / F1 0,719 / ROC-AUC 0,832 | no aplica | Referencia trivial, sin dependencias |

Frente al juez de 27B, el verificador es unas 180 veces menor y se desvía del anotador humano prácticamente lo mismo (-0,026 frente a -0,018), con mayor coincidencia dentro del margen de 0,25 (86 % frente a 82 %). No se dispone de comparativas con otros verificadores de grounding en ruso, porque el autor indica que no existen alternativas abiertas en ese idioma.

## Limitaciones y advertencias

- Dominio: se entrenó con respuestas de un RAG sobre derecho ruso. La tarea ("¿se sigue este texto de este texto?") es neutra respecto al dominio, pero el rendimiento en otras áreas no está medido.
- Herencia del anotador: las etiquetas proceden de Qwen3-27B, por lo que sus errores sistemáticos se trasladan al modelo.
- Evidencia única: verifica una afirmación contra un solo fragmento. Una afirmación que se compone a partir de dos fragmentos distintos quedará infravalorada.
- Truncación: las afirmaciones y fragmentos largos se recortan a 512 tokens, lo que puede eliminar la parte relevante de la evidencia.
- Cobertura de negativos limitada: en el subconjunto de afirmaciones rechazadas por el juez el acierto baja a 0,651, el punto más débil del modelo.
- Riesgo de alucinación del propio verificador: como cualquier clasificador, puede dar por confirmada una afirmación mal fundamentada; el umbral 0,5 es el sugerido por el autor y no se documenta una calibración por dominio.
- Sesgo lingüístico: solo ruso; no hay evaluación en otras lenguas y los modelos equivalentes en inglés no se transfieren, según el autor.
- Alcance semántico: responde a "¿está esto en el documento?", no a "¿es verdad esto?". No es una comprobación de conformidad legal y no debe usarse como tal.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye avisos ni garantías sobre el tratamiento de documentos jurídicos.
- Madurez: el repositorio no tiene descargas ni valoraciones registradas en la información disponible, lo que aconseja validar su comportamiento en el dominio propio antes de llevarlo a producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sshalimov04/ru-grounding-verifier-150m
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-base
- Demo en navegador (búsqueda sobre códigos, ranking y verificación vía WebGPU): https://huggingface.co/spaces/sshalimov04/ru-rag-browser
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, su paper o su repositorio; los resultados devueltos corresponden a artículos de consumo sin relación con el modelo.
