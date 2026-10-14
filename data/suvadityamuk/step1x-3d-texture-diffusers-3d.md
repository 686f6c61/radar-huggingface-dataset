# suvadityamuk/Step1X-3D-Texture-diffusers-3d

## Resumen

Step1X-3D-Texture-diffusers-3d es una conversion del pipeline de texturizado de Step1X-3D (modelo de StepFun) al formato del paquete `diffusers-3d`, publicado por el usuario suvadityamuk. No es un modelo entrenado desde cero: es un reempaquetado de pesos ya existentes que permite ejecutar la fase de texturizado image-to-3D dentro del ecosistema Diffusers estandar, sin codigo remoto y validando un indice lateral (`object3d_model_index.json`) antes de descargar componentes.

El modelo recibe una malla 3D sin textura (un `MeshAsset`, por ejemplo la salida de un pipeline de geometria) y una imagen RGBA de referencia, y devuelve una malla con textura UV base-color, ademas de seis vistas ortograficas de previsualizacion. Internamente combina un UNet de SDXL, un T2I-Adapter, un adaptador multi-vista especifico de Step1X-3D, el scheduler DDPM, dos codificadores de texto CLIP y un VAE, con un total declarado de 2.567.463.684 parametros en safetensors y un repositorio de 15,8 GB.

Su relevancia es practica: elimina la dependencia del codigo original de Step1X-3D y permite integrar el texturizado en flujos de trabajo basados en PyTorch/Diffusers que corren tanto en CPU como en GPU. Es un repositorio nuevo (publicado el 14 de octubre de 2026), con cero descargas e interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente: UNet2DConditionModel (SDXL) + T2I-Adapter + adaptador multi-vista Step1X-3D; scheduler DDPMScheduler |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo generativo de imagenes/3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa dtype=torch.float16 |
| Idiomas soportados | no disponible (la entrada de texto la procesan los tokenizers CLIP de SDXL) |
| Licencia | openrail++ para el repositorio; componentes con licencias propias (ver mas abajo) |
| Formato de pesos | safetensors |

Detalle de licencias por componente:
- UNet base SDXL, codificadores de texto y tokenizers: CreativeML Open RAIL++-M (con restricciones de uso).
- VAE: MIT (madebyollin/sdxl-vae-fp16-fix).
- Adaptador T2I y adaptador multi-vista de Step1X-3D: Apache-2.0 (Copyright StepFun).
- Sincronizacion de textura basada en SyncMVD: MIT.

## Arquitectura y entrenamiento

La arquitectura es un pipeline de difusion en dos fases encadenadas mediante el ecosistema `diffusers-3d`. La generacion de vistas usa un UNet de SDXL con dos adaptadores superpuestos: un `T2IAdapter` al que se le alimentan renders de posicion y de normales, y un `Step1X3DMultiViewAdapter` especifico de Step1X-3D que aporta la coherencia multi-vista. El muestreo lo gobierna un `DDPMScheduler`, condicionado por dos codificadores de texto CLIP (`CLIPTextModel` y `CLIPTextModelWithProjection`) con sus tokenizers. El pipeline genera seis vistas ortograficas (utilizadas para mantener la consistencia mediante un latente de textura compartido, siguiendo el enfoque de SyncMVD) y despues "cuece" una textura base-color en PyTorch puro. Las previsualizaciones quedan accesibles en `output.previews`.

No se dispone de informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, si hubo RLHF/DPO), porque este repositorio es una conversion de pesos, no un entrenamiento nuevo. La informacion proporcionada solo indica que la conversion se realizo con la herramienta `diffusers-3d-convert-step1x3d-texture` desde `diffusers-3d 0.1.0.dev0`, que el README de la familia del paquete fija las revisiones upstream y el mapeo de tensores, y que existen tests de paridad contra el codigo upstream como parte de la suite del paquete.

## Capacidades

- Texturizado image-to-3D: dado un `MeshAsset` sin textura y una imagen RGBA `(4, H, W)` en `[0, 1]` (con canal alfa que enmascara el objeto), produce una malla con textura UV base-color.
- Generacion de seis vistas ortograficas coherentes mediante SDXL, el adaptador multi-vista y el T2I-Adapter condicionado por renders de posicion y normales.
- Sincronizacion de textura multi-vista mediante un latente de textura compartido (enfoque SyncMVD).
- Exportacion de la malla texturizada a GLB con `TrimeshBackend().export_mesh(...)` (requiere el extra `portable`).
- Acceso a las vistas de previsualizacion a traves de `output.previews`.
- Ejecucion en CPU o GPU con PyTorch estandar, sin codigo remoto ni confianza en `trust_remote_code`.
- Compatibilidad con representaciones Gaussian splat mediante el backend opcional `gsplat`, y con malla texturizada PBR para TRELLIS.2 mediante CuMesh (segun la documentacion del paquete).
- No dispone de tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagen/3D, no un LLM.

## Casos de uso

