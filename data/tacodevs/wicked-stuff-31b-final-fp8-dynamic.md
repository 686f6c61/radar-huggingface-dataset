# tacodevs/Wicked-Stuff-31B-Final-FP8-Dynamic

## Resumen

Wicked-Stuff-31B-Final-FP8-Dynamic es una cuantización FP8 del modelo Wicked-Stuff-31B-Final, un fine-tune orientado a roleplay construido sobre Gemma 4 de 31B parámetros. El trabajo lo publica el usuario tacodevs y se apoya en la librería llm-compressor con el formato compressed-tensors para generar pesos y activaciones en FP8 (esquema W8A8 dinámico). El objetivo es reducir el coste de memoria y aumentar el throughput en GPUs con soporte nativo de FP8 (Hopper, Blackwell y Ada) sin necesidad de datos de calibración.

El modelo base es un Gemma 4 de 31B, una arquitectura transformer (los detalles finos de la familia Gemma 4 no se documentan en la información disponible), afinado por ReadyArt para tareas de rol y narrativa. Esta versión cuantizada conserva en BF16 las capas de visión, audio, embeddings y la cabeza de salida, mientras que todas las capas `Linear` pasan a FP8. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene revisar la licencia del modelo base original.

Su relevancia actual es doble: por un lado, permite desplegar un modelo de 31B en configuraciones de una sola GPU con FP8, y por otro, la integración con vLLM incluye parsers específicos para razonamiento y tool calling de la familia Gemma 4, lo que lo hace directamente utilizable en pipelines de agentes y chat. No obstante, el repositorio no incluye model card detallada, benchmarks ni información sobre idiomas o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B), cuantizado FP8 W8A8 dinámico |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | FP8_DYNAMIC (W8A8): pesos FP8 per-channel, activaciones FP8 dinámicas per-token; visión, audio, embeddings y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Gemma 4 con 31.273 millones de parámetros, según los pesos reales del repositorio. Sobre esa base, ReadyArt produjo un fine-tune orientado a roleplay (Wicked-Stuff-31B-Final), y tacodevs aplicó una cuantización post-entrenamiento con llm-compressor. El esquema es FP8_DYNAMIC W8A8: los pesos de todas las capas `Linear` se almacenan en FP8 con escala por canal, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Las capas de visión, audio, embeddings y `lm_head` permanecen en BF16, lo que preserva la calidad de las proyecciones de entrada/salida y de las torres multimodales.

Una ventaja técnica destacable es que este esquema no requiere datos de calibración, lo que simplifica la reproducibilidad y evita sobreajustar las escalas a un corpus concreto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base o en el fine-tune. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la model card se limita a describir el esquema de cuantización y el comando de despliegue en vLLM.

## Capacidades

- Generación de texto y narrativa: el fine-tune está orientado explícitamente a roleplay, por lo que se espera un comportamiento fuerte en diálogo de personajes y ficción.
- Razonamiento con modo thinking: se activa pasando `chat_template_kwargs: {"enable_thinking": true}`; vLLM incluye `--reasoning-parser gemma4` para separar el razonamiento de la respuesta.
- Tool calling / function calling: soportado vía `--enable-auto-tool-choice --tool-call-parser gemma4` en vLLM.
- Capacidades multimodales: el modelo base Gemma 4 incluye torres de visión y audio que esta cuantización mantiene en BF16, por lo que en principio conserva entrada de imagen y audio (no verificado en la información disponible).
- Capacidades multilingües: no disponible; no se documentan idiomas soportados.
- Contexto largo: el ejemplo oficial de despliegue configura 32.768 tokens con caché KV en FP8, aunque la longitud máxima nativa no se especifica.
- Agentes y razonamiento multi-paso: la combinación de thinking mode y tool calling permite construir bucles de agente, aunque no hay evaluación publicada de su fiabilidad.

## Casos de uso

