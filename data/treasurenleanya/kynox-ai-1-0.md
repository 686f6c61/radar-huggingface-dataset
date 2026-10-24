# treasurenleanya/Kynox-AI-1.0

## Resumen

Kynox AI-1.0 es un artefacto de fusión publicado por el usuario treasurenleanya en HuggingFace que no contiene pesos de un modelo único, sino un contrato de servicio sobre un panel de 33 bases congeladas de visión-lenguaje especializadas en imagen médica. El repositorio (0,0 GB) incluye únicamente ficheros JSON de configuración: `manifest.json` con el hash del contrato y el modo de lanzamiento, `panel.json` con la tabla de enrutamiento completa (33 bases enrutadas, ~229,6B parámetros ponderados), `contract.json` con el contrato de preprocesado y `adapters.json` con el registro de adaptadores. Los pesos de las bases son referencias externas por ID de HuggingFace y se descargan en tiempo de ejecución desde sus repos upstream, cada uno bajo su propia licencia.

El problema que aborda es la fragmentación de la inferencia en imagen médica: en lugar de integrar N modelos con N contratos distintos, expone un único endpoint (`POST /v1/analyze` y una superficie de chat compatible con OpenAI) que devuelve un informe estructurado con hallazgos, confianza, candidatos ICD-10 y notas de condición. El enrutamiento selecciona entre 4 y 6 votantes por petición según la modalidad (CT, MRI, radiografía de tórax, patología, ecografía, mamografía, retina, frotis sanguíneo), con un tope que garantiza que el texto nunca supere en voto a la visión (al menos el 50 % del peso ponderado es de evidencia visual nativa en cada ruta).

Es relevante ahora por su estado declarado: 0 de n adaptadores están entrenados, el último run de entrenamiento falló 0/4 por errores de carga de dataset, y el propietario decidió servir las bases congeladas igualmente en modo `advisory`. Todos los informes serializados llevan `advisory_only: true` y `panel_state: frozen-untrained:advisory`, y la métrica `IS_A_MEASUREMENT` permanece en `false` para cualquier afirmación de calidad. Es, por tanto, un ejercicio de ingeniería de orquestación y contrato, no un modelo validado clínicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de mezcla de expertos (MoE) sobre panel de modelos visión-lenguaje congelados, con enrutamiento por modalidad y quórum de votación; no es un transformer único |
| Parámetros totales | ~229,6B (suma ponderada de las 33 bases del panel; el repositorio no contiene pesos propios) |
| Parámetros activos | No disponible. El enrutamiento selecciona 4-6 votantes por petición; no se publica la cifra de parámetros activos por ruta |
| Longitud de contexto | 262.144 tokens en la superficie de chat (retención de sesión); no disponible por base individual |
| Tipos de cuantización | No disponible. Depende de cada base upstream; el artefacto no incluye pesos cuantizados |
| Idiomas soportados | en, en-NG, ha, ig, yo, zu, sw (con valores por defecto de país, NG → inglés nigeriano) |
| Licencia | kynox-ai-proprietary-1.0 (los pesos base mantienen sus licencias de origen) |
| Formato de pesos | Sin pesos en el repositorio: artefacto JSON (`manifest.json`, `panel.json`, `contract.json`, `adapters.json`, `model_card.json`, `release.json`). Las bases se descargan de sus repos de HuggingFace en formato no especificado |

## Arquitectura y entrenamiento

La arquitectura es un ensemble orquestado, no una red entrenada de extremo a extremo. Un enrutador por modalidad selecciona entre 4 y 6 votantes de un roster específico (la profundidad del registro no equivale a residencia en memoria) y agrega las salidas mediante pesos de voto declarados en `manifest.json`. El diseño incorpora un tope de mayoría visual que limita el peso agregado del "nivel de prosa" para que la evidencia de visión nativa conserve al menos el 50 % del voto ponderado en cada ruta; según la model card, antes de aplicar el tope el texto superaba a la visión en 5 de 8 modalidades. Los productos de prosa (Lingshu-32B como drafter-1 y MedGemma-27B como drafter-2) no votan, y los modelos de conocimiento (MedCPT, BiomedBERT, SPECTER2) son solo de recuperación: nunca votan ni redactan. Se sirven cinco tareas (report, vqa, screening, segmentation, ehr_correlation) y cada ruta de tarea puede rechazar un hallazgo contestado mediante una puerta en tiempo de carga.

