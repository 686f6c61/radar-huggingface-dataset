# Tree-AI-lab/kouman-ia-1.6-1b-GGUF

## Resumen

Kouman IA 1.6 (1B) es un modelo de lenguaje de 1.235.814.432 parámetros (aproximadamente 1,2 mil millones) desarrollado por Tree-AI-lab, un laboratorio centrado en el procesamiento de lenguas africanas. Se trata de un fine-tuning mediante LoRA y SFT (supervised fine-tuning) sobre el modelo base `Tree-AI-lab/llama-3.2-1b-baoule-instruct-v3`, que a su vez deriva de la familia Llama 3.2 de Meta. El modelo está diseñado para entornos con recursos limitados y conserva una fuerte especialización lingüística y cultural en cuatro idiomas: francés, baoulé (bci), dioula (dyu) e inglés.

El modelo aborda un problema concreto: la escasez de asistentes conversacionales de calidad para lenguas africanas de Costa de Marfil, especialmente el baoulé y el dioula, que cuentan con pocos recursos digitales. Kouman IA 1.6 se presenta como un modelo ligero, rápido y desplegable en hardware modesto, orientado a conversaciones multi-turno, traducción cultural y asistencia en contextos cotidianos como WhatsApp.

La relevancia actual del modelo radica en su enfoque en la inclusividad lingüística con un presupuesto computacional mínimo: solo 20 millones de parámetros entrenables mediante LoRA sobre una base de 1,2 mil millones. La versión publicada en este repositorio está en formato GGUF, lo que facilita su ejecución en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio contiene pesos en formato GGUF; no se detallan los niveles concretos) |
| Idiomas soportados | bci (baoulé), fr (francés), dyu (dioula), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (version publicada); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar heredado de Llama 3.2 1B, con 1.235.814.432 parámetros totales. Sobre esta base se aplicó un fine-tuning mediante LoRA con 20 millones de parámetros entrenables, seguido de SFT (supervised fine-tuning) sobre seis datasets propios de Tree-AI-lab: `kouman-traduction-culture-sft-v25k`, `kouman-identity-instruct-v25k`, `smoltalk-multilingue-v25k`, `kouman-situations-conseils-13k-v25k`, `kouman-conversations-trilingues-longues-25k-v25k` y `kouman-whatsapp-sft-v25k`. Estos conjuntos cubren traducción cultural, identidad del asistente, conversaciones multilingües, situaciones de consejo y diálogos estilo WhatsApp.

El entrenamiento se realizó, según las etiquetas del repositorio, en un entorno ROCm (AMD), lo que indica compatibilidad con GPUs AMD además de NVIDIA. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal; el modelo se limita a la arquitectura Llama 3.2 estándar.

## Capacidades

- Generación de texto conversacional multi-turno en francés, baoulé, dioula e inglés.
- Traducción y adaptación cultural entre estos idiomas, con énfasis en expresiones y contextos de Costa de Marfil.
- Asistencia en situaciones cotidianas y consejos prácticos, según los datasets de entrenamiento (`situations-conseils`).
- Conversaciones estilo WhatsApp, optimizadas para diálogos informales y breves.
- Comprensión de instrucciones y seguimiento de roles de chat mediante plantilla de chat (`apply_chat_template`).
- Razonamiento básico en francés, evaluado en el benchmark `arc_fr`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente en lenguas locales: el modelo puede gestionar conversaciones multi-turno en baoulé, dioula y francés para negocios en Costa de Marfil, aprovechando su entrenamiento específico en diálogos y su plantilla de chat conversacional.
- Traducción cultural asistida: útil para traducir mensajes, avisos o contenidos entre francés, baoulé y dioula, con especial atención a matices culturales gracias al dataset `kouman-traduction-culture-sft-v25k`.
- Asistente educativo en zonas con conectividad limitada: al ser un modelo de 1,2 mil millones de parámetros en GGUF, puede ejecutarse en portátiles o dispositivos de gama media sin GPU dedicada, ofreciendo respuestas en francés e idiomas locales.
- Chatbot de mensajería para WhatsApp: el entrenamiento con `kouman-whatsapp-sft-v25k` lo hace adecuado para integrarse en flujos de mensajería informal, con respuestas breves y contextualizadas.
- Orientación y consejos prácticos: el dataset `kouman-situations-conseils-13k-v25k` respalda su uso en asistentes que ofrecen recomendaciones sobre trámites, salud básica o vida cotidiana en francés y lenguas locales.
- Preservación lingüística y divulgación: investigadores y organizaciones culturales pueden desplegarlo para generar material divulgativo o conversacional en baoulé y dioula, contribuyendo a la presencia digital de estas lenguas.
- Prototipado rápido en entornos ROCm: su tamaño reducido y su entrenamiento en ROCm permiten experimentar en GPUs AMD de consumo, algo poco habitual en modelos de la familia Llama.

