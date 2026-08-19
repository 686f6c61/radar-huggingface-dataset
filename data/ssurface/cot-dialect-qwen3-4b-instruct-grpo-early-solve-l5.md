# ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-early-solve-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de pensamiento (chain-of-thought) extremadamente comprimidas, en un nivel denominado L5, donde el razonamiento completo se reduce a una única expresión colapsada de una sola línea (por ejemplo, `18/3*2=12`). Este adaptador forma parte de una familia de modelos que investigan la compresión del razonamiento, y en concreto es una ablación diseñada para evaluar el impacto de la recompensa `early_solve` en el diseño de recompensas durante el entrenamiento con GRPO.

El modelo se entrena mediante GRPO sobre un modelo SFT previo (también publicado por el mismo autor), utilizando exclusivamente el conjunto de datos GSM8K reexpresado a nivel L5 por un modelo profesor. La cadena de pensamiento mediana pasa de 532 caracteres en el nivel L1 a 16 caracteres en el nivel L5, un factor de compresión de 33x. El adaptador alcanza un 84.6% de precisión exacta en GSM8K test (n=1317, greedy decoding, sin self-consistency), y un 1.7% en AIME (n=60, fuera de dominio). Es importante destacar que se trata de una pieza de investigación sobre diseño de recompensas, no de un modelo pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-4B-Instruct-2507) + adaptador LoRA |
| Parametros totales | ~4.2B (base) + ~0.1 GB de adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32,768 tokens (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | bfloat16 (base); el adaptador se carga en el dtype del modelo base |
| Idiomas soportados | ingles (entrenado y evaluado solo en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parametros de la familia Qwen3 con soporte nativo de modos thinking y non-thinking. El entrenamiento se realiza en dos etapas: primero un modelo SFT se entrena sobre 6993 ejemplos de GSM8K train reexpresados a nivel L5 por un modelo profesor (con cadenas medianas de 16 caracteres dentro de `thinking`); sobre ese modelo SFT fusionado se aplica GRPO con `trl.GRPOTrainer` sobre transformers estándar con atención `sdpa`, sin kernels fusionados.

La funcion de recompensa combina tres componentes: `correctness` (que pondera la recompensa segun el numero de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (la respuesta debe contener un bloque `thinking...response` seguido de `#### <respuesta>`) y `early_solve` (recompensa alcanzar la respuesta temprano en la secuencia en lugar de tarde). Se usan 8 generaciones por prompt, batch de 16 con 1 acumulacion, max completion de 256 tokens, learning rate de 1e-05, coeficiente KL de 0.0 y loss tipo DAPO. El entrenamiento se ejecuto en una unica NVIDIA A100 80GB. Un detalle tecnico relevante: el autor verifico que todas las matrices `lora_B` del adaptador publicado son distintas de cero, descartando 13 adaptadores que resultaron matematicamente inertes al usar kernels fusionados.

## Capacidades

- Razonamiento matematico con cadena de pensamiento extremadamente comprimida (nivel L5, expresion unica colapsada).
- Generacion de texto en ingles siguiendo el formato de respuesta `thinking...response` + `#### <respuesta>`.
- Resolucion de problemas de matematicas de tipo word problem (GSM8K) con un 84.6% de precision exacta en test.
- Capacidad de tool calling y function calling: no disponible (no documentada para este adaptador; el base Qwen3-4B-Instruct-2507 la soporta, pero el entrenamiento especifico no la cubre).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo esta entrenado para resolver problemas en un unico paso comprimido.
- Capacidades multilingues: no disponible; entrenado y evaluado solo en ingles.
- Thinking mode: el adaptador fuerza una cadena de pensamiento comprimida dentro de `thinking`; no se documenta el modo non-thinking.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: permite estudiar como afecta la compresion extrema del razonamiento a la precision en tareas de matematicas, comparando niveles L1 a L5 dentro de la misma familia de modelos.
- Ablacion de diseno de recompensas en RL: este adaptador concreto sirve para reproducir el experimento de la recompensa `early_solve` frente a la recompensa estandar, como referencia publica para verificar los resultados del paper.
- Evaluacion de robustez del razonamiento comprimido: util para medir la degradacion de precision al reducir la longitud del razonamiento en problemas de dificultad creciente, ya que el autor documenta que la precision cae mas rapido en los niveles comprimidos.
- Generacion de soluciones de matematicas con coste de inferencia reducido: al generar cadenas de 16 caracteres en lugar de cientos, el coste de tokens de salida se reduce drasticamente, lo que puede interesar en entornos con restricciones de latencia o presupuesto.
- Benchmark de generalizacion fuera de dominio: el resultado de 1.7% en AIME sirve como punto de referencia para evaluar la transferencia del razonamiento comprimido a problemas mas dificiles.
- Reproducibilidad cientifica: al publicarse como adaptador abierto con configuracion completa de entrenamiento, permite replicar el pipeline GRPO y verificar las afirmaciones del paper sobre diseno de recompensas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Benchmark | n | Metrica | Resultado |
|---|---|---|---|
| GSM8K (test, greedy, single-turn, sin exemplars, sin self-consistency) | 1317 | Accuracy (exact match) | 84.6% |
| AIME (out-of-domain, no metrica principal) | 60 | Accuracy | 1.7% |

El margen de error declarado es de aproximadamente ±2.7 puntos porcentuales (95% half-width) para n=1317. No se han publicado comparaciones con otros modelos en la informacion disponible; el adaptador es una ablacion de un estudio sobre compresion de CoT, no un modelo de proposito general.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 0.1 GB y se carga sobre el base Qwen3-4B-Instruct-2507, que en bfloat16 ocupa unos 8 GB de VRAM.
- GPU recomendada: cualquier GPU con al menos 8-10 GB de VRAM para inferencia en bfloat16 (por ejemplo, RTX 3090, RTX 4090, A100 80GB). El entrenamiento se realizo en una unica NVIDIA A100 80GB.
- Cabe en GPUs de consumo: si, una RTX 3090 o superior puede ejecutar la inferencia sin problemas.
- Opciones de despliegue: el adaptador se carga con `peft` sobre transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que es un adaptador PEFT, se puede fusionar con el base y exportar a safetensors para su uso en otros motores.
- Latencia y throughput: no disponibles. La generacion de salida es muy corta (cadenas de 16 caracteres), por lo que el coste de decodificacion es minimo en comparacion con un modelo de razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l5` (este adaptador) | ~4.2B (base) + LoRA | 32K | 84.6% | apache-2.0 | HuggingFace (adaptador PEFT) |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5` (modelo principal del mismo nivel) | ~4.2B (base) + LoRA | 32K | no disponible | apache-2.0 | HuggingFace (adaptador PEFT) |
| `Qwen/Qwen3-4B-Instruct-2507` (base sin adaptador) | 4.2B | 32K | no disponible (el informe tecnico de Qwen3 reporta cifras para la familia, no para este tamano en concreto) | apache-2.0 | HuggingFace |

No se dispone de datos comparativos directos con otros modelos de compresion de CoT en la informacion proporcionada. El adaptador es una ablacion especifica y el autor advierte que puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de tipo word problem (GSM8K); no es util para otras tareas de lenguaje general.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles comprimidos (L5 es el nivel mas extremo).
- Es una ablacion de investigacion: fue entrenada para responder una pregunta concreta sobre diseno de recompensas (`early_solve` frente a otras) y puede ser inferior al modelo principal del mismo nivel.
- El adaptador se apila sobre el modelo SFT fusionado, no sobre el base directamente. Cargarlo directamente sobre `Qwen/Qwen3-4B-Instruct-2507` no reproduce el resultado declarado; es obligatorio cargar primero `ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`, fusionar, y luego cargar este adaptador.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento: el resultado de 1.7% en AIME indica una degradacion severa fuera de dominio.
- Sin soporte multilingue: solo ingles.
- No se documentan sesgos especificos, pero al entrenarse solo con GSM8K, el modelo puede mostrar sesgos derivados del contenido del dataset.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo principal del mismo nivel (referencia): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Adaptador SFT previo (requerido para cargar): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Informe tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
