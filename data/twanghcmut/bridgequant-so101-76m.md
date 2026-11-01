# twanghcmut/bridgequant-so101-76m

## Resumen

bridgequant-so101-76m es un modelo de visión-lenguaje-acción (VLA) de 64,8 millones de parámetros publicado por el usuario twanghcmut en HuggingFace. Está diseñado específicamente para el control de un brazo robótico SO101 follower, y se distribuye como un bundle de pesos entrenables junto con ficheros de normalización, configuración y metadatos que espera el cargador de la librería `bridgequant-async`. No es un modelo de propósito general: es un checkpoint de política robótica entrenado sobre tres tareas concretas.

La arquitectura combina un backbone visual DINOv3 ViT-S y un codificador de texto BERT-mini, unidos mediante un trunk de fusión de 4 capas y un mecanismo de "role-query bridge", con un experto de flujo (flow matching) de 6 capas que genera las acciones. El entrenamiento se realizó sobre 159 episodios capturados a 30 fps con cámaras top y wrist, produciendo objetivos de 6 articulaciones en espacio absoluto de juntas y chunks de acción de 8 y 16 pasos.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline VLA ligero (menos de 100M de parámetros, repo de 0,3 GB) para robótica de manipulación con hardware de bajo coste. No obstante, la información pública es escasa (10 descargas, sin benchmarks externos, licencia "other" sin texto visible), por lo que debe evaluarse como un artefacto de investigación más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: DINOv3 ViT-S (visión) + BERT-mini (texto) + trunk de fusión de 4 capas + role-query bridge + experto de flujo de 6 capas |
| Parámetros totales | 64.826.027 (64,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no disponible en la información proporcionada) |
| Formato de pesos | safetensors (`model.safetensors`) + `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`, `train_config.yaml` |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA de dos torres con fusión tardía. La torre visual emplea DINOv3 ViT-S y la torre lingüística BERT-mini; ambas se combinan en un trunk de fusión de 4 capas, tras el cual un mecanismo denominado "role-query bridge" condiciona las representaciones según el rol de la tarea. La cabeza generativa es un experto de flujo de 6 capas que produce chunks de acción mediante flow matching, con objetivos de 6 articulaciones en espacio absoluto de juntas. La salida se estructura en chunks de 16 pasos, de los cuales se ejecutan 8 de forma asíncrona (de ahí el nombre `bridgequant_async_vla`).

El entrenamiento se realizó sobre tres tareas del brazo SO101 follower con 159 episodios en total, capturados a 30 fps con dos cámaras (top y wrist). No se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; en robótica VLA lo habitual es entrenamiento supervisado por imitación, pero este dato no está confirmado en la información disponible. El autor reporta un MAE in-sample de 1,31 para chunks de 16 pasos y 1,11 para los 8 pasos ejecutados, métricas que solo reflejan ajuste sobre los datos de entrenamiento y no generalización.

## Capacidades

- Generación de acciones motoras de 6 dimensiones (juntas absolutas) para el brazo SO101 follower a partir de observaciones visuales y consignas de tarea.
- Percepción visual multi-cámara: procesa simultáneamente vistas top y wrist.
- Condicionamiento por lenguaje mediante BERT-mini, lo que permite especificar la tarea en texto.
- Generación de chunks de acción con ejecución asíncrona (16 pasos generados, 8 ejecutados), pensada para reducir la latencia de control.
- Flow matching como mecanismo de generación de trayectorias continuas.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües amplias ni modos de "thinking".
- No se ha documentado visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Manipulación robótica de laboratorio con SO101: el modelo actúa como política de imitación para las tres tareas con las que fue entrenado, recibiendo imágenes top y wrist y emitiendo comandos articulares absolutos. Es adecuado porque su salida está calibrada exactamente para ese brazo y esas cámaras.
- Reproducción de experimentos VLA ligeros: investigadores pueden cargar el bundle con `load_trainable_weights` y comparar variantes de fusión visual-lenguaje sin necesidad de GPUs de gran capacidad, dado el tamaño de 64,8 M de parámetros.
- Prototipado de control asíncrono: los chunks de 16 pasos con 8 ejecutados permiten estudiar políticas de ejecución desacoplada entre inferencia y control motor, un patrón relevante para robots con cómputo embebido limitado.
- Docencia y formación en robótica: el repo de 0,3 GB y la separación clara entre pesos, normalización y configuración lo hacen manejable como ejemplo didáctico de pipeline VLA completo.
- Base para fine-tuning en tareas nuevas del mismo robot: al incluir `train_config.yaml` y pesos entrenables, puede reutilizarse como inicialización para otras tareas del SO101, aunque requeriría nuevos datos de demostración.
- Evaluación de robustez visual: al emplear dos cámaras, permite analizar cómo afecta la oclusión o el cambio de iluminación en una torre frente a la otra en el rendimiento de la política.
- Integración en pipelines de investigación con `scripts/so101_policy.py`: el autor proporciona un script de despliegue específico (`docs/so101_deploy.md`), lo que facilita montar una demo reproducible en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es el error absoluto medio in-sample sobre las tareas de entrenamiento:

| Métrica | Valor |
|---|---|
| MAE in-sample (chunk de 16 pasos) | 1,31 |
| MAE in-sample (8 pasos ejecutados) | 1,11 |

No se proporcionan métricas out-of-sample, tasas de éxito en tareas reales ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 64,8 M de parámetros en fp32, los pesos ocupan aproximadamente 260 MB; en fp16, unos 130 MB. Sumando activaciones de DINOv3 ViT-S, BERT-mini y el experto de flujo, la inferencia debería caber holgadamente en 2-4 GB de VRAM, aunque esta cifra es una estimación y no está confirmada por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por capacidad de memoria; para control en tiempo real a 30 fps conviene una GPU dedicada con baja latencia de kernel.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo y del repo (0,3 GB).
- Opciones de despliegue: el autor documenta carga mediante la librería `bridgequant-async` (`BridgeQuantAsyncVLA.from_pretrained` + `load_trainable_weights`) y un script específico `scripts/so101_policy.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles. El diseño asíncrono (16 pasos generados, 8 ejecutados) sugiere que el autor busca solapar inferencia y control, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-so101-76m | 64,8 M | no disponible | VLA con flow matching para SO101 | other | HuggingFace, repo 0,3 GB |
| OpenVLA | 7 B | no disponible en esta ficha | VLA generalista sobre datasets tipo Open X-Embodiment | no disponible en esta ficha | HuggingFace |
| Octo | ~27 M (small) / ~93 M (base) | no disponible en esta ficha | Política transformer generalista para manipulación | no disponible en esta ficha | HuggingFace |
| RT-2 | no disponible en esta ficha | no disponible en esta ficha | VLA propietario de gran escala | propietaria | no público |

La comparación es orientativa: bridgequant-so101-76m es un checkpoint especializado en un robot concreto, mientras que OpenVLA, Octo y RT-2 son políticas generalistas. No se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo con 159 episodios de tres tareas del SO101; no se espera generalización a otras tareas, objetos o robots sin reentrenamiento.
- Métricas solo in-sample: el MAE reportado (1,31 / 1,11) mide ajuste sobre datos de entrenamiento, no éxito en ejecución real; no hay evidencia publicada de tasa de éxito out-of-sample.
- Licencia "other" sin texto visible: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio de GitHub o contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: aunque incluye BERT-mini, no se especifica qué lenguas entiende ni con qué calidad; asumir multilingüismo es arriesgado.
- Riesgo de sobreajuste y alucinación motora: con un dataset pequeño, la política puede producir trayectorias plausibles pero incorrectas ante cambios de iluminación, posición de cámara u objetos no vistos.
- Dependencia de la librería `bridgequant-async`: los pesos no son cargables con frameworks estándar sin el código del autor; esto añade riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones int8/int4, lo que limita opciones de despliegue en hardware embebido de muy bajos recursos.
- Advertencia de seguridad física: al tratarse de control de un brazo robótico real, cualquier despliegue debe contar con límites de par, paradas de emergencia y supervisión humana; el modelo no incorpora salvaguardas documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-so101-76m
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Documentación de despliegue SO101: `docs/so101_deploy.md` dentro del repositorio anterior
- Script de política SO101: `scripts/so101_policy.py` dentro del repositorio anterior
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
