# viai957/Goedel-Prover-V2-8B-VLG-planner-sft-lora

## Resumen

Goedel-Prover-V2-8B-VLG-planner-sft-lora es un conjunto de adaptadores LoRA publicados por el usuario viai957 que convierten el modelo base Goedel-Prover-V2-8B (derivado de Qwen3-8B) en un planificador de demostraciones para Lean 4. Dado un enunciado de teorema formalizado, el adaptador genera un esbozo de demostracion con 2-6 lemas intermedios declarados como `have` y dejados abiertos con `sorry`; cada subobjetivo se delega despues a un probador de nodos dentro de un sistema de grafo de lemas verificado (VLG). El modelo no demuestra teoremas de extremo a extremo: produce unicamente el esqueleto de alto nivel que un verificador Lean acepta con los lemas pendientes.

El interes tecnico reside en el metodo de entrenamiento y en los resultados medidos sobre calidad de plan. Partiendo de un modelo base que genera planes estrictamente usables solo en el 1,8 % de los casos, el adaptador entrenado con 1.046 filas de SFT alcanza el 46,1 % de planes estrictamente usables y el 75,5 % de problemas con al menos un plan valido, sobre 200 problemas retenidos y 4 muestras por problema (800 planes verificados en Lean). El adaptador esta empaquetado como PEFT sobre el modelo base, con licencia Apache-2.0 y pesos en safetensors.

