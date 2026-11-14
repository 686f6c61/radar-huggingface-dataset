# YK49/ledgertune-tiny-aya-global-agent

## Resumen

LedgerTune es un adaptador LoRA (PEFT) para el modelo base CohereLabs/tiny-aya-global, entrenado por el autor YK49 en el marco del hackathon "Lexsi AI Safety & Alignment — Track 3: Agentic Fine-Tuning". El objetivo declarado es convertir un modelo pequeño en un agente capaz de ejecutar flujos de trabajo contables de partida doble con herramientas JSON estrictas, invariantes de balance y un grafo de estados transaccional, incluyendo casos de rechazo y rollback. El repositorio incluye además el entorno determinista, las trayectorias de profesor verificadas por entorno, la función de recompensa y el arnés de evaluación AuditKIT.

El proyecto no es solo un checkpoint: es un testbed completo que hace detectables fallos típicos de agentes financieros (asientos descuadrados, comprobaciones de cumplimiento omitidas, transacciones forzadas tras un rechazo, bucles de reintento). El entrenamiento reportado se realizó sobre Qwen/Qwen2.5-1.5B-Instruct en una NVIDIA L4 de Google Colab, con SFT (LoRA r=16, α=32, 3 épocas, 51 pasos) y un intento posterior de GRPO que, según el propio autor, falló y no produjo resultados válidos.

La relevancia actual es doble: por un lado, demuestra una metodología reproducible de post-entrenamiento agéntico con verificación por entorno y auditoría; por otro, los resultados en vivo son modestos y el propio autor los reporta con transparencia, incluyendo el fallo de la etapa GRPO. La model card no especifica licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base declarado: CohereLabs/tiny-aya-global; entrenamiento reportado sobre Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; repo de 0.3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se publica como PEFT con pesos safetensors y está pensado para cargarse sobre el modelo base. La model card declara dos modelos base (`CohereLabs/tiny-aya-global` y `Qwen/Qwen2.5-1.5B-Instruct`), pero el entrenamiento real documentado se ejecutó sobre Qwen2.5-1.5B-Instruct con LoRA r=16, α=32, 3 épocas (51 pasos), batch size 2 y learning rate 2e-4, consumiendo 397.312 tokens en 119 segundos sobre una L4. La pérdida de entrenamiento bajó de 1,8025 (paso 5) a 0,4374 (paso 50), con precisión media de token del 89,92 % en el conjunto de entrenamiento.

El pipeline consta de cuatro fases: (1) un entorno de ledger con 5 herramientas de esquema JSON estricto, invariantes de partida doble y una matriz de polaridad de saldo normal; (2) 150 trayectorias de profesor verificadas por entorno en 5 tipos de flujo, con un 40 % de casos de rechazo/rollback; (3) una función de recompensa determinista R(τ) ∈ [−0,5, 1,0] que penaliza asientos descuadrados, transiciones ilegales del grafo de estados, esquemas inválidos y commits tras rechazo; y (4) un arnés de evaluación en vivo con AuditKIT `AgentEvalRunner`. La etapa GRPO se intentó con `create_agentic_trainer("grpo")`, pero se inicializó desde el modelo base en lugar del adaptador SFT, registró `train_loss: 0.0` y no guardó pesos de adaptador de nivel superior; el autor la reporta como etapa fallida.

## Capacidades

- Generación de llamadas a herramientas (tool calling) con esquema JSON estricto sobre 5 herramientas del entorno de ledger.
- Ejecución de flujos multi-paso con grafo de estados transaccional (transiciones legales entre estados de una transacción).
- Manejo de casos de rechazo y rollback (el 40 % de las trayectorias de entrenamiento son de este tipo).
- Razonamiento sobre invariantes contables de partida doble y ecuación fundamental de la contabilidad.
- Capacidad de continuar un workflow más allá de una o dos llamadas (el SFT aprendió a seguir trabajando, aunque con exceso de pasos).
- Soporte de agentes y razonamiento multi-paso (objetivo declarado del entrenamiento).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Automatización de asientos contables de partida doble: el modelo puede proponer entradas con N ≥ 2 líneas y verificar que la suma de débitos iguala la de créditos, apoyándose en las herramientas JSON del entorno.
- Verificación de cumplimiento (KYC, revisión regulatoria): el grafo de estados permite modelar aprobaciones y rechazos, y la función de recompensa penaliza commits tras un rechazo, lo que encaja con flujos de compliance con auditoría.
- Procesamiento de siniestros con aprobaciones: el modelo puede recorrer un flujo multi-paso con pasos de validación intermedios, aunque los resultados en vivo muestran que aún no completa episodios de forma fiable.
- Investigación en post-entrenamiento agéntico: el repositorio sirve como testbed reproducible para comparar SFT frente a GRPO con verificación por entorno y auditoría determinista.
- Generación de trayectorias sintéticas verificadas: el pipeline de 150 trayectorias de profesor puede reutilizarse para entrenar o evaluar otros modelos pequeños en tareas de ledger.
- Evaluación de seguridad de agentes financieros: las métricas de "unsafe commit violation rate" y "statechart transition accuracy" permiten auditar si un agente respeta reglas críticas antes de desplegarlo.
- Prototipado en hardware modesto: al ser un adaptador LoRA sobre un modelo de 1.5B, cabe en GPUs de consumo para experimentación, aunque la calidad en producción no está demostrada.

