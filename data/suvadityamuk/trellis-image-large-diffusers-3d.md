# suvadityamuk/TRELLIS-image-large-diffusers-3d

## Resumen

TRELLIS-image-large-diffusers-3d es una conversión del modelo microsoft/TRELLIS-image-large al formato de la librería diffusers, publicada por el usuario suvadityamuk. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos originales de Microsoft reorganizados como componentes estándar de Diffusers (carpetas con `config.json` y ficheros `safetensors`) más un fichero lateral `object3d_model_index.json` que el cargador automático del paquete valida antes de descargar nada. El repositorio ocupa 4,2 GB y no requiere código remoto para su ejecución.

El modelo resuelve la tarea de generación 3D a partir de una única imagen: recibe una imagen RGBA cuya máscara alfa delimita el objeto y produce representaciones 3D en varios formatos (estructura dispersa, latentes SLat, gaussian splats, malla y campo de radiancia). Es relevante porque traslada un pipeline de investigación con dependencias propias al ecosistema Diffusers, con una API de tipo `AutoPipelineForImageTo3D`, lo que facilita su integración en flujos de trabajo ya existentes en PyTorch.

La arquitectura combina un codificador de imagen DINOv2 ViT-L/14 con registros, dos modelos de flujo tipo DiT (uno para estructura dispersa y otro para latentes SLat) y tres decodificadores basados en Swin para gaussianas, malla y campo de radiancia. La licencia es MIT para los pesos TRELLIS y Apache-2.0 para el codificador DINOv2. No hay datos publicados sobre número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de generación 3D en dos etapas: codificador DINOv2 ViT-L/14 con registros, modelos de flujo tipo DiT (estructura dispersa y latentes SLat) y decodificadores Swin (gaussianas, malla, campo de radiancia) |
| Parámetros totales | no disponible (los nombres de los ficheros publicados indican variantes DiT-L y Swin-B, pero no se declara el recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación 3D; la entrada es una imagen RGBA, no una secuencia de texto) |
| Tipos de cuantización | no se distribuyen versiones cuantizadas; los pesos se almacenan en float16 (transformers) y la precisión de cómputo se selecciona con el argumento `dtype` |
| Idiomas soportados | no aplica (la condición de entrada es una imagen; no hay entrada de texto ni capacidades multilingües) |
| Licencia | MIT (pesos y arquitectura TRELLIS, Copyright Microsoft Corporation); Apache-2.0 para los pesos del codificador DINOv2 (Copyright Meta Platforms, Inc.) |
| Formato de pesos | safetensors, organizados como componentes Diffusers (`config.json` + safetensors) con índice `object3d_model_index.json` |

## Arquitectura y entrenamiento

El pipeline reproduce el esquema de TRELLIS en dos fases. Primero, un modelo de flujo (`TrellisSparseStructureFlowModel`, fichero `ss_flow_img_dit_L_16l8_fp16`) genera una estructura dispersa condicionada por las características extraídas de la imagen mediante `TrellisDinov2Conditioner`, que envuelve `facebook/dinov2-with-registers-large`. Esa estructura se convierte en una rejilla densa mediante `TrellisSparseStructureDecoder` (`ss_dec_conv3d_16l8_fp16`). En la segunda fase, un segundo modelo de flujo (`TrellisSLatFlowModel`, `slat_flow_img_dit_L_64l8p2_fp16`) opera sobre los latentes estructurados (SLat), de los que derivan tres decodificadores independientes basados en Swin: `TrellisSLatGaussianDecoder` (`slat_dec_gs_swin8_B_64l8gs32_fp16`), `TrellisSLatMeshDecoder` (`slat_dec_mesh_swin8_B_64l8m256c_fp16`) y `TrellisSLatRadianceFieldDecoder` (`slat_dec_rf_swin8_B_64l8r16_fp16`). Los dos planificadores conservan los ajustes de muestreo originales: 25 pasos, guidance de 5,0 sobre el intervalo 0,5–1,0 y `rescale_t=3`.

