# yijuchen/DeepSeek-V4.1-Flash-FP4PTPC

## Resumen

DeepSeek-V4.1-Flash-FP4PTPC es una version cuantizada y publicada por el usuario yijuchen del modelo multimodal DeepSeek-V4.1-Flash, desarrollado originalmente por DeepSeek AI. Se distribuye bajo licencia MIT, en formato safetensors y con pipeline image-text-to-text, e incorpora etiquetas de cuantizacion de 8 bits y w8a8_fp8. El repositorio ocupa 510,3 GB y los ficheros safetensors declaran 484.619.644.114 parametros almacenados (≈484,6B), frente a los 552B de parametros de backbone que declara la model card del modelo original. Esta diferencia es coherente con un guardado en precision reducida y con la presencia de la memoria condicional Engram, que se accede de forma dispersa.

El modelo original es un Mixture-of-Experts multimodal con arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder) y soporte nativo de contextos de hasta un millon de tokens. Su propuesta central es la compresion agresiva de la cache KV: mediante Compressed Sparse Attention 2, FP4 para la cache KV principal y SWA Bounded Replay, reduce el consumo a unos 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1. Ademas, activa solo 8B de parametros por token en prefill y 16B en decodificacion, lo que abarata las cargas agenticas con entradas muy largas.

Su relevancia actual es doble. Por un lado, ataca el cuello de botella economico de los agentes y de la inferencia con contexto largo, que suele ser el coste de memoria de la cache KV y no el de los pesos. Por otro, introduce un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que permite intercambiar coste de inferencia por precision. Conviene senalar que el repositorio analizado no es la publicacion oficial de DeepSeek AI, sino una conversion de terceros con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): transformer de 40 capas, 20 de encoder causal mas 20 de decoder, con Mixture-of-Experts (1 experto compartido y 384 expertos enrutados por capa, 6 activados por token) |
| Parametros totales | 484.619.644.114 en los safetensors del repositorio; la model card del modelo original declara 552B de backbone y 196B adicionales en memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decodificacion |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Repositorio etiquetado como 8-bit y w8a8_fp8; la arquitectura original usa cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura CED separa el modelo en un encoder causal de 20 capas y un decoder de 20 capas. La innovacion clave es que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados propios de cada capa del decoder. Esto es lo que permite activar solo 8B de parametros por token en prefill y 16B en decode. Sobre esa base se anaden varios mecanismos: SWA Bounded Replay, que reconstruye los estados KV de atencion de ventana deslizante replicando unicamente los ultimos n_win tokens y evita persistir esa cache en SSD, reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash; Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices Top-K; y un Hierarchical Sparse Indexer que restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full. Ademas incorpora Single-Pass mHC (mezcla del flujo residual con kernel Mega-mHC), memoria condicional Engram de 196B de parametros de acceso disperso por lookup de token y decodificacion especulativa DSpark con verificacion programada por confianza.

