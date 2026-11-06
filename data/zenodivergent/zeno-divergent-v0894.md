# ZenoDivergent/zeno-divergent-v0894

## Resumen

Zeno (v0.89.4) es un modelo de regresión tabular desarrollado por ZenoDivergent que actúa como un agregador inteligente de pronósticos: recibe un panel de predicciones de múltiples pronosticadores (humanos, modelos o mercados de predicción) sobre una misma pregunta y devuelve tres salidas: una respuesta refinada, una estimación del rango real de incertidumbre y una alerta cuando todo el grupo está confiado pero probablemente equivocado (el fenómeno de "consenso trampa").

El modelo se entrenó sobre 524.145 casos procedentes de 14 dominios de pronóstico: benchmarks de forecasting (ForecastBench), mercados de predicción, criptomonedas, salud pública (COVID-19, RSV, gripe), economía, energía, mar y meteorología. El entrenamiento se realizó en una GPU H200 y este checkpoint concreto (small, seed 1) fue seleccionado de una campaña de 12 ajustes mediante una regla de selección definida antes de evaluar los resultados.

No es un modelo de lenguaje ni procesa texto libre: trabaja sobre datos estructurados de probabilidad, con un encoder compartido y 14 cabezas especializadas por dominio. Su relevancia está en la agregación de opiniones para agentes de IA y sistemas de decisión, y se distribuye en ONNX y safetensors con licencia Apache-2.0, con una API pública HTTP y un endpoint MCP para integrarlo en clientes como Claude o Cursor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder compartido con 14 cabezas por dominio de pronóstico (model-of-models / ensemble aggregator) |
| Parámetros totales | 17.024.724 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; acepta paneles de pronosticadores de longitud variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada tabular, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (zeno-v0894.onnx + .onnx.data) y model.pt |

## Arquitectura y entrenamiento

Zeno es un modelo de agregación de pronósticos con un único encoder compartido y 14 campos de pronóstico especializados. Su entrada es un panel estructurado con identificadores de pronosticador, marcas temporales de disponibilidad y probabilidades, y su salida incluye la respuesta agregada, la amplitud del intervalo y señales de advertencia cuando el consenso del grupo es sospechoso. El checkpoint v0.89.4 (variante small, seed 1) fue elegido entre 12 ajustes mediante una regla pre-registrada, lo que reduce el riesgo de sobreajuste a la partición de evaluación.

El entrenamiento usó 524.145 casos de 14 dominios (ForecastBench, mercados de predicción, cripto, salud pública, economía, energía, mar y clima) y se ejecutó en una única GPU NVIDIA H200. Los experimentos del 30 de octubre de 2026, con tres semillas pareadas y semanas finales reservadas que nunca se abrieron, mostraron que añadir el entrenamiento de advertencias no degrada la calidad del pronóstico (diferencia de −0,3 %, intervalo 90 % de −1,7 % a +1,1 % sobre 2.055 resultados pareados), que el límite está en las entradas y no en el tamaño del modelo (una versión a mitad de tamaño memorizó menos y rindió igual en semanas no vistas), y que incorporar los últimos 8 fallos de cada pronosticador reduce el error en un 1,0 % en semanas no vistas. La conversión a ONNX coincide con PyTorch dentro de 4,2e-7, y reejecutar el código de entrenamiento con estos pesos reproduce cada respuesta graduada de forma exacta.

## Capacidades

- Agregación de paneles de pronósticos: combina probabilidades de múltiples pronosticadores sobre una misma pregunta binaria y produce una respuesta mejorada respecto a la media o la referencia.
- Estimación de incertidumbre: devuelve la amplitud probable del rango real del resultado.
- Detección de consenso trampa: emite advertencias cuando el grupo está unánime y confiado pero con alta probabilidad de error conjunto.
- Cobertura multi-dominio: 14 campos entrenados (ForecastBench, mercados, cripto, COVID-19, RSV, gripe, economía, energía, mar, clima, entre otros).
- Mecanismo de fallo seguro: en dominios donde no ha demostrado mejoría, devuelve automáticamente la respuesta de referencia del grupo, sin empeorarla.
- Integración con agentes: endpoint MCP compatible con Claude, Cursor y cualquier cliente MCP; API HTTP pública; runner ONNX sin dependencia de PyTorch.
- Reproducibilidad exacta: pesos graduados con SHA-256 publicado y ejemplos con respuestas esperadas incluidas en el repositorio.

## Casos de uso

- Agregación de pronósticos en plataformas de predicción: un agregador como Metaculus o Manifold puede pasar el panel de probabilidades de sus usuarios a Zeno para obtener una estimación refinada con bandas de incertidumbre, mejorando la resolución final respecto a la media simple.
- Agentes de IA que necesitan estimar probabilidades: un agente conectado vía MCP puede consultar Zeno antes de tomar decisiones basadas en eventos futuros (elecciones, hitos tecnológicos, mercados), aprovechando que el endpoint acepta peticiones HTTP en cualquier lenguaje.
- Vigilancia epidemiológica: en dominios como COVID-19 y RSV, los equipos de salud pública pueden combinar pronósticos de múltiples modelos y obtener alertas cuando el consenso de los modelos es sospechosamente unánime.
- Trading y análisis de mercados de predicción: un sistema cuantitativo puede usar la salida de Zeno como señal de divergencia entre el precio de mercado y la estimación agregada ajustada (+0,8 % frente a la referencia en mercados).
- Benchmarking de modelos de pronóstico: equipos de investigación pueden evaluar sus propios pronosticadores comparando sus paneles con la salida de Zeno en ForecastBench, donde el modelo supera la referencia en +4,2 %.
- Gestión de riesgo operacional: en energía y meteorología, un operador puede usar el rango de incertidumbre devuelto para dimensionar reservas, sabiendo que el modelo devuelve la respuesta del grupo cuando no está validado en ese dominio.
- Auditoría de consenso en encuestas económicas: análisis de sesgos de agrupamiento en paneles tipo encuestas de la Fed de Filadelfia, detectando cuándo los encuestados comparten la misma fuente subyacente.

