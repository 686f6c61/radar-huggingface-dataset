# top0329/zils-mini-a1127

## Resumen

zils-mini-a1127 es un modelo de decisión (decision model) publicado por el usuario top0329 en Hugging Face, concebido como "cuerpo de decisión" (decision body) para el mini pool de la subred Zils 127. Se trata de un fine-tune del modelo público Qwen/Qwen3.5-4B, con 4.539.265.536 parámetros totales según los pesos en safetensors, y se distribuye con licencia Apache-2.0. El modelo no es un asistente conversacional al uso, sino un componente de clasificación y enrutado de decisiones dentro de una infraestructura de subred (subnet), orientado a seleccionar respuestas o categorías a partir de una entrada.

El proceso de construcción es inusual y conviene entenderlo: parte del "mini soup" público del 26 de noviembre de 2026, que a su vez es la media de pesos de dos modelos (joamCriff123/zils-mini-m1124a y malkolm777/zils-mini-m24-teacher-mlp). Sobre ese punto de partida se entrenaron tres LoRA de rango 64 (sobre proyecciones de atención y MLP) con distintos seeds y tasas de aprendizaje, y el resultado final es la media a pesos iguales de los tres fine-tunes fusionados. Es, por tanto, un modelo derivado en segunda generación de un ensemble previo.

Su relevancia es acotada pero clara para quien opere en el ecosistema Zils: demuestra una receta reproducible de destilación y merging para modelos de decisión de ~4,5B, con separación explícita entre filas de recuperación (retrieval) y filas de otras categorías (razonamiento, lenguaje, herramientas, artes), de modo que el ajuste en recuperación no degrade el resto de capacidades del modelo base. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B); detalles específicos no disponibles |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Tag de familia | zils, decision-model, d3-mini |
| Región declarada | us |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.5-4B; la model card no aporta detalles adicionales sobre atención, normalización o positional encoding. Lo relevante desde el punto de vista técnico es el pipeline de entrenamiento. El punto de partida es el "mini soup" público del 26 de noviembre de 2026, definido como la media a pesos iguales de joamCriff123/zils-mini-m1124a y malkolm777/zils-mini-m24-teacher-mlp. Sobre esa base se entrenaron tres LoRA independientes de rango 64 aplicadas a las proyecciones de atención y MLP, con 875 pasos de 16 filas cada uno (14.000 filas en total por adaptador), usando learning rate 3e-5 con seeds 1 y 3, y 2e-5 con seed 2.

El conjunto de entrenamiento se divide en dos mitades de 7.000 filas. Las filas de recuperación (retrieval) tienen como objetivo una mezcla a partes iguales entre las probabilidades de un teacher relay de 27B y la etiqueta gold. Las otras 7.000 filas, correspondientes a las categorías de razonamiento, lenguaje, herramientas y artes, usan como objetivo las propias probabilidades del soup, es decir, destilación sobre sí mismo. Este diseño busca que el ajuste en recuperación no desplace al modelo del comportamiento del soup en el resto de categorías, un patrón de regularización por destilación que evita el olvido catastrófico en la tarea principal. El modelo final es la media a pesos iguales de los tres LoRA fusionados sobre el soup.

## Capacidades