No hubo entrenamiento en esta publicación. La conversión se realizó con la herramienta `diffusers-3d-convert-trellis` de `diffusers-3d 0.1.0.dev0` contra la revisión `442aa1e1afb9014e80681d3bf604e8d728a86ee7` de TRELLIS; según la model card, el proceso renombra parámetros al esquema del paquete y reformatea las configuraciones, sin modificar ningún valor de peso. La composición del dataset de entrenamiento original, el número de tokens o imágenes vistas y el uso de RLHF o DPO no se detallan en la información disponible. La innovación técnica aprovechable aquí es la modularización en componentes Diffusers con pruebas de paridad de configuración reducida frente al código upstream fijado, lo que permite ejecutar cada red en PyTorch convencional sin código remoto.

## Capacidades

- Generación de geometría 3D a partir de una sola imagen RGBA, con la máscara alfa utilizada para recortar y recentrar el objeto.
- Salida en cinco formatos seleccionables mediante el argumento `formats`: `sparse_structure`, `slat`, `gaussian`, `mesh` y `radiance_field`.
- Gaussian splats renderizables mediante el backend opcional `gsplat`.
- Exportación de mallas y de materiales PBR, que requiere el runtime compilado O-Voxel según la documentación del paquete.
- Extracción de características de imagen de alta calidad mediante DINOv2 ViT-L/14 con registros.
- Ejecución en CPU o GPU en PyTorch convencional, con precisión de cómputo configurable mediante `dtype=`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso ni modo de pensamiento.
- No es un modelo de lenguaje: no procesa texto, no genera texto y no tiene capacidades multilingües.

## Casos de uso

- Generación de assets 3D para videojuegos y realidad virtual: a partir de un render conceptual o una fotografía se obtienen mallas y campos de radiancia que sirven como base para prototipado rápido de props y decorados antes de la fase de modelado definitivo.
- Catalogación de producto en comercio electrónico: convertir las fotos de catálogo (con fondo recortado en el canal alfa) en mallas con materiales PBR para visores 3D web, evitando sesiones de fotogrametría con múltiples vistas.
- Previsualización para impresión 3D: el decodificador de malla permite obtener geometría exportable a partir de una única imagen de referencia, útil para validar silueta y proporciones antes de invertir tiempo en un modelado CAD.
- Datos sintéticos para robótica y simulación: los formatos `mesh` y `radiance_field` permiten poblar escenas simuladas con objetos generados desde fotografías reales, ampliando la variedad de entornos de entrenamiento sin captura 3D dedicada.
- Efectos visuales y realidad aumentada: los gaussian splats, renderizados con el backend `gsplat`, ofrecen una representación adecuada para visualización en tiempo real de objetos generados desde imagen.
- Reconstrucción rápida para gemelos digitales: partiendo de una fotografía de un objeto o componente, generar una representación volumétrica que sirva como aproximación inicial en herramientas de simulación o inventario visual.
- Investigación y docencia en visión 3D: al estar empaquetado como componentes Diffusers con pruebas de paridad, permite sustituir o analizar etapas concretas (condicionador, modelos de flujo, decodificadores) sin depender del código original de TRELLIS.
- Integración en herramientas de diseño: uso de los latentes `slat` como representación intermedia editable o recombinable en fases posteriores del flujo de trabajo artístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 4,2 GB en float16, de modo que la carga en memoria de los pesos ronda esa cifra; a ella hay que sumar activaciones y estructuras intermedias.
- Estimación orientativa de VRAM para inferencia completa con todos los decodificadores: en torno a 10–16 GB, aunque no se publican mediciones oficiales; ejecutar solo una parte del pipeline reduce el requisito.
- Cabe en GPU de consumo con 12 GB o más de memoria (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080/4090), ajustando la precisión con `dtype=` a bfloat16 o float16.
- Para lotes grandes o producción se recomiendan GPU de centro de datos como A100, H100 o L40S.
- Es posible ejecutar todas las redes en CPU en PyTorch convencional, según la model card, pero sin cifras de latencia publicadas.
- El renderizado de gaussian splats necesita el backend opcional `gsplat`; el mallado y la exportación PBR de TRELLIS.2 requieren el runtime compilado O-Voxel.
- Despliegue mediante la API `AutoPipelineForImageTo3D` del paquete `diffusers-3d`, instalado desde el fork de Diffusers del autor. No aplican vLLM, llama.cpp, Ollama ni TGI por no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Se conocen los ajustes de muestreo (25 pasos, guidance 5,0 sobre el intervalo 0,5–1,0, `rescale_t=3`), que condicionan el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura y tamaño | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| suvadityamuk/TRELLIS-image-large-diffusers-3d | Pipeline TRELLIS, parámetros no declarados | Imagen RGBA | MIT + Apache-2.0 (DINOv2) | HuggingFace, requiere el fork diffusers-3d | Conversión de pesos sin modificación; salidas en gaussian, mesh, radiance field, slat y sparse_structure |
| microsoft/TRELLIS-image-large | Mismo pipeline TRELLIS, parámetros no declarados | Imagen RGBA | MIT | HuggingFace | Modelo original; requiere el código de TRELLIS en lugar del empaquetado Diffusers |
| Otras alternativas de image-to-3D (TripoSR, Stable Fast 3D y similares) | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre estos modelos en la documentación proporcionada |

