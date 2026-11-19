# tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-colab-trial-20261119

## Resumen

El modelo `tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-colab-trial-20261119` es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el robot de bajo coste SO-101, dentro del ecosistema LeRobot de Hugging Face. Lo desarrolla el usuario `tk206y` como parte de una serie experimental numerada (007, 008, 009, 010) orientada a estudiar la manipulación pick-and-place con distintas configuraciones de cámara y número de posiciones de inicio. El objetivo concreto de esta iteración es evaluar si la incorporación de una cámara de muñeca (wrist) junto a una cámara frontal mejora la precisión de agarre cuando el punto de partida del brazo varía entre nueve posiciones distintas dentro de un marco.

El modelo resuelve una tarea muy específica: localizar una pelota amarilla dentro de un marco, agarrarla y depositarla sobre una base negra fija. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de imitación (behavior cloning) que mapea observaciones visuales y propioceptivas a secuencias de acciones articulares. Su relevancia es fundamentalmente metodológica y de investigación reproducible en robótica de bajo coste, no de despliegue comercial.

El repositorio ocupa 2,5 GB, se distribuye en formato `safetensors` bajo licencia Apache 2.0 y fue publicado el 19 de noviembre de 2026. La model card está redactada en japonés y advierte explícitamente de que el modelo depende de una máquina, calibración, pose de home, disposición de cámaras y entorno de trabajo concretos, y que no ha sido validado en otros entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es una política de control, no un LM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para clonación de comportamiento que predice *chunks* de acciones (secuencias de posiciones articulares) a partir de observaciones visuales y de estado propioceptivo, en lugar de predecir una única acción por paso. Esto reduce el error de acumulación y permite un control más suave en tareas de manipulación. En esta iteración se emplean dos cámaras de entrada: una frontal (`front`) y otra en la muñeca (`wrist`), lo que aporta una vista relativa de la escena desde el efector final.

El entrenamiento se realizó durante 5.000 pasos con un tamaño de lote de 8, sobre un conjunto de 45 episodios de demostración teleoperada. La model card menciona que se comparan los checkpoints de 10.000 y 100.000 pasos de un entrenamiento previo (iteración 008) para estudiar el efecto de la cantidad de entrenamiento, pero no se documentan en el repositorio ni los hiperparámetros completos, ni la composición exacta del dataset, ni si hubo aumento de datos o regularización. El dataset de entrenamiento (`tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data`) está marcado como no público.

## Capacidades

- Ejecución de una tarea de pick-and-place: agarrar una pelota amarilla situada dentro de un marco y depositarla sobre una base negra fija.
- Percepción visual mediante dos cámaras simultáneas (frontal y de muñeca).
- Generalización limitada a nueve posiciones de inicio distintas del brazo dentro del marco.
- Control de las articulaciones del robot SO-101 a partir de observaciones visuales y propioceptivas.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- **Investigación en imitación robótica de bajo coste:** sirve como referencia reproducible para estudiar cómo afecta la incorporación de una cámara de muñeca a la precisión de agarre en tareas con múltiples posiciones de inicio, comparando con las iteraciones 007, 008 y 009 de la misma serie.
- **Docencia y formación en LeRobot:** el checkpoint y su model card permiten ilustrar el flujo completo de recogida de datos teleoperados, entrenamiento ACT y despliegue en un SO-101 real dentro de un laboratorio o aula.
- **Estudio del efecto del número de pasos de entrenamiento:** al existir checkpoints de 5.000, 10.000 y 100.000 pasos, permite analizar empíricamente la relación entre presupuesto de entrenamiento y calidad de la política en una tarea concreta.
- **Punto de partida para fine-tuning en tareas similares:** un equipo con un SO-101 y una configuración de cámaras equivalente puede reutilizar los pesos como inicialización y recoger sus propios episodios para adaptar la política a otra pieza u otro destino.
- **Validación de configuraciones de cámara:** el modelo permite comparar, junto con 009, el rendimiento de una configuración de dos cámaras frente a configuraciones de una sola cámara en la misma tarea.
- **Reproducción de experimentos de manipulación:** útil para grupos que replican la serie 007-010 y necesitan el checkpoint exacto de la iteración 010 como referencia de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "記録なし" (sin registro) en las secciones de resultados y de discusión, y remite a un documento `experiment.md` que no forma parte de la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible con precisión; el repositorio pesa 2,5 GB, por lo que un checkpoint ACT de este tamaño cabe holgadamente en GPUs de consumo con 8 GB o más.
- **GPU recomendadas:** no especificadas por el autor. Por el tamaño del modelo, una RTX 3060/4060 o superior debería ser suficiente para inferencia; para entrenamiento con lotes pequeños, una RTX 3090/4090 o una A100 ofrecen margen.
- **¿Cabe en GPU de consumo?** Sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM, dado el tamaño del checkpoint.
- **Opciones de despliegue:** el ecosistema LeRobot (librería `lerobot`), que soporta carga de políticas ACT y ejecución sobre el robot SO-101. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. Dependen del hardware, de la frecuencia de control del SO-101 y de la configuración de cámaras, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Cámaras | Episodios / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-010 (este) | ACT | front + wrist | 45 episodios / 5.000 pasos | Apache 2.0 | Público en HF |
| so101-009 (serie del mismo autor) | ACT | 2 cámaras, configuración fija | no disponible en esta ficha | Apache 2.0 (presumible) | Referenciado en la model card |
| so101-008 (serie del mismo autor) | ACT | no disponible | 9 posiciones / 100.000 pasos | Apache 2.0 (presumible) | Referenciado en la model card |
| ACT original (Zhao et al.) | ACT | variable | ALOHA | no disponible | Paper y código públicos |

La comparación con modelos de lenguaje o de propósito general no aplica: se trata de una política de control específica de un robot y una tarea. Las alternativas reales son las otras iteraciones de la misma serie y la implementación de referencia de ACT, cuyos datos completos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia total del entorno:** el autor advierte que el modelo depende de una máquina, calibración, pose de home, disposición de cámaras y entorno de trabajo concretos, y que no ha sido validado en otros entornos.
- **No es un modelo de propósito general:** no debe aplicarse tal cual a otro robot ni a otra tarea; requiere recogida de datos y reentrenamiento.
- **Dataset no público:** el conjunto de entrenamiento (`...-data`) está marcado como no público, lo que limita la reproducibilidad completa del experimento.
- **Resultados no documentados:** la model card no incluye métricas de éxito, tasas de agarre ni comparaciones cuantitativas con las iteraciones previas.
- **Sesgos y alucinaciones:** no aplica el concepto de alucinación de un LM; el riesgo equivalente es la ejecución de acciones incorrectas (fallos de agarre, colisiones) ante observaciones fuera de distribución.
- **Restricciones de licencia:** Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías y el modelo no está pensado para producción.
- **Caveat para producción:** no debe desplegarse en un entorno real sin validación exhaustiva, medidas de seguridad física y supervisión humana.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-colab-trial-20261119)
- Dataset de entrenamiento (no público): `tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data`
- Documento de experimento referenciado en la model card: `experiment.md` (no incluido en la información proporcionada)
- LeRobot (librería): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- SO-101 (robot): no disponible en la información proporcionada
