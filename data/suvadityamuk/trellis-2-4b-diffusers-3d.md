# suvadityamuk/TRELLIS.2-4B-diffusers-3d

## Resumen

TRELLIS.2-4B-diffusers-3d es una conversion del modelo de generacion 3D microsoft/TRELLIS.2-4B al formato de pipeline `diffusers-3d`, publicada por el usuario suvadityamuk. No es un modelo nuevo ni un fine-tuning: los pesos son los originales de Microsoft (revision `75fbf0183001ed9876c8dbb35de6b68552ee08bd`) y lo unico que cambia es el empaquetado, que permite cargar el pipeline con `AutoPipelineForImageTo3D` en lugar de usar el codigo de investigacion original. El modelo resuelve la tarea image-to-3D: a partir de una imagen RGBA genera una representacion de superficie 3D con canales PBR (color base, rugosidad, metalicidad), exportable a malla y a GLB.

La arquitectura combina varios modulos DiT (Diffusion Transformer) de aproximadamente 1,3B parametros cada uno que operan mediante flow matching sobre representaciones latentes dispersas, mas decodificadores conv3D y un decodificador PBR. El nombre del modelo indica del orden de 4B parametros en total. La salida no es una malla poligonal clasica, sino un O-Voxel (dual-grid surface) que conserva informacion de textura y materiales y que despues puede convertirse en malla o en Gaussian splats.

Es relevante porque es una de las pocas vias para usar TRELLIS.2 con la API estandar de `diffusers` en PyTorch puro. Ahora bien, el repositorio no incluye el acondicionador de imagen DINOv3 (esta restringido por la licencia de Meta) ni redistribuye el runtime compilado de O-Voxel, de modo que la conversion resuelve la inferencia pero no todo el pipeline de postprocesado. El repositorio tiene 15 GB, licencia MIT y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de DiT (Diffusion Transformer) con flow matching sobre latentes dispersos, mas decodificadores conv3D y decodificador PBR; representacion de salida O-Voxel (dual-grid) con canales PBR |
| Parametros totales | Aproximadamente 4B (denominacion del modelo); el repo detalla cuatro modulos DiT de 1,3B (`ss_flow_img_dit_1_3B_64_bf16`, `slat_flow_img2shape_dit_1_3B_512_bf16`, `slat_flow_img2shape_dit_1_3B_1024_bf16`, `slat_flow_imgshape2tex_dit_1_3B_512_bf16`, `slat_flow_imgshape2tex_dit_1_3B_1024_bf16`) mas decodificadores |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion 3D; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en bfloat16 (modelos DiT) y float16 (decodificadores) |
| Idiomas soportados | No aplica (entrada visual, salida 3D; no procesa lenguaje) |
| Licencia | MIT (pesos y arquitectura TRELLIS.2, Copyright (c) Microsoft Corporation); el decodificador de estructura dispersa procede de TRELLIS, tambien MIT |
| Formato de pesos | safetensors, integrados en un pipeline `diffusers` (`diffusers-3d`) |

## Arquitectura y entrenamiento

El pipeline encadena varias etapas. Primero, un acondicionador visual DINOv3 ViT-L/16 (`facebook/dinov3-vitl16-pretrain-lvd1689m`) extrae caracteristicas de la imagen de entrada y las inyecta en los DiT mediante cross-attention. A continuacion, `sparse_structure_flow_model` (1,3B, latente 64³) genera la estructura dispersa mediante flow matching, y `sparse_structure_decoder` (`ss_dec_conv3d_16l8_fp16`, heredado de TRELLIS-image-large) la decodifica. Sobre esa estructura, los modelos `shape_slat_flow_model` (1,3B, presets 512 y 1024) generan el latent de forma, y los `texture_slat_flow_model` (1,3B, presets 512 y 1024) generan el latent de textura condicionado por forma. Finalmente, `Trellis2ShapeDualGridDecoder` produce la superficie dual-grid y `Trellis2PBRSparseDecoder` (`tex_dec_next_dc_f16c32_fp16`) genera los canales PBR.

