# wuhisbajsi/csig-track1-fromild-s600

## Resumen

`csig-track1-fromild-s600` es un modelo de restauracion y super-resolucion de imagenes desarrollado por el usuario `wuhisbajsi` para sus envios a la pista 1 (Track-1) de la competicion CSIG, en las entregas W12–W15. Se trata de un modelo de difusion de un solo paso (one-step diffusion) construido sobre la variante VOSR-0.5B, con aproximadamente 0,49 mil millones de parametros si se deriva del tamano del fichero de pesos en fp32 (1.948.337.520 bytes). Su funcion es reconstruir imagenes de alta calidad a partir de entradas degradadas (baja resolucion y compresion), en una unica evaluacion de la red en lugar de las decenas de pasos tipicas de los modelos de difusion clasicos.

El modelo no se entrena desde cero: parte del checkpoint `wuhisbajsi/csig-track1-vosr05b-ckpt4000` del mismo autor y aplica un ajuste fino con LoRA de rango 4 durante solo 600 pasos. Ese ajuste introduce dos cambios concretos en la receta: la funcion de perdida de fidelidad se aplica sobre la salida de inferencia de un paso (`fr_on_infer: true`) en lugar de sobre la prediccion x̂₀ en un t aleatorio, y la intensidad de degradacion del preset `params_aigc_mild.yml` se recalibra a la severidad real del conjunto de test (LPIPS entre entrada y referencia ≈ 0,33, frente a una receta previa 2,3 veces mas agresiva).

Es relevante ahora porque documenta un patron habitual en la investigacion aplicada de restauracion: modelos pequenos de difusion de un solo paso, con LoRA ligeras y ajuste de la distribucion de degradacion, que compiten en la misma liga que modelos mucho mayores. Su publicacion incluye pesos ya fusionados con la LoRA, configuracion de entrenamiento y el codigo de inferencia, aunque tambien advierte de que la cadena de entrega W15 incorpora un paso de optimizacion directa sobre las metricas de evaluacion (TTO), una practica metodologicamente discutible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de un solo paso para super-resolucion/restauracion (familia VOSR-0.5B); utiliza el VAE de `stable-diffusion-2-1-base`, el decodificador ligero `sd21_lwdecoder.pth` y el codificador DINOv2 ViT-B/14 como presets auxiliares |
| Parametros totales | Aproximadamente 0,49 mil millones (487.084.380), derivado de 1.948.337.520 bytes en fp32; el autor nombra la familia como "0.5B" |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; la inferencia se realiza por tiles de 512 px con solape de 64 px) |
| Tipos de cuantizacion | no disponible (el unico fichero publicado es `clean_weights/model.safetensors` en fp32) |
| Idiomas soportados | no disponible (no aplica; modelo de restauracion de imagen, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`clean_weights/model.safetensors`, 1.948.337.520 bytes, md5 `0371a50f0f51f6ebccc5974586689921`), con la LoRA ya fusionada |
| Modelo base | `wuhisbajsi/csig-track1-vosr05b-ckpt4000` |
| Tarea | Restauracion de imagen y super-resolucion (image-restoration, super-resolution, one-step-diffusion) |
| Configuracion de entrenamiento | Incluida en `args.json` (config del run leida por el script de inferencia) y en `train_config.yml` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusion de un solo paso orientado a restauracion (VOSR-0.5B). La inferencia se ejecuta con `infer_steps 1`, es decir, una unica pasada de red en lugar de un bucle de muestreo iterativo. El pipeline se apoya en componentes externos del ecosistema Stable Diffusion: el VAE de `stable-diffusion-2-1-base`, el decodificador ligero `sd21_lwdecoder.pth` y el codificador DINOv2 ViT-B/14, que el modelo card identifica como "presets VOSR" obligatorios. El alineamiento entre entrada y salida se realiza con el metodo wavelet (`--align_method wavelet`), y las imagenes grandes se procesan por mosaicos de 512 px con 64 px de solape.

El entrenamiento no parte de cero. Sobre el checkpoint base `csig-track1-vosr05b-ckpt4000` se aplican 600 pasos de LoRA con rango 4. Las dos modificaciones respecto a la receta anterior son: (1) `fr_on_infer: true`, que mueve la perdida de fidelidad desde x̂₀ en un t aleatorio (cuyo optimo es una prediccion media y por tanto produce desenfoque) hasta la salida de inferencia de un solo paso; y (2) el preset `params_aigc_mild.yml`, que recalibra la fuerza de degradacion sintetica para aproximarla a la severidad real del conjunto de test (LPIPS ≈ 0,33 entre baja y alta calidad), frente a una receta previa 2,3 veces mas severa. No se documentan en la informacion disponible el numero total de tokens o imagenes de entrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo de imagen).

