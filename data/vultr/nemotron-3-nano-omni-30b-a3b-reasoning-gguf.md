# vultr/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning es un modelo multimodal de razonamiento desarrollado por NVIDIA, publicado originalmente en formato BF16 y distribuido aqui como cuantizacion GGUF por Vultr. Se trata de un Mixture-of-Experts (MoE) con 30B parametros totales y 3B activos por token, disenado para unificar comprension de audio, vision y lenguaje en un unico modelo "any-to-any", orientado a agentes de IA que necesitan extraer informacion de videos y documentos con alta precision.

El modelo integra un encoder visual basado en C-RADIOv4-H y un encoder de audio Parakeet, lo que le permite procesar imagenes, video, documentos y voz dentro de una ventana de contexto de hasta 256K tokens. Su arquitectura `nemotron_h_moe` combina 52 capas con 128 expertos enrutados (6 seleccionados por token) mas un experto compartido, con un tamano oculto de 2.688 y 32 cabezas de atencion.

La relevancia de esta ficha concreta reside en que Vultr publica cuantizaciones GGUF hibridas: en lugar de aplicar una precision uniforme, asigna a cada capa una precision derivada de una puntuacion de importancia medida, concentrando los bits donde mas afectan a la salida. Esto facilita ejecutar un modelo de 30B multimodal y de razonamiento en entornos llama.cpp, algo poco habitual en modelos de esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_moe (Mixture-of-Experts, transformer) |
| Parametros totales | 31.577.940.288 (~30B) |
| Parametros activos | 3B por token |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | GGUF hibrida por capa (precisions variables segun importancia medida); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | GGUF (repo de 98,2 GB); base en BF16 safetensors |
| Capas | 52 |
| Tamano oculto | 2.688 |
| Cabezas de atencion | 32 |
| Expertos | 128 enrutados, 6 seleccionados por token, mas experto compartido |
| Vocabulario | 131.072 tokens |
| Encoders multimodales | vision C-RADIOv4-H, audio Parakeet |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 52 capas, tamano oculto de 2.688 y 32 cabezas de atencion. El componente MoE consta de 128 expertos enrutados de los que se activan 6 por token, ademas de un experto compartido siempre activo, lo que resulta en unos 3B parametros activos sobre un total de 30B. Esta relacion de activacion (10:1) es la que permite un coste de inferencia propio de un modelo de ~3B manteniendo la capacidad representacional de uno de 30B. El vocabulario es amplio (131.072 tokens), coherente con el soporte multilingue y multimodal.

La multimodalidad se resuelve mediante encoders dedicados: C-RADIOv4-H para vision y Parakeet para audio, integrados en un pipeline any-to-any que acepta imagen, video, documento y voz como entrada. La model card menciona explicitamente procesamiento de contexto largo eficiente y razonamiento preciso sobre estas modalidades. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; la informacion proporcionada no los detalla. Tampoco se documentan innovaciones de decodificacion especulativa ni variantes de atencion lineal mas alla de la etiqueta arquitectonica `nemotron_h_moe`.

La contribucion especifica de esta publicacion es la cuantizacion. Vultr aplica una estrategia hibrida: mide una puntuacion de importancia por capa y elige la precision de cada una en funcion de esa puntuacion, de modo que las capas con mayor impacto en la salida conservan mas bits y las menos sensibles se comprimen mas agresivamente. El resultado es un unico artefacto GGUF de 98,2 GB que no sigue un esquema de cuantizacion uniforme tipo Q4_K_M o Q8_0.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento explicito (sufijo "Reasoning" en el nombre del modelo).
- Comprension de imagenes mediante el encoder C-RADIOv4-H.
- Comprension de video, orientada a extraccion de informacion de grabaciones y flujos continuos.
- Comprension de documentos, incluyendo documentos extensos gracias al contexto de hasta 256K tokens.
- Comprension de audio y voz mediante el encoder Parakeet, con tareas de razonamiento sobre habla.
- Procesamiento any-to-any: combinacion de modalidades de entrada en una misma peticion.
- Capacidad de agente: la model card describe el modelo como pensado para agentes de IA que derivan informacion de videos y documentos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; el vocabulario de 131.072 tokens sugiere soporte amplio, pero no se detallan idiomas.

