# vlad-grig/opus-mt-en-it

## Resumen

`vlad-grig/opus-mt-en-it` es una redistribucion en formato ONNX del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-it`, publicado por el usuario vlad-grig bajo licencia CC-BY-4.0. No se trata de un entrenamiento nuevo: el repositorio empaqueta unicamente los pesos necesarios para ejecutar el modelo en un navegador web mediante Transformers.js, con el objetivo declarado de que un plugin de WordPress que traduce catalogos de productos lo haga en el propio navegador del comerciante sin depender de un repositorio de terceros. La conversion sigue el trabajo previo de Xenova sobre el mismo modelo.

El modelo subyacente es un Marian de traduccion ingles a italiano desarrollado por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Se trata de un transformer encoder-decoder de proposito especifico, orientado a traduccion directa en un unico sentido (en a it) y sin capacidades de instruccion, razonamiento ni generacion libre. Su relevancia practica esta en el formato: permite traduccion local, sin enviar texto a un servidor, lo que resulta util para flujos con requisitos de privacidad o para funcionar sin conexion.

El repositorio ocupa 0,6 GB e incluye solo dos variantes de cuantizacion: fp32 para WebGPU y q8 para el fallback en WebAssembly. No incluye el resto de cuantizaciones disponibles en otras conversiones. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), segun las etiquetas del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (WebGPU) y q8 (WebAssembly) |
| Idiomas soportados | ingles a italiano (direccion unica segun la model card); no se detalla cobertura adicional |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (repositorio orientado a Transformers.js) |

## Arquitectura y entrenamiento

La etiqueta `marian` del repositorio indica que el modelo subyacente pertenece a la familia Marian, una arquitectura transformer de tipo encoder-decoder desarrollada para traduccion automatica neuronal. La model card de este repositorio no aporta hiperparametros (numero de capas, dimension del modelo, cabezas de atencion, vocabulario) ni detalles sobre el corpus de entrenamiento, el numero de tokens o el uso de tecnicas de alineacion posteriores. Toda esa informacion, si existe, corresponde a la model card del modelo original `Helsinki-NLP/opus-mt-en-it`, que no forma parte de los datos proporcionados.

Lo unico que este repositorio aporta respecto al original es la conversion a ONNX para su ejecucion en navegador. Segun la model card, se incluyen deliberadamente solo los pesos que un navegador carga en la practica: fp32 para WebGPU y q8 para el fallback en WebAssembly. No hay destilacion, ajuste fino posterior, RLHF ni DPO documentados en la informacion disponible, y el propio autor indica de forma explicita que "nothing here is new work".

## Capacidades

- Traduccion de texto de ingles a italiano en un unico sentido; no se documenta la direccion inversa en este repositorio.
- Ejecucion integra en el navegador del cliente mediante Transformers.js, con aceleracion WebGPU y fallback a WebAssembly.
- Funcionamiento local: el texto no se envia a ningun servidor, ya que la inferencia ocurre en el dispositivo del usuario.
- Uso como componente de un plugin de WordPress para la traduccion de catalogos de productos, que es el caso de uso declarado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta capacidad multilingue mas alla del par ingles-italiano.

## Casos de uso

- Traduccion de catalogos de productos en comercio electronico: es el escenario para el que se creo el repositorio. El plugin de WordPress ejecuta el modelo en el navegador del propietario de la tienda, de modo que los textos del catalogo en ingles se convierten a italiano sin salir del equipo.
- Traduccion de documentacion tecnica de ingles a italiano: el modelo puede procesar parrafos y secciones de manuales o guias antes de su publicacion, con revision humana posterior dada la ausencia de benchmarks publicados.
- Cumplimiento de requisitos de privacidad y RGPD: al ejecutarse en local, el contenido traducido no abandona el dispositivo, lo que simplifica el tratamiento de textos con datos personales o informacion comercial sensible.
- Traduccion en entornos sin conectividad o con red restringida: el fallback q8 sobre WebAssembly permite operar con CPU cuando no hay GPU disponible o cuando el acceso a servicios en la nube no esta permitido.
- Preprocesado de corpus en investigacion: generacion de traducciones en-ingles a italiano para crear pares paralelos preliminares o para tareas de aumento de datos, siempre con filtrado y evaluacion manual.
- Soporte a la redaccion multilingue en pequenos equipos: traduccion de correos, fichas de producto y avisos internos al italiano como primer borrador que luego se revisa.
- Traduccion de contenidos generados por usuarios en una web: comentarios, resenas o mensajes que llegan en ingles y se muestran en italiano, con la ventaja de que el procesamiento ocurre en el navegador del visitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (BLEU, chrF, COMET ni similares) y tampoco ofrece datos de latencia o throughput.

## Requisitos de hardware

- El repositorio completo ocupa 0,6 GB e incluye las dos variantes de pesos; en ejecucion solo se descarga la que el runtime necesita, fp32 para WebGPU o q8 para WebAssembly.
- Al ser un modelo Marian de traduccion de un unico par de idiomas, es previsible que quepa con holgura en GPU de consumo, pero no se dispone de cifras de VRAM confirmadas en la informacion proporcionada.
- GPU de servidor tipo A100, H100 o similares no son necesarias para este caso de uso; no se documenta ningun escenario que las requiera.
- Despliegue en navegador con Transformers.js, con backend WebGPU cuando esta disponible y WebAssembly como alternativa en CPU.
- Los pesos PyTorch originales, publicados en `Helsinki-NLP/opus-mt-en-it`, permiten otros runtimes fuera del navegador; este repositorio concreto esta orientado a Transformers.js.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Direccion | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| vlad-grig/opus-mt-en-it | Marian | en a it | ONNX (fp32, q8) | CC-BY-4.0 | Redistribucion para Transformers.js; 0 descargas; no incluye pesos PyTorch |
| Xenova/opus-mt-en-it | Marian | en a it | ONNX | CC-BY-4.0 | Conversion previa en la que se basa esta; no se detallan sus variantes de cuantizacion en la informacion disponible |
| Helsinki-NLP/opus-mt-en-it | Marian | en a it | Pesos PyTorch | CC-BY-4.0 | Modelo original de la Universidad de Helsinki; sin datos de rendimiento en la informacion disponible |

No se dispone de datos de parametros, contexto o rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, direccion de traduccion, formatos y licencia.

## Limitaciones y advertencias

- Solo traduce de ingles a italiano. Para la direccion contraria hace falta otro modelo del proyecto OPUS-MT.
- No hay benchmarks publicados en la informacion disponible, por lo que no se puede estimar su calidad frente a alternativas sin una evaluacion propia.
- Es una redistribucion, no un modelo nuevo: el autor lo indica expresamente en la model card. La calidad depende integramente del modelo original de Helsinki-NLP.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de uso en produccion.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion. La propia model card recuerda que hay que atribuir el trabajo al Language Technology Research Group de la Universidad de Helsinki y a la conversion de Xenova.
- Riesgo de alucinacion y de omision de contenido, habitual en modelos de traduccion de este tamano, especialmente con frases largas, terminologia muy especializada o textos con mucho ruido.
- La model card no especifica la longitud de contexto ni la politica de segmentacion; en catalogos de productos conviene dividir los textos en fragmentos cortos.
- Dominio limitado: el caso de uso declarado son catalogos de productos, y no hay garantia de buen comportamiento en generos como texto legal, medico o literario.
- No se documentan idiomas distintos del par en-it ni variantes regionales del italiano.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vlad-grig/opus-mt-en-it
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
- Conversion previa en la que se basa: https://huggingface.co/Xenova/opus-mt-en-it
- Transformers.js: https://github.com/huggingface/transformers.js
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales.
