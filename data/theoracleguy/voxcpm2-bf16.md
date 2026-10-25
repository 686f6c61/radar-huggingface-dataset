# theoracleguy/VoxCPM2-bf16

## Resumen

VoxCPM2-bf16 es una conversión a formato MLX del modelo de texto-a-habla openbmb/VoxCPM2, publicada por el usuario theoracleguy. Se trata de un modelo TTS multilingüe de aproximadamente 2.000 millones de parámetros que genera audio a 48 kHz y que incorpora dos capacidades diferenciales frente a un TTS clásico: clonación de voz a partir de una referencia de audio corta y diseño de voz a partir de una descripción textual, sin necesidad de audio de referencia. El modelo base lo desarrolla OpenBMB y se distribuye con licencia Apache 2.0.

La relevancia de esta ficha concreta es de infraestructura: no aporta pesos nuevos ni un entrenamiento propio, sino la traducción de los pesos originales al framework MLX de Apple para poder ejecutar el modelo en Apple Silicon (Macs con chip M1/M2/M3/M4). El repositorio contiene los pesos en BFloat16 a precisión completa, que según la model card ocupan 4,96 GB y ofrecen el mayor factor de calidad de la familia, a costa de ser la variante más lenta (RTF 0,48x en la tabla del autor).

El interés práctico es acotado pero claro: permite probar y desplegar un TTS de 2B con clonación y diseño de voz en local sobre hardware de Apple, sin GPU NVIDIA ni servicios en la nube, y con licencia Apache 2.0 que facilita el uso comercial. Conviene señalar desde el principio que el repositorio tiene 0 descargas y 0 likes, que su model card es una adaptación de la de la variante de mlx-community y que los resultados de la búsqueda web no aportaron ninguna fuente técnica adicional sobre el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de texto-a-habla de 2B parámetros; la model card no detalla la arquitectura interna) |
| Parámetros totales | ~2B (heredado de openbmb/VoxCPM2) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 en este repositorio; existen variantes 8-bit y 4-bit documentadas en la tabla de rendimiento |
| Idiomas soportados | 30 idiomas, entre ellos inglés (en), chino (zh), indonesio (id), japonés (ja) y coreano (ko); el resto no se enumera |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), precisión BFloat16; librería mlx-audio |
| Frecuencia de muestreo de salida | 48 kHz |
| Modos de generación | Zero-shot, continuación, clonación por referencia y modo combinado (4 modos) |
| Tamaño del repositorio | 1,2 GB según HuggingFace; 4,96 GB según la tabla de la model card (dato contradictorio, ver limitaciones) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. La model card se limita a identificarlo como un modelo TTS multilingüe de 2B parámetros con salida a 48 kHz, cuatro modos de generación y soporte de clonación y diseño de voz. No se especifica si el backbone es un transformer autorregresivo, un modelo de difusión, un esquema híbrido ni qué tipo de tokenizador o decoder acústico emplea. Tampoco se detallan los datos de entrenamiento: no hay cifra de horas de audio, número de tokens, composición del corpus ni indicación de si hubo ajuste por RLHF o DPO. Todo ello debe consultarse en la model card del modelo base.

Lo que sí documenta esta conversión es la interfaz de inferencia, que revela parte del funcionamiento: el parámetro `inference_timesteps` (7 en los ejemplos) sugiere un proceso de generación iterativo por pasos, y `cfg_value` (2,0 en los ejemplos) indica classifier-free guidance, un esquema habitual en modelos generativos de audio. La conversión a MLX la realiza la herramienta mlx-audio, que traduce los tensores del checkpoint original de PyTorch al formato de Apple. No hay ninguna innovación técnica atribuible a esta publicación: es un port de pesos, sin reentrenamiento ni fine-tuning adicional sobre el modelo base, tal como refleja la etiqueta `base_model:finetune:openbmb/VoxCPM2` del repositorio.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas, con cobertura confirmada de inglés, chino, indonesio, japonés y coreano.
- Salida de audio a 48 kHz, orientada a calidad de estudio.
- Clonación de voz zero-shot a partir de una referencia de audio corta más su texto transcrito (`--ref_audio` y `--ref_text`).
- Diseño de voz mediante descripción en lenguaje natural (`--instruct`), por ejemplo "A young woman, gentle and sweet voice", sin necesidad de audio de referencia.
- Cuatro modos de generación: zero-shot, continuación de audio existente, clonación por referencia y modo combinado.
- Control de la calidad y el coste computacional mediante el número de pasos de inferencia (`inference_timesteps`) y la escala de guidance (`cfg_value`).
- Generación por streaming: la API de Python devuelve resultados iterables con la duración de audio de cada fragmento.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada como ASR ni transcripción.

