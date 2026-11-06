# suvadityamuk/microduck-duck-worlds-policies

## Resumen

Microduck Duck Worlds Policies es una colección de seis políticas de locomoción para el robot bípedo Microduck de Pollen Robotics, publicadas por el usuario suvadityamuk. Cada política se ha ajustado con PPO dentro de un mundo simulado distinto generado como script de Blender por el modelo Kimi-K3, y todas parten del caminar desplegado por Pollen (`velstand.onnx`) manteniendo su contrato exacto de entrada y salida, de modo que actúan como reemplazo directo.

El modelo resuelve un problema concreto de robótica de simulación: adaptar una política de marcha ya existente a condiciones de entorno no vistas (fricción, gravedad, colisiones) sin rediseñar el controlador. La relevancia es metodológica: demuestra un flujo de trabajo reproducible en el que un modelo de lenguaje genera entornos de entrenamiento y un pipeline de reinforcement learning los convierte en políticas ejecutables en ONNX.

La arquitectura de la política no está detallada en la información disponible; se sabe que consume un vector de observación de 61 dimensiones a 50 Hz y produce 14 offsets de posición articular, lo que corresponde a un controlador de posición para las 14 articulaciones del bípedo. El repositorio ocupa 0.0 GB y no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con PPO; red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 61 dimensiones a 50 Hz) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un archivo por mundo) |

## Arquitectura y entrenamiento

Cada política es una red de control entrenada con PPO mediante la librería `rsl_rl` en el entorno `mjlab`, usando la receta `microduck_rl` de Pollen Robotics (commit `b02fdea`). El entrenamiento sustituye el suelo plano por los colisionadores, la gravedad y la fricción superficial del mundo correspondiente. Se simulan 4096 robots en paralelo, con 24 pasos por iteración y 1500 iteraciones sobre una única A100. La mitad de los robots reproduce rutas planificadas por la sala como comandos en bucle abierto y la otra mitad camina por el suelo libre con los comandos aleatorios de la receta.

El ajuste parte de `velstand.onnx` con el normalizador de observaciones congelado, aplica un calentamiento del crítico de 40 iteraciones con el actor congelado y después entrena con tasa de aprendizaje 2e-4. El peso de la recompensa de seguimiento de velocidad de guiñada es 3.0 y la desviación estándar del kernel es 0.32. La selección de checkpoint exige que la política gire correctamente en ambos sentidos en una prueba de giro y, después, gana el mejor éxito de tarea sobre semillas separadas.

## Capacidades

- Locomoción bípeda controlada por comandos de velocidad: las tres primeras componentes del vector de comando son velocidad frontal, lateral y de guiñada.
- Control de posición articular: emite 14 offsets de posición respecto a la pose por defecto, enviados a los servos como objetivos de posición.
- Adaptación a condiciones de entorno específicas: cada archivo está entrenado para un mundo concreto con su gravedad, fricción y colisiones.
- Entrada con normalizador de observaciones integrado, lo que simplifica el despliegue.
- Compatibilidad directa con el contrato de `velstand.onnx`, sin cambios en el código de integración.
- Ejecución en inferencia ONNX, apta para entornos de simulación.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modalidades de visión o audio.

## Casos de uso

- Sustitución directa del caminar de fábrica en simulación: al conservar la interfaz de `velstand.onnx`, se puede intercambiar el archivo en un pipeline existente de mjlab o MuJoCo para evaluar el comportamiento en un entorno concreto sin tocar el código de control.
- Evaluación de robustez frente a fricción: la política del mundo de fábrica de chocolate o del lago helado permite medir cómo se degrada el éxito de tarea con superficies de baja fricción, útil para estudios comparativos de simulación a realidad.
- Estudio de locomoción en gravedad reducida: la política del módulo orbital con 1.62 m/s² sirve para analizar el comportamiento del bípedo en condiciones lunares antes de diseñar controladores para misiones espaciales simuladas.
- Navegación en entornos con obstáculos: las políticas de mina abandonada y pasillo de hospital permiten probar el seguimiento de rutas planificadas con colisionadores reales en la escena.
- Generación automática de entornos de entrenamiento: el flujo Kimi-K3 más Blender más PPO se puede reutilizar como plantilla para producir políticas específicas de escena a partir de descripciones en lenguaje natural.
- Docencia e investigación en reinforcement learning: el repositorio de código y el dataset de mundos permiten reproducir el entrenamiento completo con 4096 robots en paralelo en una A100.
- Pruebas de regresión de controladores: comparar el caminar de fábrica con el ajustado al mundo sobre las mismas semillas y el mismo planificador cuantifica la ganancia real de cada adaptación.