En el lado multimodal, un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento. El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atencion dispersa entrenada a 64K de longitud de secuencia y extension de contexto hasta 1M a partir de los 34T tokens. El post-entrenamiento sigue el paradigma estandar SFT, luego RL y luego destilacion on-policy (OPD), sin modificaciones algoritmicas; los cambios sustantivos estan en el pipeline de datos, con sintesis automatizada a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generacion de texto autorregresiva con soporte nativo de entradas multimodales (imagen y texto), e inferencia de un solo paso sobre la parte visual.
- Razonamiento con esfuerzo controlable de forma continua mediante un ajuste entero de 1 a 100, que permite intercambiar coste de inferencia por precision.
- Procesamiento de contextos de hasta 1.000.000 de tokens, orientado a cargas con entradas muy pesadas.
- Ejecucion de tareas de agente y razonamiento multi-paso, con datos de entrenamiento generados especificamente para entornos y tareas agenticas.
- Decodificacion especulativa integrada (DSpark), con generacion de borradores semiautorregresiva y verificacion programada por confianza.
- Recuperacion de informacion en contexto largo y reutilizacion de indices de atencion dispersa a traves de CSA2.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la orientacion agentica del post-entrenamiento lo hace plausible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes con entradas masivas: el modelo activa solo 8B de parametros por token en prefill, de modo que tareas de agente que consumen decenas de miles de tokens de contexto (historial de herramientas, ficheros, trazas) resultan mucho mas baratas que con un decoder denso equivalente.
- Analisis de documentos largos con imagenes intercaladas: informes anuales, patentes o expedientes con tablas y figuras se pueden enviar en una sola ventana de hasta 1M tokens, evitando troceado y perdida de coherencia entre fragmentos.
- Revision de repositorios de codigo completos: con contexto de 1M tokens y 890 bytes de cache KV por token, es viable cargar arboles de codigo extensos para deteccion de bugs, refactorizacion o generacion de pruebas.
- Atencion al cliente automatizada multi-turno: la baja huella de KV (0,89 GB por secuencia de 1M tokens) permite mantener muchas conversaciones concurrentes en el mismo hardware, con historial largo sin truncar.
- RAG sobre corpus corporativos extensos: al reducirse la cache KV a 1/4 de la de DeepSeek-V4-Flash, se puede aumentar el numero de documentos recuperados por consulta sin disparar la memoria de servicio.
- Procesamiento por lotes de documentacion tecnica: la combinacion de vision y texto permite ingerir manuales escaneados y extraer estructuras, resumenes y respuestas en pipelines nocturnos.
- Planificacion con presupuesto de razonamiento variable: el ajuste de esfuerzo de 1 a 100 permite usar valores bajos en tareas rutinarias y altos solo en consultas criticas, controlando el coste por peticion.
- Servicio de inferencia de alto rendimiento con decodificacion especulativa: DSpark y la compresion de KV reducen el coste por token generado en despliegues con muchas peticiones simultaneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una seccion de resultados de evaluacion, una figura de rendimiento agentico (assets/dsv41_agentic_performance.png) y un informe tecnico en PDF, pero los valores numericos no aparecen en el material proporcionado, que se corta al indicar que las puntuaciones con una diferencia inferior a 0,3 se consideran equivalentes. No se deben extrapolar cifras a partir de esa afirmacion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 485 GB si se mantiene el guardado en 8 bits declarado (484,6B parametros), y en torno a 970 GB en BF16/FP16. El repositorio completo ocupa 510,3 GB en disco.
- Multi-GPU obligatorio: 8 GPU H100 de 80 GB (640 GB) cubren los pesos en 8 bits con poco margen, por lo que se recomienda 2 nodos de 8x H100 o configuraciones de 16 GPU para dejar espacio a la cache KV, los buffers de activaciones y el encoder de vision.
- Cache KV: con 890 bytes por token, una secuencia completa de 1M tokens consume unos 0,89 GB; a 256K tokens, unos 0,23 GB. Esta es la ventaja principal del diseno frente a generaciones anteriores.
- GPU de consumo: no cabe. Ni siquiera repartiendo el modelo entre varias RTX 4090 de 24 GB resulta practico, ya que el peso en 8 bits exige mas de 480 GB de memoria agregada, sin contar el coste de comunicacion.
- Opciones de despliegue: el repositorio esta etiquetado con transformers y endpoints_compatible. No se confirma en la informacion disponible soporte oficial en vLLM, SGLang, TGI, llama.cpp u Ollama; dada la arquitectura personalizada (CED, CSA2, Engram, DSpark) y el tamano, es razonable esperar que requiera una version especifica de transformers o kernels propios, pero esto no esta verificado en el material consultado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-FP4PTPC (este repositorio) | 484,6B almacenados; 552B de backbone declarados | 8B en prefill, 16B en decode | 1M tokens | 890 bytes | MIT | Repositorio de comunidad, 0 descargas y 0 likes |
| DeepSeek-V4.1-Flash (original, DeepSeek AI) | 552B de backbone | 8B en prefill, 16B en decode | 1M tokens | 890 bytes | MIT | Publicacion oficial de DeepSeek AI |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | Aproximadamente 4 veces mayor (≈3.560 bytes por token) | no disponible | Oficial de DeepSeek AI |
| DeepSeek-V1 | no disponible | no disponible | no disponible | Aproximadamente 437 veces mayor | no disponible | Oficial de DeepSeek AI |

No se dispone de datos de parametros, contexto, licencia ni disponibilidad de las generaciones comparadas, salvo las relaciones de tamano de cache KV que la propia model card indica. No se han incluido modelos de terceros por falta de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es una publicacion oficial: el autor es yijuchen, no DeepSeek AI. La procedencia exacta de los pesos y el proceso de cuantizacion no se documentan en la informacion disponible.
- Inconsistencia de nomenclatura: el identificador del modelo dice FP4PTPC, mientras que las etiquetas indican 8-bit y w8a8_fp8. No se aclara que esquema se aplica a pesos y cual a la cache KV, ni si el resultado degrada la calidad respecto al modelo original.
- Sin traccion verificable: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin benchmarks publicados en la informacion disponible para esta version cuantizada, por lo que no se puede cuantificar la perdida de precision frente al modelo original.
- La cuantizacion a 8 bits y el formato FP4 de la cache KV pueden afectar a tareas sensibles a la precision numerica, como matematicas avanzadas o razonamiento de muchos pasos.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad para este modelo.
- Idiomas soportados: no disponible. No se puede confirmar un rendimiento equilibrado fuera del ingles y el chino.
- La ventana de 1M tokens no implica recuperacion fiable de informacion en cualquier posicion; la atencion dispersa con indices Top-K puede degradar el recall en contextos muy largos.
- Requisitos de infraestructura muy altos (mas de 480 GB de VRAM y 510 GB de descarga), lo que limita el uso a clusters con multiples H100 o equivalentes.
- La licencia declarada es MIT, permisiva para uso comercial, pero al tratarse de una conversion de terceros conviene verificar la cadena de licencias del modelo original antes de desplegarlo en produccion.
- El ajuste de esfuerzo de razonamiento (1 a 100) introduce un parametro adicional de calidad/coste que debe validarse por caso de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yijuchen/DeepSeek-V4.1-Flash-FP4PTPC
- Informe tecnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion oficial de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Cuenta de DeepSeek AI en Twitter/X: https://twitter.com/deepseek_ai
- Repositorio de figuras y logotipo de DeepSeek-V2 usado en la model card: https://github.com/deepseek-ai/DeepSeek-V2
