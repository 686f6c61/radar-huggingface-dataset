# yxmm/gpt-oss-safeguard-20b

## Resumen
gpt-oss-safeguard-20b es un modelo de razonamiento de seguridad derivado de openai/gpt-oss-20b mediante fine-tuning. Lo publica el usuario yxmm en Hugging Face como adaptación del modelo original de OpenAI, y está diseñado específicamente para clasificar contenido textual según políticas de seguridad que el propio usuario proporciona, además de ejecutar tareas fundamentales de moderación y etiquetado. Su relevancia radica en que permite a equipos de Trust and Safety desplegar un clasificador de políticas configurable sin depender de APIs cerradas ni de ingeniería ad hoc por caso de uso.

Arquitectónicamente hereda la estructura Mixture-of-Experts de gpt-oss-20b: 20.914.757.184 parámetros totales con 3,6 mil millones activos por token, lo que permite ejecutarlo en GPUs con 16 GB de VRAM según la model card del modelo original. Se distribuye en safetensors con cuantización MXFP4 de 8 bits y un tamaño de repositorio de 13,8 GB.

El modelo está entrenado sobre el formato de respuesta harmony de OpenAI y, según la documentación del autor, solo funciona correctamente si se usa con dicho formato. Está pensado exclusivamente para casos de uso de seguridad; para aplicaciones generales la propia documentación recomienda los modelos gpt-oss base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (gpt_oss), derivada de openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | 3,6 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 de 8 bits (pesos publicados); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de openai/gpt-oss-20b, un transformer con capas Mixture-of-Experts en el que solo se activan 3,6 B de parámetros por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño total. El fine-tuning lo convierte en un modelo de razonamiento de seguridad orientado a interpretar políticas escritas por el usuario y emitir decisiones clasificatorias con traza de razonamiento accesible. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO en esta adaptación concreta.

La innovación principal es el uso del formato harmony como protocolo de conversación obligatorio: el modelo está entrenado con esa estructura de mensajes y roles, y la documentación advierte que no funcionará correctamente fuera de ella. Además, expone el razonamiento intermedio (raw CoT) para facilitar la depuración de decisiones y permite configurar el esfuerzo de razonamiento en tres niveles (low, medium, high), lo que da control directo sobre la latencia en producción.

## Capacidades
- Clasificación de contenido textual según una política de seguridad proporcionada por el usuario en el prompt.
- Etiquetado de contenido online en tiempo real y etiquetado offline para flujos de Trust and Safety.
- Filtrado de entradas y salidas de otros LLM (input-output filtering).
- Razonamiento de seguridad explícito: genera una cadena de razonamiento que justifica la decisión de política, accesible para depuración.
- Esfuerzo de razonamiento configurable (low, medium, high) para ajustar precisión frente a latencia.
- Generalización entre productos y casos de uso a partir de la política escrita, sin reentrenamiento por escenario.
- Compatibilidad con vLLM y con el ecosistema transformers; endpoints compatibles según los tags del repo.
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso
- Moderación de comentarios en plataformas sociales: se define una política de contenido permitido y el modelo clasifica cada comentario con una justificación trazable, lo que facilita auditar decisiones ante reclamaciones de usuarios.
- Filtrado de salidas de un LLM en producción: se intercala el modelo como guardarraíl que evalúa la respuesta generada por otro modelo contra la política de la organización antes de mostrarla al usuario final.
- Etiquetado offline de grandes corpus: se procesan lotes de textos históricos para construir datasets etiquetados por categoría de seguridad, aprovechando el modo de razonamiento alto para maximizar consistencia.
- Cumplimiento normativo y revisión de contenido en marketplaces: se codifican las reglas de listado (productos prohibidos, claims engañosos) como política y el modelo clasifica anuncios nuevos de forma automática.
- Triaje en equipos de Trust and Safety: el modelo prioriza la cola de revisión humana marcando casos de alta severidad con razonamiento explícito, reduciendo el volumen que llega a revisores.
- Investigación en seguridad de IA: el acceso al raw CoT y al esfuerzo de razonamiento configurable permite estudiar cómo varía la calibración de las decisiones según la política y el nivel de razonamiento.
- Despliegue en infraestructura propia con 16 GB de VRAM: organizaciones que no pueden enviar datos sensibles a APIs externas pueden ejecutar el modelo en una única GPU consumer o de gama media.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 16 GB según la model card del modelo base, gracias a la cuantización MXFP4 de 8 bits y a los 3,6 B de parámetros activos.
- GPU recomendadas: una GPU con 16 GB o más de VRAM; encaja en RTX 4090 (24 GB), RTX 4080 (16 GB), A100 y H100. No se detallan configuraciones multi-GPU.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB o superiores con la cuantización publicada.
- Opciones de despliegue: vLLM (etiquetado explícitamente en el repo), transformers; no se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El nivel de esfuerzo de razonamiento (low/medium/high) es el principal factor de control de latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| gpt-oss-safeguard-20b (este) | 20,9 B | 3,6 B | no disponible | Apache 2.0 | Razonamiento de seguridad con política del usuario |
| openai/gpt-oss-safeguard-120b | 117 B | 5,1 B | no disponible | Apache 2.0 | Misma tarea, mayor escala |
| openai/gpt-oss-20b | 20,9 B | 3,6 B | no disponible | Apache 2.0 | Propósito general; recomendado para usos no de seguridad |

## Limitaciones y advertencias
- Uso restringido por diseño: el modelo está entrenado para tareas de seguridad y la documentación recomienda los gpt-oss base para cualquier otra aplicación; usarlo como modelo general puede degradar resultados.
- Dependencia estricta del formato harmony: fuera de ese formato de respuesta el modelo no funciona correctamente, lo que obliga a adaptar los pipelines de inferencia.
- Exposición del raw CoT: la cadena de razonamiento está pensada para desarrolladores y profesionales de seguridad, no para usuarios finales; mostrarla en producción puede filtrar detalles internos de la política o del proceso de decisión.
- Riesgo de alucinación y de falsos positivos/negativos en la clasificación: no se han publicado métricas de precisión, recall ni calibración en la información disponible, por lo que la calidad depende de la política redactada y requiere validación propia.
- Idiomas soportados no documentados: no hay garantía de comportamiento equivalente fuera del inglés.
- Longitud de contexto no disponible: no se puede planificar el procesamiento de documentos largos sin verificarla empíricamente.
- Sesgos: no se documentan evaluaciones de sesgo para esta adaptación.
- Licencia Apache 2.0: permite uso comercial sin copyleft, pero persisten las obligaciones habituales de atribución y la responsabilidad sobre el uso de las clasificaciones recae en el integrador.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yxmm/gpt-oss-safeguard-20b
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Demo (Space): https://huggingface.co/spaces/openai/gpt-oss-safeguard-20b
- Guía de prompting: https://cookbook.openai.com/articles/gpt-oss-safeguard-guide
- Paper / model card (arXiv): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss-safeguard/
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio del proyecto gpt-oss-safeguard: https://github.com/openai/gpt-oss-safeguard
- Cookbooks de gpt-oss: https://cookbook.openai.com/topic/gpt-oss
- Colección gpt-oss-safeguard: https://huggingface.co/collections/openai/gpt-oss-safeguard
- Modelo hermano de mayor tamaño: https://huggingface.co/openai/gpt-oss-safeguard-120b
- ROOST Model Community: http://roost.tools/
- Repositorio ROOST de modelos abiertos: https://github.com/roostorg/open-models
