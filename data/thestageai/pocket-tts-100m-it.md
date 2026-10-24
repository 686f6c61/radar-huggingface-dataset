# TheStageAI/pocket-tts-100m-it

## Resumen

`TheStageAI/pocket-tts-100m-it` es un paquete de motores Core ML del modelo de síntesis de voz `kyutai/pocket-tts` en su variante italiana (`languages/italian`), empaquetado por TheStageAI para su SDK de Apple (`model_type: pocket-tts`, bundle de idioma `it`). No se trata de un modelo entrenado desde cero, sino de una conversión y distribución del modelo de 100 millones de parámetros de Kyutai en formato ejecutable sobre el Neural Engine (ANE) de los chips Apple, lo que permite inferencia local sin GPU dedicada ni servicios en la nube.

El modelo base resuelve un problema concreto: TTS de calidad con un tamaño lo bastante pequeño como para ejecutarse en CPU y en dispositivos de consumo, algo que los sistemas de síntesis de voz de gran escala (modelos de cientos de millones a miles de millones de parámetros con decodificación autoregresiva costosa) no permiten. La relevancia de este bundle es la integración nativa en el ecosistema Apple: aplicaciones iOS y macOS pueden invocar síntesis en italiano sobre ANE, con coste energético bajo y sin latencia de red.

La información publicada por el autor es muy escueta: no detalla la topología interna, el contexto, los datos de entrenamiento ni los resultados de evaluación. El repositorio ocupa 0,3 GB y se distribuye bajo licencia CC-BY-4.0, heredada del modelo original de Kyutai.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (motores Core ML del modelo TTS `kyutai/pocket-tts`; el autor no detalla la topología interna) |
| Parámetros totales | 100 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuyen motores Core ML precompilados; el repositorio no lista variantes) |
| Idiomas soportados | Italiano (`it`) únicamente en este bundle |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores Core ML para ANE, integrados en el SDK de Apple de TheStage (`model_type: pocket-tts`) |
| Pipeline | text-to-speech |
| Librería | `pocket-tts` |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | `kyutai/pocket-tts`, subconjunto `languages/italian` (Kyutai, CC-BY-4.0) |

## Arquitectura y entrenamiento

El autor no publica detalles de arquitectura, composición del dataset de entrenamiento, número de tokens ni proceso de alineación (RLHF/DPO) para este bundle. Lo que sí se deduce de la información disponible es que se trata de una conversión del modelo `kyutai/pocket-tts` en su variante italiana a motores Core ML optimizados para el Neural Engine de Apple, manteniendo los 100 millones de parámetros del original y el pipeline de texto a voz de la librería `pocket-tts`.

