# tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic

## Resumen

`tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic` es un artefacto de prueba (fixture) publicado en Hugging Face por Tomas Aarsen, colaborador habitual del ecosistema Sentence Transformers. No es un modelo entrenado para producción, sino una versión "adelgazada" (shrunk) del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, reducida a 2.057.601 parámetros y empaquetada junto con un manifiesto de contrato (`integration.json`), ejemplos de uso para Transformers y las expectativas de framework que debe cumplir la integración.

El propósito del repositorio es servir como banco de pruebas reproducible: permite verificar que una integración (por ejemplo, la carga del modelo en `sentence-transformers` o en `transformers`) funciona correctamente sin necesidad de descargar los pesos completos del modelo original. La propia model card advierte que los pesos están sobreajustados (overfit) y no representan la calidad de recuperación del modelo fuente.

Por tanto, su relevancia es exclusivamente técnica y de ingeniería de software: no debe emplearse para ranking, búsqueda semántica ni ninguna tarea de recuperación real. Su valor está en la validación de pipelines y en la cobertura de tests de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base del cross-encoder ms-marco-MiniLM-L6-v2) |
| Parametros totales | 2.057.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, es decir, un transformer BERT de tipo encoder utilizado para scoring de pares consulta-documento. Sin embargo, los pesos publicados en este repositorio han sido reducidos y sobreajustados deliberadamente mediante un proceso de "shrink" documentado en el enlace de procedencia del fixture. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que no se trata de un modelo entrenado de forma convencional.

La innovación técnica del repositorio no está en el modelo en sí, sino en el empaquetado: incluye un manifiesto de contrato (`integration.json`) que declara qué debe esperar el framework al cargar el modelo, junto con directorios de expectativas (`integrations/transformers/expectations`) y ejemplos de uso. Este formato permite tests de integración deterministas y ligeros.

## Capacidades

- Inferencia de cross-encoding para pares de texto (consulta, documento) a nivel de contrato de API.
- Carga mediante la librería `sentence-transformers` y mediante `transformers`.
- Verificación de expectativas de framework declaradas en el repositorio.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni de agentes.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Tests de integración en CI: el fixture permite validar que una versión de `sentence-transformers` o `transformers` carga correctamente un cross-encoder sin descargar pesos completos, reduciendo el tiempo y el ancho de banda de la suite de pruebas.
- Validación de contratos de framework: el manifiesto `integration.json` y el directorio de expectativas se pueden usar para comprobar que una integración cumple el contrato declarado antes de publicar una release.
- Desarrollo de herramientas de serialización: sirve para probar rutinas de carga/guardado de safetensors y de configuración de tokenizer en un modelo mínimo.
- Reproducción de incidencias: al ser un artefacto pequeño y determinista, facilita la reproducción de bugs reportados en la carga de cross-encoders.
- Formación y documentación: útil como ejemplo didáctico de cómo se estructura un repositorio de modelo con contrato de integración y fixtures.
- Cobertura de tests en forks: permite a mantenedores de forks de `sentence-transformers` verificar compatibilidad sin depender del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los pesos están sobreajustados y no representan la calidad de recuperación del modelo fuente, por lo que cualquier métrica de ranking carecería de validez.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (2,06 M de parámetros), holgadamente por debajo de 100 MB en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` y `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de recuperación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic | 2.057.601 | no disponible | no válida (fixture sobreajustado) | no disponible | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L6-v2 | no disponible en la informacion proporcionada | no disponible | modelo de referencia para reranking | no disponible | Hugging Face |
| Otros cross-encoders MiniLM de Sentence Transformers | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al modelo base del que deriva el fixture; no se dispone de datos de benchmarks ni de parámetros del modelo original en la información proporcionada.

## Limitaciones y advertencias

- Los pesos están sobreajustados y no representan la calidad de recuperación del modelo fuente; no deben usarse en producción para ranking o búsqueda.
- Es un artefacto de prueba (`test-artifact`), no un modelo entrenado para tareas reales.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- Licencia no disponible: no se puede confirmar si permite uso comercial.
- Longitud de contexto no documentada.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que puede tratarse de un paquete mínimo o incompleto; conviene verificar la integridad de los archivos antes de usarlo.
- No apto para despliegue en pipelines de recuperación, atención al cliente ni generación de código.

## Enlaces

- [Hugging Face: tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic](https://huggingface.co/tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/tomaarsen/st-ms-marco-MiniLM-L-6-v2-mic/blob/main/build.json)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-ms-marco-MiniLM-L-6-v2-mic.html)
- [Modelo base: cross-encoder/ms-marco-MiniLM-L6-v2](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2)
