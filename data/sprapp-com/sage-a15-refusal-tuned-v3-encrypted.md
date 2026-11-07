# sprapp-com/sage-a15-refusal-tuned-v3-encrypted

## Resumen

Sage-a15-refusal-tuned-v3-encrypted es un artefacto publicado en Hugging Face por el usuario sprapp-com que, segun su model card, contiene pesos de un modelo cifrados con AES-256-CTR. No se trata de un modelo directamente utilizable: el repositorio no incluye la clave de descifrado ni documentacion tecnica sobre arquitectura, parametros, datos de entrenamiento o capacidades. El nombre sugiere un modelo afinado para rechazo ("refusal-tuned"), presumiblemente orientado a alineamiento de seguridad, pero no hay informacion publica que lo confirme.

El repositorio ocupa 75,9 GB y contiene ficheros safetensors cifrados, ademas de un `MANIFEST.tsv` con los vectores de inicializacion (IV) por fichero. Segun el autor, el descifrado requiere tanto la clave maestra del proyecto como dicho manifiesto, lo que impide su uso sin acceso al proyecto original. La model card unicamente documenta el procedimiento de descifrado mediante `openssl`, sin aportar ningun dato sobre el modelo en si.

La relevancia de esta ficha es limitada desde el punto de vista practico: no es posible evaluar el modelo, ejecutarlo ni reproducir resultados. Se documenta aqui como referencia de un patron de distribucion (pesos cifrados con clave externa) y para advertir de que no cumple los criterios habituales de un modelo open source utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tamano del repo es de 75,9 GB, pero incluye cifrado y no permite inferir el numero de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cifrados con AES-256-CTR (no legibles sin descifrado) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El nombre "sage-a15" y la coleccion "Sage-A1.5" de InternScience en Hugging Face sugieren una posible relacion con esa familia, pero no existe confirmacion por parte del autor ni documentacion que lo respalde. No hay datos sobre numero de parametros, composicion del dataset, numero de tokens de entrenamiento ni sobre tecnicas de alineamiento (RLHF, DPO u otras) mas alla de la etiqueta "refusal-tuned" en el nombre del repositorio.

El unico detalle tecnico documentado es el esquema de cifrado: cada fichero se cifra con AES-256-CTR usando un IV propio registrado en `MANIFEST.tsv`, y el descifrado requiere la clave maestra del proyecto. Este esquema no aporta informacion sobre el modelo, solo sobre el mecanismo de distribucion.

## Capacidades

- No se han documentado capacidades del modelo en la informacion disponible.
- El nombre sugiere un ajuste orientado a rechazo de peticiones ("refusal-tuned"), pero no hay evidencia publica de su comportamiento.
- No hay informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- El modelo no es ejecutable tal como se distribuye: los pesos estan cifrados y la clave no esta en el repositorio.

## Casos de uso

- Distribucion controlada de pesos: el esquema de cifrado con clave externa permite al autor compartir artefactos sin exponerlos publicamente, por ejemplo para auditorias o clientes con acuerdo de confidencialidad.
- Archivo y custodia de modelos: el repositorio puede servir como almacen de una version concreta de un modelo interno del proyecto sprapp-com, protegida frente a acceso no autorizado.
- Transferencia entre entornos: el par cifrado + `MANIFEST.tsv` permite mover pesos entre infraestructuras siempre que se disponga de la clave maestra.
- Verificacion de integridad: el manifiesto de IVs por fichero facilita comprobar que los artefactos descifrados corresponden a los originales.
- Evaluacion de seguridad de la cadena de custodia: util para estudiar practicas de distribucion cifrada de modelos en entornos corporativos.
- No es adecuado para ningun caso de uso de inferencia, generacion de texto, codigo, atencion al cliente ni integracion en pipelines, porque los pesos no son accesibles sin la clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y la arquitectura.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no evaluable sin datos del modelo.
- Opciones de despliegue: ninguna aplicable mientras los pesos permanezcan cifrados. Tras un hipotetico descifrado, seria necesario convertir los safetensors resultantes a un runtime compatible (vLLM, TGI, llama.cpp, Ollama), pero no hay informacion sobre formatos soportados.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 75,9 GB, por lo que se requiere espacio equivalente para la descarga y adicional para los pesos descifrados.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la arquitectura, el tamano y las capacidades del modelo. La coleccion "Sage-A1.5" de InternScience en Hugging Face podria estar relacionada, pero no hay confirmacion de que este repositorio derive de ella.

## Limitaciones y advertencias

- Los pesos estan cifrados con AES-256-CTR y la clave no se distribuye en el repositorio; sin la clave maestra del proyecto y el `MANIFEST.tsv` el modelo es inutilizable.
- No hay model card tecnica: se desconoce arquitectura, parametros, contexto, idiomas, licencia y datos de entrenamiento.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial, redistribucion o modificacion.
- El nombre "refusal-tuned" sugiere un ajuste de alineamiento, pero no hay documentacion sobre que tipo de peticiones rechaza ni con que criterios.
- Riesgo de confusion con la familia Sage-A1.5 de InternScience: la similitud de nombres no implica relacion oficial.
- No se puede verificar la integridad ni la procedencia del contenido cifrado sin la clave.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No debe usarse en produccion bajo ninguna circunstancia en su estado actual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sprapp-com/sage-a15-refusal-tuned-v3-encrypted
- Coleccion Sage-A1.5 de InternScience (posible referencia nominal, sin confirmacion): https://huggingface.co/collections/InternScience/sage-a15
