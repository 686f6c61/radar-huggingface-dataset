# ZTFlynn/LFM2-350M-Math-Cascadia-ternary3

## Resumen

LFM2-350M-Math-Cascadia-ternary3 es un paquete de compresión extrema del modelo LiquidAI/LFM2-350M-Math, desarrollado por el usuario ZTFlynn mediante la técnica Cascadia. El objetivo es reducir el peso del modelo de 676 MB a 241 MB (factor 2,96x) manteniendo un error de reconstrucción acotado y permitiendo su ejecución en CPU con un runtime en C cuyas únicas dependencias son libc, libm y libgomp. Esta compresión emplea superficies B-spline, tablas de búsqueda por bandas y cuantización ternaria (base 3) a 0,60 bytes por peso, lo que lo hace especialmente adecuado para despliegue en entornos edge o dispositivos con recursos limitados.

El modelo base, LFM2-350M-Math, es un modelo de razonamiento matemático de 350 millones de parámetros con arquitectura híbrida (convoluciones cortas con compuerta y bloques de atención por grupos), optimizado para resolución de problemas paso a paso y despliegue en dispositivos. La versión comprimida mantiene las capacidades de generación de texto y razonamiento, aunque con un aumento medido del 13,42% en perplexity respecto al original en bf16. Es relevante porque demuestra una vía práctica para ejecutar modelos de razonamiento en hardware sin GPU, con un formato de pesos propio que no depende de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 bloques con gated short convolutions y GQA (16q/8kv) |
| Parametros totales | 350 millones (16 capas, hidden 1024) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base no se especifica en la informacion) |
| Tipos de cuantizacion | Ternaria (base 3) con spline y tablas de consulta por bandas; 0,60 bytes/peso (5,40 bits/peso) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license (enlace: https://huggingface.co/LiquidAI/LFM2-350M-Math/blob/main/LICENSE) |
| Formato de pesos | Paquete Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base LFM2-350M-Math emplea una arquitectura híbrida que combina capas de convoluciones cortas con compuerta (gated short convolutions) con un número reducido de bloques de atención por grupos (GQA). Esta combinación, descrita en el informe técnico de LFM2, busca acelerar prefill y decode hasta 2x frente a arquitecturas puramente atencionales, manteniendo un tamaño compacto para despliegue en edge.

La compresión Cascadia no modifica la arquitectura, sino que sustituye cada matriz de pesos por una representación aproximada: se ajusta una superficie B-spline a cada matriz para capturar la estructura global, se asignan los pesos a 32 bandas según su valor en la spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores más grandes se conserva exactamente en f32. Los índices del codebook se empaquetan en base 3 (cinco trits por byte, ya que 3^5 = 243). La reconstrucción se evalúa dentro del producto matriz-vector, sin construir nunca la matriz densa completa. El embedding atado (que también actúa como lm_head) usa un codebook global de 81 entradas en lugar de bandas, lo que lo convierte en el tensor mejor reconstruido del modelo (error relativo L2 de 0,0261).

## Capacidades

- Generacion de texto autoregresiva con muestreo configurable (temperatura, top-k, top-p) y generacion greedy reproducible por semilla.
- Razonamiento matematico paso a paso, heredado del modelo base LFM2-350M-Math, optimizado para problemas de matematicas.
- Ejecucion en CPU mediante runtime C (Cascadia) sin dependencias mas alla de libc, libm y libgomp.
- Soporte de formato de chat con delimitador `<|im_end|>` para detener la generacion.
- Capacidad de carga en Python mediante la libreria `cascadia` junto con transformers para integracion en pipelines existentes.
- No dispone de tool calling, vision, audio ni capacidades multimodales; es exclusivamente texto.

## Casos de uso

- Razonamiento matematico en dispositivos edge: el modelo puede resolver problemas paso a paso en hardware sin GPU, como routers, microcontroladores o sistemas embebidos, gracias a su tamano reducido (241 MB) y ejecucion en CPU pura.
- Asistente educativo offline: integracion en aplicaciones de aprendizaje que expliquen conceptos matematicos o resuelvan ejercicios sin conexion, usando el runtime C para evitar dependencias pesadas.
- Generacion de texto en entornos con restricciones de memoria: por ejemplo, contenedores con limites estrictos de RAM o CI/CD donde no se puede cargar un modelo de 676 MB en bf16.
- Prototipado rapido de agentes conversacionales: el formato de chat y la generacion determinista permiten probar flujos de dialogo en local antes de escalar a modelos mayores.
- Investigacion en compresion de modelos: sirve como caso de estudio de cuantizacion ternaria con splines y LUT, con metricas de fidelidad y perplexity documentadas.
- Inferencia en lotes en CPU: para tareas de clasificacion o extraccion de texto donde la latencia no es critica y se prioriza el uso eficiente de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta unicamente mediciones de perplexity y fidelidad de reconstruccion, comparando el paquete comprimido con el modelo base en bf16:

| Metrica | Modelo base (bf16) | Paquete ternario | Diferencia |
|---|---|---|---|
| Perplexity (FineWeb-Edu, 16.352 tokens emparejados) | 592,83 | 672,38 | +13,42% (95% CI [1,0593x, 1,2122x], t=+3,63) |
| Error relativo L2 total | 0 | 0,0551 | - |
| Error relativo L2 (lineales) | 0 | 0,0576 | - |
| Error relativo L2 (embedding) | 0 | 0,0261 | - |

La medicion se realizo sobre 31 ventanas independientes de 512 tokens, comparando token a token para reducir el error estandar. El coste medido es de 2,96x compresion a cambio de un 13,4% mas de perplexity.

## Requisitos de hardware

- Ejecucion en CPU: el runtime C de Cascadia requiere solo libc, libm y libgomp; no necesita GPU ni aceleradores.
- Memoria: el paquete pesa 241 MB en disco (weights.bin de 239 MB); la RAM necesaria para inferencia es aproximadamente el tamano del paquete mas overhead del runtime, por lo que cabe en dispositivos con 512 MB o menos.
- GPU: no necesaria; si se desea usar en GPU, habria que cargar el modelo base en bf16 (676 MB) y aplicar la compresion en CPU, pero la ejecucion esta disenada para CPU.
- Opciones de despliegue: runtime C compilado con CMake (repositorio cassie), o integracion en Python mediante la libreria `cascadia` con transformers.
- Latencia y throughput: no se proporcionan mediciones; al ser un modelo de 350M en CPU, se espera una velocidad modesta, adecuada para tareas interactivas no exigentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Perplexity (FineWeb-Edu) | Licencia |
|---|---|---|---|---|---|
| LiquidAI/LFM2-350M-Math (bf16) | 350M | no disponible | 676 MB | 592,83 | lfm-open-license |
| ZTFlynn/LFM2-350M-Math-Cascadia-ternary3 | 350M | no disponible | 241 MB (0,60 bytes/peso) | 672,38 | lfm-open-license |
| LiquidAI/LFM2-350M (base, sin fine-tuning matematico) | 350M | no disponible | 676 MB | no disponible | lfm-open-license |

La comparativa se limita al propio modelo base y su variante sin ajuste matematico, ya que no se dispone de datos de otros modelos comprimidos con la misma tecnica o tamano en la informacion proporcionada. La ventaja del paquete ternario es su reduccion de tamano y ejecucion en CPU, a costa de un aumento medible de perplexity.

## Limitaciones y advertencias

- Aumento de perplexity del 13,42% respecto al modelo base, lo que puede degradar la calidad de las respuestas en tareas de razonamiento complejo.
- Solo soporta ingles; no hay capacidad multilingue.
- El formato de pesos es propietario de Cascadia; no es un checkpoint de transformers estandar, por lo que requiere el runtime especifico o la libreria `cascadia` para cargarlo.
- La licencia lfm-open-license del modelo base puede imponer restricciones de uso comercial; debe revisarse el texto completo de la licencia antes de desplegar en produccion.
- El error de reconstruccion se concentra en el embedding atado, aunque con 81 entradas del codebook se reduce a 0,0261; aun asi, es una fuente potencial de errores en la salida.
- No se han evaluado sesgos ni riesgos de alucinacion especificos de esta version comprimida; se heredan los del modelo base.
- La generacion se detiene en `<|im_end|>`, pero si el modelo no genera ese token, la salida puede ser truncada o continuar indefinidamente; el parametro `max_new` actua como limite superior.

## Enlaces

- Modelo comprimido: https://huggingface.co/ZTFlynn/LFM2-350M-Math-Cascadia-ternary3
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M-Math
- Documentacion del modelo base: https://docs.liquid.ai/lfm/models/lfm2-350m-math
- Informe tecnico LFM2 (arXiv): https://arxiv.org/abs/2511.23404
- Repositorio del runtime Cascadia (cassie): https://github.com/EntroMorphic/cassie
- Documentacion del formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