- Texturizado de assets para videojuegos: partiendo de una malla sin textura y una imagen de referencia, se genera una textura UV base-color exportable a GLB, util para prototipado rapido de props y escenarios antes del paso por artistas.
- Pipelines de contenido 3D automatizado: el modelo se puede encadenar tras un modelo de geometria (por ejemplo `Step1X-3D-Geometry-1300m-diffusers-3d`) para convertir una sola imagen en una malla texturizada dentro de un flujo de CI/CD de assets.
- E-commerce y catalogos de producto: generar representaciones 3D texturizadas de un producto a partir de una fotografia, para visores web interactivos.
- Prototipado de diseno industrial y arquitectura: texturizar rapidamente maquetas 3D para presentaciones antes de invertir en texturizado manual.
- Realidad aumentada y virtual: producir mallas texturizadas listas para motores como Unity o Unreal mediante exportacion a GLB.
- Investigacion en grafos de difusion 3D: servir como referencia reproducible para comparar variantes de texturizado multi-vista dentro del ecosistema `diffusers-3d`.
- Automatizacion de generacion de variantes: al aceptar una imagen de referencia arbitraria, permite producir distintas texturas para una misma malla cambiando la condicion de imagen, lo que facilita la exploracion de estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en fp16: aproximadamente 5,1 GB (2.567.463.684 parametros multiplicados por 2 bytes), sin contar activaciones, el VAE ni los buffers de render.
- Tamano total del repositorio: 15,8 GB, porque incluye todas las carpetas de componentes (UNet, dos codificadores de texto, tokenizers, VAE, adaptadores y scheduler) en disco.
- Ejecucion en CPU o GPU con PyTorch estandar, segun la documentacion del paquete (`diffusers-3d runs every network in plain PyTorch on CPU or GPU`).
- VRAM estimada para inferencia en fp16: no publicada. Como referencia de orden de magnitud, los pesos ocupan unos 5 GB y hay que sumar activaciones y el VAE; una GPU con al menos 12-16 GB de VRAM deberia ser suficiente en fp16, pero es una estimacion, no un dato oficial.
- GPU recomendadas: no especificadas por el autor. Por tamano, tarjetas consumer como RTX 4090 o RTX 3090 (24 GB) y GPUs de datacenter tipo A100 o H100 son candidatas razonables; no hay confirmacion oficial.
- Despliegue: el metodo soportado es el paquete `diffusers-3d` sobre PyTorch, instalado desde el repositorio de GitHub del autor. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de pipeline de difusion.
- Backends opcionales: `gsplat` para Gaussian splats y CuMesh para la malla PBR de TRELLIS.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni de contexto de modelos alternativos, por lo que la comparacion se limita a lo verificable.

| Modelo | Relacion | Parametros | Formato | Licencia |
|---|---|---|---|---|
| Step1X-3D-Texture-diffusers-3d (este) | Conversion al ecosistema diffusers-3d | 2.567.463.684 | safetensors | openrail++ (componentes con licencias propias) |
| stepfun-ai/Step1X-3D (base) | Modelo original de StepFun del que derivan los adaptadores | no disponible | no disponible | no disponible en la informacion facilitada |
| TRELLIS.2 | Mencionado por el autor como destino compatible de malla PBR via CuMesh | no disponible | no disponible | no disponible |
| SyncMVD | Referencia metodologica para la sincronizacion de textura multi-vista | no disponible | no disponible | MIT (segun el README) |

No se dispone de benchmarks ni de especificaciones comparables para completar una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio muy reciente y practicamente sin validacion de la comunidad: cero descargas y cero likes en el momento de redactar la ficha, por lo que no hay evidencia externa de calidad o estabilidad.
- No es un modelo entrenado por el autor del repositorio, sino una conversion; posibles discrepancias con el comportamiento del pipeline original de Step1X-3D solo estan cubiertas por los tests de paridad del paquete, que el usuario debe ejecutar por su cuenta.
- Solo genera textura; no genera geometria. Necesita una malla de entrada (por ejemplo, la salida de un pipeline de geometria independiente) y una imagen RGBA de referencia.
- La textura generada es base-color, no PBR completa en este pipeline; la malla PBR de TRELLIS.2 requiere el backend CuMesh, fuera del flujo estandar.
- Riesgo de alucinacion visual y de inconsistencias entre las seis vistas, inherente a los modelos de difusion, especialmente con referencias ambiguas o de baja calidad.
- Restricciones de licencia: el repositorio declara openrail++ pero combina pesos con licencias distintas. El componente SDXL queda sujeto a la CreativeML Open RAIL++-M, que incluye restricciones de uso; conviene revisar `LICENSE-SDXL.md`, `LICENSE-APACHE-2.0`, `NOTICE` y `LICENSE-MIT` antes de un uso comercial.
- El repositorio no esta afiliado ni respaldado por StepFun ni por Stability AI, segun el propio README.
- No se declaran idiomas soportados para la condicion de texto; el texto se procesa con los tokenizers CLIP de SDXL, que estan optimizados para ingles.
- Requiere instalar el paquete `diffusers-3d` desde GitHub y, opcionalmente, dependencias nativas (`gsplat`, CuMesh), lo que anade complejidad de despliegue frente a un pipeline Diffusers convencional.
- No esta pensado para tareas de texto, razonamiento, codigo ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suvadityamuk/Step1X-3D-Texture-diffusers-3d
- Modelo base (StepFun): https://huggingface.co/stepfun-ai/Step1X-3D
- Repositorio del paquete diffusers-3d: https://github.com/suvadityamuk/diffusers-3d
- Pipeline de geometria complementario: https://huggingface.co/suvadityamuk/Step1X-3D-Geometry-1300m-diffusers-3d
- SDXL base 1.0 (componentes UNet/CLIP): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE fp16 fix: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
