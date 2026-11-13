# storyteller-platform/citrinet512-zh

## Resumen

Citrinet 512 Chinese es un modelo de reconocimiento automático del habla (ASR) para chino mandarín, originalmente entrenado por NVIDIA y publicado en el catálogo NGC como `nvidia/stt_zh_citrinet_512`. La versión alojada en Hugging Face bajo el identificador `storyteller-platform/citrinet512-zh` es una conversión de ese modelo a los formatos ONNX y MLX (safetensors), realizada por el equipo de Storyteller para su integración en su plataforma de narración y sincronización de audio.

El modelo emplea la arquitectura Citrinet, una red convolucional de tipo Jasper con convoluciones separables en profundidad, compresión de canales y decodificación CTC. El sufijo "512" hace referencia al número de canales internos de la red. Su propósito es transcribir audio en chino mandarín a texto, y resulta relevante en el contexto de infraestructuras de transcripción autoalojadas que necesitan un modelo ligero, con licencia permisiva y ejecutable en CPU o GPU sin dependencias de frameworks pesados.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos del repositorio; no se han publicado detalles sobre el dataset de entrenamiento, los resultados de benchmarks ni las condiciones de uso comercial más allá de la licencia CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Citrinet (CNN tipo Jasper con convoluciones separables en profundidad, compresión de canales y decodificación CTC) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa ventanas de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino mandarín (`zh`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (`model.onnx`), config.json, vocab.txt |
| Front end | Mel filterbank y ventana NeMo incluidas en los pesos y en el ONNX |
| Tamaño del repositorio | 0,3 GB |
| Versión del modelo | 2.0.0 (registro de Storyteller) |
| Fecha de creación | 2026-11-13 |

## Arquitectura y entrenamiento

Citrinet es una familia de modelos ASR convolucionales derivada de Jasper. A diferencia de los transformers acústicos, sustituye la atención por apilamientos de bloques convolucionales con kernel dilatado, convoluciones separables en profundidad y compresión de canales (channel squeeze), lo que reduce el coste computacional manteniendo un campo receptivo amplio. La cabeza de salida es CTC (Connectionist Temporal Classification), lo que permite decodificar sin un modelo de lenguaje externo y sin alineamientos forzados.

El modelo original fue entrenado por NVIDIA y publicado en NGC como `nvidia/stt_zh_citrinet_512`. La versión de este repositorio se obtuvo convirtiendo la exportación ONNX de OpenVoiceOS (`OpenVoiceOS/stt_zh_citrinet_512_onnx`, revisión `bc6494babf36`). Según la model card, `model.safetensors` contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el filterbank mel y la ventana del front end de NeMo. `model.onnx` es la exportación con el front end mel insertado delante del encoder mediante `export-onnx.py`, de modo que acepta la señal pre-enfatizada y con padding reflectivo y calcula internamente las características y su longitud. El encoder no se modifica respecto al original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla en chino mandarín a partir de audio.
- Decodificación CTC sin necesidad de modelo de lenguaje externo.
- Inferencia en dos formatos: ONNX (con front end mel integrado) y MLX (safetensors con front end NeMo embebido).
- Procesamiento de audio con pre-énfasis y padding reflectivo gestionados por el propio modelo en la variante ONNX.
- Integración con la plataforma Storyteller mediante el instalador `ghost-story`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidades multilingües: únicamente chino mandarín según la información disponible.

## Casos de uso

- Transcripción de audiolibros y contenido narrado: el modelo puede convertir capítulos de audio en chino en texto alineado, integrándose en el pipeline de Storyteller para sincronizar narración y texto.
- Subtitulado automático de vídeo en mandarín: al ser un modelo CTC ligero, permite generar subtítulos con marcas temporales a partir del audio sin depender de servicios en la nube.
- Indexación y búsqueda de archivos de audio: transcribir grabaciones para permitir búsqueda por texto sobre archivos de voz en chino, útil en archivos periodísticos o bibliotecas de audio.
- Asistentes de voz autoalojados: servir como componente ASR en un pipeline local de reconocimiento de voz para aplicaciones de domótica o atención al cliente en mandarín, con la ventaja de la licencia CC-BY-4.0 y el formato ONNX para despliegue en CPU.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenido en chino, ejecutando el modelo ONNX en hardware modesto.
- Investigación en ASR convolucional: servir como referencia Citrinet 512 en chino para experimentos de comparación con modelos transformer o híbridos, gracias a la disponibilidad de pesos en safetensors y ONNX.
- Preprocesado de datasets de voz: transcripción masiva de corpus en mandarín para etiquetado automático antes de un ajuste fino posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo compacto apto para CPU.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se especifica, pero por el tamaño del repositorio (0,3 GB) es probable que quepa en cualquier GPU de consumo moderna; sin confirmación del autor.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX (formato `model.safetensors`), e integración mediante `ghost-story` en la plataforma Storyteller.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / ventana | Disponibilidad |
|---|---|---|---|---|---|---|
| storyteller-platform/citrinet512-zh | Citrinet 512 + CTC | Chino mandarín | ONNX, safetensors (MLX) | CC-BY-4.0 | no disponible | Hugging Face |
| nvidia/stt_zh_citrinet_512 | Citrinet 512 + CTC | Chino mandarín | NeMo (.nemo) | CC-BY-4.0 | no disponible | NGC |
| OpenVoiceOS/stt_zh_citrinet_512_onnx | Citrinet 512 + CTC | Chino mandarín | ONNX | CC-BY-4.0 | no disponible | Hugging Face |
| Whisper (large-v3) | Transformer encoder-decoder | Multilingüe (incl. chino) | safetensors, GGUF, ONNX | MIT | 30 s de audio por ventana | Hugging Face, OpenAI |

La comparativa se limita a los modelos de los que se dispone de información en el contexto; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en chino mandarín; no se garantiza su funcionamiento en otros dialectos o idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo ASR entrenado por NVIDIA, puede heredar sesgos acústicos y léxicos del corpus original (no especificado).
- Riesgo de alucinación: inherente a los modelos CTC, que pueden producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- No se especifican limitaciones de longitud de audio ni de contexto; el comportamiento con audios largos depende del pipeline de segmentación externo.
- Licencia CC-BY-4.0: permite uso comercial y modificación con atribución; es necesario citar a NVIDIA y a los conversores (Storyteller, OpenVoiceOS) según corresponda.
- El repositorio es una conversión, no el modelo original; la responsabilidad de la fidelidad de la conversión recae en los scripts `convert.py` y `export-onnx.py` del proyecto Storyteller.
- No se documentan garantías de calidad ni procesos de validación de la conversión en la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- [Hugging Face: storyteller-platform/citrinet512-zh](https://huggingface.co/storyteller-platform/citrinet512-zh)
- [Modelo original en NGC: nvidia/stt_zh_citrinet_512](https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_zh_citrinet_512)
- [Exportación ONNX de OpenVoiceOS](https://huggingface.co/OpenVoiceOS/stt_zh_citrinet_512_onnx)
- [Repositorio de Storyteller (GitLab)](https://gitlab.com/storyteller-platform/storyteller)
- [Scripts de conversión (libraries/mlx-audio/scripts)](https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts)
