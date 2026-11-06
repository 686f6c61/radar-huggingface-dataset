# tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic

## Resumen

`tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic` es un artefacto de prueba (fixture) publicado por tomaarsen en Hugging Face, no un modelo entrenado para uso real. Se trata de una versión "adelgazada" (slim) del modelo base `tomaarsen/Qwen3-Reranker-0.6B-seq-cls`, un reranker CrossEncoder derivado de Qwen3, creada para verificar la integración de frameworks (en concreto, la librería sentence-transformers) con modelos de tamaño reducido y pesos aleatorios.

El repositorio empaqueta en un único lugar pesos reducidos, ejemplos de uso ejecutables y las expectativas del framework (un manifiesto de contrato en `integration.json` y un directorio `integrations/transformers/expectations`). Su propósito es servir como fixture de test para validar pipelines de integración, no para tareas de recuperación de información.

La model card es explícita: los pesos son aleatorios y no representan la calidad de recuperación del modelo de origen. Con 9.780.992 parámetros reales (frente a los ~0,6B del modelo base) y un tamaño de repositorio de 0,1 GB, es un artefacto ligero pensado para CI y pruebas de compatibilidad. No debe confundirse con el reranker funcional del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CrossEncoder sobre base Qwen3 (fixture slim con pesos aleatorios) |
| Parametros totales | 9.780.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | tomaarsen/Qwen3-Reranker-0.6B-seq-cls |
| Tamano del repositorio | 0,1 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un CrossEncoder construido sobre la arquitectura Qwen3, tal como indica su modelo base (`tomaarsen/Qwen3-Reranker-0.6B-seq-cls`). Sin embargo, esta variante `-mic` no ha sido entrenada: la model card indica que sus pesos son aleatorios y que el pipeline ha sido "encogido" (shrunk) respecto al modelo de origen. El número de parámetros reales (9,78M) confirma que se ha reducido drásticamente el tamaño respecto al modelo base de ~0,6B.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) para este artefacto, porque no es un modelo entrenado. El repositorio incluye un enlace a la documentación del proceso de reducción (`build.json` y la página de "shrink") que describe cómo se generó el fixture, pero no aporta detalles arquitectónicos adicionales sobre el reranker original.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no representan la calidad de recuperación del modelo de origen.
- Sirve como fixture de test para validar la integración de sentence-transformers con modelos CrossEncoder.
- Permite verificar contratos de framework: manifiesto `integration.json`, ejemplos de uso en `integrations/transformers/usage.md` y expectativas en `integrations/transformers/expectations`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables, al no ser un modelo entrenado.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Pruebas de integración en CI: el fixture permite ejecutar el pipeline de sentence-transformers con un modelo CrossEncoder de tamaño reducido (9,78M parámetros) para validar que la librería carga, infiere y devuelve resultados con el formato esperado, sin coste computacional significativo.
- Validación de contratos de framework: el manifiesto `integration.json` y el directorio de expectativas permiten comprobar que una versión de sentence-transformers o transformers cumple el contrato de uso definido para el CrossEncoder.
- Desarrollo de tooling de serialización: al ser un repo de 0,1 GB con pesos safetensors, es útil para probar pipelines de carga/descarga, conversión de formatos y empaquetado sin manejar modelos de cientos de GB.
- Test de regresión en librerías: permite verificar que cambios en sentence-transformers no rompen la carga de modelos CrossEncoder con arquitectura Qwen3 reducida.
- Documentación ejecutable: los ejemplos en `integrations/transformers/usage.md` sirven como referencia reproducible para integradores que necesiten un caso mínimo de uso.
- Banco de pruebas de infraestructura: útil para validar despliegues (servidores de inferencia, colas de trabajo, orquestación) con un modelo de huella mínima antes de pasar al modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo de origen, por lo que cualquier métrica de retrieval (nDCG, MRR, Recall@k) sería inválida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 9,78M parámetros (aproximadamente 40 MB de pesos), más overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en CPU y en GPUs de gama baja.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers (librería nativa), transformers, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| st-Qwen3-Reranker-0-6B-seq-cls-mic (este) | 9,78M | no disponible | Fixture de test | no disponible | Hugging Face |
| tomaarsen/Qwen3-Reranker-0.6B-seq-cls | ~0,6B | no disponible | Reranker CrossEncoder funcional | no disponible | Hugging Face |
| Qwen3-Reranker-0.6B (original) | ~0,6B | no disponible | Reranker funcional | no disponible | Hugging Face |

La comparación relevante es con su modelo base: este artefacto es una versión reducida y con pesos aleatorios del reranker `tomaarsen/Qwen3-Reranker-0.6B-seq-cls`, por lo que no es funcionalmente equivalente. Para uso real de reranking debe utilizarse el modelo base o el Qwen3-Reranker original.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce resultados de recuperación válidos y no debe usarse en producción.
- No es un modelo entrenado: no ha pasado por fases de preentrenamiento, fine-tuning ni alineación para este artefacto.
- La model card lo etiqueta explícitamente como `test-artifact` y `mic` (fixture de test).
- Licencia no disponible: no se puede confirmar el régimen de uso comercial del artefacto ni del modelo base a partir de la información proporcionada.
- Idiomas no disponibles: no hay información sobre cobertura lingüística.
- Longitud de contexto no disponible.
- Sesgos y riesgo de alucinación: no aplicables en el sentido habitual, ya que el modelo no genera texto ni puntuaciones significativas; cualquier salida es esencialmente ruido.
- Para cualquier caso de uso de reranking real, debe recurrirse al modelo base `tomaarsen/Qwen3-Reranker-0.6B-seq-cls` o al Qwen3-Reranker original, verificando sus licencias y especificaciones.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic
- Modelo base: https://huggingface.co/tomaarsen/Qwen3-Reranker-0.6B-seq-cls
- Manifiesto de contrato: https://huggingface.co/tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-Qwen3-Reranker-0-6B-seq-cls-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-Qwen3-Reranker-0-6B-seq-cls-mic.html
