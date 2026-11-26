# unknownBrain/Survival-CMTLNet

## Resumen

Survival-CMTLNet es un modelo de aprendizaje profundo para imagen médica desarrollado por el usuario de Hugging Face `unknownBrain`. Extiende el marco de aprendizaje multitarea cooperativo CMTLNet (CFE/UFE/UCFC) para abordar de forma conjunta tres tareas sobre resonancia magnética preoperatoria de glioma: subtipado molecular (`1p/19q`, `IDH`), clasificación de grado (`LHG`) y modelado de supervivencia en tiempo hasta evento (Cox). El modelo se entrena y evalúa sobre la cohorte UCSF-PDGM, compuesta por volúmenes 3D multimodales (`T1`, `T1c`, `T2`, `FLAIR`) de 489 pacientes.

El repositorio no contiene pesos en formato de red neuronal convencional para inferencia genérica, sino un conjunto de checkpoints serializados con `pickle` (`.pkl`) para 5 particiones de validación cruzada, junto con el código de preprocesado, entrenamiento en dos etapas y evaluación. El tamaño del repositorio es de 6,5 GB y la licencia es MIT.

Su relevancia radica en la reproducibilidad: incluye resultados de evaluación con fuga de datos cero (exclusión de filas de seguimiento y separación estricta de identificadores de entrenamiento y test), análisis de ablación clínica, pruebas de permutación y análisis de interpretabilidad mediante oclusión del núcleo tumoral. Está orientado a investigadores en neurooncología e imagen médica, no a uso clínico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D multitarea (DenseNet como extractor, módulos CFE, UFE y UCFC) con cabeza de supervivencia Cox |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada volumétrica 3D de MRI, tamaño de parche no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos y documentación) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (checkpoints serializados con pickle, 5 folds) |

## Arquitectura y entrenamiento

La arquitectura se basa en un extractor convolucional 3D tipo DenseNet combinado con módulos de aprendizaje multitarea cooperativo: CFE (extracción de características compartidas), UFE (proyección de características) y UCFC (clasificación/fusión). El entrenamiento se organiza en dos etapas: una primera etapa de entrenamiento CFE (`Train_CMTLNet_Step1.py`) y una segunda etapa que incorpora UFE, UCFC y la pérdida de Cox 3D (`Train_CMTLNet_Step2.py`). El modelo procesa cuatro modalidades de MRI preoperatoria (`T1`, `T1c`, `T2`, `FLAIR`) registradas con transformación afín SRI24 y recortadas.

El entrenamiento se realiza sobre la cohorte UCSF-PDGM con validación cruzada de 5 folds. La partición de clasificación usa N = 489 pacientes y la de supervivencia N = 488 (se excluye un paciente con `OS = NaN`). Se excluyen las 12 filas de seguimiento (`_FU`) de entrenamiento y test, garantizando intersección vacía entre identificadores. No se documenta el número de tokens ni composición de dataset en el sentido de modelos de lenguaje; se trata de un dataset de imagen médica con metadatos clínicos desidentificados (TCIA). No se especifica uso de RLHF/DPO ni decodificación especulativa, por no ser aplicable a este dominio.

## Capacidades

- Clasificación de mutación `IDH` en glioma a partir de MRI multimodal preoperatoria.
- Clasificación de codeleción `1p/19q`.
- Clasificación de grado tumoral (`LHG`).
- Modelado de supervivencia en tiempo hasta evento mediante pérdida de Cox 3D y estimación de C-index de Harrell.
- Análisis de ablación multimodal: solo MRI, solo clínico (`Age+Sex`) y combinado.
- Estratificación de supervivencia en subgrupos (p. ej. pacientes `IDH`-wildtype).
- Interpretabilidad mediante sensibilidad a oclusión del núcleo tumoral y proyecciones UMAP de características.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de modelos de lenguaje.
- No dispone de modo thinking, visión natural, audio ni capacidades multilingües más allá del inglés en documentación.

