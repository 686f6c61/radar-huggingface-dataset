# zzzzdar3warfatf/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF

## Resumen

El modelo `zzzzdar3warfatf/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF` es una cuantización en formato GGUF de la versión "abliterated" del modelo Qwen2.5-Coder-7B-Instruct, desarrollado originalmente por Alibaba Cloud. La variante abliterated, creada por huihui-ai, elimina las direcciones de rechazo del modelo base mediante la técnica de ablación de pesos, dando como resultado un asistente de código sin censura que responde a cualquier solicitud sin negarse. Esta cuantización concreta fue generada por bartowski usando llama.cpp (release b4058) con la opción imatrix, y está publicada en HuggingFace por el usuario zzzzdar3warfatf.

El modelo base Qwen2.5-Coder-7B-Instruct es un transformer decoder-only denso de 7.6 mil millones de parámetros, preentrenado con 5.5 billones de tokens y ajustado con instrucciones. Soporta una ventana de contexto de 32K tokens y destaca por su rendimiento en generación de código, superando a modelos más grandes como CodeStral-22B y DS-Coder-33B-Instruct en tareas de razonamiento de código. La versión abliterated mantiene estas capacidades técnicas pero elimina los mecanismos de rechazo, lo que la hace adecuada para entornos donde se requiere una respuesta sin restricciones, aunque con importantes implicaciones de seguridad.

