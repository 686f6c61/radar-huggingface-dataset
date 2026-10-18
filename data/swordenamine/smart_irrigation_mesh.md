# swordenamine/smart_irrigation_mesh

## Resumen

`swordenamine/smart_irrigation_mesh` no es un modelo de lenguaje ni un modelo fundacional: es un repositorio alojado en HuggingFace que contiene el diseno y el codigo de simulacion de una red de riego inteligente basada en una malla de sensores IoT de bajo consumo (LoRaWAN), un modelo fisico de humedad del suelo, un calculador de evapotranspiracion de referencia (Penman-Monteith) y un predictor de humedad a 24 horas descrito como "LSTM-lite", junto con un agregador de aprendizaje federado (FedAvg). El autor es `swordenamine` (la model card usa el alias "swordenkisk") y el repositorio se presenta como una propuesta de proyecto con badges autoasignados de novedad (97/100), viabilidad (79/100) e impacto (97/100).

El problema que aborda es real y esta bien documentado en la literatura agronomica: la agricultura consume en torno al 70 % del agua dulce global y el riego por calendario fijo desperdicia una fraccion importante del recurso. La propuesta combina sensado distribuido cada 15 minutos (humedad, temperatura, salinidad, pH), propagacion de lecturas por gossip sobre LoRaWAN, prediccion en el borde y control de valvulas por zona, con aprendizaje federado para mejorar el modelo compartido sin que las granjas exporten datos crudos.

Es relevante ahora unicamente como artefacto conceptual y de simulacion: no hay pesos publicados, no hay metadatos de pipeline, licencia ni idiomas en HuggingFace, y el repositorio acumula 0 descargas y 0 likes. Cualquier evaluacion de rendimiento predictivo es, a dia de hoy, imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer. Pipeline hibrido: modelo fisico de balance hidrico (bucket model), ecuacion de Penman-Monteith para ET₀, predictor de humedad descrito como "LSTM-lite", agregacion federada FedAvg y simulacion de red LoRaWAN con protocolo gossip |
| Parametros totales | no disponible (no se publican pesos ni recuento de parametros del componente LSTM) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana temporal de prediccion declarada es de 24 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en metadatos; la model card menciona como trabajo futuro (v1.3) alertas SMS en arabe |
| Licencia | MIT segun la model card (Copyright (c) 2026 swordenkisk); el campo de licencia no esta declarado en los metadatos de HuggingFace |
| Formato de pesos | no disponible; el repositorio se describe como codigo Python (modulos `.py`), sin artefactos de pesos publicados |

## Arquitectura y entrenamiento

El repositorio describe un pipeline de cinco etapas: malla de sensores de suelo que muestrea cada 15 minutos, gateway de agregacion en el borde que fusiona las lecturas en un mapa de campo, predictor de humedad a 24 horas, programador de riego que actua valvula por valvula, y actualizacion federada del modelo. La parte fisica se apoya en un modelo de balance hidrico de tipo bucket, `dθ/dt = P(t) + I(t) − ET₀(t)·Kc − D(t)`, con coeficientes de cultivo explicitos (trigo 1,15; tomate 1,05; palmera datilera 0,9), y en la ecuacion de Penman-Monteith para la evapotranspiracion de referencia. La regla de decision de riego se define por umbral de humedad dependiente de cultivo y fase de crecimiento, volumen `I* = (θ_fc − θ(t)) × D_root × A_zone` y corte cuando la prediccion alcanza el 90 % de la capacidad de campo.

La capa de aprendizaje es un FedAvg clasico: en cada ronda, cada explotacion calcula su gradiente local `Δwₖ = ∇L(wᵣ, Dₖ)` y el servidor agrega `wᵣ₊₁ = Σₖ (nₖ/n)·(wᵣ − η·Δwₖ)`, de modo que solo se comparten actualizaciones de pesos y nunca los datos crudos. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, el volumen de datos de entrenamiento, ni si el componente LSTM fue entrenado con datos reales o sinteticos; tampoco se documenta RLHF, DPO ni ningun proceso de alineacion. El vocabulario "LSTM-lite" sugiere un modelo recurrente de dimension reducida orientado a microcontroladores, pero no se aportan capas, dimensiones ocultas ni metricas de error (RMSE, MAE) del predictor.

