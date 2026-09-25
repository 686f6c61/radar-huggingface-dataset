# weemed/IlhaEmbed

## Resumen

IlhaEmbed es una familia de modelos de embeddings semánticos clínicos de código abierto desarrollada por weemed para notas clínicas en chino tradicional taiwanés, abreviaturas médicas, registros de enfermería y categorización de admisión. El objetivo es resolver un problema muy concreto: los modelos de embeddings generalistas no capturan la jerga clínica local (por ejemplo, que «皮蛇» sea equivalente a «帶狀皰疹») ni el enrutado semántico hacia recursos FHIR. Se distribuye en dos variantes: una «flagship» de 311 M de parámetros y 768 dimensiones, y una variante ligera orientada a edge, construida sobre `ibm-granite/granite-embedding-97m-multilingual-r2` (arquitectura Granite ModernBERT) con 384 dimensiones.

El repositorio `weemed/IlhaEmbed` corresponde a la variante ligera: los pesos safetensors declaran 38.123.136 parámetros y una huella INT8 en ONNX de 37,28 MB, pensada para presupuestos de hardware embebido por debajo de 40 MB. La model card describe además una variante de 311 M con enrutado zero-shot a 16 categorías de recursos FHIR y una precisión de recuperación de abreviaturas clínicas del 98,15 % en Top-1.

