# TR4F/crackio-talk

## Resumen

Crackio Talk es un adaptador LoRA (PEFT) sobre el modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario TR4F para el proyecto Crackio. Su propósito es muy concreto: transformar el estilo de respuesta del modelo base para que converse como una persona en una llamada de voz, es decir, respuestas cortas, cálidas, informales y sin formato ni listas, ajustando la longitud de la réplica a la del interlocutor. No se trata de un modelo nuevo, sino de un ajuste fino de estilo sobre un modelo de 2B parámetros con capacidades de visión y texto.

El adaptador se integra en el modo Talk de Crackio, una aplicación que escucha al usuario, genera la respuesta con LFM3-VL-2B más este LoRA y sintetiza cada frase en voz alta en cuanto se escribe, todo ejecutado en la GPU local. El repositorio incluye los pesos en dos formatos: un safetensors para el puente ComfyUI de Crackio y un adaptador PEFT estándar (rango 32, alpha 32) aplicado sobre las capas de atención y MLP del modelo de lenguaje.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de ajuste de estilo conversacional para voz; por otro, sirve como ejemplo de adaptación de un modelo pequeño y multimodal con licencia restrictiva (LFM Open License v1.0) para uso comercial limitado a empresas con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal LiquidAI/LFM3-VL-2B |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (entrenado exclusivamente con conversaciones en ingles) |
| Licencia | LFM Open License v1.0 (uso comercial solo para empresas con ingresos anuales inferiores a 10 M USD) |
| Formato de pesos | safetensors (archivo para ComfyUI y carpeta `peft/` como adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre las capas de atención y MLP del modelo de lenguaje de LFM3-VL-2B, un transformer multimodal de 2B parámetros de Liquid AI. No se modifica la torre de visión ni el resto de componentes del modelo base; el ajuste se limita al comportamiento conversacional del decodificador de texto. El repositorio ocupa 0,3 GB y se distribuye tanto en formato nativo PEFT como en un safetensors preparado para el puente ComfyUI de Crackio.

El entrenamiento consistió en tres épocas sobre 89 conversaciones cortas de texto, valoradas en la página Rate de Crackio. Solo se aprendió la última réplica de cada conversación; los turnos anteriores se usaron como contexto. De las 66 respuestas objetivo, 66 fueron escritas por el autor de Crackio con sus propias palabras y 23 fueron seleccionadas por el autor entre dos respuestas generadas por el propio LFM3-VL-2B bajo una de 14 instrucciones breves de habla. No se emplearon respuestas de otros modelos de IA. Los turnos del interlocutor (89 momentos cotidianos, 17 de ellos con varios turnos) fueron redactados por Claude de Anthropic exclusivamente como prompts de prueba. El prompt de sistema empleado durante el entrenamiento instruye al modelo a hablar como una persona real, con respuestas breves, cálidas y sin listas, emojis ni formato.

## Capacidades

- Generación de texto conversacional con estilo oral: respuestas cortas, cálidas e informales, ajustadas a la longitud del turno del interlocutor.
- Conversación multi-turno con contexto de la conversación previa (el adaptador se aplica sobre un modelo base con ventana de contexto, aunque su longitud no se detalla).
- Procesamiento de imagen y texto (image-text-to-text) heredado del modelo base LFM3-VL-2B, aunque el adaptador se entrenó solo con texto.
- Generación de respuestas sin formato: sin listas, sin emojis y sin marcado, adecuada para síntesis de voz frase a frase.
- Integración con el pipeline de voz de Crackio: el puente ComfyUI expone `POST /crackio/lfm3` y `/crackio/lfm3/stream` con el parámetro `"lora": "chat"`.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Asistente de voz en tiempo real: el adaptador genera réplicas breves que Crackio sintetiza en cuanto se escriben, lo que reduce la latencia percibida en una llamada conversacional.
- Acompañamiento conversacional cotidiano: respuestas a momentos como "mi perro está enfermo" o "cuéntame un chiste" con un tono cercano y una longitud proporcional al mensaje recibido.
- Integración en aplicaciones de escritorio con GPU local: el adaptador se carga junto al modelo base en la GPU del usuario mediante el puente ComfyUI, sin depender de servicios en la nube.
- Prototipado de interfaces de voz: sirve como banco de pruebas para evaluar estilos conversacionales antes de invertir en un ajuste fino mayor o en un modelo de mayor tamaño.
- Filtrado de estilo en pipelines TTS: al eliminar listas, emojis y formato, las respuestas son directamente aptas para motores de síntesis de voz sin postprocesado.
- Evaluación de adaptadores LoRA de bajo coste: con 89 ejemplos y tres épocas, es un caso reproducible para estudiar cómo un ajuste mínimo altera la longitud media de respuesta (13,8 palabras frente a 17,3 del modelo base en 18 momentos reservados).
- Demostraciones de conversación multimodal: aunque entrenado solo con texto, puede combinarse con la entrada de imagen del modelo base en escenarios de descripción conversacional breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta una evaluación cualitativa propia sobre 18 momentos reservados:

| Metrica | Crackio Talk (LoRA) | LFM3-VL-2B solo |
|---|---|---|
| Longitud media de respuesta (palabras) | 13,8 | 17,3 |
| Mediana de longitud de respuesta (palabras) | 10,5 | 14 |
| Tono percibido | Mas casual | Mas asistencial |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un LoRA sobre un modelo base de 2B, el requisito dominante es el del modelo base, que en precisión completa ronda los 4-5 GB y en cuantizaciones de 4 bits puede situarse en torno a 1,5-2 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no se especifican; el autor indica que la inferencia se ejecuta en la GPU del propio usuario a través de Crackio.
- GPU de consumo: es plausible que quepa en GPUs de consumo con suficiente VRAM para el modelo base de 2B, aunque no se confirma ningún modelo concreto.
- Opciones de despliegue: puente ComfyUI de Crackio (`ComfyUI/models/lfm3/`) y PEFT cargando `LiquidAI/LFM3-VL-2B` y aplicando `peft/` encima.
- Latencia y throughput: no disponibles. El diseño de streaming por frases sugiere que la latencia percibida se reduce al sintetizar cada frase en cuanto se genera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crackio Talk (este adaptador) | LoRA sobre 2B | No disponible | Estilo conversacional para voz | LFM Open License v1.0 (comercial < 10 M USD) | HuggingFace, 0 descargas |
| LiquidAI/LFM3-VL-2B (base) | 2B | No disponible | Multimodal image-text-to-text | LFM Open License v1.0 | HuggingFace |
| Alternativas de 2B conversacional | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Algunas preguntas ("¿te gusta la música?") siguen recibiendo respuestas largas y con tono de asistente, y algunas réplicas resultan extrañas.
- El entrenamiento se basó en solo 89 ejemplos, por lo que el modelo puede repetir casi literalmente algunas respuestas del autor.
- Entrenado exclusivamente con conversaciones en inglés; no se garantiza un comportamiento adecuado en otros idiomas.
- Riesgo de alucinación heredado del modelo base, no mitigado por el adaptador.
- Licencia LFM Open License v1.0: el uso comercial solo se permite a empresas con ingresos anuales inferiores a 10 millones de dólares; es necesario revisar `NOTICE` para la atribución y los cambios realizados.
- El adaptador está pensado para el pipeline de Crackio y su prompt de sistema específico; fuera de ese contexto, el estilo puede degradarse.
- No se documentan evaluaciones de sesgo, seguridad ni robustez en producción.
- El repositorio no registra descargas ni valoraciones, lo que limita la validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/TR4F/crackio-talk
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio de Crackio: https://github.com/RafalOfficial/Crackio
