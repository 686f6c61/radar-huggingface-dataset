# stuchapin/Clairic-W4A16-AutoRound

## Resumen

Clairic-W4A16-AutoRound es una cuantización de solo pesos a 4 bits del modelo Cloudflare/clairic, un modelo de extracción de información estructurada de 27B desarrollado por Cloudflare y basado en Qwen3.8-27B. El repositorio lo publica el usuario stuchapin y su aportación se limita a reducir la precisión de parte de los pesos y a añadir pequeños parches de runtime; la autoría del modelo original corresponde íntegramente a Cloudflare. El objetivo es hacer viable el despliegue del modelo en hardware más modesto: reduce el peso en disco de 53 GB a 27 GB y permite ejecutarlo repartido entre dos tarjetas de 24 GB, algo que el runtime original no soporta tal cual se distribuye.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa práctica para quien quiera evaluar Clairic sin disponer de una GPU de más de 32 GB. Por otro lado, ilustra un patrón habitual en el ecosistema open source: cuantizaciones comunitarias de modelos propietarios o de pesos abiertos que amplían su accesibilidad a cambio de introducir dependencias de código personalizado y kernels de inferencia específicos.

El modelo conserva las cabeceras de respuesta tipadas y el runtime de Cloudflare, de modo que el formato de petición y respuesta no cambia: se declaran campos tipados y el modelo devuelve valores, puntuaciones de confianza, probabilidades de nulo y spans de origen. La arquitectura subyacente es un transformer híbrido de estilo Qwen3.5, con 64 capas de decodificador que combinan atención completa y atención lineal Gated DeltaNet, más un codificador de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet lineal), multimodal image-text-to-text, con cabeceras de respuesta tipadas |
| Parametros totales | 11.080.207.600 (según safetensors del repo); la model card describe el modelo base como 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: int4 con group size 128 y simétrico en capas MLP y atención completa; BF16 en atención lineal, embeddings, lm_head, visión y cabeceras tipadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`clairic_model`) y empaquetado `auto_round:auto_gptq` |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas de decodificador. Dieciséis capas emplean atención completa y cuarenta y ocho emplean atención lineal Gated DeltaNet, un esquema propio de la familia Qwen3.5 que reduce el coste computacional en contextos largos. El stack incluye además un codificador de visión en BF16, lo que habilita la entrada de imágenes junto al texto. Sobre el modelo lingüístico se montan cabeceras de respuesta tipadas (`clair_head.safetensors`) que implementan el mecanismo de extracción estructurada: el usuario declara campos con tipo, instrucciones y restricciones, y el modelo devuelve valores, confianza, probabilidad de nulo y spans de origen.

La cuantización se aplicó con AutoRound 0.16.1, con 100 iteraciones y 256 muestras de calibración de 2048 tokens cada una, exclusivamente texto y no específicas de extracción. El tuning requirió unos 75 minutos en una RTX 3090. Se cuantizaron a int4 las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las 64 capas y las proyecciones de atención completa (`q/k/v/o_proj`) de las 16 capas de atención completa: 256 de las 607 capas lineales quedan en int4. Se mantuvieron en BF16 las capas de atención lineal Gated DeltaNet (la parte más sensible al redondeo), los embeddings, el `lm_head` (que el runtime lee directamente para su readout), el codificador de visión, las cabeceras tipadas y los tensores `mtp.*`, que el runtime no utiliza. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extracción de información estructurada: recibe un estado (texto o imagen) y una declaración de campos tipados, y devuelve valores, confianza, probabilidad de nulo y spans de origen.
- Tipos de campo soportados según los ejemplos de la model card: texto, número con decimales, fecha y listas de elementos.
- Entrada multimodal: procesa imágenes junto con texto, como facturas o recibos, mediante el codificador de visión en BF16.
- Manejo de ausencia de respuesta: el modelo devuelve probabilidades de nulo, lo que permite distinguir entre un campo vacío y un campo con valor incierto.
- Puntuación de confianza por campo, útil para umbrales de revisión humana.
- Capacidades multilingües: no disponible.
- Tool calling, function calling y razonamiento multi-paso orientado a agentes: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo recibe la imagen y una declaración de campos como proveedor, total, fecha de emisión y lista de conceptos, y devuelve cada valor con su confianza y su span de origen. Es adecuado porque el codificador de visión y las cabeceras tipadas están diseñados exactamente para esta tarea, y la confianza permite derivar a revisión manual los campos dudosos.
- Procesamiento de tickets de soporte: a partir del texto de un ticket se pueden extraer campos estructurados como categoría, producto afectado, fecha relativa o prioridad, con probabilidad de nulo para los campos que no aparezcan. La ventana de contexto no está documentada, pero el caso de prueba de la model card incluye un ticket de soporte entre sus ejemplos sintéticos.
- Digitalización de contratos de arrendamiento: extracción de partes, fechas, importes y condiciones con spans de origen que permiten auditar cada valor contra el documento original. La combinación de valor más span es útil en flujos con trazabilidad legal.
- Automatización de cuentas a pagar: lectura de avisos de envío y extractos bancarios para poblar sistemas de gestión con proveedor, importe y fecha, dejando el cálculo aritmético multi-paso a código determinista. La model card recomienda explícitamente extraer las partes y hacer la aritmética en código, porque los dos errores observados en la validación fueron precisamente cálculos multi-paso.
- Enriquecimiento de correos de reunión: extracción de asistentes, fecha, hora y temas a partir de correos, con confianza por campo para decidir si se crea automáticamente un evento de calendario o se pide confirmación.
- Despliegue en infraestructura de dos GPU de 24 GB: al repartir las 64 capas entre dos RTX 3090 (22 capas en la GPU 0 y el resto en la GPU 1), el modelo cabe con un pico de 30,7 GiB y permite montar un servicio de extracción estructurada en hardware de gama alta de consumo o de generaciones anteriores, sin necesidad de A100 o H100.

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El autor describe su evaluación como una comprobación de cordura, no un benchmark: 13 peticiones de extracción con 49 campos puntuados, ejecutadas con el propio `load_release_model` y `systemone` repartidos entre dos RTX 3090. Una petición es el ejemplo de la model card de Cloudflare y las otras doce son sintéticas (ticket de soporte, arrendamiento, aviso de envío, cálculo de impuestos, fecha relativa, correo de reunión, extracto bancario, una petición sin respuesta presente, estimación/previsión, dos imágenes de recibo y una imagen de factura). Se hicieron dos pasadas y la segunda dio respuestas idénticas a la primera en las 13 peticiones.

No existe referencia BF16 para el 27B, porque el original de 53 GB no cabe en 48 GB de VRAM, así que la comparación es contra la verdad de referencia. La tabla siguiente reproduce los datos publicados:

| Métrica | Clairic Flash BF16 | Clairic Flash W4A16 | Clairic 27B W4A16 (este repo) |
|---|---|---|---|
| Campos correctos vs. verdad | 46 / 49 | 47 / 49 | 47 / 49 |
| GPUs | 1× RTX 3090 | 1× RTX 3090 | 2× RTX 3090 |
| Pico de memoria GPU | 21,2 GiB | 14,2 GiB | 30,7 GiB (16,4 + 14,3) |
| 13 peticiones en caliente | 62,0 s | 32,6 s | 75,0 s |

Los dos campos que el 27B falla son los mismos dos campos aritméticos multi-paso que falla Flash, ambos con confianza baja: el subtotal más un 8,5 % de impuesto más envío (verdad 272,40; devuelve 266,40 con confianza 0,18, aunque el impuesto de un solo paso, 20,40, es correcto con confianza 0,92) y la fecha de vencimiento como fecha de emisión más 30 días netos (verdad 2026-04-14; devuelve la fecha de emisión 2026-03-15 con confianza 0,28). A diferencia de Flash BF16, el 27B sí leyó el proveedor de una imagen de factura sin etiqueta "From:", con confianza 0,999. El 27B es más lento que Flash en esta prueba porque triplica el tamaño y, al ejecutarse repartido, corre sin CUDA graphs; las latencias absolutas son peores que las cifras publicadas por Cloudflare por los kernels de respaldo de esta configuración.

## Requisitos de hardware