Su relevancia actual es doble: por un lado, demuestra que es posible mantener precisión clínica en un encoder de menos de 40 MB que corre en CPU en menos de 4 ms por texto; por otro, expone con transparencia sus límites frente a modelos generalistas en benchmarks MTEB estándar, lo que lo hace útil para arquitecturas RAG híbridas con reranking y validación posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional ModernBERT (variante Granite ModernBERT ligera) |
| Parametros totales | 38.123.136 en safetensors; la model card declara 97 M para la variante ligera y 311 M para la flagship |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en ONNX (huella de 37,28 MB en la variante ligera y ~85,4 MB en la flagship); safetensors sin cuantizar; no se documentan otros formatos |
| Idiomas soportados | chino tradicional (Taiwán) e inglés; incluye evaluación de semántica médica en taigi (hokkien taiwanés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (INT8); compatible con sentence-transformers y text-embeddings-inference |

## Arquitectura y entrenamiento

IlhaEmbed es un bi-encoder de similitud semántica, no un modelo generativo. La variante ligera parte de `ibm-granite/granite-embedding-97m-multilingual-r2` y produce vectores de 384 dimensiones; la variante flagship usa una base ModernBERT de 311 M de parámetros y 768 dimensiones. El ajuste se orienta a dominio clínico taiwanés: se menciona como anclaje un conjunto de intenciones basado en 16 categorías de recursos FHIR, sobre las que el modelo logra enrutado zero-shot.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del corpus, y al tratarse de un modelo de embeddings no se describen fases de RLHF o DPO. Sí se documenta un diseño «fail-closed»: cuando la confianza en coseno cae por debajo de un umbral calibrado, el sistema debe rechazar la sugerencia en lugar de emitir un mapeo dudoso. La evaluación incluye 20 notas clínicas reales, sucias y multi-cláusula (triaje de urgencias, quejas en taigi, resúmenes de alta de enfermería y notas de UCI), con un 95,0 % de acierto en intención dominante Top-1 y un 100 % en Top-3.

## Capacidades

- Generación de embeddings densos de frases y pasajes: 384 dimensiones en la variante ligera y 768 en la flagship.
- Similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Enrutado zero-shot hacia 16 categorías de recursos FHIR con un 100,0 % (44/44) de acierto declarado, tanto en la variante de 311 M como en la de 97 M.
- Recuperación de abreviaturas clínicas: Top-1 del 98,15 % (106/108) en la flagship y 92,56 % (112/121) en la ligera; Top-5 del 100,0 % y 97,52 % respectivamente.
- Manejo de lenguaje coloquial y jerga clínica: 95,2 % (59/62) en ambas variantes.
- Semántica médica en taigi: 96,5 % (136/141) en la flagship y 94,3 % (133/141) en la ligera.
- Correspondencias bilingües chino-inglés: 93,8 % (348/371) y 87,3 % (324/371).
- Reranking de candidatos médicos: MRR@10 de 0,4428 en `CMedQAv1-reranking` con la variante ligera.
- Rechazo administrativo del 100 % en dominios fuera de alcance, según la model card.
- No ofrece generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un encoder de embeddings.
- Compatibilidad declarada con text-embeddings-inference y con endpoints alojados.

## Casos de uso

- Enrutado de admisión clínica: clasificar una nota libre de admisión en una de las 16 categorías de intención FHIR antes de persistirla en el sistema, usando el enrutado zero-shot del modelo como primer filtro y dejando la validación final a un operador.
- RAG sobre historiales electrónicos (EMR/EHR): indexar notas de enfermería y resúmenes de alta en una base vectorial de 384 dimensiones y recuperar pasajes relevantes para un asistente documental, con reranking posterior.
- Normalización de abreviaturas y jerga médica: mapear términos coloquiales como «皮蛇» al término formal «帶狀皰疹» o expandir siglas administrativas, aprovechando el 92-98 % de Top-1 en abreviaturas clínicas.
- Kioscos de salud comunitaria en edge: desplegar el ONNX INT8 de 37,28 MB en un puesto de autoservicio con latencia de 3,97 ms por texto en CPU, sin conexión a Internet.
- Triaje offline en navegador: ejecutar el modelo con ONNX Runtime Web mediante WebAssembly para que un formulario web sugiera la categoría de la queja antes de enviarla al servidor.
- Reranking de resultados en un buscador clínico: usar las puntuaciones de similitud del modelo para reordenar los 100 primeros candidatos devueltos por un motor léxico, mejorando el orden sin reemplazar el índice principal.
- Deduplicación y agrupación de notas: agrupar registros redundantes de enfermería por similitud de coseno para reducir ruido en auditorías y paneles de seguimiento.
- Puerta de rechazo administrativo: descartar automáticamente consultas no clínicas antes de que consuman recursos de un pipeline de IA más costoso, apoyándose en el umbral calibrado de confianza.

## Benchmarks y rendimiento

Métricas internas declaradas por el autor del modelo:

| Metrica | IlhaEmbed-311M (flagship) | IlhaEmbed-97M (ligera) | Umbral de referencia |
|---|---:|---:|---:|
| Arquitectura base | ModernBERT Base | Granite ModernBERT ligera | - |
| Parámetros | 311 M | 97 M | - |
| Dimensión del vector | 768 | 384 | - |
| Huella INT8 ONNX | ~85,4 MB | 37,28 MB | ≤ 40 MB (edge) |
| Latencia CPU (single / batch-16) | 12,5 ms / 3,4 ms | 3,97 ms / 1,7 ms | ≤ 15 ms single |
| Enrutado zero-shot FHIR (16 categorías) | 100,0 % (44/44) | 100,0 % (44/44) | ≥ 95,0 % |
| Top-1 abreviaturas clínicas | 98,15 % (106/108) | 92,56 % (112/121) | ≥ 90,0 % |
| Top-5 abreviaturas clínicas | 100,0 % (108/108) | 97,52 % (118/121) | ≥ 95,0 % |
| Recuperación coloquial / jerga | 95,2 % (59/62) | 95,2 % (59/62) | ≥ 85,0 % |
| Aposiciones bilingües | 93,8 % (348/371) | 87,3 % (324/371) | ≥ 80,0 % |
| Semántica médica en taigi | 96,5 % (136/141) | 94,3 % (133/141) | ≥ 90,0 % |

Evaluación oficial con MTEB v2.21.0 en tareas chinas, comparada con BAAI/bge-small-zh sobre una RTX 4080:

| Tarea | Métrica | IlhaEmbed (97M / 37MB) | BAAI/bge-small-zh |
|---|---|---:|---:|
| `MedicalRetrieval` (recuperación biomédica) | MAP@10 | 0,0872 | 0,4727 |
| `MedicalRetrieval` | NDCG@10 | 0,0974 | 0,4996 |
| `MedicalRetrieval` | Recall@10 | 13,00 % | 58,50 % |
| `CMedQAv1-reranking` (reranking de QA médica) | MRR@10 | 0,4428 | 0,8051 |
| `CMedQAv1-reranking` | Hit Rate@10 | 68,10 % | 95,80 % |
| `CMedQAv1-reranking` | MAP@100 | 0,3792 | 0,7742 |
| `PAWSX` (paráfrasis adversarial) | Cosine Spearman | 0,1115 | 0,0973 |

Prueba adicional sobre 20 notas clínicas arbitrarias, multi-cláusula y sin estructura, con la variante evaluada: 95,0 % (19/20) de acierto en intención dominante Top-1 y 100,0 % (20/20) en cobertura Top-3. El caso límite documentado es «114年成健已做», con 0,703 para `checkup_intent` frente a 0,692 para `care_event`, un margen de 0,011 puntos.

## Requisitos de hardware

- VRAM estimada para la variante de 38,1 M de parámetros (cálculo a partir del recuento real de safetensors): unos 0,15 GB en FP32, 0,08 GB en FP16 y 0,04 GB en INT8.
- VRAM estimada si se despliega la variante declarada de 311 M: aproximadamente 1,2 GB en FP32, 0,6 GB en FP16 y 0,3 GB en INT8.
- No requiere GPU: el modelo está diseñado para inferencia en CPU, con latencias declaradas de 3,97 ms por texto y 1,7 ms en lote de 16 para la variante ligera.
- Cabe sobradamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en hardware embebido con un presupuesto de almacenamiento inferior a 40 MB en INT8.
- Los benchmarks MTEB reportados se ejecutaron sobre una RTX 4080 en condiciones idénticas para todos los modelos comparados.
- Opciones de despliegue: ONNX Runtime, ONNX Runtime Web (WebAssembly), sentence-transformers y text-embeddings-inference. No se documenta soporte de GGUF ni de llama.cpp.
- Throughput en peticiones por segundo: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| IlhaEmbed (repositorio `weemed/IlhaEmbed`) | 38,1 M en safetensors (97 M declarados) | 384 | zh, en | Apache-2.0 | HuggingFace, ONNX, safetensors |
| IlhaEmbed-311M (misma familia, flagship) | 311 M | 768 | zh, en | Apache-2.0 | Distribución descrita en la model card |
| `ibm-granite/granite-embedding-97m-multilingual-r2` (modelo base) | 97 M | 384 | multilingüe | Apache-2.0 | HuggingFace |
| BAAI/bge-small-zh | no disponible | no disponible | zh | no disponible | HuggingFace |

En las tareas MTEB estándar de recuperación biomédica y reranking de QA médica, BAAI/bge-small-zh supera a IlhaEmbed de forma clara (MAP@10 de 0,4727 frente a 0,0872). En cambio, en `PAWSX` de paráfrasis adversarial, IlhaEmbed obtiene 0,1115 frente a 0,0973. La model card no publica comparativas directas contra otros modelos en las tareas de jerga clínica taiwanesa o enrutado FHIR, por lo que la ventaja declarada en ese dominio concreto no está contrastada con alternativas.

## Limitaciones y advertencias

- Existe una discrepancia no explicada entre el recuento real de parámetros del repositorio (38.123.136) y los 97 M declarados en la model card para la variante ligera; además, la huella INT8 de 37,28 MB resulta coherente con ~38 M de parámetros a un byte por peso, no con 97 M. Conviene verificar los artefactos antes de desplegar.
- La misma inconsistencia afecta a la variante flagship: una huella INT8 de ~85,4 MB no cuadra con 311 M de parámetros, que en INT8 ocuparían del orden de 300 MB.
- En los benchmarks MTEB estándar el modelo queda muy por detrás de BAAI/bge-small-zh: Recall@10 del 13,00 % frente al 58,50 % en `MedicalRetrieval` y MRR@10 de 0,4428 frente a 0,8051 en `CMedQAv1-reranking`. No es un sustituto directo de un retriever biomédico generalista.
- El rendimiento en `PAWSX` es muy bajo (0,1115 de correlación de Spearman), un comportamiento esperable en bi-encoders ante permutaciones del orden de palabras, pero que limita su uso en tareas de paráfrasis fina.
- No es un producto sanitario (SaMD): según la model card, no diagnostica, no trata ni formula decisiones clínicas de forma autónoma, y toda sugerencia debe pasar por verificación humana cualificada antes de persistirse en el historial clínico.
- El caso límite documentado («114年成健已做») se resuelve con un margen de solo 0,011 puntos entre dos intenciones, lo que evidencia que los embeddings puros deben combinarse con reglas de validación temporal.
- Cobertura de idiomas limitada a chino tradicional e inglés, con evaluación parcial en taigi. No hay soporte declarado de español ni de otros idiomas.
- No es un modelo generativo: no puede redactar respuestas, invocar herramientas ni razonar en varios pasos. Cualquier caso de uso conversacional requiere un modelo generativo adicional.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero la validación regulatoria del sistema completo sigue siendo responsabilidad del integrador.
- La adopción comunitaria es todavía muy baja (382 descargas y 1 «like» en el momento de la consulta), por lo que no existe validación independiente de las métricas declaradas.
- La longitud máxima de contexto no se publica, lo que impide planificar con precisión la fragmentación de documentos clínicos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weemed/IlhaEmbed
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Logotipo del proyecto: https://huggingface.co/weemed/IlhaEmbed/resolve/main/assets/ilha_formosa_logo.svg
- Paper o informe técnico: no disponible
- Blog o anuncio de publicación: no disponible
- Repositorio de código: no disponible
- Demo interactiva: no disponible
- Enlace a la suite MTEB v2.21.0: no disponible en la información proporcionada
