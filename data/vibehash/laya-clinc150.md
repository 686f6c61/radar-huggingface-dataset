# VibeHash/laya-clinc150

## Resumen

laya-clinc150 es un ajuste fino del modelo Laya (convaiinnovations/laya) desarrollado por VibeHash para clasificación de intenciones en asistentes de voz, con detección explícita de consultas fuera de dominio (out-of-scope). El modelo resuelve el problema de encaminar peticiones de usuario hacia una de las 150 intenciones del conjunto CLINC150 (banca, viajes, cocina, trabajo, charla informal) y responder "ninguna de estas" cuando la petición no encaja en ninguna categoría. Está diseñado para operar con confianza calibrada, de modo que el sistema pueda actuar solo sobre las peticiones de las que está seguro y derivar el resto a un fallback.

El modelo cuenta con 421.293.830 parámetros, se distribuye en formato safetensors con un repositorio de 0,8 GB y se ejecuta mediante la librería `laya` (versión 0.4.31 o superior). Está entrenado sobre el split "plus" de CLINC150 y declara métricas de calibración (ECE de 0,0499), lo que lo hace apto para despliegues con umbrales de abstención y predicción selectiva.

Su relevancia actual radica en que aborda uno de los puntos más delicados de un asistente desplegado: las consultas que el modelo nunca vio durante el entrenamiento. Frente a un Laya sin ajustar (52,3 % de acierto en dominio), este ajuste alcanza un 95,0 % de precisión en dominio y un 71,6 % de recall fuera de dominio, con una confianza media declarada de 0,955.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya; transformer, detalle no especificado) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del modelo base convaiinnovations/laya, con 421 millones de parámetros. No se especifica en la información disponible la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención ni detalles de la tokenización). La tarea es clasificación de texto sobre 151 opciones: las 150 intenciones de CLINC150 más la clase `oos` ("none of these").

El entrenamiento se realizó sobre el conjunto CLINC150, configuración "plus", que incluye consultas fuera de dominio como clase explícita. Durante el ajuste se reservaron 400 consultas de entrenamiento para ajustar un umbral de confianza orientado a obtener un 99 % de acierto entre las respuestas que superan dicho umbral; el valor resultante es 0,9687. El modelo produce una probabilidad para cada una de las 151 opciones en un único forward pass, lo que permite aplicar predicción selectiva sin coste adicional de inferencia. Se reporta un único ajuste con semilla 0, ejecutado en una RTX 4070 SUPER el 2026-11-18. No se detalla el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificación de intenciones en inglés sobre 150 categorías de CLINC150 (banca, viajes, cocina, trabajo, small talk, entre otras).
- Detección de consultas fuera de dominio mediante la clase `oos` ("none of these").
- Salida de probabilidad calibrada para cada una de las 151 opciones en un solo forward pass.
- Predicción selectiva: abstención controlada mediante umbral `min_confidence` (0,9687 ajustado en entrenamiento).
- Inferencia por lotes mediante `predict_batch(texts, questions, batch_size=32)`.
- Ejecución en CPU y GPU con resultados consistentes en las primeras 100 consultas de test (diferencias de confianza de 0,0002 en la mediana).
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un clasificador discriminativo.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz: el modelo clasifica cada transcripción en una de las 150 intenciones y permite derivar al flujo correspondiente; su calibración (ECE 0,0499) permite fijar umbrales operativos sin recalibrar.
- Gestión de consultas no cubiertas: con el umbral 0,9687 el modelo filtra el 91,7 % de las consultas fuera de dominio, evitando que el asistente ejecute acciones no solicitadas o malinterpretadas.
- Derivación a agente humano o fallback: las consultas por debajo del umbral o clasificadas como `none of these` se envían a un operador o a un menú de respaldo, con una tasa de acierto del 98,6 % entre las respuestas que sí se emiten.
- Clasificación por lotes de logs de conversación: `predict_batch` con tamaño 32 permite etiquetar grandes volúmenes de transcripciones (aproximadamente 13 ms por consulta en GPU) para analítica de intenciones y detección de temas emergentes.
- Control de calidad en pipelines de voz: integración como etapa de validación previa a la ejecución de comandos, rechazando peticiones ambiguas o fuera de catálogo antes de invocar servicios downstream.
- Investigación en predicción selectiva y calibración: el modelo sirve como referencia reproducible para estudiar curvas de cobertura-riesgo (95 % de acierto al 88,1 % de cobertura; 98 % al 36,4 %; 99 % al 0,2 %) en clasificación con rechazo.
- Prototipado rápido de asistentes en inglés: con 0,8 GB de pesos y latencia mediana de 24 ms por consulta individual, es desplegable en hardware de consumo (RTX 4070 SUPER) para pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split test de CLINC150 "plus" (5.500 consultas: 4.500 en dominio y 1.000 fuera de dominio), no verificados de forma independiente.

