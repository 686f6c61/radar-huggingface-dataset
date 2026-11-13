# SXY7/X-VLA-Food-Progress

## Resumen

X-VLA Food Progress es un paquete de inferencia para robótica que combina una política vision-language-action (VLA) congelada, denominada X-VLA Food, con tres cabezas MLP específicas de etapa entrenadas para estimar el progreso de una tarea de manipulación de alimentos. Lo desarrolla el usuario SXY7 y se publica en Hugging Face como un repositorio de 10,6 GB que incluye el checkpoint nativo completo del backbone, las tres MLP de progreso y el código fuente necesario para cargarlos. El modelo resuelve un problema concreto: dado un par de imágenes (vista superior y muñeca) más una instrucción en lenguaje y el estado articular medido, predecir en qué etapa de la tarea se encuentra el robot y cuánto falta para completarla.

La tarea cubre tres etapas secuenciales: llevar la zanahoria al plato, el panecillo al cuenco y la batata al plato. El backbone es la política Food de X-VLA en el checkpoint 150.000, mientras que las cabezas de progreso se seleccionaron en la actualización 6.500 de un entrenamiento independiente sobre características congeladas del codificador. La arquitectura subyacente es un transformer VLA con codificador visual-lenguaje Florence2, y el readout de progreso es un MLP de tres capas (2055 → 256 → 64 → 2) que produce un valor de etapa sigmoide y un logit de finalización de etapa.

Su relevancia es doble: por un lado, ejemplifica el patrón de congelar un VLA entrenado y añadir cabezas ligeras de estimación de progreso sin reentrenar el backbone; por otro, documenta de forma explícita las limitaciones del empaquetado (no hay runtime unificado de acción y progreso, ni drivers de robot). Es un artefacto de investigación reproducible más que un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLA (X-VLA) con codificador Florence2; cabezas MLP de progreso |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors y checkpoint nativo) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors, checkpoint nativo de PyTorch (`training_state.pt`, `checkpoint-006500.pt`) |

## Arquitectura y entrenamiento

El backbone es la política X-VLA Food en el checkpoint `checkpoint-150000`, procedente de un entrenamiento con batch size 8, acumulación de gradiente 2 y hasta 200.000 actualizaciones, reanudado desde la actualización 100.000. El codificador visual-lenguaje es Florence2, que produce tokens de imagen y de lenguaje; la política genera acciones a través del método `generate_actions`. El repositorio incluye el checkpoint nativo completo con `training_state.pt` para preservar la integridad, aunque la inferencia solo necesita modelo, configuración, procesador/tokenizer y estadísticas de normalización.

Las cabezas de progreso son tres MLP independientes, una por etapa, con topología 2055 → 256 → 64 → 2, activación ReLU en las capas ocultas, una salida sigmoide para el valor de etapa y un logit para la finalización de etapa. La entrada de 2055 dimensiones concatena la media de los tokens del codificador Florence2 de imagen superior y lenguaje (1024), la media de los tokens proyectados válidos de la imagen de muñeca (1024) y siete articulaciones medidas normalizadas. La tercera cámara enmascarada se excluye. Las cabezas se entrenaron sobre características cacheadas del codificador congelado, con las etiquetas compartidas de Food y un split de episodios 70/15/15; la política fuente no se actualizó en ese entrenamiento. El checkpoint se eligió sobre validación, no sobre test. El progreso total se calcula como `C + value[C]` si `C < 3`, y 3 en caso contrario, donde `C` es el prefijo de etapas completadas predicho con umbral 0,5. Las predicciones no se fuerzan a ser monótonas. Este readout es un estimador de progreso entrenado explícitamente, no el valor RL nativo de X-VLA.

## Capacidades

- Generación de acciones robóticas mediante el backbone X-VLA (`generate_actions`).
- Estimación de progreso de tarea por etapas: valor de etapa y logit de finalización.
- Procesamiento multimodal de imagen superior, imagen de muñeca y lenguaje (Florence2).
- Integración de estado propioceptivo: siete articulaciones medidas y normalizadas.
- Soporte bilingüe en inglés y chino para instrucciones y documentación.
- Estimación basada en la observación actual, sin historial de eventos ni observaciones futuras.
- No incluye tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de texto.
- No incluye visión general, audio ni modo thinking.

