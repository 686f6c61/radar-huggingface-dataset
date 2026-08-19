# VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit

## Resumen

El modelo VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit es un ajuste fino de voz a voz (speech-to-speech) sobre el modelo base Qwen/Qwen3-Omni-30B-A3B-Instruct, cuantizado a 4 bits con la técnica DynQuant. El autor, VikramPal, ha entrenado únicamente el componente Thinker (la parte que procesa la entrada y decide la respuesta) mediante QLoRA con rango 16, dejando congelados el Talker y el decodificador de audio code2wav. El resultado es un modelo capaz de recibir audio y generar respuestas habladas a 24 kHz, con un peso reducido de aproximadamente 21,4 GiB en disco.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada y optimizada para despliegue en entornos con recursos limitados, manteniendo la arquitectura multimodal any-to-any del Qwen3-Omni original. Sin embargo, el autor advierte explícitamente que no se han realizado evaluaciones de precisión ni comparaciones con el checkpoint base, solo una prueba de humo con cuatro clips. Esto lo convierte en una opción interesante para experimentación, pero con cautela para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal any-to-any: Thinker + Talker + code2wav |
| Parametros totales | 30B (MoE, 3B activos) segun el modelo base; el fine-tune desglosa Thinker ~31,7B y Talker+code2wav ~3,5B |
| Parametros activos | 3B (segun la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 4-bit (este modelo); tambien disponibles versiones 3-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizacion DynQuant) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-Omni, un modelo unificado de extremo a extremo que procesa texto, audio, imagen y video, y genera respuestas de texto o voz en tiempo real. En este fine-tune, el autor ha entrenado únicamente el Thinker (31,72B parámetros) mediante QLoRA con rango 16 sobre las proyecciones de atención y MLP densas. El Talker y el code2wav (3,54B parámetros) permanecen congelados y bit-idénticos al checkpoint base. El entrenamiento consistió en 500 pasos de optimización con batch efectivo de 16, utilizando 10 horas de audio de diálogo hablado, completado en 30 minutos en dos GPUs.

Posteriormente, el modelo se cuantizó con DynQuant v0.5.0 a un objetivo de 4,00 bits por peso. El asignador de recursos, basado en la varianza del gradiente y el RMS de activación registrados durante el fine-tune, empaquetó 650 módulos del Thinker sin violar el presupuesto mínimo de 3,4210 bits por rol estructural. El Talker y code2wav permanecen en bf16.

## Capacidades

- Conversación de voz a voz: recibe audio de entrada y genera respuestas habladas a 24 kHz.
- Procesamiento multimodal: hereda del modelo base la capacidad de entender texto, audio, imagen y video, aunque este fine-tune se centra en audio.
- Generación de voz natural: el Talker produce audio con voz sintetizada, seleccionable mediante el parámetro `speaker` (por ejemplo, "Ethan").
- Integración con transformers: se carga mediante `Qwen3OmniMoeForConditionalGeneration` y `AutoProcessor`.
- Soporte de diálogo multi-turno: el pipeline permite conversaciones con contexto, aunque la longitud de contexto no está documentada en esta versión.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede gestionar conversaciones habladas de forma natural, adecuado para altavoces inteligentes o asistentes en dispositivos móviles, gracias a su capacidad de entrada y salida de audio directa.
- Atención al cliente por teléfono: permite automatizar interacciones de voz sin necesidad de transcripción intermedia, reduciendo latencia y costes de infraestructura.
- Traducción de voz a voz: al ser un modelo any-to-any, puede recibir audio en un idioma y responder en otro, aunque no se especifican los idiomas soportados.
- Lectura de contenido hablado: puede convertir texto o instrucciones en audio, útil para audiolibros o sistemas de accesibilidad.
- Interacción con dispositivos IoT por voz: su tamaño cuantizado (21,4 GiB) permite desplegarlo en servidores con GPUs de 24 GB, facilitando su integración en sistemas embebidos o edge.
- Herramientas de accesibilidad: personas con discapacidad visual pueden interactuar con aplicaciones mediante comandos de voz y recibir respuestas habladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo realizó una prueba de humo con 4 clips por variante (bf16, 4-bit y 3-bit), verificando que el modelo no produce silencio ni respuestas incoherentes. Los resultados de esa prueba son:

| Variante | Modulos empaquetados | Clips | Silencios | Tokens nuevos (mediana) | Voz emitida |
|---|---|---|---|---|---|
| bf16 merge | ninguno | 4 | 0 | 39 | 45,4 s |
| DynQuant 4-bit | 602 | 4 | 0 | 21 | 37,6 s |
| DynQuant 3-bit | 602 | 4 | 0 | 28 | 30,5 s |

Estos datos no constituyen una evaluación de calidad y no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: al menos 22 GB para cargar el modelo 4-bit (21,38 GiB en disco), más overhead de activaciones y buffers.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, o cualquier GPU con 24 GB o más de memoria.
- En GPUs de consumo: cabe en tarjetas de 24 GB como la RTX 3090/4090, pero no en modelos de 16 GB o menos.
- Opciones de despliegue: se utiliza la librería `transformers` con `device_map="auto"` y el registro previo de `dynquant.register_hf_quantizer()`. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor no proporciona mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B (3B activos) | no disponible | bf16 | Apache 2.0 | Hugging Face |
| VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit | 30B (3B activos) | no disponible | DynQuant 4-bit | Apache 2.0 | Hugging Face |
| VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16 | 30B (3B activos) | no disponible | bf16 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos speech-to-speech comparables en la información proporcionada.

## Limitaciones y advertencias

- No existe ninguna métrica de precisión: el autor declara explícitamente que no se realizaron benchmarks, comparaciones A/B ni estudios de escucha. La prueba de humo solo verifica que el modelo no falla de forma catastrófica.
- Riesgo de alucinaciones: al ser un modelo de voz, puede generar respuestas coherentes pero incorrectas, especialmente en dominios no cubiertos por los 10 horas de audio de entrenamiento.
- Entrenamiento limitado: solo se entrenó el Thinker con QLoRA; el Talker y code2wav no se ajustaron, lo que puede limitar la naturalidad de la voz generada.
- Cuantización agresiva: la cuantización a 4 bits puede degradar la calidad del habla y la coherencia, aunque la prueba de humo no detectó fallos graves.
- Idiomas no especificados: no se documenta qué idiomas soporta el modelo, lo que dificulta su uso en aplicaciones multilingües.
- Sin soporte de herramientas ni agentes: este fine-tune se centra en diálogo hablado y no incorpora capacidades de tool calling o razonamiento multi-paso.
- Dependencia de DynQuant: para cargar el modelo es necesario instalar y registrar la librería `dynquant`, lo que añade una dependencia externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-4bit
- Adapter QLoRA: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-QLoRA
- Merge bf16: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-bf16
- Versión 3-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-S2S-DynQuant-3bit
- Repositorio DynQuant: https://github.com/kambojvikram/dynquant
- Modelo base Qwen3-Omni-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Informe técnico de Qwen3-Omni: https://arxiv.org/abs/2509.17765
