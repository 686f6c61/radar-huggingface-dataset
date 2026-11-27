# tencent/WeMM-Video-35BA3B-GGUF

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal abierto desarrollado por Tencent para la comprensión y el razonamiento conjuntos de audio y vídeo. Forma parte de la familia WeMM-Video, que acepta texto, imágenes, audio y vídeo como entradas y genera respuestas en texto. El repositorio aquí descrito es la variante cuantizada en GGUF (receta Q4_K_M) del modelo base `tencent/WeMM-Video-35BA3B`, empaquetada para el runtime nativo de WeMM.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y aproximadamente 3B parámetros activos por token, de ahí el sufijo A3B. Esta configuración busca ofrecer la capacidad de un modelo grande con el coste de inferencia de uno mucho más pequeño, lo que resulta especialmente relevante para cargas de trabajo de vídeo, donde el número de tokens de entrada crece rápidamente con los fotogramas procesados.

Su relevancia actual radica en que combina comprensión audiovisual nativa con licencia Apache 2.0 y pesos cuantizados de 4 bits, lo que facilita el despliegue en infraestructura propia. El bundle GGUF incluye tres componentes separados (modelo de lenguaje, codificador visual y codificador de audio) que deben mantenerse en la misma revisión del Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal; etiqueta `wemm_qwen3_5_moe` |
| Parametros totales | 35B (según denominación); 1.070.382.088 en el tensor de safetensors reportado |
| Parametros activos | ~3B (sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores de atención y entrada/salida seleccionados en BF16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (language.gguf, mmproj.gguf, audio.gguf) |

## Arquitectura y entrenamiento

WeMM-Video-35B-A3B es un modelo MoE multimodal etiquetado como `wemm_qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen 3.5 con enrutamiento por expertos. El modelo integra tres componentes diferenciados: un modelo de lenguaje con tokenizador y plantilla de chat, un codificador visual con su proyector y un codificador de audio con su proyector. Esta separación modular es la que se refleja en los tres ficheros GGUF del bundle.

El modelo acepta entradas de texto, imagen, audio y vídeo (con o sin pista de sonido) y genera respuestas textuales. Dispone de dos modos de operación, thinking e instruct, con parámetros de muestreo recomendados distintos para cada modalidad y tipo de entrada. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Comprensión audiovisual conjunta: procesa vídeo con su pista de audio original para describir escenas y resumir el habla de forma simultánea.
- Comprensión de vídeo silencioso mediante extracción de fotogramas (`--video`).
- Comprensión de imágenes individuales (descripción, razonamiento visual).
- Transcripción y comprensión de audio (`--audio`).
- Razonamiento multimodal en modo thinking, con cadenas de razonamiento antes de la respuesta.
- Generación de texto y razonamiento general en modo instruct.
- Capacidades multilingües limitadas a inglés y chino.
- Procesamiento de vídeo con control del número de fotogramas (`--max-frames`).

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar la pista de audio y los fotogramas de una grabación para generar resúmenes de lo tratado y transcripciones, combinando ambas modalidades en una sola pasada.
- Indexación y búsqueda de archivos audiovisuales: descripciones automáticas de escenas y del habla permiten construir metadatos para motores de búsqueda sobre grandes videotecas.
- Moderación de contenido en vídeo: detección de escenas y discurso relevantes mediante descripciones generadas, útil en plataformas con volumen alto de subidas.
- Accesibilidad: generación de descripciones de escenas y subtítulos a partir de la pista de audio para contenido en inglés o chino.
- Asistentes sobre documentación visual: respuesta a preguntas sobre imágenes y capturas de pantalla, con razonamiento en modo thinking para casos complejos.
- Transcripción y análisis de grabaciones de audio: reuniones, entrevistas o notas de voz en inglés o chino.
- Despliegue en infraestructura propia: al estar cuantizado en Q4_K_M y disponible en GGUF, puede ejecutarse con el runtime nativo de WeMM sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la sección de evaluación del modelo base (`tencent/WeMM-Video-35BA3B`) para la comparativa del informe técnico.

## Requisitos de hardware

- Tamaño del bundle: 27,3 GB en el repositorio; los ficheros suman aproximadamente 25,4 GiB (22,61 GiB de lenguaje + 0,84 GiB de visión + 1,99 GiB de audio).
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del bundle, se requiere al menos el espacio equivalente en memoria o VRAM para cargar los tres componentes.
- GPU recomendadas: no disponible. El runtime nativo documenta soporte de offload a CUDA.
- Ejecución en CPU: el runtime nativo de WeMM dispone de una instalación CPU (`native/install-cpu`) validada por el autor para generación de texto, imagen, audio y vídeo.
- Opciones de despliegue: runtime nativo de WeMM (`native/run_hf.py`), con descarga automática de los tres componentes desde el Hub y posibilidad de fijar revisión con `--revision`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WeMM-Video-35B-A3B (GGUF Q4_K_M) | 35B totales / ~3B activos | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se declara soporte para castellano ni otras lenguas.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede producir descripciones o transcripciones inexactas, especialmente con audio de baja calidad o vídeo con movimiento rápido.
- Contexto: la longitud de contexto no está especificada; el número de fotogramas procesables está limitado por `--max-frames` y por la ventana del modelo.
- Dependencia del runtime: el bundle está empaquetado para el runtime nativo de WeMM; no se garantiza su funcionamiento con otros motores GGUF genéricos.
- Integridad del bundle: los tres ficheros GGUF deben mantenerse en la misma revisión del Hub; mezclar revisiones puede romper la inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero los componentes de terceros incluidos quedan sujetos a sus propias condiciones, según indica el autor.
- Sin datos de benchmarks publicados en esta ficha: la evaluación debe consultarse en el modelo base antes de adoptarlo en producción.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
- Colección WeMM-Video en Hugging Face: https://huggingface.co/collections/tencent/wemm-video
