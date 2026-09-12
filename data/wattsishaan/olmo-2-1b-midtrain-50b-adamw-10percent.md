# WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-10percent

## Resumen

OLMo-2-1B-Midtrain-50B-AdamW-10percent es un checkpoint intermedio (midtraining) del modelo base allenai/OLMo-2-0425-1B, publicado por el usuario WattsIshaan. No es un modelo final listo para producción: se trata de un punto de control al 90 % del proceso de midtraining (paso 21000 con batch size de 1024) sobre 50 000 millones de tokens extraídos del dataset allenai/dolmino-mix-1124, optimizado con AdamW. El 10 % restante de los pasos está reservado para poder aplicar una fase de annealing posterior.

El checkpoint se distribuye en formato FSDP fragmentado en ocho shards (rank0.pt a rank7.pt) y requiere ejecutar `python scripts/unshard.py` del repositorio de OLMo para consolidarlo en un único `model.pt` antes de poder cargarlo. Hereda por tanto la arquitectura, el tamaño y el tokenizador del modelo base de 1B de la familia OLMo 2 de AI2.

Su relevancia es principalmente de investigación: forma parte del trabajo «Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting» (Watts, Li, Goyal, Springer, Raghunathan, ICML 2026), que estudia cómo el preentrenamiento con conciencia de agudeza (sharpness-aware) reduce el olvido catastrófico durante las fases de midtraining y ajuste posterior. Es útil como punto de partida reproducible para estudiar dinámicas de forgetting, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base OLMo-2-0425-1B) |
| Parametros totales | Aproximadamente 1.000 millones (heredados del modelo base OLMo-2-0425-1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (se hereda del modelo base OLMo-2-0425-1B) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en punto flotante sin cuantizar; no se incluyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch FSDP fragmentado en 8 shards (`rank0.pt`–`rank7.pt`); no incluye safetensors. Requiere `scripts/unshard.py` para consolidar en `model.pt` |
| Tamano del repositorio | 17,8 GB |
| Modelo base | allenai/OLMo-2-0425-1B |
| Dataset de midtraining | allenai/dolmino-mix-1124 |

## Arquitectura y entrenamiento

El checkpoint emplea la arquitectura del modelo base allenai/OLMo-2-0425-1B, un transformer decoder-only denso de aproximadamente 1.000 millones de parámetros desarrollado por AI2. El autor no documenta en la model card modificaciones estructurales respecto al base, por lo que las innovaciones arquitectónicas corresponden a la familia OLMo 2 original; los detalles finos (tipo de normalización, embeddings posicionales, tamaño de vocabulario) no se especifican en la información proporcionada y deben consultarse en la documentación del modelo base.

La particularidad de este checkpoint es el régimen de entrenamiento. Se trata de una continuación de midtraining sobre 50 000 millones de tokens del dataset allenai/dolmino-mix-1124, optimizada con AdamW y detenida al 90 % (paso 21000 con batch size de 1024). El trabajo asociado estudia el preentrenamiento con conciencia de agudeza (sharpness-aware pretraining) como técnica para mitigar el olvido catastrófico, por lo que este punto de control funciona como referencia intermedia lista para aplicar una fase de annealing con los pasos restantes. No se documentan en la información disponible fases de RLHF, DPO ni datos de composición detallada del dataset.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base OLMo-2-0425-1B.
- Capacidad de modelado de lenguaje en la fase de midtraining; no se ha completado el annealing ni ningún ajuste de instrucciones.
- Soporte de tool calling / function calling: no disponible (no se documenta y no es esperable en un checkpoint intermedio sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto como punto de partida para investigación: permite reanudar el entrenamiento y aplicar el 10 % restante de annealing, así como estudiar dinámicas de olvido catastrófico.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint permite reproducir y extender los experimentos del paper comparando el estado al 90 % de midtraining con el modelo tras el annealing, midiendo la degradación en tareas previas.
- Reanudación de entrenamiento (annealing): partiendo de este punto, un equipo puede aplicar los pasos restantes con su propio schedule de learning rate y composición de datos, evitando repetir los primeros 50 000 millones de tokens.
- Ablaciones de optimizadores: al estar entrenado explícitamente con AdamW, sirve como referencia frente a variantes sharpness-aware u otros optimizadores en estudios comparativos.
- Reproducibilidad de resultados de ICML 2026: permite verificar las conclusiones del paper «Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting» sobre un checkpoint concreto y publicado.
- Punto de partida para ajuste supervisado (SFT): tras consolidar los shards y aplicar annealing, puede servir como base de 1B sobre la que realizar fine-tuning en dominios específicos.
- Experimentos de eficiencia de entrenamiento: al ocupar 17,8 GB en ocho shards, es manejable en clústeres pequeños y permite estudiar el coste de las fases de midtraining en modelos de escala 1B.
- Docencia y formación: útil como ejemplo práctico de flujo FSDP, consolidación de shards y gestión de checkpoints intermedios en pipelines reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras orientativas para un modelo denso de ~1.000 millones de parámetros): aproximadamente 2-2,5 GB en bf16/fp16 solo para los pesos, 1,2-1,5 GB en int8 y 0,7-0,9 GB en 4 bits, más memoria para caché KV y activaciones según la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16, como RTX 3060, RTX 4060, RTX 4070 o superiores; para entrenamiento en FSDP se recomiendan 8 GPU (A100, H100 o similares) capaces de alojar cada uno un shard del checkpoint.
- Cabe en GPU de consumo: sí, en bf16 cabe en GPUs de 8 GB o más; en cuantizaciones de 4 bits cabría en GPUs de 4-6 GB, aunque el repositorio no ofrece pesos ya cuantizados.
- Opciones de despliegue: inicialmente requiere `transformers` con el modelo consolidado, o el stack propio del repositorio OLMo; vLLM o TGI son viables una vez consolidado el `model.pt`; llama.cpp u Ollama exigirían una conversión previa a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-10percent | ~1.000 M | No disponible | cc-by-4.0 | Checkpoint FSDP fragmentado, requiere unshard | Estado intermedio al 90 % de midtraining; no listo para inferencia directa |
| allenai/OLMo-2-0425-1B | ~1.000 M | No disponible | Apache-2.0 (modelo base original de AI2) | Pesos estándar, listo para usar | Modelo base completo del que deriva este checkpoint |
| Meta Llama 3.2 1B | ~1.240 M | No disponible | Llama 3.2 Community License | Pesos estándar | Alternativa de tamaño comparable, con licencia más restrictiva para uso comercial |
| Qwen2.5-1.5B | ~1.540 M | No disponible | Apache-2.0 | Pesos estándar | Alternativa algo mayor, orientada a instrucciones en su variante Instruct |

Los datos exactos de contexto y rendimiento de los modelos comparados no se han verificado en la información proporcionada y se marcan como no disponibles; la comparación es, por tanto, cualitativa en lo relativo a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo final: es un checkpoint al 90 % del midtraining y requiere annealing y, si se busca uso conversacional, ajuste de instrucciones.
- Formato no estándar: se distribuye como shards FSDP que deben consolidarse con `scripts/unshard.py`; no hay safetensors ni GGUF listos para uso.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez.
- Riesgo de alucinación no evaluado y presumiblemente alto en un checkpoint sin ajuste.
- Idiomas y cobertura multilingüe no especificados.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificarla.
- Licencia cc-by-4.0: permite uso comercial con atribución, siempre que se respeten las condiciones de la licencia y la del modelo base del que deriva.
- Sin soporte documentado de tool calling, agentes ni capacidades multimodales.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria ni informes independientes de comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-10percent
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Dataset de midtraining: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Paper: https://arxiv.org/abs/2605.02105 («Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting», Watts, Li, Goyal, Springer, Raghunathan, ICML 2026)
- Repositorio OLMo (incluye `scripts/unshard.py`): https://github.com/allenai/OLMo