## Casos de uso

- Analisis de reuniones y videollamadas: el modelo recibe el audio de la reunion (via Parakeet) y genera actas estructuradas con acuerdos y tareas; el contexto de 256K permite procesar sesiones de varias horas sin truncar.
- Procesamiento de documentos extensos con soporte visual: contratos, informes financieros o expedientes escaneados se envian como imagenes o PDF y el modelo razona sobre tablas, graficos y texto en una sola pasada.
- Moderacion y catalogacion de video: extraccion de descripciones, etiquetas y eventos clave de grabaciones, aprovechando la comprension de video y el contexto largo para cubrir clips completos.
- Asistentes de accesibilidad: transcripcion y descripcion conjunta de contenido audiovisual (audio mas fotogramas) para generar resumenes hablados o descripciones textuales de escenas.
- Automatizacion de atencion al cliente multimodal: el usuario envia capturas, audios o capturas de pantalla de errores y el modelo diagnostica combinando las tres modalidades en un mismo turno conversacional.
- Inspeccion de calidad industrial: analisis de imagenes o video de linea de produccion junto con notas de voz del operario para generar informes de incidencia estructurados.
- Extraccion de datos de documentos regulatorios: pipelines que combinan OCR visual con razonamiento para poblar bases de datos a partir de formularios y anexos extensos, con trazabilidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web no aporta datos de evaluacion del modelo.

## Requisitos de hardware

- El repo GGUF ocupa 98,2 GB, por lo que la inferencia completa requiere almacenamiento y memoria en ese orden de magnitud; los pesos deben residir total o parcialmente en VRAM/RAM segun el backend.
- Con 3B parametros activos por token, el coste computacional por token es el de un modelo de ~3B, pero el conjunto de pesos de 30B debe estar accesible, lo que penaliza el despliegue en GPU unica de gama consumidor.
- GPU recomendadas: H100 80 GB o A100 80 GB para mantener el modelo completo en VRAM; configuraciones multi-GPU (2x A100 40 GB o 2x RTX 6000 Ada) para repartir el MoE.
- En GPU de consumo (RTX 4090 24 GB) solo es viable con offload parcial a RAM del sistema o con subconjuntos de capas, con latencia degradada; no cabe entero en VRAM.
- Opciones de despliegue: llama.cpp y sus frontales (Ollama, LM Studio) son el destino natural del formato GGUF; vLLM y TGI no se citan en la informacion disponible para esta variante.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para estas cuantizaciones hibridas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning (esta ficha) | 30B | 3B | 256K | texto, imagen, video, audio | nvidia-open-model-agreement | GGUF, BF16 |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones verificadas de alternativas directas (otros MoE multimodales de ~30B con audio y vision), por lo que no se establece una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia es `nvidia-open-model-agreement`, no una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial o redistribucion.
- El modelo base es una cuantizacion: las cuantizaciones hibridas por capa pueden introducir degradaciones no uniformes respecto al BF16 original, especialmente en tareas de razonamiento y en las modalidades de audio y vision.
- No hay informacion publicada sobre sesgos del modelo, tasas de alucinacion ni evaluaciones de seguridad en la documentacion consultada.
- No se detallan los idiomas soportados; el rendimiento fuera del ingles puede ser desigual pese al vocabulario de 131.072 tokens.
- El contexto de 256K es el maximo declarado, pero el rendimiento efectivo en ventanas muy largas no esta verificado con benchmarks publicados.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicacion reciente y sin validacion comunitaria.
- El despliegue en llama.cpp de un MoE multimodal con encoders de vision y audio puede requerir versiones recientes del runtime; la compatibilidad con herramientas de terceros no esta garantizada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vultr/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Vultr (proveedor de la cuantizacion): https://www.vultr.com/
- Documentacion de Vultr: https://docs.vultr.com/
