# xhd521/LLMCPNER

## Resumen

LLMCPNER es un modelo de reconocimiento de entidades nombradas (NER) específico para literatura paleontológica en inglés, desarrollado por xhd521. Combina SciBERT (allenai/scibert_scivocab_uncased) como codificador base con una arquitectura de clasificación de spans, votación multi-modelo y aprendizaje curricular ponderado por confianza. El modelo está diseñado para extraer siete tipos de entidades paleontológicas: taxa, location, section, strata, lithology, facies y age.

La relevancia de este modelo radica en su enfoque especializado: la literatura paleontológica contiene terminología y estructuras de entidades muy particulares que los modelos NER genéricos no capturan bien. Al integrar técnicas de curriculum learning y weak supervision, LLMCPNER pretende mejorar la precisión en la extracción de información estructurada a partir de textos científicos, facilitando la construcción de bases de datos y recursos de conocimiento en paleontología.

El checkpoint se distribuye como un state dict de PyTorch con una arquitectura personalizada, no compatible directamente con `AutoModel.from_pretrained()`. El modelo fue evaluado en un conjunto de prueba corregido manualmente con 188 textos y 1.348 entidades, alcanzando un F1 estricto de 87,86 y un F1 parcial de 90,92.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Span-based NER sobre SciBERT (allenai/scibert_scivocab_uncased) con votación multi-modelo y curriculum learning |
| Parametros totales | no disponible (el modelo base SciBERT tiene ~110M, pero el checkpoint final no especifica el total) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye como state dict PyTorch) |
| Idiomas soportados | inglés (según el uso previsto declarado) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`) |

## Arquitectura y entrenamiento

LLMCPNER emplea una arquitectura de clasificación de spans (span-based) construida sobre SciBERT, un modelo BERT preentrenado con literatura científica. El sistema integra múltiples modelos (votación multi-modelo) para mejorar la robustez de las predicciones, y utiliza un esquema de curriculum learning con pesos basados en confianza para ordenar el entrenamiento de los ejemplos de menor a mayor dificultad. Además, incorpora técnicas de weak supervision para generar datos de entrenamiento adicionales.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. El autor indica que el modelo fue entrenado específicamente para NER en literatura paleontológica en inglés, y que el checkpoint corresponde al modelo final reportado en el manuscrito "LLMCPNER: Integrating Large Language Models and Curriculum Learning for Paleontological Named Entity Recognition" (actualmente en revisión).

## Capacidades

- Reconocimiento de entidades nombradas en textos paleontológicos en inglés, con siete tipos de entidades: `taxa`, `location`, `section`, `strata`, `lithology`, `facies` y `age`.
- Clasificación de spans con coincidencia estricta y parcial de límites y tipos de entidad.
- Extracción de información estructurada a partir de literatura científica paleontológica.
- No soporta generación de texto, razonamiento general, código, matemáticas, visión ni tool calling, al ser un modelo NER discriminativo.
- No se ha demostrado su rendimiento fuera del dominio paleontológico.

## Casos de uso

- Construcción de bases de datos paleontológicas: extraer automáticamente menciones de taxones, localidades, estratos y litologías de artículos científicos para poblar registros estructurados.
- Análisis bibliográfico de yacimientos: identificar secciones y facies en descripciones de campo para correlacionar estratigrafías.
- Revisión de literatura asistida: filtrar y clasificar artículos según las entidades paleontológicas que contienen, facilitando revisiones sistemáticas.
- Integración en pipelines de minería de textos: combinar con otros modelos para extraer relaciones entre taxones y edades geológicas.
- Generación de índices de contenido para revistas paleontológicas: etiquetar automáticamente los artículos con sus entidades principales.
- Apoyo a la anotación manual: pre-anotar textos con el modelo y corregir posteriormente, reduciendo el tiempo de anotación humana.

## Benchmarks y rendimiento

El modelo fue evaluado en un conjunto de prueba corregido manualmente con 188 textos y 1.348 entidades. Los resultados reportados son:

| Criterio de coincidencia | Precision | Recall | F1 |
| --- | ---: | ---: | ---: |
| Estricto | 88,19 | 87,54 | 87,86 |
| Parcial | 91,26 | 90,58 | 90,92 |

La coincidencia estricta requiere límites y tipo de entidad exactos; la parcial requiere al menos un 50% de solapamiento en los límites y el tipo correcto. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del modelo. Dado que el modelo base es SciBERT (aproximadamente 110 millones de parámetros), es plausible que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero no se dispone de datos confirmados sobre VRAM, GPUs recomendadas, latencia o throughput. El checkpoint se distribuye como state dict de PyTorch, por lo que requiere una implementación personalizada de la arquitectura para su carga; no es compatible con frameworks de inferencia estándar como vLLM, llama.cpp u Ollama sin adaptación previa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han publicado comparativas con otros modelos NER paleontológicos o genéricos.

## Limitaciones y advertencias

- El rendimiento solo está establecido para literatura paleontológica en inglés; fuera de este dominio no se ha evaluado.
- El modelo no es un drop-in de `AutoModel.from_pretrained()`; requiere el código de implementación específico del repositorio asociado.
- Las predicciones deben revisarse antes de su uso en bases de datos científicas o recursos de conocimiento, según indica el autor.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con weak supervision, puede heredar errores de las etiquetas generadas automáticamente.
- La licencia MIT permite uso comercial, pero el autor no garantiza la precisión ni la idoneidad para aplicaciones críticas.
- No se proporcionan detalles sobre el contexto máximo soportado ni sobre el manejo de textos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xhd521/LLMCPNER
- Repositorio de código (implementación y test set): https://github.com/goodXHD/LLMCPNER-Integrating-Large-Language-Models-and-Curriculum-Learning-for-Paleontological-Named-Entity
