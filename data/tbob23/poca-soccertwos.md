# TBob23/poca-SoccerTwos

## Resumen

`TBob23/poca-SoccerTwos` es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para el entorno competitivo **SoccerTwos** (fútbol 2 contra 2). No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones del entorno (sensores de percepción, posición de balón y estado propio, según la configuración del entorno) a acciones de control de un jugador. Lo publica el usuario de Hugging Face TBob23 y el repositorio ocupa 0,1 GB, con pesos en formato `.nn` y `.onnx`.

El problema que resuelve es acotado pero representativo: aprender una política de comportamiento en un escenario multiagente cooperativo-competitivo, donde dos agentes del mismo equipo deben coordinarse para empujar el balón al goal contrario. El prefijo `poca` corresponde al entrenador POCA disponible en ML-Agents; la model card no detalla hiperparámetros, número de pasos de entrenamiento ni arquitectura exacta de la red.

Su relevancia es práctica como **baseline reproducible y material didáctico**: sirve para comparar entrenadores (PPO frente a POCA), para reanudar entrenamiento con `mlagents-learn --resume` y para demostraciones en navegador mediante el visor de agentes de Hugging Face. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria de su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada con Unity ML-Agents (entrenador POCA); número de capas y unidades no disponible |
| Parámetros totales | no disponible (no se documenta el tamaño de la red) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: agente de RL sin ventana de contexto; la dimensionalidad del vector de observación no se documenta) |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | `.nn` (Unity Barracuda) y `.onnx`; el tag `tensorboard` sugiere que el repo incluye registros de entrenamiento |
| Entorno | SoccerTwos (ML-Agents), partidos 2 contra 2 |
| Librería | `ml-agents` |
| Pipeline declarado | `reinforcement-learning` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

El agente se entrena con el flujo estándar de ML-Agents: un *trainer* (en este caso POCA, del que la model card solo aporta el nombre) optimiza una política neuronal mediante gradientes de política sobre recompensas proporcionadas por el entorno SoccerTwos. El escenario es multiagente y de suma cero por equipos, de modo que el entrenamiento típico combina self-play con una recompensa basada en goles y en el control del balón. La model card no indica el número de pasos, el tamaño de la red, la configuración de sensores ni si se usaron observaciones visuales o solo vectoriales; tampoco documenta el uso de recompensas intrínsecas, currículo o herramientas de imitación.

No hay dataset de tokens ni fases de RLHF o DPO: el "entrenamiento" consiste en interacción simulada. La innovación técnica reseñable es precisamente el uso del entrenador POCA de ML-Agents en lugar del PPO por defecto, junto con la exportación a ONNX para su ejecución en tiempo real. Cualquier detalle adicional sobre hiperparámetros, número de entornos en paralelo o composición de los equipos de self-play debe considerarse no disponible en la información publicada.

## Capacidades

