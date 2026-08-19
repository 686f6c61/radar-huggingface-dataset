# yobo2u/DeepSeek-V4-Flash-0731-A100

## Resumen

DeepSeek-V4-Flash-0731-A100 es una conversión de pesos del modelo DeepSeek-V4-Flash-0731, desarrollada por la comunidad (usuario yobo2u) para permitir su despliegue en GPUs NVIDIA A100/A800 con arquitectura SM80. El modelo original de DeepSeek está optimizado para GPUs de nueva generación con soporte nativo de FP8, por lo que no puede ejecutarse directamente en hardware SM80. Esta conversión resuelve ese problema transformando los pesos fuera de línea: los pesos no-expert se convierten a BF16 y los pesos de los expertos MoE se mantienen en representación MXFP4.

El repositorio incluye 48 shards de safetensors con un peso total aproximado de 173 GB (decimal) y soporta una longitud de contexto de hasta 1.048.576 tokens. La inferencia requiere SGLang 0.5.16 con un monkeypatch específico para SM80 y hardware de 8× A100/A800 80GB con tensor parallelism 8. No es una versión oficial de DeepSeek, sino una adaptación comunitaria, y la licencia declarada es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en DeepSeek-V4-Flash-0731 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (pesos no-expert) + MXFP4 (pesos expert) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, ~173 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo DeepSeek-V4-Flash-0731, descrita como un modelo de Mezcla de Expertos (MoE) según la documentación de DeepWiki. Este repositorio no modifica la arquitectura, sino que realiza una conversión de pesos para adaptarla a GPUs SM80: los parámetros no-expert se almacenan en BF16 y los expertos MoE en MXFP4, una representación de 4 bits con escala compartida por bloques. Esta conversión permite ejecutar el modelo en A100/A800 sin soporte FP8 nativo, mediante un monkeypatch sobre SGLang 0.5.16.

No se dispone de información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. La conversión no implica ningún reentrenamiento; solo cambia el formato de almacenamiento de los pesos.

## Capacidades

- Generación de texto y razonamiento de propósito general, según las capacidades del modelo original.
- Generación de código y resolución de problemas de programación, con resultados destacados en LiveCodeBench (91,60) y CodeForces (3052) según la página de Datalearner.
- Razonamiento matemático y de conocimiento general, con puntuación de 86,40 en MMLU Pro.
- Ventana de contexto extremadamente larga (1.048.576 tokens), adecuada para tareas que requieren procesar documentos extensos.
- Soporte multilingüe limitado a inglés y chino (en, zh).
- Soporte de decodificación especulativa mediante DSpark, que acelera la generación.
- No se ha confirmado soporte de tool calling, function calling o capacidades de agente en la información disponible.

## Casos de uso

- Analisis de documentos legales o tecnicos extensos: la ventana de contexto de 1M tokens permite procesar contratos, patentes o informes completos en una sola pasada, sin necesidad de fragmentar el texto.
- Generacion de codigo en entornos de produccion: el modelo puede asistir en la escritura de funciones, revision de código y generacion de tests, con resultados competitivos en benchmarks de código.
- Razonamiento matematico y cientifico: adecuado para resolver problemas de matematicas avanzadas, demostraciones y analisis cuantitativo, gracias a su rendimiento en MMLU Pro y GSM8K (no confirmado).
- Atencion al cliente en chino e ingles: puede gestionar conversaciones multi-turno con historial largo, aunque no se ha confirmado soporte de tool calling para integraciones con APIs.
- Resumen y extraccion de informacion de corpus extensos: la ventana de 1M tokens permite resumir libros, bases de conocimiento o logs de sistemas en una unica consulta.
- Investigacion academica: el modelo puede ayudar en la redaccion de articulos, revision de literatura y generacion de hipotesis, siempre que se valide la salida para evitar alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion de pesos. Los datos disponibles provienen del modelo original DeepSeek-V4-Flash-0731, segun la pagina de Datalearner:

| Benchmark | Puntuacion | Posicion |
|---|---|---|
| LiveCodeBench | 91,60 | 4/126 |
| MMLU Pro | 86,40 | 17/133 |
| CodeForces | 3052 | 3/20 |

En cuanto al rendimiento de inferencia, la configuracion verificada en el repositorio (8× A800 80GB, TP=8, SGLang 0.5.16 con monkeypatch, DSpark) alcanza aproximadamente 126 tokens/s de decode por request, con un consumo de memoria de unos 47 GB por GPU. Estos valores pueden variar segun la longitud de entrada, la concurrencia, el driver CUDA y la topologia de red.

## Requisitos de hardware

- Hardware minimo recomendado: 8× NVIDIA A100 80GB o 8× A800 80GB (SM80), con tensor parallelism 8.
- VRAM estimada: ~47 GB por GPU en la configuracion verificada, lo que implica un total de ~376 GB distribuidos.
- No es ejecutable en GPUs de consumo (RTX 4090, etc.) debido al tamaño total de los pesos y a la necesidad de memoria distribuida.
- Framework de inferencia: SGLang 0.5.16 (commit `fdebc938f7f4d16fe6b9f55dcd9a767cf0899ea1`) con un monkeypatch especifico para SM80. No es compatible con vLLM ni con SGLang sin parchear.
- Opciones de despliegue: servidor de inferencia SGLang en el puerto 8082, con chunked prefill de 16.384 y max running requests de 16.
- Latencia y throughput: ~126 tok/s de decode por request en la configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Contexto | Formato de pesos | Hardware requerido | Licencia |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 1.048.576 | FP8 nativo (nuevas GPUs) | GPUs con soporte FP8 | MIT |
| DeepSeek-V4-Flash-0731-A100 (esta conversion) | 1.048.576 | BF16 + MXFP4 | A100/A800 SM80 | MIT |
| DeepSeek-V4-Flash-0731-BF16-MXFP4 (otra conversion del mismo autor) | no disponible | BF16 + MXFP4 | no especificado | MIT |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (tamano y tarea) en las fuentes proporcionadas. La principal diferencia con el original es la adaptacion a hardware SM80, a costa de un formato de pesos mixto que requiere un framework especifico.

## Limitaciones y advertencias

- No es una version oficial de DeepSeek; es una conversion comunitaria y no debe tratarse como un lanzamiento oficial del modelo.
- Requiere un monkeypatch especifico de SGLang 0.5.16; los pesos no pueden cargarse directamente con Transformers, vLLM o SGLang sin modificar.
- El flag `--quantization fp8` en el arranque es parte del flujo del monkeypatch, pero no significa que todos los pesos esten en FP8; los expertos usan MXFP4 y el resto BF16.
- Solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones criticas.
- La licencia MIT aplica a esta conversion, pero deben respetarse los terminos de la licencia del modelo original (tambien MIT segun la model card).
- El rendimiento puede degradarse con entradas muy largas o alta concurrencia; los valores publicados son de una configuracion especifica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yobo2u/DeepSeek-V4-Flash-0731-A100
- Repositorio GitHub de despliegue: https://github.com/yobo2u/DeepSeek-V4-Flash-0731-A100
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentacion de DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Pagina de benchmarks en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
- Monkeypatch SM80: https://github.com/yaleyoou/deepseek-v4-a100-sglang-v0516
- SGLang: https://github.com/sgl-project/sglang
