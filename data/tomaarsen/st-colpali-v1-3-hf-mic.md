# tomaarsen/st-colpali-v1-3-hf-mic

## Resumen

`tomaarsen/st-colpali-v1-3-hf-mic` es un artefacto de prueba (fixture) derivado de `vidore/colpali-v1.3-hf`, el modelo de recuperación visual de documentos de la familia ColPali. Lo publica el desarrollador tomaarsen bajo la etiqueta `test-artifact` y con el tag `mic`, y su propósito no es servir como modelo de producción, sino proporcionar un repositorio mínimo y ejecutable que valide las expectativas de integración de la librería `sentence-transformers` con la arquitectura `MultiVectorEncoder` de ColPali.

El modelo conserva la interfaz de pipeline del original (codificador multivector para búsqueda visual sobre imágenes de documentos), pero sus pesos han sido reducidos drásticamente hasta los 16.714.560 parámetros y, según la propia model card, son aleatorios: no representan la calidad de recuperación del modelo fuente. El repositorio incluye un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers, un directorio de expectativas del framework y la procedencia del fixture (`build.json`).

Por tanto, es relevante únicamente para desarrolladores que mantengan o auditen integraciones de `sentence-transformers` con modelos ColPali, o que necesiten reproducir pruebas de contrato sin descargar los pesos completos del modelo original. No debe emplearse para tareas reales de recuperación de información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MultiVectorEncoder (ColPali, basada en transformer con proyección multivector) |
| Parámetros totales | 16.714.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo fuente, `vidore/colpali-v1.3-hf`, pertenece a la familia ColPali: un codificador que genera representaciones multivector (multi-vector embeddings) a partir de imágenes de documentos, pensado para recuperación visual directa sin OCR ni extracción previa de texto. La variante publicada aquí mantiene la clase `MultiVectorEncoder` dentro de `sentence-transformers`, de modo que la API de codificación y búsqueda es idéntica a la del original.

Sin embargo, este artefacto concreto no ha sido entrenado: la model card indica explícitamente que los pesos son aleatorios y que el pipeline ha sido "encogido" (shrunk) a partir del modelo fuente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO, porque el fixture no reproduce el proceso de entrenamiento del original. La innovación técnica relevante aquí no es de modelado, sino de ingeniería de pruebas: empaquetar pesos reducidos, uso ejecutable y expectativas del framework en un único repositorio verificable mediante un manifiesto de contrato.

## Capacidades

- Codificación de imágenes de documentos en representaciones multivector, con la misma interfaz que `vidore/colpali-v1.3-hf`.
- Integración con `sentence-transformers` mediante la clase `MultiVectorEncoder`.
- Uso ejecutable con Transformers, documentado en `integrations/transformers/usage.md`.
- Validación de contrato: el repositorio incluye `integration.json` y un directorio de expectativas que permiten comprobar que el framework carga y ejecuta el pipeline correctamente.
- No ofrece calidad de recuperación real: los pesos son aleatorios, por lo que las capacidades semánticas del modelo fuente no están presentes.
- No se ha documentado soporte de tool calling, agentes, modo thinking, visión general, audio ni capacidades multilingües más allá de la interfaz heredada.

## Casos de uso

- Pruebas de contrato en `sentence-transformers`: usar el fixture para verificar que la clase `MultiVectorEncoder` carga el repositorio, respeta el manifiesto `integration.json` y produce salidas con la forma esperada, sin necesidad de descargar los pesos completos de ColPali.
- Integración continua en librerías de recuperación: incluir el fixture en pipelines de CI para detectar regresiones en la carga de modelos ColPali y en la serialización de embeddings multivector.
- Desarrollo de herramientas de inspección de repositorios: el par `integration.json` + `build.json` sirve como ejemplo de metadatos de procedencia para auditar cómo se generó un artefacto reducido.
- Validación de expectativas del framework: ejecutar el directorio `integrations/transformers/expectations` para comprobar compatibilidad entre versiones de Transformers y el formato del pipeline.
- Docencia y demostraciones de arquitectura: mostrar la estructura de un `MultiVectorEncoder` y su uso con `sentence-transformers` sin incurrir en el coste de un modelo grande.
- Reproducción de entornos de prueba aislados: al ocupar 0,1 GB, permite montar entornos de test ligeros y deterministas en los que solo importa la forma de las salidas, no su contenido semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de retrieval (nDCG, Recall@k, MRR) sobre este artefacto carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 16,7 M de parámetros; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas funcionales.
- Opciones de despliegue: `sentence-transformers` y Transformers son las vías documentadas en el repositorio; no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al tratarse de un fixture con pesos aleatorios, las cifras de rendimiento no serían representativas del modelo fuente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad de recuperación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tomaarsen/st-colpali-v1-3-hf-mic` | 16.714.560 | no disponible | nula (pesos aleatorios) | no disponible | HuggingFace, 0 descargas |
| `vidore/colpali-v1.3-hf` | no disponible en la información proporcionada | no disponible | la del modelo fuente original | no disponible | HuggingFace (modelo base) |
| Otros fixtures `mic` de tomaarsen | no disponible | no disponible | nula (pesos aleatorios) | no disponible | HuggingFace |

La comparación relevante es con su modelo base: este artefacto comparte interfaz y clase con `vidore/colpali-v1.3-hf`, pero no su calidad. Frente a otros modelos de recuperación visual de documentos, no procede comparación de rendimiento porque el fixture no está pensado para evaluarse.

## Limitaciones y advertencias

- Los pesos son aleatorios: no usar para recuperación, búsqueda ni ninguna tarea semántica real.
- La model card etiqueta el repositorio como `test-artifact`, lo que restringe su uso legítimo a pruebas y validación de integraciones.
- Licencia no disponible: no puede asumirse permiso de uso comercial; conviene consultar la licencia del modelo base `vidore/colpali-v1.3-hf` antes de cualquier despliegue derivado.
- Idiomas no documentados; la interfaz heredada de ColPali trabaja sobre imágenes de documentos, no sobre texto plano multilingüe.
- Longitud de contexto no disponible; no debe inferirse del modelo fuente sin verificarlo.
- Riesgo de confusión en producción: al compartir nombre e interfaz con el original, un despliegue accidental produciría resultados sin sentido sin errores evidentes.
- Sin datos de benchmarks ni de rendimiento; cualquier estimación de latencia o throughput es especulativa.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tomaarsen/st-colpali-v1-3-hf-mic
- Modelo base: https://huggingface.co/vidore/colpali-v1.3-hf
- Manifiesto de contrato: https://huggingface.co/tomaarsen/st-colpali-v1-3-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-colpali-v1-3-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-colpali-v1-3-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-colpali-v1-3-hf-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-colpali-v1-3-hf-mic.html
