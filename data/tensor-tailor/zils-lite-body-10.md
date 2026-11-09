# tensor-tailor/zils-lite-body-10

## Resumen

zils-lite-body-10 es un ajuste fino (fine-tune) del modelo qhoenix/zils-lite-decision-v9, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B y forma parte del pool de "sopas" (soups) del subred Bittensor 127 bajo la etiqueta d3-lite. Lo publica el usuario tensor-tailor con licencia Apache-2.0 y un total de 852.985.920 parametros reales segun los pesos en safetensors. Su proposito no es la generacion abierta de texto, sino actuar como "cuerpo de decision": un modelo pequeno especializado en resolver tareas de clasificacion y eleccion multiple (choice, yes/no, score) dentro de las 15 familias "known" que define el examen del ecosistema Zils.

El modelo se ha entrenado con LoRA de rango 32 sobre las proyecciones de atencion y Gated-DeltaNet de todas las capas de lenguaje (sin tocar el MLP), con un objetivo compuesto de entropia cruzada sobre la etiqueta dorada mas un termino Brier sobre las opciones. El resultado es un ajuste de 4.262 filas balanceadas por clase, con etiquetas humanas o derivadas por codigo, y sin usar salidas de otros modelos como etiquetas. La publicacion corresponde al 75% del entrenamiento (1,5 de 2 epocas), fusionado en los pesos.

Es relevante ahora porque ejemplifica una tendencia concreta: modelos de menos de mil millones de parametros, con contexto corto, entrenados para una tarea acotada de decision, que pueden desplegarse en hardware muy modesto. No obstante, la informacion publica es muy limitada: no hay benchmarks, no se declaran idiomas y el pipeline no esta disponible, por lo que cualquier evaluacion de calidad debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (familia Qwen/Qwen3.5-0.8B) con proyecciones Gated-DeltaNet; fine-tune LoRA fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (el entrenamiento uso maximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code y tags qwen3_5) |

## Arquitectura y entrenamiento

La base es un transformer de la familia Qwen3.5-0.8B, que incorpora proyecciones Gated-DeltaNet ademas de la atencion habitual. Sobre ese cuerpo, el autor aplica LoRA de rango 32, alpha 64 y dropout 0.05 unicamente en las proyecciones de atencion y Gated-DeltaNet de cada capa de lenguaje, dejando el MLP sin adaptar. Tras el entrenamiento, los adaptadores se fusionan en los pesos (sin promedio de pesos). La tasa de aprendizaje es 2e-5 con AdamW y weight decay 1.0 sobre los pesos LoRA, batch 8 con acumulacion 2, warm-up de 50 pasos seguido de coseno, 2 epocas, maximo 2.048 tokens y semilla 4343.

La funcion de perdida por fila combina entropia cruzada sobre la etiqueta dorada y un termino Brier de peso 1.0 sobre las opciones, sin termino KL respecto al modelo inicial ni salidas de profesor. Los datos son 4.262 filas balanceadas por clase en 15 familias (5 categorias x choice/yes-no/score), con etiquetas humanas o derivadas por codigo de conjuntos como PIQA, MultiNLI, Social IQa, 20 Newsgroups, STS Benchmark, SST-5, SNLI, RTE, QNLI, iSarcasmEval, SQuAD 2.0, ToolACE, GoEmotions, TweetEval y Hermes function-calling. La regla de dificultad selecciona filas humanas donde el modelo de partida asigna entre 0,30 y 0,90 de probabilidad a la respuesta correcta, con un tope del 50% por fuente.

## Capacidades