- Pesos: aproximadamente 25,3 GiB; pico de memoria GPU de 30,7 GiB según la prueba del autor.
- No cabe en una tarjeta de 24 GB. Probado en dos RTX 3090 con reparto de capas: 16,4 GiB de pico en la GPU 0 y 14,3 GiB en la GPU 1.
- Una única GPU con más de unos 32 GB debería funcionar, según el autor, aunque no se ha probado.
- GPU recomendadas: 2× RTX 3090 (configuración validada); una GPU única de más de 32 GB (por ejemplo, A100 de 40 u 80 GB, o H100) como opción no verificada.
- Para una alternativa en una sola tarjeta, el autor remite a su hermano de 9B, `stuchapin/Clairic-Flash-W4A16-AutoRound`, con un pico de unos 14 GiB.
- Software: Python 3.11 o superior, paquetes de `requirements.txt` y `auto-round==0.16.1` para los kernels int4. El despliegue usa el cargador propio `clairic_model.load_release_model` y la función `systemone`, no una integración estándar de vLLM, llama.cpp, Ollama o TGI; no se documenta soporte para esos motores.
- Latencia: 75,0 s para las 13 peticiones en caliente en la configuración de dos RTX 3090. No se publican cifras de throughput ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | GPUs necesarias | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clairic 27B W4A16 (este repo) | 11,08B en safetensors; 27B según la model card | no disponible | int4 W4A16 | 2× 24 GB o 1× >32 GB | Apache 2.0 | Hugging Face |
| Clairic Flash 9B BF16 | no disponible | no disponible | BF16 | 1× RTX 3090 (21,2 GiB de pico) | no disponible en esta ficha | Hugging Face |
| Clairic Flash 9B W4A16 | no disponible | no disponible | int4 W4A16 | 1× RTX 3090 (14,2 GiB de pico) | Apache 2.0 (según el repo hermano) | Hugging Face |
| Cloudflare/clairic (original) | 27B | no disponible | BF16 (53 GB) | Más de 48 GB de VRAM | Apache 2.0 | Hugging Face |

La comparación se limita a la propia familia Clairic porque la información proporcionada no incluye otros modelos de extracción estructurada comparables. En precisión de campos, el 27B cuantizado y Flash cuantizado empatan a 47/49 en la prueba del autor, mientras que Flash BF16 obtiene 46/49; la diferencia de coste es notable: el 27B requiere dos GPU y tarda 75,0 s frente a los 32,6 s de Flash W4A16 en una sola GPU.

## Limitaciones y advertencias

- La cuantización es de solo pesos (W4A16) y se aplicó sin datos de calibración específicos de extracción, solo texto genérico; no se ha comparado contra una referencia BF16 del 27B, por lo que no se puede medir la degradación exacta respecto al original.
- Los dos errores observados son cálculos aritméticos multi-paso: subtotal con impuesto y envío, y fecha de vencimiento como fecha de emisión más 30 días. La recomendación del autor es extraer las partes y hacer la aritmética en código.
- El despliegue depende de código personalizado (`clairic_model`) y de kernels de AutoRound; no hay integración documentada con motores de inferencia estándar como vLLM, llama.cpp, Ollama o TGI.
- Al ejecutarse repartido entre dos GPU no usa CUDA graphs, lo que penaliza la latencia; las cifras absolutas son peores que las publicadas por Cloudflare.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación independiente.
- El runtime no utiliza los tensores `mtp.*`, que se conservan en BF16 sin uso.
- No se dispone de información sobre sesgos, riesgo de alucinación específico, idiomas soportados ni longitud de contexto; estos extremos deben verificarse contra la documentación del modelo base.
- La licencia es Apache 2.0, lo que en principio permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clairic y de las dependencias (AutoRound) antes de desplegar en producción.
- La model card advierte de que la evaluación es una comprobación de cordura con 13 peticiones y 49 campos, no un benchmark representativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stuchapin/Clairic-W4A16-AutoRound
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Modelo hermano de 9B: https://huggingface.co/stuchapin/Clairic-Flash-W4A16-AutoRound
- AutoRound: https://github.com/intel/auto-round
