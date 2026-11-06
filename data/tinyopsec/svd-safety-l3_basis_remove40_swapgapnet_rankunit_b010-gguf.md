# tinyopsec/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010-GGUF

## Resumen

`svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010-GGUF` es un derivado cuantizado de Llama-3-8B-Instruct publicado por el usuario tinyopsec en Hugging Face. Se trata de un artefacto de investigación resultante de aplicar dos técnicas sobre el modelo base de Meta: primero, compresión mediante Basis Sharing (método presentado en ICLR 2025 basado en SVD y compartición de bases entre capas) hasta el 60% de los parámetros densos originales; después, 10 rondas de edición iterativa de pesos con un procedimiento denominado swapgapnet_iter, descrito como paramétricamente neutro (no altera el número de parámetros).

El repo forma parte de un estudio sobre los compromisos entre compresión SVD y seguridad (safety) de los modelos. El propio autor advierte de forma explícita que varias variantes de la rejilla de experimentos están deliberadamente degradadas en cuanto a comportamiento seguro, y que el modelo no debe considerarse un asistente de propósito general. Esto lo convierte en un recurso útil para investigadores que analizan cómo la compresión agresiva afecta a los filtros de seguridad de un LLM, pero no para despliegue en producción.

La ficha de pesos original se basa en Meta-Llama-3-8B-Instruct (arquitectura transformer decoder-only de 8 mil millones de parámetros, 8.030.261.248 según los metadatos de safetensors). El repositorio GGUF pesa 77,6 GB en total y ofrece cuantizaciones desde Q2_K hasta F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con Basis Sharing (SVD) y editado con swapgapnet_iter |
| Parametros totales | 8.030.261.248 (modelo base; versión comprimida al 60% de parámetros densos según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de Llama 3 8B Instruct es 8.192 tokens, pero el autor no lo confirma para este derivado) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only de 8 mil millones de parámetros. Sobre él se ha aplicado Basis Sharing (ICLR 2025), una técnica de compresión que descompone las matrices de pesos mediante SVD y comparte las bases entre capas para reducir el modelo hasta el 60% de sus parámetros densos. El sufijo `remove40` del nombre sugiere la eliminación de componentes, aunque el autor no detalla el significado exacto de cada parámetro de la configuración.

Tras la compresión, el checkpoint se sometió a 10 rondas de edición iterativa `swapgapnet_iter`, descrita como "parameter-neutral swap": un proceso de intercambio de pesos que no modifica el recuento de parámetros. No hay información sobre entrenamiento adicional, número de tokens, datasets usados ni etapas de RLHF/DPO en esta versión; el ajuste por instrucciones procede del modelo base de Meta. El propósito declarado del trabajo es investigar las relaciones entre compresión SVD y degradación de la seguridad del modelo, por lo que algunas variantes de la serie están intencionadamente debilitadas en ese aspecto.

## Capacidades

- Generación de texto conversacional, heredada de Meta-Llama-3-8B-Instruct (etiqueta `conversational` y pipeline `text-generation`).
- Compresión experimental: sirve como sujeto de estudio para analizar cómo Basis Sharing y las ediciones swapgapnet afectan al comportamiento del modelo.
- Compatibilidad total con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y runtimes equivalentes.
- No hay información que confirme capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- El autor advierte que el comportamiento seguro del modelo puede estar degradado, por lo que sus capacidades prácticas como asistente no están garantizadas.

## Casos de uso

- Investigación en compresión de LLM: estudiar en qué medida Basis Sharing al 60% de parámetros preserva (o degrada) la calidad de generación respecto al modelo denso original, comparando cuantizaciones.
- Auditoría de seguridad de modelos comprimidos: evaluar cómo la compresión SVD y las ediciones iterativas afectan a los mecanismos de safety de un modelo alineado, un tema central del estudio del que procede este artefacto.
- Benchmarking de runtimes GGUF: probar rendimiento, throughput y consumo de llama.cpp, Ollama o koboldcpp con un modelo de 8B en distintas cuantizaciones (de Q2_K a F16).
- Experimentación local en hardware de consumo: ejecutar un derivado de Llama-3-8B en GPU doméstica o CPU gracias al formato GGUF, útil para pruebas offline.
- Comparación de efectos de cuantización: analizar cómo las cuantizaciones de 2 a 8 bits interactúan con un modelo previamente comprimido por SVD, un caso poco frecuente en repos públicos.
- Material docente: usar el modelo como ejemplo práctico en cursos o artículos sobre técnicas de compresión (SVD, basis sharing) y sus riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni evaluaciones de safety comparativas entre las variantes de la rejilla de experimentos.

