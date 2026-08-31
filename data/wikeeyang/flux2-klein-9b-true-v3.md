# wikeeyang/Flux2-Klein-9B-True-V3

## Resumen

Flux2-Klein-9B-True-V3 es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por wikeeyang como un ajuste fino (finetune) del modelo base black-forest-labs/FLUX.2-klein-9B de Black Forest Labs. El modelo resuelve los problemas de calidad estetica y composicion que presentaban las versiones anteriores V1 y V2, ofreciendo una mejora notable en la fidelidad de la generacion, la edicion por instrucciones y la edicion regional con mascaras.

Se trata de un modelo de 9.078 millones de parametros basado en una arquitectura transformer de flujo rectificado (rectified flow transformer), con soporte para multiples formatos de cuantizacion (fp8, int8, int4_convrot) y compatibilidad con herramientas del ecosistema como ComfyUI, diffusers y GGUF. Esta disponible bajo licencia Apache-2.0, aunque el autor advierte que debe respetarse la licencia no comercial de Black Forest Labs para el modelo base.

El modelo destaca por su capacidad de edicion de imagenes mediante solo instrucciones de texto, intercambio de rostros con LoRA, y edicion regional precisa usando mascaras, todo ello con una perdida de calidad minima al aplicar cuantizacion. Su relevancia actual radica en ofrecer una alternativa de alto rendimiento para flujos de trabajo de generacion y edicion de imagenes en entornos con recursos limitados, gracias a las versiones cuantizadas que permiten ejecutar el modelo completo en 4-6 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) |
| Parametros totales | 9.078.581.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8, int8 (int8mixedrow, INT8-ConvRot), int4_convrot, GGUF |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 (con restriccion no comercial del modelo base FLUX.2-klein-9B) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de FLUX.2-klein-9B, un transformer de flujo rectificado de 9 mil millones de parametros disenado para generacion de imagenes. El ajuste fino realizado por wikeeyang se centra en mejorar la estetica, la composicion y la adherencia al prompt, corrigiendo los defectos observados en las versiones V1 y V2. No se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO en la informacion disponible.

La innovacion principal del modelo radica en su compatibilidad con multiples esquemas de cuantizacion optimizados, incluyendo el formato int4_convrot desarrollado en colaboracion con Comfy-Org, que permite ejecutar el modelo completo en configuraciones de muy baja VRAM (4-6 GB). Tambien se ofrece una version int8 que, segun el autor, es aproximadamente el doble de rapida que la version fp8.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales detalladas.
- Edicion de imagenes mediante instrucciones en lenguaje natural sin necesidad de mascaras.
- Intercambio de rostros (faceswap) y cambio de vestimenta (try-on/try-off) combinando el modelo con LoRA especificos como bfs_head_v1.
- Edicion regional precisa de imagenes utilizando mascaras junto con LoRA.
- Soporte multilingue para prompts en ingles y chino.
- Compatibilidad con multiples formatos de cuantizacion (fp8, int8, int4_convrot, GGUF) para adaptarse a diferentes capacidades de hardware.
- Integracion con ComfyUI mediante nodos oficiales, el plugin UniBlockSwap para baja VRAM y el plugin Dif_GGUF para formatos GGUF.

## Casos de uso

- Edicion fotografica profesional: el modelo permite modificar elementos especificos de una imagen mediante instrucciones de texto, como cambiar la ropa de una persona, anadir accesorios o alterar el fondo, manteniendo el resto de la imagen intacta. Es adecuado para estudios de fotografia y disenadores que necesitan iterar rapidamente sobre conceptos visuales.

- Generacion de contenido para marketing y publicidad: su capacidad para producir imagenes de alta calidad estetica con una composicion mejorada lo hace util para crear materiales visuales para campanas publicitarias, redes sociales y diseno grafico, tanto en ingles como en chino.

- Intercambio de rostros en produccion audiovisual: combinado con LoRA como bfs_head_v1, el modelo puede sustituir rostros en imagenes de forma controlada, aplicable en produccion de video, doblaje visual o restauracion de contenido historico.

- Pruebas de vestuario virtual (try-on): la capacidad de cambiar la vestimenta de una persona en una fotografia mediante prompts textuales permite a tiendas de moda y plataformas de e-commerce mostrar como quedaria una prenda en un modelo sin necesidad de sesiones fotograficas adicionales.

