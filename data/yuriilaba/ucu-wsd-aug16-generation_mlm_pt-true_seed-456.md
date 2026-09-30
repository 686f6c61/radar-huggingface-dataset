# yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-456

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-456` es un ajuste fino (fine-tuning) de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` orientado a la desambiguación del sentido de las palabras (word sense disambiguation, WSD) en ucraniano. Lo publica el usuario `yuriilaba` en HuggingFace, en el contexto de un repositorio académico (el prefijo "ucu" sugiere una institución universitaria) y forma parte de una familia de variantes con distintas configuraciones de pooling, semilla y esquema de muestreo.

El modelo no es un generador de texto: pese a la palabra "generation" en su identificador, se comporta como un encoder de frases que produce embeddings y puntuaciones de similitud semántica. Su problema objetivo es asignar el sentido correcto a una palabra polisémica dentro de una oración, una tarea clásica de PLN que resulta crítica en traducción automática, recuperación de información y anotación lingüística.

Con 278.043.648 parámetros (coincidentes con la arquitectura XLM-RoBERTa-base) y un tamaño de repositorio de 1,1 GB, es un modelo compacto que puede ejecutarse en hardware modesto. La model card reporta una precisión WSD de 0,9420 y correlaciones STS de Pearson 0,7967 y Spearman 0,7859, aunque no se documentan detalles sobre el dataset de evaluación ni sobre la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (via `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`; tag de HuggingFace: `xlm-roberta`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura base XLM-RoBERTa suele admitir 512 tokens, pero no se declara en la ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | ucraniano (según la model card); la metadata de HuggingFace no declara idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder de frases multilingüe que a su vez se apoya en la arquitectura XLM-RoBERTa-base (transformer encoder de 12 capas, 768 dimensiones ocultas y aproximadamente 278 M de parámetros). Sobre esa base se realiza un ajuste fino supervisado para la tarea de desambiguación léxica, empleando tripletas como señal de entrenamiento.

La configuración declarada en la model card indica: datos de entrenamiento en `local_datasets/semi_supervised_2/triplets/triplets_generation_mask_16_samples.csv`, pooling sobre el token objetivo activado (`target-token pooling: True`), semilla de entrenamiento 456 y semilla de partición de validación 42. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un encoder de este tipo). Tampoco se documenta ninguna innovación arquitectónica adicional más allá del esquema de pooling del token objetivo, que es la variante clave de esta familia de modelos.

## Capacidades

- Desambiguación del sentido de palabras (WSD) en ucraniano, con una precisión reportada de 0,9420.
- Generación de embeddings de frases y oraciones para similitud semántica (STS Pearson 0,7967; Spearman 0,7859).
- Representación de textos multilingües heredada del modelo base, aunque no se declara explícitamente el alcance idiomático.
- Soporte de comparación semántica entre pares de oraciones (útil para similitud, duplicados y clustering).
- Ajuste específico sobre el token objetivo, lo que permite ponderar de forma más precisa el sentido de una palabra concreta dentro de su contexto.
- No dispone de soporte declarado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento (thinking). Es un modelo de representación, no de generación.

## Casos de uso

- Desambiguación léxica en pipelines de PLN ucraniano: el modelo asigna el sentido correcto a palabras polisémicas en función del contexto, lo que mejora tareas posteriores como el análisis sintáctico o la extracción de entidades.
- Traducción automática asistida: al desambiguar previamente el sentido de una palabra, se puede reducir el error de traducción de términos polisémicos antes de pasarlos a un sistema de traducción.
- Recuperación semántica y búsqueda en ucraniano: sus embeddings permiten indexar documentos y consultas para motores de búsqueda que operen por significado y no por coincidencia exacta de términos.
- Detección de duplicados y contenido casi idéntico: mediante las puntuaciones de similitud STS, es adecuado para agrupar noticias, informes o entradas de usuario semánticamente equivalentes.
- Anotación automática de corpus lingüísticos: útil para etiquetar sentidos en corpus de investigación y entrenar a su vez modelos posteriores con datos etiquetados de forma semi-automática.
- Sistemas de recomendación basados en contenido: al vectorizar ítems textuales en ucraniano, se pueden calcular vecindades semánticas para sugerir artículos, documentos o productos similares.
- Clasificación temática y clustering de textos: los embeddings sirven como entrada a clasificadores ligeros para agrupar o etiquetar documentos por tema.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| Desambiguacion de sentido (WSD) | Accuracy | 0,9420152091254753 |
| Similitud semantica textual (STS) | Pearson | 0,7967202780929618 |
| Similitud semantica textual (STS) | Spearman | 0,7858853911889332 |

