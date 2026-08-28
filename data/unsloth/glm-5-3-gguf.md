# unsloth/GLM-5.3-GGUF

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai, distribuido en formato GGUF cuantizado por Unsloth para su ejecución local. Se trata de un modelo de arquitectura mixta de expertos (MoE) con 744 mil millones de parámetros totales y 40 mil millones activos por token, con una ventana de contexto de 1 millón de tokens. Según la documentación de Unsloth, es el modelo de pesos abiertos más potente hasta agosto de 2026, logrando el estado del arte en Terminal Bench 3.0 y Agents' Last Exam.

El modelo comparte la misma base que GLM-5.2, y todas sus mejoras provienen del post-entrenamiento. Destaca especialmente en tareas de codificación compleja y agentes de larga duración, con una mejora del 50 % en el benchmark interno Z.ai Code Bench respecto a GLM-5.2. También muestra capacidades emergentes en ciberseguridad, superando a GLM-5.2 en más del doble en benchmarks de explotación de vulnerabilidades. La versión cuantizada de Unsloth permite ejecutarlo en hardware local mediante llama.cpp o Unsloth Desktop, con soporte para distintos niveles de razonamiento (low, high, max).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención DSA (Dynamic Sparse Attention) |
| Parametros totales | 744 B |
| Parametros activos | 40 B |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | Dynamic GGUF de Unsloth (incluye 1-bit UD-IQ1_M y otras, no se especifican todas) |
| Idiomas soportados | en, zh |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base zai-org/GLM-5.3) |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura MoE con 744 B parámetros totales y 40 B activos, utilizando atención DSA (Dynamic Sparse Attention) según las etiquetas del repositorio. El modelo base es idéntico al de GLM-5.2; todas las ganancias de rendimiento provienen del post-entrenamiento, que incluye ajuste fino supervisado y probablemente optimización por preferencias humanas, aunque no se detallan los métodos exactos en la información disponible.

El modelo incorpora un parámetro `reasoning_effort` que controla el presupuesto de razonamiento con tres niveles: `low`, `high` y `max`, siendo `max` el valor por defecto. En la plantilla de chat, el parámetro `clear_thinking` permite limpiar el contenido de razonamiento en escenarios conversacionales. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento controlable (`reasoning_effort`).
- Codificación de alto nivel: mejora del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, y SOTA de código abierto en Terminal Bench 3.0 y Agents' Last Exam.
- Agentes autónomos y razonamiento multi-paso: soporta tareas de larga duración (long-horizon) y uso de herramientas, con resultados destacados en Toolathlon Verified y AutomationBench.
- Ciberseguridad: capacidades emergentes en descubrimiento de vulnerabilidades y explotación, con SOTA en CyberGym y más del doble de rendimiento que GLM-5.2 en ExploitGym y ExploitBench.
- Multilingüe: soporte para inglés y chino.
- Tool calling / function calling: integrado, validado en benchmarks como Toolathlon.
- Ventana de contexto de 1 M tokens, adecuada para documentos extensos y agentes con historial largo.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en repositorios completos, gracias a su contexto de 1 M tokens y su rendimiento en benchmarks como DeepSWE y FrontierSWE. Es adecuado para integrarse en IDEs o pipelines de CI/CD.
- Agentes autónomos de automatización: con soporte para tool calling y razonamiento multi-paso, puede ejecutar tareas complejas en terminales, navegadores o APIs, como se refleja en Terminal Bench y AutomationBench.
- Auditoría de seguridad ofensiva: sus capacidades en CyberGym y ExploitBench lo hacen útil para análisis de vulnerabilidades, pruebas de penetración y generación de exploits en entornos controlados.
- Asistente de investigación y análisis de documentos: la ventana de 1 M tokens permite procesar papers, informes o bases de código completas en una sola pasada, con razonamiento profundo configurable.
- Generación de código en producción: con cuantizaciones GGUF y despliegue local, puede servir como copiloto de programación en entornos con requisitos de privacidad, usando llama.cpp o Unsloth Desktop.
- Automatización de tareas de mantenimiento de software: resolución de issues, generación de parches y refactorización de código, como demuestra su rendimiento en SWE-Marathon y ProgramBench.

## Benchmarks y rendimiento

