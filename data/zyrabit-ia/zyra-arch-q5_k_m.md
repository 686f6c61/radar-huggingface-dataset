# Zyrabit-IA/zyra-arch-Q5_K_M

## Resumen

Zyra-Arch es un modelo de lenguaje pequeño (SLM) de 3 085 millones de parámetros, desarrollado por Zyrabit Architecture Labs, que se presenta como un motor de inteligencia artificial soberana para entornos empresariales. Se basa en el modelo Qwen/Qwen2.5-3B y ha sido ajustado con un conjunto de datos de 64 pares de instrucciones específicamente orientados a arquitectura de sistemas, orquestación de contenedores Docker y aceleración por hardware Tenstorrent NPU. El modelo se distribuye en formato GGUF con cuantización Q5_K_M, lo que permite su ejecución en entornos con recursos limitados, incluyendo hardware CPU y NPU.

La relevancia de este modelo radica en su enfoque en soberanía de datos y despliegue en entornos aislados (air-gapped), con una capa de trazabilidad completa del dataset y verificación de integridad. Está diseñado para tareas de generación de texto, cumplimiento de instrucciones y salida estructurada en JSON, con un énfasis en la prevención de fugas de información personal. El modelo es bilingüe (inglés y español) y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-3B) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (heredado de Qwen2.5-3B, no especificado) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | en, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-3B, un transformer decoder-only con 3 085 millones de parámetros. No se detalla la configuración exacta (número de capas, atención, etc.) en la información proporcionada. El entrenamiento consistió en un ajuste fino (fine-tuning) sobre un dataset de 64 pares de instrucciones denominado `train_data_arch_v1.jsonl`, con una trazabilidad completa mediante hash SHA-256 y etiqueta de linaje `ds-v1.0.0-64pairs`. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

El proceso de fine-tuning se realizó sobre hardware Tenstorrent Blackhole NPU (p150), alcanzando un throughput de 1 672,22 pasos/segundo, más de 6 900 veces superior a una ejecución en CPU. El modelo se publica como una cuantización Q5_K_M en formato GGUF, optimizada para inferencia local y despliegue en entornos con recursos limitados.

## Capacidades

- Generación de texto y conversación: es un modelo de propósito general basado en Qwen2.5-3B, capaz de generar texto coherente en inglés y español.
- Cumplimiento de instrucciones: según los benchmarks, alcanza un 88,5 % en IFEval (strict prompt), indicando buena adherencia a instrucciones complejas.
- Generación de arquitectura de sistemas: especializado en describir topologías de cloud soberano, orquestación de contenedores y configuración de hardware.
- Validación de JSON: el modelo reporta un 100 % de conformidad con esquemas JSON, lo que lo hace apto para tareas de salida estructurada.
- Prevención de fugas de PII: la auditoría interna reporta una tasa de fuga de datos personales de 0,0 %, aunque este dato no ha sido verificado externamente.
- Soporte de tool calling: no se menciona explícitamente en la documentación, pero al ser una variante de Qwen2.5, puede heredar capacidades de function calling del modelo base.

## Casos de uso

- **Arquitectura de sistemas soberana**: el modelo puede generar y validar configuraciones de cloud privado, topologías de red y despliegues en entornos aislados (air-gapped). Su entrenamiento específico lo hace adecuado para diseñar infraestructuras sin dependencias externas.
- **Orquestación de contenedores Docker**: es capaz de generar comandos, docker-compose y manifiestos de Kubernetes, así como explicar la lógica detrás de ellos. Su tamaño reducido permite ejecutarlo en nodos de orquestación con recursos limitados.
- **Asistente de documentación técnica**: puede redactar documentación de arquitectura, guías de despliegue y manuales de operación en inglés y español, con un formato estructurado y válido en JSON.
- **Análisis de documentos privados**: al ejecutarse en local y sin salida de datos, es adecuado para procesar documentos internos de una empresa, extraer información y generar resúmenes sin riesgo de fuga.
- **Agente ReAct para automatización**: el modelo puede integrarse en un pipeline de agente autónomo para tareas de diagnóstico de sistemas, generación de comandos y ejecución de tareas de mantenimiento, gracias a su capacidad de seguir instrucciones y generar JSON.
- **Chat interno de soporte técnico**: con su contexto bilingüe y su capacidad de seguir instrucciones, puede alimentar un chatbot de soporte para resolver dudas sobre infraestructura de TI, con la ventaja de no depender de servicios en la nube.

