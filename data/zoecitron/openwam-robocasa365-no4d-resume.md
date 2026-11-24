# zoecitron/openwam-robocasa365-no4d-resume

## Resumen

`zoecitron/openwam-robocasa365-no4d-resume` es un checkpoint de entrenamiento intermedio del modelo fundacional de robótica OpenWAM-Alpha, publicado por el usuario zoecitron. No se trata de un modelo listo para inferencia, sino de un estado de reanudación completo (pesos, momentos de Adam, scheduler y estados aleatorios de los ocho rangos) que permite continuar el entrenamiento exactamente donde se dejó. El modelo base es OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model, un modelo de política robótica de tipo vision-language-action (VLA) con representación conjunta de vídeo y acciones.

El checkpoint refleja las primeras 1.000 de 60.000 actualizaciones de optimizador de un ajuste fino sobre el dataset completo RoboCasa365 (32.043 demostraciones, 29.074.183 ventanas muestreables). La arquitectura es un transformer de doble sistema con self-attention conjunta entre tokens de vídeo y de acción, entrenado en BF16 con DeepSpeed ZeRO-2 sobre 8 GPUs. La variante "no4d" indica que no se emplean etiquetas de tracking, decodificador geométrico ni pérdida 4D: solo pérdida de vídeo y de acción con peso 1 cada una.

Su relevancia es operativa: el repositorio de 134,7 GB documenta de forma exhaustiva el procedimiento de reproducción en nodos H100/H800, incluye verificación por SHA-256 de cada fichero y permite reanudar el entrenamiento de forma determinista. Es material de interés para equipos de investigación en robótica que quieran reproducir o extender el ajuste fino de OpenWAM-Alpha sobre RoboCasa365 sin reiniciar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble sistema con self-attention conjunta entre tokens de video y accion (vision-language-action) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 33 pasos temporales, 9 frames de video a 384x320) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint independiente) + estado de entrenamiento DeepSpeed/Accelerate |
| Modelo base | OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model |
| Dataset de entrenamiento | OpenWAM/RoboCasa365 (revision 210ade4e7b22e3afd38189525dcb598d3a7ed955) |
| Estado de entrenamiento | 1.000 / 60.000 actualizaciones de optimizador |
| Precision de entrenamiento | BF16 |
| Tamano del repositorio | 134,7 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de doble sistema en la que los tokens de vídeo y de acción comparten self-attention conjunta, de modo que cada modalidad es visible para la otra. La entrada combina tres vistas de cámara (exterior izquierda, muñeca y exterior derecha) en un tensor de 384×320, con ventanas de 33 pasos temporales originales y muestreo de vídeo cada 4 frames (9 frames por ventana). Las acciones del efector final se mapean a una representación de 80 dimensiones de acción/estado. Esta variante "no4d" prescinde de etiquetas de tracking, decodificador geométrico y pérdida 4D; únicamente se optimizan las pérdidas de vídeo y de acción, ambas con peso 1.

