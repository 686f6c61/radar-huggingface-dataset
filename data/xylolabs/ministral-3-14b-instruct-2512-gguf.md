# Xylolabs/Ministral-3-14B-Instruct-2512-GGUF

## Resumen

Ministral-3-14B-Instruct-2512-GGUF es una cuantización en formato GGUF del modelo Ministral-3-14B-Instruct-2512-BF16, desarrollado originalmente por Mistral AI y empaquetado para llama.cpp por Xylolabs. Se trata de un modelo de lenguaje de 13.506.073.600 parámetros (aproximadamente 13,5 mil millones) orientado a generación de texto e instrucciones, distribuido bajo licencia Apache 2.0. El repositorio contiene una única cuantización IQ4_XS generada con importance matrix, de 7,411 GB, pensada para ejecutarse en GPUs de consumo y estaciones de trabajo con memoria limitada.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Ministral 3 (14B) en hardware relativamente modesto, como una RTX 4090 de 24 GB, manteniendo una ventana de contexto de hasta 64K tokens según las recomendaciones del autor. El modelo base es de tipo text-only (la torre de visión no se incluye en los ficheros GGUF), lo que lo hace adecuado para tareas puramente lingüísticas y de razonamiento.

El paquete está verificado con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp y es compatible con backends CUDA, Metal y CPU. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es limitada en la model card del cuantizador, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la del modelo base Ministral-3-14B-Instruct-2512-BF16; detalles internos no disponibles) |
| Parametros totales | 13.506.073.600 (~13,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 256K tokens según hardware; 64K recomendado en GPUs de 24 GB (RTX 4090/3090) |
| Tipos de cuantizacion | IQ4_XS con importance matrix (único fichero publicado: `IQ4_XS-imat`, 7,411 GB) |
| Idiomas soportados | en (inglés), ko (coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantización, con tokenizer y chat template incluidos; sin torre de visión) |

## Arquitectura y entrenamiento

La model card del cuantizador no detalla la arquitectura interna del modelo base más allá de identificarlo como Ministral-3-14B-Instruct-2512-BF16, un transformer decoder-only de aproximadamente 13,5 mil millones de parámetros. No se especifican en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni si emplea técnicas como atención lineal o decodificación especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El trabajo técnico documentado en este repositorio es la cuantización: se ha generado una única variante IQ4_XS utilizando una importance matrix (`-imat`), lo que mejora la fidelidad respecto a una cuantización IQ4_XS estándar. Según la tabla de precisión del autor, esta cuantización IQ4_XS-imat presenta una divergencia KL media de 0,011683 en WikiText-2 y un 94,529% de acuerdo top-1 con el modelo BF16, frente a la IQ4_XS de Unsloth (0,011853 de KL y 94,397% top-1) y muy por encima de cuantizaciones de 3 bits o menos. El paquete se ha validado con llama.cpp en el commit indicado.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés y coreano.
- Razonamiento y respuesta a prompts de tipo instruct (el nombre del modelo indica variante Instruct).
- Ejecución local en llama.cpp con soporte de chat template original (flag `--jinja`).
- Compatible con `llama-cli` y `llama-server`, lo que permite exponer una API compatible con endpoints.
- Modelo text-only: no incluye torre de visión ni capacidades multimodales en este paquete.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés o coreano: el modelo puede gestionar diálogos multi-turno gracias a la ventana de contexto de 64K tokens recomendada en GPUs de 24 GB, lo que permite mantener historiales largos sin truncar.
- Generación de texto y redacción asistida en estaciones de trabajo sin conexión: al ejecutarse en llama.cpp sobre CPU, Metal o CUDA, es adecuado para entornos con requisitos de privacidad donde no se puede enviar texto a la nube.
- Procesamiento de documentos largos: con hasta 128K o 256K tokens de contexto en hardware de 48 GB o superior (H100, RTX 6000 Ada, Mac Studio), se pueden resumir o extraer información de contratos, informes o transcripciones extensas.
- Servicio de inferencia ligero con `llama-server`: el paquete expone una API compatible con endpoints, lo que permite desplegar un microservicio de generación de texto en una sola GPU de 24 GB.
- Prototipado e investigación en PLN: al ser Apache 2.0 y ejecutable en una RTX 4090, sirve para experimentar con prompts, evaluaciones y ajustes sin depender de infraestructura cloud.
- Traducción y asistencia bilingüe inglés-coreano: dentro de los idiomas declarados, puede emplearse para tareas de traducción o atención al cliente en coreano con contexto largo.
- Filtrado y clasificación de texto a escala moderada: con throughput razonable en una GPU de consumo, puede etiquetar o resumir lotes de documentos en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo BF16:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| IQ4_XS-imat (este repo) | 7,411 GB | 0,011683 | 94,529% | 0,011220 | 94,784% |
| Unsloth IQ4_XS | 7,432 GB | 0,011853 | 94,397% | 0,011744 | 94,892% |
| llama.cpp Q4_K_M | 8,239 GB | 0,011679 | 94,775% | 0,010556 | 95,049% |
| Unsloth UD-Q4_K_XL | 8,366 GB | 0,007897 | 95,809% | 0,006969 | 96,108% |
| llama.cpp Q8_0 (referencia) | 14,359 GB | 0,000402 | 98,799% | 0,000447 | 98,775% |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero IQ4_XS-imat ocupa 7,411 GB; el autor recomienda sumar el KV cache en f16 a la longitud de contexto deseada más 2 GB para el runtime, y que el total quede por debajo del 90% de la memoria disponible.
- GPU recomendadas según el autor:
  - RTX 4090 / RTX 3090 (24 GB): 64K de contexto.
  - RTX 5090 (32 GB): 64K de contexto.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): 128K de contexto.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (~192 GB), Mac Studio M5 Ultra (256 GB y 512 GB): 256K de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090 con 64K de contexto; también en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con backends CUDA, Metal o CPU, verificado en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-GGUF (este) | ~13,5B | 64K–256K según hardware | GGUF IQ4_XS-imat (7,4 GB) | Apache 2.0 | Hugging Face (Xylolabs) |
| Ministral-3-14B-Instruct-2512-BF16 (base) | ~13,5B | no disponible en la info | BF16 | Apache 2.0 | Hugging Face (mistralai) |
| Cuantizaciones Unsloth del mismo base (Q4_K_M, UD-Q4_K_XL, IQ4_XS) | ~13,5B | depende de la ejecución | GGUF (7,4–8,4 GB) | Apache 2.0 | Hugging Face (Unsloth) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo text-only: este paquete GGUF no incluye la torre de visión del modelo base; cualquier tarea multimodal queda fuera de alcance.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano u otros idiomas no está documentado.
- La cuantización IQ4_XS-imat introduce pérdida de precisión: 94,529% de acuerdo top-1 y KL de 0,011683 frente a BF16 en WikiText-2, lo que puede afectar a tareas sensibles a matices.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base en la model card del cuantizador.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar los términos del modelo base de Mistral AI para confirmar obligaciones adicionales.
- El contexto máximo práctico depende del hardware: 64K en GPUs de 24 GB y hasta 256K en GPUs de 80 GB o más; superar la memoria disponible provoca degradación o fallo.
- La única cuantización publicada es IQ4_XS-imat; no hay variantes de mayor o menor precisión en este repositorio.
- Verificado únicamente con un commit concreto de llama.cpp; otras versiones pueden requerir ajustes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Licencia: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF/blob/main/LICENSE
- llama.cpp (commit verificado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