## Benchmarks y rendimiento

Las tasas son el éxito medio de tarea sobre 20 episodios retenidos por tarea en cada mundo, con un planificador que da los mismos comandos a ambos caminantes y con iluminación, materiales, cámara, fricción y voltaje de servo aleatorizados.

| Mundo | Checkpoint seleccionado | Caminar de fábrica | Entrenado en el mundo |
|---|---|---:|---:|
| Fábrica de chocolate con chocolate fundido | iteración 100 | 0.14 | 0.23 |
| Pasillo de hospital con zonas de suelo mojado | iteración 100 | 0.19 | 0.26 |
| Módulo orbital de baja gravedad (1.62 m/s²) | iteración 100 | 0.49 | 0.54 |
| Pista de circo con suelo de serrín y un tigre | iteración 300 | 0.55 | 0.59 |
| Mina abandonada con vías y escombros | iteración 100 | 0.98 | 1.00 |
| Aldea de pesca en lago helado | iteración 600 | 0.00 | 0.01 |

Las ganancias en la mina y en el lago helado quedan dentro del ruido. Algunas tareas empeoran con el ajuste: atracar la carga en el hábitat baja de 0.95 a 0.45 y el gran desfile en el circo cae de 0.50 a 0.05.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y los archivos son políticas de control de pequeña dimensión, por lo que la huella esperada es mínima.
- GPU recomendadas: no se especifican para inferencia. El entrenamiento documentado se realizó en una única A100.
- GPU de consumo: por el tamaño del repositorio, es previsible que quepa en cualquier GPU de consumo, aunque no se confirma en la información disponible.
- Opciones de despliegue: runtime de ONNX (ONNX Runtime) y el simulador mjlab o MuJoCo para la ejecución del robot simulado.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms), que es el requisito temporal del bucle de control; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suvadityamuk/microduck-duck-worlds-policies | Políticas de marcha para Microduck (6 variantes) | 61-D a 50 Hz / 14 offsets articulares | PPO en mjlab, ajuste desde `velstand.onnx` | Apache-2.0 | Hugging Face, ONNX |
| pollen-robotics/microduck-policies | Políticas base de Pollen Robotics, incluida `velstand.onnx` | Mismo contrato 61-D / 14 offsets | Receta `microduck_rl` de Pollen | no disponible en la información | Hugging Face |
| Otras políticas bípedas de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulación: ninguna de las seis políticas se ha ejecutado en un robot físico.
- Cada política está pensada exclusivamente para su propio mundo; no son intercambiables entre escenarios.
- Algunas tareas empeoran respecto al caminar de fábrica, con caídas notables en el hábitat (0.95 a 0.45) y en el circo (0.50 a 0.05).
- Las mejoras en la mina y en el lago helado están dentro del ruido estadístico y no deben interpretarse como ganancias reales.
- El éxito en el lago helado es prácticamente nulo (0.01), lo que indica que el entorno supera la capacidad de la política.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.
- Licencia Apache-2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso; conviene verificar la licencia de la política base de Pollen Robotics antes de un despliegue comercial.
- El repositorio no registra descargas ni likes, por lo que no existe validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suvadityamuk/microduck-duck-worlds-policies
- Modelo base: https://huggingface.co/pollen-robotics/microduck-policies
- Dataset de mundos construidos: https://huggingface.co/datasets/suvadityamuk/microduck-duck-worlds
- Modelo generador de los mundos: https://huggingface.co/moonshotai/Kimi-K3
- Pollen Robotics: https://pollen-robotics.com/
- Repositorio de código, mundos y resultados (Duck Worlds): no disponible en la información proporcionada
