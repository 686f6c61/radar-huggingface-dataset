# Xylolabs/phi-4-Tenstorrent-Tensix-BFP8

## Resumen

Phi-4-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo microsoft/phi-4 (14.659.507.200 parámetros) realizada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix, concretamente las arquitecturas Wormhole y Blackhole. La cuantización aplica GPTQ sobre la rejilla de block floating point bfloat8_b (BFP8) de TT-NN, de modo que las matrices cuantizadas se almacenan como valores bf16 sobre dicha rejilla y el empaquetador de TT-NN las procesa sin alterar sus valores.

El resultado es un checkpoint de 16,54 GB empaquetado, con 9,03 bits por peso de media, que reduce a casi la mitad el espacio de pesos respecto al modelo base en bf16 (29,32 GB). Las capas lineales de atención (q, k, v, o) y de MLP (gate, up, down) en las 40 capas se guardan en bfloat8_b, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. El checkpoint se distribuye en el layout de Llama (LlamaForCausalLM), con las matrices fusionadas de Phi-4 separadas pero con valores idénticos.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 14B con pérdida de calidad mínima sobre hardware Tenstorrent; por otro, documenta con rigor el proceso de cuantización BFP8 y las herramientas de verificación (pack_tensix.py, verify_grid.py) que garantizan que ningún valor se modifica al empaquetar. La licencia es MIT y el modelo está pensado exclusivamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: microsoft/phi-4), exportado en layout LlamaForCausalLM |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GPTQ sobre rejilla BFP8 (ttnn.bfloat8_b); pesos efectivos de 8,5 bits en capas lineales, 9,03 bits por peso de media |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, layout Llama, tensores BFP8 empaquetados para TT-NN |

## Arquitectura y entrenamiento

El modelo base es Phi-4 de Microsoft, un transformer decoder-only de aproximadamente 14,7B parámetros. Esta exportación no reentrena el modelo: parte de los pesos de microsoft/phi-4 y aplica cuantización GPTQ directamente sobre la rejilla de block floating point bfloat8_b de TT-NN. En concreto, las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 40 capas se cuantizan a bfloat8_b, mientras que el LM head, los embeddings, las normas y el resto de tensores se mantienen en bf16, exactamente como en el modelo base.

El proceso de calibración de GPTQ utilizó 65.536 tokens compuestos por WikiText-2 y Wikipedia en coreano. Cada bloque BFP8 conserva el exponente compartido tal y como lo fija el empaquetador, lo que permite que TT-NN lea los pesos sin recalcular ni reinterpretar la rejilla. El checkpoint se reorganiza al layout de Llama: las matrices fusionadas q, k, v y gate-up de Phi-4 se dividen en tensores separados conservando los valores originales. El repositorio incluye utilidades de verificación (pack_tensix.py y verify_grid.py) que comprueban matriz a matriz que el empaquetado no altera ningún valor, incluyendo un round-trip opcional por la DRAM del dispositivo.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat mediante apply_chat_template.
- Razonamiento y resolución de problemas de conocimiento general (el modelo base Phi-4 destaca en tareas de razonamiento y matemáticas).
- Generación de código y matemáticas, heredadas del modelo base Phi-4.
- Ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN y tt-metal.
- Compatibilidad con tt-transformers (tt-metal v0.81.1) como LlamaForCausalLM, con la opción --use_hf_rope.
- Compatibilidad con tt-forge (tt-xla) en bf16 exacto; las opciones bfp_bf8 y bfp_bf4 re-cuantizan en layout [out, in] de PyTorch.
- Inferencia estándar con transformers en CPU/GPU usando dtype bfloat16 y device_map auto.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de esta exportación.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está diseñado para cargarse en NPUs Wormhole y Blackhole mediante TT-NN, aprovechando el empaquetado nativo BFP8 para evitar recuantización en el dispositivo. Requiere unos 16,54 GB de memoria de dispositivo solo para los pesos, más espacio para KV cache y buffers.
- Inferencia conversacional en inglés: con la plantilla de chat y el tokenizador incluidos, se puede usar directamente para asistentes de texto en inglés sobre transformers o sobre tt-transformers.
- Evaluación de calidad de cuantización: sirve como referencia para medir el impacto de BFP8 frente a BF16 (KL media de 0,00071 y 98,76% de top-1 según la model card), útil en pipelines de validación de cuantización.
- Prototipado en simulador: la model card indica que se validó con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent, lo que permite desarrollar y depurar kernels sin hardware físico.
- Verificación de empaquetado en CI: los scripts pack_tensix.py y verify_grid.py permiten comprobar automáticamente que cada matriz empaquetada conserva sus valores, integrándose en pipelines de control de calidad de exportaciones.
- Comparación de formatos en el mismo hardware: junto con la versión BFP4 (phi-4-Tensix-BFP4-Down8), permite evaluar el compromiso entre memoria (16,54 GB frente a la variante BFP4) y fidelidad numérica en dispositivos con distinta capacidad.
- Investigación sobre block floating point: el repositorio y el código tensix-bfp-gptq documentan el proceso completo de cuantización GPTQ sobre rejilla BFP8, útil para estudiar técnicas de compresión en aceleradores con formatos propietarios.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | 29 de 33 | - |
| Este modelo (BFP8) | 9,03 | 16,539 | 0,00071 | 98,76 | 28 de 33 | 0 |
| Q4_ | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card incluye además un resultado de validación en tt-transformers: con --use_hf_rope, todas las proyecciones de las 2 primeras capas empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0,9996. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 16,54 GB solo para los pesos del modelo de lenguaje, más espacio adicional para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- En GPUs convencionales: el checkpoint puede cargarse con transformers en bfloat16 (device_map auto), lo que requiere del orden de 29 GB de memoria, similar al modelo base.
- Para dispositivos con menos memoria, la model card recomienda la versión BFP4 (Xylolabs/phi-4-Tenstix-BFP4-Down8).
- Opciones de despliegue: TT-NN con tt-metal v0.81.1 (tt-transformers, demo simple_text_demo.py), tt-forge (tt-xla, aún no probado con este checkpoint), y transformers estándar para inferencia en CPU/GPU.
- Simulación: validado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/phi-4-Tenstorrent-Tensix-BFP8 | 14,66B | no disponible | BFP8 GPTQ (9,03 bits/peso) | MIT | Hugging Face |
| microsoft/phi-4 (BF16) | 14,66B | no disponible | BF16 (16 bits/peso) | MIT | Hugging Face |
| Xylolabs/phi-4-Tensix-BFP4-Down8 | 14,66B (base) | no disponible | BFP4 | MIT (según repositorio) | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye datos de otros modelos de la misma categoría. La diferencia principal entre las tres variantes es el formato de cuantización y el espacio ocupado: BF16 ocupa 29,32 GB, BFP8 16,539 GB y BFP4 está pensado para dispositivos con menos memoria, a costa de mayor pérdida de fidelidad numérica.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente al modelo base Phi-4; la cuantización BFP8 añade una degradación mínima (KL media de 0,00071), pero no elimina el riesgo.
- Sesgos: no se documentan análisis de sesgo específicos para esta exportación; se heredan los del modelo base.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base microsoft/phi-4 y de las herramientas de Tenstorrent (tt-metal, TT-NN) que se utilicen para ejecutarlo.
- Dependencia de hardware: el formato BFP8 está pensado para TT-NN; fuera de Tenstorrent los pesos se cargan como bf16 y se pierde la ventaja de compresión.
- Compatibilidad parcial: tt-forge no se ha probado con este checkpoint; el demo de tt-transformers empaqueta el head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese demo.
- Longitud de contexto: no se especifica en la información disponible, por lo que debe consultarse la model card de microsoft/phi-4 antes de usarlo en producción con contextos largos.
- Madurez: el repositorio tiene pocas descargas (67) y ningún like en el momento de la consulta, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/microsoft/phi-4
- Versión BFP4: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP4-Down8
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia del modelo: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
