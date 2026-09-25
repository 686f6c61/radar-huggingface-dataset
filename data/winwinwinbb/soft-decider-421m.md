# winwinwinbb/soft-decider-421m

## Resumen

soft-decider-421m es un ajuste fino por RLCD de convaiinnovations/laya (a su vez construido sobre el encoder answerdotai/ModernBERT-large), publicado por el usuario winwinwinbb. No es un modelo generativo: recibe un estado en JSON o texto junto con preguntas tipadas (`choice`, `score`, `noul`) y devuelve distribuciones de probabilidad calibradas en una unica pasada forward, en torno a 50 ms de mediana en GPU. Con 421.293.830 parametros y licencia Apache-2.0, ocupa 0,8 GB en el repositorio.

Su relevancia no esta en la exactitud bruta, que mejora marginalmente a su predecesor (0,774 frente a 0,766 en el test oficial), sino en la disciplina de calibracion. El checkpoint upstream publica temperaturas ajustadas sobre datos con los que ya habia entrenado, por lo que sus autores las marcan como no calibradas; aqui la particion de calibracion (400 decisiones) se reserva antes de formar cualquier lote y se ajustan temperaturas por tipo de pregunta y por numero de opciones. El resultado es un ECE de 0,141 frente a 0,214 del checkpoint publicado.

El modelo esta pensado como "System-1" dentro de bucles de agente: resolver decisiones repetitivas y baratas sin invocar a un LLM generativo. Su metrica clave es `auto-decidable@5%`, la fraccion de trafico que una puerta de confianza puede automatizar con un error de ejecucion inferior al 5%, que se situa en 0,374.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no generativo (backbone ModernBERT-large) con cabeza de decision tipada |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como ventana formal; ~768 tokens efectivos de estado con el presupuesto por defecto 1024/256 |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors completos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La columna vertebral es ModernBERT-large, un encoder transformer usado aqui de forma no autorregresiva: no se genera texto, sino que se puntuan opciones y se devuelve una distribucion de probabilidad sobre las mismas en una sola pasada forward. El modelo hereda de `convaiinnovations/laya` la formulacion de preguntas tipadas: `choice` (eleccion entre opciones), `score` (puntuacion) y `noul` (booleano). El pipeline declarado en HuggingFace es `text-classification`.

El ajuste se hizo sobre la particion de entrenamiento de `LocalLLaMA/typed-decisions` con un objetivo RLCD: exploracion gaussiana de media cero sobre los logits, recompensa mediante una regla de puntuacion estrictamente propia (logaritmica y esferica, con w_sph=1.5, mas RPS para el caso ordinal) y REINFORCE con linea base de media de grupo (G=8), complementado con entropia cruzada suave contra las distribuciones profesor del benchmark. Fue un ajuste fino completo, no LoRA, en bf16, durante 6 epocas, con LR 1,75e-5 para el encoder y 7e-5 para la cabeza, con decaimiento coseno. Todo el entrenamiento cupo en una unica RTX 3090 y duro aproximadamente 17 minutos. La innovacion destacable es el tratamiento de la calibracion: la particion de 400 decisiones se aparta antes de formar lotes y sobre ella se ajustan temperaturas por tipo y por cardinalidad de opciones.

## Capacidades

- Decision tipada no generativa: responde preguntas `choice` (seleccion entre opciones), `score` (puntuacion ordinal o continua) y `noul` (booleano), devolviendo probabilidades en lugar de texto.
- Calibracion de confianza: produce distribuciones con temperatura ajustada sobre datos retenidos, lo que permite usar la confianza como senal operativa.
- Puerta de automatizacion: `auto-decidable@5%` = 0,374, es decir, puede automatizar esa fraccion de trafico con un error de ejecucion igual o inferior al 5%.
- Robustez parcial al orden de opciones: el porcentaje de `flip` (cambio de argmax al reordenar las opciones) es del 7,7%.
- Inferencia de una sola pasada: sin decodificacion autoregresiva ni generacion token a token.
- Integracion con el ecosistema Laya/Jev: incluye un servidor compatible con la forma `POST /v1/systemone` de la API TypeSafe, de modo que los clientes oficiales de `typesafe-sdk` funcionan apuntando a la URL base del servidor.
- No dispone de tool calling, function calling, agentes autonomos, vision, audio ni modo de razonamiento explicito (`thinking`). Tampoco cubre multilingue: solo ingles.

