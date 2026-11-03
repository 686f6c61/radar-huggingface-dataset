# TaoLiveAIGC/TaoMate-FVSR

## Resumen

TaoMate-FVSR es un modelo de restauración de vídeo facial condicionado por audio, desarrollado por TaoLiveAIGC. A diferencia de los modelos de restauración de imagen fija, este sistema procesa secuencias de vídeo completas y utiliza la pista de audio como señal de control para sincronizar la restauración labial, lo que permite tanto restaurar un vídeo con su audio original como realizar doblaje visual sustituyendo el habla por otra pista de voz.

El modelo se distribuye únicamente como pesos en formato safetensors (10,3 GB en el repositorio) acompañados de un fichero de configuración de inferencia. No incluye código de entrenamiento ni datasets, y depende de un runtime de inferencia externo (versión 0.3.2 o superior) alojado en GitHub. La arquitectura concreta, el número de parámetros y los datos de entrenamiento no se detallan en la model card.

Su relevancia actual radica en el auge del doblaje automático de vídeo y la restauración de material audiovisual de baja calidad: el modelo combina referencias visuales dispersas, historial de fotogramas generados y guiado por audio para mantener la identidad facial a lo largo del clip, operando a 25 fps y preservando las dimensiones originales de la escena.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (tipo de red, número de capas, mecanismo de atención o componentes de difusión). Lo que sí se documenta es el pipeline de inferencia: el modelo toma un vídeo de escena completa, aplica recorte de cabeza mediante DWPose, realiza la restauración facial y posteriormente mezcla color y máscara para pegar el resultado en la escena original. El proceso incorpora un VAE de Wan2.2, un extractor de características de audio HuBERT Large y módulos auxiliares de detección y segmentación (RetinaFace, ParseNet, YOLOX-L, RTMW-X) junto con GPEN-BFR para la preparación de referencias.

El modelo está condicionado por audio y utiliza referencias visuales dispersas junto con el historial de fotogramas generados, lo que sugiere un mecanismo autorregresivo o de ventana temporal para mantener coherencia entre fotogramas. Los parámetros de muestreo por defecto (10 pasos, fuerza de ruido 0,8, shift 5,0, guiado de audio 4,0, guiado de referencia 1,7, semilla 42) apuntan a un esquema de generación iterativa tipo difusión. No se proporcionan datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Restauración de vídeo facial en escenas completas, con recorte automático de cabeza y pegado posterior sobre el fondo original.
- Restauración condicionada por audio: sincroniza la boca con la pista de voz suministrada.
- Doblaje visual: permite sustituir el habla original por otra pista de audio manteniendo coherencia facial.
- Soporte de dos resoluciones de trabajo mediante `--scale`: 512 (una pasada GPEN-BFR-512) y 1024 (pasada GPEN-BFR-1024 real, no reescalado).
- Entrada de referencias preparadas externamente (`--reference`) o referencias editadas (`--edited-reference`) con GPEN ajustado a la escala.
- Procesamiento de vídeo a 25 fps preservando dimensiones de escena y audio seleccionado.
- Modo `--cropped` para entradas faciales ya preparadas de 512×512.
- Capacidad multilingüe no documentada; el único idioma declarado es inglés.

## Casos de uso

