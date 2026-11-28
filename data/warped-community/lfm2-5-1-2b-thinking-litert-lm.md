# warped-community/LFM2.5-1.2B-Thinking-litert-lm

## Resumen

LFM2.5-1.2B-Thinking-litert-lm es un espejo del modelo LiquidAI/LFM2.5-1.2B-Thinking convertido al formato LiteRT-LM (`.litertlm`) para su ejecucion en dispositivos moviles. Lo mantiene el usuario warped-community para la aplicacion Warped de Android, que necesita una version empaquetada del modelo original de Liquid AI lista para desplegarse en telefono sin depender de infraestructura de servidor. El modelo de origen es un transformer de 1.200 millones de parametros con modo de razonamiento explicito ("Thinking") desarrollado por Liquid AI.

El interes de esta ficha esta en la version cuantizada en int8 que se distribuye como artefacto unico, pensada para inferencia local en Android mediante el runtime LiteRT-LM de Google. Frente al modelo original en safetensors, este espejo reduce la friccion de integracion: un solo fichero, cuantizacion fija y un runtime optimizado para aceleradores moviles (CPU, GPU y NPU segun el dispositivo).

La informacion publica disponible es escasa: la model card es minima, no hay benchmarks propios, no se declaran idiomas soportados y la licencia figura como "other" heredada del modelo base. Cualquier evaluacion de capacidades debe remitirse a la documentacion del modelo original de Liquid AI, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LiquidAI/LFM2.5-1.2B-Thinking; no se detalla en la model card) |
| Parametros totales | 1.200 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `LFM2.5-1.2B-Thinking_int8.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | LiteRT-LM (`.litertlm`); tamano del repo 2,0 GB |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la documentacion de este repositorio. El modelo es un espejo del checkpoint LiquidAI/LFM2.5-1.2B-Thinking, por lo que su arquitectura y entrenamiento corresponden al trabajo original de Liquid AI, no a una modificacion de warped-community.

La unica transformacion documentada es la conversion al formato LiteRT-LM con cuantizacion int8, tomada del repositorio litert-community/LFM2.5-1.2B-Thinking (fichero `LFM2.5-1.2B-Thinking_int8.litertlm`). No se detalla si hubo calibracion adicional, que capas se cuantizaron ni que precision se mantiene en embeddings o cabezas de atencion.

## Capacidades

- Generacion de texto y razonamiento en modo "Thinking" (el nombre del modelo base indica un modo de razonamiento explicito; no se detalla su funcionamiento en esta model card).
- Inferencia local en dispositivos Android mediante el runtime LiteRT-LM.
- Cuantizacion int8 orientada a reducir huella de memoria y latencia en hardware movil.
- Capacidades de codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente integrado en aplicacion Android: el modelo se empaqueta como `.litertlm` y se ejecuta en el dispositivo mediante LiteRT-LM, sin enviar datos a un servidor, lo que encaja en escenarios de privacidad estricta.
- Funcionalidad offline: al ser un artefacto local de 2,0 GB, permite funciones de generacion de texto en moviles sin conectividad, util para aplicaciones de campo o entornos con red intermitente.
- Prototipado rapido de funciones de IA en la app Warped: el mantenimiento del espejo por parte de warped-community sugiere un uso interno de la propia aplicacion como banco de pruebas de razonamiento en dispositivo.
- Sustitucion de llamadas a API en funciones de bajo riesgo: tareas de resumen corto, reescritura o clasificacion textual que no requieran la calidad de un modelo en la nube.
- Evaluacion de LiteRT-LM como runtime: este repositorio sirve para medir latencia y consumo energetico de un modelo de 1,2 B en hardware Android concreto antes de comprometerse con una integracion mayor.
- Distribucion controlada en flotas de dispositivos: al ser un fichero unico versionado, facilita el despliegue y la actualizacion del modelo en apps empresariales Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,0 GB en formato int8; se requiere al menos esa cantidad de memoria libre en el dispositivo, mas el overhead del runtime LiteRT-LM.
- GPU de escritorio: no aplica como objetivo principal; el artefacto esta pensado para aceleradores moviles (CPU, GPU integrada y NPU de SoC Android).
- Cabe en GPU de consumo: no disponible para el formato `.litertlm`; para el modelo base en otros formatos habria que consultar el repositorio de Liquid AI.
- Opciones de despliegue: LiteRT-LM (runtime objetivo). Otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-litert-lm (este) | 1,2 B | no disponible | LiteRT-LM int8 | other | Hugging Face, 12 descargas |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2 B | no disponible | safetensors (presumiblemente) | other | Hugging Face (modelo base) |
| litert-community/LFM2.5-1.2B-Thinking | 1,2 B | no disponible | LiteRT-LM int8 | no disponible | Hugging Face (origen del fichero) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no declara idiomas, contexto ni capacidades detalladas; no debe asumirse ninguna funcionalidad no documentada.
- Licencia "other" heredada del modelo base: es imprescindible revisar los terminos de LiquidAI/LFM2.5-1.2B-Thinking antes de cualquier uso comercial.
- La cuantizacion int8 puede degradar la calidad respecto al checkpoint original; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El repositorio tiene un mantenimiento comunitario (12 descargas, 0 likes) y no procede del autor original del modelo; la trazabilidad y las actualizaciones dependen de warped-community.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; deben asumirse los del modelo base y validarse en el caso de uso concreto.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente utilizable en ecosistemas como transformers, vLLM o llama.cpp sin conversion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warped-community/LFM2.5-1.2B-Thinking-litert-lm
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Origen del fichero LiteRT-LM: https://huggingface.co/litert-community/LFM2.5-1.2B-Thinking
