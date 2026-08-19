# tmy100000001/LitDD_BERT

## Resumen

LitDD_BERT es un modelo de lenguaje basado en la arquitectura BERT, publicado por Michael Yates (usuario `tmy100000001`) bajo licencia Apache 2.0. Aunque la model card no incluye descripción, el nombre y el contexto del repositorio asociado (`biomedicalinformaticsgroup/LitDD_mining`) indican que se trata de un clasificador fine-tuned para la minería de literatura biomédica, concretamente para identificar publicaciones de PubMed relevantes a registros Gene2Phenotype (G2P) de enfermedades del desarrollo. El modelo cuenta con 395,8 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 3,2 GB.

La relevancia de este modelo radica en su aplicación práctica dentro de un pipeline automatizado que combina clasificación con BERT, re-ranking con cross-encoder y asignación final mediante un LLM. Aunque no se han publicado detalles sobre el entrenamiento o los datos utilizados, su integración en un flujo de trabajo de minería de literatura sugiere que está optimizado para clasificación de abstracts científicos. El tag `modernbert` apunta a que podría estar basado en la arquitectura ModernBERT, aunque no se confirma explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (posiblemente ModernBERT, según tag) |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente inglés, por el dominio biomédico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El tag `modernbert` sugiere que podría tratarse de una variante de ModernBERT, una evolución del BERT original con mejoras en eficiencia y capacidad de contexto. Sin embargo, no se confirma ni el número de capas, ni la dimensión de los embeddings, ni el tipo de atención. El tamaño de 395M parámetros es consistente con la variante ModernBERT-base (395M), aunque también podría ser un BERT grande adaptado.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados, ni el uso de técnicas como MLM (modelado de lenguaje enmascarado) o fine-tuning supervisado. El contexto del pipeline LitDD_mining indica que el modelo fue fine-tuned para clasificación de abstracts de PubMed, probablemente con etiquetas binarias (relevante/no relevante) para enfermedades del desarrollo. No hay evidencia de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Clasificación de abstracts biomédicos: el modelo está diseñado para determinar si un artículo de PubMed es relevante para registros Gene2Phenotype de enfermedades del desarrollo.
- Procesamiento de texto científico: al ser un BERT fine-tuned, es capaz de entender vocabulario técnico y relaciones semánticas en dominios especializados.
- Integración en pipelines de minería de literatura: puede actuar como primer filtro en un flujo automatizado, como se describe en el repositorio LitDD_mining.
- No se han documentado capacidades de generación de texto, razonamiento, tool calling, ni soporte multimodal.

## Casos de uso

- Minería de literatura biomédica: el modelo puede utilizarse para filtrar grandes volúmenes de abstracts de PubMed y preseleccionar aquellos que mencionan genes asociados a enfermedades del desarrollo. En el pipeline de LitDD_mining, actúa como clasificador inicial antes de un cross-encoder y un LLM.
- Actualización de bases de datos G2P: permite automatizar la revisión de nuevas publicaciones para mantener al día los registros de asociaciones genotipo-fenotipo, reduciendo el trabajo manual de curadores.
- Búsqueda semántica en repositorios científicos: al ser un encoder BERT, puede generar embeddings de abstracts para búsquedas por similitud, aunque no se ha confirmado su uso en este sentido.
- Detección de evidencia en ensayos clínicos: podría adaptarse para clasificar documentos sobre ensayos de terapias génicas o farmacológicas relacionadas con enfermedades del desarrollo.
- Sistemas de recomendación de literatura: integrado en plataformas de revisión bibliográfica, puede priorizar artículos relevantes para investigadores en genética médica.
- Automatización de revisiones sistemáticas: en combinación con otras herramientas, ayuda a cribar estudios primarios para meta-análisis sobre trastornos del desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall, F1, ni comparaciones con otros modelos en tareas de clasificación biomédica.

## Requisitos de hardware

- VRAM estimada: con 395M parámetros, en FP32 se necesitan aproximadamente 1,6 GB de VRAM; en FP16, unos 0,8 GB. El tamaño del repositorio (3,2 GB) sugiere que los pesos están almacenados en FP32 o con algún formato adicional, pero la inferencia puede realizarse en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1060, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para fine-tuning, se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: puede cargarse con la librería `transformers` de Hugging Face, o servirse con herramientas como vLLM, Text Generation Inference (TGI) u Ollama si se convierte a formato GGUF. Al ser un modelo BERT (encoder), no es adecuado para generación de texto, por lo que vLLM no es la opción más natural; se recomienda usar `transformers` o `sentence-transformers` para embeddings.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un BERT de 395M parámetros procesa alrededor de 200-400 secuencias por segundo en una GPU A100, dependiendo de la longitud.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Los modelos comparables serían otros BERT fine-tuned para clasificación biomédica, como BioBERT, PubMedBERT o BlueBERT, pero no se han encontrado datos sobre su rendimiento relativo. El tamaño de LitDD_BERT (395M) es mayor que BERT-base (110M) y comparable a BERT-large (340M), pero no se conocen sus métricas específicas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado probablemente con literatura biomédica en inglés, puede presentar sesgos hacia terminología anglosajona y descuidar publicaciones en otros idiomas.
- Riesgo de alucinación: como clasificador, no genera texto, por lo que el riesgo de alucinación es bajo, pero la clasificación errónea de abstracts puede propagar errores en el pipeline posterior.
- Limitaciones de contexto: la longitud de contexto no está documentada. Si se basa en BERT original, el límite es de 512 tokens, lo que puede ser insuficiente para abstracts largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright.
- Caveat de producción: al no existir documentación sobre el entrenamiento ni evaluación, no se recomienda su uso en entornos clínicos o de toma de decisiones sin una validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmy100000001/LitDD_BERT
- Perfil del autor: https://huggingface.co/tmy100000001
- Repositorio del pipeline LitDD_mining: https://github.com/biomedicalinformaticsgroup/LitDD_mining
- Referencia general sobre BERT: https://en.wikipedia.org/wiki/BERT_(language_model)
