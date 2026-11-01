# tinyopsec/Privasis-Cleaner-4B-GGUF

## Resumen

Privasis-Cleaner-4B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Privasis-Cleaner-4B, un ajuste fino (fine-tune) de Qwen3-4B-Instruct-2507 especializado en la detección y sanitización de texto con información personal identificable (PII) y datos sensibles. El modelo original fue entrenado por NVIDIA y las cuantizaciones de este repo las ha producido el usuario tinyopsec con llama.cpp.

Su propósito es resolver un problema concreto y muy demandado en producción: limpiar textos (correos, tickets, documentos, transcripciones) antes de enviarlos a otros modelos o sistemas de terceros, eliminando o enmascarando datos personales como nombres, DNI, teléfonos, direcciones o información médica y financiera. Al tratarse de un modelo de solo 4.000 millones de parámetros, es lo bastante ligero para ejecutarse localmente en hardware de consumo, lo que resulta especialmente relevante en escenarios de privacidad donde no se quiere que los propios datos salgan de la máquina.

El modelo conserva la arquitectura transformer de la familia Qwen3 y hereda su instrucción de base; la variante GGUF permite inferencia con llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes compatibles. Es relevante ahora por la creciente presión regulatoria (RGPD) y la necesidad de capas de anonimización previas al uso de LLM comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (família Qwen3, dense) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA non-commercial license (uso no comercial, solo investigación) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-4B-Instruct-2507, un transformer denso (no MoE) de la familia Qwen3 de Alibaba. Hereda por tanto la arquitectura base de Qwen3, con atención estándar y 4.022 millones de parámetros. No es un modelo de propósito general: el fine-tuning lo ha especializado en tareas de sanitización y redacción de PII, es decir, transformar texto de entrada en una versión sin datos personales ni sensibles.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens empleados ni el método de alineación (RLHF, DPO, SFT) en la información disponible. Tampoco consta la técnica de decodificación ni innovaciones arquitectónicas específicas. Las cuantizaciones GGUF del repo se han generado con llama.cpp, abarcando desde precisión completa (F16, ~8 GB) hasta cuantización de 2 bits (Q2_K).

## Capacidades

- Sanitización de texto con PII: detección y redacción/enmascaramiento de datos personales identificables (nombres, identificadores, contacto, etc.) en texto de entrada.
- Generación de texto restringida a la tarea: el modelo está orientado a transformar texto limpio a partir de texto sensible, no a conversación general.
- Ejecución local y offline: al ser GGUF, puede correr completamente en local sin enviar datos a servicios externos, clave para flujos de privacidad.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y otros.
- Etiquetado conversacional en HuggingFace (pipeline text-generation), aunque su especialización es la sanitización.
- No hay evidencia de capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Pre-procesado para LLM comerciales: sanitizar prompts y documentos antes de enviarlos a APIs de terceros (OpenAI, Anthropic, etc.), reduciendo la exposición de datos personales y facilitando el cumplimiento del RGPD.
- Anonimización de tickets de soporte: limpiar conversaciones de atención al cliente antes de almacenarlas o analizarlas, manteniendo el contenido útil para analítica o entrenamiento posterior.
- Depuración de corpora para investigación: preparar datasets de texto (correos, foros, transcripciones) eliminando PII antes de publicarlos o compartirlos entre equipos.
- Redacción de documentos clínicos o legales en entorno local: al ejecutarse en una GPU de consumo, permite tratar documentación sensible sin que salga de la infraestructura propia.
- Pipeline de logs y telemetría: integrar el modelo en procesos batch que limpien logs de aplicaciones antes de su ingesta en sistemas de observabilidad o almacenes de datos.
- Cumplimiento en chatbots internos: usarlo como capa previa en asistentes empresariales para que las consultas de empleados no contengan datos de clientes.
- Evaluación y auditoría de privacidad: probar y comparar políticas de redacción de PII en entornos de investigación, dado su carácter no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según cuantización, para un modelo de ~4 B de parámetros):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M / Q5_0: ~3 GB
  - Q4_K_M / Q4_0: ~2,5 GB
  - Q3_K_M: ~2 GB
  - Q2_K: ~1,7 GB
- GPU recomendadas: cualquier GPU moderna con 4-8 GB de VRAM es suficiente para las cuantizaciones medias; RTX 3060, RTX 4060 o superiores para Q4-Q6; RTX 4090 o A100 para F16 con contexto amplio. También es viable inferencia en CPU dada la eficiencia de llama.cpp.
- Cabe en consumer GPU: sí, con holgura. La cuantización recomendada (Q4_K_M) funciona en GPUs de gama media e incluso en portátiles con GPU de 4 GB; también puede ejecutarse solo con CPU y RAM suficiente.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay indicación de soporte directo para vLLM o TGI con estos ficheros GGUF.
- Latencia y throughput estimados: no disponible. En hardware de consumo típico, un modelo de 4 B cuantizado a 4 bits suele alcanzar decenas de tokens por segundo, pero no hay cifras publicadas para este repo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| Privasis-Cleaner-4B (este) | ~4,0 B | GGUF | Sanitización de PII | NVIDIA non-commercial |
| Microsoft Presidio (no LLM) | n/a (reglas + NER) | Python | Detección/redacción de PII | MIT |
| StarPII / modelos NER de PII en HF | variable (100M-1B) | safetensors | Detección de entidades PII | variable |

Presidio, al basarse en reglas y NER clásicos, es más rápido y auditable pero menos flexible con PII implícita o contextual; Privasis-Cleaner-4B aprovecha la comprensión lingüística de un LLM para casos ambiguos, a costa de mayor consumo de cómputo y una licencia restrictiva. No hay disponibles alternativas LLM fine-tuned específicas para sanitización de PII de tamaño comparable con datos suficientes para una comparativa cuantitativa: no disponible.

## Limitaciones y advertencias

- Licencia no comercial: la licencia NVIDIA restringe el uso a investigación y fines no comerciales. Su uso en producción comercial (por ejemplo, en un SaaS) no está permitido sin autorización; esto es un bloqueador importante para muchos de los casos de uso descritos.
- Riesgo de alucinación en la redacción: como todo LLM, puede omitir PII o alterar contenido no sensible; la propia model card advierte evaluar el modelo antes de usarlo en pipelines de producción.
- No sustituye un cumplimiento certificado: usarlo como única medida de anonimización no garantiza conformidad con el RGPD; conviene combinarlo con revisión humana o sistemas deterministas.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto efectiva; el rendimiento en castellano no está documentado.
- Cuantizaciones agresivas (Q3, Q2_K) pueden degradar la capacidad de detección de PII, lo cual es crítico en esta tarea: se recomienda la cuantización más alta posible.
- Descargas y adopción muy bajas (372 descargas, 0 likes en el momento de la ficha), sin benchmarks publicados ni auditoría de terceros: tratarlo como herramienta experimental.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/Privasis-Cleaner-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original (referenciado en la model card): https://huggingface.co/nvidia/Privasis-Cleaner-4B
- Paper, blog o demo: no disponible
