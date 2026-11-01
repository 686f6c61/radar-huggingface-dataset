# vignesh-trustt/proofforge-rlvr-run-e2e-smoke-rlvr-2026.10.26

## Resumen

`vignesh-trustt/proofforge-rlvr-run-e2e-smoke-rlvr-2026.10.26` es un adaptador LoRA de tipo PEFT publicado en HuggingFace, entrenado sobre un modelo base fusionado derivado de `Goedel-LM/Goedel-Prover-V2-8B`, un modelo de 8.000 millones de parametros especializado en demostracion automatica de teoremas en Lean 4. El adaptador forma parte de la infraestructura ProofForge y se presenta explicitamente como un artefacto de prueba de extremo a extremo (smoke test) del pipeline de RLVR (Reinforcement Learning with Verifiable Rewards), no como un modelo afinado para produccion.

El adaptador emplea LoRA con rango 64 y alpha 128, y se entreno con recompensas y etiquetas generadas exclusivamente por un verificador de kernel Lean 4 congelado. La particularidad mas relevante es que no se aplico sobre el modelo base original, sino sobre una fusion en bf16 del base con el adaptador DPO del artefacto padre `e2e-smoke-dpo@2026.10.26`, lo que significa que aplicarlo directamente sobre `Goedel-Prover-V2-8B` produce un modelo distinto al entrenado.

Su relevancia es fundamentalmente metodologica: documenta con hashes, contabilidad de tensores y evidencia de etapa un flujo completo de entrenamiento con verificacion formal, lo que resulta util para quienes disenan pipelines de RLVR sobre Lean. El autor declara de forma explicita que no se reclama ningun resultado de benchmark ("no benchmark claim is made") y que se trata de un artefacto de humo del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: Goedel-Prover-V2-8B) |
| Parametros totales | 8B en el modelo base; adaptador LoRA con 504 tensores entrenables (rango 64, alpha 128) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; base en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT); repo de 5,6 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 128 aplicado sobre un modelo base fusionado. La arquitectura subyacente corresponde a `Goedel-Prover-V2-8B`, un transformer decoder-only de 8.000 millones de parametros orientado a la generacion de demostraciones en Lean 4. La fusion del base se realizo en bf16 con la formula W' = bf16(W + s·BA) a partir del adaptador DPO del artefacto `e2e-smoke-dpo@2026.10.26` (sha256 `5ba827d51dd3a8eb671ec811e3697429452faabcf4379ffae1a343119b2bb7b6`). El autor advierte que la fusion es con perdida: la coseno minima retenida del delta del adaptador es 0,4563030004501343 sobre 252 modulos.

El entrenamiento se realizo con recompensas y etiquetas procedentes unicamente del verificador de kernel Lean 4 congelado (Lean v4.9.0-rc1, Mathlib d1d1e4b72c6e, REPL 7df77c0a1c91). Los datos de entrenamiento son generaciones del pool P2 del modelo base sobre Goedel-Pset-v1 (problemas informales de Numina, licencia MIT/Apache-2.0), verificadas por kernel y reauditadas en axiomas, con un ledger de descontaminacion que protege miniF2F-test/valid, MOBench, ProofNet y PutnamBench como puerta dura. La evidencia de etapa reporta 2 iteraciones, 8 prompts por iteracion, group size 4, y 504 tensores entrenables de 504 movidos, con lora_B movido en el paso 1 y lora_A en el paso 2. El motor registrado es `lean_rl` con el motivo "R1 contract parity not established", es decir, se uso el camino envuelto de `lean_rl` al no existir el artefacto de paridad de contrato R1.

## Capacidades