## Benchmarks y rendimiento

El autor declara los siguientes resultados empíricos en la model card (no verificados externamente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Evaluation Suite | Agent Test Accuracy | 94,2 % |
| IFEval | Instruction Following (strict) | 88,5 % |
| JSON Schema Validity | Structural Parsing Accuracy | 100,0 % |
| PII Redaction Audit | Memory Leakage Rate | 0,0 % |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

Además, se reportan métricas de hardware en Tenstorrent NPU:

- Throughput de fine-tuning: 1 672,22 pasos/segundo
- Latencia en memoria (P95): 142,5 ms

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El modelo es un SLM de 3 085 millones de parámetros, cuantizado a Q5_K_M, lo que reduce el tamaño a aproximadamente 2,2 GB en disco (tamaño del repo).
- **VRAM estimada**: para inferencia, se necesita al menos 3-4 GB de VRAM para cargar los pesos en GPU, considerando overhead. Es compatible con GPUs de gama media como RTX 3060, RTX 4060, etc.
- **GPU recomendadas**: no hay especificación oficial, pero por tamaño, cualquier GPU con 4 GB o más puede ejecutar el modelo. La documentación menciona el uso de Tenstorrent NPU (p150) como acelerador principal.
- **Opciones de despliegue**: se puede ejecutar con `llama.cpp` (comando `llama-cli`), con el CLI propio `./zyra`, o mediante una API REST compatible con OpenAI (endpoint `/v1/chat/completions`).
- **Latencia y throughput**: el autor reporta una latencia P95 de 142,5 ms en la NPU Tenstorrent, aunque no se ofrecen datos para CPU o GPU. En una GPU moderna, se espera una velocidad de decodificación de decenas de tokens por segundo, pero no se ha publicado una cifra oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zyra-arch (Q5_K_M) | 3 085 M | no disponible | Apache 2.0 | GGUF en HF |
| Qwen2.5-3B (base) | 3 085 M | 32 768 (oficial) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | 3 210 M | 128 000 | Llama 3.2 Community | safetensors, GGUF |

Zyra-arch es un ajuste fino de Qwen2.5-3B, por lo que hereda su arquitectura y capacidades generales. Su ventaja es la especialización en arquitectura de sistemas y la cuantización GGUF optimizada para despliegue local. En comparación con Llama-3.2-3B, no se dispone de datos de rendimiento estándar para comparar, pero el contexto de Llama es mayor. La licencia Apache 2.0 de Zyra-arch es más permisiva que la de Llama-3.2 (que tiene restricciones comerciales para empresas con más de 700 M de usuarios mensuales).

## Limitaciones y advertencias

- **Dataset de entrenamiento muy reducido**: solo 64 pares de instrucciones, lo que limita la generalización y puede provocar un sobreajuste a los ejemplos de arquitectura de sistemas. El modelo no ha sido entrenado en un corpus amplio de lenguaje general.
- **Riesgo de alucinación**: al ser un fine-tune con un dataset tan pequeño, es probable que genere respuestas incorrectas o inventadas en dominios fuera de su especialidad. No se han realizado evaluaciones de seguridad.
- **Benchmarks no verificados**: los resultados de 94,2 % y 88,5 % son declarados por el autor sin verificación externa. Deben tomarse con precaución.
- **Contexto limitado**: no se especifica la longitud de contexto, pero al heredar de Qwen2.5-3B, probablemente soporta 32K tokens. Sin embargo, no se ha validado en este modelo.
- **Idiomas**: solo se declara soporte para inglés y español, aunque el modelo base Qwen2.5 soporta más idiomas, no se garantiza el rendimiento en otros.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero la falta de datos de calidad y la limitación del dataset puede suponer un riesgo en entornos de producción.
- **Dependencia de hardware específico**: la documentación destaca la aceleración con Tenstorrent NPU, pero no se garantiza el rendimiento en otras plataformas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Zyrabit-IA/zyra-arch-Q5_K_M)
- [Organización Zyrabit-IA en Hugging Face](https://huggingface.co/Zyrabit-IA)
- [Repositorio GitHub Zyrabit-SLM](https://github.com/Zyrabit-tech/zyrabit-SLM)
- [Documentación oficial Zyrabit](https://docs.zyrabit.com/docs/intro/)
- [Introducción a Zyrabit SLM](https://docs.zyrabit.com/docs/)
