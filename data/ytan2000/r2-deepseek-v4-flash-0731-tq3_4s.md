# YTan2000/R2-DeepSeek-V4-Flash-0731-TQ3_4S

## Resumen

R2-DeepSeek-V4-Flash-0731-TQ3_4S es una cuantización personalizada del modelo DeepSeek-V4-Flash-0731, desarrollada por YTan2000. Se trata de un modelo de mezcla de expertos (MoE) con 284 000 millones de parámetros totales y 13 000 millones de parámetros activos, que ha sido optimizado mediante la técnica propietaria TQ3_4S para reducir su tamaño en un 17 % respecto a la versión anterior, manteniendo la calidad en tareas de generación de código.

La relevancia de este lanzamiento radica en que consigue servir la ventana de contexto completa de 1 048 576 tokens en un único equipo con una RTX 3090 de 24 GB, apoyándose en memoria del sistema para alojar los expertos del modelo. Para ello utiliza un runtime modificado de llama.cpp (fork TurboQuant) que implementa el tipo de tensor TQ3_4S y compresión de caché KV, lo que permite ejecutar un modelo de este tamaño con requisitos de hardware relativamente accesibles.

El modelo se distribuye en formato GGUF en nueve archivos que suman aproximadamente 91 GB, y está pensado para entornos de producción locales o de investigación donde se necesite un modelo de gran capacidad con ventana de contexto extensa sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer |
| Parametros totales | 284 334 567 511 (284B) |
| Parametros activos | 13 000 000 000 (13B) |
| Longitud de contexto | 1 048 576 tokens (1M) |
| Tipos de cuantizacion | TQ3_4S (personalizado): IQ2_S en expertos ffw_up/ffw_gate, q2_K/q3_K en ffw_down, q4_K/q6_K en atención y capas densas, q6_K en embeddings |
| Idiomas soportados | no disponible |
| Licencia | other (se aplica la licencia del modelo base DeepSeek-V4-Flash) |
| Formato de pesos | GGUF (multi-archivo, 9 shards) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer con arquitectura de mezcla de expertos en la que se activan 13 000 millones de parámetros de un total de 284 000 millones. La cuantización TQ3_4S es un proceso de requantización guiado por imatrix que asigna diferentes niveles de precisión según la importancia de cada tensor: los expertos enrutados en las capas de proyección up y gate se cuantizan a IQ2_S, mientras que las capas de atención y densas conservan mayor precisión con q4_K/q6_K. Este enfoque selectivo busca preservar la calidad en tareas de código, que dependen críticamente de los expertos activados.

El proceso de cuantización parte de una versión UD-Q8_K_XL del modelo base y aplica una requantización dirigida por imatrix (matriz de importancia) para minimizar la pérdida de calidad en los tensores más relevantes. El modelo no incluye un bloque de draft MTP para decodificación especulativa, aunque es compatible con el drafter externo DSpark en el runtime de DGX Spark. El entrenamiento original del modelo base incluye técnicas de razonamiento explícito (thinking mode) que se activan mediante parámetros de configuración en el runtime.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito activable mediante `--reasoning on`.
- Generación de código de alta calidad: obtiene 93,3 % en HumanEval pass@1 y 92,6 % en MBPP pass@1.
- Soporte de tool calling y function calling, con 90,0 % en la suite de tareas toolcall.
- Extracción de datos estructurados (87,1 % en dataextract).
- Razonamiento matemático (80,0 % en reasonmath).
- Seguimiento de instrucciones (77,8 % en instructfollow).
- Ventana de contexto de 1M tokens, adecuada para procesar documentos extensos o conversaciones muy largas.
- Capacidades multilingües heredadas del modelo base, aunque no se detallan los idiomas específicos.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en una estación de trabajo con RTX 3090 y 128 GB de RAM para obtener ayuda de codificación con calidad de producción sin enviar código a servicios externos, gracias a los 13B parámetros activos y la optimización específica para tareas de código.
- Análisis de repositorios completos: la ventana de 1M tokens permite cargar proyectos enteros o múltiples archivos fuente en una sola pasada, facilitando tareas de refactorización, revisión de código o generación de documentación sobre la base de código completa.
- Agente autónomo con tool calling: el soporte de function calling y el rendimiento de 90 % en tareas de toolcall permiten construir agentes que interactúan con APIs, ejecutan comandos o consultan bases de datos de forma fiable.
- Procesamiento de documentos legales o técnicos extensos: la ventana de contexto de 1M tokens posibilita el análisis de contratos, manuales o informes de cientos de páginas manteniendo todas las referencias relevantes en memoria.
- Investigación académica en generación de código: los resultados en benchmarks como HumanEval+ (89,0 %) y MBPP+ (77,5 %) lo convierten en una herramienta útil para experimentos de síntesis de programas y evaluación de calidad de código generado.
- Despliegue en hardware unificado de gama alta: en un DGX Spark (GB10) con 128 GB de memoria unificada, el modelo alcanza 18,4 tok/s con contexto completo, y puede acelerarse hasta 22,9 tok/s usando el drafter DSpark, lo que lo hace viable para entornos de desarrollo integrados.

