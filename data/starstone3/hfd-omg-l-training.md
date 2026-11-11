# starstone3/HFD-OMG-L-Training

## Resumen

HFD-OMG-L-Training es un repositorio de Hugging Face publicado por el usuario starstone3 que no contiene un modelo entrenado en el sentido convencional, sino un paquete de entrega de un proyecto de entrenamiento de robótica. El artefacto principal es un workspace completo de entrenamiento para el modelo OMG-L, orientado a generar acciones motoras de un robot G1 (no poses de cuerpo humano SMPL/SMPL-X). El repositorio incluye checkpoints, configuraciones resueltas, scripts de restauración de assets compartidos, manifiestos de verificación SHA256 y registros de una ejecución real de entrenamiento.

El modelo OMG-L pertenece a una familia (OMG-B, OMG-L, OMG-XL) que, según la model card, emplea las configuraciones oficiales de 50M/300M/500M parámetros respectivamente. La variante concreta entregada aquí corresponde a la configuración de 300M. El entrenamiento reportado se ejecutó en una única GPU RTX 5090 con PyTorch 2.7.1+cu128, CUDA 12.8 y precisión bf16-mixed, sobre 126.950 sesiones de conversación en inglés para entrenamiento y 302 para validación.

La relevancia del repositorio es principalmente metodológica: documenta de forma exhaustiva el proceso de handoff de un entrenamiento (checkpoints latest100000/best98000, estados completos de Lightning con optimizer, schedulers y RNG, hashes de assets externos, scripts de restauración de datos raw y procedimientos de aceptación de reanudación). No obstante, el propio autor advierte que la entrega no constituye una validación de calidad de comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion de acciones roboticas; familia OMG) |
| Parametros totales | ~300M (configuracion oficial OMG-L de 300m) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (conversaciones de entrenamiento en ingles) |
| Licencia | other |
| Formato de pesos | checkpoints Lightning (.ckpt) y pesos TextOp (.pth); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del transformer ni del codificador de acciones; indica únicamente que OMG genera directamente acciones motoras nativas de un robot G1 con 29 articulaciones, a 30 Hz, con ventanas de historia de 60 frames y futuro de 60 frames. El pipeline combina OMG (modelo de acciones) con TextOp (modelo de texto a primitivas), usando VAE y CLIP como dependencias externas congeladas. TextOp opera a 50 Hz con 23 articulaciones, features de 57 dimensiones, historia de 2 frames y futuro de 8 frames, con 4 primitivas.

El entrenamiento reportado usó un batch por GPU de 64 con acumulación de 8 (batch efectivo 512), semilla 42, AdamW con LR 6e-5 para OMG (warmup 2000 pasos, cosine hasta 1e-6) y LR 1e-4 en FP32 para TextOp en tres fases de currículo de 100K pasos. Se empleó bf16-mixed sin FP16 scaler y sin EMA. Los datos de entrada provienen de HFD a 50 Hz (IsaacLab, 29 articulaciones, root xyz + cuaternión wxyz), remuestreados a 30 Hz para OMG. La model card menciona explícitamente problemas conocidos de calidad: mutaciones en el empalme de historia autonoma y déficit o exceso de desplazamiento en OMG, y problemas de respuesta a instrucciones de parada y recuperación de historia autonoma en TextOp.

## Capacidades

- Generación de acciones motoras para robot G1 (29 articulaciones, 30 Hz), no poses humanas SMPL/SMPL-X.
- Modelado de texto a primitivas de acción (TextOp) con 4 primitivas y ventana de historia corta.
- Condicionamiento multimodal: audio pasado de 2 s para OMG y embeddings CLIP de texto para TextOp.
- Entrenamiento y reanudación reproducibles: checkpoints con estado completo de optimizador, schedulers, RNG de Python/NumPy/torch/CUDA y pools de train/val consumidos.
- Verificación de integridad mediante MANIFEST.json, SHARED_ASSETS.json y hashes SHA256 por tensor.
- No se documentan capacidades de tool calling, agentes, visión general, audio general ni razonamiento multi-paso.

## Casos de uso

- Reanudación exacta de entrenamiento: el paquete permite retomar desde step-00098000.ckpt con el estado completo de optimizador y RNG, usando el script de aceptación incluido, para reproducir una短 carrera de verificación (stop step 98002) en una GPU.
- Auditoría de reproducibilidad: los manifiestos y result-map.json permiten verificar que pesos, código, configuración y artefactos de evaluación corresponden a la misma ejecución, útil en revisiones internas o publicaciones.
- Investigación en aprendizaje por imitación de robótica: sirve como base para estudiar la representación HFD a 50 Hz remuestreada a 30 Hz con ventanas de 60/60 frames y el acoplamiento OMG + TextOp.
- Desarrollo de pipelines de evaluación de acciones: los scripts evaluate_omg.py, evaluate_textop.py e infer_overfit.py permiten montar evaluaciones reproducibles sobre checkpoints concretos.
- Reconstrucción de entornos de entrenamiento: environment-lock.txt y los scripts de restauración de assets externos (T5-base, CLIP, VAE, datos raw) permiten levantar un entorno Python 3.10 equivalente en otra máquina.
- Estudio de condicionamiento texto-acción: TextOp con CLIP y 4 primitivas puede analizarse como componente separado para investigar el mapeo lenguaje→primitiva motora.
- Formación de ingenieros en MLOps de robótica: el repositorio documenta buenas prácticas de handoff (hashes, capacity.json, command.json, sample_ids.jsonl) aplicables a otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona scripts de evaluación (evaluate_omg.py, evaluate_textop.py, HFD_bench) y advierte que las curvas de entrenamiento no deben interpretarse como FID formal. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas de robótica.

## Requisitos de hardware

- Entrenamiento reportado: una única GPU RTX 5090, driver 580.76.05, CUDA 12.8, cuDNN 90701, PyTorch 2.7.1+cu128, Python 3.10.21.
- Presupuesto de checkpoint indicado por el autor: al menos 24 GiB escribibles para OMG-L, 4 GiB para assets compartidos, 1 GiB local y 10.000 inodos.
- Repositorio de 19,7 GB; los assets externos (T5-base, CLIP, VAE, datos raw) se descartan del repo y se restauran por revisión fija.
- Despliegue/inferencia: no se especifican opciones vLLM, llama.cpp, Ollama o TGI; se usan scripts propios (evaluate_omg.py, evaluate_textop.py, infer_overfit.py).
- VRAM estimada para inferencia: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HFD-OMG-L-Training | ~300M (OMG-L) | no disponible | Generacion de acciones roboticas G1 | other | Hugging Face (repo publico) |
| OMG-B | ~50M (config oficial) | no disponible | Generacion de acciones roboticas G1 | no disponible | Mencionado en la model card; no entregado aqui |
| OMG-XL | ~500M (config oficial) | no disponible | Generacion de acciones roboticas G1 | no disponible | Mencionado en la model card; no entregado aqui |
| TextOp (componente) | no disponible | no disponible | Texto a primitivas de accion | no disponible | Incluido como componente del pipeline |

No se dispone de alternativas externas comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que la entrega no constituye una aceptacion de calidad de comportamiento del modelo.
- OMG presenta mutaciones en el empalme de historia autonoma y desplazamiento insuficiente o excesivo.
- TextOp presenta problemas de respuesta a instrucciones de parada y de recuperacion de historia autonoma a largo plazo; las mejoras con historia GT oracle no equivalen a resultados autonomos validos.
- La reproducibilidad bit a bit solo se garantiza con misma GPU, mismo codigo, dependencias, hardware, hashes de datos, entradas de cache y ajustes; no se garantiza entre GPUs distintas.
- El entrenamiento reportado fue en una sola GPU/rank0; no hay evidencia de sharding distribuido.
- No se ha completado la reconstruccion total del contenedor en un entorno nuevo, ni la prueba bit a bit entre hardwares, ni la extension a nuevas fases tras el presupuesto original.
- Existen fuentes historicas y checkpoints faltantes que el autor reconoce no haber recuperado.
- La licencia es "other"; no se detallan permisos de uso comercial, por lo que debe consultarse antes de produccion.
- La model card esta mayoritariamente en chino y contiene instrucciones de restauracion con rutas absolutas; no debe tratarse como instrucciones operativas sin revision.
- No hay datos de sesgos, alucinacion o cobertura idiomatica mas alla del ingles de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/starstone3/HFD-OMG-L-Training
- Repositorio de assets compartidos: https://huggingface.co/starstone3/HFD-Baseline-Shared-Training-Assets
- Dataset de referencia VQA: https://huggingface.co/datasets/Tinghong-Ye22/data_vqa_all_1025 (revision bdca2fe7581c263e9ceb3a96204b314e199faddf)
- Datos raw: https://huggingface.co/datasets/Tinghong-Ye22/hfd_data (revision 93ba4a7a9c66b3e1b7041e5f4ea038ef2418b948)
- No se proporcionan enlaces a papers, blogs, demos ni repositorios de codigo adicionales en la informacion disponible.
