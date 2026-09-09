# TakkyTiggerTTT/scratch-ai-17m-200m

## Resumen

El modelo `TakkyTiggerTTT/scratch-ai-17m-200m` es un modelo de lenguaje de pequeño tamaño subido a Hugging Face por el usuario TakkyTiggerTTT. Según los metadatos disponibles, se apoya en la arquitectura GPT-2 y está diseñado para la generación de texto, con un total de 16.988.160 parámetros (~17 M) y pesos distribuidos en formato `safetensors`. El repositorio ocupa 0.1 GB.

La model card publicada es una plantilla generada automáticamente, y no incluye información sobre el desarrollador, los datos de entrenamiento, la licencia ni los idiomas soportados. No existe documentación técnica adicional ni se han publicado evaluaciones. Por ello, este modelo debe considerarse experimental y de referencia para prototipos o estudios académicos, no como una solución validada para entornos de producción.

Su relevancia es limitada en este momento: se trata de un modelo diminuto, sin contexto documentado y sin benchmarks. Su principal interés podría radicar en la experimentación con arquitecturas GPT-2 en tamaños mínimos, o en la prueba de pipelines de inferencia local en hardware muy modesto.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (según metadatos) |
| Parámetros totales | 16.988.160 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (sin datos de entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en GPT-2, tal como refleja el tag `gpt2` en Hugging Face. Utiliza una arquitectura clásica de autoregresión para predicción del siguiente token. No se dispone de información sobre el número de capas, dimensiones de hidden state, cabezas de atención ni otros hiperparámetros.

Respecto al entrenamiento, la model card no aporta ningún dato: no se especifica el conjunto de datos, el número de tokens de entrenamiento, la estrategia de optimización ni si se aplicaron técnicas como RLHF o DPO. El tag `arxiv:1910.09700` presente en los metadatos corresponde al artículo "Quantifying the Carbon Emissions of Machine Learning" (Lacoste et al.), que aparece citado en la plantilla por defecto; no se debe interpretar como un paper que presente el modelo.

No hay evidencia de innovaciones técnicas destacables; se trata de una implementación básica de GPT-2 sin características adicionales documentadas.

## Capacidades

Las capacidades del modelo no están documentadas de forma explícita. A partir de los metadatos, se puede inferir lo siguiente:

- Generación de texto: al ser un modelo de la familia GPT-2 y estar etiquetado con `text-generation`, puede producir continuaciones de texto a partir de un prompt, aunque no hay ejemplos públicos que demuestren su calidad.
- Tool calling / function calling: no documentado. No se dispone de evidencia de soporte para herramientas o llamadas a funciones.
- Soporte de agentes y razonamiento multi-paso: no documentado. Un modelo de 17 M de parámetros, sin indicios de fine-tuning específico, no parece diseñado para tareas de agente complejas.
- Capacidades multilingües: no documentado. No se han publicado los idiomas de entrenamiento, por lo que no se puede confirmar soporte para español u otros idiomas.
- Modos especiales (visión, audio, thinking mode): no documentados. Los metadatos indican únicamente texto.

## Casos de uso

Dado el reducido tamaño del modelo y la ausencia de documentación, estos casos de uso son hipótesis razonables, no aplicaciones validadas:

- Docencia en procesamiento de lenguaje natural: el modelo es lo bastante pequeño para entrenar desde cero en un aula, permitiendo estudiar el comportamiento de un GPT-2 mínimo sin necesidad de infraestructura GPU costosa.
- Experimentos de interpretabilidad: con solo 17 M de parámetros, los investigadores pueden analizar patrones de atención o comportamientos de capas concretas en un modelo completo.
- Prototipado de aplicaciones de autocompletado: se puede cargar en cualquier equipo local para probar flujos de texto predictivo, por ejemplo en editores simples o sistemas de sugerencia de escritura.
- Fine-tuning en tareas de clasificación de texto: su tamaño lo hace adecuado para ajustes en datasets pequeños, como análisis de sentimiento o detección de spam, con las limitaciones propias de un modelo diminuto.
- Investigación sobre cuantización y eficiencia: sirve como banco de pruebas para comparar técnicas de compresión, como conversiones a INT8 o GGUF, con un coste computacional ínfimo.
- Educación en despliegue de modelos: útil para enseñar cómo servir un modelo con `transformers`, `llama.cpp` u otras herramientas, ya que puede ejecutarse en CPU sin problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ninguna evaluación de MMLU, HumanEval, GSM8K ni similares. Tampoco se han publicado métricas de calidad de texto, perplejidad o exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16.988.160 parámetros, los pesos ocupan aproximadamente 68 MB en FP32, 34 MB en FP16/BF16 y 17 MB en INT8. Con la sobrecarga del framework, en la práctica caben con facilidad en cualquier GPU con más de 500 MB de VRAM.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, 4070, etc.) o incluso una GPU integrada. No requiere A100 ni H100.
- Soporte en CPU: el modelo puede ejecutarse en CPU sin problema, ya que su tamaño es minúsculo. Es apto para portátiles o servidores sin aceleración.
- Opciones de despliegue: al ser un modelo de Hugging Face con librería `transformers`, puede cargarse directamente con `AutoModelForCausalLM`. También podría convertirse a GGUF y servirse con `llama.cpp` u `Ollama`, aunque no hay una conversión oficial publicada. No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre otros modelos de la misma categoría (GPT-2 con ~17 M de parámetros) ni de datos de referencia que permitan establecer una comparación fiable.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada, por lo que no se ha evaluado el modelo en términos de sesgos, seguridad o robustez.
- No se conoce la licencia. Esto puede impedir su uso comercial, dependiendo de la normativa aplicable y de la procedencia de los pesos.
- No se han documentado los datos de entrenamiento. Existe riesgo de que el modelo no haya sido entrenado con datos filtrados o curados, lo que puede acrecentar la probabilidad de texto dañino o sesgado.
- Al ser un modelo de 17 M de parámetros, su capacidad de razonamiento, coherencia y conocimiento factual es muy limitada y puede producir alucinaciones frecuentes, especialmente en consultas complejas.
- No hay confirmación de soporte para español ni para otros idiomas; puede comportarse de forma imprevisible fuera del idioma de entrenamiento (que se desconoce).
- Para entornos de producción, este modelo no está recomendado como solución principal, ya que carece de certificación, benchmarks y documentación de mantenimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/TakkyTiggerTTT/scratch-ai-17m-200m
- Referencia citada en la model card (paper sobre impacto ambiental, no del modelo): https://arxiv.org/abs/1910.09700
