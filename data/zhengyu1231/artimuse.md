# zhengyu1231/ArtiMuse

## Resumen

ArtiMuse es un modelo multimodal de evaluacion de estetica de imagen (Image Aesthetics Assessment, IAA) desarrollado conjuntamente por la Universidad de Ciencia y Tecnologia de China (USTC), el Laboratorio de IA de Shanghai, la Academia de Arte de China y la Universidad de Pekin. Se construye mediante fine-tuning supervisado sobre OpenGVLab/InternVL3-8B y resuelve un problema doble: por un lado, asigna una puntuacion estetica cuantitativa a una imagen; por otro, genera una explicacion cualitativa a nivel de experto desglosada en ocho dimensiones de atributos (composicion, color, iluminacion, etc.).

El modelo tiene 7.944.373.760 parametros (aproximadamente 8B) en formato safetensors, con un repositorio de 15,9 GB. Hereda del InternVL3-8B base su arquitectura de vision-lenguaje y su ventana de contexto, aunque la model card no detalla estos valores explicitamente. Esta pensado para aplicaciones educativas, creacion artistica y evaluacion de contenido generado por IA (AIGC), donde se requiere tanto una metrica objetiva como una justificacion comprensible por parte de profesionales.

La relevancia actual del modelo radica en que cubre una carencia de los evaluadores esteticos tradicionales, que suelen limitarse a una puntuacion escalar sin explicabilidad. ArtiMuse combina ambas capacidades en un unico modelo y se acompana del dataset ArtiMuse-10K, con 10.000 imagenes anotadas por expertos en 5 categorias principales y 15 subcategorias. Es la base sobre la que se ha desarrollado el trabajo posterior UniPercept.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en InternVL3-8B (internvl_chat, custom_code) |
| Parametros totales | 7.944.373.760 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ArtiMuse es un modelo multimodal de tipo vision-lenguaje construido por fine-tuning sobre OpenGVLab/InternVL3-8B. El repositorio declara los tags `internvl_chat` y `custom_code`, lo que indica que requiere cargar codigo personalizado del repositorio para su ejecucion (no es un transformer estandar de Hugging Face). La arquitectura subyacente de InternVL3 combina un encoder visual con un modelo de lenguaje; la model card no especifica la variante exacta del encoder ni la configuracion detallada de atencion.

El entrenamiento se realizo sobre el dataset ArtiMuse-10K, compuesto por 10.000 imagenes que abarcan 5 categorias principales y 15 subcategorias, cada una anotada por expertos profesionales con un analisis de 8 atributos dimensionales y una puntuacion global. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO en esta version. El trabajo posterior UniPercept, construido sobre ArtiMuse, si menciona explicitamente el uso de Domain-Adaptive Pre-Training y Task-Aligned RL, pero esas tecnicas corresponden al modelo sucesor, no a ArtiMuse.

## Capacidades

