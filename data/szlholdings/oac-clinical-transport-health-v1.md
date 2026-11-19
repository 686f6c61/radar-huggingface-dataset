# SZLHOLDINGS/oac-clinical-transport-health-v1

## Resumen

oac-clinical-transport-health-v1 es un repositorio publicado en Hugging Face por SZLHOLDINGS bajo la etiqueta "research-artifact". No se trata de un modelo entrenado con pesos publicados al uso: la model card describe un "estate repository" publicado durante una pasada de exposicion publica ("public-showcase pass") y no documenta arquitectura, parametros, contexto ni proceso de entrenamiento. El repositorio aparece creado el 5 de septiembre de 2026 y actualizado el 19 de noviembre de 2026.

La informacion disponible se limita a metadatos de Hugging Face (0 descargas, 0 likes, tags `szl-holdings`, `research-artifact`, `region:us`) y a una model card centrada en una revision de licencia y PHI realizada de forma automatizada el 19 de noviembre de 2026. El hallazgo de esa revision es que el contenido incluye material de fuentes externas con marcadores de licencia de tipo no comercial y share-alike, por lo que el estado de licencia se declara explicitamente como "mixed-provenance, NOT clean-room".

Por tanto, no es posible evaluar este artefacto como modelo de IA en terminos de capacidades, rendimiento o despliegue: la informacion proporcionada no contiene descripcion tecnica del modelo. Su relevancia actual es como artefacto de investigacion con trazabilidad de procedencia y una advertencia explicita de licencia mixta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixta, procedencia no limpia ("mixed-provenance, NOT clean-room"); verificacion por fuente requerida para uso comercial |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM, hibrida u otra) ni sobre el proceso de entrenamiento, volumen de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO. La model card no contiene seccion tecnica al respecto.

El unico proceso documentado es una revision automatizada de licencia y PHI ejecutada el 19 de noviembre de 2026, con recibo en `mesh/license-review-pass1-20261119T154322Z.json` dentro de `SZLHOLDINGS/khipu-scholar-runs`. El resultado de esa revision es que el contenido incorpora material de fuentes externas con marcadores de licencia no comercial y share-alike, y que el trabajo de atribucion a nivel de fila queda registrado como pendiente en el ledger del estate. La model card declara explicitamente que no hay afirmaciones de descifrado y que los valores de procedencia y mediciones, cuando existen, se registran en los recibos del mesh y en el ledger, no en la propia card.

## Capacidades

- No disponible. La informacion proporcionada no describe ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, matematicas, vision, audio).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documentan modos especiales (thinking mode, vision, audio u otros).

## Casos de uso

- Auditoria de procedencia de artefactos de investigacion: el repositorio incluye un recibo de revision de licencia y PHI que puede usarse como ejemplo de trazabilidad documental en pipelines de cumplimiento, aunque la atribucion por fila esta pendiente.
- Revision de cumplimiento de licencias en datasets mixtos: la declaracion explicita de "mixed-provenance, NOT clean-room" sirve como caso de referencia para disenar verificaciones por fuente antes de un uso comercial.
- Documentacion de estado de publicacion en repositorios de investigacion: el patron de "estate ledger" y recibos en un repositorio separado puede replicarse para registrar pasadas de revision automatizada.
- Formacion interna sobre gestion de PHI: el registro de una revision automatizada de PHI en la card puede usarse como plantilla de documentacion, sin que ello implique que el contenido este libre de datos sensibles.
- Evaluacion de riesgos antes de reutilizar material de terceros: util para equipos que necesiten un ejemplo de advertencia de licencia no resuelta.
- No se puede recomendar su uso como modelo de inferencia (chat, codigo, RAG, agentes) porque no hay informacion sobre pesos, arquitectura ni capacidades que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del artefacto (no se confirma que sea un modelo con pesos) ni modelos comparables en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Estado de licencia mixto y no limpio ("mixed-provenance, NOT clean-room"): los usuarios deben verificar los terminos de cada fuente antes de cualquier uso comercial.
- Presencia de material de fuentes externas con marcadores de licencia no comercial y share-alike, lo que puede impedir o condicionar el uso comercial del contenido.
- Atribucion a nivel de fila pendiente en el ledger del estate: la trazabilidad completa de las fuentes no esta resuelta.
- Revision de PHI realizada de forma automatizada: una revision automatica no garantiza la ausencia de datos sensibles; se requiere verificacion adicional antes de manipular el contenido.
- Ausencia total de informacion tecnica (arquitectura, parametros, contexto, idiomas): no es posible evaluar sesgos, riesgo de alucinacion ni idoneidad para produccion.
- Sin descargas ni likes registrados y sin pipeline declarado en Hugging Face: no hay evidencia de uso o validacion por terceros.
- No se deben extraer conclusiones de rendimiento ni de capacidades a partir de este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/oac-clinical-transport-health-v1
- Repositorio de recibos citado en la card: SZLHOLDINGS/khipu-scholar-runs (ruta `mesh/license-review-pass1-20261119T154322Z.json`); no se proporciona URL directa en la informacion disponible.
