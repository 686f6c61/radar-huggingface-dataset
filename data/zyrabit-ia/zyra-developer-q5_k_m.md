# Zyrabit-IA/zyra-developer-Q5_K_M

## Resumen

Zyra Developer es un modelo de lenguaje pequeño (SLM) especializado, desarrollado por Zyrabit Architecture Labs (publicado bajo el nombre de usuario Zyrabit-IA). Está diseñado para entornos empresariales que exigen soberanía de datos, como banca, administración pública o sanidad, donde no se permite que la información salga del perímetro de la organización. El modelo parte de la arquitectura Qwen2.5-3B y se ha ajustado con un conjunto de datos propio de 8000 pares de instrucciones, orientado a pipelines de agentes autónomos y tareas estructuradas.

La versión publicada es una cuantización Q5_K_M en formato GGUF, pensada para ejecutarse en hardware local, desde CPU hasta aceleradores como la NPU Tenstorrent Blackhole. El modelo declara una precisión del 94,2% en pruebas de dominio y un cumplimiento del 88,5% en IFEval, además de una tasa de fuga de PII del 0% y validación JSON del 100%. Su relevancia actual radica en cubrir la demanda de modelos pequeños, eficientes y auditables para despliegues aislados de red (air-gapped).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2.5-3B (fine-tuning) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32k tokens, pero no se confirma en la documentación del modelo) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B, un transformer denso de 3 mil millones de parámetros. Sobre esta base se ha realizado un fine-tuning supervisado con un dataset propio llamado `zyra_agents_multitask_master.jsonl`, que contiene 8.000 pares de instrucción-respuesta previamente saneados. La documentación no especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica se centra en el despliegue soberano: el modelo se distribuye en formato GGUF cuantizado Q5_K_M, lo que permite su ejecución en CPU, GPU o NPU de bajo consumo, sin necesidad de conexión a servicios externos. Se declara una verificación de aislamiento de red que confirma cero bytes de tráfico saliente durante la inferencia.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés y español.
- Cumplimiento de instrucciones estructuradas: el modelo alcanza un 88,5% en IFEval (strict prompt).
- Generación de JSON válido: el 100% de las respuestas evaluadas cumplen con el esquema JSON requerido.
- Reducción de fuga de PII: la auditoría interna reporta una tasa de fuga del 0,0% en las pruebas realizadas.
- Diseñado para pipelines de agentes: el modelo se integra con CLI (`./zyra`), llama.cpp y una API REST compatible con el formato `/v1/chat/completions`.
- Capacidad de ejecución en entornos aislados de red (air-gapped), sin telemetría ni llamadas externas.
- No se documenta soporte explícito para tool calling o function calling, aunque el diseño orientado a agentes sugiere que podría usarse en tareas de razonamiento multi-paso.

## Casos de uso

- **Asistente de atención al cliente en entornos regulados**: el modelo puede gestionar conversaciones multi-turno en inglés o español sin enviar datos a la nube. Su tamaño reducido permite desplegarlo en servidores locales de una sucursal bancaria o un centro de salud, cumpliendo normativas de protección de datos.
- **Extracción de información de documentos internos**: mediante integración con un stack de RAG (como el propuesto en el repositorio Zyrabit SLM), el modelo puede resumir contratos, informes médicos o expedientes sin exponerlos a servicios externos.
- **Generación de informes estructurados**: su alta tasa de cumplimiento de esquemas JSON (100% en pruebas) lo hace adecuado para producir respuestas en formato JSON que alimenten sistemas de automatización, como generación de tickets, facturas o respuestas de API.
- **Redacción de respuestas estándar para agentes de negocio**: por ejemplo, clasificar y responder consultas sobre ICP (ideal customer profile) o preguntas frecuentes, usando la CLI o la API REST.
- **Validación de contenido con privacidad**: al tener una tasa de fuga de PII del 0% en las pruebas, puede utilizarse para enmascarar o revisar datos personales en texto antes de almacenarlos o transmitirlos.
- **Despliegue en hardware de bajo consumo**: al ser un SLM de 3B cuantizado, se puede ejecutar en un mini-PC o en una NPU Tenstorrent Blackhole, lo que permite implementar asistentes de IA en oficinas remotas o sedes con restricciones de conectividad.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor en la model card y no han sido verificados de forma independiente.

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Evaluation Suite | Agent Test Accuracy | 94.2% |
| IFEval | Instruction Following (strict prompt) | 88.5% |
| JSON Schema Validity | Structural Parsing Accuracy | 100.0% |
| PII Redaction Audit | Memory Leakage Rate | 0.0% |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

