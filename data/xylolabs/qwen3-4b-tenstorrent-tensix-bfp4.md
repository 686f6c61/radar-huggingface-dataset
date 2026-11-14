# Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4

## Resumen
Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo Qwen/Qwen3-4B, desarrollada por Xylolabs, destinada a ejecutarse sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un artefacto de despliegue: los pesos de las capas lineales del transformer original han sido cuantizados a formato block floating point de 4 bits (BFP4, `ttnn.bfloat4_b`) mediante GPTQ, mientras que embeddings, normas y la cabeza LM permanecen en bf16.

El modelo base Qwen3-4B es un transformer denso de 4.411.424.256 parámetros (dato real de safetensors) con licencia Apache 2.0, orientado a generación de texto, razonamiento y conversación. Esta variante mantiene la misma arquitectura y tokenizador, pero reduce el peso de las matrices lineales a 4.5 bits por peso (5.61 bits de media), lo que permite empaquetar los pesos del modelo de lenguaje en aproximadamente 2.82 GB de memoria de dispositivo, más espacio para KV cache y buffers.

Su relevancia es acotada pero específica: es una de las pocas exportaciones públicas de un modelo Qwen3 lista para el stack de software de Tenstorrent (`tt-metal`, `ttnn`, `tt-forge`), lo que facilita evaluar inferencia de un LLM de 4B en hardware NPU alternativo a GPU. El repositorio pesa 8.8 GB y ha registrado 78 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con capas lineales cuantizadas a BFP4 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso) en q, k, v, o, gate, up, down de 36 capas; bf16 en embeddings, normas y LM head; 5.61 bits/peso de media |
| Idiomas soportados | no disponible (la calibracion GPTQ uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`), con metadatos `quant4.json` para el empaquetado TT-NN |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-4B: un transformer denso decoder-only con 36 capas, atención multi-cabeza con RoPE y MLP con proyecciones gate/up/down. Esta exportación no reentrena el modelo; aplica cuantización GPTQ post-entrenamiento con búsqueda de exponente por bloque sobre las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica reside en el formato: las matrices cuantizadas se almacenan como valores bf16 situados sobre la retícula BFP4, de modo que TT-NN las empaqueta sin alterar sus valores. Esto permite una verificación exacta del empaquetado (`pack_tensix.py`, `verify_grid.py`) y que los mismos valores se empaqueten también de forma exacta en `ttnn.bfloat8_b`. El autor indica que la exportación se comprobó con `ttnn 0.81.1` sobre `ttsim`, el simulador Blackhole de Tenstorrent, no sobre silicio real. No se dispone de información sobre datos de entrenamiento originales de Qwen3-4B, RLHF/DPO ni innovaciones de decodificación en esta ficha.

## Capacidades
- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y matemáticas heredados del modelo base Qwen3-4B (no se documentan métricas en esta exportación).
- Generación de código, sujeta a la calidad del modelo base.
- Ejecución de pesos en formato BFP4 sobre NPU Tensix mediante `tt-metal`/`ttnn` (Wormhole, Blackhole).
- Ejecución alternativa en bf16 vía `tt-forge` (tt-xla), que por defecto es exacta; la opción `bfp_bf4` requiere precaución por re-cuantización en layout `[out, in]`.
- Compatibilidad con `transformers` y `text-generation-inference` (tags del repositorio).
- No se documenta soporte explícito de tool calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso
- Evaluación de LLMs en NPU Tenstorrent: desplegar Qwen3-4B sobre Wormhole o Blackhole con `tt-metal v0.81.1` para medir rendimiento real de un modelo de 4B en hardware no-GPU, usando el demo `simple_text_demo.py` con configuraciones de precisión BFP4.
- Investigación en cuantización block floating point: comparar la calidad de BFP4 con GPTQ frente a bf16 y bfp8 sobre el mismo modelo base, aprovechando que los valores empaquetados son exactos y verificables con `pack_tensix.py`.
- Prototipado de asistentes conversacionales en entornos con aceleradores Tensix: usar la plantilla de chat y `transformers` para validar respuestas antes de portar a producción en NPU.
- Validación de pipelines de compilación: emplear `tt-forge` (tt-xla) con `torch.compile(backend="tt")` para comprobar la corrección del grafo en bf16 antes de activar la ruta BFP4.
- Benchmarking de memoria de dispositivo: medir el consumo real de 2.82 GB de pesos más KV cache y buffers para dimensionar despliegues en placas con DRAM limitada.
- Docencia y experimentación con hardware alternativo: reproducir el quickstart en `transformers` y el flujo de empaquetado en `ttnn` como ejercicio práctico de cuantización y despliegue en NPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección "Evaluation" que aparece truncada en los datos proporcionados, por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base.

## Requisitos de hardware
- Memoria de dispositivo: aproximadamente 2.82 GB solo para los pesos del modelo de lenguaje en BFP4, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Verificación realizada sobre `ttsim` (simulador Blackhole) con `ttnn 0.81.1`; no se documenta ejecución en silicio real.
- Ejecución en GPU/CPU: posible vía `transformers` con `dtype="bfloat16"` y `device_map="auto"`, aunque no es el objetivo del artefacto; no se especifican requisitos de VRAM para esta ruta.
- Despliegue: `tt-metal` v0.81.1 con `tt-transformers` (requiere `--use_hf_rope`), `tt-forge` (tt-xla) con `pjrt-plugin-tt==1.4.0`, y `transformers`/`text-generation-inference` para la ruta estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4 | 4.411.424.256 | no disponible | BFP4 (4.5 bits/peso) + bf16 | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-4B (base) | 4B (aprox.) | no disponible | bf16 | Apache 2.0 | GPU/CPU |
| Otras exportaciones cuantizadas de Qwen3-4B (GGUF, AWQ, GPTQ) | 4B (aprox.) | no disponible | 4-8 bits | Apache 2.0 | GPU/CPU |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- La cuantización BFP4 con GPTQ puede degradar la calidad respecto al modelo base en bf16; no se aportan métricas de degradación.
- La verificación se realizó únicamente sobre el simulador `ttsim`, no sobre hardware Tensix físico.
- En `tt-transformers`, es obligatorio pasar `--use_hf_rope`; sin ello, el QKV fusionado se re-cuantiza y se altera el resultado.
- El demo de `tt-transformers` empaqueta la cabeza LM (tied head) en `bfloat8_b`, por lo que la cabeza no es exacta en ese flujo.
- La ruta `tt-forge` con `bfp_bf4` re-cuantiza en layout `[out, in]` de PyTorch; para pesos de 4.5 bits debe usarse `tt-transformers`. Además, `tt-forge` no se ha ejecutado de extremo a extremo según el autor.
- La calibración GPTQ se hizo con WikiText-2 y Wikipedia en coreano; el rendimiento en otros idiomas o dominios no está documentado.
- No se documentan sesgos específicos, riesgo de alucinación ni limitaciones de contexto o idioma más allá de lo heredado del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir las condiciones de la licencia y verificar la licencia del modelo base.
- El repositorio tiene 78 descargas y 0 likes, lo que indica escasa validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
