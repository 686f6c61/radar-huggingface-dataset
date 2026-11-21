# UraionLabs/Uraion-Cyber-Preview

## Resumen

Uraion Cyber Preview es un ajuste fino (fine-tune) del modelo Qwen3.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE) desarrollado por Uraion Labs. El modelo parte del checkpoint base de Qwen y aplica una única ronda de entrenamiento de preferencias on-policy mediante un adaptador LoRA (rango 16, alpha 32, 250 módulos) que posteriormente se fusiona en los pesos en BF16. El resultado se publica como 72 GB de pesos repartidos en 16 shards, con un total de 35.951.822.704 parámetros.

El objetivo declarado es mejorar el seguimiento de instrucciones en tareas de ciberseguridad, análisis de código y uso de herramientas, sin alterar las capacidades del modelo base. La model card es explícita al respecto: se trata de una compilación de vista previa, no de un modelo cualificado para producción, y el único resultado que se sale del ruido estadístico es la mejora en seguimiento de instrucciones (+2,6 puntos). El resto de métricas (tool calling, coding, MCQ de seguridad) se mantienen dentro del margen de error respecto al checkpoint sin entrenar.

El interés del modelo reside en su especialización declarada en seguridad y en su licencia MIT, que permite uso comercial sin restricciones. No obstante, la ausencia de benchmarks multi-semilla, de evaluación en contexto largo y de datos sobre falsos positivos en código seguro limita seriamente las conclusiones que pueden extraerse de sus cifras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parámetros totales | 35.951.822.704 (35,95 B) |
| Parámetros activos | no disponible (el nombre del base sugiere 3B-A3B, sin confirmación numérica en la información) |
| Longitud de contexto | 262.144 tokens (según el flag `--max-model-len` del quickstart) |
| Tipos de cuantización | BF16 nativo; GGUF Q4_K_M (21,2 GB) en repo separado |
| Idiomas soportados | inglés (único idioma declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (16 shards, 72 GB); GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del checkpoint base Qwen3.5-35B-A3B: un transformer de mezcla de expertos con encoder de visión incluido (pipeline `image-text-to-text`). No hay cambios de arquitectura, de vocabulario ni de plantilla de chat; el tokenizador, la plantilla y el encoder visual son los del checkpoint original. El modelo es de razonamiento: abre el turno del asistente con un bloque ` thinking`, por lo que requiere un parser de razonamiento si se quiere separar la traza.

El entrenamiento consistió en una sola ronda de preference training on-policy contra sus propias generaciones (rollouts), materializada en un adaptador LoRA de rango 16, alpha 32 y 250 módulos, que después se fusionó en BF16. No hubo continued pretraining, ni nuevo vocabulario, ni system prompt adicional. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni el algoritmo exacto (DPO, ORPO u otro); esos datos figuran como no disponibles.

## Capacidades

- Generación de texto y razonamiento con traza explícita (`thinking mode`).
- Generación y análisis de código, con resultados declarados de 95,1% en HumanEval base y 89,6% en HumanEval+.
- Tool calling y function calling, con parser `qwen3_xml` y soporte de `--enable-auto-tool-choice` en vLLM; 89,75% en BFCL.
- Razonamiento multi-paso y uso como agente (episodios multi-step evaluados en el modelo V1.0, no en este preview).
- Procesamiento de imagen y texto (entrada image-text-to-text heredada del base).
- Capacidades de ciberseguridad: detección de pares vulnerable/parcheado (88,4% en PrimeVul filtrado) y preguntas de opción múltiple sobre threat intelligence (72,3% en el subconjunto CTI).
- Seguimiento de instrucciones: 78,93% estricto y 82,07% laxo en IFEval prompt; 85,73% estricto y 88,01% laxo en IFEval instruction.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Revisión de parches en pipelines de CI/CD: el modelo puede comparar pares de código vulnerable y parcheado y señalar la naturaleza del fallo, aprovechando su resultado en PrimeVul. Adecuado como primera pasada de triaje, no como sustituto de un análisis estático.
- Asistente de threat intelligence: responder preguntas de opción múltiple y resumir informes CTI en inglés, con la ventana de 262.144 tokens para ingerir documentos largos completos.
- Agente de respuesta a incidentes: encadenar llamadas a herramientas (consultas a SIEM, APIs de enriquecimiento de IoC) mediante tool calling con parser `qwen3_xml`, integrado en un orquestador tipo OpenAI-compatible.
- Generación de código en producción: escribir tests, utilidades y scripts de automatización con una tasa declarada del 95,1% en HumanEval, desplegado con vLLM y tensor parallelism 2.
- Análisis de capturas y diagramas de red: al conservar el encoder visual del base, puede recibir imágenes junto con texto para tareas de documentación técnica o interpretación de topologías.
- Despliegue en hardware de gama consumer: la versión GGUF Q4_K_M de 21,2 GB permite ejecución local con llama.cpp u Ollama en GPUs con 24 GB de VRAM, útil para auditorías offline en entornos aislados.
- Evaluación comparativa interna: servir como baseline especializado en seguridad frente al Qwen3.5-35B-A3B sin entrenar en pruebas A/B pareadas.

## Benchmarks y rendimiento

Resultados declarados en BF16 nativo, vLLM 0.33.0, temperatura 1,0, top_p 0,95, top_k 20, 8.192 tokens de salida, 1.024 tokens de razonamiento, concurrencia 16, semilla única.

| Benchmark | Ítems | Puntuación |
|---|---:|---:|
| PrimeVul (pares filtrados) | 335 | 296 (88,4%) |
| CTI MCQ (subconjunto) | 300 | 217 (72,3%) |
| HumanEval base | 164 | 156 (95,1%) |
| HumanEval+ | 164 | 147 (89,6%) |
| IFEval prompt · strict | 541 | 427 (78,93%) |
| IFEval prompt · loose | 541 | 444 (82,07%) |
| IFEval instruction · strict | 834 | 715 (85,73%) |
| IFEval instruction · loose | 834 | 734 (88,01%) |
| BFCL | 400 | 359 (89,75%) |

Deltas pareados frente al checkpoint base sin entrenar: +2,6 puntos en seguimiento de instrucciones (z 2,9 y 3,2 sobre cuatro conjuntos de semillas); tool calling, MCQ de seguridad y coding dentro del ruido. En la comparación de cuatro modelos, Qwen3.6 superó a este modelo en CTI y HumanEval+, el checkpoint base superó en HumanEval base, y este modelo obtuvo el mejor resultado en PrimeVul. Los autores advierten que es una única semilla y no una posición de leaderboard. Los resultados del GGUF difieren de los de BF16 y no son transferibles.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 72 GB de pesos más caché KV; el quickstart usa `--tensor-parallel-size 2` con `--gpu-memory-utilization 0.90`, lo que implica al menos 2 GPUs de 48 GB o 2 de 80 GB.
- GPUs recomendadas para BF16: 2× A100 80 GB, 2× H100 80 GB o 2× L40S 48 GB con tensor parallelism.
- Cuantización Q4_K_M (21,2 GB): cabe en una única RTX 4090 (24 GB) o RTX 3090, con margen limitado para contexto largo.
- Despliegue: vLLM ≥ 0.19.1, transformers ≥ 5.8.1, SGLang ≥ 0.5.9; llama.cpp u Ollama para el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Uraion Cyber Preview | 35,95 B (MoE) | 262.144 | MIT | Fine-tune de Qwen3.5-35B-A3B, inglés, especializado en seguridad |
| Qwen3.5-35B-A3B (base) | 35,95 B (MoE) | no disponible | no disponible | Checkpoint original; supera al fine-tune en HumanEval base |
| Qwen3.6 | no disponible | no disponible | no disponible | Supera a este modelo en CTI y HumanEval+ según la comparación de los autores |
| Uraion Cyber V1.0 | no disponible | no disponible | no disponible | Versión posterior del mismo autor; 90,2% en tareas de seguridad retenidas (1033/1145) |

## Limitaciones y advertencias

- Compilación de vista previa: los propios autores la describen como no cualificada para producción.
- El único resultado fuera del ruido estadístico es el seguimiento de instrucciones (+2,6 puntos); el resto de métricas equivale a "sin cambios".
- Evaluación con una sola semilla y una única configuración de muestreo; sin ejecuciones multi-semilla ni de contexto completo.
- El resultado de PrimeVul (88,4%) mide pares vulnerable/parcheado filtrados, no la detección de vulnerabilidades en repositorios reales, y no evalúa falsos positivos sobre código seguro.
- Solo inglés declarado; sin datos sobre rendimiento en castellano u otros idiomas.
- Riesgo de alucinación no cuantificado; al ser un modelo de razonamiento con traza `thinking`, puede generar justificaciones plausibles pero incorrectas en análisis de seguridad.
- Sesgos: no documentados en la model card.
- Los resultados de BF16 no se transfieren al GGUF Q4_K_M, que constituye un artefacto separado con cifras propias.
- Licencia MIT: permite uso comercial sin restricciones, pero no exime de validar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview
- GGUF Q4_K_M: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF
- Versión V1.0: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview/blob/main/LICENSE
- Sitio del autor: https://uraionlabs.com/
