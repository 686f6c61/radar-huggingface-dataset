# statsaibet/ai-model-performance

## Resumen

El repositorio `statsaibet/ai-model-performance` es un artefacto publicado en Hugging Face por el usuario `statsaibet` bajo el titulo "StatsAI Football Calibration: Model vs No-Vig Odds". Por la informacion disponible, no se trata de un modelo de lenguaje ni de un modelo generativo, sino de un conjunto de datos o informe de evaluacion (probablemente tabular) que compara, con periodicidad mensual, las probabilidades prepartido generadas por un modelo propio frente a las probabilidades implicitas de las casas de apuestas una vez eliminado el margen (no-vig odds) sobre los mismos partidos de futbol.

La relevancia de este tipo de publicacion esta en la evaluacion de calibracion: se reportan metricas como el Brier score, la log loss y curvas de calibracion, que son el estandar para medir la calidad de probabilidades en mercados de prediccion deportiva. Comparar contra no-vig odds es una practica habitual porque las cuotas del mercado son un baseline muy competitivo y dificil de batir, de modo que cualquier modelo que se acerque o supere ese baseline en Brier score y log loss tiene interes practico.

El repositorio no incluye informacion sobre arquitectura de modelo, parametros, contexto ni pesos. La model card solo describe el contenido del artefacto y su licencia (CC BY 4.0 segun el texto citado), mientras que los metadatos de Hugging Face no declaran licencia, idiomas ni pipeline. Cualquier dato tecnico adicional debe considerarse no disponible a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe un modelo neuronal; el artefacto es un informe/dataset de calibracion de probabilidades) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos de Hugging Face; la model card cita CC BY 4.0 |
| Formato de pesos | no disponible (no se declaran pesos; previsiblemente datos tabulares en CSV/JSON, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente: la model card no describe capas, tipo de red, tamano, datos de entrenamiento ni proceso de ajuste (RLHF, DPO u otros). El titulo y la descripcion apuntan a un ejercicio de calibracion de probabilidades prepartido de futbol, pero no se especifica si el modelo que genera esas probabilidades es estadistico (por ejemplo, un modelo de Poisson o Elo), de machine learning clasico (gradient boosting) o neuronal.

Tampoco se detalla la composicion del conjunto de partidos evaluados, el periodo cubierto, la frecuencia exacta de actualizacion mensual ni el procedimiento de eliminacion del margen (no-vig) aplicado a las cuotas. La unica innovacion metodologica identificable es la comparacion directa contra no-vig odds en las mismas muestras, que es la forma correcta de aislar el rendimiento predictivo del modelo del margen de la casa de apuestas.

## Capacidades

- Publicacion de metricas de calibracion mensuales: Brier score, log loss y curvas de calibracion de probabilidades prepartido.
- Comparacion con un baseline de mercado: probabilidades implicitas de casas de apuestas sin margen (no-vig) sobre los mismos partidos.
- Evaluacion de probabilidades en el dominio del futbol prepartido (mercado 1X2 u otros, sin especificar).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No se documenta soporte de agentes, modo thinking ni capacidades multilingues.
- El artefacto esta etiquetado con `region:us`, lo que sugiere una orientacion al mercado estadounidense o simplemente la region de publicacion, sin implicaciones funcionales conocidas.

## Casos de uso

- Evaluacion de modelos de prediccion deportiva: usar el informe mensual como referencia externa para comparar el Brier score y la log loss de un modelo propio de probabilidades 1X2 contra el baseline no-vig en el mismo conjunto de partidos.
- Investigacion en calibracion probabilistica: emplear las curvas de calibracion publicadas para estudiar sesgos sistematicos (sobreconfianza o infraconfianza) en probabilidades de eventos deportivos.
- Analisis de eficiencia de mercado: medir la brecha entre las probabilidades del modelo y las no-vig odds para estimar si existe valor explotable en determinados segmentos (ligas, cuotas, favoritos frente a no favoritos).
- Backtesting de estrategias de apuestas: integrar las series mensuales de metricas como capa de validacion historica antes de desplegar una estrategia con capital real.
- Docencia y divulgacion: utilizar el conjunto como ejemplo practico de evaluacion con Brier score y log loss frente a un baseline de mercado en cursos de estadistica aplicada o ciencia de datos deportiva.
- Auditoria de proveedores: si el modelo subyacente se comercializa, el informe sirve como evidencia periodica de rendimiento para clientes que necesitan verificar la calidad de las probabilidades suministradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona Brier score, log loss y calibracion, pero no incluye valores numericos, periodos concretos ni comparaciones cuantitativas que puedan reproducirse en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se describe un modelo neuronal con pesos que requiera GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; no aplicables a un artefacto de datos o informe sin pesos publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o artefactos comparables de la misma categoria (informes de calibracion de probabilidades deportivas frente a no-vig odds).

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, datos de entrenamiento, periodo evaluado ni metodologia de calculo del no-vig, lo que impide reproducir o auditar los resultados.
- Ambiguedad de licencia: los metadatos de Hugging Face no declaran licencia y la model card cita CC BY 4.0; conviene verificar la licencia efectiva antes de cualquier uso comercial o redistribucion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de sobreajuste al mercado: si el modelo se entrena o ajusta con cuotas de casas de apuestas, la comparacion contra no-vig odds puede estar contaminada y sobreestimar su capacidad predictiva real.
- Dominio estrecho: cualquier conclusion se limita al futbol prepartido en los partidos y periodos cubiertos; no es extrapolable a otros deportes ni a mercados en vivo.
- Sin garantias de actualizacion: la frecuencia mensual declarada no implica continuidad; la ultima actualizacion registrada es del 23 de noviembre de 2026.
- No es un modelo generativo: no debe evaluarse con criterios de LLM (contexto, cuantizacion, tool calling); hacerlo llevaria a conclusiones erroneas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/statsaibet/ai-model-performance
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
