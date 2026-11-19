# wenyii/cdmt-checkpoints-extra

## Resumen

CDMT additional checkpoints es una colección de puntos de control finales publicada por el usuario wenyii como material complementario del modelo `wenyii/cdmt-qwen2.5-3b`. No se trata de un modelo único, sino de un repositorio que agrupa los resultados de una serie de experimentos de post-entrenamiento (SFT y GRPO) centrados en el uso de herramientas de búsqueda, con variaciones de escala (1.5B, 3B, 4B, 7B y 8B), familia de modelo base (Qwen2.5, Gemma 3 y Llama 3.1) y elección de profesor para la destilación de trayectorias.

El repositorio tiene un tamaño de 237 GB y contiene múltiples subcarpetas, una por ejecución, con semillas 11, 22 y 33. Cada subcarpeta incluye pesos en formato Hugging Face (safetensors) compatibles con la librería `transformers`, además de una carpeta auxiliar `gemma-3-4b-it-cdmt-template/` que solo contiene configuración, tokenizador y plantilla de chat para Gemma 3, sin pesos.

Su relevancia es metodológica: permite reproducir y comparar recetas de post-entrenamiento para tool-use (SFT frente a GRPO, distintos profesores y escalas) sobre modelos base abiertos. No se han publicado datos de benchmarks ni una model card con métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de cada modelo base: Qwen2.5, Gemma 3, Llama 3.1); detalles específicos no disponibles |
| Parametros totales | Variable por subcarpeta: 1.5B, 3B, 4B, 7B y 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `other`; por subcarpeta: Apache-2.0 (Qwen2.5-1.5B/7B-Instruct), Qwen Research License no comercial (Qwen2.5-3B-Instruct), Gemma Terms of Use (derivados de Gemma), Llama 3.1 Community License (derivados de Llama) |
| Formato de pesos | Safetensors en formato Hugging Face (`transformers`) |

## Arquitectura y entrenamiento

Cada subcarpeta es un ajuste fino de un modelo base instruct ya existente, por lo que la arquitectura subyacente es la del transformer decoder de cada familia (Qwen2.5, Gemma 3, Llama 3.1). El repositorio no documenta cambios arquitectónicos propios; el interés está en el procedimiento de post-entrenamiento orientado a tool-use con búsqueda.

Las recetas documentadas son las siguientes. Para Qwen2.5-1.5B-Instruct y Qwen2.5-7B-Instruct se entrenó con 10k prompts de búsqueda, con SFT de 1.250 pasos o GRPO de 250 pasos, a learning rate 1e-6. Para Gemma-3-4b-it y Llama-3.1-8B-Instruct se hizo SFT sobre 1.000 trayectorias de búsqueda generadas por el profesor Qwen2.5-72B-Instruct, con learning rate 1e-5 y una época. Para Qwen2.5-3B-Instruct se incluyen variantes con destilación desde profesores distintos (Qwen2.5-72B y Llama-3.1) sobre prompts emparejados, además de una receta legacy de SFT de búsqueda de 15 pasos. Los datos de SFT incluyen salidas de Qwen2.5-72B-Instruct (Built with Qwen). No se detalla la composición completa del dataset ni si hubo RLHF/DPO adicional más allá del GRPO indicado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados de los modelos base instruct.
- Uso de herramientas de búsqueda (search tool-use) como capacidad central del post-entrenamiento.
- Soporte de tool calling / function calling orientado a invocar herramientas externas de búsqueda.
- Razonamiento multi-paso en el contexto de trayectorias de búsqueda y recuperación de información.
- Capacidades multilingües: no documentadas específicamente en este repositorio; dependen del modelo base.
- Capacidades especiales (visión, audio, thinking mode): no documentadas; dependen del modelo base (Gemma 3 es multimodal, pero el repositorio no detalla el alcance del ajuste).

## Casos de uso