## Casos de uso

- Compactacion de contexto en bucles de agente: dado un resumen de resultado de herramienta y el objetivo de la tarea, el modelo responde con una probabilidad de que ese resultado siga siendo necesario, lo que permite descartar contexto antes de reenviar el historial a un LLM y reducir el coste por token.
- Enrutado por confianza dentro de un agente: se ejecuta el modelo como primera etapa barata; si la confianza supera el umbral, la decision se toma sin LLM, y si no, se escala a un modelo generativo o a un humano. Con un 37,4% del trafico automatizable a <=5% de error, el ahorro es medible.
- Batching guiado por reglas de coste: el modelo clasifica si varias operaciones pueden agruparse en una sola llamada segun reglas de coste predefinidas, evitando evaluaciones costosas en cada iteracion.
- Ruptura de bucles: deteccion de que un agente esta repitiendo una accion sin progreso, con una probabilidad calibrada que permite decidir entre continuar, cambiar de estrategia o abortar.
- Clasificacion de estados JSON en pipelines de datos: al aceptar estado en JSON o texto y preguntas tipadas, encaja como etapa de etiquetado o scoring en flujos de procesamiento por lotes.
- Puntuacion ordinal (`score`) con regla de puntuacion propia: util para rankings donde importa la distancia entre niveles y no solo el orden, como priorizar elementos de una cola.
- Compatibilidad con clientes Jev: mediante `scripts/serve_soft.py` se expone un endpoint con la misma forma que la API TypeSafe, lo que permite sustituir o comparar contra el modelo comercial sin reescribir el cliente.
- Filtrado previo en plataformas de evaluacion: al devolver una distribucion calibrada, sirve como primera capa de triaje antes de un juez mas caro, siempre que la decision final no sea critica.

## Benchmarks y rendimiento

Resultados medidos por el propio autor sobre la particion de test oficial (400 casos / 2.000 decisiones). El harness reproduce `laya-typed-decisions` en 0,7664 frente al 0,766 publicado, lo que sirve como verificacion de la regla de medida.

| Modelo | acc | soft acc | Brier | ECE (menor mejor) | score MAE (menor mejor) | flip (menor mejor) | auto-decidable@5% | p50 ms |
|---|---|---|---|---|---|---|---|---|
| soft-decider-421m | 0,774 | 0,551 | 0,192 | 0,141 | 0,221 | 0,077 | 0,374 | 50 |
| laya-typed-decisions (mismo harness) | 0,766 | 0,500 | 0,213 | 0,214 | 0,243 | 0,065 | 0,378 | 50 |
| TypeSafe Jev 1.13.0 (publicado) | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | no disponible | no disponible | 710 |
| Teacher self-agreement ceiling | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

`flip` es la proporcion de decisiones `choice` cuyo argmax cambia al reordenar la lista de opciones. `auto-decidable@5%` es la fraccion de trafico que una puerta de confianza puede automatizar con un error en ejecucion igual o inferior al 5%. Los resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) no aplican a este modelo y no se han publicado.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir del numero de parametros, no dato publicado por el autor): ~0,85 GB en bf16/fp16, ~0,42 GB en int8 y ~0,21 GB en int4, sin contar activaciones. El repositorio ocupa 0,8 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU. El autor entreno el modelo completo en una unica RTX 3090 en bf16 en unos 17 minutos.
- GPU de referencia en las mediciones publicadas: Tesla T4, con 39,5 ms para el checkpoint ingles de 421M y 32,8 ms para la variante multilingue de 322M segun la cobertura de prensa; la model card reporta una mediana de 50 ms en GPU.
- Opciones de despliegue documentadas: libreria Python `laya` (`pip install laya`) con `laya.Agent`, y el servidor compatible con Jev incluido en `scripts/serve_soft.py`, que expone `POST /v1/systemone`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Throughput: no disponible. Como referencia relativa, el modelo publicado TypeSafe Jev 1.13.0 tarda 710 ms de mediana frente a los 50 ms de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | acc | Brier | ECE | score MAE | p50 ms | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| soft-decider-421m | 421.293.830 | Apache-2.0 | 0,774 | 0,192 | 0,141 | 0,221 | 50 | Pesos abiertos en HuggingFace |
| laya-typed-decisions | 421M (familia Laya) | Apache-2.0 | 0,766 | 0,213 | 0,214 | 0,243 | 50 | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13.0 | no disponible | Propietaria (pesos cerrados) | 0,727 | 0,148 | 0,144 | 0,391 | 710 | Servicio alojado, acceso anticipado con lista de espera |

