# theftyyy/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión de disponibilidad general del modelo DeepSeek-V4-Pro, desarrollado por DeepSeek-AI. Sustituye a la versión preliminar (Preview) e incorpora un módulo de decodificación especulativa DSpark, lo que mejora sustancialmente las capacidades agénticas y el rendimiento en entornos de producción. El modelo está diseñado para tareas de generación de texto, razonamiento, codificación y flujos de trabajo agénticos con uso de herramientas.

Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 1,65 billones de parámetros totales, una ventana de contexto de 1 millón de tokens y licencia MIT, lo que permite uso comercial sin restricciones. Según los benchmarks publicados, supera a la versión preliminar en todas las pruebas y compite directamente con los modelos propietarios más potentes del mercado, como Opus-4.8 o Kimi K3, especialmente en tareas de agente y automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con módulo de decodificación especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (kv-cache-dtype fp8), 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en la estructura del modelo DeepSeek-V4-Pro (Preview), con la incorporación de un módulo de decodificación especulativa DSpark que acelera la generación de tokens. El modelo utiliza atención con caché KV en FP8 y un backend de MoE denominado `deep_gemm_mega_moe`, junto con un caché de indexador FP4 para optimizar la memoria. El parámetro `reasoning_effort` admite tres niveles (`low`, `high` y `max`) que controlan el tiempo de deliberación antes de responder, lo que sugiere un entrenamiento con refuerzo orientado a razonamiento extenso.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) en la información disponible. El modelo no incluye plantilla de chat en formato Jinja; en su lugar, se proporciona una carpeta `encoding` con scripts de Python para codificar mensajes en formato compatible con OpenAI.

## Capacidades

- Generación de texto y razonamiento complejo con niveles configurables de esfuerzo de razonamiento (`low`, `high`, `max`).
- Codificación y desarrollo de software completo, incluyendo tareas de repositorio completo (NL2Repo) y resolución de incidencias (DeepSWE).
- Capacidades agénticas avanzadas: uso de herramientas, automatización de tareas y razonamiento multi-paso.
- Ciberseguridad: rendimiento destacado en el benchmark Cybergym.
- Desarrollo full-stack: capacidad para abordar tareas de desarrollo integrales (DSBench-FullStack).
- Soporte de decodificación especulativa DSpark para acelerar la inferencia.
- Compatible con formatos de mensajes OpenAI y con frameworks de inferencia como vLLM y SGLang.

## Casos de uso

- Automatización de tareas de terminal: el modelo obtiene 87,9 en Terminal Bench 2.1, lo que lo hace adecuado para ejecutar comandos, gestionar sistemas y automatizar flujos de trabajo de operaciones de TI.
- Desarrollo de software completo: con 61,5 en NL2Repo, puede generar repositorios completos a partir de descripciones en lenguaje natural, útil para prototipado rápido y generación de proyectos.
- Resolución de incidencias en código: su puntuación de 62,7 en DeepSWE lo capacita para analizar repositorios, identificar bugs y proponer parches de forma autónoma.
- Agentes de ciberseguridad: con 83,3 en Cybergym, puede participar en ejercicios de ataque y defensa simulados, auditorías de seguridad y análisis de vulnerabilidades.
- Asistente de programación en producción: su soporte de tool calling y su ventana de 1M tokens permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests y documentación automática.
- Automatización de procesos de negocio: con 31,8 en AutomationBench, puede ejecutar tareas administrativas complejas como gestión de correos, generación de informes y manejo de hojas de cálculo.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas: los benchmarks de tareas de agente se evaluaron con DeepSeek Harness en modo mínimo, con nivel de razonamiento `max`, temperatura 1,0 y top_p 0,95. DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio es de 1781,8 GB en FP8, lo que sugiere que se necesitan múltiples GPUs de alta gama.
- GPU recomendadas: el ejemplo de despliegue oficial utiliza un nodo con 4×GB300 (NVIDIA GB300), lo que indica que se requieren GPUs de centro de datos de última generación.
- No cabe en GPUs de consumo: el modelo es demasiado grande para RTX 4090 o similar.
- Opciones de despliegue: vLLM (con soporte para DSpark mediante `--speculative-config`), SGLang (con `--speculative-algorithm DSPARK`), y NVIDIA NIM.
- Latencia y throughput: no disponible, aunque la decodificación especulativa DSpark está diseñada para mejorar el throughput en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Punto fuerte principal |
|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 billones (MoE) | 1M | MIT | Agentes y automatización, código |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | MIT | Versión más ligera y rápida |
| GLM-5.2 | no disponible | no disponible | no disponible | Competidor open-source en tareas de agente |
| Kimi K3 | no disponible | no disponible | no disponible | Competidor propietario, fuerte en DeepSWE y Terminal Bench |
| Opus-4.8 | no disponible | no disponible | propietario | Competidor propietario, fuerte en NL2Repo y DSBench-Hard |

DeepSeek-V4-Pro-0813 supera a su predecesor (Preview) en todos los benchmarks publicados y compite directamente con modelos propietarios de primer nivel. Frente a Opus-4.8, gana en Terminal Bench 2.1, Cybergym, DeepSWE y AutomationBench, pero pierde en HLE, NL2Repo y DSBench-Hard. Frente a Kimi K3, gana en Cybergym y AutomationBench, pero pierde en Terminal Bench, DeepSWE y Toolathlon.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos conocidos ni evaluación de seguridad.
- Riesgo de alucinación: no se han publicado tasas de alucinación específicas; como modelo de razonamiento extenso, puede generar respuestas confiadas pero incorrectas en dominios especializados.
- El modelo no incluye plantilla de chat Jinja; se requiere usar los scripts de la carpeta `encoding` para codificar mensajes, lo que añade complejidad a la integración.
- Los requisitos de hardware son muy elevados: se necesitan nodos con GPUs de centro de datos (GB300 o similar), lo que limita su uso a organizaciones con infraestructura de alto rendimiento.
- Aunque la licencia MIT permite uso comercial sin restricciones, el despliegue en producción requiere conocimientos avanzados de vLLM o SGLang y configuración específica para DSpark.
- No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación, lo que dificulta evaluar riesgos de sesgo o comportamiento indebido.

## Enlaces

- Modelo en HuggingFace (autor original): https://huggingface.co/theftyyy/DeepSeek-V4-Pro-0813
- Modelo en HuggingFace (DeepSeek-AI): https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Ficha en AI Release Tracker: https://aireleasetracker.com/model/deepseek/deepseek-v4-pro-0813
- Model card en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-pro-0813/modelcard
- Ficha en NanoGPT: https://nano-gpt.com/models/text/deepseek/deepseek-v4-pro-0813
