# tomcupr/Zitra-209M-v2

## Resumen

Zitra-209M-v2 es un modelo fundacional para pronóstico de series temporales desarrollado por el usuario tomcupr. Se presenta como una actualización directa («drop-in») del modelo `mistralai/Timestral-209M`, del que hereda exactamente la misma arquitectura y el mismo número de parámetros: 209.312.256. El objetivo declarado por el autor es mejorar la calibración probabilística del modelo base sin incrementar el coste computacional ni la latencia de servicio.

La propuesta técnica se basa en un «model soup» de LoRA de rango 16 aplicado sobre las 24 capas del transformer original, cuyos pesos se pliegan algebraicamente en los pesos base, de modo que en inferencia el modelo resultante es idéntico en forma a `TimestralModel`. Según el autor, esto permite obtener mejoras medibles en GIFT-Eval y fev-bench manteniendo un tiempo de inferencia prácticamente idéntico (25,98 ms frente a 25,92 ms en una B300).

El modelo es relevante para equipos que ya sirven Timestral-209M en producción y buscan una mejora de precisión sin cambiar infraestructura, ya que conserva el mismo `config.json`, el mismo consumo de VRAM y la misma interfaz de carga. Se distribuye en formato `safetensors` con licencia Modified MIT sujeta a los términos del modelo upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Timestral, 24 capas; pesos derivados de `mistralai/Timestral-209M`) |
| Parámetros totales | 209.312.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card cita ventanas de ejemplo de 672 y 1000 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | Modified MIT (sujeta a los términos upstream de Timestral) |
| Formato de pesos | safetensors (más `config.json` compatible con `TimestralForecaster`) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del transformer Timestral de 24 capas y 209M de parámetros. El post-entrenamiento consistió en cinco semillas independientes de LoRA de rango 16 sobre las proyecciones `wQKV`, `wO` y `mlp.w3` en todas las capas, entrenadas sobre conjuntos de datos reales limpios (no pertenecientes a benchmarks) y trayectorias sintéticas con diversidad de regímenes. Las actualizaciones resultantes se promediaron en un «model soup» para reducir varianza y después se plegaron algebraicamente en los pesos base, con una paridad numérica declarada de `max_abs_diff = 2.15e-6`.

