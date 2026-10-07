# yslahoti/von-transaction-classifier

## Resumen

Von transaction classifier es un ajuste fino (fine-tune) del modelo wfzyx/von, una variante de ModernBERT-large con cabecera de marcadores de opción, publicado por el usuario yslahoti. Se trata de un clasificador de transacciones bancarias y de tarjeta en inglés que, a partir de un estado de transacción corto (comercio, descripción, terminal de pago, importe, etiqueta del emisor) y una lista fija de descripciones de categorías, elige una sola categoría en una única pasada forward. El modelo cuenta con 394.781.696 parámetros (aproximadamente 395 millones) y se distribuye bajo licencia Apache-2.0 en formato safetensors.

El problema que resuelve es la categorización automática del gasto (dining, groceries, coffee_bakery, rideshare, transit, subscriptions, ai_software, travel, shopping, health_fitness, personal_care, entertainment, education_professional). No cubre pagos con tarjeta, comisiones ni transferencias de efectivo, que quedan fuera del conjunto de opciones y se delegan a reglas. Es relevante porque demuestra que un encoder de ~400 millones de parámetros puede superar a alternativas con etiquetas reales en una tarea de finanzas personales, con un coste de entrenamiento muy bajo (3,2 minutos en una RTX 3090).

La relevancia práctica está en el nicho: aplicaciones de finanzas personales y herramientas de enriquecimiento de transacciones que necesitan clasificar el gasto de forma localizada y económica, sin depender de modelos generativos grandes. No obstante, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, por lo que su validación externa es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabecera de marcadores de opción para clasificación |
| Parametros totales | 394.781.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana; el checkpoint base deriva de ModernBERT-large) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint wfzyx/von (Apache-2.0), descrito como un modelo ModernBERT-large con mecanismo de marcadores de opción ("option-marker"), configurado con `digit_split` en false e `independent_options` en true. Sobre esa base se añade una cabecera de puntuación ("scorer") que asigna una probabilidad a cada una de las 13 descripciones de categoría, y la decisión final se toma con el softmax en bruto sobre esas opciones. La temperatura almacenada en `marker_calibration.json` proviene del release original de Von y no se reajustó sobre transacciones, por lo que no debe interpretarse como una probabilidad calibrada para esta tarea.

El entrenamiento usa la función de pérdida del propio Von: entropía cruzada softmax más 0.5 veces la puntuación de Brier. Se empleó el optimizador AdamW con learning rate de 1.5e-5 para el encoder y 7.5e-5 para el scorer, weight decay 0.01, recorte de gradiente 1.0, bfloat16 y sin GradScaler. La configuración fue: batch size 8, acumulación de gradiente 2, 4 épocas y semilla 13. El muestreo de entrenamiento usa la inversa de la raíz cuadrada del soporte por comercio, con tope de 3x. En total se usaron 1.118 filas de entrenamiento procedentes de 466 comercios, incluyendo una segunda copia de cada fila real sin la etiqueta del emisor y 144 filas ficticias (72 nombres, dos copias cada uno) generadas por `synthetic_example.py`. El conjunto de calibración tuvo 45 filas y el de test 112. El ajuste fino completo tardó 3,2 minutos en una única RTX 3090.

## Capacidades

- Clasificación de transacciones en una sola pasada forward: recibe un estado con líneas `merchant`, `raw_description`, `payment_terminal` (opcional), `amount_usd` e `issuer_label`, y devuelve una de las 13 categorías.
- Clasificación con opciones definidas por texto: la pregunta fija es "What kind of place is this merchant and what was bought there?" y las descripciones de las 13 categorías deben usarse tal cual, ya que cambiarlas altera la predicción.
- Uso del contexto del terminal de pago: cuando la descripción contiene un prefijo de lector de tarjeta conocido (por ejemplo, Toast point-of-sale), se aporta como pista al modelo.
- Uso de la etiqueta del emisor: el campo `issuer_label` (cadena de categoría del propio banco) se incorpora como información de entrada.
- Capacidad zero-shot nominal (la pipeline declarada es `zero-shot-classification`), si bien el rendimiento real proviene del ajuste fino; el Von sin ajustar con este texto de opciones obtuvo solo un 47,3% de accuracy.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio según la información disponible.
- Carácter monolingüe: únicamente inglés.

## Casos de uso

- Categorización de gasto en apps de finanzas personales: el modelo toma cada transacción (comercio, descripción, importe y etiqueta del banco) y la asigna a una de las 13 categorías en una única pasada, lo que permite enriquecer listados de movimientos a gran escala con coste de cómputo bajo.
- Enriquecimiento de transacciones en agregadores bancarios: se puede ejecutar como paso posterior a la ingesta para normalizar descripciones heterogéneas (`TST* PINE STREET BAKERY`) en categorías homogéneas, aprovechando el campo `payment_terminal` cuando exista.
- Automatización contable y de conciliación: para clasificar líneas de gasto recurrente de autónomos o pequeñas empresas (suscripciones, software, desplazamientos) antes de volcarlas a la contabilidad.
- Análisis de presupuesto y alertas de gasto: al clasificar `dining`, `groceries` o `coffee_bakery`, la aplicación puede generar informes de consumo por categoría y avisos cuando se superan umbrales.
- Optimización de recompensas de tarjeta: identificar la categoría de cada compra para recomendar la tarjeta que maximiza cashback, gracias a la distinción fina entre categorías próximas (por ejemplo, `coffee_bakery` frente a `dining`).
- Clasificación de gasto para herramientas de suscripciones: separar `subscriptions` y `ai_software` de otros cargos recurrentes permite detectar servicios duplicados o infrautilizados.
- Investigación sobre clasificación de texto financiero: sirve como referencia reproducible de fine-tuning de un encoder ModernBERT con objetivo de pérdida específico (entropía cruzada + Brier) sobre datos de transacciones.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (112 transacciones, 108 comercios, semilla 13, mismo split de comercios para todas las filas). El checkpoint conservado fue la época 2 de 4, elegido por accuracy de calibración.

| Modelo | Accuracy | Macro-F1 | Accuracy ponderada por comercio |
|---|---:|---:|---:|
| Laya base | 53,6% | 0,317 | 53,7% |
| Laya fine-tuned | 79,5% | 0,574 | 78,7% |
| Von zero-shot, mismo texto de opciones | 47,3% | 0,419 | 47,2% |
| Von fine-tune, solo etiquetas reales | 75,9% | 0,583 | 75,0% |
| **Este checkpoint** | **84,8%** | **0,845** | **84,9%** |

Recall por categoría en el test:

| Categoria | Filas de test | Recall solo etiquetas reales | Este checkpoint |
|---|---:|---:|---:|
| AI & Software | 2 | 50% | 50% |
| Coffee, Bakery & Snacks | 26 | 69% | 58% |
| Dining & Takeout | 50 | 88% | 98% |
| Education & Professional | 1 | 0% | 100% |
| Entertainment | 4 | 100% | 100% |
| Groceries & Bodega | 9 | 89% | 100% |
| Health & Fitness | 1 | 100% | 100% |
| Personal Care & Services | 2 | 0% | 50% |
| Rideshare & Taxi | 3 | 100% | 100% |
| Shopping | 5 | 40% | 80% |
| Subscriptions & Media | 2 | 50% | 100% |
| Public Transit | 3 | 67% | 67% |
| Travel | 4 | 25% | 75% |

Progreso por época (calibración):

| Epoca | Perdida de entrenamiento | Accuracy de calibracion |
|---:|---:|---:|
| 1 | 0,776 | 73,3% |
| 2 | 0,225 | 82,2% |
| 3 | 0,113 | 80,0% |
| 4 | 0,031 | 73,3% |

