# VoidWalkercero/Qwen3-0.6B-Particle-SousVide-R128-Perfect

## Resumen

El modelo `Qwen3-0.6B-Particle-SousVide-R128-Perfect` es un fine-tuning experimental del modelo base `Qwen3-0.6B` de Alibaba, desarrollado por el usuario VoidWalkercero. El autor combina el modelo denso de 0.6B con un adaptador LoRA de rango 128 (DoRA) y un conjunto de tecnologías propias (Q4_VVC, Attn-BVH, DNA-FM, OrderBook, Particle-SousVide) que modifican tanto la representación de pesos como la atención y el preprocesamiento de tokens. El resultado se distribuye en un formato propietario llamado G2BX, pensado para ejecutarse con el runtime `gguf2bin` del propio autor.

El modelo está orientado a mejorar el rendimiento en tareas de ciberseguridad, generación de código y razonamiento general, partiendo de una base de 0.6B parámetros. Según la model card, el entrenamiento se realizó sobre un dataset de 520.000 líneas (465 MB) con 20.000 pasos, logrando mejoras notables en benchmarks como SecEval (42% → 62,7%) y CyberMetric (38% → 67%). Es relevante porque demuestra que con técnicas de adaptación específicas se pueden exprimir capacidades adicionales de modelos pequeños, aunque su uso práctico está limitado por el formato propietario y la falta de documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con adaptador LoRA r128 (DoRA) y modificaciones propias (Attn-BVH, Particle-SousVide) |
| Parametros totales | 0.6B (base) + adaptador LoRA r128 (132 MB) |
| Parametros activos | no disponible (no se especifica si es MoE; el autor menciona "MoE" como una de sus tecnologías, pero no detalla) |
| Longitud de contexto | 32k (según el autor, con Attn-BVH; el contexto base de Qwen3-0.6B no se indica) |
| Tipos de cuantizacion | Q4_0 (base), Q4_VVC (propia, combinación de VVC intra-prediction y Q4) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | no disponible |
| Formato de pesos | G2BX (formato propietario del runtime gguf2bin), basado en GGUF Q4_0 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3-0.6B`, un transformer denso de 0.6B parámetros, y le añade un adaptador LoRA de rango 128 con técnica DoRA (Weight-Decomposed Low-Rank Adaptation). Sobre esta base, el autor aplica varias innovaciones propias: **Q4_VVC** que combina predicción intra-frame de vídeo VVC con cuantización Q4 para reducir el tamaño del modelo; **Attn-BVH** que usa estructuras de aceleración de ray tracing (Bounding Volume Hierarchy) para mejorar la atención en contextos largos (hasta 32k); **DNA-FM** que emplea un índice FM genómico para comprimir el tokenizador; **OrderBook** que aplica lógica de spreads bursátiles para saltar capas FFN de forma especulativa; y **Particle-SousVide**, una técnica de entrenamiento inspirada en el flocking de Particle Life y cocción sous-vide a 54,4°C, que según el autor reduce la pérdida de 3,52 a 1,00.

El entrenamiento se realizó sobre un dataset de 520.000 líneas (465 MB) compuesto por 110 shards de `rdru200m` (6,9 GB) y 20.000 ejemplos de `code_search_net`. Se ejecutaron 20.000 pasos con la técnica Particle-SousVide, combinando DoRA, GaLore y una mezcla de 4 expertos (cyber, general, code). El autor advierte que más entrenamiento provocaría overfitting en un modelo de 0.6B.

## Capacidades

- Generación de texto y chat general, con soporte para prompts de ciberseguridad y código.
- Mejora en tareas de seguridad informática: según el autor, el modelo alcanza 62,7% en SecEval (2.1k preguntas) y 67% en CyberMetric 500, frente al 42% y 38% de la base respectivamente.
- Generación de código: HumanEval (10 preguntas) mejora de 12% a 28% con el adaptador.
- Razonamiento instruccional: IFEval lenient (5 preguntas) pasa de 40% a 60%, y strict (541 preguntas) de ~15% a ~22%.
- Capacidad de ejecución con runtime propio `gguf2bin` que permite chat, generación con prompt y entrenamiento adicional (`cyber-train`).
- Soporte de "cyber" y "general" como modos de ejecución (flag `--cyber`).
- No se menciona soporte explícito de tool calling, agentes ni multi-step reasoning; el autor indica que un modelo de 0.6B no es agéntico (SWE-mini 0/1).

## Casos de uso

- Análisis de vulnerabilidades web: el modelo puede responder a preguntas sobre XSS, inyección SQL u otros vectores de ataque, gracias a su mejora en SecEval y CyberMetric. Se usaría con el runtime `gguf2bin` en modo chat o con prompts específicos.
- Generación de scripts de seguridad ofensiva: con la mejora en HumanEval, puede producir funciones Python para explotación o análisis, aunque con limitaciones propias de un modelo pequeño.
- Asistente de código en entornos sin GPU: al ser un modelo de 0.6B cuantizado, puede ejecutarse en CPU (el autor reporta 24,7 t/s en un i5-6200U), lo que lo hace viable para desarrollo local o integración en IDEs ligeros.
- Educación en ciberseguridad: como herramienta de práctica para estudiantes que necesitan ejemplos de payloads o explicaciones de conceptos de seguridad, con la ventaja de ser ejecutable en hardware modesto.
- Prototipado rápido de chatbots especializados: el adaptador está entrenado para dominios cyber y general, permitiendo crear asistentes de demostración sin depender de APIs externas.
- Investigación en técnicas de fine-tuning: el modelo sirve como caso de estudio para evaluar el impacto de técnicas como DoRA, GaLore y Particle-SousVide en modelos pequeños, aunque su formato propietario limita su reproducibilidad.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor. No se han verificado de forma independiente.

**Velocidad (CPU i5-6200U, según el autor):**

| Modelo | decode | prefill | +MV 0.5 | +BVH |
|--------|--------|---------|---------|------|
| Qwen3-0.6B Q4 base | 24,7 t/s | 38,6 t/s | 40,1 (+62%) | 24,8 |
| +Particle-SousVide | 24,7 | 38,6 | 31,9 | 2,5× ctx32k |

**Inteligencia (comparativa base vs. +Perfect r128 20k):**

| Benchmark | Base | +Perfect r128 20k | Δ |
|-----------|------|-------------------|----|
| ppl general (75t) | 58,709 | 57,1 | -2,6% |
| ppl cyber (715t) | 15,302 | 14,8 | -3% |
| ppl mmlu (165t) | 4,05 | ~3,9 | -3% |
| IFEval lenient (5Q) | 40% (2/5) | 60% (3/5) | +20pp |
| IFEval strict (541Q) | ~15% | ~22% | +7pp |
| SecEval (2.1k) | 42% | 62,7% (+20pp) | DoRA+GaLore |
| HumanEval (10Q) | 12% (1/10) | 28% (3/10) | +16pp code |
| SWE-mini (1 issue) | 0/1 | 0/1 | 0.6B no agéntico |
| CyberMetric (500) | 38% | 67% | +29pp |

El autor menciona que el estado del arte en 600B alcanza 71% en SecEval con r96 50k, y que con 520k ya se logra 62,7%, advirtiendo que más datos causarían overfitting.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero al ser un modelo de 0.6B cuantizado a Q4, el tamaño del repo es de 0,5 GB, por lo que podría caber en GPUs con 2-4 GB de VRAM, aunque el autor solo reporta ejecución en CPU.
- GPU recomendadas: no se mencionan; el autor usa CPU (i5-6200U) con 4 hilos.
- Compatibilidad con GPU de consumo: probablemente sí (por tamaño), pero no hay datos oficiales.
- Opciones de despliegue: runtime propietario `gguf2bin` (compilado con MinGW o Linux, requiere gcc, OpenMP, AVX2, FMA, F16C). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en CPU i5-6200U, decode de 24,7 t/s y prefill de 38,6 t/s según el autor. Con la opción `--mv 0` se reporta hasta 40,1 t/s en decode.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (0.6B) más allá del propio Qwen3-0.6B base. El modelo es un fine-tuning de Qwen3-0.6B, por lo que la comparación natural es contra la base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento (SecEval) |
|--------|------------|----------|----------|---------|------------------------|
| Qwen3-0.6B (base) | 0.6B | no disponible | Apache 2.0 (según Qwen) | GGUF, safetensors | 42% |
| Qwen3-0.6B-Particle-SousVide-R128-Perfect | 0.6B + LoRA r128 | 32k (según autor) | no disponible | G2BX (propietario) | 62,7% |

No se han encontrado otros modelos comparables con las mismas técnicas propietarias. La comparativa con modelos de mayor tamaño (p.ej. DeepSeek 671B) no es pertinente por la diferencia de escala.

## Limitaciones y advertencias

- El modelo se distribuye en un formato propietario (G2BX) que solo puede ejecutarse con el runtime `gguf2bin` del autor; no es compatible con herramientas estándar como llama.cpp, vLLM u Ollama.
- La licencia no está especificada, por lo que el uso comercial es incierto y no recomendable sin aclaración del autor.
- Los benchmarks presentados son auto-reportados y no han sido verificados de forma independiente; las métricas de ppl y IFEval se basan en muestras pequeñas (75t, 715t, 165t, 5Q, 541Q).
- El modelo es de 0.6B, por lo que su capacidad de razonamiento complejo, agencia y generación de código extenso es limitada (el propio autor reconoce que no es agéntico en SWE-mini).
- Riesgo de alucinación y sesgos inherentes a modelos pequeños entrenados con datasets específicos; no se documentan sesgos concretos.
- El autor advierte que más entrenamiento (más de 20k pasos o más de 520k líneas) provocaría overfitting en este tamaño de modelo.
- No se especifican los idiomas soportados; aunque Qwen3-0.6B base es multilingüe, el adaptador podría estar sesgado hacia inglés (dataset `code_search_net` y prompts en inglés).
- La fecha de creación (2026-08-31) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un experimento no verificado o con datos inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VoidWalkercero/Qwen3-0.6B-Particle-SousVide-R128-Perfect
- Perfil del autor: https://huggingface.co/VoidWalkercero
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Guía de Qwen3 (referencia general): https://insiderllm.com/guides/qwen3-complete-guide/
- Leaderboard de LLMs (referencia general): https://llm-stats.com/leaderboards/llm-leaderboard
