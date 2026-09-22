# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_DoRA_llama-3.2

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA/DoRA) denominado `xnli_en_and_ur_5000_percentage_1_40_DoRA_llama-3.2`, publicado por el usuario de HuggingFace WijewardhanaNT y construido sobre el modelo base `meta-llama/Llama-3.2-3B`. Por la nomenclatura del identificador, se trata de un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural entre pares de frases) sobre un subconjunto de 5.000 ejemplos en ingles y urdu, con alguna configuracion de entrenamiento codificada como "1_40" cuyo significado no se documenta en la model card. El repositorio ocupa 0,4 GB y contiene exclusivamente los pesos del adaptador, no el modelo completo.

El modelo base Llama 3.2 3B es un transformer decoder-only de 3.210 millones de parametros, con atencion de consultas agrupadas (GQA) y una ventana de contexto de hasta 128.000 tokens, desarrollado por Meta. El valor practico de este adaptador reside en que permite reutilizar esa arquitectura para clasificacion de relaciones textuales en un par de idiomas poco cubiertos por los modelos generalistas, a un coste de almacenamiento y de computo muy reducido en comparacion con un ajuste fino completo.

Es importante senalar que la model card esta practicamente vacia (conserva las plantillas con "[More Information Needed]" en todas las secciones) y que el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. No se han publicado resultados de evaluacion, hiperparametros concretos, composicion del dataset ni licencia especifica del adaptador, por lo que cualquier uso en produccion exige una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT tipo DoRA/LoRA sobre transformer decoder-only (Llama 3.2 3B) |
| Parametros totales | no disponible (adaptador; el repositorio ocupa 0,4 GB y no incluye el modelo base de 3.210 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Llama 3.2 3B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se publica sin cuantizar en safetensors y puede combinarse con el modelo base y cuantizarse externamente (bitsandbytes 8/4-bit, GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible en la model card; el identificador sugiere ingles y urdu, sin evaluacion publicada |
| Licencia | no disponible para el adaptador; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT, `adapter_config.json`, PEFT 0.17.1) |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 3.2 3B: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, codificacion posicional RoPE y atencion GQA con 24 cabezas de consulta y 8 de clave/valor sobre 28 capas. El modelo base fue obtenido por poda estructurada del Llama 3.1 8B seguido de destilacion de conocimiento desde los modelos mayores de la familia, y fue entrenado con aproximadamente 9 billones de tokens. La etiqueta `lora` y el sufijo `DoRA` del identificador indican que el ajuste se realizo con Weight-Decomposed Low-Rank Adaptation, una variante que descompone el peso preentrenado en magnitud y direccion y aplica la actualizacion de bajo rango solo sobre el componente direccional.

No se dispone de informacion sobre el numero exacto de modulos objetivo, el rango, el alpha, la tasa de aprendizaje, el numero de epocas ni la precision de entrenamiento. Tampoco se documenta si hubo mezcla con datos generales para mitigar el olvido catastrofico, ni fases de RLHF o DPO: al tratarse de un ajuste supervisado sobre un corpus de inferencia textual, lo mas probable es que no las haya, pero no puede confirmarse. El unico dato de entorno disponible es la version de PEFT empleada (0.17.1). La nomenclatura `5000_percentage_1_40` sugiere 5.000 ejemplos y una configuracion "1_40" sin definir, posiblemente relacionada con el porcentaje de datos o con el rango del adaptador; el autor mantiene repositorios hermanos con esquemas de nombres equivalentes (`xnli_en_and_hi_5000_percentage_1_40_DoRA`, `xnli_en_and_ur_5000_percentage_1_40_AdaLoRA`, `xnli_en_and_ur_5000_percentage_1_40_DoRA_Similar_Param`), lo que apunta a una comparativa sistematica entre variantes de bajo rango.

## Capacidades

- Clasificacion de relaciones textuales: el adaptador esta especializado, por el nombre y el dataset asociado, en la tarea XNLI de inferencia de lenguaje natural (implicacion, neutralidad y contradiccion) sobre pares de frases.
- Generacion de texto condicionada: al ser un adaptador de `text-generation` sobre un modelo causal, tecnicamente puede generar texto libre, aunque el ajuste sobre datos NLI degrada previsiblemente esa capacidad frente al modelo base.
- Cobertura bilingue potencial: el identificador apunta a ingles y urdu; no hay confirmacion documentada de calidad en ninguno de los dos.
- Soporte de tool calling: no documentado. El modelo base Llama 3.2 3B soporta function calling, pero no hay evidencia de que el adaptador preserve esa capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco probable dado el tipo de ajuste.
- Capacidades multilingues adicionales: no documentadas; el modelo base cubre oficialmente ocho idiomas (ingles, aleman, frances, italiano, portugues, espanol, hindi y tailandes), entre los que no figura el urdu.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Verificacion de afirmaciones (fact-checking) en flujos automatizados: el adaptador puede clasificar si un pasaje de evidencia implica, contradice o es neutro respecto a una afirmacion, integrándose como clasificador de segunda etapa en un pipeline que recupere primero los pasajes relevantes.
- Reranking en sistemas RAG: dado un par (consulta, fragmento recuperado), puede puntuar la relacion de implicacion para reordenar los documentos antes de pasarlos al generador, reduciendo el ruido en la ventana de contexto.
- Moderacion de contenido asistida: deteccion de contradicciones entre el texto de una publicacion y una politica o clausula de referencia, marcando casos para revision humana.
- Anotacion y control de calidad de corpus: uso como preanotador de datasets NLI en ingles y urdu, con revision posterior, para acelerar la construccion de recursos en un idioma con poca cobertura.
- Evaluacion de consistencia en resumenes: comprobar si un resumen generado implica o contradice el documento fuente, como metrica automatica complementaria a ROUGE o BERTScore.
- Busqueda semantica con filtrado por relacion: combinado con un retriever, descartar pares cuya relacion semantica no alcance el umbral de implicacion exigido por la aplicacion.
- Investigacion academica sobre adaptacion eficiente: el repositorio forma parte de una serie de variantes (DoRA frente a AdaLoRA, distintos porcentajes de datos), lo que lo convierte en material de comparacion para estudios sobre tecnicas de bajo rango.

En todos estos escenarios debe tenerse en cuenta que no existe ninguna evaluacion publicada que respalde el rendimiento: los casos descritos son aplicaciones plausibles del tipo de modelo, no capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador conserva la seccion de evaluacion sin rellenar y no incluye metricas de exactitud sobre el conjunto de test de XNLI, ni comparaciones con el modelo base sin ajustar o con otras variantes del mismo autor. Tampoco se documentan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,4 GB en disco; en memoria, los pesos del adaptador en precision completa ocupan del orden de unos cientos de megabytes, aunque la cifra exacta depende del rango y de los modulos objetivo, no documentados.
- VRAM del modelo base en fp16/bf16: en torno a 6,5 GB solo para los pesos, mas la cache KV, que crece linealmente con la longitud de contexto y el tamano de lote.
- VRAM del modelo base cuantizado: aproximadamente 2 GB en 4-bit y 3,5-4 GB en 8-bit, excluyendo cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para inferencia en fp16 con contextos moderados; para lotes grandes o contextos muy largos conviene una A100, H100 o L40S.
- Cabe en GPU de consumo: si. El modelo base de 3.210 M de parametros es desplegable en tarjetas de gama media de 8-12 GB, y el adaptador apenas anade huella.
- Opciones de despliegue: el adaptador se carga con la libreria `peft` sobre `transformers`; tambien puede fusionarse con el modelo base y servirse con vLLM, TGI, Ollama o llama.cpp tras convertir los pesos a GGUF (por ejemplo Q4_K_M, Q5_K_M o Q8_0).
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama 3.2 3B) | no disponible (adaptador) | no disponible (base: 128.000 tokens) | NLI ingles-urdu (XNLI) | no disponible | Repositorio HuggingFace, 0 descargas, sin evaluacion publicada |
| meta-llama/Llama-3.2-3B (modelo base) | 3.210 M | 128.000 tokens | Generacion de texto general, 8 idiomas | Llama 3.2 Community License | Ampliamente disponible y desplegado |
| WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_AdaLoRA | no disponible (adaptador) | no disponible | NLI ingles-urdu (XNLI) | no disponible | Repositorio HuggingFace, variante con AdaLoRA del mismo autor |
| WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA | no disponible (adaptador) | no disponible | NLI ingles-hindi (XNLI) | no disponible | Repositorio HuggingFace, variante con hindi del mismo autor |

