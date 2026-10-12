# vlad-grig/opus-mt-en-es

## Resumen

vlad-grig/opus-mt-en-es es una conversión a ONNX del modelo de traducción Helsinki-NLP/opus-mt-en-es, publicada para poder ejecutarse directamente en el navegador mediante Transformers.js. No se trata de un modelo nuevo ni de un entrenamiento adicional: el autor lo describe explícitamente como un espejo de pesos, creado para que un plugin de WordPress que traduce catálogos de productos en el navegador del propio dueño de la tienda no dependa de un repositorio que no controla. La autoría del modelo original corresponde al Language Technology Research Group de la Universidad de Helsinki, dentro del proyecto OPUS, y la conversión sigue el trabajo previo de Xenova/opus-mt-en-es.

El modelo resuelve una tarea concreta y acotada: traducción de inglés a español. Es un modelo Marian de tipo transformer encoder-decoder con pipeline `translation`, empaquetado en formato ONNX con dos precisiones deliberadamente limitadas: `fp32` para WebGPU y `q8` para el fallback en WebAssembly. El repositorio completo ocupa 0,6 GB e incluye únicamente esos dos ficheros de pesos; el resto de cuantizaciones se omitió a propósito para no consumir ancho de banda del visitante.

Su relevancia es práctica más que técnica: demuestra el patrón de despliegue de traducción neuronal totalmente en el cliente, sin enviar texto a un servidor y sin coste de inferencia por petición. La licencia es CC-BY-4.0, la misma del modelo original, y exige atribución tanto al grupo de Helsinki como a la cadena de conversión. El repositorio no tiene descargas ni likes registrados, y la información pública no incluye idiomas adicionales, número de parámetros ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), modelo base Helsinki-NLP/opus-mt-en-es |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `fp32` (WebGPU) y `q8` (WebAssembly); el resto se omite deliberadamente |
| Idiomas soportados | inglés → español (dirección única) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |
| Librería | transformers.js |
| Pipeline | translation |
| Modelo base | Helsinki-NLP/opus-mt-en-es |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-11 |
| Última actualización | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder-decoder de traducción automática neuronal de la familia Marian, desarrollado por el Language Technology Research Group de la Universidad de Helsinki en el marco del proyecto OPUS. La model card de este repositorio no aporta detalles adicionales sobre número de capas, dimensión de los embeddings, número de cabezas de atención, vocabulario del tokenizador ni composición del dataset, por lo que esos datos se consideran no disponibles en esta ficha. Tampoco se documenta ningún proceso de ajuste por preferencias humanas (RLHF, DPO u otro); se trata de un modelo de traducción supervisada, no de un modelo de instrucciones.

El único trabajo técnico realizado aquí es la conversión de pesos a ONNX siguiendo la aproximación de Xenova/opus-mt-en-es, con una decisión de empaquetado relevante: publicar solo `fp32` y `q8`. La variante `fp32` está pensada para ejecutarse con la API WebGPU del navegador, mientras que `q8` actúa como respaldo cuando WebAssembly es el único backend disponible. No hay innovaciones arquitectónicas propias, decodificación especulativa ni modificaciones del grafo más allá de las necesarias para la exportación a ONNX.

## Capacidades

- Traducción de texto de inglés a español como tarea principal y única del pipeline.
- Ejecución íntegra en el navegador del cliente mediante Transformers.js, sin llamadas a un servidor de inferencia.
- Dos backends seleccionables según capacidades del dispositivo: WebGPU con pesos `fp32` y WebAssembly con pesos `q8`.
- Integración con la librería Transformers.js, que expone una API de tipo `pipeline('translation', ...)` en JavaScript.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni planificación.
- No dispone de modo de razonamiento explícito (thinking mode).
- No tiene capacidades de visión, audio ni multimodalidad.
- Multilingüismo: limitado a un único par de idiomas en una sola dirección.

## Casos de uso

- Traducción de catálogos de producto en WordPress: es exactamente el escenario para el que se creó el repositorio; el plugin carga los pesos en el navegador del dueño de la tienda y traduce fichas de producto sin depender de un servicio externo ni exponer el contenido a terceros.
- Comercio electrónico con datos sensibles: al ejecutarse en el cliente, los textos de inventario, precios internos o descripciones en borrador no salen del dispositivo, lo que simplifica el cumplimiento de normativas de protección de datos.
- Traducción offline en aplicaciones web progresivas (PWA): una vez descargados los pesos, la traducción funciona sin conexión, útil en entornos con conectividad intermitente o en despliegues en kiosco.
- Extensiones de navegador: traducción de fragmentos de página, formularios o correos directamente en el cliente, sin enviar el contenido a una API de terceros.
- Preprocesado por lotes en el navegador o en Node.js: uso de la variante `q8` con ONNX Runtime para normalizar grandes volúmenes de texto en inglés antes de introducirlos en otro sistema.
- Subtitulado y localización ligera: traducción de guiones, fichas técnicas o cadenas de interfaz de inglés a español en herramientas internas de edición.
- Apoyo a documentación técnica: traducción asistida de README, changelogs o notas de versión en flujos de trabajo donde la revisión humana posterior es obligatoria.
- Demos educativas: ejemplo compacto de cómo exportar un modelo Marian a ONNX y ejecutarlo en WebGPU, útil para enseñar despliegue de modelos en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye métricas de calidad de traducción (BLEU, chrF, COMET u otras), ni comparaciones con el modelo original más allá de la equivalencia de pesos. Tampoco se aportan datos de latencia, tokens por segundo ni consumo de memoria en navegador.