Es relevante ahora porque documenta un hallazgo contraintuitivo: escalar los datos de entrenamiento de 1.046 a 12.062 filas empeora la calidad del plan (41,0 % frente a 46,1 %), dominada por nodos de reafirmacion del teorema. Ademas, el autor no reclama ninguna cifra de resolucion end-to-end (miniF2F, PutnamBench), lo que acota con honestidad el alcance de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) con adaptadores LoRA sobre atencion y MLP |
| Parametros totales | no disponible (el adaptador LoRA ocupa 2,1 GB en el repo; el modelo base Goedel-Prover-V2-8B tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de entrenamiento; contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Goedel-Prover-V2-8B en la revision `dfd02e6271a58375dfbf3ece0175277cf6b6a89a`, un derivado de Qwen3-8B. La configuracion LoRA es r=64, alpha=128, dropout 0 y sin bias, sobre las proyecciones `q/k/v/o/gate/up/down_proj` de todas las capas, lo que da 504 tensores entrenables. El autor verifico mediante un chequeo de pesos movidos (`ARTIFACT_MANIFEST.json`, campo `weights_moved`) que los 504 tensores cambiaron y que el modelo base permanecio intacto. Los pesos base no se incluyen en el repositorio; el adaptador referencia el modelo del Hub.

El entrenamiento es SFT supervisado sobre pares (enunciado, esbozo). Cada esbozo se extrae de una demostracion completa ya verificada en Lean, elevando sus `have` de nivel superior a lemas abiertos. Solo se conservan las filas cuyo esbozo pasa el validador estricto: que empalme, que cada nodo elabore, que exista al menos un nodo genuino, que no haya `sorry` sueltos y, desde la ejecucion de 1k, que se aplique el filtro de reafirmaciones. El entrenamiento uso 4 GPU NVIDIA L4 con 4 rangos de paralelismo de datos, batch global de 4 filas empaquetadas, 2 epocas, AdamW, LR pico 1e-4 con warmup y decaimiento, longitud maxima 4.096 y atencion SDPA de PyTorch. La ejecucion de 1k proceso 1,81 M de tokens en 26 minutos (loss de 0,318 a 0,038); la de todos los datos proceso 21,5 M de tokens en 5,0 horas (loss de 0,379 a 0,026). Las fuentes de datos son Nemotron-Math-Proofs-v1 (CC-BY-SA-4.0), Goedel-LM/SFT_dataset_v2 (Apache-2.0), internlm/Lean-Workbook (Apache-2.0) y iiis-lean/NuminaMath-LEAN-Proof-Artifacts (Apache-2.0); no se uso datos generados por profesor via API. La evaluacion se hizo con Lean v4.9.0-rc1, Mathlib `d1d1e4b72c6e009edd97cabe1d661b021fe8eeae` y `leanprover-community/repl` v4.9.0-rc1, con presupuesto de 300 s por comprobacion y timeout tratado como "indeciso", nunca como negativo.

## Capacidades

- Generacion de esbozos de demostracion en Lean 4: produce el argumento de nivel superior con 2-6 lemas intermedios abiertos.
- Planificacion de pruebas: descompone un teorema en subobjetivos genuinos, no reafirmaciones ni trivialidades (segun el filtro de reafirmacion).
- Salida en formato de bloque de codigo Lean que el validador puede extraer y comprobar.
- Generacion de texto conversacional en formato chat (plantilla `PLAN_TEMPLATE` en `code/m1_prompts.py`).
- Trabajo en ingles unicamente.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes multi-paso por si mismo; su rol es el de un componente planificador dentro de un sistema VLG externo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Planificacion de demostraciones en pipelines de verificacion formal: dado un enunciado Lean 4, el modelo genera un esbozo con lemas abiertos que un probador de nodos resuelve despues; encaja en arquitecturas de grafo de lemas verificado donde cada subobjetivo se verifica de forma independiente.
- Investigacion en demostracion automatica de teoremas: sirve como linea base reproducible de planificacion, con 200 problemas retenidos, 4 muestras por problema y protocolo de validacion Lean documentado.
- Generacion de subobjetivos para entrenamiento de probadores de nodos: los esbozos validos producen pares (enunciado, lema) que pueden alimentar el entrenamiento de modelos especializados en nodos.
- Aumento de datos para formalizacion matematica: los planes generados y verificados en Lean pueden usarse como material de partida para construir corpus de demostraciones con estructura jerarquica.
- Evaluacion comparativa de estrategias de SFT: los tres puntos de control publicados (pilot, 1k, all-data) permiten estudiar el efecto del volumen de datos y del filtrado de reafirmaciones sobre la calidad del plan.
- Prototipado de asistentes de prueba en entornos de investigacion: el adaptador cabe en infraestructura modesta (entrenado en 4x L4) y puede desplegarse sobre el base de 8B para explorar interfaces de ayuda a la demostracion formal.

## Benchmarks y rendimiento

Los unicos datos publicados miden calidad de plan sobre 200 problemas retenidos de planner-VAL con 4 muestras cada uno (800 planes por modelo), verificados en Lean. No se reclama ninguna cifra de resolucion end-to-end (miniF2F, PutnamBench).

| Modelo | Filas SFT | Pasos | Planes estrictamente usables | Problemas con >= 1 plan usable |
|---|---|---|---|---|
| Base Goedel-Prover-V2-8B (sin adaptador) | — | — | 1,8 % | 5,5 % |
| pilot | 422 | 50 | 36,9 % | 71,0 % |
| planner-1k (mejor) | 1.046 | 116 | 46,1 % | 75,5 % |
| planner-alldata-s1 | 12.062 | 1.379 | 41,0 % | 69,5 % |

Comparaciones pareadas sobre los mismos problemas: el planner-1k gana +44,4 pp de planes estrictamente usables frente al base (IC 95 % bootstrap [39,4; 49,3]; 149 problemas mejores, 1 peor). El planner de todos los datos gana +39,3 pp ([34,1; 44,5]; 136 mejores, 3 peores). Frente al pilot, el planner-1k gana +9,25 pp ([5,4; 13,1]; 79 mejores, 35 peores). El fallo dominante del planner de todos los datos son los nodos de reafirmacion: 328 de sus 800 planes fallan solo por ese motivo; estos nodos aparecen tambien en el 37 % de los planes del planner-1k, pese a que las filas de reafirmacion se excluyeron de su entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo base de 8B, la inferencia requiere cargar el base completo. En fp16 el base de 8B ocupa aproximadamente 16 GB de pesos, a los que se suma el adaptador.
- GPU recomendadas: el entrenamiento se realizo en 4x NVIDIA L4; para inferencia se recomienda una GPU con al menos 24 GB de VRAM en fp16 (por ejemplo, A100, H100 o RTX 4090) si se carga el base sin cuantizar.
- Cabe en GPU de consumo: previsiblemente si, con cuantizacion del modelo base (por ejemplo, formatos de 4 bits), aunque la informacion proporcionada no incluye mediciones de VRAM ni de latencia para este adaptador.
- Opciones de despliegue: la libreria declarada es PEFT; el despliegue requiere cargar el base Goedel-Prover-V2-8B y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goedel-Prover-V2-8B-VLG-planner-sft-lora (planner-1k) | 8B (base) + LoRA r=64 | 4.096 en entrenamiento | Planificador de esbozos Lean 4 | Apache-2.0 | HuggingFace (adaptador PEFT) |
| Goedel-Prover-V2-8B (base, sin adaptador) | 8B | no disponible | Probador de teoremas Lean 4 | no disponible en la informacion proporcionada | HuggingFace |
| Goedel-Prover-V2-8B-VLG-planner-sft-lora (pilot) | 8B (base) + LoRA r=64 | 4.096 en entrenamiento | Planificador de esbozos Lean 4 | Apache-2.0 | HuggingFace (adaptador PEFT) |
| Goedel-Prover-V2-8B-VLG-planner-sft-lora (all-data s1) | 8B (base) + LoRA r=64 | 4.096 en entrenamiento | Planificador de esbozos Lean 4 | Apache-2.0 | HuggingFace (adaptador PEFT) |

No se dispone de datos de benchmarks de otros modelos comparables (por ejemplo, otros planificadores Lean 4 de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se midio calidad de plan; no hay cifras de resolucion end-to-end del sistema planificador + probador de nodos, ni resultados en miniF2F o PutnamBench.
- Mas datos no mejoro el resultado de forma monotona: el modelo entrenado con 12.062 filas rinde peor (41,0 %) que el de 1.046 filas (46,1 %), con los nodos de reafirmacion como fallo dominante.
- El 37 % de los planes del mejor adaptador contiene nodos de reafirmacion, pese a excluir esas filas del entrenamiento.
- El modelo solo genera esbozos con lemas abiertos; no completa demostraciones por si mismo y depende de un probador de nodos y de un verificador Lean externos.
- Idiomas: unicamente ingles.
- Longitud de contexto de entrenamiento limitada a 4.096 tokens.
- Riesgo de alucinacion en la generacion de lemas: los subobjetivos pueden no ser demostrables o no corresponder a pasos logicos validos, lo que el validador Lean debe filtrar.
- La licencia del adaptador es Apache-2.0, pero una parte de los datos de entrenamiento (Nemotron-Math-Proofs-v1) es CC-BY-SA-4.0, lo que puede imponer obligaciones de atribucion y compartir igual sobre los derivados; conviene revisarlo antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- El adaptador no incluye los pesos base; cualquier despliegue requiere descargar y aceptar la licencia del modelo Goedel-Prover-V2-8B por separado.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/viai957/Goedel-Prover-V2-8B-VLG-planner-sft-lora
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Dataset Goedel-LM/SFT_dataset_v2: https://huggingface.co/datasets/Goedel-LM/SFT_dataset_v2
- Dataset nvidia/Nemotron-Math-Proofs-v1: https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
- Dataset internlm/Lean-Workbook: https://huggingface.co/datasets/internlm/Lean-Workbook
- Dataset AI-MO/NuminaMath-LEAN: https://huggingface.co/datasets/AI-MO/NuminaMath-LEAN
- Dataset iiis-lean/NuminaMath-LEAN-Proof-Artifacts: https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Proof-Artifacts
- Paper de referencia (arXiv:2508.03613): https://arxiv.org/abs/2508.03613
- Repositorio Lean REPL: https://github.com/leanprover-community/repl
