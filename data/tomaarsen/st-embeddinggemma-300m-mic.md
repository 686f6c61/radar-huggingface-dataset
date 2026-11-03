# tomaarsen/st-embeddinggemma-300m-mic

## Resumen

`tomaarsen/st-embeddinggemma-300m-mic` es un artefacto de prueba (fixture) publicado en HuggingFace por Tomaarsen, colaborador habitual del ecosistema `sentence-transformers`. No es un modelo entrenado para producción: se trata de una versión "adelgazada" (shrunk) del modelo de embeddings `google/embeddinggemma-300m`, generada para validar la integración de frameworks y contratos de ejecución. Sus pesos son aleatorios y, tal como advierte el propio autor en la model card, no representan la calidad de recuperación del modelo original.

El repositorio incluye un manifiesto de contrato (`integration.json`), documentación de uso con Transformers, expectativas de framework y procedencia del fixture (`build.json`), además de un enlace al proceso de reducción aplicado. Está etiquetado con `mic`, `test-artifact` y `base_model:google/embeddinggemma-300m`, lo que deja claro su carácter de artefacto de test.

Por tanto, su relevancia no es la de un modelo de embeddings utilizable, sino la de una pieza de infraestructura para testear pipelines de `sentence-transformers` y Transformers con un modelo de arquitectura Gemma 3 text de tamaño reducido. Cualquier evaluación de calidad de embeddings debe hacerse sobre el modelo base real, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only, según tag del repo; arquitectura del modelo base) |
| Parametros totales | 16.847.488 (pesos del fixture, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | google/embeddinggemma-300m |
| Tamano del repo | 0.1 GB |
| Proposito | fixture de test (pesos aleatorios) |

## Arquitectura y entrenamiento

El fixture deriva del modelo `google/embeddinggemma-300m`, cuya arquitectura es de tipo Gemma 3 text según los tags del repositorio. Sin embargo, los pesos incluidos en este artefacto han sido reducidos ("shrunk") y son aleatorios: no han pasado por ningún proceso de entrenamiento, fine-tuning, RLHF ni DPO. El autor lo declara explícitamente en la model card: "Its weights are random and do not represent the source model's retrieval quality".

El repositorio documenta el proceso de reducción mediante un enlace al sitio de cobertura de MIC, e incluye un fichero `build.json` con la procedencia del fixture y un `integration.json` con el contrato de ejecución esperado. La innovación técnica, si puede llamarse así, es la de empaquetar en un único repositorio los pesos reducidos, el uso ejecutable y las expectativas de framework, de modo que las herramientas de integración continua puedan validar la compatibilidad con `sentence-transformers` y Transformers sin descargar el modelo completo.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen embeddings con semántica útil.
- Sirve como fixture para validar la carga de modelos `sentence-transformers` con arquitectura Gemma 3 text.
- Permite testear contratos de integración (manifiesto `integration.json`) y expectativas de framework.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.
- No soporta generación de texto ni visión; el pipeline no está disponible.
- Utilidad exclusiva en entornos de CI/CD y pruebas de compatibilidad.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con `sentence-transformers` para verificar que el pipeline de carga y el contrato de ejecución funcionan sin descargar el modelo completo de 300M.
- Validación de expectativas de framework: comprobar que las versiones de Transformers y `sentence-transformers` cumplen las expectativas documentadas en `integrations/transformers/expectations`.
- Test de regresión de serialización: verificar que los pesos safetensors y la configuración del pipeline se cargan correctamente tras cambios en la librería.
- Desarrollo de herramientas de inspección de modelos: usar un repositorio pequeño (0.1 GB) para probar scripts que leen `integration.json` y `build.json`.
- Reproducción del proceso de reducción: el enlace al sitio de MIC permite auditar cómo se generó el fixture y replicar el procedimiento con otros modelos base.
- Docencia y demos de estructura de repositorio: mostrar cómo se organiza un artefacto de test con contrato, procedencia y expectativas en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo base, por lo que cualquier métrica de retrieval sería inválida.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 16,8M de parámetros del fixture; en la práctica, cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente para cargar y ejecutar el fixture.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o inferior, y también en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` (librería declarada), Transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/st-embeddinggemma-300m-mic | 16,8M (fixture) | no disponible | Fixture de test | no disponible | HuggingFace |
| google/embeddinggemma-300m | 300M (aprox.) | no disponible | Embeddings de recuperación | no disponible | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7M | 256 tokens | Embeddings ligeros | Apache 2.0 | HuggingFace |

La comparación con `all-MiniLM-L6-v2` es solo orientativa por tamaño: el fixture no es un modelo de embeddings funcional. El modelo base `google/embeddinggemma-300m` es la referencia real para evaluar calidad de recuperación.

## Limitaciones y advertencias

- Pesos aleatorios: no producen embeddings semánticos; cualquier uso en producción daría resultados sin sentido.
- No es un modelo entrenado: no ha pasado por preentrenamiento, fine-tuning ni alineación.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `google/embeddinggemma-300m`.
- Idiomas no disponibles: no se declara cobertura lingüística.
- Contexto no disponible: no se documenta la longitud máxima de secuencia.
- Calidad de recuperación nula por diseño; el autor lo advierte explícitamente.
- No apto para benchmarks, evaluación de sesgos ni comparativas de rendimiento.
- Uso recomendado exclusivamente en tests automatizados y validación de integraciones.

## Enlaces

- HuggingFace: https://huggingface.co/tomaarsen/st-embeddinggemma-300m-mic
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Proceso de reducción del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-embeddinggemma-300m-mic.html
- Contrato de integración: https://huggingface.co/tomaarsen/st-embeddinggemma-300m-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-embeddinggemma-300m-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-embeddinggemma-300m-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-embeddinggemma-300m-mic/blob/main/build.json
