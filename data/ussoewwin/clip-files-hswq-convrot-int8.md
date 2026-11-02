# ussoewwin/Clip-files-HSWQ-ConvRot-INT8

## Resumen

`ussoewwin/Clip-files-HSWQ-ConvRot-INT8` es un repositorio de pesos cuantizados en INT8 para una coleccion heterogenea de codificadores de texto y modelos CLIP empleados en flujos de difusion (SD 1.5, SDXL, SD3 y FLUX.1), junto con un modelo de lenguaje compacto derivado de Qwen3-0.6B. No se trata de un modelo unico entrenado desde cero, sino de un paquete de artefactos producidos por un pipeline propio de cuantizacion denominado HSWQ (Hybrid-Sensitivity-Weighted-Quantization) con una transformacion rotacional denominada ConvRot. El autor es `ussoewwin`, un desarrollador independiente que publica tanto el marco de cuantizacion como el nodo de carga para ComfyUI.

El problema que aborda es el coste de memoria y de ancho de banda en inferencia de difusion: los codificadores de texto de FLUX.1 (CLIP-L y T5-XXL) y los CLIP de SDXL dominan el consumo de VRAM en muchos pipelines, y reducirlos a INT8 con una perdida de calidad controlada permite ejecutar esos flujos en GPUs con menos memoria. El repositorio incluye seis ficheros con reducciones de tamano declaradas de entre el 27,2 % y el 69,9 % respecto a los originales en FP16 o FP32.

La relevancia actual es doble: por un lado, ofrece alternativas cuantizadas para T5-XXL (11B) y CLIP-L, que son cuellos de botella habituales en FLUX.1; por otro, incluye una auditoria de puertas traseras (backdoor audit) documentada, algo poco frecuente en pesos cuantizados de terceros. El repositorio ocupa 65,3 GB en total y su licencia figura como "other", heredando las condiciones de cada modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete multi-modelo: CLIP ViT-L/14 (texto y vision), Flan-T5 XXL encoder-decoder, Qwen3-0.6B (transformer decoder-only) |
| Parametros totales | Variable por fichero: ~123M (CLIP ViT-L/14), ~11B (Flan-T5 XXL), ~0,6B (Qwen3-0.6B) |
| Parametros activos | No aplica (ninguno de los componentes es MoE) |
| Longitud de contexto | No disponible de forma agregada; CLIP-L original 77 tokens, variantes LongCLIP extendidas; T5-XXL y Qwen3-0.6B segun sus modelos base (no especificado en la model card) |
| Tipos de cuantizacion | INT8 con rotacion ConvRot y ponderacion por sensibilidad (HSWQ) |
| Idiomas soportados | No disponible |
| Licencia | other (hereda MIT para CLIP y variantes zer0int, Apache-2.0 para Flan-T5 XXL y Qwen3-0.6B) |
| Formato de pesos | safetensors |

Tabla de artefactos incluidos:

| Fichero | Arquitectura | Base | Tamano INT8 | Base FP16/FP32 | Reduccion |
|---|---|---|---|---|---|
| `clip_l_hswq_convrot_int8.safetensors` | CLIP ViT-L/14 (FLUX.1 CLIP-L) | comfyanonymous/flux_text_encoders | ~142,0 MB | ~246,1 MB | ~42,3 % |
| `CLIP-SAE-ViT-L-14-hswq_convrot_int8.safetensors` | CLIP ViT-L/14 texto + vision (SAE) | zer0int/CLIP-SAE-ViT-L-14 | ~690,9 MB | ~1,71 GB | ~59,6 % |
| `Long-ViT-L-14-BEST-GmP-smooth-ft-full_hswq_convrot_int8.safetensors` | CLIP ViT-L/14 texto extendido + vision | zer0int/LongCLIP-GmP-ViT-L-14 | ~514,4 MB | ~1,71 GB | ~69,9 % |
| `ViT-L-14-BEST-smooth-GmP-HF-format_hswq_convrot_int8.safetensors` | CLIP ViT-L/14 (layout HF) texto + vision | zer0int/CLIP-GmP-ViT-L-14 | ~678,1 MB | ~931,4 MB | ~27,2 % |
| `flan_t5_xxl_hswq_convrot_int8.safetensors` | Flan-T5 XXL (11B) encoder + decoder | google/flan-t5-xxl | ~14,74 GB | ~22,53 GB | ~34,6 % |
| `Josiefied-Qwen3-0.6B-abliterated-v1_hswq_convrot_int8.safetensors` | Qwen3 0.6B abliterated | Goekdeniz-Guelmez/Josiefied-Qwen3-0.6B-abliterated-v1 | ~687,0 MB | ~1,19 GB | ~42,4 % |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: aplica post-entrenamiento cuantizador sobre pesos existentes. La tecnica HSWQ combina una asignacion de precision ponderada por sensibilidad (las capas o canales mas sensibles conservan mayor fidelidad numerica) con una rotacion de pesos ConvRot, que redistribuye la energia de los canales antes de la cuantizacion para reducir el error de redondeo en INT8. El resultado se serializa en safetensors y se consume mediante un nodo especifico de ComfyUI que reconstruye los pesos y gestiona la precision en tiempo de carga.

