# TheStageAI/pocket-tts-100m-nl

## Resumen

pocket-tts-100m-nl es un paquete de motores Core ML / ANE del modelo neerlandés de síntesis de voz (TTS) de 100 millones de parámetros derivado de kyutai/pocket-tts, publicado por TheStageAI para su SDK de Apple. No se trata de un modelo entrenado desde cero por TheStageAI, sino de una conversión y empaquetado del checkpoint `languages/dutch` de Kyutai (licencia CC-BY-4.0) en formato Core ML optimizado para la Neural Engine (ANE) de los chips Apple Silicon, con el identificador de bundle `nl`.

El modelo resuelve un problema de despliegue: llevar un TTS neuronal de tamano reducido (100M de parámetros) a aplicaciones iOS y macOS con aceleración por hardware nativa, sin depender de frameworks de inferencia externos. Al estar integrado en el SDK de TheStage (`model_type: pocket-tts`), está pensado para ser consumido directamente por la librería `pocket-tts` en el ecosistema Apple.

Es relevante ahora porque la familia pocket-tts de Kyutai apuesta por TTS compactos y multilingües que caben en dispositivos, y este paquete añade la variante neerlandesa con un pipeline de conversión a Core ML/ANE. La información pública disponible es muy escasa: la model card se limita a identificar el origen, la licencia y el idioma, sin detallar arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia kyutai/pocket-tts; empaquetado Core ML / ANE) |
| Parametros totales | 100M (según nombre del modelo y model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (empaquetado Core ML; se desconoce la precisión de los motores ANE) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (bundle para TheStage Apple SDK); tamano del repo 0,6 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. La model card indica únicamente que se trata de los motores Core ML / ANE del modelo neerlandés de 100M de parámetros de kyutai/pocket-tts (rama `languages/dutch`, CC-BY-4.0, Kyutai), empaquetados para el SDK de Apple de TheStage con `model_type: pocket-tts` y bundle de idioma `nl`. No se especifican el tipo de red (por ejemplo, codec de audio, difusión o transformer autoregresivo), la composición del dataset de entrenamiento, el número de tokens ni si hubo ajuste por RLHF o DPO.

La innovación técnica documentada es el propio empaquetado: conversión a Core ML con ejecución en la Neural Engine (ANE) de Apple Silicon, lo que permite inferencia local acelerada en dispositivos Apple. Cualquier detalle adicional sobre la arquitectura del modelo original debe consultarse en la model card de kyutai/pocket-tts.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto de entrada.
- Ejecución local en dispositivos Apple mediante Core ML y la Neural Engine (ANE).
- Integración con el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts` y bundle de idioma `nl`.
- Modelo compacto (100M de parámetros), adecuado para entornos con recursos limitados.
- No se documentan capacidades de clonación de voz, control de estilo, tool calling, agentes, visión, audio de entrada ni modo de razonamiento.
- Capacidad multilingüe: limitada al neerlandés según la model card.

## Casos de uso

- Síntesis de voz en aplicaciones iOS y macOS: el modelo se integra mediante el SDK de TheStage y se ejecuta en la ANE, lo que permite generar voz neerlandesa en el dispositivo sin enviar texto a servidores externos.
- Lectura de contenido en neerlandés (noticias, artículos, correo): al ser un TTS compacto de 100M de parámetros, puede generar audio bajo demanda en apps de lectura sin penalizar el tamano de la aplicación.
- Accesibilidad para usuarios neerlandófonos: conversión de texto a voz para lectores de pantalla y asistentes de accesibilidad en dispositivos Apple, con inferencia local y baja dependencia de red.
- Asistentes de voz embebidos: generación de respuestas habladas en neerlandés dentro de apps de productividad o domótica que ya usan el SDK de TheStage.
- Aprendizaje de idiomas: reproducción de pronunciación neerlandesa de frases y vocabulario en aplicaciones educativas, aprovechando la ejecución local para uso offline.
- Prototipado de interfaces conversacionales: evaluación de un pipeline TTS neerlandés en entornos Apple antes de escalar a un modelo mayor o a infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está empaquetado para Core ML / ANE y se ejecuta en Apple Silicon. El tamano del repositorio es de 0,6 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: no disponible. El destino es la Neural Engine de chips Apple Silicon (model card no especifica modelos concretos de chip).
- Cabe en GPU de consumo: no disponible como dato verificado; el empaquetado está orientado a hardware Apple, no a GPU NVIDIA.
- Opciones de despliegue: SDK de Apple de TheStage con la librería `pocket-tts` y motores Core ML / ANE. No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-nl | 100M | no disponible | neerlandés | CC-BY-4.0 | Core ML / ANE (SDK Apple de TheStage) |
| kyutai/pocket-tts (`languages/dutch`) | 100M (modelo base) | no disponible | neerlandés | CC-BY-4.0 | Pesos originales de Kyutai; detalles no disponibles en esta ficha |
| Otros TTS compactos multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de terceros no puede completarse con datos verificados en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no se documentan arquitectura, datos de entrenamiento, cuantización ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción.
- Idioma limitado al neerlandés; no se garantiza un comportamiento correcto con texto en otros idiomas.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS; no se han publicado evaluaciones de fidelidad o naturalidad.
- Posibles sesgos derivados del dataset de entrenamiento del modelo base de Kyutai, no documentados en esta ficha.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario cumplir las condiciones de atribución a Kyutai y a TheStageAI.
- El paquete está atado al ecosistema Apple (Core ML / ANE) y al SDK de TheStage; no es directamente portable a otras plataformas sin reconversión.
- No se documentan limitaciones de longitud de texto de entrada ni de contexto; conviene validarlas empíricamente antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-nl
- Modelo base de Kyutai: https://huggingface.co/kyutai/pocket-tts
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
