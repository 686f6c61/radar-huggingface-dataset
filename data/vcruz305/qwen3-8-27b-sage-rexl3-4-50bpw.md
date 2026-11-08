# vcruz305/Qwen3.8-27B-SAGE-REXL3-4.50bpw

## Resumen

`vcruz305/Qwen3.8-27B-SAGE-REXL3-4.50bpw` es una cuantización de 4,50 bits por peso del modelo base `Qwen/Qwen3.8-27B`, publicada por el usuario vcruz305 en Hugging Face. Se distribuye en formato EXL3 (ExLlamaV3) con pesos en safetensors, pensada para inferencia eficiente con la librería exllamav3 en GPUs de consumo. El repositorio está sujeto a acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

El modelo base pertenece a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio. Llama la atención la discrepancia entre el nombre comercial ("27B") y el recuento real de parámetros en los ficheros safetensors, que asciende a 8.631.286.784 (aproximadamente 8,6 mil millones). Esta ficha refleja el dato real medido en los pesos y señala la discrepancia como advertencia.

La relevancia de esta publicación es práctica: ofrece una vía para ejecutar un modelo de la familia Qwen3.5 en hardware limitado mediante cuantización EXL3 de 4,50 bpw, con un tamaño de repositorio de 17,3 GB. No obstante, la información pública disponible es muy escasa (sin README sustantivo, sin idiomas declarados y sin benchmarks), por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `qwen3_5`; presumiblemente transformer, sin confirmar) |
| Parametros totales | 8.631.286.784 (medidos en safetensors); el nombre del modelo indica "27B", discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,50 bits por peso (variante SAGE-REXL3); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5` asociada al repositorio. No se documentan el tipo de transformer, el número de capas, la dimensionalidad de los embeddings ni si emplea atención lineal, mezcla de expertos u otras innovaciones. Tampoco se detallan los datos de entrenamiento: número de tokens, composición del corpus, fases de RLHF, DPO u otras etapas de alineamiento.

Lo único verificable es el proceso de cuantización: los pesos se han convertido a formato EXL3 con una precisión de 4,50 bits por peso mediante la variante SAGE-REXL3. Este formato está diseñado para ExLlamaV3 y permite reducir el espacio en VRAM frente a los pesos originales en bf16/fp16, a costa de una posible pérdida de precisión que no se ha cuantificado en la información disponible.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento, código y matemáticas: no disponible (no se documentan capacidades específicas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en GPU de consumo: la cuantización a 4,50 bpw y el tamaño de 17,3 GB permiten cargar el modelo con ExLlamaV3 en tarjetas de gama alta con suficiente VRAM, algo inviable con los pesos originales en bf16.
- Prototipado de asistentes conversacionales: el pipeline `text-generation` y la etiqueta `conversational` lo orientan a chat multi-turno, aunque la ausencia de datos de contexto impide planificar ventanas largas con garantías.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad de EXL3 a 4,50 bpw frente a otras variantes del mismo autor (por ejemplo, la versión DFlash2-SAGE-EXL3-5.0bpw o la GGUF).
- Inferencia de bajo coste en servidores con una sola GPU: el formato EXL3 está optimizado para ExLlamaV3, lo que facilita servir el modelo con menor huella de memoria que un checkpoint completo.
- Investigación sobre formatos de compresión: útil para estudiar el equilibrio entre bits por peso y calidad en modelos de la familia Qwen3.5.
- Pruebas de integración con exllamav3: permite validar pipelines de inferencia y herramientas del ecosistema ExLlama antes de adoptar variantes de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,3 GB, por lo que se requiere al menos esa cantidad de VRAM más el espacio para caché KV y overhead de ExLlamaV3; una estimación conservadora sitúa el mínimo práctico en torno a 20-24 GB.
- GPU recomendadas: no disponible de forma explícita; por capacidad de VRAM encajan tarjetas de 24 GB o más (RTX 4090, RTX 3090, A100, H100).
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090/3090 (24 GB) con margen limitado; en tarjetas de 16 GB o menos no cabría sin reducir contexto o emplear otras variantes.
- Opciones de despliegue: exllamav3 (formato nativo EXL3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; para llama.cpp el autor publica una variante GGUF separada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vcruz305/Qwen3.8-27B-SAGE-REXL3-4.50bpw | 8.631.286.784 (medidos) | no disponible | EXL3 safetensors | apache-2.0 | Objeto de esta ficha; acceso gated |
| vcruz305/Qwen3.8-27B-DFlash2-SAGE-EXL3-5.0bpw | no disponible | no disponible | EXL3 safetensors | no disponible | Misma familia y autor, cuantización a 5,0 bpw |
| vcruz305/Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | no disponible | Misma familia y autor, orientado a llama.cpp |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | safetensors | no disponible | Modelo original sin cuantizar |

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "27B" pero los safetensors contienen 8.631.286.784 parámetros; conviene verificar el modelo base antes de usarlo en producción.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas.
- Pérdida de precisión por cuantización: 4,50 bpw introduce degradación respecto a los pesos originales; no se han publicado evaluaciones que la cuantifiquen.
- Información incompleta: sin README sustantivo, sin idiomas declarados y sin benchmarks; no se puede evaluar el rendimiento real.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones.
- Sesgos: no documentados.
- Restricciones de licencia: se declara apache-2.0, pero al ser una obra derivada conviene confirmar los términos del modelo base `Qwen/Qwen3.8-27B` antes de uso comercial.
- Compatibilidad limitada: el formato EXL3 solo funciona con exllamav3; para otros motores hay que recurrir a las variantes GGUF del mismo autor.

## Enlaces

- [Hugging Face: vcruz305/Qwen3.8-27B-SAGE-REXL3-4.50bpw](https://huggingface.co/vcruz305/Qwen3.8-27B-SAGE-REXL3-4.50bpw)
- [Variante DFlash2-SAGE-EXL3-5.0bpw](https://huggingface.co/vcruz305/Qwen3.8-27B-DFlash2-SAGE-EXL3-5.0bpw)
- [Variante GGUF (README)](https://huggingface.co/vcruz305/Qwen3.8-27B-GGUF/blob/main/README.md)
- Modelo base: `Qwen/Qwen3.8-27B` (referenciado en las etiquetas; enlace directo no disponible en la búsqueda)
