# Yuanchao049/Vision-OPD-Qwen3.5-4B-Controlled-Step128-20261126

## Resumen

Vision-OPD-Qwen3.5-4B-Controlled-Step128-20261126 es un checkpoint intermedio de entrenamiento publicado por el usuario Yuanchao049 en Hugging Face. No se trata de un modelo final listo para producción, sino de un artefacto de investigación generado dentro de un experimento controlado denominado Vision-OPD, en el que se parte del modelo base Qwen/Qwen3.5-4B (revisión fijada `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se aplican 128 pasos de optimización con AdamW sobre 2.048 preguntas benignas del conjunto Vision-OPD-6K.

El objetivo del experimento es estudiar mecanismos de destilación o alineación multimodal: el estudiante (este checkpoint) se entrena frente a un profesor congelado condicionado por recortes de imagen, usando trayectorias de imagen completa generadas por el propio estudiante y una divergencia Jensen-Shannon top-100 sobre las distribuciones del profesor. El checkpoint contiene el state dict del estudiante, el estado del optimizador, el paso actual y la configuración de entrenamiento, empaquetado en partes numeradas que deben concatenarse y verificarse por SHA-256 antes de cargarse.

Su relevancia es por tanto metodológica y reproducibilidad de experimentos, no como modelo desplegable. Al ser un checkpoint de paso 128 sobre un base de 4B, su utilidad práctica está limitada a quienes replican el pipeline Vision-OPD; no hay información publicada sobre licencia más allá de Apache-2.0, idiomas soportados ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Heredada del modelo base Qwen/Qwen3.5-4B; no se detalla en el checkpoint (no disponible) |
| Parámetros totales | 4B (según el nombre y el modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint se distribuye como state dict PyTorch, no como pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | State dict PyTorch con estado del optimizador, empaquetado en partes numeradas con manifiesto JSON y verificación SHA-256; carga con `torch.load(path, map_location="cpu", mmap=True, weights_only=True)` |

## Arquitectura y entrenamiento

El checkpoint no define una arquitectura propia: hereda la del modelo base Qwen/Qwen3.5-4B, del que solo se conoce la revisión fijada. El entrenamiento documentado consiste en 128 pasos de AdamW sobre 2.048 preguntas benignas del dataset Vision-OPD-6K. El esquema es de destilación con profesor congelado condicionado por recortes de imagen, usando trayectorias de imagen completa generadas por el estudiante y una pérdida de divergencia Jensen-Shannon top-100 entre las distribuciones del profesor y del estudiante.

El artefacto incluye el state dict del estudiante, el estado del optimizador, el paso actual y los ajustes de entrenamiento. El repositorio publica un `checkpoint-manifest.json` tras subir y verificar todas las partes; la carga requiere concatenar las partes en el orden del manifiesto y comprobar el SHA-256 resultante. Para el procesador y el profesor congelado debe usarse la revisión fijada del modelo base. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- No se documentan capacidades específicas del checkpoint en la información disponible.
- Al derivar de Qwen/Qwen3.5-4B, podría heredar las capacidades del base, pero el checkpoint es un artefacto intermedio de investigación y no se garantiza que conserve el comportamiento del modelo original.
- No se confirma soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman capacidades especiales como modo de razonamiento extendido, visión o audio, más allá de la etiqueta `multimodal` del repositorio y del contexto del experimento Vision-OPD.

## Casos de uso

- Reproducción de experimentos Vision-OPD: cargar el checkpoint con la revisión fijada del base y el manifiesto para continuar o auditar el entrenamiento en el paso 128.
- Investigación en destilación multimodal: analizar la pérdida JSD top-100 entre profesor condicionado por recortes y estudiante sobre trayectorias de imagen completa.
- Estudio de dinámica de entrenamiento: inspeccionar el estado del optimizador y la configuración para comparar curvas de pérdida en distintos pasos.
- Auditoría de reproducibilidad: verificar la integridad de las partes mediante SHA-256 antes de reutilizar el artefacto en un pipeline interno.
- Desarrollo de metodología de evaluación multimodal: usar el checkpoint como punto de control intermedio para medir el efecto de pasos adicionales sobre el comportamiento del estudiante.
- Docencia e investigación académica: servir como ejemplo práctico de empaquetado de checkpoints con manifiesto y verificación criptográfica en flujos de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un state dict de un modelo de 4B con estado del optimizador, el espacio en disco y memoria para cargarlo supera el de los pesos de inferencia (el optimizador AdamW suele duplicar o triplicar el tamaño de los parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 4B en precisión reducida podría caber en GPUs de consumo, pero el checkpoint incluye estado del optimizador y no está pensado para inferencia directa.
- Opciones de despliegue: no aplicables de forma estándar; la carga documentada es mediante `torch.load` con `mmap=True` y `weights_only=True`, no mediante vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vision-OPD-Qwen3.5-4B-Controlled-Step128-20261126 | 4B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Checkpoint intermedio de investigación |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva el checkpoint |
| Alternativas de 4B para investigación multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (paso 128), no un modelo final; su comportamiento no está validado para uso general.
- No se han publicado evaluaciones, benchmarks ni análisis de sesgos.
- Riesgo de alucinación y degradación de capacidades respecto al base no cuantificado.
- El repositorio registra 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La licencia Apache-2.0 se declara en el repositorio, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B antes de un uso comercial.
- El checkpoint incluye estado del optimizador y requiere concatenar partes y verificar SHA-256; un uso incorrecto del manifiesto puede producir una carga corrupta.
- No se especifican idiomas soportados ni limitaciones de contexto.
- No debe tratarse como sustituto del modelo base en producción sin una evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Yuanchao049/Vision-OPD-Qwen3.5-4B-Controlled-Step128-20261126
- Repositorio del método Vision-OPD: https://github.com/VisionOPD/Vision-OPD
- Dataset Vision-OPD-6K: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
