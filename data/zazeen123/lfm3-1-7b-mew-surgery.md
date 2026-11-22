# zazeen123/LFM3-1.7B-Mew-Surgery

## Resumen

LFM3-1.7B-Mew-Surgery es una edición quirúrgica del modelo LiquidAI/LFM3-1.7B publicada por el usuario zazeen123 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una intervención sin entrenamiento (*training-free model surgery*) sobre los pesos originales que reduce el vocabulario del tokenizador de 128.000 a 94.816 tokens, eliminando todos aquellos que solo pueden formar texto en escrituras distintas del tailandés y el inglés (japonés, chino, coreano, árabe, cirílico, devanagari, etc.). El tokenizador y la matriz de embeddings se renumeran en consecuencia; el resto de pesos permanece intacto. El resultado es un modelo un 3,9 % más pequeño (unos 130 MB menos en BF16) con 1.660.840.704 parámetros reales según el archivo safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica poco habitual (poda de vocabulario con verificación empírica token a token) que permite reducir el coste de despliegue sin degradar la calidad en los idiomas soportados. Por otro, el autor publica un GGUF de 4 bits (994 MB) cuantizado con una *importance matrix* calculada sobre texto tailandés e inglés, lo que corrige la fuerte pérdida de calidad que la cuantización estándar Q4_K_M provoca en tailandés. El modelo está pensado para conversación y generación de texto en tailandés e inglés, con soporte de *tool calling* y modo de razonamiento (*thinking*).

La arquitectura subyacente es la de LFM3 de Liquid AI, que se distribuye con código propio (`trust_remote_code=True`). El modelo se publica bajo la licencia LFM Open License v1.0 del modelo base, con fecha de creación en noviembre de 2026 y 645 descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid AI), transformer con código propio; requiere `trust_remote_code=True` |
| Parametros totales | 1.660.840.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF Q4_K_M con importance matrix (imat) |
| Idiomas soportados | tailandés (th) e inglés (en); resto de escrituras eliminadas del vocabulario |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (BF16, 3,2 GB) y GGUF (Q4_K_M imat, 994 MB) |

## Arquitectura y entrenamiento

El modelo no incorpora entrenamiento adicional. La intervención consiste en identificar los tokens del vocabulario de 128.000 entradas que solo pueden producir texto en escrituras no soportadas, eliminarlos, renumerar el tokenizador y recortar la matriz de embeddings en consecuencia. El resto de los pesos (atención, MLP, capas) se mantiene sin tocar respecto a LiquidAI/LFM3-1.7B. El autor verificó la equivalencia funcional sobre 8.000 caracteres de tailandés y 8.000 de inglés: la tokenización es idéntica, los estados ocultos coinciden (diferencia máxima 0,0), la predicción top-1 coincide en todos los tokens y la perplejidad sobre el vocabulario conservado coincide hasta 1e-6.

La segunda pieza técnica es la cuantización. El GGUF Q4_K_M se generó calculando previamente una *importance matrix* sobre texto tailandés e inglés, lo que reduce la pérdida de perplejidad en tailandés del +11,8 % (Q4_K_M estándar) al +1,3 % respecto a BF16. El autor también documenta que el GGUF conserva `add_bos_token = false` tal como venía del original; la plantilla de chat escribe el BOS por sí misma, de modo que el chat funciona correctamente, pero la generación cruda sin plantilla degrada mucho el tailandés (perplejidad 158,8 sin BOS frente a 32,6 con BOS en llama.cpp).

## Capacidades

- Generación de texto conversacional en tailandés e inglés con calidad equivalente al modelo base (tokenización y predicciones idénticas).
- Razonamiento matemático con modo *thinking* activable; el autor recomienda darle espacio (4.096 tokens superan a 2.048) y cerrar el razonamiento antes del límite para que responda.
- *Tool calling* / *function calling* en inglés y tailandés: 15/15 y 12/15 aciertos respectivamente, idéntico al original.
- Razonamiento multi-paso y respuestas escritas con cadena de pensamiento.
- Capacidades multilingües limitadas estrictamente a tailandés e inglés; cualquier otra escritura queda fuera del vocabulario.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en tailandés para atención al cliente: el modelo mantiene conversaciones multi-turno en tailandés con la misma calidad que el original, pero con un GGUF de 994 MB que cabe en GPUs de consumo y reduce coste de serving.
- Despliegue en el borde o en hardware modesto: el GGUF Q4_K_M con imatrix (994 MB) permite ejecutar el modelo en llama.cpp con `llama-server` en equipos sin GPU dedicada, manteniendo la calidad en tailandés gracias a la importance matrix.
- *Tool calling* bilingüe en agentes: con 15/15 en inglés y 12/15 en tailandés en las pruebas del autor, es adecuado para pipelines de agentes que necesiten invocar funciones en ambos idiomas.
- Tutoría de matemáticas en tailandés e inglés: los resultados en MGSM-Thai (78-85 % según configuración) y GSM8K (93-95 %) lo hacen viable para resolución de problemas paso a paso con modo *thinking*.
- Generación de código y texto técnico en inglés: al conservar intactos los pesos y el vocabulario inglés, mantiene el rendimiento del modelo base en tareas de generación de texto y código en inglés.
- Filtrado y clasificación de texto tailandés: la tokenización idéntica al original permite reutilizar pipelines existentes de clasificación o extracción de información en tailandés sin recalibrar.
- Investigación sobre poda de vocabulario: sirve como caso de estudio reproducible de *model surgery* con verificación empírica, útil para quienes quieran aplicar la misma técnica a otros modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor. Las comparaciones son frente al modelo original, ambos como GGUF Q8_0 con los mismos ajustes, salvo donde se indique. "+R / −W" indica aciertos y fallos emparejados (test de signos).

