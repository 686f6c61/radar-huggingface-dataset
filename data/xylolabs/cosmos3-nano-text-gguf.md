# Xylolabs/Cosmos3-Nano-Text-GGUF

## Resumen

Cosmos3-Nano-Text-GGUF es una exportación cuantizada del torre de comprensión de texto del modelo NVIDIA Cosmos3-Nano, publicada por Xylolabs. El modelo base es un transformer multimodal de NVIDIA cuyo núcleo de texto se inicializó a partir de Qwen3-VL-8B, según indica la propia model card citando el informe técnico Cosmos 3. Esta versión GGUF aísla exclusivamente la pila de decodificación de texto (399 tensores, 36 capas) y descarta los expertos de generación y los componentes de imagen, vídeo, audio y acción, por lo que solo cubre entrada y salida de texto.

El modelo cuenta con 8.190.735.360 parámetros totales y se distribuye en cinco cuantizaciones (IQ4_XS con y sin importance matrix, Q5_K_M, Q6_K y Q8_0) generadas con llama.cpp. Está pensado para ejecución local mediante llama.cpp y ofrece compatibilidad con endpoints, lo que facilita su integración en infraestructuras existentes de inferencia.

Su relevancia radica en que permite ejecutar en hardware modesto una porción funcional de un modelo de NVIDIA originalmente orientado a world models, conservando tokenizador y plantilla de chat originales. La licencia OpenMDW-1.1, junto con los términos Apache 2.0 heredados de Qwen, condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (36 capas), torre de texto de Cosmos3-Nano, tensores renombrados a nomenclatura compatible con Qwen3 |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card no declara el contexto original; el ejemplo de uso limita a 2.048 tokens y las evaluaciones usan 8.192) |
| Tipos de cuantización | IQ4_XS (con y sin imatrix), Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | OpenMDW-1.1 (con términos Apache 2.0 heredados de Qwen retenidos) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El archivo contiene los 399 tensores del decodificador de texto de 36 capas de Cosmos3-Nano, con tokenizador y plantilla de chat originales. Los tensores se han extraído y renombrado a nombres compatibles con Qwen3 para permitir su carga en llama.cpp. No se realizó entrenamiento, calibración ni cuantización nueva para esta publicación: el archivo `-imat` preserva el resultado de importance matrix existente y los nombres de calibración históricos son solo etiquetas de metadatos, sin dataset de calibración incluido.

El modelo base Cosmos3-Nano procede de NVIDIA y, según la model card, se inicializó a partir de Qwen3-VL-8B (identificado en la Tabla 2 del informe Cosmos 3). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La plantilla original no incluye interruptor de modo thinking.

## Capacidades

- Generación de texto y comprensión de texto en inglés y coreano.
- Conversación multi-turno mediante la plantilla de chat original (compatible con `--jinja` en llama.cpp).
- Inferencia local con llama.cpp en formato GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No incluye capacidades de visión, vídeo, audio ni acción: esos componentes fueron omitidos en la exportación.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de las pruebas de razonamiento extendido mencionadas en la evaluación.

## Casos de uso

- Inferencia local de texto en estaciones de trabajo: con la cuantización IQ4_XS (4,56 GB) el modelo puede cargarse en GPUs de consumo y ejecutar consultas de texto sin depender de servicios en la nube.
- Asistentes conversacionales en inglés y coreano: la plantilla de chat original y el tokenizador preservado permiten desplegar diálogos multi-turno mediante `llama-cli` o servidores compatibles con llama.cpp.
- Procesamiento por lotes de textos cortos: las evaluaciones con 16 secuencias de 1.024 tokens y 33 prompts indican un comportamiento estable en textos de longitud moderada, adecuado para clasificación o resumen de documentos breves.
- Prototipado e investigación sobre world models: permite estudiar la torre de texto de Cosmos3-Nano de forma aislada, sin cargar los componentes multimodales, en entornos con recursos limitados.
- Despliegue en contenedores o edge con requisitos de memoria ajustados: la variante IQ4_XS-imat ocupa 4,56 GB de pesos, con memoria adicional para KV cache y buffers.
- Evaluación comparativa de cuantizaciones: los cinco archivos permiten medir el impacto de la cuantización (KL frente a BF16) en una misma tarea antes de fijar una configuración de producción.