## Casos de uso

- Investigación en neurooncología: evaluar la asociación entre características de MRI preoperatoria y subtipos moleculares (`IDH`, `1p/19q`) en cohortes retrospectivas, usando los checkpoints de 5 folds como referencia reproducible.
- Reproducción de estudios de supervivencia: emplear los scripts de evaluación con fuga cero (`evaluate_clean_5fold.py`) para replicar los C-index reportados y comparar con nuevas variantes arquitectónicas.
- Desarrollo de modelos de supervivencia en imagen médica: usar la pérdida de Cox 3D standalone (`survivalstandalone/`) como componente en pipelines propios con datos de glioma.
- Análisis de interpretabilidad: aplicar los scripts de oclusión del núcleo tumoral y proyección UFE para estudiar qué regiones contribuyen a la predicción de `IDH` y grado.
- Benchmarking de clasificación multitarea: comparar el rendimiento de arquitecturas propias frente a las métricas de referencia (p. ej. AUROC de `IDH` 0,9260 en pooled) sobre la misma partición de UCSF-PDGM.
- Docencia y formación: usar el repositorio como ejemplo completo de pipeline de preprocesado, entrenamiento en dos etapas, validación cruzada y análisis estadístico en imagen médica.
- Estudio de sesgos y desbalance de clases: analizar el caso de `1p/19q` (prevalencia 3,07 %) para diseñar estrategias de mitigación en datasets propios.

## Benchmarks y rendimiento

Clasificación multitarea (`Stage2_UCFC`, validación cruzada 5 folds, N = 489):

| Tarea | Exactitud media por fold (%) | Macro-F1 medio por fold (%) | AUROC medio por fold | Exactitud pooled [IC 95 %] | AUROC pooled [IC 95 %] |
|---|---|---|---|---|---|
| Mutación `IDH` | 90,77 ± 2,54 | 86,15 ± 4,33 | 0,9516 ± 0,0209 | 90,80 [88,34; 93,26] | 0,9260 [0,8927; 0,9555] |
| Grado tumoral `LHG` | 90,75 ± 4,54 | 86,82 ± 4,93 | 0,9733 ± 0,0126 | 90,80 [88,14; 93,25] | 0,9595 [0,9390; 0,9759] |
| Codeleción `1p/19q` | 96,30 ± 2,79 | 69,60 ± 19,42 | 0,6595 ± 0,3024 | 96,32 [95,09; 97,55] | 0,6470 [0,4498; 0,8295] |
| Media 3 tareas | 92,60 ± 2,46 | 80,86 ± 6,64 | — | — | — |

Supervivencia (N = 488):

| Modelo | Modalidad | C de Harrell por fold | C pooled [IC 95 %] | Log-Rank p | HR [IC 95 %] |
|---|---|---|---|---|---|
| `S1_Step2_Linear_Batch6 (Fc)` | MRI baseline | 0,6678 ± 0,0213 | 0,6627 [0,6283; 0,6985] | 2,43e-13 | 2,56 [1,97; 3,31] |
| `S2b_Fc_PCA50_Cox` | Mejor solo MRI | 0,6879 ± 0,0330 | 0,6823 [0,6478; 0,7148] | 1,94e-16 | 2,87 [2,21; 3,73] |
| `S9_PreOp_Clinical_AgeSex` | Clínico (`Age+Sex`) | 0,7087 ± 0,0276 | 0,7046 [0,6703; 0,7362] | 1,07e-16 | 2,94 [2,25; 3,83] |
| `S12b_Fc_PCA50_Plus_PreOp_Cox` | MRI + `Age+Sex` | 0,7072 ± 0,0279 | 0,7038 [0,6703; 0,7348] | 1,82e-15 | 2,78 [2,14; 3,62] |

