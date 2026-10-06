# ysharma/Qwen-Image-2.1-image-translator-LoRA

## Resumen

Qwen-Image-2.1 Image Translator LoRA es un adaptador LoRA de edicion de imagen desarrollado por el usuario ysharma sobre el modelo base Qwen/Qwen-Image-2.1. Su funcion es traducir todo el texto presente en una imagen a un idioma objetivo conservando tipografia, color, tamano y posicion de cada elemento textual, sin alterar los pixeles no textuales. Se distribuye como pesos LoRA en formato safetensors para la libreria diffusers y su entrenamiento se documento en el paper con identificador arXiv:2603.11593.

El adaptador resuelve un problema muy concreto de los flujos de localizacion de contenido: reescribir rotulos, etiquetas, carteles o interfaces dentro de una imagen manteniendo la coherencia visual, algo que los modelos de edicion genericos no garantizan. Admite dos modos de operacion: el modo A, en el que el propio modelo traduce de forma automatica, y el modo B, en el que el usuario proporciona pares exactos origen-destino para poder conectar cualquier traductor externo.

Tecnicamente es un LoRA de rango lineal 32 con alpha 32 aplicado a todos los modulos de atencion y MLP del transformer de difusion, entrenado durante 2.000 pasos sobre 6.000 tripletas (imagen origen, imagen destino, instruccion) a 1.024 px. Cubre ingles, chino simplificado, japones, coreano, espanol, frances y aleman, y declara explicitamente que no soporta escrituras de derecha a izquierda. El repositorio ocupa 1,0 GB y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion Qwen/Qwen-Image-2.1 (ai-toolkit `arch: qwen_image_2`, commit `ecee894`); rango lineal 32 / alpha 32 en todos los modulos de atencion y MLP |
| Parametros totales | no disponible (repositorio de 1,0 GB; el numero exacto de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: la condicion de entrada es una instruccion de texto de gramatica fija, no una ventana de contexto) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles, chino simplificado, japones, coreano, espanol, frances y aleman. El hindi (devanagari) esta soportado por el generador del dataset pero no fue entrenado ni evaluado. Sin soporte de escrituras de derecha a izquierda (arabe, hebreo) |
| Licencia | qwen-research-license (`license: other`) |
| Formato de pesos | safetensors para diffusers; fichero recomendado `imtrans_full_2000_gate_up_split.safetensors` |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tamano del repositorio | 1,0 GB |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

El adaptador se entrena con ai-toolkit sobre la arquitectura `qwen_image_2` del modelo base Qwen-Image-2.1, un transformer de difusion con formulacion flow matching. El LoRA es lineal de rango 32 con alpha 32 y se aplica a todos los modulos de atencion y MLP del transformer. El entrenamiento usa adamw8bit con learning rate 1e-4, batch size 1, timesteps ponderados, precision bf16 y gradient checkpointing, con `cache_latents_to_disk` y `cache_text_embeddings` activados. Se realizaron 2.000 pasos sobre un unico A100 de 80 GB, con un coste de 3,25 s por paso y una duracion total aproximada de 2,26 horas, generando checkpoints en los pasos 500, 1000, 1500 y 2000. La loss registrada en trackio termino en aproximadamente 0,16 tras el ruido normal de un batch de tamano 1.

El dataset consta de 6.000 tripletas (origen, destino, instruccion) publicadas en `ysharma/image-translator-pairs`, renderizadas a 1.024 px con mezcla de buckets 1:1, 3:4, 4:3 y 16:9. Los fondos se generaron con el propio Qwen-Image 2.1 en configuracion Viggle de 6 pasos turbo y fueron filtrados por OCR para garantizar que no contenian texto. Cada imagen destino es un render tipografico real con ground truth por elemento (poligono, fuente, tamano y color), no una imagen falsa. La innovacion principal no esta en la arquitectura sino en la formulacion de la tarea: una gramatica de instruccion fija que separa traduccion automatica (modo A, 70% de los pares) de reemplazo tipografico exacto (modo B, 30%), con reglas explicitas para no traducir numeros, precios, fechas en cifras, URLs, correos electronicos ni nombres de marca.

## Capacidades

