# ussipan/sipangpt-gemma-4-e2b-it-gguf

## Resumen

sipangpt-gemma-4-e2b-it-gguf es una conversión al formato GGUF de un modelo multimodal (visión-lenguaje) perteneciente a la familia Gemma 4, en su variante E2B instruction-tuned, publicada por el usuario ussipan. La conversión se ha realizado con la herramienta Unsloth y está orientada a su ejecución con llama.cpp y, para la parte multimodal, con el binario llama-mtmd-cli. El modelo cuenta con 4.628.569.635 parámetros totales (aproximadamente 4,63 mil millones) y el repositorio ocupa 4,4 GB.

La relevancia de esta publicación radica en que empaqueta un modelo multimodal listo para inferencia local en formato GGUF, lo que permite desplegarlo en hardware de consumo sin necesidad de infraestructura de servidor dedicada. La nomenclatura E2B, heredada de la convención de la familia Gemma, sugiere un diseño orientado a parámetros efectivos reducidos, aunque la model card no ofrece detalles arquitectónicos al respecto.

La información publicada es muy limitada: la model card se reduce a una nota sobre la conversión a GGUF, dos comandos de ejemplo y el listado de ficheros disponibles. No se especifican licencia, idiomas soportados, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones que siguen figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de visión-lenguaje; sin detalles en la model card) |
| Parametros totales | 4.628.569.635 (aproximadamente 4,63 mil millones) |
| Parametros activos | no disponible (el sufijo "E2B" sugiere un diseño de parametros efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyeccion multimodal mmproj) y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo se presenta como un vision-language model, según la etiqueta declarada por el autor, lo que implica que combina un codificador de visión con un decodificador de lenguaje. La presencia del fichero `gemma-4-E2B-it.BF16-mmproj.gguf` confirma la existencia de una proyección multimodal (mmproj) necesaria para procesar imágenes dentro de llama.cpp. La conversión a GGUF se realizó con Unsloth, y el sufijo "it" indica que se trata de la variante ajustada para instrucciones y uso conversacional.

Más allá de estos datos, la información proporcionada no incluye detalles sobre la arquitectura interna (si es un transformer denso, un esquema de parámetros efectivos tipo MatFormer o una mezcla de expertos), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La nomenclatura E2B, propia de la familia Gemma, apunta a una arquitectura pensada para reducir el coste computacional mediante parámetros efectivos, pero no hay confirmación explícita en la model card.

## Capacidades

- Generación de texto conversacional, dado que el modelo está etiquetado como conversacional y con sufijo "it" (instruction-tuned).
- Procesamiento de imágenes y texto de forma conjunta (modelo de visión-lenguaje), habilitado por la proyección multimodal incluida en los ficheros GGUF.
- Ejecución local mediante llama.cpp, tanto en modo solo texto (`llama-cli`) como multimodal (`llama-mtmd-cli`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) según las etiquetas del repositorio.
- Soporte de plantillas de chat mediante el flag `--jinja` en los comandos de ejemplo.

No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, modo de pensamiento explícito ni cobertura multilingüe concreta.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno ejecutándose íntegramente en local mediante llama.cpp, lo que resulta adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a servicios externos.
- Descripción de imágenes en local: gracias a la proyección multimodal y a `llama-mtmd-cli`, se puede usar para generar pies de foto o descripciones automáticas de imágenes sin depender de APIs en la nube.
- Extracción de información de documentos escaneados: combinando entrada de imagen con generación de texto, podría emplearse para transcribir o resumir capturas y documentos visuales, siempre que la calidad real del modelo se valide con pruebas propias.
- Prototipado rápido de aplicaciones multimodales: al estar en GGUF y ser compatible con llama.cpp y herramientas como LM Studio u Ollama, sirve como base ligera para experimentar con pipelines de visión-lenguaje antes de escalar a modelos mayores.
- Pruebas de concepto educativas: su tamaño moderado y la posibilidad de ejecutarlo en hardware de consumo lo hacen apto para docencia y experimentación en investigación sobre modelos multimodales.
- Integración en aplicaciones de escritorio offline: el formato GGUF y el tamaño del repositorio (4,4 GB) permiten empaquetarlo dentro de aplicaciones de escritorio que requieran funciones de chat y análisis de imágenes sin conexión.

Dado que no hay benchmarks ni evaluación publicada, la idoneidad de estos casos debe verificarse empíricamente antes de llevarlos a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluación multimodal ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 4,63 mil millones de parámetros):
  - Cuantización Q4_K_M: aproximadamente 3 GB para los pesos, más la proyección multimodal y la caché KV; en torno a 4-6 GB en total en funcionamiento.
  - Cuantización BF16: aproximadamente 9,3 GB para los pesos, más mmproj y caché KV; en torno a 10-12 GB en total.
- GPU recomendadas: para Q4_K_M basta una GPU de 8 GB o superior (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060). Para BF16 se recomienda una GPU de 12-16 GB o superior (RTX 4080, RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: sí, especialmente en cuantización Q4_K_M, que cabe en la mayoría de tarjetas de gama media actuales.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), Ollama y LM Studio mediante importación del GGUF. El soporte multimodal en vLLM y TGI es limitado para GGUF, por lo que se recomienda llama.cpp para explotar la visión.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros y no proceden de mediciones publicadas por el autor.

## Comparativa con modelos similares

La información proporcionada no incluye datos verificados de los modelos alternativos. La siguiente tabla recoge únicamente los datos confirmados de este modelo y marca como no disponibles los del resto, que se citan a título de categoría comparable.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sipangpt-gemma-4-e2b-it-gguf | 4,63 mil millones | no disponible | no disponible | GGUF | HuggingFace (ussipan) |
| Gemma 3n E2B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Gemma 3 4B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-VL-3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Se recomienda realizar una evaluación propia antes de asumir equivalencias: la model card de este repositorio no publica métricas que permitan una comparación objetiva con alternativas de la misma categoría (modelos multimodales de 3 a 5 mil millones de parámetros).

## Limitaciones y advertencias

- La model card es mínima y no documenta sesgos conocidos, composición del dataset ni procesos de alineación, por lo que no es posible evaluar sesgos de forma informada.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas que midan la fiabilidad factual del modelo.
- La licencia no está declarada en el repositorio, lo que impide confirmar si se permite el uso comercial. Se debe contactar con el autor o revisar la licencia del modelo base antes de usarlo en producción.
- No se especifican los idiomas soportados; el rendimiento en castellano u otros idiomas distintos del inglés es desconocido.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación previa.
- Se trata de una conversión de un tercero (ussipan) sobre un modelo base de la familia Gemma 4; la fidelidad respecto al modelo original no está garantizada ni verificada en la información disponible.
- El número de descargas (23) y de likes (0) sugiere una adopción muy baja, lo que implica poca validación comunitaria del comportamiento real del modelo.
- La fecha de creación registrada (2026) y la nomenclatura del modelo requieren verificación adicional, ya que no se dispone de documentación oficial asociada en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/ussipan/sipangpt-gemma-4-e2b-it-gguf
- Unsloth (herramienta de conversión citada en la model card): https://github.com/unslothai/unsloth

No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
