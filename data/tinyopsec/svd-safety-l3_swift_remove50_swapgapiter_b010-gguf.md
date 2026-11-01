# tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF

## Resumen

`svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF` es un artefacto de investigación publicado por el usuario tinyopsec en Hugging Face. Se trata de una cuantización en formato GGUF del checkpoint `Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010`, una versión comprimida mediante Swift-SVD de Meta-Llama-3-8B-Instruct que conserva el 50% de los parámetros densos, con recuperación vía LoRA y 10 rondas de edición iterativa "parameter-neutral swap" (gap_iter). El modelo forma parte de un estudio sobre los compromisos entre compresión SVD y alineación de seguridad.

Su relevancia no radica en ser un asistente de propósito general, sino en servir como material de análisis para investigadores que estudian cómo la compresión agresiva y las ediciones de pesos afectan a los comportamientos de seguridad de un modelo. La propia model card advierte que varias variantes de la rejilla de experimentos están deliberadamente degradadas en seguridad y que debe evaluarse antes de cualquier uso.

La arquitectura base es la de Llama 3 (transformer denso) con 8.030.261.248 parámetros en la versión original en safetensors, aunque esta versión comprimida retiene aproximadamente la mitad de los parámetros densos. El contexto y el rendimiento exacto tras la compresión no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3) comprimido con Swift-SVD + recuperación LoRA |
| Parametros totales | 8.030.261.248 (modelo base en safetensors); la versión comprimida retiene el 50% de los parámetros densos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada presumiblemente de Llama 3 8B Instruct, 8.192 tokens, pero no confirmada para esta variante) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el modelo base Llama 3 cubre oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF (producido con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8 mil millones de parámetros. Sobre esa base se aplica una compresión Swift-SVD (descomposición en valores singulares) que reduce el modelo al 50% de sus parámetros densos, seguida de una recuperación mediante LoRA para restaurar parte de la capacidad perdida. Posteriormente se ejecutan 10 rondas de edición iterativa de pesos denominada "parameter-neutral swap" (gap_iter), un procedimiento que intercambia parámetros sin alterar el recuento total.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre procesos de RLHF/DPO adicionales aplicados a esta variante: el único entrenamiento documentado es la propia compresión y edición. El nombre del repositorio y las etiquetas ("safety", "compression") indican que el objetivo del trabajo es estudiar cómo estas transformaciones afectan a los comportamientos de seguridad del modelo original, no mejorar su rendimiento general.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, presumiblemente degradada por la compresión al 50% de parámetros.
- Compatibilidad total con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible.
- Disponibilidad de 13 niveles de cuantización, desde F16 hasta Q2_K, para ajustarse a distintas memorias.
- Utilidad como sujeto de experimentación para estudios de compresión SVD, ablación de seguridad y análisis de robustez de alineación.
- No hay datos que respalden capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- La model card advierte explícitamente que no es un asistente de propósito general.

## Casos de uso

- Investigación en compresión de LLMs: sirve como caso de estudio real de Swift-SVD al 50% de parámetros con recuperación LoRA, útil para comparar degradación de calidad frente a otras técnicas de pruning o destilación.
- Estudios de seguridad y alineación: al estar deliberadamente degradado en seguridad en algunas variantes, permite a investigadores analizar cómo la compresión y las ediciones de pesos erosionan los guardrails de un modelo alineado.
- Evaluación de robustez de cuantización: con 13 niveles de cuantización disponibles, es adecuado para medir cómo la compresión SVD interactúa con la cuantización posterior (Q2_K a F16).
- Pruebas de regresión en pipelines de inferencia local: puede integrarse en benchmarks automatizados con llama.cpp para verificar el comportamiento de runtimes GGUF con modelos no estándar.
- Análisis forense de pesos: las ediciones "gap_iter" ofrecen material para técnicas de interpretabilidad que localizan qué componentes codifican comportamientos de rechazo.
- Comparativas educativas: útil como ejemplo en materiales docentes sobre los riesgos de usar derivados comprimidos o editados de modelos abiertos sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero puede estimarse a partir del tamaño de los ficheros GGUF: Q4_K_M requiere en torno a 5-6 GB (aproximadamente la mitad de un Q4_K_M estándar de 8B, que suele ocupar ~4,9 GB; al conservar el 50% de parámetros densos más LoRA, el consumo será inferior), Q8_0 en torno a 9-10 GB y F16 unos 16,1 GB según el listado del repositorio.
- GPU recomendadas: para las cuantizaciones bajas (Q4 y menores), cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090) debería ser suficiente. Para F16, una GPU con 24 GB (RTX 3090/4090) o una A100.
- Cabe holgadamente en GPUs de consumo con las cuantizaciones Q2_K a Q5; incluso es probable que funcione en CPU con RAM moderada dada la compresión al 50%.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama, LM Studio y koboldcpp, además de cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Al retener el 50% de los parámetros densos, la velocidad de inferencia debería ser superior a la del modelo 8B original, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF | 8.030.261.248 (base); 50% de densos retenidos | Swift-SVD + LoRA + 10 rondas gap_iter | No disponible | Llama 3 Community | GGUF público, 13 cuantizaciones |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | Sin compresion | 8.192 tokens | Llama 3 Community | Safetensors y multiples cuantizaciones comunitarias |
| PrunaAI o derivados comprimidos de Llama 3 8B | Variable | Pruning/destilacion (segun variante) | Variable | Llama 3 Community | Publicados en Hugging Face |

La diferencia clave frente al modelo base es que esta variante sacrifica capacidad y seguridad documentadas a cambio de un tamaño reducido, y su propósito es experimental, no productivo.

## Limitaciones y advertencias

- Degradación deliberada de seguridad: la model card indica que varias variantes de la rejilla experimental están "deliberadamente safety-degraded". Este modelo puede producir contenidos que el modelo base rechazaría, sin filtros de alineación fiables.
- No es un asistente de propósito general: la propia model card lo advierte explícitamente y recomienda evaluar antes de usar.
- Riesgo de alucinación elevado: la compresión al 50% de parámetros densos más las ediciones iterativas de pesos no están acompañadas de evaluaciones publicadas de calidad, por lo que la fiabilidad factual es desconocida y presumiblemente inferior al original.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval ni ninguna otra métrica para esta variante concreta.
- Contexto no confirmado: la ventana de contexto efectiva tras la compresión no está documentada.
- Restricciones de licencia: al ser un derivado de Llama 3, queda vinculado a la Meta Llama 3 Community License, con sus condiciones de uso comercial y su política de marca aceptable de uso.
- Procedencia comunitaria: publicado por un usuario individual (tinyopsec) con 393 descargas y sin verificación de terceros, lo que exige auditoría propia antes de cualquier despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Checkpoint original comprimido: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010 (deducido de la model card; no se ha verificado su disponibilidad)
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la información disponible.