- Evaluacion estetica de imagen con puntuacion cuantitativa (scoring holistico).
- Generacion de analisis cualitativo a nivel de experto desglosado en 8 dimensiones de atributos.
- Comprension de imagen y texto conjunta (modelo vision-lenguaje).
- Clasificacion y evaluacion en 5 categorias principales y 15 subcategorias de imagenes.
- Capacidad de razonamiento descriptivo sobre composicion, color, iluminacion y otros atributos esteticos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de imagenes generadas por IA (AIGC): el modelo permite puntuar y justificar la calidad estetica de imagenes producidas por modelos generativos, lo que resulta util para filtrar y clasificar grandes volumenes de contenido antes de su publicacion.
- Plataformas de ensenanza artistica: un estudiante puede subir una obra y recibir una evaluacion desglosada por atributos (composicion, color, iluminacion) junto con una puntuacion global, emulando la retroalimentacion de un profesor de arte.
- Curaduria y seleccion de portfolios: agencias y galerias pueden usar el modelo para preevaluar colecciones de imagenes y ordenarlas por criterios esteticos objetivos antes de la revision humana.
- Moderacion y ranking en redes sociales o marketplaces de imagenes: el scoring permite priorizar contenido visual de mayor calidad estetica en feeds o resultados de busqueda.
- Investigacion en estetica computacional: el modelo y el dataset ArtiMuse-10K sirven como linea base reproducible para experimentos academicos sobre evaluacion estetica automatizada.
- Evaluacion de calidad en pipelines de edicion y retoque fotografico: el desglose por atributos permite medir el impacto de una edicion concreta (por ejemplo, cambios de color o iluminacion) sobre la percepcion estetica final.
- Analisis de contenido artistico en archivos y museos digitales: clasificacion y descripcion estetica de colecciones de imagenes para catalogacion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.944.373.760 parametros, en precision completa (FP16/BF16) se requieren aproximadamente 16 GB solo para los pesos, mas el overhead del encoder visual y las activaciones; en cuantizacion de 8 bits rondaria los 8-9 GB y en 4 bits unos 5-6 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precision completa con lotes grandes; RTX 4090 (24 GB) es suficiente para FP16 con un unico ejemplo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16, y en GPUs de 12-16 GB si se aplica cuantizacion (no confirmado por el autor).
- Opciones de despliegue: al requerir `custom_code` e `internvl_chat`, el despliegue no es directo con vLLM o TGI estandar; se recomienda seguir el codigo del repositorio oficial de InternVL3 o el del proyecto ArtiMuse. Soporte en llama.cpp u Ollama: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtiMuse | ~8B | no disponible | IAA (scoring + analisis) | apache-2.0 | Hugging Face, ModelScope |
| InternVL3-8B (base) | ~8B | no disponible | Vision-lenguaje general | no disponible | Hugging Face |
| UniPercept | no disponible | no disponible | IAA + IQA + ISTA | no disponible | Hugging Face |
| Evaluadores esteticos clasicos (p. ej. NIMA, MUSIQ) | mucho menor | no aplica | Solo scoring escalar | variable | variable |

ArtiMuse se distingue de InternVL3-8B por estar especializado en estetica con explicabilidad, mientras que el base es un modelo general. Frente a UniPercept (trabajo posterior del mismo grupo), ArtiMuse cubre solo IAA, mientras que UniPercept amplia el alcance a calidad de imagen (IQA) y estructura/textura (ISTA). Los evaluadores clasicos como NIMA o MUSIQ solo producen una puntuacion sin justificacion textual. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con anotaciones de expertos de un contexto cultural concreto (colaboracion con la Academia de Arte de China), lo que puede introducir sesgos culturales en la valoracion estetica.
- Riesgo de alucinacion: como modelo de lenguaje, puede generar justificaciones plausibles pero incorrectas sobre atributos visuales que no estan realmente presentes en la imagen.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; conviene verificar la configuracion de InternVL3-8B antes de usarlo con entradas largas.
- Restricciones de licencia: el modelo se distribuye bajo apache-2.0, pero el dataset ArtiMuse-10K tiene terminos de uso separados que prohiben el uso comercial y la redistribucion; es importante no confundir ambas licencias.
- Caveat de produccion: requiere cargar codigo personalizado (`custom_code`), lo que implica revisar el codigo del repositorio antes de desplegarlo en entornos productivos; el soporte en frameworks de inferencia estandar no esta confirmado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/zhengyu1231/ArtiMuse
- Paper ArtiMuse: https://arxiv.org/abs/2507.14533
- Paper UniPercept: https://arxiv.org/abs/2512.21675
- Project page ArtiMuse: https://thunderbolt215.github.io/ArtiMuse-project/
- Demo online: http://artimuse.intern-ai.org.cn/
- Codigo: https://github.com/thunderbolt215/ArtiMuse
- Coleccion de checkpoints en Hugging Face: https://huggingface.co/collections/Thunderbolt215215/artimuse-68b7d2c7137d8ed119c8774e
- Coleccion en ModelScope: https://modelscope.cn/collections/ArtiMuse-abea7a7922274d
- Dataset ArtiMuse-10K: https://huggingface.co/datasets/Thunderbolt215215/ArtiMuse-10K
- UniPercept (modelo): https://huggingface.co/Thunderbolt215215/UniPercept
- UniPercept-Bench: https://huggingface.co/datasets/Thunderbolt215215/UniPercept-Bench
- Project page UniPercept: https://thunderbolt215.github.io/Unipercept-project/
- Codigo UniPercept: https://github.com/thunderbolt215/UniPercept
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B
