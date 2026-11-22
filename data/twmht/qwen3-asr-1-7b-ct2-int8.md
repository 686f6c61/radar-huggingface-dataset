# twmht/Qwen3-ASR-1.7B-ct2-int8

## Resumen

Qwen3-ASR-1.7B-ct2-int8 es una conversión al formato CTranslate2 del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-1.7B-hf, publicada por el usuario twmht. El modelo original lo desarrolla el equipo Qwen de Alibaba y está diseñado para transcripción de audio a texto en chino e inglés. Esta versión concreta no es un modelo nuevo, sino un artefacto de despliegue: los pesos del decodificador de texto se almacenan en int8 (con una escala float32 por fila de salida) mientras que el codificador de audio, el proyector y las normas permanecen en bfloat16, lo que reduce el tamaño de descarga y acelera la decodificación.

La relevancia de esta publicación es doble. Por un lado, ofrece una ruta de inferencia optimizada para CPU y GPU mediante CTranslate2, una librería habitual en pipelines de producción de ASR por su bajo consumo de memoria y su buen throughput. Por otro, es un build temprano: requiere un fork de CTranslate2 que añade una clase nativa `Qwen3AsrSpec` (revisión 1), todavía en desarrollo y no publicado. CTranslate2 upstream no puede cargar estos ficheros, y el formato puede cambiar antes del primer release, por lo que conviene fijar la revisión del repositorio que se pruebe.

