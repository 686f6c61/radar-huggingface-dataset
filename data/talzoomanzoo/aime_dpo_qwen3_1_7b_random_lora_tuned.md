# talzoomanzoo/aime_dpo_qwen3_1_7b_random_lora_tuned

## Resumen

Este repositorio contiene un modelo derivado de Qwen/Qwen3-1.7B, publicado por el usuario talzoomanzoo, que se ha generado fusionando (merge) un adaptador LoRA entrenado con DPO en pares aleatorios del dataset AIME sobre los pesos del modelo base. El resultado es un checkpoint autónomo: no requiere cargar un adaptador PEFT por separado, ni dependencias adicionales más allá de transformers.

Se trata de un transformer denso de tipo decoder-only con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), exportado en safetensors con precisión bfloat16 tras realizar la fusión en float32. La relevancia del modelo es acotada: es un experimento de ajuste fino orientado a razonamiento matemático (AIME) sobre un modelo pequeño, útil para reproducir pipelines de DPO y de fusión de adaptadores, pero sin validación publicada de precisión en la tarea objetivo.

El propio autor indica en la model card que la subida "no establece precisión AIME downstream", por lo que debe considerarse un artefacto experimental más que un modelo listo para producción. No se declaran idiomas soportados, ni resultados de benchmarks, ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), denso |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este repositorio; el modelo base Qwen/Qwen3-1.7B declara 32.768 tokens nativos en su documentacion publica (dato no verificado en esta ficha) |
| Tipos de cuantizacion | el repositorio solo publica safetensors en bfloat16; no se declaran cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), checkpoint fusionado, sin adaptador PEFT requerido; tokenizer y chat template incluidos |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3-1.7B: un transformer decoder-only denso, con atención causal estándar y el chat template propio de la familia Qwen3 (incluido en el repositorio). Sobre ese modelo se aplicó un ajuste fino con LoRA cuyo objetivo declarado son pares aleatorios del dataset AIME (preguntas de competición matemática), seguido de optimización por DPO (Direct Preference Optimization). La fusión del adaptador se realizó en float32 y el resultado se exportó a bfloat16 en safetensors, de modo que la carga con `AutoModelForCausalLM.from_pretrained` no necesita PEFT ni un adaptador externo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de preferencias, hiperparámetros de DPO (beta, épocas, tasa de aprendizaje), ni el rango y los módulos objetivo del LoRA. Tampoco se documenta si hubo una fase previa de SFT o un pipeline de RLHF adicional. El repositorio incluye un fichero `merge_info.json` con la procedencia del merge y validación numérica, que el autor cita como registro del proceso, pero cuyo contenido no se ha proporcionado en esta ficha. No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, modos de razonamiento explícitos, etc.) más allá del propio merge.

## Capacidades

- Generación de texto conversacional en formato chat, usando el chat template de Qwen3 incluido en el repositorio.
- Razonamiento matemático orientado a problemas de competición, dado que el ajuste DPO se realizó sobre pares del dataset AIME; esta capacidad no está validada con métricas publicadas.
- Ajuste por preferencias (DPO), lo que en teoría favorece respuestas mejor alineadas con el par preferido del dataset de entrenamiento.
- Carga directa con transformers y compatibilidad declarada con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado para este checkpoint (el modelo base Qwen3 lo contempla, pero no hay verificación en este repositorio).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles para este checkpoint.

## Casos de uso

