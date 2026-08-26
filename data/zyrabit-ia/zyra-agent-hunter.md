# Zyrabit-IA/zyra-agent-hunter

## Resumen

Zyra Agent Hunter es un modelo de lenguaje pequeño (SLM) especializado en generación de leads y outreach B2B, desarrollado por Zyrabit Architecture Labs bajo la marca Zyrabit-IA. Se trata de un fine-tuning del modelo base Qwen/Qwen2.5-3B, orientado a tareas estructuradas de prospección comercial: puntuación de ICP (perfil de cliente ideal), enriquecimiento de contactos y redacción de mensajes en frío. El modelo se distribuye en formato GGUF cuantizado Q5_K_M y está pensado para entornos aislados (air-gapped) con soberanía de datos.

La relevancia de este modelo radica en su enfoque en IA soberana: está diseñado para ejecutarse en infraestructura propia sin llamadas externas, con una capa de redacción de PII integrada y verificación de aislamiento de red. El autor declara haberlo fine-tuneado sobre hardware Tenstorrent Blackhole p150 NPU, logrando una latencia P95 de 128 ms y un throughput de entrenamiento de 1180 pasos/segundo. Se encuentra en fase beta pública (v1.0.0-beta.1-sovereign) y su dataset de entrenamiento consta de 2000 pares sanitizados, con trazabilidad completa mediante checksum SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen2.5-3B) |
| Parametros totales | 3 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | ingles, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero .gguf) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen2.5-3B, un modelo denso de 3 mil millones de parametros. Zyrabit-IA ha realizado un fine-tuning especifico sobre un dataset propio de 2000 pares de instrucciones y respuestas, diseñado para tareas de generacion de leads y outreach. El entrenamiento se llevo a cabo en hardware Tenstorrent Blackhole p150 NPU, con una velocidad declarada de 1180.20 pasos por segundo. No se menciona el uso de tecnicas como RLHF o DPO; el proceso se describe como un ajuste fino supervisado clasico.

Una innovacion destacable es el enfasis en la trazabilidad del dataset: cada version del modelo se vincula a un conjunto de datos concreto mediante un checksum SHA-256, y el etiquetado `ds-v1.0.0-2000pairs` permite auditar el linaje completo. El modelo requiere el uso de la plantilla de chat ChatML y tokens de parada estrictos (`<|im_start|>` y `<|im_end|>`) para evitar bucles de generacion o salidas sin formato.

## Capacidades

- Generacion de texto especializada en prospeccion comercial: redaccion de mensajes de contacto en frio, seguimientos y propuestas iniciales.
- Puntuacion de ICP (perfil de cliente ideal): el modelo puede clasificar o puntuar prospectos segun criterios definidos por el usuario.
- Enriquecimiento de contactos: extraccion y estructuraccion de informacion de contacto a partir de texto no estructurado.
- Cumplimiento de esquemas JSON: el autor declara un 100% de validez estructural en las salidas JSON, lo que facilita la integracion en pipelines automatizados.
- Redaccion de PII: capa de redaccion de informacion personal identificable integrada en el runtime recomendado, con una tasa de fuga declarada del 0%.
- Aislamiento de red: disenado para entornos air-gapped, sin llamadas externas ni telemetria.
- Soporte bilingue ingles-espanol para las tareas anteriores.

## Casos de uso

- Automatizacion de prospeccion comercial: el modelo puede generar secuencias de correos de presentacion personalizados para listas de prospectos, manteniendo un tono coherente y adaptado al ICP definido. Su capacidad de seguir instrucciones (IFEval 92.1%) asegura que los mensajes cumplan con las directrices de la empresa.
- Puntuacion y clasificacion de leads en CRMs: integrado como un servicio interno, el modelo puede analizar descripciones de empresas y asignar una puntuacion de idoneidad segun criterios predefinidos, devolviendo resultados en JSON para su consumo directo por herramientas como Salesforce o HubSpot.
- Enriquecimiento de datos de contacto: a partir de texto libre (paginas web, notas de llamadas), el modelo extrae y estructura nombres, cargos, empresas y correos, reduciendo el trabajo manual de los equipos de ventas.
- Generacion de respuestas en chatbots de cualificacion: en un flujo conversacional, el modelo puede mantener una conversacion multi-turno para cualificar visitantes de un sitio web, recopilando informacion clave y ofreciendo respuestas en ingles o espanol.
- Analisis de cumplimiento normativo en comunicaciones: gracias a su capa de redaccion de PII, el modelo puede revisar borradores de mensajes y eliminar o anonimizar datos personales antes de su envio, util en sectores regulados.
- Despliegue en entornos aislados para organismos publicos o empresas con requisitos estrictos de confidencialidad: el modelo se ejecuta localmente sin conexiones salientes, garantizando que los datos de clientes no abandonen la infraestructura.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor en la model card y no han sido verificados de forma independiente:

