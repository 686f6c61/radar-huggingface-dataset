# vanch007/WeMM-Video-35BA3B-mlx-8bit

## Resumen

WeMM-Video-35BA3B es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, capaz de procesar vídeo, audio e imagen junto con texto. Esta ficha describe la conversión a formato MLX en cuantización 8-bit mixta realizada por el usuario vanch007, pensada para inferencia nativa en Apple Silicon mediante MLX y el runtime oMLX. El modelo base combina una arquitectura MoE (Mixture of Experts) con 256 expertos sobre un backbone de lenguaje de tipo Qwen3.5-MoE, un vision tower Qwen3-VL de 27 capas y un audio tower basado en Whisper de 32 capas más un Q-Former BERT de 2 capas.

El modelo resuelve la necesidad de comprender y resumir contenido audiovisual (por ejemplo, describir una escena de vídeo y transcribir o resumir el habla) en hardware de consumo Apple, algo que las versiones en precisión completa dificultan por tamaño. Con 36.177.564.024 parámetros totales y un repositorio de 40,4 GB en esta variante de 8 bits, se posiciona como una opción para prototipado local de tareas multimodales de vídeo y audio.

Es relevante ahora porque permite ejecutar un modelo multimodal MoE de gran tamaño en Macs con memoria unificada, sin GPU dedicada, gracias a la cuantización selectiva que mantiene los torres de visión y audio en bfloat16/float16 sin cuantizar para preservar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Qwen3.5-MoE con 256 expertos) + vision tower Qwen3-VL (27 capas) + audio tower Whisper (32 capas) con Q-Former BERT (2 capas) |
| Parametros totales | 36.177.564.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (group_size=64) en backbone y expertos MoE; vision tower en bfloat16; audio tower en float16; Gated DeltaNet A_log en float32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida multimodal. El backbone de lenguaje emplea un esquema MoE con 256 expertos y un router más una compuerta de experto compartido (shared_expert_gate), ambos cuantizados a 8 bits en esta conversión. Incorpora además componentes de tipo Gated DeltaNet (el parámetro A_log se mantiene en float32). La parte visual es un vision tower Qwen3-VL de 27 capas, y la parte de audio es un tower Whisper de 32 capas seguido de un Q-Former BERT de 2 capas que proyecta las representaciones de audio al espacio del modelo de lenguaje.

En cuanto al entrenamiento del modelo original, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. La innovación técnica destacable de esta ficha es la estrategia de cuantización mixta: solo el backbone y los expertos MoE se cuantizan a 8 bits, mientras que los torres de visión y audio permanecen en bfloat16/float16, con verificación de similitud coseno (cos=0.999826) frente a la referencia FP32 para el tower de audio.

## Capacidades

- Comprensión de vídeo: descripción de escenas y análisis de contenido visual secuencial.
- Comprensión de audio: transcripción y resumen del habla presente en el vídeo (tower Whisper).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Generación de texto conversacional a partir de entradas multimodales.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Inferencia nativa en Apple Silicon mediante MLX y oMLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión extendida o audio en streaming: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de vídeo: el modelo recibe un archivo de vídeo y genera una descripción de la escena, adecuado para catalogación de archivos audiovisuales o generación de metadatos.
- Resumen de discursos y reuniones grabadas: combinando el tower de audio y el de visión, puede transcribir y resumir el habla de un vídeo, útil para actas automáticas.
- Accesibilidad: generación de descripciones textuales de contenido audiovisual para personas con discapacidad visual, aprovechando la comprensión conjunta de imagen y audio.
- Moderación de contenido multimedia: análisis de vídeos para detectar y describir escenas relevantes en flujos de revisión, con despliegue local en Macs.
- Prototipado en Apple Silicon: desarrollo y validación de pipelines multimodales sin GPU dedicada, gracias a la cuantización 8-bit y al runtime oMLX.
- Investigación en modelos MoE multimodales: experimentación con un MoE de 36B parámetros en hardware de consumo, comparando variantes de 4, 6 y 8 bits.
- Indexación semántica de archivos de vídeo: generación de descripciones y resúmenes para motores de búsqueda internos sobre bibliotecas audiovisuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio de 8 bits ocupa 40,34 GB en disco; se requiere memoria unificada suficiente para cargar los pesos (previsiblemente en torno a 40 GB o más, según overhead del runtime; no confirmado en la información).
- Variantes alternativas: 4-bit (23,27 GB) y 6-bit (31,81 GB), útiles para equipos con menos memoria.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon con MLX. No hay datos de compatibilidad con A100, H100 o RTX 4090 en la información proporcionada.
- ¿Cabe en consumer GPU? El formato es MLX para Apple Silicon; no se indica compatibilidad con GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX y oMLX mediante el repositorio vanch007/mlx-wemm-video; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vanch007/WeMM-Video-35BA3B-mlx-8bit | 36,18B | no disponible | apache-2.0 | safetensors MLX 8-bit | Esta ficha; vídeo+audio+imagen, Apple Silicon |
| vanch007/WeMM-Video-35BA3B-mlx-6bit | 36,18B | no disponible | apache-2.0 | safetensors MLX 6-bit | Misma base, 31,81 GB, menor huella de memoria |
| vanch007/WeMM-Video-35BA3B-mlx-4bit | 36,18B | no disponible | apache-2.0 | safetensors MLX 4-bit | Misma base, 23,27 GB, máxima compresión |
| tencent/WeMM-Video-35BA3B | 36,18B | no disponible | apache-2.0 | no disponible | Modelo base original en precisión completa |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos multimodales; las descripciones de vídeo y los resúmenes de audio deben validarse en producción.
- Sesgos conocidos: no disponible en la información proporcionada.
- La cuantización 8-bit puede introducir degradación frente al modelo base; solo el tower de audio cuenta con verificación de similitud coseno publicada.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original de Tencent.
- Requiere hardware Apple Silicon y el runtime MLX/oMLX; no es portable directamente a otros stacks sin conversión.
- Longitud de contexto no documentada, lo que limita la planificación de cargas con vídeos largos.
- El repositorio tiene pocas descargas (166) y un solo like, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-8bit
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Variante 4-bit: https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-4bit
- Variante 6-bit: https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-6bit
- Repositorio de inferencia: https://github.com/vanch007/mlx-wemm-video
