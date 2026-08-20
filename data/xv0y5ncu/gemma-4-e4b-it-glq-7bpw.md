# xv0y5ncu/Gemma-4-E4B-it-GLQ-7bpw

## Resumen

Gemma-4-E4B-it-GLQ-7bpw es una cuantización de alta precisión (7.0 bpw uniforme) del modelo Gemma 4 E4B de Google, realizada mediante Golay-Leech Quantization (GLQ). El modelo base, google/gemma-4-E4B-it, es un transformer denso de aproximadamente 4.28 mil millones de parámetros diseñado para ejecutarse en hardware local, con soporte de modo de razonamiento ("thinking mode") y una ventana de contexto de hasta 256K tokens. Esta variante cuantizada reduce el tamaño de los pesos a 7.98 GB (1.87 veces menor que el original en bf16) manteniendo una calidad de salida prácticamente idéntica al modelo original en tareas de razonamiento matemático, según el benchmark gsm8k incluido en la model card.

La relevancia de este modelo radica en que permite ejecutar un Gemma 4 de nivel medio en GPU de consumo (8 GB de VRAM) sin sacrificar precisión. La cuantización GLQ emplea un codebook basado en el retículo E8 (65536 entradas por bloque de 8 dimensiones), transformada de Hadamard aleatorizada (RHT) y cuantización residual LDLQ, lo que la sitúa como una alternativa competitiva a métodos como AWQ o GPTQ para escenarios de despliegue local con requisitos estrictos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B) |
| Parametros totales | 4.281.666.122 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (modelo base; el cuantizado hereda la misma ventana) |
| Tipos de cuantizacion | GLQ uniforme 7.0 bpw (E8-Lattice, RHT, LDLQ) |
| Idiomas soportados | Ingles (modelo base soporta mas de 140 idiomas) |
| Licencia | Apache 2.0 (con terminos adicionales de Gemma) |
| Formato de pesos | Safetensors (con configuracion GLQ) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B es un transformer denso de 4.4 mil millones de parametros (4.28B reales en safetensors) entrenado por Google DeepMind. Incluye un modo de razonamiento explicito ("thinking mode") activable mediante la plantilla de chat, que genera una cadena de pensamiento intermedia antes de producir la respuesta final. La cuantizacion GLQ aplicada no modifica la arquitectura ni los pesos de manera destructiva: utiliza un codebook del retículo E8 con 65536 entradas por bloque de 8 dimensiones, una transformada de Hadamard aleatorizada (RHT) para rotar entradas y salidas, y un esquema de cuantizacion residual LDLQ con retroalimentacion durante la codificacion. Para capas con 3 bpw o mas, se aplica cuantizacion residual en N etapas; la asignacion de precision mixta se basa en una proxy de sensibilidad derivada de la traza del Hessiano, cuando es aplicable.

El modelo cuantizado mantiene el mismo comportamiento que el original en cuanto a generacion de texto, razonamiento y soporte de tool calling, aunque requiere un presupuesto mayor de `max_new_tokens` en modo pensamiento comparado con el modelo bf16 (2048 tokens recomendados para esta variante de 7 bpw).

## Capacidades

- Generacion de texto y conversacion multiuso con soporte de chat template y thinking mode.
- Razonamiento matematico y resolucion de problemas multi-paso: logra un 90% de precision en gsm8k (50 ejemplos, con thinking mode) frente al 86% del modelo bf16 original.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades de generacion de codigo y asistencia tecnica, propias de la familia Gemma 4.
- Multilingue: el modelo base soporta mas de 140 idiomas, aunque la variante cuantizada ha sido validada principalmente en ingles.
- Modo de pensamiento ("thinking mode") activable mediante `enable_thinking=True` en el chat template.

## Casos de uso

