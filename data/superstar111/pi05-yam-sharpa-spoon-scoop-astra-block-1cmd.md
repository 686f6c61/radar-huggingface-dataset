# Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd

## Resumen

π0.5-yam-sharpa-spoon-scoop-astra-block-1cmd es una política de visión-lenguaje-acción (VLA) derivada de π0.5, el modelo base de Physical Intelligence, y ajustada mediante la librería openpi por el usuario Superstar111. El modelo está especializado en una única tarea robótica: coger una cuchara de bambú y servir judías (beans) con ella, sobre un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. La política recibe una sola instrucción para todo el episodio: "pick up the spoon and scoop the beans".

El interés técnico reside en su origen: los 300 episodios de entrenamiento no fueron teleoperados por humanos, sino generados por un controlador escrito por un agente de programación (Astra) tras 100 rollouts de ajuste, lo que lo convierte en un ejemplo de destilación de controlador simbólico a política neuronal. Todo el entrenamiento se realizó en simulación con Isaac Lab y el modelo no se ha ejecutado todavía en el robot real; la evaluación en simulación seguía en curso en el momento de publicar la model card.

El repositorio ocupa 12,4 GB e incluye los pesos EMA en el paso 5999, las estadísticas de normalización y un bundle de servicio con test de respuesta conocida que validó con un error de 0,0025 rad frente a una tolerancia de 0,005 rad. No tiene descargas ni likes, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, ajuste completo del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de la tarea esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card (repo de 12,4 GB con `checkpoint/params/` y bundle de servicio) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo (full fine-tune) del base π0.5 dentro del framework openpi, con la configuración `pi05_maggie_2skill_hcw_nojit`. El entrenamiento se ejecutó durante 6000 pasos con batch de 32, schedule coseno con learning rate pico de 5e-5, EMA de 0,999 y semilla 43; los pesos publicados son los EMA del paso 5999. La política consume tres vistas renderizadas en simulación: cámara de cabeza, cámara de muñeca y cámara lateral (cam1).

Los datos de entrenamiento son 300 episodios generados por un controlador escrito por el agente de programación Astra, en su versión tras 100 rollouts de ajuste. Cada episodio cumple criterios estrictos de agarre: agarre de potencia cerrado sobre el mango con el pulgar cerrándose sobre él en al menos el 80 % de los fotogramas de sujeción, entre 5 y 20 mm del extremo del mango libres más allá de la mano, la mano al menos 30 mm por encima de la mesa y al menos 10 mm de distancia del soporte. Los márgenes del profesor en los 300 episodios fueron: punto más bajo de la mano entre 35,4 y 48,9 mm sobre la mesa (media 36,7 mm), 11,6 a 13,4 mm de mango libre, al menos 41,8 mm respecto al soporte, agarre cerrado en al menos el 90 % de los fotogramas y entre 11 y 32 judías transportadas (media 20,7).

La escena incluye una variación por episodio: la cuchara se desplaza hasta 10 mm y gira hasta 20 grados sobre el reposacucharas, mientras que el soporte, la bandeja y el quemador con la olla se mueven hasta 20 mm y giran hasta 5 grados. El reposacucharas es una pila de 16 cubos de pino (151 x 75,5 x 75,5 mm) que eleva la cuchara 75,5 mm sobre el soporte desnudo. La base del brazo está 22 mm por encima de la mesa y el montaje de la cámara de muñeca es geométrico, no verificado en el rig real.

## Capacidades

- Ejecución de una política VLA de una sola instrucción para una cadena completa de manipulación: coger la cuchara y servir judías.
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, incluyendo agarre de potencia sobre un mango.
- Percepción multimodal con tres vistas simultáneas (cabeza, muñeca y lateral).
- Generalización limitada a variaciones de posición y orientación de los objetos dentro de los rangos de entrenamiento (hasta 10 mm y 20 grados para la cuchara; 20 mm y 5 grados para el resto de la escena).
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe ni modos de pensamiento; es una política de acción, no un asistente conversacional.

## Casos de uso

- Investigación en destilación de controladores: el modelo sirve como caso de estudio de cómo un controlador programático generado por un agente de código puede convertirse en política neuronal mediante 300 episodios sintéticos, útil para grupos que investigan aprendizaje por imitación sin teleoperación.
- Benchmark de manipulación en Isaac Lab: la escena está completamente parametrizada (pila de cubos, variaciones por episodio, tres cámaras), lo que permite reproducir experimentos de agarre y vertido en simulación antes de transferir a hardware.
- Prueba de integración de openpi: el bundle incluye `serve_vla.sh`, checksums de todos los ficheros y un test de respuesta conocida (`golden.py` con `golden.npz`), lo que facilita validar un pipeline de servicio VLA de extremo a extremo en un servidor nuevo.
- Evaluación de manos diestras: el uso de la Sharpa Wave de 28 articulaciones con un agarre de potencia cerrado y pulgar opositor lo hace adecuado para estudiar políticas de agarre fino en simulacion.
- Docencia y prototipado en robótica: un repositorio autocontenido con pesos, estadísticas de normalización y bundle de servicio permite a estudiantes montar un entorno de inferencia VLA sin acceso a un robot físico.
- Verificación de conversiones de montaje: la model card documenta explícitamente que se entrenó con el montaje de mano girado y que no debe aplicarse la conversión de la articulación 6 que requieren checkpoints anteriores, lo que lo convierte en referencia para depurar discrepancias de cinemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en simulación seguía en curso y que sería sustituida por una tarjeta completa con los resultados. El único dato de validación es el test de respuesta conocida del bundle, que coincidió dentro de 0,0025 rad con una tolerancia de 0,005 rad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos, pero no se especifica el tamaño del modelo ni la memoria requerida.
- GPU recomendadas: no disponible. Al tratarse de un ajuste de π0.5, es previsible que requiera GPU de datacenter, pero la model card no lo confirma.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el bundle incluye `serve_vla.sh` y el código fuente de openpi con su tokenizer; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a una política VLA de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5-yam-sharpa-spoon-scoop-astra-block-1cmd | no disponible | no disponible | Coger cuchara y servir judías (YAM Ultra 2 + Sharpa Wave) | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | Política VLA generalista | no disponible | Referenciado en openpi |
| Otras políticas openpi ajustadas | no disponible | no disponible | Tareas específicas por checkpoint | no disponible | Disponibles en el ecosistema openpi |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparación se limita a la especialización de la tarea y a la disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real, por lo que la brecha sim-a-real es desconocida.
- La evaluación en simulación no estaba terminada al publicarse la model card; no hay métricas de éxito publicadas.
- La política está sobreajustada a una única instrucción y una única escena; no se documenta generalización a otras tareas, objetos o instrucciones.
- El montaje de cámara de muñeca es geométrico y no está verificado en el rig real; la model card advierte de no aplicar la conversión de la articulación 6 de checkpoints anteriores.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo deriva de π0.5, cuyos términos de uso pueden imponer restricciones adicionales no reflejadas en el repositorio.
- Riesgo de alucinación de acciones no evaluado: al ser una política de control, los fallos se manifiestan como movimientos erróneos o agarres fallidos, no como texto incorrecto, y no hay datos sobre su frecuencia.
- Idiomas soportados no documentados; la instrucción de entrenamiento está en inglés.
- Sin descargas ni validación de la comunidad, lo que reduce la confianza en la reproducibilidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
