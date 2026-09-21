# Thermostatic/AstroCLIMB-Qwen3.5-4B

## Resumen

AstroCLIMB-Qwen3.5-4B no es un modelo generativo de chat, sino un conjunto de cuatro adaptadores LoRA y cabezas de clasificación entrenados sobre el modelo base Qwen/Qwen3.5-4B (revision fijada `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). Lo publica Irving Ernesto Quezada Ramírez, investigador independiente, bajo el repositorio `Thermostatic/AstroCLIMB-Qwen3.5-4B`. El problema que resuelve es concreto: clasificar la relación entre figuras y pies de figura de artículos científicos (astronomía, principalmente) en cuatro categorías (`same_figure`, `same_paper`, `related_papers`, `unrelated_papers`).

El artefacto corresponde a un envío a una competición tipo Kaggle: el sistema presentado obtuvo un macro-F1 público de 0,75149 y un macro-F1 de desarrollo agrupado de 0,7562033665 sobre 1.986 pares, según la model card. Son conjuntos de evaluación distintos y el autor advierte explícitamente que no constituyen una estimación insesgada ni una reivindicación de ranking.

La relevancia es de nicho pero clara: se trata de un componente de investigación para enlazar figuras científicas con sus artículos de origen o destino, útil en tareas de curación de corpus, deduplicación visual y construcción de grafos de relaciones a nivel de figura. La adaptación pública (`public4000`) solo aplica al clasificador CXI; el resto de cabezas son derivados específicos de la tarea con su propio directorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3.5-4B (transformer multimodal, con torre de visión congelada) con adaptadores LoRA de rango 16 (alpha 32) y cabeza de clasificación específica de tarea |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base se denomina Qwen3.5-4B; los adaptadores y cabezas se publican aparte) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la inferencia canónica indicada es batch uno en BF16 con SDPA) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (adaptadores y cabezas derivados, con atribucion del procesador y tokenizador originales preservada en LICENSE y NOTICE) |
| Formato de pesos | LoRA en safetensors, cabezas de clasificacion en `head.pt` (PyTorch, cargar con `torch.load(..., weights_only=True)`), mas ficheros de procesador |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, con la torre de visión y el cuerpo del modelo congelados. Sobre esa base se entrenan adaptadores LoRA de rango 16 con alpha 32 y una cabeza de clasificación específica de tarea que consume la última representación oculta no correspondiente a padding. Los clasificadores IXI (imagen-imagen) y CXC (caption-caption) enmascaran la clase `same_figure`, de modo que su espacio efectivo de decisión es de tres clases. La inferencia canónica es batch uno en BF16 con SDPA; el autor advierte que cambiar el backend o la forma del batch puede alterar las predicciones.

El repositorio contiene cuatro directorios: `cxi837` (clasificador caption-imagen presentado, con ajuste sobre `public4000` y después 837 actualizaciones gold), `ixi627` (clasificador imagen-imagen, promediando probabilidades sobre ambos órdenes de imagen), `cxc414` (clasificador caption-caption en orden original) y `public4000` (padre de adaptación pública sobre figuras científicas, antes de la especialización gold). Cada directorio incluye pesos LoRA, `head.pt`, ficheros de procesador y metadatos de entrenamiento saneados. No se publican detalles del dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO; la model card remite al repositorio de código para los requisitos de acceso a datos y filtrado. El historial incluye ramas exploratorias descartadas por problemas de exposición y calidad de datos. El proyecto recibió una ayuda no restringida de 1.000 USD en cómputo GPU de Lium.

## Capacidades

- Clasificación de relaciones entre figuras y pies de figura científicos en cuatro clases: `same_figure`, `same_paper`, `related_papers` y `unrelated_papers`.
- Clasificación caption-imagen (directorio `cxi837`), imagen-imagen (`ixi627`) y caption-caption (`cxc414`).
- Procesamiento multimodal: el pipeline declarado en HuggingFace es `image-classification` y la base incorpora torre de visión, aunque esta permanece congelada durante el entrenamiento.
- Integración como adaptador PEFT sobre un modelo base descargado por separado, no como modelo autónomo.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: es un cabezal de clasificación, no un modelo conversacional.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Deduplicación de figuras en corpus astronómicos: dado un conjunto de figuras extraídas de preprints, el clasificador CXI (`cxi837`) permite etiquetar pares como `same_figure` y colapsar duplicados antes de indexar el corpus.
- Vinculación de figuras con su artículo de origen: usando pares caption-imagen, el modelo distingue si una figura pertenece al mismo paper que un pie de figura dado, lo que permite reconstruir la procedencia de figuras huérfanas en repositorios documentales.
- Detección de figuras compartidas entre preprints relacionados: la clase `related_papers` permite identificar figuras reutilizadas entre versiones o artículos de una misma línea de trabajo, útil para seguimiento de literatura.
- Construcción de grafos de relaciones a nivel de figura: los resultados del clasificador pueden alimentar un grafo con aristas `same_paper` y `related_papers`, base para herramientas de exploración visual de literatura científica.
- Curación y filtrado de datasets multimodales de entrenamiento: el adaptador `public4000`, entrenado sobre figuras científicas públicas, sirve para descartar pares figura-caption mal emparejados antes de usar el corpus en otros entrenamientos.
- Auditoría de integridad de imágenes en publicaciones: la comparación imagen-imagen (`ixi627`, con promedio de probabilidades en ambos órdenes) permite detectar reutilización de figuras con transformaciones menores.
- Control de calidad en flujos editoriales: clasificar automáticamente si una figura enviada por un autor está relacionada con material ya publicado, como apoyo a la revisión, nunca como decisión automatizada.
- Recuperación visual en repositorios tipo arXiv o ADS: usar las salidas del clasificador como señal de reordenación en un sistema de búsqueda de figuras por pie de figura o viceversa.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas del sistema presentado en la competición:

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 publico (Kaggle) | 0,75149 | Conjunto público de la competición |
| Macro-F1 de desarrollo agrupado | 0,7562033665 | 1.986 pares (conjunto de desarrollo) |

El autor indica explícitamente que son conjuntos de evaluación distintos, que el desarrollo se usó repetidamente para selección de modelo y que, por tanto, no son estimaciones insesgadas ni una reivindicación de ranking. No se publican resultados desglosados por clase, por directorio de adaptador ni comparaciones con otros sistemas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia derivada del tamaño del modelo base (4B parámetros, multimodal con torre de visión), una ejecución en BF16 requiere del orden de 10-14 GB de VRAM contando pesos, torre de visión y activaciones en batch uno. Son estimaciones de orden de magnitud, no medidas del autor.
- GPU recomendadas: no especificadas. La inferencia canónica descrita (batch uno, BF16, SDPA) es compatible con GPU de gama alta de consumo con suficiente VRAM.
- Viabilidad en GPU de consumo: probable en tarjetas con 16-24 GB (por ejemplo RTX 4090 o RTX 3090) en BF16, siempre que se replique exactamente la configuración de inferencia documentada. No confirmado por el autor.
- Almacenamiento: el repositorio de adaptadores y cabezas ocupa 0,4 GB. Los pesos del modelo base se descargan aparte bajo los términos de Qwen.
- Opciones de despliegue: no aplican los servidores de inferencia generativa habituales (vLLM, TGI, Ollama, llama.cpp) en su forma estándar, porque se trata de adaptadores PEFT con una cabeza de clasificación personalizada. El despliegue previsto es la utilidad de inferencia pública documentada en el repositorio, que verifica hashes de la release y esquemas de entrada.
- Latencia y throughput: no disponibles. El autor no ha ejecutado la utilidad pública de inferencia en GPU fresca ni ha hecho una replicación numérica histórica con ella.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada: la model card no cita alternativas y la búsqueda web no devolvió resultados relevantes sobre este modelo ni sobre sistemas equivalentes. Por tanto, la comparativa con alternativas externas queda como no disponible.

Como referencia interna, la propia release se organiza en cuatro componentes con roles distintos:

| Directorio | Rol | Datos de rendimiento |
|---|---|---|
| `cxi837` | Clasificador caption-imagen presentado (public4000 + 837 actualizaciones gold) | No desglosado |
| `ixi627` | Clasificador imagen-imagen (promedio de probabilidades en ambos órdenes) | No desglosado |
| `cxc414` | Clasificador caption-caption en orden original | No desglosado |
| `public4000` | Padre de adaptación pública sobre figuras científicas | No desglosado |

## Limitaciones y advertencias

- No es un modelo generativo ni un asistente: es un conjunto de clasificadores. No debe presentarse ni desplegarse como un chat.
- Sesgos conocidos: no documentados explícitamente, pero el entrenamiento se limita a figuras científicas, en su mayoría de astronomía, en inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea fuera de la distribución de figuras científicas.
- Limitaciones de contexto e idioma: solo inglés declarado; no se publica la longitud de contexto del modelo base ni su comportamiento en textos largos.
- Independencia de la evaluación: el autor advierte que hubo exposición previa a nivel de proyecto y emparejamiento de identidades incompleto, lo que limita cualquier afirmación de independencia evaluativa. El conjunto de desarrollo se usó repetidamente para selección.
- Reproducibilidad: la release omite deliberadamente `probe.pt` (contiene un ejemplo de entrenamiento recuperable) y el estado del optimizador, por lo que estos paquetes no son intercambiables con los exportadores antiguos que verifican la sonda. No se ha realizado una ejecución fresca en GPU de la utilidad pública ni un reentrenamiento completo desde esta release.
- Metadatos: las rutas de metadatos fueron normalizadas; los hashes padre en los metadatos se refieren al archivo original, no a los metadatos reescritos de esta release. `public-manifest.json` recoge los hashes SHA-256.
- Sensibilidad de la inferencia: cambiar el backend o la forma del batch respecto a la configuración canónica (batch uno, BF16, SDPA) puede alterar las predicciones.
- Licencia: los adaptadores y cabezas se publican bajo Apache-2.0, pero el modelo base se rige por sus propios términos, que deben respetarse al descargarlo. Los datos de entrenamiento y los pesos base no se incluyen en el repositorio.
- Uso previsto: artefacto de investigación sobre relaciones entre figuras y pies de figura científicos. No está validado para otros dominios ni para usos de toma de decisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thermostatic/AstroCLIMB-Qwen3.5-4B
- Repositorio fuente y manuscrito: https://github.com/Sekinal/AstroCLIMB
- Instrucciones de inferencia pública: https://github.com/Sekinal/AstroCLIMB/blob/main/docs/public-inference.md
- Modelo base: Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los proporcionados en la model card y en los metadatos de HuggingFace.
