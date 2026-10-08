# Subject-Emu-5259/NeuralAI-Nae1

## Resumen

NeuralAI Nae1 es un modelo de lenguaje causal de tipo decoder, desarrollado por De'Andrew Preston Harris (usuario de HuggingFace Subject-Emu-5259) dentro del proyecto NeuralAI, cuya propuesta es un motor generativo local y privado que se ejecuta en el hardware del propio usuario. Se trata de un modelo pequeno entrenado desde inicializacion aleatoria (from-scratch) sobre 768 millones de tokens de FineWeb, sin destilacion ni ajuste sobre una base ajena, y publicado bajo licencia Apache 2.0.

La arquitectura sigue el patron de Llama: 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 4 cabezas KV (GQA), con RoPE y SwiGLU. La model card declara 100.111.872 parametros, mientras que los metadatos safetensors del repositorio reflejan 76.190.976; la discrepancia no se explica en la documentacion disponible. El contexto entrenado es de 2.048 tokens y la evaluacion se realizo con n_ctx=512.

Su relevancia es acotada y de caracter documental: es un ejercicio reproducible de preentrenamiento completo y de conversion a GGUF en hardware de gama baja (una T4 de Kaggle, 8.000 pasos), no un asistente utilizable. La perplexity retenida declarada es 165,92 y la propia model card advierte de que la salida esperada es "exploratoria, a menudo incoherente". El vocabulario de 439 tokens es el rasgo mas atipico del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama: RoPE, GQA, SwiGLU, 12 capas, 768 hidden, 12 cabezas, 4 cabezas KV |
| Parametros totales | 100.111.872 segun la model card; 76.190.976 segun los metadatos safetensors del repositorio (discrepancia no documentada) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens entrenado; evaluado con n_ctx=512 |
| Tipos de cuantizacion | GGUF f32 (305 MB) y GGUF Q4_K_M (45 MB, 4,80 BPW) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (f32 y Q4_K_M); se incluyen config.json y tokenizer nativo (vocabulario de 439 tokens, ByteLevel BPE) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Nae1 es un decoder causal denso con normalizacion LayerNorm con sesgo en la implementacion nativa. La atencion usa consultas agrupadas (4 cabezas KV para 12 cabezas de consulta), RoPE para la codificacion posicional y SwiGLU como activacion en el bloque feed-forward, siguiendo la receta de Llama a escala reducida. La model card documenta explicitamente una advertencia de paridad de logits: llama.cpp aplica RMSNorm sin sesgo, mientras que el modelo nativo usa LayerNorm con sesgo, de modo que la conversion omite los tensores de sesgo. La integridad tensorial se verifico con 109/109 tensores coincidentes y una diferencia maxima de 0,00e+00, pero la deriva de logits es una consecuencia del runtime, no un error de conversion.

El preentrenamiento se realizo desde inicializacion aleatoria en dos etapas: pasos 0 a 4.000 y reanudacion de 4.000 a 8.000 con decaimiento coseno completo hasta un learning rate de 1,2e-11. El corpus son 768 millones de tokens de FineWeb (CC-MAIN-2013-20), 400.000 documentos y 8 shards, troceados en ventanas de 513 tokens servidas como vistas de copia cero para no exceder la RAM. El hardware fue una unica GPU T4 de Kaggle, con checkpoints cada 250 pasos. La perdida final reportada es 24,90, con un minimo de 22,88 en el paso 7.050, partiendo de aproximadamente 25,9 al inicio de la segunda etapa. No se documento ninguna fase de ajuste por instrucciones, RLHF o DPO. Cabe senalar una inconsistencia en la documentacion: el informe de evaluacion cita un NLL medio de 5,1115 nats/token, muy alejado de la perdida de entrenamiento declarada (22,88-24,90) y por debajo del valor de referencia de un modelo uniforme sobre 439 tokens (ln(439) ≈ 6,08 nats/token); la model card no explica el criterio de calculo de la cifra de entrenamiento.

## Capacidades

- Generacion de texto base en ingles mediante completado autoregresivo; no existe plantilla de chat ni modo conversacional.
- Ningun ajuste por instrucciones: no responde a ordenes, no sigue formatos y no mantiene rol de asistente.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificacion multi-paso ni razonamiento encadenado explicito.
- Idiomas: unicamente ingles declarado; el vocabulario de 439 tokens hace que cualquier texto fuera de dominio se tokenice de forma extremadamente ineficiente.
- Capacidades matematicas, de codigo, vision o audio: no disponibles.
- Capacidad especial destacable: ninguna declarada; se comercializa como modelo de investigacion con protocolo de evaluacion reproducible y verificacion de integridad tensorial en la conversion a GGUF.

## Casos de uso

