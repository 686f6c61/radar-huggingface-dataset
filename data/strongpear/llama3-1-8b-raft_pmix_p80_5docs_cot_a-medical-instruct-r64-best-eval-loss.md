# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario `strongpear` sobre el modelo base `meta-llama/Llama-3.1-8B`. No es un modelo completo: los pesos distribuidos son únicamente las matrices de bajo rango que deben cargarse junto al modelo base o fusionarse con él. El identificador del repositorio sugiere una adaptación de dominio médico mediante RAFT (Retrieval-Augmented Fine-Tuning) con ejemplos de 5 documentos, un 80 % de documentos relevantes, trazas de cadena de pensamiento (CoT) y rango LoRA 64, aunque el autor no documenta ninguna de estas decisiones.

El interés del artefacto es fundamentalmente metodológico: ejemplifica el patrón habitual de adaptación de bajo coste de un modelo de 8 000 millones de parámetros para un dominio vertical, manteniendo intacto el modelo base y publicando únicamente un adaptador de menos de 1 GB. Frente a un ajuste completo, esto reduce drásticamente los requisitos de almacenamiento y permite servir el mismo modelo base con varios adaptadores intercambiables.

Ahora bien, la model card es la plantilla por defecto de HuggingFace sin rellenar (todos los campos aparecen como `[More Information Needed]`), no se declara licencia ni idiomas, no hay resultados de evaluación publicados y el repositorio acumula 0 descargas y 0 "likes". Cualquier uso en producción exige validación propia, ya que no existe evidencia publicada de su calidad ni de su comportamiento clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Llama 3.1 8B); no es MoE |
| Parametros totales | No declarado por el autor. Tamano del repositorio: 0,7 GB en safetensors (compatible con un adaptador de rango 64 en bf16/fp16) |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No declarada para el adaptador; el modelo base `meta-llama/Llama-3.1-8B` soporta 128 000 tokens |
| Tipos de cuantizacion | No declarados. El adaptador se publica en safetensors; la cuantizacion se aplicaria al modelo fusionado (GGUF, AWQ, GPTQ, FP8) |
| Idiomas soportados | No disponibles. El modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible. El modelo base se distribuye bajo Llama 3.1 Community License, cuyos terminos se heredan |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Autor | strongpear |
| Libreria | peft (framework declarado: PEFT 0.20.0) |
| Modelo base | meta-llama/Llama-3.1-8B (gated en HuggingFace) |
| Rango LoRA | 64, inferido del sufijo `r64` del identificador; no confirmado en la model card |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-18 (segun metadatos del repositorio) |
| Fecha de actualizacion | 2026-09-18 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, tecnica descrita en Hu et al. (arXiv:2106.09685) que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas proyecciones lineales. El modelo subyacente, Llama 3.1 8B, es un transformer decoder-only de 32 capas, 4 096 dimensiones de modelo, atencion con consultas agrupadas (GQA) y RoPE, preentrenado sobre mas de 15 billones de tokens. El sufijo `r64` del identificador apunta a un rango 64, valor habitual para adaptaciones de dominio que requieren mas capacidad que los rangos 8-16 tipicos.

No hay informacion verificable sobre el procedimiento de entrenamiento. La nomenclatura del repositorio (`RAFT`, `PMIX`, `P80`, `5DOCS`, `CoT`, `A-MEDICAL`, `Instruct`) sugiere, respectivamente, un ajuste aumentado por recuperacion, una mezcla de prompts, una proporcion del 80 % de documentos relevantes frente a distractores, 5 documentos por ejemplo, trazas de razonamiento encadenado, dominio medico y formato instruct. Ninguno de estos extremos esta documentado por el autor, por lo que deben tratarse como hipotesis derivadas del nombre y no como hechos. Tampoco se especifican hiperparametros, composicion del dataset, ni si hubo fases de RLHF o DPO. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre el calculador de impacto en carbono citado en la plantilla de HuggingFace, no a un paper sobre este modelo.

## Capacidades

