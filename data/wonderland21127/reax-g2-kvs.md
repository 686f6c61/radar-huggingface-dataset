# wonderland21127/REAX-G2-kvS

## Resumen

REAX-G2-kvS es un modelo derivado de la familia Gemma 4, publicado por el usuario wonderland21127 en Hugging Face y afinado a partir del checkpoint danyloooah/reax-g2-soup2. Se distribuye con la etiqueta `image-text-to-text` y `decision-making`, lo que indica que el objetivo del ajuste es la toma de decisiones asistida por imagen y texto, con un pipeline declarado de `text-classification` y `multiple-choice`. El repositorio tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos.

El modelo cuenta con 31.273.088.876 parametros segun los datos reales de los safetensors, lo que lo situa en la gama de 31B, y el repositorio ocupa 62,6 GB. La licencia declarada es Apache 2.0. No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el contexto nativo ni los idiomas soportados, y el modelo no registra descargas ni likes en el momento de la consulta.

Su relevancia actual es limitada pero concreta: se trata de un fine-tune de investigacion orientado a tareas de decision y clasificacion multimodal, no de un modelo generalista de proposito comercial. Para un desarrollador que necesite evaluar rapidamente si encaja en su pipeline, esta ficha recoge lo que se puede afirmar con certeza y marca explicitamente todo lo que no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, segun tags); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `gemma4` y `image-text-to-text`, lo que apunta a una arquitectura transformer multimodal de la familia Gemma 4, con un codificador visual acoplado a un decodificador de lenguaje. El checkpoint base es danyloooah/reax-g2-soup2, un modelo que, por su nombre, sugiere una mezcla de pesos (model soup) de la serie REAX G2. Sobre esa base, wonderland21127 ha aplicado un ajuste adicional cuyo objetivo declarado es la toma de decisiones y la clasificacion de opcion multiple.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la mezcla de datos, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta si el ajuste congela el codificador visual o entrena el modelo completo. Todo ello debe considerarse no disponible a partir de la informacion publica del repositorio.

## Capacidades

- Generacion de texto y razonamiento a partir de entradas de imagen y texto, segun la etiqueta `image-text-to-text`.
- Clasificacion de texto y resolucion de preguntas de opcion multiple (`multiple-choice`), que es el pipeline declarado.
- Toma de decisiones asistida (`decision-making`), presumiblemente en escenarios donde hay que elegir entre alternativas dadas.
- Procesamiento multimodal: al tratarse de un modelo de la familia Gemma 4 con etiqueta image-text, se asume soporte de entrada de imagenes, aunque no se detalla la resolucion ni el numero de imagenes por prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, vision o audio: solo vision esta implicita por la etiqueta; thinking y audio no disponibles.

## Casos de uso

- Clasificacion de tickets de soporte con captura adjunta: el modelo puede recibir una imagen (por ejemplo, una captura de error) y un texto descriptivo, y devolver la categoria de incidencia. Es adecuado porque el pipeline declarado es precisamente `text-classification` sobre entradas imagen-texto.
- Triaje de decisiones en entornos de investigacion: dado un conjunto de opciones y evidencia visual, el modelo puede seleccionar la alternativa mas probable. Encaja en el tag `decision-making` y en el formato `multiple-choice`.
- Evaluacion de calidad de documentos escaneados: recibir la imagen del documento y una pregunta sobre su contenido para clasificarlo o validarlo. Aprovecha la naturaleza multimodal del checkpoint base Gemma 4.
- Etiquetado asistido de datasets multimodales: usar el modelo para preanotar pares imagen-texto con una categoria entre varias, acelerando la revision humana posterior.
- Filtrado de contenido en pipelines de moderacion: clasificar imagenes con texto asociado en categorias de riesgo definidas por el equipo, siempre con supervision humana por el riesgo de alucinacion.
- Experimentacion academica sobre model soups: al derivar de un modelo tipo soup, sirve para estudiar como el ajuste adicional sobre una mezcla de pesos afecta a tareas de decision y clasificacion.
- Prototipado de asistentes de seleccion visual: en demos donde el usuario sube una imagen y debe elegir entre opciones, el modelo puede puntuar o clasificar cada alternativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62,5 GB solo para pesos (31,27B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se necesitan 70-80 GB o mas.
- Cuantizacion a 8 bits: unos 31 GB de pesos, lo que requiere GPU de 40-48 GB o reparto entre varias.
- Cuantizacion a 4 bits: unos 16 GB de pesos, viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con margen ajustado para contexto corto.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; L40S 48 GB o A6000 48 GB para 8 bits; RTX 4090/3090 24 GB para 4 bits.
- Cabe en GPU consumer: si, en 4 bits y con contexto limitado; en 8 bits o BF16 no cabe en una unica GPU consumer.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este checkpoint y dependen de que existan conversiones, que no se publican.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| REAX-G2-kvS | 31,27B | no disponible | Apache 2.0 | Gated | Fine-tune multimodal para decision/clasificacion |
| Gemma 4 (modelo base de la familia) | no disponible | no disponible | no disponible | no disponible | Referencia arquitectonica del checkpoint |
| danyloooah/reax-g2-soup2 | no disponible | no disponible | no disponible | no disponible | Modelo base directo del fine-tune |

No se dispone de datos de rendimiento ni de contexto de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia total de documentacion tecnica: no hay model card con datos de entrenamiento, contexto, idiomas ni evaluacion, lo que impide validar su calidad de forma rigurosa.
- Riesgo de alucinacion: al ser un fine-tune de investigacion sin benchmarks publicados, no hay evidencia de robustez en produccion.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineacion, por lo que no se pueden evaluar sesgos de genero, raza o idioma.
- Limitaciones de idioma: no se declaran idiomas soportados; el comportamiento en castellano es incierto.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero al derivar de un modelo base cuya licencia no se detalla en la informacion disponible, conviene verificar la cadena de licencias antes de un despliegue comercial.
- Sin senales de adopcion: cero descargas y cero likes, sin issues ni discusiones publicas, lo que reduce la probabilidad de soporte comunitario.
- No se publican cuantizaciones ni formatos alternativos, lo que complica el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonderland21127/REAX-G2-kvS
- Modelo base: https://huggingface.co/danyloooah/reax-g2-soup2
