# XXXXyu/oxygen-pi05-libero-next-lora

## Resumen

El modelo `oxygen-pi05-libero-next-lora` es un adaptador LoRA de rango 8 desarrollado por XXXXyu (Xiangyu Li) que se aplica exclusivamente al sufijo autoregresivo `Subtask:` del modelo base `pi05_libero` de la librería openpi. Este adaptador está diseñado para la generación de instrucciones de siguiente paso (lenguaje) en tareas de robótica, concretamente en el entorno LIBERO, y se integra dentro del flujo de un modelo de visión-lenguaje-acción (VLA). El checkpoint base está congelado; el adaptador solo modifica la generación del sufijo de texto, mientras que la rama de acción permanece inalterada.

La relevancia de este adaptador radica en su eficiencia: permite ajustar la generación de sub-objetivos en lenguaje sin reentrenar el modelo completo, con un coste de entrenamiento de solo 2.000 pasos y un rango LoRA de 8. Esto es especialmente útil para equipos que trabajan con robots manipuladores en entornos simulados y necesitan un control fino sobre la generación de instrucciones intermedias. La licencia combina Apache 2.0 para los componentes de OxyGen y los términos de Gemma para los componentes derivados del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre modelo VLA pi0.5 (checkpoint `pi05_libero`) |
| Parametros totales | No disponible (adaptador de rango 8; el modelo base no se detalla) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se aplica en el checkpoint base, sin cuantización especificada) |
| Idiomas soportados | No disponible (probablemente instrucciones en inglés, pero no se especifica) |
| Licencia | Apache 2.0 y términos de Gemma (apache-2.0-and-gemma-terms) |
| Formato de pesos | No disponible (se carga mediante la librería openpi, formato interno) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 que se activa solo en el sufijo autoregresivo `Subsequent:` dentro del modelo pi0.5. El checkpoint base `pi05_libero` procesa la observación, el estado y la instrucción de la tarea una vez, y el adaptador modifica la generación del texto siguiente sin afectar al tensor de acción (diferencia de acción con ruido fijo igual a 0). Esto implica que la rama de acción queda intacta y el adaptador se limita a la parte de lenguaje.

El entrenamiento se realizó con una tasa de aprendizaje de 3e-4 durante 2.000 pasos, usando supervisión derivada de predicados (`language.next`) sobre datos del entorno LIBERO. La validación alcanza un 97.79% de precisión de token, un 88.75% de coincidencia exacta (greedy exact match) y un 90.82% de F1 a nivel de palabra. El adaptador se almacena con un hash SHA256 para verificar integridad.

## Capacidades

- Generación de texto autoregresivo para el sufijo `Subsequent` en tareas de robótica.
- Integración con el modelo VLA pi0.5 para la predicción de acciones, aunque el adaptador no modifica la salida de acción.
- Entrenamiento eficiente: solo 2.000 pasos con rango LoRA 8, lo que reduce el coste computacional.
- Compatible con la librería openpi para carga y uso en pipelines de robótica.
- Sin soporte de tool calling, ni funciones adicionales más allá de la generación de lenguaje.
- Capacidades multilingües no documentadas.

## Casos de uso

- **Planificación de tareas en robótica doméstica**: el modelo puede generar sub-objetivos en lenguaje natural (p. ej., "abre la puerta", "coge el objeto") a partir de una instrucción global, ayudando a descomponer tareas complejas.
- **Simulación de entornos LIBERO**: se puede integrar en pipelines de entrenamiento por refuerzo que requieren instrucciones intermedias, mejorando la interpretabilidad de las acciones del robot.
- **Investigación en adaptadores VLA**: sirve como ejemplo de cómo ajustar solo la parte lingüística de un modelo VLA sin alterar la rama de acción, útil para estudios de eficiencia y modularidad.
- **Generación de datos sintéticos**: se puede usar para producir anotaciones de lenguaje para nuevas tareas, a partir de la observación y el estado, como se hizo en el dataset `libero-visual-memory-annotations`.
- **Evaluación de modelos de lenguaje en robótica**: permite comparar la calidad de la generación de instrucciones con otras métricas (exact match, F1) en el contexto de LIBERO.
- **Despliegue en sistemas de control robótico**: al ser un adaptador ligero, se puede integrar en pipelines de inferencia sin aumentar significativamente la latencia, siempre que el modelo base esté disponible.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Validación token accuracy | 97.79% |
| Greedy exact match | 88.75% |
| Word F1 | 90.82% |
| Fixed-noise action tensor difference | 0 |

No se han publicado comparaciones con otros adaptadores o modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí no requiere recursos significativos, pero la inferencia depende del modelo base `pi05_libero` (un VLA de tamaño considerable, probablemente en el rango de miles de millones de parámetros, aunque no se especifica).
- No se dispone de datos sobre VRAM mínima ni GPUs recomendadas. Según las prácticas habituales de openpi, se necesitan GPUs con alta capacidad de memoria (A100, H100) para ejecutar el modelo base, pero este dato no está confirmado.
- Opciones de despliegue: se puede usar con la librería openpi para inferencia; no se mencionan vLLM, llama.cpp u otros frameworks.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores LoRA para LIBERO o modelos VLA similares. El único dato es que el adaptador se basa en el checkpoint `pi05_libero` de openpi, pero no hay métricas de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo afecta al sufijo `Subsequent`; no modifica la generación de acciones, por lo que no se puede usar para ajustar el comportamiento motor del robot.
- Los datos de entrenamiento provienen de LIBERO, un entorno simulado; puede no generalizar a tareas reales o a otras distribuciones.
- La licencia combina términos de Apache 2.0 y de Gemma; es necesario revisar los términos de Gemma para uso comercial.
- Riesgo de alucinación en la generación de lenguaje, como es común en modelos autoregresivos, especialmente con instrucciones ambiguas.
- No se documenta el idioma de las instrucciones; se asume inglés, pero no se garantiza.
- El adaptador es experimental y no tiene descargas ni usos registrados (0 descargas, 0 likes), por lo que su madurez es limitada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/XXXXyu/oxygen-pi05-libero-next-lora)
- [Dataset de anotaciones](https://huggingface.co/datasets/XXXXyu/libero-visual-memory-annotations)
- [Página personal del autor](https://xxxxyu.github.io/)
- [OpenPI - librería open source de modelos VLA](https://www.openpi.net/english.html)
- [Checkpoint base pi05_libero en HuggingFace](https://huggingface.co/lerobot/pi05_libero_base)
- [Finetuning v044 del mismo modelo](https://huggingface.co/lerobot/pi05_libero_finetuned_v044)