- Generacion de texto condicionada: al ser un adaptador de instrucciones sobre Llama 3.1 8B, se espera que conserve la generacion de texto, el seguimiento de instrucciones y el razonamiento basico del modelo base, pero no hay evaluacion que lo confirme.
- Razonamiento con documentos recuperados: el sufijo RAFT y `5DOCS` sugieren entrenamiento especifico para responder a partir de un contexto de varios documentos, con trazas de cadena de pensamiento. Sin verificar.
- Ambito medico: el identificador incluye `MEDICAL`, lo que apunta a una especializacion en terminologia y preguntas clinicas. No hay datos que cuantifiquen la mejora respecto al modelo base.
- Soporte de tool calling / function calling: no declarado. El modelo base Llama 3.1 si incorpora soporte nativo de llamadas a herramientas, pero se desconoce si el ajuste LoRA lo preserva.
- Capacidades de agente y razonamiento multi-paso: no declaradas ni evaluadas.
- Capacidades multilingues: no declaradas. El modelo base soporta ocho idiomas oficiales; el ajuste, orientado presumiblemente a ingles medico, puede degradar el resto.
- Capacidad especial: posible modo de razonamiento explicito (CoT) segun el identificador, no confirmado en la documentacion.
- Vision y audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Asistente de preguntas y respuestas sobre guias clinicas: cargando el adaptador sobre Llama 3.1 8B y sirviendolo con vLLM o TGI, se puede construir un endpoint que reciba 5 fragmentos de guias recuperados por un motor de busqueda vectorial y genere respuestas con la cadena de razonamiento visible. El formato de 5 documentos del entrenamiento encaja directamente con este patron.
- Apoyo a la codificacion clinica: el modelo puede generar borradores de codigos CIE-10 o descripciones normalizadas a partir de notas en texto libre, con revision humana obligatoria dado que no existe evaluacion publicada.
- Resumen de historiales y articulos: con la ventana de 128 000 tokens del modelo base, es viable resumir documentos largos manteniendo el adaptador cargado, siempre que el ajuste no haya degradado la capacidad de contexto largo (extremo no verificado).
- Extraccion de entidades medicas para pipelines de datos: el modelo puede estructurar entradas no estructuradas (farmacos, dosis, diagnosticos) para alimentar bases de datos clinicas, integrándose tras un esquema de validacion por reglas.
- Prototipado e investigacion en recuperacion aumentada: el adaptador sirve como punto de partida reproducible para experimentos de RAFT en dominios regulados, comparando configuraciones de numero de documentos y proporcion de distractores.
- Generacion de material divulgativo sanitario: redaccion de explicaciones para pacientes a partir de documentacion tecnica, con el modelo actuando como capa de reformulacion y un revisor humano como filtro final.
- Evaluacion comparativa de tecnicas de adaptacion: al ser un LoRA de rango 64 sobre un modelo abierto muy extendido, es util como referencia para medir el coste/beneficio de LoRA frente a ajuste completo en tareas de dominio.
- Filtrado y triaje de literatura cientifica: clasificacion de resumenes y articulos por relevancia clinica dentro de un sistema de revision sistematica, con el modelo generando justificaciones breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (todos los campos figuran como `[More Information Needed]`), no hay tabla de resultados en el repositorio y la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los unicos resultados fueron herramientas en linea para reordenar paginas de PDF, sin relacion alguna con el artefacto.

## Requisitos de hardware

