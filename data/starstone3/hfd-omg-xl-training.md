# starstone3/HFD-OMG-XL-Training

## Resumen

HFD-OMG-XL-Training es un repositorio de Hugging Face publicado por el usuario starstone3 que contiene un *handoff* (entrega de traspaso) de un proyecto de entrenamiento real del modelo OMG-XL, orientado a la generación de movimientos de robot humanoide. No se trata de un modelo listo para inferencia directa, sino de un paquete de ingeniería de entrenamiento: árbol de trabajo completo, checkpoints, configuraciones resueltas, manifiestos de verificación SHA256, registros de ejecución y scripts de aceptación. El modelo subyacente produce de forma nativa acciones para el robot G1 (29 articulaciones), no mallas SMPL/SMPL-X humanas.

El repositorio ocupa 23,4 GB e incluye el estado completo de Lightning (optimizador, schedulers, callbacks, RNG de Python/NumPy/torch/CUDA y los pools de entrenamiento y validación consumidos), junto con dependencias externas congeladas (VAE y CLIP) que no se re-suben y se referencian mediante revisiones fijas y hashes. El entrenamiento se realizó en una única GPU RTX 5090 con Python 3.10.21, PyTorch 2.7.1+cu128 y CUDA 12.8, usando precisión bf16-mixed.

La relevancia de este repositorio es fundamentalmente de reproducibilidad y auditoría: documenta con detalle el estado exacto de un entrenamiento (best en el paso 88000, último checkpoint recuperable en el 90000, logs hasta el 92000 sin checkpoint completo asociado) y proporciona procedimientos de verificación y reanudación. No es un modelo para uso general, sino material de investigación para quienes necesiten reproducir o continuar el entrenamiento de OMG-XL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de movimiento para robot G1; componentes OMG y TextOp con VAE y CLIP congelados) |
| Parametros totales | no disponible (configuración oficial de 500m citada para OMG-XL, sin desglose de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana temporal: historia de 60 frames y futuro de 60 frames a 30 Hz para OMG; historia 2 s de audio) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16-mixed; sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (126.950 sesiones de entrenamiento y 302 de validación en inglés) |
| Licencia | other |
| Formato de pesos | checkpoints de PyTorch Lightning (.ckpt) y .pth para TextOp; estado completo con optimizer_states, lr_schedulers, loops, callbacks y RNG |

## Arquitectura y entrenamiento

El repositorio entrega el proyecto de entrenamiento de dos componentes: OMG (modelo principal de generación de movimiento, con variantes B/L/XL según configuraciones oficiales de 50m/300m/500m) y TextOp (componente auxiliar de 23 articulaciones y 57 dimensiones de特征, con 4 primitivas). OMG opera sobre entradas HFD a 50 Hz con 29 articulaciones de IsaacLab y cuaterniones root, que se remuestrean a 30 Hz y se representan con 29 articulaciones nativas, historia de 60 frames y futuro de 60 frames. TextOp trabaja a 50 Hz con historia de 2 frames y futuro de 8, usando CLIP de texto sin audio directo, mientras que OMG incorpora además 2 s de audio pasado. Los codificadores VAE y CLIP están congelados como dependencias externas.

El entrenamiento usó batch por GPU de 32 con acumulación de 16 (batch efectivo 512), semilla 42, AdamW con LR 6e-5 para OMG (2000 pasos de warmup, cosine hasta 1e-6) y LR 1e-4 en FP32 para TextOp con tres fases curriculares de 100K pasos. Se empleó bf16-mixed sin FP16 scaler y sin EMA. El dataset consta de 126.950 sesiones de entrenamiento y 302 de validación en inglés, con 675 fragmentos raw referenciados por SHA256 y una release de benchmark fijada por commit. La referencia textual es una transcripción causal del foreground con guard de 0,1 s, sin usar texto futuro.

## Capacidades

- Generación de movimiento de robot humanoide: produce acciones nativas para el robot G1 de 29 articulaciones, no mallas SMPL/SMPL-X.
- Generación condicionada por texto: TextOp emplea CLIP de texto para condicionar el movimiento.
- Condicionamiento por audio: OMG utiliza 2 s de audio pasado como entrada adicional.
- Generación autorregresiva con historial: emplea historia de 60 frames (OMG) o 2 frames (TextOp) para continuar secuencias de movimiento.
- Reanudación exacta de entrenamiento: el paquete incluye estado completo de Lightning con RNG y pools consumidos, lo que permite continuar el entrenamiento de forma determinista en el mismo hardware.
- Verificación de integridad: manifiestos SHA256 para todos los ficheros y para los recursos externos.
- Evaluación: scripts `evaluate_omg.py`, `evaluate_textop.py`, `infer_overfit.py` y el pipeline de evaluación HFD_bench.
- No se documentan capacidades de tool calling, agentes, visión ni matemáticas; el modelo no es un LLM de propósito general.

## Casos de uso

- Reproducción de experimentos de generación de movimiento: el paquete permite restaurar el árbol de trabajo completo, las dependencias con revisión fija y los checkpoints para repetir el entrenamiento en una máquina equivalente, verificando cada fichero con `verify_manifest.py`.
- Continuación de entrenamiento desde checkpoint: con `train.py --config ... --resume ...` se puede extender el entrenamiento desde el paso 90000, manteniendo el estado del optimizador, schedulers y RNG para una reanudación fiel.
- Auditoría de un run de entrenamiento: los ficheros `inventory`, `resolved_config.yaml`, `native_config.yaml`, `result-map.json` y los logs permiten reconstruir exactamente qué se ejecutó, con qué hiperparámetros y qué artefactos se produjeron.
- Validación de pipelines de datos: los manifiestos `train_native_manifest.json`, `val_native_manifest.json` y `RAW_REQUIRED_FILES.json` permiten verificar la integridad de los datos de entrenamiento y de los 675 fragmentos raw antes de reutilizarlos.
- Investigación en control de robots humanoides: sirve como base para estudiar la generación de movimiento del G1 condicionada por texto y audio, y para comparar variantes B/L/XL bajo la misma configuración.
- Desarrollo de entornos de simulación: el código de cinemática y los operadores personalizados incluidos en `upstream` permiten integrar el modelo en pipelines de simulación, aunque el autor advierte que no todos los componentes de simulación se han compilado en la nueva máquina.
- Pruebas de aceptación de reanudación: el script `all_baselines_acceptance_entry.py` y el `acceptance-report.json` permiten comparar una ejecución corta con la referencia y comprobar la igualdad de la pérdida y de los parámetros actualizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las curvas de entrenamiento no deben interpretarse como FID oficial y que la entrega no declara superada la validación de comportamiento. Se mencionan problemas conocidos de calidad: saltos en la continuación autónoma del historial y desplazamiento insuficiente o excesivo en OMG, y problemas de respuesta a comandos de parada y de recuperación del historial autónomo a largo plazo en TextOp.

## Requisitos de hardware

- Entrenamiento original: una única GPU RTX 5090, Python 3.10.21, PyTorch 2.7.1+cu128, CUDA 12.8, cuDNN 90701, driver 580.76.05.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles; el único hardware documentado es la RTX 5090 usada en el entrenamiento.
- Presupuesto de disco para checkpoints: al menos 3 GiB para TextOp, 24 GiB para OMG-L y 36 GiB para OMG-XL, más 4 GiB compartidos, 1 GiB local y 10.000 inodos.
- Despliegue: no se documentan opciones de servicio (vLLM, llama.cpp, Ollama, TGI); el flujo previsto es la ejecución de scripts de entrenamiento y evaluación con el entorno Python original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación de movimiento ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo listo para usar: es un paquete de handoff de entrenamiento con rutas absolutas, dependencias externas y procedimientos de restauración manuales.
- La licencia es "other" sin texto de licencia en la información disponible; debe revisarse antes de cualquier uso comercial.
- El modelo genera acciones del robot G1, no mallas humanas SMPL/SMPL-X; no es intercambiable con modelos de captura de movimiento humanos.
- Solo se documenta entrenamiento en inglés; no se declaran capacidades multilingües.
- Calidad de comportamiento no validada: el autor reconoce saltos en la continuación del historial, desplazamiento insuficiente o excesivo, y problemas de respuesta a comandos de parada y de recuperación del historial en TextOp.
- Los resultados de la prueba corta de aceptación no garantizan igualdad bit a bit entre GPUs distintas, ni que la pérdida coincidente implique calidad de movimiento.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero el modelo puede generar movimientos no realistas o inconsistentes con el condicionamiento.
- No se han completado la reconstrucción de contenedor en el nuevo entorno, la demostración bit a bit entre hardware ni la extensión a una nueva fase tras el presupuesto original.
- El repositorio tiene 0 descargas y 0 likes, y no cuenta con pipeline declarado; no hay evidencia de uso por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/starstone3/HFD-OMG-XL-Training
- Repositorio de activos compartidos: https://huggingface.co/starstone3/HFD-Baseline-Shared-Training-Assets
- Release de benchmark: Tinghong-Ye22/data_vqa_all_1025 (commit bdca2fe7581c263e9ceb3a96204b314e199faddf)
- Fuente raw de datos: Tinghong-Ye22/hfd_data (commit 93ba4a7a9c66b3e1b7041e5f4ea038ef2418b948)
