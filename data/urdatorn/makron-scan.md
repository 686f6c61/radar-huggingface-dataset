# Urdatorn/Makron-scan

## Resumen

Makron-scan es un clasificador de texto basado en `distilbert/distilroberta-base` afinado para la clasificación automática de métrica hexamétrica en griego antiguo. Lo desarrolla Urdatorn como parte del trabajo "Automatic annotation of Ancient Greek vowel length", y su función es predecir la clase métrica (31 clases posibles) de un verso griego, comparando el rendimiento entre texto plano y texto con anotación de cantidad vocálica (macronización). Es un modelo de investigación, no un modelo generativo: se usa para evaluar cómo afecta la anotación de vocales largas a una tarea métrica descendente.

El modelo se entrena sobre 52.119 versos alineados procedentes de 74 ficheros fuente, con un reparto de 41.695/5.212/5.212 (entrenamiento/validación/test). La aportación principal no es el clasificador en sí, sino el experimento controlado: los mismos registros e identificadores se procesan en variante plana y macronizada, de modo que la diferencia de precisión (media de 6,80 ± 3,14 pp a favor de la macronización) es atribuible a la anotación de cantidad vocálica.

Es relevante para investigadores en filología clásica computacional y en procesamiento de lenguas históricas, porque cuantifica el valor de una anotación lingüística costosa (la cantidad vocálica) sobre una tarea métrica concreta, con intervalos de confianza y pruebas de McNemar. El repositorio pesa 3,9 GB, aunque los pesos del clasificador son 318 MB por variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) con cabeza de clasificación |
| Parametros totales | 82,1 M (7,7 M entrenables: última capa del encoder y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `distilroberta-base`, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | griego antiguo (`grc`) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (`best_model/model.safetensors`, 318 MB por variante) |

## Arquitectura y entrenamiento

Se parte de `distilbert/distilroberta-base`, un encoder tipo RoBERTa destilado, y se afinan únicamente la última capa del encoder y la cabeza de clasificación: 7,7 M de parámetros entrenables sobre 82,1 M totales. La tarea es clasificación multiclase de 31 clases métricas, con la restricción de que los metros cumplen el patrón `^(--|-uu|uuuu){5}--$` y cada clase aparece al menos 10 veces. El entrenamiento se ejecutó durante 30 épocas, con batch de 16 y sin acumulación de gradiente, sobre una GPU Intel Arc (XPU), usando un esquema contrarrestado de múltiples semillas (13, 42 y 2026) mediante `scripts/run_multiseed_experiment.py`. Los mejores checkpoints se seleccionaron por precisión de validación y cayeron entre las épocas 22 y 29.

El dataset consta de 52.119 versos alineados de 74 ficheros fuente, con identificadores y reparto idénticos entre la variante plana y la macronizada. Existen dos macronizaciones: la actual (`data_makron/macronized/`, generada con `Urdatorn/Makron-seed1` mediante `scripts/macronize_jsonl_makron.py`) y una anterior (`data/macronized/`, con `Ericu950/oga-macronizer-char`). Difieren en un 20 % de las líneas, sobre todo por más marcas de vocal larga en la versión Makron (21.853 frente a 20.321 en entrenamiento). No se documenta uso de RLHF ni DPO; es un ajuste supervisado estándar de clasificación.

## Capacidades

- Clasificación de métrica hexamétrica en griego antiguo en 31 clases, a partir de un verso.
- Evaluación del efecto de la macronización (anotación de cantidad vocálica) sobre la clasificación métrica descendente.
- Procesamiento de texto griego antiguo exclusivamente (`grc`); no cubre otras lenguas.
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Salida de clasificación con etiqueta de clase métrica; no se documenta calibración de probabilidades ni umbrales.

## Casos de uso

- Investigación en métrica griega: usar el clasificador para etiquetar automáticamente la métrica de corpus de hexámetros y comparar la precisión con y sin macronización, replicando el experimento del paper con las tres semillas documentadas.
- Validación de macronizadores: emplear la diferencia de precisión entre variante plana y macronizada como métrica indirecta de calidad de un macronizador (por ejemplo, comparar `Makron-seed1` con `oga-macronizer-char`, que difieren en un 20 % de las líneas).
- Curación de corpus: filtrar o marcar versos con métrica dudosa en ediciones digitales, aprovechando las 31 clases y la restricción de patrón métrico para detectar anomalías.
- Docencia de filología clásica: generar etiquetas de referencia para ejercicios de escansión, con la salvedad de que la precisión media ronda el 79 % en la variante macronizada y el 72 % en la plana.
- Evaluación de anotaciones lingüísticas: usar el marco experimental (mismos IDs y splits en ambas variantes) como plantilla para medir el impacto de otras anotaciones (acentuación, dialecto) en tareas descendentes.
- Reproducibilidad de resultados: reentrenar con `scripts/train_meter_classifier.py` y el esquema de semillas para verificar los intervalos bootstrap (5,3–8,3 pp) publicados.

## Benchmarks y rendimiento

Precisión en test sobre 5.212 versos, con ganancias en puntos porcentuales absolutos (pp) y relativos frente a la línea base plana. Ambos clasificadores usan `distilroberta-base` con la última capa y la cabeza entrenables.

| Semilla | Plano | Macronizado | Ganancia absoluta | Ganancia relativa | p de McNemar |
|---|---|---|---|---|---|
| 13 | 72,4 % | 80,7 % | 8,25 pp | 11,39 % | 4e-48 |
| 42 | 72,2 % | 78,1 % | 5,93 pp | 8,21 % | 7e-24 |
| 2026 | 72,3 % | 78,5 % | 6,22 pp | 8,60 % | 7e-27 |
| **Media ± intervalo t al 95 %** | 72,3 % | 79,1 % | **6,80 ± 3,14 pp** | 9,40 ± 4,31 % | — |

El intervalo bootstrap jerárquico al 95 % de la ganancia es 5,3–8,3 pp. Los mejores checkpoints se situaron entre las épocas 22 y 29. Los valores por semilla están en `models_30epochs_makron/seed_*/comparison.json` y el agregado en `models_30epochs_makron/aggregate_summary.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos son 318 MB por variante en safetensors (fp32); en fp16 rondaría 160 MB y en int8 unos 80 MB, más overhead de activaciones. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el entrenamiento se hizo en una Intel Arc (XPU). Para inferencia basta una GPU integrada o una GTX 1650 en adelante.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1–2 GB de VRAM libre, y en CPU sin problema.
- Opciones de despliegue: `transformers` (librería declarada), con pipeline `text-classification`; compatible con endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son orientados a modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| Makron-scan | distilroberta-base | 82,1 M (7,7 M entrenables) | no disponible | Clasificación métrica griega (31 clases) | GPL-3.0 |
| `Ericu950/oga-macronizer-char` | no disponible | no disponible | no disponible | Macronización de griego antiguo | no disponible |
| `Urdatorn/Makron-seed1` | no disponible | no disponible | no disponible | Macronización de griego antiguo | no disponible |
| distilroberta-base (base) | — | 82,1 M | 512 tokens (estándar RoBERTa) | Modelo de lenguaje enmascarado | MIT |

No se dispone de otros clasificadores métricos comparables en la información proporcionada; la comparación con los macronizadores es indirecta, ya que resuelven una tarea distinta (anotación de cantidad frente a clasificación de metro).

## Limitaciones y advertencias

- Modelo de investigación: el autor lo presenta como un experimento para medir el efecto de la macronización, no como una herramienta lista para producción.
- Precisión limitada: 79,1 % de media en la mejor variante; un 21 % de versos se clasifica incorrectamente, lo que desaconseja su uso como etiquetador automático sin revisión humana.
- Sesgos: el corpus procede de 74 ficheros fuente y 31 clases con al menos 10 ejemplos; la distribución de autores, épocas y dialectos no se detalla, por lo que puede no representar toda la hexametría griega.
- Riesgo de sobreajuste al esquema de anotación: la variante macronizada depende de `Makron-seed1`; con otro macronizador los resultados pueden diferir (las dos macronizaciones discrepan en un 20 % de las líneas).
- Solo griego antiguo (`grc`); no soporta otras lenguas ni texto mixto.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribución; conviene revisar la compatibilidad antes de integrarlo en productos propietarios.
- No hay datos publicados sobre latencia, cuantización ni longitud de contexto efectiva; la ventana se hereda de `distilroberta-base` y no se valida para versos largos.
- El repositorio pesa 3,9 GB aunque los pesos útiles son 318 MB por variante; el resto corresponde a artefactos del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/Makron-scan
- DOI del modelo: https://doi.org/10.57967/hf/11854
- Macronizador usado en el paper: https://huggingface.co/Urdatorn/Makron-seed1
- Macronizador de la versión anterior: https://huggingface.co/Ericu950/oga-macronizer-char
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
