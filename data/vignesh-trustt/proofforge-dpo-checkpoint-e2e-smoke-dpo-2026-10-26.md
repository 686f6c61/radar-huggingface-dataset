# vignesh-trustt/proofforge-dpo-checkpoint-e2e-smoke-dpo-2026.10.26

## Resumen

`vignesh-trustt/proofforge-dpo-checkpoint-e2e-smoke-dpo-2026.10.26` es un adaptador LoRA publicado en HuggingFace como artefacto de validacion de extremo a extremo (E2E smoke) del pipeline ProofForge, un sistema orientado a la demostracion automatica de teoremas en Lean 4. No se trata de un modelo afinado para produccion ni de una version mejorada de su base: el propio autor lo describe como un "pipeline smoke artifact", es decir, una ejecucion de prueba cuyo objetivo es verificar que el flujo de entrenamiento DPO (Direct Preference Optimization) funciona de principio a fin, no obtener mejoras medibles en capacidad de demostracion.

El adaptador se monta sobre `Goedel-LM/Goedel-Prover-V2-8B`, un modelo base de 8.000 millones de parametros especializado en demostracion formal, congelado en bf16 durante el entrenamiento. El LoRA emplea rango 64 y alpha 128, y se inicializa desde un checkpoint SFT previo (`e2e-smoke-sft@2026.10.26`). El entrenamiento se limita a 20 pasos sobre 69 pares de preferencia, con learning rate 2e-05 y un batch global efectivo de 4 (micro-batch 1, world size 4).

