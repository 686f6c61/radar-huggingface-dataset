# Tamanenishiki/record_0806_pi05_pos_full_v3

## Resumen

El modelo `Tamanenishiki/record_0806_pi05_pos_full_v3` es un checkpoint de robótica basado en π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. El autor, Tamanenishiki, ha entrenado esta variante sobre un conjunto de datos propio (`Tamanenishiki/record_0618_pi05_pos_full`) para tareas de manipulación robótica, publicando el resultado bajo licencia Apache 2.0.

π₀.₅ es una evolución de π₀ que aborda el problema de la generalización en entornos abiertos: mientras que los VLA tradicionales funcionan bien en entornos controlados, π₀.₅ está diseñado para transferir conocimientos a escenarios nunca vistos durante el entrenamiento. La arquitectura combina un modelo de lenguaje y visión (VLM) con un "experto de acción" que genera comandos motores mediante flow matching. El checkpoint concreto aquí presentado contiene 4.143.404.816 parámetros en formato safetensors, ocupando 9,4 GB en el repositorio.

Este modelo es relevante porque demuestra la viabilidad de entrenar políticas robóticas de código abierto con herramientas accesibles como LeRobot, permitiendo a investigadores y desarrolladores reproducir experimentos de manipulación con generalización cero-shot. Su licencia permisiva y la integración con el ecosistema LeRobot lo convierten en una opción práctica para proyectos de robótica que requieren un punto de partida preentrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en π₀.₅, con VLM (PaliGemma) y experto de acciones con flow matching |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el VLM subyacente tiene contexto limitado, pero no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (solo se publica safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo está orientado a robótica, no a procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción que combina un VLM preentrenado (basado en PaliGemma) con un "experto de acciones" que predice comandos motores mediante flow matching, una técnica de modelado generativo que permite generar trayectorias continuas. La arquitectura completa fue descrita por Physical Intelligence en su blog y en el paper arXiv (2504.16054), donde se detalla el co-entrenamiento sobre datos heterogéneos: demostraciones robóticas, datos web y subtareas semánticas, lo que le permite generalizar a nuevos entornos y objetos.

El checkpoint subido a Hugging Face corresponde a un entrenamiento específico realizado con LeRobot sobre el dataset `Tamanenishiki/record_0618_pi05_pos_full`. La model card indica que se puede entrenar desde cero con el comando `lerobot-train` y evaluar con `lerobot-record`, siguiendo el flujo estándar de LeRobot. No se especifica el número de tokens de entrenamiento ni el dataset exacto más allá del nombre, pero el enfoque es el de aprendizaje por imitación a partir de teleoperación.

## Capacidades

- Control de manipulación robótica: el modelo genera comandos motores (posiciones de articulaciones) a partir de imágenes y lenguaje.
- Generalización a entornos nuevos: gracias al co-entrenamiento heterogéneo, puede ejecutar tareas no vistas durante el entrenamiento (open-world generalization).
- Ejecución de tareas de largo horizonte: planifica y ejecuta secuencias de acciones complejas (por ejemplo, recoger y colocar objetos).
- Integración con LeRobot: compatible con robots SO-100 y otros brazos soportados por el framework, con pipelines de entrenamiento y evaluación estandarizados.
- No incluye capacidades de texto o tool calling: es un modelo puramente de control moto, no un asistente de lenguaje.

## Casos de uso

- **Manipulación en robótica de investigación**: el modelo se puede cargar en un robot SO-1000 u otros brazos compatibles con LeRobot para ejecutar tareas de pick-and-place, apilado o ensamblaje en entornos de laboratorio.
- **Generalización a objetos nuevos**: al estar entrenado con datos heterogéneos, puede manejar objetos no vistos en el entrenamiento, útil para pruebas de robustez en entornos no estructurados.
- **Aprendizaje por imitación en entornos controlados**: como checkpoint preentrenado, sirve para fine-tuning con un dataset propio de demostraciones, reduciendo el tiempo de entrenamiento en tareas específicas.
- **Evaluación de algoritmos de control**: se puede usar como baseline en papers de robótica para comparar con otros VLA (π0, OpenVLA, RT-2).
- **Desarrollo de robots de asistencia**: en entornos de investigación, se puede integrar en sistemas de asistencia en el hogar (recoger objetos, abrir cajones) con supervisión humana.
- **Pruebas de robustez en entornos cambiantes**: el modelo está diseñado para generalizar a condiciones nuevas, por lo que es adecuado para probar la capacidad de adaptación de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint concreto. El paper de π₀.₅ (arXiv:2504.16054) reporta métricas de éxito en tareas de manipulación en entornos reales y simulados, con mejoras significativas sobre π₀ en generalización, pero esos datos no son directamente aplicables a este fine-tuning específico, ya que depende del dataset de entrenamiento y del entorno de evaluación.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 4,1B parámetros en precisión completa (fp32), lo que requiere al menos 16 GB de VRAM para inferencia en fp32, aunque se recomienda usar fp16 o bf16 para reducir a ~8-10 GB.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB) o superior, A100 (40 GB), H100 (80 GB) para entrenamiento o inferencia con margen.
- **Compatibilidad con GPUs de consumo**: sí, una RTX 3090 o RTX 4090 es suficiente para inferencia en fp16; el entrenamiento completo puede requerir más VRAM.
- **Opciones de despliegue**: LeRobot (oficial), y potencialmente vLLM o llama.cpp para inferencia de VLM, pero el flujo recomendado es el de LeRobot (`lerobot-record` para evaluación).
- **Latencia**: no disponible; la latencia depende del robot y del hardware, pero para control en tiempo real se requiere inferencia en menos de 10 ms por paso, lo que puede ser viable en GPUs modernas con batching de 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| π₀.₅ (este checkpoint) | 4,1B | no disponible | Apache 2.0 | VLA, generalización open-world |
| π₀ (Physical Intelligence) | ~3,3B | no disponible | Propietario (pero OpenPI es open source) | VLA, base de π₀.₅ |
| OpenVLA | 7B | 32K (VLM) | MIT | VLA, control generalista |
| RT-2 (Google) | 55B | 32K | Propietario | VLA, web-scale |

Nota: π₀.₅ es una evolución de π₀ con mejor generalización; OpenVLA es una alternativa open source con más parámetros pero menos generalización en entornos nuevos.

## Limitaciones y advertencias

- **Dependencia del dataset**: el rendimiento está limitado por la calidad y diversidad de las demostraciones de `Tamanenishiki/record_0618_pi05_pos_full`, que no está documentado en detalle.
- **Sesgos en la manipulación**: si el dataset no incluye diversidad de objetos, colores o condiciones de iluminación, el modelo puede fallar en entornos con características diferentes.
- **Alucinación de acciones**: como todo modelo generativo, puede predecir trayectorias inválidas o físicamente imposibles, especialmente en situaciones fuera de distribución.
- **Contexto limitado**: al ser un modelo de control, no puede procesar instrucciones de texto libre; la entrada es solo imagen y estado del robot.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo subyacente π₀.₅ tiene una licencia propia (Physical Intelligence) que puede tener restricciones adicionales; se debe verificar la compatibilidad.
- **No es un modelo de lenguaje**: no se puede usar para tareas de NLP o generación de texto.

## Enlaces

- [HuggingFace: Tamanenishiki/record_0806_pi05_pos_full_v3](https://huggingface.co/Tamanenishiki/record_0806_pi05_pos_full_v3)
- [Paper π₀.₅ (arXiv)](https://arxiv.org/pdf/2504.16054)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