- Traduccion de texto integrado en imagenes entre siete idiomas (en, zh, ja, ko, es, fr, de), preservando fuente, color, tamano y posicion de cada elemento textual.
- Modo A (automatico): el modelo realiza la traduccion a partir de la instruccion `<translate> Translate all text in this image into {Language}. Keep the fonts, colours, layout and everything that is not text exactly the same.` o de la variante con idioma origen y destino que preserva nombres de marca.
- Modo B (tipografiado): el usuario aporta hasta 8 pares exactos origen-destino, ordenados de mayor a menor longitud, mediante la instruccion `<translate> Replace the text exactly as follows...`, lo que permite conectar un traductor externo.
- Preservacion estricta de elementos no textuales: numeros, precios, fechas en cifras, URLs, correos electronicos y nombres de marca nunca se traducen en ningun modo.
- Composicion con otros adaptadores: se puede apilar con el LoRA `Viggle/Qwen-Image-2.1-viggle-turbo` para reducir la inferencia de 40 pasos a 6 o 9 pasos con scheduler FlowMatchEulerDiscreteScheduler.
- Edicion de imagen guiada por instruccion sobre una unica imagen de entrada, sin necesidad de mascara ni de capas separadas.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Localizacion de material de marketing: traducir banners, carteles y creatividades con texto incrustado a los idiomas de cada mercado conservando la identidad visual de la marca, usando el modo A para el grueso del trabajo.
- Adaptacion de capturas de producto y tiendas de aplicaciones: sustituir los textos de las capturas de pantalla por su equivalente en otro idioma sin rehacer el diseno, algo especialmente util porque el modo B permite fijar manualmente cadenas criticas como precios o nombres de funcionalidades.
- Traduccion de menus y rotulacion de hosteleria: procesar fotografias de carteles o menus en siete idiomas manteniendo la tipografia original, con la garantia de que precios y numeros permanecen intactos.
- Preparacion de material editorial y comics: al conservar tamano, color y posicion, el adaptador permite localizar bocadillos y rotulos sin rehacer el arte, aunque el japones muestra una precision OCR inferior segun las pruebas del autor.
- Generacion de variantes A/B en campanas internacionales: producir en pocos minutos versiones de un mismo anuncio en varios idiomas para test de rendimiento, combinando el LoRA con turbo para reducir el coste por edicion.
- Enriquecimiento de datasets sinteticos: usar el modo B para generar pares imagen-origen / imagen-destino con texto controlado, utiles para entrenar o evaluar otros sistemas de OCR o de edicion.
- Traduccion de documentacion tecnica escaneada o diagramas: reemplazar etiquetas de figuras y esquemas conservando la disposicion, con la ventaja de que las URLs y los correos no se alteran.

## Benchmarks y rendimiento

Evaluacion del autor con PaddleOCR-VL-1.6 como lector (via `spotting`, ruta solo transformers, fp16) sobre 24 imagenes renderizadas con cadenas conocidas en los siete idiomas. El umbral de calidad (gate) fue superado con una precision de caracteres global de 0,971.

| Idioma | Precision de caracteres |
|---|---|
| Ingles (en) | 1,000 |
| Frances (fr) | 1,000 |
| Chino simplificado (zh) | 1,000 |
| Coreano (ko) | 1,000 |
| Espanol (es) | 0,981 |
| Aleman (de) | 0,974 |
| Japones (ja) | 0,881 |
| Global | 0,971 |

Velocidades medidas en una A100 de 80 GB a 1.024 px con `true_cfg_scale=1.0`:

| Configuracion | Segundos por edicion | VRAM pico |
|---|---|---|
| Base, 40 pasos | 19,2 | 38,9 GiB |
| Con el LoRA, 40 pasos | 19,9 | no disponible |
| Base + turbo, 6 pasos | 3,9 | 40,3 GiB |
| Base + turbo, 9 pasos | 5,3 | 40,3 GiB |
| LoRA + turbo, 6 pasos | 3,9 | 40,3 GiB |
| LoRA + turbo, 9 pasos | 5,3 | 40,3 GiB |

Seleccion de checkpoint sobre 12 casos estratificados T1, 20 pasos de inferencia y puntuacion con PaddleOCR-VL: el paso 2000 es el ganador. La tabla de resultados por checkpoint (columnas de coincidencia exacta y precision de caracteres) aparece truncada en la model card, por lo que los valores numericos de cada checkpoint no estan disponibles.

## Requisitos de hardware

