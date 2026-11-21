# tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF

## Resumen

`tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF` es una coleccion de cuantizaciones GGUF del modelo `oopere/Llama-3.2-1B-pruned-20pct`, una version podada de Llama-3.2-1B en la que se ha eliminado el 20% de las capas MLP mediante poda estructurada. El autor de esta ficha (tinyopsec) se limita a convertir los pesos resultantes a formato GGUF usando llama.cpp, sin aportar entrenamiento adicional ni fine-tuning. El modelo base sobre el que se construye es `meta-llama/Llama-3.2-1B`, un transformer decoder-only de 1.074.792.480 parametros publicado por Meta dentro de la familia Llama 3.2.

La relevancia de esta publicacion es practica: ofrece un modelo de ~1B parametros con un 20% menos de capacidad en las capas MLP, empaquetado en 13 cuantizaciones distintas (desde F16 hasta Q2_K) para su despliegue en CPU, GPUs de consumo y entornos con memoria muy limitada. El objetivo es servir como alternativa ultraligera para generacion de texto en local, prototipado rapido o experimentacion con tecnicas de poda.

No obstante, conviene subrayar que se trata de un artefacto derivado y no validado: la model card no aporta metricas de calidad, evaluaciones comparativas ni datos sobre la perdida de rendimiento que introduce la poda del 20% en las MLP. El propio autor incluye un disclaimer indicando que el modelo debe evaluarse antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), con poda estructurada del 20% en capas MLP |
| Parametros totales | 1.074.792.480 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.2-1B, no confirmada en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama-3.2-1B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, el autor del modelo original (`oopere`) aplico una poda estructurada que elimina el 20% de las neuronas en las capas MLP, reduciendo la anchura del bloque feed-forward mientras conserva el resto de la topologia. No se especifica en la informacion disponible si hubo una fase de recuperacion (fine-tuning tras la poda) ni cuantos tokens se emplearon en ella.

El proceso de conversion a GGUF lo realiza `tinyopsec` con llama.cpp, generando 13 archivos de cuantizacion. No se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, RLHF/DPO posterior, etc.) ni se detalla la composicion del dataset de entrenamiento original de Llama-3.2-1B, mas alla de lo publicamente conocido del modelo de Meta.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo Llama-3.2-1B original.
- Razonamiento de complejidad limitada, condicionado por el tamano de 1B parametros y agravado por la poda del 20% en MLP.
- Generacion de codigo y matematicas basicas, sin garantias de calidad tras la poda.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante podada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el tamano y la poda hacen poco probable un rendimiento fiable en tareas agenticas.
- Capacidades multilingues: no disponibles en la model card; se asume herencia del modelo base, pero sin verificacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado local en CPU: gracias a las cuantizaciones Q4_0 y Q2_K, el modelo puede ejecutarse en portatiles sin GPU mediante llama.cpp u Ollama, permitiendo validar pipelines de generacion de texto antes de escalar a modelos mayores.
- Generacion de texto en dispositivos con recursos muy limitados: el archivo Q2_K ocupa previsiblemente menos de 500 MB, lo que lo hace apto para entornos embebidos, Raspberry Pi o contenedores con restricciones estrictas de memoria.
- Experimentacion academica con poda estructurada: sirve como referencia reproducible para comparar el impacto de eliminar el 20% de MLP frente al modelo Llama-3.2-1B sin podar.
- Tareas de completado de texto de baja exigencia: autocompletado, generacion de resumenes cortos o reformulacion de frases en aplicaciones donde la latencia y el coste importan mas que la calidad absoluta.
- Filtrado y clasificacion de texto simple: con prompts adecuados puede usarse para etiquetado de baja complejidad, aunque sin garantias de robustez tras la poda.
- Base para fine-tuning ligero: al ser un modelo pequeno en GGUF, puede servir de punto de partida para LoRA/QLoRA en entornos con una sola GPU de consumo, aunque la poda puede complicar la compatibilidad con adaptadores disenados para Llama-3.2-1B original.
- Educacion y divulgacion: util para demostrar el flujo completo de poda, cuantizacion y despliegue con llama.cpp en talleres o cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni del modelo podado ni de la comparacion con Llama-3.2-1B sin podar.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y sin overhead de contexto):
  - F16: ~2,1 GB de pesos (el autor indica 3,0 GB para el archivo).
  - Q8_0: ~1,1 GB.
  - Q5_K_M: ~0,75 GB.
  - Q4_K_M (recomendado): ~0,65 GB.
  - Q2_K: ~0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para Q4_K_M basta con 1 GB, por lo que cabe en GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. En A100/H100 el modelo queda sobredimensionado y no aprovecha el hardware.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF | ~1,07 B (con 20% MLP podado) | no disponible | Llama 3.2 Community | GGUF (13 cuantizaciones) | Objeto de esta ficha; sin benchmarks publicados |
| meta-llama/Llama-3.2-1B | 1,24 B | 128 K (según model card oficial de Meta) | Llama 3.2 Community | safetensors, GGUF (comunitario) | Modelo de referencia sin podar; contexto y calidad superiores en teoria |
| Qwen2.5-0.5B | ~0,49 B | 32 K (según model card oficial) | Apache 2.0 | safetensors, GGUF | Alternativa mas pequena con licencia permisiva; no comparable en tamano exacto |
| SmolLM2-1.7B | ~1,7 B | 8 K (según model card oficial) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva y benchmarks publicados |

La comparacion con Llama-3.2-1B original es la mas directa: la variante podada reduce el coste computacional a cambio de una perdida de calidad no cuantificada. Frente a alternativas con licencia Apache 2.0 (Qwen2.5-0.5B, SmolLM2-1.7B), la licencia Llama 3.2 impone restricciones adicionales para uso comercial a gran escala.

## Limitaciones y advertencias

- Perdida de calidad no cuantificada: la poda del 20% en MLP reduce la capacidad del modelo y no se han publicado evaluaciones que midan el deterioro en tareas concretas.
- Riesgo de alucinacion elevado: un modelo de 1B parametros ya presenta alta propension a inventar informacion; la poda puede agravar este comportamiento.
- Idiomas no verificados: la model card no declara idiomas soportados; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto no confirmado: aunque Llama-3.2-1B soporta 128 K tokens, no se verifica que la poda preserve esa ventana ni que la cuantizacion Q2_K la mantenga con calidad util.
- Restricciones de licencia: la Llama 3.2 Community License impone condiciones para uso comercial (umbral de 700 millones de usuarios mensuales, obligacion de atribucion, restricciones de uso). Revisar el texto completo antes de desplegar en produccion.
- Modelo derivado no auditado: al ser una publicacion de un tercero sobre otro tercero, no hay garantia de que la poda se haya aplicado correctamente ni de que los pesos sean fieles al modelo base declarado.
- Sin soporte de tool calling verificado: no usar en pipelines agenticos sin validacion previa.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan notablemente la coherencia; el autor recomienda Q4_K_M.
- Fecha de creacion futura en los metadatos (2026-10-27): inconsistencia que sugiere posibles errores en la publicacion; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF
- Modelo base podado: https://huggingface.co/oopere/Llama-3.2-1B-pruned-20pct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
