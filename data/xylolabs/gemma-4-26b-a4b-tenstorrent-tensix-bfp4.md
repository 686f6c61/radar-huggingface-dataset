# Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 26B-A4B Tenstorrent Tensix BFP4 es una exportación cuantizada del modelo multimodal google/gemma-4-26B-A4B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 con mezcla de expertos (26.544 millones de parámetros totales) y sustituye las capas lineales del modelo de lenguaje por matrices cuantizadas a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ, mientras mantiene en bf16 el router, las normas, el embedding, el LM head y todo el stack de visión.

La relevancia de este checkpoint es que permite ejecutar un modelo de 26B con capacidades de imagen-texto sobre hardware de inferencia dedicado (Tensix) con un consumo de memoria de dispositivo de aproximadamente 15,27 GB solo para los pesos del modelo de lenguaje, frente a los 50,47 GB en bf16. La cuantización promedia 4,84 bits por peso y la evaluación reportada por el autor muestra una pérdida de calidad moderada: 0,04541 de KL medio respecto a BF16 y un 90,85 % de coincidencia top-1.

Es importante subrayar que se trata del modelo preentrenado base: continúa texto, no incorpora plantilla de chat y solo se ha cuantizado y evaluado la parte de lenguaje. El repositorio está pensado como artefacto de despliegue para el stack tt-metal/ttnn, no como un modelo conversacional listo para usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (Gemma 4), multimodal image-text-to-text; capas lineales cuantizadas a block floating point |
| Parámetros totales | 26.544.133.710 (26,54 B) |
| Parámetros activos | 4 B (según el sufijo A4B del modelo base; no se detalla el reparto exacto en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en las proyecciones cuantizadas; 4,84 bits de media); router, normas, embeddings y visión en bf16; compatible también con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (calibración GPTQ sobre WikiText-2 e Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con `quant4.json` que describe el formato de cada proyección; empaquetado para TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 con mezcla de expertos: 30 capas con atención y MLP denso más expertos enrutados, un router por capa con escala por experto, y una torre de visión independiente (`vision_tower`, `embed_vision`) que se mantiene intacta en bf16. La cuantización afecta a las proyecciones q, k, o (30 capas), v (25 capas) y a las proyecciones gate, up y down del MLP denso y de los expertos enrutados (30 capas), todas a `bfloat4_b`.

El proceso de cuantización es GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los expertos enrutados comparten una única matriz Hessiana por capa para gate y up, mientras que la proyección down de cada experto usa su propia Hessiana o, si ha visto pocos tokens de calibración, redondeo al vecino más cercano. Las matrices cuantizadas se almacenan como valores bf16 sobre la retícula BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; el autor verifica esta propiedad con `pack_tensix.py` y `verify_grid.py`. No se documenta en la información disponible un entrenamiento adicional, RLHF o DPO sobre el modelo base.

## Capacidades

- Generación de texto y continuación de texto (modelo preentrenado, sin plantilla de chat).
- Procesamiento de imagen y texto (`image-text-to-text`), con la torre de visión preservada en bf16.
- Razonamiento y conocimiento general heredados de Gemma 4 26B-A4B en su versión base.
- Capacidades multilingües del modelo base (no se detalla la lista de idiomas en la información disponible).
- Ejecución en NPU Tensix mediante TT-NN (`ttnn.bfloat4_b`), con empaquetado exacto verificado en el simulador ttsim de Blackhole con ttnn 0.81.1.
- Compatibilidad con el pipeline `transformers` (`AutoModelForCausalLM`) en bf16 sobre GPU/CPU convencionales.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está diseñado para cargarse en NPU Wormhole o Blackhole a través de tt-metal/ttnn, aprovechando el empaquetado nativo de BFP4 y reduciendo la huella de pesos del modelo de lenguaje a unos 15,27 GB de memoria de dispositivo.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en un MoE de 26B, con métricas de KL y top-1 frente a BF16 publicadas por el autor.
- Prototipado multimodal en entornos con memoria limitada: la torre de visión en bf16 permite experimentar con tareas imagen-texto sin necesidad de servir el modelo completo en 16 bits.
- Evaluación de pipelines de empaquetado TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que las matrices empaquetadas en la NPU conservan exactamente los valores del checkpoint.
- Benchmarking de precisión en simulador: el modelo se ha validado en ttsim (simulador de Blackhole), lo que lo hace útil para comparar formatos bf16, bfp8 y bfp4 antes de desplegar en silicio real.
- Base para fine-tuning posterior: al ser un modelo preentrenado con licencia Apache 2.0, puede servir de punto de partida para ajustes específicos de dominio, siempre que se disponga de infraestructura compatible con el formato cuantizado.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B) | 16 | 50,47 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP4) | 4,84 | 15,271 | 0,04541 | 90,85 | 28 | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 15,27 GB solo para los pesos del modelo de lenguaje en BFP4, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, familias Wormhole y Blackhole.
- El demo oficial de Gemma 4 en tt-metal (v0.81.1) ejecuta el 26B-A4B en paralelo de tensores sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no cabe en un solo chip.
- El demo de tt-metal no soporta `bfloat4_b`; sin entrada en `precision_overrides.json`, carga todo en bf16 (exacto) o, con la entrada indicada por el autor, empaqueta atención, MLP denso y expertos en bfloat8_b (también exacto). Esta comprobación se hizo solo en las dos primeras capas sobre un chip simulado.
- tt-forge (tt-xla) no se ha probado con Gemma 4; por defecto mantiene bf16 y su opción `bfp_bf4` recuantiza en PyTorch con layout [out, in].
- En GPU convencional: el checkpoint puede cargarse con `transformers` en bf16 (`dtype="bfloat16"`, `device_map="auto"`), lo que requiere del orden de 50 GB de memoria, por lo que no cabe en GPU de consumo.
- Opciones de despliegue: TT-NN/tt-metal, tt-forge (no validado con Gemma 4) y `transformers`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4 | 26,54 B (4 B activos) | no disponible | BFP4 (4,84 bits/peso) | Apache 2.0 | Hugging Face, 67 descargas |
| google/gemma-4-26B-A4B (BF16) | 26,54 B (4 B activos) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Empaquetado bfloat8_b del mismo modelo | 26,54 B (4 B activos) | no disponible | BFP8 (exacto) | Apache 2.0 | Disponible vía tt-metal con `precision_overrides.json` |

