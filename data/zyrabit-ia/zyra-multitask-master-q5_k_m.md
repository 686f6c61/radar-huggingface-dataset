# Zyrabit-IA/zyra-multitask-master-Q5_K_M

## Resumen

Zyra Multitask Master es un modelo de lenguaje pequeño (SLM) de 3 085 938 688 parámetros, desarrollado por Zyrabit Architecture Labs, que parte del modelo base Qwen/Qwen2.5-3B y se distribuye en formato GGUF cuantizado a Q5_K_M. El modelo se presenta como un "maestro multitarea unificado" entrenado sobre cuatro pipelines de agente (Hunter, Sentinel, Closer y Strategist) en hardware Tenstorrent Blackhole NPU, dentro de una infraestructura de IA soberana diseñada para ejecución local y aislada de la red.

La relevancia de este modelo radica en su enfoque de soberanía de datos: está pensado para organizaciones que necesitan capacidades de generación de texto, seguimiento de instrucciones y cumplimiento de esquemas JSON sin enviar datos a servicios externos. El entrenamiento se realizó con 8 000 pares de datos etiquetados, y el autor declara una precisión del 94,2 % en su suite de evaluación de dominio y un 88,5 % en IFEval, junto con un cumplimiento del 100 % de esquemas JSON y una fuga de PII del 0 %. No obstante, estos resultados no están verificados por terceros.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño reducido lo hace apto para entornos con recursos limitados, incluida la inferencia en CPU o GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-3B) |
| Parámetros totales | 3 085 938 688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B soporta 32 768 tokens, pero no se confirma en este fine-tuning) |
| Tipos de cuantización | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B, con atención causal estándar y configuración de capas y cabezas de atención propias de esa familia de modelos. No es una arquitectura MoE ni híbrida; se trata de un modelo denso de 3 000 millones de parámetros.

El proceso de entrenamiento consistió en un fine-tuning sobre un conjunto de datos propio llamado `zyra_agents_multitask_master.jsonl`, compuesto por 8 000 pares de instrucción-respuesta sanitizados. El autor declara que el ajuste se realizó sobre hardware Tenstorrent Blackhole NPU (modelo p150), con un throughput de 1 140,75 pasos por segundo y una latencia de inferencia P95 de 142,5 ms en ese mismo hardware. No se menciona el uso de RLHF ni DPO, ni la cantidad de tokens de entrenamiento. La trazabilidad del dataset se asegura mediante un checksum SHA-256 y una etiqueta de linaje `ds-v1.0.0-8000pairs`.

## Capacidades

- Generación de texto en inglés y español con seguimiento de instrucciones declarado en un 88,5 % (IFEval strict prompt).
- Cumplimiento de esquemas JSON: el autor declara un 100 % de validez estructural en las respuestas, lo que lo hace útil para integraciones con APIs y pipelines estructurados.
- Redacción de datos personales (PII): el modelo reporta una tasa de fuga de PII del 0 % en la auditoría interna, lo que indica un tratamiento adecuado de información sensible.
- Soporte para tareas multitarea de agente: el ajuste se realizó sobre cuatro pipelines (Hunter, Sentinel, Closer, Strategist) que cubren diferentes tipos de interacción conversacional y de ejecución.
- Integración con el ecosistema Zyrabit SLM: funciona junto a un motor de recuperación aumentada (RAG) y una capa de red Zero-Trust, lo que permite construir asistentes locales con acceso a documentos propios.
- Compatible con llama.cpp y con servidores compatibles con la API de OpenAI (Chat Completions), lo que facilita su despliegue en entornos de producción.

## Casos de uso

