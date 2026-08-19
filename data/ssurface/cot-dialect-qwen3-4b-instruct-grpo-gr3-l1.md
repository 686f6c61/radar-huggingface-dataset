# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l1

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l1` es un adaptador LoRA publicado por ssurface (Anatolii Frolov) que modifica el comportamiento de `Qwen/Qwen3-4B-Instruct-2507` para razonar en el nivel de compresión L1, es decir, con cadenas de razonamiento completas en lenguaje natural dentro de la etiqueta `thinking`. El adaptador se enmarca en la colección "Chain-of-Thought Compression Dialects", que estudia cómo comprimir el razonamiento interno de un modelo sin perder precisión.

Este modelo concreto es una **ablación**, no uno de los modelos principales de la colección: se entrenó con una variante de recompensa denominada `gr3` (reescalado multiplicativo de longitud con piso en 0.3) para permitir comparar el diseño de recompensas en el artículo asociado. No fue evaluado por separado y su propósito es servir como artefacto reproducible del grid de ablaciones, no como modelo de producción.

El adaptador se entrena con GRPO sobre el modelo SFT fusionado de nivel L1, usando el dataset GSM8K re-expresado por un modelo teacher (6913 ejemplos, mediana de cadena de 532 caracteres). El repositorio ocupa 0.1 GB en formato safetensors y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el codigo de uso carga el base en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16 y alpha 32 sobre el modelo base Qwen3-4B-Instruct-2507. El entrenamiento se realizo con `trl.GRPOTrainer` sobre transformers estandar con atencion `sdpa`, partiendo del modelo SFT fusionado de nivel L1 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l1`). La funcion de recompensa combina tres componentes: `correctness` (que pondera la coincidencia con la solucion dorada por el numero de pasos de la misma), `format` (exige una estructura `thinking... response` seguida de `#### <respuesta>`) y `gr3` (reescalado multiplicativo de la recompensa positiva con piso 0.3, que no puede reordenar respuestas correctas por encima de incorrectas).

Los hiperparametros incluyen 8 generaciones por prompt, batch efectivo de 64, maximo de 256 tokens de completado, learning rate 1e-05, coeficiente KL 0.0 y loss tipo `dapo`. El prompt de entrenamiento fue `gsm8k_grpo_balanced_1k.json` y el hardware utilizado fue una unica NVIDIA A100 de 80 GB. Un detalle relevante del proceso: el autor verifico que todos los adaptadores publicados tuvieran matrices `lora_B` no nulas, descartando 13 que resultaron matematicamente inertes al usar kernels fusionados; este adaptador paso esa comprobacion.

## Capacidades

- Razonamiento verboso en lenguaje natural (nivel L1) para problemas matematicos de tipo GSM8K, con cadenas de razonamiento completas dentro de `thinking`.
- Generacion de texto con estructura de respuesta `thinking... response` y formato final `#### <respuesta>`.
- No se menciona soporte de tool calling, function calling ni capacidades multimodales.
- Unicamente en ingles.
- Es un artefacto de ablacion: su objetivo es responder a una pregunta concreta sobre diseno de recompensas, no ofrecer capacidades generales.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: permite estudiar como afecta la longitud del CoT a la precision en problemas aritmeticos, comparando niveles L1 a L5 dentro de la misma familia.
- Comparacion de diseno de recompensas en RL: al ser una ablacion con la recompensa `gr3`, sirve para reproducir el analisis de sensibilidad del articulo frente a la recompensa estandar.
- Reproduccion de experimentos de GRPO: el setup completo (prompt set, hiperparametros, seed) esta documentado, lo que facilita rerun de los resultados.
- Evaluacion de robustez de adaptadores LoRA: el proceso de verificacion de `lora_B` no nulo es un caso util para validar pipelines de entrenamiento con kernels fusionados.
- Benchmarking de razonamiento matematico en modelos de 4B: puede usarse como punto de comparacion con otros adaptadores de la coleccion o con el base sin adaptar.
- Estudio de trade-offs entre verbosidad y precision: la mediana de cadena de 532 caracteres en L1 frente a 16 en L5 (rango 33x) permite cuantificar el coste de la compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador no fue evaluado por separado y que los niveles con numeros reportados son los del conjunto principal de la coleccion.

## Requisitos de hardware

- El adaptador LoRA es pequeno (0.1 GB), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 en bfloat16, lo que supone aproximadamente 8 GB de VRAM solo para los pesos del base.
- Para inferencia con el adaptador fusionado se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080/3090, RTX 4070/4080/4090) si se usa cuantizacion ligera; sin cuantizar, 16 GB son suficientes.
- El entrenamiento se realizo en una unica NVIDIA A100 de 80 GB, pero no es representativo del requisito de inferencia.
- Despliegue: el codigo de uso emplea `transformers` con `PeftModel` y `merge_and_unload()`. No se mencionan vLLM, llama.cpp ni Ollama; la integracion con estos motores no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Recompensa | Evaluado | Notas |
|---|---|---|---|---|
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l1` | Ablacion LoRA L1 | correctness + format + gr3 | No | Artefacto para comparar diseno de rewards |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l1` | Modelo principal L1 | correctness + format (estandar) | Si (segun la coleccion) | Referencia del mismo nivel |
| `ssurface/cot-dialect-qwen3-4b-instruct-sft-l1` | Adaptador SFT L1 | N/A (SFT) | No especificado | Necesario cargarlo antes que el adaptador GRPO |
| `Qwen/Qwen3-4B-Instruct-2507` | Modelo base | N/A | Si (publicado por Qwen) | Sin adaptador, razonamiento estandar |

No se dispone de datos cuantitativos de rendimiento para comparar numericamente estas variantes.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de tipo GSM8K; no generaliza a otras tareas de razonamiento.
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles comprimidos.
- Es un artefacto de ablacion: puede ser peor que el modelo principal del mismo nivel, y no debe usarse como sustituto en produccion.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l1`), fusionarlo con el base, y luego cargar este adaptador; cargarlo directamente sobre el base no reproduce los resultados.
- Entrenado con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido (95% half-width ~2.7 pp a n=1317).
- Solo soporta ingles; no hay datos sobre comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para escenarios de produccion y carece de evaluacion de sesgos o alucinaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT necesario (paso previo): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l1
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l1
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
