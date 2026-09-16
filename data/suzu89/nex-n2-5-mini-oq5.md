# suzu89/Nex-N2.5-mini-oQ5

## Resumen

Nex-N2.5-mini-oQ5 es una cuantización no oficial en formato MLX del modelo multimodal nex-agi/Nex-N2.5-mini, publicada por el usuario suzu89 para ejecución en Apple Silicon. Se trata de un modelo de mezcla de expertos (MoE) con torre de visión, cuya arquitectura declarada en la configuración es Qwen3_5MoeForConditionalGeneration, con 35.107.181.936 parámetros totales, 40 capas y 256 expertos de los que se activan 8 por token. El repositorio contiene pesos safetensors en formato MLX (no GGUF ni PyTorch), con cuantización afín de grupo 64 en 5 bits por defecto y sobreescrituras a 6 y 8 bits en determinados módulos.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo multimodal de ~35.000 millones de parámetros en equipos con memoria unificada de Apple, algo inviable con los pesos BF16 originales. Por otro, es un ejemplo de receta de cuantización mixta documentada dentro del propio config.json, de modo que un cargador MLX compatible puede reconstruir la precisión por módulo. El coste es que la cuantización no ha sido evaluada contra el modelo original: el propio autor advierte de que las cifras de benchmarks publicadas por Nex AGI corresponden a los pesos BF16 upstream y no a esta conversión.

El contexto máximo declarado en la configuración es de 262.144 tokens, aunque el autor subraya que se trata de un límite arquitectónico y no de una garantía de que quepa en memoria. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse material no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE multimodal con torre de visión) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible (MoE con 256 expertos, 8 seleccionados por token; el recuento exacto de parámetros activos no se publica) |
| Longitud de contexto | 262.144 tokens según config.json (límite arquitectónico; el contexto usable depende de la memoria disponible) |
| Tipos de cuantizacion | Afín con group size 64; 5 bits por defecto, con sobreescrituras a 6 y 8 bits por módulo; tensores de visión conservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del repositorio upstream) |
| Formato de pesos | Safetensors MLX (5 shards, 2.010 tensores indexados); no hay GGUF ni pesos PyTorch |
| Tamano de pesos | 23,57 GiB (25,30 GB) |
| MTP (multi-token prediction) | No presente (mtp_num_hidden_layers: 0) |
| Capas del modelo de texto | 40 |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos multimodal. El componente de texto consta de 40 capas con 256 expertos y enrutamiento de 8 expertos por token, mientras que la parte de visión se mantiene como torre específica cuyos tensores no han sido cuantizados en esta conversión (permanecen en BF16). El pipeline declarado, image-text-to-text, confirma que el modelo acepta entradas de imagen y texto y genera texto. La configuración indica explícitamente mtp_num_hidden_layers: 0, es decir, no incorpora cabezas de predicción multi-token, lo que descarta el uso de MTP interno como mecanismo de decodificación especulativa.

