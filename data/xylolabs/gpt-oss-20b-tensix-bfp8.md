# Xylolabs/gpt-oss-20b-Tensix-BFP8

## Resumen

`Xylolabs/gpt-oss-20b-Tensix-BFP8` es una exportación cuantizada del modelo `openai/gpt-oss-20b` de OpenAI, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una conversión de pesos en la que las proyecciones de atención (q, k, v, o), los expertos enrutados (gate, up, down) de las 24 capas y la cabeza LM se redondean al formato de coma flotante por bloques `bfloat8_b` (BFP8) que utiliza TT-NN. El resto de tensores (embeddings, routers, normalizaciones) permanece en bf16.

La relevancia de esta ficha es doble. Por un lado, documenta un formato de cuantización poco habitual en el ecosistema Hugging Face: BFP8 de 8,5 bits por peso, con un promedio de 8,71 bits por peso y un empaquetado de 22,77 GB, frente a los 41,83 GB del modelo base en BF16. Por otro, advierte de una limitación crítica: el autor indica explícitamente que este perfil BFP8 para expertos no ha sido validado en dispositivo, y que las comprobaciones realizadas cubren únicamente el empaquetado de tensores, no una ruta de inferencia completa.

El modelo hereda del base `gpt-oss-20b` una arquitectura transformer con mezcla de expertos (MoE), aproximadamente 20.914 millones de parámetros totales según los safetensors del repositorio, y licencia Apache 2.0. El repositorio tiene 41,9 GB, lo que incluye los pesos cuantizados y los ficheros auxiliares de verificación (`quant4.json`, `pack_tensix.py`, `verify_grid.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de `openai/gpt-oss-20b` |
| Parametros totales | 20.914.757.184 (20,91 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones de atención, expertos enrutados y LM head; bf16 en router, embeddings y normas; promedio de 8,71 bits por peso |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tensores empaquetables en TT-NN con `ttnn.bfloat8_b` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del `openai/gpt-oss-20b`: un transformer con mezcla de expertos. Esta exportación no reentrena ni ajusta el modelo, sino que aplica una cuantización post-entrenamiento con redondeo al más cercano sobre la rejilla `bfloat8_b`, sin calibración. Las matrices cuantizadas se almacenan como valores bf16 situados exactamente en la rejilla BFP8, de modo que el empaquetador de TT-NN las lee sin alterar sus valores. Los expertos conservan el almacenamiento `[experts, input, output]` del modelo base; gate y up ocupan columnas de salida alternas y se redondearon por separado antes de intercalarse. El `config.json` elimina la configuración de cuantización MXFP4 original porque los pesos guardados son valores decodificados sobre rejilla bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base dentro de la información proporcionada. La innovación técnica de esta exportación es el propio formato BFP8 y el conjunto de herramientas de verificación incluidas: `pack_tensix.py` comprueba cada matriz empaquetándola y verificando que ningún valor cambia (con opción `--device` para hacer ida y vuelta por la DRAM del dispositivo), y `verify_grid.py` valida la rejilla solo con torch. Las comprobaciones se realizaron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto conversacional, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento: la evaluación incluye 7 prompts de razonamiento ejecutados con el modo thinking activado.
- Capacidades heredadas del modelo base `gpt-oss-20b` (código, matemáticas, tool calling, agentes): no disponibles de forma explícita en la información proporcionada para esta exportación.
- Capacidades multilingües: la evaluación de KL y top-1 cubre inglés y coreano, pero no se documenta la lista completa de idiomas.
- Ejecución sobre aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los tensores BFP8.
- Verificación de integridad de pesos incluida en el repositorio (comprobación de que el empaquetado no altera valores).

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso de uso principal es ejecutar `gpt-oss-20b` en NPUs Wormhole o Blackhole aprovechando el empaquetado nativo BFP8 de TT-NN, con un footprint de pesos de aproximadamente 22,77 GB en memoria de dispositivo.
- Investigación en cuantización por bloques: sirve como referencia reproducible para estudiar el impacto de BFP8 frente a BF16 y MXFP4, con métricas de KL y top-1 publicadas sobre WikiText-2 y Wikipedia en coreano.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que la conversión a BFP8 preserva los valores originales, útil en flujos de control de calidad de pesos cuantizados.
- Experimentación con simuladores: al haberse validado sobre `ttsim`, es adecuado para desarrollo y pruebas de integración antes de disponer de hardware físico.
- Evaluación comparativa de formatos: la tabla de evaluación permite contrastar BFP8 (8,71 bits/peso, 22,77 GB) con MXFP4 (4,63 bits/peso, 12,11 GB) en términos de KL medio y top-1, para decidir el compromiso entre tamaño y fidelidad.
- Generación de texto en inglés y coreano: los datos de evaluación cubren ambos idiomas, por lo que es razonable para tareas de generación en esos idiomas, siempre que se valide en dispositivo.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`openai/gpt-oss-20b`) | 16 | 41,83 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP8)** | 8,71 | 22,773 | 0,0488 | 85,03 | 40 de 40 | 0 |
| MXFP4 (llama.cpp) | 4,63 | 12,110 | 0,0678 | 82,65 | 39 de 40 | 0 |

Las métricas son mediciones de referencia en host sobre los pesos guardados; la inferencia en dispositivo no fue evaluada. KL y top-1 cubren 8.188 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), como texto plano. Las respuestas corresponden a 33 prompts cortos con comprobación automática, más los 7 de razonamiento repetidos con thinking activado (40 en total). "Perdidas" significa correctas en BF16 pero incorrectas o rotas en la variante; los empates cercanos no se contabilizan. La referencia MXFP4 es el GGUF de `ggml-org/gpt-oss-20b-GGUF` en el commit `15dcfc7e`, leído con llama.cpp v0.9.0 (`cd959bae`), con sha256 `27cd6c432c7672cb812a92f611cf3ba7bbc35928262bb1e1253ff4ee6ae35901`.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 22,77 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Aceleradores objetivo: Tenstorrent Tensix, generaciones Wormhole y Blackhole.
- Validación: comprobado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no se ha validado una ruta de inferencia BFP8 completa en dispositivo.
- GPU consumer: no disponible; el formato está pensado para NPUs Tenstorrent, no para CUDA.
- Opciones de despliegue: TT-NN para empaquetado y ejecución en Tensix; carga en transformers con `dtype="bfloat16"` y `device_map="auto"` para inspección o ejecución en host. `tt-transformers` y `tt-forge` no se ejecutaron con este perfil.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Xylolabs/gpt-oss-20b-Tensix-BFP8` | 20,91 mil millones | no disponible | BFP8, 22,77 GB empaquetado | Apache 2.0 | Hugging Face, orientado a Tensix |
| `openai/gpt-oss-20b` (BF16) | 20,91 mil millones | no disponible | BF16, 41,83 GB | Apache 2.0 | Hugging Face |
| `ggml-org/gpt-oss-20b-GGUF` (MXFP4) | 20,91 mil millones | no disponible | MXFP4, 12,11 GB | Apache 2.0 | Hugging Face, llama.cpp |

La comparación se limita al mismo modelo base en distintos formatos, ya que no se dispone de datos de benchmarks frente a modelos alternativos de tamaño similar en la información proporcionada. En fidelidad respecto a BF16, BFP8 obtiene un KL de 0,0488 frente a 0,0678 de MXFP4, con un tamaño casi el doble que este último.

## Limitaciones y advertencias

- El autor indica explícitamente que este perfil BFP8 para expertos no ha sido validado en dispositivo; las comprobaciones cubren solo el empaquetado de tensores.
- Una ruta de inferencia BFP8 completa no ha sido validada con estos pesos; los runtimes deben conservar BFP8 en los expertos para preservar sus valores.
- `tt-transformers` y `tt-forge` no se ejecutaron con este perfil.
- La evaluación es de referencia en host, no en dispositivo; los números de KL y top-1 no reflejan el rendimiento real de inferencia en Tensix.
- Pérdida de fidelidad respecto a BF16: top-1 del 85,03 % frente al 100 % de referencia, con un KL medio de 0,0488.
- La evaluación lingüística se limita a inglés y coreano; no se documenta la cobertura completa de idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se heredan los del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el funcionamiento en producción.
- El repositorio ocupa 41,9 GB, sustancialmente más que los 22,77 GB de pesos empaquetados, por los ficheros auxiliares y posibles duplicados de formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tensix-BFP8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- GGUF de referencia MXFP4: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper referenciado (arxiv:2508.10925): https://arxiv.org/abs/2508.10925
- Licencia: https://huggingface.co/Xylolabs/gpt-oss-20b-Tensix-BFP8/blob/main/LICENSE