## Requisitos de hardware

Estimaciones basadas en el tamaño de archivo de cada cuantización (el modelo base tiene 8.030 millones de parámetros; la versión comprimida al 60% puede ocupar menos, pero el autor no detalla los tamaños por archivo salvo F16):

- F16: unos 16,1 GB según la model card; requiere una GPU con más de 16 GB de VRAM (RTX 4090 de 24 GB, A100, o carga parcial en GPU + offload a CPU).
- Q8_0: aproximadamente 8-9 GB; cabe en una RTX 3090/4090 o en GPUs de 12 GB con ajustes.
- Q6_K: aproximadamente 6-7 GB; viable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070).
- Q4_K_M (cuantización recomendada por el autor): aproximadamente 4-5 GB; funciona en GPUs de 6-8 GB (RTX 3060 Ti, RTX 4060) e incluso en CPU con RAM suficiente.
- Q2_K: aproximadamente 2-3 GB; ejecutable en equipos muy modestos, con pérdida de calidad notable.
- Runtimes soportados: llama.cpp (comando de ejemplo en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- No hay datos publicados de latencia ni throughput para este derivado.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3 (este) | 8.030M base, comprimido al 60% | Basis Sharing + swapgapnet | no disponible | Llama 3 Community | GGUF publico (390 descargas) |
| Meta-Llama-3-8B-Instruct (base) | 8.030M | Ninguna (denso) | 8.192 tokens | Llama 3 Community | Pesos oficiales y multiples cuantizaciones |
| Llama-3-8B-Instruct (GGUF estandar, p. ej. quantizaciones comunitarias) | 8.030M | Solo cuantizacion post-entrenamiento | 8.192 tokens | Llama 3 Community | Ampliamente disponible, uso general |
| Sheared-LLaMA-2.7B (referencia de poda estructural) | 2.700M | Poda estructural + continued pretraining | 4.096 tokens | Apache 2.0 | Pesos abiertos, modelo general |

La diferencia clave es que este modelo es un artefacto experimental orientado al estudio de safety bajo compresión, mientras que las alternativas son modelos de propósito general. Para uso productivo, el checkpoint original de Meta es la opción recomendada.

## Limitaciones y advertencias

- El propio autor advierte que varias variantes de la serie están deliberadamente degradadas en seguridad; este checkpoint puede exhibir comportamientos no alineados y no debe usarse como asistente general sin evaluación previa.
- Riesgo de alucinación inherente a un modelo de 8B, agravado potencialmente por la compresión al 60% de parámetros y las 10 rondas de edición swapgapnet, cuyo impacto en calidad no está documentado con benchmarks.
- No hay datos de contexto, idiomas ni rendimiento publicados: cualquier despliegue requiere validación propia.
- La licencia Meta Llama 3 Community License impone condiciones de uso (atribución "Built with Meta Llama 3", restricciones para ciertos casos de uso y límites de usuarios mensuales para licencia comercial específica); este derivado hereda dichas restricciones.
- Es un artefacto de investigación con muy poca tracción (390 descargas, 0 likes), sin comunidad de mantenimiento aparente ni garantía de corrección de los archivos.
- La compresión Basis Sharing es una técnica reciente; su interacción con cuantizaciones agresivas (Q2_K, Q3_K) puede producir degradaciones no caracterizadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tinyopsec/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Checkpoint original comprimido y editado: https://huggingface.co/Jeesup/svd-safety-l3_basis_remove40_swapgapnet_rankunit_b010
- Licencia Meta Llama 3 Community License: https://llama.meta.com/llama3/license/
- Artículo de Basis Sharing (ICLR 2025): no disponible (no se proporciona enlace en la información del repositorio)
- llama.cpp: https://github.com/ggerganov/llama.cpp
