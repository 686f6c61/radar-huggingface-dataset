# sudiptoHaldar/qwen3-4b-finqa-program-qlora

## Resumen

`qwen3-4b-finqa-program-qlora` es un adaptador LoRA entrenado con QLoRA sobre el modelo base Qwen/Qwen3-4B, desarrollado por el usuario sudiptoHaldar. Su proposito es resolver preguntas sobre informes financieros de empresas: recibe el texto de un informe, una tabla del mismo informe y una pregunta, y genera un programa corto que calcula la respuesta, ademas del resultado numerico. El modelo no actua como calculadora; el programa generado debe ejecutarlo un motor externo (executor) incluido en el repositorio de codigo del autor.

El modelo se apoya en FinQA, un conjunto de datos de pregunta-respuesta sobre documentos financieros, y emplea un lenguaje de programa propio con diez operaciones (`add`, `subtract`, `multiply`, `divide`, `exp`, `greater` y cuatro operaciones sobre filas de tabla). El adaptador es de tipo PEFT (LoRA/QLoRA), con pesos en safetensors y un tamano de repositorio de 0,1 GB, lo que lo hace muy ligero frente al modelo base completo.

Es relevante por su enfoque de sintesis de programas aplicada a finanzas: en lugar de responder directamente con un numero (propenso a errores aritmeticos y a alucinaciones), el modelo produce una expresion ejecutable y verificable. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El modelo se publico el 24 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3-4B) con adaptador LoRA entrenado mediante QLoRA |
| Parametros totales | No disponible (adaptador LoRA sobre un modelo base de 4B; el repositorio pesa 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B; no especificada en la informacion) |
| Tipos de cuantizacion | El adaptador se entrena y se carga con cuantizacion 4-bit NF4 con doble cuantizacion (bitsandbytes); el modelo base puede cargarse en 4-bit segun el ejemplo del autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe una copia fusionada en `sudiptoHaldar/qwen3-4b-finqa-program-merged` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros. El adaptador se entreno con QLoRA, es decir, con el modelo base cuantizado en 4 bits (NF4, doble cuantizacion, computo en bfloat16) y solo los pesos del adaptador actualizados. El repositorio incluye los ficheros del adaptador, un `prompt.json` que describe el formato exacto de entrada y el sistema de prompt, un `sample_input.json` con un ejemplo inventado y un `finqa_split_manifest.json` que detalla, por identificador de ejemplo, que preguntas se usaron para entrenamiento, desarrollo y prueba.

El entrenamiento se realizo sobre FinQA, un dataset de pregunta-respuesta sobre informes financieros. Es importante senalar que el autor advierte de que las preguntas se extrajeron de la totalidad de FinQA: los ficheros oficiales de entrenamiento, validacion y prueba se agruparon y se dividieron de nuevo por empresa. Por tanto, la particion de prueba del proyecto (2.898 preguntas de 43 empresas) no coincide con la particion de prueba oficial de FinQA, y una puntuacion sobre la particion oficial de validacion o prueba estaria inflada. El autor no documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de esta procedencia.

La innovacion tecnica principal es el enfoque de sintesis de programas: el modelo genera una secuencia `PROGRAM:` con operaciones encadenadas (referenciando pasos anteriores como `#0`, `#1`) seguida de `ANSWER:` con el resultado. El sistema de prompt en `prompt.json` describe completamente el lenguaje de programa. La generacion debe hacerse de forma greedy (`do_sample=False`, `num_beams=1`) y con `enable_thinking=False` en la plantilla de chat, segun el ejemplo del autor.

## Capacidades

