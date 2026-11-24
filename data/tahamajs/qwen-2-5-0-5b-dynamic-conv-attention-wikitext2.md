# tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2

## Resumen
Este repositorio contiene un checkpoint del modelo Qwen/Qwen2.5-0.5B sometido a una cirugía de atención: 18 de sus 24 bloques decodificadores (75%) han sido sustituidos por el operador `DynamicConvAttention` de la librería NeuralOps, mientras que 6 capas (25%) conservan la atención GQA original de Qwen2 como anclas de recuperación contextual. El resultado es un modelo híbrido de 494M parámetros con una topología 3:1 entre convolución dinámica y atención softmax, orientado a explorar mecanismos de atención subcuadrática en modelos causales compactos.

El modelo ha sido posteriormente destilado mediante un protocolo de dos etapas sobre WikiText-2 (Salesforce/wikitext, wikitext-2-raw-v1), partiendo de un colapso severo tras la cirugía (perplejidad de 356.266,72 en zero-shot) hasta alcanzar una perplejidad de 216,40 en el split de validación. El profesor de referencia (Qwen2.5-0.5B original) obtiene 15,38 de perplejidad, por lo que la brecha tras la destilación sigue siendo sustancial.

Es relevante ahora como artefacto de investigación reproducible para estudiar el impacto de sustituir atención softmax por convoluciones dinámicas causales en modelos pequeños, y como ejemplo de pipeline de destilación de representaciones ocultas con caché offline. No es un modelo listo para producción: su perplejidad está muy por encima del profesor y su licencia MIT permite uso comercial, pero su calidad lingüística es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `DynamicConvAttention` (convolución causal depthwise dinámica) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 494M (modelo base Qwen2.5-0.5B); checkpoint FP16 de 1035,20 MB más adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (heredada de Qwen2.5-0.5B); evaluación realizada a longitud de secuencia 512 |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 completo más adaptador) |
| Idiomas soportados | inglés (etiqueta `en` en la model card); multilingüe heredado del base no confirmado |
| Licencia | MIT |
| Formato de pesos | safetensors FP16 (1035,20 MB) + adaptador; serialización determinista vía NeuralOps |

## Arquitectura y entrenamiento
La arquitectura parte de Qwen2.5-0.5B (24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 de clave/valor con GQA, dimensión por cabeza d_h=64, RoPE con theta=1.000.000). La cirugía `hybrid_3_1` reemplaza las capas en los índices [0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22] por `DynamicConvAttention`, que genera por token y cabeza un filtro de K taps mediante `w_t = softmax(MLP(x_t))` y aplica una convolución causal depthwise sobre V; las proyecciones Q y K se eliminan (Q/K = None) y solo se usan V y O. Las capas [3,7,11,15,19,23] mantienen la atención GQA original como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 mediante un adaptador (`QwenAttentionAdapter`), y despacho de kernel en tres niveles (CUDA/Triton/PyTorch).

El entrenamiento consistió en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2. La etapa 1 (30% del presupuesto, 96 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight_decay=0.01, clipping 1.0), pesos maestros FP32 y AMP FP16 con GradScaler, minimizando MSE por capa más un término de similitud coseno (0.25 · (1 - cos)). La destilación se ejecutó con la arquitectura de caché offline de NeuralOps en una RTX 3090 de 24 GB, con 0 MB de VRAM del profesor en GPU. No se documentan el número total de tokens de entrenamiento ni la composición completa del dataset más allá de WikiText-2.

## Capacidades
- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus tipo WikiText-2.
- Soporte de atención causal con complejidad subcuadrática en las 18 capas transplantadas, potencialmente más eficiente en memoria para secuencias largas.
- Retención de recuperación contextual global gracias a las 6 capas GQA nativas preservadas.
- Compatibilidad con el ecosistema NeuralOps para experimentación con operadores de atención alternativos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Investigación en mecanismos de atención subcuadrática: sirve como banco de pruebas controlado para medir el impacto de sustituir atención softmax por convolución dinámica causal en un transformer pequeño, con métricas de perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones ocultas: el checkpoint y su telemetría (PPL pre-KD de 356.266,72 y post-KD de 216,40) permiten reproducir y comparar protocolos de destilación en dos etapas con caché offline.
- Evaluación de topologías híbridas: la proporción 3:1 entre capas convolucionales y capas GQA permite analizar qué capas requieren atención global para mantener la coherencia y cuáles pueden aproximarse con convolución.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y adaptación de GQA (expansión de 2 a 14 cabezas KV) en un modelo de 494M parámetros que cabe en una GPU consumer.
- Prototipado de kernels: útil para validar el despacho de tres niveles (CUDA/Triton/PyTorch) del operador `DynamicConvAttention` antes de escalar a modelos mayores.
- Análisis de eficiencia memoria/calidad: comparar el coste en perplejidad frente a la ganancia potencial en memoria de activaciones en secuencias de 512 tokens o más.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot pre-KD | 356.266,72 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-KD | 216,40 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | -356.050,32 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,94% | Recuperación desde el pico post-cirugía |

Medido en el split de validación de WikiText-2 (wikitext-2-raw-v1) a longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 para el checkpoint de 1035,20 MB más overhead de activaciones; cuantizaciones a 8 o 4 bits no documentadas pero viables en teoría por el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; la destilación se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB, aunque el modelo final es mucho más ligero.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería es NeuralOps (no transformers estándar); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La conversión a GGUF no está disponible en la información proporcionada.
- Latencia y throughput: no disponibles. La ventaja teórica de la convolución dinámica es la reducción de coste cuadrático en secuencias largas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2 | 494M | 32768 | 216,40 | MIT | Hugging Face (NeuralOps) |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32768 | 15,38 | Apache 2.0 | Hugging Face, transformers |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32768 | no disponible | Apache 2.0 | Hugging Face, transformers |
| Modelos de 0.5B con atención lineal (p. ej. variantes Mamba híbridas) | ~500M | variable | no disponible | variable | variable |

La comparación directa con el profesor es la más informativa: misma arquitectura base y mismo tokenizador, pero una brecha de perplejidad de más de 200 puntos. Frente a alternativas de atención lineal o SSM de tamaño similar no se dispone de datos comparables publicados en la información proporcionada.

## Limitaciones y advertencias
- Calidad lingüística muy degradada: la perplejidad post-destilación (216,40) es catorce veces superior a la del profesor (15,38), lo que indica una generación de texto poco fiable.
- Riesgo elevado de alucinación y de incoherencia en generaciones largas, derivado del colapso parcial de la atención tras la cirugía.
- Entrenado y evaluado únicamente sobre WikiText-2 en inglés; el soporte multilingüe del base no está confirmado ni validado tras la cirugía.
- La sustitución de Q/K por convolución dinámica elimina los cabezales de inducción en 18 de 24 capas, lo que puede afectar a tareas de copia, recuperación exacta y razonamiento multi-paso.
- La librería NeuralOps no es el ecosistema estándar (transformers); la integración en pipelines de producción requiere trabajo adicional y no se documenta compatibilidad con servidores de inferencia habituales.
- Aunque la licencia MIT permite uso comercial, el estado del modelo (checkpoint de investigación con perplejidad alta) desaconseja su uso en producción sin validación exhaustiva.
- No se documentan sesgos específicos ni evaluación de seguridad; hereda los sesgos del corpus WikiText-2 y del modelo base.
- El formato de pesos es FP16 completo más adaptador; no hay versiones cuantizadas oficiales publicadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador DynamicConvAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/dynamic_conv_attention.py
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
