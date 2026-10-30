# wrivachand/uc_santa_barbara_3d

## Resumen

`wrivachand/uc_santa_barbara_3d` no es un modelo de lenguaje, sino un repositorio de Hugging Face que distribuye reconstrucciones 3D del campus de la Universidad de California en Santa Bárbara (UCSB) mediante la técnica de 3D Gaussian Splatting. Los archivos, en formato comprimido `.spz`, están pensados para visualizarse en el visor web enlazado desde la model card y proceden del proyecto de código abierto de Chandrakanth Gudavalli alojado en GitHub. El repositorio ocupa unos 0,8 GB y se publica bajo una licencia catalogada como `other`, cuyos términos concretos no se detallan en la ficha.

Su rasgo diferencial es la georreferenciación: todas las escenas comparten un mismo marco de coordenadas GPS east-north-up (ENU) en metros, y los centros de cada archivo son relativos al `splat_origin` declarado en el JSON de cada escena (`site/scenes/<scene>.json`). Esto permite alinear y combinar escenas en un marco común, algo poco habitual en capturas sueltas de gaussian splatting.

Es relevante como ejemplo del uso de Hugging Face para distribuir activos 3D más allá de los LLM, y como material práctico para visualización web de escenas reales capturadas con esta técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting (activo 3D; no es un modelo de lenguaje ni una red generativa de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (el formato `.spz` incorpora su propia compresión con pérdida, pero el repositorio no especifica esquemas tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (recurso 3D sin componente textual) |
| Licencia | `other` (términos no detallados en la model card) |
| Formato de pesos | Archivos `.spz` (formato comprimido para gaussian splatting); no distribuye safetensors ni GGUF |
| Tamaño del repositorio | 0,8 GB |
| Número de escenas | no disponible |
| Sistema de coordenadas | Marco GPS east-north-up (ENU) compartido, en metros; origen por escena en `splat_origin` |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

La técnica subyacente, 3D Gaussian Splatting (introducida por Kerbl et al. en 2023), representa una escena como un conjunto de gaussianas 3D —cada una con posición, covarianza (escala y rotación), opacidad y color expresado mediante armónicos esféricos— que se optimizan mediante rasterización diferenciable a partir de fotografías de la escena real. El formato `.spz` es un formato comprimido abierto para gaussian splatting, popularizado por Niantic (Scaniverse), que reduce el tamaño de los archivos para su distribución y visualización web, que es precisamente el caso de uso de este repositorio.

No se trata de un entrenamiento en el sentido de los LLM, sino de una optimización por escena. El repositorio no publica detalles sobre el proceso de captura (número de imágenes, dispositivo, dron o cámara manual), el número de gaussianas por escena ni los parámetros de optimización: no disponible. Lo único documentado en la model card es la convención geoespacial: todas las escenas comparten un marco ENU en metros y cada archivo se posiciona respecto al `splat_origin` de su escena en `site/scenes/<scene>.json`.

## Capacidades

- Representación 3D fotorrealista y navegable del campus de UCSB, visualizable directamente en el navegador mediante el visor web enlazado.
- Distribución de escenas en formato `.spz`, cargable en visores y librerías compatibles con este formato.
- Georreferenciación coherente: al compartir todas las escenas un marco ENU en metros, pueden alinearse entre sí e integrarse con datos GIS o cartografía.
- Metadatos de posicionamiento por escena (`splat_origin`) en archivos JSON, útiles para automatizar la carga y colocación de las escenas.
- No es un modelo generativo: no genera texto, código ni imágenes; no soporta tool calling, agentes ni razonamiento multi-paso; no tiene capacidades multilingües al no existir componente de lenguaje.

## Casos de uso

- **Visitas virtuales al campus:** estudiantes prospectivos o visitantes pueden explorar el campus en 3D desde el navegador, sin instalar nada, gracias al visor web publicado junto al repositorio.
- **Realidad virtual y aumentada:** los archivos `.spz` pueden integrarse en aplicaciones AR/VR compatibles para crear recorridos inmersivos por el campus.
- **Planificación y gestión de instalaciones:** al estar las escenas georreferenciadas en un marco ENU común, pueden superponerse con datos GIS para apoyar decisiones de planificación de espacios del campus.
- **Documentación y preservación digital:** registro tridimensional del estado actual del campus con fines de archivo histórico o seguimiento de obras.
- **Desarrollo y pruebas de visores 3D:** material real para probar renderizadores de gaussian splatting (basados en WebGL/WebGPU, por ejemplo con three.js) y librerías de carga del formato `.spz`.
- **Investigación en gráficos y visión por computador:** caso de estudio para algoritmos de compresión, streaming progresivo y alineación geoespacial de splats, gracias a la convención de coordenadas documentada.
- **Navegación y guías 3D del campus:** combinando el marco GPS compartido con mapas exteriores, pueden construirse guías interactivas orientadas por posición real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un recurso 3D y no de un modelo de lenguaje, no aplican métricas como MMLU, HumanEval o GSM8K; tampoco se publican métricas de calidad de reconstrucción (PSNR, SSIM) ni de rendimiento de renderizado.

## Requisitos de hardware

- No se requiere GPU para descargar ni almacenar el repositorio (0,8 GB en total); la visualización interactiva sí se beneficia de una GPU.
- VRAM estimada: no disponible como cifra concreta; el repositorio no publica requisitos. Los visores de gaussian splatting suelen funcionar en GPUs de consumo con varios GB de VRAM, pero debe verificarse caso por caso.
- El visor web funciona en navegador con soporte WebGL/WebGPU; para una tasa de frames fluida se recomienda GPU dedicada.
- No aplican opciones de despliegue típicas de LLM (vLLM, llama.cpp, Ollama, TGI). El despliegue se realiza mediante el visor web (alojado en GitHub Pages) o integrando los `.spz` en visores y librerías propias.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la información proporcionada no hay capturas comparables de otros campus o escenas. Como referencia, estos son los recursos técnicos relacionados con el material de este repositorio:

| Recurso | Tipo | Relación con este repositorio |
|---|---|---|
| graphdeco-inria/gaussian-splatting (GitHub) | Implementación de referencia de 3D Gaussian Splatting | Código de optimización y render; este repositorio distribuye escenas ya optimizadas en `.spz` |
| nianticlabs/spz (GitHub) | Especificación y librería del formato `.spz` | Define el formato comprimido empleado por los archivos de este repositorio |

Comparativa directa con capturas 3D de tamaño y alcance similares: no disponible.

## Limitaciones y advertencias

- La licencia figura como `other` sin términos detallados en la model card: es imprescindible revisar la licencia real antes de cualquier uso, especialmente comercial o de redistribución.
- No es un modelo de IA generativa: no sirve para tareas de NLP, código ni razonamiento.
- No se publican métricas de calidad de reconstrucción (PSNR, SSIM), número de gaussianas ni detalles de captura; como es habitual en gaussian splatting, pueden existir artefactos (zonas difusas, geometría ruidosa, oclusiones mal resueltas).
- El posicionamiento de cada escena depende de metadatos externos: hay que leer `site/scenes/<scene>.json` del repositorio de GitHub para obtener el `splat_origin`.
- Validación comunitaria nula en el momento de redactar la ficha: 0 descargas y 0 likes, por lo que no hay retroalimentación de otros usuarios sobre la calidad de las escenas.
- Tamaño de descarga no trivial (0,8 GB en total), relevante para su integración en aplicaciones con restricciones de ancho de banda.
- Al tratarse de una captura de un espacio real, conviene valorar consideraciones de privacidad (personas o matrículas capturadas incidentalmente) antes de redistribuir el material.

## Enlaces

- Hugging Face: https://huggingface.co/wrivachand/uc_santa_barbara_3d
- Visor web de las escenas: https://chandrakanth-gudavalli.github.io/uc_santa_barbara_3d/
- Código fuente del proyecto en GitHub: https://github.com/chandrakanth-gudavalli/uc_santa_barbara_3d
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
