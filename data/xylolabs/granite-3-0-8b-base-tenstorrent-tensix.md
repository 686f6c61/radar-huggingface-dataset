# Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix

## Resumen

Granite 3.0 8B Base para Tenstorrent Tensix es una versión cuantizada del modelo base `ibm-granite/granite-3.0-8b-base` de IBM, publicada por Xylolabs. El objetivo no es ofrecer un modelo nuevo, sino adaptar los pesos originales en formato BF16 a los formatos de bloque de coma flotante (block floating point, BFP) que emplean las NPU Tensix de Tenstorrent, en concreto las arquitecturas Wormhole y Blackhole. El repositorio incluye dos variantes en carpetas separadas: `bfp4/` (atención y MLP en bfloat4_b) y `bfp8/` (atención y MLP en bfloat8_b).

El modelo conserva la arquitectura y el tokenizador del Granite 3.0 8B Base original, un transformer decoder-only de 8.000 millones de parámetros entrenado por IBM. Al ser un modelo base sin plantilla de chat, su función es la continuación de texto, no el diálogo instruido. La relevancia actual reside en que permite ejecutar un modelo de 8B en hardware de inferencia especializado de Tenstorrent con una huella de memoria notablemente reducida (4,886 GB en BFP4 y 8,871 GB en BFP8 empaquetados), manteniendo una fidelidad medible frente a BF16 mediante divergencia KL.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial y la integración en pipelines propios. El repositorio incluye scripts de empaquetado y verificación (`pack_tensix.py` y `verify_grid.py`) para validar la conversión a tensores Tensix y comprobar la equivalencia numérica tras el round-trip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base IBM Granite 3.0 8B Base) |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (BFP4) y bfloat8_b (BFP8) para atención y MLP; resto en bf16/float32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con empaquetado Tensix (ttnn), carpetas `bfp4/` y `bfp8/` |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-3.0-8b-base`, un transformer decoder-only de 8B parámetros. Xylolabs no reentrena el modelo: aplica una cuantización post-entrenamiento orientada a los formatos de bloque de coma flotante de Tensix. En concreto, las capas de atención y MLP se convierten a `bfloat4_b` o `bfloat8_b`, mientras que el resto de tensores se mantienen en bf16 o float32. El proceso se documenta en el repositorio `tensix-bfp-gptq`, que da nombre a la técnica de cuantización empleada.

La validación de la cuantización se realiza mediante divergencia KL sobre 8.184 posiciones de texto en inglés y coreano, con un límite de KL media de 1,5 veces la referencia Q4_K_M de llama.cpp. Además, se evalúan 28 prompts de completación con tres ejemplos (three-shot). Los scripts `pack_tensix.py` y `verify_grid.py` permiten empaquetar matrices en tensores Tensix y verificar que los valores empaquetados coinciden con los originales tras el round-trip, incluyendo la opción `--device` para comprobar en hardware real.

## Capacidades

- Generación de texto y continuación de texto: es un modelo base, sin plantilla de chat, orientado a completar secuencias.
- Razonamiento y conocimiento general heredados del Granite 3.0 8B Base.
- Capacidad multilingüe limitada: la model card declara únicamente inglés (`en`), aunque la evaluación KL incluye texto en coreano.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, visión ni audio en la información disponible.
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante `ttnn`, con tipos `ttnn.bfloat4_b` y `ttnn.bfloat8_b`.

## Casos de uso

- Inferencia en hardware Tenstorrent: el caso principal es desplegar un modelo de 8B en NPU Wormhole o Blackhole, aprovechando los formatos BFP4/BFP8 para reducir la huella de memoria y ajustarse a la DRAM del dispositivo.
- Prototipado de cuantización BFP: los scripts de empaquetado y verificación permiten validar la conversión de matrices a tensores Tensix antes de integrarlas en un pipeline mayor.
- Generación de texto en inglés en entornos con presupuesto de memoria ajustado: la variante BFP4 ocupa 4,886 GB empaquetados, lo que la hace adecuada para despliegues con memoria limitada.
- Evaluación comparativa de fidelidad de cuantización: la tabla de KL frente a BF16 y Q4_K_M permite decidir entre BFP4 y BFP8 según el equilibrio entre tamaño y degradación aceptable.
- Investigación en aceleradores especializados: sirve como referencia para estudiar el comportamiento de modelos transformer en NPU con formatos de bloque, comparando la divergencia KL con cuantizaciones estándar de llama.cpp.
- Integración en pipelines de continuación de texto: al conservar el tokenizador y la configuración de EOS originales, puede sustituir al modelo BF16 en tareas de completación sin cambiar el preprocesado.
- Base para fine-tuning posterior sobre hardware Tensix: al ser un modelo base Apache 2.0, puede adaptarse a dominios concretos y volver a cuantizarse con el mismo flujo.

## Benchmarks y rendimiento

| Variante | Tamano empaquetado (GB) | KL media a BF16 | Respuestas (28 prompts) |
|---|---|---|---|
| `bfp4/` | 4,886 | 0,05162 | 19/28 |
| `bfp8/` | 8,871 | 0,00090 | 19/28 |
| BF16 (modelo base) | 16,34 | 0 | 19/28 |
| Q4_K_M (llama.cpp) | 4,943 | 0,04580 | 21/28 |

La KL se calcula sobre 8.184 posiciones de texto en inglés y coreano, con un límite de KL media de 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 4,886 GB para la variante BFP4 y 8,871 GB para BFP8, en formato empaquetado.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante `ttnn` y `tt-metal`.
- No se documenta compatibilidad con GPU convencionales (A100, H100, RTX 4090) en la información disponible; el ejemplo de ejecución con `transformers` usa `device_map="auto"` y `dtype="bfloat16"`, pero no se especifican requisitos de VRAM para ese modo.
- Opciones de despliegue: `ttnn` sobre Tensix; el repositorio incluye `pack_tensix.py` y `verify_grid.py`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estas variantes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix | 8B | no disponible | BFP4 / BFP8 | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| ibm-granite/granite-3.0-8b-base | 8B | no disponible | BF16 | Apache 2.0 | GPU/CPU genéricas |
| Q4_K_M de granite-3.0-8b-base (llama.cpp) | 8B | no disponible | Q4_K_M | Apache 2.0 | CPU/GPU genéricas |

La comparativa se limita al modelo base y a su cuantización Q4_K_M, que sirve como referencia de KL en la propia model card. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no está diseñado para diálogo instruido ni para seguir instrucciones complejas.
- Idioma declarado únicamente inglés; el rendimiento en otros idiomas no está garantizado, aunque la evaluación KL incluya coreano.
- La cuantización BFP4 introduce una divergencia KL media de 0,05162 frente a BF16, superior a la de BFP8 (0,00090) y ligeramente superior a Q4_K_M (0,04580); puede degradar la calidad en tareas sensibles.
- El número de respuestas correctas en los 28 prompts three-shot es 19/28 tanto en BFP4 como en BFP8 y en BF16, inferior al 21/28 de Q4_K_M, lo que sugiere que la cuantización BFP no mejora la precisión en esa evaluación concreta.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio del modelo base no incluye archivo LICENSE, por lo que el `LICENSE` del repo contiene el texto estándar y los cambios se listan en `NOTICE`.
- Dependencia de hardware Tensix: el flujo de ejecución principal requiere `ttnn` y `tt-metal`; el uso fuera de esa plataforma no está validado en la model card.
- Contexto máximo no documentado: conviene verificar la longitud de contexto del modelo base antes de usarlo en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-base
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix/blob/main/LICENSE
