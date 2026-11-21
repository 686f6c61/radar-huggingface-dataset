# tinyopsec/Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF

## Resumen

Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF es una compilación de cuantizaciones GGUF del checkpoint de investigación `Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010`, un derivado de Llama-3-8B-Instruct al que se le ha aplicado una compresión por descomposición en valores singulares (SVD) que elimina aproximadamente el 70% de los parámetros densos. El autor del repositorio de cuantizaciones es `tinyopsec`, que publica los ficheros generados con llama.cpp a partir del checkpoint original de `Jeesup`.

El modelo no es un asistente de propósito general: la propia model card lo describe como un artefacto de investigación sobre el equilibrio entre compresión SVD y degradación de las salvaguardas de seguridad. Varias de las variantes del grid experimental están deliberadamente degradadas en seguridad, por lo que su uso en producción sin una evaluación previa es desaconsejado explícitamente por el autor.

El interés técnico reside en dos frentes: por un lado, sirve como banco de pruebas reproducible para estudiar cómo afecta la compresión agresiva de pesos a las capacidades del modelo y a su alineamiento; por otro, la disponibilidad de 13 cuantizaciones GGUF (desde F16 hasta Q2_K) permite analizar el impacto combinado de SVD y cuantización en un mismo checkpoint de 8.030 millones de parámetros con licencia Llama 3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con compresión SVD de pesos |
| Parámetros totales | 8.030.261.248 (checkpoint original en safetensors); ~70% de parámetros densos retenidos tras SVD |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (heredados de Llama 3, no declarados en la model card) |
| Licencia | Llama 3 Community License (Meta Llama 3) |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base está en safetensors |

## Arquitectura y entrenamiento

El checkpoint subyacente parte de Llama-3-8B-Instruct, un transformer decoder-only con atención causal estándar, y le aplica una compresión mediante descomposición en valores singulares que retiene el 70% de los parámetros densos. El nombre del checkpoint (`remove30_swapgapiter_evfront`) sugiere un pipeline iterativo de eliminación de componentes singulares con evaluación frontal, aunque la model card no documenta el procedimiento exacto, los datos de calibración ni el número de tokens utilizados en el proceso.

No se dispone de información sobre el dataset de entrenamiento, la composición de datos, ni sobre si hubo fases de RLHF o DPO posteriores a la compresión. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La model card únicamente indica que el artefacto proviene de un estudio sobre el compromiso entre compresión SVD y seguridad, y que varias ramas del grid experimental presentan salvaguardas degradadas de forma deliberada.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la degradación introducida por la compresión SVD.
- Capacidades multilingües potenciales derivadas de Llama 3, aunque no declaradas explícitamente en la model card.
- Compatibilidad con el ecosistema llama.cpp, Ollama, LM Studio y koboldcpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- El autor advierte que el modelo no está pensado como asistente de propósito general y que debe evaluarse antes de cualquier uso.

## Casos de uso

- Investigación sobre compresión de modelos: comparar las 13 cuantizaciones GGUF del mismo checkpoint SVD permite aislar el efecto de la precisión numérica frente al de la eliminación de componentes singulares en tareas estandarizadas.
- Estudio de degradación de alineamiento: el checkpoint original forma parte de un grid con ramas deliberadamente degradadas en seguridad, útil para analizar cómo la compresión afecta al rechazo de peticiones dañinas.
- Reproducibilidad de experimentos: el repositorio ofrece una cadena completa (safetensors base → GGUF) que facilita replicar mediciones en hardware diverso.
- Pruebas de pipelines de cuantización: validar el comportamiento de llama.cpp con las variantes K-quant y legacy (Q4_0, Q5_0) sobre un modelo de 8B comprimido.
- Evaluación de robustez en entornos de recursos limitados: las variantes Q3_K_S y Q2_K permiten medir la pérdida de calidad al reducir el peso por debajo de los 4 bits en un modelo ya comprimido.
- Docencia y formación técnica: ilustrar de forma práctica las diferencias entre cuantizaciones GGUF y los compromisos entre tamaño, velocidad y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ≈ 16,1 GB; Q8_0 ≈ 8,5 GB; Q6_K ≈ 6,6 GB; Q5_K_M ≈ 5,7 GB; Q4_K_M ≈ 4,9 GB; Q3_K_M ≈ 3,9 GB; Q2_K ≈ 3,0 GB (estimaciones a partir del tamaño del fichero F16 declarado y la proporción típica de bits por peso).
- GPU recomendadas: A100 40/80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q8_0 y Q6_K; RTX 4070 Ti / 4080 para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, desde Q4_K_M en tarjetas de 8 GB (con margen ajustado) y con holgura a partir de 12 GB para Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup-svd-safety-l3 (GGUF, este repo) | 8,03 B (70% densos tras SVD) | no disponible | Llama 3 | GGUF en Hugging Face | Artefacto de investigación con seguridad degradada en varias ramas |
| Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 | safetensors y GGUF comunitarios | Modelo base sin compresión; referencia de calidad |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 | safetensors y GGUF comunitarios | Sucesor con contexto extendido y tool calling nativo |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | safetensors y GGUF comunitarios | Alternativa permisiva para uso comercial |

## Limitaciones y advertencias

- La model card advierte explícitamente de que varias ramas del grid experimental están degradadas en seguridad de forma deliberada; el modelo no debe tratarse como un asistente alineado sin evaluación previa.
- La compresión SVD al 70% de parámetros densos implica una pérdida de capacidad no cuantificada en la documentación; no hay benchmarks que permitan estimar la degradación.
- Riesgo de alucinación heredado de Llama 3 y potencialmente amplificado por la compresión.
- No se documentan sesgos específicos, pero se heredan los del modelo base Llama-3-8B-Instruct.
- Longitud de contexto no declarada; no debe asumirse la ventana de 8.192 tokens de Llama 3 sin verificación empírica.
- Idiomas soportados no declarados; el comportamiento multilingüe puede verse afectado por la compresión.
- Licencia Llama 3 Community License: uso comercial permitido con condiciones (atribución "Built with Meta Llama 3", restricciones de uso aceptable y límite de 700 millones de usuarios mensuales para licenciatarios).
- El repositorio ocupa 77,6 GB, por lo que la descarga completa de todas las cuantizaciones requiere espacio considerable.
- Al ser un artefacto de investigación, no hay garantía de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_remove30_swapgapiter_evfront_b010-GGUF
- Checkpoint base: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30_swapgapiter_evfront_b010
- Llama 3 Community License: https://llama.meta.com/llama3/license/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
