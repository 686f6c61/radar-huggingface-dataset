# vatsal-roy-29/LFM3-1.7B-Q2_K-no-imatrix-BROKEN

## Resumen

LFM3-1.7B-Q2_K-no-imatrix-BROKEN es una cuantización GGUF del modelo LiquidAI/LFM3-1.7B publicada por el usuario vatsal-roy-29. No se trata de un modelo pensado para uso real: el propio autor lo etiqueta como `test-fixture` y `do-not-use`, y advierte explícitamente en la model card que está "deliberadamente roto". La razón es que se generó con llama.cpp b12128 aplicando cuantización Q2_K sin importance matrix (imatrix), un paso que en modelos pequeños degrada severamente las capacidades funcionales.

El modelo base, LFM3-1.7B, es un transformer de 1.728.801.600 parámetros desarrollado por Liquid AI bajo licencia LFM Open License v1.0. Esta cuantización concreta ocupa 0,8 GB en el repositorio y conserva la etiqueta conversacional del modelo original, pero su rendimiento es prácticamente inutilizable: resuelve 1 de 164 problemas de HumanEval+ frente a los 118 del modelo en BF16, y falla el 40 % de las llamadas a herramientas.

Su relevancia es metodológica, no práctica. El autor lo publica como ejemplo negativo del proyecto quant-gate, una puerta de aceptación funcional para ficheros GGUF que verifica que una cuantización mantiene las capacidades del modelo original. El mismo modelo cuantizado con imatrix resuelve entre 51 y 55 de 164 problemas de HumanEval+, lo que ilustra la magnitud del daño que provoca omitir la importance matrix en cuantizaciones agresivas de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K sin importance matrix (llama.cpp b12128) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-1.7B en la informacion proporcionada: no se detalla si emplea attention lineal, atencion completa o alguna variante hibrida, ni los datos de entrenamiento, numero de tokens, composicion del dataset o si hubo RLHF/DPO. El unico dato estructural confirmado es el recuento de parametros (1.728.801.600) a partir de los safetensors del modelo base.

La innovacion tecnica relevante de esta publicacion no esta en el modelo sino en el proceso de cuantizacion. El autor aplico Q2_K con llama.cpp b12128 sin importance matrix, lo que produce una perdida funcional severa. El experimento controlado documentado en el repositorio quant-gate compara esta version con la misma cuantizacion usando imatrix: la primera resuelve 1/164 problemas de HumanEval+, la segunda entre 51 y 55/164, frente a 118/164 del modelo en BF16. Ademas, esta version falla el 40 % de las llamadas a herramientas.

## Capacidades

- Generacion de texto conversacional: hereda la etiqueta `conversational` del modelo base, aunque la cuantizacion degrada la calidad de forma sustancial.
- Generacion de codigo: tecnicamente posible, pero con rendimiento casi nulo (1/164 en HumanEval+).
- Tool calling / function calling: presente en el modelo base, pero esta cuantizacion falla aproximadamente el 40 % de las llamadas.
- Multilingue: no disponible en la informacion proporcionada.
- Razonamiento multi-step y agentes: no disponible; el fallo en tool calling lo desaconseja por completo.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prueba de integracion de quant-gate: usar este fichero GGUF como caso de fallo conocido para verificar que la puerta de aceptacion detecta cuantizaciones degradadas antes de desplegarlas.
- Validacion de pipelines de cuantizacion: comprobar que un pipeline que genera GGUF sin imatrix produce resultados que superan los umbrales minimos de HumanEval+ y de exito en tool calling.
- Docencia y formacion: demostrar de forma reproducible el impacto de la importance matrix en cuantizaciones de 2 bits sobre modelos pequenos.
- Pruebas de regresion de herramientas de evaluacion: servir como entrada controlada para validar que un arnes de benchmarks (HumanEval+, evaluacion de tool calls) reporta los valores esperados.
- Verificacion de deteccion de metadatos: comprobar que sistemas de catalogacion leen correctamente las etiquetas `test-fixture` y `do-not-use` y bloquean el despliegue.
- Comparativa de metodos de cuantizacion: usar el par de ficheros (con y sin imatrix) para medir la diferencia funcional en un mismo modelo y presupuesto de bits.

## Benchmarks y rendimiento

| Benchmark | Esta cuantizacion (Q2_K sin imatrix) | Misma cuantizacion con imatrix | Modelo base BF16 |
|---|---|---|---|
| HumanEval+ (resueltos / 164) | 1 | 51-55 | 118 |
| Tool calls (tasa de fallo) | 40 % | no disponible | no disponible |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,2 GB con Q2_K, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3050, RTX 4060, GTX 1660, etc.) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (version b12128 o posterior), Ollama y otros runtimes compatibles con GGUF. No se recomienda vLLM ni TGI para este fichero concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un fichero roto, medir su rendimiento carece de interes practico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-1.7B-Q2_K-no-imatrix-BROKEN | 1,73 B | no disponible | 1/164 | LFM Open License v1.0 | Roto, solo como fixture |
| LFM3-1.7B Q2_K con imatrix | 1,73 B | no disponible | 51-55/164 | LFM Open License v1.0 | Funcional (referencia del autor) |
| LFM3-1.7B BF16 | 1,73 B | no disponible | 118/164 | LFM Open License v1.0 | Modelo base de referencia |

No se dispone de informacion sobre otros modelos comparables de 1,7 B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente roto: el autor lo etiqueta como `do-not-use`; no debe desplegarse en produccion ni usarse para tareas reales.
- Rendimiento en codigo practicamente nulo: 1/164 en HumanEval+, frente a 118/164 del BF16.
- Tool calling no fiable: falla el 40 % de las llamadas, lo que rompe cualquier agente o pipeline que dependa de funciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el modelo base, podria arrastrar sus sesgos, pero no hay datos.
- Riesgo de alucinacion: elevado por la degradacion de la cuantizacion, aunque no se han publicado mediciones especificas.
- Restricciones de licencia: LFM Open License v1.0; conviene revisar sus terminos para uso comercial, aunque en este caso el uso practico esta descartado por el propio autor.
- Caveat de produccion: cualquier pipeline que acepte GGUF sin verificacion funcional puede desplegar ficheros como este; se recomienda incorporar una puerta de aceptacion tipo quant-gate.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vatsal-roy-29/LFM3-1.7B-Q2_K-no-imatrix-BROKEN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Proyecto quant-gate: https://github.com/VatsalRoy/quant-gate