El autor afirma que no se tocó ningún conjunto de datos de GIFT-Eval ni de fev-bench durante el post-entrenamiento ni en la selección del modelo. Adicionalmente, se incorpora un redondeo exacto a enteros no negativos cuando la serie presenta un historial estrictamente entero no negativo en los últimos 84 pasos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Pronóstico de series temporales univariantes y multivariantes.
- Pronóstico probabilístico: genera mediana y cuantiles (por ejemplo, `quantile(0.1)` y `quantile(0.9)`).
- Soporte de covariables (variables exógenas), con mejoras declaradas en tareas con covariables de fev-bench.
- Pronóstico con ventanas de contexto largas (ejemplos de 672 y 1000 pasos) y horizontes configurables (ejemplos de 72, 96 y 64 pasos).
- Redondeo automático a enteros no negativos para series de recuento con historial entero no negativo.
- Compatibilidad directa con la interfaz `TimestralForecaster` de la librería `zitra-forecast` o de Timestral.
- No dispone de tool calling, capacidades de agente, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- **Sustitución directa en producción de Timestral-209M:** al conservar arquitectura, `config.json`, VRAM y latencia (1,003×), puede desplegarse como reemplazo del modelo base en un servicio existente sin cambios de infraestructura ni de código de inferencia.
- **Pronóstico de demanda minorista:** la model card cita una validación interna sobre 5.000 SKU con una mejora de −0,78% en WAPE; el modelo es adecuado para previsión de ventas por producto con series de recuento, aprovechando el redondeo entero no negativo.
- **Planificación de capacidad en movilidad urbana:** el autor reporta mejoras de −4,90% MASE y −5,65% WQL en pronóstico prospectivo de bikeshare a horizonte de 64 pasos (128 minutos), útil para reposición de flotas y gestión de estaciones.
- **Previsión con variables exógenas:** las mejoras declaradas en tareas con covariables (−0,74% WQL) lo hacen apto para escenarios donde el pronóstico depende de calendario, precios o promociones.
- **Pronóstico multivariante de sistemas acoplados:** la mejora de −0,67% WQL en tareas multivariantes permite su uso en series con dependencias cruzadas, como métricas de infraestructura o sensores correlacionados.
- **Generación de intervalos de predicción para gestión de riesgo:** la salida por cuantiles permite construir bandas de confianza para inventario de seguridad, aprovisionamiento o alertas operativas.
- **Evaluación comparativa de modelos de series temporales:** al estar evaluado en GIFT-Eval y fev-bench con métricas estándar (MASE, CRPS, WQL, SQL), sirve como referencia en estudios internos de selección de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark / partición | Zitra-209M-v2 | Timestral-209M (base) | Delta |
|---|---:|---:|---:|
| fev-bench skill MASE ↑ | 39,56 | 39,49 | mejora |
| fev-bench skill SQL ↑ | 50,45 | 50,39 | mejora |
| fev-bench skill WQL ↑ | 54,81 | 54,63 | mejora |
| fev-bench equal-task (100 tareas) ↓ | −0,12% / −0,41% / −0,12% | baseline | 52/100 tareas mejores |
| fev-bench covariables (42 tareas) ↓ | −0,32% MASE / −0,74% WQL / −0,40% SQL | baseline | mejora |
| fev-bench multivariante (35 tareas) ↓ | −0,19% MASE / −0,67% WQL | baseline | mejora |
| GIFT-Eval CRPS ↓ | 0,4451 | 0,4460 | −0,20% |
| GIFT-Eval WQL (ex-solar, 89) ↓ | 0,4461 | 0,4471 | −0,23% |
| Holdout interno Rohlik 2026 (8 tareas, 10.859 pronósticos) ↓ | −0,07% MASE / −0,18% WQL / −0,16% WAPE | baseline | 6/8 tareas mejores |
| Bikeshare prospectivo (H=64) ↓ | −4,90% MASE / −5,65% WQL | baseline | mejora |
| Latencia B300 (1,1,672)→72 | 25,98 ms | 25,92 ms | 1,003× |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 209M parámetros en FP32 el peso ronda los 0,84 GB y en FP16 unos 0,42 GB, más memoria de activaciones y del contexto de entrada.
- GPU recomendadas: el autor reporta latencias en NVIDIA B300; por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 4090, RTX 3090 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en FP16 (estimación por tamaño, no confirmada en la información disponible).
- Opciones de despliegue: librería `zitra-forecast` (`ZitraForecaster.from_pretrained`) o `TimestralForecaster` de Timestral cargando `safetensors` y `config.json` directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 25,98 ms en B300 con entrada `(1,1,672)` y horizonte 72; el throughput no se detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Latencia B300 | GIFT-Eval (MASE / CRPS) | Enfoque |
|---|---:|---:|---|---|
| Zitra-Titan-585M | 584,4M | 251 ms (9,7×) | 0,6443 / 0,4352 | Máxima precisión global |
| Zitra-Apex-585M | 584,5M | 84 ms (3,2×) | no disponible | Especialista rápido en covariables y retail |
| Zitra-209M-v2 | 209,3M | 26 ms (1,0×) | 0,6578 / 0,4451 | Reemplazo directo de Timestral-209M |
| Timestral-209M (base) | 209,3M | 25,92 ms | no disponible en esta ficha / 0,4460 CRPS | Modelo upstream de referencia |

## Limitaciones y advertencias

- Las mejoras declaradas son de magnitud reducida (en torno a −0,2% a −0,7% en la mayoría de benchmarks; hasta −5,65% en el caso prospectivo de bikeshare) y no han sido verificadas de forma independiente (`verified: false` en el model-index).
- El modelo hereda los sesgos y limitaciones de `mistralai/Timestral-209M`; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación en el sentido de pronósticos mal calibrados fuera de la distribución de entrenamiento; no se documentan evaluaciones de robustez ante cambios de régimen o datos anómalos.
- No se especifican los idiomas soportados ni la cobertura geográfica de los datos; el modelo no procesa texto.
- La licencia es Modified MIT sujeta a los términos upstream de Timestral; es necesario revisar dichos términos antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado el 26 de noviembre de 2026; la madurez y el soporte de la comunidad son mínimos.
- No se documentan tipos de cuantización ni integración con motores de serving estándar, lo que limita las opciones de despliegue optimizado.
- El redondeo entero no negativo solo se aplica bajo condiciones específicas (historial entero no negativo en los últimos 84 pasos); en otros casos la salida es continua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomcupr/Zitra-209M-v2
- Colección Zitra v2: https://huggingface.co/collections/tomcupr/zitra-v2-time-series-foundation-models-6b07f1ff7bd52f98a455d847
- Zitra-Titan-585M: https://huggingface.co/tomcupr/Zitra-Titan-585M
- Zitra-Apex-585M: https://huggingface.co/tomcupr/Zitra-Apex-585M
- Demo interactiva: https://huggingface.co/spaces/tomcupr/zitra-v2-demo
- Repositorio de la librería: https://github.com/tomascupr/zitra-forecast
- Modelo base: https://huggingface.co/mistralai/Timestral-209M
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
