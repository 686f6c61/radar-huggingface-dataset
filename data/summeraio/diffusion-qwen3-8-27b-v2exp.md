# summerAIO/Diffusion-Qwen3.8-27B-v2exp

## Resumen

Diffusion-Qwen3.8-27B-v2exp es un artefacto de investigación publicado por el usuario summerAIO en Hugging Face: un ajuste fino del modelo base Qwen/Qwen3.8-27B (27.356 millones de parámetros) convertido en un modelo de lenguaje de difusión enmascarada por bloques (block masked-diffusion) con decodificación paralela. El autor lo describe explícitamente como "research artifact, not a general-purpose chat model", es decir, no es un sustituto directo del modelo conversacional original, sino una prueba de concepto sobre decodificación no autoregresiva.

El modelo parte de un adaptador QLoRA de difusión enmascarada (rango 32) sobre Qwen3.8-27B, al que se añade una segunda fase de entrenamiento ("parallel commit") para que las posiciones enmascaradas predigan los siguientes 1-3 tokens, y finalmente se fusiona en pesos bf16. La decodificación se realiza bloque a bloque de 30 tokens, con atención causal sobre el historial y bidireccional dentro del bloque, leyendo la posición *p* desde la fila oculta de la posición *p-1*.

Su relevancia es fundamentalmente metodológica: mide de forma honesta el equilibrio entre velocidad de generación y calidad en decodificación paralela, mostrando que la aceleración preservando calidad se queda en torno a 14-20 tokens/s frente a 13,7 tokens/s del modo serial, mientras que velocidades de 25-30 tokens/s introducen degradación visible. El foco lingüístico es japonés e inglés, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) adaptado a difusión enmascarada por bloques con decodificación paralela |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (decodificación por bloques de 30 tokens; el prompt/historial se atiende de forma causal) |
| Tipos de cuantizacion | BF16 (checkpoint fusionado); el autor validó y midió con NF4 + GemLite W4A16 (HQQ, grupo 128, kernel GEMM) |
| Idiomas soportados | ja, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.8-27B y lo reformula como un modelo de difusión enmascarada por bloques: cada bloque de 30 tokens se rellena con el token de máscara (`tokenizer.pad_token_id`), la atención es causal sobre el prompt y el historial pero bidireccional dentro del bloque, y cada pasada lee la posición *p* desde la fila oculta de la posición *p-1*. El entrenamiento parte de un adaptador QLoRA de difusión enmascarada en el paso 2705 (rango 32, aplicado a `q_proj`, `v_proj`, `o_proj`, `in_proj_qkv` y `out_proj`).

La fase de "parallel commit" comprende 4.711 actualizaciones, cada una sobre un bloque de 30 tokens con 8 longitudes aleatorias de "prefijo ya rellenado", con entropía cruzada sobre las tres posiciones enmascaradas siguientes (peso 1) y las posteriores (peso 0,25), learning rate 2e-5 con decaimiento coseno. Los datos son 6.000 pares prompt/respuesta en japonés (respuestas truncadas a 120 tokens) procedentes de `FreedomIntelligence/alpaca-gpt4-japanese` (Apache 2.0), `usable-japanese-llm/sft-magpie-filtered` y `Kendamarron/magpie-japanese-math-instruction-17k-qwen2.5-bakeneko-32b-instruct` (Apache 2.0). El autor advierte que parte del texto fue generado por otros LLM y que deben revisarse sus términos antes de un uso comercial.

La innovación técnica central es la regla de auto-paso: en cada pasada se confirma la secuencia más larga de izquierda a derecha (máximo 8 tokens) cuya confianza conjunta supera un umbral y que no contiene dos tokens adyacentes idénticos; esta guarda eliminó la corrupción por duplicados adyacentes (0,000-0,002 frente a 0,046-0,124 sin ella, a la misma velocidad). El código del decodificador exacto está en la carpeta `code/` del repo (`prefix_engine.py`, motor de bloques con caché de prefijo, y `auto_steps.py`).

## Capacidades

- Generación de texto en japonés e inglés mediante decodificación por bloques de difusión enmascarada.
- Decodificación paralela de 1 a 3 tokens por pasada en el mejor de los casos, con regla de auto-paso por confianza conjunta.
- Predicción de tokens a +1, +2 y +3 posiciones (precisión top-1 en held-out de aproximadamente 0,37-0,45 / 0,28-0,32 / 0,14-0,18).
- Inferencia con caché de prefijo y CUDA graph, con pesos cuantizados a NF4 + GemLite W4A16.
- No soporta `generate()` estándar de forma correcta: requiere el decodificador específico del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No hay ajuste de seguridad más allá del modelo base.

## Casos de uso

