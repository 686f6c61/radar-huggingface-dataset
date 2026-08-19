# usermma/Qwen3.8-Queen-27B-mlx-4Bit

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-4Bit` es una conversión al formato MLX (Apple Silicon) del modelo base `aifeifei798/Qwen3.8-Queen-27B`, realizada con la librería `mlx-lm` en su versión 0.31.2. Según los metadatos de HuggingFace, el pipeline declarado es `image-text-to-text`, aunque no se aporta evidencia concreta de capacidades multimodales en la documentación disponible. Los tags del repositorio indican una orientación clara hacia el roleplay, la escritura creativa, el storytelling y la conversación, con soporte para tarjetas de personaje (character cards) y su uso con SillyTavern.

A pesar del nombre "27B", los pesos reales en safetensors suman 4.204.731.904 parámetros (aproximadamente 4,2 mil millones), lo que sugiere que el modelo base es de ese tamaño y no de 27 mil millones, o que existe una discrepancia en la nomenclatura. El repositorio ocupa 15,2 GB, lo que resulta elevado para una cuantización de 4 bits de un modelo de 4,2B (estimación teórica ~2,1 GB), por lo que es posible que se incluyan archivos adicionales o que la cuantización no sea exclusivamente de 4 bits. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su formato MLX, que lo hace directamente ejecutable en hardware Apple Silicon mediante `mlx-lm`, y en su especialización para tareas de rol y narrativa, un nicho con demanda creciente entre desarrolladores de aplicaciones conversacionales y juegos de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5` sugiere familia Qwen 3.5, sin confirmar) |
| Parametros totales | 4.204.731.904 (~4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del modelo base `aifeifei798/Qwen3.8-Queen-27B`. El tag `qwen3_5` apunta a que pertenece a la familia Qwen 3.5, pero no se confirma si se trata de un transformer denso, un modelo con atención lineal o cualquier otra variante. Tampoco hay datos sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineación. La única información disponible es que el repositorio `usermma/Qwen3.8-Queen-27B-mlx-4Bit` es una conversión directa del modelo base al formato MLX, realizada con `mlx-lm` 0.31.2, sin modificaciones en los pesos más allá de la cuantización a 4 bits.

## Capacidades

- Generación de texto conversacional, orientada a roleplay y narrativa interactiva.
- Escritura creativa y storytelling, según los tags del repositorio.
- Compatibilidad con tarjetas de personaje (character cards) y SillyTavern, lo que sugiere un formato de prompt estructurado para definir personajes y contextos.
- Uso como modelo de chat estándar mediante la plantilla de chat del tokenizador (según el ejemplo de la model card).
- No se menciona soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se confirma capacidad multimodal real a pesar del pipeline `image-text-to-text`; la documentación no incluye ejemplos de entrada de imágenes.

## Casos de uso

- Roleplay conversacional en aplicaciones de chat: el modelo puede integrarse en entornos como SillyTavern para mantener personajes coherentes durante largas interacciones, gracias a su orientación específica a este dominio.
- Generación de narrativa interactiva en juegos de texto: adecuado para crear historias ramificadas donde el modelo responde a las acciones del usuario con descripciones y diálogos.
- Asistente de escritura creativa: puede utilizarse como generador de ideas, borradores de escenas o diálogos de personajes en proyectos de ficción.
- Chatbots de entretenimiento en plataformas de mensajería: su licencia Apache 2.0 permite integrarlo en productos comerciales sin coste de licencia.
- Prototipado rápido en Apple Silicon: al estar en formato MLX, se puede cargar y probar localmente en Mac con `mlx-lm` sin necesidad de GPU dedicada, ideal para iterar sobre prompts y estilos narrativos.
- Fine-tuning posterior: al ser un modelo de 4,2B con pesos abiertos, puede servir como base para ajustes adicionales en tareas específicas de rol o conversación, siempre que se mantenga la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- Al ser un modelo MLX de 4 bits con ~4,2B parámetros, el tamaño estimado del archivo de pesos sería de aproximadamente 2,1 GB, aunque el repositorio ocupa 15,2 GB (posiblemente incluye archivos adicionales o el modelo base sin cuantizar).
- Está diseñado para ejecutarse en Apple Silicon (M1, M2, M3, M4) mediante `mlx-lm`. Se recomienda al menos 8 GB de RAM unificada para cargar el modelo en memoria, aunque 16 GB ofrecen mayor margen.
- No se indica soporte para CUDA o ROCm; el formato MLX es específico de Apple.
- Opciones de despliegue: `mlx-lm` para Python, o integración con servidores compatibles con MLX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo base `aifeifei798/Qwen3.8-Queen-27B` no tiene ficha pública detallada, y no se conocen alternativas directas en el mismo nicho (roleplay en formato MLX) con datos comparables. Se indica "no disponible".

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o comportamientos indeseados; al ser un modelo orientado a roleplay, puede generar contenido inapropiado o no deseado si no se aplican filtros de seguridad adicionales.
- El nombre "27B" es engañoso: los pesos reales son de ~4,2B, lo que puede llevar a expectativas incorrectas sobre capacidad y rendimiento.
- No se confirma la capacidad multimodal a pesar del pipeline `image-text-to-text`; es probable que sea un modelo de texto puro.
- La cuantización de 4 bits puede degradar la calidad de generación frente al modelo original en precisión completa, especialmente en tareas que requieren matices lingüísticos.
- Al ser una conversión MLX, no es compatible directamente con ecosistemas CUDA; su uso queda restringido a hardware Apple.
- No hay garantías de soporte o mantenimiento: el repositorio tiene 0 descargas y 0 likes, y el autor no proporciona documentación adicional.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base `aifeifei798/Qwen3.8-Queen-27B` también cumpla con esa licencia (así lo indica su model card, aunque no se ha podido verificar de forma independiente).

## Enlaces

- Repositorio del modelo: https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-4Bit
- Modelo base: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm (referencia general, no incluida en la información proporcionada)
