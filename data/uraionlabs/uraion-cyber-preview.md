# UraionLabs/Uraion-Cyber-Preview

## Resumen

Uraion Cyber Preview es un ajuste fino de tipo mixture-of-experts (MoE) de 35.951.822.704 parámetros totales construido sobre el checkpoint base Qwen3.5 35B MoE (35B-A3B, es decir, unos 3.000 millones de parámetros activos por token). Lo desarrolla Uraion Labs, un laboratorio de investigación que trabaja en orquestación de agentes, modelos eficientes, memoria persistente y verificación, y está orientado a tareas de seguridad, análisis de código y conversación. La versión publicada es una *preview build*, no un modelo cualificado para producción: el propio autor indica que no reclama ninguna capacidad nueva.

El cambio respecto al modelo base es acotado y verificable: un único adaptador LoRA (rango 16, alpha 32, 250 módulos) entrenado on-policy contra sus propios rollouts y posteriormente fusionado en BF16. No hay pretraining adicional, ni vocabulario nuevo, ni cambios de arquitectura, ni system prompt propio; el tokenizador, la plantilla de chat y el codificador visual son los del checkpoint base. El resultado se publica como 72 GB de pesos en 16 shards safetensors, con una versión GGUF Q4_K_M de 21,2 GB para llama.cpp.

La relevancia ahora mismo es doble. Por un lado, demuestra un flujo de trabajo de ajuste fino con evaluación pareada y multi-semilla sobre un MoE de 35B, con métricas publicadas por ítem. Por otro, su licencia MIT y su soporte de tool calling y modo de razonamiento lo hacen directamente desplegable en vLLM, SGLang o llama.cpp, aunque con la advertencia explícita de que las ganancias medidas se limitan al seguimiento de instrucciones (+2,6 puntos pareados) y el resto de capacidades se mantiene dentro del ruido estadístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 (35B-A3B) |
| Parametros activos | ~3B (denominacion A3B del checkpoint base) |
| Longitud de contexto | Hasta 262.144 tokens (configurado en `--max-model-len 262144` en el ejemplo de vLLM) |
| Tipos de cuantizacion | BF16 nativo; GGUF Q4_K_M (21,2 GB) publicado como artefacto separado |
| Idiomas soportados | No disponible (la evaluacion publicada es en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (16 shards, 72 GB); GGUF Q4_K_M en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos dispersa (MoE) de la familia Qwen3.5, con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite servir un modelo de esa escala con un coste computacional por token mucho menor que un denso equivalente. Conserva el codificador visual del checkpoint base, por lo que mantiene la capacidad image-text-to-text, y el tokenizador y la plantilla de chat son idénticos a los originales. Es un modelo de razonamiento: abre el turno del asistente con un bloque ` thinking`, de modo que en producción conviene activar un parser de razonamiento para separar la traza de la respuesta final.

El entrenamiento consiste en una sola ronda de preferencia on-policy: un adaptador LoRA de rango 16, alpha 32 y 250 módulos, entrenado contra los propios rollouts del modelo y después fusionado en BF16. No hubo continued pretraining, ni ampliación de vocabulario, ni modificación arquitectónica. La evaluación se realizó en BF16 nativo con vLLM 0.33.0, temperatura 1.0, top_p 0.95, top_k 20, 8.192 tokens de salida, 1.024 tokens de razonamiento y concurrencia 16, con 799 generaciones por conjunto de benchmarks y cero errores de petición. El autor advierte que se trata de una única semilla y que los resultados son descriptivos, no una posición en un leaderboard; la comparación relevante es la diferencia pareada contra el modelo base sin entrenar, que sitúa el seguimiento de instrucciones en +2,6 puntos (z de 2,9 y 3,2 sobre cuatro conjuntos de semillas) y el resto de capacidades dentro del ruido.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens).
- Razonamiento explícito mediante bloque ` thinking`, separable con un reasoning parser.
- Generación y revisión de código: HumanEval base 95,1% y HumanEval+ 89,6% en la evaluación del autor.
- Análisis de seguridad: detección de vulnerabilidades sobre pares vulnerable/parcheado (PrimeVul filtrado, 88,4%) y preguntas de inteligencia de amenazas (CTI MCQ, 72,3%).
- Tool calling / function calling, con parser `qwen3_xml` y `--enable-auto-tool-choice` en vLLM; BFCL 89,75%.
- Seguimiento de instrucciones verificables: IFEval estricto 78,93% en prompt y 85,73% en instruction.
- Capacidad multimodal image-text-to-text heredada del checkpoint base (codificador visual sin cambios).
- Capacidades multilingües: no disponibles como dato verificado; la evaluación publicada es solo en inglés.

## Casos de uso

- Revisión de seguridad en pipelines de CI/CD: el modelo puede analizar diffs y pares vulnerable/parcheado en busca de patrones de inyección, con la salvedad de que el 88,4% de PrimeVul no equivale a una tasa de detección en repositorios reales ni mide falsos positivos sobre código seguro.
- Asistente de triaje de inteligencia de amenazas: responder cuestionarios de CTI (72,3% en el subconjunto de 300 ítems) y resumir informes, aprovechando el modo de razonamiento para justificar la clasificación.
- Generación de código en producción: con HumanEval base al 95,1% y soporte de tool calling, encaja en pipelines que necesitan generar parches o tests y validarlos contra herramientas externas mediante function calling.
- Agente multi-paso con herramientas: BFCL del 89,75% y contexto de 262.144 tokens permiten mantener estado de conversación largo y encadenar llamadas a APIs dentro de una misma sesión.
- Análisis de documentos técnicos extensos con imágenes: al conservar el codificador visual del base, puede procesar diagramas, capturas o esquemas junto a texto largo en una sola ventana de contexto.
- Despliegue en hardware de gama alta para evaluación interna: el GGUF Q4_K_M de 21,2 GB permite probar el modelo en una única GPU de 24 GB o en CPU con llama.cpp antes de comprometer infraestructura BF16.
- Servicio de chat con instrucciones estrictas: el +2,6 puntos pareados en IFEval lo hace adecuado para asistentes que deben respetar formatos y restricciones de salida, siempre que se validen las respuestas en producción.

## Benchmarks y rendimiento

| Benchmark | Items | Score |
|---|---:|---:|
| PrimeVul filtered pairs | 335 | 296 (88,4%) |
| CTI MCQ subset | 300 | 217 (72,3%) |
| HumanEval base | 164 | 156 (95,1%) |
| HumanEval+ | 164 | 147 (89,6%) |
| IFEval prompt · strict | 541 | 427 (78,93%) |
| IFEval prompt · loose | 541 | 444 (82,07%) |
| IFEval instruction · strict | 834 | 715 (85,73%) |
| IFEval instruction · loose | 834 | 734 (88,01%) |
| BFCL | 400 | 359 (89,75%) |

Condiciones: BF16 nativo, vLLM 0.33.0, salt `public-final-0`, temperatura 1.0, top_p 0.95, top_k 20, 8.192 tokens de salida, 1.024 tokens de razonamiento, concurrencia 16, una sola semilla. HumanEval y HumanEval+ comparten las mismas 164 generaciones y los finales por longitud cuentan como fallo. En la comparación de cuatro modelos del autor, Qwen3.6 puntuó más alto en CTI y HumanEval+, el checkpoint base puntuó más alto en HumanEval base y este modelo obtuvo el mejor resultado en PrimeVul; el autor lo describe como un intercambio entre ejecuciones de una sola semilla, no como un ranking.

## Requisitos de hardware

- VRAM estimada en BF16: los 72 GB de pesos en 16 shards requieren al menos dos GPUs de 48 GB o una de 80 GB con margen para KV cache; el ejemplo oficial usa `--tensor-parallel-size 2` con `--gpu-memory-utilization 0.90`.
- VRAM estimada en Q4_K_M: 21,2 GB de pesos, apto para una GPU de 24 GB (RTX 4090, L4, A10G) con contexto moderado; el contexto de 262.144 tokens en cuantización requiere planificación adicional de KV cache.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 con paralelismo tensorial 2; A100 40 GB en TP2 si se reduce la longitud de contexto; RTX 4090 o similares solo con el GGUF.
- Cabe en GPU de consumo únicamente con la cuantización Q4_K_M; en BF16 no.
- Opciones de despliegue: vLLM ≥ 0.19.1 (recomendado, con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_xml`), SGLang ≥ 0.5.9, transformers ≥ 5.8.1 y llama.cpp para el GGUF.
- Latencia y throughput: no disponibles como cifra concreta; el autor solo documenta concurrencia 16 y 799 generaciones por conjunto de benchmarks sin errores, sin publicar tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uraion Cyber Preview | 35,95B totales, ~3B activos (MoE) | 262.144 | HumanEval 95,1%, HumanEval+ 89,6%, BFCL 89,75%, IFEval strict 78,93% | MIT | Hugging Face, BF16 + GGUF |
| Qwen3.5 35B MoE (base) | 35B totales, ~3B activos (MoE) | No disponible en la informacion | Mejor que este modelo en HumanEval base; peor en seguimiento de instrucciones | No disponible en la informacion | Hugging Face |
| Qwen3.6 | No disponible en la informacion | No disponible en la informacion | Mejor en CTI y HumanEval+ que este modelo en la comparacion del autor | No disponible en la informacion | No disponible en la informacion |

La comparación procede de la propia model card del autor y se basa en ejecuciones de una sola semilla, por lo que no constituye un ranking. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una preview build, no un modelo cualificado para producción; el autor lo declara explícitamente.
- La única mejora fuera del ruido es el seguimiento de instrucciones (+2,6 puntos pareados); tool calling, seguridad y código se mantienen sin cambios medibles.
- CTI es un subconjunto de 300 ítems y PrimeVul son 335 pares filtrados; ninguno es la suite completa de seguridad ni mide falsos positivos sobre código seguro. El 88,4% no debe leerse como "detecta el 88% de vulnerabilidades en repositorios reales".
- Evaluación en inglés, una sola semilla y un único ajuste de muestreo; sin Terminal-Bench ni ejecución de contexto completo.
- El GGUF es un artefacto separado con números ligeramente distintos; los resultados en BF16 no se trasladan al archivo cuantizado.
- Riesgo de alucinación inherente a un modelo generativo de 35B sin verificación externa; el modo de razonamiento no garantiza corrección factual.
- Licencia MIT, que permite uso comercial, pero sin garantías ni soporte del autor.
- Idiomas soportados no documentados: no hay evidencia publicada de calidad fuera del inglés.
- Requiere runtimes recientes (vLLM ≥ 0.19.1, transformers ≥ 5.8.1, SGLang ≥ 0.5.9) y `--trust-remote-code` en el ejemplo oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview
- Versión GGUF Q4_K_M: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF
- Checkpoint base Qwen3.5 35B MoE: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview/blob/main/LICENSE
- Perfil de Uraion Labs en Hugging Face: https://huggingface.co/UraionLabs/models
- Sitio web de Uraion Labs: https://www.uraionlabs.com/