Además, se reporta una latencia P95 de 142.5 ms en inferencia con la NPU Tenstorrent Blackhole p150, y un throughput de fine-tuning de 1672.22 pasos/segundo en esa misma plataforma. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 3B en cuantización Q5_K_M, el tamaño del archivo GGUF suele rondar los 2.3 GB. Se recomienda al menos 4 GB de VRAM para ejecutarlo cómodamente en una GPU.
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, o en aceleradores específicos como la NPU Tenstorrent Blackhole (p150).
- **CPU**: gracias al formato GGUF, funciona en CPU pura mediante llama.cpp, aunque con menor velocidad.
- **Opciones de despliegue**: llama.cpp (CLI), servidor REST compatible con OpenAI (como llama-server), Ollama, vLLM (si se convierte a safetensors) o el CLI propietario `./zyra`.
- **Latencia**: se reporta una P95 de 142.5 ms en la NPU Tenstorrent Blackhole; en CPU la latencia dependerá del hardware y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Enfoque |
|---|---|---|---|---|---|
| Zyra Developer (este modelo) | 3B | no disponible | Apache-2.0 | Q5_K_M (GGUF) | SLM para agentes soberanos |
| Qwen2.5-3B (base) | 3B | 32k | Apache-2.0 | varios (safetensors, GGUF) | Modelo generalista de chat |
| Llama-3.2-3B | 3B | 128k | Llama 3.2 Community | varios | Modelo generalista de chat |

No se dispone de resultados comparativos de benchmarks entre estos modelos en la información disponible. La principal diferencia de Zyra Developer es su enfoque en la soberanía de datos y su distribución en formato GGUF listo para entornos aislados.

## Limitaciones y advertencias

- **Datos de entrenamiento limitados**: el fine-tuning se realizó con solo 8.000 pares de instrucciones, lo que puede limitar la generalización a dominios no cubiertos en ese conjunto.
- **Riesgo de alucinación**: al ser un modelo pequeño (3B), puede generar respuestas plausibles pero incorrectas en tareas de razonamiento complejo o conocimiento factual.
- **Contexto no confirmado**: aunque el modelo base Qwen2.5-3B soporta 32k tokens, la documentación no especifica la longitud de contexto efectiva tras el fine-tuning, por lo que se recomienda no asumir que soporta ventanas de 32k.
- **Idiomas**: solo se declaran inglés y español; no se garantiza un buen rendimiento en otros idiomas.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero no hay garantías explícitas sobre el comportamiento del modelo en entornos de producción.
- **Rendimiento no verificado**: los benchmarks declarados son del autor y no han sido auditados de forma independiente.
- **Sin soporte de tool calling documentado**: aunque está orientado a agentes, no se especifica si implementa function calling o herramientas externas.

## Enlaces

- [HuggingFace - Zyrabit-IA/zyra-developer-Q5_K_M](https://huggingface.co/Zyrabit-IA/zyra-developer-Q5_K_M)
- [Zyrabit - Sovereign AI Infrastructure](https://www.zyrabit.co.uk/)
- [Zyrabit - GitHub](https://github.com/Zyrabit-tech)
- [Repositorio Zyrabit SLM (comunidad)](https://github.com/nosoyprogramad0r/zyrabit-slm)
- [Zyrabit | Sovereign AI Infrastructure para equipos regulados](https://www.zyrabit.com/)
- [Docker Hub - zyrabitcore/zyrabit-slm](https://hub.docker.com/r/zyrabitcore/zyrabit-slm)
