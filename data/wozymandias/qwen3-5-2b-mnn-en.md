# wozymandias/Qwen3.5-2B-MNN-en

## Resumen

Qwen3.5-2B-MNN-en es un conjunto de ficheros complementarios (add-on) para el modelo taobao-mnn/Qwen3.5-2B-MNN, una adaptacion al runtime MNN del modelo Qwen3.5-2B del equipo Qwen. No se trata de un modelo entrenado desde cero ni de un fine-tuning completo, sino de un parche del cabezal de salida (output head) que reduce el vocabulario efectivo de decodificacion a 115.456 tokens para acelerar la inferencia en dispositivos Android. Lo publica el usuario wozymandias como parte del proyecto VIdim, una aplicacion Android offline de asistencia visual para personas ciegas o con baja vision.

La innovacion tecnica se basa en la tecnica VocabTrim descrita en el paper arXiv 2506.22694: en lugar de calcular logits sobre el vocabulario completo, se restringe la capa de salida a los tokens que cubren texto en ingles, lo que produce, segun el autor, una mejora del 7-15% en velocidad de decodificacion en telefonos moviles manteniendo una salida identica para descripciones en ingles. El repositorio ocupa 0,2 GB e incluye tres ficheros: `llm.mnn` (grafo parcheado), `lmhead_en.bin` (pesos del cabezal recortado) y `vocab_map.bin` (mapeo de indices de logit a ids de token).

Es relevante ahora porque demuestra una via practica de optimizacion de modelos de vision-lenguaje de 2B parametros para inferencia totalmente offline en hardware movil, un escenario con restricciones severas de memoria y latencia donde tecnicas de recorte de vocabulario pueden marcar la diferencia entre un producto usable y uno que no lo es. El modelo base es Qwen3.5-2B, con licencia Apache 2.0, y estos ficheros derivados mantienen la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B; el add-on modifica el cabezal de salida para MNN) |
| Parametros totales | no disponible (el modelo base se denomina 2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como pesos MNN; el autor no detalla cuantizacion) |
| Idiomas soportados | ingles (el cabezal recortado cubre 115.456 tokens de texto en ingles; el modelo base puede soportar mas idiomas, pero este add-on esta optimizado para ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `lmhead_en.bin`, `vocab_map.bin`); requiere `llm.mnn.weight` del repo taobao-mnn/Qwen3.5-2B-MNN en revision `35781816d7b6a9dcb273a6765ac9563401951c3c` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un modelo de vision-lenguaje del equipo Qwen, pero la informacion disponible no detalla su arquitectura interna (tipo de transformer, atencion, capas, dimensiones). Lo que si se describe con precision es la modificacion aportada por este repositorio: se ha parcheado el grafo MNN (`llm.mnn`) para que la capa de salida lea un cabezal recortado (`lmhead_en.bin`) que calcula logits unicamente sobre 115.456 tokens que cubren texto en ingles, en lugar del vocabulario completo. El fichero `vocab_map.bin` proporciona el id de token correspondiente a cada logit recortado, en orden, y el sampler necesita los parches de MNN de VIdim para funcionar.

No se trata de un modelo entrenado ni ajustado con RLHF/DPO en este repositorio: es un artefacto de inferencia derivado del modelo base. La tecnica aplicada es VocabTrim (arXiv 2506.22694), que segun el autor acelera la decodificacion entre un 7% y un 15% en telefonos moviles y produce salidas identicas para descripciones en ingles. No se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni proceso de alineacion del modelo base.

## Capacidades

- Generacion de descripciones visuales del entorno: el modelo base es de vision-lenguaje y el add-on esta disenado para la app VIdim, que describe el mundo a personas ciegas o con baja vision.
- Inferencia offline en Android: los ficheros estan pensados para ejecutarse en el runtime MNN en telefonos, sin conexion a red.
- Decodificacion acelerada en ingles: el recorte de vocabulario reduce el coste de la capa de salida en un 7-15% segun el autor.
- Salida equivalente en ingles: el autor afirma que el resultado es identico para descripciones en ingles respecto al modelo sin recortar.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, agentes, multilingue): no disponibles en la informacion proporcionada para este add-on; el recorte de vocabulario a tokens ingleses limita de facto la generacion a ese idioma.

## Casos de uso

