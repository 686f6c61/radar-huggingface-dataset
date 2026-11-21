# wonderland21127/REAX-G2-Distill-v3

## Resumen

REAX-G2-Distill-v3 es un modelo de 31.273.086.512 parámetros (aproximadamente 31,3 mil millones) publicado por el usuario wonderland21127 en Hugging Face. Se distribuye como un fine-tune del modelo tattrongvu/Jeffan-31b-1710 y está etiquetado con la arquitectura "gemma4", lo que sugiere que la familia base deriva de la línea Gemma de Google, aunque el dato no se confirma en la información disponible. El repositorio declara la pipeline de text-classification, si bien las etiquetas incluyen image-text-to-text y decision-making, lo que apunta a un uso previsto orientado a tareas de decisión y clasificación multimodal.

El modelo se presenta como un "distill" (destilado) de la versión v3 de una serie REAX-G2, con etiquetas específicas de decision-making y multiple-choice. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 62,6 GB en safetensors, lo que es coherente con un modelo de 31,3 mil millones de parámetros en precisión de 16 bits.

La relevancia actual del modelo es limitada por su escasa tracción (0 descargas y 0 likes en el momento de la consulta) y por la ausencia de documentación técnica publicada. No obstante, su tamaño y su orientación a la toma de decisiones y a la clasificación lo sitúan en la categoría de modelos medianos-grandes aptos para despliegues con requisitos de razonamiento estructurado, siempre que se valide su comportamiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma4 (según etiqueta del repo; no confirmado en documentación) |
| Parámetros totales | 31.273.086.512 (31,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | tattrongvu/Jeffan-31b-1710 |
| Pipeline declarada | text-classification |
| Tamaño del repositorio | 62,6 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta "gemma4" y de la referencia al modelo base tattrongvu/Jeffan-31b-1710. Por el recuento de parámetros (31,3 B) y el tamaño del repositorio (62,6 GB), se deduce un modelo denso en precisión de 16 bits, sin indicios de mezcla de expertos. No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o destilación supervisada, pese a que el nombre del modelo incluye "Distill".

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La información disponible se limita a metadatos de Hugging Face: etiquetas de decision-making y multiple-choice, pipeline de clasificación de texto y una base declarada. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Clasificación de texto: la pipeline declarada es text-classification, por lo que el modelo está orientado a asignar etiquetas a entradas textuales.
- Toma de decisiones (decision-making): etiqueta explícita del repositorio, orientada a tareas de selección entre opciones.
- Preguntas de opción múltiple (multiple-choice): etiqueta explícita, coherente con el uso en evaluaciones tipo MMLU o similares.
- Procesamiento image-text-to-text: etiqueta presente en el repositorio, lo que sugiere capacidades multimodales de entrada imagen y texto, aunque no se detalla su alcance.
- Generación de texto: no confirmada explícitamente; el pipeline declarado es de clasificación, no de generación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio: solo la etiqueta image-text-to-text sugiere visión; no hay confirmación de modo thinking ni audio.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías a incidencias entrantes en un sistema de helpdesk, aprovechando su pipeline de text-classification y su tamaño para captar matices en textos largos.
- Enrutamiento de decisiones en pipelines de negocio: con la etiqueta decision-making, puede emplearse para seleccionar la acción o el departamento adecuado ante una solicitud, siempre que se valide su precisión con datos propios.
- Evaluación de opción múltiple en entornos educativos: su etiqueta multiple-choice lo hace candidato para corregir o generar respuestas en cuestionarios, aunque requiere validación previa por la falta de benchmarks publicados.
- Moderación de contenido asistida: clasificación de textos según políticas internas, con revisión humana dado el riesgo de sesgos no documentados.
- Análisis de documentos con imagen y texto: la etiqueta image-text-to-text permite explorar su uso en la clasificación de capturas, formularios escaneados o páginas mixtas, previa verificación empírica de que la modalidad visual funciona.
- Filtrado previo en pipelines RAG: usar el modelo como clasificador de relevancia o de intención antes de invocar un modelo generador mayor, reduciendo coste y latencia.
- Investigación sobre destilación: al declararse como "Distill" de una serie, puede servir como objeto de estudio para comparar el comportamiento de un modelo destilado frente a su base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 62,6 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica se requieren GPU con 80 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: solo en cuantización agresiva (4 bits) y con margen ajustado; no se garantiza compatibilidad sin probar.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| REAX-G2-Distill-v3 | 31,3 B | no disponible | Apache 2.0 | gated | Sin benchmarks ni documentación |
| Gemma 2 27B (referencia de familia) | 27 B | 8K (típico) | Gemma license | abierto | Familia citada por la etiqueta "gemma4"; datos no confirmados para este modelo |
| Qwen2.5 32B | 32,5 B | 128K | Apache 2.0 | abierto | Alternativa densa de tamaño comparable con benchmarks públicos |
| Mistral Small 24B | 24 B | 128K | Apache 2.0 | abierto | Alternativa algo menor, con documentación y evaluaciones publicadas |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo REAX-G2-Distill-v3, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación técnica: no es posible evaluar su calidad frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la automatización de descargas y la reproducibilidad.
- Tracción nula (0 descargas, 0 likes): no hay evidencia de uso en producción ni de validación por la comunidad.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del inglés.
- Contexto no declarado: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a modelos de este tamaño, agravado por la falta de evaluación publicada.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible anticipar sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated y la falta de garantías técnicas desaconsejan su uso en producción sin una validación exhaustiva.
- La etiqueta "gemma4" no confirma que la arquitectura sea realmente de la familia Gemma; conviene verificar la configuración del modelo antes de asumir compatibilidades.

## Enlaces

- Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-Distill-v3
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
