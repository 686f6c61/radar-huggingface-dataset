# xmanii/Mizan-v2-4B-GGUF

## Resumen

Mizan v2 4B GGUF es la version cuantizada en formato GGUF de Mizan v2 4B, un modelo de decision multimodal (texto e imagen) desarrollado por xmanii (mani mirzaei) y publicado bajo el paraguas del proyecto Nimruz. Su proposito no es la generacion de texto libre, sino responder preguntas tipadas (eleccion, puntuacion, si/no) devolviendo probabilidades calibradas en una sola pasada forward, a traves del endpoint `/v1/systemone` compatible con Jev/SystemOne de llama.cpp.

El modelo parte de un backbone de aproximadamente 4.237.797.892 parametros y se distribuye ya cuantizado en Q8_0 y Q4_K_M, junto con un proyector de vision (mmproj) que solo se necesita cuando se procesan imagenes. Esta orientado principalmente al persa (farsi), con soporte adicional de ingles, y esta pensado para escenarios industriales concretos como videovigilancia, control de calidad en fabrica o lectura de tickets.

Su relevancia actual radica en que empaqueta un modelo de decision multimodal en un paquete ligero que cabe en una GPU de gama de entrada de 8 GB (el fichero Q4_K_M ocupa 2,7 GB y el proyector 0,37 GB), con licencia Apache-2.0, lo que facilita su despliegue en entornos de produccion con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector de vision; el detalle exacto de la arquitectura no esta disponible en la informacion proporcionada |
| Parametros totales | 4.237.797.892 (~4,24 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens (valor usado en el ejemplo oficial de llama.cpp; el maximo soportado no esta confirmado) |
| Tipos de cuantizacion | Q8_0 (4,5 GB), Q4_K_M (2,7 GB); el conjunto completo de cuantizaciones GGUF no esta detallado |
| Idiomas soportados | persa (fa) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo multimodal con etiqueta `image-text-to-text` y un proyector de vision separado (`mmproj-mizan-v2-4b-Q8_0.gguf`) que se activa unicamente cuando se procesan imagenes. El modo de operacion es de "decision model": recibe un estado (`state`), opcionalmente una lista de imagenes y un conjunto de preguntas tipadas (`choice`, `score`, `yes/no`, `noul` en el ejemplo), y devuelve probabilidades calibradas en una unica pasada forward a traves del endpoint `/v1/systemone` de llama.cpp.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que existen detalles de entrenamiento en la tarjeta del modelo base (xmanii/Mizan-v2-4B), pero estos no se han incluido en el material facilitado. La innovacion tecnica destacable es el enfoque de decision con probabilidades calibradas integrado en llama.cpp, en lugar de un paradigma generativo clasico.

## Capacidades

- Razonamiento de decision tipado: responde preguntas de eleccion, puntuacion y si/no con probabilidades calibradas en una sola pasada.
- Procesamiento de texto en persa (primario) e ingles.
- Vision multimodal: analisis de imagenes a traves del proyector mmproj (deteccion de personas, vehiculos, productos, tickets).
- Respuestas a preguntas visuales concretas: presencia de personas o vehiculos en el encuadre, recuento de personas, tipo de vehiculo, presencia en zona delimitada ("zona roja").
- Lectura documental: extraccion de totales y lineas de detalle en tickets o recibos.
- Control de calidad visual: determinacion de si un producto es defectuoso y clasificacion de producto por fabrica.
- Integracion via API compatible con llama.cpp (`/v1/systemone`), con envio de imagenes como data URLs.
- Soporte multilingue limitado a persa e ingles; no consta soporte de otras lenguas.

## Casos de uso

- Videovigilancia en aparcamientos: procesar fotogramas de camaras (por ejemplo `cam03.jpg`) para responder si hay una persona o un vehiculo dentro de una zona delimitada. El modelo alcanzo un 92% de exactitud balanceada en "vehiculo en zona roja" y un 95% en "persona en el encuadre", lo que lo hace util para alertas automatizadas en tiempo real sobre GPU de 8 GB.
- Control de acceso y conteo de ocupacion: responder "cuantas personas hay" en una imagen (92% de exactitud balanceada, n=40) para gestionar aforos en interiores.
- Inspeccion de calidad en fabrica: determinar si un producto es defectuoso (77% de exactitud balanceada, n=150) y clasificar el producto por fabrica (100%, n=70), integrándolo en una linea de inspeccion con llama-server en una GPU de gama de entrada.
- Procesamiento automatico de tickets y facturas: responder si el total supera un umbral X (97%, n=150) y extraer las lineas de detalle (95%, n=91), util para validacion de gastos o conciliacion contable.
- Clasificacion de trafico y flota: identificar el tipo de vehiculo (87%, n=44) a partir de imagenes de camaras, para inventario o analitica de movilidad.
- Despliegue en lote sobre CPU: para procesos por lotes sin GPU, el modelo responde en aproximadamente 3 segundos por peticion de texto en una maquina de 16 nucleos, adecuado para tareas offline de clasificacion masiva.
- Modulo de decision dentro de un pipeline de agentes: usar `/v1/systemone` como subsistema de decision binaria o puntuada, dejando la generacion de lenguaje a otro modelo y limitando este a la evaluacion probabilistica.

## Benchmarks y rendimiento

Rendimiento en texto (benchmark real de persa, segun la model card):

| Version | Tamano | Texto (benchmark persa real) |
|---|---|---|
| Modelo a precision completa | no disponible | 82,8% |
| `mizan-v2-4b-Q8_0.gguf` | 4,5 GB | 82,8% |
| `mizan-v2-4b-Q4_K_M.gguf` | 2,7 GB | 82,7% |

Exactitud balanceada en imagenes (Q4 + proyector, imagenes no vistas en entrenamiento; llama.cpp):

| Pregunta | Exactitud balanceada | n |
|---|---|---|
| Persona en el encuadre | 95% | 51 |
| Vehiculo en el encuadre | 100% | 42 |
| Tipo de vehiculo | 87% | 44 |
| Persona en zona roja | 70% | 12 |
| Vehiculo en zona roja | 92% | 16 |
| Cuantas personas hay | 92% | 40 |
| Total del ticket por encima de X | 97% | 150 |
| Lineas de detalle del ticket | 95% | 91 |
| Que producto (fabrica) | 100% | 70 |
| Producto defectuoso | 77% | 150 |

Advertencia del propio autor: las muestras son pequenas (de 12 a 150 por pregunta), por lo que cabe esperar una variacion de mas o menos 5 a 10 puntos. La model card principal contiene una prueba de mayor tamano con el modelo completo. No se han publicado otros benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan 2,7 GB y el proyector de vision 0,37 GB; el modelo Q8_0 ocupa 4,5 GB. A esto hay que sumar la cache KV y los tokens de imagen, que dependen de la resolucion de entrada.
- GPU recomendadas: el autor indica que una tarjeta de gama de entrada de 8 GB es suficiente para uso en tiempo real (GPU). No se especifican otros modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: si, cabe en tarjetas consumer de 8 GB o mas (por ejemplo, gama de entrada de 8 GB mencionada en la model card).
- CPU: funciona para trabajos por lotes, con aproximadamente 3 segundos por peticion de texto en 16 nucleos.
- Opciones de despliegue: llama.cpp mediante `llama-server` (requiere version b11443 o superior) y el endpoint `/v1/systemone`. Compatible con el ecosistema GGUF y con el tag `endpoints_compatible` de HuggingFace. No se mencionan vLLM, TGI u Ollama.
- Parametros de ejecucion relevantes: `-c 8192 -b 8192 -ub 8192 -ngl 99`; el valor de `-ub` debe cubrir la entrada mas larga, incluidos los tokens de imagen.
- Latencia y throughput: no se publican cifras de throughput; solo la referencia de ~3 s por peticion de texto en CPU de 16 nucleos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria (modelos de decision multimodal en persa con licencia permisiva) que permitan una comparacion rigurosa. El modelo base de referencia es xmanii/Mizan-v2-4B, del que esta version GGUF es una cuantizacion directa.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| xmanii/Mizan-v2-4B-GGUF (este) | ~4,24 mil millones | 8.192 tokens (ejemplo) | Apache-2.0 | Version cuantizada GGUF del modelo base |
| xmanii/Mizan-v2-4B | ~4,24 mil millones (dato no confirmado) | no disponible | Apache-2.0 (segun el modelo derivado) | Modelo base a precision completa |
| Otros modelos comparables | no disponible | no disponible | no disponible | No hay datos en la informacion disponible |

## Limitaciones y advertencias

- Tamanos de muestra muy pequenos en los benchmarks de imagen (de 12 a 150 ejemplos), con variacion esperada de mas o menos 5 a 10 puntos; los resultados no deben tratarse como definitivos.
- Rendimiento debil en tareas concretas: la deteccion de "persona en zona roja" solo alcanza un 70% de exactitud balanceada y "producto defectuoso" un 77%.
- El propio autor reconoce limitaciones pendientes, entre ellas la localizacion del defecto y advertencias sobre videovigilancia (CCTV) real.
- Riesgo de alucinacion: al ser un modelo de decision que devuelve probabilidades, es esperable que exista incertidumbre; no se documentan tasas de calibracion fuera de los benchmarks citados.
- Cobertura de idiomas limitada a persa e ingles; no hay soporte declarado de castellano ni de otras lenguas.
- No es un modelo generativo conversacional al uso: su funcion es responder preguntas tipadas, no mantener dialogos abiertos, aunque el tag `conversational` aparece en los metadatos.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento del modelo base, no detalladas en la informacion disponible.
- Requiere llama.cpp b11443 o superior; versiones anteriores pueden no soportar el endpoint `/v1/systemone`.
- El ajuste de `-ub` debe cubrir la entrada completa (incluidos tokens de imagen); de lo contrario, las imagenes grandes pueden truncarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de soporte y comunidad muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xmanii/Mizan-v2-4B-GGUF
- Modelo base: https://huggingface.co/xmanii/Mizan-v2-4B
- Demo en vivo: https://huggingface.co/spaces/xmanii/Mizan-demo
- Proyecto Nimruz: https://nimruz.site
- Perfil del autor en HuggingFace: https://huggingface.co/xmanii/models
- Directorio de modelos GGUF (descubrimiento): https://local-ai-zone.github.io/
- Hugging Bay (catalogo de modelos): https://huggingbay.xyz/
- Busqueda de modelos con libreria GGUF en HuggingFace: https://huggingface.co/models?library=gguf