En cuanto a entrenamiento, no hay entrenamiento propio que reportar: 0 adaptadores están entrenados y el último run midió 4 bases con 0/4 de éxito por fallos de carga de dataset (configuraciones incorrectas de datasets de HuggingFace y columnas objetivo ausentes, con evidencia en `panel_run.json`). La decisión de lanzamiento del 2026-10-23 fue servir las bases congeladas en modo `advisory`, eximiendo la puerta de cobertura no entrenada solo para ese modo estampado y sustituyendo la negativa por un aviso prominente en cada informe de carga. Existe una pasarela de reconstrucción/denoising mediante hook de preprocesado y hash de contrato, con una política MergeKit documentada que permite composición únicamente para pilas de denoiser/adaptadores, nunca para votantes. La validación de carga comprueba acuerdo de contrato, coincidencia con el contrato del denoiser, cobertura de adaptadores por ruta, capacidad de rechazo del quórum, capacidad de rechazo por ruta de tarea y completitud de pesos de voto; cualquier fallo estructural impide servir.

## Capacidades

- Generación de informes radiológicos y de patología estructurados a partir de estudios de imagen, con hallazgos anotables, confianza y candidatos ICD-10.
- Clasificación y cribado (screening) sobre ocho modalidades: CT, MRI, radiografía de tórax, patología, ecografía, mamografía, retina y frotis sanguíneo.
- Segmentación de estructuras y lesiones como tarea servida dentro del mismo contrato.
- Correlación con historia clínica electrónica (tarea `ehr_correlation`).
- VQA médica sobre imagen única con `modality_hint`.
- Superficie de chat compatible con OpenAI (`/v1/models`, `/v1/chat/completions`) con entrada de audio y fotogramas de vídeo, retención de sesión sobre 262.144 tokens y manejo de interrupción (barge-in) con política de retención de cola.
- Transcripción de audio a texto mediante `POST /v1/audio/transcriptions`; no hay síntesis de voz (TTS).
- Multilingüismo limitado a siete variantes: inglés, inglés nigeriano, hausa, igbo, yoruba, zulú y suajili.
- Modo de lanzamiento conmutable: `KYNOX_LAUNCH_MODE=strict` restaura la negativa a servir hasta que el panel esté entrenado.
- Sin soporte documentado de tool calling genérico ni de razonamiento multi-paso fuera del flujo de análisis; el panel está restringido a modelos entrenados en imagen médica tras retirar los VLM de propósito general de los asientos de voto el 2026-10-23.

## Casos de uso

- Triaje de radiografías de tórax en entornos con escasez de radiólogos: el endpoint devuelve hallazgos con confianza y candidatos ICD-10 sobre una sola imagen, con el aviso `advisory_only` como señal explícita de que la salida requiere revisión humana.
- Segunda lectura en mamografía y patología: la votación entre 4-6 bases por modalidad permite señalar hallazgos contestados, que la puerta de rechazo por ruta puede marcar en lugar de promediar silenciosamente.
- Cribado poblacional en programas de salud pública africanos: el soporte de hausa, igbo, yoruba, zulú y suajili con valores por defecto NG permite informes en la lengua local del paciente o del técnico.
- Dictado y documentación clínica: la transcripción de audio nativa más el chat con retención de 262.144 tokens permite convertir una consulta hablada en un borrador de informe con contexto de la sesión completa.
- Investigación retrospective sobre cohortes de imagen: la tarea `ehr_correlation` combina hallazgos visuales con datos de historia clínica, útil para generar hipótesis antes de un estudio validado.
- Integración en PACS o visor diagnóstico propio: un único contrato de esquema de informe reduce el trabajo de integración frente a envolver por separado cada modelo de imagen médica.
- Evaluación comparativa de modelos médicos: al exponer `panel.json` con la tabla de enrutamiento completa, sirve como banco de pruebas para medir acuerdo entre bases congeladas antes de comprometerse a un fine-tuning.
- Despliegue con requisitos de cumplimiento: `KYNOX_LAUNCH_MODE=strict` y `KYNOX_API_KEY` permiten bloquear el servicio hasta que existan adaptadores entrenados y exigir autenticación en la superficie de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara que `IS_A_MEASUREMENT` permanece en `false` para cualquier afirmación de calidad hasta que se ejecuten las evaluaciones, y que el panel está en estado `frozen-untrained:advisory`.

