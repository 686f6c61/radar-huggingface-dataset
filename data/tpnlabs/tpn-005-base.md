# tpnlabs/tpn-005-base

## Resumen

TPN-005-base es un repositorio archivado de Hugging Face publicado por la organizacion tpnlabs que no contiene pesos de modelo. Su funcion es preservar la identidad y la procedencia del artefacto base empleado por el modelo de competicion tpn-005, un fichero GGUF de tipo `Ministral-3-8B-Uncensored.f16.gguf` de 16 987 559 840 bytes (aproximadamente 16,99 GB) con hash SHA-256 `563910ff689748e32e6da0805949256d68d34691f6125f98b1d06d50c7382c8c`. Segun la model card, el espejo GGUF de gran tamano fue retirado de la organizacion TPN Labs el 23 de noviembre de 2026 porque las competiciones actuales referencian directamente los modelos upstream.

El modelo base declarado es `mradermacher/Ministral-3-8B-Uncensored-GGUF`, fijado en la revision `ecfa3da1f4ea15f483d344c6d539cebd3f14e5f9`, y la relacion entre ambos se acredita mediante coincidencia exacta del SHA-256 en LFS. Por tanto, cualquier dato tecnico sobre arquitectura, contexto o entrenamiento debe remitirse al modelo upstream (una variante uncensored de Ministral 3 8B, de Mistral AI, cuantizada en formato GGUF por mradermacher), no a este repositorio, que es unicamente un registro de trazabilidad.

Su relevancia actual es limitada y muy especifica: sirve como ancla de reproducibilidad para verificar inputs historicos de competiciones y para auditar la cadena de custodia del artefacto. No es un modelo desplegable ni un punto de partida para inferencia, ya que no incluye pesos ni tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en este repositorio (corresponde al modelo upstream Ministral 3 8B) |
| Parametros totales | no disponible en este repositorio (el nombre del upstream indica 8B) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el artefacto archivado es F16 (fichero `.f16.gguf`); no se listan otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ninguno incluido; se documenta un artefacto GGUF F16 de 16 987 559 840 bytes |

## Arquitectura y entrenamiento

Este repositorio no contiene pesos ni documentacion de entrenamiento. La unica informacion tecnica verificable es la del artefacto archivado: un fichero GGUF en precision F16 de 16 987 559 840 bytes, con SHA-256 `563910ff689748e32e6da0805949256d68d34691f6125f98b1d06d50c7382c8c`, procedente de la revision `e6d8014afe8ad9afa1d7c52045514ada6a2d752f` del repositorio original y con correspondencia exacta con el fichero `Ministral-3-8B-Uncensored.f16.gguf` de la revision fijada `ecfa3da1f4ea15f483d344c6d539cebd3f14e5f9` de `mradermacher/Ministral-3-8B-Uncensored-GGUF`.

No se documentan en la informacion disponible detalles sobre arquitectura interna (tipo de transformer, atencion, ventana de contexto nativa), volumen o composicion de datos de entrenamiento, ni etapas de alineacion como RLHF o DPO. El sufijo "Uncensored" del modelo upstream sugiere un ajuste orientado a retirar capas de rechazo, pero este repositorio no aporta metodologia ni evidencia al respecto. Para reproducir el input historico de competicion, la propia model card indica usar la fuente upstream fijada y verificar el GGUF resultante contra el SHA-256 archivado.

## Capacidades

- No se puede afirmar ninguna capacidad operativa del repositorio: no contiene pesos, tokenizer, configuracion ni pipeline declarado.
- Las capacidades funcionales corresponderian al modelo upstream `mradermacher/Ministral-3-8B-Uncensored-GGUF` (variante uncensored de Ministral 3 8B), no documentadas en esta ficha por falta de informacion proporcionada.
- No se declara soporte de tool calling, function calling ni uso como agente.
- No se declara modo de razonamiento explicito (thinking mode), vision ni audio.
- No se declara cobertura multilingue concreta.
- La unica capacidad efectiva del repositorio es la verificacion de procedencia: comprobacion de integridad por SHA-256 y trazabilidad de revisiones.

