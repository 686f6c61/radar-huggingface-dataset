# staccs/Qwen3-32B-lecore-19g-mlx

## Resumen

Qwen3-32B-lecore-19g-mlx es una cuantización de precisión mixta (en la práctica, uniforme a 4 bits) del modelo Qwen3-32B de Alibaba Qwen, publicada por el usuario staccs bajo el paraguas del proyecto leCore. El objetivo declarado es reducir el peso de un modelo denso de 32.762 millones de parámetros hasta unos 18,62 GB de pesos para que pueda ejecutarse en Apple Silicon mediante la librería MLX. La selección de bits se realizó con la herramienta `requantize` de leCore Unicron, que mide el daño de cada tensor lineal mediante la divergencia KL entre la distribución de siguiente token en fp16 y la cuantizada, sobre un conjunto de calibración con texto de WikiText-2, código Python y sondas estructuradas (prosa, SQL, markdown).

La particularidad del export es que, con el presupuesto de tamaño elegido, el asignador no rebajó ningún tensor lineal por debajo de 4 bits: todos los tensores lineales quedaron a 4 bits con grupo de 64, los embeddings a 4 bits y el `lm_head` a 6 bits. El propio autor lo advierte en la model card: no es una mezcla de precisiones real, y la comparación justa es contra una cuantización MLX estándar a 4 bits, no contra una de 3 bits. El resultado medido en perplejidad es bueno (11,4757 en WikiText-2 frente a 9,7287 del bf16), pero los benchmarks de razonamiento matemático muestran una regresión severa que el autor atribuye a los pesos MLP cuantizados a 4 bits.

