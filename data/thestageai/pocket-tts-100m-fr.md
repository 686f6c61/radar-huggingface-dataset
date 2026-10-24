# TheStageAI/pocket-tts-100m-fr

## Resumen

pocket-tts-100m-fr es un paquete de motores Core ML / ANE del modelo francés de 100 millones de parámetros de kyutai/pocket-tts, empaquetado por TheStageAI para su SDK de Apple. No es un modelo entrenado desde cero: es una conversión y distribución del checkpoint francés de Kyutai (carpeta `languages/french`, licencia CC-BY-4.0) con el identificador `model_type: pocket-tts` y bundle de idioma `fr`, preparada para ejecutarse sobre el Apple Neural Engine.

El problema que resuelve es el despliegue de síntesis de voz en local dentro del ecosistema Apple: en lugar de servir un modelo TTS en servidor, el SDK carga estos artefactos y ejecuta la inferencia en el dispositivo, sin conexión de red y sin coste por petición. El repositorio ocupa 0,5 GB, un tamaño coherente con un modelo de 100M de parámetros más los artefactos de compilación de Core ML.

Resulta relevante para desarrolladores de aplicaciones iOS, iPadOS y macOS que necesiten TTS en francés con privacidad por diseño y funcionamiento offline. La model card es mínima: no documenta la arquitectura interna, los datos de entrenamiento, los esquemas de cuantización ni resultados de benchmarks, por lo que la evaluación técnica queda limitada a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de kyutai/pocket-tts; la model card no describe la topología interna) |
| Parametros totales | 100 M (según nombre del modelo y model card) |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se indica límite de texto de entrada) |
| Tipos de cuantizacion | No disponible (artefactos Core ML; no se confirma precisión FP16/INT8) |
| Idiomas soportados | Francés (fr) únicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (motores compilados para Apple Neural Engine); repositorio de 0,5 GB |
| Pipeline | text-to-speech |
| Libreria | pocket-tts |
| Etiquetas | pocket-tts, tts, kyutai, coreml, ane, thestage |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-10-24 |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna del modelo: no se especifica si el decodificador acústico es un transformer autorregresivo, un modelo de difusión o un esquema híbrido, ni se detalla el vocoder o el tokenizador de audio empleados. Lo único documentado es que se trata de los motores Core ML / ANE del modelo francés de 100M de parámetros de kyutai/pocket-tts, distribuidos como artefactos para el SDK de Apple con `model_type: pocket-tts` y bundle de idioma `fr`.

Tampoco hay datos sobre el entrenamiento: se desconoce el número de tokens o de horas de audio utilizadas, la composición del corpus, si hubo ajuste por RLHF/DPO o si se aplicaron técnicas de control de prosodia. Al ser una conversión de un checkpoint existente, el trabajo de TheStageAI se centraría en la traducción del grafo a Core ML y en la partición y compilación para el Neural Engine, pero la model card no lo detalla. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, cuantización post-entrenamiento) sería especulativa con la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en francés a partir de texto de entrada.
- Ejecución en el Apple Neural Engine mediante motores Core ML, lo que permite inferencia local sin conexión de red.
- Integración con el SDK de Apple de TheStageAI a través de `model_type: pocket-tts` y bundle de idioma `fr`.
- Modelo ligero (100M de parámetros), adecuado para apps móviles con presupuesto de memoria y cómputo reducido.
- Número de voces disponibles: no disponible.
- Control de prosodia, velocidad o emoción: no disponible.
- Soporte de SSML u otro marcado de entrada: no disponible.
- Clonación de voz o voces personalizadas: no disponible.
- Soporte de tool calling / function calling: no aplica (modelo TTS).
- Capacidades de agente, razonamiento multi-paso, visión o audio de entrada: no aplica.
- Capacidades multilingües: no; el bundle está limitado a francés.

## Casos de uso

