# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-MEDICAL-Instruct-r64-last-full-epoch

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT entrenado sobre `meta-llama/Llama-3.1-8B`, publicado por el usuario `strongpear`. No es un modelo completo: es un conjunto de pesos de adaptador (0,7 GB en el repositorio) que debe cargarse junto al modelo base de Meta para poder ejecutar inferencia. Por tanto, su arquitectura subyacente es la de Llama 3.1 8B (transformer decoder-only con attention agrupada, 8 000 millones de parametros y ventana de contexto de hasta 128 000 tokens), sobre la que se anaden matrices de bajo rango.

El identificador del repositorio describe el metodo de entrenamiento: `RAFT` (Retrieval-Augmented Fine-Tuning), `PMIX_P80_5DOCS` (probablemente una mezcla de prompts con 5 documentos recuperados por ejemplo), `A-MEDICAL` (dominio medico), `Instruct` (formato de instrucciones) y `r64` (rango 64 del adaptador LoRA). La hipotesis de trabajo es que se trata de un ajuste fino orientado a respuesta sobre documentacion biomedica con recuperacion aumentada, un escenario muy habitual en asistentes clinicos que deben citar fuentes. Conviene subrayar que esta interpretacion procede del nombre del repositorio y no esta confirmada por el autor en ningun documento.

La relevancia practica es limitada pero concreta: no hay resultados publicados, no hay licencia declarada y el repositorio no tiene descargas ni interacciones, de modo que no puede considerarse un artefacto validado. Su interes esta en servir como plantilla reproducible de RAFT + LoRA r=64 sobre Llama 3.1 8B en el dominio medico, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Llama 3.1 8B con RoPE, GQA y SwiGLU |
| Parametros totales | No disponible en la ficha. El repositorio ocupa 0,7 GB; asumiendo rango r=64 sobre las proyecciones de attention y MLP del modelo base, la estimacion es de aproximadamente 150-170 millones de parametros de adaptador |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No declarada por el autor. El modelo base soporta 128 000 tokens; la nomenclatura del repositorio sugiere entrenamiento con 5 documentos en el contexto |
| Tipos de cuantizacion | No disponible en el repositorio (pesos de adaptador en safetensors). Al fusionar con el modelo base pueden generarse GGUF, AWQ, GPTQ o cargarse en 8/4 bits con bitsandbytes |
| Idiomas soportados | No disponible. El modelo base declara soporte para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible en el repositorio. Al derivar de Llama 3.1, queda sujeta a la Llama 3.1 Community License |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA; requiere el modelo base `meta-llama/Llama-3.1-8B` para ejecutarse |
| Libreria | peft 0.20.0 (segun la seccion de versiones de framework de la model card) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B, un transformer decoder-only de 32 capas, dimension oculta 4 096, 32 cabezas de attention con 8 cabezas KV (GQA) y FFN de tipo SwiGLU con dimension intermedia 14 336. El modelo base fue preentrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado con SFT y DPO, e incorpora soporte nativo de tool calling en su variante Instruct. El adaptador LoRA de rango 64 modifica las matrices de proyeccion sin alterar la topologia de la red, por lo que la arquitectura efectiva en inferencia es identica a la del modelo base una vez fusionados los pesos.

Respecto al entrenamiento, la model card publicada es la plantilla por defecto de HuggingFace y no contiene informacion: no se especifican dataset, numero de tokens, composicion, hiperparametros, regimen de precision ni si hubo fases de RLHF o DPO adicionales. El nombre del repositorio apunta a RAFT, una tecnica que combina ajuste fino supervisado con ejemplos que incluyen documentos recuperados, distinguiendo entre documentos relevantes (oracle) y distractores, y que entrena al modelo para razonar sobre el contexto y citar la evidencia. Los sufijos `5DOCS`, `P80` y `A-MEDICAL` sugieren cinco documentos por ejemplo, un 80 % de mezcla de prompts y un corpus de dominio medico, pero ninguno de estos extremos esta documentado. El sufijo `last-full-epoch` indica que el checkpoint corresponde a la ultima epoca completa de entrenamiento.

