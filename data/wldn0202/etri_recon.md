# wldn0202/etri_recon

## Resumen

`wldn0202/etri_recon` es un paquete de pesos para un runtime de escritorio orientado a la restauración de patrimonio cultural en 3D. El repositorio lo publica el usuario `wldn0202` y combina dos etapas: restauración de forma (geometría) y restauración de textura. No es una distribución oficial de Black Forest Labs ni de Microsoft, tal y como aclara el propio autor en la model card.

La etapa de textura es una configuración modificada de FLUX.1-dev a la que se añaden un LoRA multivista UniTEX, un adaptador de restauración y una compuerta de referencia (*reference gate*). La etapa de forma se distribuye como pesos independientes en `models/shape/`, sin que la información disponible detalle su arquitectura ni su número de parámetros.

El paquete contiene 41 archivos de modelo que suman 31.157.925.674 bytes, dentro de un repositorio de 55 GB. Se distribuye con la licencia `component-specific-model-terms`, con la FLUX.1 [dev] Non-Commercial License v1.1.1 aplicándose a los componentes derivados, lo que restringe el uso a entornos no comerciales y no de producción. Es relevante para equipos que digitalizan y restauran piezas arqueológicas o escultóricas, pero su estado de validación es todavía preliminar: la verificación en GPU físicas de 24 GB sigue pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etapa de forma no disponible; etapa de textura basada en FLUX.1-dev (transformer de difusión) modificada con LoRA multivista UniTEX, adaptador de restauración y reference gate |
| Parametros totales | no disponible (41 archivos, 31.157.925.674 bytes en total) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D; no hay ventana de contexto textual declarada) |
| Tipos de cuantizacion | BF16 (perfil `budget24`); otros formatos no disponibles |
| Idiomas soportados | ko, en |
| Licencia | `other` / `component-specific-model-terms`; FLUX.1 [dev] Non-Commercial License v1.1.1 para FLUX.1-dev y componentes derivados |
| Formato de pesos | safetensors (librería diffusers), organizados en `models/shape/` y `models/texture/`; se incluyen 10 GLB de ejemplo dañados y un banco de muestras de búsqueda de referencias |

## Arquitectura y entrenamiento

El paquete se organiza en dos rutas de pesos: `models/shape/` para la restauración geométrica y `models/texture/` para la restauración de apariencia. La parte de textura parte de FLUX.1-dev y le superpone un LoRA multivista UniTEX, un adaptador específico de restauración y un mecanismo de compuerta sobre imágenes de referencia, de modo que el modelo condiciona la síntesis de textura a vistas y referencias externas. La arquitectura de la etapa de forma, el número de parámetros de cada componente y los detalles del pipeline de difusión no se detallan en la información disponible.

No se publica información sobre el volumen de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica explícitamente que el repositorio no incluye el dataset de entrenamiento ni subidas de usuarios, y que los activos públicos del runtime se limitan al banco de muestras de búsqueda de referencias y a 10 GLB dañados. Tampoco se declara una licencia independiente para los adaptadores entrenados en el marco del proyecto. La reproducibilidad del entrenamiento es, por tanto, limitada.

## Capacidades

- Reconstrucción de forma 3D de piezas dañadas o incompletas a partir de entradas de imagen, dentro del pipeline `image-to-3d`.
- Restauración de textura sobre mallas 3D, con condicionamiento multivista y referencias externas.
- Inferencia en modo generación, en modo SDEdit y con referencias externas, según las pruebas del perfil `budget24`.
- Soporte de un banco de muestras de búsqueda de referencias para seleccionar imágenes guía.
- Interfaz de instalación en línea para Windows y Ubuntu (runtime 2.2.0), con verificación de tamaño y SHA256 de cada archivo.
- Idiomas declarados: coreano e inglés (aplicable a metadatos e interfaz, no a la generación visual).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo *thinking*.

## Casos de uso

- Restauración de esculturas y fragmentos arqueológicos: a partir de fotografías de una pieza con lagunas o fracturas, la etapa de forma completaría la geometría y la etapa de textura sintetizaría la apariencia sobre la malla resultante, usando el banco de referencias para mantener coherencia estilística.
- Digitalización para archivo museístico: generación de mallas texturizadas de alta fidelidad para catálogos internos, con la salvedad de que la licencia FLUX.1 [dev] restringe el uso a fines no comerciales y no de producción.
- Documentación de estado de conservación: comparación entre la reconstrucción hipotética y el estado real de la pieza mediante el flujo SDEdit, útil para informes de restauración.
- Réplicas para impresión 3D y mediación cultural: producción de mallas watertight a partir de escaneos parciales, siempre que el uso sea no comercial.
- Investigación en reconstrucción 3D: banco de 10 GLB dañados como conjunto de evaluación reproducible para comparar métodos de *inpainting* geométrico.
- Formación y divulgación: generación de visualizaciones didácticas de cómo era una pieza antes del deterioro, con revisión humana obligatoria por las obligaciones de filtrado de la licencia.
- Integración en pipelines de catalogación: el instalador valida tamaño y SHA256 contra un manifiesto fijado a un commit, lo que permite despliegues auditables en laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una validación funcional: el perfil `budget24` en BF16 superó las pruebas de generación, SDEdit e inferencia con referencias externas con un presupuesto de asignador de PyTorch de 22,5 GiB en una GPU de 96 GB designada. No se aportan cifras de PSNR, Chamfer Distance, F-Score, LPIPS ni comparaciones cuantitativas con otros métodos.

