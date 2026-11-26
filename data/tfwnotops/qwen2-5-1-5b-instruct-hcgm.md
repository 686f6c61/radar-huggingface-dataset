# tfwnotops/Qwen2.5-1.5B-Instruct-HCGM

## Resumen
Qwen2.5-1.5B-Instruct-HCGM es un artefacto derivado de Qwen/Qwen2.5-1.5B-Instruct publicado por el usuario tfwnotops. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una compilacion del checkpoint original mediante la herramienta Holographic Causal Graph Machine (HCGM), que lo transforma en un bundle "source-free" (`holo-source-free-qwen/v1`) ejecutable sin el checkpoint original, sin PyTorch y sin KV cache. El resultado ocupa 1,79 GB en el repositorio (1,8 GB reportados por Hugging Face).

La propuesta tecnica central es sustituir la cache de clave-valor por un estado constante de 14,4 MiB independiente de la longitud de la conversacion. Para ello representa cada neurona SwiGLU como una hiperarista no lineal exacta almacenada en paginas de codigos de 6 bits con una escala BF16 por cada 16 pesos, y la atencion sobre el pasado se resuelve mediante "holographic Ward recall": una frontera exacta de los ultimos 128 tokens, 383 atomos (recuento, clave media, valor medio) fusionados por el criterio de minima varianza de Ward y un atomo fijado para el primer token.

Su relevancia es de nicho pero concreta: promete inferencia de un transformer de 1.500 millones de parametros en Apple Neural Engine (470 tok/s en un Mac mini M4, 64 conversaciones por pasada) con memoria de estado plana, a cambio de una perdida de calidad medible mas alla de 512 tokens de contexto. La licencia es Apache 2.0 y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) compilado a grafo causal HCGM; atencion con holographic Ward recall en lugar de KV cache |
| Parametros totales | 1.500 millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Exacto hasta 512 tokens; degradacion medida a 2.048, 4.096 y 8.192 tokens; limite maximo no especificado |
| Tipos de cuantizacion | Pesos SwiGLU en codigos de 6 bits con escala BF16 por cada 16 pesos; nucleos de atencion en BF16; bundle de 1,79 GB |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; hereda los del modelo base, no verificados aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle propietario `holo-source-free-qwen/v1` (no safetensors ni GGUF); libreria `holo-surgery` |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only de Qwen2.5 con 1.500 millones de parametros. HCGM no reentrena ni ajusta pesos: actua como compilador. Cada neurona de la MLP SwiGLU se almacena como la hiperarista no lineal exacta `d_j · SiLU(g_jᵀx) · (u_jᵀx)` codificada en paginas de 6 bits con una escala BF16 por bloque de 16 pesos; el embedding atado se representa como grafo lexico con indice SimHash; los nucleos de atencion permanecen en BF16. El bundle completo suma 1,79 GB.

La innovacion principal es la eliminacion de la KV cache. Por capa y cabeza clave-valor se mantiene una frontera exacta de los ultimos 128 tokens, 383 atomos fusionados por minima varianza de Ward y un atomo fijado para el primer token. El estado completo de una conversacion es de 14,4 MiB sea cual sea su longitud, frente a la cache del modelo fuente, que tras 528 tokens ya ocupa ese tamano y crece 28 KiB por token adicional. La recuperacion es exacta mientras el contexto cabe en las 512 filas y aproximada mas alla, con un coste medido de +0,031 nat/token a 2.048, +0,080 a 4.096 y +0,145 a 8.192 tokens. No se documenta RLHF, DPO ni dataset de entrenamiento adicional; la unica "adaptacion" es la compilacion del grafo.

