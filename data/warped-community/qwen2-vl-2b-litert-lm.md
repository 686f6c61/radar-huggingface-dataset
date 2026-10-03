# warped-community/Qwen2-VL-2B-litert-lm

## Resumen

warped-community/Qwen2-VL-2B-litert-lm es un espejo (mirror) del modelo multimodal Qwen2-VL-2B-Instruct convertido al formato LiteRT-LM, mantenido por la comunidad Warped para su aplicación Android. No se trata de un modelo entrenado desde cero ni de un fine-tune: es una redistribucion del artefacto `Qwen2-VL-2B.litertlm` publicado por litert-community, empaquetado para ejecucion en dispositivo mediante el runtime LiteRT-LM de Google.

El modelo base, Qwen/Qwen2-VL-2B-Instruct, es un transformer multimodal de aproximadamente 2.000 millones de parametros que combina un codificador de vision con un decodificador de lenguaje de la familia Qwen2. Su relevancia en este contexto no esta en las capacidades nuevas, sino en el formato: LiteRT-LM permite desplegar modelos en moviles y dispositivos edge sin depender de un servidor, lo que resulta util para aplicaciones con requisitos de privacidad, latencia o conectividad.

El repositorio ocupa 1,8 GB y declara licencia Apache-2.0, heredada del modelo original. El pipeline no esta declarado, el repositorio no registra descargas ni interacciones y la model card es minima: se limita a indicar el origen del artefacto y su licencia. Esto implica que la mayor parte de las especificaciones tecnicas deben consultarse en la documentacion de Qwen2-VL-2B-Instruct y de LiteRT-LM, no en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de vision + decodificador de lenguaje tipo Qwen2), empaquetado en formato LiteRT-LM |
| Parametros totales | Aproximadamente 2.000 millones (2B), segun el modelo base Qwen/Qwen2-VL-2B-Instruct |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen2-VL-2B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | No especificado en la model card. El tamano del repositorio (1,8 GB) es coherente con pesos cuantizados, pero el autor no detalla el esquema |
| Idiomas soportados | No disponible en este repositorio (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (fichero `.litertlm`) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen2-VL-2B-Instruct: un transformer multimodal con un componente de vision que procesa imagenes a resolucion dinamica y un decodificador de lenguaje de la familia Qwen2 con atencion causal estandar. Este repositorio no aporta entrenamiento adicional, RLHF, DPO ni modificaciones de pesos; su unica intervencion es la conversion de formato para el runtime LiteRT-LM, orientado a inferencia en dispositivo (Android, principalmente).

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion ni hiperparametros de conversion. Cualquier dato de ese tipo debe consultarse en la documentacion oficial de Qwen2-VL. Tampoco se documentan innovaciones propias de este mirror mas alla del empaquetado para LiteRT-LM.

## Capacidades

Las capacidades declaradas derivan del modelo base, no de este repositorio, y no estan verificadas por el autor del mirror:

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes (vision-lenguaje): descripcion, respuesta a preguntas sobre imagenes, lectura de documentos.
- Capacidades multilingues heredadas del modelo base (idiomas concretos no declarados en este repositorio).
- Ejecucion en dispositivo mediante LiteRT-LM, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la informacion de este repositorio (el modelo base lo contempla, pero no hay confirmacion del artefacto convertido).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible (el modelo base es vision-lenguaje, sin audio).

## Casos de uso

- Asistente multimodal en aplicaciones Android: el artefacto esta pensado para integrarse en la app Warped mediante LiteRT-LM, permitiendo describir imagenes o responder preguntas sobre capturas sin enviar datos a un servidor.
- Procesamiento de documentos en el dispositivo: extraccion y resumen de informacion de fotografias de documentos, facturas o formularios, con los datos permaneciendo en el terminal.
- Accesibilidad para personas con discapacidad visual: descripcion de escenas a partir de la camara del movil, funcionando sin conexion.
- Asistencia en campo o entornos sin red: tecnicos que necesitan identificar componentes o consultar manuales en zonas sin cobertura.
- Prototipado rapido de demos edge de vision-lenguaje: util para evaluar viabilidad de modelos multimodales de 2B en hardware movil antes de invertir en infraestructura.
- Aplicaciones con requisitos estrictos de privacidad: sector sanitario, legal o industrial donde el envio de imagenes a APIs externas no es aceptable.
- Investigacion sobre cuantizacion y despliegue on-device: banco de pruebas para medir latencia, consumo y calidad en distintos SoC moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas, y no hay datos de rendimiento del artefacto LiteRT-LM (latencia, throughput, calidad tras la conversion). Cualquier cifra de benchmarks del modelo base debe consultarse en la documentacion oficial de Qwen2-VL-2B-Instruct y no es extrapolable directamente al artefacto convertido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 2B parametros en FP16 requiere alrededor de 4-5 GB y en cuantizacion de 8 bits alrededor de 2-3 GB, pero el esquema de cuantizacion del artefacto no esta documentado.
- GPU recomendadas: dado el tamano, cualquier GPU con 4-6 GB de memoria es suficiente para el modelo base sin cuantizar (RTX 3060, RTX 4060, GTX 1660 6GB). Para el artefacto LiteRT-LM el objetivo declarado es el hardware de movil, no la GPU de escritorio.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna con al menos 4 GB de VRAM, aunque no hay confirmacion del autor para el formato `.litertlm`.
- Opciones de despliegue: LiteRT-LM (runtime nativo del formato). vLLM, llama.cpp, Ollama y TGI no soportan `.litertlm` de forma nativa; requeririan conversion a safetensors o GGUF, no documentada en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| warped-community/Qwen2-VL-2B-litert-lm | ~2B (heredado) | No disponible en este repo (base: 32.768 tokens) | LiteRT-LM | Apache-2.0 | Despliegue on-device Android |
| Qwen/Qwen2-VL-2B-Instruct | ~2B | 32.768 tokens declarados por el autor | safetensors | Apache-2.0 | Modelo base multimodal |
| litert-community/Qwen2-VL-2B | ~2B | No disponible | LiteRT-LM | Apache-2.0 | Version oficial en LiteRT-LM |
| Modelos multimodales pequenos orientados a movil (por ejemplo, familias SmolVLM o Gemma 3n) | Rango de 0,25B a 4B | Variable | safetensors / GGUF / on-device | Variable | Vision-lenguaje en edge |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio es un mirror de terceros, no una publicacion oficial. Su model card no documenta el proceso de conversion ni verificaciones de calidad.
- No hay metricas publicadas del artefacto convertido: se desconoce la degradacion de calidad respecto al modelo base tras la conversion y posible cuantizacion.
- El pipeline no esta declarado, el repositorio registra cero descargas y cero interacciones, y las fechas de creacion y actualizacion indican un artefacto muy reciente o de uso interno, sin validacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en tareas de razonamiento y en la interpretacion de imagenes con texto denso. No hay evaluacion publicada al respecto para este artefacto.
- Limitaciones de idioma y contexto: la model card no declara idiomas soportados; el contexto efectivo del artefacto `.litertlm` no esta confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes upstream (LiteRT-LM y el artefacto original de litert-community) antes de distribuirlo.
- Para produccion: la ausencia de benchmarks, de pruebas de latencia y de documentacion del esquema de cuantizacion obliga a realizar una evaluacion propia antes de integrarlo en un producto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Qwen2-VL-2B-litert-lm
- Artefacto fuente en LiteRT-LM: https://huggingface.co/litert-community/Qwen2-VL-2B
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Referencias adicionales sobre LiteRT-LM y formatos on-device: no disponible en la informacion proporcionada.
