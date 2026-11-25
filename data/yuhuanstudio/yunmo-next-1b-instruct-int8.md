# yuhuanstudio/Yunmo-Next-1B-Instruct-INT8

## Resumen
Yunmo-Next-1B-Instruct-INT8 es la versión cuantizada a 8 bits de Yunmo-Next-1B-Instruct, un modelo de lenguaje de 1.009.740.136 parámetros desarrollado por YuhuanStudio y orientado prioritariamente al chino tradicional. El modelo base se entrenó desde cero sobre 19,76 mil millones de tokens y posteriormente recibió ajuste por instrucciones; esta variante aplica cuantización INT8 simétrica por canal de salida sobre 600 de las 645 capas lineales, manteniendo las activaciones en BF16.

La relevancia de esta ficha es doble. Por un lado, reduce el peso en memoria de inferencia de 2,02 GB (BF16) a 1,08 GB, con una degradación de calidad mínima medida en bits por byte sobre artículos de Wikipedia en chino (0,9302 frente a 0,9304). Por otro, documenta con detalle un pipeline de cuantización basado en torchao 0.18 sobre una arquitectura híbrida poco habitual (Kimi Delta Attention combinada con grouped-query attention), lo que la convierte en una referencia útil para quien experimente con atención lineal y decodificación en GPUs de consumo.

Conviene subrayar que el autor la etiqueta explícitamente como checkpoint de investigación: el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple, falla a menudo en datos factuales, puede repetirse hasta agotar el límite de tokens y no ha recibido ajuste de seguridad. No es, por tanto, un modelo para producción sin salvaguardas adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Kimi Delta Attention (KDA) + grouped-query attention; código propio vía `trust_remote_code` |
| Parámetros totales | 1.009.740.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (pesos simétricos por canal de salida, activaciones en BF16); existen variantes FP8, NVFP4 y bnb-4bit del mismo modelo base |
| Idiomas soportados | chino (zh), inglés (en); etiqueta adicional `traditional-chinese` |
| Licencia | Apache-2.0 (con condiciones adicionales en algunas fuentes de fine-tuning; ver limitaciones) |
| Formato de pesos | safetensors; tamaño del repo 1,1 GB |
| Librería de referencia | transformers (>=5.14,<6), torchao >=0.18, flash-linear-attention 0.5.2 |
| Capas cuantizadas | 600 de 645 lineales; se mantienen en BF16 el embedding/output atado, las 45 proyecciones β de KDA (1.024 → 8), normas, convoluciones y router |

## Arquitectura y entrenamiento
El modelo base emplea una arquitectura híbrida que combina Kimi Delta Attention, un mecanismo de atención lineal con estado recurrente, y grouped-query attention. Esta mezcla busca reducir el coste computacional y de memoria del mecanismo de atención clásico manteniendo la calidad, y exige la librería flash-linear-attention para los kernels de GPU. El modelo se preentrenó desde cero sobre 19,76 mil millones de tokens y después se sometió a ajuste por instrucciones; la model card no detalla la composición exacta del dataset de preentrenamiento ni si se aplicaron RLHF o DPO, aunque sí enumera fuentes de fine-tuning (AM-Thinking-v1, destilaciones de AM-DeepSeek-R1, tw-instruct-500k, no_robots y trazas de FABLE.5).

La contribución técnica de esta ficha concreta es la cuantización. Se aplica INT8 simétrico por canal de salida a las capas lineales con torchao 0.18, dejando en BF16 los componentes sensibles: la capa de embedding/output atada, las proyecciones β de KDA (de dimensión 1.024 a 8), las normas, las convoluciones y el router. El autor publica un `quantization-report.json` con la revisión exacta del checkpoint de origen, lo que facilita la reproducibilidad.

## Capacidades
- Generación de texto conversacional multi-turno en chino tradicional e inglés, con plantilla de chat propia y token de parada `<|return|>`.
- Ajuste por instrucciones: responde a indicaciones directas, aunque con la fiabilidad factual limitada que advierte el autor.
- Soporte de cuantización INT8 lista para GPU mediante torchao, con decodificador con CUDA graphs incluido en el repositorio.
- Compatibilidad con `trust_remote_code` de transformers, lo que permite cargar el modelo con el código y el tokenizer incluidos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a zh y en; no hay evidencia de otros idiomas.

## Casos de uso
- Investigación sobre atención lineal: el modelo permite estudiar en una GPU de consumo el comportamiento de Kimi Delta Attention combinada con GQA, con un checkpoint de 1B parámetros y código abierto.
- Evaluación de pipelines de cuantización: sirve como banco de pruebas para comparar INT8 de torchao frente a FP8, NVFP4 y bnb-4bit con la misma arquitectura, usando las métricas de bits por byte y latencia que publica el autor.
- Despliegue en entornos con memoria muy ajustada: con 1,08 GB de pesos en GPU, cabe en tarjetas de gama baja para prototipos de generación de texto en chino tradicional.
- Generación de texto en chino tradicional para tareas creativas o de formato: el modelo puede producir borradores y reformatear texto, siempre con revisión humana por su tendencia a repetirse.
- Docencia y demostraciones: su tamaño reducido y su licencia Apache-2.0 facilitan su uso en cursos sobre transformers, atención lineal y cuantización.
- Pruebas de robustez y seguridad: al carecer de ajuste de seguridad, es útil para estudiar comportamientos indeseados (repetición, alucinación) en modelos pequeños antes de aplicar salvaguardas.

