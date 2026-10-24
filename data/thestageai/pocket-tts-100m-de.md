# TheStageAI/pocket-tts-100m-de

## Resumen
pocket-tts-100m-de es un paquete de motores Core ML y ANE publicado por TheStageAI para ejecutar en dispositivos Apple el modelo alemán de 100 millones de parámetros de Kyutai Pocket TTS. No es un modelo entrenado desde cero por TheStageAI: la model card lo describe como los motores del modelo `languages/german` de `kyutai/pocket-tts`, empaquetados para el SDK de Apple de TheStage con `model_type: pocket-tts` y bundle de idioma `de`.

El problema que resuelve es la integración de síntesis de voz neuronal en aplicaciones iOS, iPadOS y macOS sin depender de la nube ni de una GPU dedicada, aprovechando el Neural Engine. El repositorio ocupa 0,3 GB y la licencia declarada es CC-BY-4.0. Su relevancia es práctica: permite añadir TTS en alemán a aplicaciones Apple con un modelo compacto de 100M de parámetros, aunque no sustituye a un LLM ni ofrece las capacidades generales de un modelo de lenguaje.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) de Kyutai Pocket TTS, convertido a motores Core ML/ANE; arquitectura interna no detallada en la información disponible |
| Parametros totales | 100M (según nombre del repositorio y model card) |
| Parametros activos | No aplica (no es un modelo MoE); no se dispone de desglose |
| Longitud de contexto | No aplica; modelo TTS texto a audio. No se documenta límite de longitud del texto de entrada |
| Tipos de cuantizacion | No disponible; el repositorio contiene motores Core ML/ANE y no se especifican precisiones (FP16, INT8, etc.) |
| Idiomas soportados | Alemán (de) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (bundle para TheStage Apple SDK); no safetensors ni GGUF |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento
La información disponible no describe la arquitectura interna del modelo base: no se detalla el tipo de red, el mecanismo de atención, el codec de audio ni el esquema exacto de entrenamiento. Lo único documentado es que se trata de un modelo TTS de 100M de parámetros de Kyutai Pocket TTS, en su variante alemana, y que TheStageAI lo distribuye como motores Core ML/ANE para su SDK de Apple.

Tampoco se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO; en TTS esos términos no aplican de forma directa. La innovación técnica documentada en este repositorio es el empaquetado para el Neural Engine de Apple, no un cambio de arquitectura. La documentación pública de Kyutai Pocket TTS sí destaca un modelo pequeño que funciona en CPU y clonación de voz zero-shot con unos 5 segundos de audio; son características del modelo base, no confirmadas de forma específica para este bundle alemán.

## Capacidades
- Síntesis de voz en alemán a partir de texto, con salida de audio generada por el modelo.
- Ejecución en el Neural Engine de Apple mediante Core ML, pensada para aplicaciones iOS, iPadOS y macOS.
- Modelo compacto de 100M de parámetros, con un repositorio de 0,3 GB.
- La documentación de Pocket TTS atribuye al modelo base clonación de voz zero-shot a partir de aproximadamente 5 segundos de audio; este repositorio no lo detalla explícitamente para la variante alemana.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión ni entrada de audio general; es un modelo TTS, no un LLM.
- Cobertura multilingüe limitada al alemán; no se anuncia soporte de otros idiomas en este bundle.
- No se documentan controles de prosodia, emoción, velocidad o estilo más allá de los que pueda exponer el SDK de TheStage.

## Casos de uso
- Asistentes de voz en aplicaciones Apple: generar respuestas habladas en alemán directamente en el dispositivo con el Neural Engine, sin enviar texto a un servicio cloud y reduciendo la latencia de red.
- Accesibilidad: lectura en voz alta de artículos, mensajes o interfaces para usuarios con discapacidad visual o dislexia en iPhone, iPad y Mac, aprovechando la inferencia local.
- Aprendizaje de alemán: reproducir pronunciaciones de vocabulario y frases en aplicaciones educativas, con generación bajo demanda y sin coste por llamada a una API.
- Audiolibros y boletines: convertir artículos o noticias en audio alemán dentro de una aplicación macOS o iOS, con un bundle de 0,3 GB que puede integrarse en la app.
- Navegación y avisos: instrucciones de voz para aplicaciones de mapas o conducción en alemán, con inferencia local y funcionamiento sin conexión.
- Atención al cliente en kioscos o aplicaciones de soporte: respuestas habladas en alemán para flujos guiados, sin necesidad de GPU dedicada ni de infraestructura de servidor.
- Localización de contenido: generación de pistas de voz en alemán para demostraciones, prototipos o versiones localizadas de productos, siempre con revisión humana de la pronunciación y del contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas de calidad TTS como MOS, WER, latencia o throughput para este bundle alemán, y no procede aplicar benchmarks de LLM como MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje general.

