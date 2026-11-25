# tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2

## Resumen

`qwen-2.5-0.5b-griffin-ssd-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B original de Alibaba cuyo bloque de atención de decoder ha sido sustituido quirúrgicamente por el módulo `GriffinSSDBlock`, una atención híbrida que combina ventana local con atención lineal SSD (state space duality). El objetivo es explorar alternativas subcuadráticas a la atención estándar manteniendo el resto de la arquitectura Qwen2.

El modelo conserva los 510.085.240 parámetros del Qwen2.5-0.5B base (hidden_size 896, 14 cabezas de consulta, 2 cabezas KV, head_dim 64, 24 capas) y aplica un patrón híbrido 3:1: 18 de las 24 capas usan `griffin_ssd` y 6 capas conservan atención cuadrática completa como anclas en los índices 3, 7, 11, 15, 19 y 23. Tras la cirugía, el modelo se recuperó mediante destilación de conocimiento en dos etapas sobre WikiText-2, pasando de una perplejidad de 379.143,46 a 171,65.

Es relevante como pieza de investigación sobre eficiencia de atención y como ejemplo reproducible de sustitución modular de operadores de atención en modelos preentrenados. No está pensado como modelo de producción: el entrenamiento se limita a WikiText-2 en inglés y la perplejidad final es muy superior a la del Qwen2.5-0.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido con 18/24 capas de atención GriffinSSD (ventana local + SSD lineal) y 6 capas de atención cuadrática completa (patrón `hybrid_3_1`) |
| Parametros totales | 510.085.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 972,96 MB; `attention_weights.safetensors` 114,75 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` y aplica una cirugía de atención mediante `QwenAttentionAdapter`, que mapea las proyecciones de `Qwen2Attention` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y expande las cabezas KV 7x donde es necesario, forzando además el contrato Single-`o_proj`. El bloque `GriffinSSDBlock` combina una ventana de atención local con atención lineal SSD y declara soporte causal, bidireccional y cross-attention; no soporta GQA nativo ni RoPE (marcado como N/A). Se preservan 6 capas cuadráticas completas como anclas en los índices [3, 7, 11, 15, 19, 23].

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado) ejecutó 77 pasos en 54,6 s con `lm_head` desactivado y pérdida MSE + coseno por capa con peso 0,25. La etapa 2 (destilación de representación multicapa) ejecutó 200 pasos en 125,3 s con peso coseno 0,50. En total, 277 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 20.004 MB de VRAM en FP16 autocast con parámetros maestros en FP32. La perplejidad causal pasó de 379.143,46 (post-cirugía, zero-shot) a 171,65 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Razonamiento y modelado de lenguaje básico heredado del Qwen2.5-0.5B base, aunque degradado por la sustitución de atención y el entrenamiento limitado a WikiText-2.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (según la model card del bloque `GriffinSSDBlock`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como referencia reproducible para comparar `griffin_ssd` frente a atención cuadrática en un mismo backbone Qwen2.5-0.5B, usando la perplejidad en WikiText-2 como métrica de control.
- Experimentos de cirugía de atención: el checkpoint y el código de NeuralOps permiten replicar la sustitución modular de bloques de atención en modelos preentrenados y medir la recuperación vía destilación.
- Docencia y divulgación: ejemplo didáctico de destilación de conocimiento en dos etapas con backbone congelado y pérdidas MSE + coseno por capa.
- Pruebas de pipelines de carga: útil para validar la API `neuralops.hub.load_surgeried_model` y flujos de carga de pesos safetensors separados (`model.safetensors` + `attention_weights.safetensors`).
- Benchmarking de eficiencia: permite medir latencia y memoria de un bloque híbrido local + SSD frente a atención completa en secuencias de 512 tokens.
- Prototipado de generación de texto en inglés de baja exigencia: aceptable solo en entornos de experimentación donde la calidad no sea crítica, dado el alto PPL.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | wikitext-2-raw-v1 (validation) | Perplejidad | 171,65 |

Telemetría de entrenamiento declarada:

| Etapa | Pasos | Tiempo | Perplejidad |
|---|---:|---:|---:|
| Stage 0 (post-cirugía, zero-shot) | 0 | 0 s | 379.143,46 |
| Stage 1 (alineamiento, backbone congelado) | 77 | 54,6 s | no disponible |
| Stage 2 (destilación multicapa) | 200 | 125,3 s | no disponible |
| Final | 277 | 180,3 s | 171,65 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1-1,5 GB para los pesos (510 M de parámetros) más overhead de activaciones y KV cache; el entrenamiento reportó un pico de 20.004 MB con FP16 autocast y maestros FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; el entrenamiento requirió del orden de 20 GB (A100 40 GB, H100, RTX 3090/4090 con cuidado).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: la librería declarada es `neuralops` (carga vía `load_surgeried_model`); también es posible cargar con `transformers` aplicando primero `apply_qwen_attention_surgery` con `attn_key="griffin_ssd"` y `pattern="hybrid_3_1"`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no se documenta conversión a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2` | 510 M | no disponible (entrenado a 512) | Híbrida 3:1 GriffinSSD + cuadrática | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 494 M aprox. | 32.768 tokens (según Qwen2.5) | Cuadrática completa con GQA y RoPE | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1.500 M aprox. | 32.768 tokens (según Qwen2.5) | Cuadrática completa con GQA y RoPE | Apache 2.0 | Hugging Face |

La comparación directa de rendimiento con el base no está disponible en la información proporcionada; la perplejidad de 171,65 en WikiText-2 es sustancialmente peor que la esperable en el Qwen2.5-0.5B original, lo que refleja el carácter experimental del checkpoint.

## Limitaciones y advertencias

- Perplejidad muy alta (171,65) en WikiText-2 frente a un modelo base bien entrenado; la calidad de generación es baja.
- Entrenamiento limitado a WikiText-2 en inglés; no hay evidencia de generalización a otros dominios ni idiomas.
- El módulo `griffin_ssd` no soporta GQA nativo ni RoPE, lo que puede afectar a la extrapolación de contexto.
- Solo se declara inglés; el castellano y otros idiomas no están soportados.
- Riesgo elevado de alucinación y salidas incoherentes por la combinación de modelo pequeño, cirugía de atención y destilación breve.
- La métrica declarada no está verificada (`verified: false`); conviene reproducirla antes de usarla en comparaciones.
- Licencia MIT, permisiva para uso comercial, pero la calidad técnica hace desaconsejable su uso en producción.
- Requiere la librería `neuralops` o aplicar manualmente la cirugía de atención; no es un checkpoint cargable directamente con `transformers` sin pasos adicionales.
- No hay datos de benchmarks de razonamiento, código o matemáticas; no debe asumirse ninguna capacidad más allá de la generación de texto básica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
