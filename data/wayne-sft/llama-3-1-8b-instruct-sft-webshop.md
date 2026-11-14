# wayne-SFT/Llama-3.1-8B-Instruct-SFT-WebShop

## Resumen

Llama-3.1-8B-Instruct-SFT-WebShop es un checkpoint de ajuste fino supervisado (SFT) de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario wayne-SFT. No se trata de un modelo de propósito general, sino de un punto de partida especializado para aprendizaje por refuerzo (RL) en el entorno WebShop, un benchmark de compra de productos en una tienda web simulada. El autor lo describe explícitamente como un "start checkpoint" para RL, entrenado mediante clonación de comportamiento sobre trayectorias expertas recogidas por el propio autor.

El modelo conserva la arquitectura y el tamaño del Llama 3.1 8B Instruct original (8.030.261.248 parámetros, transformer denso), pero sus pesos han sido ajustados con SFT de parámetros completos sobre el conjunto de datos interno `ws_sft_div233`. El checkpoint publicado corresponde al paso global 150, es decir, la época 1 de 2, con learning rate 1e-5, batch global 64 y longitud máxima de secuencia 2432.

Su relevancia es acotada y muy específica: sirve como inicialización para pipelines de RL sobre WebShop, no como asistente conversacional general. El autor reporta una tasa de éxito del 42,5 % en 1000 objetivos de desarrollo de WebShop (goals 500-1499, seed 0). Los pesos se distribuyen en fp32 (los 291 tensores son F32), lo que explica el tamaño del repositorio de 32,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decodificador autoregresivo |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max sequence length 2432 |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el campo `dtype` de `config.json` indica `bfloat16`) |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3.1, sin verificación específica) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (7 shards, todos los tensores en F32) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct: un transformer denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El ajuste se realizó con SFT de parámetros completos (full-parameter SFT) sobre trayectorias expertas recogidas por el autor exclusivamente en los objetivos de entrenamiento de WebShop (conjunto interno `ws_sft_div233`). No se menciona uso de RLHF, DPO ni decodificación especulativa; el objetivo declarado es la clonación de comportamiento como inicialización para una fase posterior de RL.

Los hiperparámetros documentados son: learning rate 1e-5, batch global 64, longitud máxima de secuencia 2432, y un total de 2 épocas previstas, de las cuales el checkpoint publicado corresponde a la época 1 (paso global 150). Los pesos se guardaron tal cual se entrenaron, sin conversión, en fp32, aunque el `config.json` declara `bfloat16` como dtype. El repositorio incluye `chat_template.jinja`, `generation_config.json` y el tokenizador completo, lo que permite cargarlo directamente con `transformers`.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general heredados del modelo base Llama 3.1 8B Instruct.
- Ejecución de tareas de compra en el entorno WebShop: navegación por catálogo, búsqueda de productos y selección de artículos según objetivos.
- Clonación de comportamiento de trayectorias expertas en WebShop (política inicial para RL).
- Soporte de tool calling y function calling: no documentado específicamente en esta ficha; heredado del modelo base pero no verificado tras el SFT.
- Capacidades de agente multi-paso: orientadas al bucle de interacción de WebShop, no validadas en otros entornos.
- Capacidades multilingües: no disponibles (no se documentan idiomas ni evaluación multilingüe).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Inicialización de pipelines de RL sobre WebShop: el checkpoint sirve como política de arranque para entrenamiento con refuerzo, evitando partir de un modelo sin sesgo hacia el entorno.
- Investigación en clonación de comportamiento: permite estudiar cómo el SFT sobre trayectorias expertas afecta a la política antes de aplicar RL, con un punto de comparación documentado (42,5 % de éxito en dev).
- Reproducción de experimentos de agentes web: el autor publica hashes SHA-256 de todos los ficheros, lo que facilita la verificación de reproducibilidad en estudios de agentes de compra.
- Evaluación de técnicas de RL frente a SFT puro: al ser un checkpoint intermedio (época 1 de 2), es útil para medir la ganancia marginal de cada etapa de entrenamiento.
- Desarrollo de agentes de compra simulada: el modelo puede integrarse en entornos tipo WebShop para probar estrategias de búsqueda y selección de productos antes de desplegar en sistemas reales.
- Estudio de estabilidad del entrenamiento: los hiperparámetros y el estado exacto del checkpoint permiten analizar curvas de aprendizaje y divergencias en SFT de parámetros completos sobre 8B.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| WebShop dev (goals 500-1499, 1000 objetivos, seed 0) | 42,5 % success rate | Checkpoint global step 150 (época 1 de 2) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 32 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 40 GB o más (A100 40GB/80GB, H100).
- VRAM estimada en bf16: alrededor de 16 GB para pesos, más overhead; cabe en A100 40GB, H100 y, con cuantización adicional, en GPUs consumer de 24 GB (RTX 4090) si se convierte a 8 bits.
- GPU recomendadas: A100 80GB o H100 para fp32 sin conversión; A100 40GB o RTX 4090 para bf16.
- Despliegue: compatible con `transformers` y `text-generation-inference` (tags del repo); las herramientas habituales (vLLM, llama.cpp, Ollama) no están verificadas en la información disponible, y llama.cpp requeriría conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SFT-WebShop | 8,03B | no disponible (entrenado a 2432) | SFT WebShop para RL | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (según model card del base) | Asistente general | Llama 3.1 Community | Hugging Face |
| Alternativas SFT específicas de WebShop | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros checkpoints SFT de WebShop comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera de WebShop no está evaluado y probablemente degradado respecto al base.
- Sesgos: no documentados; hereda los del modelo base Llama 3.1, sin análisis específico tras el SFT.
- Riesgo de alucinación: no evaluado en esta ficha; en tareas de compra puede generar acciones o productos inexistentes.
- Contexto: la longitud de contexto no se documenta; el entrenamiento usó secuencias de hasta 2432 tokens, por lo que el comportamiento más allá de esa longitud no está validado.
- Idiomas: no se documentan; no hay evaluación multilingüe.
- Licencia: Llama 3.1 Community License, con términos y política de uso del modelo base; es necesario revisar `LICENSE` y `USE_POLICY.md` antes de uso comercial.
- Pesos en fp32: el repositorio ocupa 32,1 GB y el despliegue en fp32 exige hardware de gama alta; se recomienda convertir a bf16 para producción.
- Checkpoint intermedio: corresponde a la época 1 de 2; no es el modelo final del entrenamiento previsto.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni casos de uso reportados por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.1-8B-Instruct-SFT-WebShop
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Política de uso del base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md
