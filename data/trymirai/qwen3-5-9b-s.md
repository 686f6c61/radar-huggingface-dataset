# trymirai/Qwen3.5-9B-S

## Resumen

Mirai's Qwen3.5-9B Small Quantization (identificador `trymirai/Qwen3.5-9B-S`) es una cuantizacion de alta calidad del modelo base Qwen/Qwen3.5-9B, desarrollada por Mirai Labs y publicada bajo licencia Apache 2.0. Su objetivo es reducir drasticamente el peso del modelo para permitir inferencia local eficiente en Apple silicon, manteniendo una fidelidad alta respecto al modelo original. El checkpoint resultante ocupa aproximadamente 2.780 millones de parametros almacenados en safetensors, frente a los 9.000 millones del modelo de referencia, lo que supone una compresion en torno a 2,5 bits por peso.

La tecnica empleada combina cuantizacion con codigos de trellis al estilo QTIP, rotaciones aleatorias con estructura de Kronecker para mitigar valores atipicos y un redondeo ponderado por un esbozo de Fisher de la distribucion de salida del propio modelo. El proceso se completa con destilacion consciente de la cuantizacion de las escalas. Segun la model card, el checkpoint alcanza una divergencia KL de 0,0818819 y un acuerdo top-1 del 90,54 % frente al profesor en el conjunto de evaluacion romakl (20 conversaciones y 14.399 tokens de continuacion).

Es relevante ahora porque demuestra que es posible llevar un modelo de 9B a un tamano manejable para equipos de consumo con perdida de calidad medida y acotada, algo clave para el despliegue local en macOS. La contrapartida es que la libreria de inferencia (`uzu`) solo soporta actualmente Apple silicon, lo que limita su uso a ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 2.784.809.233 (pesos cuantizados almacenados); modelo base de 9B |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Aproximadamente 2,5 bits por peso; QTIP-style trellis-coded quantization; bits por matriz elegidos mediante ablaciones de KL medidas; tags indican 2-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del transformer Qwen3.5-9B. La arquitectura subyacente corresponde a la del modelo base, cuyos detalles completos no se recogen en la informacion disponible; esta ficha se centra en el proceso de cuantizacion. El metodo aplica cuantizacion con codigos de trellis al estilo QTIP a aproximadamente 2,5 bits por peso, con el numero de bits de cada matriz seleccionado a partir de ablaciones de divergencia KL medidas empiricamente, en lugar de un esquema uniforme.

Para reducir el impacto de los valores atipicos en los pesos se emplean rotaciones aleatorias con estructura de Kronecker. El redondeo se pondera mediante un esbozo de Fisher de la distribucion de salida del propio modelo, de modo que los errores se concentran donde menos afectan a la prediccion. Tras la cuantizacion post-entrenamiento se realiza una destilacion consciente de la cuantizacion de las escalas. La evaluacion se hizo con la herramienta romakl sobre 20 conversaciones y 14.399 tokens de continuacion generados por el profesor, obteniendo KL 0,0818819 y acuerdo top-1 del 90,54 %. Los pesos de vision, MTP y speculator se excluyen del computo de tamano.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B, incluyendo generacion de lenguaje natural.
- Razonamiento y matematicas: disponibles segun las capacidades del modelo base (no se detallan en la informacion proporcionada).
- Generacion de codigo: disponible segun el modelo base (no se detalla en la informacion proporcionada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): la model card menciona que existen pesos de vision y MTP en el modelo base, pero se excluyen del checkpoint cuantizado; no se confirma que esten operativos en esta version.
- Inferencia local en Apple silicon: capacidad destacada del checkpoint, orientada a ejecucion en equipos macOS.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint de aproximadamente 2,78B de pesos permite ejecutar un modelo derivado de 9B en equipos Apple silicon donde el modelo completo no cabria con comodidad. Se usaria mediante la CLI `mirai` o la libreria `uzu`.
- Prototipado rapido de aplicaciones de texto en macOS: desarrolladores que quieran iterar sobre prompts y flujos conversacionales sin depender de APIs en la nube pueden desplegar el modelo localmente y medir latencia real en su hardware.
- Asistentes de escritorio offline: al ejecutarse en local, encaja en herramientas de productividad que requieren privacidad y no pueden enviar datos a servidores externos.
- Evaluacion de tecnicas de cuantizacion: investigadores que estudien el compromiso entre tamano y calidad (KL, acuerdo top-1) pueden usar este checkpoint como referencia reproducible frente a otras cuantizaciones del mismo modelo base.
- Generacion de texto por lotes en estaciones de trabajo Apple: para tareas de resumen, reescritura o clasificacion de documentos donde el throughput no sea critico y se prefiera coste cero de API.
- Base para experimentos de destilacion y ajuste fino ligero: al ser un checkpoint compacto con licencia Apache 2.0, sirve como punto de partida para adaptaciones sobre datos propios en entornos con recursos acotados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL (romakl) | 0,0818819 |
| Acuerdo top-1 con el profesor | 90,54 % |
| Conjunto de evaluacion | 20 conversaciones, 14.399 tokens de continuacion generados por el profesor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores miden fidelidad respecto al modelo base, no capacidades absolutas.

## Requisitos de hardware

- VRAM / memoria: el repo ocupa 14,8 GB, aunque el checkpoint de pesos cuantizados es de aproximadamente 2,78B de parametros a ~2,5 bits; el requisito real de memoria en ejecucion no se detalla en la informacion proporcionada.
- GPU recomendadas: la model card indica que actualmente solo se soporta inferencia en Apple silicon; no se listan GPU NVIDIA o AMD compatibles.
- Cabe en consumer GPU: no confirmado para GPU de consumo; el soporte documentado es exclusivamente para Apple silicon (Mac con memoria unificada).
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew), libreria `uzu`, y compilacion desde fuente segun la guia del repositorio. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-S | 2,78B almacenados (base 9B) | no disponible | ~2,5 bits/peso (QTIP) | Apache 2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Completa (BF16/FP16) | Apache 2.0 | Multiples runtimes |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | segun autor | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Soporte limitado a Apple silicon: la model card afirma explicitamente que solo se soporta inferencia en Apple silicon; no hay soporte documentado para GPU NVIDIA, AMD ni CPU generica.
- Perdida de calidad por cuantizacion: el acuerdo top-1 del 90,54 % implica que aproximadamente 1 de cada 10 tokens predichos difiere del modelo base; puede degradar tareas sensibles a la precision.
- Dependencia de una libreria poco extendida: `uzu` es una libreria especifica del ecosistema Mirai, lo que reduce la portabilidad y el soporte comunitario.
- Idiomas no declarados: la model card no especifica los idiomas soportados, por lo que el comportamiento multilingue no esta garantizado.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras la cuantizacion.
- Sesgos y alucinaciones: no se documentan sesgos especificos; al ser una cuantizacion, hereda los del modelo base y puede amplificarlos por el error de cuantizacion.
- Exencion de pesos: vision, MTP y speculator se excluyen del checkpoint, por lo que las capacidades multimodales del base no estan disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card para confirmar compatibilidad.
- Madurez: 528 descargas y 0 likes en el momento de la consulta; ecosistema joven y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Herramienta romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Runtime Prism (llama.cpp fork): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