## Requisitos de hardware

- VRAM: el único dato validado es un presupuesto de asignador de PyTorch de 22,5 GiB en BF16 sobre una GPU de 96 GB. Los pesos suman 31,16 GB en disco, repartidos entre las etapas de forma y textura, por lo que el pico de memoria depende de si ambas etapas se cargan simultáneamente (no disponible).
- GPU recomendadas: la validación se realizó en una GPU de 96 GB (modelo concreto no especificado). No hay datos publicados para A100 40/80 GB, H100, RTX 4090 u otras.
- GPU de consumo: la validación en GPU físicas de 24 GB está pendiente según la propia model card, pese a que el perfil se denomine `budget24`. No se puede afirmar que quepa en una RTX 4090.
- Despliegue: runtime de escritorio propietario para Windows y Ubuntu (versión 2.2.0) con instalador en línea y manifiesto `windows-models-manifest.json` fijado a un commit; pesos consumibles con la librería diffusers. No se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Estado |
|---|---|---|---|---|
| wldn0202/etri_recon | Imagen a 3D con restauración de forma y textura para patrimonio | no disponible | Component-specific; FLUX.1 [dev] no comercial | 0 descargas, 0 likes, validación parcial |
| FLUX.1-dev (Black Forest Labs) | Difusión texto/imagen, base de la etapa de textura | no disponible en esta ficha | FLUX.1 [dev] Non-Commercial License v1.1.1 | Distribución oficial de BFL |
| Microsoft TRELLIS | Imagen a 3D (mallas texturizadas) | no disponible en esta ficha | no verificada en esta ficha | Repositorio público |
| TripoSR | Imagen a 3D de una sola pasada | no disponible en esta ficha | no verificada en esta ficha | Repositorio público |

Los datos de las alternativas proceden de sus fichas públicas y no se han verificado en el marco de esta ficha; consúltese cada repositorio antes de tomar decisiones de adopción. La diferencia principal de `etri_recon` es su especialización en patrimonio cultural dañado y su licencia no comercial, frente a alternativas de uso más general.

## Limitaciones y advertencias

- Licencia no comercial: los componentes FLUX.1-dev y derivados quedan bajo la FLUX.1 [dev] Non-Commercial License v1.1.1, con obligaciones de revisión y filtrado de salidas. No se concede ningún derecho comercial adicional.
- El paquete no otorga licencia sobre el dataset ni sobre las subidas de usuarios, y no declara una licencia independiente para los adaptadores desarrollados en el proyecto.
- Riesgo de alucinación geométrica: en restauración patrimonial, un modelo generativo puede inventar elementos inexistentes en la pieza original; requiere validación por especialistas antes de cualquier uso documental.
- Estado de validación incompleto: la instalación nativa en Windows/Ubuntu Desktop y la validación en GPU físicas de 24 GB siguen pendientes según el autor.
- Ausencia total de benchmarks publicados y de dataset de entrenamiento: la reproducibilidad y la comparación objetiva no son posibles con la información disponible.
- Idiomas declarados limitados a coreano e inglés, lo que afecta a la documentación y a cualquier componente textual del flujo.
- Tamaño del repositorio: 55 GB de espacio en disco y 31,16 GB de pesos, con verificación SHA256 obligatoria por archivo.
- Modelo sin tracción pública (0 descargas, 0 likes) y creado y actualizado el mismo día según los metadatos; no hay evidencia de uso independiente.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo: los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wldn0202/etri_recon
- Licencia FLUX.1-dev referenciada por el autor: https://huggingface.co/wldn0202/etri_recon/blob/main/licenses/texture/FLUX.1-dev-LICENSE-rendered.txt
- Aviso de atribución de textura (ruta en el repositorio): `licenses/texture/FLUX-NOTICE.txt`
- Licencia original de FLUX.1-dev (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/3de623fc3c33e44ffbe2bad470d0f45bccf2eb21/LICENSE.md
- Aviso del runtime de Windows (ruta en el repositorio): `runtime/windows/RUNTIME-NOTICE.txt`
- Procedencia del runtime (ruta en el repositorio): `runtime-provenance.json`
- Manifiesto de archivos del modelo (ruta en el repositorio): `model-files-manifest.json`
- Manifiesto del instalador de Windows (ruta en el repositorio): `windows-models-manifest.json`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