Frente a `laya-typed-decisions`, este checkpoint mejora la calibracion (ECE 0,141 frente a 0,214) y la exactitud (0,774 frente a 0,766), con el mismo coste de latencia; a cambio, empeora ligeramente el `flip` (0,077 frente a 0,065) y el `auto-decidable@5%` (0,374 frente a 0,378). Frente a Jev, gana en exactitud y en latencia (unas 14 veces mas rapido en las cifras comparadas), pero pierde en Brier (0,192 frente a 0,148) y en MAE de puntuacion (0,221 frente a 0,391 a su favor). Jev 1.13.0 es un servicio propietario con pesos cerrados, lo que limita su auditabilidad y su despliegue on-premise.

## Limitaciones y advertencias

- Especialista: esta entrenado sobre y para los cuatro flujos de trabajo sinteticos del benchmark `typed-decisions`. Fuera de ellos cabe esperar el comportamiento del checkpoint base.
- Los fallos fuera de dominio son reales y confiados: en 10 escenarios de bucle de agente escritos a mano (valor de compactacion de contexto, batching por reglas de coste, ruptura de bucles), tanto este modelo como el checkpoint publicado de Laya fallaron en aproximadamente 5 casos, a veces con confianza alta. Al provenir de la misma linea, hacer ensemble de ambos no corrige el problema.
- No debe usarse como juez para puertas de liberacion de derechos, legales o monetarias. Una distribucion de probabilidad no es una decision de cumplimiento normativo; esas comprobaciones corresponden a codigo de reglas determinista.
- Solo acepta estados en ingles.
- El presupuesto por defecto (1024/256) deja unos 768 tokens efectivos de estado. Las preguntas `choice` deberian mantenerse por debajo de unas 20 opciones o incrementar `head_max_len`.
- El sesgo de orden de opciones esta mitigado, no eliminado: 7,7% de `flip`. En decisiones dificiles conviene promediar sobre 2 o 3 ordenaciones distintas.
- El campo `action.act_probability` se hereda del modelo upstream y no aporta senal util; debe usarse `confidence` en su lugar.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es emitir una distribucion sobreconfiada en entradas fuera de distribucion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones de sus pesos base (`convaiinnovations/laya` y `answerdotai/ModernBERT-large`), ambas tambien Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de septiembre de 2026, por lo que carece de validacion independiente externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/winwinwinbb/soft-decider-421m
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Backbone ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Issue sobre calibracion del checkpoint upstream: https://github.com/NandhaKishorM/laya/issues/186
- Issue sobre `act_probability`: referencia #185 en el repositorio de Laya
- Analisis de Laya como alternativa abierta a Jev: https://flowtivity.ai/blog/laya-open-source-jev-alternative/
- Contexto del proyecto Laya y su playground: https://brainfunctioncollapse.com/laya/about
- Cobertura comparativa Laya frente a Jev: https://www.besthub.dev/articles/laya-open-source-decision-engine-beats-jev-7-8x-faster-3-9-more-accurate-be86888d4cab
- Anuncio de Laya en AI Weekly: https://aiweekly.co/alerts/convai-ships-laya-a-421m-modernbert-decision-model-apache-20
