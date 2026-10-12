# TakeboxLLM/tinydiarize-saying

## Resumen

`TakeboxLLM/tinydiarize-saying` es un repositorio de HuggingFace que aloja una conversión a formato ggml del modelo `small.en-tdrz`, un Whisper `small.en` de OpenAI afinado para detección de turnos de palabra (diarización ligera). No es un modelo de lenguaje generativo: es un modelo de reconocimiento automático del habla (ASR) en inglés que, además de transcribir, marca los cambios de hablante dentro del audio. El autor del repositorio es la cuenta TakeboxLLM, y el trabajo original procede del proyecto tinydiarize de Akash Mahajan, disponible en GitHub.

El modelo parte del checkpoint `small.en` de Whisper (≈244 M de parámetros) y añade un token especial de cambio de turno que el decodificador emite cuando detecta que habla otra persona. El resultado se distribuye como un único fichero ggml de 466 MB, pensado para ejecutarse con whisper.cpp en CPU o GPU sin necesidad de PyTorch. La licencia declarada es MIT, tanto en este repositorio como en los modelos Whisper originales.

Su relevancia práctica es concreta: cubre el hueco entre la transcripción plana y la diarización completa basada en embeddings de hablante. No identifica quién es cada persona (no etiqueta "hablante 1" frente a "hablante 2"), pero sí señala dónde termina un turno y empieza otro, con timestamps por palabra, a un coste computacional de un modelo `small` y sin dependencias externas pesadas. El repositorio no registra descargas ni likes, y la model card se limita a la información de conversión y al hash SHA del fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI) |
| Parametros totales | ~244 M (modelo base Whisper `small.en`; cifra no indicada en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (1500 fotogramas mel, 80 canales); secuencia de decodificacion de hasta 448 tokens |
| Tipos de cuantizacion | El repo publica un unico fichero ggml en f16 (~466 MB). whisper.cpp permite generar cuantizaciones q4_0, q5_0, q8_0 a partir de el (no confirmado por el autor) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | MIT |
| Formato de pesos | ggml (un fichero `small.en-tdrz` de 466 MB, SHA `ceac3ec06d1d98ef71aec665283564631055fd6129b79d8e1be4f9cc33cc54b4`) |

Otros datos del repositorio: tamano de 0,5 GB, creado y actualizado el 2026-10-12 segun el registro de HuggingFace, 0 descargas y 0 likes. Pipeline declarado: no disponible.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con normalización previa, embeddings convolucionales sobre el espectrograma mel y codificación posicional sinusoidal. El encoder procesa la ventana de 30 segundos de audio (1500 posiciones) y el decoder genera texto de forma autorregresiva. El modelo base `small.en` tiene 12 capas de encoder y 12 de decoder, con `d_model` de 768 y 12 cabezas de atención. La variante `tdrz` no modifica esa topología: se obtiene por ajuste fino del `small.en` con datos etiquetados con fronteras de turno y la introducción de un token de cambio de turno en el vocabulario del decoder.

No se especifican en la model card el número de tokens de audio usados en el ajuste fino, la composición del dataset de diarización ni si se aplicaron técnicas de alineación por RLHF o DPO (no aplicables en este caso, al ser una tarea de ASR supervisada). El autor del repositorio tampoco documenta detalles del proceso de conversión más allá de indicar que se usaron los scripts de whisper.cpp. La innovación técnica del proyecto original es precisamente el token de turno: el modelo puede emitir, junto a los timestamps por palabra, una marca que indica el cambio de hablante, con un coste de inferencia prácticamente idéntico al del Whisper `small.en` estándar.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Timestamps a nivel de palabra, útiles para subtítulos y alineación fina.
- Detección de cambios de turno de palabra (diarización ligera de tipo "turn detection"), sin identificación de hablantes concretos.
- Detección automática de idioma: no aplica, es un modelo solo-inglés.
- Traducción a inglés: no soportada en esta variante (los checkpoints `.en` no traducen).
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multimodales: únicamente audio como entrada; no procesa imagen ni vídeo.
- Modo "thinking": no disponible.
- Ejecución local sin dependencias de Python ni PyTorch, al estar en formato ggml.

## Casos de uso

- Transcripción de reuniones con separación de turnos: el modelo genera la transcripción y marca cuándo toma la palabra cada participante, lo que permite reconstruir la estructura de la conversación sin necesidad de un sistema de diarización basado en embeddings de hablante.
- Subtitulado y post-producción de vídeo en inglés: los timestamps por palabra y las marcas de turno facilitan la generación de subtítulos con formato por interlocutor y la sincronización con el montaje.
- Análisis cualitativo de entrevistas: en investigación social o de mercado, permite segmentar respuestas por turno y extraer citas asociadas a cada intervención para su codificación posterior.
- Transcripción de llamadas de atención al cliente: al separar turnos, se puede distinguir operador de cliente aunque no se conozca su identidad, y volcar la conversación a un CRM o a un sistema de control de calidad.
- Pipelines de actas y resúmenes: transcripción con turnos como entrada de un LLM posterior que genere el acta; el marcado de turnos mejora la atribución de comentarios en el resumen.
- Indexación y búsqueda sobre archivos de audio: transcripción con timestamps por palabra para construir un índice de búsqueda o alimentar un sistema RAG sobre grabaciones largas.
- Asistentes de voz locales y en el borde: con 466 MB de modelo y ~1 GB de memoria, cabe en dispositivos con recursos limitados y funciona sin conexión, lo que es adecuado para dictado o toma de notas en local.
- Investigación en conversación y análisis de turnos: el token de turno permite estudiar solapamientos, latencias de respuesta y patrones de alternancia en corpus conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, DER ni WDER, ni comparaciones con el `small.en` original. El repositorio de tinydiarize enlazado desde la model card es la fuente donde consultar los detalles de evaluación del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,0-1,5 GB en f16 para el encoder-decoder `small`, coherente con el dato de la model card (466 MB en disco, ~1,0 GB de memoria). Las cuantizaciones generadas con whisper.cpp reducen el consumo por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Una RTX 3060, RTX 4090, A100 o H100 ejecutarían el modelo con un uso de memoria irrelevante; no se necesita hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos años, y también en GPU integradas y en Apple Silicon mediante Metal.
- CPU: funciona con AVX2 y superiores; el tamaño `small` es manejable para inferencia en tiempo real en CPU moderna, especialmente con cuantización q5_0 o q8_0.
- Opciones de despliegue: whisper.cpp (CLI, servidor y modo streaming), bindings de Python como pywhispercpp, y el checkpoint PyTorch original del proyecto tinydiarize. vLLM, TGI y Ollama no están soportados para este fichero ggml concreto ni para el marcado de turnos.
- Latencia y throughput estimados: no disponible en la información proporcionada. No se publican cifras de factor de tiempo real ni de RTF para este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Diarizacion | Formato | Licencia |
|---|---|---|---|---|---|---|
| tinydiarize `small.en-tdrz` (este repo) | ~244 M | Ventanas de 30 s | Ingles | Turnos de palabra (si/no) | ggml (466 MB) | MIT |
| Whisper `small.en` (OpenAI) | ~244 M | Ventanas de 30 s | Ingles | no | PyTorch, ggml | MIT |
| Whisper `medium.en` (OpenAI) | ~769 M | Ventanas de 30 s | Ingles | no | PyTorch, ggml | MIT |
| `whisper-large-v3` (OpenAI) | ~1550 M | Ventanas de 30 s | Multilingue | no | PyTorch, ggml | MIT |

La diferencia clave frente a los Whisper estándar es la capacidad de marcar turnos, que los otros no ofrecen. Frente a sistemas de diarización completos como pyannote, este modelo no identifica hablantes ni mantiene etiquetas consistentes a lo largo de una grabación, pero a cambio no requiere modelos adicionales, ni clustering, ni GPU dedicada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona, no ejecuta código y no soporta tool calling. Cualquier ficha que lo catalogue como LLM es incorrecta.
- No identifica hablantes: detecta cambios de turno, pero no asigna etiquetas persistentes del tipo "hablante 1" o "hablante 2". Tampoco resuelve solapamientos de voces.
- Solo inglés: los checkpoints `.en` no transcriben otros idiomas y no traducen.
- Riesgo de alucinación específico de ASR: Whisper puede generar texto plausible en tramos con ruido, silencio o música, y producir repeticiones. Es un comportamiento documentado del modelo base y debe mitigarse con detección de actividad de voz y filtros posteriores.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Whisper, con peor rendimiento en acentos no estándar, habla con ruido de fondo, solapamiento de voces y jerga técnica.
- Respecto a la privacidad: se trata de un modelo de transcripción de audio, por lo que su uso sobre conversaciones requiere cumplir la normativa aplicable de protección de datos.
- Restricciones de licencia: la licencia declarada es MIT, que permite uso comercial, modificación y redistribución con atribución. Conviene verificar que la licencia se mantiene en el repositorio original de tinydiarize y en los pesos de Whisper de OpenAI (también MIT).
- Repositorio con 0 descargas y 0 likes, sin pipeline declarado: no hay evidencia de uso en producción ni de validación comunitaria. Para producción, es más prudente obtener los pesos desde el repositorio original de tinydiarize o convertir el checkpoint PyTorch uno mismo, y verificar el SHA publicado.
- Aviso sobre la fecha de creación registrada (2026-10-12) en HuggingFace: conviene comprobar la procedencia y la integridad del fichero antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TakeboxLLM/tinydiarize-saying
- Proyecto original tinydiarize (checkpoints PyTorch): https://github.com/akashmjn/tinydiarize
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Scripts de conversion de modelos de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
- Repositorio de Whisper de OpenAI: no enlazado en la informacion proporcionada
- Paper del metodo tinydiarize: no enlazado en la informacion proporcionada
- Demo: no disponible
