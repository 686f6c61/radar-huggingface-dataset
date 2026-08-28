# tshaik1990/qwen3.5-2b-prompt-compiler

## Resumen

El modelo `tshaik1990/qwen3.5-2b-prompt-compiler` es un adaptador LoRA de bajo rango (rank 16, alpha 32) entrenado sobre el modelo base `unsloth/Qwen3.5-2B`, una versión optimizada del Qwen3.5-2B de Alibaba Cloud. Su función no es responder directamente a la petición del usuario, sino transformar una solicitud breve y poco especificada en un prompt estructurado, claro y listo para ser ejecutado por otro modelo o pipeline downstream. Es decir, actúa como un compilador de prompts: toma una entrada tersa y emite una especificación de prompt con instrucciones detalladas, incluyendo peticiones explícitas de contexto faltante cuando es necesario.

El adaptador fue desarrollado por el usuario `tshaik1990` y publicado en Hugging Face en agosto de 2026. Está entrenado con un solo epoch sobre un dataset propio de pares (solicitud original → prompt compilado), con 50 pasos de entrenamiento en una GPU Tesla T4. El repositorio pesa 0.1 GB y contiene únicamente los pesos del adaptador en formato safetensors, junto con un archivo de configuración de PEFT. Existe además una versión cuantizada en GGUF para su uso con Ollama o llama.cpp, publicada en un repositorio separado.

La relevancia de este modelo radica en su utilidad práctica para flujos de ingeniería de prompts: permite estandarizar y enriquecer peticiones de usuario antes de pasarlas a modelos más grandes o a sistemas de agentes, reduciendo la ambigüedad y evitando que el modelo final invente requisitos no especificados. Al ser un adaptador LoRA de solo 2B parámetros base, es ligero y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-2B) con adaptador LoRA (rank 16, alpha 32) sobre proyecciones de atención y MLP (`q/k/v/o_proj`, `gate/up/down_proj`) |
| Parametros totales | No disponible (el adaptador pesa ~0.1 GB; el modelo base tiene 2B parámetros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentación del adaptador) |
| Tipos de cuantizacion | safetensors (adaptador LoRA); GGUF disponible en `tshaik1990/qwen3.5-2b-prompt-compiler-GGUF` |
| Idiomas soportados | No disponible (los ejemplos y la evaluación están en inglés; no se declara soporte multilingüe) |
| Licencia | Hereda la del modelo base `unsloth/Qwen3.5-2B` (no se especifica cuál es en la información disponible) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer densa de Qwen3.5-2B, un modelo de 2 mil millones de parámetros de la serie Qwen3.5 de Alibaba Cloud, optimizado por Unsloth para entrenamiento e inferencia eficiente. El adaptador LoRA se aplica a las proyecciones de atención (`q/k/v/o_proj`) y a las proyecciones del MLP (`gate/up/down_proj`), con rango 16 y alpha 32. Esta configuración es estándar para fine-tuning de bajo rango y permite modificar el comportamiento del modelo sin cambiar los pesos originales.

El entrenamiento se realizó con un solo epoch sobre un dataset propio de pares (solicitud original → prompt compilado), con 50 pasos de optimización. Se utilizó el framework Unsloth (versión 2026.8.22) junto con Transformers 5.2.0, TRL 0.22.2, PEFT 0.20.0 y PyTorch 2.8.0, en una GPU Tesla T4. No se menciona el uso de RLHF ni DPO; el método es supervisado (SFT). La innovación principal no está en la arquitectura, sino en el objetivo de entrenamiento: el modelo aprende a emitir un prompt estructurado en lugar de responder a la petición, y a incluir cláusulas explícitas de "pide X si falta" para elicitar contexto en lugar de inventar datos.

## Capacidades

- Generación de prompts estructurados: convierte una solicitud breve y ambigua en un prompt detallado, con roles, pasos y criterios de evaluación.
- Elicitación de contexto faltante: el modelo está entrenado para pedir información adicional (ubicación, presupuesto, plazo, etc.) cuando la solicitud original no la incluye, en lugar de asumirla.
- Compacidad y claridad: según la evaluación del autor, produce salidas ~2.8 veces más cortas que el modelo base (1002 caracteres de media frente a 2775) y elimina la meta-comentario del tipo "Aquí tienes un prompt para...".
- Asignación de roles: en el 85% de las salidas evaluadas, el prompt compilado comienza con una asignación de rol ("Eres un experto en...").
- No inventa requisitos: el modelo evita añadir hechos, precios o condiciones que no estaban en la solicitud original.
- Integración con pipelines: al ser un adaptador PEFT, se puede cargar fácilmente con `PeftModel` y usar como paso previo a un modelo más potente.

## Casos de uso

