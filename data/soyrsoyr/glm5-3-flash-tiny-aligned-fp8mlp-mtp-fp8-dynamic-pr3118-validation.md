# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-DYNAMIC-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-DYNAMIC-pr3118-validation es un artefacto de validacion estructural publicado por el usuario soyrsoyr en HuggingFace. No es un modelo entrenado: la propia model card lo describe como un "random-weight structural fixture", es decir, un modelo con pesos aleatorios que replica la estructura, las dimensiones y el pipeline de cuantizacion de su modelo base, inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP. Su funcion es verificar que el flujo de cuantizacion FP8 del PR 3118 de llm-compressor carga y genera correctamente bajo decodificacion especulativa con multi-token prediction (MTP) en vLLM.

El modelo tiene 84.772.398 parametros reales (segun el recuento de safetensors), ocupa 0,2 GB en el repositorio y se distribuye en formato safetensors con metadatos de compressed-tensors. La arquitectura declarada en las etiquetas es glm5_next, con soporte declarado de entrada image-text-to-text, aunque la validacion ejecutada desactiva explicitamente imagen y video mediante `--limit-mm-per-prompt '{"image":0,"video":0}'`. La ventana de contexto real, los idiomas soportados y la licencia no se especifican en la informacion disponible.

Su relevancia es puramente de ingenieria de infraestructura: sirve como fixture reproducible para probar la combinacion de cuantizacion FP8 del MLP, cuantizacion dinamica de activaciones y decodificacion especulativa MTP en versiones concretas de vLLM y Transformers. Cualquier uso orientado a calidad de generacion carece de sentido, ya que los pesos no han sido entrenados y la propia tarjeta indica que no se aplica ninguna afirmacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer con multi-token prediction, segun etiquetas del repositorio) |
| Parametros totales | 84.772.398 (recuento real de safetensors) |
| Parametros activos | No aplicable de forma confirmada; el nombre del modelo base (0.1B-A0.1B) sugiere 0,1B activos sobre 0,1B totales, es decir, denso. No confirmado en la informacion disponible |
| Longitud de contexto | No disponible. La configuracion de validacion del autor usa `--max-model-len 1024`, pero se trata de un parametro de prueba, no de la ventana del modelo |
| Tipos de cuantizacion | FP8 en el MLP, FP8 dinamico en activaciones, NVFP4A16 (FP4 solo en pesos con activaciones de 16 bits, no calibrado W4A4) y MXFP4 (cuantizacion dinamica de activaciones). Esquema data-free sobre el MTP de origen denso |
| Idiomas soportados | No disponibles |
| Licencia | No disponible. El repositorio indica que la licencia del modelo de origen sigue siendo aplicable y que esta validacion no concede licencia adicional |
| Formato de pesos | safetensors con metadatos de compressed-tensors; backbone y MTP en formatos separados |

## Arquitectura y entrenamiento

No hay entrenamiento. La model card es explicita: se trata de un fixture estructural de pesos aleatorios, no de pesos preentrenados de GLM-5.3. El autor declara que las dimensiones alineadas y todos los pasos de derivacion quedan registrados en el fichero `pr3118-validation.json` incluido en el repositorio. Por tanto, no existe informacion sobre volumen de tokens, composicion del dataset, RLHF, DPO ni ninguna otra fase de entrenamiento, y no debe inferirse ninguna.

