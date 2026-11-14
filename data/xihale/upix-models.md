# xihale/upix-models

## Resumen

`xihale/upix-models` no es un modelo de lenguaje ni un modelo fundacional, sino un repositorio de agregacion y espejo CDN que empaqueta una coleccion de modelos de superresolucion de imagen en formato ncnn para la herramienta multiplataforma Upix (Web, escritorio, Android y CLI). El autor, xihale, sincroniza los pesos desde el release `models` del repositorio GitHub de Upix y los redistribuye con cabeceras CORS para permitir la inferencia directamente en navegador.

El contenido son pesos de terceros: variantes de Real-ESRGAN (x2, x3, x4, general y anime), Real-CUGAN (conservative, denoise y no-denoise en x2 y x3) y packs ncnn ya publicados por sus autores originales. Cada `.zip` contiene un par de ficheros ncnn (`.param` + `.bin`) y el repositorio incluye un `manifest.json` con tamanos exactos y hashes SHA-256 que el cliente verifica tras la descarga.

Su relevancia es practica: centraliza artefactos de upscaling ligeros (desde ~1,1 MB hasta ~31 MB por modelo) listos para ejecutarse en CPU/GPU via ncnn o Vulkan, sin necesidad de PyTorch, y con licencias heterogeneas que el usuario debe revisar modelo a modelo. No aporta pesos nuevos ni entrenamiento propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de superresolucion (RRDB/ESRGAN y variantes CUGAN), empaquetadas en ncnn |
| Parametros totales | no disponible (depende del modelo; los paquetes pesan entre ~1,1 MB y ~31 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos ncnn en precision de empaquetado original) |
| Idiomas soportados | en, zh (metadatos del repositorio; no aplica al modelo de imagen) |
| Licencia | mixta por modelo (`BSD-3-Clause`, `MIT` + terminos upstream, `CC-BY-NC-SA-4.0` en algunos casos) |
| Formato de pesos | ncnn (`.param` + `.bin` dentro de `.zip`) |

## Arquitectura y entrenamiento

Los modelos incluidos son redes de superresolucion de imagen: Real-ESRGAN (basado en RRDB con entrenamiento degradado sintetico) y Real-CUGAN (desarrollado por bilibili ailab para anime/manga). No hay entrenamiento ni fine-tuning por parte de xihale: el repositorio solo agrega y convierte pesos. Los modelos que no disponian de pack ncnn oficial se convirtieron desde PyTorch mediante `pnnx`, siguiendo la guia `models/CONVERTING.md` de Upix, con verificacion de SHA-256 contra OpenModelDB o la publicacion oficial y validacion numerica contra la implementacion de referencia `spandrel`.

Cada paquete se distribuye como `.zip` con los dos ficheros ncnn y se registra en `manifest.json` con tamano exacto y SHA-256, que el cliente Upix comprueba obligatoriamente tras la descarga. Las escalas disponibles son 2x, 3x y 4x segun el modelo; hay variantes especializadas en anime y otras de proposito general, ademas de modos con y sin denoising en la familia Real-CUGAN.

## Capacidades

