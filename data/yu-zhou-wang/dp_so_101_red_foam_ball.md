# Yu-Zhou-Wang/dp_so_101_red_foam_ball

## Resumen

El modelo `Yu-Zhou-Wang/dp_so_101_red_foam_ball` es una política de control robótico basada en **Diffusion Policy**, entrenada con la librería **LeRobot** sobre el dataset `Jingyi-Z/sotac` (episodios 0-20). La tarea específica consiste en **recoger una bola de espuma roja y colocarla en un contenedor**, ejecutada por un robot seguidor SO-101 con 6 articulaciones. El modelo fue desarrollado por Yuzhou Wang y está publicado bajo licencia Apache 2.0.

Se trata de un modelo de imitación entrenado desde cero, utilizando un backbone ResNet18 (preentrenado en ImageNet) con un encoder por cámara. No se emplea información táctil. El checkpoint publicado corresponde a 100.000 pasos de entrenamiento con un batch de 8. Con aproximadamente 278 millones de parámetros, es un modelo compacto orientado a tareas de manipulación en entornos controlados, relevante para la comunidad de robótica open source por su integración directa con LeRobot y su capacidad de ejecución en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (ResNet18 backbone, encoder por cámara) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una **Diffusion Policy**, un enfoque generativo que modela la distribución de acciones condicionada a observaciones. La arquitectura utiliza un backbone ResNet18 preentrenado en ImageNet, con un encoder independiente para cada cámara (superior y de muñeca, ambas a 640×480). El horizonte de observación es de 2 pasos, el horizonte de acción de 32 pasos y el horizonte total de 64. El entrenamiento se realizó desde cero sobre los episodios 0-20 del dataset `sotac`, con 100.000 pasos y batch de 8. No se emplea RLHF ni DPO; es un entrenamiento supervisado de imitación. No se documentan innovaciones técnicas adicionales más allá de la configuración estándar de LeRobot.

## Capacidades

- **Control robótico de manipulación**: ejecuta la tarea de recoger un objeto (bola de espuma roja) y depositarlo en un contenedor.
- **Percepción visual multi-cámara**: procesa simultáneamente imágenes de cámara superior y de muñeca.
- **Generación de acciones suaves**: al ser un modelo de difusión, produce trayectorias de acción más suaves y robustas que métodos de regresión directa.
- **Integración con LeRobot**: compatible con el ecosistema LeRobot para grabación, evaluación y despliegue en robots reales.
- **Sin capacidades de lenguaje**: no genera texto, código ni razonamiento simbólico.

## Casos de uso

- **Manipulación robótica en entornos de laboratorio**: el modelo puede integrarse en un brazo SO-101 para tareas de pick-and-place de objetos pequeños, como la bola de espuma roja, en configuraciones de investigación.
- **Evaluación de políticas de imitación**: sirve como punto de partida para comparar Diffusion Policy con otros métodos (ACT, VQ-BeT) en la misma tarea y dataset.
- **Prototipado rápido con LeRobot**: al estar publicado en Hugging Face, permite cargar la política con `from_pretrained` y desplegarla en un robot real con pocas líneas de código, útil para pruebas de concepto.
- **Estudio de generalización visual**: al usar dos cámaras, puede analizarse cómo afecta la variación de iluminación, fondo o posición de la cámara al rendimiento.
- **Entrenamiento incremental**: el checkpoint de 100.000 pasos puede usarse como inicialización para fine-tuning en tareas similares con menos datos.
- **Investigación en difusión para control**: el modelo es un ejemplo reproducible de Diffusion Policy aplicada a un robot de bajo coste, útil para estudiar hiperparámetros (horizonte, pasos de difusión, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas cuantitativas de éxito en la tarea, ni comparaciones con otros modelos en el mismo dataset.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Dado el tamaño del modelo (~278M parámetros) y la entrada de dos imágenes 640×480, se estima que la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones oficiales).
- **GPU recomendadas**: una GPU consumer como RTX 3060 (12 GB) o superior sería suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda al menos 16 GB de VRAM (RTX 4080, A100, etc.).
- **Compatibilidad con consumer GPU**: sí, probablemente cabe en GPUs de gama media, pero no hay datos confirmados.
- **Opciones de despliegue**: el modelo se integra con LeRobot, que soporta ejecución en robots reales. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (no aplica a modelos de control).
- **Latencia y throughput**: no disponibles. Al ser un modelo de difusión, la inferencia requiere múltiples pasos de denoising, lo que aumenta la latencia respecto a métodos de una sola pasada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada (misma tarea, mismo robot o misma arquitectura) con datos públicos de rendimiento.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para la tarea de recoger la bola roja y colocarla en el contenedor. No generaliza a otros objetos o configuraciones sin reentrenamiento.
- **Dependencia del dataset**: el entrenamiento se realizó sobre solo 20 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno.
- **Sin soporte de lenguaje**: no puede interpretar instrucciones verbales ni generar explicaciones.
- **Riesgo de alucinación**: no aplica en el sentido de modelos de lenguaje, pero puede producir acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe atribuir al autor y mantener el aviso de licencia.
- **Caveat de producción**: para uso en entornos reales, se recomienda validar la seguridad del robot y añadir mecanismos de supervisión, ya que el modelo no incluye detección de colisiones ni lógica de emergencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yu-Zhou-Wang/dp_so_101_red_foam_ball)
- [Dataset sotac](https://huggingface.co/datasets/Jingyi-Z/sotac)
- [Perfil del autor en Hugging Face](https://huggingface.co/Yu-Zhou-Wang)
