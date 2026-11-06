# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-P4 es una cuantización experimental del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicada por el usuario txgsync. Su particularidad es que los expertos enrutados (routed experts) del componente MoE no se almacenan como pesos cuantizados convencionales, sino como semillas SeedLM: cada bloque de 8 pesos de experto se representa mediante una semilla de 16 bits generada por un LFSR, 4 coeficientes int4 y un código de exponente de 4 bits. La GPU reconstruye los pesos a partir de las semillas dentro de la propia multiplicación de matrices, lo que reduce el tamaño del repositorio de 113,3 GB (modelo MLX 4-bit de referencia) a 105,7 GB.

El modelo conserva intactos el resto de componentes del checkpoint base mlx-community/Qwen3.8-Flash-Next-4bit-mtp: atención, capas DeltaNet, expertos compartidos, routers, tabla PLE, embeddings, LM head, torre de visión y cabeza MTP. Con 96.952.835.987 parámetros totales (unos 96,95 mil millones), es un modelo MoE de gran tamaño pensado para ejecutarse en Apple Silicon mediante mlx-vlm o en GPUs NVIDIA a través del motor CUDA propio del proyecto NanoSeedLM.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión poco habitual (generación de pesos en tiempo de cómputo a partir de semillas) aplicada a un MoE de casi 100 mil millones de parámetros; por otro, advierte de que se trata de una vista previa de investigación, no de un modelo listo para producción. El propio autor recomienda usar una cuantización establecida del modelo base para trabajo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas DeltaNet, torre de visión y cabeza MTP; expertos enrutados representados como semillas SeedLM (LFSR) |
| Parámetros totales | 96.952.835.987 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine grupo 32 en pesos no-expertos; expertos enrutados a 4,5 bits por peso (P = 4: semilla 16-bit + 4 coeficientes int4 + exponente 4-bit); routers 8-bit grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX), con tensores auxiliares `.seeds`, `.coefs`, `.exp_bias` y `.codes` para los expertos enrutados |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) con 48 capas y 512 expertos enrutados por capa, complementado con capas DeltaNet, expertos compartidos, routers y una tabla PLE (probablemente de embeddings posicionales o de prompt). Incluye además una torre de visión (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) heredada del checkpoint MLX de referencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo original de Qwen y no se detallan en la información proporcionada.

La innovación técnica de esta variante es el esquema SeedLM: los 120,8 mil millones de pesos de los expertos enrutados (48 capas × 512 expertos) se comprimen a 4,5 bits por peso mediante una búsqueda exhaustiva de semillas. Para cada bloque de 8 pesos se probaron las 65.535 semillas posibles y se seleccionó la que minimizaba el error ponderado por la media cuadrática de la activación de entrada, usando estadísticas de activación del imatrix de Unsloth (45 fragmentos de 18.432 tokens). La decodificación de las semillas se realiza dentro del kernel de multiplicación de matrices, tanto en el motor CUDA de NanoSeedLM como en la implementación MLX. El resto de pesos proviene sin cambios del modelo mlx-community/Qwen3.8-Flash-Next-4bit-mtp (4-bit affine, grupo 32), lo que garantiza que atención, visión y cabeza MTP mantengan la calidad de la cuantización de referencia.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque el autor indica que no se probaron entradas de imagen ni de vídeo en esta variante.
- Generación de código y matemáticas: capacidades propias del modelo base, no verificadas específicamente en esta cuantización.
- Tool calling y function calling: presumiblemente soportados por herencia del modelo base, aunque no se documentan explícitamente en la model card.
- Razonamiento multi-paso y uso como agente: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Cabeza MTP (multi-token prediction) incluida, heredada del checkpoint MLX de referencia.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Investigación sobre compresión de MoE: el modelo sirve como banco de pruebas para estudiar la viabilidad de representar expertos enrutados como semillas LFSR y medir el impacto en divergencia KL y perplejidad frente a cuantizaciones affine equivalentes.
- Inferencia en Apple Silicon con memoria limitada: en Macs de 128 GB, el modelo cabe con la tabla PLE en SSD, lo que permite ejecutar un MoE de casi 100 mil millones de parámetros en hardware de consumo de gama alta mediante mlx-vlm 0.7.12 o superior.
- Despliegue en GPUs NVIDIA de gama media: con el motor CUDA nslm-qwen4-gen y `--expert-cache-gb 8`, el modelo puede ejecutarse en una RTX 4080 de 16 GB manteniendo los expertos en memoria host y una caché en VRAM, lo que facilita pruebas en estaciones de trabajo modestas.
- Experimentación con streaming de expertos: la opción `--stream-experts` permite probar el modelo en máquinas con menos VRAM, útil para validar arquitecturas de serving con offload dinámico.
- Evaluación comparativa de métodos de cuantización: el modelo permite comparar directamente SeedLM P=4 contra 4-bit affine grupo 32 en las mismas condiciones (motor CUDA, wikitext-2), aportando datos para decidir qué esquema conviene en producción.
- Docencia y divulgación técnica: como ejemplo práctico de generación de pesos en tiempo de cómputo y de búsqueda de semillas ponderada por activaciones, resulta útil en cursos avanzados de compresión de modelos.
- Prototipado de asistentes multimodales en local: para desarrolladores que quieran experimentar con un pipeline image-text-to-text de gran tamaño sin depender de la nube, aceptando las limitaciones de calidad y velocidad de esta variante.

## Benchmarks y rendimiento

El autor publica una comparación de calidad frente a mlx-community/Qwen3.8-Flash-Next-4bit-mtp sobre 1.024 tokens de wikitext-2, con ambos modelos ejecutados en el motor CUDA de NanoSeedLM:

| Modelo | Divergencia KL media | Divergencia KL mediana | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| Modelo MLX 4-bit (referencia) | 0 | 0 | 100 % | 2,396 |
| Este modelo (P = 4) | 0,177 | 0,013 | 91,9 % | 2,500 |

Error relativo de los pesos de los expertos enrutados (media sobre las 48 capas):

| Proyección | Error relativo | Error relativo ponderado por activación |
|---|---|---|
| `gate_proj` | 0,0862 | 0,0770 |
| `up_proj` | 0,0862 | 0,0772 |
| `down_proj` | 0,0869 | 0,0759 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte de que la referencia es un modelo cuantizado, no BF16, y que 1.024 tokens es una muestra pequeña; además, señala que el error de pesos no predice bien la divergencia KL y que añadirá comparaciones contra BF16 en el futuro.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 105,7 GB. En el motor CUDA, los expertos pueden residir en memoria host con una caché en VRAM configurable (`--expert-cache-gb`); el autor cita 8 GB de caché en una RTX 4080 de 16 GB.
- GPU recomendadas: NVIDIA Ampere o superior para el motor CUDA (RTX 30/40, A100, H100); Apple Silicon para mlx-vlm.
- ¿Cabe en GPU de consumo? En una RTX 4080 de 16 GB solo con caché parcial de expertos y offload a memoria host o streaming desde disco. En Macs de 128 GB cabe con la tabla PLE en SSD; macOS reserva por defecto unos 96 GB de 128 GB para la GPU.
- Opciones de despliegue: mlx-vlm 0.7.12 o superior con `--trust-remote-code` en Apple Silicon; motor CUDA NanoSeedLM (`nslm-qwen4-gen`) en NVIDIA; oMLX no es compatible todavía porque elimina `model_file` de las configuraciones `qwen4_exp`. El motor Metal de NanoSeedLM aún no ejecuta este modelo.
- Latencia y throughput: no disponibles de forma numérica. El autor indica que la decodificación por semillas es más lenta que la decodificación affine del mismo tamaño; en el modelo K2-Horizon-MoVA la diferencia fue del 14 % al 21 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de expertos | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-P4 (este) | 96,95 B | no disponible | SeedLM P=4, 4,5 bits/peso | 105,7 GB | qwen-community-1.0 | Hugging Face, experimental |
| mlx-community/Qwen3.8-Flash-Next-4bit-mtp | no disponible | no disponible | 4-bit affine grupo 32, 5,0 bits/peso | 113,3 GB | qwen-community-1.0 | Hugging Face, estable |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | sin cuantizar | no disponible | qwen-community-1.0 | Hugging Face, oficial |

La comparación se limita a variantes del mismo modelo base, ya que no se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada. Frente al MLX 4-bit, este modelo reduce el tamaño un 6,7 % a costa de un acuerdo top-1 del 91,9 % y una perplejidad un 4,3 % superior en la muestra evaluada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que su salida no es idéntica a la del modelo original y recomienda usar una cuantización establecida para trabajo real.
- Requiere `--trust-remote-code` por el uso de archivos de modelo personalizados (`nanoseedlm_qwen4.py`, `nanoseedlm_seeds.py`), lo que implica ejecutar código no auditado.
- La evaluación de calidad es limitada: solo 1.024 tokens de wikitext-2, referencia cuantizada en lugar de BF16, y sin comparación contra el modelo original en BF16.
- No se probaron entradas de imagen ni de vídeo, pese a que el pipeline declarado es image-text-to-text.
- Rendimiento inferior al affine: la decodificación por semillas es entre un 14 % y un 21 % más lenta que la affine de igual tamaño según medidas en otro modelo del mismo proyecto.
- Problemas de memoria en macOS: con 105,7 GB y una reserva por defecto de unos 96 GB para la GPU en Macs de 128 GB, es necesario mantener la tabla PLE en SSD; el autor no ha probado esta configuración con este modelo concreto.
- Incompatibilidad con oMLX: la herramienta elimina `model_file` de las configuraciones `qwen4_exp`, por lo que no carga los archivos de modelo del repositorio sin un parche.
- El offload de expertos MoE de oMLX lee expertos cuantizados y puede no aplicarse a expertos representados como semillas.
- Licencia Qwen Community License 1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que impone condiciones específicas distintas de las licencias permisivas habituales.
- Sesgos y alucinaciones: no documentados en la información disponible; se heredan los del modelo base, no evaluados en esta variante.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantización MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF de Unsloth (estadísticas de activación): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Guía para crear una carpeta de modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/make-a-model.md
- Guía de ejecución y serving: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Mediciones de divergencia KL: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-04-qwen38-kld-vs-4bit.md
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
