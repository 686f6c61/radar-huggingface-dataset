# staccs/Muse-Glimmer-30B-lecore-mlx

## Resumen

Muse-Glimmer-30B-lecore-mlx es una cuantización de precisión mixta en formato MLX del modelo meta-models/Muse-Glimmer-30B, publicada por el usuario staccs. No es un modelo nuevo ni reentrenado: es un export cuantizado del modelo base, pensado para ejecutarse en Apple Silicon mediante la librería mlx-lm. El objetivo es reducir el peso del modelo desde el rango de los 16 bits por peso hasta unos 4,597 bits por peso efectivos, manteniendo la calidad lo más cerca posible de la referencia bf16.

La particularidad técnica es el método de asignación de bits. En lugar de aplicar una receta uniforme, se midió el daño (KL entre la distribución fp16 y la cuantizada) de cada tensor lineal del decoder por separado a 2, 3 y 4 bits sobre un conjunto de calibración, y después se asignaron los bits de forma voraz minimizando el daño por byte ahorrado. El resultado final, según la model card, es un histograma con las 416 capas lineales a 4 bits, embeddings a 4 bits y lm_head a 6 bits, con grupo de 64.

El modelo resultante ocupa 16,01 GB de pesos y declara 27.854.780.928 parámetros reales según los safetensors, pese a que el nombre comercial indique 30B. Está publicado bajo licencia Apache 2.0, sin lista de idiomas declarada y sin longitud de contexto publicada en la información disponible. La exportación MLX es solo texto: no incluye la torre de visión, aunque el repositorio GGUF companion mencionado en la model card sí incluiría un proyector mmproj f16 para entrada de imagen en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only cuantizado (la model card menciona "decoder linear tensor"); no se detallan variantes MoE, SSM ni híbridas |
| Parametros totales | 27.854.780.928 segun safetensors (aprox. 27,85 mil millones); el nombre del repo indica 30B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de precision mixta, grupo 64; 4 bits en las 416 capas lineales, 4 bits en embeddings y 6 bits en lm_head; 4,597 bpw efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); existe un repositorio GGUF companion mencionado en la model card, sin enlace aportado |
| Modelo base | meta-models/Muse-Glimmer-30B |
| Libreria de inferencia | mlx (mlx-lm) |
| Tamano del repositorio | 16,0 GB |
| Tamano de pesos declarado | 16,01 GB |

## Arquitectura y entrenamiento

La model card describe únicamente el proceso de cuantización, no la arquitectura interna del modelo base. Se sabe que el modelo base es meta-models/Muse-Glimmer-30B, que el pipeline declarado es text-generation y que la cuantización se aplicó tensor a tensor sobre las capas lineales del decoder, lo que confirma que se trata de una arquitectura de tipo transformer decoder-only. No hay información sobre número de capas, tipo de atención, uso de MoE, número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovación de arquitectura en el modelo base más allá de lo que implica el nombre.

La innovación del repositorio está en el método de cuantización, denominado leCore Unicron requantize. El procedimiento fue: cuantizar cada tensor lineal del decoder por separado con MLX affine (grupo 64 durante la medición) a 2, 3 y 4 bits; medir el daño como divergencia KL entre las distribuciones fp16 y cuantizada de siguiente token sobre una mezcla de calibración de 3066 tokens de entrenamiento de WikiText-2, 1022 tokens de código Python y una sonda estructurada propia que cubre prosa, código, SQL y markdown; y asignar bits de forma voraz partiendo de 4 bits en todas partes y aplicando sucesivamente la degradación con menor daño medido por byte ahorrado hasta encajar en el presupuesto de tamaño. La conversión final se hizo con mlx_lm.convert y un quant_predicate por capa. No hubo reentrenamiento.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational.
- Razonamiento y conocimiento general: la model card reporta un 81,8 % en MMLU 5-shot sobre un subconjunto de 10 preguntas por asignatura (57 asignaturas).
- Matematicas: 96,0 % en GSM8K estricto y flexible, en 5-shot sobre los primeros 100 problemas de test con decodificación greedy.
- Codigo: la evaluación de perplejidad incluye una porción de código Python (perplejidad 3,4615 en la porción retenida); no se han publicado benchmarks específicos tipo HumanEval.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, la model card no declara idiomas.
- Vision: no en esta exportación MLX, porque el port de mlx-lm no incluye torre de visión. La model card indica que el repositorio GGUF companion incluye un proyector mmproj f16 sin cuantizar para entrada de imagen en llama.cpp, siempre que su conversión haya tenido éxito.
- Modo thinking explícito: no disponible.

## Casos de uso

- Prototipado y desarrollo local en Apple Silicon: con 16,01 GB de pesos, el modelo se puede ejecutar íntegramente en un Mac con memoria unificada suficiente (36 GB recomendados según la model card) mediante mlx-lm, sin depender de GPUs dedicadas ni de servicios en la nube. Es adecuado para iterar en local sobre prompts y flujos de chat.
- Asistente conversacional de propósito general en local: el modelo mantiene conversaciones multi-turno y su MMLU de 81,8 % sobre subconjunto lo sitúa como un asistente de conocimiento general razonable para tareas de pregunta-respuesta documental y resumen, siempre que se validen las salidas por el riesgo de alucinación inherente a cualquier LLM.
- Resolución de problemas matemáticos de nivel escolar: el 96,0 % en GSM8K estricto sobre 100 problemas indica que puede resolver problemas aritméticos de varios pasos, útil para tutores automáticos o generación de ejercicios resueltos con verificación posterior.
- Generación y asistencia de código en local: la perplejidad de 3,4615 en código Python retenido sugiere un comportamiento razonable en código, adecuado para autocompletado, generación de fragmentos y explicación de código en entornos donde no se quiere enviar el código a un servicio externo.
- Evaluación de técnicas de cuantización: el repositorio es útil como referencia metodológica para investigadores que quieran comparar estrategias de asignación de bits por capa frente a cuantizaciones uniformes, ya que publica perplejidad y benchmarks de las mismas métricas sobre los pesos exactos enviados.
- Despliegue ligero en hardware de memoria unificada: al reducir los pesos a 16,01 GB, el modelo permite ejecutar una variante del base de ~27,85 mil millones de parámetros en máquinas que no podrían alojar la versión bf16, con una degradación de perplejidad de 8,4699 frente a 8,2001 en WikiText-2.
- Base para pipelines de texto en llama.cpp vía el GGUF companion: si se usa la conversión GGUF, se puede integrar en herramientas compatibles con llama.cpp, incluida entrada de imagen con el proyector mmproj f16, siempre que dicha conversión esté disponible y verificada.

## Benchmarks y rendimiento

Los datos provienen de la model card del repositorio. La perplejidad se calculó sobre los pesos exactos enviados, dequantizados con mx.dequantize y ejecutados en bf16 en GPU. MMLU y GSM8K se ejecutaron con lm-eval-harness 0.4.9 sobre subconjuntos (10 preguntas por asignatura de 57 y 100 problemas de test respectivamente), por lo que el autor advierte de un ruido de muestreo de aproximadamente ±2 a 4 puntos.

| Modelo | Tamano (GB, pesos) | bpw | WikiText-2 ppl (32704 tok) | Perplejidad en codigo Python (8176 tok) |
|---|---|---|---|---|
| Referencia bf16 | no disponible | 16 | 8,2001 | 3,2983 |
| Este repo (mezcla leCore Unicron) | 16,01 | 4,597 | 8,4699 | 3,4615 |
| MLX 3-bit de serie, grupo 64 | 12,19 | 3,500 | 9,8255 | 4,1635 |

| Modelo | MMLU (5-shot) | GSM8K estricto | GSM8K flexible |
|---|---|---|---|
| Mezcla leCore (este repo) | 81,8 % | 96,0 % | 96,0 % |
| 3-bit affine de serie, grupo 64 (simulado) | 78,6 % | 90,0 % | 90,0 % |

No se ejecutaron benchmarks de tareas downstream adicionales, y la model card no publica resultados frente a otros modelos externos. La advertencia del autor es explícita: la perplejidad de contexto corto no lo dice todo sobre la calidad, por lo que conviene verificar salidas para cada caso de uso concreto.

## Requisitos de hardware

- Peso de los pesos: 16,01 GB en formato MLX; el repositorio ocupa 16,0 GB.
- Memoria total estimada para inferencia: no disponible de forma explícita. A los 16,01 GB de pesos hay que sumar la caché KV, que depende de la ventana de contexto, no publicada. El comando de ejemplo de la model card usa --max-kv-size 8192, lo que da una referencia de contexto de trabajo, pero no una cifra de memoria total.
- Mac recomendado: 36 GB de memoria unificada, según la model card. En ese caso puede ser necesario elevar el límite de memoria cableada de la GPU, por ejemplo con sudo sysctl iogpu.wired_limit_mb=30000.
- GPU dedicadas (NVIDIA, AMD): no aplica a esta exportación, porque mlx-lm está pensado para Apple Silicon. Para GPUs dedicadas habría que usar la conversión GGUF del repositorio companion con llama.cpp u otro runtime compatible, cuya disponibilidad no está confirmada en los enlaces aportados.
- ¿Cabe en GPU de consumo? Con esta librería no, porque MLX requiere Apple Silicon. En Mac de consumo, un equipo con 32 GB de memoria unificada queda muy justo y la propia model card recomienda 36 GB; en 64 GB o más hay margen para contexto amplio.
- Opciones de despliegue: mlx-lm (comando mlx_lm.generate con --model staccs/Muse-Glimmer-30B-lecore-mlx). El repositorio GGUF companion mencionado abriría la puerta a llama.cpp. No se documentan vLLM, TGI ni Ollama para esta exportación.
- Latencia y throughput: no disponible. La model card no publica tokens por segundo ni tiempos de primera token.

## Comparativa con modelos similares

La información disponible solo permite comparar este repositorio con su modelo base en bf16 y con una cuantización MLX de 3 bits de serie, que son las dos referencias que el autor mide. No se aportan comparaciones con modelos de otros autores ni con alternativas de tamaño similar.

| Modelo | Parametros | Contexto | bpw / tamano | WikiText-2 ppl | MMLU 5-shot | GSM8K estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-lecore-mlx (este repo) | 27.854.780.928 | no disponible | 4,597 bpw / 16,01 GB | 8,4699 | 81,8 % | 96,0 % | Apache 2.0 | HuggingFace, formato MLX |
| Muse-Glimmer-30B bf16 (base) | no disponible en la ficha | no disponible | 16 bpw | 8,2001 | no medido en esta ficha | no medido en esta ficha | Apache 2.0 | HuggingFace |
| MLX 3-bit de serie, grupo 64 | mismo base | no disponible | 3,500 bpw / 12,19 GB | 9,8255 | 78,6 % (simulado) | 90,0 % (simulado) | Apache 2.0 | referencia interna de la model card |

Frente a la cuantización uniforme de 3 bits, este repositorio gasta unos 3,82 GB más de pesos y gana 3,2 puntos de MMLU y 6 puntos de GSM8K estricto, además de reducir la perplejidad de WikiText-2 de 9,8255 a 8,4699. Frente al bf16, la pérdida es de 0,2698 puntos de perplejidad en WikiText-2 y 0,1632 en código Python, con un ahorro de peso aproximado del 65 % respecto al formato de 16 bits.

## Limitaciones y advertencias

- Los benchmarks de MMLU y GSM8K se han ejecutado sobre subconjuntos (10 preguntas por asignatura y 100 problemas), no sobre los conjuntos completos. El propio autor estima un ruido de muestreo de ±2 a 4 puntos, por lo que las cifras no deben tomarse como valores absolutos comparables con evaluaciones completas.
- La exportación MLX es solo texto. No incluye torre de visión, aunque el modelo base parezca ser multimodal por la mención al proyector mmproj en el repositorio GGUF companion. Cualquier caso de uso con imágenes requiere ese otro repositorio, cuya conversión y disponibilidad no están confirmadas.
- No se declaran idiomas soportados. No hay evidencia en la información disponible sobre calidad en castellano u otros idiomas distintos del inglés, y los conjuntos de evaluación usados (WikiText-2, código Python, MMLU, GSM8K) son mayoritariamente en inglés.
- No se publica la longitud de contexto del modelo. El ejemplo de uso emplea --max-kv-size 8192, pero eso es una configuración de ejecución, no la ventana nativa del modelo. No se puede asumir un contexto largo sin verificarlo.
- Los resultados de perplejidad y benchmarks corresponden a contexto corto (secuencia 512 en perplejidad). No hay datos sobre degradación en contextos largos ni sobre estabilidad en conversaciones multi-turno extensas.
- Riesgo de alucinación: no se documenta ningún mecanismo de mitigación ni evaluación de fidelidad factual. Como en cualquier LLM, conviene validar las salidas en aplicaciones sensibles.
- Sesgos conocidos: no disponible. La model card no incluye análisis de sesgos ni de toxicidad.
- Licencia: Apache 2.0, tanto en este repositorio como en el modelo base según la información aportada. Esto permite uso comercial, pero conviene verificar directamente la model card del modelo base meta-models/Muse-Glimmer-30B, ya que la ficha se apoya en la declaración del autor de la cuantización.
- La cuantización introduce degradación medible: frente a bf16, la perplejidad sube de 8,2001 a 8,4699 en WikiText-2 y de 3,2983 a 3,4615 en código Python. Es una pérdida pequeña pero no nula, y puede ser mayor en tareas no cubiertas por la calibración.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026 según los metadatos. No hay validación por parte de la comunidad ni informes independientes de calidad.
- El nombre del repositorio indica 30B, pero el número real de parámetros según safetensors es 27.854.780.928. Conviene no asumir el tamaño del nombre a la hora de planificar memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/Muse-Glimmer-30B-lecore-mlx
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio GGUF companion con proyector mmproj f16: mencionado en la model card, sin enlace disponible
- Paper o blog del método leCore Unicron requantize: no disponible
- Documentacion de mlx-lm: no disponible en la informacion aportada
