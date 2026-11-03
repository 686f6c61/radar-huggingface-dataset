# tomaarsen/st-splade-v3-distilbert-mic

## Resumen

`tomaarsen/st-splade-v3-distilbert-mic` es un artefacto de prueba (test fixture) publicado en HuggingFace por Tomaarsen, colaborador habitual de la librería Sentence Transformers. No se trata de un modelo funcional de recuperación de información, sino de una versión "slim" (reducida) del modelo `naver/splade-v3-distilbert`, creada para validar la integración de SparseEncoder en distintos frameworks. La model card es explícita: los pesos son aleatorios y no representan la calidad de recuperación del modelo original.

El modelo base, SPLADE-v3-DistilBERT, es un encoder disperso (sparse encoder) desarrollado por NAVER, que combina la arquitectura DistilBERT con el mecanismo SPLADE para producir representaciones léxicas expandidas y dispersas, útiles en búsqueda y recuperación. Este artefacto hereda la arquitectura y la configuración de pipeline de ese modelo, pero con un conjunto de pesos reducido y sin entrenamiento real.

Su relevancia es exclusivamente técnica: sirve como fixture para pruebas de contrato (contract tests) en la integración de SparseEncoder con Transformers y otras herramientas. No debe emplearse en producción ni para evaluar calidad de recuperación, ya que sus pesos son aleatorios por diseño. El repositorio incluye un manifiesto de contrato (`integration.json`), documentación de uso y procedencia del fixture (`build.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) con cabecera SPLADE (sparse encoder) |
| Parametros totales | 2.088.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `naver/splade-v3-distilbert` emplea una arquitectura DistilBERT (transformer encoder de 6 capas, destilado de BERT) con una cabecera de proyección SPLADE que genera representaciones dispersas de vocabulario completo, con expansión léxica aprendida. SPLADE se entrena típicamente con una combinación de pérdidas de ranking y regularización de dispersión (FLOPS regularization), lo que produce vectores con pocos términos activos pero alta efectividad en recuperación.

Sin embargo, este artefacto concreto no ha sido entrenado: la model card indica que "its weights are random and do not represent the source model's retrieval quality". Se trata de un pipeline reducido ("shrunk pipeline") generado mediante un proceso de compresión documentado en el enlace de procedencia. No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO para este artefacto.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen representaciones útiles para recuperación.
- Sirve como fixture de prueba para validar la integración de SparseEncoder en Transformers y Sentence Transformers.
- Permite comprobar contratos de API (formatos de entrada/salida, serialización, carga de pesos) sin necesidad de descargar el modelo completo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables.
- No dispone de modo thinking, visión ni audio.
- Su utilidad es exclusivamente de ingeniería y testing.

## Casos de uso

- Pruebas de integración en CI/CD: validar que la clase SparseEncoder de Sentence Transformers carga correctamente un checkpoint con safetensors y produce salidas con la forma esperada, usando un fixture ligero de 2 millones de parámetros.
- Test de contrato para Transformers: comprobar que la integración documentada en `integrations/transformers/usage.md` se ejecuta sin errores en un entorno limpio.
- Validación de pipelines de serialización: verificar que el manifiesto `integration.json` y los archivos de expectativas se parsean correctamente en herramientas de validación.
- Desarrollo de utilidades de carga de modelos: probar rutas de carga, manejo de errores y compatibilidad de versiones sin consumir ancho de banda ni VRAM significativa.
- Reproducción de fixtures en investigación de infraestructura: estudiar cómo se genera un modelo "shrunk" a partir de un checkpoint original, consultando el enlace de procedencia.
- Docencia y demos de testing de modelos: ilustrar buenas prácticas de fixtures deterministas en proyectos de ML open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los pesos son aleatorios y no representan la calidad del modelo original, por lo que cualquier métrica de recuperación sería meaningless.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (2,09 M de parámetros, aproximadamente 8,4 MB de pesos), y menos aún en cuantización de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) o incluso CPU es suficiente; el modelo cabe holgadamente en cualquier dispositivo.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM, y también en CPU.
- Opciones de despliegue: Sentence Transformers, Transformers, y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado). vLLM y TGI no están orientados a SparseEncoder y no se documentan para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/st-splade-v3-distilbert-mic | 2,09 M | no disponible | Fixture de prueba | no disponible | HuggingFace |
| naver/splade-v3-distilbert | no disponible | no disponible | Sparse encoder funcional | no disponible | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Dense encoder | Apache 2.0 | HuggingFace |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Dense encoder | MIT | HuggingFace |

La comparación es orientativa: el artefacto MIC no es funcional, mientras que los otros son modelos de recuperación reales. No se dispone de datos de rendimiento del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: no usar para recuperación, búsqueda ni ninguna tarea de NLP en producción.
- No representa la calidad de `naver/splade-v3-distilbert`; cualquier evaluación sobre este artefacto es inválida.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no se puede verificar cobertura multilingüe.
- Longitud de contexto no disponible: no se puede confirmar la ventana máxima de entrada.
- Repositorio de tamaño 0.0 GB según HuggingFace, lo que sugiere que los pesos pueden no estar completamente subidos o son extremadamente pequeños.
- Riesgo de confusión: el nombre incluye "splade-v3-distilbert", lo que puede llevar a error si se busca el modelo funcional; verificar siempre la model card antes de usarlo.
- Sin descargas ni likes en el momento de la consulta, lo que indica que es un artefacto reciente y no validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/tomaarsen/st-splade-v3-distilbert-mic
- Modelo base: https://huggingface.co/naver/splade-v3-distilbert
- Manifiesto de contrato: https://huggingface.co/tomaarsen/st-splade-v3-distilbert-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-splade-v3-distilbert-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-splade-v3-distilbert-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-splade-v3-distilbert-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-splade-v3-distilbert-mic.html
