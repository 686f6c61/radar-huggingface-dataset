# wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-MC

## Resumen

Muse-Spark-Open-EXL3-K4-MC es una cuantización de 4 bits en formato EXL3 del modelo multimodal Muse-Spark-Open-816B-A42B, un transformer de tipo mixture-of-experts (MoE) con 816 mil millones de parámetros nominales y 42 mil millones activos por token. El autor del ensamblado es el usuario de Hugging Face `wrldsuksgo2mars`, que parte del checkpoint oficial `meta-models/Muse-Spark-Open-816B-A42B`. El paquete incluye vistas alternativas de los expertos en K8 y K6 (fichero `cuteafd-mc.json`) manteniendo compartidos los expertos, los módulos de media y los drafters del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización agresiva (4 bits) sobre un modelo de escala frontera con capacidades image-text-to-text, orientada a reducir el peso en disco y en memoria respecto al BF16 original. Por otro, el propio autor declara explícitamente que el ensamblado no reclama ninguna cualificación de calidad de generación ni de rendimiento en serving, y que las pruebas de bytes del núcleo original están en `package-validation.json`. Es, por tanto, un artefacto de empaquetado y cuantización, no un modelo nuevo entrenado.

El repo pesa 473,6 GB y los pesos en safetensors suman 228.975.372.160 parámetros reales, un dato coherente con un MoE de 816B nominales cuyos expertos se almacenan en formatos comprimidos. La licencia es la `muse-model-license` heredada del modelo base, con restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), cuantizado en EXL3 |
| Parámetros totales | 228.975.372.160 (pesos reales en safetensors); 816B nominales según el nombre del modelo base |
| Parámetros activos | 42B (según nomenclatura A42B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 4-bit; vistas alternativas K8 y K6 de los expertos |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (other) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Muse-Spark, con 816B parámetros nominales y 42B activos, capaz de procesar entradas image-text-to-text. Esta variante no introduce entrenamiento nuevo: es un ensamblado de cuantización EXL3 a 4 bits construido por `wrldsuksgo2mars` sobre el checkpoint `meta-models/Muse-Spark-Open-816B-A42B@0fb02478b02565b2ce7fc57e6051c91172774ac9`. El índice por defecto apunta al núcleo BF16 original, mientras que `cuteafd-mc.json` descubre vistas completas alternativas de los expertos en K8 y K6; los expertos, los módulos de media y los drafters se comparten entre vistas.

La model card no aporta información sobre el dataset de entrenamiento original (número de tokens, composición, fases de RLHF/DPO) ni sobre innovaciones arquitectónicas internas más allá de la naturaleza MoE y multimodal. Sí menciona un dataset propio del autor, `wrldsuksgo2mars/agentic-quant-panel-v1`, que parece asociado al proceso de cuantización y validación, no al entrenamiento del modelo base. El autor advierte que los diagnósticos del modelo padre describen la cuantización del padre, no el núcleo restaurado, y que no se reclama calidad de generación ni rendimiento de serving.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Muse-Spark-Open-816B-A42B.
- Procesamiento image-text-to-text: acepta imágenes junto con texto según el pipeline declarado en Hugging Face.
- Soporte de conversación multi-turno (tag `conversational`).
- Arquitectura MoE con 42B parámetros activos, lo que en teoría permite throughput de un modelo de ese tamaño con la capacidad de uno de 816B.
- Vistas de cuantización alternativas K8 y K6 sobre los mismos expertos, pensadas para distintos compromisos de precisión y memoria.
- Tool calling, function calling, capacidades de agente, modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema: el paquete permite estudiar el impacto de EXL3 4-bit y de las vistas K8/K6 sobre un MoE de escala frontera, comparando contra el núcleo BF16 original incluido en el índice por defecto.
- Despliegue con restricciones de memoria: al reducir el peso respecto al BF16, facilita servir un modelo de 816B nominales en nodos con menos VRAM por GPU, siempre que se validen las vistas K4/K6/K8 en el hardware objetivo.
- Evaluación de pipelines multimodales image-text-to-text: sirve como checkpoint de prueba para cadenas de inferencia que combinan visión y lenguaje en entornos de laboratorio.
- Reproducibilidad de artefactos de cuantización: `package-validation.json` y las pruebas de bytes del núcleo original permiten auditar la integridad del ensamblado antes de usarlo en experimentos.
- Benchmarking interno de serving: útil para medir latencia y throughput de EXL3 frente a otras cuantizaciones sobre el mismo modelo base, aunque el autor no publica cifras.
- Base para destilación o evaluación comparativa: al mantener compartidos expertos, media y drafters, permite aislar el efecto de la cuantización de expertos en estudios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el ensamblado no reclama ninguna cualificación de calidad de generación ni de rendimiento en serving.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repo ocupa 473,6 GB en disco y los pesos safetensors suman 228.975.372.160 parámetros; el peso en memoria dependerá de la vista (K4, K6, K8) y del runtime EXL3 empleado.
- GPU recomendadas: no disponibles en la información proporcionada. Por escala, un MoE de 816B nominales requiere nodos multi-GPU de clase数据中心 (A100/H100/H200) en la mayoría de configuraciones.
- ¿Cabe en GPU de consumo? No disponible; con 228,9B parámetros reales en 4 bits, el peso mínimo teórico ronda los 115 GB, muy por encima de una RTX 4090 (24 GB) o RTX 5090.
- Opciones de despliegue: no disponibles. El formato EXL3 requiere runtimes específicos (p. ej. ExLlamaV3); vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Spark-Open-EXL3-K4-MC (este) | 228,9B reales / 816B nominales | 42B | no disponible | muse-model-license | safetensors EXL3 4-bit |
| Muse-Spark-Open-816B-A42B (base) | 816B nominales | 42B | no disponible | muse-model-license | BF16 |
| Otras cuantizaciones del mismo base | no disponible | 42B | no disponible | muse-model-license | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de otras familias en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor no reclama calidad de generación ni rendimiento de serving; el artefacto es un ensamblado de cuantización, no un modelo validado para producción.
- Los diagnósticos del modelo padre describen la cuantización del padre, no el núcleo restaurado; no deben extrapolarse conclusiones de calidad a esta variante.
- La cuantización EXL3 4-bit puede degradar la precisión respecto al BF16 original; no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Licencia `muse-model-license` heredada del modelo base: es necesario revisar los términos del enlace de licencia antes de cualquier uso comercial o redistribución.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada.
- Riesgo de alucinación y sesgos: no evaluados en esta variante; deben asumirse los del modelo base, no documentados aquí.
- El tamaño (473,6 GB de repo) y los 228,9B parámetros reales implican requisitos de hardware muy elevados y posibles problemas de compatibilidad con runtimes que no soporten EXL3.
- El dataset `agentic-quant-panel-v1` está asociado al proceso de cuantización del autor; su naturaleza y composición no están detalladas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-MC
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia del modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/0fb02478b02565b2ce7fc57e6051c91172774ac9/LICENSE.md
- Dataset del autor: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Ficheros de validación del paquete: `package-validation.json`, `cuteafd-mc.json`, `README.parent.md` (incluidos en el repositorio)
