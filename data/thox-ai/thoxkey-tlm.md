# Thox-ai/ThoxKey-TLM

## Resumen

ThoxKey-TLM es un repositorio de Hugging Face publicado por THOX.AI LLC que **no contiene ningun modelo**. Se trata de un registro de nombre retirado (*name record*): la model card declara explicitamente que el repositorio nunca alojo pesos, tokenizer ni ficheros de configuracion, y que su unico contenido es un `.gitattributes` de 1.519 bytes. Fue marcado como `deprecated`, `retired` y `no-weights`, y su campo `base_model` original apuntaba a un repositorio de GitHub que no resuelve en el Hub, por lo que fue eliminado.

El nombre hacia referencia al modelo que supuestamente se integraba en el firmware de los dispositivos ThoxKey basados en ESP32-S3 (familia ThoxOS / MeshStack). El autor redirige cualquier uso real a `Thox-ai/ThoxKey-9M-role`, un modelo de aproximadamente 9 millones de parametros distribuido en formato GGUF con cuantizaciones TQ1_0, TQ2_0 y Q8_0, mas un artefacto propietario `thoxkey-9m-role.tern1`. Ese es el modelo efectivamente embebido en el firmware; ThoxKey-TLM no es un modelo distinto, sino una entrada obsoleta.

La relevancia de esta ficha es, por tanto, documental y de higiene de dependencias: cualquier pipeline, firmware o documentacion que referencie `Thox-ai/ThoxKey-TLM` esta apuntando a un repositorio vacio y debe migrarse a `Thox-ai/ThoxKey-9M-role`. No existe nada que descargar, ejecutar ni evaluar aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sin artefactos) |
| Parametros totales | no disponible (sin artefactos) |
| Parametros activos | no disponible (no es MoE declarado; sin artefactos) |
| Longitud de contexto | no disponible (sin artefactos) |
| Tipos de cuantizacion | no disponible en este repositorio; el modelo sustituto publica TQ1_0, TQ2_0 y Q8_0 en GGUF |
| Idiomas soportados | en (declarado en frontmatter; sin tokenizer que lo verifique) |
| Licencia | MIT (cubre unicamente el contenido de este repositorio) |
| Formato de pesos | no disponible; solo `.gitattributes` (1.519 B, SHA-256 `11ad7efa24975ee4b0c3c3a38ed18737f0658a5f75a0a96787b576a78a023361`) |

## Arquitectura y entrenamiento

No hay arquitectura que describir. La model card indica de forma explicita `Architecture: n/a — no artifacts` y `Base model: None`. No se publico tokenizer, configuracion, pesos ni plantilla de prompt. El campo `base_model` previo apuntaba a un repositorio de GitHub no resoluble en el Hub y fue retirado, de modo que tampoco existe una traza verificable de un modelo upstream.

Tampoco se documenta procedimiento de entrenamiento, volumen de tokens, composicion del dataset ni etapas de alineacion (RLHF/DPO). La seccion de entrenamiento de la model card se limita a declarar que no se publica informacion al respecto. La unica intervencion registrada es de gobernanza de metadatos: la tarjeta fue conformada al *THOX Model Card Standard v1.0* el 2026-10-31 (frontmatter, tags, cabecera, tabla de ficheros y estructura de secciones), sin cambios en el contenido tecnico.

## Capacidades

- Ninguna capacidad verificable: el repositorio no contiene pesos, tokenizer ni configuracion, por lo que no es ejecutable.
- No hay soporte demostrable de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte declarado ni comprobable de tool calling o function calling.
- No hay soporte declarado ni comprobable de agentes o razonamiento multi-paso.
- El unico idioma declarado en el frontmatter es `en`, sin evidencia empirica que lo respalde.
- No hay modo *thinking*, audio ni ninguna capacidad especial documentada.
- El pipeline declarado es `text-generation`, pero es un metadato heredado sin artefacto asociado.

## Casos de uso

