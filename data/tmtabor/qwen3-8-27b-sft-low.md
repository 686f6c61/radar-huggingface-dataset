# tmtabor/Qwen3.8-27B-sft-low

## Resumen

tmtabor/Qwen3.8-27B-sft-low es un ajuste fino supervisado (SFT) del modelo base unsloth/Qwen3.8-27B, publicado por el usuario tmtabor en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura etiquetada como qwen3_5, 27.781.427.952 parametros totales (unos 27,8 mil millones) y pesos en formato safetensors. El repositorio ocupa 55,6 GB y la licencia declarada es Apache 2.0.

El modelo se presenta como una variante de bajo grado de ajuste ("low") sobre el checkpoint de Unsloth, entrenada con la libreria Unsloth y TRL de Hugging Face, que el autor indica que acelera el entrenamiento aproximadamente 2x. No hay model card detallada: el README es la plantilla generica de Unsloth, sin informacion sobre el dataset de ajuste, hiperparametros, numero de pasos ni evaluacion.

La relevancia es limitada y practica: sirve como ejemplo de pipeline de fine-tuning eficiente sobre un modelo Qwen de ~28B con capacidad de vision, pero al no haber benchmarks, datos de entrenamiento ni documentacion tecnica, debe tratarse como un checkpoint experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, tag del repo); detalles no disponibles |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; el repo hermano tmtabor/Qwen3.8-27B incluye GGUF y soporte llama.cpp |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como qwen3_5 y el pipeline es image-text-to-text, lo que implica un modelo multimodal con torre de vision y decoder de lenguaje, aunque no se detalla la composicion interna (atencion, capas, cabezas, tipo de vision encoder). El modelo base es unsloth/Qwen3.8-27B, un checkpoint de ~27,8B parametros distribuido por Unsloth.

El ajuste se realizo mediante SFT (supervised fine-tuning) con Unsloth y TRL, segun la model card. No se especifican el dataset, el numero de tokens de entrenamiento, la composicion de datos, ni si hubo RLHF, DPO o preferencias. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de Unsloth para acelerar el entrenamiento (~2x segun el autor). El sufijo "low" sugiere un ajuste de baja intensidad o pocas iteraciones, pero el autor no lo aclara.

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags conversational y text-generation-inference.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes o VQA, aunque no hay ejemplos ni evaluacion publicados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno basicos, aunque la ausencia de datos de contexto impide garantizar ventanas largas.
- Experimentacion con fine-tuning multimodal: sirve como punto de partida para reproducir el pipeline Unsloth + TRL sobre un Qwen de ~28B y comparar variantes de SFT.
- Tareas de image-text-to-text en laboratorio: descripcion de imagenes o respuesta a preguntas visuales en entornos de prueba, sin garantias de calidad por falta de evaluacion.
- Generacion de texto asistida en ingles para prototipos internos, siempre que se valide la salida con revision humana.
- Base para ablaciones de investigacion: comparar el efecto de un ajuste "low" frente al checkpoint original unsloth/Qwen3.8-27B en tareas concretas.
- Despliegue en infraestructura propia con TGI o transformers: el formato safetensors y el tag endpoints_compatible facilitan la integracion en pipelines de inferencia existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55-56 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se necesitan 60-70 GB o mas.
- Cuantizacion en 8 bits: alrededor de 28 GB de pesos, viable en una A100 40GB o H100 80GB con margen.
- Cuantizacion en 4 bits: alrededor de 14-16 GB de pesos, posible en una RTX 4090 (24 GB) o RTX 3090, con contexto limitado.
- GPU recomendadas: H100 80GB, A100 80GB o A100 40GB con cuantizacion; multiples RTX 4090 para BF16.
- Cabe en GPU de consumo: si, en 4 bits en RTX 4090/3090; en BF16 no cabe en una sola GPU de consumo.
- Opciones de despliegue: transformers, text-generation-inference (tag del repo), vLLM (no confirmado para esta variante), llama.cpp/Ollama solo si se dispone de pesos GGUF (el repo hermano tmtabor/Qwen3.8-27B los incluye; esta variante no los declara).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tmtabor/Qwen3.8-27B-sft-low | ~27,8B | no disponible | apache-2.0 | safetensors, 0 descargas | Ajuste SFT sin evaluacion publicada |
| unsloth/Qwen3.8-27B (base) | ~27,8B | no disponible | no disponible en esta ficha | safetensors, GGUF, llama.cpp | Checkpoint original de Unsloth |
| tmtabor/Qwen3.8-27B | ~28B | no disponible | no disponible en esta ficha | safetensors, GGUF | Variante del mismo autor con pesos GGUF |

La comparacion con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni ejemplos, ni metricas de calidad; no se puede afirmar que el ajuste mejore al modelo base.
- Model card generica: el README es la plantilla de Unsloth y no documenta dataset, hiperparametros ni proceso de entrenamiento.
- Solo ingles: el campo language declara unicamente en, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluado; al ser un SFT sobre datos no documentados, los sesgos heredados del base y del dataset son desconocidos.
- Contexto desconocido: no se especifica la ventana, por lo que no se debe asumir soporte de contexto largo.
- Licencia Apache 2.0 declarada, pero el modelo base es de Unsloth y no se detallan las condiciones de redistribucion del checkpoint original; conviene verificar antes de uso comercial.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en noviembre de 2026: no hay evidencia de uso en produccion ni mantenimiento.
- El sufijo "low" no esta explicado; podria implicar un ajuste parcial con comportamiento distinto al esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmtabor/Qwen3.8-27B-sft-low
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Repo hermano con GGUF: https://huggingface.co/tmtabor/Qwen3.8-27B
- Archivos del repo hermano: https://huggingface.co/tmtabor/Qwen3.8-27B/tree/main
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
