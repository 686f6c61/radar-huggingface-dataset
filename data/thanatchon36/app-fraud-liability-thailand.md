# thanatchon36/app-fraud-liability-thailand

## Resumen

`thanatchon36/app-fraud-liability-thailand` no es un modelo de lenguaje ni una red neuronal con pesos entrenados: es el repositorio de referencia de un modelo analítico de teoria de juegos sobre la asignacion de responsabilidad en fraudes de pago APP (Authorised Push Payment). Lo firma Thanatchon Chongmankhong como material suplementario del articulo *Who Should Bear the Loss?* (preprint, noviembre de 2026), seccion 4, y contiene la especificacion formal, los parametros ilustrativos de las figuras y una implementacion de referencia en Python sobre NumPy.

El modelo describe una interaccion estrategica cerrada entre cinco partes (consumidor, PSP emisor, PSP receptor, operador de telecomunicaciones y plataforma), cada una de las cuales elige un nivel de cuidado con coste cuadratico y soporta una fraccion del dano de la victima. El resultado central es un esquema de reparto de responsabilidad optimo tipo *water-filling* que maximiza el bienestar bajo la restriccion de que las cuotas sumen uno.

Es relevante para investigadores en economia del derecho, regulacion de pagos (PromptPay en Tailandia) y diseno de politicas de responsabilidad, no para desarrolladores que busquen un modelo generativo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo analitico de teoria de juegos (juego cerrado de 5 partes); no es una red neuronal |
| Parametros totales | no disponible (no hay pesos; el repositorio contiene especificacion y codigo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; se distribuyen `model_specs.json` y `liability_model.py`) |

## Arquitectura y entrenamiento

El "modelo" es un juego estatico con cinco jugadores *i* ∈ {Consumer, Sending PSP, Receiving PSP, Telco, Platform}. Cada parte elige un nivel de cuidado *e_i* con funcion de coste *c_i(e_i) = e_i² / (2k_i)* y soporta una cuota *s_i* de la perdida de la victima. La productividad del cuidado se define como *θ_i = a_i² k_i*. No existe entrenamiento, dataset ni ajuste por RLHF/DPO: los parametros son ilustrativos y estan declarados como no estimados en la propia model card.

La innovacion tecnica es el resultado de *water-filling* de la Proposicion 2, que fija las cuotas optimas con presupuesto equilibrado como *s_i\* = max{0, 1 − λ/θ_i}*, donde λ es el multiplicador de Lagrange que garantiza Σ s_i = 1. El solver se implementa en `liability_model.py` sobre NumPy con la funcion `waterfill`. El resto de proposiciones caracterizan el problema de equipo (infrainversion bajo reparto equilibrado), el efecto de la manipulacion, el caso de baja exigibilidad (π bajo) y la restauracion del *first-best* mediante compensacion a victimas mas multas al Estado.

## Capacidades

- Calculo de cuotas optimas de responsabilidad bajo presupuesto equilibrado mediante un solver de *water-filling*.
- Analisis cualitativo de incentivos de cuidado en juegos de responsabilidad compartida con cinco partes.
- Evaluacion de regimenes estilizados de responsabilidad (cuotas de incentivo por regimen en `model_specs.json`).
- Analisis de sensibilidad sobre productividades del cuidado *θ_i* y sobre el parametro de exigibilidad π.
- Modelizacion del efecto de manipulacion sobre la cuota optima del consumidor.
- No soporta *tool calling*, agentes, razonamiento multi-paso generativo ni capacidades multilingues; solo ingles en la documentacion.

## Casos de uso

- Analisis regulatorio de esquemas de responsabilidad en pagos instantaneos: el solver permite calcular como cambian las cuotas *s_i\* al variar las productividades *θ_i* de cada parte, util para evaluar propuestas normativas sobre PromptPay u otros sistemas de pago instantaneo.
- Diseno de contratos entre PSP emisor y receptor: la Proposicion 1 cuantifica la infrainversion en cuidado cuando el reparto es puramente presupuestado, lo que sirve para justificar clausulas de responsabilidad adicionales.
- Evaluacion de regimes de exigibilidad: la Proposicion 4 permite argumentar por que, con π bajo, un regimen de responsabilidad compartida degenera en responsabilidad de facto del consumidor.
- Docencia en economia del derecho: el codigo de referencia y las cinco proposiciones sirven como material practico para cursos de law-and-economics con ejercicios de calibracion.
- Investigacion empirica: la agenda de la Seccion 9 del articulo identifica los datos necesarios para calibrar los parametros, y este repositorio proporciona el punto de partida computacional.
- Analisis de politica publica sobre fraude APP en Tailandia: el modelo permite comparar el bienestar bajo distintos repartos de perdida entre teleco, plataforma y entidades de pago.
- Revision por pares y replicacion: al ser codigo MIT con especificacion JSON, cualquier revisor puede reproducir las figuras del articulo y verificar las proposiciones numericamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento computacional ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplica; el solver es codigo NumPy que opera sobre vectores de cinco elementos.
- GPU recomendadas: no aplica; se ejecuta en CPU.
- Cabe en cualquier equipo consumer: el calculo es trivial (un *water-filling* sobre cinco cuotas).
- Opciones de despliegue: ejecucion directa del script Python `liability_model.py` con NumPy; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; al ser un calculo de forma cerrada, la latencia es del orden de microsegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| app-fraud-liability-thailand | Modelo analitico de teoria de juegos | no aplica | no aplica | MIT | Hugging Face (0 descargas) |
| Modelos de lenguaje para analisis legal | LLM generativo | no disponible | no disponible | no disponible | no disponible |
| Frameworks de economia computacional | Librerias de simulacion | no aplica | no aplica | variable | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Todos los parametros son ilustrativos y no estimados; los resultados son cualitativos, segun declara el propio autor.
- No es un modelo predictivo: no produce probabilidades de fraude ni clasificaciones, solo caracteriza incentivos bajo supuestos de racionalidad.
- El modelo asume cinco partes y formas funcionales concretas (coste cuadratico, productividad *a_i² k_i*); desviaciones de estos supuestos no estan cubiertas.
- La calibracion empirica queda pendiente y se remite a la agenda de la Seccion 9 del articulo; sin datos reales, las cuotas *s_i\** no deben usarse directamente en produccion regulatoria.
- La documentacion esta solo en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- Al no haber pesos ni dataset, no aplican riesgos de sesgo de entrenamiento ni de alucinacion en el sentido habitual; el riesgo es de mala especificacion del modelo o de uso de parametros no calibrados.
- El repositorio presenta 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/thanatchon36/app-fraud-liability-thailand
- Dataset en Hugging Face: https://huggingface.co/datasets/thanatchon36/app-fraud-liability-thailand
- Paper online: https://thanatchon36.github.io/app-fraud-liability-thailand/paper/
- Codigo en GitHub: https://github.com/thanatchon36/app-fraud-liability-thailand
