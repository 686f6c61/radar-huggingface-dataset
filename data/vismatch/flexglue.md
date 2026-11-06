# vismatch/flexglue

## Resumen

FlexGlue es un modelo de emparejamiento de características visuales (feature matching) y detección de puntos clave (keypoint detection) publicado por el usuario vismatch en Hugging Face bajo la librería `vismatch`. No se trata de un modelo de lenguaje, sino de un componente de visión por computador orientado a establecer correspondencias entre pares de imágenes, una tarea fundamental en pipelines de estructura desde el movimiento (SfM), reconstrucción 3D, odometría visual y registro de imágenes.

El modelo se distribuye con una licencia compuesta `mit-and-dinov3-license`, lo que indica que incorpora componentes derivados de DINOv3 (licencia propia de Meta) junto con código o pesos bajo licencia MIT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 3 de noviembre de 2026, por lo que se trata de una publicación muy reciente y sin tracción comunitaria documentada.

La información disponible en la model card es extremadamente escasa: únicamente remite al repositorio de GitHub del proyecto `vismatch` para instrucciones de uso. No se publican detalles sobre arquitectura interna, tamaño de parámetros, datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha refleja fielmente esa limitación y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión para feature matching; presumiblemente basado en DINOv3 según la licencia, sin confirmación en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica directamente; el modelo opera sobre imágenes) |
| Licencia | `mit-and-dinov3-license` (MIT + licencia DINOv3) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la model card. La etiqueta de licencia `dinov3-license` sugiere que el modelo emplea o deriva de los pesos de DINOv3, un modelo de representación visual auto-supervisado desarrollado por Meta, pero esto es una inferencia a partir de la licencia y no una confirmación explícita del autor.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, destilación o entrenamiento contrastivo. No hay información sobre innovaciones técnicas como atención lineal, decodificación especulativa (no aplicable en visión) o mecanismos de matching denso versus disperso. Toda esta sección queda, por tanto, sin datos verificables.

## Capacidades

- Emparejamiento de características entre pares de imágenes (image matching).
- Detección de puntos clave (keypoint detection), según el pipeline declarado en Hugging Face.
- Integración con la librería `vismatch`, cuyo repositorio documenta el uso previsto.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, agentes ni multilingüismo.
- No se especifican modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Reconstrucción 3D y estructura desde el movimiento (SfM): el modelo puede proporcionar correspondencias entre imágenes de una misma escena para alimentar pipelines de triangulación y bundle adjustment, una tarea para la que los matchers locales son el componente crítico.
- Odometría y SLAM visual: en robótica y navegación, el emparejamiento de puntos clave entre fotogramas consecutivos permite estimar el movimiento de la cámara; un matcher robusto reduce la deriva.
- Registro de imágenes médicas o satelitales: la detección de puntos clave y su correspondencia permiten alinear imágenes de distintas modalidades o tomadas en momentos diferentes.
- Fotogrametría y generación de mapas: la combinación de detección y matching facilita la creación de nubes de puntos y modelos digitales del terreno a partir de conjuntos de fotografías.
- Realidad aumentada y visión por computador en tiempo real: el matching entre la imagen de cámara y un mapa previamente construido permite el anclaje de contenido virtual.
- Benchmarking y evaluación de pipelines de matching: al estar disponible en Hugging Face con la librería `vismatch`, puede integrarse en experimentos comparativos frente a otros matchers (SuperGlue, LightGlue, LoFTR) para medir precisión y robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conoce el número de parámetros ni el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la model card remite a la librería `vismatch` y a su repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexGlue (vismatch/flexglue) | Feature matching / keypoint detection | no disponible | no aplica | MIT + DINOv3 | Hugging Face, 0 descargas |
| SuperGlue | Feature matching (grafo neuronal) | no disponible en esta ficha | no aplica | investigación (ver repositorio original) | GitHub oficial |
| LightGlue | Feature matching (ligero) | no disponible en esta ficha | no aplica | ver repositorio original | GitHub oficial |
| LoFTR | Matching denso (detector-free) | no disponible en esta ficha | no aplica | ver repositorio original | GitHub oficial |

No se dispone de datos de rendimiento de FlexGlue que permitan una comparación cuantitativa con estas alternativas; la tabla se limita a situarlo en su categoría funcional.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, tamaño, datos de entrenamiento ni evaluación, lo que impide valorar su calidad objetivamente.
- Licencia compuesta: la presencia de la licencia DINOv3 puede imponer restricciones adicionales al uso comercial; es imprescindible revisar el enlace de licencia indicado en la model card antes de utilizarlo en producción.
- Sin tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación por terceros y de reportes de errores.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de correspondencias espurias (falsos positivos en el matching) en escenas con texturas repetitivas, cambios de iluminación o movimiento; no se documenta ninguna métrica de robustez.
- No se especifican limitaciones idiomáticas ni de contexto porque el modelo no procesa texto.
- Fecha de creación muy reciente (noviembre de 2026): posible inestabilidad en la API o en los pesos publicados.
- No se indica el formato de pesos, lo que dificulta planificar su integración en pipelines existentes sin consultar el repositorio de `vismatch`.

## Enlaces

- Hugging Face: https://huggingface.co/vismatch/flexglue
- Repositorio de uso (vismatch): https://github.com/gmberton/vismatch
- Enlace de licencia indicado en la model card: https://github.com/cvg/FlexGlue#license