Su relevancia es metodologica mas que de rendimiento: documenta con gran detalle la procedencia de datos, los hashes de verificacion del kernel Lean 4, el ledger de descontaminacion y las desviaciones de runtime respecto al plan original. Resulta util para quien quiera auditar o replicar la infraestructura ProofForge, pero no como sustituto del prover base en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r64, alpha 128) sobre transformer decoder de 8B (base Goedel-Prover-V2-8B) |
| Parametros totales | 8B en el modelo base; adaptador LoRA con 504 tensores entrenables (recuento de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base se carga en bf16) |
| Idiomas soportados | no disponible (orientado a Lean 4; idioma natural de los enunciados no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); base en 4 shards safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Goedel-Prover-V2-8B`, un transformer decoder de 8B parametros congelado en bf16. El entrenamiento usa PEFT con LoRA de rango 64 y alpha 128, inicializado desde el adaptador SFT `e2e-smoke-sft@2026.10.26` (504 tensores LoRA, 399 cargados y 1 tensor rotary reconstruido). Se emplea DPO con recompensas y etiquetas derivadas exclusivamente del verificador del kernel Lean 4 congelado (Lean v4.9.0-rc1, Mathlib d1d1e4b72c6e, REPL 7df77c0a1c91), no de un modelo juez.

Los datos de entrenamiento son generaciones del pool P2 del modelo base sobre Goedel-Pset-v1 (MIT; problemas informales de Numina, Apache-2.0), verificadas por kernel y reauditadas en axiomas, con un ledger de descontaminacion que protege miniF2F-test/valid, MOBench, ProofNet y PutnamBench como hard gate. La ejecucion consta de 20 pasos, 69 pares de preferencia, learning rate 2e-05, grad accum 1, micro-batch 1 y world size 4. Se documentan dos desviaciones de runtime: atencion con `sdpa` en lugar de `flash_attention_2` (flash_attn no instalado) y perdida CE por chunks en `lm_head` en lugar de la fusionada de Liger (misma cantidad, verificada equivalente). El callback `WeightsMovedCallback` confirma que los 504 tensores entrenables se movieron y que los pesos del base permanecen sin cambios.

## Capacidades

- Generacion de demostraciones formales en Lean 4 heredadas del modelo base Goedel-Prover-V2-8B.
- El adaptador en si no aporta capacidades nuevas: es un artefacto de validacion de pipeline, no un prover afinado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como caracteristica declarada del adaptador.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Verificacion de pruebas contra kernel Lean 4: forma parte del pipeline de datos, no una capacidad de inferencia del adaptador.

## Casos de uso

- Auditoria del pipeline ProofForge: el repositorio incluye MANIFEST.json, hashes de stage config, PREREG_PF y evidencia de etapa en JSON, lo que permite revisar la reproducibilidad del flujo DPO sin ejecutar hardware adicional.
- Validacion de integraciones PEFT: sirve como caso de prueba para comprobar que un adaptador LoRA r64/alpha128 se carga correctamente sobre un base de 8B con `sdpa` y perdida CE por chunks.
- Pruebas de CI/CD de entrenamiento: el artefacto E2E smoke puede incorporarse como fixture en pipelines que verifiquen que los callbacks de movimiento de pesos y los contadores de pasos funcionan.
- Desarrollo de infraestructura de verificacion formal: los hashes del verificador Lean y el ledger de descontaminacion son referencia para construir entornos reproducibles de evaluacion en theorem proving.
- Investigacion sobre DPO con recompensas de kernel: el diseno (rewards solo del kernel, sin modelo juez) es un ejemplo documentado para estudiar senales de preferencia verificables.
- Formacion y docencia sobre MLOps para modelos especializados: el nivel de detalle de procedencia y desviaciones lo hace util como ejemplo de trazabilidad en experimentos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que "no benchmark claim is made" y que se trata de un smoke artifact, no de un prover afinado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el base de 8B en bf16 requiere del orden de 16 GB de pesos mas overhead de activaciones y KV cache (estimacion estandar para 8B en bf16, no confirmada en la informacion).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un base de 8B en bf16 puede caber en GPUs de 24 GB, pero no hay dato oficial en la ficha.
- Opciones de despliegue: PEFT (libreria declarada); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion.
- Latencia y throughput: no disponibles. El entrenamiento se ejecuto con world size 4, micro-batch 1, 20 pasos y dtype bfloat16, sin datos de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofforge-dpo-checkpoint-e2e-smoke-dpo-2026.10.26 | 8B base + LoRA r64 | no disponible | Adaptador DPO smoke | apache-2.0 | HuggingFace (0 descargas) |
| Goedel-LM/Goedel-Prover-V2-8B | 8B | no disponible | Prover Lean 4 | apache-2.0 | HuggingFace (modelo base) |
| Alternativas de theorem proving en Lean 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria, por lo que la comparativa se limita al modelo base y queda incompleta en el resto de filas.

## Limitaciones y advertencias

- No es un modelo afinado: el autor lo califica de smoke artifact y no reclama mejoras de rendimiento; no debe usarse como prover en produccion.
- Entrenamiento minimo: 20 pasos y 69 pares de preferencia, insuficiente para producir cambios sustanciales en el comportamiento del base.
- Sin benchmarks: no hay evidencia publicada de calidad de demostracion ni de tasas de exito en miniF2F, ProofNet, PutnamBench u otros conjuntos.
- Riesgo de alucinacion: heredado del modelo base; las demostraciones generadas deben verificarse siempre contra el kernel Lean 4.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; el base esta orientado a Lean 4 y no se especifican idiomas naturales soportados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el adaptador depende del base Goedel-Prover-V2-8B, cuya licencia tambien es apache-2.0 segun la ficha; conviene verificar terminos de los datos de entrenamiento (Goedel-Pset-v1 MIT, Numina Apache-2.0).
- Reproducibilidad: el pipeline documenta desviaciones de runtime (sdpa en lugar de flash_attention_2, CE por chunks) que pueden afectar a la equivalencia exacta con la configuracion prevista.
- Sin descargas ni likes en HuggingFace: no hay senal de uso comunitario ni validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/vignesh-trustt/proofforge-dpo-checkpoint-e2e-smoke-dpo-2026.10.26
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Repositorio ProofForge: no disponible en la informacion
- Paper o blog asociado: no disponible en la informacion
- Demo: no disponible en la informacion
