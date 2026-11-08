# turkish-sa-asr/kashgari-large-v1.0-ct2

## Resumen

Kashgari Large v1.0 CT2 es la conversión a formato CTranslate2 del modelo de reconocimiento automático de voz (ASR) `turkish-sa-asr/kashgari-large-v1.0`, desarrollado por el colectivo `turkish-sa-asr`. Se trata de un modelo especializado exclusivamente en turco, derivado de la familia Whisper (la librería declarada es `ctranslate2` y las etiquetas incluyen `whisper` y `faster-whisper`), con aproximadamente 2.000 millones de parámetros según la información pública del perfil del autor. Su propósito es ofrecer transcripción de audio a texto en turco con la eficiencia de inferencia que proporciona el motor CTranslate2, pensado para integrarse en `faster-whisper` y en despliegues de producción con CPU o GPU.

La relevancia de esta ficha radica en dos factores. Por un lado, el turco es un idioma con relativamente pocos modelos ASR de alta calidad y este proyecto se presenta como un ajuste específico sobre una arquitectura Whisper grande. Por otro lado, la conversión a CTranslate2 permite reducir el coste computacional frente a la implementación original de PyTorch, algo crítico en transcripción de audio a escala. El repositorio ocupa 3,1 GB, lo que es coherente con pesos cuantizados de un modelo de ~2B parámetros.