Los modelos de origen son: CLIP ViT-L/14 de OpenAI en su distribucion para FLUX.1 (`comfyanonymous/flux_text_encoders`), tres variantes de CLIP ViT-L/14 de `zer0int` (con SAE, con smoothing GmP y con contexto extendido LongCLIP), Flan-T5 XXL de Google (11B, encoder-decoder, ajustado con instrucciones) y una version "abliterated" de Qwen3-0.6B de `Goekdeniz-Guelmez` (se eliminan direcciones de rechazo del modelo original). No se documentan tokens de entrenamiento adicionales, datasets ni fases de RLHF/DPO propias, porque no hay entrenamiento implicito en el pipeline.

La innovacion tecnica destacable es la propia cuantizacion: frente a un INT8 ingenuo por tensor, HSWQ decide la sensibilidad por bloque y ConvRot rota los pesos para homogeneizar rangos. La model card incluye ademas una auditoria de puertas traseras con cobertura de pesos y veredictos documentados, un control de integridad relevante cuando se descargan pesos cuantizados de terceros.

## Capacidades

- Extraccion de caracteristicas de texto (embeddings) para pipelines de difusion: los ficheros CLIP-L y T5-XXL producen las representaciones condicionales que consumen SDXL, SD3 y FLUX.1.
- Codificacion de imagen (vision): las variantes `CLIP-SAE`, `LongCLIP-GmP` y `CLIP-GmP` incluyen torre visual, utiles para image-to-image y para calculo de similitud imagen-texto.
- Contexto de texto extendido: la variante LongCLIP permite prompts mas largos que los 77 tokens clasicos de CLIP-L.
- Generacion de texto y razonamiento ligero: el pack de Qwen3-0.6B abliterated es un decoder-only capaz de generar texto, aunque su tamano lo limita a tareas simples.
- Integracion nativa en ComfyUI mediante `Load CLIP`, `DualCLIPLoader`, `TripleCLIPLoader` y el nodo HSWQ dedicado.
- No se documenta soporte de tool calling, function calling, agentes, vision de alta resolucion, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Generacion de imagenes con FLUX.1 en GPUs de 16 GB: sustituir el T5-XXL en FP16 (~22,5 GB) por el pack INT8 (~14,7 GB) reduce la presion de VRAM y permite cargar el transformer de FLUX junto al codificador en una RTX 4090.
- Pipelines SDXL con `DualCLIPLoader`: usar `clip_l` cuantizado junto al codificador de OpenCLIP para recortar el consumo del par de codificadores, manteniendo el flujo estandar de ComfyUI.
- Servicios de inferencia de imagen con muchos usuarios concurrentes: al reducir el peso de los codificadores, caben mas instancias por GPU o se libera memoria para batching del UNet/DiT.
- Busqueda semantica imagen-texto: las variantes con torre visual (`CLIP-GmP`, `CLIP-SAE`) permiten calcular embeddings de imagenes y consultas para recuperacion o filtrado de datasets.
- Etiquetado y curación de datasets de entrenamiento: usar los embeddings CLIP cuantizados para deduplicar o puntuar pares imagen-texto a gran escala con menor coste de memoria.
- Experimentacion con contexto de prompt largo: la variante LongCLIP cuantizada permite probar prompts de mas de 77 tokens en flujos SDXL sin cargar el CLIP original en FP32.
- Prototipado de asistentes ligeros o clasificadores de texto: el pack Qwen3-0.6B INT8 (~687 MB) sirve para tareas de generacion corta o etiquetado en entornos con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta medidas de tamano de fichero y porcentajes de reduccion, no metricas de calidad (CLIP score, FID, perplejidad ni exactitud en tareas downstream) comparadas con los originales en FP16.

## Requisitos de hardware