## Capacidades

- Restauracion de imagenes degradadas y super-resolucion en un unico paso de difusion (`infer_steps 1`), sin bucle iterativo de muestreo.
- Reconstruccion robusta frente a compresion JPEG agresiva: la entrega W15 envia los mismos pixeles que W14 con JPEG de calidad 100.
- Procesamiento de imagenes de alta resolucion mediante inferencia por tiles (`--tile_size 512`, `--tile_overlap 64`), con alineamiento wavelet para evitar costuras.
- Control del grado de condicionamiento de la entrada mediante `--cond_strength` (valor usado en la receta: 0,90), lo que permite regular cuanto se aparta la salida de la observacion de baja calidad.
- Reproducibilidad determinista mediante semilla fija (`--seed 42`).
- Integracion en una cadena de entrega completa: el repositorio de codigo incluye `run/pipeline.sh` (por defecto, W15) y `track1/pipeline/op_tto_joint.py` (50 pasos de optimizacion test-time con JPEG q100).
- No dispone de capacidades de texto, dialogo, tool calling ni agentes: es un modelo puramente de imagen y no soporta idiomas ni generacion de lenguaje.

## Casos de uso

- Restauracion de imagenes comprimidas con JPEG: dado que la entrega W15 reutiliza los mismos pixeles codificados a calidad 100, el modelo esta calibrado para reconstruir a partir de artefactos de compresion reales, no solo de degradaciones sinteticas.
- Super-resolucion de fotografias de gran tamano en produccion: la inferencia por tiles de 512 px con 64 px de solape permite procesar imagenes que no caben en memoria de una sola pasada, a costa de un mayor tiempo de computo proporcional al numero de mosaicos.
- Preprocesado para pipelines de vision por computador: al apoyarse en DINOv2 ViT-B/14 como preset, la salida restaurada es coherente con las representaciones de ese codificador, lo que resulta util antes de tareas de deteccion, segmentacion o recuperacion por embeddings.
- Digitalizacion y recuperacion de archivos fotograficos historicos: el ajuste de la fuerza de degradacion a LPIPS ≈ 0,33 (severidad real del conjunto de test) hace que el modelo sea adecuado para entradas moderadamente degradadas, el caso tipico de escaneos antiguos.
- Compresion eficiente en el borde y restauracion en servidor: se puede transmitir una imagen en JPEG de baja calidad y restaurarla en el backend con una sola pasada de red, reduciendo ancho de banda frente a enviar la imagen original.
- Mejora de miniaturas e imagenes de catalogo en comercio electronico: lotes de imagenes pequenas y comprimidas se pueden restaurar por tiles con la misma configuracion documentada (`--align_method wavelet`, `--seed 42`), obteniendo resultados reproducibles entre ejecuciones.
- Evaluacion y comparacion de metodos de restauracion: el modelo sirve como referencia de la familia de difusion de un paso en competiciones tipo CSIG Track-1, aunque el paso TTO de la cadena W15 debe tratarse con cautela porque optimiza directamente la metrica de evaluacion.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las puntuaciones de la competicion CSIG Track-1. No se han publicado resultados en benchmarks estandar de vision (PSNR, SSIM, LPIPS sobre conjuntos publicos) ni en benchmarks de lenguaje como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

| Evaluacion | Resultado |
|---|---|
| CSIG Track-1, entrega W14 (puntuacion oficial) | 4,2512 |
| CSIG Track-1, entrega W15 | mismos pixeles que W14, con codificacion JPEG de calidad 100 |
| LPIPS(LQ, HQ) del conjunto de test | aproximadamente 0,33 |
| PSNR | no disponible |
| SSIM | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como estimacion derivada del tamano de los ficheros, los pesos en fp32 ocupan 1,95 GB y hay que sumar el VAE de `stable-diffusion-2-1-base` (unos 0,3 GB en fp32), el decodificador `sd21_lwdecoder.pth` y DINOv2 ViT-B/14 (unos 0,35 GB en fp32), mas las activaciones de los tiles de 512 px. El total razonable se situa por debajo de 6-8 GB, aunque esta cifra no esta verificada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, el modelo esta dentro del rango de GPU de consumo; las GPU de datacenter (A100, H100) solo aportarian ventaja en throughput por lotes.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM dadas las estimaciones anteriores, siempre que se gestione el procesamiento por tiles para las activaciones. No confirmado por el autor.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (son herramientas orientadas a modelos de lenguaje). El despliegue previsto es el script Python del repositorio `github.com/woodlingbombardier-dev/csig`, invocando `inference_vosr_onestep.py` y, opcionalmente, el pipeline completo `run/pipeline.sh`.
- Dependencias obligatorias del entorno de ejecucion: el VAE de `stable-diffusion-2-1-base`, `sd21_lwdecoder.pth` y DINOv2 ViT-B/14.
- Latencia y throughput: no disponibles. El coste escala con el numero de tiles generados por imagen, dado que la inferencia es de un solo paso (`infer_steps 1`).

