# tpnlabs/tpn-004-base

## Resumen

TPN-004-base es un repositorio archivado de TPN Labs que no contiene pesos de modelo. Su función es preservar la identidad y la procedencia del artefacto base empleado por el modelo de competición tpn-004: un fichero GGUF en precisión BF16 de 47.153.521.920 bytes (aproximadamente 47,15 GB) derivado del modelo comunitario llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF. El repositorio se creó el 23 de noviembre de 2026 y se marcó como archived, con cero descargas y cero likes en el momento de la consulta.

El modelo base último es un fine-tune comunitario de Magistral Small 2509, la familia de modelos de razonamiento de Mistral AI publicada en septiembre de 2025. La cadena de derivación incluye, por tanto, tres capas: el modelo original de Mistral, un fine-tune "ultra-uncensored-heretic" de llmfan46 y el artefacto de competición de TPN Labs. La model card del repositorio no documenta arquitectura, parámetros, contexto ni licencia; solo aporta metadatos de procedencia y verificación criptográfica.

La relevancia de esta ficha es fundamentalmente operativa: sirve para localizar el artefacto original, verificar su integridad mediante SHA-256 y entender por qué el repositorio ya no es descargable. Para cualquier uso práctico debe acudirse al repositorio upstream fijado en la revisión d302e35c7dee3a54f8a46dbb101e09ac2548dc45.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base último: Magistral Small 2509, familia Mistral; arquitectura concreta no documentada en la información disponible) |
| Parametros totales | no disponible (el artefacto BF16 pesa 47.153.521.920 bytes, lo que sugiere una magnitud de decenas de miles de millones de parámetros, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el artefacto archivado es BF16 en formato GGUF; no se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero Magistral-Small-2509-ultra-uncensored-heretic-v2-BF16.gguf); este repositorio no contiene pesos |
| SHA-256 del artefacto | 5d425b36eeff7ce52ef3c24586717154f50cdd3a073a5d8bda986ebeb511a487 |
| Tamano del artefacto | 47.153.521.920 bytes |
| Revision upstream fijada | d302e35c7dee3a54f8a46dbb101e09ac2548dc45 |
| Head original del repositorio | 494e5f917fa5ece754edf7474be7b047bed8316a |
| Estado | archived |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo en la documentación proporcionada. El repositorio TPN-004-base es un contenedor de metadatos: su model card declara explícitamente que "intentionally contains no model weights" y que el espejo GGUF de gran tamaño fue eliminado de la organización TPN Labs el 23 de noviembre de 2026 porque las competiciones actuales referencian los modelos upstream directamente.

La única información técnica verificable es la cadena de procedencia. El artefacto original es un GGUF en BF16 con coincidencia exacta de SHA-256 LFS respecto al fichero upstream del repositorio llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF, en la revisión d302e35c7dee3a54f8a46dbb101e09ac2548dc45. El nombre del fichero indica que se trata de una variante "ultra-uncensored-heretic" de Magistral Small 2509, lo que en la práctica comunitaria suele implicar un fine-tune orientado a reducir los rechazos del modelo base, pero no se documenta ni el método ni el volumen de datos empleados.

No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícitos en la información disponible, más allá de lo que pueda heredar del modelo Magistral original, extremo que no se confirma en este repositorio.

## Capacidades

- No se documentan capacidades específicas en la model card de TPN-004-base.
- Por herencia del nombre del modelo base (Magistral Small 2509), es razonable esperar capacidades de generación de texto y razonamiento, pero este extremo no se verifica en la información proporcionada.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirman capacidades multilingües ni los idiomas cubiertos.
- No se confirman capacidades de visión, audio ni modos de pensamiento explícitos.
- El artefacto es un GGUF, lo que implica compatibilidad potencial con motores de inferencia basados en llama.cpp, pero no se detalla en la documentación.

## Casos de uso

- Verificación de procedencia en competiciones: el repositorio permite comprobar que un artefacto GGUF concreto corresponde al input histórico de tpn-004 comparando su SHA-256 con 5d425b36eeff7ce52ef3c24586717154f50cdd3a073a5d8bda986ebeb511a487, lo que resulta útil para auditar envíos o reproducir evaluaciones pasadas.
- Reproducción de resultados históricos: para reconstruir el input original de una competición, se descarga el fichero BF16 desde la revisión upstream fijada y se valida el hash; este repositorio actúa como referencia inmutable de esa revisión.
- Archivado y trazabilidad de linaje de modelos: equipos que mantienen catálogos internos de modelos pueden enlazar este repositorio para documentar la cadena Mistral → fine-tune comunitario → artefacto de competición sin almacenar 47 GB de pesos.
- Auditoría de licencias y cumplimiento: al no contener pesos, el repositorio evita redistribuir el artefacto; un equipo legal puede usar la cadena de procedencia para rastrear obligaciones de licencia hasta el modelo original, aunque la licencia concreta no se documenta aquí.
- Migración a referencias upstream: organizaciones que aún apuntan a espejos eliminados pueden sustituir sus URLs por la revisión fijada d302e35c7dee3a54f8a46dbb101e09ac2548dc45, reduciendo dependencias de espejos de terceros.
- Formación y documentación interna: sirve como ejemplo de buenas prácticas de archivado (hash, revisión fijada, tamaño exacto) para equipos que publican artefactos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio no contiene pesos, por lo que no es ejecutable por sí mismo.
- El artefacto referenciado es un GGUF BF16 de 47.153.521.920 bytes (unos 47,15 GB); su carga completa en memoria requeriría al menos esa cantidad de VRAM o de RAM unificada, sin contar overhead del motor de inferencia.
- Para inferencia en GPU con el fichero BF16 harían falta aceleradores con 48 GB o más de VRAM (por ejemplo, A100 80 GB, H100 80 GB, o configuraciones multi-GPU); no se dispone de datos confirmados de requisitos oficiales.
- No cabe en GPUs de consumo con el artefacto BF16; serían necesarias cuantizaciones adicionales del modelo upstream, que no se documentan en este repositorio.
- Opciones de despliegue potenciales: motores compatibles con GGUF como llama.cpp u Ollama, si bien no se confirma compatibilidad ni rendimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tpnlabs/tpn-004-base | no disponible | no disponible | no disponible | Archivado, sin pesos | Solo metadatos de procedencia |
| llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF | no disponible | no disponible | no disponible | Upstream disponible en revisión fijada | Origen directo del artefacto |
| Magistral Small 2509 (Mistral AI) | no disponible en esta información | no disponible | no disponible | Modelo original de referencia | Base de la cadena de fine-tunes |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no puede usarse para inferencia ni para evaluación directa.
- La model card no documenta licencia, idiomas, arquitectura ni contexto, lo que impide evaluar su idoneidad para producción a partir de esta fuente.
- El modelo base es un fine-tune "ultra-uncensored-heretic", lo que en la práctica comunitaria suele asociarse a una reducción de filtros de seguridad; no se documenta el alcance de esa modificación ni sus riesgos, pero conviene tratarlo con cautela en despliegues orientados al público.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Restricciones de licencia para uso comercial: no disponibles; deben verificarse en el repositorio upstream y en el modelo original de Mistral.
- El estado archived implica que no recibirá actualizaciones ni soporte por parte de TPN Labs.
- Cualquier reproducción debe validar el SHA-256 contra el valor archivado para evitar artefactos alterados.

## Enlaces

- Repositorio archivado: https://huggingface.co/tpnlabs/tpn-004-base
- Modelo upstream: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF
- Revisión upstream fijada: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF/tree/d302e35c7dee3a54f8a46dbb101e09ac2548dc45
