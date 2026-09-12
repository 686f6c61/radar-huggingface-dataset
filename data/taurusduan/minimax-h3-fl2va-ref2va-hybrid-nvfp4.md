# taurusduan/MiniMax-H3-FL2VA-Ref2VA-Hybrid-NVFP4

## Resumen

MiniMax H3 FL2VA x Ref2VA Hybrid NVFP4 es una coleccion de cuatro checkpoints experimentales publicados por el usuario taurusduan para el modelo de generacion de video MiniMax H3, desarrollado originalmente por MiniMaxAI. Cada checkpoint fusiona dos variantes del modelo base: FL2VA (generacion de video a partir de primer y ultimo fotograma) y Ref2VA (generacion condicionada por imagenes de referencia). La fusion no reentrena nada: copia selectivamente las proyecciones AdaLN de Ref2VA sobre un esqueleto FL2VA ya cuantizado en NVFP4.

El problema que resuelve es practico: en lugar de alternar entre dos checkpoints de 12,5 GB segun el flujo de trabajo, el usuario obtiene un unico fichero que puede operar tanto en modo primer/ultimo fotograma como en modo referencia, con cuatro variantes que ajustan cuantos bloques del transformer reciben las proyecciones de Ref2VA (rangos 15-49, 20-49, 25-49 y 30-49, cero-based e inclusivos).

Es relevante ahora porque demuestra una via de reutilizacion de pesos cuantizados sin dequantizar ni recuantizar, algo poco habitual en el ecosistema de difusion de video, y porque el ecosistema ComfyUI ya dispone de soporte nativo para NVFP4 y MiniMax H3. El repositorio ocupa 50,1 GB (cuatro ficheros de 12.528.636.800 bytes cada uno) y, en el momento de redactar esta ficha, acumula 0 descargas y 1 like, por lo que debe considerarse material en fase de validacion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con proyecciones AdaLN por bloque; estructura exacta de MiniMax H3 no documentada en la informacion proporcionada |
| Parametros totales | no disponible (los ficheros se distribuyen ya cuantizados en NVFP4, sin recuento de parametros publicado) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de video, no de texto; no se documenta ventana de contexto) |
| Tipos de cuantizacion | NVFP4 (formato de almacenamiento de los cuatro checkpoints); el text encodercompanero usa NVFP4 AWQ |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license_name: other) |
| Formato de pesos | safetensors (un unico fichero por variante, con pesos NVFP4 empaquetados y tensores comfy_quant) |
| Variantes incluidas | b15-49, b20-49, b25-49, b30-49 (rangos de bloques cero-based e inclusivos) |
| Tamano por checkpoint | 12.528.636.800 bytes (aprox. 12,53 GB / 11,67 GiB) |
| Tamano del repositorio | 50,1 GB |
| Pipeline declarado | image-to-video |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Libreria declarada | minimax-h3 |
| Descargas / likes | 0 / 1 |
| Fecha de creacion y actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una fusion de pesos. El esqueleto de partida es `minimax_h3_fl2va_pruned_nvfp4.safetensors`, publicado por lilcheaty, y sobre el se copian, para el rango inclusivo de bloques `blocks.<inicio>-49`, exactamente dos tensores por bloque desde `minimax_h3_ref2va_pruned_nvfp4.safetensors`: `blocks.<inicio>-49.adaln_proj.linear.weight` y `blocks.<inicio>-49.adaln_proj.linear.bias`. Los tensores sustituidos en formato FP16 son 70 (b15-49), 60 (b20-49), 50 (b25-49) y 40 (b30-49), lo que equivale a 60,96 MB, 52,25 MB, 43,55 MB y 34,84 MB respectivamente.

El resto del grafo permanece intacto y byte a byte identico al FL2VA original: la tabla `adaln_t_table`, las proyecciones AdaLN y cabezas de salida de la capa final, atencion, MLP, normalizacion, embeddings, refinadores de tokens y las 200 capas NVFP4 con sus 800 tensores empaquetados (peso, escala y tensores `comfy_quant`). No se realizo interpolacion, dequantizacion, recuantizacion, ajuste fino ni rebase de curvas. La estrategia de seleccion de tensores replica la publicada por smhfacct en su variante b25-49 INT8, verificada tensor a tensor: 50 tensores AdaLN provenian de Ref2VA y los 882 restantes de FL2VA, de un total de 1.132 tensores de salida.