- Experimentación académica con DPO: sirve como referencia reproducible para estudiar cómo un ajuste DPO con pares aleatorios de AIME afecta a un modelo de 1,7 B, comparando antes y después de la fusión del adaptador.
- Evaluación de pipelines de merge de LoRA: al ser un checkpoint ya fusionado en float32 y exportado a bfloat16, permite validar herramientas de fusión y comprobar que las salidas coinciden con la carga del adaptador original.
- Prototipado de asistentes matemáticos en local: con 1,72 B de parámetros cabe en una GPU de consumo, lo que permite probar generación de soluciones paso a paso para problemas tipo AIME sin coste de API.
- Generación de texto en entornos con recursos limitados: al ocupar unos 3,5 GB en bfloat16, es viable en portátiles con GPU de 6-8 GB o incluso en CPU tras convertir a GGUF.
- Base para ajuste adicional: al ser un modelo denso de 1,7 B con licencia Apache-2.0, puede servir como punto de partida para SFT o LoRA específicos de dominio sin restricciones de licencia.
- Investigación sobre alineación y preferencias: permite analizar si el DPO con pares aleatorios introduce regresiones en tareas generales, un caso de estudio habitual en la literatura de alineación.
- Pruebas de integración con TGI o vLLM: el repositorio declara compatibilidad con text-generation-inference, por lo que puede desplegarse como endpoint para medir latencia y throughput de un modelo de este tamaño.
- Docencia y demostraciones: ejemplo didáctico de ciclo completo (base model, LoRA, DPO, merge, exportación) para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que la subida del merge "no establece precisión AIME downstream", y el repositorio no incluye tablas de MMLU, GSM8K, HumanEval, AIME ni ninguna otra métrica. Tampoco se proporcionan resultados del adaptador LoRA previo a la fusión, por lo que no es posible comparar el efecto del DPO con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4-3,5 GB en bfloat16 o float16 (1,72 B de parámetros), alrededor de 1,8 GB en cuantización de 8 bits y en torno a 1,0-1,2 GB en cuantizaciones de 4 bits (estas últimas requieren conversión externa, ya que el repositorio solo publica safetensors en bfloat16).
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM para bfloat16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores ofrecen margen amplio para lotes mayores. Para despliegues con concurrencia, A100 40/80 GB o H100 permiten agrupar muchas peticiones, aunque el modelo es pequeño para esas tarjetas.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 6 GB o más de VRAM en bfloat16, y con más holgura en 4 u 8 bits.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM.from_pretrained`), text-generation-inference (declarado en los tags), vLLM (compatible con safetensors, aunque no declarado explícitamente), y llama.cpp u Ollama previa conversión a GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni pruebas de carga.

## Comparativa con modelos similares

Los datos del modelo evaluado proceden del repositorio; los de los alternativas son cifras publicas de sus respectivas model cards y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| talzoomanzoo/aime_dpo_qwen3_1_7b_random_lora_tuned | 1,72 B | no disponible en el repositorio (base Qwen3-1.7B: 32.768 tokens segun documentacion publica) | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste DPO sobre AIME, sin benchmarks publicados |
| Qwen/Qwen3-1.7B (base) | 1,72 B | 32.768 tokens nativos, ampliable con YaRN | apache-2.0 | HuggingFace, ampliamente utilizado | Modelo generalista con soporte de razonamiento y tool calling; referencia directa del fine-tune |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | apache-2.0 | HuggingFace | Alternativa de tamano similar, instruida y validada con benchmarks publicos |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens declarados | Llama 3.2 Community License | HuggingFace (acceso aceptando terminos) | Contexto mayor y licencia con restricciones para algunos usos comerciales |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | apache-2.0 | HuggingFace | Modelo pequeno abierto con licencia permisiva, contexto mas corto |

## Limitaciones y advertencias

- Ausencia total de validación: no hay benchmarks publicados y el autor advierte que la subida no demuestra precisión en AIME. No debe asumirse una mejora en matemáticas por el hecho de haber entrenado con DPO sobre ese dataset.
- Riesgo de regresión por DPO con pares aleatorios: el ajuste por preferencias sobre pares seleccionados al azar puede degradar la utilidad general del modelo base y producir respuestas atípicas fuera del dominio matemático.
- Riesgo de alucinación: como cualquier modelo de 1,7 B, tiende a inventar pasos intermedios y resultados numéricos, especialmente en problemas de varias etapas.
- Idiomas: no se declara ninguna lista de idiomas soportados; el chat template de Qwen3 es multilingüe en origen, pero el fine-tune puede haber sesgado el comportamiento hacia el inglés de AIME.
- Contexto: la longitud de contexto efectiva de este checkpoint no está documentada y podría verse alterada por el ajuste; conviene verificarla antes de usarlo con entradas largas.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero al derivar de Qwen3-1.7B se mantienen las condiciones del modelo base; conviene revisar la licencia y los términos de Qwen antes de un despliegue en producción.
- Reproducibilidad limitada: no se documentan hiperparámetros de entrenamiento, composición del dataset de preferencias ni el contenido de `merge_info.json`.
- Anomalía de metadatos: la fecha de creación registrada en el repositorio es 2026-10-07, incoherente con una publicación real; conviene tratarla como un dato no fiable.
- Adopción nula: 0 descargas y 0 likes, sin evidencia de uso en la comunidad ni informes independientes de calidad.
- Artefacto experimental: no se recomienda su uso en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/talzoomanzoo/aime_dpo_qwen3_1_7b_random_lora_tuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (paper, blog, repositorio o demo). Las busquedas devolvieron unicamente foros de tematica bancaria sin relacion con el modelo, por lo que no se incluyen.
- Fichero de procedencia del merge citado en la model card: `merge_info.json` (incluido en el repositorio de HuggingFace, contenido no disponible en la informacion proporcionada).
