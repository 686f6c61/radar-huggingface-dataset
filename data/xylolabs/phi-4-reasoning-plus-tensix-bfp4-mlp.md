# Xylolabs/Phi-4-reasoning-plus-Tensix-BFP4-MLP

## Resumen

Phi-4-reasoning-plus-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-reasoning-plus, empaquetada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix mediante las librerías tt-metal y TT-NN. El modelo conserva la arquitectura y los pesos del original (14.659.507.200 parámetros) pero almacena las matrices de atención en formato block-floating-point BFP8 (8,5 bits por peso) y las matrices del MLP en BFP4 (4,5 bits por peso), dejando el resto de tensores (embeddings, LM head, normas) en BF16. El resultado son 6,02 bits por peso de media y 11,03 GB empaquetados en DRAM de dispositivo.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune, sino de un artefacto de despliegue específico para hardware Tenstorrent Blackhole, con un pipeline de cuantización propio (GPTQ con búsqueda de exponente por bloque para BFP4, round-to-nearest para BFP8) y verificación de empaquetado nativo en TT-NN. Para desarrolladores fuera del ecosistema Tenstorrent, el interés es limitado; para quienes despliegan inferencia en hardware Tensix, es una pieza relevante porque demuestra cuantización de 4 bits por bloque compatible con el empaquetado del acelerador.

El checkpoint se presenta en layout Llama (`LlamaForCausalLM`), con las matrices fusionadas q/k/v y gate-up del original ya separadas, y mantiene la plantilla de chat y los ajustes de muestreo recomendados por Microsoft. Los idiomas declarados se limitan al inglés, aunque la calibración de la cuantización incluyó Wikipedia en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4), exportado en layout Llama (`LlamaForCausalLM`) |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (atención q/k/v/o) y BFP4 (MLP gate/up/down); BF16 para embeddings, LM head y normas |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16 sobre rejilla BFP); repo de 29,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Phi-4-reasoning-plus de Microsoft: un transformer decoder-only denso de aproximadamente 14,7 mil millones de parámetros con 40 capas, del que no se especifican en la información disponible detalles adicionales sobre atención o composición del dataset original. Lo que sí documenta el autor es el proceso de cuantización: las 40 capas de atención (q, k, v, o) se almacenan en `bfloat8_b` con round-to-nearest, mientras que las proyecciones del MLP (gate, up, down) se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se guardan como valores BF16 sobre su rejilla BFP, de modo que TT-NN las empaqueta sin alterar sus valores.

La innovación técnica del export es el formato block-floating-point: cada bloque de pesos comparte un exponente, lo que permite 4,5 bits efectivos por peso en el MLP y 8,5 en la atención, con un promedio de 6,02 bits. El autor verifica que las 280 matrices pasan la rejilla, el empaquetado nativo TT-NN y el empaquetado como BFP8, comprobado con TT-NN 0.81.1 y el simulador Blackhole. El checkpoint está en layout Llama, con las matrices fusionadas del original separadas manteniendo los mismos valores. No se indica si hubo entrenamiento adicional, RLHF o DPO en este export: es exclusivamente un artefacto de cuantización (`base_model_relation: quantized`).

## Capacidades

- Generación de texto conversacional con plantilla de chat propia del modelo base.
- Modo de razonamiento: el modelo escribe un bloque de pensamiento (thinking) antes de la respuesta, según se describe en el quickstart.
- Razonamiento multi-paso y resolución de problemas, heredado de Phi-4-reasoning-plus.
- Capacidades matemáticas y de código propias del modelo base (no detalladas en la información disponible para este export).
- Tool calling / function calling: no disponible en la información proporcionada para este export.
- Capacidades multilingües: limitadas al inglés según el campo `language`; la calibración usó datos en coreano, pero no se declara soporte de ese idioma.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Despliegue de inferencia en hardware Tenstorrent Blackhole: el caso principal del artefacto; el checkpoint está pensado para cargarse en DRAM de dispositivo (11,03 GB de pesos más KV cache y buffers) mediante TT-NN, con empaquetado nativo verificado matriz a matriz.
- Evaluación de cuantización BFP4 en aceleradores: sirve como referencia reproducible para medir la pérdida de calidad de GPTQ con exponente por bloque frente a BF16 y frente a Q4_K_M de llama.cpp, usando la métrica KL documentada.
- Razonamiento asistido por lotes en inglés: consultas que requieren cadena de pensamiento explícita (matemáticas, lógica, problemas de varios pasos) pueden beneficiarse del bloque de thinking, con hasta 4.096 tokens nuevos en modo thinking según la evaluación del autor.
- Generación de respuestas conversacionales con contexto multi-turno: la plantilla de chat original y los ajustes de muestreo de Microsoft (temperatura 0,8, top_k 50, top_p 0,95) están preservados, lo que permite integrarlo en asistentes de texto en inglés.
- Investigación en compresión de modelos: el repo incluye `quant4.json` con el formato de cada proyección y scripts (`pack_tensix.py`, `verify_grid.py`) que permiten auditar el proceso de cuantización y reutilizar la metodología en otros modelos.
- Pruebas de integración con TT-NN: útil para validar versiones de TT-NN y del simulador Blackhole, ya que el autor documenta la versión exacta (0.81.1) con la que se verificó el empaquetado.
- Validación de pipelines de exportación de pesos: el flujo de separación de matrices fusionadas q/k/v y gate-up a layout Llama puede reutilizarse para portar otros checkpoints de Microsoft al ecosistema Tensix.

