# STRIDE-lab/scibert-clinical-trial-phase-20261106

## Resumen

scibert-clinical-trial-phase-20261106 es un modelo de clasificación de texto en inglés desarrollado por STRIDE-lab en el marco del proyecto PsyNamic (Universidad de Berna). Se trata de un fine-tuning de `allenai/scibert_scivocab_uncased` especializado en la predicción multi-etiqueta de la fase de ensayo clínico (fases 1 a 4, además de las categorías "Unknown" y "Not Applicable") a partir del título y el resumen de publicaciones biomédicas.

El modelo resuelve una tarea de extracción de metadatos estructurados sobre literatura científica: dado un abstract, asigna una o varias fases de ensayo clínico con una regla de decisión basada en umbral (sigmoide por etiqueta con corte en 0,16). Es relevante porque forma parte del pipeline de predicción de PsyNamic, una infraestructura de anotación automatizada de estudios en psiquiatría y neurociencia, y sustituye a un checkpoint anterior (`STRIDE-lab/clinicalbert-clinical-trial-phase-20250221`) tras la revisión de noviembre de 2026.

Con 109,9 millones de parámetros y una arquitectura BERT base (encoder transformer), el modelo es ligero y desplegable en hardware modesto. Conviene señalar que, según la propia model card, la fase de ensayo clínico fue excluida del conjunto final de parámetros de PsyNamic por su baja informatividad y escasa concordancia entre anotadores: el modelo se mantiene en el pipeline, pero sus predicciones no se muestran en la webapp ni se reportan en el artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, vocabulario SciBERT) |
| Parametros totales | 109.923.078 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/scibert_scivocab_uncased`, un BERT base con vocabulario entrenado sobre corpus científico (Semantic Scholar). La cabeza de clasificación es una capa lineal sobre el token [CLS] con seis salidas (una por etiqueta) y activación sigmoide independiente por etiqueta, lo que permite predicción multi-etiqueta. La longitud máxima de entrada es de 512 tokens y la entrada esperada es la concatenación `<title>. <abstract>`.

El entrenamiento se realizó con los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas máximas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia 5 (se conserva el checkpoint con menor pérdida de validación). El conjunto de datos es privado y no se documenta su tamaño ni composición. Como parte del proceso de selección, se fine-tunearon cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos, y se eligió SciBERT por su mejor F1 ponderado en validación. El conjunto de test se usó una única vez tras la selección. No se documenta uso de RLHF ni DPO (no aplica a una tarea de clasificación).

## Capacidades

- Clasificación multi-etiqueta de fase de ensayo clínico (Phase 1, Phase 2, Phase 3, Phase 4, Unknown, Not Applicable) a partir de título y abstract.
- Predicción con umbral calibrado: sigmoide por etiqueta y corte en probabilidad ≥ 0,16 (regla fijada en la webapp de PsyNamic).
- Procesamiento de texto biomédico en inglés con vocabulario científico especializado (SciBERT).
- Entrada de hasta 512 tokens, suficiente para títulos y abstracts típicos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés (language: en).

## Casos de uso

- Enriquecimiento de bases de datos bibliográficas: procesar en lote abstracts de PubMed o de repositorios internos para etiquetar automáticamente la fase de ensayo clínico y facilitar filtros y búsquedas facetadas.
- Revisión sistemática asistida: pre-clasificar los registros recuperados en una revisión para priorizar la lectura manual de los que corresponden a fases concretas (por ejemplo, solo fase 3 y 4).
- Monitorización de pipelines de evidencia clínica: integrar el modelo en un flujo que detecte nuevos ensayos en fase tardía publicados en revistas de seguimiento, con umbral ajustable según la tolerancia a falsos positivos.
- Construcción de cohortes de investigación: agrupar publicaciones por fase de ensayo para análisis bibliométricos o meta-investigación sobre distribución de fases por área terapéutica.
- Componente de un pipeline de anotación más amplio (PsyNamic): usar el modelo junto a otros clasificadores del proyecto para generar metadatos estructurados de estudios en psiquiatría y neurociencia.
- Filtrado previo en herramientas de gestión de referencias: desplegar el modelo vía Text Embeddings Inference o un endpoint compatible para etiquetar automáticamente entradas nuevas y descartar las que no encajan en el criterio de fase.
- Prototipado rápido y bajo coste: al ser un modelo de 110 M de parámetros, permite iterar localmente en CPU o en una GPU consumer para validar la utilidad de la etiqueta antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado (96 abstracts), con el umbral ajustado de 0,16 e intervalos de confianza bootstrap del 95 % (1.000 remuestreos BCa):

| Métrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,777 [0,701–0,832] |
| Weighted precision | 0,691 [0,597–0,755] |
| Weighted recall | 0,887 [0,816–0,938] |

No se publican resultados comparativos frente a otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que la tarea es de clasificación biomédica específica y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (110 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en T4, L4, RTX 3060/4060 y superiores. Para lotes grandes, A10G, L40S, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante); también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`), exportación a ONNX y cuantización dinámica de PyTorch para CPU. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (cientos a miles de abstracts por segundo en lote), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scibert-clinical-trial-phase-20261106 | 109,9 M | 512 tokens | Clasificación multi-etiqueta de fase de ensayo clínico | apache-2.0 | Hugging Face (STRIDE-lab) |
| STRIDE-lab/clinicalbert-clinical-trial-phase-20250221 | no disponible en la información | no disponible | Misma tarea (checkpoint previo, tag `submission-v1`) | no disponible | Hugging Face (STRIDE-lab) |
| allenai/scibert_scivocab_uncased (modelo base) | ~110 M | 512 tokens | Modelo de lenguaje enmascarado científico; requiere fine-tuning para clasificación | apache-2.0 | Hugging Face (allenai) |
| BiomedBERT-abstract / BioBERT / BioLinkBERT / ClinicalBERT | ~110 M (BERT base) | 512 tokens | Modelos base biomédicos; fine-tuneados en el mismo experimento pero no publicados como checkpoints en esta ficha | varía según modelo base | Hugging Face |

