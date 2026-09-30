# yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-42

## Resumen

Este modelo es un ajuste fino (fine-tuning) de tipo sentence transformer orientado a la desambiguación del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. Lo publica el investigador Yurii Laba bajo el identificador `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-42`, dentro de una familia de variantes experimentales que comparten configuración de entrenamiento y solo se diferencian en el pooling del token objetivo, el conjunto de datos y la semilla.

El modelo parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un sentence transformer multilingüe basado en la arquitectura XLM-RoBERTa, y se entrena sobre tripletas almacenadas en `local_datasets/semi_supervised_2/triplets/triplets_generation_mask_16_samples.csv`. La configuración concreta de esta variante usa `target-token pooling: False` y semilla 42 tanto para el entrenamiento como para el split de validación.

Su relevancia es acotada pero específica: cubre un hueco poco atendido como es el procesamiento léxico del ucraniano con métricas verificables (WSD accuracy de 0,9182 y correlaciones STS de Pearson 0,8088 / Spearman 0,7980). Se trata de un modelo de investigación, con 278.043.648 parámetros, publicado sin licencia declarada, sin pipeline asignado y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), heredada del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base admite 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible en la model card; el ajuste se realiza sobre ucraniano y el modelo base es multilingüe (mas de 50 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer XLM-RoBERTa de 278 M de parámetros, reutilizado como sentence transformer mediante la librería `sentence-transformers`. El ajuste se realiza sobre tripletas (anclaje, positivo, negativo) generadas de forma semiautomática, lo que sitúa el entrenamiento en un régimen de aprendizaje por contraste con supervisión parcial. La model card indica explícitamente que el pooling sobre el token objetivo está desactivado (`target-token pooling: False`) y fija la semilla 42 para el entrenamiento y para el split de validación.

No se documentan en la información disponible ni el número total de tokens de entrenamiento, ni la composición detallada del corpus, ni si se aplicaron fases de RLHF o DPO (esto último sería poco habitual en un encoder de este tipo). Tampoco se detallan innovaciones técnicas adicionales más allá de la variante de pooling y la estrategia semisupervisada. La carpeta `evaluation/mteb_results/` del repositorio contiene resultados completos a nivel de tarea de MTEB, aunque su contenido no se ha facilitado en esta ficha.

## Capacidades

- Generación de representaciones vectoriales (embeddings) de oraciones y fragmentos de texto mediante un encoder transformer.
- Desambiguación del sentido de las palabras (WSD) en ucraniano, con una precisión reportada de 0,9182.
- Similitud semántica textual (STS), con correlaciones de Pearson 0,8088 y Spearman 0,7980.
- Recuperación semántica y ranking por similitud coseno entre pares de textos.
- Compatible con el ecosistema `sentence-transformers` y con tareas evaluables mediante MTEB.
- Soporte multilingüe heredado del modelo base, aunque el ajuste está orientado al ucraniano.
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre, ni código, ni resolución de problemas matemáticos.

## Casos de uso

- Desambiguación léxica en pipelines de PLN ucraniano: el modelo puede asignar el sentido correcto a una palabra polisémica dentro de una oración, integrándose como componente de un analizador morfosintáctico o de un sistema de anotación semántica.
- Búsqueda semántica sobre corpus en ucraniano: al generar embeddings de oraciones, permite construir índices vectoriales para motores de recuperación que operen por significado y no por coincidencia literal de términos.
- Deduplicación y agrupamiento de documentos: el cálculo de similitud entre embeddings permite detectar textos casi idénticos o agrupar noticias, informes o cláusulas por temática.
- Evaluación de traducción automática y paráfrasis: las métricas STS del modelo lo hacen adecuado para medir la similitud semántica entre una traducción y su referencia en ucraniano.
- Construcción y enriquecimiento de léxicos y wordnets: sirve como componente de anotación asistida para asignar sentidos a ejemplos de uso extraídos de corpus, acelerando el trabajo de lexicógrafos.
- Sistemas de recomendación de contenido textual: la representación vectorial permite ordenar artículos, documentos o respuestas por proximidad semántica al perfil del usuario.
- Clasificación y enrutado semántico: los embeddings pueden alimentar clasificadores ligeros (regresión logística, SVM) para categorizar tickets, correos o incidencias por temática.
- Investigación comparativa multilingüe: al derivar de un modelo multilingüe, permite estudiar la transferencia de capacidades léxicas entre ucraniano y otros idiomas dentro de un mismo espacio de representación.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| WSD (desambiguacion del sentido de las palabras) | Accuracy | 0,9182509505703422 |
| STS (similitud semantica textual) | Pearson | 0,8087813601034243 |
| STS (similitud semantica textual) | Spearman | 0,7979795658156288 |

La model card indica que los resultados completos a nivel de tarea de MTEB están en `evaluation/mteb_results/`, pero no se han facilitado esos datos. No se han publicado en la información disponible tablas comparativas con otros modelos para estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en precisión FP32 (coincide con el tamaño del repositorio); alrededor de 0,6 GB si se convierte a FP16.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna de gama media o superior.
- Ejecución en CPU: viable para lotes pequeños o moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `sentence-transformers` (vía Hugging Face Transformers o SentenceTransformer), `transformers` con PyTorch, y exportación a ONNX u otros formatos compatibles con librerías de vectorización. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-42` | 278.043.648 | no disponible | WSD acc. 0,9182; STS Pearson 0,8088 | no disponible | Hugging Face, 0 descargas |
| `yuriilaba/ucu-wsd-generation_mlm_pt-true_seed-42` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-42` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (modelo base) | 278.043.648 | 512 tokens | no disponible en esta ficha | Apache-2.0 (segun el modelo base) | Hugging Face |

Las tres variantes del mismo autor comparten la misma familia experimental, pero no se han facilitado sus parámetros ni sus métricas, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Se trata de un modelo de investigación con 0 descargas y 0 likes, sin pipeline asignado y sin licencia declarada, lo que impide confirmar condiciones de uso comercial.
- La licencia no está especificada en la model card ni en los metadatos del repositorio: no debe asumirse que sea reutilizable en producción sin consultar al autor.
- No es un modelo generativo: no puede usarse para chat, generación de texto, escritura de código ni razonamiento en lenguaje natural.
- El ajuste está especializado en ucraniano; su comportamiento en otros idiomas, aunque el modelo base sea multilingüe, no está documentado.
- La longitud de contexto no se declara en la model card; el límite práctico viene del modelo base (512 tokens), lo que restringe su uso en documentos largos sin truncado o segmentación previa.
- El entrenamiento usa tripletas generadas de forma semiautomática, lo que puede introducir sesgos derivados de la plantilla de generación y del corpus de origen.
- Al ser un modelo de embeddings y desambiguación, el riesgo de alucinación en el sentido generativo no aplica; sí existe riesgo de asignación incorrecta de sentido en casos ambiguos o de baja frecuencia.
- El repositorio está fechado en 2026-09-30 y no se documenta proceso de revisión por pares ni validación externa, más allá de las métricas internas reportadas por el autor.
- No se dispone de información sobre sesgos demográficos, dialectales ni de dominio en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-42
- Variante con pooling del token objetivo activado: https://huggingface.co/yuriilaba/ucu-wsd-generation_mlm_pt-true_seed-42
- Variante con todos los conjuntos combinados: https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-42
- Pagina personal del autor: https://yuriilaba.github.io/
- Perfil del autor en ACL Anthology: https://aclanthology.org/people/yurii-laba/
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
