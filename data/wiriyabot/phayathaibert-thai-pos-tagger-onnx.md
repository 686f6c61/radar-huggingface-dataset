# wiriyabot/phayathaibert-thai-pos-tagger-onnx

## Resumen

El modelo `wiriyabot/phayathaibert-thai-pos-tagger-onnx` es una version exportada a ONNX del etiquetador de categorias gramaticales (POS tagging) en tailandes desarrollado originalmente por el grupo nlp-chula. Concretamente, se trata de una conversion del modelo `nlp-chula/phayathaibert-thai-pos-tagger`, que a su vez es un ajuste fino de PhayaThaiBERT sobre el treebank UD Thai-TUD para la tarea de Universal POS (UPOS). El repositorio no entrena nada nuevo: unicamente exporta los pesos y los empaqueta para ejecutarse con `onnxruntime` y `tokenizers`, sin PyTorch ni Transformers.

El problema que resuelve es el etiquetado morfosintactico de palabras tailandesas ya segmentadas. Para cada palabra de entrada devuelve una de las 15 etiquetas UPOS (NOUN, VERB, PRON, ADP, etc.), tomando la prediccion del primer subword de cada palabra, que es el alineamiento con el que se entreno el modelo original. La relevancia de esta version radica en su eficiencia: ocupa 532 MB frente a los 1.108 MB del modelo PyTorch, mantiene practicamente la misma precision (91,21% frente a 91,16%) y reduce la latencia de unos 120 ms a 35-45 ms por frase en CPU.

