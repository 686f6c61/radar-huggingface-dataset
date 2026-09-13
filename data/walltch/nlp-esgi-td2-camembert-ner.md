# walltch/nlp-esgi-td2-camembert-ner

## Resumen

walltch/nlp-esgi-td2-camembert-ner es un modelo de clasificación de tokens (token-classification) publicado en Hugging Face por el usuario walltch. El tag `camembert` y el recuento de 110.032.898 parámetros indican que se trata de un ajuste fino completo de CamemBERT-base, un encoder de tipo transformer (arquitectura RoBERTa) preentrenado sobre corpus en francés. El pipeline declarado es `token-classification`, lo que sitúa su uso previsto en tareas de etiquetado secuencial como el reconocimiento de entidades nombradas (NER).

El nombre del repositorio ("nlp-esgi-td2") sugiere que se trata de un trabajo práctico de un curso de procesado de lenguaje natural en la escuela ESGI, aunque la model card no confirma el origen ni el propósito. La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, hiperparámetros, idioma de ajuste ni métricas.

Es relevante como caso de estudio de ajuste fino de bajo coste: 110 M de parámetros, pesos en safetensors y compatibilidad con el ecosistema `transformers`. Sin embargo, la ausencia total de documentación, licencia explícita y resultados de evaluación limita su uso en producción. No tiene descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia RoBERTa, CamemBERT-base) |
| Parámetros totales | 110.032.898 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (valor de la arquitectura base CamemBERT) |
| Tipos de cuantización | no disponible; los pesos publicados están en safetensors (fp32) |
| Idiomas soportados | no disponible en la model card; la arquitectura base CamemBERT está preentrenada en francés |
| Licencia | no disponible |
| Formato de pesos | safetensors (también compatible con PyTorch) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | token-classification |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es CamemBERT, una adaptación de RoBERTa al francés entrenada con el corpus OSCAR (aproximadamente 138 GB de texto) mediante el objetivo de language modeling enmascarado. CamemBERT-base consta de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario SentencePiece de 32.000 tokens; el recuento de 110.032.898 parámetros del repositorio coincide exactamente con el de CamemBERT-base, lo que indica un ajuste fino completo (no un adaptador).

Sobre el entrenamiento de este modelo concreto no hay información: la model card no documenta el dataset de ajuste, el número de épocas, la tasa de aprendizaje, la composición del corpus etiquetado ni si se aplicaron técnicas como DPO o RLHF (poco habituales en modelos encoder de clasificación). Tampoco se especifica el esquema de etiquetas NER (por ejemplo, PER/ORG/LOC/MISC o un esquema propio), lo que obliga a inspeccionar el `config.json` del repositorio para conocer las clases de salida.

## Capacidades

- Clasificación de tokens a nivel de secuencia: asignación de una etiqueta a cada token del texto de entrada.
- Reconocimiento de entidades nombradas (uso previsto por el pipeline declarado `token-classification`).
- Procesamiento de texto en francés de forma probable, dado que deriva de CamemBERT (no confirmado para el ajuste fino).
- Integración directa con `transformers` mediante `AutoModelForTokenClassification` y `pipeline("token-classification")`.
- Compatibilidad con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Extracción de representaciones contextuales de tokens reutilizables para otras tareas de clasificación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Extracción de entidades en documentos legales o administrativos en francés: el modelo puede etiquetar nombres de personas, organizaciones y localizaciones en contratos o expedientes, aprovechando que CamemBERT está preentrenado en francés; requiere validar antes el esquema de etiquetas real del checkpoint.
- Enriquecimiento de registros en bases de datos: detección de entidades en campos de texto libre para normalizar y poblar tablas estructuradas en pipelines ETL.
- Preprocesado para sistemas de búsqueda o RAG: etiquetar entidades en los documentos antes de indexarlos y permitir filtros por entidad además de la búsqueda semántica.
- Anonimización de datos personales (PII): detección de nombres y localizaciones para enmascararlos antes de compartir o almacenar textos, siempre que el esquema incluya las clases relevantes.
- Análisis de opiniones o reseñas: extracción de marcas, productos y lugares mencionados en comentarios de usuarios en francés.
- Proyecto docente o experimento de ajuste fino: sirve como referencia reproducible para comparar estrategias de fine-tuning de CamemBERT en tareas NER en un entorno con GPU de gama media.
- Moderación o clasificación de contenidos: uso como componente de un pipeline mayor que combine la etiqueta de entidades con reglas de negocio.

En todos los casos es imprescindible verificar previamente la licencia y el esquema de etiquetas, hoy no documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (F1, precision, recall), ni conjuntos de evaluación, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 450 MB en fp32, unos 220 MB en fp16 y alrededor de 110 MB en int8, más el consumo de activaciones (reducido a 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problema en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100; también cabe en GPU integradas y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual y en muchas integradas.
- Opciones de despliegue: `transformers` (pipeline nativo), ONNX Runtime, NVIDIA Triton, Hugging Face Inference Endpoints (compatible según los tags) y TorchServe. Para exportación a GGUF sería necesaria una conversión manual no documentada.
- Latencia y throughput: no disponibles; dado el tamaño (110 M de parámetros) se espera una latencia de milisegundos por secuencia corta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walltch/nlp-esgi-td2-camembert-ner | 110 M | 512 | no disponible (base en francés) | no disponible | Hugging Face |
| camembert-base | 110 M | 512 | Francés | MIT | Hugging Face |
| Jean-Baptiste/camembert-ner | 110 M | 512 | Francés | no disponible en la información proporcionada | Hugging Face |
| xlm-roberta-base | 278 M | 512 | Multilingüe (aprox. 100 idiomas) | MIT | Hugging Face |

Los datos de los modelos de comparación proceden de conocimiento general de la familia CamemBERT y pueden variar; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de CamemBERT, hereda los sesgos presentes en el corpus OSCAR.
- Riesgo de alucinación: bajo en sentido generativo (es un modelo de clasificación, no genera texto libre), pero puede producir etiquetas erróneas en tokens ambiguos o fuera del dominio de ajuste.
- Limitaciones de contexto: 512 tokens; los textos más largos requieren truncado o segmentación con solapamiento.
- Limitación de idioma: no se confirma el idioma de ajuste; si se usó un corpus en francés, el rendimiento en castellano será previsiblemente bajo.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si se permite el uso comercial. Debe contactarse con el autor o asumir que no hay permiso explícito.
- Falta de documentación: no hay información sobre datos de entrenamiento, esquema de etiquetas ni métricas, lo que dificulta la reproducibilidad y la evaluación de calidad.
- Madurez: 0 descargas y 0 "likes"; es un artefacto reciente y sin validación por parte de la comunidad.
- Advertencia de producción: antes de desplegarlo es necesario inspeccionar `config.json` (id2label), validar el modelo en un conjunto propio y confirmar los términos de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/walltch/nlp-esgi-td2-camembert-ner
- Paper de referencia del tag `arxiv:1910.09700` (calculadora de impacto de carbono, Lacoste et al., 2019; no es un paper sobre el modelo): https://arxiv.org/abs/1910.09700
- Paper de CamemBERT (arquitectura base): https://arxiv.org/abs/1911.03894
- Repositorio de CamemBERT (fairseq): https://github.com/facebookresearch/fairseq/tree/main/examples/camembert
- Documentación de `transformers` para token classification: https://huggingface.co/docs/transformers/tasks/token_classification

No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo.