La innovacion principal del modelo base es la representacion O-Voxel: en lugar de una malla, el resultado es una superficie dual-grid con canales PBR asociados, lo que permite exportar tanto Gaussian splats como mallas con materiales horneados. El pipeline admite cuatro presets de resolucion (`512`, `1024`, `1024_cascade`, `1536_cascade`). La conversion se realizo con la herramienta `diffusers-3d-convert-trellis2` (version `diffusers-3d 0.1.0.dev0`) y, segun el autor, los valores de los pesos no se modificaron. No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de activos 3D texturizados a partir de una unica imagen RGBA (image-to-3D).
- Generacion de canales PBR (color base, rugosidad, metalicidad) mediante `Trellis2PBRSparseDecoder`.
- Cuatro presets de resolucion de salida: `512`, `1024`, `1024_cascade` y `1536_cascade`.
- Representacion intermedia O-Voxel con conversion posterior a malla mediante `OVoxelBackend.to_mesh`.
- Exportacion a GLB con materiales PBR horneados mediante `pipeline.postprocess_ovoxel(..., output_format="glb")`.
- Renderizado de Gaussian splats, siempre que se instale el backend opcional `gsplat`.
- Ejecucion en CPU o GPU en PyTorch puro (sin kernels personalizados obligatorios para la inferencia de redes).
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni procesamiento de texto.

## Casos de uso

- Generacion de assets para videojuegos: a partir de un concepto o una foto de referencia se obtiene una malla con materiales PBR lista para importar en un motor como Unreal o Unity, usando el preset `1024` o `1024_cascade` para equilibrar detalle y coste.
- Catalogos de comercio electronico en 3D: convertir las fotos de producto de un catalogo en modelos 3D con textura, para ofrecer vistas interactivas o configuradores web.
- Realidad aumentada y realidad virtual: el GLB con canales PBR generado encaja directamente en visores de AR/VR que consumen glTF con materiales fisicamente basados, sin retoques manuales de textura.
- Previsualizacion de personajes y props en produccion audiovisual: generar una primera version volumetrica para bloqueo de escena antes de invertir en modelado manual.
- Simulacion robotica y gemelos digitales: crear mallas de objetos reales fotografiados una sola vez, para usarlas en entornos simulados donde la geometria y el aspecto importan mas que la topologia perfecta.
- Prototipado rapido en diseno industrial: convertir bocetos o fotos de maquetas en modelos con materiales para iterar sobre variantes de forma y acabado.
- Investigacion en generacion 3D: al ser un pipeline `diffusers` con pesos safetensors, sirve como base para experimentar con los distintos presets, comparar `512` frente a las variantes en cascada o sustituir el acondicionador visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (Chamfer Distance, F-Score, PSNR, CLIP-score ni comparaciones cuantitativas con otros generadores 3D), y la busqueda web asociada no ha devuelto resultados tecnicos relevantes sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 15 GB, pero no todos los modulos se cargan a la vez. Cargando los DiT necesarios en bfloat16 (aproximadamente 2,6 GB por modulo de 1,3B), mas el acondicionador DINOv3 ViT-L/16 en float16 y los decodificadores conv3D, una ejecucion del preset `512` deberia moverse en el rango de 10-16 GB de VRAM. Es una estimacion a partir del tamano de los pesos, no un dato publicado por el autor para los presets en cascada.
- Los presets `1024_cascade` y `1536_cascade` requieren mas memoria y mas tiempo de calculo, ya que encadenan etapas adicionales de flow matching sobre latentes de mayor resolucion.
- GPU recomendadas: A100 de 40/80 GB o H100 para los presets en cascada y para lotes; tarjetas de 16-24 GB (RTX 4090, RTX 4080, L40S, A10G) para el preset `512`.
- Cabe en GPU de consumo: si, previsiblemente, para el preset `512` en una GPU con 16 GB o mas. Para `1024_cascade` y `1536_cascade` conviene disponer de 24 GB o recurrir a offloading.
- El autor indica que `diffusers-3d` ejecuta todas las redes en PyTorch puro, por lo que la instalacion es `pip install git+https://github.com/suvadityamuk/diffusers.git` y el subpaquete `packages/diffusers-3d`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Componentes opcionales imprescindibles para el postprocesado completo: el backend `gsplat` para renderizar Gaussian splats y el runtime compilado de O-Voxel (con su dependencia `nvdiffrast`) para mallado y exportacion PBR a GLB.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2-4B-diffusers-3d | suvadityamuk (conversion de microsoft/TRELLIS.2-4B) | Aproximadamente 4B | O-Voxel, malla, Gaussian splats, GLB con PBR | MIT (pesos TRELLIS.2), acondicionador DINOv3 bajo licencia de Meta no incluido | HuggingFace, biblioteca `diffusers-3d` (fork) |
| microsoft/TRELLIS.2-4B | Microsoft | Aproximadamente 4B | O-Voxel, malla, Gaussian splats, GLB con PBR | MIT (TRELLIS.2) | HuggingFace; requiere el codigo de investigacion original, no la API de `diffusers` |
| microsoft/TRELLIS-image-large | Microsoft | No disponible | Estructura dispersa y SLAT (version anterior de la familia) | MIT | HuggingFace; su decodificador de estructura dispersa se reutiliza en esta conversion |
| Otros generadores image-to-3D de gran escala (por ejemplo, la familia Hunyuan3D) | No disponible | No disponible | Malla texturizada | No disponible | No disponible |

