# thurstonpowers/xll-bills-qwen3.5-9b

## Resumen

XLL Bills Qwen3.5-9B es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario thurstonpowers, especializado en la conversion de proyectos de ley estadounidenses (bills) a una representacion JSON estructural denominada XLL. El modelo no es un asistente de proposito general, sino una herramienta de extraccion de estructura que transforma texto legislativo indexado en un arbol jerarquico con offsets de caracteres alineados con la fuente original.

El modelo parte de una arquitectura transformer densa de aproximadamente 9.400 millones de parametros (9.409.813.744 segun los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. Su valor reside en ofrecer una conversion fiel de legislacion a estructura con requisitos de despliegue menores que los de modelos frontera, aunque su contrato de entrada es estricto: no acepta texto plano de un proyecto de ley, sino un indice lexico disperso y sin perdida del texto fuente.

La relevancia actual del modelo radica en su enfoque de nicho: la estructuraccion automatica de documentos legislativos para pipelines de analisis juridico. El autor publica ademas una revision experimental federal mas cinco estados (`federal-state-20261118-eval200`) con evaluacion completada, si bien advierte que la calidad de produccion para Connecticut sigue sin cualificar y que los pesos de `main` corresponden unicamente al modelo federal anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune completo del base Qwen/Qwen3.5-9B); no es un adaptador LoRA |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos retenidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de lenguaje sobre Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), no un adaptador. El entrenamiento se realizo durante 2 epocas en BF16 sobre el corpus `thurstonpowers/xll-bills-structure-indexed`. El autor reporta una ablacion de 1 epoca sobre el mismo corpus y receta: 95,5 % de salidas validas y 77,0 % exactas, frente al 98,5 % y 78,0 % del checkpoint liberado, lo que indica que la segunda epoca aporta una mejora modesta pero medible en validez y exactitud.

La innovacion tecnica principal no esta en la arquitectura del modelo, sino en el protocolo de entrada y salida. La entrada es un indice lexico disperso (`start:end|JSON-string`) de la proyeccion de texto visible del proyecto de ley, donde las posiciones no listadas son espacios ASCII y los offsets son posiciones de caracteres Unicode base cero con fin exclusivo. La salida es un arbol JSON con la forma `{"tree":[tag,start,end,attributes,children]}`, donde los spans indexan el texto original recuperado, no el mensaje indexado. El prompt de sistema esta congelado byte a byte (912 bytes UTF-8, sin salto de linea final, SHA-256 `aeadf0c99b2899af415893a19fa3ece882c73974dca62969df13ead5197e91fa`) y debe usarse sin envoltorios de rol, descripciones de esquema ni bloques Markdown.

## Capacidades

- Conversion de proyectos de ley estadounidenses a JSON estructural XLL con spans alineados con la fuente original.
- Extraccion de jerarquia legislativa: niveles, encabezados, enumeradores y texto.
- Generacion de arboles con nodos de cinco campos (tag, start, end, attributes, children), hijos ordenados, no solapados y contenidos en el padre.
- Recuperacion del texto exacto mediante relleno de posiciones no listadas con espacios ASCII.
- Manejo explicito de espacios en blanco no ASCII (espacio duro U+00A0, espacio fino no separable U+202F) listados en el indice.
- Procesamiento de documentos de tipo `bills` con cabecera que declara tipo de documento y longitud en caracteres Unicode.
- Capacidades de texto e imagen-texto segun los tags del repositorio (image-text-to-text), aunque la tarea entrenada es la extraccion estructural.
- No soporta de forma entrenada el uso con texto plano: sustituir la interfaz por un prompt arbitrario queda fuera del contrato.

## Casos de uso

