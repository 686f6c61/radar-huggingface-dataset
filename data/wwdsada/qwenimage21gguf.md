# wwdsada/qwenimage21gguf

## Resumen

`wwdsada/qwenimage21gguf` es una redistribucion en formato GGUF del modelo de difusion Qwen-Image-2.1, publicado por el usuario wwdsada y pensado para inferencia con poca VRAM en `stable-diffusion.cpp` y ComfyUI-GGUF. No es un modelo nuevo: es un reempaquetado del DiT original de Qwen, con 7.115.124.736 parametros (7,115 G), 265 tensores y 11 niveles de cuantizacion distintos, desde BF16 sin perdida hasta Q2_K.

El modelo base, Qwen/Qwen-Image-2.1, es un generador unificado de texto a imagen y edicion de imagen con arquitectura Single-Stream DiT de 32 capas, atencion de granularidad mixta, reutilizacion de prefix KV cache, soporte nativo de RGBA con canal alfa y edicion con hasta 10 imagenes de referencia. El repositorio solo contiene los pesos del DiT: el codificador de texto (Qwen3-VL-8B) y el VAE deben descargarse por separado desde Comfy-Org/Qwen-Image-2.1, lo que es un detalle critico para cualquiera que quiera desplegarlo.

Su relevancia practica esta en el catalogo de cuantizaciones: el autor publica medidas de fidelidad tensor a tensor (coseno, RMSE relativo y error absoluto maximo) y verifica que la variante BF16 es byte a byte equivalente al safetensors original de 14.230.280.616 bytes. Eso permite elegir el equilibrio entre calidad y VRAM con datos en la mano, algo poco habitual en reempaquetados GGUF. El repositorio ocupa 58,1 GB y, en el momento de la ficha, tiene 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Single-Stream DiT (Diffusion Transformer) de 32 capas; atencion de granularidad mixta con reutilizacion de prefix KV cache |
| Parametros totales | 7.115.124.736 (7,115 G) en el componente DiT de generacion visual |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion; no usa ventana de contexto de LLM) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el autor no lo especifica; los prompts se procesan con el codificador externo Qwen3-VL-8B) |
| Licencia | qwen-research (`license: other`), con enlace al LICENSE del modelo base |
| Formato de pesos | GGUF (265 tensores) en 11 ficheros; el original se distribuye en safetensors BF16 |
| Tamano del repositorio | 58,1 GB |
| Scheduler | Flow Matching + Euler discrete (dynamic shifting) |
| Resolucion nativa | 2048 x 2048, con 7 relaciones de aspecto soportadas |
| Pasos recomendados | 40 (recomendacion oficial) |
| Componentes externos necesarios | Codificador de texto Qwen3-VL-8B (`qwen3vl_8b_bf16.safetensors`) y VAE (`qwen_image_2.1_vae_bf16.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible describe el componente de generacion visual como un DiT de 32 capas en configuracion single-stream, con atencion de granularidad mixta y reutilizacion de prefix KV cache para reducir el coste de inferencia. El muestreo usa Flow Matching combinado con Euler discrete y dynamic shifting. El modelo es unificado: cubre tanto texto a imagen como edicion de imagen, incluyendo generacion y edicion nativa de imagenes RGBA con canal alfa, y edicion localizada mediante seleccion circular, garabato o mascara, con hasta 10 imagenes de referencia como entrada.

No hay datos publicados en esta informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; son datos que corresponderian a la model card de Qwen/Qwen-Image-2.1, no a este reempaquetado. La innovacion tecnica documentada en este repositorio es exclusivamente el proceso de cuantizacion: 65 tensores 1D de normalizacion (`attn.norm_q.weight` x32, `attn.norm_k.weight` x32, `txt_in.text_norm.weight`) se promueven de BF16 a F32 mediante desplazamiento de 16 bits con relleno de ceros, lo que es una extension de ancho sin perdida numerica, no un error de cuantizacion. Ademas, tres tensores sensibles (`img_in.weight`, `txt_in.in_layer.weight`, `txt_in.out_layer.weight`) se mantienen en BF16 porque el cuantificador los excluye por prefijo `img_in.` / `txt_in.`.

La diferencia entre las variantes M y S de una misma familia (por ejemplo Q4_K_M frente a Q4_K_S) consiste unicamente en que 32 tensores `attn.to_v.weight` se suben un nivel: en Q4_K_M pasan a Q6_K; en Q5_K_M, a Q6_K; en Q3_K_L, a Q5_K; en Q2_K, a Q3_K. El autor advierte de que "los primeros N" se cuentan por orden lexicografico de escritura en el GGUF, de modo que en Q3_K_M y Q4_K_S afecta a las capas 0, 1, 10 y 11, no a las capas 0 a 3.

## Capacidades

- Generacion de imagen a partir de texto en resoluciones nativas de hasta 2752 x 1536 (16:9) y 2048 x 2048 (1:1), con 7 relaciones de aspecto documentadas: 1:1, 4:3, 3:4, 3:2, 2:3, 16:9 y 9:16.
- Edicion de imagen con hasta 10 imagenes de referencia en una misma peticion.
- Edicion localizada mediante seleccion circular, garabato o mascara, para modificar solo una region del lienzo.
- Generacion y edicion nativa de imagenes RGBA con fondo transparente. El formato de prompt recomendado es: `This is an RGBA image with transparency. <descripcion>. The image has alpha channel and the background is transparent.`
- Despliegue en hardware de gama media gracias a las 11 cuantizaciones disponibles, desde 2,28 GiB (Q2_K) hasta 13,25 GiB (BF16).
- Integracion con el ecosistema ComfyUI mediante el nodo `Unet Loader (GGUF)` de ComfyUI-GGUF, y con `stable-diffusion.cpp` mediante `sd-cli`.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso: es un modelo de difusion, no un LLM.
- Capacidades multilingues: no disponibles en la informacion proporcionada. Dependerian del codificador de texto Qwen3-VL-8B, que se distribuye aparte.
- No hay soporte de audio ni de video documentado.

## Casos de uso

- Generacion de recursos graficos con fondo transparente: usando la sintaxis de prompt RGBA documentada, el modelo produce PNG con canal alfa listo para integrarse en interfaces, catalogos de producto o capas de composicion sin recorte posterior.
- Edicion localizada en flujo de produccion fotografica: con mascara o seleccion circular se puede sustituir un objeto o corregir una zona concreta manteniendo el resto de la imagen intacta, lo que reduce el numero de iteraciones frente a una regeneracion completa.
- Composicion multirreferencia para coherencia de marca: las hasta 10 imagenes de referencia permiten fijar el aspecto de un producto o personaje a lo largo de una campana, alimentando variaciones de escena sin perder identidad visual.
- Prototipado en GPU de 8 GB: la variante Q4_K_M ocupa 3,90 GiB, por lo que entra en tarjetas de 6 a 8 GB y permite iterar bocetos en local sin depender de servicios en la nube.
- Key art y fondos en formato panoramico: las relaciones 16:9 (2752 x 1536) y 2:3 (1696 x 2528) cubren fondos de escritorio, cabeceras web y formatos editoriales verticales sin reescalado posterior.
- Regresion visual en CI/CD: con las variantes Q8_0 (coseno 0.9999725) y BF16 (equivalencia byte a byte) se puede montar un test que compare salidas entre el original y la version cuantizada antes de promover un cambio de pesos.
- Despliegue en estudio de diseno sobre ComfyUI: el pipeline completo (GGUF en `models/unet/`, Qwen3-VL-8B en `models/text_encoders/`, VAE en `models/vae/`) se monta con el nodo GGUF, sin necesidad de GPU de datacenter.
- Pruebas de limites de compresion: Q2_K (2,28 GiB) y Q3_K_S (2,90 GiB) sirven para fijar el suelo de tamano aceptable, no para produccion, dado su error relativo del 35,453 % y 18,246 % respectivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, GenEval, HPSv2 ni metricas equivalentes de calidad de imagen, ni comparaciones contra otros generadores. Lo que si publica el autor son mediciones de fidelidad de la cuantizacion: se muestrearon 11 tensores que cubren atencion q/out, `img_mlp`, `txt_in`, `img_in`/`proj_out` y los tensores promovidos a F32, y se compararon contra el safetensors BF16 nativo tras desquantizar.

| Nivel | Coseno | RMSE relativo | Error absoluto maximo |
|---|---|---|---|
| BF16 | 1,0000000 | 0,000 % | 0,00000 |
| Q8_0 | 0,9999725 | 0,742 % | 0,00598 |
| Q6_K | 0,9997386 | 2,287 % | 0,02393 |
| Q5_K_M / Q5_K_S | 0,9989987 | 4,475 % | 0,06301 |
| Q4_K_M / Q4_K_S | 0,9960965 | 8,839 % | 0,10559 |
| Q3_K_L / Q3_K_M / Q3_K_S | 0,9836174 | 18,246 % | 0,26800 |
| Q2_K | 0,9415860 | 35,453 % | 0,35107 |

Dos matices que el propio autor senala: las variantes M y S de un mismo nivel presentan el mismo error en el muestreo porque la mejora solo afecta a los 32 tensores `attn.to_v.weight` y la estadistica la dominan los tensores grandes no promovidos; y los tensores `img_in.weight`, `txt_in.in_layer.weight`, `txt_in.out_layer.weight` (retenidos en BF16) y `attn.norm_q.weight`, `txt_in.text_norm.weight` (promovidos a F32) presentan error 0,000 %.

Verificacion de equivalencia frente al safetensors nativo `diffusion_models/qwen_image_2.1_bf16.safetensors` (14.230.280.616 B):

| Comprobacion | Resultado |
|---|---|
| Nombres, numero y orden de tensores | 265 / 265, identicos |
| 200 tensores BF16 | 100 % identicos byte a byte |
| 65 tensores F32 | 100 % iguales a la extension sin perdida de BF16 (desplazamiento de 16 bits) |
| Numero de parametros | 7,115 G, identico |
| Diferencia de tamano de fichero | +14.072 B (0,0001 %), atribuibles a cabecera y padding de alineacion a 32 bytes |

## Requisitos de hardware

- VRAM recomendada por el autor segun el nivel de cuantizacion: 6-8 GB para Q4_K_M (preferido) o Q3_K_M; 8-12 GB para Q5_K_M o Q6_K; mas de 12 GB para Q8_0; BF16 solo para pruebas de precision comparativa.
- La VRAM es un minimo, no una garantia: el modelo trabaja a resolucion nativa de 2048 x 2048 y las activaciones a alta resolucion consumen memoria adicional, por lo que el nivel util depende tambien de la resolucion y del batch.
- Si la VRAM aprieta, el autor indica usar `--offload-to-cpu` en `stable-diffusion.cpp` o la carga por bloques de ComfyUI.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la informacion disponible. Por tamano de fichero, cualquier GPU con 6 GB o mas puede ejecutar Q4_K_M; a partir de 12-16 GB se puede usar Q8_0 con margen.
- Opciones de despliegue documentadas: `stable-diffusion.cpp` (incluye el modo `convert` usado para generar estos GGUF) y ComfyUI con la extension ComfyUI-GGUF. No se mencionan vLLM, TGI ni Ollama, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. El unico parametro temporal publicado es el numero de pasos recomendado, 40.
- Hay que contar con espacio en disco: el repositorio completo ocupa 58,1 GB, aunque solo se descarga el fichero que se vaya a usar.
- Componentes adicionales a descargar por separado: `qwen3vl_8b_bf16.safetensors` (codificador de texto, ~8B) y `qwen_image_2.1_vae_bf16.safetensors` (VAE).

## Comparativa con modelos similares

No hay datos en la informacion proporcionada sobre otros empaquetados GGUF de la misma categoria (por ejemplo cuantizaciones de FLUX.1, SD 3.5 u otros DiT), por lo que la comparacion con alternativas externas queda como no disponible. La comparacion significativa aqui es la del propio repositorio consigo mismo, nivel a nivel, frente al safetensors original:

| Version | Parametros | Tamano | Formato | Licencia | Calidad medida (coseno) |
|---|---|---|---|---|---|
| Qwen-Image-2.1 original (bf16 safetensors) | 7,115 G | 14.230.280.616 B | safetensors | qwen-research | referencia (1,0000000) |
| `qwen-image-2.1-BF16.gguf` | 7,115 G | 13,25 GiB | GGUF | qwen-research | equivalente byte a byte |
| `qwen-image-2.1-Q8_0.gguf` | 7,115 G | 7,07 GiB | GGUF | qwen-research | 0,9999725 |
| `qwen-image-2.1-Q6_K.gguf` | 7,115 G | 5,47 GiB | GGUF | qwen-research | 0,9997386 |
| `qwen-image-2.1-Q5_K_M.gguf` | 7,115 G | 4,66 GiB | GGUF | qwen-research | 0,9989987 |
| `qwen-image-2.1-Q5_K_S.gguf` | 7,115 G | 4,60 GiB | GGUF | qwen-research | 0,9989987 |
| `qwen-image-2.1-Q4_K_M.gguf` | 7,115 G | 3,90 GiB | GGUF | qwen-research | 0,9960965 |
| `qwen-image-2.1-Q4_K_S.gguf` | 7,115 G | 3,78 GiB | GGUF | qwen-research | 0,9960965 |
| `qwen-image-2.1-Q3_K_L.gguf` | 7,115 G | 3,03 GiB | GGUF | qwen-research | 0,9836174 |
| `qwen-image-2.1-Q3_K_M.gguf` | 7,115 G | 2,97 GiB | GGUF | qwen-research | 0,9836174 |
| `qwen-image-2.1-Q3_K_S.gguf` | 7,115 G | 2,90 GiB | GGUF | qwen-research | 0,9836174 |
| `qwen-image-2.1-Q2_K.gguf` | 7,115 G | 2,28 GiB | GGUF | qwen-research | 0,9415860 |

## Limitaciones y advertencias

- El repositorio solo contiene los pesos del DiT. Sin el codificador de texto Qwen3-VL-8B y el VAE no se puede ejecutar nada; no es un paquete autonomo.
- Perdida de calidad creciente con la compresion: Q4_K_M ya acumula un 8,839 % de RMSE relativo, y el salto a Q3 (18,246 %) provoca degradacion visible en las imagenes segun el autor. Q3_K_S y Q2_K estan explicitamente desaconsejados: Q2_K baja a coseno 0,942 y 35,453 % de error y solo sirve como prueba de limite de tamano.
- El muestreo de fidelidad cubre 11 tensores y se basa en el error maximo, por lo que no cuantifica el impacto perceptual completo en la imagen final. No hay evaluacion visual sistematica publicada.
- No hay datos de sesgos, composicion del dataset ni filtros de seguridad en la informacion disponible. Al ser un generador de imagenes, hereda los sesgos y riesgos del modelo base Qwen-Image-2.1, que no se documentan aqui.
- Licencia `qwen-research` (`license: other`). Es una licencia especifica de investigacion de Qwen, no Apache 2.0 ni MIT, por lo que hay que revisar el texto enlazado antes de cualquier uso comercial. El autor no aclara los terminos aplicables al reempaquetado GGUF.
- Idiomas soportados no declarados. El comportamiento multilingue dependera del codificador Qwen3-VL-8B, cuyo limite tampoco se especifica.
- La resolucion nativa de 2048 x 2048 eleva el consumo de activaciones: la tabla de VRAM por nivel de cuantizacion es un suelo optimista y puede quedarse corta con batch mayor que 1.
- El autor advierte de un error frecuente de lectura en las tablas de cuantizacion: "los primeros N tensores" se refiere al orden lexicografico en el GGUF, no al orden de capas.
- Repositorio con 0 descargas y 1 like en el momento de la ficha, creado y actualizado el mismo dia (20 de septiembre de 2026). Sin validacion de la comunidad, conviene verificar los hashes antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wwdsada/qwenimage21gguf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Componentes complementarios (codificador de texto y VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- `stable-diffusion.cpp`: https://github.com/leejet/stable-diffusion.cpp
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card del autor.
