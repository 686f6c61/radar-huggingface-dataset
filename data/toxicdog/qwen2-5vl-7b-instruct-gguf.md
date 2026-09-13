# toxicdog/Qwen2.5VL-7B-Instruct-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones en formato GGUF del modelo gaoqie/Qwen2.5VL-7B-Instruct-fire, un ajuste fino multimodal (vision-lenguaje) de la familia Qwen2.5-VL de 7.600 millones de parametros. La publicacion la firma el usuario toxicdog, aunque el trabajo de cuantizacion lo realiza mradermacher (asi consta en la model card) y el material de partida es el mencionado finetune de gaoqie. El resultado es un paquete de pesos listos para ejecutarse en llama.cpp y derivados, con 13 variantes de cuantizacion mas el proyector multimodal (mmproj) necesario para procesar imagenes.

El problema que resuelve es el de desplegar un modelo de vision-lenguaje de tamano medio en hardware de consumo o en servidores modestos, algo inviable con los pesos originales en fp16 (15,3 GB solo de pesos). Al ofrecer desde Q2_K (3,1 GB) hasta Q8_0 (8,2 GB), permite elegir el compromiso entre calidad y memoria segun la GPU disponible. Es relevante ahora porque la demanda de asistentes multimodales autoalojados crece, y contar con una ruta GGUF verificable para un derivado de Qwen2.5-VL simplifica su integracion en herramientas como Ollama, LM Studio o llama-server.

El modelo cuenta con 7.615.616.512 parametros (dato real del repositorio en safetensors) y conserva la naturaleza conversacional e instruida propia de la familia. El repositorio ocupa 70,4 GB en total, suma de todas las variantes publicadas. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento del finetune en la informacion disponible, por lo que las secciones tecnicas se apoyan en lo declarado por los autores y en la linea de modelos de la que procede.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con proyector mmproj; no se detalla en la ficha del repositorio |
| Parametros totales | 7.615.616.512 (7,62 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio (la familia Qwen2.5-VL declara 128 000 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh (declarado en los metadatos del repositorio); el resto, no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers en metadatos; incluye fichero mmproj para la torre de vision) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna mas alla de la naturaleza multimodal del modelo base. Se trata de un modelo vision-lenguaje de aproximadamente 7,6 mil millones de parametros, heredado de la familia Qwen2.5-VL: una torre de vision que codifica imagenes y un modelo de lenguaje tipo transformer que las consume a traves de un adaptador. En el repositorio GGUF ese adaptador se materializa en el fichero mmproj, disponible en dos precisiones (Q8_0, 1,0 GB; f16, 1,5 GB), que debe cargarse junto al modelo principal para que la entrada de imagenes funcione en llama.cpp.

No hay datos publicados en esta ficha sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El modelo es un finetune instruido ("Instruct") del proyecto gaoqie/Qwen2.5VL-7B-Instruct-fire, del que tampoco se documentan aqui los detalles de entrenamiento. La innovacion practica de este repositorio es, por tanto, la propia conversion a GGUF: cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) con una horquilla de precisones que va de 2 a 16 bits por peso, incluida la variante IQ4_XS.

## Capacidades

- Generacion de texto conversacional en formato instruido, con soporte de dialogos multi-turno.
- Comprension de imagenes: al cargar el fichero mmproj, el modelo acepta entradas visuales ademas de texto (descripcion, preguntas sobre la imagen, extraccion de informacion).
- Capacidad multimodal heredada de la familia Qwen2.5-VL; el alcance exacto (resolucion dinamica, video) no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la ficha del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la ficha del repositorio.
- Capacidades multilingues: los metadatos declaran unicamente zh; no se confirma soporte de otros idiomas.
- Modo thinking explicito, audio o cualquier otra capacidad especial: no disponible.

## Casos de uso

- Asistentes multimodales autoalojados: desplegando la variante Q4_K_M (4,8 GB) con su mmproj en llama-server, se puede ofrecer un endpoint de chat que responde preguntas sobre capturas de pantalla, diagramas o fotografias sin enviar datos a terceros.
- Clasificacion y etiquetado de imagenes en lotes: procesar catalogos de productos o archivos fotograficos para generar descripciones y metadatos de forma automatizada, ajustando la precision (Q5_K_M o Q6_K) si la calidad del texto generado es critica.
- Extraccion de informacion de documentos escaneados: el modelo puede transcribir y resumir el contenido de facturas o formularios fotografiados; conviene usar Q6_K o Q8_0 para reducir errores de lectura.
- Prototipado rapido de aplicaciones de vision en portatiles: la variante Q3_K_S (3,6 GB) o IQ4_XS (4,4 GB) permite probar la funcionalidad completa en una GPU de 6-8 GB antes de invertir en hardware mayor.
- Asistente en chino para atencion al cliente: dado que el unico idioma declarado es zh, el uso mas realista es la gestion de conversaciones y consultas sobre imagenes en ese idioma.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 niveles de cuantizacion mas f16, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad de un modelo multimodal segun los bits por peso (por ejemplo, comparar Q4_K_M frente a Q8_0 sobre el mismo conjunto de imagenes).
- Despliegue en entornos con restricciones de red: al distribuirse como ficheros GGUF autocontenidos, puede llevarse a maquinas aisladas (air-gapped) sin dependencias de frameworks de servidor pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento cualitativa que aporta el autor es la tabla de tamanos por cuantizacion y el grafico comparativo de perplejidad de ikawrakow enlazado en la model card, que no incluye cifras especificas para este modelo.