- Estructuracion de proyectos de ley para pipelines de analisis juridico: el modelo convierte el indice lexico de un bill en un arbol XLL que permite navegar por la jerarquia legislativa y mapear cada provision a su span exacto en el texto fuente.
- Indexacion y busqueda semantica sobre legislacion: al disponer de spans alineados con el texto original, los resultados del modelo pueden alimentar indices que enlacen consultas directamente a fragmentos concretos del documento.
- Extraccion de metadatos estructurales para bases de datos legislativas: los atributos de cada nodo permiten poblar esquemas relacionales con niveles, encabezados y enumeradores sin reescritura manual.
- Auditoria de fidelidad documental: dado que el modelo copia texto de spans fuente y no lo reescribe, sirve para verificar que una representacion estructurada no altera el contenido original.
- Procesamiento por lotes de corpus federales: el autor reporta evaluacion sobre 200 documentos federales con resultados de validez y exactitud, lo que lo hace adecuado para tareas de conversion masiva con revision posterior.
- Despliegue con requisitos moderados: al ser un modelo de 9.400 millones de parametros, puede servirse en infraestructura mas pequena que la necesaria para modelos frontera, aunque el autor no ha medido coste-efectividad ni throughput de servicio.
- Integracion en herramientas de investigacion legislativa: la disponibilidad del prompt entrenado, un ejemplo de entrenamiento y el dataset de replicacion facilita la reproduccion y la extension a otros corpus.

## Benchmarks y rendimiento

| Evaluacion | Validez | Exactitud | Node F1 | Edge F1 | Notas |
|---|---|---|---|---|---|
| Checkpoint liberado (2 epocas) | 98,5 % | 78,0 % | no disponible | no disponible | Sobre el corpus de entrenamiento/evaluacion reportado |
| Ablacion 1 epoca | 95,5 % | 77,0 % | no disponible | no disponible | Misma receta y corpus |
| Revision federal + cinco estados (`federal-state-20261118-eval200`) | 197/200 validos | 161/200 exactos (80,5 %) | .984077 | .979139 | Eval federal heredado, batch uno en RTX 5090; no equiparable en hardware/batch al resultado GB10; no es evaluacion semantica experta independiente |

El autor advierte que la calidad de produccion para Connecticut sigue sin cualificar: las 20 salidas revisadas presentaron defectos sustantivos y 17 afirmaron falsamente Washington, ya que Connecticut no estaba en el entrenamiento. Los resultados de la revision experimental no deben atribuirse a los pesos de `main`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.409.813.744 parametros en BF16, los pesos ocupan aproximadamente 18,8 GB, a lo que hay que sumar la memoria de activaciones y contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor menciona una evaluacion en RTX 5090 (batch uno) y un resultado previo en GB10, sin especificar configuraciones recomendadas.
- Cabe en GPU de consumo: probablemente en GPUs con 24 GB o mas de VRAM en BF16, aunque el autor no lo confirma; no se dispone de datos sobre cuantizaciones alternativas.
- Opciones de despliegue: la libreria declarada es transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos. El autor indica explicitamente que la mejor relacion coste-efectividad y el throughput de servicio no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Bills Qwen3.5-9B | 9.409.813.744 | no disponible | Extraccion estructural de bills a XLL | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9.400 millones | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Modelos frontera de proposito general | no disponible | no disponible | Proposito general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada. El propio autor indica que el modelo no es un competidor de proposito general de los modelos frontera.

## Limitaciones y advertencias

- El modelo no acepta texto plano de un proyecto de ley: usar texto sin procesar o aplicar los offsets de salida al mensaje indexado queda fuera del contrato entrenado y no debe esperarse que reproduzca la precision reportada.
- El prompt de sistema debe usarse byte a byte, sin envoltorios de rol, descripcion de esquema ni bloques Markdown; cualquier alteracion invalida el contrato.
- Riesgo de alucinacion estructural: en la revision experimental, 17 de 20 salidas revisadas de Connecticut afirmaron falsamente Washington.
- La calidad de produccion para Connecticut no esta cualificada; el estado no formaba parte del entrenamiento.
- Los resultados de la revision `federal-state-20261118-eval200` no son equiparables en hardware ni batch a los resultados previos y no constituyen una evaluacion semantica experta independiente.
- Los pesos de `main` corresponden al modelo federal anterior; los nuevos resultados no deben atribuirse a esos pesos.
- No se han medido la relacion coste-efectividad ni el throughput de servicio.
- No se dispone de informacion sobre sesgos, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad del modelo para produccion juridica sin revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-bills-qwen3.5-9b
- Revision experimental federal + cinco estados: https://huggingface.co/thurstonpowers/xll-bills-qwen3.5-9b/tree/federal-state-20261118-eval200
- Dataset de replicacion: https://huggingface.co/datasets/thurstonpowers/xll-bills-structure-indexed
- Revision del dataset federal + cinco estados: https://huggingface.co/datasets/thurstonpowers/xll-bills-structure-indexed/tree/federal-state-20261118
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