La model card indica que los resultados completos a nivel de tarea de MTEB están disponibles en `evaluation/mteb_results/` dentro del repositorio, pero no se incluyen en la información proporcionada. No se aportan resultados de MMLU, HumanEval ni GSM8K, ya que no son tareas aplicables a un encoder de representación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,1 GB; en fp16, unos 556 MB; en int8, unos 278 MB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Opciones de despliegue: dado que es un modelo de `sentence-transformers`, lo natural es desplegarlo con la librería `sentence-transformers`, `transformers` de HuggingFace, ONNX Runtime o FastAPI como servicio; no se documenta compatibilidad con vLLM, llama.cpp u Ollama (formatos GGUF no publicados).
- Latencia y throughput: no disponibles en la información proporcionada. Con 278 M de parámetros, en una GPU de consumo se pueden esperar codificaciones del orden de milisegundos por frase, pero se trata de una estimación no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-456` | 278 M | no disponible | WSD + embeddings ucraniano | no disponible | HuggingFace |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | ~278 M | 512 tokens (arquitectura) | Embeddings multilingues | Apache 2.0 (según origen) | HuggingFace |
| `xlm-roberta-base` | ~278 M | 512 tokens | Modelo base multilingue | MIT (según origen) | HuggingFace |
| `yuriilaba/ucu-wsd-generation_stochastic_pt-false_seed-456` | no disponible | no disponible | WSD ucraniano | no disponible | HuggingFace |

El modelo comparte arquitectura y tamaño con el base del que deriva, por lo que la diferencia principal radica en el ajuste fino para WSD en ucraniano. La variante `generation_stochastic_pt-false_seed-456` del mismo autor es la comparación más directa dentro de la propia familia, pero no se dispone de sus especificaciones detalladas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados en la metadata de HuggingFace: aunque la model card indica ucraniano, no se especifica el alcance idiomático real ni el comportamiento en otros idiomas.
- La evaluación se limita a WSD y STS; no hay resultados de MTEB visibles en la ficha ni datos sobre el conjunto de validación empleado.
- El dataset de entrenamiento es local (`local_datasets/semi_supervised_2/...`), por lo que no es reproducible ni auditable externamente.
- Riesgo de sesgo heredado del corpus de entrenamiento y del modelo base multilingüe, no cuantificado por el autor.
- Es un modelo de representación, no un generador de texto: no debe usarse para generación, diálogo ni razonamiento multi-paso.
- Posible sobreajuste al esquema de tripletas y al pooling del token objetivo, con generalización limitada a otras tareas.
- La tokenización de XLM-RoBERTa fragmenta con frecuencia el texto cirílico, lo que puede penalizar la calidad de las representaciones en ucraniano frente a modelos específicos.
- No se documentan límites de contexto efectivos ni comportamiento con secuencias largas.
- Ausencia de descargas y de validación comunitaria en el momento de la consulta: no hay evidencia externa de su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-456
- Variante relacionada: https://huggingface.co/yuriilaba/ucu-wsd-generation_mlm_pt-true_seed-456
- Variante relacionada: https://huggingface.co/yuriilaba/ucu-wsd-generation_stochastic_pt-false_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Repositorio de referencia de inferencia en el borde: https://github.com/ggml-org/
- Catalogo de modelos abiertos: https://huggingbay.xyz/