## Limitaciones y advertencias

- Conversión comunitaria: el repositorio tiene 0 descargas y 0 «likes», por lo que no cuenta con validación de terceros más allá de las pruebas de paridad declaradas por el propio autor.
- Dependencia de un fork: la instalación se realiza desde `git+https://github.com/suvadityamuk/diffusers.git` y su subdirectorio `packages/diffusers-3d`, no desde la librería Diffusers oficial; conviene fijar el commit utilizado en producción.
- Ausencia de datos de rendimiento: no hay benchmarks, métricas de fidelidad geométrica ni comparaciones publicadas en la información disponible, lo que impide estimar la calidad objetiva de las salidas.
- Calidad de la reconstrucción: al tratarse de un modelo generativo condicionado por una sola vista, son esperables errores de topología, geometría oclusiva inferida y texturas inconsistentes en las zonas no visibles de la imagen de entrada.
- Dependencias opcionales: el renderizado de gaussian splats requiere `gsplat` y el mallado o la exportación PBR requieren el runtime compilado O-Voxel; sin ellos, los formatos correspondientes no están disponibles.
- Entrada restringida: solo acepta imágenes RGBA en rango [0, 1] con canal alfa que enmascare el objeto; no admite prompts de texto ni condicionamiento por múltiples vistas.
- Idiomas: no aplica, ya que el modelo no procesa ni genera lenguaje natural.
- Licencia: MIT para los pesos TRELLIS y Apache-2.0 para DINOv2, ambas permisivas para uso comercial, pero exigen conservar la atribución a Microsoft Corporation y a Meta Platforms, Inc. El repositorio no está afiliado ni respaldado por ninguna de las dos empresas.
- Trazabilidad: la conversión se realizó contra una revisión concreta (`442aa1e1afb9014e80681d3bf604e8d728a86ee7`); cambios posteriores en el upstream no se reflejan automáticamente en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suvadityamuk/TRELLIS-image-large-diffusers-3d
- Modelo base: https://huggingface.co/microsoft/TRELLIS-image-large
- Fork de Diffusers usado para la conversión: https://github.com/suvadityamuk/diffusers
- Paquete diffusers-3d (subdirectorio del repositorio anterior): `packages/diffusers-3d`
- Codificador de imagen DINOv2 con registros: https://huggingface.co/facebook/dinov2-with-registers-large
- Revisión de TRELLIS empleada en la conversión: `442aa1e1afb9014e80681d3bf604e8d728a86ee7` (citada en la model card)
- Resultados de la búsqueda web: no aportaron enlaces relevantes, únicamente páginas de inicio del buscador.
