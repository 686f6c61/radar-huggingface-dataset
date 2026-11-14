# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8` es una exportación cuantizada del modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized`, preparada por Xylolabs para su ejecución sobre aceleradores NPU Tenstorrent de arquitectura Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura multimodal any-to-any de Gemma 4 (texto, imagen y audio) y cuantiza las capas lineales de atención y MLP del modelo de lenguaje al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que TT-NN puede empaquetar las matrices sin alterar sus valores.

El resultado es un checkpoint de aproximadamente 5.506.950.723 parámetros totales (5,5 mil millones) almacenado en safetensors, con un tamaño de repositorio de 11,0 GB y un requisito de memoria de dispositivo de unos 7,54 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers. La media efectiva es de 13,03 bits por peso, ya que embeddings, LM head, normas, torres de visión y audio permanecen en bf16 mientras que las proyecciones cuantizadas usan 8,5 bits por peso.

Su relevancia radica en que demuestra un pipeline de cuantización GPTQ específicamente adaptado a la rejilla BFP8 del hardware Tenstorrent, con verificación de que ningún valor cambia tras el empaquetado, y en que ofrece una alternativa de menor huella de memoria (frente a la variante BFP4-MLP) para desplegar Gemma 4 en NPUs Tensix. Está publicado bajo licencia Apache-2.0 y es compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4) con torres de visión y audio; capas lineales de atención y MLP cuantizadas a BFP8 |
| Parametros totales | 5.506.950.723 (5,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en proyecciones de atención y MLP); bf16 en embeddings, LM head, normas, torres de visión y audio; media de 13,03 bits por peso; existe variante BFP4-MLP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN (`ttnn.bfloat8_b`, layout TILE, DRAM) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 en su variante E2B instruida, con un pipeline any-to-any que integra procesamiento de texto, imagen y audio (`audio_tower`, `embed_audio`, `embed_vision`, `vision_tower`). Esta exportación solo cuantiza y evalúa el modelo de lenguaje: las 35 capas de atención (proyecciones q, o y también k, v en 15 capas) y las 35 capas de MLP (gate, up, down) se convierten a BFP8, mientras que el LM head (atado al embedding), el embedding, las normas y todos los demás tensores permanecen en bf16, igual que el modelo base. Las torres de audio y visión no se tocan.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, conservando el exponente compartido de cada bloque tal como lo establece el empaquetador, y se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin modificar sus valores; el repositorio incluye `quant4.json`, que lista el formato de cada proyección, así como scripts `pack_tensix.py` y `verify_grid.py` para verificar el empaquetado y la rejilla. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instruida (variante `it`), con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento any-to-any: entrada y salida de texto, imagen y audio, gracias a las torres de visión y audio conservadas en bf16.
- Razonamiento y respuesta a preguntas generales (el modelo card muestra un ejemplo de pregunta-respuesta sobre la capital de Francia).
- Ejecución en hardware Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN, con empaquetado exacto de las matrices cuantizadas.
- Compatibilidad con la librería transformers para inferencia en GPU/CPU con `AutoModelForCausalLM` en bfloat16.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el checkpoint está empaquetado para TT-NN y requiere unos 7,54 GB de memoria de dispositivo para los pesos del modelo de lenguaje, lo que permite ejecutar Gemma 4 E2B en Wormhole o Blackhole con una huella reducida frente a bf16.
- Inferencia multimodal en el borde: al conservar las torres de visión y audio en bf16, el modelo puede procesar entradas de imagen y audio junto a texto en un único pipeline any-to-any, útil en aplicaciones de asistencia multimodal.
- Prototipado e investigación en cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que ningún valor cambia tras el empaquetado BFP8, lo que sirve para validar pipelines de cuantización GPTQ sobre rejillas block floating point.
- Asistentes conversacionales multi-turno: la plantilla de chat y la variante instruida permiten gestionar diálogos con historial; la longitud de contexto no está documentada, por lo que debe verificarse antes de usarla en contextos largos.
- Evaluación comparativa de precisión: el modelo card incluye una tabla de evaluación con KL medio frente a BF16, Top-1 y respuestas correctas, lo que permite comparar la variante BFP8 con BFP4-MLP y con el modelo sin cuantizar en tareas de calidad de generación.
- Integración en transformers para pruebas fuera del hardware Tensix: el quickstart con `AutoModelForCausalLM.from_pretrained(repo, dtype="bfloat16", device_map="auto")` permite ejecutar el checkpoint en GPU convencionales para validación funcional antes de desplegarlo en NPU.
- Uso en entornos con memoria limitada: la existencia de la variante BFP4-MLP, recomendada por el autor para dispositivos con menos memoria, permite elegir el equilibrio entre huella y precisión.

## Benchmarks y rendimiento

El modelo card incluye una tabla de evaluación con las columnas "Bits a weight", "Size (GB)", "Mean KL to BF16", "Top-1 (%)", "Answers right" y "Lost", pero los valores numéricos de las filas no están presentes en la información proporcionada. Por tanto, no se presentan cifras concretas.

| Metrica | Resultado |
|---|---|
| Bits por peso | 13,03 (media); 8,5 en proyecciones cuantizadas |
| Tamano empaquetado | 7,54 GB (pesos del modelo de lenguaje) |
| KL medio frente a BF16 | no disponible |
| Top-1 (%) | no disponible |
| Respuestas correctas | no disponible |
| Perdidas | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 7,54 GB para los pesos del modelo de lenguaje, más espacio adicional para caché KV y buffers; el repositorio ocupa 11,0 GB en disco.
- GPU recomendadas: no se especifican GPU concretas en la información; el modelo está orientado a NPUs Tenstorrent Tensix (Wormhole y Blackhole).
- NPUs compatibles: Tenstorrent Wormhole y Blackhole; el demo de tt-metal para Gemma 4 (v0.81.1) ejecuta E2B, E4B y 12B en una única Blackhole P150.
- Cabe en GPU consumer: no disponible como dato explícito; el quickstart con transformers permite cargarlo en bfloat16 con `device_map="auto"`, pero no se documenta el requisito de VRAM en GPU.
- Opciones de despliegue: TT-NN (`ttnn`, probado con ttnn 0.81.1 sobre el simulador ttsim), tt-metal (demo Gemma 4 v0.81.1), tt-forge (tt-xla; no ejecutado aún con Gemma 4), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B it, Tensix BFP8) | 5,5 mil millones | no disponible | BFP8 (8,5 bits/peso en atención y MLP) | Apache-2.0 | Hugging Face, 82 descargas |
| Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP | no disponible | no disponible | BFP4 en MLP (menor huella) | Apache-2.0 (según el modelo card) | Hugging Face |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (base) | no disponible | no disponible | Sin cuantizar (q4_0 unquantized) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, salvo la tabla de evaluación del modelo card cuyos valores numéricos no están presentes.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no se han evaluado tras la conversión.
- La cuantización BFP8 introduce una pérdida de precisión respecto a BF16; el modelo card reporta métricas de KL y Top-1, pero sus valores no están disponibles en la información, por lo que no se puede cuantificar el impacto real.
- La calibración GPTQ se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento hacia esos dominios lingüísticos.
- Los idiomas soportados no están documentados; la calibración incluye coreano, pero no se especifica cobertura multilingüe.
- La longitud de contexto no está documentada.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized`, que no se detalla en la información proporcionada.
- El soporte en tt-forge (tt-xla) no se ha ejecutado con Gemma 4; por defecto mantiene los pesos en bf16 y la opción `bfp_bf8` recuantiza en el layout [out, in] de PyTorch, lo que puede alterar los valores.
- tt-transformers no soporta Gemma 4; el despliegue en Tensix requiere el demo de tt-metal o entradas de precisión específicas en `precision_overrides.json`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- El número de descargas (82) y de likes (0) sugiere un uso aún limitado, con menor validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante BFP4-MLP: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Demo Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
