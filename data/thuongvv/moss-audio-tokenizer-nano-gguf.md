# thuongvv/MOSS-Audio-Tokenizer-Nano-GGUF

## Resumen

MOSS-Audio-Tokenizer-Nano-GGUF es un repositorio de pesos convertidos y cuantizados, publicado por el usuario thuongvv, a partir del checkpoint `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano`. No se trata de un modelo entrenado de nuevo ni de un modelo de lenguaje: es la conversión a formato GGUF de un códec de audio neuronal (tokenizer de audio) cuyo cometido es reconstruir forma de onda a partir de códigos discretos. Su destino declarado es la decodificación de audio en el propio dispositivo mediante el runtime `ZeroTTS-swift`, que incluye un decodificador MOSS implementado sobre ggml.

El modelo base declara 21.960.064 parámetros (unos 21,96 millones), lo que lo sitúa en la categoría "nano" dentro de los códecs neuronales de audio. El códec trabaja a 48.000 Hz, produce PCM Float32 estéreo entrelazado y utiliza 16 codebooks residuales con una disposición de entrada frame-major de 16 códigos por frame. El repositorio ocupa 0,2 GB e incluye tres variantes de cuantización: f32 (referencia sin cuantizar), f16 (recomendada para iOS) y q8_0 (la más pequeña).

