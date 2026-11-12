# tony6767/Gu-1B-500M-tokens

## Resumen

Gu-1B es un modelo de lenguaje causal de aproximadamente 1.010 millones de parámetros desarrollado por el usuario independiente tony6767. Se trata de un experimento educativo entrenado desde cero ("from-scratch") sobre 500 millones de tokens objetivo, con una arquitectura transformer estilo Qwen3 implementada en un notebook de PyTorch. El modelo se publica como checkpoint intermedio para estudiar el entrenamiento de modelos de lenguaje con recursos computacionales limitados, no como un modelo listo para producción.

La arquitectura sigue diseños consolidados: atención con query grouping (GQA), normalización QK, RMSNorm, RoPE y SwiGLU, con 27 capas, anchura oculta de 1.536 y un vocabulario de 49.152 tokens heredado del tokenizer de SmolLM-135M. El entrenamiento se realizó en una única GPU A100 de 80 GB en Colab, con AdamW, precisión BF16 autocast y parámetros en FP32, sobre la configuración cosmopedia-v2 del corpus smollm-corpus.

Su relevancia es fundamentalmente didáctica: ofrece un punto de control a mitad de entrenamiento con métricas preliminares publicadas (entropía cruzada de 2,237 y perplejidad de 9,37 sobre 32.768 tokens de validación) y documenta explícitamente sus limitaciones de generación. No es un modelo conversacional ni sigue instrucciones; es un modelo base de predicción del siguiente token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Qwen3 (GQA, QK normalization, RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 1.009.866.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en este checkpoint; arquitectura configurada hasta 32.768 posiciones |
| Tipos de cuantizacion | no disponible (export en BF16; inferencia en FP16 para T4 y FP32 para CPU) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch, BF16), requiere implementación `GuModel` del notebook; no compatible con carga estándar de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 27 capas, anchura oculta de 1.536, 24 cabezas de query y 8 cabezas key/value (GQA), anchura feed-forward de 6.144 y vocabulario de 49.152 tokens con embeddings de entrada y salida compartidos. Incorpora normalización QK, RMSNorm, RoPE y activación SwiGLU, siguiendo el diseño de Qwen3 adaptado en el notebook `qwen3_from_scratch.ipynb`. La arquitectura está configurada para soportar hasta 32.768 posiciones, aunque las etapas de entrenamiento con contexto largo no se alcanzaron en este checkpoint.

El entrenamiento consumió 500 millones de tokens objetivo de la configuración cosmopedia-v2 del dataset `HuggingFaceTB/smollm-corpus`, con el tokenizer de `HuggingFaceTB/SmolLM-135M`. Se usó AdamW con BF16 autocast y parámetros FP32, tamaño de actualización estándar de 65.536 tokens objetivo (acortado en los límites de guardado) y longitud de secuencia de 4.096 tokens. Todo el entrenamiento se ejecutó en una única A100 de 80 GB en Colab. No se menciona RLHF, DPO ni ajuste por instrucciones; es un modelo base puro. El checkpoint completo de reanudación (pesos FP32, estado de AdamW, estado del RNG, cursor de streaming) requiere aproximadamente 16,2 GB solo para tensores, más activaciones.

## Capacidades

