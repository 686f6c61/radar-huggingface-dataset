# timm/vit_base_patch16_224.bamboo

## Resumen

El modelo `timm/vit_base_patch16_224.bamboo` es un Vision Transformer ViT-B/16 con parches de 16×16, entrada RGB de 224×224 y una dimensión de características de 768, publicado por timm y convertido a pesos nativos de timm desde la release de los autores de Bamboo. Se entrenó en Bamboo-CLS y conserva el clasificador original de 115.217 clases; no se aplicó fine-tuning ni reescalado de pesos durante la conversión.

Con 174.400.529 parámetros totales, el modelo resuelve clasificación de imágenes dentro de una taxonomía visual muy amplia y también puede emplearse como extractor de características de 768 dimensiones. Es relevante para desarrolladores e investigadores que necesitan evaluar clasificación a gran escala, etiquetado automático o transferencia de aprendizaje con un backbone ViT-B/16, aunque la información disponible no incluye benchmarks, requisitos de hardware ni una licencia clara para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16; parches de 16×16; entrada RGB de 224×224; dimensión de características 768 |
| Parámetros totales | 174.400.529 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; modelo de visión con entrada de 224×224 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; etiquetas en inglés |
| Licencia | No disponible en los metadatos de HuggingFace. Declaraciones upstream: demo CC-BY-4.0 y acceso al dataset académico/no comercial; no constituyen una concesión de licencia nueva para los pesos convertidos |
| Formato de pesos | safetensors; pesos nativos de timm |
| Clases de salida | 115.217 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo ViT-B/16: divide la imagen en parches de 16×16, proyecta cada parche a un espacio de 768 dimensiones y aplica atención transformer sobre la secuencia resultante. El checkpoint conserva el clasificador original de 115.217 clases y se convirtió desde la release de los autores a pesos nativos de timm, eliminando el wrapper del checkpoint y cualquier prefijo `module.`; no se realizó fine-tuning ni reescalado de pesos.

El entrenamiento se llevó a cabo sobre Bamboo-CLS. La model card no detalla el número de imágenes, la composición exacta del dataset, el número de capas o cabezas, ni si hubo técnicas de alineación como RLHF o DPO, algo que no aplica a un clasificador supervisado. La innovación destacable es el clasificador de gran escala y el uso de identificadores de concepto estables: `label_names` asigna el índice del clasificador a un ID de Bamboo, y `label_descriptions` traduce ese ID a nombres o sinónimos en inglés. Los nombres no son únicos y distintos conceptos pueden compartir nombre, por lo que deben conservarse los concept IDs al interpretar predicciones. La fila de fallback 5831 se etiqueta como `Q24760423`.

## Capacidades

- Clasificación de imágenes en 115.217 clases con salida softmax; permite obtener el top-k de predicciones.
- Extracción de características pooled de 768 dimensiones pasando `num_classes=0`.
- Fine-tuning mediante reemplazo del clasificador con `num_classes`, útil para adaptar el backbone a dominios específicos.
- Inferencia con preprocesado específico: resize bicúbico del lado corto a 224, recorte central de 224×224 y normalización CLIP con media `(0.48145466, 0.4578275, 0.40821073)` y desviación `(0.26862954, 0.26130258, 0.27577711)`.
- Acceso a `label_names` y `label_descriptions` para mapear índices del clasificador a conceptos Bamboo y nombres en inglés.
- Uso como backbone visual para tareas descendentes de clasificación, recuperación o agrupación.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.
- No incorpora visión-lenguaje, detección de objetos, segmentación ni descripción textual de imágenes.

## Casos de uso

- Etiquetado automático de imágenes a gran escala: el clasificador de 115.217 clases permite preetiquetar catálogos, archivos multimedia o datasets con una taxonomía visual muy amplia, reduciendo el trabajo manual inicial.
- Búsqueda visual y deduplicación: extrayendo embeddings pooled de 768 dimensiones con `num_classes=0`, se pueden generar índices vectoriales y usar similitud coseno para recuperar imágenes parecidas o detectar duplicados.
- Transferencia de aprendizaje en dominios específicos: sustituyendo el clasificador por uno adaptado al dominio, el backbone ViT-B/16 sirve para clasificación médica, industrial, agrícola o de producto con menos datos que entrenar desde cero.
- Anotación humana asistida: el top-k de predicciones con concept IDs estables permite que anotadores revisen y corrijan sugerencias, manteniendo trazabilidad entre índices del clasificador y conceptos Bamboo.
- Clasificación fine-grained en taxonomías amplias: adecuado para catálogos de productos, patrimonio, especies o categorías visuales muy granulares, siempre que se valide que los conceptos de interés están cubiertos por Bamboo-CLS.
- Investigación en clasificación a gran escala y reproducibilidad: permite reproducir el benchmark de ViT del proyecto Bamboo y comparar el comportamiento de un ViT-B/16 con clasificador de 115.217 clases frente a variantes con menos clases.
- Organización y filtrado de archivos multimedia: clasificar imágenes por conceptos para enrutar, agrupar o priorizar revisiones en pipelines de contenido, con la cautela de validar la precisión en las categorías relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No hay requisitos oficiales de hardware publicados en la información disponible.
- El modelo tiene 174.400.529 parámetros y el repositorio ocupa 0,7 GB. Como estimación teórica solo de pesos: FP32 ≈ 697 MB, FP16 ≈ 349 MB, INT8 ≈ 174 MB; a ello hay que sumar activaciones, overhead del framework y memoria de batch.
- GPU recomendadas: no disponible.
- No se dispone de una lista de GPUs de consumo validadas. Por tamaño de pesos en FP16, el checkpoint es reducido, pero no se confirma el consumo total real ni el rendimiento en GPUs concretas.
- Despliegue: carga mediante timm y PyTorch desde HuggingFace Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; no son herramientas orientadas a este tipo de clasificador visual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a aspectos estructurales y de disponibilidad.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `timm/vit_base_patch16_224.bamboo` | 174,4 M, incluye clasificador de 115.217 clases | No aplica; entrada 224×224 | No disponible | No disponible; declaraciones upstream ambiguas | HuggingFace, timm |
| ViT-B/16 estándar con 1.000 clases (familia timm) | No disponible | No aplica | No disponible | No disponible | timm |
| CLIP ViT-B/16 | No disponible | No aplica | No disponible | No disponible | OpenCLIP, HuggingFace |

## Limitaciones y advertencias

- Licencia ambigua
