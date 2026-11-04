# Veda-Labs/vedika-v1-chat-1p5b

## Resumen

Vedika V1 Chat 1.5B es un modelo de lenguaje conversacional compacto publicado por Veda Labs bajo licencia Apache 2.0. Se distribuye en HuggingFace con la librería transformers y está construido sobre la arquitectura Qwen2, según los tags del repositorio. Con 1.543.714.304 parámetros totales, se posiciona en la franja de modelos pequeños orientados a inferencia rápida y despliegue en hardware modesto, lo que lo hace candidato para prototipado, asistentes locales y entornos con restricciones de VRAM.

El modelo se presenta como parte de la línea "Vedika V1 chat" y está afinado para seguir instrucciones y mantener conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`). Su propósito es ofrecer un asistente conversacional ligero para inglés, con un footprint de aproximadamente 3,1 GB en el repositorio.

La relevancia actual del modelo es limitada por la escasez de información técnica publicada: no se documentan datos de entrenamiento, benchmarks, longitud de contexto ni proceso de alineamiento. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (según tag `qwen2`) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Qwen2, tal y como indica el tag `qwen2` del repositorio. Con 1,5B de parámetros en formato safetensors y un tamaño de repositorio de 3,1 GB, los pesos se distribuyen presumiblemente en precisión bf16 o fp16, aunque el autor no lo especifica.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de SFT, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card se limita a indicar que los pesos se redistribuyen bajo la licencia abierta original y que el fichero `LICENSE` del repositorio es la referencia autoritativa. Tampoco se documenta la longitud de contexto soportada ni la configuración de atención.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Seguimiento de instrucciones ("fast instruction following", según la model card).
- Conversaciones multi-turno mediante el formato de mensajes `role`/`content`.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según los tags del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en equipos con GPU de consumo gracias a su tamaño de 1,5B, sirviendo como chatbot de escritorio o prototipo de asistente personal en inglés.
- Pruebas de concepto de producto: al ser Apache 2.0, permite integrar un chat instruct en demos y MVP sin coste de licencia ni negociación con el proveedor.
- Generación de respuestas en pipelines de texto: útil para tareas de reescritura, resumen breve o generación de borradores en inglés donde no se requiere razonamiento complejo.
- Fine-tuning específico de dominio: su tamaño reducido facilita el ajuste fino con LoRA o QLoRA sobre datasets propios en una sola GPU.
- Evaluación comparativa de modelos pequeños: sirve como baseline en experimentos de investigación sobre modelos de ~1,5B en tareas de instrucción.
- Despliegue en entornos con restricciones de VRAM: adecuado para inferencia en GPUs de 8-16 GB o incluso CPU con cuantización, aunque las cuantizaciones no están publicadas por el autor.
- Integración con TGI: al declarar compatibilidad con `text-generation-inference`, puede servirse mediante endpoints HTTP estándar en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~1,6 GB para pesos; en 4 bits: ~0,8 GB para pesos (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en precisión completa, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (declarado en tags), vLLM y llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Vedika V1 Chat 1.5B | ~1,5B | no disponible | Apache 2.0 | en | Basado en Qwen2; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | multilingüe | Modelo base de referencia de la familia Qwen2; benchmarks publicados por el autor |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (según documentación pública de HuggingFace) | Apache 2.0 | en (principalmente) | Alternativa compacta con model card detallada y benchmarks |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | multilingüe | Requiere aceptar licencia de Meta; no es Apache 2.0 |

La comparación se basa en datos públicos de los modelos alternativos; para Vedika V1 Chat 1.5B no hay benchmarks ni contexto documentado que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas de tamaño similar.
- Sin documentación sobre datos de entrenamiento: no se puede auditar la composición del corpus ni detectar sesgos conocidos.
- Riesgo de alucinación inherente a modelos de 1,5B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se recomienda asumir ventanas largas en producción.
- Sin soporte documentado de tool calling ni de flujos agénticos.
- Aunque la licencia es Apache 2.0, la model card advierte de que los pesos se redistribuyen bajo la licencia abierta original y que el fichero `LICENSE` del repositorio es la referencia autoritativa; conviene revisarlo antes de uso comercial.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veda-Labs/vedika-v1-chat-1p5b
- Perfil del autor en HuggingFace: https://huggingface.co/Veda-Labs
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
