# tianxinwei/JevAny-27B-RLCR

## Resumen

JevAny-27B-RLCR es un adaptador LoRA (librería PEFT) publicado por el usuario tianxinwei que convierte un modelo base de 27B en un clasificador de decisiones con calibración explícita. El modelo no genera razonamiento: su tarea es emitir una decisión de tipo texto (etiqueta) acompañada de un nivel de confianza, de forma que el sistema pueda distinguir entre preguntas "conocibles" y "no conocibles" y abstenerse cuando no alcanza el umbral de fiabilidad. Se distribuye como checkpoint v0.1.0, continúa al checkpoint supervisado JevAny-27B-SFT v0.1.0 y se presenta como la versión recomendada de esa familia.

La relevancia del modelo está en su objetivo declarado: no mejorar la precisión, sino la calibración y la predicción selectiva. El autor reporta explícitamente que, frente al SFT, la precisión cambió solo +0,48 puntos porcentuales con un test de McNemar exacto de p=0,332, es decir, sin significación estadística, mientras que la ganancia real se concentra en el Brier score calibrado (0,269) y en la cobertura al 5% de error empírico (54,11%). Es, por tanto, una pieza pensada para pipelines que necesitan saber cuándo no responder, más que para generar texto abierto.

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.8-27B, pero el repositorio solo contiene el adaptador (0,5 GB), no los pesos completos. Su envolvente de entrenamiento es de 2.048 tokens empaquetados y la ruta de publicación es únicamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B; detalles internos del transformer base no disponibles |
| Parametros totales | 27B nominales del modelo base; el repositorio contiene unicamente el adaptador (0,5 GB) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible; la envolvente de entrenamiento es de 2.048 tokens empaquetados |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documentan cuantizaciones del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La ficha del autor no describe la arquitectura interna del modelo base, que se identifica como Qwen/Qwen3.8-27B. Lo que se publica es un adaptador LoRA que se monta sobre ese modelo y lo especializa como modelo de decisión con salida de clasificación (pipeline declarado: text-classification). El entrenamiento parte del checkpoint supervisado parent, JevAny-27B-SFT v0.1.0, y aplica aprendizaje por refuerzo únicamente sobre la decisión, con recompensas de calibración (RLCR).

Los datos de entrenamiento combinan ejemplos difíciles, replay amplio, decisiones composicionales, decisiones de política y pares conocer/no conocer. El objetivo es RLCR con ventaja relativa de grupo, anclado por una entropía cruzada supervisada, y la temperatura de calibración se ajusta en una partición de desarrollo separada. El autor advierte de que este checkpoint no reproduce los rollouts de razonamiento del artículo sobre RLCR y que no es un modelo de razonamiento generado.

## Capacidades

- Clasificación de decisión con etiqueta de salida, no generación de razonamiento abierto.
- Emisión de una puntuación de confianza calibrada que permite umbrales de abstención.
- Predicción selectiva: cobertura del 54,11% con un error empírico no superior al 5% en el panel transfer-v9.
- Distinción entre preguntas conocibles y explícitamente no conocibles (confianza media de 0,428 en no conocibles, ninguna por encima de 0,9).
- Razonamiento de decisión composicional, según los datos de entrenamiento declarados.
- Ruta de publicación solo texto: sin visión, audio ni multimodalidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor indica explícitamente que no es un modelo de razonamiento generado).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento con abstención en atención al cliente: el clasificador decide si una consulta entra en el ámbito que el sistema puede resolver y, cuando la confianza no supera el umbral calibrado, la deriva a un agente humano en lugar de generar una respuesta arriesgada.
- Filtro previo en pipelines RAG: antes de invocar un modelo generador, JevAny-27B-RLCR etiqueta si la pregunta es respondible con los documentos disponibles; con una cobertura del 54,11% al 5% de error empírico se reduce el coste de generación y el riesgo de alucinación en el tramo no cubierto.
- Triaje de tickets en soporte técnico: clasificación de categoría o severidad con una confianza que permite separar los casos de automatización directa de los que requieren revisión.
- Moderación y etiquetado de contenido a escala: la puntuación de confianza calibrada facilita auditorías de calidad del etiquetado, ya que el sistema conoce su propia fiabilidad por caso.
- Validación de respuestas en entornos regulados: usar la señal de "no conocible" como control de seguridad antes de publicar una respuesta automática, con umbrales ajustados a la política interna.
- Detección de preguntas fuera de distribución: las preguntas no conocibles reciben confianzas bajas de forma sistemática, lo que sirve como detector de entradas fuera del dominio de entrenamiento.
- Benchmark interno de calibración: comparar la temperatura ajustada y el Brier score del modelo contra alternativas propias antes de desplegar cualquier clasificador en producción.