No se dispone de datos de rendimiento que permitan comparar objetivamente este adaptador con alternativas funcionalmente equivalentes, como clasificadores NLI multilingues dedicados (por ejemplo, modelos basados en XLM-R). La comparacion queda limitada a parametros estructurales, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card conserva las plantillas vacias; no se describen datos, hiperparametros, evaluacion ni uso previsto.
- Sin evaluacion publicada: no existe ninguna metrica que permita estimar la calidad del ajuste ni detectar regresiones frente al modelo base.
- Licencia no declarada del adaptador: al derivar de Llama 3.2, el uso comercial queda sujeto a la Llama 3.2 Community License de Meta, que impone obligaciones adicionales (por ejemplo, la clausula de licencia comunitaria y la atribucion "Built with Llama"). Conviene verificar los terminos antes de cualquier despliegue comercial.
- Riesgo de olvido catastrofico: un ajuste supervisado sobre 5.000 ejemplos de una tarea concreta puede degradar las capacidades generativas generales del modelo base, algo especialmente relevante en un modelo de solo 3.210 M de parametros.
- Cobertura idiomatica incierta: el urdu no figura entre los ocho idiomas declarados oficialmente por Llama 3.2, por lo que el soporte real depende enteramente de la calidad del ajuste y no esta verificado.
- Sesgos y alucinacion: no se ha realizado ninguna evaluacion de sesgos ni de tasas de alucinacion. En tareas NLI, un error tipico es la prediccion de implicacion ante pares lexicamente similares pero semanticamente contradictorios.
- Ambito restringido: esta pensado para pares de frases (premisa-hipotesis); no debe usarse como asistente conversacional ni como generador fiable sin un reajuste previo.
- Adopcion nula: 0 descargas y 0 "likes" implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Artefactos en los metadatos: la etiqueta `arxiv:1910.09700` corresponde a la calculadora de impacto de carbono (Lacoste et al.) incluida en la plantilla de HuggingFace, no a un articulo que describa el modelo. Las fechas de creacion y actualizacion registradas (2026) son las que figuran en el repositorio.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Variante AdaLoRA del mismo autor: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_AdaLoRA
- Variante con parametros similares: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_DoRA_Similar_Param
- Variante en hindi: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA
- Corpus y evaluacion XNLI (Meta Research): https://github.com/facebookresearch/XNLI
- Articulo citado en la plantilla de impacto de carbono: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact
