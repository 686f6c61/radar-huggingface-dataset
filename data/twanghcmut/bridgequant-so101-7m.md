# twanghcmut/bridgequant-so101-7m

## Resumen

bridgequant-so101-7m es un modelo de visión-lenguaje-acción (VLA) de escala muy reducida, con 6.593.715 parámetros totales, publicado por el usuario twanghcmut en Hugging Face. Está diseñado para el control de un brazo robótico SO101 (follower arm) y forma parte del proyecto BridgeQuant, cuyo código de carga e inferencia se distribuye en el repositorio VLAOpt/bridgequant-async. No es un modelo de lenguaje generalista: su propósito es mapear observaciones visuales y consignas hacia acciones motoras de baja dimensión.

La arquitectura combina un codificador visual Theia-tiny ViT, un codificador de texto BERT-tiny podado y un tronco híbrido de atención y convolución corta, con un puente de consultas por rol (role-query bridge) y un experto de flujo basado en convolución corta para generar las acciones. El modelo se ha entrenado en tres tareas de manipulación con el brazo SO101, y el autor reporta un MAE en muestra (in-sample) de 1,36 y 1,14 según la tarea o métrica.

Su relevancia es acotada pero específica: demuestra que un VLA funcional para robótica de bajo coste puede caber en menos de 7 millones de parámetros, lo que permite desplegarlo en hardware embebido y ejecutar políticas de control en tiempo real. No obstante, la información pública es mínima, la licencia es "other" sin detalle y no hay benchmarks ni datos de generalización fuera de muestra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: ViT Theia-tiny + BERT-tiny podado + tronco híbrido atención/convolución corta + role-query bridge + experto de flujo de convolución corta |
| Parámetros totales | 6.593.715 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible |
| Licencia | other (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | safetensors (model.safetensors), más norm_stats.json, bridgequant_vla.yaml, config.json, metadata.json y train_config.yaml |

## Arquitectura y entrenamiento

El modelo sigue un diseño VLA compacto. La entrada visual se procesa con un ViT Theia-tiny y la consigna textual con un BERT-tiny podado; ambas representaciones se fusionan mediante un tronco híbrido que alterna atención y convoluciones cortas, y un puente de consultas por rol (role-query bridge) que asigna consultas específicas a cada rol de la tarea. La salida de acciones se genera con un experto de flujo basado en convolución corta. El bundle incluye normalización de estados y acciones en norm_stats.json, lo que indica que el modelo opera sobre observaciones y acciones normalizadas.

El entrenamiento se realizó sobre tres tareas con el brazo SO101 follower, según la model card. El autor reporta un error absoluto medio en muestra de 1,36 y 1,14, pero no se especifica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. Tampoco se detalla si se empleó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de acciones motoras para un brazo robótico SO101 a partir de observaciones visuales y consignas.
- Percepción visual mediante codificador ViT Theia-tiny.
- Comprensión de instrucciones textuales mediante BERT-tiny podado.
- Control de políticas de manipulación en tres tareas específicas de SO101.
- Carga e integración mediante la API `BridgeQuantAsyncVLA.from_pretrained` y `load_trainable_weights` del repositorio bridgequant-async.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, audio ni visión generalista más allá del uso robótico.

## Casos de uso

- Control de brazo SO101 en laboratorio: el modelo se carga con `scripts/so101_policy.py` y se usa para generar acciones normalizadas a partir de imágenes y consignas, adecuado por su tamaño reducido para prototipos de bajo coste.
- Investigación en VLA compactos: sirve como referencia para estudiar arquitecturas híbridas atención/convolución en robótica con menos de 7 millones de parámetros.
- Despliegue en hardware embebido: su tamaño permite ejecutar la política en dispositivos con recursos limitados, siempre que se valide la latencia en el hardware objetivo.
- Reproducción de experimentos: el repositorio incluye train_config.yaml y el bundle de carga, lo que facilita replicar el entrenamiento en las tres tareas SO101.
- Evaluación de normalización estado/acción: norm_stats.json permite integrar el modelo en pipelines que requieran escalado consistente de observaciones y acciones.
- Docencia y demostraciones de robótica: útil para ilustrar el ciclo completo de un VLA (visión, lenguaje, acción) en entornos académicos con hardware asequible.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| MAE in-sample | 1,36 | Reportado por el autor en la model card |
| MAE in-sample | 1,14 | Reportado por el autor en la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni evaluaciones fuera de muestra en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 6,59 M de parámetros; no se dispone de estimaciones oficiales.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna podría alojarlo, pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí, dado el reducido número de parámetros; sin datos oficiales de latencia ni throughput.
- Opciones de despliegue: carga mediante el repositorio bridgequant-async (`BridgeQuantAsyncVLA.from_pretrained` y `load_trainable_weights`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bridgequant-so101-7m | 6,59 M | No disponible | other | Hugging Face |
| Alternativas VLA compactas | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con modelos VLA de la misma categoría en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenado únicamente en tres tareas de SO101; no hay evidencia de generalización a otras tareas, brazos o entornos.
- El MAE reportado es in-sample, por lo que no refleja el rendimiento en condiciones no vistas.
- No se documentan sesgos conocidos, pero al ser un modelo robótico específico, su comportamiento fuera de la distribución de entrenamiento es incierto.
- Riesgo de alucinación no aplica en el sentido de texto generativo, pero sí de acciones incorrectas ante entradas no vistas.
- Licencia "other" sin texto detallado: es necesario contactar con el autor o revisar el repositorio antes de un uso comercial.
- No hay información sobre idiomas soportados, longitud de contexto ni cuantizaciones disponibles.
- El repositorio tiene 0,0 GB y 9 descargas, lo que sugiere un proyecto incipiente y poca validación comunitaria.
- La integración requiere el repositorio bridgequant-async y seguir `docs/so101_deploy.md`; no es un modelo plug-and-play con frameworks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/bridgequant-so101-7m
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Documentación de despliegue SO101: `docs/so101_deploy.md` (dentro del repositorio)
- Script de política SO101: `scripts/so101_policy.py` (dentro del repositorio)
