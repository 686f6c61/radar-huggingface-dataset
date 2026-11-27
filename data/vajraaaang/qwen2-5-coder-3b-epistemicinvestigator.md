# Vajraaaang/Qwen2.5-Coder-3B-EpistemicInvestigator

## Resumen

Qwen2.5-Coder-3B-EpistemicInvestigator es un adaptador LoRA de post-entrenamiento publicado por el usuario Vajraaaang sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. No se trata de un modelo de propósito general, sino de un agente especializado en verificación de código y caza de bugs: recibe un módulo Python cuyos ejemplos del docstring pasan y debe decidir, ejecutando sondas `pytest` en un sandbox aislado, si devuelve un contraejemplo ejecutable que falsa el contrato (`submit_falsifier`) o si certifica la consistencia con dicho contrato (`declare_clean`).

La relevancia técnica del artefacto está menos en el modelo en sí que en el pipeline de investigación que lo acompaña: un ciclo de RLVR en dos etapas (RFT multi-turno on-policy seguido de Dr. GRPO con anclaje KL y TIS), un arnés de evaluación con oráculo diferencial tripartito y bootstrap pareado, un escáner AST anti-reward-hacking, kernels CUDA propios para la cabeza de acción y un sandbox basado en namespaces de Linux. Todo ello se documenta en el reporte técnico enlazado desde la model card.

