# storyteller-platform/citrinet1024-uk

## Resumen

Citrinet 1024 Ukrainian es un modelo de reconocimiento automático del habla (ASR) para ucraniano, desarrollado originalmente por NVIDIA y redistribuido por storyteller-platform a través de su registro de modelos. La arquitectura Citrinet es una red neuronal convolucional de tipo CTC (Connectionist Temporal Classification) con 1024 canales, diseñada específicamente para transcripción de voz a texto con un front end de mel-spectrograma integrado. El repositorio aloja la versión 2.0.0 del modelo en dos formatos: ONNX y MLX, con el objetivo de integrarlo en la plataforma Storyteller mediante ghost-story.

El modelo no es un LLM ni un transformer generativo: es un sistema ASR convolucional que convierte señal de audio en texto. Su relevancia radica en que ofrece una alternativa ligera y de licencia permisiva (CC-BY-4.0) para transcripción en ucraniano, un idioma con menor cobertura en herramientas ASR comerciales. El repositorio tiene un tamaño de 1,1 GB y no registra descargas ni likes en el momento de la consulta.

La información disponible es limitada: no se especifican parámetros totales, longitud de contexto (concepto no aplicable a ASR), ni resultados de benchmarks. La model card se centra en la procedencia y el proceso de conversión, no en las capacidades del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (CNN con CTC, 1024 canales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (segun nombre del modelo y procedencia NVIDIA) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional de NVIDIA para reconocimiento de voz, basada en el paradigma CTC. El modelo emplea 1024 canales en sus capas convolucionales y un front end de mel-spectrograma con ventana y filtros incluidos en el propio artefacto. El entrenamiento original fue realizado por NVIDIA (checkpoint `stt_uk_citrinet_1024_gamma_0_25`), con el parámetro gamma 0.25 asociado a la estrategia de decodificación o pérdida. No se dispone de información sobre el número de tokens de audio, composición del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino posteriores.

El repositorio de storyteller-platform no entrena el modelo, sino que lo convierte. La versión ONNX integra el front end de mel en el grafo (`export-onnx.py`), de modo que acepta la señal pre-enfatizada y con padding reflectivo, y calcula internamente las características y su longitud. La versión MLX almacena los pesos del encoder en el layout esperado por el cargador de MLX, junto con el filtro mel y la ventana del front end de NeMo. El vocabulario (`vocab.txt`) y el modelo SentencePiece (`tokenizer.spm`) provienen del checkpoint original de NeMo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en ucraniano mediante CTC.
- Procesamiento de audio con front end de mel-spectrograma integrado (en la variante ONNX).
- Ejecución en dos runtimes: ONNX Runtime (formato `model.onnx`) y MLX (formato `model.safetensors`, orientado a Apple Silicon).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No es un modelo generativo de texto: no produce respuestas conversacionales.
- Capacidad multilingüe limitada al ucraniano según la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas en ucraniano: el modelo convierte audio en texto para actas o subtítulos, adecuado por su naturaleza CTC y su licencia permisiva para integración en productos.
- Subtitulado automático de vídeo: al ser un modelo ASR ligero (1,1 GB en el repo), puede desplegarse en pipelines de generación de subtítulos para contenido en ucraniano.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de audio para indexación y búsqueda textual en mediatecas ucranianas.
- Integración en la plataforma Storyteller: el modelo se instala mediante ghost-story y se usa como motor ASR dentro de ese ecosistema, con formatos ONNX y MLX listos para su cargador.
- Procesamiento en local en Apple Silicon: la variante MLX permite ejecutar la transcripción en dispositivos con chip Apple sin depender de servicios en la nube.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible (pesos, tokenizer y scripts de conversión públicos) para experimentos con ucraniano.
- Atención al cliente en ucraniano: transcripción de llamadas o mensajes de voz para su posterior análisis o enrutamiento, siempre que se combine con un sistema de gestión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (1,1 GB) sugiere un modelo de tamaño moderado, pero no se especifican parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible. Al ser un modelo convolucional Citrinet, es probable que quepa en GPUs de consumo, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX (formato `model.safetensors`, Apple Silicon). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR CTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 1024 Ukrainian (este) | Citrinet CTC, 1024 canales | Ucraniano | CC-BY-4.0 | ONNX, safetensors (MLX) | Hugging Face, GitLab |
| nvidia/stt_uk_citrinet_1024_gamma_0_25 | Citrinet CTC, 1024 canales | Ucraniano | CC-BY-4.0 | NeMo checkpoint | NGC, Hugging Face |
| OpenVoiceOS/stt_uk_citrinet_1024_gamma_0_25_onnx | Citrinet CTC, 1024 canales | Ucraniano | CC-BY-4.0 (heredada) | ONNX | Hugging Face |

Los tres modelos comparten el mismo origen (NVIDIA) y arquitectura; las diferencias están en el empaquetado y los formatos de despliegue. No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre ucraniano; no se ha verificado soporte de otros idiomas.
- No es un modelo generativo: no puede usarse para chat, razonamiento ni generación de código.
- Riesgo de errores de transcripción (WER) no cuantificado: no hay benchmarks publicados en la información disponible.
- Sesgos acústicos y dialectales desconocidos: no se documenta la composición del dataset de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y respetar los términos de la licencia.
- El repositorio es un espejo de terceros (storyteller-platform), no el canal oficial de NVIDIA; la versión 2.0.0 puede divergir del checkpoint original.
- No hay descargas ni validación comunitaria registrada (0 descargas, 0 likes), lo que reduce la evidencia de uso en producción.
- Los scripts de conversión (`convert.py`, `export-onnx.py`) están en GitLab y no se incluyen en el repo de Hugging Face; la reproducibilidad depende de ese enlace externo.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet1024-uk
- Checkpoint original NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_uk_citrinet_1024_gamma_0_25
- Checkpoint NVIDIA en Hugging Face: https://huggingface.co/nvidia/stt_uk_citrinet_1024_gamma_0_25
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_uk_citrinet_1024_gamma_0_25_onnx
- Repositorio Storyteller en GitLab: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet1024-uk
- Scripts de conversión (mlx-audio): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
