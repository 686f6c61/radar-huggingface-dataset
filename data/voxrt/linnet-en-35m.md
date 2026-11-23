# VoxRT/linnet-en-35m

## Resumen

Linnet `linnet-en-35m` es un modelo de síntesis de voz (text-to-speech) orientado a ejecución local en dispositivo, desarrollado por VoxRT. Se trata de un modelo autorregresivo de tipo flow matching que genera un latente continuo de 48 dimensiones por cada paso de 80 ms (dos tramas de códec de 24 dimensiones a 25 Hz) con una única evaluación del cabezal de flujo por paso, seguido de un decodificador de códec neuronal de estilo Vocos que convierte los latentes en audio a 24 kHz. El modelo habla únicamente inglés y emite audio en streaming desde el primer paso.

Con 41,4 M de parámetros totales (31,5 M en el flow LM y 9,9 M en el decodificador de códec), el modelo está diseñado para funcionar en tiempo real sobre un único núcleo de CPU de teléfono o de escritorio. Se distribuye con dos voces integradas y un runtime en Rust con bindings para C (Linux), Python (rueda `linnet-tts`), Android (AAR) e iOS (paquete Swift). Es relevante para quienes necesitan TTS de baja latencia, sin GPU y embebible en aplicaciones móviles o de escritorio.

La licencia de los pesos (Linnet Weights License 1.0) no es de código abierto: permite el uso gratuito de los pesos sin modificar con las voces integradas en productos propios, incluidos comerciales y de código cerrado, pero reserva las voces personalizadas, la modificación de los pesos, el entrenamiento y los servicios de TTS de propósito general a licencias separadas de VoxRT. El código y los bindings, en cambio, son Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con cabezal de flujo (flow matching) y decodificador de codec neuronal estilo Vocos |
| Parametros totales | 41,4 M (flow LM 31,5 M con tabla de texto de 3,1 M; decodificador de codec 9,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prompt de voz (voces integradas: 6 s = 76 posiciones del LM; entrenamiento con prompts de ~5 s) + tokens de texto + pasos generados, limitado por `max_frames` (por defecto 300 pasos = 24 s) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos fp16 para el runtime y fp32 de referencia) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Linnet Weights License 1.0 (no es código abierto; código y bindings Apache-2.0) |
| Formato de pesos | safetensors (`linnet-tts/1`): `linnet-en-35m.fp16.safetensors` (runtime) y `linnet-en-35m.safetensors` (referencia fp32) |

## Arquitectura y entrenamiento

El tronco del modelo consta de 6 capas transformer con pre-LayerNorm, anchura 512, 8 cabezales y posiciones rotatorias (pares intercalados, periodo máximo 10⁴), con FFN GELU (tanh) de expansión 4× y sin sesgos. Las entradas son un embedding aprendido de "begin voice", los latentes proyectados del prompt de voz, los embeddings de tokens de texto y los latentes previamente generados proyectados; mantiene caché KV para streaming. El cabezal de flujo son 6 bloques MLP AdaLN de anchura 512 condicionados por el estado del tronco y por dos embeddings temporales sinusoidales; en inferencia se evalúa una vez por paso sobre `x0 ~ N(0, temp·I)` y el latente es `x0 + v`, generado en un espacio normalizado y desnormalizado con media y desviación almacenadas. Un cabezal EOS de un único logit sobre el estado del tronco marca el final (el paso en que se activa no se emite).