## Benchmarks y rendimiento

Resultados en vivo reportados por el autor (Colab L4, 25 episodios retenidos, AuditKIT 1.1.7, `evaluation_mode: live_model_rollout`):

| Métrica | Zero-shot Qwen2.5-1.5B | + AgentTune SFT | + GRPO (etapa fallida) |
|---|---|---|---|
| AuditKIT tool-call F1 | 5,71 % | 13,51 % | 5,71 % |
| Resultado verificado (estado final correcto) | 0,00 % | 4,00 % (1/25) | 0,00 % |
| Precisión sintáctica de tool-call | 100,00 % | 63,88 % | 100,00 % |
| Pasos medios (óptimo = 6,60) | 1,36 | 14,08 | 1,36 |
| Pasos redundantes medios | 0,00 | 9,92 | 0,00 |
| Tasa de invariante de partida doble | 40,00 % | 24,00 % | 40,00 % |
| Precisión de transición del grafo de estados | 0,00 % | 0,00 % | 0,00 % |
| Tasa de violación de commit inseguro | 0,00 % | 0,00 % | 0,00 % |
| Tasa de sello de auditoría terminal | 0,00 % | 0,00 % | 0,00 % |
| Recompensa determinista media | +0,4900 | +0,1897 | +0,4900 |

El autor atribuye la caída de precisión sintáctica del SFT (63,88 %) principalmente a un desajuste de formato de prompt: los datos SFT usaban texto `<tool_call>` plano, mientras que en inferencia se inyecta el prompt de sistema nativo `tools=` de Qwen. La fila GRPO es idéntica a zero-shot porque la etapa no produjo un adaptador válido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 1.5B, la inferencia en fp16 requiere aproximadamente 3-4 GB, y en cuantización de 4 bits podría caber en GPUs con 2-3 GB, aunque el autor no publica estas cifras.
- GPU recomendadas: el entrenamiento reportado se ejecutó en una NVIDIA L4 (Google Colab). Para inferencia, cualquier GPU con al menos 4 GB de VRAM es suficiente en fp16 para un modelo de 1.5B.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se publican mediciones.
- Opciones de despliegue: al ser PEFT, requiere cargar el adaptador sobre el modelo base con la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El entrenamiento SFT de 51 pasos consumió 119 s en una L4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LedgerTune (este) | Adaptador LoRA sobre base de ~1.5B | no disponible | Agente de ledger con SFT + GRPO fallido | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32K (según ficha pública del modelo base) | Instrucción general | Apache 2.0 (según ficha pública) | Hugging Face |
| CohereLabs/tiny-aya-global | no disponible | no disponible | Multilingüe pequeño | no disponible | Hugging Face |

La comparativa con alternativas específicas de agentes contables no está disponible en la información proporcionada. El modelo base Qwen2.5-1.5B-Instruct es el punto de referencia directo en los benchmarks del autor.

## Limitaciones y advertencias

- Resultados en vivo muy modestos: solo 1 de 25 episodios alcanzó el estado final correcto tras SFT (4 %), y la recompensa determinista media bajó de +0,49 a +0,19 respecto a zero-shot.
- La etapa GRPO falló: se inicializó desde el modelo base, registró pérdida 0,0 y no guardó adaptador; no debe interpretarse como un resultado del método.
- Desajuste de formato de prompt entre entrenamiento e inferencia que degrada la precisión sintáctica de las llamadas a herramientas (63,88 % frente a 100 % en zero-shot).
- Exceso de pasos: 14,08 pasos medios frente a un óptimo de 6,60, con 9,92 pasos redundantes de media; riesgo de bucles de reintento.
- Tasa de invariante de partida doble del 24 % tras SFT (frente al 40 % en zero-shot): el modelo empeora en esta métrica.
- Precisión de transición del grafo de estados del 0 % en todos los modelos evaluados: no se completó ninguna transición legal verificable.
- La tasa de violación de commit inseguro del 0 % es engañosa: ningún modelo llegó a un commit, por lo que no demuestra manejo seguro de rechazos.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Idiomas no especificados: no hay garantía de comportamiento multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado, pero relevante en un dominio financiero donde las cifras y asientos deben ser exactos.
- Repositorio con 0 descargas y 0 likes: sin validación externa por parte de la comunidad.
- Fecha de creación declarada 2026-11-14, lo que puede indicar metadatos inconsistentes o un entorno de hackathon con fechas simuladas.

## Enlaces

- Hugging Face: https://huggingface.co/YK49/ledgertune-tiny-aya-global-agent
- Modelo base declarado: https://huggingface.co/CohereLabs/tiny-aya-global
- Modelo base de entrenamiento reportado: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto (referenciado en la model card): archivos `src/phase1_architecture/ledger_env.py`, `src/phase2_trajectories/generate_trajectories.py`, `src/phase3_agenttune/reward_functions.py`, `src/phase4_auditkit/auditkit_harness.py`, `src/phase4_auditkit/live_rollout.py`, `LL-2.ipynb`, `data/auditkit_live_gpu_rollout_report.json`, `checkpoints/sft_ledger/checkpoint-51/trainer_state.json` (no se dispone de URL pública independiente en la información proporcionada).
- Paper, blog o demo adicionales: no disponibles.
