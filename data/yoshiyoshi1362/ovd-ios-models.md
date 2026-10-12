# Yoshiyoshi1362/ovd-ios-models

## Resumen

OVD-iOS models es un repositorio de HuggingFace publicado por el usuario Yoshiyoshi1362 que no contiene un modelo único, sino una coleccion de 25 conversiones a Core ML de detectores de objetos de vocabulario abierto (open-vocabulary detection, OVD). Cada directorio del repositorio aloja un modelo independiente, convertido con pesos en int8 para su ejecucion en el dispositivo (on-device) dentro de la aplicacion OVD-iOS. El repo ocupa 9,0 GB en total y su pipeline declarado es object-detection.

Los modelos convertidos pertenecen a cinco familias: Grounding DINO (13 variantes, incluyendo los checkpoints originales de IDEA-Research, los reentrenamientos de iSEE-Laboratory/LLMDet y los modelos multimodales de openmmlab-community), OWL-ViT v1 y OWLv2 (7 variantes de Google), OmDet-Turbo con backbone Swin Tiny (1 variante de OMLab) y Florence-2 en sus versiones base y large (4 variantes). La relevancia de este repositorio es practica: empaqueta detectores zero-shot de referencia en formato Core ML listo para Apple Silicon, evitando al desarrollador el proceso de conversion y cuantizacion.

La licencia es heterogenea y depende de cada modelo: la mayoria son Apache-2.0, mientras que las conversiones de Florence-2 son MIT. El repositorio no publica datos sobre idiomas soportados, numero de parametros ni resultados de benchmarks, por lo que buena parte de las especificaciones deben consultarse en los checkpoints de origen enlazados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: Grounding DINO (DETR-like con encoder de texto), OWL-ViT y OWLv2 (ViT con cabezas de deteccion), OmDet-Turbo (Swin Transformer), Florence-2 (vision-language transformer) |
| Parametros totales | no disponible (variantes tiny, base y large por familia; no se publican recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto autoregresivo) |
| Tipos de cuantizacion | int8 (pesos cuantizados en la conversion a Core ML) |
| Idiomas soportados | no disponible (los detectores Grounding DINO y OWL-ViT aceptan prompts de texto, pero el repo no declara idiomas) |
| Licencia | per-model: Apache-2.0 para Grounding DINO, OWL-ViT, OWLv2 y OmDet-Turbo; MIT para Florence-2 |
| Formato de pesos | Core ML (library_name: coreml; paquetes .mlpackage / .mlmodel) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: se limita a convertir checkpoints preentrenados a Core ML con cuantizacion int8. La model card identifica explicitamente el checkpoint de origen de cada uno de los 25 modelos, de modo que la arquitectura y el regimen de entrenamiento son los de dichos originales. Grounding DINO combina un backbone de imagen con un encoder de texto BERT para deteccion guiada por lenguaje natural y soporta deteccion zero-shot mediante prompts de categorias. OWL-ViT y OWLv2 emplean un Vision Transformer con cabezas de clasificacion y regresion de cajas, siguiendo el paradigma de alineacion imagen-texto de CLIP. OmDet-Turbo usa un backbone Swin Tiny orientado a deteccion abierta eficiente. Florence-2 es un modelo vision-language multitarea que cubre deteccion, captioning y grounding.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en los modelos de origen, mas alla de las variantes de Grounding DINO reentrenadas con los datasets combinados que indican sus propios nombres (O365, GoldG, GRIT, V3Det, OIV6). La innovacion tecnica concreta de este repositorio es la conversion y cuantizacion a int8 para Core ML, que habilita la inferencia en el dispositivo en plataformas Apple.

## Capacidades

