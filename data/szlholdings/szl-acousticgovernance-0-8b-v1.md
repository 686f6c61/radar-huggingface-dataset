# SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1

## Resumen

SZL-AcousticGovernance-0.8B-v1 es un modelo de lenguaje y vision de 873 millones de parametros desarrollado por SZLHOLDINGS, obtenido mediante ajuste fino supervisado (SFT) del modelo SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen3.5. La model card publicada es minima: se limita a indicar el modelo base, la licencia Apache 2.0 y que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, sin detallar el corpus de ajuste ni los objetivos de la especializacion.

El pipeline declarado es image-text-to-text, lo que situa al modelo en la categoria de modelos multimodales pequenos capaces de procesar imagenes junto con texto. El nombre comercial sugiere un enfoque en gobernanza acustica o de senales, aunque no se aporta documentacion tecnica que lo confirme. El repositorio ocupa 1,8 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica una publicacion muy reciente y sin validacion externa.

Su interes actual es limitado pero relevante como ejemplo de ajuste fino eficiente de un modelo multimodal de menos de mil millones de parametros con licencia permisiva, desplegable en hardware de consumo. No obstante, la ausencia de benchmarks, de descripcion del dataset y de evaluaciones publicadas obliga a tratar cualquier uso en produccion con cautela y a validar el comportamiento empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5, segun tags); detalles no disponibles |
| Parametros totales | 873.438.784 (~0,87 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia qwen3_5, segun las etiquetas del repositorio, y se distribuye como un transformer multimodal con pipeline image-text-to-text. No se especifica en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documenta la longitud de contexto nativa.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, realizado con Unsloth y TRL, segun declara el autor. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la mezcla de datos multimodales empleada. La model card no incluye informacion sobre el proceso de alineacion ni sobre evaluaciones internas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5 ajustado.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text declarado).
- Ajuste especifico orientado, por el nombre del modelo, a tareas de gobernanza acustica o de senales; no hay documentacion que detalle el alcance real.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking, vision avanzada o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos en un entorno de desarrollo gracias a su tamano reducido, aunque la longitud de contexto no esta documentada y debe validarse.
- Experimentacion con modelos multimodales ligeros: util para investigadores que quieran probar pipelines image-text-to-text en GPU de consumo sin necesidad de infraestructura dedicada.
- Base para ajuste fino adicional: al estar bajo Apache 2.0 y derivar de Qwen3.5, sirve como punto de partida para especializaciones verticales mediante SFT con Unsloth o TRL.
- Clasificacion o extraccion de informacion a partir de documentos con imagenes (por ejemplo, tickets o formularios), siempre que se valide empiricamente la calidad del modelo en esa tarea.
- Evaluacion comparativa de tecnicas de ajuste eficiente: permite reproducir el flujo Unsloth + TRL en un modelo de menos de mil millones de parametros y medir el impacto del SFT.
- Despliegue en entornos con recursos limitados: su tamano permite inferencia en una unica GPU de consumo, lo que facilita pruebas de concepto y demos internas.
- Investigacion sobre gobernanza de senales acusticas: el nombre del modelo sugiere este dominio, pero no hay documentacion que confirme su idoneidad; cualquier uso requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1,7-1,8 GB solo para pesos, mas memoria para activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. Estimaciones basadas en el numero de parametros, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 6 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun tags, y herramientas compatibles con safetensors como vLLM o llama.cpp tras conversion a GGUF. Ollama requeriria conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| SZL-AcousticGovernance-0.8B-v1 | 0,87 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face |
| Qwen2.5-VL-3B-Instruct | 3 B | 32k (segun documentacion publica de Qwen) | Apache 2.0 | Si | Hugging Face |
| SmolVLM-500M-Instruct | 0,5 B | 8k (segun documentacion publica) | Apache 2.0 | Si | Hugging Face |
| PaliGemma-3B-mix-224 | 3 B | 512 tokens de imagen + texto | Gemma license | Si | Hugging Face |

La comparacion es orientativa: no se dispone de benchmarks del modelo de SZLHOLDINGS, por lo que no es posible contrastar rendimiento. Frente a SmolVLM-500M, el modelo aqui descrito es algo mayor en parametros pero carece de documentacion publica sobre contexto y evaluacion. Frente a Qwen2.5-VL-3B y PaliGemma, ofrece un tamano menor y licencia permisiva, a costa de una madurez y soporte mucho menores.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion publica: no hay evidencia empirica de su calidad en ninguna tarea.
- Model card practicamente vacia: no se documenta el dataset de ajuste, el contexto, la tokenizacion ni el proceso de alineacion.
- Riesgo elevado de alucinacion y de comportamiento impredecible fuera del dominio de ajuste, al desconocerse este.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- El nombre sugiere un dominio concreto (gobernanza acustica) sin documentacion que lo respalde; no debe asumirse esa especializacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- Sin descargas ni interacciones registradas: no existe comunidad ni retroalimentacion que permita detectar problemas conocidos.
- Posible herencia de sesgos del modelo base Qwen3.5 y del corpus de ajuste, no documentados.
- No recomendable para produccion sin una fase previa de evaluacion y, preferiblemente, de ajuste adicional sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-AcousticGovernance-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
