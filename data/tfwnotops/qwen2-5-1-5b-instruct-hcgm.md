# tfwnotops/Qwen2.5-1.5B-Instruct-HCGM

# Qwen2.5-1.5B-Instruct-HCGM

## Resumen

Qwen2.5-1.5B-Instruct-HCGM es un paquete de inferencia derivado de Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario tfwnotops bajo la librería `holo-surgery`. No es un fine-tune ni un modelo entrenado desde cero: es el resultado de pasar el checkpoint original por la Holographic Causal Graph Machine (HCGM), un compilador que almacena cada neurona SwiGLU como una hiperarista no lineal exacta en páginas de códigos de 6 bits y genera un bundle *source-free* (`holo-source-free-qwen/v1`) que no necesita el checkpoint original, ni PyTorch, ni caché KV. El bundle ocupa 1,79 GB y la licencia es Apache 2.0.

El problema que aborda es el coste de memoria de la caché KV en conversaciones largas. En lugar de almacenar claves y valores token a token, la atención sobre el pasado se resuelve mediante *holographic Ward recall*: por capa y cabeza clave-valor se mantiene una frontera exacta de los últimos 128 tokens, 383 átomos (recuento, clave media, valor medio) fusionados por el criterio de mínima varianza de Ward y un átomo fijado para el primer token. El estado completo de una conversación es de 14,4 MiB sea cual sea su longitud, frente a los 28 KiB adicionales por token que crece la caché del modelo de origen.

Su relevancia actual es doble: por un lado, explora alternativas a la caché KV en runtime; por otro, demuestra un despliegue real sobre Apple Neural Engine, con 64 conversaciones compartiendo una misma pasada y 470 tokens/s en un Mac mini M4. El repositorio declara 0 descargas y 1 like, por lo que debe tratarse como material de investigación sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) recompilado como grafo causal holográfico; atención con recall de Ward en lugar de caché KV |
| Parametros totales | 1.500 millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Longitud de contexto | no disponible como cifra oficial; se documentan evaluaciones hasta 8.192 tokens y recall exacto hasta 512 tokens |
| Tipos de cuantizacion | Pesos SwiGLU en códigos de 6 bits con una escala BF16 por cada 16 pesos; núcleos de atención y embedding atado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle propietario `holo-source-free-qwen/v1` (grafo causal C0 sin pérdida); no safetensors ni GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste: HCGM es un compilador de inferencia. Cada neurona SwiGLU del modelo base se almacena como la hiperarista no lineal exacta `d_j · SiLU(g_jᵀx) · (u_jᵀx)` en páginas de códigos de 6 bits, con una única escala BF16 por cada 16 pesos. El embedding atado se conserva como un grafo léxico con índice SimHash y los núcleos de atención permanecen en BF16. El resultado son 1,79 GB de artefacto frente a los 1,8 GB del repositorio completo, y no se requiere el checkpoint original para ejecutarlo.

La innovación principal está en la capa de atención: en lugar de una caché KV creciente, se usa *holographic Ward recall*, que mantiene por capa y cabeza clave-valor una frontera exacta de los últimos 128 tokens más 383 átomos (recuento, clave media, valor medio) fusionados por el criterio de mínima varianza de Ward, con un átomo fijado que representa el primer token. Según el autor, el recall es exacto mientras el contexto cabe en las 512 filas y se degrada de forma gradual a partir de ahí. El entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se documenta en la model card de este bundle.

## Capacidades

- Generación de texto conversacional (`text-generation` como pipeline declarado) basada en Qwen2.5-1.5B-Instruct.
- Razonamiento, código y matemáticas en la medida del modelo base; la única evaluación específica publicada es HumanEval.
- Estado constante de 14,4 MiB por conversación, independiente de la longitud del historial.
- Recall exacto del contexto hasta 512 tokens; recuperación aproximada por encima de ese umbral.
- Ejecución sobre Apple Neural Engine con 64 conversaciones servidas en una sola pasada.
- Modo *Compute Once* (`.mrail`): responde contextos ya vistos en milisegundos con la salida propia del modelo, restaura estados exactos y genera borradores que luego se verifican de forma exacta.
- Funcionamiento sin caché KV y sin PyTorch en tiempo de ejecución.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el pipeline declarado es solo de texto.

## Casos de uso

- Asistentes conversacionales de larga duración en dispositivos Apple: el estado fijo de 14,4 MiB permite mantener historiales extensos sin que el consumo de memoria crezca con cada turno, algo crítico en Mac con Apple Silicon y, potencialmente, en dispositivos con Neural Engine.
- Servicio multiusuario de bajo coste en un Mac mini M4: al compartir 64 conversaciones en una misma pasada a 470 tokens/s, resulta adecuado para prototipos de atención al cliente o bots internos con decenas de sesiones concurrentes.
- Generación de código asistida: con un pass@1 de 99/164 (60,4 %) en HumanEval bajo plantilla de chat y 384 tokens nuevos, puede emplearse en autocompletado de funciones o generación de parches, siempre con revisión humana.
- Caché de respuestas para cargas repetitivas: el mecanismo *Compute Once* resuelve en milisegundos cualquier contexto ya registrado en el mapa `.mrail`, útil en FAQ, documentación técnica o prompts de sistema recurrentes.
- Investigación sobre alternativas a la caché KV: los scripts de `eval/` y los tres artículos permiten reproducir la comparación frente al modelo fp32 de origen y medir la degradación por longitud de contexto.
- Despliegue *on-device* con requisitos de privacidad: al ser un bundle *source-free* y no requerir framework de entrenamiento, encaja en escenarios donde los datos no deben salir del equipo y el modelo debe ejecutarse con recursos acotados.
- Evaluación comparativa de runtimes de inferencia: sirve como banco de pruebas para medir identidad de tokens (99,97 % frente a la referencia fp32) entre distintos backends.

