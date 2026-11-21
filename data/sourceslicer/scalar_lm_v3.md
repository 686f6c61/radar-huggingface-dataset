# sourceslicer/scalar_lm_v3

## Resumen

SCALAR 3.0 identifier tagger es un modelo de etiquetado de secuencias (token classification) especializado en asignar etiquetas de parte de la oracion (part-of-speech) a las palabras que componen los identificadores en codigo fuente. Desarrollado por el grupo SCANL (Christian Newman y colaboradores), transforma identificadores como `getUserToken` en una secuencia de etiquetas gramaticales (`V NM N`), lo que facilita tareas de analisis de codigo, documentacion automatica y comprension semantica de identificadores.

Tecnicamente se construye sobre DistilBERT uncased (66,37 millones de parametros) al que se anade una capa CRF personalizada que decodifica sobre las palabras del identificador, incorporando tokens de caracteristica para el contexto del identificador (FUNCTION, PARAMETER, ATTRIBUTE, etc.) y su tipo declarado. El modelo se distribuye como checkpoint de la version 3.0 de la herramienta SCALAR y esta pensado para cargarse a traves de dicha herramienta, no mediante `AutoModel`.

Su relevancia radica en que aborda un problema poco cubierto por los modelos generalistas: la descomposicion gramatical de identificadores en codigo real, con metricas reportadas de hasta el 92,4% de precision en identificadores reales y del 97,3-100% en proyectos no vistos. Esta publicado con licencia GPL-3.0 y solo soporta ingles en su interfaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder uncased) + capa CRF personalizada |
| Parametros totales | 66.370.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilbert-base-uncased |
| Pipeline | token-classification |
| Tamano del repo | 0,3 GB |
| Etiquetas de salida | N, NPL, NM, V, VM, P, DT, CJ, D, PRE |

## Arquitectura y entrenamiento

El modelo combina un encoder DistilBERT uncased de 66,37 millones de parametros con una capa CRF (Conditional Random Field) que decodifica la secuencia de etiquetas sobre las palabras del identificador. Ademas del texto del identificador, la entrada incorpora tokens de caracteristica que codifican el contexto del identificador (FUNCTION, PARAMETER, ATTRIBUTE, entre otros) y su tipo declarado, lo que aporta informacion estructural al etiquetado. La capa CRF es personalizada, por lo que el checkpoint no es compatible con `AutoModel` de transformers y debe cargarse mediante la herramienta SCALAR.

En cuanto a los datos de entrenamiento, la model card reporta una evaluacion con validacion cruzada de 5 folds y un holdout sobre 4.261 identificadores reales, promediando 3 semillas, con un 90,45% (±0,29) de precision. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El parametro `confidence_temperature` (1,5) del `config.json` escala las marginales de confianza sin alterar las etiquetas asignadas.

## Capacidades

- Etiquetado de parte de la oracion de identificadores en codigo fuente (`getUserToken` → `V NM N`).
- Decodificacion estructurada mediante CRF sobre la secuencia de palabras del identificador.
- Incorporacion de contexto estructural del identificador (rol como FUNCTION, PARAMETER, ATTRIBUTE, etc.) y de su tipo declarado.
- Salida con confianza por token (marginales escaladas por `confidence_temperature`).
- Procesamiento por lotes mediante el contrato JSON de la herramienta SCALAR.
- Soporte de 10 etiquetas gramaticales: N, NPL, NM, V, VM, P, DT, CJ, D, PRE.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento multi-paso.
- Capacidad multilingue limitada al ingles en la interfaz del modelo.

## Casos de uso

- Documentacion automatica de APIs: el modelo etiqueta cada palabra de los identificadores de un repositorio para generar descripciones gramaticales legibles, lo que ayuda a redactar docstrings y guias de referencia a partir del codigo existente.
- Refactorizacion asistida: al conocer la funcion gramatical de cada palabra de un identificador (verbo, sustantivo, modificador), se pueden proponer renombrados coherentes y detectar identificadores mal formados en un proceso de linting semantico.
- Analisis de calidad de codigo: integrado en pipelines de CI, permite medir la consistencia gramatical de los identificadores de un proyecto y establecer reglas de estilo basadas en la estructura linguistica.
- Indexacion y busqueda semantica de codigo: las etiquetas generadas sirven como caracteristicas adicionales para motores de busqueda de codigo que necesitan distinguir, por ejemplo, funciones de obtencion (`V`) de entidades de datos (`N`).
- Investigacion en ingenieria de software: el modelo proporciona una base reproducible para estudios empiricos sobre nomenclatura de identificadores, con metricas de precision documentadas sobre codigo real.
- Migracion entre lenguajes: al etiquetar identificadores de un proyecto C/C++/Java/C#, se pueden mapear convenciones de nomenclatura al estilo de otro lenguaje de forma semiautomatica.
- Generacion de resumenes de clases y modulos: combinando las etiquetas de los identificadores con su contexto estructural, se pueden producir resumenes de alto nivel de la API publica de un componente.

## Benchmarks y rendimiento

| Evaluacion | Precision en identificadores |
|---|---|
| Codigo real (4.261 identificadores, 5-fold out-of-fold + holdout), media de 3 semillas | 90,45% (±0,29) |
| Identificadores reales en el holdout de este checkpoint (853) | 92,4% |
| 375 identificadores aleatorios de 15 proyectos open source no vistos, revision manual | 97,3% (C/C++/Java), 100% (C#) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 66,37 millones de parametros del checkpoint (0,3 GB de repo); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: la via oficial es la herramienta SCALAR (`scalar-tagger serve --stdio`), que carga el repo en un commit fijado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que la capa CRF personalizada impide el uso de `AutoModel`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCALAR 3.0 identifier tagger | 66,37 M | no disponible | Etiquetado POS de identificadores | GPL-3.0 | Hugging Face + repo SCANL |
| DistilBERT base uncased | 66,36 M | 512 tokens | Masked LM / clasificacion generica | Apache-2.0 | Hugging Face |
| Modelos NER genericos (p. ej. bert-base-NER) | ~110 M | 512 tokens | Reconocimiento de entidades | varía | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con alternativas especializadas en etiquetado de identificadores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles en su interfaz; los identificadores en otros idiomas o con convenciones no inglesas pueden degradar su precision.
- La capa CRF personalizada impide cargarlo mediante `AutoModel`; es obligatorio usar la herramienta SCALAR, lo que limita su integracion en stacks estandar de transformers.
- No se documentan sesgos especificos, pero al entrenarse sobre codigo open source puede heredar sesgos de estilo y convenciones de los proyectos de origen.
- Riesgo de alucinacion en el sentido de asignar etiquetas gramaticales incorrectas en identificadores ambiguos o mal formados; la confianza por token permite filtrar casos dudosos.
- La licencia GPL-3.0 es copyleft fuerte: su uso en productos propietarios o su integracion en software comercial cerrado requiere revision legal y, en muchos casos, la liberacion del codigo derivado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion en produccion es practicamente nula y carece de validacion externa independiente.
- No se especifica la longitud de contexto soportada ni el numero de tokens de entrenamiento, lo que dificulta estimar su comportamiento en identificadores muy largos.

## Enlaces

- Hugging Face: https://huggingface.co/sourceslicer/scalar_lm_v3
- Repositorio SCALAR: https://github.com/SCANL/scanl_tagger
- Version fijada de la herramienta: https://github.com/SCANL/scanl_tagger.git@v3.0.0
- Paper citado: Newman et al., "SCALAR: A Part-of-speech Tagger for Identifiers", ICPC Tool Demonstrations Track, 2025.