En pacientes `IDH`-wildtype (n = 385), `S2b_Fc_PCA50_Cox` alcanza Log-Rank p = 5,37e-03 y HR = 1,44. Añadir MRI a `Age+Sex` (`S12b`) no supera a `Age+Sex` solo (`S9`, p = 0,9592).

Interpretabilidad (N = 30): la sensibilidad a oclusión del núcleo tumoral es 47,8× la del tejido normal contralateral; la proyección UFE reduce la correlación coseno de características (0,6616 → 0,3233) y aumenta el silhouette UMAP de `IDH` (0,133 → 0,441).

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no documenta requisitos de memoria ni tamaño de lote de inferencia.
- GPU recomendadas: no disponible. El código de entrenamiento (`Batch6` en la nomenclatura de ablaciones) sugiere lotes pequeños, pero no se especifican modelos de GPU.
- Cabe en GPU de consumo: no confirmado. El tamaño del repositorio (6,5 GB) corresponde principalmente a checkpoints y resultados, no a requisitos de inferencia.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicable a este tipo de modelo). El despliegue previsto es mediante los scripts Python del repositorio con checkpoints `.pkl`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto / entrada | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Survival-CMTLNet | CNN 3D multitarea para glioma | no disponible | MRI 3D multimodal (`T1`, `T1c`, `T2`, `FLAIR`) | AUROC `IDH` 0,9260; `LHG` 0,9595; C-index supervivencia 0,6823 (pooled) | MIT | Hugging Face (repo `unknownBrain/Survival-CMTLNet`) |
| CMTLNet (Liu et al., 2025) | Marco base multitarea para glioma | no disponible | MRI 3D multimodal | Referencia metodológica citada; métricas no incluidas en la información disponible | no disponible | Publicación en *Medical Image Analysis* |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- El repositorio contiene checkpoints en `.pkl`, lo que implica riesgos de seguridad al cargar objetos serializados con `pickle`; conviene auditar el código antes de deserializar.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni generación de texto. Cualquier uso fuera de imagen médica de glioma no está soportado.
- El rendimiento en `1p/19q` está dominado por la clase mayoritaria: prevalencia de 15/489 (3,07 %), con Macro-F1 de 69,60 % y solo 4/15 casos positivos recuperados; la exactitud del 96,32 % no debe interpretarse como buena sensibilidad.
- La supervivencia basada solo en MRI (C-index 0,6823) no supera a la clínica `Age+Sex` (0,7046), y la combinación no mejora al modelo clínico (p = 0,9592); los datos demográficos dominan la señal.
- Entrenado y evaluado únicamente sobre la cohorte UCSF-PDGM; la generalización a otras instituciones, escáneres o protocolos de adquisición no está validada.
- Idioma de documentación y metadatos en inglés; el modelo no procesa texto libre ni otros idiomas.
- No apto para uso clínico directo ni para decisiones diagnósticas o pronósticas sin validación externa y aprobación regulatoria.
- Licencia MIT permite uso comercial del código, pero los datos UCSF-PDGM (TCIA, CC BY 4.0) tienen sus propias condiciones de atribución.
- Riesgo de alucinación no aplicable en el sentido de modelos generativos; el riesgo relevante es de sobreajuste y calibración deficiente en subgrupos minoritarios.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; ausencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unknownBrain/Survival-CMTLNet
- Resultados completos: `results/path_c/path_c_complete_results.md` (dentro del repositorio)
- Limitaciones y notas estadísticas: `results/path_c/LIMITATIONS_AND_STATISTICAL_NOTES.md` (dentro del repositorio)
- Artículo base CMTLNet: Liu et al., "Cooperative multi-task learning and interpretable image biomarkers for glioma grading and molecular subtyping", *Medical Image Analysis* 101 (2025) 103435
- Cohorte UCSF-PDGM: Calabrese et al., "The University of California San Francisco Preoperative Diffuse Glioma MRI Dataset", *Radiology: Artificial Intelligence* 4(6) (2022) e220058 (TCIA, CC BY 4.0)