## Capacidades

- Generacion de texto y respuesta a instrucciones en el formato del modelo base Llama 3.1 8B Instruct.
- Respuesta sobre documentacion recuperada (RAG) con varios documentos en el contexto, presumiblemente cinco segun la nomenclatura del repositorio.
- Razonamiento multi-paso basico y seguimiento de instrucciones conversacionales, heredados del modelo base.
- Tool calling y function calling en el formato nativo de Llama 3.1, siempre que no se hayan degradado durante el ajuste fino (no verificado).
- Capacidades multilingues las del modelo base (8 idiomas declarados), aunque el ajuste probablemente se centro en ingles medico.
- Capacidades de codigo y matematicas del modelo base, sin evidencia de mejora ni de degradacion.
- Dominio especializado: vocabulario y estilo de respuesta biomedicos tras el ajuste.
- No se ha confirmado soporte de vision, audio, modo de razonamiento explicito (thinking) ni salidas estructuradas garantizadas.

## Casos de uso

- Preguntas y respuestas sobre guias clinicas internas: el adaptador se integra en un pipeline RAG que recupera cinco fragmentos de protocolos hospitalarios y genera una respuesta apoyada en ellos, con la ventaja de que el entrenamiento RAFT esta disenado precisamente para que el modelo ignore documentos irrelevantes del contexto.
- Asistencia a codificacion clinica (CIE-10, SNOMED CT): dado un informe y los fragmentos de codificacion recuperados de la base documental, el modelo propone codigos justificados por el texto, que un codificador humano revisa antes de introducirlos en el sistema.
- Resumen de literatura biomedica: con cinco articulos o secciones recuperadas por busqueda semantica, el modelo produce un resumen comparativo con referencias a los fragmentos usados, util en revisiones rapidas de evidencia.
- Soporte de primera linea en atencion al paciente: respuestas a preguntas frecuentes sobre preparacion de pruebas, posologia general o cuidados postoperatorios, siempre con derivacion explicita a un profesional y sin emitir diagnostico.
- Extraccion estructurada de informacion de historiales: conversion de notas clinicas en campos normalizados (diagnostico, tratamiento, dosis) para poblar un registro, con validacion posterior obligatoria.
- Formacion medica interna: simulacion de casos y preguntas tipo MIR con explicacion razonada apoyada en manuales recuperados del repositorio de la institucion.
- Evaluacion comparativa de tecnicas de ajuste: uso como punto de partida para reproducir experimentos RAFT frente a SFT convencional en dominios especializados, midiendo alucionacion y fidelidad a las fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye seccion de evaluacion, no hay metricas en el repositorio y la busqueda web realizada no ha devuelto ningun articulo, informe o discusion tecnica asociada a este modelo. No se dispone por tanto de cifras de MMLU, MedQA, PubMedQA, HumanEval, GSM8K ni de evaluaciones especificas de fidelidad a las fuentes (attribution) que serian las mas relevantes para un ajuste RAFT.

## Requisitos de hardware

