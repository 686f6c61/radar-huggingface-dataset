# Woovee/MiniMax-H3-Image-LowVRAM

## Resumen

MiniMax-H3-Image-LowVRAM es un repositorio de pesos cuantizados del modelo oficial MiniMax-H3-Image, publicado por el usuario Woovee el 10 de noviembre de 2026. No se trata de un modelo nuevo ni de un fine-tune: son los pesos originales empaquetados por Comfy-Org, copiados sin modificaciones y seleccionados para reducir los requisitos de memoria en despliegues locales. El modelo base es un generador de imágenes texto-a-imagen (y edición imagen-a-imagen) de MiniMax, con un transformer de difusión y un codificador de texto Qwen3-VL de 32B.

La relevancia de este repositorio es práctica: el modelo original completo requiere una huella de memoria elevada, y esta selección aplica cuantización W4A8 al transformer de difusión y NVFP4 AWQ al codificador de texto, dejando el total de descarga en aproximadamente 29,41 GB. El objetivo declarado es poder ejecutarlo en una GPU NVIDIA de 24 GB con offloading dinámico, aunque el propio autor advierte que es un objetivo de despliegue y no una medición verificada de memoria o velocidad.

El modelo funciona con 6 pasos de muestreo, CFG 1 y sampler euler simple, y está pensado para su uso dentro de ComfyUI. La licencia es la MiniMax-H3-Image Community License Agreement, con restricciones territoriales y comerciales importantes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para imagenes (modelo base MiniMax-H3-Image) con codificador de texto Qwen3-VL de 32B y VAE de imagen |
| Parametros totales | No disponible (el repositorio distribuye pesos cuantizados, no se indica el recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Transformer de difusion W4A8 (podado); codificador de texto NVFP4 AWQ; VAE en FP16 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (license: other) |
| Formato de pesos | safetensors |
| Tamano del repo | 29,4 GB |
| Pasos de muestreo | 6 pasos, CFG 1, sampler euler, scheduler simple |
| Resolucion recomendada | 2048 x 2048 (4 MP) para velocidad; ~16 MP para maximo detalle segun el modelo original |
| Compatibilidad | ComfyUI commit 989d93d0d968e704c589ce0146bb18c77f6b50cc o posterior |

Desglose de ficheros:

| Fichero | Tamano | Funcion |
|---|---:|---|
| `diffusion_models/minimax_h3_image_pruned_w4a8.safetensors` | 12,55 GB | Transformer de imagen podado, W4A8 |
| `text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | 15,69 GB | Codificador de texto original de 32B, NVFP4 AWQ |
| `vae/minimax_h3_image_vae_fp16.safetensors` | 1,17 GB | VAE de imagen |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre el entrenamiento del modelo base. Lo que se deduce de los ficheros es una arquitectura de difusion compuesta por tres piezas: un transformer de difusion de imagen (podado y cuantizado a W4A8), un codificador de texto Qwen3-VL de 32B (cuantizado a NVFP4 AWQ) y un VAE de imagen en FP16. El codificador Qwen3-VL sugiere que el modelo acepta condicionamiento de texto y posiblemente referencias visuales, coherente con las capacidades de edicion imagen-a-imagen declaradas en las etiquetas.

El muestreo esta disenado para ser muy eficiente en numero de pasos: 6 pasos con CFG 1, sampler euler y scheduler simple. Esto indica un modelo destilado o entrenado especificamente para pocos pasos, lo que reduce el coste computacional por imagen frente a modelos de difusion clasicos de 20-50 pasos. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

Es importante subrayar que estos pesos son una copia sin modificaciones de los ficheros empaquetados por Comfy-Org a partir del modelo oficial de MiniMax; el trabajo de Woovee consiste en la seleccion de ficheros y la documentacion del despliegue, no en el entrenamiento ni en la cuantizacion.

## Capacidades

- Generacion de imagenes texto-a-imagen con descripcion detallada en ingles.
- Edicion de imagenes imagen-a-imagen: el modelo permite referenciar imagenes de entrada como `<Picture 1>`, `<Picture 2>`, etc., y especificar tanto el cambio deseado como lo que debe permanecer intacto.
- Generacion de alta resolucion: arranque recomendado a 2048 x 2048 (4 MP) y hasta aproximadamente 16 MP para maximo detalle segun las recomendaciones del modelo original.
- Inferencia en pocos pasos: 6 pasos de muestreo con CFG 1.
- Integracion en ComfyUI mediante los nodos `MiniMaxH3ImageConditioning` y `KSampler`.
- Condicionamiento de texto mediante un codificador Qwen3-VL de 32B, lo que sugiere comprension de prompts largos y detallados (no confirmado explicitamente en la informacion disponible).
- No se documentan capacidades de tool calling, agentes, audio, thinking mode ni otras modalidades mas alla de imagen.

## Casos de uso

- Generacion de ilustraciones conceptuales para preproduccion: el modelo produce imagenes a 4 MP en 6 pasos, adecuado para iterar rapidamente sobre bocetos visuales antes de pasar a render final de mayor resolucion.
- Edicion localizada de imagenes en flujo ComfyUI: usando referencias `<Picture N>`, se puede pedir cambiar un objeto o estilo manteniendo el resto de la composicion, util para retoque de material grafico existente.
- Creacion de assets para videojuegos o entornos 3D: la resolucion de hasta 16 MP permite generar texturas o conceptos con detalle suficiente para referencia de modelado.
- Prototipado de campanas de marketing: generacion de variantes visuales de un mismo concepto a partir de prompts detallados en ingles, con coste de inferencia reducido gracias a los 6 pasos.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: el objetivo declarado del repositorio es ejecutar el modelo con offloading dinamico en una RTX 4090 o similar, sin depender de servicios en la nube.
- Investigacion sobre cuantizacion en modelos de difusion: comparar salidas W4A8/NVFP4 frente a los pesos completos para evaluar la perdida de calidad en tareas de generacion y edicion.
- Generacion de material visual para documentacion tecnica o presentaciones internas, siempre que el uso quede dentro de los territorios y condiciones permitidos por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las mediciones de despliegue (memoria y velocidad) se documentaran tras la validacion, y que el objetivo de 24 GB de VRAM es una meta de diseno, no una cifra verificada.

## Requisitos de hardware

- VRAM estimada: el objetivo declarado es una GPU NVIDIA de 24 GB con offloading dinamico, cargando el codificador de texto y el transformer de difusion por etapas. No es una cifra verificada.
- Desglose de memoria de pesos: 12,55 GB (transformer W4A8) + 15,69 GB (codificador de texto NVFP4 AWQ) + 1,17 GB (VAE FP16) = 29,41 GB de descarga total. Al no caber simultaneamente en 24 GB, el offloading por etapas es imprescindible.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) como objetivo minimo declarado; GPUs con mas VRAM (A100 40/80 GB, H100) permitirian cargar mas componentes sin offloading.
- Cabe en GPU consumer: si, en teoria, en RTX 4090 de 24 GB con offloading; no verificado. En GPUs de 16 GB o menos no hay garantia y probablemente requiera offloading a RAM del sistema.
- RAM del sistema: relevante, ya que el offloading dinamico mueve pesos entre VRAM y RAM; se recomienda un minimo de 64 GB, aunque no se especifica en la documentacion.
- Opciones de despliegue: ComfyUI (commit 989d93d0d968e704c589ce0146bb18c77f6b50cc o posterior) con los nodos `MiniMaxH3ImageConditioning` y `KSampler`; plantillas oficiales en el repositorio de workflow_templates de Comfy-Org.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se comparan unicamente aspectos estructurales conocidos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-LowVRAM (este repo) | Difusion texto-a-imagen cuantizada | No disponible | No disponible | MiniMax-H3-Image Community License (restrictiva) | Hugging Face, 29,4 GB |
| MiniMax-H3-Image (original) | Difusion texto-a-imagen | No disponible | No disponible | MiniMax-H3-Image Community License | Hugging Face |
| Pruna P-H3-Image | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos H3 de video | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona explicitamente que este modelo es distinto de Pruna P-H3-Image y de los modelos H3 de video, pero no aporta datos comparativos de rendimiento ni de arquitectura entre ellos.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement excluye de su concesion estandar la Union Europea, el Reino Unido, la Republica de Corea y Estados Unidos. El uso en esos territorios requiere autorizacion previa por escrito de MiniMax.
- Servicios alojados de terceros: requieren autorizacion previa por escrito de MiniMax. Este repositorio distribuye pesos y no concede licencia para servicios alojados ni modifica los terminos originales.
- Umbral de ingresos: se exige autorizacion separada si los ingresos anualizados superan 1 millon de USD.
- Calidad de cuantizacion: las salidas W4A8 y NVFP4 pueden diferir de las de precision completa; no se han publicado evaluaciones de la magnitud de esa diferencia.
- Requisitos de memoria no verificados: el objetivo de 24 GB con offloading es una meta de diseno, no una medicion; el rendimiento real dependera de la resolucion, el numero de referencias, los kernels de GPU y la RAM del sistema.
- Idioma: la model card recomienda describir la imagen en ingles detallado; no se documenta soporte multilingue.
- Alucinacion y sesgos: no hay informacion especifica sobre sesgos del modelo base ni sobre tasas de error en la generacion; se aplican los riesgos habituales de los modelos de difusion (artefactos, texto mal renderizado, sesgos del dataset de entrenamiento).
- Resolucion: trabajar a 16 MP incrementa notablemente el coste de memoria y computo; 4 MP es el punto de partida recomendado para velocidad.
- Mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y esta mantenido por un usuario individual; no es un canal oficial de MiniMax ni de Comfy-Org.
- Sin ampliador de prompt incluido: el conjunto de pesos no incluye el expansor de prompts grande del Studio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Woovee/MiniMax-H3-Image-LowVRAM
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Pesos reempaquetados por Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Plantilla oficial de ComfyUI para texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json
- Ficheros de licencia y aviso incluidos en el repositorio: `LICENSE` y `NOTICE`
- Manifiesto de origen con revisiones y SHA256: `source-manifest.json`
