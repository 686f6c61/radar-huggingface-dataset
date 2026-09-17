# vissarionovich/Skyfall-31B-v4.2-NVFP4

## Resumen

Skyfall-31B-v4.2-NVFP4 es una conversión de cuantización del modelo TheDrummer/Skyfall-31B-v4.2, publicada por el usuario vissarionovich. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de un checkpoint cuantizado a NVFP4 (formato de coma flotante de 4 bits definido por NVIDIA) generado con LLM Compressor. El objetivo es reducir el peso en memoria de un modelo de 31.352.980.480 parámetros para que pueda servirse en GPU con tensor cores de quinta generación, manteniendo el comportamiento del original.

El repositorio contiene pesos en safetensors en formato compressed-tensors y ocupa 19,6 GB, frente a los aproximadamente 62 GB que exigiría el mismo modelo en BF16. La calibración se hizo en un solo paso (*one-shot*) con 128 muestras de HuggingFaceH4/ultrachat_200k a una longitud de secuencia de 4096 tokens, cuantizando todas las capas `Linear` y dejando `lm_head` en precisión original.

La relevancia de esta ficha es acotada y conviene ser explícito: el autor indica en la propia model card que el modelo "aún no se ha probado" y que sigue un tutorial, el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas, no publica benchmarks y no hay evaluación de degradación frente al modelo base. Por tanto, debe tratarse como un artefacto experimental de cuantización, no como un modelo listo para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio incluye la etiqueta `mistral` y deriva del modelo base TheDrummer/Skyfall-31B-v4.2; no se detalla la arquitectura interna |
| Parámetros totales | 31.352.980.480 (≈31,35 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits, FP4 con escalas de bloque) sobre capas `Linear`; `lm_head` sin cuantizar. Las etiquetas del repositorio indican además `8-bit` y `compressed-tensors` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors con esquema compressed-tensors |
| Modelo base | TheDrummer/Skyfall-31B-v4.2 |
| Tamaño del repositorio | 19,6 GB |
| Dataset de calibración | HuggingFaceH4/ultrachat_200k (128 muestras, secuencia de 4096 tokens) |
| Herramienta de cuantización | LLM Compressor (vllm-project) |
| Fecha de publicación | 17 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento: no se documentan número de tokens, composición del dataset de preentrenamiento, ni si hubo RLHF, DPO u otra etapa de alineamiento. Lo único verificable es que el repositorio declara la etiqueta `mistral` y que el modelo tiene 31.352.980.480 parámetros.

Lo que sí está documentado es el procedimiento de cuantización. Se aplicó una receta `QuantizationModifier(targets="Linear", scheme="NVFP4", ignore=["lm_head"])` ejecutada con LLM Compressor en modo *one-shot*, sin reentrenamiento ni ajuste posterior. La calibración usó 128 muestras del dataset HuggingFaceH4/ultrachat_200k con longitud de secuencia 4096, un volumen muy reducido que en la práctica implica estimar los rangos de activación con cobertura limitada de dominios e idiomas. El formato NVFP4, según la especificación de NVIDIA, codifica cada peso en 4 bits con formato E2M1 y usa escalas de bloque (típicamente una escala FP8 E4M3 por bloque de 16 elementos más una escala global), lo que proporciona más rango dinámico que una cuantización entera de 4 bits a costa de exigir soporte hardware específico. Al excluir `lm_head`, la capa de proyección al vocabulario conserva mayor precisión, pero también implica que el ahorro de memoria no es uniforme en todo el grafo.

## Capacidades

- Generación de texto y conversación multiturno: capacidad heredada del modelo base. La elección de un corpus de diálogo (ultrachat_200k) como datos de calibración sugiere que el perfil de activaciones dominante es conversacional, pero no hay evaluación publicada.
- Razonamiento, matemáticas y generación de código: no disponible. No se documenta ningún resultado en estas áreas.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible; el dataset de calibración es predominantemente en inglés, lo que puede sesgar la calibración de rangos hacia ese idioma.
- Modo de razonamiento explícito (*thinking*), visión, audio u otras modalidades: no documentado.
- Inferencia eficiente en 4 bits: es la única capacidad diferencial verificable del artefacto, y depende de que el hardware destino soporte NVFP4 de forma nativa.

## Casos de uso

- Servicio de chat multi-turno con restricción de VRAM: en lugar de desplegar el modelo base en BF16 (≈62 GB de pesos), esta versión reduce la huella a ≈16 GB de pesos, lo que permite servir el modelo en una sola GPU de 24-32 GB con vLLM, siempre que la calidad medida sea aceptable.
- Despliegue en GPU Blackwell para maximizar throughput: NVFP4 está pensado para los tensor cores de quinta generación, de modo que el caso de uso natural es inferencia por lotes en B200, GB200, RTX 5090 o RTX PRO 6000 Blackwell, donde el formato puede acelerar las multiplicaciones matriciales además de ahorrar memoria.
- Servicio de asistencia conversacional en dominios acotados: el modelo puede gestionar diálogos multiturno sobre documentación interna o FAQ, con la salvedad de que la ventana de contexto no está documentada y hay que medirla antes de dimensionar el prompt.
- Evaluación comparativa de degradación por cuantización: es un caso de uso inmediato y realista, ya que el propio autor no ha publicado pruebas; la utilidad del artefacto hoy es servir de sujeto de ensayo frente al modelo base en BF16 con un conjunto de evaluación propio.
- Generación de texto creativo y narrativa en local: un modelo de 31B en 4 bits cabe en hardware de gama alta de consumo, lo que permite ejecutar tareas de escritura asistida sin conexión, sujeto a la licencia (no declarada) y a la validación de calidad.
- Procesamiento por lotes y generación de datos sintéticos: al reducirse los requisitos de memoria, se pueden levantar varias réplicas en un mismo nodo para tareas de *offline batch inference*, siempre que la licencia del modelo base lo permita.
- Plataforma de referencia para pipelines de cuantización: sirve como ejemplo reproducible de una receta NVFP4 con LLM Compressor para equipos que quieran cuantizar sus propios modelos con el mismo esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación, no hay métricas de perplejidad ni comparación con el modelo base, y las búsquedas web realizadas no devolvieron documentación técnica sobre este repositorio (los resultados obtenidos correspondían a un portal de noticias sin relación con el modelo).

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros y del formato de cuantización; no proceden de mediciones publicadas por el autor.

- Pesos en NVFP4: 31,35 mil millones de parámetros × 0,5 bytes ≈ 15,7 GB, más escalas de bloque y metadatos, lo que explica el tamaño de repositorio de 19,6 GB.
- VRAM estimada para inferencia: ≈20-24 GB con contexto corto y lotes pequeños (pesos + caché KV + activaciones); a partir de 32 GB se dispone de margen cómodo. Cifras orientativas, dependientes de la longitud de contexto real, que no está documentada.
- GPU recomendadas: B200, GB200 y RTX PRO 6000 Blackwell para aprovechar las rutas nativas de FP4. En RTX 5090 (32 GB) el modelo cabe, pero conviene verificar el soporte efectivo de los kernels NVFP4 en la pila de software utilizada.
- GPU con soporte limitado: en arquitecturas Hopper (H100/H200) y Ada (RTX 4090, L40S) no existe soporte nativo de FP4 de 4 bits; el checkpoint puede requerir descompresión o una ruta alternativa, con menor ganancia o con incompatibilidad directa. En una RTX 4090 de 24 GB el modelo entra en tamaño, pero no se debe asumir la aceleración del formato.
- Opciones de despliegue: vLLM es la vía natural, dado que LLM Compressor forma parte del mismo proyecto y genera checkpoints compressed-tensors compatibles. TensorRT-LLM es otra alternativa en hardware NVIDIA. llama.cpp y Ollama no consumen NVFP4 de forma nativa, por lo que requerirían reconvertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de *time to first token*.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de licencia que permitan una comparación funcional con alternativas. La comparación factible es de formato y huella de memoria, con cifras estimadas a partir del recuento de parámetros.

| Modelo / formato | Parámetros | Peso aproximado | Licencia | Disponibilidad |
|---|---|---|---|---|
| vissarionovich/Skyfall-31B-v4.2-NVFP4 | 31,35 mil millones | 19,6 GB (tamaño real del repositorio) | No disponible | HuggingFace, 0 descargas |
| TheDrummer/Skyfall-31B-v4.2 (base, BF16) | 31,35 mil millones | ≈62,7 GB (estimado) | No disponible | HuggingFace |
| Mismo modelo en GGUF Q4_K_M | 31,35 mil millones | ≈18-19 GB (estimado) | No disponible | No confirmada para este modelo |
| Mismo modelo en AWQ o GPTQ de 4 bits | 31,35 mil millones | ≈17-19 GB (estimado) | No disponible | No confirmada para este modelo |

No se identifican en la información proporcionada modelos de terceros comparables en parámetros, contexto y licencia con datos de rendimiento publicados, por lo que la comparación con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor afirma explícitamente que el modelo no se ha probado todavía. No hay benchmarks, ni perplejidad, ni comparación con el modelo base.
- Degradación por cuantización agresiva: pasar a 4 bits puede deteriorar tareas sensibles a la precisión numérica (matemáticas, código, instrucciones largas). El impacto real es desconocido y debe medirse antes de cualquier uso serio.
- Calibración mínima: 128 muestras de un único dataset de chat, predominantemente en inglés, es una cobertura muy reducida. Los rangos de activación estimados pueden ser malos fuera de ese dominio y de ese idioma.
- Contradicción en los metadatos: el nombre del modelo indica NVFP4 y la model card aplica la receta NVFP4, pero las etiquetas del repositorio incluyen `8-bit`. Conviene inspeccionar la configuración de cuantización antes de desplegar.
- Licencia no declarada: no hay información sobre la licencia del checkpoint ni sobre la del modelo base. No se puede asumir uso comercial sin verificar la licencia de TheDrummer/Skyfall-31B-v4.2.
- Idiomas y contexto sin especificar: no se documenta la ventana de contexto ni los idiomas soportados, lo que impide dimensionar correctamente prompts y caché KV.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, sin pipeline declarado en HuggingFace. No hay señal externa de que el checkpoint cargue correctamente en ningún framework.
- Dependencia de hardware: el formato NVFP4 está ligado a las GPU Blackwell. Desplegarlo en Hopper o Ada puede implicar rutas no nativas o falta de soporte.
- Sesgos y alucinación: no documentados. Se heredan del modelo base, con el agravante de que la cuantización puede amplificar la generación de contenido incoherente en dominios poco representados en la calibración.
- Artefacto no reentrenable: al ser un checkpoint cuantizado one-shot, no es adecuado como punto de partida para ajuste fino adicional sin volver al modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vissarionovich/Skyfall-31B-v4.2-NVFP4
- Modelo base: https://huggingface.co/TheDrummer/Skyfall-31B-v4.2
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- vLLM: https://github.com/vllm-project/vllm
- Nota sobre la búsqueda web: los resultados obtenidos no contenían información técnica sobre este modelo (correspondían a klix.ba, un portal de noticias sin relación con el repositorio).