## Benchmarks y rendimiento

La model card reporta una evaluación de referencia relativa sobre 16 secuencias de 1.024 tokens (16.272 posiciones puntuadas) en textos en inglés y coreano, comparando contra logits BF16 almacenados. No se reportan benchmarks estándar (MMLU, HumanEval, GSM8K).

| Cuantización | GB descarga | Bits/peso medios | KL medio | KL / Q4_K_M | Aciertos | Perdidos/rotos contados |
|---|---:|---:|---:|---:|---:|---:|
| IQ4_XS-imat | 4,562 | 4,450 | 0,022186 | 0,658× | 31/33 | 0 |
| IQ4_XS | 4,593 | 4,481 | 0,038555 | 1,144× | 29/33 | 1 |
| Q5_K_M | 5,851 | 5,709 | 0,009037 | 0,268× | 31/33 | 0 |
| Q6_K | 6,726 | 6,563 | 0,004359 | 0,129× | 31/33 | 0 |
| Q8_0 | 8,710 | 8,501 | 0,001276 | 0,038× | 31/33 | 0 |
| Q4_K_M (referencia actual) | no disponible | no disponible | 0,033699 | 1,000× | no disponible | no disponible |

La model card indica que no se reporta velocidad de inferencia.

## Requisitos de hardware

- Memoria para pesos: 4,56 GB (IQ4_XS-imat) hasta 8,71 GB (Q8_0); la model card indica que la opción más grande necesita unos 8,70 GB de memoria de dispositivo solo para pesos, más espacio para KV cache y buffers.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabe en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060/4060/4070) en cuantizaciones IQ4_XS o Q5_K_M, y requiere 12 GB o más para Q8_0 con contexto amplio.
- Despliegue: llama.cpp (probado con v0.9.0), con soporte de `llama-cli` y `--jinja`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detallan integraciones concretas.
- Contexto: el ejemplo de la model card limita explícitamente a 2.048 tokens; las evaluaciones usan 8.192 tokens de contexto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cosmos3-Nano-Text-GGUF (este) | 8,19 B | no disponible | en, ko | OpenMDW-1.1 + Apache 2.0 | GGUF | Solo torre de texto, 5 cuantizaciones |
| Qwen3-VL-8B-Instruct | 8 B (aprox.) | no disponible | no disponible | Apache 2.0 | safetensors | Modelo multimodal completo del que se inicializó el texto |
| nvidia/Cosmos3-Nano | no disponible | no disponible | no disponible | OpenMDW-1.1 | no disponible | Modelo base completo con componentes multimodales |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre texto: no incluye visión, vídeo, audio ni acción, pese a que el modelo base es multimodal.
- Idiomas limitados a inglés y coreano; no se garantiza calidad en castellano ni en otros idiomas.
- La model card advierte que las comprobaciones se refieren a textos almacenados y prompts cortos; una aplicación integrada requiere su propia evaluación de tarea.
- Riesgo de alucinación no cuantificado: no se publican métricas de fidelidad factual más allá de las 33 preguntas de la comprobación relativa.
- La cuantización IQ4_XS sin imatrix pierde una respuesta (`ko-fact-hangul`) frente a la referencia BF16; usar IQ4_XS-imat o cuantizaciones superiores reduce la degradación.
- Licencia OpenMDW-1.1 con términos Apache 2.0 heredados: es necesario revisar ambas licencias y el NOTICE antes de uso comercial.
- El modelo se distribuye "tal cual", sin garantía ni respaldo de NVIDIA o del equipo Qwen.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines de agentes que dependan de function calling.
- La plantilla original no tiene modo thinking; las pruebas de razonamiento extendido se consideran no aplicables según la política de formato de pensamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia OpenMDW-1.1: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF/blob/main/LICENSE
- Licencia Apache 2.0 heredada: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF/blob/main/APACHE_LICENSE
- Informe técnico Cosmos 3: https://arxiv.org/html/2606.02800v2#S2.T2
- Código llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Model card de Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