## Casos de uso

- Audiolibros y contenido editorial narrado: el modelo puede generar horas de narración con una voz consistente diseñada por descripción textual, sin depender de un locutor, y la salida a 48 kHz evita el recorte de agudos típico de TTS a 22 o 24 kHz.
- Doblaje y localización de vídeo: al soportar 30 idiomas y clonación por referencia, permite mantener el timbre del actor original en la versión doblada de un mismo contenido, generando pistas de audio por idioma desde un único guion traducido.
- Prototipado de asistentes de voz en local sobre Mac: un desarrollador puede iterar sobre guiones y voces en un MacBook sin GPU dedicada ni coste por API, usando los ejemplos de CLI de mlx-audio directamente desde la terminal.
- Diseño de voces para videojuegos y personajes: el modo de voice design permite generar variantes de una voz (edad, género percibido, carácter) escribiendo descripciones, lo que agiliza la preproducción antes de contratar actores finales.
- Accesibilidad y lectura en voz alta: integración en aplicaciones de lectura de documentos o interfaces para personas con discapacidad visual, con la ventaja de que el procesamiento es enteramente local y no envía el texto a un tercero.
- Generación de datos sintéticos de voz para entrenar o evaluar modelos ASR: producción masiva de pares audio-transcripción en varios idiomas con voces controladas, siempre que se respete la licencia y las salvaguardas sobre clonación.
- Mensajería de voz e IVR: pregeneración de avisos y respuestas de atención telefónica en varios idiomas a partir de plantillas de texto, con la voz corporativa clonada una sola vez desde una referencia corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un modelo TTS, ni métricas de calidad de audio habituales en el dominio (MOS, WER del audio sintetizado, similitud de locutor). El único dato cuantitativo de rendimiento es el Real-Time Factor medido en Apple Silicon por el autor:

| Variante | Tamaño | RTF (7 pasos) |
|---|---|---|
| bf16 (este repositorio) | 4,96 GB | 0,48x |
| 8-bit | 3,23 GB | 0,85x |
| 4-bit | 2,30 GB | 0,90x |

