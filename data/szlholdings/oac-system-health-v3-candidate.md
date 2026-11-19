# SZLHOLDINGS/oac-system-health-v3-candidate

## Resumen

OAC System Health v3 Candidate es un artefacto de clasificación tabular publicado por SZLHOLDINGS en Hugging Face. No es un modelo de lenguaje ni un transformer: se trata de una regresión logística minúscula serializada en JSON, acompañada de un kernel en Python de biblioteca estándar (`oac_operational_health.py`) que emite una recomendación de atención operativa no autoritativa sobre telemetría sintética de transporte. El modelo está pensado para inspección reproducible y para puntuar datos sintéticos con un esquema fijo de ocho campos, no para producción real.

La relevancia de esta ficha es acotada: el artefacto destaca por su trazabilidad (receipts, hashes SHA-256, commits fijados en GitHub y Hugging Face) y por su dependencia nula de frameworks, no por su capacidad predictiva. Las métricas publicadas se calculan exclusivamente sobre un split de test sintético (semilla 2500) y el propio autor las etiqueta como no verificadas y no representativas de telemetría del mundo real.

El modelo no acepta ni procesa PHI, no interpreta resultados clínicos y no debe confundirse con un sistema sanitario pese al nombre histórico "clinical" que aún aparece en el repositorio del dataset. Cualquier evaluación de idoneidad para producción debe partir de esa frontera explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (clasificador lineal tabular), serializada en JSON |
| Parámetros totales | no disponible (no se declara el número de coeficientes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de ocho campos fijos) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.json` (JSON propio) más kernel Python de biblioteca estándar; no es safetensors ni GGUF |
| Pipeline | `tabular-classification` |
| Dependencias | biblioteca estándar de Python; sin PyTorch, Transformers ni GPU |
| Dataset de entrenamiento/evaluación | `SZLHOLDINGS/oac-clinical-transport-observability-synthetic`, revisión `f7ab6170` |
| Reproducibilidad | `artifact_receipt.json` con `kernel_sha256` (`5e06ddff…7202e`) y commits fijados |

## Arquitectura y entrenamiento

El modelo es una regresión logística clásica sobre un vector tabular de ocho campos, con salida binaria interpretada como recomendación de atención del operador. No hay capas ocultas, atención, embeddings ni tokenizador. El artefacto se compone de `model.json` (coeficientes y metadatos), `example_input.json`, `LICENSE` y el kernel `oac_operational_health.py`, que implementa la inferencia con la biblioteca estándar de Python y aplica comprobaciones de robustez añadidas en revisiones posteriores: rechazo de claves duplicadas, autoverificación de `kernel_sha256`, acotación de literales enteros y límite de profundidad de anidamiento.

El entrenamiento se realizó sobre un dataset sintético de telemetría operativa de transporte, generado con semilla fija y publicado como `oac-clinical-transport-observability-synthetic` en la revisión `f7ab6170`. El autor no documenta el número de tokens ni de muestras, la composición exacta del dataset, ni si hubo calibración posterior, RLHF o ajuste por umbral. El umbral operativo declarado es 0,16, aplicado sobre la probabilidad del clasificador; no se indica cómo se seleccionó. La procedencia está fijada al commit `0e9812f989b3548ddcff7e24443da3cb5764cf50` de `szl-forge` y a la revisión de Hub `dd7d109813abcd90c5250106dc2eabd2804e7ac3`, con dos reemplazos posteriores del kernel documentados (`ed0a3bbd` y la sincronización de la rama `szl/oac-kernel-sync-extreme-inputs`).

## Capacidades

- Clasificación binaria tabular sobre un esquema fijo de ocho campos de telemetría operativa sintética.
- Emisión de una recomendación de atención del operador, explícitamente no autoritativa.
- Inferencia sin GPU y sin dependencias externas, ejecutable con la biblioteca estándar de Python.
- Verificación de integridad del artefacto mediante `artifact_receipt.json` y `kernel_sha256`.
- Reproducción byte a byte de los ficheros publicados a partir del commit fijado de `szl-forge`.
- Robustez frente a entradas extremas: rechazo de claves duplicadas, acotación de enteros y límite de profundidad de anidamiento en el parser.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No soporta multilingüismo: no hay procesamiento de lenguaje natural.

## Casos de uso

- Auditoría de artefactos reproducibles: el modelo sirve como ejemplo de publicación con receipts, hashes y commits fijados, útil para equipos que diseñan pipelines de trazabilidad de modelos pequeños.
- Docencia y formación en MLOps: permite mostrar el ciclo completo de serialización JSON, verificación de integridad y despliegue sin frameworks en una sola sesión práctica.
- Pruebas de integración de kernels en Python puro: el fichero `oac_operational_health.py` se puede usar como caso de test para validar parsers estrictos, rechazo de claves duplicadas y límites de anidamiento.
- Scoring de datos sintéticos de observabilidad: útil para generar etiquetas de referencia en un dataset sintético de transporte antes de entrenar modelos mayores, siempre que se respete el esquema de ocho campos.
- Reproducción de métricas publicadas: el par modelo-dataset permite reejecutar el split de test con semilla 2500 y comprobar ROC AUC, balanced accuracy, recall, precision y F1 declarados.
- Validación de pipelines de clasificación tabular: sirve como baseline trivial y determinista contra el que comparar modelos tabulares más complejos en tareas de observabilidad operativa.
- Ejemplo de frontera de alcance en documentación de modelos: la model card detalla explícitamente usos fuera de alcance (clínica, HL7, dispositivos médicos), lo que lo convierte en material útil para políticas internas de revisión de modelos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index`, calculados exclusivamente sobre el split de test sintético (semilla 2500) del dataset `SZLHOLDINGS/oac-clinical-transport-observability-synthetic`, revisión `f7ab6170`. Ninguna métrica está verificada de forma independiente (`verified: false`).

