# ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l5

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l5` es un adaptador LoRA que se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para hacer que el modelo razone en un "dialecto" de chain-of-thought comprimido a nivel L5, es decir, una única expresión colapsada (por ejemplo, `18/3*2=12` en lugar de una cadena de razonamiento extensa). El autor, ssurface, lo publica como una pieza de una colección más amplia sobre compresión de cadenas de razonamiento, y este adaptador concreto es una **ablación** para comparar el diseño de recompensas: se entrenó con una variante de recompensa `sft_length` que penaliza la desviación respecto a la longitud de la cadena SFT de cada ejemplo.

El modelo se entrenó con GRPO sobre el conjunto de entrenamiento de GSM8K reexpresado a nivel L5 por un modelo profesor, con 6993 ejemplos y una longitud mediana de cadena de 16 caracteres dentro de la etiqueta `thinking`. No se ha evaluado de forma independiente: la model card indica explícitamente que no fue sometido a benchmarks propios y que existe como artefacto de entrenamiento para la rejilla de ablaciones. La licencia es Apache-2.0, el idioma soportado es inglés y el adaptador pesa 0.1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; modelo base 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; heredada del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo `Qwen/Qwen3-4B-Instruct-2507` tras fusionar previamente un adaptador SFT de nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`). El entrenamiento usa `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, no kernels fusionados, porque el autor detectó que la ruta fusionada producía matrices `lora_B` todas a cero (adaptadores inertes). La configuración de GRPO incluye 8 generaciones por prompt, batch de 64 con acumulación 1, máximo de 256 tokens de completado, learning rate 1e-05, coeficiente KL beta 0 y loss tipo `dapo`. El conjunto de prompts es `gsm8k_grpo_balanced_1k.json` y se entrenó sobre el modelo SFT fusionado `merged_new_fixed/l5`.

La recompensa combina cuatro componentes: `correctness` (que pondera según el número de pasos de la solución dorada), `format` (exige una estructura `thinking...response` seguida de `#### <respuesta>`), `sft_length` (penaliza la desviación respecto a la longitud de la cadena SFT de cada fila) y `gdpo` (normaliza cada recompensa independientemente dentro del grupo antes de sumar). El entrenamiento se realizó en una única NVIDIA A100 de 80 GB.

## Capacidades

- Razonamiento matemático con chain-of-thought comprimido a nivel L5 (expresión única colapsada, típicamente una fórmula corta).
- Generación de texto conversacional en inglés, limitada a problemas de palabras matemáticas (GSM8K).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está diseñado para razonamiento de un solo paso comprimido.
- Capacidades multilingues: solo inglés.
- Capacidades especiales: compresión extrema de la cadena de razonamiento (mediana de 16 caracteres frente a 532 en L1, un factor de 33x).

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: permite estudiar como afecta la recompensa `sft_length` a la calidad del razonamiento comprimido, comparando con el modelo principal `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`.
- Ablacion de diseno de recompensas en RLHF/GRPO: util para reproducir el experimento del paper "Chain-of-Thought Compression Dialects" y validar la contribucion de cada componente de recompensa.
- Generacion de explicaciones ultracompactas en sistemas de tutoria matematica: puede producir respuestas finales con solo el resultado, sin pasos intermedios, para escenarios donde se prioriza la brevedad sobre la explicacion.
- Evaluacion de robustez de modelos comprimidos: sirve como caso limite para medir la perdida de precision en problemas de dificultad creciente cuando se fuerza una expresion minima.
- Benchmarking de metodos de compresion de razonamiento: permite comparar la calidad de un adaptador entrenado con recompensa `sft_length` frente a otras variantes de recompensa en la misma coleccion.
- Desarrollo de pipelines de RL para compresion de lenguaje: como ejemplo de configuracion GRPO con loss `dapo` y recompensas mixtas, reproducible con `trl` y `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador "no fue evaluado de forma independiente" y que los niveles con numeros reportados son los del conjunto principal de la coleccion. El autor advierte que, al ser un artefacto de ablacion, puede ser peor que el modelo principal del mismo nivel.

## Requisitos de hardware

- El entrenamiento se realizo en 1x NVIDIA A100 80GB.
- Para inferencia, al ser un adaptador LoRA sobre un modelo base de 4B, el modelo fusionado en bf16 ocupa aproximadamente 8 GB de VRAM, por lo que cabe en GPUs consumer como RTX 3090/4090 (24 GB) o incluso en tarjetas de 12-16 GB con cuantizacion adicional.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.
- Opciones de despliegue: al usar `transformers` y `peft`, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay instrucciones oficiales para este adaptador especifico.

## Comparativa con modelos similares

No disponible. Este adaptador es una ablacion especifica dentro de una coleccion de compresion de chain-of-thought, y no se proporcionan comparaciones con otros modelos en la informacion disponible. El unico punto de referencia razonable seria el modelo base `Qwen/Qwen3-4B-Instruct-2507` (sin compresion) o el modelo principal del mismo nivel `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`, pero no se incluyen datos comparativos.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no generaliza a otros dominios sin reentrenamiento.
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles comprimidos como L5.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT de nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados.
- Entrenado con una unica semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo de confianza del 95% de ~2.7 pp con n=1317).
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento, especialmente al forzar respuestas extremadamente comprimidas.
- Solo soporta ingles; no hay garantias de rendimiento en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es un adaptador de investigacion sin garantias de robustez en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-sftlen-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_4b
- Paper tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