## Benchmarks y rendimiento

Resultados reportados por el autor en el panel de desarrollo retenido `transfer-v9`:

| Metrica | Valor |
|---|---|
| Precision en preguntas conocibles | 81,84% |
| Precision en MMLU-Pro | 66,00% |
| Brier score calibrado | 0,269 |
| Cobertura con error empirico <= 5% | 54,11% |
| Confianza media en preguntas explicitamente no conocibles | 0,428 |
| Confianza en no conocibles >= 0,9 | Ninguna |
| Latencia mediana (una pregunta, H200) | 153,75 ms |
| Delta de precision frente a JevAny-27B-SFT v0.1.0 | +0,48 puntos porcentuales (McNemar exacto, p=0,332) |

No se han publicado resultados comparativos con modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio solo aporta el adaptador (0,5 GB), por lo que el coste real lo determina el modelo base de 27B. Como referencia orientativa derivada del recuento de parámetros: en fp16 aproximadamente 54 GB, en int8 aproximadamente 27 GB y en cuantización de 4 bits aproximadamente 14-16 GB, más el espacio de activaciones y caché KV.
- GPU recomendadas: el autor reporta latencias medidas en H200; para servir el modelo base en precisión completa son necesarias A100 80 GB, H100 o H200. En consumer, una RTX 4090 (24 GB) solo es viable con cuantizaciones agresivas de 4 bits y contexto corto.
- Encaje en GPU de consumo: posible únicamente con cuantización de 4 bits y técnicas de offload; no confirmado por el autor.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; el resto de opciones (vLLM con soporte LoRA, llama.cpp/Ollama previa conversión a GGUF y fusión del adaptador, TGI) son viables en principio pero no están documentadas en la información proporcionada.
- Latencia y throughput: 153,75 ms de mediana por pregunta única en H200; no se han publicado cifras de throughput en lote.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables de la misma categoria. La comparacion posible se limita a los eslabones de la propia familia:

| Modelo | Parametros | Contexto | Precision / calibracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevAny-27B-RLCR | 27B (adaptador LoRA) | No disponible (entrenamiento a 2.048 tokens) | 81,84% conocibles; Brier 0,269; cobertura 54,11% al 5% | Apache 2.0 | Publicado en HuggingFace, 0 descargas |
| JevAny-27B-SFT v0.1.0 | 27B (checkpoint padre) | No disponible | Precision 0,48 puntos porcentuales inferior a RLCR; calibracion no reportada | No disponible | No disponible |
| Qwen/Qwen3.8-27B | 27B | No disponible | No disponible | No disponible | Modelo base referenciado |

## Limitaciones y advertencias

- No es un modelo de razonamiento generado: no reproduce los rollouts de razonamiento del artículo sobre RLCR, por lo que no debe usarse como sustituto de un modelo generativo de cadena de pensamiento.
- El autor declara explícitamente que la mejora de precisión frente al SFT no es estadísticamente significativa (p=0,332); el argumento de venta es la calibración, no la exactitud.
- Las puntuaciones de confianza requieren validación específica para cada despliegue antes de usarse como umbral de abstención en producción.
- La envolvente de entrenamiento es de 2.048 tokens empaquetados; entradas más largas en servicio no fueron entrenadas como capacidad de primera clase.
- Ruta solo texto: sin capacidades multimodales.
- Idiomas soportados no disponibles; no hay garantía de comportamiento multilingüe más allá del modelo base.
- Sin datos de sesgo, robustez adversaria ni evaluación de seguridad publicados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente ni evidencia de uso en producción.
- El identificador del modelo base (Qwen/Qwen3.8-27B) no se corresponde con una nomenclatura verificable en la información disponible; conviene confirmar los pesos exactos antes de integrar el adaptador.
- Licencia Apache 2.0 declarada en el repositorio; el uso comercial del adaptador queda sujeto además a la licencia del modelo base, que no se detalla aquí.
- Al ser un clasificador de decisión, no debe emplearse para generación de texto, código o matemáticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianxinwei/JevAny-27B-RLCR
- Guia de datos del proyecto: https://github.com/weitianxin/JevAny/blob/main/docs/DATA.md
- Repositorio del proyecto (referenciado desde la model card): https://github.com/weitianxin/JevAny
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft y no se han incluido.
