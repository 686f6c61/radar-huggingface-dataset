# swdjojo/Qwen3.8-27B-MLX-oQ8e

## Resumen

El modelo `swdjojo/Qwen3.8-27B-MLX-oQ8e` es una cuantización en formato MLX del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario swdjojo. Se trata de un modelo multimodal (image-text-to-text) que acepta tanto imágenes como texto como entrada, y que ha sido convertido a pesos cuantizados de 8 bits con group size 64 mediante la herramienta oQ (oMLX v0.6.0.dev1). El repositorio contiene 29.5 GB de pesos en formato safetensors de MLX, lo que lo hace adecuado para su uso en dispositivos Apple Silicon mediante la librería MLX.

Aunque el nombre sugiere 27 mil millones de parámetros, los datos reales de safetensors indican 8.027.131.120 parámetros totales, lo que sugiere que podría tratarse de un modelo de arquitectura MoE (mixture of experts) con 27B totales y 8B activos, aunque esta información no está confirmada en la documentación disponible. La cuantización oQ de 8 bits con group size 64 busca reducir el tamaño del modelo manteniendo una calidad cercana a la versión BF16 original. El modelo fue actualizado el 15 de agosto de 2026, reemplazando una versión anterior.

La relevancia de este modelo radica en su naturaleza multimodal y su disponibilidad en formato MLX, lo que permite ejecutar inferencia de visión-lenguaje en hardware Apple de forma eficiente. Sin embargo, la información pública es escasa: no se especifican la licencia, los idiomas soportados, ni los detalles de entrenamiento del modelo base, por lo que esta ficha se basa únicamente en los datos proporcionados en la model card y en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, tipo qwen3_5) |
| Parametros totales | 8.027.131.120 (según safetensors) |
| Parametros activos | no disponible (posible MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 8 bits, group size 64 (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería mlx) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B`. El nombre sugiere una familia Qwen3.8, y el tipo de modelo reportado es `qwen3_5`, lo que indica que pertenece a la generación Qwen3.5. Dado que los parámetros totales son 8.027 millones, es plausible que se trate de un modelo de mezcla de expertos (MoE) con 27 mil millones de parámetros totales y 8 mil millones activos, una configuración común en modelos recientes de Qwen, pero esta hipótesis no está confirmada en la documentación disponible.

El proceso de cuantización fue realizado con la herramienta oQ (oMLX v0.6.0.dev1), que aplica cuantización de precisión mixta. En este caso, se utilizaron 8 bits con group size 64, lo que reduce el tamaño del modelo respecto a la versión BF16 original (`swdjojo/Qwen3.8-27B-MLX-BF16`). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO, ya que esa información corresponde al modelo base y no está incluida en la model card.

## Capacidades

- Procesamiento multimodal: el pipeline declarado es `image-text-to-text`, por lo que el modelo puede recibir imágenes y texto como entrada y generar texto como salida.
- Conversación: el tag `conversational` indica que está diseñado para mantener diálogos multi-turno.
- Generación de texto: al ser un modelo de lenguaje, puede generar respuestas coherentes en tareas de lenguaje natural.
- Comprensión de imágenes: al ser multimodal, puede describir imágenes, responder preguntas visuales y realizar tareas de razonamiento visual.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües específicas.

## Casos de uso

- Descripción y análisis de imágenes: el modelo puede generar descripciones detalladas de imágenes, útil para aplicaciones de accesibilidad o catalogación automática de contenido visual.
- Asistentes conversacionales multimodales: integrable en chatbots que necesiten entender capturas de pantalla, fotos o diagramas enviados por el usuario.
- Preguntas y respuestas visuales (VQA): puede responder preguntas sobre el contenido de una imagen, por ejemplo en entornos educativos o de documentación técnica.
- Moderación de contenido visual: análisis de imágenes para detectar contenido inapropiado o clasificar imágenes según categorías.
- Automatización de informes a partir de gráficos: dado un gráfico o tabla en imagen, el modelo puede extraer la información y generar un resumen textual.
- Prototipado rápido en Apple Silicon: al estar en formato MLX, puede ejecutarse localmente en Macs con chip M-series para desarrollo y pruebas sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- El repositorio ocupa 29.5 GB, por lo que se necesita al menos esa cantidad de almacenamiento y suficiente memoria unificada en Apple Silicon para cargar los pesos.
- Al ser formato MLX, está optimizado para GPUs de Apple (M1, M2, M3, M4 y superiores). Se recomienda un Mac con al menos 32 GB de memoria unificada para una inferencia fluida con contexto moderado.
- No se dispone de datos de VRAM para GPUs NVIDIA, ya que el formato MLX no es compatible directamente con CUDA. Para usar en GPUs NVIDIA sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar).
- Opciones de despliegue: la librería MLX permite ejecutar el modelo en local mediante Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base Qwen3.8-27B no tiene datos públicos en esta ficha, y no se conocen alternativas directas con las que comparar. Se recomienda consultar la documentación oficial de Qwen para obtener comparativas con otros modelos de la familia.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar su uso comercial. Es necesario contactar con el autor o consultar el modelo base original para conocer los términos.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo cuantizado, puede presentar una ligera degradación de calidad respecto a la versión BF16, aunque no se han publicado evaluaciones.
- El modelo está pensado para Apple Silicon; su uso en otros entornos requiere conversión de formato.
- La fecha de creación (2026) y la actualización reciente indican que es un modelo muy nuevo, con posible falta de madurez en producción.
- No se conocen los idiomas soportados; es probable que herede las capacidades del modelo base Qwen, pero no está confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/swdjojo/Qwen3.8-27B-MLX-oQ8e
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión BF16 previa: https://huggingface.co/swdjojo/Qwen3.8-27B-MLX-BF16
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