Es importante señalar desde el inicio que el acceso al modelo está restringido (gated): requiere aceptar condiciones en Hugging Face, y la licencia declarada es de solo investigación y evaluación (`research-evaluation`, etiqueta `license:other`). Esto condiciona fuertemente su uso en producción comercial. Además, no se han publicado resultados de benchmarks en la información disponible, por lo que cualquier evaluación de calidad debe realizarse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (según etiquetas `whisper`), convertido a CTranslate2 |
| Parametros totales | ~2B (según listado del perfil del autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper: 30 s por segmento, no confirmado en la información) |
| Tipos de cuantizacion | no disponible (formato CTranslate2; el repo contiene pesos ya convertidos, nivel de cuantización no especificado) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | `research-evaluation` (etiqueta `license:other`), acceso restringido |
| Formato de pesos | CTranslate2 (compatible con `faster-whisper`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper, un transformer encoder-decoder diseñado para ASR que procesa ventanas de audio de 30 segundos convertidas a espectrogramas log-Mel y genera tokens de texto de forma autorregresiva. El repositorio `kashgari-large-v1.0-ct2` es una conversión del checkpoint original `turkish-sa-asr/kashgari-large-v1.0` al formato CTranslate2, que aplica optimizaciones de inferencia (fusión de operadores, gestión de memoria y soporte de cuantización int8/float16). No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o decodificación especulativa.

El nombre "Kashgari" remite a Mahmud al-Kashgari, figura histórica de la lingüística túrquica, lo que sugiere un enfoque deliberado en el idioma turco. Sin embargo, la información pública disponible no detalla el proceso de entrenamiento ni las innovaciones técnicas empleadas más allá de la conversión a CTranslate2. Tampoco se especifica si el modelo original parte de un Whisper large-v2 o large-v3, dato relevante para estimar su calidad base.

## Capacidades

- Reconocimiento automático de voz (ASR) en turco: transcripción de audio a texto.
- Compatibilidad con `faster-whisper`, lo que habilita decodificación eficiente en CPU y GPU.
- Procesamiento por segmentos de audio (ventana típica de Whisper, no confirmada).
- Soporte de marcas de tiempo a nivel de segmento (capacidad heredada de Whisper, no verificada en esta conversión).
- No se ha confirmado soporte de traducción de voz a texto, detección de idioma ni otras tareas multitarea de Whisper.
- No se ha confirmado soporte de tool calling, agentes ni razonamiento multi-step (no aplica a un modelo ASR).
- Capacidades multilingües: no, el modelo está etiquetado únicamente para turco (`tr`).

## Casos de uso

- Transcripción de reuniones y actas en turco: el modelo puede convertir grabaciones de audio en texto para generar actas o resúmenes, usando `faster-whisper` para procesar lotes de audio con bajo coste computacional.
- Subtitulado automático de vídeo en turco: generación de subtítulos para contenido audiovisual turco, aprovechando la eficiencia de CTranslate2 para procesar horas de vídeo en pipelines batch.
- Atención al cliente en centros de llamadas: transcripción de conversaciones telefónicas en turco para análisis de calidad, minado de intenciones o cumplimiento normativo, con despliegue en servidores con GPU modesta.
- Investigación lingüística sobre el turco: creación de corpus orales transcritos para estudios fonéticos, morfológicos o de variación dialectal, dado el carácter de solo investigación de la licencia.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de radio turcos para habilitar búsqueda por texto completo.
- Evaluación comparativa de ASR en turco: uso como baseline en trabajos académicos que comparen modelos Whisper ajustados frente a alternativas, siempre dentro del marco de evaluación permitido por la licencia.
- Prototipado de asistentes de voz en turco: integración en demostradores de dictado o comandos de voz, con la advertencia de que el uso comercial no está cubierto por la licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~2B parámetros en CTranslate2, la inferencia en float16 requiere del orden de 4-6 GB de VRAM, y en int8 puede reducirse a 2-3 GB; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en A100/H100 para despliegues de alto throughput, pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí en GPUs con 6 GB o más de VRAM, sujeto al nivel de cuantización efectivo de los pesos incluidos en el repo.
- Opciones de despliegue: `faster-whisper` (librería nativa para CTranslate2); también es posible usar CTranslate2 directamente. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kashgari-large-v1.0-ct2 | ~2B | Turco | no disponible | research-evaluation (gated) | Hugging Face, acceso restringido |
| openai/whisper-large-v3 | ~1,55B | Multilingüe (99 idiomas) | 30 s por segmento | Apache 2.0 | Hugging Face, abierto |
| openai/whisper-large-v2 | ~1,55B | Multilingüe (99 idiomas) | 30 s por segmento | Apache 2.0 | Hugging Face, abierto |
| Modelos ASR específicos de turco (p. ej. ajustes comunitarios de Whisper) | variable | Turco | 30 s por segmento | variable | Hugging Face |

La comparación con Whisper large-v3 es la más directa por arquitectura, aunque kashgari declara ~2B parámetros frente a los ~1,55B de Whisper large. La ventaja potencial de kashgari es el ajuste específico al turco; la desventaja es su licencia restrictiva y la ausencia de benchmarks publicados. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Licencia de solo investigación y evaluación: no se permite el uso comercial sin autorización expresa; la etiqueta `license:other` y el acceso gated implican condiciones adicionales que deben revisarse en Hugging Face.
- Acceso restringido: es necesario iniciar sesión y aceptar las condiciones del autor para descargar los pesos.
- Modelo monolingüe: solo turco; no debe esperarse calidad en otros idiomas ni detección automática de idioma fiable.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER, CER) frente a alternativas, lo que dificulta la selección informada.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible; se recomienda validación humana en contextos críticos.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que pueden existir sesgos dialectales, de género o de registro (formal/informal) no caracterizados.
- Limitaciones de audio: la ventana típica de Whisper es de 30 segundos por segmento; audios más largos requieren segmentación, con posible pérdida de contexto entre segmentos.
- Formato CTranslate2: no es directamente cargable con `transformers`; requiere `faster-whisper` o CTranslate2, lo que limita la integración con ecosistemas basados en PyTorch.
- Nivel de cuantización no especificado: el rendimiento y la precisión pueden variar según el tipo de cuantización incluido en el repo, que no se detalla.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la vigencia y el estado real del repositorio antes de depender de él.

## Enlaces

- Modelo en Hugging Face (CT2): https://huggingface.co/turkish-sa-asr/kashgari-large-v1.0-ct2
- Modelo base original: https://huggingface.co/turkish-sa-asr/kashgari-large-v1.0
- Perfil del autor: https://huggingface.co/turkish-sa-asr
- Librería CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Whisper (OpenAI): https://github.com/openai/whisper
