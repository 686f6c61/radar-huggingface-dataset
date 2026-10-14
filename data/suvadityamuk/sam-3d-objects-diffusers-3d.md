# suvadityamuk/sam-3d-objects-diffusers-3d

## Resumen

`suvadityamuk/sam-3d-objects-diffusers-3d` es una conversión del modelo `facebook/sam-3d-objects` de Meta al formato de pipeline de `diffusers-3d`, un fork del paquete Diffusers mantenido por el propio autor. El repositorio no contiene pesos nuevos ni un entrenamiento adicional: redistribuye los mismos materiales de SAM 3D Objects reorganizados en carpetas de componentes estándar de Diffusers y Transformers (sin código remoto), junto con un fichero lateral `object3d_model_index.json` que el autocargador del paquete valida antes de descargar nada.

El modelo resuelve una tarea de image-to-3D: a partir de una imagen RGB y una máscara que selecciona un objeto, reconstruye ese objeto en 3D y lo devuelve colocado en el sistema de coordenadas de la cámara de entrada. La salida puede solicitarse en dos formatos simultáneamente: gaussian splats y malla. La arquitectura combina un codificador de imagen DINOv2 con registros, un modelo de flow matching para la estructura dispersa, un modelo de flow matching sobre latentes estructurados (SLAT) y decodificadores de estilo Trellis para gaussianas y malla.

Su relevancia es fundamentalmente de integración: permite usar SAM 3D Objects dentro del ecosistema Diffusers con una API de tipo `AutoPipelineForImageTo3D`, sin depender del código original de Meta. El repositorio ocupa 7,1 GB, tiene licencia SAM (no open source) y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de una conversión reciente y sin validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D: encoder de imagen `Dinov2WithRegistersModel` más modelos de flow matching (`Sam3DSparseStructureFlowModel`, `TrellisSLatFlowModel`) con decodificadores Trellis (estructura dispersa, gaussianas y malla) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a 3D; no procesa texto) |
| Tipos de cuantización | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | safetensors, organizados en carpetas de componentes Diffusers |
| Pipeline | image-to-3D |
| Librería | diffusers (requiere el paquete `diffusers-3d`) |
| Modelo base | `facebook/sam-3d-objects` |
| Tamaño del repositorio | 7,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-13 |

## Arquitectura y entrenamiento

El repositorio es el resultado de la herramienta `diffusers-3d-convert-sam3d` (`diffusers-3d 0.1.0.dev0`), que mapea tensor a tensor los materiales de SAM 3D Objects a diez componentes: `image_encoder` (`transformers.Dinov2WithRegistersModel`), `sparse_structure_conditioner` y `slat_conditioner` (`Sam3DConditionEmbedder`), `sparse_structure_flow_model` (`Sam3DSparseStructureFlowModel`), `slat_flow_model` (`TrellisSLatFlowModel`), los decodificadores `TrellisSparseStructureDecoder`, `TrellisSLatGaussianDecoder` y `TrellisSLatMeshDecoder`, y dos planificadores `TrellisFlowEulerScheduler`. El esquema es el de las familias Trellis: primero se genera la estructura dispersa del objeto y después se modela el latente estructurado (SLAT) del que se derivan las gaussianas y la malla. Todos los módulos se ejecutan en PyTorch convencional, en CPU o GPU, sin código remoto.

El pipeline acepta una imagen `(3, H, W)` en `[0, 1]` y una máscara `(1, H, W)` que selecciona el objeto, y devuelve el objeto situado en el marco de la cámara de entrada. Opcionalmente admite un `pointmap` (puntos en espacio de cámara por píxel) para incorporar profundidad; si no se proporciona, los tokens del pointmap quedan a cero, replicando el dropout aplicado durante el entrenamiento del modelo original. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que se trata de una conversión de pesos preexistentes y no de un entrenamiento nuevo.

## Capacidades

- Reconstrucción 3D de objetos a partir de una única imagen RGB y una máscara de segmentación.
- Generación de representaciones gaussianas (gaussian splats) del objeto reconstruido.
- Generación de malla del objeto, con colocación en el sistema de coordenadas de la cámara de entrada.
- Uso opcional de profundidad mediante el argumento `pointmap`; sin él, el modelo opera en el régimen de dropout con el que fue entrenado.
- Ejecución íntegra en PyTorch sobre CPU o GPU, sin requerir código remoto ni componentes opcionales para inferencia básica.
- Renderizado de gaussian splats mediante el backend opcional `gsplat`.
- Generación de malla con texturas PBR para TRELLIS.2 mediante el backend opcional CuMesh.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, soporte de agentes ni capacidades multilingües: es un modelo especializado de imagen a 3D.

## Casos de uso

- Catalogación de producto en comercio electrónico: a partir de una foto de catálogo y una máscara del artículo, generar una malla y gaussianas para un visor 3D interactivo sin necesidad de un escaneo dedicado.
- Generación de activos para videojuegos y contenido 3D: producir mallas exportables de objetos cotidianos como paso previo a su retopologización y ajuste manual en el motor.
- Percepción en robótica: reconstruir la geometría de un objeto señalado por máscara en la imagen de una cámara montada en el robot, con la geometría devuelta ya en el marco de la cámara, lo que simplifica el cálculo de poses de agarre.
- Realidad aumentada y mixta: insertar el objeto reconstruido en la escena capturada, aprovechando que la salida se entrega en el sistema de coordenadas de la cámara de entrada.
- Investigación en generación 3D: utilizar el pipeline como referencia reproducible en Diffusers para comparar variantes de flow matching, decodificadores de gaussianas y esquemas de estructura dispersa.
- Generación de datos sintéticos: poblar escenas 3D para entrenar detectores o modelos de navegación a partir de fotografías reales segmentadas.
- Digitalización de patrimonio y piezas únicas: obtener una representación gaussiana y una malla de un objeto fotografiado en condiciones controladas, útil cuando no es viable un escaneo láser.
- Prototipado rápido en diseño industrial: validar volumétricamente una pieza a partir de un render o una fotografía antes de pasar al modelado CAD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a describir la instalación, el uso de la API, la tabla de componentes y la procedencia de la conversión; no incluye métricas de calidad geométrica, ni comparaciones cifradas con el modelo original o con alternativas. Tampoco se documentan cifras de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 7,1 GB, por lo que los pesos en el formato distribuido rondan ese tamaño; como estimación derivada de ese dato, la inferencia en precisión de 16 bits requiere del orden de 8-10 GB de VRAM solo para pesos, más el espacio de activaciones, que depende de la resolución de entrada y del número de pasos del planificador.
- GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A100 40 GB, H100) son opciones holgadas para ejecutar el pipeline completo con salida de gaussianas y malla. Tarjetas de 12-16 GB pueden ser suficientes en configuraciones ajustadas, pero no hay cifras publicadas que lo confirmen.
- Ejecución en CPU posible: el README indica que todas las redes corren en PyTorch convencional sobre CPU o GPU, sin cuantificar la penalización de velocidad.
- El renderizado de gaussian splats requiere el backend opcional `gsplat`; la malla con texturas PBR de TRELLIS.2 requiere CuMesh. Ambos condicionan el hardware necesario para esas salidas concretas.
- Despliegue mediante el paquete `diffusers-3d` y la API `AutoPipelineForImageTo3D`, instalado desde el fork de GitHub del autor. No es compatible con servidores de inferencia para modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suvadityamuk/sam-3d-objects-diffusers-3d` | no disponible | no aplica | safetensors (componentes Diffusers) | SAM License | HuggingFace, 0 descargas, 0 likes |
| `facebook/sam-3d-objects` (modelo base) | no disponible | no aplica | no disponible | SAM License | HuggingFace |
| Otras alternativas de image-to-3D (por ejemplo, familias tipo Trellis o TripoSR) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de parámetros, contexto o rendimiento para establecer una comparativa cuantitativa. La única comparación verificable a partir de la información proporcionada es con el modelo base: el repositorio redistribuye los mismos materiales de `facebook/sam-3d-objects` reorganizados para el ecosistema `diffusers-3d`, sin cambios declarados en los pesos.

## Limitaciones y advertencias

- La licencia SAM no es una licencia open source: prohíbe usos militares, de guerra, nucleares, de espionaje y de armas, así como el uso por partes sujetas a controles comerciales, y exige que las publicaciones que empleen el modelo lo acrediten. Cualquier uso comercial debe revisarse contra el texto completo de `LICENSE-SAM`.
- El repositorio no está afiliado ni respaldado por Meta; el autor solo redistribuye materiales convertidos.
- Requiere instalar el fork `suvadityamuk/diffusers` y el subpaquete `packages/diffusers-3d` directamente desde GitHub, lo que ata el proyecto a un mantenimiento externo y no a la distribución oficial de Diffusers.
- Al ser una conversión de pesos, cualquier divergencia respecto al original depende de la herramienta `diffusers-3d-convert-sam3d`; el README menciona tests de paridad contra el código original como parte de la suite del paquete, pero no publica sus resultados en la model card.
- 0 descargas y 0 likes en el momento de la consulta: no existe validación independiente por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Riesgo de fidelidad geométrica: al tratarse de un modelo generativo, la malla o las gaussianas resultantes pueden ser plausibles sin corresponderse exactamente con el objeto real. No se han publicado métricas de error geométrico, de IoU o de Chamfer en la información disponible.
- Sesgos conocidos: no disponible; no se documentan sesgos de dataset ni de dominio.
- Requiere obligatoriamente una máscara del objeto además de la imagen RGB, lo que implica un paso previo de segmentación no resuelto por este repositorio.
- No se documentan idiomas soportados, tipos de cuantización ni límites de resolución de entrada.
- Sin datos publicados de VRAM, latencia ni throughput, la planificación de capacidad en producción debe hacerse por medición directa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suvadityamuk/sam-3d-objects-diffusers-3d
- Modelo base: https://huggingface.co/facebook/sam-3d-objects
- Texto de la licencia SAM: https://huggingface.co/suvadityamuk/sam-3d-objects-diffusers-3d/blob/main/LICENSE-SAM
- Fork de Diffusers con soporte 3D: https://github.com/suvadityamuk/diffusers
- Subpaquete diffusers-3d: https://github.com/suvadityamuk/diffusers/tree/main/packages/diffusers-3d
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de cestas de almacenamiento y decoración sin relación con el repositorio.
