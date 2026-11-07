# Uuuuuuniiiiiii/V7.2-Cue-WorldModel

## Resumen

V7.2-Cue-WorldModel es un modelo de investigación de mundo (world model) de tipo predictivo y muy compacto, publicado por el usuario Uuuuuuniiiiiii bajo licencia MIT. No es un modelo de lenguaje: se trata de un artefacto PyTorch orientado a series temporales sintéticas que predice una señal futura `x` a partir de un contexto de 41 fotogramas y 40 acciones pasadas, condicionado por una señal de "cue" supervisada. El paquete se distribuye como versión 0.7.2 con tres checkpoints explícitos (`exploratory_init400`, `exploratory_init401`, `exploratory_init402`) y una API de inferencia sin etiquetas auxiliares.

El autor es explícito sobre el alcance: se trata de una "reparación de tarea supervisada", no de un descubrimiento autónomo de memoria ni de un avance general en modelos de mundo. La contribución técnica es que la supervisión directa adicional sobre la cue `q0` permite que los tres inicializados resuelvan la predicción de `x` futura en una tarea sintética controlada, mientras que el experimento anterior sin cue auxiliar seguía siendo negativo. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

Es relevante ahora como caso de estudio metodológico: documenta con detalle los criterios de evaluación, la cualificación de frescura de los datos y las limitaciones estadísticas de sus intervalos de confianza, algo poco habitual en publicaciones de modelos exploratorios. No obstante, su utilidad práctica fuera del entorno sintético de validación es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model condicionado por cue, con estado latente y rollout; no se especifica la familia exacta (transformer, RNN o híbrida) |
| Parámetros totales | 6.690 en entrenamiento por arquitectura aumentada; 7.346 parámetros almacenados en la ruta de inferencia del WM (6.657 + cabeza de entrenamiento de 33 + EMA congelada de 656) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 41 fotogramas de observación y 40 acciones pasadas; horizonte de predicción entrenado y validado de 20 pasos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés; etiqueta de idioma del repo) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch serializados dentro del paquete `v7_2_cue_worldmodel` (wheel/sdist); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible más allá de que se trata de un world model con estado latente: la API expone `encode(obs_context, past_actions)` sobre tensores `(B,41,3)` y `(B,40)`, y `rollout(state, future_actions)` que devuelve `(B,H)` con `H=20`. El modelo incorpora una cabeza de cue serializada que se conserva por compatibilidad de entrenamiento pero que no se invoca en inferencia; la primera cue `q0` forma parte del contexto observado, de modo que en producción no se requieren etiquetas auxiliares, salida de cue-head ni pérdida BCE.

El entrenamiento utiliza supervisión externa de la `q0` ya observada en cada transición de contexto, con peso fijo 0.1. Se probaron únicamente tres inicializaciones conocidas y reutilizadas, y una sola física sintética, un solo horizonte y un solo contexto. El autor subraya que el éxito en la reparación de la tarea supervisada no implica superioridad arquitectónica ni un avance en modelos de mundo, y que el experimento previo sin cue auxiliar seguía siendo negativo. Los recuentos de parámetros son 6.690 por arquitectura aumentada en entrenamiento y 6.645 en la ruta de inferencia del GRU de referencia, con una cabeza auxiliar de 45 parámetros.

## Capacidades

- Predicción de series temporales sintéticas: dado un contexto de 41 fotogramas y 40 acciones pasadas, genera un rollout de 20 pasos de la señal `x` futura.
- Condicionamiento por cue: utiliza la cue `q0` observada como parte del contexto para orientar la predicción hacia la tarea.
- Inferencia sin etiquetas: no requiere etiquetas auxiliares, salida de cue-head ni cálculo de BCE en producción.
- Rollout multi-paso: soporta planes de acción futuros de horizonte 20, el único validado.
- Intercambio de cues: los swaps de cue muestran una reversión aproximada relevante para la tarea, no una negación exacta de la predicción.
- API de Python empaquetada: módulo `v7_2_cue_worldmodel` con funciones `load_variant`, `encode` y `rollout`.
- Verificación de integridad: el script `examples/download_and_run.py` descarga los ficheros exactos de la release, verifica hashes y permite fijar la revisión mediante `--revision` con el SHA inmutable.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Estudio metodológico de supervisión de cues: reproducir el experimento con las tres inicializaciones para analizar cómo la supervisión directa sobre `q0` repara la tarea de predicción; el paquete incluye los checkpoints y el ejemplo de humo listos para ejecutar.
- Docencia e investigación en world models: usar el modelo como ejemplo mínimo (6.690 parámetros) para ilustrar el ciclo encode-rollout y las diferencias entre supervisión auxiliar y descubrimiento autónomo de memoria.
- Validación de pipelines de integridad de artefactos: emplear `download_and_run.py` con `--revision` fijado al SHA de release para verificar hashes y reproducibilidad en entornos de CI.
- Pruebas de regresión de interfaces de inferencia: comparar los tres peers explícitos sobre las mismas entradas de ejemplo para detectar cambios en la API o en los pesos.
- Análisis de sensibilidad a la marginal de acciones: replicar la condición de transferencia con `P(u=+1)=0.75` para estudiar cómo cambia el error de predicción cuando solo varía la distribución de acciones.
- Auditoría de afirmaciones estadísticas: reutilizar los intervalos pareados y la cualificación de frescura como plantilla para evaluar claims de modelos exploratorios en publicaciones propias.
- Integración en entornos CPU ligeros: ejecutar el ejemplo de humo en Python 3.13.5 con torch 2.15.0+cpu y numpy 2.5.4 en un solo hilo, como prueba de despliegue en máquinas sin GPU.

