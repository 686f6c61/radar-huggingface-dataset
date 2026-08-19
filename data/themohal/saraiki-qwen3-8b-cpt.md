# themohal/saraiki-qwen3-8b-cpt

## Resumen

El modelo `themohal/saraiki-qwen3-8b-cpt` es un adaptador LoRA de continuación de preentrenamiento (CPT) desarrollado por themohal sobre el modelo base `Qwen/Qwen3-8B-Base`. Su objetivo es enseñar al modelo base a modelar con fluidez el idioma Jataki Saraiki (سرائیکی), una variedad del panyabí occidental hablada en Pakistán que carece prácticamente de herramientas LLM específicas. Este adaptador constituye la primera etapa de un pipeline de tres fases: CPT, ajuste por instrucciones (SFT) y ajuste para uso de herramientas. No es un asistente conversacional, sino un modelo de completado de texto crudo, pensado como base lingüística para las etapas posteriores. El corpus de entrenamiento crece diariamente, por lo que el adaptador se actualiza de forma continua en lugar de ser una versión fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B-Base (Transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA usa r=16, alpha=32; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud de entrenamiento; el modelo base soporta mas) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso carga el modelo base en 4-bit con `load_in_4bit`) |
| Idiomas soportados | Saraiki (skr), variedad Jataki |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con el metodo LoRA (r=16, alpha=32, dropout=0.0) sobre las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`, manteniendo congelados todos los pesos del modelo base. El objetivo de entrenamiento es modelado de lenguaje causal estandar sobre bloques empaquetados de 1024 tokens, sin enmascaramiento de instrucciones ni respuestas, ya que esta etapa busca aprender la lengua en si misma, no un formato de tarea. Se utiliza una tasa de aprendizaje de 2e-5, inferior a la de las etapas posteriores de SFT. El tokenizer se extiende con dos caracteres especificos del arabe-saraiki (ڻ y ݙ), cuyas filas de embedding se inicializan a partir de la media de sus subtokens originales y se recalculan identicamente en cada sesion de entrenamiento. El corpus proviene del dataset `themohal/saraiki-llm-dataset`, que combina fuentes masivas limpiadas y deduplicadas (oraciones, corpus paralelo, textos de prensa, literatura y revistas) con pasajes largos generados por Gemini en diversos generos. El entrenamiento es continuo: cada sesion fija el dataset a un commit SHA especifico y registra un `data_manifest.json`; si el dataset no ha cambiado, se reanuda con el mismo estado del optimizador, y si ha cambiado, se realiza una continuacion solo de pesos con un nuevo optimizador.

## Capacidades

- Completado de texto en Saraiki: genera continuaciones fluidas de fragmentos de texto en este idioma.
- Modelado de lenguaje crudo: no sigue instrucciones, no mantiene dialogos ni responde preguntas de forma fiable.
- Base para etapas posteriores: sirve como cimiento linguistico para el ajuste por instrucciones (etapa 2) y el uso de herramientas (etapa 3).
- Soporte de tokenizacion ampliado: incluye los caracteres especificos del arabe-saraiki ڻ y ݙ.
- Sin capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso en esta version.

## Casos de uso

- Investigacion linguistica del Saraiki: permite generar texto de referencia o completar corpus para estudios morfologicos, sintacticos o lexicos de la variedad Jataki.
- Preentrenamiento de modelos derivados: se utiliza como etapa 1 del pipeline para construir un asistente Saraiki completo; los desarrolladores deben continuar con la etapa 2 (SFT) o la etapa 3 (tool-use) para obtener un modelo utilizable en produccion.
- Generacion de datos de entrenamiento: puede servir para crear ejemplos de texto Saraiki que alimenten otros modelos o sistemas de aumentacion de datos.
- Completado de texto en aplicaciones de escritura asistida: herramientas de autocompletado para redactar documentos, articulos o contenido literario en Saraiki, aunque sin garantia de coherencia tematica a largo plazo.
- Evaluacion de modelos de lenguaje en lenguas de bajos recursos: sirve como punto de referencia para medir la capacidad de modelos genericos multilingues frente a un modelo especializado en Saraiki.
- Archivado y preservacion linguistica: contribuye a la digitalizacion y generacion de contenido en un idioma con escasa presencia en el ecosistema LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 8B, la VRAM necesaria depende de la cuantizacion del modelo base. El ejemplo de uso carga el modelo en 4-bit, lo que sugiere que puede ejecutarse en GPUs de consumo con al menos 8-10 GB de VRAM (p. ej., RTX 3060/3070/4060). Sin cuantizacion, se requieren alrededor de 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con suficiente VRAM para el modelo base en la precision elegida.
- Opciones de despliegue: el ejemplo de uso emplea `unsloth` y `peft` con `transformers`; tambien es compatible con `vLLM` o `llama.cpp` si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables especificos para el idioma Saraiki en la informacion disponible. El modelo base Qwen3-8B es multilingue pero no esta especializado en Saraiki; este adaptador busca llenar ese vacio. No se dispone de alternativas de la misma categoria (modelos de lenguaje Saraiki) para comparar.

## Limitaciones y advertencias

- No esta ajustado para instrucciones: no responde preguntas ni sigue comandos de forma fiable; es un modelo de completado de texto crudo.
- Entrenado exclusivamente en Saraiki: su rendimiento en otros idiomas es el del modelo base, sin mejora especifica.
- Contexto limitado a 1024 tokens durante el entrenamiento: puede no aprovechar ventanas de contexto mayores del modelo base.
- Artefacto en evolucion: al crecer el dataset diariamente, el adaptador se actualiza de forma continua; las evaluaciones de distintas sesiones no son directamente comparables.
- Posibles sesgos del corpus: los datos incluyen texto generado por Gemini y fuentes web, lo que puede introducir sesgos culturales o tematicos.
- No destinado a competir con modelos generales de gran escala: su techo es ser el mejor modelo de lenguaje Saraiki disponible, no inteligencia general.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Qwen Research License) que debe verificarse para uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/themohal/saraiki-qwen3-8b-cpt
- Dataset de entrenamiento: https://huggingface.co/datasets/themohal/saraiki-llm-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Etapa 2 (SFT): https://huggingface.co/themohal/saraiki-qwen-8b-sft
- Etapa 3 (tool-use): https://huggingface.co/themohal/saraiki-qwen-8b-tool-use
