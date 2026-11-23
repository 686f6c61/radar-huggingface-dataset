# zzzmahesh/Qwen3.5-0.8B-weight-edited

## Resumen

Qwen3.5-0.8B-weight-edited es una modificación del modelo Qwen/Qwen3.5-0.8B (revisión `2fc0636`) publicada por el usuario zzzmahesh. No se trata de un fine-tuning convencional: el autor aplica dos ediciones de pesos en forma cerrada (closed-form weight edits) sobre un total de 16.426 valores almacenados en seis tensores de las capas 14 y 18 (MLP gate, up y down). No se emplearon pasos de gradiente, optimizadores, LoRA ni ajuste fino; cada edición se calculó en un solo paso a partir de lecturas del modelo y se conservó únicamente tras superar una prueba estadística de aceptación.

El objetivo es corregir una clase de fallo muy concreta en generación de código Python: el modelo original a menudo lee la llamada de test del enunciado pero define la función con otro nombre, de modo que todos los tests fallan aunque el programa sea correcto. Las ediciones abordan dos causas identificadas (amortiguación de la señal de la llamada de test y enrutamiento de la atención hacia la frase de tarea en lugar de la llamada) mediante seis neuronas feed-forward autoradas que sustituyen a las menos influyentes de sus capas.

El modelo conserva la arquitectura, tokenizador, plantilla de chat y configuración del original, y se carga y usa exactamente igual. Es relevante como demostración de programación en espacio de pesos (weight-space programming) aplicada a un modelo pequeño de 873 millones de parámetros, con una mejora medible en MBPP+ y sin degradación aparente en un panel de control de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5; arquitectura multimodal image-text-to-text segun pipeline_tag) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc0636) |
| Tamano del repositorio | 1,8 GB |
| Modificacion | 16.426 valores en 6 tensores (capas 14 y 18: mlp.gate_proj, mlp.up_proj, mlp.down_proj) |
| Ledger de ediciones | wsp_edits.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 873 millones de parámetros. La modificación no altera la arquitectura ni el entrenamiento original: se aplican dos ediciones de pesos en forma cerrada sobre seis tensores de las capas 14 y 18 (gate, up y down de la MLP). Cada edición introduce seis neuronas feed-forward autoradas que reemplazan a las neuronas menos influyentes de sus respectivas capas. No hubo pasos de gradiente, optimizador, LoRA ni ajuste fino; las pasadas forward se usaron solo para medición.

Las dos causas corregidas son: (1) volumen, donde la salida de las cabezas de atención de la capa 15 que leen la llamada de test queda amortiguada mientras se escribe el nombre de la función, y dos neuronas de la capa 14 levantan esa amortiguación en ese contexto; y (2) enrutamiento, donde en el primer `def` de una respuesta las cabezas de las capas 15 y 19 miran la frase de tarea en lugar de la llamada de test, y cuatro neuronas de las capas 14 y 18 las redirigen hacia el nombre llamado en ese contexto. El ledger `wsp_edits.json` documenta cada edición.

## Capacidades

- Generación de texto y conversación (pipeline image-text-to-text, según los metadatos).
- Generación de código Python, con mejora específica en la definición correcta del nombre de función solicitado por la llamada de test del enunciado.
- Entrada de imágenes y vídeo declarada por el pipeline_tag del modelo base, aunque no evaluada tras las ediciones.
- Modo de razonamiento ("thinking") disponible, heredado del modelo base; con él activado no se ha establecido ganancia con las ediciones.
- Carga y prompting idénticos al modelo original: mismo tokenizador, plantilla de chat y configuración.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Generación de funciones Python a partir de enunciados con llamada de test: el modelo define la función con el nombre exacto que espera el test en más casos que el original (42 de 378 fallos de nombre frente a 121 en MBPP+), lo que reduce iteraciones de corrección en pipelines de evaluación automática.
- Asistentes de código en entornos educativos o de práctica tipo MBPP: útil cuando el enunciado incluye ejemplos de uso y se espera que el alumno o el sistema genere la implementación con la firma correcta.
- Generación de tests y código en CI/CD: al reducir la clase de fallo "función definida con otro nombre", disminuye el ruido en suites de validación automática que comprueban pass@1 sobre tests ocultos.
- Prototipado rápido en local: con 873 millones de parámetros y pesos safetensors de 1,8 GB, es viable en hardware modesto para tareas de código y texto sin requisitos de GPU de datacenter.
- Investigación en edición de modelos: sirve como caso reproducible de weight-space programming con ledger de ediciones y protocolo de aceptación estadística, útil para estudiar intervenciones localizadas en MLPs.
- Evaluación comparativa de modelos pequeños en código: referencia para medir cuánto de la brecha en pass@1 se debe a errores de nomenclatura frente a errores de lógica de programa.
- Filtrado o preprocesado de soluciones generadas: puede usarse como primer generador en un pipeline de muestreo múltiple, dado que el autor documenta que con muestreo adicional (hasta 8 respuestas, temperatura 0,7, top-p 0,8, top-k 20) se alcanza 47,1% en MBPP+.

