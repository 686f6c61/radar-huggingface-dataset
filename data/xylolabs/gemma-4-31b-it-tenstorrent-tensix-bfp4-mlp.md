# Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo multimodal google/gemma-4-31B-it, adaptada específicamente para ejecutarse en aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en aplicar GPTQ sobre las capas lineales del modelo de lenguaje para almacenarlas en el formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8), de modo que TT-NN pueda empaquetarlas sin alterar sus valores.

El checkpoint conserva intactas las partes multimodales (`embed_vision`, `vision_tower`) y el embedding, el LM head y las normas en bf16, mientras que las proyecciones de atención se guardan en BFP8 y las del MLP en BFP4. El resultado es un modelo de aproximadamente 32.680 millones de parámetros con un peso medio de 6,13 bits por peso y un empaquetado de 23,53 GB, lo que lo hace viable en hardware Tensix donde un checkpoint en bf16 no cabría con holgura.

Es relevante porque cubre un hueco concreto: el soporte de Gemma 4 en el ecosistema Tenstorrent es todavía limitado (tt-transformers no lo soporta y la demo oficial de tt-metal requiere cuatro u ocho chips Blackhole o un Wormhole T3K), y esta exportación ofrece una alternativa cuantizada y verificable byte a byte contra el modelo original. La licencia Apache-2.0 y el pipeline `image-text-to-text` lo sitúan como candidato para despliegues multimodales en aceleradores de inferencia de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de google/gemma-4-31B-it; capas lineales cuantizadas a formatos BFP de Tenstorrent |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en atención q/k/o y v; bf16 en embedding, LM head, normas y torre de visión; media de 6,13 bits por peso |
| Idiomas soportados | no disponible (calibración GPTQ con WikiText-2 y Wikipedia en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB), compatible con transformers; empaquetado Tensix de 23,53 GB en DRAM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 con 31B de parámetros (32,68B reales según safetensors) que procesa texto e imagen y genera texto. Esta exportación no reentrena el modelo: cuantifica post-entrenamiento las matrices lineales del modelo de lenguaje. Las proyecciones de atención q, k, o (60 capas) y v (50 capas) se convierten a `bfloat8_b` mediante redondeo al más cercano; las proyecciones MLP gate, up y down (60 capas) se cuantizan a `bfloat4_b` con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (embedding, LM head atado al embedding, normas, `embed_vision` y `vision_tower`) permanece en bf16.

