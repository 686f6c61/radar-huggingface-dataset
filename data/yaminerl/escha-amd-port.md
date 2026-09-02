# yaminerl/escha-amd-port

## Resumen

Este repositorio no contiene un modelo de lenguaje como tal, sino un parche y un script de verificación que permiten ejecutar el formato de cuantización ESCHAM (2 bits por peso) desarrollado por Escha Labs sobre GPUs AMD con arquitectura RDNA2, usando el backend HIP de llama.cpp. El trabajo se apoya en el fork `llama.cpp-escha` de Ajay9o9, que implementa el kernel CUDA para el operador `GGML_OP_ESCHA_MUL_MAT`, y lo adapta para que compile y funcione bajo ROCm/HIP. El modelo de referencia es `Qwen3.8-27B`, cuantizado a 2.469 bits por peso, cuyos pesos GGUF residen en el repositorio `aj9o9/Qwen3.8-27B-Escha-W2-GGUF`.

La relevancia de este port es práctica: permite ejecutar una cuantización extrema de 27B parámetros en una GPU de consumo como la Radeon RX 6800 XT, sin necesidad de tensor cores (que RDNA2 no tiene), usando una ruta de prefill en fp32 como respaldo. El autor documenta cuatro cambios concretos en `ggml/src/ggml-cuda/escha-moe.cu`, todos bajo `#if defined(GGML_USE_HIP)`, que no alteran la ruta NVIDIA. Se incluye un procedimiento de verificación numérica que compara la salida del kernel HIP contra la implementación CPU del fork, demostrando una desviación máxima de 0.0005 en los tensores del operador portado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, arquitectura exacta no disponible) |
| Parametros totales | 27B (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ESCHAM W2 (2.469 bits por peso, formato propietario de Escha Labs) |
| Idiomas soportados | en (según model card) |
| Licencia | MIT (para el parche); licencia del modelo base no especificada en este repo |
| Formato de pesos | GGUF (contenedor), kernel ESCHAM propietario |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-27B`, presumiblemente un modelo de la familia Qwen3 con 27B parámetros, aunque no se dispone de detalles oficiales sobre su arquitectura interna (número de capas, heads, etc.) en la información proporcionada. La cuantización ESCHAM es un formato de 2 bits por peso desarrollado por Escha Labs, que requiere un kernel específico en llama.cpp para su multiplicación de matrices (`GGML_OP_ESCHA_MUL_MAT`). El fork de Ajay9o9 implementa ese kernel en CUDA, con una ruta de tensor cores para prefill y una ruta de respaldo en fp32. El port a AMD modifica cuatro puntos: sustituye dos usos de PTX inline (`lop3.b32`) por su equivalente portable en C, protege el include de `cuda_pipeline.h` (sin equivalente en HIP), y corrige un fallo en la selección del kernel tensor-core que en HIP compilaba un kernel vacío. El entrenamiento original del modelo no se documenta en este repositorio; se asume que sigue el pipeline estándar de Qwen.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, aunque la cuantización a 2 bits degrada la calidad respecto al modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; depende del modelo base.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: la model card indica únicamente inglés (`language: en`), aunque Qwen3 suele ser multilingüe; no se confirma.
- Capacidades especiales: la característica destacable es la compatibilidad con el formato ESCHAM W2 en AMD, que permite ejecutar un modelo de 27B en GPUs RDNA2 sin tensor cores, con una ruta de prefill en fp32 como respaldo.
- El repositorio no incluye pesos, solo el parche y el script de verificación; el modelo funcional requiere el GGUF de `aj9o9/Qwen3.8-27B-Escha-W2-GGUF` y el fork de llama.cpp con el parche aplicado.

## Casos de uso

- Inferencia local de modelos cuantizados en GPUs AMD de consumo: usuarios con Radeon RX 6000/7000 pueden ejecutar un LLM de 27B con 2 bits por peso, reduciendo drásticamente los requisitos de VRAM (estimable en ~8-9 GB para 27B a 2.5 bits).
- Desarrollo de kernels CUDA→HIP: el parche documenta un patrón de portabilidad (guardas `GGML_USE_HIP`, sustitución de PTX inline, corrección de selección de kernel por `cc`) que sirve como referencia para portar otros forks de llama.cpp.
- Verificación numérica de kernels: el script `compare-dumps.py` y el procedimiento con `llama-eval-callback` ofrecen una metodología para validar que un kernel portado calcula lo mismo que la implementación CPU, útil para desarrolladores de kernels.
- Investigación en cuantización extrema: el formato ESCHAM W2 es un caso de estudio de compresión agresiva; este port permite experimentar con él en hardware AMD sin necesidad de NVIDIA.
- Despliegue en edge con GPUs AMD: para aplicaciones donde no se requiere la máxima calidad pero sí un modelo grande en memoria limitada, esta vía permite usar hardware AMD de bajo coste.
- Benchmarking de rendimiento: los datos de `llama-bench` incluidos (prefill y decode en RX 6800 XT vs RTX 3090) sirven para comparar el rendimiento de la implementación HIP frente a CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que la validación contra el runtime de EschaLabs se hizo en el lado CUDA por Ajay9o9, con 99.4% de top-1 y divergencia JS de 0.0000 bits, y que sus cuatro ediciones no alteran la ruta matemática cubierta por esa validación.

Sí se proporcionan datos de rendimiento de inferencia (llama-bench, batch 1, full offload, `-r 2`):

| Metrica | RX 6800 XT (port HIP) | RTX 3090 250W (upstream CUDA) |
|---|---|---|
| pp128 | 120.3 ± 17.6 tok/s | no disponible |
| pp512 | 132.4 ± 3.9 tok/s | 700.4 tok/s |
| tg64 / tg128 | 18.9 ± 0.4 tok/s | 24.03 tok/s |

El decode alcanza el 79% del rendimiento de la RTX 3090, lo que el autor atribuye a la anchura de banda de memoria (512 GB/s vs 936 GB/s). El prefill es sustancialmente más lento (19% de la 3090) por la ruta fp32 sin tensor cores.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica directamente, pero un modelo de 27B a ~2.5 bits por peso requiere aproximadamente 8.5-9 GB de pesos, más overhead de contexto y activaciones; cabe en GPUs con 12 GB o más.
- GPU recomendada: Radeon RX 6800 XT (RDNA2, gfx1030) usada en las pruebas; cualquier GPU RDNA2 o RDNA3 con soporte ROCm debería funcionar. Se requiere ROCm 7.2.4 o compatible.
- No requiere tensor cores: la ruta de prefill usa fp32 como respaldo, por lo que GPUs AMD sin tensor cores pueden ejecutar el modelo.
- Opciones de despliegue: llama.cpp con el fork `llama.cpp-escha` (rama `escha-w2-dense`) más el parche de este repo. No funciona con llama.cpp estándar ni con el fork sin parche en AMD. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: decode ~18.9 tok/s en RX 6800 XT a batch 1; prefill ~120-132 tok/s para prompts de 128-512 tokens. La CPU fallback es extremadamente lenta en batch 1 (el autor advierte que una decodificación de 27B no terminaría en tiempo útil).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Hardware requerido | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B Escha W2 (CUDA, upstream) | 27B | 2.469 bits (ESCHAM) | no disponible | NVIDIA con tensor cores (prefill) | MIT (fork), modelo base no especificado |
| Qwen3.8-27B Escha W2 (AMD, este port) | 27B | 2.469 bits (ESCHAM) | no disponible | AMD RDNA2/RDNA3 (HIP) | MIT (parche) |
| Qwen3-30B-A3B (referencia estándar) | 30B (3B activos) | FP16/BF16 | 128K | NVIDIA o AMD, requiere más VRAM | Apache 2.0 |

No se dispone de comparativas de calidad entre el modelo cuantizado ESCHAM y otras cuantizaciones (GGUF Q2_K, etc.) en la información proporcionada. La comparativa se limita a aspectos técnicos de ejecución.

## Limitaciones y advertencias

- Este repositorio no contiene pesos del modelo; solo un parche y un script de verificación. Para usar el modelo hay que descargar el GGUF de `aj9o9/Qwen3.8-27B-Escha-W2-GGUF` y aplicar el parche al fork `llama.cpp-escha`.
- El modelo base no es compatible con llama.cpp estándar; requiere el fork específico. El parche solo funciona en GPUs AMD con soporte HIP/ROCm.
- La cuantización a 2 bits implica una degradación significativa de calidad respecto al modelo original; no se han publicado benchmarks de calidad en este repo.
- La ruta de prefill en AMD usa fp32 sin tensor cores, lo que resulta en un prefill ~5x más lento que en una RTX 3090 (132 vs 700 tok/s en pp512).
- La validación numérica del port cubre la equivalencia con la implementación CPU, pero no valida la calidad del modelo frente al runtime original de EschaLabs; esa validación se hizo solo en el lado CUDA.
- La licencia MIT se aplica al parche, pero la licencia del modelo base (Qwen3.8-27B) y del formato ESCHAM no se especifica; antes de uso comercial, verificar los términos de Escha Labs y de Qwen.
- El script de verificación requiere ejecutar `llama-eval-callback` con un prompt corto; la CPU fallback es extremadamente lenta en batch 1, por lo que no es viable para generaciones largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yaminerl/escha-amd-port
- GGUF del modelo base: https://huggingface.co/aj9o9/Qwen3.8-27B-Escha-W2-GGUF
- Fork original de llama.cpp: https://github.com/Ajay9o9/llama.cpp-escha (rama `escha-w2-dense`)
- Port en GitHub (mismo autor): https://github.com/YanissAmz/escha-port
- README del port en GitHub: https://github.com/YanissAmz/escha-port/blob/master/README.md
