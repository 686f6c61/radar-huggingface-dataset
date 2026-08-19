# ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento de razonamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para producir cadenas de pensamiento (chain-of-thought, CoT) extremadamente comprimidas, en un dialecto denominado nivel L4: asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es reducir drásticamente la longitud del razonamiento interno sin sacrificar la precisión en problemas matemáticos.

El adaptador se entrenó en dos fases: primero una adaptación supervisada (SFT) sobre el conjunto de entrenamiento de GSM8K reexpresado en el dialecto L4 por un modelo profesor, y posteriormente un refinamiento con GRPO (Group Relative Policy Optimization) que elevó la precisión exacta en el test de GSM8K del 73,7 % al 86,0 %. La relevancia de este trabajo radica en explorar los límites de la compresión del razonamiento: la mediana de la cadena de pensamiento pasa de 532 caracteres en el nivel L1 a solo 16 en el nivel L5, un rango de 33 veces, y este adaptador se sitúa en el nivel L4 con una mediana de 41 caracteres.

El modelo se distribuye como un adaptador PEFT (librería `peft`) con licencia Apache-2.0, pensado para investigación en eficiencia de razonamiento y no como un producto final listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) + adaptador LoRA |
| Parametros totales | ~4B (modelo base) + adaptador LoRA de ~0,1 GB (r=16, alpha=32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen3-4B-Instruct-2507 soporta 32K tokens según documentacion oficial de Qwen |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el base puede cuantizarse con metodos estandar) |
| Idiomas soportados | en (segun la model card del adaptador; el base es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer denso de 4.000 millones de parametros con atencion de ventana deslizante y soporte de modo thinking/no-thinking. El adaptador LoRA utiliza un rango de 16 y alpha de 32, y se entrena sobre el modelo ya fusionado tras una fase previa de SFT en el nivel L4 (el repositorio `cot-dialect-qwen3-4b-instruct-sft-l4`). Esto es critico: el adaptador GRPO no funciona directamente sobre el base sin el adaptador SFT intermedio.

El entrenamiento GRPO se realizo con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa` (sin kernels fusionados). Se usaron 6976 ejemplos de GSM8K train reexpresados en dialecto L4 por un modelo profesor, con una mediana de cadena de 41 caracteres dentro de la etiqueta `thinking`. La funcion de recompensa combina tres componentes: `correctness` (que pondera segun el numero de pasos de la solucion dorada), `format` (exige una unica respuesta con estructura `thinking... response` y `#### <answer>`) y `gr3` (reescalado multiplicativo de recompensas positivas con suelo en 0,3). Se usaron 8 generaciones por prompt, un lote de 16 con acumulacion de gradiente 1, maximo de 256 tokens de completacion, tasa de aprendizaje de 1e-05 y coeficiente KL de 0,0. El entrenamiento se ejecuto en una unica NVIDIA A100 de 80 GB.

Una nota tecnica importante del autor: los adaptadores entrenados con kernels fusionados producian matrices `lora_B` todas a cero (inertes matematicamente), por lo que se verifico manualmente que `lora_B != 0` en todos los adaptadores publicados; 13 que fallaron esa comprobacion fueron retirados.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas en dialecto L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto y comprension del lenguaje heredadas del modelo base Qwen3-4B-Instruct-2507 (el adaptador no elimina esas capacidades, pero solo se ha evaluado en matematicas).
- Soporte de modo thinking/no-thinking del base, aunque el adaptador fuerza un formato especifico de respuesta con `thinking` y `response`.
- Capacidades multilingues del base (el adaptador se entreno solo en ingles, por lo que su rendimiento en otros idiomas no esta verificado).
- No se documenta soporte explicito de tool calling, function calling, agentes o vision; el adaptador es puramente textual.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: permite estudiar como afecta la reduccion de tokens de razonamiento a la precision en tareas aritmeticas, con una mediana de 41 caracteres por cadena.
- Evaluacion de tecnicas de RL (GRPO) sobre razonamiento comprimido: el adaptador sirve como punto de referencia para comparar estrategias de recompensa y regularizacion.
- Sistemas de QA matematica con presupuesto de tokens reducido: en entornos donde el coste por token es relevante, el dialecto L4 reduce el overhead de razonamiento sin perder exactitud en problemas tipo GSM8K.
- Benchmarking de modelos de razonamiento eficiente: util como baseline para medir el equilibrio entre longitud de CoT y precision en matematicas.
- Educacion y tutoria: puede generar explicaciones paso a paso muy condensadas, utiles para verificar la comprension de conceptos aritmeticos basicos.
- Pruebas de robustez de adaptadores LoRA: el caso documentado de matrices `lora_B` nulas con kernels fusionados ofrece material para validar pipelines de entrenamiento PEFT.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado sobre GSM8K test (n=1317, greedy decoding, single-turn, sin ejemplos ni self-consistency):

| Modelo | Accuracy (exact match) |
|---|---:|
| Tras SFT (nivel L4) | 73,7 % |
| **Tras GRPO (este adaptador)** | **86,0 %** |
| Diferencia | +12,3 pp |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K con otras configuraciones, etc.) en la informacion disponible. El autor advierte que la precision cae con la dificultad del problema, mas rapidamente en los niveles comprimidos, y que la diferencia de un par de puntos porcentuales esta dentro del ruido estadistico (95 % de semi-anchura ~2,7 pp en n=1317).

