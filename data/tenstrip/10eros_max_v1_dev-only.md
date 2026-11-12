# TenStrip/10Eros_Max_v1_dev-only

## Resumen

TenStrip/10Eros_Max_v1_dev-only es un modelo alojado en Hugging Face por el usuario TenStrip, distribuido bajo acceso restringido (gated) y con la etiqueta explicita "dev-only" en su nombre, lo que sugiere que se trata de una version de desarrollo no destinada a uso en produccion. El repositorio ocupa 244,8 GB, un tamano que implica pesos de gran magnitud, probablemente en precision completa o con multiples variantes de cuantizacion incluidas.

La informacion publica disponible es muy limitada: no consta pipeline declarado, licencia, idiomas soportados ni descripcion tecnica en la ficha de Hugging Face. El modelo acumula 14 likes y 0 descargas en el momento de la consulta, lo que es coherente con el acceso restringido y con su caracter de version de desarrollo reciente (creado el 7 de noviembre de 2026 y actualizado el 10 de noviembre de 2026).

Por tanto, esta ficha se limita a documentar los datos verificables del repositorio e indica explicitamente "no disponible" en todos aquellos parametros que no han sido publicados. Cualquier evaluacion de arquitectura, rendimiento o capacidades requeriria aceptar las condiciones de acceso en Hugging Face y consultar la documentacion interna del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 244,8 GB; formato concreto no publicado) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico dato estructural verificable es el tamano del repositorio en Hugging Face: 244,8 GB. Este volumen es compatible con pesos en precision bf16/fp16 de un modelo de decenas de miles de millones de parametros, o con un repositorio que incluye varias copias de los pesos (por ejemplo, checkpoint base mas variantes cuantizadas). Sin documentacion adicional no es posible determinar cual de estas hipotesis es la correcta.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo y matematicas: no confirmado.
- Vision, audio u otras modalidades: no confirmado.
- Soporte de tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no confirmadas (idiomas no declarados).
- Modo "thinking" u otras capacidades especiales: no confirmado.

La ausencia de pipeline declarado y de model card publica impide confirmar cualquier capacidad concreta. La etiqueta "dev-only" sugiere que el autor no garantiza estabilidad ni comportamiento consistente fuera de su entorno de desarrollo.

## Casos de uso

- Evaluacion interna de checkpoints en desarrollo: el modelo esta marcado como "dev-only", por lo que su uso previsto parece ser la validacion por parte del autor o de colaboradores con acceso concedido, no el despliegue en produccion.
- Investigacion comparativa de modelos de gran tamano: el volumen del repositorio (244,8 GB) permite estudiar el comportamiento de pesos de gran magnitud, siempre que se acepten las condiciones de acceso.
- Pruebas de integracion en pipelines de inferencia: util para verificar compatibilidad con frameworks como vLLM, TGI o llama.cpp, aunque el formato de pesos no esta confirmado.
- Reproduccion de experimentos por parte de terceros con acceso: al ser gated, el autor puede controlar quien reproduce sus resultados y bajo que condiciones.
- Analisis de seguridad y sesgos en modelos no publicados: util para auditar comportamientos antes de un lanzamiento estable.
- Docencia y formacion: como ejemplo de repositorio gated de gran tamano y de las implicaciones de licencias no declaradas.

En todos los casos, la falta de licencia explicita y de documentacion tecnica limita seriamente el uso comercial o la integracion en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (244,8 GB) sugiere que la inferencia en precision completa requeriria multiples GPU de alta gama (por ejemplo, varios nodos con A100 80 GB u H100 80 GB), pero no se confirma el numero de parametros ni las cuantizaciones soportadas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo (RTX 4090, 3090, etc.): no confirmada; dependeria del soporte de cuantizacion, que no esta documentado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no confirmadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado parametros, contexto, rendimiento ni licencia que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso comercial, redistribucion ni modificacion, lo que impide su adopcion en entornos productivos sin aclaracion previa del autor.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para la evaluacion y limita la reproducibilidad publica.
- Etiqueta "dev-only": el propio nombre del modelo advierte de que se trata de una version de desarrollo, sin garantias de estabilidad, calidad o soporte.
- Ausencia de model card tecnica: no hay informacion sobre sesgos, datos de entrenamiento, riesgos de alucinacion ni limitaciones de contexto o idioma.
- Idiomas no declarados: no es posible evaluar su cobertura linguistica, incluido el castellano.
- Riesgo de alucinacion y sesgos: no evaluable sin documentacion ni benchmarks.
- 0 descargas registradas: no existe evidencia publica de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TenStrip/10Eros_Max_v1_dev-only
