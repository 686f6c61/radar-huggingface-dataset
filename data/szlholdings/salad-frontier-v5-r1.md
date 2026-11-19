# SZLHOLDINGS/salad-frontier-v5-r1

## Resumen

salad-frontier-v5-r1 es un artefacto de entrenamiento candidato publicado por SZL Holdings dentro de su programa de entrenamiento de IA gobernada, bajo lo que el autor denomina "doctrina de recibos medidos fail-closed". No se trata de un modelo base entrenado desde cero, sino de un adaptador LoRA (el propio autor lo llama "adapter") construido sobre el modelo NVIDIA Nemotron-3-Nano-4B-BF16, con un repositorio de 0,2 GB que contiene una escalera de checkpoints (50/100/150/200) más un directorio final/ y 67 ficheros de artefactos.

El modelo resuelve, según la documentación, un problema de trazabilidad y evaluación honesta: cada ejecución de entrenamiento y evaluación queda registrada en recibos públicos con métricas medidas (tiempo de pared, energía vía NVML, hashes de datos), y el autor publica explícitamente los resultados negativos. De hecho, la model card principal documenta que este adaptador **falla** los criterios de evaluación reescritos v2.1: reprueba en refusal two-sided (0,75 frente a 0,10 del base aislado) y en neutral (0,25 frente a 0,95), aunque aprueba contaminación (0/40 regurgitación literal de prefijos de entrenamiento) e IDs inventados (2/15 = 0,133, umbral 0,20).

La relevancia del artefacto es, por tanto, metodológica más que de capacidades: es un ejemplo de publicación de resultados negativos con cadena de custodia verificable. No hay ninguna afirmación de capacidad, no se autoriza promoción a producción y el propio autor indica que la calidad histórica held-out de la v1 "no está establecida". El contexto, el número de parámetros y los datos de entrenamiento no se especifican en la información disponible más allá de la referencia al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador (LoRA) sobre NVIDIA Nemotron-3-Nano-4B-BF16; arquitectura del base no detallada en la información disponible |
| Parámetros totales | No disponible (el repositorio ocupa 0,2 GB; el base es un modelo de 4B según su nombre) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; el base se evaluó en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de ajuste fino (LoRA) sobre el checkpoint `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` en la revisión `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`. El repositorio incluye una escalera de checkpoints en los pasos 50, 100, 150 y 200, más un directorio `final/`, lo que sugiere un entrenamiento corto por número de pasos. Los datos de entrenamiento están fijados por sha256, pero su composición, número de tokens y cualquier fase de RLHF/DPO no se detallan en la información proporcionada.

La innovación declarada no es arquitectónica sino de proceso: el autor aplica una "doctrina fail-closed de recibos medidos", con recibos públicos que registran tiempo de pared (861,3 s en la evaluación principal), energía medida por NVML (144.680.892 J) y hashes de los datos. La model card incluye una enmienda de integridad que corrige afirmaciones anteriores: los campos `energy_j` de la v1 contenían milijulios, no julios, y la evaluación held-out histórica de la v1 no aisló el brazo base, por lo que su calidad no queda establecida. No se cambiaron pesos ni se ejecutó una nueva evaluación de GPU en esa enmienda.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Nemotron-3-Nano-4B.
- El autor no declara capacidades específicas adicionales (código, matemáticas, visión, tool calling, agentes o modo thinking) para este adaptador.
- La evaluación documentada se centra en comportamiento de rechazo (refusal), respuestas neutrales, contaminación por memorización y generación de identificadores inventados.
- No se documenta soporte multilingüe más allá del inglés.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Auditoría de metodología de evaluación: el repositorio sirve como caso de estudio reproducible de cómo publicar resultados negativos con recibos verificables (tiempo, energía, hashes) y enmiendas de integridad.
- Investigación sobre ajuste fino con LoRA: la escalera de checkpoints (50/100/150/200) permite estudiar la evolución del comportamiento de rechazo y neutralidad a lo largo del entrenamiento.
- Estudio de contaminación de datos: los recibos de regurgitación de prefijos de entrenamiento (0/40, cota superior del 95 % del 7,2 %) son un ejemplo práctico de test de contaminación aplicado a un adaptador.
- Reproducción de evaluaciones en GPU de consumo: la evaluación se ejecutó en una RTX 3090, lo que permite replicar el pipeline en hardware asequible.
- Referencia para pipelines de "recibos medidos": equipos que necesiten diseñar sistemas de trazabilidad de entrenamiento pueden usar la estructura de `receipts/` y el manifiesto de auditoría como plantilla.
- Docencia sobre evaluación honesta de modelos: el contraste entre la primera pasada v2 (con el LoRA adjunto al brazo base, superseded) y la v2.1 (con aislamiento del brazo base) ilustra errores comunes de diseño experimental.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación de criterios v2.1 sobre el conjunto held-out, ejecutada el 17 de noviembre de 2026 en una RTX 3090:

