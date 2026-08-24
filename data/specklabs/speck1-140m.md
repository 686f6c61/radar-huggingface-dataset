# specklabs/Speck1-140M

## Resumen

Speck1-140M es un modelo de lenguaje base en inglés de 140,7 millones de parámetros desarrollado por specklabs. Su principal innovación es una arquitectura híbrida que intercala atención global con consultas agrupadas (grouped-query attention) y capas de convolución causal con compuerta (gated causal convolution), seguidas de bloques feed-forward SwiGLU. Fue preentrenado desde cero con 5.000 millones de tokens, una cantidad modesta que lo sitúa en la categoría de modelos pequeños orientados a eficiencia y despliegue en entornos con recursos limitados.

El modelo se distribuye con licencia MIT, en formato BF16 Safetensors, e incluye código personalizado para su carga con Transformers mediante `trust_remote_code=True`. Su contexto máximo configurado es de 4.096 tokens, aunque solo está validado hasta 2.048. Al ser un modelo base, no tiene ajuste por instrucciones, ni plantilla de chat ni alineación de seguridad, por lo que su uso directo se limita a continuación de texto y tareas de modelado de lenguaje.

Su relevancia actual radica en explorar alternativas arquitectónicas más allá del transformer denso puro, combinando atención con convoluciones para reducir coste computacional manteniendo capacidad. Los resultados en BananaMind Base Bench 1.1 (Elo 965, accuracy 42,57 %) lo sitúan por debajo de modelos comparables como SmolLM2-135M o BananaMind-2-Pro, que usaron muchos más tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 bloques residuales (8 atención global GQA + 10 convolución causal con compuerta), cada uno con feed-forward SwiGLU |
| Parametros totales | 140.652.288 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 configurado, validado solo hasta 2.048 |
| Tipos de cuantizacion | No disponible (se distribuye en BF16) |
| Idiomas soportados | Inglés |
| Licencia | MIT (tokenizer bajo Apache-2.0, reproducido en LICENSE.tokenizer) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

Speck1-140M usa una arquitectura híbrida que alterna bloques de atención global con consultas agrupadas (12 cabezas Q, 3 cabezas KV, dimensión 64) y bloques de convolución causal con compuerta (kernel sizes 3 y 5, ancho interno 384). Cada bloque va seguido de un feed-forward SwiGLU con ancho intermedio 2.304. El ancho del stream residual es 768, mientras que los embeddings de entrada y salida (640 dimensiones) están atados y conectados al stream residual mediante proyecciones aprendidas. Usa RoPE con theta 10.000 y RMSNorm con epsilon 1e-5.

El entrenamiento se realizó sobre 5.000 millones de tokens con una longitud de secuencia de 2.048, en 76.294 pasos de optimización con 65.536 tokens por paso. Se empleó el optimizador Muon para las matrices 2D y AdamW (β 0,9/0,95, ε 1e-8) para embeddings, normas y kernels de convolución. El pico de learning rate fue 1,5e-3 con decaimiento coseno y warmup de 512 pasos, weight decay 0,1 y gradiente clipping 1,0. El coste computacional estimado es de 4,97 EFLOP y el tiempo de entrenamiento fue de 25,35 horas.

La mezcla de datos incluyó Ultra-FineWeb (39,5 %), DCLM Baseline 1.0 (31,0 %), Cosmopedia v2 (13,4 %), FineMath-4+ (9,5 %) y Ultra-FineWeb-L3 (6,6 %), con un desplazamiento hacia más Cosmopedia, FineMath y Ultra-FineWeb-L3 en fases tardías. Los datos se deduplicaron globalmente con BLAKE2b de 128 bits y se filtraron a 200-100.000 caracteres tras normalización NFKC.

## Capacidades

- Generación de texto en inglés: continuación de texto causal de propósito general, sin ajuste por instrucciones.
- Razonamiento lógico básico: obtiene un Elo de 1019 en la categoría de razonamiento lógico de BananaMind Base Bench.
- Completado de código: mejor resultado relativo en el benchmark (Elo 1157, accuracy 56 %), aunque limitado por el tamaño del modelo.
- Comprensión del lenguaje y conocimiento del mundo: capacidades moderadas, con accuracy de 58 % en completado de lenguaje y 42 % en conocimiento del mundo.
- Matemáticas y cuantitativas: capacidad muy limitada (accuracy 20 % en la categoría cuantitativa).
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (solo texto).
- Sin plantilla de chat ni alineación de seguridad.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo pequeño y con licencia MIT, permite validar ideas de productos de NLP sin coste de inferencia elevado ni restricciones legales.
- Educación e investigación en arquitecturas híbridas: su diseño con atención y convolución intercaladas sirve como banco de pruebas para estudiar el comportamiento de este tipo de arquitecturas en modelos pequeños.
- Generación de código en entornos con recursos limitados: su rendimiento relativo en completado de código (Elo 1157) lo hace utilizable para autocompletado simple en editores ligeros o entornos embebidos.
- Clasificación y análisis de texto mediante fine-tuning: al ser un modelo base, puede ajustarse para tareas específicas como análisis de sentimiento, categorización de documentos o detección de spam, con requisitos de hardware modestos.
- Inferencia en CPU o dispositivos edge: con 55,1 tokens/s en CPU (batch 1), puede ejecutarse en portátiles o servidores sin GPU para tareas de baja latencia.
- Enseñanza de conceptos de LLM: su tamaño reducido y código abierto permiten inspeccionar capas, pesos y activaciones con fines didácticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en BananaMind Base Bench 1.1 (350 ítems, evaluación mediante log-probabilidad condicional media):