## Benchmarks y rendimiento

El autor publica una evaluación de fidelidad de la cuantización mediante divergencia KL sobre 14.528 posiciones puntuadas de una referencia de 16 secuencias en inglés y coreano, en forma raw y chat:

| Referencia o export | KL media | Normal correctas / 33 | Thinking correctas / 7 | Pérdidas contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 0 | 0 | — |
| Este export | 0,0211821047483 | 0 | 0 | 0 |
| Q4_K_M del mismo checkpoint original | 0,014722 | 0 | 0 | 0 |

El export cumple la regla relativa del proyecto (factor 1,5 respecto a Q4_K_M): su KL es 1,438806 veces la de Q4_K_M. Las tres ejecuciones de respuesta completadas puntúan cero, sin elementos elegibles corregidos respecto a BF16, por lo que el autor advierte que no hay evidencia de precisión de respuesta a partir de estas pérdidas. Las peticiones normales usaron 8.192 tokens nuevos y las de thinking 4.096. El suelo numérico BF16 de llama.cpp se sitúa en 0,000231. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,03 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers (el total no se especifica).
- Hardware objetivo: aceleradores Tenstorrent Tensix (Blackhole); el empaquetado se verificó con TT-NN 0.81.1 y el simulador Blackhole.
- GPU consumer: el quickstart de Hugging Face usa `device_map="auto"` con dtype bfloat16, pero con 14,66 mil millones de parámetros en BF16 el peso completo ronda los 29 GB, lo que excede GPUs consumer de 24 GB; no se documenta una ruta CUDA optimizada para este export.
- Opciones de despliegue: TT-NN para Tensix (ruta principal); transformers para carga en BF16; tt-transformers y tt-forge no se probaron con este checkpoint según el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-reasoning-plus-Tensix-BFP4-MLP (este) | 14,66 B | no disponible | BFP8 atención + BFP4 MLP, 6,02 bits/peso | MIT | Hugging Face, hardware Tensix |
| microsoft/Phi-4-reasoning-plus (BF16) | 14,66 B | no disponible | BF16 | MIT | Hugging Face |
| Q4_K_M de llama.cpp del mismo checkpoint | 14,66 B | no disponible | Q4_K_M (GGUF) | MIT | Hugging Face, CPU/GPU vía llama.cpp |

La comparación relevante es de fidelidad de cuantización: el Q4_K_M de llama.cpp obtiene KL 0,014722 frente a 0,021182 del export BFP4, es decir, el export Tensix pierde algo más de precisión pero se mantiene dentro de la regla relativa de 1,5 veces. No se dispone de comparaciones con otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Artefacto específico de hardware: diseñado y verificado para Tenstorrent Tensix; no hay evidencia de que funcione de forma óptima en CUDA, y tt-transformers y tt-forge no se probaron.
- Pérdida de calidad medible: KL media de 0,021 frente a 0 en BF16 y 0,0147 en Q4_K_M; la cuantización BFP4 del MLP introduce divergencia respecto al original.
- Sin evidencia de precisión de respuesta: las ejecuciones de evaluación puntúan cero en aciertos y el autor lo señala explícitamente; los datos de KL no demuestran exactitud.
- Idioma: solo inglés declarado; la calibración con Wikipedia en coreano no implica soporte de coreano en inferencia.
- Sesgos y alucinaciones: no documentados en la información proporcionada para este export; se heredan los del modelo base Phi-4-reasoning-plus.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado en producción.
- Contexto: la longitud de contexto no se especifica en la información disponible; conviene consultar la del modelo base antes de diseñar aplicaciones con ventanas largas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-plus
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-reasoning-plus-Tensix-BFP4-MLP/blob/main/LICENSE
- Repositorio de assets de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/main/assets