## Capacidades
- Generacion de texto conversacional y continuacion de contexto, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Generacion de codigo: el autor reporta pass@1 de 60,4 % en HumanEval con plantilla de chat y 384 tokens nuevos.
- Razonamiento de un solo turno dentro de la ventana exacta de 512 tokens.
- Ejecucion sin KV cache: el estado de conversacion no crece con la longitud (14,4 MiB constantes).
- Ejecucion en Apple Neural Engine con 64 conversaciones compartiendo una pasada.
- Reutilizacion de respuestas previas mediante el mapa `.mrail` ("Compute Once"): responde contextos ya vistos en milisegundos y permite verificar borradores de forma exacta.
- Tool calling, function calling, agentes multi-paso, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso
- Inferencia local en Mac con Neural Engine: el bundle se ejecuta sin PyTorch ni GPU dedicada a 470 tok/s en un Mac mini M4, adecuado para prototipos y demos en hardware de escritorio.
- Servicio de muchos chats concurrentes con memoria acotada: al ser el estado constante de 14,4 MiB por conversacion, 64 conversaciones comparten una pasada en ANE, lo que reduce el coste de memoria frente a una KV cache creciente.
- Asistentes de turno corto: para preguntas y respuestas cuyo contexto no supera los 512 tokens, la recuperacion es exacta y la calidad coincide practicamente con el modelo fuente (96,7 % de coincidencia top-1 en WikiText-2).
- Generacion y revision de codigo en local: con HumanEval pass@1 de 60,4 % y 98,5 % de coincidencia top-1 en codigo, sirve para autocompletado y generacion de funciones en entornos sin GPU.
- Cache semantica de respuestas: el mapa `.mrail` permite responder en milisegundos cualquier contexto ya procesado con la salida propia del modelo, util para FAQ y sistemas de soporte con consultas repetidas.
- Investigacion sobre estados recurrentes y compresion de atencion: el bundle y los scripts de `eval/` permiten reproducir las mediciones de perplejidad por longitud y comparar con el checkpoint fp32 original.
- Despliegue en dispositivos Apple sin red: al ser un bundle source-free, no requiere descargar el checkpoint original ni un runtime de PyTorch en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Qwen2.5-1.5B-Instruct | HCGM | Diferencia |
|---|---:|---:|---:|
| WikiText-2 test, 32 × 512 tokens (nat/token) | 2,4454 | 2,4493 | +0,0038 |
| HumanEval reference programs (nat/token) | 0,9432 | 0,9429 | −0,0003 |
| Coincidencia top-1 con el fuente, WikiText-2 | – | 96,7 % | – |
| Coincidencia top-1 con el fuente, codigo | – | 98,5 % | – |
| WikiText-2, 8 × 2.048 tokens (nat/token) | 2,1300 | 2,1615 | +0,031 |
| WikiText-2, 6 × 4.096 tokens (nat/token) | 2,1202 | 2,1997 | +0,080 |
| WikiText-2, 4 × 8.192 tokens (nat/token) | 2,0928 | 2,2374 | +0,145 |
| HumanEval pass@1 (greedy, chat template, 384 tokens) | 89/164 (54,3 %) | 99/164 (60,4 %) | +6,1 pp |

Las respuestas HumanEval del HCGM se generaron con el runtime de Neural Engine y se verificaron token a token contra el runtime de referencia fp32 por teacher forcing: 30.268 de 30.278 tokens identicos (99,97 %); en las diez posiciones restantes la referencia prefiere su propio token por 0,03 nat como maximo. Rendimiento declarado: 470 tok/s en Mac mini M4 con 64 conversaciones por pasada.

## Requisitos de hardware
- Almacenamiento: 1,8 GB para el bundle completo; no requiere el checkpoint original de Qwen.
- Memoria de estado: 14,4 MiB por conversacion, constante con la longitud.
- Ejecucion principal: Apple Neural Engine (probado en Mac mini M4 a 470 tok/s).
- Runtime de referencia: existe un runtime fp32 de referencia del bundle para verificacion; requisitos de VRAM no disponibles.
- GPU NVIDIA (A100, H100, RTX 4090) y CUDA: no disponibles en la informacion proporcionada.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no soportado segun la informacion disponible; la libreria es `holo-surgery` y el runtime propio del proyecto.
- Throughput agregado: 64 conversaciones por pasada en ANE; latencia por conversacion no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado / cache | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-HCGM | 1,5 B | Exacto hasta 512; degradacion medida hasta 8.192 | 14,4 MiB constantes | Apache 2.0 | Hugging Face, runtime propio |
| Qwen2.5-1.5B-Instruct (base) | 1,5 B | 32.768 tokens (segun especificacion de Qwen; no verificado aqui) | KV cache que crece con el contexto | Apache 2.0 | Hugging Face, safetensors, ecosistema amplio |
| Otros modelos de ~1,5 B con soporte GGUF/vLLM | ~1,5 B | Variable | KV cache estandar | Variable | Amplia |

La comparativa con alternativas de la misma categoria en terminos de rendimiento no esta disponible: no hay mediciones comunes publicadas en la informacion proporcionada para enfrentar HCGM con otros modelos de 1,5 B.

## Limitaciones y advertencias
- La recuperacion deja de ser exacta por encima de 512 tokens: el coste medido es de +0,031 nat/token a 2.048, +0,080 a 4.096 y +0,145 a 8.192, por lo que contextos largos degradan la fidelidad respecto al modelo fuente.
- El bundle no es compatible con el ecosistema estandar: no hay pesos safetensors ni GGUF, y no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- La ejecucion esta validada en Apple Neural Engine; el rendimiento en GPU NVIDIA o CPU generica no esta documentado.
- El proyecto depende de una unica libreria (`holo-surgery`) y de un autor individual (tfwnotops); el modelo tiene 236 descargas y 1 like en el momento de la consulta, lo que implica poca validacion externa.
- Los resultados de HumanEval los reporta el propio autor, con scripts en `eval/` no auditados de forma independiente.
- No se declara lista de idiomas soportados; el comportamiento multilingue no esta verificado.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct y de los papers citados antes de desplegar en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tfwnotops/Qwen2.5-1.5B-Instruct-HCGM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio mrail: https://github.com/DT-Foss/mrail
- Paper HCGM: https://doi.org/10.13140/RG.2.2.28206.68167
- Paper "No GPU, No KV Cache": https://doi.org/10.13140/RG.2.2.31562.12484
- Paper "Compute Once": https://doi.org/10.13140/RG.2.2.18140.35202
- Licencia: https://huggingface.co/tfwnotops/Qwen2.5-1.5B-Instruct-HCGM/blob/main/LICENSE
