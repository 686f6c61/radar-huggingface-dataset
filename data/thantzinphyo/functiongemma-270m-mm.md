# thantzinphyo/FunctionGemma-270M-MM

## Resumen

FunctionGemma-270M-MM es un modelo de lenguaje especializado en *function calling* y ejecución estructurada de herramientas, desarrollado por el usuario thantzinphyo como un ajuste fino (fine-tuning) del modelo base google/functiongemma-270m-it. Su principal particularidad es que está orientado a un nicho poco cubierto: el birmano (myanmar), el inglés y los contextos de cambio de código (code-switching) entre ambos idiomas. Con 268 millones de parámetros, está diseñado para su despliegue en dispositivo (*on-device*), lo que lo hace adecuado para entornos con recursos limitados.

El modelo se entrenó durante una única época (1.214 pasos) sobre el dataset thantzinphyo/Gemma-Actions-MM, utilizando 2 GPUs NVIDIA Tesla T4 con TRL/SFTTrainer. Emplea una arquitectura transformer de tipo Gemma 3 text, con una longitud de contexto de 1.024 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en la escasez de modelos pequeños y ligeros que ofrezcan soporte nativo para function calling en birmano, un idioma con poca representación en el ecosistema de IA. Sin embargo, los resultados de evaluación muestran un rendimiento moderado, especialmente en contextos de code-switching, lo que debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 text) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No disponible (el repo contiene safetensors en fp16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Birmano (my), inglés (en), code-switching inglés-birmano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 text, un transformer decoder-only. Se trata de un ajuste fino supervisado (SFT) del modelo google/functiongemma-270m-it, que a su vez es una variante de Gemma 270M orientada a function calling. El entrenamiento se realizó durante 1 época (1.214 pasos) con un scheduler de learning rate de warmup lineal y decaimiento coseno, optimizador AdamW en fp16, y se distribuyó en 2 GPUs NVIDIA Tesla T4 mediante Data Parallel (DDP) con Hugging Face TRL / SFTTrainer.

No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su nombre (thantzinphyo/Gemma-Actions-MM). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales. La innovación principal es la adaptación del modelo base a un dominio lingüístico específico (birmano y code-switching) para tareas de tool calling, algo poco común en modelos de este tamaño.

## Capacidades

- Generación de texto y conversación multi-turno en birmano, inglés y contextos de code-switching.
- Function calling / tool use: el modelo está específicamente entrenado para emitir llamadas estructuradas a funciones a partir de descripciones de herramientas en formato JSON.
- Ejecución estructurada de funciones: soporta el formato de herramientas de la API de chat de Transformers (`apply_chat_template` con `tools`).
- Capacidades multilingües limitadas a birmano e inglés (no se documentan otros idiomas).
- No se documentan capacidades de visión, audio, razonamiento matemático avanzado ni agentes multi-paso.
- No se menciona soporte explícito para *thinking mode* ni decodificación especulativa.

## Casos de uso

- **Asistentes de voz o chat en birmano para dispositivos móviles**: el modelo puede interpretar peticiones en birmano y traducirlas en llamadas a funciones (por ejemplo, consultar el clima, enviar mensajes, establecer recordatorios) gracias a su tamaño reducido y su entrenamiento específico en ese idioma.
- **Automatización de tareas en aplicaciones de empresa para usuarios birmanos**: integración en flujos de trabajo donde el usuario final escribe en birmano y el sistema necesita invocar APIs internas (gestión de tickets, consultas de bases de datos) mediante function calling.
- **Sistemas de atención al cliente bilingües inglés-birmano**: el modelo puede gestionar consultas en ambos idiomas y en mezcla de código, invocando herramientas como consulta de pedidos o seguimiento de envíos, aunque el rendimiento en code-switching es limitado (45,6 % de precisión).
- **Prototipado rápido de agentes de tool calling en entornos con recursos limitados**: al ser un modelo de 270M parámetros, se puede ejecutar en GPUs de consumo o incluso en CPU, lo que facilita pruebas de concepto sin infraestructura dedicada.
- **Integración en pipelines de CI/CD para pruebas de function calling**: el modelo puede utilizarse como generador de llamadas a funciones en tests automatizados de APIs, especialmente en proyectos que requieran soporte para birmano.
- **Aplicaciones de accesibilidad para hablantes de birmano**: conversión de instrucciones en lenguaje natural a acciones estructuradas en asistentes personales, con la ventaja de que el modelo cabe en dispositivos de gama baja.

## Benchmarks y rendimiento

El autor publica resultados en un conjunto de test reservado de 200 muestras, midiendo la precisión de función (Fn Acc):

| Registro / Idioma | Muestras | Fn Acc (%) |
|---|---|---|
| Inglés | 83 | 75,9 |
| Birmano | 38 | 60,5 |
| Code-switching | 79 | 45,6 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 268M parámetros, en fp16 requiere aproximadamente 0,54 GB solo para los pesos, más overhead de activaciones y KV cache. En la práctica, cabe en GPUs con 2 GB o más de VRAM en fp16, y en menos de 1 GB si se cuantiza a 8 bits o 4 bits (aunque no se documentan cuantizaciones oficiales).
- **GPU recomendadas**: cualquier GPU moderna sirve; el autor entrenó con 2× NVIDIA Tesla T4. Para inferencia, una RTX 3060, RTX 4090, A100 o H100 funcionarían sin problema, pero el modelo está pensado para entornos de bajos recursos.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, etc.). También puede ejecutarse en CPU.
- **Opciones de despliegue**: Transformers (con `AutoModelForCausalLM`), y potencialmente llama.cpp u Ollama si se generan los pesos GGUF (no se proporcionan en el repo). vLLM y TGI son compatibles con arquitecturas Gemma, pero no se ha verificado su funcionamiento con este fine-tuning específico.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialidad |
|---|---|---|---|---|---|
| FunctionGemma-270M-MM | 268M | 1.024 | Birmano, inglés | Apache 2.0 | Function calling en birmano/code-switching |
| google/functiongemma-270m-it (base) | 270M | No disponible en la información | Inglés (principalmente) | Apache 2.0 | Function calling general |
| Modelos de function calling de mayor tamaño (p. ej., Qwen2.5-7B-Instruct) | 7B | 32.768 | Multilingüe | Apache 2.0 | Function calling general, mayor precisión |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- **Rendimiento moderado**: la precisión de función en code-switching es solo del 45,6 %, y en birmano del 60,5 %, lo que indica que el modelo comete errores con frecuencia en estos contextos. No es recomendable para producción sin una validación exhaustiva.
- **Contexto limitado**: 1.024 tokens es una ventana muy pequeña para conversaciones multi-turno o descripciones de herramientas extensas; puede truncar información importante.
- **Idiomas limitados**: solo soporta birmano e inglés; no se ha entrenado para otros idiomas.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar llamadas a funciones inexistentes o con parámetros incorrectos, especialmente en contextos ambiguos.
- **Sesgos**: no se documentan sesgos específicos, pero al estar entrenado con un dataset limitado (1 época, 1.214 pasos), puede reflejar sesgos de los datos de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base (google/functiongemma-270m-it) también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Falta de documentación**: no se especifican cuantizaciones oficiales, ni datos de latencia, ni composición detallada del dataset, lo que dificulta la reproducibilidad.
- **Modelo muy reciente y con pocas descargas**: 0 descargas y 0 likes en HuggingFace, lo que implica que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace: thantzinphyo/FunctionGemma-270M-MM](https://huggingface.co/thantzinphyo/FunctionGemma-270M-MM)
- [Dataset: thantzinphyo/Gemma-Actions-MM](https://huggingface.co/datasets/thantzinphyo/Gemma-Actions-MM)
- [Repositorio GitHub: Gemma-Actions-MM](https://github.com/thantzinphyo-gg/Gemma-Actions-MM)
- [Modelo base: google/functiongemma-270m-it](https://huggingface.co/google/functiongemma-270m-it)
