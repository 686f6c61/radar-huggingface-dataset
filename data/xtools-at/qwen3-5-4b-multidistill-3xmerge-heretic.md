# xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-heretic

## Resumen

Qwen3.5-4B-MultiDistill-3xMerge-heretic es un checkpoint experimental publicado por el usuario xtools-at. Se trata de una versión "descensurada" (etiquetada como heretic, uncensored, decensored y abliterated) de su propio modelo xtools-at/Qwen3.5-4B-MultiDistill-3xMerge, obtenida aplicando la herramienta Heretic v2.0.0.dev0 mediante una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 16 a 30 del modelo original.

El modelo base del que deriva es, a su vez, un merge por media ponderada lineal de tres fine-tunes de Qwen3.5-4B orientados a razonamiento: Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 (peso 1), empero-ai/Qwen3.8-4B-Distill (peso 0,8) y Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (peso 0,6). El objetivo declarado es combinar razonamiento general, eficiencia de razonamiento, seguimiento de instrucciones y matemáticas/STEM en un modelo compacto de aproximadamente 4B parámetros.

La relevancia de esta variante concreta reside en su modificación de comportamiento: según la model card, reduce los rechazos de 98/100 en el modelo original a 3/100, con una divergencia KL de 0,0200 respecto al original. Es un artefacto de investigación, no un modelo validado para producción, y el propio autor advierte que el merge combinado no ha sido evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con base Qwen3.5-4B; detalles no especificados en la model card |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican versiones cuantizadas; pesos distribuidos en precision completa (BF16). Cuantizacion posible con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (verificar terminos de los modelos fuente antes de redistribuir) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 9,1 GB |
| Pipeline | text-generation |
| Metodo de construccion | Merge por media ponderada lineal + ablacion ARA con Heretic v2.0.0.dev0 |
| Modelo base | xtools-at/Qwen3.5-4B-MultiDistill-3xMerge |
| Fecha de publicacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-4B, un transformer decoder-only de aproximadamente 4B parametros. Este checkpoint no incorpora entrenamiento adicional propio: es el resultado de dos transformaciones aplicadas sobre xtools-at/Qwen3.5-4B-MultiDistill-3xMerge. La primera es un merge de pesos por media ponderada lineal de tres checkpoints fine-tuneados, con coeficientes 1, 0,8 y 0,6. La segunda es una ablacion de rango arbitrario (ARA) ejecutada con Heretic v2.0.0.dev0 sobre las capas 16 a 30, que modifica los pesos para suprimir comportamientos de rechazo.

Los datos de entrenamiento corresponden a las destilaciones de los tres modelos fuente, no a un entrenamiento nuevo de este checkpoint. Segun la model card, la fuente Claude Opus 4.6 utilizo mas de 14.000 muestras de razonamiento estilo Opus; la fuente Empero Qwen3.8-4B-Distill reporta aproximadamente 45.000 trazas de profesor filtradas por calidad, con bloques `<think>` aprendidos y comportamiento nativo de function calling segun la especificacion de Qwen3.5; y la fuente DeepSeek-V4-Pro-Qwen3.5-4B reporta una mezcla de aproximadamente 250.000 muestras de matematicas y STEM, entrenada con Unsloth y un pipeline LoRA, con los pesos resultantes fusionados en BF16. El autor de esta ultima fuente indica explicitamente que la mezcla SFT de 4B no incluyo datos especificos de codigo.

En cuanto a la innovacion tecnica, el elemento distintivo es la ablacion de rango arbitrario con parametros declarados: start_layer_index 16, end_layer_index 30, preserve_good_behavior_weight 0,9511, steer_bad_behavior_weight 0,0016, overcorrect_relative_weight 0,6627 y neighbor_count 14. El modelo se declara reproducible, con instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredado de los tres checkpoints fuente.
- Razonamiento general con enfasis en trazas estructuradas y economicas, procedente de la destilacion estilo Claude Opus 4.6.
- Razonamiento matematico y cientifico (STEM) con derivaciones detalladas y descomposicion de problemas, procedente de la fuente DeepSeek-V4-Pro.
- Razonamiento multi-paso con bloques `<think>` aprendidos, segun lo descrito en la fuente Empero.
- Function calling nativo segun la especificacion de Qwen3.5, segun la model card de la fuente Empero.
- Capacidad multimodal: la etiqueta `image-text-to-text` aparece en los metadatos del repositorio, pero la model card no describe capacidades de vision ni detalla su alcance. Dato no confirmado.
- Supresion del comportamiento de rechazo (3/100 rechazos frente a 98/100 del original).
- Capacidades multilingues: no disponible.
- Soporte de agentes: no documentado explicitamente en la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo es un caso de estudio controlado para medir el efecto de una ablacion ARA sobre la tasa de rechazos (de 98/100 a 3/100) y sobre la divergencia KL (0,0200) respecto al checkpoint original. Util para estudiar el compromiso entre supresion de rechazos y degradacion de comportamiento.
- Reproducibilidad de tecnicas de ablacion: al incluir instrucciones y parametros en el directorio `reproduce`, permite replicar el procedimiento completo de Heretic v2.0.0.dev0 sobre un merge de 4B y validar los coeficientes declarados.
- Generacion de razonamiento matematico en entornos de investigacion: la mezcla incorpora aproximadamente 250.000 muestras de matematicas y STEM de la fuente DeepSeek-V4-Pro, orientadas a derivaciones paso a paso y respuestas finales verificables.
- Analisis comparativo de destilaciones: el modelo combina tres enfoques de destilacion distintos (Opus 4.6, Qwen3.8 y DeepSeek-V4-Pro) en un unico checkpoint, lo que permite estudiar como se comporta una mezcla ponderada frente a cada fuente por separado.
- Prototipado de asistentes conversacionales sin filtros de rechazo: en entornos de investigacion cerrados, para estudiar respuestas del modelo ante peticiones que un modelo alineado rechazaria. Requiere supervision humana y evaluacion de riesgos previa.
- Evaluacion de degradacion por ablacion: con una divergencia KL de 0,0200 respecto al original, sirve para medir experimentalmente cuanto se degrada la coherencia al aplicar la ablacion en el rango de capas 16-30.
- Base para experimentos de merge adicionales: al ser un checkpoint experimental de 4B con licencia Apache-2.0, se puede usar como punto de partida para nuevas combinaciones ponderadas en investigacion academica.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos de rendimiento declarados son la tasa de rechazos y la divergencia KL respecto al modelo original:

| Metrica | Este modelo | Modelo original (xtools-at/Qwen3.5-4B-MultiDistill-3xMerge) |
|---|---|---|
| Rechazos | 3/100 | 98/100 |
| Divergencia KL | 0,0200 | 0 (por definicion) |

El autor indica explicitamente que el checkpoint combinado no ha sido evaluado de forma independiente y que sus capacidades no deben asumirse equivalentes a las de ninguno de los modelos fuente por separado.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros declarado (4.539.265.536); no proceden de la model card.

- Inferencia en BF16: aproximadamente 9,1 GB solo para los pesos, mas memoria para cache KV; en la practica se recomienda una GPU con 12-16 GB o mas.
- Inferencia en INT8: aproximadamente 4,5-5 GB para los pesos.
- Inferencia en INT4 (GPTQ, AWQ o GGUF Q4): aproximadamente 2,3-2,7 GB para los pesos, viable en GPUs consumer de 6-8 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para BF16 sin problemas; RTX 3060 de 12 GB para BF16 con contexto limitado; GPUs de 8 GB o menos requieren cuantizacion INT4.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en RTX 3060 12 GB o GPUs de 8 GB.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, TGI y, previa conversion a GGUF, llama.cpp y Ollama. El repositorio no publica archivos GGUF, por lo que el uso en llama.cpp u Ollama requiere una conversion propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa con el modelo del que deriva directamente:

| Modelo | Parametros | Contexto | Rechazos | Divergencia KL | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B-MultiDistill-3xMerge-heretic (este) | ~4,54B | no disponible | 3/100 | 0,0200 | Apache-2.0 |
| Qwen3.5-4B-MultiDistill-3xMerge (original) | no disponible en la informacion proporcionada | no disponible | 98/100 | 0 | Apache-2.0 |

Composicion del merge del modelo original:

| Modelo fuente | Peso | Enfasis principal |
|---|---:|---|
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | 1 | Razonamiento general, eficiencia de razonamiento, matematicas y logica |
| empero-ai/Qwen3.8-4B-Distill | 0,8 | Razonamiento destilado de profesor, conocimiento general y seguimiento de instrucciones |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 0,6 | Matematicas, STEM, derivaciones estructuradas y razonamiento cuantitativo |

No se dispone de datos verificados de otros modelos comparables de la misma categoria (por ejemplo, otros modelos de ~4B orientados a razonamiento) en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Modelo descensurado por diseno: la ablacion reduce los rechazos de 98/100 a 3/100. Esto implica que el modelo puede generar contenido que un modelo alineado rechazaria, con los riesgos asociados en cualquier uso real.
- Checkpoint experimental sin evaluacion independiente: el autor advierte que el merge combinado no ha sido benchmarkeado y que sus capacidades no deben darse por equivalentes a las de las fuentes.
- Degradacion potencial por ablacion: la divergencia KL de 0,0200 respecto al original indica que la distribucion de salida ha cambiado; no se documenta el impacto sobre coherencia, factualidad o tareas especificas.
- Riesgo de alucinacion: no disponible como dato medido; al ser un modelo de 4B con destilacion de razonamiento, el riesgo existe, pero no hay cifras publicadas.
- Carencia de entrenamiento en codigo: el autor de la fuente DeepSeek-V4-Pro-Qwen3.5-4B indica que la mezcla SFT de 4B no incluyo datos especificos de codigo, por lo que la transferencia en codigo y uso de herramientas no esta establecida por el entrenamiento de esa fuente.
- Capacidad multimodal dudosa: la etiqueta `image-text-to-text` figura en los metadatos, pero la model card no describe ni valida vision. No debe asumirse soporte de imagenes en produccion.
- Idiomas, contexto y cuantizaciones oficiales: no disponibles. No hay datos sobre cobertura multilingue ni sobre la longitud de contexto efectiva.
- Licencia: el checkpoint declara Apache-2.0, pero la propia model card pide verificar los terminos de los modelos fuente antes de redistribuir. Las licencias de los tres checkpoints de origen condicionan el uso comercial.
- Uso comercial: no verificado. La combinacion de una licencia Apache-2.0 declarada con terminos upstream no comprobados exige revision legal previa a cualquier despliegue comercial.
- Ausencia de datos de latencia y throughput: no disponible, lo que dificulta estimar costes de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-heretic
- Modelo base (original sin ablacion): https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge
- Heretic (herramienta de ablacion): https://heretic-project.org
- Fuente 1 del merge: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Fuente 2 del merge: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Fuente 3 del merge: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Dataset citado: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset citado: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset citado: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Instrucciones de reproduccion: directorio `reproduce/README.md` dentro del repositorio del modelo
