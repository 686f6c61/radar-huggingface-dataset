# Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2

## Resumen

Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2 es un modelo de reconocimiento automatico del habla (ASR) especializado en cantonés, desarrollado por el usuario Yvthyvq. Se trata de un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3-ASR-1.7B, orientado a una tarea muy concreta: transcribir audio en cantonés a romanizacion (concretamente, la ortografia romana del cantonés denominada Liujgoj / 溜歌粵語羅馬字, tambien referida como "romaji" en las etiquetas del repositorio).

El modelo resuelve un problema de nicho: la mayoria de sistemas ASR transcriben cantonés a caracteres chinos, pero existen comunidades y proyectos que necesitan la salida en romanizacion fonetica. Este ajuste proporciona esa conversion directamente desde el audio, sin pipeline intermedio de conversion caracteres-romanizacion, lo que evita errores acumulados.

Con 2.038.052.480 parametros (aproximadamente 1.700 millones declarados en el nombre y 2.000 millones reales en los pesos safetensors), licencia Apache 2.0 y un conjunto de entrenamiento de unas 40 horas de audio (48.466 pares audio-romanizacion), es un modelo compacto y desplegable en hardware modesto. Su relevancia actual radica en la escasez de recursos ASR para variedades linguisticas minorizadas y para formatos de salida no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Qwen3-ASR-1.7B; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la model card advierte que audios de mas de 30 segundos pueden truncarse) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | zh (chino) y yue (cantonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 12,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B, un modelo ASR de la familia Qwen3, y se ha sometido a un ajuste fino completo (todos los parametros) sobre datos especificos de cantonés. El entrenamiento se realizo con 48.466 pares de audio y transcripcion en romanizacion, lo que equivale a aproximadamente 40 horas de voz. Se ejecutaron 3 epocas con un lote de 8 y acumulacion de gradientes de 4 (lote efectivo de 32), tasa de aprendizaje 2e-5, optimizador AdamW y precision bfloat16. El entrenamiento completo duro aproximadamente 2 horas y 30 minutos en una unica GPU NVIDIA A800 de 80 GB.

Una particularidad tecnica relevante es el formato de salida forzado durante el entrenamiento: el modelo genera la secuencia `language Chinese<asr_text>` seguida de la transcripcion en romanizacion. Este prefijo actua como etiqueta de idioma y delimitador de tarea, y debe tenerse en cuenta al integrar el modelo en produccion (conviene truncar o parsear esa parte). No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO; el ajuste parece ser puramente supervisado sobre pares audio-texto.

## Capacidades

- Transcripcion de voz en cantonés a romanizacion Liujgoj (romanizacion del cantonés), directamente desde audio.
- Generacion de la etiqueta de idioma y delimitador en la salida (`language Chinese<asr_text>...`), lo que permite un parseo sencillo.
- Manejo de audio de hasta aproximadamente 30 segundos por segmento sin truncamiento garantizado (la model card advierte de posibles perdidas en audios mas largos).
- Reconocimiento de habla en chino (zh) y cantonés (yue) segun los metadatos del repositorio, aunque el ajuste esta orientado especificamente al cantonés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla del ASR.
- Capacidad multilingue limitada: el modelo esta especializado en cantonés y su rendimiento en otras lenguas o formatos de transcripcion puede ser deficiente, segun la propia model card.

## Casos de uso

- Transcripcion de archivos de audio en cantonés para proyectos de documentacion linguistica: el modelo convierte directamente el habla en romanizacion Liujgoj, lo que facilita la anotacion fonetica sin pasar por caracteres chinos.
- Generacion de subtitulos en romanizacion para contenido audiovisual en cantonés: util para creadores que publican material con transcripcion fonetica o para herramientas de accesibilidad en comunidades que usan esta ortografia.
- Creacion de corpus paralelos audio-romanizacion: el modelo puede preanotar grandes volumenes de audio (segmentando en trozos de menos de 30 segundos) para su posterior revision humana, acelerando la construccion de datasets.
- Aplicaciones de aprendizaje de cantonés: integrado en una app educativa, el modelo permite al estudiante comparar su pronunciacion con la romanizacion generada, sirviendo como herramienta de retroalimentacion fonetica.
- Investigacion en ASR de lenguas minorizadas: al ser un ajuste fino completo sobre un modelo base abierto y con licencia Apache 2.0, sirve como punto de partida reproducible para experimentos con otras variedades o sistemas de romanizacion.
- Procesamiento por lotes de archivos de audio en servidores modestos: con aproximadamente 2.000 millones de parametros y pesos en bfloat16, el modelo cabe en GPUs de consumo con suficiente VRAM (por ejemplo, 24 GB), lo que permite desplegarlo en estaciones de trabajo sin infraestructura de centro de datos.
- Integracion en pipelines de transcripcion de reuniones o entrevistas en cantonés: segmentando el audio en ventanas de menos de 30 segundos y concatenando las salidas romanizadas, se obtiene una transcripcion fonetica util para busqueda y analisis textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones tituladas "性能表現" (rendimiento) y "與其他模型對比" (comparacion con otros modelos), pero su contenido aparece vacio en la informacion proporcionada. No se deben asumir cifras de WER ni comparaciones no documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12,2 GB en el repositorio (probablemente en bfloat16 o float16); se requiere al menos esa cantidad de VRAM mas el overhead de activaciones y del procesador de audio. Una estimacion conservadora es de 14 a 18 GB en precision nativa.
- GPU recomendadas: NVIDIA A800 80 GB (usada en entrenamiento), A100, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090). En tarjetas de 16 GB podria requerir cuantizacion, aunque no se documentan variantes cuantizadas oficiales.
- Opciones de despliegue: la model card indica la instalacion del paquete `qwen-asr` (`pip install -U qwen-asr`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo ASR con arquitectura especifica, la compatibilidad con esos motores genericos no esta garantizada.
- Latencia y throughput: no disponibles. El entrenamiento de 3 epocas sobre 40 horas de audio en una A800 duro 2,5 horas, lo que da una idea de la velocidad de proceso en entrenamiento, pero no se aportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma/foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2 (este) | 2.038.052.480 | no disponible | Cantonés a romanizacion Liujgoj | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (base) | no disponible (familia 1.7B) | no disponible | ASR multilingue generico | no disponible en la informacion | Hugging Face |
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1 | no disponible | no disponible | Cantonés a romanizacion Liujgoj (version previa) | Apache 2.0 | Hugging Face |
| Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR-V2 | no disponible (familia 7B) | no disponible | Cantonés a romanizacion Liujgoj | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos encontrados en la busqueda web, todos ellos del mismo autor o de la familia base. No se dispone de datos de rendimiento (WER) para establecer comparaciones cuantitativas con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en transcripcion de cantonés a romanizacion Liujgoj; su rendimiento en otras lenguas o en transcripcion a caracteres chinos puede ser deficiente.
- La salida incluye siempre el prefijo `language Chinese<asr_text>`, que debe parsearse o eliminarse en produccion.
- Audios de mas de 30 segundos pueden sufrir truncamiento o perdida de palabras; se recomienda segmentar la entrada.
- La precision depende de la calidad del audio, el ruido de fondo y la velocidad del habla, segun la propia model card.
- Riesgo de alucinacion y de errores de transcripcion inherente a los modelos ASR, especialmente en audio ruidoso o con acentos no representados en el conjunto de entrenamiento (48.466 pares, unas 40 horas, un volumen relativamente pequeno).
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset personalizado no publico, la representatividad de voces, edades y registros es desconocida.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda citar el modelo base Qwen3-ASR segun indica el autor.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; conviene evaluarlo en el dominio propio antes de usarlo en produccion.
- No se documentan variantes cuantizadas ni soporte en motores de inferencia estandar, lo que puede complicar el despliegue en entornos con restricciones de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2
- Version previa V1: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1
- Variante basada en Qwen2.5-Omni 7B: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen2.5-Omni-7B-ASR-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