No se han publicado resultados sobre benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las cifras anteriores corresponden exclusivamente a la tarea de clasificación de transacciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión bfloat16 o float16, alrededor de 0,8 GB de pesos; en float32, aproximadamente 1,6 GB. Con overhead de runtime, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; el modelo se entrenó en una única RTX 3090. También es viable en A100, H100 o GPUs consumer (RTX 4060, 4090, etc.).
- Cabe en GPU de consumo: sí, con holgura, en cualquier tarjeta de gama media o superior, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con transformers sobre pesos safetensors. No se publican pesos GGUF ni integración con llama.cpp u Ollama en la información disponible; tampoco se indica compatibilidad explícita con vLLM o TGI. No disponible confirmación de integración con Text Generation Inference.
- Latencia y throughput estimados: no disponibles de forma explícita. Como referencia, el entrenamiento completo (4 épocas sobre 1.118 filas) requirió 3,2 minutos en una RTX 3090, lo que sugiere un coste de inferencia muy bajo por transacción.

## Comparativa con modelos similares

La model card ofrece comparaciones directas dentro del mismo conjunto de test, pero no describe en detalle los modelos alternativos. Se recogen los datos disponibles:

| Modelo | Parametros | Contexto | Accuracy (test) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (von-transaction-classifier) | 394.781.696 | no disponible | 84,8% | 0,845 | apache-2.0 | HuggingFace |
| Laya fine-tuned | no disponible | no disponible | 79,5% | 0,574 | no disponible | no disponible |
| Von fine-tune, solo etiquetas reales | no disponible (base wfzyx/von) | no disponible | 75,9% | 0,583 | apache-2.0 (base) | HuggingFace |
| Von zero-shot, mismo texto de opciones | no disponible (base wfzyx/von) | no disponible | 47,3% | 0,419 | apache-2.0 | HuggingFace |

No se dispone de información sobre los modelos Laya más allá de sus resultados en esta tabla, por lo que la comparación de parámetros, contexto y licencia de esas alternativas queda como no disponible.

## Limitaciones y advertencias

- Cobertura de tareas restringida: solo clasifica entre las 13 categorías definidas. Los pagos con tarjeta, las comisiones y las transferencias de efectivo quedan explícitamente fuera y se delegan a reglas.
- El texto de las opciones forma parte del modelo: cambiar las descripciones de categoría altera las predicciones. La model card advierte que el Von zero-shot con este mismo texto rinde peor que con el texto anterior.
- Conjunto de evaluación muy reducido: 112 transacciones y 108 comercios. Varias categorías tienen solo de una a cuatro filas de test, por lo que sus recalls (por ejemplo, Education & Professional con 1 fila) son estadísticamente frágiles.
- Degradación en Coffee, Bakery & Snacks: el recall bajó del 69% al 58% al añadir filas sintéticas de dining, lo que indica que la mezcla sintética introduce sesgos de clase.
- Calibración no fiable: la temperatura de `marker_calibration.json` procede del release base de Von y no se reajustó sobre transacciones; no debe usarse como probabilidad calibrada.
- Monolingüe: solo inglés. No hay soporte documentado para otros idiomas.
- Datos no publicados: el ledger personal usado para las filas de entrenamiento reales no está en el repositorio; solo se publica `synthetic_example.py` como conjunto de contraste ficticio, lo que limita la reproducibilidad exacta del entrenamiento.
- Sección de datos sintéticos incompleta en la model card proporcionada (corta en "builds the 144 f"), por lo que no se conoce el detalle completo de esa generación.
- Validación externa nula: cero descargas y cero likes en el momento de la ficha. No hay evidencia de uso en producción por terceros.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base wfzyx/von también es Apache-2.0 según la información disponible.
- Riesgo de alucinación no aplicable en sentido generativo (no genera texto libre), pero sí de clasificación errónea en categorías poco representadas o con descripciones ambiguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yslahoti/von-transaction-classifier
- Modelo base: https://huggingface.co/wfzyx/von
- Script de datos sintéticos: `synthetic_example.py` (incluido en el repositorio del modelo)
- Fichero de calibración: `marker_calibration.json` (procedente del release base de Von)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
