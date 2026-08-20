# T3cmit0/llama32-3b-emo-gguf

## Resumen

El modelo **T3cmit0/llama32-3b-emo-gguf** es un fine-tune del modelo **Llama 3.2 3B Instruct** de Meta, especializado en conversación emocionalmente solidaria en inglés. Ha sido desarrollado por el usuario T3cmit0 mediante entrenamiento supervisado (SFT) con la librería Unsloth y TRL, durante 2.000 pasos, partiendo de la versión cuantizada en 4 bits (`unsloth/llama-3.2-3b-instruct-bnb-4bit`). El resultado se ha convertido a formato GGUF en cuantización Q4_K_M, pensado para inferencia en dispositivos locales (on-device) mediante llama.cpp.

La relevancia de este modelo radica en su tamaño compacto (3.212 millones de parámetros) y su enfoque específico en soporte emocional, lo que lo hace adecuado para aplicaciones de chatbot offline en dispositivos móviles o equipos con recursos limitados. El autor indica que estos pesos alimentan una aplicación Android llamada "Demo Chat", totalmente offline. La ventana de contexto utilizada en el dispositivo es de 2.048 tokens, y se recomienda una configuración de muestreo con temperatura 0.6, top-p 0.9 y top-k 40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (usado en dispositivo; el modelo base soporta hasta 128K, pero no se especifica el contexto máximo del fine-tune) |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada); se advierte que Q4_0 produce salidas incoherentes |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (archivo `llama32-3b-emo-Q4_K_M.gguf`, ~1.9 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder de Llama 3.2 3B Instruct, con atención causal estándar y 28 capas. El proceso de entrenamiento consistió en un fine-tune supervisado (SFT) de 2.000 pasos sobre el dataset de soporte emocional en inglés, utilizando Unsloth para optimizar el entrenamiento y TRL para el pipeline de RL. El punto de partida fue la versión cuantizada en 4 bits (`bnb-4bit`) del modelo instruct, que posteriormente se de-cuantizó a fp16 y se convirtió a GGUF f16 mediante `convert_hf_to_gguf.py`, para finalmente cuantizarse a Q4_K_M con `llama-quantize`. El autor advierte que la de-cuantización requiere fijar `transformers` en la versión 4.49.0. No se han publicado detalles sobre la composición del dataset de entrenamiento ni sobre el número total de tokens utilizados.

## Capacidades

- Generación de texto conversacional en inglés con tono cálido y emocionalmente solidario.
- Soporte de conversaciones multi-turno (chat) mediante la plantilla estándar de Llama 3.
- Inferencia en dispositivos locales (on-device) gracias al formato GGUF y al tamaño reducido (~1.9 GB).
- Compatible con llama.cpp y herramientas que usen el mismo runtime (llama-cli, bindings de Python, etc.).
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: limitadas al inglés (según la model card).

## Casos de uso

- **Aplicación de chatbot de apoyo emocional offline**: el modelo está diseñado para conversaciones empáticas y solidarias. Puede integrarse en una app móvil Android (como "Demo Chat") que funcione sin conexión, ofreciendo un acompañamiento básico a usuarios que necesiten desahogarse o recibir palabras de aliento.
- **Asistente de bienestar en dispositivos de bajo consumo**: gracias a su tamaño (3B parámetros, cuantización Q4_K_M) y a la ventana de 2.048 tokens, puede ejecutarse en Raspberry Pi, mini-PCs o teléfonos de gama media, proporcionando un servicio de escucha activa sin depender de la nube.
- **Prototipado rápido de sistemas de soporte emocional**: los desarrolladores pueden usar este modelo como base para experimentar con técnicas de prompting o fine-tune adicional, dado que ya está ajustado al dominio emocional y es fácil de desplegar con llama.cpp.
- **Generación de contenido empático en entornos controlados**: puede emplearse para redactar respuestas de apoyo en foros, correos o mensajes automáticos, siempre que se supervise la salida para evitar respuestas inapropiadas.
- **Investigación en IA afectiva**: al ser un modelo abierto y ligero, sirve como punto de partida para estudiar el comportamiento de modelos pequeños en tareas de detección y generación de empatía, comparándolo con el modelo base.
- **Entrenamiento de agentes conversacionales en entornos con restricciones de privacidad**: al funcionar 100% local, evita enviar datos sensibles del usuario a servidores externos, lo que lo hace adecuado para aplicaciones de salud mental donde la confidencialidad es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad emocional. Tampoco se proporcionan comparativas con otros modelos de soporte emocional.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q4_K_M (~1.9 GB de archivo), la carga en memoria es de aproximadamente 2 GB. En CPU pura, se puede ejecutar con ~2-3 GB de RAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo cómodamente. También funciona en Apple Silicon (M1/M2/M3) mediante Metal.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de gama baja y media, así como en iGPUs modernas con suficiente memoria compartida.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), Ollama (si se convierte a formato compatible), llama-cpp-python, o cualquier runtime que soporte GGUF. También puede usarse con vLLM si se convierte a safetensors, aunque no es el formato nativo.
- **Latencia y throughput**: no se han publicado mediciones. En una CPU moderna (por ejemplo, Apple M2 o un Ryzen 5), se espera una generación de 10-20 tokens por segundo con Q4_K_M, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| **T3cmit0/llama32-3b-emo-gguf** | 3.2B | 2.048 (usado) | Llama 3.2 Community | GGUF Q4_K_M | Soporte emocional (fine-tune) |
| **meta-llama/Llama-3.2-3B-Instruct** | 3.2B | 128K (original) | Llama 3.2 Community | safetensors, BF16 | Instruct general |
| **QuantFactory/Llama-3.2-3B-GGUF** | 3.2B | 128K (original) | Llama 3.2 Community | GGUF (varias cuantizaciones) | Instruct general (sin fine-tune emocional) |

