# yuhuanstudio/Yunmo-Next-1B-Instruct-FP8

## Resumen

Yunmo-Next-1B-Instruct-FP8 es la version cuantizada a FP8 del modelo Yunmo-Next-1B-Instruct, un checkpoint de investigacion de 1.008.899.176 parametros desarrollado por YuhuanStudio y orientado prioritariamente al chino tradicional. El modelo parte de una arquitectura hibrida que combina Kimi Delta Attention (KDA) con atencion de consultas agrupadas (GQA), y fue preentrenado desde cero sobre 19.76B tokens antes de recibir un ajuste por instrucciones. Esta version concreta no altera la arquitectura: solo reduce la precision de los pesos para disminuir el consumo de memoria.

La cuantizacion se ha realizado con torchao 0.18 en formato FP8 e4m3, con pesos cuantizados por fila de salida y activaciones cuantizadas a FP8 por fila en tiempo de ejecucion. Se han convertido 600 de las 645 capas lineales; permanecen en BF16 la capa de embedding/output atada, las 45 proyecciones beta de KDA (de 1.024 a 8), las normas, las convoluciones y el router. El resultado ocupa 1.08 GB en memoria de GPU, frente a los 2.02 GB del modelo en BF16.

Es relevante ahora porque documenta de forma transparente el compromiso entre memoria y calidad en un modelo pequeno con una arquitectura poco habitual (KDA hibrida). El autor advierte explicitamente de que se trata de un checkpoint de investigacion: el modelo esta a nivel de azar en preguntas de conocimiento de opcion multiple, falla a menudo en datos facticos, puede repetirse hasta el limite de tokens y no tiene ajuste de seguridad. Su uso previsto es la experimentacion, no la produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Kimi Delta Attention (KDA) + atencion de consultas agrupadas (GQA) |
| Parametros totales | 1.008.899.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (e4m3) en pesos por fila de salida y activaciones FP8 por fila; existen variantes INT8, NVFP4 y bnb-4bit del mismo modelo base |
| Idiomas soportados | Chino (zh) y ingles (en); etiqueta adicional "traditional-chinese" |
| Licencia | Apache-2.0 (con condiciones adicionales en algunas fuentes de fine-tuning) |
| Formato de pesos | safetensors (FP8), con codigo del modelo via `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que intercala capas de Kimi Delta Attention con atencion de consultas agrupadas. KDA es un mecanismo de atencion lineal con estado recurrente que incluye proyecciones beta de dimension reducida (1.024 a 8), que en esta version cuantizada se mantienen en BF16 por su sensibilidad numerica. El modelo se preentreno desde cero sobre 19.76B tokens y posteriormente se sometio a un ajuste por instrucciones; la model card no detalla la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La cuantizacion FP8 se aplico con torchao 0.18: pesos en e4m3 cuantizados por fila de salida y activaciones cuantizadas dinamicamente por fila durante la inferencia. Quedan fuera de la cuantizacion 45 capas (embedding/output atado, proyecciones beta de KDA, normas, convoluciones y router). El repositorio incluye el codigo del modelo, el tokenizer y la plantilla de chat del modelo de precision completa, y requiere `transformers>=5.14,<6`, `flash-linear-attention==0.5.2` y `torchao>=0.18`. La decodificacion con grafos CUDA esta incluida para los formatos que la soportan.

## Capacidades

- Generacion de texto conversacional en chino tradicional e ingles, con plantilla de chat y token de parada `<|return|>`.
- Respuesta a instrucciones multi-turno mediante `apply_chat_template`.
- Razonamiento basico y generacion de texto libre, limitado por el tamano del modelo y su estado de checkpoint de investigacion.
- Soporte de cuantizacion FP8 para inferencia con menor huella de memoria.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada a los dos idiomas declarados (zh, en).

## Casos de uso

- Investigacion sobre atencion lineal: el modelo permite estudiar el comportamiento de KDA en un transformer pequeno y comparar su calidad frente a atencion estandar con la misma cantidad de parametros.
- Experimentos de cuantizacion: sirve como banco de pruebas para medir la degradacion de calidad de FP8 frente a BF16, INT8, NVFP4 y bnb-4bit con la metrica de bits por byte incluida en la model card.
- Prototipado de chat en chino tradicional: util para validar plantillas de chat, tokenizadores y flujos de generacion en entornos de habla china antes de escalar a modelos mayores.
- Evaluacion de despliegue en GPU de gama consumer: con 1.08 GB en memoria, cabe en tarjetas con soporte FP8 (compute capability 8.9 o superior) y permite probar pipelines de inferencia completos.
- Docencia y divulgacion: su tamano reducido y su arquitectura hibrida lo hacen adecuado para explicar mecanismos de atencion lineal y cuantizacion en cursos tecnicos.
- Generacion de texto exploratoria en ingles y chino: util para tareas de baja exigencia factica donde la creatividad o la fluidez importan mas que la exactitud, siempre con revision humana.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye una evaluacion de calidad y velocidad sobre 3.754 articulos de Wikipedia en chino creados despues del 2026-10-01 (primeros 2.000 caracteres cada uno), medida en bits por byte y latencia de decodificacion por token a 1.024 tokens de contexto, batch 1, en una RTX 4070 Ti:

| Pesos | Repositorio | Memoria en GPU | Bits por byte (menor es mejor) | Delta vs BF16 | ms/token |
|---|---|---:|---:|---:|---:|
| BF16 | Yunmo-Next-1B-Instruct | 2.02 GB | 0.9302 | — | 11.2 |
| INT8 | Yunmo-Next-1B-Instruct-INT8 | 1.08 GB | 0.9304 | +0.0002 | 13.6 |
| FP8 | Yunmo-Next-1B-Instruct-FP8 | 1.08 GB | 0.9313 | +0.0011 | 16.2 |
| NVFP4 | Yunmo-Next-1B-Instruct-NVFP4 | 0.67 GB | 0.9397 | +0.0095 | 107.8 |
| bnb-4bit | Yunmo-Next-1B-Instruct-bnb-4bit | 0.62 GB | 0.9390 | +0.0088 | 138.8 |

En esa GPU todos los formatos cuantizados decodifican mas lentamente que BF16; el autor indica que FP8 debe usarse para ahorrar memoria, no para ganar velocidad.

## Requisitos de hardware

- VRAM estimada: 1.08 GB de pesos en GPU en FP8; el modelo completo en BF16 ocupa 2.02 GB.
- GPU recomendadas: cualquier NVIDIA con soporte FP8, es decir, compute capability 8.9 o superior (Ada, Hopper, Blackwell). Ejemplos: RTX 4070 Ti (medicion del autor), RTX 4090, L40S, A100 no soporta FP8 nativo (compute capability 8.0), por lo que se requiere al menos Ada o superior.
- Cabe holgadamente en GPU consumer con soporte FP8; en GPUs sin soporte FP8 habria que recurrir a las variantes INT8, NVFP4 o bnb-4bit.
- Despliegue: `transformers>=5.14,<6` con `trust_remote_code=True`, `flash-linear-attention==0.5.2` y `torchao>=0.18`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 16.2 ms por token a 1.024 tokens de contexto, batch 1, en RTX 4070 Ti. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-FP8 | 1.008.899.176 | No disponible | Apache-2.0 | Hugging Face | FP8, 1.08 GB en GPU, chino tradicional first |
| Yunmo-Next-1B-Instruct (BF16) | 1.008.899.176 | No disponible | Apache-2.0 | Hugging Face | Referencia de calidad, 2.02 GB en GPU |
| Yunmo-Next-1B-Instruct-INT8 | 1.008.899.176 | No disponible | Apache-2.0 | Hugging Face | 1.08 GB, bits por byte 0.9304 |
| Yunmo-Next-1B-Instruct-bnb-4bit | 1.008.899.176 | No disponible | Apache-2.0 | Hugging Face | 0.62 GB, bits por byte 0.9390 |

No se dispone de datos de benchmarks frente a modelos de otros autores de tamano comparable, por lo que la comparativa se limita a las variantes del mismo modelo base publicadas por el autor.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor indica que el modelo esta a nivel de azar en preguntas de conocimiento de opcion multiple y que falla a menudo en datos facticos.
- Riesgo de repeticion degenerativa: puede repetir texto hasta alcanzar el limite de tokens.
- Sin ajuste de seguridad: no se ha aplicado alineamiento de seguridad, por lo que puede generar contenido inapropiado.
- Sesgos: no se documentan sesgos especificos, pero el preentrenamiento esta sesgado hacia chino tradicional e ingles.
- Contexto e idiomas: la longitud de contexto no esta publicada y el soporte multilingue se limita a zh y en.
- Licencia: los pesos son Apache-2.0, pero algunas fuentes de fine-tuning imponen condiciones propias (AM-Thinking-v1 y destilados de AM-DeepSeek-R1 solo para investigacion; tw-instruct-500k CC BY-NC-SA 4.0; no_robots CC BY-NC 4.0; algunos subconjuntos de FABLE.5 AGPL-3.0). Revisar las secciones Data y License del modelo base antes de un uso comercial.
- Rendimiento: en la GPU medida, FP8 decodifica mas lento que BF16 (16.2 frente a 11.2 ms por token); no debe elegirse por velocidad.
- Dependencias fragiles: requiere versiones concretas de transformers, flash-linear-attention y torchao, y `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-FP8
- Modelo base en precision completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Variante INT8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-INT8
- Variante NVFP4: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-NVFP4
- Variante bnb-4bit: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-bnb-4bit
- Informe de evaluacion: https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/evaluation.md#6-quantized-weights
- Repositorio GitHub del proyecto: https://github.com/YuhuanStudio/Yunmo-Next-1B
