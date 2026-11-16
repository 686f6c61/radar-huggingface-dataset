# speakleash/Bielik-Minitron-7B-v3.0-Instruct-AWQ

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-AWQ es la version cuantizada en 4 bits con AWQ del modelo instructivo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, el proyecto polaco de IA abierta centrado en modelos con fuerte soporte del idioma polaco. El modelo base parte de una arquitectura Llama con 7.477.727.232 parametros totales (aproximadamente 7,5 mil millones), y esta version AWQ reduce el peso del repositorio a 4,3 GB, lo que facilita su despliegue en GPUs de consumo y en entornos de inferencia con memoria limitada.

La relevancia de esta ficha radica en que se trata de una cuantizacion oficial publicada bajo licencia Apache 2.0, con soporte declarado para 31 idiomas, incluyendo polaco, ingles, espanol, aleman, frances, italiano, portugues, ruso y ucraniano, entre otros. Al estar empaquetada en formato AWQ y safetensors, esta pensada para motores de inferencia que soportan cuantizacion de 4 bits, como vLLM, y no para llama.cpp en formato GGUF.

No se dispone de informacion publica sobre el pipeline, los benchmarks ni los detalles de entrenamiento en la informacion proporcionada, por lo que la ficha se limita a los datos verificables de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only), segun el tag `llama`; detalles internos no disponibles |
| Parametros totales | 7.477.727.232 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4 bits (pesos cuantizados); no se indican otros formatos en el repo |
| Idiomas soportados | multilingual, pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv (31 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), AWQ 4 bits |

## Arquitectura y entrenamiento

El modelo base es Bielik-Minitron-7B-v3.0-Instruct, un transformer decoder-only de la familia Llama con 7.477.727.232 parametros. La model card de esta version AWQ no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la innovacion tecnica del modelo base mas alla de su naturaleza instructiva y su enfoque multilingue con especial atencion al polaco.

Esta publicacion concreta es una cuantizacion AWQ de 4 bits del modelo base, generada a partir de la revision `5808ff03c95122d05cb860d11ba75b1efad98380`. El formato de pesos es safetensors con metadatos de compressed-tensors, lo que indica compatibilidad con stacks de inferencia que soportan AWQ, como vLLM. No se documentan en la informacion disponible detalles sobre calibracion, grupo de cuantizacion ni precision de activaciones.

## Capacidades

- Generacion de texto instructivo en 31 idiomas, con especial cobertura del polaco y el ingles.
- Razonamiento y respuesta a instrucciones en formato conversacional, al tratarse de una variante Instruct.
- Capacidades multilingues amplias: espanol, aleman, frances, italiano, portugues, neerlandes, checo, eslovaco, esloveno, croata, serbio, bosnio, bulgaro, rumano, hungaro, griego, turco, ucraniano, ruso, danes, sueco, noruego, finlandes, estonio, lituano, letono, islandes, albanes y bielorruso, ademas de polaco e ingles.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido (thinking mode) en la documentacion proporcionada.
- No se confirma soporte de codigo o matematicas mas alla de lo esperable en un modelo instructivo generalista; no hay datos verificables.

## Casos de uso

- Atencion al cliente en polaco y otros idiomas de Europa central y oriental: el modelo cubre polaco, checo, eslovaco, hungaro, rumano y ucraniano, lo que permite desplegar un unico modelo para soporte multilingue en la region sin recurrir a traduccion intermedia.
- Procesamiento de documentacion administrativa y legal en polaco: la variante Instruct permite resumir, extraer y reformular textos en un idioma con menos cobertura en modelos generalistas, con licencia Apache 2.0 que facilita su uso en el sector publico y privado.
- Despliegue en GPUs de consumo: al estar cuantizado en AWQ 4 bits con un repo de 4,3 GB, puede ejecutarse en tarjetas con 8-12 GB de VRAM mediante motores compatibles con AWQ, lo que abarata prototipos y entornos de desarrollo.
- Generacion de contenido multilingue para comercio electronico: descripciones de producto, respuestas a resenas y correos en varios idiomas europeos con un solo modelo, reduciendo la complejidad operativa.
- Asistentes conversacionales en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, adecuado para integrar en productos SaaS.
- Investigacion en PLN (procesamiento de lenguaje natural) para idiomas eslavos y balticos: sirve como linea base cuantizada para experimentos de evaluacion multilingue y comparacion con modelos mayores.
- Educacion y traduccion asistida: generacion de explicaciones y borradores de traduccion entre polaco, ingles y espanol, con la ventaja de un unico checkpoint multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos AWQ de 4 bits con un repo de 4,3 GB, se estima un uso de VRAM en torno a 5-7 GB para el modelo y overhead de inferencia, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar compatibilidad con GPUs de 8-16 GB de VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 8 GB o mas de VRAM, pero no hay confirmacion oficial en la model card.
- Opciones de despliegue: motores compatibles con AWQ y safetensors/compressed-tensors, como vLLM. No se indica soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-AWQ | 7,48 B | no disponible | Apache 2.0 | safetensors AWQ 4 bits | Foco en polaco y 31 idiomas |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 7,48 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Alternativas de 7B multilingues | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- La cuantizacion AWQ de 4 bits puede introducir una perdida de calidad respecto al modelo base, especialmente en tareas de razonamiento complejo o generacion de codigo; no se documenta la degradacion medida.
- No se dispone de informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 7B; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas sin verificacion previa.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial en produccion.
- El soporte de 31 idiomas esta declarado en los metadatos, pero no se aportan metricas por idioma; el rendimiento en idiomas distintos del polaco e ingles puede ser desigual.
- El formato AWQ limita el despliegue a motores que lo soportan; no es directamente utilizable en llama.cpp u Ollama sin conversion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-AWQ
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Revision de origen del modelo base: `5808ff03c95122d05cb860d11ba75b1efad98380`
- SpeakLeash (organizacion): https://huggingface.co/speakleash
