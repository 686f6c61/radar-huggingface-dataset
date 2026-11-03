# tomaarsen/st-gte-reranker-modernbert-base-mic

## Resumen

`tomaarsen/st-gte-reranker-modernbert-base-mic` es un artefacto de prueba (fixture) derivado de `Alibaba-NLP/gte-reranker-modernbert-base`, un modelo de reordenamiento (reranker) basado en la arquitectura ModernBERT. Lo publica el usuario tomaarsen en HuggingFace y su propósito no es ofrecer capacidades de recuperación reales, sino servir como banco de pruebas reproducible para integraciones de frameworks (en concreto, la librería `sentence-transformers` y su clase `CrossEncoder`). La model card lo declara explícitamente como "test-artifact" y advierte de que los pesos son aleatorios.

El modelo cuenta con 3.310.017 parámetros según los safetensors publicados, muy por debajo de los ~149 millones de parámetros del `gte-reranker-modernbert-base` original. Esta reducción drástica es consecuencia del proceso de "shrink" descrito en la documentación del autor, que recorta la arquitectura para generar un pipeline ejecutable y ligero, útil para validar contratos de integración, no para producir puntuaciones de relevancia significativas.

Su relevancia es, por tanto, exclusivamente de ingeniería: permite a mantenedores de librerías y pipelines de CI/CD ejecutar pruebas de humo sobre la ruta de código de `CrossEncoder` con ModernBERT sin descargar ni ejecutar el modelo completo. No debe emplearse en producción ni como sustituto del reranker original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), empaquetado como CrossEncoder |
| Parametros totales | 3.310.017 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT del modelo base `Alibaba-NLP/gte-reranker-modernbert-base`, un encoder transformer con atención de soporte para secuencias largas y capas de atención eficiente. Sobre esa base, el autor aplica un proceso de reducción ("shrink") documentado en el enlace de procedencia del fixture, que recorta el pipeline a una versión mínima ejecutable. El resultado conserva la estructura de un `CrossEncoder` (par de entradas consulta-documento con salida de puntuación), pero con un número de parámetros muy inferior al original.

No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de ajuste (RLHF/DPO) en la información proporcionada. La model card indica de forma explícita que los pesos son aleatorios y que no representan la calidad de recuperación del modelo fuente, por lo que no cabe hablar de entrenamiento efectivo en este artefacto.

## Capacidades

- Ejecución de la ruta de inferencia de `CrossEncoder` con arquitectura ModernBERT, útil para validar integraciones.
- Puntuación de pares consulta-documento a nivel estructural (salida no significativa por pesos aleatorios).
- Servir como fixture reproducible en pruebas automatizadas de `sentence-transformers`.
- Validación de contratos de integración descritos en `integration.json` y en el directorio `integrations/transformers/`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües verificables.
- No dispone de modo "thinking" ni de ninguna capacidad especial declarada.

## Casos de uso

- Pruebas de humo en CI/CD para `sentence-transformers`: ejecutar la clase `CrossEncoder` sobre este fixture para verificar que la carga de pesos safetensors y la firma del pipeline no se rompen tras cambios en la librería, sin coste de descarga del modelo completo.
- Validación de integraciones con Transformers: comprobar que el directorio `integrations/transformers/expectations` se cumple al cargar el modelo con `AutoModelForSequenceClassification`, detectando regresiones en el mapeo de configuración.
- Desarrollo de conectores para frameworks de recuperación: usar el fixture como sustituto ligero en pruebas unitarias de pipelines RAG que necesiten un reranker con la misma interfaz que el modelo original.
- Reproducción de incidencias: al ser un artefacto pequeño y determinista en su construcción, permite reproducir bugs reportados en la ruta de código de ModernBERT sin depender del modelo de ~149 M de parámetros.
- Docencia y demostraciones de la API `CrossEncoder`: ilustrar el flujo de puntuación consulta-documento con un modelo que se descarga en segundos, advirtiendo a los alumnos de que las puntuaciones no son semánticamente válidas.
- Verificación de contratos de empaquetado: validar que el manifest `integration.json` y el `build.json` de procedencia son coherentes con los archivos publicados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte de que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de ranking (nDCG, MRR, MAP) sobre este artefacto carecería de valor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 3,3 M de parámetros (aproximadamente 13 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también ejecutable en CPU sin problema.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` (CrossEncoder), Transformers con `AutoModelForSequenceClassification`, y potencialmente `ONNX Runtime` u otras rutas compatibles con el formato safetensors.
- Latencia y throughput: no disponibles; al tratarse de un fixture con pesos aleatorios, las mediciones no serían representativas del modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `tomaarsen/st-gte-reranker-modernbert-base-mic` | 3.310.017 | no disponible | no disponible | Fixture de pruebas |
| `Alibaba-NLP/gte-reranker-modernbert-base` | ~149 M (no confirmado en la información) | no disponible | no disponible | Reranker de producción |
| `BAAI/bge-reranker-base` | no disponible | no disponible | no disponible | Reranker de producción |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | no disponible | no disponible | no disponible | Reranker de producción |

La comparación relevante es únicamente con su modelo base: el fixture no es un sustituto funcional del `gte-reranker-modernbert-base`, sino una versión recortada con pesos aleatorios destinada a pruebas de integración. Frente a otros rerankers de producción como `bge-reranker-base` o los cross-encoders de MS MARCO, la diferencia es de categoría: aquellos están entrenados para ranking y este no.

## Limitaciones y advertencias

- Los pesos son aleatorios: las puntuaciones de relevancia no tienen significado y no deben usarse para filtrar ni ordenar documentos reales.
- No es apto para producción: la model card lo etiqueta como `test-artifact` y `mic`.
- No hay información sobre licencia, lo que impide confirmar condiciones de uso comercial; debe consultarse el repositorio del modelo base.
- No hay información sobre idiomas soportados ni sobre sesgos, al no existir entrenamiento efectivo en este artefacto.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse la del modelo base sin verificarla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo de confusión: el nombre puede llevar a pensar que es una versión cuantizada o "MIC" del reranker original; en realidad es un fixture recortado.
- Para cualquier caso de uso real de reranking debe emplearse `Alibaba-NLP/gte-reranker-modernbert-base` o un reranker entrenado equivalente.

## Enlaces

- HuggingFace: https://huggingface.co/tomaarsen/st-gte-reranker-modernbert-base-mic
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentación del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-gte-reranker-modernbert-base-mic.html
