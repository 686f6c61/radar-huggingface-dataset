# vladkens/gigaam-multilingual-large-ctc-gguf

## Resumen

GigaAM-Multilingual large-ctc en formato GGUF es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) `large_ctc` de la familia GigaAM-Multilingual, desarrollada por el equipo GigaAM de Sber (salute-developers). El modelo original es un Conformer de aproximadamente 585 millones de parámetros con una cabeza CTC a nivel de carácter, entrenado para transcribir audio en ruso, inglés, kazajo, kirguís y uzbeko. Esta ficha concreta, publicada por el usuario vladkens, empaqueta los pesos en un único fichero GGUF con cuantización Q8_0 de 712 MB, pensado para su uso con las herramientas wavo y transcribe.cpp.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR multilingüe de calidad en entornos ligeros mediante un runtime en C++ (transcribe.cpp), sin depender de frameworks de Python ni de GPU dedicadas. El modelo produce texto en minúsculas, sin puntuación, y deletrea los números como palabras. Está publicado bajo licencia MIT, igual que el modelo original.

Es importante señalar que esta no es una ficha de un modelo de lenguaje generativo: es un sistema de transcripción de voz, por lo que sus capacidades se limitan a la conversión de audio a texto y no incluye razonamiento, generación libre ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC a nivel de carácter |
| Parametros totales | 585.330.119 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con fragmentos de audio de hasta 25 s) |
| Tipos de cuantizacion | Q8_0 (única incluida en el repo) |
| Idiomas soportados | ruso (ru), inglés (en), kazajo (kk), kirguís (ky), uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `gigaam-multilingual-large-ctc-Q8_0.gguf`, 712 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer, una arquitectura que combina bloques de autoatención con convoluciones, diseñada específicamente para tareas de voz. Sobre la representación acústica se aplica una cabeza CTC (Connectionist Temporal Classification) que emite caracteres directamente, lo que permite alineamientos sin necesidad de un decodificador autorregresivo y favorece la eficiencia en inferencia. El modelo original tiene 585.330.119 parámetros según los pesos en safetensors.

El entrenamiento fue realizado por el equipo GigaAM de Sber; según la model card, los detalles de datos de entrenamiento, composición del corpus y precisión se documentan en el paper arXiv:2607.10371 y en la model card del modelo original. El modelo fue entrenado con fragmentos de audio de hasta 25 segundos, por lo que para audio más largo es necesario cortar en pausas (la herramienta wavo lo hace automáticamente). Esta conversión GGUF se generó con el script `convert-gigaam.py` de transcribe.cpp (PR #251) y se cuantizó a Q8_0 con `transcribe-quantize`; no se modificó el conversor respecto a la referencia.

## Capacidades

- Transcripción de voz a texto (ASR) en ruso, inglés, kazajo, kirguís y uzbeko.
- Salida en minúsculas y sin puntuación; los números se escriben como palabras.
- Alineamiento temporal a nivel de token (token times), según la model card de wavo.
- Procesamiento de audio de cualquier formato y frecuencia de muestreo mediante wavo (que remuestrea internamente); con transcribe.cpp se requiere WAV mono a 16 kHz.
- Ejecución en CPU mediante runtime en C++ (transcribe.cpp), sin dependencias de Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte audio en texto para actas o búsqueda posterior; al ser ligero (712 MB en Q8_0) puede ejecutarse en portátiles sin GPU, aunque requiere trocear el audio en segmentos de hasta 25 s cortando en pausas.
- Subtitulado automático de vídeo en ruso o inglés: la salida con tiempos por token permite generar subtítulos sincronizados, integrándose en pipelines de postproducción.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones telefónicas multilingües (ruso, kazajo, uzbeko) para extracción de métricas o auditoría de calidad, con despliegue en servidores sin acelerador.
- Dictado y notas de voz: integración en aplicaciones de escritorio o móviles mediante wavo, que acepta cualquier formato de audio y gestiona el troceado automático.
- Investigación lingüística en lenguas túrquicas: el soporte de kazajo, kirguís y uzbeko facilita la creación de corpus transcritos para idiomas con menos recursos.
- Procesamiento por lotes en CI/CD o servidores modestos: al ejecutarse con transcribe.cpp en CPU, puede encolarse la transcripción de archivos en segundo plano sin consumir VRAM de GPU.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos para indexación y búsqueda por texto en bibliotecas de audio o vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper arXiv:2607.10371 y a la model card del modelo original para datos de precisión, pero no incluye cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 712 MB; la inferencia puede ejecutarse en CPU sin VRAM dedicada. En GPU, basta con aproximadamente 1 GB de memoria para los pesos, más el margen del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o similar está sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3060 o superiores) e incluso en CPU.
- Opciones de despliegue: transcribe.cpp (`transcribe-cli`) y wavo (`wavo run`). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GigaAM-Multilingual large-ctc (GGUF, esta ficha) | 585 M | ru, en, kk, ky, uz | GGUF Q8_0 | MIT | Runtime C++ (transcribe.cpp/wavo) |
| ai-sage/GigaAM-Multilingual (original) | 585 M | ru, en, kk, ky, uz | PyTorch (safetensors/bin) | MIT | Pesos originales, requiere stack Python |
| Whisper large-v3 | no disponible en la información | multilingüe amplio | múltiples | MIT | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- Salida sin puntuación y en minúsculas: no debe esperarse texto formateado; los números se deletrean como palabras.
- Límite de segmento: entrenado con fragmentos de hasta 25 s; audio más largo debe cortarse en pausas para evitar degradación o errores.
- Solo cinco idiomas: ruso, inglés, kazajo, kirguís y uzbeko; el rendimiento en otros idiomas no está garantizado.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan métricas de robustez en esta ficha.
- No es un modelo generativo: no corrige gramática, no resume ni responde preguntas; cualquier postprocesado debe hacerse con herramientas externas.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base y del paper para atribuciones.
- Conversión de un tercero: esta ficha es una cuantización Q8_0 publicada por vladkens; la calidad depende del conversor de transcribe.cpp (PR #251) y del snapshot del modelo original.
- Solo se ofrece Q8_0: no hay variantes Q4 ni Q5 en el repo, lo que limita el ajuste fino entre tamaño y precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladkens/gigaam-multilingual-large-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Paper: https://arxiv.org/abs/2607.10371
- Repositorio GigaAM (Sber): https://github.com/salute-developers/GigaAM
- wavo: https://github.com/vladkens/wavo
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- PR de conversión en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/pull/251