- Control de política en el entorno SoccerTwos: convierte observaciones del entorno en acciones de movimiento y control del balón.
- Entrenamiento reanudable: el repositorio está preparado para continuar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume`.
- Exportación e inferencia en runtime: pesos `.nn` para Barracuda y `.onnx` para ejecución vía ONNX Runtime o Sentis.
- Visualización de partidas: el agente puede ejecutarse en el visor de agentes de Hugging Face (organización `unity`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificación simbólica.
- No tiene capacidades multilingües.
- No se documenta modo *thinking*, visión general, audio ni procesamiento de documentos.

## Casos de uso

- **Baseline para experimentos de self-play 2v2**: sirve como punto de partida para medir la mejora de un entrenamiento propio con PPO o POCA bajo el mismo entorno y presupuesto de pasos.
- **Continuación de entrenamiento (fine-tuning con `--resume`)**: permite partir de una política ya entrenada en lugar de inicializar aleatoriamente, útil cuando se ajusta la recompensa o se añaden sensores al agente.
- **Docencia de aprendizaje por refuerzo**: encaja en cursos y talleres que usan ML-Agents, ya que el flujo de carga del `.onnx` y visualización en navegador está documentado por Hugging Face.
- **Ablación de entrenadores**: comparar POCA frente a PPO manteniendo el entorno fijo para aislar el efecto del optimizador sobre la estabilidad del entrenamiento.
- **Torneos internos de evaluación**: enfrentar esta política contra variantes propias (`Roberto/poca-SoccerTwos`, `chisboiz111/poca-SoccerTwos-v2`) para medir robustez frente a estilos de juego distintos.
- **Demos web interactivas**: desplegar el `.onnx` con Barracuda o Sentis en una build de Unity/WebGL para mostrar comportamiento multiagente sin infraestructura de servidor.
- **Generación de trayectorias para imitación**: grabar episodios ejecutados por el agente como datos de comportamiento para *behaviour cloning* o *offline RL*, siempre que se respete la licencia (hoy no declarada).
- **Pruebas de pipelines de exportación**: validar el circuito entrenamiento → `.onnx` → runtime como test de integración en un equipo que adopte ML-Agents.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa acumulada, Elo de self-play, tasa de victorias ni curvas de entrenamiento, pese a que el tag `tensorboard` sugiere la existencia de registros en el repositorio. Tampoco se documenta la versión de ML-Agents ni la del editor de Unity empleadas, lo que impide comparar resultados de forma fiable.

## Requisitos de hardware

- **VRAM para inferencia**: no disponible de forma oficial. Por la naturaleza del entorno y el tamaño del repositorio (0,1 GB), la política es una red pequeña que cabe holgadamente en cualquier GPU consumer; la inferencia también es viable en CPU.
- **GPU recomendadas para inferencia**: GTX 1660 / RTX 3060 en adelante; innecesario recurrir a A100 o H100 para ejecutar la política.
- **GPU para reentrenar**: se recomienda RTX 4090, RTX 3090, A100 o H100 si se ejecutan muchas instancias del entorno en paralelo; ML-Agents escala con el número de áreas de entrenamiento simuladas.
- **CPU**: suficiente para inferencia y para demos en navegador; un entrenamiento prolongado en CPU es inviable.
- **Opciones de despliegue**: Unity Barracuda o Sentis (`.nn` / `.onnx`), ONNX Runtime, y `mlagents-learn` para entrenamiento o reanudación. No aplica vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Entorno | Entrenador | Formato | Licencia | Descargas | Notas |
|---|---|---|---|---|---|---|
| `TBob23/poca-SoccerTwos` | SoccerTwos | poca | `.nn`, `.onnx` | no disponible | 0 | Objeto de esta ficha |
| `Roberto/poca-SoccerTwos` | SoccerTwos | poca | no disponible en la búsqueda | no disponible | no disponible | Mismo entorno y entrenador, autor distinto |
| `chisboiz111/poca-SoccerTwos-v2` | SoccerTwos | poca | no disponible en la búsqueda | no disponible | no disponible | Variante "v2" sin documentación de cambios |
| Ejemplo SoccerTwos de ML-Agents | SoccerTwos | PPO (por defecto) | `.nn`, `.onnx` | licencia del proyecto ML-Agents | no aplica | Referencia oficial del entorno |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a entorno, entrenador y disponibilidad.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no puede asumirse permiso de uso comercial ni de redistribución; hay que contactar con el autor antes de integrarlo en un producto.
- **Especificidad total al entorno**: la política solo es válida para SoccerTwos con la configuración de observaciones y acciones con la que se entrenó; no generaliza a otros escenarios.
- **Reproducibilidad nula**: faltan hiperparámetros, número de pasos, versión de ML-Agents y de Unity, y criterios de evaluación.
- **Sesgo de self-play**: la política puede estar sobreajustada a sus propios oponentes históricos y degradarse frente a estrategias distintas o frente a cambios en la física del entorno.
- **Comportamiento emergente no auditado**: en entornos competitivos son frecuentes las conductas de explotación de recompensa; no hay análisis publicado de este agente.
- **Alucinación**: no aplica al no ser un modelo generativo de lenguaje; el riesgo equivalente es la fragilidad de la política ante distribuciones de observación no vistas.
- **Metadatos llamativos**: el repositorio figura creado y actualizado en 2026-10-24, con 0 descargas y 0 likes; conviene verificar la integridad de los archivos antes de usarlo como referencia.
- **Sin validación comunitaria**: al no tener descargas ni valoraciones, no existe evidencia externa de que la política entrene o juegue correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBob23/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face (organización Unity): https://huggingface.co/unity
- Variante de otro autor: https://huggingface.co/Roberto/poca-SoccerTwos
- Variante v2: https://huggingface.co/chisboiz111/poca-SoccerTwos-v2
- Ficha espejo en AIBase: https://model.aibase.com/models/details/1915692709983182850
- Ficha espejo en BimAnt: https://zoo.bimant.com/model/135384
