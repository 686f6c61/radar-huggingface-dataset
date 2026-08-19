# steampunque/Qwen3.8-27B-MP-GGUF

## Resumen

`steampunque/Qwen3.8-27B-MP-GGUF` es una cuantización GGUF de precisión mixta (mixed precision) por capas del modelo Qwen3.8-27B, desarrollado originalmente por Qwen. El autor de la cuantización, steampunque, aplica un esquema híbrido que asigna diferentes niveles de cuantización K (Q3_K, Q4_K, Q5_K, Q6_K) a cada capa del modelo, con el objetivo de reducir el tamaño del archivo manteniendo un rendimiento cercano al de una cuantización Q4_K_M estándar. El resultado es un archivo de aproximadamente 16,5 GB que ofrece una perplejidad (PPL) de 7,9 en el conjunto de prueba utilizado por el autor, ligeramente superior a la del Q4_K_M (7,2) pero con un tamaño menor.

El modelo base, Qwen3.8-27B, es un modelo denso con capacidades de visión y razonamiento (descrito como "dense RL model"), que puede procesar imágenes y texto mediante proyectores multimodales (mmproj). La cuantización incluye la capa 64 de nextn MTP (multi-token prediction), lo que permite experimentar con decodificación especulativa en versiones recientes de llama.cpp. El modelo tiene la particularidad de decidir automáticamente si activa un bloque de pensamiento ("think block") o no, lo que reduce el sobre-pensamiento y los bucles de repetición típicos de los modelos RL.

Esta ficha es relevante para desarrolladores que necesitan ejecutar Qwen3.8-27B en hardware de consumo o en entornos con recursos limitados, ya que la cuantización híbrida ofrece un equilibrio entre calidad y tamaño, además de soporte para inferencia con contexto largo (hasta 140k tokens de cache KV según las pruebas del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso con atención y capas de visión (modelo base Qwen3.8-27B); cuantización por capas con esquema híbrido Q4_E_H |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se mencionan caches KV de 90k y 140k+ en pruebas, pero no se especifica la ventana máxima oficial) |
| Tipos de cuantizacion | Q4_K_M (estándar), Q4_E_H (híbrido por capas con Q3_K, Q4_K, Q5_K, Q6_K) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con capacidades multimodales (visión y texto) y entrenamiento con reinforcement learning (RL), lo que le permite decidir dinámicamente si generar un bloque de razonamiento explícito ("think block") o responder directamente. La cuantización aquí descrita no modifica la arquitectura, sino que aplica una estrategia de cuantización por capas: cada capa (attention, FFN, SSM, etc.) recibe un nivel de cuantización K distinto según su sensibilidad, definido en el esquema `LAYER_TYPES`. El resultado es un archivo GGUF de ~16,5 GB con una PPL de 7,9 en el conjunto de prueba del autor, frente a 7,2 del Q4_K_M estándar (que pesa ~16,8 GB).

No se dispone de información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). El autor de la cuantización menciona que la PPL es significativamente menor que en la serie Qwen 3.5/3.6, lo que sugiere un entrenamiento más enfocado en inglés o en el conjunto Wikitext, pero no hay datos oficiales al respecto.

## Capacidades

- Generación de texto y razonamiento: el modelo puede resolver problemas de lógica y sentido común, como se muestra en el ejemplo del prompt "washcar" incluido en la model card.
- Razonamiento con "think block": el modelo decide automáticamente si activar un bloque de pensamiento; se puede forzar con el token ` thinking\n` o suprimirlo con ` thinking\n` + `\n response\n\n`.
- Capacidades multimodales: el modelo base es capaz de procesar imágenes y texto mediante el proyector mmproj incluido en el repositorio (archivo mmproj).
- Soporte MTP (multi-token prediction): la capa 64 nextn MTP está incluida; requiere llama.cpp b9180 o superior para experimentar con decodificación especulativa.
- Inferencia eficiente en GPU: en una configuración de 2x RTX 4070 (1 RPC), alcanza ~24 tokens/s con cache KV F16 y ~23 tokens/s con Q8_0.
- Comportamiento conversacional: etiquetado como "conversational" en HuggingFace.

