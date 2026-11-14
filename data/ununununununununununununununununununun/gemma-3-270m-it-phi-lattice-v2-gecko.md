# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gecko

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo `unsloth/gemma-3-270m-it`, un fine-tune del Gemma 3 de 270 millones de parámetros desarrollado originalmente por Google DeepMind. El autor del repositorio, identificado como `ununununununununununununununununununun`, aplica un método propietario de cuantización denominado `gecko` (descrito como GPTQ espectral de bloques locales) sobre el formato de empaquetado `phi-lattice`. El resultado es un archivo de aproximadamente 371 MiB que mantiene el mismo contenedor que la versión `v2` previa, pero con una pasada de cuantización adicional que busca mejorar la fidelidad numérica.

El modelo base es Gemma 3 270M instruct, la variante más pequeña de la familia Gemma 3, orientada a generación de texto conversacional. Esta release no incluye pesos en formato estándar safetensors ni GGUF: el artefacto está empaquetado en un formato propietario que requiere un script específico (`phi_loader.py`) para cargarse en PyTorch. No hay información sobre idiomas soportados, datos de entrenamiento del fine-tune ni benchmarks estándar publicados.

La relevancia de esta ficha radica en que documenta una técnica de cuantización experimental (gecko) aplicada a un modelo pequeño, con métricas locales de perplejidad y SQNR que comparan el resultado con GPTQ global y con la cuantización estándar Q4_K_M de llama.cpp. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 270 millones (modelo base `gemma-3-270m-it`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit empaquetado propietario (`phi-lattice` + `gecko`), ~4.02 bpw efectivos en pesos lineales |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | Contenedor propietario `phi-lattice` (no safetensors, no GGUF); carga mediante `phi_loader.py` |

## Arquitectura y entrenamiento

El modelo base `unsloth/gemma-3-270m-it` es un transformer decoder-only de 270 millones de parámetros de la familia Gemma 3, en su variante de solo texto (`gemma3_text`). Sobre ese checkpoint, el autor aplica una cuantización post-entrenamiento a 4 bits mediante el método `gecko`, descrito como "GPTQ espectral de bloques locales". El artefacto resultante se empaqueta en el formato `phi-lattice`, un contenedor propietario que agrupa los pesos cuantizados y requiere un loader específico para reconstruirlos en memoria como bf16 desempaquetado (`mode="unrolled_bf16"`).

La cuantización se evalúa sobre un corpus local de seis textos, usando como referencia el modelo en FP32 con perplejidad (PPL) de 90,82. La tabla de resultados del autor muestra que la pasada `gecko` alcanza una PPL de 136,94 frente a 161,68 de la versión `v2` sin GPTQ y 139,85 de GPTQ global, manteniendo un SQNR de 19,07 dB (frente a 19,48 dB de `v2` y 16,17 dB de GPTQ global). El proceso de cuantización tarda 10,5 s frente a 66,8 s del GPTQ global. No hay información sobre el dataset de entrenamiento del fine-tune original de Unsloth, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 270M parámetros.
- Generación de código y matemáticas elementales, sin garantías de calidad comparable a modelos de mayor escala.
- Soporte de plantilla de chat (`apply_chat_template`) para formatear diálogos con roles user/assistant.
- No se documenta soporte de tool calling o function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación de técnicas de cuantización: el artefacto sirve para reproducir y comparar el método `gecko` frente a GPTQ global y Q4_K_M en un modelo pequeño, midiendo PPL y SQNR sobre un corpus controlado.
- Despliegue en entornos con memoria muy limitada: con ~371 MiB de pesos, puede cargarse en CPU o en GPUs de gama baja para prototipos de generación de texto, siempre que se use `phi_loader.py`.
- Pruebas de integración de formatos propietarios: útil para validar pipelines que consumen el contenedor `phi-lattice` y evaluar la viabilidad de un loader alternativo a safetensors/GGUF.
- Generación de texto de baja latencia en dispositivos edge: el tamaño reducido del modelo y del archivo permite inferencia rápida en hardware modesto, aunque la calidad del base 270M es limitada.
- Evaluación comparativa de fidelidad numérica: permite medir SQNR y PPL de distintas pasadas de cuantización sobre el mismo checkpoint, como base para estudios de compresión.
- Docencia y experimentación: adecuado para demostrar el impacto de la cuantización 4-bit en la calidad de un LLM pequeño, con métricas locales reproducibles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un corpus local de 6 textos, con FP32 de referencia (PPL 90,82):

| Archive | SQNR | PPL | Tamano |
|---|---|---|---|
| FP32 reference | — | 90.82 | 1.07 GB |
| v2 (plain lattice) | 19.48 dB | 161.68 | 371.0 MiB |
| v2-GPTQ (global, clean cal) | 16.17 dB | 139.85 | 371.0 MiB |
| v2-gecko (este repo) | 19.07 dB | 136.94 | 371.0 MiB |
| Q4_K_M (llama.cpp standard, reference) | 26.80 dB | 99.30 | 0.25 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, lm-eval) en la información disponible; el propio autor indica que la evaluación amplia con lm-eval está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: ~371 MiB de pesos empaquetados; al desempaquetar a bf16 en memoria, el consumo ronda ~540 MB de pesos más overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre; el modelo cabe en GPUs consumer de gama baja (GTX 1650, RTX 3050, RTX 4060) e incluso en iGPU.
- Cabe en consumer GPU: sí, ampliamente, dado el tamaño de 270M parámetros.
- Opciones de despliegue: solo PyTorch mediante `phi_loader.py` con `transformers`; no hay soporte GGUF, Ollama, vLLM ni TGI en esta release.
- Latencia y throughput estimados: no disponibles; el autor indica que la velocidad de inferencia es idéntica a la versión `v2` (mismo formato de loader), pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-270m-it-phi-lattice-v2-gecko (este) | 270M | no disponible | 4-bit phi-lattice/gecko (~4.02 bpw) | gemma | HF, solo PyTorch via `phi_loader.py` |
| gemma-3-270m-it-phi-lattice-v2 | 270M | no disponible | 4-bit phi-lattice (sin GPTQ) | gemma | HF, solo PyTorch |
| unsloth/gemma-3-270m-it (base) | 270M | no disponible | FP16/BF16 original | gemma | HF, transformers |
| Q4_K_M (llama.cpp) del base | 270M | no disponible | 4-bit K-quant (~4.88 bpw) | gemma | GGUF, amplio soporte de runtimes |

## Limitaciones y advertencias

- Calidad base limitada: el propio autor advierte que un modelo de 270M tiene prestaciones intrínsecamente reducidas con independencia de la cuantización.
- Sin GGUF ni Ollama: esta release no es compatible con llama.cpp, Ollama, vLLM ni TGI; requiere el loader propietario incluido en el repo.
- Formato no estándar: el contenedor `phi-lattice` no es safetensors ni GGUF, lo que complica la integración con tooling habitual y la portabilidad.
- Evaluación limitada: los benchmarks se basan en un corpus local de 6 textos; no hay resultados lm-eval ni benchmarks públicos comparables.
- Riesgo de alucinación: inherente a modelos pequeños; no hay mitigaciones documentadas.
- Sesgos: no disponibles en la información proporcionada.
- Idiomas: no disponibles; no se documenta cobertura multilingüe.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, con restricciones y obligaciones específicas que deben revisarse antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni señales de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gecko
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
