# Xylolabs/Qwen3-4B-Base-Tensix-BFP4

## Resumen

Qwen3-4B-Base-Tensix-BFP4 es una cuantización del modelo base Qwen3-4B-Base de Alibaba Qwen, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura y los pesos del original, pero sustituye las proyecciones lineales de atención y MLP por pesos cuantizados en formato block floating point de 4 bits (`ttnn.bfloat4_b`), empaquetados mediante GPTQ. No se trata de un modelo nuevo: es un checkpoint de 4.411.424.256 parámetros preparado para que TT-NN lo consuma sin transformaciones adicionales.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un transformer de 4B en hardware Tensix con un peso medio de 5,61 bits por parámetro y un tamaño empaquetado de 2,82 GB, frente a los 8,04 GB del BF16. Por otro, documenta un flujo de cuantización reproducible (GPTQ con búsqueda de exponente por bloque, calibrado sobre WikiText-2 y Wikipedia en coreano) con verificación de que cada valor permanece exactamente en la rejilla BFP4.

Es importante señalar que se trata del modelo *base*, no ajustado por instrucciones: continúa texto y no responde a comandos. Además, el autor indica que las pruebas se hicieron con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole, y no sobre hardware físico; `tt-transformers` y `tt-forge` no se ejecutaron con este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas; proyecciones lineales cuantizadas en BFP4 |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B-Base) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q, k, v, o, gate, up, down; resto en bf16; media de 5,61 bits por peso |
| Idiomas soportados | no disponibles (el calibrado de cuantización usó inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP4), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only de 36 capas con atención estándar y bloques MLP, sin mezcla de expertos. Xylolabs no reentrena el modelo: aplica GPTQ sobre las matrices de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas, con una búsqueda de exponente por bloque propia del formato block floating point. La calibración emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. La cabeza LM (atada al embedding), el embedding, las normas y el resto de tensores permanecen en bf16, igual que en el modelo original.

La innovación técnica no está en la arquitectura sino en el empaquetado: los ficheros se guardan en bf16 pero cada valor ya está alineado a la rejilla BFP4, de modo que TT-NN los empaqueta tal cual sin pérdida adicional. El autor incluye `pack_tensix.py` (comprueba que ninguna matriz cambia al empaquetar, con opción `--device` para ida y vuelta por DRAM del dispositivo) y `verify_grid.py` (verifica la rejilla solo con torch). Los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se documenta RLHF ni DPO, al ser un modelo base.

## Capacidades

- Generación de texto por continuación: el modelo completa secuencias, no sigue instrucciones.
- Razonamiento y conocimiento general heredados de Qwen3-4B-Base (no evaluados de forma específica en esta ficha).
- Capacidades multilingües del modelo base; el calibrado de cuantización incluyó inglés y coreano, pero no se publica una lista de idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión ni audio.
- El tokenizador conserva la plantilla de chat del modelo base, pero el modelo no está ajustado para conversar.

## Casos de uso

- Evaluación de hardware Tensix: sirve como checkpoint de referencia para medir latencia y throughput de un transformer de 4B en Wormhole o Blackhole con pesos BFP4, sin necesidad de cuantizar previamente.
- Investigación en cuantización BFP4: permite comparar la fidelidad de BFP4 frente a Q4_K_M de llama.cpp sobre el mismo checkpoint, usando las métricas de KL y top-1 publicadas como línea base.
- Desarrollo de kernels TT-NN: al estar los pesos ya en la rejilla BFP4, se puede validar el empaquetado y las rutas de memoria de TT-NN con matrices reales de 36 capas.
- Simulación y CI: con `ttsim` se puede integrar el modelo en pipelines de integración continua para detectar regresiones en el soporte de `bfloat4_b` sin disponer de NPU física.
- Generación de texto sin ajuste: continuación de documentos, autocompletado de prosa técnica o generación de datos sintéticos en inglés y coreano, aprovechando el tamaño reducido (2,82 GB empaquetados).
- Prototipado de bajo consumo en el borde: el peso de 5,61 bits por parámetro y los 2,82 GB empaquetados facilitan desplegar un modelo de 4B en aceleradores con memoria limitada, una vez validado en hardware.
- Base para ajuste fino posterior: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para tareas específicas antes de volver a cuantizar.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad en tareas. KL y top-1 se calculan sobre 8.184 posiciones de texto inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de continuación y con 3 ejemplos.

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Base) | 16 | 8,04 | 0 | 100 | 28 de 28 | - |
| Qwen3-4B-Base-Tensix-BFP4 | 5,61 | 2,822 | 0,04765 | 89,19 | 27 de 28 | 1 |
| Q4_K_M (llama.cpp) | 4,96 | 2,497 | 0,04793 | 89,65 | 28 de 28 | 0 |

El autor fija como criterio de aceptación un KL medio máximo de 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; el modelo lo cumple con 0,99 veces el KL de Q4_K_M y una respuesta perdida frente a cero. No se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada: 2,82 GB de pesos empaquetados en BFP4; en bf16 completo serían 8,04 GB. El autor no publica cifras de memoria de activaciones ni de KV cache.
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecución en GPU se usaría el modelo base o una cuantización estándar.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo para este checkpoint; los pesos están pensados para `ttnn`.
- Despliegue: TT-NN (`ttnn` 0.81.1 probado sobre `ttsim`), con `pack_tensix.py` y `verify_grid.py` del repositorio `XylolabsInc/tensix-bfp-gptq`. `tt-transformers` y `tt-forge` no se probaron con este checkpoint. La carga con `transformers` en bf16 es posible según el quickstart, pero no es el objetivo del artefacto.
- Latencia y throughput: no medidos; el autor indica explícitamente que no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits por peso | Tamaño (GB) | KL a BF16 | Top-1 (%) | Licencia | Destino |
|---|---:|---:|---:|---:|---:|---|---|
| Qwen3-4B-Base (BF16) | 4,41B | 16 | 8,04 | 0 | 100 | Apache 2.0 | GPU/CPU |
| Qwen3-4B-Base-Tensix-BFP4 | 4,41B | 5,61 | 2,822 | 0,04765 | 89,19 | Apache 2.0 | Tensix (TT-NN) |
| Q4_K_M (llama.cpp) | 4,41B | 4,96 | 2,497 | 0,04793 | 89,65 | Apache 2.0 | CPU/GPU (llama.cpp) |

La comparación con Q4_K_M es la más directa porque ambos derivan del mismo checkpoint. BFP4 ocupa algo más de espacio (2,822 frente a 2,497 GB) y obtiene un KL ligeramente mejor, con una respuesta perdida en la batería de 28 prompts.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene conversación y no debe usarse como asistente sin ajuste previo.
- No se ha ejecutado en hardware Tensix físico; las pruebas se hicieron sobre `ttsim` (simulador de Blackhole) con `ttnn` 0.81.1.
- `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- No se publican mediciones de latencia ni throughput.
- No se publica lista de idiomas soportados; el calibrado de cuantización solo cubrió inglés y coreano, lo que puede sesgar la fidelidad en otros idiomas.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan evaluaciones de seguridad ni de sesgo para esta cuantización.
- Los benchmarks publicados miden proximidad a BF16, no calidad en tareas; no deben interpretarse como rendimiento absoluto.
- Licencia Apache 2.0, igual que el modelo base, con cambios listados en `NOTICE`. El autor declara que no está afiliado ni respaldado por Tenstorrent y que se ofrece sin garantía.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tensix-BFP4/blob/main/LICENSE
