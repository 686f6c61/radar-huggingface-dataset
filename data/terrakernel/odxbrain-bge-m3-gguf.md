# terrakernel/odxbrain-bge-m3-gguf

## Resumen

`terrakernel/odxbrain-bge-m3-gguf` es una conversión a GGUF en precisión F16 del modelo de embeddings `BAAI/bge-m3`, publicada por TerraKernel como artefacto reproducible de su motor de recuperación ODXBrain. No es un modelo nuevo ni un ajuste fino: es el mismo fichero que BAAI distribuye en PyTorch, convertido con una versión concreta de `convert_hf_to_gguf.py` de llama.cpp y verificado por hash SHA-256, de modo que cualquiera pueda reconstruirlo byte a byte.

El modelo subyacente, bge-m3, es un encoder XLM-RoBERTa de 24 capas y 567 millones de parámetros que produce embeddings densos de 1024 dimensiones con una ventana de contexto de 8192 tokens. Su relevancia en este repositorio es operativa: ODXBrain embebe tanto las consultas del usuario como su corpus de descripciones de modelos de Odoo, y ambos lados deben generarse con exactamente los mismos pesos para que las distancias vectoriales sean comparables. Publicar el fichero exacto elimina la necesidad de que cada cliente reproduzca la conversión con la versión correcta del conversor.

