# yunusserhat/palmcity-eomt-dinov3-large-v2

## Resumen

PalmCity EoMT DINOv3 Large v2 es un conjunto de cuatro modelos de segmentación semántica de imágenes de vista de calle (street-view) desarrollado por Yunus Serhat Bıçakçı para la competición PalmCity. Cada miembro del conjunto es un fine-tuning del modelo `tue-mps/eomt-dinov3-ade-semantic-large-512`, que combina el encoder de visión DINOv3 ViT-L/16 con el decodificador ligero EoMT (Encoder-only Mask Transformer). El paquete se publica como un ensemble de cuatro checkpoints que se combinan por media de probabilidades con test-time augmentation multi-escala y flip horizontal.

El modelo resuelve el problema de la segmentación semántica densa en panorámicas urbanas de relación de aspecto 2:1, con 32 clases de la taxonomía PalmCity (incluida la clase Void). Su relevancia inmediata es doble: por un lado, documenta una receta reproducible que alcanzó el primer puesto en el snapshot del leaderboard del 30 de octubre de 2026 con 61,54 % de mIoU y 71,93 % de F1 macro; por otro, se distribuye en formato nativo de Transformers, sin código remoto, lo que facilita su integración en pipelines de percepción urbana.

Cada uno de los cuatro checkpoints ronda los 315 millones de parámetros y ocupa 1,26 GB en float32, lo que da un repositorio total de aproximadamente 5 GB. El contexto no es textual sino visual: la resolución de entrada varía entre 768×1536 y 896×1792 píxeles según el miembro del ensemble.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EoMT (Encoder-only Mask Transformer) con encoder DINOv3 ViT-L/16 |
| Parámetros totales | ~315 M por miembro (4 miembros en el ensemble) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (visión); entrada de 768×1536 o 896×1792 píxeles |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | en (metadatos de la model card; la tarea es visión) |
| Licencia | dinov3-license (license: other) |
| Formato de pesos | safetensors (float32), con config.json nativo de Transformers |

## Arquitectura y entrenamiento

Cada miembro del ensemble es un EoMT con backbone DINOv3 ViT-L/16, un transformer de visión con parches de 16×16 y aproximadamente 300 M de parámetros en el encoder. EoMT sustituye el decodificador clásico de Mask Transformer por un esquema encoder-only en el que un conjunto de queries de clase se procesa dentro del propio encoder y se proyecta directamente a máscaras y logits de clase. El modelo parte de los pesos de `tue-mps/eomt-dinov3-ade-semantic-large-512`, preentrenado en ADE20K, y se ajusta de forma supervisada sobre el split oficial de PalmCity.

El entrenamiento se realizó sobre las 497 imágenes de entrenamiento y 84 de validación del split oficial de PalmCity. Tres miembros usan entradas de 768×1536 píxeles con semillas 42, 123 y 2026; el cuarto usa 896×1792 con semilla 42. La inferencia del sistema medido combina los cuatro modelos con media de probabilidades y seis vistas por modelo (escalas 1, 0, 1,25 y 1,5 del tamaño de entrada, con y sin flip horizontal). Los pesos se publican copiados tensor a tensor desde los checkpoints entrenados, sin estados de optimizador ni estados de RNG. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación, algo esperable en un modelo de segmentación.

## Capacidades

