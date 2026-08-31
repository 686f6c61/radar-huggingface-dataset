# thanhtan2136/test-DuoGuard-1.5B-transfer

## Resumen

DuoGuard-1.5B-transfer es un clasificador de seguridad de contenido (guardrail) basado en el modelo base Qwen2.5-1.5B, desarrollado por el equipo de DuoGuard (Yihe Deng, Yu Yang, Junkai Zhang, Wei Wang y Bo Li). Su objetivo es la moderación de contenido en texto mediante clasificación multi-etiqueta en 12 subcategorías de riesgo, como crímenes violentos, odio, contenido sexual o jailbreak prompts. Cada pasada hacia adelante produce un vector de 12 logits que, tras aplicar una sigmoide, da una distribución de probabilidad por categoría, permitiendo detección fina de contenido no seguro.

El modelo se presenta como una versión "transfer" de DuoGuard-0.5B: se reutilizan los datos de entrenamiento de la versión pequeña para fine-tunear Qwen2.5-1.5B, obteniendo así un clasificador con mayor capacidad y cobertura multilingüe heredada del modelo base. Está especializado principalmente en inglés, francés, alemán y español, aunque conserva el soporte de otros idiomas del modelo Qwen2.5. Con 1.543.732.736 parámetros y licencia Apache-2.0, es una opción ligera y abierta para integrar moderación de contenido en aplicaciones de IA.

Su relevancia actual radica en la creciente necesidad de salvaguardas eficientes para LLMs, especialmente en entornos productivos donde se requiere filtrar entradas y salidas de forma rápida y con bajo coste computacional. El paper asociado reporta mejoras de casi un 10% sobre LlamaGuard3-8B en benchmarks ingleses, con una inferencia 4,5 veces más rápida, aunque esos datos corresponden a la versión 0.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B) con cabeza de clasificacion de secuencia |
| Parametros totales | 1.543.732.736 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | No especificados (pesos en safetensors, cuantizables a FP16, INT8, etc.) |
| Idiomas soportados | Especializado en ingles, frances, aleman y espanol; hereda cobertura multilingue de Qwen2.5 (mas de 29 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar, y se le añade una cabeza de clasificación de secuencia que produce 12 logits. No se trata de un modelo generativo: su salida es un vector de clasificación multi-etiqueta. El entrenamiento se realiza mediante fine-tuning con los datos sintéticos generados por el framework DuoGuard, que emplea un esquema de aprendizaje por refuerzo de dos jugadores: un generador y un guardrail evolucionan conjuntamente para producir datos de seguridad multilingües de alta calidad. Según el README, se reutilizan directamente los datos de entrenamiento de DuoGuard-0.5B para entrenar esta versión sobre Qwen2.5-1.5B.

No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO en esta versión concreta. El paper original (arXiv:2502.05163) describe el framework general, pero los resultados reportados corresponden a DuoGuard-0.5B, no a esta variante de 1.5B.

## Capacidades

- Clasificación de seguridad de contenido en 12 subcategorías: crímenes violentos, crímenes no violentos, crímenes sexuales, explotación sexual infantil, consejo especializado, privacidad, propiedad intelectual, armas indiscriminadas, odio, suicidio y autolesión, contenido sexual y jailbreak prompts.
- Salida multi-etiqueta: cada categoría recibe una probabilidad independiente mediante sigmoide, permitiendo detección simultánea de múltiples riesgos.
- Clasificación binaria simplificada: se puede obtener una etiqueta "seguro"/"no seguro" comparando la probabilidad máxima entre las 12 categorías con un umbral (por defecto 0,5).
- Soporte multilingüe: entrenado principalmente en inglés, francés, alemán y español, con cobertura adicional heredada de Qwen2.5.
- No es un modelo generativo: no genera texto, solo clasifica secuencias de entrada.
- No soporta tool calling ni razonamiento multi-paso; su función es exclusivamente de moderación.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede analizar comentarios, publicaciones o mensajes en tiempo real para detectar odio, violencia o contenido sexual, aplicando políticas de la comunidad de forma automática.
- Filtrado de prompts para LLMs en producción: antes de enviar una consulta a un modelo generativo, se puede usar DuoGuard para bloquear intentos de jailbreak o solicitudes de contenido peligroso, reduciendo riesgos de salidas dañinas.
- Cumplimiento normativo en servicios de IA: integración en pipelines de auditoría para garantizar que las respuestas de un asistente no contengan categorías prohibidas (por ejemplo, consejo médico especializado o armas).
- Clasificación de documentos legales o corporativos: detección de información sensible (privacidad, propiedad intelectual) en grandes volúmenes de texto antes de su publicación o compartición.
- Sistemas de atención al cliente: análisis de conversaciones para identificar abuso, lenguaje ofensivo o solicitudes de autolesión, permitiendo derivar a personal humano o activar protocolos de seguridad.
- Evaluación de datasets de entrenamiento: uso como filtro previo para limpiar corpus de texto que alimentarán otros modelos, eliminando contenido no seguro o sesgado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión (DuoGuard-1.5B-transfer) en la información disponible. El paper asociado reporta mejoras de casi un 10% sobre LlamaGuard3-8B en benchmarks ingleses y una inferencia 4,5 veces más rápida, pero esos datos corresponden a DuoGuard-0.5B, no a esta variante. No se dispone de cifras de MMLU, HumanEval, GSM8K u otros estándares para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.543 millones de parámetros, en FP16 ocupa aproximadamente 3,1 GB; en INT8 baja a unos 1,6 GB; en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M) puede rondar 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para despliegue concurrente se recomienda una GPU con más memoria, como RTX 3090 o A10.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja con cuantización.
- Opciones de despliegue: se puede cargar con Transformers (PyTorch) usando `AutoModelForSequenceClassification`, o servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño (1.5B), en una GPU moderna se esperan latencias de decenas de milisegundos por secuencia corta (menos de 512 tokens) y throughput de cientos de peticiones por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DuoGuard-1.5B-transfer | 1,54B | No disponible | Apache-2.0 | Clasificador multi-etiqueta de seguridad |
| LlamaGuard3-8B | 8B | 128K (aprox.) | Llama 3 Community License | Clasificador de seguridad con 13 categorías |
| ShieldGemma (2B) | 2B | 8K | Gemma License | Clasificador de seguridad basado en Gemma |

