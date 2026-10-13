# vishnusureshperumbavoor/vspml-pubmedqa-decision-a100

## Resumen

vspml-pubmedqa-decision-a100 es un modelo de clasificación de texto entrenado para responder preguntas clínicas sobre literatura biomédica, devolviendo un veredicto categórico entre `YES`, `NO` o `MAYBE` a partir de una pregunta y el abstract de un artículo científico. Lo desarrolla Vishnu Suresh Perumbavoor (vishnusureshperumbavoor), ingeniero de software e investigador centrado en imagen médica, y está publicado bajo licencia Apache 2.0 en HuggingFace. La tarea se corresponde con PubMedQA dentro del benchmark BLURB de Microsoft.

El modelo se apoya en una arquitectura ModernBERT orientada a clasificación de secuencias (`AutoModelForSequenceClassification`), con 108.235.011 parámetros totales y una ventana de contexto de 512 tokens. No es un modelo generativo: es no autorregresivo y resuelve la decisión en una única pasada hacia delante, con una latencia declarada inferior a 30 ms. Esto lo sitúa en la categoría que el autor denomina "System 1 Clinical Decision Reasoning", es decir, una decisión rápida y calibrada frente a la generación de texto larga.

Su relevancia práctica radica en el coste computacional: al ser un clasificador de 108M de parámetros y 0,4 GB de repositorio, se puede desplegar en hardware modesto y servir como componente de filtrado o triaje dentro de pipelines de recuperación aumentada sobre literatura médica, donde interesa un veredicto binario o ternario inmediato en lugar de una respuesta redactada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), clasificacion de secuencias |
| Parametros totales | 108.235.011 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; soporta cuantizacion via herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT adaptado a una cabeza de clasificacion de secuencias con tres etiquetas (`YES`, `NO`, `MAYBE`). El entrenamiento se realizo con el framework VSP ML CLI (Vibe-ML-Studio) sobre una GPU NVIDIA A100-SXM4 de 80 GB de VRAM, en precision nativa bfloat16 (`bf16`). El autor describe un proceso en dos fases: una pre-adaptacion sobre 4.000 pares de investigacion y un ajuste fino posterior sobre ensayos clinicos etiquetados.

Se trata de una arquitectura no generativa: no hay decodificacion autoregresiva ni generacion de texto. La salida es una distribucion de probabilidad sobre las tres clases, obtenida con una unica pasada hacia delante, lo que explica la latencia declarada inferior a 30 ms. El conjunto de datos de referencia es PubMedQA en su particion de test oficial de BLURB (500 muestras). No se detalla en la informacion disponible si hubo etapas de RLHF, DPO u otras tecnicas de alineacion, ni la composicion exacta del dataset de ajuste fino.

## Capacidades

- Clasificacion de preguntas clinicas en tres veredictos: `YES`, `NO` y `MAYBE`.
- Razonamiento de decision no autorregresivo ("System 1") a partir de una pregunta y un abstract biomedico.
- Inferencia de una sola pasada hacia delante, sin generacion de texto, con latencia declarada inferior a 30 ms.
- Devuelve probabilidades por clase mediante `softmax`, lo que permite umbralizar decisiones y medir confianza.
- Procesamiento de entradas de hasta 512 tokens (pregunta + abstract).
- Capacidad monoidioma: solo ingles.
- Soporte de tool calling / function calling: no disponible (es un clasificador, no un modelo de instrucciones).
- Soporte de agentes y multi-step reasoning: no disponible; no esta disenado como nucleo de agente, aunque puede actuar como clasificador auxiliar dentro de un pipeline.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Triaje de preguntas clinicas sobre literatura: dado un abstract recuperado por un buscador, el modelo emite un veredicto `YES`/`NO`/`MAYBE` en menos de 30 ms, permitiendo filtrar cientos de articulos antes de pasar los candidatos a un modelo generativo mayor.
- Filtrado previo en pipelines de RAG biomedico: colocado delante de un LLM generativo, reduce el numero de fragmentos que se envian al modelo grande, bajando coste y latencia del sistema completo.
- Etiquetado de evidencia en revisiones sistematicas: los equipos de sintesis de evidencia pueden usar el clasificador para marcar abstracts como favorables, desfavorables o ambiguos respecto a una hipotesis concreta.
- Moderacion de respuestas de salud: como verificador rapido de afirmaciones clinicas frente a un abstract de referencia, marcando contradicciones con `NO` y confirmaciones con `YES`.
- Evaluacion de calidad en bancos de pruebas: sirve como linea base ligera para experimentos de PubMedQA dentro de BLURB, comparando metodos sin necesidad de infraestructura de inferencia pesada.
- Enrutamiento en asistentes de investigacion: en funcion del veredicto, dirigir la consulta a un flujo de "confirmado", "refutado" o "revision manual", ajustando la profundidad de la respuesta.
- Preanotacion de datasets: generar etiquetas preliminares sobre grandes volumenes de pares pregunta-abstract para revision humana posterior, con la ventana de 512 tokens como limite por muestra.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card (no verificados de forma independiente). Evaluados sobre el test set oficial de Microsoft BLURB (500 muestras):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 71,4 % |
| Macro F1 | 49,69 % |
| F1 clase `YES` | 78,6 % |
| F1 clase `NO` | 70,4 % |
| Ganancia neta frente a base | +59,0 puntos (desde 12,4 % sin calibrar) |
| Latencia de inferencia | <30 ms (una pasada, sin generacion) |