- Investigación en decodificación no autoregresiva: el modelo sirve como banco de pruebas reproducible para estudiar difusión enmascarada por bloques sobre un transformer de 27B, con el decodificador de referencia incluido en `code/`.
- Estudio del compromiso velocidad/calidad: permite replicar la curva de tokens/s frente a umbral de confianza (13,7 a 30,0 tokens/s) y medir la degradación asociada en japonés.
- Experimentos de decodificación especulativa y parallel commit: útil para evaluar reglas de confirmación de tokens (confianza conjunta, guarda anti-duplicados) en un entorno controlado.
- Evaluación de cuantización en modelos de difusión: el autor validó el checkpoint bf16 recargándolo en NF4 + GemLite (`verification.json`), lo que sirve de referencia para pipelines de cuantización W4A16.
- Generación de texto en japonés para prototipos de investigación: con umbrales de confianza de 0,5 o 0,3 produce texto coherente con fallos menores, adecuado para pruebas internas, no para producción.
- Docencia y divulgación: ejemplo didáctico de cómo adaptar un LLM autoregresivo a un paradigma de difusión y de cómo medir honestamente el rendimiento sin benchmarks inflados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona medidas de velocidad de generación en un entorno concreto: batch size 1, NVIDIA A100-SXM4-40GB, pesos en NF4 + GemLite W4A16 (HQQ, grupo 128, kernel GEMM), caché de prefijo y CUDA graph, unos 65 ms por pasada de difusión para un bloque de 30 tokens, 5 prompts en japonés y hasta 120 tokens de salida.

| Decodificación | tokens/s | tokens por pasada | Calidad de texto |
|---|---|---|---|
| Serial (1 token/pasada, referencia) | 13,7 | 1,00 | referencia |
| Auto, confianza conjunta >= 0,5 | 19,2 | 1,45 | coherente, fallos pequeños ocasionales |
| Auto, confianza conjunta >= 0,3 | 20,1 | 1,58 | coherente, fallos menores (partículas duplicadas, finales omitidos) |
| Auto, confianza conjunta >= 0,15 | 25,0 | 1,97 | corrupción visible (caracteres omitidos o extraños) |
| Auto, confianza conjunta >= 0,05 | 27,0 | 2,29 | corrupción visible |
| Auto, confianza conjunta >= 0,02 | 30,0 | 2,48 | corrupción visible |

Precisión top-1 en held-out para tokens a +1/+2/+3 posiciones: aproximadamente 0,37-0,45 / 0,28-0,32 / 0,14-0,18. El autor subraya que la calidad se juzgó leyendo salidas y con comprobaciones mecánicas simples sobre solo cinco prompts, y que no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada: en BF16, los 27.356 millones de parámetros ocupan aproximadamente 54,7 GB de pesos, por lo que se necesita al menos una GPU de 80 GB (A100/H100) o varias GPUs. En NF4 (4 bits, grupo 128) los pesos bajan a unos 14-16 GB, más caché de prefijo, KV cache y overhead de CUDA graph.
- GPU recomendadas: el autor midió en NVIDIA A100-SXM4-40GB con NF4 + GemLite W4A16. Para BF16 se requiere A100 80GB, H100 80GB o H200.
- GPU de consumo: con cuantización NF4 y GemLite, el modelo podría caber en GPUs de 24 GB (RTX 4090, RTX 3090) siempre que se use el motor de decodificación del repositorio; no se documentan pruebas en estas GPUs.
- Despliegue: no es compatible con `generate()` estándar ni con pipelines convencionales de vLLM, TGI, llama.cpp u Ollama tal cual. Requiere el decodificador de `code/` (`prefix_engine.py`, `auto_steps.py`) sobre Transformers.
- Latencia y throughput: unos 65 ms por pasada de difusión para un bloque de 30 tokens en A100-SXM4-40GB con NF4 + GemLite; entre 13,7 y 30,0 tokens/s según el umbral de auto-paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-Qwen3.8-27B-v2exp (summerAIO) | 27,36B | no disponible (bloques de 30 tokens) | Difusión enmascarada con decodificación paralela | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion-Qwen3.8-27B (summerMC) | no disponible | no disponible | Difusión sobre Qwen3.8-27B | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | 27,36B (según checkpoint derivado) | no disponible | Transformer autoregresivo | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, paradigma y licencia.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo conversacional de propósito general ni un sustituto directo del modelo base.
- `generate()` estándar no decodifica el modelo como se espera; es imprescindible usar el decodificador de `code/`.
- Enfoque centrado en japonés; el inglés figura en los metadatos, pero la evaluación se hizo con prompts en japonés.
- Evaluación muy pequeña: cinco prompts y comprobaciones mecánicas simples; no hay benchmark.
- Las salidas pueden contener caracteres omitidos o duplicados y números incorrectos cuando se confirman varios tokens por pasada.
- La predicción paralela más allá del siguiente token es débil (top-1 de 0,14-0,18 a +3), lo que limita las ganancias de velocidad.
- Sin ajuste de seguridad adicional más allá del modelo base; riesgo de sesgos y alucinaciones heredado.
- Parte de los datos de entrenamiento fue generada por otros LLM; deben revisarse sus términos antes de un uso comercial aunque la licencia del checkpoint sea Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/Diffusion-Qwen3.8-27B-v2exp
- Variante previa de otro autor: https://huggingface.co/summerAIO/Diffusion-Qwen3.8-27B
- Otra variante: https://huggingface.co/summerMC/Diffusion-Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
- Dataset de entrenamiento: https://huggingface.co/datasets/usable-japanese-llm/sft-magpie-filtered
- Dataset de entrenamiento: https://huggingface.co/datasets/Kendamarron/magpie-japanese-math-instruction-17k-qwen2.5-bakeneko-32b-instruct
