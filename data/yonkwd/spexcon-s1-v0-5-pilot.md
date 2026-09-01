# YONKWd/Spexcon-S1-v0.5-Pilot

## Resumen

Spexcon S1 v0.5 Pilot es un adaptador LoRA experimental desarrollado por YONKWd, diseñado para ajustar el modelo base Qwen/Qwen3-1.7B con el objetivo de mejorar su comportamiento conversacional en inglés, reducir fugas de rol/plantilla, minimizar repeticiones y lograr una identidad de asistente más consistente. No se trata de un modelo completo, sino de un adaptador PEFT (Parameter-Efficient Fine-Tuning) que debe cargarse sobre el modelo base. Este piloto forma parte del proyecto Spexcon S1 y se presenta como una versión preliminar, no apta para producción, pero suficiente para sustituir a la versión v0.3 en entornos de prueba como Modal. Su relevancia radica en demostrar un enfoque de ajuste ligero sobre un modelo pequeño (1.7B) con un dataset reducido (1000 ejemplos), lo que lo convierte en un caso de estudio para fine-tuning eficiente en recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-1.7B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0.2 GB en disco, pero no se especifica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (el adaptador puede usarse con el modelo base cuantizado, pero no se indica ningún formato específico) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (entrenado con QLoRA) que se superpone al modelo base Qwen/Qwen3-1.7B. El entrenamiento se realizó sobre el dataset HuggingFaceH4/ultrachat_200k, utilizando 1000 ejemplos de entrenamiento y 100 de evaluación. La pérdida inicial fue de 2.492, la final de 1.231 y la pérdida de evaluación final de 1.223. El entrenamiento se ejecutó en una GPU Tesla T4. No se proporcionan detalles adicionales sobre la configuración del adaptador (rango, alpha, dropout) ni sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.). El objetivo declarado es lograr un comportamiento más limpio en inglés, con menos fugas de rol/plantilla, menos repetición y una parada más consistente, manteniendo la identidad Spexcon.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Mantenimiento de una identidad de asistente consistente (Spexcon) durante la conversación.
- Reducción de repeticiones y mejor comportamiento de parada en comparación con versiones anteriores (v0.3).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un adaptador ligero, puede integrarse en entornos de desarrollo para probar interacciones conversacionales sin necesidad de un modelo grande.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo de ajuste con QLoRA sobre un modelo pequeño con un dataset reducido, útil para estudiar el impacto de la cantidad de datos y la pérdida en el comportamiento final.
- Pruebas de integración en plataformas de despliegue como Modal: el autor indica que es suficiente para reemplazar la v0.3 en ese entorno, lo que permite validar pipelines de inferencia.
- Experimentación con adaptadores PEFT: los desarrolladores pueden cargar el adaptador sobre Qwen3-1.7B y modificarlo o combinarlo con otros adaptadores para explorar comportamientos específicos.
- Evaluación de calidad conversacional en inglés: permite comparar métricas de fluidez, coherencia y adherencia a la identidad frente al modelo base sin ajuste.
- Base para fine-tuning adicional: al ser un adaptador, puede servir como punto de partida para entrenamientos posteriores con más datos o dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU Tesla T4 (16 GB VRAM), lo que indica que la inferencia es factible en GPUs de gama media o incluso en CPU con cuantización, aunque no se especifican requisitos exactos.
- Al ser un adaptador sobre un modelo de 1.7B, la VRAM necesaria para inferencia es baja (estimación razonable de 4-6 GB con cuantización, pero no confirmada).
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` en Python, o exportar a formatos como GGUF para ejecución con llama.cpp u Ollama, aunque no se documenta explícitamente.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros adaptadores o modelos de tamaño similar en la información proporcionada. El único punto de referencia es el modelo base Qwen/Qwen3-1.7B, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- Modelo experimental y piloto: no debe tratarse como un modelo de producción; puede contener errores, comportamientos inconsistentes o alucinaciones.
- Entrenado con solo 1000 ejemplos, lo que limita su generalización y puede provocar sobreajuste al dataset de entrenamiento.
- Limitado al idioma inglés; no se ha evaluado su rendimiento en otros idiomas.
- No se documentan sesgos específicos, pero al derivar de un modelo base y un dataset de chat, puede heredar sesgos presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial, pero el dataset ultrachat_200k tiene licencia MIT, por lo que no hay restricciones adicionales conocidas.
- No se garantiza la estabilidad del adaptador en contextos largos o tareas complejas; se recomienda validar en escenarios reales antes de cualquier uso.

## Enlaces

- [HuggingFace - YONKWd/Spexcon-S1-v0.5-Pilot](https://huggingface.co/YONKWd/Spexcon-S1-v0.5-Pilot)
- [Proyecto fuente: YONKWd/Spexcon-S1](https://huggingface.co/YONKWd/Spexcon-S1) (no se proporciona URL directa, pero se menciona en la model card)
- [Dataset: HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
