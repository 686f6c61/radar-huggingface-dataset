# xw1234gan/Extended_Fixed_Merging_Qwen2.5-3B-Instruct_MMLU_lr1e-05_mb2_ga128_n2048_seed42_G8_outer20_bg16

## Resumen

Este repositorio contiene un checkpoint de 3.085.938.688 parámetros publicado por el usuario xw1234gan, derivado de Qwen2.5-3B-Instruct y etiquetado como "Extended_Fixed_Merging". El nombre codifica el experimento: evaluación en MMLU, learning rate 1e-05, micro-batch 2, acumulación de gradiente 128, secuencia 2048, semilla 42 y parámetros G8, outer20 y bg16. No es un modelo entrenado desde cero, sino una fusión de pesos orientada a investigación.

La relevancia es metodológica: explora si la fusión de modelos puede combinar capacidades de variantes fine-tuneadas sin reentrenar. La model card es la plantilla automática de Hugging Face y no aporta detalles de arquitectura, datos, licencia ni evaluación. Se desconoce si el merge conserva las capacidades del modelo base y no hay benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5; no confirmado en la model card) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; la base Qwen2.5-3B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantización | Safetensors de ~6,2 GB (16 bits); no se incluyen GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | No disponible; la documentación de Qwen2.5 declara soporte multilingüe, no confirmado para este merge |
| Licencia | No disponible; la base Qwen2.5-3B-Instruct es Apache-2.0, pero este repositorio no declara licencia |
| Formato de pesos | Safetensors |
| Pipeline | Text-generation |
| Tags | Transformers, safetensors, qwen2, text-generation, conversational, text-generation-inference, endpoints_compatible |
| Tamaño del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal, atención de consultas agrupadas (GQA) y embeddings rotatorios (RoPE). No se documenta ninguna modificación estructural, cambio de tokenizador ni ampliación de contexto en este repositorio. Tampoco se especifica si el merge altera capas concretas, si combina checkpoints completos o si aplica alguna técnica de interpolación de pesos.

El proceso no es un entrenamiento convencional. El nombre del repositorio sugiere una fusión fija extendida ("Extended_Fixed_Merging") con evaluación o selección sobre MMLU, usando learning rate 1e-05, micro-batch 2, acumulación de gradiente 128, secuencia de 2048 tokens, semilla 42 y parámetros G8, outer20 y bg16. No hay información sobre el dataset de merge, el número de tokens procesados ni si se aplicó RLHF o DPO después de la fusión. La instrucción y el alineamiento proceden, en su caso, del modelo base Qwen2.5-3B-Instruct.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es text-generation y el tag conversational indica uso previsto para diálogo, aunque no hay ejemplos ni evaluación.
- Razonamiento y matemáticas de nivel medio: capacidad heredada de Qwen2.5-3B-Instruct, limitada por el tamaño de 3B parámetros y no verificada tras el merge.
- Generación de código y explicación de fragmentos: el modelo base soporta tareas de programación, pero no se ha evaluado el impacto de la fusión.
- Salida estructurada en JSON: Qwen2.5-3B-Instruct soporta este tipo de respuestas; no confirmado en este checkpoint.
- Tool calling y function calling: capacidad heredada del base, sin documentación específica ni pruebas publicadas.
- Soporte multilingüe: no confirmado; la familia Qwen2.5 declara varios idiomas, pero la model card no lo detalla.
- Contexto largo: la base declara 32.768 tokens nativos; este merge no confirma que se conserve.
- Sin capacidades de visión, audio o modo thinking documentadas.

## Casos de uso

- Experimentación con técnicas de merging: el repositorio sirve para reproducir y comparar variantes de fusión de pesos sobre un mismo modelo base, usando MMLU como criterio de selección. Es adecuado porque el nombre codifica los hiperparámetros del experimento.
- RAG ligero en local: se puede indexar documentación y generar respuestas con un contexto de hasta 32K tokens si se confirma la ventana del base. Cabe en GPU de consumo tras cuantización, lo que reduce costes frente a modelos de 7B o 13B.
- Asistente conversacional de bajo coste: con 3B parámetros y despliegue en una RTX 3060 o RTX 4060 Ti, puede gestionar diálogos multi-turno para soporte interno o prototipos. La calidad esperada es inferior a modelos de mayor tamaño.
- Generación de código en editor local: permite autocompletar funciones, explicar errores y proponer tests en un entorno sin conexión. Su tamaño facilita latencias bajas en hardware consumer, aunque no hay métricas publicadas.
- Extracción de información a JSON: útil para convertir correos, formularios o facturas en estructuras de datos mediante prompting. La capacidad de salida estructurada procede del base y debe validarse con un esquema estricto.
- Agentes simples
