# UtkarshSinghShrinet/swarmhunter-v2-gguf

## Resumen

SwarmHunter v2 (GGUF) es la versión cuantizada en formato GGUF (Q8_0) de SwarmHunter v2, un modelo de lenguaje especializado en razonamiento de ciberseguridad, verificación de exploits y análisis de vulnerabilidades, desarrollado por Utkarsh Singh Shrinet. El modelo base se ha ajustado a partir de swarmhunter-3b mediante un entrenamiento con 2,28 millones de muestras y una posterior alineación con 18.000 pares de Direct Preference Optimization (DPO), con el objetivo de mejorar la fiabilidad de sus respuestas en tareas ofensivas y defensivas de seguridad.

Este modelo resuelve un problema concreto: la falta de modelos pequeños y abiertos afinados específicamente para tareas como detección de vulnerabilidades, análisis de CVE/CWE, pruebas de penetración y resolución de retos CTF. Su tamaño reducido (aproximadamente 3.086 millones de parámetros) y su distribución en GGUF lo hacen ejecutable localmente en hardware de consumo mediante Ollama o llama.cpp, lo que resulta especialmente relevante para equipos de seguridad que necesitan análisis offline sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only); detalle específico no disponible |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

SwarmHunter v2 parte de swarmhunter-3b, un modelo de unos 3.000 millones de parametros que fue afinado con un corpus de 2,28 millones de muestras orientadas a ciberseguridad. Sobre esa base se aplico una etapa de alineacion con Direct Preference Optimization (DPO) utilizando 18.000 pares de preferencias, ejecutada durante 2.250 pasos. Segun el autor, el entrenamiento DPO alcanzo una reduccion de la perdida del 99,4 % y un 100 % de precision de recompensa, metricas que sugieren un ajuste muy fuerte sobre el conjunto de preferencias (aunque conviene interpretarlas con cautela por la ausencia de una evaluacion independiente).

La ficha no detalla la arquitectura subyacente exacta, el numero de tokens del preentrenamiento ni la composicion precisa del dataset. La version GGUF aqui descrita esta cuantizada a Q8_0, un esquema de 8 bits que conserva casi toda la calidad del modelo original con una reduccion significativa de memoria. Los tags del repositorio indican ademas el uso de RLHF/DPO y dominios de aplicacion como CVE, CWE y CTF.

## Capacidades

- Razonamiento autonomo en ciberseguridad: analisis de vulnerabilidades y verificacion de exploits.
- Deteccion y clasificacion de vulnerabilidades (tags de vulnerability-detection).
- Analisis de exploits y apoyo en pruebas de penetracion (pentesting).
- Conocimiento y manejo de identificadores CVE y CWE.
- Resolucion de retos CTF (Capture The Flag).
- Generacion de texto conversacional (pipeline text-generation).
- Ejecucion local mediante Ollama con un solo comando.
- No hay informacion sobre tool calling, capacidades de vision/audio ni modos de razonamiento extendido.

## Casos de uso

