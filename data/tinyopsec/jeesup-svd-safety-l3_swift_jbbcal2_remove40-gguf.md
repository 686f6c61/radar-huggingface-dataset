# tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF

## Resumen

Este repositorio contiene las cuantizaciones en formato GGUF del modelo `Jeesup/svd-safety-l3_swift_jbbcal2_remove40`, un checkpoint experimental de Llama-3-8B-Instruct comprimido mediante descomposición en valores singulares (SVD) al 60 % de sus parámetros densos, con recuperación posterior mediante LoRA. La cuantización ha sido generada con llama.cpp por el usuario tinyopsec.

Se trata de un artefacto de investigación: forma parte de un estudio sobre las concesiones entre compresión SVD y seguridad del modelo. El propio autor advierte en la model card que varias variantes de la rejilla experimental están deliberadamente degradadas en cuanto a seguridad, por lo que no debe utilizarse como asistente de propósito general sin una evaluación previa. Su relevancia reside en servir como material de estudio para investigadores que analizan cómo la compresión agresiva afecta al comportamiento de los modelos, más que como modelo de producción.

La base es Llama-3-8B-Instruct (arquitectura transformer densa de Meta), con unos 8.030 millones de parámetros tras la compresión, licencia Meta Llama 3 Community y distribución en trece niveles de cuantización, desde F16 hasta Q2_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3) comprimido con Swift-SVD y recuperación LoRA |
| Parametros totales | 8.030.261.248 (60 % de los parámetros densos del original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la base Llama-3-8B-Instruct usa 8.192 tokens, pero no está confirmado para esta variante) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es Llama-3-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parámetros de Meta. Sobre él se ha aplicado una compresión mediante Swift-SVD, una técnica de descomposición en valores singulares que reduce las matrices de pesos conservando el 60 % de los parámetros densos. Tras la compresión se empleó una recuperación mediante LoRA (Low-Rank Adaptation) para intentar restaurar parte de la capacidad perdida durante la reducción.

El sufijo del nombre (`jbbcal2_remove40`) sugiere que forma parte de una rejilla de experimentos en la que se eliminó un porcentaje de componentes y se evaluó el impacto en la seguridad del modelo. Según la model card, se trata de un artefacto de un estudio sobre concesiones entre compresión SVD y seguridad, y varias variantes están deliberadamente degradadas en ese aspecto. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en el proceso de recuperación LoRA.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct, aunque potencialmente degradada por la compresión y por las modificaciones deliberadas de seguridad.
- Compatibilidad con cualquier runtime que soporte GGUF: llama.cpp, Ollama, LM Studio, koboldcpp, etc.
- Trece niveles de cuantización que permiten ajustar el equilibrio entre calidad y consumo de memoria.
- No hay información disponible sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.
- El autor advierte explícitamente que no es un asistente de propósito general: las capacidades de seguridad están alteradas en algunas variantes de la rejilla experimental.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar cómo la SVD al 60 % de parámetros con recuperación LoRA afecta a la calidad de generación frente al modelo denso original.
- Estudio de degradación de seguridad: útil para analizar empíricamente cómo la compresión y la eliminación de componentes afectan a los guardrails de un modelo alineado.
- Benchmarking de runtimes GGUF: al ofrecer trece niveles de cuantización, sirve para medir rendimiento y consumo de memoria de llama.cpp, Ollama o koboldcpp en distintos escenarios de hardware.
- Experimentación en hardware limitado: la variante Q2_K o Q3_K permite ejecutar un modelo de 8B en equipos sin GPU dedicada, a costa de una pérdida de calidad adicional.
- Comparación de métodos de compresión: puede contrastarse con otras técnicas de pruning o destilación sobre la misma base Llama-3-8B-Instruct.
- Docencia y divulgación técnica: ejemplo práctico para ilustrar las concesiones entre tamaño, calidad y seguridad en la compresión de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que se trata de un artefacto de investigación con seguridad deliberadamente degradada, los resultados estándar (MMLU, HumanEval, GSM8K) del modelo base Llama-3-8B-Instruct no son directamente extrapolables a esta variante comprimida.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo F16 ocupa 16,1 GB; Q8_0 en torno a 8-9 GB; Q4_K_M (recomendado por el autor) en torno a 4,5-5 GB; Q2_K en torno a 2,5-3 GB. Aproximaciones basadas en el tamaño de los archivos; el repo completo pesa 77,6 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB basta para Q8_0; RTX 4090 (24 GB) ejecuta con holgura F16 o Q8_0 con contexto amplio. Para CPU pura, cualquier procesador moderno con 16 GB de RAM ejecuta las variantes Q4 y menores.
- Cabe en GPUs de consumo: sí, desde Q8_0 en GPUs de 12 GB hasta Q2_K en equipos solo con CPU y 8 GB de RAM.
- Despliegue: llama.cpp (método documentado en la model card), Ollama, LM Studio y koboldcpp, al tratarse de GGUF estándar. No hay información sobre soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Formato | Licencia |
|---|---|---|---|---|
| Jeesup/svd-safety-l3_swift_jbbcal2_remove40 (este) | 8,03 B (60 % del denso) | Swift-SVD + LoRA | GGUF (13 cuants) | Meta Llama 3 Community |
| Meta Llama-3-8B-Instruct | 8,03 B | Ninguna (denso) | safetensors, GGUF comunitario | Meta Llama 3 Community |
| PrunaAI / variantes SVD-LLM de 8B | Variable (~50-70 % del denso) | SVD | safetensors | Variable |

No hay datos de rendimiento comparativo publicados para este artefacto, por lo que la comparativa se limita a parámetros y formato. La diferencia clave frente a Llama-3-8B-Instruct original es la compresión al 60 % y la alteración deliberada de la seguridad.

## Limitaciones y advertencias

- Advertencia crítica del autor: es un artefacto de investigación con varias variantes deliberadamente degradadas en seguridad. No debe desplegarse en producción ni usarse como asistente general sin evaluación previa.
- Riesgo elevado de generar contenido que el modelo base rechazaría, debido a la degradación intencionada de los guardrails.
- La compresión SVD al 60 % de parámetros implica presumiblemente pérdida de calidad respecto al modelo denso, aunque no se han publicado métricas que lo cuantifiquen.
- Sesgos: no documentados; hereda presumiblemente los sesgos de Llama 3, potencialmente modificados por el proceso de compresión.
- Idiomas soportados: no disponibles; la base Llama 3 está optimizada principalmente para inglés.
- Longitud de contexto: no confirmada para esta variante.
- Licencia: el uso de este derivado está ligado a la Meta Llama 3 Community License del modelo original, con sus restricciones habituales (límite de 700 millones de usuarios mensuales, política de uso aceptable).
- Descargas y adopción muy limitadas (592 descargas y 1 like en el momento de la ficha), lo que implica poco escrutinio comunitario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove40
- Licencia Meta Llama 3 Community: https://llama.meta.com/llama3/license/
- No se han encontrado enlaces a papers, blogs, repos de código ni demos en la informacion disponible.
