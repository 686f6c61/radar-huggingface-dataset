# tinyopsec/SimNPO-WMDP-llama3-8b-GGUF

## Resumen

SimNPO-WMDP-llama3-8b-GGUF es una colección de cuantizaciones en formato GGUF del modelo `OPTML-Group/SimNPO-WMDP-llama3-8b`, publicado por el usuario tinyopsec en Hugging Face. El modelo base es Meta-Llama-3-8B-Instruct (8.030.269.440 parámetros), al que se le ha aplicado un proceso de "machine unlearning" (desaprendizaje automático) sobre el benchmark WMDP (Weapons of Mass Destruction Proxy) mediante el método SimNPO, desarrollado por el OPTML Group. El objetivo del unlearning es eliminar del modelo el conocimiento peligroso relacionado con armas de destrucción masiva (biológico, químico y nuclear) manteniendo intactas, en la medida de lo posible, sus capacidades generales de lenguaje.

Este modelo es relevante porque aborda uno de los problemas más activos de la investigación en seguridad de modelos abiertos: cómo publicar pesos potentes sin facilitar el acceso a conocimiento dual-use peligroso. SimNPO (Simple Negative Preference Optimization) es una variante de NPO diseñada para hacer el desaprendizaje más estable y eficiente, y WMDP es el benchmark de referencia para medir la reducción de conocimiento peligroso. La versión GGUF permite ejecutarlo localmente con llama.cpp, Ollama, LM Studio o koboldcpp, con cuantizaciones desde 2 bits hasta F16.

Cabe destacar que se trata de un modelo de investigación sobre unlearning, no de un modelo de producción: el propio autor advierte en la model card que debe evaluarse antes de cualquier uso. Su utilidad principal es servir como banco de pruebas para estudiar cómo el desaprendizaje afecta a las capacidades generales y si el conocimiento eliminado puede recuperarse mediante técnicas de ataque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3) |
| Parametros totales | 8.030.269.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Llama 3 base: 8.192 tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (hereda del base: inglés predominante) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B Instruct: un transformer decoder autorregresivo con atención agrupada por consultas (GQA), normalización RMSNorm pre-norm y activaciones SwiGLU. El modelo no introduce cambios arquitectónicos respecto al base; la innovación está en el post-entrenamiento. Sobre Meta-Llama-3-8B-Instruct se aplicó SimNPO (Simple Negative Preference Optimization), un algoritmo de machine unlearning del OPTML Group que optimiza la reducción de la influencia de los datos a olvidar sin necesidad de un modelo de referencia (rm) como en KL-constrained approaches, lo que lo hace más estable y menos propenso al colapso del modelo.

El conjunto de datos de desaprendizaje es el corpus WMDP (Weapons of Mass Destruction Proxy), un benchmark que contiene preguntas y conocimiento sensible sobre biotecnología, química y nuclear, diseñado para evaluar y mitigar riesgos de uso dual. Los detalles concretos del entrenamiento (número de pasos, hiperparámetros, ratio de retención de capacidades generales) no están disponibles en la información proporcionada. No hay evidencia de que se hayan usado RLHF o DPO adicionales más allá del unlearning con SimNPO.

## Capacidades

- Generación de texto conversacional, heredada de Meta-Llama-3-8B-Instruct, con formato de chat.
- Razonamiento general y resolución de problemas a nivel de un modelo instruct de 8B, con posible degradación en dominios cercanos a los datos de unlearning (biología, química, nuclear).
- Capacidades de código y matemáticas heredadas del modelo base, aunque no se han publicado mediciones tras el unlearning.
- Ejecución local en CPU y GPU gracias al formato GGUF, con soporte en llama.cpp, Ollama, LM Studio y koboldcpp.
- No hay soporte documentado de tool calling, function calling, visión, audio ni thinking mode en la información disponible.
- Capacidades multilingües: no disponibles; el modelo base Llama 3 está optimizado principalmente para inglés.

## Casos de uso