| Benchmark | Kynox AI-1.0 | Notas |
|---|---|---|
| MMLU | No disponible | No se ha ejecutado |
| HumanEval | No disponible | No se ha ejecutado |
| GSM8K | No disponible | No se ha ejecutado |
| Métricas de imagen médica (sensibilidad, AUC por modalidad) | No disponible | No se ha ejecutado; 0 adaptadores entrenados |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia aritmética, ~229,6B parámetros en FP16 equivalentes a unos 460 GB de pesos; en 8 bits en torno a 230 GB; en 4 bits alrededor de 115 GB. Son estimaciones de orden de magnitud, no cifras publicadas.
- La model card indica que las bases externas ocupan "cientos de GB" y que la residencia real por petición es de 4-6 votantes, no del panel completo, por lo que el pico de VRAM depende de la ruta de modalidad activada.
- GPU recomendadas: cualquier host con NVIDIA GPU según el comando de despliegue documentado (`docker run --gpus all`); no se especifican modelos concretos (A100, H100, RTX 4090) ni configuraciones multi-GPU.
- GPU de consumo: no confirmado. Solo se garantiza que los endpoints de salud (`/v1/healthz`, `/v1/model`, `/v1/supported`, `/v1/models`) responden sin pesos en modo CPU-only smoke.
- Despliegue: imagen Docker propia construida desde `<repo>/python/kynox-eval` sobre base CUDA + PyTorch, con caché persistente vía `-v kynox-hf-cache:/root/.cache/huggingface` y `HF_TOKEN` para descargar las bases. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kynox AI-1.0 | ~229,6B agregados en 33 bases; 4-6 votantes por petición | 262.144 tokens en chat | Ensemble con enrutamiento y quórum sobre bases congeladas | kynox-ai-proprietary-1.0 | Artefacto JSON de 0,0 GB; pesos vía descarga externa |
| MedGemma-27B | 27B | No disponible | VLM médico único; en Kynox actúa como drafter-2 (no vota) | No disponible en la información proporcionada | Pesos públicos en HuggingFace |
| Lingshu-32B | 32B | No disponible | VLM médico único; en Kynox actúa como drafter-1 (no vota) | No disponible en la información proporcionada | Pesos públicos en HuggingFace |
| LLaVA-Med | No disponible en la información proporcionada | No disponible | VLM médico ajustado sobre LLaVA | No disponible en la información proporcionada | Pesos públicos en HuggingFace |

La comparación directa es asimétrica: los tres alternativas son modelos únicos con pesos publicados y evaluación reproducible, mientras que Kynox AI-1.0 es una capa de orquestación sin adaptadores entrenados ni benchmarks. Cualquier comparación de rendimiento entre ambos enfoques es, a día de hoy, no disponible.

## Limitaciones y advertencias

- El panel está en estado `frozen-untrained:advisory`: 0 adaptadores entrenados y el último run falló 0/4 por errores de carga de dataset. No debe interpretarse como un modelo validado.
- Todos los informes llevan `advisory_only: true`. Cualquier uso clínico sin revisión humana es inapropiado y potencialmente peligroso.
- Riesgo de alucinación: los redactores de prosa (Lingshu-32B, MedGemma-27B) generan texto que el panel no puede refutar por vía de voto, ya que no participan en la votación; el tope de mayoría visual mitiga pero no elimina la deriva textual.
- El repositorio no contiene pesos (0,0 GB): la carga depende de descargar 33 bases externas desde HuggingFace, con el coste de ancho de banda, el tiempo de arranque y el riesgo de que una base upstream desaparezca o cambie de revisión.
- Licencia propietaria `kynox-ai-proprietary-1.0`: es necesario revisar los términos del fichero `LICENSE` antes de cualquier uso comercial. Además, las licencias de las bases subyacentes aplican de forma independiente y pueden ser más restrictivas (por ejemplo, licencias de uso sanitario no comercial).
- Cobertura lingüística reducida a siete lenguas, con sesgo declarado hacia el contexto nigeriano (NG como país por defecto); no hay soporte documentado de español.
- Arquitectura MoE sobre modelos congelados: el comportamiento del conjunto no es homologable al de un modelo entrenado conjuntamente, y la agregación por pesos de voto no garantiza calibración de las confianzas devueltas.
- Sin benchmarks, sin métricas de sensibilidad/especificidad por modalidad y sin evaluación de sesgos demográficos publicada.
- En producción, el modo por defecto es permisivo (advisory); solo `KYNOX_LAUNCH_MODE=strict` restablece la negativa a servir. La superficie de chat no exige API key salvo que se defina `KYNOX_API_KEY`.
- Las fechas del repositorio (creación 2026-10-09, actualización 2026-10-24) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/treasurenleanya/Kynox-AI-1.0
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, papers, blogs, repositorios de código o demos. Los resultados devueltos por la búsqueda no guardan relación con el modelo y se han descartado.