El entrenamiento se realizó sobre las particiones atomic y composite de RoboCasa365, con 32.043 demostraciones y 29.074.183 ventanas muestreables. La configuración usa 8 GPUs con micro-batch 4 por GPU y acumulación de gradiente 4 (batch efectivo 128), AdamW con learning rate base 1e-4, betas (0.9, 0.95), weight decay 0.01, clipping de gradiente 1, scheduler coseno con 5% de warmup y ratio mínimo 0.01, semilla 42 y DeepSpeed ZeRO-2. Se guarda un estado completo cada 1.000 actualizaciones. El checkpoint incluye una implementación de referencia y una implementación acelerada (ResearchBoost, PR #58) que preserva la convención de acumulación de gradiente y el flujo aleatorio de los workers; en pruebas cortas sobre A800, la versión acelerada registró 10,61 s/actualización frente a 12,46 y 12,40 s de la de referencia.

## Capacidades

- Generación conjunta de vídeo y acciones para control robótico de efector final en entornos de manipulación tipo RoboCasa.
- Procesamiento multimodal de tres vistas de cámara simultáneas (exterior izquierda, muñeca, exterior derecha).
- Modelado de secuencias temporales de 33 pasos con muestreo de vídeo cada 4 frames.
- Representación unificada de acción/estado en 80 dimensiones.
- Reanudación determinista del entrenamiento: restaura pesos, momentos de Adam de primer y segundo orden, scheduler y estados aleatorios de los 8 rangos.
- Verificación de integridad mediante SHA-256 por fichero y resúmenes de contenido de primeras frames y acciones por rank.
- Soporte de dos implementaciones de entrenamiento intercambiables (referencia y acelerada) con idéntico batch global, número de actualizaciones, scheduler y orden de datos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al tratarse de un modelo de política robótica.

## Casos de uso

- Reproducción de experimentos de robótica: el checkpoint permite retomar el ajuste fino de OpenWAM-Alpha sobre RoboCasa365 desde la actualización 1.001 hasta la 60.000, garantizando que el orden de muestras y el estado del optimizador coinciden con el entrenamiento original, lo que facilita la reproducibilidad de resultados publicados.
- Investigación en políticas VLA: sirve como punto de partida para estudiar variantes arquitectónicas (por ejemplo, introducir pérdidas 4D o decodificadores geométricos) comparando contra una línea base ya entrenada 1.000 pasos sobre el dataset completo.
- Ajuste fino sobre dominios robóticos propios: al estar a solo 1.000 pasos del preentrenamiento, el modelo conserva buena parte de las representaciones del foundation model y admite especialización posterior con menos cómputo que un entrenamiento desde cero.
- Auditoría de pipelines de entrenamiento distribuido: el repositorio documenta la verificación de estados de Adam, numeración de muestras y resúmenes de contenido por rank, útil para validar infraestructuras DeepSpeed ZeRO-2 en clusters de 8 GPUs.
- Benchmarking de implementaciones: permite comparar la implementación de referencia frente a la acelerada (ResearchBoost) en términos de tiempo por actualización y divergencia numérica, con mediciones registradas de 12,4 s frente a 10,6 s por paso en A800.
- Formación y docencia: el bundle incluye recetas de descarga, verificación, preparación de datos y lanzamiento con smoke test, lo que lo convierte en un ejemplo práctico de reanudación de entrenamientos a gran escala con checkpoints de más de 100 GB.
- Desarrollo de sistemas de manipulación con múltiples cámaras: la combinación de vistas externas y de muñeca en una única representación es directamente reutilizable en tareas de pick-and-place y ensamblaje en entornos simulados tipo RoboCasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son de entrenamiento: 12,46 y 12,40 s/actualización con la implementación de referencia frente a 10,61 s/actualización con la acelerada, medidos en pruebas cortas emparejadas sobre 8×A800 80 GB. No se reportan métricas de éxito en tareas, MMLU, HumanEval ni GSM8K, que además no aplican a un modelo de política robótica.

## Requisitos de hardware

- Entrenamiento: nodo único con 8 GPUs de la familia H (H100 u H800) con 80 GB por GPU, equivalente al nodo de origen con 8×A800 80 GB. DeepSpeed ZeRO-2 reparte el estado del optimizador entre los 8 rangos.
- Almacenamiento: más de 400 GB de espacio libre en un sistema de ficheros local NVMe, con directorio de descarga, directorio de entrenamiento y datos en el mismo sistema de ficheros para permitir hardlinks.
- Inferencia: no se documentan requisitos de VRAM para inferencia; el repositorio está orientado a reanudar entrenamiento, no a despliegue.
- GPU de consumo: no se documenta compatibilidad con GPUs consumer; el tamaño del estado completo (134,7 GB) y la necesidad de 8 rangos ZeRO-2 hacen inviable el entrenamiento en una sola GPU consumer.
- Software: Python 3.13.15, PyTorch 2.10.0+cu128, torchvision 0.25.0, FlashAttention 2.7.4.post1 compilado contra el ABI local, PyAV 18.1.0 y DeepSpeed con ZeRO-2.
- Opciones de despliegue: el repositorio usa un script `recipe/launch.sh` con modos `--smoke` y completo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint.
- Throughput: aproximadamente 10,6 s por actualización de optimizador con la implementación acelerada en 8×A800, lo que equivale a unas 0,094 actualizaciones por segundo con batch efectivo 128.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| zoecitron/openwam-robocasa365-no4d-resume | no disponible | ventanas de 33 pasos, 9 frames | Checkpoint de reanudacion VLA (video + accion) | apache-2.0 | 1.000 / 60.000 actualizaciones |
| OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model | no disponible | no disponible | Modelo fundacional de robotica (base) | no disponible en la informacion | Pesos preentrenados |
| OpenWAM-Alpha ajustado a RoboCasa365 (variante 4D) | no disponible | no disponible | VLA con perdida 4D y decodificador geometrico | no disponible en la informacion | No disponible en la informacion |

La comparación se limita al ecosistema OpenWAM porque no se dispone de datos de parámetros, contexto ni benchmarks de alternativas externas en la información proporcionada. La diferencia principal frente al modelo base es el ajuste fino sobre RoboCasa365; la diferencia frente a la variante 4D es la ausencia de etiquetas de tracking, decodificador geométrico y pérdida 4D.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: es un checkpoint de entrenamiento a mitad de ajuste (1.000 de 60.000 actualizaciones) y su uso previsto es reanudar el entrenamiento, no desplegar una política final.
- El repositorio ocupa 134,7 GB y requiere descarga completa más espacio adicional para datos y estados, con un mínimo recomendado de 400 GB libres.
- La reproducibilidad exacta exige mantener el mismo orden de muestras, la misma semilla (42) y la misma convención de acumulación de gradiente; desviarse de la receta puede invalidar la comparación con el entrenamiento original.
- La implementación acelerada presenta diferencias de punto flotante respecto a la de referencia; no se ha verificado igualdad bit a bit ni se ha medido velocidad en GPUs H.
- El scheduler registra 8 ticks por actualización de optimizador, de modo que `last_epoch=8000` corresponde a 1.000 actualizaciones; interpretar ese valor de forma literal induce a error.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe, al no ser un modelo de lenguaje conversacional.
- El entrenamiento se limita al simulador RoboCasa365; no hay evidencia en la información disponible sobre transferencia a robots físicos ni sobre generalización fuera de ese dominio.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del dataset RoboCasa365, no detalladas en la información proporcionada.
- El modelo se publica bajo una cuenta de usuario individual (zoecitron) sin métricas de adopción (0 descargas, 0 likes) y sin validación externa documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zoecitron/openwam-robocasa365-no4d-resume
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model
- Dataset RoboCasa365 (revision fijada): https://huggingface.co/datasets/OpenWAM/RoboCasa365/tree/210ade4e7b22e3afd38189525dcb598d3a7ed955
- Implementacion acelerada ResearchBoost (PR #58): https://github.com/OpenWAM-Official/OpenWAM/pull/58
