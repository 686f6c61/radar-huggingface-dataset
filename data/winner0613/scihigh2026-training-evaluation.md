# winner0613/scihigh2026-training-evaluation

## Resumen

Este repositorio, publicado por el usuario `winner0613`, no contiene un modelo entrenado en sentido estricto, sino el conjunto de scripts de entrenamiento, inferencia, inspección de datos, empaquetado y evaluación empleados por el equipo Treygram en las tres subtareas del shared task SciHigh 2026 de FIRE. El pipeline declarado en Hugging Face es `text-generation`, pero la model card describe tareas de `text2text-generation`: generación de highlights de investigación, generación de títulos científicos y traducción de títulos de inglés a bengalí.

La implementación se apoya en tres familias de modelos preentrenados: BART-base para las tareas 1 y 2, Pegasus en una ejecución separada con delimitación por puntos para la tarea 1, y NLLB-200 distilled 600M en modo zero-shot (con una ruta opcional a IndicTrans2) para la tarea 3. Los checkpoints resultantes se alojan en repositorios independientes enlazados desde la model card, no en este repositorio.

Su relevancia es acotada y de carácter reproducibilidad: sirve como referencia del flujo experimental de un equipo en un shared task académico, no como un modelo listo para producción. No se especifican parámetros totales, longitud de contexto ni datos de entrenamiento en la información disponible, y la licencia no concede derechos de reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo único; los scripts orquestan BART-base (tareas 1 y 2), Pegasus (tarea 1, ejecución separada) y NLLB-200 distilled 600M (tarea 3) |
| Parametros totales | No disponible (depende del checkpoint base: BART-base y NLLB-200 distilled 600M son los referenciados; el recuento no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y bengalí (bn) |
| Licencia | `other`; el repositorio no concede licencia de reutilización y exige contactar con los autores |
| Formato de pesos | No disponible (el repositorio es solo de scripts; los checkpoints se enlazan externamente) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: proporciona scripts que entrenan y ejecutan modelos encoder-decoder preentrenados. Para las tareas 1 y 2 se parte de `facebook/bart-base`, con un bucle de entrenamiento configurable por línea de comandos (`--epochs`, `--batch-size`, `--model`, `--output-dir`). La tarea 1 incluye además una ejecución separada con Pegasus y un esquema de delimitación por puntos («point-bounded»), cuyo notebook o configuración de entrenamiento no se incluye en esta entrega solo de scripts; únicamente se enlaza el checkpoint resultante. La tarea 3 emplea NLLB-200 distilled 600M en modo zero-shot para traducción de títulos inglés-bengalí, con una ruta alternativa a IndicTrans2 implementada en el script.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Los datasets oficiales del shared task no se redistribuyen y deben obtenerse de los organizadores y colocarse en `data/raw/`. El repositorio incluye utilidades de inspección de esquemas CSV (`inspect_data.py`), evaluación sobre split de validación etiquetado (`evaluate.py`) y validación y empaquetado de CSV de predicción (`package_submission.py`). La evaluación de la tarea 3 admite métrica COMET mediante la dependencia opcional `unbabel-comet`. Se advierte explícitamente de que la reproducción exacta depende de versiones de dataset, revisiones de modelo, versiones de librerías, hardware y configuración de ejecución.

## Capacidades

- Generación de highlights de investigación a partir de texto científico (tarea 1), mediante BART-base ajustado y una variante con Pegasus.
- Generación de títulos científicos (tarea 2) con BART-base ajustado.
- Traducción automática de títulos de inglés a bengalí (tarea 3) en modo zero-shot con NLLB-200 distilled 600M.
- Ruta alternativa de traducción con IndicTrans2 implementada en el script de la tarea 3.
- Evaluación de validación integrada por tarea, con soporte opcional de COMET para traducción.
- Inspección de esquemas y calidad de datos CSV antes de ejecutar los pipelines.
- Empaquetado y validación de ficheros de predicción para envío al shared task.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Reproducción de resultados de un shared task: el repositorio permite reentrenar las tareas 1 y 2 con BART-base y regenerar predicciones, útil para verificar o extender los resultados del artículo de FIRE 2026.
- Generación automática de resúmenes destacados de artículos científicos: el script de la tarea 1 produce highlights a partir de texto de investigación, adecuado para boletines internos o paneles de novedades bibliográficas.
- Generación de títulos para manuscritos o entradas bibliográficas: la tarea 2 permite proponer títulos a partir de contenido científico, integrable en flujos editoriales o de catalogación.
- Traducción de títulos al bengalí: la tarea 3 con NLLB-200 distilled 600M sirve para localizar metadatos de publicaciones para audiencias bengalíes sin entrenamiento adicional.
- Evaluación comparativa de arquitecturas encoder-decoder: los scripts permiten contrastar BART-base frente a Pegasus en la misma tarea y medir diferencias con la misma rutina de evaluación.
- Construcción de líneas base para investigación en generación de texto científico: el código sirve como punto de partida reproducible para experimentos propios con otros datasets o modelos base.
- Validación y empaquetado de envíos a competiciones: `package_submission.py` y `evaluate.py` son reutilizables en cualquier flujo de envío con formato CSV y split de validación etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo de FIRE 2026 para las configuraciones de las ejecuciones enviadas, pero no incluye cifras de MMLU, HumanEval, GSM8K, COMET ni métricas propias del shared task.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia de los modelos base citados, BART-base y NLLB-200 distilled 600M son modelos de tamaño moderado que caben en GPUs de consumo, pero el repositorio no declara requisitos ni configuraciones de hardware.
- GPU recomendadas: no disponible.
- GPU de consumo: no se confirma en la documentación; los scripts no especifican requisitos de memoria ni precisión.
- Opciones de despliegue: el repositorio no documenta servidores de inferencia (vLLM, TGI, llama.cpp, Ollama). La ejecución se realiza mediante scripts de Python con PyTorch/Transformers según `requirements.txt`, con Python 3.10 o superior.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| winner0613/scihigh2026-training-evaluation | Repositorio de scripts (BART-base, Pegasus, NLLB-200 distilled 600M) | No disponible | No disponible | en, bn | `other` sin derecho de reutilización | Hugging Face, 0 descargas |
| facebook/bart-base | Modelo encoder-decoder preentrenado | No declarado en la información disponible | No disponible | en (principalmente) | No disponible en la información | Hugging Face |
| facebook/nllb-200-distilled-600M | Modelo de traducción multilingüe | 600M (según nombre del checkpoint) | No disponible | Multilingüe (incluye en y bn) | No disponible en la información | Hugging Face |
| SreeKrishnaS/Scihigh-Pegasus-SubA | Checkpoint Pegasus ajustado para la tarea 1 | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La comparación es estructural: el repositorio analizado no es un modelo desplegable, sino un conjunto de scripts que dependen de los modelos base de la tabla. No se dispone de métricas comparativas de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye pesos de modelo: solo scripts. Los checkpoints están en repositorios separados y deben descargarse por su cuenta.
- La licencia `other` no concede derechos de reutilización ni redistribución; es necesario contactar con los autores para cualquier uso.
- No se redistribuyen datasets, ficheros de validación, predicciones ni datos de anotadores; hay que obtener los datos oficiales de los organizadores del shared task.
- La configuración de entrenamiento de Pegasus con delimitación por puntos no está incluida en esta entrega solo de scripts, lo que limita la reproducción completa de la tarea 1.
- La reproducción exacta depende de versiones de dataset, revisiones de modelo, versiones de librerías, hardware y configuración de ejecución, según advierte la propia model card.
- La evaluación debe hacerse sobre un split de validación etiquetado, no sobre el conjunto de test enmascarado.
- La evaluación COMET requiere la dependencia opcional `unbabel-comet`, de gran tamaño.
- Cobertura lingüística limitada a inglés y bengalí; no se declaran capacidades multilingües adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables a cualquier modelo generativo encoder-decoder subyacente.
- Incompatibilidad de metadatos: la pipeline declarada en Hugging Face es `text-generation`, mientras que la model card y las etiquetas indican `text2text-generation`; conviene verificar el uso previsto antes de integrarlo.
- Actividad nula en el repositorio (0 descargas, 0 likes) y ausencia de mantenimiento documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/winner0613/scihigh2026-training-evaluation
- Checkpoint tarea 1 BART: https://huggingface.co/winner0613/scihigh2026-task1-bart
- Checkpoint tarea 1 Pegasus: https://huggingface.co/SreeKrishnaS/Scihigh-Pegasus-SubA
- Checkpoint tarea 2 BART: https://huggingface.co/winner0613/scihigh2026-task2-bart
- Modelo base NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Modelo base BART-base: https://huggingface.co/facebook/bart-base
- Referencia del artículo: Sujith M., T. T. Mirnalinee, Sree Krishna S. y Srikanth C., «Highlight, Title and English to Bengali Title Generation with BART, Pegasus and NLLB», FIRE 2026, SciHigh shared task (sin URL disponible en la información proporcionada)
- Dependencia opcional de evaluación COMET: `unbabel-comet` (sin URL disponible en la información proporcionada)
