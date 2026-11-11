# starstone3/HFD-TextOp-Training

## Resumen

HFD-TextOp-Training es un repositorio de Hugging Face publicado por el usuario starstone3 que contiene el entorno de entrenamiento completo (no un modelo listo para inferencia) de un sistema denominado TextOp, orientado a la generación de movimientos de un robot humanoide G1 a partir de instrucciones de texto. El paquete incluye el árbol de trabajo original, checkpoints, estados de optimizador, configuración resuelta, scripts de evaluación y utilidades de restauración, con un tamaño de repositorio de 1,7 GB. No se trata de un modelo de lenguaje generativo al uso, sino de un artefacto de ingeniería de entrenamiento con dependencias externas congeladas (CLIP, VAE, T5-base).

El modelo TextOp opera sobre entradas de texto procesadas mediante CLIP, sin audio directo, y produce acciones nativas para el robot G1 (no SMPL/SMPL-X). Trabaja a 50 Hz con 23 articulaciones y features de 57 dimensiones, con ventanas de 2 frames de historial y 8 de futuro, divididas en 4 primitives. El entrenamiento reportado cubre 126.950 sesiones de entrenamiento y 302 de validación en inglés, con un checkpoint latest en el paso 300.000 y un punto de aceptación en 299.776.

La relevancia de este repositorio es fundamentalmente de reproducibilidad: documenta con granularidad inusual (hashes SHA256, manifiestos, configuraciones resueltas, estados RNG) cómo reconstruir y continuar un entrenamiento real en una sola GPU RTX 5090. No obstante, la model card advierte explícitamente de que no se ha superado una validación de comportamiento: existen problemas conocidos de respuesta a instrucciones de parada y de recuperación autónoma del historial a largo plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de generación de movimiento condicionado por texto; usa CLIP como codificador de texto y VAE congelados, detalles de la red no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de historial 2 frames / futuro 8 frames a 50 Hz; 4 primitives) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16-mixed; TextOp en FP32) |
| Idiomas soportados | inglés (dataset de entrenamiento y validación en inglés) |
| Licencia | other (sin términos concretos especificados en la información disponible) |
| Formato de pesos | checkpoints PyTorch (`ckpt_*.pth` para TextOp; `.ckpt` para OMG) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red TextOp (capas, dimensiones ocultas, mecanismo de atención). Sí se especifica que el sistema consume texto mediante CLIP congelado, sin entrada de audio directa, y que produce acciones nativas del robot G1 a 50 Hz con 23 articulaciones y representación de 57 dimensiones. La generación se estructura en 4 primitives por cadena lógica, con historial de 2 frames y predicción de 8 frames futuros. Las estadísticas de normalización (`meanstd.pkl`), el XML del robot y el tokenizador CLIP cuentan con hashes de archivo.

El entrenamiento se realizó en una sola GPU (RTX 5090, driver 580.76.05) con Python 3.10.21, PyTorch 2.7.1+cu128 y CUDA 12.8. La configuración reportada incluye batch por tarjeta de 512, acumulación 1 (batch efectivo 512), semilla 42, optimizador AdamW con LR 1e-4 en FP32 y tres fases de currículo de 100K pasos cada una. No se usó scaler FP16 ni EMA. El dataset de referencia es `Tinghong-Ye22/data_vqa_all_1025` en un commit fijo, con 675 shards crudos referenciados por hash. La innovación técnica destacable no es arquitectónica sino de trazabilidad: el paquete permite una verificación de continuación de entrenamiento (paso 299.776 a 299.780) con comparación de pesos por tensor mediante SHA.

## Capacidades

- Generación de movimiento de robot humanoide G1 condicionada por texto en inglés.
- Producción de secuencias de acción nativas a 50 Hz con 23 articulaciones.
- Composición en 4 primitives por cadena de movimiento.
- Uso de historial de 2 frames para condicionamiento temporal.
- Entrenamiento y evaluación reproducibles con estados de optimizador, RNG y pools de muestreo restaurables.
- Evaluación mediante scripts incluidos (`evaluate_textop.py`, `infer_overfit.py`, evaluación HFD_bench).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de investigación en generación de movimiento texto-a-acción: el paquete permite restaurar el árbol de trabajo, descargar dependencias con revisiones fijas y ejecutar una continuación corta de entrenamiento para verificar la reproducibilidad en una GPU RTX 5090.
- Auditoría de entrenamientos previos: los manifiestos (`MANIFEST.json`, `SHARED_ASSETS.json`, `RAW_REQUIRED_FILES.json`) y los hashes por tensor permiten verificar la integridad de checkpoints y datos, útil en equipos que heredan runs ajenos.
- Control de robots humanoides en laboratorio: TextOp genera acciones para el G1 a partir de instrucciones textuales, adecuado para experimentos de imitación condicionada por lenguaje en entornos controlados.
- Docencia y formación en pipelines de entrenamiento: la configuración resuelta, el lock de entorno y los scripts de aceptación sirven como ejemplo completo de un run de aprendizaje profundo con currículo y checkpoints.
- Desarrollo de sistemas de evaluación de movimiento: los scripts de evaluación y el mapa de resultados (`result-map.json`) permiten integrar métricas sobre políticas generadas.
- Base para extensión a otros robots o tareas: la separación entre dependencias congeladas (CLIP, VAE, T5-base) y código propio facilita sustituir codificadores o adaptar la representación articular, siempre que se respeten las rutas absolutas de la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona explícitamente que las curvas de entrenamiento no deben interpretarse como FID formal y que no se ha completado una validación de comportamiento (se citan problemas de respuesta a instrucciones de parada y de recuperación autónoma del historial).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU empleada en el entrenamiento reportado: una RTX 5090.
- GPU recomendadas: no disponible más allá de la RTX 5090 documentada.
- Presupuesto de disco para checkpoints: al menos 3 GiB para TextOp, 24 GiB para OMG-L y 36 GiB para OMG-XL, más 4 GiB compartidos, 1 GiB local y 10.000 inodos.
- Opciones de despliegue: scripts de evaluación e inferencia incluidos en el paquete (`evaluate_textop.py`, `infer_overfit.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación de movimiento texto-a-acción para humanoides) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- No es un modelo listo para uso directo: es un paquete de entrenamiento con rutas absolutas, dependencias externas y pasos de restauración manuales.
- La validación de comportamiento no se ha superado: se documentan problemas de respuesta a instrucciones de parada y de recuperación autónoma del historial a largo plazo en TextOp.
- El checkpoint `latest` no debe considerarse automáticamente el mejor en validación; no se conservó un fichero `best` separado.
- La licencia es "other" sin términos concretos en la información disponible; el uso comercial requiere verificar condiciones con el autor.
- Idiomas: solo se documenta entrenamiento y evaluación en inglés.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de generación de movimiento, el riesgo relevante es la producción de trayectorias inválidas o inseguras.
- La reproducibilidad bit a bit solo se garantiza con el mismo hardware, código, dependencias y hashes de datos; no se garantiza entre GPUs distintas.
- No se ha completado la reconstrucción de un contenedor completo en un entorno nuevo ni la demostración de equivalencia entre hardware.
- El modelo OMG (familia relacionada) presenta mutaciones en el empalme de historial autónomo y desplazamiento insuficiente o excesivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/starstone3/HFD-TextOp-Training
- Repositorio de assets compartidos: https://huggingface.co/starstone3/HFD-Baseline-Shared-Training-Assets
- Dataset de referencia: https://huggingface.co/datasets/Tinghong-Ye22/data_vqa_all_1025
- Dataset crudo: https://huggingface.co/datasets/Tinghong-Ye22/hfd_data
