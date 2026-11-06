# yrangana/ncm-lab-models

## Resumen

`yrangana/ncm-lab-models` es un repositorio de artefactos ONNX derivados de los checkpoints de Next-Concept Modeling (NCM), una arquitectura de investigacion presentada por Kumbong, Khare, Mlauzi, Woen, Ding, Buchanan, Arora, Mirhoseini y Re (2026). El autor, Yasiru Rangana, publica aqui builds reducidos pensados para ejecutarse en el navegador mediante `onnxruntime-web`, concretamente el modelo TinyStories procedente de `mrfakename/ncm-webgpu-weights` con los pesos de las multiplicaciones matriciales cuantizados a 4 bits. El objetivo no es ofrecer un modelo de proposito general, sino servir como material de demostracion para los ejemplos web alojados en ncmlab.vercel.app y el codigo del repositorio ncm-lab.

El artefacto principal, `tinystories-q4`, reduce el tamano de descarga de 573 MB a 258 MB y el pico de memoria en Chrome (backend wasm) de aproximadamente 1,8 GB a unos 0,95 GB, a costa de un aumento de latencia en la generacion de una historia de 2,4 s a 3,5 s con 3 hilos en wasm. Los embeddings y el resto de pesos permanecen en fp32; solo las MatMul se almacenan en 4 bits con `MatMulNBits`, tamano de bloque 32 y cuantizacion simetrica.

La relevancia de este repositorio es doble: por un lado, documenta una via practica de despliegue de NCM en entornos sin GPU dedicada mediante WebAssembly; por otro, ilustra los limites de la cuantizacion agresiva, ya que el autor senala que un build de 4 bits que tambien cuantizaba los embeddings degradaba el texto y por eso no se incluye. La licencia es MIT y el modelo base es TinyStories, un corpus de narrativa infantil sintetica, lo que acota drasticamente el dominio de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM), exportada a ONNX; detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MatMul en 4 bits (`MatMulNBits`, block size 32, simetrica); embeddings y resto de pesos en fp32 |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, narrativa infantil en ingles segun el corpus de origen) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con `onnxruntime-web` 1.23.0, backend wasm) |

## Arquitectura y entrenamiento

El modelo subyacente sigue la formulacion de Next-Concept Modeling descrita por Kumbong et al. (2026) en el paper arXiv:2610.14162, con implementacion de referencia en el repositorio HazyResearch/ncm bajo licencia MIT. La model card de este repositorio no detalla la arquitectura interna (tipo de bloque, atencion, numero de capas ni dimension del estado oculto), por lo que esos datos deben consultarse en el paper original. El checkpoint exportado a ONNX proviene de `mrfakename/ncm-webgpu-weights`, que a su vez deriva de un modelo entrenado sobre TinyStories.

El proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se documenta en la informacion disponible. Lo que si se describe con precision es el proceso de compresion aplicado en este repositorio: se toman los pesos del checkpoint original y se reemplazan unicamente las matrices de las operaciones MatMul por representaciones de 4 bits con `MatMulNBits`, manteniendo intactos embeddings, capas de normalizacion y el resto de tensores en fp32. El autor probo tambien una variante que cuantizaba los embeddings y reporta que rompia la calidad del texto, motivo por el que fue descartada.

Una consecuencia tecnica relevante es que las salidas no son identicas token a token respecto al modelo fp32: el autor indica que las muestras casi-greedy divergen tras las primeras pasadas, aunque la calidad percibida de las historias generadas se mantiene comparable. Los artefactos de entrada y salida (`meta.json`, `vocab.json`, `level0_unigram.json`) se conservan sin cambios, de modo que el codigo escrito para el modelo original funciona sin modificaciones.

## Capacidades