## Requisitos de hardware

- El repositorio completo ocupa 0,6 GB e incluye las variantes `fp32` y `q8`; el desglose del tamaño por fichero no está disponible en la información proporcionada.
- No requiere GPU de servidor: el destino principal es el navegador del usuario final.
- Con WebGPU, la variante `fp32` se ejecuta sobre la GPU integrada o dedicada del dispositivo; cabe en equipos de consumo con GPU integrada moderna, aunque no se especifican requisitos mínimos.
- Con WebAssembly, la variante `q8` funciona como respaldo en CPU, sin necesidad de GPU, con mayor latencia esperada.
- GPU recomendadas: no disponible; el modelo está pensado para hardware de cliente, no para A100, H100 ni RTX 4090.
- Opciones de despliegue: Transformers.js (navegador y Node.js) como vía principal; ONNX Runtime Web para integraciones personalizadas; ONNX Runtime en servidor si se quiere servir la traducción desde backend.
- No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizaciones | Ejecución | Licencia | Notas |
|---|---|---|---|---|---|
| vlad-grig/opus-mt-en-es | ONNX | `fp32`, `q8` | Navegador (WebGPU/WASM) | cc-by-4.0 | Espejo para un plugin de WordPress; solo incluye las dos precisiones que se descargan en cliente |
| Helsinki-NLP/opus-mt-en-es | PyTorch / safetensors | Pesos completos en fp32 | Servidor o local | cc-by-4.0 | Modelo original entrenado por la Universidad de Helsinki; referencia upstream |
| Xenova/opus-mt-en-es | ONNX | Conjunto más amplio de cuantizaciones | Navegador y Node.js | cc-by-4.0 | Conversión de referencia en la que se basa este repositorio |
| NLLB-200-distilled-600M | PyTorch / varios | Múltiples | Servidor o local | CC-BY-NC-4.0 | Alternativa multilingüe de mayor tamaño; licencia no comercial, datos concretos no verificados en la información proporcionada |

## Limitaciones y advertencias

- Dirección única inglés → español: no traduce de español a inglés ni entre otros pares de idiomas.
- Al no publicarse benchmarks, no hay evidencia verificable en este repositorio sobre la calidad de traducción en dominios especializados (legal, médico, técnico).
- Los modelos Marian trabajan bien con segmentos cortos; para documentos largos conviene dividir en frases o párrafos y controlar el límite de tokens del tokenizador, cuyo valor no se documenta aquí.
- Riesgo de traducción literal, pérdida de matices, tratamiento inconsistente de terminología y nombres propios, y errores en expresiones idiomáticas.
- Riesgo de alucinación menor que en modelos generativos abiertos, pero existente: puede producir traducciones fluidas que no corresponden fielmente al original.
- Sesgos: no se documenta ningún análisis de sesgo de género, registro o variedad dialectal. El modelo produce español estándar sin control de variante regional.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución al grupo de investigación de Helsinki, al autor de la conversión ONNX de referencia y al publicador de este repositorio. No acreditar correctamente incumple la licencia.
- El repositorio no aporta trabajo original: si el modelo upstream se actualiza o retira, este espejo puede quedar desincronizado, y el autor advierte de su dependencia de un repositorio que no controla.
- Solo se publican dos cuantizaciones; si el dispositivo no soporta WebGPU ni WebAssembly con las capacidades requeridas, no hay una tercera opción intermedia.
- El repositorio no tiene descargas ni likes, por lo que carece de validación por parte de la comunidad.
- Verificar la compatibilidad de la versión de Transformers.js con la estructura ONNX exportada antes de integrarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vlad-grig/opus-mt-en-es
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Conversión ONNX de referencia: https://huggingface.co/Xenova/opus-mt-en-es
- Transformers.js: https://github.com/huggingface/transformers.js
- Texto de la licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Nota: la búsqueda web asociada a este modelo no devolvió enlaces relevantes; los resultados obtenidos correspondían a entidades y contenidos sin relación con el modelo (empresas industriales, canales de vídeo y artículos históricos), por lo que no se incluyen. No se han encontrado papers, blogs ni demos específicos de esta conversión en la información proporcionada.