Esta ficha se centra en la cuantización GGUF, que permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp, LM Studio u Ollama, con diferentes niveles de compresión que van desde f16 (15.24 GB) hasta Q3_K_L (4.09 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, dense (Qwen2.5-Coder) |
| Parametros totales | 7.615.616.512 (7.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (modelo base) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, Q4_0_8_8, Q4_0_4_8, Q4_0_4_4, IQ4_XS, Q3_K_L (y otros no listados en la tabla) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct es un transformer decoder-only con atención causal, perteneciente a la familia Qwen2.5. Utiliza una arquitectura densa (no MoE) con 28 capas, 28 cabezas de atención y una dimensión oculta de 3584. Fue preentrenado con 5.5 billones de tokens de código y texto, e incluye un ajuste fino supervisado (SFT) seguido de optimización con preferencias humanas (RLHF/DPO) para la variante Instruct. El modelo base soporta tool calling, function calling y generación de código en más de 40 lenguajes de programación.

La versión abliterated de huihui-ai aplica una técnica de ablación de pesos que identifica y elimina las direcciones del espacio latente responsables de los comportamientos de rechazo. Esto se logra mediante un análisis de activaciones sobre prompts que provocan negativas, y posteriormente se proyectan los pesos fuera de esas direcciones. El resultado es un modelo que conserva las capacidades de código y razonamiento del original pero no muestra resistencia a solicitudes que el modelo base rechazaría (por ejemplo, contenido ofensivo, instrucciones maliciosas, etc.).

La cuantización GGUF fue realizada por bartowski con llama.cpp b4058, utilizando la opción imatrix (importance matrix) con un dataset específico para mejorar la calidad de la cuantización. Los archivos están disponibles en múltiples niveles de compresión, desde f16 (sin pérdida) hasta Q3_K_L, permitiendo elegir entre calidad y requisitos de memoria.

## Capacidades

- Generación de código en más de 40 lenguajes de programación (Python, Java, C++, JavaScript, etc.) con alta precisión sintáctica y semántica.
- Razonamiento y resolución de problemas matemáticos y algorítmicos, con capacidad para explicar el razonamiento paso a paso.
- Soporte de tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Capacidad de agente multi-paso: puede planificar y ejecutar secuencias de acciones para completar tareas complejas.
- Generación de texto general y conversación, aunque su especialización principal es el código.
- Al ser abliterated, no muestra rechazo ante solicitudes que el modelo base consideraría inapropiadas o peligrosas (esta es una capacidad técnica, no una recomendación de uso).
- Ventana de contexto de 32K tokens, adecuada para analizar repositorios completos o documentación extensa.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede autocompletar código, generar funciones, explicar fragmentos y depurar errores. Su contexto de 32K permite procesar archivos grandes o múltiples archivos relacionados en una sola consulta.
- Generación de scripts y automatización: ideal para crear scripts de shell, Python o PowerShell para tareas de administración de sistemas, gracias a su capacidad de tool calling y su conocimiento de APIs de sistema.
- Análisis y refactorización de código legacy: puede leer un repositorio completo (dentro del límite de contexto) y sugerir refactorizaciones, detectar patrones problemáticos o documentar código no comentado.
- Generación de documentación técnica: a partir de código fuente, puede producir comentarios, docstrings, guías de usuario y documentación de API en inglés.
- Prototipado rápido de aplicaciones: los desarrolladores pueden describir una funcionalidad en lenguaje natural y obtener un esqueleto de aplicación funcional, que luego se itera.
- Entornos de investigación sin restricciones de contenido: dado que es abliterated, puede utilizarse en investigación sobre seguridad de IA, generación de contenido adversario o análisis de comportamientos no alineados, siempre bajo condiciones controladas y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización GGUF. El modelo base Qwen2.5-Coder-7B-Instruct, según el reporte técnico (arXiv:2409.12186), supera a modelos más grandes como CodeStral-22B y DS-Coder-33B-Instruct en tareas de razonamiento de código. Sin embargo, no se dispone de cifras exactas en la información proporcionada. Se recomienda consultar el reporte técnico para obtener los valores de HumanEval, MBPP, GSM8K y otros benchmarks del modelo base.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin contar overhead de KV cache):
  - f16: ~15.2 GB (requiere GPU con 16 GB o más, p.ej. RTX 4080/4090, A100)
  - Q8_0: ~8.1 GB (GPU con 10-12 GB, p.ej. RTX 3080/3090)
  - Q6_K: ~6.3 GB (GPU con 8 GB, p.ej. RTX 3070/4060)
  - Q4_K_M: ~4.7 GB (GPU con 6-8 GB, p.ej. RTX 3060, GTX 1080 Ti)
  - Q3_K_L: ~4.1 GB (GPU con 6 GB o incluso CPU con suficiente RAM)
- Para contexto de 32K, se necesita VRAM adicional para la caché KV (aprox. 1-2 GB dependiendo de la longitud real de la conversación).
- El modelo cabe en GPUs de consumo (RTX 3060 en adelante) con las cuantizaciones Q4 o inferiores. Para f16 se requiere hardware profesional o de gama alta.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio, Ollama, text-generation-webui, o cualquier runtime compatible con GGUF. También puede ejecutarse en CPU con suficiente RAM (16 GB para Q4_K_M).
- Latencia y throughput: no se han publicado mediciones específicas para esta cuantización. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 40-60 tokens/segundo, pero estos valores son estimaciones basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-abliterated (GGUF) | 7.6B | 32K | Apache-2.0 | GGUF | Sin censura, especializado en código |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | GGUF, safetensors | Modelo de Meta, con restricciones de uso |
| DeepSeek-Coder-7B-Instruct | 7B | 16K | MIT | safetensors, GGUF | Buen rendimiento en código, pero contexto menor |
| Qwen2.5-Coder-7B-Instruct (original) | 7.6B | 32K | Apache-2.0 | safetensors, GGUF | Con censura, misma base técnica |

La principal diferencia frente a alternativas es la eliminación de la censura (abliteration) y el contexto de 32K, que supera a CodeLlama y DeepSeek-Coder. La licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia de CodeLlama.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido dañino, ilegal, ofensivo o peligroso sin ningún filtro. Esto incluye código malicioso, instrucciones para actividades ilegales o discurso de odio. Su uso en producción debe estar estrictamente controlado y monitorizado.
- La técnica de ablación puede degradar ligeramente el rendimiento en tareas que dependen de la alineación, aunque en benchmarks de código se mantiene cercano al original.
- Solo soporta inglés. No se recomienda para tareas en otros idiomas.
- Riesgo de alucinación: como todos los modelos generativos, puede inventar APIs, funciones o comportamientos que no existen. Es necesario verificar el código generado.
- La cuantización introduce pérdida de precisión, especialmente en niveles bajos (Q3, Q4). Para tareas críticas se recomienda Q6_K o superior.
- El contexto de 32K es el máximo teórico; en la práctica, con cuantizaciones bajas, la calidad puede degradarse en secuencias muy largas.
- No se dispone de información sobre el dataset de entrenamiento de la versión abliterated ni sobre posibles sesgos adicionales introducidos por la técnica de ablación.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/zzzzdar3warfatf/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Reporte técnico Qwen2.5-Coder: https://arxiv.org/html/2409.12186v1
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Repositorio de cuantizaciones de bartowski (fuente original): https://huggingface.co/bartowski/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF
