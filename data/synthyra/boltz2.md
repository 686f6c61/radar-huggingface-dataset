# Synthyra/Boltz2

## Resumen

Boltz2 es un modelo de predicción de estructura de proteínas empaquetado por Synthyra bajo el runtime FastPLMs para Hugging Face Transformers. Se trata de una adaptación del checkpoint oficial `boltz-community/boltz-2`, que Synthyra redistribuye con una interfaz compatible con el contrato `PreTrainedModel` de Transformers, lo que permite cargarlo mediante `AutoModel.from_pretrained` con `trust_remote_code=True`. El modelo acepta secuencias de aminoácidos en crudo a través de una API de conveniencia o features ya preparadas, y devuelve coordenadas atómicas junto con métricas de confianza (pLDDT, pTM, ipTM).

El checkpoint redistribuido contiene 520.636.223 parámetros en formato safetensors, con un repositorio de 6,3 GB. La arquitectura subyacente corresponde al núcleo de inferencia de Boltz-2, un modelo especializado en predicción de estructura proteica con componentes de difusión, tal como se deduce de los parámetros de muestreo expuestos en la API (`recycling_steps`, `num_sampling_steps`, `diffusion_samples`). No es un modelo de lenguaje general: su pipeline declarado es `feature-extraction` y su contrato de generación es `not_applicable`.

La relevancia de esta ficha radica en que Synthyra está facilitando el acceso a Boltz-2 a través del ecosistema estándar de Transformers, algo poco habitual en modelos de estructura proteica, que suelen requerir stacks propietarios. Sin embargo, el propio autor advierte que la implementación es provisional en FastPLMs 1.0 y que la inferencia BF16 de extremo a extremo aún supera los límites fijados de equivalencia numérica, por lo que no se reclama paridad oficial con el checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Núcleo de inferencia Boltz-2 (predicción de estructura proteica con difusión); clases `AutoConfig` / `AutoModel` de FastPLMs sobre Transformers |
| Parámetros totales | 520.636.223 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor indica precisión `default`, parámetros y features en FP32, inferencia CUDA en autocast BF16) |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo redistribuye el checkpoint `boltz-community/boltz-2` mediante una transformación de estado identificada como `boltz2_inference_core_v1`. La arquitectura es la del núcleo de inferencia de Boltz-2, orientada a la predicción de estructura tridimensional de proteínas. La API expone parámetros propios de un esquema de difusión para generación de coordenadas: `recycling_steps` (número de reciclados del trunk), `num_sampling_steps` (pasos de muestreo) y `diffusion_samples` (número de muestras de difusión), además de una semilla para reproducibilidad. El helper `predict_structure` prepara una entrada solo de proteína, ejecuta el núcleo declarado y devuelve coordenadas y campos de confianza.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; estos datos no figuran en la model card. El autor documenta que la validación se ejecuta en Docker sobre cualquier dispositivo CUDA compatible, con backends de atención limitados a `eager` (solicitar un backend no disponible lanza una excepción en lugar de cambiar de implementación silenciosamente). El helper preserva y restaura el estado RNG de Python, NumPy, CPU Torch y CUDA. Una innovación destacable en el plano de ingeniería es la fijación de revisiones upstream y la generación de un `source-record.json` con identidades exactas de conversión, lo que facilita la auditoría de la procedencia de los pesos.

## Capacidades

