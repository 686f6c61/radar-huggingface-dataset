# swordenamine/drone_precision_ag

## Resumen

`swordenamine/drone_precision_ag` es un repositorio publicado en HuggingFace que, a pesar de su nombre y de su ubicación en el Hub, no contiene un modelo de aprendizaje automatico: no se publican pesos, no hay tokenizador, no se declara arquitectura de red ni pipeline de inferencia. Lo que describe la model card es un stack de software en Python para agricultura de precision con drones: calculo de indices multiespectrales (NDVI, NDRE, NDWI) a 5 cm de resolucion, generacion de mapas de prescripcion de fertilizante de tasa variable, planificacion de cobertura tipo boustrophedon, evitacion de colisiones ORCA y coordinacion de una flota de cuatro drones con registro de eventos en un oraculo compatible con Chainlink.

El repositorio se presenta como solucion al problema del abonado uniforme, que segun la propia card desperdicia entre el 50 y el 70 por ciento del fertilizante aplicado. La propuesta es calcular una dosis por metro cuadrado a partir del indice NDVI y de un factor de estres, con restricciones agronomicas (dosis maxima) y economicas (presupuesto total). Las cifras de impacto y las puntuaciones de "idea score 94.9/100" son autoatribuidas por el autor y no estan respaldadas por ningun benchmark ni validacion de campo publicada.

El artefacto tiene 0 descargas y 0 likes, no declara pipeline, idiomas ni licencia en los metadatos de HuggingFace, y su unica etiqueta es `region:us`. Cualquier evaluacion tecnica debe partir, por tanto, de la premisa de que se trata de una propuesta de codigo sin verificar y no de un modelo entrenado listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Stack de software Python con modulos `core/`, `vision/`, `navigation/`, `swarm/`, `api/` y `examples/` |
| Parametros totales | No disponible (no se publica checkpoint ni recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no hay modelo de lenguaje; la ventana de contexto no aplica) |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible en los metadatos; la model card esta redactada en ingles |
| Licencia | La model card declara MIT (Copyright (c) 2026 swordenkisk); los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | No disponible: no se publican pesos. El codigo se describe como paquete Python importable (`from drone_precision_ag import PrecisionFarm`) |
| Tipo de artefacto | Repositorio de codigo / propuesta de proyecto, etiquetado como modelo en el Hub |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas declaradas | `region:us` |
| Fecha de creacion (metadatos) | 2026-10-17T22:45:10Z |
| Fecha de actualizacion (metadatos) | 2026-03-06T21:28:36Z |
| Autor en HuggingFace | `swordenamine` (la card usa el alias `swordenkisk`) |

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento. El modulo `vision/stress_classifier.py` se describe como "ML crop stress classifier", pero la card no indica arquitectura, tamano, dataset, numero de tokens o imagenes, ni procedimiento de validacion. Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste supervisado, algo que no seria esperable en este tipo de artefacto pero que conviene dejar explicito: no existe evidencia de que el clasificador de estres haya sido entrenado con datos de campo publicados.

La parte algoritmica si esta descrita con formulas. El indice de vegetacion se calcula como `NDVI = (NIR - RED) / (NIR + RED)` con umbrales de segmentacion (<0,2 suelo desnudo; 0,2-0,4 cultivo estresado; 0,4-0,6 crecimiento moderado; >0,6 cultivo sano). La prescripcion sigue `dose(x,y) = D_base * (1 - NDVI(x,y)) * stress_factor(x,y) * soil_coef(x,y)`, sujeta a una cota agronomica (`0 <= dose <= D_max`), una cota economica (`suma de dosis <= presupuesto`) y anulacion de dosis en zonas sanas. La cobertura se reparte por descomposicion boustrophedon en franjas paralelas no solapadas, con protocolo de relevo cuando la bateria baja del 20 por ciento, y la evitacion de colisiones usa ORCA con esferas de separacion de 3 m.

Las innovaciones que reclama la card (bucle de retroalimentacion federado de rendimiento, registro en oraculo descentralizado) aparecen en el diagrama y en la hoja de ruta, pero no hay codigo, resultados ni metricas publicadas que las respalden. La propia hoja de ruta marca la integracion real con MAVLink (ArduPilot/PX4) como pendiente para la v1.1, lo que implica que la v1.0 no vuela.

## Capacidades

