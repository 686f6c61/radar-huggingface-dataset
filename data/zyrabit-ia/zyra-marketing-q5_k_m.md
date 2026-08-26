# Zyrabit-IA/zyra-marketing-Q5_K_M

## Resumen

Zyra Marketing es un modelo de lenguaje pequeño (SLM) especializado en tareas de marketing y agentes empresariales, desarrollado por Zyrabit Architecture Labs, parte de la iniciativa Sovereign AI de Zyrabit. Está basado en la arquitectura Qwen2.5-3B de Alibaba, cuantizado al formato Q5_K_M para reducir su huella de memoria y permitir su ejecución en entornos con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a despliegues soberanos, es decir, entornos aislados de red (air-gapped) donde los datos no salen del perímetro corporativo.

El modelo ha sido fine-tuning con un dataset propio de 8.000 pares de instrucciones y respuestas, denominado `zyra_agents_multitask_master.jsonl`, con trazabilidad completa desde el dataset hasta el release. Se ha validado en hardware Tenstorrent Blackhole NPU, logrando una latencia P95 de 142,5 ms y una conformidad JSON del 100%. Zyra Marketing está pensado para cubrir necesidades de generación de contenido, análisis de cuentas clave (ICP) y automatización de flujos de trabajo en sectores regulados como banca, sanidad o administración pública, donde la soberanía de datos es crítica.

El modelo cuenta con 3.085.938.688 parámetros totales, lo que lo sitúa en la categoría de SLM. Aunque no se especifica la longitud de contexto en la información disponible, al derivar de Qwen2.5-3B, que soporta 32.768 tokens, se puede asumir un contexto similar, aunque no está confirmado. Es compatible con herramientas de inferencia estándar como llama.cpp y ofrece una API REST compatible con OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-3B) |
| Parámetros totales | 3.085.938.688 (3,09B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32.768 tokens) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

Zyra Marketing es un modelo transformer de 3.000 millones de parámetros, derivado de Qwen2.5-3B, sobre el que se ha realizado un fine-tuning supervisado con un conjunto de datos de 8.000 pares de instrucción-respuesta. El dataset `zyra_agents_multitask_master.jsonl` está orientado a tareas de marketing y agentes empresariales, con un énfasis en la adherencia a instrucciones y la generación de respuestas estructuradas en formato JSON. El entrenamiento se ha realizado sobre hardware Tenstorrent Blackhole NPU (p150), alcanzando un throughput de 1.672,22 pasos por segundo, más de 6.900 veces superior al de CPU, según los datos publicados por el autor.

No se indica el uso de técnicas de RLHF o DPO; se trata de un fine-tuning supervisado clásico. El modelo ha sido cuantizado a Q5_K_M, un formato de cuantización mixta que equilibra calidad y tamaño, pensado para su despliegue en entornos con memoria limitada o en hardware de borde. La validación realizada por el autor incluye una tasa de fuga de PII del 0% y una conformidad del 100% con esquemas JSON, lo que lo hace adecuado para aplicaciones donde la privacidad y la integridad de los datos son críticas.

## Capacidades

- Generación de texto en inglés y español, con especialización en tareas de marketing y agentes comerciales.
- Seguimiento de instrucciones complejas, con un 88,5% en el benchmark IFEval (strict prompt).
- Generación de respuestas estructuradas en JSON, con una precisión del 100% en la validación de esquemas.
- Protección de datos personales (PII) con una tasa de fuga del 0%, lo que lo hace apto para entornos regulados.
- Operación en entornos aislados de red (air-gapped) sin necesidad de telemetría externa.
- Capacidad de integración en pipelines de agentes mediante API REST compatible con OpenAI.
- No se ha especificado soporte explícito para tool calling o function calling, aunque al derivar de Qwen2.5-3B podría heredar dicha capacidad, pero no está documentado.

## Casos de uso

- Generación de contenido de marketing: el modelo puede crear textos publicitarios, eslóganes, descripciones de productos o campañas en inglés y español, con un tono y estilo ajustable mediante instrucciones.
- Análisis de perfil de cliente ideal (ICP): permite analizar información de una empresa o segmento para definir su perfil de cliente ideal, ayudando a los equipos de ventas a enfocar sus estrategias.
- Automatización de respuestas a clientes: integrado en un chatbot o sistema de tickets, puede redactar respuestas personalizadas a consultas comerciales, manteniendo un tono profesional y coherente.
- Asistente de marketing por correo electrónico: genera líneas de asunto, cuerpos de correo y llamadas a la acción para campañas de email marketing, con validación de formato JSON para su integración en flujos de trabajo.
- Creación de informes de mercado: a partir de datos estructurados o preguntas, el modelo puede redactar resúmenes ejecutivos o análisis de tendencias, con salidas en formato JSON para alimentar dashboards.
- Agente de ventas para entornos soberanos: desplegado en infraestructura local o en la nube privada, el modelo actúa como agente de ventas que cualifica leads y proporciona argumentarios personalizados sin enviar datos fuera del perímetro.
- Generación de contenido para redes sociales: produce posts adaptados a plataformas como Twitter, LinkedIn o Instagram, en ambos idiomas, con un tono alineado con la marca.

