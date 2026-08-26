# Zyrabit-IA/zyra-agent-sentinel-Q5_K_M

## Resumen

Zyra Agent Sentinel es un modelo de lenguaje pequeño (SLM) de 3.085 millones de parámetros, especializado en auditoría de seguridad y cumplimiento normativo para entornos regulados. Desarrollado por Zyrabit Architecture Labs, se distribuye como una cuantización Q5_K_M en formato GGUF, basada en el modelo Qwen/Qwen2.5-3B, y está pensado para ejecutarse en infraestructura local o perimetral sin conexión externa, garantizando la soberanía de los datos.

El modelo resuelve un problema concreto: permitir a bancos, organismos públicos y entidades sanitarias desplegar capacidades de IA generativa sin comprometer la privacidad de los datos sensibles. Su propuesta se centra en la validación de instrucciones, el cumplimiento de esquemas JSON y la prevención de fugas de información personal (PII), con un rendimiento declarado del 98 % de precisión en dominios específicos y un 92,1 % en adherencia a instrucciones (IFEval).

La relevancia actual radica en la creciente demanda de soluciones de IA que respeten la normativa de protección de datos (GDPR, HIPAA, etc.) y que puedan operar en entornos con aislamiento de red total. Zyra Agent Sentinel se presenta como una alternativa ligera y de bajo coste computacional frente a modelos de gran tamaño, manteniendo capacidades de razonamiento y cumplimiento en tareas de auditoría y control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Zyra Agent Sentinel es un fine-tune del modelo Qwen2.5-3B, un transformer denso con 3.085 millones de parámetros. El entrenamiento se realizó sobre un dataset propio denominado `zyra_agent_sentinel.jsonl`, compuesto por 2.000 pares de datos sanitizados, con una trazabilidad completa desde el dataset hasta la versión de lanzamiento (v1.0.0-sovereign). El proceso de fine-tuning se ejecutó sobre una NPU Tenstorrent Blackhole p150, alcanzando un throughput de 1.205,40 pasos por segundo, más de 6.900 veces superior al rendimiento en CPU.

No se han publicado detalles sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO. Sin embargo, la card del modelo indica que se ha puesto especial énfasis en la validación de esquemas JSON (100 % de cumplimiento estructural) y en la prevención de fugas de PII (0 % de fugas), lo que sugiere un entrenamiento dirigido a tareas de auditoría y cumplimiento.

## Capacidades

- Generación de texto especializada en análisis de seguridad y cumplimiento normativo (validación BANT, mitigación de riesgos, gobernanza de datos).
- Adherencia a instrucciones con alta precisión: 92,1 % en el benchmark IFEval (strict prompt).
- Generación de JSON válido en el 100 % de los casos, lo que facilita la integración en pipelines automatizados.
- Prevención de fugas de PII: tasa de fuga del 0 % en las pruebas de auditoría.
- Operación en entornos aislados de red (air-gapped) sin telemetría ni comunicaciones externas.
- Soporte de ejecución local mediante llama.cpp, CLI propia de Zyrabit y API REST compatible con el formato de chat de OpenAI.
- Capacidades multilingües básicas en inglés y español, aunque el dominio principal es el inglés.

## Casos de uso

- Auditoría de transacciones financieras: el modelo puede analizar registros de transacciones y detectar posibles incumplimientos normativos o anomalías, generando informes en formato JSON para su integración en sistemas de gestión.
- Cumplimiento normativo en el sector bancario: permite revisar cláusulas contractuales, políticas internas o comunicaciones con clientes para verificar el cumplimiento de regulaciones como GDPR o la normativa local, sin que los datos salgan del perímetro de la entidad.
- Análisis de registros clínicos: en entornos hospitalarios, el modelo puede resumir y extraer información relevante de historiales médicos para apoyar la toma de decisiones clínicas, respetando la privacidad del paciente y las leyes de protección de datos.
- Generación de informes de auditoría internos: a partir de datos estructurados, el modelo puede redactar informes de cumplimiento, identificar riesgos y proponer acciones correctivas, con salida en formato JSON para su posterior procesamiento.
- Prevención de fugas de información: el modelo puede analizar documentos y comunicaciones para detectar la presencia de datos personales (PII) y sugerir su redacción o eliminación, manteniendo la confidencialidad de la información.
- Integración en flujos de trabajo de agentes autónomos: gracias a su capacidad de generar JSON válido y su adherencia a instrucciones, puede servir como componente de un agente de IA que realice tareas de auditoría de forma autónoma, ejecutando llamadas a herramientas y procesando respuestas estructuradas.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor del modelo en la model card y no han sido verificados de forma independiente.

| Benchmark | Métrica | Valor |
|---|---|---|
| Domain Test Accuracy | Precisión en dominio | 98,0 % |
| IFEval Strict Prompt | Adherencia a instrucciones | 92,1 % |
| JSON Schema Validity | Validez estructural de JSON | 100,0 % |
| PII Redaction Audit | Tasa de fugas de PII | 0,0 % |
| Air-Gap Network Verification | Paquetes de red salientes | 0 bytes |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene un tamaño de 2,2 GB en formato GGUF, por lo que es viable en hardware de consumo. Se estima que requiere al menos 3 GB de memoria para la inferencia en cuantización Q5_K_M, aunque no se ha especificado oficialmente la VRAM exacta.
- Está optimizado para la aceleradora Tenstorrent Blackhole p150, donde alcanza una latencia P95 de 122,5 ms.
- Es compatible con ejecución en CPU mediante llama.cpp, lo que permite su despliegue en servidores sin GPU dedicada.
- Opciones de despliegue: llama.cpp (CLI), Zyrabit Sovereign CLI (`./zyra`), y servidor REST compatible con la API de chat de OpenAI (puerto 8080).
- También puede integrarse en entornos de orquestación como vLLM o TGI, aunque no se menciona explícitamente en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de tamaño similar en el ámbito de auditoría de seguridad. La documentación del fabricante no incluye referencias a modelos competidores ni tablas comparativas de rendimiento. Por lo tanto, esta sección queda sin datos disponibles.

## Limitaciones y advertencias

- El modelo está especializado en el dominio de auditoría y cumplimiento, por lo que su rendimiento fuera de este ámbito puede ser limitado. No se recomienda su uso en tareas generales de generación de texto o razonamiento complejo.
- La longitud de contexto no se ha especificado, lo que limita la capacidad de procesar documentos extensos. Se recomienda validar el límite real antes de su uso en producción.
- Los benchmarks declarados no están verificados por terceros; deben interpretarse con cautela.
- El modelo está entrenado con un dataset pequeño (2.000 pares), lo que puede inducir sobreajuste en los dominios de entrenamiento y mayor riesgo de alucinación en consultas fuera de estos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora restricciones de uso en entornos con aislamiento de red; se recomienda revisar los términos de la licencia del modelo base Qwen2.5 para evitar conflictos.
- La documentación no menciona la capacidad de procesamiento de imágenes ni de audio; es un modelo exclusivamente de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zyrabit-IA/zyra-agent-sentinel-Q5_K_M
- Zyrabit GitHub: https://github.com/Zyrabit-tech
- Documentación de Zyrabit SLM: https://docs.zyrabit.com/docs/
- Página principal de Zyrabit: https://www.zyrabit.com/
- Zyrabit Sovereign AI Infrastructure: https://www.zyrabit.co.uk/
