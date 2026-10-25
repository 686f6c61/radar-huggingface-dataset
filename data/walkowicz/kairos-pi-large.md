# Walkowicz/kairos-pi-large

## Resumen

Kairos Pi Large es un modelo de decisión no autorregresivo publicado en HuggingFace por el usuario Walkowicz bajo el identificador `Walkowicz/kairos-pi-large`. No es un modelo generativo de texto: la pipeline declarada es `feature-extraction` y los tags lo etiquetan explícitamente como `decision-model`, `non-autoregressive`, `system-1`, `risk-vector` y `active-abstention`. Es decir, el modelo está diseñado para producir representaciones vectoriales de riesgo (o decisiones de System-1, rápidas y reactivas) a partir de entradas de contexto industrial, en lugar de generar tokens secuencialmente.

El modelo se construye por fine-tuning sobre `answerdotai/ModernBERT-large`, un encoder bidireccional de la familia ModernBERT, y los tags de dominio apuntan a entornos SCADA, ADAS (sistemas avanzados de asistencia a la conducción), IoT industrial y robótica. La combinación de `active-abstention` con `risk-vector` sugiere que el modelo puede abstenerse explícitamente cuando la confianza es baja, algo habitual en arquitecturas de seguridad para sistemas críticos.

La relevancia actual del modelo es, sin embargo, difícil de evaluar: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, la información pública es mínima (sin model card detallada, sin benchmarks, sin datos de entrenamiento) y el campo de licencia e idiomas aparece como no disponible en la API, aunque los tags declaran Apache 2.0 e inglés. Se trata, por tanto, de un artefacto de investigación reciente y sin validación comunitaria, que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT) adaptado a decisión no autorregresiva; requiere `trust_remote_code` (`custom_code`) |
| Parametros totales | Aproximadamente 395 M, heredados del modelo base `answerdotai/ModernBERT-large` (dato no confirmado en la información del repositorio) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens según el modelo base ModernBERT-large (no confirmado en la ficha del repositorio) |
| Tipos de cuantizacion | No disponible; no se publican variantes cuantizadas en el repositorio |
| Idiomas soportados | Inglés (tag `en`); el campo de idiomas de la ficha aparece como no disponible |
| Licencia | Apache 2.0 según los tags del repositorio; el campo de licencia de la ficha aparece como no disponible (discrepancia a verificar) |
| Formato de pesos | safetensors, con código personalizado asociado (`custom_code`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que indican los tags y el modelo base. Kairos Pi Large deriva de ModernBERT-large, un encoder transformer bidireccional con atención alternada local/global y contexto de 8192 tokens, diseñado originalmente para fine-tuning e inferencia eficientes en memoria. Sobre esa base, el autor ha definido una cabeza o envoltorio personalizado (`custom_code`, con el identificador interno `kairos_pi_large`) orientado a producir un vector de riesgo y, presumiblemente, una señal de abstención activa. El carácter `non-autoregressive` implica que la salida se calcula en una sola pasada, sin decodificación secuencial, lo que encaja con el etiquetado `system-1` (decisiones rápidas y reactivas).

No se han publicado en la información proporcionada datos sobre volumen de entrenamiento, composición del dataset, proceso de alineamiento (RLHF, DPO u otros) ni innovaciones técnicas específicas más allá de las heredadas del encoder base. Tampoco se documentan las tareas exactas de las cabezas de salida ni el formato del vector de riesgo (dimensionalidad, escala, calibración). Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Extracción de características y representaciones vectoriales sobre texto de contexto técnico (pipeline declarada: `feature-extraction`).
- Producción de un vector de riesgo (`risk-vector`) orientado a la toma de decisiones binarias o multiclase en entornos industriales.
- Abstención activa (`active-abstention`): capacidad declarada de no emitir decisión cuando la entrada queda fuera de distribución o la confianza es insuficiente.
- Procesamiento no autorregresivo en una sola pasada, adecuado para latencia baja en bucles de control.
- Enfoque de dominio declarado en SCADA, ADAS, IoT industrial y robótica.
- Soporte de contexto largo (hasta 8192 tokens según el modelo base), útil para ventanas de telemetría o secuencias de eventos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje de alarmas en SCADA: el modelo puede recibir una ventana de eventos y telemetría y emitir un vector de riesgo que priorice las alarmas críticas frente a las ruidosas, reduciendo la fatiga de alarmas del operador gracias a la ventana de contexto larga heredada del encoder.
- Supervisor de seguridad en ADAS: integrado como segunda capa de decisión, evalúa el contexto textualizado de sensores y estado del vehículo y se abstiene cuando la situación es ambigua, delegando en el sistema principal o en el conductor.
- Mantenimiento predictivo en IoT industrial: a partir de logs y secuencias de lecturas, el modelo genera representaciones que alimentan un clasificador de degradación, con abstención cuando el patrón no se parece a ningún fallo conocido.
- Enrutamiento con abstención hacia revisión humana: en pipelines donde un modelo generativo propone acciones, Kairos Pi Large actúa como filtro que decide aceptar, rechazar o escalar a un operador, aprovechando la señal de abstención activa.
- Backbone de características para modelos downstream: al ser un encoder, puede congelarse y usarse para extraer embeddings de texto técnico (manuales, partes de incidencias, informes) que alimenten cabeceras específicas de clasificación o clustering.
- Despliegue en el borde (edge) de planta: con ~395 M de parámetros y salida no autorregresiva, es candidato a ejecutarse en gateways industriales o GPUs de baja potencia para decisiones en milisegundos, siempre que se valide previamente.
- Etiquetado y auditoría de registros históricos: procesamiento por lotes de grandes volúmenes de logs para asignar puntuaciones de riesgo y detectar incidentes no reportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de dominio (detección de anomalías, precisión de abstención, calibración del vector de riesgo) en la ficha del repositorio ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa para un encoder denso de ~395 M de parámetros, en FP16 rondaría 0,8-1 GB de pesos, y en int8 aproximadamente 0,4 GB, sin contar activaciones ni la ventana de 8192 tokens, que incrementa el consumo de memoria de atención.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con 4-8 GB de VRAM debería ser suficiente; tarjetas como RTX 3060/4060/4090, A10, L4 o A100 están sobradamente dimensionadas.
- Compatibilidad con GPU de consumo: previsiblemente sí, en todas las GPU consumer modernas con al menos 4 GB de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al requerir `custom_code` y `trust_remote_code=True`, el despliegue estándar pasa por `transformers` en Python. No hay evidencia de soporte en llama.cpp, Ollama, vLLM o TGI, que habitualmente necesitan arquitecturas reconocidas o conversión explícita a GGUF; la naturaleza no autorregresiva y la cabeza personalizada complican dicha conversión.
- Latencia y throughput: no disponibles. La arquitectura no autorregresiva sugiere latencias de una sola pasada, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Pi Large | ~395 M (heredados) | 8192 (heredado, no confirmado) | Decisión no autorregresiva / vector de riesgo | Apache 2.0 según tag; campo no disponible | HuggingFace, 0 descargas, requiere `trust_remote_code` |
| answerdotai/ModernBERT-large (modelo base) | ~395 M | 8192 | Encoder de propósito general (MLM, clasificación, retrieval) | Apache 2.0 | HuggingFace, ampliamente descargado y documentado |
| DeBERTa-v3-large | ~435 M | 512 | Encoder de propósito general (NLU) | MIT | HuggingFace, muy establecido |
| Modelos generativos tipo Qwen3-0.6B o Llama-3.2-1B | 0,6-1,2 B | 32k o más | Generación de texto, razonamiento, tool calling | Apache 2.0 / licencia comunitaria | HuggingFace, con soporte en vLLM, llama.cpp y Ollama |

La comparación directa con modelos generativos no es del todo justa: Kairos Pi Large no compite en generación de texto, sino en decisión rápida y abstención sobre dominios industriales concretos, un nicho para el que no se han identificado alternativas públicas equivalentes en la información disponible.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permita inferir calidad.
- No hay model card detallada, ni benchmarks, ni datos de entrenamiento, ni descripción del formato exacto de salida; la integración requiere leer el código personalizado del repositorio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del autor; debe auditarse antes de usarlo en cualquier entorno.
- No es un modelo generativo: no puede emplearse para chat, redacción, resumen ni generación de código. Los tags de `feature-extraction` y `decision-model` lo confirman.
- Idiomas: solo se declara inglés; no hay evidencia de soporte de castellano ni de otros idiomas, lo que limita su uso con documentación técnica en español.
- Riesgo de calibración: un vector de riesgo mal calibrado o sobreconfiado en entradas fuera de distribución es especialmente peligroso en dominios de seguridad (ADAS, SCADA); la abstención activa declarada debe validarse empíricamente.
- Riesgo de alucinación en el sentido de falsos negativos: el modelo puede no detectar situaciones críticas novedosas si el entrenamiento no cubrió esa distribución.
- Licencia: los tags indican Apache 2.0, pero el campo de licencia de la ficha aparece como no disponible; conviene confirmar los términos antes de un uso comercial.
- Anomalía en metadatos: la fecha de creación indicada es 2026-10-24, posterior a la fecha habitual de consulta, lo que sugiere un posible error de registro o un repositorio de publicación programada; no se debe asumir madurez por la antigüedad.
- No debe utilizarse como única capa de seguridad en sistemas críticos; cualquier despliegue en ADAS, robótica o control industrial exige validación independiente, monitorización y mecanismos de fallback.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Walkowicz/kairos-pi-large
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Paper de ModernBERT (arquitectura base): https://arxiv.org/abs/2412.13663
- Repositorio de ModernBERT en GitHub: https://github.com/AnswerDotAI/ModernBERT
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos, espacios de HuggingFace ni repositorios adicionales del autor para este modelo.