| Metrica | Laya sin ajustar | laya-clinc150 |
|---|---|---|
| Precisión en dominio (de 4.500) | 2.352 (52,3 %) | 4.277 (95,0 %) |
| Intervalo de confianza al 95 % (en dominio) | 50,8 – 53,7 % | 94,4 – 95,6 % |
| Recall fuera de dominio (de 1.000) | 490 (49,0 %) | 716 (71,6 %) |
| Confianza media declarada (5.500) | 0,666 | 0,955 |
| Error de calibración ECE (15 bins) | 0,251 | 0,050 |

Con umbral 0,9687 aplicado una sola vez sobre test: actúa sobre 3.795 de 4.500 consultas en dominio (84,3 %), con 3.741 aciertos (98,6 %); deja pasar 83 de 1.000 consultas fuera de dominio (8,3 %).

Comparación con resultados publicados en el paper de CLINC150 (Larson et al. 2019, Tabla 2, columna "OOS+", modelos entrenados con las consultas fuera de dominio como clase):

| Modelo | Precisión en dominio | Recall fuera de dominio |
|---|---|---|
| BERT (tamaño no especificado en el paper) | 96,7 % | 59,2 % |
| Rasa | 90,9 % | 66,0 % |
| laya-clinc150 (sin umbral) | 95,0 % | 71,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (421 M de parámetros); en fp16 alrededor de 0,85 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en una RTX 4070 SUPER; por tamaño, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.).
- Ejecución en CPU verificada: el autor muestra resultados de inferencia en CPU consistentes con GPU en las primeras 100 consultas de test.
- Despliegue: mediante la librería `laya` (pip install laya==0.4.31) y `huggingface_hub` para descargar pesos y ficheros auxiliares (`questions.json`, `labels.json`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 24 ms y percentil 95 de 26 ms por consulta individual; aproximadamente 13 ms por consulta en lotes de 32 (medido en GPU).
- Advertencia de hardware: una consulta cercana al umbral puede caer a un lado u otro según el hardware; las confianzas difirieron hasta 0,07 en una consulta entre CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión en dominio (CLINC150 plus) | Recall OOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-clinc150 | 421 M | no disponible | 95,0 % | 71,6 % | Apache 2.0 | Hugging Face |
| BERT (paper CLINC150, tamaño no especificado) | no disponible | no disponible | 96,7 % | 59,2 % | no disponible | Referencia académica |
| Rasa (paper CLINC150) | no disponible | no disponible | 90,9 % | 66,0 % | no disponible | Framework open source |
| Laya sin ajustar (convaiinnovations/laya) | 421 M (base) | no disponible | 52,3 % | 49,0 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte multilingüe.
- El recall fuera de dominio es del 71,6 % sin umbral: 284 de las 1.000 consultas fuera de dominio reciben una intención, con direcciones (16), vacunas (13) y pedidos (11) como confusiones más frecuentes.
- Intenciones más débiles: transactions y calendar aciertan el 76,7 %; yes, restaurant reviews, how busy, pin change y report fraud, el 80 %. La confusión más común es transactions tomada por spending history (6 de 30).
- El modelo es ligeramente sobreconfiado: declara 0,955 de media y acierta el 90,8 % de todas las consultas; las puntuadas entre 0,95 y 0,98 aciertan el 93,1 %, y las de 0,98 o más, el 97,9 %.
- El umbral 0,9687 se ajustó sobre 400 consultas de entrenamiento retenidas; el umbral elegido sobre el propio test es optimista para consultas nuevas y no debe extrapolarse como garantía.
- Las consultas deben formularse exactamente como aparecen en `questions.json`, con la misma instrucción y las mismas 151 opciones en el mismo orden; alterar el formato invalida los resultados.
- Riesgo de alucinación bajo en el sentido generativo (es un clasificador), pero existe riesgo de asignación errónea de intención en consultas ambiguas o cercanas al umbral.
- La licencia Apache 2.0 permite uso comercial, pero la información disponible no detalla condiciones adicionales del modelo base convaiinnovations/laya.
- No se han publicado resultados de benchmarks independientes; las métricas son declaradas por el autor y marcadas como no verificadas.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeHash/laya-clinc150
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Paper CLINC150 (Larson et al. 2019): no disponible en la información proporcionada
- Repositorio de la librería `laya`: no disponible en la información proporcionada
