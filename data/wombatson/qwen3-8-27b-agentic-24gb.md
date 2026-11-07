# Wombatson/Qwen3.8-27B-Agentic-24GB

## Resumen

Wombatson/Qwen3.8-27B-Agentic-24GB es una cuantizacion GGUF de tipo mixto (IQ3_S con mezcla personalizada de tensores) del modelo denso Qwen/Qwen3.8-27B de Alibaba, publicada por el usuario Wombatson. El objetivo declarado en la model card es conseguir que un modelo de 27.320.697.856 parametros (unos 27,3 mil millones) quepa y funcione con comodidad en una maquina Apple Silicon con 24 GB de memoria unificada, en concreto un Mac Mini M6, manteniendo ademas el codificador de vision como fichero mmproj separado en Q8_0.

El proceso documentado en la model card es una conversion completa desde safetensors a GGUF BF16 (54,7 GB), extraccion del encoder de vision/video a un mmproj Q8_0, generacion de una imatrix a partir de 150 chunks y cuantizacion final a un mix IQ3_S con tipos por tensor (attn_q y attn_output en iq4_xxs, ffn_gate y ffn_up en iq3_xxs, ffn_down en iq4_xxs, ffn de las primeras y ultimas capas en q5_k_s, attn_k y attn_v en q6_k). El resultado es un repositorio de 15,8 GB que incluye tambien la integracion con un modelo draft DFlash2 para decodificacion especulativa mediante llama.cpp.

La relevancia de esta ficha es doble: por un lado documenta una receta reproducible de "slimming" denso con imatrix para hardware de consumo; por otro, sirve de ejemplo de cuantizacion agresiva sobre un modelo con contexto de 262k y capacidades multimodales, donde el equilibrio entre tamano en disco, calidad y velocidad de decodificacion es el compromiso central. No hay descargas ni likes registrados en el momento de la consulta, y el autor no publica evaluaciones de calidad de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con encoder de vision/video separado en mmproj |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens segun fuentes web sobre el modelo base; no confirmado en la model card del autor |
| Tipos de cuantizacion | Mix IQ3_S personalizado: iq4_xxs (attn_q, attn_output, ffn_down), iq3_xxs (ffn_gate, ffn_up), q5_k_s (ffn de blk.0-3 y blk.60-63, ssm_*), q6_k (attn_k, attn_v, output tensor), q4_k_m (token embeddings); mmproj en Q8_0 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj Q8_0 para vision); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de Alibaba con 27,3 mil millones de parametros y ventana de contexto de 262k tokens segun las fuentes web consultadas. La model card del autor menciona la presencia de un encoder de vision/video (extraido como mmproj Q8_0) y de una capa MTP (multi-token prediction) en el bloque blk.64, lo que sugiere que el modelo base incorpora decodificacion especulativa nativa o al menos una cabeza auxiliar de prediccion. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La aportacion tecnica de esta publicacion no es el entrenamiento sino el pipeline de cuantizacion: conversion a BF16 GGUF, extraccion del encoder multimodal, generacion de una imatrix con 150 chunks (presumiblemente de un dataset orientado a codigo, a juzgar por el nombre `qwen3.8-27b-coding-imatrix.dat`) y cuantizacion por tensor con llama-quantize. El autor documenta dos fallos intermedios por nombres de tipo invalidos y por falta de imatrix para la capa MTP blk.64, resueltos en la tercera pasada. La integracion final usa llama-server con un draft model DFlash2 (`--spec-type draft-dflash --spec-draft-n-max 7`), es decir, decodificacion especulativa con hasta 7 tokens candidatos por paso.

## Capacidades

- Generacion de texto y razonamiento multi-turno, heredadas del modelo base Qwen3.8-27B.
- Programacion y tareas de codigo, con una imatrix generada especificamente sobre un dataset de codigo.
- Comprension de contexto largo: hasta 262k tokens segun las fuentes del modelo base, aunque el rendimiento real con cuantizacion IQ3_S no esta verificado.
- Vision y video: el encoder se conserva como mmproj Q8_0, por lo que el modelo puede procesar imagenes si el runtime lo carga junto al GGUF principal.
- Decodificacion especulativa mediante el draft model DFlash2, con velocidad de generacion mejorada en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face), lo que facilita su despliegue como servidor HTTP.
- No hay informacion sobre soporte de tool calling, function calling ni modo thinking explicito en la documentacion del autor; se asume herencia del modelo base, pero no esta confirmado.