| Prueba | Este modelo | Original | +R / −W | Lectura |
|---|---|---|---|---|
| 2.000 preguntas tipo test en tailandés (MMLU-ProX dev, azar 10 %) | 24,1 % | 24,2 % | +8 / −10, p 0,81 | sin diferencia fiable |
| GSM8K, 200 respuestas escritas | 93 % | 92 % | +3 / −1 | sin diferencia fiable |
| MGSM-Thai, 100 respuestas escritas | 78 % | 81 % | +2 / −5 | sin diferencia fiable |
| Tool calls inglés / tailandés | 15/15, 12/15 | 15/15, 12/15 | +0 / −0 | idéntico |
| Tool calls japonés | 2/15 | 14/15 | +1 / −13 | peor (escritura eliminada) |
| Todas las pruebas sin japonés | — | — | +5 / −6, p 1,0 | sin diferencia fiable |

| GGUF | Tamaño | Perplejidad tailandés vs BF16 | 2.000 preguntas tailandés (MMLU-ProX dev) vs BF16 |
|---|---|---|---|
| Q4_K_M estándar | 994 MB | +11,8 % | peor: +62 / −103, p 0,0018 |
| Q4_K_M + imatrix (este archivo) | 994 MB | +1,3 % | sin diferencia fiable: +63 / −74, p 0,39 |
| BF16 GGUF vs transformers | 3,2 GB | +0,3 % | 21 de 2.000 respuestas difieren (+13 / −8) |

Sobre el presupuesto de razonamiento: 4.096 tokens superan a 2.048 en los mismos ítems (+21 / −3). En conjuntos de test reservados (MGSM-Thai 150, GSM8K 300), cerrar el *thinking* a 3.840 tokens y dejar responder mejora MGSM-Thai de 79 % a 85 % y GSM8K de 94 % a 95 % (+14 / −2, p 0,034 tras corrección). Con generación plana, 33 de 450 respuestas agotaron tokens aún pensando. Los *system prompts* no cambiaron la precisión de forma fiable.

## Requisitos de hardware

- VRAM estimada: ~3,4 GB en BF16 (3,2 GB de pesos más overhead de activaciones y KV cache); ~1,2-1,5 GB en Q4_K_M imat (994 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB para BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, L4, A10); para Q4_K_M basta con 2 GB, por lo que cabe en iGPU y en CPU.
- Cabe en GPU de consumo: sí, en todas las RTX modernas desde 4 GB; en Q4_K_M incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype="bfloat16"`; `llama.cpp` / `llama-server` con build reciente que soporte la arquitectura `lfm3` (`llama-server -m LFM3-1.7B-th-en-Q4_K_M-imat.gguf --jinja -c 8192`). No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Mew-Surgery (este) | 1.660.840.704 | no disponible | th, en | LFM Open License v1.0 | safetensors BF16, GGUF Q4_K_M imat |
| LiquidAI/LFM3-1.7B (base) | no disponible en la información | no disponible | multilingüe (incluye th, en y otras escrituras) | LFM Open License v1.0 | safetensors, GGUF |
| Alternativas de ~1,7B con foco en tailandés | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más relevante: misma licencia, mismos pesos salvo embeddings, 3,9 % menos de parámetros y mismo rendimiento en tailandés e inglés, con pérdida total de capacidad en el resto de escrituras. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo tailandés e inglés. El texto en escrituras eliminadas cae a bytes crudos que el modelo apenas vio; en pruebas con japonés respondió 12 de 15 veces que el mensaje "parece corrupto".
- El texto inglés que contiene nombres en escrituras eliminadas empeora aproximadamente un 1,6 % por carácter.
- El modelo piensa en inglés incluso cuando se le pregunta en tailandés, y algunas respuestas matemáticas largas entran en bucle sin terminar.
- El GGUF trae `add_bos_token = false`; la plantilla de chat escribe el BOS, pero la generación cruda sin plantilla degrada mucho el tailandés (perplejidad 158,8 sin BOS frente a 32,6 con BOS).
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales del modelo base.
- Sesgos: no documentados en la información proporcionada.
- Licencia LFM Open License v1.0: es necesario revisar los términos del archivo `LICENSE` del repositorio antes de uso comercial; la etiqueta de Hugging Face es `other`.
- En producción conviene fijar un presupuesto de razonamiento y cerrar el *thinking* antes del límite de tokens para evitar respuestas truncadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zazeen123/LFM3-1.7B-Mew-Surgery
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: `LICENSE` dentro del repositorio del modelo
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