## Benchmarks y rendimiento

Los resultados siguientes han sido declarados por el autor en la model card. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Domain Test Accuracy | 94.2% |
| IFEval (Instruction Following) | IFEval Strict Prompt | 88.5% |
| JSON Schema Validity | Structural Parsing Accuracy | 100.0% |
| PII Redaction Audit | Memory Leakage Rate | 0.0% |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

Además, en el hardware Tenstorrent Blackhole NPU se ha medido una latencia P95 de 142,5 ms y un throughput de fine-tuning de 1.672,22 pasos por segundo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 3,09B parámetros con cuantización Q5_K_M, el peso ocupa aproximadamente 1,95 GB. Con espacio para el contexto y la computación, se estima un consumo de VRAM entre 2,5 y 3,5 GB para inferencia con contexto corto (512-2048 tokens).
- **GPU recomendadas**: cabe en GPUs de consumo como NVIDIA RTX 4060 (8 GB), RTX 4070 (12 GB), RTX 3060 (12 GB), así como en GPUs de datacenter como A10 o A100 (no necesita más de 4 GB). También puede ejecutarse en hardware de borde como Apple M-series (con memoria unificada de 8 GB o más) o en NPU como Tenstorrent Blackhole p150.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con al menos 4 GB de VRAM es suficiente para la inferencia básica.
- **Opciones de despliegue**: llama.cpp (CLI), Ollama, vLLM, TGI (Text Generation Inference) y API REST compatible con OpenAI. El autor ofrece un CLI propio `./zyra`.
- **Latencia y throughput**: en Tenstorrent Blackhole NPU se ha medido una latencia P95 de 142,5 ms. En GPU, se puede esperar una generación de ~50-100 tokens/s dependiendo del hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Zyra Marketing (Q5_K_M) | 3,09B | no disponible | Apache 2.0 | GGUF | Especializado en marketing, soberano |
| Qwen2.5-3B (base) | 3,09B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo general, no especializado |
| Phi-2 (Microsoft) | 2,7B | 2.048 | MIT | safetensors | Modelo pequeño con buen razonamiento, pero contexto corto |
| Gemma-2-2B (Google) | 2,6B | 8.192 | Gemma License | safetensors | Modelo general, con licencia de uso comercial con restricciones |

No se dispone de benchmarks comparativos publicados con estos modelos, por lo que no se puede establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- **Alucinaciones**: al ser un modelo pequeño (3B) y entrenado con un dataset limitado de 8.000 pares, puede generar contenido plausible pero incorrecto, especialmente en dominios fuera de su entrenamiento.
- **Sesgos**: no se han publicado evaluaciones de sesgos. El modelo hereda los sesgos de Qwen2.5-3B y del dataset de fine-tuning, que puede estar sesgado hacia el dominio de marketing.
- **Idiomas**: solo se garantiza rendimiento en inglés y español; otros idiomas pueden producir respuestas de baja calidad.
- **Contexto**: no se ha confirmado la longitud de contexto real; si no se configura adecuadamente, puede degradar el rendimiento con entradas largas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor (Zyrabit) puede tener políticas adicionales no especificadas en la model card.
- **Producción**: se recomienda validar las salidas JSON y verificar la conformidad con esquemas, aunque el modelo declara 100% de conformidad, en entornos reales pueden aparecer fallos.
- **Dependencia del dataset**: el modelo está especializado en marketing; para otras tareas generales puede ser menos eficaz que el modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Zyrabit-IA/zyra-marketing-Q5_K_M)
- [Organización Zyrabit-IA en Hugging Face](https://huggingface.co/Zyrabit-IA)
- [Web corporativa de Zyrabit](https://www.zyrabit.com/)
- [Web de Zyrabit para el Reino Unido](https://www.zyrabit.co.uk/)
- [GitHub de Zyrabit](https://github.com/Zyrabit-tech)
- [Repositorio de Zyrabit SLM](https://github.com/nosoyprogramad0r/zyrabit-slm)