- Lectura de contenido en apps iOS/macOS: el modelo convierte artículos, notas o correos en audio en francés directamente en el dispositivo, sin enviar texto a un servidor, lo que simplifica el cumplimiento de RGPD.
- Accesibilidad: narración de interfaz, documentos y notificaciones para usuarios con discapacidad visual en apps francófonas, aprovechando que la inferencia es local y no depende de conectividad.
- Asistentes de voz offline: integración en asistentes embebidos que deben responder en francés en entornos sin red (aviones, zonas rurales, recintos seguros) gracias a los motores Core ML.
- Aprendizaje de idiomas: reproducción de frases y ejercicios de pronunciación en francés dentro de apps educativas, con generación bajo demanda y sin coste por petición de API.
- Audiolibros y boletines generados en el dispositivo: conversión de boletines internos o resúmenes de noticias a audio en francés en un pipeline local, evitando cuotas de servicios TTS en la nube.
- Prototipado de interfaces conversacionales: pruebas de UX de voz en simuladores y dispositivos Apple reales antes de comprometerse con un proveedor TTS cloud, usando el SDK de TheStage para medir latencia y consumo.
- Domótica y automoción: respuestas habladas en francés para paneles de control o sistemas embebidos basados en Apple Silicon, donde el coste energético del Neural Engine es menor que el de una GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, WER, similitud de hablante), latencia ni throughput, y la búsqueda web realizada no devolvió documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para el Apple Neural Engine, no para GPU discretas con CUDA.
- Huella de memoria estimada: en torno a 200 MB para los pesos en FP16 con 100M de parámetros; el repositorio completo ocupa 0,5 GB, incluyendo artefactos de compilación. Cifra estimada, no confirmada por el autor.
- GPU recomendadas: ninguna GPU NVIDIA o AMD; el destino son chips Apple con Neural Engine (gama A-series en iPhone/iPad y M-series en Mac).
- Cabe en hardware de consumo: sí, en dispositivos Apple con Neural Engine; no está pensado para ejecutarse en GPU de consumo x86.
- Opciones de despliegue: TheStage Apple SDK (vía `model_type: pocket-tts`) y Core ML directamente. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, y por el formato de pesos no serían aplicables sin conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-fr | 100 M | Francés | Core ML / ANE | CC-BY-4.0 | No disponible | Conversión para SDK de Apple; 0 descargas |
| kyutai/pocket-tts (original) | 100 M en la variante francesa (según esta model card) | Multilingüe, incluye `languages/french` | No disponible en la información proporcionada | CC-BY-4.0 | No disponible | Modelo base del que deriva esta conversión |
| Otras alternativas TTS ligeras on-device | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con otras familias TTS (Piper, Kokoro, XTTS, etc.) no es posible con los datos disponibles: no hay métricas de calidad ni especificaciones verificadas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida al francés: no sirve para otros idiomas sin cambiar de bundle.
- Dependencia total del ecosistema Apple: los artefactos son Core ML para el Neural Engine; no se pueden ejecutar en Linux, Windows o GPUs NVIDIA sin reconversión.
- Documentación mínima: sin arquitectura, datos de entrenamiento ni métricas, es difícil evaluar la calidad antes de integrarlo.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia pública de uso en producción.
- Riesgo de alucinación acústica inherente a los modelos TTS: el audio puede omitir, repetir o distorsionar fragmentos del texto de entrada, especialmente con entradas largas, números, siglas o nombres propios.
- Sesgos no evaluados: al no documentarse el corpus de entrenamiento, no se puede valorar el sesgo de acento, género o registro del habla generada.
- Sin información sobre límite de longitud de texto por petición; conviene trocear entradas largas en producción.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a Kyutai (y a TheStageAI por el empaquetado) y conservar el aviso de licencia; no hay cláusula de patentes adicional indicada.
- Al derivar de un modelo de terceros, cualquier cambio en la licencia o en el modelo base de kyutai/pocket-tts afecta a la redistribución.
- La model card no indica si los motores están firmados, notarizados o validados para App Store; habría que verificarlo con el proveedor del SDK.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheStageAI/pocket-tts-100m-fr
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Organización TheStageAI en HuggingFace: https://huggingface.co/TheStageAI
- Organización Kyutai en HuggingFace: https://huggingface.co/kyutai
- Paper, blog, repositorio o demo adicionales: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo, solo páginas de casas de subastas francesas sin relación)
