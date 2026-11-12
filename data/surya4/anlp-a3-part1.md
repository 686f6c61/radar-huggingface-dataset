# Surya4/anlp-a3-part1

## Resumen

`Surya4/anlp-a3-part1` es un conjunto de checkpoints académicos publicados por el usuario Surya4 para la Parte A de la asignatura ANLP (Monsoon 2026). No es un modelo de lenguaje generativo al uso, sino una comparativa controlada de cuatro arquitecturas de mezcla de secuencias (Transformer, Mamba, DeltaNet y un híbrido Mamba-DeltaNet) entrenadas bajo un protocolo idéntico para resolver una tarea de descifrado de cifrados a nivel de carácter. El objetivo es aislar el efecto del mecanismo de mezcla secuencial, manteniendo constantes datos, tamaño y esquema de entrenamiento.

Cada checkpoint contiene pesos, configuración de entrenamiento y vocabularios de caracteres en un único diccionario de `torch.save`, lo que permite recargar el modelo sin ficheros externos. El modelo es un transductor por posición: lee un parche de texto cifrado y emite una distribución de 27 clases (alfabeto del texto plano) en cada posición en una sola pasada, en lugar de decodificar de forma autorregresiva. Los cuatro modelos rondan los 5 millones de parámetros y se entrenaron con 10.000 pasos a batch 16 sobre 100.000 documentos.

La relevancia es fundamentalmente docente y metodológica: sirve para estudiar cómo se comportan mixers lineales y selectivos frente a atención estándar en una tarea determinista pero efectivamente inaprendible más allá de los primeros caracteres. Los propios autores advierten que no es apto para atacar ni proteger sistemas criptográficos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, Mamba, DeltaNet e híbrido Mamba-DeltaNet (transductor por posición, no autorregresivo) |
| Parámetros totales | Transformer 4,92 M; DeltaNet 4,82 M; Mamba 5,17 M; híbrido 4,99 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Parches de 64 caracteres con warm-up de 4 caracteres; hasta 16 parches por documento en decodificación completa |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (trabaja a nivel de carácter sobre alfabetos de 63 símbolos de entrada y 27 de salida) |
| Licencia | MIT |
| Formato de pesos | `torch.save` (`.pt`) con diccionario que incluye `model`, `config`, `source_chars`, `target_chars` y `val_loss` |

## Arquitectura y entrenamiento

Los cuatro modelos comparten `d_model=256`, 6 capas, 4 cabezas de dimensión 64, FFN de anchura 1024 y dropout 0,1. Mamba usa `d_state=8`, `expand=4`, convolución causal de kernel 4 y un scan selectivo fusionado en Triton; sus bloques no llevan FFN separada, siguiendo el paper original. DeltaNet emplea tamaño de chunk 64 con resolución triangular, y el híbrido alterna una capa Mamba y una DeltaNet (cuatro de cada). El entrenamiento usa AdamW con schedule coseno, warmup de 500 pasos, grad clipping 1.0 y autocast fp16, con scans y resoluciones triangulares en fp32.

Los datos son de nivel de carácter y provienen del split `train` liberado. El alfabeto del cifrado incluye 18 símbolos de puntuación insertados como ruido que se eliminan antes del modelado, de modo que cifrado y plano quedan alineados uno a uno (longitud idéntica en el 100% de los pares, ratio medio 1.0000 frente a 1.1311 original). Los alfabetos resultantes son de 63 y 27 símbolos, con vocabulario total de 94 tokens incluyendo padding, separador, fin y desconocido. Los documentos se dividen en parches alineados de 64 caracteres con warm-up de 4 caracteres de cifrado, y se entrena sobre una muestra barajada de 100.000 documentos (unos 185 MB de JSONL) durante 10.000 pasos a batch 16. No se menciona RLHF ni DPO.

La innovación principal es la formulación como transductor por posición, que elimina la alineación fuente-destino que un decodificador autorregresivo debe aprender por separado y reduce la inferencia a una sola pasada. Los autores comparan con una variante autorregresiva previa, idéntica por lo demás, que alcanzaba 4,45% de precisión por carácter con pérdida de validación 1,43; el transductor logra 2,1 veces más precisión y evalúa aproximadamente 50 veces más rápido, aunque su pérdida de validación es mayor (2,848–2,855) porque no aprovecha el modelado del lenguaje plano como atajo.

## Capacidades

- Descifrado de cifrados a nivel de carácter sobre pares alineados plano/cifrado, emitiendo una distribución de 27 clases por posición.
- Inferencia en una sola pasada por parche, sin decodificación autorregresiva paso a paso.
- Comparación controlada de cuatro mecanismos de mezcla secuencial bajo un protocolo idéntico.
- Procesamiento de documentos de hasta 16 parches de 64 caracteres con decodificación completa.
- Carga autocontenida: pesos, configuración y vocabularios en un único fichero `.pt`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües; opera sobre alfabetos de caracteres concretos definidos en el checkpoint.

## Casos de uso