- El adaptador en si ocupa 0,7 GB y puede cargarse con PEFT, pero la inferencia requiere el modelo base completo.
- VRAM estimada para el modelo base en fp16/bf16: aproximadamente 16-17 GB para los pesos, mas cache KV. Con GQA de 8 cabezas KV, la cache consume alrededor de 128 KB por token en fp16, es decir, unos 16 GB adicionales si se agota la ventana de 128 000 tokens, y aproximadamente 1 GB con 8 000 tokens. Estas cifras son calculos derivados de la configuracion de Llama 3.1 8B, no datos publicados por el autor.
- Cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): alrededor de 5-6 GB de pesos, viable con contexto moderado.
- GPU recomendadas: A100 40 GB o H100 para contexto largo y servicio concurrente; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto contenido o 4 bits con contexto amplio; RTX 3060 12 GB, RTX 4060 Ti 16 GB o Apple Silicon con 16 GB unificados para 4 bits con contexto corto.
- Cabe en GPU de consumo: si, en 4 bits en practicamente cualquier GPU con 8 GB o mas, y en fp16 en tarjetas de 24 GB con contexto limitado.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en caliente mediante `--enable-lora`), TGI, llama.cpp y Ollama tras fusionar y convertir a GGUF, Transformers + PEFT para evaluacion, y LM Studio para pruebas locales.
- Latencia y throughput: no disponibles. No hay ningun dato de velocidad, tokens por segundo ni tamano de lote publicado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Este adaptador (RAFT medico sobre Llama 3.1 8B) | 8B (base) + ~0,7 GB de adaptador | No declarado; 128 000 en el base | No disponible | LoRA especializado en dominio |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 | Llama 3.1 Community License | Modelo completo, proposito general |
| BioMistral-7B | 7B | 4 096-8 192 segun configuracion | Apache 2.0 | Modelo completo biomedico |
| OpenBioLLM-Llama3-8B | 8B | 8 192 | Llama 3 Community License | Modelo completo biomedico |

La comparacion de rendimiento no es posible: este adaptador no publica ninguna evaluacion, mientras que los modelos alternativos si presentan resultados en conjuntos como MedQA o PubMedQA en sus fichas. La ventaja estructural del adaptador es su tamano reducido para almacenamiento y su capacidad de alternarse en caliente sobre un mismo modelo base servido; su desventaja es la dependencia total del modelo base, la ausencia de licencia declarada y la falta de validacion por parte de la comunidad (0 descargas, 0 likes). Los valores de contexto y licencia de los modelos comparados proceden de sus fichas publicas y conviene verificarlos antes de citarlos.

## Limitaciones y advertencias

- La model card es la plantilla vacia de HuggingFace: no hay descripcion, datos de entrenamiento, hiperparametros ni evaluacion. Cualquier afirmacion sobre su comportamiento es una inferencia a partir del nombre del repositorio.
- No se declara licencia. Al derivar de Llama 3.1, el uso comercial queda condicionado por la Llama 3.1 Community License y por la aceptacion previa del acceso al modelo base, que esta restringido (gated).
- Riesgo elevado de alucinacion con consecuencias graves: es un modelo de dominio medico y no existe ninguna evaluacion de fidelidad a las fuentes ni de tasas de error. No debe usarse para diagnostico, prescripcion ni triaje autonomo.
- Sesgos esperables del corpus biomedico de entrenamiento (infrarrepresentacion de poblaciones, sesgo de idioma hacia el ingles, sesgo hacia practicas clinicas de un unico sistema sanitario), no documentados ni medidos.
- El ajuste RAFT con cinco documentos puede degradar el rendimiento cuando la tarea no sigue ese regimen: consultas sin contexto recuperado, contextos mucho mas largos o preguntas fuera del dominio medico.
- Al ser un LoRA de rango 64 sobre un ajuste de dominio, existe riesgo de olvido catastrofico de capacidades generales (codigo, matematicas, instrucciones generales) que no se ha cuantificado.
- La fecha de creacion registrada (21 de septiembre de 2026) es posterior a la fecha actual, lo que sugiere un artefacto subido con metadatos inconsistentes o un reloj mal configurado; conviene tratarlo como senal de poca madurez del repositorio.
- No hay resultados de validacion externa, ni issues, ni discusiones, ni descargas: no existe evidencia de que el adaptador funcione segun lo esperado.
- No se documenta si el modelo conserva el soporte de tool calling del base; si se pretende usar en agentes, hay que verificarlo empiricamente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-MEDICAL-Instruct-r64-last-full-epoch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- Referencia del metodo RAFT (Zhang et al., "RAFT: Adapting Language Model to Domain Specific RAG"): https://arxiv.org/abs/2403.10131
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto de carbono citada en la model card (Lacoste et al., 2019): https://mlco2.github.io/impact y https://arxiv.org/abs/1910.09700
- Nota sobre la busqueda web: no se ha encontrado ningun enlace, paper, blog, repo o demo relacionado con este modelo. Los resultados devueltos por el buscador correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