- Preprocesamiento de prompts en aplicaciones de chat: antes de enviar la petición del usuario a un modelo grande (por ejemplo, GPT-4 o Qwen3.5-72B), se puede usar este adaptador para expandir la solicitud en un prompt estructurado, reduciendo la ambigüedad y mejorando la calidad de la respuesta final.
- Generación de prompts para agentes autónomos: en flujos de agentes multi-paso, el adaptador puede convertir una orden vaga ("organiza mi viaje") en un prompt con pasos claros, petición de datos faltantes y criterios de éxito, facilitando la planificación del agente.
- Normalización de entradas en pipelines de automatización: empresas que reciben solicitudes de clientes por texto libre pueden usar este modelo para estandarizar las peticiones antes de pasarlas a un sistema de tickets o a un modelo de clasificación.
- Mejora de prompts para generación de código: dado un requerimiento escueto ("haz una función que ordene una lista"), el adaptador genera un prompt con especificaciones de entrada, salida, casos límite y restricciones, útil para modelos de código.
- Asistente de ingeniería de prompts para desarrolladores: los desarrolladores pueden usar el adaptador como herramienta de línea de comandos o API para iterar sobre sus prompts, obteniendo versiones más completas y accionables.
- Evaluación de seguridad en agentes: el adaptador está entrenado para incluir cláusulas de seguridad en prompts que involucran acciones destructivas o tool-use, lo que puede servir como capa de protección en sistemas de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación propia sobre un conjunto de 20 prompts de prueba, comparando el adaptador con el modelo base bajo condiciones de muestreo idénticas (temperatura 0.2, top_p 0.95, top_k 20, mismo system prompt). Los resultados son los siguientes:

| Metrica | Modelo base | Adaptador |
|---|---|---|
| Longitud media de salida | 2775 caracteres | 1002 caracteres |
| Fugas de meta-comentario ("Aquí tienes un prompt para...") | 55% | 0% |
| Apertura con asignación de rol ("Eres un experto...") | 0% | 85% |
| Salida con cláusula explícita "pide X si falta" | 0% | 70% |

El adaptador produce salidas más cortas en 18 de los 20 prompts de prueba (media ~2.8 veces más compacto). El autor indica que esta evaluación es autogenerada y no ha sido revisada por terceros ni sometida a preferencia humana formal.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo de 2B parámetros, la carga en memoria es ligera. El adaptador añade ~0.1 GB a los pesos del modelo base. Con cuantización del base (por ejemplo, 4 bits), la VRAM necesaria puede rondar los 2-4 GB, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16. El entrenamiento se realizó en una Tesla T4 (16 GB), por lo que esa GPU es más que suficiente para inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs como RTX 3060, RTX 4060, RTX 4090, etc., siempre que se use el modelo base cuantizado o en FP16 con suficiente VRAM.
- Opciones de despliegue: se puede usar con Transformers + PEFT (carga directa del adaptador), o con la versión GGUF en Ollama o llama.cpp. También es compatible con vLLM si se fusiona el adaptador con el base.
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 2B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicamente entrenados para compilar prompts. La comparación más relevante es con el modelo base `unsloth/Qwen3.5-2B` sin el adaptador, que responde directamente a la petición en lugar de generar un prompt estructurado. También se puede comparar con el Qwen3.5-2B original de Alibaba Cloud, aunque no se han publicado diferencias de rendimiento en esta tarea.

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| `tshaik1990/qwen3.5-2b-prompt-compiler` | 2B (base) + LoRA | No disponible | Compilación de prompts | Hereda la del base (no especificada) |
| `unsloth/Qwen3.5-2B` | 2B | No disponible | Generación de texto general | No especificada |
| `Qwen/Qwen3.5-2B` | 2B | No disponible | Generación de texto general | No especificada |

No se dispone de comparativas con otros adaptadores de prompt engineering en el ecosistema open source.

## Limitaciones y advertencias

- Entrenamiento limitado: un solo epoch sobre un dataset pequeño autogenerado (50 pasos). No se ha evaluado contra benchmarks de terceros.
- Evaluación no independiente: los resultados de la tabla de rendimiento provienen de una evaluación autogenerada por el creador, sin revisión por pares ni preferencia humana formal.
- Generalización limitada: al ser un modelo de 2B parámetros, puede no generalizar bien a dominios de prompts muy alejados de la distribución de entrenamiento, como flujos de agentes multi-turno o entradas en idiomas distintos del inglés.
- Riesgo de alucinación: aunque el entrenamiento busca evitar inventar requisitos, no se garantiza que el modelo nunca alucine en dominios desconocidos.
- Licencia incierta: la licencia no está especificada en la ficha de Hugging Face; la model card indica que hereda la del modelo base, pero no se indica cuál es. Esto puede suponer un riesgo para uso comercial si la licencia del base es restrictiva.
- Sin soporte de tool calling ni funciones especiales: el adaptador solo realiza la tarea de compilación de prompts; no añade capacidades de llamada a herramientas, visión ni audio.
- Dependencia del modelo base: el comportamiento final depende de la calidad y configuración de `unsloth/Qwen3.5-2B`, que no está documentada en detalle.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tshaik1990/qwen3.5-2b-prompt-compiler
- Versión GGUF: https://huggingface.co/tshaik1990/qwen3.5-2b-prompt-compiler-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-2B
- Guía de ejecución local de Qwen 3.5: https://www.datacamp.com/tutorial/run-qwen-3-5-locally
- Modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_5_2b
- Repositorio de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_5_2b
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