- **Auditoria de dependencias en firmware:** localizar referencias a `Thox-ai/ThoxKey-TLM` en scripts de build, CI o documentacion interna de dispositivos ThoxKey y sustituirlas por `Thox-ai/ThoxKey-9M-role`. Es el uso principal que la propia model card atribuye al repositorio.
- **Migracion de pipelines de descarga:** si un job automatizado hacia `hf download Thox-ai/ThoxKey-TLM`, fallara o producira un directorio practicamente vacio. El caso de uso es reescribir el job al artefacto correcto, por ejemplo `thoxkey-9m-role-TQ2_0.gguf` del repositorio sustituto.
- **Verificacion de procedencia en una cadena de suministro de modelos:** comprobar que un binario embebido en un ESP32-S3 corresponde realmente al modelo declarado. Este repositorio sirve como evidencia negativa: confirma que el nombre antiguo no debe figurar como origen del binario.
- **Documentacion de linaje y trazabilidad:** registrar en un catalogo interno que `ThoxKey-TLM` fue retirado y que su sucesor operativo es `ThoxKey-9M-role`, evitando que futuras busquedas internas resuelvan al nombre obsoleto.
- **Analisis de higiene de repositorios en el Hub:** como caso de estudio de repositorio con `pipeline_tag: text-generation` pero sin artefactos, util para construir heuristicas que detecten entradas no ejecutables antes de incorporarlas a un registro de modelos.
- **Respuesta a incidencias de soporte:** cuando un usuario reporte que "el modelo ThoxKey no descarga" o "no genera texto", el diagnostico correcto es que esta usando el nombre retirado y debe apuntar al modelo de 9M integrado en el firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la evaluacion como no aplicable (`Not applicable: this repository is a retired name record and publishes no artifacts`).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos que cargar.
- GPU recomendadas: no aplicable.
- Viabilidad en GPU de consumo: no aplicable. El modelo sucesor (`ThoxKey-9M-role`, ~9M de parametros) esta pensado para ejecucion en microcontrolador ESP32-S3, no en GPU.
- Opciones de despliegue: ninguna para este repositorio. Para el sustituto, el autor indica descarga via `hf download` de artefactos GGUF (TQ1_0, TQ2_0, Q8_0) y un binario `.tern1` especifico de firmware.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No procede una comparativa de rendimiento porque el repositorio no contiene modelo. Se incluye una comparativa de estado entre el nombre retirado y su sustituto declarado, con los datos que la informacion proporcionada permite afirmar.

| Aspecto | Thox-ai/ThoxKey-TLM | Thox-ai/ThoxKey-9M-role |
|---|---|---|
| Estado | Retirado (`deprecated`, `retired`) | Activo, integrado en firmware |
| Contenido | Solo `.gitattributes` (1.519 B) | Pesos: `thoxkey-9m-role.tern1`, GGUF TQ1_0, TQ2_0, Q8_0 |
| Parametros | no disponible (sin artefactos) | ~9M (segun el nombre del repositorio) |
| Contexto | no disponible | no disponible en la informacion proporcionada |
| Licencia | MIT (solo este repositorio) | Terminos propios del modelo sustituto |
| Ejecutable | No | Si, en firmware ESP32-S3 |

Frente a alternativas de la misma categoria (modelos de ~9M de parametros para microcontroladores), no se dispone de datos de parametros, contexto ni rendimiento del modelo sucesor en la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- **No ejecutable:** no hay pesos, tokenizer ni configuracion; cualquier intento de uso en inferencia fallara.
- **Riesgo de confusion de nombre:** el `pipeline_tag: text-generation` y los tags pueden hacer que herramientas de descubrimiento automatico lo incorporen a catalogos como si fuera un modelo real.
- **Metadatos historicos invalidos:** el antiguo `base_model` apuntaba a un repositorio de GitHub no resoluble; fue eliminado, de modo que no existe linaje verificable.
- **Ambito de la licencia:** la declaracion MIT cubre unicamente el contenido de este repositorio (practicamente vacio). No concede derechos sobre el modelo sustituto, que tiene sus propios terminos y debe revisarse por separado antes de uso comercial.
- **Idioma:** el unico idioma declarado es `en`; no hay evidencia de capacidades multilingues y, sin artefactos, no es verificable.
- **Sesgos y alucinacion:** no evaluables, al no existir modelo que ejecutar. No deben extrapolarse caracteristicas del nombre a un comportamiento real.
- **Produccion:** no referenciar este repositorio desde firmware, tooling ni documentacion; migrar todas las referencias a `Thox-ai/ThoxKey-9M-role`.

## Enlaces

- Repositorio en Hugging Face (retirado): https://huggingface.co/Thox-ai/ThoxKey-TLM
- Modelo sustituto recomendado por el autor: https://huggingface.co/Thox-ai/ThoxKey-9M-role
- Organizacion en Hugging Face: https://huggingface.co/Thox-ai
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible en la informacion proporcionada (el antiguo `base_model` apuntaba a un repositorio de GitHub que no resuelve en el Hub)
