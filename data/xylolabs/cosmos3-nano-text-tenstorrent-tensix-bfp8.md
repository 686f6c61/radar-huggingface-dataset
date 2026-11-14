# Xylolabs/Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP8

## Resumen

Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo de texto de nvidia/Cosmos3-Nano, publicada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva únicamente la torre de comprensión de texto de Cosmos3-Nano —embedding, 36 capas transformer y cabeza LM— con los tensores renombrados al esquema de Qwen3, de modo que se carga directamente como `Qwen3ForCausalLM` en la librería transformers. La cuantización se aplica a las proyecciones lineales de atención (q, k, v, o) y de MLP (gate, up, down) mediante GPTQ sobre la rejilla de punto flotante por bloques `ttnn.bfloat8_b` (BFP8).

El resultado es un checkpoint de aproximadamente 8.190 millones de parámetros que ocupa unos 9,87 GB empaquetado, con una media de 9,64 bits por peso: las matrices cuantizadas usan 8,5 bits por peso en formato bfloat8_b, mientras que la cabeza LM, el embedding, las normas y el resto de tensores permanecen en bf16. Su relevancia radica en que permite desplegar un modelo de 8B en hardware Tenstorrent con una pérdida de precisión mínima, ya que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8 y TT-NN las empaqueta sin alterar sus valores.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El autor indica que, en texto y en bf16, el modelo coincide exactamente con el código de NVIDIA, y que se ha validado el empaquetado de las proyecciones de las dos primeras capas con una prefill de 2 capas que alcanza PCC 0,9990 frente a transformers. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ sobre rejilla BFP8 (`ttnn.bfloat8_b`); proyecciones q/k/v/o y gate/up/down a 8,5 bits por peso; resto en bf16; media de 9,64 bits por peso |
| Idiomas soportados | no disponible (calibrado con WikiText-2 y Wikipedia en coreano) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (16,4 GB de repo; ~9,87 GB empaquetados en dispositivo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 36 capas derivado de la torre de comprensión de nvidia/Cosmos3-Nano. Xylolabs ha renombrado los tensores al esquema de Qwen3 para que el checkpoint cargue como `Qwen3ForCausalLM` en transformers, y ha eliminado la torre de generación, el codificador de visión, el VAE de vídeo y el tokenizador de audio del modelo original. El tokenizador es el de NVIDIA, cargado tal como lo hace el pipeline de NVIDIA.

La innovación principal es la cuantización GPTQ adaptada a la rejilla de punto flotante por bloques de Tenstorrent. Cada bloque de pesos comparte un exponente, y las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de forma que el empaquetador de TT-NN las lee sin modificar sus valores. La calibración usó 65.536 tokens de WikiText-2 y Wikipedia en coreano. El archivo `quant4.json` documenta el formato de cada proyección. El autor reporta que, en bf16 y sobre texto, el modelo coincide exactamente con el código de NVIDIA, y que las proyecciones de las dos primeras capas se empaquetan de forma exacta con una prefill de 2 capas que alcanza PCC 0,9990 frente a transformers. No se detallan el número de tokens de entrenamiento original ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de uso general, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas en formato multi-turno (el ejemplo de la model card es una pregunta directa).
- Carga directa en transformers como `Qwen3ForCausalLM`, lo que habilita el ecosistema estándar de generación.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante tt-metal, ttnn y tt-forge.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.
- Capacidades multimodales (visión, vídeo, audio): no disponibles en esta exportación, que es solo texto.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponibles; la calibración incluyó coreano, pero no se documenta la cobertura de idiomas.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal del checkpoint es ejecutar un modelo de 8B en NPUs Tensix (Wormhole, Blackhole) con un consumo de memoria de dispositivo de unos 9,87 GB para los pesos, más espacio para la caché KV y buffers, usando tt-metal v0.81.1 y el demo `simple_text_demo.py`.
- Inferencia de texto en producción con transformers: al cargarse como `Qwen3ForCausalLM`, puede integrarse en pipelines existentes de generación con `AutoModelForCausalLM` y `device_map="auto"`, sin cambios en el código de aplicación.
- Evaluación de cuantización BFP8: sirve como referencia para medir la pérdida de precisión de GPTQ sobre la rejilla bfloat8_b frente al modelo base en bf16, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar.
- Prototipado en simulador: el autor lo validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, lo que permite desarrollar y depurar kernels sin hardware físico.
- Asistentes conversacionales de dominio general: con 8B parámetros y plantilla de chat, es adecuado para chatbots de atención al cliente o asistentes internos, siempre que se valide la calidad tras la cuantización.
- Investigación en eficiencia de hardware: permite estudiar el rendimiento de un transformer de 36 capas con proyecciones en BFP8 en TT-NN, incluyendo configuraciones de precisión (`precision_cfg`, `fidelity_cfg`) para capas concretas.
- Sustitución del modelo base en entornos con memoria limitada: el autor recomienda la versión BFP4 para dispositivos con menos memoria que los ~9,87 GB requeridos por esta versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la coincidencia numérica: PCC 0,9990 en una prefill de 2 capas frente a transformers, y coincidencia exacta con el código de NVIDIA en bf16 sobre texto.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: ~9,87 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- GPU convencionales: el checkpoint se puede cargar en transformers con `device_map="auto"`, pero no se documentan requisitos de VRAM para GPU en la información disponible.
- Cabe en GPU de consumo: no disponible; el tamaño de 16,4 GB del repositorio y ~9,87 GB empaquetados sugieren que una GPU de 24 GB podría albergarlo, pero no se confirma.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers (`simple_text_demo.py`), ttnn 0.81.1 (validado en ttsim), tt-forge (tt-xla, no probado aún con este checkpoint), transformers con `Qwen3ForCausalLM`, y text-generation-inference según las etiquetas.
- Alternativa para menos memoria: versión BFP4 del mismo autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-Tensix-BFP8 (este) | 8,19B | no disponible | GPTQ BFP8 + bf16 | openmdw-1.1 | Tenstorrent Tensix |
| Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4 | no disponible (mismo base) | no disponible | GPTQ BFP4 | openmdw-1.1 | Tenstorrent Tensix |
| nvidia/Cosmos3-Nano (base) | no disponible | no disponible | bf16 | no disponible | GPU convencionales |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo texto: la exportación excluye la torre de generación, el codificador de visión, el VAE de vídeo y el tokenizador de audio del modelo original, por lo que no conserva las capacidades multimodales de Cosmos3-Nano.
- Precisión: las proyecciones lineales están cuantizadas a 8,5 bits por peso; aunque el empaquetado es exacto sobre la rejilla BFP8, la cuantización GPTQ introduce una pérdida de precisión frente al modelo base en bf16 que debe validarse en la tarea concreta.
- Cabeza LM en bf16: el demo de tt-transformers empaqueta la cabeza en bfloat8_b, por lo que este checkpoint con cabeza bf16 no es exacto en ese demo.
- tt-forge no probado: el autor indica que tt-forge (tt-xla) aún no se ha ejecutado con este checkpoint; por defecto mantiene los pesos en bf16 (exacto), pero sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en PyTorch.
- Tokenizador: transformers marca la regex del tokenizador de NVIDIA; el autor lo carga como lo hace el pipeline de NVIDIA.
- Idiomas: no se documenta la cobertura; la calibración incluyó coreano, pero no hay lista de idiomas soportados.
- Contexto: no se documenta la longitud de contexto del modelo.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo de 8B, es esperable un riesgo de alucinación en dominios especializados, pero no hay datos que lo cuantifiquen.
- Licencia openmdw-1.1: deben revisarse los términos para uso comercial; no se detallan restricciones en la información proporcionada.
- Memoria: requiere ~9,87 GB de memoria de dispositivo solo para pesos; en dispositivos con menos memoria debe usarse la versión BFP4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Versión BFP4: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8/blob/main/LICENSE
