# zmra/ZMRA-DataAudit-0.5B

## Resumen

ZMRA DataAudit 0.5B es un modelo de lenguaje pequeno (SLM) de 494 millones de parametros, afinado por el autor `zmra` a partir de `Qwen/Qwen2.5-0.5B-Instruct`. Su proposito declarado es generar auditorias estructuradas de cumplimiento de datos, deteccion de informacion personal identificable (PII) y recomendaciones de enmascaramiento dinamico, orientado a perfiles como DPO, arquitectos de seguridad, CIO/CTO y analistas de negocio en entornos de comercio global y seguridad de red.

El modelo se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M (~379 MB) y esta disenado para inferencia puramente offline en CPU, sin dependencia de GPU ni de servicios en la nube. Esta orientacion a despliegue air-gapped encaja con casos donde los datos auditados no pueden salir de la infraestructura del cliente. La ficha del autor lo etiqueta explicitamente como `v0.1-beta` y recomienda su uso solo para evaluacion tecnica y pruebas de viabilidad, no para produccion directa.

Su relevancia actual es limitada pero concreta: demuestra el patron de especializar un modelo base pequeno mediante DPO y salidas estructuradas (JSON Schema) para tareas de gobernanza y policy-as-code, a un coste de recursos minimo. No obstante, con 0,5B de parametros y sin benchmarks publicados, sus capacidades reales de razonamiento sobre normativa compleja deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada); el modelo base admite otras cuantizaciones GGUF, no confirmadas para este fine-tune |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico Q4_K_M, ~379,38 MB); no se publican safetensors del fine-tune |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, mecanismo RoPE y capas con RMSNorm y SwiGLU, tal como corresponde a la familia Qwen2.5. Sobre esa base, el autor aplica un ajuste orientado a gobernanza de datos y policy-as-code. Las etiquetas de la model card mencionan `dpo-governance`, lo que sugiere un ajuste por optimizacion de preferencias directas (DPO) para alinear las respuestas hacia salidas estructuradas y recomendaciones de cumplimiento, aunque el autor no detalla el dataset, el numero de tokens de entrenamiento ni la composicion de las muestras.

No se documentan innovaciones arquitectonicas propias: no hay decodificacion especulativa, atencion lineal ni mezcla de expertos. La propuesta tecnica se apoya en el formato de salida (JSON estructurado validable contra esquema) y en el despliegue offline, mas que en cambios de arquitectura. Tampoco se especifican hiperparametros, regimen de entrenamiento ni proceso de evaluacion interno; el autor menciona un script `verify_benchmark.py` pero no publica sus resultados.

## Capacidades

- Generacion de texto conversacional en ingles, chino y japones, heredada del modelo base Qwen2.5.
- Generacion de informes estructurados de auditoria de cumplimiento y puntuaciones de riesgo (compliance scorecards).
- Identificacion de PII en tablas y APIs de comercio transfronterizo, segun la model card.
- Recomendaciones de enmascaramiento dinamico a nivel de campo.
- Sintesis de politicas como codigo (policy-as-code) y reglas de microsegmentacion en un marco de zero-trust.
- Salidas en JSON conforme a esquema, pensadas para validacion determinista externa.
- Inferencia offline en CPU y en entornos air-gapped.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Auditoria de PII en pipelines de datos: el modelo revisa descripciones de tablas y respuestas de API para senalar campos con datos personales, con validacion posterior contra un esquema JSON; su tamano permite ejecutarlo junto al pipeline sin coste de GPU.
- Redaccion de informes de cumplimiento para DPO: genera borradores estructurados de clasificacion de riesgo y planes de remediacion alineados con GDPR, que un oficial humano revisa y firma.
- Policy-as-code en seguridad de red: produce candidatos de reglas de microsegmentacion y control de acceso en formato estructurado, para su validacion y despliegue por el equipo de plataforma.
- Despliegue air-gapped en entornos regulados: al correr en CPU con menos de 500 MB de RAM, puede instalarse en estaciones de trabajo o contenedores sin salida a internet, manteniendo los logs de auditoria en la infraestructura del cliente.
- Asistencia a analistas de negocio en comercio internacional: resume flujos transaccionales y senala restricciones de acceso y cumplimiento aplicables, como punto de partida para la revision manual.
- Prototipado rapido de asistentes de gobernanza: sirve para validar la viabilidad de un asistente interno de cumplimiento antes de invertir en un modelo mayor, dado su coste de despliegue casi nulo.
- Enmascaramiento guiado en herramientas internas: sugiere que campos enmascarar y con que criterio en interfaces de consulta de datos, con aprobacion humana antes de aplicar cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un script de verificacion (`verify_benchmark.py`) pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas especificas de compliance.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el autor declara ejecucion solo en CPU con menos de 500 MB de RAM para el GGUF Q4_K_M.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria podria ejecutarlo via llama.cpp, pero no es el escenario previsto.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos ~1 GB de VRAM libre si se opta por aceleracion, aunque el diseno es CPU-first.
- Opciones de despliegue: Ollama (via Modelfile), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF Q4_K_M.
- Latencia y throughput estimados: no disponibles; dependen del hardware y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZMRA DataAudit 0.5B | 0,5B | No disponible | Apache-2.0 | GGUF Q4_K_M | Fine-tune de Qwen2.5-0.5B-Instruct orientado a compliance; sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (segun el modelo base) | Apache-2.0 | Safetensors, GGUF | Modelo base generalista, con evaluaciones publicadas por el autor original |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun el modelo base) | Apache-2.0 | Safetensors, GGUF | Mayor capacidad de razonamiento a coste aun moderado en CPU |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens (segun el modelo base) | Llama 3.2 Community License | Safetensors, GGUF | Alternativa pequena con contexto amplio; licencia con restricciones de uso |

La comparacion con el modelo base es la mas directa: ZMRA DataAudit hereda sus capacidades generales y anade un ajuste especifico, pero pierde la disponibilidad de pesos en safetensors y de evaluaciones publicadas.

## Limitaciones y advertencias

- Estado beta experimental: el propio autor indica que no se recomienda su despliegue directo en produccion ni ofrece garantia comercial ni SLA.
- Riesgo de alucinacion elevado: con 0,5B de parametros, la generacion de normativa, articulos o referencias legales puede ser incorrecta; toda salida debe validarse contra un esquema determinista y revisarse por una persona.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas de compliance frente al modelo base ni frente a alternativas.
- Idiomas limitados a ingles, chino y japones; no se declara soporte de espanol.
- Contexto no declarado por el autor; no debe asumirse la ventana completa del modelo base sin verificacion.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5, puede heredar sesgos de los datos de preentrenamiento de ese modelo.
- Licencia Apache-2.0 permisiva para uso comercial, pero el estado beta y la ausencia de garantias desaconsejan su uso en produccion sin evaluacion propia.
- Solo se distribuye en GGUF Q4_K_M; no hay pesos en safetensors del fine-tune para reentrenamiento o cuantizacion alternativa verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zmra/ZMRA-DataAudit-0.5B
- Portal oficial del autor: https://zmra.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
