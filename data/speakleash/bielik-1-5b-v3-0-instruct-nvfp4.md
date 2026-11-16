# speakleash/Bielik-1.5B-v3.0-Instruct-NVFP4

## Resumen

Bielik-1.5B-v3.0-Instruct-NVFP4 es una versión cuantizada en formato NVFP4 del modelo Bielik-1.5B-v3.0-Instruct, desarrollado por SpeakLeash, una comunidad polaca centrada en la creación de recursos lingüísticos y modelos de lenguaje para el idioma polaco. El modelo original es un transformer denso de 1.596.507.648 parámetros (aproximadamente 1,5 mil millones) afinado para instrucciones, y esta variante aplica cuantización de pesos y activaciones a 4 bits en formato NVFP4.

La relevancia de esta ficha radica en que se trata de una cuantización agresiva orientada a reducir el coste de memoria y el ancho de banda en inferencia, manteniendo la licencia permisiva Apache 2.0 del modelo base. El repositorio ocupa 1,0 GB y se distribuye en safetensors con la librería compressed-tensors, lo que facilita su carga en stacks compatibles con cuantización de NVIDIA.

No obstante, la información publicada por el autor es mínima: la model card solo indica el modelo de origen, la revisión exacta y el formato de cuantización. No se detallan datos de entrenamiento, benchmarks ni recetas de calibración, por lo que muchos apartados de esta ficha se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama, segun tag `llama`) |
| Parametros totales | 1.596.507.648 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones a 4 bits), 8-bit segun tag |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo decoder-only, etiquetado como `llama` en Hugging Face, con 1.596.507.648 parámetros. Esta variante no modifica la arquitectura: aplica cuantización NVFP4 a pesos y activaciones, un formato de 4 bits con escala por bloque pensado para hardware NVIDIA reciente. El autor no publica la receta de calibración, el conjunto de datos de calibración ni el error de cuantización respecto al modelo original.

Respecto al entrenamiento del modelo base Bielik-1.5B-v3.0-Instruct, la información disponible en esta ficha no incluye el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. La model card de esta cuantización no aporta detalles adicionales más allá de la revisión de origen (`1907cec498b762e8223b7cffc2b8f279c417a44d`) y del formato NVFP4.

## Capacidades

- Generación de texto en polaco, heredada del modelo base afinado para instrucciones.
- Seguimiento de instrucciones conversacionales (modelo `-Instruct`).
- Razonamiento y respuesta a preguntas en idioma polaco.
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al polaco según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia con pesos y activaciones en NVFP4, orientada a aceleración en GPU NVIDIA compatible.

## Casos de uso

- Asistentes conversacionales en polaco: el modelo puede gestionar diálogos multi-turno en polaco gracias a su ajuste de instrucciones, con un coste de memoria reducido por la cuantización NVFP4.
- Despliegue en entornos con VRAM limitada: al ocupar 1,0 GB el repositorio, es viable ejecutarlo en GPUs de gama media o en instancias compartidas donde un modelo de 1,5B en FP16 no cabría con holgura.
- Procesamiento de texto en pipelines de backend: clasificación, resumen o extracción de información en corpus polacos, integrándolo como servicio interno con latencia baja.
- Prototipado rápido de aplicaciones NLP en polaco: permite validar flujos de producto antes de escalar a modelos mayores, con licencia Apache 2.0 que facilita la experimentación.
- Generación de contenido asistida en polaco: borradores de textos, respuestas a correos o descripciones de producto, con revisión humana posterior.
- Investigación sobre cuantización: sirve como caso de estudio para medir el impacto de NVFP4 en un modelo pequeño y comparar su degradación frente al original en FP16/BF16.
- Educación y demos: despliegue en notebooks o entornos de demostración con recursos modestos, al ser un modelo pequeño y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB en NVFP4; el modelo base en FP16 requeriría aproximadamente 3,2 GB solo para pesos, por lo que la cuantización reduce el requisito a alrededor de 1-1,5 GB de pesos más overhead de activaciones y KV cache.
- GPU recomendadas: hardware NVIDIA con soporte de NVFP4 (generaciones recientes con Tensor Cores FP4). El soporte exacto depende del runtime y de la versión de compressed-tensors.
- GPU de consumo: cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), aunque la aceleración NVFP4 requiere arquitecturas compatibles; en GPUs sin soporte nativo el rendimiento puede degradarse o requerir fallback.
- Opciones de despliegue: no disponibles de forma explícita; el formato compressed-tensors apunta a stacks compatibles con cuantización (por ejemplo, vLLM o TensorRT-LLM con soporte NVFP4), pero el autor no documenta ninguno.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| speakleash/Bielik-1.5B-v3.0-Instruct-NVFP4 | 1,60B | no disponible | Apache 2.0 | safetensors NVFP4 | Esta ficha; cuantización 4 bits |
| speakleash/Bielik-1.5B-v3.0-Instruct | 1,60B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Alternativas de 1-2B para polaco | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el modelo base puede heredar sesgos de sus datos de entrenamiento, no especificados.
- Riesgo de alucinación: inherente a los modelos de 1,5B afinados para instrucciones; no se han publicado evaluaciones de fidelidad.
- Limitaciones de idioma: el modelo está orientado al polaco; su rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Degradación por cuantización: NVFP4 puede introducir pérdida de precisión frente al modelo original; el autor no publica métricas de degradación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de compressed-tensors.
- Compatibilidad de hardware: NVFP4 requiere soporte específico; en GPUs no compatibles el modelo puede no ejecutarse o hacerlo con fallback lento.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct-NVFP4
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
