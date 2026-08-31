# XiXiHaHaZhao/STAGE1

## Resumen

El modelo `XiXiHaHaZhao/STAGE1` es un ajuste fino (fine-tuning) completo del modelo base Qwen3.5-0.8B, desarrollado por el usuario XiXiHaHaZhao. Está orientado a tareas de visión y lenguaje (image-text-to-text), y ha sido entrenado sobre los datasets AirCopBench1, AirCopBench2, AirCopBench3, AirCopBench4 y O3DVQA, todos ellos relacionados con razonamiento visual en 3D y evaluación de calidad objetiva (probablemente orientados a aplicaciones aéreas o de copiloto). El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors.

La relevancia de este modelo radica en su tamaño compacto, que permite su despliegue en entornos con recursos limitados, y en su especialización en tareas de VQA (visual question answering) sobre datos 3D y benchmarks específicos de aviación. Sin embargo, la documentación disponible es muy escasa: la model card ha sido generada automáticamente y no incluye detalles sobre arquitectura interna, capacidades específicas ni resultados de evaluación. La licencia es "other", lo que exige una revisión cuidadosa antes de su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3.5-0.8B, multimodal imagen-texto) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del modelo Qwen3.5-0.8B, realizado con el framework llama-factory. Se trata de un modelo multimodal que procesa entradas de imagen y texto, aunque no se han publicado detalles sobre la arquitectura interna (número de capas, dimensiones de atención, mecanismos de visión, etc.). El entrenamiento se realizó sobre cinco datasets: AirCopBench1, AirCopBench2, AirCopBench3, AirCopBench4 y O3DVQA, todos ellos relacionados con razonamiento visual en 3D y evaluación de calidad objetiva.

Los hiperparámetros de entrenamiento documentados incluyen una tasa de aprendizaje de 1e-5, batch size total de 64 (con acumulación de gradientes), scheduler de tipo coseno con warmup del 10% y una sola época. Se utilizó el optimizador AdamW (variante torch fused) y entrenamiento distribuido con 4 GPUs. No se especifica el número total de tokens de entrenamiento ni la composición detallada de los datasets. Tampoco se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Procesamiento de entradas multimodales (imagen y texto) para tareas de pregunta-respuesta visual (VQA).
- Especialización en benchmarks de razonamiento 3D y evaluación de calidad objetiva (AirCopBench, O3DVQA).
- Generación de texto en respuesta a estímulos visuales.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se han publicado capacidades multilingües; el idioma de entrenamiento no está especificado.

## Casos de uso

- Análisis de imágenes aéreas o de drones: el modelo podría utilizarse para responder preguntas sobre imágenes capturadas desde plataformas aéreas, aprovechando su entrenamiento en datasets como AirCopBench, aunque no hay evidencia pública de su rendimiento real.
- Evaluación de calidad visual objetiva: gracias al dataset O3DVQA, el modelo podría emplearse para puntuar la calidad de imágenes 3D o estereoscópicas, aunque no se han publicado métricas de validación.
- Prototipos de asistentes visuales en entornos con restricciones de hardware: su tamaño reducido (0,85B parámetros) permite ejecutarlo en GPUs de consumo medio, lo que facilita la experimentación en laboratorios sin infraestructura de alto rendimiento.
- Investigación académica en fine-tuning de modelos pequeños para tareas específicas de visión: sirve como ejemplo de ajuste completo sobre un modelo base compacto con datasets especializados.
- Desarrollo de sistemas de documentación automática a partir de imágenes técnicas: el modelo puede generar descripciones textuales de imágenes, aunque su especialización limita su generalización a dominios fuera de los datasets de entrenamiento.
- Pruebas de integración en pipelines de inferencia multimodal con transformers: al ser un modelo estándar de la librería transformers, puede integrarse fácilmente en flujos existentes de procesamiento de imágenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una entrada en el model-index con el nombre `qwen3vl_stage1_aircopbench_o3dvqa`, pero el campo `results` está vacío. No hay datos numéricos de MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852M parámetros, en precisión fp16 se necesitan aproximadamente 1,7 GB de VRAM; en fp32 serían unos 3,4 GB. Sin embargo, el repositorio ocupa 11,1 GB, lo que sugiere que puede incluir pesos en fp32 u otros archivos adicionales (optimizer states, etc.). No se ofrecen cuantizaciones precalculadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) podría ejecutar el modelo en fp16. Para mayor comodidad, una RTX 3060 de 12 GB o superior es suficiente.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con el pipeline de transformers. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 0,85B en una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero esto depende del hardware y la optimización.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo base Qwen3.5-0.8B no es ampliamente conocido en la literatura pública, y no se dispone de datos de rendimiento para comparar con alternativas como Qwen2-VL-0.5B, LLaVA-1.5-0.5B u otros modelos multimodales pequeños.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos, alucinaciones o comportamiento en dominios fuera de los datasets de entrenamiento.
- El modelo está entrenado únicamente sobre cinco datasets especializados (AirCopBench1-4 y O3DVQA), por lo que su capacidad de generalización a imágenes y textos generales es desconocida y probablemente limitada.
- La licencia "other" es ambigua: es imprescindible revisar los términos exactos antes de cualquier uso comercial o redistribución.
- La documentación es insuficiente: no se especifican la arquitectura interna, el idioma de entrenamiento, la longitud de contexto ni los detalles del dataset (tamaño, composición, licencia).
- El repositorio no incluye archivos de cuantización ni instrucciones claras de uso, lo que puede dificultar su adopción en producción.
- No hay resultados de benchmarks publicados, por lo que no se puede verificar su rendimiento real en las tareas para las que fue entrenado.

## Enlaces

- [HuggingFace: XiXiHaHaZhao/STAGE1](https://huggingface.co/XiXiHaHaZhao/STAGE1)

Nota: los resultados de búsqueda web mostraron otros modelos llamados "stage1" (por ejemplo, `stage1/model` o `Flexislm 7b Stage1`), pero no están relacionados con este repositorio.
