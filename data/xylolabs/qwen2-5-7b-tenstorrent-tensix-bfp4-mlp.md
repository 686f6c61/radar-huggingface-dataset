# Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo Qwen2.5-7B de Alibaba, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer densa del original, con 7.615.616.512 parámetros, pero sustituye los pesos de las capas lineales por formatos de coma flotante por bloques propios del hardware: `ttnn.bfloat4_b` (BFP4) para las proyecciones MLP y `ttnn.bfloat8_b` (BFP8) para las proyecciones de atención.

La relevancia de esta ficha no reside en el modelo base —ampliamente conocido— sino en el pipeline de cuantización: consigue un peso medio de 6,58 bits por parámetro y un empaquetado de 6,26 GB, frente a los 15,23 GB del checkpoint BF16. Esto permite ejecutar un modelo de 7B en aceleradores Tensix con DRAM limitada, un nicho creciente entre quienes despliegan inferencia fuera de las GPU convencionales.

El checkpoint se distribuye en formato safetensors compatible con `transformers` y con la librería `ttnn`, e incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) para comprobar que las matrices empaquetadas en el dispositivo no alteran sus valores. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), capas lineales cuantizadas a formatos BFP de Tenstorrent |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en embeddings, LM head y normas; media de 6,58 bits/peso |
| Idiomas soportados | en (declarado); calibración de cuantización en inglés y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 almacenado sobre rejilla BFP4/BFP8), índice `model.safetensors.index.json`, metadatos en `quant4.json` |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint Qwen/Qwen2.5-7B, un transformer denso de 28 capas con atención multi-cabeza y MLP con activación SwiGLU. No se ha reentrenado ni ajustado con RLHF o DPO: se trata del modelo preentrenado, que continúa texto y no está alineado para instrucciones, aunque conserva la plantilla de chat del tokenizador original.

La innovación técnica está en el esquema de cuantización. Las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se cuantizan a BFP8 con redondeo al más cercano. Los tensores resultantes se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin modificar sus valores; los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la igualdad exacta tras el empaquetado. El archivo `quant4.json` documenta el formato de cada proyección.

## Capacidades

- Generación de texto autoregresiva en modo continuación: el modelo no está ajustado para instrucciones ni para diálogo.
- Razonamiento y conocimiento general heredados de Qwen2.5-7B en su variante preentrenada.
- Generación de código y matemáticas a nivel de modelo base, sin garantías de formato instruccional.
- Capacidades multilingües del modelo original, aunque la model card solo declara inglés y la calibración cubrió inglés y coreano.
- No se documenta soporte de tool calling ni function calling en esta exportación.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo thinking, visión ni audio.
- Compatible con el pipeline `text-generation` de `transformers` y con `text-generation-inference` según los tags del repositorio.

## Casos de uso

