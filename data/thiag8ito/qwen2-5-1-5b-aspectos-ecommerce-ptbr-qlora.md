# thiag8ito/qwen2.5-1.5b-aspectos-ecommerce-ptbr-qlora

## Resumen

El modelo `thiag8ito/qwen2.5-1.5b-aspectos-ecommerce-ptbr-qlora` es un adaptador QLoRA publicado por el usuario thiag8ito sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su propósito es muy concreto: realizar análisis de sentimiento por aspectos (aspect-based sentiment analysis, ABSA) sobre reseñas de comercio electrónico en portugués de Brasil, devolviendo un JSON con el sentimiento asociado a tres aspectos fijos: producto, entrega y atención.

El adaptador se ha entrenado con LoRA de rango 16 sobre una base cuantizada en 4 bits NF4, y emplea reseñas reales del dataset público de Olist como fuente de texto. Las etiquetas de entrenamiento y validación son "silver", generadas por un LLM mayor (Qwen2.5-7B-Instruct en 4 bits con few-shot), mientras que el conjunto de test consta de 300 reseñas revisadas manualmente (gold). El split es de 2400/300/300.

Su relevancia es práctica: demuestra que un modelo pequeño (1.5B parámetros) ajustado con QLoRA en una GPU T4 gratuita de Colab puede superar de forma clara tanto al modelo base en zero-shot como a una línea base clásica de TF-IDF + regresión logística en una tarea de extracción estructurada de opiniones, con un F1 macro medio de 0,691 frente a 0,472 y 0,587 respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.5B en el modelo base; el adaptador LoRA se suma sobre la base cuantizada (tamaño del repo: 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, valor no confirmado en la model card) |
| Tipos de cuantizacion | Base cargada en 4-bit NF4 con double quant y compute en fp16 (BitsAndBytes); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Portugues (pt), concretamente portugues de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros. El ajuste es un QLoRA: la base se carga en 4 bits NF4 con doble cuantización y cómputo en fp16, y se entrena un adaptador LoRA con r=16, alpha=32, dropout de 0,05 y aplicado a todas las proyecciones lineales. El optimizador es paged AdamW de 8 bits con learning rate 2e-4, scheduler cosine y warmup del 3 %. El batch efectivo es de 16 (8 × 2 de acumulación), se realizan 2 épocas y la pérdida se calcula únicamente sobre los tokens de la respuesta. Todo el entrenamiento se ejecutó en una GPU T4 (Colab gratuito).

Los datos provienen de reseñas de Olist (texto de 25 a 400 caracteres, deduplicadas y con muestra balanceada por nota). El split es de 2400 ejemplos de entrenamiento, 300 de validación y 300 de test. Las etiquetas de entrenamiento y validación son silver, generadas por Qwen2.5-7B-Instruct en 4 bits con few-shot y una guía de anotación fija; el test de 300 reseñas fue revisado manualmente (gold). La tarea es de generación estructurada: dado un mensaje de sistema fijo y una reseña, el modelo debe emitir exclusivamente un JSON con las claves `produto`, `entrega` y `atendimento`, cada una con uno de los valores `positivo`, `negativo`, `neutro` o `ausente`. No se documenta RLHF ni DPO en la información disponible.

## Capacidades

- Clasificación de sentimiento por aspectos (ABSA) sobre reseñas de e-commerce en portugués de Brasil, con tres aspectos fijos: producto, entrega y atención.
- Generación de salida estructurada en JSON con un esquema fijo de tres claves y cuatro valores posibles.
- Detección de mención del aspecto (distinción entre `ausente` y el resto de polaridades).
- Conversación con plantilla de chat (`apply_chat_template`) y prompt de sistema específico, que debe coincidir con el usado en entrenamiento.
- Generación de texto genérica heredada del modelo base Qwen2.5-1.5B-Instruct (no es el objetivo del ajuste).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking específico para este adaptador.

## Casos de uso