## Capacidades

- Simulacion de una malla de hasta 20 nodos de sensores con cobertura y densidad por hectarea calculadas (`coverage_pct`, `nodes_per_ha`).
- Modelado de la dinamica de humedad volumetrica del suelo mediante balance hidrico con drenaje profundo y capacidad de campo.
- Calculo de evapotranspiracion de referencia ET₀ por Penman-Monteith a partir de radiacion neta, flujo de calor del suelo, temperatura, viento a 2 m y presion de vapor.
- Motor de decision de riego por zona con umbrales por cultivo y fase de crecimiento, y calculo de volumen a aplicar en m³.
- Prediccion de humedad del suelo a 24 horas mediante un componente descrito como LSTM-lite, alimentado con datos meteorologicos.
- Agregacion federada de modelos entre explotaciones con FedAvg y preservacion de privacidad (solo se comparten gradientes).
- Simulacion de paquetes LoRaWAN y propagacion epidemia (gossip) sobre topologia de malla.
- Generacion de informes de temporada con agua consumida, porcentaje de ahorro y estimacion de rendimiento (t/ha).
- No dispone de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Dimensionamiento de un piloto de riego de precision: usar `IrrigationMesh` con el area, cultivo y numero de nodos previstos para estimar cobertura de malla y densidad de sensores antes de comprar hardware LoRaWAN, evitando sobredimensionar la inversion en nodos.
- Evaluacion ex ante de ahorro hidrico: ejecutar una temporada simulada con el modelo bucket y ET₀ y comparar el agua consumida frente al calendario fijo tradicional, para justificar (o descartar) la inversion ante una comunidad de regantes.
- Docencia e investigacion en agricultura digital: el repositorio incluye un ejemplo completo (`algeria_farm_demo.py`) que permite reproducir el ciclo sensado-decision-actuacion en un entorno controlado y sin riesgo agronomico.
- Estudio de privacidad en aprendizaje federado aplicado a explotaciones: usar `federated_learner.py` para medir como evoluciona la convergencia de FedAvg cuando cada granja aporta distribuciones de suelo distintas (por ejemplo, Mitidja frente a Souf), sin exponer datos de produccion.
- Prototipado de la capa de decision para integracion con controladores de valvula reales: la logica de umbral, volumen y corte puede extraerse y validarse contra datos historicos de una parcela antes de conectarla a electrovalvulas.
- Analisis de sensibilidad agronomica: variar `Kc`, capacidad de campo y umbrales por fase de crecimiento para identificar en que condiciones el ahorro declarado del 40-55 % resulta plausible y en cuales no.
- Base para integrar ET₀ satelital (linea v1.2 del roadmap con Sentinel-2): el calculador `et0_calculator.py` sirve como referencia de comparacion frente a productos de teledeteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye badges autoasignados ("idea score 89,0/100", novedad 97, viabilidad 79, impacto 97) y una tabla de impacto para Argelia (8,5 millones de ha agricolas, ~7 000 millones de m³ anuales desperdiciados, reduccion esperada del 40-55 %, valor economico de 150-200 millones de USD/ano a 0,05 USD/m³). Son proyecciones del autor derivadas de supuestos, no mediciones experimentales, y no deben citarse como resultados de rendimiento.

## Requisitos de hardware

- Inferencia del codigo de simulacion: CPU convencional; no requiere GPU ni VRAM dedicada. El repositorio no publica pesos que cargar en aceleradores.
- Predictor "LSTM-lite": por su denominacion y por el objetivo de ejecucion en el borde, se orienta a CPU o microcontrolador; no se especifican requisitos de memoria ni latencia.
- Despliegue real (fuera del alcance de v1.0): nodos LoRaWAN de RAK Wireless o Dragino, segun cita el roadmap, mas un gateway de agregacion en el borde. No se detallan modelos concretos, consumo energetico ni autonomia.
- Opciones de despliegue software: no se documenta integracion con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia; es una libreria Python invocada directamente (`from smart_irrigation_mesh import IrrigationMesh`).
- Latencia y throughput: no disponibles. No se publican tiempos de ejecucion de la simulacion ni frecuencia de actualizacion del modelo federado mas alla del ciclo de sensado de 15 minutos.

