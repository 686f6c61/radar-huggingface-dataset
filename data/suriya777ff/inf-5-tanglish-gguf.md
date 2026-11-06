# Suriya777ff/INF-5-Tanglish-GGUF

## Resumen

INF-5 (Infinex on-device model) es un modelo de lenguaje publicado en Hugging Face por el usuario Suriya777ff bajo el identificador `Suriya777ff/INF-5-Tanglish-GGUF`. Segun los metadatos del repositorio, cuenta con aproximadamente 1.720 millones de parametros (1,72 B) y se distribuye en formato GGUF, lo que lo orienta a inferencia en dispositivo (on-device) y a entornos con recursos limitados. El nombre sugiere un enfoque en Tanglish, es decir, texto que mezcla tamil e ingles, un registro muy habitual en comunicacion informal en el sur de la India y en comunidades de la diaspora.

La model card es extremadamente escueta y no aporta informacion sobre arquitectura, datos de entrenamiento, contexto, idiomas ni benchmarks. Se limita a declarar que los pesos son propiedad de Infinite Tech y que se publican unicamente para que la aplicacion Infinite los descargue para sus usuarios, prohibiendo cualquier otro uso, redistribucion o trabajo derivado. La licencia es `infinite-tech-use-only` (etiquetada como `other` en Hugging Face), lo que en la practica restringe casi por completo el uso por parte de terceros.

Por tanto, la relevancia practica del modelo para desarrolladores e investigadores externos es muy limitada: se trata de un artefacto de distribucion privada de un producto comercial, con documentacion minima y sin datos verificables de rendimiento. Esta ficha recoge unicamente lo que puede confirmarse a partir de los metadatos publicos, marcando explicitamente como "no disponible" todo aquello que el autor no ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (aprox. 1,72 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF; no se detallan los niveles incluidos) |
| Idiomas soportados | no disponibles (el nombre sugiere Tanglish, sin confirmacion oficial) |
| Licencia | infinite-tech-use-only (etiqueta `other` en Hugging Face) |
| Formato de pesos | GGUF (tamano del repo: 2,2 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los metadatos no indican si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un modelo derivado de otro base mediante fine-tuning. Tampoco se especifica el numero de capas, la dimension oculta, el tipo de atencion ni la estrategia de tokenizacion.

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni si hubo una fase de instruccion o de conversacion. La unica pista sobre su proposito es la etiqueta `conversational` en Hugging Face y el nombre "Tanglish", que apunta a un ajuste orientado a dialogo en ese registro linguistico mixto. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta pensado para dialogos multi-turno, aunque no se detalla su calidad ni su comportamiento.
- Posible especializacion en Tanglish: el sufijo del nombre sugiere manejo de texto mixto tamil-ingles, sin que exista documentacion que lo confirme ni ejemplos publicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Inferencia en dispositivo dentro de la aplicacion Infinite: el unico caso de uso autorizado por la licencia es la descarga y ejecucion de los pesos por parte de la app Infinite para sus usuarios finales, en formato GGUF y con un tamano de repo de 2,2 GB que encaja en moviles y equipos de gama media.
- Evaluacion interna de modelos compactos en castellano/tamil-ingles: un equipo de investigacion podria estudiar el comportamiento de un modelo de 1,72 B en registros code-switching, siempre que obtuviera permiso explicito del titular, ya que la licencia lo exige.
- Pruebas de pipelines GGUF: dado que el artefacto es GGUF, podria servir para validar integraciones con llama.cpp u Ollama, aunque de nuevo el uso por terceros esta restringido por licencia.
- Benchmarking de modelos pequenos: util como referencia de tamano (1,72 B) en comparativas de eficiencia, sujeto a autorizacion.
- Prototipos de asistentes conversacionales en contextos con recursos muy limitados: el tamano del repo (2,2 GB) permite despliegues en CPU o GPUs de gama baja, aunque la licencia bloquea su uso comercial por terceros.
- Analisis de licencias y practicas de publicacion: el caso resulta ilustrativo de modelos publicados en Hugging Face con licencias restrictivas y documentacion minima, util para estudiar gobernanza de artefactos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 1,72 B en cuantizacion de 4 bits requiere del orden de 1 a 1,5 GB de memoria, y en 8 bits alrededor de 2 GB, sin contar la cache KV, cuyo tamano depende de una longitud de contexto no documentada.
- GPU recomendadas: no disponibles. Por tamano, el modelo es compatible con GPUs consumer como RTX 3060, RTX 4060 o superiores, e incluso con inferencia en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM en cuantizaciones bajas, aunque no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no aplican directamente al formato GGUF sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parametros y licencia. Se incluyen alternativas de tamano comparable ampliamente documentadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| INF-5 (Infinex) | 1,72 B | no disponible | infinite-tech-use-only (restringida) | GGUF | minima |
| Qwen2.5-1.5B | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | extensa |
| Llama 3.2 1B | 1,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | extensa |
| Gemma 2 2B | 2,6 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF | extensa |

La diferencia principal no esta en el tamano sino en la licencia y en la documentacion: los modelos de referencia permiten uso comercial con condiciones claras y publican benchmarks, mientras que INF-5 prohibe cualquier uso distinto de la app Infinite.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: `infinite-tech-use-only` prohibe explicitamente cualquier uso, redistribucion o trabajo derivado distinto de la descarga por parte de la aplicacion Infinite. No es apta para uso comercial ni para investigacion sin autorizacion expresa.
- Documentacion practicamente inexistente: sin arquitectura, contexto, idiomas ni datos de entrenamiento publicados, es imposible evaluar el modelo con rigor.
- Riesgo de alucinacion: desconocido, al no haber evaluaciones publicadas.
- Sesgos conocidos: no documentados; un modelo orientado a Tanglish podria presentar sesgos linguisticos y culturales propios del registro y del dataset de entrenamiento, que no se ha hecho publico.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto real y la cobertura idiomatica.
- Caveat para produccion: sin benchmarks ni garantias del autor, no es recomendable integrar el modelo en sistemas en produccion ajenos a la app Infinite.
- Procedencia y gobernanza: el autor publica bajo un seudonimo y la model card no identifica el modelo base ni el proceso de entrenamiento, lo que dificulta cualquier auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suriya777ff/INF-5-Tanglish-GGUF
- Perfil del autor: https://huggingface.co/Suriya777ff
- Ficha en Free2AITools: https://free2aitools.com/model/suriya777ff/inf-5-tanglish-gguf
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face (no se ha localizado un enlace externo).