| Benchmark | Metrica | Resultado declarado |
|---|---|---|
| Domain Evaluation Suite | Precision en tareas de dominio (agent test accuracy) | 96.5% |
| IFEval | Adherencia a instrucciones (strict prompt) | 92.1% |
| JSON Schema Validity | Precisión de parseo estructural | 100.0% |
| PII Redaction Audit | Tasa de fuga de informacion personal | 0.0% |
| Air-Gap Network Verification | Paquetes de red salientes | 0 bytes |

Ademas, se reportan metricas de hardware en Tenstorrent Blackhole p150: latencia P95 de 128 ms y throughput de fine-tuning de 1180.20 pasos/segundo. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un SLM de 3 mil millones de parametros cuantizado a Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se proporciona una cifra exacta en la documentacion.
- El hardware de referencia declarado es el Tenstorrent Blackhole p150 NPU, con el que se lograron las metricas de latencia y throughput mencionadas.
- El stack Docker oficial de Zyrabit permite perfiles de hardware para Tenstorrent NPU, GPU y CPU, lo que sugiere compatibilidad multiplataforma.
- Opciones de despliegue: Ollama (mediante Modelfile con plantilla ChatML), Docker con el runtime oficial `zyrabitcore/zyrabit-slm:2.4.1`, o integracion manual con motores que soporten GGUF como llama.cpp o vLLM.
- No se han publicado datos de latencia o throughput en GPUs convencionales; las unicas cifras disponibles corresponden al hardware Tenstorrent.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria (SLMs especializados en prospeccion comercial). Como referencia, se puede comparar con el modelo base Qwen2.5-3B, del que deriva:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Zyra Agent Hunter | 3B | no disponible | Apache 2.0 | Generacion de leads y outreach B2B |
| Qwen2.5-3B (base) | 3B | 32k (segun documentacion oficial de Qwen) | Apache 2.0 | Generacion de texto general |

No se han encontrado otros SLMs comparables con fines identicos en la informacion disponible.

## Limitaciones y advertencias

- El modelo se encuentra en fase beta publica (v1.0.0-beta.1-sovereign) y se describe como un "Proof-of-Concept", por lo que su rendimiento en produccion puede variar.
- El dataset de entrenamiento es reducido (2000 pares), lo que puede limitar la generalizacion a dominios o estilos de escritura no representados.
- No se han publicado evaluaciones en benchmarks estandar de razonamiento o conocimiento general; las metricas declaradas se centran exclusivamente en tareas de dominio.
- La longitud de contexto no esta especificada; se recomienda verificar la compatibilidad con el modelo base Qwen2.5-3B (que soporta 32k tokens) antes de usarlo con entradas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es una beta y el autor podria introducir cambios sustanciales en versiones posteriores.
- La capa de redaccion de PII y el aislamiento de red son funcionalidades del stack Docker oficial; si se ejecuta el GGUF de forma manual, esas garantias no estan activas por defecto.
- Los resultados de benchmarks no estan verificados de forma independiente y provienen exclusivamente de las declaraciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-agent-hunter
- Repositorio del modelo cuantizado (GGUF): https://huggingface.co/Zyrabit-IA/zyra-agent-hunter-Q5_K_M
- Organizacion Zyrabit en Hugging Face: https://huggingface.co/Zyrabit-IA
- Sitio web oficial de Zyrabit: https://www.zyrabit.co.uk/
- Repositorio de infraestructura (GitHub): https://github.com/Zyrabit-tech/zyrabit-SLM
- Imagen Docker en Docker Hub: https://hub.docker.com/r/zyrabitcore/zyrabit-slm
