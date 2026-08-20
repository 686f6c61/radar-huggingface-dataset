# TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ

## Resumen

Qwen3.8-27B-NVFP4-AWQ-GPTQ es una cuantizacion de precision mixta del modelo multimodal Qwen3.8-27B de Alibaba, desarrollada por TelperionAI. Combina NVFP4 (4 bits efectivos) para las proyecciones MLP de las capas 0-55, FP8 e4m3 para el resto de proyecciones y BF16 para embeddings, lm_head y la torre de vision. El resultado es un checkpoint de 23 GB que mantiene un 93,44 % de concordancia top-1 con el modelo BF16 original.

La relevancia de este modelo radica en que, al mismo tamano que una cuantizacion NVFP4 estandar, reduce aproximadamente un tercio el dano en predicciones de alta confianza, gracias a la combinacion de escalado activation-aware (AWQ) seguido de GPTQ. Es el checkpoint NVFP4 mas preciso de Qwen3.8-27B medido por TelperionAI, con un coste de cero bytes y cero throughput adicional.

El modelo base Qwen3.8-27B es un LLM denso multimodal de 27 mil millones de parametros con arquitectura de atencion hibrida (16 capas de atencion completa y 48 de atencion lineal), contexto nativo de 262 144 tokens y capacidades de razonamiento, generacion de codigo y uso de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (atencion hibrida: 16 capas full attention + 48 capas linear attention GDN) |
| Parametros totales | 19 869 895 920 (~19,87 mil millones en safetensors; el modelo base se comercializa como 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, grupo 16, escalas FP8 e4m3), FP8 e4m3 dinamico, BF16 |
| Idiomas soportados | No disponible en la ficha de HuggingFace; el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida: solo 16 de las 64 capas utilizan atencion completa (con intervalo full_attention_interval: 4), mientras que las otras 48 usan atencion lineal con estado recurrente constante (GDN, Gated Delta Net). Esta combinacion reduce el coste computacional manteniendo la capacidad de modelado de dependencias de largo alcance.

La cuantizacion de TelperionAI aplica una receta de precision mixta en dos pasadas. Primero, AWQ (activation-aware scaling) anade escalado por canal de entrada en post_attention_layernorm hacia gate_proj y up_proj, y de up_proj hacia down_proj. Los escalones se pliegan en los pesos de la norma, por lo que la ganancia de precision no anade ni bytes ni coste de throughput. Segundo, GPTQ se aplica a todos los modulos cuantizados con actorder estatico y dampening_frac de 0,01. La calibracion uso 1024 secuencias de 1024 tokens de una mezcla equilibrada Nemotron-v2 (25 % codigo, 25 % matematicas, 20 % STEM, 20 % chat, 10 % multilingue).

A diferencia de metodos basados en rotacion (QuIP, SpinQuant), los escalones AWQ se fusionan completamente en los pesos, por lo que el checkpoint sigue siendo compatible con tensor parallelism. lm_head y embed_tokens se mantienen en BF16, igual que en la liberacion FP8 oficial de Qwen.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo modo thinking (razonamiento paso a paso) y modo no-thinking.
- Multimodal: el modelo base acepta entradas de imagen y video ademas de texto (pipeline image-text-to-text). La torre de vision se mantiene en BF16 sin cuantizar, aunque el rendimiento multimodal no ha sido verificado en esta cuantizacion.
- Generacion de codigo: el modelo base esta optimizado para tareas de programacion y automatizacion de oficina.
- Workflows agente: soporta tool calling y razonamiento multi-paso para tareas agente.
- Atencion hibrida: las capas de atencion lineal con estado recurrente permiten procesar contextos largos (262 144 tokens) con menor coste que atencion completa.
- Compatibilidad con vLLM: integracion nativa con compressed-tensors para inferencia en GPUs Blackwell.

## Casos de uso

- Despliegue de LLM multimodal en hardware local: con 23 GB, el modelo cabe en una GPU Blackwell de gama alta (p. ej., RTX 5090 con 32 GB) y permite ejecutar tareas de vision-lenguaje sin depender de APIs externas.
- Razonamiento agente con contexto largo: las 262 144 tokens de contexto y el soporte de tool calling permiten construir agentes que mantienen conversaciones extensas, leen documentos completos y ejecutan multiples herramientas en secuencia.
- Generacion de codigo en produccion: el modelo base destaca en tareas de programacion; la cuantizacion NVFP4+AWQ reduce el dano en predicciones de alta confianza, lo que lo hace adecuado para pipelines de CI/CD que generan o revisan codigo.
- Automatizacion de oficina: el modelo base esta disenado para tareas ofimaticas, como resumir documentos, extraer datos de imagenes o generar informes a partir de capturas.
- Analisis de documentos con imagen y texto: al mantener la torre de vision en BF16, el checkpoint conserva las capacidades multimodales del modelo original para tareas como OCR, comprension de diagramas o analisis de graficas.
- Inferencia de alto rendimiento en clusters Blackwell: con 10 680 tokens/s medidos en 2×B300 con tensor parallelism, es adecuado para servir multiples usuarios concurrentes en entornos de produccion.

## Benchmarks y rendimiento

TelperionAI evaluo el checkpoint contra el modelo base BF16 sobre 142 727 tokens de salida thinking-mode auto-destilada, mas 200 generaciones greedy libres, con vLLM 0.27.1, TP=2 y 2×B300. Las columnas de dano representan tasas de discrepancia con el BF16, segmentadas por el margen de confianza del modelo base (top1−top2): near-tie <0,5, moderate 0,5–2, confident 2–5, certain >5. Solo las dos ultimas representan perdida real de calidad.

| Checkpoint | Tamano | top-1 | near-tie | moderate | confident | certain | divmed | tok/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B-FP8 (referencia 8 bits) | 29 GB | 96,15 % | 22,70 % | 3,48 % | 1,45 % | 0,08 % | 47 | 8711 |
| TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ | 23 GB | 93,44 % | 33,86 % | 7,74 % | 2,69 % | 0,19 % | 29 | 10 680 |
| RadixArk/Qwen3.8-27B-NVFP4 | 21 GB | 90,23 % | 43,80
