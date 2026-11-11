# TTSBard/shtorm-ru-v2-fast-onnx

## Resumen

Shtorm RU v2 Fast ONNX es un paquete de inferencia para síntesis de voz en ruso derivado de Shtorm-PocketTTS-RU v2 Fast, a su vez una adaptación al ruso del modelo Pocket TTS de Kyutai. Lo publica el proyecto TTSBard, que ha exportado los grafos a ONNX y ha cuantizado a INT8 los componentes FlowLM y el decodificador Mimi para permitir inferencia local en CPU dentro de su aplicación de escritorio. El resultado es un paquete de 0,6 GB orientado a ejecución sin GPU.

El modelo acepta una referencia de voz en formato WAV proporcionada por el usuario y genera audio a 24 kHz, lo que lo sitúa en la categoría de TTS zero-shot con clonación de voz ligera. Su relevancia práctica radica en que ofrece síntesis en ruso con un consumo de recursos contenido y un formato (ONNX Runtime) portable, aunque su ecosistema está atado a la aplicación TTSBard y no a un uso genérico como biblioteca independiente.

La información publicada es escasa: no se detallan parámetros, arquitectura interna más allá de la referencia a Pocket TTS y Mimi, ni resultados de evaluación. Esta ficha refleja únicamente lo que el autor documenta en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (base de Kyutai) con decodificador de audio Mimi; exportada a cinco grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en FlowLM y en el decodificador Mimi |
| Idiomas soportados | ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos), safetensors (model_fast.safetensors upstream), SentencePiece (tokenizer.model) |
| Frecuencia de muestreo de salida | 24 kHz |
| Entrada de condicionamiento | referencia de voz en WAV proporcionada por el usuario |
| Tamano del repositorio | 0,6 GB |
| Libreria de inferencia | onnxruntime |

## Arquitectura y entrenamiento

El paquete se construye sobre Pocket TTS de Kyutai, un sistema de síntesis de voz que combina un modelo de lenguaje de flujo (FlowLM) con el códec neuronal Mimi para la generación de audio. La adaptación al ruso la realiza ArtShtorm en el modelo Shtorm-PocketTTS-RU, del que este repositorio toma los pesos originales y el tokenizador SentencePiece fijados a una revisión concreta (33f6c328d62c4da5c1227bbe081e89b574a6183a).

TTSBard se encarga exclusivamente de la conversión a ONNX: exporta cinco grafos, cuantiza FlowLM y Mimi a INT8, añade un descriptor de paquete y una configuración que resuelve pesos y tokenizador en local, y publica hashes SHA-256 en `SHA256SUMS`. No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del corpus ruso ni si hubo ajuste por RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá de la cuantización INT8 y la exportación para CPU.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso a partir de texto de entrada.
- Clonación de voz zero-shot mediante una referencia WAV aportada por el usuario, de la que se extrae el tensor de condicionamiento de voz.
- Generación de audio a 24 kHz.
- Inferencia local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con la aplicación TTSBard a través de su panel Pocket TTS y de un descriptor de paquete propio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada (ASR) ni otros idiomas distintos del ruso.

## Casos de uso

- Lectura de textos en ruso en aplicaciones de escritorio: el paquete está pensado para cargarse desde TTSBard y sintetizar contenido escrito por el usuario en local, sin enviar texto a servicios externos.
- Accesibilidad para usuarios rusoparlantes: conversión de documentos, artículos o interfaces a voz con una referencia de voz personal, útil en lectores de pantalla y herramientas de apoyo.
- Generación de voces para contenido pregrabado: producción de narraciones para vídeos, pódcast o audiolibros en ruso con una voz consistente derivada de la referencia WAV.
- Prototipado de asistentes conversacionales en ruso: al ejecutarse en CPU y con un paquete de 0,6 GB, permite montar un pipeline TTS en entornos sin GPU para pruebas de concepto.
- Sistemas de aviso y notificación por voz: generación dinámica de mensajes hablados en ruso en aplicaciones de escritorio o servidores modestos.
- Investigación en TTS ruso: al estar los grafos en ONNX y los pesos upstream en safetensors, sirve como base para experimentos de cuantización, latencia o calidad de voz sin depender de PyTorch en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, WER, similitud de hablante), latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica; el paquete está diseñado para inferencia en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponibles; el autor no documenta aceleración por GPU para este paquete.
- Cabe en GPU de consumo: no se documenta soporte CUDA; el diseño apunta a ejecución en CPU.
- Despliegue: ONNX Runtime dentro de TTSBard. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Almacenamiento: 0,6 GB de repositorio, más los ficheros upstream `model_fast.safetensors` y `tokenizer.model` que deben colocarse en el mismo directorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Shtorm RU v2 Fast ONNX (este) | no disponible | ru | ONNX + safetensors | CC BY 4.0 | Cuantizado INT8, orientado a CPU y a TTSBard |
| Shtorm-PocketTTS-RU v2 Fast (ArtShtorm) | no disponible | ru | safetensors | no disponible en la informacion proporcionada | Modelo base del que deriva este paquete |
| Pocket TTS (Kyutai) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base original de Kyutai |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ruso; no se documenta multilingüismo.
- Requiere una referencia de voz WAV del usuario para el condicionamiento; sin ella no se describe un modo de voz por defecto.
- La instalación manual exige colocar los grafos ONNX, la configuración, el descriptor y los ficheros upstream `model_fast.safetensors` y `tokenizer.model` en un directorio concreto (`models/pocket/shtorm-ru-v2-fast`), lo que limita su uso fuera de TTSBard.
- No se publican métricas de calidad, sesgos, riesgo de alucinación acústica ni evaluación de similitud de hablante; cualquier despliegue en producción debería validarse empíricamente.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero obliga a citar a ArtShtorm, Kyutai y TTSBard según lo indicado en la model card; conviene revisar también las condiciones del modelo base original.
- Al derivar de un modelo de voz, existe riesgo de uso indebido para suplantación de identidad si se emplean referencias de voz de terceros sin consentimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TTSBard/shtorm-ru-v2-fast-onnx
- Modelo base ruso (ArtShtorm): https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU/tree/33f6c328d62c4da5c1227bbe081e89b574a6183a
- Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de TTSBard: https://github.com/ttsbard/TTSBard
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
