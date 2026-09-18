# toonist/AnuLM-Smoke-30B

## Resumen

AnuLM-Smoke-30B es un checkpoint de prueba de 17,44 millones de parametros publicado por el usuario toonist dentro del proyecto AnuLM, una reimplementacion independiente de la arquitectura MoE de Sarvam 30B a escala reducida. A pesar del sufijo "30B" del nombre, no es un modelo de 30.000 millones de parametros: corresponde al preset `nano_30b`, que reproduce la forma de Sarvam 30B a 1/1000 de tamano. El propio autor lo declara explicitamente como no usable: se entreno durante 200 pasos sobre 1,12 MB de tinyshakespeare (3 documentos) en 29 segundos sobre una RTX 5070 Ti.

La finalidad del checkpoint es validar la cadena completa de publicacion (entrenamiento, muestreo, exportacion, subida, descarga, carga y generacion) despues de que el proyecto se renombrara de *nanosarvam* a AnuLM y cambiara el identificador de formato del tokenizer. La arquitectura es un decoder transformer con atencion GQA de 6 cabezas de consulta y 2 de clave-valor, 8 capas, 16 expertos enrutados con top-2 mas un experto compartido en 7 capas MoE, capa 0 densa, RoPE con theta 1.000.000, QK-norm y router sigmoide con balanceo de sesgo sin perdida auxiliar. Usa vocabulario a nivel de byte (256 bytes mas BOS/EOS/PAD, 259 en total) y una ventana de contexto de 256 tokens, por lo que no incluye fichero de tokenizer.

Su relevancia es instrumental, no funcional: sirve como fixture de integracion continua y como referencia didactica de la dinamica de balanceo de expertos. La curva de desequilibrio registrada (4,68x inicial, pico de 7,97x en el paso 20 y 1,80x al final) documenta que el desbalance sube antes de bajar con `bias_update_rate=1e-3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mixture-of-experts (MoE). GQA con 6 cabezas de consulta y 2 de clave-valor, 8 capas, capa 0 densa, 7 capas MoE con 16 expertos enrutados top-2 mas 1 experto compartido. RoPE theta 1.000.000, QK-norm, router sigmoide con balanceo de sesgo sin perdida auxiliar |
| Parametros totales | 17.440.608 (17,44 M, dato de safetensors) |
| Parametros activos | 6,60 M por token (37,9 %) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16 sin cuantizaciones declaradas) |
| Idiomas soportados | hi y en declarados en la model card; en la practica el entrenamiento solo cubre texto en ingles de tinyshakespeare |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), sin pickle. Tokenizer: ninguno (vocabulario a nivel de byte, 256 bytes + BOS/EOS/PAD = 259) |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo MoE de grano fino. De las 8 capas, la capa 0 es densa y las 7 restantes son MoE con 16 expertos enrutados y seleccion top-2, mas un experto compartido que se aplica siempre. La atencion usa grouped-query attention con 6 cabezas de consulta y 2 de clave-valor, RoPE con theta de 1.000.000 y QK-norm. El router es sigmoide y emplea balanceo de sesgo sin perdida auxiliar (*aux-loss-free bias balancing*) con `bias_update_rate=1e-3`. El vocabulario es a nivel de byte, de modo que el modelo decodifica byte a byte y puede emitir secuencias UTF-8 invalidas intermedias; el `sample.py` del repositorio decodifica con `errors="replace"`.

Los datos de entrenamiento son unicamente tinyshakespeare (1,12 MB, 3 documentos, dominio publico). El run es de 200 pasos con batch 16 y bloque 256, lo que equivale a 0,82 epocas. Se uso optimizador fused AdamW con learning rate 3e-4 y scheduler coseno, y autocast en bf16. La perdida de validacion pasa de 5,6205 en el paso 0 a 1,8515 en el paso 199 (2,671 bits/byte). No se declara ninguna fase de RLHF, DPO ni ajuste por instrucciones. La innovacion tecnica documentada no esta en el modelo en si, sino en la evidencia empirica sobre la curva de desequilibrio de expertos: el balancer necesita aproximadamente 100 pasos para corregir el colapso temprano del router hacia expertos favoritos, de ahi que el desequilibrio alcance un pico de 7,97x antes de estabilizarse en 1,80x.

## Capacidades

- Generacion de texto: si, pero limitada a continuar texto con la forma superficial del corpus de entrenamiento (etiquetas de interlocutor, estructura de dialogo) sin vocabulario real.
- Razonamiento: no disponible; no hay evidencia de capacidad de razonamiento a 200 pasos y 1,12 MB de datos.
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Vision o audio: no soportado.
- Tool calling / function calling: no soportado. No se declara plantilla de chat ni modo de instrucciones.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: los metadatos declaran hindi e ingles, pero el entrenamiento se realizo exclusivamente sobre texto en ingles, por lo que no existe capacidad real en hindi.
- Capacidad especial: ninguna. Es un checkpoint de humo (*smoke test*) para validar la infraestructura del proyecto AnuLM, no un modelo funcional.
- Salida cualitativa declarada: con el prompt `KING RICHARD II:` a temperatura 0,8 y 150 tokens, produce texto con forma de obra teatral y etiquetas de hablante compuestas por pseudopalabras, sin lexico coherente.

## Casos de uso

- Prueba de humo de pipelines de publicacion: el checkpoint existe para verificar de extremo a extremo la cadena de entrenamiento, muestreo, exportacion a safetensors, subida a HuggingFace, descarga, carga y generacion tras un cambio de version. Se usa como artefacto de validacion, no como modelo final.
- Fixture en integracion continua: al pesar unos 35 MB en bfloat16 y entrenarse en 29 segundos, se puede incluir en la bateria de tests de un repositorio para comprobar que `load_checkpoint`, `sample.py` y `serve.py` siguen funcionando tras cada refactor.
- Referencia didactica de balanceo de expertos en MoE: la curva de desequilibrio (4,68x, 7,97x en el paso 20, 1,80x final) permite ilustrar por que un balancer de sesgo necesita decenas de pasos para revertir el colapso temprano del router.
- Validacion de arquitecturas sin tokenizer BPE: sirve para probar implementaciones de vocabulario a nivel de byte, incluyendo el manejo de secuencias UTF-8 invalidas durante la decodificacion con `errors="replace"`.
- Verificacion de presets de configuracion: el preset `nano_30b` documenta la forma completa de un modelo MoE grande (GQA, QK-norm, experto compartido, router sigmoide) en un numero de parametros que cabe en cualquier equipo, lo que permite probar el codigo de construccion del modelo antes de lanzar runs a gran escala.
- Reproduccion de experimentos de juguete: con 3 documentos y 200 pasos, es un banco de pruebas para estudiar sobreajuste, dinamica de learning rate coseno y comportamiento de AdamW fusionado en bf16 a coste casi nulo.
- Demostracion de `serve.py`: el repositorio expone una pagina web en `http://127.0.0.1:8000` limitada a continuar texto, util para comprobar el servicio local sin necesidad de GPU de gama alta.

