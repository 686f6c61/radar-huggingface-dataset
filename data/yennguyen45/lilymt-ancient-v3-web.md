# yennguyen45/LilyMT-ancient-v3-web

## Resumen

LilyMT Ancient v3 Web es un modelo de traduccion automatica publicado por el usuario yennguyen45 en Hugging Face. Se distribuye como pesos ONNX cuantizados a INT8 y esta pensado para ejecutarse en el navegador o en entornos JavaScript mediante la libreria `transformers.js` (paquete `@huggingface/transformers`). La model card lo describe como una rama especializada en la traduccion de novelas antiguas ("truyen co dai") y de novelas del genero ABO de ambientacion antigua, es decir, un dominio muy concreto de la literatura web china.

El modelo se apoya en la arquitectura Marian, una familia de transformers encoder-decoder para traduccion neuronal creada originalmente por el equipo de Microsoft Research, segun indican las etiquetas del repositorio (`marian`, `text2text-generation`, `translation`). Los idiomas declarados son chino (`zh`) y vietnamita (`vi`). El repositorio ocupa aproximadamente 0,1 GB, lo que situa al modelo en el rango de los sistemas de traduccion compactos, aptos para inferencia en CPU o GPU de gama baja.

Su relevancia es de nicho: no compite en benchmarks generales de traduccion, sino que cubre un caso de uso muy especifico (traduccion chino-vietnamita de ficcion historica con sistemas de tratamiento honorifico antiguos) y un formato de despliegue poco habitual, ONNX INT8 para cliente web. El autor indica que el runtime asociado, denominado LilyVIP, aplica conversion de chino tradicional a simplificado con OpenCC, decodificacion por haz con `beam 2` y una penalizacion por repeticion de 1.2. No hay datos publicos sobre el numero de parametros, el volumen de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion neuronal, segun etiquetas del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | chino (`zh`) y vietnamita (`vi`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (INT8), compatible con `transformers.js` |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | `translation` |
| Libreria | `transformers.js` |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible procede de las etiquetas del repositorio: `marian` y `text2text-generation`. Marian es una familia de modelos seq2seq con encoder y decoder transformer, disenada especificamente para traduccion automatica y conocida por su eficiencia computacional. El modelo se publica ya cuantizado a INT8 en formato ONNX, lo que reduce el tamano de los pesos respecto a una version en punto flotante y habilita la ejecucion en entornos con recursos limitados, incluido el navegador mediante WebAssembly o WebGPU.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. La model card menciona dos elementos de proceso: por un lado, que el modelo "mantiene el sistema de tratamiento antiguo de HachiMi" y mejora el estilo de redaccion, lo que sugiere un ajuste orientado al registro literario y a los pronombres honorificos del vietnamita; por otro, que el runtime LilyVIP aplica conversion de chino tradicional a simplificado con OpenCC, decodificacion por haz con `beam 2` y penalizacion por repeticion de 1.2. Estos parametros de decodificacion son parte del pipeline de inferencia, no del entrenamiento.

## Capacidades

- Traduccion automatica entre chino y vietnamita, con especializacion declarada en novelas antiguas y en el subgenero ABO de ambientacion historica.
- Generacion de texto seq2seq orientada a traduccion (tarea `text2text-generation`), no a generacion abierta ni a conversacion.
- Preservacion del sistema de tratamiento honorifico del vietnamita antiguo, aspecto critico en la traduccion de ficcion historica donde los pronombres dependen del rango, la edad y la relacion entre personajes.
- Adaptacion de estilo literario, segun la model card, con mejora del registro de redaccion respecto a versiones anteriores de la rama.
- Ejecucion en navegador o en Node.js a traves de `transformers.js` con pesos ONNX INT8.
- Preprocesado de chino tradicional a simplificado mediante OpenCC, integrado en el runtime LilyVIP.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a los dos idiomas declarados (`zh`, `vi`); no hay constancia de otros pares.

## Casos de uso

- Traduccion de novelas web chinas al vietnamita: el modelo esta ajustado para el dominio de la ficcion historica y para el vocabulario y las formulas de tratamiento de ese genero, lo que reduce la necesidad de posedicion por parte del traductor.
- Localizacion de ficcion del subgenero ABO de ambientacion antigua: al haberse entrenado especificamente para este tipo de textos, maneja mejor la terminologia jerarquica y los tratamientos que un traductor generico.
- Plataformas de lectura en linea con traduccion integrada en el navegador: al distribuirse como ONNX INT8 y funcionar con `transformers.js`, permite traducir en el propio cliente sin enviar el texto a un servidor externo, lo que es relevante para contenido con derechos de autor.
- Extensiones de navegador o lectores de novelas: un plugin puede invocar el modelo para traducir capitulos al vuelo aprovechando la ejecucion local en WebAssembly o WebGPU.
- Aplicaciones de escritorio o moviles basadas en JavaScript: cualquier entorno que soporte ONNX Runtime puede integrar el modelo sin depender de infraestructura de GPU en el servidor.
- Pretraduccion en flujos editoriales: usar el modelo como primera pasada sobre capitulos completos y reservar la revision humana para el ajuste de estilo y la coherencia terminologica, con el consiguiente ahorro de tiempo.
- Investigacion sobre traduccion de registros historicos: permite estudiar como se comportan los modelos Marian compactos ante fenomenos de cortesia y jerarquia social en pares de idiomas con poca representacion en corpus paralelos.
- Prototipado rapido de funciones de traduccion en demos web: el tamano reducido del repositorio (0,1 GB) facilita la carga del modelo en entornos de demostracion y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas como BLEU, chrF, COMET, MMLU o HumanEval, ni comparaciones cuantitativas con otros sistemas de traduccion. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con pesos ONNX INT8 y un repositorio de 0,1 GB, la huella en memoria es reducida y la inferencia puede ejecutarse en CPU sin GPU dedicada, aunque no se publican cifras oficiales.
- GPU recomendadas: no disponibles. Por el tamano del artefacto, cualquier GPU consumer moderna (por ejemplo, una RTX 3060 o superior) es suficiente en terminos de memoria; no hay datos especificos de rendimiento por modelo.
- Compatibilidad con GPU consumer: si, previsiblemente cualquier GPU consumer es suficiente dado el tamano del repositorio y la cuantizacion INT8, aunque no hay validacion publicada.
- Opciones de despliegue: `transformers.js` en navegador (WebAssembly o WebGPU), ONNX Runtime en Node.js y entornos de escritorio. Segun la documentacion publica de vLLM, esa herramienta incluye soporte para la arquitectura MarianMT, lo que permitiria servir el modelo en formato compatible con Hugging Face Transformers, siempre que se disponga de los pesos en `safetensors` y no solo del artefacto ONNX. Las herramientas orientadas a modelos decoder-only de gran tamano (TGI, entre otras) no estan pensadas para esta arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| LilyMT Ancient v3 Web (yennguyen45) | no disponible | no disponible | zh, vi | no disponible | Hugging Face, ONNX INT8 | Especializado en novela antigua y genero ABO; ejecucion en navegador con `transformers.js` |
| NLLB-200-distilled-600M (Meta) | 600 M | no disponible en esta ficha | 200 idiomas | CC-BY-NC-4.0 (uso comercial restringido) | Hugging Face | Traduccion multilingue generalista; no especializado en registro historico ni en el par zh-vi |
| M2M-100 418M (Meta) | 418 M | no disponible en esta ficha | 100 idiomas | MIT | Hugging Face | Traduccion many-to-many directa; cobertura amplia pero sin ajuste de dominio literario |
| Modelos Marian genericos del proyecto OPUS-MT (Helsinki-NLP) | del orden de decenas de millones por par de idiomas | no disponible en esta ficha | pares de idiomas concretos | habitualmente licencias abiertas por modelo | Hugging Face | Base de traduccion compacta y muy extendida; sin especializacion declarada en ficcion historica |

Los datos de los modelos comparativos corresponden a informacion publica general de sus respectivas fichas y no se han verificado contra este modelo, cuyos parametros y licencia no estan publicados.

## Limitaciones y advertencias

- No se declara licencia en el repositorio. Sin una licencia explicita, no puede asumirse permiso para uso comercial ni para redistribucion; es imprescindible contactar con el autor antes de integrarlo en un producto.
- La model card esta redactada en vietnamita y es muy breve: no documenta datos de entrenamiento, metricas, limitaciones ni sesgos conocidos.
- El modelo no publica numero de parametros ni longitud de contexto, lo que dificulta planificar el troceado de textos largos (capitulos completos, por ejemplo) y estimar la calidad en entradas extensas.
- Riesgo de alucinacion y de omision de contenido inherente a cualquier sistema de traduccion neuronal, especialmente en textos largos y con referencias culturales muy marcadas.
- Cobertura limitada a chino y vietnamita; no debe esperarse ningun rendimiento util en otros pares de idiomas.
- El registro de entrenamiento es de ficcion antigua y genero ABO, por lo que el comportamiento en textos tecnicos, legales, medicos o periodisticos sera previsiblemente deficiente.
- La preservacion del sistema de tratamiento antiguo puede producir traducciones marcadas estilisticamente que no encajen en contextos contemporaneos.
- Sesgos de genero y de jerarquia social: el genero ABO incluye convenciones muy especificas que pueden trasladarse a la salida y no ser apropiadas para otros dominios.
- El repositorio registra 0 descargas y 0 likes, sin historial de validacion por parte de terceros y sin issues publicos que permitan evaluar su fiabilidad.
- La fecha de creacion indicada (2026-09-22) es posterior a la fecha actual en muchos entornos, lo que conviene verificar antes de tratarla como referencia temporal fiable.
- Ejecucion en navegador con `transformers.js` implica limitaciones de memoria y de tiempo de carga del cliente, especialmente en dispositivos moviles.
- Los parametros de decodificacion documentados (`beam 2`, `repetition penalty` 1.2) y el preprocesado con OpenCC forman parte del runtime LilyVIP; usos fuera de ese pipeline pueden degradar la calidad de forma notable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yennguyen45/LilyMT-ancient-v3-web
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
