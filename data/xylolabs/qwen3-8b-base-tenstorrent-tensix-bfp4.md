# Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-8B-Base-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo Qwen/Qwen3-8B-Base, preparada por Xylolabs para su ejecución sobre las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros, pero sustituye las proyecciones lineales de atención y MLP por matrices almacenadas en formato `ttnn.bfloat4_b` (block floating point de 4 bits, 4,5 bits por peso) mediante cuantización GPTQ. El resto de tensores —embeddings, LM head, normalizaciones— permanece en bf16.

El objetivo es doble: reducir la huella de memoria del modelo hasta unos 6,40 GB de pesos empaquetados (frente a 16,38 GB en bf16) y ofrecer un checkpoint que TT-NN pueda cargar directamente sin recuantizar en el dispositivo, evitando pérdidas adicionales de precisión. Esto es relevante para quienes despliegan modelos de 8B en aceleradores Tensix con memoria DRAM limitada, donde cada gigabyte cuenta para el KV cache y los buffers de ejecución.

La ficha se centra en el checkpoint cuantizado tal como se publica; el modelo base Qwen3-8B-Base es un modelo preentrenado (no instruction-tuned) que continúa texto y conserva la plantilla de chat del tokenizador original, pero no ha sido ajustado para seguir instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), proyecciones lineales cuantizadas a BFP4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con búsqueda de exponente por bloque; BFP4 (`bfloat4_b`, 4,5 bits/peso) en q, k, v, o, gate, up, down de 36 capas; bf16 en embeddings, LM head, normas y demás tensores; 6,25 bits/peso de media |
| Idiomas soportados | no disponible (el calibrado GPTQ usó WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16,4 GB de repo), con `quant4.json` que describe el formato de cada proyección |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura de Qwen3-8B-Base: un transformer denso de 36 capas con atención multi-cabeza y bloques MLP con proyecciones gate, up y down. Sobre esa base, Xylolabs aplica GPTQ únicamente a las siete proyecciones lineales por capa (q, k, v, o, gate, up, down), cuantizándolas a `ttnn.bfloat4_b`. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; el autor verifica esta propiedad con `pack_tensix.py`, que comprueba matriz a matriz que ningún valor cambia al empaquetar.

El calibrado de GPTQ utilizó 65.536 tokens de WikiText-2 y de Wikipedia en coreano, con una búsqueda de exponente por bloque. No se ha realizado ningún entrenamiento adicional ni ajuste por instrucciones: el modelo es el preentrenado original con pesos cuantizados. La innovación técnica principal no está en el entrenamiento sino en el formato de exportación: un empaquetado BFP4 nativo para Tensix que evita la recuantización en dispositivo y que, según el autor, también empaqueta de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generación de texto y continuación de secuencias: es un modelo base, no un asistente conversacional.
- Razonamiento y conocimiento general heredados de Qwen3-8B-Base (sin datos de benchmarks en la información disponible).
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada en esta exportación.
- Tool calling / function calling: no confirmado para este checkpoint base.
- Soporte de agentes y razonamiento multi-paso: no confirmado; requiere un modelo ajustado por instrucciones.
- Capacidades multilingües: no documentadas para este checkpoint.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking explícito).
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN; verificado en el simulador ttsim de Blackhole con ttnn 0.81.1.

## Casos de uso

- Despliegue en NPU Tensix con memoria limitada: el checkpoint ocupa unos 6,40 GB de DRAM para los pesos del modelo de lenguaje, lo que deja margen para el KV cache y los buffers en aceleradores Wormhole o Blackhole donde un modelo de 8B en bf16 (16,38 GB) no cabría con holgura.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ a BFP4 con verificación exacta del empaquetado, útil para estudiar la degradación de precisión (KL media de 0,04163 frente a bf16).
- Generación de texto por lotes en pipelines offline: al ser un modelo base, encaja en tareas de continuación, aumento de datos o generación de corpus donde no se requiere seguir instrucciones.
- Evaluación comparativa de hardware: permite medir throughput y latencia de un 8B en Tensix frente a GPU, con la ventaja de que el empaquetado no introduce pérdida adicional respecto a los pesos cuantizados.
- Base para fine-tuning posterior: al estar bajo Apache-2.0 y conservar la estructura de Qwen3-8B, puede servir de punto de partida para ajustes específicos de dominio sobre hardware Tenstorrent.
- Pruebas de integración con tt-transformers y tt-forge: el autor documenta la ejecución con `simple_text_demo.py` de tt-metal v0.81.1, lo que facilita validar la cadena de herramientas antes de pasar a producción.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B-Base) | 16 | 16,38 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP4) | 6,25 | 6,397 | 0,04163 | 90,68 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 5,028 | 0,04034 | 89,59 | 28 de 28 | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La tabla anterior recoge la evaluación de fidelidad publicada por el autor, que compara la distribución de salida frente al modelo en bf16.

## Requisitos de hardware

- VRAM/DRAM estimada: unos 6,40 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole); verificado en el simulador ttsim de Blackhole con ttnn 0.81.1.
- GPU consumer: no es el objetivo del checkpoint; en GPU requeriría al menos 8 GB de VRAM en bf16 parcial, aunque la cuantización BFP4 está pensada para TT-NN, no para kernels CUDA.
- Opciones de despliegue: TT-NN / tt-metal (v0.81.1), tt-transformers (`simple_text_demo.py` con `--use_hf_rope --instruct 0`), tt-forge (tt-xla, no probado con este checkpoint), y carga estándar con `transformers` en bf16 para inspección.
- Latencia y throughput: no disponibles; el autor indica que el demo de tt-transformers no se ejecutó de extremo a extremo.
- Nota de precisión: en tt-transformers, las proyecciones de las 2 primeras capas empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0,9990; el demo empaqueta la cabeza en bfloat8_b, por lo que el LM head en bf16 de este checkpoint no es exacto allí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP4 | 8,19B | no disponible | BFP4 GPTQ (6,25 bits/peso) | Apache-2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-8B-Base (bf16) | 8,19B | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Qwen3-8B-Base Q4_K_M (llama.cpp) | 8,19B | no disponible | Q4_K_M (4,91 bits/peso) | Apache-2.0 | Hugging Face / GGUF |

La diferencia clave frente a las alternativas es el formato: el checkpoint de Xylolabs está pensado para cargarse sin recuantizar en NPU Tensix, mientras que Q4_K_M apunta a llama.cpp y el bf16 a GPU o CPU. En fidelidad, el BFP4 queda entre bf16 y Q4_K_M en tamaño, con un Top-1 del 90,68 % y una KL media de 0,04163.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogos de forma fiable; la plantilla de chat del tokenizador no implica capacidad conversacional.
- Riesgo de alucinación inherente a un modelo preentrenado de 8B; sin ajuste por preferencias (RLHF/DPO) documentado en esta exportación.
- La cuantización BFP4 introduce degradación medible: KL media de 0,04163 y Top-1 del 90,68 % frente a bf16, con pérdida de precisión concentrada en las proyecciones lineales.
- Idiomas soportados no documentados; el calibrado incluyó coreano, pero no hay evaluación multilingüe publicada.
- Longitud de contexto no disponible en la información proporcionada.
- El soporte en tt-forge no se ha probado con este checkpoint, y el demo de tt-transformers no se ejecutó de extremo a extremo.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B-Base y de las herramientas Tenstorrent utilizadas.
- Para producción en Tensix es necesario validar el empaquetado con `pack_tensix.py` y `verify_grid.py` en el hardware concreto, ya que la verificación publicada se hizo en simulador.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
