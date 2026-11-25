# turhancan97/visbench-vehicle_classification-dinov2_vits14

## Resumen

`turhancan97/visbench-vehicle_classification-dinov2_vits14` no es un modelo generativo ni un backbone de visión, sino una **cabeza de sondeo (probe head) lineal** entrenada sobre las características congeladas del backbone `dinov2_vits14`. Forma parte del ecosistema VisBench, un framework de evaluación por sondeo que mide qué información semántica contienen las representaciones internas de un modelo visual sin reentrenarlo. El módulo se ajustó específicamente para la tarea `vehicle_classification` (clasificación de vehículos) sobre un conjunto de 196 clases.

Su relevancia es metodológica más que práctica: permite cuantificar de forma reproducible la calidad de las features de DINOv2 ViT-S/14 en una tarea concreta, con protocolo fijo (`visbench_vehicle_linear_probe`), pooling `cls` y `feature_mode=dense_only`. Los resultados reportados son un top-1 de 0,7614 y un top-5 de 0,9370, lo que da una referencia útil para comparar backbones bajo condiciones idénticas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB (coherente con una cabeza lineal de muy pocos parámetros). La licencia y los idiomas no están declarados. No debe confundirse con un modelo de clasificación autónomo: solo funciona acoplado al backbone exacto con el que se entrenó.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza lineal de sondeo (linear probe) sobre backbone ViT congelado `dinov2_vits14` |
| Parámetros totales | No disponible (cabeza lineal sobre features de ViT-S/14; el backbone tiene ~22 M de parámetros, el probe es de muy baja dimensión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224×224 según la clave del backbone) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No disponible explícitamente; cargable mediante `visbench.hub.load_probe_from_hub` (librería `visbench`) |

## Arquitectura y entrenamiento

La arquitectura es una **cabeza de clasificación lineal** ajustada sobre las features de `dinov2_vits14` (ViT-Small/14, parche de 14 px, entrada 224×224) en modo congelado. El backbone se identifica con la clave `dinov2/dinov2_vits14/224/7764ea0f912e`, y las features se extraen con `pooling=cls` y `feature_mode=dense_only`; el campo `layers` es `None`. El módulo rechaza cargarse contra cualquier otro backbone, pooling o modo de features, ya que de lo contrario produciría predicciones con la forma correcta pero semánticamente erróneas (fallo silencioso).

El entrenamiento siguió el protocolo `visbench_vehicle_linear_probe` con los siguientes hiperparámetros: `batch_size=256`, `epochs=200`, `lr=0.01`, `optimizer=adamw`, `weight_decay=0.0001`, `num_classes=196` y `standardize=False`. No se documenta el número de imágenes de entrenamiento, la composición del dataset ni si hubo aumentos de datos. No hay RLHF ni DPO por tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de vehículos en 196 clases a partir de imágenes, usando features congeladas de DINOv2 ViT-S/14.
- Extracción de una señal de evaluación reproducible sobre la calidad de las representaciones del backbone para la tarea `vehicle_classification` (nivel `high_level`).
- Integración con el ecosistema VisBench mediante `load_probe_from_hub`, que valida la compatibilidad backbone/pooling/feature mode.
- No soporta generación de texto, razonamiento, código, matemáticas ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo "thinking", visión generativa ni otras capacidades especiales más allá del sondeo lineal.

## Casos de uso

- **Evaluación comparativa de backbones**: usar el probe como referencia fija para medir cuánta información sobre vehículos retienen las features de `dinov2_vits14` frente a otros backbones, manteniendo idéntico protocolo y pooling.
- **Selección de backbone para pipelines de visión**: antes de entrenar un clasificador de vehículos completo, comprobar con este probe si las features de DINOv2 ViT-S/14 son suficientes (top-1 0,7614) o si conviene escalar a un backbone mayor.
- **Prototipado rápido de clasificación de vehículos**: cargar el probe sobre el backbone congelado para obtener una línea base funcional sin entrenamiento adicional, útil en demos y validaciones internas.
- **Auditoría de representaciones**: analizar qué clases de vehículos concentran los errores (dado el top-5 de 0,9370 frente al top-1 de 0,7614) para decidir dónde ampliar datos o afinar el backbone.
- **Investigación en interpretabilidad visual**: estudiar la linealidad de las features de DINOv2 en una tarea semántica concreta, comparando con otros probes del mismo framework VisBench.
- **Reproducción de experimentos**: replicar el ajuste con los hiperparámetros documentados (`lr=0.01`, 200 épocas, AdamW, `weight_decay=0.0001`) para verificar los resultados publicados en entornos propios.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| `top1` | 0,7614 |
| `top5` | 0,9370 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de una cabeza lineal sobre un ViT-S/14 congelado, el consumo dominante es el del backbone (órdenes de magnitud de pocos GB en FP32/FP16), no el del probe.
- GPU recomendadas: no documentadas. Cualquier GPU capaz de ejecutar `dinov2_vits14` en inferencia es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probablemente sí para el backbone ViT-S/14, pero no se aporta confirmación ni cifras en la información disponible.
- Opciones de despliegue: carga mediante la librería `visbench` y `visbench.hub.load_probe_from_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un probe de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros probes de VisBench ni modelos comparables con datos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- **No es un modelo autónomo**: es una cabeza de sondeo que solo funciona con el backbone `dinov2_vits14` en `pooling=cls` y `feature_mode=dense_only`; cualquier otro acoplamiento se rechaza o produce resultados incorrectos de forma silenciosa.
- **Alcance limitado a 196 clases de vehículos**: no generaliza a otras tareas ni a un dominio distinto sin reentrenamiento.
- **Licencia no declarada**: no se puede asumir uso comercial; es necesario contactar con el autor o revisar el repositorio VisBench antes de integrarlo en producción.
- **Sin datos de sesgo ni robustez**: no se documentan sesgos conocidos, comportamiento ante dominios desplazados ni tasas de error por clase.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar el top-1/top-5 como calidad global del backbone en otras tareas.
- **Sin información sobre el dataset de entrenamiento**: se desconoce el número de imágenes, la distribución de clases y los posibles desequilibrios, lo que limita la evaluación de su robustez.
- **Repositorio sin tracción**: 0 descargas y 0 likes; no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-vehicle_classification-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
- Paper, blog, demo: no disponible en la información proporcionada.
