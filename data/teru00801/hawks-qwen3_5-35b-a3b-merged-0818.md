# teru00801/hawks-qwen3_5-35b-a3b-merged-0818

## Resumen

El repositorio `teru00801/hawks-qwen3_5-35b-a3b-merged-0818` contiene un modelo fusionado (merged) en formato Hugging Face, creado por el usuario teru00801 a partir del modelo base `unsloth/Qwen3.5-35B-A3B`. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 35.951.822.704 parámetros totales, etiquetado como `qwen3_5_moe` y con pipeline `image-text-to-text`, lo que indica capacidad multimodal (procesamiento conjunto de imágenes y texto).

La finalidad declarada de este repositorio es servir como fuente de precisión preservada para conversiones posteriores, como la cuantización a MLX para Apple Silicon o la generación de formatos GGUF. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos que facilita el despliegue en diferentes runtimes. Su relevancia radica en que permite a desarrolladores e investigadores acceder a una versión lista para convertir y ejecutar en entornos heterogéneos, aprovechando las capacidades del modelo Qwen3.5-35B-A3B subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | No disponible (la nomenclatura A3B sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona cuantizacion MLX en la model card, sin detalles) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de los pesos del modelo base `unsloth/Qwen3.5-35B-A3B`, que según la etiqueta `qwen3_5_moe` emplea una arquitectura de mezcla de expertos. El nombre A3B indica que, probablemente, solo 3 mil millones de parámetros se activan por token, aunque este dato no se confirma en la información proporcionada. El pipeline `image-text-to-text` sugiere que el modelo base fue entrenado con fusión temprana de tokens multimodales, logrando paridad con Qwen3 y superando a los modelos Qwen3-VL en tareas de razonamiento, código, agentes y comprensión visual, según la documentación de Ollama para el modelo base.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, ni sobre procesos de RLHF o DPO. La innovación principal de este repositorio no radica en el entrenamiento, sino en el proceso de fusión y preservación de precisión para facilitar conversiones posteriores a formatos como MLX o GGUF.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Generación de texto conversacional: etiquetado como `conversational`.
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Según la documentación del modelo base Qwen3.5-35B-A3B en Ollama, el modelo subyacente destaca en razonamiento, generación de código, uso de agentes y comprensión visual. Estas capacidades se heredan en el merge, aunque no se verifican directamente en este repositorio.
- Soporte de tool calling y function calling: no disponible (no se menciona en la información).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Conversión a MLX para Apple Silicon: la model card incluye instrucciones explícitas para convertir el modelo a formato MLX cuantizado con `mlx_lm.convert`, permitiendo su ejecución eficiente en hardware Apple.
- Generación de paquetes GGUF: el repositorio menciona un paquete GGUF asociado (`teru00801/hawks-qwen3_5-35b-a3b-gguf-0818`), lo que facilita su uso con llama.cpp, Ollama u otros motores compatibles.
- Inferencia multimodal en producción: gracias a su pipeline `image-text-to-text`, puede utilizarse en aplicaciones que requieran comprender imágenes junto con texto, como asistentes visuales o sistemas de descripción automática.
- Base para fine-tuning: al ser un modelo fusionado con pesos de alta precisión, puede servir como punto de partida para adaptaciones específicas mediante fine-tuning, manteniendo la fidelidad de los pesos originales.
- Evaluación comparativa: los investigadores pueden usar este modelo para reproducir experimentos o comparar el rendimiento del merge frente a otras versiones cuantizadas, gracias a su disponibilidad en formato safetensors.
- Despliegue en plataformas de inferencia gestionada: la etiqueta `endpoints_compatible` y la presencia en FriendliAI indican que el modelo puede integrarse en servicios de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. La documentación de Ollama para el modelo base menciona que supera a Qwen3-VL en ciertas tareas, pero no se proporcionan números concretos.

## Requisitos de hardware

- El tamaño del repositorio es de 71,9 GB, lo que sugiere que los pesos están almacenados en precisión fp16 o bf16 (aproximadamente 2 bytes por parámetro para 35,95 B parámetros).
- Para inferencia sin cuantizar se necesitaría una GPU con al menos 72 GB de VRAM (por ejemplo, A100 80 GB o H100 80 GB).
- Con cuantización a 4 bits, se estima que la VRAM requerida rondaría los 18-20 GB, lo que permitiría su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque esta estimación no está confirmada por el autor.
- Opciones de despliegue: la model card sugiere conversión a MLX para Apple Silicon, y el paquete GGUF asociado permite su uso con llama.cpp, Ollama o vLLM (si se convierte a formato compatible).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un merge del base `unsloth/Qwen3.5-35B-A3B`, por lo que su rendimiento debería ser equivalente al de dicho modelo. No se han encontrado datos comparativos con otras alternativas MoE de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite). Se recomienda consultar las fichas técnicas de los modelos base para obtener referencias.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- Ausencia de documentación técnica: la model card es mínima y no incluye detalles sobre el proceso de fusión, los datos utilizados ni las diferencias frente al modelo base.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar contenido incorrecto o sesgado. No se han publicado evaluaciones de sesgo para este merge concreto.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Sin garantías de rendimiento: al ser un modelo fusionado por un tercero, no hay garantía de que el proceso de merge haya preservado todas las capacidades del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0818
- Paquete GGUF asociado: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-gguf-0818
- Versión anterior (merged-0710): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0710
- Versión anterior (merged-0709): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0709
- Página del modelo en FriendliAI: https://friendli.ai/models/teru00801/hawks-qwen3_5-35b-a3b-merged-0709
- Documentación del modelo base en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
