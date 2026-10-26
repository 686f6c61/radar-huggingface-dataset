# twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4

## Resumen

Nemotron-3.5-Rerank-8B-pulsar-k4 es un contenedor listo para servir del reranker `nvidia/Nemotron-3.5-Rerank-8B-BF16` de NVIDIA, publicado por el usuario twaggs88 (autor del motor de inferencia pulsar) bajo licencia OpenMDW-1.1. No es un modelo nuevo: es una cuantización EXL3 a 4.0 bits por peso del tronco de texto del reranker original, con la cabeza de puntuación, los embeddings de tokens y las normas conservadas en BF16 tal como las distribuye NVIDIA. El objetivo es ejecutar un reranker de 8B en GPUs modestas, en concreto Turing (sm_75), donde otras alternativas de servicio no llegan.

El modelo base es un reranker multimodal y multilingüe de 8.380 millones de parámetros y 32.768 tokens de contexto que produce un logit de relevancia entre una consulta de texto y un documento (texto, imagen de página o ambos). Esta versión recorta explícitamente la torre de visión y el proyector multimodal: solo puntúa texto. A cambio, ocupa 4,5 GB en disco y unos 5,7 GB de VRAM, con pares consulta-documento de hasta 16.384 tokens.

Su relevancia práctica es doble: permite añadir una etapa de reordenación neuronal a un pipeline RAG en hardware antiguo o de gama media, y oficia como ejemplo de cuantización agresiva con verificación numérica publicada por el autor (desviación máxima de 0,0029 frente a los mismos pesos en f32 y de −0,006 a +0,032 frente al BF16 original). No incluye benchmarks estándar ni comparativas públicas con otros rerankers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Mistral 3 / Ministral-3-8B) con cabeza de puntuación de relevancia; el modelo original es multimodal (texto + visión), esta versión solo texto |
| Parametros totales | 4.250.492.928 en los safetensors del repositorio (tronco de texto cuantizado, sin torre de visión); el modelo base completo declara 8.380 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 16.384 tokens por par consulta-documento en este contenedor |
| Tipos de cuantizacion | Peso EXL3 de 4.0 bpw en las lineales del decoder (atención q/k/v/o, MLP gate/up/down); cabeza de puntuación, embeddings y normas en BF16; calibración con exllamav3 1.6.4 (250 × 2048 filas, codebook `mul1`) |
| Idiomas soportados | multilingüe segun NVIDIA; lista concreta de idiomas no disponible |
| Licencia | OpenMDW-1.1 (etiqueta `license: other`); el modelo base Ministral-3-8B-Instruct-2512 es Apache-2.0 |
| Formato de pesos | safetensors repackados en el contenedor propio de pulsar (`custom_code`), con `SHA256SUMS`; no hay GGUF ni pesos BF16 completos |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Mistral 3 (heredero de Ministral-3-8B-Instruct-2512, Apache-2.0) al que NVIDIA añade una cabeza de regresión que emite un único logit de relevancia por par consulta-documento. El entrenamiento lo realizó NVIDIA; esta ficha no dispone del número de tokens, la composición del dataset ni el detalle de las etapas de ajuste (SFT, RLHF o DPO) empleadas. La variante multimodal del original acepta imágenes de página, gráficos y tablas junto al texto.

El trabajo de twaggs88 es de compresión y empaquetado, no de entrenamiento: cuantiza las lineales del decoder a EXL3 4.0 bpw con exllamav3 1.6.4 y reempaqueta los pesos byte a byte en el formato de pulsar, eliminando la torre de visión y el proyector multimodal. La validación numérica publicada compara 17 pares consulta-documento de hasta 5.100 tokens: frente a los mismos pesos EXL3 evaluados en f32 sobre CPU la diferencia máxima de puntuación es de 0,0029, y frente al BF16 original en f32 oscila entre −0,006 y +0,032, sin cambios en el orden de los documentos. La cabeza de puntuación permanece en BF16 y la puntuación final es la sigmoide del logit (o el logit en crudo con `"raw_scores": true`).

## Capacidades

