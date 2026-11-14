# Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-reasoning-plus, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila de software TT-Metal y TT-NN. El modelo conserva la arquitectura y los pesos del Phi-4-reasoning-plus original (14.659.507.200 parámetros), pero almacena las proyecciones de atención en formato de coma flotante por bloques bfloat8_b y las capas MLP en bfloat4_b, lo que reduce el peso en memoria del modelo de lenguaje a aproximadamente 11,03 GB empaquetados.

El problema que resuelve es la brecha entre un checkpoint de razonamiento de alta calidad entrenado en BF16 y el hardware Tensix, que trabaja de forma nativa con formatos de bloque (BFP). En lugar de delegar la conversión en tiempo de carga, esta exportación preempaqueta cada matriz sobre su rejilla BFP de destino, de modo que TT-NN la empaqueta sin alterar sus valores. El resultado es un checkpoint que puede cargarse directamente en dispositivos Tenstorrent con un consumo de memoria sustancialmente menor que el del modelo original en BF16.

La relevancia actual radica en que permite desplegar un modelo de razonamiento con modo de pensamiento explícito (thinking block) sobre hardware alternativo a las GPU convencionales, manteniendo una divergencia KL controlada frente al original. El checkpoint se distribuye bajo licencia MIT, está orientado a inglés y se empaqueta en el layout LlamaForCausalLM para maximizar la compatibilidad con transformers y TT-NN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4), exportado en layout LlamaForCausalLM |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en atención q, k, v, o; BFP4 (bfloat4_b) en MLP gate, up, down; BF16 en LM head, embeddings y normas; 6,02 bits por peso de media |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16 sobre rejilla BFP), repo de 29,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Phi-4-reasoning-plus de Microsoft, un transformer decoder-only con 40 capas. La exportación no altera la topología: mantiene las 40 capas con atención y MLP completos, y reescribe las matrices fusionadas q, k, v y gate-up del checkpoint original en matrices separadas con los mismos valores, para encajar en el layout LlamaForCausalLM. Cada una de las 280 matrices del modelo se almacena en el formato BFP que TT-NN espera en el dispositivo.

El proceso de cuantización es específico por tipo de tensor. Las proyecciones de atención (q, k, v, o) se convierten a bfloat8_b mediante redondeo al más cercano, con 8,5 bits por peso. Las proyecciones MLP (gate, up, down) se cuantizan a bfloat4_b con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, con 4,5 bits por peso. El resto de tensores (LM head, embeddings, normas) permanece en BF16. Los valores cuantizados se guardan como BF16 sobre su rejilla BFP, de forma que el empaquetado nativo de TT-NN no modifica el valor almacenado. No se dispone de información sobre el dataset de entrenamiento original ni sobre las fases de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia del modelo base.
- Razonamiento explícito: el modelo escribe un bloque de pensamiento (thinking block) antes de la respuesta final.
- Razonamiento multi-paso y resolución de problemas complejos, heredado de Phi-4-reasoning-plus.
- Generación de código y matemáticas, como parte de las capacidades del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Multilingüismo limitado: la model card declara únicamente inglés, aunque la calibración de cuantización incluyó Wikipedia en coreano.
- Ejecución sobre hardware Tenstorrent Tensix mediante TT-NN, con empaquetado nativo de matrices BFP.

## Casos de uso

- Razonamiento matemático asistido: el modelo genera un bloque de pensamiento antes de la respuesta, lo que permite auditar la cadena de razonamiento en problemas de varios pasos y usar la salida final como respuesta verificable.
- Generación de código con explicación: la fase de pensamiento permite al modelo planificar la solución antes de emitir el código, útil en entornos donde se requiere justificar decisiones de diseño.
- Despliegue sobre aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y consume unos 11,03 GB de memoria de dispositivo para los pesos del modelo de lenguaje, lo que lo hace viable en tarjetas Tensix con DRAM suficiente.
- Investigación en cuantización BFP: sirve como referencia reproducible para estudiar el impacto de BFP4 en MLP y BFP8 en atención frente al BF16 original, con métricas KL publicadas.
- Evaluación comparativa de formatos: permite comparar el comportamiento de un mismo modelo en BF16, Q4_K_M (llama.cpp) y BFP4/BFP8 (Tensix) sobre el mismo conjunto de referencia.
- Prototipado de asistentes conversacionales en inglés: la plantilla de chat y los parámetros de muestreo recomendados (temperatura 0,8, top_k 50, top_p 0,95) permiten integrarlo rápidamente en pipelines de transformers.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin pérdida de valor, útil en control de calidad de despliegues.

## Benchmarks y rendimiento

| Referencia o exportación | KL media | Normal correctas / 33 | Thinking correctas / 7 | Pérdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 0 | 0 | — |
| Esta exportación | 0,0211821047483 | 0 | 0 | 0 |
| Q4_K_M del mismo checkpoint original | 0,014722 | 0 | 0 | 0 |

La KL se calcula sobre las 14.528 posiciones puntuadas de la referencia guardada de 16 secuencias en inglés y coreano, en formas raw y chat, con referencia IEEE explícita. El suelo numérico BF16 de llama.cpp es 0,000231. La puerta relativa regla-7 del proyecto se cumple por KL: la exportación queda en 1,438806 veces la KL de Q4_K_M, dentro del umbral de 1,5 veces. Las tres ejecuciones de respuesta completadas puntúan cero, sin elementos elegibles correctos en BF16, por lo que no hay evidencia de precisión de respuesta a partir de estas métricas. Las peticiones normales conservaron 8.192 tokens nuevos y las de pensamiento 4.096.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,03 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: aceleradores Tenstorrent Tensix con TT-NN 0.81.1; verificado con el simulador Blackhole.
- GPU convencionales: no disponible en la información proporcionada; el checkpoint está pensado para Tensix.
- Despliegue: TT-NN / TT-Metal; también cargable con transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- tt-transformers y tt-forge: no se ejecutaron con este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4-MLP (esta ficha) | 14.659.507.200 | no disponible | BFP4 MLP / BFP8 atención | MIT | Hugging Face, 27 descargas |
| microsoft/Phi-4-reasoning-plus (BF16 original) | 14.659.507.200 | no disponible | BF16 | MIT | Hugging Face |
| Q4_K_M del mismo checkpoint original | 14.659.507.200 | no disponible | GGUF Q4_K_M | MIT | llama.cpp |

La comparación de rendimiento entre estas tres variantes se limita a la divergencia KL frente al BF16 original: 0 para el original, 0,014722 para Q4_K_M y 0,021182 para esta exportación. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Limitaciones y advertencias

- El modelo declara únicamente inglés; el rendimiento en otros idiomas no está garantizado pese a la calibración con Wikipedia en coreano.
- Riesgo de alucinación inherente al modelo base; la fase de pensamiento no elimina respuestas incorrectas.
- Las métricas de evaluación publicadas no aportan evidencia de precisión de respuesta: las tres ejecuciones completadas puntúan cero y no hay elementos elegibles correctos en BF16.
- La divergencia KL frente al BF16 original es aproximadamente 1,44 veces la de Q4_K_M, cerca del umbral de 1,5 veces fijado por el proyecto.
- El checkpoint está empaquetado para TT-NN; tt-transformers y tt-forge no se han probado con él.
- Requiere TT-NN 0.81.1 y hardware Tensix o el simulador Blackhole para el flujo de despliegue previsto.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base de Microsoft.
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.
- Longitud de contexto: no disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-plus
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
