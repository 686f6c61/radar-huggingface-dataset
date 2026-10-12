# StanfordSCALE/assertion_asks_students_whether_they_got_a_different_answer_than_a_prior_contribution

## Resumen

`StanfordSCALE/assertion_asks_students_whether_they_got_a_different_answer_than_a_prior_contribution` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors. Su tarea es determinar si una intervencion docente (utterance) pide a uno o varios estudiantes que comparen su respuesta con la de un companero anterior. Se trata de un modelo SetFit: un encoder `sentence-transformers/paraphrase-mpnet-base-v2` de 109.486.464 parametros acompanado de una cabeza de regresion logistica, no de un modelo generativo.

El modelo forma parte de un conjunto de clasificadores de "assertions" disenados para codificar discurso de aula de forma auditable. Se entreno sobre un subconjunto anotado por LLM del corpus TalkMoves, con 13.182 ejemplos de entrenamiento, 3.295 de desarrollo y 8.238 de test. La clase positiva es extremadamente rara: representa solo el 0,3 % de las filas (0,2 % en test).

Su relevancia es metodologica y, a la vez, limitada: ejemplifica el uso de SetFit para etiquetado conductual de bajo coste en investigacion educativa, pero el propio autor advierte de que las etiquetas provienen de anotadores LLM con un alfa de Krippendorff de 0,373, lo que califica como "pobre", y de que el modelo y los datos subyacentes no son fiables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder Sentence Transformer (MPNet) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | No disponible (pesos distribuidos en precision completa, safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (text-classification) |
| Cabeza de clasificacion | LogisticRegression |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Libreria | setfit |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el procedimiento SetFit en dos fases. En la primera se ajusta el cuerpo MPNet con aprendizaje contrastivo sobre pares de frases generados a partir de las clases, con un learning rate de 2e-05, batch size 16 y un maximo de 5000 pasos. En la segunda se congela el encoder y se entrena una cabeza de regresion logistica con learning rate 0,01 y batch size 32. En total, 10 epocas, semilla 20260904 y precision mixta activada en GPU. La entrada es la utterance en bruto, sin plantilla ni prefijo: `{utterance}`.

Los datos de entrenamiento proceden del subconjunto anotado por LLM del corpus TalkMoves (solo intervenciones de profesor). El split de entrenamiento contiene 13.182 filas (53,3 %), el de desarrollo 3.295 (13,3 %) y el de test 8.238 (33,3 %). Las etiquetas las generaron anotadores LLM, no codificadores humanos, y la concordancia medida con alfa de Krippendorff es de 0,373 para esta assertion concreta. No se menciona uso de RLHF, DPO ni ninguna innovacion de decodificacion; al ser un clasificador discriminativo, esas tecnicas no aplican.

## Capacidades

- Clasificacion binaria de utterances de profesor: devuelve 1 cuando se cumple la assertion ("la intervencion pide a uno o varios estudiantes si obtuvieron una respuesta distinta a la de una contribucion previa") y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `predict_proba`, con dos valores `[P(no), P(yes)]`.
- Integracion en el ecosistema EduBehaviors a traves del paquete Python `EduBehaviors-kit`.
- Procesamiento en lote de listas de textos con `model.predict([text])`.
- Funcionamiento en ingles unicamente (utterances de aula en ingles).
- Especializacion en discurso de aula: complementa otras assertions del mismo conjunto (talk moves) para codificacion conductual auditable.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidad de agente. Es exclusivamente un clasificador.

## Casos de uso

- Codificacion automatica de talk moves en transcripciones de clase: el modelo etiqueta cada turno del profesor para detectar peticiones de comparacion de respuestas, lo que permite analizar patrones de indagacion en cientos de sesiones sin codificacion manual.
- Investigacion educativa a escala: analisis de corpus de decenas de miles de utterances (el propio dataset de entrenamiento supera las 24.000 filas) para estudiar con que frecuencia los docentes fomentan la comparacion de respuestas entre estudiantes.
- Preanotacion para codificacion humana: uso del modelo como primera pasada en un flujo de anotacion asistida, dejando a los codificadores revisar solo las predicciones positivas o las de probabilidad intermedia.
- Formacion y desarrollo profesional docente: generacion de informes sobre el uso de estrategias de comparacion de respuestas en grabaciones de aula, siempre con revision humana dada la baja fiabilidad declarada.
- Muestreo inteligente de corpus: seleccion de fragmentos candidatos para estudios cualitativos o para ampliar el conjunto de ejemplos positivos, dado que la clase positiva es muy rara (0,2-0,3 %).
- Pipelines de analisis de discurso en plataformas de tutoria o grabacion de clases: inferencia por lotes sobre transcripciones ya generadas para enriquecer dashboards de calidad instruccional.
- Auditoria de sistemas de anotacion automatica: comparacion de las predicciones del clasificador con las de un LLM anotador o con codificacion humana para estimar el ruido de las etiquetas en un pipeline de datos.
- Filtrado previo en experimentos de investigacion sobre equidad en el aula: identificacion de momentos de comparacion publica de respuestas para analizar quien participa y como, con cautela por el sesgo del anotador LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Split | n | Base rate | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 0,3 % | 0,286 | 0,182 | 0,222 | 0,971 | 0,295 |
| test | 8.238 | 0,2 % | 0,370 | 0,556 | 0,444 | 0,945 | 0,348 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 (109,5 M de parametros) y unos 0,21 GB en fp16, mas el overhead de activaciones y tokenizacion.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- Inferencia en CPU perfectamente viable para lotes moderados; el encoder MPNet-base no requiere acelerador dedicado.
- Despliegue: la libreria `setfit` (`pip install setfit`) es la via oficial mediante `SetFitModel.from_pretrained(...)`. Tambien se puede exportar el encoder a sentence-transformers, ONNX o TorchScript para servir con FastAPI, TorchServe o similares. vLLM, TGI y Ollama no estan pensados para este tipo de modelo discriminativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,4 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (esta tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (SetFit + mpnet-base-v2) | Clasificador SetFit supervisado | 109.486.464 | No disponible | F1 0,444 / ROC-AUC 0,945 en test | No disponible | HuggingFace, libreria setfit |
| Clasificador zero-shot por NLI (p. ej. `facebook/bart-large-mnli`) | Clasificador zero-shot | No disponible en esta ficha | No disponible | No evaluado en `assertions_llm_annotated_talkmoves` | No disponible | HuggingFace |
| SetFit sobre encoder menor (p. ej. MiniLM) | Clasificador SetFit supervisado | No disponible en esta ficha | No disponible | No evaluado en esta tarea | No disponible | HuggingFace |
| Anotacion directa con un LLM | Generativa con prompting | No disponible en esta ficha | No disponible | Es el origen de las etiquetas; alfa de Krippendorff 0,373 | No disponible | APIs comerciales o modelos abiertos |

No se dispone de comparaciones directas con los mismos datos y metrica en la informacion proporcionada; los modelos alternativos se listan por categoria funcional, no por rendimiento medido en esta assertion.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El alfa de Krippendorff de esta assertion es 0,373, que el propio autor califica de pobre; el modelo y los datos subyacentes se declaran no fiables.
- El modelo se entreno solo con intervenciones de profesor; su comportamiento sobre habla de estudiantes no se ha probado.
- El split de test contiene unicamente 18 ejemplos positivos, por lo que las metricas de test tienen un margen de error muy amplio.
- Precision de 0,370 y recall de 0,556 en test: en la practica genera un volumen notable de falsos positivos y falsos negativos sobre una clase que representa solo el 0,2 %.
- El ROC-AUC alto (0,945) no implica buen rendimiento operativo en un problema tan desbalanceado; conviene atender a F1 y average precision (0,348).
- Solo soporta ingles. Las utterances en otros idiomas no estan cubiertas.
- La licencia no esta disponible, por lo que el uso comercial no puede darse por permitido sin aclaracion previa del autor.
- No es un modelo generativo: no admite tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- Alucinacion en el sentido generativo no aplica, pero si existe riesgo de falsos positivos sistematicos por el sesgo del anotador LLM que genero las etiquetas.
- Aviso de uso en produccion: dada la advertencia explicita del autor, no deberia usarse para decisiones con impacto sobre estudiantes o docentes sin revision humana y sin una validacion propia sobre datos del dominio objetivo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_students_whether_they_got_a_different_answer_than_a_prior_contribution
- Dataset de anotacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset TalkMoves (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Citacion (BibTeX en la model card): Stanford SCALE Initiative, "Assertion classifier: the utterance asks one or more students whether they got a different answer than a prior student contribution", 2026.
- Paper o blog del proyecto EduBehaviors: no disponible en la informacion proporcionada.
- Repositorio del paquete `EduBehaviors-kit`: no disponible en la informacion proporcionada.
