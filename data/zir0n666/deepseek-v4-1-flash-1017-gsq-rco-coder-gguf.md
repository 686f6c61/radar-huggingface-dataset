# Zir0n666/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 GSQ-RCO Coder es una compresión dirigida por capacidades del modelo base DeepSeek-V4.1-Flash-1017, un mixture-of-experts (MoE) de 763.200 millones de parámetros totales (551.900 millones en el transformer). La release, publicada por el autor Zir0n666 a partir del trabajo del IST-DASLab, combina dos técnicas complementarias: poda de expertos (se eliminan 192 de los 384 expertos enrutados por capa, es decir, el 50% de los parámetros de expertos) y cuantización de precisión mixta con el esquema GSQ (per-tensor, heredado del build IQ2_XXS a 2,00 bpw). El resultado almacena el transformer en 72,1 GB, lo que equivale a 1,05 bits por parámetro efectivo medido contra el modelo original.

El objetivo declarado es preservar capacidades de código, uso agéntico de herramientas, contexto largo y visión, sacrificando rendimiento en dominios fuera de ese conjunto. Según la model card, el modelo retiene el 94,8% de la puntuación de SWE-bench Verified y el 98,7% de LiveCodeBench v6 del modelo base, con todas las cifras medidas a esfuerzo de razonamiento 50. Las dos tablas de búsqueda Engram (110,6 GB, compartidas con la release sin poda) se leen una fila por token y pueden permanecer en disco.

La relevancia actual es metodológica: demuestra que la poda selectiva de expertos guiada por calibración (RCO) combinada con cuantización extrema (GSQ) permite ejecutar un MoE de escala frontera con una huella de transformer de 72,1 GB, manteniendo casi intacta la generación de código de un solo problema. Es una release experimental, con 0 descargas y 0 likes en el momento de la consulta, y el propio autor invita a reportar feedback sobre capacidades no representadas en los datos de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer; 384 expertos enrutados por capa, 6 activos por token |
| Parametros totales | 196.613.849.600 (196,6B) según safetensors del repo; 763,2B en el modelo base original (551,9B en el transformer + 196,6B en las tablas Engram) |
| Parametros activos | 6 expertos de 192 retenidos por token (el modelo base activa 6 de 384); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GSQ (per-tensor, precisión mixta) sobre los expertos retenidos, heredado del build IQ2_XXS a 2,00 bpw; tensores densos a mayor precisión; tablas Engram a 4,50 bpw fijo; formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 183,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE: cada capa contiene 384 expertos feed-forward independientes y un router que selecciona 6 por token, de modo que los expertos concentran la inmensa mayoría de los parámetros mientras solo una fracción se ejecuta en cada token. La release Coder aplica poda de expertos, que elimina parámetros del modelo (no solo reduce su precisión), reduciendo tanto el tamaño en disco como la memoria residente y restringiendo el router a un pool menor de candidatos. Los 192 expertos supervivientes por capa conservan la cuantización per-tensor del build IQ2_XXS.

La selección de expertos se realizó con RCO (paper arXiv:2605.00649, código en IST-DASLab/RCO), optimizando la divergencia KL entre las distribuciones del modelo original y el podado sobre un conjunto de calibración. Dado que los expertos especializan, la importancia de un experto se define respecto a una distribución de entradas, y esa distribución la aporta la calibración: por eso la elección de datos determina qué capacidades sobreviven. La cuantización GSQ (paper arXiv:2604.18556, código en IST-DASLab/GSQ) aporta el esquema de precisión mixta. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento configurable (las métricas de la model card se midieron a esfuerzo de razonamiento 50).
- Generación de código: el foco principal de la release, con retención del 98,7% en LiveCodeBench v6.
- Uso agéntico de herramientas y trayectorias multi-paso sobre repositorios reales (evaluado en SWE-bench Verified, retención del 94,8%).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con capacidades de visión preservadas por la selección de expertos.
- Contexto largo, según la propia model card entre los dominios hacia los que se dirige la compresión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling / function calling: no disponible como dato confirmado; la evaluación agéntica de SWE-bench implica interacción con herramientas, pero no se documenta un protocolo formal.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para parchear tests fallidos o generar correcciones, apoyándose en su retención del 98,7% en LiveCodeBench v6 y en una huella de transformer de 72,1 GB que reduce los requisitos de memoria frente al modelo completo.
- Resolución automática de issues en repositorios: con retención del 94,8% en SWE-bench Verified, es adecuado para agentes que recorren repositorios reales, localizan el fallo y proponen un parche multi-paso.
- Asistente de refactorización con contexto largo: la compresión se dirigió explícitamente hacia el contexto largo, lo que permite procesar fragmentos amplios de código y documentación en una sola conversación.
- Agente de atención al desarrollador: combinando tool calling implícito en flujos agénticos con generación de código, puede responder consultas técnicas encadenando búsquedas y ejecuciones de herramientas.
- Análisis de capturas y diagramas de arquitectura: el pipeline image-text-to-text permite extraer información de imágenes técnicas (diagramas UML, capturas de errores) y generar código o explicaciones a partir de ellas.
- Despliegue en hardware limitado para prototipado: al almacenar el transformer en 72,1 GB y permitir que las tablas Engram (110,6 GB) permanezcan en disco leyendo una fila por token, encaja en escenarios donde no cabría el modelo base completo.
- Evaluación comparativa de técnicas de compresión: sirve como referencia reproducible para investigadores que estudien el equilibrio entre poda de expertos, cuantización y degradación de capacidades por dominio.

