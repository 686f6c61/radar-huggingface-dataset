# suvadityamuk/Hunyuan3D-Omni-diffusers-3d

## Resumen

Hunyuan3D-Omni-diffusers-3d es una conversion del modelo Tencent/Hunyuan3D-Omni al formato de la libreria diffusers-3d, publicada por el usuario suvadityamuk. El modelo original, desarrollado por Tencent, resuelve la tarea de image-to-3D: genera mallas 3D a partir de una imagen RGBA, con la particularidad de admitir controles geometricos adicionales (nube de puntos, voxeles, bounding box o esqueleto) para condicionar la generacion. Esta version empaqueta los pesos originales en carpetas de componentes estandar de Diffusers y Transformers, sin requerir codigo remoto.

La relevancia de esta ficha radica en que ofrece una via de ejecucion del modelo dentro del ecosistema diffusers-3d, con un pipeline de clase `Hunyuan3DOmniImageTo3DPipeline`. El repositorio contiene 3.050.758.720 parametros en formato safetensors (13,1 GB), con los pesos almacenados en float32; el transformador DiT por si solo ocupa 12,2 GB. La arquitectura combina un codificador de imagen DINOv2, un VAE de forma, un scheduler de flow matching y un DiT como red generativa principal.

Es importante senalar que la licencia del modelo original (Tencent Hunyuan 3D Omni Community License) impone restricciones geograficas y de uso: no se aplica en la Union Europea, el Reino Unido ni Corea del Sur, y exige licencia separada para productos con mas de un millon de usuarios activos mensuales. Estos condicionantes son determinantes para cualquier evaluacion de despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para generacion 3D: DiT (Hunyuan3DDiTModel) + VAE de forma (Hunyuan3DShapeVAE) + scheduler de flow matching Euler discreto + codificador de control + codificador de imagen DINOv2 |
| Parametros totales | 3.050.758.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion 3D, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float32 y se recomienda cargar con `dtype=torch.float16` |
| Idiomas soportados | no disponible (modelo multimodal imagen-a-3D; no procesa texto) |
| Licencia | tencent-hunyuan-3d-omni-community (Tencent Hunyuan 3D Omni Community License Agreement) |
| Formato de pesos | safetensors, organizados en carpetas de componentes Diffusers (`control_encoder`, `image_encoder`, `scheduler`, `transformer`, `vae`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de generacion 3D condicionada por imagen que sigue el paradigma de flow matching. La red principal es un Diffusion Transformer (DiT) implementado en `Hunyuan3DDiTModel`, que opera junto a un VAE de forma (`Hunyuan3DShapeVAE`) y un scheduler `Hunyuan3DFlowMatchEulerDiscreteScheduler`. La imagen de entrada se codifica mediante DINOv2-large (cargado desde `facebook/dinov2-large`, Apache-2.0, no incluido en el repositorio) y se combina con un codificador de control (`Hunyuan3DOmniControlEncoder`) que permite inyectar restricciones geometricas adicionales: nube de puntos, voxeles, bounding box o esqueleto.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La model card de esta conversion indica que los pesos fueron transformados con la herramienta `diffusers-3d-convert-hunyuan3d-omni` desde `diffusers-3d 0.1.0.dev0`, renombrando parametros pero sin alterar los valores. El pipeline incluye pruebas de paridad contra el codigo upstream fijado. Los valores por defecto de inferencia replican `inference.py` del repositorio original: 50 pasos, guidance 4.5 y `octree_resolution=512`.

## Capacidades

- Generacion de mallas 3D no texturizadas (`MeshAsset`) a partir de una imagen RGBA, donde el canal alfa define la mascara del objeto.
- Control geometrico condicional mediante exactamente uno de los siguientes modos: nube de puntos `(points, 3)`, voxeles `(points, 3)`, bounding box `(3,)` o esqueleto `(bones, 6)`.
- Generacion condicionada por esqueleto en pose A, util para coherencia anatomica o articulada.
- Ejecucion en CPU o GPU con PyTorch estandar, sin requerir codigo remoto.
- Renderizado opcional de Gaussian splats mediante el backend `gsplat` y malla con textura PBR para TRELLIS.2 mediante CuMesh.
- Postprocesado opcional con pymeshlab (extra GPL `meshlab`), desactivable con `postprocess=False`.
- No se documentan capacidades de texto, tool calling, agentes ni multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de assets 3D a partir de fotografias o renders 2D: el pipeline toma una imagen RGBA y devuelve una malla en una sola llamada, adecuado para iterar conceptos en estudios de videojuegos o animacion.
- Reconstruccion condicionada por esqueleto: pasar un esqueleto en pose A permite generar mallas compatibles con rigs existentes, util en pipelines de personajes.
- Ajuste geometrico con bounding box o voxeles: cuando se conoce la volumetria objetivo, el control permite alinear la malla generada con un espacio de trabajo predefinido.
- Generacion de mallas a partir de nubes de puntos: integrable en flujos de escaneo 3D donde se dispone de una captura dispersa y se quiere obtener una superficie cerrada.
- Investigacion en generacion 3D condicionada: la separacion en componentes Diffusers facilita experimentar con schedulers, pasos y guidance sin tocar el codigo upstream.
- Evaluacion comparativa de metodos image-to-3D: al ser una conversion estandarizada, permite medir paridad frente a Hunyuan3D-Omni original dentro de un mismo entorno de pruebas.
- Despliegue en entornos sin acceso a codigo remoto: la ausencia de `trust_remote_code` simplifica la auditoria de seguridad en infraestructuras corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos se distribuyen en float32 (13,1 GB totales; el DiT solo son 12,2 GB). Cargando con `dtype=torch.float16` se reduce aproximadamente a la mitad, en torno a 6-7 GB para los pesos, mas el coste de activaciones y del VAE.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) es un punto de partida razonable para fp16, aunque no hay confirmacion oficial.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16 GB o mas en fp16, aunque no esta confirmado en la documentacion.
- Opciones de despliegue: el paquete `diffusers-3d` (instalacion via pip desde el repositorio de GitHub), con PyTorch en CPU o GPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Dependencias opcionales: `gsplat` para Gaussian splats, CuMesh para malla PBR de TRELLIS.2 y el extra GPL `meshlab` para el postprocesado con pymeshlab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan3D-Omni-diffusers-3d (esta ficha) | 3.050.758.720 | no aplica | image-to-3D con control geometrico | Tencent Hunyuan 3D Omni Community (restringida por region) | Hugging Face, diffusers-3d |
| tencent/Hunyuan3D-Omni (upstream) | no disponible en la informacion | no aplica | image-to-3D con control geometrico | Tencent Hunyuan 3D Omni Community | Hugging Face, requiere codigo remoto |
| TRELLIS.2 | no disponible en la informacion | no aplica | image-to-3D con textura PBR | no disponible | mencionado como compatible con CuMesh |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La licencia Tencent Hunyuan 3D Omni Community **no se aplica en la Union Europea, el Reino Unido ni Corea del Sur**, lo que impide su uso legal en esos territorios.
- Productos con mas de un millon de usuarios activos mensuales requieren una licencia separada de Tencent.
- Los resultados generados no pueden utilizarse para mejorar otros modelos de IA, segun los terminos de la licencia.
- La licencia incluye una Acceptable Use Policy y restricciones en sus secciones 5(a) y 5(b) que deben leerse antes de cualquier uso.
- El modelo genera mallas no texturizadas por defecto; la textura PBR requiere componentes adicionales (CuMesh) y no esta incluida en el flujo basico.
- El codificador de imagen DINOv2 no se incluye en el repositorio y debe descargarse por separado desde `facebook/dinov2-large`.
- El postprocesado con pymeshlab depende de un extra GPL (`meshlab`), lo que puede afectar a la distribucion del software resultante.
- Solo se admite un control geometrico por llamada; no se pueden combinar esqueleto y voxeles simultaneamente.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad geometrica; no hay datos disponibles al respecto.
- El repositorio tiene 22 descargas y 0 likes, lo que sugiere una validacion comunitaria muy limitada.
- El modelo no esta afiliado, patrocinado ni respaldado por Tencent.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/suvadityamuk/Hunyuan3D-Omni-diffusers-3d
- Modelo base upstream: https://huggingface.co/tencent/Hunyuan3D-Omni
- Repositorio diffusers-3d: https://github.com/suvadityamuk/diffusers-3d
- Codificador de imagen DINOv2-large: https://huggingface.co/facebook/dinov2-large
- Licencia: https://huggingface.co/suvadityamuk/Hunyuan3D-Omni-diffusers-3d/blob/main/LICENSE-TENCENT-HUNYUAN-3D-OMNI
