# waheedkhan05/Qatra-LFM2.5-350M-Urdu

## Resumen

Qatra-LFM2.5-350M-Urdu es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario waheedkhan05 bajo la etiqueta Aabshar AI. Se trata de un modelo de generacion de texto de 350 millones de parametros especializado en urdu, disenado explicitamente para inferencia en dispositivos de recursos muy limitados: telefonos Android de gama baja, Raspberry Pi, terminales punto de venta y CPUs de Mac. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La propuesta de valor del modelo es su huella de memoria: aproximadamente 250 MB en cuantizacion Q4 (GGUF u ONNX), lo que lo hace viable en hardware donde modelos de mayor tamano no caben. Sus aplicaciones declaradas incluyen autocompletado en dispositivo, clasificacion de SMS, deteccion de intenciones y respuesta a consultas sin conexion. Es relevante para escenarios de "edge AI" en los que la latencia, la privacidad o la ausencia de conectividad impiden recurrir a APIs en la nube.

No se dispone de informacion detallada sobre la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento ni resultados de evaluacion. La model card es muy breve y se limita a describir el tamano, el hardware objetivo y los casos de uso previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | 350 millones (segun nombre del modelo y base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (GGUF y ONNX); otras no disponibles |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face); GGUF y ONNX mencionados para despliegue |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card. Al ser un ajuste fino de LiquidAI/LFM2.5-350M, hereda la arquitectura del modelo base de LiquidAI, pero la informacion proporcionada no detalla si se trata de un transformer convencional, un modelo de espacio de estados (SSM) o una arquitectura hibrida. Tampoco se especifica el numero de capas, dimensiones ocultas ni mecanismos de atencion.

Respecto al entrenamiento, la model card no indica el volumen de datos de ajuste fino, la composicion del corpus en urdu, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Se desconoce igualmente si el ajuste fue supervisado (SFT) sobre instrucciones, sobre texto plano o sobre tareas especificas de clasificacion. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en urdu, orientada a tareas de longitud corta y media.
- Autocompletado de texto en dispositivo, segun los casos de uso declarados por el autor.
- Clasificacion de SMS e identificacion de intenciones (intent detection).
- Respuesta a consultas en modo offline, sin conexion a red.
- Inferencia local en hardware de bajos recursos (telefonos Android economicos, Raspberry Pi, terminales POS, CPUs de Mac).
- Capacidades multilingues limitadas al urdu; no se declara soporte de otros idiomas.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Autocompletado en teclados moviles: con una huella de unos 250 MB en Q4, el modelo puede ejecutarse en telefonos Android de gama baja para sugerir palabras o frases en urdu sin enviar pulsaciones a la nube, preservando la privacidad del usuario.
- Clasificacion de SMS en dispositivo: util para filtrar spam, mensajes fraudulentos o categorizar notificaciones bancarias en urdu directamente en el terminal, sin coste de API ni latencia de red.
- Deteccion de intenciones en asistentes de voz locales: el modelo puede etiquetar la intencion de una consulta corta en urdu antes de derivar a un motor de acciones, gracias a su bajo requisito de memoria.
- Terminales punto de venta (POS): generacion de respuestas y clasificacion de transacciones o consultas de clientes en comercios con conectividad intermitente, donde un modelo en la nube no es fiable.
- Respuesta a preguntas offline en dispositivos educativos o kioscos: atender consultas frecuentes en urdu desde una base local sin depender de internet.
- Prototipado e investigacion en PLN para urdu: al ser un modelo pequeno y con licencia Apache 2.0, sirve como base para experimentos de ajuste fino adicional, evaluacion de tecnicas de cuantizacion o despliegue en entornos embebidos.
- Raspberry Pi y domotica local: integracion en asistentes de hogar que procesan comandos en urdu en el propio dispositivo, con consumo de memoria compatible con placas de 1-2 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 250 MB en cuantizacion Q4 (GGUF u ONNX), segun la model card. En precision completa (fp16) el peso de los 350 M de parametros rondaria los 700 MB, aunque este dato no lo confirma el autor.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU y hardware embebido.
- Compatibilidad con GPU de consumo: por su tamano, cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superiores), aunque no es el objetivo declarado.
- Hardware objetivo declarado: telefonos Android de gama baja, Raspberry Pi, terminales POS y CPUs de Mac.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; ONNX Runtime para el formato ONNX. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qatra-LFM2.5-350M-Urdu | 350 M | no disponible | urdu | Apache 2.0 | Edge AI, dispositivo local |
| LiquidAI/LFM2.5-350M (base) | 350 M | no disponible | no disponible | no disponible en la informacion | Modelo base generalista |
| Alternativas de tamano similar para urdu | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables especializados en urdu de tamano similar, ni de datos de rendimiento que permitan una comparacion cuantitativa con el modelo base.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse sobre datos en urdu, puede heredar sesgos presentes en el corpus del modelo base y del ajuste fino.
- Riesgo de alucinacion: no cuantificado por el autor; en modelos de 350 M de parametros el riesgo de generar contenido incorrecto en tareas abiertas es elevado.
- Capacidad limitada por el tamano: 350 M de parametros restringen el razonamiento complejo, el conocimiento factual y la coherencia en generaciones largas.
- Cobertura linguistica restringida al urdu; no se garantiza un comportamiento correcto en otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con conversaciones largas.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- No se declara soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran invocacion de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waheedkhan05/Qatra-LFM2.5-350M-Urdu
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
