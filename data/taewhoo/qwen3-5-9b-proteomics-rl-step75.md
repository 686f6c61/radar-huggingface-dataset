# Taewhoo/qwen3.5-9b-proteomics-rl-step75

## Resumen

El modelo Taewhoo/qwen3.5-9b-proteomics-rl-step75 es un checkpoint de aprendizaje por refuerzo (RL) derivado del modelo base Qwen/Qwen3.5-9B, publicado por el usuario Taewhoo. Forma parte de una serie de entrenamiento orientada a la creación de un "co-scientist" en proteómica, con una secuencia de pasos que va desde un ajuste supervisado (sft) hasta checkpoints de RL en los steps 25, 75 y 100. Este modelo corresponde al step 75 y presenta un tamaño de 9.653.104.368 parámetros, con pesos en formato safetensors y un tamaño de repositorio de 19.3 GB. La información pública es muy limitada: no se especifica licencia, idiomas ni benchmarks externos; la única métrica conocida es un "Internal eval100 score" de 0.25 en este checkpoint. Su relevancia radica en ser un modelo especializado en un dominio científico mediante RL, aunque su rendimiento real no ha sido validado externamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B, un modelo de lenguaje de gran tamaño del que no se han proporcionado detalles arquitectónicos en la información disponible. La serie de entrenamiento descrita en la model card indica que el modelo ha pasado por una fase de ajuste supervisado (sft) y posteriormente por aprendizaje por refuerzo (RL), con checkpoints en los steps 25, 75 y 100. Este checkpoint concreto es el step 75. No se han publicado datos sobre el conjunto de datos de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas destacables en la información disponible.

## Capacidades

- Generación de texto especializado en proteómica: según el nombre del modelo, está orientado a tareas de biología computacional y proteómica, pero no hay evidencia pública de su comportamiento.
- Razonamiento: no se han documentado capacidades específicas; al ser un checkpoint RL intermedio, su rendimiento puede ser inferior al de modelos finales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Los siguientes casos son potenciales según la naturaleza del modelo, pero no han sido verificados ni documentados públicamente:

- Análisis de secuencias de proteínas en investigación: el modelo podría emplearse para generar o anotar secuencias proteicas, aunque no hay benchmarks publicados que respalden su calidad.
- Asistencia en diseño de experimentos de proteómica: como asistente de laboratorio, podría sugerir protocolos o interpretar resultados, pero su fiabilidad no está documentada.
- Descubrimiento de fármacos asistido por IA: en un pipeline de co-scientist, podría integrarse para generar hipótesis sobre interacciones proteína-ligando; requiere validación experimental.
- Generación de informes científicos: podría redactar resúmenes de literatura sobre proteómica, siempre que se verifiquen las citas.
- Anotación funcional de proteínas: podría ayudar a predecir funciones a partir de secuencias, sin garantías de precisión.
- Educación en biología computacional: como modelo de demostración para enseñar conceptos de proteómica, aunque no se ha evaluado su exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es un "Internal eval100 score" de 0.25 en el step 75, que es una métrica interna del autor y no se puede comparar con benchmarks estándar como MMLU o HumanEval. El checkpoint hermano step100 reporta un score de 0.39, lo que sugiere una mejora a lo largo de la serie, pero no hay datos externos que validen estos valores.

## Requisitos de hardware

- El modelo tiene 9.653.104.368 parámetros. En precisión FP16/bfloat16, los pesos ocupan aproximadamente 19.3 GB, lo que coincide con el tamaño del repositorio. Para inferencia sin cuantizar se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090), aunque el overhead de activaciones y KV-cache puede requerir más.
- Con cuantización 4-bit (por ejemplo, GGUF Q4_K_M), el modelo podría reducirse a aproximadamente 6-8 GB y ejecutarse en GPUs de 12 GB o menos, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40GB o H100 80GB para despliegue en producción con precisión completa; RTX 4090 para pruebas locales con cuantización.
- Opciones de despliegue: Transformers (con safetensors), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se publica un GGUF). No se ha verificado la compatibilidad con estos frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Eval100 score | Licencia |
|---|---|---|---|---|
| Taewhoo/qwen3.5-9b-proteomics-rl-step75 | 9.653.104.368 | No disponible | 0.25 (interno) | No disponible |
| Taewhoo/qwen3.5-9b-proteomics-rl-step100 | 9.653.104.368 | No disponible | 0.39 (interno) | No disponible |
| Qwen/Qwen3.5-9B (base) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL (step 75), no un modelo final; el rendimiento puede ser inestable o inferior al de versiones posteriores.
- No se especifica licencia. Esto impide conocer si el modelo puede usarse comercialmente; se recomienda contactar con el autor antes de cualquier uso en producción.
- No hay documentación sobre sesgos, alucinaciones o comportamiento en dominios fuera de la proteómica.
- La métrica "Internal eval100 score" es interna y no ha sido validada externamente; no debe interpretarse como un benchmark estándar.
- No se han publicado idiomas soportados ni longitud de contexto; el uso multilingüe o con contextos largos no está garantizado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Taewhoo/qwen3.5-9b-proteomics-rl-step75
- Checkpoint step100: https://huggingface.co/Taewhoo/qwen3.5-9b-proteomics-rl-step100