No se dispone en la información proporcionada de comparativas con otros modelos de la misma categoría (por ejemplo, otros MoE multimodales de tamaño similar).

## Limitaciones y advertencias

- Es el modelo preentrenado: no incluye plantilla de chat y no está alineado para conversación; responde continuando texto.
- Solo se ha cuantizado y evaluado la parte de lenguaje; el comportamiento de la torre de visión tras el proceso no se documenta.
- La cuantización introduce degradación medible: 0,04541 de KL medio y 90,85 % de top-1 frente a BF16, con pérdida de respuestas correctas en la evaluación del autor (28 de 28 en BF16 frente a 28 en este modelo, sin detalle del total).
- El checkpoint está pensado para TT-NN; fuera de ese stack, cargarlo en `transformers` en bf16 exige unos 50 GB de memoria y no aprovecha el formato BFP4.
- El demo oficial de tt-metal no soporta `bfloat4_b` y no cabe en un solo chip; la validación multi-chip no se ha ejecutado.
- tt-forge no se ha probado con Gemma 4 y su opción `bfp_bf4` recuantiza los pesos, lo que puede alterar los valores respecto al checkpoint.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan mitigaciones específicas en este checkpoint.
- Idiomas soportados no documentados; la calibración incluye coreano y textos en inglés (WikiText-2), lo que puede sesgar la precisión por idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base google/gemma-4-26B-A4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
