# vonjack/hrm-text-agent-gguf

## Resumen

El repositorio `vonjack/hrm-text-agent-gguf` contiene dos checkpoints especializados del modelo HRM-Text, un modelo de lenguaje de 1.18 mil millones de parámetros basado en la arquitectura HRM (hierarchical recurrent model). El autor, vonjack, ha empaquetado dos variantes: una orientada a generación de código (`Code`) y otra orientada a agentes con tool calling (`Agent v2`), ambas en formato GGUF con cuantizaciones F16 y Q8_0. El modelo base, desarrollado por el proyecto HRM-Text, destaca por su eficiencia de entrenamiento: requiere entre 130 y 600 veces menos cómputo y entre 150 y 900 veces menos datos que un transformer convencional, lo que permite preentrenar un modelo fundacional desde cero con un presupuesto de aproximadamente 1000 dólares.

La relevancia de este lanzamiento radica en que ofrece modelos pequeños (1B) con capacidades específicas de código y agente, empaquetados para su uso con llama.cpp y servidores compatibles con OpenAI. Cada checkpoint incorpora una plantilla Jinja embebida que define el formato de conversación y las condiciones de razonamiento (`synth,cot` para código, `direct` para agente). El modelo es un PrefixLM, lo que implica restricciones específicas de batching, y está diseñado para ejecutarse en hardware consumer, incluyendo Apple Silicon mediante Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM (hierarchical recurrent model) con mecanismo de recurrencia latente |
| Parametros totales | 1.182.795.264 (1.18B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0 (GGUF); safetensors F32 como fuente original |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16 y Q8_0); safetensors F32 (no incluidos en el repo) |

Nota: el repositorio contiene dos checkpoints independientes, cada uno con sus propios archivos GGUF. El tamaño total del repositorio es de 7.3 GB, que incluye los cuatro archivos GGUF (dos por modelo).

## Arquitectura y entrenamiento

HRM-Text se basa en una arquitectura recurrente jerárquica que combina una capa de recurrencia latente con atención sobre el historial comprimido. A diferencia de los transformers tradicionales, esta arquitectura mantiene un estado recurrente que se actualiza a lo largo de la secuencia, reduciendo drásticamente el coste de preentrenamiento e inferencia. El proyecto original (repositorios `kristobalus/hrm-text` y `sapientinc/HRM-Text`) proporciona un framework completo de preentrenamiento con PrefixLM sequence packing, kernels FlashAttention 3 y PyTorch FSDP2.

Los dos checkpoints incluidos en este repositorio son especializaciones del modelo base de 1B:

- **Code**: entrenado con condición `synth,cot` (sintético con chain-of-thought), orientado a generación de código. Según la model card, se validó que el modelo Q8_0 reproduce el comportamiento del checkpoint F32 en pruebas de generación greedy, aunque se detectó un defecto en la implementación de mergesort (función `merge` no definida).
- **Agent v2**: entrenado con una mezcla dedicada de ejemplos de function calling, utilizando la condición `direct`. El autor reporta resultados en el benchmark BFCL (function calling), aunque no se proporcionan cifras concretas en la documentación.

El modelo es un PrefixLM, lo que significa que el prompt inicial debe procesarse en un único batch físico (`--batch-size` y `--ubatch-size` deben ser al menos el número de tokens del prompt). No se permite la reutilización de caché KV entre prompts de distinta longitud ni decodificación especulativa multi-token con el parche proporcionado.

## Capacidades

- Generación de código Python y posiblemente otros lenguajes, con razonamiento encadenado condicionado por la plantilla `synth,cot`.
- Tool calling / function calling: el modelo Agent v2 emite llamadas a herramientas en formato JSON, como se demuestra en el ejemplo de calculadora y consulta meteorológica paralela.
- Consumo de resultados de herramientas y generación de respuestas finales correctas, incluyendo la capacidad de evitar llamadas a herramientas cuando la consulta es irrelevante.
- Soporte de agentes multi-paso con razonamiento simple, validado en el ejemplo de tool loop.
- Capacidad de razonamiento latente gracias a la arquitectura HRM, que comprime el historial en un estado recurrente.
- Compatibilidad con el protocolo OpenAI-compatible de llama-server para chat y completions.

## Casos de uso