## Benchmarks y rendimiento

Pass@1 sobre todos los tests, incluidos los ocultos; modo thinking desactivado; decodificación greedy, máximo 512 tokens nuevos. MBPP+ y HumanEval+ son las versiones de EvalPlus (evalplus 0.3.1). El margen "+/-" es un error estándar de la diferencia, medido problema a problema.

| Conjunto | Modelo original | Este modelo | Cambio |
|---|---|---|---|
| MBPP+ (378 problemas) | 23,8% | 31,2% | +7,4 +/- 1,9 |
| HumanEval+ (164 problemas) | 28,7% | 28,7% | +0,0 +/- 1,5 |
| 400 problemas estilo MBPP de otra fuente, nunca vistos durante el trabajo | 34,0% | 37,8% | +3,8 +/- 1,7 |

En MBPP+, las respuestas que no definen la función llamada caen de 121 a 42 de 378. Con el paso de inferencia adicional (no incluido en estos pesos: remuestreo de hasta 8 respuestas si falla el test de ejemplo del propio enunciado) el modelo alcanza 47,1% en MBPP+, 40,9% en HumanEval+ y 56,0% en el conjunto de 400 problemas, a un coste de generación de cuatro a seis veces superior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 873 millones de parámetros y pesos safetensors de 1,8 GB, la inferencia en precisión original requiere del orden de 2 GB de pesos más memoria de activaciones y caché KV, por lo que es viable en GPUs de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en GPUs de consumo tipo RTX 3060/4060 en adelante, aunque el autor no especifica modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (873M parámetros, repo de 1,8 GB), si bien no se detallan configuraciones probadas.
- Opciones de despliegue: transformers (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 MBPP+ | Pass@1 HumanEval+ | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-edited | 873.438.784 | no disponible | 31,2% | 28,7% | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (original) | no disponible en la ficha (mismo orden, 0.8B) | no disponible | 23,8% | 28,7% | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Una sola clase de fallo y un solo formato de prompt: la ganancia se limita a enunciados que dan una llamada de test y ninguna firma de función. HumanEval+ incluye la firma en el enunciado y no gana nada.
- Ninguna edición mejora la lógica del programa; solo corrige el nombre bajo el que se define la función.
- Con el modo de razonamiento ("thinking") activado no se ha establecido ganancia: sobre 240 problemas medidos, este modelo resuelve 2 más que el original.
- Los benchmarks se consultaron más de una vez: MBPP+ y HumanEval+ se miraron una vez por edición conservada, y la cifra reportada procede de la tercera consulta. El conjunto de 400 problemas se construyó después y es la comprobación más limpia.
- Solo se apuntó a código Python. Un panel de control (texto general, MMLU-Pro, prompts no relacionados con código) no mostró daño en la prueba de aceptación, pero las entradas de imagen y vídeo no se evaluaron tras las ediciones.
- Es un modelo de 0,8B: la mayoría de los problemas siguen fallando.
- El test de ejemplo usado en el paso de inferencia adicional es un juez débil: entre el 35% y el 60% de las respuestas que acepta fallan los tests ocultos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información proporcionada.
- Licencia Apache-2.0, igual que el original; se permite uso comercial con atribución al equipo Qwen y mención de la modificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzzmahesh/Qwen3.5-0.8B-weight-edited
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Ledger de ediciones: wsp_edits.json (incluido en el repositorio del modelo)