- Docencia y estudio de arquitecturas de secuencia: permite comparar Transformer, Mamba, DeltaNet e híbridos con el mismo presupuesto de entrenamiento y los mismos datos, aislando el efecto del mixer.
- Reproducción de experimentos académicos: los checkpoints incluyen configuración y vocabularios, lo que facilita replicar exactamente el protocolo de la asignatura ANLP.
- Análisis del compromiso precisión-exhaustividad en tareas deterministas pero inaprendibles: los resultados (precisión del 54–72% con recall en torno al 2%) sirven como caso de estudio de calibración y abstención.
- Benchmark de eficiencia de inferencia: la comparación transductor frente a decodificador autorregresivo (2,1 veces más precisión y unas 50 veces más rápido) es un ejemplo práctico de diseño de cabecera de salida.
- Evaluación de implementaciones de Mamba y DeltaNet en PyTorch con scan Triton y resolución triangular en fp32, útil para validar código de referencia.
- Pruebas de juguete en pipelines de investigación: modelos de ~5 M de parámetros que caben en CPU y permiten iterar rápidamente sobre formulaciones de transductores carácter a carácter.

## Benchmarks y rendimiento

Evaluación sobre 100 documentos de prueba de longitud corta a media con decodificación completa (hasta 16 parches por documento). Métricas a nivel de carácter; precisión, recall y F1 promediados macro sobre caracteres.

| Modelo | Char acc | Word acc | Precision | Recall | F1 | Levenshtein | Params | FLOPs |
|---|---|---|---|---|---|---|---|---|
| Transformer | 8,97% | 1,0% | 54,2% | 2,14% | 1,57% | 738,0 | 4,92 M | 1,37 G |
| DeltaNet | 9,15% | 6,0% | 67,5% | 2,31% | 1,91% | 736,5 | 4,82 M | 1,52 G |
| Mamba | 9,21% | 9,0% | 71,9% | 2,38% | 2,04% | 736,0 | 5,17 M | 2,81 G |
| Híbrido | 9,26% | 12,0% | 69,3% | 2,43% | 2,14% | 735,5 | 4,99 M | 2,16 G |

La pérdida de validación final se sitúa entre 2,848 y 2,855 para los cuatro modelos, frente a 3,296 de una distribución uniforme sobre los 27 símbolos del texto plano. La variante autorregresiva previa alcanzó 4,45% de precisión por carácter con pérdida de validación 1,43.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para cualquiera de los cuatro modelos (~5 M de parámetros, es decir, unos 20 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente, y la inferencia en CPU es viable.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: el formato es `torch.save` con `weights_only=False`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint. El código de inferencia del repositorio asociado reconstruye la arquitectura desde `payload["config"]`.
- Latencia y throughput: no se publican cifras absolutas; los autores indican que la formulación transductora evalúa aproximadamente 50 veces más rápido que el decodificador autorregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Char acc | Precisión | Licencia | Formato |
|---|---|---|---|---|---|---|
| Transformer (este repo) | 4,92 M | Parche 64 + warm-up 4 | 8,97% | 54,2% | MIT | `.pt` |
| DeltaNet (este repo) | 4,82 M | Parche 64 + warm-up 4 | 9,15% | 67,5% | MIT | `.pt` |
| Mamba (este repo) | 5,17 M | Parche 64 + warm-up 4 | 9,21% | 71,9% | MIT | `.pt` |
| Híbrido Mamba-DeltaNet (este repo) | 4,99 M | Parche 64 + warm-up 4 | 9,26% | 69,3% | MIT | `.pt` |

No se dispone de información sobre modelos externos comparables en la misma tarea de descifrado carácter a carácter con este protocolo; las alternativas naturales son los propios checkpoints del repositorio.

## Limitaciones y advertencias

- Los propios autores indican que los pesos son un artefacto académico y no son aptos para proteger ni atacar sistemas criptográficos reales.
- La precisión por carácter es baja (en torno al 9%) por diseño del dataset: el mapeo es determinista pero efectivamente inaprendible más allá de los primeros caracteres. Solo el 5,3% de los contextos de validación aparecen en entrenamiento.
- Fuerte desequilibrio precisión-recall: precisión del 54–72% con recall en torno al 2%, lo que refleja abstención en la mayoría de posiciones.
- La precisión en posiciones 0–3 es de aproximadamente 0,23 frente a 0,037 por azar, y cae al azar a partir de la posición 5.
- No se documentan sesgos sociales ni evaluación multilingüe; el modelo opera sobre alfabetos de caracteres concretos y no generaliza a otros cifrados.
- Licencia MIT: permite uso comercial, pero el valor práctico del modelo fuera del ámbito docente es muy limitado.
- El checkpoint requiere `weights_only=False` al cargarse, lo que implica ejecutar código de deserialización de pickle; conviene verificar la procedencia antes de cargarlo en producción.
- No hay información sobre cuantización, por lo que no se puede asumir compatibilidad con pipelines de GGUF o similar.

## Enlaces

- Hugging Face: https://huggingface.co/Surya4/anlp-a3-part1
- Repositorio de inferencia asociado: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
