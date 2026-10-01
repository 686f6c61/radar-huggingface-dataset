# tawer12/qwen3-4b-recursive-sft-v3.2

## Resumen

tawer12/qwen3-4b-recursive-sft-v3.2 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B-Base, publicado por el usuario tawer12, orientado especificamente a razonamiento matematico con un protocolo recursivo explicito. No es un asistente conversacional de proposito general: se trata de un checkpoint de investigacion que aprende a emitir una de tres acciones por generacion (`SOLVE_DIRECTLY`, `DECOMPOSE` o `AGGREGATE`) y a delegar en un motor externo la ejecucion del arbol de resolucion. El modelo tiene 4.021.805.056 parametros (aproximadamente 4.000 millones) y se distribuye en formato safetensors en BF16.

El entrenamiento parte del modelo base, no del Qwen3-4B ya post-entrenado ni del checkpoint V3.1 del propio autor, y anade tokens especiales de protocolo recursivo. El corpus combina 4.707 ejemplos de descomposicion, 4.707 de resolucion directa (530 raiz y 4.177 hijos) y 4.712 de agregacion, sumando 14.126 llamadas de componente sobre 5.241 problemas fuente unicos, con seis epocas y 660 actualizaciones del optimizador.

Su relevancia es acotada pero clara: sirve como banco de pruebas reproducible para investigar decodificacion estructurada, arboles de razonamiento y control de llamadas en modelos pequenos que caben en una GPU de consumo. La model card advierte explicitamente de que no se aportan nuevas cifras de precision en benchmarks y de que la validez de formato no implica correccion matematica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con tokens especiales de protocolo recursivo anadidos |
| Parametros totales | 4.021.805.056 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card. El entrenamiento uso secuencias de hasta 2.048 tokens; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales. Pesos publicados en BF16; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2 shards), BF16, mas ficheros de tokenizer y configuracion. Tamano de descarga aproximado de 8,06 GB |
| Modelo base | Qwen/Qwen3-4B-Base |
| Objetivo de entrenamiento | Causal language modeling solo sobre tokens de salida |
| Longitud maxima de secuencia en entrenamiento | 2.048 tokens |
| Precision de entrenamiento | BF16 |
| Fecha de publicacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen3, sin mezcla de expertos ni componentes de estado recurrente. La innovacion no esta en el bloque del transformer, sino en el protocolo: el modelo fue entrenado desde Qwen3-4B-Base con tokens especiales adicionales que representan acciones de un motor recursivo. En inferencia, cada generacion devuelve una sola accion en lugar de una solucion completa. `DECOMPOSE` propone al menos dos caminos hijos para que los ejecute el motor, `SOLVE_DIRECTLY` resuelve el subproblema entregado y `AGGREGATE` combina las respuestas de los hijos cuando el motor solicita agregacion.

Los datos de entrenamiento son llamadas de componente independientes, no necesariamente arboles completos tras el submuestreo. V3.2 reduce unicamente los ejemplos de resolucion directa del corpus ampliado de V3.1, conservando intactos los de descomposicion y agregacion. La configuracion reportada incluye: 14.126 ejemplos de componente en total, 5.241 problemas fuente unicos, 6 epocas configuradas, 660 actualizaciones del optimizador, batch global de 128 llamadas de componente (no 128 problemas fuente), 8 GPU con batch por dispositivo 1 y acumulacion 16, learning rate 1e-5, weight decay 0.01, warmup del 10 por ciento con scheduler coseno y semilla 1. No se aplico reparacion sintactica: 387 objetivos conservan defectos conocidos bajo el requisito estricto de `Final answer:`. El autor indica que las seis epocas de V3.2 aproximan la exposicion total de ejemplos del run V3.1 de cuatro epocas, pero no es un experimento con coincidencia exacta de tokens ni de actualizaciones.

El repositorio incluye utilidades de inferencia: `recursive_engine.py` (motor de linea base sin restricciones), `prompts/recursive_sft_prefix_prompt.txt` (plantilla de prefijo) y `release_manifest.json` (tamanos y checksums SHA256). No se publican estados del optimizador, argumentos de entrenamiento serializados, checkpoints intermedios, ejemplos de entrenamiento ni rollouts de evaluacion.

