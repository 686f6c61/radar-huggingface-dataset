# yorklyb/demo_wing

## Resumen

El modelo `yorklyb/demo_wing` es una implementación del modelo de política π₀.₅ (Pi05) de Physical Intelligence, adaptada para la librería LeRobot de HuggingFace. π₀.₅ es un modelo Vision-Language-Action (VLA) diseñado para abordar el reto de la generalización en entornos abiertos: es capaz de ejecutar tareas robóticas en situaciones y escenarios que no fueron vistos durante el entrenamiento. El modelo se publica bajo licencia Apache-2.0 y cuenta con aproximadamente 4.140 millones de parámetros, con un tamaño de repositorio de 9,4 GB en formato safetensors.

El modelo es relevante porque representa un avance en la robótica de aprendizaje, ya que combina comprensión visual, procesamiento de lenguaje natural y control de acciones en un único sistema. La implementación en LeRobot permite a los desarrolladores entrenar y desplegar políticas de manipulación con herramientas estándar, facilitando la reproducción y evaluación de resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action), arquitectura interna no especificada |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una implementación de π₀.₅, un modelo VLA desarrollado por Physical Intelligence. No se han publicado detalles técnicos sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la model card. La implementación en LeRobot se adapta del repositorio abierto OpenPI de Physical Intelligence. El entrenamiento se realiza con la librería LeRobot, y el modelo se ha subido al Hub de HuggingFace con el dataset `demo_wing` como referencia. No se especifican datos sobre el volumen de datos de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO.

## Capacidades

- Control de acciones robóticas: el modelo genera comandos de acción para robots, basándose en observaciones visuales y entradas de lenguaje.
- Generalización a entornos nuevos: diseñado para operar en situaciones no vistas durante el entrenamiento, lo que permite su uso en escenarios de mundo abierto.
- Integración con LeRobot: permite entrenar, evaluar y desplegar políticas con la interfaz estándar de LeRobot (comandos `lerobot-train` y `lerobot-record`).
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes, ni capacidades de visión o audio más allá de las propias de un VLA.

## Casos de uso

- **Control de robots en entornos desconocidos**: el modelo puede generalizar a nuevas disposiciones de objetos, iluminación o superficies, lo que lo hace adecuado para tareas de manipulación en laboratorios o entornos domésticos.
- **Ejecución de tareas por instrucciones en lenguaje natural**: permite a un robot interpretar comandos como "coge la taza roja" y traducirlos a secuencias de acciones, gracias a su componente de lenguaje.
- **Investigación en robótica**: sirve como base para experimentos de aprendizaje por refuerzo, post-entrenamiento de políticas o evaluación de generalización en entornos simulados o reales.
- **Desarrollo de nuevas políticas**: los investigadores pueden usarlo como punto de partida para entrenar políticas específicas de manipulación con datasets propios, utilizando las herramientas de LeRobot.
- **Integración en sistemas de automatización**: puede desplegarse en robots con arquitecturas compatibles (por ejemplo, SO100) para tareas de picking, ensamblaje o clasificación.
- **Benchmarking de VLA**: se puede utilizar como referencia para comparar el rendimiento de otros modelos de política robótica en términos de generalización y precisión de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han proporcionado requisitos de hardware específicos en la documentación.
- Con 4,14 mil millones de parámetros, se estima que la inferencia requiere una GPU con al menos 8-10 GB de VRAM en cuantización FP16 (no confirmado).
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de robótica (como RT-1, Octo, OpenVLA, etc.) ni datos de rendimiento relativo.

## Limitaciones y advertencias

- **Datos de entrenamiento no especificados**: no se conoce la composición del dataset ni el volumen de datos, lo que dificulta evaluar posibles sesgos.
- **Generalización limitada**: aunque π₀₋₅ se diseñó para generalización en mundo abierto, no se han documentado casos de fallo ni límites concretos.
- **Idiomas**: no se especifica el soporte de idiomas; probablemente esté orientado a inglés, pero no hay confirmación.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de los modelos subyacentes (si los hay).
- **Riesgo de alucinación**: al ser un modelo de acción, podría generar acciones incorrectas en situaciones no vistas; no se han documentado medidas de seguridad.
- **Requiere infraestructura robótica**: el despliegue real requiere un robot físico o un simulador compatible con LeRobot (por ejemplo, SO100), no es un modelo de texto o imagen autónomo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yorklyb/demo_wing)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio OpenPI (referencia)](https://github.com/Physical-Intelligence/openpi) (no confirmado, pero se menciona en la model card)
- [Perfil del autor en HuggingFace](https://huggingface.co/yorklyb)
- [Perfil del autor en GitHub](https://github.com/yorklyb)
