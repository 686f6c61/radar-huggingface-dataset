# wemoh/Qwen3.8-Flash-Next-strixw

## Resumen

Qwen3.8-Flash-Next-strixw es una conversión cuantizada de los pesos de Qwen/Qwen3.8-Flash-Next, publicada por el usuario wemoh al formato propietario strixw que consume strixite, un motor de inferencia escrito desde cero en HIP para el chip AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S, gfx1151). El modelo base es un MoE multimodal de Qwen construido sobre la arquitectura Qwen4, con atención híbrida GDN + QSA (Gated DeltaNet más atención con puertas) y 512 expertos enrutados. La conversión reduce la descarga de unos 360 GB del checkpoint original a aproximadamente 115 GiB y elimina la torre de visión: strixite es solo texto.

El interés de esta publicación no reside en el modelo en sí, sino en la demostración de inferencia local de un MoE de gran tamaño sobre hardware de consumo con memoria unificada. El autor reporta 47-50 tokens/s de decodificación sostenidos hasta 492.000 tokens de contexto, unos 1.370 tokens/s de prefill sobre una conversación real de 489.566 tokens y 19 de 19 tareas superadas en el suite core19 de terminal-bench-mini, todo sobre una única máquina Strix Halo de 128 GB.

La contrapartida es un formato cerrado: los ficheros solo los carga strixite, y el motor (cuyo código se anuncia como próximo) funciona exclusivamente en Linux sobre AMD Strix Halo. Para Transformers, llama.cpp, vLLM u Ollama hay que partir del checkpoint original. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un artefacto personal, reproducible únicamente en el entorno del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atención híbrida GDN + QSA (Qwen4); la conversión strixw es solo texto |
| Parametros totales | no disponible (una fuente secundaria indica ~125B; otra menciona 180B en disco) |
| Parametros activos | no disponible (una fuente secundaria indica ~6B) |
| Longitud de contexto | 512.000 tokens en strixite (modelo entrenado a 262.144; YaRN factor 2) |
| Tipos de cuantizacion | Asimétrica por grupo: 4-bit grupos de 128 (expertos enrutados y proyecciones de entrada GDN), 8-bit grupos de 64 (proyecciones densas), BF16 (router, token embedding), FP32/BF16 (normas, gates, kernels de convolución); ~4,25 bits por peso enrutado |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | strixw, formato propietario de strixite (no es GGUF ni safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) con atención con puertas (QSA), según la documentación de Qwen, y se presenta como avance de la arquitectura que usará Qwen4. Se trata de un MoE con 512 expertos enrutados, de los que cada token lee solo unos pocos; el resto de la ruta densa (proyecciones de atención q/k/v/o, salida GDN, experto compartido, mezclas de hiperconexión, claves y valores PLE, LM head) se lee en cada token. La conversión incluye además una cabeza MTP (multi-token prediction) y una tabla de embeddings n-gram por capas de 48,3 GiB, pensada para leerse desde SSD bajo demanda en lugar de cargarse en memoria.

Sobre el entrenamiento del checkpoint original no se proporciona información en el material disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO, y no se han publicado resultados de benchmarks estándar en la información consultada. Lo que sí documenta el autor de la conversión es el proceso de cuantización: cuantización entera asimétrica por grupo a lo largo de la dimensión de entrada, con una escala BF16 y un mínimo BF16 por grupo, elegida clase por clase a partir de un estudio contra las salidas de referencia en FP32. La tabla n-gram se transcodifica a int8 por fila con una escala BF16 por fila, con un error mediano de fila del 0,66 % respecto a la fila BF16. El layout completo queda fijado como `exp_gu=q4g128,exp_down=q4g128,sh_gu=q8g64,sh_down=q8g64,gdn_in=q4g128,gdn_out=q8g64,attn_qkv=q8g64,attn_o=q8g64,hc_down=q8g64,hc_up=q8g64,ple_kv=q8g64,lm_head=q8g64,mtp_fc=q4g64,embed=bf16`.

