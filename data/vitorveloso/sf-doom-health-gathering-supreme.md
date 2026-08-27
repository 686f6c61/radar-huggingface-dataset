# vitorveloso/sf-doom-health-gathering-supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) para resolver el escenario `health_gathering_supreme` del entorno ViZDoom. El autor, vitorveloso, ha publicado el agente en HuggingFace utilizando la librería Sample-Factory, un framework especializado en entrenamiento de agentes RL a gran escala. El objetivo del escenario es que el agente aprenda a recolectar paquetes de salud en un mapa de Doom mientras evita el daño, maximizando la recompensa acumulada.

La relevancia de este modelo radica en que demuestra la aplicación de algoritmos RL modernos a entornos de juego parcialmente observables, un campo de investigación activo en IA. Aunque no se proporcionan detalles sobre la arquitectura interna de la red neuronal, el agente ha sido evaluado con una recompensa media de 20.00 ± 2.50 en el entorno, lo que indica un rendimiento razonable en la tarea. Es un ejemplo de cómo Sample-Factory permite entrenar agentes de forma eficiente y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (red neuronal no especificada, probablemente convolucional para procesar imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entorno de juego con observaciones por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de Sample-Factory) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo APPO, una variante asíncrona de Proximal Policy Optimization (PPO) que combina las ventajas de la actualización de políticas con la eficiencia de la ejecución paralela en múltiples entornos. Sample-Factory implementa APPO con buffers de experiencia distribuidos y actualizaciones de red en lotes, lo que permite escalar a entornos complejos como ViZDoom. La entrada al agente son frames del juego (imágenes RGB) y posiblemente variables de estado adicionales, procesadas por una red neuronal convolucional típica en este tipo de tareas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que se trata de un agente RL puro. El entrenamiento se realizó en el escenario `doom_health_gathering_supreme`, que consiste en un mapa con pasillos donde aparecen paquetes de salud de forma aleatoria; el agente debe recolectarlos mientras evita el daño ambiental. La recompensa se otorga por cada paquete recogido y se penaliza el daño recibido.

## Capacidades

- Generación de acciones de movimiento y rotación en el entorno ViZDoom (discretas o continuas, según la configuración).
- Percepción visual a partir de frames del juego, con capacidad de detectar objetos (paquetes de salud) y navegar por el mapa.
- Aprendizaje de políticas de exploración y explotación para maximizar la recompensa acumulada.
- Funcionamiento en tiempo real durante la inferencia, adecuado para simulación o integración en entornos de juego.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural, al ser un modelo puramente de RL para un entorno específico.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el rendimiento de APPO en entornos parcialmente observables, comparando con otros algoritmos como PPO, DQN o IMPALA.
- Benchmarking de algoritmos RL: el modelo puede utilizarse como referencia para evaluar nuevas variantes de algoritmos o técnicas de regularización en el mismo escenario.
- Desarrollo de agentes para juegos: aunque el escenario es simple, el enfoque puede extenderse a otros entornos de ViZDoom o juegos similares, sirviendo como base para transferencia de políticas.
- Educación en RL: el modelo y su código de entrenamiento (disponible en Sample-Factory) pueden usarse en cursos para ilustrar el entrenamiento de agentes con políticas asíncronas.
- Pruebas de integración de librerías: al ser un modelo pequeño y ligero, es útil para verificar que la infraestructura de inferencia (por ejemplo, carga de checkpoints) funciona correctamente.
- Reproducibilidad de experimentos: dado que se publica el checkpoint, otros investigadores pueden reproducir los resultados y comparar métricas en el mismo entorno.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el agente APPO en el entorno `doom_health_gathering_supreme`:

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 20.00 ± 2.50 |

No se han publicado resultados comparativos con otros agentes en el mismo entorno dentro de la información disponible. La recompensa media de 20.00 sugiere que el agente recolecta una cantidad significativa de paquetes de salud, aunque el valor máximo posible depende de la configuración del escenario (duración del episodio, número de paquetes generados).

## Requisitos de hardware

- Inferencia: al ser un agente RL que procesa frames de imagen, la carga computacional es baja. Puede ejecutarse en CPU para pruebas, aunque una GPU modesta (por ejemplo, NVIDIA GTX 1050 o superior) aceleraría la inferencia si se procesan muchos episodios en paralelo.
- VRAM estimada: no disponible, pero al ser una red pequeña (típicamente menos de 10 millones de parámetros en estos agentes), la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU.
- Opciones de despliegue: el checkpoint se carga con Sample-Factory, que incluye utilidades para evaluación e inferencia. También puede exportarse a formatos estándar (ONNX) si se desea integrar en otros frameworks.
- Latencia y throughput: no se proporcionan datos, pero en una GPU moderna se esperan cientos de inferencias por segundo, dado el pequeño tamaño de la red.

## Comparativa con modelos similares

No se dispone de información sobre otros agentes entrenados para el mismo escenario con métricas comparables. Existen otros modelos en HuggingFace con el mismo entorno (por ejemplo, `Vivek-huggingface/rl_course_vizdoom_health_gathering_supreme`), pero no se han publicado sus resultados de recompensa. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

| Modelo | Algoritmo | Entorno | Recompensa media |
|---|---|---|---|
| vitorveloso/sf-doom-health-gathering-supreme | APPO | doom_health_gathering_supreme | 20.00 ± 2.50 |
| Vivek-huggingface/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el escenario `health_gathering_supreme` de ViZDoom; no es transferible a otros entornos sin reentrenamiento.
- No se han documentado sesgos específicos, pero al ser un agente RL, su comportamiento depende de la semilla de entrenamiento y la configuración del entorno; puede presentar variabilidad en episodios individuales.
- Riesgo de sobreajuste al escenario concreto: el agente puede explotar atajos o patrones específicos del mapa que no generalizan a variaciones del mismo.
- La licencia no está especificada, por lo que se recomienda contactar con el autor antes de usar el modelo en aplicaciones comerciales o derivadas.
- No se proporcionan detalles sobre la arquitectura exacta de la red, el número de parámetros ni el proceso de entrenamiento (número de pasos, hiperparámetros), lo que limita la reproducibilidad completa.
- El modelo no tiene capacidades de lenguaje, visión general ni razonamiento simbólico; su única función es generar acciones de juego.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vitorveloso/sf-doom-health-gathering-supreme
- Repositorio de Sample-Factory (librería utilizada): https://github.com/alex-petrenko/sample-factory (enlace inferido, no verificado en la búsqueda)
- Escenario `health_gathering_supreme` de ViZDoom: https://github.com/Farama-Foundation/ViZDoom/blob/main/scenarios/health_gathering_supreme.cfg
- Otro agente similar en HuggingFace: https://huggingface.co/Vivek-huggingface/rl_course_vizdoom_health_gathering_supreme
