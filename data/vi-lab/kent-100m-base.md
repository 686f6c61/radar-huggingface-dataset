# Vi-LAB/KenT-100M-Base

## Resumen

KenT-100M-Base es un modelo de lenguaje recurrente de la familia de modelos de espacio de estados (SSM), desarrollado por Vi-LAB. A diferencia de los transformers convencionales, no apila capas: se trata de una unica celda recurrente en la que la profundidad proviene de una cadena de bloques de transformacion aplicados en secuencia dentro de la propia celda. El modelo concentra su capacidad en el nucleo de transformacion de caracteristicas, procesadas en el espacio de coeficientes coseno (DCT) mediante un operador fijo no aprendido, intercalado con bloques no lineales con activacion SwiGLU.

La memoria temporal se implementa como una media acumulativa simple sobre todos los pasos temporales, sin parametros dedicados ni mecanismo implicito de olvido, lo que da un estado de decodificacion de tamano constante independiente de la longitud del contexto. Esto lo hace especialmente interesante para procesamiento de documentos largos con coste lineal y para tecnicas de carga de prefijo en paralelo por fragmentos (chunked prefix loading), ya que la acumulacion es asociativa y permite dividir un documento en trozos, procesarlos concurrentemente y fusionar los estados con el mismo resultado que el procesamiento secuencial.

Con 100M de parametros, pesos en FP16, licencia Apache 2.0 e idiomas vietnamita e ingles, es un modelo de investigacion de escala pequena orientado a validar las hipotesis de diseno del autor (un solo estado recurrente, profundidad interna en lugar de apilamiento, base frecuencial fija). La model card advierte explicitamente de que estas hipotesis requieren verificacion experimental y no constituyen garantias de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente (state-space model) de una sola celda con cadena interna de bloques de transformacion; procesamiento en espacio DCT con operador fijo y bloques no lineales SwiGLU |
| Parametros totales | 100M (segun el nombre del modelo; no se detalla el desglose en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el estado recurrente es de tamano constante, pero no se especifica una ventana maxima en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP16; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | Vietnamita (vi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16), con codigo propio que requiere `trust_remote_code` |

## Arquitectura y entrenamiento

KenT no replica una celda en multiples capas: es una unica celda recurrente cuya profundidad emerge de una secuencia interna de bloques de transformacion. El modelo mantiene dos flujos separados que solo se comunican mediante proyecciones aprendidas: un flujo de representacion que transporta informacion del token actual y un flujo de memoria que agrega el historial. Las caracteristicas se procesan en el espacio de coeficientes coseno mediante un operador fijo no aprendido, intercalado con bloques no lineales SwiGLU; la parte fija aporta estructura incorporada y la parte aprendida se dedica exclusivamente a transformar caracteristicas.

La memoria se resume mediante una media acumulativa uniforme sobre todos los pasos temporales vistos, sin parametros dedicados y sin olvido implicito aprendido. Esto produce un estado de decodificacion de tamano constante, independiente de la longitud de contexto, y habilita el procesamiento paralelo por fragmentos: al ser la acumulacion asociativa, un documento largo puede dividirse en trozos procesados concurrentemente y fusionarse despues con el mismo resultado que el procesamiento secuencial. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor presenta los principios de diseno como hipotesis a verificar experimentalmente.

## Capacidades

- Generacion de texto autoregresiva con estado recurrente de tamano constante (`cache_params`).
- Procesamiento de documentos largos con coste lineal en la longitud de secuencia.
- Carga de prefijo en paralelo por fragmentos (`chunked=True`, `prefill` con `chunk_size` y `max_parallel_chunks`), util para prellenar documentos largos en lote.
- Reutilizacion de prefijos mediante `cache.clone()` para generar multiples ramas distintas sin recargar el contexto.
- Generacion en streaming token a token mediante la funcion `stream` del script `infer.py`.
- Soporte de vietnamita e ingles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo thinking ni razonamiento multi-paso explicito.

## Casos de uso

- Procesamiento de documentos largos en streaming: gracias al estado recurrente de tamano constante y al coste lineal, el modelo puede consumir documentos extensos sin que el uso de memoria crezca con la longitud, adecuado para resumenes o continuaciones de textos largos en entornos con recursos limitados.
- Prellenado paralelo de corpus en lote: la funcion `prefill` con `chunked=True` permite dividir cada documento en fragmentos de 1024 tokens (configurable) y procesarlos concurrentemente (hasta `max_parallel_chunks`), acelerando la indexacion o el analisis de grandes colecciones de texto.
- Generacion de multiples ramas desde un mismo prefijo: con `cache.clone()` se puede cargar una vez un contexto comun y generar varias continuaciones alternativas, util para exploracion de variantes de texto o generacion de candidatos en tareas de evaluacion.
- Prototipado e investigacion en arquitecturas SSM: al ser un modelo de 100M con codigo propio y licencia Apache 2.0, sirve como banco de pruebas para estudiar memoria acumulativa, operadores frecuenciales fijos y paralelizacion por fragmentos.
- Generacion de texto en vietnamita e ingles para experimentos academicos: el soporte bilingue declarado permite evaluar el comportamiento del modelo en ambos idiomas en tareas de continuacion de texto.
- Despliegue en hardware modesto: con 100M de parametros en FP16, el modelo cabe en GPU de consumo y permite experimentar con inferencia recurrente sin infraestructura dedicada, siempre que se valide su calidad antes de usos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 de un modelo de 100M ocupan aproximadamente 200 MB; el estado recurrente es de tamano constante, por lo que el consumo adicional no crece con la longitud de contexto (la cifra exacta del estado no se detalla en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con soporte de FP16 y suficiente memoria para los pesos y el estado; el modelo esta pensado para ejecutarse en CUDA segun el ejemplo de la model card (`.to("cuda")`).
- Cabe en GPU de consumo: si, por el reducido tamano de pesos; no se especifican modelos concretos ni requisitos minimos en la informacion disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el script `infer.py` incluido en el repositorio (soporta prellenado por fragmentos y streaming). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma familia SSM ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion: el autor recomienda explicitamente evaluarlo antes de usarlo en tareas del mundo real.
- Los principios de diseno (una sola celda, profundidad interna, base frecuencial fija, memoria por media acumulativa) se presentan como hipotesis a verificar experimentalmente, no como garantias de rendimiento.
- La memoria es una media acumulativa uniforme sobre todos los pasos temporales: el modelo no aprende a olvidar ni a seleccionar informacion, lo que puede diluir senales relevantes en contextos muy largos.
- No se documentan mecanismos de alineacion (RLHF, DPO) ni evaluaciones de sesgo; se desconoce el comportamiento en cuanto a sesgos y alucinaciones.
- Idiomas limitados a vietnamita e ingles; no se declara soporte de castellano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene revisarlo antes de desplegarlo.
- El tokenizer y los pesos deben coincidir con `vocab_size` en `config.json`; una discrepancia provoca fallos.
- No se documentan variantes cuantizadas ni soporte en runtimes de inferencia estandar distintos de `transformers`.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Vi-LAB/KenT-100M-Base