El modelo base de Kyutai se presenta públicamente como un TTS de alta calidad con clonación de voz que funciona en CPU, con soporte en navegador. La documentación de Kyutai señala que parte del diseño consiste en simplificar la tarea de modelado mediante decisiones deterministas que reducen el tamaño necesario, a cambio de un conjunto de voces más limitado que en modelos mayores. Esa descripción corresponde al modelo original; no hay confirmación en la información disponible de que el bundle italiano exponga la funcionalidad de clonación de voz ni de qué decisiones concretas de arquitectura se trasladan al motor Core ML.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano a partir de texto de entrada.
- Ejecución local sobre Neural Engine de Apple mediante Core ML, sin dependencia de servicios en la nube.
- Integración con el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts` y bundle de idioma `it`.
- Hereda el pipeline `text-to-speech` de la librería `pocket-tts`.
- Clonación de voz: documentada en el modelo base de Kyutai; no confirmada para este bundle en la información disponible.
- Soporte de navegador: documentado para el modelo base de Kyutai; no confirmado para estos motores Core ML.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada y modo "thinking": no aplica (es un modelo TTS, no un LLM de propósito general).
- Capacidades multilingües: limitadas a italiano en este bundle; el modelo base de Kyutai se distribuye por idiomas en subcarpetas.

## Casos de uso

- Lectura de contenido en apps iOS y macOS para usuarios italianos: una aplicación puede enviar artículos, correos o notas al motor Core ML y reproducir el audio en el dispositivo, sin coste de API y sin enviar el texto a un tercero.
- Accesibilidad y lectores de pantalla: integración en funciones de VoiceOver o lectores propios para personas con discapacidad visual que necesiten síntesis en italiano con baja latencia, aprovechando la ejecución sobre ANE.
- Asistentes de voz sin conectividad: dispositivos Apple en entornos con red intermitente o restringida (almacenes, campo, flotas) pueden generar respuestas habladas en italiano en local, con un repositorio de solo 0,3 GB embebido en la app.
- Generación de audio sintético para pruebas de software: creación de corpus de audio en italiano para tests de diálogo, evaluación de sistemas ASR o validación de pipelines de atención al cliente sin depender de grabaciones humanas.
- Prototipado de audiolibros y pódcast: generación de borradores de narración en italiano para revisión de guion antes de contratar locución profesional, con coste marginal cero por carácter.
- Señalización y avisos en sistemas embebidos Apple: anuncios pregrabados o dinámicos en italiano para kioscos, puntos de información y aplicaciones de megafonía gestionadas desde un dispositivo Apple.
- Doblaje y localización de prototipos: generación rápida de pistas de voz en italiano para demos de producto y vídeos internos, siempre que se respeten las obligaciones de atribución de la licencia CC-BY-4.0.
- Evaluación comparativa de motores TTS en Apple Silicon: banco de pruebas para medir latencia y calidad de motores Core ML frente a alternativas en CPU o en la nube dentro de una misma app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de calidad (MOS, WER, SIM-O), ni comparativas objetivas para este bundle italiano.

Como referencia del modelo base —no de estos motores Core ML—, la cobertura de prensa sobre `kyutai/pocket-tts` cita una velocidad de 6 veces tiempo real en la CPU de un MacBook Air M4. Esa cifra corresponde al modelo original de Kyutai y no debe atribuirse sin verificación al paquete de TheStageAI, que ejecuta sobre ANE.

| Métrica | Este bundle (`pocket-tts-100m-it`) | Modelo base (`kyutai/pocket-tts`, CPU) |
|---|---|---|
| MOS / calidad subjetiva | No disponible | No disponible en la información proporcionada |
| WER del audio sintetizado | No disponible | No disponible en la información proporcionada |
| Factor de tiempo real | No disponible | 6x en CPU de MacBook Air M4 (según prensa) |
| Latencia de primera muestra | No disponible | No disponible en la información proporcionada |

## Requisitos de hardware

- Plataforma: exclusivamente Apple, con Neural Engine (chips de la familia M y A recientes). El paquete son motores Core ML para ANE, no hay binarios para CUDA, ROCm ni CPU x86 genérica.
- VRAM/memoria: no disponible como cifra publicada. Como estimación aritmética, 100 M de parámetros en FP16 equivalen a unos 200 MB de pesos; el repositorio completo ocupa 0,3 GB, por lo que el modelo cabe holgadamente en la memoria unificada de cualquier Mac o dispositivo iOS moderno. La cifra real de consumo del motor Core ML no está publicada.
- GPU recomendadas: no aplica en el sentido habitual; el motor está pensado para ANE. Cualquier Mac con chip M1 o posterior, o un iPhone/iPad con Neural Engine, es candidato. El propietario del repositorio no publica una lista mínima de dispositivos soportados.
- Cabe en hardware de consumo: sí, por tamaño (0,3 GB de repositorio y 100 M de parámetros) y por destino (ANE de dispositivos Apple). Falta confirmación del autor sobre generaciones mínimas.
- Opciones de despliegue: SDK de Apple de TheStage con Core ML (vía principal para este repositorio); la librería `pocket-tts` para el modelo base; para la variante inglesa existe un empaquetado GGUF de terceros (Loom) orientado a `loom.cpp`.
- Latencia y throughput: no publicados para este bundle. La referencia de 6x tiempo real en CPU de MacBook Air M4 corresponde al modelo base de Kyutai, no a estos motores.
- Almacenamiento: 0,3 GB de repositorio, adecuado para distribución dentro de una app.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato / runtime | Licencia | Observaciones |
|---|---|---|---|---|---|
| `TheStageAI/pocket-tts-100m-it` | 100 M | Italiano | Core ML / ANE | CC-BY-4.0 | Objeto de esta ficha; sin métricas publicadas |
| `kyutai/pocket-tts` (base) | 100 M | Por subcarpeta de idioma (incluye `italian`) | PyTorch / `pocket-tts`, CPU y navegador | CC-BY-4.0 | Modelo original de Kyutai; clonación de voz documentada; 6x tiempo real en CPU M4 según prensa |
| Empaquetado GGUF de Pocket TTS (Loom) | 100 M | Inglés | GGUF para `loom.cpp` | No disponible | Reempaquetado de terceros para inferencia local sin API ni fonemizador externo |

No se dispone en la información proporcionada de datos verificables (parámetros, contexto, benchmarks, licencia) de otras familias de TTS ligeros que permitan una comparación rigurosa; se indica, por tanto, "no disponible" para esas alternativas en lugar de extrapolar cifras.

## Limitaciones y advertencias

- Cobertura lingüística restringida: el bundle es solo italiano. No hay soporte de castellano ni de otros idiomas en este repositorio; para ellos habría que acudir al bundle correspondiente del modelo base.
- Dependencia de plataforma: los motores Core ML para ANE solo se ejecutan en hardware Apple. No es desplegable en servidores Linux con GPU, lo que limita su uso en backends tradicionales.
- Falta de documentación técnica: el autor no publica arquitectura interna, contexto, proceso de entrenamiento, datos de evaluación ni límites de dispositivos soportados. Cualquier decisión de producción exige una validación empírica propia.
- Riesgo de pronunciación incorrecta: en TTS, los errores se manifiestan como prosodia deficiente, acentuación errónea o lectura literal de números, siglas y nombres propios. No hay métricas publicadas que permitan acotar este riesgo en italiano.
- Sesgos desconocidos: al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de acento, género o registro. Se recomienda auditar el audio generado con hablantes nativos de distintas variedades del italiano.
- Clonación de voz y suplantación: si el bundle expone la clonación heredada del modelo base, existe riesgo de deepfakes de voz. Requiere consentimiento explícito, control de acceso y posibles obligaciones de etiquetado del audio sintético en la UE.
- Obligaciones de licencia: CC-BY-4.0 permite uso comercial, pero exige atribución a Kyutai y a TheStageAI, indicar la licencia y señalar si se han hecho modificaciones. Conviene revisar también las condiciones del SDK de TheStage para su integración en productos.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad. Tratarlo como artefacto reciente y sin auditar.
- Sin benchmarks: no hay evidencia publicada de MOS, WER ni latencia para este paquete, por lo que las comparaciones con otros TTS deben hacerse con mediciones propias sobre el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheStageAI/pocket-tts-100m-it
- Modelo base de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de código de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Informe técnico de Pocket TTS: https://kyutai.org/pocket-tts-technical-report/
- Demo en Hugging Face Spaces (Nymbo): https://huggingface.co/spaces/Nymbo/Pocket-TTS
- Artículo sobre el empaquetado GGUF para Loom: https://aicrier.com/post/39kittuy7i99cj7lkwuw
- Artículo de prensa sobre el rendimiento en CPU: https://thetesserapress.com/articles/kyutai-labspocket-tts
