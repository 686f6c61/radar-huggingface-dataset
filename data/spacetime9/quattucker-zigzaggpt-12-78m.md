# spacetime9/QuatTucker-ZigZagGPT-12-78M

## Resumen

QuatTucker-ZigZagGPT-12 es un modelo de lenguaje experimental desarrollado desde cero por Shubham Barmase, investigador independiente, y publicado en Hugging Face bajo el identificador `spacetime9/QuatTucker-ZigZagGPT-12-78M`. Se trata de un transformer de 12 capas y dimensión oculta 768 que sustituye las proyecciones densas del FFN por capas cuaterniónicas (`QuatLinear`) combinadas con núcleos Tucker SwiGLU de diagonal por bloques. El objetivo declarado es reducir el número de parámetros del backbone manteniendo o mejorando la perplejidad frente a un GPT-2 Small estándar.

El modelo totaliza 77,6M de parámetros, de los cuales solo 39,0M pertenecen al backbone (frente a los 85,0M de GPT-2 Small), lo que supone una compresión de aproximadamente 2,2x. Fue entrenado con 1.050 millones de tokens del subconjunto `sample-10BT` de `HuggingFaceFW/fineweb-edu` en una única GPU NVIDIA A100-SXM4-40GB, a un throughput de 84,6k tokens por segundo. La longitud de contexto de entrenamiento es de 512 tokens.

