# Xu-AI4Science/mechflow-ckpts

## Resumen

MechFlow checkpoints es un repositorio de pesos publicado por Xu-AI4Science en HuggingFace que reúne los checkpoints de todos los modelos presentados en el artículo MechFlow, un trabajo centrado en la generación de estados de transición y en la modelización de mecanismos de reacción mediante flow matching. No se trata de un modelo de lenguaje, sino de una colección de artefactos de investigación para química computacional: el repositorio incluye un modelo de centro de reacción autorregresivo, generadores de estados de transición en espacio de distancias, versiones afinadas, controles sin preentrenamiento y un modelo conjunto.

El repositorio ocupa 1,8 GB e incorpora, además de los modelos propios, los checkpoints de las líneas base reentrenadas que aparecen en la tabla 1 del artículo (TS-DFM, OA-ReactDiff, React-OT y GoFlow), entrenadas con su código oficial sobre la partición OMol25-T1x. La licencia es MIT y el formato de pesos es PyTorch (.pt), acompañado en cada ejecución por un JSON con los argumentos de entrenamiento y la evaluación realizada durante el mismo.

Su relevancia es doble: por un lado, permite reproducir los experimentos del artículo siguiendo la guía REPRODUCE.md del repositorio de código; por otro, ofrece una comparativa homogénea de varios generadores de estados de transición entrenados sobre la misma partición de datos, algo poco habitual en la literatura de química generativa. La ficha de HuggingFace no publica número de parámetros, arquitectura detallada ni idiomas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; según la nomenclatura de los checkpoints, incluye un modelo de centro de reacción autorregresivo (center_ar_v1) y generadores basados en flow matching en espacio de distancias (distflow_*) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; opera sobre representaciones moleculares y geométricas) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en la precisión de entrenamiento (.pt) |
| Idiomas soportados | no aplica (modelo de química computacional, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), acompañado de un JSON por ejecución con argumentos de entrenamiento y evaluación en tiempo de entrenamiento |

## Arquitectura y entrenamiento

La model card describe el contenido del repositorio, no la arquitectura interna de cada modelo. Los checkpoints se organizan como `mechflow/<run>/best.pt` con `mechflow/<run>.json`, e incluyen: un modelo de centro de reacción (center_ar_v1, con 3 semillas), generadores de estados de transición en espacio de distancias entrenados sobre OMol25-T1x (distflow_t1xomol_seed0-2) y sobre las etiquetas originales (distflow_k1_s005_rbf*), generadores afinados (tl_t1xomol_to_*, tl_t1x_to_*), controles sin preentrenamiento (scratch_*) y un modelo conjunto (distomol_v0). El uso de flow matching se deduce tanto de las etiquetas del repositorio como de los propios nombres de los generadores.

En la carpeta `baselines/` se incluyen los checkpoints de las líneas base reentrenadas de la tabla 1 del artículo: TS-DFM (3 semillas), OA-ReactDiff (3 semillas), React-OT afinado (3 semillas) y GoFlow (semilla 1), entrenadas con su código oficial sobre la partición OMol25-T1x, con las modificaciones descritas en el artículo (reanudación y salidas de evaluación). No se especifican en la información disponible el número de tokens o muestras de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación tipo RLHF o DPO, que en cualquier caso no son habituales en este dominio.

## Capacidades

- Generación de estados de transición: los checkpoints distflow_* generan geometrías de estado de transición en espacio de distancias.
- Predicción del centro de reacción: el modelo center_ar_v1 identifica el centro de reacción de una transformación química.
- Modelización conjunta: distomol_v0 integra ambas tareas en un único modelo según la nomenclatura del repositorio.
- Afinado sobre nuevas etiquetas: los checkpoints tl_t1xomol_to_* y tl_t1x_to_* permiten estudiar la transferencia desde la partición OMol25-T1x a otros conjuntos de etiquetas.
- Comparación con líneas base: incluye los pesos de TS-DFM, OA-ReactDiff, React-OT y GoFlow reentrenados en la misma partición.
- Reproducibilidad: cada ejecución va acompañada de un JSON con argumentos de entrenamiento y evaluación, lo que facilita replicar resultados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, por tratarse de un modelo de química computacional.

## Casos de uso

