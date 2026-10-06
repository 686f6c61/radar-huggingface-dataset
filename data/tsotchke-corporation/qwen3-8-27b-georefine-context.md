# Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-Context

## Resumen

Qwen3.8-27B-GeoRefine-Context no es un modelo entrenado ni un ajuste fino, sino un paquete de almacenamiento con compresion sin perdida de los pesos de Qwen3.8-27B. Lo publica Tsotchke Corporation dentro de su familia GeoRefine y su funcion es guardar los tensores BF16 en un formato codificado compacto que, tras un proceso de restauracion, reconstruye los safetensors originales y sus metadatos byte a byte.

El proposito es ahorrar espacio en disco y ancho de banda de descarga manteniendo integridad bit-exacta. El paquete completo ocupa 36,4 GB frente a los 55,56 GB del payload BF16 original, lo que supone una ratio de 1,5263x. Incluye 1.199 tensores, 18 shards originales y 13 activos de metadatos, todos restaurados de forma exacta segun las mediciones del autor.

Es relevante ahora porque aborda un problema practico de infraestructura: distribuir y archivar pesos de modelos grandes sin perder fidelidad numerica. Sin embargo, no es directamente cargable con `transformers.from_pretrained` y el autor indica explicitamente que el servicio en GPU sobre el formato comprimido no esta cualificado ni verificado. Se apoya en el modelo base Qwen3.8-27B, descrito por el equipo Qwen como un LLM denso multimodal nativo orientado a codigo, flujos agenticos y automatizacion de oficina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base denso y multimodal (Qwen3.8-27B); el repositorio es un paquete de almacenamiento, no define una arquitectura nueva |
| Parametros totales | 27 000 millones (segun nomenclatura del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en los tensores originales; paquete en formato propietario comprimido sin perdida; existe una variante GGUF publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Paquete comprimido propietario (no cargable directamente por `from_pretrained`); restauracion bit-exacta a safetensors BF16 |

## Arquitectura y entrenamiento

El artefacto no contiene un proceso de entrenamiento propio. GeoRefine es un codec reversible: almacena los pesos preentrenados BF16 en un formato codificado y, segun la documentacion del proyecto, puede servirlos sin mantener residente una copia densa de cada peso codificado. El repositorio de codigo (codec, runtime, verificador y tests) se publica bajo Apache-2.0, mientras que los pesos conservan la licencia y atribucion de Qwen.

La innovacion tecnica es la compresion estructural de tensores con garantia de restauracion exacta. El paquete incluye un decodificador en Python (`bitexact_context_package.py`) con subcomandos `verify` y `restore` que requieren Python 3.10+, NumPy y un compilador C++17. Las mediciones del autor indican 1.199 tensores, 18 shards y 13 activos de metadatos restaurados byte a byte, con un manifest SHA256 publicado. No se detallan en la informacion disponible los datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- El paquete no ejecuta inferencia por si mismo: sus capacidades son de almacenamiento, verificacion de integridad y restauracion bit-exacta de pesos.
- Verificacion criptografica de integridad mediante SHA256 del manifest y comprobacion de objetos individuales.
- Restauracion byte a byte de los 1.199 tensores, 18 shards de safetensors y 13 activos de metadatos.
- Una vez restaurado, las capacidades funcionales son las del modelo base Qwen3.8-27B (generacion de texto, codigo, flujos agenticos y multimodalidad nativa), sin datos adicionales en esta informacion.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio) dependen del modelo base; no se detallan aqui.

## Casos de uso

- Archivado a largo plazo de pesos BF16: permite guardar Qwen3.8-27B en 36,4 GB en lugar de 55,56 GB, con restauracion exacta para auditorias o replicas.
- Distribucion de pesos en redes con ancho de banda limitado: reduce el volumen de descarga un factor de 1,5263x manteniendo la fidelidad numerica.
- Verificacion de procedencia y cadena de custodia: el manifest SHA256 y los objetos verificados permiten comprobar que un checkpoint no ha sido alterado.
- Pipelines de CI reproducibles: el paso `restore` puede integrarse en scripts que reconstruyen el checkpoint antes de lanzar evaluaciones o entrenamientos.
- Almacenamiento en frio para equipos de investigacion: archivar varias copias de un mismo modelo reduciendo coste de disco con reconstruccion bajo demanda.
- Publicacion de artefactos verificables: usar el verificador para certificar que un checkpoint reconstruido coincide con el original antes de compartirlo.
- Sirve como base para variantes derivadas: el mismo autor publica formatos GGUF (por ejemplo `L162-abl-GGUF`) que si estan orientados a inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta mediciones de almacenamiento:

| Medida | Resultado |
|---|---:|
| Payload original de tensores BF16 | 55 562 855 904 bytes |
| Paquete completo de contexto | 36 403 357 016 bytes |
| Ratio global origen/paquete | 1,526311x |
| Solo tramas de pesos | 1,526707x |
| Tensores / shards safetensors originales / activos de metadatos | 1.199 / 18 / 13 |

El autor indica que el objetivo de 1,53x no se alcanzo y que las mediciones describen almacenamiento y restauracion exacta; la velocidad de servicio en GPU, el uso de memoria y la inferencia nativa sobre el formato comprimido no estan verificados.

## Requisitos de hardware

- Espacio en disco para el paquete: aproximadamente 36,4 GB.
- Espacio para los tensores restaurados: aproximadamente 55,6 GB, mas espacio de trabajo adicional para la cache de decodificacion.
- La cache de decodificacion debe mantenerse fuera del directorio del paquete, segun las instrucciones del autor.
- Requisitos de software para restaurar: Hugging Face CLI, Python 3.10+ con NumPy y compilador C++17.
- VRAM para inferencia: no disponible en la informacion proporcionada. Un modelo denso de 27B en BF16 requeriria aproximadamente 55,6 GB solo para pesos, lo que excede una GPU de consumo individual.
- GPU recomendadas: no disponible.
- Opciones de despliegue: restauracion a BF16 mediante el decodificador incluido; la carga directa con `transformers.from_pretrained` no es posible sobre el paquete. Para servicio en GPU habria que restaurar primero o recurrir a la variante GGUF del mismo autor.
- Latencia y throughput: no disponibles ni verificados.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano en disco | Cargable directamente | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-GeoRefine-Context (este repositorio) | Paquete de almacenamiento comprimido sin perdida | 36,4 GB | No | apache-2.0 |
| Qwen/Qwen3.8-27B (original) | Pesos BF16 en safetensors | ~55,6 GB de payload de tensores | Si | Licencia upstream de Qwen |
| Tsotchke Qwen3.8-27B-GeoRefine-TBE | Formato codificado servible (runtime GeoRefine) | no disponible | Parcial, via runtime GeoRefine | Pesos con licencia de Qwen; codigo Apache-2.0 |
| Tsotchke Qwen3.8-27B-GeoRefine-L162-abl-GGUF | Cuantizacion GGUF para inferencia | no disponible | Si, con runtime GGUF | apache-2.0 |

## Limitaciones y advertencias

- No es un modelo utilizable directamente: no funciona con `transformers.from_pretrained` y requiere el paso de restauracion.
- El servicio en GPU nativo sobre el formato comprimido no esta cualificado ni verificado por el autor.
- El objetivo de compresion de 1,53x no se alcanzo (1,526311x global).
- La restauracion exige espacio temporal adicional en disco, ademas de la cache de decodificacion.
- El repositorio registra 0 descargas y 0 likes, por lo que la adopcion y validacion por terceros es practicamente nula.
- No se proporcionan datos sobre sesgos, riesgo de alucinacion ni rendimiento real de inferencia.
- Idioma y cobertura multilingue: no disponibles.
- Licencia: el paquete de codigo es Apache-2.0, pero los pesos heredan la licencia upstream de Qwen. Hay que revisar los terminos de Qwen antes de un uso comercial.
- Para produccion se recomienda verificar la restauracion con el subcomando `verify` antes de cualquier despliegue.

## Enlaces

- HuggingFace (modelo analizado): https://huggingface.co/Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-Context
- Repositorio GeoRefine (codigo, runtime y verificador): https://github.com/Tsotchke-Corporation/GeoRefine
- Handoff de formato y alcance de verificacion: https://github.com/Tsotchke-Corporation/GeoRefine/blob/911218137bd2fa07355d71ff0f1b66d67762d2c5/docs/handoff/context-package-20261006.md
- Artefacto publicado de referencia (TBE): https://huggingface.co/Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-TBE
- Model card de GeoRefine TBE: https://huggingface.co/Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-TBE/blob/main/README.md
- Variante GGUF: https://huggingface.co/Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-L162-abl-GGUF
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