- Predicción de estructura proteica a partir de secuencias de aminoácidos en crudo o de features preparadas.
- Salida de coordenadas atómicas (`sample_atom_coords`) y métricas de confianza: pLDDT, pTM e ipTM.
- Exportación de resultados a formato mmCIF mediante `save_as_cif`.
- Muestreo estocástico controlado por semilla, con número configurable de pasos de difusión y de reciclado.
- Extracción de features (pipeline declarado `feature-extraction`).
- Soporte de fine-tuning con PEFT/LoRA sobre módulos lineales (`target_modules="all-linear"`, `r=8`, `lora_alpha=16` en el ejemplo del autor).
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: el contrato de generación es `not_applicable`.
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Predicción de estructura de proteínas en pipelines de investigación: cargar el modelo con `AutoModel.from_pretrained` y llamar a `predict_structure` sobre secuencias candidatas para obtener coordenadas y pLDDT, integrable en flujos bioinformáticos basados en Python.
- Filtrado previo de candidatos en diseño de proteínas: usar pTM e ipTM como señales de confianza para priorizar variantes antes de validación experimental costosa.
- Análisis de estabilidad estructural: comparar predicciones con distintos valores de `recycling_steps` y `num_sampling_steps` para estudiar la sensibilidad del modelo a la configuración de muestreo.
- Extracción de representaciones para modelos downstream: emplear el pipeline `feature-extraction` para alimentar clasificadores o regresores biológicos entrenados aparte.
- Ajuste fino con LoRA sobre datos propios: adaptar el checkpoint a una familia proteica concreta con PEFT, preservando las cabezas nuevas mediante `modules_to_save`.
- Validación reproducible en CI: ejecutar el modelo en contenedores Docker con semilla fija y precisión registrada para comparar salidas entre revisiones del artefacto.
- Despliegue en entornos aislados: construir el artefacto local fijado por manifiesto y usar `local_files_only=True` para ejecución sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona tiers de release (`structure`, `artifact`, `benchmark`) y advierte explícitamente que las comprobaciones de estructura no constituyen afirmaciones de paridad con la referencia, y que los metadatos por sí solos no demuestran que una build haya pasado las validaciones ni que una salida sea biológicamente válida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 520,6 M de parámetros en FP32, el peso de los parámetros ronda los 2,1 GB; a ello hay que sumar el estado del núcleo de inferencia y las activaciones del esquema de difusión, no cuantificadas en la documentación.
- GPU recomendadas: el autor no especifica producto ni estación de trabajo; indica que la validación se ejecuta en Docker sobre cualquier dispositivo CUDA compatible.
- GPU de consumo: no confirmado. Por tamaño de parámetros sería viable en GPUs de consumo con suficiente VRAM, pero la ausencia de datos de activaciones y de cuantizaciones publicadas impide afirmarlo con rigor.
- Opciones de despliegue: carga directa con Transformers (`trust_remote_code=True`), backend de atención `eager`, autocast BF16 en CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synthyra/Boltz2 | 520,6 M | No disponible | Predicción de estructura proteica (difusión) | MIT | Hugging Face, runtime FastPLMs |
| boltz-community/boltz-2 | No disponible | No disponible | Predicción de estructura proteica | No disponible en la información proporcionada | Checkpoint oficial upstream |
| ESMFold2 (mencionado por el autor) | No disponible | No disponible | Predicción de estructura proteica | No disponible en la información proporcionada | Gestionado por las mismas release gates de FastPLMs |

La model card menciona ESM++ y ESMFold2 como modelos sujetos a las mismas compuertas de release dentro de FastPLMs, pero no aporta especificaciones ni resultados comparativos. No se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Estado provisional: Boltz2 está marcado como provisional en FastPLMs 1.0 y no declara el tier `compliance`; sus comprobaciones de estructura no son afirmaciones de paridad.
- Brecha numérica: la inferencia BF16 nativa de extremo a extremo supera los límites fijos de equivalencia numérica, por lo que no se reclama equivalencia oficial de inferencia con el checkpoint original.
- Entrada limitada a proteínas: el helper de alto nivel prepara entradas solo de proteína; no se documenta soporte de ligandos, ácidos nucleicos ni modificaciones.
- Sin benchmarks publicados: no hay métricas de precisión estructural ni comparativas cuantitativas en la información disponible.
- Sin datos de sesgo: al no ser un modelo lingüístico, no aplican sesgos de lenguaje, pero tampoco se documentan sesgos del dataset biológico de entrenamiento.
- Riesgo de salidas no válidas biológicamente: el autor advierte que los metadatos no demuestran validez biológica de las predicciones.
- Dependencias estrictas: requiere Python 3.12-3.14, PyTorch 2.14 y Transformers 5.17, lo que puede limitar la integración en stacks existentes.
- Backend único: solo `eager` está disponible; no hay atención optimizada tipo flash-attention documentada.
- Licencia MIT en el checkpoint, pero el artefacto local incluye licencias y avisos de las fuentes que deben revisarse antes de uso comercial.
- Sin cabecera clasificadora publicada: cualquier tarea downstream requiere añadir y preservar una cabeza propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synthyra/Boltz2
- Checkpoint oficial upstream: `boltz-community/boltz-2` (referenciado en la model card; URL no disponible en la información proporcionada)
- Dependencias del modelo: https://huggingface.co/Synthyra/Boltz2/resolve/main/requirements.txt
- Paper, blog, repositorio y demo: no disponibles en la información proporcionada.