- Generación de texto autoregresiva mediante predicción del siguiente token.
- Razonamiento básico y coherencia local limitada: el autor reporta oraciones legibles mezcladas con errores factuales, repeticiones, deriva temática y contradicciones.
- Capacidad multilingüe: únicamente inglés (idioma declarado en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Seguimiento de instrucciones y comportamiento conversacional: no implementado; requiere evaluación y entrenamiento adicionales.

## Casos de uso

- Estudio educativo de entrenamiento de LLM: sirve como checkpoint intermedio para analizar la evolución de la pérdida y la calidad de generación a lo largo del entrenamiento, comparando con checkpoints posteriores.
- Docencia sobre arquitecturas transformer: el notebook asociado implementa explícitamente GQA, QK normalization, RMSNorm, RoPE y SwiGLU, lo que permite a estudiantes examinar cada componente y su efecto.
- Experimentos de reanudación de entrenamiento: el checkpoint completo (si se publica) permite practicar la reanudación con estado de optimizador, RNG y cursor de streaming, útil para reproducir pipelines de entrenamiento.
- Investigación sobre cómputo limitado: permite estudiar qué calidad se alcanza con 500 millones de tokens en una sola A100, como referencia para decisiones de presupuesto de entrenamiento.
- Generación de texto exploratoria no crítica: completar prompts cortos en inglés para inspeccionar cualitativamente el comportamiento del modelo, siempre con verificación humana de los resultados.
- Análisis de fallos y alucinaciones: los ejemplos documentados por el autor (fallo en completar valores de bit, explicación incorrecta sobre la luz solar, prueba de contexto sobre un propietario de bicicleta) sirven como casos de estudio de modos de fallo en modelos pequeños poco entrenados.
- Base para experimentos de fine-tuning: al ser un modelo de 1B con licencia MIT, puede usarse como punto de partida para probar técnicas de ajuste en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

| Métrica | Resultado reportado |
|---|---|
| Tokens evaluados | 32.768 (ocho secuencias de 4.096 tokens de documentos reservados) |
| Entropía cruzada media (next-token) | 2,237 |
| Perplejidad | 9,37 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación es única, sobre un conjunto pequeño del mismo corpus, y el propio autor la califica de preliminar.

## Requisitos de hardware

- VRAM estimada para inferencia: el export BF16 ocupa aproximadamente 2,02 GB, por lo que la inferencia requiere unos 2-3 GB de VRAM en BF16 (más memoria para el fallback matemático de atención y la recomputación de prefijo).
- GPU recomendadas: A100 80 GB para entrenamiento; para inferencia, cualquier GPU con soporte BF16 (A100, H100) o FP16 (T4). En CPU se usa FP32.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM en BF16/FP16, aunque no se han publicado mediciones concretas.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere la implementación `GuModel` del notebook y carga estándar de Transformers necesita integración adicional.
- Latencia y throughput estimados: no disponible. El autor advierte que el fallback matemático de atención y la recomputación de prefijo pueden aumentar el uso de memoria y la latencia; recomienda empezar con prompts cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gu-1B-500M-tokens | 1.009.866.624 | 4.096 (config. hasta 32.768) | MIT | Hugging Face, requiere código custom | Checkpoint educativo a mitad de entrenamiento |
| SmolLM-135M | 135M | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face | Fuente del tokenizer; modelo más pequeño |
| SmolLM (familia) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face | Referencia de modelos pequeños; datos no confirmados en esta ficha |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene conversaciones; el comportamiento conversacional requiere entrenamiento adicional.
- Alucinaciones y errores factuales documentados por el autor: fallos en completar valores de bit, explicaciones incorrectas sobre la fotosíntesis y pruebas de contexto simples fallidas.
- Repetición, deriva temática y contradicciones en las generaciones muestreadas.
- Contexto efectivo limitado a 4.096 tokens en este checkpoint; la capacidad de contexto largo no se ha medido y las etapas de entrenamiento correspondientes no se alcanzaron.
- Solo inglés; sin capacidades multilingües.
- Evaluación muy limitada: una única ejecución sobre 32.768 tokens del mismo corpus, sin benchmarks estándar ni comparaciones repetidas.
- Carga no estándar: requiere la implementación `GuModel` del notebook; no funciona con el pipeline estándar de Transformers sin integración adicional.
- Riesgo de seguridad en checkpoints completos: el autor advierte de que los archivos de estado de entrenamiento incluyen objetos Python serializados y deben cargarse solo desde fuentes de confianza; el export del modelo usa `weights_only=True`.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin verificación independiente; deben consultarse además las licencias de los repositorios upstream (PyTorch, Hugging Face, SmolLM-135M, smollm-corpus).
- Entrenamiento en una sola GPU: posibles sesgos derivados de la composición del corpus cosmopedia-v2 y de la escala reducida de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tony6767/Gu-1B-500M-tokens
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Tokenizer de origen: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Notebook de arquitectura de referencia: `qwen3_from_scratch.ipynb` (mencionado en la model card, sin URL directa disponible)
- Repositorio del modelo (archivos `Gu-1B-500000000-model.pt` y `training_Gu_1B.ipynb`): https://huggingface.co/tony6767/Gu-1B-500M-tokens/tree/main