- Inferencia en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está diseñado para empaquetarse directamente en DRAM del dispositivo con `ttnn.as_tensor`, ocupando 6,26 GB de pesos más espacio para caché KV y buffers. Es el caso de uso principal y el único validado por el autor.
- Despliegue en entornos con DRAM limitada: frente a los 15,23 GB del BF16, el empaquetado de 6,26 GB permite alojar un modelo de 7B en aceleradores con menos memoria, a costa de una pérdida medible de fidelidad respecto al original.
- Investigación en cuantización por bloques: el repositorio sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en proyecciones MLP frente a esquemas como Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas.
- Validación de pipelines TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar la integridad del empaquetado en simulador (`ttsim`) o en dispositivo antes de desplegar.
- Generación de texto en lote sobre Tensix: al ser un modelo de continuación, encaja en tareas de completado, resumen extractivo o generación de documentos donde no se requiere seguimiento de instrucciones.
- Comparación de fidelidad de cuantizaciones: útil para equipos que evalúan el compromiso entre bits por peso (6,58 frente a 4,91 de Q4_K_M) y divergencia KL respecto a BF16 en un mismo checkpoint.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B) | 16 | 15,23 | 0 | 100 | 26 de 28 | - |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,58 | 6,262 | 0,05152 | 89,88 | 25 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03655 | 90,81 | 25 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con verificación automática, en formato de completado y con 3 ejemplos. El autor fija como criterio de aceptación un KL medio máximo de 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; el modelo lo cumple con 1,41 veces el KL de Q4_K_M y cero respuestas perdidas. Estas cifras miden cercanía al BF16, no calidad de tarea. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 6,26 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole (N300 y superiores para la ruta `tt-transformers`).
- Validación realizada por el autor en `ttsim`, el simulador de Blackhole, con `ttnn` 0.81.1; no se reportan pruebas en silicio real.
- Ruta `tt-transformers` (tt-metal v0.81.1): solo soporta Qwen2.5-7B en 2 o 4 chips, por lo que el autor no la ha probado con este checkpoint; requiere `--use_hf_rope` y `--instruct 0`, y configuración `precision_cfg = {ff1_3: bfp4, ff2: bfp4, wqkv: bfp8, wo: bfp8, ...}`.
- Ruta `tt-forge` (tt-xla): no probada con este checkpoint; por defecto mantiene los pesos en bf16 (exacto) y la opción `bfp_bf4` los recuantiza en PyTorch con layout `[out, in]`.
- Compatibilidad con GPU convencionales: el checkpoint carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"`, pero los formatos BFP4/BFP8 son específicos de TT-NN; en GPU se ejecutaría como un modelo bf16 de 15,2 GB, sin las ventajas de compresión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|---|
| Este modelo | 7,6B | no disponible | BFP4 MLP + BFP8 atención (6,58 bits/peso) | 6,26 GB | Apache-2.0 | Tenstorrent Tensix |
| Qwen2.5-7B (BF16) | 7,6B | no disponible | bf16 | 15,23 GB | Apache-2.0 | GPU/CPU genéricas |
| Qwen2.5-7B Q4_K_M (llama.cpp) | 7,6B | no disponible | Q4_K_M (4,91 bits/peso) | 4,68 GB | Apache-2.0 | CPU/GPU con llama.cpp |
| Qwen2.5-7B-Instruct | 7,6B | no disponible | bf16 | 15,23 GB | Apache-2.0 | GPU/CPU genéricas |

La comparación directa más relevante es con Q4_K_M, que logra menor divergencia KL (0,03655 frente a 0,05152) y mayor top-1 (90,81 % frente a 89,88 %) con menos bits por peso, aunque no está pensado para empaquetarse en Tensix. Frente al BF16, este modelo pierde aproximadamente 10 puntos de top-1 y 2 respuestas correctas de 28 en la evaluación del autor.

## Limitaciones y advertencias

- El modelo es preentrenado, no ajustado para instrucciones: no debe usarse como asistente conversacional sin un ajuste posterior.
- La model card declara únicamente inglés; el comportamiento en otros idiomas no está evaluado, aunque la calibración incluyó coreano.
- La cuantización BFP4/BFP8 está diseñada para TT-NN; fuera de Tensix, el checkpoint se carga como bf16 y pierde su ventaja de tamaño.
- Solo se ha validado en el simulador `ttsim`, no en hardware Tensix real según la información del autor.
- La ruta `tt-transformers` no está probada con este checkpoint y la ruta `tt-forge` tampoco; su uso en producción requiere validación propia.
- Riesgo de alucinación inherente al modelo base preentrenado, no mitigado por alineación.
- La evaluación publicada mide fidelidad respecto a BF16 (KL, top-1, 28 prompts), no calidad en tareas estándar; no hay datos de MMLU, HumanEval ni GSM8K.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-7B y de las herramientas TT-NN/TT-Metal empleadas.
- El repositorio tiene 55 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-7B-Tenstorrent-Tensix-BFP4-MLP/blob/main/LICENSE