El adaptador se distribuye como checkpoint `ckpt20` de la iteración `calibrated-v6`, seleccionado a ciegas sobre un split `dev` sellado de 1.440 episodios y evaluado en un único pase sobre `eval` (30 tareas) y `confirmation` (27 tareas). El tamaño del repositorio es de 0,1 GB, coherente con un adaptador LoRA de rango 16 y no con un modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA all-linear (`r=16`, `lora_alpha=32`) |
| Parámetros totales | No disponible (el adaptador LoRA se distribuye sobre un base de 3B; el número exacto de parámetros del adaptador no se indica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-Coder-3B-Instruct, valor no confirmado en la model card) |
| Tipos de cuantización | No disponible (se distribuyen pesos safetensors del adaptador; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `qwen-research` (etiqueta `license: other`, enlace a la licencia del base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct (commit `488639f1ff808d1d3d0ba301aef8c11461451ec5`) con LoRA de rango 16 y alpha 32 en todas las capas lineales. El post-entrenamiento sigue un esquema `calibrated-v6` en dos etapas: primero un RFT multi-turno on-policy a partir de 1.240 rollouts del base 3B, curados 50/50 hasta 64 trazas verificadas por resultado, con SFT LoRA enmascarado solo sobre acciones (`env_mask == 1`); después, 60 pasos de Dr. GRPO combinado con TIS para RLVR, usando el modelo RFT congelado como ancla KL (`beta=0.02`), centrado sin subvención de falsos negativos (`mu_eff = max(0, mean)`), deterrencia calibrada para casos limpios (`alpha_clean=0.55`), corrección de importance sampling con `processed_logprobs` (desviación media absoluta de log-probabilidad de 0.00677) y replay offline sobre 8 datasets históricos.

El agente opera con un bucle epistémico de cuatro herramientas (`read_source`, `run_probe`, `submit_falsifier`, `declare_clean`), parser tolerante a fallos, enmascaramiento alineado por sufijo sin retokenización, truncación progresiva de observaciones anti-inyección y un oráculo diferencial tripartito `(target=1, gold=0, alt=0)`. La evaluación emplea bootstrap pareado de 10.000 remuestras y 67 testigos únicos re-ejecutados de forma independiente. El componente de análisis de programas incluye 12 familias de mutación estructural AST, un renombrador de scope `AlphaRenamer` (closures, `nonlocal`, `AnnAssign`, pattern matching), deduplicación por hash AST entre HumanEval+ y MBPP+, y un verificador estático `ExploitASTScanner` que exige dependencia de dataflow del target y bloquea aserciones tautológicas (376/376 testigos genuinos admitidos, 25/25 exploits adversariales bloqueados). El repositorio incluye además una extensión C++/CUDA `ActionPackedLMHead` con `TILE_V=16.384`, LSE online, entropía exacta en forward, backward con acumulación FP32 y compactación de acciones por prefix-sum, con invariancia bit a bit `B=1` vs `B=16`, gradcheck en fp64 correcto (`rel_err=1.455e-7`) y aceleraciones de 2,92x a 12,99x (6,03x menos VRAM incremental a 70,1% de sparsity en L4).

## Capacidades

- Verificación de código Python: dado un módulo con docstring, decide si el contrato se cumple o si existe un contraejemplo ejecutable.
- Caza de bugs dirigida mediante sondas `pytest` ejecutadas en sandbox aislado.
- Tool calling estructurado con cuatro herramientas fijas (`read_source`, `run_probe`, `submit_falsifier`, `declare_clean`).
- Razonamiento multi-paso y multi-turno dentro del bucle epistémico del agente.
- Generación de contraejemplos ejecutables como falsificadores formales del contrato del docstring.
- Certificación de consistencia (`declare_clean`) con deterrencia calibrada para reducir falsos positivos.
- Análisis estático asistido: interpretación de mutaciones AST y de dependencias de dataflow.
- Ejecución segura en sandbox con aislamiento de namespaces (user, net, pid, ipc, uts) y límites `rlimit` (CPU 4 s, FSIZE 2 MiB, NPROC 256, AS 1 GiB).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Verificación automática en CI/CD: integrar el agente como paso previo al merge para detectar módulos cuyos ejemplos de docstring no cubren casos límite, devolviendo un contraejemplo reproducible en lugar de un informe ambiguo.
- Auditoría de librerías de terceros: ejecutar el agente sobre módulos Python de dependencias para certificar o falsar contratos declarados antes de adoptarlas en producción.
- Generación de tests de regresión: usar los contraejemplos `submit_falsifier` como semillas de nuevos casos de prueba que amplíen la suite `pytest` existente.
- Docencia y revisión de código: el bucle de sondas produce trazas interpretables que muestran qué entrada rompe el contrato, útil para explicar por qué un docstring es incorrecto.
- Detección de reward hacking en pipelines de RL: el `ExploitASTScanner` y el oráculo diferencial tripartito permiten auditar generadores de tests sintéticos que podrían estar produciendo aserciones tautológicas.
- Investigación en RLVR: el pipeline reproducible (RFT + Dr. GRPO + TIS, con replay offline y bootstrap pareado) sirve como plantilla para experimentos de post-entrenamiento con verificación de resultados.
- Evaluación de agentes de código en entornos aislados: el sandbox `BubblewrapPythonSandbox` con fallback fail-closed permite desplegar el agente en infraestructura compartida sin privilegios.
- Benchmarking de kernels CUDA: la extensión `ActionPackedLMHead` puede reutilizarse para medir el coste de cabezas de acción con enmascaramiento disperso en GPUs L4/L40S.

## Benchmarks y rendimiento

Resultados de la evaluación pareada publicados en la model card (base 3B congelado vs. `calibrated-v6 ckpt20`):

| Split / modo | Métrica | Base 3B | `v6` (`ckpt20`) | Diferencia pareada | IC bootstrap 95% |
|---|---|---:|---:|---:|---|
| `eval` greedy (30: 21B/9C) | Buggy `pass@1` | 4/21 (19,05%) | 12/21 (57,14%) | +38,10 pp (3,0x) | [+19,05 pp, +57,14 pp] |
| `eval` greedy (30) | Clean FAR | 0/9 (0,00%) | 1/9 (11,11%) | +11,11 pp | [0,00 pp, +33,33 pp] |
| `eval` greedy (30) | Youden's J | +0,190 | +0,460 | +0,270 | [-0,048, +0,524] |
| `eval` sampled 8x (240) | Buggy `mean@8` | 26/168 (15,48%) | 67/168 (39,88%) | +24,40 pp (2,58x) | [+8,93 pp, +41,07 pp] |
| `eval` sampled 8x (240) | Buggy `pass@8` | 10/21 (47,62%) | 14/21 (66,67%) | +19,05 pp | [-4,76 pp, +42,86 pp] |
| `eval` sampled 8x (240) | Clean FAR | 5/72 (6,94%) | 10/72 (13,89%) | +6,94 pp | [-4,17 pp, +25,00 pp] |
| `confirmation` greedy (27: 19B/8C) | Buggy `pass@1` | 1/19 (5,26%) | 6/19 (31,58%) | +26,32 pp (6,0x) | [+10,53 pp, +47,37 pp] |
| `confirmation` greedy (27) | Clean FAR | 1/8 (12,50%) | 1/8 (12,50%) | 0,00 pp | [0,00 pp, 0,00 pp] |
| `confirmation` greedy (27) | Youden's J | -0,072 | +0,191 | +0,263 | [+0,105, +0,474] |
| `confirmation` sampled 8x (216) | Buggy `mean@8` | 15/152 (9,87%) | 42/152 (27,63%) | +17,76 pp | No disponible (dato truncado en la información) |

Datos de sistemas publicados: aceleración de 2,92x a 12,99x del kernel `ActionPackedLMHead` en L4, con 6,03x menos VRAM incremental a 70,1% de sparsity y 71,7x menos en el mejor caso; speedup de evaluación de aproximadamente 12,2x con vLLM 0.16.0 colocado en modo sleep/wake; perfilado en L40S con 289.136 eventos y las cabezas custom al 0,030% del tiempo de kernel GPU, saltando el 70,49% de los tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Al ser un adaptador LoRA sobre un base de 3B, el grueso de la VRAM corresponde al modelo base; en fp16 el base ronda los 6 GB y en cuantización de 4 bits alrededor de 2-3 GB (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: la model card documenta experimentos en NVIDIA L4 y L40S; el base 3B es ejecutable en GPUs consumer modernas, pero no se publica una lista oficial de GPUs validadas.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB con el base cuantizado, aunque no hay validación oficial publicada.
- Opciones de despliegue: PEFT para carga del adaptador; vLLM 0.16.0 con sleep/wake y seeding por petición (documentado); el pipeline de evaluación usa sandbox bubblewrap y contenedores OCI con digest fijado. No se documenta soporte explícito para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia por petición; sí relativas (12,2x de speedup en rollout de evaluación con vLLM colocado y 2,92x-12,99x en el kernel de cabeza de acción).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-EpistemicInvestigator | Base 3B + LoRA `r=16` | No disponible | Agente de verificación de código con RLVR | `qwen-research` | Hugging Face (0 descargas, 0 likes en el momento de la ficha) |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | No disponible en esta ficha | Modelo base instructivo de código | `qwen-research` | Hugging Face (modelo base público) |
| Alternativas de verificación de código de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (agentes de verificación de código post-entrenados con RLVR sobre bases de 3B) en el material proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre HumanEval+ y MBPP+ y sobre Python, el dominio está sesgado hacia código Python de estilo competitivo y de librería estándar.
- Riesgo de alucinación: el agente puede emitir `submit_falsifier` con contraejemplos no ejecutables o `declare_clean` sobre módulos defectuosos; las métricas publicadas muestran una FAR de casos limpios del 11,11% en `eval` greedy y del 12,50% en `confirmation`, lo que implica falsos positivos reales en producción.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no se especifica en la información disponible y debe consultarse en el modelo base.
- Restricciones de licencia: licencia `qwen-research`, que restringe el uso comercial; verificar los términos exactos en el enlace a la licencia del base antes de cualquier despliegue productivo.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el 2026-11-27; se trata de un artefacto de investigación sin validación comunitaria.
- Dependencia de infraestructura: requiere sandbox con soporte de namespaces (bubblewrap) o el fallback fail-closed con `rlimit`; sin aislamiento, la ejecución de sondas `pytest` sobre código no confiable es peligrosa.
- Naturaleza del artefacto: es un adaptador PEFT, no un modelo autónomo; necesita el base Qwen2.5-Coder-3B-Instruct y la librería `peft` para funcionar.
- Evaluación limitada: los splits `eval` (30 tareas) y `confirmation` (27 tareas) son pequeños, y varios intervalos de confianza bootstrap cruzan cero (por ejemplo, `pass@8` en `eval` y Clean FAR en `confirmation` sampled), por lo que las mejoras deben interpretarse con cautela.
- El pipeline asume un contrato de docstring como especificación; módulos sin docstrings ejecutables quedan fuera del ámbito de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vajraaaang/Qwen2.5-Coder-3B-EpistemicInvestigator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Reporte técnico (referenciado en la model card): `./TECHNICAL_REPORT.md` dentro del repositorio del modelo
- Evaluación final verificada (JSON): `./evaluation/verified_final_eval.json`
- Benchmark CUDA en L4 (JSON): `./evaluation/cuda_benchmark_l4.json`
- Perfil de sistemas (JSON): `./evaluation/systems_profile.json`
- Dataset HumanEval+: https://huggingface.co/datasets/evalplus/humanevalplus
- Dataset MBPP+: https://huggingface.co/datasets/evalplus/mbppplus