- Generacion de demostraciones formales en Lean 4 (teoremas y pruebas verificables por kernel).
- Razonamiento matematico formal orientado a demostracion automatica.
- Entrenamiento con recompensas verificables (RLVR) procedentes de un verificador de kernel, no de un reward model aprendido.
- Capacidad de servir como artefacto de validacion de pipeline (smoke test) para flujos de RLVR sobre Lean.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Validacion de pipelines de RLVR: el artefacto sirve para comprobar de extremo a extremo que la generacion de datos, la verificacion por kernel, el calculo de recompensas y la actualizacion LoRA funcionan de forma coherente antes de lanzar entrenamientos a escala.
- Reproducibilidad de experimentos: los hashes de shards, el hash de mezcla de datos, el ledger de descontaminacion y el hash de configuracion permiten reconstruir exactamente el entorno de entrenamiento y auditar resultados.
- Investigacion en demostracion formal: permite estudiar como afecta un ciclo corto de RLVR con verificador de kernel a un prover de 8B ya afinado con DPO, sin necesidad de reentrenar desde cero.
- Desarrollo de infraestructura de verificacion Lean: util para equipos que construyen o depuran entornos Lean 4 con Mathlib y REPL, ya que fija versiones concretas y hashes de fuente del verificador.
- Pruebas de integracion en CI de proyectos de IA formal: el repo incluye un MANIFEST.json y evidencia de etapa que pueden usarse como fixtures en tests de integracion del pipeline.
- Docencia y divulgacion tecnica: ejemplo real y documentado de como se estructura un artefacto de entrenamiento con procedencia completa (base, padres, datos, verificador y configuracion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que es un artefacto de humo del pipeline y que no se reclama ningun resultado de benchmark.

## Requisitos de hardware

- El adaptador LoRA en si es pequeno, pero requiere el modelo base fusionado de 8B en bf16 para funcionar, lo que implica aproximadamente 16 GB solo en pesos del base.
- Para inferencia en bf16 se recomienda al menos 24 GB de VRAM (A100 40/80 GB, H100, L40S, RTX 4090 24 GB al limite).
- En cuantizacion de 8 bits cabe en GPUs consumer de 16-24 GB; en 4 bits podria caber en 12-16 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base con transformers + peft; para servir en produccion se puede exportar a vLLM o TGI tras fusionar el adaptador, o usar llama.cpp/Ollama solo si se convierte a GGUF.
- Latencia y throughput: no disponibles.
- Nota critica: el adaptador debe aplicarse sobre el base fusionado (no sobre `Goedel-Prover-V2-8B` crudo); usar el base equivocado produce un modelo distinto al entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofforge-rlvr-run-e2e-smoke-rlvr-2026.10.26 | 8B (base) + LoRA r64 | no disponible | Smoke test RLVR sobre Lean 4 | apache-2.0 | HuggingFace (0 descargas) |
| Goedel-LM/Goedel-Prover-V2-8B | 8B | no disponible | Demostracion automatica Lean 4 | apache-2.0 | HuggingFace (modelo base) |
| e2e-smoke-dpo@2026.10.26 (artefacto padre) | 8B (base) + LoRA DPO | no disponible | Etapa DPO del mismo pipeline | apache-2.0 | Artefacto interno del pipeline |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otros provers de tamano similar; la comparacion es estructural y de procedencia.

## Limitaciones y advertencias

- No es un modelo afinado para produccion: el autor lo describe como artefacto de humo del pipeline y no reclama ningun resultado de benchmark.
- El adaptador se entreno sobre un base fusionado, no sobre `Goedel-Prover-V2-8B` crudo; aplicarlo al base original produce un modelo diferente al entrenado.
- La fusion del base es con perdida: coseno minima retenida de 0,4563030004501343 sobre 252 modulos, lo que puede degradar el comportamiento respecto al base original.
- El motor usado fue `lean_rl` envuelto porque no se establecio la paridad de contrato R1; el camino de escala de cluster queda marcado como no ejecutado en hardware real.
- Riesgo de alucinacion en demostraciones: aunque el entrenamiento usa verificacion por kernel, el modelo puede generar pruebas no validas fuera del conjunto verificado.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion; verificar la licencia del modelo base y de los datos (Numina, Goedel-Pset-v1) antes de desplegar.
- El ledger de descontaminacion protege miniF2F-test/valid, MOBench, ProofNet y PutnamBench, por lo que no debe usarse para evaluar en esos conjuntos sin tener en cuenta la puerta dura.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/vignesh-trustt/proofforge-rlvr-run-e2e-smoke-rlvr-2026.10.26
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Repositorio de referencia de Goedel-Prover (GitHub): https://github.com/Goedel-LM/Goedel-Prover
- Lean 4: https://lean-lang.org/
- Mathlib: https://github.com/leanprover-community/mathlib4
- Numina (dataset de problemas matematicos): https://huggingface.co/AI-MO/NuminaMath-CoT
- Paper de referencia de Goedel-Prover-V2: no disponible en la informacion proporcionada.
