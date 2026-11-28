# unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr7e-7_hf

## Resumen

`unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr7e-7_hf` es un ajuste fino supervisado (SFT) del modelo Qwen3-8B, publicado por el usuario `unamed12` en Hugging Face. El nombre del checkpoint codifica la receta de entrenamiento: SFT orientado a razonamiento, con un componente de "cbhint" (probablemente *chain-of-thought hint* o pista de cadena de pensamiento), un conjunto de datos de aproximadamente 1.000 ejemplos (cs1k), combinado con un corpus adicional de control múltiple (mc), batch size 16 y learning rate 7e-7. El entrenamiento se realizó con LLaMA-Factory en modalidad *full fine-tuning*, es decir, actualizando todos los parámetros del modelo base.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8.000 millones de parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 16,4 GB, lo que corresponde a pesos en precisión bf16/fp16. Está pensado para generación de texto conversacional y tareas de razonamiento, y es compatible con text-generation-inference y endpoints compatibles con la API de Hugging Face.

Su relevancia es limitada pero concreta: se trata de un experimento de ajuste fino reproducible sobre Qwen3-8B para mejorar el comportamiento de razonamiento paso a paso, con acceso restringido (gated) y sin métricas publicadas. Resulta útil como referencia para quienes investigan recetas de SFT sobre Qwen3 o quieren comparar el efecto de un dataset pequeño (1k ejemplos) frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | ~8.000 millones (base Qwen3-8B); el campo safetensors del repo indica 308.224, dato inconsistente con el tamano del repo (16,4 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen3-8B soporta contexto nativo largo, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de Qwen3-8B, con terminos adicionales; acceso restringido) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Metodo de entrenamiento | Full fine-tuning con LLaMA-Factory |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B, un transformer decoder-only denso de la familia Qwen3, y se ajusta mediante *full fine-tuning* (no LoRA ni QLoRA), segun los tags `full` y `generated_from_trainer` del repositorio. La receta indicada en el nombre sugiere un dataset de SFT de aproximadamente 1.000 ejemplos (`cs1k`) enriquecido con pistas de razonamiento (`cbhint`) y combinado con un conjunto adicional (`mc`), entrenado con batch size 16 y learning rate 7e-7. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.) más allá de las que aporta el modelo base. El entrenamiento se realizó con LLaMA-Factory, lo que facilita la reproducibilidad de la receta, pero la model card no incluye curvas de pérdida, configuración completa de hiperparámetros ni detalles sobre el preprocesado del dataset.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-8B.
- Razonamiento paso a paso, presumiblemente reforzado por el dataset de SFT con pistas de cadena de pensamiento (`cbhint`).
- Generación de código y matemáticas a nivel del modelo base Qwen3-8B (no verificado específicamente para este checkpoint).
- Soporte de tool calling / function calling: no confirmado en la información disponible; depende de si el ajuste preserva las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*: no confirmado; Qwen3-8B lo soporta, pero el ajuste SFT podría haber alterado su comportamiento.

## Casos de uso

- Investigación de recetas de SFT: el checkpoint sirve como referencia reproducible para estudiar el efecto de un dataset pequeño (~1k ejemplos) con pistas de razonamiento sobre Qwen3-8B, comparando su comportamiento con el modelo base en tareas de cadena de pensamiento.
- Evaluación de *full fine-tuning* frente a LoRA: al haberse entrenado todos los parámetros, permite analizar diferencias de calidad y olvido catastrófico respecto a adaptaciones parametrizadas eficientes sobre el mismo base.
- Generación de explicaciones razonadas en dominios acotados: útil para prototipar asistentes que deban justificar sus respuestas paso a paso, siempre que se valide contra el modelo base.
- Base para experimentos de alineación posteriores: puede emplearse como punto de partida para etapas de DPO o RLHF, dado que ya incorpora un ajuste SFT orientado a razonamiento.
- Reproducción de pipelines con LLaMA-Factory: el repositorio documenta implícitamente la configuración (bs16, lr7e-7, full), lo que facilita replicar el entrenamiento en otros datasets.
- Evaluación comparativa de robustez: permite medir si el SFT con pocos ejemplos degrada capacidades del base (código, matemáticas, multilingüismo) y detectar regresiones antes de un despliegue real.

## Benchmarks y rendimiento

La model-index del repositorio declara una entrada (`reasoning-sft_cbhint_cs1k+mc_bs16_lr7e-7`) con una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- Cuantización a 8 bits: ~8-9 GB de pesos; a 4 bits: ~4-5 GB, aunque no se distribuyen versiones GGUF/AWQ oficiales y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para inferencia en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto moderado; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son viables pero no están documentados en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (SFT sobre Qwen3-8B) | ~8B | no disponible | other (gated) | Restringida | SFT full con ~1k ejemplos; sin benchmarks |
| Qwen/Qwen3-8B (base) | ~8B | no disponible en esta ficha | licencia Qwen3 | Pública | Modelo original, con benchmarks publicados por Alibaba |
| Otros SFT comunitarios sobre Qwen3-8B | ~8B | variable | variable | Pública generalmente | Depende del autor; no comparable directamente sin datos |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora sobre el modelo base; el ajuste podría degradar capacidades en código, matemáticas o multilingüismo.
- Dataset de entrenamiento muy pequeño (~1k ejemplos): alto riesgo de sobreajuste y de olvido catastrófico de las capacidades originales de Qwen3-8B.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados y en investigación abierta.
- Licencia "other" heredada de Qwen3-8B: es necesario revisar los términos del modelo base para uso comercial; el prefijo "unamed12" no aporta garantías adicionales.
- Idiomas soportados no documentados: no se puede asumir el multilingüismo del base sin verificación empírica.
- Riesgo de alucinación y sesgos: no evaluados; al ser un SFT sobre un base con sesgos conocidos, estos persisten y podrían amplificarse.
- Sin información sobre tool calling, modo thinking ni contexto efectivo tras el ajuste: no recomendable para producción sin validación previa.
- Inconsistencia en metadatos: el campo de parámetros safetensors (308.224) no concuerda con el tamaño del repo (16,4 GB), lo que sugiere un problema de serialización o de conteo; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr7e-7_hf
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