## Benchmarks y rendimiento

Datos publicados en la model card. Comparan el modelo de origen en fp32 con el runtime de referencia fp32 del bundle, con el mismo tokenizador.

| Metrica | Qwen2.5-1.5B-Instruct | HCGM | Diferencia |
|---|---:|---:|---:|
| WikiText-2 test, 32 × 512 tokens (nat/token) | 2,4454 | 2,4493 | +0,0038 |
| HumanEval, programas de referencia (nat/token) | 0,9432 | 0,9429 | −0,0003 |
| Acuerdo top-1 con el origen, WikiText-2 / código | – | 96,7 % / 98,5 % | – |
| WikiText-2, 8 × 2.048 tokens (nat/token) | 2,1300 | 2,1615 | +0,031 |
| WikiText-2, 6 × 4.096 tokens (nat/token) | 2,1202 | 2,1997 | +0,080 |
| WikiText-2, 4 × 8.192 tokens (nat/token) | 2,0928 | 2,2374 | +0,145 |
| HumanEval pass@1 (greedy, plantilla de chat, 384 tokens nuevos) | 89/164 (54,3 %) | 99/164 (60,4 %) | – |

Las respuestas de HumanEval del HCGM se generaron con el runtime de Neural Engine (64 conversaciones por pasada) y cada token se verificó contra el runtime de referencia fp32 por *teacher forcing*: 30.268 de 30.278 tokens idénticos (99,97 %); en las diez posiciones restantes la referencia prefiere su propio token por un margen máximo de 0,03 nat. No se han publicado otros benchmarks (MMLU, GSM8K, MT-Bench, etc.) en la información disponible.

## Requisitos de hardware

- Pesos: 1,79 GB de bundle (1,8 GB de repositorio), por lo que caben sin problema en GPUs de consumo (RTX 3060 12 GB, RTX 4070/4090, Apple Silicon unificado).
- Estado por conversación: 14,4 MiB constantes; 64 conversaciones simultáneas equivalen a unos 922 MiB adicionales.
- Hardware de referencia documentado: Apple Neural Engine de un Mac mini M4, con 470 tokens/s y 64 conversaciones por pasada.
- GPUs recomendadas: no disponibles; la model card no documenta ejecución sobre A100, H100 u otras GPUs, ya que el runtime descrito está orientado a ANE.
- Opciones de despliegue: la librería `holo-surgery` y el runtime propio del bundle. No hay mención de compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- VRAM estimada para inferencia: no disponible de forma explícita; el peso del bundle (1,79 GB) es una cota inferior razonable.
- Latencia y throughput: 470 tokens/s en Mac mini M4 con 64 conversaciones por pasada (dato del autor). No se documenta latencia por token ni throughput en otras plataformas.
- Precisión del runtime ANE: 99,97 % de identidad de tokens frente al runtime fp32 de referencia.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo de origen. No se incluyen datos de benchmark de otros modelos de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-HCGM | 1.500 M | no disponible (evaluado hasta 8.192 tokens) | WikiText-2: 2,4493 nat/token a 512; HumanEval pass@1 60,4 % | Apache 2.0 | HF, 0 descargas, 1 like |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | no disponible en esta información | WikiText-2: 2,4454 nat/token a 512; HumanEval pass@1 54,3 % | Apache 2.0 | Modelo base público |
| Otras alternativas de 1-2 B (Llama 3.2 1B, Gemma 2 2B, etc.) | – | – | no disponible | – | – |

La comparativa relevante no es de calidad bruta, sino de formato de ejecución: HCGM intercambia una pérdida mínima de log-probabilidad (+0,0038 nat/token a 512 tokens) por un estado de tamaño constante y la eliminación de la caché KV.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 1 like en el momento de la consulta, sin validación independiente de los resultados.
- El pass@1 de HumanEval mejora respecto al modelo de origen (60,4 % frente a 54,3 %); una recompilación de inferencia no debería aumentar la calidad, por lo que este dato requiere verificación externa antes de tomarse como referencia.
- Degradación del recall fuera de 512 tokens: +0,031 nat/token a 2.048, +0,080 a 4.096 y +0,145 a 8.192; en contextos largos la fidelidad respecto al modelo original disminuye de forma acumulativa.
- Idiomas soportados: no disponibles en la model card; se desconoce la cobertura multilingüe efectiva del bundle compilado.
- Formato propietario: depende de la librería `holo-surgery` y del runtime del autor; no es interoperable con safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- La licencia del bundle es Apache 2.0, pero el uso comercial está sujeto también a los términos del modelo base Qwen2.5-1.5B-Instruct.
- Alucinación: heredada de un modelo base de 1.500 millones de parámetros, con conocimiento factual limitado y mayor propensión a inventar detalles en dominios especializados.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad.
- La fecha de creación indicada en el repositorio (27/09/2026) es posterior a la fecha actual, lo que sugiere un metadato incorrecto o un artefacto de la plataforma.
- La model card no documenta el corpus de entrenamiento del modelo base ni si hubo RLHF o DPO, por lo que la trazabilidad de datos es incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfwnotops/Qwen2.5-1.5B-Instruct-HCGM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del bundle: https://huggingface.co/tfwnotops/Qwen2.5-1.5B-Instruct-HCGM/blob/main/LICENSE
- Paper HCGM: https://doi.org/10.13140/RG.2.2.28206.68167
- Paper No GPU, No KV Cache: https://doi.org/10.13140/RG.2.2.31562.12484
- Paper Compute Once: https://doi.org/10.13140/RG.2.2.18140.35202
- Repositorio GitHub mrail: https://github.com/DT-Foss/mrail