La model card del autor proporciona la siguiente tabla comparativa. Los valores corresponden a la versión completa del modelo (no cuantizada).

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 | **88.8** |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | – | – | 21.1 | 33.7 | **34.6** |
| DeepSWE (v1.1) | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 | **72.7** |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | **69.7** | – | – |
| ProgramBench (Almost Solved) | 19.0 | 9.5 | 17.5 | – | 10.5 | 15.5 | **33.0** | 23.0 |
| FrontierSWE | 78.1 | 67.5 | – | – | – | 66.5 | **88.2** | – |
| SWE-Marathon (v1.1) | 42.5 | 19.4 | 48.1 | – | – | **48.8** | 33.1 | 42.5 |
| PostTrainBench | 39.8 | 31.7 | 32.0 | – | – | 32.9 | **41.8** | 36.2 |
| CyberGym | **84.5** | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 | 83.6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54.4 | 24.4 | 32.2 | – | 28.8 | 40.0 | **78.0** | 76.5 |
| Toolathlon Verified | 73.0 | 59.9 | **76.5** | 74.1 | 72.5 | 76.2 | 74.7 | 74.9 |
| AutomationBench (v1.0.6) | **48.2** | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 | 45.8 |
| Agents' Last Exam (ALE-CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 | **28.6** |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 | **64.5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Nota: para reproducir los benchmarks, se debe usar `reasoning_effort=max` (valor por defecto). En escenarios de chat, se recomienda pasar `clear_thinking=true`.

## Requisitos de hardware

- El repositorio GGUF de Unsloth ocupa 1997.7 GB en total, lo que incluye múltiples cuantizaciones dinámicas.
- Según la documentación de Unsloth, el modelo puede ejecutarse localmente con GGUF dinámicos mediante llama.cpp o Unsloth Desktop. No se especifican requisitos exactos de VRAM para cada cuantización en la información disponible.
- Para la cuantización de 1 bit (UD-IQ1_M), se estima que puede caber en sistemas con alrededor de 100 GB de RAM/VRAM, basándose en ejemplos mostrados por Unsloth con GLM-5.2.
- Para cuantizaciones de 3 bits, se necesitarían configuraciones de al menos 128 GB de RAM/VRAM, según patrones observados en modelos similares de la familia GLM-5.3.
- Opciones de despliegue: llama.cpp, Unsloth Desktop, y servidores compatibles con GGUF (Ollama, LM Studio, etc.).
- No se dispone de datos de latencia o throughput publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Punto fuerte principal |
|---|---|---|---|---|---|
| GLM-5.3 (Z.ai) | 744 B totales, 40 B activos | 1 M | other | Pesos abiertos | Codificacion, agentes, ciberseguridad |
| GLM-5.2 (Z.ai) | 744 B totales, 40 B activos | 1 M | other | Pesos abiertos | Base similar, menor rendimiento en agentes |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Competidor directo en benchmarks de agentes |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | Competidor en razonamiento y codificacion |

Los datos de DeepSeek-V4 Pro y Qwen3.8-Max no están disponibles en la información proporcionada; la comparación se basa únicamente en los resultados de benchmarks de la model card.

## Limitaciones y advertencias

- La licencia se indica como `other` sin especificar los términos exactos. Es imprescindible revisar la licencia del modelo base en el repositorio de Z.ai antes de cualquier uso comercial.
- Los idiomas soportados son únicamente inglés y chino; el rendimiento en otros idiomas no está garantizado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Las capacidades de ciberseguridad pueden ser peligrosas si se usan de forma malintencionada; se recomienda aplicar medidas de seguridad en entornos de producción.
- El rendimiento de las versiones cuantizadas puede degradarse respecto al modelo completo, especialmente en cuantizaciones de 1 bit. Unsloth publica benchmarks de sus cuantizaciones dinámicas en su documentación.
- El parámetro `reasoning_effort` debe configurarse explícitamente para controlar el coste computacional; el valor por defecto (`max`) puede generar respuestas muy largas y lentas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/GLM-5.3-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Guia de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Documentacion de GGUF dinamicos de Unsloth: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Paper referenciado: arxiv:2602.15763
- Repositorio de Z.ai (GLM-5): https://github.com/zai-org/GLM-5
