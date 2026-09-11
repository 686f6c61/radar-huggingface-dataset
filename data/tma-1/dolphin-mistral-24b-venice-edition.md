# TMA-1/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin Mistral 24B Venice Edition es un ajuste fino (fine-tune) del modelo mistralai/Mistral-Small-24B-Instruct-2501, desarrollado por el equipo de Dolphin (dphn.ai) en colaboración con Venice.ai. Su objetivo declarado es el de ser un modelo de propósito general sin censura ("uncensored") y totalmente "steerable": el propietario del sistema define el system prompt y la alineación, en lugar de heredar una alineación fija impuesta por el proveedor. Está disponible como modelo por defecto en Venice.ai bajo el nombre "Venice Uncensored".

Técnicamente es un transformer denso de aproximadamente 24.011 millones de parámetros (unos 24B), derivado de la familia Mistral Small 3. El repositorio ocupa 48,1 GB en safetensors, se distribuye bajo licencia Apache 2.0 y su configuración de despliegue en vLLM apunta a una longitud de contexto de hasta 131.072 tokens. El modelo conserva la plantilla de chat por defecto de Mistral y las etiquetas del repositorio incluyen image-text-to-text, por lo que se anuncia soporte multimodal (imagen-texto) además de generación de texto y conversación.

Su relevancia actual radica en el nicho de aplicaciones que necesitan control total sobre el system prompt y el comportamiento del modelo sin depender de APIs cerradas, además de poder ejecutarse en infraestructura propia. Según la model card, fue entrenado sobre 8 GPU B200 proporcionadas por Targon. El autor recomienda temperaturas bajas (en torno a 0,15) para un comportamiento estable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral Small 3) |
| Parámetros totales | 24.011.361.280 (~24B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 131.072 tokens según la configuración de vLLM de la model card |
| Tipos de cuantización | No disponible (el autor no publica cuantizaciones específicas); uso previsto con Ollama y LM Studio, que soportan GGUF |
| Idiomas soportados | No disponible (la model card no especifica; el modelo base Mistral Small es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Se trata de un fine-tune del modelo base mistralai/Mistral-Small-24B-Instruct-2501, por lo que hereda su arquitectura de transformer denso de aproximadamente 24B parámetros. La model card no detalla la composición del dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas como RLHF, DPO o SFT específicas; únicamente indica que el entrenamiento se realizó sobre 8 GPU B200 proporcionadas por Targon. Tampoco se documenta ninguna innovación arquitectónica adicional respecto al modelo base.

Un aspecto relevante del proceso es la conservación de la plantilla de chat original de Mistral, con el formato de instrucción V7-Tekken (`<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]...`). El autor subraya que el system prompt es el mecanismo principal para controlar tono y alineación, y proporciona un ejemplo de system prompt orientado a maximizar el comportamiento sin censura. La configuración de vLLM recomendada incluye `--tool-call-parser mistral`, `--enable-auto-tool-choice` y la posibilidad de admitir hasta 10 imágenes por prompt, lo que apunta a soporte de tool calling y de entrada multimodal.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct.
- Razonamiento y respuesta a instrucciones generales, con comportamiento "steerable" mediante system prompt.
- Tool calling / function calling, soportado explícitamente en la configuración de vLLM (`--tool-call-parser mistral`, `--enable-auto-tool-choice`).
- Capacidad multimodal imagen-texto: las etiquetas del repositorio incluyen image-text-to-text y la configuración de vLLM permite hasta 10 imágenes por prompt. La model card no detalla el encoder visual ni arquitectura multimodal específica.
- Multilingüismo: no documentado explícitamente, pero heredado presumiblemente del modelo base Mistral Small; no se especifica la lista de idiomas.
- Modo "uncensored" activable mediante system prompt, orientado a reducir rechazos de peticiones.
- No se documentan capacidades de audio ni un "thinking mode" explícito.

## Casos de uso

- Asistentes conversacionales autoalojados: el modelo puede gestionar diálogos multi-turno con hasta 131.072 tokens de contexto, lo que permite mantener conversaciones largas o inyectar documentación extensa como contexto, todo sobre infraestructura controlada por el operador.
- Aplicaciones que requieren control de alineación personalizado: negocios que necesitan definir sus propias políticas de contenido mediante system prompt, sin depender de la alineación impuesta por un proveedor de API cerrado.
- Integración en pipelines con tool calling: al soportar el parser de herramientas de Mistral en vLLM, puede conectarse a funciones externas, bases de datos o APIs para tareas de automatización y flujos agénticos de varios pasos.
- Procesamiento de documentos con imágenes: gracias al soporte anunciado de entrada imagen-texto (hasta 10 imágenes por prompt en vLLM), puede emplearse en tareas de descripción, extracción o respuesta a preguntas sobre capturas y diagramas.
- Despliegue en entornos con requisitos de privacidad de datos: al ejecutarse de forma local o en servidores propios, evita enviar consultas a servicios de terceros, adecuado para sectores con datos sensibles.
- Generación de texto en producción a escala: con vLLM y paralelismo tensorial (por ejemplo, `tensor_parallel_size=8` en la configuración de ejemplo) permite servir peticiones concurrentes con throughput alto en clústeres multi-GPU.
- Experimentación e investigación sobre alineación y steerability: útil para estudiar cómo distintas instrucciones de sistema modifican el comportamiento del modelo frente a un modelo alineado convencional.
- Chatbots sobre Venice.ai u otros productos: el modelo es el "Venice Uncensored" por defecto en la plataforma Venice, lo que ejemplifica su uso como motor conversacional de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del modelo en precisión completa: aproximadamente 48 GB en safetensors (BF16/FP16), coherente con 24B parámetros.
- VRAM estimada: la model card indica que ejecutar el modelo en GPU requiere más de 60 GB de memoria de GPU en configuración estándar.
- GPU recomendadas: clústeres multi-GPU; el ejemplo oficial usa `tensor_parallel_size=8`. El entrenamiento se realizó sobre 8 GPU B200 (NVIDIA B200).
- GPU consumer: no cabe en una sola GPU de consumo (por ejemplo, RTX 4090 con 24 GB) en precisión completa. Con cuantización agresiva (Q4) podría ser viable en GPUs de 24-32 GB, aunque el autor no proporciona cuantizaciones oficiales.
- Opciones de despliegue: vLLM (recomendado por el autor), SGLang, TGI, Ollama, LM Studio y la librería HuggingFace Transformers.
- Configuración vLLM sugerida: `--runner generate`, `--max-model-len 131072`, `--tool-call-parser mistral`, `--enable-auto-tool-choice`, `--limit-mm-per-prompt '{"image": 10}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Dolphin Mistral 24B Venice Edition | 24B (denso) | hasta 131.072 tokens (config. vLLM) | Apache 2.0 | Sí (image-text-to-text según etiquetas) | Fine-tune "uncensored" y steerable |
| mistralai/Mistral-Small-24B-Instruct-2501 (base) | 24B (denso) | No disponible en esta ficha | Apache 2.0 | No disponible en esta ficha | Modelo base de este fine-tune |
| Alternativas de la misma categoría (por ejemplo, otros instruct de ~24B) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable frente a otros modelos.

## Limitaciones y advertencias

- Alineación intencionadamente reducida: el modelo se comercializa como "uncensored" y su system prompt de ejemplo instruye a ignorar consideraciones éticas, legales o de seguridad. Esto implica un riesgo elevado de generar contenido dañino, sesgado o ilegal si no se aplican filtros externos.
- Riesgo de alucinación: no se documentan medidas específicas para mitigarla; como todo LLM, puede producir información inventada o incorrecta.
- Idiomas soportados no documentados: la model card no especifica la cobertura lingüística, lo que dificulta garantizar calidad en idiomas distintos del inglés.
- Multimodalidad no detallada: aunque las etiquetas y la configuración de vLLM sugieren soporte de imágenes, la model card no describe arquitectura visual ni limitaciones del encoder; la fiabilidad del procesamiento de imágenes no está documentada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el responsable del despliegue asume toda la responsabilidad legal y ética sobre las salidas del modelo.
- Requisitos de hardware elevados: más de 60 GB de VRAM en configuración estándar, lo que restringe su uso a infraestructura de gama alta o clústeres multi-GPU.
- Temperatura recomendada baja (0,15): valores altos pueden degradar la coherencia según las indicaciones del autor.
- Metadatos incompletos: descargas y "likes" aparecen a cero y no hay datos de idiomas ni benchmarks, lo que limita la evaluación objetiva previa al despliegue.
- Fecha de publicación del repositorio indicada como 2026-09-10, un dato que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TMA-1/Dolphin-Mistral-24B-Venice-Edition
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Web oficial de Dolphin: https://dphn.ai
- Web chat de Dolphin: https://chat.dphn.ai
- Twitter/X de Dolphin: https://x.com/dphnAI
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de cómputo de entrenamiento): https://targon.com/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