No se han publicado en la informacion disponible resultados comparativos contra otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,45 GB de pesos (108M parametros); en bf16/fp16, alrededor de 0,22 GB. Con activaciones y sobrecarga del runtime, la huella practica es inferior a 1 GB.
- GPU recomendadas: no requiere GPU de centro de datos. Entrena bien en A100 (fue el hardware de entrenamiento), pero para inferencia basta cualquier GPU moderna.
- Cabe en GPU de consumo: si, con amplio margen. Funciona en tarjetas con 4 GB o menos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification`), HuggingFace Text Embeddings Inference, ONNX Runtime, TorchServe o cualquier servidor que soporte modelos de clasificacion de secuencias. vLLM, llama.cpp, Ollama y TGI no aplican de forma nativa porque son runners orientados a generacion autoregresiva.
- Latencia y throughput: latencia declarada inferior a 30 ms por muestra (una pasada hacia delante); el throughput agregado depende del batching y del hardware, y no se especifica en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idioma | Licencia | Rendimiento en PubMedQA |
|---|---|---|---|---|---|---|
| vspml-pubmedqa-decision-a100 | Clasificacion (ModernBERT) | 108,2 M | 512 | en | Apache 2.0 | 71,4 % accuracy, 49,69 % macro F1 (declarado) |
| PubMedBERT | Encoder de dominio biomedico | no disponible | no disponible | en | no disponible | no disponible |
| BioBERT | Encoder de dominio biomedico | no disponible | no disponible | en | no disponible | no disponible |
| ModernBERT (base) | Encoder generalista | no disponible | no disponible | en | no disponible | no disponible (no ajustado a PubMedQA) |

No se dispone en la informacion proporcionada de cifras de rendimiento de los modelos alternativos para establecer una comparacion numerica fiable. La comparativa se limita, por tanto, a categoria y tarea.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y estan marcados como `verified: false`; no han sido validados de forma independiente.
- El macro F1 de 49,69 % es notablemente inferior al accuracy de 71,4 %, lo que indica un rendimiento desequilibrado entre clases. Esto es coherente con la dificultad intrinseca de la clase `MAYBE`, que el modelo parece resolver peor.
- El modelo solo procesa ingles; no hay soporte multilingue.
- Ventana de contexto limitada a 512 tokens: los abstracts largos o los pares pregunta-multiple-abstract se truncan, con la consiguiente perdida de informacion.
- No es generativo y no ofrece justificacion textual: emite un veredicto y una probabilidad, sin cadena de razonamiento auditable.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero existe riesgo de clasificacion erronea con confianza alta, especialmente en dominios poco representados en el ajuste fino.
- Es un modelo de investigacion, no un dispositivo medico. No debe usarse para decision clinica sobre pacientes.
- No se detallan sesgos especificos del dataset, pero al entrenar sobre PubMedQA hereda los sesgos de la literatura publicada: sobrerrepresentacion de resultados positivos, sesgo de publicacion y sesgo geografico o de poblacion en los estudios indexados.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de no ser producto sanitario se mantiene.
- Con 0 descargas y 0 "likes" en el momento de la ficha, no hay evidencia de adopcion ni de validacion por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vishnusureshperumbavoor/vspml-pubmedqa-decision-a100
- Framework de entrenamiento VSP ML (Vibe-ML-Studio): https://github.com/vishnusureshperumbavoor/Vibe-ML-Studio
- Perfil del autor (web personal): https://vishnusureshperumbavoor.github.io/V-S-P/
- Perfil del autor en GitHub: https://github.com/vishnusureshperumbavoor
- Perfil del autor en HuggingFace: https://huggingface.co/vishnusureshperumbavoor
- Dataset PubMedQA en HuggingFace: https://huggingface.co/datasets/qiaojin/PubMedQA
- Paper y benchmark BLURB: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible
