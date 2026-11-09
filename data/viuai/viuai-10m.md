# ViuAI/ViuAI-10M

## Resumen

ViuAI-10M es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ViuAI y publicado bajo licencia Apache 2.0. Se trata de un modelo construido desde cero ("from-scratch") con aproximadamente 8,96 millones de parámetros totales y unos 4,25 millones de parámetros activos por token, lo que supone una esparsidad computacional del 52,6%. Su rasgo más distintivo es la combinación de 32 bloques Transformer con mecanismos de atención Multi-Head Latent Attention (MLA) de estilo DeepSeek-V4 y un MoE de grano fino inspirado en Kimi.

El modelo incorpora innovaciones técnicas poco habituales en esta escala: compresión conjunta de Query y KV mediante bajo rango (con reducción de la caché KV del 80-90%), conexiones residuales aprendibles denominadas Manifold-Constrained Hyper-Connections (mHC) y el optimizador Muon con ortogonalización de Newton-Schulz de quinto orden. Estas decisiones apuntan a un objetivo de investigación: explorar arquitecturas profundas y eficientes en parámetros más que a un uso comercial inmediato.

Su relevancia actual es fundamentalmente experimental. Con una ventana de contexto de 512 tokens, un vocabulario de 4.096 entradas y un tamaño de 10 millones de parámetros, ViuAI-10M no compite con modelos de producción, sino que sirve como banco de pruebas reproducible para investigar MoE, MLA y optimizadores de matriz en modelos pequeños. La model card no declara resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 32 capas con MLA (DeepSeek-V4) y mHC |
| Parametros totales | 8.964.736 (~8,96 M) |
| Parametros activos | 4.246.144 (~4,25 M) por token (1 experto compartido + 2 enrutados) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería pytorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal de 32 capas con dimensión oculta de 128. Cada capa combina atención Multi-Head Latent Attention con compresión de bajo rango en Query (rango 48) y en KV conjunta (rango 32), lo que reduce la caché KV entre un 80% y un 90%. El bloque MoE de cada capa consta de 1 experto compartido siempre activo y 8 expertos enrutados con enrutamiento Top-2; la dimensión FFN de cada experto es de 64 y usa activación SwiGLU. Las conexiones residuales emplean mHC con vectores de escala aprendibles por capa, y el embedding de entrada está atado a la cabeza LM (weight tying). El vocabulario es un BPE personalizado de 4.096 entradas.

El entrenamiento utiliza una combinación de Muon (con ortogonalización de Newton-Schulz de quinto orden) y AdamW, con el objetivo declarado de acelerar la convergencia entre 1,5 y 2 veces. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan detalles sobre el preentrenamiento más allá de las decisiones arquitectónicas y del optimizador.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento secuencial a través de 32 capas (equivalente en profundidad a modelos de 8B como Llama-3, según el autor).
- Capacidad MoE con enrutamiento dinámico Top-2 sobre 8 expertos enrutados más 1 compartido por capa.
- Atención con compresión KV de bajo rango (MLA), orientada a eficiencia de memoria en inferencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la profundidad de la red.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- Sin capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en arquitecturas MoE: el modelo permite reproducir y experimentar con enrutamiento Top-2, expertos compartidos y esparsidad computacional en un entorno de ~10M parámetros que cabe en cualquier GPU consumer.
- Estudio de MLA y compresión KV: sirve para medir empíricamente el ahorro de memoria de la caché KV (80-90% declarado) y su impacto en la calidad de generación en secuencias de hasta 512 tokens.
- Validación de optimizadores: al usar Muon junto con AdamW, es útil para comparar curvas de convergencia y estabilidad del entrenamiento frente a configuraciones estándar.
- Prototipado educativo: modelo lo suficientemente pequeño (34,2 MB en FP32) para ejecutarse en CPU o en GPUs de gama baja, adecuado para docencia y demostraciones de arquitecturas Transformer modernas.
- Pruebas de weight tying y vocabulario reducido: permite estudiar el efecto de compartir embedding y cabeza LM con un vocabulario BPE de 4.096 entradas.
- Baseline para ablaciones: al estar construido desde cero con componentes identificables (MLA, mHC, MoE), funciona como referencia controlada en experimentos que aíslen cada innovación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada para ViuAI-10M con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 34,2 MB en FP32 para los pesos; en la práctica, el consumo vendrá dominado por la caché KV y el framework (PyTorch), no por los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria suficiente.
- Opciones de despliegue: la model card solo documenta carga mediante PyTorch con las clases `ViuAIConfig` y `ViuAIForCausalLM` del paquete `viuai`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos directamente comparables en la información proporcionada. Por escala y enfoque experimental, podría situarse junto a otros modelos "from-scratch" de investigación de tamaño similar, pero no se aportan cifras que permitan una comparación rigurosa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmark |
|---|---|---|---|---|---|
| ViuAI-10M | ~8,96 M | ~4,25 M | 512 | Apache 2.0 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamaño muy reducido (~10M parámetros): la calidad de generación y el conocimiento factual serán muy limitados en comparación con modelos de miles de millones de parámetros.
- Ventana de contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones de producción con documentos largos o conversaciones extensas.
- Vocabulario de 4.096 entradas: cobertura léxica reducida, con mayor fragmentación de tokens y posible degradación en textos especializados.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de incoherencia en generaciones largas, inherente a la escala del modelo.
- No se documentan evaluaciones de sesgo, seguridad ni alineación (RLHF/DPO no mencionados).
- Ausencia de benchmarks publicados: no es posible verificar empíricamente las afirmaciones de rendimiento de la model card.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción.
- No se especifican formatos de pesos estándar (safetensors, GGUF) ni integración con frameworks de inferencia habituales, lo que dificulta su despliegue fuera del código propio del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViuAI/ViuAI-10M
- Perfil del autor en Hugging Face: https://huggingface.co/ViuAI