## Benchmarks y rendimiento

Los resultados publicados corresponden a una tarea sintética controlada con 512 pares de acciones balanceados (1.024 episodios con signo) por condición y tres inicializaciones reutilizadas. Se evaluaron los seis checkpoints fijos WM/GRU sin selección de mejor modelo.

| Condición | WM x-MSE medio bruto | GRU x-MSE medio bruto | Criterios de tarea | Ventaja WM |
|---|---:|---:|---|---|
| Acciones IID | 0,0146413131 | 0,0078583527 | Ambos PASS | No establecida; GRU inferior en las tres inits |
| Transferencia ley de acción P(u=+1)=0,75 | 0,0354272993 | 0,0354977968 | Ambos PASS | No establecida; signos mixtos y CI agrupado cruza cero |

Intervalo pareado agrupado GRU menos WM al 95 % en transferencia: [-0,0012705079, +0,0015248339]. Los intervalos condicionan a los modelos entrenados fijos, no a una población de semillas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 7.346 parámetros almacenados y una ruta de inferencia de 6.657 parámetros, el modelo es de escala trivial y cabe en memoria de cualquier CPU.
- GPU recomendadas: no se especifican; el autor solo valida CPU.
- Cabe en GPU consumer: sí, por tamaño, aunque no hay validación documentada en GPU.
- Opciones de despliegue: paquete Python `v7_2_cue_worldmodel` instalado desde `dist/`, con torch y numpy; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno validado: Python 3.13.5, torch 2.15.0+cpu, numpy 2.5.4, un solo hilo.
- Latencia y throughput: no se reclama ahorro medido de tiempo total de benchmark ni de memoria; los tiempos almacenados son de extremo a extremo de la interfaz de inferencia con sobrecarga de validación desigual, y el RSS máximo del proceso no es memoria pura del modelo.
- Horizontes más largos y otros entornos no están validados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V7.2-Cue-WorldModel | 6.690 en entrenamiento; 7.346 almacenados en inferencia WM | 41 fotogramas de observación, 40 acciones pasadas, horizonte 20 | Predicción de series temporales sintéticas condicionada por cue | MIT | Hugging Face, repo de 0.0 GB, 0 descargas |
| GRU de referencia (incluido en el paquete) | 6.645 en inferencia + 45 de cabeza auxiliar = 6.690 | Mismo contexto y horizonte | Misma tarea sintética | MIT (derivado del paquete) | Incluido en la release |
| Alternativas externas de world models | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante que documenta el autor es contra el GRU de referencia del propio paquete: en acciones IID el GRU obtiene menor error en las tres inicializaciones, y en transferencia el intervalo pareado cruza cero, por lo que no se establece ventaja del WM.

## Limitaciones y advertencias

- El entrenamiento requiere supervisión externa de la `q0` ya observada en cada transición de contexto, con peso fijo 0.1; no es un mecanismo autónomo.
- Solo se probaron tres inicializaciones conocidas y reutilizadas, una física sintética, un horizonte y un contexto.
- El éxito es una reparación de tarea supervisada, no una demostración de superioridad arquitectónica ni un avance general en world models; el experimento previo sin cue auxiliar seguía siendo negativo.
- Los swaps de cue muestran una reversión aproximada relevante para la tarea, no una negación exacta de la predicción; las sondas no son pruebas de uso causal.
- Cualificación de frescura: 1 de 512 pares de acciones IID (2 de 1.024 episodios con signo) comparte la secuencia exacta de acciones futuras de 20 pasos y la secuencia objetivo con datos históricos de entrenamiento; no se encontró coincidencia canónica en validación, evaluación o transferencia, y las fuentes históricas externas o no guardadas no están cubiertas de forma exhaustiva.
- Los intervalos de confianza condicionan a los modelos entrenados fijos, no a una población de semillas de entrenamiento.
- No se reclama ahorro medido de tiempo ni de memoria; los tiempos almacenados incluyen sobrecarga desigual de validación y el RSS no es memoria pura del modelo.
- Solo se valida CPU con Python 3.13.5, torch 2.15.0+cpu y numpy 2.5.4 en un hilo; horizontes más largos y otros entornos no están validados.
- El paquete es una derivación pública saneada de artefactos locales revisados; la documentación y la procedencia difieren de los originales privados, y el resumen de auditoría es saneado, no la auditoría privada completa.
- No se documentan sesgos, riesgo de alucinación en texto ni capacidades multilingües porque el modelo no es de lenguaje; la etiqueta de idioma es `en`.
- Licencia MIT permite uso comercial, pero el alcance funcional del modelo hace inviable su uso en producción fuera de la tarea sintética descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/V7.2-Cue-WorldModel
- Repositorio del autor en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii
- Paquete y ejemplos: `dist/` (wheel y sdist), `examples/inference.py`, `examples/download_and_run.py`
- Procedencia y anclaje SHA-256: `DERIVATION.json`
- Resumen de auditoría saneado: `evidence/audit_summary.json`
- Evidencia gráfica de comparación: `evidence/comparison.png`
- Licencia: `LICENSE` y `LICENSE_STATUS.md`
- Paper, blog, repositorio de código independiente y demo: no disponibles
