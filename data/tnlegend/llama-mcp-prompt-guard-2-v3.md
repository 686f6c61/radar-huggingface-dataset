# tnlegend/Llama-MCP-Prompt-Guard-2-V3

## Resumen

Llama-MCP-Prompt-Guard-2-V3 es un ajuste fino de investigacion sobre el clasificador Meta Llama Prompt Guard 2 86M, desarrollado por el usuario tnlegend. Su proposito concreto es detectar inyeccion de prompts y jailbreaks en texto de descripciones de herramientas del protocolo MCP (Model Context Protocol), es decir, en las cadenas descriptivas que los servidores MCP exponen a los agentes LLM y que constituyen un vector de ataque conocido. El modelo se integra como senal asesora asincrona opcional (modo SHADOW) dentro de un framework de seguridad MCP, y su prediccion no autoriza ni bloquea nada por si misma.

Tecnicamente es un clasificador binario de texto con backbone DeBERTa-v2, derivado del checkpoint Prompt Guard 2 de 86M de parametros de Meta, pero con 278,8 millones de parametros totales en el safetensors publicado (el ajuste fino incorpora una cabeza y posiblemente capas adicionales sobre el backbone original). El repositorio ocupa 1,1 GB y se distribuye unicamente en safetensors, con los ficheros de tokenizacion congelados y verificacion SHA-256 por parte del framework consumidor.

Su relevancia es acotada pero especifica: cubre un nicho emergente como es la seguridad de descripciones de herramientas en arquitecturas de agentes con MCP, un vector que los clasificadores genericos de prompt injection no tratan de forma explicita. No obstante, es un artefacto de investigacion sin validacion de produccion, sin dataset publicado y con licencia Llama 4 Community, lo que limita su adopcion directa en entornos comerciales sin revision legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto), ajuste fino de meta-llama/Llama-Prompt-Guard-2-86M |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama4 (Llama 4 Community License) |
| Formato de pesos | safetensors (model.safetensors, config.json, tokenizer.json, tokenizer_config.json, special_tokens_map.json) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto basado en DeBERTa-v2, segun la model card del checkpoint base de Meta, ajustado a partir de meta-llama/Llama-Prompt-Guard-2-86M. La model card del autor describe el resultado como un clasificador binario congelado de prompt injection y jailbreak, especializado en texto de descripciones de herramientas MCP en ingles. El safetensors publicado contiene 278,8 millones de parametros, muy por encima de los 86M del checkpoint base, lo que sugiere una cabeza de clasificacion y capas adicionales anadidas durante el ajuste fino; el autor no documenta la composicion exacta de esa cabeza ni la arquitectura modificada.

No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. La model card indica explicitamente que el dataset de entrenamiento, las etiquetas, las descripciones de herramientas en bruto y los artefactos de diagnostico no se incluyen en el repositorio. Las anotaciones historicas de datos fueron revisadas por IA, no certificadas por humanos, y no se ha establecido una generalizacion ciega e independiente ni una carga completa del Gateway en produccion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, algo esperable en un clasificador encoder-only.

## Capacidades

- Clasificacion binaria de texto para deteccion de prompt injection y jailbreak en descripciones de herramientas MCP en ingles.
- Especializacion en el vector de ataque de tool descriptions dentro de arquitecturas de agentes con Model Context Protocol.
- Integracion como senal asesora asincrona (SHADOW) en el framework de seguridad MCP del autor, desactivada por defecto.
- Inferencia determinista sobre ficheros congelados con verificacion de tamano y SHA-256; el framework no ejecuta codigo Python remoto no confiable.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Tool calling, function calling, generacion de texto, razonamiento multi-paso, vision o audio: no disponibles; es un clasificador, no un modelo generativo.
- Modo thinking: no disponible.

## Casos de uso

