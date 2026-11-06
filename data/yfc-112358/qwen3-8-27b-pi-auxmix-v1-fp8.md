# YFC-112358/Qwen3.8-27B-pi-AuxMix-v1-FP8

## Resumen

Qwen3.8-27B-pi-AuxMix-v1-FP8 es una exportación cuantizada en FP8 del modelo YFC-112358/Qwen3.8-27B-pi-AuxMix-v1, un merge de pesos de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) construido sobre la familia Qwen3.8-27B. El autor, YFC-112358, aplica una receta de fusión de modelos (model merging) que combina el modelo sujeto bytkim/Qwen3.8-27B-pi con un donante principal (Final) y varias fuentes auxiliares mediante una fórmula lineal con coeficientes ajustados, incluyendo deltas de transporte entre arquitecturas. Esta variante FP8 reduce el peso del repositorio a 36,8 GB y está pensada para inferencia en hardware compatible con FP8.

El modelo base emplea la arquitectura qwen3_5, que según la model card incluye atención completa, atención lineal, una torre de visión (vision tower) y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. El proceso de merge es puramente aritmético sobre los pesos: no hay entrenamiento adicional, sino una combinación de deltas de fine-tunes, adaptadores LoRA y deltas de transporte entre arquitecturas (Nanbeige4.3-33B y SenseNova-Loop-9B-Preview). La selección de componentes se realizó mediante NLL sobre un conjunto proxy de 30 ítems, sin evaluación de generación ni benchmarks.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de merging cada vez más común en la comunidad open source (mezcla de fine-tunes con selección estadística de componentes); por otro, advierte de que el modelo no ha sido evaluado en calidad, seguridad ni rendimiento real, por lo que su uso en producción requiere validación propia. El autor indica explícitamente que no se ejecutó ninguna inferencia ni evaluación FP8 completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con atención completa, atención lineal, torre de visión y cabeza MTP) |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3FN con bloques de pesos 128x128, weight_scale_inv en float32, cuantización dinámica de activaciones; el modelo base está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 36,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8-27B (arquitectura qwen3_5) con 27,8 mil millones de parámetros. Según la model card, la arquitectura incluye proyecciones de atención completa (self_attn.q_proj, k_proj, v_proj, o_proj), proyecciones MLP (gate_proj, up_proj, down_proj), atención lineal, una torre de visión y una cabeza MTP para decodificación especulativa. La exportación FP8 solo cuantiza las proyecciones MLP del decodificador y las proyecciones de atención completa; embeddings, lm_head, visión, atención lineal, la cabeza MTP y las matrices no divisibles en bloques conservan su precisión original (BF16).

No hay entrenamiento en el sentido tradicional. El modelo base se construye mediante una fórmula de fusión de pesos: F = S + lambda_g * [D - kappa * (S - B)] + mu * C + nu * N, donde S es el modelo sujeto (bytkim/Qwen3.8-27B-pi), B su base (Qwen/Qwen3.8-27B), D un donante principal (Final) construido a partir de M - B más la suma ponderada de deltas de fine-tunes auxiliares (StartLuxLoRA con coeficiente 0,4, Winery 0,05, DavidAU 0,3, DellaMix 0,8, EfficientThink 0,5, DellaMix2 0,1), C una diferencia entre dos fine-tunes de nerkyor con coeficiente mu = 0,75, y N y N2 deltas de transporte entre arquitecturas desde Nanbeige4.3-33B y SenseNova-Loop-9B-Preview con coeficientes nu = 0,05 y nu2 = 0,05. Los deltas de transporte se calculan mediante planes de transporte óptimo (OT) entre canales de capas emparejadas por CKA lineal, y se mezclan solo en las 128 filas de mayor activación de cada matriz modificada, reescaladas a la norma de la fila base.

