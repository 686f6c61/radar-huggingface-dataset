# Wiself/gemma-4-31B-Styletune-Voice

## Resumen

Wiself/gemma-4-31B-Styletune-Voice no es un modelo de generación de texto completo, sino un **tensor de voz** (voice tensor) extraído del finetune StyleTune de Gryphe sobre el modelo Gemma 4 31B de Google. El repositorio contiene únicamente el peso de la proyección de salida (`lm_head.weight`) en formato BF16, con un tamaño de 2,8 GB, junto con un archivo de metadatos. La técnica subyacente, desarrollada por Gryphe, consiste en congelar todas las capas del transformer y entrenar exclusivamente la capa de salida, de modo que el estilo de escritura quede encapsulado en un único tensor portable.

Este tensor se aplica mediante la herramienta `voice` de Wiself sobre cualquier GGUF de Gemma 4 31B que el usuario ya tenga, transformándolo en una versión con estilo StyleTune sin necesidad de reentrenar ni descargar un modelo completo. Según los datos del autor, esta versión de 31B logra la mayor reducción de clichés de la familia StyleTune: un 60 % menos de clichés por cada 100 palabras en comparación con el modelo base instruct, con un vocabulario compartido de trigramas del 21,7 %.

La relevancia de este repositorio radica en su enfoque modular: permite mejorar la calidad de escritura creativa y roleplay de un modelo ya existente con una descarga mínima y un proceso de integración en dos pasos. Está pensado para desarrolladores que trabajan con Gemma 4 31B en GGUF y desean un estilo más natural y menos repetitivo sin sacrificar las capacidades generales del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tensor único `lm_head.weight` (proyección de salida) de un transformer denso; no es un modelo completo |
| Parametros totales | 1 tensor de dimensiones [262144, 5376] (~2,8 GB en BF16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; depende del modelo base Gemma 4 31B (fuentes externas indican 262 000 tokens) |
| Tipos de cuantizacion | Almacenado en BF16; al aplicar se cuantiza la cabeza a Q8_0 (casi sin pérdida) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tensor único) + JSON de metadatos |

## Arquitectura y entrenamiento

El tensor contenido en este repositorio es el resultado de un finetune quirúrgico realizado por Gryphe sobre Gemma 4 31B. La técnica consiste en congelar las 30 capas transformer completas (todos los cabezales de atención y MLP) y entrenar únicamente la proyección de salida `lm_head`, que es la última capa antes de la generación de texto. Según la model card, el entrenamiento se realizó en una sola noche en hardware de consumo, lo que demuestra la eficiencia del enfoque.

Los datos de entrenamiento no se detallan en la información disponible, pero se menciona que el finetune se basa en 200 prompts diversos de roleplay con decodificación greedy a temperatura 0.0 para las evaluaciones. La innovación clave es que, al aislar el estilo en un solo tensor, este puede extraerse y aplicarse a cualquier instancia del modelo base sin necesidad de reentrenar. El tensor es bit a bit idéntico al presente en el modelo Gryphe/Gemma-4-31B-StyleTune original.

## Capacidades

- **Transferencia de estilo**: el tensor modifica la voz de escritura del modelo base, reduciendo clichés y mejorando la naturalidad en textos creativos y roleplay.
- **Reducción de clichés**: según el autor, reduce los clichés por 100 palabras de 1,23 a 0,52 (una reducción del 60 %).
- **Compatibilidad con cuantizaciones**: funciona con cualquier GGUF de Gemma 4 31B, independientemente del nivel de cuantización (Q4, Q5, Q8, etc.).
- **Compatibilidad con modelos abliterados**: soporta GGUFs abliterados o sin censura, aunque puede requerir una ruta delta si se producen bucles (según la documentación de la versión 12B).
- **Integración con el chat template nativo**: la plantilla de chat de Gemma 4 se aplica automáticamente al usar el tensor.
- **No requiere runtime adicional**: una vez aplicado, el modelo resultante se ejecuta con las herramientas habituales (llama.cpp, etc.) sin dependencias extra.

## Casos de uso

- **Roleplay y ficción interactiva**: el tensor mejora la calidad narrativa de un Gemma 4 31B GGUF, reduciendo frases repetitivas y clichés en diálogos y descripciones. Se aplica con `voice cast` y se ejecuta con `llama serve`.
- **Escritura creativa asistida**: para generar cuentos, guiones o novelas con un estilo más natural, el modelo resultante puede usarse en herramientas de escritura que llamen a la API de llama.cpp.
- **Chatbots con personalidad**: al integrar el tensor en un modelo base, los asistentes conversacionales pueden producir respuestas menos formularias y más variadas, mejorando la experiencia de usuario en aplicaciones de entretenimiento.
- **Ajuste de estilo en pipelines de generación**: desarrolladores que ya usan Gemma 4 31B en producción pueden aplicar el tensor para cambiar el tono de las salidas sin reentrenar ni cambiar de modelo.
- **Experimentos de investigación en estilística**: el tensor permite estudiar cómo una única capa influye en el estilo generativo, sirviendo como caso de estudio para técnicas de edición de modelos.
- **Optimización de recursos**: en lugar de descargar un modelo completo de 31B con finetune, se descarga un tensor de 2,8 GB y se aplica a un GGUF existente, ahorrando ancho de banda y almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque este repositorio no contiene un modelo completo, sino un tensor de estilo. Los datos disponibles provienen de la model card del autor y comparan la reducción de clichés y el vocabulario compartido entre las distintas versiones de StyleTune:

| Métrica | 31B (este repo) | 12B | 26B A4B V2 |
|---|---|---|---|
| Clichés / 100 palabras (base → StyleTune) | 1,23 → 0,52 | 1,050 → 0,463 | 1,141 → 0,551 |
| Reducción de clichés | −60 % | −56 % | −52 % |
| Vocabulario compartido de trigramas | 21,7 % | 16,8 % | 19,9 % |

Estos datos se obtuvieron con 200 prompts de roleplay y decodificación greedy a temperatura 0.0, según la model card de Gryphe. No hay información sobre latencia o throughput específicos de este tensor, ya que dependen del modelo base y del hardware.

## Requisitos de hardware

- **VRAM para el tensor**: el tensor en sí ocupa ~2,8 GB en BF16, pero no se ejecuta de forma aislada; se integra en un modelo Gemma 4 31B completo.
- **VRAM para el modelo resultante**: depende de la cuantización del GGUF base. Para una cuantización Q4_K_M, se estiman entre 18 y 20 GB de VRAM; para Q8, alrededor de 32 GB. Se recomienda una GPU con al menos 24 GB (RTX 3090/4090, A5000) para cuantizaciones bajas, y 48 GB o más (A6000, A100) para cuantizaciones altas.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con suficiente VRAM para el modelo base elegido.
- **Opciones de despliegue**: el modelo resultante se sirve con llama.cpp (`llama serve`), compatible con la API de OpenAI. También puede usarse con vLLM si se convierte a formato compatible, aunque el flujo documentado se centra en llama.cpp.
- **Latencia y throughput**: no disponibles; dependen del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

Este repositorio no es un modelo autónomo, sino un componente de estilo. La comparación más relevante es con las otras voces de la familia StyleTune y con el modelo base sin estilo:

| Modelo | Tamaño | Reducción de clichés | Vocabulario compartido | Licencia | Formato |
|---|---|---|---|---|---|
| **31B Voice (este repo)** | 2,8 GB (tensor) | −60 % | 21,7 % | Apache-2.0 | safetensors |
| 12B Voice | ~1 GB (tensor) | −56 % | 16,8 % | Apache-2.0 | safetensors |
| 26B A4B V2 Voice | ~2 GB (tensor) | −52 % | 19,9 % | Apache-2.0 | safetensors |
| Gemma 4 31B instruct (base) | ~18-32 GB (GGUF) | 0 % (referencia) | 100 % | Gemma Terms | GGUF |

La versión 31B ofrece la mayor reducción de clichés, pero requiere más VRAM que las versiones 12B o 26B. La elección depende del hardware disponible y del equilibrio deseado entre calidad de estilo y requisitos de memoria.

## Limitaciones y advertencias

- **No es un modelo independiente**: este repositorio solo contiene un tensor; sin un Gemma 4 31B GGUF base y la herramienta `voice`, no puede generar texto.
- **Compatibilidad restringida**: solo funciona con Gemma 4 31B; no es compatible con otros tamaños (9B, 12B, 26B) ni con otras arquitecturas.
- **Posibles bucles con modelos abliterados**: según la documentación de la versión 12B, algunos GGUFs abliterados pueden generar bucles; se requiere una ruta delta alternativa.
- **Idioma**: el modelo está etiquetado solo para inglés; su rendimiento en otros idiomas no está garantizado.
- **Licencia del modelo base**: aunque el tensor tiene licencia Apache-2.0, el modelo base Gemma 4 está sujeto a los términos de uso de Google (Gemma Terms). Antes de compartir modelos con el tensor aplicado, hay que revisar la licencia del modelo base.
- **Riesgo de alucinación y sesgos**: al ser un componente de estilo, no introduce nuevos sesgos, pero hereda los del modelo base. No se han realizado evaluaciones específicas de sesgo o alucinación para este tensor.
- **Datos de entrenamiento no publicados**: no se detalla el dataset de entrenamiento del finetune original, lo que limita la reproducibilidad y la auditoría.

## Enlaces

- Repositorio del tensor: https://huggingface.co/Wiself/gemma-4-31B-Styletune-Voice
- Modelo base StyleTune original: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Versión 12B Voice: https://huggingface.co/Wiself/gemma-4-12B-Styletune-Voice
- Versión 26B A4B V2 Voice: https://huggingface.co/Wiself/gemma-4-26B-A4B-Styletune-V2-Voice
- Versión 26B A4B QAT Voice: https://huggingface.co/Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice
- Fuente de los benchmarks (model card de Gryphe): https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
