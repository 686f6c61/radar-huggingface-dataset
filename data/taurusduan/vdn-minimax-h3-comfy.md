# taurusduan/Vdn-Minimax-H3-Comfy

## Resumen

Vdn-Minimax-H3-Comfy es un paquete de pesos listo para usar con ComfyUI, publicado por el usuario taurusduan, que empaqueta los componentes necesarios para ejecutar los flujos OpenVDN sobre el modelo MiniMax-H3 de MiniMaxAI. No es un modelo entrenado desde cero: la model card lo declara como un fine-tune del modelo base MiniMaxAI/MiniMax-H3 orientado a generacion de video con audio (pipeline text-to-video), con adaptadores DMD (destilacion por matching de distribucion) y Turbo ya empaquetados. El repositorio ocupa 83,1 GB e incluye dos bases de difusion cuantizadas a INT8 con rotacion de convolucion, un codificador de texto Qwen3-VL de 32B en NVFP4/AWQ y dos VAE independientes, uno de video y otro de audio.

Su relevancia practica esta en que reduce la barrera de entrada para probar MiniMax-H3 en hardware de consumo: el autor documenta validaciones completas en una RTX 4060 Ti de 16 GB, con una base podada a 320x192x39 y un minimo de 290 MiB de VRAM libre registrado. Tambien aporta modos de condicionamiento que el release upstream de OpenVDN no documenta, como last-frame, first-and-last-frame, referencias de imagen multiples, video de referencia con su audio y audio de referencia independiente.

El principal caveat es la licencia: la MiniMax H3 Community License excluye explicitamente de su territorio aplicable a la Union Europea, el Reino Unido, la Republica de Corea y los Estados Unidos, y el acceso al repositorio esta sujeto a un gate de confirmacion. Ademas, el repositorio no publica resultados de benchmarks de calidad, solo comprobaciones mecanicas de compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para video y audio; el paquete incluye un backbone DiT cuantizado, codificador de texto Qwen3-VL 32B y VAE de video y audio separados) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (el codificador de texto es Qwen3-VL 32B, pero no se especifica su ventana efectiva en este pipeline) |
| Tipos de cuantizacion | INT8 con ConvRot en los pesos de difusion; NVFP4 + AWQ en el codificador de texto; FP16 en el VAE de video; FP32 en el VAE de audio |
| Idiomas soportados | no disponible (la model card esta en ingles; los materiales de autor estan mayoritariamente en chino) |
| Licencia | minimax-h3-community-license (campo `license: other`); territorio aplicable excluye UE, Reino Unido, Corea del Sur y EE. UU. |
| Formato de pesos | safetensors |
| Variante base | MiniMaxAI/MiniMax-H3 (fine-tune declarado) |
| Pipeline declarado | text-to-video |
| Biblioteca | minimax-h3 |
| Tamano del repositorio | 83,1 GB |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

Archivos incluidos y su ubicacion en ComfyUI:

| Carpeta de ComfyUI | Archivo | Tamano |
|---|---|---|
| `diffusion_models` | `minimax_h3_fl2va_int8_convrot.safetensors` | 34,04 GB |
| `diffusion_models` | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | 20,97 GB |
| `diffusion_models/OpenVDN/vdn-minimax-h3` | Configs DMD/Stage-B, rama de 50 bloques, adaptadores nativos y adaptador Turbo con proyeccion de curva | 6,62 GB |
| `text_encoders` | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | 15,69 GB |
| `vae` | `minimax_h3_video_vae_fp16.safetensors` | 5,21 GB |
| `vae` | `minimax_h3_audio_vae_fp32.safetensors` | 0,61 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla el numero de parametros ni la composicion del dataset de entrenamiento. Lo que si se puede deducir de los artefactos publicados es la estructura del pipeline: un backbone de difusion con atencion (los adaptadores Turbo atacan 51 modulos AdaLN, con LoRA sobre una entrada de 2688 columnas), un codificador de texto Qwen3-VL de 32B cuantizado a NVFP4 con AWQ, y dos VAE separados, uno para video en FP16 y otro para audio en FP32. La presencia de un VAE de audio y de modos T2VA (texto a video con audio) e I2VA confirma que el modelo genera video y audio de forma conjunta, no solo pistas visuales.