No se dispone de comparativas de rendimiento directas entre estos modelos para esta versión concreta. El paper de DuoGuard reporta que DuoGuard-0.5B supera a LlamaGuard3-8B en benchmarks ingleses, pero no hay datos para la variante 1.5B-transfer.

## Limitaciones y advertencias

- Especialización idiomática limitada: aunque hereda cobertura multilingüe de Qwen2.5, el fine-tuning se centra en inglés, francés, alemán y español; el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinación en clasificación: como todo modelo basado en LLM, puede producir falsos positivos o negativos, especialmente en entradas ambiguas o con matices culturales.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto; solo emite probabilidades por categoría.
- Dependencia del umbral: la clasificación binaria safe/unsafe depende del umbral elegido (0,5 por defecto), que puede requerir ajuste según el caso de uso.
- Sesgos potenciales: los datos de entrenamiento pueden contener sesgos socioculturales que afecten la detección de ciertos tipos de contenido en grupos minoritarios.
- Sin garantías de producción: al ser una versión de prueba (el repo se llama "test-DuoGuard-1.5B-transfer"), no hay evidencia de validación exhaustiva en entornos reales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhtan2136/test-DuoGuard-1.5B-transfer
- Modelo oficial (DuoGuard/DuoGuard-1.5B-transfer): https://huggingface.co/DuoGuard/DuoGuard-1.5B-transfer
- Paper arXiv: https://arxiv.org/abs/2502.05163
- Repositorio GitHub: https://github.com/yihedeng9/DuoGuard
