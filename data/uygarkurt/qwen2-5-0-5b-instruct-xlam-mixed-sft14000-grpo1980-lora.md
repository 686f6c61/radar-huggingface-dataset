# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo1980-lora

## Resumen

Este repositorio contiene un adaptador LoRA, no un modelo completo, entrenado por el usuario uygarkurt sobre Qwen/Qwen2.5-0.5B-Instruct. El objetivo concreto es el tool calling estructurado en un modelo de 0,49 mil millones de parámetros, incluyendo la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El adaptador se entrenó con la herramienta Post-Training Lab y el dataset uygarkurt/xlam-tool-calling-mixed.

El entrenamiento es secuencial: primero 14.000 actualizaciones de supervisión fina (SFT) y después 1.980 actualizaciones de Group Relative Policy Optimization (GRPO) partiendo del adaptador SFT resultante. En total, 3,3 horas de cómputo en el bucle de entrenamiento. La model card compara explícitamente el punto de control SFT con el SFT+GRPO, lo que permite aislar el efecto del refuerzo: la precisión de llamada exacta (xLAM ETC) baja ligeramente del 81,33 % al 80,94 %, mientras que la tasa de abstención correcta ante herramientas irrelevantes sube del 66,40 % al 69,69 %.

La relevancia práctica es acotada pero clara: demuestra que un modelo de 0,5 B puede alcanzar una precisión de nombre de función del 97,11 % en un conjunto de evaluación específico, a costa de un rendimiento general muy bajo (MMLU 37,95 %, MATH-500 17,80 %, IFEval 28,10 %). Es un artefacto de investigación útil para estudiar recetas SFT+GRPO y para prototipar enrutado de herramientas en entornos con recursos mínimos, no un sustituto de modelos mayores en producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con RoPE, SwiGLU, RMSNorm y atención con cabeceras KV agrupadas (GQA); el repositorio contiene un adaptador LoRA (PEFT) sobre esa base |
| Parámetros totales | 0,49 B en el modelo base; el adaptador LoRA añade un número de parámetros no disponible (rango y alpha no especificados) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; la model card del adaptador no indica modificaciones ni extensión de contexto |
| Tipos de cuantización | No disponible en este repositorio (pesos del adaptador en safetensors); el modelo base dispone de variantes cuantizadas publicadas por Qwen (GPTQ, AWQ, GGUF) según su propia documentación |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relación: adapter) |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Técnicas de entrenamiento | SFT (14.000 actualizaciones) + GRPO (1.980 actualizaciones) |
| Fecha de creación del repositorio | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only de 24 capas, dimensión oculta 896, 14 cabeceras de atención con 2 cabeceras KV (GQA) y ventana nativa de 32.768 tokens. Sobre ese modelo se aplica un adaptador LoRA de bajo rango, por lo que en inferencia hay que cargar el adaptador junto con el modelo base (o fusionarlo previamente). La model card no detalla el rango del adaptador, los módulos objetivo ni la configuración de atención.

El entrenamiento se realizó en dos fases con el mismo dataset mixto de tool calling. La primera fase aplicó 14.000 actualizaciones de SFT (2,2 horas) y la segunda continuó ese adaptador con 1.980 actualizaciones de GRPO (1,1 horas). GRPO es una variante de optimización por política relativa a un grupo que evita el modelo crítico separado, y aquí se emplea para reforzar dos comportamientos: emitir llamadas estructuradas correctas y abstenerse cuando el conjunto de herramientas ofrecido no cubre la consulta. No se documentan la composición exacta del dataset, el número de tokens vistos, la función de recompensa ni si hubo etapas adicionales de alineación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Tool calling estructurado: emisión de llamadas con nombre de función y argumentos en formato serializado, evaluado con los conjuntos xLAM ETC y xLAM FNA.
- Abstención ante herramientas irrelevantes: comportamiento entrenado explícitamente mediante GRPO y medido en los subconjuntos de relevancia e irrelevancia del benchmark.
- Precisión de nombre de función del 97,11 % en el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos), lo que indica que el modelo rara vez confunde la función a invocar cuando la llamada es procedente.
- Soporte de conversación multi-turno básica y plantillas de chat de Qwen2.5, al heredar el tokenizador y el formato del base.
- Capacidad muy limitada de razonamiento matemático y de seguimiento de instrucciones complejas (MATH-500 17,80 %, IFEval 28,10 % en precisión estricta a nivel de prompt).
- No se documentan capacidades de visión, audio, modo thinking explícito ni agentes multi-paso autónomos más allá del bucle de llamada única.

## Casos de uso

- Enrutado de herramientas en asistentes ligeros: dado un catálogo de funciones y una consulta en inglés, el adaptador devuelve la llamada JSON correspondiente con un 80,94 % de precisión exacta en el conjunto xLAM evaluado, suficiente para un primer salto en un pipeline que valide después la llamada.
- Filtro de abstención previo a un modelo mayor: con una tasa de acierto del 69,69 % al decidir que ninguna herramienta ofrecida es relevante, puede usarse como primera barrera de bajo coste que descarte consultas fuera de dominio antes de invocar un LLM de mayor tamaño.
- Prototipado rápido de function calling en local: al ocupar menos de 1 GB en fp16, permite iterar sobre esquemas de herramientas y prompts en un portátil sin GPU dedicada antes de trasladar el diseño a un modelo mayor.
- Despliegue en dispositivo o en el borde: un modelo de 0,49 B fusionado con el adaptador cabe en GPUs integradas, CPUs modernas y placas tipo Raspberry Pi, lo que habilita asistentes de llamada a funciones sin conectividad ni coste de API.
- Generación de datos sintéticos de tool calling: el adaptador puede producir pares consulta-llamada para aumentar datasets de entrenamiento de modelos mayores, siempre con filtrado posterior por precisión exacta.
- Estudio de recetas de posentrenamiento: la comparación publicada entre el punto de control SFT y el SFT+GRPO sirve como referencia reproducible para investigar el efecto de GRPO sobre comportamientos de abstención en modelos pequeños.
- Clasificación de intención con salida estructurada en backends internos: para APIs con un conjunto cerrado y estable de operaciones en inglés, el modelo puede mapear la petición a una operación concreta y devolver los argumentos esperados.
- Evaluación comparativa de adaptadores: útil como línea base de bajo coste frente a adaptadores de tool calling de tamaño similar al medir latencia, precisión de nombre de función y tasa de abstención.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT que inicializa GRPO; la segunda, al adaptador final de este repositorio.