En el plano de la inferencia, el paquete integra la receta de OpenVDN basada en DMD: para la ruta destilada se fijan 8 pasos Euler con native-flow y desplazamientos (shifts) de 12 para video y 3 para audio; para la Stage B se usa el adaptador por defecto a 50 pasos. El detalle tecnico mas singular es la gestion del adaptador Turbo sobre la base podada: el adaptador publicado originalmente tiene 51 objetivos AdaLN LoRA entrenados para 2688 columnas, mientras que la base podada incluida trabaja con ocho columnas. El autor suministra un adaptador alternativo con proyeccion de curva que conserva 208 modulos directamente compatibles y representa los 51 modulos AdaLN como factores LoRA de ocho columnas mas 51 residuales de sesgo, totalizando 310 parches aplicados. La seleccion del adaptador se ata al hash del contenido de la tabla `adaln_t_table`, no al nombre del archivo, de modo que un checkpoint podado con una tabla de curva desconocida falla antes del muestreo en lugar de aplicar el adaptador equivocado.

## Capacidades

- Generacion de video con audio sincronizado a partir de texto (T2VA), que es el unico modo documentado por el upstream de OpenVDN.
- Image-to-video con primer fotograma (I2VA), ultimo fotograma (L2VA) y combinacion de primero y ultimo (FL2VA).
- Referencias visuales: Ref2VA con una sola imagen o con multiples imagenes de referencia.
- Video de referencia junto con su pista de audio.
- Audio de referencia independiente, sin acompanamiento visual.
- Modo hibrido de primer fotograma mas audio de referencia.
- Muestreo acelerado en 8 pasos (DMD) y muestreo de mayor fidelidad en 50 pasos (Stage B).
- Integracion nativa con ComfyUI mediante un nodo personalizado que detecta la estructura de la base y elige el adaptador correspondiente de forma automatica.
- No se documentan capacidades de tool calling, function calling, razonamiento agentico ni decodificacion especulativa, dado que se trata de un modelo generativo de medios y no de un modelo de lenguaje conversacional.

## Casos de uso

- Prototipado de video generativo en estacion de trabajo de gama media: con la base podada INT8 a 320x192x39, el autor reporta ejecuciones validas en una RTX 4060 Ti de 16 GB, lo que permite iterar sobre prompts e imagenes sin acceso a GPU de datacenter.
- Produccion de clips cortos con audio integrado: el modo T2VA genera imagen y sonido en una sola pasada, util para storyboards animados, teasers o contenido para redes donde no se quiere montar la pista de audio por separado.
- Animacion de fotogramas clave: con FL2VA se pueden fijar el primer y el ultimo fotograma de un plano y dejar que el modelo interpole el movimiento y el audio, un flujo tipico en previsualizacion de animacion.
- Transferencia de estilo o de movimiento a partir de referencias: Ref2VA con multiples imagenes permite condicionar la apariencia de un personaje u objeto sin reentrenar nada.
- Doblaje y re-sonorizacion de video: el modo de video de referencia con su audio, y el modo de audio de referencia independiente, permiten conservar una pista de voz o ambiente y regenerar la parte visual en consonancia.
- Integracion en pipelines de ComfyUI existentes: al usar los nombres de carpeta nativos y descargarse directamente en `ComfyUI/models`, el bundle se puede insertar en grafos ya montados sin reorganizar archivos.
- Evaluacion comparativa de metodos de destilacion: al incluir tanto los adaptadores DMD/Turbo como la ruta Stage B de 50 pasos, el paquete sirve para medir el compromiso entre velocidad (8 pasos) y fidelidad (50 pasos) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo VBench, MMLU o similares) en la informacion disponible. La model card unicamente documenta comprobaciones mecanicas de compatibilidad ejecutadas por el autor, que se recogen a continuacion y no deben interpretarse como metricas de calidad:

| Prueba | Configuracion | Resultado reportado |
|---|---|---|
| Validacion a ancho completo | 512x288x39, RTX 4060 Ti 16 GB, cada flujo multimodal por separado | completada |
| Matriz serial con base podada | 320x192x39, INT8 podada | 9/9 ejecuciones correctas |
| Parches aplicados en la matriz podada | rama de 800 tensores, 104 parches por defecto, 310/310 parches de curva Turbo (259 objetivos logicos + 51 residuales de sesgo) | 0 errores de LoRA registrados |
| Decodificacion | H.264/AAC estricto, video, audio y combinado, PCM finito sin clipping | superada |
| VRAM libre minima | matriz podada | 290 MiB |
| Margen de 512 MiB del proyecto | matriz podada | solo T2VA e I2VA lo superaron |

