# Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8-RTN-Exp

## Resumen

Qwen3.5-9B-Tenstorrent-Tensix-BFP8-RTN-Exp es una exportación cuantizada del modelo multimodal Qwen/Qwen3.5-9B, publicada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint con los pesos preservados en el que las capas lineales del modelo de lenguaje se han cuantizado a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloques de 16 valores) mediante redondeo al más cercano (RTN), sin calibración.

El modelo base, Qwen3.5-9B, es un transformer multimodal (pipeline `image-text-to-text`) con aproximadamente 9.650 millones de parámetros totales, desarrollado por el equipo Qwen. La exportación de Xylolabs mantiene los tensores de atención, las capas Gated DeltaNet, las proyecciones MLP y el resto de componentes en formatos que TT-NN puede empaquetar directamente, con un peso medio de 10,21 bits por parámetro y 11,42 GB empaquetados para los pesos del modelo de lenguaje.

La relevancia de esta ficha radica en que documenta un caso de cuantización hardware-aware para NPUs de Tenstorrent, un ecosistema emergente en inferencia de bajo consumo. Es importante señalar que se trata de una exportación experimental (`Exp` en el nombre): el autor no ha ejecutado tt-transformers ni tt-forge con este checkpoint, y la verificación de respuestas en dispositivo no se ha realizado sobre estos pesos exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención y Gated DeltaNet (modelo base Qwen3.5-9B); cuantización BFP8 para Tensix |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso), bf16 para LM head, embeddings, normas y tensores `mtp`/`visual`; float32 para `A_log` y `norm` de `linear_attn`; media de 10,21 bits por peso |
| Idiomas soportados | no disponible (evaluación de referencia en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); empaquetado para TT-NN (`ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención clásica (q, k, v, o en 8 capas) con capas Gated DeltaNet (q, k, v, z, a, b y output en 24 capas), además de proyecciones MLP gate/up/down en 32 capas. Incluye componentes multimodales (`visual`) y un módulo `mtp` (multi-token prediction), ambos preservados en bf16 sin cuantizar. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica de esta exportación es la cuantización hardware-aware: las matrices lineales se cuantizan a la rejilla `bfloat8_b` con redondeo al más cercano, donde cada bloque de 16 valores comparte el exponente del mayor valor del bloque o uno inferior, eligiendo el que minimiza el error. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. No se empleó calibración. El autor reporta una comparación de referencia en host con KL media de 0,001096 frente a BF16 sobre 16.312 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), tanto en texto plano como con la plantilla de chat.

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo base Qwen3.5-9B.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), con los tensores `visual` preservados en bf16.
- Modo de pensamiento (`enable_thinking`) configurable en la plantilla de chat, según el ejemplo de quickstart del autor.
- Soporte de plantilla de chat con roles (`apply_chat_template`).
- Capacidades multilingües del modelo base: no documentadas en esta exportación; la evaluación de referencia cubre inglés y coreano.
- Tool calling y function calling: no documentado en la información disponible para esta exportación.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Módulo `mtp` (multi-token prediction) presente en los pesos, preservado en bf16.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para TT-NN y requiere unos 11,42 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers; es adecuado para entornos con NPUs Tensix donde se busca inferencia de un modelo de 9,65 B con menor huella que en bf16.
- Investigación en cuantización block floating point: sirve para estudiar el impacto de BFP8 con RTN sin calibración sobre modelos multimodales, comparando la KL de 0,001096 frente a BF16 reportada por el autor.
- Validación de pipelines de empaquetado TT-NN: el autor incluye `pack_tensix.py` y `verify_grid.py` para comprobar que ninguna matriz cambia de valor al empaquetarse, útil en CI de despliegues Tensix.
- Prototipado de asistentes conversacionales multimodales en hardware de bajo consumo: al conservar los tensores visuales en bf16, permite experimentar con entradas imagen-texto en NPUs Tensix.
- Evaluación comparativa de fidelidad de cuantización: la comparación en host frente a BF16 permite medir la degradación de distribución en inglés y coreano antes de comprometer hardware.
- Reproducción de experimentos de cuantización hardware-aware: el repositorio `tensix-bfp-gptq` documenta el proceso, lo que facilita replicar la receta sobre otros modelos Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una comparación de referencia en host: KL media de 0,001096 frente a BF16 sobre 16.312 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. No se ha ejecutado la verificación de respuestas en dispositivo sobre estos pesos exactos, no se reclama ningún veredicto de la regla 7 y no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,42 GB para los pesos del modelo de lenguaje, más espacio adicional para KV cache y buffers.
- Aceleradores objetivo: Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Compatibilidad verificada: ttnn 0.81.1 sobre ttsim (simulador Blackhole de Tenstorrent); tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Inferencia en host: el quickstart usa `transformers` con `dtype="bfloat16"` y `device_map="auto"`; para CPU se recomienda instalar Transformers sin los paquetes opcionales `flash-linear-attention` y `causal-conv1d` para usar los fallbacks de PyTorch.
- GPU consumer: no disponible; el autor no documenta requisitos de VRAM en GPU convencionales.
- Opciones de despliegue: TT-NN (empaquetado nativo), Transformers en host; vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no reportados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8-RTN-Exp | 9,65 B | no disponible | BFP8 (8,5 bits/peso) | Apache 2.0 | Hugging Face, 23 descargas |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible | bf16 (original) | Apache 2.0 | Hugging Face |
| Alternativas Tensix de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta exportación y el modelo base en benchmarks estándar; la única métrica publicada es la KL media de 0,001096 frente a BF16 en la comparación de referencia en host.

## Limitaciones y advertencias

- Exportación experimental: el sufijo `Exp` y la ausencia de ejecución con tt-transformers y tt-forge indican que no es un artefacto validado de extremo a extremo en producción.
- Verificación incompleta: la comprobación de respuestas en dispositivo no se ha ejecutado sobre estos pesos exactos; las comprobaciones de empaquetado no garantizan la precisión completa de la inferencia.
- Solo se cuantizó y evaluó el modelo de lenguaje; los tensores `visual` y `mtp` permanecen en bf16 sin evaluación documentada.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en esta exportación.
- Sesgos: no documentados en la información disponible; dependen del modelo base Qwen3.5-9B.
- Idiomas: la evaluación de referencia solo cubre inglés y coreano; el resto de idiomas no está validado.
- Contexto: la longitud de contexto no se especifica en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el artefacto "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Dependencia de hardware: el checkpoint está pensado para Tensix; su uso en GPU convencionales no está documentado ni validado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8-RTN-Exp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP8-RTN-Exp/blob/main/LICENSE