- Edicion regional con mascaras para diseno de producto: el modelo permite modificar areas concretas de una imagen usando mascaras, lo que resulta util para retocar prototipos, cambiar colores de productos o sustituir elementos en ilustraciones tecnicas.

- Flujos de trabajo en hardware limitado: gracias a las versiones cuantizadas y al plugin UniBlockSwap, es posible ejecutar el modelo completo en GPUs de consumo con 4-6 GB de VRAM, lo que permite a disenadores independientes y pequenos estudios generar y editar imagenes sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como FID, CLIP score o comparaciones cuantitativas) en la informacion disponible. El autor proporciona comparaciones visuales cualitativas entre las versiones V1, V2 y V3, asi como entre diferentes niveles de cuantizacion, indicando que la perdida de calidad con cuantizacion es muy baja, pero no se ofrecen metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: 4-6 GB con el plugin UniBlockSwap para el modelo bf16 completo; las versiones cuantizadas int8 e int4_convrot reducen aun mas los requisitos.
- GPU recomendadas: tarjetas consumer de gama media como RTX 3060, RTX 4060, RTX 4090; para produccion profesional se recomiendan GPUs con 16 GB o mas de VRAM.
- Compatible con GPUs consumer de 4-8 GB mediante las versiones GGUF y los plugins de ComfyUI.
- Opciones de despliegue: ComfyUI con nodos oficiales, plugin ComfyUI_UniBlockSwap para baja VRAM, plugin ComfyUI_Dif_GGUF para formatos GGUF, y libreria diffusers de HuggingFace.
- La version int8 es aproximadamente el doble de rapida que la fp8, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|
| Flux2-Klein-9B-True-V3 | 9.078M | fp8, int8, int4, GGUF | Apache-2.0 (no comercial base) | Generacion y edicion de imagenes |
| Flux2-Klein-9B-True-V2 | 9.078M | no disponible | Apache-2.0 (no comercial base) | Generacion y edicion de imagenes |
| Flux2-Klein-9B-True-V1 | 9.078M | no disponible | Apache-2.0 (no comercial base) | Generacion y edicion de imagenes |
| black-forest-labs/FLUX.2-klein-9B | 9.078M | no disponible | Licencia no comercial FLUX | Modelo base de generacion de imagenes |

La comparativa se limita a las versiones anteriores del mismo autor y al modelo base, ya que no se dispone de informacion suficiente sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: aunque el repositorio indica licencia Apache-2.0, el autor advierte explicitamente que el modelo debe usarse bajo la licencia no comercial de Black Forest Labs (FLUX Non-Commercial License), lo que restringe su uso en aplicaciones comerciales.
- Riesgo de alucinacion visual: como cualquier modelo de generacion de imagenes, puede producir artefactos, distorsiones o elementos que no corresponden fielmente al prompt, especialmente en escenas complejas o con multiples objetos.
- Idiomas limitados: aunque soporta ingles y chino, la calidad de los prompts en otros idiomas no esta garantizada.
- Sesgos esteticos: el ajuste fino se ha orientado a mejorar la estetica y composicion, lo que puede introducir sesgos hacia ciertos estilos visuales o tipos de contenido.
- Dependencia del modelo base: las limitaciones de FLUX.2-klein-9B en cuanto a resolucion maxima, estilos o dominios especificos se trasladan a esta version.
- Requisitos de integracion: para aprovechar las capacidades de edicion regional y faceswap es necesario utilizar LoRA adicionales y herramientas especificas de ComfyUI, lo que anade complejidad al flujo de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wikeeyang/Flux2-Klein-9B-True-V3
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Licencia del modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B/blob/main/LICENSE.md
- ModelScope: https://modelscope.cn/models/wikeeyang/Flux2-Klein-9B-True-V3
- Plugin ComfyUI_UniBlockSwap: https://github.com/smthemex/ComfyUI_UniBlockSwap
- Plugin ComfyUI_Dif_GGUF: https://github.com/smthemex/ComfyUI_Dif_GGUF
- ComfyUI-INT8-Fast: https://github.com/BobJohnson24/ComfyUI-INT8-Fast
- Comparativa V1 vs V3: https://www.aimodels.fyi/models/compare/flux2-klein-9b-true-v1-wikeeyang-vs-flux2-klein-9b-true-v3-wikeeyang
- Comparativa V2 vs V3: https://www.aimodels.fyi/models/compare/flux2-klein-9b-true-v2-wikeeyang-vs-flux2-klein-9b-true-v3-wikeeyang
