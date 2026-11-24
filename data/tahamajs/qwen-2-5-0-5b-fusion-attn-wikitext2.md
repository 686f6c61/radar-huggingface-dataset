# tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2

## Resumen

`qwen-2.5-0.5b-fusion-attn-wikitext2` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de una cirugía arquitectónica sobre `Qwen/Qwen2.5-0.5B` en la que 18 de las 24 capas de atención del decoder (75%) se han sustituido por el operador `fusion_attn`, una atención híbrida con gating por bloques y dos rutas de ejecución (densa para secuencias cortas, dispersa por bloques para secuencias largas). Las 6 capas restantes conservan la atención GQA nativa de Qwen2 como anclas de enrutamiento contextual global.

El modelo no pretende ser un asistente de propósito general, sino un artefacto de investigación para medir la viabilidad de sustituir atención softmax por operadores subcuadráticos en modelos causales pequeños, seguido de un proceso de destilación de representaciones ocultas en dos etapas sobre WikiText-2. Tras la cirugía, la perplejidad se dispara a 176.122,80; después de la destilación baja a 6.215,12, todavía muy lejos de la referencia del profesor (15,38).

Su relevancia es metodológica: documenta con telemetría detallada el coste de una sustitución masiva de atención y el grado de recuperación alcanzable con destilación offline en una única RTX 3090. No es un modelo para producción en su estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `fusion_attn` (FUSIONATTN, gating por bloques) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parámetros totales | 535.963.552 (según safetensors); la model card cita 494M para el modelo base |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; RoPE con theta = 1.000.000 gestionado por adaptador) |
| Tipos de cuantización | no disponible (pesos publicados en FP16 completo, 1022,33 MB, más adaptador) |
| Idiomas soportados | inglés (etiqueta `en` en la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64. La cirugía aplica un patrón `hybrid_3_1`: las capas en índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `fusion_attn` envuelto en `QwenAttentionAdapter`, mientras que [3, 7, 11, 15, 19, 23] mantienen la atención softmax GQA original. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicación. El operador `fusion_attn` despacha entre kernels CUDA, Triton y PyTorch.

El entrenamiento consiste en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), a longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). Etapa 1 (30% del presupuesto, 136 pasos): solo se entrenan módulos de atención y layer norms, con embeddings, MLPs y `lm_head` congelados; AdamW con lr=2.0e-4, weight decay 0.01, clipping 1.0, pesos maestros FP32 y AMP FP16, minimizando MSE por capa más 0.25·(1 − coseno). Etapa 2 (70%, 323 pasos): destilación extremo a extremo sobre las 24 capas residuales con lr=6.0e-5 y peso de coseno 0.50.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Soporte de atención GQA y RoPE a través del adaptador.
- Dos rutas de atención: densa para N ≤ 128 o cross-attention, y dispersa con gating por bloques para secuencias largas.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otras lenguas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas para medir el impacto de sustituir atención softmax por operadores híbridos con gating por bloques en un decoder causal pequeño, comparando la telemetría de perplejidad pre y post-destilación.
- Estudio de destilación de representaciones ocultas: reproduce el protocolo de dos etapas (alineamiento de subespacio con backbone congelado y destilación extremo a extremo) sobre WikiText-2 con una sola GPU de 24 GB.
- Evaluación de recuperación tras cirugía arquitectónica: cuantifica cuánta capacidad se recupera (96,47% de reducción relativa de perplejidad) frente al colapso inicial, útil para calibrar expectativas en modelos mayores.
- Desarrollo y depuración de kernels: al despachar entre CUDA, Triton y PyTorch, sirve para validar implementaciones del operador `fusion_attn` en entornos controlados.
- Docencia y divulgación: ejemplo reproducible de modificación estructural de un transformer con herencia de pesos y destilación posterior.
- Baseline negativo en evaluación: referencia de un modelo deliberadamente degradado para comparar con alternativas intactas del mismo tamaño en tareas de generación de texto.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | GQA softmax causal de referencia |
| Perplejidad del estudiante pre-destilación | 176.122,80 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilación | 6.215,12 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −169.907,68 | Mejora por destilación |
| Reducción relativa de perplejidad | 96,47% | Recuperación desde el pico post-cirugía |

Evaluado sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch 8 y acumulación 4, en RTX 3090 de 24 GB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos más overhead de activaciones y caché KV; el repo ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; RTX 3090, RTX 4090, A100 o H100 sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo (RTX 3060 en adelante), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería declarada es `neuralops`, no estándar; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Requiere el paquete NeuralOps y su registro de atención (`ATTENTION_REGISTRY`) para cargar el operador `fusion_attn`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2` | 535,96M | no disponible | 6.215,12 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | ~494M | 32.768 tokens (según Qwen) | 15,38 (referencia del autor) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | ~1.500M | 32.768 tokens (según Qwen) | no disponible | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | ~1.240M | 128.000 tokens (según Meta) | no disponible | Llama 3.2 Community License | Hugging Face |

La comparación directa es desfavorable en calidad: el checkpoint quirúrgico multiplica por más de 400 la perplejidad del profesor. Su interés es exclusivamente metodológico, no de rendimiento.

## Limitaciones y advertencias

- Calidad de lenguaje muy degradada: perplejidad de 6.215,12 frente a 15,38 del modelo base; las generaciones serán incoherentes o erráticas en la práctica.
- El proceso de destilación se limita a WikiText-2, un corpus de dominio estrecho; no hay garantía de generalización a otros dominios ni a instrucciones.
- Idiomas: solo se declara inglés; el comportamiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Riesgo elevado de alucinación y de texto degenerado por el desajuste entre capas transplantadas y anclas nativas.
- No se documentan ajustes de alineación (RLHF/DPO) ni evaluación de sesgos; se heredan los sesgos del corpus WikiText-2 y del modelo base.
- Licencia MIT permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue en producción.
- Dependencia de la librería `neuralops` y del operador `fusion_attn`: no es cargable con `transformers` estándar sin el registro de atención correspondiente.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Las fechas de creación y actualización del repositorio (noviembre de 2026) resultan anómalas y conviene tratarlas con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/fusion_attn.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
