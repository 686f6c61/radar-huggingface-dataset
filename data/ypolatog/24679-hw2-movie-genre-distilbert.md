# ypolatog/24679-hw2-movie-genre-distilbert

## Resumen

`ypolatog/24679-hw2-movie-genre-distilbert` es un clasificador de genero cinematografico obtenido al ajustar (fine-tuning) `distilbert-base-uncased` sobre descripciones cortas de argumentos de peliculas. Predice una de cinco etiquetas: Thriller, Action, Romance, Comedy y Animation. El modelo lo publica el usuario ypolatog como entrega de la parte 3 del trabajo practico de la asignatura CMU 24-679 Design AI, y no esta pensado para uso profesional: la propia model card indica "not for any real decision".

Arquitectonicamente es un transformer encoder denso tipo DistilBERT, con 66.957.317 parametros totales y un cabezal de clasificacion de 5 clases sobre la representacion del token `[CLS]`. Se entreno con longitud maxima de secuencia de 128 tokens, batch 16, learning rate 2e-05 y solo 4 de las 8 epocas permitidas antes de que saltase el early stopping (paciencia 2). El conjunto de datos de entrenamiento es `ArinRoths/movie-data`, un dataset de clase con unos pocos cientos de descripciones, en su mayoria parafrasis aumentadas de un conjunto original mas pequeno.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto docente, con 29 descargas y 0 likes en el momento de la consulta, cuyo interes tecnico esta en documentar bien un flujo de fine-tuning de clasificacion de texto y en las cifras de validacion cruzada (macro F1 0.497 +/- 0.070), bastante mas modestas que el 0.659 del test retenido de solo 15 ejemplos. Su licencia es `classroom-use`, lo que restringe claramente su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso DistilBERT (destilacion de BERT-base); cabezal de clasificacion de secuencias de 5 clases |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de DistilBERT); entrenado con longitud maxima de 128 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no declarados en la model card; el modelo base `distilbert-base-uncased` esta entrenado principalmente con texto en ingles (tokenizer WordPiece sin distincion de mayusculas) |
| Licencia | `other` / `classroom-use` (uso de clase) |
| Formato de pesos | safetensors |
| Modelo base | distilbert-base-uncased |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | Thriller, Action, Romance, Comedy, Animation (ids remapeados de `[0, 1, 3, 4, 5]` a `0..4`) |
| Dataset de entrenamiento | ArinRoths/movie-data |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-09-21 (creado y actualizado el mismo dia) |
| Descargas / likes | 29 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, la version destilada de BERT-base: 6 capas de encoder, 768 dimensiones ocultas y 12 cabezas de atencion, con un total de 66.957.317 parametros incluyendo el cabezal de clasificacion. DistilBERT se obtiene por destilacion de conocimiento, entrenando el modelo pequeno para imitar las distribuciones de salida del profesor, lo que reduce el coste de inferencia a costa de algo de capacidad. Sobre esa base se anade una capa lineal de 5 salidas y se ajusta de forma supervisada para clasificar el genero a partir del pooler de `[CLS]`.

Los hiperparametros documentados son: learning rate 2e-05 (seleccionado tras barrer valores de 2e-05, 3e-05 y 5e-05 midiendo macro F1 en validacion), batch size 16, weight decay 0.01, warmup ratio 0.1, longitud maxima de secuencia 128 y semilla 24679 con transformers 4.57.6. Se permitieron 8 epocas y el entrenamiento se detuvo a las 4 por early stopping con paciencia 2, recargando el mejor checkpoint. No se menciona RLHF, DPO ni ninguna otra fase de alineacion, algo logico en un clasificador. La innovacion practica destacable es de trazabilidad, no de modelado: el repositorio incluye `metrics.json` con todas las metricas, `sweep_results.csv` con el barrido de learning rate y `split_manifest.json` con los `source_id` exactos de cada particion, de modo que la parte 4 del trabajo pueda evaluar sobre el mismo conjunto de test. Ademas, el autor documenta explicitamente un remapeo de etiquetas: el dataset original publica ids `[0, 1, 3, 4, 5]` (el id 2 no se usa) y el modelo los reindexa a `0..4`, con el mapeo almacenado en la configuracion y en el manifiesto.

