# Synthyra/ESMFold2

## Resumen

ESMFold2 es un modelo de predicción de estructura de proteínas desarrollado originalmente por Biohub (checkpoint `biohub/ESMFold2`) y empaquetado por Synthyra con el runtime FastPLMs para su uso con Hugging Face Transformers. El modelo acepta secuencias de aminoácidos en bruto o especificaciones tipadas de complejos moleculares (multicadena y multimolécula) y produce estructuras tridimensionales en formato PDB o mmCIF, junto con métricas de confianza como pTM y pLDDT.

El checkpoint es un ESMFold2 completo de 48 bloques con aproximadamente 234,8 millones de parámetros, lo que lo sitúa en la gama de modelos de proteínas de tamaño medio. Incorpora una cabeza de confianza activa y un trunk de difusión para el plegamiento, con soporte opcional de condicionamiento por MSA (alineamiento múltiple de secuencias). Además de la tarea principal de plegamiento, el repositorio expone clases de clasificación de secuencia y de token que reutilizan el backbone preentrenado.

Su relevancia actual radica en que ofrece un pipeline de plegamiento de proteínas completo y ejecutable dentro del ecosistema Transformers estándar, con licencia MIT, lo que facilita su integración en flujos de trabajo de bioinformática y su uso comercial sin las restricciones habituales de otros modelos de estructura proteica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold2 (transformer con trunk de plegamiento y cabeza de difusión), 48 bloques |
| Parametros totales | 234.822.979 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa float32 con backbone en bf16) |
| Idiomas soportados | no disponible (modelo de proteínas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ESMFold2 es un modelo de plegamiento de proteínas que combina un backbone tipo transformer (estilo ESM) con un trunk de plegamiento y una cabeza de difusión para generar coordenadas atómicas. El checkpoint empaquetado es la variante completa de 48 bloques, con una cabeza de confianza habilitada que devuelve campos de confianza (pTM, pLDDT) junto con la estructura. El modelo soporta inferencia a partir de una única secuencia y, opcionalmente, inferencia condicionada por MSA, que puede adjuntarse a cada cadena proteica en entradas multicadena y multimolécula.

El runtime FastPLMs está embebido en el repositorio y se carga mediante `trust_remote_code=True`. El modelo permite seleccionar el backend de atención entre `eager`, `sdpa` y `flex_attention`, y expone un mecanismo de chunking (`set_chunk_size`) para gestionar el consumo de memoria durante el plegamiento. El proceso de plegamiento se controla mediante parámetros como `num_loops`, `num_sampling_steps`, `num_diffusion_samples` y `seed`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Predicción de estructura de proteínas a partir de secuencias de aminoácidos en bruto, con salida en PDB y mmCIF.
- Plegamiento de complejos multicadena y multimolécula mediante especificaciones tipadas (`StructurePredictionInput`, `ProteinInput`).
- Inferencia condicionada por MSA opcional para cadenas proteicas.
- Salida de métricas de confianza: pTM y pLDDT por residuo.
- Control del proceso de difusión mediante número de pasos de muestreo, número de muestras y semilla.
- Clasificación de secuencia y clasificación de token sobre el backbone preentrenado (cabezas nuevas sin entrenar, requieren fine-tuning).
- Soporte de fine-tuning con PEFT/LoRA sobre el checkpoint cargado.
- Selección de backend de atención (`eager`, `sdpa`, `flex_attention`) y gestión de memoria mediante chunking.
- No se documentan capacidades de tool calling, agentes, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Predicción de estructura de proteínas individuales: el modelo pliega una secuencia de aminoácidos y devuelve un archivo PDB o mmCIF con las coordenadas atómicas, útil para caracterizar proteínas sin estructura experimental resuelta.
- Modelado de complejos proteína-proteína: mediante entradas multicadena tipadas, se pueden plegar dos o más cadenas simultáneamente, lo que permite estudiar interfaces de interacción.
- Análisis de confianza estructural: las salidas de pTM y pLDDT permiten filtrar predicciones de baja calidad antes de usarlas en pipelines downstream, por ejemplo en cribados de candidatos.
- Fine-tuning para clasificación de secuencias: usando la clase de clasificación de secuencia y PEFT/LoRA, se puede adaptar el backbone a tareas como predicción de función proteica o clasificación de familias, entrenando únicamente la cabeza y los adaptadores.
- Anotación a nivel de residuo: la clase de clasificación de token permite predecir etiquetas por posición biológica (por ejemplo, sitios activos o regiones de unión), tras entrenar la cabeza correspondiente.
- Integración en pipelines de bioinformática: al cargarse con la interfaz estándar de Transformers (`AutoModel.from_pretrained`), el modelo puede incorporarse a flujos existentes basados en Python y PyTorch, con soporte de ejecución en CUDA.
- Experimentación con condicionamiento por MSA: en entornos de investigación, se puede comparar el plegamiento con y sin MSA para evaluar el impacto del alineamiento en la calidad de la estructura predicha.
- Despliegue en entornos aislados: la documentación menciona la posibilidad de construir un artefacto local con manifiesto fijado para ejecución sin red, adecuado para infraestructuras air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 234,8 M de parámetros, los pesos en float32 ocupan aproximadamente 0,94 GB, y en bf16 alrededor de 0,47 GB, a lo que hay que sumar el consumo del trunk de plegamiento, la difusión y las activaciones intermedias (modulables con `set_chunk_size`).
- GPU recomendadas: la documentación indica que la validación se ejecuta en Docker sobre cualquier dispositivo CUDA compatible, sin exigir un producto de GPU concreto.
- Compatibilidad con GPU de consumo: no se especifica; por el tamaño del checkpoint es plausible en GPUs de consumo con suficiente VRAM, pero no hay confirmación en la información disponible.
- Opciones de despliegue: carga mediante Transformers con `trust_remote_code=True`; el runtime FastPLMs está embebido en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Requisitos de software: Python 3.12-3.14, PyTorch 2.14 y Transformers 5.17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de plegamiento de proteínas.

## Limitaciones y advertencias

- Las cabezas de clasificación de secuencia y de token se inicializan de nuevo y no están entrenadas; sus logits no deben interpretarse como predicciones hasta realizar un fine-tuning específico.
- No se documentan sesgos conocidos del modelo; al tratarse de un modelo de proteínas, los sesgos relevantes estarían en la distribución de entrenamiento, que no se detalla.
- Riesgo de alucinación estructural: no se aportan datos sobre la fiabilidad del modelo en secuencias fuera de distribución; se recomienda usar las métricas de confianza (pTM, pLDDT) como filtro.
- Limitaciones de contexto e idioma: no disponibles; el modelo no procesa lenguaje natural.
- La licencia MIT permite uso comercial, pero debe verificarse la procedencia del checkpoint original (`biohub/ESMFold2`) y las dependencias del runtime FastPLMs.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- El consumo de memoria puede ser elevado en complejos grandes; es necesario ajustar `set_chunk_size` y el número de pasos de difusión.
- La documentación de la model card está generada automáticamente desde `src/fastplms/models.toml` y puede no cubrir todos los detalles de implementación.

## Enlaces

- [Hugging Face: Synthyra/ESMFold2](https://huggingface.co/Synthyra/ESMFold2)
- Checkpoint original: `biohub/ESMFold2` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Requisitos de instalación: https://huggingface.co/Synthyra/ESMFold2/resolve/main/requirements.txt