## Capacidades

- Generación de texto y razonamiento multi-paso en contexto largo, con decodificación asistida por la cabeza MTP integrada.
- Ejecución de tareas de agente sobre terminal: 19 de 19 tareas del suite core19 de terminal-bench-mini resueltas según el autor.
- Conversaciones y tareas con hasta 512.000 tokens de contexto (mediante YaRN factor 2 en el motor).
- Precarga rápida de contextos muy largos: ~1.370 tokens/s sobre una conversación real de 489.566 tokens.
- Cuantización mixta calibrada para mantener fidelidad frente al modelo sin cuantizar (divergencia KL media 0,028).
- Capacidades multilingües: no disponibles (no declaradas en la información).
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Visión: no incluida (la torre de visión se descarta en esta conversión).
- Audio: no disponible.

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo puede mantener el historial completo de una sesión de terminal dentro de la ventana de 512k tokens y encadenar comandos con contexto acumulado, lo que lo hace adecuado para tareas tipo terminal-bench ejecutadas localmente.
- Asistente de programación sobre repositorios grandes: con 512k tokens de contexto es posible cargar porciones extensas de un monorepo y razonar sobre dependencias cruzadas sin trocear el código en fragmentos.
- Análisis de conversaciones o logs de gran volumen: el prefill de ~1.370 tokens/s permite ingerir en pocos minutos transcripciones de cientos de miles de tokens y resumirlas o extraer conclusiones sin reenviar datos a la nube.
- RAG con contexto masivo: la caché KV reducida (hasta ~13 GiB a 512k) permite mantener varias sesiones de recuperación aumentada abiertas simultáneamente en la misma máquina.
- Inferencia privada en estación de trabajo: al ejecutarse íntegramente en un Strix Halo con memoria unificada, resulta apto para entornos donde los datos no pueden salir de la máquina (legal, sanidad, investigación interna).
- Procesamiento por lotes offline con MTP: activar la multi-token prediction eleva la decodificación de ~33 a 45-55 tokens/s en el rango 2k-131k, útil para generar grandes volúmenes de texto sin interacción en tiempo real.
- Investigación sobre arquitecturas híbridas GDN + QSA: sirve como banco de pruebas para medir el comportamiento de atención lineal y MoE disperso en hardware de memoria unificada.
- Formación y demostraciones de inferencia local: permite mostrar en una única máquina de sobremesa un MoE de gran tamaño funcionando con contexto de 512k, algo que normalmente exige clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son las mediciones propias del autor con strixite sobre un Strix Halo de 128 GB, entre el 28 de septiembre y el 3 de octubre de 2026:

| Metrica | Valor |
|---|---|
| Divergencia KL media vs salidas FP32 | 0,028 (242 posiciones, 3 prompts de referencia) |
| Coincidencia top-1 con el modelo sin cuantizar | 226 de 242 posiciones |
| terminal-bench-mini (suite core19) | 19 / 19 tareas |
| Decodificacion sin MTP | ~33 tokens/s |
| Decodificacion con MTP (contexto 2k-131k) | 45-55 tokens/s |
| Decodificacion en uso agéntico real | ~47-50 tokens/s, estable de 0 a 492k tokens |
| Prefill | ~1.370 tokens/s sobre 489.566 tokens |

## Requisitos de hardware

