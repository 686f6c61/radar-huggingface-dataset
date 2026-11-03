# viai957/proofforge-goedel8b-e2e-smoke-checkpoints

## Resumen

Este repositorio no contiene un modelo entrenado para su uso en producción, sino un archivo de checkpoints intermedios generados durante una prueba de extremo a extremo (smoke test) del pipeline de entrenamiento ProofForge. Sobre el modelo base Goedel-LM/Goedel-Prover-V2-8B, un transformer de 8.000 millones de parámetros especializado en demostración de teoremas en Lean 4, se aplicaron tres etapas consecutivas: ajuste supervisado (SFT), optimización por preferencias (DPO) y aprendizaje por refuerzo con verificación formal (RLVR, variante CISPO). Cada etapa dejó su adaptador LoRA con su estado de entrenamiento asociado.

La relevancia del artefacto es metodológica y de ingeniería: demuestra que un pipeline completo de SFT, DPO y RL contra el kernel de Lean 4 puede ejecutarse en hardware modesto (cuatro GPU NVIDIA L4 de 23 GB, en bf16 y con una secuencia por GPU y paso) y producir checkpoints que reanudan y verifican correctamente. El autor es explícito al señalar que no se reclama ninguna capacidad de demostración derivada de estos pesos y que no se ejecutó ningún benchmark.

El proyecto ProofForge abandonó esta línea base el 29 de octubre de 2026 en favor de NVIDIA Nemotron-3-Nano, entre otros motivos porque la primera ronda de iteración experta sobre el modelo base rindió 188/226 en miniF2F-valid, idéntico al modelo base. Estos checkpoints se conservan como referencia reproducible del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Goedel-Prover-V2-8B) con adaptadores LoRA de rango 64 y alpha 128 sobre las proyecciones q, k, v, o, gate, up y down |
| Parametros totales | 8.000 millones (modelo base); el tamaño exacto de los adaptadores no se detalla, el repositorio ocupa 7,0 GB incluyendo estado de entrenamiento |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizó en bf16 |
| Idiomas soportados | no disponible (el dominio de uso es Lean 4 y lenguaje formal) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) y pickles de PyTorch (.pt, .pth) para estado de entrenamiento |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8.000 millones de parámetros orientado a la generación de demostraciones formales en Lean 4. Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128 que cubren las proyecciones de atención (q, k, v, o) y de la MLP (gate, up, down). El entrenamiento se ejecutó sobre 4 GPU NVIDIA L4 de 23 GB en bf16, con una secuencia por GPU y paso, sobre la revisión `dfd02e6271a58375dfbf3ece0175277cf6b6a89a` del modelo base.

Los datos provienen del pool de entrenamiento Goedel-Pset-v1 (licencia MIT, con problemas informales derivados de NuminaMath, Apache-2.0), servidos a través de `viai957/lean-prover-data`. El propio modelo base generó las demostraciones y un verificador Lean 4 congelado emitió el juicio de aceptación; esos veredictos son públicos en el dataset `viai957/proofforge-goedel8b-e2e-attested-generations`. La etapa SFT usó 320 demostraciones aceptadas durante 80 pasos con tasa de aprendizaje 2e-5 y 1243 s de tiempo de pared; la pérdida se mantuvo en torno a 0,03 (0,0305 en el paso 1 y 0,0333 en el paso 80), lo que es esperable al ser los objetivos salidas del propio modelo. La etapa DPO partió del adaptador SFT, con 69 pares de preferencia (demostración aceptada frente a rechazada para el mismo enunciado), 20 pasos, tasa 2e-5 y 882 s; la pérdida bajó de 0,173 a 0,139. La etapa RLVR empleó pérdida CISPO, 2 iteraciones de 8 prompts con 4 muestras cada una, tasa 1e-5 y recompensa basada en la aceptación del kernel de Lean; la política partió de una fusión en bf16 del adaptador DPO en el modelo base, y el verificador aceptó 20 de 32 muestras en la iteración 0 y 13 de 32 en la iteración 1, diferencia que el propio autor califica de no interpretable con tan pocas iteraciones.

## Capacidades

- Generación de demostraciones formales en Lean 4 a partir de enunciados, heredada del modelo base Goedel-Prover-V2-8B.
- Ajuste supervisado sobre demostraciones verificadas por el kernel de Lean 4.
- Optimización por preferencias con pares aceptado/rechazado sobre el mismo enunciado.
- Aprendizaje por refuerzo con recompensa binaria procedente del verificador formal (CISPO).
- Reanudación de entrenamiento: los checkpoints incluyen estado del optimizador AdamW, planificador, estado RNG por rango y posición del sampler.
- Carga como adaptadores PEFT sobre el modelo base o mediante fusión previa del adaptador DPO para el adaptador RLVR.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción del pipeline ProofForge: los checkpoints permiten reanudar exactamente las etapas SFT, DPO y RLVR con el mismo estado de optimizador, planificador y RNG, lo que facilita auditar la reproducibilidad del entrenamiento.
- Referencia de implementación de RLVR con verificación formal: sirve como ejemplo funcional de entrenamiento por refuerzo cuyo reward es la aceptación del kernel de Lean 4, útil para equipos que construyan pipelines similares.
- Validación de infraestructura en GPU de gama media: demuestra que SFT, DPO y RLVR sobre un modelo de 8B caben en 4 GPU L4 de 23 GB en bf16, lo que sirve para dimensionar clústeres de entrenamiento modestos.
- Estudio de la degradación por fusión en bf16: el fallo de paridad de fusión documentado (diferencia máxima de logits de 9,37 frente al límite de 0,05) es un caso práctico para investigar los efectos del redondeo al fusionar adaptadores LoRA.
- Auditoría de contaminación de datos: el reescaneo de las filas entrenadas contra 16 conjuntos protegidos (incluidos miniF2F, ProofNet, PutnamBench y MOBench) con 0 coincidencias sirve como plantilla de verificación de fugas en datasets de demostración formal.
- Base para experimentos de destilación o continuación del entrenamiento: al estar los adaptadores en safetensors y el estado completo en pickles de PyTorch, se pueden reutilizar como punto de partida de nuevas rondas, siempre que se confíe en el repositorio para cargar los .pt con `weights_only=False`.
- Docencia sobre PEFT: la estructura de carpetas con SFT, DPO y RLVR separados y sus configuraciones de LoRA (rango 64, alpha 128, proyecciones concretas) es material didáctico para explicar el ciclo completo de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark sobre estos checkpoints y que no se reclama capacidad de demostración. El único dato de rendimiento reportado es externo a estos pesos: la primera ronda de iteración experta del proyecto sobre el modelo base alcanzó 188/226 en miniF2F-valid con 8 muestras y un límite de 30.000 tokens, el mismo resultado que el modelo base.