La arquitectura de base es CamemBERT (encoder transformer del tipo RoBERTa), heredada de PhayaThaiBERT. La longitud de secuencia esta limitada a 510 tokens utiles, incluyendo los tokens especiales de inicio y fin. La licencia es MIT, igual que la del modelo original, y esta pensado para integrarse como motor de POS tagging en PyThaiNLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo CamemBERT (base de PhayaThaiBERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 510 tokens utiles (512 incluyendo `<s>` y `</s>`) |
| Tipos de cuantizacion | int8 en tablas de embeddings (Gather); float32 en el resto de pesos |
| Idiomas soportados | tailandes (th) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), con `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer del estilo CamemBERT, una variante de RoBERTa adaptada originalmente al frances y reutilizada por PhayaThaiBERT para el tailandes. El modelo realiza una tarea de clasificacion de tokens (`token-classification`) sobre la capa de representacion contextual, proyectando la salida a 15 etiquetas UPOS definidas en el campo `id2label` del `config.json`. El presente repositorio no modifica la arquitectura ni reentrena: exporta el grafo del modelo original a ONNX con ejes dinamicos de batch y secuencia, y aplica una cuantizacion selectiva.

La innovacion tecnica de esta conversion esta en la estrategia de cuantizacion. Solo se cuantizan a int8 las tablas de embeddings (operador `Gather`), que concentran el 69% de los pesos y toleran bien la precision reducida. Las capas `MatMul` de atencion y de feed-forward se mantienen en float32, porque cuantizarlas tambien cuesta 3,3 puntos de precision UPOS y ademas hace que los resultados dependan del tamano de batch. El resultado es un modelo de 532 MB que reproduce al 99,64% las predicciones del original en PyTorch. En cuanto a los datos de entrenamiento del modelo base, corresponden al treebank UD Thai-TUD (licencia CC BY-SA 4.0), y la model card original declara el uso del dataset `universal_dependencies`. No se detalla en la informacion disponible si hubo fases de RLHF o DPO.

## Capacidades

- Etiquetado gramatical Universal POS (UPOS) sobre palabras tailandesas previamente segmentadas, con 15 etiquetas posibles.
- Clasificacion de tokens a nivel de subword con alineamiento por palabra (se usa la prediccion del primer subword).
- Inferencia en CPU mediante `onnxruntime` sin dependencia de PyTorch ni Transformers.
- Procesamiento por lotes (batching) con resultados identicos a la ejecucion frase a frase.
- Tokenizacion reproducible: el `tokenizers` encoding coincide con el tokenizador de Transformers en todas las frases de test.
- Capacidad multilingue limitada: exclusivamente tailandes (th).
- No dispone de tool calling, function calling, agentes ni modo de razonamiento extendido; es un componente de NLP especializado y acotado.

## Casos de uso

- Motor de POS tagging en PyThaiNLP: el repositorio se creo explicitamente como motor `pos_tag(engine="phayathaibert")` para la issue #1536 del proyecto, gestionando automaticamente el troceado de frases largas en bloques de palabras completas.
- Preprocesado para analisis de dependencias: las etiquetas UPOS alimentan parsers de dependencias en cascada sobre tailandes, mejorando la precision de la estructura sintactica.
- Extraccion de informacion y construccion de NER downstream: las categorias gramaticales sirven como features para detectar entidades, relaciones y patrones en texto tailandes.
- Analitica de texto y mineria de opiniones: clasificar sustantivos, adjetivos y verbos permite segmentar opiniones, extraer sujetos y analizar sentimiento sobre resenas tailandesas.
- Preprocesado de pipelines de traduccion automatica: inyectar informacion morfosintactica ayuda a desambiguar el tailandes, un idioma sin separacion de palabras ni morfologia flexiva marcada.
- Busqueda y recuperacion de informacion multilingue: filtrar y ponderar terminos por categoria gramatical para mejorar el ranking en motores de busqueda con corpus tailandeses.
- Despliegue en entornos sin GPU: al ejecutarse con `onnxruntime` en CPU a 35-45 ms por frase, es adecuado para servicios de bajo coste o edge.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test UD Thai-TUD (363 frases, 7.683 palabras, con segmentacion gold). Ejecucion en CPU (Intel Core i5-1340P) con onnxruntime 1.30.

| Version | Tamano | Precision UPOS | Coincidencia con PyTorch |
|---|---|---|---|
| PyTorch original | 1.108 MB | 91,16% | — |
| ONNX float32 | 1.108 MB | 91,16% | 100% |
| ONNX, embeddings int8 (este repositorio) | 532 MB | 91,21% | 99,64% |
| ONNX, int8 en todas las capas (no usado) | 278 MB | 87,91% | 92,05% |

Notas de rendimiento: el modelo ONNX promedia 35-45 ms por frase en la CPU citada, frente a unos 120 ms de PyTorch. La model card original reporta 90,64%, una cifra ligeramente inferior medida con un script de evaluacion distinto. No se han publicado resultados de benchmarks adicionales (como MMLU o HumanEval) por tratarse de un modelo especializado y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la version int8 (modelo de 532 MB); alrededor de 1,1 GB si se usa float32.
- GPU recomendadas: no requiere GPU; funciona plenamente en CPU. Cualquier GPU consumer, incluidas GTX 1050 o superiores, es mas que suficiente.
- Cabe en cualquier GPU consumer y en practicamente cualquier CPU moderna; el cuello de botella es el ancho de banda de memoria y el coste del tokenizador, no el computo.
- Opciones de despliegue: `onnxruntime` (CPU o CUDA), integracion directa en PyThaiNLP como motor `phayathaibert`; tambien puede cargarse con librerias compatibles con ONNX.
- Latencia y throughput: aproximadamente 35-45 ms por frase en CPU Intel Core i5-1340P; con batching se procesan varias frases con salidas identicas.
- Consumo de disco: 0,5 GB de repositorio (incluye `model.onnx`, `tokenizer.json`, `config.json` y scripts de exportacion e inferencia).

## Comparativa con modelos similares

No se proporcionan datos de otros etiquetadores de POS tailandeses comparables en la informacion disponible. La comparacion interna entre variantes de este mismo modelo se recoge en la seccion de benchmarks. Como referencia dentro del propio repositorio:

| Version | Tamano | Precision UPOS | Licencia |
|---|---|---|---|
| ONNX int8 (este repositorio) | 532 MB | 91,21% | MIT |
| ONNX float32 | 1.108 MB | 91,16% | MIT |
| PyTorch original (nlp-chula) | 1.108 MB | 91,16% | MIT |
| ONNX int8 en todas las capas | 278 MB | 87,91% | MIT |

Comparativa con etiquetadores de POS alternativos para tailandes: no disponible.

## Limitaciones y advertencias

- Requiere entrada pre-segmentada: el modelo no segmenta el texto tailandes, espera una lista de palabras ya divididas.
- Limite estricto de 510 tokens utiles: las secuencias mas largas fallan en tiempo de ejecucion y deben trocearse previamente en bloques de palabras completas.
- No es un modelo generativo: solo produce etiquetas POS; no genera texto, no razona y no soporta tool calling.
- Cobertura linguistica reducida a tailandes; no hay soporte para otros idiomas.
- La precision reportada (91,21%) procede de un unico conjunto de test (UD Thai-TUD) con segmentacion gold; el rendimiento con segmentacion automatica puede degradarse.
- La cuantizacion int8 en embeddings introduce una discrepancia del 0,36% respecto a las predicciones de PyTorch, aceptable para la mayoria de casos pero relevante si se exige reproducibilidad exacta.
- Uso de las tablas de embeddings en int8: si se cuantizan tambien las capas de atencion y feed-forward, la precision cae 3,3 puntos y los resultados dependen del batch, por lo que no se recomienda.
- Licencia MIT para el modelo, pero los datos de entrenamiento (UD Thai-TUD) estan bajo CC BY-SA 4.0, lo que puede requerir atribucion y compartir-igual en obras derivadas del corpus.
- El modelo deriva de un ajuste fino sobre PhayaThaiBERT; puede heredar sesgos presentes en el corpus tailandes de origen.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/wiriyabot/phayathaibert-thai-pos-tagger-onnx
- Modelo base PyTorch: https://huggingface.co/nlp-chula/phayathaibert-thai-pos-tagger
- PhayaThaiBERT: https://huggingface.co/clicknext/phayathaibert
- Organizacion nlp-chula: https://huggingface.co/nlp-chula
- PyThaiNLP (repositorio): https://github.com/PyThaiNLP/pythainlp
- PyThaiNLP (issue #1536): https://github.com/PyThaiNLP/pythainlp/issues/1536
- Treebank UD Thai-TUD: https://github.com/UniversalDependencies/UD_Thai-TUD
- Paper PhayaThaiBERT (ACM TALLIP, 2025): http://dx.doi.org/10.1145/3765962
