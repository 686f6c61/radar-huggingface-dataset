# Yash06B/sql-qwen2.5-1.5b-lora

## Resumen

sql-qwen2.5-1.5b-lora es un ajuste fino mediante QLoRA del modelo unsloth/Qwen2.5-1.5B-Instruct, desarrollado por Yash06B, que convierte preguntas en ingles en consultas SQLite para un unico esquema de comercio electronico fijo de siete tablas (customers, orders, order_items, products, categories, payments y reviews). El objetivo declarado es medir hasta donde llega un modelo pequeno ejecutado localmente cuando se especializa en una tarea estrecha con solo 340 ejemplos sinteticos y una GPU gratuita.

El modelo parte de la arquitectura transformer densa de Qwen2.5 con 1.500 millones de parametros y una ventana de contexto nativa de 32.768 tokens, aunque el entrenamiento se realizo con max_seq_length de 2048. Se distribuye como adaptador PEFT (LoRA) en formato safetensors, con un repositorio de aproximadamente 0,1 GB, y existe una version cuantizada GGUF publicada aparte para su uso con Ollama.

Su relevancia es practica: demuestra que un modelo de 1,5B ajustado con QLoRA puede superar en exactitud de ejecucion a un modelo base de mayor tamano como Llama 3.2 3B en modo zero-shot dentro de un dominio acotado (62,0% frente a 52,0% en el conjunto gold_test), con latencias de p50 de 2,34 s en una RTX 4050 de portatil. No es un modelo generalista ni pretende serlo: es un banco de pruebas reproducible de text-to-SQL especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con QLoRA (adaptador LoRA) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 2.048 tokens durante el entrenamiento |
| Tipos de cuantizacion | QLoRA 4-bit en entrenamiento; GGUF Q4_K_M publicado en el repo companion |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en el repositorio Yash06B/sql-qwen2.5-1.5b-GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Sobre el se aplica un adaptador LoRA con rango r=16, alpha=32 y dropout 0,0, entrenado en 4 bits (QLoRA) con la libreria Unsloth. La configuracion de entrenamiento incluye 3 epocas, learning rate de 2e-4, batch efectivo de 16 (batch 4 con acumulacion de gradiente 4), scheduler coseno, warmup del 3%, weight decay de 0,01 y semilla 3407, con max_seq_length de 2048 y evaluacion cada 10 pasos.

El conjunto de entrenamiento consta de 340 ejemplos y 20 de validacion, generados de forma sintetica por qwen2.5-coder:7b y filtrados por ejecucion contra la base de datos. El dataset (Yash06B/shop-text-to-sql) cubre un unico esquema de e-commerce de siete tablas. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-SQL. El prompt de sistema incluye las instrucciones y el esquema completo, y esta incorporado en el Modelfile del repositorio GGUF, por lo que es imprescindible respetarlo para obtener el comportamiento esperado.

## Capacidades

- Generacion de consultas SQLite a partir de preguntas en lenguaje natural sobre el esquema de e-commerce de siete tablas para el que fue entrenado.
- Traduccion de preguntas de dificultad facil, media y dificil dentro del dominio (precision de ejecucion de 93%, 70% y 20% respectivamente en gold_test).
- Produccion de SQL valido en el 86-91% de los casos segun el conjunto de evaluacion.
- Ejecucion local en hardware de consumo mediante cuantizacion GGUF Q4_K_M y Ollama.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generacion de texto e instrucciones en ingles), aunque el ajuste esta orientado exclusivamente a text-to-SQL.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Consultas analiticas sobre el esquema de tienda: un analista escribe "Which 3 countries have the most customers?" y el modelo devuelve la consulta SQLite lista para ejecutar contra las tablas customers y orders, con latencia de p50 de 2,34 s en una RTX 4050.
- Prototipado de interfaces de lenguaje natural a SQL: integrado en un chatbot interno que permite a usuarios no tecnicos consultar el catalogo de productos, pedidos y pagos sin conocer el esquema, aprovechando que el prompt de sistema incluye la definicion completa de las tablas.
- Generacion de informes de ventas bajo demanda: el modelo traduce preguntas sobre ingresos por categoria o resenas por producto en consultas agregadas que alimentan paneles de BI, con la ventaja de ejecutarse en local sin enviar datos a la nube.
- Evaluacion comparativa de tecnicas de ajuste: sirve como referencia reproducible (dataset, pipeline y harness publicados en GitHub) para medir el impacto de QLoRA frente al modelo base zero-shot en tareas text-to-SQL.
- Despliegue en entornos con restricciones de privacidad: al caber en una GPU de portatil y ejecutarse con Ollama, permite consultar bases de datos con datos sensibles de clientes sin salida a servicios externos.
- Base para ajustes sobre nuevos esquemas: el codigo y el pipeline de datos publicados permiten reentrenar el adaptador para otros dominios, usando este modelo como punto de partida y referencia de calidad alcanzable con 340 ejemplos.

