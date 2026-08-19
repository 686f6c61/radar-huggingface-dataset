# theforecastingcompany/t0-alpha

## Resumen

t0-alpha es un modelo fundacional de pronóstico de series temporales desarrollado por The Forecasting Company, una empresa especializada en predicción probabilística. Se trata de la primera iteración pública de su arquitectura t0, un transformer de aproximadamente 102 millones de parámetros (101.641.541 según los pesos en safetensors) diseñado para generar pronósticos probabilísticos multi-horizonte y operar de forma nativa con múltiples covariables. El modelo se distribuye bajo licencia Apache 2.0 y requiere aceptación de condiciones en Hugging Face (acceso gated).

Su relevancia actual radica en que aborda un problema clave en el análisis de series temporales: la necesidad de modelos preentrenados y reutilizables que funcionen bien en dominios heterogéneos sin ajuste fino específico. A diferencia de los modelos estadísticos clásicos o de los enfoques de deep learning entrenados desde cero, t0-alpha ofrece una base preentrenada que puede aplicarse directamente a tareas de pronóstico con covariables, lo que reduce el tiempo de desarrollo y mejora la precisión en escenarios con pocos datos históricos.

El modelo se integra con la librería `tfc-t0` de The Forecasting Company y está disponible en su plataforma Retrocast, además de poder utilizarse mediante el Hub de Hugging Face. Su tamaño compacto lo hace viable para despliegue en entornos con recursos limitados, aunque el acceso restringido condiciona su adopción inmediata.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, con atención causal) |
| Parametros totales | 101.641.541 (~102 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors; no se documentan versiones cuantizadas oficiales) |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (también disponible vía librería `tfc-t0`) |

## Arquitectura y entrenamiento

t0-alpha es un transformer basado en la arquitectura t0 de The Forecasting Company. Aunque no se publican detalles completos del diseño, el repositorio oficial indica que se trata de un modelo transformer que produce pronósticos probabilísticos multi-horizonte y opera con múltiples covariables. Esto implica una entrada que combina la serie temporal objetivo con variables exógenas (por ejemplo, estacionalidad, eventos, indicadores externos) y una salida que modela la distribución de probabilidad de los valores futuros, típicamente mediante parámetros de una distribución paramétrica (por ejemplo, Student-t o normal) o mediante cuantiles.

No se han publicado datos oficiales sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Dado que es un modelo de pronóstico y no de lenguaje, es probable que el entrenamiento se haya realizado con una función de pérdida basada en verosimilitud (negative log-likelihood) o en CRPS (Continuous Ranked Probability Score), pero esta información no está disponible en la documentación pública.

La innovación principal de t0-alpha reside en su enfoque como modelo fundacional para series temporales: preentrenado en una amplia variedad de series (presumiblemente de múltiples dominios) y capaz de generalizar a nuevas tareas sin ajuste fino, similar a lo que modelos como Chronos o TimesFM han demostrado. La inclusión de covariables como entrada nativa es una ventaja frente a modelos que solo aceptan la serie univariante.

## Capacidades

- Pronóstico probabilístico multi-horizonte: genera distribuciones de probabilidad para varios pasos futuros, no solo valores puntuales, lo que permite cuantificar la incertidumbre.
- Soporte nativo de covariables: acepta variables exógenas (numéricas y posiblemente categóricas) como entrada, lo que mejora la precisión en escenarios con factores externos conocidos.
- Modelo preentrenado de uso general: funciona en dominios heterogéneos (ventas, energía, finanzas, etc.) sin necesidad de entrenamiento específico por dataset.
- Integración con la librería `tfc-t0`: permite cargar el modelo y realizar inferencia de forma sencilla desde Python, con soporte para PyTorch y el Hub de Hugging Face.
- Despliegue en plataforma Retrocast: disponible para uso a través de la plataforma comercial de The Forecasting Company, lo que facilita su adopción en flujos de trabajo existentes.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico; su única función es el pronóstico de series temporales.

## Casos de uso

- Previsión de demanda en retail: una cadena de tiendas puede usar t0-alpha para predecir ventas diarias o semanales por producto y tienda, incorporando covariables como promociones, festivos o clima. Su capacidad probabilística permite dimensionar stock de seguridad con intervalos de confianza.
- Gestión de energía renovable: para operadores de parques eólicos o solares, el modelo puede pronosticar la generación eléctrica a corto plazo usando covariables como velocidad del viento, irradiación o temperatura, ayudando a planificar la integración en la red.
- Planificación financiera: un equipo de tesorería puede predecir flujos de caja diarios o mensuales con covariables como tipos de interés, calendario fiscal o comportamiento histórico de clientes, obteniendo distribuciones de probabilidad para evaluar riesgo de liquidez.
- Mantenimiento predictivo: en entornos industriales, t0-alpha puede pronosticar métricas de salud de equipos (temperatura, vibración, presión) a partir de series de sensores, permitiendo anticipar fallos y programar mantenimientos con antelación.
- Optimización de inventario en logística: un operador logístico puede predecir volúmenes de envío por ruta o almacén, usando covariables como día de la semana, estacionalidad o eventos especiales, para ajustar capacidad de transporte y almacenamiento.
- Análisis de tráfico y movilidad: las autoridades urbanas pueden pronosticar flujos de vehículos o uso de transporte público con covariables como hora del día, condiciones meteorológicas o eventos locales, facilitando la gestión del tráfico y la planificación de infraestructuras.

