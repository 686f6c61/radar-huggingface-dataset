# twaggs88/Nemotron-3.5-Parse-pulsar-f16

## Resumen

Nemotron-3.5-Parse-pulsar-f16 es un contenedor listo para servir del motor de inferencia pulsar, publicado por el usuario twaggs88, que empaqueta el modelo nvidia/Nemotron-3.5-Parse con sus capas Lineales convertidas a f16. El modelo subyacente es un parser de documentos de NVIDIA: recibe la imagen de una página y devuelve su texto junto con clases de layout, cajas delimitadoras y orden de lectura. La arquitectura combina un codificador visual C-RADIOv4-SO400M con un decodificador mBART de 10 capas que consume la secuencia visual como prefijo causal. El total de parámetros es de 628.701.296 y el repositorio ocupa 1,3 GB.

La relevancia de esta ficha no esta en el modelo base (que NVIDIA publica por separado), sino en el formato de despliegue: es una conversión de terceros pensada para ejecutarse en GPUs Turing (sm_75) mediante pulsar, con todas las Lineales en f16 y el resto de tensores en f32 tal como los distribuye NVIDIA. El autor reporta haberlo servido en una Quadro RTX 5000 de 16 GB junto a dos contenedores de 8B, ocupando los tres 12,6 GB. Se trata de una pieza de infraestructura para pipelines de document intelligence y RAG, no de un modelo conversacional.

El interés practico es que permite ejecutar un parser de documentos con salida estructurada en hardware consumer o de gama profesional antigua, con una velocidad reportada de 5,4 s por página y una fidelidad muy alta frente a la ejecución f32 de referencia en transformers (similitud media de Markdown de 0,9997 en 30 páginas de prueba). El contenedor es especifico de pulsar: no es un repositorio transformers estándar ni incluye pesos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual C-RADIOv4-SO400M + decodificador mBART de 10 capas (transformer encoder-decoder con prefijo visual causal) |
| Parametros totales | 628.701.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la generación se limita a 9.000 tokens nuevos; entrada de imagen recomendada de 1664 × 2048) |
| Tipos de cuantizacion | f16 en todas las Lineales (ViT, convoluciones del neck convertidas a Lineales, decodificador) y en el embedding/head atado; f32 en normas, sesgos, class tokens y campo de posiciones. No se distribuyen GGUF ni otras cuantizaciones en este repo |
| Idiomas soportados | No disponible (el decodificador es mBART, multilingüe por diseño; el autor no detalla la lista de idiomas) |
| Licencia | OpenMDW-1.1 (modelo); tokenizer MIT; avisos de terceros en THIRD_PARTY_NOTICES.md |
| Formato de pesos | safetensors, empaquetados como contenedor de pulsar (1,3 GB), con SHA256SUMS |

## Arquitectura y entrenamiento

El modelo base es un parser de documentos de NVIDIA con arquitectura encoder-decoder: un codificador visual C-RADIOv4-SO400M procesa la imagen de la página y un decodificador mBART de 10 capas genera la secuencia de salida consumiendo la secuencia visual como prefijo causal. La salida no es texto plano, sino un marcado propio del modelo que codifica texto, clases semánticas de layout y cajas delimitadoras; el autor indica que la conversión a Markdown se realiza a posteriori con `postprocess_document` del paquete `nemotron_parse` del repositorio de NVIDIA. El prompt por defecto son los tokens de tarea `<predict_bbox><predict_classes><output_markdown><predict_text_in_pic>`.

Esta conversión concreta no reentrena ni modifica la semántica: redondea a f16 todas las Lineales desde los f32 originales de NVIDIA y mantiene en f32 normas, sesgos, class tokens y el campo de posiciones. La cabeza MTP (multi-token prediction) de un paso no está incluida, por lo que no hay decodificación especulativa asociada. La decodificación es greedy con penalización de repetición de 1,1, siguiendo la receta de la model card original. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Parseo de documentos: convierte la imagen de una página en texto estructurado con orden de lectura.
- Predicción de layout: asigna clases semánticas a cada región (títulos, párrafos, tablas, figuras, entre otras) y cajas delimitadoras.
- OCR: extrae el texto contenido en la página, incluido el texto embebido en imágenes cuando se activa `predict_text_in_pic`.
- Salida en Markdown: mediante el prompt por defecto y el postprocesado con `postprocess_document`.
- Manejo de tablas y gráficos: la documentación de terceros lo describe como capaz de procesar tablas y charts en documentos multilingües.
- Multilingüe por construcción: el decodificador mBART está diseñado para múltiples idiomas, aunque la lista concreta no se publica en esta ficha.
- Entrada de una sola página por petición: el endpoint `POST /v1/parse` acepta una imagen inline en base64.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: no es un modelo de instrucciones general.

## Casos de uso

- Digitalización de documentación técnica a Markdown: el modelo convierte páginas de normas y manuales (el autor prueba con MIL-HDBK-217F y MIL-STD-461H) en Markdown con orden de lectura, listo para versionar en un repositorio o publicar como documentación interna.
- Ingesta para pipelines RAG: al devolver texto con clases de layout y cajas, permite trocear el documento por secciones reales en lugar de por longitud fija, mejorando la recuperación posterior en sistemas de búsqueda aumentada.
- Extracción de tablas de datasheets: las páginas de hojas de características suelen mezclar tablas y notas al pie; el parseo con bounding boxes permite reconstruir la tabla y vincular cada celda a su región de origen.
- Procesamiento de facturas y formularios escaneados: la combinación de texto y cajas delimitadoras sirve para localizar campos concretos y validar su posición antes de pasarlos a un sistema de contabilidad.
- Enriquecimiento de archivos históricos escaneados: al ejecutarse en una Quadro RTX 5000 a 5,4 s por página, un lote de decenas de miles de páginas es viable en una sola GPU sin depender de servicios externos.
- Accesibilidad documental: generar una versión con estructura semántica (títulos, párrafos, tablas) de PDFs no etiquetados para lectores de pantalla y para motores de indexación.
- Extracción agentica de datos: integrado como paso previo en un agente que consulta documentos, el parser proporciona la representación estructurada sobre la que el agente razona después.
- Cumplimiento y revisión documental on-premise: al ser un contenedor autocontenido de 1,3 GB, se puede desplegar en infraestructura propia sin enviar documentos sensibles a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni métricas de OCR tipo OmniDocBench) en la información disponible. El autor sí publica una comparación de fidelidad frente a la ejecución de referencia de NVIDIA en f32 con transformers, sobre 30 páginas (MIL-HDBK-217F, MIL-STD-461H, datasheets y diapositivas):

| Metrica | Este contenedor en pulsar | Modelo de NVIDIA en fp16 con transformers |
|---|---|---|
| Páginas con tokens idénticos | 24 / 30 | no reportado |
| Páginas con Markdown idéntico | 26 / 30 | 27 / 30 |
| Similitud media de Markdown (peor caso) | 0,9997 (0,9945) | 0,9990 (0,9762) |

Rendimiento medido por el autor en una RTX 5000 limitada a 125 W:

| Metrica | Valor |
|---|---|
| Tiempo medio por página | 5,4 s |
| Tiempo de visión por página | ~2 s |
| Velocidad de decodificación | 255-375 tokens/s |
| Tokens nuevos máximos por página | 9.000 |

## Requisitos de hardware