El repositorio ocupa 2,4 GB, tiene licencia Apache-2.0 (heredada del modelo base) y declara soporte para chino (zh) e inglés (en). No hay métricas de benchmarks ni detalles de entrenamiento en la información disponible; esta ficha se limita a lo que documenta la model card y a las características deducibles del proceso de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + proyector + decodificador de texto (arquitectura Qwen3-ASR; detalles internos no disponibles) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo; desglose no disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 en pesos lineales del decodificador (una escala float32 por fila); codificador de audio, proyector y normas en bfloat16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`, especificación `Qwen3AsrSpec`, revisión 1); tokenizer y vocabulario en JSON/Jinja copiados del original |

## Arquitectura y entrenamiento

La model card describe el contenido de `model.bin` como un codificador de audio, un proyector, un decodificador de texto y tablas mel, empaquetados bajo la especificación `Qwen3AsrSpec`. Se trata, por tanto, de una arquitectura tipo encoder-decoder para voz: el audio se convierte en representaciones acústicas con el encoder, el proyector las alinea con el espacio del decodificador y el decodificador de texto genera la transcripción. No se detalla en la información proporcionada si el decodificador es un transformer denso estándar, el número de capas, la dimensión oculta ni la ventana de contexto de audio.

Respecto al entrenamiento, no hay datos disponibles: no se indica el número de horas de audio, la composición del dataset, ni si hubo ajuste por RLHF, DPO o instrucciones. La innovación técnica destacable de esta publicación no está en el modelo, sino en el artefacto de despliegue: la conversión a CTranslate2 con cuantización int8 selectiva (solo el decodificador) busca minimizar el tamaño de descarga y maximizar la velocidad de decodificación manteniendo la precisión del codificador acústico en bfloat16. El conversor `ct2-qwen3-asr-converter` lee `model.safetensors` directamente y no requiere `torch` ni `transformers`, lo que simplifica la reproducibilidad del proceso.

## Capacidades

- Reconocimiento automático de voz (ASR): transcripción de audio a texto en chino e inglés.
- Procesamiento de audio con tablas mel incluidas en el propio `model.bin`, de modo que el preprocesado acústico forma parte del artefacto.
- Generación de texto condicionada por audio mediante decodificador autorregresivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el pipeline declarado es exclusivamente ASR.
- Capacidades multilingües: limitadas a chino e inglés según los tags del repositorio.
- Capacidades especiales (modo thinking, visión, audio de entrada adicional): no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y llamadas en chino e inglés: el modelo convierte el audio en texto y puede integrarse en un pipeline de diarización posterior; su tamaño de 1,7B y la cuantización int8 del decodificador facilitan el despliegue en servidores sin GPU de gran formato.
- Subtitulado automático de vídeo: se puede procesar el audio por segmentos y generar subtítulos en zh/en; la inferencia con CTranslate2 permite lotes pequeños en CPU para cargas moderadas.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones para alimentar sistemas de análisis de sentimiento o búsqueda; el soporte bilingüe cubre mercados de China y angloparlantes.
- Indexación y búsqueda de archivos de audio: convertir grandes volúmenes de grabaciones a texto para motores de búsqueda internos, aprovechando el tamaño reducido del artefacto int8 para desplegar varias instancias en paralelo.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos zh/en, con despliegue en CPU mediante CTranslate2 cuando no hay GPU disponible.
- Preprocesado para pipelines de NLP: transcripción de audio como paso previo a resumen, extracción de entidades o clasificación de documentos, usando el texto generado como entrada de modelos posteriores.
- Evaluación y prototipado de ASR: servir como referencia bilingüe de código abierto (Apache-2.0) para comparar calidad de transcripción frente a otros motores, siempre que se disponga del fork de CTranslate2 necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 2,4 GB y el decodificador está en int8, por lo que la huella en memoria debería ser del orden de pocos GB, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles en la información proporcionada. CTranslate2 es compatible con GPU NVIDIA (CUDA) y con CPU, pero la model card no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño (1,7B con decodificador int8) es plausible que quepa en tarjetas consumer con suficiente VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: CTranslate2 con el fork que implementa `Qwen3AsrSpec` (revisión 1). CTranslate2 upstream no puede cargar estos ficheros. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponibles. La model card afirma que esta configuración es «la descarga más pequeña y la decodificación más rápida» entre las variantes del conversor, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-ct2-int8 (este) | 1,7B | No disponible | zh, en | Apache-2.0 | CTranslate2 int8 (fork requerido) |
| Qwen/Qwen3-ASR-1.7B-hf (base) | 1,7B | No disponible | zh, en | Apache-2.0 | safetensors / transformers |
| Whisper large-v3 (referencia de la categoría) | 1,55B | No disponible en esta ficha | Multilingüe amplio | MIT (según el modelo original) | Diversos (transformers, CTranslate2, whisper.cpp) |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación con Whisper large-v3 se incluye solo como referencia de categoría (ASR de tamaño similar); no se han verificado aquí sus especificaciones exactas ni su rendimiento frente a Qwen3-ASR.

## Limitaciones y advertencias

- Build temprano y no funcional con CTranslate2 estándar: requiere un fork en desarrollo que añade la clase `Qwen3AsrSpec`; upstream no carga estos ficheros.
- Formato inestable: la especificación `Qwen3AsrSpec` (revisión 1) puede cambiar antes del primer release; hay que fijar la revisión del repositorio que se pruebe.
- Cobertura lingüística limitada a chino e inglés; no se declaran otros idiomas.
- Sin datos de benchmarks, entrenamiento ni evaluación de calidad; no es posible estimar la tasa de error (WER) a partir de la información disponible.
- Riesgo de alucinación en la transcripción: no documentado en la model card, pero es un riesgo inherente a los decodificadores autorregresivos de ASR; conviene validar con muestras reales.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos acústicos, dialectales o de género.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el fork de CTranslate2 necesario para ejecutar el modelo tiene su propia licencia y estado de desarrollo, que debe revisarse por separado.
- Sin garantías de soporte: 0 descargas y 1 like en el momento de la consulta; el artefacto no tiene un historial de uso que permita inferir estabilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twmht/Qwen3-ASR-1.7B-ct2-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- CTranslate2 (librería): https://github.com/OpenNMT/CTranslate2
- Paper, blog, repositorio del fork y demos: no disponibles en la información proporcionada.
