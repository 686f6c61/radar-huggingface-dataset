# stupidlime/Mochi-1.5-Kiri

## Resumen

Mochi 1.5 — Kiri es un ajuste fino de tipo "personaje" sobre huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3, publicado por el usuario stupidlime en HuggingFace. Se trata de un modelo de 494.032.768 parámetros (0,5 B) derivado de la familia Qwen2.5, distribuido únicamente en formato GGUF con cuantización Q4_K_M y pensado para ejecución local en hardware muy modesto. El autor lo presenta explícitamente como un experimento "poco profesional, solo por diversión", sin vocación de uso en producción.

El objetivo del modelo no es el rendimiento bruto, sino dotar a un modelo de 0,5 B de una personalidad concreta: un tono seco, calmado, respuestas cortas, sin entusiasmo y sin preguntas de seguimiento. Forma parte de la serie Mochi, en la que el autor publica variantes de personalidad del mismo modelo base de 0,5 B. Esto lo sitúa en la categoría de modelos conversacionales ultraligeros para prototipado, demos y pruebas de concepto más que para tareas de razonamiento o conocimiento factual.

Su relevancia actual es acotada pero clara: sirve como ejemplo reproducible de un pipeline de fine-tuning con QLoRA y Unsloth sobre una GPU gratuita (Kaggle T4), con solo 868 ejemplos de entrenamiento. Es útil para quienes quieren estudiar cómo se comporta el ajuste de personalidad en modelos tan pequeños, cómo se degrada la precisión factual al hacerlo y qué se puede esperar de un modelo de 0,5 B cuantizado a 4 bits.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (detalle de capas y cabezas no disponible en la model card) |
| Parametros totales | 494.032.768 (≈0,5 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo oficial de llama.cpp usa `--ctx-size 2048`. El modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantizacion | Q4_K_M (único publicado en el repositorio GGUF); no se listan otros niveles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano del repositorio: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros con tokenizador de vocabulario amplio y atención de consultas agrupadas (GQA), característica habitual de la familia Qwen2. La model card no desglosa número de capas, dimensión oculta ni número de cabezas, por lo que esos datos quedan como no disponibles. La variante base elegida es la versión "abliterated" de huihui-ai, es decir, una versión del modelo instruct a la que se le ha aplicado una técnica de ablación de dirección de rechazo para reducir las negativas a responder.

El ajuste se realizó con Unsloth mediante QLoRA sobre una GPU T4 de Kaggle, con un conjunto de 868 ejemplos de entrenamiento, 3 épocas y una tasa de aprendizaje de 1e-4. No se documentan ni el número de tokens vistos, ni la composición del dataset, ni etapas de RLHF o DPO posteriores. Tampoco se describen innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). Es, por tanto, un fine-tuning de propósito estilístico: el objetivo es modificar el registro y la longitud de las respuestas, no añadir capacidades nuevas.

## Capacidades

- Generación de texto conversacional en inglés con un estilo fijo: respuestas cortas, tono seco y calmado, sin entusiasmo y sin preguntas de seguimiento.
- Conversación multi-turno básica, limitada por el tamaño del modelo y por la ventana de contexto que se configure en el runtime.
- Instrucciones simples y peticiones directas de texto breve.
- Funcionamiento en local sobre CPU o GPU de gama baja gracias al formato GGUF Q4_K_M.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe: solo inglés declarado; el modelo base Qwen2.5 es multilingüe, pero el autor solo garantiza inglés.
- La model card advierte de dos limitaciones concretas de capacidad: precisión factual degradada respecto al modelo base y respuestas de identidad incorrectas (puede devolver la identidad por defecto de Qwen al preguntar "who are you").

## Casos de uso