- Asistente local de documentación privada: el modelo se combina con el motor RAG de Zyrabit para responder preguntas sobre documentos corporativos sin que los datos salgan de la infraestructura. Su cumplimiento del 100 % de esquemas JSON permite estructurar las respuestas para su consumo directo por otras aplicaciones.
- Redacción de información personal en logs y textos: gracias a la tasa de fuga de PII del 0 % declarada, puede emplearse como capa de limpieza de datos antes de almacenar o compartir información, por ejemplo, en pipelines de análisis de logs de soporte.
- Generación de respuestas estructuradas para APIs: en un entorno de integración, el modelo puede generar objetos JSON válidos a partir de instrucciones en lenguaje natural, lo que es útil para automatizar la construcción de payloads de peticiones.
- Atención al cliente bilingüe (inglés/español): con una ventana de contexto de hasta 32 000 tokens (si se hereda de la base), puede gestionar conversaciones multi-turno y mantener el contexto de la interacción sin necesidad de un servicio externo.
- Ejecución de tareas de agente en entornos aislados: gracias a su diseño para infraestructura soberana y sin conexión a Internet, puede desplegarse en entornos clasificados o con requisitos de cumplimiento estrictos, como el sector público o financiero.
- Prototipado rápido de asistentes de IA en hardware de consumo: por su tamaño de 2,2 GB en GGUF, puede ejecutarse en una laptop con 8 GB de RAM o en una GPU de gama media, lo que lo hace adecuado para desarrollo y pruebas locales.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, sin verificación externa:

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Domain Test Accuracy | 94,2 % |
| IFEval | Strict Prompt Accuracy | 88,5 % |
| JSON Schema Validity | Structural Parsing Accuracy | 100 % |
| PII Redaction Audit | Memory Leakage Rate | 0 % |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los valores anteriores provienen de la suite de evaluación interna de Zyrabit y no han sido replicados por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q5_K_M ocupa aproximadamente 2,2 GB, por lo que con una GPU de 4-6 GB de VRAM es suficiente para ejecutar el modelo con contexto reducido.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores para margen de contexto largo; también es viable en GPUs integradas con memoria compartida (por ejemplo, Apple Silicon con 16 GB unificados).
- CPU: funciona en CPU con llama.cpp, aunque la latencia será mayor; para un uso interactivo se recomienda al menos 8 GB de RAM disponible.
- Hardware objetivo del autor: Tenstorrent Blackhole NPU p150, con latencia P95 de 194 ms y throughput de 1 140,75 pasos/segundo durante el entrenamiento.
- Opciones de despliegue: llama.cpp (interfaz CLI y servidor), Ollama, vLLM (si se convierte a safetensors), TGI, y la API REST compatible con OpenAI del ecosistema Zyrabit.
- Latencia estimada: no hay datos públicos de latencia en GPUs comunes; en el hardware Tenstorrent se reporta una P95 de 194 ms para inferencia en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zyra Multitask Master (este modelo) | 3,09 B | No disponible (base 32k) | Apache 2.0 | GGUF Q5_K_M | Fine-tuning sobre Qwen2.5-3B, enfocado en agentes y JSON |
| Qwen2.5-3B (base) | 3,09 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Modelo original sin fine-tuning específico |
| Llama-3.2-3B | 3,21 B | 128 000 tokens | Llama 3.2 Community License | GGUF, safetensors | Contexto muy largo, pero con restricciones de uso comercial para >700 M de usuarios mensuales |
| Phi-3-mini | 3,8 B | 4 096 tokens | MIT | GGUF, safetensors | Enfoque en razonamiento y código, contexto corto |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Los resultados de benchmarks (94,2 % de precisión, 88,5 % IFEval) son declaraciones del autor y no han sido verificados por terceros; deben tratarse con cautela.
- El dataset de entrenamiento es reducido (8 000 pares), lo que puede limitar la generalización del modelo en dominios fuera de los cubiertos por esas instrucciones.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no se puede comparar su rendimiento con otros modelos de forma objetiva.
- La longitud de contexto efectiva no está documentada; aunque la base Qwen2.5-3B soporta 32 768 tokens, el fine-tuning podría haber reducido el contexto útil.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; la baja cantidad de datos de entrenamiento puede aumentar la probabilidad de respuestas inventadas en dominios poco representados.
- El modelo se distribuye solo en formato GGUF Q5_K_M; no hay versiones en safetensors ni cuantizaciones alternativas disponibles en este repositorio.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está diseñado para el ecosistema Zyrabit y su integración con RAG y capa Zero-Trust puede requerir componentes adicionales de esa plataforma.
- El nombre del autor y la organización (Zyrabit Architecture Labs) y la fecha de publicación (2026-08-26) sugieren que el proyecto es reciente y puede carecer de madurez de producción o soporte comunitario amplio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-multitask-master-Q5_K_M
- Documentación oficial de Zyrabit: https://docs.zyrabit.com/docs/intro/
- Web corporativa: https://www.zyrabit.co.uk/
- Repositorio GitHub (Zyrabit-tech): https://github.com/Zyrabit-tech/zyrabit-SLM
- Repositorio GitHub (nosoyprogramad0r): https://github.com/nosoyprogramad0r/zyrabit-slm
- Imagen Docker: https://hub.docker.com/r/zyrabitcore/zyrabit-slm