- Superresolucion de imagen con factores de escala 2x, 3x y 4x segun el modelo elegido.
- Upscaling de proposito general (Real-ESRGAN general, x4plus, x2plus).
- Upscaling especializado en anime/manga (Real-ESRGANv3-anime, Real-ESRGAN-x4plus-anime, Real-CUGAN).
- Control de denoising en Real-CUGAN (variantes conservative, denoise y no-denoise).
- Inferencia via ncnn, con soporte de Vulkan en los packs oficiales.
- Distribucion con cabeceras CORS para uso en navegador (Web) ademas de escritorio, Android y CLI.
- Verificacion de integridad SHA-256 integrada en el cliente Upix.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Mejora de fotos de baja resolucion en aplicaciones web: el pack ncnn con CORS permite ejecutar el upscaling directamente en el navegador sin backend, usando Real-ESRGAN-x4plus para fotografia general.
- Restauracion de capturas y material de anime/manga: las variantes `anime` de Real-ESRGAN y Real-CUGAN estan ajustadas a lineas y tramados, con opcion de denoising controlado.
- Procesamiento por lotes en escritorio o CLI: Upix puede aplicar modelos x2/x3/x4 sobre directorios completos sin dependencias de PyTorch, gracias al runtime ncnn.
- Integracion en apps Android: los paquetes ligeros (Real-CUGAN ~2,4 MB, Real-ESRGANv3-anime ~1,1 MB) caben en movil y se ejecutan en CPU/Vulkan.
- Preprocesado para pipelines de vision por computador: reescalar imagenes de entrada antes de deteccion o segmentacion con modelos x2/x4 para mejorar la resolucion efectiva.
- Archivado y preservacion digital: reescalado de material historico o de baja calidad con modelos generales y verificacion de integridad de los pesos via SHA-256.
- Distribucion espejo para terceros: servir los `.zip` desde un CDN con CORS para que otras herramientas consuman los mismos artefactos verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; los modelos son pequenos (1-31 MB de pesos), por lo que el consumo de memoria es bajo y depende de la resolucion de la imagen de entrada.
- GPU recomendadas: no disponible en la informacion; los packs oficiales de Real-ESRGAN y Real-CUGAN soportan Vulkan, por lo que funcionan en GPUs compatibles con Vulkan.
- GPU de consumo: los tamanos de pesos sugieren que caben en GPUs de consumo, pero no se aportan cifras concretas de VRAM ni modelos verificados.
- Despliegue: ncnn (libreria principal), con variantes Vulkan (`realesrgan-ncnn-vulkan`, `realcugan-ncnn-vulkan`) y uso a traves de Upix en Web, escritorio, Android y CLI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Escalas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xihale/upix-models (agregado) | no disponible (1,1-31 MB por pack) | 2x, 3x, 4x | ncnn | mixta por modelo | Hugging Face + GitHub Release |
| Real-ESRGAN (xinntao) | no disponible | 2x, 3x, 4x | PyTorch, ncnn | BSD-3-Clause | GitHub oficial |
| Real-CUGAN (bilibili/ailab) | no disponible | 2x, 3x | PyTorch, ncnn | MIT (pack) + terminos upstream | GitHub oficial |

La diferencia principal es que `upix-models` es un espejo agregado con CORS y verificacion SHA-256, no una implementacion nueva; los pesos y licencias provienen de los proyectos originales.

## Limitaciones y advertencias

- No es un modelo propio: no hay pesos originales ni entrenamiento por parte de xihale; solo agregacion y conversion de formato.
- Licencias heterogeneas: algunos modelos son `CC-BY-NC-SA-4.0`, es decir, solo uso no comercial y con ShareAlike; revisar la tabla del repositorio antes de usar en produccion.
- Real-CUGAN combina licencia MIT del pack ncnn con los terminos del upstream de bilibili ailab; hay que cumplir ambos.
- Riesgo de artefactos tipicos de superresolucion: sobreenfoque, halos, texturas inventadas y alucinacion de detalle en zonas de baja informacion.
- Los modelos `anime` pueden degradar fotografia real y viceversa; elegir la variante adecuada al dominio.
- La calidad depende de la escala: x4 en imagenes muy degradadas puede amplificar ruido y artefactos de compresion.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Los metadatos de idioma (en, zh) no implican capacidades linguisticas; son etiquetas del repositorio.
- Al ser un espejo, la disponibilidad y actualizaciones dependen del release `models` de Upix en GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/xihale/upix-models
- Repositorio Upix: https://github.com/xihale/upix
- Release de modelos Upix: https://github.com/xihale/upix/releases/tag/models
- Guia de conversion: https://github.com/xihale/upix/blob/main/models/CONVERTING.md
- Issues de Upix: https://github.com/xihale/upix/issues
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Real-ESRGAN v0.2.1: https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.1
- Real-CUGAN (bilibili/ailab): https://github.com/bilibili/ailab/tree/main/Real-CUGAN
- realcugan-ncnn-vulkan: https://github.com/nihui/realcugan-ncnn-vulkan
- realsr-models (tumuyan2): https://huggingface.co/tumuyan2/realsr-models
- OpenModelDB: https://openmodeldb.info/