- VRAM estimada: CLIP-L INT8 ~0,14 GB de pesos; variantes CLIP ViT-L/14 completas ~0,5-0,7 GB; Flan-T5 XXL INT8 ~14,7 GB; Qwen3-0.6B INT8 ~0,7 GB. A ello hay que sumar activaciones y el resto del pipeline de difusion.
- GPU recomendadas: para FLUX.1 con T5-XXL INT8, RTX 4090 (24 GB), A100 40/80 GB o H100; para SDXL con CLIP-L INT8, basta una RTX 3060 12 GB o superior.
- Cabe en GPU de consumo: si para los packs CLIP y Qwen3-0.6B (cualquier GPU de 8 GB o mas); el pack T5-XXL INT8 requiere al menos 16-24 GB si se carga junto al modelo de difusion.
- Opciones de despliegue: ComfyUI con los nodos `CLIPLoader`, `DualCLIPLoader`, `TripleCLIPLoader` y el nodo `ComfyUI-HSWQ-Loader-and-Tools`; la model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato INT8 con ConvRot requiere el cargador especifico.
- Latencia y throughput: no disponibles. La model card advierte que algunas rutas de carga de ComfyUI no aplican realmente los pesos INT8 (por ejemplo, `Load CLIP` simple y `DualCLIPLoader` para `clip_l`), por lo que el rendimiento efectivo depende de la ruta elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clip-files-HSWQ ConvRot INT8 (este repo) | Variable (0,6B-11B) | Segun base | INT8 HSWQ + ConvRot | other (heredada) | HuggingFace, requiere cargador HSWQ |
| comfyanonymous/flux_text_encoders | CLIP-L + T5-XXL | 77 tokens (CLIP) | FP16/BF16 | Segun componente | HuggingFace, ComfyUI nativo |
| google/flan-t5-xxl | 11B | No disponible | FP32/FP16 | Apache-2.0 | HuggingFace, transformers |
| zer0int/CLIP-GmP-ViT-L-14 | ~123M | 77 tokens | FP16 | MIT | HuggingFace, ComfyUI |

La ventaja diferencial del repositorio es el menor tamano en disco y VRAM con licencias heredadas permisivas en la mayoria de componentes; la desventaja es la dependencia de un cargador no estandar y la ausencia de metricas de calidad publicadas frente a los originales.

## Limitaciones y advertencias

- No hay datos publicados de degradacion de calidad: se desconoce el impacto de INT8+ConvRot en CLIP score, fidelidad de prompt o calidad de imagen final.
- La licencia figura como "other": es imprescindible revisar las condiciones de cada modelo base antes de uso comercial, en particular la variante "abliterated" de Qwen3 y las variantes de `zer0int`.
- El modelo Qwen3-0.6B "abliterated" ha eliminado mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado o inseguro sin filtros adicionales.
- Riesgo de alucinacion en el componente de lenguaje (Qwen3-0.6B) por su tamano reducido; no es adecuado para tareas de razonamiento complejo.
- La model card advierte explicitamente de que varias rutas de carga de ComfyUI no aplican los pesos INT8 (caso de `Load CLIP` simple y `DualCLIPLoader` para `clip_l`), lo que puede provocar que el usuario crea estar usando el modelo cuantizado cuando no es asi.
- Dependencia de un nodo de terceros (`ComfyUI-HSWQ-Loader-and-Tools`) no auditado de forma independiente; la auditoria de puertas traseras la firma el propio autor.
- Cero descargas y un solo "like" en el momento de la consulta: sin validacion comunitaria significativa.
- Idiomas soportados no declarados; el comportamiento multilingue depende de los modelos base (T5 y Qwen3 son multilingues, CLIP-L esta centrado en ingles).
- Repositorio de 65,3 GB: la descarga completa es costosa y conviene bajar solo el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ussoewwin/Clip-files-HSWQ-ConvRot-INT8
- Framework de cuantizacion HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Nodo ComfyUI HSWQ Loader and Tools: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Mediciones de rutas de carga INT8: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/ClipFiles_INT8_TextEncoder_Load_Path_2026-10-28.md
- Veredictos de auditoria de puertas traseras: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/Backdoor_Audit_Verdicts.md
- CLIP ViT-L/14 original: https://huggingface.co/openai/clip-vit-large-patch14
- Codificadores de texto para FLUX: https://huggingface.co/comfyanonymous/flux_text_encoders
- CLIP-SAE-ViT-L-14: https://huggingface.co/zer0int/CLIP-SAE-ViT-L-14
- CLIP-GmP-ViT-L-14: https://huggingface.co/zer0int/CLIP-GmP-ViT-L-14
- LongCLIP-GmP-ViT-L-14: https://huggingface.co/zer0int/LongCLIP-GmP-ViT-L-14
- LongCLIP-L (base declarada): https://huggingface.co/BeichenZhang/LongCLIP-L
- Flan-T5 XXL: https://huggingface.co/google/flan-t5-xxl
- Josiefied Qwen3-0.6B abliterated: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-0.6B-abliterated-v1
- Qwen3-0.6B original: https://huggingface.co/Qwen/Qwen3-0.6B