- Inferencia local en GPU de consumo: con 7.98 GB de pesos, puede ejecutarse en tarjetas con 8-12 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para aplicaciones de chatbot privado sin conexion a internet.
- Asistente de razonamiento matemático en educacion: el modelo puede resolver problemas de matematicas paso a paso en modo de pensamiento, adecuado para tutoria automatizada en plataformas educativas.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar documentacion, revision de codigo o autocompletado en entornos con restricciones de hardware.
- Analisis de datos y scripting: puede procesar datasets de texto, generar consultas SQL o scripts de Python en entornos locales sin depender de servicios en la nube.
- Chatbot de atencion al cliente en ingles: con la ventana de 256K tokens, puede gestionar conversaciones de larga duracion manteniendo el contexto completo.
- Prototipado rapido de agentes: combinado con frameworks como LangChain o llama.cpp, permite construir agentes de razonamiento multi-paso con presupuesto de tokens amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la prueba de gsm8k en la model card. La comparacion con el modelo base bf16 es la siguiente:

| Benchmark | GLQ 7bpw | bf16 original |
|---|---|---|
| gsm8k (limit=50, chat+thinking, strict-match) | 90% | 86% |

No se disponen de datos de MMLU, HumanEval, GSM8K completo ni otros benchmarks estandarizados en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB con la cuantizacion 7bpw (el archivo pesa 7.98 GB, mas overhead de activaciones y cache).
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080, A100 40GB, H100.
- Si cabe en GPU consumer: si, con 8 GB de VRAM minimo (por ejemplo, RTX 3060 12GB o RTX 4060 8GB con limitaciones de contexto).
- Opciones de despliegue: se requiere el paquete `glq` y `transformers>=5.13.1,<5.15`. Compatible con vLLM 0.27.1 (verificado). Tambien se puede usar con llama.cpp si se convierte a GGUF, aunque no se menciona en la documentacion.
- Latencia y throughput: no disponible. El kernel CUDA se compila en el primer uso (~30 segundos). Para modo de pensamiento, se recomienda `max_new_tokens=2048` para esta variante, lo que implica una generacion mas larga en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | gsm8k (chat+thinking) | Licencia |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-GLQ-7bpw | 4.28B | 256K | GLQ 7bpw | 90% | Apache 2.0 |
| Gemma-4-E4B-it (bf16) | 4.28B | 256K | bf16 | 86% | Apache 2.0 |
| Gemma-4-E4B-it-GLQ-6bpw | 4.28B | 256K | GLQ 6bpw | no disponible | Apache 2.0 |
| Gemma-4-E4B-it-GLQ-8bpw | 4.28B | 256K | GLQ 8bpw | no disponible | Apache 2.0 |

La comparativa con otras familias (por ejemplo, Llama 3.2 3B o Qwen 2.5 4B) no esta disponible en la informacion proporcionada. La ventaja principal de esta variante es su calidad de cuantizacion superior (7bpw uniforme) y su compatibilidad con el modo de razonamiento de Gemma 4.

## Limitaciones y advertencias

- La cuantizacion GLQ requiere el paquete `glq` y una version de transformers entre 5.13.1 y 5.15 (excluida). La version 5.15.0 rompe la carga del modelo por un cambio en la configuracion de `head_dim`; hay que pinzarla en 5.14.1 o inferior.
- El kernel CUDA se compila en el primer uso (unos 30 segundos) y requiere CUDA 12.x y PyTorch 2.0 o superior.
- En modo de pensamiento, se necesita un presupuesto de tokens mayor que el modelo bf16: para esta variante de 7bpw se recomienda `max_new_tokens=2048`. Si el presupuesto es insuficiente, el modelo puede truncar el razonamiento y omitir la respuesta final.
- La validacion de calidad solo se ha publicado en gsm8k (50 ejemplos); no se ha evaluado en otros benchmarks, por lo que el rendimiento en tareas generales puede variar.
- El modelo base soporta mas de 140 idiomas, pero la cuantizacion y la documentacion se centran en ingles; el rendimiento en otros idiomas no esta garantizado.
- La licencia es Apache 2.0 con terminos adicionales de Gemma (ver https://ai.google.dev/gemma/docs/gemma_4_license). Aunque permite uso comercial, hay que revisar los terminos especificos de la marca Gemma.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos adversos especificos de esta cuantizacion. Se recomienda evaluar en el dominio de uso antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-7bpw
- Modelo base (bf16): https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Guia de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
