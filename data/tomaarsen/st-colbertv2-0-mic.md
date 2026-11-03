# tomaarsen/st-colbertv2-0-mic

## Resumen

`tomaarsen/st-colbertv2-0-mic` es un artefacto de prueba (fixture) derivado de `colbert-ir/colbertv2.0`, el conocido modelo de recuperación de información basado en ColBERTv2. Lo publica el desarrollador tomaarsen, colaborador habitual de Sentence Transformers, y su propósito no es ofrecer un modelo funcional de recuperación, sino servir como caso de prueba reproducible para frameworks de integración. La model card lo declara explícitamente: los pesos son aleatorios y no representan la calidad de recuperación del modelo original.

El repositorio empaqueta en un único lugar los pesos "slim" (reducidos), un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y un directorio de expectativas del framework. Esta estructura responde a la necesidad de validar que una integración (por ejemplo, la carga del modelo, la tokenización o la generación de embeddings multi-vector) se comporta de forma determinista y conforme al contrato esperado, sin necesidad de descargar los pesos completos del modelo original.

Por tanto, esta ficha debe leerse como documentación de un artefacto de test, no de un modelo listo para producción. Cualquier evaluación de calidad, benchmarks o uso en recuperación real debe remitirse a `colbert-ir/colbertv2.0`, del que este repositorio solo conserva la arquitectura y la configuración de pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), pipeline MultiVectorEncoder tipo ColBERT |
| Parametros totales | 2.061.632 (según safetensors; pesos reducidos, no los del modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base ColBERTv2 usa 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | colbert-ir/colbertv2.0 |
| Librería | sentence-transformers |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto se construye sobre la arquitectura de ColBERTv2: un encoder transformer tipo BERT que produce representaciones multi-vector por token y aplica una interacción tardía (late interaction) para puntuar pares consulta-documento. El pipeline declarado es `MultiVectorEncoder`, el componente de Sentence Transformers que expone esta familia de modelos.

No obstante, este repositorio concreto no contiene un modelo entrenado. La model card indica que los pesos han sido "encogidos" (shrunk) y que son aleatorios, de modo que no reproducen el comportamiento del modelo fuente. El número de parámetros reportado por safetensors (2.061.632) confirma que se trata de una versión drásticamente reducida respecto al BERT-base original de ColBERTv2. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de ajuste (RLHF, DPO u otras), porque el artefacto no ha pasado por ese proceso. La innovación relevante aquí no es algorítmica, sino de ingeniería de test: empaquetar pesos reducidos junto a un manifiesto de contrato y expectativas de framework para validar integraciones de forma reproducible.

## Capacidades

- Carga y ejecución del pipeline `MultiVectorEncoder` de Sentence Transformers con pesos reducidos.
- Verificación de conformidad con el contrato de integración definido en `integration.json`.
- Ejecución de casos de prueba de Transformers descritos en `integrations/transformers/usage.md` y `integrations/transformers/expectations`.
- Generación de embeddings multi-vector con la misma interfaz que el modelo base, útil para probar código de integración.
- No ofrece calidad de recuperación real: los pesos son aleatorios.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Pruebas de integración en Sentence Transformers: usar el artefacto como fixture para comprobar que la carga del pipeline `MultiVectorEncoder` y la generación de embeddings multi-vector funcionan sin descargar el modelo completo.
- Validación de contratos en CI/CD: ejecutar `integration.json` y el directorio de expectativas en pipelines automatizados para detectar regresiones en la API de carga de modelos.
- Desarrollo de herramientas de compatibilidad: verificar que una nueva versión de Transformers o de Sentence Transformers sigue produciendo las salidas esperadas sobre un modelo de referencia ligero.
- Test de serialización y formatos: comprobar la lectura de pesos safetensors y la coherencia de la configuración del pipeline en entornos aislados.
- Reproducción de incidencias: al ser un repositorio pequeño y determinista, sirve para reproducir bugs reportados por usuarios sin depender de descargas grandes.
- Documentación técnica de integraciones: el repositorio incluye ejemplos de uso y expectativas que pueden citarse como referencia en guías internas de integración de modelos ColBERT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los pesos son aleatorios y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de retrieval (MRR@10, Recall@k, nDCG) sobre este artefacto carecería de significado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 2,06 M de parámetros del artefacto; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU para pruebas de integración.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Sentence Transformers (librería declarada), Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad de retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/st-colbertv2-0-mic | 2,06 M (reducidos, aleatorios) | no disponible | nula (pesos aleatorios) | no disponible | HuggingFace |
| colbert-ir/colbertv2.0 | BERT-base (~110 M) | 512 tokens (modelo base) | estado del arte en su momento | no disponible en la información proporcionada | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | buena para búsqueda semántica ligera | Apache 2.0 | HuggingFace |

La comparación con `colbert-ir/colbertv2.0` es la más directa, ya que el artefacto deriva de él, pero solo comparte arquitectura y configuración de pipeline, no pesos ni calidad. Frente a `all-MiniLM-L6-v2`, la diferencia es de propósito: aquel es un modelo denso de recuperación listo para producción, mientras que este es un fixture de test.

## Limitaciones y advertencias

- Los pesos son aleatorios: no deben usarse para recuperación, búsqueda semántica ni ninguna tarea de producción.
- No se ha publicado información sobre sesgos, porque no hay un modelo entrenado subyacente en este repositorio.
- Riesgo de alucinación no aplicable: el artefacto no es un modelo generativo.
- Licencia no disponible: antes de cualquier uso, conviene verificar la licencia del modelo base `colbert-ir/colbertv2.0` y del propio repositorio.
- El tamaño del repositorio aparece como 0.0 GB en HuggingFace, lo que puede deberse al redondeo de un artefacto muy pequeño; no debe interpretarse como un repositorio vacío.
- No apto para benchmarks de calidad: cualquier métrica obtenida sobre este artefacto no es extrapolable al modelo fuente.
- Fecha de creación futura (2026-11-03) en los metadatos de HuggingFace: conviene tratarla con cautela y verificar la integridad del repositorio antes de usarlo en CI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tomaarsen/st-colbertv2-0-mic
- Modelo base: https://huggingface.co/colbert-ir/colbertv2.0
- Manifiesto de contrato: https://huggingface.co/tomaarsen/st-colbertv2-0-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-colbertv2-0-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-colbertv2-0-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-colbertv2-0-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-colbertv2-0-mic.html
