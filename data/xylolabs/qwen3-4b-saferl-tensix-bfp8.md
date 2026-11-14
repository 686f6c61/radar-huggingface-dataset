# Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP8

## Resumen

Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3-4B-SafeRL, empaquetada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix mediante la pila de software tt-metal y TT-NN. El modelo conserva la arquitectura y el tokenizador del Qwen3-4B original, pero sustituye las 252 proyecciones declaradas del decodificador por tensores en formato block-floating-point bfloat8_b (8,5 bits por peso) obtenidos mediante GPTQ, mientras que el embedding y la cabeza de salida permanecen en BF16.

La relevancia de esta ficha radica en que se trata de un artefacto muy específico: no es un modelo nuevo ni un fine-tuning, sino un checkpoint optimizado para hardware no convencional. El objetivo es reducir la huella de memoria del modelo (aproximadamente 5,42 GB para los pesos del modelo de lenguaje, incluyendo ambas copias BF16 del embedding y la cabeza) y permitir su despliegue en dispositivos Tenstorrent con memoria DRAM limitada, manteniendo una fidelidad de distribución muy alta respecto al BF16 original (KL media de 0,001148298).

El modelo base Qwen3-4B-SafeRL pertenece a la familia Qwen3, con 4.411.424.256 parámetros totales según los safetensors del repositorio. La licencia es Apache 2.0 y los idiomas declarados son inglés y coreano. El checkpoint está pensado para Transformers 5.23.0 con PyTorch, y requiere pasos adicionales de empaquetado para su ejecución nativa en Tensix.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con proyecciones del decodificador en block-floating-point bfloat8_b |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | bfloat8_b (8,5 bits por peso) en 252 proyecciones; BF16 en 147 tensores (embedding, cabeza atada y otros); GPTQ con damping 0,1 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 en cuadrícula block-floating), con `quant4.json` e índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B-SafeRL original: un transformer decoder-only denso de aproximadamente 4.400 millones de parámetros. Esta exportación no modifica la topología ni el entrenamiento del modelo base; lo que cambia es la representación numérica de los pesos. Las 252 proyecciones declaradas del decodificador se almacenan como bfloat8_b en una cuadrícula block-floating-point, con 8,5 bits por peso, mientras que el embedding, la copia explícita de la cabeza atada y otros 147 tensores permanecen en BF16. El empaquetado total ocupa unos 5,42 GB (9,82 bits por peso almacenado); si se comparte la cabeza atada una sola vez, la cifra baja a unos 4,64 GB (9,226 bits por peso único). Las dos copias BF16 de embedding y cabeza son byte-idénticas.