- Calculo de indices multiespectrales NDVI, NDRE y NDWI a partir de imagenes de camara multiespectral, con resolucion declarada de 5 cm por pixel.
- Segmentacion del campo en zonas de estres y generacion de mapas de prescripcion de dosis variable por metro cuadrado, con restricciones de dosis maxima y de presupuesto.
- Clasificacion de estres del cultivo mediante un modulo ML cuyo modelo subyacente no se especifica ni se publica.
- Ortorrectificacion y ensamblado de imagenes (orthomosaic) para construir el mapa del campo.
- Planificacion de trayectorias de cobertura completa (boustrophedon) y ejecucion de waypoints via MAVLink, segun la card (integracion real pendiente en la hoja de ruta v1.1).
- Evitacion de colisiones multi-drone mediante ORCA con esferas de separacion de 3 m y computo de obstaculos de velocidad en tiempo real.
- Coordinacion de flota: asignacion de franjas sin solapamiento, gestion de bateria con retorno a carga por debajo del 20 por ciento y protocolo de relevo de franja entre drones.
- Registro de eventos de pulverizacion en un oraculo descentralizado compatible con Chainlink, con hash de transaccion devuelto por la API (`mission.oracle_tx_hash`).
- API REST de gestion de campos y panel de progreso de pulverizacion en tiempo real.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, audio, tool calling ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- Abonado de tasa variable en explotaciones de secano: el sistema escanea el campo con camara multiespectral, genera un mapa NDVI y aplica dosis distintas por zona con boquillas de caudal variable. Es adecuado porque la logica de prescripcion ya incorpora cotas agronomicas y economicas, aunque requiere calibrar `D_base` y `soil_coef` con analiticas de suelo locales antes de aplicar nada.
- Cartografiado de estres hidrico y nutricional: uso de NDWI y NDRE para separar zonas con deficit hidrico de zonas con deficit de nitrogeno, de modo que el agricultor no fertirrigue donde el problema es agua. Util como herramienta de diagnosis antes de decidir tratamiento.
- Trazabilidad de aplicaciones para auditoria y certificacion: el registro de cada evento de pulverizacion en un oraculo con hash verificable permite reconstruir que se aplico, donde y cuando, lo que encaja con requisitos de cuaderno de campo digital y con cadenas de suministro que exigen evidencia de buenas practicas.
- Prototipo docente y de investigacion en robotica agricola: la separacion modular (`path_planner`, `collision_avoidance`, `battery_manager`) lo hace util como esqueleto para practicas de planificacion de cobertura y swarm en laboratorio, sustituyendo el dron por un simulador.
- Planificacion de campana para cooperativas: la API REST y el panel de progreso permiten agrupar parcelas, priorizar las mas estresadas y estimar el volumen total de fertilizante antes de comprar, comparando el total prescrito contra el escenario uniforme (`rx_map.uniform_litres` frente a `rx_map.total_litres`).
- Estimacion de ahorro como argumento de venta tecnica: el calculo de `savings_pct` entre dosis uniforme y dosis variable sirve para dimensionar el retorno de la inversion en flota antes de adquirir hardware, siempre que se valide con datos reales de la parcela y no con los porcentajes genericos de la card.
- Integracion en un pipeline de agricultura de precision existente: al exponer una API REST y un logger de eventos, podria conectarse a un SIG o a un ERP agricola para volcar mapas de prescripcion en formato de maquina usada por el tractor o por el dron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye insignias con puntuaciones ("idea score 94.9/100", novedad 92/100, viabilidad 94/100, impacto 99/100), pero son valoraciones autoatribuidas por el autor, sin metodologia descrita ni datos de validacion, y no deben interpretarse como resultados de evaluacion. Tampoco hay metricas de ahorro real de fertilizante, de precision del clasificador de estres, de error de posicionamiento, de cobertura efectiva ni de tiempo de mision medidos en campo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No hay pesos ni modelo que cargar en GPU; el coste depende del clasificador de estres, que no se especifica.
- GPU recomendadas: no disponible. Para el calculo de indices y el ensamblado de ortomosaicos, el cuello de botella tipico es memoria RAM y ancho de banda de disco mas que GPU; para el clasificador haria falta al menos una GPU de gama media si se ejecuta a bordo, pero no hay dato publicado.
- Compatibilidad con GPU de consumo: no verificable sin conocer el clasificador. El procesamiento geometrico y de indices es viable en CPU.
- Hardware de vuelo implicito en la propuesta: autopiloto compatible MAVLink (ArduPilot o PX4), computador de a bordo, camara multiespectral con bandas NIR/RED/red-edge y sistema de boquillas de caudal variable. Ningun modelo concreto de dron, camara o boquilla se especifica en la informacion disponible.
- Opciones de despliegue: paquete Python importable (`PrecisionFarm`), con API REST y dashboard propios. No aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de escaneo por hectarea, duracion de mision, caudal de pulverizacion ni autonomia por bateria.
- Almacenamiento: no disponible, aunque un ortomosaico a 5 cm/pixel sobre parcelas grandes implica volmenes de imagen relevantes que la card no cuantifica.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion, y el artefacto no es un modelo de machine learning, por lo que la comparacion por parametros, contexto o benchmarks no es aplicable. A modo de orientacion funcional, el solapamiento seria con herramientas de fotogrametria y agricultura de precision (generadores de ortomosaico de codigo abierto, plataformas comerciales de prescripcion variable y suites de analisis multiespectral), pero no se dispone en esta busqueda de datos verificados de parametros, licencia ni rendimiento de esas alternativas, por lo que no se incluye tabla comparativa con cifras.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, ni arquitectura de red, ni API de inferencia. El nombre y la ubicacion en HuggingFace pueden inducir a error a quien busque un modelo descargable.
- Ausencia total de validacion: 0 descargas, 0 likes, sin pipeline declarado, sin tests, sin CI y sin resultados de campo reportados.
- Metadatos incoherentes: la fecha de creacion (2026-10-17) es posterior a la de ultima actualizacion (2026-03-06), lo que sugiere edicion manual de los metadatos o un error de registro.
- Discrepancia de autoria: el repositorio figura a nombre de `swordenamine`, mientras que las insignias y el copyright usan `swordenkisk`; el enlace a GitHub que aparece en la card no se ha podido verificar.
- Licencia ambigua: la card declara MIT, pero los metadatos de HuggingFace no declaran licencia. Antes de un uso comercial hay que confirmar la licencia efectiva del codigo y de las dependencias.
- La v1.0 no incluye integracion MAVLink real segun la propia hoja de ruta, de modo que el ejemplo de inicio rapido no ejecuta vuelo fisico; tratarlo como pseudocodigo de referencia.
- Cifras sin fuente: el 50-70 por ciento de fertilizante desperdiciado, los 200.000 millones de USD anuales de coste y los 300.000 millones de USD de dano ambiental no van referenciados. Las estimaciones para Argelia (8,5 millones de hectareas, 40 por ciento de desperdicio, 200.000 toneladas anuales ahorradas, 120 millones de USD) tampoco.
- Riesgo agronomico: aplicar dosis calculadas por una formula no calibrada puede provocar infradosificacion en zonas productivas. Cualquier despliegue exige validacion por un ingeniero agronomo y contraste con analitica de suelo y datos de cosecha.
- El clasificador de estres no tiene ficha tecnica: se desconoce su accuracy, sus clases, su comportamiento ante condiciones de iluminacion adversas y su sesgo por tipo de cultivo o region. El riesgo de clasificacion erronea sustituye aqui al riesgo de alucinacion de un LLM.
- Dependencia de terceros no verificada: la compatibilidad con Chainlink y con MAVLink se afirma pero no se demuestra con codigo ni con pruebas.
- Marco regulatorio: el uso de drones para aplicaciones de fertilizantes o fitosanitarios esta sujeto a normativa aeronautica y de productos quimicos (en Espana, AESA y normativa europea EASA), a licencias de piloto y a limites de carga. Un registro en blockchain no sustituye la trazabilidad legal exigida.
- La busqueda web realizada no devolvio ningun resultado relacionado con el proyecto: los enlaces obtenidos pertenecen a un portal educativo frances y son irrelevantes, por lo que no hay fuentes externas que corroboren ninguna afirmacion de la card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/drone_precision_ag
- Repositorio GitHub citado en la model card (no verificado): https://github.com/swordenkisk/drone_precision_ag
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al proyecto, al paper ni a demos; los resultados devueltos (toutatice.fr) no guardan relacion con el artefacto.