| Métrica | Valor | Conjunto |
|---|---|---|
| ROC AUC | 0,830169104679 | Sintético (test) |
| Balanced accuracy (umbral 0,16) | 0,741363211951 | Sintético (test) |
| Recall | 0,78431372549 | Sintético (test) |
| Precision | 0,412371134021 | Sintético (test) |
| F1 | 0,540540540541 | Sintético (test) |

No se han publicado resultados sobre datos reales, ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia corre en CPU con la biblioteca estándar de Python.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica; el modelo no usa aceleración por hardware.
- Memoria RAM: mínima, del orden de kilobytes para el JSON de coeficientes y el intérprete de Python.
- Opciones de despliegue: ejecución directa del kernel `oac_operational_health.py`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers.pipeline()`.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (producto escalar de ocho entradas) se espera un coste despreciable por invocación, pero no hay cifras medidas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. A modo de referencia estructural, se contrasta con alternativas genéricas de clasificación tabular, sin datos de rendimiento comparables:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| OAC System Health v3 Candidate | Regresión logística JSON | no disponible | no aplica | Apache 2.0 | Python estándar |
| Regresión logística scikit-learn | Lineal tabular | no disponible | no aplica | BSD-3 | scikit-learn |
| XGBoost / LightGBM | Gradient boosting | no disponible | no aplica | Apache 2.0 / MIT | librerías nativas |
| MLP tabular pequeño | Red neuronal | no disponible | no aplica | variable | PyTorch / ONNX |

La comparación de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrena y evalúa únicamente sobre datos sintéticos con semilla fija; no hay evidencia de generalización a telemetría real.
- Las métricas publicadas están marcadas como no verificadas (`verified: false`) y el autor las etiqueta explícitamente como sintéticas.
- La precision de 0,41 al umbral 0,16 implica una tasa alta de falsos positivos; no es un clasificador calibrado.
- No es un modelo médico, diagnóstico, pronóstico, de triaje ni de decisión clínica; no debe recibir PHI ni contenido clínico.
- No puede aceptar, rechazar o reconocer mensajes HL7, ni identificar o comandar dispositivos médicos, ni interpretar o liberar resultados.
- No procesa texto libre ni lenguaje natural; el esquema de entrada está limitado a ocho campos tabulares.
- No es compatible con `AutoModel`, `pipeline()` ni safetensors; intentar cargarlo con esas herramientas fallará.
- La licencia Apache 2.0 permite uso comercial, pero el alcance funcional del modelo es tan estrecho que cualquier uso en producción requeriría validación adicional no documentada.
- El nombre del dataset conserva la palabra histórica "clinical", lo que puede inducir a confusión sobre su naturaleza; los ficheros son telemetría operativa sintética.
- No se documenta el número de muestras de entrenamiento, la composición del dataset ni el criterio de selección del umbral 0,16.
- El identificador del repositorio es `oac-system-health-v3-candidate`, mientras que el `model-index` interno referencia `SZLHOLDINGS/oac-system-health-v1`; conviene verificar la correspondencia antes de citar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/oac-system-health-v3-candidate
- Dataset compañero: https://huggingface.co/datasets/SZLHOLDINGS/oac-clinical-transport-observability-synthetic/tree/f7ab6170bf78138b187b8cb707d374a25ad85375
- Código fuente fijado (szl-forge, commit `0e9812f9`): https://github.com/szl-holdings/szl-forge/tree/0e9812f989b3548ddcff7e24443da3cb5764cf50/clinical-gateway
- Árbol `main` de szl-forge (puede divergir): https://github.com/szl-holdings/szl-forge/tree/main/clinical-gateway
- Commit de sincronización del kernel: https://github.com/szl-holdings/szl-forge/commit/0e9812f989b3548ddcff7e24443da3cb5764cf50
- Revisión de Hub del artefacto: https://huggingface.co/SZLHOLDINGS/oac-system-health-v1/tree/dd7d109813abcd90c5250106dc2eabd2804e7ac3
- Demo (Command Lab): https://huggingface.co/spaces/SZLHOLDINGS/szl-command-lab
- Perfil del autor: https://huggingface.co/SZLHOLDINGS
- Paper referenciado en tags (arXiv 2308.07832): https://arxiv.org/abs/2308.07832
