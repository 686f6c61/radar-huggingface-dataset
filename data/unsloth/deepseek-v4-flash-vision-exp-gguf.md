# unsloth/DeepSeek-V4-Flash-Vision-Exp-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4, desarrollado por DeepSeek AI. Incorpora módulos de visión sobre la arquitectura de DeepSeek-V4-Flash y ha recibido entrenamiento continuado para desbloquear capacidades de comprensión visual. El repositorio de HuggingFace que nos ocupa es la versión cuantizada en GGUF publicada por Unsloth, que aplica su formato propietario "Unsloth Dynamic 2.0" para mejorar la precisión frente a otras cuantizaciones.

El modelo destaca por mejorar sustancialmente las capacidades de agente multimodal respecto a DeepSeek-V4-Flash-0731, manteniendo un rendimiento comparable en tareas de agente solo texto. Según los benchmarks publicados, se acerca a Opus-4.8 en varias tareas de agente multimodal, como ApexBench (36,5 frente a 39,4) o Chartography (64,3 frente a 65,0), a un coste de inferencia inferior. La licencia MIT permite uso comercial sin restricciones, y los GGUF de Unsloth habilitan DSpark para acelerar la decodificación hasta 2 veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder + aligner, DFlash attention, MoE, Hyper-Connections, DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE, cifra no publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); tamaños de referencia para la familia V4-Flash: 8-bit 162 GB, 3-bit 103 GB |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el repo base de DeepSeek) |

## Arquitectura y entrenamiento

La arquitectura combina un vision encoder con un aligner que proyecta las representaciones visuales al espacio del modelo de lenguaje, seguido de un transformer con atención DFlash, mezcla de expertos (MoE) y conexiones hiper (Hyper-Connections). El forward path emplea DSpark, un mecanismo de decodificación especulativa que en los GGUF de Unsloth permite hasta 2 veces más velocidad de decodificación. El modelo ha recibido entrenamiento continuado sobre DeepSeek-V4-Flash para incorporar comprensión visual, sin que se hayan publicado detalles sobre el volumen de tokens, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Comprensión multimodal: procesa imágenes junto con texto, con soporte para prompts en formato OpenAI-style JSON y notación compacta `<image>path</image>`.
- Agente multimodal: ejecuta tareas que requieren interpretar capturas de pantalla, diagramas o gráficos, como demuestran los resultados en ApexBench y Agents' Last Exam.
- Agente solo texto: mantiene capacidades de razonamiento y ejecución de tareas comparables a DeepSeek-V4-Flash-0731 en benchmarks como Terminal Bench 2.1, DeepSWE o NL2Repo.
- Tool calling y function calling: los benchmarks de agente (Toolathlon-Verified, DSBench-Hard) indican soporte para invocación de herramientas y razonamiento multi-paso.
- Razonamiento con esfuerzo configurable: el harness de evaluación usa el nivel de razonamiento `max` con temperatura 1,0 y top_p 0,95, lo que sugiere un modo de razonamiento extenso.
- Multilingüe: no se han publicado los idiomas soportados, aunque por la familia DeepSeek se espera cobertura amplia de inglés y chino.

## Casos de uso

- Automatización de tareas de interfaz gráfica: el modelo puede interpretar capturas de pantalla y ejecutar acciones en aplicaciones, útil para testing de UI o RPA. Su puntuación de 36,5 en ApexBench (Pass@1) indica capacidad para resolver tareas de agente visual con un solo intento.
- Asistencia en análisis de datos con gráficos: Chartography (64,3) muestra que puede leer y razonar sobre gráficos y visualizaciones, permitiendo generar informes o responder preguntas sobre datos representados visualmente.
- Agente de terminal y operaciones de desarrollo: con 83,9 en Terminal Bench 2.1, puede ejecutar comandos, navegar sistemas de archivos y completar tareas de administración de sistemas o despliegue.
- Generación de código a partir de repositorios: NL2Repo (57,7) indica capacidad para convertir descripciones en lenguaje natural en repositorios de código completos, útil en generación de proyectos o scaffolding.
- Ciberseguridad y análisis de vulnerabilidades: Cybergym (75,3) sugiere aptitud para tareas de seguridad ofensiva y defensiva en entornos simulados, como análisis de exploits o hardening.
- Atención al cliente con contexto visual: puede procesar capturas de pantalla de errores o imágenes de productos para resolver incidencias, combinando comprensión visual con diálogo multi-turno.
- Automatización de flujos de trabajo empresarial: AutomationBench (25,7) muestra capacidades básicas para tareas de automatización de procesos, aunque con margen de mejora frente a Opus-4.8 (27,2).

## Benchmarks y rendimiento

La model card publica resultados comparativos con DeepSeek-V4-Flash-0731 y Opus-4.8. Los benchmarks de agente texto se evaluaron con DeepSeek Harness en modo mínimo, nivel de razonamiento `max`, temperatura 1,0 y top_p 0,95. Para ApexBench y Agents' Last Exam, el modelo 0731 ignora los elementos multimodales de la entrada.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2† | 39,4 |
| Agents' Last Exam | 27,3 | 25,2† | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

† El modelo 0731 ignora los elementos multimodales en estos benchmarks.

## Requisitos de hardware

- Los GGUF de Unsloth para la familia DeepSeek-V4-Flash tienen tamaños de 162 GB en 8-bit y 103 GB en 3-bit, lo que requiere aproximadamente 110 GB de RAM para el 3-bit.
- No se han publicado requisitos específicos para la versión Vision-Exp, pero por el tamaño de los pesos se necesitan GPUs de alta gama o servidores con gran memoria.
- En consumer GPU, solo sería viable con cuantizaciones agresivas (3-bit o inferiores) en equipos con 128 GB de RAM unificada, como Mac Studio o workstations con múltiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Desktop y cualquier runtime compatible con GGUF. Para safetensors, vLLM o TGI con soporte para la arquitectura.
- DSpark está habilitado en los GGUF de Unsloth, permitiendo hasta 2x más velocidad de decodificación frente a la inferencia estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento agente multimodal |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | no disponible | no disponible | MIT | Multimodal experimental | ApexBench 36,5; Chartography 64,3 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | MIT | Texto, sin visión | ApexBench 26,2†; sin visión |
| Opus-4.8 | no disponible | no disponible | Propietaria | Multimodal comercial | ApexBench 39,4; Chartography 65,0 |

† Ignora elementos multimodales. Opus-4.8 es un modelo propietario de acceso cerrado, mientras que DeepSeek-V4-Flash-Vision-Exp es abierto con licencia MIT.

## Limitaciones y advertencias

- Modelo experimental: la propia designación "Exp" indica que es una versión de investigación, no un release estable para producción.
- Sin datos publicados sobre sesgos, alucinación o comportamiento en dominios específicos; se recomienda evaluación propia antes de desplegar.
- Rendimiento inferior a Opus-4.8 en varias tareas de agente, especialmente NL2Repo (57,7 frente a 69,7) y DSBench-Hard (63,6 frente a 71,7).
- Los tamaños de GGUF son grandes (103-162 GB), lo que limita el despliegue a hardware con mucha memoria.
- No se han publicado la longitud de contexto, los idiomas soportados ni el número de parámetros, lo que dificulta la planificación de recursos.
- La licencia MIT permite uso comercial sin restricciones, pero al ser un modelo experimental, DeepSeek podría no ofrecer soporte ni garantías.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-Vision-Exp-GGUF
- Modelo base de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Documentación de Unsloth sobre DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Catálogo de modelos de Unsloth: https://unsloth.ai/docs/get-started/unsloth-model-catalog
- Análisis del modelo en Miraflow: https://miraflow.ai/blog/deepseek-v4-flash-vision-exp-multimodal-explained-2026