La semantica de las variantes es acumulativa: un bloque inicial mas bajo aplica las proyecciones AdaLN de Ref2VA a mas capas del transformer (comportamiento mas cercano a Ref2VA), mientras que un bloque inicial mas alto conserva mas proyecciones de FL2VA. Los nombres de los tensores revelan indirectamente la topologia de MiniMax H3 (bloques indexados al menos hasta 49, proyecciones AdaLN, atencion, MLP, refinadores de tokens y cabezas de salida), asi como el uso de un VAE de video en fp16 y un VAE de audio en fp32, pero la informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de video a partir de imagenes: el pipeline declarado es image-to-video.
- Flujo FL2VA validado manualmente en ComfyUI para la variante b25-49, con salida de video y audio.
- Flujo Ref2VA de condicionamiento por referencia validado manualmente en ComfyUI para b25-49, tambien con salida de video y audio.
- Generacion conjunta de audio y video (etiqueta audio-video-generation; VAE de audio en fp32 presente entre los modelos companeros).
- Carga y muestreo en ComfyUI con soporte nativo de MiniMax H3 y NVFP4.
- Deteccion automatica del formato por parte de ComfyUI, identificado como MiniMax H3 con cuantizacion de precision mixta.
- Integracion con un text encoder externo basado en Qwen3-VL de 32.000 millones de parametros (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`), lo que implica condicionamiento por prompt textual e imagen.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue: no aplica a este tipo de modelo segun la informacion disponible.

## Casos de uso

- Generacion de video con primer y ultimo fotograma: las variantes conservan la ruta FL2VA, de modo que un estudio puede fijar el fotograma inicial y final de un plano y dejar que el modelo interpole el movimiento intermedio, util en animatica y previz.
- Transferencia de identidad o estilo por referencia: la ruta Ref2VA permite condicionar el resultado con imagenes de referencia, lo que sirve para mantener la coherencia de un personaje o de un producto a lo largo de varios planos.
- Produccion de video publicitario con audio: al generar video y audio de forma conjunta, un anuncio corto puede obtenerse en una sola pasada sin herramientas de doblaje o Foley posteriores.
- Prototipado rapido en ComfyUI: los cuatro checkpoints se colocan en `ComfyUI/models/diffusion_models/` y se cargan con el nodo Load Diffusion Model / UNETLoader dejando `weight_dtype` en `default`, lo que permite iterar sobre variantes sin reescribir el grafo.
- Investigacion sobre fusion de pesos en modelos cuantizados: el repositorio es un caso de estudio reproducible de sustitucion selectiva de tensores sobre almacenamiento NVFP4 sin dequantizar, con hashes SHA256 por fichero y verificacion tensor a tensor.
- Preservacion de flujos de trabajo mixtos: un equipo que alterna entre generacion desde fotogramas y generacion desde referencia puede unificar ambos procesos en una sola carga de modelo, reduciendo el cambio de checkpoint en memoria.
- E-commerce y catalogos de producto: partiendo de una fotografia de producto como referencia y de un fotograma de encuadre, se pueden generar clips de presentacion consistentes para fichas de tienda.
- Restauracion y animacion de material fotografico de archivo: usar la foto antigua como primer fotograma y una imagen objetivo como ultimo fotograma para producir un plano animado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, similitud de audio, etc.) ni comparaciones A/B controladas. El estado de validacion declarado se limita a comprobaciones estructurales y de ejecucion:

| Tipo de validacion | Resultado declarado |
|---|---|
| Contratos de clave, forma, dtype, metadatos y capas NVFP4 | Superado en los cuatro checkpoints |
| Reapertura de los ficheros con el lector estandar de safetensors | Correcta |
| Coincidencia de hashes de los 1.132 tensores de salida con su origen previsto | Comprobada |
| Tensores AdaLN seleccionados identicos a Ref2VA | Comprobado |
| Tensores no seleccionados y 800 tensores NVFP4 identicos a FL2VA | Comprobado |
| Deteccion por parte de ComfyUI | Identificado como MiniMax H3 con cuantizacion mixta |
| Carga, muestreo y generacion real de video en ComfyUI | Completada en los cuatro checkpoints |
| Comparaciones A/B controladas | Pendientes |
| Metricas cuantitativas publicadas | No disponibles |

## Requisitos de hardware

- VRAM para el checkpoint de difusion: cada variante ocupa 12.528.636.800 bytes (aprox. 11,67 GiB) en NVFP4, por lo que requiere al menos 12-13 GB solo para los pesos del transformer, antes de activaciones y cache de atencion.
- Text encoder companero: `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` corresponde a un codificador de 32.000 millones de parametros cuantizado en NVFP4 AWQ; su tamano exacto no esta publicado en la informacion disponible, aunque por el regimen de cuantizacion se situa en el rango de la decena larga de gigabytes.
- VAEs: `minimax_h3_video_vae_fp16.safetensors` y `minimax_h3_audio_vae_fp32.safetensors` deben cargarse adicionalmente; sus tamanos no se especifican.
- Estimacion agregada: con difusion, text encoder y ambos VAEs, es razonable planificar 32 GB de VRAM o mas para una ejecucion comoda, y recurrir a offload de CPU o descarga por capas si se dispone de 24 GB. Esta cifra es una estimacion a partir de los tamanos conocidos, no un dato confirmado por el autor.
- GPU recomendadas: no hay recomendaciones publicadas. Por capacidad de memoria, encajan A100 40/80 GB, H100 y GPUs consumer de 32 GB; en 24 GB (RTX 3090, RTX 4090) sera necesario gestionar offload con ComfyUI.
- Compatibilidad consumer: los 12,5 GB del checkpoint de difusion caben en cualquier GPU de 16 GB o mas; el cuello de botella es el text encoder de 32.000 millones de parametros.
- Opciones de despliegue: ComfyUI es la unica via documentada, con build reciente que incluya soporte nativo de MiniMax H3 y NVFP4. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. No se publican tiempos de muestreo, resolucion, duracion de clip ni numero de pasos de difusion.
- Almacenamiento: 50,1 GB para el repositorio completo, mas los modelos companeros, VAE y text encoder.

## Comparativa con modelos similares

| Modelo | Origen | Enfoque | Bloques Ref2VA | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|---|
| Este repositorio (b15-49) | taurusduan | Hibrido FL2VA + Ref2VA | 15-49 (70 tensores) | NVFP4 | 12.528.636.800 bytes | minimax-h3-community-license-agreement |
| Este repositorio (b20-49) | taurusduan | Hibrido FL2VA + Ref2VA | 20-49 (60 tensores) | NVFP4 | 12.528.636.800 bytes | minimax-h3-community-license-agreement |
| Este repositorio (b25-49) | taurusduan | Hibrido FL2VA + Ref2VA | 25-49 (50 tensores) | NVFP4 | 12.528.636.800 bytes | minimax-h3-community-license-agreement |
| Este repositorio (b30-49) | taurusduan | Hibrido FL2VA + Ref2VA | 30-49 (40 tensores) | NVFP4 | 12.528.636.800 bytes | minimax-h3-community-license-agreement |
| smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models (b25-49) | smhfacct | Hibrido FL2VA + Ref2VA, referencia de la estrategia de seleccion | 25-49 | INT8 | no disponible | no disponible en la informacion proporcionada |
| lilcheaty/MiniMax-H3-NVFP4 (`minimax_h3_fl2va_pruned_nvfp4`) | lilcheaty | Base FL2VA, sin ruta de referencia | no aplica | NVFP4 | no disponible | no disponible en la informacion proporcionada |
| lilcheaty/MiniMax-H3-NVFP4 (`minimax_h3_ref2va_pruned_nvfp4`) | lilcheaty | Base Ref2VA, sin ruta de primer/ultimo fotograma | todos | NVFP4 | no disponible | no disponible en la informacion proporcionada |
| MiniMaxAI/MiniMax-H3 | MiniMaxAI | Modelo original sin podar ni cuantizar | segun variante original | no aplica (pesos originales) | no disponible | minimax-h3-community-license-agreement |

No se dispone de comparativas con otros modelos de generacion de video de la competencia (por ejemplo, familias propietarias o abiertas alternativas) en la informacion proporcionada, ni de datos de rendimiento que permitan establecer una jerarquia objetiva.

## Limitaciones y advertencias

- Caracter experimental explicito: el propio autor describe los cuatro checkpoints como experimentales y senala que las comparaciones A/B controladas siguen pendientes.
- Ausencia de metricas: no hay benchmarks, FVD, puntuaciones de similitud ni estudios de calidad percibida que respalden ninguna de las cuatro variantes frente a las otras o frente a los modelos de origen.
- Adopcion nula: 0 descargas y 1 like en el momento de la ficha, lo que implica una base de validacion por terceros practicamente inexistente.
- Validacion limitada: mas alla de b25-49, no se documenta la validacion de los flujos FL2VA y Ref2VA con audio para el resto de variantes; la validacion de generacion de video se declara, pero la cobertura de flujos es desigual.
- Dependencia de version de ComfyUI: requiere una build reciente con soporte nativo de MiniMax H3 y NVFP4; versiones anteriores no reconoceran el formato o fallaran al cargar `comfy_quant`.
- Modelos companeros obligatorios: sin el text encoder Qwen3-VL de 32.000 millones en NVFP4 AWQ y los dos VAEs, el checkpoint no es funcional.
- Licencia: se hereda la minimax-h3-community-license-agreement del modelo base, con `license_name: other`. Es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial; la informacion proporcionada no aclara los terminos concretos de atribucion, redistribucion o explotacion comercial.
- Estado de los pesos: al ser una fusion de un modelo ya podado y cuantizado, no hay garantia de que el comportamiento resultante sea equivalente al de un modelo entrenado de forma conjunta para ambas tareas.
- Riesgo de artefactos: no se documentan estudios de coherencia temporal, estabilidad de identidad en la ruta Ref2VA ni sincronizacion labial o de audio.
- Idiomas soportados: no disponibles; no se declara cobertura multilingue del condicionamiento textual.
- Integridad verificable pero no reproducible por terceros en este documento: los hashes SHA256 estan publicados, pero no se aportan scripts de verificacion ni registros de ejecucion.
- Sesgos conocidos: no disponibles; la model card no trata cuestiones de sesgo, representacion ni contenido sensible.
- Riesgo de alucinacion visual: inherente a los modelos generativos de video, sin evaluacion publicada que lo acote.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taurusduan/MiniMax-H3-FL2VA-Ref2VA-Hybrid-NVFP4
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia de la comunidad MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Base NVFP4 (FL2VA y Ref2VA): https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4
- Referencia de la estrategia de fusion: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models

No se han encontrado enlaces adicionales relevantes (papers, blogs tecnicos, repositorios de codigo ni demos) en la busqueda web realizada.
