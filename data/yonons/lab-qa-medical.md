# yonons/lab-qa-medical

## Resumen

`yonons/lab-qa-medical` es un modelo publicado en Hugging Face por el usuario `yonons`, construido mediante fine-tuning de `roberta-base` sobre un dataset denominado `clinic-faq`. Por su base arquitectónica y por las métricas reportadas (precision y recall sobre clasificación o extracción), se trata de un modelo orientado a tareas de procesamiento de lenguaje natural sobre documentos clínicos o preguntas frecuentes del ámbito médico, más que a generación abierta de texto.

La información pública disponible es muy limitada: la model card no especifica licencia, idiomas, pipeline ni formato de pesos, y el repositorio no registra descargas ni interacciones. El autor declara un uso previsto restringido a "batch scoring of internal documents", es decir, puntuación por lotes de documentos internos, lo que sugiere un contexto de uso corporativo cerrado.

A pesar de la escasez de metadatos, la ficha se completa con los datos declarados en la model card (hiperparámetros de entrenamiento y métricas de evaluación interna) y con las características conocidas de la arquitectura base RoBERTa. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) |
| Parametros totales | ~125 millones (derivado de roberta-base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite declarado en limitaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch binario, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de tipo BERT con aproximadamente 125 millones de parámetros, entrenado originalmente por Facebook AI sobre corpus web en inglés. Sobre esta base, el autor ha realizado un fine-tuning supervisado durante 7 épocas, con learning rate de 3e-5 y batch size de 16, empleando el dataset `clinic-faq`. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; en un encoder de este tipo lo habitual es un ajuste supervisado para clasificación o extracción.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, arquitecturas híbridas). La model card únicamente reporta métricas de precisión y recall sobre un conjunto denominado `internal-test-v3`, sin detallar el proceso de anotación ni el desglose por clases.

## Capacidades

- Procesamiento de texto de entrada hasta 512 tokens, orientado a tareas de clasificación o extracción sobre documentos clínicos y preguntas frecuentes.
- Puntuación por lotes ("batch scoring") de documentos internos, según el uso previsto declarado por el autor.
- No se documenta soporte de generación de texto abierta, tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; la model card no declara idiomas y la base RoBERTa está entrenada principalmente en inglés.

## Casos de uso

- Puntuación por lotes de documentación clínica interna: el modelo puede aplicarse a lotes de documentos para asignar una puntuación o etiqueta, tal y como declara el autor en su uso previsto, integrándose en pipelines ETL de un equipo de datos sanitario.
- Clasificación de preguntas frecuentes médicas: dado el dataset de entrenamiento `clinic-faq`, es plausible su uso para categorizar consultas de pacientes o FAQs internas en un servicio de atención al paciente, aunque esta aplicación no está confirmada por el autor.
- Filtrado y priorización de documentos: con métricas de recall de 0,859, el modelo puede emplearse en una primera fase de cribado para no descartar casos relevantes, dejando la validación final a revisores humanos.
- Enriquecimiento de bases de conocimiento internas: aplicación en procesos batch nocturnos para etiquetar grandes volúmenes de documentos de un repositorio corporativo.
- Evaluación comparativa de pipelines de NLP clínico: sirve como baseline encoder para comparar con modelos más grandes o con LLMs generativos en tareas de clasificación médica.
- Prototipado rápido en entornos con recursos limitados: al derivar de roberta-base, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto, siempre que se respete el límite de 512 tokens.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas del autor sobre `internal-test-v3`:

| Metrica | Valor |
|---|---|
| Precision | 0.731 |
| Recall | 0.859 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en FP32 para ~125 millones de parámetros; aproximadamente 0,25 GB en FP16. Cifras estimadas a partir de la arquitectura base, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen amplio para procesamiento por lotes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo basado en RoBERTa, es compatible con Hugging Face Transformers, Text Embeddings Inference (TEI) y ONNX Runtime; no se confirma compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yonons/lab-qa-medical | ~125 M (roberta-base) | 512 tokens | no disponible | Hugging Face |
| roberta-base (base original) | ~125 M | 512 tokens | MIT | Hugging Face |
| Modelos clínicos tipo BioBERT/PubMedBERT | ~110 M | 512 tokens | variable según versión | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No evaluado en textos de más de 512 tokens, según declara el autor; cualquier documento más largo requerirá truncado o segmentación previa.
- Métricas reportadas únicamente sobre un conjunto interno (`internal-test-v3`), sin validación externa ni desglose por clases; el rendimiento en dominios distintos es desconocido.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- Idiomas no declarados: no hay confirmación de soporte para castellano ni para otros idiomas distintos del inglés, idioma dominante en la base RoBERTa.
- Riesgo de sesgo y alucinación no evaluado: al ser un encoder de clasificación, el riesgo principal es la clasificación errónea, no la generación de contenido ficticio.
- Contexto sanitario: cualquier uso en producción con datos de pacientes exige revisión humana y cumplimiento normativo (RGPD, normativa sanitaria), no documentado por el autor.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de mantenimiento activo más allá del changelog declarado.

## Enlaces

- Hugging Face: https://huggingface.co/yonons/lab-qa-medical
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