- Asistente de programación integrado en un IDE: el modelo Code puede generar funciones y fragmentos de código bajo demanda, con la condición `synth,cot` para razonar antes de responder. Su tamaño reducido permite ejecutarlo localmente en estaciones de trabajo sin GPU dedicada.

- Generación de código en pipelines de CI/CD: gracias a su capacidad de generar código sintético y su bajo coste de inferencia, puede integrarse en flujos automatizados de generación de tests o documentación, siempre que se le proporcionen prompts completos y bien especificados.

- Agente conversacional con herramientas externas: el modelo Agent v2 puede actuar como un agente que consulta APIs (por ejemplo, del tiempo) o ejecuta calculadoras locales, parseando las llamadas JSON generadas. Su tamaño de 1B lo hace adecuado para despliegue en edge o entornos con recursos limitados.

- Automatización de tareas de oficina: con la capacidad de tool calling, puede orquestar acciones como envío de correos, consulta de calendarios o gestión de datos, siempre que se integre con un sistema de ejecución de herramientas.

- Prototipado rápido de aplicaciones de IA conversacional: al ser compatible con el servidor OpenAI de llama.cpp, se puede usar como backend local para desarrollo y pruebas de chatbots antes de migrar a modelos más grandes en producción.

- Educación e investigación en arquitecturas eficientes: el modelo sirve como ejemplo práctico de una arquitectura recurrente jerárquica, permitiendo a investigadores estudiar el comportamiento de modelos pequeños con entrenamiento eficiente en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que Agent v2 reporta resultados en BFCL (function calling) y que el modelo Code fue validado contra el checkpoint F32 en pruebas de generación greedy, pero no se proporcionan cifras numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF Q8_0 ocupan aproximadamente 1.26 GB (cada checkpoint), y los F16 2.37 GB. Para inferencia con contexto corto (512-1024 tokens), se requiere VRAM adicional para la caché KV y los buffers de computación. En la práctica, un modelo Q8_0 de 1.18B puede caber en GPUs con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) o en Apple Silicon con memoria unificada de 8 GB.
- GPUs recomendadas: se ha validado en Metal (Apple Silicon) con los 129/129 layers en GPU. Para CUDA, se puede compilar llama.cpp con opciones estándar; GPUs como RTX 3060, RTX 4060 o superiores son suficientes.
- Opciones de despliegue: llama.cpp (build parcheado), llama-server con endpoint OpenAI-compatible, o cualquier runtime que soporte GGUF y el parche `hrm_text`.
- Latencia y throughput estimados: no se proporcionan datos. Dado el tamaño del modelo y la arquitectura recurrente, se espera una latencia moderada en hardware consumer, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (por ejemplo, TinyLlama, Qwen1.5-1.8B o Phi-1.5). No se conocen datos de contexto, licencia ni rendimiento de estos modelos frente a HRM-Text en las tareas de código y agente. La única referencia es el proyecto HRM-Text original, que reporta eficiencia de entrenamiento, pero no benchmarks estandarizados.

## Limitaciones y advertencias

- El modelo Code presenta un defecto conocido en la generación de mergesort (función `merge` no definida), lo que indica que su rendimiento en código puede ser inconsistente en algoritmos complejos.
- Los dos checkpoints son expertos separados: fusionar sus pesos destruye las habilidades de uno u otro. Deben utilizarse por separado según la tarea.
- Al ser un PrefixLM, el prompt inicial debe caber en un único batch físico. No se admite reutilización de caché KV entre prompts de distinta longitud ni decodificación especulativa multi-token.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas. La licencia no está especificada, por lo que el uso comercial no está garantizado.
- El repositorio requiere un parche específico de llama.cpp (commit validado) para ejecutar el modelo; no funciona con builds estándar sin aplicar el parche.
- El modelo Agent v2 fue validado con un bucle de herramientas mínimo (calculadora y clima), pero su robustez en escenarios de producción con herramientas más complejas no está demostrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vonjack/hrm-text-agent-gguf
- Perfil del autor: https://huggingface.co/vonjack
- Repositorio GitHub del proyecto HRM-Text (kristobalus): https://github.com/kristobalus/hrm-text
- Repositorio GitHub del proyecto HRM-Text (sapientinc): https://github.com/sapientinc/HRM-Text
- Otro repositorio GGUF de HRM-Text: https://huggingface.co/PurelyUnfunctionalAI/HRM-Text1-GGUF
- Sitio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
