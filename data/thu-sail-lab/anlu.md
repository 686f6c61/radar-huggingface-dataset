# thu-sail-lab/Anlu

## Resumen

Anlu es un detector de anomalías en series temporales preentrenado y condicionado por referencia, desarrollado por thu-sail-lab (grupo vinculado al Laboratorio de Aprendizaje Automático e Inteligencia Artificial de la Universidad de Tsinghua). A diferencia de los detectores clásicos, Anlu utiliza un prefijo normal de referencia para interpretar una consulta (query) y devuelve una puntuación de anomalía por cada marca temporal de la consulta. El modelo resuelve el problema de la detección de anomalías semisupervisada en series univariantes, donde se dispone de un tramo inicial etiquetado como normal pero no de anotaciones para el resto de la serie.

El checkpoint publicado (s38000) contiene 94.863.243 parámetros en formato Safetensors (379,5 MB) e incluye los dos codificadores, el remuestreador de referencia, los adaptadores y las cabezas de salida. Los pesos permanecen congelados en inferencia: no hay ajuste fino ni selección de umbral por conjunto de datos. La relevancia actual radica en que ofrece un detector de referencia reproducible, con protocolo de evaluación fijo y verificación de hashes, pensado para integrarse en el benchmark TSB-AD.

La arquitectura es propietaria y específica para series temporales (no es un transformer de lenguaje), y el modelo está validado exclusivamente para entradas univariantes. No es un detector causal de streaming: requiere un prefijo normal útil y evalúa consultas observadas completas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de series temporales condicionado por referencia con doble codificador, remuestreador de referencia, adaptadores y cabezas de salida (detalle interno no disponible) |
| Parámetros totales | 94.863.243 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de consulta de 10.000 puntos; referencia = min(10.000, longitud del prefijo); stride 1.500 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo numérico de series temporales) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (331 tensores, 379.487.836 bytes) |

## Arquitectura y entrenamiento

Anlu es un modelo de series temporales con dos codificadores y un mecanismo de remuestreo de referencia que alinea el prefijo normal con la consulta para producir logits de clase anomalía frente a clase normal. La salida final es la diferencia de logits (anomalía menos normal) promediada sobre las ventanas que cubren cada marca temporal de la consulta. La normalización aplica media y desviación estándar poblacional de la consulta completa, compartidas entre consulta y referencia, con un suelo de 1e-4 en la desviación estándar.

El checkpoint s38000 se distribuye con los pesos congelados y sin estado del optimizador ni rutas de entrenamiento. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este dominio). El protocolo de evaluación fijo usa ventanas de 10.000 puntos, stride de 1.500 y tamaño de lote de ventana 8. La reproducibilidad se garantiza mediante la verificación del hash SHA256 del checkpoint antes de construir el modelo, y la integración en TSB-AD compara las predicciones con la evaluación original s38000 sobre los 350 registros.

## Capacidades

- Detección de anomalías en series temporales univariantes mediante puntuación por marca temporal.
- Condicionamiento por referencia: interpreta la consulta a partir de un prefijo normal proporcionado por el usuario.
- Inferencia con pesos congelados: no requiere ajuste fino ni selección de umbral por conjunto de datos.
- Evaluación sobre series completas, incluyendo el prefijo normal.
- Puntuaciones de ranking (no probabilidades calibradas) aptas para ordenar marcas temporales por grado de anomalía.
- Integración con el benchmark TSB-AD mediante un despachador semisupervisado y una clase `Anlu` con métodos `fit` y `decision_function`.
- Soporte de uso offline mediante ruta local al checkpoint o variable de entorno `ANLU_CHECKPOINT`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües (no aplicables).

## Casos de uso

- Monitorización de métricas de infraestructura: usar un tramo histórico estable (CPU, latencia, errores) como prefijo normal y puntuar cada nuevo intervalo de la serie para detectar desviaciones; el modelo está diseñado exactamente para este esquema referencia-consulta.
- Detección de fraude en series de transacciones: emplear un periodo de comportamiento normal del usuario como referencia y puntuar la actividad posterior para señalar picos anómalos, aprovechando la evaluación sobre ventanas de 10.000 puntos.
- Mantenimiento predictivo de sensores industriales: alimentar lecturas univariantes de un sensor (vibración, temperatura) con un prefijo de funcionamiento correcto y obtener puntuaciones por marca temporal para priorizar inspecciones.
- Monitorización de salud con wearables: usar un intervalo basal del paciente como referencia y puntuar la serie posterior para identificar cambios fisiológicos atípicos, dado el carácter univariante del modelo.
- Control de calidad en series de producción: analizar curvas de proceso (por ejemplo, medidas dimensionales por unidad) con un prefijo de lote conforme y detectar derivas dentro del lote.
- Evaluación comparativa de detectores: integrar Anlu en TSB-AD como línea base semisupervisada reproducible, gracias a su protocolo fijo, hashes verificados y resultado VUS-PR publicado.
- Investigación en detección de anomalías: utilizar el checkpoint congelado como referencia para reproducir experimentos sin reentrenamiento, comparando nuevas propuestas contra el VUS-PR oficial.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Condiciones |
|---|---|---|---|
| TSB-AD-U Eva350 (350 registros) | VUS-PR (media no ponderada) | 0,599280663 (59,9281 %) | Regla de ventana métrica actual de TSB-AD, 250 umbrales, serie completa con prefijo normal |

No se han publicado en la información disponible resultados comparativos frente a otros detectores (por ejemplo, en tablas con modelos alternativos), ni métricas adicionales como precisión, recall o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 94,86 M de parámetros en fp32 los pesos ocupan aproximadamente 380 MB, por lo que el consumo dominante provendrá de las activaciones de las ventanas de 10.000 puntos y del tamaño de lote de ventana 8.
- GPU recomendadas: no disponible; el ejemplo de la model card usa `device="cuda:0"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por el reducido tamaño de pesos, aunque no está confirmado en la documentación.
- Opciones de despliegue: integración TSB-AD (PyTorch ≥ 2.1, safetensors ≥ 0.4, huggingface_hub ≥ 0.23); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de anomalías en series temporales ni datos de modelos alternativos (parámetros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- Validado únicamente para entradas univariantes; el uso multivariante no está soportado según la model card.
- Requiere un prefijo normal útil como referencia; sin él, la interpretación de la consulta pierde sentido.
- No es un detector causal de streaming: evalúa consultas observadas completas y no está pensado para inferencia en línea marca a marca.
- Las puntuaciones son señales de ranking, no probabilidades calibradas; no deben interpretarse como probabilidades de anomalía.
- No realiza ajuste fino, selección de umbral ni modificación de parámetros por conjunto de datos, lo que limita la adaptación a dominios muy distintos del evaluado.
- Riesgo de alucinación no aplicable en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y negativos en series con distribución distinta a la del entrenamiento (no cuantificado en la información disponible).
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y verificar el hash del checkpoint en despliegues.
- El resultado VUS-PR de 0,599 depende de la regla de ventana métrica concreta de TSB-AD; resultados históricos con otra regla de respaldo se mantienen como comprobación separada y no son directamente comparables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thu-sail-lab/Anlu
- Repositorio TSB-AD (integración y benchmark): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
