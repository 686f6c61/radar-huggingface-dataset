# teru00801/hawks-qwen3_5-35b-a3b-merged-1114

## Resumen

El repositorio `teru00801/hawks-qwen3_5-35b-a3b-merged-1114` contiene un modelo derivado de `unsloth/Qwen3.5-35B-A3B`, publicado por el usuario teru00801 en formato Hugging Face (transformers + safetensors). Se trata de un modelo fusionado (merged/fused) pensado como fuente de precisión para conversiones posteriores, en particular a cuantización MLX y a otros formatos de ejecución. La model card es extremadamente escueta: no documenta el proceso de merge, los datos de entrenamiento adicionales ni los cambios respecto al modelo base.

El nombre del repositorio indica una arquitectura Qwen 3.5 con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos (sufijo A3B), lo que corresponde a un transformer con mezcla de expertos (MoE). El recuento real de parámetros en safetensors es de 35.951.822.704, coherente con esa designación. La pipeline declarada es image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque no hay documentación que lo confirme más allá de los tags.

La relevancia de este modelo es limitada y muy específica: es un artefacto intermedio de un flujo de conversión, no un modelo con model card completa ni evaluación publicada. No hay descargas ni likes, no se declara licencia ni idiomas soportados, y no se ofrecen resultados de benchmarks. Cualquier evaluación de sus capacidades debe remitirse al modelo base `unsloth/Qwen3.5-35B-A3B`, cuyas especificaciones no están incluidas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,95 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (inferido del sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El autor menciona conversión a MLX con cuantización (`mlx_lm.convert -q`); no se detallan tipos concretos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face para transformers); existe un paquete GGUF separado del mismo autor |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de la familia Qwen 3.5, según el tag `qwen3_5_moe` y la designación 35B-A3B. La model card no describe la arquitectura interna, el número de expertos, la estrategia de enrutamiento ni innovaciones de atención. El repositorio se presenta explícitamente como un modelo fusionado y como fuente de precisión para conversiones posteriores, lo que implica que los pesos han pasado por algún proceso de merge o fusión, presumiblemente a partir del modelo base `unsloth/Qwen3.5-35B-A3B`; el procedimiento exacto no está documentado.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre fases de ajuste como RLHF, DPO o SFT posteriores al modelo base. Tampoco se documentan técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Dado que el modelo base es de Unsloth y este repositorio es un derivado, cualquier detalle de entrenamiento debería consultarse en la documentación de `unsloth/Qwen3.5-35B-A3B`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la pipeline declarada apuntan a uso en diálogo multi-turno.
- Entrada multimodal imagen-texto: la pipeline `image-text-to-text` sugiere procesamiento conjunto de imágenes y texto, aunque no se detalla el alcance (comprensión de imágenes, OCR, VQA u otras).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en infraestructura de inferencia compatible con la API de Hugging Face.
- Conversión a MLX: el autor documenta explícitamente el flujo de conversión con `mlx_lm.convert` para Apple Silicon.
- Disponibilidad en GGUF: existe un paquete de ejecución GGUF del mismo autor (`teru00801/hawks-qwen3_5-35b-a3b-gguf-1114`), lo que habilita su uso en llama.cpp y runtimes compatibles.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Conversión a MLX para ejecución local en Apple Silicon: el modelo está pensado como fuente de precisión para generar una versión cuantizada con `mlx_lm.convert -q`, adecuada para Macs con memoria unificada amplia que quieran ejecutar un MoE de 35B de forma local.
- Generación de pesos GGUF para llama.cpp: a partir de este repositorio fusionado se puede derivar el paquete GGUF ya publicado por el autor, útil para desplegar el modelo en entornos con CPU/GPU mixtas o en herramientas como llama.cpp y Ollama.
- Base para ajuste fino posterior: al ser un modelo fusionado en safetensors y compatible con transformers, sirve como punto de partida para SFT o LoRA sobre la arquitectura Qwen 3.5 MoE, siempre que se respete la licencia del modelo base (no declarada aquí).
- Prototipado de pipelines imagen-texto: la pipeline `image-text-to-text` permite experimentar con tareas de comprensión conjunta de imagen y texto en entornos de investigación, con la cautela de que no hay evaluación publicada de su calidad multimodal.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` facilita servirlo mediante infraestructura de inferencia estándar para pruebas internas de integración.
- Reproducción de flujos de conversión de formatos: útil para equipos que necesiten validar pipelines de conversión HF → MLX/GGUF y comparar la fidelidad de los pesos fusionados frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 72 GB solo para pesos (coherente con el tamaño del repo de 72 GB), más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB o configuraciones multi-GPU.
- Cuantización a 8 bits: en torno a 36-40 GB de pesos, viable en una A100 80 GB o H100 80 GB con margen.
- Cuantización a 4 bits: en torno a 18-22 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) con contexto limitado, aunque el overhead de un MoE y la caché KV pueden exigir ajustes.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para FP16/BF16; RTX 4090 o A6000 para cuantizaciones agresivas.
- Apple Silicon: el flujo documentado por el autor es MLX; un Mac con memoria unificada de 64 GB o más es el objetivo razonable para una versión cuantizada.
- Opciones de despliegue: transformers (formato nativo), MLX (`mlx_lm`), llama.cpp/Ollama mediante el paquete GGUF del autor, y endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles; al ser un MoE con aproximadamente 3B de parámetros activos, el coste por token debería ser inferior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teru00801/hawks-qwen3_5-35b-a3b-merged-1114 | 35,95B | ~3B (inferido) | no disponible | no disponible | Hugging Face, GGUF del mismo autor |
| unsloth/Qwen3.5-35B-A3B (modelo base) | 35B (aproximado por el nombre) | ~3B (inferido) | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, proceso de merge, evaluación ni cambios respecto al modelo base, lo que impide verificar qué se ha modificado exactamente.
- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base `unsloth/Qwen3.5-35B-A3B` antes de cualquier uso en producción.
- Idiomas no declarados: no hay información sobre cobertura lingüística; el comportamiento multilingüe es desconocido.
- Contexto no declarado: se desconoce la ventana de contexto efectiva, lo que afecta al diseño de aplicaciones con documentos largos o diálogos extensos.
- Riesgo de alucinación: sin evaluación publicada, no hay evidencia sobre la fiabilidad factual del modelo; debe validarse empíricamente antes de usarlo en tareas sensibles.
- Artefacto intermedio: el propio autor lo describe como fuente de precisión para conversiones, no como un modelo listo para producción con garantías.
- Capacidades multimodales no verificadas: la pipeline `image-text-to-text` sugiere entrada de imagen, pero no hay documentación sobre resolución, tipos de imagen admitidos ni calidad en tareas de visión.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay reportes de terceros sobre su comportamiento.
- Tamaño del repo de 72 GB: requiere almacenamiento y ancho de banda considerables para su descarga y conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-1114
- Paquete GGUF del mismo autor: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-gguf-1114
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-35B-A3B
- Documentación de MLX LM (conversión y cuantización): https://github.com/ml-explore/mlx-lm
- Otros enlaces (papers, blogs, demos): no disponibles
