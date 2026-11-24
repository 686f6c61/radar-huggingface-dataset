# StarLiu714/GPT-oss-MOFinder

## Resumen

GPT-oss-MOFinder es un ajuste fino supervisado del modelo causal openai/gpt-oss-20b, desarrollado por StarLiu714, orientado a una tarea muy concreta de química de materiales: predecir si unas condiciones de reacción dadas producen una estructura metal-orgánica cristalina (MOF, metal-organic framework). El modelo no genera texto libre sobre química, sino que formula la predicción como una clasificación binaria P/N explotando los logits del modelo de lenguaje sobre tokens de respuesta.

El repositorio contiene los pesos completos en BF16 (13 shards safetensors, unos 41,8 GB), el tokenizador, los datos de entrenamiento y holdout, y scripts de inferencia y entrenamiento continuado. El adaptador LoRA original (r=32, alpha=64 sobre q_proj, k_proj, v_proj y o_proj) ya está fusionado en el checkpoint exportado, de modo que no se requieren kernels MXFP4 ni carga de expertos cuantizados en tiempo de ejecución.

Su relevancia es doble: por un lado, demuestra el uso de un LLM de 20.914.757.184 parámetros como clasificador científico especializado; por otro, publica la receta de entrenamiento completa y los datos, lo que facilita la reproducibilidad y la adaptación a otros dominios de síntesis de materiales. La licencia GPL-3.0 del release convive con la Apache-2.0 del modelo base, un detalle que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (gpt_oss) con adaptador LoRA fusionado; checkpoint denso BF16 |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens como límite de validación de entrada en los scripts; longitud real de los prompts de reacción: 370 tokens |
| Tipos de cuantizacion | no disponible (el release se distribuye en BF16; no requiere kernels MXFP4) |
| Idiomas soportados | en |
| Licencia | GPL-3.0 (modelo base GPT-oss-20B bajo Apache-2.0) |
| Formato de pesos | safetensors (13 shards BF16, ~41,8 GB) + tokenizer |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-20b, un transformer causal de 20.914.757.184 parámetros, y se adapta mediante LoRA con r=32, alpha=64, dropout=0.05 y módulos objetivo q_proj, k_proj, v_proj y o_proj. La tarea se reformula como clasificación P–N a través de los logits del modelo de lenguaje: el prompt de chat contiene los campos de la reacción (precursor metálico, linker orgánico, modulador, disolvente, concentración metálica en mM, ratio M/L, temperatura en °C y tiempo en horas) y el modelo puntúa la probabilidad de la clase P.

Los datos suministrados constan de 23.528 ejemplos de entrenamiento (11.968 P / 11.560 N) y 2.595 de holdout (1.320 P / 1.275 N), con la advertencia de que clústeres de una misma publicación pueden aparecer en ambos conjuntos. La receta registrada en mof_export_manifest.json incluye learning rate 1e-5 con halving en los pasos 1200, 3200, 6000 y 8500, warmup 0.02, weight decay 0, batch de entrenamiento 18 y de evaluación 48, max_steps=10000 con 3 épocas, pérdida con peso de clase N de 1.02, label smoothing 0.02, focal gamma 0 y semilla 777. No se documenta un número de tokens de preentrenamiento propio de este ajuste ni etapas de RLHF o DPO.

## Capacidades

- Clasificación binaria P/N de resultados de síntesis de MOF a partir de condiciones de reacción estructuradas.
- Salida de probabilidad calibrable mediante temperatura (por defecto temperatura 1) sobre los logits de la clase P.
- Procesamiento de prompts de chat en formato JSONL con el system prompt y el formateo de campos exactos del release.
- Soporte de etiquetas `gold` opcionales para puntuar predicciones sobre lotes propios.
- Entrenamiento continuado: scripts para nuevas ejecuciones LoRA con receta configurable por JSON o flags de CLI.
- Capacidades generales heredadas del modelo base (generación de texto en inglés) no validadas específicamente en este ajuste.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Cribado virtual de condiciones de síntesis: dado un conjunto de combinaciones de precursor metálico, linker, modulador, disolvente, concentración, ratio M/L, temperatura y tiempo, el modelo estima la probabilidad de obtener un MOF cristalino, lo que permite priorizar experimentos de laboratorio antes de ejecutarlos.
- Optimización de protocolos experimentales: con la probabilidad P como función objetivo, se pueden barrer sistemáticamente temperatura y tiempo de reacción para identificar regiones del espacio de condiciones con alta probabilidad de cristalización.
- Filtrado de datos históricos de literatura: procesar registros de reacciones extraídos de publicaciones y asignarles una probabilidad de éxito, útil para detectar entradas mal etiquetadas o inconsistencias en bases de datos.
- Priorización en plataformas de síntesis automatizada: integrar el modelo en un bucle de experimentación autónoma donde las condiciones candidatas se puntúan antes de enviarse al robot de síntesis, reduciendo el consumo de reactivos.
- Adaptación a nuevos dominios de materiales: reutilizar la receta LoRA publicada (r=32, alpha=64, lr 1e-5) y los scripts de continuación para ajustar el modelo a otros sistemas (zeolitas, COFs, perovskitas) con datos propios en el mismo formato JSONL.
- Reproducción y auditoría científica: el release incluye datos de entrenamiento y holdout, manifiesto de exportación y receta, lo que permite replicar el ajuste y verificar métricas de forma independiente.
- Docencia e investigación en LLMs aplicados a química: servir de ejemplo reproducible de clasificación científica mediante logits de un LLM, con prompts de 370 tokens y requisitos de hardware documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan unos 41,8 GB, por lo que se necesita al menos un GPU de 48 GB; el autor recomienda A100/H100 de 80 GB o RTX PRO 6000 de 96 GB.
- GPU recomendadas: NVIDIA Ampere o superior (compute capability 8.0+) para BF16/TF32 nativo: A100, RTX A6000, RTX 6000 Ada, H100, H200 o RTX PRO 6000 Blackwell de 96 GB.
- Configuraciones de referencia del autor con prompts de 370 tokens: inferencia con batch 24 en A100/H100 80 GB y batch 48 en RTX PRO 6000 96 GB; LoRA de continuación con train 12 / eval 24 en A100/H100 y train 18 / eval 48 en RTX PRO 6000.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en BF16; no se documentan opciones de cuantización en el release.
- Despliegue: scripts propios sobre Transformers 4.56.2 y PEFT 0.17.1 con PyTorch 2.6+ y CUDA; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo documenta tamaños de batch de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-oss-MOFinder | 20.914.757.184 | 2048 (límite de scripts); prompts de 370 tokens | Clasificación P/N de síntesis de MOF | GPL-3.0 (base Apache-2.0) | Hugging Face, 345 descargas |
| openai/gpt-oss-20b | 20.914.757.184 | no disponible en la información proporcionada | Generación de texto general | Apache-2.0 | Hugging Face |
| MOFinder (zzhenglab) | no disponible | no disponible | Predicción de cristalización de MOF | no disponible | GitHub |

## Limitaciones y advertencias

- El modelo solo está validado para clasificación P/N en el dominio de síntesis de MOF; no debe asumirse calidad en generación libre ni en otras ramas de la química.
- Los conjuntos de entrenamiento y holdout pueden compartir clústeres de una misma publicación, lo que puede inflar las métricas de evaluación respecto a datos completamente nuevos.
- El límite de longitud de los scripts (2048 tokens) rechaza entradas más largas en lugar de truncarlas; los prompts de reacción de referencia miden 370 tokens, por lo que desviarse del formato puede degradar el rendimiento.
- Solo soporta inglés; los campos de reacción deben respetar el system prompt y el formateo exactos del release para que las comparaciones sean válidas.
- No se han publicado benchmarks en la información disponible, por lo que no hay evidencia cuantitativa externa de su precisión.
- Riesgo de alucinación y sesgo heredado del modelo base GPT-oss-20b, no evaluado específicamente en este ajuste.
- Licencia GPL-3.0 para el release, con el modelo base bajo Apache-2.0: es necesario revisar ambas antes de un uso comercial o de redistribución.
- El checkpoint es denso BF16 de ~41,8 GB, sin opciones de cuantización documentadas, lo que limita el despliegue a hardware de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarLiu714/GPT-oss-MOFinder
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio MOFinder: https://github.com/zzhenglab/MOFinder
- Guía de datasets de MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/docs/datasets.md
- Citación de MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
- Guía de descarga con Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/download#download-from-the-cli
- GPU RTX PRO 6000 de NVIDIA: https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/
