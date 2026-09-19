# StanfordSCALE/assertion_sentence_summarizes_or_reviews

## Resumen

El modelo `StanfordSCALE/assertion_sentence_summarizes_or_reviews` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si una intervencion docente (una *utterance*) contiene una frase que resume o revisa el contenido previo del discurso de aula. Se entrenó sobre un subconjunto anotado por LLM del TalkMoves Dataset y se distribuye a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un clasificador SetFit: el cuerpo es el encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, 109.486.464 parametros) y la cabeza es una regresion logistica. El modelo solo soporta ingles y trabaja a nivel de frase/intervencion aislada, sin contexto conversacional explicito en la entrada.

Es relevante ahora como ejemplo de pipeline de anotacion automatizada de discurso educativo y como caso de estudio de sus propias limitaciones: la propia model card advierte de que el acuerdo entre anotadores (alfa de Krippendorff de 0,229) es pobre y de que el F1 de la clase positiva en test es 0,128, por lo que no debe usarse de forma autonoma en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (~109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,4 GB, libreria `setfit`) |
| Pipeline | text-classification |
| Tarea concreta | Clasificacion binaria: la frase resume o revisa el contenido |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase contrastiva se ajusta el cuerpo MPNet (learning rate 2e-05, batch size 16, 10 epocas, max steps 5000, eval max steps 100, precision mixta en GPU) para generar representaciones de frase discriminativas con pocos ejemplos; en una segunda fase se entrena una cabeza de regresion logistica (learning rate 0,01, batch size 32) sobre esas representaciones. La semilla usada fue 20260904. El texto de entrada es la intervencion tal cual, sin plantilla adicional: `{utterance}`.

Los datos proceden del TalkMoves Dataset y fueron anotados por anotadores LLM, no por codificadores humanos. El conjunto tiene 3.434 filas de entrenamiento (53,4%), 856 de desarrollo (13,3%) y 2.144 de test (33,3%). La tasa base de la clase positiva es muy baja: 3,2% global (3,5% en train, 3,0% en dev, 2,8% en test). El acuerdo entre anotadores para esta asercion es de 0,229 segun alfa de Krippendorff, lo que la propia model card califica de pobre. Las columnas del dataset asociadas son `assertion_sentence_summarizes_or_reviews` y `split_sentence_summarizes_or_reviews`.

## Capacidades

- Clasificacion binaria de una intervencion docente aislada: devuelve 1 cuando la asercion "la frase resume o revisa" se cumple y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `predict_proba`, con dos valores `P(no)`, `P(yes)`.
- Procesamiento en ingles unicamente.
- Integracion via paquete `EduBehaviors-kit` para codificacion auditable de dialogo educativo.
- Ejecucion sencilla con `setfit.SetFitModel.from_pretrained(...)` y `model.predict([...])`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es exclusivamente un clasificador.
- No incorpora modo de razonamiento ni cadena de pensamiento; tampoco gestiona contexto multi-turno de forma nativa (la entrada es una unica intervencion).

## Casos de uso