## Benchmarks y rendimiento

| Benchmark | Modelo base (FP8 / FP4) | GSQ-RCO Coder (72,1 GB, 1,05 bpw) | Retencion |
|---|---|---|---|
| SWE-bench Verified | 81,20 | 77,00 | 94,8% |
| LiveCodeBench v6 | 89,71 | 88,57 | 98,7% |

Todas las cifras se midieron a esfuerzo de razonamiento 50. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: 72,1 GB en el formato GGUF de la release; las tablas Engram (110,6 GB, 4,50 bpw fijo) pueden residir en disco y leerse una fila por token, reduciendo la memoria residente necesaria.
- El repo completo ocupa 183,7 GB, por lo que el almacenamiento en disco debe dimensionarse en consecuencia incluso si parte de los pesos no se cargan en memoria.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por volumen de transformer (72,1 GB), configuraciones de una sola GPU de 80 GB (A100/H100) o de varias GPU quedan en el rango plausible, pero el autor no publica una recomendación concreta.
- ¿Cabe en GPU de consumo? No disponible como afirmación del autor; con 72,1 GB de transformer, no cabe en una RTX 4090 de 24 GB sin offloading parcial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, entre otros) por el formato GGUF; vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GSQ-RCO Coder (esta release) | 196,6B en repo; 763,2B en base; 6 de 192 expertos activos | no disponible | SWE-bench Verified 77,00; LiveCodeBench v6 88,57 | MIT | GGUF, 183,7 GB |
| DeepSeek-V4.1-Flash-1017 GSQ-RCO (sin poda) | 763,2B base; 6 de 384 expertos activos | no disponible | no disponible en la información | MIT | GGUF; transformer de 138,2 GB |
| DeepSeek-V4.1-Flash-1017 (base, FP8/FP4) | 763,2B base; 6 de 384 expertos activos | no disponible | SWE-bench Verified 81,20; LiveCodeBench v6 89,71 | no disponible | no disponible |

La comparativa con alternativas de otros desarrolladores (por ejemplo, otros MoE de escala frontera comprimidos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La poda del 50% de los expertos reduce capacidades por diseño; el propio autor declara que la degradación fuera de código, uso agéntico, contexto largo y visión es un coste aceptado del método.
- Para uso generalista, el autor recomienda explícitamente las releases sin poda (GSQ-RCO), no esta variante Coder.
- Las tareas multi-paso toleran peor la reducción de capacidad que la generación de código de un solo problema: la brecha entre LiveCodeBench v6 (98,7% de retención) y SWE-bench Verified (94,8%) se atribuye a la acumulación de error entre turnos.
- Las capacidades supervivientes dependen del conjunto de calibración usado en RCO; el autor pide feedback precisamente sobre capacidades no representadas en esos datos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar cobertura multilingüe o límites de ventana en producción.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las obligaciones heredadas del modelo base DeepSeek-V4.1-Flash-1017, cuya licencia no se detalla en la información disponible.
- Release experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de las métricas reportadas.
- El repositorio de 183,7 GB y la necesidad de gestionar las tablas Engram fuera de memoria añaden complejidad operativa frente a modelos densos de menor tamaño.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/Zir0n666/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Release equivalente del IST-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Release sin poda (GSQ-RCO): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- Organización IST-DASLab: https://github.com/IST-DASLab
