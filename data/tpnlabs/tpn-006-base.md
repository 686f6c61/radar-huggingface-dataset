# tpnlabs/tpn-006-base

## Resumen

TPN-006-base es un repositorio archivado publicado por tpnlabs que no contiene pesos de modelo. Su funcion es exclusivamente preservar la identidad y la procedencia del artefacto base empleado por la competicion interna tpn-006: un fichero GGUF de 16 987 559 840 bytes (aproximadamente 16,99 GB) identificado como `Ministral-3-8B-Uncensored.f16.gguf`, con SHA-256 `563910ff689748e32e6da0805949256d68d34691f6125f98b1d06d50c7382c8c`.

El modelo base real es `mradermacher/Ministral-3-8B-Uncensored-GGUF`, una cuantizacion en formato GGUF de Ministral 3 8B, un modelo de la familia Ministral de Mistral AI con 8 000 millones de parametros y ajuste "uncensored" realizado por mradermacher. Segun la model card, el repositorio tpn-006-base es un duplicado de tpn-005-base y coincide exactamente con el SHA-256 del fichero LFS upstream.

Es relevante unicamente como referencia historica de reproducibilidad: cualquier persona que quiera reconstruir la entrada de la competicion debe descargar el fichero desde la revision fijada `ecfa3da1f4ea15f483d344c6d539cebd3f14e5f9` del repositorio upstream y verificar el hash. No es un modelo desplegable por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base upstream es Ministral 3 8B; la arquitectura concreta no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre del artefacto indica 8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (GGUF, segun el nombre del fichero archivado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (el repositorio tpn-006-base no contiene pesos; solo referencia el artefacto) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. El artefacto referenciado es una conversion a GGUF en precision f16 de `Ministral-3-8B-Uncensored`, un ajuste de Ministral 3 8B realizado por mradermacher. El proceso de ajuste "uncensored" implica presumiblemente un fine-tuning que elimina o reduce los rechazos del modelo original, pero no se especifican en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

El repositorio tpn-006-base en si no contiene entrenamiento ni pesos: es un contenedor de metadatos con el SHA-256, el tamano del fichero, la revision upstream fijada y la relacion con tpn-005-base. La innovacion tecnica relevante aqui es la trazabilidad: se fija una revision concreta (`ecfa3da...`) y un hash LFS para garantizar que la reproduccion del artefacto sea verificable.

## Capacidades

- No hay informacion disponible sobre las capacidades especificas del modelo en la documentacion proporcionada.
- El modelo base upstream es un modelo de lenguaje de 8B parametros, por lo que cabe esperar generacion de texto y razonamiento general, pero no se confirma en la informacion disponible.
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se confirman capacidades multilingues ni idiomas soportados.
- El ajuste "uncensored" sugiere una menor tasa de rechazos ante peticiones, pero no se detalla su alcance.

## Casos de uso

- Reproduccion historica de competiciones: descargar el fichero GGUF desde la revision upstream fijada y verificar el SHA-256 para reconstruir exactamente la entrada usada en tpn-006.
- Auditoria de procedencia: comprobar que un artefacto candidato coincide con el original mediante comparacion de hash, sin necesidad de conservar los 16,99 GB del fichero.
- Verificacion de integridad en pipelines: integrar la comprobacion del SHA-256 en un script de CI para validar descargas del modelo base antes de ejecutar evaluaciones.
- Archivado ligero de artefactos: mantener la identidad de un modelo grande en un repositorio de pocos kilobytes cuando la organizacion ya no necesita alojar los pesos.
- Referencia en documentacion interna: enlazar a tpn-006-base como fuente canonica del artefacto usado en la competicion, evitando ambiguedades sobre la revision.
- Migracion a referencias upstream: sustituir mirrors locales por la revision fijada del repositorio de mradermacher, reduciendo coste de almacenamiento y manteniendo la reproducibilidad.
- Punto de partida para fine-tuning posterior: usar el GGUF upstream como base para experimentos propios, aunque requeriria herramientas de conversion o despliegue compatibles con GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero f16 ocupa 16,99 GB, por lo que la inferencia en f16 requiere al menos unos 17-18 GB de VRAM para los pesos, mas overhead de contexto y KV cache.
- Cuantizaciones menores (Q8, Q6, Q5, Q4) del mismo modelo base reducirian el requisito, pero no se proporcionan en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una GPU con 24 GB (RTX 3090, RTX 4090) o superior (A100 40/80 GB, H100) seria adecuada para f16.
- Cabe en GPU consumer de 24 GB en f16 con contexto limitado; en cuantizaciones de 4-8 bits cabria en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; vLLM y TGI no se confirman para este artefacto en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tpn-006-base | no disponible (referencia a 8B) | no disponible | solo metadatos | no disponible | archivado, sin pesos |
| mradermacher/Ministral-3-8B-Uncensored-GGUF | 8B (segun nombre) | no disponible | GGUF f16 | no disponible | upstream con pesos |
| Ministral 3 8B (original de Mistral AI) | 8B | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no se puede desplegar directamente desde tpn-006-base.
- No se especifica licencia, lo que impide confirmar si el uso comercial esta permitido; ademas, la licencia del ajuste "uncensored" puede diferir de la del modelo original de Mistral AI.
- El ajuste "uncensored" puede aumentar el riesgo de generar contenido inapropiado, ofensivo o danino; requiere moderacion externa en produccion.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- No se confirman idiomas soportados ni calidad multilingue.
- La informacion de arquitectura, contexto y entrenamiento es insuficiente para evaluar el modelo con rigor.
- El estado "archived" indica que el repositorio no se mantiene; los enlaces y revisiones pueden quedar obsoletos.
- La fecha de creacion indicada (2026-11-23) es futura respecto a la mayoria de referencias habituales; conviene verificar la coherencia temporal de los metadatos.

## Enlaces

- Repositorio tpn-006-base: https://huggingface.co/tpnlabs/tpn-006-base
- Modelo base upstream: https://huggingface.co/mradermacher/Ministral-3-8B-Uncensored-GGUF
- Revision fijada upstream: https://huggingface.co/mradermacher/Ministral-3-8B-Uncensored-GGUF/tree/ecfa3da1f4ea15f483d344c6d539cebd3f14e5f9
