# teamup-tech/DeepFilterNet-weights

## Resumen

Este repositorio no contiene un modelo nuevo, sino un espejo (mirror) de los pesos preentrenados de DeepFilterNet3, el modelo de supresión de ruido y mejora de voz del proyecto DeepFilterNet, desarrollado originalmente por Hendrik Schröter (Rikorose). El espejo lo publica la cuenta teamup-tech para que el Space DeepFilterNet y el paquete Python `deepfilternet` puedan cargar los pesos sin depender de la rama `main` del repositorio de GitHub, que es donde el paquete los descarga por defecto.

El contenido es un artefacto de inferencia, no un modelo de lenguaje: se trata de un checkpoint de PyTorch (`checkpoints/model_120.ckpt.best`), un `config.ini` y la estructura de directorios que espera la función `init_df(model_base_dir=...)`. No hay pipeline declarado en HuggingFace, no se declaran idiomas y no se documentan parámetros, contexto ni datos de entrenamiento en la model card.

Su relevancia es de reproducibilidad e integridad: la model card publica los SHA-256 del ZIP original, del `config.ini` y del checkpoint, de modo que un tercero puede verificar que los pesos servidos coinciden bit a bit con los del repositorio upstream (commit `d375b2d8`). La licencia del proyecto original es dual MIT o Apache-2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet3: modelo de mejora de voz (speech enhancement) basado en deep filtering; no es un transformer de lenguaje. El detalle de capas no se documenta en la model card |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; procesa audio por tramas. Tamano de ventana y tasa de refresco no disponibles |
| Tipos de cuantizacion | no disponible; solo se distribuye el checkpoint original en punto flotante (`.ckpt.best`). No hay versiones GGUF, ONNX ni AWQ en el repo |
| Idiomas soportados | no disponible; al operar sobre senal de voz, el comportamiento es en gran medida independiente del idioma, pero no se declara ninguno |
| Licencia | MIT en el repo; el proyecto original es de doble licencia MIT o Apache-2.0 segun el autor |
| Formato de pesos | PyTorch checkpoint (`checkpoints/model_120.ckpt.best`) + `config.ini`, en el layout que espera `init_df(model_base_dir=...)` |
| Dominio de la tarea | audio a audio (supresion de ruido / mejora de voz) |
| Frecuencia de muestreo | no disponible en la informacion proporcionada |
| Tamano del repo | 0.0 GB segun los metadatos de HuggingFace |
| Integridad verificable | ZIP: `49c52edc8947ae1f9bf50d81530beaf3a2c3245aeaf34b6f31ff535cd22284d2`; `config.ini`: `415eb925d44990d938fb739f514aa3662c1ec0ea836cff044fa1291b82cb4290`; checkpoint: `23b92884f63ccf54bb026014604625ab231657b6480df65db4095c4c171e6003` |

## Arquitectura y entrenamiento

DeepFilterNet es un framework de mejora de voz que combina una red neuronal con una etapa de filtrado en el dominio complejo de la STFT (deep filtering). DeepFilterNet3 es la tercera iteracion del modelo dentro de ese proyecto. La model card de este espejo no describe la arquitectura interna, el numero de capas, el coste computacional ni el preprocesado de caracteristicas, por lo que no es posible detallar la topologia a partir de la informacion proporcionada.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de horas de audio, la composicion del dataset, si hubo aumentacion de datos, ni si se aplicaron etapas de ajuste fino. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de audio y no de texto. El checkpoint incluido corresponde al paso 120 del entrenamiento (`model_120.ckpt.best`), dato deducible del propio nombre del fichero.

## Capacidades

- Supresion de ruido y mejora de voz sobre audio, con salida de audio procesado (no genera texto).
- Integracion directa con el paquete Python `deepfilternet` mediante `init_df(model_base_dir=...)`, apuntando al directorio que contiene `DeepFilterNet3/`.
- Uso como componente previo en pipelines de reconocimiento automatico del habla (ASR), donde se aplica antes del modelo acustico.
- Carga en el Space de HuggingFace DeepFilterNet del mismo autor del espejo.
- Verificacion de integridad de los pesos mediante los hashes SHA-256 publicados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades de vision ni de comprension de audio semantica: es audio a audio.
- No se declaran capacidades multilingues en la model card.

## Casos de uso

