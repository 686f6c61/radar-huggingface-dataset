# vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder es un checkpoint fusionado publicado por el usuario vwdubb que integra en un unico conjunto de pesos el modelo base ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP (derivado de Swift-Qwen3.8-27B de UkisAI, con ablacion de rechazo unidireccional de OrcaRouter) y el adaptador Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO rank-16). El resultado es un modelo denso de 27.781.427.952 parametros (27,8B) almacenados en safetensors bf16, con el tower de vision y la cabeza MTP (multi-token prediction) del base intactos.

El artefacto encadena tres ediciones sobre el mismo linaje: el fine-tune de razonamiento eficiente de UkisAI, una ablacion de rechazo aplicada directamente a los pesos y un pase de concision orientado a trazas de codigo. La model card lo posiciona explicitamente como material para investigacion de interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo y red-teaming, no como modelo desplegable en produccion.

Su interes actual radica en dos frentes: por un lado, ejemplifica la composicion de ediciones de pesos no supervisadas sobre un base abierto (Qwen3.8-27B, Apache 2.0) para obtener un artefacto sin alineacion de seguridad; por otro, documenta una tecnica de merge reproducible, el redondeo estocastico, para preservar deltas de LoRA por debajo de la resolucion de bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tower de vision preservado) con cabeza MTP para decodificacion especulativa propia; base Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (no se reporta arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (segun la configuracion de servicio vLLM indicada en la model card) |
| Tipos de cuantizacion | bf16 en safetensors; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (campo `license: other`) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: el modelo es un merge de pesos en fp32 mediante la formula `W + B @ A * (lora_alpha / r)`, con `lora_alpha` 32 y `r` 16 (escala 2,0). El resultado se almacena en bf16 aplicando redondeo estocastico (no sesgado) con semilla fija 0, de modo que el merge es reproducible. La razon es que los deltas del adaptador son deliberadamente minusculos (‖Δ‖/‖W‖ ≈ 4e-4–1e-3), por debajo de la resolucion por elemento de bf16: la model card del adaptador mide una supervivencia del delta del 31–61 % con redondeo bf16 simple frente al 94–99,9 % en fp16. El redondeo estocastico mantiene el valor esperado del delta sin cambiar el dtype ni el tamano del checkpoint.

La cabeza MTP y el tower de vision no son tocados por el adaptador: la cabeza MTP del base esta abliterada de forma coherente con el modelo principal y el tower de vision se conserva completo, por lo que siguen funcionando tanto la decodificacion autoespeculativa como la comprension de imagenes. Los ficheros no de pesos (config, tokenizer, processor, index) se copian del base, y la plantilla de chat es `Shockem/froggeric-terse-coder`. La model card advierte que servir el modelo sin esa plantilla altera el comportamiento agentico. Los parametros de muestreo recomendados son temperatura 1.0, top_p 0.95, top_k 20, min_p 0.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento con modo thinking habilitado (`reasoning`, `reasoning_effort` ajustable en tiempo de ejecucion).
- Generacion de codigo con trazas de razonamiento comprimidas (pase Terse-Coder).
- Comprension de imagenes: clases `AutoProcessor` y `AutoModelForImageTextToText`, tower de vision preservado.
- Tool calling / function calling: soportado via vLLM con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Comportamiento agentico multi-paso (la model card indica que depende de la plantilla de chat `Shockem/froggeric-terse-coder`).
- Decodificacion autoespeculativa con la cabeza MTP (`num_speculative_tokens` configurable).
- Comportamiento sin alineacion de seguridad (abliterado): responde a peticiones que el Qwen3.8-27B original rechazaria.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion de seguridad de IA: analisis de mecanismos de rechazo comparando las respuestas de este artefacto con las del Qwen3.8-27B original sobre el mismo prompt, gracias a que la ablacion es una edicion de pesos y no un desaprendizaje a nivel de datos.
- Red-teaming controlado: generacion de respuestas sin guardarrailes en entornos aislados para construir conjuntos de evaluacion de robustez, con la advertencia explicita de no exponerlo a usuarios finales.
- Estudio de interpretabilidad: al ser el "artefacto mas estratificado de la serie" (Qwen3.8-27B → Swift 1.0 → abliteracion → Terse-Coder LoRA), permite aislar el efecto de cada edicion sobre los pesos.
- Generacion de codigo con trazas concisas: el pase Terse-Coder reduce la verbosidad del razonamiento en tareas de programacion, util en pipelines donde el coste por token de pensamiento es relevante.
- Asistente de codigo self-hosted con tool calling: desplegable con vLLM (`--tool-call-parser qwen3_coder`) para integrarse en flujos de edicion y refactorizacion que requieran invocar herramientas.
- Procesamiento de documentos con imagen: al conservar el tower de vision, admite tareas de image-text-to-text (por ejemplo, extraccion de informacion de capturas o diagramas) sin recuantizar.
- Evaluacion de tecnicas de merging: el uso documentado de redondeo estocastico con semilla fija lo convierte en un caso reproducible para estudiar la preservacion de deltas de LoRA en bf16.
- Inferencia autoespeculativa en produccion interna: la cabeza MTP intacta permite acelerar la decodificacion sin un modelo borrador externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se han ejecutado benchmarks independientes sobre este artefacto y que la interaccion entre la ablacion y el pase Terse-Coder no esta medida. El unico dato cuantitativo reportado es del adaptador sobre el base Qwen original: una "tasa de capacidad" del 70 % que cae al 60–62 % tras merge en fp32, fp16 y recuantizacion NVFP4, medido sobre un conjunto held-out-40 propio del autor del adaptador. Esa cifra no corresponde a este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 55,6 GB solo de pesos (el repo ocupa 55,6 GB), mas overhead de KV cache y activaciones, en torno a 60–70 GB segun longitud de contexto.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism (`--tensor-parallel-size`).
- Consumer GPU: no cabe en una sola GPU de 24 GB en bf16. Seria necesario tensor parallelism sobre 2 tarjetas de 48 GB (por ejemplo, 2x RTX 4090/6000 Ada) o memoria unificada de 64 GB o mas en Apple Silicon. Con una cuantizacion int4 creada por el usuario cabria en una RTX 4090/3090 de 24 GB, pero no se publican pesos cuantizados.
- Opciones de despliegue: vLLM (documentado en la model card, con parser `qwen3` y `qwen3_coder`), Transformers (`AutoModelForImageTextToText`). llama.cpp, Ollama y TGI requeririan conversion a GGUF u otro formato, no disponible en el repo.
- Latencia y throughput: no disponible. La decodificacion autoespeculativa con MTP (`num_speculative_tokens`: 3) es la via documentada para reducir latencia, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder (este) | 27,8B | 262.144 tokens (config. de servicio) | sin benchmarks | Swift Open License v1.0 | safetensors bf16 en HF |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP (base) | no disponible | no disponible | sin benchmarks (declarado) | Swift Open License v1.0 | safetensors en HF |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA (adaptador) | adaptador LoRA rank-16 | no disponible | 70 % → 60-62 % sobre held-out-40 propio tras merge/recuantizacion | Apache 2.0 | adaptador en HF |
| Qwen3.8-27B (modelo original) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Alineacion de seguridad eliminada: hereda la abliteracion del base y respondera a peticiones daninas, poco eticas, ofensivas o ilegales que el Qwen3.8-27B original rechazaria. No tiene guardarrailes internos significativos.
- No desplegar a usuarios finales ni en produccion sin anadir capas propias de seguridad, moderacion y prevencion de abuso.
- Riesgo de alucinacion: no evaluado y no disponible; no se han ejecutado benchmarks independientes sobre este artefacto.
- Efectos compuestos sin medir: la model card indica que no se ha evaluado si las trazas de razonamiento cortas de Swift sobreviven a la abliteracion, ni el autor del adaptador tiene resultados sobre bases abliteradas. La magnitud del efecto de concision es desconocida.
- Impuesto de capacidad tras el merge: aunque este checkpoint almacena bf16 sin recuantizar (por lo que el impuesto deberia ser menor), el autor del adaptador midio una perdida del 70 % al 60-62 % tras merge y recuantizacion sobre el base original. No es cero.
- No cargar el LoRA Terse-Coder encima de este modelo: la doble aplicacion acorta en exceso el razonamiento (63 % de aciertos con fallos `no_code` en las pruebas del adaptador).
- El adaptador es una edicion de comportamiento, no de conocimiento: para tareas que requieran derivaciones largas hay que subir `reasoning_effort`.
- Dependencia de plantilla de chat: servir sin `Shockem/froggeric-terse-coder` altera el comportamiento agentico.
- Idiomas soportados: no disponible.
- Licencia comercial restringida: uso comercial gratuito solo para individuos y organizaciones con ingresos brutos anuales de hasta 1.000.000 USD; por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. Nada en la Swift Open License limita los derechos sobre Qwen3.8-27B bajo Apache 2.0.
- Receptor de 0 descargas y 0 likes en el momento del registro; artefacto muy reciente y sin validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder
- Modelo base abliterado: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo Swift original: https://huggingface.co/ukisai (UkisAI)
- Referencia arXiv etiquetada en el repo: https://arxiv.org/abs/2406.11717
