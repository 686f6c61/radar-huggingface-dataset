# wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-NPO

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) publicado por el usuario wutt6678 sobre un checkpoint propio denominado `outputs_3/mllmu_vanilla_qwen3-vl-2b`, que a su vez parte de Qwen3-VL-2B-Instruct. Se trata, por tanto, de un artefacto de investigación orientado al desaprendizaje automático (machine unlearning), concretamente al split "forget1" del banco de pruebas IDUnlearn-Bench y entrenado con la técnica NPO (Negative Preference Optimization).

El interés de este adaptador es metodológico más que de producto: sirve para reproducir y auditar experimentos de eliminación selectiva de conocimiento en modelos multimodales pequeños. Al montarse sobre un modelo visión-lenguaje de 2.000 millones de parámetros, permite estudiar cómo se comporta el desaprendizaje cuando el modelo base tiene capacidades de percepción visual, y no solo de texto.

La relevancia actual viene del auge de las técnicas de unlearning para cumplimiento normativo (por ejemplo, derecho al olvido en el RGPD) y de la necesidad de evaluar si estas técnicas realmente eliminan información o solo la enmascaran. El repositorio es muy reciente, con cero descargas y cero "likes", sin licencia declarada y con una model card completamente vacía, por lo que debe tratarse como material experimental sin garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso visión-lenguaje; el modelo base es Qwen3-VL-2B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 2.000 millones de parámetros |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base Qwen3-VL-2B-Instruct |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, distribuido como pesos PEFT en formato safetensors dentro de un repositorio de aproximadamente 0,1 GB, lo que es coherente con el tamaño típico de este tipo de adaptadores. No modifica la arquitectura del modelo base, sino que añade matrices de bajo rango a determinadas capas. El modelo subyacente es Qwen3-VL-2B-Instruct, un transformer denso multimodal de la familia Qwen3-VL, que incorpora codificación visual y comprensión de imágenes y vídeo además de generación de texto.

Respecto al entrenamiento, la información disponible es muy limitada. El sufijo "NPO" indica que se empleó Negative Preference Optimization, una técnica de desaprendizaje que optimiza el adaptador para reducir la probabilidad de generar las respuestas asociadas al conjunto "olvidar" (forget set), manteniendo idealmente el rendimiento en el conjunto "retener" (retain set). El sufijo "mllmu_vanilla" del modelo base sugiere un ajuste previo vinculado al benchmark MLLMU. No se especifican hiperparámetros, número de tokens, composición del dataset, régimen de precisión ni duración del entrenamiento.

## Capacidades

- Herencia del modelo base Qwen3-VL-2B-Instruct en generación de texto, razonamiento y comprensión de imágenes.
- Percepción visual: descripción de imágenes, respuesta a preguntas visuales y comprensión de contenido gráfico (según las capacidades documentadas del modelo base).
- Comprensión de vídeo y relaciones espaciales, conforme a las capacidades anunciadas por la familia Qwen3-VL.
- El objetivo del adaptador es precisamente reducir la capacidad del modelo para reproducir cierto conocimiento olvidado, por lo que su comportamiento en ese dominio concreto debe verificarse empíricamente.
- Soporte de tool calling y de interacción con agentes: heredado del modelo base, aunque no confirmado para este adaptador concreto.
- Capacidades multilingües: no disponibles para este adaptador; el modelo base Qwen3-VL soporta múltiples idiomas según su documentación.

## Casos de uso

