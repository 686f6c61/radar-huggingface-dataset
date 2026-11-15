# STRIDE-lab/biolinkbert-substance-naivety-20261107

## Resumen

BioLinkBERT-substance-naivety-20261107 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab dentro del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a la extracción estructurada de información de estudios sobre sustancias psicodélicas. El modelo resuelve una tarea concreta: determinar, a partir del título y el resumen de un artículo científico, si los participantes de un estudio son "naïve" (sin exposición previa) o "no naïve" a sustancias psicodélicas, con etiquetas adicionales para casos desconocidos o no aplicables.

Técnicamente es un fine-tuning de BioLinkBERT-base, un encoder BERT de 108 millones de parámetros preentrenado sobre literatura biomédica con enlaces de citación como señal adicional. La tarea es de clasificación multietiqueta: se aplica una sigmoid por etiqueta y se predice toda etiqueta con probabilidad igual o superior a 0,18, umbral ajustado en validación mediante una regla preespecificada.

Su relevancia es doble. Por un lado, es un ejemplo de modelo especializado de dominio con métricas publicadas y umbral calibrado para producción. Por otro, sustituye a la versión anterior basada en BiomedBERT-abstract (tag `submission-v1`) tras la revisión de noviembre de 2026, lo que lo convierte en la referencia actual del pipeline PsyNamic para esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base: BioLinkBERT-base |
| Parametros totales | 108.235.780 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 estándar; compatible con cuantización dinámica vía PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de BioLinkBERT-base, un transformer encoder tipo BERT con 108 millones de parámetros. BioLinkBERT incorpora en el preentrenamiento enlaces de citación entre documentos biomédicos como señal de contexto documental, lo que mejora la representación de relaciones entre entidades y hallazgos científicos. Sobre esta base se añade una cabeza de clasificación de secuencias con cuatro salidas y activación sigmoid (multietiqueta).