## Benchmarks y rendimiento

Exactitud de ejecucion (las filas devueltas coinciden con el SQL de referencia). Conjunto gold_test (n=50):

| Modelo | Hardware | Exactitud (IC 95%) | Facil / Medio / Dificil | SQL valido | p50 | p95 |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B QLoRA, Q4_K_M GGUF (este) | RTX 4050, Ollama | 62,0% (50-74) | 93 / 70 / 20 | 86% | 2,34 s | 2,77 s |
| Qwen2.5-1.5B QLoRA (este) | Colab T4 (4-bit) | 56,0% (42-70) | 80 / 65 / 20 | 88% | 4,44 s | 9,88 s |
| Llama 3.2 3B (base, zero-shot) | RTX 4050, Ollama | 52,0% (38-66) | 80 / 65 / 7 | 86% | 2,59 s | 3,29 s |
| Qwen2.5-1.5B-Instruct (base) | Colab T4 (4-bit) | 32,0% (20-44) | 53 / 35 / 7 | 66% | 3,42 s | 6,41 s |

Conjunto test_synth (n=33):

| Modelo | Hardware | Exactitud (IC 95%) | Facil / Medio / Dificil | SQL valido | p50 | p95 |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B QLoRA, Q4_K_M GGUF (este) | RTX 4050, Ollama | 42,4% (24-61) | 67 / 40 / 33 | 91% | 2,54 s | 3,03 s |
| Qwen2.5-1.5B QLoRA (este) | Colab T4 (4-bit) | 39,4% (24-55) | 67 / 47 / 17 | 85% | 6,03 s | 9,75 s |
| Llama 3.2 3B (base, zero-shot) | RTX 4050, Ollama | 15,2% (6-27) | 33 / 20 / 0 | 94% | 2,78 s | 3,41 s |
| Qwen2.5-1.5B-Instruct (base) | Colab T4 (4-bit) | 12,1% (3-24) | 33 / 7 / 8 | 61% | 4,08 s | 6,97 s |

Coste estimado por 1.000 peticiones en Colab T4: 0,483 USD (QLoRA) frente a 0,355 USD (base) en gold_test, y 0,605 USD frente a 0,410 USD en test_synth.

## Requisitos de hardware

- Inferencia en 4 bits: el adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct; en cuantizacion de 4 bits ocupa aproximadamente 1 GB de VRAM, por lo que cabe holgadamente en GPUs de consumo.
- Verificado en RTX 4050 de portatil (Ollama, GGUF Q4_K_M) y en Colab T4 con cuantizacion 4-bit.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien puede ejecutarse en CPU con llama.cpp a mayor latencia.
- Despliegue recomendado: Ollama con el Modelfile del repositorio GGUF (necesario para incorporar el prompt de sistema con el esquema), llama.cpp para GGUF, o PEFT/vLLM cargando el adaptador sobre el modelo base.
- Latencia medida: p50 de 2,34 s y p95 de 2,77 s en RTX 4050 con GGUF Q4_K_M; p50 de 4,44 s y p95 de 9,88 s en T4 con 4-bit.
- Throughput no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud (gold_test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sql-qwen2.5-1.5b-lora (este) | 1,5B | 32.768 (entreno 2.048) | 62,0% | Apache 2.0 | HuggingFace (adaptador + GGUF) |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | 32,0% | Apache 2.0 | HuggingFace |
| Llama 3.2 3B (base, zero-shot) | 3B | 128.000 | 52,0% | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a los modelos evaluados por el autor en el mismo conjunto de prueba; no se dispone de resultados de modelos API de gran tamano sobre este test set.

## Limitaciones y advertencias

- Entrenado exclusivamente para un esquema fijo de siete tablas; no generaliza a bases de datos arbitrarias sin reentrenamiento.
- Los datos de entrenamiento son sinteticos (generados por qwen2.5-coder:7b y filtrados por ejecucion), por lo que hereda los sesgos y puntos ciegos de ese modelo.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Precision baja en preguntas de dificultad alta (20% en gold_test, 33% en test_synth), lo que desaconseja su uso sin supervision en consultas complejas.
- Entre el 9% y el 14% de las salidas no son SQL valido segun el conjunto de evaluacion.
- Riesgo de alucinacion de columnas o tablas inexistentes; se recomienda validar la consulta generada contra el esquema antes de ejecutarla.
- Los modelos API de gran tamano no han sido evaluados sobre este test set, por lo que no hay comparacion frente a ellos.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias de calidad en produccion.
- Requiere respetar el prompt de sistema con el esquema completo; usarlo con `ollama run hf.co/...` sin el Modelfile produce resultados degradados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yash06B/sql-qwen2.5-1.5b-lora
- Version GGUF para Ollama: https://huggingface.co/Yash06B/sql-qwen2.5-1.5b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Yash06B/shop-text-to-sql
- Codigo, pipeline de datos y harness de evaluacion: https://github.com/Yash06B/slm-finetune
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
