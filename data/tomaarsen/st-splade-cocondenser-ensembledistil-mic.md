# tomaarsen/st-splade-cocondenser-ensembledistil-mic

## Resumen

`tomaarsen/st-splade-cocondenser-ensembledistil-mic` es un artefacto de prueba (fixture) publicado en Hugging Face, no un modelo entrenado para uso real. Se trata de una versión reducida ("slim") del modelo SPLADE `naver/splade-cocondenser-ensembledistil`, generada para validar la integración de la librería `sentence-transformers` con el ecosistema de contratos y expectativas de Hugging Face (denominado MIC en los tags). El propio autor advierte en la model card que los pesos son aleatorios y no representan la calidad de recuperación del modelo original.

El modelo base, SPLADE cocondenser ensembledistil, es un modelo BERT de recuperación dispersa (sparse retrieval) que produce representaciones léxicas expandidas para búsqueda. Este fixture conserva la arquitectura y el pipeline de `SparseEncoder` pero con solo 2.088.186 parámetros, una fracción mínima del modelo original, lo que lo hace útil exclusivamente como banco de pruebas de infraestructura.

Su relevancia es por tanto limitada al ámbito de testing: sirve para verificar que los contratos de integración (manifiesto `integration.json`, expectativas de Transformers, procedencia del fixture en `build.json`) funcionan correctamente antes de desplegar el modelo real. No debe confundirse con un modelo listo para producción ni para evaluación de calidad de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), pipeline SparseEncoder |
| Parametros totales | 2.088.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT del modelo original `naver/splade-cocondenser-ensembledistil`, que emplea un encoder transformer para generar representaciones dispersas (sparse) mediante la técnica SPLADE. SPLADE combina la expansión léxica aprendida con un mecanismo de ponderación de términos, produciendo vectores dispersos de alta dimensionalidad aptos para recuperación de información con índices invertidos.

Sin embargo, este repositorio concreto no contiene un modelo entrenado: según la model card, los pesos han sido reducidos ("shrunk") y reinicializados de forma aleatoria. El proceso de reducción está documentado en el enlace de procedencia del fixture. No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) aplicadas a este artefacto, porque no se ha entrenado. La innovación técnica relevante es la del modelo base (SPLADE con cocondenser y ensemble distillation), no la de este fixture.

## Capacidades

- Generación de embeddings dispersos compatibles con el pipeline `SparseEncoder` de `sentence-transformers`.
- Ejecución de la interfaz de uso definida en `integrations/transformers/usage.md`.
- Verificación de contratos de integración mediante `integration.json` y el directorio de expectativas de Transformers.
- Validación de la procedencia del fixture a través de `build.json`.
- No dispone de capacidades reales de recuperación: los pesos son aleatorios y no producen representaciones semánticamente útiles.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para verificar que el pipeline `SparseEncoder` carga y ejecuta correctamente en `sentence-transformers` antes de desplegar el modelo real.
- Validación de contratos de Hugging Face: comprobar que `integration.json` y el directorio de expectativas se cumplen en un entorno controlado.
- Desarrollo de herramientas de serialización: probar la carga y guardado de pesos safetensors con un modelo de tamaño mínimo (2 millones de parámetros).
- Test de pipelines de reducción de modelos: servir como referencia para verificar el proceso de "shrink" documentado en el enlace de procedencia.
- Pruebas de regresión en infraestructura de despliegue: validar que servidores de inferencia aceptan modelos con la firma de `SparseEncoder` sin consumir recursos significativos.
- Formación y documentación: ilustrar la estructura de un repositorio con manifiesto de integración, expectativas y procedencia para otros autores de fixtures.
- No es adecuado para búsqueda real, evaluación de calidad de recuperación ni ningún uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo original, por lo que cualquier medición sobre este artefacto carecería de validez.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión (2,09 millones de parámetros en safetensors).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; no requiere aceleración dedicada.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problemas de latencia significativos.
- Opciones de despliegue: `sentence-transformers` (librería nativa), `transformers` con el pipeline documentado; no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/st-splade-cocondenser-ensembledistil-mic | 2.088.186 | no disponible | Fixture de prueba | no disponible | Hugging Face |
| naver/splade-cocondenser-ensembledistil | no disponible | no disponible | SPLADE real | no disponible | Hugging Face |
| naver/splade-v3 | no disponible | no disponible | SPLADE real | no disponible | Hugging Face |

La comparación relevante es con el modelo base original, del cual este fixture es una versión reducida con pesos aleatorios. Cualquier otro modelo SPLADE de la familia `naver` sería una alternativa real para recuperación, mientras que este artefacto solo sirve para pruebas de infraestructura.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce representaciones semánticas útiles y no debe usarse para recuperación, ranking ni búsqueda real.
- El autor advierte explícitamente en la model card que no representa la calidad de recuperación del modelo original.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no se puede verificar cobertura multilingüe.
- Longitud de contexto no disponible: no se puede confirmar la ventana máxima de entrada.
- Sin datos de benchmarks: no hay evidencia de rendimiento que respalde su uso más allá de pruebas de integración.
- Riesgo de confusión: el nombre incluye el modelo base, lo que puede llevar a error si se busca el SPLADE real; verificar siempre el tag `test-artifact`.
- No apto para producción: cualquier despliegue en un sistema real produciría resultados sin sentido.

## Enlaces

- [Hugging Face: tomaarsen/st-splade-cocondenser-ensembledistil-mic](https://huggingface.co/tomaarsen/st-splade-cocondenser-ensembledistil-mic)
- [Modelo base: naver/splade-cocondenser-ensembledistil](https://huggingface.co/naver/splade-cocondenser-ensembledistil)
- [Procedencia del fixture (build.json)](https://huggingface.co/tomaarsen/st-splade-cocondenser-ensembledistil-mic/blob/main/build.json)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/tomaarsen/st-splade-cocondenser-ensembledistil-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/tomaarsen/st-splade-cocondenser-ensembledistil-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/tomaarsen/st-splade-cocondenser-ensembledistil-mic/tree/main/integrations/transformers/expectations)
- [Documentación del proceso de reducción](https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-splade-cocondenser-ensembledistil-mic.html)