El decodificador de códec aplica una proyección 1×1 de 24 a 384, dos bloques ConvNeXt causales a 25 Hz, un sobremuestreo ×4 hasta la rejilla de columnas STFT de 100 Hz, ocho bloques ConvNeXt causales y un cabezal lineal que produce 513 bins. El frontend de texto es SentencePiece unigram con 6000 piezas, sin fonemizador ni normalización de texto dentro del modelo. El muestreo usa 1 paso de flujo por trama, `temp` (por defecto 0,3) que escala el muestreo gaussiano, classifier-free guidance `cfg` sobre la salida del tronco (por defecto 2,0) y el cabezal EOS. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Síntesis de voz en inglés a 24 kHz mono, con salida en streaming desde el primer paso.
- Generación de latentes continuos a 12,5 Hz (48 dimensiones) a partir de tramas de códec de 25 Hz.
- Dos voces integradas (`linnet-en-f1` y `linnet-en-m1`) seleccionables mediante prompt de voz latente.
- Ejecución en tiempo real en un único núcleo de CPU de clase teléfono o escritorio.
- Lectura correcta de formas numéricas simples (dígitos aislados); el texto denso con moneda, porcentajes, fechas ISO o números de teléfono debe convertirse a palabras antes de la síntesis.
- Soporte de voces personalizadas mediante VoxRT Studio (el codificador que produce latentes a partir de grabaciones no forma parte de esta release).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones móviles: el modelo cabe en un solo núcleo de CPU y emite audio en streaming, por lo que puede sintetizar mensajes cortos en el propio dispositivo sin enviar texto a un servidor.
- Asistentes de voz embebidos en dispositivos de escritorio o IoT: el runtime en Rust con bindings para C, Android e iOS permite integrar la síntesis en binarios nativos con baja latencia y sin GPU.
- Audiolibros y contenido largo por fragmentos: con `max_frames` configurable (por defecto 300 pasos = 24 s) se pueden generar segmentos encadenados y reproducirlos de forma continua.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces y documentos en inglés directamente en el dispositivo, con dos voces integradas y sin dependencia de la nube.
- Demos y prototipos interactivos: la rueda `linnet-tts` de Python permite ejecutar los pesos en CPU para validar flujos de TTS en entornos de investigación o pruebas.
- Locución automatizada de contenido en inglés con voz propia: mediante VoxRT Studio se puede clonar una voz a partir de una grabación corta y usar el fichero de voz resultante con este modelo, sujeto a la licencia de pesos.
- Pruebas de regresión de audio: los pesos fp32 de referencia y el `MANIFEST.json` con el md5 de síntesis de referencia permiten validar la integridad de la salida en pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en tiempo real en un único núcleo de CPU de clase teléfono o escritorio; no se especifican cifras de latencia ni de throughput.
- VRAM estimada para GPU: no disponible; el modelo está orientado a CPU y no se documentan requisitos de GPU.
- GPU recomendadas: no disponibles.
- ¿Cabe en GPU consumer? No se documenta soporte de GPU; el diseño apunta a ejecución en CPU.
- Opciones de despliegue: runtime en Rust del repositorio GitHub `VoxRT/LinnetTTS`, rueda de Python `linnet-tts`, AAR de Android, paquete Swift de iOS y bindings C para Linux. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo declara ejecución en tiempo real en un núcleo de CPU, sin cifras concretas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (TTS en dispositivo de tamaño similar), por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, este modelo se diferencia de los TTS basados en difusión de mayor tamaño por su huella de 41,4 M de parámetros y su ejecución en CPU, pero no se aportan cifras de comparación.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Linnet `linnet-en-35m` | 41,4 M | Prompt de voz + texto + pasos, `max_frames` 300 (24 s) | Linnet Weights License 1.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No incluye normalización de texto: los importes monetarios, porcentajes, fechas con barra o ISO, números de teléfono y otro texto denso deben convertirse a palabras antes de la síntesis para evitar lecturas incorrectas.
- El codificador que genera latentes de voz a partir de grabaciones no forma parte de esta release; las voces personalizadas requieren VoxRT Studio y una licencia adicional.
- La licencia de pesos no es de código abierto: reserva la modificación de los pesos, el entrenamiento y los servicios de TTS de propósito general a licencias separadas de VoxRT, lo que limita ciertos usos comerciales.
- El límite por defecto de `max_frames` (300 pasos = 24 s) restringe la duración de cada generación salvo que se ajuste.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como modelo generativo de audio, la salida puede presentar artefactos o pronunciaciones erróneas en texto no normalizado.
- No se documentan requisitos de GPU ni cuantizaciones alternativas, lo que limita las opciones de despliegue fuera del runtime oficial.

## Enlaces

- Hugging Face: https://huggingface.co/VoxRT/linnet-en-35m
- Demo Space: https://huggingface.co/spaces/VoxRT/linnet-tts
- Repositorio GitHub (código y bindings, Apache-2.0): https://github.com/VoxRT/LinnetTTS
- Licencia de pesos: https://huggingface.co/VoxRT/linnet-en-35m/blob/main/WEIGHTS_LICENSE.md
- VoxRT Studio (voces personalizadas): https://app.voxrt.com/signup?product=linnet
- Contacto de licencias: help@voxrt.com