| Variante | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 3,1 | no indicada |
| Q3_K_S | 3,6 | no indicada |
| Q3_K_M | 3,9 | calidad inferior segun el autor |
| Q3_K_L | 4,2 | no indicada |
| IQ4_XS | 4,4 | no indicada |
| Q4_K_S | 4,6 | rapida, recomendada |
| Q4_K_M | 4,8 | rapida, recomendada |
| Q5_K_S | 5,4 | no indicada |
| Q5_K_M | 5,5 | no indicada |
| Q6_K | 6,4 | muy buena calidad |
| Q8_0 | 8,2 | rapida, mejor calidad |
| f16 | 15,3 | 16 bits por peso, excesiva |
| mmproj-Q8_0 | 1,0 | complemento multimodal |
| mmproj-f16 | 1,5 | complemento multimodal |

## Requisitos de hardware

- VRAM estimada para los pesos (sin contar cache KV ni el proyector): 3,1 GB con Q2_K; 4,4 GB con IQ4_XS; 4,8 GB con Q4_K_M; 5,5 GB con Q5_K_M; 6,4 GB con Q6_K; 8,2 GB con Q8_0; 15,3 GB con f16. Hay que sumar entre 1,0 y 1,5 GB adicionales del fichero mmproj si se procesan imagenes.
- La cache KV y los tokens de imagen incrementan el consumo por encima del tamano de los pesos; con contextos largos la diferencia puede ser de varios GB, aunque no se dispone de cifras exactas para este modelo.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 24 GB. En tarjetas de 8 GB caben las variantes Q3_K_S, Q3_K_M, IQ4_XS y, con margen justo, Q4_K_S sin contexto largo.
- GPU de datacenter: A100 40/80 GB, H100 y L40S permiten cargar f16 o Q8_0 con contextos amplios y servir varias peticiones concurrentes.
- Opciones de despliegue: llama.cpp (binario llama-cli o llama-server), Ollama, LM Studio y koboldcpp. Para habilitar vision es imprescindible cargar el mmproj correspondiente. vLLM y TGI no estan pensados para GGUF de forma general; en esos servidores habria que usar los pesos originales en safetensors del modelo base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| toxicdog/Qwen2.5VL-7B-Instruct-GGUF (este) | 7,62 mil millones | no disponible | GGUF (12 cuantizaciones + mmproj) | apache-2.0 | Cuantizacion estatica publicada por mradermacher; 0 descargas y 1 like en el momento de la consulta |
| mradermacher/Qwen2.5VL-7B-Instruct-i1-GGUF | 7,62 mil millones (mismo base) | no disponible | GGUF (cuantizaciones ponderadas/imatrix) | apache-2.0 | Alternativa del mismo cuantizador con cuantizaciones i1, habitualmente preferibles a igual tamano |
| gaoqie/Qwen2.5VL-7B-Instruct-fire | 7,62 mil millones | no disponible | safetensors | no disponible en la informacion | Modelo base en precision original; requiere mas VRAM y un stack tipo transformers |
| Familia Qwen2.5-VL-7B-Instruct (origen) | 7,62 mil millones | 128 000 tokens segun la documentacion de la familia | safetensors | apache-2.0 | Modelo de referencia del que desciende el finetune; sus datos no se detallan en esta ficha |

## Limitaciones y advertencias

- El repositorio declara un unico idioma, zh, por lo que el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan de forma apreciable la calidad, especialmente en tareas que dependen de la torre de vision; el propio autor marca Q3_K_M como "lower quality".
- No hay benchmarks publicados para este finetune ni para sus cuantizaciones, de modo que no puede compararse su calidad con la del modelo original de Qwen mas alla de la degradacion esperable por cuantizacion.
- El finetune de partida (gaoqie/Qwen2.5VL-7B-Instruct-fire) no documenta su dataset ni su proceso de alineacion, lo que impide evaluar sesgos introducidos ni riesgos de sobreajuste.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y especialmente relevante al describir imagenes, donde puede inventar detalles no presentes en la entrada.
- El repositorio figura con 0 descargas y 1 like, y no consta verificacion de que las cuantizaciones hayan sido validadas funcionalmente por terceros; conviene probar la variante elegida antes de usarla en produccion.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se recomienda revisar las condiciones del modelo base y del finetune intermedio, cuya licencia no se detalla aqui.
- Al desplegar en llama.cpp hay que conservar la pareja modelo + mmproj; cargar solo el GGUF principal desactiva las capacidades de vision sin aviso evidente en algunos frontales.
- El repositorio ocupa 70,4 GB, por lo que descargar el conjunto completo no es necesario: conviene elegir una unica cuantizacion y su proyector.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/toxicdog/Qwen2.5VL-7B-Instruct-GGUF
- Modelo base (finetune): https://huggingface.co/gaoqie/Qwen2.5VL-7B-Instruct-fire
- Cuantizaciones ponderadas i1 del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5VL-7B-Instruct-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5VL-7B-Instruct-GGUF
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa responsable del trabajo de cuantizacion: https://www.nethype.de/
