# viavicdev/Tarsier2-Recap-7b-MLX-4bit

## Resumen

Tarsier2-Recap-7b-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo omni-research/Tarsier2-Recap-7b, preparada por el usuario viavicdev para inferencia nativa en Apple Silicon. El modelo subyacente pertenece a la clase Qwen2-VL 7B y está especializado en la generación de descripciones de vídeo detalladas y fundamentadas (video captioning), destacando por nombrar detalles concretos en lugar de resumir escenas de forma genérica. No existe una build oficial en MLX del modelo original, por lo que este repositorio cubre esa carencia.

La relevancia de esta ficha radica en que permite ejecutar un modelo de visión-lenguaje de 7B parámetros en hardware de consumo de Apple (M-series) sin necesidad de GPU NVIDIA, manteniendo los pesos originales sin reentrenamiento ni fine-tuning: solo conversión de formato y cuantización afín de 4 bits con tamaño de grupo 64. El checkpoint resultante ocupa aproximadamente 5,64 GB en dos shards safetensors y se ejecuta a través de la librería mlx-vlm.

El modelo cuenta con 8.291.375.616 parámetros reales según los safetensors, aunque Hugging Face puede mostrar un recuento automático inferior (~1,9 B) debido al empaquetado de los pesos 4-bit en enteros de 32 bits. La licencia es Apache-2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL 7B (transformer multimodal visión-lenguaje) |
| Parametros totales | 8.291.375.616 (8,29 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit affine, group size 64 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (dos shards), ~5,64 GB / 5,25 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es de la clase Qwen2-VL 7B, una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de visión-lenguaje. Tarsier2-Recap-7b se especializa en captioning de vídeo con descripciones específicas y fundamentadas. Esta versión concreta no ha sido reentrenada ni afinada: la conversión aplica únicamente un cambio de formato de almacenamiento y una cuantización afín de 4 bits con tamaño de grupo 64.

La conversión requirió adaptar el checkpoint original a un layout MLX nativo compatible, resolviendo diferencias en la arquitectura visión-lenguaje y en la configuración del codificado posicional, ya que los metadatos de arquitectura publicados no coincidían plenamente con la estructura del modelo multimodal subyacente. El resultado se ejecuta por la ruta de inferencia nativa estándar de mlx-vlm. El procedimiento completo de conversión no está incluido en el repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de descripciones detalladas de vídeo (video captioning) a partir de secuencias de frames.
- Descripción fundamentada: tiende a nombrar detalles concretos (objetos, colores, acciones, disposición espacial) en lugar de resumir genéricamente.
- Procesamiento de entrada visual como lista de imágenes (frames extraídos con ffmpeg), con `num_images` coincidente con el número de frames.
- Salida en inglés independientemente del idioma hablado en el clip.
- Capacidad de visión únicamente (sin audio): describe lo que se ve, no lo que se oye.
- Soporte de prompts abiertos de captioning; sigue mejor instrucciones libres que esquemas de salida rígidos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documenta capacidad multilingüe más allá del inglés.

## Casos de uso

- Catalogación automática de vídeos: el modelo genera descripciones textuales detalladas de clips para indexar y buscar contenido audiovisual en bibliotecas o archivos, aprovechando su tendencia a nombrar detalles concretos.
- Accesibilidad audiovisual: producción de descripciones textuales de vídeos para personas con discapacidad visual, ejecutándose localmente en Mac sin depender de servicios en la nube.
- Etiquetado de datasets de vídeo: generación de captions de referencia para conjuntos de datos de entrenamiento de otros modelos de visión-lenguaje, con extracción previa de frames mediante ffmpeg.
- Moderación y análisis de contenido visual: descripción de escenas para revisión humana posterior, útil en flujos donde se requiere entender qué aparece en un clip.
- Prototipado e investigación en Apple Silicon: evaluación de modelos de visión-lenguaje en hardware de consumo M-series mediante mlx-vlm, sin GPU NVIDIA, con tiempos de generación medidos (~15,8 s para 8 frames a 796×448 en M4 Pro de 24 GB).
- Análisis de vídeo en local con privacidad: procesamiento de clips sensibles en el propio dispositivo, evitando enviar contenido a infraestructura externa.
- Generación de metadatos para pipelines de medios: descripciones textuales asociadas a clips en sistemas de gestión de activos digitales (DAM), con la salvedad de que el modelo funciona mejor como captioner que como clasificador de esquemas rígidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor aporta una única medición de ejemplo, no un benchmark:

| Medicion | Valor |
|---|---|
| Entrada | 8 frames (796×448) de clip de 10,7 s |
| Hardware | Apple M4 Pro, 24 GB memoria unificada, macOS 15.7.2 |
| Versiones | Python 3.12.12, mlx 0.32.0, mlx-vlm 0.6.8 |
| Carga del modelo (en frío, excluida de la generación) | ~14 s |
| Generación (mediana de 3 ejecuciones en caliente) | 15,8 s (15,3 / 15,8 / 16,1) |
| Memoria pico | ~6,8 GB |
| Configuración | max_tokens=300 |
| Comparativa: 8 frames a 252×448 (clip vertical, misma máquina) | mediana de 5,5 s |

La resolución de los frames domina el tiempo de ejecución, no la duración del clip original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~6,8 GB de pico en la medición del autor con 8 frames a 796×448; los pesos ocupan ~5,64 GB.
- Hardware verificado: Apple M4 Pro con 24 GB de memoria unificada.
- Cabe en GPU de consumo Apple Silicon (M-series) con memoria unificada suficiente; no está pensado para GPU NVIDIA en este formato (para máxima calidad se recomienda usar los pesos bf16 originales en CUDA).
- Despliegue: mlx-vlm 0.7.12 (transformers 5.22.2) y 0.6.8, sobre macOS 15.7.2 con Python 3.12; requiere ffmpeg para extracción de frames.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia: ~15,8 s para 8 frames a 796×448 y ~5,5 s para 8 frames a 252×448 en M4 Pro; el rendimiento escala con la resolución y el número de frames.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tarsier2-Recap-7b-MLX-4bit (este) | 8,29 B | no disponible | MLX 4-bit | Apache-2.0 | Solo Apple Silicon, inglés, visión sin audio |
| omni-research/Tarsier2-Recap-7b | clase Qwen2-VL 7B | no disponible | bf16 (original) | Apache-2.0 | Modelo base sin cuantizar; máxima calidad en CUDA |
| Qwen2-VL 7B | ~7 B | no disponible | safetensors/GGUF (según distribución) | según distribución | Arquitectura subyacente; capacidades multimodales generales |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits sacrifica algo de fidelidad frente a los pesos bf16 originales; para máxima calidad debe usarse el checkpoint original en un dispositivo CUDA.
- Solo inglés: describe en inglés independientemente del idioma hablado en el clip.
- Solo visión, sin audio: no capta lo que se escucha.
- Preferir descripción libre frente a esquemas rígidos: funciona mejor como captioner que como clasificador de formatos estrictos.
- El detalle depende de la fuente: en clips de baja resolución o con objetos lejanos la calidad de la descripción se degrada.
- A 4 bits el modelo puede entrar en bucles de repetición; se recomienda `repetition_penalty=1.3`, `repetition_context_size=40` y `temperature=0.3` (en una prueba con 22 clips cortos, uno degeneró sin penalización y ninguno con ella).
- El decodificador de vídeo de mlx-vlm no es fiable para este modelo y puede producir salidas no relacionadas con el clip; hay que pasar frames extraídos con ffmpeg como lista de imágenes.
- El procedimiento completo de conversión no está incluido en el repositorio, lo que dificulta reproducir la build.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los habituales de los modelos de captioning.
- Uso comercial permitido por la licencia Apache-2.0, sujeta a las condiciones de la misma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/viavicdev/Tarsier2-Recap-7b-MLX-4bit
- Modelo base: https://huggingface.co/omni-research/Tarsier2-Recap-7b
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Clip de ejemplo (Wikimedia Commons, CC0): https://commons.wikimedia.org/wiki/File:Trains_-_Mini_World_Lyon.webm