- Monitorización de opiniones en marketplaces: procesar en lote las reseñas de Olist o de plataformas similares y agregar el sentimiento por aspecto para detectar caídas de satisfacción en entrega o atención antes de que afecten a la valoración global.
- Enrutamiento automático de incidencias: si el aspecto `entrega` sale `negativo` y el `atendimento` también, derivar el caso a logística y a soporte al cliente respectivamente, usando el JSON de salida como entrada de un sistema de tickets.
- Cuadro de mando de vendedores: calcular métricas periódicas de F1 de mención y polaridad por aspecto para cada vendedor y alimentar informes internos; el modelo cabe en una T4 y permite ejecución batch económica.
- Análisis de campañas postventa: clasificar respuestas de encuestas de satisfacción de 25 a 400 caracteres y extraer qué dimensión del servicio está generando fricción.
- Preetiquetado para anotación humana: usar el adaptador como primer paso de un pipeline de anotación, revisando manualmente solo los casos con `neutro` o con baja confianza, dado el exact match de 0,733 en test.
- Prototipado rápido en investigación: servir como referencia reproducible de ABSA con QLoRA sobre un modelo de 1.5B, útil para comparar con enfoques clásicos (TF-IDF + regresión logística) o con modelos mayores en zero-shot.
- Extracción de señales para búsqueda y ranking: incorporar el sentimiento por aspecto como característica en sistemas de recomendación o de ordenación de reseñas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 300 reseñas con etiqueta humana (gold). Las salidas inválidas cuentan como error.

| Modelo | JSON válido | F1 producto | Acc producto | F1 entrega | Acc entrega | F1 atención | Acc atención | F1 macro medio | Exact match | F1 mención |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-1.5B zero-shot | 0,96 | 0,575 | 0,693 | 0,522 | 0,680 | 0,319 | 0,480 | 0,472 | 0,267 | 0,758 |
| TF-IDF + LogReg | 1,00 | 0,690 | 0,767 | 0,604 | 0,803 | 0,466 | 0,740 | 0,587 | 0,487 | 0,838 |
| Qwen2.5-1.5B + QLoRA | 1,00 | 0,805 | 0,877 | 0,689 | 0,913 | 0,577 | 0,887 | 0,691 | 0,733 | 0,923 |

El adaptador mejora al modelo base en zero-shot en todas las métricas y supera a la línea base TF-IDF + LogReg en F1 macro medio (0,691 frente a 0,587), exact match (0,733 frente a 0,487) y F1 de mención (0,923 frente a 0,838). La mayor ganancia se da en el aspecto `atendimento`, donde el F1 sube de 0,319 (zero-shot) a 0,577.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 0,1 GB; la base Qwen2.5-1.5B-Instruct en 4-bit NF4 requiere aproximadamente 1-2 GB de VRAM, más overhead de activaciones y del contexto.
- GPU recomendadas: T4 (16 GB) es suficiente y fue el hardware de entrenamiento; también cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-6 GB de VRAM en cuantización 4-bit; en fp16 la base de 1.5B ocupa aproximadamente 3 GB de pesos.
- Opciones de despliegue: el flujo documentado usa `transformers` + `bitsandbytes` + `peft` (`PeftModel.from_pretrained`). No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT sobre base cuantizada, el despliegue con vLLM requeriría fusionar el adaptador o usar soporte LoRA de vLLM, no verificado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro medio (test gold) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thiag8ito/qwen2.5-1.5b-aspectos-ecommerce-ptbr-qlora | 1,5B + LoRA | no disponible | 0,691 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct (zero-shot) | 1,5B | no disponible en la información | 0,472 | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (línea base) | no aplica (modelo clásico) | no aplica | 0,587 | no disponible | Implementación propia |
| Qwen/Qwen2.5-7B-Instruct (anotador silver) | 7B | no disponible en la información | no evaluado en test en la model card | Apache 2.0 | Hugging Face |

La comparativa se limita a los tres sistemas evaluados en la model card; no se dispone de datos de otros adaptadores ABSA en portugués para una comparación externa.

## Limitaciones y advertencias

- Dominio restringido: entrenado con reseñas de e-commerce de Olist (2016-2018); el rendimiento puede degradarse fuera de ese dominio o con otros estilos de reseña.
- Etiquetas de entrenamiento silver: el modelo hereda los sesgos y errores del LLM anotador (Qwen2.5-7B-Instruct).
- Ironía, sarcasmo y reseñas mixtas son puntos débiles reconocidos por el autor.
- La clase `neutro` es rara en los datos; las métricas sobre ella tienen alta varianza y su fiabilidad es menor.
- El prompt de sistema debe ser exactamente el usado en entrenamiento; cambios en el formato o en las instrucciones pueden degradar la calidad del JSON.
- Las reseñas pueden contener datos personales no eliminados; el dataset original de Olist está anonimizado, pero no hay garantía adicional en el adaptador.
- Modelo de apoyo al análisis: no debe usarse para decisiones automáticas sobre personas o vendedores sin revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de origen.
- No se documentan benchmarks de rendimiento de inferencia (latencia, throughput) ni límites de contexto específicos del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thiag8ito/qwen2.5-1.5b-aspectos-ecommerce-ptbr-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de reproducción (código y notebooks): https://github.com/thiag8ito/qlora-aspectos
- Dataset de Olist en Kaggle: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
