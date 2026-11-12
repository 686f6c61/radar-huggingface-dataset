# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step60

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step60` es un ajuste fino del modelo base `Qwen/Qwen3.5-4B` realizado por el autor `thkim0305-SNU` mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo declarado es el alineamiento de seguridad: el modelo se entrena para responder de forma segura ante peticiones potencialmente dañinas, utilizando una recompensa binaria estricta evaluada por un modelo profesor de mayor tamaño (`Qwen3.8-27B`).

El entrenamiento se llevó a cabo sobre dos conjuntos de datos: STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts), con 16 prompts por actualización, 8 respuestas por prompt y 60 actualizaciones del optimizador completadas. Se aplica una penalización KL con coeficiente 0,001 y una tasa de aprendizaje constante de 2e-6. El modo de razonamiento (*thinking*) está activado durante el entrenamiento y la función de pérdida cubre tanto el razonamiento como la respuesta final.

El modelo tiene 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Es relevante en el contexto actual de alineamiento de modelos open source, donde técnicas de RL con recompensas basadas en jueces automáticos se utilizan cada vez más para modular el comportamiento de seguridad sin necesidad de anotación humana extensiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; detalles especificos no disponibles) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen3.5-4B`, un transformer denso de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO, una variante de optimización por política proximal que estima ventajas relativas dentro de grupos de respuestas generadas para el mismo prompt, evitando la necesidad de un modelo de valor separado. En este caso se generan 8 respuestas por prompt y se comparan dentro de cada grupo de 16 prompts por actualización.

La señal de recompensa es binaria y estricta ("binary v3"), evaluada por un profesor `Qwen3.8-27B` siguiendo una especificación de modelo ("Model Spec v2"). El entrenamiento se realizó con el modo *thinking* activado y la pérdida abarca tanto la cadena de razonamiento como la respuesta final. Se aplicó una penalización KL de 0,001 frente al modelo de referencia para limitar la deriva de política, con tasa de aprendizaje constante de 2e-6. El prompt de sistema del estudiante fue `You are a helpful assistant.` El run de entrenamiento se identifica como `qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`. No se especifica el número total de tokens de entrenamiento ni la composición detallada de los datasets más allá de los recuentos de prompts.

## Capacidades

- Generación de texto conversacional y multi-turno, heredada del modelo base Qwen3.5-4B.
- Razonamiento en modo *thinking*: el modelo fue entrenado con la cadena de razonamiento activada y la pérdida cubre razonamiento y respuesta.
- Alineamiento de seguridad reforzado: entrenado explícitamente para responder de forma segura ante prompts dañinos según una especificación de modelo y un juez binario.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base (no confirmado en la model card).
- Compatibilidad con `transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente, aunque el modo *thinking* es un prerrequisito habitual.

## Casos de uso

- Moderación y filtrado de contenido: el modelo puede utilizarse como clasificador generativo de seguridad, generando respuestas seguras ante prompts dañinos y sirviendo como capa de defensa en pipelines de moderación, gracias a su ajuste específico con recompensa binaria de seguridad.
- Asistente conversacional con salvaguardas: despliegue en aplicaciones de atención al cliente donde se requiere un comportamiento alineado con políticas de contenido, aprovechando el ajuste GRPO sobre el modelo base Qwen3.5-4B.
- Investigación en alineamiento: el checkpoint (step 60) sirve como punto de comparación en estudios sobre GRPO, recompensas binarias y jueces automáticos, dado que el run está documentado con hiperparámetros concretos.
- Evaluación de robustez ante jailbreaks: al estar entrenado contra una especificación de seguridad, puede emplearse como sujeto de pruebas en benchmarks de red-teaming para medir la eficacia del alineamiento.
- Generación de respuestas con razonamiento explícito: el modo *thinking* permite usar el modelo en tareas donde se requiere trazar el razonamiento antes de responder, como análisis de solicitudes ambiguas o potencialmente sensibles.
- Integración en pipelines de `transformers`: al publicarse en safetensors y ser compatible con la librería, puede cargarse directamente en flujos de inferencia existentes basados en Hugging Face.
- Base para ajustes posteriores: al ser un fine-tune de Qwen3.5-4B con licencia Apache 2.0, puede servir como punto de partida para experimentos adicionales de RL o SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~4,66 B parámetros, en fp16 requeriría aproximadamente 9,3 GB de pesos (coincide con el tamaño del repo), y en cuantización de 8 bits o 4 bits se reduciría sustancialmente, aunque no se publican versiones cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en fp16, y en GPUs de datacenter (A100, H100) sin problema.
- ¿Cabe en consumer GPU? Probablemente sí en fp16 en GPUs con 12-24 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` (confirmado por la librería declarada) y endpoints de Hugging Face (`endpoints_compatible`). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary (este) | ~4,66 B | no disponible | Apache 2.0 | Fine-tune GRPO de seguridad sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | no disponible | Modelo base sin ajuste de seguridad específico |
| Alternativas de seguridad de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base Qwen3.5-4B, puede arrastrar sus sesgos.
- Riesgo de alucinación: no evaluado en la información disponible; el modo *thinking* no elimina el riesgo de respuestas incorrectas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no proporciona garantías ni documentación sobre el cumplimiento de políticas de seguridad en producción.
- El ajuste se realizó con solo 60 pasos del optimizador sobre ~1.915 prompts, lo que puede limitar la generalización del alineamiento de seguridad a dominios no cubiertos por STAR.
- El modelo depende de un juez profesor (`Qwen3.8-27B`) y de una especificación de modelo concretos; el comportamiento puede no transferirse a otras políticas de seguridad.
- No se publican datos de evaluación de seguridad ni de regresión de capacidades tras el ajuste GRPO.
- El repositorio no incluye estado del optimizador ni registros de entrenamiento, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