## Casos de uso

- Asistente de codigo en local sobre Mac Apple Silicon: el mix IQ3_S ocupa unos 15,8 GB, por lo que cabe en un Mac Mini M6 de 24 GB y permite autocompletado, refactorizacion y explicacion de codigo sin conexion a la nube.
- Servidor de inferencia personal con llama-server: el tag `endpoints_compatible` y la configuracion documentada (`llama-server -hf ... --spec-type draft-dflash`) permiten exponer el modelo como API compatible con OpenAI en una red local.
- Procesamiento de documentos largos con vision: al conservar el mmproj Q8_0, se pueden pasar capturas, diagramas o fotogramas de video junto a texto para tareas de extraccion de informacion o resumen.
- Agente de terminal o IDE con contexto extendido: la ventana de 262k tokens del modelo base permite arrastrar repositorios enteros o historiales largos de conversacion en una sola sesion.
- Prototipado de pipelines RAG en hardware de consumo: la cuantizacion agresiva reduce el coste de iteracion y permite probar recuperacion y generacion en la misma maquina.
- Evaluacion comparativa de cuantizaciones: el repositorio documenta la receta completa (imatrix, tipos por tensor, comandos), lo que lo convierte en una referencia util para reproducir el proceso con otros modelos densos de ~27B.
- Transcripcion y analisis de video de vigilancia o contenido multimedia: el encoder de video heredado del modelo base permite muestrear fotogramas y generar descripciones o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad comparando el mix IQ3_S con el BF16 original. Las fuentes web mencionan que el modelo base Qwen3.8-27B tiene "published benchmarks", pero no se proporcionan cifras concretas en el material consultado, por lo que no se reproducen numeros.

## Requisitos de hardware

- VRAM/memoria unificada: el fichero GGUF principal ocupa aproximadamente 15,8 GB en disco; con overhead de contexto y cache KV, se recomienda al menos 20-22 GB de memoria disponible. El autor lo ejecuta en un Mac Mini M6 con 24 GB.
- GPU recomendadas: Apple Silicon con 24 GB o mas (M-series Pro/Max/Ultra); en el lado NVIDIA, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberian poder cargarlo, aunque no esta verificado por el autor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB, siempre que se limite la longitud de contexto para no desbordar la cache KV.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli), con soporte de decodificacion especulativa DFlash2. No hay informacion sobre compatibilidad con vLLM, TGI u Ollama; al ser GGUF, Ollama podria importarlo, pero no esta documentado.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wombatson/Qwen3.8-27B-Agentic-24GB | 27,3 B | 262k (heredado, no verificado) | GGUF IQ3_S + mmproj Q8_0 | Apache 2.0 | Cuantizacion para 24 GB, con draft DFlash2 |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262k | safetensors | Apache 2.0 | Modelo original en BF16, requiere ~55 GB |
| incoai/Qwen3.8-27B-DFlash2-GGUF | no disponible | no disponible | GGUF Q4_K_M | no disponible | Draft model usado para decodificacion especulativa |

No se dispone de informacion sobre otros modelos comparables de ~27B con cuantizaciones equivalentes en el material consultado.

## Limitaciones y advertencias

- La cuantizacion IQ3_S es agresiva (3-4 bits por peso en la mayoria de tensores); se espera degradacion de calidad respecto al BF16, especialmente en tareas de razonamiento matematico y codigo, aunque no hay mediciones publicadas.
- El autor no publica evaluaciones de perplejidad ni benchmarks que cuantifiquen la perdida de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.
- La model card esta redactada como un log de sesion de un agente (Claude Sonnet 5.5) y no como documentacion tecnica formal; algunos pasos pueden no ser reproducibles sin el entorno Hermes Desktop.
- El soporte de vision depende de que el runtime cargue correctamente el mmproj Q8_0; no se documenta el comando exacto de carga en llama-server.
- La longitud de contexto de 262k proviene de fuentes web sobre el modelo base, no de la model card del autor; con esta cuantizacion y en 24 GB, el contexto practico sera mucho menor por la cache KV.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad del modelo cuantizado.
- El uso de decodificacion especulativa con DFlash2 requiere el draft model adicional, lo que incrementa el consumo de memoria total.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wombatson/Qwen3.8-27B-Agentic-24GB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model DFlash2 (GGUF): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF/tree/main
- Ficha de especificaciones del modelo base: https://apxml.com/models/qwen38-27b
- Guia de hardware y despliegue del modelo base: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