- Investigación en machine unlearning: sirve como modelo de referencia para comparar métodos de desaprendizaje (SimNPO frente a NPO, GD, RMU, etc.) y medir la relación entre reducción de conocimiento peligroso y retención de utilidad en MMLU y otros benchmarks.
- Evaluación de robustez de unlearning: permite estudiar si el conocimiento eliminado puede recuperarse mediante fine-tuning con gradientes, ataques de jailbreak o cuantización agresiva, un tema central en la literatura de seguridad de modelos abiertos.
- Despliegue local de modelos "más seguros": organizaciones que quieran ejecutar un Llama-3-8B-Instruct localmente con riesgo reducido de conocimiento sobre armas de destrucción masiva pueden usar las cuantizaciones Q4_K_M o Q5_K_M en estaciones de trabajo sin conexión.
- Benchmarking de runtimes GGUF: al disponer de 13 cuantizaciones del mismo modelo, es útil para medir el impacto de la cuantización (calidad y velocidad) en llama.cpp, Ollama o LM Studio de forma controlada.
- Educación en seguridad de IA: caso práctico real para cursos y talleres sobre dual-use, WMDP y gobernanza de modelos abiertos, ejecutable en hardware de consumo.
- Desarrollo de pipelines de evaluación: puede integrarse en harnesses de evaluación (lm-evaluation-harness, por ejemplo) para medir automáticamente la degradación de capacidades tras el unlearning en dominios no objetivo.
- Prototipado de chatbots con mitigación de riesgo: como base experimental para asistentes locales donde se prefiera un modelo con conocimiento peligroso reducido, siempre con evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WMDP, MMLU, GSM8K ni de ningún otro benchmark, ni comparaciones con el modelo base. Para datos de rendimiento del método SimNPO sobre WMDP con Llama-3-8B-Instruct, puede consultarse el repositorio original de OPTML-Group y el paper de SimNPO (ver sección Enlaces), aunque los resultados específicos de esta conversión GGUF no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 8.030 millones de parámetros):
  - F16 (16,1 GB): 18-20 GB de VRAM, o ejecución en CPU con RAM suficiente.
  - Q8_0: aproximadamente 9-10 GB.
  - Q6_K: aproximadamente 7 GB.
  - Q5_K_M / Q5_K_S: aproximadamente 6-6,5 GB.
  - Q4_K_M / Q4_K_S / Q4_0: aproximadamente 5-5,5 GB (Q4_K_M es la cuantización recomendada por el autor).
  - Q3_K_L / Q3_K_M / Q3_K_S: aproximadamente 4-4,5 GB.
  - Q2_K: aproximadamente 3,5 GB, con degradación notable de calidad.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para F16; RTX 4060 Ti 8 GB, RTX 3060 12 GB o superior para cuantizaciones de 4-6 bits; el modelo cabe en GPUs de consumo desde 6 GB de VRAM con Q4_K_M.
- Ejecución en CPU: viable con llama.cpp en equipos con 8-16 GB de RAM, con velocidades del orden de pocos tokens por segundo según CPU; no se publican cifras concretas de latencia ni throughput.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay documentación para vLLM, TGI ni otros runtimes que no soporten GGUF.
- Tamaño total del repositorio: 77,6 GB (incluye las 13 cuantizaciones).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/SimNPO-WMDP-llama3-8b-GGUF | 8.030 M | GGUF (13 cuantizaciones) | Unlearning SimNPO sobre WMDP | MIT | Publico en Hugging Face |
| OPTML-Group/SimNPO-WMDP-llama3-8b | 8.030 M | Pesos originales | Unlearning SimNPO sobre WMDP | no disponible | Publico en Hugging Face |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | Safetensors | SFT + RLHF (sin unlearning) | Llama 3 Community License | Publico en Hugging Face |
| cygu/llama-3-8b-wmdp-rmu | 8.030 M | Safetensors | Unlearning RMU sobre WMDP | no disponible | Publico en Hugging Face |

La diferencia clave frente al modelo base Llama-3-8B-Instruct es el desaprendizaje de conocimiento peligroso del WMDP; frente a otras variantes unlearned como las basadas en RMU, SimNPO representa un enfoque distinto basado en optimización de preferencias negativas. No hay datos de rendimiento comparativo disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente que debe evaluarse antes de su uso; no está pensado para producción sin validación.
- El unlearning puede degradar capacidades generales, especialmente en dominios cercanos a los datos de desaprendizaje (biología, química, tecnología nuclear); no hay métricas publicadas que cuantifiquen esa degradación en esta conversión.
- Riesgo de recuperación del conocimiento: la literatura muestra que el unlearning puede revertirse parcialmente con fine-tuning malicioso o ataques de recuperación; no debe asumirse que el conocimiento peligroso está irreversiblemente eliminado.
- Riesgo de alucinación: heredado del modelo base Llama 3 8B, más cualquier efecto adverso del unlearning.
- Idiomas: el modelo base está optimizado para inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Contexto: la longitud de contexto de la conversión no está documentada; el base Llama 3 soporta 8.192 tokens, y las cuantizaciones agresivas (Q2_K, Q3) pueden degradar la calidad en contextos largos.
- Licencia: el repo se publica bajo MIT, pero al construirse sobre Meta Llama 3 pueden aplicar condiciones de la Llama 3 Community License del modelo base (por ejemplo, la política de uso aceptable de Meta); conviene revisarla para uso comercial.
- Cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_*) implican pérdida de calidad significativa y deben evitarse salvo para pruebas.
- Descargas y comunidad limitadas (453 descargas, 0 likes en el momento de la ficha), lo que implica menor validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/SimNPO-WMDP-llama3-8b-GGUF
- Modelo original (pesos sin cuantizar): https://huggingface.co/OPTML-Group/SimNPO-WMDP-llama3-8b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Benchmark WMDP: https://huggingface.co/datasets/cais/wmdp
- Paper de SimNPO: https://arxiv.org/abs/2410.24008 (SimNPO: Simple Negative Preference Optimization for Machine Unlearning, OPTML Group)