- Clasificación y decisión sobre entradas: el modelo está diseñado como "decision body" para el mini pool de la subred Zils 127, es decir, para emitir una decisión o probabilidad sobre categorías predefinidas.
- Recuperación (retrieval): una de las dos mitades del entrenamiento se dedica explícitamente a esta tarea, con objetivos mezclados entre un teacher de 27B y etiquetas gold.
- Razonamiento, lenguaje, herramientas y artes: las cuatro categorías restantes del conjunto de entrenamiento, mantenidas cerca del comportamiento del soup mediante destilación.
- Herencia de capacidades del modelo base Qwen3.5-4B: al ser un fine-tune sobre él, conserva en principio sus capacidades generales, aunque la model card no las detalla ni las certifica.
- Tool calling / function calling: no disponible de forma explícita; la categoría "tools" del entrenamiento sugiere cierta competencia, pero no se documenta soporte de function calling.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutado de decisiones en la subred Zils 127: el modelo actúa como cuerpo de decisión del mini pool, recibiendo una entrada y emitiendo la categoría o decisión correspondiente dentro del protocolo de la subred. Es su uso previsto y el único documentado por el autor.
- Clasificación de consultas de recuperación: gracias a las 7.000 filas de entrenamiento específicas con objetivos mezclados de teacher y gold, puede emplearse para decidir si una consulta requiere recuperación de documentos y qué ruta tomar.
- Filtrado previo en pipelines RAG: como clasificador de ~4,5B, puede situarse delante de un recuperador para decidir si una petición necesita búsqueda externa o puede resolverse con conocimiento paramétrico, reduciendo llamadas costosas.
- Destilación de un teacher mayor: el modelo incorpora en sus pesos las probabilidades de un teacher relay de 27B en la tarea de recuperación, por lo que sirve como referencia compacta para reproducir parte del comportamiento del teacher en producción con menor coste.
- Base para nuevos fine-tunes en el ecosistema Zils: al ser la media de tres LoRA sobre el soup, es un punto de partida estable y reproducible para quien quiera continuar el entrenamiento con nuevas categorías o datos, siguiendo la misma receta de rango 64 y destilación mixta.
- Evaluación comparativa de recetas de merging: investigadores interesados en model soups y en la fusión de adaptadores LoRA pueden usar este modelo como caso de estudio controlado, ya que el autor documenta seeds, tasas de aprendizaje, pasos y composición del dataset con precisión inusual.
- Clasificación de contenido por categorías (razonamiento, lenguaje, herramientas, artes): las cuatro categorías no-retrieval del entrenamiento permiten reutilizar el modelo como etiquetador temático de entradas, siempre que se valide su comportamiento fuera del dominio de la subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4,54B × 2 bytes), más overhead de activaciones y KV cache; presupuesto realista de 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB para pesos; en 4 bits, alrededor de 3 GB para pesos, con overhead adicional.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para despliegues de una sola instancia; A10G o L4 (24 GB) también son suficientes para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, en cuantización de 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: al ser safetensors sobre una arquitectura Qwen, es compatible en principio con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y Transformers. No se documenta compatibilidad verificada con ninguno de ellos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-a1127 | 4,54B | no disponible | Apache-2.0 | Decision model (subred Zils) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la información | LLM generalista | Hugging Face |
| joamCriff123/zils-mini-m1124a | no disponible | no disponible | no disponible en la información | Componente del soup Zils | Hugging Face |
| malkolm777/zils-mini-m24-teacher-mlp | no disponible | no disponible | no disponible en la información | Componente del soup Zils | Hugging Face |

La comparación con alternativas generalistas de ~4B (Llama 3.2 3B, Gemma 2 2B, Phi-3.5-mini) no es significativa en términos de rendimiento porque no hay benchmarks publicados para zils-mini-a1127; la comparación relevante es con sus propios ancestros dentro del ecosistema Zils, de los que se desconoce la mayoría de especificaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no es posible verificar su calidad frente al modelo base ni frente a alternativas.
- Modelo de nicho: está entrenado para el mini pool de la subred Zils 127; fuera de ese contexto su comportamiento puede ser errático o simplemente no alineado con lo esperado de un asistente general.
- Riesgo de alucinación: al ser un modelo de decisión con destilación sobre probabilidades, puede producir salidas confiadas pero incorrectas si la entrada se aleja de la distribución de entrenamiento (14.000 filas).
- Idiomas no documentados: se desconoce qué idiomas cubre el entrenamiento; el dataset no se describe lingüísticamente y el modelo base Qwen3.5-4B probablemente esté sesgado hacia inglés y chino.
- Contexto no documentado: no se especifica la longitud de contexto efectiva tras el fine-tune; los LoRA no la modifican, pero tampoco se confirma la del base.
- Licencia Apache-2.0 con atribuciones upstream: el propio autor remite a LICENSE y NOTICE para las atribuciones de los modelos de los que deriva (joamCriff123/zils-mini-m1124a y malkolm777/zils-mini-m24-teacher-mlp); conviene revisar esas condiciones antes de un uso comercial.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el modelo ni reporte problemas.
- Fecha de creación futura (27 de noviembre de 2026): tratar con cautela cualquier metadato temporal del repositorio.
- Sin garantías de producción: no hay información sobre estabilidad, formato de salida esperado ni protocolo de integración con la subred, lo que dificulta su adopción fuera del entorno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/top0329/zils-mini-a1127
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente del soup: https://huggingface.co/joamCriff123/zils-mini-m1124a
- Componente del soup: https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp
