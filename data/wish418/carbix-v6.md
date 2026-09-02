# wish418/carbix-v6

## Resumen

carbix-v6 es un adaptador LoRA desarrollado por el usuario wish418 sobre el modelo multimodal Qwen/Qwen3-VL-4B-Instruct. Su propósito es extraer datos estructurados en formato JSON a partir de documentos coreanos de emisiones de carbono: facturas de electricidad, facturas de gas urbano y certificados de transporte de mercancías. El modelo combina comprensión visual (imágenes de documentos) con generación de texto estructurado, y es capaz de clasificar automáticamente el tipo de documento sin necesidad de pistas previas.

La versión v6 introduce una mejora clave frente a v5: unifica el prompt de entrenamiento en un único formato de clasificación automática, eliminando las pistas de categoría que el modelo anterior usaba como copia directa. Esto permite que el modelo aprenda a discernir por sí mismo el tipo de documento, alcanzando una precisión de clasificación del 100 % en una prueba de 120 documentos y una precisión de extracción global del 99,43 % en 657 casos de prueba. El modelo se distribuye en formato GGUF (q8_0) para su uso con llama.cpp, junto con el proyector de visión correspondiente.

Con 4.022 millones de parámetros en total (modelo base completo), el adaptador LoRA añade solo 132 MB de pesos. La ventana de contexto recomendada es de 8.192 tokens, y el tiempo medio de procesamiento por documento es de 5,0 segundos en una GPU L4 24 GB. Está orientado a entornos de producción que requieran extracción fiable y rápida de documentos de emisiones de carbono en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (base) + adaptador LoRA (r=16, alpha=32, dropout=0.05) |
| Parametros totales | 4.022.468.096 (modelo base completo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (configuracion recomendada en servidor llama.cpp) |
| Tipos de cuantizacion | GGUF q8_0 (modelo) y f16 (proyector de vision) |
| Idiomas soportados | Coreano (enfoque principal); el modelo base Qwen3-VL soporta multiples idiomas |
| Licencia | other (no especificada; el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

carbix-v6 es un adaptador LoRA aplicado sobre Qwen3-VL-4B-Instruct, un modelo multimodal de tipo transformer con codificador de vision y decodificador de lenguaje. El adaptador se aplica a las proyecciones q, k, v, o y a las capas gate, up y down del bloque MLP. No se trata de un modelo MoE ni de una arquitectura hibrida; es un fine-tuning clasico sobre un modelo denso.

El entrenamiento se realizo con 19.700 documentos coreanos, distribuidos en 10.727 facturas de gas, 4.495 facturas de electricidad y 4.478 certificados de transporte. Se utilizo el optimizador AdamW con una tasa de aprendizaje de 2e-4, programacion cosine con warmup del 5 % (246 pasos), tamano de batch efectivo de 4 (batch 1 con acumulacion de gradientes 4) y un total de 4.925 pasos (1 epoca). El entrenamiento duro 15 horas y 41 minutos en una GPU L4 de 24 GB. La perdida final fue de 0,0087 en entrenamiento y 0,0020 en evaluacion.

La innovacion principal de v6 frente a v5 es el uso de un unico prompt de clasificacion automatica de 5.241 caracteres, sin pistas de categoria. En v5 se usaban tres prompts distintos (uno por categoria) que contenian la respuesta esperada, lo que impedia que el modelo aprendiera a clasificar. v6 corrige este diseno y consigue una clasificacion perfecta en la prueba de validacion.

## Capacidades

- Extraccion de datos estructurados en JSON a partir de imagenes de documentos de emisiones de carbono (facturas de electricidad, facturas de gas y certificados de transporte).
- Clasificacion automatica del tipo de documento sin necesidad de pistas externas (categoria inferida por el propio modelo).
- Procesamiento multimodal: entrada de imagen (documento escaneado o fotografiado) y salida de texto estructurado.
- Generacion de campos como categoria, valores numericos, fechas, direcciones y otros atributos relevantes para el reporte de emisiones.
- Compatibilidad con el modo de clasificacion con pista (categoria predefinida) manteniendo precision similar a v5 (98,82 % en 807 casos).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso mas alla de la extraccion especifica.

## Casos de uso

- Automatizacion de reportes de emisiones de carbono: el modelo puede procesar facturas de electricidad y gas de multiples proveedores y generar automaticamente los campos necesarios para formularios regulatorios, reduciendo la introduccion manual de datos.
- Verificacion de facturas en sistemas de contabilidad ambiental: integrado en un pipeline de gestion documental, carbix-v6 extrae los importes, consumos y periodos de facturacion para validar que coinciden con los registros internos de la empresa.
- Clasificacion de documentos en archivos corporativos: al detectar automaticamente si un documento es de electricidad, gas o transporte, el modelo puede organizar grandes volumenes de facturas sin necesidad de etiquetado manual previo.
- Extraccion de datos para auditorias de sostenibilidad: permite recopilar de forma rapida y fiable los datos de consumo de energia de un conjunto de instalaciones a partir de sus facturas, facilitando la elaboracion de memorias de sostenibilidad.
- Integracion en flujos de trabajo de certificacion de transporte: para empresas logisticas, el modelo extrae los datos de los certificados de transporte de mercancias (rutas, pesos, emisiones estimadas) y los envia directamente a sistemas de calculo de huella de carbono.
- Procesamiento por lotes en servidores locales: gracias a su formato GGUF y a la compatibilidad con llama.cpp, puede desplegarse en entornos con GPU limitada (por ejemplo, una L4 24 GB) para procesar cientos de documentos por hora sin depender de APIs externas.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados medidos con llama.cpp en cuantizacion q8_0.

Clasificacion de tipo de documento (120 documentos, sin pista de categoria):

| Modelo | Exactitud | Errores |
|---|---|---|
| Qwen3-VL-4B (sin fine-tuning) | 87,5 % | 15 |
| carbix-v5 | 56,7 % | 52 |
| carbix-v6 | 100,0 % | 0 |

Extraccion de campos (657 documentos de prueba, con clasificacion automatica en v6):

| Categoria | v4 | v5 | v6 |
|---|---|---|---|
| Electricidad | 100,0 % | 100,0 % | 100,0 % |
| Gas | 99,85 % | 99,87 % | 99,85 % |
| Transporte | 95,43 % | 98,00 % | 98,14 % |
| Global | 98,76 % | 99,42 % | 99,43 % |
| ANLS | 0,9954 | 0,9979 | 0,9984 |
| Token-F1 | 0,9898 | 0,9947 | 0,9946 |

Nota: los valores de v4 y v5 se obtuvieron proporcionando la categoria correcta en el prompt; v6 se evaluo sin esa pista. En el modo con pista de categoria, v6 alcanza un 98,82 % de exactitud (ANLS 0,9962) sobre 807 casos. El tiempo medio por documento es de 5,0 segundos (p50: 3,5 s, p95: 11,0 s) en la configuracion de servidor indicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente, pero con el modelo GGUF q8_0 (4,28 GB) y el proyector de vision f16 (836 MB), mas el contexto de 8.192 tokens y las activaciones, se estima un consumo de entre 6 y 9 GB en GPU.
- GPU recomendadas: el autor utilizo una NVIDIA L4 de 24 GB para el entrenamiento; para inferencia, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, L4) deberia ser suficiente con la configuracion recomendada.
- Compatibilidad con GPU de consumo: si, es posible ejecutar el modelo en GPUs de consumo como la serie RTX 30/40 con 8-12 GB de VRAM, siempre que se respete el contexto y el numero de peticiones paralelas.
- Opciones de despliegue: llama.cpp (llama-server) con el comando indicado en la model card; tambien es compatible con cualquier runtime que soporte GGUF multimodal (por ejemplo, Ollama si se adapta el archivo, aunque no esta documentado).
- Rendimiento: latencia media de 5,0 s por documento (p50: 3,5 s, p95: 11,0 s) en la configuracion de referencia con --parallel 2.

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos publicados por el autor en la model card. No se dispone de informacion sobre otros modelos de extraccion de documentos de emisiones de carbono para una comparativa mas amplia.

| Caracteristica | carbix-v6 | carbix-v5 | Qwen3-VL-4B (base) |
|---|---|---|---|
| Parametros | 4.022 M (adaptador 132 MB) | 4.022 M (adaptador) | 4.022 M |
| Clasificacion sin pista | 100,0 % | 56,7 % | 87,5 % |
| Extraccion global | 99,43 % | 99,42 % | no disponible |
| ANLS | 0,9984 | 0,9979 | no disponible |
| Licencia | other | other | Qwen (propietaria) |
| Formato | GGUF q8_0 + safetensors | no especificado | safetensors |

carbix-v6 supera claramente a v5 en clasificacion automatica y mantiene una precision de extraccion practicamente identica. Frente al modelo base sin fine-tuning, la clasificacion mejora notablemente (100 % frente a 87,5 %), lo que indica que el adaptador ha aprendido la tarea especifica de forma efectiva.

## Limitaciones y advertencias

- El modelo esta especializado en documentos coreanos de emisiones de carbono; su rendimiento en documentos de otros paises o en otros idiomas no ha sido evaluado y probablemente sera significativamente inferior.
- La licencia se indica como "other" sin especificar los terminos exactos. No se garantiza el uso comercial sin revisar la licencia del modelo base Qwen3-VL-4B-Instruct y la del adaptador.
- El modelo puede alucinar campos si el documento no contiene la informacion requerida o si la imagen es de baja calidad. Aunque la precision reportada es alta, no se han documentado pruebas de robustez ante imagenes degradadas.
- La extraccion depende de la calidad de la imagen y de la resolucion del documento; el autor recomienda un minimo de 1.024 tokens de imagen (--image-min-tokens 1024).
- El prompt de entrenamiento y la estructura de salida estan fijados para el esquema de datos de la version v6; cambios en el esquema requeririan un nuevo fine-tuning.
- No se proporcionan datos sobre sesgos, comportamiento ante entradas adversas o generalizacion a tipos de documentos no vistos en el entrenamiento.
- El tiempo de inferencia (5,0 s por documento) puede ser un cuello de botella en aplicaciones de alto volumen; se recomienda evaluar el rendimiento con hardware superior si se requiere mayor throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wish418/carbix-v6
- Dataset de deteccion de gas (relacionado): https://huggingface.co/datasets/wish418/gas-detection-dataset
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
