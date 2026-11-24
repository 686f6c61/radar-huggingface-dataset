# voicort/sn92-generalist-r2-f

## Resumen

sn92-generalist-r2-f es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario voicort en Hugging Face. Se trata de un modelo de 31.273.088.876 parámetros (~31,3 mil millones) orientado a tareas de clasificación de texto y toma de decisiones, construido sobre la arquitectura Gemma 4 según los tags del repositorio. El pipeline declarado es text-classification, aunque los tags también incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatible con la librería transformers. El repositorio ocupa 62,6 GB y está sujeto a acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. Fue creado y actualizado el 23 de noviembre de 2026, y en el momento de redactar esta ficha no registra descargas ni interacciones.

La relevancia de este modelo radica en su especialización declarada como "decision-model" y "reax" (etiquetas del autor), lo que apunta a un uso en sistemas de decisión automatizada más que en generación de texto generalista. No obstante, la ausencia de documentación técnica publicada, de model card detallada y de resultados de benchmarks limita considerablemente la evaluación objetiva de su rendimiento frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (según tags del repositorio; detalles no disponibles) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MachinePulseAI/karpo-decision-31B, que a su vez emplea la arquitectura Gemma 4 según los tags del repositorio. Se trata por tanto de un transformer decoder-only de aproximadamente 31,3 mil millones de parámetros. Los tags incluyen image-text-to-text, lo que indica que el modelo base incorpora capacidades de entrada multimodal (imagen y texto), aunque la pipeline declarada para este fine-tune es text-classification.

No se dispone de información sobre el proceso de entrenamiento del fine-tune: no se especifican el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las que pueda aportar la arquitectura Gemma 4 subyacente, cuyos detalles no se detallan en la información disponible.

## Capacidades

- Clasificación de texto: pipeline principal declarada (text-classification), orientada a tareas de categorización y etiquetado.
- Toma de decisiones: los tags "decision-model" y "reax" sugieren un uso especializado en sistemas de decisión automatizada.
- Procesamiento image-text-to-text: capacidad heredada del modelo base según los tags, aunque no se documenta su alcance en este fine-tune.
- Generación de texto: implícita en la arquitectura transformer del modelo base, aunque no se declara como capacidad principal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): solo se insinúa visión por el tag image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificación automática de documentos: el modelo puede emplearse para etiquetar textos en pipelines de procesamiento documental, aprovechando su pipeline declarada de text-classification y su tamaño de 31,3 B para capturar matices semánticos complejos.
- Moderación de contenido: uso como clasificador de contenido en plataformas, categorizando textos según políticas predefinidas mediante ajuste adicional o prompting estructurado.
- Sistemas de decisión en entornos empresariales: los tags "decision-model" y "reax" apuntan a su uso en motores de decisión que requieren evaluar entradas textuales y emitir una categoría o veredicto.
- Enrutamiento de tickets de soporte: clasificación de consultas entrantes en categorías para su derivación automática a los equipos correspondientes, aprovechando la ventana de contexto del modelo base (no documentada).
- Análisis de sentimiento y opinión: categorización de reseñas o comentarios en clases de polaridad, con la ventaja de un modelo de gran tamaño para captar ironía y contexto.
- Procesamiento multimodal de documentos escaneados: si se confirma la capacidad image-text-to-text, podría clasificar documentos que combinan texto e imágenes (facturas, formularios) en una sola pasada.
- Extracción de señales para pipelines de datos: uso como clasificador intermedio que etiqueta grandes volúmenes de texto antes de pasarlos a modelos generativos o bases de datos vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en cuantización INT8: alrededor de 31-35 GB, viable en una A100 40 GB o H100 40 GB con margen limitado.
- VRAM estimada en cuantización INT4: alrededor de 16-20 GB, potencialmente viable en una RTX 4090 (24 GB) con contexto reducido, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; A100 40 GB o L40S para INT8; RTX 4090/RTX 6000 Ada para INT4 con limitaciones.
- Cabe en GPU consumer: solo en cuantizaciones agresivas (INT4) y con contexto limitado; no en FP16.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados por el autor, aunque la arquitectura Gemma suele tener soporte en vLLM y llama.cpp para variantes convertidas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| voicort/sn92-generalist-r2-f | ~31,3 B | no disponible | Apache 2.0 | Gated en HF | Fine-tune de clasificación sobre Gemma 4; sin benchmarks publicados |
| MachinePulseAI/karpo-decision-31B | ~31 B (presumible) | no disponible | no disponible | HF (modelo base) | Modelo base del que deriva; sin datos verificados en esta ficha |
| Gemma 2 27B (Google) | 27 B | 8K tokens | Gemma License | Abierto en HF | Alternativa consolidada de tamaño similar, con benchmarks públicos y amplio soporte de herramientas |
| Qwen2.5 32B (Alibaba) | 32,5 B | 128K tokens | Apache 2.0 | Abierto en HF | Contexto muy superior y licencia permisiva; ecosistema maduro |

La comparación con Gemma 2 27B y Qwen2.5 32B se ofrece como referencia de categoría (modelos densos de ~30 B), no como equivalencia funcional: sn92-generalist-r2-f está especializado en clasificación y decisión, mientras que los otros son modelos generativos generalistas.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones conocidas.
- Sin benchmarks publicados: imposible verificar su rendimiento frente a alternativas; no se recomienda su adopción en producción sin evaluación propia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede añadir fricción en despliegues automatizados.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del inglés; riesgo de degradación en usos multilingües.
- Longitud de contexto no documentada: limita la planificación de aplicaciones con documentos largos.
- Riesgo de alucinación: inherente a los modelos transformer de este tamaño, especialmente si se usa fuera de su tarea de clasificación para la que fue ajustado.
- Sesgos: no documentados; al desconocerse el dataset de ajuste, no puede evaluarse el sesgo de dominio ni demográfico.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el modelo base (MachinePulseAI/karpo-decision-31B) no imponga restricciones adicionales que prevalezcan.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requiere conversión manual (GGUF, AWQ, GPTQ) y validación posterior.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-f
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Paper, blog, repositorio o demo adicionales: no disponible
