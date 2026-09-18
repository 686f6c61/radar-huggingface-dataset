# ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-SDXL-ConvRot-INT8

## Resumen

HSWQ SDXL ConvRot INT8 es una coleccion de 16 checkpoints de difusion texto-a-imagen derivados de SDXL, cuantizados a INT8 mediante el metodo Hybrid-Sensitivity-Weighted Quantization (HSWQ) desarrollado por el usuario ussoewwin. No se trata de un modelo entrenado desde cero, sino de un pack de pesos cuantizados que parte de modelos comunitarios muy conocidos (RealVisXL V3.0/V5.0, Illustrious-XL, WAI-illustrious-SDXL, blue_pencil-XL, epiCRealism XL, entre otros) y aplica una cuantizacion selectiva por capas en lugar de un cast uniforme a 8 bits.

El problema que resuelve es el consumo de VRAM en inferencia de difusion: un checkpoint SDXL en FP16 ocupa en torno al 100 % de su tamano original, mientras que este pack se queda en un 68 % (mezcla FP16 + INT8) manteniendo un SSIM de 0,94-0,98 frente al modelo original. La innovacion esta en que las capas criticas permanecen en FP16 gracias a un analisis automatico de sensibilidad e importancia (DualMonitor + proteccion FP16 con histograma ponderado V4) bajo un presupuesto fijo de 300 MiB, en lugar de usar un porcentaje de retencion fijo (keep ratio = 0).

