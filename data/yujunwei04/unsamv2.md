# yujunwei04/UnSAMv2

## Resumen

UnSAMv2 es un modelo de segmentación de imágenes y vídeo desarrollado por Junwei Yu, Trevor Darrell y XuDong Wang (arXiv 2511.13714, 2025). Se construye como un ajuste fino de facebook/sam2.1-hiera-small (46,4 M de parámetros) y añade una capacidad que SAM 2 no tiene: el control continuo de granularidad. Además del prompt habitual de punto o caja, el usuario proporciona un escalar que determina si la máscara devuelta debe abarcar el objeto completo o una de sus partes, sin necesidad de reentrenar ni de diseñar prompts específicos.

Su rasgo más distintivo es que se entrena sin ninguna anotación humana. Un pipeline de divide y vencerás, consciente de la granularidad, extrae pares máscara-granularidad de imágenes sin etiquetar y esos pseudoetiquetas supervisan un embedding de granularidad ligero que se añade sobre SAM 2. Esto lo sitúa en la línea de los modelos de segmentación promptable auto-supervisados, donde el coste de anotación deja de ser el cuello de botella.

El modelo se publica bajo licencia Apache 2.0 con dos checkpoints (`unsamv2.pt` y `unsamv2_plus.pt`, este último entrenado con más datos sin etiquetar) y una demo interactiva en Hugging Face Spaces. Con 0 descargas y 0 likes en el momento de redactar esta ficha, su validación por parte de la comunidad es todavía incipiente, aunque las métricas reportadas mejoran de forma clara a las de SAM 2 en las mismas métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico Hiera (encoder de imagen + prompt encoder + decoder de máscaras) con un embedding de granularidad añadido; base SAM 2.1 Hiera-Small |
| Parámetros totales | 46,4 M en el backbone Hiera-Small; el número exacto de parámetros añadidos por el embedding de granularidad no está disponible (la model card lo describe como "ligero") |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual); en segmentación de vídeo la arquitectura SAM 2 mantiene memoria temporal de fotogramas, con longitud no documentada en la información disponible |
| Tipos de cuantización | no disponible (se distribuyen checkpoints en el formato de entrenamiento de SAM 2; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (no aplica: el modelo no recibe ni produce texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` en el formato de entrenamiento de SAM 2, con los pesos bajo la clave `model`; no se distribuyen safetensors ni GGUF |
| Modelo base | facebook/sam2.1-hiera-small (fine-tune) |
| Tamaño del repositorio | 0,4 GB (incluye los dos checkpoints) |
| Librería | sam2 |
| Idiomas de la documentación | inglés |

## Arquitectura y entrenamiento

La arquitectura parte de SAM 2.1 Hiera-Small: un encoder de imagen Hiera (transformer jerárquico) que produce características multiescala, un prompt encoder que codifica puntos y cajas, y un mask decoder que genera las máscaras. Sobre esta base, UnSAMv2 incorpora un embedding de granularidad que condiciona el decoder, de forma que un único modelo cubre el espectro entre objeto completo y partes. Para vídeo, la familia SAM 2 emplea un módulo de memoria temporal sobre fotogramas anteriores, y el repositorio de UnSAMv2 documenta explícitamente casos de segmentación de vídeo además de segmentación interactiva y de imagen completa.

El entrenamiento es íntegramente auto-supervisado: no se usó ninguna anotación humana de segmentación. Un pipeline de divide y vencerás consciente de la granularidad mina pares máscara-granularidad a partir de imágenes sin etiquetar, y esos pseudoetiquetas supervisan el embedding de granularidad. No se documenta el número de tokens, imágenes o iteraciones de entrenamiento, ni el uso de RLHF o DPO (técnicas no aplicables a esta tarea). El checkpoint `unsamv2_plus.pt` se entrena sobre un volumen mayor de datos sin etiquetar que `unsamv2.pt`, lo que explica la mejora de métricas.

## Capacidades

- Segmentación promptable interactiva: acepta prompts de punto o de caja y devuelve la máscara correspondiente.
- Control de granularidad: un escalar continuo adicional al prompt selecciona el nivel de detalle de la máscara (objeto completo, partes o subpartes) de forma suave, sin reentrenamiento.
- Segmentación de imagen completa: generación de máscaras para toda la imagen, no solo para la región indicada por el prompt.
- Segmentación de vídeo: el repositorio cubre el caso de vídeo, apoyándose en la arquitectura SAM 2.
- Aprendizaje auto-supervisado: los checkpoints se entrenan con pseudoetiquetas minadas de imágenes sin etiquetar, sin anotación humana.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplica.
- Generación de texto, código o matemáticas: no soportado.
- Capacidades multilingües: no aplica (sin entrada ni salida de texto).
- Modo "thinking": no disponible.

## Casos de uso

- Anotación asistida de datasets de segmentación: el modelo pre-genera máscaras a varios niveles de granularidad sobre imágenes no etiquetadas, y un anotador humano solo valida o corrige, reduciendo el coste por imagen frente a la anotación desde cero.
- Herramientas de edición de imagen por capas: selección de una persona, de su ropa o de un accesorio concreto ajustando el escalar de granularidad, lo que permite recortes y máscaras de matting sin selección manual píxel a píxel.
- Segmentación jerárquica en teledetección y cartografía: extracción de edificios, después tejados y después elementos como ventanas o paneles solares, usando el mismo modelo con distintos valores de granularidad.
- Robótica y manipulación: segmentación a nivel de parte (asa, tapa, articulación) para alimentar políticas de agarre o de interacción con objetos, donde la máscara del objeto completo es insuficiente.
- Preprocesado en pipelines de visión por computador: generación de máscaras para tareas posteriores (inpainting, composición, aumento de datos) dentro de un proceso automatizado por lotes.
- Segmentación y seguimiento en vídeo: aplicaciones de edición de vídeo o análisis de escenas donde se requiere mantener la máscara de un objeto a lo largo de los fotogramas.
- Investigación en segmentación auto-supervisada: servir de baseline reproducible para estudiar control de granularidad, dado que los checkpoints son de acceso libre y ligeros.
- Pruebas en imagen médica o industrial: uso exploratorio a nivel de parte (órganos, lesiones, defectos), siempre con validación específica de dominio, ya que el entrenamiento se basa en imágenes naturales sin etiquetar y la composición del dataset no está documentada.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los publicados por los autores en la model card. Las definiciones exactas de las métricas (NoC80, NoC90, 1-IoU, AR1000) no se detallan en la información proporcionada.

| Modelo | NoC80 ↓ | NoC90 ↓ | 1-IoU ↑ | AR1000 ↑ |
|---|---|---|---|---|
| UnSAMv2 (`unsamv2.pt`) | 2,28 | 3,40 | 79,3 | 68,3 |
| UnSAMv2+ (`unsamv2_plus.pt`) | 2,07 | 3,10 | 81,7 | 74,1 |
| SAM 2 (referencia de la model card) | 2,44 | 3,63 | 69,0 | 49,6 |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de segmentación) en la información disponible.

## Requisitos de hardware

- Tamaño de los pesos: con 46,4 M de parámetros en fp32, cada checkpoint ronda los 186 MB; el repositorio completo (dos checkpoints) ocupa 0,4 GB según los metadatos de Hugging Face.
- VRAM estimada para inferencia en imagen: del orden de 1 a 2 GB con precisión completa o AMP para una imagen de resolución habitual, más la memoria adicional de activaciones y de máscaras de alta resolución. Es una estimación derivada del recuento de parámetros, no una cifra documentada por los autores.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en la práctica; se incluyen RTX 3050/3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 (en estas últimas el modelo queda enormemente infrautilizado). También es viable la inferencia en CPU para imágenes sueltas.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual. El coste dominante no es el modelo, sino la resolución de la imagen y, en vídeo, el número de fotogramas retenidos en memoria.
- Segmentación de vídeo: al mantener memoria temporal de fotogramas, el consumo de VRAM crece con la duración y la resolución del vídeo, por lo que conviene trocear secuencias largas.
- Opciones de despliegue: la librería `sam2` con PyTorch es la vía documentada; el repositorio de GitHub incluye notebooks para segmentación interactiva, de imagen completa y de vídeo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje que no aplican aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Control de granularidad | Licencia | Disponibilidad | Rendimiento (NoC80 / NoC90 / 1-IoU / AR1000) |
|---|---|---|---|---|---|
| UnSAMv2 | 46,4 M (base Hiera-Small) | Sí, escalar continuo | Apache 2.0 | Pesos en Hugging Face + código en GitHub + demo | 2,28 / 3,40 / 79,3 / 68,3 |
| UnSAMv2+ | 46,4 M (base Hiera-Small) | Sí, escalar continuo | Apache 2.0 | Igual que el anterior | 2,07 / 3,10 / 81,7 / 74,1 |
| SAM 2 (referencia de la model card) | no disponible en la información proporcionada | No documentado | no disponible en la información proporcionada | Ampliamente disponible | 2,44 / 3,63 / 69,0 / 49,6 |
| facebook/sam2.1-hiera-small (modelo base) | 46,4 M | No | no disponible en la información proporcionada | Pesos públicos en Hugging Face | no disponible |

Con los datos disponibles, UnSAMv2 y UnSAMv2+ mejoran a la referencia SAM 2 en las cuatro métricas reportadas, con la ventaja añadida del control de granularidad. No se dispone de comparaciones con otras alternativas de segmentación promptable en la información proporcionada.

## Limitaciones y advertencias

- Todas las métricas proceden de la model card del autor; no se ha verificado una evaluación independiente en la información disponible.
- El entrenamiento se basa en pseudoetiquetas auto-supervisadas: los errores sistemáticos del pipeline de minado pueden propagarse al modelo y no existe una corrección humana que los limite.
- La composición del conjunto de imágenes sin etiquetar no está documentada, por lo que no se pueden caracterizar sesgos demográficos, geográficos o de dominio. Es previsible un rendimiento degradado en dominios alejados de las imágenes naturales (imagen médica, satelital de alta resolución, microscopía, inspección industrial).
- Riesgo de máscaras incorrectas o incompletas en objetos con límites ambiguos, oclusiones fuertes o texturas poco definidas, especialmente en los extremos del rango de granularidad.
- El rango y la interpretación del escalar de granularidad no están documentados en la información disponible, lo que obliga a calibrarlo empíricamente por aplicación.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta tool calling y no soporta agentes. Cualquier uso conversacional queda fuera de su alcance.
- El modelo no procesa texto, por lo que no tiene sentido hablar de soporte multilingüe.
- Licencia Apache 2.0, que permite uso comercial y modificación con atribución; conviene verificar por separado las condiciones del modelo base SAM 2.1, no incluidas en la información disponible.
- Adopción comunitaria nula en el momento de redactar la ficha (0 descargas, 0 likes): no hay informes de terceros sobre robustez, estabilidad ni comportamiento en producción.
- Los metadatos indican una fecha de creación del 15 de septiembre de 2026, posterior a la fecha del preprint citado (2025); conviene contrastar fechas antes de referenciar el modelo.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo foros sin relación), por lo que no existe material independiente adicional que corroborar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujunwei04/UnSAMv2
- Página del proyecto: https://yujunwei04.github.io/UnSAMv2-Project-Page/
- Preprint en arXiv: https://arxiv.org/abs/2511.13714
- Código en GitHub: https://github.com/yujunwei04/UnSAMv2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/yujunwei04/UnSAMv2
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-small
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
