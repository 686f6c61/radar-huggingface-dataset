# Zidane29/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión final del modelo DeepSeek-V4-Pro de DeepSeek-AI, publicada el 13 de agosto de 2026. Sustituye a la versión preview anterior e incorpora un módulo de decodificación especulativa llamado DSpark, que mejora notablemente la latencia en entornos de producción sin sacrificar calidad. El modelo está orientado a tareas de razonamiento complejo, generación de código y uso agéntico con herramientas, y sus mejoras son especialmente visibles en benchmarks de agentes y desarrollo de software.

Arquitectónicamente es un modelo de mezcla de expertos (MoE) con una ventana de contexto de hasta un millón de tokens, diseñado para tareas de codificación y razonamiento de largo alcance. El repositorio que nos ocupa, `Zidane29/DeepSeek-V4-Pro-0813`, es un mirror no oficial del lanzamiento original de DeepSeek-AI, con los pesos en formato safetensors y un tamaño total de 892,8 GB. El modelo cuenta con licencia MIT, lo que permite uso comercial sin restricciones de atribución.

La relevancia actual del modelo reside en su posicionamiento competitivo frente a alternativas propietarias de primer nivel (como Opus-4.8 o Kimi K3) en tareas de agentes, y en que incorpora técnicas de despliegue eficiente (cuantización fp8, decodificación especulativa) pensadas para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificación especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (~1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | fp8 (8-bit) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) eficiente, según la documentación de NVIDIA NIM, diseñada para escalar a ventanas de contexto de un millón de tokens con un coste computacional contenido. La novedad principal de esta release es el módulo de decodificación especulativa DSpark, que acelera la generación de tokens mediante un modelo borrador que propone varios tokens por paso, validados posteriormente por el modelo principal. En vLLM se activa con un único flag (`--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`), lo que indica que el borrador es determinista (greedy) y propone 7 tokens especulativos por iteración.

El modelo soporta un parámetro `reasoning_effort` con tres niveles (`low`, `high` y `max`) que controlan el tiempo de deliberación antes de responder, similar a los modos de razonamiento de otros modelos de la familia. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento explícito (`thinking_mode`), controlable mediante el parámetro `reasoning_effort`.
- Razonamiento multi-paso y capacidades agénticas avanzadas, con resultados destacados en benchmarks de agentes como Terminal Bench 2.1 (87,9) y Toolathlon-Verified (74,1).
- Uso de herramientas (tool calling) y ejecución de tareas en entornos de terminal, con soporte para agentes de código que operan sobre repositorios completos (NL2Repo, DSBench).
- Generación de código y desarrollo full-stack, con rendimiento competitivo en tareas de ingeniería de software (DeepSWE 62,7, DSBench-FullStack 71,1).
- Ventana de contexto de 1M tokens, adecuada para razonar sobre repositorios grandes o documentos extensos.
- Compatible con frameworks de inferencia estándar (vLLM, SGLang) y con decodificación especulativa integrada para reducir latencia.
- Codificación de mensajes en formato compatible con OpenAI (se proporciona un paquete `encoding` con scripts Python para ello).

## Casos de uso