## Comparativa con modelos similares

| Sistema | Naturaleza | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smart_irrigation_mesh | Simulacion de malla IoT + modelo fisico + FedAvg | no disponible | no aplica (prediccion a 24 h) | no disponible | MIT segun model card; no declarada en HF | Repositorio HF con 0 descargas |
| FAO-56 / implementaciones tipo pyfao56 | Metodologia estandar de balance hidrico y ET₀ | no aplica | no aplica | validada en literatura agronomica | abierta (dominio publico / open source, verificar por implementacion) | ampliamente disponible |
| AquaCrop (FAO) | Modelo de productividad del agua por cultivo | no aplica | no aplica | validado en multiples cultivos y regiones | abierta (verificar condiciones) | disponible |
| Plataformas comerciales de riego de precision | Producto cerrado con sensores y scheduler | no disponible | no disponible | no disponible publicamente | propietaria | comercial |

La comparacion es cualitativa: `smart_irrigation_mesh` se posiciona como capa de simulacion y decision con privacidad federada, mientras que FAO-56 y AquaCrop aportan las bases agronomicas contrastadas que el repositorio reimplementa sin validacion publicada. No se dispone de datos verificables de rendimiento de ninguno de los sistemas comparados en la informacion proporcionada, mas alla de la validacion general de las metodologias FAO en la literatura.

## Limitaciones y advertencias

- No se publican pesos ni artefactos entrenados: el repositorio es codigo de simulacion, no un modelo listo para inferencia. La calidad predictiva del componente LSTM-lite es desconocida y no hay metricas de error.
- Ausencia total de validacion experimental: las cifras de ahorro del 40-55 %, de 3-4 millones de m³/ano y de valor economico son proyecciones sin contraste de campo.
- Inconsistencias de metadatos: el campo de licencia, pipeline, idiomas y tags de HuggingFace estan vacios o reducidos a `region:us`; la licencia MIT solo aparece en el texto de la model card. El autor figura como `swordenamine` en el ID y como "swordenkisk" en los badges.
- Fechas incoherentes: la fecha de creacion (2026-10-17) es posterior a la de actualizacion (2026-03-06), lo que sugiere metadatos no fiables.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni issues publicos conocidos.
- El roadmap situa el hardware real en v1.1 y la integracion satelital en v1.2, ambas sin completar; no hay evidencia de funcionamiento sobre LoRaWAN fisico ni de calibracion con sensores comerciales.
- El modelo fisico bucket requiere calibracion local (capacidad de campo, punto de marchitez, profundidad radicular, coeficientes de cultivo); sin ella, las recomendaciones de riego pueden ser incorrectas y provocar estres hidrico o lixiviacion de nutrientes.
- Dependencia de una API meteorologica externa para ET₀ y para el pronostico a 24 h: no se documenta proveedor, acuerdo de nivel de servicio ni manejo de fallos.
- Sesgo geografico: los supuestos y el ejemplo estan centrados en Argelia (Mitidja, Souf, Saoura) y en un conjunto reducido de cultivos; la transferibilidad a otras latitudes y sistemas de riego no esta demostrada.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de recomendaciones agronomicas erroneas si se usa el scheduler sin supervision humana en produccion.
- Antes de cualquier uso comercial, verificar la licencia efectiva del codigo en el repositorio de GitHub enlazado, ya que la declaracion MIT de la model card no esta respaldada por metadatos de la plataforma.
- Las busquedas web realizadas no devolvieron informacion tecnica relevante sobre este repositorio (solo resultados no relacionados), por lo que no existe corroboracion externa de ninguna afirmacion de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/swordenamine/smart_irrigation_mesh
- Repositorio GitHub citado en la model card: https://github.com/swordenkisk/smart_irrigation_mesh (mencionado por el autor, no verificado)
- Referencia agronomica de la ecuacion ET₀ (Penman-Monteith, FAO-56): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