## Requisitos de hardware
- No aplica VRAM dedicada: el modelo se ejecuta en Apple Silicon con Core ML y el Neural Engine, usando memoria unificada.
- Estimación teórica a partir de los 100M de parámetros: aproximadamente 200 MB en FP16 y 100 MB en INT8 para los pesos, sin contar codec, vocoder ni otros componentes del bundle. El repositorio completo ocupa 0,3 GB; es una estimación, no un dato oficial.
- Dispositivos recomendados: iPhone, iPad y Mac con Neural Engine. No se documentan modelos mínimos ni versiones mínimas de iOS o macOS.
- No está pensado para GPU NVIDIA ni para servidores con CUDA; no se usa con vLLM, TGI, llama.cpp ni Ollama.
- Despliegue: TheStage Apple SDK y Core ML. No se proporcionan instrucciones para llama.cpp, Ollama u otros motores de inferencia.
- Latencia y throughput: no disponible para este bundle. Como referencia externa, una review independiente del Pocket TTS base de 100M reporta aproximadamente 6 veces tiempo real en CPU de MacBook Air M4; el rendimiento en ANE puede variar y no está medido en la información disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-de | 100M | Alemán (de) | Core ML / ANE | CC-BY-4.0 | HuggingFace y SDK de TheStage |
| kyutai/pocket-tts (variante `languages/german`) | 100M | Alemán (variante); otros idiomas no verificados | No disponible | CC-BY-4.0 según la model card; la página de Kyutai menciona MIT para Pocket TTS: discrepancia a verificar | HuggingFace |
| TheStageAI/pocket-tts-18m-en | 18M | Inglés (en) | Core ML / ANE | No disponible | HuggingFace |

Frente a la variante inglesa de 18M, este modelo tiene aproximadamente 5,5 veces más parámetros y está especializado en alemán. Frente al modelo base de Kyutai, añade el empaquetado Core ML/ANE para el SDK de TheStage. No hay datos públicos de calidad (MOS) que permitan comparar la naturalidad de las tres alternativas.

## Limitaciones y advertencias
- Solo soporta alemán; no es un modelo multilingüe ni puede cambiar de idioma dentro de este bundle.
- No es un LLM: no razona, no hace tool calling, no ejecuta agentes ni mantiene conversaciones multi-turno.
- No se han publicado benchmarks de calidad TTS para este bundle; no se puede afirmar un nivel de naturalidad o inteligibilidad concreto.
- No se documentan datos de entrenamiento, composición del dataset ni evaluación de sesgos; la cobertura fonética y dialectal del alemán es desconocida.
- Riesgo de errores de pronunciación en nombres propios, siglas, números, términos técnicos y palabras extranjeras; no se documenta normalización textual específica para alemán.
- La clonación de voz, si se usa a través del modelo base, plantea riesgos de suplantación y requiere consentimiento explícito y cumplimiento normativo.
- Licencia CC-BY-4.0: permite uso comercial con atribución y otras condiciones; debe revisarse el texto completo. La posible discrepancia con la licencia MIT mencionada por Kyutai para Pocket TTS debe aclararse antes de producción.
- Dependencia de Apple: requiere Core ML y Neural Engine; no es desplegable en GPU NVIDIA ni en entornos Linux con CUDA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria visible.
- No se documentan latencia, consumo energético, tamaño máximo de texto de entrada ni comportamiento en streaming.

## Enlaces
- [TheStageAI/pocket-tts-100m-de en HuggingFace](https://huggingface.co/TheStageAI/pocket-tts-100m-de)
- [kyutai/pocket-tts (modelo base)](https://huggingface.co/kyutai/pocket-tts)
- [Pocket TTS en Kyutai](https://kyutai.org/pocket-tts/)
- [Review independiente de Pocket TTS](https://andrew.ooo/posts/pocket-tts-kyutai-cpu-voice-cloning-review/)
- [TheStageAI en HuggingFace](https://huggingface.co/TheStageAI)
- [TheStageAI/pocket-tts-18m-en](https://huggingface.co/TheStageAI/pocket-tts-18m-en)
- [Demo de Pocket TTS en TTS.ai](https://tts.ai/voices/pocket-tts/)