## Comparativa con modelos similares

No se ha proporcionado informacion de modelos comparables con datos verificables de parametros, contexto, rendimiento o licencia, por lo que la comparacion se marca como no disponible. A modo de contexto de categoria, en el dominio de la restauracion y super-resolucion de imagen existen familias alternativas basadas en GAN, en difusion iterativa y en difusion de un solo paso, pero no se dispone de cifras de ninguna de ellas en la informacion facilitada.

| Modelo | Parametros | Contexto/resolucion | Licencia | Rendimiento disponible |
|---|---|---|---|---|
| csig-track1-fromild-s600 | Aproximadamente 0,49 mil millones (derivado del fichero de pesos) | Inferencia por tiles de 512 px con solape de 64 px | apache-2.0 | CSIG Track-1 W14: 4,2512 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cadena de entrega W15 aplica `track1/pipeline/op_tto_joint.py` (50 pasos, JPEG q100), que el propio autor describe como ascenso de gradiente directo sobre las metricas de evaluacion. Esto implica sobreajuste a la metrica y hace que las puntuaciones obtenidas con ese paso no sean directamente comparables con las de un modelo sin TTO.
- El ajuste fino es muy corto (600 pasos de LoRA con rango 4) y esta calibrado especificamente para la severidad del conjunto de test (LPIPS(LQ, HQ) ≈ 0,33). Con degradaciones mucho mas leves o mucho mas severas, el comportamiento puede degradarse respecto al checkpoint base.
- El modelo no es autonomo: requiere presets externos (VAE de `stable-diffusion-2-1-base`, `sd21_lwdecoder.pth`, DINOv2 ViT-B/14) y el codigo del repositorio. Esto complica la reproducibilidad y anade dependencias con licencias propias.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, no tiene pipeline declarado y no ha pasado una validacion independiente de la comunidad.
- No se documentan sesgos conocidos del modelo, pero si hereda los del checkpoint base `csig-track1-vosr05b-ckpt4000` y los de los datos de entrenamiento de este, que no se detallan.
- Riesgo de alucinacion visual: como todo modelo generativo de restauracion, puede inventar texturas o detalles plausibles que no existian en la imagen original, especialmente en zonas muy degradadas o con oclusiones.
- No se han publicado datos de idiomas ni de contenido textual, y no aplica soporte multilingue.
- La licencia es apache-2.0, que permite uso comercial, pero esa licencia cubre unicamente este repositorio; los componentes auxiliares (VAE de SD 2.1, DINOv2, decodificador) tienen sus propias condiciones que deben revisarse por separado.
- El nombre del fichero de pesos en el repositorio (`model.safetensors`) no coincide con la ruta indicada en la model card (`clean_weights/model.safetensors`); conviene verificar la ruta real antes de automatizar la descarga.
- No se dispone de informacion sobre cuantizaciones, por lo que el despliegue en entornos con VRAM limitada exigiria convertir los pesos a fp16 u otra precision por cuenta del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wuhisbajsi/csig-track1-fromild-s600
- Modelo base: https://huggingface.co/wuhisbajsi/csig-track1-vosr05b-ckpt4000
- Repositorio de codigo: https://github.com/woodlingbombardier-dev/csig
- Script de inferencia: `vosr/inference_vosr_onestep.py` dentro del repositorio de codigo
- Pipeline de entrega W15: `run/pipeline.sh` dentro del repositorio de codigo
- Paso de optimizacion test-time: `track1/pipeline/op_tto_joint.py` dentro del repositorio de codigo
- Documentacion de hallazgos: `docs/FINDINGS.md`, secciones 7 y 10, dentro del repositorio de codigo
- La busqueda web realizada no devolvio resultados relevantes para este modelo (los enlaces obtenidos corresponden a la liga alemana de hockey sobre hielo DEL2 y no guardan relacion con el modelo).
