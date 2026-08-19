# unconst/Affine-5czsc2fc98-r565-r252-king-grpo-hialpha-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r565-r252-king-grpo-hialpha-merged` es un modelo de lenguaje de tipo MoE (Mixture of Experts) desarrollado por el usuario `unconst`, con una arquitectura basada en la familia Qwen3.5 MoE y con componentes de atención afín (`affine`). Está diseñado específicamente para tareas de razonamiento complejo, optimizado mediante GRPO (Group Relative Policy Optimization) con una recompensa de razonamiento tipo "teacher-side" (denominada Reason v3). El modelo parte del checkpoint `unconst/Affine-5czsc2fc98-r252-merged` y aplica un refinamiento adicional orientado a maximizar la calidad de los pensamientos intermedios (thoughts) generados durante el razonamiento.

Con 35.107.181.936 parámetros totales (~35,1B), este modelo se posiciona en la gama media-alta de modelos de razonamiento. La licencia Apache 2.0 permite su uso comercial y modificaciones. Aunque no se especifican los idiomas soportados ni la longitud de contexto, por su base Qwen3.5 MoE se espera un soporte multilingüe amplio, aunque estos datos no están confirmados en la información disponible.

La relevancia de este modelo radica en su enfoque experimental: aplica GRPO sobre un "rey" (king) ya coronado, con una recompensa basada en la diferencia de log-probabilidades entre el contexto condicionado y el no condicionado (`lpC(y_C|z) − lpC(y_C|∅)`), lo que busca mejorar la capacidad de razonamiento sin necesidad de ajustes adicionales de tipo L1 o lpA. Esto lo convierte en un candidato interesante para investigadores que exploran técnicas de RL aplicadas a modelos MoE de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE con componentes afines (affine) |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture of Experts), según el tag `qwen3_5_moe`, lo que implica que solo una fracción de los parámetros se activa por token, aunque no se especifica el número de parámetros activos. La etiqueta `affine` sugiere que la arquitectura incorpora mecanismos de atención o transformaciones afines, posiblemente variantes de atención lineal o de bajo rango, aunque no se proporcionan detalles técnicos adicionales.

El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con una recompensa de razonamiento "teacher-side" (Reason v3). La recompensa se calcula como la diferencia de log-probabilidades entre la respuesta condicionada al pensamiento intermedio `z` y la respuesta sin condicionar: `lpC(y_C|z) − lpC(y_C|∅)`. Se utilizaron datos de pensamientos ganadores de alta razón (`winner_za_high_l1.jsonl`) y muestras online generadas durante el GRPO. Los hiperparámetros principales fueron: learning rate `5e-6`, LoRA r=`16` y α=`128`, group_size=`4`, max_len=`6144`, max_steps=`200` (detenido en el paso 151) y temperatura `0.8`. El entrenamiento se realizó en 8×B300 (GPUs de alta gama), utilizando las GPUs 4 y 5.

Este enfoque es distinto de otros experimentos del mismo autor (Offline UltraExtra R570/R571/R572 y Online R552), ya que aplica la receta GRPO de la corona R252 sobre los pesos ya coronados, con una variante HiAlpha (α alto).

## Capacidades

- Razonamiento complejo: el modelo está optimizado específicamente para mejorar la calidad de los pensamientos intermedios durante el razonamiento, mediante la recompensa Reason v3.
- Generación de texto: al ser un modelo de lenguaje base, conserva la capacidad de generar texto coherente y contextualizado.
- Probablemente multilingüe: aunque no se confirma, los modelos Qwen suelen ser multilingües; sin embargo, no hay datos oficiales.
- No se documentan capacidades específicas de tool calling, agentes o visión en la información disponible.

## Casos de uso

No se han documentado casos de uso concretos en la información proporcionada. Sin embargo, por su naturaleza de modelo de razonamiento optimizado con GRPO, podría aplicarse a:

- Tareas de razonamiento matemático y lógico: el modelo podría utilizarse en sistemas que requieran cadenas de pensamiento detalladas, como resolución de problemas matemáticos o puzzles lógicos.
- Generación de explicaciones y justificaciones: su entrenamiento con recompensa de razonamiento lo hace adecuado para producir explicaciones paso a paso en dominios como educación o soporte técnico.
- Investigación en RL aplicada a MoE: como modelo experimental, es útil para estudiar el impacto de GRPO con recompensas basadas en log-probabilidades en arquitecturas MoE.
- Fine-tuning posterior: al tener licencia Apache 2.0, puede servir como base para ajustes específicos en dominios verticales (legal, médico, etc.) que requieran razonamiento estructurado.
- Sistemas de QA complejos: integrado en pipelines de pregunta-respuesta donde se necesite razonamiento multi-paso.
- Prototipado de agentes de razonamiento: aunque no se confirma soporte de tool calling, su capacidad de razonamiento podría combinarse con frameworks externos para construir agentes.

Es importante señalar que estos usos son inferencias basadas en el tipo de modelo, no aplicaciones validadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una "sim evidence" con n80 comparando contra el rey vivo `r252` reign-33, con una regla de decisión basada en margen pareado > max(2·SE, δ=0.002), mediana de pensamiento ≥80 y pase B ≥0.30, pero no se proporcionan los valores numéricos de dichas métricas. Por tanto, no se puede presentar una tabla comparativa.

## Requisitos de hardware

- El modelo tiene 35,1B parámetros en safetensors, lo que en FP16 (precisión típica de safetensors) ocuparía aproximadamente 70 GB de VRAM. Para inferencia sin cuantización se necesitaría al menos una GPU de 80 GB (como A100 80GB o H100) o dos GPUs de 48 GB (como A6000) en paralelo.
- Con cuantización (por ejemplo, 4 bits), el modelo podría caber en una GPU de 24 GB (como RTX 4090), pero no se han publicado archivos GGUF ni cuantizaciones oficiales.
- El entrenamiento se realizó en 8×B300 (presumiblemente GPUs NVIDIA Blackwell B300, aunque no es un modelo comercial conocido públicamente), lo que indica que la inferencia en producción requeriría hardware de gama alta.
- Opciones de despliegue: al ser safetensors, se puede servir con frameworks como vLLM, TGI o Transformers, siempre que se disponga de suficiente VRAM. No se han publicado integraciones con llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Dado que el modelo es experimental y tiene una arquitectura específica (Qwen3.5 MoE con affine), no se pueden establecer comparaciones fiables sin datos de benchmarks. Se recomienda consultar la página de HuggingFace para futuras actualizaciones.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo experimental, es probable que no haya sido sometido a evaluaciones exhaustivas de seguridad.
- El modelo está optimizado para razonamiento con recompensa Reason v3, lo que podría sesgar su comportamiento hacia la generación de pensamientos largos y detallados, incluso en tareas donde no son necesarios.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El tamaño del repositorio (70,2 GB) implica que la descarga y el despliegue requieren recursos de almacenamiento y ancho de banda considerables.
- No se especifica la longitud de contexto; si es similar a otros modelos Qwen3.5 MoE, podría ser de 128K tokens, pero no está confirmado.
- El modelo fue creado en agosto de 2026 (según la fecha de HuggingFace), lo que sugiere que es muy reciente y podría tener problemas no detectados.

## Enlaces

- [HuggingFace - unconst/Affine-5czsc2fc98-r565-r252-king-grpo-hialpha-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r565-r252-king-grpo-hialpha-merged)
- Modelo base: [unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged)

No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
