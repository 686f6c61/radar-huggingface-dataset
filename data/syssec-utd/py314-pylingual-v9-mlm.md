# syssec-utd/py314-pylingual-v9-mlm

## Resumen

py314-pylingual-v9-mlm es un modelo de lenguaje enmascarado (fill-mask) desarrollado por el grupo syssec-utd, integrado en el proyecto Pylingual, un decompilador de Python para versiones modernas. El modelo se ha ajustado sobre un dataset llamado syssec-utd/segmentation-py314-pylingual-v9, lo que sugiere que su propósito es asistir en la segmentación y análisis de código Python, posiblemente para mejorar la reconstrucción de bytecode en el decompilador. Según los metadatos de HuggingFace, la arquitectura es RoBERTa (encoder-only transformer) y cuenta con 109.506.864 parámetros.

Su relevancia radica en que forma parte de una herramienta de seguridad y análisis de código Python, un área con demanda creciente. Sin embargo, la documentación publicada es mínima y no incluye descripción técnica, evaluación ni licencia, por lo que cualquier uso productivo requiere una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder-only transformer, según metadatos de HuggingFace) |
| Parámetros totales | 109.506.864 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada explícitamente en la model card. Los metadatos de HuggingFace etiquetan el modelo como 'roberta', lo que indica que se trata de un transformer encoder-only. Tiene 109.506.864 parámetros, un tamaño típico para modelos de este tipo. El modelo ha sido fine-tuned usando la librería Transformers (versión 5.12.1) sobre el dataset syssec-utd/segmentation-py314-pylingual-v9. Los hiperparámetros de entrenamiento incluyen learning rate 5e-5, batch total de 192, distribución multi-GPU en 3 dispositivos, scheduler lineal y 2 épocas. No se proporciona información sobre la composición de los datos de entrenamiento, ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Modelo de lenguaje enmascarado (fill-mask): predice tokens ocultos en una secuencia, según el pipeline indicado en HuggingFace.
- Compatibilidad con Transformers: funciona con la librería Transformers (versión 5.12.1 usada en entrenamiento) y está marcado como compatible con Inference Endpoints.
- Especialización en código Python: los datasets del proyecto (segmentation y statement) indican un enfoque hacia el análisis de código Python, aunque no hay una descripción oficial de esta capacidad.
- Sin capacidad generativa: al tratarse de un encoder-only, no puede producir texto libre ni completar conversaciones de forma autoregresiva.
- Sin capacidades documentadas de tool calling, agentes, visión, audio o soporte multilingüe.

## Casos de uso

La documentación oficial no especifica casos de uso. Los siguientes se infieren del contexto del proyecto Pylingual y de los datos de entrenamiento disponibles.

- Asistencia en la decompilación de Python: el modelo se integraría en el pipeline de Pylingual para segmentar bytecode en declaraciones, mejorando la reconstrucción del código fuente. Es adecuado porque el dataset de entrenamiento se llama segmentation-py314-pylingual-v9.
- Análisis estático de código: puede emplearse para clasificar fragmentos de código según su estructura (bucles, funciones, clases) en herramientas de análisis de seguridad o calidad. Su arquitectura de encoder permite obtener representaciones y realizar clasificación con un clasificador encima.
- Detección de patrones en scripts maliciosos: dado que syssec-utd es un grupo de seguridad, el modelo puede aplicarse para identificar técnicas de ofuscación o comportamientos sospechosos en código Python. El entrenamiento sobre un dataset de segmentación podría ayudar a reconocer patrones relevantes.
- Predicción de tokens enmascarados en entornos de aprendizaje: en sistemas de ejercicios interactivos, el modelo puede completar palabras clave o identificadores ocultos en código Python, lo que resulta útil para la enseñanza de programación. Su capacidad de fill-mask encaja directamente con esta tarea.
- Extracción de embeddings de código: como modelo RoBERTa, puede transformar fragmentos de Python en vectores que luego alimentan a otros modelos o clasificadores. Esto es adecuado para tareas de búsqueda semántica o de similitud entre snippets de código.
- Transferencia de aprendizaje para tareas más específicas: el modelo ya ha sido fine-tuned sobre datos de segmentación, por lo que puede servir como punto de partida para entrenar modelos especializados en otras tareas de análisis de código Python, como detección de vulnerabilidades o generación de resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de HuggingFace no incluye ninguna métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 109,5 millones de parámetros, se puede estimar que en FP32 ocupará aproximadamente 0,44 GB de memoria, pero el consumo real de VRAM dependerá de la longitud de secuencia y el batch.
- GPU recomendadas: no disponible. Modelos de este tamaño pueden ejecutarse en GPUs de consumo de gama baja con secuencias cortas.
- ¿Cabe en consumer GPU?: sí, es un modelo pequeño que no requiere hardware de gran capacidad.
- Opciones de despliegue: librería Transformers, HuggingFace Inference Endpoints (según los metadatos del repositorio). También puede desplegarse en instalaciones locales con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables con métricas publicadas. En la categoría de modelos de lenguaje enmascarado para código, CodeBERT y GraphCodeBERT son los más cercanos en tamaño y enfoque, pero no existen datos de rendimiento de py314-pylingual-v9-mlm que permitan una comparación objetiva. La siguiente tabla muestra sus características generales:

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| py314-pylingual-v9-mlm | 109.506.864 | RoBERTa (inferido) | no disponible | no disponible |
| CodeBERT | 125 M | BERT | 512 | MIT |
| GraphCodeBERT | 125 M | BERT | 512 | MIT |

## Limitaciones y advertencias

- La model card es muy escasa y no proporciona descripción, evaluación ni datos de entrenamiento. Esto limita la confianza en el modelo para producción.
- No se han publicado benchmarks, por lo que no es posible validar su calidad en tareas de análisis de código.
- Al ser un modelo encoder-only, no puede generar texto ni responder a preguntas.
- No se ha definido la longitud de contexto; esto es crítico para procesar scripts largos.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- Al estar entrenado únicamente sobre un dataset de segmentación de Python, el modelo puede presentar sesgos hacia esos datos y tener un rendimiento pobre en otros lenguajes.
- No existe información sobre sesgos o riesgos de alucinación específicos; se recomienda evaluar el modelo en el dominio de uso.

## Enlaces

- HuggingFace: https://huggingface.co/syssec-utd/py314-pylingual-v9-mlm
- GitHub del proyecto Pylingual: https://github.com/syssec-utd/pylingual
- Dataset relacionado 'statement-py314-pylingual-v9': https://huggingface.co/datasets/syssec-utd/statement-py314-pylingual-v9