- Reproduccion de recetas de preentrenamiento from-scratch: el modelo documenta la canalizacion completa (FineWeb parquet, ventanas de 513 tokens, 8.000 pasos, checkpoints cada 250 pasos) y permite replicar o auditar el procedimiento en una unica GPU de 16 GB.
- Pruebas de integracion en CI de runtimes de inferencia: con 45 MB en Q4_K_M, el artefacto se descarga y arranca en segundos, lo que lo hace util para validar versiones de llama.cpp, llama-cpp-python o el parser de GGUF sin coste de ancho de banda ni de GPU.
- Investigacion sobre tokenizadores de vocabulario minimo: el vocabulario de 439 tokens es un caso extremo que permite medir el impacto de la granularidad del vocabulario en la perplexity y en la tasa de compresion de tokens por palabra.
- Validacion de canalizaciones de cuantizacion: la pareja f32 (305 MB) y Q4_K_M (4,80 BPW, 45 MB) permite medir la degradacion introducida por la cuantizacion con un protocolo de evaluacion publicado y un fichero de resultados JSON en el propio repositorio.
- Docencia y divulgacion sobre escalado: sirve como demostracion empirica de que el preentrenamiento puro, sin ajuste por instrucciones, no produce un asistente, y de que 100 M de parametros sobre 768 M de tokens quedan lejos de la fluidez.
- Inferencia en dispositivos sin GPU: el peso cuantizado cabe en memoria de una Raspberry Pi o de una iGPU y permite desplegar un servidor HTTP local con llama-server en 127.0.0.1:8080 para pruebas de latencia de red.
- Pruebas de carga de servidores en local: util como carga sintetica minima para verificar contenedores, limites de memoria y enrutado antes de sustituir por un modelo de produccion.
- Generacion de texto exploratoria con supervision humana en contextos artisticos o de prototipado rapido, asumiendo que la salida sera con frecuencia incoherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El unico dato de evaluacion es la perplexity retenida sobre una porcion de FineWeb de 992 documentos y 1.027.766 tokens, con n_ctx=512 y calculo token a token con alineacion exacta de filas.

| Checkpoint (Q4_K_M) | Perplexity retenida |
|---|---|
| step-2000 | 192,97 |
| step-4000 (ejecucion reanudada) | 188,89 |
| step-4000 (desde cero) | 179,17 |
| step-8000 (version publicada) | 165,92 |

Datos complementarios del informe `eval_step8000_q4_n512.json`: NLL medio de 5,1115 nats/token. Sonda fija ("The quick brown fox", 10 tokens): 150,25.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en Q4_K_M (fichero de 45 MB mas buffers de contexto); aproximadamente 305 MB de pesos en f32 mas overhead.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer, en iGPU y en CPU. No se han publicado mediciones especificas para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, en cualquiera, incluida una GTX 1050 o una iGPU integrada; tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-server`) y llama-cpp-python son las rutas documentadas por el autor. No hay soporte documentado para vLLM, TGI, Ollama ni TensorRT-LLM.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia para ningun hardware.
- Memoria de sistema: el propio autor documenta que la canalizacion de datos se diseno para no exceder la RAM disponible con 768 millones de tokens, pero no se especifica el minimo en inferencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden del conocimiento general del sector y no de la informacion proporcionada en esta busqueda, por lo que no han podido verificarse contra una fuente en esta ficha. No se dispone de resultados de benchmarks comparables.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Adecuacion como asistente |
|---|---|---|---|---|---|
| NeuralAI Nae1 | 100,1 M (model card) / 76,2 M (metadatos) | 2.048 entrenado, 512 evaluado | Apache 2.0 | en | no; solo completado base |
| GPT-2 (124 M) | 124 M | 1.024 | licencia MIT modificada | en | no; solo completado base |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | en | no; solo completado base |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | en, con datos multilingues parciales | parcial; existe version instruct |

Frente a estas alternativas, la diferencia principal de Nae1 no es el rendimiento, sino la trazabilidad del entrenamiento y de la evaluacion. Su vocabulario de 439 tokens, muy inferior a los aproximadamente 32.000-50.000 de GPT-2 o Pythia, supone una desventaja estructural en eficiencia de tokenizacion y, con toda probabilidad, en calidad final.

## Limitaciones y advertencias

- Escala insuficiente: 100 M de parametros sobre 768 M de tokens es un checkpoint de investigacion; la propia model card reconoce que el razonamiento largo, la generacion de codigo y el recuerdo factual estan limitados.
- Vocabulario de 439 tokens: cualquier texto fuera del dominio de FineWeb se tokeniza de forma muy ineficiente, lo que degrada la calidad y multiplica el coste por token generado.
- Sin ajuste por instrucciones y sin plantilla de chat: el modelo solo completa texto; no acepta ordenes ni formatos.
- Riesgo de alucinacion muy elevado: con un NLL medio de 5,1115 nats/token y una perplexity de 165,92, la salida esperada es incoherente con frecuencia. La model card lo describe como texto "exploratorio, a menudo incoherente".
- Inconsistencia documental: la perdida de entrenamiento declarada (22,88-24,90) no es coherente con el NLL de evaluacion (5,1115 nats/token); conviene tratar las cifras de convergencia con cautela.
- Deriva de logits entre la implementacion nativa y llama.cpp por la diferencia LayerNorm con sesgo / RMSNorm sin sesgo; no es un error de conversion, pero impide la paridad numerica exacta.
- Idioma: unicamente ingles declarado; no hay evaluacion en castellano ni en ningun otro idioma.
- Contexto reducido: 2.048 tokens de entrenamiento y evaluacion a 512, insuficiente para tareas de contexto largo.
- Sin acceso a internet ni capa de herramientas: cualquier necesidad de datos en vivo requiere un componente externo.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial, pero el estado del modelo hace inviable su uso en produccion con usuarios finales.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Subject-Emu-5259/NeuralAI-Nae1
- Perfil de HuggingFace del autor: https://huggingface.co/Subject-Emu-5259
- Perfil de GitHub del autor: https://github.com/Subject-Emu-5259
- LinkedIn del autor: https://www.linkedin.com/in/deandrewharris94
- Informe de evaluacion en el repositorio: `eval_step8000_q4_n512.json`
- Configuracion de arquitectura en el repositorio: `config.json`
- Tokenizer nativo en el repositorio: `tokenizer/` (vocabulario de 439 tokens, merges y manifiesto)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron entradas de diccionario sobre la palabra inglesa "subject" y no guardan relacion con NeuralAI Nae1. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales asociados al modelo.
