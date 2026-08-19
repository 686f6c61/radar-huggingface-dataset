# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l4` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think`. Forma parte de una familia de modelos experimentales dedicados a la compresión de cadenas de razonamiento (chain-of-thought), en este caso al nivel L4, que produce cadenas extremadamente cortas con asignaciones encadenadas mediante punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Este adaptador concreto es una ablación: se entrenó con una variante de recompensa (`gr3chain-seed2`) para poder comparar el diseño de recompensas en el artículo asociado, no como modelo principal.

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado a nivel L4, usando GSM8K como conjunto de entrenamiento. Su propósito es investigar cómo afecta la compresión extrema del razonamiento a la precisión en problemas aritméticos, y cómo distintas funciones de recompensa influyen en el resultado. Publicado con licencia Apache 2.0, el repositorio ocupa 0,2 GB y está pensado para cargarse con la librería `peft` sobre el modelo base ya fusionado con el adaptador SFT correspondiente.

Su relevancia radica en que permite reproducir experimentos de diseño de recompensas en RL para razonamiento comprimido, un área activa en la optimización de costes de inferencia y latencia. No es un modelo de propósito general, sino una pieza de investigación con un objetivo muy concreto: validar la influencia de la recompensa `gr3` en la calidad del razonamiento comprimido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer `allenai/Olmo-3-7B-Think` (decoder-only) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 7B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada para el adaptador; el modelo base Olmo-3 soporta contexto largo) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16; el modelo base puede cuantizarse) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer decoder-only de 7B parametros desarrollado por el Allen Institute for AI (Ai2) como parte de la familia Olmo 3. El adaptador LoRA (r=16, alpha=32) se entrena con GRPO sobre el modelo SFT fusionado a nivel L4, es decir, primero se fusiona el adaptador SFT correspondiente (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`) y luego se aplica este adaptador de refuerzo. El entrenamiento usa `trl.GRPOTrainer` con atención `sdpa`, 8 generaciones por prompt, batch de 32 con acumulación de 2, máximo 256 tokens de completado, learning rate 1e-05 y coeficiente KL de 0.0 (sin penalización de divergencia).

La funcion de recompensa combina cuatro componentes: `correctness` (que pondera el acierto según el numero de pasos de la solucion de referencia), `format` (exige una unica etiqueta `thinking` y `response` seguida de `#### <answer>`), `chain` (un verificador que comprueba que las operaciones aritmeticas escritas en la cadena son correctas) y `gr3` (un reescalado multiplicativo de la recompensa positiva con un suelo de 0.3). Este ultimo componente es el objeto de la ablacion: se evalua si el reescalado de recompensas positivas mejora o empeora el resultado final.

El conjunto de entrenamiento son 6976 ejemplos de GSM8K train reexpresados a nivel L4 por un modelo profesor, con una mediana de longitud de cadena de 41 caracteres dentro de `thinking`. El entrenamiento se realizo en una unica NVIDIA A100 80GB. Un detalle tecnico relevante: el autor verifico que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 que resultaron inertes al usar kernels fusionados; este adaptador se entreno con `transformers` estandar.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto en ingles siguiendo el formato `thinking... response... #### <answer>`.
- Soporte de razonamiento de un solo turno (single-turn) sin ejemplos ni self-consistency.
- No soporta tool calling, ni vision, ni audio; es exclusivamente texto.
- Capacidad multilingue limitada al ingles (entrenado y evaluado solo en ingles).
- Permite estudiar el equilibrio entre compresion del razonamiento y precision.

## Casos de uso

- Investigacion en compresion de chain-of-thought: permite reproducir experimentos sobre como reducir la longitud de las cadenas de razonamiento manteniendo una precision aceptable, util para recortar costes de inferencia en modelos grandes.
- Evaluacion de disenos de recompensa en RL: al ser una ablacion especifica, sirve para comparar el efecto de la recompensa `gr3` frente a otras variantes dentro de la misma familia (por ejemplo, el modelo principal `...-grpo-l4`).
- Estudio de la relacion entre longitud de razonamiento y exactitud: con la familia completa (niveles L1 a L5) se puede analizar como la compresion progresiva degrada el rendimiento en GSM8K.
- Pruebas de robustez de verificadores aritmeticos: el componente `chain` de la recompensa valida que las operaciones internas sean correctas, lo que puede interesar a quienes desarrollan sistemas de validacion de razonamiento.
- Benchmarking de metodos GRPO con presupuesto de tokens reducido: el adaptador demuestra que se puede entrenar con solo 256 tokens de completado, relevante para entornos con limitaciones de memoria o latencia.
- Replicacion de resultados cientificos: el autor publica el adaptador para que otros grupos puedan verificar las afirmaciones del articulo "Chain-of-Thought Compression Dialects" sin depender de la palabra del autor.

## Benchmarks y rendimiento

El unico resultado publicado en la model card es la exactitud en GSM8K test, evaluada con decodificacion greedy, un solo turno, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 69.1% |

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el intervalo de confianza al 95% tiene una semi-amplitud de aproximadamente 2.7 puntos porcentuales para n=1317, por lo que diferencias de un par de puntos entre semillas son ruido estadistico.

## Requisitos de hardware

- El adaptador en si ocupa 0.2 GB y se carga como LoRA, por lo que no requiere VRAM adicional significativa.
- El modelo base `allenai/Olmo-3-7B-Think` tiene 7B parametros: en bf16 ocupa aproximadamente 14 GB, por lo que cabe en GPUs de 16 GB (por ejemplo, RTX 4090, RTX 4080, A10G) con cuantizacion ligera.
- Para inferencia sin cuantizar se recomienda una GPU con al menos 16 GB de VRAM; con cuantizacion de 4 bits se puede ejecutar en GPUs de 8 GB (por ejemplo, RTX 3070, RTX 4060 Ti).
- El entrenamiento se realizo en 1x NVIDIA A100 80GB, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`; tambien se puede fusionar y exportar a GGUF para usar con `llama.cpp` u Ollama, o servir con vLLM o TGI tras la fusion.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. Con cadenas de razonamiento muy cortas (41 caracteres de media), la generacion es rapida en comparacion con modelos que producen cadenas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Tipo |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l4` (este) | 7B (base) + LoRA | no disp. | 69.1% | Apache 2.0 | Ablacion LoRA |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l4` (modelo principal) | 7B (base) + LoRA | no disp. | no publicado | Apache 2.0 | LoRA principal |
| `allenai/Olmo-3-7B-Think` (base) | 7B | no disp. | no publicado | Apache 2.0 | Modelo base |

No se dispone de resultados publicados para el modelo principal a nivel L4 ni para el base en GSM8K, por lo que no es posible una comparacion cuantitativa directa. La model card indica que este adaptador es una ablacion y puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no es adecuado para otras tareas sin un ajuste adicional.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas extremos (L4 y L5).
- Es una ablacion: se entreno para responder una pregunta concreta sobre el diseno de recompensas, por lo que puede tener peor rendimiento que el modelo principal del mismo nivel.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), no directamente sobre `allenai/Olmo-3-7B-Think`; hacerlo directamente no reproduce el resultado publicado.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales pueden deberse al azar.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento; no se ha evaluado en otros conjuntos.
- Solo soporta ingles; no hay soporte para otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador de investigacion, su fiabilidad en produccion no esta garantizada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed2-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Articulo de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
- Cita del articulo de compresion: Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026.