- Generacion de programas ejecutables para responder preguntas sobre tablas y texto de informes financieros.
- Razonamiento aritmetico mediante composicion de operaciones (`add`, `subtract`, `multiply`, `divide`, `exp`, `greater` y operaciones sobre filas de tabla).
- Respuesta en formato estricto `PROGRAM:` / `ANSWER:`, con una validez de formato del 100 % declarada por el autor.
- Pregunta-respuesta sobre documentos financieros con contexto textual y tablas en Markdown.
- Capacidad conversacional segun la etiqueta `conversational` del repositorio (plantilla de chat del modelo base).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (de hecho, el ejemplo desactiva el thinking del modelo base).
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Analisis de informes financieros automatizado: dado un informe trimestral y su tabla de resultados, el modelo genera el programa que calcula variaciones porcentuales, margenes o ratios, y un executor produce el numero final verificable.
- Extraccion de metricas financieras en pipelines de datos: el modelo convierte preguntas en lenguaje natural sobre tablas contables en programas ejecutables que pueden integrarse en un ETL para poblar un data warehouse.
- Auditoria y verificabilidad: al devolver un programa en lugar de solo un numero, permite revisar la logica del calculo (que operaciones y sobre que celdas) antes de aceptar el resultado, algo util en entornos de compliance.
- Asistentes internos para equipos de finanzas: un chatbot que responde preguntas sobre estados financieros citando la tabla y el calculo realizado, reduciendo el riesgo de respuestas inventadas.
- Generacion de explicaciones paso a paso: el programa encadenado con referencias `#0`, `#1` sirve como traza de razonamiento para justificar un resultado ante un analista.
- Prototipado rapido de QA financiero: al ser un adaptador de 0,1 GB sobre un modelo de 4B, permite experimentar con sintesis de programas financieros en una GPU de consumo con unos 6 GB de VRAM libre, segun el autor.
- Evaluacion comparativa de tecnicas de QLoRA: el repositorio incluye manifiesto de particiones y codigo de comparacion, util para reproducir experimentos de ajuste fino en dominios especializados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre la particion de prueba propia del proyecto (2.898 preguntas de 43 empresas, no la particion oficial de FinQA):

| Metrica | Valor |
|---|---|
| Execution accuracy | 73,19 |
| Program match | 68,05 |
| Answer accuracy | 66,98 |
| Format validity (respuestas en formato) | 100,00 |

Advertencia del autor: no debe reportarse la puntuacion de este modelo sobre la particion oficial de test de FinQA, ya que las preguntas de entrenamiento se extrajeron de la totalidad del dataset y una evaluacion sobre la particion oficial estaria inflada.

## Requisitos de hardware

- VRAM estimada: unos 6 GB libres en GPU CUDA para cargar el modelo base en 4-bit NF4 y el adaptador, segun el ejemplo del autor.
- GPU recomendadas: cualquier GPU con al menos 6 GB libres; el ejemplo usa `device_map={"": 0}` sobre una unica GPU. Para el modelo base sin cuantizar se requeriria mas memoria (no especificada en la informacion).
- Cabe en GPU de consumo: si, segun el autor, con cuantizacion 4-bit y aproximadamente 6 GB libres.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (flujo documentado por el autor); existe una copia fusionada que carga sin `peft`. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-finqa-program-qlora | Adaptador LoRA sobre Qwen3-4B | No disponible | Sintesis de programas sobre FinQA | Apache 2.0 | Hugging Face (adaptador y copia fusionada) |
| Qwen/Qwen3-4B | 4B | No disponible en la informacion | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas especificas de FinQA | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no es una calculadora: genera un programa que debe ejecutar un motor externo; sin executor, la respuesta no es fiable por si sola.
- Riesgo de alucinacion en la generacion del programa o en las referencias a celdas de la tabla; el formato valido no garantiza que el calculo sea correcto.
- La particion de prueba es propia y no la oficial de FinQA; las puntuaciones no son comparables con la literatura que usa la particion oficial.
- Entrenado y evaluado unicamente en ingles; no se documenta soporte multilingue.
- El autor no documenta sesgos conocidos, numero de tokens de entrenamiento ni composicion detallada del dataset.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen/Qwen3-4B y las condiciones del dataset FinQA.
- El ejemplo de uso requiere desactivar el modo thinking del modelo base y decodificar de forma greedy; usar la configuracion de generacion por defecto (con muestreo) puede degradar el formato.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validacion independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudiptoHaldar/qwen3-4b-finqa-program-qlora
- Copia fusionada: https://huggingface.co/sudiptoHaldar/qwen3-4b-finqa-program-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Codigo, executor y comparacion completa: https://github.com/SudiptoHaldar/qlora_finetuning_public
- Dataset FinQA (referencia del autor): https://huggingface.co/datasets/bevaya/FinQA
- Paper de referencia citado en los tags: arXiv:2505.09388