| Punto de control | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 14.000 | 38,04 | 18,40 | 29,02 | 81,33 | 97,68 | 56,19 | 83,33 | 66,40 | 2,2 |
| SFT + GRPO (este adaptador) | GRPO 1.980 | 37,95 | 17,80 | 28,10 | 80,94 | 97,11 | 57,46 | 83,33 | 69,69 | 3,3 |

Notas de medición declaradas por el autor: xLAM ETC es precisión exacta de llamada y xLAM FNA es precisión del nombre de función, calculadas sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos) y no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab, por lo que son agregados específicos del estudio y no cifras oficiales del benchmark.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 1,0 GB solo para los pesos del modelo base fusionado con el adaptador, más caché KV y activaciones; entorno cómodo por debajo de 2 GB con contexto corto.
- VRAM en 4 bits: del orden de 0,3 a 0,5 GB para los pesos, viable en GPUs con 2 GB o menos y en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y también en GPUs integradas y CPUs con suficiente memoria RAM del sistema.
- GPU de datacenter: no requiere A100 ni H100; para servir many concurrent requests el límite será el throughput agregado, no la memoria.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), fusión del adaptador y conversión a GGUF para llama.cpp u Ollama, vLLM con soporte de adaptadores LoRA, y TGI. Para vLLM y llama.cpp es habitual fusionar primero los pesos.
- Latencia y throughput: no se han publicado medidas en la información disponible; el autor solo reporta tiempos del bucle de entrenamiento (2,2 h de SFT y 1,1 h de GRPO), que no son indicativos de inferencia.
- Almacenamiento: el repositorio declara 0,0 GB, coherente con un adaptador LoRA de pequeño tamaño; hay que sumar la descarga del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA SFT/GRPO) | 0,49 B + LoRA | 32.768 (heredado) | no disponible | Tool calling con abstención | Adaptador PEFT en HuggingFace; 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,49 B | 32.768 | Apache 2.0 según la model card de Qwen | Asistente generalista e Instruct | Modelo completo en HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 según la model card de Qwen | Asistente generalista, mayor capacidad de razonamiento | Modelo completo en HuggingFace |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Licencia comunitaria de Llama 3.2 | Asistente generalista multilingüe | Modelo completo en HuggingFace |

No hay datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible comparar MMLU, MATH-500 ni precisión de tool calling entre ellos con cifras. La comparación cualitativa relevante es que este adaptador prioriza explícitamente el comportamiento de abstención y la precisión de nombre de función sobre el rendimiento general, que queda por debajo del de modelos de 1 B o más.

## Limitaciones y advertencias

- Rendimiento general muy bajo: MMLU 37,95 %, MATH-500 17,80 % e IFEval 28,10 % en precisión estricta. No es adecuado para razonamiento, matemáticas ni instrucciones complejas.
- Solo inglés declarado. No hay evidencia de comportamiento en castellano ni en otros idiomas, y el dataset de entrenamiento no documenta cobertura multilingüe.
- La abstención no es fiable: con herramientas irrelevantes, el modelo emite una llamada incorrecta en aproximadamente el 30 % de los casos (69,69 % de acierto en el subconjunto de irrelevancia).
- Riesgo de alucinación de funciones y argumentos: aunque la precisión de nombre de función es del 97,11 %, la precisión exacta de llamada cae al 80,94 %, lo que implica errores en argumentos o estructura en uno de cada cinco casos aproximadamente.
- GRPO no mejora todas las métricas: frente al punto de control SFT, empeora ligeramente MMLU (−0,09 puntos), MATH-500 (−0,60), IFEval (−0,92) y xLAM ETC (−0,39), y solo mejora BFCL single-turn (+1,27) e irrelevancia (+3,29). Conviene elegir el punto de control según la tarea.
- Licencia no declarada para el adaptador. El modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 según su propia model card, pero la ausencia de licencia en este repositorio impide asumir permisos de uso comercial sobre los pesos derivados sin consultar al autor.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen2.5-0.5B-Instruct y cargarlo con PEFT; para llama.cpp u Ollama hay que fusionar y convertir previamente.
- Entrenamiento muy corto (3,3 horas) sobre un único dataset mixto, sin datos sobre composición, tamaño efectivo ni regularización; riesgo de sobreajuste al formato y al dominio del dataset.
- Las métricas son agregados propios del estudio, con 700 ejemplos omitidos en la evaluación xLAM y subconjuntos seleccionados de BFCL; no son directamente comparables con cifras oficiales de los benchmarks.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, y tamaño de repositorio declarado de 0,0 GB.
- No se documentan sesgos, filtros de seguridad ni evaluaciones de toxicidad; al heredar el modelo base, arrastra los sesgos y las limitaciones de seguridad de este.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo1980-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Adaptador SFT previo (punto de partida de GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Post-Training Lab (código de entrenamiento y scripts de evaluación): https://github.com/uygarkurt/post-training-lab
- Nota: la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos no guardan relación con el repositorio y se han descartado.