El propio autor advierte que estas pruebas demuestran compatibilidad, no seguridad universal en 16 GB, y que no garantizan la misma calidad o consumo con cualquier prompt, imagen, sonido, GPU o driver.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. Como referencia de orden de magnitud, el conjunto completo suma unos 62 GB en disco (34,04 + 15,69 + 5,21 + 0,61 + 6,62 GB) y la variante podada unos 49 GB (20,97 + 15,69 + 5,21 + 0,61 + 6,62 GB); con cuantizaciones INT8/NVFP4 el modelo no necesita mantener todo residente en VRAM a la vez, pero se requiere gestion de offload de ComfyUI.
- GPU validadas por el autor: RTX 4060 Ti de 16 GB, tanto con la base completa a 512x288x39 como con la base podada INT8 a 320x192x39.
- GPU de gama alta recomendadas para margen comodo: no confirmadas en la informacion disponible; por tamano de pesos, soluciones con 24 GB o mas (RTX 4090, RTX 5090, A6000, L40S) y A100/H100 para ejecucion sin offload agresivo y a resoluciones mayores.
- Cabe en GPU de consumo: si, segun la validacion del autor en RTX 4060 Ti 16 GB, con la advertencia explicita de que no hay garantia de seguridad universal en 16 GB.
- Opciones de despliegue: ComfyUI con el nodo personalizado `comfyui-minimax-h3-audio-T8`, que es el unico entorno soportado y probado segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato operativo es el numero de pasos de muestreo (8 pasos Euler/native-flow en la ruta DMD, 50 pasos en Stage B), que condiciona el tiempo de generacion pero no se cuantifica.

## Comparativa con modelos similares

Los resultados de busqueda web proporcionados no contienen informacion sobre modelos comparables, y la model card no incluye comparativas. La unica referencia contrastable es el modelo base del que deriva este paquete:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vdn-Minimax-H3-Comfy (este repositorio) | no disponible | no disponible | sin benchmarks publicados | minimax-h3-community-license, territorio que excluye UE, Reino Unido, Corea del Sur y EE. UU. | gated en HuggingFace, 0 descargas |
| MiniMaxAI/MiniMax-H3 (upstream) | no disponible | no disponible | no disponible | misma licencia | base del fine-tune |
| Otras alternativas de generacion de video con audio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Restriccion geografica critica: el territorio aplicable de la MiniMax H3 Community License excluye la Union Europea, el Reino Unido, la Republica de Corea y los Estados Unidos. Un desarrollador o investigador ubicado en Espana no tiene autorizado el uso segun los terminos declarados, y el formulario de acceso exige confirmar que no se solicita desde un territorio excluido.
- Acceso condicionado: el repositorio esta sujeto a un gate de HuggingFace que obliga a aceptar la licencia y a declarar pais o region antes de descargar.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks de calidad publicados y sin revision independiente.
- Las unicas pruebas reportadas son comprobaciones mecanicas de compatibilidad de pesos, decodificacion y memoria, no evaluaciones de fidelidad visual, coherencia temporal, sincronia audio-video ni seguimiento de prompt.
- Ambiguedad de autoria: el repositorio figura a nombre de `taurusduan`, pero la model card y los comandos de instalacion remiten a `t8star/Vdn-Minimax-H3-Comfy` y a la cuenta de HuggingFace `t8star`. Conviene verificar cual es la copia canonica antes de integrarla.
- Riesgo de alucinacion y artefactos: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos de difusion para video con audio (deriva temporal, inconsistencias de identidad entre fotogramas, desincronia labial o sonora).
- No se deben apilar otros aceleradores: la model card prohibe expresamente combinar el modelo OpenVDN con otro LoRA Turbo/EMA, SLA, VSA, Sol-Attn, BlockCache o un segundo parche de atencion o modelo.
- Restriccion de contexto y de idioma: no se documenta la ventana del codificador de texto ni la lista de idiomas soportados para prompts o audio.
- Enlaces con codigos de referido: la model card incluye URLs de Seedance y RunningHub con codigos de afiliacion o invitacion aportados por T8star.
- El campo `region:us` de los tags de HuggingFace no debe interpretarse como una habilitacion de uso en Estados Unidos; la propia licencia excluye ese territorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Vdn-Minimax-H3-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Texto completo de la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodo personalizado para ComfyUI: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- Canal de Bilibili de T8star: https://space.bilibili.com/385085361
- Canal de YouTube de T8star: https://www.youtube.com/@T8star-Aix/
- Cuenta de T8star en HuggingFace: https://huggingface.co/t8star
- Aplicaciones online (RunningHub): https://www.runninghub.ai/zh-cn/user-center/190537030230583653/userPost?inviteCode=rh-v1121
- Paquete todo en uno de ComfyUI (Quark Drive): https://pan.quark.cn/s/264edb7e36bd
- API de Seedance (enlace con codigo de afiliacion): https://api.seedance.nz/sign-up?aff=5f4w
- No se han encontrado papers, blogs tecnicos ni demos adicionales en los resultados de busqueda disponibles.