## Casos de uso

- Asistentes de razonamiento en local: el modelo puede ejecutarse en una GPU de consumo (p. ej., RTX 4070) y responder preguntas complejas de lógica o sentido común, gracias a su capacidad de activar bloques de pensamiento cuando es necesario.
- Procesamiento de documentos con imágenes: al ser un modelo multimodal, puede combinarse con el proyector mmproj para extraer texto o responder preguntas sobre imágenes, útil en automatización de oficinas o análisis de capturas.
- Chatbots con control de coste: la cuantización Q4_E_H reduce el uso de VRAM y memoria, permitiendo desplegar un asistente conversacional en hardware de gama media sin sacrificar demasiada calidad.
- Experimentación con decodificación especulativa: la inclusión de la capa MTP permite probar técnicas de aceleración en llama.cpp, aunque el autor advierte que la eficiencia puede ser limitada.
- Evaluación de modelos RL en entornos restringidos: investigadores pueden estudiar el comportamiento del modelo (decisión de pensar o no) en GPUs de 12-16 GB, algo inviable con el modelo en FP16.
- Inferencia con contexto largo: con caches KV de hasta 140k tokens (según las pruebas del autor), es adecuado para resumir documentos extensos o mantener conversaciones de muchas vueltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento proporcionados por el autor son:

| Metrica | Valor |
|---|---|
| PPL (Q4_K_M estándar) | 7,2 |
| PPL (Q4_E_H híbrido) | 7,9 |
| Tamaño Q4_K_M | 16,8 GB |
| Tamaño Q4_E_H | 16,5 GB |
| Velocidad de generación (2x RTX 4070, Q4_E_H + F16 QKV) | ~24 tokens/s |
| Velocidad de generación (2x RTX 4070, Q4_E_H + Q8_0 NKV) | ~23 tokens/s |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa ~16,5 GB, por lo que se recomienda al menos 20 GB de VRAM para cargar el modelo completo con overhead. En la práctica, el autor probó en una configuración de 2x RTX 4070 (12 GB cada una) usando RPC, lo que sugiere que es posible ejecutarlo en GPUs de 12 GB si se distribuye entre varias.
- GPU recomendadas: RTX 4070 (12 GB) o superior, o configuraciones multi-GPU con RPC (p. ej., 2x RTX 4070). También debería funcionar en GPUs de 24 GB (RTX 3090/4090, A5000) sin necesidad de RPC.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 16-20 GB de VRAM total (individual o combinada).
- Opciones de despliegue: llama.cpp (con soporte MTP desde b9180), y cualquier backend compatible con GGUF (Ollama, LM Studio, etc.). El autor menciona "endpoints_compatible" en los tags, lo que sugiere compatibilidad con servidores de inferencia.
- Latencia y throughput: en 2x RTX 4070, ~23-24 tokens/s con contexto largo. No se proporcionan datos de latencia por token individual.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (mismo tamaño o misma tarea). El autor no proporciona datos de otros modelos, y no se han encontrado referencias a Qwen3.8-27B en benchmarks públicos. Se recomienda consultar la documentación oficial de Qwen para comparativas con otros modelos de la familia.

## Limitaciones y advertencias

- La cuantización híbrida Q4_E_H presenta una PPL ligeramente superior (7,9) frente al Q4_K_M estándar (7,2), lo que puede traducirse en una pérdida sutil de calidad en tareas de precisión.
- El modelo puede decidir no activar el bloque de pensamiento en prompts que considera fáciles, lo que en algunos casos (como el ejemplo del test IQ mencionado en la model card) puede llevar a respuestas incorrectas. Se puede forzar el think block manualmente.
- La decodificación especulativa no es eficiente con este modelo debido al esquema de atención; el autor recomienda no usar especulación antes de los parches MTP de Qwen3.5, y advierte que incluso con soporte MTP la eficiencia puede ser limitada.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base. Al ser una cuantización, no se han realizado evaluaciones adicionales de seguridad o robustez.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente y sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B también esté bajo la misma licencia (así aparece en los tags de HuggingFace).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steampunque/Qwen3.8-27B-MP-GGUF
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
