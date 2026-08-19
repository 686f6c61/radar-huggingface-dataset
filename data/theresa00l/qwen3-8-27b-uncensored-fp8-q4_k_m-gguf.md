# theresa00l/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF

## Resumen

El modelo `theresa00l/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF` es una conversión a formato GGUF del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-FP8`, un modelo de 27.320 millones de parámetros etiquetado como "uncensored" (abliterated) y cuantizado originalmente en FP8 de bloque. El autor, theresa00l, ha generado esta versión Q4_K_M mediante la herramienta GGUF-my-repo de ggml.ai, pensada para su ejecución con llama.cpp y derivados (llama-cli, llama-server, Ollama, etc.).

El modelo base pertenece a la familia Qwen3.8, con soporte declarado para inglés y chino, y capacidades de function calling, razonamiento y posible predicción multi-token (tag `mtp`). La etiqueta `image-text-to-text` sugiere que el modelo original podría aceptar entradas multimodales, aunque la conversión GGUF aquí presentada se centra en texto. Su relevancia actual radica en ser una opción sin restricciones de contenido (uncensored) para tareas de red-teaming, pruebas de seguridad y generación libre, con una licencia Apache 2.0 que permite uso comercial.

Al tratarse de una cuantización Q4_K_M, el archivo ocupa aproximadamente 16.8 GB, lo que lo hace ejecutable en GPUs de consumo con 16-24 GB de VRAM. No se dispone de información pública sobre el contexto máximo, el dataset de entrenamiento ni los benchmarks del modelo original, por lo que estos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este archivo); el modelo base usa FP8 de bloque (block-fp8) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3.8-27b-uncensored-fp8-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo base. Los tags de HuggingFace indican que pertenece a la serie Qwen3.8, que en otras variantes conocidas emplea una arquitectura transformer densa con atencion por ventanas deslizantes y mecanismos de reasoning explicito, pero esto no puede confirmarse para este checkpoint concreto. El termino "abliterated" sugiere que el modelo original fue sometido a una modificacion post-entrenamiento para eliminar los rechazos y restricciones de contenido tipicos de los modelos alineados, probablemente mediante tecnicas de eliminacion de direcciones en el espacio de activaciones (ablacion de representaciones).

El modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8` esta cuantizado en FP8 de bloque, una tecnica que reduce el peso de los tensores a 8 bits por bloques para ahorrar memoria y acelerar la inferencia. La conversion a GGUF Q4_K_M aplica una cuantizacion adicional de 4 bits con el esquema K-quant, que mantiene una buena relacion calidad-tamano. No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto libre y continuacion de secuencias, sin restricciones de contenido aparentes (uncensored).
- Razonamiento y resolucion de problemas, segun el tag `reasoning`.
- Soporte de function calling / tool calling, lo que permite integrar el modelo en agentes que invocan APIs o herramientas externas.
- Posible prediccion multi-token (tag `mtp`), que aceleraria la generacion al predecir varios tokens a la vez.
- Capacidad multimodal declarada en el pipeline (`image-text-to-text`), aunque la version GGUF puede no incluir el encoder de vision.
- Multilingue limitado a ingles y chino segun la model card.

## Casos de uso

- Red-teaming y pruebas de seguridad: el modelo puede emplearse para generar prompts adversariales o contenido que los modelos alineados rechazarian, permitiendo evaluar la robustez de sistemas de moderacion y filtros de contenido.
- Generacion de contenido creativo sin censura: escritura de ficcion, dialogos o material con tematicas sensibles donde un modelo estandar se negaria a responder.
- Agentes autonomos con function calling: al soportar tool calling, puede integrarse en pipelines de automatizacion que requieran llamar a APIs, bases de datos o servicios externos, por ejemplo en asistentes de codigo o sistemas de orquestacion.
- Razonamiento multi-paso en entornos de investigacion: su capacidad de reasoning permite experimentar con cadenas de pensamiento en tareas de logica o matematicas, aunque no se dispone de benchmarks que lo confirmen.
- Despliegue local en hardware de consumo: gracias a la cuantizacion Q4_K_M, puede ejecutarse en una GPU de 16-24 GB (p. ej., RTX 4090) mediante llama.cpp, lo que facilita prototipado y pruebas sin infraestructura cloud.
- Evaluacion de tecnicas de ablacion de seguridad: al ser un modelo abliterated, sirve como caso de estudio para investigar como se comportan los modelos tras eliminar la alineacion, comparando sus respuestas con las del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar para este checkpoint o su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 16.8 GB, por lo que se recomienda al menos 18-20 GB de VRAM para cargar el modelo con margen para el contexto y las activaciones. Con cuantizaciones mas agresivas (Q3_K_M o Q2_K) podria caber en 12-14 GB, pero no se ofrecen en este repositorio.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs profesionales con 24 GB o mas. En GPUs con 16 GB (p. ej., RTX 4080) podria funcionar con contexto reducido y offloading parcial a CPU.
- Compatibilidad con consumer GPU: si, en tarjetas de 24 GB o superiores. Para 16 GB es ajustado y puede requerir `--n-gpu-layers` parcial en llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama (si se importa el GGUF), LM Studio, o cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el proposito de este archivo.
- Latencia y throughput: no disponibles. Dependen del hardware, el contexto y el numero de tokens generados. En una RTX 4090, un modelo de 27B en Q4_K_M suele generar entre 20 y 40 tokens por segundo, pero es una estimacion orientativa no confirmada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo comparte categoria con otros Qwen de tamano similar (p. ej., Qwen2.5-32B) y con modelos "uncensored" como Dolphin o Nous Hermes, pero no hay datos de rendimiento ni de contexto que permitan una tabla comparativa fiable. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos: al ser un modelo sin alineacion, puede reproducir estereotipos, lenguaje ofensivo o contenido perjudicial sin filtro. No se ha documentado ninguna mitigacion.
- Riesgo de alucinacion: no se conocen tasas de alucinacion especificas, pero al carecer de alineacion y de datos de entrenamiento publicos, el riesgo es elevado en tareas factuales.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto soportada. El ejemplo de la model card usa `-c 2048`, lo que sugiere que el contexto por defecto es limitado, aunque podria ampliarse si el modelo base lo permite.
- Limitaciones de idioma: solo ingles y chino declarados. No se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el caracter "uncensored" puede entrar en conflicto con politicas de plataformas o requisitos legales de ciertos sectores (salud, finanzas, etc.).
- Caveat para produccion: al ser una cuantizacion Q4_K_M de un modelo FP8, puede haber perdida de calidad respecto al original. Ademas, la falta de benchmarks y de documentacion sobre el entrenamiento dificulta la evaluacion de su idoneidad para tareas criticas.

## Enlaces

- Repositorio HuggingFace: [theresa00l/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF](https://huggingface.co/theresa00l/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF)
- Modelo base: [orcarouter/Qwen3.8-27B-Uncensored-FP8](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8)
- Herramienta de conversion: [GGUF-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
- Repositorio de llama.cpp: [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
