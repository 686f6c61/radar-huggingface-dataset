# Utirok49km/Qwen2.5-1.5B-Instruct-GGUF

## Resumen

Qwen2.5-1.5B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-1.5B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. Este repositorio concreto lo publica el usuario Utirok49km como redistribucion del modelo base, empaquetando los pesos en multiples niveles de cuantizacion para su uso con llama.cpp y otras herramientas compatibles con GGUF. El modelo resuelve el problema de desplegar un LLM instruction-tuned de tamano reducido en hardware de consumo, manteniendo las capacidades de instruccion, generacion de texto y soporte multilingue de la familia Qwen2.5.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, atencion con sesgo QKV y embeddings atados, con 28 capas y 1.540 millones de parametros (1.310 millones sin embeddings). La ventana de contexto completa es de 32.768 tokens con generacion de hasta 8.192 tokens, lo que lo hace adecuado para tareas de conversacion y procesamiento de documentos de longitud media en entornos con recursos limitados.

Su relevancia actual radica en que combina una licencia Apache 2.0 permisiva, un tamano que cabe en GPUs de consumo y una calidad de instruccion mejorada respecto a Qwen2, con soporte declarado de mas de 29 idiomas en la familia (aunque este repo etiqueta solo ingles). Es una opcion practica para prototipado, agentes ligeros y despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atencion QKV con sesgo y embeddings atados |
| Parametros totales | 1.777.088.000 (1.54B segun model card; 1.31B sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (generacion hasta 8.192 tokens) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (etiqueta del repo); la familia Qwen2.5 declara mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 28 capas, 12 cabezas de atencion para Q y 2 para KV (GQA), RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. Los embeddings de entrada y salida estan atados. El modelo base Qwen2.5-1.5B-Instruct paso por pretraining y post-training (instruction tuning), segun indica la model card. La familia Qwen2.5 incorpora modelos expertos especializados en codigo y matematicas durante el entrenamiento, lo que mejora el rendimiento en esos dominios respecto a Qwen2.

No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas de RLHF o DPO mas alla del post-training generico. La model card menciona mejoras en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados (tablas), generacion de JSON y resiliencia ante diversidad de system prompts. Este repositorio es unicamente una conversion a GGUF del modelo original; no se documenta un reentrenamiento ni ajuste adicional por parte del publicador.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones en modo chat.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general.
- Generacion de codigo y resolucion de problemas matematicos, con mejoras atribuidas a los modelos expertos de la familia Qwen2.5.
- Generacion de texto largo, con soporte declarado para mas de 8K tokens de salida.
- Comprension y generacion de datos estructurados, incluido JSON y tablas.
- Seguimiento de instrucciones robusto ante distintos system prompts, util para role-play y configuracion de chatbots.
- Soporte de contexto largo de hasta 32.768 tokens.
- Capacidades multilingues en la familia Qwen2.5 (mas de 29 idiomas), aunque este repo etiqueta solo ingles.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Chatbot de atencion al cliente en local: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para hilos largos con historial e informacion de producto, desplegado en una sola GPU de consumo mediante llama.cpp.
- Prototipado rapido de asistentes conversacionales: con cuantizaciones q4_K_M o q5_K_M cabe en GPUs de 4-8 GB, lo que permite iterar en estaciones de trabajo sin infraestructura cloud.
- Generacion de codigo en entornos con recursos limitados: puede integrarse en editores o scripts de automatizacion para autocompletar y explicar fragmentos de codigo, aunque su tamano limita la complejidad de las tareas frente a modelos mayores.
- Extraccion y formateo de datos estructurados: su capacidad para generar JSON y comprender tablas lo hace util para convertir texto no estructurado en registros estructurados en pipelines ligeros.
- Resumen y reescritura de documentos de longitud media: la ventana de 32K tokens permite procesar articulos, informes o transcripciones sin truncar en exceso.
- Despliegue en el borde o en dispositivos con CPU: las cuantizaciones q2_K y q3_K_M reducen el peso a unos pocos GB, permitiendo inferencia en CPU con llama.cpp para tareas de baja latencia no critica.
- Educacion y experimentacion: modelo adecuado para ensenar conceptos de cuantizacion, inferencia local y ajuste de prompts sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Qwen2.5 y a la documentacion de cuantizacion de Qwen para resultados detallados, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (aproximada a partir del numero de parametros):
  - q2_K: en torno a 1 GB.
  - q3_K_M: en torno a 1,2 GB.
  - q4_0 / q4_K_M: en torno a 1,5-2 GB.
  - q5_0 / q5_K_M: en torno a 2-2,5 GB.
  - q6_K: en torno a 2,5-3 GB.
  - q8_0: en torno a 3,5-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 4 GB o mas; las cuantizaciones q2_K y q3_K_M pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp (recomendado por la model card), y por compatibilidad de formato GGUF tambien Ollama, LM Studio y otros runners compatibles. No se documenta soporte nativo en vLLM o TGI para este repo GGUF concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de speed benchmark de Qwen para datos de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-GGUF (este repo) | 1,54B (1,78B totales) | 32.768 | Apache 2.0 | GGUF | Cuantizaciones multiples, pensado para llama.cpp |
| Qwen2.5-1.5B-Instruct (original) | 1,54B | 32.768 | Apache 2.0 | safetensors | Pesos completos en bfloat16, referencia del repo |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 | safetensors/GGUF | Version mas pequena de la misma familia, menor calidad pero menor footprint |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 | safetensors/GGUF | Version mayor de la misma familia, mejor rendimiento a costa de mas VRAM |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para cuantificar diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una redistribucion no verificada por la comunidad; conviene validar la integridad de los pesos antes de usarlos en produccion.
- La model card etiqueta el idioma como ingles, aunque la familia Qwen2.5 declara soporte multilingue; el rendimiento en castellano no esta documentado en este repo.
- Riesgo de alucinacion inherente a modelos de 1,5B parametros, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La cuantizacion introduce perdida de precision; las variantes q2_K y q3_K_M pueden degradar notablemente la calidad frente a q5_K_M o q8_0.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que requieran invocacion de herramientas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar los terminos del modelo base Qwen2.5 para confirmar compatibilidad en el caso de uso concreto.
- El contexto efectivo puede degradarse en los extremos de la ventana de 32K tokens; no se han publicado evaluaciones de rendimiento en contextos largos para esta cuantizacion.
- El modelo no incluye vision, audio ni modo thinking, por lo que no es adecuado para tareas multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Utirok49km/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repo GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
