# unsloth/DeepSeek-V4-Pro-0813-GGUF

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial del modelo DeepSeek-V4-Pro de DeepSeek, un modelo de lenguaje masivo de 1,57 billones de parámetros con arquitectura de mezcla de expertos (MoE) y 48 000 millones de parámetros activos por token. Esta ficha corresponde a la cuantización GGUF publicada por Unsloth, que facilita la ejecución local del modelo mediante formatos optimizados como Unsloth Dynamic 2.0. El modelo destaca por sus capacidades agénticas mejoradas respecto a la versión preliminar, con mejoras especialmente pronunciadas en entornos de producción, y por su ventana de contexto de 1 millón de tokens.

La relevancia actual de este modelo radica en que es uno de los modelos abiertos más grandes disponibles, con licencia MIT, y compite directamente con los modelos propietarios más potentes del mercado en tareas de razonamiento, agente de código y automatización. La versión GGUF de Unsloth está pensada para que desarrolladores e investigadores puedan ejecutarlo con cuantizaciones que reducen los requisitos de memoria, aunque el tamaño total del modelo sigue exigiendo hardware de servidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 61 capas, 384 expertos enrutados, 6 expertos activos por token y 1 experto compartido |
| Parametros totales | 1,57 billones (1.57T) |
| Parametros activos | 48 000 millones (48B) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | No disponible (en progreso; se menciona Unsloth Dynamic 2.0) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro-0813 emplea una arquitectura de mezcla de expertos con 61 capas, tamaño oculto de 7168, 128 cabezas de atención, 384 expertos enrutados de los cuales se activan 6 por token, y un experto compartido con tamaño de FFN de 3072. Incorpora un módulo de decodificación especulativa denominado DSpark, que acelera la generación sin sacrificar calidad. La versión 0813 supera a la versión preliminar DeepSeek-V4-Pro (Preview) en todos los benchmarks publicados.

No se dispone de información sobre el proceso de entrenamiento: número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card de Unsloth indica que la cuantización está en progreso y que los archivos GGUF se suben conforme se completan, por lo que los detalles de cuantización específicos aún no están disponibles.

## Capacidades

- Generación de texto y razonamiento complejo, con resultados destacados en HLE (Humanity's Last Exam) tanto sin herramientas como con herramientas.
- Capacidades agénticas avanzadas: ejecución de tareas en terminal, desarrollo de repositorios completos (NL2Repo), resolución de issues de software (DeepSWE) y automatización de flujos de trabajo.
- Soporte de tool calling y function calling, evaluado en Toolathlon-Verified.
- Razonamiento multi-paso y planificación, con soporte de modo de razonamiento máximo (max reasoning effort) según la configuración de evaluación.
- Contexto largo de 1 millón de tokens, adecuado para tareas que requieren mantener información extensa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede resolver issues de repositorios completos (DeepSWE) y generar código a partir de descripciones de repositorios (NL2Repo), integrándose en pipelines de CI/CD como agente autónomo.
- Automatización de terminal: con un rendimiento de 87,9 en Terminal Bench 2.1, puede ejecutar comandos, gestionar entornos y completar tareas administrativas de forma autónoma.
- Ciberseguridad ofensiva y defensiva: su puntuación de 83,3 en Cybergym lo hace adecuado para simulaciones de ataques y análisis de vulnerabilidades en entornos controlados.
- Razonamiento científico y matemático: con 42,7 en HLE sin herramientas y 60,0 con herramientas, puede asistir en investigación y resolución de problemas complejos.
- Integración con herramientas externas: su alto rendimiento en Toolathlon-Verified (74,1) lo habilita para orquestar APIs, bases de datos y servicios externos en flujos de producción.
- Desarrollo full-stack: con 71,1 en DSBench-FullStack, puede abordar tareas de desarrollo integral que combinan frontend, backend y base de datos.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan DeepSeek-V4-Pro-0813 con varios modelos, tanto de la misma familia como propietarios. La evaluación de tareas de agente de código se realizó con DeepSeek Harness en modo minimal, con nivel de razonamiento máximo, temperatura 1,0 y top_p 0,95.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

† DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos de DeepSeek para tareas de desarrollo full-stack y problemas difíciles de agente de código.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM para este modelo en la información disponible.
- Dado que el modelo base tiene 1,57 billones de parámetros totales y 48 000 millones de activos por token, la inferencia requiere hardware de servidor con múltiples GPUs de alta gama (por ejemplo, A100 o H100) o soluciones de cuantización muy agresivas.
- La cuantización GGUF de Unsloth está diseñada para reducir los requisitos de memoria, pero incluso con cuantización, un modelo de este tamaño no cabe en GPUs de consumo (como RTX 4090) de forma realista.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama y otros runners de GGUF. Unsloth proporciona una guía de ejecución en su documentación.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados, ya que no se dispone de especificaciones completas de los modelos propietarios (GLM-5.2, Kimi K3, Opus-4.8, Fable-5). Frente a DeepSeek-V4-Flash-0731, de la misma familia, el modelo Pro-0813 tiene más del doble de parámetros totales (1,57T frente a 745B) y casi el doble de activos (48B frente a 26B), con 61 capas frente a 43 y 384 expertos frente a 256. Ambos comparten contexto de 1M y 6 expertos activos por token.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | HLE (con herramientas) | DeepSWE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| DeepSeek-V4-Pro-0813 | 1,57T | 48B | 1M | MIT | 60,0 | 62,7 |
| DeepSeek-V4-Flash-0731 | 745B | 26B | 1M | MIT | 51,5 | 54,4 |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | 54,7 | 46,2 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | 56,0 | 67,5 |
| Opus-4.8 | No disponible | No disponible | No disponible | No disponible | 57,9 | 58,0 |

## Limitaciones y advertencias

- La cuantización GGUF está en progreso: la model card indica "In progress will take a while", por lo que los archivos pueden estar incompletos o cambiar.
- No se han publicado datos sobre sesgos, alucinación o comportamiento en dominios específicos.
- El tamaño del modelo (1,57T parámetros) hace que su despliegue sea inviable en hardware de consumo, incluso con cuantización.
- No se especifican los idiomas soportados, aunque por su naturaleza es probable que tenga cobertura multilingüe; no hay confirmación oficial.
- La licencia MIT permite uso comercial, pero conviene verificar los términos exactos del modelo base en el repositorio de DeepSeek.
- Los benchmarks de tareas agénticas dependen del framework de evaluación (DeepSeek Harness) y de la configuración de razonamiento, por lo que los resultados pueden variar en otros entornos.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Pro-0813-GGUF
- Guía de ejecución de DeepSeek-V4 de Unsloth: https://unsloth.ai/docs/models/deepseek-v4
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Repositorio de DeepSeek-V4-Flash-0731 GGUF: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Página de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