## Benchmarks y rendimiento

| Benchmark | R2_TQ3_4S (RTX 3090 @1M) | R2_TQ3_4S (DGX Spark) | TQ3_4S anterior (Spark, 512K) |
|---|---|---|---|
| HumanEval pass@1 | 93,3 | 90,9 | 94,5 |
| HumanEval+ pass@1 | 89,0 | 86,6 | 90,9 |
| MBPP pass@1 | 92,6 | 92,6 | 91,8 |
| MBPP+ pass@1 | 77,5 | 75,9 | 77,2 |
| Hard86 | 77/86 | 76/86 | 70/86 |
| Decode tok/s @1M | 14,3 | 18,4 (22,9 con drafter) | 21,4 @512K |

Desglose por tipo de tarea (R2_TQ3_4S en RTX 3090 @1M): coding 91,7; toolcall 90,0; dataextract 87,1; reasonmath 80,0; instructfollow 77,8; speed 49,4.

Los resultados se obtuvieron con el modo de razonamiento activado, temperatura 0 y el evaluador oficial de EvalPlus. La ejecución en RTX 3090 utilizó un presupuesto de razonamiento de 81 920 tokens, mientras que las pruebas en DGX Spark usaron 256 tokens.

## Requisitos de hardware

- Configuración mínima verificada: 1× RTX 3090 24 GB + CPU Ryzen 5950X + 125 GB DDR4-3200, sirviendo contexto completo de 1M tokens a 14,3 tok/s.
- Alternativa verificada: 1× DGX Spark (GB10) con 128 GB de memoria unificada, alcanzando 18,4 tok/s (22,9 tok/s con drafter DSpark).
- La VRAM de la GPU (24 GB) aloja las capas de atención y densas, mientras que los expertos MoE se ejecutan en CPU con memoria del sistema.
- La caché KV comprimida (q4_0 para claves, tq3_0 para valores) ocupa aproximadamente 14 GB para la ventana completa de 1M tokens.
- Se requiere el fork de llama.cpp TurboQuant (github.com/turbo-tan/llama.cpp-tq3), ya que las versiones estándar no pueden cargar el tipo de tensor TQ3_4S.
- Es imprescindible ejecutar con `ulimit -l unlimited` para que mlock pueda fijar los 91 GB del modelo en RAM; de lo contrario, el rendimiento se degrada silenciosamente.
- Opciones de despliegue: llama-server del fork TurboQuant, compatible con la API OpenAI-compatible para integración con herramientas existentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | HumanEval pass@1 | Licencia |
|---|---|---|---|---|---|
| R2_TQ3_4S (este) | 284B | 13B | 1M | 93,3 | other |
| TQ3_4S anterior | 284B | 13B | 512K | 94,5 | other |
| DeepSeek-V4-Flash (base, sin cuantizar) | 284B | 13B | no disponible | no disponible | other |

La comparación directa con la versión anterior de la cuantización muestra una ligera reducción en HumanEval (de 94,5 a 93,3) a cambio de un tamaño un 17 % menor (91 GB frente a 110 GB) y el doble de contexto servible (1M frente a 512K). No se dispone de datos de benchmarks del modelo base sin cuantizar en la información proporcionada.

## Limitaciones y advertencias

- Requiere un runtime específico: las builds estándar de llama.cpp no pueden cargar este modelo; es necesario usar el fork TurboQuant, lo que limita la portabilidad a otras herramientas del ecosistema (Ollama, LM Studio, etc.).
- La licencia es "other" y se remite a la licencia del modelo base DeepSeek-V4-Flash; es necesario revisar los términos de esa licencia antes de un uso comercial.
- El rendimiento en tareas de velocidad es bajo (49,4 en la suite speed), lo que sugiere que no es adecuado para aplicaciones que requieran latencia muy baja.
- La cuantización agresiva de los expertos (IQ2_S) puede introducir degradación de calidad en tareas fuera del dominio de código, aunque no se han publicado evaluaciones exhaustivas en otros ámbitos.
- La configuración de hardware es exigente: se necesitan al menos 125 GB de RAM del sistema para la configuración con RTX 3090, y el uso de mlock requiere privilegios de administrador.
- Los benchmarks se han realizado con configuraciones específicas (presupuestos de razonamiento diferentes entre plataformas), por lo que las comparaciones entre columnas deben interpretarse con cautela.
- No se han publicado datos sobre sesgos, alucinación o comportamiento en idiomas distintos del inglés en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YTan2000/R2-DeepSeek-V4-Flash-0731-TQ3_4S
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Runtime TurboQuant (fork de llama.cpp): https://github.com/turbo-tan/llama.cpp-tq3
- Receta completa de cuantización y validación: https://github.com/turbo-tan/recipes/tree/main/v9a
- Versión anterior de la cuantización: https://huggingface.co/YTan2000/DeepSeek-V4-Flash-0731-TQ3_4S