- Prototipado de chatbots de personaje: el modelo está entrenado específicamente para mantener un personaje seco y poco efusivo, por lo que encaja en demos de rol conversacional donde la coherencia de tono importa más que el conocimiento factual.
- Pruebas de integración de pipelines de inferencia: al ser un GGUF de 0,4 GB, permite validar extremo a extremo un flujo con llama.cpp u Ollama en segundos, sin consumir recursos de GPU dedicada.
- Generación de respuestas cortas para bots de comunidad (Discord, IRC, foros): su tendencia a respuestas breves y sin preguntas de seguimiento reduce el ruido en canales con mucho tráfico, siempre que no se dependa de exactitud factual.
- Ejecución en dispositivos con recursos muy limitados: Raspberry Pi, mini-PC con iGPU o portátiles sin GPU pueden servir el modelo cuantizado a 4 bits para demos offline.
- Investigación sobre fine-tuning con QLoRA: el autor documenta hiperparámetros (868 ejemplos, 3 épocas, lr 1e-4, Unsloth sobre T4), lo que lo convierte en una referencia reproducible para estudiar ajuste de estilo en modelos de 0,5 B.
- Estudio de seguridad y técnicas de abliteration: al derivar de una variante abliterated, sirve para analizar empíricamente qué efectos tiene la ablación de rechazo combinada con un fine-tuning de personalidad en un modelo pequeño.
- Generación de texto auxiliar de bajo coste: relleno de marcadores, respuestas plantilla o texto de ambiente en aplicaciones donde el contenido no requiere verificación factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco ofrece comparaciones numéricas con el modelo base. El único dato de rendimiento aportado por el autor es cualitativo: la precisión factual está degradada respecto a huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB con la cuantización Q4_K_M publicada (el archivo del repositorio ocupa 0,4 GB); alrededor de 1 GB en FP16 si se reconstruye desde los pesos del modelo base.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). No se necesita hardware de datacenter.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU integradas. También es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante `Modelfile` con `FROM`), y cualquier runtime compatible con GGUF. Al publicarse solo en GGUF, no se distribuyen pesos safetensors listos para vLLM o TGI, aunque podrían derivarse del modelo base.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia, y no se especifica el hardware utilizado en las pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mochi 1.5 — Kiri | 494.032.768 (≈0,5 B) | No disponible en la model card | Sin benchmarks publicados; precisión factual degradada respecto a su base | Apache 2.0 | GGUF Q4_K_M en HuggingFace |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | ≈0,5 B | No disponible en la información proporcionada | Sin datos comparables en esta ficha | Apache 2.0 (heredada de Qwen2.5) | HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct | ≈0,5 B | 32.768 tokens nativos según la documentación del modelo base | Referencia de la familia; sin cifras en la información disponible | Apache 2.0 | HuggingFace |
| Alternativas de tamaño similar (por ejemplo SmolLM2-360M-Instruct o TinyLlama-1.1B-Chat) | 0,36-1,1 B | No disponible | No disponible | Apache 2.0 en la mayoría de casos | HuggingFace |

No se dispone de comparaciones cuantitativas publicadas entre Mochi 1.5 — Kiri y estos modelos, por lo que la tabla solo refleja tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor declara que el modelo está hecho "solo por diversión" y que "no tiene uso real si buscas algo potente o coherente". No debe usarse en producción sin una evaluación previa.
- Precisión factual degradada de forma explícita respecto al modelo base: el entrenamiento de personalidad sacrifica recall factual a 0,5 B.
- Respuestas de identidad incorrectas: puede devolver la identidad por defecto de Qwen al preguntarle quién es.
- Riesgo elevado de alucinación inherente a un modelo de 0,5 B con cuantización de 4 bits; cualquier dato factual generado debe verificarse.
- Idiomas: solo se declara inglés. El comportamiento en castellano u otros idiomas no está validado.
- Contexto: la model card no especifica la ventana soportada y el ejemplo de uso fija 2048 tokens, muy por debajo del contexto nativo del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de una variante "abliterated" conviene revisar las condiciones de la cadena de modelos base y las políticas de los proveedores de despliegue.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin validación por parte de la comunidad.
- Falta de documentación: no hay datos de benchmarks, composición del dataset, número de tokens de entrenamiento ni mediciones de latencia.
- Al ser un modelo "uncensored" por herencia de su base abliterated, no incluye mecanismos de rechazo fiables; requiere filtros externos si se expone a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stupidlime/Mochi-1.5-Kiri
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Perfil del autor del base: https://huggingface.co/huihui-ai
- Qwen2.5-0.5B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Unsloth (herramienta de fine-tuning empleada): https://github.com/unslothai/unsloth
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron únicamente páginas sin relación (foros en chino sobre videojuegos, finanzas y fitness), por lo que no se aporta ningún enlace adicional.