La selección de componentes se realizó mediante un análisis de primer orden del efecto de cada componente sobre la pérdida NLL en un conjunto proxy público de 30 ítems, con incertidumbre estimada por bootstrap y validación por cross-fitting de dos pliegues. Se descartaron 21 de 193 componentes de F - S. No se usó dataset de calibración para la cuantización FP8. No se realizó RLHF, DPO ni ningún entrenamiento posterior; el merge es puramente aritmético sobre pesos.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no evaluadas en esta variante.
- Procesamiento de imagen: el modelo base incluye torre de visión (image-text-to-text según la página de Qwen/Qwen3.8-27B), y la exportación FP8 conserva la torre de visión en precisión original.
- Decodificación especulativa: el modelo base incluye una cabeza MTP (Multi-Token Prediction) que se conserva en precisión original; la model card indica que no se incluye un draft DFlash.
- Tool calling / function calling: no disponible (no se documenta explícitamente en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Modo thinking: no disponible (no se documenta explícitamente).
- Fine-tunes auxiliares orientados a código y razonamiento: la receta incluye fuentes como Coder390, EfficientThink y DellaMix, que sugieren capacidades de código y razonamiento, pero no hay evaluación que lo confirme.

## Casos de uso

- Investigación en merging de modelos: el modelo sirve como caso de estudio reproducible de fusión de pesos con selección estadística de componentes, deltas de transporte entre arquitecturas y exportación FP8; útil para investigadores que analizan técnicas de model merging.
- Despliegue en infraestructura con FP8: al estar cuantizado en FP8 E4M3FN con bloques 128x128, puede desplegarse en GPUs con soporte nativo de FP8 (H100, H200, B200) para reducir el uso de memoria frente al BF16 y aumentar el throughput en inferencia de texto.
- Generación de texto asistida por imagen: el modelo base es image-text-to-text y conserva la torre de visión en precisión original, por lo que puede emplearse en tareas de descripción de imágenes o VQA, siempre que se valide la calidad tras el merge.
- Prototipado de asistentes conversacionales: como modelo de 27,8 B, puede servir para experimentar con conversaciones multi-turno en entornos de investigación, aunque la longitud de contexto no está documentada y debe medirse.
- Base para fine-tuning posterior: al ser un merge sin entrenamiento, puede usarse como punto de partida para fine-tunes específicos de dominio, con la ventaja de que combina múltiples fuentes especializadas.
- Evaluación comparativa de recetas de merge: útil para comparar la receta AuxMix frente a otros merges de la misma familia Qwen3.8-27B en términos de NLL sobre conjuntos proxy.
- Experimentación con decodificación especulativa: la conservación de la cabeza MTP permite probar técnicas de decodificación especulativa en el modelo base, aunque no se incluye draft DFlash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ejecutó ninguna evaluación de generación, benchmark ni seguridad. El único dato medido es la NLL media de respuesta sobre un conjunto proxy de 30 ítems: 0,0006 para el modelo frente a 0,0023 para el sujeto (mejora de 0,0016), pero ese conjunto se usó también para seleccionar el modelo, por lo que la estimación está sesgada. No se realizó inferencia FP8 completa ni evaluación de calidad FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo FP8 ocupa 36,8 GB, por lo que se necesita al menos ~40 GB de VRAM para cargar los pesos FP8, más overhead de activaciones y KV cache. En BF16 (modelo base) serían ~55,6 GB solo de pesos.
- GPU recomendadas: H100 (80 GB), H200 (141 GB), B200 (192 GB) para FP8 nativo; A100 (80 GB) no tiene soporte FP8 nativo y requeriría conversión o fallback. Para BF16, A100 80 GB o H100.
- Cabe en consumer GPU: no en GPUs de 24 GB (RTX 4090) en FP8 sin offloading; requeriría cuantización adicional (por ejemplo, GGUF Q4) que no está disponible en este repo. En RTX 4090 (24 GB) no cabe en FP8.
- Opciones de despliegue: se requiere una implementación compatible con FP8 y backend FP8 (por ejemplo, vLLM con soporte FP8, TensorRT-LLM o SGLang); la model card advierte que la exportación en CPU no implica soporte de inferencia FP8 en CPU. No se documentan opciones como llama.cpp u Ollama para esta variante.
- Latencia y throughput: no disponibles (no se realizaron mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YFC-112358/Qwen3.8-27B-pi-AuxMix-v1-FP8 | 27,8 B | no disponible | no disponible | safetensors FP8 | Merge AuxMix, sin evaluación |
| YFC-112358/Qwen3.8-27B-pi-AuxMix-v1 (base BF16) | 27,8 B | no disponible | no disponible | safetensors BF16 | Modelo base del que se exporta FP8 |
| Qwen/Qwen3.8-27B | ~28 B | no disponible | no disponible | safetensors | Modelo original de Qwen, image-text-to-text |
| YFC-112358/Qwen3.8-27B-TA-Aux-v1-2 | no disponible | no disponible | no disponible | no disponible | Otro merge del mismo autor, sin model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: la model card indica explícitamente que no se ejecutó ninguna evaluación de generación, benchmark ni seguridad; la única medición es NLL sobre un proxy de 30 ítems usado para seleccionar el modelo, lo que sesga la estimación.
- Sin evaluación FP8: no se realizó inferencia ni evaluación FP8 completa; la calidad de la cuantización FP8 no está medida y depende de la implementación y el backend.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de usarlo en producción.
- Idiomas no documentados: no se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Contexto no documentado: no se indica la longitud de contexto, lo que limita la planificación de aplicaciones con ventanas largas.
- Riesgo de alucinación: al ser un merge sin entrenamiento ni evaluación, el riesgo de alucinación y degradación de calidad es desconocido y potencialmente alto.
- Fuentes no censuradas: la model card advierte de que algunas fuentes son fine-tunes sin censura, lo que puede afectar al comportamiento de rechazo y a la seguridad.
- Sesgos desconocidos: no se han realizado evaluaciones de sesgo.
- Dependencia de hardware: la inferencia FP8 requiere hardware y backend compatibles; no se garantiza funcionamiento en CPU.
- Restricciones de producción: al no haber benchmarks ni evaluación de seguridad, no se recomienda su uso en producción sin una validación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-pi-AuxMix-v1-FP8
- Modelo base BF16: https://huggingface.co/YFC-112358/Qwen3.8-27B-pi-AuxMix-v1
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Otro merge del mismo autor: https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-v1-2
