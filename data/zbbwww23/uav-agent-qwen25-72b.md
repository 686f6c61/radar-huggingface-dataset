# zbbwww23/uav-agent-qwen25-72b

## Resumen

UAV Agent Qwen2.5-72B es un adaptador LoRA (con entrenamiento QLoRA) sobre el modelo base Qwen/Qwen2.5-72B-Instruct, publicado por el usuario zbbwww23. No se trata de un modelo completo, sino de un ajuste fino orientado a una tarea muy concreta: el control de vuelo y la validación de un sistema multiagente de UAV (vehículos aéreos no tripulados). El repositorio contiene únicamente los pesos del adaptador (210.683.928 bytes), la configuración y los ficheros del tokenizador; los pesos del modelo base no se distribuyen y deben descargarse por separado.

El adaptador se seleccionó mediante validación online formal sobre un cohorte de 116 casos, comparando tres candidatos LoRA de la misma familia. El checkpoint elegido es Qwen2.5-72B/checkpoint-5500 y reporta una tasa de éxito estricta en bucle cerrado de 0,9483, una precisión detallada de agente de 0,9735, una puntuación compuesta de 0,9660, un F1 macro de diagnóstico de 0,9477 y una precisión de soporte de explicación de 0,8276.

Su relevancia es acotada pero específica: demuestra un flujo de trabajo de ajuste fino con validación online para tareas de function calling y razonamiento multiagente en un dominio de ingeniería (control de vuelo de UAV), con métricas publicadas y verificación de pesos mediante SHA-256. No está pensado como modelo de propósito general ni como sustituto del base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen2.5-72B-Instruct |
| Parámetros totales | no disponible (adaptador de 210.683.928 bytes; el modelo base tiene 72B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantización | no disponible (el entrenamiento se realizó con QLoRA; no se detallan cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican la licencia y restricciones del modelo base Qwen2.5-72B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-72B-Instruct, un transformer decoder-only de 72.000 millones de parámetros. El ajuste se realiza con QLoRA, es decir, cuantización del base durante el entrenamiento y adaptadores de bajo rango entrenables, lo que reduce el coste de memoria frente a un fine-tuning completo. El repositorio incluye los pesos del adaptador, su configuración y el tokenizador, pero no los pesos del modelo base.

El entrenamiento se orienta a un proyecto de pruebas de control de vuelo multiagente de UAV, con datos descritos en el dataset público uav-agent-sft-public (particiones de train, validation y test) y un benchmark separado, Mixed120, con tareas de evaluación de estilo online. El checkpoint seleccionado (checkpoint-5500) se eligió entre tres candidatos LoRA de la misma familia sobre el mismo cohorte de validación online de 116 casos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en el dominio de agentes UAV y control de vuelo.
- Function calling / tool calling, etiquetado explícitamente en el repositorio.
- Razonamiento multiagente y multi-step dentro del flujo de validación en bucle cerrado.
- Diagnóstico de fallos y generación de explicaciones asociadas (métrica de soporte de explicación reportada).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Validación de agentes de control de vuelo: el adaptador puede integrarse en un pipeline de pruebas que simula escenarios de UAV y evalúa si el agente emite las acciones correctas en bucle cerrado, aprovechando la tasa de éxito estricta reportada (0,9483 sobre 116 casos).
- Diagnóstico automatizado de fallos en misiones: la métrica de F1 macro de diagnóstico (0,9477) sugiere uso en la clasificación y explicación de causas de fallo durante pruebas de vuelo.
- Generación de explicaciones para auditoría: con una precisión de soporte de explicación de 0,8276, el adaptador puede producir justificaciones de las decisiones del agente para revisión humana.
- Function calling en sistemas de comandos: el etiquetado function-calling indica que puede invocar herramientas o APIs de control (por ejemplo, consignas de rumbo, altitud o velocidad) dentro de un orquestador.
- Evaluación comparativa de candidatos LoRA: sirve como referencia para equipos que entrenan variantes sobre Qwen2.5-72B-Instruct y necesitan un punto de comparación con métricas publicadas y verificación SHA-256.
- Prototipado de agentes multi-step en robótica aérea: útil para experimentar con razonamiento encadenado y coordinación de subtareas antes de desplegar en hardware real.

## Benchmarks y rendimiento

Resultados de validación online reportados por el autor sobre 116 casos:

| Métrica | Valor |
|---|---:|
| Tasa de éxito estricta en bucle cerrado | 0,9483 |
| Precisión detallada de agente | 0,9735 |
| Puntuación compuesta detallada | 0,9660 |
| F1 macro de diagnóstico | 0,9477 |
| Precisión de soporte de explicación | 0,8276 |
| Casos evaluados | 116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,2 GB; el coste real de inferencia lo determina el modelo base Qwen2.5-72B-Instruct.
- VRAM estimada para el base en precisión completa (BF16/FP16): en torno a 144 GB solo para pesos, más overhead de activaciones y KV cache; requiere múltiples GPU.
- VRAM estimada con cuantización de 8 bits: aproximadamente 72 GB, viable en una GPU de 80 GB (A100/H100) con margen limitado.
- VRAM estimada con cuantización de 4 bits: aproximadamente 36-40 GB, viable en una RTX 6000 Ada (48 GB) o A100 40 GB; ajustada en RTX 4090 (24 GB) sin offloading.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantización), RTX 6000 Ada. En consumer, RTX 4090 solo con cuantización agresiva y offloading parcial.
- Opciones de despliegue: transformers + peft (carga indicada en la model card), vLLM con soporte de adaptadores LoRA, TGI. No se confirma compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UAV Agent Qwen2.5-72B (este) | Adaptador sobre 72B | no disponible | Agentes UAV, function calling | other (base Qwen2.5) | Hugging Face, solo adaptador |
| Qwen/Qwen2.5-72B-Instruct | 72B | no disponible en esta ficha | Propósito general, instruct | Qwen license | Hugging Face, pesos completos |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen2.5-72B-Instruct por separado, con su coste de hardware asociado.
- Ámbito muy restringido: entrenado para control de vuelo y validación de agentes UAV; su rendimiento fuera de ese dominio no está caracterizado.
- La validación se realizó sobre solo 116 casos, lo que limita la significación estadística de las métricas reportadas.
- La licencia "other" remite a la del modelo base Qwen2.5-72B-Instruct; es imprescindible revisar sus restricciones antes de cualquier uso comercial.
- Riesgo de alucinación inherente al modelo base de 72B, no mitigado específicamente en la información disponible.
- No se documentan sesgos conocidos, cobertura idiomática ni limitaciones de contexto en la información proporcionada.
- La precisión de soporte de explicación (0,8276) es notablemente inferior al resto de métricas; las explicaciones generadas deben revisarse antes de usarse en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni validación independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zbbwww23/uav-agent-qwen25-72b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Dataset de entrenamiento público: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Benchmark Mixed120: https://huggingface.co/datasets/zbbwww23/uav-agent-mixed120-benchmark
- Registro de evaluación online: online-validation.json (incluido en el repositorio del adaptador)