## Benchmarks y rendimiento

El autor publica resultados en el benchmark `arc_fr` (AI2 Reasoning Challenge en francés) mediante `lm-evaluation-harness`:

| Modelo | Exactitud simple (acc) | Exactitud normalizada (acc_norm) |
|---|---|---|
| Kouman-IA-1.6-1B | 22,0% | 38,0% |
| TinyLlama-1.1B (referencia citada) | no disponible | 31,0% |

El autor afirma que Kouman-IA-1.6-1B supera a TinyLlama-1.1B en exactitud normalizada (38,0% frente a 31,0%). No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización GGUF de 4 bits, aproximadamente 0,8-1,0 GB; en 8 bits, en torno a 1,3-1,5 GB; en FP16, unos 2,5 GB. Estas cifras son estimaciones basadas en el tamaño del modelo (1,2 mil millones de parámetros) y el tamaño del repositorio (0,8 GB), no datos oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas con 4 GB o más de VRAM, e incluso en iGPU y CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La versión safetensors del modelo base puede ejecutarse con Transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | arc_fr (acc_norm) | Licencia | Formato |
|---|---|---|---|---|---|
| Kouman-IA-1.6-1B | 1,24 B | no disponible | 38,0% | no disponible | GGUF / safetensors |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (estándar) | 31,0% | Apache 2.0 | safetensors / GGUF |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | no disponible | Llama 3.2 Community License | safetensors / GGUF |

La comparativa se limita a los datos disponibles: el autor solo aporta el resultado de `arc_fr` frente a TinyLlama-1.1B. No se dispone de datos de contexto, licencia ni benchmarks adicionales para Kouman-IA-1.6-1B en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con Tree-AI-lab antes de un despliegue en producción.
- Riesgo de alucinación: como todo modelo de 1,2 mil millones de parámetros, puede generar información incorrecta, especialmente en razonamiento complejo o en temas especializados.
- Cobertura lingüística limitada: fuera de francés, baoulé, dioula e inglés, el rendimiento puede degradarse notablemente. No se documenta soporte de castellano.
- Contexto no documentado: se desconoce la longitud de contexto efectiva; no se debe asumir la ventana de 128.000 tokens de Llama 3.2 sin confirmación.
- Sesgos: al entrenarse con datasets específicos de Costa de Marfil, puede reflejar sesgos culturales y sociales de esas fuentes; no se han publicado evaluaciones de sesgo.
- Sin datos de seguridad: no se documentan evaluaciones de toxicidad, alineación ni robustez frente a prompts adversarios.
- Modelo muy reciente y con pocas descargas (0 descargas, 0 likes en el momento de la consulta): no hay validación independiente de su calidad más allá de los resultados del autor.
- Entrenado en ROCm: aunque esto es una ventaja para GPUs AMD, conviene verificar la compatibilidad de los pesos GGUF con el runtime concreto que se vaya a usar.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-ia-1.6-1b-GGUF
- Modelo base en safetensors: https://huggingface.co/Tree-AI-lab/kouman-ia-1.6-1b
- Versión anterior: https://huggingface.co/Tree-AI-lab/kouman-IA-1.5-1B
- Dataset de traducción cultural: https://huggingface.co/datasets/Tree-AI-lab/kouman-traduction-culture-sft-v25k
- Dataset de identidad: https://huggingface.co/datasets/Tree-AI-lab/kouman-identity-instruct-v25k
- Dataset multilingüe SmolTalk: https://huggingface.co/datasets/Tree-AI-lab/smoltalk-multilingue-v25k
- Dataset de situaciones y consejos: https://huggingface.co/datasets/Tree-AI-lab/kouman-situations-conseils-13k-v25k
- Dataset de conversaciones trilingües largas: https://huggingface.co/datasets/Tree-AI-lab/kouman-conversations-trilingues-longues-25k-v25k
- Dataset de WhatsApp: https://huggingface.co/datasets/Tree-AI-lab/kouman-whatsapp-sft-v25k
- Perfil del autor: https://huggingface.co/Tree-AI-lab
