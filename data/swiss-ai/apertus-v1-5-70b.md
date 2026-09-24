# swiss-ai/Apertus-v1.5-70B

## Resumen

Apertus-v1.5-70B es un modelo de lenguaje multimodal desarrollado por la organización suiza swiss-ai (Swiss AI Initiative), publicado en HuggingFace bajo licencia Apache-2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones de uso antes de descargarlo. Con 72.005.819.139 parámetros (unos 72.000 millones) y un repositorio de 145,6 GB en formato safetensors, se posiciona en la franja de modelos densos de gran tamano orientados a generación de texto y conversación.

La ficha del modelo lo etiqueta como `image-text-to-text`, `multimodal`, `multilingual`, `conversational` y `text-generation`, además de incluir la etiqueta `eval-results`, lo que indica que el autor publica resultados de evaluación junto con los pesos. Su relevancia actual reside en que se trata de una apuesta europea por modelos abiertos de gran escala, con licencia permisiva (Apache-2.0) y capacidades multimodales, un perfil poco frecuente entre los modelos de más de 70.000 millones de parámetros, que suelen publicarse bajo licencias comunitarias restrictivas.

El modelo acumula 17.512 descargas y 103 "me gusta" en el momento de redactar esta ficha, con creación el 24 de julio de 2026 y última actualización el 17 de septiembre de 2026. La información pública disponible no detalla la longitud de contexto, la composición del dataset de entrenamiento ni la arquitectura interna exacta, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (etiquetas `transformers` y `image-text-to-text`; se trata de un modelo multimodal) |
| Parametros totales | 72.005.819.139 (~72.000 millones) |
| Parametros activos | No aplica / no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors; no se confirman versiones GGUF, GPTQ o AWQ oficiales) |
| Idiomas soportados | No disponible (etiqueta `multilingual`, sin listado de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 145,6 GB) |
| Modalidades de entrada | Texto e imagen (pipeline `image-text-to-text`) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Biblioteca compatible | transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas de HuggingFace lo identifican como un modelo compatible con la biblioteca `transformers` y con pipeline `image-text-to-text`, lo que implica la presencia de un componente de codificacion visual acoplado a un decodificador de lenguaje. El tamano del repositorio (145,6 GB) es coherente con pesos en precision bf16/fp16 para 72.000 millones de parametros, mas el codificador de vision y los ficheros auxiliares.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La etiqueta `apertus1p5` sugiere una version 1.5 dentro de la familia Apertus, pero no se aportan notas de version ni detalles sobre que cambia respecto a versiones anteriores. La presencia de la etiqueta `eval-results` indica que el autor publica evaluaciones, si bien los valores concretos no forman parte de la informacion disponible en esta busqueda.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `image-text-to-text` con la etiqueta `conversational`, por lo que esta disenado para mantener dialogos multi-turno.
- Procesamiento multimodal de entrada: acepta imagenes junto con texto, lo que habilita tareas de descripcion de imagenes, respuesta a preguntas visuales y analisis de documentos con imagenes.
- Soporte multilingue: la etiqueta `multilingual` indica cobertura de varios idiomas, aunque no se detalla la lista ni el nivel de competencia por idioma.
- Enfoque en el contexto suizo y europeo: las etiquetas `switzerland` y `swiss-ai` apuntan a un modelo con especial atencion a este ambito linguistico y geografico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional multilingue: el modelo puede gestionar dialogos multi-turno con usuarios en varios idiomas, aprovechando la etiqueta `multilingual` y su pipeline conversacional. Es adecuado para entornos con usuarios de distintos idiomas que requieren respuestas coherentes sin cambiar de modelo.
- Analisis de documentos con imagenes: gracias a la modalidad `image-text-to-text`, se puede emplear para extraer y resumir informacion de facturas, formularios escaneados o capturas de pantalla, combinando OCR implicito con razonamiento textual.
- Atencion al cliente con soporte visual: un sistema de ticketing puede recibir capturas de pantalla o fotografias de productos defectuosos y pedir al modelo que describa el problema y proponga pasos de resolucion.
- Accesibilidad y descripcion de contenido visual: generacion de descripciones textuales de imagenes para usuarios con discapacidad visual o para indexacion semantica de catalogos de imagenes en un CMS.
- Investigacion academica en PLN multilingue: al publicarse bajo Apache-2.0 y con 72.000 millones de parametros, es un candidato para experimentos de ajuste fino (fine-tuning) en lenguas europeas con pocos recursos, sin las restricciones de licencias comunitarias.
- Despliegue en infraestructura europea con requisitos de soberania: organizaciones que necesitan ejecutar modelos de gran tamano en centros de datos propios o en nubes europeas pueden autoalojarlo al ser un modelo de pesos abiertos con licencia permisiva.
- Generacion de contenido asistida por imagen: redaccion de pie de foto, resumenes de presentaciones a partir de diapositivas o generacion de informes a partir de graficos, integrando la informacion visual con la estructura del texto.
- Moderacion y clasificacion de contenido multimodal: evaluacion de publicaciones que combinan texto e imagen, con el modelo como clasificador generativo o como componente de un pipeline de revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace incluye la etiqueta `eval-results`, lo que sugiere que existen evaluaciones publicadas por el autor, pero los valores numericos concretos no se han recuperado en la busqueda realizada. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales sin acceso a la fuente original.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 144-150 GB solo para los pesos, mas overhead de cache KV y activaciones. Requiere al menos 2 GPU de 80 GB (H100, A100 80 GB) con paralelismo de tensor.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 72-80 GB, lo que encaja en una unica GPU de 80 GB (H100, A100 80 GB) o en una configuracion de 2 GPU de 48 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 36-45 GB, viable en una GPU de 48 GB (A6000, L40S, RTX 6000 Ada) o repartido entre 2 GPU de 24 GB.
- GPU de consumo: no cabe completo en una RTX 4090 (24 GB) en 4 bits sin descarga parcial a CPU/RAM. Es posible ejecutarlo con cuantizaciones de 4 bits y offloading a memoria del sistema, a costa de una latencia mucho mayor.
- Opciones de despliegue: al ser un modelo de la biblioteca `transformers`, es compatible con servidores como vLLM y TGI (sujeto a que la arquitectura multimodal este soportada por esas herramientas). Para llama.cpp u Ollama seria necesario disponer de conversiones a GGUF, que no se confirman en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 145,6 GB, por lo que se necesita espacio en disco suficiente para la descarga completa, ademas de margen para cache de compilacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Acceso: al ser un modelo gated, la descarga requiere autenticacion con un token de HuggingFace y la aceptacion previa de las condiciones de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Acceso |
|---|---|---|---|---|---|
| Apertus-v1.5-70B (swiss-ai) | 72.005.819.139 | No disponible | Apache-2.0 | Si (`image-text-to-text`) | Gated en HuggingFace |
| Llama-3.3-70B-Instruct (Meta) | ~70.600 millones | 128.000 tokens | Llama 3.3 Community License | No (solo texto) | Abierto en HuggingFace |
| Qwen2.5-72B-Instruct (Alibaba) | ~72.700 millones | 32.768 tokens nativos, ampliable | Licencia Qwen | No (solo texto) | Abierto en HuggingFace |
| Apertus-v1.5-70B frente a alternativas | Mismo orden de magnitud (~70-73B) | No comparable al no disponerse del dato | Apache-2.0, la mas permisiva de las tres | Unica opcion multimodal del grupo | Gated, requiere aceptacion |

