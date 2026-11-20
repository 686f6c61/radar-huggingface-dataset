# SZLHOLDINGS/navigator-candidate_enterprise_20261104

## Resumen

Navigator candidate_enterprise_20261104 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). El repositorio aparece en Hugging Face con el identificador `SZLHOLDINGS/navigator-candidate_enterprise_20261104` y fue creado el 4 de noviembre de 2026, con una ultima actualizacion el 20 de noviembre de 2026.

La model card no proporciona informacion tecnica sustantiva: no se declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni pipeline de inferencia. El autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en ficheros de recibo externos a la card y que, a falta de estos, el dato debe considerarse "UNKNOWN". El tamano del repositorio figura como 0.0 GB y el unico tag tecnico presente es `safetensors`, lo que sugiere que los pesos, si existen, se distribuirian en ese formato.

Por tanto, esta ficha documenta un artefacto del que no hay datos verificables publicados en la informacion disponible. Su relevancia actual es limitada para evaluacion practica: no hay benchmarks, no hay especificaciones y no hay evidencia de capacidades. Se recomienda tratar cualquier uso en produccion como no validado hasta que el autor publique los recibos de auditoria referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tag del repositorio; no se confirma el contenido real) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El autor remite a "receipt files" del estate mesh para cualquier afirmacion sobre entrenamiento, pero dichos ficheros no se incluyen en la informacion proporcionada. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como atencion lineal o decodificacion especulativa.

La unica senal tecnica es el tag `safetensors`, que indica el formato de serializacion de pesos habitual en el ecosistema Hugging Face, pero no aporta informacion sobre la topologia del modelo. El tamano del repositorio declarado (0.0 GB) es compatible tanto con un repositorio vacio o de solo metadatos como con un redondeo a la baja de un artefacto pequeno; no es posible distinguir entre ambos casos con los datos disponibles.

## Capacidades

No se han documentado capacidades del modelo en la informacion disponible. No hay evidencia publicada de:

- Generacion de texto, razonamiento, codigo o matematicas.
- Soporte de tool calling o function calling.
- Soporte de agentes o razonamiento multi-paso.
- Capacidades multilingues.
- Modos especiales (thinking mode, vision, audio).

El nombre "navigator" y la etiqueta "candidate_enterprise" sugieren un proposito empresarial, pero se trata de una inferencia a partir del identificador y no de una capacidad declarada por el autor.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones verificables. Los siguientes escenarios son hipoteticos y requeririan validacion previa contra los recibos de auditoria del autor:

- Evaluacion interna controlada: desplegar el artefacto en un entorno aislado para comprobar que los pesos cargan correctamente y que el tokenizador asociado existe, antes de cualquier integracion.
- Auditoria de procedencia: usar los ficheros de recibo referenciados por el autor para verificar la cadena de custodia del modelo dentro del estate de SZLHOLDINGS.
- Pruebas de compatibilidad de formato: validar que el tag `safetensors` corresponde a un checkpoint cargable por librerias estandar como `transformers` o `safetensors`.
- Comparacion de gobernanza: estudiar el patron de publicacion del autor (cards generadas por "estate-cards weaver", etiquetado MEASURED/REPORTED/UNKNOWN) como caso de practica de documentacion reproducible.
- Integracion en pipelines empresariales: solo tras obtener del autor la licencia, los idiomas y las especificaciones de contexto, y tras superar una evaluacion de calidad propia.
- Docencia sobre trazabilidad de modelos: emplear la card como ejemplo de publicacion que declara explicitamente la ausencia de datos en lugar de inventarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara en la card que "no benchmark number is asserted on this card beyond what a dated audit measured" y que los datos no recibidos se etiquetan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se confirma que el artefacto sea cargable por vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen la categoria, el tamano y la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicadas: arquitectura, parametros, contexto e idiomas son desconocidos.
- Licencia no declarada: no se puede asumir permiso para uso comercial, redistribucion ni modificacion.
- Sin benchmarks ni evaluaciones independientes: cualquier afirmacion de calidad carece de respaldo verificable.
- Repositorio de 0.0 GB y solo 5 descargas: no hay evidencia de que los pesos esten efectivamente alojados o de que el modelo haya sido validado por terceros.
- Riesgo de artefacto incompleto o de solo metadatos: conviene comprobar la lista real de ficheros antes de intentar cargarlo.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y a su dataset de entrenamiento.
- Fecha de creacion en 2026 y nomenclatura "candidate": sugiere un artefacto en estado preliminar, no una version estable.
- La card remite a recibos externos que no se incluyen en la informacion proporcionada; sin ellos, todas las afirmaciones del autor quedan sin verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/navigator-candidate_enterprise_20261104
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards
