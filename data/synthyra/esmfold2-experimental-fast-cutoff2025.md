# Synthyra/ESMFold2-Experimental-Fast-Cutoff2025

## Resumen

`Synthyra/ESMFold2-Experimental-Fast-Cutoff2025` es un checkpoint experimental de ESMFold2, el sucesor de ESMFold desarrollado por Biohub, empaquetado por Synthyra con el runtime FastPLMs para Hugging Face Transformers. El modelo predice estructuras tridimensionales de proteínas y complejos moleculares directamente a partir de secuencias de aminoácidos, sin necesidad de alineamientos múltiples (MSA). Esta variante "Fast" está optimizada para inferencia de secuencia única, con 24 bloques de transformador y 179,3 millones de parámetros, lo que la hace más ligera que el ESMFold2 completo.

El modelo se distribuye bajo licencia MIT y acepta secuencias crudas o especificaciones tipadas de complejos moleculares. Incluye clases de clasificación de secuencia y de tokens que reutilizan el backbone preentrenado, aunque sus cabezas de tarea se inicializan desde cero y requieren fine-tuning antes de su uso. La carga se realiza mediante `trust_remote_code=True`, y el artefacto exige un entorno CUDA, con el NVIDIA GH200 en Linux aarch64 como plataforma de validación oficial.

La relevancia de este modelo radica en su capacidad para generar estructuras de alta resolución con un coste computacional reducido, lo que lo hace adecuado para pipelines de predicción de estructura a gran escala, diseño de proteínas y anotación funcional. Su licencia permisiva y su integración con el ecosistema Transformers facilitan su adopción tanto en investigación como en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (24 bloques), basada en ESMFold2 |
| Parametros totales | 179.303.900 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de proteínas, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESMFold2, un transformador de proteínas que combina un codificador de lenguaje de proteínas con un módulo de plegamiento por difusión. Esta variante "Fast" utiliza 24 bloques y está específicamente entrenada para inferencia de secuencia única, sin condicionamiento por MSA. Según la documentación, el checkpoint fue entrenado sin MSA y rechaza entradas que incluyan alineamientos, lo que reduce la complejidad computacional en comparación con el ESMFold2 completo.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card menciona que el backbone preentrenado se combina con una "mezcla de estados pLM y proyección" para las tareas de clasificación, seguida de una sonda transformadora entrenable. El modelo admite backends de atención `eager`, `sdpa` y `flex_attention`, con `sdpa` como opción por defecto.

## Capacidades

- Predicción de estructura 3D de proteínas de secuencia única, devolviendo coordenadas atómicas y métricas de confianza (pTM, pLDDT).
- Generación de archivos PDB y mmCIF a partir de los resultados de plegamiento.
- Soporte de complejos moleculares multicanales y multimolécula, siempre que cada cadena proteica use `msa=None`.
- Clasificación de secuencias completas (etiquetas a nivel de secuencia) mediante `AutoModelForSequenceClassification`.
- Clasificación de residuos (etiquetas a nivel de token) mediante `AutoModelForTokenClassification`, con enmascaramiento de posiciones no biológicas.
- Fine-tuning con PEFT/LoRA, con soporte para módulos lineales y cabezas de clasificación personalizadas.
- Acepta secuencias de aminoácidos crudas o especificaciones tipadas de complejos moleculares; el forward de bajo nivel admite tensores de features preparados.
- No soporta tool calling, agentes ni capacidades multimodales (visión, audio).

## Casos de uso

- Predicción de estructura de proteínas sin MSA: dada una secuencia de aminoácidos, el modelo genera una estructura 3D completa en formato PDB o CIF, útil para anotación funcional y estudios de relación estructura-función.
- Diseño de proteínas de novo: al no requerir MSA, puede integrarse en bucles de diseño generativo donde se exploran múltiples secuencias candidatas de forma rápida.
- Filtrado de variantes: comparando las estructuras predichas de variantes de una proteína, se pueden identificar mutaciones que alteran la estabilidad o el plegamiento.
- Clasificación de funciones proteicas: tras fine-tuning de la cabeza de clasificación, el modelo puede asignar categorías funcionales a secuencias completas, por ejemplo en pipelines de anotación de genomas.
- Anotación de residuos funcionales: con la cabeza de token classification, se pueden marcar residuos implicados en sitios activos o de unión, tras entrenamiento con datos etiquetados.
- Generación de complejos proteína-proteína: el modelo acepta complejos multicanales (con `msa=None`), permitiendo predecir estructuras de dímeros o heterocomplejos para estudios de interacción.
- Integración en pipelines de alto rendimiento: gracias a su tamaño reducido y la ausencia de MSA, puede ejecutarse en lotes grandes sobre GPU, adecuado para cribados de librerías de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo de proteínas), ni de comparaciones cuantitativas con otros predictores de estructura como AlphaFold2 o ESMFold original.

## Requisitos de hardware

- El modelo requiere una GPU con soporte CUDA; el entorno validado es NVIDIA GH200 en Linux aarch64.
- No se proporcionan estimaciones de VRAM, latencia o throughput en la documentación disponible.
- Dado su tamaño (179 M parámetros, 0,7 GB en safetensors), es plausible que quepa en GPUs de consumo como RTX 3090/4090, pero no hay evidencia oficial de soporte en esas plataformas.
- No se garantiza el funcionamiento en CPU-only, Windows o macOS para tareas de estructura; la documentación indica que esos entornos no forman parte del contrato de lanzamiento.
- Opciones de despliegue: el modelo se carga mediante Transformers con `trust_remote_code=True`; no se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas como ESMFold completo, AlphaFold2 o ESM-2. La variante "Fast" se diferencia del ESMFold2 estándar por su menor número de bloques (24) y la ausencia de condicionamiento MSA, lo que reduce el coste computacional a costa de perder la capacidad de usar información evolutiva. No hay datos de rendimiento relativos publicados.

## Limitaciones y advertencias

- El modelo está optimizado para secuencia única y rechaza entradas con MSA; para tareas que requieran alineamientos, debe usarse el checkpoint ESMFold2 completo.
- Las cabezas de clasificación (secuencia y token) están inicializadas aleatoriamente y no producen predicciones significativas sin fine-tuning previo.
- El soporte de plataformas es limitado: solo se ha validado en NVIDIA GH200 con Linux aarch64; otros entornos pueden fallar o dar resultados no reproducibles.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de proteínas, puede presentar sesgos hacia familias proteicas sobrerrepresentadas en el conjunto de entrenamiento.
- Riesgo de alucinación en estructuras: como cualquier modelo generativo, puede producir conformaciones plausibles pero incorrectas, especialmente en regiones de baja confianza (pLDDT bajo).
- La licencia MIT permite uso comercial, pero el código remoto (`trust_remote_code=True`) requiere una auditoría de seguridad antes de su despliegue en producción.
- No hay información sobre la longitud máxima de secuencia soportada ni sobre el comportamiento con secuencias muy largas.

## Enlaces

- [HuggingFace: Synthyra/ESMFold2-Experimental-Fast-Cutoff2025](https://huggingface.co/Synthyra/ESMFold2-Experimental-Fast-Cutoff2025)
- [GitHub: FastPLMs model card](https://github.com/Synthyra/FastPLMs/blob/main/model_cards/esmfold2_experimental_fast_cutoff2025.md)
- [Biohub: ESMFold2 Protein Structure Prediction](https://www.biohub.ai/models/esmfold2)
- [ESMFold2: guía y herramientas](https://esmfold2.com/)