## Benchmarks y rendimiento
El autor no publica resultados de MMLU, HumanEval, GSM8K ni similares para esta variante; remite al informe de evaluación del modelo base. Los únicos datos cuantitativos disponibles son de calidad (bits por byte sobre 3.754 artículos de Wikipedia en chino creados después del 2026-10-01, primeros 2.000 caracteres) y de latencia (1.024 tokens de contexto, batch 1, RTX 4070 Ti).

| Pesos | Repositorio | Memoria en GPU | Bits por byte ↓ | Δ vs BF16 | ms/token |
|---|---|---:|---:|---:|---:|
| BF16 | Yunmo-Next-1B-Instruct | 2,02 GB | 0,9302 | — | 11,2 |
| INT8 | Yunmo-Next-1B-Instruct-INT8 | 1,08 GB | 0,9304 | +0,0002 | 13,6 |
| FP8 | Yunmo-Next-1B-Instruct-FP8 | 1,08 GB | 0,9313 | +0,0011 | 16,2 |
| NVFP4 | Yunmo-Next-1B-Instruct-NVFP4 | 0,67 GB | 0,9397 | +0,0095 | 107,8 |
| bnb-4bit | Yunmo-Next-1B-Instruct-bnb-4bit | 0,62 GB | 0,9390 | +0,0088 | 138,8 |

En esta GPU todas las variantes cuantizadas decodifican más despacio que BF16; la INT8 es la que menos penaliza (13,6 frente a 11,2 ms/token).

## Requisitos de hardware
- VRAM estimada: 1,08 GB solo para pesos en INT8; hay que sumar la caché KV y activaciones en BF16, por lo que en la práctica conviene reservar 2-3 GB.
- GPU recomendadas: cualquier NVIDIA compatible con flash-linear-attention; el autor probó en RTX 4070 Ti.
- Cabe en GPUs de consumo: sí, en tarjetas con 4 GB o más de VRAM; las variantes NVFP4 y bnb-4bit reducen aún más la huella (0,62-0,67 GB) a costa de latencia.
- Despliegue: transformers >=5.14,<6 con `trust_remote_code`, torchao >=0.18 y flash-linear-attention 0.5.2; el repositorio incluye un decodificador con CUDA graphs.
- Latencia y throughput: 13,6 ms/token en RTX 4070 Ti a 1.024 tokens de contexto y batch 1; no se publican datos de throughput agregado ni de otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-INT8 | 1,01B | no disponible | Apache-2.0 (con condiciones en fuentes de fine-tuning) | INT8 torchao | Chino tradicional primero; checkpoint de investigación |
| Yunmo-Next-1B-Instruct (BF16) | 1,01B | no disponible | Apache-2.0 | BF16 | Misma arquitectura, 2,02 GB, 11,2 ms/token |
| Yunmo-Next-1B-Instruct-FP8 | 1,01B | no disponible | Apache-2.0 | FP8 | 1,08 GB, 16,2 ms/token |
| Yunmo-Next-1B-Instruct-bnb-4bit | 1,01B | no disponible | Apache-2.0 | bnb-4bit | 0,62 GB, 138,8 ms/token |

No se dispone en la información proporcionada de comparaciones con modelos de otros autores (por ejemplo, de la familia Qwen o Llama en el rango de 1B parámetros); por tanto, la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias
- Checkpoint de investigación: el autor advierte que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple y falla a menudo en datos factuales.
- Riesgo de repetición: puede repetirse hasta alcanzar el límite de tokens generados.
- Sin ajuste de seguridad: no se ha aplicado alineamiento de seguridad, por lo que puede producir contenido inapropiado.
- Licencia: los pesos son Apache-2.0, pero algunas fuentes de fine-tuning imponen condiciones propias (AM-Thinking-v1 y destilaciones de AM-DeepSeek-R1 solo para investigación; tw-instruct-500k CC BY-NC-SA 4.0; no_robots CC BY-NC 4.0; algunos subconjuntos de FABLE.5 AGPL-3.0). Revisar las secciones Data y License del modelo base antes de uso comercial.
- Idiomas: solo chino e inglés; no hay soporte documentado de castellano.
- Longitud de contexto: no documentada, lo que dificulta planificar despliegues con prompts largos.
- Dependencias frágiles: requiere versiones concretas de transformers, torchao y flash-linear-attention, y `trust_remote_code` para cargar código propio.
- Rendimiento: en la GPU probada, la cuantización INT8 es más lenta que BF16; no debe elegirse por velocidad sino por ahorro de memoria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-INT8
- Modelo base (BF16): https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Variante FP8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-FP8
- Variante NVFP4: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-NVFP4
- Variante bnb-4bit: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-bnb-4bit
- Informe de evaluación: https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/evaluation.md#6-quantized-weights
- Repositorio del proyecto: https://github.com/YuhuanStudio/Yunmo-Next-1B