- Peso del adaptador: 0,7 GB en disco, cargable en CPU para su fusion con el modelo base.
- Modelo fusionado en bf16/fp16: aproximadamente 16 GB de pesos para los 8 000 millones de parametros, mas la cache KV. Con contexto de 128 000 tokens la cache KV puede superar los 20-30 GB adicionales si no se aplica cuantizacion de cache o atencion con ventana.
- Modelo fusionado en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 5-6 GB de pesos, lo que lo hace apto para GPU de consumo.
- GPU de consumo: cabe en una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) en cuantizacion de 4-8 bits y con contextos moderados. En fp16 completo requiere al menos 20-24 GB, por lo que una unica GPU de 24 GB solo es viable con contextos cortos.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S son adecuadas para servir el modelo en fp16/bf16 con lotes grandes y contextos largos. Para despliegues multiadaptador, vLLM con `--enable-lora` permite servir varios LoRA sobre un mismo modelo base compartido.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporte nativo de LoRA), TGI, y llama.cpp/Ollama tras fusionar el adaptador en un GGUF. Es necesario aceptar la licencia de Llama 3.1 en HuggingFace para descargar el modelo base, que esta restringido (gated).
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss | Adaptador LoRA sobre 8B (tamano no declarado) | No declarado (base: 128 000 tokens) | safetensors (PEFT) | No disponible | Publico, 0 descargas |
| meta-llama/Llama-3.1-8B | 8 030 millones | 128 000 tokens | safetensors, GGUF (comunitario) | Llama 3.1 Community License | Publico, acceso restringido |
| meta-llama/Llama-3.1-8B-Instruct | 8 030 millones | 128 000 tokens | safetensors | Llama 3.1 Community License | Publico, acceso restringido |

No se dispone de datos verificados en esta busqueda para comparar con adaptaciones medicas alternativas del mismo tamano (por ejemplo, derivados de Mistral 7B o Llama 2 entrenados sobre corpus clinicos). Cualquier comparacion de rendimiento con ellas seria especulativa mientras el autor no publique evaluaciones. La unica diferencia contrastable frente al modelo base es el coste de almacenamiento (0,7 GB del adaptador frente a los aproximadamente 16 GB de pesos del modelo completo).

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin descripcion, hiperparametros, datos de entrenamiento ni instrucciones de uso.
- Licencia no declarada: no se especifica que terminos rigen el adaptador. Al derivar de Llama 3.1, se heredan las restricciones de la Llama 3.1 Community License, incluida la clausula de uso aceptable y la obligacion de atribucion; el uso comercial debe revisarse con atencion.
- Modelo base con acceso restringido: es necesario solicitar permiso a Meta en HuggingFace para descargar `meta-llama/Llama-3.1-8B`, lo que condiciona cualquier despliegue.
- Ambiguedad sobre el modelo base: el identificador incluye `Instruct`, pero el tag `base_model` apunta a `meta-llama/Llama-3.1-8B` sin sufijo Instruct. Cargar el adaptador sobre el checkpoint equivocado o con una plantilla de chat distinta puede degradar gravemente las respuestas.
- Dominio sanitario de alto riesgo: un modelo medico sin evaluacion publicada no debe usarse para diagnostico, prescripcion ni triaje clinico. No es un producto sanitario y no ha pasado ninguna validacion regulatoria.
- Riesgo de alucinacion: no hay datos sobre la tasa de fabricacion de referencias, dosis o diagnosticos, un fallo especialmente grave en el ambito clinico.
- Idiomas no declarados: no consta que el ajuste preserve el rendimiento multilingue del modelo base; es probable que el entrenamiento se haya realizado mayoritariamente en ingles y que el rendimiento en castellano sea inferior.
- Sin validacion comunitaria: 0 descargas y 0 "likes" implican que no hay terceros que hayan reproducido ni auditado el artefacto.
- Sesgos: no se ha publicado ningun analisis de sesgos demograficos, de genero ni etnicos. En datos clinicos, estos sesgos pueden amplificarse y tener consecuencias directas sobre pacientes.
- Fechas de creacion y actualizacion declaradas como 2026-09-18, posteriores a la redaccion habitual de estas fichas; conviene verificar la coherencia de los metadatos.
- Reproducibilidad limitada: la combinacion de parametros sugerida por el nombre (RAFT, 5 documentos, 80 % de relevantes, CoT, rango 64) no esta confirmada, por lo que replicar el entrenamiento tal cual no es posible con la informacion disponible.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en la plantilla de la model card (calculador de impacto en carbono, no relacionada con el modelo): https://arxiv.org/abs/1910.09700
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los resultados devueltos correspondian a herramientas en linea de organizacion de PDF (iLovePDF, Smallpdf, Sejda, FreeConvert, PDF24) y no guardan relacion con el artefacto.
