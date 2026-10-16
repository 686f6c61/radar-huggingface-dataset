# Thunderboltdy10/ixos-code

## Resumen

Ixos Code es un artefacto de inferencia para recuperación de código, publicado por el usuario Thunderboltdy10 en Hugging Face y derivado directamente de minishlab/potion-code-16M-v2, el modelo de embeddings estáticos desarrollado por MinishLab bajo licencia MIT. No es un modelo entrenado desde cero ni un ajuste fino: la model card indica explícitamente que no se realizó entrenamiento ni destilación alguna. Los pesos de embeddings de 256 dimensiones y la configuración del modelo son idénticos a los del modelo base; lo único que cambia es el tokenizador, cuyos campos `truncation` y `padding` se fijan a `null` y cuyo JSON se serializa sin espacios adicionales, eliminando el recorte de entrada y el relleno de lote heredados.

El modelo pertenece a la familia de embeddings estáticos (estilo model2vec): en lugar de ejecutar un transformer completo, utiliza directamente los embeddings de tokens, aplica mean pooling y normaliza el vector resultante. Esto lo convierte en un componente de búsqueda semántica pensado para ejecutarse en CPU, sin necesidad de GPU, con un coste computacional muy bajo. Su uso previsto es [Ixos](https://github.com/Thunderboltdy-10/ixos), un motor de búsqueda local escrito en Rust que instala el modelo mediante el comando `ixos model install code`, descarga los tres ficheros de runtime en una revisión fijada, verifica sus hashes SHA-256 y los carga con su propio loader.

Su relevancia es doble: por un lado, ofrece recuperación de código en local sin dependencias de nube ni GPUs; por otro, ilustra un patrón de publicación poco habitual, en el que un repositorio de Hugging Face se usa como canal de distribución de un artefacto de runtime con hashes verificables y reproducible mediante `python scripts/models.py build`, en lugar de como un pipeline Transformers de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (static token embeddings con mean pooling y normalizacion); sin transformer en inferencia |
| Parametros totales | Aproximadamente 16 millones (heredados de minishlab/potion-code-16M-v2, segun la denominacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el tokenizador fija `truncation` y `padding` a `null`; no se documenta ventana maxima) |
| Tipos de cuantizacion | no disponible (artefacto de embeddings estaticos; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 256 |
| Modelo base | minishlab/potion-code-16M-v2 (revision fijada `e9d2a44ca6a05ac6685f3b23709ea57eb7352d5b`) |
| Repositorio | 0.0 GB; 0 descargas; 0 likes en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-16T17:39:06Z / 2026-10-16T17:43:34Z |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo, sino un modelo de embeddings estáticos del tipo popularizado por Model2Vec y por la familia Potion de MinishLab. El modelo almacena una tabla de embeddings de tokens de 256 dimensiones (el nombre del modelo base, potion-code-16M-v2, sugiere en torno a 16 millones de parámetros, coherentes con un vocabulario de decenas de miles de tokens por 256 dimensiones). En inferencia, Ixos toma los embeddings estáticos de los tokens de entrada, aplica mean pooling sobre ellos y normaliza el vector resultante. No hay atención, ni capas feed-forward, ni decodificación autoregresiva, por lo que no existe generación de texto en ningún caso.

En cuanto al entrenamiento, la model card de este repositorio es tajante: no se realizó entrenamiento ni destilación. La publicación reutiliza los pesos del upstream y solo modifica el tokenizador para eliminar el recorte de entrada (`truncation: null`) y el relleno de lote (`padding: null`), serializando después su JSON sin espacios extra. La publicación incluye el fichero `UPSTREAM_MODEL_CARD.md` con la autoría original, la licencia y los detalles de entrenamiento del modelo base, que no se reproducen en la información disponible. La innovación técnica del artefacto no está, por tanto, en el modelado, sino en el empaquetado reproducible: `python scripts/models.py build` regenera los ficheros y permite verificar los hashes contra la tabla del instalador en Rust.

## Capacidades

- Recuperación semántica de fragmentos de código en inglés mediante similitud vectorial: el modelo produce un embedding normalizado de 256 dimensiones por entrada.
- Indexación y ranking de ficheros o fragmentos: la model card indica que las puntuaciones ordenan ficheros y no deben interpretarse como probabilidades.
- Ejecución íntegra en CPU, sin GPU ni aceleradores, gracias al uso de embeddings estáticos con mean pooling.
- Funcionamiento offline: los tres ficheros de runtime se almacenan fuera del ejecutable y se reutilizan sin conexión.
- Instalación y verificación criptográfica: `ixos model install code` descarga en una revisión fijada y comprueba los hashes SHA-256 antes de cargar.
- Integración como biblioteca de recuperación dentro del motor Ixos, escrito en Rust, con el modelo cargado por su loader nativo.
- No soporta generación de texto, diálogo, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo de pensamiento: no es un modelo generativo.
- Capacidad multilingüe: no disponible; el único idioma declarado es inglés.
- No expone un pipeline Transformers de propósito general; está pensado para un runtime concreto.

## Casos de uso

- Búsqueda semántica local sobre repositorios de código: indexar los ficheros de un proyecto y consultar por lenguaje natural ("dónde se valida el token JWT") sin enviar código a servicios externos, algo viable porque el modelo corre en CPU y no requiere GPU.
- Asistente de exploración de bases de código heredadas: recuperar los fragmentos más relevantes en repositorios grandes y mal documentados, aprovechando que el modelo ordena ficheros por relevancia y evita el coste de un transformer denso.
- Detección de código duplicado o casi duplicado: comparar los embeddings de módulos o funciones para localizar implementaciones redundantes antes de refactorizar, con similitud coseno sobre vectores ya normalizados.
- Herramientas de desarrollo con requisito de privacidad estricta: entornos sanitarios, financieros o de defensa donde el código no puede salir de la máquina y se necesita un motor de búsqueda que funcione sin red.
- Integración en pipelines de CI: ejecutar la indexación en cada commit o pull request para señalar cambios que toquen áreas relacionadas, con un coste de CPU bajo y sin dependencias de CUDA.
- Enrutado de consultas en un sistema mayor de asistencia al desarrollo: usar el modelo como primera etapa de recuperación (retriever) y delegar la generación o el razonamiento a un LLM posterior, reduciendo el contexto que hay que enviar al modelo grande.
- Distribución empaquetada en aplicaciones de escritorio: incluir el artefacto como dependencia offline dentro de una aplicación nativa, ya que el repositorio se limita a tres ficheros de runtime verificables por hash.
- Reproducibilidad y auditoría de artefactos: reconstruir los ficheros con `python scripts/models.py build` y verificar que los hashes coinciden con la tabla del instalador Rust, útil en procesos de cadena de suministro de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (MTEB, CoIR ni similares), y tampoco se proporcionan datos de latencia o throughput. El autor advierte además que una entrada más larga no garantiza mejor recuperación, lo que sugiere que el rendimiento depende del preprocesado de los fragmentos y no de ampliar el texto de consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo está diseñado para ejecutarse en CPU. Como referencia orientativa, almacenar 16 millones de parámetros en fp32 ocuparía unos 64 MB, cantidad irrelevante para cualquier GPU actual.
- GPU recomendadas: no aplica. El caso de uso declarado es CPU local; no se documenta soporte CUDA, ROCm ni Metal.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 1 GB de memoria, aunque hacerlo no aporta ventaja frente a la CPU.
- Opciones de despliegue: loader en Rust de Ixos, mediante `ixos model install code`, que descarga y verifica los ficheros SHA-256 en la revisión fijada. No se ofrece pipeline Transformers de propósito general y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no encajan con un modelo no generativo.
- Latencia y throughput: no disponible en la información proporcionada. Cualitativamente, al no ejecutar un transformer y reducir la inferencia a una consulta de embeddings y un mean pooling, el coste por consulta es de orden muy inferior al de un modelo denso del mismo tamaño nominal.
- Almacenamiento: el repositorio ocupa 0.0 GB según Hugging Face; el peso real del artefacto no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Thunderboltdy10/ixos-code | ~16 M | 256 | no disponible | MIT | safetensors | 0 descargas, 0 likes |
| minishlab/potion-code-16M-v2 | ~16 M (segun denominacion) | 256 | no disponible | MIT | safetensors | Repositorio upstream de MinishLab |
| Otras alternativas de embeddings de codigo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia funcional entre `ixos-code` y su modelo base no está en los pesos ni en la configuración, que son idénticos, sino en el tokenizador: el derivado anula `truncation` y `padding`, de modo que no recorta la entrada ni rellena lotes automáticamente, y traslada esa responsabilidad al consumidor. El resto de alternativas comparables no aparecen descritas en la información disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, mantener conversaciones, razonar en varios pasos ni invocar herramientas. Cualquier expectativa de uso como LLM es incorrecta.
- Las puntuaciones del modelo ordenan ficheros; no son probabilidades y no deben presentarse como niveles de confianza calibrados.
- Una entrada más larga no garantiza mejor recuperación, según advierte la propia model card. El troceado (chunking) de los ficheros es una decisión del integrador.
- Al fijar `truncation` y `padding` a `null`, el consumidor debe gestionar por su cuenta la longitud de las secuencias y el agrupamiento en lotes; el modelo ya no lo hace.
- Idioma: solo inglés. El rendimiento en consultas o código en castellano no está documentado.
- Sesgos conocidos: no disponible. No se han publicado evaluaciones de sesgo ni de equidad para este artefacto.
- Riesgo de alucinación: no aplica en sentido estricto al no generar texto, pero sí existe el riesgo de recuperaciones irrelevantes malinterpretadas como resultados correctos si no se validan.
- Licencia MIT, heredada del modelo base, lo que permite uso comercial; conviene conservar la atribución a MinishLab indicada en la model card y el fichero `UPSTREAM_MODEL_CARD.md`.
- Dependencia de un runtime concreto: el repositorio está pensado para Ixos y no ofrece una interfaz estándar, lo que limita su reutilización en otros stack sin trabajo adicional.
- Sin métricas publicadas: no hay benchmarks, latencias ni estudios de calidad que permitan comparar objetivamente con alternativas.
- Señales de madurez: 0 descargas, 0 likes y un repositorio de 0.0 GB en el momento de la consulta; el proyecto debe evaluarse como un artefacto nuevo y poco contrastado.
- Fechas de creación y actualización (2026-10-16) y resultados de búsqueda web no relacionados con el modelo: la información web recuperada no aporta datos verificables sobre este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Thunderboltdy10/ixos-code
- Modelo base: https://huggingface.co/minishlab/potion-code-16M-v2
- Repositorio del motor Ixos: https://github.com/Thunderboltdy-10/ixos
- Revision fijada del modelo base: `e9d2a44ca6a05ac6685f3b23709ea57eb7352d5b`
- Fichero incluido en la publicacion: `UPSTREAM_MODEL_CARD.md` (autoria, licencia y detalles de entrenamiento originales)
- Script de reproduccion citado en la model card: `python scripts/models.py build`
- Comando de instalacion: `ixos model install code`