- Deteccion de objetos de vocabulario abierto: los modelos Grounding DINO y OWL-ViT/OWLv2 permiten detectar clases no vistas durante el entrenamiento mediante prompts de texto.
- Deteccion zero-shot guiada por lenguaje: las variantes Grounding DINO aceptan consultas en lenguaje natural para localizar objetos por descripcion.
- Deteccion densa y multimodal: las variantes mm_grounding_dino de openmmlab-community amplian el entrenamiento a multiples datasets para mejorar la generalizacion.
- Deteccion abierta eficiente: OmDet-Turbo con Swin Tiny esta disenado para un coste computacional reducido.
- Multitarea vision-language: las variantes Florence-2 (base y large, con y sin fine-tuning) cubren deteccion, captioning y grounding segun la version.
- Inferencia on-device: todas las conversiones estan pensadas para ejecutarse en el dispositivo via Core ML.
- Soporte de tool calling / function calling: no disponible (son modelos de vision, no modelos de lenguaje conversacionales).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas; la dependencia de prompts de texto no implica soporte multilingue verificado).
- Capacidades especiales: verificacion de deteccion con etiquetas textuales; no se documentan modos de pensamiento, audio ni video.

## Casos de uso

- Deteccion on-device en aplicaciones iOS: integrar cualquiera de los modelos Core ML en la app OVD-iOS para localizar objetos en imagenes sin enviar datos a un servidor, aprovechando la cuantizacion int8 para reducir el consumo de memoria.
- Busqueda visual con etiquetas personalizadas: usar Grounding DINO o OWL-ViT para que el usuario escriba una categoria ("taza roja", "perro") y el modelo localice las instancias en la imagen, sin reentrenamiento.
- Clasificacion y filtrado de fotos en el dispositivo: emplear las variantes tiny de OWL-ViT para etiquetar y organizar bibliotecas fotograficas localmente, preservando la privacidad.
- Anotacion asistida de datasets: usar Grounding DINO large o Florence-2 large para preanotar cajas delimitadoras e integrarlas en herramientas de etiquetado, reduciendo el trabajo manual.
- Accesibilidad en aplicaciones moviles: deteccion de objetos en tiempo real a partir de la camara para describir el entorno a usuarios con discapacidad visual, con modelos ligeros por su bajo coste.
- Automatizacion de inventario o retail: detectar productos o elementos en fotografias capturadas con movil mediante OWLv2, que soporta deteccion abierta con las cabezas ensemble.
- Procesamiento por lotes en macOS: usar la version de escritorio de Core ML para ejecutar la deteccion sobre grandes volumenes de imagenes aprovechando la GPU o la Neural Engine de Apple Silicon.
- Investigacion en deteccion abierta: comparar familias (Grounding DINO, OWL-ViT, OmDet-Turbo, Florence-2) bajo una misma plataforma de inferencia y pesos int8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente enumera los checkpoints de origen y sus licencias, y no aporta cifras de AP, mAP ni comparativas cuantitativas. Tampoco se declaran metricas de latencia o throughput de las conversiones a Core ML.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma individual; el repositorio completo ocupa 9,0 GB, pero cada modelo es un subdirectorio independiente cuyo tamano no se detalla.
- GPU recomendadas: al ser Core ML, el objetivo son los SoCs de Apple (serie M y chips A/Iphone/Ipad); no se documentan requisitos para GPU de NVIDIA.
- Encaje en GPU de consumo: los modelos estan disenados para ejecutarse en el dispositivo en iPhone, iPad y Mac con Apple Silicon, y las variantes tiny caben con mas holgura que las base o large.
- Opciones de despliegue: Core ML (libreria declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision en este formato.
- Latencia y throughput estimados: no disponibles. Dependeran del chip, de la variante (tiny/base/large) y del uso de Neural Engine o GPU.

## Comparativa con modelos similares

| Modelo | Familia | Variantes incluidas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OVD-iOS models (este repo) | Grounding DINO, OWL-ViT/OWLv2, OmDet-Turbo, Florence-2 | 25 conversiones | Apache-2.0 y MIT segun modelo | Core ML int8 | Coleccion de conversiones on-device |
| iSEE-Laboratory/llmdet_base, _large, _tiny | Grounding DINO (LLMDet) | 3 | Apache-2.0 | safetensors (origen) | Checkpoints de origen incluidos como conversiones |
| IDEA-Research/grounding-dino-base, -tiny | Grounding DINO | 2 | Apache-2.0 | safetensors (origen) | Referencia original de Grounding DINO |
| google/owlvit y owlv2 | OWL-ViT / OWLv2 | 5 en el repo | Apache-2.0 | safetensors (origen) | Deteccion zero-shot de Google |
| florence-community/Florence-2-base y -large | Florence-2 | 4 en el repo | MIT | safetensors (origen) | Modelo vision-language multitarea |

Los modelos de la columna de origen son precisamente los checkpoints desde los que se han generado las conversiones de este repositorio, por lo que la comparativa real es entre el original (safetensors, alta precision) y la version Core ML int8 (desplegable en Apple). No se dispone de comparativas con otros paquetes de modelos Core ML de deteccion abierta.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; heredados de los datasets de origen (O365, GoldG, GRIT, V3Det, OIV6) que no se describen aqui.
- Riesgo de alucinacion: los detectores de vocabulario abierto pueden producir cajas o etiquetas para objetos que no existen, especialmente con prompts ambiguos y variantes cuantizadas en int8.
- Limitaciones de contexto o idioma: son modelos de vision sin ventana de contexto textual; no se declara soporte multilingue en los prompts de texto.
- Efecto de la cuantizacion: la conversion a int8 puede degradar la precision respecto al checkpoint original; no se publican cifras que cuantifiquen esa perdida.
- Restricciones de licencia: la licencia es por modelo. Las variantes Grounding DINO, OWL-ViT, OWLv2 y OmDet-Turbo son Apache-2.0, mientras que Florence-2 es MIT. Es imprescindible verificar la licencia de cada subdirectorio antes de un uso comercial.
- Caveat de agregacion: al tratarse de un repositorio con 25 modelos, el tamano de 9,0 GB corresponde al conjunto; conviene descargar solo el modelo necesario.
- Gestion de cambios por el autor: al ser un repo con 0 descargas y 0 likes, creado y actualizado en octubre de 2026, no hay evidencia de mantenimiento continuado ni de soporte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Yoshiyoshi1362/ovd-ios-models
- iSEE-Laboratory/llmdet_base: https://huggingface.co/iSEE-Laboratory/llmdet_base
- iSEE-Laboratory/llmdet_large: https://huggingface.co/iSEE-Laboratory/llmdet_large
- iSEE-Laboratory/llmdet_tiny: https://huggingface.co/iSEE-Laboratory/llmdet_tiny
- openmmlab-community/mm_grounding_dino_base_all: https://huggingface.co/openmmlab-community/mm_grounding_dino_base_all
- openmmlab-community/mm_grounding_dino_base_o365v1_goldg_v3det: https://huggingface.co/openmmlab-community/mm_grounding_dino_base_o365v1_goldg_v3det
- openmmlab-community/mm_grounding_dino_large_all: https://huggingface.co/openmmlab-community/mm_grounding_dino_large_all
- openmmlab-community/mm_grounding_dino_large_o365v2_oiv6_goldg: https://huggingface.co/openmmlab-community/mm_grounding_dino_large_o365v2_oiv6_goldg
- openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg
- openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_grit: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_grit
- openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_grit_v3det: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_grit_v3det
- openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det
- IDEA-Research/grounding-dino-base: https://huggingface.co/IDEA-Research/grounding-dino-base
- IDEA-Research/grounding-dino-tiny: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- google/owlvit-base-patch16: https://huggingface.co/google/owlvit-base-patch16
- google/owlvit-base-patch32: https://huggingface.co/google/owlvit-base-patch32
- google/owlvit-large-patch14: https://huggingface.co/google/owlvit-large-patch14
- google/owlv2-base-patch16: https://huggingface.co/google/owlv2-base-patch16
- google/owlv2-base-patch16-ensemble: https://huggingface.co/google/owlv2-base-patch16-ensemble
- google/owlv2-large-patch14: https://huggingface.co/google/owlv2-large-patch14
- google/owlv2-large-patch14-ensemble: https://huggingface.co/google/owlv2-large-patch14-ensemble
- omlab/omdet-turbo-swin-tiny-hf: https://huggingface.co/omlab/omdet-turbo-swin-tiny-hf
- florence-community/Florence-2-base: https://huggingface.co/florence-community/Florence-2-base
- florence-community/Florence-2-base-ft: https://huggingface.co/florence-community/Florence-2-base-ft
- florence-community/Florence-2-large: https://huggingface.co/florence-community/Florence-2-large
- florence-community/Florence-2-large-ft: https://huggingface.co/florence-community/Florence-2-large-ft