- Preprocesado para ASR: limpiar la senal de entrada antes de un modelo de reconocimiento de voz para reducir la tasa de error en entornos ruidosos (oficinas, coche, call center). El modelo esta pensado precisamente para esa etapa de front-end.
- Limpieza de grabaciones y podcast: eliminar ruido de fondo estacionario y no estacionario de material ya grabado antes de la edicion o la publicacion.
- Videoconferencia y telefonia en tiempo real: integrado via el paquete `deepfilternet` como etapa de realce de la voz del usuario antes de la codificacion y transmision.
- Reproducibilidad de experimentos: servir los pesos desde un origen fijo con hashes verificables permite reconstruir resultados sin depender del estado de la rama `main` de GitHub, que puede cambiar.
- Generacion de datasets de audio limpio: usar el modelo para crear pares ruido/limpio o para normalizar corpus de voz antes de entrenar otros sistemas.
- Evaluacion comparativa de tecnicas de denoising: al ser un checkpoint fijo y versionado, sirve como referencia estable en pruebas de calidad percibida.
- Despliegue en el Space de HuggingFace: demo publica de mejora de voz accesible desde el navegador sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto original de DeepFilterNet publica metricas objetivas de calidad de audio en su repositorio y articulos, pero este espejo no incluye ninguna tabla de resultados, ni PESQ, ni STOI, ni metricas de coste computacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El checkpoint es un unico fichero y el repo figura como 0.0 GB, pero no se indica su tamano real.
- GPU recomendadas: no disponible. Al no documentarse el coste computacional, no se puede afirmar que requiera GPU; el diseno del proyecto original apunta a inferencia ligera, pero este extremo no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete Python `deepfilternet` (via `init_df`), y el Space de HuggingFace del mismo autor. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama; esas herramientas estan orientadas a modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto, rendimiento ni licencia de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. A modo orientativo de categoria, las alternativas habituales en mejora de voz son RNNoise, DTLN y las versiones anteriores DeepFilterNet y DeepFilterNet2, pero sus especificaciones no se han verificado aqui.

| Modelo | Categoria | Parametros | Contexto | Licencia | Datos en esta ficha |
|---|---|---|---|---|---|
| DeepFilterNet3 (este repo) | Mejora de voz | no disponible | no aplica | MIT / Apache-2.0 (original) | Solo hashes y layout |
| DeepFilterNet2 | Mejora de voz | no disponible | no aplica | no disponible | No verificado |
| RNNoise | Mejora de voz | no disponible | no aplica | no disponible | No verificado |
| DTLN | Mejora de voz | no disponible | no aplica | no disponible | No verificado |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde instrucciones y no admite prompts conversacionales.
- La model card no documenta datos de entrenamiento, sesgos ni condiciones de evaluacion; no se puede caracterizar su comportamiento fuera del caso de uso previsto.
- Es un espejo no oficial: el mantenedor es teamup-tech, no el autor original. No hay garantia de actualizacion ni de soporte; el repo registra 0 descargas y 0 likes en el momento de la consulta.
- El metadata indica fecha de creacion 2026-10-23, una fecha futura o erronea; conviene no fiarse de las marcas temporales del repo.
- El tamano de repo de 0.0 GB sugiere que los ficheros pueden estar en Git LFS o que el contenido no esta materializado; verificar la descarga real antes de integrarlo en produccion.
- La licencia del repo es MIT, pero el proyecto original es dual MIT o Apache-2.0; conviene revisar los terminos del upstream y mantener la atribucion a Hendrik Schröter.
- No se declaran requisitos de hardware, latencia ni limites de frecuencia de muestreo propios de la version 3; cualquier cifra que se use en produccion debe medirse localmente.
- Riesgo de artefactos acusticos (ruido musical, sobre-suprision) no evaluado en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/teamup-tech/DeepFilterNet-weights
- Space de DeepFilterNet: https://huggingface.co/spaces/teamup-tech/DeepFilterNet
- Repositorio original en GitHub: https://github.com/Rikorose/DeepFilterNet
- Origen exacto del ZIP de pesos (commit `d375b2d8`): https://github.com/Rikorose/DeepFilterNet/raw/d375b2d8309e0935d165700c91da9de862a99c31/models/DeepFilterNet3.zip
- Commit de referencia: https://github.com/Rikorose/DeepFilterNet/commit/d375b2d8309e0935d165700c91da9de862a99c31