Los datos de parametros, contexto y licencia de los modelos comparados corresponden a sus fichas publicas y pueden variar con actualizaciones posteriores. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que no se pueden establecer conclusiones de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada. Al ser un modelo con foco suizo y europeo, es probable que su cobertura linguistica este desequilibrada hacia esos idiomas, pero esto no se ha confirmado con datos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano. No se han publicado tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar un rendimiento estable en tareas de contexto largo (analisis de documentos extensos, resumen de repositorios de codigo, etc.).
- Limitaciones de idioma: la etiqueta `multilingual` no viene acompanada de un listado de idiomas ni de metricas por lengua. No se puede asumir un rendimiento homogeneo en castellano.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero al tratarse de un modelo gated, el acceso esta sujeto a las condiciones adicionales que el autor establece en HuggingFace. Es necesario revisar dichos terminos antes de un despliegue en produccion.
- Ausencia de datos de entrenamiento: no se especifica la composicion del dataset, lo que dificulta evaluar riesgos de contaminacion de benchmarks o de sesgos de dominio.
- Soporte de herramientas y agentes: no confirmado. No conviene disenar pipelines que dependan de function calling sin verificarlo empiricamente.
- Compatibilidad de despliegue: al ser multimodal y de gran tamano, el soporte en servidores de inferencia de alto rendimiento (vLLM, TGI) puede requerir versiones especificas o no estar disponible; conviene validarlo antes de comprometerse con una arquitectura de produccion.
- Estado de la informacion: la ficha consultada no incluye model card detallada en los resultados de busqueda, por lo que muchas especificaciones quedan sin verificar.

## Enlaces

- HuggingFace: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Paper, blog o repositorio oficial: no disponible en la informacion proporcionada
- Demos o endpoints: no disponible en la informacion proporcionada
- Busqueda web: los resultados devueltos corresponden a la aerolinea SWISS, SwissTransfer y Swiss Life, y no guardan ninguna relacion con el modelo. No se han encontrado enlaces relevantes adicionales en la busqueda realizada.
