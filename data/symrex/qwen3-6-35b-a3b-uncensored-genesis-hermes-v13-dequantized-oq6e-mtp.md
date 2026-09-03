# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-mtp

## Resumen

Este modelo es una cuantización mixta de 6 bits del modelo Qwen3.6-35B-A3B, preparada para el ecosistema MLX de Apple. El autor, symrex, ha aplicado la herramienta oQ (oMLX v0.6.4) para reducir el peso del modelo original a unos 30,1 GB manteniendo una precisión de 6 bits con group size 64. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) identificado como `qwen3_5_moe`, con un total de 35.951.822.704 parámetros.

El etiquetado como "Uncensored" y "Genesis-Hermes-V13" sugiere que se trata de un fine-tuning orientado a reducir restricciones de contenido y a mejorar el rendimiento en instrucciones, aunque no se dispone de documentación oficial al respecto. La cuantización está diseñada para ejecutarse en dispositivos Apple con memoria unificada mediante MLX, lo que permite ejecutar un modelo de este tamaño en hardware de consumo.

La relevancia de esta ficha radica en que es un ejemplo de cómo los modelos MoE de gran tamaño pueden ser comprimidos y desplegados localmente. Sin embargo, la ausencia de información sobre el modelo base (licencia, datos de entrenamiento, benchmarks) limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, transformer) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre sugiere 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos (MoE) de la familia Qwen, identificado internamente como `qwen3_5_moe`. No se dispone de detalles sobre el número de expertos, la dimensión de los estados ocultos o el mecanismo de enrutamiento. El modelo original, antes de la cuantización, era presumiblemente un checkpoint de Qwen3.6-35B-A3B, pero no se ha publicado información sobre su entrenamiento, dataset o proceso de alineación.

La cuantización aplicada por symrex utiliza la librería oQ de oMLX v0.6.4, que implementa cuantización de precisión mixta. Esta técnica asigna diferentes niveles de precisión a distintas capas o bloques, optimizando el balance entre tamaño y calidad. El resultado es un modelo de 6 bits con group size 64, almacenado en formato MLX safetensors, que ocupa 30,1 GB en disco.

## Capacidades

No se ha publicado información sobre las capacidades específicas de este modelo cuantizado. Al ser una versión comprimida de un modelo MoE de la serie Qwen, se espera que herede las capacidades generales de los modelos Qwen (generación de texto, razonamiento, código), pero no hay datos concretos disponibles. El nombre "Uncensored" sugiere un fine-tuning para reducir filtros de contenido, y "Hermes" es una metodología de entrenamiento conocida por mejorar el seguimiento de instrucciones, pero no se puede confirmar.

## Casos de uso

Al no existir documentación oficial, los siguientes casos son hipotéticos y se basan en las características generales de un modelo MoE de 35B parámetros cuantizado para MLX:

- Ejecución local en Mac con Apple Silicon: gracias a MLX y la cuantización de 6 bits, el modelo puede ejecutarse en equipos con 32 GB o más de memoria unificada, permitiendo asistencia de texto sin conexión.
- Desarrollo de prototipos de chatbots: su tamaño moderado y formato MLX lo hacen adecuado para experimentar con agentes conversacionales en entornos de desarrollo.
- Generación de código asistida en equipos de consumo: si mantiene las capacidades de Qwen para código, podría usarse como autocompletado o generación de funciones en IDEs locales.
- Investigación sobre cuantización: su configuración de precisión mixta (6 bits, group size 64) lo convierte en un caso de estudio para evaluar el impacto de la cuantización en modelos MoE.
- Fine-tuning adicional: al ser un checkpoint cuantizado, podría servir como base para adaptaciones con LoRA u otras técnicas de ajuste eficiente en MLX.
- Evaluación de modelos "uncensored": para investigadores interesados en el comportamiento de modelos sin filtros de seguridad, aunque esto conlleva riesgos.

Estos casos no están confirmados por el autor y deben tomarse como orientativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repo: 30,1 GB (pesos cuantizados a 6 bits).
- Memoria estimada para inferencia: al menos 32 GB de RAM unificada en Mac (dado que MLX utiliza memoria unificada, los pesos deben caber junto con el runtime y los estados de la atención). Con 6 bits y 35,95B parámetros, los pesos ocupan aproximadamente 27 GB, por lo que 32 GB es el mínimo recomendable; 64 GB sería más cómodo para contextos largos.
- GPU: no aplica a GPUs NVIDIA de forma directa; MLX está diseñado para Apple Silicon. Para GPUs CUDA, habría que convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar), lo que no está disponible en este repo.
- Opciones de despliegue: MLX (librería de Apple), posiblemente a través de `mlx-lm` o `mlx-lm.server`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. En un Mac con M-series, un MoE de 3B activos (si se confirma) podría ofrecer una velocidad de generación aceptable, pero no hay datos medidos.

## Comparativa con modelos similares

No hay información suficiente para comparar este modelo con otros. Se desconoce el modelo base exacto (Qwen3.6-35B-A3B) y no se dispone de benchmarks. Como referencia genérica, los modelos MoE de ~35B totales y ~3B activos suelen competir con modelos densos de 7B-14B en rendimiento, pero con menor coste computacional por token. Sin embargo, esta afirmación es especulativa y no se puede aplicar directamente.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo original.
- Al ser una cuantización, puede haber pérdida de precisión en tareas complejas de razonamiento o matemáticas respecto al modelo original en full precision.
- La licencia no está especificada, lo que impide conocer si puede usarse comercialmente. Se debe contactar con el autor o el propietario del modelo base antes de cualquier uso en producción.
- El etiquetado "Uncensored" implica que el modelo puede generar contenido inapropiado o dañino; su uso debe ser responsable y bajo tu propio riesgo.
- El formato MLX limita su uso a hardware Apple; no es directamente compatible con otros entornos de inferencia.
- No hay garantía de que el modelo funcione correctamente; al ser una publicación reciente (septiembre de 2026) y sin descargas ni likes, no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-mtp
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