## Capacidades

- Clasificacion de texto en 5 clases cerradas (Thriller, Action, Romance, Comedy, Animation) a partir de una descripcion de argumento en ingles.
- Salida de logits y probabilidades por clase mediante la pipeline `text-classification` de transformers.
- Entrada de hasta 512 tokens, aunque el modelo fue ajustado con secuencias de 128 tokens como maximo.
- Funciona en CPU y en GPU sin requisitos de memoria significativos, dado su tamano de 67 M de parametros.
- No genera texto: no hay decoding autoregresivo, ni tool calling, ni function calling, ni capacidad de agente o razonamiento multi-paso.
- No dispone de modo de razonamiento explicito ni de modo "thinking".
- No procesa imagenes, audio ni video; es un modelo puramente de texto.
- No se declara soporte multilingue; el vocabulario uncased del modelo base esta orientado a ingles.
- Trazabilidad de particiones y metricas incluida en el repositorio (`split_manifest.json`, `metrics.json`, `sweep_results.csv`).

## Casos de uso

- Enrutado previo de catalogos: dado que el modelo necesita menos de 1 GB de memoria, se puede ejecutar en CPU para pre-etiquetar un catalogo de sinopsis y despues revisar manualmente solo los casos de baja confianza. Es adecuado por coste, pero la precision documentada (~0,66 de accuracy en un test de 15 ejemplos) obliga a mantener revision humana.
- Prototipo docente de pipeline de clasificacion: sirve como ejemplo reproducible de fine-tuning con barrido de hiperparametros, early stopping y semilla fija, para comparar metodologias en un curso o taller.
- Banco de pruebas de infraestructura de inferencia: al ser tan pequeno, es util para validar integraciones con ONNX Runtime, endpoints de Hugging Face o servicios FastAPI antes de trasladar el pipeline a un modelo mayor.
- Etiquetado asistido en anotacion: el modelo puede proponer una etiqueta inicial sobre descripciones cortas y el anotador corregirla, reduciendo el tiempo por ejemplo. Requiere medir el acuerdo inter-anotador para saber cuanto ayuda realmente.
- Analisis exploratorio de datasets de cine: aplicar el clasificador a un corpus de sinopsis para estudiar la distribucion de generos y detectar desequilibrios de clase antes de entrenar modelos mas grandes.
- Test de regresion de preprocesado: al fijar la semilla y publicar los `source_id` de cada particion, sirve para verificar que cambios en tokenizacion o limpieza de texto no alteran las predicciones esperadas.
- Comparacion de estrategias de fine-tuning: con los resultados de validacion cruzada agrupada (macro F1 0.497 +/- 0.070) como linea base, se puede evaluar si tecnicas como congelar capas, aumentar datos o cambiar el encoder aportan mejoras reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el `model-index` (no verificados por un tercero):

| Metrica | Validacion cruzada (3-fold agrupada) | Test retenido (n=15) |
|---|---|---|
| Macro F1 | 0.497 +/- 0.070 | 0.659 |
| Accuracy | 0.494 | 0.6667 |

