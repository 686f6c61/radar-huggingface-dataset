# StanfordSCALE/assertion_is_unintelligible_in_context

## Resumen

`StanfordSCALE/assertion_is_unintelligible_in_context` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para el codificado auditable de diálogo en el aula. El modelo resuelve una tarea muy concreta: determinar si una intervencion docente resulta ininteligible en su contexto conversacional. Se distribuye a traves de la libreria SetFit y esta pensado para usarse mediante el paquete de Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un clasificador de frases construido sobre `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) al que se anade una cabeza de regresion logistica entrenada con el framework SetFit. Se entreno sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset, con 13.182 ejemplos de entrenamiento, 3.295 de desarrollo y 8.238 de test. La tasa base de la clase positiva es muy baja (3,3 %), lo que condiciona por completo su comportamiento y sus metricas.

Su relevancia es limitada y muy especializada: forma parte de una familia de clasificadores de aserciones para investigacion educativa, no es un modelo de proposito general y sus propios autores advierten de que su F1 en test (0,267) no es suficiente para usarlo de forma autonoma. Es, por tanto, una pieza de un pipeline de anotacion mas amplio mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MPNet (transformer) con cabeza de regresion logistica, entrenado con SetFit |
| Parametros totales | 109.486.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la receta de SetFit: se parte de un sentence transformer preentrenado, `sentence-transformers/paraphrase-mpnet-base-v2`, se afina el cuerpo mediante aprendizaje contrastivo sobre pares de frases y despues se entrena una cabeza de clasificacion ligera sobre los embeddings generados. En este caso la cabeza es una `LogisticRegression`. Los hiperparametros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epochs, 5000 pasos maximos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

El entrenamiento uso el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, con 13.182 filas de train (53,3 %), 3.295 de dev (13,3 %) y 8.238 de test (33,3 %). Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores medido con alfa de Krippendorff es de 0,527. La entrada del modelo es la intervencion textual sin transformaciones adicionales (se pasa la utterance tal cual). La tasa base de la asercion es del 3,3 % global (3,6 % en train, 3,0 % en dev y 3,0 % en test), lo que indica un problema fuertemente desbalanceado.

## Capacidades

- Clasificacion binaria de texto: devuelve si una intervencion docente es ininteligible en su contexto (clase positiva) o no.
- Salida de probabilidad mediante `predict_proba`, lo que permite fijar umbrales de decision segun la tolerancia a falsos positivos o falsos negativos.
- Integracion con el ecosistema SetFit: carga con `SetFitModel.from_pretrained` y prediccion por lotes.
- Uso dentro del paquete `EduBehaviors-kit` para codificacion de dialogo en el aula basada en aserciones.
- Capacidad multilingue: no. Solo entrenado y evaluado en ingles.
- Tool calling, agentes, razonamiento multi-paso, vision o audio: no disponibles. Es un clasificador, no un modelo generativo.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Anotacion asistida de corpus de aula: el clasificador puede preetiquetar intervenciones docentes del TalkMoves Dataset marcando candidatas a "ininteligible en contexto", que despues revisa un codificador humano. Es su uso previsto original, como parte de un pipeline con `EduBehaviors-kit`.
- Investigacion en discurso de aula: sirve para estudiar la prevalencia y distribucion de intervenciones ininteligibles en transcripciones docentes y relacionarlas con otras aserciones del mismo esquema.
- Filtrado previo en estudios a gran escala: con un umbral de decision ajustado a alta precision (precisions de 0,489 en test) puede usarse para seleccionar una submuestra de casos probables y reducir el volumen de revision manual.
- Control de calidad de transcripciones: detectar fragmentos de habla docente que resultan incomprensibles y que podrian indicar errores de transcripcion o cortes de audio.
- Componente de esquemas auditables: al ser una asercion entre varias (`bu5`), se puede combinar con otros clasificadores de la familia EduBehaviors para construir codificaciones compuestas de comportamiento docente.
- Investigacion en metodos SetFit: por su baja tasa base y su F1 moderado, es un caso de estudio util para comparar tecnicas de clasificacion en regimen desbalanceado.
- No recomendado para decision automatica sin supervision humana: por el propio aviso de los autores, no debe usarse como unico criterio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Split | n | Base rate | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 3,0 % | 0,395 | 0,153 | 0,221 | 0,653 | 0,160 |
| test | 8.238 | 3,0 % | 0,489 | 0,184 | 0,267 | 0,706 | 0,227 |

Metricas agregadas del model-index (split test): F1 0,2671, precision 0,4891, recall 0,1837, ROC-AUC 0,7063. No se han publicado otros resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 109,5 millones de parametros, en fp32 el modelo ocupa aproximadamente 0,44 GB de pesos; en fp16 alrededor de 0,22 GB. La activacion y el resto del runtime anaden poco, por lo que cabe comodamente en GPUs de gama baja.
- GPU recomendadas: no disponibles en la documentacion. Por tamano, cualquier GPU moderna con al menos 1-2 GB de VRAM libre es suficiente; tambien es viable en CPU.
- Cabe en GPU de consumo: si. Por tamano, cabe en practicamente cualquier GPU de consumo actual, y tambien en CPU para lotes pequenos.
- Opciones de despliegue: `setfit` (libreria oficial, con `SetFitModel.from_pretrained`) y el ecosistema Sentence Transformers / HuggingFace Transformers. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para los modelos comparables en la informacion proporcionada. Como referencia estructural, se puede situar frente a su modelo base y frente a clasificadores SetFit equivalentes:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_is_unintelligible_in_context | Clasificador binario (SetFit, MPNet + regresion logistica) | 109.486.464 | no disponible | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | Sentence transformer (encoder MPNet) | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |
| Otros clasificadores de aserciones de la familia EduBehaviors | Clasificadores SetFit por asercion | no disponible | no disponible | no disponible | HuggingFace (StanfordSCALE) |

No se dispone de resultados comparativos de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM y no de codificadores humanos; el acuerdo entre anotadores (alfa de Krippendorff) es de 0,527, lo que indica una fiabilidad moderada de las etiquetas de referencia.
- El F1 en test es de 0,267, con un recall de solo 0,184. Los propios autores afirman que el modelo no funciona lo suficientemente bien para usarse de forma autonoma.
- Tasa base muy baja (3,3 %), lo que convierte la tarea en un problema fuertemente desbalanceado y explica el bajo recall de la clase positiva.
- Entrenado unicamente con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no se ha evaluado.
- Idiomas: solo ingles. No se ha validado su comportamiento en otros idiomas.
- Licencia: no disponible. No se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinacion: no aplica como en un modelo generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, con precision y recall bajos en la clase positiva.
- Caveat de produccion: por precision, recall y F1 bajos, no debe usarse como unico criterio de decision. Es adecuado como componente de anotacion asistida con revision humana o combinado con otras senales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_unintelligible_in_context
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete EduBehaviors-kit: no disponible (citado en la model card sin enlace)
- Paper o publicacion asociada a EduBehaviors: no disponible en la informacion proporcionada