- Analisis de CVE y CWE: dado un identificador o una descripcion de vulnerabilidad, el modelo puede resumir el fallo, explicar la clase de debilidad CWE asociada y proponer vectores de verificacion, util para triaje rapido de boletines de seguridad.
- Verificacion de exploits en entornos controlados: un pentester puede usar el modelo para razonar sobre la explotabilidad de un hallazgo y generar pasos de validacion en un laboratorio aislado, aprovechando su afinado especifico en exploit-analysis.
- Asistente para retos CTF: generacion de pistas, analisis de binarios o servicios descritos textualmente y propuestas de enfoque para categorias tipicas (web, pwn, crypto basica).
- Revision de codigo orientada a seguridad: deteccion de patrones de codigo vulnerables en revisiones de pull requests, sirviendo como primer filtro antes de un analisis humano profundo.
- Redaccion de informes de pentesting: transformacion de hallazgos tecnicos en descripciones estructuradas con severidad, impacto y recomendaciones de mitigacion.
- Formacion y simulacros internos: creacion de escenarios de ataque realistas para entrenar a equipos azules y rojos sin exponer datos a servicios en la nube, gracias a su ejecucion local.
- Triaje de alertas en un SOC: clasificacion y enriquecimiento inicial de alertas de seguridad en entornos con restricciones de confidencialidad que impiden el uso de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas aportadas son del propio entrenamiento DPO (99,4 % de reduccion de perdida y 100 % de reward accuracy), que no son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8_0 (8 bits), aproximadamente 3,3 GB de pesos mas el contexto; en la practica, entre 4 y 6 GB de VRAM o RAM segun la longitud de contexto.
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o incluso GPUs de 8 GB; tambien es viable su ejecucion solo en CPU dada la eficiencia de GGUF, con menor velocidad.
- GPUs recomendadas: cualquier GPU moderna con 8 GB o mas de VRAM (RTX 3060/4060 o superiores); no se requieren A100 ni H100 para este tamano.
- Opciones de despliegue: Ollama (via directa desde HuggingFace con `ollama run hf.co/UtkarshSinghShrinet/swarmhunter-v2-gguf:swarmhunter-v2.Q8_0.gguf`), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de ~3B con Q8_0, se esperan latencias bajas en GPU de consumo y velocidades moderadas en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| SwarmHunter v2 (GGUF) | ~3,09 B | Ciberseguridad (CVE, CWE, pentesting, CTF) | Apache 2.0 | GGUF (Q8_0) |
| WhiteRabbitNeo (variantes ~7B-13B) | 7B-13B | Ciberseguridad ofensiva/defensiva | No disponible en esta ficha | GGUF, safetensors |
| Llama 3.2 3B Instruct | ~3,2 B | Uso general | Licencia Llama 3.2 | safetensors, GGUF |
| Qwen2.5 3B Instruct | ~3 B | Uso general, fuerte en codigo | Apache 2.0 / Qwen | safetensors, GGUF |

Frente a los modelos generalistas de tamano similar (Llama 3.2 3B, Qwen2.5 3B), SwarmHunter v2 ofrece un afinado especifico en dominios de seguridad que puede mejorar el rendimiento en tareas de vulnerabilidades y CTF, aunque carece de benchmarks publicos que permitan cuantificar esa ventaja. Su licencia Apache 2.0 es mas permisiva que la de Llama 3.2 para uso comercial.

## Limitaciones y advertencias

- Sin benchmarks independientes: las metricas de rendimiento provienen del propio autor del modelo; no hay evaluaciones externas verificables.
- Riesgo de alucinacion elevado en dominios tecnicos: en ciberseguridad, una respuesta incorrecta sobre explotabilidad o mitigacion puede tener consecuencias reales; toda salida debe ser verificada por un profesional.
- Uso etico y legal: al estar orientado a pentesting y exploit analysis, su uso fuera de entornos autorizados puede ser ilegal; el despliegue debe limitarse a laboratorios y auditorias consentidas.
- Idioma: el modelo esta orientado al ingles; su rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no documentada: dificulta planificar tareas que requieran analizar documentos o codigos extensos.
- Cuantizacion unica: solo se distribuye Q8_0; no hay variantes mas agresivas (Q4_K_M, etc.) en este repositorio para hardware muy limitado.
- Proyecto individual: con pocas descargas (52) y un unico mantenedor, la sostenibilidad y el soporte a largo plazo son inciertos.

## Enlaces

- Modelo GGUF cuantizado: https://huggingface.co/UtkarshSinghShrinet/swarmhunter-v2-gguf
- Modelo base (SwarmHunter v2): https://huggingface.co/UtkarshSinghShrinet/swarmhunter-v2
- Modelo predecesor (SwarmHunter 3B): https://huggingface.co/UtkarshSinghShrinet/swarmhunter-3b
- Ejecucion directa con Ollama: `ollama run hf.co/UtkarshSinghShrinet/swarmhunter-v2-gguf:swarmhunter-v2.Q8_0.gguf`
- Paper, blog o demo: no disponible