Referencias declaradas por el autor: la linea base aleatoria es 0.200 y la linea base mayoritaria en el test (predecir siempre Thriller) tambien es 0.200. El propio autor advierte que el test retenido tiene solo 15 descripciones y que por eso cita primero la cifra de validacion cruzada. No hay en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, que por otra parte no aplican a un clasificador de 5 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en fp32 y 134 MB en fp16/bf16 solo para los pesos; con activaciones y overhead de runtime, menos de 1 GB en cualquier configuracion habitual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. No se necesitan A100 ni H100; una GTX 1650, una T4, una RTX 3060 o una RTX 4090 funcionan sobradamente.
- Inferencia en CPU: perfectamente viable en un portatil convencional, ya que el modelo tiene 67 M de parametros y se entreno con secuencias de 128 tokens.
- Opciones de despliegue: pipeline `text-classification` de transformers, exportacion a ONNX Runtime o TorchScript, servicio propio con FastAPI o Docker, y Hugging Face Inference Endpoints.
- No aplica: vLLM, TGI o llama.cpp no son la via natural para este artefacto, porque no es un modelo generativo y no se publican pesos GGUF. Cualquier uso con esas herramientas requeriria conversion y no esta documentado.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de ejemplos por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados publicos de estos modelos sobre `ArinRoths/movie-data`, por lo que la columna de rendimiento se deja como no disponible y la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ypolatog/24679-hw2-movie-genre-distilbert | 66,96 M | 512 tokens | Clasificacion de genero (5 clases) | classroom-use | Hugging Face, safetensors |
| distilbert-base-uncased | 66 M aprox. | 512 tokens | Modelo base de lenguaje (requiere ajuste) | Apache-2.0 | Hugging Face, safetensors |
| bert-base-uncased | 110 M aprox. | 512 tokens | Modelo base de lenguaje (requiere ajuste) | Apache-2.0 | Hugging Face, safetensors |
| roberta-base | 125 M aprox. | 512 tokens | Modelo base de lenguaje (requiere ajuste) | MIT | Hugging Face, safetensors |

Rendimiento comparado sobre el mismo dataset: no disponible. No hay cifras publicas de BERT-base, RoBERTa-base ni otros clasificadores entrenados sobre `ArinRoths/movie-data` que permitan situar este fine-tuning en una tabla.

## Limitaciones y advertencias

- Licencia `classroom-use`: no es una licencia de codigo abierto y no autoriza uso comercial. Cualquier reutilizacion fuera del ambito docente debe aclararse con el autor del modelo.
- El dataset de origen (`ArinRoths/movie-data`) no declara licencia. La propia model card indica que la reutilizacion debe acordarse con su autora, ArinRoths. Esto afecta tanto a los pesos como a cualquier redistribucion de los datos.
- Riesgo alto de sobreajuste al dominio: el entrenamiento usa unos pocos cientos de descripciones cortas, en su mayoria parafrasis aumentadas de un conjunto original mas pequeno, por lo que el vocabulario y las peliculas representadas son muy limitados.
- Evaluacion fragil: el test retenido tiene n=15. Un accuracy de 0.6667 corresponde a 10 aciertos de 15, con un intervalo de confianza muy amplio. La cifra mas fiable es el macro F1 de validacion cruzada, 0.497 +/- 0.070.
- Sesgo hacia la clase mayoritaria: la linea base de predecir siempre Thriller alcanza 0.200 de accuracy en el test, y el macro F1 medio en validacion cruzada (0.497) esta lejos de un rendimiento equilibrado entre las cinco clases.
- Las etiquetas de salida no coinciden con los ids del dataset original (se remapean `[0, 1, 3, 4, 5]` a `0..4`). Reutilizar el modelo sin leer `split_manifest.json` ni la configuracion puede provocar errores silenciosos de correspondencia de clases.
- Limitacion idiomatica: no se declaran idiomas soportados y el modelo base es `distilbert-base-uncased`, orientado a ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Alucinacion: al ser un clasificador extractivo no genera texto libre, por lo que el riesgo de alucinacion en el sentido habitual no aplica. El riesgo equivalente es la asignacion de una clase incorrecta con alta confianza.
- Uso previsto declarado: exclusivamente coursework de la asignatura CMU 24-679 Design AI, "not for any real decision". No debe emplearse en decisiones sobre contenidos, recomendaciones o catalogacion real sin validacion adicional.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ ni AWQ, de modo que un despliegue en llama.cpp u Ollama exigiria conversion propia y no estaria validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ypolatog/24679-hw2-movie-genre-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/ArinRoths/movie-data
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Repositorio de transformers: https://github.com/huggingface/transformers
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre pianos virtuales (virtualpiano.net, onlinepianist.com, recursivearts.com, virtualpiano.io, musicca.com), sin relacion alguna con este modelo. No se han encontrado papers, blogs ni demos adicionales del modelo en la informacion disponible.
