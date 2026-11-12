# zybian222/olmo3-7b-table1-oci-standard-sft-20261110t071802z

## Resumen

OLMo-3 7B oci standard SFT es un ajuste fino supervisado (SFT) del modelo base allenai/Olmo-3-1025-7B, desarrollado por el usuario zybian222 y publicado en Hugging Face. Se trata de un checkpoint derivado que aplica la receta de entrenamiento descrita como "TailSFT Table 1" sin el filtrado selectivo de datos (sin TailSFT filtering), utilizando como fuente el conjunto de datos nvidia/OpenCodeInstruct. El modelo conserva la licencia Apache 2.0 del modelo base y se distribuye en formato safetensors para su uso con la librería transformers.

Con 7.298.011.136 parámetros totales (aproximadamente 7,3 mil millones) y un tamaño de repositorio de 14,6 GB, el modelo está orientado a generación de texto y conversación. El autor indica explícitamente que no se trata del checkpoint oficial de los autores originales, sino de una reproducción aproximada de la receta de muestreo y descontaminación, y que los resultados de benchmarks son independientes (no incluidos en la model card).

La relevancia de esta ficha radica en que documenta un modelo derivado de la familia OLMo 3 de AllenAI, un ecosistema abierto de modelos de lenguaje con pesos, datos y recetas publicadas. Al ser un ajuste fino sobre OpenCodeInstruct, el modelo está especializado en tareas de código e instrucciones, aunque la información publicada por el autor es muy limitada y no incluye detalles sobre hiperparámetros completos, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de allenai/Olmo-3-1025-7B; no se detalla en la model card) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base allenai/Olmo-3-1025-7B, un transformer de aproximadamente 7,3 mil millones de parámetros. La model card de este checkpoint derivado no describe la arquitectura interna (número de capas, dimensiones de atención, tipo de atención, etc.), por lo que esos detalles deben consultarse en la documentación del modelo base de AllenAI.

El entrenamiento consistió en un ajuste fino supervisado completo (full standard SFT) siguiendo la receta de código denominada "TailSFT Table 1", sin aplicar el filtrado TailSFT. Se utilizaron cuatro GPUs con un tamaño de batch global de 32. El conjunto de datos fuente es nvidia/OpenCodeInstruct, y el autor remite a un archivo data_manifest.json para consultar la licencia y procedencia de los datos, así como las diferencias explícitas de preprocesamiento. El autor advierte que el muestreo y la descontaminación son aproximaciones a la receta descrita y que este no es el checkpoint de los autores originales. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation, conversational).
- Especialización en instrucciones de código, dado que el dataset de ajuste es nvidia/OpenCodeInstruct.
- Uso con la plantilla de chat y el tokenizador guardados en el repositorio (el autor recomienda explícitamente usar el tokenizer y el chat template guardados).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Generación asistida de código en entornos de desarrollo: el modelo, ajustado sobre OpenCodeInstruct, puede emplearse para autocompletar funciones, generar tests o sugerir refactorizaciones en un IDE o pipeline interno, siempre validando la salida con tests automáticos.
- Respuesta a preguntas técnicas sobre programación: al haber sido entrenado con instrucciones de código, es adecuado para un chatbot interno de documentación técnica o de soporte a desarrolladores.
- Prototipado rápido de asistentes conversacionales: su pipeline conversational y su plantilla de chat permiten integrarlo en aplicaciones de chat multi-turno mediante transformers.
- Generación de ejemplos y datos sintéticos de código: puede usarse para producir pares instrucción-respuesta que alimenten otros procesos de ajuste o evaluación, con revisión humana posterior.
- Experimentación académica sobre recetas de SFT: al documentar el autor la receta (TailSFT Table 1, batch global 32, cuatro GPUs), sirve como punto de comparación reproducible en estudios sobre filtrado de datos.
- Evaluación de modelos derivados de OLMo 3: útil para investigadores que quieran medir el impacto de ajustar sobre OpenCodeInstruct frente al modelo base allenai/Olmo-3-1025-7B.
- Despliegue en endpoints compatibles: el tag endpoints_compatible facilita su integración en infraestructuras de inferencia gestionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica en la model card que los resultados de benchmarks son independientes ("Benchmark results are separate") y no los incluye en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 29 GB solo para pesos, más memoria para activaciones y KV cache.
- VRAM estimada en bf16/fp16: aproximadamente 14,6 GB para pesos, más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7,3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3,7 GB para pesos.
- GPU recomendadas para bf16: A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) para contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits (aunque no se distribuyen pesos GGUF oficiales; habría que convertirlos).
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad de formato safetensors podría servir con vLLM o TGI, aunque no se documenta soporte explícito. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zybian222/olmo3-7b-table1-oci-standard-sft | 7,298 M | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste SFT sobre OpenCodeInstruct; sin benchmarks publicados |
| allenai/Olmo-3-1025-7B (modelo base) | ~7,3 B (según checkpoint derivado) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (AllenAI) | Modelo base oficial; referencia para comparar el efecto del SFT |
| Modelos de ~7B de código (familia no especificada) | ~7 B | No disponible | Variable | Variable | No se dispone de datos concretos en la información proporcionada para una comparación cuantitativa |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor advierte explícitamente que este no es el checkpoint de los autores originales y que el muestreo y la descontaminación son aproximaciones a la receta descrita.
- No se publican resultados de benchmarks, por lo que el rendimiento real es desconocido.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento adecuado fuera del inglés (idioma predominante probable en OpenCodeInstruct, aunque no confirmado).
- No se detalla la longitud de contexto, lo que limita la planificación de despliegues con ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B, especialmente en código: las salidas deben validarse con tests y revisión humana.
- Sesgos conocidos: no documentados por el autor; al derivar de un dataset de instrucciones de código, puede heredar sesgos de ese corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y procedencia de nvidia/OpenCodeInstruct en el data_manifest.json del repositorio antes de un uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que añade trabajo de conversión para despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/olmo3-7b-table1-oci-standard-sft-20261110t071802z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset fuente: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
