# tomaarsen/st-all-mpnet-base-v2-mic

## Resumen

`tomaarsen/st-all-mpnet-base-v2-mic` es un artefacto de prueba (fixture) publicado en Hugging Face por el desarrollador tomaarsen, colaborador habitual del ecosistema `sentence-transformers`. No es un modelo de embeddings funcional: se trata de una version reducida ("slim") del conocido `sentence-transformers/all-mpnet-base-v2`, generada para validar contratos de integracion y expectativas de frameworks (Transformers, SentenceTransformers) dentro de un pipeline de pruebas denominado MIC.

El repositorio empaqueta en un solo lugar los pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas de framework, y metadatos de procedencia del fixture (`build.json`). El propio autor advierte en la model card que los pesos son aleatorios y no representan la calidad de recuperacion del modelo original.

Por tanto, su relevancia no es como modelo para produccion sino como pieza de infraestructura de testing: permite verificar que las integraciones de `sentence-transformers` y Transformers cargan, ejecutan y validan correctamente modelos con arquitectura MPNet sin necesidad de descargar los ~420 MB del modelo completo. El conteo de parametros reportado en safetensors (2.057.984) confirma que se trata de una version drasticamente reducida respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder, heredada de `sentence-transformers/all-mpnet-base-v2`) |
| Parametros totales | 2.057.984 (pesos safetensors del fixture reducido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, `sentence-transformers/all-mpnet-base-v2`, es un encoder MPNet (Masked and Permuted Pre-training for Language Understanding) afinado con objetivos de similitud de frases para producir embeddings de oraciones. MPNet combina ideas de modelado enmascarado (tipo BERT) y modelado permutado (tipo XLNet), lo que le permite capturar dependencia bidireccional sin el desajuste preentrenamiento-finetuning de BERT.

Sin embargo, este repositorio concreto no contiene el modelo entrenado: es un fixture reducido. Segun la model card, los pesos son aleatorios y el pipeline ha sido "encogido" (shrunk) respecto al original. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO para este artefacto, porque no ha sido entrenado. La innovacion tecnica aqui es de ingenieria de testing: empaquetar pesos, contrato de integracion y expectativas de framework en un unico repositorio reproducible.

## Capacidades

- Carga y ejecucion como modelo `SentenceTransformer` dentro del ecosistema `sentence-transformers`.
- Carga mediante Transformers segun la documentacion de integracion incluida en `integrations/transformers/usage.md`.
- Validacion de contratos de integracion mediante `integration.json`.
- Verificacion de expectativas de framework en el directorio `integrations/transformers/expectations`.
- Trazabilidad de la reduccion del fixture mediante `build.json` y el enlace externo de procedencia.
- No produce embeddings de calidad: los pesos son aleatorios, por lo que no debe usarse para retrieval, similitud semantica ni ninguna tarea downstream real.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Pruebas de integracion en CI/CD: usar el fixture para verificar que una version de `sentence-transformers` o Transformers carga y ejecuta un pipeline MPNet sin descargar el modelo completo, reduciendo tiempo y ancho de banda en la pipeline.
- Validacion de contratos de API: comprobar que los cambios en el codigo de carga de modelos respetan el manifiesto `integration.json` antes de publicar una release.
- Desarrollo offline: permitir a colaboradores trabajar en integraciones de embeddings en entornos sin acceso a los repositorios grandes de Hugging Face.
- Pruebas de regresion de frameworks: comparar el comportamiento de carga y las expectativas declaradas en `integrations/transformers/expectations` entre versiones de la libreria.
- Reproducibilidad de fixtures: auditar como se genero el modelo reducido a partir del original usando `build.json` y el enlace de procedencia.
- Docencia y demos de infraestructura: ilustrar como se empaqueta un modelo con su contrato y expectativas sin exponer pesos reales ni coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los pesos son aleatorios y no representan la calidad de retrieval del modelo fuente, por lo que cualquier metrica de rendimiento careceria de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 2.057.984 parametros del fixture (aprox. 8 MB de pesos), mas overhead del runtime.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers`, Transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (no aplica, al no ser un modelo funcional).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tomaarsen/st-all-mpnet-base-v2-mic` | 2.057.984 | no disponible | Fixture de testing | no disponible | Hugging Face |
| `sentence-transformers/all-mpnet-base-v2` | ~109 M | 384 tokens (tipico en MPNet) | Embeddings de frases | Apache 2.0 (segun el modelo original) | Hugging Face |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 tokens | Embeddings ligeros | Apache 2.0 | Hugging Face |

La comparativa con modelos reales de embeddings no es directa: este artefacto no compite en calidad sino en funcion de testing. Frente al modelo base, reduce el tamano en mas de dos ordenes de magnitud a costa de perder toda capacidad semantica.

## Limitaciones y advertencias

- Pesos aleatorios: no apto para produccion, retrieval, similitud semantica ni ninguna tarea real de NLP.
- No es un modelo entrenado; no hay datos de sesgo, alucinacion ni calidad que evaluar.
- Licencia no disponible: no se puede asumir uso comercial sin consultar el repositorio ni el modelo base.
- Idiomas no declarados; irrelevante al no ser funcional.
- Longitud de contexto no documentada para el fixture.
- El conteo de parametros (2.057.984) difiere enormemente del modelo base, lo que puede confundir a herramientas que infieran capacidades a partir del tamano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- Fecha de creacion futura (2026-11-03) en los metadatos, posiblemente por error de publicacion; conviene verificar procedencia antes de usarlo en pipelines.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tomaarsen/st-all-mpnet-base-v2-mic
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Documentacion de procedencia del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-all-mpnet-base-v2-mic.html
- Manifiesto de contrato (en el repo): `integration.json`
- Uso con Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia del fixture (en el repo): `build.json`