- Investigacion en discurso de aula: etiquetar automaticamente intervenciones docentes del TalkMoves Dataset para estudiar patrones de resumen y revision del contenido, siempre con supervision humana posterior.
- Generacion de candidatos en anotacion asistida: usar `predict_proba` para priorizar que intervenciones revisa un codificador humano, dado el bajo recall del modelo (0,100 en test) y la baja tasa base.
- Etiquetado debil (weak supervision) para preentrenar o inicializar esquemas de anotacion mas amplios dentro de EduBehaviors.
- Auditoria de pipelines de anotacion LLM: el modelo sirve como referencia para medir la estabilidad de etiquetas generadas por LLM frente a un clasificador supervisado.
- Baseline en experimentos de comparacion: al ser un SetFit sobre MPNet, es un punto de partida reproducible para evaluar alternativas (encoders mas grandes, fine-tuning completo, clasificadores con contexto).
- Filtrado de bajo coste en un pipeline por etapas: al ser un modelo de ~110 M de parametros, puede ejecutarse en CPU para descartar candidatos evidentes antes de invocar un modelo mayor.
- Analisis de sesgo y calidad de anotacion LLM en contextos educativos, comparando el rendimiento del clasificador con el alfa de Krippendorff reportado.
- No es adecuado como unico componente en un producto de evaluacion docente, atencion al cliente, moderacion o cualquier tarea con requisitos de fiabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`). Dataset: `StanfordSCALE/assertions_llm_annotated_talkmoves`, tarea text-classification.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 856 | 3,0% | 0,500 | 0,192 | 0,278 | 0,734 | 0,315 |
| test | 2.144 | 2,8% | 0,176 | 0,100 | 0,128 | 0,651 | 0,136 |

Desglose de las metricas de test tal como aparecen en el model-index: F1 0,1277; precision 0,1765; recall 0,1; ROC-AUC 0,6514. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: ~0,4 GB de repositorio; el cuerpo de 109,5 M de parametros ocupa aproximadamente 438 MB en fp32 y ~219 MB en fp16 (calculo derivado del numero de parametros, no dato publicado).
- VRAM estimada para inferencia: entorno a 1 GB o menos en fp32 con batch pequeno; cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU.
- Inferencia en CPU: viable para lotes pequenos, al tratarse de un encoder de 110 M de parametros; los tiempos exactos no estan publicados.
- GPUs recomendadas: no se requieren GPUs de clase A100/H100 para inferencia; son utiles solo para reentrenamiento a escala.
- Opciones de despliegue: `setfit` / `sentence-transformers` en Python; exportacion a ONNX o uso con `transformers` para servir el encoder. No hay artefactos GGUF ni soporte declarado en vLLM, Ollama, llama.cpp o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible. La siguiente tabla recoge lo unico verificable.

| Modelo | Tipo | Parametros | Contexto | F1 test (clase positiva) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_summarizes_or_reviews` | SetFit sobre MPNet + regresion logistica | 109,5 M | no disponible | 0,128 | no disponible | HuggingFace, libreria `setfit` |
| `sentence-transformers/paraphrase-mpnet-base-v2` | Encoder de frases (modelo base, no clasificador) | ~109 M | no disponible | no aplica | no disponible | HuggingFace |
| Otros clasificadores de aserciones de EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el alfa de Krippendorff es 0,229, lo que la propia model card describe como pobre.
- F1 de 0,128 en test y precision de 0,176: el modelo no funciona lo bastante bien como para usarse de forma autonoma.
- Tasa base muy baja (2,8% en test), lo que hace que la exactitud sea enganosa y que la clase positiva quede infrarrepresentada.
- Entrenado solo con intervenciones de profesorado: el comportamiento sobre habla de estudiantes no esta probado.
- Solo ingles; no hay evidencia de transferencia a otros idiomas.
- No hay informacion sobre licencia, por lo que no puede asumirse uso comercial libre sin consultar al autor.
- Riesgo alto de falsos negativos (recall 0,100) y de deriva si se aplica a dominios o poblaciones de aula distintos del TalkMoves Dataset.
- La anotacion LLM subyacente introduce sesgos desconocidos y no auditados en la taxonomia del discurso educativo.
- No adecuado para decisiones de evaluacion docente con consecuencias reales sin revision humana.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni comunidad que confirme los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_summarizes_or_reviews
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (codigo y datos originales): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL proporcionada en la informacion disponible.
- Paper o publicacion asociada a *EduBehaviors: Assertion-based schemas for auditable dialogue coding*: no disponible en la informacion proporcionada.
- Los resultados de la busqueda web incluida no contenian ninguna fuente relacionada con el modelo (devolvieron exclusivamente paginas corporativas de Microsoft), por lo que no se enlazan.