Tecnicamente, el artefacto combina tres elementos. Primero, un backbone con arquitectura etiquetada como glm5_next y soporte multimodal declarado. Segundo, un modulo MTP (multi-token prediction) procedente de una fuente densa, cuantizado con el esquema data-free solicitado, que se emplea como cabecera de borrador para decodificacion especulativa (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`). Tercero, una capa de cuantizacion gestionada por llm-compressor y compressed-tensors, con el MLP en FP8 y activaciones en FP8 dinamico. La implementacion de referencia es el commit `87347881` del PR 3118 del fork soyr-redhat/llm-compressor.

La validacion reportada consiste en una carga y una generacion correctas en H100 con metricas reales de tokens de borrador MTP. El autor advierte explicitamente de que esto no constituye un benchmark de calidad ni de rendimiento, y de que una carga correcta del modelo no cuenta como aprobacion del test MTP: solo cuentan las metricas positivas de tokens de borrador. El baseline de ejecucion validado es vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0; para MXFP4 se indica que la compatibilidad debe establecerse en una ejecucion propia sobre B200.

## Capacidades

- El repositorio declara la etiqueta image-text-to-text, pero la validacion desactiva imagen y video (`image:0`, `video:0`). La capacidad multimodal no esta ejercitada ni confirmada.
- El pipeline declarado es text-generation, con etiquetas conversational y endpoints_compatible.
- Soporta decodificacion especulativa mediante MTP con un token de borrador en la configuracion probada, integrada en vLLM.
- Sirve como fixture de cuantizacion FP8 y FP8 dinamico sobre capas MLP, con soporte de compressed-tensors.
- No genera texto con sentido: los pesos son aleatorios. Cualquier capacidad linguistica, de razonamiento, codigo o matematicas es inexistente en la practica.
- No hay informacion disponible sobre tool calling, function calling, uso agentico, capacidades multilingues, modo de razonamiento explicito, audio ni ninguna otra capacidad especial.

## Casos de uso

- Validacion de integracion continua de llm-compressor: usar el repositorio como fixture fijo para comprobar que el PR 3118 y posteriores cargan un checkpoint FP8 con MTP sin romper la API de compressed-tensors.
- Pruebas de humo de decodificacion especulativa en vLLM: ejecutar `vllm serve` con la configuracion documentada y verificar que las metricas de tokens de borrador MTP son positivas, detectando regresiones en la ruta especulativa.
- Verificacion de compatibilidad de versiones: fijar el par vLLM 0.29.1rc1.dev79+g767d1c4d4 y Transformers 5.17.0 como baseline y comprobar si una actualizacion de cualquiera de las dos rompe la carga del checkpoint cuantizado.
- Pruebas de conversion de formato: al ser un modelo pequeno (0,2 GB), permite iterar rapidamente conversiones entre FP8, NVFP4A16 y MXFP4 sin coste relevante de disco ni de GPU.
- Reproducibilidad de derivaciones estructurales: el fichero `pr3118-validation.json` documenta el alineamiento de dimensiones, de modo que sirve para auditar que un nuevo pipeline produce exactamente la misma topologia.
- Test de compatibilidad de hardware especifico: validar la ruta MXFP4 en B200, tal como indica el autor, y comparar el comportamiento frente a la ruta FP8 ya verificada en H100.
- Plantilla de estructura para modelos tiny multimodales con MTP: sirve como esqueleto de configuracion para proyectos internos que necesiten replicar la separacion entre backbone y modulo MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que la validacion en H100 "no es un benchmark de calidad ni de rendimiento" y que no se aplica ninguna afirmacion de calidad sobre el modelo. Los unicos datos de rendimiento reportados son cualitativos: carga y generacion correctas con metricas positivas de tokens de borrador MTP.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 85 MB en FP8 (84,77 M de parametros a 1 byte) y aproximadamente 170 MB si se de-cuantiza a bfloat16. Con overhead de runtime, el consumo total por instancia se situa en el rango de 1 a 2 GB, aunque esta cifra es una estimacion aritmetica y no un dato medido publicado.
- GPU validadas: H100, con CUDA 13.0 y vLLM 0.29.1rc1.dev79+g767d1c4d4. Para la ruta MXFP4 el autor indica que la compatibilidad debe establecerse en una ejecucion propia sobre B200.
- Cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM (RTX 3060, 4060, 4090, etc.), dado el tamano del checkpoint. No hay datos publicados de latencia ni de throughput para este artefacto.
- Opciones de despliegue: vLLM es la ruta validada, con la configuracion exacta publicada por el autor. Transformers 5.17.0 se cita como parte del baseline. El uso con llama.cpp u Ollama no esta documentado y requeriria conversion previa desde el formato compressed-tensors. No hay informacion sobre TGI.
- El repositorio incluye un script `verify_mtp.py` que se ejecuta como `python verify_mtp.py /path/to/snapshot`, lanza dos prompts y exige metricas positivas de tokens de borrador para considerar el test superado.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de contexto, idiomas o licencia que permitan una comparacion cuantitativa con alternativas. El unico punto de referencia directo es su modelo base, inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP, del que este repositorio deriva estructuralmente y del que hereda tanto la licencia aplicable como las dimensiones.

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-DYNAMIC-pr3118-validation | Fixture de validacion con pesos aleatorios | 84.772.398 | No disponible | No disponible |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP | Modelo base declarado | No disponible | No disponible | No disponible (aplicable al derivado) |
| Alternativas de terceros | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los pesos son aleatorios. El modelo no produce texto coherente ni util; cualquier evaluacion de calidad, razonamiento o conocimiento dara resultados sin valor.
- La model card califica el artefacto de "fixture estructural de pesos aleatorios" y aclara que no se aplica ninguna afirmacion de calidad. No debe presentarse como un modelo funcional.
- La licencia no esta declarada en el repositorio. El autor indica que la licencia del modelo de origen sigue aplicandose y que esta validacion no anade ninguna concesion de licencia, por lo que el uso comercial queda sujeto a lo que determine la fuente original.
- Riesgo de confusion en busquedas o catalogos: el nombre incluye GLM5.3-Flash, pero no contiene pesos de GLM-5.3 ni resultados de su entrenamiento.
- La capacidad multimodal esta etiquetada pero desactivada en la validacion publicada; no hay evidencia de que funcione.
- El soporte de MXFP4 no esta verificado: el propio autor senala que requiere una ejecucion en B200 para establecer la compatibilidad en tiempo de ejecucion.
- La validacion esta atada a versiones concretas de software (vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0). Fuera de ese entorno, el resultado del test no esta garantizado.
- No hay datos de sesgos, idiomas, contexto real ni comportamiento en produccion, porque no existe entrenamiento ni evaluacion asociada.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo: consisten en enlaces a un generador de curriculums de un portal de empleo y no guardan relacion con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-FP8-DYNAMIC-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementacion de referencia (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