| Criterio | Adaptador | Base aislado | Umbral | Veredicto |
|---|---|---|---|---|
| c3 refusal two-sided | 0,75 | 0,10 | \|delta\| ≤ 0,15 | FAIL (delta 0,65) |
| c4 neutral | 0,25 | 0,95 | \|delta\| ≤ 0,10 | FAIL (delta 0,70) |
| c2 contaminación (regurgitación de prefijos) | 0/40 (UB 95 %: 7,2 %) | — | — | PASS |
| c5 IDs inventados | 2/15 = 0,133 | — | tau 0,20 | PASS |

La batería de evaluación se declara "REFUSED (honest gate)": el control roto por scramble no activó sus reglas de disparo agregadas, con causa raíz registrada como sensibilidad de las reglas a n=10/20. El veredicto de fallo en c3/c4 es independiente de esta inadmisibilidad y se mantiene. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el modelo base es de 4B parámetros y se evaluó en BF16 sobre una RTX 3090 (24 GB), configuración que cabe holgadamente.
- GPU recomendadas: RTX 3090 (usada en la evaluación documentada); cualquier GPU con al menos 24 GB para el base en BF16.
- Cabe en GPU de consumo: sí, según la evaluación en RTX 3090.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publica el tiempo de pared de la batería de evaluación completa (861,3 s) y su energía (144.680.892 J).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| salad-frontier-v5-r1 | Adaptador sobre base de 4B | No disponible | Apache 2.0 | Artefacto candidato, falla criterios v2.1 |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4B | No disponible | No disponible en la información proporcionada | Modelo base de referencia |
| salad-frontier-v5-r7 | No disponible | No disponible | No disponible | Ejecución hermana del mismo programa, con recibo de finalización público |
| salad-frontier-v4-r1 | No disponible | No disponible | No disponible | Ejecución anterior del mismo programa, con recibo de finalización público |

No se dispone de datos de rendimiento comparables de benchmarks estándar para ninguno de los modelos listados en la información proporcionada.

## Limitaciones y advertencias

- El adaptador **falla** los criterios de evaluación v2.1 en refusal two-sided y neutral; no debe promocionarse a producción.
- El autor declara explícitamente que no se autoriza promoción a producción y que no se hace ninguna afirmación de capacidad.
- La calidad histórica held-out de la v1 no está establecida: el fuente archivado no aisló el brazo base y su regla neutral admite cualquier precisión en la línea base registrada.
- Los campos `energy_j` de la v1 contienen milijulios, no julios; los recibos originales se conservan sin corregir.
- La batería de evaluación v2.1 se declara inadmisible (control scramble sin disparo), aunque el veredicto de fallo c3/c4 se mantiene independientemente.
- Riesgo de alucinación de identificadores: el adaptador generó 2/15 IDs inventados (dentro del umbral de 0,20, pero no nulo).
- Sesgo de rechazo: el adaptador rechaza más que el base (0,75 frente a 0,10), con la advertencia de que el rechazo del base en estilo de razonamiento queda subestimado por la regla de marcador canónico.
- Idioma limitado al inglés; no se documentan otros idiomas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero al ser un adaptador sobre un base de terceros, las condiciones del base aplican adicionalmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-frontier-v5-r1
- DOI del registro de tesis: https://doi.org/10.5281/zenodo.19944926
- Enmienda de integridad: https://huggingface.co/SZLHOLDINGS/salad-frontier-v5-r1/blob/main/receipts/integrity-amendment-20261116T181433Z/AMENDMENT.md
- Recibo principal v2.1: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/collaboration/vgl-criteria-v2/salad-v5-heldout-v2-20261117T031434.json
- Primera pasada v2 (superseded): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/collaboration/vgl-criteria-v2/salad-v5-heldout-v2-20261117T025004.json
- Directorio de recibos de criterios v2: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/tree/main/collaboration/vgl-criteria-v2
- Dataset completo de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Recibo de finalización v5-r7: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/salad-frontier-v5-r7/result.json
- Recibo de finalización v4-r1: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/salad-frontier-v4-r1/result.json
- Metadatos terminales x402-frontier-v6: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/x402-frontier-v6-terminal-metadata/result.json
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
