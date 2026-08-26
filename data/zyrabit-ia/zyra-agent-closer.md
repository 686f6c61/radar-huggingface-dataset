# Zyrabit-IA/zyra-agent-closer

## Resumen

Zyra Agent Closer es un modelo de lenguaje pequeño (SLM) especializado en tareas de negociación y cierre de acuerdos B2B, desarrollado por Zyrabit-IA dentro de su línea Sovereign AI. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-3B, orientado a manejo de objeciones de venta, modelos de precios y ejecución de contratos empresariales en entornos aislados. La versión actual, `v1.0.0-beta.1-sovereign`, es un prototipo funcional (PoC) entrenado sobre hardware Tenstorrent Blackhole p150 NPU y distribuido en formato GGUF con cuantización Q5_K_M.

El modelo está diseñado para operar en infraestructuras con soberanía de datos: sin llamadas externas, sin telemetría y con redacción de PII en memoria. Su relevancia radica en ofrecer una alternativa de bajo coste y alta privacidad para automatizar flujos de negociación en sectores regulados como banca, gobierno o sanidad. Con solo 3.000 millones de parámetros, puede ejecutarse en hardware modesto, aunque su despliegue recomendado es mediante el stack Docker oficial de Zyrabit.

La ficha técnica se basa exclusivamente en la información publicada por el autor en Hugging Face y en la documentación oficial. No se han verificado de forma independiente los resultados declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3B (base Qwen2.5-3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q5_K_M |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó sobre un dataset propio de 2.000 pares de instrucción-respuesta sanitizados, denominado `zyra_agent_closer.jsonl`, con checksum SHA-256 documentado para trazabilidad. El entrenamiento se llevó a cabo en un Tenstorrent Blackhole p150 NPU, alcanzando un throughput de 1.150,80 pasos por segundo (más de 6.900 veces superior a una CPU de referencia). No se menciona el uso de técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado convencional.

Una innovación destacable es el énfasis en la soberanía de datos: el modelo está diseñado para ejecutarse en entornos sin conexión (air-gapped), con redacción de PII en memoria y validación estricta de esquemas JSON. La model card indica que el 100% de las salidas cumplen con el esquema JSON esperado y que la tasa de fuga de PII es del 0,0% en las pruebas internas.

## Capacidades

- Generación de texto especializada en negociación y cierre de acuerdos B2B: manejo de objeciones, propuestas de precios, términos contractuales.
- Cumplimiento de instrucciones con alta adherencia: puntuación IFEval strict prompt del 92,1% según el autor.
- Generación de salidas estructuradas en JSON con validez del 100% en las pruebas internas.
- Soporte bilingüe inglés-español.
- Diseñado para tareas de agente en entornos aislados, con capacidad de mantener conversaciones multi-turno (implícito por su naturaleza de chat).
- Compatible con el formato ChatML y tokens de parada específicos para evitar bucles de generación.

## Casos de uso

- Automatización de negociaciones comerciales: el modelo puede gestionar conversaciones de venta con clientes potenciales, respondiendo a objeciones y ajustando propuestas según reglas predefinidas, gracias a su entrenamiento específico en ese dominio.
- Generación de propuestas y contratos: dado su alto cumplimiento de esquemas JSON, puede producir borradores de propuestas o cláusulas contractuales en formato estructurado listo para integración en sistemas de gestión documental.
- Asistente de cierre de ventas para equipos comerciales: integrado en un CRM, puede sugerir respuestas a correos o chats de clientes, manteniendo el tono y las políticas de la empresa.
- Atención al cliente en sectores regulados: al funcionar sin conexión y con redacción de PII, es adecuado para banca o sanidad donde los datos no pueden salir del perímetro.
- Automatización de flujos de trabajo en entornos air-gapped: puede ejecutarse en infraestructuras aisladas para tareas de generación de informes o respuestas estandarizadas.
- Entrenamiento y evaluación de agentes de negociación: al ser un SLM ligero, sirve como base para pruebas de concepto en investigación sobre IA conversacional aplicada a ventas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. No se han verificado de forma independiente.

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Test Accuracy | Precisión en dominio de negociación | 95,8% |
| IFEval | Instrucciones estrictas | 92,1% |
| JSON Schema Validity | Cumplimiento de esquema JSON | 100,0% |
| PII Redaction Audit | Tasa de fuga de PII | 0,0% |
| Air-Gap Verification | Paquetes de red salientes | 0 bytes |

Además, se reporta una latencia P95 de 135,0 ms en el hardware objetivo (Tenstorrent Blackhole p150). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo es un SLM de 3B parámetros cuantizado a Q5_K_M, por lo que el archivo GGUF ocupa aproximadamente entre 2 y 3 GB (estimación razonable, no confirmada por el autor).
- Hardware de entrenamiento declarado: Tenstorrent Blackhole p150 NPU (arquitectura BLACKHOLE).
- Para inferencia, el autor recomienda el uso del stack Docker oficial de Zyrabit, que incluye perfiles para NPU Tenstorrent, GPU y CPU.
- También es posible ejecutarlo mediante Ollama con un Modelfile que defina la plantilla ChatML y los tokens de parada.
- Dado su tamaño, debería ser ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se especifica un valor exacto en la documentación.
- Opciones de despliegue: Ollama, Docker (zyrabitcore/zyrabit-slm:2.4.1), o ejecución manual del GGUF con llama.cpp u otros motores compatibles.
- La latencia reportada de 135 ms P95 es específica del hardware NPU Tenstorrent; en CPU o GPU convencional los tiempos pueden variar.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados por el autor. A continuación se comparan características generales con otros SLM de tamaño similar, basadas en información pública de cada modelo (no en resultados de este modelo).

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Zyra Agent Closer (este) | 3B | No disponible | Apache 2.0 | Negociación B2B, soberanía de datos |
| Qwen2.5-3B (base) | 3B | 32k (según documentación de Qwen) | Apache 2.0 | Generalista |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | Generalista |
| Phi-3.5-mini | 3.8B | 128k | MIT | Razonamiento, código |

La comparativa de rendimiento no es posible con los datos disponibles, ya que el autor solo ha publicado métricas internas de dominio.

## Limitaciones y advertencias

- Versión beta (v1.0.0-beta.1-sovereign): se trata de un prototipo funcional, no de una versión estable. El autor advierte que los parámetros y plantillas de chat se refinan continuamente.
- Dataset de entrenamiento muy reducido: solo 2.000 pares, lo que limita la generalización y puede provocar sobreajuste al dominio concreto.
- Sin información sobre sesgos: no se han publicado auditorías de sesgo ni evaluaciones de robustez fuera del dominio de negociación.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos no cubiertos por el entrenamiento.
- Limitaciones de idioma: solo entrenado en inglés y español; otros idiomas no están soportados.
- Requiere formato ChatML y tokens de parada específicos para evitar bucles o salidas malformadas; su uso directo sin configuración puede dar resultados incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5, se deben respetar los términos de la licencia original de Qwen (Apache 2.0, sin restricciones adicionales).
- Las métricas declaradas (95,8% accuracy, 92,1% IFEval, etc.) no han sido verificadas de forma independiente y provienen de pruebas internas del autor.
- El despliegue recomendado requiere la plataforma Docker de Zyrabit; el uso manual del GGUF exige configuración avanzada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-agent-closer
- Repositorio del archivo GGUF Q5_K_M: https://huggingface.co/Zyrabit-IA/zyra-agent-closer-Q5_K_M
- Organización Zyrabit en Hugging Face: https://huggingface.co/Zyrabit-IA
- GitHub de Zyrabit: https://github.com/Zyrabit-tech
- Sitio web oficial: https://www.zyrabit.co.uk/
- Repositorio de infraestructura Zyrabit SLM: https://github.com/Zyrabit-tech/zyrabit-SLM
- Imagen Docker en Docker Hub: https://hub.docker.com/r/zyrabitcore/zyrabit-slm
