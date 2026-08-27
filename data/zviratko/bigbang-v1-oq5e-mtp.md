# zviratko/BigBang-v1-oQ5e-mtp

## Resumen

BigBang-v1-oQ5e-mtp es una cuantización en 5 bits del modelo BigBang-v1, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo de Endless Frontier. El modelo original evoluciona a partir de Qwen3.6-35B-A3B mediante un proceso de post-entrenamiento basado en un framework de datos sintéticos auto-evolutivos, orientado a tareas de investigación y razonamiento complejo. La cuantización ha sido realizada con la librería oQ (oMLX) en formato MLX safetensors, lo que permite ejecutar el modelo de forma eficiente en hardware Apple Silicon con memoria unificada.

Esta versión cuantizada es relevante porque reduce sustancialmente el coste de inferencia local, manteniendo un rendimiento que, según los autores, se sitúa entre el de DeepSeek V4 Flash (284B) y DeepSeek V4 Pro (1.6T) en agregado. El repositorio actual contiene los pesos cuantizados, el tokenizador y los activos de preprocesado multimodal necesarios para la ejecución. La licencia y los idiomas soportados no están especificados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parametros totales | 35B (modelo original) / 7.267.097.520 (repo cuantizado, según safetensors) |
| Parametros activos | 3B (modelo original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e: 5 bits, group size 64, mixed-precision |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (9 shards) |

## Arquitectura y entrenamiento

El modelo original BigBang-v1 es un MoE con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, construido sobre la arquitectura Qwen3.6-35B-A3B. El entrenamiento se realizó mediante un proceso de post-entrenamiento eficiente que emplea un framework adversarial de generación de datos sintéticos auto-evolutivos, basado en tareas de investigación verificables (frontier research tasks). Este enfoque busca mejorar la capacidad de razonamiento, búsqueda de información y generación de código en escenarios de largo recorrido.

La cuantización oQ5e aplicada en este repositorio utiliza una cuantización de precisión mixta con 5 bits y group size 64, optimizada para el runtime de MLX. No se han publicado detalles adicionales sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de investigación y búsqueda de información.
- Generación de código y soporte para programación en entornos de desarrollo.
- Capacidades de agente (agentic model) orientadas a tareas multi-paso, aunque no se especifica explícitamente el soporte de tool calling o function calling en la documentación del repositorio.
- Multimodal: el repositorio incluye activos de preprocesado multimodal, lo que sugiere capacidad de entrada visual (aunque no se detalla el alcance).
- La cuantización está diseñada para ejecución en Apple Silicon mediante MLX, aprovechando la memoria unificada del sistema.

## Casos de uso

- Asistencia a la investigación científica: el modelo puede analizar artículos, resumir resultados y ayudar en la redacción de hipótesis, gracias a su capacidad de razonamiento de largo plazo y su entrenamiento en tareas de investigación.
- Búsqueda de información en repositorios de código: al ser un modelo agéntico, puede navegar por repositorios, localizar funciones y proponer modificaciones en proyectos de software.
- Generación de código en entornos de desarrollo integrados en Apple Silicon: su cuantización permite ejecutarlo localmente en Macs con suficiente memoria, sirviendo como asistente de programación offline.
- Automatización de tareas de análisis de datos: puede procesar y resumir conjuntos de datos grandes, generando informes y visualizaciones en entornos de análisis.
- Chatbots de dominio específico en local: con la cuantización de 5 bits, es viable desplegar un asistente conversacional privado en un Mac Studio o MacBook Pro sin depender de servicios en la nube.
- Prototipado de aplicaciones de IA en investigación: los desarrolladores pueden probar rápidamente el modelo en su hardware local antes de decidir una infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web del proyecto menciona que el rendimiento agregado se sitúa entre DeepSeek V4 Flash y DeepSeek V4 Pro, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros test estandarizados. No se pueden presentar tablas comparativas sin datos verificados.

## Requisitos de hardware

- **Apple Silicon**: el modelo está optimizado para MLX y se ha probado en un Apple M5 Max (40 núcleos) según un benchmark de oMLX.
- **Memoria unificada**: se recomienda al menos 32 GB de RAM para la cuantización de 5 bits (el repositorio ocupa 25.9 GB en disco), aunque el uso real dependerá del contexto y de la longitud de entrada.
- **GPU**: no requiere GPU dedicada; utiliza la GPU integrada del chip Apple Silicon.
- **Despliegue**: se puede ejecutar con el runtime de MLX (incluido en oMLX) y con herramientas compatibles con MLX como `mlx_lm` o `mlx-vlm` para tareas multimodales.
- **Latencia**: no se proporcionan datos de latencia o throughput en la documentación. El benchmark de oMLX en M5 Max sugiere que el modelo funciona correctamente, pero sin cifras específicas.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. Como referencia, otros modelos MoE de tamaño similar en el ecosistema de Apple Silicon incluyen:

- **Qwen3-30B-A3B** (30B totales, 3B activos): arquitectura similar, cuantizaciones disponibles en MLX.
- **DeepSeek V4 Flash** (284B totales, activos no especificados): mencionado como referencia de rendimiento superior, pero con un tamaño mucho mayor.

Sin embargo, no se dispone de resultados de benchmarks comparativos para BigBang-v1 en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo original ni de la cuantización, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de usar en producción.
- **Idiomas no especificados**: se desconoce el soporte lingüístico completo; la mayoría de los modelos basados en Qwen suelen cubrir chino e inglés, pero no se ha confirmado.
- **Riesgo de alucinación**: al ser un modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de investigación complejas.
- **Sesgos no documentados**: no hay información sobre sesgos de género, raza u otros que puedan afectar a los resultados.
- **Limitaciones de contexto**: no se ha publicado la longitud máxima de contexto, lo que limita la planificación de tareas de largo alcance.
- **Cuantización de 5 bits**: aunque reduce el uso de memoria, puede degradar ligeramente la calidad en comparación con el modelo en precisión completa. Los efectos exactos no se han documentado.

## Enlaces

- Repositorio de HuggingFace: [zviratko/BigBang-v1-oQ5e-mtp](https://huggingface.co/zviratko/BigBang-v1-oQ5e-mtp)
- Colección de cuantizaciones oQ: [AmixDigital/bigbang-v1-mtp-oq-quantizations](https://huggingface.co/collections/AmixDigital/bigbang-v1-mtp-oq-quantizations)
- Benchmark en oMLX: [BigBang-v1-mtp-oQ5e en M5 Max](https://omlx.ai/benchmarks/performance/g23z3xxi)
- Sitio web del proyecto BigBang: [endlessfrontier.tech](https://endlessfrontier.tech/)
- Repositorio GitHub del modelo original: [endless-frontier/BigBang-v1](https://github.com/endless-frontier/BigBang-v1)
- Herramienta de cuantización oQ: [oQ (oMLX)](https://github.com/jundot/omlx)
