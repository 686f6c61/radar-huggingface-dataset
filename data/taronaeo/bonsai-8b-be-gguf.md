# taronaeo/Bonsai-8B-BE-GGUF

## Resumen

Bonsai-8B-BE-GGUF es una cuantización extrema de 1 bit del modelo Bonsai-8B de Prism ML, compilada en formato GGUF con endianness big-endian y verificada para funcionar en mainframes IBM z15. El modelo original es un denso de 8.19B parámetros basado en la arquitectura Qwen3-8B, con 36 capas Transformer, atención GQA (32 cabezas de consulta y 8 de valor), MLP SwiGLU, RoPE y RMSNorm. Su longitud de contexto es de 65.536 tokens.

La cuantización Q1_0 reduce el peso del modelo de 16.38 GB en FP16 a 1.15 GB, lo que supone una reducción del 93% y un factor de 14.2x. Cada peso se codifica con un bit (0 o 1) y se comparte un factor de escala FP16 por cada grupo de 128 pesos, resultando en 1.125 bits efectivos por peso. Esta cuantización se aplica de extremo a extremo: embeddings, proyecciones de atención, MLP y cabeza de lenguaje.

El modelo es relevante porque demuestra que un modelo de 8B parámetros puede mantener un rendimiento competitivo con precisión de 1 bit, tal y como indica la documentación original con una puntuación media de 70.5 en 6 categorías. Además, su reducido tamaño permite ejecutarlo en prácticamente cualquier dispositivo con GPU, CPU o incluso en mainframes, con un consumo energético de 4 a 5 veces menor por token que el modelo en FP16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B denso: GQA (32 query / 8 KV heads), SwiGLU MLP, RoPE, RMSNorm, 36 capas Transformer |
| Parametros totales | 8.188.548.096 (8.19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF Q1_0 (1-bit, g128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (big-endian) |

## Arquitectura y entrenamiento

El modelo Bonsai-8B-BE-GGUF es una compilación big-endian del Bonsai-8B original, que a su vez es un modelo denso de 8B parámetros basado en la arquitectura Qwen3-8B. La arquitectura incluye 36 bloques decodificadores Transformer, atención con consultas agrupadas (GQA), MLP SwiGLU, codificación posicional rotatoria (RoPE) y normalización RMSNorm. El vocabulario tiene 151.936 tokens.

La innovación técnica principal es la cuantización end-to-end a 1 bit en formato GGUF Q1_0. Cada peso se representa con un único bit: 0 se mapea a -scale y 1 a +scale, donde cada grupo de 128 pesos comparte un factor de escala FP16. Esto da un coste efectivo de 1.125 bits por peso. La cuantización se aplica a todas las capas del modelo, incluyendo embeddings, proyecciones de atención, proyecciones MLP y la cabeza de lenguaje. Los kernels de de-cuantización están integrados en un fork de llama.cpp para CUDA y Metal, evitando la materialización de pesos en FP16 durante la inferencia.

No se ha proporcionado información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF o DPO en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento: el modelo es un LLM de propósito general basado en Qwen3-8B, capaz de generar texto, seguir instrucciones y razonar sobre problemas.
- Soporte de tool calling / function calling: no especificado en la documentación disponible.
- Soporte de agentes y multi-step reasoning: no especificado en la documentación disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan capacidades de visión o audio. La cuantización extrema a 1 bit permite ejecutar el modelo en dispositivos con recursos muy limitados, como teléfonos, portátiles con GPU, CPUs y mainframes.

## Casos de uso

- Ejecución en mainframes IBM z15: el modelo está verificado para funcionar en sistemas mainframe z15, z16 y z17, lo que permite integrar generación de lenguaje natural en entornos corporativos legacy sin necesidad de conversión de endianness.
- Inferencia en dispositivos móviles: con un tamaño de pesos de 1.15 GB, el modelo puede ejecutarse en teléfonos mediante el fork de MLX o llama.cpp, permitiendo asistentes de texto locales sin conexión.
- Análisis de documentos en local: gracias a su contexto de 65.536 tokens, el modelo puede procesar documentos largos, como informes o contratos, en un portátil con GPU o incluso en CPU.
- Prototipado rápido en Google Colab: el modelo dispone de un notebook de Colab oficial, lo que facilita su evaluación sin necesidad de configuración local.
- Investigación en cuantización extrema: sirve como referencia práctica para estudiar el efecto de la cuantización 1-bit en modelos densos, incluyendo su impacto en calidad, velocidad y consumo energético.
- Aplicaciones de bajo consumo energético: la documentación indica un consumo de energía de 4 a 5 veces menor por token que el modelo en FP16, lo que lo hace adecuado para dispositivos alimentados por batería o entornos con restricciones de energía.
- Despliegue en CPU sin GPU: gracias a llama.cpp y a la cuantización Q1_0, el modelo puede ejecutarse íntegramente en CPU, lo que amplía su disponibilidad a servidores sin aceleradores gráficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La documentación del modelo original menciona una puntuación media de 70.5 en 6 categorías, pero no se desglosan los resultados por benchmark (MMLU, HumanEval, GSM8K, etc.). También se indica que la inferencia es 6.2x más rápida que FP16 en una RTX 4090 y que el consumo de energía por token es de 4 a 5 veces menor.

## Requisitos de hardware

- VRAM estimada: la memoria de parámetros es de 1.15 GB. La VRAM total necesaria depende de la longitud del contexto y del tamaño del batch; para cargas típicas, una GPU con 2 GB de VRAM o más es suficiente.
- GPU recomendadas: cualquier GPU compatible con CUDA o Metal con al menos 2 GB de VRAM. La documentación reporta una aceleración de 6.2x frente a FP16 en RTX 4090.
- En consumer GPU: sí, el modelo cabe en GPUs de gama baja, como RTX 3050 o RTX 4060, y también en CPUs sin GPU.
- Opciones de despliegue: llama.cpp (con kernels CUDA, Metal y CPU), Ollama, y los forks de llama.cpp y MLX de Prism ML. También puede ejecutarse en Google Colab.
- Latencia y throughput: no se han publicado cifras concretas. La documentación indica una velocidad 6.2x superior a FP16 en RTX 4090 y un consumo energético de 4 a 5 veces menor por token.

## Comparativa con modelos similares

| Modelo | Tamaño de pesos | Formato | Contexto | Licencia |
|---|---|---|---|---|
| Bonsai-8B-BE-GGUF (1-bit) | 1.15 GB | GGUF Q1_0 (big-endian) | 65.536 tokens | Apache 2.0 |
| Bonsai-8B FP16 original | 16.38 GB | FP16 | 65.536 tokens | Apache 2.0 |
| Bonsai-8B MLX 1-bit | 1.28 GB | MLX 1-bit g128 | 65.536 tokens | Apache 2.0 |

La comparativa se limita a las distintas versiones del mismo modelo, ya que no se dispone de datos de benchmarks de otros modelos 8B cuantizados a 1 bit en la información proporcionada.

## Limitaciones y advertencias

- La cuantización extrema a 1 bit puede degradar la calidad de generación en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo, aunque la documentación afirma que mantiene un rendimiento competitivo.
- No se ha documentado el soporte de tool calling, funciones o agentes; estas capacidades no están confirmadas para esta versión.
- Los idiomas soportados no están especificados en la documentación, por lo que no se puede garantizar el rendimiento multilingüe.
- El modelo está compilado para big-endian; en sistemas little-endian puede requerir conversión o no funcionar correctamente fuera de los mainframes IBM z15.
- Existe riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas abiertas o de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar los términos del modelo base y las dependencias del fork de llama.cpp.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/taronaeo/Bonsai-8B-BE-GGUF
- Modelo original en HuggingFace: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Documentación oficial de Bonsai 8B: https://docs.prismml.com/models/bonsai-8b
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf
- Repositorio de demostraciones y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Notebook de Colab: https://colab.research.google.com/drive/1EzyAaQ2nwDv_1X0jaC5XiVC3ZREg9bdG?usp=sharing
- Fork de llama.cpp (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Comunidad Discord: https://discord.gg/prismml