- Reordenación de documentos (reranking) texto-texto: asigna una puntuación de relevancia a cada par consulta-pasaje.
- Integración como segunda etapa tras un retrieval por embeddings, para reordenar el top-N de candidatos.
- Puntuación de fragmentos largos: hasta 16.384 tokens por par, útil para pasajes completos o secciones extensas.
- Capacidad multilingüe heredada del modelo base de NVIDIA (sin lista de idiomas publicada para este contenedor).
- Servicio HTTP compatible con la forma Cohere/Jina en `POST /v1/rerank`, con parámetros `top_n` y `raw_scores`.
- Soporte de tool calling / function calling: no disponible (el modelo no genera texto, solo puntúa).
- Soporte de agentes y razonamiento multi-paso: no disponible por diseño.
- Visión y multimodalidad: no incluidas en este contenedor (torre de visión y proyector eliminados); disponibles solo en el modelo base de NVIDIA.
- Capacidad especial: ejecución en GPUs Turing (sm_75), que quedan fuera del soporte de la mayoría de motores de inferencia modernos.

## Casos de uso

- Reordenación de resultados en un RAG corporativo: tras recuperar el top-30 con búsqueda híbrida, este contenedor reordena los candidatos y, segun la medición del autor sobre 22 preguntas de sus documentos internos, eleva el MRR de documentos de 0,80 a 0,93. Es el escenario para el que se publicó.
- Búsqueda documental en hardware heredado: equipos con Quadro RTX 5000 u otras tarjetas Turing pueden servir el reranker junto a un modelo de embeddings en un único proceso pulsar, con 12,6 GB de los 16 GB de la tarjeta cubriendo reranker, embedder y parser.
- Filtrado de contexto para LLM: reordenar y truncar pasajes antes de inyectarlos en el prompt de un generador, reduciendo tokens de contexto y ruido en la respuesta.
- Atención al cliente sobre base de conocimiento: puntuar artículos o fragmentos de manual frente a la consulta del usuario para mostrar primero el más relevante en un buscador de soporte.
- Deduplicación y priorización de resultados en buscadores internos: usar la puntuación continua para cortar la cola de candidatos poco relevantes, con umbral reajustado a la escala real del modelo.
- Evaluación de calidad de un índice de embeddings: comparar el orden previo y posterior al reranking para detectar consultas donde el retrieval falla.
- Procesamiento por lotes offline: puntuar grandes conjuntos de pares en un servidor con una sola GPU de 8-16 GB, sin depender de APIs externas.
- Despliegue aislado en本地... (no: evitar). Mejor: despliegue on-premise con requisitos de soberanía de datos, al no requerir llamadas a servicios externos.

(Nota: sustituir el último punto por "Despliegue on-premise con requisitos de soberanía de datos, al ejecutarse íntegramente en la GPU local sin llamadas a servicios externos.")

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BEIR, MTEB) en la informacion disponible. El autor solo publica una verificación numérica de la cuantización y una medición interna de recuperación:

| Evaluacion (autor) | Referencia | Resultado |
|---|---|---|
| Desviación de puntuación, 17 pares de hasta 5.100 tokens | Mismos pesos EXL3 en f32 sobre CPU | Diferencia máxima 0,0029; orden de documentos sin cambios |
| Desviación de puntuación, 17 pares de hasta 5.100 tokens | Modelo BF16 original en f32 | Rango −0,006 a +0,032; orden de documentos sin cambios |
| MRR de documentos tras reranking del top-30 híbrido | Sin reranking (MRR 0,80) | MRR 0,93 (22 preguntas, conjunto pequeño) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GB, segun el autor.
- Espacio en disco: 4,5 GB de pesos (repositorio de 4,8 GB con ficheros auxiliares).
- GPU probada: Quadro RTX 5000 (Turing, sm_75). El autor indica que solo lo ha servido en Turing y que la compilación debe hacerse con `CUDA_ARCH=sm_75`.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti/4060 Ti, RTX 3070/4070 en adelante), aunque no hay pruebas publicadas en esas arquitecturas.
- Convivencia: los tres contenedores del autor (reranker, Embed-8B y Parse) comparten un único proceso pulsar con 12,6 GB de 16 GB.
- Opciones de despliegue: exclusivamente pulsar, compilado desde la rama `dev` (commit 5139ba62 o posterior) y arrancado con `pulsar-server -m /ruta/al/repo --host 0.0.0.0 --port 8400`. No hay soporte para vLLM, TGI, llama.cpp, Ollama ni LM Studio: los pesos usan un contenedor propio con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4 (este) | 4,25 B almacenados (base 8,38 B) | 16.384 tokens por par (base 32.768) | Solo texto | OpenMDW-1.1 | safetensors en contenedor pulsar; EXL3 4.0 bpw; ~5,7 GB VRAM |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8,38 B | 32.768 tokens | Texto + imagen de página (gráficos, tablas) | OpenMDW-1.1 | safetensors BF16; requiere bastante más VRAM (valor exacto no disponible) |
| twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4 | no disponible | no disponible | Texto | no disponible | Contenedor pulsar; primera etapa de retrieval, no reranking |
| twaggs88/Nemotron-3.5-Parse-pulsar-f16 | no disponible | no disponible | no disponible | no disponible | Contenedor pulsar en FP16; parseo de documentos |

No se dispone de datos de benchmarks que permitan comparar la calidad de este reranker con alternativas de otros fabricantes; la comparación anterior se limita a especificaciones y formato de despliegue.

## Limitaciones y advertencias

- Sin benchmarks públicos: no hay resultados en BEIR, MTEB ni conjuntos de reranking estandar, solo una medición interna sobre 22 preguntas.
- Escala de puntuaciones atípica: los pasajes relevantes puntúan entre 0,06 y 0,17 y los irrelevantes alrededor de 0,02. Un umbral de 0,1 heredado de otro reranker descarta la mayoría de resultados correctos.
- Pérdida de multimodalidad: la torre de visión y el proyector están eliminados, por lo que no puede puntuar imágenes de página, gráficos ni tablas, a diferencia del modelo de NVIDIA.
- Contexto por par reducido a la mitad: 16.384 tokens frente a los 32.768 del original.
- Dependencia de un motor no estándar: requiere compilar pulsar desde la rama `dev` (commit 5139ba62 o posterior); no funciona con vLLM, TGI, llama.cpp ni Ollama. El autor solo lo ha validado en Turing.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; el propio ecosistema pulsar se describe como experimental en otros repositorios del mismo autor.
- Riesgo de alucinación: bajo en el sentido generativo (el modelo no produce texto libre), pero puede asignar puntuaciones altas a documentos léxicamente solapados y poco relevantes; se recomienda calibrar el umbral con datos propios.
- Sesgos: no documentados por el autor; al no publicarse la composición del dataset de entrenamiento de NVIDIA, no es posible evaluar sesgos de dominio o idioma.
- Idiomas: capacidad multilingüe declarada por NVIDIA, pero sin lista de idiomas ni evaluación por idioma para este contenedor.
- Licencia: OpenMDW-1.1 no es Apache-2.0; aunque el modelo base Ministral-3-8B-Instruct-2512 lo sea, los términos aplicables son los de OpenMDW-1.1. Revisar `LICENSE`, `NOTICE` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace de este contenedor: https://huggingface.co/twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo base de Ministral en HuggingFace: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Motor de inferencia pulsar: https://github.com/tylerwagler/pulsar
- Pagina de NVIDIA NIM del modelo: https://build.nvidia.com/nvidia/nemotron-3_5-rerank-8b
- Contenedor hermano de embeddings: https://huggingface.co/twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4
- Contenedor hermano de parseo: https://huggingface.co/twaggs88/Nemotron-3.5-Parse-pulsar-f16
- Contenedor del modelo Super-VL en pulsar: https://huggingface.co/twaggs88/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-pulsar-k4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Ficha de referencia del modelo: https://www.llmreference.com/model/nemotron-3.5-rerank-8b
- Ficha en MindStudio: https://www.mindstudio.ai/models/nemotron-3-5-rerank-8b
