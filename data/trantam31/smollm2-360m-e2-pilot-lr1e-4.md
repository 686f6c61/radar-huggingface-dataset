# trantam31/smollm2-360m-e2-pilot-lr1e-4

## Resumen

Smollm2-360m-e2-pilot-lr1e-4 es un ajuste fino (fine-tune) del modelo SmolLM2-360M de HuggingFace, publicado por el usuario trantam31 en HuggingFace. El modelo base, SmolLM2-360M, es un modelo de lenguaje compacto de la familia SmolLM2, con una arquitectura transformer tipo LLaMA y unos 362 millones de parámetros, diseñado para tareas de generación de texto en entornos con recursos limitados.

El propósito de este ajuste fino no está documentado en la model card: el autor no especifica el dataset de entrenamiento, los usos previstos ni las limitaciones, por lo que se trata de un modelo experimental cuyo nombre sugiere un experimento piloto con tasa de aprendizaje 1e-4 durante dos épocas. La relevancia práctica es limitada para producción, pero puede ser de interés como ejemplo de ajuste fino reproducible sobre un modelo pequeño y como punto de partida para experimentos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (arquitectura Llama, heredada del modelo base) |
| Parámetros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la del modelo base SmolLM2-360M es de 8.192 tokens, según la documentación de este) |
| Tipos de cuantización | no disponible (pesos publicados en precisión original; compatible con cuantización vía GGUF/llama.cpp al ser formato LLaMA) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decodificador de su base, SmolLM2-360M, que utiliza la arquitectura Llama (atención con RoPE, activación SwiGLU y normalización RMSNorm). No se trata de un modelo MoE ni híbrido: todos los parámetros están activos en cada pasada.

El ajuste fino se realizó con la clase Trainer de HuggingFace Transformers. Los hiperparámetros publicados son: tasa de aprendizaje de 0,0001 con planificador coseno y 0,03 de pasos de calentamiento, tamaño de lote total de 32 (lote por dispositivo de 8 con 4 pasos de acumulación de gradiente), semilla 0, 125 pasos de entrenamiento, optimizador AdamW (variante fused de PyTorch con betas 0,9/0,999 y epsilon 1e-08) y entrenamiento en precisión mixta nativa (AMP). El nombre del modelo sugiere dos épocas de entrenamiento, aunque este dato no está confirmado en la model card. No se ha documentado ni el dataset empleado ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en general, heredada del modelo base SmolLM2-360M.
- Capacidades de razonamiento, código y matemáticas a nivel del modelo base, presumiblemente modificadas por el ajuste fino, aunque sin datos de evaluación no es posible cuantificar el cambio.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües no documentadas; el modelo base SmolLM2 está orientado principalmente al inglés.

## Casos de uso

- Experimentación con ajuste fino: al ser un modelo pequeño (362M de parámetros), permite reproducir y comparar experimentos de fine-tuning en hardware de consumo, por ejemplo para estudiar el efecto de la tasa de aprendizaje de 1e-4 en 125 pasos.
- Prototipado de asistentes ligeros: puede integrarse en aplicaciones locales de generación de texto simple (autocompletado, redacción breve) donde la latencia y el consumo importan más que la calidad máxima.
- Generación de texto en dispositivos de borde: su tamaño reducido lo hace candidato para despliegue en portátiles o SBC (Raspberry Pi 5, Jetson) mediante llama.cpp u Ollama.
- Pruebas de pipelines de inferencia: útil como modelo de carga ligera para validar infraestructuras de despliegue (vLLM, TGI, endpoints de HuggingFace) antes de usar modelos mayores.
- Investigación sobre destilación o poda: puede servir como modelo base o comparativo en estudios de compresión de modelos pequeños.
- Enseñanza y formación: caso práctico realista para cursos sobre fine-tuning con Transformers y Trainer, dado que la model card incluye todos los hiperparámetros de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card contiene una lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 0,8 GB solo de pesos (361,8M × 2 bytes), más la sobrecarga de contexto y runtime; en la práctica, 1–2 GB de VRAM son suficientes. Con cuantización a 4 bits, cabe en menos de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU moderna; no se requiere aceleración dedicada. Modelos como RTX 3060, RTX 4060 o superiores ejecutan el modelo sin problemas; también es viable en CPU.
- Cabe con holgura en GPUs de consumo, e incluso es ejecutable íntegramente en CPU o en portátiles sin GPU dedicada.
- Opciones de despliegue: Transformers (librería nativa), llama.cpp (con conversión a GGUF), Ollama, vLLM y TGI; los tags del repositorio indican compatibilidad con text-generation-inference y endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles; por su tamaño, se espera latencia baja y throughput alto en comparación con modelos de 7B o superiores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Smollm2-360m-e2-pilot-lr1e-4 (este) | 361,8M | no disponible | Apache 2.0 | Fine-tune experimental sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-360M (base) | 361,8M | 8.192 tokens | Apache 2.0 | Entrenado por HuggingFace con ~11 billones de tokens; benchmarks publicados (HellaSwag, ARC, PIQA, etc.) |
| HuggingFaceTB/SmolLM2-135M | 135M | 8.192 tokens | Apache 2.0 | Versión más pequeña de la familia, menor calidad a cambio de mayor velocidad |
| HuggingFaceTB/SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Versión mayor de la familia, notablemente superior en razonamiento y código |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los usos previstos ni las limitaciones, por lo que el comportamiento del modelo es en gran medida desconocido y no recomendable para producción sin evaluación previa.
- Riesgo de alucinación elevado, inherente a modelos de este tamaño y agravado por la falta de documentación sobre el ajuste fino.
- Sesgos: no evaluados; hereda los sesgos del corpus de preentrenamiento de SmolLM2, orientado principalmente a inglés.
- Idiomas: capacidades multilingües no documentadas; el rendimiento fuera del inglés es probablemente pobre.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos del modelo base.
- El nombre sugiere un experimento piloto (posiblemente de barrido de hiperparámetros); puede tratarse de un checkpoint intermedio y no de un modelo final.
- Solo 125 pasos de entrenamiento: el ajuste fino puede ser marginal o incluso degradar el modelo base en algunas tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trantam31/smollm2-360m-e2-pilot-lr1e-4
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Colección SmolLM2 (blog de HuggingFace): https://huggingface.co/blog/smollm2
- Repositorio de la familia SmolLM2: https://github.com/huggingface/smollm
