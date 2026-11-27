# Xylolabs/Qwen3-4B-Instruct-2507-GGUF

## Resumen

Xylolabs/Qwen3-4B-Instruct-2507-GGUF es un conjunto de cuantizaciones GGUF del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un transformer denso de 4.022.468.096 parámetros desarrollado por el equipo Qwen (Alibaba), orientado a generación de texto conversacional e instrucciones. Esta release no introduce pesos nuevos: su valor está en ofrecer una matriz de cuantizaciones verificadas con métricas de fidelidad respecto al BF16 original.

El repositorio incluye ocho variantes de cuantización, desde Q8_0 (4,28 GB) hasta Q2_K (1,67 GB), y documenta para cada una la divergencia KL y la concordancia top-1 frente al modelo BF16 sobre WikiText-2, un corpus de chat y texto reservado, además de una prueba de siete preguntas. Es relevante para desarrolladores que necesitan desplegar un modelo de 4B en hardware modesto y quieren elegir la cuantización con datos objetivos de degradación en lugar de estimaciones.

La licencia es Apache 2.0, lo que facilita el uso comercial. El repo ocupa 21,4 GB en total y no registra descargas ni likes en el momento de la consulta, lo que indica una publicación muy reciente (26 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507); pesos distribuidos en formato GGUF para llama.cpp |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de ejecucion de la model card usa `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. La model card de esta release no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo base, que no se incluye en la información proporcionada. Tampoco se documentan innovaciones de arquitectura específicas (atención lineal, decodificación especulativa u otras) más allá de lo que implica un transformer estándar.

La contribución técnica de esta release es el proceso de cuantización y su validación. El autor reporta métricas de divergencia KL y concordancia top-1 contra BF16 sobre tres conjuntos (WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens), además de una prueba cualitativa de siete preguntas. Los resultados muestran que Q8_0 mantiene una KL de 0,001242 en WikiText-2 y un top-1 del 98,07%, mientras que Q2_K degrada hasta KL 0,317946 y top-1 del 76,93%. La release incluye además comparaciones directas con las cuantizaciones de Unsloth para los mismos tamaños, lo que permite evaluar el impacto del método de cuantización a igualdad de bits.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta multi-turno en formato chat, con soporte de plantilla Jinja (`--jinja` en llama.cpp).
- Ejecución en CPU, CUDA y Metal mediante llama.cpp, sin dependencia de GPUs de datacenter.
- Cuantizaciones de muy bajo peso (Q2_K, 1,67 GB) que permiten inferencia en equipos con poca memoria.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidades específicas del modelo base (código, matemáticas, tool calling, multilingüismo) no verificadas en la información proporcionada; deben consultarse en la model card de Qwen/Qwen3-4B-Instruct-2507.

## Casos de uso

- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: la variante Q4_K_M (2,50 GB) o IQ4_XS (2,27 GB) permite ejecutar un modelo de 4B en CPU con llama.cpp manteniendo una concordancia top-1 superior al 91% respecto a BF16, adecuado para asistentes locales y pruebas de concepto.
- Servicios de chat de bajo coste en GPU de consumo: con Q8_0 (4,28 GB) o Q6_K (3,31 GB) se obtiene una fidelidad cercana al modelo original (top-1 del 98,07% y 97,02% respectivamente) en tarjetas con 8-12 GB de VRAM, útil para prototipos de atención al cliente.
- Evaluación de cuantizaciones en pipelines de ML: las tablas de KL y top-1 por fichero permiten seleccionar el compromiso tamaño/calidad con datos medidos, por ejemplo para decidir entre Q4_K_M y Q5_K_M en un despliegue con presupuesto de memoria fijo.
- Inferencia en dispositivos Apple Silicon: la model card indica soporte Metal, de modo que las variantes Q4_K_S (2,38 GB) o Q5_K_M (2,89 GB) son adecuadas para Mac con memoria unificada limitada.
- Generación de texto por lotes en entornos con CPU: la variante Q2_K (1,67 GB) permite procesar grandes volúmenes en servidores sin GPU, aceptando la degradación documentada (top-1 del 76,93% en WikiText-2 y 5/7 en la prueba de preguntas).
- Integración en aplicaciones de escritorio o embebidas: al ser GGUF y funcionar con llama.cpp, el modelo puede empaquetarse en herramientas locales de resumen, reescritura o clasificación conversacional sin conexión a servicios externos.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas estándar (MMLU, HumanEval, GSM8K), pero sí métricas de fidelidad de cuantización frente a BF16. Se reproducen a continuación las más relevantes:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Texto reservado KL | top-1 | Prueba 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 8,05 GB | - | - | - | - | - | - | 7/7 |
| Q8_0 | 4,28 GB | 0,001242 | 98,07% | 0,001627 | 98,14% | 0,001436 | 98,28% | 7/7 |
| Q6_K | 3,31 GB | 0,003514 | 97,02% | 0,005016 | 96,65% | 0,004288 | 97,06% | 7/7 |
| Q5_K_M | 2,89 GB | 0,008647 | 95,73% | 0,012361 | 95,37% | 0,008570 | 96,08% | 7/7 |
| Q4_K_M | 2,50 GB | 0,025425 | 93,38% | 0,037455 | 92,25% | 0,028424 | 92,39% | 7/7 |
| Q4_K_S | 2,38 GB | 0,029208 | 92,90% | 0,041665 | 91,65% | 0,033429 | 91,80% | 7/7 |
| IQ4_XS | 2,27 GB | 0,034895 | 91,83% | 0,054528 | 92,12% | 0,038374 | 91,31% | 7/7 |
| Q3_K_M | 2,08 GB | 0,091362 | 86,78% | 0,154629 | 85,53% | 0,122796 | 84,16% | 6/7 |
| Q2_K | 1,67 GB | 0,317946 | 76,93% | 0,391562 | 75,43% | 0,423467 | 70,98% | 5/7 |

La model card también incluye comparaciones con las cuantizaciones de Unsloth para tamaños equivalentes; por ejemplo, en Q4_K_M Unsloth obtiene KL 0,027591 en WikiText-2 frente a 0,025425 de esta release, y en Q6_K Unsloth registra KL 0,004773 frente a 0,003514. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: proporcional al tamaño del fichero GGUF más el contexto. Q8_0 requiere al menos 4,28 GB para los pesos; Q4_K_M, 2,50 GB; Q2_K, 1,67 GB. A ello hay que sumar la memoria de la caché KV para el contexto configurado (el ejemplo usa 32.768 tokens).
- GPU recomendadas: cualquier GPU compatible con llama.cpp/CUDA con VRAM suficiente; para Q8_0 se recomienda 8 GB o más, para Q4_K_M 4-6 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- GPU de consumo: sí cabe en tarjetas consumer. Las variantes Q4 y Q5 (2,27-2,89 GB) son viables en GPUs de 6-8 GB; Q8_0 en GPUs de 8 GB o más.
- Despliegue: llama.cpp (validado con el commit `caea914e9d05153aa32b96a846dca543e7cb16be`), con soporte CUDA, Metal y CPU. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se mencionan vLLM, TGI ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Instruct-2507-GGUF | 4,02B | No disponible | Apache 2.0 | GGUF | 8 cuantizaciones con métricas KL/top-1 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02B | No disponible | Apache 2.0 | Safetensors | Modelo original en BF16 |
| Cuantizaciones Unsloth del mismo base | 4,02B | No disponible | Apache 2.0 | GGUF | Comparadas en la model card; KL ligeramente superior en varios tamaños |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación aportada.

## Limitaciones y advertencias

- La degradación por cuantización es significativa por debajo de Q4: Q3_K_M baja al 86,78% de top-1 en WikiText-2 y Q2_K al 76,93%, con fallos en la prueba cualitativa (6/7 y 5/7). No se recomienda Q2_K ni Q3_K_M para producción sensible a la calidad.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información proporcionada; deben evaluarse sobre el modelo base.
- El contexto máximo real del modelo base no se indica en esta release; el valor `-c 32768` del ejemplo es una configuración de llama.cpp, no necesariamente el límite del modelo.
- Las capacidades del modelo base (código, matemáticas, tool calling, multilingüismo) no están verificadas en esta model card.
- Aunque la licencia es Apache 2.0, deben revisarse los ficheros `LICENSE` y `NOTICE` del repositorio para confirmar obligaciones de atribución.
- El repositorio no registra descargas ni likes y fue creado el 26 de noviembre de 2026, por lo que no hay validación comunitaria independiente de las métricas reportadas.
- El rendimiento en producción depende de la versión de llama.cpp; el autor solo valida un commit concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráficas de precisión incluidas en el repo: `accuracy-mean-kl.png`, `accuracy-top1.png` (y sus variantes dark) en la raíz del repositorio.
