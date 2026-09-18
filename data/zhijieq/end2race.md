# zhijieq/End2Race

## Resumen

End2Race es una política neuronal end-to-end y un entorno de simulación para carreras autónomas multivehículo sobre la plataforma F1TENTH. Lo desarrolla el Michigan Traffic Lab (Zhijie Qiao, Haowei Li, Zhong Cao y Henry X. Liu) y se publica como un paquete de Python acompañado de pesos preentrenados en HuggingFace. El modelo mapea directamente lecturas de LiDAR 2D y velocidad del vehículo a comandos de dirección y velocidad a 40 Hz, sin etapas intermedias de percepción o planificación explícitas.

No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un controlador de robótica con 850.556 parámetros (datos reales de safetensors, aproximadamente 3,4 MB en fp32), lo que lo sitúa en el rango de un sistema embebido más que de un modelo de gran escala. Su relevancia actual radica en que combina una política recurrente entrenada con aprendizaje por refuerzo con un entorno Gymnasium listo para usar, lo que facilita reproducir experimentos de conducción autónoma y de maniobras de adelantamiento en circuitos reales modelados.

El repositorio de HuggingFace funciona como demo rápida: incluye una rueda instalable, ejemplos de código para prueba cronometrada individual y para carrera cabeza a cabeza, y soporte para cuatro trazados (Austin, Hockenheim, MoscowRaceway y Nuerburgring). El proyecto se distribuye bajo licencia Apache 2.0 y está vinculado al artículo arXiv 2509.16894.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política end-to-end para robótica (encoder de LiDAR + embedding de velocidad + estado recurrente GRU). La topología completa de capas no está detallada en la información disponible. |
| Parametros totales | 850.556 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. No es un modelo de lenguaje: mantiene estado recurrente GRU que se reinicia con `policy.reset()`. No se declara ventana de contexto |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible. No procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`), requiere `trust_remote_code=True` |
| Entrada | LiDAR `float32[1440]` (360°, alcance máximo 30 m) y velocidad `float32[1]` en m/s. Internamente el LiDAR se submuestrea a 180 haces |
| Salida | `float32[2]`: `[ángulo de dirección en radianes, velocidad deseada en m/s]`. Dirección recortada a [-0,4189, 0,4189] rad (±24°) |
| Frecuencia de control | 40 Hz |
| Entorno asociado | Gymnasium, tarea `End2Race-v0`; circuitos Austin, Hockenheim, MoscowRaceway y Nuerburgring |
| Librería | transformers (PyTorch) |
| Descargas / likes en HuggingFace | 3 descargas, 0 likes |

## Arquitectura y entrenamiento

End2Race se presenta como un marco de aprendizaje extremo a extremo para carreras multivehículo. La política consume directamente la observación del simulador: un escaneo LiDAR 2D de 1440 haces repartidos en 360° con alcance máximo de 30 m, la velocidad longitudinal y, de forma implícita, el estado recurrente del vehículo. En el método `act(observation)`, el LiDAR se submuestrea a 180 haces, la velocidad se proyecta mediante un embedding y la red produce el par de acciones de dirección y velocidad objetivo. El estado oculto es recurrente (GRU) y debe reiniciarse explícitamente antes de cada episodio mediante `policy.reset()`, lo que indica que el historial temporal forma parte de la toma de decisiones.

El entrenamiento se enmarca en aprendizaje por refuerzo sobre el entorno de simulación F1TENTH, según las etiquetas del repositorio (`reinforcement-learning`, `autonomous-racing`, `f1tenth`). El entorno admite dos modos: prueba cronometrada individual, terminada por colisión o por completar vueltas, y carrera cabeza a cabeza con un oponente que sigue una de tres líneas de carrera (interna, central o externa) a una velocidad escalada. Los resultados del episodio se resumen en `info["outcome"]` con los valores `overtake`, `follow` o `collision`. La información proporcionada no incluye el número de tokens o pasos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO, por lo que esos datos no están disponibles.

## Capacidades

- Control de conducción end-to-end: convierte LiDAR 2D y velocidad en ángulo de dirección y velocidad deseada a 40 Hz, sin módulos separados de percepción y planificación.
- Memoria temporal: incorpora un estado recurrente GRU que permite reaccionar de forma dependiente del historial dentro de un episodio.
- Prueba cronometrada individual: modo `single`, con terminación por colisión o por completar el número de vueltas configurado.
- Carrera cabeza a cabeza: modo `multi`, con maniobras de adelantamiento y seguimiento frente a un oponente parametrizable en línea de carrera, velocidad y distancia inicial.
- Soporte de cuatro circuitos: Austin, Hockenheim, MoscowRaceway y Nuerburgring.
- Compatibilidad con Gymnasium: se integra como tarea `End2Race-v0` con espacios de observación de tipo `Dict` y renderizado interactivo u headless.
- Métricas de episodio: expone resultado (`overtake`, `follow`, `finished`, `collision`), tiempos por vuelta y velocidad media en m/s.
- No dispone de tool calling, function calling, capacidades de agente basadas en texto, razonamiento simbólico, visión RGB, audio ni soporte multilingüe, ya que no es un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo para conducción autónoma: el entorno Gymnasium permite entrenar y evaluar políticas de control continuo con observaciones de LiDAR, con recompensas y condiciones de terminación ya definidas.
- Estudio de maniobras de adelantamiento: el modo `multi` con parámetros de línea de carrera del oponente (`raceline0`, `raceline1`, `raceline2`), escalado de velocidad y separación inicial permite reproducir escenarios de tráfico controlados y medir si la política opta por adelantar o seguir.
- Benchmark de pipelines percepción-control a 40 Hz: sirve como referencia de latencia para comparar arquitecturas end-to-end frente a aproximaciones modulares (percepción explícita más planificador).
- Docencia en robótica: el formato de instalación mediante rueda de Python y los ejemplos de código permiten montar prácticas de control autónomo y de simulación F1TENTH en pocas líneas.
- Generación de datos sintéticos de conducción: los episodios ejecutados con la política preentrenada producen trayectorias etiquetadas (tiempos por vuelta, resultado, velocidad media) reutilizables para imitación o para análisis de comportamiento.
- Evaluación de seguridad y robustez: el criterio de terminación por colisión y el modo headless facilitan ejecutar campañas automatizadas de episodios para estudiar tasas de fallo en distintas condiciones iniciales.
- Prototipado de transferencia sim-to-real en F1TENTH: la interfaz de observación y acción es la habitual de la plataforma, por lo que la política puede probarse como punto de partida en un banco físico, si bien no hay validación publicada de esa transferencia en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de HuggingFace no incluye tablas comparativas de métricas como tiempos por vuelta, tasas de colisión o comparaciones frente a planificadores clásicos; únicamente referencia el artículo arXiv 2509.16894, cuyo contenido no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 850.556 parámetros, el peso ocupa aproximadamente 3,4 MB en fp32 y 1,7 MB en fp16, más el estado oculto recurrente. No se requieren aceleradores dedicados.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; no hay indicios de que el modelo necesite A100, H100 ni tarjetas de gama alta. Una RTX 4090 o similar queda muy por encima de los requisitos reales.
- Cabida en GPU de consumo: sí, en cualquier GPU de consumo e incluso en iGPU integradas. También es viable la ejecución en CPU.
- CPU: es el escenario realista, ya que el bucle de control debe sostener 40 Hz (25 ms de presupuesto por ciclo) y tanto la codificación del LiDAR como la pasada por la red son de coste reducido.
- Opciones de despliegue: `AutoModel.from_pretrained` de transformers junto con el paquete `end2race` y Gymnasium, con `trust_remote_code=True`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no se publican cifras concretas en la información disponible. La única referencia temporal es la frecuencia de operación declarada de 40 Hz, que implica un presupuesto de 25 ms por ciclo incluyendo el paso del simulador.
- Almacenamiento: el tamaño del repositorio se indica como 0,0 GB, coherente con un paquete de pesos de pocos megabytes.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables con datos publicados de parámetros, contexto o rendimiento. End2Race pertenece a la categoría de políticas end-to-end para F1TENTH y carreras autónomas, donde las alternativas habituales son planificadores clásicos y controladores basados en línea de carrera (por ejemplo, seguimiento de raceline o control predictivo), pero no se aportan cifras verificables para establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| End2Race | 850.556 | No aplica (estado recurrente GRU) | No disponible | Apache 2.0 | Pesos en HuggingFace y entorno Gymnasium |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento verbal, tool calling, capacidades de agente y soporte multilingüe. Cualquier expectativa en ese sentido es incorrecta.
- Ámbito restringido: solo contempla observaciones de LiDAR 2D (hasta 30 m), velocidad y pose del vehículo. No procesa cámara RGB, radar ni mapas de alta definición.
- Dirección limitada: la acción de dirección se recorta a ±24° (0,4189 rad), lo que restringe la agilidad en curvas muy cerradas.
- Generalización limitada por el dominio de entrenamiento: los circuitos soportados son cuatro (Austin, Hockenheim, MoscowRaceway, Nuerburgring) y no hay datos sobre el comportamiento en trazados, superficies o dinámicas distintas.
- Transferencia al mundo real no validada: no se documenta en la información disponible ninguna verificación sim-to-real sobre un vehículo F1TENTH físico, con las diferencias de dinámica y ruido de sensores que ello implica.
- Estado del repositorio: 3 descargas y 0 likes, con la model card descrita como "quick demo". Se trata de un artefacto de investigación con escasa validación externa por parte de la comunidad.
- Ejecución de código personalizado: el uso de `trust_remote_code=True` implica ejecutar código del autor del repositorio, lo que supone un riesgo de seguridad que conviene auditar antes de desplegarlo en un entorno de producción.
- Sin datos de benchmarks en la información disponible: no se pueden contrastar tiempos por vuelta, tasas de colisión ni ventajas frente a controladores clásicos.
- Dependencia del entorno: el comportamiento depende de la implementación del simulador y de la plataforma F1TENTH, por lo que cambios en la física o en la frecuencia de simulación pueden degradar el rendimiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo de cambios. Al incluir pesos entrenados, conviene revisar la licencia de las dependencias del entorno de simulación por separado.
- Riesgo de alucinación: no aplica en el sentido habitual; el modo de fallo equivalente es una acción de control incorrecta que puede derivar en colisión, sin mecanismo de abstención ni estimación de incertidumbre documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhijieq/End2Race
- Artículo (arXiv): https://arxiv.org/abs/2509.16894
- Código y documentación completa: https://github.com/michigan-traffic-lab/End2Race
- Plataforma F1TENTH (roboracer.ai): https://roboracer.ai/
- Instalación de la rueda publicada: https://huggingface.co/zhijieq/End2Race/resolve/main/end2race-1.0.0rc2-py3-none-any.whl
- Cita BibTeX del proyecto: incluida en la model card del repositorio (Qiao, Li, Cao y Liu, 2025)
