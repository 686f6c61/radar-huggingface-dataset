# sprapp-com/sage-a15-refusal-tuned-v2-encrypted

## Resumen

sage-a15-refusal-tuned-v2-encrypted es un artefacto publicado en Hugging Face por el usuario sprapp-com bajo el identificador `sprapp-com/sage-a15-refusal-tuned-v2-encrypted`. A pesar de su nombre, el repositorio no contiene pesos de un modelo utilizables directamente: se trata de un conjunto de ficheros cifrados con AES-256-CTR, y la model card indica explicitamente que la clave de descifrado no esta incluida en el repositorio. Para reconstruir los pesos seria necesario disponer de la clave maestra del proyecto y del fichero `MANIFEST.tsv` con los IV por fichero, de modo que la clave por si sola resulta insuficiente.

El nombre sugiere un modelo afinado para rechazo ("refusal-tuned"), presumiblemente orientado a que el modelo decline peticiones consideradas inseguras, pero no hay informacion publica que confirme arquitectura, numero de parametros, contexto ni datos de entrenamiento. El tamano del repositorio es de 71,9 GB, lo que es compatible con pesos en precision completa o media de un modelo de decenas de miles de millones de parametros, aunque el cifrado impide verificar el contenido y el dato no permite inferir el tamano real del modelo.

La relevancia de esta ficha es fundamentalmente practica: documenta un caso de publicacion cifrada que no es desplegable ni evaluable por terceros. No existe pipeline declarado, no hay licencia especificada, no se declaran idiomas y el repositorio registra cero descargas y cero likes en el momento de la consulta. Cualquier evaluacion tecnica del modelo subyacente es imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros estan cifrados en AES-256-CTR) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio), cifrados con AES-256-CTR |
| Tamano del repositorio | 71,9 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-06 |
| Fecha de actualizacion | 2026-11-06 |

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura del modelo subyacente. La model card se limita a describir el esquema de cifrado y el procedimiento de descifrado mediante `openssl enc -d -aes-256-ctr`, iterando sobre las lineas de `MANIFEST.tsv` que contienen el nombre original, el nombre cifrado y el IV de cada fichero. No se documenta si el modelo es un transformer denso, un MoE, un modelo hibrido ni ninguna otra variante.

Tampoco se aportan datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. El sufijo "refusal-tuned" del nombre sugiere un ajuste orientado a comportamiento de rechazo, pero no se especifica la metodologia, el dataset de preferencias ni los criterios de seguridad aplicados. La unica innovacion tecnica documentada es el propio empaquetado cifrado, que impide la inspeccion de los pesos sin la clave del proyecto.

## Capacidades

- No se puede verificar ninguna capacidad funcional del modelo, ya que los pesos estan cifrados y la clave no esta disponible en el repositorio.
- Por el nombre ("refusal-tuned"), se presume un comportamiento orientado a rechazar peticiones consideradas inseguras, pero no hay documentacion que lo confirme ni que describa el alcance de dicho rechazo.
- No hay informacion sobre generacion de texto, razonamiento, codigo, matematicas, vision, audio ni modalidades adicionales.
- No hay informacion sobre soporte de tool calling, function calling ni uso en agentes.
- No hay informacion sobre capacidades multilingues ni sobre modos especiales como thinking mode.
- El tag `region:us` indica unicamente la region de almacenamiento en Hugging Face y no aporta informacion sobre capacidades.

## Casos de uso

- Distribucion controlada de pesos a terceros autorizados: el esquema de cifrado por fichero con IVs en `MANIFEST.tsv` permite entregar el repositorio publicamente y reservar la clave al cliente o socio con contrato de confidencialidad, de modo que solo quien posea clave y manifiesto pueda reconstruir los pesos.
- Custodia de artefactos en repositorios publicos: util para equipos que necesitan versionar y almacenar modelos en infraestructura publica (Hugging Face, S3) sin exponer los pesos a descarga libre, manteniendo trazabilidad por fichero mediante el manifiesto.
- Archivado con control de acceso a largo plazo: el cifrado AES-256-CTR con IV por fichero permite almacenar copias de seguridad de un modelo afinado sin que el repositorio por si solo comprometa la propiedad intelectual.
- Reparto por niveles entre equipos: un equipo central puede publicar el artefacto cifrado y distribuir la clave solo a los equipos de evaluacion o despliegue que la necesiten, separando el canal de distribucion de artefactos del canal de autorizacion.
- Evaluacion interna de seguridad de un modelo refusal-tuned: una vez descifrado con la clave del proyecto, el modelo podria someterse a pruebas de robustez frente a jailbreaks y a medicion de tasas de rechazo, aunque no hay documentacion publica de dichas pruebas.
- Integracion en pipelines de despliegue con descifrado en el arranque: el script de la model card puede incorporarse a un paso previo de despliegue que descifre los ficheros en un volumen efimero antes de cargar los pesos en el runtime de inferencia.
- Publicacion de artefactos para cumplimiento normativo: el esquema permite demostrar que un modelo concreto fue empaquetado y versionado en una fecha determinada (2026-11-06) sin revelar su contenido, lo que puede ser util en auditorias internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que se desconoce el numero de parametros y la precision de los pesos. El tamano del repositorio (71,9 GB) es el unico dato objetivo y corresponde al artefacto cifrado, no necesariamente al peso de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplicables hasta disponer de la clave maestra y del `MANIFEST.tsv`; una vez descifrados, el formato safetensors permitiria en principio cargarlos con frameworks estandar (Transformers, vLLM, TGI), pero no hay confirmacion del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se ha identificado en la informacion proporcionada ningun modelo comparable, y la busqueda web solo devuelve una coleccion de Hugging Face bajo el nombre "Sage-A1.5" del usuario InternScience, sin relacion confirmada con este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sprapp-com/sage-a15-refusal-tuned-v2-encrypted | no disponible | no disponible | no disponible | cifrado, no desplegable sin clave |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no es utilizable tal cual: los pesos estan cifrados con AES-256-CTR y la clave maestra no esta incluida. Sin la clave y el `MANIFEST.tsv` no es posible cargar el modelo ni evaluarlo.
- La posesion de la clave por si sola no basta para descifrar; se requiere tambien el manifiesto con los IV por fichero, lo que anade una dependencia operativa adicional.
- No se declara licencia, por lo que no puede asumirse ningun derecho de uso comercial, redistribucion ni modificacion.
- No se declaran idiomas soportados, pipeline ni arquitectura, lo que impide planificar su integracion en produccion.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento real del ajuste de rechazo; el nombre "refusal-tuned" no garantiza ningun nivel de seguridad medido.
- El cifrado AES-256-CTR sin autenticacion (no es GCM) no protege frente a manipulacion del ciphertext; un tercero con acceso al repositorio podria alterar ficheros sin que el descifrado lo detecte, lo que exige verificar la integridad por otros medios.
- El repositorio registra cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-06) es posterior a la fecha actual de referencia habitual; conviene verificar la coherencia temporal del artefacto antes de confiar en sus metadatos.
- No se ha verificado la relacion entre este repositorio y la coleccion "Sage-A1.5" de InternScience; el nombre podria ser coincidente y no debe asumirse continuidad entre ambos proyectos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sprapp-com/sage-a15-refusal-tuned-v2-encrypted
- Coleccion "Sage-A1.5" de InternScience (posible coincidencia de nombre, sin relacion confirmada): https://huggingface.co/collections/InternScience/sage-a15