## Capacidades

- Generacion de texto autoregresiva estandar sobre el modelo base Qwen3-4B.
- Razonamiento matematico de tipo GSM8K: problemas aritmeticos y de enunciado corto en ingles.
- Emision de acciones estructuradas de un protocolo recursivo: `SOLVE_DIRECTLY`, `DECOMPOSE` y `AGGREGATE`.
- Descomposicion de un problema en al menos dos subproblemas hijos ejecutables por un motor externo.
- Agregacion de resumenes de respuestas hijas en una respuesta final.
- Ejecucion completa de un arbol de resolucion mediante el motor incluido, con limites configurables de profundidad y de numero de llamadas.
- Control de decodificacion determinista: el ejemplo documentado usa `temperature=0.0` y `top_p=1.0`.
- Integracion con decodificacion restringida por gramatica como soporte externo (no como garantia intrinseca del checkpoint).
- No soporta tool calling generico, function calling, vision, audio ni modo de pensamiento explicito mas alla del protocolo recursivo.
- Capacidades multilingues: limitadas al ingles segun los metadatos y el corpus de entrenamiento.

## Casos de uso

- Investigacion en razonamiento recursivo: sirve como sujeto de prueba para comparar estrategias de descomposicion, agregacion y control del arbol frente a variantes JSON, aplanadas o ajustadas con RL del mismo autor.
- Motor de resolucion de problemas matematicos con arboles acotados: con `max_depth=3` y `max_calls=10` se puede ejecutar un arbol completo sobre problemas de aritmetica de enunciado corto, util para validar heuristicas de busqueda sin quemar presupuesto de computo.
- Generacion de trazas de entrenamiento: las trazas completas que produce el motor (`full_trace`) permiten extraer pares de descomposicion y agregacion para aumentar corpus de destilacion en modelos mayores.
- Evaluacion de decodificacion estructurada: al depender de tokens de protocolo, es un banco de pruebas natural para medir el impacto de gramaticas, reparacion sintactica y validadores de formato en la tasa de arboles validos.
- Sistemas de tutoria matematica paso a paso: la accion `DECOMPOSE` expone subproblemas intermedios, lo que permite construir interfaces que muestran al estudiante la descomposicion antes de la respuesta final.
- Pruebas de robustez de protocolos: los 387 objetivos con defectos conocidos y la distincion entre validez de formato y correccion de respuesta permiten disenar experimentos de sensibilidad a errores de formato en llamadas hijas.
- Benchmarking de motores de inferencia en GPU de consumo: con 4.000 millones de parametros en BF16 cabe en tarjetas de 12 a 24 GB, lo que lo hace util para validar motores recursivos en hardware asequible antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta version no realiza nuevas afirmaciones de precision en benchmarks y que el extractor de respuestas del helper historico no constituye un grader autoritativo; para comparaciones debe usarse el protocolo de evaluacion estandar con calificacion explicita de la respuesta raiz.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 8 GB solo para los pesos, mas memoria para KV cache y activaciones; con 2.048 tokens de secuencia el consumo adicional es moderado.
- VRAM estimada en INT8: aproximadamente 4-5 GB de pesos.
- VRAM estimada en INT4: aproximadamente 2,5-3 GB de pesos, aunque no hay cuantizaciones oficiales publicadas.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S; sobradas para BF16 y para servir varias peticiones concurrentes.
- GPU de consumo: cabe en BF16 en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti Super (16 GB). En tarjetas de 12 GB como RTX 3060 12 GB o RTX 4070 es viable con secuencias cortas y batch 1.
- El entrenamiento reportado uso 8 GPU con batch por dispositivo 1 y acumulacion 16.
- Opciones de despliegue: la libreria declarada es transformers (el ejemplo fija `transformers==4.51.1` con `torch` y `accelerate`), y el repositorio esta marcado como compatible con text-generation-inference y endpoints. No hay integracion oficial documentada con llama.cpp, Ollama ni vLLM, y al no publicarse GGUF su uso en esas herramientas requeriria conversion propia.
- Latencia y throughput: no disponibles. El motor incluido ejecuta los hijos de forma secuencial, por lo que los recuentos de tokens de la ruta critica no se traducen en aceleraciones de reloj de pared.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tawer12/qwen3-4b-recursive-sft-v3.2 | 4,02 B | Entrenado a 2.048 tokens; base con 32.768 nativos | SFT sobre Qwen3-4B-Base con protocolo recursivo y tokens especiales | apache-2.0 | HuggingFace, safetensors BF16, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-4B-Base | 4,0 B | 32.768 nativos, 131.072 con YaRN | Modelo base denso sin post-entrenamiento | apache-2.0 | HuggingFace, ampliamente utilizado como punto de partida |
| Qwen/Qwen3-4B | 4,0 B | 32.768 nativos, 131.072 con YaRN | Modelo post-entrenado para chat e instrucciones, con modos de razonamiento | apache-2.0 | HuggingFace, lanzamiento oficial de la familia Qwen3 |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | No disponible en esta ficha | Destilado de razonamiento sobre base Qwen | licencia propia de DeepSeek | HuggingFace, con cifras publicas de benchmarks matematicos |