El caso de uso declarado es la recuperación de identificadores sobre un corpus de ERP (Odoo) en entornos air-gapped, sin GPU y sin conexión a internet, con latencias de aproximadamente 40 ms por consulta en dos núcleos de CPU. La licencia MIT del modelo base se mantiene, lo que facilita la revisión por parte de clientes empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (tipo GGUF `bert`), 24 capas |
| Parametros totales | 566.703.104 (567M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | solo F16 en este repositorio (no se ha recuantizado) |
| Idiomas soportados | multilingue; precision medida en ingles, aleman, griego, espanol, frances, polaco, ruso y chino |
| Licencia | MIT (fichero del modelo; el motor ODXBrain tiene licencia propia) |
| Formato de pesos | GGUF (fichero `bge-m3-f16.gguf`, 1.157.671.008 bytes) |
| Dimension del embedding | 1024 |
| Tokenizador | SentencePiece, 250.002 tokens, embebido en el fichero |
| Pooling | CLS + normalizacion L2 (no declarado en el fichero; hay que fijarlo en llama.cpp con `--pooling cls`) |
| Cabeceras incluidas | solo embedding denso (sin sparse ni multi-vector/ColBERT) |
| SHA-256 del fichero | `1257ef7bb76105793f89307b02d6b9c29a444d629f9ff0ad56ee023222fa105d` |

## Arquitectura y entrenamiento

La arquitectura es la de bge-m3 original: un encoder transformer bidireccional basado en XLM-RoBERTa con 24 capas, 1024 dimensiones de representación y 8192 tokens de contexto. El repositorio no aporta información sobre el corpus de entrenamiento, el número de tokens procesados ni las etapas de ajuste del modelo base; esos detalles corresponden a la model card de `BAAI/bge-m3` y no se reproducen aquí. Lo que sí documenta el autor es el proceso de conversión: descarga de los pesos PyTorch de BAAI en la revisión `5617a9f61b028005a4858fdac845db406aefb181`, conversión con llama.cpp en el commit `542e9202d7d14863562e1e908be0bf32aeec2c2a` y `--outtype f16`, con verificación de que el resultado es idéntico en macOS y en Linux.

La innovación técnica relevante no está en el modelo sino en la trazabilidad del artefacto. El autor advierte de que otros GGUF de bge-m3 publicados en Hugging Face difieren en tamaño (típicamente 192 bytes más) porque los generó otra versión del conversor, y que esas diferencias de metadatos no producen errores en tiempo de ejecución pero tampoco han sido evaluadas. El fichero se declara inmutable: cualquier reconversión futura se publicaría con otro nombre, y se recomienda fijar la revisión del repositorio (`582d13afe777ea05e979a07890d6b3e6ae8dd975`).

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto, orientados a recuperación (retrieval) y similitud semántica.
- Recuperación multilingüe: una consulta en un idioma puede compararse contra un corpus en otro, con precisión medida en ocho idiomas.
- Procesamiento de documentos largos gracias a la ventana de 8192 tokens, adecuada para descripciones extensas de modelos de datos o procedimientos.
- Extracción de características (`feature-extraction`) como pipeline declarado.
- Ejecución en CPU sin GPU, con soporte de llama.cpp y de contenedores Docker con volumen de solo lectura.
- Funcionamiento offline y air-gapped: el motor que lo consume no incorpora cliente HTTP.
- No incluye tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder, no un modelo generativo.
- No incluye las cabeceras sparse (lexical weights) ni multi-vector (ColBERT) de bge-m3; solo el embedding denso.

## Casos de uso

- Enrutamiento de consultas a modelos de Odoo: el usuario pregunta en lenguaje natural ("qué factura no está pagada") y el sistema devuelve identificadores ordenados (`account.move`, `account.payment`, `account.payment.term`) en lugar de texto generado, lo que evita que un agente alucine nombres de modelo inexistentes.
- Recuperación de procedimientos operativos estándar: dada una tarea, el motor devuelve el SOP aprobado por el equipo que mejor coincide semánticamente, usando el mismo espacio vectorial que las consultas.
- Despliegue en instalaciones sin GPU: sitios con servidores de CPU únicamente pueden ejecutar el modelo en F16 con llama.cpp y obtener respuestas en torno a 40 ms por consulta en dos núcleos.
- Entornos air-gapped y sectores regulados: al no requerir conexión, el fichero se descarga en una máquina con internet, se verifica por SHA-256 y se transporta al entorno aislado como volumen de solo lectura.
- Búsqueda semántica multilingüe sobre documentación interna: un equipo con documentación en español, inglés y alemán puede indexarla una sola vez y consultarla en cualquiera de esos idiomas.
- Deduplicación y agrupación de descripciones técnicas: los embeddings permiten detectar entradas redundantes en catálogos de modelos de datos o en bases de conocimiento internas.
- Reproducibilidad de pipelines de recuperación: equipos que necesitan que el índice y las consultas se generen con pesos idénticos pueden fijar la revisión del repositorio y verificar el hash antes de construir el corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que bge-m3 se eligió midiendo candidatos contra el conjunto de preguntas de prueba propio de ODXBrain y que la precisión se evalúa en ocho idiomas, pero no se aportan cifras de MMLU, MTEB, HumanEval ni métricas de recuperación. El único dato de rendimiento concreto es la latencia de aproximadamente 40 ms por consulta en dos núcleos de CPU, correspondiente al sistema completo y no al modelo aislado.

## Requisitos de hardware

- VRAM estimada: el fichero F16 ocupa 1,16 GB; en GPU requiere aproximadamente 1,2-1,5 GB incluyendo overhead de contexto y tokenizador.
- GPU recomendadas: no se especifican; el caso de uso declarado es CPU. Cualquier GPU con al menos 2 GB de memoria libre puede alojar el modelo en F16.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 2 GB o más (por ejemplo, GTX 1650, RTX 3050 en adelante).
- Despliegue: llama.cpp es la vía documentada; también es compatible con servidores que acepten GGUF. El autor lo integra en ODXBrain vía `--model /models/bge-m3-f16.gguf --model-id bge-m3`. No se mencionan vLLM, TGI ni Ollama.
- Latencia: aproximadamente 40 ms por consulta en dos núcleos de CPU, según la medición del autor sobre ODXBrain.
- Almacenamiento: 1,16 GB para el fichero; el proceso de reconversión descarga unos 2,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| terrakernel/odxbrain-bge-m3-gguf | 567M | 8192 | GGUF F16 | MIT | Solo embedding denso; hash verificado; artefacto reproducible |
| BAAI/bge-m3 (original) | 567M | 8192 | PyTorch (safetensors/bin) | MIT | Incluye cabeceras densa, sparse y multi-vector; requiere conversión para llama.cpp |
| Otros GGUF de bge-m3 en HF | 567M | 8192 | GGUF | MIT | Generados con otras versiones del conversor; metadatos distintos y sin evaluación publicada según el autor |

No se dispone de información sobre alternativas de otros fabricantes (por ejemplo, modelos de embeddings multilingües de la familia E5 o GTE) en la documentación proporcionada, por lo que no se comparan aquí.

## Limitaciones y advertencias

- Solo contiene el embedding denso: si el pipeline espera las señales sparse o multi-vector de bge-m3, este fichero no las proporciona y habrá que usar los ficheros separados del repositorio de BAAI.
- No declara pooling en el fichero: al usarlo con llama.cpp directamente hay que pasar `--pooling cls`; de lo contrario los vectores no coinciden con los del modelo de referencia.
- Sensible al fichero exacto: otros GGUF de bge-m3 se cargan sin error pero producen vectores distintos; el autor no ha medido su precisión. Es imprescindible verificar el SHA-256 antes de construir un índice.
- Riesgo de desalineación de índice: si el corpus se indexó con un fichero y las consultas se embeben con otro, las distancias dejan de ser comparables y los resultados se degradan silenciosamente, sin errores visibles.
- Sin datos de sesgo ni de alucinación: al ser un encoder de recuperación no genera texto, pero puede heredar sesgos del corpus de entrenamiento de bge-m3, sobre el que este repositorio no aporta información.
- Cobertura lingüística: la evaluación declarada cubre ocho idiomas; no hay datos para el resto de idiomas que soporta el tokenizador.
- Licencia: el fichero es MIT, pero la licencia MIT de este repositorio cubre únicamente el modelo y no concede derechos sobre el motor ODXBrain, que tiene licencia propia.
- BAAI no ha revisado ni respaldado esta conversión, según indica el propio autor.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/terrakernel/odxbrain-bge-m3-gguf
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper de bge-m3 (arXiv 2402.03216): https://arxiv.org/abs/2402.03216
- Motor ODXBrain: https://odxproxy.io/odxbrain
- ODXBrain en Docker Hub: https://hub.docker.com/r/terrakernel/odxbrain
- Corpus abierto de conocimiento Odoo (CC0): https://github.com/terrakernel/odxbrain-corpus
- Herramienta odxdocs: https://hub.docker.com/r/terrakernel/odxdocs
- llama.cpp: https://github.com/ggml-org/llama.cpp