## Casos de uso

- Reproducibilidad de competiciones historicas: usar la revision fijada del upstream y validar el SHA-256 del GGUF descargado contra `563910ff...c7382c8c` para reconstruir exactamente el input original de tpn-005.
- Auditoria de cadena de custodia: documentar en un registro interno que un artefacto concreto deriva de una revision concreta de `mradermacher/Ministral-3-8B-Uncensored-GGUF`, con prueba criptografica de identidad.
- Verificacion de integridad en pipelines de CI: integrar la comprobacion de hash como paso previo a cualquier evaluacion que dependa del artefacto archivado.
- Archivado a largo plazo de metadatos: conservar identificadores inmutables (hash, tamano, revision) cuando el espejo de pesos ya no esta disponible publicamente.
- Trazabilidad de linaje de modelos derivados: enlazar fine-tunes o variantes posteriores a este nodo de procedencia para mantener un grafo de ascendencia verificable.
- Referencia documental en informes tecnicos: citar el repositorio como fuente primaria del artefacto base sin necesidad de redistribuir los 16,99 GB del GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica a este repositorio, que no contiene pesos. Como referencia del artefacto archivado, un GGUF F16 de 16 987 559 840 bytes requiere del orden de 17 GB solo para los pesos, mas overhead de contexto y runtime.
- GPU recomendadas: no disponibles para este repositorio. Para el artefacto F16 referenciado, serian necesarias GPU con 24 GB o mas de memoria (por ejemplo, RTX 4090, A100 40/80 GB, H100) para cargar los pesos completos.
- Compatibilidad con GPU de consumo: el F16 referenciado no cabe en GPU de consumo de 8-16 GB; requeriria cuantizaciones menores del upstream, no documentadas aqui.
- Opciones de despliegue: no aplicables a este repositorio. El formato GGUF del artefacto referenciado es compatible con llama.cpp y derivados (Ollama, llama-cpp-python), pero no se aportan configuraciones ni plantillas en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos incluidos | Licencia | Proposito |
|---|---|---|---|---|---|
| tpnlabs/tpn-005-base (este repositorio) | no disponible (upstream 8B) | no disponible | No (solo metadatos) | no disponible | Archivo de procedencia |
| mradermacher/Ministral-3-8B-Uncensored-GGUF | 8B (segun nombre) | no disponible | Si (GGUF) | no disponible | Modelo upstream cuantizado |
| Ministral 3 8B (Mistral AI, original) | 8B | no disponible en esta informacion | Si | no disponible en esta informacion | Modelo base original |

La comparativa se limita a la relacion de linaje; no se dispone de datos de rendimiento ni de contexto para contrastar capacidades entre alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es utilizable para inferencia ni para evaluacion directa.
- La licencia no esta declarada en este repositorio; antes de cualquier uso comercial debe verificarse la licencia del upstream `mradermacher/Ministral-3-8B-Uncensored-GGUF` y, en ultima instancia, la del modelo original de Mistral AI.
- El calificativo "Uncensored" del upstream implica, en principio, menor filtrado de contenido; no se documentan aqui sus efectos concretos ni sus riesgos de seguridad.
- Riesgo de alucinacion y sesgos: no evaluables desde este repositorio; dependen del modelo upstream y de sus datos de entrenamiento, no documentados.
- El espejo de pesos fue retirado el 23 de noviembre de 2026; la reproducibilidad depende de que la revision fijada del upstream siga disponible.
- Repositorio marcado como `archived`: no recibira actualizaciones ni soporte.
- Cualquier afirmacion sobre contexto, idiomas o capacidades de tpn-005 debe contrastarse contra la documentacion del upstream, no contra esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tpnlabs/tpn-005-base
- Modelo upstream: https://huggingface.co/mradermacher/Ministral-3-8B-Uncensored-GGUF
- Revision fijada del upstream: https://huggingface.co/mradermacher/Ministral-3-8B-Uncensored-GGUF/tree/ecfa3da1f4ea15f483d344c6d539cebd3f14e5f9
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
