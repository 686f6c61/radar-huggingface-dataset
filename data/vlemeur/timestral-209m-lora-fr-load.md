# vlemeur/timestral-209m-lora-fr-load

## Resumen

Timestral-209M LoRA adapter (French national electricity load) es un adaptador LoRA publicado por el usuario vlemeur sobre el modelo base `mistralai/Timestral-209M`, orientado a la previsión de series temporales. Concretamente, se ha ajustado sobre la serie horaria de consumo eléctrico nacional francesa del conjunto RTE eco2mix, dentro del marco de datos del benchmark hexaload. El adaptador tiene rango r=16 y alpha=32.0, y se ha entrenado durante 1000 pasos con un contexto de 720 horas y un horizonte de predicción de 24 horas.

El interés de esta ficha es doble: por un lado, documenta un caso concreto de ajuste fino mediante LoRA de un modelo de series temporales de 209 millones de parámetros sobre un dominio energético real; por otro, sirve como referencia de las limitaciones de información que presentan muchos adaptadores publicados de forma reciente, con repositorios de tamano practicamente nulo y sin model card extendida. La información disponible es escasa y procede casi exclusivamente de la model card del autor.

No se dispone de datos sobre arquitectura interna del modelo base, composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks más allá de la métrica de validación declarada (pinball 356.6 en el mejor paso). Todo lo que no consta en la información proporcionada se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base `mistralai/Timestral-209M`) |
| Parametros totales | 209M (modelo base); el adaptador LoRA no declara recuento propio de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 720 horas de contexto de entrenamiento (train_context_hours=720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de series temporales, no de texto) |
| Licencia | modified-mit-derivative (Modified MIT, con límite de uso comercial por umbral de ingresos) |
| Formato de pesos | safetensors (adapter.safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `mistralai/Timestral-209M`, fijado en el commit `9874d252ab0aae16f7f7c999f98f98d6ad7d8365`. La información proporcionada no detalla la arquitectura interna del modelo base (transformer, SSM, híbrida u otra), por lo que este dato queda como no disponible. El adaptador en sí es un LoRA de rango r=16 con alpha=32.0, entrenado con los siguientes hiperparámetros: learning rate 0.0001, batch size 2, contexto de 720 horas y horizonte de 24 horas.

El entrenamiento se realizó sobre la serie horaria de consumo eléctrico nacional francesa del conjunto RTE eco2mix (datos del benchmark hexaload), con un total de 129.213 horas hasta el 26 de noviembre de 2026 a las 22:00 UTC, semilla 42 y una cola de validación de 720 horas. Se ejecutaron 1000 pasos, siendo el mejor el paso 999, con una pérdida pinball de validación de 356.6. No se especifica si hubo fases de RLHF, DPO ni otras técnicas de alineación, ni se detalla la composición exacta del dataset más allá de la fuente citada.

## Capacidades

- Previsión de series temporales: generación de predicciones con horizonte de 24 horas sobre la serie horaria de consumo eléctrico francés.
- Ajuste específico de dominio: el adaptador está especializado en la serie RTE eco2mix, no en previsión genérica.
- Contexto largo de series: ventana de entrada de 720 horas (30 días) para condicionar la predicción.
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (la tarea no es lingüística).

## Casos de uso

- Previsión de demanda eléctrica a corto plazo: el adaptador predice las próximas 24 horas de consumo nacional francés a partir de las 720 horas previas, lo que encaja con los ciclos operativos diarios de los gestores de red y los mercados de energía.
- Planificación de despacho de generación: con una previsión horaria a 24 horas, un operador puede ajustar el arranque y parada de unidades de generación y la programación de reservas.
- Gestión de interconexiones y mercados intradiarios: las previsiones a un día permiten estimar desbalances y posicionar ofertas en mercados diarios e intradiarios.
- Detección de anomalías en la demanda: comparando la predicción del modelo con la observación real se pueden identificar desviaciones significativas (eventos, fallos de medida, comportamientos atípicos).
- Investigación en benchmarking de series temporales: el adaptador sirve como referencia reproducible (semilla 42, commit fijado, hash del adaptador) para comparar metodologías de ajuste fino con LoRA en el benchmark hexaload.
- Evaluación de estrategias de fine-tuning eficiente: al ser un LoRA de r=16 sobre un modelo de 209M, es un caso útil para estudiar el equilibrio entre coste de adaptación y calidad de previsión en dominios energéticos.
- Prototipado de sistemas de previsión en entornos con recursos limitados: el tamano del modelo base (209M) permite desplegarlo en infraestructura modesta, aunque no se dispone de datos de latencia.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la pérdida pinball de validación en el mejor paso (999): 356.6, sobre una cola de validación de 720 horas. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otras métricas) en la información disponible.

| Metrica | Valor |
|---|---|
| Val pinball (mejor paso, 999) | 356.6 |
| Pasos de entrenamiento | 1000 |
| Cola de validación | 720 h |
| Contexto de entrenamiento | 720 h |
| Horizonte | 24 h |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base tiene 209M parámetros, lo que en fp16 supondría del orden de 0,4 GB de pesos, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamano del modelo base (209M) es plausible, pero no se aporta dato oficial.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa fiable con alternativas de la misma categoría (adaptadores LoRA para previsión de carga eléctrica o modelos de series temporales de tamano similar) sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vlemeur/timestral-209m-lora-fr-load | 209M (base) + LoRA | 720 h | modified-mit-derivative | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está ajustado exclusivamente sobre la serie de consumo eléctrico francés de RTE eco2mix; su comportamiento fuera de ese dominio no está documentado.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero al ser un modelo de series temporales el riesgo relevante es el de deriva (distribution shift) ante cambios estructurales de la demanda.
- Riesgo de error en la predicción: la pérdida pinball de validación (356.6) no se contextualiza con métricas de error habituales (MAE, MAPE), por lo que no se puede evaluar su precisión operativa.
- Limitación de contexto: la ventana de 720 horas y el horizonte de 24 horas son fijos en el entrenamiento; no se documenta comportamiento con otras longitudes.
- Restricciones de licencia: licencia Modified MIT con límite de uso comercial para organizaciones por encima de un umbral de ingresos; es un derivado de los pesos de Timestral, por lo que se heredan las condiciones del modelo base.
- Repositorio de 0.0 GB: el tamano declarado del repo no permite verificar el contenido real del adaptador; se recomienda comprobar el hash sha256 (`46a9ade677f516a1dc23a5a119398425bd7d525eadac23b34085270b7bf0371d`) antes de su uso.
- Sin información de producción: no hay datos de latencia, throughput, estabilidad ni pruebas de integración, lo que impide avalar su uso en sistemas críticos sin validación propia.
- Idiomas y modalidades: no aplica para texto, pero tampoco se documentan capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/vlemeur/timestral-209m-lora-fr-load
- Modelo base: https://huggingface.co/mistralai/Timestral-209M
- Commit del modelo base: 9874d252ab0aae16f7f7c999f98f98d6ad7d8365
- Benchmark hexaload: no disponible (no se proporciona URL)
- Dataset RTE eco2mix: no disponible (no se proporciona URL en la información)
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
