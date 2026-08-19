# stage-babylm/llama-128-4L

## Resumen

El modelo `stage-babylm/llama-128-4L` es un pequeño modelo de lenguaje generativo publicado por el usuario `stage-babylm` en Hugging Face, probablemente vinculado a la competición BabyLM, que investiga el aprendizaje del lenguaje con cantidades reducidas de datos. Con apenas 1.043.328 parámetros (algo más de un millón), se trata de un modelo extremadamente compacto, orientado a experimentación académica y no a uso productivo. El nombre sugiere una arquitectura tipo Llama con dimensión de embedding de 128 y 4 capas, aunque no hay confirmación oficial en la documentación. Fue creado en agosto de 2026 y su repositorio ocupa 0,6 GB, incluyendo pesos en formato `safetensors`. Su relevancia radica en servir como banco de pruebas para estudiar la eficiencia de modelos mínimos en tareas de generación de texto, dentro del ecosistema BabyLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Llama, sin confirmar) |
| Parametros totales | 1.043.328 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. El nombre `llama-128-4L` sugiere una arquitectura similar a Llama con un tamaño de embedding de 128 y 4 capas transformer, pero no hay confirmación en la model card ni en los metadatos. Se sabe que es un fine-tune de un modelo base no especificado (el enlace al modelo original aparece vacío). El entrenamiento se realizó con `learning_rate` de 0.0018, `batch_size` de 32, optimizador AdamW (fused) con betas (0.9, 0.95), scheduler coseno con warmup del 5% y una sola época. La loss de validación final fue de 2.0440, con una loss de entrenamiento de 2.0116. No se mencionan técnicas como RLHF, DPO ni otros refinamientos posteriores.

## Capacidades

- Generación de texto básica: el modelo es capaz de producir texto autocompletado, pero su tamaño limitado restringe severamente la coherencia y el conocimiento.
- Sin soporte documentado para tool calling, function calling o razonamiento multi-paso.
- No se indica soporte multilingüe ni capacidades multimodales.
- No hay evidencia de modo de pensamiento extendido (thinking mode).
- El modelo solo puede manejar tareas muy simples y cortas, adecuadas para estudios de scaling laws o análisis de comportamiento en entornos controlados.

## Casos de uso

- Investigación académica sobre modelos de lenguaje mínimos: se puede utilizar para estudiar cómo varía la capacidad de generación con tan pocos parámetros, comparando con otros tamaños en la familia BabyLM.
- Pruebas de infraestructura de entrenamiento: al ser diminuto, sirve para validar pipelines de fine-tuning, evaluación y despliegue sin coste computacional significativo.
- Educación en aprendizaje automático: como ejemplo práctico de un modelo transformer entrenado desde cero, útil en cursos que expliquen el funcionamiento interno de los LLM.
- Benchmark de eficiencia: permite medir el rendimiento de frameworks de inferencia (vLLM, llama.cpp, etc.) en condiciones extremas de baja carga.
- Experimentos de interpretabilidad: al tener solo 1M de parámetros, es factible analizar sus representaciones internas o mecanismos de atención con herramientas que serían inviables en modelos grandes.
- Generación de datos sintéticos para entrenar modelos más grandes: aunque limitado, puede producir texto de baja calidad que sirva como datos de aumento en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la loss de validación (2.0440) y la loss de entrenamiento (2.0116) al final del entrenamiento. El `model-index` aparece vacío, sin resultados de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB, incluso en FP32. El modelo cabe holgadamente en cualquier GPU moderna y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2060, etc.). No requiere hardware especializado.
- Es perfectamente ejecutable en CPU con memoria RAM estándar (menos de 1 GB para los pesos).
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama y TGI (según las etiquetas de Hugging Face). Al ser tan pequeño, la latencia es mínima y el throughput puede ser muy alto, aunque no hay cifras oficiales.
- Se puede ejecutar incluso en dispositivos embebidos o Raspberry Pi, aunque no hay documentación que lo confirme explícitamente.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros modelos de tamaño comparable (por ejemplo, otros modelos BabyLM) que permitan una comparación directa en términos de parámetros, contexto o rendimiento. El modelo hermano `llama-128-2L` existe en el mismo repositorio, pero no se ofrecen datos de evaluación comparativa.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: con solo 1M de parámetros, el modelo tiene una capacidad lingüística muy limitada. No es apto para tareas de producción ni para generar texto coherente más allá de unas pocas frases.
- Sesgos y alucinaciones: al estar entrenado sobre un dataset desconocido y con una sola época, es probable que presente sesgos no documentados y una alta tasa de alucinaciones.
- Sin información sobre licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial o incluso académico sin permisos explícitos.
- Contexto limitado: no se especifica la longitud de contexto, pero dado el tamaño, probablemente sea muy corta (típicamente 128 o 256 tokens en modelos de este tipo).
- Datos de entrenamiento desconocidos: la model card indica "unknown dataset", lo que impide evaluar posibles problemas de privacidad o derechos de autor.
- No se proporcionan garantías de soporte ni mantenimiento: el modelo parece generado automáticamente por un pipeline de entrenamiento, sin documentación adicional.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/stage-babylm/llama-128-4L)
- [Modelo hermano llama-128-2L](https://huggingface.co/stage-babylm/llama-128-2L)
- [Sitio oficial de BabyLM](https://babylm.github.io/)
- [Página de FriendliAI con información de inferencia](https://friendli.ai/models/stage-babylm/llama-128-4L)
