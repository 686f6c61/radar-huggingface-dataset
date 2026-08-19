# unconst/Affine-5czsc2fc98-r552-r252-odpo-extralong-ultratemp-hirank-bigg-merged

## Resumen

Affine-5czsc2fc98-r552-r252-odpo-extralong-ultratemp-hirank-bigg-merged es un modelo de lenguaje experimental desarrollado por el usuario `unconst` y publicado en Hugging Face. Se trata de un modelo derivado de `unconst/Affine-5czsc2fc98-r252-merged`, que a su vez forma parte de una línea de modelos basados en la arquitectura Qwen3.5 MoE (según los tags del repositorio). El modelo ha sido afinado mediante Online-DPO con una recompensa de razonamiento del lado del profesor (teacher-side Reason reward), optimizado para la versión "Reason v3". Su propósito principal es mejorar la capacidad de razonamiento y generación de pensamientos de alta calidad en comparación con su modelo base.

Con aproximadamente 35 107 millones de parámetros y un tamaño de repositorio de 70,2 GB en formato safetensors, se trata de un modelo de gran escala. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El modelo fue creado el 16 de agosto de 2026 y actualizado el mismo día, aunque no se han publicado métricas de evaluación ni información sobre su rendimiento en tareas estándar. Es relevante para la comunidad de investigación en razonamiento y alineación, ya que emplea una técnica de DPO en línea con datos de alta calidad generados por el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tags, no confirmado oficialmente) |
| Parametros totales | 35 107 181 936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no está documentada en la información disponible. Los tags indican `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, pero no se confirma el número de expertos ni el mecanismo de activación. El proceso de entrenamiento se describe en la model card: se parte del modelo base `unconst/Affine-5czsc2fc98-r252-merged` (reign-33 crown) y se aplica Online-DPO con una recompensa de razonamiento del lado del profesor. La preferencia entre respuestas se calcula mediante la diferencia de log-probabilidades del profesor condicionado a la respuesta (`lpC(y_C|z) - lpC(y_C|∅)`). Se utilizaron datos de "pensamientos ganadores de alta razón" (`winner_za_high_l1.jsonl`). Los hiperparámetros incluyen learning rate de 5e-6, LoRA con r=64 y α=32, β=0,1, group_size=8, temperatura 2,0, longitud máxima de 6144 tokens y 900 pasos máximos (detenido en 151). El entrenamiento se realizó en 2 GPUs B200 (de un total de 8) durante aproximadamente 151 pasos. No se mencionan técnicas como RLHF completo, DPO fuera de línea ni otras innovaciones más allá del esquema de recompensa del profesor.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas del modelo. Según el contexto de entrenamiento, se espera que herede las capacidades del modelo base (razonamiento, generación de texto, posiblemente código y matemáticas), pero no hay documentación oficial al respecto. Los tags sugieren soporte para razonamiento (Reason v3) y optimización para pensamientos de alta calidad, pero no se detallan funciones como tool calling, agentes o multimodalidad. La ausencia de métricas y ejemplos de uso impide confirmar capacidades concretas.

## Casos de uso

Dado que no se dispone de información sobre el rendimiento real del modelo, los casos de uso son hipotéticos y deben validarse con pruebas propias. Posibles aplicaciones:

- Investigación en alineación y razonamiento: el modelo está diseñado para producir pensamientos de alta calidad mediante DPO en línea, por lo que podría usarse en experimentos de generación de cadenas de razonamiento (chain-of-thought) y comparación con otros modelos afinados con DPO.
- Generación de datos sintéticos de razonamiento: al estar optimizado para "Reason v3", podría emplearse para crear datasets de entrenamiento con explicaciones detalladas y razonamiento paso a paso.
- Evaluación de técnicas de recompensa del lado del profesor: su esquema de entrenamiento lo hace útil para estudiar el impacto de recompensas basadas en log-probabilidades condicionadas.
- Prototipado de aplicaciones conversacionales: si se confirma su capacidad de generación de texto coherente, podría servir en chatbots o asistentes, aunque requiere validación previa.
- Experimentación con LoRA y DPO en modelos MoE: su configuración de entrenamiento (LoRA r=64, α=32) lo convierte en un caso de estudio para quienes investigan la eficiencia del ajuste fino en arquitecturas de mezcla de expertos.
- Desarrollo de modelos especializados en razonamiento matemático o lógico: si los datos de entrenamiento incluyen dichos dominios, podría adaptarse a tareas de resolución de problemas, siempre que se verifique su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparaciones con modelos similares. La model card menciona una "evidencia simulada" (n80 vs live king) y una regla de decisión basada en margen pareado, pero no se proporcionan cifras concretas. Por tanto, no es posible evaluar su rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35 107 millones de parámetros en FP16, el modelo ocupa aproximadamente 70 GB (coincide con el tamaño del repositorio). Para inferencia en FP16 se necesitarían al menos 80 GB de VRAM (por ejemplo, una A100 80 GB o H100 80 GB). Con cuantización a 8 bits (si estuviera disponible) se reduciría a unos 35-40 GB, y a 4 bits a unos 18-20 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 con 24 GB cada una si se usa cuantización o particionado, aunque no está confirmado).
- Si cabe en GPU de consumo: no de forma directa en FP16; solo con cuantización agresiva (4 bits) podría ejecutarse en una RTX 4090 (24 GB) o similar, pero no hay archivos GGUF ni AWQ disponibles en el repositorio.
- Opciones de despliegue: al ser safetensors, se puede cargar con Transformers y usar vLLM o TGI si se configuran correctamente. No hay soporte nativo para llama.cpp u Ollama sin conversión previa a GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El modelo pertenece a una familia experimental (Affine) de la que no hay documentación pública sobre rendimiento. Se podría comparar con otros MoE de ~35B como Mixtral 8x7B (46,7B totales) o Qwen2.5 MoE, pero no hay datos de evaluación para establecer una comparación rigurosa. Por tanto, esta sección queda sin contenido verificable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo experimental con datos de entrenamiento no públicos, es probable que herede sesgos del modelo base y de los datos de afinamiento.
- Riesgo de alucinación: alto, especialmente en tareas de razonamiento complejo, dado que no se han publicado evaluaciones de fiabilidad.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos. El modelo base (Qwen3.5) suele ser multilingüe, pero no hay confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento podrían tener restricciones adicionales no especificadas.
- Caveat para producción: no hay evidencia de rendimiento ni estabilidad. El entrenamiento se detuvo en el paso 151 de 900, lo que sugiere que el modelo puede estar subentrenado o que la detención se debió a criterios de calidad no documentados. No se recomienda su uso en entornos de producción sin una validación exhaustiva.
- Reproducibilidad: la model card describe el proceso, pero no se proporcionan los datos de entrenamiento ni los scripts, lo que dificulta la reproducción o la verificación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unconst/Affine-5czsc2fc98-r552-r252-odpo-extralong-ultratemp-hirank-bigg-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Otros modelos de la serie Affine (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged, https://huggingface.co/unconst/Affine-5czsc2fc98-h52-merged, https://huggingface.co/unconst/Affine-5czsc2fc98-r477-offline-dpo-hialpha-hirank-extrasteps-lora
- Página de inferencia de un modelo relacionado (FriendliAI): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h55-merged

No se han encontrado papers, blogs o demos adicionales asociados a este modelo específico.
