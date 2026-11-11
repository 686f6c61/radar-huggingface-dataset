# TheStageAI/pocket-tts-100m-pt

## Resumen

pocket-tts-100m-pt es un paquete de motores Core ML y ANE (Apple Neural Engine) del modelo de síntesis de voz pocket-tts de Kyutai, en su variante portuguesa de 100 millones de parámetros. Lo publica TheStageAI como parte del SDK de Apple de TheStage, con el identificador de tipo de modelo `pocket-tts` y el código de idioma `pt` en el bundle. No es un modelo entrenado desde cero por TheStageAI, sino una conversión y empaquetado del checkpoint `languages/portuguese` de `kyutai/pocket-tts`, distribuido bajo licencia CC-BY-4.0.

El modelo resuelve el problema de ejecutar síntesis de voz en hardware Apple con aceleración nativa, evitando la dependencia de backends de inferencia genéricos. Al estar compilado para Core ML y el Neural Engine, está pensado para despliegue en dispositivos y equipos de Apple dentro del ecosistema del SDK de TheStage, no para servidores GPU convencionales.

La relevancia actual es acotada pero concreta: los modelos TTS ligeros de 100M de parámetros permiten síntesis en tiempo real con huella de memoria reducida, y esta variante añade el camino de despliegue específico para Apple. El repositorio ocupa 0,6 GB, lo que es coherente con un conjunto de pesos y artefactos compilados de un modelo de ese tamaño. No hay información pública sobre descargas ni adopción (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS base: kyutai/pocket-tts; artefactos Core ML / ANE) |
| Parámetros totales | 100M (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato compilado Core ML; precisión no especificada) |
| Idiomas soportados | portugués (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que deriva de `kyutai/pocket-tts`, un modelo de texto a voz de Kyutai, y que esta publicación concreta contiene los motores compilados para Core ML y Apple Neural Engine, empaquetados para el SDK de Apple de TheStage con `model_type: pocket-tts`. El tamaño declarado es de 100 millones de parámetros y el bundle corresponde a la variante portuguesa del modelo base (`languages/portuguese`).

No se han publicado en la información disponible datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino específico para portugués. Tampoco se documentan innovaciones técnicas del modelo original (por ejemplo, tipo de decodificador, vocoder o esquema de atención). Cualquier afirmación sobre estos puntos requeriría consultar la model card de `kyutai/pocket-tts`, que no forma parte de la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en portugués.
- Ejecución acelerada en hardware Apple mediante Core ML y el Neural Engine (ANE).
- Integración con el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts`.
- Modelo ligero (100M de parámetros), adecuado para inferencia con recursos limitados.
- Soporte de un único idioma: portugués.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso; no disponible.

## Casos de uso

- Lectura de contenido en aplicaciones iOS y macOS: el modelo puede convertir texto en audio en el dispositivo usando el Neural Engine, sin enviar datos a un servidor, lo que reduce latencia y mejora la privacidad.
- Accesibilidad para usuarios con discapacidad visual: integración en lectores de pantalla y aplicaciones de asistencia que necesiten una voz portuguesa sintetizada localmente con un modelo de 100M de parámetros.
- Asistentes de voz embebidos: generación de respuestas habladas en portugués dentro de apps nativas, aprovechando el empaquetado Core ML para evitar dependencias de runtime externas.
- Audiolibros y podcasts generados: conversión por lotes de texto largo a audio en portugués en equipos Apple, con coste de cómputo bajo gracias al tamaño reducido del modelo.
- Prototipado rápido en el ecosistema TheStage: el bundle `pt` permite a desarrolladores que ya usan el SDK de Apple de TheStage añadir una voz portuguesa sin cambiar de pipeline.
- Pruebas de localización: generación de locuciones de prueba en portugués para validar interfaces y flujos de producto antes de contratar voces profesionales.
- Investigación en TTS eficiente: servir como referencia de despliegue de un modelo de 100M en ANE para comparar latencia y consumo frente a backends genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está empaquetado para Core ML y el Neural Engine de Apple, no para GPU NVIDIA.
- GPU recomendadas: no disponible; el destino es hardware Apple con soporte de ANE (Apple Silicon y equipos compatibles con Core ML).
- ¿Cabe en GPU de consumo? No se documenta una ruta de despliegue para GPU de consumo; el formato publicado es Core ML/ANE.
- Opciones de despliegue: SDK de Apple de TheStage (`model_type: pocket-tts`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-pt | 100M | pt | Core ML / ANE | CC-BY-4.0 | Conversión del modelo de Kyutai para el SDK de TheStage |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | CC-BY-4.0 | Modelo base del que deriva esta publicación |
| Otras variantes de idioma de pocket-tts en TheStage | 100M (presumiblemente) | según bundle | Core ML / ANE | CC-BY-4.0 | No verificadas en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo soporta portugués; no es un modelo multilingüe.
- No hay información sobre sesgos de voz, acento o género en el modelo base ni en esta conversión.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí de errores de pronunciación o prosodia no documentados.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar a los autores originales (Kyutai) y respetar los términos de la licencia.
- El paquete está atado al SDK de Apple de TheStage y al runtime Core ML/ANE; no es portable directamente a otros backends sin reconversión.
- No se documentan límites de longitud de texto de entrada ni de contexto.
- El repositorio no tiene descargas ni likes registrados, lo que sugiere poca validación comunitaria; conviene probarlo antes de usarlo en producción.
- No se especifican precisiones numéricas ni cuantizaciones, lo que dificulta estimar calidad y latencia sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-pt
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Organización TheStageAI: https://huggingface.co/TheStageAI
- Organización Kyutai: https://huggingface.co/kyutai
