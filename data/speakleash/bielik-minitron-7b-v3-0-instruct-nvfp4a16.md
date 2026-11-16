# speakleash/Bielik-Minitron-7B-v3.0-Instruct-NVFP4A16

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-NVFP4A16 es una versión cuantizada del modelo instructivo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, el consorcio polaco detrás de la familia de modelos Bielik orientada al idioma polaco y a un amplio conjunto de lenguas europeas. Este checkpoint concreto aplica cuantización NVFP4 (pesos en FP4) manteniendo las activaciones en BF16, lo que reduce el espacio de pesos a aproximadamente 4,6 GB frente a los ~15 GB que ocuparía el modelo en BF16, facilitando su despliegue en GPUs con menos memoria.

El modelo resuelve el problema de servir un LLM de ~7.477 millones de parámetros con calidad cercana al original pero con requisitos de VRAM notablemente menores, manteniendo licencia Apache 2.0 y soporte para más de treinta idiomas, con especial énfasis en polaco e inglés. Es relevante ahora porque NVFP4 es un formato de cuantización de 4 bits nativo de las arquitecturas Blackwell de NVIDIA, y su disponibilidad en formato `compressed-tensors` permite integrarlo en stacks de inferencia modernos (vLLM, TensorRT-LLM) sin reentrenamiento.

La información pública disponible sobre esta variante es escasa: la model card se limita a indicar el modelo base, la revisión de origen y el formato de cuantización. Los datos de arquitectura, entrenamiento, benchmarks y contexto del modelo original no están incluidos en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`); detalles no disponibles |
| Parametros totales | 7.477.727.232 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos FP4) con activaciones BF16; formato `compressed-tensors`, etiquetado como 8-bit |
| Idiomas soportados | Multilingüe: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Bielik-Minitron, una línea de SpeakLeash derivada mediante destilación/pruning tipo Minitron a partir de modelos mayores de Bielik, según la convención de nombres del autor (este extremo no se detalla en la información proporcionada). El tag `llama` sugiere una arquitectura transformer decoder-only estándar, pero no se dispone de datos sobre número de capas, dimensiones ocultas, número de cabezas de atención ni tipo de atención (MHA/GQA).

Respecto al entrenamiento, no se dispone de información sobre volumen de tokens, composición del dataset, uso de RLHF/DPO/SFT ni innovaciones técnicas del modelo original. Esta variante concreta no reentrena el modelo: aplica cuantización post-entrenamiento en formato NVFP4 con activaciones BF16, preservando la revisión `5808ff03c95122d05cb860d11ba75b1efad98380` del checkpoint original.

## Capacidades

- Generación de texto en modo instructivo (chat), heredada del modelo base Bielik-Minitron-7B-v3.0-Instruct.
- Cobertura multilingüe amplia: más de treinta lenguas europeas, con foco en polaco e inglés.
- Razonamiento y respuesta a instrucciones: capacidades inferidas del carácter `Instruct` del modelo base; no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo de texto).
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Despliegue en GPUs de gama media con VRAM limitada: gracias a los pesos NVFP4 (~4,6 GB), el modelo puede servirse en tarjetas con 8-12 GB, habilitando prototipos de asistentes en hardware asequible.
- Procesamiento de texto en polaco para empresas y administraciones: el modelo base está optimizado para polaco, lo que lo hace adecuado para resúmenes, clasificación y generación de documentos en ese idioma.
- Asistentes multilingües para atención al cliente en Europa del Este y Central: la cobertura de lenguas como checo, eslovaco, esloveno, croata, serbio, búlgaro o ucraniano permite atender usuarios en su idioma sin modelos específicos por región.
- Generación y transformación de contenido editorial: redacción asistida, reescritura y adaptación de estilo en entornos con recursos de GPU limitados, donde la cuantización reduce costes de inferencia.
- Sistemas de extracción y estructuración de información: clasificación de documentos, etiquetado y resumen en pipelines batch donde el throughput por vatio importa más que la precisión máxima.
- Investigación en cuantización NVFP4: este checkpoint sirve como referencia para medir la degradación de calidad frente al modelo BF16 original en tareas instructivas multilingües.
- Evaluación comparativa de stacks de inferencia: útil para validar soporte de `compressed-tensors` y NVFP4 en vLLM o TensorRT-LLM sobre GPUs Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~4,6 GB (tamaño del repo con pesos NVFP4).
- VRAM total para inferencia: no disponible con precisión; depende de la longitud de contexto y del backend. Como referencia orientativa, con contexto moderado suele requerirse espacio adicional para KV cache y activaciones BF16.
- GPUs recomendadas: GPUs NVIDIA Blackwell (B200, RTX 50xx) para soporte nativo de NVFP4; en arquitecturas anteriores el formato puede requerir emulación o no ser compatible según el backend.
- ¿Cabe en consumer GPU? Sí, en términos de pesos, en GPUs con 8 GB o más, siempre que el runtime soporte NVFP4/`compressed-tensors`.
- Opciones de despliegue: vLLM y TensorRT-LLM son los candidatos naturales para `compressed-tensors`; llama.cpp/Ollama no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-NVFP4A16 | 7,48 B | no disponible | NVFP4 / BF16 act. | Apache 2.0 | Este modelo; requiere backend compatible con NVFP4 |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 7,48 B | no disponible | BF16 | Apache 2.0 | Referencia de calidad; mayor VRAM |
| Bielik 7B / 11B (familia SpeakLeash) | no disponible | no disponible | varias | Apache 2.0 | Modelos predecesores orientados a polaco |
| Llama 3.1 8B Instruct | 8 B | 128 K | BF16, GGUF, AWQ, etc. | Llama 3.1 Community License | Alternativa generalista; licencia no Apache |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de evaluaciones publicadas de sesgos, toxicidad o alucinación para esta variante cuantizada ni, en la información aportada, para el modelo base.
- La cuantización NVFP4 puede introducir degradación de calidad frente al modelo BF16 original; no se documenta la magnitud de esa pérdida.
- El soporte de NVFP4 está ligado a hardware y software específicos (GPUs Blackwell, runtimes con `compressed-tensors`); en otros entornos el modelo puede no cargar o rendir de forma subóptima.
- La longitud de contexto no está documentada; planificar despliegues con contexto conservador hasta verificarla.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales antes de uso comercial a gran escala.
- El modelo está orientado principalmente a polaco y lenguas europeas; el rendimiento en español, aunque el idioma figure en la lista, no está evaluado en la información disponible.
- Sin descargas ni likes registrados en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-NVFP4A16
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