Es relevante ahora porque permite ejecutar un modelo denso de 32B en equipos Apple Silicon de gama alta (Mac con 36 GB o más de memoria unificada) con una pérdida de perplejidad moderada, aunque con caveats importantes en tareas de matemáticas con formato few-shot. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado para MLX |
| Parámetros totales | 32.762.123.264 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 4 bits con grupo de 64 en tensores lineales y embeddings; 6 bits en `lm_head` |
| Idiomas soportados | Inglés (según la model card; no se detallan más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (4 shards), librería MLX |

## Arquitectura y entrenamiento

El modelo base es Qwen3-32B, un transformer denso de la familia Qwen3. Esta publicación no entrena ni ajusta el modelo: solo aplica cuantización post-entrenamiento. El proceso de selección de bits consistió en cuantizar cada tensor lineal del decodificador de forma aislada (MLX affine, grupo 64) a 2, 3 y 4 bits, medir el daño como divergencia KL entre la distribución de siguiente token en fp16 y la cuantizada sobre un mix de calibración (3066 tokens de entrenamiento de WikiText-2, 1022 tokens de código Python y una sonda estructurada de leCore con prosa, código, SQL y markdown), y asignar bits de forma voraz empezando por 4 bits en todo y rebajando la opción con menor daño por byte ahorrado hasta encajar en el presupuesto. El histograma final de tensores lineales es `{'2': 0, '3': 0, '4': 448, '8': 0, '16': 0}`, es decir, uniforme a 4 bits.

La conversión se realizó con `mlx_lm.convert` y un `quant_predicate` por capa. No hay datos sobre el entrenamiento original de Qwen3-32B en la información proporcionada (número de tokens, composición del dataset, RLHF/DPO), más allá de que es el modelo base oficial de Qwen. El autor reporta que el modelo cuantizado tiende a razonar en un estilo de "thinking" largo, lo que afecta a la evaluación con límites de generación cortos.

## Capacidades

- Generación de texto conversacional y de propósito general, heredadas del modelo base Qwen3-32B.
- Razonamiento en estilo "thinking" largo: el autor observa que el modelo cuantizado razona correctamente pero se extiende antes de emitir la respuesta final.
- Generación de código: la model card incluye evaluación de perplejidad sobre código Python y la calibración incluye código y SQL.
- Matemáticas: capacidad presente en el modelo base, pero degradada en este export en formato few-shot (ver benchmarks).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (se heredaría del base, pero no se documenta aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; no se detallan otros idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo cabe en 18,62 GB de pesos y puede ejecutarse con `mlx-lm` en equipos Apple Silicon con 36 GB o más de memoria unificada, lo que permite tener un asistente de 32B sin conexión a la nube.
- Generación y revisión de código en local: la perplejidad sobre código Python medida (3,9427 frente a 3,5031 en bf16) indica una degradación moderada, suficiente para autocompletado y explicación de código en un entorno de desarrollo con Apple Silicon.
- Procesamiento de documentación técnica y markdown: la sonda de calibración incluye prosa, SQL y markdown, por lo que el export está ajustado implícitamente a ese tipo de contenido, útil para resumir y transformar documentación.
- Prototipado de pipelines de razonamiento con contexto largo: usando `--max-kv-size 8192` en `mlx_lm.generate`, se puede trabajar con ventanas de hasta 8K tokens en las pruebas del autor, adecuado para análisis de documentos medianos.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantización MLX a 4 bits frente a bf16 en perplejidad y en benchmarks, dado que el autor publica los números exactos.
- Despliegue en entornos con requisitos de licencia permisiva: al conservar Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se respete la atribución.
- Tareas de chat de formato libre con generación larga: el autor señala que la regresión en GSM8K se debe al límite de 320 tokens de generación, por lo que en chat con límites mayores el impacto sería menor (aunque no medido).

## Benchmarks y rendimiento

Datos medidos por el autor sobre los pesos enviados, dequantizados a bf16 y ejecutados en GPU. Perplejidad sobre held-out (WikiText-2 test y una porción distinta de código Python, secuencia 512):

| Modelo | Tamaño (GB) | bpw | WikiText-2 ppl (32704 tok) | Python-code ppl (8176 tok) |
|---|---|---|---|---|
| bf16 referencia | – | 16 | 9,7287 | 3,5031 |
| Este repo (leCore Unicron mix) | 18,62 | 4,547 | 11,4757 | 3,9427 |
| MLX 3-bit estándar, grupo 64 | 14,33 | 3,500 | 39,0780 | 7,4644 |

Benchmarks con lm-eval-harness 0.4.9 (MMLU 5-shot sobre las 10 primeras preguntas de cada una de las 57 materias; GSM8K 5-shot sobre los 100 primeros problemas de test, greedy, 320 tokens nuevos, sin chat template). Son subconjuntos, con ruido de muestreo estimado de ±2–4 puntos:

| Modelo | MMLU (5-shot) | GSM8K strict | GSM8K flexible |
|---|---|---|---|
| leCore mix (este repo) | 85,3% | 27,0% | 34,0% |
| 3-bit affine estándar, grupo 64 (simulado) | 80,9% | 83,0% | 78,0% |

Diagnóstico de la regresión en GSM8K sobre los 20 primeros problemas:

| Configuración | strict | flexible |
|---|---|---|
| bf16 | 70% | 80% |
| Este export | 25% | 30% |
| Este export con MLP en bf16 | 75% | 75% |
| Este export con embeddings en bf16 | 25% | 25% |
| Este export con lm_head en bf16 | 20% | 15% |

El autor concluye que la deriva proviene de los pesos MLP a 4 bits y que el modelo razona correctamente pero en estilo "thinking" largo, superando el límite de 320 tokens antes de escribir la línea `#### answer`.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 18,62 GB; en Apple Silicon se comparte memoria unificada. El autor indica que en un Mac de 36 GB puede ser necesario elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=30000`.
- GPU recomendadas: Apple Silicon (M-series) con al menos 36 GB de memoria unificada; no se documenta soporte para GPU NVIDIA o AMD en este export (la librería es MLX).
- ¿Cabe en GPU consumer? En el contexto de Apple Silicon, sí en modelos con 36 GB o más. No hay datos para GPUs consumer de NVIDIA/AMD con este formato.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto; el autor ofrece variantes GGUF en repos separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Tamaño | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Qwen3-32B-lecore-19g-mlx (este repo) | 32,76B | no disponible | MLX safetensors | 18,62 GB | Apache 2.0 | MMLU 85,3%; GSM8K strict 27,0% |
| Qwen3-32B-lecore-mlx (mismo autor) | 32,76B | no disponible | MLX | 13,01 GB | Apache 2.0 | no disponible |
| Qwen3-32B-lecore-19g-GGUF (mismo autor) | 32,76B | no disponible | GGUF | 38,40 GB | Apache 2.0 | no disponible |
| Qwen3-32B-lecore-GGUF (mismo autor) | 32,76B | no disponible | GGUF | 32,88 GB | Apache 2.0 | no disponible |
| Qwen3-32B bf16 (base) | 32,76B | no disponible | safetensors | ~65 GB (implícito) | Apache 2.0 | ppl WikiText-2 9,7287 |

No se dispone de datos de benchmarks de las variantes GGUF ni del export MLX de 13,01 GB en la información proporcionada.

## Limitaciones y advertencias

- No es una cuantización de precisión mixta real: el asignador mantuvo todos los tensores lineales a 4 bits, por lo que la comparación justa es contra MLX 4-bit estándar, no contra 3-bit.
- Regresión severa en GSM8K: 27,0% strict frente a 83,0% del 3-bit estándar simulado y 70% del bf16 en el diagnóstico de 20 problemas. El autor atribuye la causa a los pesos MLP a 4 bits y recomienda usar cuantizaciones estándar o mayor presupuesto si se necesita matemáticas few-shot en ese formato.
- El modelo tiende a razonar en estilo "thinking" largo, lo que puede agotar límites de generación cortos antes de emitir la respuesta final.
- La perplejidad baja no garantiza calidad: el propio autor advierte que la perplejidad de contexto corto no lo dice todo y recomienda verificar salidas en el caso de uso propio.
- Idiomas: solo se declara inglés; no se documentan capacidades multilingües.
- Longitud de contexto: no documentada en la model card; el ejemplo de uso emplea `--max-kv-size 8192`.
- Dependencia de Apple Silicon y MLX: no es desplegable directamente en stacks estándar de GPU NVIDIA sin reconversión.
- Riesgo de sesgos y alucinaciones: no documentado específicamente para este export; se heredan los del modelo base Qwen3-32B, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y cumplir los términos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/Qwen3-32B-lecore-19g-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Variante GGUF 19g: https://huggingface.co/staccs/Qwen3-32B-lecore-19g-GGUF
- Variante GGUF: https://huggingface.co/staccs/Qwen3-32B-lecore-GGUF
- Variante HRR: https://huggingface.co/staccs/Qwen3-32B-lecore-hrr
- Variante MLX: https://huggingface.co/staccs/Qwen3-32B-lecore-mlx