Sobre el entrenamiento no hay información en los materiales disponibles: no se detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo único documentado es el proceso de cuantización posterior: cuantización afín con tamaño de grupo 64, precisión base de 5 bits y promoción selectiva de ciertos módulos a 6 y 8 bits, receta registrada en config.json para que el cargador MLX aplique la precisión correcta a cada módulo. El autor declara explícitamente que esta conversión no se ha comparado con el modelo BF16 de referencia y que, por tanto, los resultados publicados por Nex AGI no son aplicables a estos pesos.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado de tipo conversacional.
- Procesamiento de imagen y texto (image-text-to-text): la torre de visión se conserva en BF16, por lo que la ruta multimodal no está degradada por la cuantización.
- Razonamiento y generación de contenido general, asumiendo el comportamiento del modelo base Nex-N2.5-mini, si bien no hay evaluaciones de esta conversión concreta.
- Capacidad multilingüe: no disponible, no se documentan los idiomas soportados.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking o razonamiento explícito: no documentado.
- Entrada de audio: no documentada; las etiquetas solo mencionan visión.
- Decodificación especulativa mediante MTP: no soportada por el propio modelo (mtp_num_hidden_layers: 0).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con contexto largo gracias a los 262.144 tokens declarados, siempre que la memoria unificada del equipo lo permita; es adecuado para entornos donde no se quiere enviar datos a la nube.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, permite extraer y razonar sobre capturas, diagramas o páginas escaneadas junto con el texto que las acompaña.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como backend local para validar interfaces de chat con imagen antes de escalar a infraestructura con GPU, usando el servidor oMLX en el puerto 8000.
- Transcripción y resumen de reuniones con material visual: combinando texto largo y capturas de pizarras o diapositivas, aunque conviene verificar la calidad real de la conversión antes de usarlo en producción.
- Asistencia de código en local: un modelo de ~35 B totales con activación dispersa es razonable para autocompletado y explicación de código en un equipo personal, sin coste de API.
- Investigación sobre cuantización: el repositorio documenta la receta por módulo en config.json, lo que lo convierte en un caso de estudio útil para medir el impacto de la cuantización mixta de 5 bits frente a BF16 en un MoE multimodal.
- Generación de contenido multilingüe: solo si se valida previamente el comportamiento en los idiomas objetivo, dado que no se documentan los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explícitamente que la conversión no ha sido evaluada contra el modelo BF16 upstream y que las cifras de benchmarks de la model card original no corresponden a estos pesos cuantizados. Los resultados de búsqueda web disponibles no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- Almacenamiento: 25,30 GB de pesos distribuidos en 5 shards safetensors (23,57 GiB).
- Memoria unificada mínima estimada: en torno a 32 GB para carga en frío, muy justo una vez se añade la caché KV; 64 GB o más es lo recomendable para contextos largos.
- Plataforma: exclusivamente Apple Silicon, ya que el formato es MLX safetensors. No es ejecutable directamente en CUDA sin una reconversión a otro formato.
- GPU recomendadas: ninguna GPU NVIDIA o AMD de forma nativa; el modelo está pensado para M-series (M1/M2/M3/M4 Pro, Max y Ultra). Para M3 Max o M4 Max con 48-64 GB se puede trabajar con contexto moderado; los Ultra con 96-128 GB son los que permiten aprovechar ventanas realmente grandes.
- Cabe en GPU de consumo: en el ecosistema Apple, sí, en equipos con 32 GB o más de memoria unificada, con limitaciones de contexto. En GPUs de consumo NVIDIA no es desplegable sin conversión de formato.
- Opciones de despliegue: oMLX (descarga vía hf download y servicio con omlx serve --model-dir ... --port 8000); requiere un runtime MLX con soporte para Qwen3.5 MoE multimodal. No compatible con llama.cpp, Ollama, vLLM ni TGI en su formato actual.
- Latencia y throughput: no disponibles. Dependen del chip, de la longitud de contexto y de la configuración de caché; el autor advierte de que el uso de memoria crece con el contexto y los ajustes de caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.5-mini-oQ5 (esta ficha) | 35,1 B totales; activos no disponibles | 262.144 tokens (límite de config) | Safetensors MLX, 5 bits mixto | Apache 2.0 | 0 descargas, 0 likes; quantización no oficial |
| Nex-N2.5-mini (upstream) | no disponible | no disponible | Pesos originales (presumiblemente BF16) | Apache 2.0 | Repositorio oficial de Nex AGI |
| Otras quantizaciones comparables | no disponible | no disponible | no disponible | no disponible | Los resultados de búsqueda no identificaron alternativas relevantes |

La comparación directa con modelos de la misma categoría (MoE multimodal de ~35 B) no es posible con los datos disponibles: no se dispone de cifras de rendimiento ni de especificaciones verificadas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cuantización sin evaluar: el autor afirma que la conversión no se ha comparado con el modelo BF16 de referencia; la degradación de calidad es posible y no está medida.
- Repositorio no validado: 0 descargas y 0 likes, publicado por un tercero no afiliado a Nex AGI. No hay revisión de la comunidad.
- Benchmarks no aplicables: las cifras publicadas para Nex-N2.5-mini corresponden a los pesos originales, no a esta cuantización.
- Contexto engañoso si se lee de forma aislada: los 262.144 tokens son un límite de arquitectura; el contexto usable real depende de la memoria unificada disponible y crece el consumo con la caché.
- Idiomas no documentados: no se puede asumir cobertura multilingüe sin pruebas propias.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación en esta conversión.
- Sesgos: no disponibles; no hay información sobre composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Restricciones de licencia: la licencia Apache 2.0 del upstream se mantiene y el repositorio incluye el texto de licencia y un NOTICE que identifica el origen y el cambio de cuantización. Apache 2.0 permite uso comercial, pero conviene conservar la atribución a Nex AGI.
- Formato cerrado a Apple Silicon: el uso en CUDA o en despliegues en servidor exige reconvertir o recurrir a los pesos upstream.
- Sin tool calling ni agentes confirmados: no se documenta soporte de function calling ni de razonamiento multi-paso, por lo que no debería asumirse en producción.
- Sin MTP: no se puede aprovechar decodificación especulativa basada en predicción multi-token con este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/suzu89/Nex-N2.5-mini-oQ5
- Modelo base upstream: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Los resultados de búsqueda web no aportaron enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo o su versión upstream.
