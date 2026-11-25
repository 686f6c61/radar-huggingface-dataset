# tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decoder han sido sustituidas por el operador `AdaptiveSpanAttention` de la librería NeuralOps, manteniendo las 6 capas restantes con la atención GQA original de Qwen2. El resultado es un modelo híbrido 3:1 (75 % atención adaptativa de span, 25 % atención softmax nativa) que posteriormente se destila desde el modelo profesor original mediante un proceso en dos etapas sobre WikiText-2.

El objetivo declarado por el autor es explorar mecanismos de atención subcuadrática en modelos causales compactos sin perder la capacidad de recuperación global que aportan las cabezas de inducción de la atención softmax completa. Es, por tanto, un artefacto de investigación sobre arquitecturas de atención, no un modelo listo para producción: la perplejidad tras la destilación (291,76) sigue estando muy lejos de la del profesor (15,38), lo que refleja el coste de sustituir la atención nativa en un modelo pequeño.

La relevancia actual es metodológica: documenta de forma transparente el protocolo de sustitución de operadores, la inicialización de pesos desde el profesor y las métricas intermedias (incluida la perplejidad cero-shot tras la cirugía, 12.019,39), lo que permite reproducir y comparar experimentos de atención híbrida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `AdaptiveSpanAttention` (NeuralOps) y 6/24 con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.364.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, más un adaptador) |
| Idiomas soportados | inglés (`en` según la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV, dimensión por cabeza 64, RoPE con theta = 1.000.000). La cirugía `hybrid_3_1` sustituye las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `AdaptiveSpanAttention` envuelto en `QwenAttentionAdapter`, y preserva las capas [3, 7, 11, 15, 19, 23] con la atención GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador soporta enmascaramiento causal, GQA y RoPE, y dispone de despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada con caché offline de representaciones del profesor en una RTX 3090 de 24 GB (0 MB de VRAM del profesor en GPU durante la destilación). La etapa 1 (30 % del presupuesto, 107 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con AdamW (lr = 2,0e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 y AMP FP16 con GradScaler, minimizando MSE por capa más 0,25 × (1 − coseno) entre estados ocultos del estudiante y del profesor. La etapa 2 (70 % del presupuesto, 245 pasos) realiza destilación de representaciones de extremo a extremo. La evaluación se hace a longitud de secuencia 512 con batch_size 8 y acumulación de gradiente 4.

## Capacidades

- Generación de texto causal en inglés, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento básico y respuesta conversacional a pequeña escala (0,5B de parámetros).
- Soporte de atención causal autorregresiva con GQA y RoPE en las capas transplantadas.
- Capacidad de recuperación contextual global gracias a las 6 capas ancla con atención softmax nativa.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: la model card solo declara inglés; no hay datos sobre otros idiomas.
- Al ser un artefacto de investigación sobre atención, su capacidad generativa real está muy degradada respecto al modelo base (ver benchmarks).

## Casos de uso

- Investigación en mecanismos de atención eficiente: sirve como punto de partida reproducible para estudiar el impacto de sustituir atención softmax por atención adaptativa de span en modelos causales pequeños, con métricas intermedias publicadas (perplejidad pre y post destilación).
- Experimentos de destilación de conocimiento: el protocolo en dos etapas (alineación de subespacio con backbone congelado y destilación de extremo a extremo) puede replicarse sobre otros pares profesor/estudiante y otras arquitecturas de atención.
- Benchmarking de operadores de la librería NeuralOps: permite comparar el rendimiento del kernel `adaptive_span_attention` (despacho CUDA/Triton/PyTorch) frente a la atención GQA nativa en el mismo backbone.
- Estudio de topologías híbridas: la configuración 3:1 con anclas cada cuatro capas es un caso de estudio concreto para analizar el equilibrio entre complejidad subcuadrática y recuperación de cabezas de inducción.
- Docencia y formación: ejemplo didáctico de cirugía de atención con herencia de pesos, expansión de cabezas KV y serialización determinista de pesos.
- Evaluación de robustez de la perplejidad: útil para medir cuánto se degrada un modelo de 0,5B al alterar su mecanismo de atención, como línea base negativa en estudios comparativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos sobre el split de validación de WikiText-2 a longitud de secuencia 512 en una NVIDIA GeForce RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia con GQA softmax causal |
| Perplejidad cero-shot del estudiante tras la cirugía | 12.019,39 | Inmediatamente después del transplante de 18/24 capas |
| Perplejidad del estudiante tras destilación | 291,76 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplejidad | −11.727,63 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 97,57 % | Recuperación respecto al pico cero-shot |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados ocupan 1021,18 MB en FP16, por lo que la inferencia en FP16 requiere aproximadamente 1,1 GB solo para pesos, más memoria para activaciones y caché KV; en cuantización de 8 bits o 4 bits el requisito sería inferior, aunque no se publican artefactos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para FP16; el autor usó una RTX 3090 (24 GB) para la destilación, no para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM para el contexto usado.
- Opciones de despliegue: la librería es `neuralops`, por lo que la carga requiere esa librería o la conversión de los pesos a un runtime compatible; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (híbrido 3:1 + destilación) | 535 M | no disponible (evaluado a 512) | 291,76 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens (según Qwen2.5) | 15,38 | Apache 2.0 (según Qwen2.5) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 (según Qwen2.5) | Hugging Face |

La comparación directa con el profesor es la más informativa: misma familia y mismo tokenizador, pero una perplejidad casi 19 veces mayor tras la cirugía y la destilación. No se dispone de datos de otros modelos con atención adaptativa de span comparables en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad post-destilación (291,76) es muy superior a la del modelo base (15,38), lo que indica una degradación severa de la calidad del lenguaje; no es adecuado para producción.
- El modelo solo se ha entrenado y evaluado sobre WikiText-2 en inglés; no hay evidencia de generalización a otros dominios ni idiomas.
- Riesgo elevado de alucinación y de generación incoherente debido a la sustitución de la atención nativa en un modelo de solo 0,5B.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y entrenarse solo con WikiText-2, puede heredar sesgos del corpus y del profesor.
- La licencia MIT del repositorio no exime de comprobar las condiciones del modelo base Qwen2.5-0.5B, cuya licencia original es Apache 2.0 según la información de Qwen; conviene verificar los términos aplicables al uso comercial.
- La carga requiere la librería `neuralops`; no se garantiza compatibilidad con runtimes estándar de inferencia.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No hay información sobre la longitud de contexto efectiva soportada tras la cirugía; el entrenamiento se hizo a 512 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-span-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/adaptive_span_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/Salesforce/wikitext
