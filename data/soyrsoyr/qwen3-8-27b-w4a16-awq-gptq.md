# soyrsoyr/Qwen3.8-27B-W4A16-AWQ-GPTQ

## Resumen
El modelo `soyrsoyr/Qwen3.8-27B-W4A16-AWQ-GPTQ` es una version cuantizada del modelo multimodal Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Esta cuantizacion, realizada por el usuario soyrsoyr, reduce el peso del modelo a un esquema INT4 weight-only (W4A16) mediante una receta combinada de AWQ y GPTQ, calibrada con el dataset ultrachat_200k. El resultado es un modelo de 27B (aunque los safetensors cuantizados ocupan unos 11B de parametros reales) que mantiene una alta fidelidad respecto al original en bf16, con una recuperacion media del 99,3% en benchmarks de conocimiento general y del 94,9% en razonamiento generativo.

Su relevancia actual radica en que permite ejecutar un VLM de razonamiento de ultima generacion en hardware asequible para desarrolladores, como cuatro RTX 3090, con soporte nativo para vision, tool calling, decodificacion especulativa y una ventana de contexto de 256K tokens. Al estar licenciado bajo Apache 2.0 y ser compatible con vLLM, se posiciona como una opcion solida para despliegues en produccion que requieran multimodalidad y razonamiento complejo sin depender de APIs propietarias.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (16 capas full attention, 48 capas linear attention) + vision tower |
| Parametros totales | 11.061.858.032 (pesos safetensors cuantizados; el modelo base es denso de 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (ventana de servicio verificada en vLLM) |
| Tipos de cuantizacion | W4A16 (INT4 weight-only, AWQ + GPTQ, group size 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento
El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3.5 y emplea una arquitectura de atencion hibrida: solo 16 de las 64 capas del decoder utilizan atencion completa (full attention), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional en contextos largos sin sacrificar la calidad en tareas de razonamiento. Ademas, es un modelo nativamente multimodal (image-text-to-text), con un vision tower que procesa imagenes.

La cuantizacion se realizo con `llm-compressor`. La receta aplica primero AWQ (con duo_scaling y n_grid=20) y despues GPTQ (W4A16, block_size 128, actorder estatico). Solo se cuantizan las capas `Linear` del decoder de texto; el vision tower, los mixers de atencion lineal (`linear_attn`) y la capa `lm_head` permanecen en bf16. Se preserva el predictor MTP (Multi-Token Prediction) del modelo base, lo que permite usar decodificacion especulativa en vLLM. La calibracion se hizo con 512 muestras de ultrachat_200k a 2048 tokens.

## Capacidades
- Generacion de texto y razonamiento complejo con cadena de pensamiento (thinking mode) integrada.
- Procesamiento multimodal de imagen a texto (image-text-to-text), capaz de analizar imagenes y documentos.
- Soporte completo de tool calling y function calling, compatible con esquemas OpenAI/Anthropic y MCP (Model Context Protocol).
- Capacidad para agentes autonomos con razonamiento multi-paso y round trips de tool-result.
- Decodificacion especulativa gracias al predictor MTP preservado, mejorando la latencia de generacion.
- Excelente rendimiento en matematicas y problemas cientificos (AIME-24, AIME-25, MATH-500).
- Capacidades multilingues heredadas del modelo base, aunque la lista exacta de idiomas no esta disponible en la informacion proporcionada.

## Casos de uso
- Razonamiento matematico y cientifico: con un AIME-24 avg@4 de 90,83 y un MATH-500 pass@1 de 80,80, es adecuado para resolver problemas complejos de calculo, fisica o ingenieria en entornos educativos o de investigacion.
- Agentes autonomos con tool calling: su soporte nativo para MCP y esquemas de OpenAI/Anthropic permite construir agentes que consultan APIs, bases de datos o ejecutan acciones en el navegador, manteniendo el estado de la conversacion durante multiples iteraciones.
- Automatizacion de oficina: al ser un VLM, puede procesar capturas de pantalla, PDFs escaneados o imagenes de diagramas para extraer informacion, generar resumenes o rellenar formularios, reduciendo tareas administrativas repetitivas.
- Asistente de codigo en local: con una ventana de 256K tokens, puede manejar repositorios completos o archivos muy largos. El rendimiento de decode de 66,3 tok/s en TP4 lo hace util para completar codigo y refactorizar en tiempo real.
- Analisis de imagenes y documentos: su pipeline image-text-to-text permite responder preguntas sobre graficos, fotografias o documentos mixtos (texto + imagen) sin necesidad de un pipeline OCR separado.
- Inferencia self-hosted en GPUs de gama media: con 26,8 GB de VRAM y soporte para 4x RTX 3090, es viable para startups o equipos de investigacion que quieran desplegar un modelo de razonamiento multimodal sin depender de la nube.
- Investigacion en eficiencia de cuantizacion: la receta AWQ+GPTQ con recuperacion del 99,3% en OpenLLM v1 sirve como caso de estudio para comparar tecnicas de compresion en modelos de atencion hibrida.

## Benchmarks y rendimiento
Los resultados se obtuvieron con `lm-evaluation-harness` (OpenLLM v1) y `lighteval` (razonamiento generativo, temperatura 0.6, top_p 0.95, hasta 32K tokens). La comparacion es contra el modelo base en bf16 bajo condiciones identicas.

### OpenLLM Leaderboard v1
| Benchmark | Qwen3.8-27B (bf16) | W4A16-AWQ-GPTQ | Recuperacion |
| :-- | :--: | :--: | :--: |
| ARC-Challenge (25-shot), acc_norm | 50.68 | 50.09 | 98.8% |
| HellaSwag (10-shot), acc_norm | 71.99 | 71.94 | 99.9% |
| TruthfulQA-mc2 (0-shot), acc | 61.25 | 60.33 | 98.5% |
| Winogrande (5-shot), acc | 76.87 | 76.64 | 99.7% |
| **Promedio** | **65.20** | **64.75** | **99.3%** |

Nota: MMLU y GSM8K se omiten porque el modelo es de razonamiento y el protocolo OpenLLM v1 trunca la cadena de pensamiento en GSM8K y mide loglikelihood en MMLU donde el modelo quiere emitir su bloque de pensamiento, produciendo artefactos del harness.

### Suite de razonamiento (generativa)
| Benchmark | Qwen3.8-27B (bf16) | W4A16-AWQ-GPTQ | Recuperacion |
| :-- | :--: | :--: | :--: |
| AIME-24, avg@4 | 95.00 | 90.83 | 95.6% |
| AIME-25, avg@4 | 93.33 | 85.00 | 91.1% |
| MATH-500, pass@1 | 82.00 | 80.80 | 98.5% |
| **Promedio** | **90.11** | **85.54** | **94.9%** |

## Requisitos de hardware
- VRAM estimada: aproximadamente 26,8 GB para el modelo cuantizado completo.
- GPU recomendadas: 4x RTX 3090 24GB en configuracion TP4 (verificada por la comunidad). Tambien es viable TP2xPP2, aunque el decode baja a 46 tok/s.
- GPU de consumo: cabe en multiples RTX 3090/4090 de 24GB. No cabe en una unica GPU de 24GB si se necesita la ventana completa de 256K, pero si en una sola si se reduce el contexto.
- Despliegue: vLLM (recomendado, con kernel Marlin int4), tambien compatible con transformers mediante `llm-compressor` para carga.
- Rendimiento verificado (4x RTX 3090, TP4, vLLM): decode de 66,3 tok/s; prefill en frio de 1.439 tok/s a 33,5K tokens y 1.340 tok/s a 100,4K tokens. Arranque en caliente de 191 segundos.
- Capacidad de KV cache: aproximadamente 846K tokens, lo que equivale a 3,31 veces un contexto completo de 256K.
- Prefix caching: funciona correctamente (una sonda repetida de 1.092 tokens bajo de 1,34s a 0,22s, con un 71,8% de cache hits).

## Comparativa con modelos similares
La comparativa directa mas relevante es contra el modelo base en bf16, ya que es la misma arquitectura. En cuanto a otros modelos multimodales de razonamiento de tamano similar, no se dispone de datos de benchmarks comparativos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (AIME-24 avg@4) |
| :-- | :--: | :--: | :--: | :--: | :--: |
| Qwen3.8-27B (bf16) | 27B (denso) | 256K (servicio) | Apache 2.0 | Safetensors bf16 | 95.00 |
| Qwen3.8-27B-W4A16-AWQ-GPTQ | 27B (denso, ~11B en safetensors cuantizados) | 256K (servicio) | Apache 2.0 | Safetensors W4A16 | 90.83 |
| Otros VLMs cuantizados de 27B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Sesgos: no se han documentado sesgos especificos para esta cuantizacion, pero hereda los sesgos del modelo base Qwen3.8-27B, que no estan detallados en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas, especialmente en tareas de conocimiento factual sin acceso a herramientas.
- Limitaciones de benchmark: MMLU y GSM8K no son medibles con el protocolo estandar OpenLLM v1 debido a artefactos del harness con modelos de razonamiento. Cualquier comparacion que use estos benchmarks debe ser interpretada con cautela.
- Requisitos de hardware: requiere GPUs CUDA con soporte para kernel Marlin o compressed-tensors int4. No funciona en hardware sin soporte CUDA (por ejemplo, Apple Silicon o AMD ROCm) sin adaptaciones adicionales.
- Discrepancia de parametros: el nombre del modelo indica 27B, pero los safetensors cuantizados muestran 11.061.858.032 parametros. Esto se debe probablemente a que solo se guardan los pesos cuantizados del decoder de texto, excluyendo el vision tower y otros componentes en bf16, o a un conteo diferente en el formato compressed-tensors. Es recomendable verificar la carga del modelo completo antes de usarlo en produccion.
- Licencia: Apache 2.0, sin restricciones para uso comercial, pero se debe mantener la atribucion correspondiente.

## Enlaces
- Modelo cuantizado en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-W4A16-AWQ-GPTQ
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Discusion de la comunidad sobre rendimiento (4x RTX 3090): https://huggingface.co/soyrsoyr/Qwen3.8-27B-W4A16-AWQ-GPTQ/discussions/1
