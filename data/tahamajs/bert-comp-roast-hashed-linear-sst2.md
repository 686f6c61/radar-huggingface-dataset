# tahamajs/bert-comp-roast-hashed-linear-sst2

## Resumen

`tahamajs/bert-comp-roast-hashed-linear-sst2` es un checkpoint experimental de compresión de modelos publicado por Taha Majlesi dentro del ecosistema NeuralOps. Se trata de una versión físicamente comprimida de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinada sobre GLUE SST-2 y procesada con el compresor `roast_hashed_linear` (`ROASTCompressor`), que sustituye capas lineales y Conv1D por `ROASTLinear` con compartición de pesos consciente del hardware.

El checkpoint empaquetado corresponde al rango `k=64` y reduce el recuento de parámetros a 24.622.850 (una reducción del 77,51 %, ratio de compresión físico de 4,446x). Sobre esa topología comprimida se aplica un "healing" con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 s) para recuperar parte de la precisión perdida.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como artefacto reproducible para estudiar el compromiso entre ratio de compresión y degradación de tareas downstream. No es un modelo apto para producción: la precisión final en SST-2 es del 50,92 %, es decir, un delta de -40,71 puntos frente al profesor original (91,63 %), lo que lo sitúa prácticamente en el nivel de un clasificador binario aleatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (`bert-base-uncased`) con capas lineales/Conv1D sustituidas por `ROASTLinear` (weight sharing con hashing) |
| Parametros totales | 24.622.850 (comprimido, `k=64`); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT admite 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en `pytorch_model.bin`; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch serializado (`pytorch_model.bin`), requiere reconstruccion de la topologia NeuralOps antes de cargar el `state_dict` |

## Arquitectura y entrenamiento

La arquitectura de partida es un BERT-base estándar (12 capas, `D=768`, encoder bidireccional). El compresor `roast_hashed_linear` reemplaza las capas lineales y Conv1D elegibles por `ROASTLinear`, una implementación de compartición de pesos con hashing orientada a hardware. El resultado es una reducción física del 77,51 % de parámetros, hasta 24,6 M. El proceso de compresión se evalúa en cuatro rangos (`k=256`, `128`, `64`, `32`) sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA RTX 3090 de 24 GB.

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" LoRA dirigido de rango 8 (50 pasos, `lr=2e-4`, 45 segundos). En este modelo, el healing eleva la precisión del 49,20 % (zero-shot) al 50,92 % (con LoRA), una mejora de solo 1,72 puntos. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF/DPO. Los cuatro rangos evaluados producen el mismo recuento de parámetros comprimidos (24.622.850) y el mismo ratio (4,45x), lo que sugiere que el rango `k` afecta a la descomposición interna pero no al tamaño físico empaquetado en esta configuración.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, heredada del ajuste fino de SST-2.
- Generación de texto: no disponible; el modelo es un clasificador de secuencias, no un modelo causal.
- Razonamiento, código, matemáticas y visión: no soportados.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso principal: banco de pruebas para investigación en compresión de modelos y evaluación de técnicas de recuperación con LoRA.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como referencia reproducible del efecto de `roast_hashed_linear` a `k=64` sobre una tarea downstream concreta, permitiendo comparar contra los rangos `k=256`, `128` y `32` documentados en `compression_summary.json`.
- Estudio de técnicas de healing con LoRA: permite medir cuánto recupera un adaptador LoRA de rango 8 y 50 pasos sobre una topología comprimida, con un delta documentado de +1,72 puntos (49,20 % → 50,92 %).
- Validación de pipelines de compresión en NeuralOps: útil para verificar la reconstrucción de topología (`compress_model` + `load_state_dict` con `strict=False`) antes de desplegar el pipeline en modelos mayores.
- Benchmarking de infraestructura de inferencia: al ocupar 47,2 MB de pesos, permite probar orquestación, serialización y carga de checkpoints comprimidos en entornos con recursos mínimos.
- Docencia y divulgación: ejemplo tangible de los límites de la compresión agresiva (4,45x) cuando no va acompañada de un healing suficiente, con una caída de 40,71 puntos frente al profesor.
- Pruebas de humo de integración con `transformers` y `neuralops`: el snippet de la model card permite validar el flujo completo de descarga, reconstrucción y predicción en pocas líneas.
- No recomendado para clasificación de sentimiento real en producción: la precisión del 50,92 % equivale prácticamente a una asignación aleatoria en una tarea binaria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Rank (`k`) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc (LoRA) | Parity vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,92 % | -40,71 % |
| 128 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,80 % | -40,83 % |
| 64 (empaquetado) | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,92 % | -40,71 % |
| 32 | 4,45x | 24.622.850 (-77,5 %) | 49,20 % | 50,46 % | -41,17 % |

Evaluación realizada sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090. El baseline del profesor (`bert-base-uncased` afinado en SST-2) alcanza 91,63 % de precisión. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,6 M de parámetros y pesos de 47,2 MB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM libre; el autor evaluó en una RTX 3090 (24 GB), pero es sobredimensionada para este checkpoint.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX 3060, 4060, 4090, etc.) y en GPUs integradas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El flujo previsto es `transformers` + `neuralops` (reconstrucción de topología con `compress_model` y carga del `state_dict` con `strict=False`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-roast-hashed-linear-sst2` (k=64) | 24,6 M (comprimido) | no disponible | 50,92 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación relevante es contra el profesor: el checkpoint comprimido reduce parámetros un 77,5 % pero pierde 40,71 puntos de precisión, por lo que no es competitivo con alternativas destiladas o afinadas de tamaño similar en términos de calidad. Su valor es metodológico, no de rendimiento.

## Limitaciones y advertencias

- Precisión muy baja: 50,92 % en SST-2 (clasificación binaria), prácticamente equivalente a azar; no apto para uso en producción.
- Delta de -40,71 puntos frente al profesor (91,63 %), lo que indica que el healing con LoRA de rango 8 y 50 pasos no compensa la compresión agresiva en esta configuración.
- Resultados declarados por el autor y marcados como no verificados (`verified: false`) en la model card.
- Solo inglés; sin capacidades multilingües.
- Modelo de clasificación de secuencias: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Requiere reconstruir la topología NeuralOps antes de cargar los pesos; no es un checkpoint estándar de `transformers` cargable directamente con `AutoModel.from_pretrained`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto experimental sin validación comunitaria.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas dado el bajo rendimiento.
- Licencia MIT permite uso comercial, pero el rendimiento hace inviable cualquier aplicación real.
- No se documentan sesgos específicos; al derivar de `bert-base-uncased`, hereda los sesgos del corpus original, aunque la compresión extrema los hace difíciles de caracterizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-roast-hashed-linear-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor `roast_hashed_linear`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/roast_hashed_linear.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
