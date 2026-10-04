# Valnivo-labs/valnivo-copilot-1

## Resumen

Valnivo Copilot 1 es un modelo de lenguaje especializado desarrollado por Valnivo Labs como componente opcional on-device de su copiloto "Ask Valnivo". Se construye a partir de Qwen2.5-1.5B-Instruct (© Alibaba Cloud, Apache-2.0) mediante un ajuste fino con LoRA orientado a dos tareas muy concretas: el enrutado de preguntas hacia identificadores de una biblioteca propia de respuestas, lugares y acciones, y la redacción de frases a partir de plantillas con ranuras nombradas. Posteriormente se exporta a ONNX de 4 bits para ejecutarse en el navegador con WebGPU a través de transformers.js 4.3.

La relevancia del modelo reside en su enfoque de privacidad y despliegue: se ejecuta íntegramente en el dispositivo del usuario y ninguna consulta sale de él. No ofrece asesoramiento ni responde a preguntas de índole fiscal, de seguros o de ordenación de deudas, ya que esas peticiones se rechazan en el código de la aplicación antes de invocar al modelo. El modelo base tiene aproximadamente 1 500 millones de parámetros, soporta ocho idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés y polaco) y se distribuye bajo licencia Apache-2.0.

La ficha corresponde al identificador `Valnivo-labs/valnivo-copilot-1`, cuya model card describe la versión 1.1 del modelo. El repositorio ocupa 4,9 GB e incluye todos los archivos y los datos externos asociados al export de ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5, con ajuste fino mediante LoRA y export a ONNX |
| Parametros totales | Aproximadamente 1 500 millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | q4 (pesos de 4 bits, aritmetica de 32 bits, pesos como datos externos) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js, con `use_external_data_format: true`) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1 500 millones de parametros. El ajuste fino se realizo con LoRA sobre dos tareas estrechas: enrutado (una pregunta en uno de los ocho idiomas se asigna al identificador de una entrada de la biblioteca de Valnivo, o bien a `none`) y redaccion (un hecho ya calculado por la aplicacion, entregado con ranuras nombradas como `{income}` o `{spent}` en lugar de cifras, se convierte en una o dos frases que conservan las ranuras). El entrenamiento se llevo a cabo con la revision fijada de `Qwen/Qwen2.5-1.5B-Instruct` mediante `mlx-lm` 0.32, en 900 pasos para la version 1.0 y 650 pasos adicionales para la 1.1.

El material de entrenamiento se compone exclusivamente de la biblioteca propia de Valnivo (formas de formular cada respuesta en ocho idiomas, titulos de tarjetas de pantalla, rechazos, una lista de temas fuera de alcance e instrucciones de cada accion) y de un banco de plantillas de respuesta verificadas previamente por los propios controles de la aplicacion. No se entrenó con datos de personas ni con un conjunto de evaluacion. La exportacion a ONNX se hizo sobre el grafo del export `q4` de `onnx-community/Qwen2.5-1.5B-Instruct`, sustituyendo los pesos por los ajustados. La eleccion de `q4` (aritmetica de 32 bits) frente a `q4f16` responde a que, en aritmetica de 16 bits sobre WebGPU, los pesos ajustados desbordan en el primer token; ademas, ONNX Runtime Web 1.22 (transformers.js 3.8) ejecutaba el modelo incorrectamente en WebGPU, problema resuelto en la version 1.31 (transformers.js 4.3).

## Capacidades