La innovación técnica clave es el uso del formato de coma flotante por bloques de Tenstorrent: las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de forma que TT-NN las empaqueta sin modificar sus valores. El repositorio incluye `quant4.json`, que detalla el formato de cada proyección, y scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado es exacto. Solo se cuantizó y evaluó el modelo de lenguaje; la parte visual no se ha evaluado en formato cuantizado.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a instrucciones.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada y genera texto.
- Razonamiento y respuesta a preguntas de conocimiento general (el ejemplo de la model card es capital de Francia).
- Capacidad multilingüe heredada del modelo base, aunque la model card no detalla la lista de idiomas.
- Integración con el ecosistema Hugging Face `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Despliegue en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) a través de TT-NN, tt-metal y, potencialmente, tt-forge/tt-xla.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, donde sus 23,53 GB de pesos del modelo de lenguaje caben en DRAM del dispositivo, algo que un checkpoint bf16 no permitiría con la misma holgura.
- Despliegue en clústeres Tensix multi-chip: la demo oficial de tt-metal ejecuta Gemma 4 31B en paralelo de tensores sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K; esta exportación puede servir como variante cuantizada de referencia en esos entornos.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada en BFP4/BFP8 conserva exactamente sus valores, útil para equipos que desarrollan flujos GPTQ sobre BFP.
- Asistentes conversacionales con entrada de imagen: al conservar la torre de visión en bf16, puede emplearse en tareas de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, siempre que el backend Tensix soporte el grafo multimodal completo.
- Investigación sobre degradación por cuantización: la tabla de evaluación del autor (KL medio frente a BF16, Top-1, respuestas correctas y perdidas) permite estudiar el impacto de BFP4 en MLP frente a BFP8 en atención sobre un modelo de 31B.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` y la presencia del modelo en FriendliAI sugieren su uso en despliegues gestionados con API, útil para prototipos que necesitan multimodalidad sin infraestructura propia.
- Reproducción de experimentos de cuantización en hardware de simulación: el autor validó el empaquetado con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole, lo que permite probar el checkpoint sin hardware físico.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación del modelo de lenguaje que compara BF16 (modelo base) con la versión cuantizada, con columnas de bits por peso, tamaño en GB, KL medio frente a BF16, Top-1 (%) y respuestas correctas/perdidas. Los valores numéricos de la tabla aparecen truncados en la información disponible, por lo que no se reproducen aquí.

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---|---|---|---|---|
| BF16 (google/gemma-4-31B-it) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| Tensix BFP4 MLP / BFP8 atención | 6,13 | 23,53 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,53 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: aceleradores Tenstorrent Tensix, generaciones Wormhole y Blackhole.
- Multi-chip: la demo oficial de tt-metal para Gemma 4 31B requiere cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K; no se ejecuta en un solo chip.
- Simulación: validado con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- GPU consumer: no es el objetivo del checkpoint; la carga en `transformers` con `device_map="auto"` es posible en bf16, pero requeriría del orden de 65 GB, fuera del alcance de GPUs consumer habituales.
- Opciones de despliegue: TT-NN/tt-metal (soporte parcial para Gemma 4 en v0.81.1), tt-forge/tt-xla (no probado con Gemma 4), `transformers` para inspección y conversión, y FriendliAI como endpoint gestionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP | 32,68B | no disponible | BFP4 MLP + BFP8 atención (6,13 bits/peso) | Apache-2.0 | Hugging Face, FriendliAI |
| google/gemma-4-31B-it (base) | 31B (nominal) | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP | no disponible (variante E2B) | no disponible | BFP4 MLP | no disponible | Hugging Face |
| hletrd/gemma-4-31B-it-Tensix-BFP4-MLP (espejo) | 33B (según ficha) | no disponible | BFP4 MLP | no disponible | Hugging Face |

La comparativa se limita al ecosistema Gemma 4 y Tensix porque no se dispone de datos de benchmarks que permitan contrastar con modelos de otras familias.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el resto del pipeline multimodal no se han evaluado en formato cuantizado.
- La demo oficial de tt-metal para Gemma 4 no tiene entrada en `precision_overrides.json` para este repositorio, por lo que por defecto carga todo en bf16; el autor propone una entrada que empaqueta atención y MLP en bfloat8_b, verificada solo en las dos primeras capas sobre un chip simulado.
- La demo `gemma4_31b_qb2` de tt-metal empaqueta todas las proyecciones en bfloat4_b, lo que re-cuantizaría la atención BFP8 de este checkpoint; esa combinación no se ha probado.
- tt-forge (tt-xla) no se ha ejecutado con Gemma 4; su opción `bfp_bf4` re-cuantiza los pesos en el layout [out, in] de PyTorch.
- La división multi-chip no se ha ejecutado; la verificación se limitó a un chip simulado.
- La calibración GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio e idioma en la cuantización BFP4.
- No se han publicado resultados de benchmarks estándar ni datos de sesgos o tasas de alucinación en la información disponible.
- Aunque la licencia es Apache-2.0, conviene revisar los términos del modelo base google/gemma-4-31B-it para uso comercial en producción.
- El modelo tiene 83 descargas y 0 likes, lo que indica validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Demo gemma4_31b_qb2 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4_31b_qb2
- Página del modelo en tt-awesome: https://docs.tenstorrent.com/tt-awesome/models/gemma-4-31b-it/
- Endpoint en FriendliAI: https://friendli.ai/models/Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP
- Espejo en Hugging Face: https://huggingface.co/hletrd/gemma-4-31B-it-Tensix-BFP4-MLP
- Variante E2B relacionada: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Ficha en free2aitools: https://free2aitools.com/model/xylolabs/gemma-4-31b-it-tensix-bfp4-mlp
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