La comparación directa de rendimiento solo está disponible frente al checkpoint previo de la misma familia, que este modelo sustituye según la model card; no se aportan métricas del checkpoint anterior en la información disponible.

## Limitaciones y advertencias

- La fase de ensayo clínico fue excluida del conjunto final de parámetros de PsyNamic por su baja informatividad (predominio de etiquetas "Unknown" o "Not Applicable") y baja concordancia entre anotadores; las predicciones no se muestran en la webapp ni se reportan en el artículo.
- El conjunto de test es muy pequeño (96 abstracts), lo que limita la robustez de las métricas y su generalización a otros dominios o estilos de redacción.
- El umbral de 0,16 está calibrado para la webapp de PsyNamic y prioriza recall (0,887) sobre precisión (0,691); en producción puede requerir recalibración según el coste relativo de falsos positivos y falsos negativos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la asignación de etiquetas, especialmente en abstracts ambiguos o sin información explícita de fase.
- Solo admite inglés; textos en otros idiomas no están soportados.
- Longitud máxima de 512 tokens: abstracts más largos se truncan y pueden perder información relevante sobre la fase.
- El dataset de entrenamiento es privado y no se documenta su tamaño, composición ni procedencia, lo que dificulta evaluar sesgos de dominio o de anotación.
- Licencia apache-2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el rendimiento en dominios distintos al biomédico inglés.
- El modelo no es un clasificador de calidad ni de relevancia clínica; solo asigna fase de ensayo y no debe usarse como única fuente para decisiones clínicas o regulatorias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/scibert-clinical-trial-phase-20261106
- Checkpoint previo sustituido: https://huggingface.co/STRIDE-lab/clinicalbert-clinical-trial-phase-20250221
- Modelo base: https://huggingface.co/allenai/scibert_scivocab_uncased
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp de PsyNamic: https://psynamic.dcr.unibe.ch