## Casos de uso

- Monitorización de progreso en manipulación de alimentos: el readout MLP estima en qué etapa (zanahoria, panecillo, batata) se encuentra el robot a partir de la observación actual, lo que permite supervisar ejecuciones y detectar atascos sin instrumentar la política.
- Detección de finalización de etapa para transiciones: el logit de finalización con umbral 0,5 permite disparar cambios de subobjetivo o recompensas intermedias en un pipeline de control jerárquico.
- Análisis retrospectivo de grabaciones reales: el repositorio está pensado para evaluar sobre observaciones de grabaciones reales de Food, de modo que se pueden calcular curvas de progreso por trayectoria con anotaciones de finalización.
- Investigación en recompensas densas: al ser un readout de progreso entrenado, sirve como señal de shaping para RL o para comparar con el valor RL nativo de X-VLA.
- Reutilización del backbone para otras tareas de manipulación: el checkpoint nativo de X-VLA Food puede cargarse con `load_model` y congelarse para inferencia de acciones en escenarios de cocina similares.
- Base para cabezas de progreso en nuevos dominios: el patrón de congelar el codificador y entrenar MLP sobre características cacheadas es replicable en otras tareas, sustituyendo las etiquetas y el split de episodios.
- Validación de pipelines de integración: útil para probar la conexión entre el codificador y las cabezas antes de integrar drivers de robot reales, que no se incluyen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de progreso describen las predicciones del readout sobre grabaciones reales y no establecen tasas comparativas de éxito del robot; tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 10,6 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que se requiere una GPU con memoria suficiente para el backbone completo, pero no se especifica.
- Opciones de despliegue: carga nativa mediante `load_model` en `code/X-VLA/xvla_piper/model.py` y `load_probe` en `code/food_progress/probe.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: el archivo de código no es un entorno Python instalado; hay que configurar dependencias compatibles y pasar rutas de checkpoint explícitas. Los scripts históricos pueden contener rutas de la máquina de origen y no son portables.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA para manipulación de alimentos con estimación de progreso), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- El repositorio no ofrece un runtime unificado de acción y progreso en un solo archivo, ni un atajo `AutoModel.from_pretrained` para ambos componentes; la integración debe conectar manualmente las cabezas con la salida del codificador correspondiente.
- No se incluyen drivers de robot; el despliegue en hardware real requiere trabajo adicional.
- Las predicciones de progreso no son monótonas por diseño, lo que puede producir retrocesos espurios en la estimación.
- La estimación usa solo la observación actual, sin historial ni observaciones futuras, lo que limita la robustez ante oclusiones o eventos ambiguos.
- La evaluación se realizó sobre observaciones de grabaciones reales, no en ejecución cerrada del robot; las métricas no demuestran tasas de éxito comparativas.
- Las curvas de referencia requieren anotaciones de finalización específicas por trayectoria y el porcentaje temporal es retrospectivo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- El backbone y las cabezas deben usar exactamente la misma dimensionalidad de características (2055) y la misma normalización de estado e imágenes; no se pueden mezclar con características de 896 dimensiones de otros entornos como H8.
- Las rutas de la máquina de origen permanecen en el repositorio como procedencia y no deben tratarse como ubicaciones de despliegue.
- Idiomas limitados a inglés y chino.

## Enlaces

- Hugging Face: https://huggingface.co/SXY7/X-VLA-Food-Progress
- Código de carga del backbone: `code/X-VLA/xvla_piper/model.py` (`load_model`)
- Inferencia y normalización: `code/X-VLA/xvla_piper/inference.py`
- Carga de cabezas y conversión de progreso: `code/food_progress/probe.py` (`load_probe`, `stage_coordinate`)
- Construcción de características: `extract_food_xvla_features.py` (`pooled_readout`)
- Checkpoint del backbone: `checkpoint/backbone/`
- Checkpoint de progreso: `checkpoint/progress/checkpoint-006500.pt`
- Código empaquetado: `code/X-VLA.tar.gz`
- Metadatos de procedencia, selección y evaluación: `provenance/`