- Doblaje automático de vídeo: el modelo permite sustituir la pista de voz de un clip por otra grabación y regenerar la región facial para que la sincronía labial coincida con el nuevo audio, manteniendo la identidad del hablante gracias a la referencia visual fija.
- Restauración de archivo audiovisual: recuperación de material antiguo o comprimido donde los rostros presentan artefactos, usando el audio original como guía para preservar la articulación.
- Postproducción de contenido multilingüe: generación de versiones dobladas de un mismo vídeo a partir de una única grabación original, con referencias de identidad por escena.
- Localización de cursos y material formativo: adaptación de vídeos de formación a otras pistas de audio sin rehacer el rodaje, manteniendo el encuadre y las dimensiones de escena.
- Restauración de retransmisiones o grabaciones de baja resolución: mejora de la región facial en vídeos de videollamada o streaming con audio disponible como condición.
- Edición de referencia facial: uso de `--edited-reference` para aplicar una referencia editada externamente y propagar esa identidad a lo largo del clip.
- Pipelines de doblaje a escala: integración en flujos automatizados que procesan escenas completas con recorte DWPose y pegado automático, adecuado para volúmenes medios dada la dependencia de múltiples modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio de pesos ocupa 10,3 GB, por lo que el checkpoint en precisión completa requiere al menos ese orden de memoria, adicionalmente a los modelos auxiliares (Wan2.2 VAE, HuBERT Large, GPEN, RetinaFace, ParseNet, DWPose).
- GPU recomendadas: no disponibles; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada; la suma de pesos del modelo principal y los componentes auxiliares hace probable que no quepa en GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: runtime oficial TaoMate-FVSR (versión 0.3.2 o superior) desde GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (el modelo no es un LLM).
- Latencia y throughput: no disponibles; únicamente se indica que la salida se genera a 25 fps, sin datos de velocidad de proceso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de restauración facial o doblaje visual.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de desplegarlo en producción.
- El repositorio solo contiene pesos y configuración: no hay código de entrenamiento, estados ni datasets, lo que impide reproducir el entrenamiento o ajustar el modelo.
- Dependencia de múltiples componentes de terceros (Wan2.2 VAE, HuBERT, GPEN, RetinaFace, ParseNet, DWPose, MMDetection, MMPose) con sus propias licencias y condiciones, que deben descargarse de sus publicadores originales.
- La referencia visual es fija y proviene del inicio del vídeo; no se regenera en cada corte de escena, lo que puede degradar la coherencia en clips con múltiples planos o cambios de identidad.
- El único idioma declarado es inglés; no hay evidencia de soporte multilingüe para el condicionamiento de audio.
- No se documentan sesgos, tasas de alucinación ni límites de contexto; al ser un modelo generativo condicionado por audio, existe riesgo de artefactos faciales o desincronización en audios ruidosos o fuera de distribución.
- El modelo no amplía el fondo de la escena: la restauración se limita a la región facial pegada sobre el fotograma original, por lo que la calidad del fondo no mejora.
- Sin datos de benchmarks ni de hardware recomendado, la planificación de producción requiere pruebas empíricas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TaoLiveAIGC/TaoMate-FVSR
- Pesos: https://huggingface.co/TaoLiveAIGC/TaoMate-FVSR/resolve/main/TaoMate-FVSR.safetensors
- Runtime de inferencia: https://github.com/TaoLiveAIGC/TaoMate-FVSR
- Wan2.2 VAE: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B/resolve/main/Wan2.2_VAE.pth
- HuBERT Large: https://huggingface.co/facebook/hubert-large-ll60k
- GPEN-BFR-512: https://public-vigen-video.oss-cn-shanghai.aliyuncs.com/robin/models/GPEN-BFR-512.pth
- GPEN-BFR-1024 (ModelScope): https://www.modelscope.cn/models/damo/cv_gpen_image-portrait-enhancement-hires/resolve/master/pytorch_model.pt
- RetinaFace-R50: https://public-vigen-video.oss-cn-shanghai.aliyuncs.com/robin/models/RetinaFace-R50.pth
- ParseNet: https://public-vigen-video.oss-cn-shanghai.aliyuncs.com/robin/models/ParseNet-latest.pth
- YOLOX-L (OpenMMLab): https://download.openmmlab.com/mmdetection/v2.0/yolox/yolox_l_8x8_300e_coco/yolox_l_8x8_300e_coco_20211126_140236-d3bd2b23.pth
- RTMW-X (OpenMMLab): https://download.openmmlab.com/mmpose/v1/projects/rtmw/rtmw-x_simcc-cocktail14_pt-ucoco_270e-384x288-f840f204_20231122.pth