- Enrutado de intenciones: asigna una pregunta en uno de los ocho idiomas al identificador de una entrada de la biblioteca propia o a `none`; cualquier salida que no sea un identificador se descarta.
- Redaccion con plantillas: genera una o dos frases a partir de hechos calculados por la aplicacion, manteniendo ranuras nombradas en lugar de cifras.
- Refuerzo de seguridad mediante diseno: la aplicacion rechaza peticiones de veredictos, fiscales, de seguros y de ordenacion de deudas antes de ejecutar el modelo; el propio modelo no ofrece consejo.
- Deteccion de temas fuera de alcance: clasifica preguntas no pertinentes como `none`.
- Soporte multilingue nativo en ocho idiomas (en, fr, de, es, it, pt, nl, pl).
- Ejecucion on-device en el navegador con WebGPU, sin que las consultas abandonen el dispositivo.
- Generacion de acciones: reconoce instrucciones y propone acciones de una biblioteca definida (entradas, presupuestos, inflacion, horizonte, pagos recurrentes, objetivos, categorizacion, valoraciones, retos, tema, idioma y formularios de cuentas, participaciones y deudas).
- No disponible: soporte explicito de tool calling generico, function calling arbitrario, vision, audio ni modo de razonamiento (thinking mode) al margen de sus dos tareas.

## Casos de uso

- Enrutado de intenciones en asistentes on-device: el modelo convierte la pregunta del usuario en el identificador de una respuesta o accion conocida; la aplicacion resuelve ese identificador y descarta cualquier salida que no sea valido, lo que encaja en copilotos web con biblioteca de respuestas cerrada.
- Redaccion de respuestas basadas en datos del usuario: a partir de un hecho ya calculado por la aplicacion (por ejemplo, ingresos o gasto), el modelo redacta una o dos frases con ranuras nombradas que la propia aplicacion rellena y verifica antes de mostrar la respuesta.
- Asistentes financieros personales con privacidad: al ejecutarse en el navegador con WebGPU, los datos financieros del usuario no salen del dispositivo, lo que resulta adecuado para aplicaciones de finanzas personales sensibles a la privacidad.
- Copilotos web de baja dependencia de red: con cerca de 0,3 s para enrutar una pregunta y unos pocos segundos para redactar una respuesta en un Apple M3 (tras una carga inicial de unos 7 s), permite experiencias interactivas sin llamadas a servidores.
- Filtrado de ambito y rechazo controlado: la combinacion del codigo de la aplicacion y del enrutado a `none` permite descartar temas fuera de alcance (evaluado en 9/9 en el conjunto eval3) y bloquear preguntas de asesoramiento antes de ejecutar el modelo.
- Atencion multilingue en ocho idiomas: un mismo copiloto puede atender a usuarios en ingles, frances, aleman, espanol, italiano, portugues, neerlandes y polaco sin modelos separados.
- Prototipado de asistentes web con transformers.js: al distribuirse como export ONNX para transformers.js 4.3 y WebGPU, se integra en aplicaciones web que quieran un copiloto de alcance acotado sin infraestructura de servidor.
- Generacion de acciones guiada por biblioteca: para aplicaciones con un catalogo fijo de operaciones (crear entradas, ajustar presupuestos, categorizar movimientos), el modelo identifica la accion correspondiente a una instruccion del usuario.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las mediciones del autor en Chrome sobre WebGPU, con conjuntos no usados en entrenamiento:

| Conjunto | Resultado |
|---|---|
| Redaccion, 64 preguntas, 8 idiomas | 64/64 superan los controles de la aplicacion; revisadas por una persona |
| eval3, 39 preguntas (nunca usadas en entrenamiento ni ajuste) | 39/39 correctas, 0 de 9 preguntas de asesoramiento filtradas, 9/9 fuera de alcance resueltas como `none` |
| eval / eval2, 108 preguntas | 76% / 78% correctas, 0 de asesoramiento filtradas |
| Acciones, 41 instrucciones (tres rondas) | 30/41 correctas; ninguna accion ofrecida para una pregunta simple, ninguna accion erronea ofrecida |
| Enrutado, 147 preguntas (1.1 frente a 1.0) | 83% frente al 80% de la version 1.0 en WebGPU |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Modelo disenado para ejecucion on-device en navegador mediante WebGPU; no requiere servidor de inferencia.
- Tamano del repositorio: 4,9 GB (incluye pesos, datos externos y demas archivos listados en `SHA256SUMS`).
- Huella de pesos q4: no disponible de forma explicita; al tratarse de un modelo de aproximadamente 1 500 millones de parametros en 4 bits, la huella de pesos se situa en el entorno de 1 GB, mas el sobrecoste de los datos externos y del runtime (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU o iGPU compatible con WebGPU en Chrome; el autor ha medido el modelo en un Apple M3.
- Cabe en GPU de consumo: si, el objetivo es ejecutarlo en hardware de usuario final (portatiles, equipos de sobremesa y dispositivos con WebGPU), no en aceleradores de centro de datos.
- Opciones de despliegue: transformers.js 4.3 o posterior, con `dtype: 'q4'`, `device: 'webgpu'` y `use_external_data_format: true`; runtime ONNX Runtime Web 1.31. El autor advierte de que ONNX Runtime Web 1.22 (transformers.js 3.8) ejecutaba mal el modelo en WebGPU.
- Latencia y throughput: aproximadamente 0,3 s para enrutar una pregunta y unos pocos segundos para redactar una respuesta en un Apple M3, tras una primera carga de unos 7 s. No se publican datos de throughput.
- vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada para este export ONNX orientado a WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Valnivo Copilot 1 | ~1 500 M (LoRA sobre Qwen2.5-1.5B-Instruct) | no disponible | Apache-2.0 | ONNX para transformers.js / WebGPU | Enrutado y redaccion para un copiloto on-device; ocho idiomas |
| Qwen2.5-1.5B-Instruct | ~1 500 M | no disponible en la informacion | Apache-2.0 | safetensors, GGUF y otros | Modelo base generalista del que deriva |
| onnx-community/Qwen2.5-1.5B-Instruct | ~1 500 M | no disponible en la informacion | Apache-2.0 | ONNX `q4` para transformers.js | Grafo de exportacion reutilizado por Valnivo Copilot 1 |
| Otros modelos pequenos comparables (por ejemplo de la franja 1-2 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de resultados de benchmarks comunes que permitan comparar directamente Valnivo Copilot 1 con alternativas de la misma categoria, ya que las mediciones publicadas corresponden a conjuntos propios y cerrados del copiloto.

## Limitaciones y advertencias

- Modelo de proposito muy acotado: solo cubre enrutado y redaccion con plantillas; no es un asistente generalista ni soporta tool calling generico.
- Riesgo de alucinacion fuera de su ambito: cualquier salida que no sea un identificador valido se descarta en la aplicacion, y la redaccion esta sujeta a controles que exigen ausencia de cifras propias, de palabras de veredicto y de cifras junto a palabras de otra funcion. Estas salvaguardas dependen del codigo de la aplicacion, no solo del modelo.
- No ofrece asesoramiento: las peticiones de veredictos, fiscales, de seguros o de ordenacion de deudas se rechazan en el codigo de la aplicacion antes de ejecutar el modelo.
- Idiomas: soporta ocho idiomas (en, fr, de, es, it, pt, nl, pl); no se documentan otros.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Dependencia de versiones concretas: requiere transformers.js 4.3 o posterior y ONNX Runtime Web 1.31; en versiones anteriores (transformers.js 3.8) el modelo se ejecutaba incorrectamente en WebGPU. Asimismo, con aritmetica de 16 bits (`q4f16`) los pesos desbordan en el primer token, por lo que debe usarse `q4`.
- Licencia: Apache-2.0, igual que el modelo base; conviene revisar el archivo `LICENSE` para los terminos exactos.
- Datos de evaluacion limitados: los resultados publicados proceden de conjuntos propios del autor y no de benchmarks estandar, por lo que la comparabilidad con otros modelos es limitada.
- Repositorio sin descargas ni "likes" en el momento de la consulta, y fecha de creacion futura respecto a la informacion recopilada; se recomienda verificar la vigencia de los archivos mediante `SHA256SUMS`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Valnivo-labs/valnivo-copilot-1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Grafo de exportacion ONNX de referencia: https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct
- transformers.js: https://github.com/huggingface/transformers.js
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
