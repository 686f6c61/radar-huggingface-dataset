# zbbwww23/uav-agent-qwen3-32b-cp4500

## Resumen

El modelo `zbbwww23/uav-agent-qwen3-32b-cp4500` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen3-32B, publicado por el usuario zbbwww23 en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (134.336.800 bytes) junto con su configuración y tokenizer, pensado para ser cargado sobre Qwen/Qwen3-32B mediante la librería PEFT. Su propósito declarado es el ajuste fino supervisado (SFT) para un proyecto de validación de control de vuelo multiagente de UAV (drones).

El adaptador ha sido seleccionado entre tres candidatos LoRA de la misma familia mediante un proceso de validación online sobre un conjunto de 116 casos, obteniendo una tasa de éxito de bucle cerrado estricto de 0,9483 y una precisión de agente detallada de 0,9955. Es relevante ahora como ejemplo de especialización de un modelo de 32B en tareas de function calling y razonamiento agéntico dentro de un dominio vertical concreto (control de vuelo de UAV), con métricas de validación publicadas y verificación de integridad de pesos mediante SHA-256.

La información pública es escasa: no se detallan idiomas soportados, composición exacta del dataset ni resultados de benchmarks estándar. El repositorio ocupa 0,1 GB e incluye únicamente los pesos del adaptador, no los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-32B) |
| Parametros totales | no disponible (adaptador de 134.336.800 bytes; base Qwen3-32B de 32B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-32B) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones del base no especificadas |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican las restricciones del modelo base Qwen3-32B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (LoRA con cuantización del modelo base) sobre Qwen3-32B, un transformer decoder-only de 32.000 millones de parámetros. El repositorio contiene exclusivamente los pesos del adaptador, su configuración y los ficheros del tokenizer; los pesos del modelo base no se incluyen y deben descargarse por separado desde Qwen/Qwen3-32B.

El ajuste se realizó mediante SFT (supervisión fina) orientado a function calling y razonamiento agéntico en el dominio de control de vuelo de UAV multiagente. El checkpoint seleccionado es `checkpoint-4500`, elegido entre tres candidatos LoRA de la misma familia sobre la misma cohorte de validación online de 116 casos. El dataset de entrenamiento se documenta en el repositorio público `zbbwww23/uav-agent-sft-public`, que incluye manifiesto, estadísticas de fuentes y comprobaciones de aislamiento de splits; los JSONL crudos de fuentes mixtas, las respuestas privadas y las trazas de referencia no se publican.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredados del modelo base Qwen3-32B.
- Function calling y tool calling especializado en el dominio de control de vuelo de UAV (según los tags `function-calling` y `agent`).
- Razonamiento agéntico multi-paso dentro de un bucle cerrado de validación (tasa de éxito estricta de 0,9483 sobre 116 casos).
- Diagnóstico de fallos con macro F1 de 0,9477 y precisión de soporte de explicaciones de 1,0000.
- Precisión de agente detallada de 0,9955 y puntuación compuesta detallada de 0,9814.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Control de vuelo de UAV multiagente: el adaptador está entrenado específicamente para emitir llamadas a funciones de control en un bucle cerrado, con una tasa de éxito estricta de 0,9483, lo que lo hace adecuado para pilotaje automatizado de drones en entornos de simulación y validación.
- Diagnóstico de fallos en sistemas aéreos no tripulados: con un macro F1 de 0,9477 en diagnóstico, puede clasificar y explicar causas de fallo en telemetría y trazas de vuelo.
- Agente de function calling en pipelines de operaciones: integrable en orquestadores de agentes que requieran invocar herramientas externas de forma fiable, gracias a la precisión detallada de agente de 0,9955.
- Validación online de políticas de control: el adaptador se seleccionó precisamente por su rendimiento en validación online, por lo que puede reutilizarse como evaluador o generador de referencia en cohortes de prueba.
- Asistente de operaciones para planificación de misiones: el modelo base Qwen3-32B aporta contexto largo y razonamiento; el adaptador lo especializa en terminología y flujos de UAV.
- Investigación en ajuste fino con QLoRA: sirve como caso de estudio reproducible de especialización de un 32B en un dominio vertical con métricas de validación publicadas y verificación SHA-256 de pesos.
- Generación de explicaciones justificadas: con precisión de soporte de explicaciones de 1,0000, puede emplearse para producir justificaciones de decisiones de control auditables.

## Benchmarks y rendimiento

Resultados de validación online publicados por el autor (116 casos):

| Metrica | Valor |
|---|---:|
| Tasa de exito estricta en bucle cerrado | 0,9483 |
| Precision detallada de agente | 0,9955 |
| Puntuacion compuesta detallada | 0,9814 |
| Macro F1 de diagnostico | 0,9477 |
| Precision de soporte de explicaciones | 1,0000 |
| Casos evaluados | 116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 134.336.800 bytes (aproximadamente 0,13 GB) y requiere cargar el modelo base Qwen3-32B completo para inferencia.
- VRAM estimada para el base en BF16/FP16: en torno a 64 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 32-35 GB; en 4 bits: aproximadamente 18-20 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU con `device_map="auto"`.
- En consumer GPU: posible en RTX 4090 (24 GB) únicamente con cuantización de 4 bits y contexto moderado; no cabe en BF16.
- Opciones de despliegue: transformers + PEFT (carga indicada por el autor), vLLM con soporte LoRA, TGI y llama.cpp/Ollama fusionando el adaptador en el base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| uav-agent-qwen3-32b-cp4500 (este) | Adaptador sobre 32B | no disponible | other | safetensors (LoRA) | Especializado en UAV; validación online de 116 casos |
| Qwen/Qwen3-32B (base) | 32B | no disponible | no disponible | safetensors | Modelo generalista sin especialización UAV |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros adaptadores o modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y se aplican las restricciones del modelo base Qwen3-32B; es imprescindible revisar la licencia del base antes de cualquier uso comercial.
- El adaptador está especializado en un dominio muy concreto (control de vuelo de UAV multiagente); su rendimiento fuera de ese dominio no está validado.
- La validación se realizó sobre solo 116 casos, lo que limita la robustez estadística de las métricas publicadas.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No hay datos sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- El repositorio no incluye los pesos del modelo base; es necesario descargarlos por separado.
- Los JSONL crudos, respuestas privadas y trazas de referencia no están publicados, lo que dificulta la reproducibilidad completa del entrenamiento.
- Uso en sistemas aéreos reales requiere validación adicional de seguridad y cumplimiento normativo; las métricas provienen de un entorno de validación online, no de vuelo real.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zbbwww23/uav-agent-qwen3-32b-cp4500
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Dataset público: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Registro de validación online: online-validation.json (incluido en el repositorio)