La model card define RTF como ">1.0 = más rápido que tiempo real", lo que implica que las tres variantes son más lentas que el tiempo real en el hardware de referencia, y que bf16 es aproximadamente la mitad de rápida que la cuantización 8-bit. No se especifica en qué chip se midió ni si la medición es por fragmento o sobre la generación completa.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. El repositorio usa la librería mlx-audio y el framework MLX, por lo que no hay ruta de ejecución en CUDA ni en CPU x86 con esta conversión.
- Memoria unificada estimada: unos 5 GB para los pesos bf16 (4,96 GB declarados), más overhead del runtime y del buffer de audio; las variantes 8-bit y 4-bit bajan a 3,23 GB y 2,30 GB respectivamente. Cabe en cualquier Mac con 16 GB de memoria unificada; los 8 GB son ajustados para bf16.
- GPU recomendadas: no se especifican modelos concretos. El autor reporta métricas "en Apple Silicon" sin detallar chip; no hay datos para A100, H100 ni RTX 4090 porque la ruta MLX no las soporta.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de un Mac de consumo; no hay soporte para GPU de consumo NVIDIA en esta conversión.
- Opciones de despliegue: `mlx-audio` como librería y su CLI (`python -m mlx_audio.tts.generate`), más la API de Python `mlx_audio.tts.load_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,48x en bf16 con 7 pasos de inferencia, es decir, aproximadamente el doble del tiempo real. Las variantes cuantizadas mejoran hasta 0,85x y 0,90x. El coste escala con `inference_timesteps`; bajar el número de pasos reduce el tiempo a costa de calidad, aunque no se documenta la curva.

## Comparativa con modelos similares

La información disponible solo permite comparar esta conversión con las otras variantes del mismo modelo base; no hay datos de otras familias TTS (por ejemplo XTTS, Kokoro o F5-TTS) en el material proporcionado.

| Modelo | Framework | Parámetros | Contexto | Tamaño | RTF | Licencia | Plataforma |
|---|---|---|---|---|---|---|---|
| theoracleguy/VoxCPM2-bf16 (esta ficha) | MLX (mlx-audio) | ~2B | No disponible | 4,96 GB (card) / 1,2 GB (repo) | 0,48x | Apache 2.0 | Apple Silicon |
| VoxCPM2 8-bit (mlx-community) | MLX | ~2B | No disponible | 3,23 GB | 0,85x | Apache 2.0 | Apple Silicon |
| VoxCPM2 4-bit (mlx-community) | MLX | ~2B | No disponible | 2,30 GB | 0,90x | Apache 2.0 | Apple Silicon |
| openbmb/VoxCPM2 (original) | PyTorch | ~2B | No disponible | No disponible | No disponible | Apache 2.0 | GPU NVIDIA / CPU |

La comparación con otras familias de TTS queda como no disponible: la búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre VoxCPM2 ni sobre alternativas.

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con 15 segundos de diferencia, lo que sugiere una publicación automatizada o de prueba. No hay evidencia de que los pesos hayan sido verificados más allá de la conversión.
- Inconsistencia en el tamaño: HuggingFace reporta 1,2 GB de repositorio, mientras que la tabla de la model card atribuye 4,96 GB a la variante bf16. Puede tratarse de un LFS mal contabilizado o de que el repositorio no contenga realmente los pesos completos; conviene verificar los ficheros antes de confiar en el despliegue.
- Ejemplos de uso desalineados: los comandos de la model card apuntan a `mlx-community/VoxCPM2-bf16`, no a `theoracleguy/VoxCPM2-bf16`. Es necesario sustituir el identificador para usar este repositorio.
- Dependencia total del modelo base: no se documentan datos de entrenamiento, composición del corpus, arquitectura ni procesos de alineación. Cualquier evaluación de sesgos o de calidad debe hacerse sobre openbmb/VoxCPM2.
- Sesgos: no disponibles. Al no publicarse la composición del dataset, no se puede caracterizar la representación de acentos, géneros, edades o variedades dialectales dentro de los 30 idiomas declarados.
- Riesgo de alucinación en el sentido específico del TTS: pronunciación incorrecta, omisión o repetición de fragmentos del texto, y artefactos prosódicos en textos largos o con nombres propios y números. No hay métricas de WER de audio publicadas que permitan acotarlo.
- Clonación de voz y suplantación: la capacidad de clonar con una referencia corta habilita deepfakes de voz. Aunque la licencia Apache 2.0 permite uso comercial, es imprescindible obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable (RGPD y el Reglamento europeo de IA, que clasifica la síntesis de voz como sistema de riesgo limitado con obligación de transparencia).
- Restricción de plataforma: la licencia es permisiva, pero la implementación solo funciona en Apple Silicon. No es una opción para infraestructura en la nube basada en NVIDIA, y la variante bf16 es la más lenta de la familia.
- Ausencia de benchmarks: no hay MOS, similitud de locutor ni comparación objetiva con otros TTS, por lo que la afirmación de "calidad de estudio" a 48 kHz no está respaldada por mediciones publicadas.
- Idiomas: se declaran 30, pero solo 5 están enumerados. El resto no está identificado y no hay información sobre calidad relativa por idioma.
- Sin datos de latencia en hardware concreto ni de consumo de memoria pico durante la inferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/theoracleguy/VoxCPM2-bf16
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Librería de conversión e inferencia mlx-audio: https://github.com/Blaizzy/mlx-audio
- Variante de referencia en la model card: https://huggingface.co/mlx-community/VoxCPM2-bf16
- Paper, blog o demo oficial: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre el modelo; los resultados obtenidos eran ajenos al ámbito y se han descartado.