Es relevante ahora porque la libreria nunchaku y el ecosistema ComfyUI estan empujando la cuantizacion de modelos de difusion como via para ejecutar SDXL y sus derivados en GPUs de gama media, y este pack ofrece una alternativa INT8 compatible con nodos de carga especificos. El repositorio pesa 137,8 GB e incluye variantes tanto fotorrealistas como de anime/Illustrious. Registra 2 likes y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente basada en U-Net (arquitectura SDXL) con doble text encoder CLIP; no es un transformer autoregresivo |
| Parametros totales | No disponible en la informacion proporcionada (heredados del SDXL base de cada checkpoint; el U-Net de SDXL ronda los 2,6 mil millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como tal; al ser un modelo de difusion el limite practico lo impone el text encoder CLIP de SDXL (77 tokens por fragmento) |
| Tipos de cuantizacion | INT8 tensorwise (`int8_tensorwise`) con ConvRot completo en las capas Linear/Conv2d restantes y proteccion FP16 de capas criticas; presupuesto FP16 fijo de 300 MiB (keep ratio 0) |
| Idiomas soportados | No disponible (sin declaracion explicita; los prompts de SDXL/Illustrious funcionan habitualmente en ingles) |
| Licencia | `other`; cada checkpoint hereda la licencia de su modelo base: Fair AI Public License 1.0-SD o CreativeML Open RAIL++-M |
| Formato de pesos | safetensors (un archivo por modelo), compatibles con la libreria nunchaku |
| Tamano del repositorio | 137,8 GB (16 checkpoints) |
| Libreria | nunchaku |
| Pipeline | text-to-image |
| Fecha de creacion | 2026-07-21 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

El pack no entrena ningun modelo nuevo: parte de checkpoints SDXL ya entrenados por terceros y les aplica un pipeline de cuantizacion post-entrenamiento. La arquitectura subyacente es la de SDXL (U-Net de difusion latente con atencion cruzada, dos text encoders CLIP y un VAE), y los modelos base abarcan tanto la rama fotorrealista (RealVisXL V3.0 Turbo, RealVisXL V5.0 Lightning, epiCRealism XL pureFix) como la rama anime/Ilustracion (Illustrious-XL v1.7, WAI-illustrious-SDXL, blue_pencil-XL, Nova Anime XL, JANKU Noobai-Rouwei, koronemix, UwazumiMix, OneObsession, Prefect Illustrious XL, WAI-REAL_CN, WAI-REALISM).

La innovacion tecnica es el metodo HSWQ: en lugar de convertir todos los pesos a INT8 de forma uniforme (lo que degrada la calidad), se aplica un analisis de sensibilidad e importancia por capa. El proceso combina DualMonitor y una proteccion FP16 basada en histograma ponderado (V4) para decidir que capas permanecen en precision completa, con un presupuesto duro de 300 MiB para esas capas. Sobre las capas Linear/Conv2d restantes se aplica ConvRot completo (rotacion de canales previa a la cuantizacion) para reducir el error de redondeo. El parametro keep ratio se fija a 0, lo que significa que la seleccion de capas criticas no depende de un porcentaje manual sino del analisis automatico. El autor publica dos scripts de referencia: `quantize_sdxl_hswq_v3.1.py` (HSWQ) y `native_convert_int8_sdxl.py` (conversion nativa). No se detalla en la informacion disponible el conjunto de datos de calibracion utilizado ni el numero de imagenes empleadas en el analisis.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts, con dos grandes perfiles esteticos: fotorrealismo (RealVisXL, epiCRealism, WAI-REALISM) y anime/ilustracion (Illustrious-XL, WAI-illustrious, blue_pencil-XL, Nova Anime XL).
- Compatibilidad con ComfyUI mediante nodos de carga especificos para INT8 y ConvRot INT8.
- Compatibilidad declarada con ControlNet (aparece como tag del repositorio), lo que permite condicionamiento estructural adicional.
- Soporte de los formatos ConvRot INT8 e INT8 nativo dentro del mismo pack.
- Integracion con el ecosistema nunchaku/SVDQ, del que hereda la infraestructura de ejecucion.
- No dispone de tool calling, function calling, modo de razonamiento ni capacidades de agente: es un modelo de generacion de imagen, no un modelo de lenguaje.
- No hay soporte declarado de audio, video ni vision de entrada (salvo el condicionamiento propio de ControlNet en el flujo de difusion).
- No hay informacion publicada sobre capacidades multilingues del text encoder ni sobre la calidad de seguimiento de prompts en idiomas distintos del ingles.

## Casos de uso

- Generacion fotorrealista en equipos con VRAM limitada: usar `realvisxlV50_v50Bakedvae_hswq_r32_1on_covrot_int8.safetensors` para retratos y producto con un consumo de pesos un 32 % inferior al FP16, manteniendo un SSIM de 0,94-0,98.
- Ilustracion anime en produccion: los checkpoints derivados de Illustrious-XL (WAI-illustrious-SDXL v1.7, Prefect Illustrious XL v8, Nova Anime XL) cubren estilos anime consistentes, utiles para ilustracion editorial o assets de videojuego.
- Pipelines de ControlNet en ComfyUI: al declarar compatibilidad con ControlNet, se pueden usar estos checkpoints cuantizados como base para generacion condicionada por pose, profundidad o bordes en flujos de trabajo de ComfyUI.
- Prototipado rapido en portatiles con GPU consumer: los checkpoints Turbo/Lightning (RealVisXL V3.0 Turbo, RealVisXL V5.0 Lightning) permiten iterar con menos pasos de muestreo, adecuados para bocetado visual en maquina local.
- Despliegue de servicios de generacion de imagen con coste contenido: al reducir el tamano de pesos al 68 %, se puede servir mas concurrencia por GPU en plataformas tipo ComfyUI headless o APIs internas.
- Ahorro de almacenamiento en granjas de modelos: el repositorio agrupa 16 variantes en 137,8 GB; cada archivo cuantizado ocupa aproximadamente dos tercios de su equivalente FP16, lo que reduce el coste de disco y de transferencia en cache de modelos.
- Evaluacion comparativa de tecnicas de cuantizacion: el pack sirve como referencia practica para medir la perdida de fidelidad (SSIM) frente a INT8 ingenuo y FP16 original en tareas de generacion real.
- Flujos de trabajo con VAE horneado (BakedVAE): los checkpoints de RealVisXL V4.0 y V5.0 BakedVAE simplifican el pipeline al no requerir la carga separada de un VAE.

## Benchmarks y rendimiento

El autor publica una tabla de referencia con SSIM medio, tamano de archivo y compatibilidad:

| Modelo | SSIM (media) | Tamano de archivo | Compatibilidad |
|---|---|---|---|
| Original FP16 | 1,0000 | 100 % | Alta |
| Naive INT8 | 0,95-0,97 | 50 % | Alta |
| HSWQ ConvRot INT8 | 0,94-0,98 | 68 % (mezcla FP16) | Alta (ComfyUI INT8) |

No se han publicado en la informacion disponible resultados de FID, CLIP score, velocidades de inferencia (imagenes por segundo) ni comparativas cuantitativas contra la cuantizacion SVDQ de nunchaku. El unico indicador de fidelidad reportado es el SSIM.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo del 68 % de tamano de pesos respecto a FP16 que indica el autor, un checkpoint SDXL cuantizado de este pack rondaria los 4,7 GB de pesos, con picos de 6-8 GB a 1024x1024 dependiendo de la longitud del prompt y del VAE. Son estimaciones derivadas del dato del 68 %, no cifras publicadas por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090, A100 y H100. En GPUs de 8 GB el uso es viable con menor resolucion o con VAE en modo tiled.
- Cabe en GPU consumer: si, es el escenario objetivo del pack; el propio autor lo orienta a usuarios que necesitan gestionar estrictamente su VRAM manteniendo la maxima calidad de imagen.
- Opciones de despliegue: ComfyUI con el nodo no oficial `ComfyUI-HSWQ-Loader-and-Tools` para ConvRot INT8 e INT8; la libreria declarada es nunchaku. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput estimados: no disponible. El autor no publica tiempos de inferencia ni comparativas de velocidad frente a FP16, INT8 ingenuo o SVDQ.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSWQ SDXL ConvRot INT8 | SDXL base (no desglosado) | Limitado por CLIP (77 tokens por fragmento) | SSIM 0,94-0,98, 68 % de tamano | `other` (FAIPL-1.0-SD o CreativeML Open RAIL++-M segun checkpoint) | HuggingFace, 16 checkpoints, 0 descargas |
| SDXL FP16 original | SDXL base | Limitado por CLIP | SSIM 1,0000, 100 % de tamano | CreativeML Open RAIL++-M (segun modelo base) | Amplia, referencia del ecosistema |
| Quantizacion INT8 ingenua | SDXL base | Limitado por CLIP | SSIM 0,95-0,97, 50 % de tamano | Depende del modelo base | Metodo generico, sin pack publicado comparable |
| nunchaku-tech/nunchaku-sdxl (SVDQ) | SDXL base | Limitado por CLIP | No disponible en la informacion proporcionada | No disponible | HuggingFace, repositorio de referencia del equipo nunchaku |

La comparativa directa con la cuantizacion SVDQ de 4 bits de nunchaku no puede cerrarse numericamente porque el autor no publica SSIM ni velocidades de ese metodo en la informacion disponible.

## Limitaciones y advertencias

- No son modelos originales: todos los checkpoints son derivados cuantizados de modelos de terceros, y la calidad estetica final depende del modelo base, no del trabajo de cuantizacion.
- La licencia `other` obliga a revisar caso por caso: los checkpoints con Fair AI Public License 1.0-SD y CreativeML Open RAIL++-M imponen restricciones de uso (incluidas clausulas de uso aceptable y, en el caso de FAIPL-1.0-SD, condiciones especificas del autor original). No se debe asumir uso comercial libre sin verificar cada licencia.
- La cuantizacion INT8 introduce perdida de fidelidad medible: el SSIM baja hasta 0,94 en el peor caso de la tabla publicada, lo que puede traducirse en degradacion de texturas finas, detalle facial o tipografia en imagenes generadas.
- No existe un nodo oficial de ComfyUI para cargar estos pesos: se depende del nodo no oficial `ComfyUI-HSWQ-Loader-and-Tools`, lo que anade riesgo de mantenimiento y de compatibilidad con futuras versiones de ComfyUI.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible o artefactos, especialmente con prompts ambiguos o en modelos anime con vocabulario poco representado.
- No hay informacion publicada sobre sesgos demograficos, de estilo o culturales de los modelos base, ni sobre su comportamiento con prompts en idiomas distintos del ingles.
- El limite de 77 tokens por fragmento del text encoder CLIP de SDXL restringe los prompts largos y detallados, algo inherente a la arquitectura y no una limitacion del proceso de cuantizacion.
- Cero descargas registradas y solo 2 likes en el momento de la consulta: el pack no tiene aun validacion independiente de la comunidad, por lo que las cifras de SSIM proceden unicamente del autor.
- El presupuesto fijo de 300 MiB en FP16 y el keep ratio 0 implican que la seleccion de capas protegidas la decide el analisis automatico del autor; no hay interfaz publicada para reajustar esa asignacion por caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-SDXL-ConvRot-INT8
- Repositorio GitHub del metodo HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Guia de cuantizacion SDXL ConvRot INT8: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/How%20to%20quantize%20SDXL.md
- Resultados de benchmark publicados: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/benchmark%20result/benchmark_sdxl_int8.md
- Nodo de carga para ComfyUI: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Repositorio de referencia del equipo nunchaku: https://huggingface.co/nunchaku-tech/nunchaku-sdxl
