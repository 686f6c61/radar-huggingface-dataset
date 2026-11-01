# SusanSari/clasificador-titulares-elcomercio

## Resumen

El clasificador de titulares de El Comercio es un modelo de clasificación de texto en español desarrollado por SusanSari como trabajo académico del Diplomado 2026. Se trata de un ajuste fino (fine-tuning) del modelo `distilbert-base-multilingual-cased` de Hugging Face, orientado a asignar titulares de noticias del diario peruano El Comercio a cuatro categorías: `politica`, `economia`, `deportes` y `ciencia_tecnologia`. El modelo resuelve una tarea acotada de enrutamiento o etiquetado editorial automático sobre titulares, no sobre el cuerpo completo de la noticia.

Con 135.327.748 parámetros y un repositorio de 0,5 GB en formato safetensors, es un modelo compacto que puede ejecutarse en CPU o en GPUs de consumo sin dificultad. Su relevancia es limitada: se trata de un artefacto docente con 27 descargas, cero likes y una fecha de creación de octubre de 2026, entrenado con un conjunto de datos muy pequeño y con etiquetas generadas por un LLM en lugar de anotación humana. Resulta útil como ejemplo reproducible de un pipeline de supervisión débil (weak supervision) para clasificación de noticias en español, pero no como componente de producción sin una validación adicional sustancial.

La licencia Apache 2.0 permite uso comercial y modificación, lo que reduce las fricciones legales, aunque la calidad del modelo y la estrechez de su dominio de entrenamiento son las verdaderas restricciones prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, destilado de BERT multilingüe |
| Parametros totales | 135.327.748 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | es (modelo base multilingüe, pero ajustado solo con titulares en español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas y 135 millones de parámetros obtenido por destilación de conocimiento de BERT multilingüe. Sobre esa base se añade una cabeza de clasificación con 4 etiquetas de salida. El ajuste fino se realizó con 360 titulares de El Comercio publicados entre el 12 y el 26 de octubre de 2026, con 90 ejemplos por sección, un split estratificado 70/15/15 (`random_state=42`), 3 épocas, batch de 8 y selección del mejor checkpoint por F1 macro en validación.

La innovación metodológica no está en la arquitectura, sino en el esquema de etiquetado: las etiquetas de entrenamiento fueron generadas por `gemini-3.5-flash-lite`, sin anotación humana. Este enfoque de supervisión débil abarata la creación del corpus, pero traslada al clasificador los sesgos y errores del LLM etiquetador. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos. El modelo solo consume el titular, no el cuerpo de la noticia ni metadatos adicionales.

## Capacidades

- Clasificación de texto en español en 4 categorías cerradas: `politica`, `economia`, `deportes` y `ciencia_tecnologia`.
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`, lo que permite umbrales de confianza y abstención.
- Funciona sobre titulares cortos; no está diseñado para documentos largos ni para clasificación multi-etiqueta.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe teórica heredada del modelo base, pero no validada por el autor fuera del español.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Enrutamiento editorial automático: dado un titular entrante, asignarlo a la sección correspondiente para prellenar el formulario de publicación en un CMS. El modelo es adecuado por su latencia baja y su tamaño reducido, aunque requiere revisión humana por la confusión documentada entre Economía y Política.
- Etiquetado retrospectivo de archivo hemerográfico: procesar lotes de titulares históricos de un medio peruano para construir índices temáticos navegables. El coste computacional es mínimo al ser un modelo de 135M de parámetros.
- Filtrado y monitorización de medios: clasificar titulares de fuentes peruanas para alimentar paneles de seguimiento por temática, con umbral de confianza para descartar predicciones dudosas.
- Generación de datasets de entrenamiento: usar las predicciones como etiquetas débiles para preanotar corpus más grandes que después se revisan manualmente, replicando el propio esquema de supervisión débil del autor.
- Docencia y reproducción de pipelines: servir como ejemplo completo y reproducible de fine-tuning de DistilBERT con supervisión débil, útil en cursos de PLN aplicado.
- Prueba de concepto en clasificación de noticias en español: validar la viabilidad de un clasificador ligero antes de invertir en un modelo mayor o en anotación humana, dado el bajo coste de despliegue.
- Clasificación en el borde (edge): al caber en CPU y en GPUs de consumo, puede ejecutarse localmente en un portátil o en un contenedor pequeño sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (54 titulares, comparados contra la sección real de publicación):

| Metrica | Valor |
|---|---|
| Accuracy | 0.889 |
| F1 macro | 0.891 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos (MMLU, HumanEval, GSM8K u otros). Los datos anteriores proceden exclusivamente de la model card del autor y corresponden a un test muy reducido de 54 ejemplos de un único medio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (135M de parámetros), aproximadamente 0,3 GB en fp16 y menos de 0,2 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU sin problemas de latencia para volúmenes moderados.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` pipeline, TorchServe, ONNX Runtime, FastAPI con `transformers`, o exportación a ONNX para inferencia en CPU. No se documenta soporte específico de vLLM o TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma medida por el autor; por el tamaño del modelo, se espera del orden de milisegundos por titular en GPU y decenas de milisegundos en CPU, sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SusanSari/clasificador-titulares-elcomercio | 135.327.748 | 512 tokens (estándar DistilBERT) | Clasificación de titulares en 4 clases | apache-2.0 | Hugging Face, 27 descargas |
| distilbert-base-multilingual-cased (base) | 135M | 512 tokens | Modelo base, sin cabeza de clasificación | apache-2.0 | Hugging Face, ampliamente usado |
| BETO (bert-base-spanish-wwm-cased) | ~110M | 512 tokens | Modelo base en español | apache-2.0 | Hugging Face |
| Modelos de clasificación zero-shot generativos (p. ej. LLM pequeños) | variable | variable | Clasificación sin entrenamiento específico | variable | variable |

La comparación directa con BETO o con el DistilBERT base no es posible en términos de rendimiento porque no hay benchmarks públicos de esta tarea concreta. Frente a un enfoque zero-shot con un LLM, este clasificador ofrece menor coste por inferencia y mayor determinismo, a cambio de un dominio mucho más estrecho.

## Limitaciones y advertencias

- Entrenado con solo 360 titulares de un único medio (El Comercio) y dos semanas de noticias (12-26 de octubre de 2026); la generalización a otros medios, países o períodos no está validada.
- Las etiquetas de entrenamiento las generó `gemini-3.5-flash-lite`, sin anotación humana; el modelo hereda los errores y sesgos del LLM etiquetador.
- Confusión documentada entre Economía y Política cuando el titular menciona autoridades, según la propia model card.
- Solo utiliza el titular, no el cuerpo de la noticia ni el contexto editorial, lo que limita la precisión en titulares ambiguos.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de predicciones erróneas con alta confianza; se recomienda umbral de abstención y revisión humana.
- El conjunto de test de 54 ejemplos es demasiado pequeño para estimar con fiabilidad el rendimiento en producción; los intervalos de confianza de accuracy y F1 macro son amplios.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y el dominio acotado hacen desaconsejable su uso en producción sin reentrenamiento y validación con datos propios.
- No hay documentación sobre sesgos demográficos, políticos o geográficos más allá de la advertencia sobre la confusión de clases.
- El identificador del modelo base y el etiquetado por Gemini se describen en la model card, pero no se publican curvas de entrenamiento ni matrices de confusión detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanSari/clasificador-titulares-elcomercio
- Código y datos del trabajo académico: https://github.com/SusanMontalvo81/Diplomado-Su-2026/tree/main/tarea_1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