La relevancia de esta conversión es práctica: permite ejecutar el decodificador del códec en dispositivos Apple sin depender de ONNX Runtime, con un peso de tan solo 42,25 MiB en f16, y con métricas de deriva numérica publicadas por el autor (49,93 dB de SNR para f16 y 24,36 dB para q8_0 frente a f32 sobre un fixture determinista de ocho frames). El repositorio no registra descargas ni "likes" en la información disponible, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec de audio neuronal (tokenizer) con 16 codebooks residuales; topología interna no documentada en la información disponible |
| Parametros totales | 21.960.064 (≈21,96 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de contexto de texto. Entrada frame-major con 16 códigos de códec por frame; longitud máxima de secuencia no documentada |
| Tipos de cuantizacion | f32 (referencia), f16 (recomendada para iOS), q8_0. Solo se reducen los pesos compatibles con multiplicación de matrices; codebooks, pesos de normalización, escalas y sesgos se mantienen en f32 |
| Idiomas soportados | Multilingüe según los tags del repositorio; cobertura concreta de idiomas no documentada |
| Licencia | Apache 2.0 (heredada del checkpoint base) |
| Formato de pesos | GGUF (contenedor ggml): f32, f16 y q8_0 |
| Frecuencia de muestreo | 48.000 Hz |
| Salida nativa | PCM Float32 estéreo entrelazado |
| Codebooks residuales | 16 |
| Tamaño del repositorio | 0,2 GB |
| Fecha de empaquetado | 2026-09-15 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del checkpoint base `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano` más allá de su naturaleza de códec de audio neuronal con cuantización residual vectorial: la decodificación se articula sobre 16 codebooks residuales y espera una entrada en disposición frame-major con 16 códigos de códec por frame, produciendo PCM Float32 estéreo entrelazado a 48 kHz. No se documentan el número de capas, el tipo de bloques (convolucionales, transformer u otros), la dimensión de los embeddings de codebook ni la ventana temporal cubierta por cada frame. Tampoco se especifican los datos de entrenamiento, el número de tokens de audio vistos, la composición del dataset ni si hubo etapas de ajuste con RLHF, DPO u objetivos similares.

Lo que sí está documentado es el proceso de conversión y cuantización, que constituye la aportación real de este repositorio. La conversión se realiza con los scripts disponibles en `Native/MOSS/scripts/` del repositorio ZeroTTS Swift, con backend ggml/GGUF únicamente (no requiere ONNX Runtime) y sin modificar el grafo del decodificador. La cuantización es selectiva: se preservan en f32 los codebooks, los pesos de normalización, las escalas y los sesgos, y solo se reducen los pesos de multiplicación de matrices compatibles. El autor publica además una medida de deriva numérica sobre un fixture determinista de ocho frames con códigos aleatorios: f16 alcanza 49,93 dB de SNR respecto a f32 y q8_0 se queda en 24,36 dB. El propio autor advierte que estas cifras miden deriva numérica, no calidad percibida del habla.

## Capacidades

- Decodificación de audio a forma de onda: convierte secuencias de códigos discretos (16 por frame, 16 codebooks residuales) en PCM Float32 estéreo a 48 kHz.
- Integración como códec en pipelines de síntesis de voz: se usa como `codecModelURL` dentro del sintetizador de ZeroTTS Swift, acoplado a un modelo generador de códigos.
- Ejecución nativa en dispositivo y sin red: el decodificador corre sobre ggml en el propio hardware, sin servicio remoto ni dependencia de ONNX Runtime.
- Multilingüismo: los tags declaran soporte multilingüe, aunque no se documenta la lista de idiomas ni la cobertura real.
- Configuración de hilos: el runtime permite fijar el número de hilos (por ejemplo, 4) para ajustar el consumo de CPU.
- No dispone de: generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, soporte de agentes ni modo "thinking". No es un modelo de lenguaje y no acepta prompts de texto por sí mismo.
- No es un modelo autónomo de Transformers: requiere el runtime ggml de ZeroTTS Swift para funcionar.

## Casos de uso

- Síntesis de voz totalmente offline en iOS: integrado en ZeroTTS Swift, el códec reconstruye la forma de onda en el propio dispositivo a partir de los códigos generados, de modo que una app puede leer texto en voz alta sin conexión y sin enviar datos de usuario a un servidor. Su peso de 42,25 MiB en f16 lo hace viable en apps distribuidas por App Store.
- Lectura por voz para accesibilidad: apps de lectura de pantalla o de documentos pueden emplear el códec para convertir contenido de texto largo en audio continuo a 48 kHz, con la ventaja de no requerir GPU ni aceleradores dedicados.
- Asistentes de voz con privacidad local: un asistente embebido que no puede delegar audio a la nube puede generar respuestas habladas en el dispositivo, ya que todo el proceso —generación de códigos y decodificación— ocurre en local.
- Audioguías y contenido turístico descargable: aplicaciones de museos o rutas que empaquetan las voces en el binario y decodifican en tiempo de ejecución, evitando descargar ficheros WAV/MP3 por cada idioma y permitiendo cambiar de voz sin aumentar el tamaño de la app.
- Avisos de navegación y sistemas de a bordo: el decodificador, con su bajo consumo de memoria (23,14 MiB en q8_0), puede generar instrucciones habladas puntuales en dispositivos con recursos limitados, siempre que se valide la calidad percibida de la variante cuantizada.
- Aprendizaje de idiomas y práctica de pronunciación: una app puede sintetizar frases multilingües bajo demanda en local, usando el mismo códec para distintos idiomas declarados y sin depender de servicios de TTS en la nube con coste por carácter.
- Investigación en códecs neuronales: el repositorio sirve como implementación de referencia reproducible (variantes f32/f16/q8_0 y scripts de conversión) para medir el impacto de la cuantización selectiva en códecs de audio con codebooks residuales.
- Kioscos interactivos y sistemas de atención presencial sin conectividad: terminales con hardware modesto pueden producir respuestas habladas en tiempo real usando la variante f16 y el backend ggml.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en cualquier caso no serían aplicables: el artefacto es un códec de audio, no un modelo de lenguaje. Las únicas métricas publicadas son las de deriva numérica frente a la referencia f32, medidas sobre un fixture determinista de ocho frames con códigos aleatorios:

| Variante | Tamaño de fichero | SNR frente a f32 | Notas del autor |
|---|---:|---:|---|
| f32 | 87.872.192 bytes (83,80 MiB) | Referencia | Build sin cuantizar de referencia |
| f16 | 44.307.136 bytes (42,25 MiB) | 49,93 dB | Recomendada para iOS |
| q8_0 | 24.259.008 bytes (23,14 MiB) | 24,36 dB | Más pequeña; verificar calidad percibida |

El autor señala explícitamente que estos valores miden deriva numérica y no calidad percibida del habla, y recomienda verificar la calidad subjetiva en el caso de q8_0. No se publican métricas objetivas de calidad de audio (PESQ, STOI, MUSHRA) ni medidas de latencia o throughput.

## Requisitos de hardware

- Huella de pesos: 83,80 MiB (f32), 42,25 MiB (f16) y 23,14 MiB (q8_0). El consumo total de memoria incluye además los buffers de activación y de decodificación, cuyo tamaño no está documentado.
- VRAM: no aplica como requisito de GPU dedicada. El backend declarado es ggml sobre CPU, y el caso de uso objetivo es el dispositivo Apple; no se documentan requisitos de VRAM.
- GPU recomendadas: no disponibles. El README no menciona GPU alguna (A100, H100, RTX 4090 u otras) ni aceleración por GPU.
- Compatibilidad con hardware de consumo: sí. Con 42,25 MiB en f16, el modelo cabe en cualquier iPhone, iPad o Mac moderno, y también en dispositivos con memoria muy limitada en la variante q8_0.
- Concurrencia: el runtime expone un parámetro de hilos (`threads`, con ejemplo de 4), que permite ajustar el uso de CPU según el dispositivo.
- Opciones de despliegue: ZeroTTS Swift (repositorio `thuongvovan/ZeroTTS-swift`), que incluye el decodificador MOSS sobre ggml. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el propio README aclara que no es un modelo de Hugging Face Transformers autónomo.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo de decodificación por frame ni de audio generado por segundo.
- Verificación de integridad: el autor recomienda descargar desde una etiqueta de release o un commit inmutable en lugar de `main`, y comprobar el SHA-256 de `manifest.json` o `checksums.sha256` antes de cargar el modelo.

## Comparativa con modelos similares

No hay datos disponibles para comparar este códec con alternativas de la misma categoría (por ejemplo, otros códecs neuronales de audio de tamaño reducido): la información proporcionada no incluye parámetros, contexto, licencia ni métricas de esos posibles competidores. La única comparación posible con los datos disponibles es entre las tres variantes publicadas en el propio repositorio:

| Variante | Tamaño | Cuantización de matrices | SNR vs f32 | Uso recomendado por el autor |
|---|---:|---|---:|---|
| f32 | 83,80 MiB | Ninguna | Referencia | Base de referencia / validación |
| f16 | 42,25 MiB | f16 | 49,93 dB | Producción en iOS |
| q8_0 | 23,14 MiB | q8_0 | 24,36 dB | Escenarios con restricción de tamaño, previa validación de calidad |

Comparación con modelos alternativos de la misma categoría: no disponible.

## Limitaciones y advertencias

- No es un modelo independiente: es una conversión de pesos destinada al decodificador ggml de ZeroTTS Swift y no funciona como modelo autónomo de Transformers. No acepta prompts de texto.
- No es un modelo de texto: carece de generación de lenguaje, razonamiento, código, matemáticas, visión, tool calling y capacidades de agente. Cualquier expectativa en ese sentido es incorrecta.
- Validación nula por parte de la comunidad: el repositorio registra 0 descargas y 0 "likes", sin historial de uso en producción ni informes independientes de calidad.
- Deriva numérica en q8_0: 24,36 dB de SNR frente a f32, una cifra notablemente inferior a los 49,93 dB de f16. El propio autor aconseja verificar la calidad percibida antes de usar q8_0 en producción.
- Las métricas publicadas miden deriva numérica sobre un fixture sintético de códigos aleatorios, no calidad de voz ni inteligibilidad en habla real.
- Cobertura de idiomas no documentada: el tag "multilingual" no viene acompañado de lista de idiomas ni de evaluación por idioma.
- Arquitectura y entrenamiento no documentados: se desconoce el número de capas, los datos de entrenamiento, el número de horas de audio y si hubo ajuste por preferencias. Esto dificulta evaluar sesgos acústicos o limitaciones del códec.
- Riesgo de sesgo acústico: al no publicarse la composición del dataset de entrenamiento, no puede descartarse un peor rendimiento en determinados acentos, registros o idiomas.
- Dependencia de un runtime concreto: el uso previsto requiere ZeroTTS Swift; no se documentan bindings para otras plataformas ni para Python.
- Sin garantías de estabilidad de la API: el repositorio apunta a integración vía Swift con `codecModelURL`; conviene fijar una versión inmutable y verificar el SHA-256.
- Licencia: Apache 2.0, heredada del checkpoint base, por lo que el uso comercial está permitido siempre que se conserven los avisos de licencia. Debe verificarse la licencia del checkpoint original y de cualquier modelo generador de códigos que se acople al códec, ya que ambos condicionan el uso comercial del sistema completo.
- Idoneidad del formato: los pesos están en GGUF/ggml, no en safetensors, por lo que no se pueden cargar directamente con `transformers` sin una conversión adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thuongvv/MOSS-Audio-Tokenizer-Nano-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Runtime e implementación de conversión (ZeroTTS Swift): https://github.com/thuongvovan/ZeroTTS-swift
- Scripts de conversión y cuantización: `Native/MOSS/scripts/` dentro del repositorio ZeroTTS Swift
- Ficheros de verificación de integridad citados por el autor: `manifest.json` y `checksums.sha256` en el propio repositorio

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre el proyecto ZeroTTS; los resultados obtenidos correspondían a servicios de correo electrónico sin relación con el tema, por lo que no se incluyen.
