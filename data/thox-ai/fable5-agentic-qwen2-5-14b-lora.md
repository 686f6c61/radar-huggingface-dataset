# Thox-ai/fable5-agentic-qwen2.5-14b-lora

## Resumen

fable5-agentic-qwen2.5-14b-lora es un adaptador LoRA de tipo PEFT publicado por Thox-ai sobre el modelo base Qwen/Qwen2.5-14B-Instruct. El adaptador ha sido entrenado por THOX mediante SFT de destilación orientada a uso agéntico (agentic distillation SFT) y se distribuye como un repositorio público sin gating en HuggingFace. Se trata, por tanto, de un ajuste fino ligero (rank 16, alpha 32) que no modifica la arquitectura subyacente del transformer de Qwen2.5, sino que añade pesos de adaptación cargables con la librería `peft`.

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only de 14 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32 768 tokens (ampliable hasta 131 072 mediante configuración de RoPE) y capacidades multilingües. El adaptador hereda todas esas características arquitectónicas y añade un ajuste específico para tareas agénticas, aunque el autor no documenta el corpus de entrenamiento ni publica resultados de evaluación.

La relevancia de esta ficha es doble: por un lado, ilustra el patrón habitual de publicación de adaptadores LoRA sobre modelos abiertos de gran tamaño; por otro, el propio autor declara explícitamente que el adaptador está "no validado", que no se publica ningún resultado GATE49 y que no se emite ninguna afirmación de calidad. Es, por tanto, un artefacto de investigación y experimentación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-14B-Instruct |
| Parametros totales | 14B (modelo base); adaptador de ~275 MB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base (hasta 131 072 con RoPE scaling, segun Qwen2.5) |
| Tipos de cuantizacion | El adaptador se distribuye en fp32/fp16; el modelo base admite cuantizacion 4-bit (bitsandbytes), GPTQ, AWQ y GGUF segun el ecosistema Qwen2.5 |
| Idiomas soportados | Ingles (declarado en la model card); el base Qwen2.5 soporta multiples idiomas, pero el adaptador solo declara `en` |
| Licencia | Qwen license terms (`license: other`, `license_name: qwen`) |
| Formato de pesos | `adapter_model.bin` (PyTorch), `checkpoint-161/adapter_model.safetensors`, `optimizer.pt` |

## Arquitectura y entrenamiento

El adaptador no introduce cambios arquitectónicos: se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings RoPE. El adaptador LoRA congela los pesos del base e inserta matrices de bajo rango (r=16, alpha=32) en las capas de atención y proyección, lo que supone un coste adicional de almacenamiento de aproximadamente 275 MB.

El entrenamiento consiste en un SFT de destilación agéntica (agentic distillation SFT) realizado por THOX. El repositorio incluye los checkpoints `checkpoint-161` y `checkpoint-321`, junto con el estado del optimizador, lo que sugiere un entrenamiento corto (161 pasos hasta el primer checkpoint). No se documenta el corpus, el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o filtrado de datos. El autor declara explícitamente que no se publica ningún resultado de evaluación GATE49 ni se emite afirmación de calidad alguna.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen2.5-14B-Instruct.
- Razonamiento multi-paso y uso agéntico (el adaptador está entrenado específicamente para flujos agénticos vía destilación).
- Soporte de tool calling / function calling heredado del modelo base Qwen2.5.
- Capacidades multilingües del base Qwen2.5 (aunque el adaptador solo declara inglés).
- Generación de código y matemáticas heredada del base.
- Modo de razonamiento extendido no confirmado para este adaptador (el base Qwen2.5-Instruct no incorpora modo "thinking" nativo como Qwen3).
- Capacidades de visión y audio: no disponibles (el base es solo texto).

## Casos de uso

- Experimentación en investigación sobre adaptadores agénticos: el adaptador sirve como punto de partida para estudiar cómo el SFT de destilación modifica el comportamiento agéntico de un base instruct, comparando con el modelo sin adaptar.
- Prototipado de pipelines de agentes en entornos controlados: se puede cargar con `peft` en dos líneas y probar flujos multi-paso con tool calling, siempre en sandbox y sin exposición a usuarios finales.
- Evaluación comparativa de técnicas LoRA: útil para medir el impacto de un adaptador de rango 16 sobre un base de 14B en tareas de razonamiento y uso de herramientas.
- Generación de código asistida en entornos de desarrollo internos: el base Qwen2.5-14B-Instruct tiene buen rendimiento en código, y el adaptador puede probarse en pipelines de CI/CD internos para autocompletado o generación de tests.
- Fine-tuning posterior (continued pretraining o DPO): el adaptador puede servir como inicialización para experimentos adicionales de alineamiento sobre el mismo base.
- Docencia y formación: útil para demostrar el flujo completo de publicación de un adaptador PEFT, incluyendo checkpoints y estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no publica ningún resultado GATE49 y que no emite afirmación de calidad alguna sobre el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia del base en fp16: ~28 GB (14B parámetros × 2 bytes) más overhead de activaciones y KV cache.
- VRAM estimada en 4-bit (bitsandbytes): ~8-10 GB, suficiente para GPUs consumer de gama alta.
- VRAM estimada en 8-bit: ~16 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para fp16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con cuidado de la KV cache; RTX 4080/4070 Ti Super (16 GB) en 4-bit.
- Cabe en consumer GPU: sí, en cuantización 4-bit en GPUs de 12-16 GB; en fp16 requiere 24 GB o más.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles para este adaptador concreto; dependen del base y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| fable5-agentic-qwen2.5-14b-lora | 14B base + LoRA r16 | 32 768 (base) | Qwen terms | PEFT adapter | No validado, sin benchmarks |
| Qwen/Qwen2.5-14B-Instruct | 14B | 32 768 (hasta 131 072) | Qwen terms | safetensors, GGUF | Validado por Qwen, benchmarks publicados |
| Mistral-Nemo-Instruct-2407 | 12B | 128 000 | Apache 2.0 | safetensors, GGUF | Benchmarks publicados |
| Llama-3.1-8B-Instruct | 8B | 128 000 | Llama 3.1 Community | safetensors, GGUF | Benchmarks publicados |

## Limitaciones y advertencias

- El autor declara explícitamente que el adaptador está "no validado" y que no se emite ninguna afirmación de calidad.
- No está alineado en seguridad para exposición pública directa (declaración del autor).
- El corpus de entrenamiento no está documentado, por lo que se desconocen sesgos introducidos por el SFT.
- Riesgo de alucinación heredado del base Qwen2.5-14B-Instruct, sin mitigaciones adicionales documentadas.
- Solo declara inglés como idioma, aunque el base sea multilingüe; el comportamiento en otros idiomas no está validado.
- Licencia Qwen terms: es necesario verificar las condiciones antes de cualquier uso comercial o redistribución; el adaptador se distribuye bajo los mismos términos que el base.
- No apto para producción, producto ni uso con usuarios finales según la model card.
- El repositorio incluye checkpoints de entrenamiento y estado del optimizador, lo que puede exponer información sobre el proceso de entrenamiento; conviene revisar antes de reutilizar.
- Fecha de creación (2026-07-09) y publicación (2026-11-01) según metadatos; verificar vigencia.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/fable5-agentic-qwen2.5-14b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Documentación Qwen2.5: https://qwen.readthedocs.io/
- Repositorio Qwen: https://github.com/QwenLM/Qwen2.5
