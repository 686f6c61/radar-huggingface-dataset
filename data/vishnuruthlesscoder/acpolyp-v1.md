# VishnuRuthlessCoder/acpolyp-v1

## Resumen

acpolyp-v1 es un modelo de clasificación de imágenes médicas desarrollado por el usuario VishnuRuthlessCoder y publicado en HuggingFace bajo acceso restringido. Está construido sobre la librería `timm` (PyTorch Image Models) y se distribuye en formato safetensors con un total de 27.874.280 parámetros, lo que lo sitúa en la categoría de modelos de visión de tamano pequeno-medio, adecuado para despliegue en hardware modesto. Su dominio de aplicación es la endoscopia digestiva, concretamente la detección y clasificación de pólipos en el dataset Kvasir.

El modelo se enmarca en la investigación aplicada a imagen médica y lleva etiquetas explícitas de `research-only` y `not-a-medical-device`, lo que delimita claramente su ámbito de uso: experimentación académica y educativa, nunca diagnóstico clínico ni toma de decisiones médicas. La licencia es de tipo `research-and-education-only`, lo que restringe el uso comercial.

Su relevancia actual radica en el creciente interés por modelos de visión especializados en dominios médicos concretos, donde los modelos generalistas suelen tener dificultades por la naturaleza de las imágenes (baja textura, iluminación variable, artefactos endoscópicos). No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en la información disponible, por lo que debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (construido sobre `timm`, probablemente CNN o ViT) |
| Parámetros totales | 27.874.280 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | research-and-education-only |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura concreta más allá de que el modelo se ha construido con la librería `timm`. Dado el número de parámetros (aproximadamente 27,9 M), es compatible con arquitecturas de visión de tamano compacto, como variantes de ResNet, EfficientNet o Vision Transformers pequeños, pero no se especifica cuál. Tampoco se indica el esquema de entrenamiento, el número de épocas, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización.

El dominio declarado es la imagen endoscópica y el dataset Kvasir, un conjunto público de imágenes gastrointestinales ampliamente utilizado en investigación. No se han publicado detalles sobre el proceso de entrenamiento, la partición train/val/test ni las métricas obtenidas, por lo que no es posible evaluar la calidad del ajuste ni el riesgo de sobreajuste.

## Capacidades

- Clasificación de imágenes endoscópicas: el modelo está orientado a la tarea de `image-classification`, presumiblemente para distinguir entre presencia y ausencia de pólipos o entre distintas clases de lesiones.
- Procesamiento de imágenes médicas del tracto gastrointestinal: entrenado sobre el dominio Kvasir, adecuado para imágenes de colonoscopia y endoscopia digestiva.
- Integración con el ecosistema `timm`: puede cargarse mediante las utilidades de PyTorch Image Models, lo que facilita su uso en pipelines de investigación existentes.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No se documentan capacidades especiales adicionales (visión multimodal, audio, thinking mode) en la información disponible.

## Casos de uso

- Investigación en detección de pólipos: el modelo puede emplearse como baseline en estudios académicos que comparen arquitecturas de clasificación sobre el dataset Kvasir, aprovechando su integración con `timm` para experimentos reproducibles.
- Docencia en imagen médica: útil en asignaturas o talleres donde se explique el entrenamiento y evaluación de clasificadores de imágenes endoscópicas, dado su tamano reducido y su licencia educativa.
- Prototipado de pipelines de visión médica: sirve como componente inicial en un sistema de análisis de imágenes endoscópicas antes de sustituirlo por un modelo validado clínicamente.
- Evaluación comparativa de modelos de visión en dominios médicos: puede incluirse en estudios que midan la transferibilidad de arquitecturas `timm` a imágenes gastrointestinales.
- Análisis de sesgos y robustez: su naturaleza de modelo pequeño permite estudiar cómo afectan variaciones de iluminación, artefactos y calidad de imagen a la clasificación de pólipos.
- Generación de datasets sintéticos o aumentados: puede utilizarse como clasificador auxiliar para filtrar o etiquetar imágenes en la construcción de nuevos conjuntos de datos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,9 M de parámetros en precisión FP32, el modelo ocupa aproximadamente 112 MB; en FP16, unos 56 MB. La VRAM adicional depende del tamano de lote y de la resolución de entrada, pero en cualquier caso es inferior a 1 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter como A100 o H100 (sobredimensionadas para este modelo).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al estar basado en `timm`, puede ejecutarse con PyTorch nativo, TorchScript, ONNX Runtime o exportarse a TensorRT. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la resolución de entrada y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de la categoría, podrían considerarse clasificadores de imagen médica entrenados sobre Kvasir con arquitecturas `timm` (ResNet, EfficientNet, ViT), pero no se han encontrado datos concretos de parámetros, contexto o rendimiento de alternativas específicas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| acpolyp-v1 | 27,9 M | no aplica | research-and-education-only | HuggingFace (gated) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo explícitamente marcado como `not-a-medical-device`: no debe utilizarse para diagnóstico, cribado ni ninguna decisión clínica.
- Licencia `research-and-education-only`: el uso comercial está restringido; es necesario revisar los términos completos en HuggingFace antes de cualquier aplicación.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad inmediata.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en el dataset Kvasir ni en conjuntos externos.
- Cero descargas y cero likes: no hay validación comunitaria ni informes de terceros sobre su comportamiento.
- Riesgo de sobreajuste al dominio Kvasir: al no documentarse el entrenamiento, no puede descartarse una generalización pobre a imágenes de otros centros, dispositivos o poblaciones.
- Sesgos potenciales: los datasets médicos públicos suelen estar sesgados hacia determinadas demografías, equipos endoscópicos y protocolos de captura; no se documenta ningún análisis de sesgo.
- Limitaciones de idioma: al ser un modelo de visión, no procesa texto; la ausencia de idiomas declarados es coherente con su naturaleza.
- Sin información sobre calibración, umbrales de decisión ni métricas de sensibilidad/especificidad, imprescindibles en cualquier evaluación médica seria.

## Enlaces

- HuggingFace: https://huggingface.co/VishnuRuthlessCoder/acpolyp-v1
- Dataset Kvasir (referencia del dominio, no enlazado en la información proporcionada): no disponible
- Paper o blog del modelo: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