## Requisitos de hardware

- El adaptador LoRA pesa ~0,1 GB, pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 completo (4B parametros).
- VRAM estimada para inferencia en bf16: ~8-10 GB (modelo base + adaptador fusionado). Con cuantizacion a 4 bits (por ejemplo, bitsandbytes o GPTQ) puede reducirse a ~4-5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060/4060, RTX 4090) para inferencia; para entrenamiento se uso una NVIDIA A100 de 80 GB.
- Opciones de despliegue: `transformers` + `peft` (carga y fusion del adaptador), vLLM, llama.cpp (si se convierte el modelo fusionado a GGUF), Ollama (mediante exportacion a GGUF).
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamano del base (4B) y la compresion del CoT, la latencia por peticion sera baja en GPUs modernas, pero no hay datos numericos.

## Comparativa con modelos similares

La comparativa directa se limita al propio modelo base y a la variante SFT, ya que no hay datos publicados de otros adaptadores de compresion CoT comparables:

| Modelo | Tamano | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | 32K | No disponible en la ficha | Apache-2.0 |
| ssurface/cot-dialect-qwen3-4b-instruct-sft-l4 | 4B + LoRA | 32K | 73,7 % | Apache-2.0 |
| **ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4** | **4B + LoRA** | **32K** | **86,0 %** | **Apache-2.0** |

No se dispone de comparaciones con otros modelos de razonamiento matematico (por ejemplo, Llama-3.1-8B-Instruct o Mistral-7B) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de GSM8K; no hay evidencia de rendimiento en otros dominios.
- La precision se degrada con la dificultad del problema, de forma mas acusada en los niveles de compresion altos.
- Requiere cargar primero el adaptador SFT (`cot-dialect-qwen3-4b-instruct-sft-l4`) y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el base no reproduce el resultado declarado.
- El adaptador se entreno con una unica semilla (salvo que el nombre del repo indique lo contrario); las diferencias de unos pocos puntos porcentuales pueden deberse al ruido.
- Solo se ha verificado el idioma ingles; el rendimiento multilingue del base no esta garantizado con este adaptador.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente cuando el formato de respuesta comprimido no puede expresar correctamente el razonamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El adaptador depende de la version exacta del modelo base (2507); cambios en el base pueden invalidar el comportamiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Qwen3-4B (no instruct): https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador SFT previo (necesario para cargar este adaptador): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
