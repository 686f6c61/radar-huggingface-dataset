# Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4-Experts

## Resumen

Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4-Experts es una exportación cuantizada del decodificador de texto del modelo Ornith 1.5 35B A3B, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila tt-metal y TT-NN. No se trata de un modelo nuevo, sino de una conversión de pesos orientada a hardware: los expertos enrutados del MoE se almacenan en BFP4 con GPTQ y el resto de proyecciones declaradas en BFP8, reduciendo el peso del decodificador a unos 21,22 GB en memoria de dispositivo.

El modelo base es un transformer MoE de tipo Qwen3.5 (etiqueta `qwen3_5_moe_text`) con 34.660.610.688 parámetros totales y aproximadamente 3B activos por token, de ahí el sufijo A3B. Esta exportación conserva las 40 capas del decodificador de texto, incluyendo embedding de entrada y LM head, pero omite los pesos de visión y de MTP, y desactiva el drafting especulativo.

Su relevancia es acotada pero específica: demuestra un flujo de cuantización block-floating-point (BFP4/BFP8) verificado sobre la simulación Blackhole de Tenstorrent, con métricas de divergencia KL frente al BF16 original y frente a una cuantización Q4_K_M de llama.cpp. Está pensado para desarrolladores que quieran desplegar el modelo en hardware Tensix o estudiar técnicas de cuantización BFP para MoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5, `qwen3_5_moe_text`), 40 capas de decodificador de texto |
| Parámetros totales | 34.660.610.688 (34,66 B) |
| Parámetros activos | ~3 B (sufijo A3B del modelo base) |
| Longitud de contexto | 4.608 tokens (límite de prompt más generación impuesto por la configuración de esta exportación) |
| Tipos de cuantización | BFP4 GPTQ con búsqueda de exponente de bloque (4,5 bits/peso) en expertos enrutados; BFP8 RTN (8,5 bits/peso) en atención, expertos compartidos y head; BF16 en embedding y tensores no cuantizados |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (contenedores BF16 con valores de rejilla BFP; empaquetado nativo TT-NN para Tensix) |

## Arquitectura y entrenamiento

El modelo base Ornith 1.5 35B A3B es un transformer con mezcla de expertos: 80 tensores de expertos enrutados que cubren 20.480 matrices de experto, más 311 matrices de atención, expertos compartidos y head. La exportación de Xylolabs mantiene la estructura de 40 capas del decodificador de texto con embedding de entrada y LM head incluidos; los pesos de visión y de MTP (multi-token prediction) se excluyen y el drafting queda deshabilitado.

La innovación técnica de esta ficha no está en el entrenamiento (no se documentan en la información disponible ni el número de tokens, ni la composición del dataset, ni si hubo RLHF o DPO), sino en el pipeline de cuantización: los expertos enrutados se cuantizan a BFP4 con GPTQ y búsqueda de exponente de bloque, mientras que el resto de proyecciones declaradas usan BFP8 con redondeo al más cercano. Los 391 tensores de proyección declarados (20.791 matrices entre expertos y densas) superan las comprobaciones de rejilla y de empaquetado nativo TT-NN, incluido el empaquetado como BFP8, y el ejemplo de referencia pasa en el simulador Blackhole con TT-NN 0.81.1.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat y modo thinking opcional (`enable_thinking`).
- Razonamiento multi-paso: la evaluación incluye un conjunto de 7 preguntas en modo thinking, resueltas correctamente en los tres perfiles comparados.
- Mezcla de expertos con enrutamiento por token, lo que permite activar ~3 B de parámetros por token sobre un total de 34,66 B.
- Cuantización block-floating-point verificada tensor a tensor contra la fuente indexada en el dtype cargado.
- Ejecución sobre hardware Tenstorrent Tensix mediante TT-NN, con empaquetado de matrices de experto en `bfloat4_b` y `bfloat8_b`.
- No incluye capacidades de visión en esta exportación (pesos omitidos), ni drafting especulativo (deshabilitado).
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El paquete está preparado para cargarse en Tensix con TT-NN 0.81.1, ocupando unos 21,22 GB de DRAM para los pesos del decodificador más espacio para KV cache y buffers.
- Investigación en cuantización BFP: sirve como referencia reproducible para comparar BFP4 GPTQ con exponente de bloque frente a BFP8 RTN y frente a Q4_K_M, usando las métricas de KL publicadas (0,058006 frente a 0,079161).
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar todas las matrices declaradas y hacer un round trip por DRAM con `--device`.
- Generación de texto conversacional corto: con un tope de 4.608 tokens entre prompt y generación, encaja en asistentes de respuesta breve en inglés o coreano.
- Referencia de host en PyTorch: la quickstart con Transformers 5.23.0 y `dtype="bfloat16"` permite usar el modelo como referencia de comportamiento antes de portar a Tensix.
- Evaluación de fidelidad de cuantización: útil para equipos que necesiten medir la divergencia KL de una cuantización propia contra este perfil y contra el suelo BF16 de llama.cpp (0,008877).

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas contadas |
|---|---:|---:|---:|---:|
| Referencia BF16 original | 0 | 31 | 7 | — |
| Esta exportación de texto principal | 0,058006 | 31 | 7 | 0 |
| Q4_K_M emparejado | 0,079161 | 31 | 7 | 0 |

La KL de host se calcula sobre 8.188 posiciones de textos crudos en inglés y coreano, en dos fragmentos de 2.048 tokens. La exportación alcanza 0,732760 veces la KL de Q4_K_M, dentro del límite de 1,5 veces de la regla 7, con cero pérdidas contadas. El suelo BF16 de llama.cpp es 0,008877. No se publican datos de velocidad ni de throughput en la información disponible, ni resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria de dispositivo: ~21,22 GB solo para los pesos del decodificador de texto, más KV cache y buffers adicionales.
- Hardware objetivo: aceleradores Tenstorrent Tensix; el ejemplo de referencia se valida en el simulador Blackhole con TT-NN 0.81.1.
- En host: los ficheros contienen valores de rejilla en BF16, por lo que la referencia en PyTorch consume más memoria que los pesos empaquetados para Tensix; el repo ocupa 69,3 GB.
- GPU consumer: no se documenta compatibilidad ni requisitos para GPU NVIDIA o AMD en esta exportación.
- Despliegue: TT-NN/tt-metal para Tensix; Transformers 5.23.0 con PyTorch para la referencia en host. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Ornith 1.5 35B A3B, export Tensix BFP4) | 34,66 B totales, ~3 B activos | 4.608 tokens | BFP4 GPTQ + BFP8 RTN | MIT | Hugging Face, 6 descargas |
| Ornith 1.5 35B A3B (base) | 34,66 B totales, ~3 B activos | no disponible | BF16 | MIT | Hugging Face, `ornith-ai/Ornith-1.5-35B-A3B` |
| Q4_K_M emparejado (llama.cpp) | mismo modelo base | no disponible | Q4_K_M | MIT (heredada del base) | referencia de comparación en la model card |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Esta exportación no es un modelo completo: omite visión y MTP, y desactiva el drafting especulativo, por lo que no reproduce todas las capacidades del base.
- El contexto está limitado a 4.608 tokens entre prompt y generación, muy por debajo de lo habitual en modelos de este tamaño.
- Solo se declaran inglés y coreano; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- No se publican datos de sesgos, alucinación ni evaluaciones de seguridad en la información disponible.
- La licencia MIT se hereda del modelo base según la model card fijada; conviene verificar el texto completo de la licencia antes de uso comercial.
- El formato está pensado para Tensix: los tensores guardan valores de rejilla en BF16, así que la carga en host consume más memoria que el empaquetado final.
- El número de descargas (6) y de likes (0) indica una adopción muy temprana; no hay evidencia de uso en producción.
- Las métricas de evaluación son de divergencia KL y aciertos en un conjunto reducido (33 + 7 preguntas), no benchmarks estándar de capacidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4-Experts)
- [Modelo base ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Repositorio tensix-bfp-gptq](https://github.com/XylolabsInc/tensix-bfp-gptq)
- [Documentación de Tenstorrent](https://docs.tenstorrent.com)
- [Licencia MIT del repo](https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4-Experts/blob/main/LICENSE)
