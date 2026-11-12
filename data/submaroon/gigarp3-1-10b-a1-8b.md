# SubMaroon/GigaRP3.1-10B-A1.8B

## Resumen

GigaRP3.1-10B-A1.8B es un ajuste fino (fine-tune) para roleplay en ruso del modelo GigaChat 3 Lightning, desarrollado por el usuario independiente SubMaroon sobre los pesos de ai-sage/GigaChat3.1-10B-A1.8B-bf16. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 11.479.750.784 parámetros totales y aproximadamente 1.800 millones de parámetros activos por token, según indica el propio nombre del modelo y la model card. El modelo base es de la familia DeepSeek V3, tal como refleja el tag `deepseek_v3` del repositorio.

El ajuste consiste en un único LoRA "horneado" (baked in) sobre capas concretas del modelo base: la proyección de salida de atención (`o_proj`) y las filas de valor de `kv_b_proj`, junto con el experto compartido (`mlp.shared_experts`), aplicado en las capas 8 a 25 con una fuerza de 0.65. Los expertos enrutados, el router, las consultas, las claves, los embeddings y la cabeza de salida no se han modificado. El entrenamiento emplea la función de pérdida GEM (beta 0.7), una alternativa a la entropía cruzada orientada a preservar la diversidad, con ventanas de 8192 tokens.

Su relevancia es acotada: se trata de una compilación experimental y privada, con cero descargas y cero "likes" en el momento de la consulta, orientada específicamente al roleplay en ruso y etiquetada como `not-for-all-audiences`. No obstante, resulta interesante como ejemplo de ajuste quirúrgico de un MoE de gran tamaño mediante LoRA selectivo, sin tocar el enrutamiento ni los expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia DeepSeek V3 |
| Parametros totales | 11.479.750.784 |
| Parametros activos | ~1.8B (según nombre del modelo) |
| Longitud de contexto | no disponible (ventanas de entrenamiento de 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 23.0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del GigaChat 3 Lightning (10B totales, 1.8B activos), que a su vez sigue el diseño DeepSeek V3 según los tags del repositorio. El ajuste se realizó mediante un único LoRA aplicado y fusionado en los pesos, con un alcance deliberadamente restringido: `o_proj` y las filas de valor de `kv_b_proj` en las capas 8 a 25, más el experto compartido (`mlp.shared_experts`) en ese mismo rango de capas, todo con fuerza 0.65 (donde 2.0 equivale al valor tal como se entrenó). El resto de componentes del modelo —expertos enrutados, router, queries, keys, embeddings y cabeza de salida— permanecen intactos.

El entrenamiento utilizó la pérdida GEM (beta 0.7), descrita por el autor como una alternativa a la entropía cruzada que preserva la diversidad, con ventanas de 8192 tokens. Se enmascararon fuera de la pérdida varias categorías de texto: frases de relleno ("slop"), n-gramas repetidos a nivel de dataset, texto copiado de la model card, construcciones de relleno y fragmentos que repetían respuestas anteriores del propio modelo. Además, se eliminó el bloque `developer system` de la plantilla de chat, conservando la plantilla original como `chat_template.original.jinja`. El bloque MTP (Multi-Token Prediction) del modelo base no se reentrenó.

## Capacidades

- Generación de texto orientada a roleplay conversacional en ruso.
- Conversaciones multi-turno con roles `system`, `user` y `assistant` mediante un formato de plantilla específico.
- Formato de prompt: `role<|role_sep|>\n` + texto + `<|message_sep|>\n\n`; cadena de parada `<|message_sep|>`.
- Parámetros de muestreo recomendados por el autor: temperatura 0.85, min_p 0.05, sin penalización de repetición.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al ruso según la metadata del modelo.

## Casos de uso

- Roleplay conversacional en ruso: el modelo está entrenado específicamente para mantener personajes y diálogos multi-turno, con enmascaramiento de repeticiones para reducir la deriva de estilo.
- Prototipado de chatbots de personaje: su tamaño activo de ~1.8B permite iterar con coste de inferencia relativamente bajo en comparación con un modelo denso de 10B.
- Investigación sobre ajuste selectivo de MoE: sirve como referencia de cómo un LoRA limitado a atención y experto compartido altera el comportamiento sin tocar el enrutamiento.
- Generación de narrativa interactiva en ruso: adecuado para ficción ramificada donde el usuario adopta un rol y el modelo responde en personaje.
- Evaluación de la pérdida GEM: útil para estudiar el efecto de funciones de pérdida que preservan diversidad frente a entropía cruzada en tareas creativas.
- Experimentación con plantillas de chat personalizadas: al eliminar el bloque `developer system`, permite probar formatos de sistema alternativos en pipelines de conversación.
- Base para futuros ajustes comunitarios: al estar bajo licencia MIT y en safetensors, puede servir de punto de partida para otros fine-tunes en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 23 GB solo para pesos (11.479.750.784 parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 12 GB para pesos; en 4 bits, en torno a 6-7 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) al límite en bf16 y con margen en cuantización de 8 bits.
- En GPU de consumo: posible en RTX 4090 con cuantización; en tarjetas de 12-16 GB requeriría cuantización agresiva a 4 bits.
- Opciones de despliegue: no se documentan oficialmente; al ser safetensors de arquitectura DeepSeek V3, requeriría frameworks compatibles con dicha arquitectura (por ejemplo, vLLM o SGLang con soporte para el modelo base). No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaRP3.1-10B-A1.8B | 11.48B | ~1.8B | no disponible | MIT | Hugging Face, 0 descargas |
| GigaChat3.1-10B-A1.8B (base) | ~10B | ~1.8B | no disponible | no disponible en la informacion | Hugging Face (ai-sage) |
| Modelos densos de ~10B para roleplay | ~10B | 10B | variable | variable | múltiples |

La comparación con alternativas de roleplay en ruso no está disponible en la información proporcionada. El principal punto de referencia es el modelo base, del que este fine-tune hereda arquitectura y tamaño pero modifica atención y experto compartido.

## Limitaciones y advertencias

- Modelo etiquetado como `not-for-all-audiences`: puede generar contenido no apto para todos los públicos.
- Entrenado exclusivamente para ruso; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Compilación experimental y privada según el autor; sin descargas ni validación comunitaria.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado en esta ficha.
- Sesgos no documentados; al ser un ajuste de roleplay, puede amplificar estereotipos presentes en los datos de entrenamiento.
- La plantilla de chat elimina el bloque `developer system`; usarla con dicho bloque puede degradar el comportamiento.
- El bloque MTP no se reentrenó, por lo que la decodificación especulativa basada en MTP puede no estar alineada con el ajuste.
- Licencia MIT permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia de ai-sage/GigaChat3.1-10B-A1.8B-bf16.
- No hay cuantizaciones publicadas ni pipeline declarado, lo que complica el despliegue directo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SubMaroon/GigaRP3.1-10B-A1.8B
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16
