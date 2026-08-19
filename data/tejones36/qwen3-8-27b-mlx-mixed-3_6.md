# tejones36/qwen3.8-27B-mlx-mixed-3_6

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo **Qwen/Qwen3.8-27B**, realizada por el usuario de HuggingFace `tejones36`. Se trata de una adaptación no oficial que emplea `mlx-vlm` para cuantizar los pesos con una receta de precisión mixta de 3 y 6 bits (group size 64), con el objetivo de reducir el consumo de memoria y permitir la ejecución en hardware Apple Silicon.

El modelo base, Qwen3.8-27B, es un sistema multimodal de tipo *image-text-to-text* (procesa imágenes y texto), aunque no se dispone de detalles técnicos sobre su arquitectura interna, datos de entrenamiento o capacidades específicas más allá de lo indicado en la etiqueta de pipeline. La relevancia de esta conversión radica en que facilita el despliegue de un modelo de gran tamaño en entornos con recursos limitados, especialmente en Macs con chips M-series, gracias al framework MLX.

Cabe señalar que el número de parámetros reportado en los safetensors (4.334.750.960) es notablemente inferior a lo que sugiere el nombre "27B", lo que podría indicar un error en la conversión o una métrica distinta. No se ha podido verificar esta discrepancia con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal *image-text-to-text*, basado en Qwen3.8-27B) |
| Parametros totales | 4.334.750.960 (según safetensors; el nombre sugiere 27B, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 3-bit y 6-bit, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base (Qwen3.8-27B) en la documentación de este repositorio. Se sabe que es un modelo multimodal que acepta imágenes y texto, y que la conversión se realizó con la herramienta `mlx-vlm`. No hay datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica destacable es la cuantización mixta 3/6-bit, que reduce el tamaño de los pesos a 14.8 GB en total, aunque se desconoce el impacto exacto en la calidad de las respuestas.

## Capacidades

- Procesamiento de imágenes y texto (pipeline `image-text-to-text`).
- Generación de descripciones de imágenes y conversación multimodal, según el ejemplo de uso de la model card.
- Compatibilidad con el ecosistema MLX y `mlx-vlm` para inferencia en Apple Silicon.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes.

## Casos de uso

- **Descripción de imágenes en Mac**: el modelo puede generar texto descriptivo a partir de una imagen, útil para aplicaciones de accesibilidad o catalogación de contenido visual, ejecutándose localmente con MLX.
- **Asistentes conversacionales multimodales**: al ser un modelo de tipo *image-text-to-text*, puede integrarse en chatbots que reciban capturas de pantalla o fotos como entrada, por ejemplo en soporte técnico o documentación visual.
- **Prototipado rápido en entornos Apple**: desarrolladores que trabajen con MLX pueden probar el modelo sin necesidad de GPUs dedicadas, gracias a la cuantización mixta que reduce los requisitos de memoria.
- **Investigación en visión-lenguaje**: sirve como punto de partida para experimentos con modelos cuantizados en tareas de VQA (visual question answering) o generación de leyendas, aunque sin benchmarks publicados no se puede evaluar su rendimiento.
- **Aplicaciones offline**: al ejecutarse localmente, permite procesar imágenes y texto sin conexión a internet, lo que es relevante para entornos con restricciones de privacidad o conectividad.
- **Educación y demostraciones**: puede utilizarse en talleres o cursos para ilustrar el despliegue de modelos multimodales en hardware de consumo, aprovechando la integración con `mlx-vlm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Plataforma**: requiere hardware Apple Silicon (M1, M2, M3 o M4) con macOS, ya que MLX está optimizado para estos chips.
- **Memoria**: el tamaño del repositorio es de 14.8 GB, por lo que se estima que se necesitan al menos 16 GB de RAM unificada para cargar el modelo en memoria, aunque no se ha confirmado el consumo exacto de VRAM.
- **GPU**: no aplica GPU dedicada; la inferencia se realiza en la GPU integrada del chip Apple.
- **Opciones de despliegue**: mediante `mlx-vlm` (CLI o API Python), tal como se muestra en la model card. No se mencionan otras herramientas como vLLM u Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B no está documentado en este repositorio, y no se conocen alternativas equivalentes en formato MLX con cuantización mixta 3/6-bit.

## Limitaciones y advertencias

- **Conversión no oficial**: el repositorio es una adaptación realizada por un usuario independiente, no por el equipo de Qwen. Puede contener errores de conversión o diferencias de comportamiento respecto al modelo original.
- **Cuantización agresiva**: la mezcla de 3 y 6 bits puede degradar significativamente la calidad de las respuestas, especialmente en tareas complejas como razonamiento o generación de código.
- **Discrepancia en parámetros**: el número de parámetros reportado en los safetensors (4.33B) no coincide con el nombre del modelo (27B), lo que sugiere un posible problema en la conversión o en la documentación.
- **Sin benchmarks**: no hay métricas publicadas que permitan evaluar el rendimiento real del modelo cuantizado.
- **Licencia**: aunque la licencia es Apache-2.0, el modelo base Qwen3.8-27B puede tener términos adicionales; se recomienda revisar la licencia original de Qwen antes de uso comercial.
- **Idiomas**: no se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés no está garantizado.

## Enlaces

- Repositorio HuggingFace: [tejones36/qwen3.8-27B-mlx-mixed-3_6](https://huggingface.co/tejones36/qwen3.8-27B-mlx-mixed-3_6)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Documentación de `mlx-vlm`: [mlx-vlm en GitHub](https://github.com/ml-explore/mlx-vlm) (enlace inferido, no verificado en la información proporcionada)