## Requisitos de hardware

- Entrenamiento: 4 GPU NVIDIA L4 de 23 GB, bf16, una secuencia por GPU y paso; es la configuración exacta usada en las tres etapas.
- Inferencia del modelo base fusionado: al tratarse de un transformer de 8B, en bf16 requiere aproximadamente 16 GB de VRAM para los pesos, más memoria para el contexto y el runtime; en cuantización de 4 bits cabría en GPU de consumo con 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: L4 (23 GB) para reproducir el entrenamiento; para inferencia, cualquier GPU con al menos 16 GB en bf16 (A100, H100, RTX 4090, L40S) o GPU de consumo con cuantización.
- Despliegue: los adaptadores se cargan con `transformers` y `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la fusión de adaptadores en bf16 presenta problemas de paridad según el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| viai957/proofforge-goedel8b-e2e-smoke-checkpoints | 8B (base) + LoRA | no disponible | Checkpoints de pipeline SFT/DPO/RLVR sobre Goedel-Prover-V2-8B | Apache-2.0 | HuggingFace, 0 descargas |
| Goedel-LM/Goedel-Prover-V2-8B | 8B | no disponible | Demostración formal en Lean 4 | Apache-2.0 | HuggingFace (modelo base) |
| viai957/proofforge-goedel8b-sft-lora-e2e-smoke | 8B (base) + LoRA | no disponible | Adaptador SFT final del mismo experimento | Apache-2.0 | HuggingFace |
| NVIDIA Nemotron-3-Nano | no disponible | no disponible | Línea base adoptada por ProofForge desde el 29 de octubre de 2026 | no disponible | no disponible |

La comparación relevante es con el modelo base y con el adaptador SFT final del mismo proyecto; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Es un smoke test de la maquinaria, no un modelo para uso productivo: no se ejecutó ningún benchmark y no se reclama capacidad de demostración.
- La exportación fusionada del adaptador SFT falló la comprobación de paridad de fusión: diferencia máxima absoluta de logits de 9,37 frente a un límite de 0,05, y acuerdo greedy del 99,457 % frente al 99,5 % exigido; el redondeo en bf16 elimina parte del delta LoRA, por lo que se recomienda usar los adaptadores sin fusionar.
- La base del adaptador RLVR es precisamente una de esas fusiones: de sus 252 módulos fusionados, el peor conservó un coseno de 0,456 con el delta DPO previsto, según `docs/evidence/p4_e2e_2026-10-26/rlvr_base.merge.json`.
- Los archivos .pt y .pth son pickles de PyTorch; solo deben cargarse con `torch.load(..., weights_only=False)` si se confía en el repositorio.
- `adapter_config.json` registra una ruta local del equipo de entrenamiento como base; es necesario pasar el modelo base explícitamente y fijar la revisión.
- Las dos iteraciones de RLVR son insuficientes para extraer conclusiones sobre la evolución de la tasa de aceptación (20/32 frente a 13/32).
- El proyecto abandonó esta línea base el 29 de octubre de 2026 en favor de NVIDIA Nemotron-3-Nano y la primera ronda de iteración experta no superó al modelo base en miniF2F-valid (188/226 en ambos casos).
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; el dominio de uso es formal (Lean 4), donde el verificador actúa como filtro, pero fuera de él el modelo base puede generar contenido no verificado.
- Licencia Apache-2.0, la misma del modelo base; los enunciados de entrenamiento proceden de Goedel-Pset-v1 (MIT) con problemas informales de NuminaMath (Apache-2.0), lo que conviene verificar si se redistribuyen los datos derivados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/viai957/proofforge-goedel8b-e2e-smoke-checkpoints
- Colección ProofForge Experiment Archive: https://huggingface.co/collections/viai957/proofforge-experiment-archive-6ae958d029e1ebf1e20f804e
- Adaptador SFT final: https://huggingface.co/viai957/proofforge-goedel8b-sft-lora-e2e-smoke
- Dataset de generaciones atestadas por el verificador: https://huggingface.co/datasets/viai957/proofforge-goedel8b-e2e-attested-generations
- Modelo base Goedel-Prover-V2-8B: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Dataset Goedel-Pset-v1: https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
- Dataset lean-prover-data: https://huggingface.co/datasets/viai957/lean-prover-data
- Evidencias del experimento (rutas citadas en la model card): `docs/evidence/p4_e2e_2026-10-26/` y `artifacts/{sft_checkpoint,dpo_checkpoint,rlvr_run}/e2e-smoke-*@2026.10.26/MANIFEST.json`