La cuantización se realizó con GPTQ usando damping 0,1 y 65.536 tokens de WikiText-2 y de Wikipedia en coreano, lo que explica la cobertura bilingüe inglés-coreano. El autor declara que las 252 matrices pasan las comprobaciones de cuadrícula y de empaquetado nativo de TT-NN (el mismo formato que el empaquetado BFP8), y que el ejemplo de ejecución pasa en el simulador Blackhole con TT-NN 0.81.1. Se incluyen scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que validan cada matriz cuantizada, con opción de round-trip por DRAM del dispositivo. Es importante señalar que estas son comprobaciones de representación: tt-transformers y tt-forge no se verificaron con este checkpoint.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con la plantilla de chat original de Qwen3 conservada.
- Modo thinking configurable a través de la plantilla original (`enable_thinking=False` en el ejemplo del autor), heredado del modelo base.
- Razonamiento multi-turno y seguimiento de instrucciones, al conservar el comportamiento del Qwen3-4B-SafeRL.
- Capacidades de código y matemáticas heredadas del modelo base, aunque no se documentan métricas específicas en esta exportación.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- Ejecución en hardware Tenstorrent Tensix mediante TT-NN, con empaquetado nativo BFP8.
- No se documenta soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está diseñado para cargarse en DRAM de dispositivos Tensix con unos 5,42 GB para los pesos del modelo de lenguaje, más espacio para KV cache y buffers, lo que permite ejecutar un modelo de 4B en hardware con memoria limitada.
- Investigación en cuantización block-floating-point: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la representación BFP8 matriz a matriz y comparar la fidelidad frente al BF16 original mediante KL, útil para estudiar el impacto de la cuantización en la distribución de salida.
- Evaluación de fidelidad de distribuciones: con una KL media de 0,001148298 frente al BF16 y un suelo de referencia de 0,000316937 en llama.cpp BF16, el modelo sirve para comparar metodologías de cuantización (GPTQ BFP8 frente a Q4_K_M, con KL de 0,061407450).
- Asistentes conversacionales en inglés y coreano: al conservar el tokenizador y la plantilla de chat originales, puede integrarse en pipelines de Transformers para atención al cliente o asistentes internos en esos dos idiomas.
- Generación de texto con modo thinking desactivado: el ejemplo del autor muestra cómo forzar respuestas directas, adecuado para tareas de extracción o clasificación donde no se quiere cadena de razonamiento.
- Prototipado en simulador Blackhole: el ejemplo de ejecución validado en el simulador con TT-NN 0.81.1 permite desarrollar y depurar kernels antes de disponer de hardware físico.
- Servicio de inferencia compatible con TGI: los tags `text-generation-inference` y `endpoints_compatible` sugieren su uso en despliegues con endpoints estándar, aunque el autor no documenta latencia ni throughput.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 7 | — |
| Esta exportación | 0,001148298 | 27 | 7 | 0 |
| Q4_K_M emparejado | 0,061407450 | 29 | 7 | 0 |

La KL se calcula sobre 16.240 posiciones puntuadas con los mismos textos crudos y de chat en inglés y coreano, cuatro fragmentos de cada uno. El suelo de referencia en llama.cpp BF16 para el texto seleccionado es 0,000316937. La regla relativa 7 pasa con 0,018700 veces la KL de referencia, dentro del límite de 1,5 veces y con no más de una pérdida contada adicional. El autor indica explícitamente que no se reporta velocidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 5,42 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers; si se comparte la cabeza atada, unos 4,64 GB para pesos únicos.
- Hardware objetivo: aceleradores Tenstorrent Tensix con la pila tt-metal y TT-NN (ejemplo validado con TT-NN 0.81.1 en simulador Blackhole).
- GPU convencionales: no se documenta compatibilidad ni requisitos de VRAM para CUDA; el checkpoint está empaquetado para Tensix, no para GPU.
- Consumer GPU: no disponible en la información proporcionada.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch para carga en host; TT-NN para ejecución en dispositivo; scripts `pack_tensix.py` (con `--device` para round-trip DRAM) y `verify_grid.py` para verificación.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP8 | 4.411.424.256 | no disponible | BFP8 GPTQ (8,5 bits/peso) + BF16 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-4B-SafeRL (BF16) | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M emparejado (referencia del autor) | no disponible | no disponible | Q4_K_M | no disponible | no disponible |

La comparativa se limita a las referencias incluidas en la model card; no se dispone de datos de otros modelos de 4B comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está empaquetado específicamente para Tenstorrent Tensix; no es un artefacto listo para GPU CUDA ni para llama.cpp sin conversión adicional.
- tt-transformers y tt-forge no se verificaron con este checkpoint; las comprobaciones realizadas son de representación de pesos, no de inferencia completa en la pila de transformers de Tenstorrent.
- La cuantización introduce una desviación medible: KL media de 0,001148298 frente a 0 en BF16, con una pérdida de un acierto normal (27 frente a 28 sobre 33).
- Los idiomas declarados son solo inglés y coreano; el rendimiento en castellano no está documentado y no debe asumirse.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización; al heredar Qwen3-4B-SafeRL, arrastra los sesgos de su dataset de entrenamiento, no detallado en esta ficha.
- Riesgo de alucinación inherente a los modelos de 4B, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de cambios documentado en `NOTICE`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se reportan latencia ni throughput, por lo que no se puede avalar su uso en producción con requisitos de rendimiento estrictos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP8/blob/main/LICENSE
