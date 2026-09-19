# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-last-full-epoch

## Resumen

Este repositorio publica un adaptador LoRA (PEFT) sobre el modelo base meta-llama/Llama-3.1-8B, no un modelo completo. El identificador del repositorio, `Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-last-full-epoch`, sugiere que el ajuste se ha realizado con la tecnica RAFT (Retrieval-Augmented Fine-Tuning) combinada con cadena de pensamiento (CoT), sobre un corpus de tipo Wikipedia, con cinco documentos en el contexto de entrenamiento y un rango LoRA de 64. Esta interpretacion procede unicamente de la convencion de nombres del autor: la model card no documenta ninguno de estos extremos.

El problema que aborda RAFT es conocido en el ambito de RAG: los modelos ajustados solo con datos limpios de QA tienden a fallar cuando el contexto recuperado contiene documentos irrelevantes o distractores. El ajuste con documentos distractores y respuestas razonadas busca que el modelo aprenda a discriminar que fragmentos son utiles y a citarlos, en lugar de alucinar sobre el contexto. Es relevante para quien construya sistemas RAG con Llama 3.1 y quiera evaluar si un adaptador de este tipo mejora la fidelidad al contexto.

La relevancia practica del repositorio es limitada por su estado: no tiene descargas, no tiene likes, la model card es la plantilla vacia de HuggingFace sin ninguna seccion completada, no declara licencia ni idiomas, y no aporta resultados de evaluacion ni hiperparametros de entrenamiento. El repositorio ocupa 0,7 GB y fue creado y actualizado el 19 de septiembre de 2026, con dos minutos de diferencia entre ambos eventos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA (PEFT) sobre Llama 3.1 8B; atencion con GQA, RoPE, SwiGLU y RMSNorm en el modelo base |
| Parametros totales | 8.030 millones en el modelo base Llama 3.1 8B; numero de parametros del adaptador no disponible (el repositorio ocupa 0,7 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B; no se especifica si el adaptador fue entrenado con esa ventana completa |
| Tipos de cuantizacion | No disponible en la ficha. El adaptador se publica como safetensors; la cuantizacion aplicable depende del modelo base (bitsandbytes 8/4 bits, GPTQ, AWQ o GGUF tras fusionar) |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base declara ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible en el repositorio. Al ser un derivado de Llama 3.1, queda sujeto a la Llama 3.1 Community License del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft` 0.20.0) |
| Rango LoRA | 64, segun el nombre del repositorio; `alpha`, `dropout` y modulos objetivo no disponibles |
| Modelo base | meta-llama/Llama-3.1-8B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Se trata de un adaptador de bajo rango (LoRA) de 64 dimensiones aplicado sobre Llama 3.1 8B, un transformer decoder-only de 32 capas, 4.096 dimensiones ocultas, 14.336 dimensiones de feed-forward, 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), con vocabulario de 128.256 tokens. El adaptador se distribuye en formato PEFT y requiere cargar el modelo base por separado o fusionar los pesos. No se especifican los modulos objetivo del adaptador (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), ni los hiperparametros de entrenamiento: tasa de aprendizaje, optimizador, precision (fp16, bf16 o fp32), numero de pasos o tamano de lote.

El nombre del repositorio apunta a un pipeline RAFT con CoT: ajuste supervisado sobre ejemplos compuestos por una pregunta, varios documentos recuperados (cinco, segun el identificador) y una respuesta razonada paso a paso que cita los fragmentos relevantes. El sufijo `PMIX_P80` sugiere una mezcla de datos con un 80 por ciento de ejemplos que contienen el documento oraculo, y `A-WIKI` apunta a un corpus derivado de Wikipedia. El sufijo `last-full-epoch` indica que se conserva el checkpoint del ultimo epoch completo. Ninguno de estos extremos esta confirmado en la documentacion: la model card mantiene los campos `[More Information Needed]` en todas las secciones, incluida la de datos y procedimiento de entrenamiento.

## Capacidades

- Generacion de texto conversacional y de tipo instructivo, heredada del modelo base Llama 3.1 8B.
- Respuesta a preguntas con contexto documental: el ajuste RAFT esta disenado especificamente para responder extrayendo informacion de documentos recuperados y descartando distractores.
- Razonamiento encadenado (CoT): la convencion de nombres indica entrenamiento con cadenas de razonamiento antes de la respuesta final.
- Procesamiento de multiples documentos en una misma ventana, hasta 128.000 tokens en el modelo base (cinco documentos en el contexto de entrenamiento segun el identificador).
- Soporte de tool calling y function calling: no confirmado para este adaptador; el modelo base Llama 3.1 8B si los soporta, pero el ajuste puede haber degradado esa capacidad al no incluir ejemplos de ello.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no declaradas para el adaptador; el modelo base cubre ocho idiomas.
- Modo thinking explicito, vision o audio: no disponibles.
- Evaluacion comparativa: no se ha publicado ninguna metrica en la informacion disponible.

## Casos de uso

- Sistemas RAG sobre documentacion corporativa: el adaptador se puede usar como generador final de un pipeline de recuperacion, alimentado con los fragmentos recuperados junto a la pregunta. El ajuste RAFT con documentos distractores busca precisamente que el modelo ignore fragmentos irrelevantes y no invente contenido cuando la respuesta no esta en el contexto.
- Atencion al cliente con base de conocimiento: sustituto del modelo instructivo generico en un asistente que consulta manuales, FAQ o articulos internos. Los 128.000 tokens de contexto del modelo base permiten adjuntar historiales largos de conversacion y varios articulos a la vez.
- Auditoria y trazabilidad de respuestas: si el ajuste CoT funciona segun lo previsto, la salida puede incluir el razonamiento intermedio y las citas de los documentos empleados, lo que facilita revisiones humanas en entornos regulados.
- Busqueda documental en wikis internas: sobre corpus con estructura similar a Wikipedia (articulos con secciones y referencias), el modelo puede resumir y sintetizar informacion dispersa entre varios articulos recuperados.
- Extraccion y contraste de datos en informes: dado un conjunto de documentos, generar respuestas que comparen datos entre fuentes y senalen discrepancias, con el razonamiento explicito como justificacion.
- Soporte tecnico de segundo nivel: respuestas a incidencias apoyadas en runbooks y articulos de resolucion, donde el modelo debe decidir que documento aplica y no extrapolar procedimientos inexistentes.
- Prototipado e investigacion en tecnicas de ajuste: sirve como punto de partida para reproducir o comparar la receta RAFT (numero de documentos, proporcion de distractores, CoT) sobre Llama 3.1 8B, dado el escaso coste de almacenamiento del adaptador (0,7 GB).
- Generacion de respuestas multilingues sobre corpus en ingles: usando el adaptador con indicaciones en espanol u otros idiomas soportados por el modelo base, aunque la calidad fuera del ingles no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (todos los campos aparecen como `[More Information Needed]`), y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo. No es posible comparar su rendimiento con el del modelo base ni con otros adaptadores RAFT.

## Requisitos de hardware

- Peso del adaptador: 0,7 GB en disco. El coste de VRAM del adaptador sin fusionar es despreciable frente al del modelo base.
- Modelo base en fp16/bf16: aproximadamente 16 GB de pesos, mas cache KV. Requiere GPUs de 24 GB o superiores (A100 40 GB, L40S, H100) para trabajar con comodidad.
- Modelo base en int8: aproximadamente 8-9 GB de pesos. Cabe en RTX 3090 y RTX 4090 (24 GB) y, con contexto corto, en GPUs de 12 GB.
- Modelo base en 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB de pesos. Cabe en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cache KV: con GQA de 8 cabezas, 32 capas y dimension de cabeza 128 en fp16, la cache consume unos 128 KiB por token, es decir, aproximadamente 1 GiB para 8.192 tokens y 16 GiB para 128.000 tokens. La ventana completa de 128k exige hardware con memoria abundante o tecnicas de cuantizacion de cache.
- Fusion del adaptador: los pesos LoRA pueden fusionarse con el modelo base en fp16 antes de cuantizar, lo que simplifica el despliegue y elimina la latencia adicional del adaptador.
- Opciones de despliegue: vLLM y TGI admiten adaptadores LoRA dinamicos con el modelo base correspondiente; llama.cpp y Ollama requieren fusionar y convertir a GGUF; Transformers con la libreria `peft` (version 0.20.0, la declarada en el repositorio) permite cargar el adaptador directamente.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de hardware de entrenamiento en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (RAFT + CoT sobre Llama 3.1 8B) | 8,03 B en el base + adaptador LoRA de rango 64 | 128.000 tokens (heredado del base) | Adaptador LoRA sobre modelo instructivo | No declarada en el repositorio; sujeta a la licencia de Llama 3.1 | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo completo ajustado con instrucciones y RLHF | Llama 3.1 Community License | Ampliamente disponible, amplio ecosistema de cuantizaciones |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | Modelo base sin ajuste | Llama 3.1 Community License | Ampliamente disponible |
| Otros adaptadores RAFT publicos sobre Llama 3.1 8B | No disponible | No disponible | No disponible | No disponible | No identificados en la informacion disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto de HuggingFace sin ninguna seccion completada. No hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion, sesgos ni uso previsto.
- Sin validacion publica: cero descargas y cero likes en el momento de redactar la ficha. No hay evidencia de terceros sobre su comportamiento.
- Licencia ambigua: el repositorio no declara licencia. Cualquier uso comercial debe verificar primero las condiciones de la Llama 3.1 Community License, que impone restricciones (entre otras, obligaciones de atribucion, limite de 700 millones de usuarios mensuales y requisitos de denominacion para modelos derivados).
- Dependencia del modelo base: es un adaptador, no un modelo autonomo. Requiere descargar meta-llama/Llama-3.1-8B, aceptar su licencia y cargar los pesos por separado o fusionarlos.
- Especializacion estrecha: si la receta RAFT se confirma, el adaptador esta optimizado para responder con contexto documental. Su comportamiento sin documentos recuperados puede degradarse respecto al modelo instructivo original.
- Riesgo de alucinacion: el ajuste sobre cinco documentos con un 80 por ciento de ejemplos que contienen el documento oraculo (segun el identificador) puede inducir respuestas que citen contenido plausible pero ausente cuando el contexto real no contiene la respuesta.
- Idiomas: no declarados. El ajuste parece orientado a un corpus tipo Wikipedia, probablemente en ingles; se desconoce el impacto en castellano.
- Degradacion potencial de capacidades: el ajuste puede haber reducido capacidades del modelo base como el tool calling, el seguimiento de instrucciones generales o el multilingue, al no haberse entrenado sobre esos datos.
- Ventana de contexto en entrenamiento: aunque el modelo base soporta 128.000 tokens, no hay constancia de que el adaptador se haya entrenado con documentos largos. El rendimiento con contextos muy extensos puede degradarse.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (19 de septiembre de 2026) son posteriores a las habituales para modelos Llama 3.1, lo que sugiere metadatos generados automaticamente o incorrectos.
- Sesgos: no evaluados ni documentados. Se heredan los del corpus de preentrenamiento de Llama 3.1 y los del dataset de ajuste, desconocido.
- Sin soporte: no hay repositorio de codigo, paper, demo ni contacto del autor mas alla del identificador de HuggingFace `strongpear`.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-last-full-epoch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base instructivo (referencia comparativa): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de RAFT (Retrieval-Augmented Fine Tuning): https://arxiv.org/abs/2403.10131
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Referencia citada en la model card (Lacoste et al., 2019, cuantificacion del impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Licencia de la familia Llama 3.1: https://llama.meta.com/llama3_1/license/

Nota: la busqueda web realizada no ha devuelto resultados relacionados con este modelo. Los unicos resultados obtenidos pertenecen a un producto de compania virtual (Nomi.ai) sin relacion alguna con el repositorio, por lo que se han descartado.