La comparativa muestra que este modelo es un fine-tune especializado sobre el base instruct, con una ventana de contexto reducida en la práctica (2.048 tokens) y una única cuantización publicada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tune de Llama 3.2, hereda los sesgos del modelo base. No se ha realizado una evaluación específica de sesgos en el dominio emocional.
- **Riesgo de alucinación**: en conversaciones de soporte emocional, el modelo podría generar consejos médicos o psicológicos incorrectos. No debe utilizarse como sustituto de atención profesional.
- **Limitaciones de contexto**: la ventana de 2.048 tokens es corta para conversaciones largas; el modelo podría perder el hilo en diálogos extensos.
- **Idioma**: solo inglés. No soporta otros idiomas de forma nativa.
- **Restricciones de licencia**: la Llama 3.2 Community License permite uso comercial, pero requiere que los productos derivados incluyan la atribución "Built with Llama" y cumplan con las políticas de uso aceptable de Meta. Es necesario revisar los términos completos.
- **Advertencia específica del autor**: la cuantización Q4_0 de este modelo produce salidas incoherentes con `llama-quantize` build b10488 (reproducido en x86-64 y ARM). Se recomienda usar exclusivamente Q4_K_M.
- **Dependencia de versiones**: la conversión requiere `transformers` 4.49.0; versiones posteriores pueden romper el pipeline de de-cuantización.
- **Sin garantías de producción**: el modelo tiene 0 descargas y 0 likes en Hugging Face; no hay evidencia de pruebas exhaustivas en entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/T3cmit0/llama32-3b-emo-gguf)
- [Modelo base (unsloth/llama-3.2-3b-instruct-bnb-4bit)](https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit)
- [Llama 3.2 3B original (meta-llama)](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [Llama 3.2 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE)
- [llama.cpp (repositorio oficial)](https://github.com/ggml-org/llama.cpp)
- [Documentación de Llama 3.2 (Meta)](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/)