El fine-tuning se realizó con un dataset privado del proyecto PsyNamic, batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup del 10 %, 30 épocas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia 5. Se compararon cinco bases (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; el checkpoint final es el de menor pérdida de validación y la base se seleccionó por weighted F1 en validación. El conjunto de test se usó una sola vez, tras la selección. No se reporta RLHF ni DPO (no aplica a una tarea de clasificación).

## Capacidades

- Clasificación multietiqueta de resúmenes científicos biomédicos en cuatro categorías: Substance-Naïve Participants, Substance-non-naïve participants, Unknown y Not applicable.
- Procesamiento de pares título + resumen con truncación a 512 tokens.
- Salida de probabilidades por etiqueta (sigmoid) con umbral operativo de 0,18 calibrado en validación.
- Manejo de casos ambiguos mediante las etiquetas Unknown y Not applicable.
- No soporta tool calling, function calling, agentes ni generación de texto: es un clasificador puro.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Cribado sistemático en revisiones de literatura sobre psicodélicos: el modelo clasifica automáticamente resúmenes de bases de datos como PubMed para identificar estudios con participantes naïve o no naïve, reduciendo el trabajo manual en revisiones sistemáticas.
- Enriquecimiento de metadatos en repositorios científicos: se puede ejecutar como paso de un pipeline ETL que etiqueta registros nuevos con las cuatro categorías y alimenta bases de datos estructuradas del dominio.
- Alimentación de la webapp PsyNamic: es el modelo desplegado en producción en psynamic.dcr.unibe.ch tras la revisión de noviembre de 2026, por lo que su uso principal es servir predicciones en esa interfaz.
- Análisis de tendencias de investigación: agregando las predicciones sobre un corpus histórico se pueden medir proporciones de estudios con participantes naïve frente a no naïve a lo largo del tiempo.
- Filtrado previo en pipelines de extracción de información más complejos: al aislar resúmenes con participantes naïve, se reduce el volumen que llega a modelos de extracción de entidades o relaciones más costosos.
- Auditoría y control de calidad de anotaciones: el modelo puede usarse como segundo anotador para detectar discrepancias frente a etiquetado humano en nuevos lotes de resúmenes.
- Despliegue en entornos con recursos limitados: con 108 millones de parámetros y 0,4 GB de repo, cabe en una GPU consumer o incluso en CPU para lotes pequeños, lo que facilita su integración en infraestructuras modestas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado (97 resúmenes), con umbral ajustado de 0,18 e intervalos de confianza bootstrap del 95 % (1.000 remuestreos BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,859 [0,788–0,912] |
| Weighted precision | 0,834 [0,747–0,891] |
| Weighted recall | 0,890 [0,819–0,944] |

No se han publicado resultados comparativos frente a otros modelos en la información disponible, más allá de la mención de que BioLinkBERT fue seleccionado por weighted F1 en validación frente a BiomedBERT-abstract, BioBERT, ClinicalBERT y SciBERT con hiperparámetros idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (108 M de parámetros más overhead de activaciones para secuencias de 512 tokens).
- VRAM estimada en fp16: aproximadamente 0,3 GB; en int8 dinámico, por debajo de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobradas para esta carga.
- Cabe en GPU consumer y en CPU: para lotes pequeños la inferencia en CPU es viable con latencias del orden de decenas de milisegundos por muestra.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), endpoints compatibles de Hugging Face y exportación a ONNX para servir con ONNX Runtime.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera un throughput alto en GPU (cientos de muestras por segundo en lote), pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| STRIDE-lab/biolinkbert-substance-naivety-20261107 | 108 M | 512 | Clasificación multietiqueta de naivety a sustancias | apache-2.0 | Weighted F1 0,859 en test (97 resúmenes) |
| STRIDE-lab/biomedbert-abstract-substance-naivety-20250221 | no disponible | 512 | Misma tarea (versión anterior, tag `submission-v1`) | no disponible | Sustituido por este modelo tras la revisión de noviembre de 2026 |
| michiyasunaga/BioLinkBERT-base | 108 M | 512 | Modelo base de dominio biomédico (MLM) | no disponible | Requiere fine-tuning para la tarea; no es un clasificador listo para usar |

La comparación con alternativas genéricas de clasificación (por ejemplo, BERT-base o RoBERTa-base sin dominio) no está documentada en la información disponible; la model card solo indica que BioLinkBERT superó en validación a otras cuatro bases biomédicas con los mismos hiperparámetros.

## Limitaciones y advertencias

- Solo inglés: cualquier resumen en otro idioma queda fuera del ámbito de entrenamiento y las predicciones no son fiables.
- Dominio muy restringido: está entrenado exclusivamente para la tarea de naivety a sustancias psicodélicas en resúmenes biomédicos; no debe reutilizarse para otras clasificaciones sin fine-tuning.
- Dataset de entrenamiento privado: no se puede auditar la composición ni la distribución de etiquetas, lo que dificulta evaluar sesgos de muestreo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos: el umbral de 0,18 prioriza recall (0,890) sobre precisión (0,834), por lo que se esperan etiquetas espurias.
- Conjunto de test pequeño (97 resúmenes): los intervalos de confianza son amplios y el rendimiento en producción puede desviarse.
- El umbral 0,18 está calibrado para esta tarea y esta distribución de datos; usarlo con otro corpus requiere recalibración.
- Truncación a 512 tokens: resúmenes más largos pierden información, lo que puede degradar las predicciones.
- Licencia apache-2.0 permite uso comercial, pero el modelo base BioLinkBERT-base debe verificarse por separado en cuanto a sus términos.
- Sin garantías de mantenimiento: el repo tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un producto con soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-substance-naivety-20261107
- Versión anterior (submission-v1): https://huggingface.co/STRIDE-lab/biomedbert-abstract-substance-naivety-20250221
- Modelo base BioLinkBERT: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