- Plataforma obligatoria: AMD Strix Halo (gfx1151), 128 GB de memoria unificada; probado sobre Fedora 43. No hay soporte para Windows ni macOS.
- Memoria: ~66 GiB de pesos residentes en memoria unificada (GTT, sin reserva de VRAM dedicada) más hasta ~13 GiB de caché KV a 512k tokens de contexto.
- Almacenamiento: la tabla n-gram de 48,3 GiB permanece en disco y se lee fila a fila a través de una caché en RAM, por lo que se recomienda un NVMe rápido. La descarga total ronda los 115 GiB.
- GPU compatibles: únicamente la iGPU Radeon 8060S integrada en el Ryzen AI MAX+ 395. No es utilizable en A100, H100, RTX 4090 ni otras GPU discretas.
- ¿Cabe en GPU de consumo? No en el sentido habitual: requiere un equipo con memoria unificada de 128 GB. Una fuente secundaria apunta a que el modelo base podría ejecutarse en máquinas con 75 GB de RAM o memoria unificada usando otras herramientas, pero esta conversión concreta exige 128 GB para el motor strixite.
- Opciones de despliegue: exclusivamente strixite. No funciona con vLLM, llama.cpp, Ollama, TGI ni Transformers, ya que strixw no es GGUF ni safetensors.
- Latencia y throughput: decodificación ~33 tokens/s sin MTP, 45-55 tokens/s con MTP en el rango 2k-131k, y ~47-50 tokens/s sostenidos en uso agéntico real hasta 492k tokens; prefill ~1.370 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wemoh/Qwen3.8-Flash-Next-strixw | no disponible (base ~125B según fuente secundaria) | 512k en strixite | strixw (solo strixite) | Qwen Community License 1.0 | AMD Strix Halo gfx1151, Linux, 128 GB |
| Qwen/Qwen3.8-Flash-Next | ~125B según fuente secundaria | 262.144 tokens | BF16 safetensors (~360 GB) | Qwen Community License 1.0 | Multiplataforma con el stack estándar |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | GPU de 24 GB según fuente secundaria |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa se limita al checkpoint original del que deriva. Esta conversión ocupa aproximadamente un tercio del espacio del original (115 GiB frente a ~360 GB), amplía el contexto efectivo a 512k mediante YaRN y añade la cabeza MTP, a cambio de restringir el despliegue a un único chip y motor. No se dispone de datos para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Formato propietario: los ficheros solo los carga strixite; Transformers, llama.cpp, vLLM, Ollama y TGI no pueden usarlos. Para esos ecosistemas hay que partir del checkpoint original.
- Hardware cerrado: funciona únicamente sobre AMD Strix Halo (gfx1151) con 128 GB y Linux. No hay soporte para Windows, macOS ni GPU discretas.
- Madurez: el motor está desarrollado y probado por una sola persona en una sola máquina, y su código fuente se anuncia como próximo, no publicado. El repositorio acumula 0 descargas y 0 likes, sin validación independiente.
- Sin torre de visión: esta conversión es solo texto, aunque el modelo base es multimodal.
- Idiomas soportados: no declarados; no hay información sobre cobertura multilingüe.
- Pérdida por cuantización: la divergencia KL media de 0,028 y la coincidencia top-1 de 226 de 242 posiciones implican una degradación medible frente al modelo sin cuantizar, aunque el autor la describe como cercana al original.
- Extrapolación de contexto: los 512k tokens se obtienen con YaRN factor 2 sobre un modelo entrenado a 262.144; no se documenta el comportamiento de la calidad más allá del rango de entrenamiento.
- Dependencia de almacenamiento: si la tabla n-gram no reside en un NVMe rápido, la lectura bajo demanda puede degradar el rendimiento o provocar bloqueos.
- Fuentes secundarias discrepantes sobre el número de parámetros (~125B frente a 180B en disco), sin confirmación en la model card oficial.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos; como en cualquier LLM generativo, cabe esperar alucinaciones, especialmente en tareas de conocimiento factual.
- Licencia: se aplica la Qwen Community License 1.0. No se detallan en la información disponible las condiciones exactas para uso comercial, por lo que conviene revisar el texto íntegro de la licencia antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wemoh/Qwen3.8-Flash-Next-strixw
- Checkpoint original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor strixite: https://github.com/shawnshekari/strixite
- Repositorio de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Guía de Unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Análisis de hardware de RunAIHome: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
