# tylergp/molmoact2-libero-ft-10mm-100

## Resumen

El modelo `tylergp/molmoact2-libero-ft-10mm-100` es un fine-tuning del modelo base MolmoAct2, desarrollado por Allen Institute for AI (AllenAI), especializado en razonamiento de acción para robótica (Vision-Language-Action, VLA). Este checkpoint concreto ha sido ajustado por el usuario tylergp sobre el conjunto de datos LIBERO, un benchmark estándar para evaluación de manipulación robótica, con una configuración de 10 millones de muestras y 100 pasos de entrenamiento (según la nomenclatura del nombre). El modelo está pensado para ser utilizado como controlador de robots en entornos simulados o reales, partiendo de la arquitectura Molmo2-ER, un VLM especializado en razonamiento espacial y encarnado.

Con 5.485.309.488 parámetros (aproximadamente 5,5 mil millones), este modelo se sitúa en un rango medio para VLA, lo que permite su ejecución en hardware relativamente accesible. La licencia MIT facilita su uso comercial y académico sin restricciones significativas. Su relevancia actual radica en que MolmoAct2 es uno de los pocos modelos de acción razonada completamente abiertos, diseñados para despliegue real, y este fine-tuning específico para LIBERO ofrece una inicialización optimizada para tareas de manipulación bimanual y de un solo brazo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Molmo2-ER (VLM base) + cabezal de acción (MolmoAct2) |
| Parametros totales | 5.485.309.488 (5,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda de Molmo2-ER, probablemente 8K o 16K, sin confirmar) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés, sin confirmación para este fine-tune) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2 se basa en Molmo2-ER, un modelo de lenguaje y visión (VLM) especializado en razonamiento espacial y encarnado, entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar" (specialize-then-rehearse). El modelo base MolmoAct2 añade un cabezal de acción que convierte las representaciones visuales y lingüísticas en comandos de control del robot (por ejemplo, posiciones de articulaciones o acciones de extremo). El fine-tuning de tylergp se realizó sobre el benchmark LIBERO, que incluye tareas de manipulación con variaciones de objetos, escenas y tareas. El nombre "10mm-100" sugiere que se usaron 10 millones de muestras (posiblemente aumentadas) y 100 épocas o pasos, aunque no se especifica el procedimiento exacto. No se han publicado detalles sobre el dataset de entrenamiento específico, la composición de las muestras ni si se aplicó RLHF o DPO; el autor solo indica que parte del checkpoint base `allenai/MolmoAct2`.

## Capacidades

- Generación de acciones robóticas: dado un prompt visual (imagen de cámara) y una instrucción en lenguaje natural, el modelo produce secuencias de acciones de control para el robot.
- Razonamiento espacial y encarnado: hereda las capacidades de Molmo2-ER para comprender relaciones espaciales, posiciones de objetos y geometría del entorno.
- Comprensión de instrucciones multimodales: combina entrada de imagen y texto para interpretar tareas complejas de manipulación.
- Soporte para múltiples configuraciones robóticas: el modelo base MolmoAct2 admite diferentes embodiment (bimanual YAM, DROID Franka, SO-100/SO-101), y este fine-tune está orientado a LIBERO, que usa un brazo robótico simulado.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Simulación de manipulación robótica en LIBERO: el modelo puede ser evaluado directamente en el benchmark LIBERO para medir su tasa de éxito en tareas como "abrir la tapa", "recoger el objeto" o "apilar bloques", sirviendo como referencia para investigación en VLA.
- Control de robots en entornos de investigación: laboratorios que trabajan con brazos robóticos tipo Franka o SO-100 pueden usar este checkpoint como inicialización para fine-tuning en sus propios entornos, aprovechando el conocimiento previo de LIBERO.
- Desarrollo de políticas de manipulación para tareas domésticas: el modelo puede adaptarse a tareas como recoger objetos, ordenar o interactuar con electrodomésticos, partiendo de las habilidades aprendidas en LIBERO.
- Evaluación comparativa de arquitecturas VLA: investigadores pueden usar este modelo como baseline para comparar con otros enfoques de razonamiento de acción, midiendo latencia, precisión y generalización.
- Prototipado rápido de controladores robóticos: gracias a su licencia MIT y tamaño moderado, es viable desplegarlo en estaciones de trabajo con GPU para pruebas de concepto sin necesidad de infraestructura masiva.
- Fine-tuning para dominios específicos: empresas o grupos de investigación pueden partir de este checkpoint y ajustarlo con datos propios de su robot concreto, reduciendo el tiempo de entrenamiento y mejorando el rendimiento inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning (`tylergp/molmoact2-libero-ft-10mm-100`) en la información disponible. El paper de MolmoAct2 (arXiv:2605.02881) reporta resultados del modelo base en LIBERO y otros benchmarks, pero no se dispone de esos números en el material proporcionado. Se recomienda consultar el repositorio oficial de AllenAI para métricas detalladas.

## Requisitos de hardware

- VRAM estimada: con 5,5 mil millones de parámetros, en FP16 se necesitan aproximadamente 11 GB solo para los pesos. Con cuantización a 8 bits (si estuviera disponible) se reduciría a ~5,5 GB, y a 4 bits a ~2,75 GB. Sin embargo, el repo solo contiene safetensors sin cuantizar, por lo que la inferencia en FP16 requiere al menos 12-16 GB de VRAM considerando activaciones y memoria intermedia.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) son adecuadas para inferencia en FP16. Para entrenamiento o fine-tuning, se recomienda al menos 24 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí, una RTX 3090 o 4090 puede ejecutar el modelo en FP16, aunque con limitaciones de batch size. Con cuantización (no publicada) cabría en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de PyTorch con safetensors, se puede servir con vLLM (si se adapta a la arquitectura), TGI, o mediante scripts personalizados con Hugging Face Transformers. Para robótica, normalmente se integra en un bucle de control en tiempo real, por lo que se recomienda usar ONNX Runtime o TensorRT para reducir latencia.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de decodificación de decenas de milisegundos por token en GPU moderna, pero el modelo genera secuencias de acciones completas, por lo que la latencia total depende de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos VLA en este momento. Se puede mencionar que alternativas como OpenVLA (7B parámetros) o RT-2 (55B) existen, pero no se tienen métricas comparables para este fine-tune concreto. La información disponible no permite establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en inglés y en entornos simulados, puede tener dificultades con instrucciones en otros idiomas o con escenarios muy diferentes a los de LIBERO.
- Riesgo de alucinación: como todo modelo generativo, puede producir acciones inconsistentes o no válidas si la entrada visual o textual es ambigua o fuera de distribución.
- Limitaciones de contexto: la longitud de contexto no está confirmada; para tareas robóticas con historial largo de observaciones, podría ser insuficiente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base MolmoAct2 puede tener términos adicionales (aunque el repo indica MIT, se recomienda verificar el repositorio de AllenAI).
- Caveat para producción: este fine-tuning es experimental (0 descargas, autor individual) y no ha sido validado en entornos reales. Se recomienda probar exhaustivamente antes de cualquier despliegue en robots físicos.
- Dependencia de la arquitectura Molmo2-ER: el modelo requiere el código personalizado de MolmoAct2 (custom_code en HuggingFace), lo que puede complicar la integración en frameworks estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-100
- Repositorio oficial de MolmoAct2 (AllenAI): https://github.com/allenai/molmoact2
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Versión HTML del paper: https://arxiv.org/html/2605.02881v1
- Checkpoints relacionados (fine-tunes del mismo autor): https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-30 y https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-300
