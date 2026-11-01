# vignesh-trustt/proofforge-sft-checkpoint-e2e-smoke-sft-2026.10.26

## Resumen

`vignesh-trustt/proofforge-sft-checkpoint-e2e-smoke-sft-2026.10.26` es un adaptador LoRA (r=64, alpha=128) entrenado sobre el modelo base congelado `Goedel-LM/Goedel-Prover-V2-8B`, un transformer de 8 mil millones de parametros especializado en demostracion automatica de teoremas en Lean 4. El adaptador forma parte de ProofForge, un pipeline de entrenamiento por refuerzo y ajuste supervisado cuyo verificador es el propio kernel de Lean 4, de modo que las etiquetas y recompensas provienen exclusivamente de comprobaciones formales del kernel.

Es importante subrayar que este repositorio es un artefacto de humo (smoke test) de extremo a extremo del pipeline, no un modelo afinado para produccion. El propio autor lo declara explicitamente: el objetivo era validar que el flujo de entrenamiento funciona de principio a fin (carga del modelo base, entrenamiento LoRA, movimiento de pesos, verificacion), y no se reclama ningun resultado de benchmark. El entrenamiento consistio en 80 pasos sobre 320 filas distintas, con un lote micro de 1 y 4 procesos en paralelo.

Su relevancia es, por tanto, metodologica y de trazabilidad: documenta con hashes SHA-256 el modelo base, el verificador congelado (Lean v4.9.0-rc1, Mathlib d1d1e4b72c6e, REPL 7df77c0a1c91), el ledger de descontaminacion y la configuracion del stage, lo que lo convierte en una referencia util para quien quiera replicar o auditar pipelines de entrenamiento de probadores formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only `Goedel-Prover-V2-8B` |
| Parametros totales | 504 tensores entrenables LoRA (r=64, alpha=128); parametros totales del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; base entrenado en bfloat16) |
| Idiomas soportados | no disponible (dominio: Lean 4 y lenguaje informal de problemas matematicos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en 4 shards safetensors |
| Tamano del repo | 4.9 GB |
| Libreria | peft |
| Modelo base | Goedel-LM/Goedel-Prover-V2-8B |
| Dtype de entrenamiento | torch.bfloat16 |
| Optimizador | fused Adam |
| Learning rate | 2e-05 |
| Pasos de entrenamiento | 80 |
| Filas distintas | 320 |
| Mundo (procesos) | 4 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Goedel-Prover-V2-8B`, un transformer decoder-only de 8B parametros orientado a la generacion de pruebas formales en Lean 4. El entrenamiento LoRA congela el modelo base en bfloat16 y entrena 504 tensores (r=64, alpha=128) con fused Adam, learning rate 2e-05, micro-lote de 1 y acumulacion de gradiente de 1, durante 80 pasos distribuidos en 4 procesos. El callback `WeightsMovedCallback` verifica que los pesos LoRA efectivamente se mueven: `lora_B` desde el paso 1, `lora_A` desde el paso 2, con 504 tensores movidos y base sin cambios.

Los datos de entrenamiento son generaciones del pool P2 del modelo base sobre `Goedel-Pset-v1` (problemas informales de Numina, licencia MIT/Apache-2.0), verificadas por el kernel de Lean 4 y reauditadas en axiomas. Se documenta un ledger de descontaminacion con hash `991fa294...` que protege miniF2F-test/valid, MOBench, ProofNet y PutnamBench como puerta dura. El verificador congelado tiene hash de fuente `f1dd9e78...` y pines de version Lean v4.9.0-rc1, Mathlib d1d1e4b72c6e y REPL 7df77c0a1c91. El runtime registra tres desviaciones respecto al plan: atencion `sdpa` en lugar de `flash_attention_2` (flash_attn no instalado), sample packing desactivado (una fila sin empaquetar por micro-lote) y perdida CE chunked de `lm_head` en lugar de la fusionada de Liger (misma cantidad, probada igual).

## Capacidades

- Generacion de pruebas formales en Lean 4 a partir de enunciados de teoremas, heredada del modelo base.
- Razonamiento matematico formal y verificable por kernel.
- Aprendizaje supervisado con etiquetas derivadas exclusivamente de un verificador formal, lo que elimina el ruido de etiquetas humanas.
- Capacidad de servir como artefacto de validacion de pipelines de entrenamiento (smoke test de extremo a extremo).
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Validacion de pipelines de entrenamiento: el adaptador sirve como prueba de humo de que la carga del modelo base, el entrenamiento LoRA, el movimiento de pesos y la verificacion funcionan de extremo a extremo antes de lanzar entrenamientos a mayor escala.
- Auditoria de reproducibilidad: los hashes de modelo base, verificador, dataset, ledger de descontaminacion y configuracion permiten reconstruir exactamente el experimento y comprobar que no hubo fugas de benchmarks protegidos.
- Investigacion en demostracion automatica de teoremas: punto de partida para experimentar con LoRA sobre Goedel-Prover-V2-8B en Lean 4 sin reentrenar el modelo completo.
- Desarrollo de pipelines de RL con verificador formal: el artefacto documenta como conectar generaciones del modelo con un kernel de Lean 4 congelado como fuente de recompensa.
- Docencia y formacion: ejemplo realista de configuracion PEFT (r, alpha, lr, grad accum) y de trazabilidad de artefactos en un proyecto de IA formal.
- Base para fine-tuning posterior: al ser un adaptador LoRA pequeno sobre un base apache-2.0, puede combinarse o continuarse en experimentos propios, siempre que se valide su calidad antes de uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ningun resultado de benchmark y que el artefacto es un smoke test del pipeline, no un probador afinado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 8B en bfloat16 requiere aproximadamente 16 GB de VRAM solo para pesos, mas overhead de activaciones y contexto.
- GPU recomendadas: no disponibles para este adaptador; el base de 8B cabe en A100 40GB, H100 y RTX 4090 (24 GB) con cuantizacion.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) con el base en cuantizacion de 8 o 4 bits; no confirmado en la informacion disponible.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `peft` sobre el base; opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (ProofForge smoke) | LoRA sobre 8B | no disponible | SFT con verificador Lean 4 | apache-2.0 | HuggingFace, 0 descargas |
| Goedel-Prover-V2-8B (base) | 8B | no disponible | Probador formal Lean 4 | apache-2.0 | HuggingFace |
| DeepSeek-Prover (familia) | hasta 7B | no disponible | Probador formal Lean 4 | no disponible | HuggingFace |
| Kimina-Prover (familia) | hasta 72B | no disponible | Probador formal Lean 4 | no disponible | HuggingFace |

La comparacion directa no esta disponible en la informacion proporcionada mas alla del modelo base; los datos de DeepSeek-Prover y Kimina-Prover no se incluyen en esta ficha y no deben tomarse como cifras verificadas.

## Limitaciones y advertencias

- Es un artefacto de humo del pipeline, no un modelo afinado: el autor declara que no se reclama ningun resultado de benchmark y que no es un probador ajustado.
- Entrenado solo 80 pasos sobre 320 filas: la senal de aprendizaje es minima y no cabe esperar mejoras medibles frente al base.
- El entrenamiento se ejecuto con desviaciones respecto al plan (sdpa en lugar de flash attention, sin sample packing, perdida CE no fusionada), lo que puede afectar a la reproducibilidad exacta.
- No hay datos de sesgos, alucinacion, idiomas ni rendimiento en produccion.
- Licencia apache-2.0 permite uso comercial, pero la calidad del adaptador no esta validada para produccion.
- El base Goedel-Prover-V2-8B esta especializado en Lean 4; no es un modelo generalista y su uso fuera de ese dominio no esta soportado.
- El ledger de descontaminacion protege miniF2F, MOBench, ProofNet y PutnamBench, pero no se aportan resultados en esos conjuntos.

## Enlaces

- HuggingFace: https://huggingface.co/vignesh-trustt/proofforge-sft-checkpoint-e2e-smoke-sft-2026.10.26
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Dataset Goedel-Pset-v1: no disponible en la informacion proporcionada
- Paper o blog de ProofForge: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