## Benchmarks y rendimiento

Se han publicado resultados oficiales en dos benchmarks de referencia para modelos de series temporales. Los valores son declarados por el autor y no han sido verificados de forma independiente.

| Benchmark | Métrica | Valor |
|---|---|---|
| fev-bench (autogluon/fev-bench) | Skill score | 42,2 |
| GIFT-Eval (Salesforce/GiftEval) | CRPS | 0,4941 |
| GIFT-Eval (Salesforce/GiftEval) | MASE | 0,724 |

El skill score de 42,2 en fev-bench indica una mejora del 42,2 % frente a un modelo de referencia (probablemente un modelo naive estacional). En GIFT-Eval, un CRPS de 0,4941 y un MASE de 0,724 son valores típicos para modelos fundacionales de este tamaño, aunque la comparación directa con otros modelos requiere consultar los leaderboards oficiales.

No se dispone de resultados adicionales (por ejemplo, en benchmarks como Monash o otros) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 102 M de parámetros, el modelo en precisión fp32 ocupa aproximadamente 400 MB de memoria; en fp16, unos 200 MB; en int8, unos 100 MB. Esto permite inferencia en CPU y en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es suficiente. Una NVIDIA RTX 3060 (12 GB) o superior ofrece margen de sobra. Incluso una GTX 1650 (4 GB) puede ejecutarlo sin problemas. Para despliegue en producción, una T4 (16 GB) o A10 es adecuada.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las más modestas. También puede ejecutarse en CPU con razonable rendimiento para lotes pequeños.
- Opciones de despliegue: la librería `tfc-t0` permite cargar el modelo desde Hugging Face y ejecutar inferencia con PyTorch. No se documenta soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para despliegue en producción, se puede servir mediante una API propia con FastAPI o utilizar la plataforma Retrocast.
- Latencia y throughput: no hay datos oficiales. Como estimación, en una GPU T4, una inferencia de un lote de 32 series con horizonte de 24 pasos debería completarse en menos de 100 ms. En CPU (8 núcleos), podría tardar entre 0,5 y 2 segundos por lote similar. Estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

t0-alpha se enmarca en la categoría de modelos fundacionales de series temporales. Alternativas relevantes son Chronos (Amazon), TimesFM (Google) y Moirai (Salesforce). No se dispone de datos oficiales comparables para estos modelos en la información proporcionada, por lo que la comparación es cualitativa y orientativa.

| Modelo | Parámetros | Contexto | Licencia | Acceso | Especialidad |
|---|---|---|---|---|---|
| t0-alpha | ~102 M | No disponible | Apache 2.0 | Gated | Covariables nativas, pronóstico probabilístico |
| Chronos (Amazon) | 20 M – 710 M | Hasta 512 pasos | Apache 2.0 | Abierto | Modelos de lenguaje adaptados a series temporales |
| TimesFM (Google) | ~200 M | Hasta 512 pasos | Apache 2.0 | Abierto | Decoder-only con atención, preentrenado en 100 M de series |
| Moirai (Salesforce) | 14 M – 311 M | Variable (hasta 2048) | Apache 2.0 | Abierto | Multi-variante, soporta múltiples frecuencias |

La principal diferenciación de t0-alpha es su soporte nativo de covariables, que no todos los modelos fundacionales ofrecen de forma directa. Sin embargo, al ser un modelo gated y relativamente nuevo, su adopción puede ser más limitada que la de alternativas abiertas como Chronos o TimesFM. Para una comparación cuantitativa rigurosa, se recomienda consultar los leaderboards de GIFT-Eval y fev-bench.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face antes de su descarga, lo que puede ralentizar su integración en flujos automatizados.
- Sin documentación detallada de entrenamiento: no se publican datos sobre el corpus de entrenamiento, el número de tokens ni el procedimiento de preentrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de dominio.
- Sin información sobre cuantizaciones oficiales: no se ofrecen versiones cuantizadas (GGUF, int8, etc.), por lo que el despliegue en entornos muy limitados puede requerir conversión manual.
- Riesgo de alucinación en pronósticos: como todo modelo generativo, puede producir predicciones poco realistas en series con patrones no vistos durante el entrenamiento o con covariables atípicas. Es recomendable validar los resultados con métricas de error y análisis de residuos.
- Limitaciones de contexto y horizonte: no se especifica la longitud máxima de la serie de entrada ni el horizonte máximo de pronóstico soportado. En la práctica, horizontes muy largos pueden degradar la precisión.
- Sin soporte multilingüe: al ser un modelo de series temporales, no procesa lenguaje natural, por lo que no es adecuado para tareas de NLP.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el acceso gated implica que el usuario debe registrarse y aceptar los términos del proveedor, lo que podría incluir cláusulas adicionales no detalladas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theforecastingcompany/t0-alpha
- Repositorio GitHub (librería tfc-t0): https://github.com/theforecastingcompany/tfc-t0
- Anuncio en LinkedIn: https://www.linkedin.com/posts/the-forecasting-company_forecasting-opensource-timeseries-activity-7474832069559369728-R8-q
- Sitio web de The Forecasting Company: https://www.theforecastingcompany.com/en/
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