- VRAM: los pesos ocupan 1,3 GB en disco (f16 en Lineales, f32 en normas y sesgos); el consumo en ejecución no se detalla, pero el autor ejecuta este contenedor junto a dos modelos de 8B en un total de 12,6 GB de 16 GB, lo que deja un margen amplio para este componente.
- GPU validadas: Quadro RTX 5000 (Turing, sm_75). El autor indica explícitamente que solo lo ha servido en Turing.
- GPU consumer: cabe con holgura en cualquier GPU con 8 GB o más; no se han publicado pruebas en Ada, Ampere ni Hopper.
- Compilación: requiere construir pulsar desde la rama `dev` (cualquier commit desde `5139ba62`) con `make pulsar-server CUDA_ARCH=sm_75` para Turing.
- Despliegue: exclusivamente mediante `pulsar-server -m /ruta/al/repo --host 0.0.0.0 --port 8400`. No se distribuyen pesos para vLLM, TGI, llama.cpp ni Ollama; para esos motores habría que partir del modelo base de NVIDIA y su receta en transformers.
- Memoria de imagen: renderizar las páginas a 1664 × 2048, el máximo recomendado por la model card, para evitar pérdida de calidad en el OCR.
- Latencia: ~5,4 s por página en RTX 5000 a 125 W, con ~2 s de codificación visual y el resto de decodificación; no se reporta throughput con batching (el endpoint procesa una página por petición).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twaggs88/Nemotron-3.5-Parse-pulsar-f16 | 628,7 M | imagen 1664 × 2048, hasta 9.000 tokens nuevos | f16 (Lineales) + f32 | OpenMDW-1.1 | Contenedor pulsar, 1,3 GB, 0 descargas |
| nvidia/Nemotron-3.5-Parse | 628,7 M (misma arquitectura) | misma | f32 / BF16 original | OpenMDW-1.1 | Pesos oficiales en HuggingFace, ejecutable con transformers |
| twaggs88/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-pulsar-k4 | 120B totales, 12B activos (MoE) | no disponible | EXL3 4,0 bpw + drafter LiLiCorr | no disponible en la información | Contenedor pulsar para DGX Spark (GB10), 59 GB, marcado como experimental |
| twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4 y Rerank-8B-pulsar-k4 | 8B | no disponible | k4 (cuantizado) | no disponible en la información | Contenedores pulsar complementarios, pensados para compartir proceso con este parser |

La comparación relevante es contra el modelo original de NVIDIA: misma arquitectura y mismo tamaño, pero aquel se distribuye en f32/BF16 para transformers y este en f16 para pulsar. Frente al contenedor Super-VL de 120B del mismo autor, este parser es dos órdenes de magnitud más pequeño y resuelve una tarea especializada (parseo de página) en lugar de visión-lenguaje general.

## Limitaciones y advertencias

- Modelo especializado: solo hace parseo de imagen de documento a texto estructurado; no mantiene conversaciones, no razona y no soporta tool calling.
- Cabeza MTP excluida: no hay decodificación especulativa, por lo que la latencia es la de un decodificador autorregresivo de 10 capas sin aceleración adicional.
- Validación limitada: la comparación de calidad cubre 30 páginas de un dominio concreto (documentación técnica militar, datasheets y diapositivas); no hay evidencia publicada sobre otros dominios, idiomas o calidad de escaneo.
- Riesgo de alucinación en OCR: como todo modelo generativo aplicado a imagen, puede producir texto plausible que no aparece en la página, especialmente en escaneos ruidosos o tablas densas; conviene validar campos críticos contra la imagen.
- Dependencia de un motor propio: el contenedor solo funciona con pulsar, compilado desde la rama `dev`; no hay soporte para vLLM, TGI o llama.cpp, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; es una conversión de terceros no auditada por NVIDIA.
- Licencia: OpenMDW-1.1 permite uso comercial según los términos publicados por OpenMDW, pero hay que revisar `LICENSE`, `TOKENIZER_ATTRIBUTION.md` y `THIRD_PARTY_NOTICES.md` antes de desplegar en producción; la model card de HuggingFace etiqueta la licencia como `other`.
- Idiomas: la lista de idiomas soportados no está publicada; el comportamiento multilingüe se infiere del decodificador mBART, no de una evaluación.
- Sin datos de sesgo: la información disponible no incluye evaluación de sesgos ni de privacidad; la model card de NVIDIA sobre sesgo, explicabilidad, privacidad y seguridad se conserva en `NVIDIA_MODEL_CARD.md` dentro del repositorio.
- Límite de salida: 9.000 tokens nuevos por página; páginas muy densas pueden truncarse (`finish_reason` lo indicaría).

## Enlaces

- Repositorio del contenedor: https://huggingface.co/twaggs88/Nemotron-3.5-Parse-pulsar-f16
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Motor de inferencia pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-parse/modelcard
- Artículo sobre el lanzamiento de la familia Nemotron 3.5: https://www.unite.ai/nvidia-debuts-open-nemotron-3-5-models-for-embedding-reranking-parsing/
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/nemotron-3-5-parse/
- Contenedor hermano Super-VL 120B: https://huggingface.co/twaggs88/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-pulsar-k4
- Contenedor hermano Embed-8B: https://huggingface.co/twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4
- Contenedor hermano Rerank-8B: https://huggingface.co/twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4