- Filtrado previo de descripciones de herramientas MCP: antes de registrar un servidor MCP en un agente, pasar el texto de cada tool description por el clasificador y marcar como sospechosas aquellas con alta probabilidad de inyeccion, para revision manual posterior.
- Senal asesora en pipelines de seguridad de agentes: usar la prediccion como una mas entre varias comprobaciones (analisis estatico, allowlists, firmas) sin otorgarle capacidad de bloqueo, tal como recomienda el autor en modo SHADOW.
- Monitorizacion en tiempo de ejecucion de registros MCP: clasificar de forma asincrona las descripciones de herramientas que un agente descubre dinamicamente en un marketplace o registro, generando alertas para el equipo de seguridad.
- Investigacion en seguridad de agentes: emplear el modelo como linea base para estudiar la eficacia de clasificadores especializados frente a clasificadores genericos de prompt injection en el dominio MCP.
- Deteccion de jailbreaks en texto de configuracion: analizar metadatos y descripciones de herramientas de terceros antes de incorporarlas a un entorno de desarrollo con agentes.
- Evaluacion comparativa de defensas: usar el checkpoint como componente de referencia en experimentos que midan tasas de falsos positivos y falsos negativos de distintas estrategias de saneamiento de tool descriptions.
- Auditoria de repositorios de servidores MCP: procesar por lotes las descripciones de herramientas de un catalogo interno y priorizar las que el clasificador marque para revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278,8 millones de parametros en safetensors el checkpoint completo en fp32 ronda 1,1 GB, por lo que la inferencia en fp32 o fp16 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090) deberia poder ejecutar el modelo; para lotes grandes o alto throughput, A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, por el tamano del checkpoint; no hay confirmacion oficial de latencias ni de soporte en herramientas concretas.
- Opciones de despliegue: el autor no documenta ninguna. El framework consumidor carga los cinco ficheros congelados y verifica SHA-256; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador DeBERTa es mas natural servirlo con Transformers o un runtime de clasificacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-MCP-Prompt-Guard-2-V3 | 278.810.882 | no disponible | Clasificacion de prompt injection en tool descriptions MCP (ingles) | llama4 | Hugging Face, 0 descargas |
| meta-llama/Llama-Prompt-Guard-2-86M | 86M (aprox., segun nombre del checkpoint) | no disponible | Clasificacion de prompt injection y jailbreak (multilingue, segun model card del autor) | Llama 4 Community License | Hugging Face, checkpoint oficial de Meta |
| Clasificadores genericos de prompt injection | no disponible | no disponible | Deteccion de inyeccion en prompts de usuario | variable | variable |

La comparativa se limita al checkpoint base, ya que la informacion proporcionada no incluye otros clasificadores especializados en MCP con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no es una garantia de seguridad ni un modelo aprobado para produccion.
- Prediccion no vinculante: en el framework MCP actua solo como senal asesora asincrona en modo SHADOW, desactivada por defecto; no autoriza, bloquea, aprueba ni exime de controles de seguridad.
- Dataset y etiquetas no publicados: no es posible auditar la composicion del entrenamiento ni reproducir los resultados.
- Anotaciones revisadas por IA, no certificadas por humanos, lo que introduce riesgo de sesgo y de etiquetas erroneas.
- Generalizacion no establecida: no se ha realizado una validacion ciega e independiente ni una prueba de carga completa del Gateway en produccion.
- Idioma limitado al ingles: las descripciones de herramientas en castellano u otros idiomas quedan fuera del alcance declarado.
- Riesgo de falsos positivos y falsos negativos inherente a un clasificador binario; sin metricas publicadas no puede cuantificarse.
- Licencia Llama 4 Community: no es Apache ni MIT; requiere leer LICENSE, USE_POLICY.md y NOTICE antes de usar o redistribuir, e impone obligaciones de nombrado (el nombre debe empezar por "Llama").
- Sin cuantizaciones publicadas ni soporte documentado en runtimes de inferencia habituales.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tnlegend/Llama-MCP-Prompt-Guard-2-V3
- Checkpoint base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Licencia Llama 4: https://www.llama.com/llama4/license/
- Politica de uso de Llama: https://www.llama.com/llama4/use-policy/
- Documentacion del Model Context Protocol: https://modelcontextprotocol.io/
