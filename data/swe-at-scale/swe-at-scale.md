# SWE-at-Scale/swe-at-scale

## Resumen

SWE-at-Scale es un adaptador LoRA publicado por el grupo SWE-at-Scale que se monta sobre el modelo base Qwen/Qwen3.5-9B. No es un asistente de programación al uso: su tarea es la inversa de la reparación de bugs. Recibe como entrada un fichero fuente ya corregido y numerado por líneas, y genera un parche que reintroduce el fallo, es decir, un parche inductor de bug. El artefacto acompaña al artículo *SWE-at-Scale: Software Task Synthesis from Real Fixes* y está pensado para alimentar pipelines de síntesis de tareas de ingeniería de software.

El interés práctico está en la generación de datos: a partir de arreglos reales se pueden fabricar repositorios defectuosos con verdad de referencia exacta, lo que permite construir benchmarks de reparación automática, aumentar datasets tipo SWE-bench o evaluar la cobertura de suites de tests. El adaptador se entrenó con 13.407 transformaciones de arreglos reales procedentes de 688 repositorios, incluyendo datos multi-hunk de la etapa 5 del pipeline.

La información pública es escasa: el repositorio pesa 0,2 GB, acumula 4 descargas y 14 likes desde su creación el 2 de octubre de 2026, y no declara licencia ni idiomas. La model card restringe explícitamente el uso a investigación dentro del pipeline SWE-at-Scale y exige validar cada parche generado mediante aplicación sobre el repositorio, tests de regresión y comprobación de que los tests no relacionados siguen pasando.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (librería PEFT) sobre un modelo base decoder-only: Qwen/Qwen3.5-9B |
| Parámetros totales | No disponible para el adaptador (no se declara rango ni número de parámetros entrenables); el modelo base se denomina Qwen3.5-9B, lo que sugiere ~9.000 millones de parámetros, dato no verificado en la información proporcionada |
| Parámetros activos | No aplica: no se indica que el modelo base sea una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El adaptador se distribuye en safetensors; puede fusionarse con el base y cuantizarse después, pero los formatos concretos soportados no se detallan en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | Safetensors (adaptador LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base Qwen/Qwen3.5-9B, sobre el que se inyectan las matrices de bajo rango; la model card no especifica rango, alpha, módulos objetivo ni precisión del adaptador, aunque el tamaño del repositorio (0,2 GB) es consistente con un adaptador de rango relativamente alto. La carga se realiza con `AutoPeftModelForCausalLM` de PEFT, que fusiona o mantiene el adaptador sobre el base.

El entrenamiento se orientó a un objetivo de generación directa de parches inductores de bug a partir de un fichero corregido y numerado por líneas. Según la procedencia declarada, se usaron 13.407 transformaciones de arreglos reales extraídos de 688 repositorios, con datos multi-hunk de la etapa 5 del pipeline. No se documentan el número total de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación; tampoco se detallan innovaciones de decodificación o atención.

## Capacidades

- Generación de parches inductores de bug: dada una versión corregida de un fichero, con numeración de líneas, produce un parche que reintroduce el defecto.
- Generación multi-hunk: el entrenamiento incluye datos con múltiples hunks por parche, por lo que puede alterar varias regiones del fichero en una sola salida.
- Condicionamiento sobre código numerado por líneas, lo que permite referirse a posiciones concretas del fichero de entrada.
- Salida en formato de parche aplicable al repositorio; la model card no especifica la sintaxis exacta (unified diff u otra) ni restricciones de formato.
- Capacidad multilingüe: no disponible.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Modo thinking, visión, audio u otras modalidades: no documentados.

## Casos de uso

- Síntesis de datos para entrenar agentes de reparación: dado un repositorio con historial de arreglos, se generan versiones defectuosas emparejadas con su solución, y se construyen pares (bug, fix) a escala sin anotación manual. El modelo es adecuado porque invierte el sentido habitual del parche y conserva el contexto de líneas del fichero original.
- Aumento de benchmarks tipo SWE-bench: a partir de repositorios no incluidos en el benchmark original se generan tareas nuevas con verdad de referencia exacta, lo que permite ampliar la evaluación con instancias fuera del conjunto de entrenamiento.
- Evaluación de suites de tests en repos heredados: se inyectan bugs controlados y se comprueba si la suite existente falla. Los casos en que los tests siguen pasando señalan huecos de cobertura, un uso cercano al mutation testing pero con parches semánticamente plausibles en lugar de mutaciones sintácticas.
- Investigación en localización de fallos: al conocer el hunk exacto y las líneas modificadas, el parche generado sirve como ground truth para medir la precisión de modelos de fault localization.
- Validación de pipelines de CI/CD: se generan parches que deberían romper la compilación o los tests; si el pipeline los acepta, hay un fallo en los gates de calidad. El modelo encaja porque produce cambios realistas derivados de arreglos humanos.
- Construcción de datasets de code review: los pares (parche inductor, fichero corregido) permiten entrenar o evaluar revisores automáticos que deben señalar la regresión introducida.
- Docencia y ejercicios de depuración: se crean enunciados con un repositorio defectuoso y un parche de referencia verificable, útiles en formación de ingeniería de software.
- Estudio de robustez de modelos de código: se mide si un modelo reparador detecta y corrige bugs generados por otro modelo, lo que da una señal de generalización frente a bugs sintéticos triviales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de aplicación del parche, tests de regresión superados ni comparaciones con otros generadores de bugs; solo describe el protocolo de evaluación recomendado (aplicación del parche, tests de regresión y preservación de tests no relacionados).

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco; el coste real de inferencia lo determina el modelo base fusionado.
- Estimación para el base de ~9.000 millones de parámetros a FP16/BF16: en torno a 18 GB solo de pesos, más caché KV y activaciones, lo que sitúa el requisito práctico en 20-24 GB de VRAM como mínimo.
- Cuantización de 8 bits: aproximadamente 9-10 GB de pesos, con requisito práctico de 12-14 GB de VRAM.
- Cuantización de 4 bits: aproximadamente 5 GB de pesos, con requisito práctico de 7-8 GB de VRAM.
- GPU recomendadas para FP16: A100 40 GB u H100 para lotes grandes y contexto largo; en el límite, una RTX 4090 de 24 GB con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a 8 bits y en RTX 4070 Ti Super, 4080 o 4060 Ti de 16 GB a 4 bits.
- Despliegue: PEFT + Transformers para cargar el adaptador; vLLM o TGI tras fusionar el adaptador en el base; llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SWE-at-Scale (este) | Adaptador LoRA sobre base de ~9B (rango no declarado) | No disponible | Inyección de bugs / síntesis de tareas SWE | No disponible | HuggingFace, 4 descargas |
| Qwen/Qwen3.5-9B (base) | ~9.000 millones (según denominación) | No disponible | Generación de texto y código general | No disponible en la información proporcionada | HuggingFace |
| Otros adaptadores de inyección de bugs para síntesis SWE | No disponible | No disponible | No disponible | No disponible | No identificados en la búsqueda realizada |

La búsqueda web asociada no devolvió alternativas comparables: los resultados corresponden a la Society of Women Engineers, a un catálogo de mobiliario y a un benchmark de agentes sin relación con este artefacto. No se dispone, por tanto, de una comparación cuantitativa con otras herramientas de bug injection.

## Limitaciones y advertencias

- El modelo genera deliberadamente código defectuoso. Usarlo fuera del pipeline de síntesis produce parches que introducen fallos; no debe emplearse como asistente de programación ni de reparación.
- Riesgo de parches no aplicables: puede emitir hunks que no encajan con las líneas reales del fichero, por lo que la aplicación debe validarse de forma automática.
- Riesgo de regresiones colaterales: un parche puede romper tests no relacionados con el bug objetivo, lo que invalida la instancia generada. La model card exige comprobar la preservación de tests no relacionados.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, y la model card indica que el modelo está pensado para investigación. Conviene contactar con los autores antes de cualquier despliegue productivo.
- Licencia del modelo base desconocida en la información disponible: los términos de Qwen/Qwen3.5-9B condicionan cualquier uso del adaptador fusionado.
- Idiomas no declarados: no hay garantía de comportamiento fuera del inglés técnico habitual en código y documentación de repositorios.
- Sin benchmarks publicados: no existen métricas de tasa de éxito, aplicabilidad del parche ni calidad del bug inyectado, lo que impide estimar el rendimiento esperado.
- Sesgos del dataset: los 688 repositorios de origen no se caracterizan (lenguajes, dominios, tamaño), por lo que se desconoce la cobertura real y el sesgo hacia ciertos ecosistemas.
- Validación comunitaria mínima: 4 descargas y 14 likes en el momento de la consulta; no hay informes independientes de uso.
- Contexto máximo no documentado: en ficheros grandes el modelo puede truncar la entrada sin que la model card advierta de ello.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/SWE-at-Scale/swe-at-scale
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo citado, *SWE-at-Scale: Software Task Synthesis from Real Fixes*: enlace no disponible en la información proporcionada
- Repositorio de código o demo del pipeline: no disponible
- Resultados de benchmarks públicos: no disponible
