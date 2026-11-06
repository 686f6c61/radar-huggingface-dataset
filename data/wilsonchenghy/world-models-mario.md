# wilsonchenghy/world-models-mario

## Resumen

`world-models-mario` es una implementación desde cero en PyTorch del modelo del mundo Dreamer 4 (Hafner, Yan y Lillicrap, 2025), entrenada sobre los niveles 1-1 a 1-4 de Super Mario Bros. No es un agente ni un modelo de lenguaje: es un modelo del mundo que, dados 8 fotogramas reales y una secuencia de pulsaciones de botones, predice los fotogramas siguientes. Lo publica wilsonchenghy como material de investigación reproducible, con pesos y código separados.

El interés técnico reside en su escala reducida (un tokenizador de 12,4 M de parámetros y un modelo de dinámica de 37,5 M) frente a los world models habituales, lo que permite ejecutarlo en hardware modesto y estudiar el pipeline completo de Dreamer 4 sin infraestructura industrial. El repositorio ocupa 0,2 GB y se distribuye con licencia de solo uso investigador.

La relevancia actual es doble: por un lado, sirve como referencia educativa para entender la arquitectura de Dreamer 4 (tokenizador latente más dinámica con EMA); por otro, permite experimentar con planificación en el espacio latente y con la generación de trayectorias contrafactuales en un entorno de control discreto bien conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo Dreamer 4 (tokenizador + modelo de dinamica con EMA) |
| Parametros totales | 49,9 M (12,4 M tokenizador + 37,5 M dinamica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 fotogramas reales de entrada (ventana de condicionamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin capacidades linguisticas) |
| Licencia | research-use (other) |
| Formato de pesos | safetensors (`tokenizer.safetensors`, `dynamics.safetensors`) |

## Arquitectura y entrenamiento

La implementación sigue el diseño de Dreamer 4: un tokenizador que comprime fotogramas RGB de 120x128 en representaciones latentes discretas y un modelo de dinámica que, condicionado por las acciones, predice la evolución de esos latentes. El tokenizador tiene 12,4 M de parámetros y se entrenó durante 40.000 pasos; el modelo de dinámica tiene 37,5 M de parámetros, se entrenó 148.000 pasos y se publica con pesos EMA (media móvil exponencial), lo que suaviza el entrenamiento y mejora la estabilidad de las predicciones.

El entrenamiento se limita a los niveles 1-1 a 1-4 de Super Mario Bros, con pares de fotogramas y pulsaciones de botones. El autor incluye `sample_1-1.npz` con una partida de 458 fotogramas y sus acciones, correspondiente a una ejecución que el modelo nunca vio durante el entrenamiento, lo que permite evaluar la generalización dentro del mismo nivel. No se documentan en la información disponible detalles sobre el volumen total de datos, la composición exacta del dataset ni el uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de vídeo condicionada por acciones: genera fotogramas futuros a partir de 8 fotogramas reales y una secuencia de pulsaciones.
- Simulación de dinámicas de juego: reproduce la física y la estética de los niveles 1-1 a 1-4 de Super Mario Bros.
- Generación de trayectorias contrafactuales: al variar las acciones de entrada se obtienen futuros alternativos coherentes con el estado inicial.
- Representación latente reutilizable: el tokenizador puede emplearse por separado para codificar fotogramas en latentes.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades distintas de la visual.

## Casos de uso

- Investigación en world models: reproducir el pipeline de Dreamer 4 con pesos publicados y código abierto, útil para estudiar cómo se comporta la dinámica latente a escala pequeña.
- Aprendizaje por refuerzo basado en modelo: usar las predicciones del modelo como entorno simulado para entrenar políticas sin interactuar con el emulador real, reduciendo el coste de muestreo.
- Planificación en espacio latente: evaluar algoritmos de búsqueda o MPC (control predictivo por modelo) sobre las trayectorias imaginadas antes de ejecutar acciones reales.
- Docencia y divulgación: ejemplo completo y ligero (0,2 GB) para explicar tokenizadores, modelos de dinámica y EMA en cursos de aprendizaje profundo.
- Evaluación de generalización: comparar la partida de `sample_1-1.npz` (no vista en entrenamiento) con las predicciones del modelo para medir deriva y acumulación de error a lo largo de 458 pasos.
- Prototipado de videojuegos: generar secuencias de vídeo plausibles para previsualizar mecánicas o niveles antes de implementarlas en un motor real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en fp32 (49,9 M de parámetros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente. También funciona en CPU para pruebas puntuales.
- Cabe en GPU consumer: sí, en todas las tarjetas actuales (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el repositorio oficial (`wilsonchenghy/world-models`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| world-models-mario | 49,9 M | 8 fotogramas | research-use | Pesos en Hugging Face |
| Dreamer 4 (original, Hafner et al.) | no disponible | no disponible | no disponible | Paper; pesos no publicados en la información disponible |
| Otros world models para Atari (p. ej. DreamerV3) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo del mundo, no un agente: no toma decisiones ni juega por sí solo; requiere acciones externas como entrada.
- Entrenado exclusivamente en los niveles 1-1 a 1-4 de Super Mario Bros; no generaliza a otros niveles, juegos ni dominios visuales.
- Deriva acumulativa: al predecir muchos pasos hacia delante, los errores se amplifican y la calidad de los fotogramas decae.
- Sin capacidades lingüísticas ni multimodales más allá del vídeo.
- Licencia de solo uso investigador (`research-use`): no se permite uso comercial sin autorización expresa del autor.
- Aviso legal del autor: Super Mario Bros es propiedad de Nintendo; el proyecto no está afiliado ni respaldado por Nintendo.
- No se documentan sesgos específicos, pero al entrenarse en un único videojuego hereda sus sesgos visuales y de dinámica.
- Riesgo de alucinación visual: el modelo puede generar fotogramas plausibles pero incorrectos respecto a la física real del juego.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonchenghy/world-models-mario
- Repositorio de código: https://github.com/wilsonchenghy/world-models
- Paper Dreamer 4 (Hafner, Yan, Lillicrap 2025): https://arxiv.org/abs/2509.24527