Su relevancia es fundamentalmente académica: explora técnicas de descomposición tensorial hipercompleja (álgebra de cuaterniones de Hamilton) y enrutamiento "Braided ZigZag Diamond" como alternativas al escalado denso de parámetros. No es un modelo orientado a producción ni a uso general, sino una prueba de concepto con licencia MIT y pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN cuaterniónico y Tucker SwiGLU de diagonal por bloques |
| Parámetros totales | 77,6M |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros del backbone | 39,0M |
| Longitud de contexto | 512 tokens (T=512 en el checkpoint) |
| Tipos de cuantización | no disponible (solo pesos bfloat16 en PyTorch `.pt`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoint `best_1B.pt`) |
| Vocabulario | 50.257 tokens (V=50257) |
| Dimensión del modelo | 768 |
| Cabezas de atención | 12 |
| Capas | 12 (organizadas en 3 diamantes de 4 capas) |
| Rank del núcleo Tucker | 6144 |
| Núcleo Tucker por bloque | 64x64 diagonal por bloques |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb-edu` (`sample-10BT`) |
| Tokens de entrenamiento | 1,05B |
| Hardware de entrenamiento | 1x NVIDIA A100-SXM4-40GB |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención densa independiente por capa (RoPE + RMSNorm + FlashAttention causal, `d=768`, 12 cabezas). La innovación se concentra en el FFN: en lugar de matrices densas 2D por capa, el modelo organiza sus 12 capas en 3 "Braided ZigZag Diamonds" apilados de 4 capas cada uno. Cada diamante comparte una única base de características SwiGLU de rango 6144 entre sus 4 profundidades, especializando cada nivel mediante un núcleo Tucker real de diagonal por bloques `G[l]` de 64x64. Las proyecciones escalares densas (`U_gate`, `U_val`, `V_out`) se reemplazan por capas `QuatLinear` que se compilan en una única GEMM de Hamilton fusionada en bfloat16 sobre Tensor Cores, logrando una compresión de 4x en los parámetros del FFN.

El enrutamiento "Braided ZigZag Diamond" ejecuta el Bloque 2 como vista previa gruesa y alimenta `0.5(h0 + h2)` de arriba abajo al Bloque 1 antes de fusionar `0.5(h1 + h2)` en el Bloque 3, expandiendo una única trayectoria secuencial del jacobiano en 3 rutas de gradiente concurrentes sin FLOPs adicionales. El entrenamiento se realizó desde cero sobre 1,05B tokens de FineWeb-Edu durante aproximadamente 0,99B tokens efectivos vistos (checkpoint `best_1B.pt`). No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino supervisado posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto limitado a 512 tokens.
- Modelado de lenguaje de dominio general entrenado sobre contenido educativo (FineWeb-Edu).
- Razonamiento básico de siguiente token; no se documentan capacidades específicas de razonamiento multi-paso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No dispone de visión, audio ni modo "thinking" extendido.
- Capacidad de ejecución en GPU de gama baja gracias a su tamaño reducido (39M de parámetros en backbone).

## Casos de uso

- Investigación en eficiencia de parámetros: reproducir los experimentos de compresión cuaterniónica y Tucker comparando perplejidad frente a GPT-2 Small en el mismo corpus, usando el checkpoint `best_1B.pt` y el código de GitHub.
- Estudio de arquitecturas alternativas al FFN denso: analizar el efecto del enrutamiento Braided ZigZag sobre el flujo de gradientes en redes pequeñas, midiendo pérdida de validación en ablaciones a escala 33,5M.
- Prototipado educativo de modelos de lenguaje: servir como base didáctica para explicar atención causal, RoPE, RMSNorm y descomposición tensorial en cursos o talleres, dado su reducido tamaño (0,3 GB de pesos).
- Generación de texto de baja latencia en entornos con recursos limitados: al caber en GPUs consumer modestas, puede emplearse para completar texto en inglés en demos locales con contexto corto.
- Comparación de metodologías de compresión: usar los checkpoints de las ablaciones (StandardGPT, CP-ZigZagGPT, Tucker-ZigZagGPT, QuatTucker-ZigZagGPT) como línea base en estudios sobre eficiencia de parámetros.
- Experimentos de destilación o inicialización: emplear el backbone de 39M como inicialización para tareas downstream de clasificación o generación en inglés, aunque requeriría ajuste fino adicional no documentado.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con GPT-2 Small en distintos regímenes de entrenamiento. Los datos provienen de la model card.

**Etapa 1 controlada (A100, 16,4M tokens, RoPE + RMSNorm):**

| Modelo | Params totales | Params backbone | Paso 400 | Paso 800 | Paso 1000 (final) | PPL final |
|---|---|---|---|---|---|---|
| StandardGPT-12 (GPT-2 Small) | 123,6M | 85,0M | 5,9776 | 5,5484 | 5,4410 | 230,67 |
| QuatTucker-ZigZagGPT-12 | 77,6M | 39,0M (2,2x menor) | 5,8562 | 5,3887 | 5,3706 | 215,00 |

**Preentrenamiento completo (1,05B tokens, A100-SXM4-40GB, 84,6k tok/s):**

| Modelo | Params totales | Params backbone | Tokens vistos | Val loss held-out | PPL held-out |
|---|---|---|---|---|---|
| QuatTucker-ZigZagGPT-12 (`best_1B.pt`) | 77,6M | 39,0M (2,2x menor) | 0,99B | 3,5849 | 36,05 |
| QuatTucker-ZigZagGPT-12 (`best.pt`) | 77,6M | 39,0M | 0,52B | 3,6933 | 40,18 |
| OpenAI `gpt2` (referencia) | 124,4M | 85,0M | ~10,0B | 3,3439 | 28,33 |

**Ablación a escala 33,5M (L4, FineWeb-Edu, 3.000 pasos):**

| Modelo | Params totales | Params backbone | Val loss final | PPL final |
|---|---|---|---|---|
| StandardGPT-8 | 33,5M | 14,3M | 5,2310 | 186,98 |
| CP-ZigZagGPT-8 | 33,6M | 14,3M | 5,1687 | 175,68 |
| Tucker-ZigZagGPT-8 | 33,6M | 14,3M | 5,1655 | 175,13 |
| QuatTucker-ZigZagGPT-8 | 26,5M | 7,2M (2,0x menor) | 5,1339 | 169,68 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (77,6M de parámetros), aproximadamente 0,3 GB en el checkpoint `best_1B.pt`.
- GPU recomendadas para entrenamiento: NVIDIA A100-SXM4-40GB (la usada por el autor) o L4 para ablaciones a menor escala.
- GPU para inferencia: cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para generación lenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el único método documentado es cargar el `.pt` con `torch.load` y la definición de modelo del repositorio de GitHub.
- Latencia y throughput: 84,6k tokens por segundo en entrenamiento sobre A100; no se publican cifras de latencia de inferencia.
- Contexto máximo de 512 tokens, lo que limita el uso en pipelines que requieran ventanas largas.

## Comparativa con modelos similares

| Modelo | Params totales | Params backbone | Contexto | PPL (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QuatTucker-ZigZagGPT-12 | 77,6M | 39,0M | 512 | 36,05 (0,99B tokens) | MIT | Hugging Face + GitHub |
| GPT-2 Small (`openai-community/gpt2`) | 124,4M | 85,0M | 1024 | 28,33 (~10B tokens) | MIT | Hugging Face |
| StandardGPT-12 (control del autor) | 123,6M | 85,0M | 512 | 230,67 (16,4M tokens) | no disponible | no disponible |
| QuatTucker-ZigZagGPT-8 (ablación) | 26,5M | 7,2M | no disponible | 169,68 (3.000 pasos) | MIT | no disponible |

La comparación con GPT-2 Small no es directamente equivalente en presupuesto de entrenamiento: el modelo del autor vio 0,99B tokens frente a los ~10B de GPT-2, lo que explica en parte la diferencia de perplejidad. La comparación controlada de la etapa 1 sí es homogénea y favorece al modelo cuaterniónico con 46M menos de parámetros en el backbone.

## Limitaciones y advertencias

- Contexto muy corto (512 tokens), insuficiente para tareas de documento largo, RAG o conversación multi-turno extensa.
- Entrenado únicamente en inglés; no hay soporte declarado para castellano ni otros idiomas.
- Entrenamiento limitado a 1,05B tokens, muy por debajo de los ~10B de GPT-2 Small, lo que se refleja en una perplejidad held-out superior (36,05 frente a 28,33).
- No se documentan fases de alineación (RLHF, DPO, SFT), por lo que cabe esperar respuestas sin formato instructivo y riesgo elevado de alucinación en uso conversacional.
- Sesgos heredados de FineWeb-Edu, un corpus filtrado por calidad educativa pero con sesgos de dominio y estilo no auditados en la model card.
- Pesos en formato `.pt` que requieren `torch.load` con la definición de modelo personalizada del repositorio; no hay safetensors, GGUF ni integración con frameworks estándar de despliegue.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación de seguridad, sesgos y robustez desaconseja su uso en producción sin auditoría previa.
- Modelo de investigación con 0 descargas y 1 like en el momento de la ficha; no hay evidencia de uso comunitario ni validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-12-78M
- Repositorio GitHub (código, paper, datos crudos): https://github.com/shu195/QuatTucker-ZigZagGPT
- Preprint (DOI Zenodo): https://doi.org/10.5281/zenodo.24424502
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Modelo de referencia GPT-2 Small: https://huggingface.co/openai-community/gpt2
