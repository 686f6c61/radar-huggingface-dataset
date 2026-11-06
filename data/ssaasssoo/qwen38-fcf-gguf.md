# ssaasssoo/qwen38-fcf-gguf

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de tipo multi-etapa y multi-merge sobre la familia Qwen 3.8, publicado por el usuario ssaasssoo (a partir del trabajo previo de DavidAU) en formato GGUF. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y se distribuye con cuantizaciones tanto "regulares" como MTP (Multi-Token Prediction), generadas con doble imatrix (DI-MATRIX). Su pipeline declarado es image-text-to-text, aunque la model card se centra en generación de texto, razonamiento, código y escritura creativa.

El objetivo declarado del autor es reducir drásticamente los tokens de "pensamiento" (entre la mitad y hasta una décima parte respecto a Qwen 3.8 estándar), manteniendo o mejorando la calidad de salida, y elevar los benchmarks ARC-C y ARC-E. La model card afirma superar los 730 puntos en ARC-C en 8 bits (735) y 719 en 4 bits, además de superar a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos. Estas cifras provienen exclusivamente de la documentación del autor y no se han verificado de forma independiente.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 27B) según los safetensors del repo base, licencia Apache 2.0, y está etiquetado como "heretic", "uncensored" y "abliterated", lo que implica que se han eliminado o atenuado los mecanismos de rechazo del modelo original. El repositorio ocupa 389 GB e incluye múltiples variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8), con modo thinking; detalles exactos de capas y atención no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles: cuantizaciones "regulares" y MTP (Multi-Token Prediction), con doble imatrix (DI-MATRIX); se mencionan Q4KS, 4 bits y 8 bits en la model card; lista completa de niveles no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con safetensors en el modelo base; este repo distribuye GGUF) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer decoder-only de la familia Qwen 3.8, sometido a un proceso de fine-tune multi-etapa y multi-merge. El autor describe dos metodologías propias: "COLD FUSION" (combinación de un componente llamado GAIN con los entrenadores de Unsloth) y "Fable Fusion 711". El método GAIN, según la model card, modifica dinámicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; solo se referencian los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`.

El modelo se entrenó con Unsloth y se distribuye con cuantizaciones que emplean doble imatrix (DI-MATRIX) y variantes MTP (Multi-Token Prediction) orientadas a acelerar la generación. La model card menciona tres modos de operación (presumiblemente modos de thinking) y afirma que la reducción de tokens de razonamiento se aplica a los tres. No se detallan innovaciones como atención lineal o decodificación especulativa más allá del MTP. Las afirmaciones sobre benchmarks y metodología provienen únicamente del autor y no cuentan con verificación independiente en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de alta elaboración, con modo thinking y razonamiento explícito.
- Razonamiento multi-paso y resolución de problemas, con reducción declarada de tokens de pensamiento (de 1/2 a 1/10 respecto a Qwen 3.8).
- Generación de código y tareas de programación (etiqueta "coder", NEO-CODER en el nombre).
- Escritura creativa en múltiples géneros: ficción, relatos, roleplaying y escritura de historias.
- Capacidad multimodal declarada por el pipeline image-text-to-text (entrada de imagen y texto); no se detallan las capacidades de visión en la model card.
- Soporte multilingüe limitado a inglés y chino según los metadatos.
- Modelo "uncensored"/"abliterated": no aplica rechazos habituales de contenido.
- Tool calling: la model card menciona en la pestaña "community" un rendimiento "strongest tool calling performance ever recorded", pero no se aportan datos verificables en la información disponible.
- Compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Escritura creativa y ficción: el modelo está afinado específicamente para narrativa, relatos y roleplaying; su modo thinking reducido permite generar borradores largos con menos latencia que el modelo base, adecuado para talleres literarios o generación de contenido editorial.
- Asistente de código en local: con cuantización Q4 o Q5 en GGUF puede ejecutarse en hardware de consumo y emplearse en autocompletado, generación de funciones y revisión de código dentro de editores o pipelines locales.
- Razonamiento con presupuesto de tokens ajustado: al reducir los tokens de pensamiento entre 2 y 10 veces, encaja en aplicaciones donde el coste por consulta o la latencia importan, como agentes conversacionales o clasificación con justificación.
- Roleplaying y chatbots de personaje: la ausencia de rechazos y la orientación a ficción lo hacen utilizable en plataformas de rol conversacional, siempre que se gestionen los riesgos de contenido.
- Generación de documentación técnica y resúmenes: su capacidad de razonamiento y contexto conversacional permite resumir documentos largos y redactar documentación, aunque el contexto máximo no está documentado.
- Experimentación e investigación sobre fine-tunes: al ser un GGUF con licencia Apache 2.0 y múltiples cuantizaciones, sirve como base para estudiar técnicas de merging, abliteration y reducción de tokens de razonamiento en entornos de investigación con hardware limitado.
- Despliegue en local con Ollama o llama.cpp: al distribuirse en GGUF, puede integrarse en flujos de trabajo de escritorio o servidores pequeños sin GPU de datacenter.

## Benchmarks y rendimiento

La model card afirma resultados en ARC-C y ARC-E, pero no presenta una tabla completa de benchmarks con cifras por prueba. Los únicos datos numéricos explícitos son:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; 144 puntos por encima de Qwen 3.8 27B según la model card |
| ARC-C (4 bits) | 719 | Afirmado por el autor |
| ARC-E (8 bits) | >880 | Afirmado por el autor |
| Comparativa con Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Superior en "7 benchmarks críticos" | Sin cifras por benchmark en la información disponible |

No se han publicado en la información disponible resultados verificables de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido contrastadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: para ~27B parámetros, una cuantización Q4 requiere aproximadamente 15-17 GB de VRAM; Q5 en torno a 18-20 GB; Q8 en torno a 28-30 GB. Son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: para Q8, una A100 40 GB, H100 o RTX 6000 Ada; para Q4/Q5, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB probablemente solo con cuantizaciones más agresivas (Q3 o inferiores), no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. No se confirma soporte de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles. El autor afirma que las variantes MTP aceleran la generación de tokens, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (ssaasssoo/qwen38-fcf-gguf) | ~27B | no disponible | Apache 2.0 | GGUF | Fine-tune uncensored con reducción de thinking tokens |
| Qwen 3.8 27B (base) | ~27B | no disponible | no disponible en la información | safetensors/GGUF | Referencia del autor; según la model card, este fine-tune lo supera en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | no disponible en la información | no disponible | Citado como comparación por el autor |
| Qwen 3.6-35B-A3B | 35B totales, 3B activos (MoE) | no disponible | no disponible en la información | no disponible | Citado como comparación por el autor |

No se dispone de datos verificables de benchmarks ni de contexto para establecer una comparación cuantitativa fiable con alternativas. La comparación se limita a lo que el autor declara.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se han eliminado o reducido los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de ~27B, agravado por el fine-tune agresivo y la falta de evaluación independiente.
- Las afirmaciones de benchmarks (ARC-C 735, ARC-E >880, superioridad en 7 benchmarks) proceden solo del autor y no están verificadas; deben tratarse con escepticismo.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado y los posibles sesgos del fine-tune son responsabilidad del usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validación comunitaria.
- El pipeline declarado es image-text-to-text, pero no se documentan capacidades de visión; no asumir multimodalidad sin pruebas.
- El tamaño del repo (389 GB) implica que la descarga completa es costosa; conviene seleccionar solo la cuantización necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/ssaasssoo/qwen38-fcf-gguf
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia de la técnica COLD FUSION (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
