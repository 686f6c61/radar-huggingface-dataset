# vukien2301/sdd-mistral-7b-instruct-v03-seed44-step500

## Resumen

SDD-Mistral-7B-Instruct-v0.3 (seed 44, step 500) es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face. Se trata de un ajuste fino del modelo base `mistralai/Mistral-7B-Instruct-v0.3` entrenado durante 500 pasos con semilla 44, aplicando la defensa SDD (self-destructive defense) contra el fine-tuning malicioso. No es un modelo de propósito general ni un modelo certificado para uso en producción: es un artefacto experimental generado para la comparación de líneas base del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El modelo hereda la arquitectura y el tamaño del Mistral-7B-Instruct-v0.3 original: un transformer decoder-only de 7.248.023.552 parámetros (dato real de los safetensors), con pesos en formato safetensors y una ventana de contexto que, según la documentación del modelo base, es de 32.768 tokens. El repositorio ocupa 14,5 GB, lo que corresponde a los pesos en precisión completa (fp16/bf16).

Su relevancia es acotada y muy específica: sirve como referencia reproducible (semilla fija, número de pasos fijo) para estudiar técnicas de defensa frente a la manipulación de modelos abiertos mediante fine-tuning con datos dañinos. La model card es explícita al señalar que no se trata de un modelo seguro certificado y que su uso y licencia siguen los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, según tags y modelo base) |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Mistral-7B-Instruct-v0.3 declara 32.768 tokens) |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica que el uso y la licencia siguen los del modelo base `mistralai/Mistral-7B-Instruct-v0.3` |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only de 7.248 millones de parámetros. El ajuste consiste en 500 pasos de entrenamiento con semilla 44 aplicando el método SDD (self-destructive defense) como defensa contra el fine-tuning dañino (harmful fine-tuning). No se especifican en la información disponible el dataset de entrenamiento, el número de tokens, la composición de los datos, la tasa de aprendizaje ni si se emplearon técnicas de alineamiento adicionales como RLHF o DPO.

La model card indica que el checkpoint se generó con `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, para la comparación de líneas base. No se documentan innovaciones arquitectónicas propias: la arquitectura es la del modelo base y la contribución es exclusivamente el procedimiento de defensa aplicado durante el fine-tuning. Tampoco se detalla si se empleó decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Fine-tuning orientado a seguridad: el checkpoint incorpora la defensa SDD contra fine-tuning malicioso, objeto del estudio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Mistral-7B-Instruct-v0.3 sí lo soporta, pero no se confirma que se conserve tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Alineamiento conversacional y formato instruct: presumiblemente heredado del modelo base, no verificado en la información disponible.

## Casos de uso

- Investigación en seguridad de modelos abiertos: reproducir el experimento de la línea base SDD con semilla 44 y 500 pasos para comparar la robustez frente a fine-tuning dañino con otras defensas del artículo.
- Evaluación de técnicas de defensa: usar este checkpoint como referencia controlada en experimentos que midan la degradación de capacidades o la resistencia a ataques de manipulación de pesos.
- Reproducibilidad académica: al fijar semilla y número de pasos, permite replicar resultados del artículo *No Cheap Escape* en entornos con presupuesto de cómputo limitado.
- Estudio de geometría de barreras colaterales: servir de sustrato para analizar cómo se distribuyen las representaciones internas tras aplicar la defensa, mediante sondas lineales o análisis de activaciones.
- Comparación de líneas base en pipelines de seguridad: integrarlo como uno de los brazos de comparación en un banco de pruebas que evalúe múltiples métodos de defensa sobre el mismo modelo base.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo se construye y evalúa un checkpoint defensivo, siempre con la advertencia de que no es un modelo certificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-18 GB de VRAM para contexto corto.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto limitado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriría cuantización, no publicada en el repo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se ofrecen pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| sdd-mistral-7b-instruct-v03-seed44-step500 | 7.248 M | no disponible (base: 32.768) | no disponible (hereda la del base) | Hugging Face, 0 descargas | Defensa SDD contra fine-tuning dañino |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente distribuido | Modelo instruct generalista |
| Mistral-7B-Instruct-v0.2 | 7.248 M | 32.768 | Apache 2.0 | Hugging Face | Modelo instruct generalista, versión previa |

La comparación con alternativas de la misma categoría (defensas contra fine-tuning dañino) no está disponible en la información proporcionada. Frente al modelo base, la diferencia es el procedimiento de ajuste, no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- No es un modelo seguro certificado: la propia model card lo declara explícitamente.
- Checkpoint de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario.
- Sesgos conocidos: no documentados en la información disponible; se heredan, en su caso, los del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste de 500 pasos puede alterar el comportamiento conversacional del modelo base.
- Limitaciones de contexto e idioma: no documentadas; la ventana de contexto efectiva tras el ajuste no se especifica.
- Restricciones de licencia: la ficha no declara licencia propia; la model card remite a la del modelo base `mistralai/Mistral-7B-Instruct-v0.3`, por lo que debe verificarse antes de cualquier uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin documentación de datos de entrenamiento, hiperparámetros ni evaluación.
- Riesgo de uso indebido: al ser un checkpoint asociado a fine-tuning dañino y defensas, no debe desplegarse sin una evaluación de seguridad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/sdd-mistral-7b-instruct-v03-seed44-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo de referencia: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del artículo (`baselines/run_all.py`): no se proporciona URL en la información disponible
