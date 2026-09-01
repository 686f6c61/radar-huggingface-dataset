# Stick9190/kroma-v0.2-base-lora-rank-384-fro-0985-txtfusion-stripped

## Resumen

Kroma v0.2 r384 TxtFusion Stripped es un adaptador LoRA derivado del checkpoint Kroma v0.2, un fine-tune completo del modelo de difusión Krea 2 creado por Lodestones. Este repositorio concreto, publicado por Stick9190, es una modificación del LoRA de rango 384 con compresión Frobenius (factor 0.985) creado por SilverOxides, en la que se han eliminado todos los tensores correspondientes a la parte TxtFusion (64 tensores de `diffusion_model.txtfusion.layerwise_blocks` y `diffusion_model.txtfusion.refiner_blocks`). El resultado es un archivo safetensors de 3.4 GB en FP32 que conserva 448 tensores de los bloques 0 a 27 del modelo de difusión.

La relevancia de esta versión "stripped" es que permite controlar de forma independiente la parte principal del LoRA y la parte TxtFusion, algo que el LoRA original no permitía al aplicar ambas simultáneamente con la misma fuerza. Esto es útil para sustituir el componente TxtFusion por otra versión, probar variantes o evitar solapamientos no deseados. No es un modelo autónomo: requiere un modelo base compatible (Krea 2) y un flujo de trabajo como el de ComfyUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión (Krea 2) |
| Parametros totales | no disponible (448 tensores en bloques 0-27) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantizacion | FP32 (original) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El archivo es un adaptador LoRA de rango 384, con compresión Frobenius (factor 0.985), extraído del checkpoint Kroma v0.2. El modelo original Kroma v0.2 fue producido mediante fine-tuning completo del checkpoint K2 (Krea 2) sobre el que se basaba Kroma v0.1, sin la compresión delta de rango 256 usada en v0.1, y posteriormente se fusionó el delta de Krea 2 Turbo como un LoRA de rango 512. En esta variante "stripped" se han eliminado los tensores correspondientes a los módulos TxtFusion (`layerwise_blocks` y `refiner_blocks`), manteniendo intactos los pesos del resto del LoRA. No se dispone de información sobre el dataset de entrenamiento, el número de pasos ni el método de optimización empleado.

## Capacidades

- Generación de imágenes mediante el modelo base Krea 2, con los ajustes de estilo y composición aportados por el LoRA Kroma v0.2.
- Control independiente de la parte TxtFusion: al cargar este LoRA "stripped" junto con un LoRA TxtFusion separado, se pueden aplicar fuerzas distintas a cada componente (por ejemplo, 0.4 para el LoRA principal y 1.0 para el TxtFusion).
- Compatible con flujos de trabajo de ComfyUI y otras herramientas que soporten LoRAs de modelos de difusión.
- Conserva la precisión FP32 de los pesos originales, lo que facilita la integración en pipelines de inferencia sin pérdida adicional de calidad.

## Casos de uso

- Ajuste fino de estilos en generación de imágenes: el LoRA permite aplicar el estilo de Kroma v0.2 sobre el modelo base Krea 2, modificando la estética y la composición de las imágenes generadas.
- Experimentación con componentes TxtFusion: al eliminar los pesos TxtFusion, se puede cargar un LoRA TxtFusion alternativo y probar su efecto por separado, sin que el LoRA principal interfiera.
- Sustitución de la versión TxtFusion original: si se dispone de una versión mejorada o corregida de TxtFusion, este LoRA "stripped" permite reemplazarla sin tener que modificar el LoRA completo.
- Prevención de solapamiento de pesos: al cargar el LoRA principal y un TxtFusion por separado, se evita que los pesos TxtFusion del LoRA original se apliquen dos veces (una por el LoRA principal y otra por el TxtFusion adicional).
- Integración en pipelines de ComfyUI: el archivo safetensors puede cargarse directamente en nodos de LoRA de ComfyUI, junto con el checkpoint base de Krea 2.
- Comparación de variantes de TxtFusion: permite evaluar diferentes versiones de TxtFusion manteniendo constante la parte principal del LoRA, lo que facilita la depuración y la selección de la mejor combinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas de calidad de imagen, velocidad de inferencia ni comparaciones cuantitativas con otros LoRAs o checkpoints.

## Requisitos de hardware

- El archivo LoRA pesa 3.4 GB en FP32, pero no es un modelo completo: requiere cargar el checkpoint base de Krea 2 (varios GB adicionales) para funcionar.
- La VRAM necesaria depende del modelo base y de la resolución de salida. Para Krea 2, se recomienda al menos 8 GB de VRAM en configuraciones de baja resolución, y 12-16 GB para resoluciones mayores o con batch.
- GPUs compatibles: cualquier GPU con soporte CUDA (NVIDIA) o ROCm (AMD) que pueda ejecutar el modelo base. Tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 son adecuadas según el tamaño del batch y la resolución.
- Opciones de despliegue: ComfyUI, Automatic1111 (si soporta Krea 2), o scripts personalizados con la librería de difusión correspondiente.
- La latencia y el throughput dependen del hardware y de la configuración; no se dispone de cifras específicas para este LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Rango | Tamaño | TxtFusion | Licencia |
|---|---|---|---|---|---|
| Kroma v0.2 r384 (original, SilverOxides) | LoRA completo | 384 | ~3.4 GB | Incluido | no disponible |
| Kroma v0.2 r384 TxtFusion Stripped (este) | LoRA sin TxtFusion | 384 | ~3.4 GB | Eliminado | no disponible |
| Kroma v0.1 | Checkpoint completo | - | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes de Kroma, ya que no se dispone de información sobre otros LoRAs de Krea 2 con características equivalentes. La principal diferencia entre el LoRA original y esta versión es la ausencia de los pesos TxtFusion, lo que permite un control independiente pero también implica que, si se usa sin un LoRA TxtFusion adicional, se pierde la funcionalidad TxtFusion del modelo original.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un checkpoint base de Krea 2 y un flujo de trabajo de difusión para funcionar.
- La licencia no está especificada, por lo que el uso comercial es incierto y debe consultarse con los autores originales (Lodestones y SilverOxides).
- Al eliminar los pesos TxtFusion, el comportamiento del LoRA cambia respecto al original: si no se carga un LoRA TxtFusion complementario, se pierde la funcionalidad asociada a ese componente.
- Existe una discusión en la comunidad que indica que Kroma v0.2 es peor que v0.1 para escenas complejas; esta limitación se hereda en este LoRA.
- El archivo está en FP32, lo que aumenta el uso de memoria en comparación con cuantizaciones de menor precisión (por ejemplo, FP16 o INT8).
- No se han publicado benchmarks ni evaluaciones objetivas de este LoRA específico, por lo que su rendimiento real en tareas concretas no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Stick9190/kroma-v0.2-base-lora-rank-384-fro-0985-txtfusion-stripped
- Modelo original Kroma (Lodestones): https://huggingface.co/lodestones/Kroma
- LoRA original de SilverOxides: https://huggingface.co/silveroxides/Kroma-LoRA
- Página de Civitai con el archivo fp32: https://civitai.com/models/2823254/kroma-krea-2-lora
- Artículo de ComfyUI Wiki sobre Kroma v0.2: https://comfyui-wiki.com/en/news/2026-08-09-kroma-v0-2
- Discusión sobre rendimiento de v0.2: https://huggingface.co/lodestones/Kroma/discussions/16
