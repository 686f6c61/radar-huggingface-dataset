# Xylolabs/AREX-2-Tensix-BFP8

## Resumen

AREX-2-Tensix-BFP8 es una cuantización del modelo BAAI/AREX-2, un fine-tune orientado a agentes desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) sobre Qwen/Qwen3.8-27B. La versión publicada por Xylolabs adapta los pesos para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), aplicando GPTQ sobre la rejilla de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) a las capas lineales del modelo de lenguaje. El resultado es un checkpoint de 27.356.728.560 parámetros totales con un peso medio de 9,21 bits por parámetro y un tamaño empaquetado de 30,96 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización consciente del hardware: en lugar de generar un formato genérico (GGUF, AWQ), el autor produce tensores bf16 cuyos valores ya caen exactamente sobre la rejilla BFP8 que TT-NN utiliza internamente, de modo que el empaquetado en la NPU no requiere recuantización. Por otro, expone las limitaciones actuales del ecosistema: el modelo se validó únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en silicio real, y el demo de referencia de tt-metal empaqueta por defecto en `bfloat4_b`, lo que obliga a escribir una política de precisión personalizada para preservar el formato de este checkpoint.

El modelo conserva la modalidad image-text-to-text del pipeline declarado y mantiene intacto el codificador visual en bf16, aunque el autor advierte explícitamente que solo el modelo de lenguaje fue cuantizado y evaluado. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa (16 capas) + Gated DeltaNet (48 capas), con MLP en 64 capas; arquitectura Qwen3.8-27B |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones lineales; bf16 en embedding, LM head, normas y codificador visual; media de 9,21 bits por peso |
| Idiomas soportados | no disponible (calibración GPTQ sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP8), índice `model.safetensors.index.json`, mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.8-27B, un transformer híbrido que combina 16 capas de atención completa con 48 capas de Gated DeltaNet (atención lineal con estado recurrente) y 64 capas de MLP. Sobre esa base, BAAI/AREX-2 es un fine-tune orientado a comportamiento agéntico. La cuantización de Xylolabs afecta a las proyecciones q, k, v y o de las capas de atención, a las proyecciones q, k, v, z, a, b y output de las capas Gated DeltaNet, y a las proyecciones gate, up y down del MLP, todas ellas en `bfloat8_b`. El resto de tensores —embeddings, LM head, normas y el módulo `visual`— permanece en bf16 sin modificar.