- Segmentación semántica densa de imágenes panorámicas de vista de calle con 32 clases de la taxonomía PalmCity, incluida la clase Void (ID 31).
- Predicción a resolución nativa de la imagen de entrada: las máscaras de salida preservan las dimensiones en píxeles del input.
- Salida en formato de IDs de clase en escala de grises (0 a 31) y visualización RGB opcional.
- Ensemble configurable en tres modos de inferencia: `fast` (un miembro sin TTA), `single-tta` (un miembro con seis vistas) y `challenge` (cuatro miembros con seis vistas cada uno).
- Carga nativa mediante `EomtDinov3ForUniversalSegmentation` de Transformers, sin `trust_remote_code`.
- Procesamiento por lotes de directorios completos de imágenes, con la restricción de nombres de fichero únicos.
- Inferencia en GPU (CUDA) y en CPU (`--device cpu --no-amp`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.

## Casos de uso

- Mapeo de aceras y calzada para planificación urbana: el modelo segmenta clases viarias en panorámicas 2:1 y permite generar cartografía de accesibilidad a partir de capturas de street-view, aprovechando que preserva la resolución original de cada imagen.
- Auditoría de infraestructura peatonal: integrado en un pipeline por lotes sobre directorios de panorámicas, produce máscaras de clase que se cruzan con datos GIS para detectar tramos sin acera o con obstáculos.
- Análisis de vegetación y mobiliario urbano: las 32 clases permiten cuantificar superficie de arbolado, señales y mobiliario por calle, útil para inventarios municipales automatizados.
- Etiquetado asistido para nuevos datasets: el modo `challenge` genera predicciones de alta calidad (61,54 % mIoU en test oculto) que pueden servir como pre-etiquetado y reducir el coste de anotación humana en nuevos dominios urbanos.
- Vehículos autónomos y ADAS en fase de investigación: la segmentación de vista de calle con backbone DINOv3 ViT-L/16 es adecuada para experimentos de percepción semántica en entornos urbanos, aunque no está validada para producción safety-critical.
- Monitorización de cambios urbanos: al ejecutar el modelo sobre capturas de la misma calle en fechas distintas y comparar máscaras por clase, se detectan obras, nuevas zonas verdes o cambios de mobiliario.
- Benchmarking de segmentación: el paquete sirve como referencia reproducible (receta, semillas y TTA documentadas) para comparar futuros modelos en la taxonomía PalmCity.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| PalmCity hidden challenge test (249 imágenes) | mIoU oficial sobre 32 clases | 61,538191 |
| PalmCity hidden challenge test (249 imágenes) | F1 macro oficial sobre 32 clases | 71,926557 |

El autor indica que estos resultados corresponden al envío 1020616 y situaron al sistema en primer lugar entre cinco participantes en el snapshot del leaderboard del 30 de octubre de 2026, sin que ello constituya una victoria final de competición. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para un miembro en float32: en torno a 1,5-2 GB solo para pesos, más activaciones; con entradas de 896×1792 y TTA de seis vistas, el consumo crece de forma notable por los mapas de probabilidad (el modo `challenge` eleva el límite a 4 000 000 de píxeles para la vista mayor).
- VRAM estimada para el ensemble completo en modo `challenge`: no disponible con cifras medidas; requiere cargar cuatro modelos de ~1,26 GB y mantener mapas de probabilidad agregados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos 8-12 GB de VRAM debería poder ejecutar un miembro en modo `fast`; el ensemble completo conviene en GPUs de 24 GB o superiores (RTX 3090/4090, A100, H100), aunque esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: sí para modos `fast` y `single-tta`; el modo `challenge` es el más exigente y no hay cifras publicadas de VRAM pico.
- Despliegue: Transformers nativo (`EomtDinov3ForUniversalSegmentation`), scripts del repositorio `palmcity_challenge` (`scripts/run.sh`, módulo `palmcity.hub`), inferencia offline con `HF_HUB_OFFLINE=0` y `--revision` para fijar versiones. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | mIoU (PalmCity test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PalmCity EoMT DINOv3 Large v2 (este) | ~315 M por miembro, 4 miembros | 768×1536 / 896×1792 | 61,54 | dinov3-license | HuggingFace, Transformers nativo |
| tue-mps/eomt-dinov3-ade-semantic-large-512 (base) | ~315 M | 512×512 (ADE20K) | no disponible en PalmCity | no disponible | HuggingFace |
| yunusserhat/palmcity-eomt-dinov3-large (primera etapa) | ~315 M por miembro, 3 miembros | no disponible | no disponible | dinov3-license | HuggingFace |

No se dispone en la información proporcionada de resultados de otros participantes en el leaderboard ni de alternativas comparables (por ejemplo, Mask2Former o SegFormer) evaluadas sobre la taxonomía PalmCity, por lo que la comparación cuantitativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al entrenarse solo con imágenes de PalmCity, el modelo puede generalizar mal a ciudades, países o condiciones de iluminación no representadas en ese dataset.
- Alucinación: en segmentación se traduce en falsos positivos de clase y confusiones entre clases visualmente próximas; el mIoU de 61,54 % implica un margen de error considerable en clases minoritarias.
- Contexto y formato: la entrada debe tener relación de aspecto 2:1 (por ejemplo, 1024×512); no se aceptan otras proporciones sin recorte o redimensionado previo.
- Idioma: los metadatos declaran solo inglés, aunque la tarea es visual y no lingüística.
- Licencia: `dinov3-license` (license: other). Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, ya que las condiciones de DINOv3 pueden imponer restricciones adicionales.
- Validación: los modelos publicados se entrenaron incluyendo las imágenes de validación, por lo que sus puntuaciones en validación no son significativas; solo el test oculto ofrece una medida honesta.
- Resultado de leaderboard: es un snapshot fechado (30 de octubre de 2026) con cinco participantes; no debe interpretarse como una victoria final ni como estado del arte absoluto.
- Producción: el pipeline genérico de segmentación de Transformers no reproduce todos los pasos de PalmCity (rejilla de parches rectangular, desactivación de máscaras de atención, conversión de queries a probabilidades normalizadas); es necesario usar el helper del proyecto para replicar las métricas.
- El token "no object" del clasificador de queries tiene ID 32 y es distinto de la clase Void (ID 31); confundirlos invalida las máscaras.
- No apto para sistemas safety-critical sin validación adicional: no hay evaluación de robustez ante lluvia, noche, oclusiones severas ni dominios fuera de PalmCity.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunusserhat/palmcity-eomt-dinov3-large-v2
- Modelo base: https://huggingface.co/tue-mps/eomt-dinov3-ade-semantic-large-512
- Primera etapa del proyecto: https://huggingface.co/yunusserhat/palmcity-eomt-dinov3-large
- Repositorio de código: https://github.com/yunusserhat/palmcity_challenge
- Guía de inferencia: https://github.com/yunusserhat/palmcity_challenge/blob/main/docs/inference.md
- Paper del método: https://arxiv.org/abs/2610.06063
- Paper de EoMT: https://arxiv.org/abs/2503.19108
- Paper de DINOv3: https://arxiv.org/abs/2508.10104
- ORCID del autor: https://orcid.org/0000-0002-7288-9959
