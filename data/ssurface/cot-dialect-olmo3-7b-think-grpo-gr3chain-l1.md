# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l1

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-l1` es un adaptador LoRA publicado por `ssurface` que ajusta el modelo base `allenai/Olmo-3-7B-Think` para razonar a un nivel de compresion L1, es decir, con cadenas de pensamiento completas en lenguaje natural. El modelo se enmarca dentro de una investigacion sobre "dialectos de compresion de chain-of-thought", donde distintos niveles de compresion (de L1 a L5) reducen la longitud del razonamiento interno del modelo. Este adaptador concreto es una ablacion publicada para verificar el diseno de recompensas `gr3chain` y no es uno de los modelos principales de la familia.

El modelo se entrena con GRPO sobre un conjunto de 6913 ejemplos de GSM8K reexpresados por un modelo profesor a nivel L1, con una longitud mediana de cadena de razonamiento de 532 caracteres. El adaptador se apila sobre un modelo SFT previo (`ssurface/cot-dialect-olmo3-7b-think-sft-l1`), no directamente sobre el base, y alcanza un 88.6% de accuracy en GSM8K test con decodificacion greedy. Es un modelo de investigacion, no un producto listo para produccion, y su interes radica en el estudio del equilibrio entre razonamiento verboso y compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Olmo-3-7B-Think) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; base 7B) |
| Parametros activos | no disponible (adaptador LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | bfloat16 (carga del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 16, alpha 32) que se apila sobre el modelo SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l1`, que a su vez se basa en `allenai/Olmo-3-7B-Think`. El entrenamiento se realiza con el `trl.GRPOTrainer` de la libreria `transformers` estandar, usando atencion `sdpa` en lugar de kernels fusionados. El autor advierte que el camino con kernels fusionados produjo adaptadores con matrices `lora_B` a cero, por lo que todos los adaptadores publicados fueron verificados manualmente para tener `lora_B != 0`.

El entrenamiento usa GRPO con loss tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulacion de 1, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.0. La recompensa combina cuatro componentes: `correctness` (ponderada por el numero de pasos de la solucion dorada), `format` (exige un bloque `thinking...response` seguido de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmetica interna de la cadena es correcta) y `gr3` (reescalado multiplicativo de recompensas positivas con suelo en 0.3). El dataset de prompts es `gsm8k_grpo_balanced_1k.json` y el entrenamiento se realizo en una unica NVIDIA A100 80GB.

## Capacidades

- Razonamiento matematico paso a paso en lenguaje natural completo (nivel L1).
- Generacion de texto con formato estructurado: bloque `thinking` seguido de `response` y respuesta final con `####`.
- Razonamiento verificable internamente: el componente `chain` de la recompensa fuerza a que la aritmetica dentro del razonamiento sea correcta.
- Transferencia limitada fuera del dominio: evaluado en AIME, BBH y SVAMP con resultados modestos fuera de GSM8K.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (limitado a razonamiento matematico de un solo turno).
- Capacidades multilingues: no (solo ingles).
- Capacidades especiales: no (sin vision, audio ni thinking mode adicional mas alla del formato entrenado).

## Casos de uso

- Investigacion en compresion de chain-of-thought: el modelo sirve para reproducir y verificar los resultados del paper sobre dialectos de compresion, comparando el efecto de la recompensa `gr3chain` frente a otras variantes de recompensa.
- Generacion de soluciones matematicas explicadas: puede producir respuestas a problemas de matematicas de nivel escolar con un razonamiento completo y verificable, util para generar datos de entrenamiento o explicaciones para estudiantes.
- Evaluacion de tecnicas de RL (GRPO) en modelos de razonamiento: permite estudiar como distintos disenos de recompensa afectan a la calidad del razonamiento y a la precision final.
- Benchmark de robustez de adaptadores LoRA: el modelo documenta un problema real con kernels fusionados que producen adaptadores inertes, lo que lo convierte en un caso de estudio para practicas de verificacion en PEFT.
- Generacion de datos sinteticos de razonamiento: las cadenas L1 de 532 caracteres de mediana pueden usarse como datos de entrenamiento para modelos mas pequenos o para destilacion.
- Analisis de trade-offs entre verbosidad y precision: el modelo permite comparar el rendimiento de un razonamiento extenso (L1) frente a niveles mas comprimidos (L2-L5) de la misma familia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test, greedy, single-turn) | 1317 | 88.6% |
| AIME (out-of-domain) | 60 | 3.3% |
| BBH (out-of-domain) | 250 | 48.4% |
| SVAMP/transfer (out-of-domain) | 250 | 81.6% |

Nota: el autor indica que la diferencia de un par de puntos porcentuales esta dentro del ruido (95% half-width ~2.7 pp a n=1317). El resultado de GSM8K es con decodificacion greedy, sin exemplars y sin self-consistency. Los benchmarks AIME, BBH y SVAMP son evaluaciones fuera de dominio y no son la metrica principal del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0.2 GB, pero requiere cargar el modelo base Olmo-3-7B-Think en bfloat16, lo que ocupa aproximadamente 14-16 GB de VRAM.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento); para inferencia, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en una RTX 4090 (24 GB) o similar con cuantizacion del modelo base.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` con `PeftModel` y `merge_and_unload`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que es un adaptador PEFT, requiere el stack de `transformers` + `peft`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Metodo | GSM8K (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-gr3chain-l1 (este) | Olmo-3-7B-Think | LoRA + GRPO (recompensa gr3chain) | 88.6% | Apache 2.0 | HuggingFace |
| cot-dialect-olmo3-7b-think-grpo-l1 (modelo principal L1) | Olmo-3-7B-Think | LoRA + GRPO (recompensa estandar) | no disponible | Apache 2.0 | HuggingFace |
| Olmo-3-7B-Think (base sin adaptador) | - | SFT + DPO | no disponible | Apache 2.0 | HuggingFace |

La comparativa directa con el modelo principal de la familia (`grpo-l1`) no esta disponible en la informacion proporcionada. El autor indica que este adaptador es una ablacion y "puede ser peor que el modelo principal al mismo nivel".

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con enunciados verbales (GSM8K); su rendimiento fuera de este dominio es bajo (3.3% en AIME).
- La precision cae con la dificultad del problema, especialmente en los niveles comprimidos.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l1` y fusionarlo; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Entrenado con una unica semilla; las diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Solo soporta ingles.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento.
- No se proporcionan datos sobre sesgos, aunque al ser un modelo derivado de Olmo-3, hereda los sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de robustez en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT necesario: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l1
- Coleccion Olmo 3 de AllenAI: https://huggingface.co/collections/allenai/olmo-3
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Pagina oficial de Olmo (AllenAI): https://allenai.org/olmo