- Predicción de estados de transición en reacciones orgánicas: dado un par reactivo-producto, los generadores distflow_* producen geometrías candidatas de estado de transición que después pueden refinarse con métodos de química cuántica. Es adecuado porque el modelo está entrenado específicamente en espacio de distancias sobre OMol25-T1x.
- Identificación del centro de reacción: center_ar_v1 permite localizar los átomos que participan directamente en la transformación, lo que resulta útil como paso previo para estudiar mecanismos o para reducir el espacio de búsqueda en cálculos de estructura electrónica.
- Aumento de datos para entrenar otros modelos: las geometrías generadas pueden emplearse como preentrenamiento o como datos sintéticos en modelos de predicción de barreras energéticas, siempre que se validen con cálculos de referencia.
- Estudios de mecanismo de reacción en catálisis: los checkpoints afinados (tl_*) permiten evaluar hasta qué punto un modelo preentrenado en OMol25-T1x se adapta a un conjunto de etiquetas distinto, un escenario habitual al analizar familias de catalizadores.
- Comparativa metodológica en investigación: al incluir TS-DFM, OA-ReactDiff, React-OT y GoFlow reentrenados sobre la misma partición, el repositorio sirve para reproducir comparaciones entre generadores de estados de transición sin necesidad de reentrenar cada línea base.
- Análisis de ablación y controles: los checkpoints scratch_* (sin preentrenamiento) y las distintas semillas permiten medir la varianza entre inicializaciones y cuantificar la aportación del preentrenamiento.
- Integración en flujos de cribado computacional: en pipelines de descubrimiento de fármacos o de diseño de catalizadores, los generadores pueden actuar como filtro previo que proponga geometrías plausibles antes de lanzar cálculos DFT, reduciendo el coste computacional.
- Docencia y formación en química computacional: los checkpoints y su JSON asociado permiten reproducir experimentos completos en un entorno controlado, con resultados verificables frente al artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que los checkpoints de la carpeta `baselines/` corresponden a los retrenamientos de las líneas base de la tabla 1 del artículo (TS-DFM, OA-ReactDiff, React-OT y GoFlow) sobre la partición OMol25-T1x, pero no reproduce las cifras. Para obtener valores numéricos hay que consultar el artículo o la guía REPRODUCE.md del repositorio de código.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica el número de parámetros de ninguno de los checkpoints.
- Como referencia de tamaño, el repositorio completo ocupa 1,8 GB e incluye un número elevado de checkpoints (varias semillas, versiones afinadas, controles y líneas base), por lo que cada archivo individual es de tamaño reducido, pero no se puede derivar de ello una cifra fiable de VRAM.
- GPU recomendadas: no disponible. Depende del tamaño real de cada modelo, que no se documenta.
- Viabilidad en GPU de consumo: no disponible por la misma razón.
- Opciones de despliegue: los pesos están en formato PyTorch (.pt) y están pensados para cargarse con el código oficial del proyecto MechFlow (https://github.com/GainGod-Xu/MechFlow). No se publican pesos en GGUF, safetensors ni ONNX, por lo que herramientas como llama.cpp, Ollama, vLLM o TGI no son aplicables a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El propio repositorio incluye los pesos de las alternativas con las que se compara el trabajo, todas reentrenadas sobre la partición OMol25-T1x.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MechFlow (distflow_*, distomol_v0, center_ar_v1) | Generadores de estados de transición y centro de reacción | no disponible | no aplica | MIT | Checkpoints en este repositorio, codigo en GitHub |
| TS-DFM | Generador de estados de transición | no disponible | no aplica | no disponible | Checkpoints incluidos en baselines/ (3 semillas) |
| OA-ReactDiff | Generador de estados de transición | no disponible | no aplica | no disponible | Checkpoints incluidos en baselines/ (3 semillas) |
| React-OT (afinado) | Generador de estados de transición | no disponible | no aplica | no disponible | Checkpoints incluidos en baselines/ (3 semillas) |
| GoFlow | Generador de estados de transición | no disponible | no aplica | no disponible | Checkpoint incluido en baselines/ (semilla 1) |

No se dispone de datos de rendimiento comparativo en la información proporcionada más allá de la referencia a la tabla 1 del artículo.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: no hay pipeline declarado, ni demo, ni documentación de inferencia independiente del código del proyecto.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización indicadas (12-10-2026) no coinciden con ningún historial de uso verificable, por lo que no existe validación externa de los pesos.
- No se publican el número de parámetros, la arquitectura interna, el volumen de datos de entrenamiento ni las temperaturas o protocolos de muestreo recomendados.
- Los modelos de generación de geometrías pueden producir estructuras químicamente inválidas o estados de transición de alta energía; cualquier uso científico exige validación con métodos de química cuántica (por ejemplo, DFT) antes de extraer conclusiones.
- No hay información sobre sesgos en la composición del dataset de entrenamiento, más allá de la partición OMol25-T1x; el rendimiento fuera de la distribución química cubierta por ese conjunto no está caracterizado.
- La licencia MIT permite uso comercial y modificación, pero se distribuye sin garantías; además, la licencia de las líneas base reentrenadas incluidas en `baselines/` no se especifica, por lo que conviene comprobarla en sus repositorios originales antes de reutilizarlas.
- Al no publicarse pesos en formatos estándar de inferencia (GGUF, safetensors, ONNX), la integración exige trabajar con el código del proyecto y con PyTorch.
- El repositorio mezcla modelos propios, versiones afinadas, controles y líneas base; es imprescindible leer el JSON asociado a cada ejecución para no confundir configuraciones al reproducir resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Xu-AI4Science/mechflow-ckpts
- Código del proyecto MechFlow: https://github.com/GainGod-Xu/MechFlow
- Guía de reproducción: REPRODUCE.md dentro del repositorio de código (https://github.com/GainGod-Xu/MechFlow/blob/main/REPRODUCE.md)
- Artículo MechFlow: referenciado en la model card, sin enlace directo disponible en la información proporcionada.
