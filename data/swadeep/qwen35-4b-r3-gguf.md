# swadeep/qwen35-4b-r3-gguf

## Resumen
El modelo `swadeep/qwen35-4b-r3-gguf` es un fine-tune del modelo Qwen3.5-4B, convertido a formato GGUF mediante la librería Unsloth. Lo publica el usuario swadeep en Hugging Face, con un único archivo cuantizado Q4_K_M. Está orientado a su uso con llama.cpp y es compatible con endpoints, según los tags del repositorio. El modelo base Qwen3.5-4B parece ser un VLM (vision-language) con atención híbrida, aunque este archivo GGUF podría estar limitado a texto, según las instrucciones de la model card que distinguen entre LLM de texto y modelos multimodales.

Con 4.205.751.296 parámetros (~4,2 mil millones) y un tamaño de repositorio de 2,7 GB, es un modelo compacto pensado para inferencia local en hardware de consumo. No se proporcionan detalles sobre el proceso de fine-tuning, los datos de entrenamiento ni las capacidades específicas resultantes, por lo que gran parte de la información técnica no está disponible en la documentación pública.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen3.5-4B emplea atención híbrida, pero no se confirma para este fine-tune) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información oficial sobre la arquitectura interna de este fine-tune. El modelo base Qwen3.5-4B, según fuentes externas, utiliza un mecanismo de atención híbrida, pero no se puede confirmar si esta característica se mantiene en la versión fine-tuneada. El proceso de entrenamiento se realizó con Unsloth, que permite fine-tuning eficiente mediante LoRA, y posteriormente se convirtió a GGUF. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades
- Generación de texto conversacional (tag `conversational`).
- Posible soporte de razonamiento y tool-calling, dado que el modelo base Qwen3.5-4B incluye estas capacidades, aunque no se confirma para este fine-tune.
- El tag `qwen3_5` sugiere compatibilidad con el ecosistema Qwen, incluyendo potencialmente instrucciones y agentes.
- No se indica soporte multimodal en este archivo GGUF; la model card menciona comandos distintos para texto y multimodal, pero no aclara cuál aplica aquí.

## Casos de uso
- Inferencia local en CPU/GPU con llama.cpp: gracias al formato GGUF y la cuantización Q4_K_M, el modelo puede ejecutarse en equipos sin GPU dedicada o con GPUs de gama media.
- Chatbots y asistentes conversacionales: su tamaño compacto permite integrarlo en aplicaciones de chat en tiempo real con baja latencia.
- Prototipado rápido de aplicaciones de IA generativa: al ser un GGUF listo para usar, se puede desplegar con herramientas como Ollama o llama.cpp sin conversión adicional.
- Fine-tuning adicional sobre tareas específicas: al ser un modelo de 4B, es adecuado para ajustes con LoRA en hardware limitado.
- Desarrollo de agentes con tool-calling (si el fine-tune conserva esta capacidad del base), aunque no hay confirmación.
- Evaluación comparativa de modelos pequeños en tareas de razonamiento o generación de código, siempre que se validen sus capacidades reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo específico.

## Requisitos de hardware
- VRAM estimada para inferencia: un GGUF Q4_K_M de ~4,2B parámetros ocupa aproximadamente 2,7 GB en disco; en memoria, se necesitan unos 3-4 GB de RAM/VRAM para cargar el modelo, más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutarlo con cuantización Q4. También funciona en CPU con suficiente RAM (8 GB o más).
- Compatible con consumer GPUs: sí, es uno de los puntos fuertes de este tamaño.
- Opciones de despliegue: llama.cpp (comando `llama-cli -hf swadeep/qwen35-4b-r3-gguf --jinja`), Ollama, LM Studio, o servidores compatibles con GGUF como llama.cpp server.
- Latencia y throughput: no disponible; dependerá del hardware y la longitud de contexto.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa fiable. El modelo base Qwen3.5-4B podría compararse con otros modelos de 4B como Llama-3.2-3B o Gemma-2-9B, pero este fine-tune concreto no tiene datos públicos de rendimiento. Se recomienda consultar el repositorio del autor para futuras actualizaciones.

## Limitaciones y advertencias
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas; se desconoce el comportamiento real del modelo.
- La licencia no está especificada; antes de usarlo comercialmente, contacta con el autor o consulta el modelo base Qwen3.5-4B para conocer sus términos.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validación comunitaria.
- No se garantiza que las capacidades del modelo base (tool-calling, razonamiento, multimodalidad) se mantengan tras el fine-tune.
- La fecha de creación (2026) es inusual; verifica la autenticidad del repositorio antes de usarlo en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/swadeep/qwen35-4b-r3-gguf
- Repositorio del modelo relacionado (r1): https://huggingface.co/swadeep/qwen35-4b-r1-gguf
- Repositorio de otro fine-tune del autor: https://huggingface.co/swadeep/Qwen3.5-4b-claude-opus-distilled
- Especificaciones de Qwen3.5-4B (fuente externa): https://apxml.com/models/qwen35-4b
- Toolkit para Qwen3.5 (GitHub): https://github.com/techwithsergiu/qwen35-toolkit
