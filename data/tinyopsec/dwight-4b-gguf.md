# tinyopsec/dwight-4b-GGUF

## Resumen

dwight-4b-GGUF es la distribucion en formato GGUF del modelo zime-ai/dwight-4b, un ajuste fino de Qwen3-4B-Instruct-2507 orientado especificamente al analisis de llamadas de ventas y la generacion de decisiones e insights sobre conversaciones comerciales. Lo publica el usuario tinyopsec en Hugging Face bajo licencia Apache 2.0, y su proposito es ofrecer una version cuantizada y ejecutable en local mediante llama.cpp y otros runtimes compatibles con GGUF, sin necesidad de GPU de datacenter.

El modelo parte de una arquitectura transformer densa de Qwen3 con 4.022.468.096 parametros totales (aproximadamente 4B), lo que lo situa en la gama de modelos pequenos-medios aptos para inferencia en hardware de consumo. El repositorio incluye trece variantes de cuantizacion, desde F16 (~8 GB) hasta Q2_K, lo que permite desplegarlo en entornos con recursos muy limitados.

Su relevancia actual radica en la especializacion vertical: frente a modelos generalistas del mismo tamano, esta ajustado para tareas de conversation intelligence (clasificacion de llamadas, analisis de sentimiento comercial, extraccion de objeciones y senales de compra). La disponibilidad de GGUF lo hace directamente integrable en pipelines de atencion al cliente y CRM sin infraestructura propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base zime-ai/dwight-4b es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3 con aproximadamente 4B parametros. La model card no detalla la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO; unicamente se indica que esta especializado en decisiones de llamadas de ventas e insights (sales-call decisions and insights).

La innovacion de esta publicacion concreta no reside en la arquitectura, sino en el proceso de cuantizacion realizado con llama.cpp, que genera trece variantes de precision adaptadas a distintos presupuestos de memoria. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional orientada a dominios comerciales y de ventas.
- Analisis y clasificacion de llamadas de ventas (call-analysis), incluyendo extraccion de senales de compra y objeciones.
- Generacion de insights y resumenes a partir de transcripciones de conversaciones.
- Clasificacion de conversaciones (tag classification) para enrutamiento o etiquetado en CRM.
- Inferencia local en CPU y GPU mediante llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Analisis de llamadas de ventas en centros de contacto: el modelo procesa transcripciones de conversaciones comerciales y genera resumenes estructurados con objeciones detectadas, senales de interes y siguiente accion recomendada, aprovechando su ajuste especifico en call-analysis.
- Clasificacion automatica de llamadas en un CRM: se puede invocar el modelo para etiquetar cada llamada por resultado (cierre, seguimiento, rechazo) y por tematica, facilitando el enrutamiento y la analitica posterior.
- Coaching de equipos comerciales: generar feedback accionable a partir de transcripciones, identificando puntos de mejora en el discurso de venta y momentos clave de la conversacion.
- Generacion de notas post-llamada: producir resumenes concisos y estructurados que se sincronicen automaticamente con el sistema de registro, reduciendo el trabajo manual del comercial.
- Extraccion de entidades comerciales: identificar productos mencionados, presupuestos, competidores y fechas de seguimiento a partir del texto de la conversacion.
- Despliegue en entornos con privacidad estricta: al ejecutarse en local con llama.cpp y cuantizaciones Q4_K_M o inferiores, permite analizar conversaciones sensibles sin enviar datos a APIs externas.
- Prototipado rapido de asistentes de venta: integrar el modelo en Ollama o LM Studio para validar flujos conversacionales antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (aproximada, segun tamano de pesos): F16 ~8 GB, Q8_0 ~4,3 GB, Q6_K ~3,3 GB, Q5_K_M ~2,9 GB, Q4_K_M ~2,5 GB, Q3_K_M ~2,0 GB, Q2_K ~1,6 GB. Estas cifras corresponden solo a los pesos; hay que anadir el espacio para el contexto KV cache.
- GPU recomendadas: para F16 o Q8_0, una RTX 3090/4090 (24 GB) o A100/H100 si se requiere alto throughput; para Q4_K_M o inferiores, una RTX 3060 (12 GB) o incluso GPUs de 8 GB son suficientes.
- Cabe en GPU de consumo: si, en practicamente todas las cuantizaciones de 4 bits o menos; tambien en CPU pura con llama.cpp para Q4_K_M y menores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| tinyopsec/dwight-4b-GGUF | ~4,02B | no disponible | Apache 2.0 | GGUF | Analisis de ventas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible | Apache 2.0 | safetensors | Generalista |
| zime-ai/dwight-4b (modelo base) | ~4,02B | no disponible | Apache 2.0 | safetensors | Analisis de ventas |

La comparativa se limita a los modelos directamente relacionados segun la informacion disponible. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo especializado en analisis de llamadas de ventas: su rendimiento en tareas generales puede ser inferior al de Qwen3-4B-Instruct sin ajustar.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente al generar resumenes o extraer entidades de transcripciones largas o ruidosas.
- No se documentan los idiomas soportados; el ajuste fino podria estar sesgado hacia el ingles si el dataset de entrenamiento era mayoritariamente angloparlante, lo que es un riesgo para despliegues en castellano.
- La model card incluye un aviso explicito del autor: "Sales-call analysis model. Evaluate before use", lo que recomienda una evaluacion previa a produccion.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el manejo de transcripciones largas sin truncamiento.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507 y del ajuste zime-ai/dwight-4b, ya que la cadena de licencias debe respetarse.
- Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad en tareas de clasificacion fina; se recomienda Q4_K_M o superior para produccion.
- El repositorio tiene 0 likes y 739 descargas en la fecha de actualizacion, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/tinyopsec/dwight-4b-GGUF
- Modelo base del ajuste: https://huggingface.co/zime-ai/dwight-4b
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