La diferencia principal frente a Qwen3-4B y Qwen3-4B-Base no es de tamano ni de contexto, sino de interfaz: V3.2 no responde a conversaciones con plantilla de chat de Qwen, sino a cadenas de prompt recursivo sin formato de chat y devuelve una unica accion por generacion. Frente a destilados de razonamiento de la familia DeepSeek, V3.2 no publica cifras de precision, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- No es un asistente conversacional: los prompts deben ser cadenas de prompt recursivo en crudo, no conversaciones con la plantilla de chat de Qwen. Usar la plantilla de chat degrada el comportamiento esperado.
- Es imprescindible conservar los tokens especiales del protocolo al decodificar (`skip_special_tokens=False`); de lo contrario la salida no es parseable por el motor.
- Validez de formato y correccion de la respuesta son cosas distintas: una llamada hija malformada puede invalidar todo el arbol, y respuestas hijas bien formadas pueden ser matematicamente incorrectas.
- Los caminos de descomposicion pueden ser dependientes entre si o estar infraespecificados.
- La agregacion recibe resumenes de las respuestas hijas, no su razonamiento completo, lo que limita la fidelidad de la combinacion final.
- Se conocen 387 objetivos con defectos de formato no reparados bajo el requisito estricto de `Final answer:`.
- El corpus contiene llamadas de componente independientes, no necesariamente arboles completos tras el submuestreo.
- El motor incluido ejecuta los hijos de forma secuencial; no se han medido aceleraciones por paralelismo.
- Las restricciones por gramatica son soporte externo de decodificacion, no una garantia intrinseca del checkpoint.
- Idioma: solo ingles, segun los metadatos y el corpus (GSM8K). El rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la model card; el modelo no incluye verificacion factual ni acceso a herramientas.
- Uso comercial: la licencia heredada es apache-2.0, pero al ser un modelo de investigacion sin cifras de rendimiento publicadas, no se recomienda su despliegue en produccion sin evaluacion propia.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, y una unica publicacion del autor, lo que limita la validacion independiente.
- El repo no contiene estados del optimizador, argumentos de entrenamiento ni rollouts, por lo que no es reproducible a nivel de entrenamiento con lo publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tawer12/qwen3-4b-recursive-sft-v3.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento citado: https://huggingface.co/datasets/openai/gsm8k
- Repositorio del motor recursivo constrenido con GRPO y evaluacion: https://github.com/0315jaewon/math-recursive
- Ficheros auxiliares incluidos en el repositorio: `recursive_engine.py`, `prompts/recursive_sft_prefix_prompt.txt`, `release_manifest.json`, `LICENSE`

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos corresponden a un restaurante de Rouen (L'Espiguette) y no guardan relacion con el modelo ni con su autor, por lo que se descartan.
