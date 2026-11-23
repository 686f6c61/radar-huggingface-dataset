# tencent/WePocketModel1.0-4B

## Resumen

WePocketModel 1.0 4B (WePM) es un modelo vision-lenguaje desarrollado por WeChat AI (Tencent) y orientado a aplicaciones en dispositivo (on-device). Su propuesta central es unificar en un mismo backbone y un mismo codificador visual tres capacidades distintas: generacion de texto a partir de texto e imagenes, generacion de embeddings multimodales y emision de decisiones estructuradas (eleccion entre opciones, puntuaciones ordinales o juicios binarios). Esto lo diferencia de los VLM convencionales, que solo generan texto.

El checkpoint de este repositorio contiene 4.539.265.536 parametros en formato safetensors (BF16 en CUDA, FP32 en CPU) y forma parte de una familia que incluye variantes de 2B y versiones GGUF. La arquitectura se etiqueta como `qwen3_5` en Hugging Face, con un codificador visual compartido y una tecnica propia de asignacion de tokens visuales denominada Multi-Granularity Visual Budgeting (MGVB).

Su relevancia actual reside en el diseno para entornos con recursos limitados: el proyecto recomienda 16 GB de VRAM para inferencia en CUDA o 24 GiB de memoria de sistema para CPU, y ofrece embeddings Matryoshka (MRL) truncables a 64, 128, 256, 512, 1024 o 2048 dimensiones, lo que permite ajustar coste y precision en recuperacion multimodal sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con backbone y codificador visual compartidos; MGVB para asignacion de tokens visuales |
| Parametros totales | 4.539.265.536 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (CUDA), FP32 (CPU); versiones GGUF publicadas en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (5 shards + `unimodel_aux.safetensors`); GGUF en repo aparte |

## Arquitectura y entrenamiento

WePM emplea un backbone unico y un codificador visual compartido que alimentan tres cabezas funcionales: generacion, embedding y decision. La innovacion principal documentada es Multi-Granularity Visual Budgeting (MGVB), que reparte los tokens visuales entre vistas global, regional y de grano fino; de este modo el modelo puede ajustar el coste computacional visual segun la tarea. El runtime reserva ademas "slots" aprendidos separados para las tareas de embedding y decision, lo que evita que estas interfieran con la generacion.

En el plano de los embeddings, incorpora Matryoshka Representation Learning (MRL): la proyeccion se normaliza en L2 y se puede truncar a prefijos de 64, 128, 256, 512, 1024 o 2048 dimensiones (2048 es la dimension completa del checkpoint de 4B). El modelo se distribuye con codigo de inferencia propio (runtime WePM) para CUDA y CPU, con scripts de ejemplo para generacion, embedding y decision. No se han proporcionado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por texto, imagen o secuencias intercaladas de texto e imagen (OCR, captioning, VQA).
- Embeddings multimodales L2-normalizados para recuperacion y ranking de candidatos, con dimension truncable via MRL (64 a 2048).
- Decision estructurada: seleccion entre opciones, puntuaciones ordinales y juicios binarios sobre el estado de una aplicacion.
- Procesamiento de entradas intercaladas texto-imagen en una sola llamada.
- Inferencia en GPU (BF16) y en CPU (FP32) con el mismo runtime.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes o modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Recuperacion multimodal en aplicaciones locales: indexar imagenes y texto con embeddings de 256 o 512 dimensiones (MRL) para busqueda por similitud en un dispositivo, reduciendo memoria y latencia frente a la dimension completa de 2048.
- Clasificacion y ranking de candidatos en el dispositivo: usar la cabeza de embedding para puntuar pares consulta-documento o consulta-imagen sin depender de un servicio remoto.
- Automatizacion de flujos con decisiones estructuradas: evaluar el estado de una aplicacion y devolver una opcion entre varias o un juicio binario antes de disparar una accion, con validacion previa por parte del desarrollador.
- OCR y extraccion de texto de imagenes en local: el modelo genera texto a partir de imagenes, adecuado para digitalizar documentos en entornos sin conectividad.
- Asistencia visual conversacional: responder preguntas sobre imagenes capturadas por la camara del dispositivo en aplicaciones de soporte o accesibilidad.
- Descripcion automatica de imagenes (captioning) para organizar bibliotecas fotograficas o generar metadatos en pipelines de gestion documental.
- Enrutamiento multimodal en agentes: combinar la salida de decision con la de generacion para decidir si una consulta requiere analisis visual o respuesta textual.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de la familia WePM en tareas de embedding, generacion y decision, pero no se proporcionan cifras numericas en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el proyecto recomienda al menos 16 GB de GPU para inferencia en CUDA en BF16; el uso real depende de las entradas, de los tokens generados y del overhead del runtime.
- Memoria de sistema: al menos 24 GiB para inferencia en CPU en FP32.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por el umbral de 16 GB encajan tarjetas de gama alta de consumo como la RTX 4090 (24 GB) y GPUs de datacenter tipo A100 o H100.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 16 GB o mas de VRAM; no confirmado por el autor para modelos concretos.
- Opciones de despliegue: runtime propio de WePM (PyTorch 2.10.0 + torchvision 0.25.0 para CUDA 12.8), con scripts para GPU y CPU; versiones GGUF publicadas en `tencent/WePocketModel1.0-4B-GGUF` (compatibles con herramientas de inferencia GGUF, aunque no se detalla el soporte).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WePocketModel 1.0 4B | 4,54B | no disponible | VLM unificado: generacion + embedding + decision | no disponible | safetensors y GGUF en HF |
| WePocketModel 1.0 2B | no disponible | no disponible | Misma familia, menor tamano | no disponible | safetensors y GGUF en HF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos competidores que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible; es imprescindible confirmarla antes de cualquier uso comercial.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingue es incierto.
- El modelo puede producir salidas incorrectas o alucinaciones; el autor recomienda evaluar la calidad sobre entradas representativas.
- Las decisiones estructuradas deben validarse antes de usarse para disparar acciones, segun advierte el propio proyecto.
- La longitud de contexto no esta publicada, lo que limita la planificacion de cargas con documentos o conversaciones largas.
- El acceso al repositorio puede requerir autenticacion en Hugging Face (`hf auth login`), lo que condiciona la descarga automatizada.
- El repo ocupa 9,2 GB; conviene verificar espacio y ancho de banda antes de la descarga completa.
- El runtime es propio del proyecto y requiere clonar el repositorio de GitHub; no se documenta integracion con vLLM, TGI u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WePocketModel1.0-4B
- Version GGUF 4B: https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Version 2B safetensors: https://huggingface.co/tencent/WePocketModel1.0-2B
- Version 2B GGUF: https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guia de ejemplos: https://github.com/Tencent/WePocketModel/blob/main/examples/README.md
- Guia de inferencia: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md
- Hardware y precision: https://github.com/Tencent/WePocketModel#hardware-and-precision-4b
- Paper (arXiv): https://arxiv.org/abs/2611.27365