- VRAM estimada: 38,9 GiB en configuracion base de 40 pasos y 40,3 GiB al apilar el LoRA turbo (medido en A100 80 GB, bf16, 1.024 px).
- GPU recomendadas: A100 80 GB es la unica configuracion con mediciones publicadas. Por consumo de VRAM, se requiere una GPU de 40 GB o mas (A100 40 GB, A6000 48 GB, H100).
- GPU de consumo: no disponible si cabe en una RTX 4090 (24 GB de VRAM). Con los datos publicados de pico de 38,9-40,3 GiB en bf16, no entra en tarjetas de 24 GB sin cuantizacion, y el autor no documenta ninguna receta de cuantizacion.
- Opciones de despliegue: diffusers es la unica via verificada, en el commit `0121a91f9d419ff7234c8a5923f82c244e6f1914`, con `transformers 5.18.0` y torch 2.14.1. Debe cargarse el fichero `imtrans_full_2000_gate_up_split.safetensors`; el checkpoint original con claves de ai-toolkit/ComfyUI se carga pero diffusers descarta silenciosamente las 64 claves fusionadas `img_mlp.gate_up` (320 de 384 claves mapeadas), mientras que el fichero dividido mapea sin claves perdidas.
- Latencia y throughput: 19,9 s por edicion con el LoRA a 40 pasos, y 3,9 s o 5,3 s por edicion al apilar el LoRA turbo a 6 o 9 pasos respectivamente. El entrenamiento consume 3,25 s por paso en una A100 80 GB.
- Advertencia de API: en el commit de diffusers indicado, `pipe.set_adapters([], adapter_weights=[])` lanza `KeyError('transformer')`; para ejecutar el modelo base sin adaptadores hay que no cargar ninguno en lugar de llamar a `set_adapters` con listas vacias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros que permitan una comparativa con alternativas de la misma categoria; la model card solo publica comparaciones internas contra su propio modelo base y contra el LoRA turbo. La siguiente tabla recoge unicamente diferencias verificadas dentro de ese ecosistema.

| Modelo | Tipo | Funcion | Pasos | Tiempo por edicion (A100 80 GB) | Licencia |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (base) | Transformer de difusion | Generacion y edicion de imagen guiada por texto | 40 | 19,2 s | qwen-research-license |
| Este LoRA (translator) | Adaptador LoRA r32/alpha 32 | Traduccion de texto dentro de la imagen | 40 | 19,9 s | qwen-research-license |
| Este LoRA + Viggle turbo | LoRA apilado | Traduccion con inferencia acelerada | 6 o 9 | 3,9 s / 5,3 s | qwen-research-license |

Comparativas con otros sistemas de traduccion de texto en imagen (por ejemplo, pipelines basados en inpainting mas OCR mas re-tipografiado) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sin soporte de escrituras de derecha a izquierda: arabe y hebreo no estan contemplados, y el autor justifica la exclusion por ser el caso con peor degradacion documentada en la literatura.
- El hindi esta implementado en el generador del dataset pero no fue entrenado ni evaluado, por lo que su uso no esta respaldado.
- El japones obtiene la peor puntuacion de la evaluacion (0,881 de precision de caracteres) y el autor atribuye parte del problema al propio lector OCR, no solo al modelo; los espacios entre caracteres CJK se normalizan antes de comparar.
- Riesgo de alucinacion tipografica: al ser un modelo generativo puede alterar pixeles no textuales o introducir artefactos, aunque el objetivo declarado del entrenamiento es preservarlos.
- La gramatica de instruccion es fija y debe reproducirse exactamente; no se documenta robustez frente a instrucciones parafraseadas.
- Limite funcional del modo B: como maximo 8 pares por edicion; el resto de elementos quedan sin modificar.
- Licencia `qwen-research-license`: es una licencia de investigacion, no una licencia permisiva, por lo que el uso comercial requiere revisar los terminos del modelo base Qwen/Qwen-Image-2.1 antes de desplegarlo en produccion.
- Requisitos de memoria elevados: 38,9-40,3 GiB de VRAM pico en bf16, sin recetas de cuantizacion publicadas, lo que excluye su ejecucion en GPUs de consumo sin trabajo adicional de optimizacion.
- Riesgo de incompatibilidad de pesos: cargar el checkpoint crudo en lugar del fichero `gate_up_split` provoca la perdida silenciosa de 64 claves del adaptador, degradando el resultado sin aviso.
- El repositorio no tiene descargas ni likes y el modelo se publico el 2026-10-06, por lo que no existe validacion independiente de la comunidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o de representacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ysharma/Qwen-Image-2.1-image-translator-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de pares de traduccion: https://huggingface.co/datasets/ysharma/image-translator-pairs
- Constructor de instrucciones: https://huggingface.co/datasets/ysharma/image-translator-pairs/blob/main/instructions.py
- Registro de loss (trackio): https://huggingface.co/spaces/ysharma/qwen-image-translator-lora-trackio
- LoRA turbo compatible: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Paper de referencia: arXiv:2603.11593 (citado en las etiquetas del repositorio; no se ha encontrado enlace directo en la busqueda web)
- No se han encontrado enlaces adicionales relevantes en la busqueda web.