- Investigación en desaprendizaje automático: reproducir el experimento "forget1" del banco IDUnlearn-Bench con NPO y comparar la retención de conocimiento frente a otros métodos como GradAscent o KL.
- Auditoría de privacidad y cumplimiento: evaluar hasta qué punto un adaptador de este tipo elimina de verdad información sensible y si es robusto frente a intentos de recuperación.
- Estudio de unlearning multimodal: analizar cómo afecta el desaprendizaje a las capacidades de percepción visual, un aspecto poco explorado frente al texto.
- Evaluación comparativa de adaptadores: usar varios adaptadores LoRA (por ejemplo distintos splits "forget") sobre el mismo modelo base para medir la degradación selectiva de capacidades.
- Prototipado de pipelines de eliminación de datos: integrar el adaptador en flujos que requieran "desaprender" contenido sin reentrenar el modelo desde cero.
- Docencia y experimentación académica: servir como ejemplo reproducible de entrenamiento PEFT con objetivos NPO sobre un modelo visión-lenguaje pequeño y asequible en hardware de consumo.
- Pruebas de robustez de salvaguardas: verificar si el olvido persiste tras fine-tuning adicional o con prompts adversariales, como parte de una evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de los conjuntos forget/retain propios del banco IDUnlearn-Bench, y la información de búsqueda no aporta cifras específicas.

## Requisitos de hardware

- El adaptador por sí solo ocupa aproximadamente 0,1 GB; debe fusionarse o cargarse junto al modelo base Qwen3-VL-2B-Instruct.
- VRAM estimada para el modelo fusionado: del orden de 4 a 6 GB en FP16/BF16 y alrededor de 2 GB en cuantización de 4 bits (estimación orientativa según el tamaño del modelo base; no confirmada en la información disponible).
- GPU recomendadas para el modelo base: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090; también A100 o H100 para despliegues con mayor paralelismo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más de VRAM (estimación basada en el tamaño del modelo base).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp, Ollama y vLLM son compatibles con el modelo base, pero la conversión del adaptador a GGUF no está documentada aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (NPO, forget1) | Adaptador LoRA sobre 2B | No disponible | Adaptador PEFT para unlearning | No disponible | HuggingFace, 0 descargas |
| Qwen3-VL-2B-Instruct | 2B | Documentado como contexto extendido por el fabricante, cifra concreta no disponible aquí | Modelo base visión-lenguaje | No disponible en esta ficha | HuggingFace, Ollama, ModelScope |
| Otros adaptadores de IDUnlearn-Bench | No disponible | No disponible | Adaptadores PEFT | No disponible | No disponible en la información proporcionada |

Las alternativas de la misma categoría serían otros métodos de desaprendizaje (GradAscent, KL, NPO con distintos splits), pero no se dispone de datos cuantitativos para comparar en esta ficha.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `outputs_3/mllmu_vanilla_qwen3-vl-2b` o, en su defecto, Qwen3-VL-2B-Instruct, para funcionar.
- Model card vacía: sin datos de licencia, idiomas, sesgos, riesgos ni resultados de evaluación.
- Licencia no declarada: existe incertidumbre legal sobre su uso comercial; debe aclararse antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente al modelo base; el desaprendizaje puede no eliminar el conocimiento de forma verificable.
- El desaprendizaje con NPO puede ser superficial: el conocimiento supuestamente olvidado podría recuperarse mediante prompts adversariales, fine-tuning posterior o ataques de inversión.
- Posible degradación colateral: el entrenamiento de olvido puede afectar a capacidades generales del modelo base, especialmente en tareas multimodales.
- Sin métricas publicadas: no hay evidencia de que el olvido funcione ni de que la retención se mantenga.
- Repositorio sin tracción: cero descargas y cero "likes", lo que reduce la probabilidad de que haya sido validado por terceros.
- Formato de pesos: al ser un adaptador PEFT, no es directamente cargable en motores de inferencia que no soporten LoRA sin conversión previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-NPO
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Documentación de Ollama para qwen3-vl: https://ollama.com/library/qwen3-vl:2b-instruct
- Documentación de Transformers para Qwen3: https://huggingface.co/docs/transformers/model_doc/qwen3
- ModelScope: https://www.modelscope.ai/models/Qwen/Qwen3-VL-2B-Instruct
- Paper citado en los tags (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