- Generacion de texto narrativo breve en el dominio de TinyStories (historias infantiles sencillas).
- Inferencia en navegador mediante `onnxruntime-web` con backend wasm, sin necesidad de GPU.
- Ejecucion multihilo en wasm (el benchmark del autor usa 3 hilos).
- Compatibilidad de interfaz con el checkpoint original: mismos inputs, outputs y ficheros auxiliares (`meta.json`, `vocab.json`, `level0_unigram.json`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues; el corpus de origen (TinyStories) es narrativa en ingles.
- No se documenta una longitud de contexto utilizable mas alla de la del checkpoint original, que no se especifica.

## Casos de uso

- Demostraciones educativas de NCM en el navegador: el modelo sirve para ilustrar el funcionamiento de Next-Concept Modeling dentro de una pagina web sin backend, usando `onnxruntime-web` y los ejemplos de ncmlab.vercel.app.
- Prototipado de interfaces de generacion de texto en cliente: permite validar UX de escritura asistida o generacion de cuentos en el propio navegador, con un pico de memoria de unos 0,95 GB en Chrome, aceptable en equipos de escritorio modernos.
- Pruebas de cuantizacion de 4 bits sobre transformers pequenos: el repositorio documenta el efecto de `MatMulNBits` con block size 32 sobre calidad y latencia, util como referencia para experimentos de compresion propios.
- Benchmarking de `onnxruntime-web` en wasm: la comparativa de 2,4 s frente a 3,5 s por historia con 3 hilos proporciona una linea base para medir el impacto de la cuantizacion en latencia.
- Generacion de cuentos infantiles sinteticos para pruebas de pipelines de datos: dado el dominio TinyStories, puede emplearse para producir texto de relleno controlado en tests de sistemas de NLP.
- Validacion de portabilidad ONNX: sirve para comprobar que un grafo con operadores `com.microsoft` se carga correctamente en runtimes con contrib ops habilitados, y para detectar incompatibilidades en runtimes estandar.

## Benchmarks y rendimiento

La model card incluye unicamente metricas de tamano, memoria y latencia comparando el checkpoint original con el build de 4 bits. No se publican resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Original | tinystories-q4 |
|---|---|---|
| Tamano de descarga | 573 MB | 258 MB |
| Pico de memoria en Chrome (wasm) | aprox. 1,8 GB | aprox. 0,95 GB |
| Una historia, wasm, 3 hilos | 2,4 s | 3,5 s |

## Requisitos de hardware

- Inferencia en CPU via WebAssembly: no requiere GPU; el pico de memoria medido en Chrome es de aproximadamente 0,95 GB para el build de 4 bits.
- Cabe en cualquier equipo de escritorio con navegador moderno y al menos 1 GB de memoria disponible para la pestana; no se han publicado pruebas en moviles.
- Despliegue mediante `onnxruntime-web` 1.23.0 (backend wasm). El operador `MatMulNBits` pertenece al espacio `com.microsoft`, por lo que runtimes ONNX sin contrib ops no pueden cargar el grafo.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato y los operadores empleados estan orientados a ONNX Runtime.
- Latencia de referencia: 3,5 s por historia con 3 hilos en wasm. No se publican datos de throughput ni de latencia en otros backends (webgpu, webnn).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yrangana/ncm-lab-models (tinystories-q4) | no disponible | no disponible | ONNX (4 bits en MatMul) | MIT | Build de 258 MB, 0,95 GB de pico en Chrome, 3,5 s por historia |
| mrfakename/ncm-webgpu-weights (original) | no disponible | no disponible | ONNX fp32 | MIT | 573 MB, 1,8 GB de pico, 2,4 s por historia; misma interfaz |
| Otros modelos TinyStories | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre alternativas de la misma categoria (NCM u otros modelos TinyStories) con la que establecer una comparacion cuantitativa mas alla del propio checkpoint original.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo deriva de TinyStories y esta pensado para narrativa infantil simple; no es adecuado para tareas generales de razonamiento, codigo o matematicas.
- Salidas no identicas al modelo fp32: las muestras casi-greedy divergen tras las primeras pasadas, lo que invalida comparaciones token a token y puede afectar a evaluaciones reproducibles.
- La cuantizacion de embeddings degrada la calidad del texto, segun prueba el propio autor; no debe reintentarse sin validacion especifica.
- Dependencia de operadores `com.microsoft`: `MatMulNBits` no esta disponible en runtimes ONNX estandar sin contrib ops, lo que limita la portabilidad fuera de ONNX Runtime.
- Idiomas soportados no documentados; el corpus de origen es en ingles, por lo que el rendimiento en castellano es incierto y presumiblemente deficiente.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad; al tratarse de un artefacto de demostracion, no hay garantias para uso en produccion.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion sobre el entrenamiento original y la naturaleza experimental del modelo desaconsejan su despliegue en entornos con requisitos de calidad o cumplimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yrangana/ncm-lab-models
- Modelo base (checkpoint original): https://huggingface.co/mrfakename/ncm-webgpu-weights
- Demos en navegador: https://ncmlab.vercel.app
- Codigo del proyecto ncm-lab: https://github.com/yrangana/ncm-lab
- Paper de Next-Concept Modeling: https://arxiv.org/abs/2610.14162
- Implementacion de referencia: https://github.com/HazyResearch/ncm
- Web personal del autor: https://yasirurangana.com
