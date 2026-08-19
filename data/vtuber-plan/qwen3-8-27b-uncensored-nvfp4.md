# Vtuber-plan/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

El modelo `Vtuber-plan/Qwen3.8-27B-Uncensored-NVFP4` es una variante comunitaria del hipotético Qwen3.8-27B, cuantizada en formato NVFP4 (NVIDIA Floating Point 4 bits) para inferencia eficiente en hardware moderno. Desarrollado por el usuario Vtuber-plan, este modelo se presenta como una versión "uncensored" (sin censura) obtenida mediante técnicas de abliteración, que eliminan los mecanismos de rechazo de contenido del modelo original. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para proyectos que requieren generación de texto sin restricciones temáticas.

Aunque la model card original apenas contiene información (solo la licencia), fuentes externas revelan que se basa en una arquitectura híbrida con capas de Gated DeltaNet y Gated Attention, con 27 mil millones de parámetros y una ventana de contexto no especificada. La cuantización NVFP4 reduce el tamaño a aproximadamente 16,8 GB (en su versión GGUF Q4_K_M), permitiendo su ejecución en GPUs de consumo con 24 GB de VRAM. Su relevancia radica en ofrecer una alternativa sin filtros para aplicaciones creativas, roleplay o investigación, aunque con los riesgos asociados a la ausencia de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, alternando 3× (Gated DeltaNet → FFN) + 1× (Gated Attention → FFN) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), GGUF Q4_K_M (~16,8 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (para NVFP4), GGUF (para cuantización Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura, descrita en la entrada de FriendliAI, es un stack híbrido de 64 capas donde cada grupo de 3 capas usa Gated DeltaNet (una variante de atención lineal con decaimiento exponencial) seguida de una red feed-forward, y cada cuarta capa usa Gated Attention clásica seguida de FFN. Las proyecciones de decaimiento y beta de DeltaNet son de bajo rango y sensibles a la precisión, por lo que se mantienen en bf16 junto con la convolución causal 1D. Esta combinación busca equilibrar eficiencia computacional con capacidad de modelado de dependencias a largo plazo.

El entrenamiento original de Qwen3.8-27B no está documentado en las fuentes disponibles; solo se sabe que el modelo base es posteriormente "abliterado" (técnica que elimina selectivamente las representaciones neuronales asociadas al rechazo de contenido) para producir la variante "uncensored". El proceso de abliteración, descrito en el blog de MindStudio, emplea una metodología de divergencia KL y pruebas de rechazo basadas en un juez para verificar que el modelo ya no se niega a responder a solicitudes sensibles. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto libre: produce respuestas sin filtros temáticos, incluyendo contenido explícito, violento o controvertido, gracias a la abliteración.
- Razonamiento y comprensión del lenguaje: al estar basado en Qwen3.8-27B, conserva capacidades generales de razonamiento, aunque no se han publicado benchmarks específicos.
- Generación de código: probablemente mantiene habilidades de programación, pero no hay evidencia concreta en la documentación.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no especificadas; se asume herencia de Qwen, pero sin confirmación.
- Modo de pensamiento (thinking mode): no mencionado.

## Casos de uso

- Escritura creativa sin restricciones: autores de ficción, guionistas o creadores de contenido pueden generar narrativas con temáticas adultas o controvertidas sin que el modelo las rechace. La abliteración elimina las negativas, permitiendo explorar tramas complejas.
- Roleplay y chatbots de personajes: en plataformas de entretenimiento, el modelo puede interpretar personajes con personalidades extremas o responder a diálogos provocativos, manteniendo coherencia gracias a su contexto largo (aunque este no esté documentado).
- Investigación en IA de seguridad: los investigadores pueden estudiar el comportamiento de modelos sin censura para analizar sesgos, alucinaciones o riesgos de contenido dañino, comparando con versiones moderadas.
- Generación de contenido para juegos de rol de mesa: ayuda a los game masters a crear historias, diálogos y descripciones sin limitaciones temáticas, acelerando la preparación de sesiones.
- Prototipado de aplicaciones de chat personalizadas: desarrolladores que necesitan un backend de lenguaje sin filtros para aplicaciones privadas (no públicas) pueden integrarlo vía Ollama o llama.cpp, con el GGUF Q4_K_M.
- Análisis de textos polémicos: para tareas de clasificación o generación de resúmenes sobre temas sensibles, donde un modelo moderado podría negarse a procesar ciertos inputs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta variante específica.

## Requisitos de hardware

- VRAM estimada: la versión GGUF Q4_K_M ocupa ~16,8 GB, por lo que requiere al menos 20 GB de VRAM para inferencia con contexto moderado. La versión NVFP4 (4 bits) tiene un tamaño similar, aunque depende de la implementación.
- GPUs recomendadas: para NVFP4 se necesitan GPUs NVIDIA con soporte FP4 (arquitectura Blackwell, e.g., B200, RTX 5090). Para GGUF Q4_K_M, GPUs de consumo como RTX 3090, RTX 4090, o A6000 (24 GB VRAM) son suficientes.
- Compatibilidad con consumer GPU: sí, en GPUs con 24 GB de VRAM usando cuantización Q4_K_M. Para 16 GB (RTX 4080, 4070 Ti) podría caber con contexto reducido, pero no está garantizado.
- Opciones de despliegue: vLLM (para NVFP4), llama.cpp, Ollama (con tag personalizado), TGI. El repositorio de GitHub menciona que se puede usar `ollama run` con el tag que incluye el "residual" para mantener el estado sin censura.
- Latencia y throughput: no disponibles; dependerá del hardware y la implementación.

## Comparativa con modelos similares

No hay información suficiente para establecer comparativas directas con otros modelos de la misma categoría. Se podría comparar con Qwen3-27B (si existiera) o con Llama-3-27B, pero no se dispone de datos de rendimiento ni de parámetros de contexto para esta variante. La única referencia es que es una abliteración de Qwen3.8-27B, y existen otras versiones "uncensored" comunitarias (como joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt) que probablemente comparten arquitectura y propósito, pero sin métricas publicadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin censura, es más propenso a generar contenido falso, ofensivo o peligroso sin filtro. No se ha realizado una evaluación de seguridad.
- Riesgo de contenido dañino: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede producir instrucciones para actividades ilegales, violencia explícita o discurso de odio. No debe usarse en aplicaciones públicas sin moderación adicional.
- Limitaciones de contexto: la longitud de contexto no está documentada; podría ser inferior a la de otros modelos Qwen (típicamente 32K o 128K), lo que afectaría a tareas de memoria larga.
- Idiomas: no se especifica qué idiomas soporta; aunque Qwen suele ser multilingüe, esta variante podría tener un entrenamiento limitado.
- Licencia y uso comercial: Apache 2.0 permite uso comercial, pero el responsable legal es el usuario. El modelo no cuenta con garantías de seguridad ni soporte oficial.
- Estabilidad en producción: al ser un modelo comunitario sin mantenimiento, puede haber bugs o incompatibilidades con frameworks específicos. La cuantización NVFP4 requiere software reciente (vLLM con soporte FP4).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vtuber-plan/Qwen3.8-27B-Uncensored-NVFP4
- Repositorio GitHub con GGUF y Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Modelo de unsloth (base NVFP4): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo de joshebbs (variante similar): https://huggingface.co/joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt
- Blog de MindStudio sobre abliteración: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Entrada en FriendliAI con arquitectura: https://friendli.ai/models/joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt
