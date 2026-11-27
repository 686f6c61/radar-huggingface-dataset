# Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix

## Resumen

Ornith-1.5-9B-Tenstorrent-Tensix es una cuantizacion del modelo base ornith-ai/Ornith-1.5-9B, publicada por Xylolabs, especificamente empaquetada para su ejecucion sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, basadas en nucleos Tensix). El modelo base es un transformer de la familia Qwen3.5 (tag `qwen3_5`), con 9.000 millones de parametros aproximadamente y capacidades multimodales de entrada, ya que la model card emplea `AutoModelForImageTextToText` para su carga. Ornith-1.5 se presenta como una evolucion "de autoconstruccion a auto-mejora" segun el equipo autor.

El problema que resuelve esta variante concreta es el despliegue eficiente del modelo sobre hardware no-GPU: Tenstorrent Tensix no ejecuta formatos estandar de cuantizacion como GGUF o GPTQ de forma nativa, por lo que Xylolabs aplica su pipeline `tensix-bfp-gptq` para producir pesos en formatos de bloque de coma flotante (`bfloat4_b`, `bfloat8_b`) compatibles con dichos aceleradores. El resultado es un paquete de 8,231 GB (frente a los 17,91 GB en BF16) con una divergencia media de KL de 0,0545 respecto al modelo original.

Es relevante ahora porque demuestra la viabilidad de servir modelos de 9B en NPUs de Tenstorrent con una perdida de calidad medible y acotada, ofreciendo una alternativa de hardware a las GPU de NVIDIA en escenarios de inferencia de texto. La licencia es MIT, lo que facilita su adopcion comercial, aunque el modelo base hereda componentes de Qwen3.5 bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, con capas DeltaNet (atencion lineal) y atencion estandar; multimodal de entrada (image-text-to-text) |
| Parametros totales | 9B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (entradas DeltaNet, Q/K/V de atencion y MLP), bfloat8_b (salidas DeltaNet y atencion), resto en bf16; formato Tensix BFP |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | MIT (base); componentes Qwen3.5 bajo Apache 2.0; herramientas bajo Apache 2.0 |
| Formato de pesos | safetensors empaquetados en carpeta `bfp4/`, con scripts `pack_tensix.py` y `verify_grid.py` para despliegue en Tensix |
| Tamano del repo | 19,3 GB (pesos empaquetados bfp4: 8,231 GB) |
| Divergencia KL media vs BF16 | 0,0545 |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura hibrida dentro de la familia Qwen3.5: combina capas DeltaNet (un mecanismo de atencion lineal recurrente) con capas de atencion estandar, lo que reduce el coste computacional en contextos largos. La model card de esta variante cuantizada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion corresponderia a la ficha del modelo base, no incluida en la informacion disponible.

La innovacion tecnica de esta publicacion reside en el pipeline de cuantizacion `tensix-bfp-gptq v0.1.0`: aplica GPTQ con formatos de bloque de coma flotante (BFP) especificos de Tensix, asignando bfloat4_b a las entradas de DeltaNet, proyecciones Q/K/V y capas MLP, y bfloat8_b a las salidas de DeltaNet y atencion, manteniendo el resto en bf16. El autor reporta una verificacion cualitativa de "29/33 + 7/7 respuestas" y una KL media de 0,0545 frente a BF16, comparable a la de Q4_K_M en llama.cpp (0,0375) aunque con mayor tamano de artefacto.

## Capacidades

- Generacion de texto y razonamiento en ingles y coreano.
- Procesamiento de entrada multimodal (imagenes y texto) segun el uso de `AutoModelForImageTextToText`.
- Modo "thinking" configurable a traves del chat template (`enable_thinking`), lo que permite activar o desactivar razonamiento extendido.
- Soporte de plantilla de chat conversacional multi-turno (`apply_chat_template`).
- Capacidad de ejecucion sobre NPUs Tenstorrent Tensix mediante empaquetado especifico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia de texto sobre NPUs Tenstorrent: el paquete `bfp4/` permite desplegar un modelo de 9B en Wormhole o Blackhole sin GPU NVIDIA, usando `pack_tensix.py` para empaquetar los pesos y `verify_grid.py` para validar la integridad del grid. Adecuado para laboratorios que ya disponen de hardware Tensix.
- Asistentes conversacionales en ingles y coreano: el modelo soporta chat multi-turno mediante plantilla y dos idiomas declarados, lo que lo hace util para atencion al cliente o asistentes internos en esas lenguas.
- Razonamiento con modo thinking: activando `enable_thinking=True` en el chat template se obtienen cadenas de razonamiento para tareas de analisis, clasificacion compleja o resolucion de problemas.
- Procesamiento de documentos con imagenes: al cargarse con `AutoModelForImageTextToText`, puede emplearse en tareas de extraccion de informacion de capturas, formularios o diagramas combinados con texto.
- Prototipado en entornos de investigacion con hardware no convencional: util para estudiar el impacto de la cuantizacion BFP4/BFP8 en la calidad del modelo (la KL de 0,0545 sirve como referencia reproducible).
- Despliegue con licencia permisiva en productos comerciales: la licencia MIT del paquete permite integrar el modelo en productos propietarios, siempre que se respeten los avisos de Qwen3.5 (Apache 2.0) incluidos en `UPSTREAM_QWEN_LICENSE`.
- Evaluacion comparativa de formatos: el autor incluye comparacion frente a Q4_K_M de llama.cpp, lo que permite usar el paquete como referencia en estudios de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de cuantizacion:

| Metrica | bfp4 (Tensix) | Q4_K_M (llama.cpp) | BF16 (original) |
|---|---|---|---|
| Tamano empaquetado (GB) | 8,231 | 5,780 | 17,91 |
| KL media vs BF16 | 0,0545 | 0,0375 | 0 |
| Verificacion de respuestas (33+7) | 29/33 + 7/7 | no disponible | referencia |

## Requisitos de hardware

- VRAM/NPU: el paquete `bfp4/` ocupa 8,231 GB empaquetado; en memoria requiere al menos el equivalente en NPU Tensix (Wormhole o Blackhole) o GPU con ~9-10 GB de VRAM si se carga en bf16 con `device_map="auto"`.
- Aceleradores objetivo: NPUs Tenstorrent Wormhole y Blackhole (nucleos Tensix). La model card no menciona soporte en GPU NVIDIA, aunque el codigo de ejemplo usa `transformers` con `device_map="auto"`, lo que permite ejecucion en GPU convencional.
- GPU consumer: no confirmado; un modelo de 9B en bf16 necesita aproximadamente 18 GB de VRAM (RTX 4090 de 24 GB seria suficiente en teoria, pero no se documenta).
- Opciones de despliegue: `transformers` (con `AutoModelForImageTextToText`), pipeline Tensix (`pack_tensix.py`, `verify_grid.py`). No se mencionan vLLM, TGI, llama.cpp ni Ollama para esta variante.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Tenstorrent-Tensix (bfp4) | 9B | no disponible | safetensors BFP4/BFP8 | MIT | Tenstorrent Tensix |
| Ornith-1.5-9B (BF16 original) | 9B | no disponible | safetensors bf16 | MIT (sin fichero en repo base) | GPU/NPU generica |
| Ornith-1.5-9B Q4_K_M (llama.cpp) | 9B | no disponible | GGUF Q4_K_M | MIT | CPU/GPU via llama.cpp |

No se dispone de datos de rendimiento en benchmarks que permitan comparar cualitativamente con otras familias (Qwen3.5 original, Llama, Mistral), por lo que la comparativa se limita a formatos y hardware del mismo modelo.

## Limitaciones y advertencias

- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- La cuantizacion BFP4/BFP8 introduce degradacion medible (KL 0,0545); el autor solo verifica 40 respuestas cualitativas, lo que es una muestra reducida para garantizar robustez en produccion.
- El modelo base no incluye fichero de licencia en su repositorio; Xylolabs ha generado uno estandar MIT, lo que puede generar ambiguedad legal sobre la cesion original.
- Ornith-1.5 se construye sobre Qwen3.5 (Apache 2.0); es obligatorio conservar el aviso de copyright de Qwen en `UPSTREAM_QWEN_LICENSE` al redistribuir.
- Riesgo de alucinacion no evaluado en la informacion disponible; como todo LLM, puede generar contenido facticamente incorrecto.
- El paquete esta orientado a hardware Tensix; su uso en GPU requiere conversion manual y no esta validado por el autor.
- No se documentan sesgos conocidos, longitud de contexto ni limites de tokens de salida.
- El repositorio tiene 0 likes y 144 descargas, lo que sugiere poca validacion por parte de la comunidad.
- La fecha de creacion (2026-11-17) y las referencias a Qwen3.5 implican que se trata de un modelo reciente; puede haber cambios en el ecosistema de herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio del pipeline de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas Tensix (pack_tensix.py, verify_grid.py): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Pagina de presentacion de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