## Benchmarks y rendimiento

El *model-index* de la model card declara una lista de resultados vacia, por lo que no hay cifras de MMLU, HumanEval, GSM8K ni similares. Los unicos datos de rendimiento publicados son las metricas del propio run de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 0) | 5,6205 |
| Perdida de validacion (paso 199) | 1,8515 |
| Bits por byte | 2,671 |
| Desequilibrio de expertos (inicio) | 4,68x |
| Desequilibrio de expertos (pico, paso 20) | 7,97x |
| Desequilibrio de expertos (final) | 1,80x |
| Throughput de entrenamiento | ~29.000 tokens/s en una RTX 5070 Ti |
| Tiempo de entrenamiento | 29 s (200 pasos, batch 16 x bloque 256) |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no disponibles |

Como referencia interna del proyecto, el mismo preset con 1.000 pasos alcanza una perdida de validacion de 1,5190 y produce texto reconocible como pastiche; no se publican mas cifras.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bfloat16 ocupan aproximadamente 35 MB (17,44 M parametros x 2 bytes), mas el estado de activaciones y cache KV de 256 tokens, despreciable en la practica. Menos de 1 GB en total.
- GPU recomendadas: cualquiera. El autor entreno y ejecuto el modelo en una RTX 5070 Ti; tambien funciona en GPUs de gama de entrada y en Apple Silicon.
- Caber en GPU de consumo: si, en cualquier GPU de consumo con soporte bf16 o, alternativamente, en CPU.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, porque la arquitectura no esta implementada en `transformers` y no se publica version GGUF. El unico camino soportado es clonar el repositorio de AnuLM y usar sus scripts `sample.py` y `serve.py`, o cargar el checkpoint mediante `load_checkpoint` y `AnuLM(ck["cfg"])`.
- Latencia y throughput: no disponible para inferencia. El unico dato publicado es el throughput de entrenamiento de ~29.000 tokens/s sobre una RTX 5070 Ti.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos externos en la informacion proporcionada que permitan una comparacion rigurosa. La unica comparacion documentada es con los otros checkpoints del propio proyecto AnuLM:

| Modelo | Parametros | Funcion declarada | Rendimiento declarado | Licencia |
|---|---|---|---|---|
| AnuLM-Smoke-30B | 17,44 M totales, 6,60 M activos | Prueba de humo del pipeline; no usable | Val loss 1,8515 a 200 pasos; sin benchmarks | MIT |
| AnuLM-Base-400M | 400 M (por nombre) | Modelo base trilingue del que derivan los ajustados | no disponible | no disponible en la informacion proporcionada |
| AnuLM-Coder-400M | 400 M (por nombre) | Escribe funciones Python pequenas | MBPP 12,5 % pass@1 | no disponible en la informacion proporcionada |
| AnuLM-Translate-400M | 400 M (por nombre) | Traduccion ingles ↔ hindi | chrF 41,5 / 43,4 en FLORES-200 | no disponible en la informacion proporcionada |
| AnuLM-Hindi-QA-400M | 400 M (por nombre) | Preguntas y respuestas en hindi, ingles y Python | no disponible | no disponible en la informacion proporcionada |

La model card recomienda usar cualquiera de los cuatro checkpoints de 400 M en lugar de este si se necesita un modelo que haga algo util.

## Limitaciones y advertencias

- No es un modelo de lenguaje usable. El autor lo declara explicitamente: se entreno 200 pasos sobre 1,12 MB de texto para probar infraestructura.
- El nombre induce a error: "30B" hace referencia al preset de arquitectura (`nano_30b`), no al numero de parametros, que es de 17,44 M totales y 6,60 M activos por token.
- El texto generado es incoherente. Produce pseudopalabras con la forma superficial de tinyshakespeare; no debe interpretarse como una capacidad linguistica incipiente.
- Riesgo de alucinacion: irrelevante en la practica porque el modelo no genera afirmaciones factuales, solo secuencias de bytes con forma de dialogo. No debe usarse para producir contenido que se vaya a leer como informacion.
- Sesgos: no se documenta ningun analisis de sesgos. El corpus (tinyshakespeare) es literatura teatral inglesa de dominio publico, con la representacion social propia de ese material.
- Limitaciones de idioma: aunque los metadatos declaran hindi e ingles, el entrenamiento solo contiene ingles. No hay capacidad real en hindi ni en ningun otro idioma.
- Limitacion de contexto: 256 tokens. No admite conversaciones multi-turno ni documentos largos.
- Tokenizer ausente: al ser un modelo a nivel de byte no hay fichero de tokenizer, y la decodificacion intermedia puede producir UTF-8 invalido; es obligatorio usar `errors="replace"`.
- Compatibilidad: la arquitectura no esta en `transformers`, por lo que no se puede cargar con `AutoModelForCausalLM` ni servir con las herramientas habituales (vLLM, TGI, Ollama, llama.cpp).
- Restricciones de licencia: licencia MIT, sin restricciones para uso comercial, ya que tinyshakespeare es de dominio publico. El proyecto declara no estar afiliado a Sarvam AI, AI4Bharat, BharatGen ni al Gobierno de India, y no redistribuye pesos de Sarvam.
- Caveat de produccion: no desplegar este checkpoint en ningun entorno de produccion ni presentarlo como modelo de 30.000 millones de parametros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toonist/AnuLM-Smoke-30B
- Repositorio del proyecto AnuLM: https://github.com/MOBIRIZER-TECHNOLOGY/AnuLM
- Checkpoint AnuLM-Base-400M: https://huggingface.co/toonist/AnuLM-Base-400M
- Checkpoint AnuLM-Coder-400M: https://huggingface.co/toonist/AnuLM-Coder-400M
- Checkpoint AnuLM-Translate-400M: https://huggingface.co/toonist/AnuLM-Translate-400M
- Checkpoint AnuLM-Hindi-QA-400M: https://huggingface.co/toonist/AnuLM-Hindi-QA-400M
- Documentacion interna citada por el autor: `README.md`, `docs/RESULTS.md` (seccion 5), `docs/PUBLISHING.md` y `TASKS.md` dentro del repositorio.
- Resultados de busqueda web: las busquedas realizadas no devolvieron ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a una serie de television alemana y se han descartado por no ser pertinentes.