El proceso de cuantización emplea GPTQ restringido a la rejilla BFP8, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El checkpoint resultante ocupa 30,96 GB empaquetado frente a los 54,7 GB del repositorio completo. La validación se llevó a cabo con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, comprobando que el empaquetado de cada matriz no altera ningún valor; no se reportan pruebas sobre hardware físico.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento image-text-to-text según el pipeline declarado, con codificador visual en bf16.
- Comportamiento agéntico heredado del fine-tune de BAAI sobre el modelo base.
- Razonamiento multi-paso y seguimiento de instrucciones, derivados de Qwen3.8-27B.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de pesos en `bfloat8_b`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint está pensado para ejecutarse en NPU Wormhole o Blackhole a través de TT-NN, aprovechando que los pesos ya están sobre la rejilla BFP8 y evitando la recuantización en el empaquetado.
- Investigación en cuantización hardware-aware: sirve como referencia para estudiar cómo se comporta GPTQ cuando la rejilla de destino viene impuesta por el formato nativo del acelerador (`bfloat8_b`) en lugar de elegirse libremente.
- Evaluación comparativa de precisión: al conservar bf16 en LM head, embeddings y normas, permite aislar el efecto de la cuantización BFP8 únicamente en las proyecciones lineales del decoder.
- Prototipado de asistentes conversacionales en clústeres QuietBox 2: el demo `qwen38_27b_qb2` de tt-metal ejecuta el modelo en paralelismo tensorial sobre cuatro chips Blackhole, un escenario adecuado para validar pipelines agénticos antes de pasar a producción.
- Análisis de sensibilidad por capa: el archivo `quant4.json` documenta el formato de cada proyección, lo que facilita experimentos selectivos de precisión (por ejemplo, mantener ciertas capas en bf16 y otras en BFP8).
- Integración en flujos de verificación de checkpoints: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que ningún valor se altera al pasar por DRAM del dispositivo, útil en pipelines de control de calidad de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que solo el modelo de lenguaje fue cuantizado y evaluado, sin aportar métricas de calidad (perplejidad, MMLU, HumanEval u otras) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint empaquetado ocupa 30,96 GB y el repositorio completo 54,7 GB, por lo que en GPU se requiere al menos una tarjeta de 40-48 GB en bf16, o bien cuantización adicional para GPUs de consumo.
- GPU recomendadas: A100 80 GB, H100, o GPUs de 48 GB como RTX A6000; no se han publicado pruebas específicas en GPU.
- NPU objetivo: Tenstorrent Wormhole y Blackhole. El demo de tt-metal `qwen38_27b_qb2` requiere cuatro chips Blackhole (QuietBox 2) en paralelismo tensorial y rechaza otro hardware.
- Cabe en GPU de consumo: no disponible; con 27,3 mil millones de parámetros y pesos de 9,21 bits, el modelo no encaja en GPUs de 24 GB sin cuantización adicional.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (device_map auto), TT-NN sobre Tensix, demo `qwen38_27b_qb2` de tt-metal v0.81.1 con política de precisión personalizada, y `tt-forge` (tt-xla), aunque este último no fue probado con este checkpoint. `tt-transformers` no soporta esta arquitectura.
- Latencia y throughput: no disponibles. La validación se realizó en simulador (`ttsim`), no en hardware real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/AREX-2-Tensix-BFP8 | 27,36 B | no disponible | safetensors bf16 sobre rejilla BFP8 | Apache-2.0 | Cuantizado para NPU Tensix; validado solo en simulador |
| BAAI/AREX-2 | no disponible | no disponible | safetensors bf16 | Apache-2.0 (según modelo derivado) | Modelo base sin cuantizar; fine-tune agéntico de Qwen3.8-27B |
| Qwen/Qwen3.8-27B | 27 B (aproximado) | no disponible | safetensors | no disponible | Modelo original de Qwen; base de la cadena de fine-tune |
| tt-metal `qwen38_27b_qb2` (baseline bfloat4_b) | 27 B | no disponible | BFP4 empaquetado en tt-metal | no disponible | Empaqueta en `bfloat4_b`; recuantiza este checkpoint y no preserva su precisión |

## Limitaciones y advertencias

- Validación incompleta: el checkpoint se probó con ttnn 0.81.1 sobre el simulador `ttsim` de Blackhole, no sobre silicio. El autor reconoce que el LM head y una ejecución completa requieren los cuatro chips y no fueron testeados.
- Incompatibilidad con tt-transformers: esa librería no soporta la arquitectura del modelo.
- El demo de tt-metal `qwen38_27b_qb2` empaqueta por defecto en `bfloat4_b`, lo que recuantiza los pesos BFP8; es necesario escribir una política `precision_bfp8.json` y exportar `QWEN_PRECISION_CONFIG` para preservar el formato.
- El demo `blackhole/qwen36` de tt-metal siempre empaqueta gate y up del MLP en `bfloat4_b`, por lo que no ejecuta este checkpoint a su precisión declarada.
- El LM head en bf16 no es exacto en el demo de tt-metal, que lo fuerza a `bfloat8_b`.
- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual permanece en bf16 y no se aportan métricas de su comportamiento.
- No se publican datos de benchmarks, perplejidad ni evaluación de degradación por cuantización.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son heredados del modelo base BAAI/AREX-2 y de Qwen3.8-27B.
- Idiomas soportados no declarados; la calibración incluyó Wikipedia en coreano, lo que sugiere cobertura multilingüe parcial pero sin garantías formales.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del modelo original de Qwen antes de desplegar en producción.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tensix-BFP8
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo `qwen38_27b_qb2` de tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/AREX-2-Tensix-BFP8/blob/main/LICENSE
- Paper referenciado en los tags (`arxiv:2609.38288`): no disponible como URL verificable en la información proporcionada.