- Roleplay y narrativa interactiva: es el propósito declarado del fine-tune; se usaría como backend de chat con system prompts de personaje, gestionando conversaciones multi-turno con hasta 32K tokens de contexto según la configuración de vLLM.
- Asistente conversacional con razonamiento visible: activando `enable_thinking` y el parser `gemma4`, se puede exponer la cadena de razonamiento en la interfaz y separarla de la respuesta final, útil en productos de asistencia técnica.
- Agentes con herramientas: gracias a `--enable-auto-tool-choice` y `--tool-call-parser gemma4`, puede integrarse en orquestadores que necesiten invocar APIs, consultar bases de datos o ejecutar funciones, siempre que se valide su tasa de acierto en tool calling (no hay benchmarks publicados).
- Despliegue en una sola GPU Hopper o Ada: con FP8 W8A8 y caché KV en FP8, un modelo de 31B cabe en GPUs de 40-48 GB (L40S, A100 80GB, H100) y potencialmente en configuraciones de 24 GB con cuantización adicional; adecuado para prototipos y entornos de investigación con presupuesto limitado.
- Generación de ficción y contenido creativo por lotes: el throughput FP8 permite procesar grandes volúmenes de prompts narrativos en pipelines offline sin la penalización de memoria de un modelo BF16 equivalente.
- Investigación sobre cuantización: sirve como caso de estudio reproducible de FP8_DYNAMIC sin calibración sobre un modelo multimodal, comparando calidad frente al original BF16 en tareas de generación libre.
- Chat multimodal experimental: si se confirma que las torres de visión y audio funcionan tras la cuantización, podría usarse para descripción de imágenes o diálogo sobre audio en entornos de demo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 33,3 GB en safetensors; en FP8 se necesita aproximadamente esa cifra más overhead de activaciones y caché KV. Con caché KV en FP8 y 32K de contexto, el consumo adicional puede ser de varios GB según el lote.
- GPU recomendadas: H100 y H200 (Hopper) y Blackwell para máximo rendimiento FP8; L40S y RTX 4090 (Ada) también soportan FP8, aunque la RTX 4090 con 24 GB no permite cargar el modelo completo en FP8 sin técnicas adicionales de offload o cuantización más agresiva.
- Cabe en consumer GPU: no de forma directa en RTX 4090 (24 GB) con este esquema; sí en GPUs profesionales de 40-80 GB. Para consumer sería necesario un GGUF de menor precisión, no incluido en este repositorio.
- Opciones de despliegue: vLLM es el camino documentado por el autor, con los flags `--max-model-len 32768 --kv-cache-dtype fp8 --reasoning-parser gemma4 --enable-auto-tool-choice --tool-call-parser gemma4`. No se documentan otras opciones (llama.cpp, Ollama, TGI) para este formato compressed-tensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-31B-Final-FP8-Dynamic | 31,3B | 32K en ejemplo de despliegue | FP8 W8A8 dinámico | Apache 2.0 | Fine-tune de roleplay sobre Gemma 4; sin benchmarks |
| ReadyArt/Wicked-Stuff-31B-Final | 31,3B (estimado) | no disponible | BF16 (original) | no disponible | Modelo base sin cuantizar; mayor VRAM |
| Gemma 4 31B (modelo base de la familia) | 31B | no disponible | BF16 | no disponible en esta ficha | Base generalista; el fine-tune está orientado a rol |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad que permitan estimar la degradación introducida por la cuantización FP8 frente al modelo BF16.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, sesgos ni limitaciones conocidas, lo que dificulta una evaluación rigurosa.
- Riesgo de alucinación: inherente a los modelos generativos de 31B; el modo thinking no elimina este riesgo y no hay evaluaciones de factualidad.
- Sesgos: al ser un fine-tune de roleplay sin documentación de dataset, pueden aparecer sesgos de estilo, contenido o personaje no auditados.
- Idiomas: no confirmados; el uso en castellano no está garantizado ni evaluado.
- Licencia: el repositorio declara Apache 2.0, pero conviene verificar la licencia del modelo base (Gemma 4) y del fine-tune de ReadyArt antes de uso comercial, ya que pueden imponer restricciones adicionales.
- Compatibilidad: el formato compressed-tensors FP8 está pensado para vLLM y hardware con FP8 nativo; en GPUs sin soporte FP8 el rendimiento puede degradarse o requerir emulación.
- Contexto: la ventana de 32K es la configurada en el ejemplo, no necesariamente la máxima nativa; superar ese límite puede provocar errores o degradación.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tacodevs/Wicked-Stuff-31B-Final-FP8-Dynamic
- Modelo base (fine-tune): https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
