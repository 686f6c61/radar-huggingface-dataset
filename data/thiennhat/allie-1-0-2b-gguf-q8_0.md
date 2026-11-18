# thiennhat/ALLIE.1.0-2b-GGUF-Q8_0

## Resumen

ALLIE.1.0-2b-GGUF-Q8_0 es una cuantizacion en formato GGUF (tipo Q8_0) del modelo ALLIE.1.0-2b, publicado por el usuario thiennhat en Hugging Face. El modelo subyacente es un ajuste fino (fine-tune) de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1.880 millones de parametros (1.881.825.088 segun los pesos en safetensors). El repositorio contiene un unico fichero GGUF de 2.012.012.480 bytes (2,01 GB), pensado para inferencia local en Ollama y en cualquier runtime compatible con GGUF (llama.cpp, LM Studio, etc.).

La relevancia de esta publicacion es practica: ofrece una version de 8 bits casi sin perdida de calidad respecto al modelo FP16 original, con un tamano que permite ejecutarlo en hardware de consumo. Al estar construido sobre Qwen3.5-2B, hereda la arquitectura y el tokenizador de la familia Qwen, aunque el autor no documenta el proceso de ajuste fino, los datos utilizados ni las capacidades finales del modelo.

La informacion disponible es muy limitada: el autor indica que solo se ha probado la generacion de texto de forma local y que la calidad de las respuestas y la entrada de imagenes aun no se han evaluado. No hay datos publicados de benchmarks, idiomas soportados ni detalles sobre el entrenamiento. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, pero conviene verificar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero ALLIE.1.0-2b-Q8_0.gguf); safetensors FP16 en repo separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-2B, por lo que su arquitectura de base corresponde a la familia Qwen3.5 en su variante de 2B parametros: un transformer denso (no se documenta que sea Mixture of Experts) con 1.881.825.088 parametros totales. El repositorio solo contiene los pesos cuantizados a Q8_0; no se aportan detalles sobre la arquitectura interna, el tokenizador, la longitud de contexto nativa ni posibles innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.).

No hay informacion sobre el proceso de ajuste fino de ALLIE.1.0-2b: se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT, y cual fue el objetivo del fine-tune. El autor unicamente menciona que el modelo esta pensado para generacion de texto local en Ollama y que la cuantizacion Q8_0 se genero a partir de los pesos fusionados en FP16, disponibles en un repositorio aparte.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" sugiere uso en dialogos, aunque no se detalla el formato de prompt.
- Razonamiento y codigo: no disponible (no se documenta ninguna evaluacion al respecto).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Entrada de imagenes: el autor menciona que "image input" aun no se ha evaluado, lo que sugiere que el modelo base podria tener capacidad multimodal, pero no se confirma ni se documenta.
- Modo thinking: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el fichero GGUF Q8_0 de 2 GB se puede cargar en Ollama o llama.cpp en un portatil, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Pruebas de integracion con endpoints compatibles: el tag "endpoints_compatible" indica que puede servirse detras de una API compatible con OpenAI, util para validar pipelines de aplicaciones antes de migrar a modelos mayores.
- Generacion de texto offline en entornos con conectividad limitada: al ser un modelo pequeno y cuantizado, cabe en equipos sin GPU dedicada y permite tareas de redaccion o resumen de baja exigencia.
- Evaluacion comparativa de fine-tunes sobre Qwen3.5-2B: util para investigadores que quieran medir el efecto del ajuste fino de ALLIE frente al modelo base en tareas concretas, siempre que se validen previamente las capacidades.
- Educacion y experimentacion: sirve para demostrar el flujo completo de cuantizacion GGUF, carga en Ollama y generacion local con un modelo de menos de 2.000 millones de parametros.
- Base para pruebas de regresion de infraestructura: su tamano reducido permite desplegarlo en CI para validar servidores de inferencia (vLLM con soporte GGUF, llama.cpp server) sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 2,01 GB; con overhead de contexto y cache KV, se puede ejecutar con aproximadamente 3-4 GB de memoria, aunque la cifra exacta depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPUs de gama alta (A100, H100, RTX 4090) el modelo queda sobradamente holgado y el cuello de botella sera la CPU o el ancho de banda.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Ollama (mencionado explicitamente por el autor), llama.cpp, LM Studio, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere soporte para APIs estilo OpenAI.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ALLIE.1.0-2b-GGUF-Q8_0 | 1.881.825.088 | no disponible | Apache 2.0 | GGUF Q8_0 | Fine-tune de Qwen3.5-2B; sin benchmarks publicados |
| Qwen/Qwen3.5-2B (base) | ~2B (segun nombre) | no disponible | no disponible en la informacion | safetensors | Modelo original sin ajuste fino; referencia directa |
| ALLIE.1.0-2b-FP16 | 1.881.825.088 | no disponible | Apache 2.0 | safetensors FP16 | Version sin cuantizar del mismo modelo, enlazada por el autor |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, codigo o matematicas; el autor admite que la calidad de las respuestas no se ha evaluado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de evaluacion; no debe usarse en produccion sin validacion previa.
- Idiomas no documentados: se desconoce el soporte real de castellano u otras lenguas; el modelo base Qwen suele estar orientado a ingles y chino, pero no se confirma.
- Capacidad multimodal incierta: el autor menciona "image input" sin evaluar, lo que genera ambiguedad sobre si el modelo acepta imagenes; no asumir soporte de vision.
- Contexto desconocido: no se indica la longitud de contexto nativa ni la configurada en el GGUF, lo que afecta al diseno de aplicaciones con conversaciones largas.
- Licencia: se declara Apache 2.0, pero conviene verificar la licencia del modelo base Qwen3.5-2B antes de un uso comercial, ya que el fine-tune hereda sus condiciones.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el modelo.
- Fecha de creacion futura en los metadatos (2026-11-18): posible inconsistencia en el registro de Hugging Face que conviene tener en cuenta al citar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thiennhat/ALLIE.1.0-2b-GGUF-Q8_0
- Descarga directa del GGUF Q8_0: https://huggingface.co/thiennhat/ALLIE.1.0-2b-GGUF-Q8_0/resolve/main/ALLIE.1.0-2b-Q8_0.gguf
- Pesos FP16 en safetensors: https://huggingface.co/thiennhat/ALLIE.1.0-2b-FP16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