## Benchmarks y rendimiento

Datos publicados en la model card (mejora sobre la respuesta de referencia por dominio):

| Dominio | Mejora vs referencia | Mejora vs pronosticador medio |
|---|---|---|
| ForecastBench | +4,2 % | +6,2 % |
| RSV | +2,1 % | no disponible |
| Mercados | +0,8 % | no disponible |
| COVID-19 | +0,02 % | no disponible |

Experimentos adicionales del 30 de octubre de 2026 (tres pruebas pareadas, tres semillas, semanas finales reservadas):

| Experimento | Resultado |
|---|---|
| Entrenar con vs sin advertencias | −0,3 % (intervalo 90 %: −1,7 % a +1,1 %; 2.055 resultados) |
| Modelo a mitad de tamaño, semanas no vistas | ~5 % mejor que la referencia |
| Últimos 8 fallos por pronosticador como entrada | −1,0 % de error (intervalo: +0,1 % a +2,6 %) |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K), lo cual es esperable dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 17 millones de parámetros y un repo de 0,2 GB, el modelo cabe con holgura en CPU o en cualquier GPU moderna (del orden de decenas de MB en precisión estándar; cuantizaciones no disponibles).
- GPU recomendadas: ninguna en particular para inferencia; el entrenamiento original se realizó en una NVIDIA H200, pero la inferencia vía ONNX Runtime funciona en CPU.
- Consumer GPUs: no requiere GPU; funciona en portátiles y máquinas sin aceleradora mediante onnxruntime y numpy.
- Opciones de despliegue: ONNX Runtime (vía `model.serving_v0894.onnx_runner`), PyTorch con safetensors o model.pt, API HTTP pública (`zenodivergent.dev/api/public/v1/check`), endpoint MCP para clientes de IA y Space de Hugging Face con demo interactiva.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Característica | Zeno v0.89.4 | Modelos de agregación clásicos (media, median) | LLM de pronóstico genérico (p. ej. GPT-4o en ForecastBench) |
|---|---|---|---|
| Tipo | Red tabular entrenada (17M parámetros) | Regla estadística sin aprendizaje | Modelo de lenguaje de propósito general |
| Entrada | Panel estructurado de probabilidades | Panel de probabilidades | Texto libre y contexto |
| Detección de consenso trampa | Sí, entrenada explícitamente | No | No de forma fiable |
| Mejora vs referencia en ForecastBench | +4,2 % | Línea base (referencia) | no disponible |
| Licencia | Apache-2.0 | n/a | Variable, generalmente restrictiva |
| Despliegue | ONNX en CPU, API, MCP | Trivial | Requiere GPU de gama alta |

No existen otros modelos entrenados específicamente como agregadores de paneles de pronóstico con publicación pública comparable, por lo que la comparativa se limita a las alternativas clásicas y a LLM usados como pronosticadores.

## Limitaciones y advertencias

- Modelo de investigación en fase temprana con datos limitados, según declara el propio autor en la sección de alcance.
- No está probado que supere a la referencia en semanas frescas en todos los dominios; cripto, la encuesta de la Fed de Filadelfia y mercados cross-venue devuelven la respuesta de referencia sin refinamiento.
- Los dominios ECB, energía, mar y clima requieren más semanas de test no vistas para validarse; los re-scoring están programados entre el 30 de noviembre y el 14 de diciembre de 2026.
- Gripe, Numinous, rivers y notflat aún no están entrenados.
- Las advertencias (warnings) medidas y la opción múltiple entrenada con resultados reales están en desarrollo, no en producción.
- En COVID-19 y RSV, los resultados cayeron fuera del borde del intervalo con demasiada frecuencia; se trabaja en ampliar los rangos.
- Sesgos: al aprender de paneles históricos, puede heredar sesgos de correlación de fuentes compartidas entre pronosticadores; los propios experimentos del autor sugieren que el límite actual está en la riqueza de las entradas, no en el tamaño del modelo.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero la salida refinada puede ser errónea si el panel de entrada es de baja calidad o está sesgado.
- Uso comercial: la licencia Apache-2.0 lo permite sin restricciones significativas, aunque la API pública puede tener condiciones de servicio propias no detalladas en la model card.
- Con solo 51 descargas y 1 like en el momento de redactar la ficha, la adopción y el escrutinio externo del modelo son todavía muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v0894
- Demo interactiva (Space): https://huggingface.co/spaces/mbarbosa1/zeno-try-it
- API pública: https://zenodivergent.dev/api/public/v1/check
- Endpoint MCP: https://zenodivergent.dev/api/public/v1/mcp
- Informe completo de la versión: `v0894-release-report.json` (incluido en el repositorio, con adendas 1 y 2)
