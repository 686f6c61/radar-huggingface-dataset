# tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del proyecto NeuralOps "Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B (Qwen Team, Alibaba) cuyo bloque de atención de decodificador ha sido quirúrgicamente sustituido por un módulo de atención lineal acelerado con Triton y proyecciones de bajo rango basadas en SVD (`TritonSVDLinearAttention`). El objetivo es demostrar que se puede reemplazar la atención cuadrática por una variante subcuadrática en un transformer preentrenado y recuperar buena parte de la calidad mediante destilación de conocimiento.

El checkpoint se ha ajustado sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`) con un esquema híbrido `hybrid_3_1`: 18 de las 24 capas usan el módulo de atención lineal y 6 capas mantienen atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19, 23). Tras la cirugía, la perplejidad de validación se dispara a 174.088,24 y se reduce a 86,79 tras dos etapas de destilación en 452 pasos (180,3 s en total). Es, por tanto, una pieza de investigación sobre eficiencia de atención, no un modelo listo para producción.

Su relevancia es acotada pero clara para quien trabaja en atención subcuadrática: ofrece un artefacto reproducible (solo pesos de atención, 57,16 MB) con telemetría de entrenamiento completa, licencia MIT y un pipeline de "cirugía" documentado, lo que permite experimentar con atención lineal sobre un modelo pequeño y ampliamente conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `TritonSVDLinearAttention` (lineal + SVD low-rank) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atencion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en FP16 en el ejemplo de uso; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 57,16 MB) + `config.json` y `tokenizer.json`; requiere el modelo base Qwen2.5-0.5B por separado |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Qwen2 estándar de 24 capas, con 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. La modificación sustituye la atención en 18 capas por `TritonSVDLinearAttention`, un módulo de atención lineal con proyecciones de bajo rango SVD reales, soporte causal, bidireccional y cross-attention, y operador de atención personalizado implementado en Triton. El adaptador `QwenAttentionAdapter` gestiona la expansión 14:2 de GQA (7x donde es necesario) y mantiene un contrato de una sola `o_proj`. Las 6 capas ancla conservan atención cuadrática para preservar capacidad de modelado local.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2, con el `lm_head` desactivado en la primera. La etapa 1 (alineación con backbone congelado) dura 108 pasos (54,4 s) y usa MSE y coseno por capa con peso 0,25; la etapa 2 (KD de representaciones multicapa) dura 344 pasos (125,7 s) con peso 0,50. En total, 452 pasos, `seq_len=512`, `grad_accum=4`, `topk=64`, FP16 con autocast y parámetros maestros en FP32, con un pico de VRAM de 11.680 MB. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base y del ajuste sobre WikiText-2.
- Atención lineal subcuadrática con SVD de bajo rango, pensada para reducir el coste computacional en secuencias largas.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo.
- Capacidad de ejecutarse como un Qwen2.5-0.5B estándar tras aplicar la cirugía de atención y cargar los pesos.
- No se documentan tool calling, function calling, agentes, multi-step reasoning ni modo thinking en la información proporcionada.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: solo inglés declarado (`language: en`).

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para comparar atención lineal con SVD frente a atención cuadrática en un transformer pequeño, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento post-cirugía: permite analizar cómo dos etapas de KD (alineación y representaciones multicapa) recuperan la perplejidad tras reemplazar módulos de atención, con curvas y métricas ya publicadas.
- Desarrollo de kernels Triton: el módulo `TritonSVDLinearAttention` es un caso práctico para validar implementaciones de atención lineal con GQA expandido y contrato de `o_proj` único.
- Prototipado de modelos ligeros en inglés: al ser un Qwen2.5-0.5B, puede usarse en entornos con poca VRAM para experimentos de generación de texto de baja latencia, siempre que se asuma la pérdida de calidad frente al base.
- Evaluación de estrategias híbridas de atención: el patrón `hybrid_3_1` con capas ancla permite estudiar el equilibrio entre coste y calidad variando el número de capas lineales.
- Docencia y divulgación: ejemplo completo de cirugía de atención, adaptador de GQA y pipeline de carga en Hugging Face, útil para explicar cómo se modifica un transformer preentrenado sin reentrenarlo desde cero.

## Benchmarks y rendimiento

| Modelo | Dataset / metrica | Resultado |
|---|---|---|
| qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2 | WikiText-2 raw v1, validacion, perplejidad | 86,79 (declarado por el autor, no verificado) |
| Mismo checkpoint, pre-destilacion (Stage 0) | WikiText-2 raw v1, validacion, perplejidad | 174.088,24 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La perplejidad de 86,79 es muy superior a la de un Qwen2.5-0.5B intacto, lo que refleja el coste de la cirugía de atención y una recuperación solo parcial.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó 11.680 MB de pico en FP16 con parámetros maestros FP32; en inferencia FP16 pura un modelo de 0,5B requiere aproximadamente 1-2 GB, aunque no se documenta una medición específica.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP16; para reproducir el entrenamiento se necesitan al menos 12 GB (el autor reporta 11.680 MB de pico).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, siempre que se disponga de memoria suficiente para el modelo base más los pesos de atención.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM`, `safetensors` y el script `apply_qwen_attention_surgery` de NeuralOps; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (180,3 s para 452 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2 | 0,5B | no disponible | 86,79 (declarado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 (segun el modelo base, no confirmado en esta ficha) | Hugging Face |
| Modelos de atencion lineal comparables (p. ej. variantes Mamba o RWKV de tamano similar) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada; la comparativa se limita al modelo base y a la ausencia de métricas públicas de terceros.

## Limitaciones y advertencias

- La perplejidad de 86,79 en WikiText-2 es alta para un modelo de 0,5B; la cirugía de atención degrada la calidad respecto al Qwen2.5-0.5B original y la destilación solo la recupera parcialmente.
- El checkpoint contiene únicamente pesos de atención (57,16 MB); es imprescindible descargar Qwen2.5-0.5B y aplicar la cirugía antes de cargarlos, lo que añade pasos y dependencias (NeuralOps, Triton).
- Entrenado exclusivamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados, con riesgo alto de alucinación y de respuestas pobres fuera de ese registro.
- Solo se declara inglés (`language: en`); no hay evidencia de capacidades multilingües.
- No se documentan sesgos, evaluaciones de seguridad ni filtros de contenido; al derivar de Qwen2.5-0.5B, hereda los sesgos del modelo base sin mitigaciones adicionales.
- Licencia MIT para este checkpoint, pero el uso del modelo base Qwen2.5-0.5B está sujeto a su propia licencia, que debe verificarse por separado.
- No apto para producción sin una evaluación exhaustiva: no hay benchmarks de tareas downstream, ni datos de latencia, ni soporte documentado en motores de inferencia estándar.
- El módulo declara `supports_gqa: No` y `supports_rope: N/A`, aunque el adaptador gestiona la expansión de GQA; conviene revisar la implementación antes de integrarlo en pipelines propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps (Attention Zoo): https://github.com/tahamajs/NeuralOps
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