- Clasificacion y eleccion multiple: disenado para tareas de tipo choice, yes/no y score en las 15 familias del examen Zils (razonamiento, lenguaje, retrieval, herramientas y artes).
- Puntuacion de similitud y sentimiento: entrenado con datos de STS Benchmark y SST-5, puede emitir niveles ordinales de similitud o sentimiento.
- Inferencia de lenguaje natural: cubierto por MultiNLI, SNLI, RTE y QNLI para tareas de entailment y respuesta de pregunta a nivel de frase.
- Razonamiento fisico cotidiano: las filas de PIQA le permiten discriminar soluciones correctas e incorrectas a objetivos practicos.
- Razonamiento social: Social IQa aporta ejemplos de eleccion de respuesta socialmente adecuada.
- Clasificacion tematica: 20 Newsgroups le permite asignar un texto a una categoria tematica.
- Tool calling basico: las filas de ToolACE y Hermes function-calling le ensenan a seleccionar la llamada correcta frente a distractores con argumentos invalidos.
- Deteccion de sarcasmo y emociones: iSarcasmEval, GoEmotions y TweetEval emotion cubren etiquetado de sarcasmo y emociones en texto corto.
- No se declaran capacidades de vision, audio, agentes multi-paso ni modo thinking.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar una consulta a una categoria tematica o a una etiqueta de sentimiento, aprovechando su entrenamiento en 20 Newsgroups, SST-5 y GoEmotions, con un coste de inferencia muy bajo al tener menos de mil millones de parametros.
- Filtrado de resenas y opiniones: las filas de SST-5 y TweetEval emotion permiten puntuar resenas en cinco niveles de sentimiento o etiquetar emociones concretas, integrable en un pipeline de moderacion.
- Verificacion de entailment en recuperacion aumentada: con las filas de MultiNLI, SNLI, RTE y QNLI, puede comprobar si un fragmento recuperado respalda una afirmacion, como paso de reranking en un sistema RAG.
- Seleccion de herramienta en un agente: las filas de ToolACE y Hermes function-calling le permiten elegir entre varias llamadas candidatas cual es la correcta, descartando aquellas con argumentos que rompen un requisito.
- Deteccion de sarcasmo en redes sociales: entrenado con iSarcasmEval, puede marcar tuits sarcasticos antes de pasarlos a un analisis de sentimiento mas costoso.
- Puntuacion de similitud semantica: con STS Benchmark puede emitir un nivel ordinal de similitud entre dos frases, util para deduplicacion o busqueda semantica ligera.
- Razonamiento fisico en asistentes de instrucciones: las filas de PIQA permiten discriminar entre soluciones plausibles e implausibles a un objetivo cotidiano, como paso de validacion en un asistente domestico.
- Evaluacion de respuestas sociales: Social IQa le permite puntuar la adecuacion social de una respuesta candidata en un chatbot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB. No se publican versiones GGUF oficiales, por lo que la cuantizacion requeriria conversion propia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas, e incluso en CPU con llama.cpp tras conversion a GGUF.
- Opciones de despliegue: el modelo usa custom_code y tags qwen3_5, por lo que requiere `trust_remote_code=True` en transformers. No se declaran integraciones con vLLM, TGI, llama.cpp u Ollama; estas dependen de la compatibilidad de la arquitectura Qwen3.5 con cada runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tensor-tailor/zils-lite-body-10 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune de decision sobre Qwen3.5-0.8B, sin benchmarks publicados |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Modelo base del que parte este fine-tune; mismo proposito de decision |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | Modelo fundacional de la familia; capacidad generalista, no especializado en decision |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas fuera del conjunto de entrenamiento es desconocido.
- El modelo esta especializado en 15 familias de decision concretas; su comportamiento en generacion abierta de texto o en tareas fuera de ese dominio no esta documentado.
- No se declaran idiomas soportados; los conjuntos de entrenamiento son mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto.
- La longitud de contexto no esta declarada; el entrenamiento uso un maximo de 2.048 tokens, lo que sugiere un limite practico bajo.
- Riesgo de alucinacion y de sobreajuste a los formatos de eleccion multiple del examen Zils; puede fallar en formatos libres.
- Algunas fuentes de datos (20 Newsgroups, STS Benchmark, SST-5, RTE, TweetEval) no tienen licencia abierta declarada y se usaron bajo los terminos de sus autores originales; esto puede afectar a la redistribucion o al uso comercial de los datos subyacentes, aunque los pesos se publican como Apache-2.0.
- El modelo requiere `trust_remote_code=True` por el uso de custom_code, lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Es la publicacion al 75% del entrenamiento (1,5 de 2 epocas), no el checkpoint final; el autor lo indica explicitamente.
- No se han publicado datos de sesgo; dado el uso de conjuntos como MultiNLI o Social IQa, es probable que herede sesgos de esos corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-10
- Modelo base: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Sitio de Zils: https://zils.ai/
- PIQA: https://yonatanbisk.com/piqa/
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- Social IQa: https://allenai.org/data/socialiqa
- 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
- STS Benchmark: https://huggingface.co/datasets/mteb/stsbenchmark-sts
- SST-5: https://nlp.stanford.edu/sentiment/
- SNLI: https://nlp.stanford.edu/projects/snli/
- RTE (GLUE): https://gluebenchmark.com/
- QNLI / SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
- TweetEval: https://github.com/cardiffnlp/tweeteval
