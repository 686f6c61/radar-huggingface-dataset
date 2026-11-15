# STRIDE-lab/biolinkbert-relevant-20261107

## Resumen

BioLinkBERT-relevant-20261107 es un modelo de clasificación de texto en inglés, especializado en la detección de relevancia de resúmenes científicos dentro del dominio biomédico. Lo desarrolla STRIDE-lab en el marco del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a la revisión sistemática asistida por aprendizaje automático. El modelo resuelve una tarea muy concreta: decidir si un registro bibliográfico (título y resumen) cumple los criterios de inclusión de una revisión sistemática sobre sustancias psicodélicas, clasificándolo como `relevant` o `irrelevant`.

Técnicamente es un fine-tune de `michiyasunaga/BioLinkBERT-base`, un BERT con enlaces de conocimiento biomédico inyectados durante el preentrenamiento. El checkpoint resultante tiene 108.234.242 parámetros y una ventana de 512 tokens, suficiente para cubrir título y resumen de la mayoría de publicaciones. La tarea es de clasificación de una sola etiqueta con decisión por argmax sobre la softmax.

Su relevancia actual radica en que sustituye al modelo anterior `STRIDE-lab/biobert-relevant-20250306` (tag `submission-v1`) como modelo desplegado en la aplicación web de PsyNamic tras la revisión de noviembre de 2026. Frente a alternativas de mayor tamaño, ofrece una huella muy reducida (0,4 GB de repositorio) y un rendimiento medido en test de F1 ponderado 0,894, lo que lo hace viable en infraestructura modesta para cribado de literatura a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BioLinkBERT-base), clasificación de secuencias |
| Parámetros totales | 108.234.242 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length` en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch/transformers) |

## Arquitectura y entrenamiento

El modelo parte de BioLinkBERT-base, un encoder transformer derivado de BERT que incorpora enlaces de documento (document links) y enlaces de entidad (citation links) entre pasajes biomédicos durante el preentrenamiento. Sobre esa base se aplica un fine-tune de clasificación con una cabeza de secuencia que proyecta el estado del token `[CLS]` a dos logits (`irrelevant`, `relevant`).

El entrenamiento se realizó con hiperparámetros idénticos para cinco modelos base candidatos (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT), lo que convierte la selección en una comparación controlada de arquitecturas de dominio. Los hiperparámetros documentados son: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas, dropout 0,1, gradient clipping 1,0, early stopping con paciencia 5 y `max_length` 512. El checkpoint desplegado es el de menor pérdida de validación, y el modelo base se eligió por F1 ponderado en validación; el conjunto de test se usó una única vez, después de la selección. El dataset de entrenamiento es privado y no se detalla su composición ni su número de ejemplos.

## Capacidades

- Clasificación binaria de relevancia (`relevant` / `irrelevant`) de registros bibliográficos con título y resumen.
- Decisión single-label por argmax sobre la softmax; no requiere umbral configurable.
- Comprensión de vocabulario biomédico y farmacológico gracias al preentrenamiento de BioLinkBERT con enlaces de conocimiento.
- Manejo de textos de hasta 512 tokens, cubriendo título y resumen completos en la mayoría de casos.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio.
- Uso monolingüe en inglés; no se documenta soporte multilingüe.

## Casos de uso

- Cribado inicial en revisiones sistemáticas: el modelo filtra automáticamente miles de registros recuperados de PubMed u otras bases, descartando los irrelevantes antes de la revisión manual por pares, lo que reduce drásticamente el esfuerzo de tamizado.
- Actualización continua de una base de evidencia viva: al integrarse en el pipeline de PsyNamic, clasifica nuevos registros a medida que aparecen y mantiene actualizada la colección de estudios elegibles sobre psicodélicos.
- Vigilancia bibliográfica especializada: equipos de farmacología o psiquiatría pueden monitorizar publicaciones nuevas sobre sustancias concretas y recibir solo los estudios que cumplen criterios predefinidos.
- Prefiltrado para meta-análisis: antes de extraer datos, el modelo separa ensayos controlados, cohortes, estudios mecanísticos y revisiones sistemáticas de material excluido (opiniones, estudios en animales, literatura gris).
- Etiquetado asistido para creación de datasets: el modelo puede preetiquetar grandes volúmenes de resúmenes que luego se revisan y corrigen, acelerando la anotación de nuevos corpus biomédicos.
- Despliegue en aplicaciones web de bajo coste: con 108 millones de parámetros y 0,4 GB de pesos, se sirve en una única GPU consumer o incluso en CPU para cargas moderadas, como demuestra su uso en la webapp de PsyNamic.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (565 resúmenes), con decisión por argmax e intervalos de confianza bootstrap al 95 % (1.000 remuestreos BCa):

| Métrica (test) | Valor [IC 95 %] |
|---|---|
| F1 ponderado | 0,894 [0,865–0,918] |
| Precisión ponderada | 0,894 [0,865–0,917] |
| Exhaustividad ponderada | 0,894 [0,865–0,919] |
| F1 clase `relevant` | 0,910 [0,886–0,933] |
| Precisión clase `relevant` | 0,902 [0,862–0,932] |
| Exhaustividad clase `relevant` | 0,919 [0,889–0,947] |

Matriz de confusión (positivo = `relevant`): TP 305, FP 33, FN 27, TN 200. No se han publicado resultados comparativos frente a los otros cuatro modelos base candidatos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos, más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16/bf16 los pesos ocupan unos 0,22 GB, por lo que el modelo es apto para GPUs consumer muy modestas (GTX 1650, RTX 3050, T4) e incluso para inferencia en CPU.
- GPUs recomendadas para alto throughput: T4, A10G, L4 o A100; para lotes pequeños cualquier GPU moderna es suficiente.
- Despliegue: transformers con `AutoModelForSequenceClassification`, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), endpoints compatibles y servidores tipo TorchServe o FastAPI. No se documenta soporte nativo en llama.cpp ni Ollama por tratarse de un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; con 512 tokens y 108 M de parámetros se espera un coste por muestra del orden de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| STRIDE-lab/biolinkbert-relevant-20261107 | 108 M | 512 | Clasificación de relevancia biomédica | Apache 2.0 | F1 ponderado 0,894 |
| STRIDE-lab/biobert-relevant-20250306 | no disponible | no disponible | Clasificación de relevancia biomédica | no disponible | no disponible (modelo sustituido, tag `submission-v1`) |
| michiyasunaga/BioLinkBERT-base | ~110 M | 512 | Modelo base (MLM, sin fine-tune de clasificación) | Apache 2.0 | no disponible para esta tarea |
| BiomedBERT-abstract / BioBERT / ClinicalBERT / SciBERT | del orden de 110 M cada uno | 512 | Candidatos comparados en la selección | varía según modelo | no publicado en la información disponible |

## Limitaciones y advertencias

- Dominio y tarea muy restringidos: el modelo solo está entrenado para decidir relevancia según los criterios de inclusión de PsyNamic; fuera de ese ámbito sus predicciones no son fiables.
- Sesgo de dominio: los criterios excluyen explícitamente sustancias como THC, CBD o heroína, estudios en animales y literatura gris; el modelo hereda esas fronteras y puede clasificar como irrelevante material válido para otras revisiones.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos: en test se observan 33 falsos positivos y 27 falsos negativos sobre 565 casos, por lo que el cribado debe mantenerse con revisión humana.
- Limitación de longitud: textos que superen 512 tokens se truncan; resúmenes largos o registros con múltiples secciones pueden perder información decisiva.
- Monolingüe en inglés: no se ha entrenado ni evaluado en otros idiomas, y su uso en castellano u otras lenguas no está respaldado.
- Dataset de entrenamiento privado: no es posible auditar la composición ni estimar sesgos de muestreo a partir de la información pública.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base BioLinkBERT debe verificarse por separado y el autor no ofrece garantías sobre el rendimiento en producción fuera de su pipeline.
- Sin métricas de calibración publicadas: la decisión por argmax no permite filtrar por umbral de confianza sin un análisis adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-relevant-20261107
- Modelo base: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Modelo anterior sustituido: https://huggingface.co/STRIDE-lab/biobert-relevant-20250306
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicación web PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
