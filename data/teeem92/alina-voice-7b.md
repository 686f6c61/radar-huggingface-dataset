# teeem92/alina-voice-7b

## Resumen

Alina Voice 7B es un ajuste fino completo (full fine-tune) del modelo Qwen2.5-7B-Instruct, publicado por el usuario teeem92 y orientado a un caso de uso muy concreto: actuar como motor de lenguaje de un robot telefónico de voz llamado Alina, desarrollado por la empresa LPTracker. El modelo no es un asistente generalista, sino un especialista entrenado para generar respuestas conversacionales en ruso que se sintetizan con ElevenLabs y se reproducen por teléfono, con reglas estilísticas muy específicas (frases cortas, números escritos con letras, ausencia de signos de exclamación, etiquetas acústicas de pausas y suspiros).

Arquitectónicamente hereda todo del modelo base: un transformer decoder-only de la familia Qwen2.5 con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), pesos en safetensors y un repositorio de 15,2 GB. El ajuste se realizó con la herramienta Soup CLI mediante una técnica de "Layer Streaming", según indica la model card, aunque no se detallan hiperparámetros, volumen de datos ni metodología de evaluación.

Su relevancia es acotada pero interesante como ejemplo de especialización vertical: demuestra cómo un modelo de 7B puede adaptarse a las restricciones de un canal de voz (latencia, longitud de turno, naturalidad del TTS) en lugar de competir en benchmarks generales. No hay datos publicados de rendimiento, descargas ni validación externa, y la licencia no está declarada, lo que limita seriamente su uso en producción por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero el autor no lo declara para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni adaptadores) de Qwen/Qwen2.5-7B-Instruct, por lo que conserva la arquitectura transformer decoder-only de Qwen2.5: atención con RoPE, normalización RMSNorm, capas MLP con SwiGLU y tokenizador BPE multilingüe. El entrenamiento se realizó con Soup CLI usando "Layer Streaming", una técnica que, según la model card, permite entrenar el modelo completo sin cargar todas las capas simultáneamente en memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT supervisado más allá del ajuste inicial.

La innovación principal no está en la arquitectura sino en la ingeniería de comportamiento: el modelo fue entrenado para cumplir 33 reglas de estilo definidas por LPTracker para su robot telefónico. Entre ellas destacan la emisión de etiquetas acústicas entre corchetes (`[hmm]`, `[sigh]`, `[chuckle]`) que ElevenLabs interpreta como pausas y respiraciones, la limitación de cada intervención a unos 70 caracteres para reducir la latencia en telefonía, la escritura de números con letras para que el TTS los pronuncie correctamente, la supresión total de signos de exclamación y el uso consistente del género femenino y de formas coloquiales rusas como "вацаап" para referirse a WhatsApp.

## Capacidades

- Generación de texto conversacional en ruso orientada a diálogo telefónico de atención al cliente.
- Emisión de etiquetas acústicas para síntesis de voz con ElevenLabs (`[hmm]`, `[sigh]`, `[chuckle]`).
- Control de longitud de respuesta (turnos de aproximadamente 70 caracteres) para minimizar la latencia en telefonía.
- Normalización numérica: escritura de cifras con letras para su correcta pronunciación por el motor TTS.
- Estilo conversacional con marca de género femenino y registro coloquial ruso.
- Herencia del modelo base: comprensión de instrucciones, seguimiento de system prompt y conversación multi-turno.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Robot telefónico de atención al cliente: el modelo genera turnos cortos y naturales que se envían a ElevenLabs para síntesis y se reproducen en una llamada; su entrenamiento específico en las reglas de LPTracker lo hace adecuado para este flujo concreto.
- Cualificación de leads por teléfono: integrado en un pipeline de telefonía (por ejemplo, con un orquestador tipo LPTracker), puede mantener conversaciones multi-turno para recoger datos de contacto y confirmar interés.
- Recordatorios y confirmación de citas: la limitación a 70 caracteres y la escritura de números con letras facilitan mensajes claros y rápidos de sintetizar.
- Sustitución de guiones fijos en IVR: en lugar de menús pregrabados, el modelo puede generar respuestas dinámicas adaptadas al contexto de la llamada.
- Pruebas de concepto de agentes de voz en ruso: sirve como referencia para estudiar cómo adaptar un LLM de 7B a las restricciones de un canal de voz (latencia, TTS, naturalidad).
- Generación de diálogos con prosodia marcada: las etiquetas acústicas permiten experimentar con TTS expresivo en otros dominios (audiolibros, asistentes domésticos) siempre que se respete la licencia.
- Investigación sobre ajuste fino vertical: caso de estudio de full fine-tune con Soup CLI y Layer Streaming sobre un modelo Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 18-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4,5-5,5 GB (no hay cuantizaciones oficiales publicadas, habría que generarlas con herramientas externas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en FP16; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con `device_map="auto"` y en RTX 3090/4070 Ti Super con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles. La restricción de 70 caracteres por turno sugiere que el autor prioriza baja latencia sobre longitud de respuesta, pero no se aportan métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| teeem92/alina-voice-7b | 7,6 B | no disponible | ruso | no disponible | Robot de voz telefónico (LPTracker/ElevenLabs) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | multilingüe (incluye ruso) | Apache 2.0 | Asistente generalista |
| Qwen/Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | multilingüe | Apache 2.0 (Qwen license para algunos tamaños) | Asistente generalista, menor huella |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | multilingüe | Apache 2.0 | Asistente generalista |

La comparación directa es difícil porque Alina Voice 7B es un especialista vertical sin benchmarks publicados. Frente a su modelo base, pierde generalidad y capacidades multilingües a cambio de adherencia estricta a las reglas de estilo de LPTracker. Frente a alternativas generalistas como Qwen2.5-7B-Instruct o Mistral-7B-Instruct, carece de licencia clara y de datos de rendimiento, lo que lo hace poco adecuado para uso fuera del ecosistema del autor.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue en producción.
- Idiomas: solo se declara ruso; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado respecto al modelo base.
- Sesgos: al estar entrenado con diálogos de una empresa concreta (LPTracker), puede reproducir sesgos comerciales, de género (uso forzado del femenino) y de registro coloquial poco apropiados en otros contextos.
- Riesgo de alucinación: como todo LLM de 7B, puede inventar información; en un robot telefónico esto es especialmente crítico si se usa para dar datos de precios, plazos o servicios.
- Restricción de longitud: el entrenamiento para respuestas de ~70 caracteres limita su utilidad para tareas que requieran explicaciones largas o razonamiento multi-paso.
- Sin benchmarks ni validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de calidad.
- Dependencia de ElevenLabs: las etiquetas acústicas solo tienen sentido con ese motor TTS; con otros sintetizadores pueden leerse literalmente o ignorarse.
- Sin cuantizaciones oficiales: desplegar en hardware modesto requiere generar GGUF/AWQ/GPTQ por cuenta propia, con el riesgo de degradar el comportamiento entrenado.
- Fecha de creación futura (2026-11-03): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teeem92/alina-voice-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Soup CLI (herramienta de ajuste fino citada en la model card): no disponible enlace oficial en la informacion proporcionada
- LPTracker (empresa autora del caso de uso): no disponible enlace oficial en la informacion proporcionada
- ElevenLabs (motor TTS referenciado): no disponible enlace oficial en la informacion proporcionada