- Investigación en post-entrenamiento para tool-use: comparar SFT frente a GRPO sobre el mismo modelo base y los mismos prompts de búsqueda, usando las semillas 11/22/33 para medir varianza entre ejecuciones.
- Estudio de destilación de profesor: evaluar cómo afecta usar Qwen2.5-72B frente a Llama-3.1 como profesor al rendimiento del estudiante Qwen2.5-3B en tareas de búsqueda.
- Análisis de escalado: comparar los checkpoints de 1.5B, 3B, 4B, 7B y 8B para estudiar la relación entre tamaño y calidad en tareas de tool-use.
- Reproducibilidad de recetas: reutilizar las configuraciones (pasos, learning rate, número de prompts) como línea base en experimentos propios de agentes con búsqueda.
- Construcción de asistentes con recuperación: desplegar un checkpoint de 3B o 7B como agente que decide cuándo invocar una herramienta de búsqueda en flujos de pregunta-respuesta sobre documentación.
- Evaluación de plantillas de chat: usar `gemma-3-4b-it-cdmt-template/` combinada con los pesos oficiales de Gemma 3 para probar el formato de conversación empleado en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño y precisión): 1.5B en fp16 ~3-4 GB; 3B ~6-8 GB; 4B ~8-10 GB; 7B ~14-16 GB; 8B ~16-18 GB. Con cuantización de 8 bits o 4 bits las necesidades se reducen aproximadamente a la mitad o a un cuarto, respectivamente.
- GPU recomendadas: A100/H100 para los tamaños 7B y 8B en fp16 con contexto largo; RTX 4090 (24 GB) suficiente para 7B/8B en fp16 y para todos los tamaños con cuantización.
- Consumer GPU: los checkpoints de 1.5B, 3B y 4B caben en GPUs de 8-12 GB en fp16; los de 7B y 8B requieren 16-24 GB o cuantización.
- Opciones de despliegue: `transformers` (formato nativo del repo), vLLM y TGI para serving; llama.cpp/Ollama solo si se convierten los pesos a GGUF (no se proporcionan en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CDMT checkpoints (este repo) | 1.5B-8B | No disponible | Post-entrenamiento para tool-use con búsqueda (SFT/GRPO, destilación) | Mixta por subcarpeta | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | No disponible en esta ficha | Modelo base instruct generalista | Qwen Research License (no comercial) | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo base instruct generalista | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | No disponible en esta ficha | Modelo base instruct generalista | Llama 3.1 Community License | Hugging Face |

La comparación relevante es frente a los modelos base sin ajuste: este repositorio aporta variantes especializadas en búsqueda, pero no publica métricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No hay benchmarks ni métricas publicadas; no es posible afirmar que los checkpoints superen a sus modelos base.
- Licencias heterogéneas por subcarpeta: los derivados de Qwen2.5-3B usan la Qwen Research License (no comercial), los de Gemma los Gemma Terms y los de Llama la Llama 3.1 Community License; verificar antes de cualquier uso comercial.
- Los datos de SFT incluyen salidas de Qwen2.5-72B-Instruct, lo que puede introducir sesgos y estilo del profesor.
- Riesgo de alucinación inherente a los modelos base; el ajuste en búsqueda no elimina este riesgo.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está garantizado.
- Longitud de contexto no documentada en el repositorio.
- Tamaño del repo de 237 GB: requiere espacio de almacenamiento considerable y descarga selectiva por subcarpeta.
- La carpeta `gemma-3-4b-it-cdmt-template/` no contiene pesos; debe combinarse con los pesos oficiales de `google/gemma-3-4b-it`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wenyii/cdmt-checkpoints-extra
- Modelo complementario: https://huggingface.co/wenyii/cdmt-qwen2.5-3b
- Modelos base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct, https://huggingface.co/Qwen/Qwen2.5-3B-Instruct, https://huggingface.co/Qwen/Qwen2.5-7B-Instruct, https://huggingface.co/google/gemma-3-4b-it, https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