- Asistencia visual para personas ciegas o con baja vision: es el caso de uso original de VIdim; el modelo procesa la imagen de la camara del telefono y genera una descripcion hablada del entorno, con la ventaja de funcionar completamente offline y con una decodificacion mas rapida gracias al cabezal recortado.
- Aplicaciones de accesibilidad en dispositivos de gama media: el recorte de vocabulario reduce el coste computacional por token generado, lo que permite desplegar un VLM de 2B en telefonos con recursos limitados sin sacrificar la calidad de las descripciones en ingles.
- Lectura asistida de documentos y carteles: un usuario puede apuntar la camara a un texto o etiqueta y obtener una descripcion o lectura en ingles; la latencia reducida mejora la experiencia en tiempo real.
- Navegacion asistida en interiores: descripcion de obstaculos, senaletica y distribucion de espacios en tiempo real, donde cada milisegundo de latencia cuenta para la seguridad del usuario.
- Prototipado de aplicaciones MNN de vision-lenguaje: sirve como referencia tecnica para desarrolladores que quieran aplicar VocabTrim a otros modelos en el runtime MNN y medir el ahorro en decodificacion.
- Investigacion en optimizacion de inferencia movil: permite reproducir y evaluar la tecnica VocabTrim sobre un VLM de 2B en hardware Android real, comparando latencias con y sin recorte de vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es una mejora del 7-15% en velocidad de decodificacion en telefonos moviles, sin cifras absolutas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta orientado a memoria unificada de telefonos Android, no a GPU de escritorio.
- GPU recomendadas: no aplica en el caso de uso principal (Android con MNN); para el modelo base en servidor no se proporcionan recomendaciones.
- Compatibilidad con GPU de consumo: no disponible; el despliegue previsto es en SoC moviles con aceleracion (CPU/GPU/NPU) a traves de MNN.
- Opciones de despliegue: runtime MNN con los parches de VIdim; requiere `llm.mnn.weight` del repositorio taobao-mnn/Qwen3.5-2B-MNN en la revision exacta `35781816d7b6a9dcb273a6765ac9563401951c3c` (sha256 `c93f71a2dbecf9328782bd38861656d8faa82e95e7f99607350074768a482054`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se indica una mejora relativa del 7-15% en decodificacion en telefonos; no hay cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| wozymandias/Qwen3.5-2B-MNN-en | no disponible (base 2B) | no disponible | ingles (cabezal recortado) | Apache 2.0 | MNN | Add-on de VocabTrim para VIdim; 7-15% mas rapido en movil |
| taobao-mnn/Qwen3.5-2B-MNN | no disponible (base 2B) | no disponible | no disponible | no disponible en la informacion | MNN | Version MNN del modelo base sin recorte de vocabulario |
| Qwen/Qwen3.5-2B | 2B (segun denominacion) | no disponible | no disponible | Apache 2.0 (segun el autor) | no disponible | Modelo base original del equipo Qwen |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El cabezal recortado solo cubre 115.456 tokens de texto en ingles; la generacion en otros idiomas puede degradarse o fallar, aunque el modelo base sea multilingue.
- Dependencia estricta de una revision concreta del repositorio taobao-mnn/Qwen3.5-2B-MNN: revisiones posteriores tienen pesos distintos y no funcionaran con estos ficheros.
- El sampler de `vocab_map.bin` requiere los parches de MNN de VIdim, que no forman parte de este repositorio; sin ellos el add-on no es utilizable.
- No es un modelo autonomo: necesita los pesos base (`llm.mnn.weight`) y el procedimiento de concatenacion `cat lmhead_en.bin >> llm.mnn.weight`.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un caso de uso de accesibilidad para personas ciegas, una descripcion erronea puede tener consecuencias de seguridad.
- Sesgos conocidos: no documentados; al ser un derivado del modelo base, hereda los sesgos de este, que no se detallan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aporta garantias ni soporte; conviene verificar la licencia del modelo base y de los pesos MNN de taobao-mnn de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su funcionamiento.
- No hay informacion sobre cuantizacion, contexto maximo ni consumo de memoria exacto en dispositivos concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wozymandias/Qwen3.5-2B-MNN-en
- Modelo base MNN: https://huggingface.co/taobao-mnn/Qwen3.5-2B-MNN
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper de VocabTrim: arXiv 2506.22694 (https://arxiv.org/abs/2506.22694)
- Proyecto VIdim: no disponible en la informacion proporcionada