- Agentes de desarrollo de software autónomos: el modelo puede recibir un repositorio completo, razonar sobre él y ejecutar tareas de implementación, refactorización o corrección de errores. Su resultado de 62,7 en DeepSWE lo sitúa por encima de la mayoría de alternativas abiertas y cerca de modelos propietarios de primer nivel.
- Automatización de operaciones de terminal: con 87,9 en Terminal Bench 2.1, es adecuado para agentes que ejecutan comandos, gestionan entornos y resuelven tareas de administración de sistemas de forma autónoma.
- Asistentes de programación con contexto de repositorio completo: la ventana de 1M de tokens permite cargar proyectos enteros sin truncar, facilitando respuestas coherentes con la arquitectura global del código.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y su rendimiento en tareas de código permiten integrarlo en flujos de revisión, generación de tests y automatización de builds.
- Sistemas de razonamiento con herramientas (agentic tool-use): el modelo puede orquestar llamadas a APIs, bases de datos o servicios externos, con un 74,1 en Toolathlon-Verified que refleja solidez en este tipo de flujos.
- Investigación en agentes y evaluación de modelos: al ser de código abierto con licencia MIT, sirve como referencia para estudios comparativos sobre capacidades agénticas y razonamiento multi-paso.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados por DeepSeek-AI en la model card oficial, comparando con modelos propietarios y abiertos de referencia.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
|---|---|---|---|---|---|---|---|
| HLE (sin / con tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas: los benchmarks de agentes de código se evaluaron con DeepSeek Harness en modo mínimo, con nivel de razonamiento `max`, temperatura 1,0 y top_p 0,95. DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek. No se han publicado resultados de benchmarks clásicos de conocimiento general (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- El modelo tiene 1,65 billones de parámetros y los pesos en fp8 ocupan aproximadamente 1,65 TB en disco (892,8 GB comprimidos en el repositorio, que incluye también el tokenizador y los scripts de codificación).
- La guía oficial de despliegue de DeepSeek recomienda un nodo con 4 GPU NVIDIA GB300 para servir el modelo con vLLM, lo que implica hardware de clase data center. Con 4 GB300 (cada una con ~288 GB de HBM3e), la VRAM total (~1,15 TB) es insuficiente para los pesos completos en fp8, por lo que es probable que el despliegue requiera paralelismo de datos y de expertos (los flags `--data-parallel-size 4 --enable-expert-parallel` así lo confirman), además de una gestión cuidadosa de la memoria.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo con una o dos GPUs convencionales.
- Opciones de despliegue: vLLM (con soporte oficial para DSpark mediante `--speculative-config`), SGLang (con `--speculative-algorithm DSPARK`) y NVIDIA NIM. También es compatible con transformers estándar para carga del tokenizador.
- La decodificación especulativa DSpark reduce la latencia por token generado, aunque no se han publicado cifras concretas de throughput en la información disponible.
- Se recomienda usar caché KV en fp8 (`--kv-cache-dtype fp8`) para reducir el consumo de memoria durante la inferencia.

## Comparativa con modelos similares

El modelo compite directamente con los principales sistemas de razonamiento y agentes de 2026. La comparativa se basa en los resultados de benchmarks publicados por DeepSeek, ya que no se dispone de especificaciones técnicas (parámetros, contexto) de los modelos alternativos.

| Modelo | Desarrollador | Licencia | Contexto | Terminal Bench 2.1 | DeepSWE | Toolathlon-Verified |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | DeepSeek-AI | MIT | 1M | 87,9 | 62,7 | 74,1 |
| Kimi K3 | Moonshot AI | propietario | no disponible | 88,3 | 67,5 | 76,5 |
| Opus-4.8 | Anthropic | propietario | no disponible | 85,0 | 58,0 | 76,2 |
| GLM-5.2 | Zhipu AI | no disponible | no disponible | 81,0 | 46,2 | 59,9 |

DeepSeek-V4-Pro-0813 se sitúa en un rango muy cercano a los líderes propietarios en tareas agénticas, siendo superado únicamente por Kimi K3 en algunos benchmarks y por Fable-5 en la mayoría. Su ventaja diferencial es la licencia MIT, que permite uso comercial y modificación sin restricciones, algo que ningún competidor propietario ofrece.

## Limitaciones y advertencias

- El repositorio `Zidane29/DeepSeek-V4-Pro-0813` es un mirror de un usuario no verificado, no el lanzamiento oficial de DeepSeek-AI. Conviene verificar la integridad de los pesos antes de usarlo en producción.
- No se dispone de datos sobre los idiomas soportados ni sobre la calidad en lenguas distintas del inglés; la documentación oficial solo menciona ejemplos en inglés.
- El modelo requiere hardware de muy alta gama (múltiples GPU de clase data center) y no es ejecutable en entornos de consumo, lo que limita su uso a organizaciones con infraestructura adecuada o acceso a servicios cloud.
- Los benchmarks publicados son en su mayoría de tareas agénticas y de código; no hay datos públicos sobre rendimiento en tareas clásicas de conocimiento o matemáticas, lo que dificulta una evaluación completa.
- Los pesos completos en fp8 ocupan más de 1,6 TB, y el despliegue con vLLM requiere paralelismo de datos y de expertos, lo que añade complejidad operativa.
- La model card no incluye una plantilla de chat en formato Jinja; es necesario usar el paquete `encoding` proporcionado para codificar mensajes, lo que puede suponer una fricción adicional en la integración.
- No se han documentado sesgos conocidos ni riesgos de alucinación específicos de este modelo, pero al tratarse de un sistema de razonamiento con herramientas, existe riesgo de errores en la ejecución de acciones cuando el contexto es ambiguo.
- El papel técnico (arxiv:2606.19348) está referenciado pero no se ha podido verificar su contenido en la información disponible.

## Enlaces

- Repositorio en HuggingFace (mirror): https://huggingface.co/Zidane29/DeepSeek-V4-Pro-0813
- Repositorio oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-pro-0813/modelcard
- Seguimiento de lanzamientos y benchmarks: https://aireleasetracker.com/model/deepseek/deepseek-v4-pro-0813
- Informe tecnico (referenciado): https://arxiv.org/abs/2606.19348
