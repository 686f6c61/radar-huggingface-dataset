# Vaib202/SecurMoE-Latent-8B

## Resumen

SecurMoE-Latent-8B (`v0.1.0-preview`) es un prototipo de investigación publicado por el usuario Vaib202 en Hugging Face que explora la denominada *steering* latente continua condicionada por acción dentro del flujo residual de un modelo de lenguaje causal de 8 mil millones de parámetros. El modelo base es `Qwen/Qwen3-8B`, sobre el que se aplica un adaptador LoRA de PEFT y un pequeño módulo de transición latente (`LatentTransitionModule`) de 4.265.217 parámetros que inyecta un vector de perturbación en la capa 18 del transformer. La hipótesis central es que un prompt neutro ("blind prompt") puede ser dirigido hacia distintas trayectorias aritméticas contrafactuales únicamente mediante la inyección de dicho vector, sin instrucciones textuales explícitas.

A pesar del nombre "MoE", el sistema no emplea un enrutamiento disperso de mezcla de expertos: opera mediante suma de vectores de activación continua en el residual stream. El modelo se distribuye como adaptador PEFT (no como pesos completos), con el base Qwen3-8B congelado y cuantizado en NF4. El repositorio ocupa 0,2 GB, lo que confirma que solo se publican los pesos del adaptador y del módulo de steering.

La relevancia del proyecto es fundamentalmente científica: se trata de una sonda de interpretabilidad mecanicista orientada a estudiar si la intervención en representaciones internas puede sustituir al condicionamiento textual en la generación autorregresiva. El autor declara explícitamente que no debe desplegarse en producción ni en flujos críticos de seguridad, y que no reclama superioridad general sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen3-8B) + adaptador LoRA + módulo de steering latente (`LatentTransitionModule`) |
| Parámetros totales | 8B (base, congelado) + 4.265.217 (módulo latente) + LoRA r=16 sobre 7 proyecciones × 36 capas |
| Parámetros activos | No aplica (no es un MoE disperso real; el nombre es histórico) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B, no especificada en la model card) |
| Tipos de cuantización | Base en 4-bit NormalFloat (NF4) con doble cuantización y cómputo en FP16; adaptador y módulo latente en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); base referenciado como `Qwen/Qwen3-8B` en revisión `b968826d9c46dd6066d109eabc6255188de91218` |

## Arquitectura y entrenamiento

El sistema acopla tres componentes. Primero, el modelo base `Qwen/Qwen3-8B`, un transformer decoder causal con dimensión de modelo de 4096 y 36 bloques, congelado y cuantizado en NF4 mediante `bitsandbytes` (doble cuantización, cómputo FP16). Segundo, un adaptador LoRA con rango 16, alpha 32 (escala 2,0), dropout 0,05, aplicado a las siete proyecciones lineales de las 36 capas (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), también congelado durante la inferencia de steering. Tercero, el `LatentTransitionModule`, que contiene un embedding discreto de acción de 4×64 (256 parámetros), un MLP de proyección 64→1024 (GELU) y 1024→4096 (66.560 y 4.198.400 parámetros respectivamente) y un escalar `alpha` aprendible inicializado a 0,1000 y calibrado empíricamente a 0,1059.

El mecanismo de intervención funciona así: dado un prompt neutro idéntico para todas las acciones, se calcula la representación `h_18` en la capa 18; el vector de acción `a ∈ {0,1,2,3}` se proyecta mediante el MLP y se suma escalado por `alpha` al residual stream en un pre-hook de la capa 18; la generación autorregresiva continúa desde la capa 19 en adelante. El dominio de entrenamiento es un operador aritmético sintético de cuatro acciones, por lo que el alcance científico es deliberadamente acotado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva sobre el modelo base Qwen3-8B (capacidades generales heredadas del base, aunque el adaptador está especializado en el dominio sintético).
- Steering latente condicionado por acción: inyección de un vector continuo en la capa 18 para dirigir la generación hacia una de cuatro trayectorias aritméticas contrafactuales sin instrucción textual.
- Razonamiento aritmético de un paso sobre un dominio sintético de cuatro acciones (por ejemplo, transiciones de estado numérico).
- Interpretabilidad mecanicista: permite estudiar cómo una perturbación en el residual stream afecta a la ramificación generativa.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo sirve como banco de pruebas para estudiar si la intervención en la capa 18 del residual stream puede sustituir al condicionamiento textual, comparando la distribución de salida con y sin el vector de acción.
- Estudio de *activation steering* y control de comportamiento: permite reproducir experimentos de adición de vectores de activación en un modelo de 8B con un módulo entrenado de solo 0,05 % de los parámetros, útil para validar metodologías antes de escalar a modelos mayores.
- Análisis de ramificación contrafactual: dado un estado numérico ("64") y cuatro transiciones posibles, el sistema permite comparar trayectorias generadas bajo el mismo prompt, aislando el efecto del vector latente frente al sesgo del prompt.
- Docencia y formación en PEFT: el repositorio ilustra un caso completo de adaptador LoRA congelado más un módulo de intervención de activaciones, útil para cursos sobre modificación de representaciones internas.
- Reproducción científica y revisión por pares: el autor publica el prototipo para revisión colaborativa, por lo que encaja en flujos de replicación de experimentos de steering latente.
- Prototipado de control de generación sin prompt engineering: en entornos de laboratorio, permite explorar interfaces donde la intención se codifica como vector en lugar de como texto, aunque sin garantías de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador y el módulo latente suman 0,2 GB, por lo que el coste real lo determina el modelo base Qwen3-8B.
- VRAM estimada para el base en 4-bit NF4: aproximadamente 5-6 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB o H100 para experimentación con contexto largo y FP16; RTX 4090 (24 GB) suficiente para el base en 4-bit con margen.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización agresiva y contextos cortos.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base con `transformers` + `peft` + `bitsandbytes`; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecurMoE-Latent-8B | 8B base + 4,27M módulo | No disponible | Steering latente en residual stream (capa 18) | Apache 2.0 | Adaptador PEFT en HF |
| Qwen/Qwen3-8B (base) | 8B | No disponible en esta ficha | Transformer decoder causal estándar | Apache 2.0 | Pesos completos en HF |
| Adaptadores LoRA convencionales sobre Qwen3-8B | 8B + LoRA | No disponible | Ajuste fino supervisado vía LoRA | Según autor | Variable en HF |

La comparación directa con otros sistemas de steering latente no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: el autor declara explícitamente que no debe usarse en producción ni en flujos críticos de seguridad.
- No es un MoE disperso real: el nombre "SecurMoE" es histórico y no implica enrutamiento entre expertos FFN.
- Dominio acotado: evaluado únicamente en un operador aritmético sintético de cuatro acciones; no hay evidencia de generalización a otras tareas.
- No reclama superioridad sobre Qwen3-8B en aritmética o razonamiento general; el base resuelve aritmética estándar con prompts explícitos.
- Idiomas: solo inglés según la model card.
- Riesgo de alucinación: inherente al modelo base; el steering latente no lo mitiga y podría amplificar respuestas plausibles pero incorrectas en el dominio sintético.
- Sesgos: no documentados en la información disponible; heredables del base Qwen3-8B.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el estado de investigación y la ausencia de benchmarks desaconsejan cualquier despliegue productivo.
- Dependencia de revisión fija del base (`b968826d...`): cambios en el repositorio de Qwen3-8B podrían romper la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vaib202/SecurMoE-Latent-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Librería PEFT: https://github.com/huggingface/peft
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
