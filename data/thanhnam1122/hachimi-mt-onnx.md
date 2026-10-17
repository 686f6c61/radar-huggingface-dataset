# thanhnam1122/hachimi-mt-onnx

## Resumen

hachimi-mt-onnx es una compilacion lista para navegador del modelo de traduccion automatica ngocdang83/HachimiMT-30-zh-vi, un MarianMT de 37 millones de parametros especializado en traduccion de chino (zh) a vietnamita (vi) en el dominio de novelas web. El repositorio lo publica el usuario thanhnam1122 y no entrena ningun modelo nuevo: su aportacion es el export a ONNX con cache KV, la cuantizacion dinamica INT8 (aproximadamente 4 veces mas compacta que fp32) y un `tokenizer.json` de tipo fast-tokenizer construido a mano, ya que el modelo original solo distribuye ficheros sentencepiece lentos que `transformers.js` no puede cargar directamente.

La relevancia de esta ficha esta en el nicho: se trata de un modelo pequeno (37M), de licencia permisiva para uso comercial con atribucion (CC-BY-4.0) y ejecutable integramente en el cliente, sin necesidad de servidor de inferencia. Eso lo hace adecuado para extensiones de navegador, lectores de novelas web y aplicaciones de traduccion offline o con requisitos de privacidad estrictos, donde enviar el texto a una API externa no es viable.