La busqueda web realizada no ha aportado datos verificables sobre los modelos alternativos, por lo que las filas correspondientes se dejan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias

- El acondicionador DINOv3 no se distribuye en este repositorio: sus pesos estan restringidos por la licencia de DINOv3 de Meta. Hay que aceptar dicha licencia en `facebook/dinov3-vitl16-pretrain-lvd1689m` y pasar el acondicionador manualmente al cargar el pipeline. Sin el, el modelo no funciona.
- La licencia MIT cubre los pesos y la arquitectura TRELLIS.2, pero el mallado y la exportacion PBR a GLB dependen del runtime compilado de O-Voxel y de `nvdiffrast`, cuya licencia es de ambito de investigacion. Esto es un caveat critico para uso comercial: conviene verificar la licencia del runtime antes de desplegar un producto que genere GLB con PBR.
- Es una conversion de terceros. El autor declara explicitamente no estar afiliado ni respaldado por Microsoft ni por Meta, y el repositorio registra cero descargas y cero likes, por lo que no hay evidencia de uso en produccion ni validacion independiente de que los resultados coincidan bit a bit con el pipeline original mas alla de la afirmacion de que los valores de los pesos no cambian.
- La cuantizacion no esta soportada ni documentada: solo se publican pesos en bfloat16 y float16. No hay versiones GGUF ni de 8 o 4 bits, lo que limita el despliegue en hardware con poca memoria.
- Riesgo de alucinacion geometrica: como todo generador 3D basado en difusion, puede producir geometria inventada en zonas ocluidas de la imagen de entrada, superficies no cerradas o texturas inconsistentes entre vistas.
- Dependencia de la calidad y del encuadre de la imagen de entrada: el modelo no procesa texto ni instrucciones, por lo que no se puede corregir el resultado mediante prompts.
- Limitaciones de resolucion: los presets `512` y `1024` producen detalle limitado en geometrias finas; las variantes en cascada mejoran el resultado a costa de mas VRAM y mas tiempo.
- Sin datos publicados de sesgos, composicion del dataset de entrenamiento, idiomas ni benchmarks, no es posible evaluar sesgos sistematicos en la distribucion de objetos o estilos que el modelo reproduce.
- Requiere instalar un fork de `diffusers` desde Git, no la version oficial de PyPI, lo que complica el mantenimiento y la reproducibilidad de entornos en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suvadityamuk/TRELLIS.2-4B-diffusers-3d
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Fork de diffusers usado para la conversion: https://github.com/suvadityamuk/diffusers
- Subpaquete diffusers-3d: https://github.com/suvadityamuk/diffusers.git#subdirectory=packages/diffusers-3d
- Acondicionador DINOv3 ViT-L/16 (pesos restringidos, no incluidos): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; las entradas devueltas correspondian a servicios de correo ajenos al tema.