| Categoria | Elo | Accuracy | Weighted acc. |
|---|---:|---:|---:|
| Language completion | 982 | 58,0 % | 60,8 % |
| Commonsense | 953 | 46,0 % | 49,8 % |
| World knowledge | 906 | 42,0 % | 43,3 % |
| Context tracking | 899 | 38,0 % | 36,6 % |
| Quantitative | 799 | 20,0 % | 19,6 % |
| Logical reasoning | 1019 | 38,0 % | 39,2 % |
| Code completion | 1157 | 56,0 % | 58,6 % |
| **Overall** | **965** | **42,57 %** | **43,46 %** |

Comparativa con modelos de tamaño similar (datos del autor):

| Modelo | Params | Tokens entrenamiento | Elo | Accuracy | CPU decode | RTX 3090 decode |
|---|---:|---:|---:|---:|---:|---:|
| BananaMind-2-Pro | 139M | 100B | 1131 | 67,14 % | 43,0 tok/s | 140,3 tok/s |
| SmolLM2-135M | 135M | ~2T | 1119 | 66,29 % | 47,4 tok/s | 157,7 tok/s |
| Speck1-140M | 140,7M | 5B | 965 | 42,57 % | 55,1 tok/s | 247,3 tok/s |

Speck1-140M es más rápido en decodificación que sus competidores, pero significativamente menos preciso, lo que refleja la diferencia en volumen de datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 281 MB para los pesos en BF16 (140,7M × 2 bytes), más overhead de activaciones y estado KV. Cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con soporte BF16 (RTX 3090, RTX 4090, etc.). En GPUs sin BF16, puede ejecutarse en FP32 con el doble de memoria.
- CPU: viable para inferencia, con 55,1 tok/s en decodificación batch 1.
- Opciones de despliegue: compatible con Transformers mediante `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la documentación disponible.
- Latencia y throughput: 247,3 tok/s en RTX 3090 (batch 1, decodificación), 55,1 tok/s en CPU. Prefill no reportado en la tabla comparativa para este modelo.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Tokens entrenamiento | Licencia | Formato |
|---|---:|---|---|---|---|
| Speck1-140M | 140,7M | 4.096 (validado 2.048) | 5B | MIT | Safetensors BF16 |
| SmolLM2-135M | 135M | 8.192 | ~2T | Apache-2.0 | Safetensors |
| BananaMind-2-Pro | 139M | no disponible | 100B | no disponible | no disponible |

Speck1-140M se diferencia por su arquitectura híbrida convolución-atención y su licencia permisiva, pero queda por detrás en rendimiento debido a la cantidad mucho menor de datos de entrenamiento. SmolLM2-135M es la alternativa más madura y documentada, con soporte amplio en la comunidad. BananaMind-2-Pro, con 100B tokens, ofrece mejor precisión pero con menor velocidad de decodificación.

## Limitaciones y advertencias

- Modelo base sin alineación: no tiene ajuste por instrucciones, plantilla de chat ni filtros de seguridad. Puede generar contenido inapropiado, sesgado o dañino si se usa directamente en aplicaciones orientadas al usuario.
- Contexto limitado: la ventana de 4.096 tokens no está validada más allá de 2.048, por lo que usos con contextos largos pueden producir degradación impredecible.
- Solo inglés: no soporta otros idiomas, lo que limita su aplicabilidad en entornos multilingües.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, especialmente en tareas de conocimiento del mundo (accuracy 42 %) y cuantitativas (20 %).
- Rendimiento matemático muy bajo: no apto para tareas que requieran cálculo o razonamiento numérico fiable.
- Dependencia de código personalizado: requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del autor no auditado externamente.
- Sin soporte de tool calling ni agentes: no puede integrarse en pipelines que requieran invocación de funciones o razonamiento multi-paso.
- Tokenizer bajo Apache-2.0: aunque el modelo es MIT, el tokenizer (Mistral v0.1 SentencePiece) mantiene su licencia upstream, reproducida en `LICENSE.tokenizer`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/specklabs/Speck1-140M
- Dataset de evaluación BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset DCLM Baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset Cosmopedia v2 (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath-4+: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Sitio web del autor (sin relación directa con el modelo): https://www.speck1.com/