El repositorio ocupa 0,1 GB, declara los idiomas zh y vi, y la unica tarea soportada es `translation`. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de un artefacto muy reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 37 millones (segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (dtype `q8` en transformers.js); el modelo base se distribuye en fp32 |
| Idiomas soportados | chino (zh) y vietnamita (vi) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | ONNX cuantizado: `encoder_model_quantized.onnx` y `decoder_model_merged_quantized.onnx` con cache KV; `tokenizer.json` (fast tokenizer) |
| Tamano del repositorio | 0,1 GB |
| Libreria / runtime | transformers.js (ONNX Runtime Web) |
| Modelo base | ngocdang83/HachimiMT-30-zh-vi |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer encoder-decoder con atencion completa, desarrollado originalmente en el marco del proyecto MarianNMT. El modelo base HachimiMT-30-zh-vi, entrenado por ngocdang83, esta especializado en la direccion chino a vietnamita y orientado a texto de novelas web, lo que condiciona su vocabulario y su estilo de salida hacia un registro narrativo y coloquial mas que hacia texto administrativo o tecnico. La model card lo describe como la variante ligera de la familia, con 37M de parametros, frente a una variante mayor denominada HachimiMT-60.

Sobre el proceso de entrenamiento no se publica informacion en el material disponible: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Las modificaciones introducidas por este repositorio son exclusivamente de despliegue: export a ONNX con cache KV para el decoder (evitando recalcular el contexto en cada paso autoregresivo), cuantizacion dinamica INT8 y sustitucion del tokenizador. El autor afirma haber verificado que el `tokenizer.json` generado produce identificadores de token identicos a los del `MarianTokenizer` lento original, lo cual es un requisito critico para no degradar la calidad de traduccion al cambiar de runtime.

## Capacidades

- Traduccion de texto de chino a vietnamita, unica direccion declarada en el pipeline y en los idiomas del repositorio.
- Especializacion en el dominio de novelas web, con la terminologia y el estilo propios de ese genero.
- Generacion de texto autoregresiva con cache KV, lo que reduce el coste computacional de secuencias largas dentro de la ventana soportada.
- Ejecucion en navegador mediante transformers.js y ONNX Runtime Web, sin backend propio.
- Inferencia en CPU (WASM) o en GPU del cliente (WebGPU), segun el backend disponible en el navegador.
- No dispone de soporte declarado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- No hay capacidades multilingues mas alla del par zh-vi: no se anuncia traduccion inversa (vi a zh) ni pivotaje a otros idiomas.

## Casos de uso

- Traduccion dentro de extensiones de navegador: el modelo se carga con transformers.js con `dtype: 'q8'` y traduce parrafos seleccionados en el propio cliente. Al pesar aproximadamente 37 MB en INT8, la descarga inicial es asumible y no requiere servidor.
- Lectores de novelas web chinas: integrado en una aplicacion de lectura, permite traducir capitulos al vietnamita al vuelo, manteniendo el texto en el dispositivo del usuario, lo que evita problemas de derechos de distribucion y de privacidad.
- Traduccion offline en aplicaciones de escritorio o moviles con Electron, Tauri o contenedores de runtime ONNX, donde no hay conectividad garantizada.
- Prototipado rapido de pipelines de traduccion: sirve como linea base ligera para comparar calidad frente a modelos mayores en tareas zh-vi antes de invertir en infraestructura GPU.
- Preprocesado de corpus: traduccion masiva de texto chino a vietnamita en un pipeline de datos, ejecutable en CPU y paralelizable en muchos nucleos sin necesidad de aceleradores.
- Aplicaciones con requisitos estrictos de privacidad: al no salir el texto del dispositivo, encaja en entornos con normativa de proteccion de datos que impide enviar contenido a APIs de terceros.
- Demostraciones y material didactico: por su tamano y su licencia, es util para ejemplos de despliegue de modelos ONNX en web sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como BLEU, chrF, COMET, MMLU ni ninguna otra evaluacion cuantitativa, ni comparaciones con lineas base. El autor unicamente afirma que el tokenizador producido genera identificadores identicos al tokenizador lento original, lo que es una comprobacion de equivalencia funcional, no una medida de calidad de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 37 MB para los pesos en INT8, mas el estado de activaciones y la cache KV; en la practica cabe en unos pocos cientos de MB de memoria.
- En fp32, el modelo base ronda los 148 MB de pesos, igualmente irrelevante para cualquier GPU moderna.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas y en CPU exclusivamente.
- No requiere A100 ni H100; usarlas no aportaria ventaja significativa dado el tamano del modelo.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WASM o WebGPU) es la via documentada en la model card; los ficheros ONNX tambien son consumibles desde ONNX Runtime en Python, C++ o C#, asi como desde runtimes moviles compatibles con ONNX.
- No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto, ya que no se distribuye en GGUF y no es un modelo de tipo causal decoder-only.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por frase en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thanhnam1122/hachimi-mt-onnx | 37M | no disponible | zh, vi | ONNX INT8 | CC-BY-4.0 | HuggingFace, runtime transformers.js |
| ngocdang83/HachimiMT-30-zh-vi (base) | 37M | no disponible | zh, vi | safetensors / sentencepiece (no confirmado) | no disponible en el material consultado | HuggingFace |
| HachimiMT-60 (variante mayor citada en la model card) | no disponible (superior a 37M) | no disponible | zh, vi | no disponible | no disponible | no disponible |
| Otras alternativas zh-vi (p. ej. opus-mt, PhoMT) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de rendimiento ni de especificaciones completas de las alternativas, por lo que la comparacion se limita a parametros y formato declarados. Cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- No hay datos de benchmarks publicados: no se puede estimar la calidad de traduccion ni compararla con alternativas de forma objetiva.
- La direccion de traduccion es unica (zh a vi). La traduccion inversa no esta declarada.
- Dominio restringido: el modelo se entreno para novelas web. El rendimiento en textos legales, medicos, tecnicos o administrativos es desconocido y probablemente inferior.
- Riesgo de alucinacion y de omisiones o repeticiones en segmentos largos, comportamiento habitual en modelos Marian de este tamano; no se documenta ninguna mitigacion.
- Longitud de contexto no especificada: no se indica el maximo de tokens de entrada ni como se comporta con parrafos largos, lo que obliga a trocear el texto de forma conservadora.
- Incoherencia en los identificadores: el ejemplo de uso de la model card invoca `yennguyen45/hachimimt-30-web`, mientras que el repositorio real es `thanhnam1122/hachimi-mt-onnx`. Hay que corregir esa ruta en el codigo o la carga fallara.
- Atribucion obligatoria: la licencia CC-BY-4.0 exige citar al autor del modelo base (ngocdang83). Es apta para uso comercial siempre que se cumpla esa condicion, pero conviene revisar los terminos exactos de la licencia antes de desplegarla en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de terceros. No hay garantia de mantenimiento ni de soporte.
- La fecha de creacion registrada (2026-10-17) es posterior a la fecha de redaccion habitual de fichas tecnicas; conviene verificar la vigencia de los metadatos en el momento de la lectura.
- No se documenta el tratamiento de sesgos ni la composicion del corpus, por lo que no se puede evaluar el sesgo de genero, cultural o politico en las traducciones.

## Enlaces

- HuggingFace: https://huggingface.co/thanhnam1122/hachimi-mt-onnx
- Modelo base: https://huggingface.co/ngocdang83/HachimiMT-30-zh-vi
- Repositorio citado en el ejemplo de la model card: https://huggingface.co/yennguyen45/hachimimt-30-web
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
