# talhasial/urdu-gemma-270m-joint-cpt

## Resumen

urdu-gemma-270m-joint-cpt es un adaptador LoRA (PEFT) sobre google/gemma-3-270m, desarrollado por Muhammad Talha Sial en el marco de su tesis de master *Exploiting large language models for improvements in Urdu NLP* (Universidad Masaryk, 2026). El modelo resuelve una tarea concreta de procesamiento de lenguaje natural en urdu: el etiquetado conjunto de categorias gramaticales universales (UPOS tagging) y la lematizacion, es decir, para cada palabra de una frase devuelve su categoria morfosintactica y su lema.

Se trata de un adaptador de bajo rango (LoRA r=16) entrenado sobre una variante de Gemma-3-270M que ya incorpora fusionado un adaptador previo de continuacion de preentrenamiento (CPT) en urdu. El resultado es un checkpoint especializado de muy bajo coste computacional, pensado para investigacion y evaluacion de tecnicas de adaptacion de modelos grandes a lenguas de bajos recursos, no para uso conversacional general.

Su relevancia es metodologica: demuestra que un modelo de 270 millones de parametros, adaptado con LoRA sobre un treebank pequeno (4.043 frases de entrenamiento), puede abordar tareas morfosintacticas en urdu con un formato de salida textual estructurado (palabra/etiqueta/lema). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es "other" con restricciones de uso no comercial derivadas de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre el modelo base google/gemma-3-270m |
| Parametros totales | 270 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (r=16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura max_seq_length=512 |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea load_in_4bit=False; el modelo base Gemma 3 admite cuantizacion, pero no se documenta para este adaptador) |
| Idiomas soportados | urdu (ur) |
| Licencia | other: sujeta a los Gemma Terms of Use y, por los datos de entrenamiento (UD_Urdu-UDTB, CC BY-NC-SA 4.0), limitada a uso no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-3-270m, un transformer decoder-only de la familia Gemma 3. Segun la model card, el punto de partida es una variante del modelo base con el adaptador CPT (continuacion de preentrenamiento en urdu) ya fusionado mediante `merge_and_unload()`; sobre esa variante se entrena el adaptador de esta ficha. La configuracion de entrenamiento es LoRA con rango r=16, tasa de aprendizaje 2e-4, 5 epocas y seleccion del checkpoint con menor perdida de validacion.

Los datos de entrenamiento provienen del treebank UD_Urdu-UDTB (Universal Dependencies, datos hasta la version v2.14), con 4.043 frases de entrenamiento. La tarea es conjunta: etiquetado UPOS y lematizacion, con un formato de salida textual del tipo `palabra/ETIQUETA/lema ...` y decodificacion greedy. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre el volumen de tokens del CPT previo.

## Capacidades

- Etiquetado UPOS: asigna a cada token de una frase en urdu su categoria gramatical universal.
- Lematizacion: devuelve el lema de cada palabra junto con su etiqueta, en una unica pasada conjunta.
- Generacion de texto estructurado: produce la salida en un formato delimitado por barras (`palabra/TAG/lema`), apto para parseo posterior.
- Procesamiento de frases en urdu con contexto de hasta 512 tokens en la configuracion de ejemplo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento en la informacion disponible.
- Capacidad multilingue: no disponible; el modelo esta orientado exclusivamente al urdu.

## Casos de uso

- Anotacion morfosintactica de corpus en urdu: el modelo puede procesar frases de un corpus y generar automaticamente etiquetas UPOS y lemas, reduciendo el esfuerzo de anotacion manual en proyectos de linguistica computacional.
- Preprocesamiento para pipelines de NLP en urdu: las etiquetas y lemas generados pueden alimentar tareas posteriores como analisis sintactico, extraccion de entidades o recuperacion de informacion, normalizando las formas flexionadas.
- Evaluacion de tecnicas de adaptacion eficiente: sirve como caso de estudio reproducible para comparar LoRA frente a fine-tuning completo en lenguas de bajos recursos, dado el bajo coste del modelo base de 270M.
- Educacion e investigacion en morfologia del urdu: permite generar ejemplos etiquetados para materiales docentes o para validar anotaciones humanas de forma semiautomatica.
- Experimentacion con modelos pequenos en hardware modesto: al ser un adaptador sobre 270M de parametros, puede ejecutarse en GPU de consumo para prototipos de investigacion sin infraestructura dedicada.
- Reproducibilidad de resultados academicos: junto con el codigo del repositorio del autor, permite replicar los experimentos de la tesis sobre UD_Urdu-UDTB y comparar variantes del adaptador CPT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo base (270M de parametros), en precision de 16 bits se situaria en torno a 0,5-1 GB de pesos, mas el coste de activaciones y del contexto, aunque esta cifra no la proporciona la model card.
- GPU recomendadas: no disponible. El ejemplo de uso emplea Unsloth y `load_in_4bit=False`, lo que sugiere ejecucion en GPU con al menos unos pocos GB de VRAM.
- GPU de consumo: previsiblemente cabe en GPUs de consumo actuales por el reducido tamano del modelo base, aunque no se documenta una configuracion probada.
- Opciones de despliegue: el ejemplo oficial usa `unsloth.FastLanguageModel` y `peft.PeftModel`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-gemma-270m-joint-cpt | 270M (base) + LoRA r=16 | no disponible (ejemplo con 512) | UPOS + lematizacion en urdu | other, no comercial | Hugging Face, 0 descargas |
| google/gemma-3-270m | 270M | no disponible en esta ficha | Modelo base generalista | Gemma Terms of Use | Hugging Face (modelo base) |
| Adaptadores especificos de UPOS para urdu (p. ej. basados en XLM-R) | no disponible | no disponible | Etiquetado morfosintactico | variable | no disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en etiquetado UPOS y lematizacion en urdu; no es adecuado para generacion de texto libre, dialogo ni otras tareas generales.
- Entrenado con solo 4.043 frases de un unico treebank (UD_Urdu-UDTB), lo que limita la cobertura de dominios, registros y variantes del urdu.
- Riesgo de alucinacion en la salida: al ser un modelo generativo, puede producir etiquetas o lemas no validos o desviarse del formato `palabra/TAG/lema`; se recomienda validacion y parseo estricto en produccion.
- La licencia "other" combina los Gemma Terms of Use con la licencia CC BY-NC-SA 4.0 de los datos de entrenamiento, por lo que el uso comercial esta restringido.
- No se documentan sesgos especificos, pero al derivar de un modelo base generalista y de un corpus academico concreto puede heredar sesgos de ambos.
- No hay informacion sobre cuantizaciones probadas, latencia ni evaluacion en dominios fuera del treebank de entrenamiento.
- El repositorio no registra descargas ni validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-joint-cpt
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Codigo y evaluacion: https://github.com/543516-collab/urdu-gemma-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Universal Dependencies, treebank UD_Urdu-UDTB: https://universaldependencies.org/ (datos hasta UD v2.14; la model card no incluye enlace directo al treebank)
