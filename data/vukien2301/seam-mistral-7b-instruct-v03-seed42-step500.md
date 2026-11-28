# vukien2301/seam-mistral-7b-instruct-v03-seed42-step500

## Resumen

SEAM es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario `vukien2301` en Hugging Face. Se trata de la línea base del método SEAM (defensa frente a fine-tuning dañino o *harmful fine-tuning*), entrenada durante 500 pasos con semilla 42 a partir del modelo instruct de Mistral. No es un modelo de propósito general ni un modelo certificado en seguridad: es un artefacto de experimentación reproducible asociado al artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El modelo conserva la arquitectura del base: un transformer decoder-only de Mistral con 7.248.023.552 parámetros totales (unos 7,25 mil millones) y el tokenizador y la ventana de contexto de Mistral-7B-Instruct-v0.3. El repositorio ocupa 14,5 GB en formato safetensors, coherente con pesos en precisión de 16 bits. La licencia y los idiomas soportados no aparecen declarados de forma explícita en la información disponible; la model card remite a los del modelo base.

Su relevancia es acotada y muy específica: sirve como referencia cuantitativa para comparar defensas frente a la manipulación maliciosa de pesos mediante fine-tuning. Cualquier uso en producción queda fuera de su alcance declarado, dado que el propio autor indica que no está certificado en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral), derivado de `mistralai/Mistral-7B-Instruct-v0.3` |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 14,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only con atención por ventanas deslizantes y atención completa alternadas, más el resto de componentes propios de la familia Mistral. El checkpoint no introduce cambios estructurales; lo que cambia es el proceso de ajuste. Según la model card, SEAM se entrena desde el modelo instruct durante 500 pasos con semilla 42, en el marco del repositorio `baselines/run_all.py` del proyecto *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El objetivo del entrenamiento es actuar como defensa frente a *harmful fine-tuning*: el modelo se somete a un procedimiento que pretende preservar el alineamiento original incluso si un tercero intenta reajustarlo con datos dañinos. La model card no detalla la composición del dataset, el número de tokens vistos ni si se emplearon técnicas de RLHF o DPO adicionales; esa información no está disponible. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct de Mistral.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla del base.
- Capacidad multilingüe potencial heredada del base, aunque no declarada explícitamente en este checkpoint.
- Función principal: servir como línea base de defensa SEAM frente a fine-tuning dañino, para comparación experimental.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de seguridad: ejecutar `baselines/run_all.py` con este checkpoint para replicar la comparación base del artículo sobre geometría de barreras colaterales.
- Evaluación de robustez frente a *harmful fine-tuning*: usar el modelo como referencia SEAM y medir la degradación de alineamiento tras ataques de ajuste con datos dañinos.
- Estudio de geometría de pesos: analizar cómo el entrenamiento SEAM desplaza las representaciones internas respecto al modelo base, comparando checkpoints con distintas semillas.
- Investigación académica sobre alineamiento: servir como punto de comparación controlado en artículos que propongan nuevas defensas, dado que el entrenamiento es reproducible (semilla 42, 500 pasos).
- Docencia y formación en seguridad de modelos: ilustrar en un entorno controlado qué es una defensa de fine-tuning y cómo se mide su eficacia.
- Auditoría de pipelines de fine-tuning: integrar el checkpoint en pruebas que verifiquen si un proceso de ajuste rompe o preserva las barreras de seguridad del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- En cuantización de 8 bits: aproximadamente 8 GB de VRAM; en 4 bits: en torno a 4-5 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala; RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEAM Mistral-7B (este checkpoint) | 7,25 B | no disponible | Defensa frente a harmful fine-tuning (investigación) | no disponible (hereda del base) | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | no disponible en esta ficha | Modelo instruct de propósito general | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7,25 B | no disponible en esta ficha | Modelo instruct de propósito general | Apache 2.0 | Hugging Face |

La comparación relevante es con el propio modelo base: SEAM añade 500 pasos de entrenamiento de defensa sobre Mistral-7B-Instruct-v0.3, sin cambiar tamaño ni arquitectura. Frente a otras defensas de fine-tuning, la información disponible no permite establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo certificado en seguridad; el propio autor lo advierte en la model card.
- Es un checkpoint de investigación, no un modelo de producción: no debe usarse en aplicaciones comerciales sin evaluación propia.
- Licencia no declarada explícitamente; se hereda la del modelo base, pero conviene verificarla antes de cualquier uso.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente al modelo base de 7 B, no mitigado por el entrenamiento SEAM.
- Sesgos potenciales heredados de los datos de entrenamiento del base, no evaluados en este checkpoint.
- Ventana de contexto no confirmada en la información disponible; no asumir valores sin verificar el modelo base.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de su comportamiento.
- El entrenamiento de 500 pasos con una sola semilla limita la generalización de conclusiones extraídas de este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/vukien2301/seam-mistral-7b-instruct-v03-seed42-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio del artículo (*No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*): no disponible como enlace en la información proporcionada.
