# voicort/sn92-generalist-r2-h

## Resumen

sn92-generalist-r2-h es un modelo publicado por el usuario voicort en Hugging Face bajo el identificador voicort/sn92-generalist-r2-h. Se distribuye con la librería transformers en formato safetensors y está etiquetado como image-text-to-text, decision-model, text-classification y reax, además de llevar el tag gemma4, lo que sugiere que deriva de la familia Gemma. El repositorio tiene un tamaño de 62,6 GB y el recuento real de parámetros en los tensores safetensors es de 31.273.088.876 (aproximadamente 31,3 mil millones).

El modelo se presenta como un "generalist" de segunda ronda con capacidades multimodales (entrada de imagen y texto) y orientado a tareas de decisión y clasificación de texto, según sus etiquetas. La ficha oficial no aporta información sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni idiomas soportados, por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

Es relevante ahora por su tamaño (31B) y su naturaleza multimodal, que lo sitúan en la categoría de modelos de gran porte para tareas de razonamiento y clasificación, pero su acceso está restringido (gated) y no cuenta aún con descargas ni likes, lo que indica una disponibilidad muy reciente y una validación comunitaria todavía inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag gemma4 sugiere base Gemma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. El tag gemma4 y la librería transformers apuntan a una arquitectura transformer derivada de la familia Gemma, pero no se confirma si se trata de un transformer denso, MoE o híbrido. El pipeline declarado es text-classification, aunque las etiquetas incluyen image-text-to-text, lo que indica capacidad multimodal de entrada.

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación y clasificación de texto: el pipeline declarado es text-classification, por lo que está orientado a tareas de etiquetado y decisión sobre texto.
- Entrada multimodal imagen-texto: el tag image-text-to-text indica que acepta imágenes junto con texto como entrada.
- Modelo de decisión: el tag decision-model sugiere uso en sistemas de toma de decisiones o clasificación de alto nivel.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio: visión probable por el tag image-text-to-text; thinking y audio no disponibles.

## Casos de uso

- Clasificación de contenido multimodal: el modelo puede recibir pares imagen-texto y emitir una etiqueta o decisión, adecuado para moderación de contenido o categorización de publicaciones.
- Sistemas de decisión automatizada: con el tag decision-model, puede integrarse en pipelines que requieran una salida de clasificación sobre entradas textuales o mixtas.
- Etiquetado de datos a escala: su tamaño de 31B permite procesar grandes volúmenes de texto para anotación automática en proyectos de curación de datasets.
- Análisis de documentos con imagen: al aceptar image-text-to-text, puede clasificar documentos escaneados o capturas junto con su texto asociado.
- Filtrado y enrutamiento en atención al cliente: clasificación de tickets o mensajes para dirigirlos al departamento adecuado, aunque la longitud de contexto no está confirmada.
- Investigación en modelos de decisión: útil como base para experimentos académicos sobre clasificación multimodal, dado que la licencia apache-2.0 permite uso y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3B parámetros en fp16 se requieren aproximadamente 62,6 GB de VRAM (coincide con el tamaño del repo); en cuantización de 8 bits, unos 31 GB; en 4 bits, unos 16 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o RTX 6000 Ada para 8 bits; para 4 bits podría caber en una RTX 4090 de 24 GB, aunque no está verificado.
- ¿Cabe en consumer GPU? Posiblemente en RTX 4090 (24 GB) solo con cuantización agresiva (4 bits), no confirmado.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con alternativas concretas, ya que no se conocen benchmarks, contexto ni arquitectura interna de este modelo. Se indica "no disponible".

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes.
- Documentación insuficiente: no se especifican arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: inherente a los modelos generativos de gran tamaño; no cuantificado por el autor.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero al ser un modelo derivado con tag gemma4 conviene verificar las condiciones de la licencia base de Gemma, que puede imponer restricciones adicionales.
- Caveat para producción: la falta de benchmarks y de especificaciones técnicas hace recomendable una evaluación propia antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-h
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
